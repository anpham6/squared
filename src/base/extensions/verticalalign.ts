import Extension from '../extension';
import Node from '../node';
import NodeList from '../nodelist';

import { BOX_STANDARD } from '../lib/enumeration';

const $const = squared.lib.constant;
const $css = squared.lib.css;
const $util = squared.lib.util;

export default class VerticalAlign<T extends Node> extends Extension<T> {
    public condition(node: T) {
        let valid = false;
        let alignable = 0;
        let inlineVertical = 0;
        for (const item of node) {
            if (item.inlineVertical) {
                inlineVertical++;
                if ($util.convertInt(item.verticalAlign) !== 0) {
                    valid = true;
                }
            }
            if (item.positionStatic || item.positionRelative && item.length) {
                alignable++;
            }
        }
        return valid && inlineVertical > 1 && alignable === node.length && NodeList.linearData(node.children).linearX;
    }

    public processNode(node: T) {
        node.each((item: T) => {
            if (item.inlineVertical && !item.baseline || item.imageElement) {
                item.baselineAltered = true;
            }
        });
        return { include: true };
    }

    public postConstraints(node: T) {
        if (node.layoutHorizontal) {
            for (const children of (<T[][]> node.horizontalRows || [node.renderChildren])) {
                const aboveBaseline: T[] = [];
                let minTop = Number.POSITIVE_INFINITY;
                let baseline: T | undefined;
                for (const item of children) {
                    if (item.inlineVertical && item.linear.top <= minTop) {
                        if (item.linear.top < minTop) {
                            aboveBaseline.length = 0;
                        }
                        aboveBaseline.push(item);
                        minTop = item.linear.top;
                    }
                    if (item.baselineActive) {
                        baseline = item;
                    }
                }
                if (aboveBaseline.length) {
                    const top = aboveBaseline[0].linear.top;
                    for (const item of children) {
                        if (item !== baseline) {
                            if (item.inlineVertical && !item.baseline && !aboveBaseline.includes(item)) {
                                let valid = false;
                                switch (item.verticalAlign) {
                                    case 'super':
                                    case 'sub':
                                        valid = true;
                                        break;
                                    default:
                                        if ($css.isLength(item.verticalAlign) || baseline === undefined) {
                                            valid = true;
                                        }
                                        break;
                                }
                                if (valid) {
                                    item.modifyBox(BOX_STANDARD.MARGIN_TOP, item.linear.top - top);
                                }
                            }
                            if (item.baselineAltered) {
                                item.css('verticalAlign', $const.CSS.PX_ZERO, true);
                            }
                        }
                    }
                    if (baseline) {
                        baseline.modifyBox(BOX_STANDARD.MARGIN_TOP, baseline.linear.top - top);
                        baseline.baselineAltered = true;
                    }
                }
            }
        }
        else {
            node.each(item => item.baselineAltered = false);
        }
    }
}