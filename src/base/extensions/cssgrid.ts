import LAYOUT_CSSGRID = squared.lib.internal.LAYOUT_CSSGRID;

import { BOX_STANDARD } from '../lib/constant';

import type NodeUI from '../node-ui';

import ExtensionUI from '../extension-ui';

type RowData = Undef<NodeUI[]>[][];

interface GridAlignment extends StringMap {
    alignItems: string;
    alignContent: string;
    justifyItems: string;
    justifyContent: string;
    gridAutoFlow: string;
}

interface GridLayout {
    placement: number[];
    rowSpan: number;
    columnSpan: number;
    outerCoord: number;
}

interface RepeatItem {
    name?: string;
    unit?: string;
    unitMin?: string;
}

const { formatPercent, formatPX, isLength, isPercent } = squared.lib.css;
const { convertPercent, isNumber, splitPairEnd, trimString, withinRange } = squared.lib.util;

const PATTERN_UNIT = '[\\d.]+[a-z%]+|auto|max-content|min-content';
const PATTERN_MINMAX = 'minmax\\(\\s*([^,]+),\\s*([^)]+)\\s*\\)';
const PATTERN_FIT_CONTENT = 'fit-content\\(\\s*([\\d.]+[a-z%]+)\\s*\\)';
const PATTERN_NAMED = '\\[([\\w\\s\\-]+)\\]';
const REGEXP_UNIT = new RegExp(`^${PATTERN_UNIT}$`);
const REGEXP_NAMED = new RegExp(`\\s*(repeat\\(\\s*(auto-fit|auto-fill|\\d+),\\s*(.+)\\)|${PATTERN_NAMED}|${PATTERN_MINMAX}|${PATTERN_FIT_CONTENT}|${PATTERN_UNIT}\\s*)`, 'g');
const REGEXP_REPEAT = new RegExp(`\\s*(${PATTERN_NAMED}|${PATTERN_MINMAX}|${PATTERN_FIT_CONTENT}|${PATTERN_UNIT})`, 'g');
const REGEXP_CELL_UNIT = new RegExp(PATTERN_UNIT);
const REGEXP_CELL_MINMAX = new RegExp(PATTERN_MINMAX);
const REGEXP_CELL_FIT_CONTENT = new RegExp(PATTERN_FIT_CONTENT);
const REGEXP_CELL_NAMED = new RegExp(PATTERN_NAMED);

function repeatUnit(data: CssGridDirectionData, sizes: string[]) {
    const repeat = data.repeat;
    const unitPX: string[] = [];
    const unitRepeat: string[] = [];
    for (let i = 0, length = sizes.length; i < length; ++i) {
        if (repeat[i]) {
            unitRepeat.push(sizes[i]);
        }
        else {
            unitPX.push(sizes[i]);
        }
    }
    const length = data.length;
    const result: string[] = new Array(length);
    for (let i = 0, q = length - unitPX.length; i < length; ++i) {
        if (repeat[i]) {
            for (let j = 0, k = 0; j < q; ++i, ++j, ++k) {
                if (k === unitRepeat.length) {
                    k = 0;
                }
                result[i] = unitRepeat[k];
            }
            --i;
        }
        else {
            result[i] = unitPX.shift()!;
        }
    }
    return result;
}

function setAutoFill(data: CssGridDirectionData, dimension: number) {
    const unit = data.unit;
    if (unit.length === 1 && (data.flags & LAYOUT_CSSGRID.AUTO_FIT || data.flags & LAYOUT_CSSGRID.AUTO_FILL)) {
        const unitMin = data.unitMin;
        let sizeMin = 0;
        for (const value of [unit[0], unitMin[0]]) {
            if (isPercent(value)) {
                sizeMin = Math.max(convertPercent(value) * dimension, sizeMin);
            }
            else if (value.endsWith('px')) {
                sizeMin = Math.max(parseFloat(value), sizeMin);
            }
        }
        if (sizeMin) {
            data.length = Math.floor(dimension / (sizeMin + data.gap));
            data.unit = repeatUnit(data, unit);
            data.unitMin = repeatUnit(data, unitMin);
            return true;
        }
    }
    return false;
}

function setFlexibleDimension(dimension: number, gap: number, count: number, unit: string[], max: number[]) {
    let filled = 0,
        fractional = 0,
        percent = 1;
    const length = unit.length;
    for (let i = 0; i < length; ++i) {
        const value = unit[i];
        if (value.endsWith('px')) {
            filled += parseFloat(value);
        }
        else if (value.endsWith('fr')) {
            fractional += parseFloat(value);
        }
        else if (isPercent(value)) {
            percent -= convertPercent(value);
        }
    }
    if (percent < 1 && fractional) {
        const ratio = (dimension * percent - (count - 1) * gap - max.reduce((a, b) => a + Math.max(0, b), 0) - filled) / fractional;
        if (ratio > 0) {
            for (let i = 0; i < length; ++i) {
                const value = unit[i];
                if (value.endsWith('fr')) {
                    unit[i] = formatPX(parseFloat(value) * ratio);
                }
            }
        }
    }
}

function fillUnitEqually(unit: string[], length: number) {
    if (unit.length === 0) {
        for (let i = 0; i < length; ++i) {
            unit.push('1fr');
        }
    }
}

function getOpenCellIndex(iteration: number, length: number, available: Undef<number[]>) {
    if (available) {
        for (let i = 0, j = -1, k = 0; i < iteration; ++i) {
            if (!available[i]) {
                if (j === -1) {
                    j = i;
                }
                if (++k === length) {
                    return j;
                }
            }
            else {
                j = -1;
            }
        }
        return -1;
    }
    return 0;
}

function getOpenRowIndex(cells: number[][]) {
    for (let i = 0, length = cells.length; i < length; ++i) {
        for (const value of cells[i]) {
            if (value === 0) {
                return i;
            }
        }
    }
    return Math.max(0, length - 1);
}

function createDataAttribute(node: NodeUI): CssGridData<NodeUI> {
    const data = node.cssAsObject('alignItems', 'alignContent', 'justifyItems', 'justifyContent', 'gridAutoFlow') as GridAlignment;
    return {
        ...data,
        children: [],
        rowData: [],
        rowSpanMultiple: [],
        rowDirection: !data.gridAutoFlow.includes('column'),
        dense: data.gridAutoFlow.includes('dense'),
        templateAreas: {},
        row: CssGrid.createDataRowAttribute(node.parseHeight(node.valueOf('rowGap'), false)),
        column: CssGrid.createDataRowAttribute(node.parseWidth(node.valueOf('columnGap'), false)),
        emptyRows: [],
        minCellHeight: 0
    };
}

function applyLayout(node: NodeUI, data: CssGridDirectionData, dataCount: number, horizontal: boolean) {
    let unit = data.unit;
    if (unit.length < dataCount) {
        if (data.flags & LAYOUT_CSSGRID.AUTO_FIT || data.flags & LAYOUT_CSSGRID.AUTO_FILL) {
            if (unit.length === 0) {
                unit.push('auto');
                data.unitMin.push('');
                data.repeat.push(true);
            }
            unit = repeatUnit(data, unit);
            data.unit = unit;
            data.unitMin = repeatUnit(data, data.unitMin);
        }
        else {
            const auto = data.auto;
            const q = auto.length;
            if (q) {
                for (let i = 0; unit.length < dataCount; ++i) {
                    if (i === q) {
                        i = 0;
                    }
                    unit.push(auto[i]);
                }
            }
        }
    }
    else if (data.flags & LAYOUT_CSSGRID.AUTO_FIT || data.flags & LAYOUT_CSSGRID.AUTO_FILL && (horizontal && node.blockStatic && !node.hasWidth && !node.hasPX('maxWidth', { percent: false }) || !horizontal && !node.hasHeight)) {
        unit.length = dataCount;
    }
    let percent = 1,
        fr = 0,
        auto = 0;
    const length = unit.length;
    for (let i = 0; i < length; ++i) {
        const value = unit[i];
        if (isPercent(value)) {
            percent -= convertPercent(value);
        }
        else if (value.endsWith('fr')) {
            fr += parseFloat(value);
        }
        else if (value === 'auto') {
            ++auto;
        }
    }
    if (percent < 1 || fr > 0) {
        data.flags |= LAYOUT_CSSGRID.FLEXIBLE;
    }
    if (percent < 1) {
        if (fr) {
            for (let i = 0; i < length; ++i) {
                const value = unit[i];
                if (value.endsWith('fr')) {
                    unit[i] = percent * (parseFloat(value) / fr) + 'fr';
                }
            }
        }
        else if (auto === 1) {
            const j = unit.findIndex(value => value === 'auto');
            if (j !== -1) {
                unit[j] = formatPercent(percent);
            }
        }
    }
}

const convertLength = (node: NodeUI, value: string, index: number) => isLength(value) ? formatPX(node.parseUnit(value, { dimension: index !== 0 ? 'width' : 'height' })) : value;

export default abstract class CssGrid<T extends NodeUI> extends ExtensionUI<T> {
    public static isAligned(node: NodeUI) {
        return node.hasHeight && /^space-|center|flex-end|end/.test(node.valueOf('alignContent'));
    }

    public static isJustified(node: NodeUI) {
        return (node.blockStatic || node.hasWidth) && /^space-|center|flex-end|end|right/.test(node.valueOf('justifyContent'));
    }

    public static createDataRowAttribute(gap = 0): CssGridDirectionData {
        return {
            length: 0,
            gap,
            unit: [],
            unitMin: [],
            unitTotal: [],
            repeat: [],
            auto: [],
            name: {},
            frTotal: 0,
            flags: 0
        };
    }

    public is(node: T) {
        return node.gridElement;
    }

    public condition(node: T) {
        return !node.isEmpty();
    }

    public processNode(node: T) {
        const data = this.data;
        const mainData = createDataAttribute(node);
        const { column, dense, row, rowDirection: horizontal } = mainData;
        const rowData: Undef<T[]>[][] = [];
        const openCells: number[][] = [];
        const layout: GridLayout[] = [];
        const gridTemplates = [node.valueOf('gridTemplateRows'), node.valueOf('gridTemplateColumns'), node.css('gridAutoRows'), node.css('gridAutoColumns')];
        let autoWidth: Undef<boolean>,
            autoHeight: Undef<boolean>,
            rowA: number,
            colA: number,
            rowB: number,
            colB: number,
            ITERATION: number,
            ROW_SPAN: number,
            COLUMN_SPAN: number;
        if (horizontal) {
            rowA = 0;
            colA = 1;
            rowB = 2;
            colB = 3;
        }
        else {
            rowA = 1;
            colA = 0;
            rowB = 3;
            colB = 2;
        }
        const setDataRows = (item: T, placement: number[]) => {
            if (placement.every(value => value > 0)) {
                for (let i = placement[rowA] - 1; i < placement[rowB] - 1; ++i) {
                    const itemData = rowData[i] ||= [];
                    let cell = openCells[i],
                        j = placement[colA] - 1;
                    if (!cell) {
                        cell = new Array(ITERATION).fill(0);
                        if (!dense) {
                            for (let k = 0; k < j; ++k) {
                                cell[k] = 1;
                            }
                        }
                        openCells[i] = cell;
                    }
                    while (j < placement[colB] - 1) {
                        (itemData[j] ||= []).push(item);
                        cell[j++] = 1;
                    }
                }
                return true;
            }
            return false;
        };
        for (let index = 0; index < 4; ++index) {
            const value = gridTemplates[index];
            if (value && value !== 'none' && value !== 'auto') {
                const direction = index === 0 ? row : column;
                const { name, repeat, unit, unitMin } = direction;
                let i = 1,
                    match: Null<RegExpMatchArray>;
                while (match = REGEXP_NAMED.exec(value)) {
                    const command = match[1].trim();
                    switch (index) {
                        case 0:
                        case 1:
                            if (command[0] === '[') {
                                for (const attr of match[4].split(/\s+/)) {
                                    (name[attr] ||= []).push(i);
                                }
                            }
                            else if (command.startsWith('repeat')) {
                                let iterations = 1;
                                switch (match[2]) {
                                    case 'auto-fit':
                                        direction.flags |= LAYOUT_CSSGRID.AUTO_FIT;
                                        break;
                                    case 'auto-fill':
                                        direction.flags |= LAYOUT_CSSGRID.AUTO_FILL;
                                        break;
                                    default:
                                        iterations = +match[2] || 1;
                                        break;
                                }
                                if (iterations) {
                                    const repeating: RepeatItem[] = [];
                                    let subMatch: Null<RegExpMatchArray>,
                                        namedMatch: Null<RegExpMatchArray>;
                                    while (subMatch = REGEXP_REPEAT.exec(match[3])) {
                                        if (namedMatch = REGEXP_CELL_NAMED.exec(subMatch[1])) {
                                            const subName = namedMatch[1];
                                            if (!name[subName]) {
                                                name[subName] = [];
                                            }
                                            repeating.push({ name: subName });
                                        }
                                        else if (namedMatch = REGEXP_CELL_MINMAX.exec(subMatch[1])) {
                                            repeating.push({ unit: convertLength(node, namedMatch[2], index), unitMin: convertLength(node, namedMatch[1], index) });
                                        }
                                        else if (namedMatch = REGEXP_CELL_FIT_CONTENT.exec(subMatch[1])) {
                                            repeating.push({ unit: convertLength(node, namedMatch[1], index), unitMin: '0px' });
                                        }
                                        else if (namedMatch = REGEXP_CELL_UNIT.exec(subMatch[1])) {
                                            repeating.push({ unit: convertLength(node, namedMatch[0], index) });
                                        }
                                    }
                                    const q = repeating.length;
                                    if (q) {
                                        for (let j = 0; j < iterations; ++j) {
                                            for (let k = 0; k < q; ++k) {
                                                const item = repeating[k];
                                                if (item.name) {
                                                    name[item.name].push(i);
                                                }
                                                else if (item.unit) {
                                                    unit.push(item.unit);
                                                    unitMin.push(item.unitMin || '');
                                                    repeat.push(true);
                                                    ++i;
                                                }
                                            }
                                        }
                                    }
                                    REGEXP_REPEAT.lastIndex = 0;
                                }
                            }
                            else if (command.startsWith('minmax')) {
                                unit.push(convertLength(node, match[6], index));
                                unitMin.push(convertLength(node, match[5], index));
                                repeat.push(false);
                                ++i;
                            }
                            else if (command.startsWith('fit-content')) {
                                unit.push(convertLength(node, match[7], index));
                                unitMin.push('0px');
                                repeat.push(false);
                                ++i;
                            }
                            else if (REGEXP_UNIT.test(command)) {
                                unit.push(convertLength(node, command, index));
                                unitMin.push('');
                                repeat.push(false);
                                ++i;
                            }
                            break;
                        case 2:
                        case 3:
                            (index === 2 ? row : column).auto.push(isLength(command) ? formatPX(node.parseUnit(command, { dimension: index !== 2 ? 'width' : 'height' })) : command);
                            break;
                    }
                }
                REGEXP_NAMED.lastIndex = 0;
            }
        }
        if (horizontal) {
            node.children.sort((a, b) => {
                const linearA = a.linear;
                const linearB = b.linear;
                if (!withinRange(linearA.top, linearB.top)) {
                    return linearA.top - linearB.top;
                }
                else if (!withinRange(linearA.left, linearB.left)) {
                    return linearA.left - linearB.left;
                }
                return 0;
            });
        }
        else {
            node.children.sort((a, b) => {
                const linearA = a.linear;
                const linearB = b.linear;
                if (!withinRange(linearA.left, linearB.left)) {
                    return linearA.left - linearB.left;
                }
                else if (!withinRange(linearA.top, linearB.top)) {
                    return linearA.top - linearB.top;
                }
                return 0;
            });
        }
        if (!node.has('gridTemplateAreas') && node.every(item => item.css('gridRowStart') === 'auto' && item.css('gridColumnStart') === 'auto')) {
            let rowIndex = 0,
                columnIndex = 0,
                columnMax = 0,
                previous: Undef<T>,
                directionA: string,
                directionB: string,
                indexA: number,
                indexB: number,
                indexC: number;
            if (horizontal) {
                directionA = 'top';
                directionB = 'bottom';
                indexA = 2;
                indexB = 1;
                indexC = 3;
            }
            else {
                directionA = 'left';
                directionB = 'right';
                indexA = 3;
                indexB = 0;
                indexC = 2;
            }
            if (horizontal) {
                if (column.flags & LAYOUT_CSSGRID.AUTO_FILL) {
                    autoWidth = setAutoFill(column, node.actualWidth);
                }
            }
            else if (row.flags & LAYOUT_CSSGRID.AUTO_FILL) {
                autoHeight = setAutoFill(row, node.actualHeight);
            }
            node.each((item: T, index) => {
                if (!previous || item.linear[directionA] >= previous.linear[directionB] || columnIndex && columnIndex === columnMax) {
                    columnMax = Math.max(columnIndex, columnMax);
                    ++rowIndex;
                    columnIndex = 1;
                }
                const [gridRowEnd, gridColumnEnd] = item.cssAsTuple('gridRowEnd', 'gridColumnEnd');
                let rowSpan = 1,
                    columnSpan = 1;
                if (gridRowEnd.startsWith('span')) {
                    rowSpan = +splitPairEnd(gridRowEnd, ' ');
                }
                else if (isNumber(gridRowEnd)) {
                    rowSpan = +gridRowEnd - rowIndex;
                }
                if (gridColumnEnd.startsWith('span')) {
                    columnSpan = +splitPairEnd(gridColumnEnd, ' ');
                }
                else if (isNumber(gridColumnEnd)) {
                    columnSpan = +gridColumnEnd - columnIndex;
                }
                if (columnIndex === 1 && columnMax) {
                    found: {
                        do {
                            const available: number[] = new Array(columnMax - 1).fill(1);
                            for (const cell of layout) {
                                const placement = cell.placement;
                                if (placement[indexA] > rowIndex) {
                                    for (let i = placement[indexB]; i < placement[indexC]; ++i) {
                                        available[i - 1] = 0;
                                    }
                                }
                            }
                            for (let i = 0, j = 0, k = 0, length = available.length; i < length; ++i) {
                                if (available[i]) {
                                    if (j === 0) {
                                        k = i;
                                    }
                                    if (++j === columnSpan) {
                                        columnIndex = k + 1;
                                        break found;
                                    }
                                }
                                else {
                                    j = 0;
                                }
                            }
                            mainData.emptyRows[rowIndex - 1] = available;
                        }
                        while (++rowIndex);
                    }
                }
                if (horizontal) {
                    layout[index] = {
                        outerCoord: item.linear.top,
                        placement: [rowIndex, columnIndex, rowIndex + rowSpan, columnIndex + columnSpan],
                        rowSpan,
                        columnSpan
                    };
                }
                else {
                    layout[index] = {
                        outerCoord: item.linear.left,
                        placement: [columnIndex, rowIndex, columnIndex + columnSpan, rowIndex + rowSpan],
                        rowSpan,
                        columnSpan
                    };
                }
                columnIndex += columnSpan;
                previous = item;
            });
        }
        else {
            const templateAreas = mainData.templateAreas;
            let previousPlacement: Undef<number[]>;
            autoWidth = setAutoFill(column, node.actualWidth);
            autoHeight = setAutoFill(row, node.actualHeight);
            node.css('gridTemplateAreas').split(/"\s+"/).forEach((template, rowStart) => {
                if (template !== 'none') {
                    trimString(template.trim(), '"').split(/\s+/).forEach((area, columnStart) => {
                        if (area[0] !== '.') {
                            const templateArea = templateAreas[area];
                            if (templateArea) {
                                templateArea.rowSpan = (rowStart - templateArea.rowStart) + 1;
                                templateArea.columnSpan = (columnStart - templateArea.columnStart) + 1;
                            }
                            else {
                                templateAreas[area] = {
                                    rowStart,
                                    rowSpan: 1,
                                    columnStart,
                                    columnSpan: 1
                                };
                            }
                        }
                    });
                }
            });
            node.each((item, index) => {
                const positions = item.cssAsTuple('gridRowStart', 'gridColumnStart', 'gridRowEnd', 'gridColumnEnd');
                const placement = [0, 0, 0, 0];
                let rowSpan = -1,
                    columnSpan = -1;
                if (Object.keys(templateAreas).length) {
                    for (let i = 0; i < 4; ++i) {
                        const name = positions[i];
                        let template = templateAreas[name];
                        if (template) {
                            switch (i) {
                                case 0:
                                    placement[0] = template.rowStart + 1;
                                    break;
                                case 1:
                                    placement[1] = template.columnStart + 1;
                                    break;
                                case 2:
                                    placement[2] = template.rowStart + template.rowSpan + 1;
                                    break;
                                case 3:
                                    placement[3] = template.columnStart + template.columnSpan + 1;
                                    break;
                            }
                        }
                        else {
                            const match = /^([\w-]+)-(start|end)$/.exec(name);
                            if (match) {
                                template = templateAreas[match[1]];
                                if (template) {
                                    if (match[2] === 'start') {
                                        switch (i) {
                                            case 0:
                                            case 2:
                                                placement[i] = template.rowStart + 1;
                                                break;
                                            case 1:
                                            case 3:
                                                placement[i] = template.columnStart + 1;
                                                break;
                                        }
                                    }
                                    else {
                                        switch (i) {
                                            case 0:
                                            case 2:
                                                placement[i] = template.rowStart + template.rowSpan + 1;
                                                break;
                                            case 1:
                                            case 3:
                                                placement[i] = template.columnStart + template.columnSpan + 1;
                                                break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if (!placement[0] || !placement[1] || !placement[2] || !placement[3]) {
                    const setPlacement = (value: string, position: number, vertical: boolean, length: number) => {
                        if (isNumber(value)) {
                            const cellIndex = +value;
                            if (cellIndex > 0) {
                                placement[position] = cellIndex;
                                return true;
                            }
                            else if (cellIndex < 0 && position >= 2) {
                                const positionA = position - 2;
                                placement[placement[positionA] ? position : positionA] = cellIndex + length + 2;
                                return true;
                            }
                        }
                        else if (value.startsWith('span')) {
                            const span = +splitPairEnd(value, ' ');
                            if (span === length && previousPlacement) {
                                if (horizontal) {
                                    if (!vertical) {
                                        const end = previousPlacement[2];
                                        if (end && !placement[0]) {
                                            placement[0] = end;
                                        }
                                    }
                                }
                                else if (vertical) {
                                    const end = previousPlacement[3];
                                    if (end && !placement[1]) {
                                        placement[1] = end;
                                    }
                                }
                            }
                            const start = placement[position - 2];
                            switch (position) {
                                case 0: {
                                    const rowIndex = positions[2];
                                    if (isNumber(rowIndex)) {
                                        const pos = +rowIndex;
                                        placement[0] = pos - span;
                                        placement[2] = pos;
                                    }
                                    break;
                                }
                                case 1: {
                                    const colIndex = positions[3];
                                    if (isNumber(colIndex)) {
                                        const pos = +colIndex;
                                        placement[1] = pos - span;
                                        placement[3] = pos;
                                    }
                                    break;
                                }
                                case 2:
                                case 3:
                                    if (start) {
                                        placement[position] = start + span;
                                    }
                                    break;
                            }
                            if (vertical) {
                                if (rowSpan === -1) {
                                    rowSpan = span;
                                }
                            }
                            else if (columnSpan === -1) {
                                columnSpan = span;
                            }
                            return true;
                        }
                        return false;
                    };
                    let rowStart: Undef<string[]>,
                        colStart: Undef<string[]>;
                    for (let i = 0; i < 4; ++i) {
                        const value = positions[i];
                        if (value !== 'auto' && !placement[i]) {
                            const vertical = i % 2 === 0;
                            const direction = vertical ? row : column;
                            if (!setPlacement(value, i, vertical, Math.max(1, direction.unit.length))) {
                                const alias = value.split(' ');
                                if (alias.length === 1) {
                                    alias[1] = alias[0];
                                    alias[0] = '1';
                                }
                                else if (isNumber(alias[0])) {
                                    if (vertical) {
                                        if (rowStart) {
                                            rowSpan = +alias[0] - +rowStart[0];
                                        }
                                        else {
                                            rowStart = alias;
                                        }
                                    }
                                    else if (colStart) {
                                        columnSpan = +alias[0] - +colStart[0];
                                    }
                                    else {
                                        colStart = alias;
                                    }
                                }
                                const named = direction.name[alias[1]];
                                if (named) {
                                    const nameIndex = +alias[0];
                                    if (nameIndex <= named.length) {
                                        placement[i] = named[nameIndex - 1] + (alias[1] === positions[i - 2] ? 1 : 0);
                                    }
                                }
                            }
                        }
                    }
                }
                if (!previousPlacement) {
                    if (!placement[0]) {
                        placement[0] = 1;
                    }
                    if (!placement[1]) {
                        placement[1] = 1;
                    }
                }
                const [a, b, c, d] = placement;
                if (rowSpan === -1) {
                    rowSpan = a && c ? c - a : 1;
                }
                else if (a && c === 0) {
                    placement[2] = a + rowSpan;
                }
                if (columnSpan === -1) {
                    columnSpan = b && d ? d - b : 1;
                }
                else if (b && d === 0) {
                    placement[3] = a + columnSpan;
                }
                if (!placement[2] && placement[0]) {
                    placement[2] = placement[0] + rowSpan;
                }
                if (!placement[3] && placement[1]) {
                    placement[3] = placement[1] + columnSpan;
                }
                layout[index] = {
                    outerCoord: horizontal ? item.bounds.top : item.bounds.left,
                    placement,
                    rowSpan,
                    columnSpan
                } as GridLayout;
                previousPlacement = placement;
            });
        }
        {
            let totalCount = 1,
                outerCount = 0,
                totalSpan: number,
                start: number,
                end: number;
            for (let i = 0, length = layout.length; i < length; ++i) {
                const item = layout[i];
                if (item) {
                    if (horizontal) {
                        totalSpan = item.columnSpan;
                        start = 1;
                        end = 3;
                    }
                    else {
                        totalSpan = item.rowSpan;
                        start = 0;
                        end = 2;
                    }
                    const placement = item.placement;
                    if (placement.some(value => value > 0)) {
                        totalCount = Math.max(totalCount, totalSpan, placement[start], placement[end] - 1);
                    }
                    if (withinRange(item.outerCoord, horizontal ? node.box.top : node.box.left)) {
                        outerCount += totalSpan;
                    }
                }
            }
            ITERATION = Math.max(totalCount, outerCount, horizontal && !autoWidth ? column.unit.length : 0, !horizontal && !autoHeight ? row.unit.length : 0);
        }
        node.each((item: T, index) => {
            const { placement, rowSpan, columnSpan } = layout[index];
            if (horizontal) {
                ROW_SPAN = rowSpan;
                COLUMN_SPAN = columnSpan;
            }
            else {
                ROW_SPAN = columnSpan;
                COLUMN_SPAN = rowSpan;
            }
            while (!placement[0] || !placement[1]) {
                const PLACEMENT = placement.slice(0);
                if (!PLACEMENT[rowA]) {
                    for (let i = dense ? 0 : getOpenRowIndex(openCells), j = 0, k = -1, length = rowData.length; i < length; ++i) {
                        const l = getOpenCellIndex(ITERATION, COLUMN_SPAN, openCells[i]);
                        if (l !== -1) {
                            if (j === 0) {
                                k = i;
                                length = Math.max(length, i + ROW_SPAN);
                            }
                            if (++j === ROW_SPAN) {
                                PLACEMENT[rowA] = k + 1;
                                break;
                            }
                        }
                        else {
                            j = 0;
                            k = -1;
                            length = rowData.length;
                        }
                    }
                }
                if (!PLACEMENT[rowA]) {
                    placement[rowA] = rowData.length + 1;
                    if (!placement[colA]) {
                        placement[colA] = 1;
                    }
                }
                else if (!PLACEMENT[colA]) {
                    if (!PLACEMENT[rowB]) {
                        PLACEMENT[rowB] = PLACEMENT[rowA] + ROW_SPAN;
                    }
                    const available: [number, number][][] = [];
                    const l = PLACEMENT[rowA] - 1;
                    const m = PLACEMENT[rowB] - 1;
                    for (let i = l; i < m; ++i) {
                        const itemData = rowData[i];
                        if (!itemData) {
                            available.push([[0, -1]] as [number, number][]);
                        }
                        else if (itemData.reduce((a, b) => a + (b ? 1 : 0), 0) + COLUMN_SPAN <= ITERATION) {
                            const range: [number, number][] = [];
                            let span = 0;
                            for (let j = 0, k = -1; j < ITERATION; ++j) {
                                const rowItem = itemData[j];
                                if (!rowItem) {
                                    if (k === -1) {
                                        k = j;
                                    }
                                    ++span;
                                }
                                if (rowItem || j === ITERATION - 1) {
                                    if (span >= COLUMN_SPAN) {
                                        range.push([k, k + span]);
                                    }
                                    k = -1;
                                    span = 0;
                                }
                            }
                            if (range.length) {
                                available.push(range);
                            }
                            else {
                                break;
                            }
                        }
                        else {
                            break;
                        }
                    }
                    const length = available.length;
                    if (length) {
                        const itemData = available[0];
                        if (itemData[0][1] === -1) {
                            PLACEMENT[colA] = 1;
                        }
                        else if (length === m - l) {
                            if (length > 1) {
                                found: {
                                    for (let i = 0, q = itemData.length; i < q; ++i) {
                                        const outside = itemData[i];
                                        for (let j = outside[0]; j < outside[1]; ++j) {
                                            for (let k = 1; k < length; ++k) {
                                                const avail = available[k];
                                                for (let n = 0, r = avail.length; n < r; ++n) {
                                                    const [insideA, insideB] = avail[n];
                                                    if (j >= insideA && (insideB === -1 || j + COLUMN_SPAN <= insideB)) {
                                                        PLACEMENT[colA] = j + 1;
                                                        break found;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            else {
                                PLACEMENT[colA] = itemData[0][0] + 1;
                            }
                        }
                    }
                }
                const indexA = PLACEMENT[rowA];
                if (indexA) {
                    if (PLACEMENT[colA]) {
                        placement[rowA] = indexA;
                        placement[colA] = PLACEMENT[colA];
                    }
                }
            }
            if (!placement[rowB]) {
                placement[rowB] = placement[rowA] + ROW_SPAN;
            }
            if (!placement[colB]) {
                placement[colB] = placement[colA] + COLUMN_SPAN;
            }
            if (setDataRows(item, placement)) {
                const [a, b, c, d] = placement;
                const rowStart = a - 1;
                const rowCount = c - a;
                const columnStart = b - 1;
                if (!dense) {
                    const cellIndex = horizontal ? rowStart : columnStart;
                    if (cellIndex) {
                        const cells = openCells[cellIndex - 1];
                        for (let i = 0; i < ITERATION; ++i) {
                            cells[i] = 1;
                        }
                    }
                }
                if (rowCount > 1) {
                    const rowSpanMultiple = mainData.rowSpanMultiple;
                    for (let i = rowStart, length = rowStart + rowCount; i < length; ++i) {
                        rowSpanMultiple[i] = true;
                    }
                }
                data.set(item, {
                    rowStart,
                    rowSpan: rowCount,
                    columnStart,
                    columnSpan: d - b
                });
            }
        });
        let columnCount = rowData.length;
        if (columnCount) {
            let rowMain: RowData;
            if (horizontal) {
                rowMain = rowData;
                mainData.rowData = rowData;
                columnCount = Math.max(column.unit.length, ...rowData.map(item => item.length));
            }
            else {
                rowMain = mainData.rowData;
                for (let i = 0; i < columnCount; ++i) {
                    const itemData = rowData[i];
                    for (let j = 0, length = itemData.length; j < length; ++j) {
                        (rowMain[j] ||= [])[i] = itemData[j];
                    }
                }
            }
            const unitTotal = horizontal ? row.unitTotal : column.unitTotal;
            const children = mainData.children;
            for (let i = 0, length = rowMain.length; i < length; ++i) {
                const itemData = rowMain[i];
                for (let j = 0, q = itemData.length; j < q; ++j) {
                    const columnItem = itemData[j];
                    let count = unitTotal[j] || 0;
                    if (columnItem) {
                        let maxDimension = 0;
                        for (let k = 0, r = columnItem.length; k < r; ++k) {
                            const item = columnItem[k];
                            if (!children.includes(item)) {
                                maxDimension = Math.max(maxDimension, horizontal ? item.bounds.height : item.bounds.width);
                                children.push(item);
                            }
                        }
                        count += maxDimension;
                    }
                    unitTotal[j] = count;
                }
            }
            if (children.length === node.size()) {
                const { gap: rowGap, unit: rowUnit } = row;
                const columnGap = column.gap;
                const rowCount = Math.max(rowUnit.length, rowMain.length);
                const rowMax: number[] = new Array(rowCount).fill(0);
                const columnMax: number[] = new Array(columnCount).fill(0);
                const modified = new WeakSet<T>();
                let minCellHeight = 0;
                row.length = rowCount;
                column.length = columnCount;
                for (let i = 0; i < rowCount; ++i) {
                    const rowItem = rowMain[i];
                    const unitHeight = rowUnit[i];
                    if (rowItem) {
                        for (let j = 0; j < columnCount; ++j) {
                            const columnItem = rowItem[j];
                            if (columnItem) {
                                for (let k = 0, length = columnItem.length; k < length; ++k) {
                                    const item = columnItem[k] as T;
                                    if (!modified.has(item)) {
                                        const { columnSpan, rowSpan } = data.get(item) as CssGridCellData;
                                        const x = j + columnSpan - 1;
                                        const y = i + rowSpan - 1;
                                        if (columnGap && x < columnCount - 1) {
                                            item.modifyBox(BOX_STANDARD.MARGIN_RIGHT, columnGap);
                                        }
                                        if (rowGap && y < rowCount - 1) {
                                            item.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, rowGap);
                                        }
                                        if (rowSpan === 1) {
                                            const boundsHeight = item.bounds.height;
                                            const columnHeight = rowMax[i];
                                            if (item.hasHeight) {
                                                if (columnHeight < 0) {
                                                    if (boundsHeight > Math.abs(columnHeight)) {
                                                        rowMax[i] = boundsHeight;
                                                    }
                                                }
                                                else {
                                                    rowMax[i] = Math.max(boundsHeight, columnHeight);
                                                }
                                            }
                                            else if (boundsHeight > Math.abs(columnHeight)) {
                                                rowMax[i] = boundsHeight * -1;
                                            }
                                            minCellHeight = Math.max(boundsHeight, minCellHeight);
                                        }
                                        if (columnSpan === 1) {
                                            const boundsWidth = item.bounds.width;
                                            const columnWidth = columnMax[j];
                                            if (item.hasWidth) {
                                                if (columnWidth < 0) {
                                                    if (boundsWidth > Math.abs(columnWidth)) {
                                                        columnMax[j] = boundsWidth;
                                                    }
                                                }
                                                else {
                                                    columnMax[j] = Math.max(boundsWidth, columnWidth);
                                                }
                                            }
                                            else if (boundsWidth > Math.abs(columnWidth)) {
                                                columnMax[j] = boundsWidth * -1;
                                            }
                                        }
                                        modified.add(item);
                                    }
                                }
                            }
                            else if (!horizontal) {
                                mainData.emptyRows[j] = [Infinity];
                            }
                        }
                    }
                    else {
                        if (isNumber(unitHeight)) {
                            rowMax[i] = +unitHeight;
                        }
                        if (horizontal) {
                            mainData.emptyRows[i] = [Infinity];
                        }
                    }
                }
                mainData.minCellHeight = minCellHeight;
                if (horizontal) {
                    if (node.hasPX('width', { percent: false })) {
                        column.flags |= LAYOUT_CSSGRID.FIXED_WIDTH;
                        column.flags &= ~LAYOUT_CSSGRID.FLEXIBLE;
                        setFlexibleDimension(node.actualWidth, columnGap, columnCount, column.unit, columnMax);
                    }
                    if (node.hasHeight && !CssGrid.isAligned(node)) {
                        fillUnitEqually(row.unit, rowCount);
                    }
                }
                else {
                    if (node.hasPX('height', { percent: false })) {
                        row.flags |= LAYOUT_CSSGRID.FIXED_WIDTH;
                        row.flags &= ~LAYOUT_CSSGRID.FLEXIBLE;
                        setFlexibleDimension(node.actualHeight, rowGap, rowCount, rowUnit, rowMax);
                    }
                    if (node.hasWidth && !CssGrid.isJustified(node)) {
                        fillUnitEqually(column.unit, columnCount);
                    }
                }
                node.retainAs(children).cssSort('zIndex', { byInt: true });
                node.cssTry('display', 'block', () => {
                    node.each((item: T) => {
                        const bounds = item.boundingClientRect;
                        (data.get(item) as CssGridCellData).bounds = bounds ? { ...item.bounds, width: bounds.width, height: bounds.height } : item.bounds;
                    });
                });
                applyLayout(node, column, columnCount, true);
                applyLayout(node, row, rowCount, false);
                data.set(node, mainData);
            }
        }
    }
}