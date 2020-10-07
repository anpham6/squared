import BOX_STANDARD = squared.base.lib.constant.BOX_STANDARD;
import NODE_ALIGNMENT = squared.base.lib.constant.NODE_ALIGNMENT;

import { CONTAINER_NODE } from '../lib/constant';

import View from '../view';

import NodeUI = squared.base.NodeUI;
import LayoutUI = squared.base.LayoutUI;

import { ascendFlexibleHeight, ascendFlexibleWidth } from '../view-mx';

interface FlexBasis {
    item: View;
    size: number;
    basis: number;
    shrink: number;
    grow: number;
}

const { isLength } = squared.lib.css;
const { truncate } = squared.lib.math;
const { capitalize, iterateReverseArray, sameArray } = squared.lib.util;

function adjustGrowRatio(parent: View, items: View[], dimension: DimensionAttr) {
    const horizontal = dimension === 'width';
    let percent = parent[horizontal ? 'hasWidth' : 'hasHeight'] || horizontal && ascendFlexibleWidth(parent) || !horizontal && ascendFlexibleHeight(parent),
        growShrinkType = 0,
        result = 0;
    const length = items.length;
    for (let i = 0; i < length; ++i) {
        const item = items[i];
        if (percent) {
            const autoMargin = item.innerMostWrapped.autoMargin;
            if (horizontal) {
                if (autoMargin.horizontal) {
                    percent = false;
                    break;
                }
            }
            else if (autoMargin.vertical) {
                percent = false;
                break;
            }
        }
        result += item.flexbox.grow;
    }
    if (length > 1 && (horizontal || percent)) {
        const groupBasis: FlexBasis[] = [];
        const percentage: View[] = [];
        const options: NodeParseUnitOptions = { dimension };
        let maxBasisUnit = 0,
            maxDimension = 0,
            maxRatio = NaN,
            maxBasis: Undef<View>;
        for (let i = 0; i < length; ++i) {
            const item = items[i].innerMostWrapped as View;
            const { alignSelf, basis, shrink, grow } = item.flexbox;
            const size = item.bounds[dimension];
            let growPercent: Undef<boolean>;
            if (grow > 0 || shrink !== 1) {
                const value = item.parseUnit(basis === 'auto' ? item.css(dimension) : basis, options);
                if (value) {
                    let largest: Undef<boolean>;
                    if (size < value) {
                        if (isNaN(maxRatio) || shrink < maxRatio) {
                            maxRatio = shrink;
                            largest = true;
                            growShrinkType = 1;
                        }
                    }
                    else if (isNaN(maxRatio) || grow > maxRatio) {
                        maxRatio = grow;
                        largest = true;
                        growShrinkType = 2;
                    }
                    if (largest) {
                        maxBasis = item;
                        maxBasisUnit = value;
                        maxDimension = size;
                    }
                    groupBasis.push({
                        item,
                        size,
                        basis: value,
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
                    size,
                    basis: Math.min(size, item.parseUnit(basis, options)),
                    shrink,
                    grow
                });
                item.flexbox.basis = 'auto';
                continue;
            }
            if (alignSelf === 'auto' && (growPercent || percent && !item[horizontal ? 'hasWidth' : 'hasHeight'])) {
                percentage.push(item);
            }
        }
        if (growShrinkType) {
            if (groupBasis.length > 1) {
                for (let i = 0, q = groupBasis.length; i < q; ++i) {
                    const data = groupBasis[i];
                    const { basis, item } = data;
                    if (item === maxBasis || basis === maxBasisUnit && (growShrinkType === 1 && maxRatio === data.shrink || growShrinkType === 2 && maxRatio === data.grow)) {
                        item.flexbox.grow = 1;
                    }
                    else if (basis) {
                        item.flexbox.grow = ((data.size / basis) / (maxDimension / maxBasisUnit)) * basis / maxBasisUnit;
                    }
                }
            }
            for (let i = 0, q = percentage.length; i < q; ++i) {
                setBoxPercentage(parent, percentage[i], dimension);
            }
        }
    }
    if (horizontal && growShrinkType === 0) {
        for (let i = 0; i < length; ++i) {
            if (hasMultiline(parent, items[i])) {
                for (let j = 0; j < length; ++j) {
                    setBoxPercentage(parent, items[j], dimension);
                }
                break;
            }
        }
    }
    return result;
}

function getBaseline(nodes: View[]) {
    for (let i = 0, length = nodes.length; i < length; ++i) {
        const node = nodes[i];
        const target = node.wrapperOf || node;
        if (target.textElement && target.css('verticalAlign') === 'baseline') {
            return node;
        }
    }
    return NodeUI.baseline(nodes);
}

function setLayoutWeightOpposing(item: View, value: string, horizontal: boolean) {
    if (horizontal) {
        item.setLayoutHeight(value);
    }
    else {
        item.setLayoutWidth(value);
    }
}

function getOuterFrameChild(item: Undef<View>) {
    while (item) {
        if (item.layoutFrame) {
            return item.innerWrapped;
        }
        item = item.innerWrapped as Undef<View>;
    }
}

function setLayoutWeight(node: View, horizontal: boolean, dimension: string, attr: string, value: number) {
    if (value > 0 && node[dimension] === 0) {
        node.app(attr, truncate(value, node.localSettings.floatPrecision));
        if (horizontal) {
            node.setLayoutWidth('0px');
        }
        else {
            node.setLayoutHeight('0px');
        }
    }
}

const setBoxPercentage = (parent: View, node: View, attr: DimensionAttr) => node.flexbox.basis = (node.bounds[attr] / parent.box[attr] * 100) + '%';
const hasMultiline = (parent: View, node: View) => node.find(child => child.multiline && child.ascend({ condition: above => above.hasWidth, including: parent }).length === 0, { cascade: true });

export default class <T extends View> extends squared.base.extensions.Flexbox<T> {
    public processNode(node: T, parent: T): ExtensionResult<T> {
        super.processNode(node, parent);
        const mainData = this.data.get(node) as FlexboxData<T>;
        if (mainData.row && mainData.rowCount === 1 || mainData.column && mainData.columnCount === 1) {
            node.containerType = CONTAINER_NODE.CONSTRAINT;
            node.addAlign(NODE_ALIGNMENT.AUTO_LAYOUT);
            node.addAlign(mainData.column ? NODE_ALIGNMENT.VERTICAL : NODE_ALIGNMENT.HORIZONTAL);
            node.flexdata.wrap = false;
            mainData.singleRow = true;
            return {
                include: true,
                complete: true
            };
        }
        return {
            output: this.application.renderNode(LayoutUI.create({
                parent,
                node,
                containerType: CONTAINER_NODE.CONSTRAINT,
                alignmentType: NODE_ALIGNMENT.AUTO_LAYOUT | (mainData.column ? NODE_ALIGNMENT.HORIZONTAL : NODE_ALIGNMENT.VERTICAL),
                itemCount: node.size(),
                rowCount: mainData.rowCount,
                columnCount: mainData.columnCount
            })),
            include: true,
            complete: true
        };
    }

    public processChild(node: T, parent: T) {
        if (node.hasAlign(NODE_ALIGNMENT.SEGMENTED)) {
            return {
                output: this.application.renderNode(
                    new LayoutUI(
                        parent,
                        node,
                        CONTAINER_NODE.CONSTRAINT,
                        NODE_ALIGNMENT.AUTO_LAYOUT
                    )
                ),
                complete: true,
                subscribe: true
            };
        }
        else if (node.autoMargin.horizontal || parent.hasHeight && node.autoMargin.vertical) {
            const mainData = this.data.get(parent) as Undef<FlexboxData<T>>;
            if (mainData) {
                const index = mainData.children.findIndex(item => item === node);
                if (index !== -1) {
                    const container = this.controller.createNodeWrapper(node, parent);
                    container.cssApply({
                        marginTop: '0px',
                        marginRight: '0px',
                        marginBottom: '0px',
                        marginLeft: '0px',
                        display: 'block'
                    });
                    container.saveAsInitial();
                    container.setCacheValue('flexbox', node.flexbox);
                    mainData.children[index] = container;
                    if (!node.hasWidth && node.autoMargin.horizontal) {
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
                                NODE_ALIGNMENT.SINGLE
                            )
                        )
                    };
                }
            }
        }
    }

    public postBaseLayout(node: T) {
        const mainData = this.data.get(node) as Undef<FlexboxData<T>>;
        if (mainData) {
            const controller = this.controller as android.base.Controller<T>;
            const { row, column, reverse, wrap, wrapReverse, alignContent, justifyContent, children } = mainData;
            const parentBottom = node.hasPX('height', { percent: false }) || node.percentHeight ? node.linear.bottom : 0;
            const chainHorizontal: T[][] = [];
            const chainVertical: T[][] = [];
            const segmented: T[] = [];
            let marginBottom = 0;
            if (!mainData.singleRow) {
                node.each((item: T) => {
                    if (item.hasAlign(NODE_ALIGNMENT.SEGMENTED)) {
                        const segment = item.renderChildren.filter(child => child.pageFlow) as T[];
                        if (children.length) {
                            if (row) {
                                item.setLayoutWidth('match_parent');
                                chainHorizontal.push(segment);
                            }
                            else {
                                item.setLayoutHeight('match_parent');
                                chainVertical.push(segment);
                            }
                            segmented.push(item);
                        }
                    }
                });
                if (row) {
                    chainVertical.push(segmented);
                }
                else {
                    if (wrapReverse) {
                        const item = chainVertical[0][0];
                        const offset = item.linear.left - node.box.left;
                        if (offset > 0) {
                            item.modifyBox(BOX_STANDARD.MARGIN_LEFT, offset);
                        }
                        else {
                            segmented[0].anchorStyle('horizontal', 0, 'packed');
                        }
                    }
                    else {
                        const item = chainVertical[chainVertical.length - 1][0];
                        const offset = node.box.right - item.linear.right;
                        if (offset > 0) {
                            item.modifyBox(BOX_STANDARD.MARGIN_RIGHT, offset);
                        }
                        else {
                            segmented[0].anchorStyle('horizontal', 0, 'packed');
                        }
                    }
                    chainHorizontal.push(segmented);
                }
            }
            else if (row) {
                chainHorizontal[0] = children;
            }
            else {
                chainVertical[0] = children;
            }
            let orientation: OrientationAttr,
                orientationInverse: OrientationAttr,
                WHL: DimensionAttr,
                HWL: DimensionAttr,
                LT: AnchorPositionAttr,
                TL: AnchorPositionAttr,
                RB: AnchorPositionAttr,
                BR: AnchorPositionAttr,
                LRTB: AnchorPositionAttr,
                RLBT: AnchorPositionAttr,
                dimension: boolean,
                dimensionInverse: boolean;
            for (let i = 0; i < 2; ++i) {
                const horizontal = i === 0;
                const partition = horizontal ? chainHorizontal : chainVertical;
                const length = partition.length;
                if (length === 0) {
                    continue;
                }
                if (horizontal) {
                    orientation = 'horizontal';
                    orientationInverse = 'vertical';
                    WHL = 'width';
                    HWL = 'height';
                    LT = 'left';
                    TL = 'top';
                    RB = 'right';
                    BR = 'bottom';
                    LRTB = 'leftRight';
                    RLBT = 'rightLeft';
                    dimension = node.hasHeight;
                    dimensionInverse = node.hasWidth;
                }
                else {
                    orientation = 'vertical';
                    orientationInverse = 'horizontal';
                    WHL = 'height';
                    HWL = 'width';
                    LT = 'top';
                    TL = 'left';
                    RB = 'bottom';
                    BR = 'right';
                    LRTB = 'topBottom';
                    RLBT = 'bottomTop';
                    dimension = node.hasWidth;
                    dimensionInverse = node.hasHeight;
                }
                const orientationWeight = `layout_constraint${capitalize(orientation)}_weight`;
                for (let j = 0; j < length; ++j) {
                    const seg = partition[j];
                    const q = seg.length;
                    const segStart = seg[0];
                    const segEnd = seg[q - 1];
                    const opposing = seg === segmented;
                    const layoutWeight: T[] = [];
                    let maxSize = 0,
                        growAvailable = 0,
                        percentWidth = 0,
                        parentEnd = true,
                        baseline: Null<T> = null,
                        inlineWidth: Undef<boolean>,
                        spreadInside: Undef<boolean>,
                        growAll: Undef<boolean>;
                    segStart.anchor(LT, 'parent');
                    segEnd.anchor(RB, 'parent');
                    if (opposing) {
                        if (dimensionInverse) {
                            let chainStyle = 'spread',
                                bias = 0;
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
                            segStart.anchorStyle(orientation, 0, 'spread_inside', false);
                        }
                    }
                    else {
                        const setGrowAvailable = () => growAvailable = 1 - adjustGrowRatio(node, seg, WHL);
                        inlineWidth = seg.every(item => item.flexbox.grow === 0);
                        if (!inlineWidth || horizontal && seg.some(item => item.flexbox.basis !== 'auto' || item.hasPX('maxWidth') || item.autoMargin.horizontal) || !horizontal && dimensionInverse && seg.some(item => item.flexbox.basis !== 'auto' || item.hasPX('maxHeight') || item.autoMargin.vertical)) {
                            growAll = horizontal && !seg.some(item => item.autoMargin.horizontal) || !horizontal && dimensionInverse && !seg.some(item => item.autoMargin.vertical);
                            setGrowAvailable();
                        }
                        else if (horizontal && seg.some(item => hasMultiline(node, item))) {
                            setGrowAvailable();
                        }
                        spreadInside = inlineWidth && (justifyContent === 'space-between' || justifyContent === 'space-around' && q > 1);
                        if (q > 1) {
                            let sizeCount = 1,
                                maxDimension = 0;
                            for (let k = 0; k < q; ++k) {
                                const chain = seg[k];
                                const value = (chain.data<BoxRectDimension>(this.name, 'boundsData') || chain.bounds)[HWL];
                                if (k === 0) {
                                    maxSize = value;
                                }
                                else if (value === maxSize) {
                                    ++sizeCount;
                                }
                                else if (value > maxSize) {
                                    maxSize = value;
                                    sizeCount = 1;
                                }
                                if (chain[HWL]) {
                                    maxDimension = Math.max(maxDimension, value);
                                }
                            }
                            if (maxDimension === maxSize) {
                                maxSize = Infinity;
                            }
                            else if (sizeCount === q) {
                                maxSize = NaN;
                            }
                            if (horizontal) {
                                percentWidth = View.availablePercent(seg, 'width', node.box.width);
                            }
                        }
                    }
                    for (let k = 0; k < q; ++k) {
                        const chain = seg[k];
                        const previous = seg[k - 1];
                        const next = seg[k + 1];
                        if (next) {
                            chain.anchor(RLBT, next.documentId);
                        }
                        if (previous) {
                            chain.anchor(LRTB, previous.documentId);
                        }
                        if (opposing) {
                            chain.anchor(TL, 'parent');
                            if (parentEnd) {
                                if (dimensionInverse) {
                                    setLayoutWeight(chain, horizontal, WHL, orientationWeight, 1);
                                }
                                else {
                                    chain.anchor(BR, 'parent');
                                    chain.anchorStyle(orientationInverse, reverse ? 1 : 0, 'packed');
                                }
                            }
                        }
                        else {
                            const innerWrapped = getOuterFrameChild(chain);
                            const autoMargin = chain.innerMostWrapped.autoMargin;
                            if (horizontal) {
                                if (autoMargin.horizontal) {
                                    if (innerWrapped) {
                                        innerWrapped.mergeGravity('layout_gravity', autoMargin.leftRight ? 'center_horizontal' : autoMargin.left ? chain.localizeString('right') : chain.localizeString('left'));
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
                            else if (autoMargin.vertical) {
                                if (innerWrapped) {
                                    innerWrapped.mergeGravity('layout_gravity', autoMargin.topBottom ? 'center_vertical' : autoMargin.top ? 'bottom' : 'top');
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
                            switch (chain.flexbox.alignSelf) {
                                case 'first baseline':
                                    if (TL === 'top' && chain.baselineElement) {
                                        const first = seg.find(item => item !== chain && item.baselineElement);
                                        if (first) {
                                            chain.anchor('baseline', first.documentId);
                                            break;
                                        }
                                    }
                                case 'start':
                                case 'flex-start':
                                    chain.anchor(TL, 'parent');
                                    break;
                                case 'last baseline':
                                    if (BR === 'bottom' && chain.baselineElement) {
                                        const index = iterateReverseArray(seg, item => {
                                            if (item !== chain && item.baselineElement) {
                                                chain.anchor('baseline', item.documentId);
                                                return true;
                                            }
                                        });
                                        if (index === Infinity) {
                                            break;
                                        }
                                    }
                                case 'end':
                                case 'flex-end':
                                    chain.anchor(BR, 'parent');
                                    break;
                                case 'baseline':
                                    if (horizontal) {
                                        if (baseline ||= getBaseline(seg) as Null<T>) {
                                            if (baseline !== chain) {
                                                chain.anchor('baseline', baseline.documentId);
                                            }
                                            else {
                                                chain.anchorParent(orientationInverse, 0);
                                            }
                                        }
                                        else {
                                            chain.anchor('top', 'parent');
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
                                            if (length % 2 === 1 && j === Math.floor(length / 2)) {
                                                chain.anchorParent(orientationInverse);
                                            }
                                            else if (j < length / 2) {
                                                chain.anchor(BR, 'parent');
                                            }
                                            else if (j >= length / 2) {
                                                chain.anchor(TL, 'parent');
                                            }
                                            break;
                                        case 'flex-end':
                                            chain.anchorParent(orientationInverse, 1);
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
                                            if (j === 0) {
                                                if (childContent) {
                                                    childContent.mergeGravity('layout_gravity', wrapReverse ? BR : TL);
                                                }
                                                else {
                                                    chain.anchor(wrapReverse ? BR : TL, 'parent');
                                                }
                                            }
                                            else if (length > 2 && j < length - 1) {
                                                if (childContent) {
                                                    childContent.mergeGravity('layout_gravity', horizontal ? 'center_vertical' : 'center_horizontal');
                                                }
                                                else {
                                                    chain.anchorParent(orientationInverse);
                                                }
                                            }
                                            else if (childContent) {
                                                childContent.mergeGravity('layout_gravity', wrapReverse ? TL : BR);
                                            }
                                            else {
                                                chain.anchor(wrapReverse ? TL : BR, 'parent');
                                            }
                                            break;
                                        default:
                                            chain.anchorParent(orientationInverse);
                                            if (!innerWrapped || !chain.innerMostWrapped.autoMargin[orientationInverse]) {
                                                chain.anchorStyle(orientationInverse, wrapReverse ? 1 : 0);
                                            }
                                            if (chain[HWL] === 0) {
                                                const getMinSize = () => {
                                                    let size = 0;
                                                    chain.cascade(item => {
                                                        if (item.pageFlow) {
                                                            if (item.hasPX(HWL, { percent: false })) {
                                                                size = Math.max(size, item.bounds[HWL]);
                                                            }
                                                        }
                                                        else {
                                                            return false;
                                                        }
                                                    });
                                                    return size;
                                                };
                                                if (maxSize > 0 && !chain.isEmpty() && getMinSize() >= maxSize) {
                                                    setLayoutWeightOpposing(chain, 'wrap_content', horizontal);
                                                    break;
                                                }
                                                else if (maxSize === Infinity) {
                                                    setLayoutWeightOpposing(chain, '0px', horizontal);
                                                    break;
                                                }
                                                const belowSize = (chain.naturalElement ? (chain.data<BoxRectDimension>(this.name, 'boundsData') || chain.bounds)[HWL] : Infinity) < maxSize;
                                                if (!horizontal && chain.blockStatic) {
                                                    setLayoutWeightOpposing(chain, belowSize ? '0px' : 'match_parent', horizontal);
                                                }
                                                else if (isNaN(maxSize)) {
                                                    setLayoutWeightOpposing(
                                                        chain,
                                                        !horizontal && !wrap && !chain.isEmpty() || dimension && alignContent === 'normal'
                                                            ? dimension ? '0px' : 'match_parent'
                                                            : 'wrap_content',
                                                        horizontal
                                                    );
                                                }
                                                else if (q === 1) {
                                                    setLayoutWeightOpposing(
                                                        chain,
                                                        !horizontal
                                                            ? dimension ? '0px' : 'match_parent'
                                                            : node.flexbox.alignSelf === 'stretch' && node.actualParent!.flexdata.row && (node.hasHeight || !node.inlineHeight) ? '0px' : 'wrap_content',
                                                        horizontal
                                                    );
                                                }
                                                else if (belowSize) {
                                                    setLayoutWeightOpposing(chain, !horizontal && chain.flexElement && chain.flexdata.row ? 'match_parent' : '0px', horizontal);
                                                    if (innerWrapped && !innerWrapped.autoMargin[orientation]) {
                                                        setLayoutWeightOpposing(innerWrapped as T, 'match_parent', horizontal);
                                                    }
                                                }
                                                else if (dimension) {
                                                    setLayoutWeightOpposing(chain, '0px', horizontal);
                                                }
                                                else {
                                                    setLayoutWeightOpposing(chain, 'wrap_content', horizontal);
                                                    chain.lockAttr('android', 'layout_' + HWL);
                                                }
                                            }
                                            break;
                                    }
                                    break;
                                }
                            }
                            percentWidth = chain.setFlexDimension(WHL, percentWidth);
                            if (horizontal && wrap && !chain.layoutWidth && !chain[WHL]) {
                                chain.setLayoutWidth('wrap_content');
                            }
                            if (parentBottom > 0 && j === length - 1) {
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
                        for (let k = 0; k < q; ++k) {
                            const item = seg[k];
                            setLayoutWeight(item, horizontal, WHL, orientationWeight, item.flexbox.grow);
                        }
                    }
                    else if (growAvailable > 0) {
                        for (let k = 0, r = layoutWeight.length; k < r; ++k) {
                            const item = layoutWeight[k];
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
                            setLayoutWeight(item, horizontal, WHL, orientationWeight, Math.max(item.flexbox.grow, (growAvailable * ratio) / layoutWeight.length));
                        }
                    }
                    if (marginBottom > 0) {
                        node.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, marginBottom);
                    }
                    if (horizontal || column) {
                        let centered: Undef<boolean>;
                        if (inlineWidth) {
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
                                        const options: GuidelineOptions<T> = {
                                            target: segStart,
                                            parent: node,
                                            orientation,
                                            percent: true
                                        };
                                        controller.addGuideline(options);
                                        options.target = segEnd;
                                        options.opposing = true;
                                        controller.addGuideline(options);
                                        segStart.anchorStyle(orientation, 0, 'spread_inside');
                                        continue;
                                    }
                                    centered = true;
                                    break;
                            }
                        }
                        if (spreadInside || !wrap && seg.some(item => item.app(orientationWeight)) && !sameArray(seg, item => item.app(orientationWeight))) {
                            segStart.anchorStyle(orientation, 0, 'spread_inside', false);
                        }
                        else if (!centered) {
                            segStart.anchorStyle(orientation, reverse ? 1 : 0, 'packed', false);
                        }
                    }
                }
            }
        }
    }
}