import { ExtensionResult } from '../@types/application';
import { VerticalAlignData } from '../@types/extension';

import Extension from '../extension';
import Node from '../node';
import NodeList from '../nodelist';

import { EXT_NAME } from '../lib/constant';
import { BOX_STANDARD } from '../lib/enumeration';

const $util = squared.lib.util;

export default class VerticalAlign<T extends Node> extends Extension<T> {
    public condition(node: T) {
        const nodes = node.filter(item => item.inlineVertical);
        return nodes.length > 1 && nodes.some(item => $util.convertInt(item.verticalAlign) !== 0) && NodeList.linearX(node.children);
    }

    public processNode(node: T): ExtensionResult<T> {
        const belowBaseline: T[] = [];
        const aboveBaseline: T[] = [];
        let minTop = Number.POSITIVE_INFINITY;
        node.each((item: T) => {
            if (item.inlineVertical && item.linear.top <= minTop) {
                if (item.linear.top < minTop) {
                    aboveBaseline.length = 0;
                }
                aboveBaseline.push(item);
                minTop = item.linear.top;
            }
        });
        if (node.every(item => item.positionStatic || item.positionRelative && item.length > 0)) {
            if (aboveBaseline.length !== node.length) {
                node.each((item: T) => {
                    let reset = false;
                    if (aboveBaseline.includes(item)) {
                        reset = true;
                    }
                    else if (item.inlineVertical && !item.baseline && $util.isLength(item.verticalAlign)) {
                        item.modifyBox(BOX_STANDARD.MARGIN_TOP, item.linear.top - aboveBaseline[0].linear.top);
                        belowBaseline.push(item);
                        reset = true;
                    }
                    if (reset) {
                        item.css('verticalAlign', '0px', true);
                    }
                });
            }
        }
        else {
            $util.spliceArray(aboveBaseline, item => !($util.isLength(item.verticalAlign) && $util.convertInt(item.verticalAlign) > 0));
        }
        if (aboveBaseline.length) {
            node.data(EXT_NAME.VERTICAL_ALIGN, 'mainData', <VerticalAlignData<T>> {
                aboveBaseline,
                belowBaseline
            });
        }
        return { output: '' };
    }

    public postProcedure(node: T) {
        const mainData: VerticalAlignData<T> = node.data(EXT_NAME.VERTICAL_ALIGN, 'mainData');
        if (mainData) {
            const baseline = node.find(item => item.baselineActive) as T;
            if (baseline) {
                baseline.modifyBox(BOX_STANDARD.MARGIN_TOP, baseline.linear.top - mainData.aboveBaseline[0].linear.top);
            }
            else {
                ([] as T[]).concat(mainData.belowBaseline, mainData.aboveBaseline).some(item => {
                    const verticalAlign = $util.convertInt(item.cssInitial('verticalAlign'));
                    if (verticalAlign > 0) {
                        item.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, verticalAlign);
                        return true;
                    }
                    return false;
                });
            }
        }
    }
}