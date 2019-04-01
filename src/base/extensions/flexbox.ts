import { FlexboxData } from '../@types/extension';
import { InitialData } from '../@types/node';

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
            wrap: wrap.startsWith('wrap'),
            wrapReverse: wrap === 'wrap-reverse',
            directionReverse: direction.endsWith('reverse'),
            alignContent: node.css('alignContent'),
            justifyContent: node.css('justifyContent'),
            rowDirection: direction.startsWith('row'),
            rowCount: 0,
            columnDirection: direction.startsWith('column'),
            columnCount: 0,
            children
        };
    }

    public condition(node: T) {
        return node.flexElement && node.length > 0;
    }

    public processNode(node: T) {
        const controller = this.application.controllerHandler;
        const children = node.filter(item => item.pageFlow) as T[];
        const mainData = Flexbox.createDataAttribute(node, children);
        for (const item of children) {
            if (item.element && item.cssTry('alignSelf', 'start')) {
                const bounds = item.element.getBoundingClientRect();
                const initial: InitialData<T> = item.unsafe('initial');
                Object.assign(initial.bounds, { width: bounds.width, height: bounds.height });
                item.cssFinally('alignSelf');
            }
        }
        if (mainData.wrap) {
            function setDirection(align: string, sort: string, size: string) {
                const map = new Map<number, T[]>();
                children.sort((a, b) => {
                    if (!$util.withinRange(a.linear[align], b.linear[align])) {
                        return a.linear[align] < b.linear[align] ? -1 : 1;
                    }
                    else if (!$util.withinRange(a.linear[sort], b.linear[sort])) {
                        return a.linear[sort] < b.linear[sort] ? -1 : 1;
                    }
                    return 0;
                });
                for (const item of children) {
                    const point = Math.round(item.linear[align]);
                    const items: T[] = map.get(point) || [];
                    items.push(item);
                    map.set(point, items);
                }
                let maxCount = 0;
                let i = 0;
                node.clear();
                for (const seg of map.values()) {
                    const group = controller.createNodeGroup(seg[0], seg, node);
                    group.siblingIndex = i++;
                    const box = group.unsafe('box');
                    if (box) {
                        box[size] = node.box[size];
                    }
                    group.alignmentType |= NODE_ALIGNMENT.SEGMENTED;
                    maxCount = Math.max(seg.length, maxCount);
                }
                node.sort(NodeList.siblingIndex);
                if (mainData.rowDirection) {
                    mainData.rowCount = map.size;
                    mainData.columnCount = maxCount;
                }
                else {
                    mainData.rowCount = maxCount;
                    mainData.columnCount = map.size;
                }
            }
            if (mainData.rowDirection) {
                setDirection(mainData.wrapReverse ? 'bottom' : 'top', 'left', 'right');
            }
            else {
                setDirection('left', 'top', 'bottom');
            }
        }
        else {
            if (children.some(item => item.flexbox.order !== 0)) {
                if (mainData.directionReverse) {
                    node.sort((a, b) => a.flexbox.order <= b.flexbox.order ? 1 : -1);
                }
                else {
                    node.sort((a, b) => a.flexbox.order >= b.flexbox.order ? 1 : -1);
                }
            }
            if (mainData.rowDirection) {
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