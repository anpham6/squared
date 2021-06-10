import BOX_STANDARD = squared.base.lib.constant.BOX_STANDARD;
import NODE_ALIGNMENT = squared.base.lib.constant.NODE_ALIGNMENT;
import CONTAINER_NODE = android.lib.constant.CONTAINER_NODE;

import View from '../view';

import NodeUI = squared.base.NodeUI;
import LayoutUI = squared.base.LayoutUI;

import { ascendFlexibleHeight, ascendFlexibleWidth } from '../view-mx';

interface FlexBasis<T> {
    item: T;
    size: number;
    basis: number;
    shrink: number;
    grow: number;
}

const { asPercent, formatPX, isLength, isPercent } = squared.lib.css;
const { truncate } = squared.lib.math;
const { capitalize, iterateReverseArray, lastItemOf } = squared.lib.util;

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

function setLayoutWeightOpposing(node: View, horizontal: boolean, value: string) {
    if (horizontal) {
        node.setLayoutHeight(value, node.naturalChild);
    }
    else {
        node.setLayoutWidth(value, node.naturalChild);
        const innerWrapped = node.innerWrapped;
        if (innerWrapped) {
            innerWrapped.setLayoutWidth('match_parent', false);
        }
    }
}

function getOuterFrameChild(node: View) {
    if (node.layoutFrame && node.hasAlign(NODE_ALIGNMENT.COLUMN)) {
        return node.innerMostWrapped as View;
    }
    while (!node.naturalChild) {
        if (node.layoutFrame && node.hasAlign(NODE_ALIGNMENT.COLUMN)) {
            if (!node.constraint.vertical) {
                node.anchor('top', 'parent');
            }
            break;
        }
        node = node.parent as View;
    }
}

function setLayoutWeight(node: View, horizontal: boolean, attr: string, value: number) {
    if (value > 0) {
        node.app(attr, truncate(value, node.localSettings.floatPrecision));
        if (horizontal) {
            node.setLayoutWidth('0px');
        }
        else {
            node.setLayoutHeight('0px');
        }
    }
}

function setBoxPercentage(node: View, parent: View, attr: DimensionAttr) {
    const flexbox = node.flexbox;
    flexbox.grow = 0;
    flexbox.shrink = 1;
    flexbox.basis = (node.bounds[attr] / parent.box[attr] * 100) + '%';
}

const hasMultiline = (node: View, parent: View) => node.find(child => child.multiline && child.ascend({ condition: above => above.hasWidth, including: parent }).length === 0, { cascade: item => !item.hasUnit('width', { percent: false }) });

export default class <T extends View> extends squared.base.extensions.Flexbox<T> {
    public processNode(node: T, parent: T): ExtensionResult<T> {
        super.processNode(...(arguments as unknown) as [T, T]);
        const mainData = this.data.get(node) as FlexboxData<T>;
        if (mainData.singleRow) {
            node.containerType = CONTAINER_NODE.CONSTRAINT;
            node.addAlign(NODE_ALIGNMENT.AUTO_LAYOUT);
            node.addAlign(mainData.column ? NODE_ALIGNMENT.VERTICAL : NODE_ALIGNMENT.HORIZONTAL);
            node.flexdata.wrap = false;
            return { include: true, complete: true };
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
        const mainData = this.data.get(parent) as Undef<FlexboxData<T>>;
        if (mainData) {
            const children = mainData.children;
            if (children.length > 1) {
                const index = children.indexOf(node);
                if (index !== -1) {
                    const autoMargin = node.autoMargin;
                    if (mainData.row && (autoMargin.leftRight || autoMargin.horizontal && (!node.onlyStaticChild || node.percentWidth < 1)) || mainData.column && (autoMargin.topBottom || autoMargin.vertical && (!node.onlyStaticChild || node.percentHeight < 1))) {
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
                        if (mainData.column && node.percentWidth === 1) {
                            container.setLayoutWidth('match_parent');
                        }
                        if (mainData.row && node.percentHeight === 1) {
                            container.setLayoutHeight('match_parent');
                        }
                        return {
                            parent: container,
                            renderAs: container,
                            outputAs: this.application.renderNode(
                                new LayoutUI(
                                    parent,
                                    container,
                                    CONTAINER_NODE.FRAME,
                                    NODE_ALIGNMENT.SINGLE | NODE_ALIGNMENT.COLUMN
                                )
                            )
                        };
                    }
                }
            }
        }
    }

    public postBaseLayout(node: T) {
        const mainData = this.data.get(node) as Undef<FlexboxData<T>>;
        if (mainData) {
            const { row, column, rowGap, columnGap, reverse, wrap, wrapReverse, alignContent, justifyContent, children } = mainData;
            const parentBottom = node.hasUnit('height', { percent: false }) || node.percentHeight ? node.linear.bottom : 0;
            const chainHorizontal: T[][] = [];
            const chainVertical: T[][] = [];
            const segmented: T[] = [];
            const setRowGap = (items: T[]) => {
                if (rowGap > 0) {
                    for (let i = 0, length = items.length - 1; i < length; ++i) {
                        items[i].modifyBox(BOX_STANDARD.MARGIN_BOTTOM, rowGap);
                    }
                }
            };
            const setColumnGap = (items: T[]) => {
                if (columnGap > 0) {
                    for (let i = 0, length = items.length - 1; i < length; ++i) {
                        items[i].modifyBox(BOX_STANDARD.MARGIN_RIGHT, rowGap);
                    }
                }
            };
            if (!mainData.singleRow) {
                node.each((item: T) => {
                    if (item.hasAlign(NODE_ALIGNMENT.SEGMENTED) && item.rendering) {
                        if (row) {
                            item.setLayoutWidth('match_parent');
                            chainHorizontal.push(item.renderChildren as T[]);
                        }
                        else {
                            item.setLayoutHeight('match_parent');
                            chainVertical.push(item.renderChildren as T[]);
                        }
                        segmented.push(item);
                    }
                });
                if (row) {
                    chainVertical.push(segmented);
                    setRowGap(segmented);
                }
                else {
                    if (wrapReverse) {
                        const item = chainVertical[0][0];
                        const offset = item.linear.left - node.box.left;
                        if (offset > 0) {
                            item.modifyBox(BOX_STANDARD.MARGIN_LEFT, offset);
                        }
                        else {
                            segmented[0].anchorStyle('horizontal', 0, segmented.length > 1 ? 'packed' : undefined);
                        }
                    }
                    else {
                        const item = lastItemOf(chainVertical)![0];
                        const offset = node.box.right - item.linear.right;
                        if (offset > 0) {
                            item.modifyBox(BOX_STANDARD.MARGIN_RIGHT, offset);
                        }
                        else {
                            segmented[0].anchorStyle('horizontal', 0, segmented.length > 1 ? 'packed' : undefined);
                        }
                    }
                    chainHorizontal.push(segmented);
                    setColumnGap(segmented);
                }
            }
            else {
                const renderChildren = children.map(item => item.outerMostWrapper) as T[];
                if (row) {
                    chainHorizontal[0] = renderChildren;
                    setRowGap(renderChildren);
                }
                else {
                    chainVertical[0] = renderChildren;
                    setColumnGap(renderChildren);
                }
            }
            let marginBottom = 0,
                orientation: OrientationAttr,
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
                    const chained = q > 1;
                    let maxSize = 0,
                        grow = 0,
                        gap = 0,
                        percentAvailable = 0,
                        percentGap = 0,
                        parentEnd = true,
                        baseline: Null<T> = null,
                        emptyContent: Undef<T[]>,
                        anchoring: Null<T> = null,
                        spreadInside = justifyContent === 'space-between',
                        boundsWeight = 0;
                    segStart.anchor(LT, 'parent');
                    segEnd.anchor(RB, 'parent');
                    if (opposing) {
                        let chainStyle: LayoutChainStyle = 'spread',
                            bias = 0;
                        if (dimensionInverse) {
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
                        }
                        else {
                            chainStyle = 'spread_inside';
                        }
                        segStart.anchorStyle(orientation, bias, chained ? chainStyle : undefined);
                    }
                    else {
                        if (!spreadInside && chained) {
                            spreadInside = justifyContent === 'space-around' || grow >= 1 && !wrap;
                        }
                        [grow, boundsWeight] = this.adjustGrowRatio(node, seg, WHL, spreadInside);
                        if (chained) {
                            let sizeCount = 1,
                                maxDimension = 0;
                            for (let k = 0; k < q; ++k) {
                                const item = seg[k].innerMostWrapped as T;
                                const value = (item.data<BoxRectDimension>(this.name, 'boundsData') || item.bounds)[HWL];
                                if (k === 0) {
                                    maxSize = value;
                                    anchoring = item;
                                }
                                else if (value === maxSize) {
                                    ++sizeCount;
                                }
                                else if (value > maxSize) {
                                    maxSize = value;
                                    sizeCount = 1;
                                    anchoring = item;
                                }
                                if (value > maxDimension && item[HWL]) {
                                    maxDimension = value;
                                    anchoring = item;
                                }
                            }
                            if (q === sizeCount) {
                                maxSize = NaN;
                                emptyContent = seg.filter(item => !item.isEmpty() && !item.imageContainer && !item.controlElement && (!item.inputElement || item.tagName === 'BUTTON') && !item.find(child => child.isEmpty() && (child.pseudoElement ? child.textContent !== '' || child[HWL] > 0 : child.bounds[HWL] > 0), { cascade: true }));
                            }
                            else if (maxDimension === maxSize) {
                                maxSize = Infinity;
                            }
                            if (anchoring && anchoring[HWL]) {
                                anchoring = null;
                            }
                            if (horizontal) {
                                percentAvailable = View.availablePercent(seg, 'width', node.box.width);
                                if (columnGap > 0) {
                                    gap = columnGap;
                                    percentGap = (columnGap / 2) / node.bounds.width;
                                }
                            }
                            else if (rowGap > 0) {
                                gap = rowGap;
                                percentGap = (rowGap / 2) / node.bounds.height;
                            }
                        }
                    }
                    for (let k = 0, ignore: Undef<boolean>; k < q; ++k) {
                        const chain = seg[k];
                        const previous = seg[k - 1] as Undef<T>;
                        const next = seg[k + 1] as Undef<T>;
                        if (next) {
                            chain.anchor(RLBT, next.documentId);
                        }
                        if (previous && !ignore) {
                            chain.anchor(LRTB, previous.documentId);
                        }
                        if (opposing) {
                            chain.anchor(TL, 'parent');
                            if (parentEnd) {
                                if (dimensionInverse) {
                                    setLayoutWeight(chain, horizontal, orientationWeight, 1);
                                }
                                else {
                                    chain.anchor(BR, 'parent');
                                    chain.anchorStyle(orientationInverse, reverse ? 1 : 0, chained ? 'packed' : undefined);
                                }
                            }
                        }
                        else {
                            const chainContent = chain.innerMostWrapped;
                            const innerWrapped = getOuterFrameChild(chain);
                            if (innerWrapped) {
                                const autoMargin = chainContent.autoMargin;
                                if (horizontal) {
                                    if (autoMargin.horizontal) {
                                        innerWrapped.mergeGravity('layout_gravity', (autoMargin.leftRight ? 'center_horizontal' : autoMargin.left ? chain.localizeString('right') : chain.localizeString('left')) as LayoutGravityDirectionAttr);
                                    }
                                }
                                else if (autoMargin.vertical) {
                                    innerWrapped.mergeGravity('layout_gravity', autoMargin.topBottom ? 'center_vertical' : autoMargin.top ? 'bottom' : 'top');
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
                                            if (!innerWrapped || !chainContent.autoMargin[orientationInverse]) {
                                                chain.anchorStyle(orientationInverse, wrapReverse ? 1 : 0);
                                            }
                                            if (chain[HWL] === 0) {
                                                const getMinSize = () => {
                                                    let size = 0;
                                                    chain.cascade(item => {
                                                        if (item.pageFlow) {
                                                            if (item.hasUnit(HWL, { percent: false })) {
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
                                                    setLayoutWeightOpposing(chain, horizontal, 'wrap_content');
                                                }
                                                else if (maxSize === Infinity) {
                                                    setLayoutWeightOpposing(chain, horizontal, horizontal || chain.flexRow && chain.flexdata.justifyContent!.startsWith('space') ? '0px' : 'match_parent');
                                                }
                                                else {
                                                    const belowSize = () => (chainContent.data<BoxRectDimension>(this.name, 'boundsData') || chainContent.bounds)[HWL] < maxSize;
                                                    if (!horizontal && chain.blockStatic) {
                                                        setLayoutWeightOpposing(chain, horizontal, belowSize() || !innerWrapped && !chain.naturalElement ? '0px' : 'match_parent');
                                                    }
                                                    else if (q === 1) {
                                                        const hasStretch = () => {
                                                            switch (node.flexbox.alignSelf) {
                                                                case 'normal':
                                                                case 'stretch':
                                                                    return !node.wrapperOf?.inputElement;
                                                            }
                                                            return false;
                                                        };
                                                        setLayoutWeightOpposing(
                                                            chain,
                                                            horizontal,
                                                            horizontal ? chainContent.percentHeight === 1 ? 'match_parent' : (node.hasHeight || !node.inlineHeight) && node.actualParent!.flexRow && hasStretch() ? '0px' : 'wrap_content' : dimension ? '0px' : 'match_parent'
                                                        );
                                                    }
                                                    else if (isNaN(maxSize)) {
                                                        setLayoutWeightOpposing(
                                                            chain,
                                                            horizontal,
                                                            !horizontal && !wrap && !chain.isEmpty()
                                                                ? dimension ? '0px' : 'match_parent'
                                                                : dimension && alignContent === 'normal'
                                                                    ? !horizontal || !wrap ? '0px' : 'match_parent'
                                                                    : emptyContent && emptyContent.length < q && emptyContent.includes(chain) ? '0px' : 'wrap_content'
                                                        );
                                                    }
                                                    else if (belowSize()) {
                                                        setLayoutWeightOpposing(chain, horizontal, !horizontal && chain.flexRow ? 'match_parent' : '0px');
                                                        if (innerWrapped && !innerWrapped.autoMargin[orientationInverse]) {
                                                            setLayoutWeightOpposing(innerWrapped, horizontal, 'match_parent');
                                                        }
                                                    }
                                                    else if (dimension) {
                                                        setLayoutWeightOpposing(chain, horizontal, '0px');
                                                    }
                                                    else {
                                                        setLayoutWeightOpposing(chain, horizontal, 'wrap_content');
                                                        chain.lockAttr('android', 'layout_' + HWL);
                                                    }
                                                }
                                            }
                                            else if (!chain.inputElement) {
                                                if (!horizontal) {
                                                    if (chain.percentWidth === 1) {
                                                        chain.setLayoutWidth('match_parent');
                                                    }
                                                }
                                                else if (dimension && chain.percentHeight === 1) {
                                                    chain.setLayoutHeight('match_parent');
                                                }
                                            }
                                            break;
                                    }
                                    break;
                                }
                            }
                            const weight = chain.flexbox.weight;
                            if (horizontal) {
                                if (!weight && hasMultiline(chain, node)) {
                                    setBoxPercentage(chain, node, WHL);
                                }
                                percentAvailable = chain.setFlexDimension(WHL, percentAvailable, weight);
                                if (!chain.layoutWidth && !chain.hasWidth) {
                                    if (chain.every((item: T) => item.variableWidth) && ascendFlexibleWidth(node, true) && !chain.flexColumn) {
                                        chain.setLayoutWidth('0px');
                                    }
                                    else if ((wrap && !chain[WHL] && !chain.autoMargin.horizontal || spreadInside && chain.autoMargin[reverse ? BR : LT]) && !chain.find((item: T) => item.variableWidth || item.percentWidth)) {
                                        chain.setLayoutWidth('wrap_content');
                                    }
                                }
                            }
                            else {
                                percentAvailable = chain.setFlexDimension(WHL, percentAvailable, weight);
                            }
                            if (parentBottom > 0 && j === length - 1) {
                                marginBottom = Math.max(chain.linear.bottom - parentBottom, marginBottom);
                                chain.setBox(BOX_STANDARD.MARGIN_BOTTOM, { reset: 1 });
                            }
                            if (chained && gap > 0) {
                                if (k < q - 1) {
                                    chain.modifyBox(horizontal ? BOX_STANDARD.MARGIN_RIGHT : BOX_STANDARD.MARGIN_BOTTOM, gap);
                                }
                                const attr = horizontal ? 'layout_constraintWidth_percent' : 'layout_constraintHeight_percent';
                                const percent = chain.app(attr);
                                if (percent) {
                                    const value = +percent - percentGap;
                                    if (value > 0) {
                                        chain.app(attr, truncate(value, node.localSettings.floatPrecision));
                                        continue;
                                    }
                                }
                                percentAvailable -= percentGap;
                            }
                        }
                        chain.anchored = true;
                        chain.positioned = true;
                    }
                    if (!opposing) {
                        if (!chained) {
                            const item = seg[0];
                            const autoMargin = item.innerMostWrapped.autoMargin;
                            let bias = autoMargin.leftRight ? 0.5 : autoMargin.left ? 1 : 0;
                            if (bias) {
                                item.anchorParent('horizontal', bias, undefined, true);
                            }
                            if (bias = autoMargin.topBottom ? 0.5 : autoMargin.top ? 1 : 0) {
                                item.anchorParent('vertical', bias, undefined, true);
                            }
                        }
                        else if (anchoring && !anchoring[HWL]) {
                            anchoring.data(this.name, 'anchorDirection', horizontal ? 0 : 1);
                        }
                        const ignoreWeight = node.data(this.name, 'anchorDirection') === (horizontal ? 1 : 0);
                        const layoutWeight: [T, number][] = [];
                        for (let k = 0; k < q; ++k) {
                            const item = seg[k];
                            const weight = item.flexbox.weight;
                            if (weight) {
                                setLayoutWeight(item, horizontal, orientationWeight, weight);
                            }
                            else if (chained && !ignoreWeight) {
                                const autoMargin = item.innerMostWrapped.autoMargin;
                                if (horizontal) {
                                    if (autoMargin.leftRight) {
                                        layoutWeight.push([item, 2]);
                                    }
                                    else if (autoMargin.horizontal) {
                                        layoutWeight.push([item, 1]);
                                    }
                                }
                                else if (autoMargin.topBottom) {
                                    layoutWeight.push([item, 2]);
                                }
                                else if (autoMargin.vertical) {
                                    layoutWeight.push([item, 1]);
                                }
                            }
                        }
                        const r = layoutWeight.length;
                        if (r) {
                            for (const [item, value] of layoutWeight) {
                                setLayoutWeight(item, horizontal, orientationWeight, boundsWeight ? item.bounds[WHL] / boundsWeight : ((1 - grow) * value) / r);
                            }
                        }
                        if (marginBottom > 0) {
                            node.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, marginBottom);
                        }
                        if (horizontal || column) {
                            let centered: Undef<boolean>;
                            if (grow < 1 || !chained) {
                                switch (justifyContent) {
                                    case 'normal':
                                        if (column) {
                                            segStart.anchorStyle(orientation, reverse ? 1 : 0, chained ? 'packed' : undefined, false);
                                            continue;
                                        }
                                        break;
                                    case 'left':
                                        if (!horizontal) {
                                            break;
                                        }
                                    case 'start':
                                    case 'flex-start':
                                        segStart.anchorStyle(orientation, reverse ? 1 : 0, chained ? 'packed' : undefined, false);
                                        continue;
                                    case 'center':
                                        centered = true;
                                        break;
                                    case 'right':
                                        if (!horizontal) {
                                            break;
                                        }
                                    case 'end':
                                    case 'flex-end':
                                        segStart.anchorStyle(orientation, 1, chained ? 'packed' : undefined, false);
                                        continue;
                                    case 'space-between':
                                        if (!chained) {
                                            if (segEnd.isEmpty()) {
                                                segEnd.anchorDelete(RB);
                                            }
                                            continue;
                                        }
                                        break;
                                    case 'space-evenly':
                                        if (chained) {
                                            segStart.anchorStyle(orientation, 0, 'spread');
                                            continue;
                                        }
                                        centered = true;
                                        break;
                                    case 'space-around':
                                        if (chained) {
                                            const controller = this.controller as android.base.Controller<T>;
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
                            if (spreadInside || !wrap && new Set(seg.map(item => item.app(orientationWeight))).size > 1) {
                                segStart.anchorStyle(orientation, 0, chained ? 'spread_inside' : undefined, false);
                            }
                            else if (!centered) {
                                segStart.anchorStyle(orientation, reverse ? 1 : 0, chained ? 'packed' : undefined, false);
                            }
                            else {
                                segStart.anchorStyle(orientation, 0.5, chained ? 'packed' : undefined);
                            }
                        }
                    }
                }
            }
        }
    }

    private adjustGrowRatio(node: T, items: T[], dimension: DimensionAttr, spreadInside: boolean) {
        const horizontal = dimension === 'width';
        const percent = (horizontal ? ascendFlexibleWidth(node, true) : ascendFlexibleHeight(node, true)) && !items.some(item => item.innerMostWrapped.autoMargin[horizontal ? 'horizontal' : 'vertical']);
        let result = 0,
            basisSize = 0;
        if (horizontal || percent) {
            const groupGrow: FlexBasis<T>[] = [];
            const percentage: T[] = [];
            const options: NodeParseUnitOptions = { dimension };
            const maxAttr = horizontal ? 'maxWidth' : 'maxHeight';
            const length = items.length;
            let growShrinkType = 0,
                maxBasisUnit = 0,
                maxDimension = 0,
                maxRatio = NaN,
                maxBasis: Undef<T>;
            for (let i = 0; i < length; ++i) {
                const item = items[i].innerMostWrapped as T;
                const { basis, shrink, grow } = item.flexbox;
                if (basis === 'auto' && grow === 0 && (length === 1 || item.hasUnit(dimension, { percent: false }))) {
                    continue;
                }
                const size = item.bounds[dimension];
                if (grow > 0 || shrink !== 1 || basis !=='auto' && basis !== '0%' && isLength(basis, true)) {
                    result += grow;
                    let value = item[dimension];
                    if (value === 0) {
                        if (basis === 'auto' || parseFloat(basis) === 0) {
                            if (item.hasUnit(dimension)) {
                                value = item.cssUnit(dimension);
                            }
                            else {
                                if (!percent && parseFloat(basis) === 0) {
                                    value = size;
                                }
                                else {
                                    let boundsData: Optional<BoxRectDimension>;
                                    item.cssTry('flexGrow', '0', function (this: T) { boundsData = this.boundingClientRect; });
                                    boundsData ||= item.data<BoxRectDimension>(this.name, 'boundsData');
                                    value = boundsData ? boundsData[dimension] : size;
                                }
                                if (value === size) {
                                    if (horizontal && grow > 0 && item.blockStatic) {
                                        percentage.push(item);
                                    }
                                    continue;
                                }
                            }
                        }
                        else {
                            value = item.parseUnit(basis, options);
                        }
                    }
                    else if (asPercent(basis) <= asPercent(item.css(maxAttr))) {
                        percentage.push(item);
                        continue;
                    }
                    else if (grow === 0 && (horizontal ? item.variableWidth : item.variableHeight) && !item.hasUnit(maxAttr) && (!spreadInside || items.some(sibling => sibling !== item && (horizontal ? sibling.percentWidth >= 1 && !sibling.isResizable('maxWidth') : sibling.percentHeight >= 1 && !sibling.isResizable('maxHeight'))))) {
                        item.css(maxAttr, formatPX(value));
                    }
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
                    groupGrow.push({
                        item,
                        size,
                        basis: value,
                        shrink,
                        grow
                    });
                }
                else if (percent && !item[horizontal ? 'hasWidth' : 'hasHeight'] && item.flexbox.alignSelf === 'auto') {
                    percentage.push(item);
                }
            }
            if (groupGrow.length === 1 && length === 1 && items[0].flexbox.grow < 1) {
                percentage.push(items[0]);
                groupGrow.length = 0;
            }
            let q = percentage.length,
                maxWidth: Undef<string>,
                previousWeight = 0;
            for (let i = 0; i < q; ++i) {
                setBoxPercentage(percentage[i], node, dimension);
            }
            q = groupGrow.length;
            for (let i = 0, weight: number; i < q; ++i) {
                const data = groupGrow[i];
                const { basis, item } = data;
                item.flexbox.basis = 'auto';
                if (item === maxBasis) {
                    weight = 1;
                    basisSize = data.size;
                }
                else if (basis === maxBasisUnit && (growShrinkType === 1 && maxRatio !== 1 && maxRatio === data.shrink || growShrinkType === 2 && maxRatio > 0 && maxRatio === data.grow)) {
                    weight = 1;
                }
                else if (basis) {
                    weight = ((data.size / basis) / (maxDimension / maxBasisUnit)) * basis / maxBasisUnit;
                }
                else {
                    previousWeight = NaN;
                    continue;
                }
                item.flexbox.weight = weight;
                if (horizontal) {
                    if (item.percentWidth > 0) {
                        item.css('width', 'auto');
                        item.setCacheValue('percentWidth', 0);
                    }
                    if (q === length && !isNaN(previousWeight)) {
                        if (previousWeight === 0) {
                            maxWidth = item.css('maxWidth');
                            previousWeight = !maxWidth || !isPercent(maxWidth) ? NaN : weight;
                        }
                        else if (previousWeight !== weight || maxWidth !== item.css('maxWidth')) {
                            previousWeight = NaN;
                        }
                    }
                }
                else if (item.percentHeight > 0) {
                    item.css('height', 'auto');
                    item.setCacheValue('percentHeight', 0);
                }
            }
            if (maxWidth && q * asPercent(maxWidth) >= 0.999) {
                groupGrow.forEach(group => group.item.css('maxWidth', 'auto', true));
            }
        }
        return [result, basisSize];
    }
}