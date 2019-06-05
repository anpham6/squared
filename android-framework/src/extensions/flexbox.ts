import { FlexboxData } from '../../../src/base/@types/extension';

import Controller from '../controller';
import View from '../view';

import { STRING_ANDROID } from '../lib/constant';
import { CONTAINER_NODE } from '../lib/enumeration';

import $LayoutUI = squared.base.LayoutUI;
import $NodeUI = squared.base.NodeUI;

type FlexBasis = {
    item: View;
    basis: number;
    dimension: number;
    shrink: number;
    grow: number;
};

const $const = squared.lib.constant;
const $math = squared.lib.math;
const $util = squared.lib.util;
const $c = squared.base.lib.constant;
const $e = squared.base.lib.enumeration;

const CHAIN_MAP = {
    leftTop: [$const.CSS.LEFT, $const.CSS.TOP],
    rightBottom: [$const.CSS.RIGHT, $const.CSS.BOTTOM],
    rightLeftBottomTop: [$c.STRING_BASE.RIGHT_LEFT, $c.STRING_BASE.BOTTOM_TOP],
    leftRightTopBottom: [$c.STRING_BASE.LEFT_RIGHT, $c.STRING_BASE.TOP_BOTTOM],
    widthHeight: ['Width', 'Height'],
    horizontalVertical: [STRING_ANDROID.HORIZONTAL, STRING_ANDROID.VERTICAL]
};

function adjustGrowRatio(parent: View, items: View[], attr: string) {
    const horizontal = attr === $const.CSS.WIDTH;
    const hasDimension = `has${$util.capitalize(attr)}`;
    const result = items.reduce((a, b) => a + b.flexbox.grow, 0);
    const setPercentage = (item: View) => item.flexbox.basis = `${item.bounds[attr] / parent.box[attr] * 100}%`;
    let percent = parent[hasDimension] || parent.blockStatic && $util.withinRange(parent.parseUnit(parent.css(horizontal ? 'maxWidth' : 'maxHeight')), parent.box.width);
    let growShrinkType = 0;
    if (percent) {
        for (const item of items) {
            const autoMargin = item.innerWrapped ? item.innerWrapped.autoMargin : item.autoMargin;
            if (horizontal) {
                if (autoMargin.horizontal) {
                    percent = false;
                    break;
                }
            }
            else {
                if (autoMargin.vertical) {
                    percent = false;
                    break;
                }
            }
        }
    }
    if (items.length > 1 && (horizontal || percent)) {
        const groupBasis: FlexBasis[] = [];
        const percentage: View[] = [];
        let maxBasis!: View;
        let maxBasisUnit = 0;
        let maxDimension = 0;
        let maxRatio = NaN;
        for (const item of items) {
            const dimension = item.bounds[attr];
            let growPercent = false;
            if (item.flexbox.grow > 0 || item.flexbox.shrink !== 1) {
                const basis = item.flexbox.basis === $const.CSS.AUTO ? item.parseUnit(item.css(attr), attr) : item.parseUnit(item.flexbox.basis, attr);
                if (basis > 0) {
                    const { shrink, grow } = item.flexbox;
                    let largest = false;
                    if (dimension < basis) {
                        if (isNaN(maxRatio) || shrink < maxRatio) {
                            maxRatio = shrink;
                            largest = true;
                            growShrinkType = 1;
                        }
                    }
                    else {
                        if (isNaN(maxRatio) || grow > maxRatio) {
                            maxRatio = grow;
                            largest = true;
                            growShrinkType = 2;
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
                    continue;
                }
                else if (item.flexbox.grow > 0 && dimension > item[attr]) {
                    growPercent = true;
                }
            }
            if (item.flexbox.alignSelf === $const.CSS.AUTO && (percent && !item[hasDimension] || growPercent)) {
                percentage.push(item);
            }
        }
        if (growShrinkType !== 0) {
            if (groupBasis.length > 1) {
                for (const data of groupBasis) {
                    const item = data.item;
                    if (item === maxBasis || data.basis === maxBasisUnit && (growShrinkType === 1 && maxRatio === data.shrink || growShrinkType === 2 && maxRatio === data.grow)) {
                        item.flexbox.grow = 1;
                    }
                    else {
                        item.flexbox.grow = ((data.dimension / data.basis) / (maxDimension / maxBasisUnit)) * data.basis / maxBasisUnit;
                    }
                }
            }
            if (percentage.length) {
                for (const item of percentage) {
                    setPercentage(item);
                }
            }
        }
    }
    if (horizontal && growShrinkType === 0) {
        for (const item of items) {
            if (item.cascadeSome(child => child.multiline && child.ascend(above => above[hasDimension], parent).length === 0)) {
                setPercentage(item);
            }
        }
    }
    return result;
}

const getAutoMargin = (node: View) => node.innerWrapped ? node.innerWrapped.autoMargin : node.autoMargin;

export default class <T extends View> extends squared.base.extensions.Flexbox<T> {
    public processNode(node: T, parent: T) {
        super.processNode(node, parent);
        const mainData: FlexboxData<T> = node.data($c.EXT_NAME.FLEXBOX, $c.STRING_BASE.EXT_DATA);
        if (mainData.directionRow && mainData.rowCount === 1 || mainData.directionColumn && mainData.columnCount === 1) {
            node.containerType = CONTAINER_NODE.CONSTRAINT;
            node.addAlign($e.NODE_ALIGNMENT.AUTO_LAYOUT);
            mainData.wrap = false;
            return { include: true };
        }
        else {
            const layout = new $LayoutUI(
                parent,
                node,
                0,
                $e.NODE_ALIGNMENT.AUTO_LAYOUT
            );
            layout.itemCount = node.length;
            layout.rowCount = mainData.rowCount;
            layout.columnCount = mainData.columnCount;
            if (mainData.directionRow && node.hasHeight || mainData.directionColumn && node.hasWidth || node.some(item => !item.pageFlow)) {
                layout.containerType = CONTAINER_NODE.CONSTRAINT;
            }
            else {
                layout.setType(CONTAINER_NODE.LINEAR, mainData.directionColumn ? $e.NODE_ALIGNMENT.HORIZONTAL : $e.NODE_ALIGNMENT.VERTICAL);
            }
            return {
                output: this.application.renderNode(layout),
                complete: true
            };
        }
    }

    public processChild(node: T, parent: T) {
        if (node.hasAlign($e.NODE_ALIGNMENT.SEGMENTED)) {
            return {
                output: this.application.renderNode(
                    new $LayoutUI(
                        parent,
                        node,
                        CONTAINER_NODE.CONSTRAINT,
                        $e.NODE_ALIGNMENT.AUTO_LAYOUT,
                        node.children as T[]
                    )
                ),
                complete: true
            };
        }
        else if (node.autoMargin.horizontal || node.autoMargin.vertical && node.hasHeight) {
            const mainData: FlexboxData<T> = parent.data($c.EXT_NAME.FLEXBOX, $c.STRING_BASE.EXT_DATA);
            if (mainData) {
                const index = mainData.children.findIndex(item => item === node);
                if (index !== -1) {
                    const container = (<android.base.Controller<T>> this.application.controllerHandler).createNodeWrapper(node, parent);
                    container.cssApply({
                        marginTop: $const.CSS.PX_0,
                        marginRight: $const.CSS.PX_0,
                        marginBottom: $const.CSS.PX_0,
                        marginLeft: $const.CSS.PX_0,
                        display: 'block',
                    }, true);
                    container.saveAsInitial(true);
                    container.flexbox = { ...node.flexbox };
                    mainData.children[index] = container;
                    if (node.autoMargin.horizontal && !node.hasWidth) {
                        node.setLayoutWidth(STRING_ANDROID.WRAP_CONTENT);
                    }
                    return {
                        parent: container,
                        renderAs: container,
                        outputAs: this.application.renderNode(
                            new $LayoutUI(
                                parent,
                                container,
                                CONTAINER_NODE.FRAME,
                                $e.NODE_ALIGNMENT.SINGLE,
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
        const mainData: FlexboxData<T> = node.data($c.EXT_NAME.FLEXBOX, $c.STRING_BASE.EXT_DATA);
        if (mainData) {
            const chainHorizontal: T[][] = [];
            const chainVertical: T[][] = [];
            const segmented: T[] = [];
            if (mainData.wrap) {
                let previous: T[] | undefined;
                node.each((item: T) => {
                    if (item.hasAlign($e.NODE_ALIGNMENT.SEGMENTED)) {
                        const pageFlow = item.renderFilter(child => child.pageFlow) as T[];
                        if (pageFlow.length) {
                            if (mainData.directionRow) {
                                item.setLayoutWidth(STRING_ANDROID.MATCH_PARENT);
                                chainHorizontal.push(pageFlow);
                            }
                            else {
                                item.setLayoutHeight(STRING_ANDROID.MATCH_PARENT);
                                if (previous) {
                                    const length = previous.length;
                                    let largest = previous[0];
                                    for (let j = 1; j < length; j++) {
                                        if (previous[j].linear.right > largest.linear.right) {
                                            largest = previous[j];
                                        }
                                    }
                                    if (mainData.wrapReverse) {
                                        const offset = item.linear.left - largest.actualRect($const.CSS.RIGHT);
                                        if (offset > 0) {
                                            item.modifyBox($e.BOX_STANDARD.MARGIN_LEFT, offset);
                                        }
                                    }
                                    item.constraint.horizontal = true;
                                }
                                chainVertical.push(pageFlow);
                                previous = pageFlow;
                            }
                            segmented.push(item);
                        }
                    }
                });
                if (node.layoutLinear) {
                    if (mainData.directionColumn && mainData.wrapReverse) {
                        node.mergeGravity(STRING_ANDROID.GRAVITY, $const.CSS.RIGHT);
                    }
                }
                else if (segmented.length) {
                    if (mainData.directionRow) {
                        chainVertical.push(segmented);
                    }
                    else {
                        chainHorizontal.push(segmented);
                    }
                }
            }
            else {
                if (mainData.directionRow) {
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
                const orientation = CHAIN_MAP.horizontalVertical[index];
                const orientationInverse = CHAIN_MAP.horizontalVertical[inverse];
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
                const dimension: boolean = node[`has${HW}`];
                const dimensionInverse: boolean = node[`has${WH}`];
                const orientationWeight = `layout_constraint${$util.capitalize(orientation)}_weight`;
                function setLayoutWeight(chain: T, value: number) {
                    chain.app(orientationWeight, $math.truncate(value, chain.localSettings.floatPrecision));
                    chain.android(`layout_${WH.toLowerCase()}`, $const.CSS.PX_0);
                }
                const lengthA = partition.length;
                for (let i = 0; i < lengthA; i++) {
                    const seg = partition[i];
                    const lengthB = seg.length;
                    const segStart = seg[0];
                    const segEnd = seg[lengthB - 1];
                    const opposing = seg === segmented;
                    const justifyContent = !opposing && seg.every(item => item.flexbox.grow === 0);
                    const spreadInside = justifyContent && (mainData.justifyContent === 'space-between' || mainData.justifyContent === 'space-around' && lengthB > 1);
                    const layoutWeight: T[] = [];
                    let maxSize = 0;
                    let growAvailable = 0;
                    let parentEnd = true;
                    let baseline: T | undefined;
                    if (opposing) {
                        if (dimensionInverse) {
                            let chainStyle = 'spread';
                            let bias = 0;
                            switch (mainData.alignContent) {
                                case $const.CSS.LEFT:
                                case $const.CSS.RIGHT:
                                case 'flex-end':
                                    chainStyle = 'packed';
                                    bias = 1;
                                    parentEnd = false;
                                    break;
                                case 'baseline':
                                case $const.CSS.START:
                                case $const.CSS.END:
                                case 'flex-start':
                                    chainStyle = 'packed';
                                    parentEnd = false;
                                    break;
                            }
                            segStart.anchorStyle(orientation, chainStyle, bias);
                        }
                        else {
                            segStart.anchorStyle(orientation);
                        }
                    }
                    else {
                        growAvailable = 1 - adjustGrowRatio(node, seg, WHL);
                        if (lengthB > 1) {
                            const sizeMap = new Set<number>($util.objectMap(seg, item => item.initial.bounds ? item.initial.bounds[HWL] : 0));
                            if (sizeMap.size > 1) {
                                maxSize = $math.maxArray(Array.from(sizeMap));
                            }
                        }
                    }
                    for (let j = 0; j < lengthB; j++) {
                        const chain = seg[j];
                        const previous = seg[j - 1];
                        const next = seg[j + 1];
                        if (next) {
                            chain.anchor(RLBT, (next.outerWrapper || next).documentId);
                        }
                        if (previous) {
                            chain.anchor(LRTB, (previous.outerWrapper || previous).documentId);
                        }
                        if (opposing) {
                            if (parentEnd && lengthB > 1 && dimensionInverse) {
                                setLayoutWeight(chain, 1);
                            }
                            chain.anchor(TL, STRING_ANDROID.PARENT);
                        }
                        else {
                            const autoMargin = getAutoMargin(chain);
                            const innerWrapped = chain.innerWrapped;
                            if (horizontal) {
                                if (autoMargin.horizontal) {
                                    if (innerWrapped) {
                                        let gravity: string;
                                        if (autoMargin.leftRight) {
                                            gravity = STRING_ANDROID.CENTER_HORIZONTAL;
                                        }
                                        else {
                                            gravity = chain.localizeString(autoMargin.left ? $const.CSS.RIGHT : $const.CSS.LEFT);
                                        }
                                        innerWrapped.mergeGravity(STRING_ANDROID.LAYOUT_GRAVITY, gravity);
                                        if (growAvailable > 0) {
                                            chain.flexbox.basis = $const.CSS.PERCENT_0;
                                            layoutWeight.push(chain);
                                        }
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
                                    if (innerWrapped) {
                                        let gravity: string;
                                        if (autoMargin.topBottom) {
                                            gravity = STRING_ANDROID.CENTER_VERTICAL;
                                        }
                                        else {
                                            gravity = chain.localizeString(autoMargin.top ? $const.CSS.BOTTOM : $const.CSS.TOP);
                                        }
                                        innerWrapped.mergeGravity(STRING_ANDROID.LAYOUT_GRAVITY, gravity);
                                        if (growAvailable > 0) {
                                            chain.flexbox.basis = $const.CSS.PERCENT_0;
                                            layoutWeight.push(chain);
                                        }
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
                                case $const.CSS.START:
                                case 'flex-start':
                                    chain.anchor(TL, STRING_ANDROID.PARENT);
                                    break;
                                case $const.CSS.END:
                                case 'flex-end':
                                    chain.anchor(BR, STRING_ANDROID.PARENT);
                                    break;
                                case 'baseline':
                                    if (horizontal) {
                                        if (baseline === undefined) {
                                            baseline = $NodeUI.baseline(seg);
                                        }
                                        if (baseline && chain !== baseline) {
                                            chain.anchor('baseline', baseline.documentId);
                                        }
                                    }
                                    break;
                                case $const.CSS.CENTER:
                                    chain.anchorParent(orientationInverse, 'packed', 0.5);
                                    if (chain[HWL] === 0 && !horizontal && !dimension && chain.cascadeSome(child => child.multiline)) {
                                        chain.android(`layout_${HWL}`, $const.CSS.PX_0);
                                    }
                                    break;
                                default:
                                    const childContent = chain.innerWrapped as T;
                                    const wrapReverse = mainData.wrapReverse;
                                    switch (mainData.alignContent) {
                                        case $const.CSS.CENTER:
                                            if (partition.length % 2 === 1 && i === Math.floor(partition.length / 2)) {
                                                chain.anchorParent(orientationInverse);
                                            }
                                            else if (i < partition.length / 2) {
                                                chain.anchor(BR, STRING_ANDROID.PARENT);
                                            }
                                            else if (i >= partition.length / 2) {
                                                chain.anchor(TL, STRING_ANDROID.PARENT);
                                            }
                                            break;
                                        case 'space-evenly':
                                        case 'space-around':
                                            if (chain.layoutFrame && childContent) {
                                                childContent.mergeGravity(STRING_ANDROID.LAYOUT_GRAVITY, horizontal ? STRING_ANDROID.CENTER_VERTICAL : STRING_ANDROID.CENTER_HORIZONTAL);
                                            }
                                            else {
                                                chain.anchorParent(orientationInverse);
                                            }
                                            break;
                                        case 'space-between':
                                            if (spreadInside && lengthB === 2) {
                                                chain.anchorDelete(j === 0 ? RLBT : LRTB);
                                            }
                                            if (i === 0) {
                                                if (chain.layoutFrame && childContent) {
                                                    childContent.mergeGravity(STRING_ANDROID.LAYOUT_GRAVITY, wrapReverse ? BR : TL);
                                                }
                                                else {
                                                    chain.anchor(wrapReverse ? BR : TL, STRING_ANDROID.PARENT);
                                                }
                                            }
                                            else if (partition.length > 2 && i < partition.length - 1) {
                                                if (chain.layoutFrame && childContent) {
                                                    childContent.mergeGravity(STRING_ANDROID.LAYOUT_GRAVITY, horizontal ? STRING_ANDROID.CENTER_VERTICAL : STRING_ANDROID.CENTER_HORIZONTAL);
                                                }
                                                else {
                                                    chain.anchorParent(orientationInverse);
                                                }
                                            }
                                            else {
                                                if (chain.layoutFrame && childContent) {
                                                    childContent.mergeGravity(STRING_ANDROID.LAYOUT_GRAVITY, wrapReverse ? TL : BR);
                                                }
                                                else {
                                                    chain.anchor(wrapReverse ? TL : BR, STRING_ANDROID.PARENT);
                                                }
                                            }
                                            break;
                                        default: {
                                            chain.anchorParent(orientationInverse);
                                            if (chain.innerWrapped === undefined || !chain.innerWrapped.autoMargin[orientationInverse]) {
                                                chain.anchorStyle(orientationInverse, 'packed', wrapReverse ? 1 : 0);
                                            }
                                            if (chain[HWL] === 0) {
                                                const bounds = chain.initial.bounds && chain.initial.bounds[HWL];
                                                const smaller = bounds < maxSize;
                                                const attr = `layout_${HWL}`;
                                                if (!smaller) {
                                                    if (dimension && (maxSize === 0 && chain.bounds[HWL] > bounds || chain.flexElement && (horizontal && chain.css('flexDirection') === 'column' || !horizontal && chain.css('flexDirection') === 'row'))) {
                                                        chain.android(attr, $const.CSS.PX_0);
                                                    }
                                                }
                                                else if (dimension || maxSize === 0 || smaller) {
                                                    if (maxSize === 0 && (!dimension && lengthB > 1 || mainData.wrap)) {
                                                        break;
                                                    }
                                                    else if (horizontal && !dimension) {
                                                        chain.android(attr, smaller ? $const.CSS.PX_0 : STRING_ANDROID.MATCH_PARENT);
                                                    }
                                                    else {
                                                        chain.android(attr, $const.CSS.PX_0);
                                                    }
                                                    if (innerWrapped && !innerWrapped.autoMargin[orientation]) {
                                                        innerWrapped.android(attr, STRING_ANDROID.MATCH_PARENT);
                                                    }
                                                }
                                            }
                                            break;
                                        }
                                    }
                                    break;
                            }
                            Controller.setFlexDimension(chain, WHL);
                        }
                        chain.anchored = true;
                        chain.positioned = true;
                    }
                    if (growAvailable > 0) {
                        for (const item of layoutWeight) {
                            const autoMargin = getAutoMargin(item);
                            let ratio = 1;
                            if (horizontal) {
                                if (autoMargin.leftRight) {
                                    ratio = 2;
                                }
                            }
                            else if (autoMargin.topBottom) {
                                ratio = 2;
                            }
                            setLayoutWeight(item, Math.max(item.flexbox.grow, (growAvailable * ratio) / layoutWeight.length));
                        }
                    }
                    segStart.anchor(LT, STRING_ANDROID.PARENT);
                    segEnd.anchor(RB, STRING_ANDROID.PARENT);
                    if (!opposing && (horizontal || mainData.directionColumn)) {
                        let centered = false;
                        if (justifyContent) {
                            switch (mainData.justifyContent) {
                                case 'normal':
                                    if (mainData.directionColumn) {
                                        segStart.anchorStyle(orientation, 'packed', mainData.directionReverse ? 1 : 0);
                                    }
                                    break;
                                case $const.CSS.LEFT:
                                    if (!horizontal) {
                                        break;
                                    }
                                case $const.CSS.START:
                                case 'flex-start':
                                    segStart.anchorStyle(orientation, 'packed', mainData.directionReverse ? 1 : 0);
                                    break;
                                case $const.CSS.CENTER:
                                    if (lengthB > 1) {
                                        segStart.anchorStyle(orientation, 'packed', 0.5);
                                    }
                                    centered = true;
                                    break;
                                case $const.CSS.RIGHT:
                                    if (!horizontal) {
                                        break;
                                    }
                                case $const.CSS.END:
                                case 'flex-end':
                                    segStart.anchorStyle(orientation, 'packed', 1);
                                    break;
                                case 'space-between':
                                    if (lengthB === 1) {
                                        segEnd.anchorDelete(RB);
                                    }
                                    break;
                                case 'space-evenly':
                                    if (lengthB > 1) {
                                        segStart.anchorStyle(orientation, 'spread');
                                        const HVU = $util.capitalize(orientation);
                                        for (const item of seg) {
                                            item.app(`layout_constraint${HVU}_weight`, (item.flexbox.grow || 1).toString());
                                        }
                                    }
                                    else {
                                        centered = true;
                                    }
                                    break;
                                case 'space-around':
                                    if (lengthB > 1) {
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
                        if (spreadInside || !mainData.wrap && partition[i].some(item => item.app(orientationWeight) !== '') && !$util.sameArray(partition[i], item => item.app(orientationWeight))) {
                            segStart.anchorStyle(orientation, 'spread_inside', 0, false);
                        }
                        else if (!centered) {
                            segStart.anchorStyle(orientation, 'packed', mainData.directionReverse ? 1 : 0, false);
                        }
                    }
                }
            });
        }
    }
}