import { GridCellData } from '../../../@types/base/extension';

import ExtensionUI from '../extension-ui';
import NodeUI from '../node-ui';

import { EXT_NAME } from '../lib/constant';
import { BOX_STANDARD } from '../lib/enumeration';

const $lib = squared.lib;

const { aboveRange, belowRange, safeNestedArray, withinRange } = $lib.util;

const GRID = EXT_NAME.GRID;

function getRowIndex(columns: NodeUI[][], target: NodeUI) {
    const topA = target.bounds.top;
    for (const column of columns) {
        const index = column.findIndex(item => {
            const top = item.bounds.top;
            return withinRange(topA, top) || Math.ceil(topA) >= top && Math.floor(topA) <= item.linear.bottom;
        });
        if (index !== -1) {
            return index;
        }
    }
    return -1;
}

export default abstract class Grid<T extends NodeUI> extends ExtensionUI<T> {
    public static createDataCellAttribute<T extends NodeUI>(): GridCellData<T> {
        return {
            rowSpan: 0,
            columnSpan: 0,
            index: -1,
            cellStart: false,
            cellEnd: false,
            rowEnd: false,
            rowStart: false
        };
    }

    public condition(node: T) {
        if (node.length > 1 && !node.layoutElement && node.tagName !== 'TABLE' && !node.has('listStyle')) {
            if (node.display === 'table') {
                return node.every(item => item.display === 'table-row' && item.every(child => child.display === 'table-cell')) || node.every(item => item.display === 'table-cell');
            }
            else if (node.percentWidth === 0 || node.find(item => item.percentWidth > 0, { cascade: true }) === undefined) {
                let minLength = false;
                let itemCount = 0;
                for (const item of node) {
                    if (item.pageFlow && !item.visibleStyle.background && item.blockStatic && item.percentWidth === 0 && !item.autoMargin.leftRight && !item.autoMargin.left) {
                        if (item.length > 1) {
                            minLength = true;
                        }
                        if (item.display === 'list-item' && !item.has('listStyleType')) {
                            itemCount++;
                        }
                    }
                    else {
                        return false;
                    }
                }
                return itemCount === node.length || minLength && node.every(item => item.length > 0 && NodeUI.linearData(item.children as T[]).linearX);
            }
        }
        return false;
    }

    public processNode(node: T) {
        const columnEnd: number[] = [];
        const columns: T[][] = [];
        const nextMapX: ObjectIndex<T[]> = {};
        for (const row of node) {
            for (const column of row) {
                if ((column as T).visible) {
                    safeNestedArray(nextMapX, Math.floor(column.linear.left)).push(column as T);
                }
            }
        }
        const nextCoordsX = Object.keys(nextMapX);
        const length = nextCoordsX.length;
        if (length) {
            let columnLength = -1;
            for (let i = 0; i < length; i++) {
                const nextAxisX: T[] = nextMapX[nextCoordsX[i]];
                if (i === 0) {
                    columnLength = length;
                }
                else if (columnLength !== nextAxisX.length) {
                    columnLength = -1;
                    break;
                }
            }
            if (columnLength !== -1) {
                for (const value of nextCoordsX) {
                    columns.push(nextMapX[value]);
                }
            }
            else {
                const columnRight: number[] = [];
                for (let i = 0; i < length; i++) {
                    const nextAxisX: T[] = nextMapX[nextCoordsX[i]];
                    const q = nextAxisX.length;
                    if (i === 0 && q === 0) {
                        return undefined;
                    }
                    columnRight[i] = i === 0 ? 0 : columnRight[i - 1];
                    for (let j = 0; j < q; j++) {
                        const nextX = nextAxisX[j];
                        const { left, right } = nextX.linear;
                        if (i === 0 || aboveRange(left, columnRight[i - 1])) {
                            const row = safeNestedArray(columns, i);
                            if (i === 0 || columns[0].length === q) {
                                row[j] = nextX;
                            }
                            else {
                                const index = getRowIndex(columns, nextX);
                                if (index !== -1) {
                                    row[index] = nextX;
                                }
                                else {
                                    return undefined;
                                }
                            }
                        }
                        else {
                            const columnLast = columns[columns.length - 1];
                            if (columnLast) {
                                let minLeft = Number.POSITIVE_INFINITY;
                                let maxRight = Number.NEGATIVE_INFINITY;
                                for (const item of columnLast) {
                                    const linear = item.linear;
                                    minLeft = Math.min(linear.left, minLeft);
                                    maxRight = Math.max(linear.right, maxRight);
                                }
                                if (Math.floor(left) > Math.ceil(minLeft) && Math.floor(right) > Math.ceil(maxRight)) {
                                    const index = getRowIndex(columns, nextX);
                                    if (index !== -1) {
                                        for (let k = columns.length - 1; k >= 0; k--) {
                                            const row = columns[k];
                                            if (row) {
                                                if (row[index] === undefined) {
                                                    columnLast.length = 0;
                                                }
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        columnRight[i] = Math.max(right, columnRight[i]);
                    }
                }
                const r = columnRight.length;
                for (let i = 0, j = -1; i < r; i++) {
                    if (columns[i] === undefined) {
                        if (j === -1) {
                            j = i - 1;
                        }
                        else if (i === r - 1) {
                            columnRight[j] = columnRight[i];
                        }
                    }
                    else if (j !== -1) {
                        columnRight[j] = columnRight[i - 1];
                        j = -1;
                    }
                }
                for (let i = 0; i < columns.length; i++) {
                    if (columns[i]?.length) {
                        columnEnd.push(columnRight[i]);
                    }
                    else {
                        columns.splice(i--, 1);
                    }
                }
                const maxColumn = columns.reduce((a, b) => Math.max(a, b.length), 0);
                for (let l = 0; l < maxColumn; l++) {
                    const s = columns.length;
                    for (let m = 0; m < s; m++) {
                        const row = columns[m];
                        if (row[l] === undefined) {
                            row[l] = { spacer: 1 } as any;
                        }
                    }
                }
                columnEnd.push(node.box.right);
            }
        }
        const columnCount = columns.length;
        if (columnCount > 1 && columns[0].length === node.length) {
            const children: T[][] = [];
            const assigned = new Set<T>();
            for (let i = 0, count = 0; i < columnCount; i++) {
                const column = columns[i];
                let spacer = 0;
                for (let j = 0, start = 0; j < column.length; j++) {
                    const item = column[j];
                    const rowCount = column.length;
                    const rowData = safeNestedArray(children, j);
                     if (!item['spacer']) {
                        const data: GridCellData<T> = Object.assign(Grid.createDataCellAttribute(), item.data(GRID, 'cellData'));
                        let rowSpan = 1;
                        let columnSpan = 1 + spacer;
                        for (let k = i + 1; k < columnCount; k++) {
                            const row = columns[k][j] as any;
                            if (row.spacer === 1) {
                                columnSpan++;
                                row.spacer = 2;
                            }
                            else {
                                break;
                            }
                        }
                        if (columnSpan === 1) {
                            for (let k = j + 1; k < rowCount; k++) {
                                const row = column[k] as any;
                                if (row.spacer === 1) {
                                    rowSpan++;
                                    row.spacer = 2;
                                }
                                else {
                                    break;
                                }
                            }
                        }
                        if (columnEnd.length) {
                            const l = Math.min(i + (columnSpan - 1), columnEnd.length - 1);
                            for (const sibling of (item.actualParent as T).naturalChildren as T[]) {
                                if (!assigned.has(sibling) && sibling.visible && !sibling.rendered) {
                                    const { left, right } = sibling.linear;
                                    if (aboveRange(left, item.linear.right) && belowRange(right, columnEnd[l])) {
                                        safeNestedArray(data, 'siblings').push(sibling);
                                    }
                                }
                            }
                        }
                        data.rowSpan = rowSpan;
                        data.columnSpan = columnSpan;
                        data.rowStart = start++ === 0;
                        data.rowEnd = columnSpan + i === columnCount;
                        data.cellStart = count === 0;
                        data.cellEnd = data.rowEnd && j === rowCount - 1;
                        data.index = i;
                        spacer = 0;
                        item.data(GRID, 'cellData', data);
                        rowData.push(item);
                        assigned.add(item);
                    }
                    else if (item['spacer'] === 1) {
                        spacer++;
                    }
                }
            }
            node.each((item: T) => item.hide());
            node.clear();
            for (const group of children) {
                for (const item of group) {
                    item.parent = node;
                }
            }
            if (node.tableElement && node.css('borderCollapse') === 'collapse') {
                node.resetBox(BOX_STANDARD.PADDING);
            }
            node.data(GRID, 'columnCount', columnCount);
        }
        return undefined;
    }
}