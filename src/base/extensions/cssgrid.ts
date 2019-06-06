import { CssGridCellData, CssGridData, CssGridDirectionData } from '../@types/extension';

import ExtensionUI from '../extension-ui';
import NodeUI from '../node-ui';

import { EXT_NAME, STRING_BASE } from '../lib/constant';
import { BOX_STANDARD } from '../lib/enumeration';

type GridLayout = {
    placement: number[],
    rowSpan: number,
    columnSpan: number
};

type RepeatItem = {
    name?: string
    unit?: string
    unitMin?: string
};

const $const = squared.lib.constant;
const $css = squared.lib.css;
const $regex = squared.lib.regex;
const $util = squared.lib.util;

const STRING_UNIT = '[\\d.]+[a-z%]+|auto|max-content|min-content';
const STRING_MINMAX = 'minmax\\(([^,]+), ([^)]+)\\)';
const STRING_FIT_CONTENT = 'fit-content\\(([\\d.]+[a-z%]+)\\)';
const STRING_NAMED = '\\[([\\w\\-\\s]+)\\]';
const CACHE_PATTERN: ObjectMap<RegExp> = {};

function repeatUnit(data: CssGridDirectionData, dimension: string[]) {
    const unitPX: string[] = [];
    const unitRepeat: string[] = [];
    const lengthA = dimension.length;
    for (let i = 0; i < lengthA; i++) {
        if (data.repeat[i]) {
            unitRepeat.push(dimension[i]);
        }
        else {
            unitPX.push(dimension[i]);
        }
    }
    const result: string[] = [];
    const lengthB = data.length - unitPX.length;
    for (let i = 0; i < data.length; i++) {
        if (data.repeat[i]) {
            for (let j = 0, k = 0; j < lengthB; i++, j++, k++) {
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

function getColumnTotal(rows: (NodeUI[] | undefined)[]) {
    let value = 0;
    for (const row of rows) {
        if (row) {
            value++;
        }
    }
    return value;
}

const convertLength = (node: NodeUI, value: string) => $css.isLength(value) ? node.convertPX(value) : value;

export default class CssGrid<T extends NodeUI> extends ExtensionUI<T> {
    public static createDataAttribute<T extends NodeUI>(): CssGridData<T> {
        return {
            children: new Set(),
            rowData: [],
            rowHeight: [],
            rowWeight: [],
            rowSpanMultiple: [],
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
            normal: true
        };
    }

    public condition(node: T) {
        return node.gridElement && node.length > 0;
    }

    public processNode(node: T) {
        if (CACHE_PATTERN.UNIT === undefined) {
            CACHE_PATTERN.UNIT = new RegExp(`^(${STRING_UNIT})$`);
            CACHE_PATTERN.NAMED = new RegExp(`\\s*(repeat\\((auto-fit|auto-fill|\\d+), (.+)\\)|${STRING_NAMED}|${STRING_MINMAX}|${STRING_FIT_CONTENT}|${STRING_UNIT})\\s*`, 'g');
            CACHE_PATTERN.REPEAT = new RegExp(`\\s*(${STRING_NAMED}|${STRING_MINMAX}|${STRING_FIT_CONTENT}|${STRING_UNIT})\\s*`, 'g');
            CACHE_PATTERN.STARTEND = /^([\w\-]+)-(start|end)$/;
        }
        const mainData = {
            ...CssGrid.createDataAttribute(),
            alignItems: node.css('alignItems'),
            alignContent: node.css('alignContent'),
            justifyItems: node.css('justifyItems'),
            justifyContent: node.css('justifyContent')
        };
        const gridAutoFlow = node.css('gridAutoFlow');
        const horizontal = gridAutoFlow.indexOf('column') === -1;
        const dense = gridAutoFlow.indexOf('dense') !== -1;
        const rowData: (T[] | undefined)[][] = [];
        const cellsPerRow: number[] = [];
        const layout: GridLayout[] = [];
        let rowInvalid: ObjectIndex<boolean> = {};
        mainData.row.gap = node.parseUnit(node.css('rowGap'), $const.CSS.HEIGHT, false);
        mainData.column.gap = node.parseUnit(node.css('columnGap'), $const.CSS.WIDTH, false);
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
            if (value && value !== $const.CSS.NONE && value !== $const.CSS.AUTO) {
                CACHE_PATTERN.NAMED.lastIndex = 0;
                let match: RegExpMatchArray | null;
                let i = 1;
                while ((match = CACHE_PATTERN.NAMED.exec(value)) !== null) {
                    if (index < 2) {
                        const data = mainData[index === 0 ? 'row' : 'column'];
                        if (match[1].startsWith('repeat')) {
                            let iterations = 1;
                            switch (match[2]) {
                                case 'auto-fit':
                                    data.autoFit = true;
                                    break;
                                case 'auto-fill':
                                    data.autoFill = true;
                                    break;
                                default:
                                    iterations = $util.convertInt(match[2]);
                                    break;
                            }
                            if (iterations > 0) {
                                if (CACHE_PATTERN.CELL_UNIT === undefined) {
                                    CACHE_PATTERN.CELL_UNIT = new RegExp('[\\d.]+[a-z%]+|auto|max-content|min-content');
                                    CACHE_PATTERN.CELL_MINMAX = new RegExp('minmax\\(([^,]+), ([^)]+)\\)');
                                    CACHE_PATTERN.CELL_FIT_CONTENT = new RegExp('fit-content\\(([\\d.]+[a-z%]+)\\)');
                                    CACHE_PATTERN.CELL_NAMED = new RegExp('\\[([\\w\\-\\s]+)\\]');
                                }
                                else {
                                    CACHE_PATTERN.REPEAT.lastIndex = 0;
                                }
                                const repeating: RepeatItem[] = [];
                                let subMatch: RegExpMatchArray | null;
                                while ((subMatch = CACHE_PATTERN.REPEAT.exec(match[3])) !== null) {
                                    let namedMatch: RegExpMatchArray | null;
                                    if ((namedMatch = CACHE_PATTERN.CELL_NAMED.exec(subMatch[1])) !== null) {
                                        if (data.name[namedMatch[1]] === undefined) {
                                            data.name[namedMatch[1]] = [];
                                        }
                                        repeating.push({ name: namedMatch[1] });
                                    }
                                    else if ((namedMatch = CACHE_PATTERN.CELL_MINMAX.exec(subMatch[1])) !== null) {
                                        repeating.push({ unit: convertLength(node, namedMatch[2]), unitMin: convertLength(node, namedMatch[1]) });
                                    }
                                    else if ((namedMatch = CACHE_PATTERN.CELL_FIT_CONTENT.exec(subMatch[1])) !== null) {
                                        repeating.push({ unit: convertLength(node, namedMatch[1]), unitMin: $const.CSS.PX_0 });
                                    }
                                    else if ((namedMatch = CACHE_PATTERN.CELL_UNIT.exec(subMatch[1])) !== null) {
                                        repeating.push({ unit: convertLength(node, namedMatch[0]) });
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
                        else if (match[1].charAt(0) === '[') {
                            if (data.name[match[4]] === undefined) {
                                data.name[match[4]] = [];
                            }
                            data.name[match[4]].push(i);
                        }
                        else if (match[1].startsWith('minmax')) {
                            data.unit.push(convertLength(node, match[6]));
                            data.unitMin.push(convertLength(node, match[5]));
                            data.repeat.push(false);
                            i++;
                        }
                        else if (match[1].startsWith('fit-content')) {
                            data.unit.push(convertLength(node, match[7]));
                            data.unitMin.push($const.CSS.PX_0);
                            data.repeat.push(false);
                            i++;
                        }
                        else if (CACHE_PATTERN.UNIT.test(match[1])) {
                            data.unit.push(match[1] === $const.CSS.AUTO ? $const.CSS.AUTO : convertLength(node, match[1]));
                            data.unitMin.push('');
                            data.repeat.push(false);
                            i++;
                        }
                    }
                    else {
                        mainData[index === 2 ? 'row' : 'column'].auto.push(node.convertPX(match[1]));
                    }
                }
            }
        });
        if (horizontal) {
            node.sort((a, b) => {
                if (!$util.withinRange(a.linear.top, b.linear.top)) {
                    return a.linear.top < b.linear.top ? -1 : 1;
                }
                else if (!$util.withinRange(a.linear.left, b.linear.left)) {
                    return a.linear.left < b.linear.left ? -1 : 1;
                }
                return 0;
            });
        }
        else {
            node.sort((a, b) => {
                if (!$util.withinRange(a.linear.left, b.linear.left)) {
                    return a.linear.left < b.linear.left ? -1 : 1;
                }
                else if (!$util.withinRange(a.linear.top, b.linear.top)) {
                    return a.linear.top < b.linear.top ? -1 : 1;
                }
                return 0;
            });
        }
        if (!node.has('gridTemplateAreas') && node.every(item => item.css('gridRowStart') === $const.CSS.AUTO && item.css('gridColumnStart') === $const.CSS.AUTO)) {
            let directionA: string;
            let directionB: string;
            let indexA: number;
            let indexB: number;
            let indexC: number;
            if (horizontal) {
                directionA = $const.CSS.TOP;
                directionB = $const.CSS.BOTTOM;
                indexA = 2;
                indexB = 1;
                indexC = 3;
            }
            else {
                directionA = $const.CSS.LEFT;
                directionB = $const.CSS.RIGHT;
                indexA = 3;
                indexB = 0;
                indexC = 2;
            }
            let row = 0;
            let column = 0;
            let columnMax = 0;
            let previous: T | undefined;
            node.each((item: T, index) => {
                if (previous === undefined || item.linear[directionA] >= previous.linear[directionB] || column > 0 && column === columnMax) {
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
                    let valid = false;
                    do {
                        const available: number[] = new Array(columnMax - 1).fill(1);
                        for (const cell of layout) {
                            const placement = cell.placement;
                            if (placement[indexA] > row) {
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
                layout[index] = <GridLayout> {
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
                if (template !== $const.CSS.NONE) {
                    const templateAreas = mainData.templateAreas;
                    $util.trimString(template.trim(), '"').split($regex.CHAR.SPACE).forEach((area, j) => {
                        if (area.charAt(0) !== '.') {
                            if (templateAreas[area]) {
                                templateAreas[area].rowSpan = (i - templateAreas[area].rowStart) + 1;
                                templateAreas[area].columnSpan = (j - templateAreas[area].columnStart) + 1;
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
                const placement: number[] = [];
                let rowSpan = 1;
                let columnSpan = 1;
                if (Object.keys(mainData.templateAreas).length) {
                    for (let i = 0; i < 4; i++) {
                        const name = positions[i];
                        let template = mainData.templateAreas[name];
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
                            const match = CACHE_PATTERN.STARTEND.exec(name);
                            if (match) {
                                template = mainData.templateAreas[match[1]];
                                if (template) {
                                    if (match[2] === $const.CSS.START) {
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
                    let rowStart: string[] | undefined;
                    let colStart: string[] | undefined;
                    for (let i = 0; i < 4; i++) {
                        const value = positions[i];
                        if (value !== $const.CSS.AUTO && !placement[i] && !setPlacement(value, i)) {
                            const data = mainData[i % 2 === 0 ? 'row' : 'column'];
                            const alias = value.split(' ');
                            if (alias.length === 1) {
                                alias[1] = alias[0];
                                alias[0] = '1';
                            }
                            else if ($util.isNumber(alias[0])) {
                                if (i % 2 === 0) {
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
                        if (!placement[i]) {
                            setPlacement(value, i);
                        }
                    }
                }
                layout[index] = <GridLayout> {
                    placement,
                    rowSpan,
                    columnSpan
                };
            });
        }
        {
            const data = mainData[horizontal ? 'column' : 'row'];
            data.length = Math.max(1, data.unit.length);
            for (const item of layout) {
                if (item) {
                    data.length = Math.max(data.length, horizontal ? item.columnSpan : item.rowSpan, item.placement[horizontal ? 1 : 0] || 0, (item.placement[horizontal ? 3 : 2] || 0) - 1);
                }
            }
            if (data.autoFill || data.autoFit) {
                if (data.unit.length === 0) {
                    data.unit.push($const.CSS.AUTO);
                    data.unitMin.push('');
                    data.repeat.push(true);
                }
                data.unit = repeatUnit(data, data.unit);
                data.unitMin = repeatUnit(data, data.unitMin);
            }
            let percent = 1;
            let fr = 0;
            for (const unit of data.unit) {
                if ($css.isPercent(unit)) {
                    percent -= parseFloat(unit) / 100;
                }
                else if (unit.endsWith('fr')) {
                    fr += parseFloat(unit);
                }
            }
            if (percent > 0 && fr > 0) {
                const length = data.unit.length;
                for (let i = 0; i < length; i++) {
                    if (data.unit[i].endsWith('fr')) {
                        data.unit[i] = percent * (parseFloat(data.unit[i]) / fr) + 'fr';
                    }
                }
            }
            const rowEnd = mainData.row.unit.length + 1;
            const columnEnd = mainData.column.unit.length + 1;
            for (const cell of layout) {
                const placement = cell.placement;
                if (placement[2] < 0) {
                    if (rowEnd > 1) {
                        placement[2] += rowEnd + 1;
                    }
                    else {
                        placement[2] = undefined as any;
                    }
                }
                if (placement[3] < 0) {
                    if (columnEnd > 1) {
                        placement[3] += columnEnd + 1;
                    }
                    else {
                        placement[3] = undefined as any;
                    }
                }
            }
        }
        node.each((item: T, index) => {
            const cell = layout[index];
            const placement = cell.placement;
            let ROW_SPAN: number;
            let COLUMN_SPAN: number;
            let COLUMN_COUNT: number;
            let rowA: number;
            let colA: number;
            let rowB: number;
            let colB: number;
            if (horizontal) {
                ROW_SPAN = cell.rowSpan;
                COLUMN_SPAN = cell.columnSpan;
                COLUMN_COUNT = mainData.column.length;
                rowA = 0;
                colA = 1;
                rowB = 2;
                colB = 3;
            }
            else {
                ROW_SPAN = cell.columnSpan;
                COLUMN_SPAN = cell.rowSpan;
                COLUMN_COUNT = mainData.row.length;
                rowA = 1;
                colA = 0;
                rowB = 3;
                colB = 2;
            }
            while (!placement[0] || !placement[1]) {
                const PLACEMENT = placement.slice(0);
                if (!PLACEMENT[rowA]) {
                    let length = rowData.length;
                    for (let i = 0, j = 0, k = -1; i < length; i++) {
                        if (!rowInvalid[i]) {
                            if (cellsPerRow[i] === undefined || cellsPerRow[i] < COLUMN_COUNT) {
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
                    for (let i = l; i < m; i++) {
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
                    const lengthA = available.length;
                    if (lengthA) {
                        const data = available[0];
                        if (data[0][1] === -1) {
                            PLACEMENT[colA] = 1;
                        }
                        else if (lengthA === m - l) {
                            if (lengthA > 1) {
                                found: {
                                    for (const outside of data) {
                                        for (let i = outside[0]; i < outside[1]; i++) {
                                            for (let j = 1; j < lengthA; j++) {
                                                const lengthB = available[j].length;
                                                for (let k = 0; k < lengthB; k++) {
                                                    const inside = available[j][k];
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
                const rowStart = placement[0] - 1;
                const rowSpan = placement[2] - placement[0];
                if (rowSpan > 1) {
                    for (let i = rowStart; i < rowStart + rowSpan; i++) {
                        mainData.rowSpanMultiple[i] = true;
                    }
                }
                item.data(EXT_NAME.CSS_GRID, 'cellData', <CssGridCellData> {
                    rowStart,
                    rowSpan,
                    columnStart: placement[1] - 1,
                    columnSpan: placement[3] - placement[1]
                });
                if (dense) {
                    rowInvalid = {};
                }
            }
        });
        if (rowData.length) {
            if (horizontal) {
                mainData.rowData = rowData;
            }
            else {
                const lengthB = rowData.length;
                for (let i = 0; i < lengthB; i++) {
                    const lengthC = rowData[i].length;
                    for (let j = 0; j < lengthC; j++) {
                        if (mainData.rowData[j] === undefined) {
                            mainData.rowData[j] = [];
                        }
                        mainData.rowData[j][i] = rowData[i][j];
                    }
                }
            }
            const unitTotal = mainData[horizontal ? 'row' : 'column'].unitTotal;
            const children = mainData.children;
            let columnCount = 0;
            for (const row of mainData.rowData) {
                const lengthC = row.length;
                columnCount = Math.max(lengthC, columnCount);
                for (let i = 0; i < lengthC; i++) {
                    const column = row[i];
                    if (unitTotal[i] === undefined) {
                        unitTotal[i] = 0;
                    }
                    if (column) {
                        let maxDimension = 0;
                        for (const item of column) {
                            if (!children.has(item)) {
                                maxDimension = Math.max(maxDimension, horizontal ? item.bounds.height : item.bounds.width);
                            }
                            children.add(item);
                        }
                        unitTotal[i] += maxDimension;
                    }
                }
            }
            if (children.size === node.length) {
                const rowCount = mainData.rowData.length;
                mainData.row.length = rowCount;
                mainData.column.length = columnCount;
                const modified = new Set<T>();
                const rowHeight = mainData.rowHeight;
                for (let i = 0; i < rowCount; i++) {
                    rowHeight.push(0);
                    const row = mainData.rowData[i];
                    for (let j = 0; j < columnCount; j++) {
                        const column = row[j] as T[];
                        if (column) {
                            for (const item of column) {
                                if (!modified.has(item)) {
                                    const cellData = <CssGridCellData> item.data(EXT_NAME.CSS_GRID, 'cellData');
                                    const x = j + cellData.columnSpan - 1;
                                    const y = i + cellData.rowSpan - 1;
                                    if (x < columnCount - 1) {
                                        item.modifyBox(BOX_STANDARD.MARGIN_RIGHT, mainData.column.gap);
                                    }
                                    if (y < rowCount - 1) {
                                        item.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, mainData.row.gap);
                                    }
                                    if (cellData.rowSpan === 1) {
                                        rowHeight[i] = Math.max(rowHeight[i], item.bounds.height);
                                    }
                                    modified.add(item);
                                }
                            }
                        }
                    }
                }
                const rowWeight = mainData.rowWeight;
                const lengthC = rowHeight.length;
                for (let i = 0; i < lengthC; i++) {
                    rowWeight[i] = rowHeight[i] / node.actualHeight;
                }
                node.retain(Array.from(children) as T[]);
                node.cssSort('zIndex');
                if (node.cssTry('display', 'block')) {
                    node.each((item: T) => {
                        const bounds = item.initial.bounds;
                        if (bounds) {
                            const rect = (<Element> item.element).getBoundingClientRect();
                            bounds.width = rect.width;
                            bounds.height = rect.height;
                        }
                    });
                    node.cssFinally('display');
                }
                node.data(EXT_NAME.CSS_GRID, STRING_BASE.EXT_DATA, mainData);
            }
        }
        return undefined;
    }
}