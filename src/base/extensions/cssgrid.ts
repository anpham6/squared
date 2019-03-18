import { CssGridCellData, CssGridData, CssGridDirectionData } from '../@types/extension';

import Extension from '../extension';
import Node from '../node';

import { EXT_NAME } from '../lib/constant';
import { BOX_STANDARD } from '../lib/enumeration';

type GridPosition = {
    placement: number[],
    rowSpan: number,
    columnSpan: number
};

type RepeatItem = {
    name?: string
    unit?: string
    unitMin?: string
};

const $util = squared.lib.util;

const STRING_UNIT = '[\\d.]+[a-z%]+|auto|max-content|min-content';
const STRING_MINMAX = 'minmax\\(([^,]+), ([^)]+)\\)';
const STRING_FIT_CONTENT = 'fit-content\\(([\\d.]+[a-z%]+)\\)';
const STRING_NAMED = '\\[([\\w\\-\\s]+)\\]';
const REGEXP_GRID = {
    UNIT: new RegExp(`^(${STRING_UNIT})$`),
    NAMED: `\\s*(repeat\\((auto-fit|auto-fill|[0-9]+), (.+)\\)|${STRING_NAMED}|${STRING_MINMAX}|${STRING_FIT_CONTENT}|${STRING_UNIT})\\s*`,
    REPEAT: `\\s*(${STRING_NAMED}|${STRING_MINMAX}|${STRING_FIT_CONTENT}|${STRING_UNIT})\\s*`
};

function repeatUnit(data: CssGridDirectionData, dimension: string[]) {
    const unitPX: string[] = [];
    const unitRepeat: string[] = [];
    for (let i = 0; i < dimension.length; i++) {
        if (data.repeat[i]) {
            unitRepeat.push(dimension[i]);
        }
        else {
            unitPX.push(dimension[i]);
        }
    }
    const repeatTotal = data.count - unitPX.length;
    const result: string[] = [];
    for (let i = 0; i < data.count; i++) {
        if (data.repeat[i]) {
            for (let j = 0, k = 0; j < repeatTotal; i++, j++, k++) {
                if (k === unitRepeat.length) {
                    k = 0;
                }
                result[i] = unitRepeat[k];
            }
            break;
        }
        else if (unitPX.length) {
            result[i] = unitPX.shift() as string;
        }
    }
    return result;
}

function convertLength<T extends Node>(node: T, value: string) {
    return $util.isLength(value) ? node.convertPX(value) : value;
}

function getColumnTotal<T extends Node>(rows: (T[] | undefined)[]) {
    let value = 0;
    for (const row of rows) {
        if (row) {
            value++;
        }
    }
    return value;
}

export default class CssGrid<T extends Node> extends Extension<T> {
    public static createDataAttribute<T extends Node>(): CssGridData<T> {
        return {
            children: new Set(),
            rowData: [],
            templateAreas: {},
            row: CssGrid.createDataRowAttribute(),
            column: CssGrid.createDataRowAttribute(),
            emptyRows: [],
            alignItems: '',
            alignContent: '',
            justifyItems: '',
            justifyContent: ''
        };
    }

    public static createDataRowAttribute(): CssGridDirectionData {
        return {
            count: 0,
            gap: 0,
            unit: [],
            unitMin: [],
            repeat: [],
            auto: [],
            autoFill: false,
            autoFit: false,
            name: {},
            normal: true
        };
    }

    public condition(node: T) {
        return node.gridElement && node.length > 0;
    }

    public processNode(node: T) {
        const mainData = { ...CssGrid.createDataAttribute(),
            alignItems: node.css('alignItems'),
            alignContent: node.css('alignContent'),
            justifyItems: node.css('justifyItems'),
            justifyContent: node.css('justifyContent')
        };
        const gridAutoFlow = node.css('gridAutoFlow');
        const horizontal = gridAutoFlow.indexOf('row') !== -1;
        const dense = gridAutoFlow.indexOf('dense') !== -1;
        const rowData: (T[] | undefined)[][] = [];
        const cellsPerRow: number[] = [];
        const gridPosition: GridPosition[] = [];
        let rowInvalid: ObjectIndex<boolean> = {};
        mainData.row.gap = node.parseUnit(node.css('rowGap'), false, false);
        mainData.column.gap = node.parseUnit(node.css('columnGap'), true, false);
        function setDataRows(item: T, placement: number[]) {
            if (placement.every(value => value > 0)) {
                for (let i = placement[horizontal ? 0 : 1] - 1; i < placement[horizontal ? 2 : 3] - 1; i++) {
                    if (rowData[i] === undefined) {
                        rowData[i] = [];
                    }
                    for (let j = placement[horizontal ? 1 : 0] - 1; j < placement[horizontal ? 3 : 2] - 1; j++) {
                        if (cellsPerRow[i] === undefined) {
                            cellsPerRow[i] = 0;
                        }
                        if (rowData[i][j] === undefined) {
                            rowData[i][j] = [];
                            cellsPerRow[i]++;
                        }
                        (rowData[i][j] as T[]).push(item);
                    }
                }
                return true;
            }
            return false;
        }
        [node.cssInitial('gridTemplateRows', true), node.cssInitial('gridTemplateColumns', true), node.css('gridAutoRows'), node.css('gridAutoColumns')].forEach((value, index) => {
            if (value && value !== 'none' && value !== 'auto') {
                const patternA = new RegExp(REGEXP_GRID.NAMED, 'g');
                let matchA: RegExpMatchArray | null;
                let i = 1;
                while ((matchA = patternA.exec(value)) !== null) {
                    if (index < 2) {
                        const data = mainData[index === 0 ? 'row' : 'column'];
                        if (matchA[1].startsWith('repeat')) {
                            let iterations = 1;
                            switch (matchA[2]) {
                                case 'auto-fit':
                                    data.autoFit = true;
                                    break;
                                case 'auto-fill':
                                    data.autoFill = true;
                                    break;
                                default:
                                    iterations = $util.convertInt(matchA[3]);
                                    break;
                            }
                            if (iterations > 0) {
                                const repeating: RepeatItem[] = [];
                                const patternB = new RegExp(REGEXP_GRID.REPEAT, 'g');
                                let matchB: RegExpMatchArray | null;
                                while ((matchB = patternB.exec(matchA[3])) !== null) {
                                    let matchC: RegExpMatchArray | null;
                                    if ((matchC = new RegExp(STRING_NAMED).exec(matchB[1])) !== null) {
                                        if (data.name[matchC[1]] === undefined) {
                                            data.name[matchC[1]] = [];
                                        }
                                        repeating.push({ name: matchC[1] });
                                    }
                                    else if ((matchC = new RegExp(STRING_MINMAX).exec(matchB[1])) !== null) {
                                        repeating.push({ unit: convertLength(node, matchC[2]), unitMin: convertLength(node, matchC[1]) });
                                    }
                                    else if ((matchC = new RegExp(STRING_FIT_CONTENT).exec(matchB[1])) !== null) {
                                        repeating.push({ unit: convertLength(node, matchC[1]), unitMin: '0px' });
                                    }
                                    else if ((matchC = new RegExp(STRING_UNIT).exec(matchB[1])) !== null) {
                                        repeating.push({ unit: convertLength(node, matchC[0]) });
                                    }
                                }
                                if (repeating.length) {
                                    for (let j = 0; j < iterations; j++) {
                                        for (const item of repeating) {
                                            if (item.name) {
                                                data.name[item.name].push(i);
                                            }
                                            else if (item.unit) {
                                                data.unit.push(item.unit);
                                                data.unitMin.push(item.unitMin || '');
                                                data.repeat.push(true);
                                                i++;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        else if (matchA[1].charAt(0) === '[') {
                            if (data.name[matchA[4]] === undefined) {
                                data.name[matchA[4]] = [];
                            }
                            data.name[matchA[4]].push(i);
                        }
                        else if (matchA[1].startsWith('minmax')) {
                            data.unit.push(convertLength(node, matchA[6]));
                            data.unitMin.push(convertLength(node, matchA[5]));
                            data.repeat.push(false);
                            i++;
                        }
                        else if (matchA[1].startsWith('fit-content')) {
                            data.unit.push(convertLength(node, matchA[7]));
                            data.unitMin.push('0px');
                            data.repeat.push(false);
                            i++;
                        }
                        else if (REGEXP_GRID.UNIT.test(matchA[1])) {
                            data.unit.push(convertLength(node, matchA[1]));
                            data.unitMin.push('');
                            data.repeat.push(false);
                            i++;
                        }
                    }
                    else {
                        mainData[index === 2 ? 'row' : 'column'].auto.push(node.convertPX(matchA[1]));
                    }
                }
            }
        });
        node.cssSort('order');
        if (!node.has('gridTemplateAreas') && node.every(item => item.css('gridRowStart') === 'auto' && item.css('gridColumnStart') === 'auto')) {
            const direction = horizontal ? ['top', 'bottom'] : ['left', 'right'];
            let row = 0;
            let column = 0;
            let previous: T | undefined;
            let columnMax = 0;
            node.each((item: T, index) => {
                if (previous === undefined || item.linear[direction[0]] >= previous.linear[direction[1]] || column > 0 && column === columnMax) {
                    columnMax = Math.max(column, columnMax);
                    row++;
                    column = 1;
                }
                const rowEnd = item.css('gridRowEnd');
                const columnEnd = item.css('gridColumnEnd');
                let rowSpan = 1;
                let columnSpan = 1;
                if (rowEnd.startsWith('span')) {
                    rowSpan = parseInt(rowEnd.split(' ')[1]);
                }
                else if ($util.isNumber(rowEnd)) {
                    rowSpan = parseInt(rowEnd) - row;
                }
                if (columnEnd.startsWith('span')) {
                    columnSpan = parseInt(columnEnd.split(' ')[1]);
                }
                else if ($util.isNumber(columnEnd)) {
                    columnSpan = parseInt(columnEnd) - column;
                }
                if (column === 1 && columnMax > 0) {
                    const startIndex = horizontal ? [2, 1, 3] : [3, 0, 2];
                    let valid = false;
                    do {
                        const available = new Array(columnMax - 1).fill(1);
                        for (const position of gridPosition) {
                            const placement = position.placement;
                            if (placement[startIndex[0]] > row) {
                                for (let i = placement[startIndex[1]]; i < placement[startIndex[2]]; i++) {
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
                                    column = k + 1;
                                    valid = true;
                                    break;
                                }
                            }
                            else {
                                j = 0;
                            }
                        }
                        if (!valid) {
                            mainData.emptyRows[row - 1] = available;
                            row++;
                        }
                    }
                    while (!valid);
                }
                gridPosition[index] = <GridPosition> {
                    placement: horizontal ? [row, column, row + rowSpan, column + columnSpan] : [column, row, column + columnSpan, row + rowSpan],
                    rowSpan,
                    columnSpan
                };
                column += columnSpan;
                previous = item;
            });
        }
        else {
            node.css('gridTemplateAreas').split(/"[\s\n]+"/).forEach((template, i) => {
                $util.trimString(template.trim(), '"').split(' ').forEach((area, j) => {
                    if (area !== '.') {
                        if (mainData.templateAreas[area] === undefined) {
                            mainData.templateAreas[area] = {
                                rowStart: i,
                                rowSpan: 1,
                                columnStart: j,
                                columnSpan: 1
                            };
                        }
                        else {
                            mainData.templateAreas[area].rowSpan = (i - mainData.templateAreas[area].rowStart) + 1;
                            mainData.templateAreas[area].columnSpan++;
                        }
                    }
                });
            });
            node.each((item, index) => {
                const positions = [
                    item.css('gridRowStart'),
                    item.css('gridColumnStart'),
                    item.css('gridRowEnd'),
                    item.css('gridColumnEnd')
                ];
                const placement: number[] = [];
                let rowSpan = 1;
                let columnSpan = 1;
                for (let i = 0; i < positions.length; i++) {
                    const value = positions[i];
                    let template = mainData.templateAreas[value];
                    if (template) {
                        switch (i) {
                            case 0:
                                placement[i] = template.rowStart + 1;
                                break;
                            case 1:
                                placement[i] = template.columnStart + 1;
                                break;
                            case 2:
                                placement[i] = template.rowStart + template.rowSpan + 1;
                                break;
                            case 3:
                                placement[i] = template.columnStart + template.columnSpan + 1;
                                break;
                        }
                    }
                    else {
                        const match = /^([\w\-]+)-(start|end)$/.exec(value);
                        if (match) {
                            template = mainData.templateAreas[match[1]];
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
                if (!placement[0] || !placement[1] || !placement[2] || !placement[3]) {
                    function setPlacement(value: string, position: number) {
                        if ($util.isNumber(value)) {
                            placement[position] = parseInt(value);
                            return true;
                        }
                        else if (value.startsWith('span')) {
                            const span = parseInt(value.split(' ')[1]);
                            if (!placement[position - 2]) {
                                if (position % 2 === 0) {
                                    rowSpan = span;
                                }
                                else {
                                    columnSpan = span;
                                }
                            }
                            else {
                                placement[position] = placement[position - 2] + span;
                            }
                            return true;
                        }
                        return false;
                    }
                    for (let i = 0; i < positions.length; i++) {
                        const value = positions[i];
                        if (value !== 'auto' && !placement[i] && !setPlacement(value, i)) {
                            const data = mainData[i % 2 === 0 ? 'row' : 'column'];
                            const alias = value.split(' ');
                            if (alias.length === 1) {
                                alias[1] = alias[0];
                                alias[0] = '1';
                            }
                            const nameIndex = parseInt(alias[0]);
                            if (data.name[alias[1]]) {
                                const nameLength = data.name[alias[1]].length;
                                if (nameIndex <= nameLength) {
                                    placement[i] = data.name[alias[1]][nameIndex - 1] + (alias[1] === positions[i - 2] ? 1 : 0);
                                }
                                else if (data.autoFill && nameIndex > nameLength) {
                                    placement[i] = nameIndex + (alias[1] === positions[i - 2] ? 1 : 0);
                                }
                            }
                        }
                        if (!placement[i]) {
                            setPlacement(value, i);
                        }
                    }
                }
                gridPosition[index] = <GridPosition> {
                    placement,
                    rowSpan,
                    columnSpan
                };
            });
        }
        {
            const data = mainData[horizontal ? 'column' : 'row'];
            data.count = Math.max(data.unit.length, 1);
            for (let i = 0; i < gridPosition.length; i++) {
                const item = gridPosition[i];
                if (item) {
                    data.count = Math.max(data.count, horizontal ? item.columnSpan : item.rowSpan, item.placement[horizontal ? 1 : 0] || 0, (item.placement[horizontal ? 3 : 2] || 0) - 1);
                }
            }
            if (data.autoFill || data.autoFit) {
                if (data.unit.length === 0) {
                    data.unit.push('auto');
                    data.unitMin.push('');
                    data.repeat.push(true);
                }
                data.unit = repeatUnit(data, data.unit);
                data.unitMin = repeatUnit(data, data.unitMin);
            }
        }
        node.each((item: T, index) => {
            const position = gridPosition[index];
            const placement = position.placement;
            const ROW_SPAN = horizontal ? position.rowSpan : position.columnSpan;
            const COLUMN_SPAN = horizontal ? position.columnSpan : position.rowSpan;
            const COLUMN_COUNT = horizontal ? mainData.column.count : mainData.row.count;
            const rowA = horizontal ? 0 : 1;
            const colA = horizontal ? 1 : 0;
            const rowB = horizontal ? 2 : 3;
            const colB = horizontal ? 3 : 2;
            while (!placement[0] || !placement[1]) {
                const PLACEMENT = placement.slice(0);
                if (!PLACEMENT[rowA]) {
                    let l = rowData.length;
                    for (let i = 0, j = 0, k = -1; i < l; i++) {
                        if (!rowInvalid[i]) {
                            if (cellsPerRow[i] === undefined || cellsPerRow[i] < COLUMN_COUNT) {
                                if (j === 0) {
                                    k = i;
                                    l = Math.max(l, i + ROW_SPAN);
                                }
                                if (++j === ROW_SPAN) {
                                    PLACEMENT[rowA] = k + 1;
                                    break;
                                }
                            }
                            else {
                                j = 0;
                                k = -1;
                                l = rowData.length;
                            }
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
                    for (let i = PLACEMENT[rowA] - 1; i < PLACEMENT[rowB] - 1; i++) {
                        if (rowData[i] === undefined) {
                            available.push([[0, -1]] as [number, number][]);
                        }
                        else if (getColumnTotal(rowData[i]) + COLUMN_SPAN <= COLUMN_COUNT) {
                            const range: [number, number][] = [];
                            let span = 0;
                            for (let j = 0, k = -1; j < COLUMN_COUNT; j++) {
                                if (rowData[i][j] === undefined) {
                                    if (k === -1) {
                                        k = j;
                                    }
                                    span++;
                                }
                                if (rowData[i][j] || j === COLUMN_COUNT - 1) {
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
                    if (COLUMN_SPAN === available.length) {
                        if (available.length > 1) {
                            gapNested: {
                                for (const outside of available[0]) {
                                    for (let i = outside[0]; i < outside[1]; i++) {
                                        for (let j = 1; j < available.length; j++) {
                                            for (let k = 0; k < available[j].length; k++) {
                                                const inside = available[j][k];
                                                if (i >= inside[0] && (inside[1] === -1 || i + COLUMN_SPAN <= inside[1])) {
                                                    PLACEMENT[colA] = i + 1;
                                                    break gapNested;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        else {
                            PLACEMENT[colA] = available[0][0][0] + 1;
                        }
                    }
                }
                if (PLACEMENT[rowA] && PLACEMENT[colA]) {
                    placement[rowA] = PLACEMENT[rowA];
                    placement[colA] = PLACEMENT[colA];
                }
                else if (PLACEMENT[rowA]) {
                    rowInvalid[PLACEMENT[rowA] - 1] = true;
                }
            }
            if (!placement[rowB]) {
                placement[rowB] = placement[rowA] + ROW_SPAN;
            }
            if (!placement[colB]) {
                placement[colB] = placement[colA] + COLUMN_SPAN;
            }
            if (setDataRows(item, placement)) {
                item.data(EXT_NAME.CSS_GRID, 'cellData', <CssGridCellData> {
                    rowStart: placement[0] - 1,
                    rowSpan: placement[2] - placement[0],
                    columnStart: placement[1] - 1,
                    columnSpan: placement[3] - placement[1]
                });
                if (dense) {
                    rowInvalid = {};
                }
            }
        });
        if (horizontal) {
            mainData.rowData = rowData;
        }
        else {
            for (let i = 0; i < rowData.length; i++) {
                for (let j = 0; j < rowData[i].length; j++) {
                    if (mainData.rowData[j] === undefined) {
                        mainData.rowData[j] = [];
                    }
                    mainData.rowData[j][i] = rowData[i][j];
                }
            }
        }
        if (mainData.rowData.length) {
            for (const row of mainData.rowData) {
                mainData.column.count = Math.max(row.length, mainData.column.count);
                for (const column of row) {
                    if (column) {
                        for (const item of column) {
                            mainData.children.add(item);
                        }
                    }
                }
            }
            if (mainData.children.size === node.length) {
                mainData.row.count = mainData.rowData.length;
                const modified = new Set<T>();
                for (let i = 0; i < mainData.row.count; i++) {
                    for (let j = 0; j < mainData.column.count; j++) {
                        const column = mainData.rowData[i][j] as T[];
                        if (column) {
                            for (const item of column) {
                                if (item && !modified.has(item)) {
                                    const cellData = <CssGridCellData> item.data(EXT_NAME.CSS_GRID, 'cellData');
                                    const x = j + (cellData ? cellData.columnSpan - 1 : 0);
                                    const y = i + (cellData ? cellData.rowSpan - 1 : 0);
                                    if (x < mainData.column.count - 1) {
                                        item.modifyBox(BOX_STANDARD.MARGIN_RIGHT, mainData.column.gap);
                                    }
                                    if (y < mainData.row.count - 1) {
                                        item.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, mainData.row.gap);
                                    }
                                    modified.add(item);
                                }
                            }
                        }
                    }
                }
                node.retain(Array.from(mainData.children));
                node.cssSort('zIndex');
                node.data(EXT_NAME.CSS_GRID, 'mainData', mainData);
            }
        }
        return undefined;
    }
}