import { FlexboxData } from '../@types/extension';

import Extension from '../extension';
import Node from '../node';
import NodeList from '../nodelist';

import { EXT_NAME } from '../lib/constant';
import { NODE_ALIGNMENT } from '../lib/enumeration';

const $util = squared.lib.util;

export default abstract class Flexbox<T extends Node> extends Extension<T> {
    public static createDataAttribute<T extends Node>(node: T, children: T[]): FlexboxData<T> {
        const wrap = node.css('flexWrap');
        const direction = node.css('flexDirection');
        return {
            directionRow: direction.startsWith('row'),
            directionColumn: direction.startsWith('column'),
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

    public condition(node: T) {
        return node.flexElement && node.length > 0;
    }

    public processNode(node: T) {
        const controller = this.application.controllerHandler;
        const children = node.filter(item => {
            if (item.pageFlow && item.pseudoElement && item.contentBoxWidth === 0 && item.css('content') === '""') {
                item.hide();
                return false;
            }
            return item.pageFlow;
        }) as T[];
        const mainData = Flexbox.createDataAttribute(node, children);
        if (node.cssTry('alignItems', 'start')) {
            if (node.cssTry('justifyItems', 'start')) {
                for (const item of children) {
                    const bounds = item.initial.bounds;
                    if (bounds && item.cssTry('alignSelf', 'start')) {
                        if (item.cssTry('justifySelf', 'start')) {
                            if (item.cssTry('flexGrow', '0')) {
                                if (item.cssTry('flexShrink', '1')) {
                                    const rect = (<Element> item.element).getBoundingClientRect();
                                    bounds.width = rect.width;
                                    bounds.height = rect.height;
                                    item.cssFinally('flexShrink');
                                }
                                item.cssFinally('flexGrow');
                            }
                            item.cssFinally('justifySelf');
                        }
                        item.cssFinally('alignSelf');
                    }
                }
                node.cssFinally('justifyItems');
            }
            node.cssFinally('alignItems');
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
                if (!a[method](b.bounds, 'bounds')) {
                    return a.linear[align] < b.linear[align] ? -1 : 1;
                }
                else if (!$util.withinRange(a.linear[sort], b.linear[sort])) {
                    return a.linear[sort] < b.linear[sort] ? -1 : 1;
                }
                return 0;
            });
            let row: T[] = [children[0]];
            let rowStart = children[0];
            const rows: T[][] = [row];
            for (let i = 1; i < children.length; i++) {
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
            if (rows.length > 1) {
                for (let i = 0; i < rows.length; i++) {
                    const seg = rows[i];
                    const group = controller.createNodeGroup(seg[0], seg, node);
                    group.siblingIndex = i;
                    node.sort(NodeList.siblingIndex);
                    const box = group.unsafe('box');
                    if (box) {
                        box[size] = node.box[size];
                    }
                    group.alignmentType |= NODE_ALIGNMENT.SEGMENTED;
                    maxCount = Math.max(seg.length, maxCount);
                }
            }
            else {
                maxCount = rows[0].length;
                node.retain(rows[0]);
            }
            if (mainData.directionRow) {
                mainData.rowCount = rows.length;
                mainData.columnCount = maxCount;
            }
            else {
                mainData.rowCount = maxCount;
                mainData.columnCount = rows.length;
            }
        }
        else {
            if (children.some(item => item.flexbox.order !== 0)) {
                const c = mainData.directionReverse ? -1 : 1;
                const d = mainData.directionReverse ? 1 : -1;
                children.sort((a, b) => {
                    if (a.flexbox.order === b.flexbox.order) {
                        return 0;
                    }
                    return a.flexbox.order > b.flexbox.order ? c : d;
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