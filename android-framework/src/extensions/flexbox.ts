import { FlexboxData } from '../../../src/base/@types/extension';

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
const $math = squared.lib.math;
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
    const percent = parent[horizontal ? 'hasWidth' : 'hasHeight'] || $util.withinRange(parent.parseUnit(parent.css(horizontal ? 'maxWidth' : 'maxHeight')), parent.box.width);
    if (items.length > 1 && (horizontal || percent)) {
        const attr = horizontal ? 'width' : 'height';
        const groupBasis: FlexBasis[] = [];
        const pending: View[] = [];
        const setPercent = (flexbox: Flexbox, dimension: number) => flexbox.basis = `${dimension / parent.box[attr] * 100}%`;
        let maxBasis!: View;
        let maxBasisUnit = 0;
        let maxDimension = 0;
        let maxRatio = NaN;
        let rowWidth = 0;
        for (const item of items) {
            const dimension = item.bounds[attr];
            rowWidth += item.linear[attr];
            if (item.flexbox.grow > 0 || item.flexbox.shrink !== 1) {
                const basis = item.flexbox.basis === 'auto' ? item.parseUnit(item.css(attr), horizontal) : item.parseUnit(item.flexbox.basis, horizontal);
                if (basis > 0) {
                    const { shrink, grow } = item.flexbox;
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
                    if (largest) {
                        maxBasis = item;
                        maxBasisUnit = basis;
                        maxDimension = dimension;
                    }
                    groupBasis.push({
                        item,
                        basis,
                        dimension,
                        shrink,
                        grow
                    });
                }
                else if (percent) {
                    setPercent(item.flexbox, dimension);
                }
            }
            else if (item.flexbox.alignSelf === 'auto' && !item.has(attr, $enum.CSS_STANDARD.LENGTH)) {
                pending.push(item);
            }
        }
        for (const data of groupBasis) {
            const item = data.item;
            if (item === maxBasis || data.basis === maxBasisUnit && (maxRatio === data.shrink || maxRatio === data.grow)) {
                item.flexbox.grow = 1;
            }
            else {
                item.flexbox.grow = ((data.dimension / data.basis) / (maxDimension / maxBasisUnit)) * data.basis / maxBasisUnit;
            }
        }
        if (percent && $util.withinRange(rowWidth, parent.box.width)) {
            for (const item of pending) {
                setPercent(item.flexbox, item.bounds[attr]);
            }
        }
        return items.reduce((a, b) => a + b.flexbox.grow, 0);
    }
    else if (horizontal) {
        for (const item of items) {
            item.flexbox.grow = 0;
            item.flexbox.shrink = 1;
        }
    }
    return 0;
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
        if (mainData.rowDirection && (mainData.rowCount === 1 || node.hasHeight) || mainData.columnDirection && (mainData.columnCount === 1 || node.hasWidth) || node.find(item => !item.pageFlow)) {
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
        else if (node.autoMargin.horizontal || node.autoMargin.vertical && node.has('height', $enum.CSS_STANDARD.LENGTH)) {
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
                    container.saveAsInitial(true);
                    container.cssApply({
                        marginLeft: '0px',
                        marginRight: '0px',
                        marginTop: '0px',
                        marginBottom: '0px'
                    });
                    mainData.children[index] = container;
                    if (node.autoMargin.horizontal && !node.hasWidth) {
                        node.android('layout_width', 'wrap_content');
                    }
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
            const segmented: T[] = [];
            if (mainData.wrap) {
                let previous: T[] | undefined;
                node.each((item: T) => {
                    if (item.hasAlign($enum.NODE_ALIGNMENT.SEGMENTED)) {
                        const pageFlow = item.renderFilter(child => child.pageFlow) as T[];
                        if (pageFlow.length) {
                            if (mainData.rowDirection) {
                                item.android('layout_width', 'match_parent');
                                segmented.push(item);
                                chainHorizontal.push(pageFlow);
                            }
                            else {
                                item.android('layout_height', 'match_parent');
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
                                segmented.push(item);
                                chainVertical.push(pageFlow);
                                previous = pageFlow;
                            }
                        }
                    }
                });
                if (node.layoutLinear) {
                    if (mainData.columnDirection && mainData.wrapReverse) {
                        node.mergeGravity('gravity', 'right');
                    }
                }
                else if (segmented.length) {
                    if (mainData.rowDirection) {
                        chainVertical.push(segmented);
                    }
                    else {
                        chainHorizontal.push(segmented);
                    }
                }
            }
            else {
                if (mainData.rowDirection) {
                    if (mainData.directionReverse) {
                        mainData.children.reverse();
                    }
                    chainHorizontal[0] = mainData.children;
                }
                else {
                    if (mainData.directionReverse) {
                        mainData.children.reverse();
                    }
                    chainVertical[0] = mainData.children;
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
                const LRTB = CHAIN_MAP.leftRightTopBottom[index];
                const RLBT = CHAIN_MAP.rightLeftBottomTop[index];
                const WHL = WH.toLowerCase();
                const HWL = HW.toLowerCase();
                const orientation = HV.toLowerCase();
                const hasDimension = (chain: T, dimension: boolean) => chain[`has${dimension ? HW : WH}`] || chain.has(dimension ? HWL : WHL, $enum.CSS_STANDARD.PERCENT);
                function setLayoutWeight(chain: T, value: number) {
                    chain.app(`layout_constraint${HV}_weight`, $math.truncate(value, chain.localSettings.floatPrecision));
                    chain.android(`layout_${WH.toLowerCase()}`, '0px');
                }
                for (let i = 0; i < partition.length; i++) {
                    const seg = partition[i];
                    const segStart = seg[0].actualAnchor as T;
                    const segEnd = seg[seg.length - 1].actualAnchor as T;
                    const segGroup = seg.every(item => item.hasAlign($enum.NODE_ALIGNMENT.SEGMENTED));
                    const justifyContent = !segGroup && seg.every(item => item.flexbox.grow === 0);
                    const spreadInside = justifyContent && (mainData.justifyContent === 'space-between' || mainData.justifyContent === 'space-around' && seg.length > 1);
                    const layoutWeight: T[] = [];
                    let growAvailable = 0;
                    let parentEnd = true;
                    let baseline: T | undefined;
                    const maxSize = $math.maxArray($util.objectMap(seg, item => item.bounds[HWL]));
                    if (segGroup) {
                        if (node[`has${WH}`]) {
                            let chainStyle = 'spread';
                            let bias = '0';
                            switch (mainData.alignContent) {
                                case 'left':
                                case 'right':
                                case 'flex-end':
                                    chainStyle = 'packed';
                                    bias = '1';
                                    parentEnd = false;
                                    break;
                                case 'baseline':
                                case 'start':
                                case 'end':
                                case 'flex-start':
                                    chainStyle = 'packed';
                                    parentEnd = false;
                                    break;
                            }
                            segStart.app(`layout_constraint${HV}_chainStyle`, chainStyle);
                            segStart.app(`layout_constraint${HV}_bias`, bias);
                        }
                    }
                    else {
                        growAvailable = 1 - adjustGrowRatio(node, seg, horizontal);
                    }
                    for (let j = 0; j < seg.length; j++) {
                        const chain = seg[j];
                        const chainActual = chain.actualAnchor as T;
                        const previous = seg[j - 1];
                        const next = seg[j + 1];
                        if (next) {
                            chain.anchor(RLBT, (next.outerParent || next).documentId);
                        }
                        if (previous) {
                            chain.anchor(LRTB, (previous.outerParent || previous).documentId);
                        }
                        if (segGroup) {
                            if (parentEnd && seg.length > 1 && node[`has${WH}`]) {
                                setLayoutWeight(chainActual, 1);
                            }
                        }
                        else {
                            const autoMargin = chain.autoMargin;
                            const innerChild = chain.innerChild as T;
                            if (horizontal) {
                                if (autoMargin.horizontal) {
                                    if (innerChild) {
                                        let gravity: string;
                                        if (autoMargin.leftRight) {
                                            gravity = 'center_horizontal';
                                        }
                                        else if (autoMargin.left) {
                                            gravity = chain.localizeString('right');
                                        }
                                        else {
                                            gravity = chain.localizeString('left');
                                        }
                                        innerChild.mergeGravity('gravity', gravity);
                                        layoutWeight.push(chainActual);
                                    }
                                    else if (!autoMargin.leftRight) {
                                        if (autoMargin.left) {
                                            if (previous) {
                                                chain.anchorDelete(LRTB);
                                            }
                                        }
                                        else {
                                            if (next) {
                                                chain.anchorDelete(RLBT);
                                            }
                                        }
                                    }
                                }
                            }
                            else {
                                if (autoMargin.vertical) {
                                    if (innerChild) {
                                        let gravity: string;
                                        if (autoMargin.topBottom) {
                                            gravity = 'center_vertical';
                                        }
                                        else if (autoMargin.top) {
                                            gravity = chain.localizeString('bottom');
                                        }
                                        else {
                                            gravity = chain.localizeString('top');
                                        }
                                        innerChild.mergeGravity('gravity', gravity);
                                        layoutWeight.push(chainActual);
                                    }
                                    else if (!autoMargin.topBottom) {
                                        if (autoMargin.top) {
                                            if (previous) {
                                                chain.anchorDelete(LRTB);
                                            }
                                        }
                                        else {
                                            if (next) {
                                                chain.anchorDelete(RLBT);
                                            }
                                        }
                                    }
                                }
                            }
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
                                        }
                                    }
                                    break;
                                case 'center':
                                    chain.anchorParent(horizontal ? AXIS_ANDROID.VERTICAL : AXIS_ANDROID.HORIZONTAL);
                                    break;
                                default:
                                    const contentChild = chain.innerChild as T;
                                    switch (mainData.alignContent) {
                                        case 'center':
                                            if (partition.length % 2 === 1 && i === Math.floor(partition.length / 2)) {
                                                chain.anchorParent(horizontal ? AXIS_ANDROID.VERTICAL : AXIS_ANDROID.HORIZONTAL);
                                            }
                                            else if (i < partition.length / 2) {
                                                chain.anchor(BR, 'parent');
                                            }
                                            else if (i >= partition.length / 2) {
                                                chain.anchor(TL, 'parent');
                                            }
                                            break;
                                        case 'space-evenly':
                                        case 'space-around':
                                            if (chain.layoutFrame && contentChild) {
                                                contentChild.mergeGravity('layout_gravity', horizontal ? 'center_vertical' : 'center_horizontal');
                                            }
                                            else {
                                                chain.anchorParent(VH.toLowerCase());
                                            }
                                            break;
                                        case 'space-between':
                                            if (seg.length === 2 && spreadInside) {
                                                chain.anchorDelete(j === 0 ? RLBT : LRTB);
                                            }
                                            if (i === 0) {
                                                if (chain.layoutFrame && contentChild) {
                                                    contentChild.mergeGravity('layout_gravity', mainData.wrapReverse ? BR : TL);
                                                }
                                                else {
                                                    chain.anchor(mainData.wrapReverse ? BR : TL, 'parent');
                                                }
                                            }
                                            else if (partition.length > 2 && i < partition.length - 1) {
                                                if (chain.layoutFrame && contentChild) {
                                                    contentChild.mergeGravity('layout_gravity', horizontal ? 'center_vertical' : 'center_horizontal');
                                                }
                                                else {
                                                    chain.anchorParent(VH.toLowerCase());
                                                }
                                            }
                                            else {
                                                if (chain.layoutFrame && contentChild) {
                                                    contentChild.mergeGravity('layout_gravity', mainData.wrapReverse ? TL : BR);
                                                }
                                                else {
                                                    chain.anchor(mainData.wrapReverse ? TL : BR, 'parent');
                                                }
                                            }
                                            break;
                                        default:
                                            chain.anchor(mainData.wrapReverse ? BR : TL, 'parent');
                                            if (!hasDimension(chain, true)) {
                                                chain.anchor(mainData.wrapReverse ? TL : BR, 'parent');
                                                if (chain.initial.bounds && chain.initial.bounds[HWL] < maxSize) {
                                                    chainActual.android(`layout_${HWL}`, '0px');
                                                    chainActual.app(`layout_constraint${VH}_weight`, '1');
                                                    if (chainActual.innerChild) {
                                                        (chainActual.innerChild as T).android(`layout_${HWL}`, 'match_parent');
                                                    }
                                                }
                                                else {
                                                    chain.flexbox.dimensionActive = true;
                                                }
                                            }
                                            break;
                                    }
                                    break;
                            }
                            Controller.setFlexDimension(chain, WHL);
                        }
                        chainActual.anchored = true;
                        chainActual.positioned = true;
                    }
                    if (growAvailable > 0) {
                        for (const item of layoutWeight) {
                            setLayoutWeight(item, Math.max(item.flexbox.grow, growAvailable / layoutWeight.length));
                        }
                    }
                    segStart.anchor(LT, 'parent');
                    segEnd.anchor(RB, 'parent');
                    if (!segGroup && (horizontal || mainData.columnDirection)) {
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
                                    if (seg.length > 1) {
                                        segStart.app(chainStyle, 'packed');
                                        segStart.app(`layout_constraint${HV}_bias`, '0.5');
                                    }
                                    centered = true;
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
                                        segStart.constraint[orientation] = false;
                                        segEnd.constraint[orientation] = false;
                                        controller.addGuideline(segStart, node, orientation, true, false);
                                        controller.addGuideline(segEnd, node, orientation, true, true);
                                    }
                                    else {
                                        centered = true;
                                    }
                                    break;
                            }
                        }
                        else if (seg.length === 1 && !hasDimension(segStart, horizontal) && !(segStart.parent && segStart.parent.flexElement && segStart.parent.flexbox.dimensionActive)) {
                            if (horizontal && segStart.alignParent('left') && segStart.alignParent('right') || !horizontal && segStart.alignParent('top') && segStart.alignParent('bottom')) {
                                segStart.android(`layout_${WHL}`, '0px');
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