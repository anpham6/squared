import ExtensionUI from '../extension-ui';
import NodeUI from '../node-ui';

import { BOX_STANDARD } from '../lib/enumeration';

const {
    css: $css,
    util: $util
} = squared.lib;

export default class VerticalAlign<T extends NodeUI> extends ExtensionUI<T> {
    public is() {
        return true;
    }

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
        return valid && inlineVertical > 1 && alignable === node.length && NodeUI.linearData(node.children as T[]).linearX;
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
                                item.css('verticalAlign', '0px', true);
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
            node.each((item: T) => item.baselineAltered = false);
        }
    }
}