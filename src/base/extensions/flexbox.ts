import { FlexboxData } from '../@types/extension';

import Extension from '../extension';
import Node from '../node';
import NodeList from '../nodelist';

import { EXT_NAME, STRING_BASE } from '../lib/constant';
import { NODE_ALIGNMENT } from '../lib/enumeration';

const $const = squared.lib.constant;
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
        if (node.cssTry('align-items', $const.CSS.START)) {
            if (node.cssTry('justify-items', $const.CSS.START)) {
                for (const item of children) {
                    const bounds = item.initial.bounds;
                    if (bounds && item.cssTry('align-self', $const.CSS.START)) {
                        if (item.cssTry('justify-self', $const.CSS.START)) {
                            if (item.cssTry('flex-grow', '0')) {
                                if (item.cssTry('flex-shrink', '1')) {
                                    const rect = (<Element> item.element).getBoundingClientRect();
                                    bounds.width = rect.width;
                                    bounds.height = rect.height;
                                    item.cssFinally('flex-shrink');
                                }
                                item.cssFinally('flex-grow');
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
                align = $const.CSS.TOP;
                sort = $const.CSS.LEFT;
                size = $const.CSS.RIGHT;
                method = 'intersectY';
            }
            else {
                align = $const.CSS.LEFT;
                sort = $const.CSS.TOP;
                size = $const.CSS.BOTTOM;
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
                    const group = controller.createNodeGroup(seg[0], seg, node, true);
                    group.siblingIndex = i;
                    node.sort(NodeList.siblingIndex);
                    const box = group.unsafe('box');
                    if (box) {
                        box[size] = node.box[size];
                    }
                    group.addAlign(NODE_ALIGNMENT.SEGMENTED);
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
        node.data(EXT_NAME.FLEXBOX, STRING_BASE.EXT_DATA, mainData);
        return undefined;
    }
}