import { CssGridCellData, CssGridData, CssGridDirectionData } from '../../../@types/base/extension';

import ExtensionUI from '../extension-ui';
import NodeUI from '../node-ui';

import { EXT_NAME } from '../lib/constant';
import { BOX_STANDARD } from '../lib/enumeration';

const $lib = squared.lib;
const { formatPX, isLength, isPercent } = $lib.css;
const { CHAR, CSS } = $lib.regex;
const { isNumber, trimString, withinRange } = $lib.util;

type GridLayout = {
    placement: number[];
    rowSpan: number;
    columnSpan: number;
    outerCoord: number;
};

type RepeatItem = {
    name?: string;
    unit?: string;
    unitMin?: string;
};

type RowData = Undef<NodeUI[]>[][];

const CSS_GRID = EXT_NAME.CSS_GRID;
const STRING_UNIT = '[\\d.]+[a-z%]+|auto|max-content|min-content';
const STRING_MINMAX = 'minmax\\(([^,]+), ([^)]+)\\)';
const STRING_FIT_CONTENT = 'fit-content\\(([\\d.]+[a-z%]+)\\)';
const STRING_NAMED = '\\[([\\w\\-\\s]+)\\]';
const REGEX_UNIT = new RegExp(`^(${STRING_UNIT})$`);
const REGEX_NAMED = new RegExp(`\\s*(repeat\\((auto-fit|auto-fill|\\d+), (.+)\\)|${STRING_NAMED}|${STRING_MINMAX}|${STRING_FIT_CONTENT}|${STRING_UNIT})\\s*`, 'g');
const REGEX_REPEAT = new RegExp(`\\s*(${STRING_NAMED}|${STRING_MINMAX}|${STRING_FIT_CONTENT}|${STRING_UNIT})\\s*`, 'g');
const REGEX_STARTEND = /^([\w-]+)-(start|end)$/;
const REGEX_CELL_UNIT = new RegExp('[\\d.]+[a-z%]+|auto|max-content|min-content');
const REGEX_CELL_MINMAX = new RegExp('minmax\\(([^,]+), ([^)]+)\\)');
const REGEX_CELL_FIT_CONTENT = new RegExp('fit-content\\(([\\d.]+[a-z%]+)\\)');
const REGEX_CELL_NAMED = new RegExp('\\[([\\w\\-\\s]+)\\]');
const REGEX_SPAN = /^span/;

function repeatUnit(data: CssGridDirectionData, sizes: string[]) {
    const repeat = data.repeat;
    const unitPX: string[] = [];
    const unitRepeat: string[] = [];
    const length = sizes.length;
    for (let i = 0; i < length; i++) {
        if (repeat[i]) {
            unitRepeat.push(sizes[i]);
        }
        else {
            unitPX.push(sizes[i]);
        }
    }
    const lengthA = data.length;
    const lengthB = lengthA - unitPX.length;
    const lengthC = unitRepeat.length;
    const result: string[] = new Array(lengthA);
    for (let i = 0; i < lengthA; i++) {
        if (repeat[i]) {
            for (let j = 0, k = 0; j < lengthB; i++, j++, k++) {
                if (k === lengthC) {
                    k = 0;
                }
                result[i] = unitRepeat[k];
            }
            i--;
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
        [unit[0], unitMin[0]].forEach(value => {
            if (isPercent(value)) {
                sizeMin = Math.max((parseFloat(value) / 100) * dimension, sizeMin);
            }
            else if (isLength(value)) {
                sizeMin = Math.max(parseFloat(value), sizeMin);
            }
        });
        if (sizeMin > 0) {
            data.length = Math.floor(dimension / (sizeMin + data.gap));
            data.unit = repeatUnit(data, unit);
            data.unitMin = repeatUnit(data, unitMin);
            return true;
        }
    }
    return false;
}

function getColumnTotal(rows: Undef<NodeUI[]>[]) {
    let value = 0;
    for (const row of rows) {
        if (row) {
            value++;
        }
    }
    return value;
}

function setFlexibleDimension(dimension: number, gap: number, count: number, unit: string[], max: number[]) {
    let filled = 0;
    let fractional = 0;
    let percent = 1;
    const length = unit.length;
    for (let i = 0; i < length; i++) {
        const value = unit[i];
        if (CSS.PX.test(value)) {
            filled += parseFloat(value);
        }
        else if (isUnitFR(value)) {
            fractional += parseFloat(value);
        }
        else if (isPercent(value)) {
            percent -= parseFloat(value) / 100;
        }
    }
    if (percent < 1 && fractional > 0) {
        const ratio = (((dimension * percent) - ((count - 1) * gap) - max.reduce((a, b) => a + Math.max(0, b), 0) - filled) / fractional);
        if (ratio > 0) {
            for (let i = 0; i < length; i++) {
                const value = unit[i];
                if (isUnitFR(value)) {
                    unit[i] = formatPX(parseFloat(value) * ratio);
                }
            }
        }
    }
}

function fillUnitEqually(unit: string[], length: number) {
    if (unit.length === 0) {
        for (let i = 0; i < length; i++) {
            unit[i] = '1fr';
        }
    }
}

function getOpenCellIndex(iteration: number, length: number, available: Undef<number[]>) {
    if (available) {
        for (let i = 0, j = -1, k = 0; i < iteration; i++) {
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
    for (let i = 0; i < length; i++) {
        const cell = cells[i];
        for (let j = 0; j < cell.length; j++) {
            if (cell[j] === 0) {
                return i;
            }
        }
    }
    return Math.max(0, length - 1);
}

const isUnitFR = (value: string) => /fr$/.test(value);
const convertLength = (node: NodeUI, value: string, index: number) => isLength(value) ? node.convertPX(value, index === 0 ? 'height' : 'width') : value;

export default class CssGrid<T extends NodeUI> extends ExtensionUI<T> {
    public static isAligned<T extends NodeUI>(node: T) {
        return node.hasHeight && /^space-|center|flex-end|end/.test(node.css('alignContent'));
    }

    public static isJustified<T extends NodeUI>(node: T) {
        return (node.blockStatic || node.hasWidth) && /^space-|center|flex-end|end|right/.test(node.css('justifyContent'));
    }

    public static createDataAttribute<T extends NodeUI>(alignItems: string, alignContent: string, justifyItems: string, justifyContent: string, autoFlow: string): CssGridData<T> {
        return {
            children: [],
            rowData: [],
            rowSpanMultiple: [],
            rowDirection: !autoFlow.includes('column'),
            dense: autoFlow.includes('dense'),
            templateAreas: {},
            row: CssGrid.createDataRowAttribute(),
            column: CssGrid.createDataRowAttribute(),
            emptyRows: [],
            alignItems,
            alignContent,
            justifyItems,
            justifyContent
        };
    }

    public static createDataRowAttribute(): CssGridDirectionData {
        return {
            length: 0,
            gap: 0,
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
        const mainData = CssGrid.createDataAttribute(
            node.css('alignItems'),
            node.css('alignContent'),
            node.css('justifyItems'),
            node.css('justifyContent'),
            node.css('gridAutoFlow')
        );
        const { column, dense, row, rowDirection: horizontal } = mainData;
        const [rowA, colA, rowB, colB] = horizontal ? [0, 1, 2, 3] : [1, 0, 3, 2];
        const rowData: Undef<T[]>[][] = [];
        const openCells: number[][] = [];
        const layout: GridLayout[] = [];
        const setDataRows = (item: T, placement: number[], length: number) => {
            if (placement.every(value => value > 0)) {
                for (let i = placement[rowA] - 1; i < placement[rowB] - 1; i++) {
                    let data = rowData[i];
                    if (data === undefined) {
                        data = [];
                        rowData[i] = data;
                    }
                    let cell = openCells[i];
                    let j = placement[colA] - 1;
                    if (cell === undefined) {
                        cell = new Array(length).fill(0);
                        if (!dense) {
                            for (let k = 0; k < j; k++) {
                                cell[k] = 1;
                            }
                        }
                        openCells[i] = cell;
                    }
                    for ( ; j < placement[colB] - 1; j++) {
                        let rowItem = data[j];
                        if (rowItem === undefined) {
                            rowItem = [];
                            data[j] = rowItem;
                        }
                        cell[j] = 1;
                        rowItem.push(item);
                    }
                }
                return true;
            }
            return false;
        };
        row.gap = node.parseUnit(node.css('rowGap'), 'height', false);
        column.gap = node.parseUnit(node.css('columnGap'), 'width', false);
        [node.cssInitial('gridTemplateRows', true), node.cssInitial('gridTemplateColumns', true), node.css('gridAutoRows'), node.css('gridAutoColumns')].forEach((value, index) => {
            if (value !== '' && value !== 'none' && value !== 'auto') {
                const data = index === 0 ? row : column;
                const { name, repeat, unit, unitMin } = data;
                let match: Null<RegExpMatchArray>;
                let i = 1;
                while ((match = REGEX_NAMED.exec(value)) !== null) {
                    const command = match[1].trim();
                    if (index < 2) {
                        if (command.charAt(0) === '[') {
                            for (const attr of match[4].split(CHAR.SPACE)) {
                                let item = name[attr];
                                if (item === undefined) {
                                    item = [];
                                    name[attr] = item;
                                }
                                item.push(i);
                            }
                        }
                        else if (/^repeat/.test(command)) {
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
                                while ((subMatch = REGEX_REPEAT.exec(match[3])) !== null) {
                                    const subPattern = subMatch[1];
                                    let namedMatch: Null<RegExpMatchArray>;
                                    if ((namedMatch = REGEX_CELL_NAMED.exec(subPattern)) !== null) {
                                        const subName = namedMatch[1];
                                        if (name[subName] === undefined) {
                                            name[subName] = [];
                                        }
                                        repeating.push({ name: subName });
                                    }
                                    else if ((namedMatch = REGEX_CELL_MINMAX.exec(subPattern)) !== null) {
                                        repeating.push({ unit: convertLength(node, namedMatch[2], index), unitMin: convertLength(node, namedMatch[1], index) });
                                    }
                                    else if ((namedMatch = REGEX_CELL_FIT_CONTENT.exec(subPattern)) !== null) {
                                        repeating.push({ unit: convertLength(node, namedMatch[1], index), unitMin: '0px' });
                                    }
                                    else if ((namedMatch = REGEX_CELL_UNIT.exec(subPattern)) !== null) {
                                        repeating.push({ unit: convertLength(node, namedMatch[0], index) });
                                    }
                                }
                                if (repeating.length) {
                                    for (let j = 0; j < iterations; j++) {
                                        for (const item of repeating) {
                                            const { name: nameA, unit: unitA } = item;
                                            if (nameA) {
                                                name[nameA].push(i);
                                            }
                                            else if (unitA) {
                                                unit.push(unitA);
                                                unitMin.push(item.unitMin || '');
                                                repeat.push(true);
                                                i++;
                                            }
                                        }
                                    }
                                }
                                REGEX_REPEAT.lastIndex = 0;
                            }
                        }
                        else if (/^minmax/.test(command)) {
                            unit.push(convertLength(node, match[6], index));
                            unitMin.push(convertLength(node, match[5], index));
                            repeat.push(false);
                            i++;
                        }
                        else if (/^fit-content/.test(command)) {
                            unit.push(convertLength(node, match[7], index));
                            unitMin.push('0px');
                            repeat.push(false);
                            i++;
                        }
                        else if (REGEX_UNIT.test(command)) {
                            unit.push(convertLength(node, command, index));
                            unitMin.push('');
                            repeat.push(false);
                            i++;
                        }
                    }
                    else {
                        (index === 2 ? row : column).auto.push(node.convertPX(command));
                    }
                }
                REGEX_NAMED.lastIndex = 0;
            }
        });
        if (horizontal) {
            node.sort((a, b) => {
                const { left, top } = a.linear;
                const { left: leftB, top: topB } = b.linear;
                if (!withinRange(top, topB)) {
                    return top < topB ? -1 : 1;
                }
                else if (!withinRange(left, leftB)) {
                    return left < leftB ? -1 : 1;
                }
                return 0;
            });
        }
        else {
            node.sort((a, b) => {
                const { left, top } = a.linear;
                const { left: leftB, top: topB } = b.linear;
                if (!withinRange(left, leftB)) {
                    return left < leftB ? -1 : 1;
                }
                else if (!withinRange(top, topB)) {
                    return top < topB ? -1 : 1;
                }
                return 0;
            });
        }
        let autoWidth = false;
        let autoHeight = false;
        if (!node.has('gridTemplateAreas') && node.every(item => item.css('gridRowStart') === 'auto' && item.css('gridColumnStart') === 'auto')) {
            const [directionA, directionB, indexA, indexB, indexC] = horizontal ? ['top', 'bottom', 2, 1, 3] : ['left', 'right', 3, 0, 2];
            let rowIndex = 0;
            let columnIndex = 0;
            let columnMax = 0;
            let previous: Undef<T>;
            if (horizontal) {
                if (column.autoFill) {
                    autoWidth = setAutoFill(column, node.actualWidth);
                }
            }
            else if (row.autoFill) {
                autoHeight = setAutoFill(row, node.actualHeight);
            }
            node.each((item: T, index) => {
                if (previous === undefined || item.linear[directionA] >= previous.linear[directionB] || columnIndex > 0 && columnIndex === columnMax) {
                    columnMax = Math.max(columnIndex, columnMax);
                    rowIndex++;
                    columnIndex = 1;
                }
                const rowEnd = item.css('gridRowEnd');
                const columnEnd = item.css('gridColumnEnd');
                let rowSpan = 1;
                let columnSpan = 1;
                if (REGEX_SPAN.test(rowEnd)) {
                    rowSpan = parseInt(rowEnd.split(' ')[1]);
                }
                else if (isNumber(rowEnd)) {
                    rowSpan = parseInt(rowEnd) - rowIndex;
                }
                if (REGEX_SPAN.test(columnEnd)) {
                    columnSpan = parseInt(columnEnd.split(' ')[1]);
                }
                else if (isNumber(columnEnd)) {
                    columnSpan = parseInt(columnEnd) - columnIndex;
                }
                if (columnIndex === 1 && columnMax > 0) {
                    let valid = false;
                    do {
                        const available: number[] = new Array(columnMax - 1).fill(1);
                        for (const cell of layout) {
                            const placement = cell.placement;
                            if (placement[indexA] > rowIndex) {
                                for (let i = placement[indexB]; i < placement[indexC]; i++) {
                                    available[i - 1] = 0;
                                }
                            }
                        }
                        for (let i = 0, j = 0, k = 0; i < available.length; i++) {
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
                            rowIndex++;
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
            node.css('gridTemplateAreas').split(/"[\s\n]+"/).forEach((template, i) => {
                if (template !== 'none') {
                    trimString(template.trim(), '"').split(CHAR.SPACE).forEach((area, j) => {
                        if (area.charAt(0) !== '.') {
                            const templateArea = templateAreas[area];
                            if (templateArea) {
                                templateArea.rowSpan = (i - templateArea.rowStart) + 1;
                                templateArea.columnSpan = (j - templateArea.columnStart) + 1;
                            }
                            else {
                                templateAreas[area] = {
                                    rowStart: i,
                                    rowSpan: 1,
                                    columnStart: j,
                                    columnSpan: 1
                                };
                            }
                        }
                    });
                }
            });
            node.each((item, index) => {
                const positions = [
                    item.css('gridRowStart'),
                    item.css('gridColumnStart'),
                    item.css('gridRowEnd'),
                    item.css('gridColumnEnd')
                ];
                const placement = [0, 0, 0, 0];
                let rowSpan = -1;
                let columnSpan = -1;
                if (Object.keys(templateAreas).length) {
                    for (let i = 0; i < 4; i++) {
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
                            const match = REGEX_STARTEND.exec(name);
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
                        else if (REGEX_SPAN.test(value)) {
                            const span = parseInt(value.split(' ')[1]);
                            if (span === length && previousPlacement) {
                                if (horizontal) {
                                    if (!vertical) {
                                        const end = previousPlacement[2];
                                        if (end > 0 && placement[0] === 0) {
                                            placement[0] = end;
                                        }
                                    }
                                }
                                else {
                                    if (vertical) {
                                        const end = previousPlacement[3];
                                        if (end > 0 && placement[1] === 0) {
                                            placement[1] = end;
                                        }
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
                            else {
                                if (columnSpan === -1) {
                                    columnSpan = span;
                                }
                            }
                            return true;
                        }
                        return false;
                    };
                    let rowStart: Undef<string[]>;
                    let colStart: Undef<string[]>;
                    for (let i = 0; i < 4; i++) {
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
                if (previousPlacement === undefined) {
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
                layout[index] = <GridLayout> {
                    outerCoord: horizontal ? item.linear.top : item.linear.left,
                    placement,
                    rowSpan,
                    columnSpan
                };
                previousPlacement = placement;
            });
        }
        let ITERATION: number;
        {
            const [data, outerCoord] = horizontal ? [column, node.box.top] : [row, node.box.left];
            let unit = data.unit;
            let length = 1;
            let outerCount = 0;
            for (const item of layout) {
                if (item) {
                    const [totalSpan, start, end] = horizontal ? [item.columnSpan, 1, 3] : [item.rowSpan, 0, 2];
                    const placement = item.placement;
                    if (placement.some(value => value > 0)) {
                        length = Math.max(length, totalSpan, placement[start], placement[end] - 1);
                    }
                    if (withinRange(item.outerCoord, outerCoord)) {
                        outerCount += totalSpan;
                    }
                }
            }
            const lengthA = unit.length;
            ITERATION = Math.max(length, outerCount, horizontal && !autoWidth || !horizontal && !autoHeight ? lengthA : 0);
            data.length = ITERATION;
            if (lengthA < ITERATION) {
                if (data.autoFill || data.autoFit) {
                    if (lengthA === 0) {
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
                    const lengthB = auto.length;
                    if (lengthB) {
                        let i = 0;
                        while (unit.length < ITERATION) {
                            if (i === lengthB) {
                                i = 0;
                            }
                            unit.push(auto[i]);
                        }
                    }
                }
            }
            else if (data.autoFit || data.autoFill && node.blockStatic && (horizontal && !node.hasWidth && !node.hasPX('maxWidth', false) || !horizontal && !node.hasHeight)) {
                unit.length = ITERATION;
            }
            let percent = 1;
            let fr = 0;
            for (const value of unit) {
                if (isPercent(value)) {
                    percent -= parseFloat(value) / 100;
                }
                else if (isUnitFR(value)) {
                    fr += parseFloat(value);
                }
            }
            data.flexible = percent < 1 || fr > 0;
            if (percent < 1 && fr > 0) {
                const lengthB = unit.length;
                for (let i = 0; i < lengthB; i++) {
                    const value = unit[i];
                    if (isUnitFR(value)) {
                        unit[i] = percent * (parseFloat(value) / fr) + 'fr';
                    }
                }
            }
        }
        node.each((item: T, index) => {
            const { placement, rowSpan, columnSpan } = layout[index];
            const [ROW_SPAN, COLUMN_SPAN] = horizontal ? [rowSpan, columnSpan] : [columnSpan, rowSpan];
            while (placement[0] === 0 || placement[1] === 0) {
                const PLACEMENT = placement.slice(0);
                if (PLACEMENT[rowA] === 0) {
                    let length = rowData.length;
                    for (let i = (dense ? 0 : getOpenRowIndex(openCells)), j = 0, k = -1; i < length; i++) {
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
                    for (let i = l; i < m; i++) {
                        const data = rowData[i];
                        if (data === undefined) {
                            available.push([[0, -1]] as [number, number][]);
                        }
                        else if (getColumnTotal(data) + COLUMN_SPAN <= ITERATION) {
                            const range: [number, number][] = [];
                            let span = 0;
                            for (let j = 0, k = -1; j < ITERATION; j++) {
                                const rowItem = data[j];
                                if (rowItem === undefined) {
                                    if (k === -1) {
                                        k = j;
                                    }
                                    span++;
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
                        const data = available[0];
                        if (data[0][1] === -1) {
                            PLACEMENT[colA] = 1;
                        }
                        else if (length === m - l) {
                            if (length > 1) {
                                found: {
                                    for (const outside of data) {
                                        for (let i = outside[0]; i < outside[1]; i++) {
                                            for (let j = 1; j < length; j++) {
                                                const avail = available[j];
                                                const lengthA = avail.length;
                                                for (let k = 0; k < lengthA; k++) {
                                                    const inside = avail[k];
                                                    if (i >= inside[0] && (inside[1] === -1 || i + COLUMN_SPAN <= inside[1])) {
                                                        PLACEMENT[colA] = i + 1;
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
            if (setDataRows(item, placement, ITERATION)) {
                const [a, b, c, d] = placement;
                const rowStart = a - 1;
                const rowSpan = c - a;
                const columnStart = b - 1;
                const columnSpan = d - b;
                if (!dense) {
                    const cellIndex = horizontal ? rowStart : columnStart;
                    if (cellIndex > 0) {
                        const cells = openCells[cellIndex - 1];
                        for (let i = 0; i < ITERATION; i++) {
                            cells[i] = 1;
                        }
                    }
                }
                if (rowSpan > 1) {
                    const rowSpanMultiple = mainData.rowSpanMultiple;
                    for (let i = rowStart; i < rowStart + rowSpan; i++) {
                        rowSpanMultiple[i] = true;
                    }
                }
                item.data(CSS_GRID, 'cellData', <CssGridCellData> {
                    rowStart,
                    rowSpan,
                    columnStart,
                    columnSpan
                });
            }
        });
        if (rowData.length) {
            let rowMain: RowData;
            if (horizontal) {
                rowMain = rowData;
                mainData.rowData = rowData;
            }
            else {
                rowMain = mainData.rowData;
                const length = rowData.length;
                for (let i = 0; i < length; i++) {
                    const data = rowData[i];
                    const lengthA = data.length;
                    for (let j = 0; j < lengthA; j++) {
                        let rowItem = rowMain[j];
                        if (rowItem === undefined) {
                            rowItem = [];
                            rowMain[j] = rowItem;
                        }
                        rowItem[i] = data[j];
                    }
                }
            }
            const unitTotal = horizontal ? row.unitTotal : column.unitTotal;
            const children = mainData.children;
            const columnCount = column.unit.length;
            for (const data of rowMain) {
                const length = data.length;
                for (let i = 0; i < length; i++) {
                    const columnItem = data[i];
                    let count = unitTotal[i] || 0;
                    if (columnItem) {
                        let maxDimension = 0;
                        for (const item of columnItem) {
                            if (!children.includes(item)) {
                                maxDimension = Math.max(maxDimension, horizontal ? item.bounds.height : item.bounds.width);
                                children.push(item);
                            }
                        }
                        count += maxDimension;
                    }
                    unitTotal[i] = count;
                }
            }
            if (children.length === node.length) {
                const { gap: rowGap, unit: rowUnit } = row;
                const { gap: columnGap, unit: columnUnit } = column;
                const rowCount = Math.max(rowUnit.length, rowMain.length);
                const rowMax: number[] = new Array(rowCount).fill(0);
                const columnMax: number[] = new Array(columnCount).fill(0);
                const modified = new Set<T>();
                row.length = rowCount;
                column.length = columnCount;
                for (let i = 0; i < rowCount; i++) {
                    const rowItem = rowMain[i];
                    const unitHeight = rowUnit[i];
                    if (rowItem) {
                        for (let j = 0; j < columnCount; j++) {
                            const columnItem = rowItem[j] as T[];
                            if (columnItem) {
                                for (const item of columnItem) {
                                    if (!modified.has(item)) {
                                        const { columnSpan, rowSpan } = <CssGridCellData> item.data(CSS_GRID, 'cellData');
                                        const x = j + columnSpan - 1;
                                        const y = i + rowSpan - 1;
                                        if (x < columnCount - 1) {
                                            item.modifyBox(BOX_STANDARD.MARGIN_RIGHT, columnGap);
                                        }
                                        if (y < rowCount - 1) {
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
                                mainData.emptyRows[j] = [Number.POSITIVE_INFINITY];
                            }
                        }
                    }
                    else {
                        rowMax[i] = parseFloat(unitHeight) || 0;
                        if (horizontal) {
                            mainData.emptyRows[i] = [Number.POSITIVE_INFINITY];
                        }
                    }
                }
                if (horizontal) {
                    if (node.hasPX('width', false)) {
                        column.fixedWidth = true;
                        column.flexible = false;
                        setFlexibleDimension(node.actualWidth, columnGap, columnCount, columnUnit, columnMax);
                    }
                    if (node.hasHeight && !CssGrid.isAligned(node)) {
                        fillUnitEqually(row.unit, rowCount);
                    }
                }
                else {
                    if (node.hasPX('height', false)) {
                        row.fixedWidth = true;
                        row.flexible = false;
                        setFlexibleDimension(node.actualHeight, rowGap, rowCount, rowUnit, rowMax);
                    }
                    if (node.hasWidth && !CssGrid.isJustified(node)) {
                        fillUnitEqually(column.unit, columnCount);
                    }
                }
                node.retain(children);
                node.cssSort('zIndex');
                if (node.cssTry('display', 'block')) {
                    node.each((item: T) => {
                        const rect = item.boundingClientRect;
                        item.data(CSS_GRID, 'boundsData', { ...item.bounds, width: rect.width, height: rect.height });
                    });
                    node.cssFinally('display');
                }
                node.data(CSS_GRID, 'mainData', mainData);
            }
        }
        return undefined;
    }
}