import View from '../view';

import { CONTAINER_NODE } from '../lib/enumeration';

import LayoutUI = squared.base.LayoutUI;

interface FlexBasis {
    item: View;
    basis: number;
    dimension: number;
    shrink: number;
    grow: number;
}

const { isLength } = squared.lib.css;
const { truncate } = squared.lib.math;
const { capitalize, iterateReverseArray, sameArray, withinRange } = squared.lib.util;

const { BOX_STANDARD, NODE_ALIGNMENT } = squared.base.lib.enumeration;

const NodeUI = squared.base.NodeUI;

const MAP_HORIZONAL = {
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

const MAP_VERTICAL = {
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
    const hasDimension = horizontal ? 'hasWidth' : 'hasHeight';
    let percent = parent[hasDimension] || horizontal && parent.blockStatic && withinRange(parent.parseWidth(parent.css('maxWidth')), parent.box.width);
    let result = 0;
    let growShrinkType = 0;
    const length = items.length;
    let i = 0;
    while (i < length) {
        const item = items[i++];
        if (percent) {
            if (horizontal) {
                if (item.innerMostWrapped.autoMargin.horizontal) {
                    percent = false;
                    break;
                }
            }
            else if (item.innerMostWrapped.autoMargin.vertical) {
                percent = false;
                break;
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
        i = 0;
        while (i < length) {
            const item = items[i++];
            const { alignSelf, basis, shrink, grow } = item.flexbox;
            const dimension = item.bounds[attr];
            let growPercent = false;
            if (grow > 0 || shrink !== 1) {
                const value = item.parseUnit(basis === 'auto' ? item.css(attr) : basis, { dimension: attr });
                if (value > 0) {
                    let largest = false;
                    if (dimension < value) {
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
                    basis: Math.min(dimension, item.parseUnit(basis, { dimension: attr })),
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
            const q = groupBasis.length;
            if (q > 1) {
                i = 0;
                while (i < q) {
                    const data = groupBasis[i++];
                    const { basis, item } = data;
                    if (item === maxBasis || basis === maxBasisUnit && (growShrinkType === 1 && maxRatio === data.shrink || growShrinkType === 2 && maxRatio === data.grow)) {
                        item.flexbox.grow = 1;
                    }
                    else if (basis > 0) {
                        item.flexbox.grow = ((data.dimension / basis) / (maxDimension / maxBasisUnit)) * basis / maxBasisUnit;
                    }
                }
            }
            let j = 0;
            while (j < percentage.length) {
                setBoxPercentage(parent, percentage[j++], attr);
            }
        }
    }
    if (horizontal && growShrinkType === 0) {
        i = 0;
        while (i < length) {
            const item = items[i++];
            if (item.find(child => child.multiline && child.ascend({ condition: above => above[hasDimension], including: parent }).length === 0, { cascade: true })) {
                i = 0;
                while (i < length) {
                    setBoxPercentage(parent, items[i++], attr);
                }
                break;
            }
        }
    }
    return result;
}

function getBaseline(nodes: View[]) {
    const length = nodes.length;
    let i = 0;
    while (i < length) {
        const node = nodes[i++];
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
        item = item.innerWrapped as View;
    }
    return undefined;
}

function setLayoutWeight(node: View, horizontal: boolean, dimension: string, attr: string, value: number) {
    if (node[dimension] === 0) {
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

export default class <T extends View> extends squared.base.extensions.Flexbox<T> {
    public processNode(node: T, parent: T) {
        super.processNode(node, parent);
        const mainData: FlexboxData<T> = node.data(this.name, 'mainData');
        const { rowCount, columnCount } = mainData;
        if (rowCount === 1 && mainData.row || columnCount === 1 && mainData.column) {
            node.containerType = CONTAINER_NODE.CONSTRAINT;
            node.addAlign(NODE_ALIGNMENT.AUTO_LAYOUT);
            node.addAlign(mainData.column ? NODE_ALIGNMENT.VERTICAL : NODE_ALIGNMENT.HORIZONTAL);
            mainData.wrap = false;
            return {
                include: true,
                complete: true
            };
        }
        else {
            return {
                output: this.application.renderNode(LayoutUI.create({
                    parent,
                    node,
                    containerType: CONTAINER_NODE.CONSTRAINT,
                    alignmentType: NODE_ALIGNMENT.AUTO_LAYOUT | (mainData.column ? NODE_ALIGNMENT.HORIZONTAL : NODE_ALIGNMENT.VERTICAL),
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
                const mainData: FlexboxData<T> = parent.data(this.name, 'mainData');
                if (mainData) {
                    const index = mainData.children.findIndex(item => item === node);
                    if (index !== -1) {
                        const container = (this.controller as android.base.Controller<T>).createNodeWrapper(node, parent);
                        container.cssApply({
                            marginTop: '0px',
                            marginRight: '0px',
                            marginBottom: '0px',
                            marginLeft: '0px',
                            display: 'block',
                        }, true);
                        container.saveAsInitial();
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
        const mainData: FlexboxData<T> = node.data(this.name, 'mainData');
        if (mainData) {
            const controller = this.controller as android.base.Controller<T>;
            const { row, column, reverse, wrap, wrapReverse, alignContent, justifyContent, children } = mainData;
            const parentBottom = node.hasPX('height', { percent: false }) || node.percentHeight > 0 ? node.linear.bottom : 0;
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
                                    let j = 1;
                                    while (j < length) {
                                        const sibling = previous[j++];
                                        if (sibling.linear.right > largest.linear.right) {
                                            largest = sibling;
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
            else {
                if (row) {
                    chainHorizontal[0] = children;
                }
                else {
                    chainVertical[0] = children;
                }
            }
            const applyLayout = (partition: T[][], horizontal: boolean) => {
                const length = partition.length;
                if (length === 0) {
                    return;
                }
                const { orientation, orientationInverse, WHL, HWL, LT, TL, RB, BR, LRTB, RLBT } = horizontal ? MAP_HORIZONAL : MAP_VERTICAL;
                const [dimension, dimensionInverse] =
                    horizontal
                        ? [node.hasHeight, node.hasWidth]
                        : [node.hasWidth, node.hasHeight];
                const orientationWeight = `layout_constraint${capitalize(orientation)}_weight`;
                for (let i = 0; i < length; ++i) {
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
                    let percentWidth = 0;
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
                            segStart.anchorStyle(orientation, 0, 'spread_inside', false);
                        }
                    }
                    else {
                        growAll = horizontal || dimensionInverse;
                        growAvailable = 1 - adjustGrowRatio(node, seg, WHL as DimensionAttr);
                        if (q > 1) {
                            let sizeCount = 0;
                            let j = 0;
                            while (j < q) {
                                const chain = seg[j++];
                                const value = (chain.data(this.name, 'boundsData') as BoxRectDimension || chain.bounds)[HWL];
                                if (sizeCount === 0) {
                                    maxSize = value;
                                    ++sizeCount;
                                }
                                else if (value === maxSize) {
                                    ++sizeCount;
                                }
                                else if (value > maxSize) {
                                    maxSize = value;
                                    sizeCount = 1;
                                }
                            }
                            if (sizeCount === q) {
                                maxSize = NaN;
                            }
                            if (horizontal) {
                                percentWidth = View.availablePercent(seg, 'width', node.box.width);
                            }
                        }
                    }
                    for (let j = 0; j < q; ++j) {
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
                                        innerWrapped.mergeGravity('layout_gravity', autoMargin.leftRight
                                            ? 'center_horizontal'
                                            : autoMargin.left
                                                ? chain.localizeString('right')
                                                : chain.localizeString('left')
                                        );
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
                                    innerWrapped.mergeGravity('layout_gravity', autoMargin.topBottom
                                        ? 'center_vertical'
                                        : autoMargin.top
                                            ? 'bottom'
                                            : 'top'
                                    );
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
                                            return;
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
                                        if (!baseline) {
                                            baseline = getBaseline(seg) as Null<T>;
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
                                            else if (childContent) {
                                                childContent.mergeGravity('layout_gravity', wrapReverse ? TL : BR);
                                            }
                                            else {
                                                chain.anchor(wrapReverse ? TL : BR, 'parent');
                                            }
                                            break;
                                        default: {
                                            chain.anchorParent(orientationInverse);
                                            if (!innerWrapped || !chain.innerMostWrapped.autoMargin[orientationInverse]) {
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
                                                else if ((chain.naturalElement ? (chain.data(this.name, 'boundsData') as BoxRectDimension || chain.bounds)[HWL] : Infinity) < maxSize) {
                                                    setLayoutWeightOpposing(chain,
                                                        chain.flexElement && chain.css('flexDirection').startsWith(horizontal ? 'row' : 'column')
                                                            ? 'match_parent'
                                                            : '0px'
                                                    , horizontal);
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
                            percentWidth = View.setFlexDimension(chain, WHL as DimensionAttr, percentWidth);
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
                        let j = 0;
                        while (j < q) {
                            const item = seg[j++];
                            setLayoutWeight(item, horizontal, WHL, orientationWeight, item.flexbox.grow);
                        }
                    }
                    else if (growAvailable > 0) {
                        let j = 0;
                        while (j < layoutWeight.length) {
                            const item = layoutWeight[j++];
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