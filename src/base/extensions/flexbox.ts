import { FlexboxData } from '../../../@types/base/extension';

import ExtensionUI from '../extension-ui';
import NodeUI from '../node-ui';

import { EXT_NAME } from '../lib/constant';
import { NODE_ALIGNMENT } from '../lib/enumeration';

const { assignRect } = squared.lib.dom;
const { withinRange } = squared.lib.util;

export default abstract class Flexbox<T extends NodeUI> extends ExtensionUI<T> {
    public static createDataAttribute<T extends NodeUI>(node: T, children: T[]): FlexboxData<T> {
        const wrap = node.css('flexWrap');
        const direction = node.css('flexDirection');
        const directionRow = direction.startsWith('row');
        return {
            directionRow,
            directionColumn: !directionRow,
            directionReverse: direction.endsWith('reverse'),
            wrap: wrap.startsWith('wrap'),
            wrapReverse: wrap === 'wrap-reverse',
            alignContent: node.css('alignContent'),
            justifyContent: node.css('justifyContent'),
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
        const [children, absolute] = node.partition((item: T) => item.pageFlow && !item.renderExclude) as [T[], T[]];
        const mainData = Flexbox.createDataAttribute(node, children);
        if (node.cssTry('align-items', 'start')) {
            if (node.cssTry('justify-items', 'start')) {
                for (const item of children) {
                    if (item.cssTry('align-self', 'start')) {
                        if (item.cssTry('justify-self', 'start')) {
                            const rect = item.boundingClientRect;
                            const bounds = item.initial.bounds;
                            if (bounds) {
                                bounds.width = rect.width;
                                bounds.height = rect.height;
                            }
                            else {
                                item.initial.bounds = assignRect(rect);
                            }
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
            let align: string;
            let sort: string;
            let size: string;
            let method: string;
            if (mainData.directionRow) {
                align = 'top';
                sort = 'left';
                size = 'right';
                method = 'intersectY';
            }
            else {
                align = 'left';
                sort = 'top';
                size = 'bottom';
                method = 'intersectX';
            }
            children.sort((a, b) => {
                const linearA = a.linear;
                const linearB = b.linear;
                if (!a[method](b.bounds, 'bounds')) {
                    return linearA[align] < linearB[align] ? -1 : 1;
                }
                else if (!withinRange(linearA[sort], linearB[sort])) {
                    return linearA[sort] < linearB[sort] ? -1 : 1;
                }
                return 0;
            });
            let rowStart = children[0];
            let row: T[] = [rowStart];
            const rows: T[][] = [row];
            let length = children.length;
            for (let i = 1; i < length; i++) {
                const item = children[i];
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
            if (length > 1) {
                const boxSize = node.box[size];
                for (let i = 0; i < length; i++) {
                    const seg = rows[i];
                    const group = controller.createNodeGroup(seg[0], seg, node, true);
                    group.containerIndex = i;
                    const box = group.unsafe('box');
                    if (box) {
                        box[size] = boxSize;
                    }
                    group.addAlign(NODE_ALIGNMENT.SEGMENTED);
                    maxCount = Math.max(seg.length, maxCount);
                }
                offset = length;
            }
            else {
                const item = rows[0];
                node.retain(item);
                for (let i = 0; i < item.length; i++) {
                    item[i].containerIndex = i;
                }
                maxCount = item.length;
                offset = maxCount;
            }
            for (let i = 0; i < absolute.length; i++) {
                absolute[i].containerIndex = offset + i;
            }
            node.concat(absolute);
            node.sort();
            if (mainData.directionRow) {
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
                const [c, d] = mainData.directionReverse ? [-1, 1] : [1, -1];
                children.sort((a, b) => {
                    const orderA = a.flexbox.order;
                    const orderB = b.flexbox.order;
                    if (orderA === orderB) {
                        return 0;
                    }
                    return orderA > orderB ? c : d;
                });
            }
            if (mainData.directionRow) {
                mainData.rowCount = 1;
                mainData.columnCount = node.length;
            }
            else {
                mainData.rowCount = node.length;
                mainData.columnCount = 1;
            }
        }
        node.data(EXT_NAME.FLEXBOX, 'mainData', mainData);
        return undefined;
    }
}