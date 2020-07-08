import ExtensionUI from '../extension-ui';
import NodeUI from '../node-ui';

import { BOX_STANDARD } from '../lib/enumeration';

export default class VerticalAlign<T extends NodeUI> extends ExtensionUI<T> {
    public is(node: T) {
        return node.length > 0 && !node.contentAltered;
    }

    public condition(node: T) {
        const children = node.children as T[];
        const length = children.length;
        let i = 0, j = 0, k = 0;
        while (i < length) {
            const item = children[i++];
            if (!item.inlineFlow || !(item.positionStatic || item.positionRelative && item.length > 0)) {
                return false;
            }
            else if (item.inlineVertical) {
                if (item.verticalAligned) {
                    ++k;
                }
                ++j;
            }
        }
        return j > 1 && k > 0 && NodeUI.linearData(children).linearX;
    }

    public processNode(node: T) {
        node.each((item: T) => {
            if (item.inlineVertical && node.verticalAligned || item.imageElement || item.svgElement) {
                item.baselineAltered = true;
            }
        });
        return { subscribe: true };
    }

    public postConstraints(node: T) {
        if (node.layoutHorizontal) {
            for (const children of node.horizontalRows as T[][] || [node.renderChildren]) {
                const aboveBaseline: T[] = [];
                let minTop = Infinity,
                    baseline: Undef<T>;
                const length = children.length;
                let i = 0;
                while (i < length) {
                    const item = children[i++];
                    const top = item.linear.top;
                    if (item.inlineVertical && top <= minTop) {
                        if (top < minTop) {
                            aboveBaseline.length = 0;
                        }
                        aboveBaseline.push(item);
                        minTop = top;
                    }
                    if (item.baselineActive) {
                        baseline = item;
                    }
                }
                if (aboveBaseline.length > 0) {
                    const above = aboveBaseline[0];
                    const top = above.linear.top;
                    i = 0;
                    while (i < length) {
                        const item = children[i++];
                        if (item !== baseline) {
                            if (item.inlineVertical) {
                                if (!aboveBaseline.includes(item)) {
                                    if (!baseline || item.verticalAligned) {
                                        item.setBox(BOX_STANDARD.MARGIN_TOP, { reset: 1, adjustment: item.linear.top - top });
                                        item.baselineAltered = true;
                                    }
                                }
                                else if (baseline && (item.imageElement || item.svgElement) && baseline.documentId === item.alignSibling('baseline')) {
                                    item.setBox(BOX_STANDARD.MARGIN_TOP, { reset: 1, adjustment: baseline.linear.top - item.linear.top });
                                    item.baselineAltered = true;
                                }
                            }
                            if (item.baselineAltered) {
                                item.setCacheValue('verticalAlign', '0px');
                            }
                        }
                    }
                    if (baseline) {
                        baseline.setBox(BOX_STANDARD.MARGIN_TOP, { reset: 1, adjustment: baseline.linear.top - top + Math.min(0, above.parseHeight(above.cssInitial('verticalAlign'))) });
                        baseline.baselineAltered = true;
                    }
                }
            }
        }
        else {
            node.each((item: T) => item.baselineAltered = false);
        }
    }
}