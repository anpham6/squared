import ExtensionUI from '../extension-ui';

import { NODE_ALIGNMENT } from '../lib/enumeration';

type NodeUI = squared.base.NodeUI;

const { withinRange } = squared.lib.util;

function createDataAttribute(node: NodeUI, children: NodeUI[]): FlexboxData<NodeUI> {
    return {
        ...(node.flexdata as Required<FlexData>),
        rowCount: 0,
        columnCount: 0,
        children
    };
}

export default abstract class Flexbox<T extends NodeUI> extends ExtensionUI<T> {
    public is(node: T) {
        return node.flexElement;
    }

    public condition(node: T) {
        return node.length > 0;
    }

    public processNode(node: T) {
        const controller = this.controller;
        const [children, absolute] = node.partition((item: T) => item.pageFlow) as [T[], T[]];
        const mainData = createDataAttribute(node, children);
        if (node.cssTry('align-items', 'start')) {
            if (node.cssTry('justify-items', 'start')) {
                const length = children.length;
                let i = 0;
                while (i < length) {
                    const item = children[i++];
                    if (item.cssTry('align-self', 'start')) {
                        if (item.cssTry('justify-self', 'start')) {
                            const { width, height } = item.boundingClientRect;
                            item.data(this.name, 'boundsData', { ...item.bounds, width, height });
                            item.cssFinally('justify-self');
                        }
                        item.cssFinally('align-self');
                    }
                }
                node.cssFinally('justify-items');
            }
            node.cssFinally('align-items');
        }
        if (mainData.wrap) {
            const [align, sort, size, method] =
                mainData.row
                    ? ['top', 'left', 'right', 'intersectY']
                    : ['left', 'top', 'bottom', 'intersectX'];
            children.sort((a, b) => {
                const linearA = a.linear,  linearB = b.linear;
                if (!a[method](b.bounds, 'bounds')) {
                    return linearA[align] < linearB[align] ? -1 : 1;
                }
                else {
                    const posA = linearA[sort], posB = linearB[sort];
                    if (!withinRange(posA, posB)) {
                        return posA < posB ? -1 : 1;
                    }
                }
                return 0;
            });
            let rowStart = children[0];
            let row: T[] = [rowStart];
            const rows: T[][] = [row];
            let length = children.length;
            let i = 1;
            while (i < length) {
                const item = children[i++];
                if (rowStart[method](item.bounds, 'bounds')) {
                    row.push(item);
                }
                else {
                    rowStart = item;
                    row = [item];
                    rows.push(row);
                }
            }
            node.clear();
            let maxCount = 0;
            let offset: number;
            length = rows.length;
            i = 0;
            if (length > 1) {
                const boxSize: number = node.box[size];
                while (i < length) {
                    const seg = rows[i];
                    maxCount = Math.max(seg.length, maxCount);
                    const group = controller.createNodeGroup(seg[0], seg, node, { delegate: true, cascade: true });
                    group.addAlign(NODE_ALIGNMENT.SEGMENTED);
                    group.box[size] = boxSize;
                    group.containerIndex = i++;
                }
                offset = length;
            }
            else {
                const items = rows[0];
                node.retainAs(items);
                maxCount = items.length;
                while (i < maxCount) {
                    items[i].containerIndex = i++;
                }
                offset = maxCount;
            }
            i = 0;
            while (i < absolute.length) {
                absolute[i].containerIndex = offset + i++;
            }
            node.addAll(absolute);
            if (mainData.row) {
                mainData.rowCount = length;
                mainData.columnCount = maxCount;
            }
            else {
                mainData.rowCount = maxCount;
                mainData.columnCount = length;
            }
        }
        else {
            if (children.some(item => item.flexbox.order !== 0)) {
                const [c, d] =
                    mainData.reverse
                        ? [-1, 1]
                        : [1, -1];
                children.sort((a, b) => {
                    const orderA = a.flexbox.order, orderB = b.flexbox.order;
                    if (orderA === orderB) {
                        return 0;
                    }
                    return orderA > orderB ? c : d;
                });
            }
            else if (mainData.reverse) {
                children.reverse();
            }
            if (mainData.row) {
                mainData.rowCount = 1;
                mainData.columnCount = node.length;
            }
            else {
                mainData.rowCount = node.length;
                mainData.columnCount = 1;
            }
        }
        node.data(this.name, 'mainData', mainData);
        return undefined;
    }
}