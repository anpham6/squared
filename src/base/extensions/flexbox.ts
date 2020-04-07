import type { FlexboxData } from '../../../@types/base/extension';

import ExtensionUI from '../extension-ui';

import { EXT_NAME } from '../lib/constant';
import { NODE_ALIGNMENT } from '../lib/enumeration';

type NodeUI = squared.base.NodeUI;

const { withinRange } = squared.lib.util;

const FLEXBOX = EXT_NAME.FLEXBOX;

export default abstract class Flexbox<T extends NodeUI> extends ExtensionUI<T> {
    public static createDataAttribute<T extends NodeUI>(node: T, children: T[]): FlexboxData<T> {
        return {
            ...(<Required<FlexData>> node.flexdata),
            rowCount: 0,
            columnCount: 0,
            children
        };
    }

    public is(node: T) {
        return node.flexElement;
    }

    public condition(node: T) {
        return node.length > 0;
    }

    public processNode(node: T) {
        const controller = this.controller;
        const [children, absolute] = node.partition((item: T) => item.pageFlow) as [T[], T[]];
        const mainData = Flexbox.createDataAttribute(node, children);
        if (node.cssTry('align-items', 'start')) {
            if (node.cssTry('justify-items', 'start')) {
                children.forEach(item => {
                    if (item.cssTry('align-self', 'start')) {
                        if (item.cssTry('justify-self', 'start')) {
                            const { width, height } = item.boundingClientRect;
                            item.data(FLEXBOX, 'boundsData', { ...item.bounds, width, height });
                            item.cssFinally('justify-self');
                        }
                        item.cssFinally('align-self');
                    }
                });
                node.cssFinally('justify-items');
            }
            node.cssFinally('align-items');
        }
        if (mainData.wrap) {
            const [align, sort, size, method] = mainData.row ? ['top', 'left', 'right', 'intersectY'] : ['left', 'top', 'bottom', 'intersectX'];
            children.sort((a, b) => {
                const linearA = a.linear;
                const linearB = b.linear;
                if (!a[method](b.bounds, 'bounds')) {
                    return linearA[align] < linearB[align] ? -1 : 1;
                }
                else {
                    const posA = linearA[sort];
                    const posB = linearB[sort];
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
                    const group = controller.createNodeGroup(seg[0], seg, { parent: node, delegate: true, cascade: true });
                    group.addAlign(NODE_ALIGNMENT.SEGMENTED);
                    group.containerIndex = i++;
                    group.box[size] = boxSize;
                    maxCount = Math.max(seg.length, maxCount);
                }
                offset = length;
            }
            else {
                const item = rows[0];
                node.retain(item);
                maxCount = item.length;
                while (i < maxCount) {
                    item[i].containerIndex = i++;
                }
                offset = maxCount;
            }
            const q = absolute.length;
            i = 0;
            while (i < q) {
                absolute[i].containerIndex = offset + i++;
            }
            node.concat(absolute);
            node.sort();
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
                const [c, d] = mainData.reverse ? [-1, 1] : [1, -1];
                children.sort((a, b) => {
                    const orderA = a.flexbox.order;
                    const orderB = b.flexbox.order;
                    if (orderA === orderB) {
                        return 0;
                    }
                    return orderA > orderB ? c : d;
                });
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
        node.data(FLEXBOX, 'mainData', mainData);
        return undefined;
    }
}