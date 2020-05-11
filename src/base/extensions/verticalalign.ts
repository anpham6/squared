import ExtensionUI from '../extension-ui';
import NodeUI from '../node-ui';

import { BOX_STANDARD } from '../lib/enumeration';

const { isLength } = squared.lib.css;
const { convertFloat } = squared.lib.util;

export default class VerticalAlign<T extends NodeUI> extends ExtensionUI<T> {
    public is(node: T) {
        return node.length > 0;
    }

    public condition(node: T) {
        let valid = false;
        let inlineVertical = 0;
        let sameValue = 0;
        const children = node.children as T[];
        const length = children.length;
        let i = 0;
        while (i < length) {
            const item = children[i++];
            if (!(item.positionStatic || item.positionRelative && item.length)) {
                return false;
            }
            else if (item.inlineVertical) {
                const value = convertFloat(item.verticalAlign);
                if (value !== 0) {
                    valid = true;
                }
                if (!isNaN(sameValue)) {
                    if (sameValue === 0) {
                        sameValue = value;
                    }
                    else if (sameValue !== value) {
                        sameValue = NaN;
                    }
                }
                ++inlineVertical;
            }
            else {
                sameValue = NaN;
            }
        }
        return valid && isNaN(sameValue) && inlineVertical > 1 && NodeUI.linearData(children).linearX;
    }

    public processNode(node: T) {
        node.each((item: T) => {
            if (item.inlineVertical && isLength(item.verticalAlign) || item.imageElement || item.svgElement) {
                item.baselineAltered = true;
            }
        });
        return { subscribe: true };
    }

    public postConstraints(node: T) {
        if (node.layoutHorizontal) {
            for (const children of (node.horizontalRows as T[][] || [node.renderChildren])) {
                const aboveBaseline: T[] = [];
                let minTop = Infinity;
                let baseline: Undef<T>;
                children.forEach(item => {
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
                });
                if (aboveBaseline.length) {
                    const above = aboveBaseline[0];
                    const top = above.linear.top;
                    children.forEach(item => {
                        if (item !== baseline) {
                            if (item.inlineVertical) {
                                if (!aboveBaseline.includes(item)) {
                                    if (isLength(item.verticalAlign) || !baseline) {
                                        item.setBox(BOX_STANDARD.MARGIN_TOP, { reset: 1, adjustment: item.linear.top - top });
                                        item.baselineAltered = true;
                                    }
                                }
                                else if (baseline && (item.imageElement || item.svgElement) && baseline.documentId === item.alignSibling('baseline')) {
                                    item.setBox(BOX_STANDARD.MARGIN_TOP, { reset: 1, adjustment: baseline.linear.top - item.linear.top });
                                }
                            }
                            if (item.baselineAltered) {
                                item.setCacheValue('verticalAlign', '0px');
                            }
                        }
                    });
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