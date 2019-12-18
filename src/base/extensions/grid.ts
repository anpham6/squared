import { GridCellData } from '../../../@types/base/extension';

import ExtensionUI from '../extension-ui';
import NodeUI from '../node-ui';

import { EXT_NAME } from '../lib/constant';
import { BOX_STANDARD } from '../lib/enumeration';

const $lib = squared.lib;
const { formatPX, isLength, isPercent } = $lib.css;
const { aboveRange, belowRange, withinRange } = $lib.util;

const GRID = EXT_NAME.GRID;

function getRowIndex(columns: NodeUI[][], target: NodeUI) {
    const topA = target.linear.top;
    for (const column of columns) {
        const index = column.findIndex(item => {
            const top = item.linear.top;
            return withinRange(topA, top) || topA > top && topA < item.linear.bottom;
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
            rowStart: false,
            block: false
        };
    }

    public condition(node: T) {
        if (node.length > 1 && !node.layoutElement && !node.has('listStyle')) {
            if (node.display === 'table') {
                return node.every(item => item.display === 'table-row' && item.every(child => child.display === 'table-cell')) || node.every(item => item.display === 'table-cell');
            }
            else {
                let length = 0;
                let itemCount = 0;
                for (const item of node) {
                    if (item.pageFlow && !item.visibleStyle.background && item.blockStatic && !item.autoMargin.leftRight && !item.autoMargin.left) {
                        if (item.length > 1) {
                            length++;
                        }
                        if (item.display === 'list-item' && !item.has('listStyleType')) {
                            itemCount++;
                        }
                    }
                    else {
                        return false;
                    }
                }
                if (itemCount === node.length) {
                    return true;
                }
                else if (length > 0) {
                    return node.every(item => item.length > 0 && NodeUI.linearData(item.children as T[]).linearX);
                }
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
                    const x = Math.floor(column.linear.left);
                    if (nextMapX[x] === undefined) {
                        nextMapX[x] = [];
                    }
                    nextMapX[x].push(column as T);
                }
            }
        }
        const nextCoordsX = Object.keys(nextMapX);
        const lengthA = nextCoordsX.length;
        if (lengthA > 0) {
            let columnLength = -1;
            for (let i = 0; i < lengthA; i++) {
                const nextAxisX: T[] = nextMapX[nextCoordsX[i]];
                if (i === 0) {
                    columnLength = lengthA;
                }
                else if (columnLength !== nextAxisX.length) {
                    columnLength = -1;
                    break;
                }
            }
            if (columnLength !== -1) {
                for (let i = 0; i < lengthA; i++) {
                    columns.push(nextMapX[nextCoordsX[i]]);
                }
            }
            else {
                const columnRight: number[] = [];
                for (let i = 0; i < lengthA; i++) {
                    const nextAxisX: T[] = nextMapX[nextCoordsX[i]];
                    const lengthB = nextAxisX.length;
                    if (i === 0 && lengthB === 0) {
                        return undefined;
                    }
                    columnRight[i] = i === 0 ? 0 : columnRight[i - 1];
                    for (let j = 0; j < lengthB; j++) {
                        const nextX = nextAxisX[j];
                        const { left, right } = nextX.linear;
                        if (i === 0 || aboveRange(left, columnRight[i - 1])) {
                            if (columns[i] === undefined) {
                                columns[i] = [];
                            }
                            if (i === 0 || columns[0].length === lengthB) {
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
                                    const { left: leftA, right: rightA } = item.linear;
                                    if (leftA < minLeft) {
                                        minLeft = leftA;
                                    }
                                    if (rightA > maxRight) {
                                        maxRight = rightA;
                                    }
                                });
                                if (Math.floor(left) > Math.ceil(minLeft) && Math.floor(right) > Math.ceil(maxRight)) {
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
                        columnRight[i] = Math.max(right, columnRight[i]);
                    }
                }
                const lengthC = columnRight.length;
                for (let i = 0, j = -1; i < lengthC; i++) {
                    if (columns[i] === undefined) {
                        if (j === -1) {
                            j = i - 1;
                        }
                        else if (i === lengthC - 1) {
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
                    const lengthD = columns.length;
                    for (let m = 0; m < lengthD; m++) {
                        if (columns[m][l] === undefined) {
                            columns[m][l] = { spacer: 1 } as any;
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
                let spacer = 0;
                const column = columns[i];
                for (let j = 0, start = 0; j < column.length; j++) {
                    const item = column[j];
                    const rowCount = column.length;
                    if (children[j] === undefined) {
                        children[j] = [];
                    }
                    if (!item['spacer']) {
                        const data: GridCellData<T> = Object.assign(Grid.createDataCellAttribute(), item.data(GRID, 'cellData'));
                        let rowSpan = 1;
                        let columnSpan = 1 + spacer;
                        for (let k = i + 1; k < columnCount; k++) {
                            if ((columns[k][j] as any).spacer === 1) {
                                columnSpan++;
                                (columns[k][j] as any).spacer = 2;
                            }
                            else {
                                break;
                            }
                        }
                        if (columnSpan === 1) {
                            for (let k = j + 1; k < rowCount; k++) {
                                if ((column[k] as any).spacer === 1) {
                                    rowSpan++;
                                    (column[k] as any).spacer = 2;
                                }
                                else {
                                    break;
                                }
                            }
                        }
                        if (columnEnd.length) {
                            const l = Math.min(i + (columnSpan - 1), columnEnd.length - 1);
                            for (const sibling of item.documentParent.naturalChildren as T[]) {
                                if (!assigned.has(sibling) && sibling.visible && !sibling.rendered) {
                                    const linear = sibling.linear;
                                    if (aboveRange(linear.left, item.linear.right) && belowRange(linear.right, columnEnd[l])) {
                                        if (data.siblings === undefined) {
                                            data.siblings = [];
                                        }
                                        data.siblings.push(sibling);
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
                        children[j].push(item);
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
                let hasLength = true;
                let hasPercent = false;
                for (const item of group) {
                    const width = item.css('width');
                    if (isPercent(width)) {
                        hasPercent = true;
                    }
                    else if (!isLength(width)) {
                        hasLength = false;
                        break;
                    }
                }
                if (hasLength && hasPercent && group.length > 1) {
                    const cellData: GridCellData<T> = group[0].data(GRID, 'cellData');
                    if (cellData?.rowSpan === 1) {
                        let siblings: T[] = cellData.siblings ? cellData.siblings.slice(0) : [];
                        const length = group.length;
                        for (let i = 1; i < length; i++) {
                            const item = group[i];
                            const siblingData: GridCellData<T> = item.data(GRID, 'cellData');
                            if (siblingData?.rowSpan === 1) {
                                siblings.push(item);
                                if (siblingData.siblings) {
                                    siblings = siblings.concat(siblingData.siblings);
                                }
                            }
                            else {
                                siblings.length = 0;
                                break;
                            }
                        }
                        if (siblings.length) {
                            cellData.block = true;
                            cellData.columnSpan = columnCount;
                            cellData.siblings = siblings;
                            group.length = 1;
                        }
                    }
                }
                for (const item of group) {
                    item.parent = node;
                    if (!hasLength && item.percentWidth) {
                        item.css('width', formatPX(item.bounds.width));
                    }
                }
            }
            if (node.tableElement && node.css('borderCollapse') === 'collapse') {
                node.modifyBox(BOX_STANDARD.PADDING_TOP);
                node.modifyBox(BOX_STANDARD.PADDING_RIGHT);
                node.modifyBox(BOX_STANDARD.PADDING_BOTTOM);
                node.modifyBox(BOX_STANDARD.PADDING_LEFT);
            }
            node.data(GRID, 'columnCount', columnCount);
        }
        return undefined;
    }
}