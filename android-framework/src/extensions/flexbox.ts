import { FlexboxData } from '../../../@types/base/extension';

import Controller from '../controller';
import View from '../view';

import { STRING_ANDROID } from '../lib/constant';
import { CONTAINER_NODE } from '../lib/enumeration';

import LayoutUI = squared.base.LayoutUI;
import NodeUI = squared.base.NodeUI;

const $lib = squared.lib;
const { isLength } = $lib.css;
const { truncate } = $lib.math;
const { capitalize, sameArray, withinRange } = $lib.util;

const $base = squared.base;

const $base_lib = $base.lib;
const { BOX_STANDARD, NODE_ALIGNMENT } = $base_lib.enumeration;

const { FLEXBOX } = $base_lib.constant.EXT_NAME;

type FlexBasis = {
    item: View;
    basis: number;
    dimension: number;
    shrink: number;
    grow: number;
};

const MAP_horizontal = {
    orientation: STRING_ANDROID.HORIZONTAL,
    orientationInverse: STRING_ANDROID.VERTICAL,
    WH: 'Width',
    HW: 'Height',
    LT: 'left',
    TL: 'top',
    RB: 'right',
    BR: 'bottom',
    LRTB: 'leftRight',
    RLBT: 'rightLeft'
};
const MAP_vertical = {
    orientation: STRING_ANDROID.VERTICAL,
    orientationInverse: STRING_ANDROID.HORIZONTAL,
    WH: 'Height',
    HW: 'Width',
    LT: 'top',
    TL: 'left',
    RB: 'bottom',
    BR: 'right',
    LRTB: 'topBottom',
    RLBT: 'bottomTop'
};

function adjustGrowRatio(parent: View, items: View[], attr: string) {
    const horizontal = attr === 'width';
    const hasDimension = 'has' + capitalize(attr);
    const setPercentage = (item: View) => item.flexbox.basis = (item.bounds[attr] / parent.box[attr] * 100) + '%';
    let percent = parent[hasDimension] || parent.blockStatic && withinRange(parent.parseUnit(parent.css(horizontal ? 'maxWidth' : 'maxHeight')), parent.box.width);
    let result = 0;
    let growShrinkType = 0;
    for (const item of items) {
        if (percent) {
            const autoMargin = (item.innerWrapped || item).autoMargin;
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
        result += item.flexbox.grow;
    }
    if (items.length > 1 && (horizontal || percent)) {
        const groupBasis: FlexBasis[] = [];
        const percentage: View[] = [];
        let maxBasis: View | undefined;
        let maxBasisUnit = 0;
        let maxDimension = 0;
        let maxRatio = NaN;
        for (const item of items) {
            const { alignSelf, basis, shrink, grow } = item.flexbox;
            const dimension = item.bounds[attr];
            let growPercent = false;
            if (grow > 0 || shrink !== 1) {
                const value = basis === 'auto' ? item.parseUnit(item.css(attr), attr) : item.parseUnit(basis, attr);
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
                else if (grow > 0 && dimension > item[attr]) {
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
        if (growShrinkType !== 0) {
            if (groupBasis.length > 1) {
                for (const data of groupBasis) {
                    const item = data.item;
                    const basis = data.basis;
                    if (item === maxBasis || basis === maxBasisUnit && (growShrinkType === 1 && maxRatio === data.shrink || growShrinkType === 2 && maxRatio === data.grow)) {
                        item.flexbox.grow = 1;
                    }
                    else if (basis > 0) {
                        item.flexbox.grow = ((data.dimension / basis) / (maxDimension / maxBasisUnit)) * basis / maxBasisUnit;
                    }
                }
            }
            for (const item of percentage) {
                setPercentage(item);
            }
        }
    }
    if (horizontal && growShrinkType === 0) {
        for (const item of items) {
            if (item.cascadeSome(child => child.multiline && child.ascend({ condition: above => above[hasDimension], including: parent }).length === 0)) {
                setPercentage(item);
            }
        }
    }
    return result;
}

function getBaseline(nodes: View[]) {
    for (const node of nodes) {
        if (node.textElement && node.baseline) {
            return node;
        }
    }
    return NodeUI.baseline(nodes);
}

const getAutoMargin = (node: View) => (node.innerWrapped || node).autoMargin;

export default class <T extends View> extends squared.base.extensions.Flexbox<T> {
    public processNode(node: T, parent: T) {
        super.processNode(node, parent);
        const mainData: FlexboxData<T> = node.data(FLEXBOX, 'mainData');
        if (mainData.directionRow && mainData.rowCount === 1 || mainData.directionColumn && mainData.columnCount === 1) {
            node.containerType = CONTAINER_NODE.CONSTRAINT;
            node.addAlign(NODE_ALIGNMENT.AUTO_LAYOUT);
            node.addAlign(mainData.directionColumn ? NODE_ALIGNMENT.HORIZONTAL : NODE_ALIGNMENT.VERTICAL);
            mainData.wrap = false;
            return { include: true };
        }
        else {
            const layout = new LayoutUI(parent, node, 0, NODE_ALIGNMENT.AUTO_LAYOUT);
            layout.itemCount = node.length;
            layout.rowCount = mainData.rowCount;
            layout.columnCount = mainData.columnCount;
            if (mainData.directionRow && node.hasHeight || mainData.directionColumn && node.hasWidth || node.some(item => !item.pageFlow)) {
                layout.containerType = CONTAINER_NODE.CONSTRAINT;
            }
            else {
                layout.containerType = CONTAINER_NODE.LINEAR;
            }
            layout.add(mainData.directionColumn ? NODE_ALIGNMENT.HORIZONTAL : NODE_ALIGNMENT.VERTICAL);
            return {
                output: this.application.renderNode(layout),
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
                complete: true
            };
        }
        else {
            const autoMargin = node.autoMargin;
            if (autoMargin.horizontal || autoMargin.vertical && node.hasHeight) {
                const mainData: FlexboxData<T> = parent.data(FLEXBOX, 'mainData');
                if (mainData) {
                    const index = mainData.children.findIndex(item => item === node);
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
                        container.flexbox = { ...node.flexbox };
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
            const { alignContent, children, directionColumn, directionReverse, directionRow, justifyContent, wrap, wrapReverse } = mainData;
            const chainHorizontal: T[][] = [];
            const chainVertical: T[][] = [];
            const segmented: T[] = [];
            if (wrap) {
                let previous: T[] | undefined;
                node.each((item: T) => {
                    if (item.hasAlign(NODE_ALIGNMENT.SEGMENTED)) {
                        const pageFlow = item.renderFilter(child => child.pageFlow) as T[];
                        if (pageFlow.length) {
                            if (directionRow) {
                                item.setLayoutWidth('match_parent');
                                chainHorizontal.push(pageFlow);
                            }
                            else {
                                item.setLayoutHeight('match_parent');
                                if (previous) {
                                    const length = previous.length;
                                    let largest = previous[0];
                                    for (let j = 1; j < length; j++) {
                                        if (previous[j].linear.right > largest.linear.right) {
                                            largest = previous[j];
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
                    if (wrapReverse && directionColumn) {
                        node.mergeGravity('gravity', 'right');
                    }
                }
                else if (segmented.length) {
                    if (directionRow) {
                        chainVertical.push(segmented);
                    }
                    else {
                        chainHorizontal.push(segmented);
                    }
                }
            }
            else {
                if (directionRow) {
                    if (directionReverse) {
                        children.reverse();
                    }
                    chainHorizontal[0] = children;
                }
                else {
                    if (directionReverse) {
                        children.reverse();
                    }
                    chainVertical[0] = children;
                }
            }
            function applyLayout(partition: T[][], horizontal: boolean) {
                const length = partition.length;
                if (length === 0) {
                    return;
                }
                const { orientation, orientationInverse, WH, HW, LT, TL, RB, BR, LRTB, RLBT } = horizontal ? MAP_horizontal : MAP_vertical;
                const orientationWeight = `layout_constraint${capitalize(orientation)}_weight`;
                const WHL = WH.toLowerCase();
                const HWL = HW.toLowerCase();
                const dimension: boolean = node['has' + HW];
                const dimensionInverse: boolean = node['has' + WH];
                function setLayoutWeight(chain: T, value: number) {
                    if (chain[WHL] === 0) {
                        chain.app(orientationWeight, truncate(value, chain.localSettings.floatPrecision));
                        if (horizontal) {
                            chain.setLayoutWidth('0px');
                        }
                        else {
                            chain.setLayoutHeight('0px');
                        }
                    }
                }
                for (let i = 0; i < length; i++) {
                    const seg = partition[i];
                    const lengthA = seg.length;
                    const segStart = seg[0];
                    const segEnd = seg[lengthA - 1];
                    const opposing = seg === segmented;
                    const justified = !opposing && seg.every(item => item.flexbox.grow === 0);
                    const spreadInside = justified && (justifyContent === 'space-between' || justifyContent === 'space-around' && lengthA > 1);
                    const layoutWeight: T[] = [];
                    let maxSize = 0;
                    let growAvailable = 0;
                    let parentEnd = true;
                    let baseline: T | null = null;
                    let growAll: boolean;
                    let percentWidth: number | undefined;
                    let percentHeight: number | undefined;
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
                            segStart.anchorStyle(orientation, chainStyle, bias);
                        }
                        else {
                            segStart.anchorStyle(orientation);
                        }
                    }
                    else {
                        if (horizontal) {
                            percentWidth = View.getAvailablePercent(seg, 'width', node.box.width);
                            percentHeight = 1;
                        }
                        else {
                            percentWidth = 1;
                            percentHeight = View.getAvailablePercent(seg, 'height', node.box.height);
                        }
                        growAll = horizontal || dimensionInverse;
                        growAvailable = 1 - adjustGrowRatio(node, seg, WHL);
                        if (lengthA > 1) {
                            let sizeCount = 0;
                            for (const chain of seg) {
                                const bounds = chain.initial.bounds;
                                if (bounds) {
                                    const value = bounds[HWL];
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
                                }
                            }
                            if (sizeCount === lengthA) {
                                maxSize = NaN;
                            }
                        }
                    }
                    for (let j = 0; j < lengthA; j++) {
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
                            if (parentEnd && lengthA > 1 && dimensionInverse) {
                                setLayoutWeight(chain, 1);
                            }
                            chain.anchor(TL, 'parent');
                        }
                        else {
                            const autoMargin = getAutoMargin(chain);
                            const innerWrapped = chain.innerWrapped as T | undefined;
                            if (horizontal) {
                                if (autoMargin.horizontal) {
                                    if (innerWrapped) {
                                        const gravity = autoMargin.leftRight ? STRING_ANDROID.CENTER_HORIZONTAL : chain.localizeString(autoMargin.left ? 'right' : 'left');
                                        innerWrapped.mergeGravity('layout_gravity', gravity);
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
                                        const gravity = autoMargin.topBottom ? STRING_ANDROID.CENTER_VERTICAL : chain.localizeString(autoMargin.top ? 'bottom' : 'top');
                                        innerWrapped.mergeGravity('layout_gravity', gravity);
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
                                        if (baseline === null) {
                                            baseline = getBaseline(seg) as T | null;
                                        }
                                        if (baseline && baseline !== chain) {
                                            chain.anchor('baseline', baseline.documentId);
                                        }
                                    }
                                    break;
                                case 'center':
                                    chain.anchorParent(orientationInverse, 'packed', 0.5);
                                    if (!horizontal && chain.textElement) {
                                        chain.mergeGravity('gravity', 'center');
                                    }
                                    break;
                                default:
                                    const childContent = chain.layoutFrame && chain.innerWrapped as T;
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
                                                childContent.mergeGravity('layout_gravity', horizontal ? STRING_ANDROID.CENTER_VERTICAL : STRING_ANDROID.CENTER_HORIZONTAL);
                                            }
                                            else {
                                                chain.anchorParent(orientationInverse);
                                            }
                                            break;
                                        case 'space-between':
                                            if (spreadInside && lengthA === 2) {
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
                                                    childContent.mergeGravity('layout_gravity', horizontal ? STRING_ANDROID.CENTER_VERTICAL : STRING_ANDROID.CENTER_HORIZONTAL);
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
                                            if (chain.innerWrapped === undefined || !chain.innerWrapped.autoMargin[orientationInverse]) {
                                                chain.anchorStyle(orientationInverse, 'packed', wrapReverse ? 1 : 0);
                                            }
                                            if (chain[HWL] === 0) {
                                                function setLayoutWeightOpposing(item: T, value: string) {
                                                    if (!horizontal) {
                                                        item.setLayoutWidth(value);
                                                    }
                                                    else {
                                                        item.setLayoutHeight(value);
                                                    }
                                                }
                                                if (!horizontal && chain.blockStatic) {
                                                    setLayoutWeightOpposing(chain, 'match_parent');
                                                }
                                                else if (isNaN(maxSize)) {
                                                    if (!horizontal && !wrap && chain.length || dimension && alignContent === 'normal') {
                                                        setLayoutWeightOpposing(chain, dimension ? '0px' : 'match_parent');
                                                    }
                                                    else {
                                                        setLayoutWeightOpposing(chain, 'wrap_content');
                                                    }
                                                }
                                                else if (lengthA === 1) {
                                                    if (!horizontal) {
                                                        setLayoutWeightOpposing(chain, dimension ? '0px' : 'match_parent');
                                                    }
                                                    else {
                                                        setLayoutWeightOpposing(chain, 'wrap_content');
                                                    }
                                                }
                                                else if ((chain.naturalElement ? (chain.initial.bounds as Dimension)[HWL] : Number.POSITIVE_INFINITY) < maxSize) {
                                                    setLayoutWeightOpposing(chain, chain.flexElement && chain.css('flexDirection').startsWith(horizontal ? 'row' : 'column') ? 'match_parent' : '0px');
                                                    if (innerWrapped?.autoMargin[orientation] === false) {
                                                        setLayoutWeightOpposing(innerWrapped, 'match_parent');
                                                    }
                                                }
                                                else {
                                                    chain.lockAttr('android', 'layout_' + HWL);
                                                    setLayoutWeightOpposing(chain, 'wrap_content');
                                                }
                                            }
                                            break;
                                        }
                                    }
                                    break;
                            }
                            [percentWidth, percentHeight] = Controller.setFlexDimension(chain, WHL, percentWidth, percentHeight);
                            if (!(innerWrapped || chain).has('flexGrow')) {
                                growAll = false;
                            }
                        }
                        chain.anchored = true;
                        chain.positioned = true;
                    }
                    if (growAll) {
                        for (const item of seg) {
                            setLayoutWeight(item, (item.innerWrapped || item).flexbox.grow);
                        }
                    }
                    else if (growAvailable > 0) {
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
                    segStart.anchor(LT, 'parent');
                    segEnd.anchor(RB, 'parent');
                    if (!opposing && (horizontal || directionColumn)) {
                        let centered = false;
                        if (justified) {
                            switch (justifyContent) {
                                case 'normal':
                                    if (directionColumn) {
                                        segStart.anchorStyle(orientation, 'packed', directionReverse ? 1 : 0);
                                    }
                                    break;
                                case 'left':
                                    if (!horizontal) {
                                        break;
                                    }
                                case 'start':
                                case 'flex-start':
                                    segStart.anchorStyle(orientation, 'packed', directionReverse ? 1 : 0);
                                    break;
                                case 'center':
                                    if (lengthA > 1) {
                                        segStart.anchorStyle(orientation, 'packed', 0.5);
                                    }
                                    centered = true;
                                    break;
                                case 'right':
                                    if (!horizontal) {
                                        break;
                                    }
                                case 'end':
                                case 'flex-end':
                                    segStart.anchorStyle(orientation, 'packed', 1);
                                    break;
                                case 'space-between':
                                    if (lengthA === 1) {
                                        segEnd.anchorDelete(RB);
                                    }
                                    break;
                                case 'space-evenly':
                                    if (lengthA > 1) {
                                        segStart.anchorStyle(orientation, 'spread');
                                    }
                                    else {
                                        centered = true;
                                    }
                                    break;
                                case 'space-around':
                                    if (lengthA > 1) {
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
                        if (spreadInside || !wrap && seg.some(item => item.app(orientationWeight) !== '') && !sameArray(seg, item => item.app(orientationWeight))) {
                            segStart.anchorStyle(orientation, 'spread_inside', 0, false);
                        }
                        else if (!centered) {
                            segStart.anchorStyle(orientation, 'packed', directionReverse ? 1 : 0, false);
                        }
                    }
                }
            }
            applyLayout(chainHorizontal, true);
            applyLayout(chainVertical, false);
        }
    }
}