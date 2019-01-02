import { ExtensionResult } from '../@types/application';
import { FlexboxData } from '../@types/extension';
import { InitialData } from '../@types/node';

import { EXT_NAME } from '../lib/constant';
import { NODE_ALIGNMENT } from '../lib/enumeration';

import Extension from '../extension';
import Node from '../node';
import NodeList from '../nodelist';

export default abstract class Flexbox<T extends Node> extends Extension<T> {
    public static createDataAttribute<T extends Node>(children: T[]): FlexboxData<T> {
        return {
            wrap: false,
            wrapReverse: false,
            directionReverse: false,
            justifyContent: '',
            rowDirection: false,
            rowCount: 0,
            columnDirection: false,
            columnCount: 0,
            children
        };
    }

    public condition(node: T) {
        return node.flexElement && node.length > 0;
    }

    public processNode(node: T): ExtensionResult<T> {
        const controller = this.application.controllerHandler;
        const pageFlow = node.children.filter(item => item.pageFlow) as T[];
        const flex = node.flexbox;
        const mainData = { ...Flexbox.createDataAttribute(pageFlow),
            wrap: flex.wrap.startsWith('wrap'),
            wrapReverse: flex.wrap === 'wrap-reverse',
            directionReverse: flex.direction.endsWith('reverse'),
            justifyContent: flex.justifyContent,
            rowDirection: flex.direction.startsWith('row'),
            columnDirection: flex.direction.startsWith('column')
        };
        if (node.cssTry('display', 'block')) {
            for (const item of pageFlow) {
                if (item.element) {
                    const bounds = item.element.getBoundingClientRect();
                    const initial: InitialData<T> = item.unsafe('initial');
                    Object.assign(initial.bounds, { width: bounds.width, height: bounds.height });
                }
            }
            node.cssFinally('display');
        }
        if (mainData.wrap) {
            function setDirection(align: string, sort: string, size: string) {
                const map = new Map<number, T[]>();
                pageFlow.sort((a, b) => {
                    if (a.linear[align] < b.linear[align]) {
                        return a.linear[align] < b.linear[align] ? -1 : 1;
                    }
                    else {
                        return a.linear[sort] < b.linear[sort] ? -1 : 1;
                    }
                });
                for (const item of pageFlow) {
                    const xy = Math.round(item.linear[align]);
                    const items: T[] = map.get(xy) || [];
                    items.push(item);
                    map.set(xy, items);
                }
                if (map.size) {
                    let maxCount = 0;
                    Array.from(map.values()).forEach((segment, index) => {
                        const group = controller.createNodeGroup(segment[0], segment, node);
                        group.siblingIndex = index;
                        const box = group.unsafe('box');
                        if (box) {
                            box[size] = node.box[size];
                        }
                        group.alignmentType |= NODE_ALIGNMENT.SEGMENTED;
                        maxCount = Math.max(segment.length, maxCount);
                    });
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
            }
            if (mainData.rowDirection) {
                setDirection(mainData.wrapReverse ? 'bottom' : 'top', 'left', 'right');
            }
            else {
                setDirection('left', 'top', 'bottom');
            }
        }
        else {
            if (pageFlow.some(item => item.flexbox.order !== 0)) {
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
        return { output: '' };
    }
}