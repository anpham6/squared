import BOX_STANDARD = squared.base.lib.constant.BOX_STANDARD;
import LAYOUT_CSSGRID = squared.lib.internal.LAYOUT_CSSGRID;

import type NodeUI from '../node-ui';

import ExtensionUI from '../extension-ui';

import { trimString } from '../lib/util';

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

const { asPercent, asPx, formatPercent, formatPX, isLength } = squared.lib.css;
const { endsWith, safeFloat, splitEnclosing, splitPairEnd, splitSome, startsWith, withinRange } = squared.lib.util;

const PATTERN_SIZE = '\\[([^\\]]+)\\]|minmax\\(([^,]+),([^)]+)\\)|fit-content\\(\\s*([\\d.]+[a-z%]+)\\s*\\)|([\\d.]+[a-z%]+|auto|max-content|min-content)';
const REGEXP_SIZE = new RegExp(PATTERN_SIZE, 'g');
const REGEXP_REPEAT = /repeat\(\s*(auto-fit|auto-fill|\d+)/;

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
        let sizeMin = 0,
            offset: number;
        for (const value of [unit[0], unitMin[0]]) {
            if (!isNaN(offset = asPx(value))) {
                sizeMin = Math.max(offset, sizeMin);
            }
            else if (!isNaN(offset = asPercent(value))) {
                sizeMin = Math.max(offset * dimension, sizeMin);
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
        percent = 1,
        n: number;
    const length = unit.length;
    for (let i = 0; i < length; ++i) {
        const value = unit[i];
        if (!isNaN(n = asPx(value))) {
            filled += n;
        }
        else if (endsWith(value, 'fr')) {
            fractional += safeFloat(value);
        }
        else if (!isNaN(n = asPercent(value))) {
            percent -= n;
        }
    }
    if (percent < 1 && fractional) {
        const ratio = (dimension * percent - (count - 1) * gap - max.reduce((a, b) => a + Math.max(0, b), 0) - filled) / fractional;
        if (ratio > 0) {
            for (let i = 0; i < length; ++i) {
                const value = unit[i];
                if (endsWith(value, 'fr')) {
                    unit[i] = formatPX(safeFloat(value) * ratio);
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
        if (cells[i].some(value => value === 0)) {
            return i;
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
        rowDirection: data.gridAutoFlow.indexOf('column') === -1,
        dense: data.gridAutoFlow.indexOf('dense') !== -1,
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
    else if (data.flags & LAYOUT_CSSGRID.AUTO_FIT || data.flags & LAYOUT_CSSGRID.AUTO_FILL && (horizontal && node.blockStatic && !node.hasWidth && !node.hasUnit('maxWidth', { percent: false }) || !horizontal && !node.hasHeight)) {
        unit.length = dataCount;
    }
    let percent = 1,
        fr = 0,
        auto = 0;
    const length = unit.length;
    for (let i = 0; i < length; ++i) {
        const value = unit[i];
        if (value === 'auto') {
            ++auto;
        }
        else {
            const n = asPercent(value);
            if (!isNaN(n)) {
                percent -= n;
            }
            else if (endsWith(value, 'fr')) {
                fr += safeFloat(value);
            }
        }
    }
    if (percent < 1 || fr > 0) {
        data.flags |= LAYOUT_CSSGRID.FLEXIBLE;
    }
    if (percent < 1) {
        if (fr) {
            for (let i = 0; i < length; ++i) {
                if (endsWith(unit[i], 'fr')) {
                    unit[i] = percent * (safeFloat(unit[i]) / fr) + 'fr';
                }
            }
        }
        else if (auto === 1) {
            const j = unit.indexOf('auto');
            if (j !== -1) {
                unit[j] = formatPercent(percent);
            }
        }
    }
}

const convertLength = (node: NodeUI, value: string, index: number) => isLength(value = value.trim()) ? formatPX(node.parseUnit(value, { dimension: index !== 0 ? 'width' : 'height' })) : value;

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
                    match: Null<RegExpExecArray>;
                for (const seg of splitEnclosing(value, 'repeat')) {
                    if (startsWith(seg, 'repeat')) {
                        if (match = REGEXP_REPEAT.exec(seg)) {
                            let iterations = 1;
                            switch (match[1]) {
                                case 'auto-fit':
                                    direction.flags |= LAYOUT_CSSGRID.AUTO_FIT;
                                    break;
                                case 'auto-fill':
                                    direction.flags |= LAYOUT_CSSGRID.AUTO_FILL;
                                    break;
                                default:
                                    iterations = +match[1] || 1;
                                    break;
                            }
                            if (iterations) {
                                const repeating: RepeatItem[] = [];
                                const size = seg.substring(match[0].length);
                                while (match = REGEXP_SIZE.exec(size)) {
                                    if (match[1]) {
                                        name[match[1]] ||= [];
                                        repeating.push({ name: match[1] });
                                    }
                                    else if (match[2]) {
                                        repeating.push({ unitMin: convertLength(node, match[2], index), unit: convertLength(node, match[3], index) });
                                    }
                                    else if (match[4]) {
                                        repeating.push({ unitMin: '0px', unit: convertLength(node, match[4], index) });
                                    }
                                    else if (match[5]) {
                                        repeating.push({ unit: convertLength(node, match[5], index) });
                                    }
                                }
                                const q = repeating.length;
                                if (q) {
                                    for (let j = 0; j < iterations; ++j) {
                                        for (let k = 0; k < q; ++k) {
                                            const item = repeating[k];
                                            if (item.name) {
                                                name[item.name]!.push(i);
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
                                REGEXP_SIZE.lastIndex = 0;
                            }
                        }
                    }
                    else {
                        while (match = REGEXP_SIZE.exec(seg)) {
                            switch (index) {
                                case 0:
                                case 1:
                                    if (match[1]) {
                                        splitSome(match[1], attr => {
                                            (name[attr] ||= []).push(i);
                                        }, /\s+/g);
                                    }
                                    else if (match[2]) {
                                        unitMin.push(convertLength(node, match[2], index));
                                        unit.push(convertLength(node, match[3], index));
                                        repeat.push(false);
                                        ++i;
                                    }
                                    else if (match[4]) {
                                        unit.push(convertLength(node, match[4], index));
                                        unitMin.push('0px');
                                        repeat.push(false);
                                        ++i;
                                    }
                                    else if (match[5]) {
                                        unit.push(convertLength(node, match[5], index));
                                        unitMin.push('');
                                        repeat.push(false);
                                        ++i;
                                    }
                                    break;
                                case 2:
                                case 3:
                                    (index === 2 ? row : column).auto.push(isLength(match[0]) ? formatPX(node.parseUnit(match[0], { dimension: index !== 2 ? 'width' : 'height' })) : match[0]);
                                    break;
                            }
                        }
                        REGEXP_SIZE.lastIndex = 0;
                    }
                }
            }
        }
        const resetting: T[] = [];
        const boundsMap = startsWith(mainData.alignContent, 'space') && new Map<T, BoxRectDimension>();
        const willReset = (item: T) => item.styleElement && item.textElement || item.inputElement;
        node.each((item: T) => {
            if (willReset(item)) {
                resetting.push(item);
            }
            else {
                const children = item.cascade((child: T) => {
                    if (willReset(child)) {
                        return true;
                    }
                }) as T[];
                if (children.length) {
                    resetting.push(...children);
                }
            }
        });
        if (resetting.length) {
            const options: CssStyleMap = { lineHeight: 'normal', padding: '0px', border: 'none' };
            for (let i = 0, length = resetting.length; i < length; ++i) {
                resetting[i].cssTryAll(options);
            }
            node.each((item: T) => {
                if (boundsMap) {
                    boundsMap.set(item, item.bounds);
                }
                item.setBounds(false);
            });
            for (let i = 0, length = resetting.length; i < length; ++i) {
                resetting[i].cssFinally(options);
            }
        }
        if (horizontal) {
            node.children.sort((a, b) => {
                const linearA = a.linear;
                const linearB = b.linear;
                if (!withinRange(linearA.top, linearB.top)) {
                    return linearA.top - linearB.top;
                }
                if (!withinRange(linearA.left, linearB.left)) {
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
                if (!withinRange(linearA.top, linearB.top)) {
                    return linearA.top - linearB.top;
                }
                return 0;
            });
        }
        if (boundsMap) {
            for (const [item, bounds] of boundsMap) {
                item.unsafe('bounds', bounds);
                item.resetBounds(true);
            }
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
                    columnSpan = 1,
                    n: number;
                if (startsWith(gridRowEnd, 'span')) {
                    rowSpan = +splitPairEnd(gridRowEnd, ' ');
                }
                else if (!isNaN(n = +gridRowEnd)) {
                    rowSpan = n - rowIndex;
                }
                if (startsWith(gridColumnEnd, 'span')) {
                    columnSpan = +splitPairEnd(gridColumnEnd, ' ');
                }
                else if (!isNaN(n = +gridColumnEnd)) {
                    columnSpan = n - columnIndex;
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
                    for (let i = 0, template: Undef<CssGridCellData>; i < 4; ++i) {
                        const name = positions[i];
                        if (template = templateAreas[name]) {
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
                            if (match && (template = templateAreas[match[1]])) {
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
                if (!placement[0] || !placement[1] || !placement[2] || !placement[3]) {
                    const setPlacement = (value: string, position: number, vertical: boolean, length: number) => {
                        let n: number;
                        if (!isNaN(n = +value)) {
                            const cellIndex = n;
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
                        else if (startsWith(value, 'span')) {
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
                                    if (!isNaN(n = +rowIndex)) {
                                        placement[0] = n - span;
                                        placement[2] = n;
                                    }
                                    break;
                                }
                                case 1: {
                                    const colIndex = positions[3];
                                    if (!isNaN(n = +colIndex)) {
                                        placement[1] = n - span;
                                        placement[3] = n;
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
                    for (let i = 0, n: number; i < 4; ++i) {
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
                                else if (!isNaN(n = +alias[0])) {
                                    if (vertical) {
                                        if (rowStart) {
                                            rowSpan = n - +rowStart[0];
                                        }
                                        else {
                                            rowStart = alias;
                                        }
                                    }
                                    else if (colStart) {
                                        columnSpan = n - +colStart[0];
                                    }
                                    else {
                                        colStart = alias;
                                    }
                                }
                                const named = direction.name[alias[1]];
                                if (named) {
                                    n = +alias[0];
                                    if (n <= named.length) {
                                        placement[i] = named[n - 1] + (alias[1] === positions[i - 2] ? 1 : 0);
                                    }
                                }
                            }
                        }
                    }
                }
                if (!previousPlacement) {
                    placement[0] ||= 1;
                    placement[1] ||= 1;
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
                    placement[colA] ||= 1;
                }
                else if (!PLACEMENT[colA]) {
                    PLACEMENT[rowB] ||= PLACEMENT[rowA] + ROW_SPAN;
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
                if (PLACEMENT[rowA] && PLACEMENT[colA]) {
                    placement[rowA] = PLACEMENT[rowA];
                    placement[colA] = PLACEMENT[colA];
                }
            }
            placement[rowB] ||= placement[rowA] + ROW_SPAN;
            placement[colB] ||= placement[colA] + COLUMN_SPAN;
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
                        const n = +unitHeight;
                        if (!isNaN(n)) {
                            rowMax[i] = n;
                        }
                        if (horizontal) {
                            mainData.emptyRows[i] = [Infinity];
                        }
                    }
                }
                mainData.minCellHeight = minCellHeight;
                if (horizontal) {
                    if (node.hasUnit('width', { percent: false })) {
                        column.flags |= LAYOUT_CSSGRID.FIXED_WIDTH;
                        column.flags &= ~LAYOUT_CSSGRID.FLEXIBLE;
                        setFlexibleDimension(node.actualWidth, columnGap, columnCount, column.unit, columnMax);
                    }
                    if (node.hasHeight && !CssGrid.isAligned(node)) {
                        fillUnitEqually(row.unit, rowCount);
                    }
                }
                else {
                    if (node.hasUnit('height', { percent: false })) {
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