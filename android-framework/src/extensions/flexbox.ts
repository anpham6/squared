import type { FlexboxData } from '../../../@types/base/extension';

import View from '../view';

import { CONTAINER_NODE } from '../lib/enumeration';

import LayoutUI = squared.base.LayoutUI;

const $lib = squared.lib;
const $base = squared.base;
const $base_lib = $base.lib;

const { isLength } = $lib.css;
const { truncate } = $lib.math;
const { capitalize, sameArray, withinRange } = $lib.util;

const { BOX_STANDARD, NODE_ALIGNMENT } = $base_lib.enumeration;

const NodeUI = $base.NodeUI;
const FLEXBOX = $base_lib.constant.EXT_NAME.FLEXBOX;

type FlexBasis = {
    item: View;
    basis: number;
    dimension: number;
    shrink: number;
    grow: number;
};

const MAP_horizontal = {
    orientation: 'horizontal',
    orientationInverse: 'vertical',
    WHL: 'width',
    HWL: 'height',
    LT: 'left',
    TL: 'top',
    RB: 'right',
    BR: 'bottom',
    LRTB: 'leftRight',
    RLBT: 'rightLeft'
};
const MAP_vertical = {
    orientation: 'vertical',
    orientationInverse: 'horizontal',
    WHL: 'height',
    HWL: 'width',
    LT: 'top',
    TL: 'left',
    RB: 'bottom',
    BR: 'right',
    LRTB: 'topBottom',
    RLBT: 'bottomTop'
};

function adjustGrowRatio(parent: View, items: View[], attr: DimensionAttr) {
    const horizontal = attr === 'width';
    const hasDimension = `has${capitalize(attr)}`;
    const setPercentage = (item: View) => item.flexbox.basis = (item.bounds[attr] / parent.box[attr] * 100) + '%';
    let percent: boolean = parent[hasDimension] || horizontal && parent.blockStatic && withinRange(parent.parseWidth(parent.css('maxWidth')), parent.box.width);
    let result = 0;
    let growShrinkType = 0;
    const length = items.length;
    for (let i = 0; i < length; i++) {
        const item = items[i];
        if (percent) {
            if (horizontal) {
                if (item.innerMostWrapped.autoMargin.horizontal) {
                    percent = false;
                    break;
                }
            }
            else {
                if (item.innerMostWrapped.autoMargin.vertical) {
                    percent = false;
                    break;
                }
            }
        }
        result += item.flexbox.grow;
    }
    if (length > 1 && (horizontal || percent)) {
        const groupBasis: FlexBasis[] = [];
        const percentage: View[] = [];
        let maxBasis: Undef<View>;
        let maxBasisUnit = 0;
        let maxDimension = 0;
        let maxRatio = NaN;
        for (let i = 0; i < length; i++) {
            const item = items[i];
            const { alignSelf, basis, shrink, grow } = item.flexbox;
            const dimension = item.bounds[attr];
            let growPercent = false;
            if (grow > 0 || shrink !== 1) {
                const value = item.parseUnit(basis === 'auto' ? item.css(attr) : basis, attr);
                if (value > 0) {
                    let largest = false;
                    if (dimension < value) {
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
                        maxBasisUnit = value;
                        maxDimension = dimension;
                    }
                    groupBasis.push({
                        item,
                        basis: value,
                        dimension,
                        shrink,
                        grow
                    });
                    continue;
                }
                else if (grow > 0) {
                    growPercent = true;
                }
            }
            else if (isLength(basis)) {
                groupBasis.push({
                    item,
                    basis: Math.min(dimension, item.parseUnit(basis, attr)),
                    dimension,
                    shrink,
                    grow
                });
                item.flexbox.basis = 'auto';
                continue;
            }
            if (alignSelf === 'auto' && (percent && !item[hasDimension] || growPercent)) {
                percentage.push(item);
            }
        }
        if (growShrinkType) {
            if (groupBasis.length > 1) {
                groupBasis.forEach(data => {
                    const { basis, item } = data;
                    if (item === maxBasis || basis === maxBasisUnit && (growShrinkType === 1 && maxRatio === data.shrink || growShrinkType === 2 && maxRatio === data.grow)) {
                        item.flexbox.grow = 1;
                    }
                    else if (basis > 0) {
                        item.flexbox.grow = ((data.dimension / basis) / (maxDimension / maxBasisUnit)) * basis / maxBasisUnit;
                    }
                });
            }
            percentage.forEach(item => setPercentage(item));
        }
    }
    if (horizontal && growShrinkType === 0) {
        for (let i = 0; i < length; i++) {
            const item = items[i];
            if (item.find(child => child.multiline && child.ascend({ condition: above => above[hasDimension], including: parent }).length === 0, { cascade: true })) {
                items.forEach(child => setPercentage(child));
                break;
            }
        }
    }
    return result;
}

function getBaseline(nodes: View[]) {
    const length = nodes.length;
    for (let i = 0; i < length; i++) {
        const node = nodes[i];
        if (node.textElement && node.baseline) {
            return node;
        }
    }
    return NodeUI.baseline(nodes);
}

function setLayoutWeightOpposing(item: View, value: string, horizontal: boolean) {
    if (!horizontal) {
        item.setLayoutWidth(value);
    }
    else {
        item.setLayoutHeight(value);
    }
}

function getOuterFrameChild(item: Undef<View>) {
    while (item) {
        if (item.layoutFrame) {
            return item.innerWrapped;
        }
        item = <View> item.innerWrapped;
    }
    return undefined;
}

export default class <T extends View> extends squared.base.extensions.Flexbox<T> {
    public processNode(node: T, parent: T) {
        super.processNode(node, parent);
        const mainData: FlexboxData<T> = node.data(FLEXBOX, 'mainData');
        const { column, row, rowCount, columnCount } = mainData;
        if (row && rowCount === 1 || column && columnCount === 1) {
            node.containerType = CONTAINER_NODE.CONSTRAINT;
            node.addAlign(NODE_ALIGNMENT.AUTO_LAYOUT);
            node.addAlign(column ? NODE_ALIGNMENT.VERTICAL : NODE_ALIGNMENT.HORIZONTAL);
            mainData.wrap = false;
            return {
                include: true,
                complete: true
            };
        }
        else {
            const containerType = row && node.hasHeight || column && node.hasWidth || node.some(item => !item.pageFlow) ? CONTAINER_NODE.CONSTRAINT : CONTAINER_NODE.LINEAR;
            return {
                output: this.application.renderNode(LayoutUI.create({
                    parent,
                    node,
                    containerType,
                    alignmentType: NODE_ALIGNMENT.AUTO_LAYOUT | (column ? NODE_ALIGNMENT.HORIZONTAL : NODE_ALIGNMENT.VERTICAL),
                    itemCount: node.length,
                    rowCount,
                    columnCount
                })),
                include: true,
                complete: true
            };
        }
    }

    public processChild(node: T, parent: T) {
        if (node.hasAlign(NODE_ALIGNMENT.SEGMENTED)) {
            return {
                output: this.application.renderNode(
                    new LayoutUI(
                        parent,
                        node,
                        CONTAINER_NODE.CONSTRAINT,
                        NODE_ALIGNMENT.AUTO_LAYOUT,
                        node.children as T[]
                    )
                ),
                complete: true,
                subscribe: true
            };
        }
        else {
            const autoMargin = node.autoMargin;
            if (autoMargin.horizontal || autoMargin.vertical && parent.hasHeight) {
                const mainData: FlexboxData<T> = parent.data(FLEXBOX, 'mainData');
                if (mainData) {
                    const children = mainData.children;
                    const index = children.findIndex(item => item === node);
                    if (index !== -1) {
                        const container = (<android.base.Controller<T>> this.controller).createNodeWrapper(node, parent);
                        container.cssApply({
                            marginTop: '0px',
                            marginRight: '0px',
                            marginBottom: '0px',
                            marginLeft: '0px',
                            display: 'block',
                        }, true);
                        container.saveAsInitial(true);
                        container.setCacheValue('flexbox', node.flexbox);
                        mainData.children[index] = container;
                        if (autoMargin.horizontal && !node.hasWidth) {
                            node.setLayoutWidth('wrap_content');
                        }
                        return {
                            parent: container,
                            renderAs: container,
                            outputAs: this.application.renderNode(
                                new LayoutUI(
                                    parent,
                                    container,
                                    CONTAINER_NODE.FRAME,
                                    NODE_ALIGNMENT.SINGLE,
                                    container.children as T[]
                                )
                            )
                        };
                    }
                }
            }
        }
        return undefined;
    }

    public postBaseLayout(node: T) {
        const mainData: FlexboxData<T> = node.data(FLEXBOX, 'mainData');
        if (mainData) {
            const controller = <android.base.Controller<T>> this.controller;
            const { row, column, reverse, wrap, wrapReverse, alignContent, justifyContent, children } = mainData;
            const parentBottom = node.hasPX('height', false) || node.percentHeight > 0 ? node.linear.bottom : 0;
            const chainHorizontal: T[][] = [];
            const chainVertical: T[][] = [];
            const segmented: T[] = [];
            let marginBottom = 0;
            if (wrap) {
                let previous: Undef<T[]>;
                node.each((item: T) => {
                    if (item.hasAlign(NODE_ALIGNMENT.SEGMENTED)) {
                        const pageFlow = item.renderChildren.filter(child => child.pageFlow) as T[];
                        if (pageFlow.length) {
                            if (row) {
                                item.setLayoutWidth('match_parent');
                                chainHorizontal.push(pageFlow);
                            }
                            else {
                                item.setLayoutHeight('match_parent');
                                if (previous) {
                                    const length = previous.length;
                                    let largest = previous[0];
                                    for (let j = 1; j < length; j++) {
                                        const sibling = previous[j];
                                        if (sibling.linear.right > largest.linear.right) {
                                            largest = sibling;
                                        }
                                    }
                                    if (wrapReverse) {
                                        const offset = item.linear.left - largest.actualRect('right');
                                        if (offset > 0) {
                                            item.modifyBox(BOX_STANDARD.MARGIN_LEFT, offset);
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
                    if (wrapReverse && column) {
                        node.mergeGravity('gravity', 'right');
                    }
                }
                else if (segmented.length) {
                    if (row) {
                        chainVertical.push(segmented);
                    }
                    else {
                        chainHorizontal.push(segmented);
                    }
                }
            }
            else {
                if (row) {
                    if (reverse) {
                        children.reverse();
                    }
                    chainHorizontal[0] = children;
                }
                else {
                    if (reverse) {
                        children.reverse();
                    }
                    chainVertical[0] = children;
                }
            }
            const applyLayout = (partition: T[][], horizontal: boolean) => {
                const length = partition.length;
                if (length === 0) {
                    return;
                }
                const { orientation, orientationInverse, WHL, HWL, LT, TL, RB, BR, LRTB, RLBT } = horizontal ? MAP_horizontal : MAP_vertical;
                const [dimension, dimensionInverse] = horizontal ? [node.hasHeight, node.hasWidth] : [node.hasWidth, node.hasHeight];
                const orientationWeight = `layout_constraint${capitalize(orientation)}_weight`;
                const setLayoutWeight = (chain: T, value: number) => {
                    if (chain[WHL] === 0) {
                        chain.app(orientationWeight, truncate(value, chain.localSettings.floatPrecision));
                        if (horizontal) {
                            chain.setLayoutWidth('0px');
                        }
                        else {
                            chain.setLayoutHeight('0px');
                        }
                    }
                };
                for (let i = 0; i < length; i++) {
                    const seg = partition[i];
                    const q = seg.length;
                    const segStart = seg[0];
                    const segEnd = seg[q - 1];
                    const opposing = seg === segmented;
                    const justified = !opposing && seg.every(item => item.flexbox.grow === 0);
                    const spreadInside = justified && (justifyContent === 'space-between' || justifyContent === 'space-around' && q > 1);
                    const layoutWeight: T[] = [];
                    let maxSize = 0;
                    let growAvailable = 0;
                    let parentEnd = true;
                    let baseline: Null<T> = null;
                    let growAll: boolean;
                    segStart.anchor(LT, 'parent');
                    segEnd.anchor(RB, 'parent');
                    if (opposing) {
                        growAll = false;
                        if (dimensionInverse) {
                            let chainStyle = 'spread';
                            let bias = 0;
                            switch (alignContent) {
                                case 'left':
                                case 'right':
                                case 'flex-end':
                                    bias = 1;
                                case 'baseline':
                                case 'start':
                                case 'end':
                                case 'flex-start':
                                    chainStyle = 'packed';
                                    parentEnd = false;
                                    break;
                            }
                            segStart.anchorStyle(orientation, bias, chainStyle);
                        }
                        else {
                            segStart.anchorStyle(orientation, 0, 'packed');
                        }
                    }
                    else {
                        growAll = horizontal || dimensionInverse;
                        growAvailable = 1 - adjustGrowRatio(node, seg, <DimensionAttr> WHL);
                        if (q > 1) {
                            let sizeCount = 0;
                            seg.forEach(chain => {
                                const value = (<BoxRectDimension> chain.data(FLEXBOX, 'boundsData') || chain.bounds)[HWL];
                                if (sizeCount === 0) {
                                    maxSize = value;
                                    sizeCount++;
                                }
                                else if (value === maxSize) {
                                    sizeCount++;
                                }
                                else if (value > maxSize) {
                                    maxSize = value;
                                    sizeCount = 1;
                                }
                            });
                            if (sizeCount === q) {
                                maxSize = NaN;
                            }
                        }
                    }
                    for (let j = 0; j < q; j++) {
                        const chain = seg[j];
                        const previous = seg[j - 1];
                        const next = seg[j + 1];
                        if (next) {
                            chain.anchor(RLBT, next.documentId);
                        }
                        if (previous) {
                            chain.anchor(LRTB, previous.documentId);
                        }
                        if (opposing) {
                            if (parentEnd && q > 1 && dimensionInverse) {
                                setLayoutWeight(chain, 1);
                            }
                            chain.anchor(TL, 'parent');
                        }
                        else {
                            const innerWrapped = getOuterFrameChild(chain);
                            const autoMargin = chain.innerMostWrapped.autoMargin;
                            if (horizontal) {
                                if (autoMargin.horizontal) {
                                    if (innerWrapped) {
                                        innerWrapped.mergeGravity('layout_gravity', autoMargin.leftRight ? 'center_horizontal' : chain.localizeString(autoMargin.left ? 'right' : 'left'));
                                        if (growAvailable > 0) {
                                            chain.flexbox.basis = '0%';
                                            layoutWeight.push(chain);
                                        }
                                    }
                                    else if (!autoMargin.leftRight) {
                                        if (autoMargin.left) {
                                            if (previous) {
                                                chain.anchorDelete(LRTB);
                                            }
                                        }
                                        else if (next) {
                                            chain.anchorDelete(RLBT);
                                        }
                                    }
                                }
                            }
                            else {
                                if (autoMargin.vertical) {
                                    if (innerWrapped) {
                                        innerWrapped.mergeGravity('layout_gravity', autoMargin.topBottom ? 'center_vertical' : (chain.localizeString(autoMargin.top ? 'bottom' : 'top')));
                                        if (growAvailable > 0) {
                                            chain.flexbox.basis = '0%';
                                            layoutWeight.push(chain);
                                        }
                                    }
                                    else if (!autoMargin.topBottom) {
                                        if (autoMargin.top) {
                                            if (previous) {
                                                chain.anchorDelete(LRTB);
                                            }
                                        }
                                        else if (next) {
                                            chain.anchorDelete(RLBT);
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
                                        if (baseline === null) {
                                            baseline = <Null<T>> getBaseline(seg);
                                        }
                                        if (baseline) {
                                            if (baseline !== chain) {
                                                chain.anchor('baseline', baseline.documentId);
                                            }
                                            else {
                                                chain.anchorParent(orientationInverse, 0);
                                            }
                                        }
                                    }
                                    break;
                                case 'center':
                                    chain.anchorParent(orientationInverse, 0.5);
                                    if (!horizontal && chain.textElement) {
                                        chain.mergeGravity('gravity', 'center');
                                    }
                                    break;
                                default: {
                                    const childContent = getOuterFrameChild(chain);
                                    switch (alignContent) {
                                        case 'center':
                                            if (length % 2 === 1 && i === Math.floor(length / 2)) {
                                                chain.anchorParent(orientationInverse);
                                            }
                                            else if (i < length / 2) {
                                                chain.anchor(BR, 'parent');
                                            }
                                            else if (i >= length / 2) {
                                                chain.anchor(TL, 'parent');
                                            }
                                            break;
                                        case 'space-evenly':
                                        case 'space-around':
                                            if (childContent) {
                                                childContent.mergeGravity('layout_gravity', horizontal ? 'center_vertical' : 'center_horizontal');
                                            }
                                            else {
                                                chain.anchorParent(orientationInverse);
                                            }
                                            break;
                                        case 'space-between':
                                            if (spreadInside && q === 2) {
                                                chain.anchorDelete(j === 0 ? RLBT : LRTB);
                                            }
                                            if (i === 0) {
                                                if (childContent) {
                                                    childContent.mergeGravity('layout_gravity', wrapReverse ? BR : TL);
                                                }
                                                else {
                                                    chain.anchor(wrapReverse ? BR : TL, 'parent');
                                                }
                                            }
                                            else if (length > 2 && i < length - 1) {
                                                if (childContent) {
                                                    childContent.mergeGravity('layout_gravity', horizontal ? 'center_vertical' : 'center_horizontal');
                                                }
                                                else {
                                                    chain.anchorParent(orientationInverse);
                                                }
                                            }
                                            else {
                                                if (childContent) {
                                                    childContent.mergeGravity('layout_gravity', wrapReverse ? TL : BR);
                                                }
                                                else {
                                                    chain.anchor(wrapReverse ? TL : BR, 'parent');
                                                }
                                            }
                                            break;
                                        default: {
                                            chain.anchorParent(orientationInverse);
                                            if (innerWrapped === undefined || !chain.innerMostWrapped.autoMargin[orientationInverse]) {
                                                chain.anchorStyle(orientationInverse, wrapReverse ? 1 : 0);
                                            }
                                            if (chain[HWL] === 0) {
                                                if (!horizontal && chain.blockStatic) {
                                                    setLayoutWeightOpposing(chain, 'match_parent', horizontal);
                                                }
                                                else if (isNaN(maxSize)) {
                                                    if (!horizontal && !wrap && chain.length || dimension && alignContent === 'normal') {
                                                        setLayoutWeightOpposing(chain, dimension ? '0px' : 'match_parent', horizontal);
                                                    }
                                                    else {
                                                        setLayoutWeightOpposing(chain, 'wrap_content', horizontal);
                                                    }
                                                }
                                                else if (q === 1) {
                                                    if (!horizontal) {
                                                        setLayoutWeightOpposing(chain, dimension ? '0px' : 'match_parent', horizontal);
                                                    }
                                                    else {
                                                        setLayoutWeightOpposing(chain, 'wrap_content', horizontal);
                                                    }
                                                }
                                                else if ((chain.naturalElement ? (<BoxRectDimension> chain.data(FLEXBOX, 'boundsData') || chain.bounds)[HWL] : Number.POSITIVE_INFINITY) < maxSize) {
                                                    setLayoutWeightOpposing(chain, chain.flexElement && chain.css('flexDirection').startsWith(horizontal ? 'row' : 'column') ? 'match_parent' : '0px', horizontal);
                                                    if (innerWrapped && !innerWrapped.autoMargin[orientation]) {
                                                        setLayoutWeightOpposing(innerWrapped as T, 'match_parent', horizontal);
                                                    }
                                                }
                                                else if (dimension) {
                                                    setLayoutWeightOpposing(chain, '0px', horizontal);
                                                }
                                                else {
                                                    setLayoutWeightOpposing(chain, 'wrap_content', horizontal);
                                                    chain.lockAttr('android', `layout_${HWL}`);
                                                }
                                            }
                                            break;
                                        }
                                    }
                                    break;
                                }
                            }
                            View.setFlexDimension(chain, <DimensionAttr> WHL);
                            if (!chain.innerMostWrapped.has('flexGrow')) {
                                growAll = false;
                            }
                            if (parentBottom > 0 && i === length - 1) {
                                const offset = chain.linear.bottom - parentBottom;
                                if (offset > 0) {
                                    marginBottom = Math.max(chain.linear.bottom - parentBottom, marginBottom);
                                }
                                chain.setBox(BOX_STANDARD.MARGIN_BOTTOM, { reset: 1 });
                            }
                        }
                        chain.anchored = true;
                        chain.positioned = true;
                    }
                    if (opposing) {
                        continue;
                    }
                    if (growAll) {
                        seg.forEach(item => setLayoutWeight(item, item.flexbox.grow));
                    }
                    else if (growAvailable > 0) {
                        layoutWeight.forEach(item => {
                            const autoMargin = item.innerMostWrapped.autoMargin;
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
                        });
                    }
                    if (marginBottom > 0) {
                        node.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, marginBottom);
                    }
                    if (horizontal || column) {
                        let centered = false;
                        if (justified) {
                            switch (justifyContent) {
                                case 'normal':
                                    if (column) {
                                        segStart.anchorStyle(orientation, reverse ? 1 : 0, 'packed');
                                        continue;
                                    }
                                    break;
                                case 'left':
                                    if (!horizontal) {
                                        break;
                                    }
                                case 'start':
                                case 'flex-start':
                                    segStart.anchorStyle(orientation, reverse ? 1 : 0, 'packed');
                                    continue;
                                case 'center':
                                    if (q > 1) {
                                        segStart.anchorStyle(orientation, 0.5, 'packed');
                                        continue;
                                    }
                                    centered = true;
                                    break;
                                case 'right':
                                    if (!horizontal) {
                                        break;
                                    }
                                case 'end':
                                case 'flex-end':
                                    segStart.anchorStyle(orientation, 1, 'packed');
                                    continue;
                                case 'space-between':
                                    if (q === 1) {
                                        segEnd.anchorDelete(RB);
                                        continue;
                                    }
                                    break;
                                case 'space-evenly':
                                    if (q > 1) {
                                        segStart.anchorStyle(orientation, 0, 'spread');
                                        continue;

                                    }
                                    centered = true;
                                    break;
                                case 'space-around':
                                    if (q > 1) {
                                        segStart.constraint[orientation] = false;
                                        segEnd.constraint[orientation] = false;
                                        controller.addGuideline(segStart, node, { orientation, percent: true });
                                        controller.addGuideline(segEnd, node, { orientation, percent: true, opposing: true });
                                        segStart.anchorStyle(orientation, 0, 'spread_inside');
                                        continue;
                                    }
                                    centered = true;
                                    break;
                            }
                        }
                        if (spreadInside || !wrap && seg.some(item => item.app(orientationWeight) !== '') && !sameArray(seg, item => item.app(orientationWeight))) {
                            segStart.anchorStyle(orientation, 0, 'spread_inside', false);
                        }
                        else if (!centered) {
                            segStart.anchorStyle(orientation, reverse ? 1 : 0, 'packed', false);
                        }
                    }
                }
            };
            applyLayout(chainHorizontal, true);
            applyLayout(chainVertical, false);
        }
    }
}