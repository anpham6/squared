import { GridCellData, GridData } from '../@types/extension';

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

    public condition(node: T) {
        if (node.length > 1 && !node.layoutElement && !node.has('listStyle')) {
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
        const columns: T[][] = [];
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
                            let minLeft = Number.POSITIVE_INFINITY;
                            let maxRight = Number.NEGATIVE_INFINITY;
                            columns[endIndex].forEach(item => {
                                minLeft = Math.min(minLeft, item.linear.left);
                                maxRight = Math.max(maxRight, item.linear.right);
                            });
                            if (nextX.linear.left > Math.ceil(minLeft) && nextX.linear.right > Math.ceil(maxRight)) {
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
        if (columns.length > 1 && columns[0].length === node.length) {
            const mainData = { ...Grid.createDataAttribute(), columnCount: columns.length };
            const children: T[][] = [];
            for (let i = 0, count = 0; i < columns.length; i++) {
                let spacer = 0;
                for (let j = 0, start = 0; j < columns[i].length; j++) {
                    const item = columns[i][j];
                    if (children[j] === undefined) {
                        children[j] = [];
                    }
                    if (!item['spacer']) {
                        const data: GridCellData<T> = Object.assign(Grid.createDataCellAttribute(), item.data(EXT_NAME.GRID, 'cellData'));
                        let rowSpan = 1;
                        let columnSpan = 1 + spacer;
                        for (let k = i + 1; k < columns.length; k++) {
                            if ((columns[k][j] as any).spacer === 1) {
                                columnSpan++;
                                (columns[k][j] as any).spacer = 2;
                            }
                            else {
                                break;
                            }
                        }
                        if (columnSpan === 1) {
                            for (let k = j + 1; k < columns[i].length; k++) {
                                if ((columns[i][k] as any).spacer === 1) {
                                    rowSpan++;
                                    (columns[i][k] as any).spacer = 2;
                                }
                                else {
                                    break;
                                }
                            }
                        }
                        const l = Math.min(i + (columnSpan - 1), columnEnd.length - 1);
                        const actualChildren = item.documentParent.actualChildren;
                        for (const sibling of actualChildren) {
                            if (sibling.visible && !sibling.rendered && sibling.linear.left >= item.linear.right && sibling.linear.right <= columnEnd[l]) {
                                data.siblings.push(sibling as T);
                            }
                        }
                        data.rowSpan = rowSpan;
                        data.columnSpan = columnSpan;
                        data.rowStart = start++ === 0;
                        data.rowEnd = columnSpan + i === columns.length;
                        data.cellStart = count === 0;
                        data.cellEnd = data.rowEnd && j === columns[i].length - 1;
                        data.index = i;
                        spacer = 0;
                        item.data(EXT_NAME.GRID, 'cellData', data);
                        children[j].push(item);
                    }
                    else if (item['spacer'] === 1) {
                        spacer++;
                    }
                }
            }
            for (const item of node) {
                item.hide();
            }
            node.clear();
            for (const group of children) {
                for (const item of group) {
                    item.parent = node;
                }
            }
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