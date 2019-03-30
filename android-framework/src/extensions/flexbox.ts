import { FlexboxData } from '../../../src/base/@types/extension';
import { InitialData } from '../../../src/base/@types/node';

import Controller from '../controller';
import View from '../view';

import { AXIS_ANDROID } from '../lib/constant';
import { CONTAINER_NODE } from '../lib/enumeration';

import $Layout = squared.base.Layout;
import $NodeList = squared.base.NodeList;

type FlexBasis = {
    item: View;
    basis: number;
    dimension: number;
    shrink: number;
    grow: number;
};

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

function adjustGrowRatio(parent: View, items: View[], horizontal: boolean) {
    const attr = horizontal ? 'width' : 'height';
    const groupBasis: FlexBasis[] = [];
    const groupGrow: FlexBasis[] = [];
    let maxBasis!: View;
    let maxBasisUnit = 0;
    let maxDimension = 0;
    let maxRatio = NaN;
    for (const item of items) {
        if (item.flexbox.grow > 0 || item.flexbox.shrink !== 1) {
            const dimension = item.bounds[attr];
            const basis = $util.parseUnit(item.flexbox.basis, item.fontSize) || (item.has(attr, $enum.CSS_STANDARD.LENGTH) ? item[attr] : 0);
            const { shrink, grow } = item.flexbox;
            const data: FlexBasis = {
                item,
                basis,
                dimension,
                shrink,
                grow
            };
            if (basis > 0) {
                let largest = false;
                if (dimension < basis) {
                    if (isNaN(maxRatio) || shrink < maxRatio) {
                        maxRatio = shrink;
                        largest = true;
                    }
                }
                else {
                    if (isNaN(maxRatio) || grow > maxRatio) {
                        maxRatio = grow;
                        largest = true;
                    }
                }
                if (maxBasis === undefined || largest) {
                    maxBasis = item;
                    maxBasisUnit = basis;
                    maxDimension = dimension;
                }
                groupBasis.push(data);
            }
            else {
                groupGrow.push(data);
            }
        }
    }
    for (const data of groupBasis) {
        const item = data.item;
        if (item === maxBasis || data.basis === maxBasisUnit && (maxRatio === data.shrink || maxRatio === data.grow)) {
            item.flexbox.grow = 1;
        }
        else if (data.basis > 0) {
            item.flexbox.grow = ((data.dimension / data.basis) / (maxDimension / maxBasisUnit)) * data.basis / maxBasisUnit;
        }
    }
    for (const data of groupGrow) {
        data.item.flexbox.basis = `${data.dimension / parent.box[attr] * 100}%`;
    }
}

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
        if (node.find(item => !item.pageFlow) !== undefined || mainData.rowDirection && (mainData.rowCount === 1 || node.hasHeight) || mainData.columnDirection && (mainData.columnCount === 1 || node.hasWidth)) {
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
        else if (node.autoMargin.horizontal || node.autoMargin.vertical) {
            const mainData: FlexboxData<T> = parent.data($const.EXT_NAME.FLEXBOX, 'mainData');
            if (mainData) {
                let index = -1;
                for (let i = 0 ; i < mainData.children.length; i++) {
                    if (mainData.children[i] === node) {
                        index = i;
                        break;
                    }
                }
                if (index !== -1) {
                    const container = (<android.base.Controller<T>> this.application.controllerHandler).createNodeWrapper(node, parent);
                    container.flexbox = node.flexbox;
                    container.cssApply({
                        marginLeft: '0px',
                        marginRight: '0px',
                        marginTop: '0px',
                        marginBottom: '0px'
                    }, true);
                    container.saveAsInitial(true);
                    mainData.children[index] = container;
                    return {
                        parent: container,
                        renderAs: container,
                        outputAs: this.application.renderNode(
                            new $Layout(
                                parent,
                                container,
                                CONTAINER_NODE.FRAME,
                                $enum.NODE_ALIGNMENT.SINGLE,
                                container.children as T[]
                            )
                        )
                    };
                }
            }
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
                if (node.layoutLinear) {
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
                const HV = CHAIN_MAP.horizontalVertical[index];
                const VH = CHAIN_MAP.horizontalVertical[inverse];
                const WH = CHAIN_MAP.widthHeight[index];
                const HW = CHAIN_MAP.widthHeight[inverse];
                const LT = CHAIN_MAP.leftTop[index];
                const TL = CHAIN_MAP.leftTop[inverse];
                const RB = CHAIN_MAP.rightBottom[index];
                const BR = CHAIN_MAP.rightBottom[inverse];
                const HWL = HW.toLowerCase();
                for (let i = 0; i < partition.length; i++) {
                    const seg = partition[i];
                    const segStart = seg[0];
                    const segEnd = seg[seg.length - 1];
                    const groupParent = seg.every(item => item.groupParent);
                    const justifyContent = !groupParent && seg.every(item => item.flexbox.grow < 1);
                    const spreadInside = justifyContent && (mainData.justifyContent === 'space-between' || mainData.justifyContent === 'space-around' && seg.length > 1);
                    let baseline: T | undefined;
                    let maxSize = Number.NEGATIVE_INFINITY;
                    $util.captureMap(seg, item => !item.flexElement, item => maxSize = Math.max(maxSize, item.bounds[HWL]));
                    function setAlignStretch(chain: T) {
                        const initial: InitialData<T> = chain.unsafe('initial');
                        if (initial.bounds && initial.bounds[HWL] < maxSize) {
                            chain.android(`layout_${HWL}`, '0px');
                            chain.app(`layout_constraint${VH}_weight`, '1');
                        }
                    }
                    if (!groupParent) {
                        adjustGrowRatio(node, seg, horizontal);
                    }
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
                        if (groupParent) {
                            if (node[`has${WH}`]) {
                                if (j === 0) {
                                    chain.app(`layout_constraint${WH}_chainStyle`, 'spread');
                                }
                                chain.app(`layout_constraint${HV}_weight`, '1');
                                chain.android(`layout_${WH.toLowerCase()}`, '0px');
                            }
                        }
                        else {
                            const innerChild = chain.innerChild as T;
                            if (innerChild && (horizontal && innerChild.autoMargin.horizontal || !horizontal && innerChild.autoMargin.vertical)) {
                                chain.app(`layout_constraint${HV}_weight`, '1');
                                chain.android(`layout_${WH.toLowerCase()}`, '0px');
                                const autoMargin = innerChild.autoMargin;
                                let gravity: string | undefined;
                                if (horizontal) {
                                    if (autoMargin.leftRight) {
                                        gravity = 'center_horizontal';
                                    }
                                    else if (autoMargin.left) {
                                        gravity = innerChild.localizeString('right');
                                    }
                                }
                                else {
                                    if (autoMargin.topBottom) {
                                        gravity = 'center_vertical';
                                    }
                                    else if (autoMargin.top) {
                                        gravity = 'bottom';
                                    }
                                }
                                if (gravity) {
                                    innerChild.mergeGravity('layout_gravity', gravity);
                                }
                            }
                            const hasDimension = () => chain[`has${HW}`] || chain.has(HWL, $enum.CSS_STANDARD.PERCENT);
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
                                        if (baseline && chain !== baseline) {
                                            chain.anchor('baseline', baseline.documentId);
                                            chain.constraint.vertical = true;
                                        }
                                    }
                                    break;
                                case 'center':
                                    chain.anchorParent(horizontal ? AXIS_ANDROID.VERTICAL : AXIS_ANDROID.HORIZONTAL);
                                    break;
                                default:
                                    switch (mainData.alignContent) {
                                        case 'space-evenly':
                                        case 'space-around':
                                            chain.anchorParent(CHAIN_MAP.horizontalVertical[inverse].toLowerCase());
                                        case 'space-between':
                                            if (seg.length === 2 && spreadInside) {
                                                if (j === 0) {
                                                    chain.anchorDelete(CHAIN_MAP.rightLeftBottomTop[index]);
                                                }
                                                else {
                                                    chain.anchorDelete(CHAIN_MAP.leftRightTopBottom[index]);
                                                }
                                            }
                                            if (i === 0) {
                                                chain.anchor(mainData.wrapReverse ? BR : TL, 'parent');
                                            }
                                            else if (partition.length > 2 && i < partition.length - 1) {
                                                chain.anchorParent(CHAIN_MAP.horizontalVertical[inverse].toLowerCase());
                                            }
                                            else {
                                                chain.anchor(mainData.wrapReverse ? TL : BR, 'parent');
                                            }
                                            break;
                                        default:
                                            chain.anchor(mainData.wrapReverse ? BR : TL, 'parent');
                                            if (!hasDimension()) {
                                                chain.anchor(mainData.wrapReverse ? TL : BR, 'parent');
                                                setAlignStretch(chain);
                                            }
                                            break;
                                    }
                                    break;
                            }
                            Controller.setFlexDimension(chain, horizontal);
                        }
                        chain.positioned = true;
                    }
                    segStart.anchor(LT, 'parent');
                    segEnd.anchor(RB, 'parent');
                    if (!groupParent && (horizontal || mainData.columnDirection)) {
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
                                    segStart.app(chainStyle, 'packed');
                                    segStart.app(`layout_constraint${HV}_bias`, '0');
                                    break;
                                case 'center':
                                    segStart.app(chainStyle, 'packed');
                                    segStart.app(`layout_constraint${HV}_bias`, '0.5');
                                    break;
                                case 'right':
                                    if (!horizontal) {
                                        break;
                                    }
                                case 'end':
                                case 'flex-end':
                                    segStart.app(chainStyle, 'packed');
                                    segStart.app(`layout_constraint${HV}_bias`, '1');
                                    break;
                                case 'space-between':
                                    if (seg.length === 1) {
                                        segEnd.anchorDelete(RB);
                                    }
                                    break;
                                case 'space-evenly':
                                    if (seg.length > 1) {
                                        segStart.app(chainStyle, 'spread');
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
                                        segStart.constraint[orientation] = false;
                                        segEnd.constraint[orientation] = false;
                                        controller.addGuideline(segStart, segStart.parent as T, orientation, true, false);
                                        controller.addGuideline(segEnd, segStart.parent as T, orientation, true, true);
                                    }
                                    else {
                                        centered = true;
                                    }
                                    break;
                            }
                        }
                        if (spreadInside || seg.length > 1 && (
                                horizontal && $util.withinRange(node.box.left, segStart.linear.left) && $util.withinRange(segEnd.linear.right, node.box.right) && !seg.some(item => item.autoMargin.horizontal) ||
                                !horizontal && $util.withinRange(node.box.top, segStart.linear.top) && $util.withinRange(segEnd.linear.bottom, node.box.bottom) && !seg.some(item => item.autoMargin.vertical)
                           ))
                        {
                            segStart.app(chainStyle, 'spread_inside', false);
                        }
                        else if (!centered) {
                            segStart.app(chainStyle, 'packed', false);
                            segStart.app(`layout_constraint${HV}_bias`, mainData.directionReverse ? '1' : '0', false);
                        }
                    }
                }
            });
        }
    }
}