import { FlexboxData } from '../../../@types/base/extension';

import ExtensionUI from '../extension-ui';
import NodeUI from '../node-ui';

import { EXT_NAME, STRING_BASE } from '../lib/constant';
import { NODE_ALIGNMENT } from '../lib/enumeration';

const {
    constant: $const,
    util: $util
} = squared.lib;

export default abstract class Flexbox<T extends NodeUI> extends ExtensionUI<T> {
    public static createDataAttribute<T extends NodeUI>(node: T, children: T[]): FlexboxData<T> {
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
        const [children, absolute] = node.partition((item: T) => item.pageFlow && !item.renderExclude) as [T[], T[]];
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
            let offset = 0;
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