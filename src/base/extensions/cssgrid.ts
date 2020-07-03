import ExtensionUI from '../extension-ui';

import { BOX_STANDARD } from '../lib/enumeration';

type NodeUI = squared.base.NodeUI;
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

const { formatPercent, formatPX, isLength, isPercent, isPx } = squared.lib.css;
const { isNumber, plainMap, safeNestedArray, splitPairEnd, trimString, withinRange } = squared.lib.util;

const PATTERN_UNIT = '[\\d.]+[a-z%]+|auto|max-content|min-content';
const PATTERN_MINMAX = 'minmax\\(\\s*([^,]+),\\s+([^)]+)\\s*\\)';
const PATTERN_FIT_CONTENT = 'fit-content\\(\\s*([\\d.]+[a-z%]+)\\s*\\)';
const PATTERN_NAMED = '\\[([\\w\\s\\-]+)\\]';
const REGEXP_UNIT = new RegExp(`^${PATTERN_UNIT}$`);
const REGEXP_NAMED = new RegExp(`\\s*(repeat\\(\\s*(auto-fit|auto-fill|\\d+),\\s+(.+)\\)|${PATTERN_NAMED}|${PATTERN_MINMAX}|${PATTERN_FIT_CONTENT}|${PATTERN_UNIT}\\s*)\\s*`, 'g');
const REGEXP_REPEAT = new RegExp(`\\s*(${PATTERN_NAMED}|${PATTERN_MINMAX}|${PATTERN_FIT_CONTENT}|${PATTERN_UNIT})\\s*`, 'g');
const REGEXP_CELL_UNIT = new RegExp(PATTERN_UNIT);
const REGEXP_CELL_MINMAX = new RegExp(PATTERN_MINMAX);
const REGEXP_CELL_FIT_CONTENT = new RegExp(PATTERN_FIT_CONTENT);
const REGEXP_CELL_NAMED = new RegExp(PATTERN_NAMED);

function repeatUnit(data: CssGridDirectionData, sizes: string[]) {
    const repeat = data.repeat;
    const unitPX: string[] = [];
    const unitRepeat: string[] = [];
    const length = sizes.length;
    for (let i = 0; i < length; ++i) {
        if (repeat[i]) {
            unitRepeat.push(sizes[i]);
        }
        else {
            unitPX.push(sizes[i]);
        }
    }
    const q = data.length;
    const r = q - unitPX.length;
    const result: string[] = new Array(q);
    for (let i = 0; i < q; ++i) {
        if (repeat[i]) {
            for (let j = 0, k = 0; j < r; ++i, ++j, ++k) {
                if (k === unitRepeat.length) {
                    k = 0;
                }
                result[i] = unitRepeat[k];
            }
            --i;
        }
        else {
            result[i] = unitPX.shift() as string;
        }
    }
    return result;
}

function setAutoFill(data: CssGridDirectionData, dimension: number) {
    const unit = data.unit;
    if (unit.length === 1 && (data.autoFill || data.autoFit)) {
        const unitMin = data.unitMin;
        let sizeMin = 0;
        for (const value of [unit[0], unitMin[0]]) {
            if (isPercent(value)) {
                sizeMin = Math.max(parseFloat(value) / 100 * dimension, sizeMin);
            }
            else if (isLength(value)) {
                sizeMin = Math.max(parseFloat(value), sizeMin);
            }
        }
        if (sizeMin > 0) {
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
    let i = 0;
    while (i < length) {
        const value = unit[i++];
        if (isPx(value)) {
            filled += parseFloat(value);
        }
        else if (CssGrid.isFr(value)) {
            fractional += parseFloat(value);
        }
        else if (isPercent(value)) {
            percent -= parseFloat(value) / 100;
        }
    }
    if (percent < 1 && fractional > 0) {
        const ratio = (dimension * percent - (count - 1) * gap - max.reduce((a, b) => a + Math.max(0, b), 0) - filled) / fractional;
        if (ratio > 0) {
            for (i = 0; i < length; ++i) {
                const value = unit[i];
                if (CssGrid.isFr(value)) {
                    unit[i] = formatPX(parseFloat(value) * ratio);
                }
            }
        }
    }
}

function fillUnitEqually(unit: string[], length: number) {
    if (unit.length === 0) {
        let i = 0;
        while (i < length) {
            unit[i++] = '1fr';
        }
    }
}

function getOpenCellIndex(iteration: number, length: number, available: Undef<number[]>) {
    if (available) {
        for (let i = 0, j = -1, k = 0; i < iteration; ++i) {
            if (available[i] === 0) {
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
    const length = cells.length;
    for (let i = 0; i < length; ++i) {
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
    return Object.assign(data, {
        children: [],
        rowData: [],
        rowSpanMultiple: [],
        rowDirection: !data.gridAutoFlow.includes('column'),
        dense: data.gridAutoFlow.includes('dense'),
        templateAreas: {},
        row: CssGrid.createDataRowAttribute(node.parseHeight(node.css('rowGap'), false)),
        column: CssGrid.createDataRowAttribute(node.parseWidth(node.css('columnGap'), false)),
        emptyRows: [],
        minCellHeight: 0
    });
}

function setDataRows(rowData: Undef<NodeUI[]>[][], openCells: number[][], rowA: number, rowB: number, colA: number, colB: number, item: NodeUI, placement: number[], length: number, dense: boolean) {
    if (placement.every(value => value > 0)) {
        for (let i = placement[rowA] - 1; i < placement[rowB] - 1; ++i) {
            const data = safeNestedArray(rowData, i);
            let cell = openCells[i],
                j = placement[colA] - 1;
            if (!cell) {
                cell = new Array(length).fill(0);
                if (!dense) {
                    let k = 0;
                    while (k < j) {
                        cell[k++] = 1;
                    }
                }
                openCells[i] = cell;
            }
            while (j < placement[colB] - 1) {
                safeNestedArray(data as NodeUI[][], j).push(item);
                cell[j++] = 1;
            }
        }
        return true;
    }
    return false;
}

function applyLayout(node: NodeUI, data: CssGridDirectionData, dataCount: number, horizontal: boolean) {
    let unit = data.unit;
    let length = unit.length;
    if (length < dataCount) {
        if (data.autoFill || data.autoFit) {
            if (length === 0) {
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
            if (q > 0) {
                let i = 0;
                while (unit.length < dataCount) {
                    if (i === q) {
                        i = 0;
                    }
                    unit.push(auto[i++]);
                }
            }
        }
    }
    else if (data.autoFit || data.autoFill && (horizontal && node.blockStatic && !node.hasWidth && !node.hasPX('maxWidth', { percent: false }) || !horizontal && !node.hasHeight)) {
        unit.length = dataCount;
    }
    let percent = 1,
        fr = 0,
        auto = 0;
    length = unit.length;
    let i = 0;
    while (i < length) {
        const value = unit[i++];
        if (isPercent(value)) {
            percent -= parseFloat(value) / 100;
        }
        else if (CssGrid.isFr(value)) {
            fr += parseFloat(value);
        }
        else if (value === 'auto') {
            ++auto;
        }
    }
    data.flexible = percent < 1 || fr > 0;
    if (percent < 1) {
        if (fr > 0) {
            for (i = 0; i < length; ++i) {
                const value = unit[i];
                if (CssGrid.isFr(value)) {
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

export default class CssGrid<T extends NodeUI> extends ExtensionUI<T> {
    public static isFr = (value: string) => /\dfr$/.test(value);
    public static isAligned = (node: NodeUI) => node.hasHeight && /^space-|center|flex-end|end/.test(node.css('alignContent'));
    public static isJustified = (node: NodeUI) => (node.blockStatic || node.hasWidth) && /^space-|center|flex-end|end|right/.test(node.css('justifyContent'));

    public static createDataRowAttribute(gap = 0): CssGridDirectionData {
        return {
            length: 0,
            gap,
            unit: [],
            unitMin: [],
            unitTotal: [],
            repeat: [],
            auto: [],
            autoFill: false,
            autoFit: false,
            name: {},
            fixedWidth: false,
            flexible: false,
            frTotal: 0
        };
    }

    public is(node: T) {
        return node.gridElement;
    }

    public condition(node: T) {
        return node.length > 0;
    }

    public processNode(node: T) {
        const mainData = createDataAttribute(node);
        const { column, dense, row, rowDirection: horizontal } = mainData;
        const rowData: Undef<T[]>[][] = [];
        const openCells: number[][] = [];
        const layout: GridLayout[] = [];
        const gridTemplates = [node.cssInitial('gridTemplateRows'), node.cssInitial('gridTemplateColumns'), node.css('gridAutoRows'), node.css('gridAutoColumns')];
        const [rowA, colA, rowB, colB] =
            horizontal
                ? [0, 1, 2, 3]
                : [1, 0, 3, 2];
        let autoWidth = false,
            autoHeight = false,
            ITERATION: number;
        for (let index = 0; index < 4; ++index) {
            const value = gridTemplates[index];
            if (value !== '' && value !== 'none' && value !== 'auto') {
                const data = index === 0 ? row : column;
                const { name, repeat, unit, unitMin } = data;
                let i = 1,
                    match: Null<RegExpMatchArray>;
                while (match = REGEXP_NAMED.exec(value)) {
                    const command = match[1].trim();
                    switch (index) {
                        case 0:
                        case 1:
                            if (command.startsWith('[')) {
                                for (const attr of match[4].split(/\s+/)) {
                                    safeNestedArray(name, attr).push(i);
                                }
                            }
                            else if (command.startsWith('repeat')) {
                                let iterations = 1;
                                switch (match[2]) {
                                    case 'auto-fit':
                                        data.autoFit = true;
                                        break;
                                    case 'auto-fill':
                                        data.autoFill = true;
                                        break;
                                    default:
                                        iterations = parseInt(match[2]) || 1;
                                        break;
                                }
                                if (iterations > 0) {
                                    const repeating: RepeatItem[] = [];
                                    let subMatch: Null<RegExpMatchArray>;
                                    while (subMatch = REGEXP_REPEAT.exec(match[3])) {
                                        const subPattern = subMatch[1];
                                        let namedMatch: Null<RegExpMatchArray>;
                                        if (namedMatch = REGEXP_CELL_NAMED.exec(subPattern)) {
                                            const subName = namedMatch[1];
                                            if (!name[subName]) {
                                                name[subName] = [];
                                            }
                                            repeating.push({ name: subName });
                                        }
                                        else if (namedMatch = REGEXP_CELL_MINMAX.exec(subPattern)) {
                                            repeating.push({ unit: convertLength(node, namedMatch[2], index), unitMin: convertLength(node, namedMatch[1], index) });
                                        }
                                        else if (namedMatch = REGEXP_CELL_FIT_CONTENT.exec(subPattern)) {
                                            repeating.push({ unit: convertLength(node, namedMatch[1], index), unitMin: '0px' });
                                        }
                                        else if (namedMatch = REGEXP_CELL_UNIT.exec(subPattern)) {
                                            repeating.push({ unit: convertLength(node, namedMatch[0], index) });
                                        }
                                    }
                                    if (repeating.length > 0) {
                                        for (let j = 0; j < iterations; ++j) {
                                            for (let k = 0; k < repeating.length; ++k) {
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
                            (index === 2 ? row : column).auto.push(
                                isLength(command)
                                    ? formatPX(node.parseUnit(command, { dimension: index !== 2 ? 'width' : 'height' }))
                                    : command
                            );
                            break;
                    }
                }
                REGEXP_NAMED.lastIndex = 0;
            }
        }
        if (horizontal) {
            node.sort((a, b) => {
                const linearA = a.linear;
                const linearB = b.linear;
                if (!withinRange(linearA.top, linearB.top)) {
                    return linearA.top < linearB.top ? -1 : 1;
                }
                else if (!withinRange(linearA.left, linearB.left)) {
                    return linearA.left < linearB.left ? -1 : 1;
                }
                return 0;
            });
        }
        else {
            node.sort((a, b) => {
                const linearA = a.linear;
                const linearB = b.linear;
                if (!withinRange(linearA.left, linearB.left)) {
                    return linearA.left < linearB.left ? -1 : 1;
                }
                else if (!withinRange(linearA.top, linearB.top)) {
                    return linearA.top < linearB.top ? -1 : 1;
                }
                return 0;
            });
        }
        if (!node.has('gridTemplateAreas') && node.every(item => item.css('gridRowStart') === 'auto' && item.css('gridColumnStart') === 'auto')) {
            const [directionA, directionB, indexA, indexB, indexC] =
                horizontal
                    ? ['top', 'bottom', 2, 1, 3]
                    : ['left', 'right', 3, 0, 2];
            let rowIndex = 0,
                columnIndex = 0,
                columnMax = 0,
                previous: Undef<T>;
            if (horizontal) {
                if (column.autoFill) {
                    autoWidth = setAutoFill(column, node.actualWidth);
                }
            }
            else if (row.autoFill) {
                autoHeight = setAutoFill(row, node.actualHeight);
            }
            node.each((item: T, index) => {
                if (!previous || item.linear[directionA] >= previous.linear[directionB] || columnIndex > 0 && columnIndex === columnMax) {
                    columnMax = Math.max(columnIndex, columnMax);
                    ++rowIndex;
                    columnIndex = 1;
                }
                const [gridRowEnd, gridColumnEnd] = item.cssAsTuple('gridRowEnd', 'gridColumnEnd');
                let rowSpan = 1,
                    columnSpan = 1;
                if (gridRowEnd.startsWith('span')) {
                    rowSpan = parseInt(splitPairEnd(gridRowEnd, ' '));
                }
                else if (isNumber(gridRowEnd)) {
                    rowSpan = parseInt(gridRowEnd) - rowIndex;
                }
                if (gridColumnEnd.startsWith('span')) {
                    columnSpan = parseInt(splitPairEnd(gridColumnEnd, ' '));
                }
                else if (isNumber(gridColumnEnd)) {
                    columnSpan = parseInt(gridColumnEnd) - columnIndex;
                }
                if (columnIndex === 1 && columnMax > 0) {
                    let valid = false;
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
                        const length = available.length;
                        for (let i = 0, j = 0, k = 0; i < length; ++i) {
                            if (available[i]) {
                                if (j === 0) {
                                    k = i;
                                }
                                if (++j === columnSpan) {
                                    columnIndex = k + 1;
                                    valid = true;
                                    break;
                                }
                            }
                            else {
                                j = 0;
                            }
                        }
                        if (!valid) {
                            mainData.emptyRows[rowIndex - 1] = available;
                            ++rowIndex;
                        }
                    }
                    while (!valid);
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
            node.css('gridTemplateAreas').split(/"[\s\n]+"/).forEach((template, rowStart) => {
                if (template !== 'none') {
                    trimString(template.trim(), '"').split(/\s+/).forEach((area, columnStart) => {
                        if (area.charAt(0) !== '.') {
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
                if (placement[0] === 0 || placement[1] === 0 || placement[2] === 0 || placement[3] === 0) {
                    const setPlacement = (value: string, position: number, vertical: boolean, length: number) => {
                        if (isNumber(value)) {
                            const cellIndex = parseInt(value);
                            if (cellIndex > 0) {
                                placement[position] = cellIndex;
                                return true;
                            }
                            else if (cellIndex < 0 && position >= 2) {
                                const positionA = position - 2;
                                placement[placement[positionA] > 0 ? position : positionA] = cellIndex + length + 2;
                                return true;
                            }
                        }
                        else if (value.startsWith('span')) {
                            const span = parseInt(splitPairEnd(value, ' '));
                            if (span === length && previousPlacement) {
                                if (horizontal) {
                                    if (!vertical) {
                                        const end = previousPlacement[2];
                                        if (end > 0 && placement[0] === 0) {
                                            placement[0] = end;
                                        }
                                    }
                                }
                                else if (vertical) {
                                    const end = previousPlacement[3];
                                    if (end > 0 && placement[1] === 0) {
                                        placement[1] = end;
                                    }
                                }
                            }
                            const start = placement[position - 2];
                            switch (position) {
                                case 0: {
                                    const rowIndex = positions[2];
                                    if (isNumber(rowIndex)) {
                                        const pos = parseInt(rowIndex);
                                        placement[0] = pos - span;
                                        placement[2] = pos;
                                    }
                                    break;
                                }
                                case 1: {
                                    const colIndex = positions[3];
                                    if (isNumber(colIndex)) {
                                        const pos = parseInt(colIndex);
                                        placement[1] = pos - span;
                                        placement[3] = pos;
                                    }
                                    break;
                                }
                                case 2:
                                case 3:
                                    if (start > 0) {
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
                        if (value !== 'auto' && placement[i] === 0) {
                            const vertical = i % 2 === 0;
                            const data = vertical ? row : column;
                            if (!setPlacement(value, i, vertical, Math.max(1, data.unit.length))) {
                                const alias = value.split(' ');
                                if (alias.length === 1) {
                                    alias[1] = alias[0];
                                    alias[0] = '1';
                                }
                                else if (isNumber(alias[0])) {
                                    if (vertical) {
                                        if (rowStart) {
                                            rowSpan = parseInt(alias[0]) - parseInt(rowStart[0]);
                                        }
                                        else {
                                            rowStart = alias;
                                        }
                                    }
                                    else if (colStart) {
                                        columnSpan = parseInt(alias[0]) - parseInt(colStart[0]);
                                    }
                                    else {
                                        colStart = alias;
                                    }
                                }
                                const named = data.name[alias[1]];
                                if (named) {
                                    const nameIndex = parseInt(alias[0]);
                                    if (nameIndex <= named.length) {
                                        placement[i] = named[nameIndex - 1] + (alias[1] === positions[i - 2] ? 1 : 0);
                                    }
                                }
                            }
                        }
                    }
                }
                if (!previousPlacement) {
                    if (placement[0] === 0) {
                        placement[0] = 1;
                    }
                    if (placement[1] === 0) {
                        placement[1] = 1;
                    }
                }
                const [a, b, c, d] = placement;
                if (rowSpan === -1) {
                    rowSpan = a > 0 && c > 0 ? c - a : 1;
                }
                else if (a > 0 && c === 0) {
                    placement[2] = a + rowSpan;
                }
                if (columnSpan === -1) {
                    columnSpan = b > 0 && d > 0 ? d - b : 1;
                }
                else if (b > 0 && d === 0) {
                    placement[3] = a + columnSpan;
                }
                if (placement[2] === 0 && placement[0] > 0) {
                    placement[2] = placement[0] + rowSpan;
                }
                if (placement[3] === 0 && placement[1] > 0) {
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
            let length = 1,
                outerCount = 0;
            let i = 0;
            while (i < layout.length) {
                const item = layout[i++];
                if (item) {
                    const [totalSpan, start, end] =
                        horizontal
                            ? [item.columnSpan, 1, 3]
                            : [item.rowSpan, 0, 2];
                    const placement = item.placement;
                    if (placement.some(value => value > 0)) {
                        length = Math.max(length, totalSpan, placement[start], placement[end] - 1);
                    }
                    if (withinRange(item.outerCoord, horizontal ? node.box.top : node.box.left)) {
                        outerCount += totalSpan;
                    }
                }
            }
            ITERATION = Math.max(length, outerCount, horizontal && !autoWidth ? column.unit.length : 0, !horizontal && !autoHeight ? row.unit.length : 0);
        }
        node.each((item: T, index) => {
            const { placement, rowSpan, columnSpan } = layout[index];
            const [ROW_SPAN, COLUMN_SPAN] =
                horizontal
                    ? [rowSpan, columnSpan]
                    : [columnSpan, rowSpan];
            while (placement[0] === 0 || placement[1] === 0) {
                const PLACEMENT = placement.slice(0);
                if (PLACEMENT[rowA] === 0) {
                    let length = rowData.length;
                    for (let i = dense ? 0 : getOpenRowIndex(openCells), j = 0, k = -1; i < length; ++i) {
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
                if (PLACEMENT[rowA] === 0) {
                    placement[rowA] = rowData.length + 1;
                    if (placement[colA] === 0) {
                        placement[colA] = 1;
                    }
                }
                else if (PLACEMENT[colA] === 0) {
                    if (PLACEMENT[rowB] === 0) {
                        PLACEMENT[rowB] = PLACEMENT[rowA] + ROW_SPAN;
                    }
                    const available: [number, number][][] = [];
                    const l = PLACEMENT[rowA] - 1;
                    const m = PLACEMENT[rowB] - 1;
                    let i = l;
                    while (i < m) {
                        const data = rowData[i++];
                        if (!data) {
                            available.push([[0, -1]] as [number, number][]);
                        }
                        else if (data.reduce((a, b) => a + (b ? 1 : 0), 0) + COLUMN_SPAN <= ITERATION) {
                            const range: [number, number][] = [];
                            let span = 0;
                            for (let j = 0, k = -1; j < ITERATION; ++j) {
                                const rowItem = data[j];
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
                            if (range.length > 0) {
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
                    if (length > 0) {
                        const data = available[0];
                        if (data[0][1] === -1) {
                            PLACEMENT[colA] = 1;
                        }
                        else if (length === m - l) {
                            if (length > 1) {
                                found: {
                                    const q = data.length;
                                    i = 0;
                                    while (i < q) {
                                        const outside = data[i++];
                                        for (let j = outside[0]; j < outside[1]; ++j) {
                                            let k = 1;
                                            while (k < length) {
                                                const avail = available[k++];
                                                let n = 0;
                                                while (n < avail.length) {
                                                    const inside = avail[n++];
                                                    if (j >= inside[0] && (inside[1] === -1 || j + COLUMN_SPAN <= inside[1])) {
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
                                PLACEMENT[colA] = data[0][0] + 1;
                            }
                        }
                    }
                }
                const indexA = PLACEMENT[rowA];
                if (indexA > 0) {
                    const positionA = PLACEMENT[colA];
                    if (positionA > 0) {
                        placement[rowA] = indexA;
                        placement[colA] = positionA;
                    }
                }
            }
            if (placement[rowB] === 0) {
                placement[rowB] = placement[rowA] + ROW_SPAN;
            }
            if (placement[colB] === 0) {
                placement[colB] = placement[colA] + COLUMN_SPAN;
            }
            if (setDataRows(rowData, openCells, rowA, rowB, colA, colB, item, placement, ITERATION, dense)) {
                const [a, b, c, d] = placement;
                const rowStart = a - 1;
                const rowCount = c - a;
                const columnStart = b - 1;
                if (!dense) {
                    const cellIndex = horizontal ? rowStart : columnStart;
                    if (cellIndex > 0) {
                        const cells = openCells[cellIndex - 1];
                        let i = 0;
                        while (i < ITERATION) {
                            cells[i++] = 1;
                        }
                    }
                }
                if (rowCount > 1) {
                    const rowSpanMultiple = mainData.rowSpanMultiple;
                    const length = rowStart + rowCount;
                    let i = rowStart;
                    while (i < length) {
                        rowSpanMultiple[i++] = true;
                    }
                }
                item.data(this.name, 'cellData', {
                    rowStart,
                    rowSpan: rowCount,
                    columnStart,
                    columnSpan: d - b
                } as CssGridCellData);
            }
        });
        let columnCount = rowData.length;
        if (columnCount > 0) {
            let rowMain: RowData;
            if (horizontal) {
                rowMain = rowData;
                mainData.rowData = rowData;
                columnCount = Math.max(column.unit.length, ...plainMap(rowData, item => item.length));
            }
            else {
                rowMain = mainData.rowData;
                let j: number;
                for (let i = 0; i < columnCount; ++i) {
                    const data = rowData[i];
                    const length = data.length;
                    j = 0;
                    while (j < length) {
                        safeNestedArray(rowMain, j)[i] = data[j++];
                    }
                }
            }
            const unitTotal = horizontal ? row.unitTotal : column.unitTotal;
            const children = mainData.children;
            {
                const length = rowMain.length;
                let i = 0, j: number, k: number;
                while (i < length) {
                    const data = rowMain[i++];
                    const q = data.length;
                    j = 0;
                    while (j < q) {
                        const columnItem = data[j];
                        let count = unitTotal[j] || 0;
                        if (columnItem) {
                            let maxDimension = 0;
                            const r = columnItem.length;
                            k = 0;
                            while (k < r) {
                                const item = columnItem[k++];
                                if (!children.includes(item)) {
                                    maxDimension = Math.max(maxDimension, horizontal ? item.bounds.height : item.bounds.width);
                                    children.push(item);
                                }
                            }
                            count += maxDimension;
                        }
                        unitTotal[j++] = count;
                    }
                }
            }
            if (children.length === node.length) {
                const { gap: rowGap, unit: rowUnit } = row;
                const columnGap = column.gap;
                const rowCount = Math.max(rowUnit.length, rowMain.length);
                const rowMax: number[] = new Array(rowCount).fill(0);
                const columnMax: number[] = new Array(columnCount).fill(0);
                const modified = new Set<T>();
                row.length = rowCount;
                column.length = columnCount;
                let minCellHeight = 0;
                for (let i = 0; i < rowCount; ++i) {
                    const rowItem = rowMain[i];
                    const unitHeight = rowUnit[i];
                    if (rowItem) {
                        for (let j = 0; j < columnCount; ++j) {
                            const columnItem = rowItem[j];
                            if (columnItem) {
                                const length = columnItem.length;
                                let k = 0;
                                while (k < length) {
                                    const item = columnItem[k++] as T;
                                    if (!modified.has(item)) {
                                        const { columnSpan, rowSpan } = item.data<CssGridCellData>(this.name, 'cellData')!;
                                        const x = j + columnSpan - 1;
                                        const y = i + rowSpan - 1;
                                        if (columnGap > 0 && x < columnCount - 1) {
                                            item.modifyBox(BOX_STANDARD.MARGIN_RIGHT, columnGap);
                                        }
                                        if (rowGap > 0 && y < rowCount - 1) {
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
                                                rowMax[i] = -boundsHeight;
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
                                                columnMax[j] = -boundsWidth;
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
                            rowMax[i] = parseFloat(unitHeight);
                        }
                        if (horizontal) {
                            mainData.emptyRows[i] = [Infinity];
                        }
                    }
                }
                mainData.minCellHeight = minCellHeight;
                if (horizontal) {
                    if (node.hasPX('width', { percent: false })) {
                        column.fixedWidth = true;
                        column.flexible = false;
                        setFlexibleDimension(node.actualWidth, columnGap, columnCount, column.unit, columnMax);
                    }
                    if (node.hasHeight && !CssGrid.isAligned(node)) {
                        fillUnitEqually(row.unit, rowCount);
                    }
                }
                else {
                    if (node.hasPX('height', { percent: false })) {
                        row.fixedWidth = true;
                        row.flexible = false;
                        setFlexibleDimension(node.actualHeight, rowGap, rowCount, rowUnit, rowMax);
                    }
                    if (node.hasWidth && !CssGrid.isJustified(node)) {
                        fillUnitEqually(column.unit, columnCount);
                    }
                }
                node.retainAs(children);
                node.cssSort('zIndex', { byInt: true });
                if (node.cssTry('display', 'block')) {
                    node.each((item: T) => {
                        const { width, height } = item.boundingClientRect;
                        item.data(this.name, 'boundsData', { ...item.bounds, width, height });
                    });
                    node.cssFinally('display');
                }
                applyLayout(node, column, columnCount, true);
                applyLayout(node, row, rowCount, false);
                node.data(this.name, 'mainData', mainData);
            }
        }
        return undefined;
    }
}