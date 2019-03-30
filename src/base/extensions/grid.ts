import { GridCellData, GridData, GridOptions } from '../@types/extension';

import Extension from '../extension';
import Node from '../node';
import NodeList from '../nodelist';

import { EXT_NAME } from '../lib/constant';
import { BOX_STANDARD } from '../lib/enumeration';

const $util = squared.lib.util;

function getRowIndex(columns: Node[][], target: Node) {
    for (const column of columns) {
        const index = column.findIndex(item => $util.withinRange(target.linear.top, item.linear.top) || target.linear.top > item.linear.top && target.linear.top < item.linear.bottom);
        if (index !== -1) {
            return index;
        }
    }
    return -1;
}

export default abstract class Grid<T extends Node> extends Extension<T> {
    public static createDataAttribute(): GridData {
        return {
            paddingTop: 0,
            paddingRight: 0,
            paddingBottom: 0,
            paddingLeft: 0,
            columnCount: 0
        };
    }

    public static createDataCellAttribute<T extends Node>(): GridCellData<T> {
        return {
            rowSpan: 0,
            columnSpan: 0,
            index: -1,
            cellStart: false,
            cellEnd: false,
            rowEnd: false,
            rowStart: false,
            siblings: []
        };
    }

    public readonly options: GridOptions = {
        columnBalanceEqual: false
    };

    public condition(node: T) {
        if (node.length > 1 && !node.flexElement && !node.gridElement && !node.has('listStyle')) {
            if (node.display === 'table') {
                return node.every(item => item.display === 'table-row' && item.every(child => child.display === 'table-cell'));
            }
            else {
                let multipleLength = 0;
                let listItemCount = 0;
                for (const item of node) {
                    if (item.pageFlow && !item.visibleStyle.background && item.blockStatic && !item.autoMargin.leftRight && !item.autoMargin.left) {
                        if (item.length > 1) {
                            multipleLength++;
                        }
                        if (item.display === 'list-item' && !item.has('listStyleType')) {
                            listItemCount++;
                        }
                    }
                    else {
                        return false;
                    }
                }
                if (listItemCount === node.length) {
                    return true;
                }
                else if (multipleLength > 0) {
                    return node.every(item => item.length > 0 && NodeList.linearData(item.children).linearX);
                }
            }
        }
        return false;
    }

    public processNode(node: T) {
        const columnEnd: number[] = [];
        const columnBalance = this.options.columnBalanceEqual;
        const columns: T[][] = [];
        if (columnBalance) {
            const dimensions: number[][] = [];
            node.each((item, index) => {
                dimensions[index] = [];
                item.each(child => dimensions[index].push(child.actualWidth));
                columns.push(item.duplicate() as T[]);
            });
            const base = columns[
                dimensions.findIndex(item => {
                    const column = dimensions.reduce((a, b) => {
                        if (a.length === b.length) {
                            const sumA = a.reduce((c, d) => c + d, 0);
                            const sumB = b.reduce((c, d) => c + d, 0);
                            return sumA < sumB ? a : b;
                        }
                        else {
                            return a.length < b.length ? a : b;
                        }
                    });
                    return item === column;
                })
            ];
            if (base && base.length > 1) {
                let maxIndex = -1;
                let assigned: number[] = [];
                let every = false;
                for (let l = 0; l < base.length; l++) {
                    const bounds = base[l].bounds;
                    const found: number[] = [];
                    if (l < base.length - 1) {
                        for (let m = 0; m < columns.length; m++) {
                            if (columns[m] === base) {
                                found.push(l);
                            }
                            else {
                                const result = columns[m].findIndex((item, index) => index >= l && Math.floor(item.bounds.width) === Math.floor(bounds.width) && index < columns[m].length - 1);
                                if (result !== -1) {
                                    found.push(result);
                                }
                                else {
                                    found.length = 0;
                                    break;
                                }
                            }
                        }
                    }
                    else {
                        for (let m = 0; m < columns.length; m++) {
                            if (columns[m].length > base.length) {
                                const siblings = columns[m].splice(assigned[m] + (every ? 2 : 1), columns[m].length - base.length);
                                columns[m][assigned[m] + (every ? 1 : 0)].data(EXT_NAME.GRID, 'cellData', { siblings });
                            }
                        }
                    }
                    if (found.length === columns.length) {
                        const minIndex = found.reduce((a, b) => Math.min(a, b));
                        maxIndex = found.reduce((a, b) => Math.max(a, b));
                        if (maxIndex > minIndex) {
                            for (let m = 0; m < columns.length; m++) {
                                if (found[m] > minIndex) {
                                    const siblings = columns[m].splice(minIndex, found[m] - minIndex);
                                    columns[m][assigned[m] + (every ? 1 : 0)].data(EXT_NAME.GRID, 'cellData', { siblings });
                                }
                            }
                        }
                        assigned = found;
                        every = true;
                    }
                    else {
                        assigned = new Array(columns.length).fill(l);
                        every = false;
                    }
                }
            }
            else {
                columns.length = 0;
            }
        }
        else {
            const nextMapX: ObjectIndex<T[]> = {};
            for (const item of node) {
                for (const subitem of item) {
                    const x = Math.floor(subitem.linear.left);
                    if (nextMapX[x] === undefined) {
                        nextMapX[x] = [];
                    }
                    nextMapX[x].push(subitem as T);
                }
            }
            const nextCoordsX = Object.keys(nextMapX);
            if (nextCoordsX.length) {
                const columnRight: number[] = [];
                for (let i = 0; i < nextCoordsX.length; i++) {
                    const nextAxisX = nextMapX[nextCoordsX[i]];
                    if (i === 0 && nextAxisX.length === 0) {
                        return undefined;
                    }
                    columnRight[i] = i === 0 ? 0 : columnRight[i - 1];
                    for (let j = 0; j < nextAxisX.length; j++) {
                        const nextX = nextAxisX[j];
                        if (i === 0 || nextX.linear.left >= columnRight[i - 1]) {
                            if (columns[i] === undefined) {
                                columns[i] = [];
                            }
                            if (i === 0 || columns[0].length === nextAxisX.length) {
                                columns[i][j] = nextX;
                            }
                            else {
                                const index = getRowIndex(columns, nextX);
                                if (index !== -1) {
                                    columns[i][index] = nextX;
                                }
                                else {
                                    return undefined;
                                }
                            }
                        }
                        else {
                            const endIndex = columns.length - 1;
                            if (columns[endIndex]) {
                                let minLeft = columns[endIndex][0].linear.left;
                                let maxRight = columns[endIndex][0].linear.right;
                                for (let k = 1; k < columns[endIndex].length; k++) {
                                    minLeft = Math.min(minLeft, columns[endIndex][k].linear.left);
                                    maxRight = Math.max(maxRight, columns[endIndex][k].linear.right);
                                }
                                if (nextX.linear.left > minLeft && nextX.linear.right > maxRight) {
                                    const index = getRowIndex(columns, nextX);
                                    if (index !== -1) {
                                        for (let k = columns.length - 1; k >= 0; k--) {
                                            if (columns[k]) {
                                                if (columns[k][index] === undefined) {
                                                    columns[endIndex].length = 0;
                                                }
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        columnRight[i] = Math.max(nextX.linear.right, columnRight[i]);
                    }
                }
                for (let i = 0, j = -1; i < columnRight.length; i++) {
                    if (columns[i] === undefined) {
                        if (j === -1) {
                            j = i - 1;
                        }
                        else if (i === columnRight.length - 1) {
                            columnRight[j] = columnRight[i];
                        }
                    }
                    else if (j !== -1) {
                        columnRight[j] = columnRight[i - 1];
                        j = -1;
                    }
                }
                for (let i = 0; i < columns.length; i++) {
                    if (columns[i] && columns[i].length) {
                        columnEnd.push(columnRight[i]);
                    }
                    else {
                        columns.splice(i--, 1);
                    }
                }
                const maxColumn = columns.reduce((a, b) => Math.max(a, b.length), 0);
                for (let l = 0; l < maxColumn; l++) {
                    for (let m = 0; m < columns.length; m++) {
                        if (columns[m][l] === undefined) {
                            columns[m][l] = { spacer: 1 } as any;
                        }
                    }
                }
            }
            columnEnd.push(node.box.right);
        }
        if (columns.length > 1 && columns[0].length === node.length) {
            for (const item of node) {
                item.hide();
            }
            node.clear();
            const mainData = { ...Grid.createDataAttribute(), columnCount: columnBalance ? columns[0].length : columns.length };
            for (let l = 0, count = 0; l < columns.length; l++) {
                let spacer = 0;
                for (let m = 0, start = 0; m < columns[l].length; m++) {
                    const item = columns[l][m];
                    if (!item['spacer']) {
                        item.parent = node;
                        const data: GridCellData<T> = Object.assign(Grid.createDataCellAttribute(), item.data(EXT_NAME.GRID, 'cellData'));
                        if (columnBalance) {
                            data.rowStart = m === 0;
                            data.rowEnd = m === columns[l].length - 1;
                            data.cellStart = l === 0 && m === 0;
                            data.cellEnd = l === columns.length - 1 && data.rowEnd;
                            data.index = m;
                        }
                        else {
                            let rowSpan = 1;
                            let columnSpan = 1 + spacer;
                            for (let n = l + 1; n < columns.length; n++) {
                                if ((columns[n][m] as any).spacer === 1) {
                                    columnSpan++;
                                    (columns[n][m] as any).spacer = 2;
                                }
                                else {
                                    break;
                                }
                            }
                            if (columnSpan === 1) {
                                for (let n = m + 1; n < columns[l].length; n++) {
                                    if ((columns[l][n] as any).spacer === 1) {
                                        rowSpan++;
                                        (columns[l][n] as any).spacer = 2;
                                    }
                                    else {
                                        break;
                                    }
                                }
                            }
                            const index = Math.min(l + (columnSpan - 1), columnEnd.length - 1);
                            const actualChildren = item.documentParent.actualChildren;
                            for (const sibling of actualChildren) {
                                if (sibling.visible && !sibling.rendered && sibling.linear.left >= item.linear.right && sibling.linear.right <= columnEnd[index]) {
                                    data.siblings.push(sibling as T);
                                }
                            }
                            data.rowSpan = rowSpan;
                            data.columnSpan = columnSpan;
                            data.rowStart = start++ === 0;
                            data.rowEnd = columnSpan + l === columns.length;
                            data.cellStart = count++ === 0;
                            data.cellEnd = data.rowEnd && m === columns[l].length - 1;
                            data.index = l;
                            spacer = 0;
                        }
                        item.data(EXT_NAME.GRID, 'cellData', data);
                    }
                    else if (item['spacer'] === 1) {
                        spacer++;
                    }
                }
            }
            $util.sortArray(node.children, true, 'documentParent.siblingIndex', 'siblingIndex');
            node.each((item, index) => item.siblingIndex = index);
            if (node.tableElement && node.css('borderCollapse') === 'collapse') {
                node.modifyBox(BOX_STANDARD.PADDING_TOP, null);
                node.modifyBox(BOX_STANDARD.PADDING_RIGHT, null);
                node.modifyBox(BOX_STANDARD.PADDING_BOTTOM, null);
                node.modifyBox(BOX_STANDARD.PADDING_LEFT, null);
            }
            node.data(EXT_NAME.GRID, 'mainData', mainData);
        }
        return undefined;
    }
}