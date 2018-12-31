import { ExtensionResult } from '../types/application';
import { GridCellData, GridData } from '../types/extension';

import { EXT_NAME } from '../lib/constant';
import { BOX_STANDARD } from '../lib/enumeration';

import Extension from '../extension';
import Node from '../node';
import NodeList from '../nodelist';

import $dom = squared.lib.dom;
import $util = squared.lib.util;

function getRowIndex<T extends Node>(columns: T[][], target: T) {
    for (const column of columns) {
        const index = column.findIndex(item => $util.withinFraction(target.linear.top, item.linear.top) || target.linear.top > item.linear.top && target.linear.top < item.linear.bottom);
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

    public readonly options = {
        columnBalanceEqual: false
    };

    public condition(node: T) {
        return node.length > 1 && !node.flexElement && !node.gridElement && !node.has('listStyle') && (
            node.every(item => item.pageFlow && !item.visibleStyle.background && (!item.inlineFlow || item.blockStatic)) && (
                node.some(item => item.length > 1) && node.every(item => item.length > 0 && NodeList.linearX(item.children)) ||
                node.every(item => item.display === 'list-item' && !item.has('listStyleType'))
            ) ||
            node.display === 'table' && node.every(item => item.display === 'table-row' && item.every(child => child.display === 'table-cell'))
        );
    }

    public processNode(node: T): ExtensionResult<T> {
        const columnEnd: number[] = [];
        const columnBalance = this.options.columnBalanceEqual;
        let columns: T[][] = [];
        if (columnBalance) {
            const dimensions: number[][] = [];
            node.each((item, index) => {
                dimensions[index] = [];
                item.each(child => dimensions[index].push(child.bounds.width));
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
                                const removed = columns[m].splice(assigned[m] + (every ? 2 : 1), columns[m].length - base.length);
                                columns[m][assigned[m] + (every ? 1 : 0)].data(EXT_NAME.GRID, 'cellData', { siblings: [...removed] });
                            }
                        }
                    }
                    if (found.length === columns.length) {
                        const minIndex = found.reduce((a, b) => Math.min(a, b));
                        maxIndex = found.reduce((a, b) => Math.max(a, b));
                        if (maxIndex > minIndex) {
                            for (let m = 0; m < columns.length; m++) {
                                if (found[m] > minIndex) {
                                    const removed = columns[m].splice(minIndex, found[m] - minIndex);
                                    columns[m][assigned[m] + (every ? 1 : 0)].data(EXT_NAME.GRID, 'cellData', { siblings: [...removed] });
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
                for (let l = 0; l < nextCoordsX.length; l++) {
                    const nextAxisX = nextMapX[nextCoordsX[l]];
                    if (l === 0 && nextAxisX.length === 0) {
                        return { output: '' };
                    }
                    columnRight[l] = l === 0 ? 0 : columnRight[l - 1];
                    for (let m = 0; m < nextAxisX.length; m++) {
                        const nextX = nextAxisX[m];
                        const [left, right] = [nextX.linear.left, nextX.linear.right];
                        if (l === 0 || left >= columnRight[l - 1]) {
                            if (columns[l] === undefined) {
                                columns[l] = [];
                            }
                            if (l === 0 || columns[0].length === nextAxisX.length) {
                                columns[l][m] = nextX;
                            }
                            else {
                                const index = getRowIndex(columns, nextX);
                                if (index !== -1) {
                                    columns[l][index] = nextX;
                                }
                                else {
                                    return { output: '' };
                                }
                            }
                        }
                        else {
                            const current = columns.length - 1;
                            if (columns[current]) {
                                const minLeft = $util.minArray(columns[current].map(item => item.linear.left));
                                const maxRight = $util.maxArray(columns[current].map(item => item.linear.right));
                                if (left > minLeft && right > maxRight) {
                                    const filtered = columns.filter(item => item);
                                    const index = getRowIndex(columns, nextX);
                                    if (index !== -1 && filtered[filtered.length - 1][index] === undefined) {
                                        columns[current].length = 0;
                                    }
                                }
                            }
                        }
                        columnRight[l] = Math.max(right, columnRight[l]);
                    }
                }
                for (let l = 0, m = -1; l < columnRight.length; l++) {
                    if (columns[l] === undefined) {
                        if (m === -1) {
                            m = l - 1;
                        }
                        else if (l === columnRight.length - 1) {
                            columnRight[m] = columnRight[l];
                        }
                    }
                    else if (m !== -1) {
                        columnRight[m] = columnRight[l - 1];
                        m = -1;
                    }
                }
                columns = columns.filter((item, index) => {
                    if (item && item.length > 0) {
                        columnEnd.push(columnRight[index]);
                        return true;
                    }
                    return false;
                });
                const columnMax = columns.reduce((a, b) => Math.max(a, b.length), 0);
                for (let l = 0; l < columnMax; l++) {
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
            const mainData = { ...Grid.createDataAttribute(), columnCount: columnBalance ? columns[0].length : columns.length };
            node.duplicate().forEach(item => node.remove(item) && item.hide());
            for (let l = 0, count = 0; l < columns.length; l++) {
                let spacer = 0;
                for (let m = 0, start = 0; m < columns[l].length; m++) {
                    const item = columns[l][m];
                    if (!(<any> item).spacer) {
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
                            const documentParent = <HTMLElement> item.documentParent.element;
                            data.siblings.push(
                                ...$util.flatMap(Array.from(documentParent.children), element => {
                                    const sibling = $dom.getElementAsNode<T>(element);
                                    return (
                                        sibling &&
                                        sibling.visible &&
                                        !sibling.rendered &&
                                        sibling.linear.left >= item.linear.right &&
                                        sibling.linear.right <= columnEnd[index] ? sibling : null
                                    );
                                }) as T[]
                            );
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
                    else if ((<any> item).spacer === 1) {
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
        return { output: '' };
    }
}