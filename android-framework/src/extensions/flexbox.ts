import { FlexboxData } from '../../../src/base/@types/extension';
import { InitialData } from '../../../src/base/@types/node';

import Controller from '../controller';
import View from '../view';

import { AXIS_ANDROID } from '../lib/constant';
import { CONTAINER_NODE } from '../lib/enumeration';

import $Layout = squared.base.Layout;
import $NodeList = squared.base.NodeList;

const $const = squared.base.lib.constant;
const $enum = squared.base.lib.enumeration;
const $util = squared.lib.util;

const CHAIN_MAP = {
    leftTop: ['left', 'top'],
    rightBottom: ['right', 'bottom'],
    rightLeftBottomTop: ['rightLeft', 'bottomTop'],
    leftRightTopBottom: ['leftRight', 'topBottom'],
    widthHeight: ['Width', 'Height'],
    horizontalVertical: ['Horizontal', 'Vertical']
};

export default class <T extends View> extends squared.base.extensions.Flexbox<T> {
    public processNode(node: T, parent: T) {
        super.processNode(node, parent);
        const mainData: FlexboxData<T> = node.data($const.EXT_NAME.FLEXBOX, 'mainData');
        const layout = new $Layout(
            parent,
            node,
            0,
            $enum.NODE_ALIGNMENT.AUTO_LAYOUT
        );
        layout.itemCount = node.length;
        layout.rowCount = mainData.rowCount;
        layout.columnCount = mainData.columnCount;
        if (node.find(item => !item.pageFlow) !== undefined || mainData.rowDirection && (mainData.rowCount === 1 || node.hasHeight) || mainData.columnDirection && mainData.columnCount === 1) {
            layout.containerType = CONTAINER_NODE.CONSTRAINT;
        }
        else {
            layout.setType(CONTAINER_NODE.LINEAR, mainData.columnDirection ? $enum.NODE_ALIGNMENT.HORIZONTAL : $enum.NODE_ALIGNMENT.VERTICAL);
        }
        return {
            output: this.application.renderNode(layout),
            complete: true
        };
    }

    public processChild(node: T, parent: T) {
        if (node.hasAlign($enum.NODE_ALIGNMENT.SEGMENTED)) {
            return {
                output: this.application.renderNode(
                    new $Layout(
                        parent,
                        node,
                        CONTAINER_NODE.CONSTRAINT,
                        $enum.NODE_ALIGNMENT.AUTO_LAYOUT,
                        node.children as T[]
                    )
                ),
                complete: true
            };
        }
        return undefined;
    }

    public postBaseLayout(node: T) {
        const mainData: FlexboxData<T> = node.data($const.EXT_NAME.FLEXBOX, 'mainData');
        if (mainData) {
            const chainHorizontal: T[][] = [];
            const chainVertical: T[][] = [];
            const basicHorizontal: T[] = [];
            const basicVertical: T[] = [];
            if (mainData.wrap) {
                let previous: T[] | undefined;
                node.each((item: T) => {
                    if (item.hasAlign($enum.NODE_ALIGNMENT.SEGMENTED)) {
                        const pageFlow = item.renderFilter(child => child.pageFlow) as T[];
                        if (mainData.rowDirection) {
                            item.android('layout_width', 'match_parent');
                            if (node.hasHeight) {
                                item.android('layout_height', '0px');
                                item.app('layout_constraintVertical_weight', '1');
                            }
                            chainHorizontal.push(pageFlow);
                            basicVertical.push(item);
                        }
                        else {
                            item.android('layout_height', 'match_parent');
                            chainVertical.push(pageFlow);
                            if (previous) {
                                let largest = previous[0];
                                for (let j = 1; j < previous.length; j++) {
                                    if (previous[j].linear.right > largest.linear.right) {
                                        largest = previous[j];
                                    }
                                }
                                const offset = item.linear.left - largest.actualRight();
                                if (offset > 0) {
                                    item.modifyBox($enum.BOX_STANDARD.MARGIN_LEFT, offset);
                                }
                                item.constraint.horizontal = true;
                            }
                            basicHorizontal.push(item);
                            previous = pageFlow;
                        }
                    }
                });
                if (node.is(CONTAINER_NODE.LINEAR)) {
                    if (mainData.columnDirection && mainData.wrapReverse) {
                        node.mergeGravity('gravity', 'right');
                    }
                }
                else {
                    if (basicVertical.length) {
                        chainVertical.push(basicVertical);
                    }
                    if (basicHorizontal.length) {
                        chainHorizontal.push(basicHorizontal);
                    }
                }
            }
            else {
                if (mainData.rowDirection) {
                    if (mainData.directionReverse) {
                        chainHorizontal[0] = mainData.children.reverse();
                    }
                    else {
                        chainHorizontal[0] = mainData.children;
                    }
                }
                else {
                    if (!node.hasHeight) {
                        node.android('layout_height', 'match_parent');
                    }
                    if (mainData.directionReverse) {
                        chainVertical[0] = mainData.children.reverse();
                    }
                    else {
                        chainVertical[0] = mainData.children;
                    }
                }
            }
            [chainHorizontal, chainVertical].forEach((partition, index) => {
                const horizontal = index === 0;
                const inverse = horizontal ? 1 : 0;
                for (let i = 0; i < partition.length; i++) {
                    const seg = partition[i];
                    const chainStart = seg[0];
                    const chainEnd = seg[seg.length - 1];
                    const HV = CHAIN_MAP.horizontalVertical[index];
                    const HW = CHAIN_MAP.widthHeight[inverse];
                    const LT = CHAIN_MAP.leftTop[index];
                    const TL = CHAIN_MAP.leftTop[inverse];
                    const RB = CHAIN_MAP.rightBottom[index];
                    const BR = CHAIN_MAP.rightBottom[inverse];
                    const HWL = HW.toLowerCase();
                    const justifyContent = seg.every(item => item.flexbox.grow < 1);
                    const spreadInside = justifyContent && (mainData.justifyContent === 'space-between' || mainData.justifyContent === 'space-around' && seg.length > 1) || seg.length > 1 && (horizontal && $util.withinRange(node.box.left, chainStart.linear.left) && $util.withinRange(chainEnd.linear.right, node.box.right) || !horizontal && $util.withinRange(node.box.top, chainStart.linear.top) && $util.withinRange(chainEnd.linear.bottom, node.box.bottom));
                    let baseline: T | undefined;
                    let maxSize = Number.NEGATIVE_INFINITY;
                    $util.captureMap(seg, item => !item.flexElement, item => maxSize = Math.max(maxSize, item.bounds[HW.toLowerCase()]));
                    for (let j = 0; j < seg.length; j++) {
                        const chain = seg[j];
                        const previous = seg[j - 1];
                        const next = seg[j + 1];
                        if (next) {
                            chain.anchor(CHAIN_MAP.rightLeftBottomTop[index], next.documentId);
                        }
                        if (previous) {
                            chain.anchor(CHAIN_MAP.leftRightTopBottom[index], previous.documentId);
                        }
                        if (seg !== basicHorizontal && seg !== basicVertical) {
                            switch (chain.flexbox.alignSelf) {
                                case 'start':
                                case 'flex-start':
                                    chain.anchor(TL, 'parent');
                                    break;
                                case 'end':
                                case 'flex-end':
                                    chain.anchor(BR, 'parent');
                                    break;
                                case 'baseline':
                                    if (horizontal) {
                                        if (baseline === undefined) {
                                            baseline = $NodeList.baseline(seg)[0];
                                        }
                                        if (baseline) {
                                            if (chain !== baseline) {
                                                chain.anchor('baseline', baseline.documentId);
                                                chain.constraint.vertical = true;
                                            }
                                            else {
                                                chain.anchor('top', 'parent');
                                            }
                                        }
                                    }
                                    break;
                                case 'center':
                                    chain.anchorParent(horizontal ? AXIS_ANDROID.VERTICAL : AXIS_ANDROID.HORIZONTAL);
                                    break;
                                default: {
                                    const orientation = CHAIN_MAP.horizontalVertical[inverse].toLowerCase();
                                    function removeSiblingAnchor() {
                                        if (j === 0) {
                                            chain.anchorDelete(CHAIN_MAP.rightLeftBottomTop[index]);
                                        }
                                        else {
                                            chain.anchorDelete(CHAIN_MAP.leftRightTopBottom[index]);
                                        }
                                    }
                                    switch (mainData.alignContent) {
                                        case 'space-evenly':
                                        case 'space-around':
                                            chain.anchorParent(orientation);
                                        case 'space-between':
                                            if (seg.length === 2 && spreadInside) {
                                                removeSiblingAnchor();
                                            }
                                            if (i > 0) {
                                                if (partition.length > 2 && i < partition.length - 1) {
                                                    chain.anchorParent(orientation);
                                                }
                                                else {
                                                    chain.anchor(mainData.wrapReverse ? TL : BR, 'parent');
                                                }
                                                break;
                                            }
                                        default:
                                            chain.anchor(mainData.wrapReverse ? BR : TL, 'parent');
                                            break;
                                    }
                                    if (!chain[`has${HW}`] && !chain.has(HWL, $enum.CSS_STANDARD.PERCENT)) {
                                        const initial: InitialData<T> = chain.unsafe('initial');
                                        if (initial.bounds && initial.bounds[HWL] < maxSize) {
                                            chain.android(`layout_${HW.toLowerCase()}`, '0px');
                                            chain.anchor(mainData.wrapReverse ? TL : BR, 'parent');
                                        }
                                    }
                                    break;
                                }
                            }
                            Controller.setFlexDimension(chain, horizontal);
                        }
                        if (!horizontal) {
                            chain.anchorParent(AXIS_ANDROID.HORIZONTAL);
                        }
                        chain.positioned = true;
                    }
                    chainStart.anchor(LT, 'parent');
                    chainEnd.anchor(RB, 'parent');
                    if (horizontal || mainData.columnDirection) {
                        const chainStyle = `layout_constraint${HV}_chainStyle`;
                        let centered = false;
                        if (justifyContent) {
                            switch (mainData.justifyContent) {
                                case 'left':
                                    if (!horizontal) {
                                        break;
                                    }
                                case 'start':
                                case 'flex-start':
                                    chainStart.app(chainStyle, 'packed');
                                    chainStart.app(`layout_constraint${HV}_bias`, '0');
                                    break;
                                case 'center':
                                    chainStart.app(chainStyle, 'packed');
                                    chainStart.app(`layout_constraint${HV}_bias`, '0.5');
                                    break;
                                case 'right':
                                    if (!horizontal) {
                                        break;
                                    }
                                case 'end':
                                case 'flex-end':
                                    chainStart.app(chainStyle, 'packed');
                                    chainStart.app(`layout_constraint${HV}_bias`, '1');
                                    break;
                                case 'space-between':
                                    chainStart.app(chainStyle, 'spread_inside');
                                    if (seg.length === 1) {
                                        chainEnd.anchorDelete(RB);
                                    }
                                    break;
                                case 'space-evenly':
                                    if (seg.length > 1) {
                                        chainStart.app(chainStyle, 'spread');
                                        for (const item of seg) {
                                            item.app(`layout_constraint${HV}_weight`, (item.flexbox.grow || 1).toString());
                                        }
                                    }
                                    else {
                                        centered = true;
                                    }
                                    break;
                                case 'space-around':
                                    if (seg.length > 1) {
                                        const controller = <android.base.Controller<T>> this.application.controllerHandler;
                                        const orientation = HV.toLowerCase();
                                        chainStart.app(chainStyle, 'spread_inside');
                                        chainStart.constraint[orientation] = false;
                                        chainEnd.constraint[orientation] = false;
                                        controller.addGuideline(chainStart, chainStart.parent as T, orientation, true, false);
                                        controller.addGuideline(chainEnd, chainStart.parent as T, orientation, true, true);
                                    }
                                    else {
                                        centered = true;
                                    }
                                    break;
                            }
                        }
                        if (spreadInside) {
                            chainStart.app(chainStyle, 'spread_inside', false);
                        }
                        else if (!centered) {
                            chainStart.app(chainStyle, 'packed', false);
                            chainStart.app(`layout_constraint${HV}_bias`, mainData.directionReverse ? '1' : '0', false);
                        }
                    }
                }
            });
        }
    }
}