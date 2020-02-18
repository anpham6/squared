import ExtensionUI from '../extension-ui';
import NodeUI from '../node-ui';

import { BOX_STANDARD } from '../lib/enumeration';

const $lib = squared.lib;

const { isLength } = $lib.css;
const { convertFloat } = $lib.util;

export default class VerticalAlign<T extends NodeUI> extends ExtensionUI<T> {
    public is(node: T) {
        return node.length > 0;
    }

    public condition(node: T) {
        let valid = false;
        let inlineVertical = 0;
        let sameValue = 0;
        for (const item of node) {
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
                inlineVertical++;
            }
            else {
                sameValue = NaN;
            }
        }
        return valid && isNaN(sameValue) && inlineVertical > 1 && NodeUI.linearData(node.children as T[]).linearX;
    }

    public processNode(node: T) {
        node.each((item: T) => {
            if (item.inlineVertical && isLength(item.verticalAlign) || item.imageElement || item.svgElement) {
                item.baselineAltered = true;
            }
        });
        this.subscribers.add(node);
        return undefined;
    }

    public postConstraints(node: T) {
        if (node.layoutHorizontal) {
            for (const children of (<T[][]> node.horizontalRows || [node.renderChildren])) {
                const aboveBaseline: T[] = [];
                let minTop = Number.POSITIVE_INFINITY;
                let baseline: Undef<T>;
                for (const item of children) {
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
                if (aboveBaseline.length) {
                    const above = aboveBaseline[0];
                    const top = above.linear.top;
                    for (const item of children) {
                        if (item !== baseline) {
                            if (item.inlineVertical) {
                                if (!aboveBaseline.includes(item)) {
                                    if (isLength(item.verticalAlign) || baseline === undefined) {
                                        item.modifyBox(BOX_STANDARD.MARGIN_TOP, item.linear.top - top);
                                        item.baselineAltered = true;
                                    }
                                }
                                else if ((item.imageElement || item.svgElement) && baseline?.documentId === item.alignSibling('baseline')) {
                                    item.modifyBox(BOX_STANDARD.MARGIN_TOP, baseline.linear.top - item.linear.top);
                                }
                            }
                            if (item.baselineAltered) {
                                item.css('verticalAlign', '0px', true);
                            }
                        }
                    }
                    if (baseline) {
                        baseline.modifyBox(BOX_STANDARD.MARGIN_TOP, baseline.linear.top - top + Math.min(0, above.parseUnit(above.cssInitial('verticalAlign'), 'height')));
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