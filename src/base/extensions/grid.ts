import { GridCellData } from '../../../@types/base/extension';

import ExtensionUI from '../extension-ui';
import NodeUI from '../node-ui';

import { EXT_NAME } from '../lib/constant';
import { BOX_STANDARD } from '../lib/enumeration';

const $lib = squared.lib;

const { aboveRange, belowRange, objectMap, safeNestedArray, withinRange } = $lib.util;

const GRID = EXT_NAME.GRID;

function getRowIndex(columns: NodeUI[][], target: NodeUI) {
    const topA = target.bounds.top;
    const length = columns.length;
    let i = 0;
    while (i < length) {
        const index = columns[i++].findIndex(item => {
            const top = item.bounds.top;
            return withinRange(topA, top) || Math.ceil(topA) >= top && topA < Math.floor(item.bounds.bottom);
        });
        if (index !== -1) {
            return index;
        }
    }
    return -1;
}

export default abstract class Grid<T extends NodeUI> extends ExtensionUI<T> {
    public static createDataCellAttribute(): GridCellData<NodeUI> {
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
            else if (node.percentWidth === 0 || !node.find(item => item.percentWidth > 0, { cascade: true })) {
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
        const nextMapX: ObjectIndex<T[]> = {};
        let columns: T[][] = [];
        node.each(row => {
            row.each((column: T) => {
                if (column.visible) {
                    safeNestedArray(nextMapX, Math.floor(column.linear.left)).push(column);
                }
            });
        });
        const nextCoordsX = Object.keys(nextMapX);
        const length = nextCoordsX.length;
        if (length) {
            let columnLength = -1;
            for (let i = 0; i < length; ++i) {
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
                columns = objectMap(nextCoordsX, value => nextMapX[value]);
            }
            else {
                const columnRight: number[] = [];
                for (let i = 0; i < length; ++i) {
                    const nextAxisX: T[] = nextMapX[nextCoordsX[i]];
                    const q = nextAxisX.length;
                    if (i === 0 && q === 0) {
                        return undefined;
                    }
                    columnRight[i] = i === 0 ? 0 : columnRight[i - 1];
                    for (let j = 0; j < q; ++j) {
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
                                columnLast.forEach(item => {
                                    const linear = item.linear;
                                    minLeft = Math.min(linear.left, minLeft);
                                    maxRight = Math.max(linear.right, maxRight);
                                });
                                if (Math.floor(left) > Math.ceil(minLeft) && Math.floor(right) > Math.ceil(maxRight)) {
                                    const index = getRowIndex(columns, nextX);
                                    if (index !== -1) {
                                        let k = columns.length - 1;
                                        while (k >= 0) {
                                            const row = columns[k--];
                                            if (row) {
                                                if (!row[index]) {
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
                const q = columnRight.length;
                for (let i = 0, j = -1; i < q; ++i) {
                    if (!columns[i]) {
                        if (j === -1) {
                            j = i - 1;
                        }
                        else if (i === q - 1) {
                            columnRight[j] = columnRight[i];
                        }
                    }
                    else if (j !== -1) {
                        columnRight[j] = columnRight[i - 1];
                        j = -1;
                    }
                }
                for (let i = 0; i < columns.length; ++i) {
                    if (columns[i]?.length) {
                        columnEnd.push(columnRight[i]);
                    }
                    else {
                        columns.splice(i--, 1);
                    }
                }
                const maxColumn = columns.reduce((a, b) => Math.max(a, b.length), 0);
                for (let l = 0; l < maxColumn; ++l) {
                    const s = columns.length;
                    let m = 0;
                    while (m < s) {
                        const row = columns[m++];
                        if (!row[l]) {
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
            for (let i = 0, count = 0; i < columnCount; ++i) {
                const column = columns[i];
                const rowCount = column.length;
                for (let j = 0, start = 0, spacer = 0; j < rowCount; ++j) {
                    const item = column[j];
                    const rowData = safeNestedArray(children, j);
                     if (!item['spacer']) {
                        const data: GridCellData<T> = Object.assign(Grid.createDataCellAttribute(), item.data(GRID, 'cellData'));
                        let rowSpan = 1;
                        let columnSpan = 1 + spacer;
                        let k = i + 1;
                        while (k < columnCount) {
                            const row = columns[k++][j] as any;
                            if (row.spacer === 1) {
                                columnSpan++;
                                row.spacer = 2;
                            }
                            else {
                                break;
                            }
                        }
                        if (columnSpan === 1) {
                            k = j + 1;
                            while (k < rowCount) {
                                const row = column[k++] as any;
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
                            (item.actualParent as T).naturalChildren.forEach((sibling: T) => {
                                if (!assigned.has(sibling) && sibling.visible && !sibling.rendered) {
                                    const { left, right } = sibling.linear;
                                    if (aboveRange(left, item.linear.right) && belowRange(right, columnEnd[l])) {
                                        safeNestedArray(data, 'siblings').push(sibling);
                                    }
                                }
                            });
                        }
                        data.rowSpan = rowSpan;
                        data.columnSpan = columnSpan;
                        data.rowStart = start++ === 0;
                        data.rowEnd = columnSpan + i === columnCount;
                        data.cellStart = count++ === 0;
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
            children.forEach(group => group.forEach(item => item.parent = node));
            if (node.tableElement && node.css('borderCollapse') === 'collapse') {
                node.resetBox(BOX_STANDARD.PADDING);
            }
            node.data(GRID, 'columnCount', columnCount);
        }
        return undefined;
    }
}