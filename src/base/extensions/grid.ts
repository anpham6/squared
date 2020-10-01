import { BOX_STANDARD } from '../lib/constant';

import ExtensionUI from '../extension-ui';
import NodeUI from '../node-ui';

interface Node extends NodeUI {
    spacer?: number;
}

const { withinRange } = squared.lib.util;

function getRowIndex(columns: NodeUI[][], target: NodeUI) {
    const topA = target.bounds.top;
    for (let i = 0, length = columns.length; i < length; ++i) {
        const index = columns[i].findIndex(item => {
            if (!item) {
                return false;
            }
            const top = item.bounds.top;
            return withinRange(topA, top) || Math.ceil(topA) >= top && topA < Math.floor(item.bounds.bottom);
        });
        if (index !== -1) {
            return index;
        }
    }
    return -1;
}

function checkAlignment(node: NodeUI) {
    if (node.float !== 'right') {
        switch (node.css('verticalAlign')) {
            case 'baseline':
            case 'top':
            case 'middle':
            case 'bottom':
                return true;
            default:
                return node.floating;
        }
    }
    return false;
}

export default abstract class Grid<T extends NodeUI> extends ExtensionUI<T> {
    public static createDataCellAttribute<U extends NodeUI>(): GridCellData<U> {
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
        const size = node.size();
        if (size > 1 && !node.layoutElement && node.tagName !== 'TABLE' && !node.has('listStyle')) {
            if (node.display === 'table') {
                return node.every(item => item.display === 'table-row' && item.every(child => child.display === 'table-cell')) || node.every(item => item.display === 'table-cell');
            }
            else if (node.percentWidth === 0 || node.documentParent.hasWidth) {
                let itemCount = 0,
                    minLength = false;
                const children = node.children;
                for (let i = 0; i < size; ++i) {
                    const item = children[i];
                    if (item.blockStatic && !item.visibleStyle.background && (item.percentWidth === 0 || item.percentWidth === 1) && !item.autoMargin.leftRight && !item.autoMargin.left && item.pageFlow && !item.find((child: T) => !checkAlignment(child) || child.percentWidth > 0)) {
                        if (item.size() > 1) {
                            minLength = true;
                        }
                        if (item.display === 'list-item' && !item.has('listStyleType')) {
                            ++itemCount;
                        }
                    }
                    else {
                        return false;
                    }
                }
                return itemCount === size || minLength && node.every(item => !item.isEmpty() && NodeUI.linearData(item.children as T[]).linearX);
            }
        }
        return false;
    }

    public processNode(node: T) {
        const columnEnd: number[] = [];
        const nextMapX = new Map<number, T[]>();
        let columns: Undef<Node[][]>;
        node.each(row => {
            row.each((column: T) => {
                if (column.visible) {
                    const index = Math.floor(column.linear.left);
                    let mapX = nextMapX.get(index);
                    if (!mapX) {
                        mapX = [];
                        nextMapX.set(index, mapX);
                    }
                    mapX.push(column);
                }
            });
        });
        const length = nextMapX.size;
        if (length) {
            const mapValues = Array.from(nextMapX).sort((a, b) => a[0] - b[0]).map(item => item[1]);
            let columnLength = -1;
            for (let i = 0; i < length; ++i) {
                if (i === 0) {
                    columnLength = length;
                }
                else if (columnLength !== mapValues[i].length) {
                    columnLength = -1;
                    break;
                }
            }
            if (columnLength !== -1) {
                columns = mapValues;
            }
            else {
                columns = new Array(length);
                const columnRight: number[] = new Array(length);
                for (let i = 0; i < length; ++i) {
                    const nextAxisX: T[] = mapValues[i];
                    const q = nextAxisX.length;
                    if (i === 0) {
                        if (q === 0) {
                            return;
                        }
                        columnRight[0] = 0;
                    }
                    else {
                        columnRight[i] = columnRight[i - 1];
                    }
                    for (let j = 0; j < q; ++j) {
                        const nextX = nextAxisX[j];
                        const { left, right } = nextX.linear;
                        if (i === 0 || Math.ceil(left) >= Math.floor(columnRight[i - 1])) {
                            const row = columns[i] ||= [];
                            if (i === 0 || columns[0].length === q) {
                                row[j] = nextX;
                            }
                            else {
                                const index = getRowIndex(columns, nextX);
                                if (index !== -1) {
                                    row[index] = nextX;
                                }
                                else {
                                    return;
                                }
                            }
                        }
                        else {
                            const columnLast = columns[columns.length - 1];
                            if (columnLast) {
                                let minLeft = Infinity,
                                    maxRight = -Infinity;
                                for (let k = 0, r = columnLast.length; k < r; ++k) {
                                    const linear = columnLast[k].linear;
                                    minLeft = Math.min(linear.left, minLeft);
                                    maxRight = Math.max(linear.right, maxRight);
                                }
                                if (Math.floor(left) > Math.ceil(minLeft) && Math.floor(right) > Math.ceil(maxRight)) {
                                    const index = getRowIndex(columns, nextX);
                                    if (index !== -1) {
                                        for (let k = columns.length - 1; k >= 0; --k) {
                                            const row = columns[k];
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
                for (let i = 0, j = -1, q = columnRight.length; i < q; ++i) {
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
                for (let l = 0, q = columns.reduce((a, b) => Math.max(a, b.length), 0); l < q; ++l) {
                    for (let m = 0, r = columns.length; m < r; ++m) {
                        const row = columns[m];
                        if (!row[l]) {
                            row[l] = { spacer: 1 } as Node;
                        }
                    }
                }
                columnEnd.push(node.box.right);
            }
        }
        else {
            return;
        }
        const columnCount = columns.length;
        if (columnCount > 1 && columns[0].length === node.size()) {
            const rows: Node[][] = [];
            const assigned = new WeakSet<Node>();
            for (let i = 0, count = 0; i < columnCount; ++i) {
                const column = columns[i];
                const rowCount = column.length;
                for (let j = 0, start = 0, spacer = 0; j < rowCount; ++j) {
                    const item = column[j];
                    const rowData = rows[j] ||= [];
                    if (!item.spacer) {
                        const cellData: GridCellData<T> = Object.assign(Grid.createDataCellAttribute<T>(), this.data.get(item as T));
                        let rowSpan = 1,
                            columnSpan = 1 + spacer;
                        for (let k = i + 1; k < columnCount; ++k) {
                            const row = columns[k][j];
                            if (row.spacer === 1) {
                                ++columnSpan;
                                row.spacer = 2;
                            }
                            else {
                                break;
                            }
                        }
                        if (columnSpan === 1) {
                            for (let k = j + 1; k < rowCount; ++k) {
                                const row = column[k];
                                if (row.spacer === 1) {
                                    ++rowSpan;
                                    row.spacer = 2;
                                }
                                else {
                                    break;
                                }
                            }
                        }
                        if (columnEnd.length) {
                            const index = Math.min(i + (columnSpan - 1), columnEnd.length - 1);
                            const children = item.actualParent!.naturalChildren as T[];
                            for (let k = 0, q = children.length; k < q; ++k) {
                                const sibling = children[k];
                                if (!assigned.has(sibling) && !sibling.excluded && sibling.withinX({ left: item.linear.right, right: columnEnd[index] } as BoxRectDimension, { dimension: 'linear' })) {
                                    (cellData.siblings ||= []).push(sibling);
                                }
                            }
                        }
                        cellData.rowSpan = rowSpan;
                        cellData.columnSpan = columnSpan;
                        cellData.rowStart = start++ === 0;
                        cellData.rowEnd = columnSpan + i === columnCount;
                        cellData.cellStart = count++ === 0;
                        cellData.cellEnd = cellData.rowEnd && j === rowCount - 1;
                        cellData.index = i;
                        this.data.set(item as T, cellData);
                        rowData.push(item);
                        assigned.add(item);
                        spacer = 0;
                    }
                    else if (item.spacer === 1) {
                        ++spacer;
                    }
                }
            }
            node.each((item: T) => item.hide());
            node.clear();
            for (let i = 0, q = rows.length; i < q; ++i) {
                const children = rows[i];
                for (let j = 0, r = children.length; j < r; ++j) {
                    children[j].parent = node;
                }
            }
            if (node.tableElement && node.valueOf('borderCollapse') === 'collapse') {
                node.resetBox(BOX_STANDARD.PADDING);
            }
            this.data.set(node, columnCount);
        }
    }
}