import Resource from './resource';
import View from './view';
import ViewGroup from './viewgroup';

import { CONTAINER_ANDROID, CONTAINER_ANDROID_X } from './lib/constant';
import { BUILD_ANDROID, CONTAINER_NODE } from './lib/enumeration';
import { adjustAbsolutePaddingOffset, createViewAttribute, getDocumentId, getRootNs } from './lib/util';

import LayoutUI = squared.base.LayoutUI;

interface RelativeLayoutData {
    clearMap: Map<View, string>;
    textIndent: number;
    rowLength: number;
    boxWidth: number;
    items?: View[];
}

const { PLATFORM, isPlatform } = squared.lib.client;
const { parseColor } = squared.lib.color;
const { CSS_UNIT, formatPX, getSrcSet, hasComputedStyle, isLength, isPercent } = squared.lib.css;
const { getElementsBetweenSiblings, getRangeClientRect } = squared.lib.dom;
const { truncate } = squared.lib.math;
const { getElementAsNode, getPseudoElt } = squared.lib.session;
const { assignEmptyValue, convertFloat, convertWord, hasBit, hasMimeType, isString, iterateArray, parseMimeType, partitionArray, safeNestedArray, withinRange } = squared.lib.util;
const { STRING_XMLENCODING, replaceTab } = squared.lib.xml;

const { APP_SECTION, BOX_STANDARD, NODE_ALIGNMENT, NODE_PROCEDURE, NODE_RESOURCE, NODE_TEMPLATE } = squared.base.lib.enumeration;

const NodeUI = squared.base.NodeUI;

function sortHorizontalFloat(list: View[]) {
    list.sort((a, b) => {
        const floatA = a.float;
        const floatB = b.float;
        if (floatA !== 'none' && floatB !== 'none') {
            if (floatA !== floatB) {
                return floatA === 'left' ? -1 : 1;
            }
            else if (floatA === 'right' && floatB === 'right') {
                return 1;
            }
        }
        else if (floatA !== 'none') {
            return floatA === 'left' ? -1 : 1;
        }
        else if (floatB !== 'none') {
            return floatB === 'left' ? 1 : -1;
        }
        return 0;
    });
}

function getSortOrderStandard(above: View, below: View): number {
    const parentA = above.actualParent as View;
    const parentB = below.actualParent as View;
    if (above === parentB) {
        return -1;
    }
    else if (parentA === below) {
        return 1;
    }
    const { pageFlow: pA, zIndex: zA } = above;
    const { pageFlow: pB, zIndex: zB } = below;
    if (!pA && pB) {
        return zA >= 0 ? 1 : -1;
    }
    else if (!pB && pA) {
        return zB >= 0 ? -1 : 1;
    }
    else if (zA === zB) {
        return above.childIndex < below.childIndex ? -1 : 1;
    }
    return zA < zB ? -1 : 1;
}

function getSortOrderInvalid(above: View, below: View): number {
    const depthA = above.depth;
    const depthB = below.depth;
    if (depthA === depthB) {
        const parentA = above.actualParent as View;
        const parentB = below.actualParent as View;
        if (above === parentB) {
            return -1;
        }
        else if (parentA === below) {
            return 1;
        }
        else if (parentA && parentB) {
            if (parentA === parentB) {
                return getSortOrderStandard(above, below);
            }
            else if (parentA.actualParent === parentB.actualParent) {
                return getSortOrderStandard(parentA, parentB);
            }
        }
        return above.id < below.id ? -1 : 1;
    }
    return depthA < depthB ? -1 : 1;
}

function adjustBaseline(baseline: View, nodes: View[], singleRow: boolean, boxTop: number) {
    let imageHeight = 0,
        imageBaseline: Undef<View>;
    const length = nodes.length;
    let i = 0;
    while (i < length) {
        const node = nodes[i++];
        if (node.baselineAltered) {
            continue;
        }
        let height = node.baselineHeight;
        if (height > 0 || node.textElement) {
            if (node.blockVertical && baseline.blockVertical) {
                node.anchor('bottom', baseline.documentId);
            }
            else if (singleRow && node.is(CONTAINER_NODE.BUTTON)) {
                node.anchor('centerVertical', 'true');
            }
            else {
                const isEmpty = node.isEmpty;
                let imageElement = node.imageOrSvgElement;
                if (!imageElement && !isEmpty) {
                    node.renderEach((item: View) => {
                        if (isBaselineImage(item)) {
                            height = Math.max(item.baselineHeight, height);
                            imageElement = true;
                        }
                    });
                }
                if (imageElement) {
                    if (height > baseline.baselineHeight) {
                        if (!imageBaseline || height >= imageHeight) {
                            imageBaseline?.anchor(getBaselineAnchor(node), node.documentId);
                            imageHeight = height;
                            imageBaseline = node;
                        }
                        else {
                            node.anchor(getBaselineAnchor(imageBaseline), imageBaseline.documentId);
                        }
                        continue;
                    }
                    else if (withinRange(node.linear.top, boxTop)) {
                        node.anchor('top', 'true');
                        continue;
                    }
                }
                if (isEmpty && node.naturalChild) {
                    node.anchor('baseline', baseline.documentId);
                }
                else if (node.baselineElement) {
                    node.anchor(imageElement ? 'bottom' : 'baseline', baseline.documentId);
                }
            }
        }
        else if (isBaselineImage(node)) {
            imageBaseline = node;
        }
    }
    if (imageBaseline) {
        baseline.anchor(getBaselineAnchor(imageBaseline), imageBaseline.documentId);
    }
}

function adjustFloatingNegativeMargin(node: View, previous: View) {
    if (previous.float === 'left') {
        if (previous.marginRight < 0) {
            const right = Math.abs(previous.marginRight);
            node.modifyBox(BOX_STANDARD.MARGIN_LEFT, previous.actualWidth + (previous.hasWidth ? previous.paddingLeft + previous.borderLeftWidth : 0) - right);
            node.anchor('left', previous.documentId);
            previous.setBox(BOX_STANDARD.MARGIN_RIGHT, { reset: 1 });
            return true;
        }
    }
    else if (node.float === 'right' && previous.marginLeft < 0) {
        const left = Math.abs(previous.marginLeft);
        const width = previous.actualWidth;
        if (left < width) {
            node.modifyBox(BOX_STANDARD.MARGIN_RIGHT, width - left);
        }
        node.anchor('right', previous.documentId);
        previous.setBox(BOX_STANDARD.MARGIN_LEFT, { reset: 1 });
        return true;
    }
    return false;
}

function getTextBottom<T extends View>(nodes: T[]): T[] {
    return nodes.filter(node => (node.baseline || isLength(node.verticalAlign, true)) && (node.tagName === 'TEXTAREA' || node.tagName === 'SELECT' && node.toElementInt('size') > 1) || node.verticalAlign === 'text-bottom' && node.containerName !== 'INPUT_IMAGE').sort((a, b) => {
        if (a.baselineHeight === b.baselineHeight) {
            return a.tagName === 'SELECT' ? 1 : 0;
        }
        return a.baselineHeight > b.baselineHeight ? -1 : 1;
    });
}

function causesLineBreak(element: Element) {
    if (element.tagName === 'BR') {
        return true;
    }
    else if (hasComputedStyle(element)) {
        const style = getComputedStyle(element);
        const position = style.getPropertyValue('position');
        if (!(position === 'absolute' || position === 'fixed')) {
            const display = style.getPropertyValue('display');
            const floating = style.getPropertyValue('float') !== 'none';
            switch (display) {
                case 'block':
                case 'flex':
                case 'grid':
                    return !floating || hasWidth(style);
            }
            return (display.startsWith('inline-') || display === 'table') && hasWidth(style);
        }
    }
    return false;
}

function setReadOnly(node: View) {
    const element = node.element as HTMLInputElement;
    if (element.readOnly) {
        node.android('focusable', 'false');
    }
    if (element.disabled) {
        node.android('enabled', 'false');
    }
}

function setImageDimension(node: View, width: number, image: Undef<ImageAsset>) {
    node.css('width', formatPX(width), true);
    if (image && image.width > 0 && image.height > 0) {
        const height = image.height * (width / image.width);
        node.css('height', formatPX(height), true);
    }
}

function setInputMinDimension(node: View, element: HTMLInputElement) {
    if (element.minLength !== -1) {
        node.android('minLength', element.minLength.toString());
    }
    if (element.maxLength > 0) {
        node.android('maxLength', element.maxLength.toString());
    }
}

function setInputMinMax(node: View, element: HTMLInputElement) {
    if (element.min) {
        node.android('min', element.min);
    }
    if (element.max) {
        node.android('max', element.max);
    }
}

function checkClearMap(node: View, clearMap: Map<View, string>) {
    if (node.naturalChild) {
        return clearMap.has(node);
    }
    else if (node.nodeGroup) {
        return node.some((item: View) => item.naturalChild && clearMap.has(item), { cascade: true });
    }
    else {
        return clearMap.has(node.innerMostWrapped as View);
    }
}

function isConstraintLayout(layout: LayoutUI<View>, vertical: boolean) {
    const parent = layout.parent;
    if (parent.flexElement && (parent.css('alignItems') === 'baseline' || layout.some(item => item.flexbox.alignSelf === 'baseline'))) {
        return false;
    }
    const multiple = layout.length > 1;
    return layout.some(item => multiple && (item.rightAligned || item.centerAligned) && layout.singleRowAligned || (item.percentWidth > 0 && item.percentWidth < 1) || item.hasPX('maxWidth')) && (!vertical || layout.every(item => item.marginTop >= 0));
}

function adjustBodyMargin(node: View, position: string) {
    if (node.leftTopAxis) {
        const parent = node.absoluteParent as View;
        if (parent.documentBody) {
            switch (position) {
                case 'top':
                    if (parent.getBox(BOX_STANDARD.MARGIN_TOP)[0] === 0) {
                        return parent.marginTop;
                    }
                    break;
                case 'left':
                    return parent.marginLeft;
            }
        }
    }
    return 0;
}

function setInlineBlock(node: View) {
    const { centerAligned, rightAligned } = node;
    node.css('display', 'inline-block', true);
    node.setCacheValue('centerAligned', centerAligned);
    node.setCacheValue('rightAligned', rightAligned);
}

function setVerticalLayout(node: View) {
    node.addAlign(NODE_ALIGNMENT.VERTICAL);
    node.removeAlign(NODE_ALIGNMENT.UNKNOWN);
}

function setAnchorOffset(node: View, horizontal: boolean, attr: string, documentId: string, position: string, adjustment: number) {
    node.anchor(position, documentId, true);
    node.setBox(horizontal ? BOX_STANDARD.MARGIN_LEFT : BOX_STANDARD.MARGIN_TOP, { reset: 1, adjustment });
    node.constraint[attr] = true;
}

function segmentRightAligned<T extends View>(children: T[]) {
    return partitionArray<T>(children, item => item.float === 'right' || item.autoMargin.left === true);
}

function segmentLeftAligned<T extends View>(children: T[]) {
    return partitionArray<T>(children, item => item.float === 'left' || item.autoMargin.right === true);
}

function relativeWrapWidth(node: View, bounds: BoxRectDimension, multiline: boolean, previousRowLeft: Undef<View>, rowWidth: number, data: RelativeLayoutData) {
    let maxWidth = 0,
        baseWidth = rowWidth + node.marginLeft;
    if (previousRowLeft && !data.items!.includes(previousRowLeft)) {
        baseWidth += previousRowLeft.linear.width;
    }
    if (!previousRowLeft || !node.plainText || multiline || !data.items!.includes(previousRowLeft) || data.clearMap.has(node)) {
        baseWidth += bounds.width;
    }
    if (node.marginRight < 0) {
        baseWidth += node.marginRight;
    }
    maxWidth = data.boxWidth;
    if (data.textIndent !== 0) {
        if (data.textIndent < 0) {
            if (data.rowLength <= 1) {
                maxWidth += data.textIndent;
            }
        }
        else if (data.textIndent > 0 && data.rowLength === 1) {
            maxWidth -= data.textIndent;
        }
    }
    if (node.styleElement && node.inlineStatic) {
        baseWidth -= node.contentBoxWidth;
    }
    maxWidth = Math.ceil(maxWidth);
    return Math.floor(baseWidth) > maxWidth;
}

function constraintAlignTop(parent: View, node: View) {
    node.anchorParent('vertical', 0);
    node.setBox(BOX_STANDARD.MARGIN_TOP, { reset: 1, adjustment: Math.max(node.bounds.top - parent.box.top, Math.min(convertFloat(node.verticalAlign) * -1, 0)) });
    node.baselineAltered = true;
    return false;
}

function getVerticalLayout(layout: LayoutUI<View>) {
    return isConstraintLayout(layout, true)
        ? CONTAINER_NODE.CONSTRAINT
        : layout.some(item => item.positionRelative || !item.pageFlow && item.autoPosition)
            ? CONTAINER_NODE.RELATIVE
            : CONTAINER_NODE.LINEAR;
}

function getVerticalAlignedLayout(layout: LayoutUI<View>) {
    return isConstraintLayout(layout, true)
        ? CONTAINER_NODE.CONSTRAINT
        : layout.some(item => item.positionRelative)
            ? CONTAINER_NODE.RELATIVE
            : CONTAINER_NODE.LINEAR;
}

function setObjectContainer(layout: LayoutUI<View>) {
    const node = layout.node;
    const element = node.element as HTMLEmbedElement & HTMLObjectElement;
    const src = (element.tagName === 'OBJECT' ? element.data : element.src).trim();
    const type = element.type || parseMimeType(src);
    if (type.startsWith('image/')) {
        node.setCacheValue('tagName', 'IMG');
        node.setCacheValue('imageElement', true);
        element.src = src;
        layout.setContainerType(CONTAINER_NODE.IMAGE);
    }
    else if (type.startsWith('video/')) {
        node.setCacheValue('tagName', 'VIDEO');
        element.src = src;
        layout.setContainerType(CONTAINER_NODE.VIDEOVIEW);
    }
    else if (type.startsWith('audio/')) {
        node.setCacheValue('tagName', 'AUDIO');
        element.src = src;
        layout.setContainerType(CONTAINER_NODE.VIDEOVIEW);
    }
    else {
        layout.setContainerType(CONTAINER_NODE.TEXT);
    }
}

const getAnchorDirection = (reverse = false) => reverse ? ['right', 'left', 'rightLeft', 'leftRight'] : ['left', 'right', 'leftRight', 'rightLeft'];
const relativeFloatWrap = (node: View, previous: View, multiline: boolean, rowWidth: number, data: RelativeLayoutData) => previous.floating && previous.alignParent(previous.float) && (multiline || Math.floor(rowWidth + (node.hasWidth ? node.actualWidth : 0)) < data.boxWidth);
const isBaselineImage = (node: View) => node.imageOrSvgElement && node.baseline;
const getBaselineAnchor = (node: View) => node.imageOrSvgElement ? 'baseline' : 'bottom';
const hasWidth = (style: CSSStyleDeclaration) => (style.getPropertyValue('width') === '100%' || style.getPropertyValue('minWidth') === '100%') && style.getPropertyValue('max-width') === 'none';
const sortTemplateInvalid = (a: NodeXmlTemplate<View>, b: NodeXmlTemplate<View>) => getSortOrderInvalid(a.node.innerMostWrapped as View, b.node.innerMostWrapped as View);
const sortTemplateStandard = (a: NodeXmlTemplate<View>, b: NodeXmlTemplate<View>) => getSortOrderStandard(a.node.innerMostWrapped as View, b.node.innerMostWrapped as View);
const hasCleared = (layout: LayoutUI<View>, clearMap: Map<View, string>, ignoreFirst = true) => clearMap.size > 0 && layout.some((node, index) => (index > 0 || !ignoreFirst) && clearMap.has(node));
const isMultiline = (node: View) => node.plainText && Resource.hasLineBreak(node, false, true) || node.preserveWhiteSpace && /^\s*\n+/.test(node.textContent);
const getMaxHeight = (node: View) => Math.max(node.actualHeight, node.lineHeight);
const isUnknownParent = (parent: View, value: number, length: number) => parent.containerType === value && parent.length === length && (parent.alignmentType === 0 || parent.hasAlign(NODE_ALIGNMENT.UNKNOWN));

function getBoxWidth(this: Controller<View>, node: View, children: View[]) {
    const renderParent = node.renderParent as View;
    if (renderParent.overflowY) {
        return renderParent.box.width;
    }
    else {
        const parent = node.actualParent as Null<View>;
        if (parent) {
            if (node.naturalElement && node.inlineStatic && parent.blockStatic && parent === renderParent) {
                return parent.box.width - (node.linear.left - parent.box.left);
            }
            else if (parent.floatContainer) {
                const { containerType, alignmentType } = this.containerTypeVerticalMargin;
                const container = node.ascend({ condition: (item: View) => item.of(containerType, alignmentType), including: parent, attr: 'renderParent' });
                if (container.length > 0) {
                    const { left, right, width } = node.box;
                    let offsetLeft = 0,
                        offsetRight = 0;
                    const naturalChildren = parent.naturalChildren;
                    const length = naturalChildren.length;
                    let i = 0;
                    while (i < length) {
                        const item = naturalChildren[i++] as View;
                        if (item.floating) {
                            const linear = item.linear;
                            if (!children.includes(item) && node.intersectY(linear)) {
                                if (item.float === 'left') {
                                    if (Math.floor(linear.right) > left) {
                                        offsetLeft = Math.max(offsetLeft, linear.right - left);
                                    }
                                }
                                else if (right > Math.ceil(linear.left)) {
                                    offsetRight = Math.max(offsetRight, right - linear.left);
                                }
                            }
                        }
                    }
                    return width - (offsetLeft + offsetRight);
                }
            }
        }
    }
    return undefined;
}

export function setHorizontalAlignment(node: View) {
    if (node.centerAligned) {
        node.anchorParent('horizontal', 0.5);
    }
    else {
        const autoMargin = node.autoMargin;
        if (autoMargin.horizontal) {
            node.anchorParent('horizontal', autoMargin.left
                ? 1
                : autoMargin.leftRight
                    ? 0.5
                    : 0
            );
        }
        else {
            const rightAligned = node.rightAligned;
            if (rightAligned) {
                node.anchor('right', 'parent');
                node.anchorStyle('horizontal', 1);
            }
            else {
                node.anchor('left', 'parent');
                node.anchorStyle('horizontal', 0);
            }
            if (node.blockStatic || node.percentWidth > 0 || node.block && node.multiline && node.floating) {
                node.anchor(rightAligned ? 'left' : 'right', 'parent');
            }
        }
    }
}

export function setVerticalAlignment(node: View, onlyChild = true, biasOnly?: boolean) {
    const autoMargin = node.autoMargin;
    let bias = onlyChild ? 0 : NaN;
    if (node.floating) {
        bias = 0;
    }
    else if (autoMargin.vertical) {
        bias = autoMargin.top
            ? 1
            : autoMargin.topBottom
                ? 0.5
                : 0;
    }
    else if (node.imageOrSvgElement || node.inlineVertical) {
        switch (node.verticalAlign) {
            case 'baseline':
                bias = onlyChild ? 0 : 1;
                break;
            case 'middle':
                bias = 0.5;
                break;
            case 'bottom':
                bias = 1;
                break;
            default:
                bias = 0;
                break;
        }
    }
    else {
        const parent = node.actualParent;
        if (parent?.display === 'table-cell') {
            switch (parent.verticalAlign) {
                case 'middle':
                    bias = 0.5;
                    break;
                case 'bottom':
                    bias = 1;
                    break;
                default:
                    bias = 0;
                    break;
            }
        }
        else {
            switch (node.display) {
                case 'inline-flex':
                case 'inline-grid':
                case 'inline-table':
                case 'table-cell':
                    bias = 0;
                    break;
            }
        }
    }
    if (!isNaN(bias)) {
        if (biasOnly) {
            node.app('layout_constraintVertical_bias', bias.toString(), false);
            node.delete('layout_constraintVertical_chainStyle');
        }
        else {
            node.anchorStyle('vertical', bias, onlyChild ? '' : 'packed', false);
        }
    }
}

export default class Controller<T extends View> extends squared.base.ControllerUI<T> implements android.base.Controller<T> {
    public static anchorPosition<T extends View>(node: T, parent: T, horizontal: boolean, modifyAnchor = true) {
        const [orientation, dimension, posA, posB, marginA, marginB, paddingA, paddingB] =
            horizontal
                ? ['horizontal', 'width', 'left', 'right', BOX_STANDARD.MARGIN_LEFT, BOX_STANDARD.MARGIN_RIGHT, BOX_STANDARD.PADDING_LEFT, BOX_STANDARD.PADDING_RIGHT]
                : ['vertical', 'height', 'top', 'bottom', BOX_STANDARD.MARGIN_TOP, BOX_STANDARD.MARGIN_BOTTOM, BOX_STANDARD.PADDING_TOP, BOX_STANDARD.PADDING_BOTTOM];
        const autoMargin = node.autoMargin;
        const hasDimension = node.hasPX(dimension);
        const result: Partial<BoxRect> = {};
        const hasA = node.hasPX(posA);
        const hasB = node.hasPX(posB);
        if (hasDimension && autoMargin[orientation]) {
            if (hasA && autoMargin[posB]) {
                if (modifyAnchor) {
                    node.anchor(posA, 'parent');
                    node.modifyBox(marginA, node[posA]);
                }
                else {
                    result[posA] = node[posA];
                }
            }
            else if (hasB && autoMargin[posA]) {
                if (modifyAnchor) {
                    node.anchor(posB, 'parent');
                    node.modifyBox(marginB, node[posB]);
                }
                else {
                    result[posB] = node[posB];
                }
            }
            else {
                if (modifyAnchor) {
                    node.anchorParent(orientation, 0.5);
                    node.modifyBox(marginA, node[posA]);
                    node.modifyBox(marginB, node[posB]);
                }
                else {
                    result[posA] = node[posA];
                    result[posB] = node[posB];
                }
            }
        }
        else {
            const matchParent = node.css(dimension) === '100%' || node.css(horizontal ? 'minWidth' : 'minHeight') === '100%';
            if (matchParent) {
                const offsetA = hasA ? adjustAbsolutePaddingOffset(parent, paddingA, node[posA]) : undefined;
                const offsetB = hasB ? adjustAbsolutePaddingOffset(parent, paddingB, node[posB]) : undefined;
                if (modifyAnchor) {
                    node.anchorParent(orientation);
                    if (horizontal) {
                        node.setLayoutWidth(View.horizontalMatchConstraint(node, parent));
                    }
                    else {
                        node.setLayoutHeight('0px');
                    }
                    if (offsetA) {
                        node.modifyBox(marginA, offsetA);
                    }
                    if (offsetB) {
                        node.modifyBox(marginB, offsetB);
                    }
                }
                else {
                    result[posA] = offsetA;
                    result[posB] = offsetB;
                }
            }
            else {
                let expand = 0;
                if (hasA) {
                    const value = adjustAbsolutePaddingOffset(parent, paddingA, node[posA]);
                    if (modifyAnchor) {
                        node.anchor(posA, 'parent');
                        node.modifyBox(marginA, value);
                        ++expand;
                    }
                    else {
                        result[posA] = value;
                    }
                }
                if (hasB) {
                    if (!hasA || !hasDimension) {
                        const value = adjustAbsolutePaddingOffset(parent, paddingB, node[posB]);
                        if (modifyAnchor) {
                            node.anchor(posB, 'parent');
                            node.modifyBox(marginB, value);
                            ++expand;
                        }
                        else {
                            result[posB] = value;
                        }
                    }
                }
                if (modifyAnchor) {
                    switch (expand) {
                        case 0:
                            if (horizontal) {
                                if (node.centerAligned) {
                                    node.anchorParent('horizontal', 0.5);
                                }
                                else if (node.rightAligned) {
                                    if (node.blockStatic) {
                                        node.anchorParent('horizontal', 1);
                                    }
                                    else {
                                        node.anchor('right', 'parent');
                                    }
                                }
                            }
                            break;
                        case 2:
                            if (!hasDimension && !(autoMargin[orientation] === true && autoMargin[posA] !== true && autoMargin[posB] !== true)) {
                                if (horizontal) {
                                    node.setLayoutWidth(View.horizontalMatchConstraint(node, parent));
                                }
                                else {
                                    node.setLayoutHeight('0px');
                                }
                                if (parent.innerMostWrapped.documentBody) {
                                    const options = { type: CSS_UNIT.LENGTH | CSS_UNIT.PERCENT, not: '100%' };
                                    do {
                                        if (!parent.has(dimension, options) && !parent.has(horizontal ? 'maxWidth' : 'maxHeight', options)) {
                                            if (horizontal) {
                                                parent.setLayoutWidth('match_parent', parent.inlineWidth);
                                            }
                                            else {
                                                parent.setLayoutHeight('match_parent', parent.inlineWidth);
                                            }
                                            parent = parent.outerWrapper as T;
                                        }
                                        else {
                                            break;
                                        }
                                    }
                                    while (parent);
                                }
                            }
                            break;
                    }
                }
            }
        }
        return result;
    }

    public readonly localSettings: AndroidControllerSettingsUI = {
        layout: {
            pathName: 'res/layout',
            fileExtension: 'xml',
            baseTemplate: STRING_XMLENCODING
        },
        directory: {
            string: 'res/values',
            font: 'res/font',
            image: 'res/drawable',
            video: 'res/raw',
            audio: 'res/raw'
        },
        svg: {
            enabled: false
        },
        style: {
            inputBorderColor: 'rgb(0, 0, 0)',
            inputBackgroundColor: isPlatform(PLATFORM.MAC) ? 'rgb(255, 255, 255)' : 'rgb(221, 221, 221)',
            inputColorBorderColor: 'rgb(119, 119, 199)',
            meterForegroundColor: 'rgb(99, 206, 68)',
            meterBackgroundColor: 'rgb(237, 237, 237)',
            progressForegroundColor: 'rgb(138, 180, 248)',
            progressBackgroundColor: 'rgb(237, 237, 237)'
        },
        mimeType: {
            font: ['font/ttf', 'font/otf'],
            image: ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/svg+xml', 'image/heic', 'image/heif', 'image/x-icon'],
            audio: ['video/3gpp', 'video/mp4', 'video/mp2t', 'video/x-matroska', 'audio/aac', 'audio/flac', 'audio/gsm', 'audio/midi', 'audio/mpeg', 'audio/wav', 'audio/ogg'],
            video: ['video/3gpp', 'video/mp4', 'video/mp2t', 'video/x-matroska', 'video/webm']
        },
        unsupported: {
            cascade: new Set([
                'IMG',
                'INPUT',
                'SELECT',
                'TEXTAREA',
                'PROGRESS',
                'METER',
                'HR',
                'IFRAME',
                'VIDEO',
                'AUDIO',
                'OBJECT',
                'svg'
            ]),
            tagName: new Set([
                'HEAD',
                'TITLE',
                'META',
                'BASE',
                'SCRIPT',
                'STYLE',
                'LINK',
                'OPTION',
                'INPUT:hidden',
                'COLGROUP',
                'MAP',
                'AREA',
                'SOURCE',
                'TEMPLATE',
                'DATALIST',
                'PARAM',
                'TRACK'
            ]),
            excluded: new Set(['BR', 'WBR'])
        },
        precision: {
            standardFloat: 3
        },
        deviations: {
            textMarginBoundarySize: 8,
            subscriptBottomOffset: 0.35,
            superscriptTopOffset: 0.35,
            legendBottomOffset: 0.25
        }
    };

    protected _screenDimension!: Dimension;

    private _defaultViewSettings!: AndroidLocalSettingsUI;
    private _targetAPI!: number;

    constructor(public readonly application: android.base.Application<T>) {
        super();
    }

    public init() {
        const userSettings = this.userSettings;
        const dpiRatio = 160 / userSettings.resolutionDPI;
        this._targetAPI = userSettings.targetAPI || BUILD_ANDROID.LATEST;
        this._screenDimension = {
            width: userSettings.resolutionScreenWidth * dpiRatio,
            height: userSettings.resolutionScreenHeight * dpiRatio
        };
        this._defaultViewSettings = {
            systemName: this.application.systemName,
            screenDimension: this._screenDimension,
            supportRTL: userSettings.supportRTL,
            floatPrecision: this.localSettings.precision.standardFloat
        };
        super.init();
    }

    public optimize(rendered: T[]) {
        const length = rendered.length;
        let i = 0;
        while (i < length) {
            const node = rendered[i++];
            node.applyOptimizations();
            if (node.hasProcedure(NODE_PROCEDURE.CUSTOMIZATION)) {
                node.applyCustomizations(this.userSettings.customizationsOverwritePrivilege);
            }
            const target = node.target;
            if (target) {
                const outerWrapper = node.outerMostWrapper as T;
                if (node !== outerWrapper && target === outerWrapper.target) {
                    continue;
                }
                const parent = this.application.resolveTarget(node.sessionId, target);
                if (parent) {
                    const template = node.removeTry({ alignSiblings: true }) as NodeTemplate<T>;
                    if (template) {
                        const renderChildren = parent.renderChildren;
                        const renderTemplates = safeNestedArray(parent as StandardMap, 'renderTemplates');
                        const index = parseInt(node.dataset.androidTargetIndex as string);
                        if (!isNaN(index) && index >= 0 && index < renderChildren.length) {
                            renderChildren.splice(index, 0, node);
                            renderTemplates.splice(index, 0, template);
                        }
                        else {
                            renderChildren.push(node);
                            renderTemplates.push(template);
                        }
                        node.renderParent = parent;
                    }
                }
            }
        }
    }

    public finalize(layouts: FileAsset[]) {
        const insertSpaces = this.userSettings.insertSpaces;
        for (const layout of layouts) {
            layout.content = replaceTab(
                layout.content!.replace('{#0}', getRootNs(layout.content!)),
                insertSpaces
            );
        }
    }

    public processUnknownParent(layout: LayoutUI<T>) {
        const node = layout.node;
        const tagName = node.tagName;
        if (tagName === 'OBJECT' || tagName === 'EMBED') {
            setObjectContainer(layout);
        }
        else if (layout.some(item => !item.pageFlow && !item.autoPosition)) {
            layout.setContainerType(CONTAINER_NODE.CONSTRAINT, NODE_ALIGNMENT.ABSOLUTE | NODE_ALIGNMENT.UNKNOWN);
        }
        else if (layout.length <= 1) {
            const child = node.item(0) as Undef<T>;
            if (child) {
                if (child.plainText) {
                    child.hide();
                    node.clear();
                    node.inlineText = true;
                    node.textContent = child.textContent;
                    layout.setContainerType(CONTAINER_NODE.TEXT, NODE_ALIGNMENT.INLINE);
                }
                else if (child.percentWidth > 0 && child.percentWidth < 1) {
                    layout.setContainerType(CONTAINER_NODE.CONSTRAINT, NODE_ALIGNMENT.PERCENT);
                }
                else if (child.autoMargin.leftRight || child.autoMargin.left || child.hasPX('maxWidth') && !child.support.maxDimension && !child.inputElement) {
                    layout.setContainerType(CONTAINER_NODE.CONSTRAINT);
                }
                else if (child.baselineElement) {
                    if (layout.parent.flexElement && node.flexbox.alignSelf === 'baseline') {
                        layout.setContainerType(CONTAINER_NODE.LINEAR, NODE_ALIGNMENT.HORIZONTAL);
                    }
                    else {
                        layout.setContainerType(getVerticalAlignedLayout(layout), NODE_ALIGNMENT.VERTICAL);
                    }
                }
                else {
                    layout.setContainerType(CONTAINER_NODE.FRAME);
                }
                layout.addAlign(NODE_ALIGNMENT.SINGLE);
            }
            else {
                return this.processUnknownChild(layout);
            }
        }
        else if (Resource.hasLineBreak(node, true)) {
            layout.setContainerType(getVerticalAlignedLayout(layout), NODE_ALIGNMENT.VERTICAL | NODE_ALIGNMENT.UNKNOWN);
        }
        else if (this.checkConstraintFloat(layout)) {
            layout.setContainerType(CONTAINER_NODE.CONSTRAINT);
            if (layout.every(item => item.floating)) {
                layout.addAlign(NODE_ALIGNMENT.FLOAT);
            }
            else if (layout.linearY) {
                layout.addAlign(NODE_ALIGNMENT.VERTICAL);
            }
            else if (layout.some(item => item.floating || item.rightAligned) && layout.singleRowAligned) {
                layout.addAlign(NODE_ALIGNMENT.HORIZONTAL);
            }
            else {
                layout.addAlign(layout.some(item => item.blockStatic) ? NODE_ALIGNMENT.VERTICAL : NODE_ALIGNMENT.INLINE);
                layout.addAlign(NODE_ALIGNMENT.UNKNOWN);
            }
        }
        else if (layout.linearX || layout.singleRowAligned) {
            if (this.checkFrameHorizontal(layout)) {
                layout.addRender(NODE_ALIGNMENT.FLOAT);
                layout.addRender(NODE_ALIGNMENT.HORIZONTAL);
            }
            else if (this.checkConstraintHorizontal(layout)) {
                layout.setContainerType(CONTAINER_NODE.CONSTRAINT);
            }
            else if (this.checkLinearHorizontal(layout)) {
                layout.setContainerType(CONTAINER_NODE.LINEAR);
                if (layout.floated.size > 0) {
                    sortHorizontalFloat(layout.children);
                }
            }
            else {
                layout.setContainerType(isConstraintLayout(layout, false) ? CONTAINER_NODE.CONSTRAINT : CONTAINER_NODE.RELATIVE);
            }
            layout.addAlign(NODE_ALIGNMENT.HORIZONTAL);
        }
        else if (layout.linearY) {
            layout.setContainerType(getVerticalLayout(layout), NODE_ALIGNMENT.VERTICAL | (node.rootElement || layout.some((item, index) => item.inlineFlow && layout.item(index + 1)!.inlineFlow, { end: layout.length - 1 }) ? NODE_ALIGNMENT.UNKNOWN : 0));
        }
        else if (layout.every(item => item.inlineFlow)) {
            if (this.checkFrameHorizontal(layout)) {
                layout.addRender(NODE_ALIGNMENT.FLOAT);
                layout.addRender(NODE_ALIGNMENT.HORIZONTAL);
            }
            else {
                layout.setContainerType(getVerticalLayout(layout), NODE_ALIGNMENT.VERTICAL | NODE_ALIGNMENT.UNKNOWN);
            }
        }
        else {
            const children = layout.children;
            const clearMap = layout.parent.floatContainer ? this.application.clearMap : undefined;
            if (layout.some((item, index) => item.alignedVertically(index > 0 ? children.slice(0, index) : undefined, clearMap) > 0)) {
                layout.setContainerType(getVerticalLayout(layout), NODE_ALIGNMENT.VERTICAL | NODE_ALIGNMENT.UNKNOWN);
            }
            else {
                layout.setContainerType(CONTAINER_NODE.CONSTRAINT, NODE_ALIGNMENT.UNKNOWN);
            }
        }
        return { layout };
    }

    public processUnknownChild(layout: LayoutUI<T>) {
        const node = layout.node;
        const background = node.visibleStyle.background;
        if (node.tagName === 'OBJECT') {
            setObjectContainer(layout);
        }
        else if (node.inlineText && (background || !node.textEmpty)) {
            layout.setContainerType(CONTAINER_NODE.TEXT);
        }
        else if (node.blockStatic && node.naturalChildren.length === 0 && (background || node.contentBoxHeight > 0)) {
            layout.setContainerType(CONTAINER_NODE.FRAME);
        }
        else if (
            node.bounds.height === 0 &&
            node.naturalChild &&
            node.naturalElements.length === 0 &&
            node.elementId === '' &&
            node.marginTop === 0 &&
            node.marginRight === 0 &&
            node.marginBottom === 0 &&
            node.marginLeft === 0 &&
            !background &&
            !node.rootElement &&
            !node.use)
        {
            node.hide();
            return { layout, next: true };
        }
        else {
            switch (node.tagName)  {
                case 'LI':
                case 'OUTPUT':
                    layout.setContainerType(CONTAINER_NODE.TEXT);
                    break;
                default: {
                    if (node.textContent !== '' && (background || !node.pageFlow || node.pseudoElement && getPseudoElt(node.element as Element, node.sessionId) === '::after')) {
                        layout.setContainerType(CONTAINER_NODE.TEXT);
                        node.inlineText = true;
                    }
                    else {
                        layout.setContainerType(CONTAINER_NODE.FRAME);
                        node.exclude({ resource: NODE_RESOURCE.VALUE_STRING });
                    }
                }
            }
        }
        return { layout };
    }

    public processTraverseHorizontal(layout: LayoutUI<T>, siblings: T[]) {
        const parent = layout.parent;
        if (layout.floated.size === 1 && layout.every(item => item.floating)) {
            if (isUnknownParent(parent, CONTAINER_NODE.CONSTRAINT, layout.length)) {
                parent.addAlign(NODE_ALIGNMENT.FLOAT);
                parent.removeAlign(NODE_ALIGNMENT.UNKNOWN);
                return undefined;
            }
            else {
                layout.node = this.createNodeGroup(layout.node, layout.children, parent);
                layout.setContainerType(CONTAINER_NODE.CONSTRAINT, NODE_ALIGNMENT.FLOAT);
            }
        }
        else if (this.checkFrameHorizontal(layout)) {
            layout.node = this.createNodeGroup(layout.node, layout.children, parent);
            layout.addRender(NODE_ALIGNMENT.FLOAT);
            layout.addRender(NODE_ALIGNMENT.HORIZONTAL);
        }
        else if (layout.length !== siblings.length || parent.hasAlign(NODE_ALIGNMENT.VERTICAL)) {
            layout.node = this.createNodeGroup(layout.node, layout.children, parent);
            this.processLayoutHorizontal(layout);
        }
        else {
            if (!parent.hasAlign(NODE_ALIGNMENT.INLINE)) {
                parent.addAlign(NODE_ALIGNMENT.HORIZONTAL);
            }
            parent.removeAlign(NODE_ALIGNMENT.UNKNOWN);
        }
        return layout;
    }

    public processTraverseVertical(layout: LayoutUI<T>) {
        const parent = layout.parent;
        const clearMap = this.application.clearMap;
        const floatSize = layout.floated.size;
        const length = layout.length;
        if (layout.some((item, index) => item.lineBreakTrailing && index < length - 1)) {
            if (!parent.hasAlign(NODE_ALIGNMENT.VERTICAL)) {
                const containerType = getVerticalLayout(layout);
                if (isUnknownParent(parent, containerType, length)) {
                    setVerticalLayout(parent);
                    return undefined;
                }
                else {
                    if (parent.layoutConstraint) {
                        parent.addAlign(NODE_ALIGNMENT.VERTICAL);
                        if (!parent.hasAlign(NODE_ALIGNMENT.ABSOLUTE)) {
                            return undefined;
                        }
                    }
                    layout.node = this.createLayoutGroup(layout);
                    layout.setContainerType(containerType, NODE_ALIGNMENT.VERTICAL | NODE_ALIGNMENT.UNKNOWN);
                }
            }
        }
        else if (floatSize === 1 && layout.every((item, index) => index === 0 || index === length - 1 || clearMap.has(item))) {
            if (layout.same(node => node.float)) {
                if (isUnknownParent(parent, CONTAINER_NODE.CONSTRAINT, length)) {
                    setVerticalLayout(parent);
                    return undefined;
                }
                else {
                    layout.node = this.createLayoutGroup(layout);
                    layout.setContainerType(CONTAINER_NODE.CONSTRAINT, NODE_ALIGNMENT.FLOAT);
                }
            }
            else if (hasCleared(layout, clearMap) || this.checkFrameHorizontal(layout)) {
                layout.node = this.createLayoutGroup(layout);
                layout.addRender(NODE_ALIGNMENT.FLOAT);
                layout.addRender(NODE_ALIGNMENT.HORIZONTAL);
            }
            else {
                const containerType = getVerticalAlignedLayout(layout);
                if (isUnknownParent(parent, containerType, length)) {
                    setVerticalLayout(parent);
                    return undefined;
                }
                else {
                    if (parent.layoutConstraint) {
                        parent.addAlign(NODE_ALIGNMENT.VERTICAL);
                        if (!parent.hasAlign(NODE_ALIGNMENT.ABSOLUTE)) {
                            return undefined;
                        }
                    }
                    layout.node = this.createLayoutGroup(layout);
                    layout.setContainerType(containerType, NODE_ALIGNMENT.VERTICAL);
                }
            }
        }
        else if (floatSize) {
            if (hasCleared(layout, clearMap)) {
                layout.node = this.createLayoutGroup(layout);
                layout.addRender(NODE_ALIGNMENT.FLOAT);
                layout.addRender(NODE_ALIGNMENT.VERTICAL);
            }
            else if (layout.item(0)!.floating) {
                layout.node = this.createLayoutGroup(layout);
                layout.addRender(NODE_ALIGNMENT.FLOAT);
                layout.addRender(NODE_ALIGNMENT.HORIZONTAL);
            }
        }
        if (!parent.hasAlign(NODE_ALIGNMENT.VERTICAL)) {
            const containerType = getVerticalAlignedLayout(layout);
            if (isUnknownParent(parent, containerType, length)) {
                setVerticalLayout(parent);
                return undefined;
            }
            else {
                if (parent.layoutConstraint) {
                    parent.addAlign(NODE_ALIGNMENT.VERTICAL);
                    if (!parent.hasAlign(NODE_ALIGNMENT.ABSOLUTE)) {
                        return undefined;
                    }
                }
                layout.node = this.createLayoutGroup(layout);
                layout.setContainerType(containerType, NODE_ALIGNMENT.VERTICAL);
            }
        }
        return layout;
    }

    public processLayoutHorizontal(layout: LayoutUI<T>) {
        if (this.checkConstraintFloat(layout)) {
            layout.setContainerType(CONTAINER_NODE.CONSTRAINT, layout.every(item => item.floating) ? NODE_ALIGNMENT.FLOAT : NODE_ALIGNMENT.INLINE);
        }
        else if (this.checkConstraintHorizontal(layout)) {
            layout.setContainerType(CONTAINER_NODE.CONSTRAINT, NODE_ALIGNMENT.HORIZONTAL);
        }
        else if (this.checkLinearHorizontal(layout)) {
            layout.setContainerType(CONTAINER_NODE.LINEAR, NODE_ALIGNMENT.HORIZONTAL);
            if (layout.floated.size > 0) {
                sortHorizontalFloat(layout.children);
            }
        }
        else {
            layout.setContainerType(CONTAINER_NODE.RELATIVE, NODE_ALIGNMENT.HORIZONTAL);
        }
        return layout;
    }

    public sortRenderPosition(parent: T, templates: NodeXmlTemplate<T>[]) {
        if (parent.layoutRelative) {
            if (templates.some(item => item.node.zIndex !== 0)) {
                templates.sort(sortTemplateStandard);
            }
        }
        else if (parent.layoutConstraint) {
            if (templates.some(item => item.node.zIndex !== 0 || !item.node.pageFlow)) {
                const originalParent = parent.innerMostWrapped as T;
                const actualParent: T[] = [];
                const nested: NodeXmlTemplate<T>[] = [];
                let result: NodeXmlTemplate<T>[] = [],
                    length = templates.length;
                let i = 0;
                while (i < length) {
                    const item = templates[i++];
                    const node = item.node.innerMostWrapped as T;
                    if (node.pageFlow || node.actualParent === node.documentParent || node === originalParent) {
                        result.push(item);
                        actualParent.push(node);
                    }
                    else {
                        nested.push(item);
                    }
                }
                result.sort(sortTemplateStandard);
                length = nested.length;
                if (length > 0) {
                    const map = new Map<T, NodeXmlTemplate<T>[]>();
                    const invalid: NodeXmlTemplate<T>[] = [];
                    const below: NodeXmlTemplate<T>[] = [];
                    i = 0;
                    while (i < length) {
                        const item = nested[i++];
                        const node = item.node.innerMostWrapped;
                        const adjacent = node.ascend({ condition: (above: T) => actualParent.includes(above), error: (above: T) => above.rootElement })[0] as T | undefined;
                        if (adjacent) {
                            map.get(adjacent)?.push(item) || map.set(adjacent, [item]);
                        }
                        else if (node.zIndex < 0) {
                            below.push(item);
                        }
                        else {
                            invalid.push(item);
                        }
                    }
                    for (const [adjacent, children] of map.entries()) {
                        children.sort(sortTemplateStandard);
                        const index = result.findIndex(item => item.node.innerMostWrapped === adjacent);
                        if (index !== -1) {
                            result.splice(index + 1, 0, ...children);
                        }
                        else {
                            const q = children.length;
                            i = 0;
                            while (i < q) {
                                const item = children[i++];
                                const node = item.node.innerMostWrapped;
                                if (node.zIndex < 0) {
                                    below.push(item);
                                }
                                else {
                                    invalid.push(item);
                                }
                            }
                        }
                    }
                    if (below.length > 0) {
                        below.sort(sortTemplateInvalid);
                        result = below.concat(result);
                    }
                    if (invalid.length > 0) {
                        invalid.sort(sortTemplateInvalid);
                        result = result.concat(invalid);
                    }
                }
                return result;
            }
        }
        return templates;
    }

    public checkFrameHorizontal(layout: LayoutUI<T>) {
        switch (layout.floated.size) {
            case 1:
                if (layout.node.cssAscend('textAlign') === 'center' && layout.some(item => !item.block && !item.floating)) {
                    return true;
                }
                else if (layout.floated.has('right')) {
                    let pageFlow = 0,
                        multiline = false;
                    for (const node of layout) {
                        if (node.floating) {
                            if (multiline) {
                                return false;
                            }
                            continue;
                        }
                        else if (node.multiline) {
                            multiline = true;
                        }
                        ++pageFlow;
                    }
                    return pageFlow > 0 && !layout.singleRowAligned;
                }
                else if (layout.item(0)!.floating) {
                    return layout.linearY || layout.some(item => item.block && !item.floating || !item.inlineFlow, { start: 1 });
                }
                break;
            case 2:
                return true;
        }
        return false;
    }

    public checkConstraintFloat(layout: LayoutUI<T>) {
        if (layout.length > 1) {
            const clearMap = this.application.clearMap;
            let A = true,
                B = true;
            for (const node of layout) {
                if (!clearMap.has(node)) {
                    const inputElement = node.inputElement || node.controlElement;
                    if (A && !(node.floating || node.autoMargin.horizontal || node.inlineDimension && !inputElement || node.imageOrSvgElement || node.marginTop < 0)) {
                        A = false;
                    }
                    if (B && node.percentWidth === 0) {
                        B = false;
                    }
                    if (!A && !B) {
                        return false;
                    }
                }
            }
            return true;
        }
        return false;
    }

    public checkConstraintHorizontal(layout: LayoutUI<T>) {
        if (layout.length > 1 && layout.singleRowAligned) {
            switch (layout.floated.size) {
                case 1:
                    if (hasCleared(layout, this.application.clearMap)) {
                        return false;
                    }
                    else {
                        let left = false,
                            right = false;
                        for (const node of layout) {
                            const { float, autoMargin } = node;
                            if (float === 'left' || autoMargin.right) {
                                left = true;
                                if (right) {
                                    return false;
                                }
                            }
                            if (float === 'right' || autoMargin.left) {
                                right = true;
                                if (left) {
                                    return false;
                                }
                            }
                        }
                    }
                    break;
                case 2:
                    return false;
            }
            return layout.some(node => node.blockVertical || node.percentWidth > 0 && node.percentWidth < 1 && !node.inputElement && !node.controlElement || node.marginTop < 0 || node.verticalAlign === 'bottom' && !layout.parent.hasHeight);
        }
        return false;
    }

    public checkLinearHorizontal(layout: LayoutUI<T>) {
        const floated = layout.floated;
        const floatSize = floated.size;
        if ((floatSize === 0 || floatSize === 1 && floated.has('left')) && layout.node.lineHeight === 0 && layout.singleRowAligned) {
            const { fontSize, lineHeight } = layout.item(0) as T;
            const boxWidth = layout.parent.actualBoxWidth();
            let contentWidth = 0;
            for (const node of layout) {
                if (!(node.naturalChild && node.isEmpty && !node.inputElement && !node.controlElement && !node.positionRelative && node.baseline && !node.blockVertical && node.zIndex === 0 && node.lineHeight === lineHeight && node.fontSize === fontSize)) {
                    return false;
                }
                else {
                    contentWidth += node.linear.width;
                }
                if (contentWidth >= boxWidth) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    public setConstraints(cache: squared.base.NodeList<T>) {
        cache.each(node => {
            const renderChildren = node.renderChildren as T[];
            const length = renderChildren.length;
            if (length > 0 && node.hasProcedure(NODE_PROCEDURE.CONSTRAINT)) {
                if (node.hasAlign(NODE_ALIGNMENT.AUTO_LAYOUT)) {
                    if (node.layoutConstraint && !node.layoutElement) {
                        this.evaluateAnchors(renderChildren);
                    }
                }
                else if (node.layoutRelative) {
                    this.processRelativeHorizontal(node, renderChildren);
                }
                else if (node.layoutConstraint) {
                    const pageFlow: T[] = new Array(length);
                    let i = 0, j = 0;
                    while (i < length) {
                        const item = renderChildren[i++];
                        if (!item.positioned) {
                            if (item.pageFlow || item.autoPosition) {
                                pageFlow[j++] = item;
                            }
                            else {
                                const constraint = item.constraint;
                                if (item.outerWrapper === node) {
                                    if (!constraint.horizontal) {
                                        item.anchorParent('horizontal', 0);
                                    }
                                    if (!constraint.vertical) {
                                        item.anchorParent('vertical', 0);
                                    }
                                }
                                else {
                                    if (item.leftTopAxis) {
                                        if (!constraint.horizontal) {
                                            Controller.anchorPosition(item, node, true);
                                        }
                                        if (!constraint.vertical) {
                                            Controller.anchorPosition(item, node, false);
                                        }
                                    }
                                    if (!constraint.horizontal) {
                                        this.addGuideline(item, node, { orientation: 'horizontal' });
                                    }
                                    if (!constraint.vertical) {
                                        this.addGuideline(item, node, { orientation: 'vertical' });
                                    }
                                    item.positioned = true;
                                }
                            }
                        }
                    }
                    if (j > 0) {
                        pageFlow.length = j;
                        if (node.layoutHorizontal) {
                            this.processConstraintHorizontal(node, pageFlow);
                        }
                        else if (j > 1) {
                            this.processConstraintChain(node, pageFlow);
                        }
                        else {
                            const item = pageFlow[0];
                            if (!item.constraint.horizontal) {
                                setHorizontalAlignment(item);
                            }
                            if (!item.constraint.vertical) {
                                item.anchorParent('vertical');
                                setVerticalAlignment(item);
                            }
                            View.setConstraintDimension(item, 1);
                        }
                        this.evaluateAnchors(pageFlow);
                    }
                }
            }
        });
    }

    public renderNodeGroup(layout: LayoutUI<T>) {
        const { node, containerType } = layout;
        switch (containerType) {
            case CONTAINER_NODE.FRAME:
            case CONTAINER_NODE.RELATIVE:
            case CONTAINER_NODE.CONSTRAINT:
                break;
            case CONTAINER_NODE.LINEAR: {
                const options = createViewAttribute();
                options.android.orientation = hasBit(layout.alignmentType, NODE_ALIGNMENT.VERTICAL) ? 'vertical' : 'horizontal';
                node.apply(options);
                break;
            }
            case CONTAINER_NODE.GRID: {
                const options = createViewAttribute();
                const android = options.android;
                if (layout.rowCount > 0) {
                    android.rowCount = layout.rowCount.toString();
                }
                android.columnCount = layout.columnCount > 0 ? layout.columnCount.toString() : '1';
                node.apply(options);
                break;
            }
            default:
                return layout.isEmpty ? this.renderNode(layout) : undefined;
        }
        node.setControlType(View.getControlName(containerType, node.api), containerType);
        node.addAlign(layout.alignmentType);
        node.render(layout.parent);
        return {
            type: NODE_TEMPLATE.XML,
            node,
            controlName: node.controlName
        } as NodeXmlTemplate<T>;
    }

    public renderNode(layout: LayoutUI<T>): NodeXmlTemplate<T> {
        let { parent, containerType } = layout;
        const node = layout.node;
        let controlName = View.getControlName(containerType, node.api);
        switch (node.tagName) {
            case 'IMG':
            case 'CANVAS': {
                const element = node.element as HTMLImageElement;
                const absoluteParent = node.absoluteParent || node.documentParent;
                let imageSet: Undef<ImageSrcSet[]>;
                if (node.actualParent!.tagName === 'PICTURE') {
                    const mimeType = this.localSettings.mimeType.image;
                    imageSet = getSrcSet(element, mimeType === '*' ? undefined : mimeType);
                    if (imageSet) {
                        const image = imageSet[0];
                        const actualWidth = image.actualWidth;
                        if (actualWidth) {
                            setImageDimension(node, actualWidth, this.application.resourceHandler.getImage(element.src));
                        }
                        else {
                            const stored = this.application.resourceHandler.getImage(image.src);
                            if (stored) {
                                setImageDimension(node, stored.width, stored);
                            }
                        }
                    }
                }
                else {
                    let scaleType: Undef<string>;
                    switch (node.css('objectFit')) {
                        case 'fill':
                            scaleType = 'fitXY';
                            break;
                        case 'contain':
                            scaleType = 'centerInside';
                            break;
                        case 'cover':
                            scaleType = 'centerCrop';
                            break;
                        case 'scale-down':
                            scaleType = 'fitCenter';
                            break;
                        case 'none':
                            scaleType = 'center';
                            break;
                    }
                    if (scaleType) {
                        node.android('scaleType', scaleType);
                    }
                }
                if (node.baseline) {
                    node.android('baselineAlignBottom', 'true');
                    if (node.marginBottom > 0 && parent.layoutLinear && parent.layoutHorizontal) {
                        node.mergeGravity('layout_gravity', 'bottom');
                    }
                }
                if (node.hasResource(NODE_RESOURCE.IMAGE_SOURCE)) {
                    let src: Undef<string>;
                    if (node.tagName === 'CANVAS') {
                        const data = ((element as unknown) as HTMLCanvasElement).toDataURL();
                        if (data) {
                            node.setControlType(controlName, containerType);
                            src = 'canvas_' + convertWord(node.controlId, true);
                            this.application.resourceHandler.writeRawImage('image/png', { filename: src + '.png', data, encoding: 'base64' });
                        }
                    }
                    else {
                        src = this.application.resourceHandler.addImageSrc(element, '', imageSet);
                    }
                    if (src) {
                        node.android('src', `@drawable/${src}`);
                    }
                }
                if (!node.pageFlow && parent === absoluteParent && (node.left < 0 && parent.css('overflowX') === 'hidden' || node.top < 0 && parent.css('overflowY') === 'hidden')) {
                    const container = this.application.createNode(node.sessionId, { parent, innerWrap: node });
                    container.setControlType(CONTAINER_ANDROID.FRAME, CONTAINER_NODE.FRAME);
                    container.inherit(node, 'base');
                    container.cssCopy(node, 'position', 'zIndex');
                    container.exclude({ resource: NODE_RESOURCE.ALL, procedure: NODE_PROCEDURE.ALL });
                    container.autoPosition = false;
                    if (node.percentWidth > 0 && parent.layoutConstraint && (parent.blockStatic || parent.hasWidth)) {
                        container.app('layout_constraintWidth_percent', truncate(node.percentWidth, node.localSettings.floatPrecision));
                        container.setLayoutHeight('0px');
                    }
                    else if (node.hasPX('width')) {
                        container.setLayoutWidth(formatPX(node.actualWidth));
                    }
                    else {
                        container.setLayoutWidth('wrap_content');
                    }
                    if (node.percentHeight > 0 && parent.layoutConstraint) {
                        container.app('layout_constraintHeight_percent', truncate(node.percentHeight, node.localSettings.floatPrecision));
                        container.setLayoutHeight('0px');
                    }
                    else if (node.hasPX('height')) {
                        container.setLayoutHeight(formatPX(node.actualHeight));
                    }
                    else {
                        container.setLayoutHeight('wrap_content');
                    }
                    container.render(parent);
                    container.saveAsInitial();
                    node.modifyBox(BOX_STANDARD.MARGIN_TOP, node.top);
                    node.modifyBox(BOX_STANDARD.MARGIN_LEFT, node.left);
                    this.application.addLayoutTemplate(
                        parent,
                        container,
                        {
                            type: NODE_TEMPLATE.XML,
                            node: container,
                            controlName: CONTAINER_ANDROID.FRAME
                        } as NodeXmlTemplate<T>
                    );
                    parent = container;
                    layout.parent = container;
                }
                break;
            }
            case 'INPUT': {
                const element = node.element as HTMLInputElement;
                const type = element.type;
                switch (type) {
                    case 'radio':
                    case 'checkbox':
                        if (element.checked) {
                            node.android('checked', 'true');
                        }
                        break;
                    case 'text':
                        node.android('inputType', 'text');
                        break;
                    case 'password':
                        node.android('inputType', 'textPassword');
                        break;
                    case 'number':
                    case 'range':
                        node.android('inputType', 'number');
                        node.android('progress', element.value);
                        setInputMinMax(node, element);
                        break;
                    case 'time':
                        node.android('inputType', 'time');
                        setInputMinMax(node, element);
                        break;
                    case 'date':
                        node.android('inputType', 'date');
                        setInputMinMax(node, element);
                        break;
                    case 'datetime-local':
                        node.android('inputType', 'datetime');
                        setInputMinMax(node, element);
                        break;
                    case 'email':
                        node.android('inputType', 'textEmailAddress');
                        setInputMinDimension(node, element);
                        break;
                    case 'tel':
                        node.android('inputType', 'phone');
                        setInputMinDimension(node, element);
                        break;
                    case 'url':
                        node.android('inputType', 'textUri');
                        setInputMinDimension(node, element);
                        break;
                    case 'week':
                    case 'month':
                    case 'search':
                        node.android('inputType', 'text');
                        setInputMinDimension(node, element);
                        break;
                    case 'image':
                    case 'color':
                        if (!node.hasWidth) {
                            node.css('width', formatPX(node.bounds.width));
                        }
                        break;
                }
                break;
            }
            case 'BUTTON':
                for (const item of node.naturalChildren as T[]) {
                    if (!item.pageFlow || !item.textElement) {
                        item.android('elevation', '2px');
                    }
                }
                break;
            case 'TEXTAREA': {
                const { cols, maxLength, rows } = node.element as HTMLTextAreaElement;
                node.android('minLines', rows > 0 ? rows.toString() : '2');
                switch (node.css('verticalAlign')) {
                    case 'middle':
                        node.mergeGravity('gravity', 'center_vertical');
                        break;
                    case 'bottom':
                        node.mergeGravity('gravity', 'bottom');
                        break;
                    default:
                        node.mergeGravity('gravity', 'top');
                        break;
                }
                if (maxLength > 0) {
                    node.android('maxLength', maxLength.toString());
                }
                if (!node.hasWidth && cols > 0) {
                    node.css('width', formatPX(cols * 8));
                }
                if (!node.hasHeight) {
                    node.css('height', formatPX(node.bounds.height));
                }
                node.android('scrollbars', 'vertical');
                node.android('inputType', 'textMultiLine');
                if (node.overflowX) {
                    node.android('scrollHorizontally', 'true');
                }
                break;
            }
            case 'LEGEND': {
                if (!node.hasWidth) {
                    node.css('minWidth', formatPX(node.actualWidth));
                    setInlineBlock(node);
                }
                const offset = node.actualHeight * this.localSettings.deviations.legendBottomOffset;
                node.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, offset);
                node.linear.bottom += offset;
                break;
            }
            case 'METER':
            case 'PROGRESS': {
                const { min, max, value } = node.element as HTMLMeterElement;
                let foregroundColor: Undef<string>,
                    backgroundColor: Undef<string>;
                if (node.tagName === 'METER') {
                    ({ meterForegroundColor: foregroundColor, meterBackgroundColor: backgroundColor } = this.localSettings.style);
                    if (max) {
                        if (value) {
                            node.android('progress', Math.round((value / max) * 100).toString());
                        }
                        if (max === 100) {
                            node.android('min', min.toString());
                            node.android('max', max.toString());
                        }
                    }
                }
                else {
                    ({ progressForegroundColor: foregroundColor, progressBackgroundColor: backgroundColor } = this.localSettings.style);
                    if (value) {
                        node.android('progress', value.toString());
                    }
                    if (max) {
                        node.android('max', max.toString());
                    }
                }
                if (!node.hasWidth) {
                    node.css('width', formatPX(node.bounds.width));
                }
                if (!node.hasHeight) {
                    node.css('height', formatPX(node.bounds.height));
                }
                node.android('progressTint', '@color/' + Resource.addColor(foregroundColor));
                node.android('progressBackgroundTint', '@color/' + Resource.addColor(backgroundColor));
                node.attr('_', 'style', '@android:style/Widget.ProgressBar.Horizontal');
                node.exclude({ resource: NODE_RESOURCE.BOX_STYLE | NODE_RESOURCE.FONT_STYLE });
                break;
            }
            case 'AUDIO':
            case 'VIDEO': {
                const videoMimeType = this.localSettings.mimeType.video;
                const element = node.element as HTMLVideoElement;
                let src = element.src.trim(),
                    mimeType: Undef<string>;
                if (hasMimeType(videoMimeType, src)) {
                    mimeType = parseMimeType(src);
                }
                else {
                    src = '';
                    iterateArray(element.children, (source: HTMLSourceElement) => {
                        if (source.tagName === 'SOURCE') {
                            if (hasMimeType(videoMimeType, source.src)) {
                                src = source.src.trim();
                                mimeType = parseMimeType(src);
                                return true;
                            }
                            else {
                                mimeType = source.type.trim().toLowerCase();
                                if (videoMimeType.includes(mimeType)) {
                                    src = source.src;
                                    return true;
                                }
                            }
                        }
                        return;
                    });
                }
                if (!node.hasPX('width')) {
                    node.css('width', formatPX(node.actualWidth), true);
                }
                if (!node.hasPX('height')) {
                    node.css('height', formatPX(node.actualHeight), true);
                }
                if (node.inline) {
                    setInlineBlock(node);
                }
                if (src !== '') {
                    this.application.resourceHandler.addVideo(src, mimeType);
                    node.inlineText = false;
                    node.exclude({ resource: NODE_RESOURCE.FONT_STYLE });
                    if (isString(element.poster)) {
                        Resource.addImage({ mdpi: element.poster.trim() });
                    }
                }
                else if (isString(element.poster)) {
                    node.setCacheValue('tagName', 'IMG');
                    src = element.src;
                    element.src = element.poster.trim();
                    layout.containerType = CONTAINER_NODE.IMAGE;
                    const template = this.renderNode(layout);
                    element.src = src;
                    return template;
                }
                else {
                    containerType = CONTAINER_NODE.TEXT;
                    controlName = View.getControlName(containerType, node.api);
                    layout.containerType = containerType;
                    node.inlineText = true;
                }
            }
        }
        switch (controlName) {
            case CONTAINER_ANDROID.TEXT: {
                let overflow = '';
                if (node.overflowX) {
                    overflow += 'horizontal';
                }
                if (node.overflowY) {
                    overflow += (overflow !== '' ? '|' : '') + 'vertical';
                }
                if (overflow !== '') {
                    node.android('scrollbars', overflow);
                }
                if (node.has('letterSpacing')) {
                    node.android('letterSpacing', truncate(node.toFloat('letterSpacing') / node.fontSize, node.localSettings.floatPrecision));
                }
                if (node.css('textAlign') === 'justify') {
                    node.android('justificationMode', 'inter_word');
                }
                if (node.has('textShadow')) {
                    const match = /((?:rgb|hsl)a?\([^)]+\)|[a-z]{4,})?\s*(-?[\d.]+[a-z]+)\s+(-?[\d.]+[a-z]+)\s*([\d.]+[a-z]+)?/.exec(node.css('textShadow'));
                    if (match) {
                        const color = Resource.addColor(parseColor(match[1] || node.css('color')));
                        if (color !== '') {
                            const precision = node.localSettings.floatPrecision;
                            node.android('shadowColor', `@color/${color}`);
                            node.android('shadowDx', truncate(node.parseWidth(match[2]) * 2, precision));
                            node.android('shadowDy', truncate(node.parseHeight(match[3]) * 2, precision));
                            node.android('shadowRadius', truncate(match[4] ? Math.max(node.parseWidth(match[4]), 0) : 0.01, precision));
                        }
                    }
                }
                if (node.css('whiteSpace') === 'nowrap') {
                    node.android('maxLines', '1');
                    if (node.css('textOverflow') === 'ellipsis' && node.css('overflow') === 'hidden') {
                        node.android('ellipsize', 'end');
                    }
                }
                break;
            }
            case CONTAINER_ANDROID.BUTTON:
                if (!node.hasHeight) {
                    node.android('minHeight', formatPX(Math.ceil(node.actualHeight)));
                }
                node.mergeGravity('gravity', 'center_vertical');
                setReadOnly(node);
                break;
            case CONTAINER_ANDROID.SELECT:
            case CONTAINER_ANDROID.CHECKBOX:
            case CONTAINER_ANDROID.RADIO:
                setReadOnly(node);
                break;
            case CONTAINER_ANDROID.EDIT:
                if (!node.companion && node.hasProcedure(NODE_PROCEDURE.ACCESSIBILITY)) {
                    [node.previousSibling, node.nextSibling].some((sibling: T) => {
                        if (sibling?.visible && sibling.pageFlow) {
                            const id = node.elementId;
                            const labelElement = sibling.element as HTMLLabelElement;
                            const labelParent = sibling.documentParent.tagName === 'LABEL' && sibling.documentParent as T;
                            if (id !== '' && id === labelElement.htmlFor?.trim()) {
                                sibling.android('labelFor', node.documentId);
                                return true;
                            }
                            else if (labelParent && sibling.textElement) {
                                labelParent.android('labelFor', node.documentId);
                                return true;
                            }
                        }
                        return false;
                    });
                }
                if ((node.element as HTMLInputElement).list?.children.length) {
                    controlName = CONTAINER_ANDROID.EDIT_LIST;
                }
                else if (node.api >= BUILD_ANDROID.OREO) {
                    node.android('importantForAutofill', 'no');
                }
                setReadOnly(node);
            case CONTAINER_ANDROID.RANGE:
                if (!node.hasPX('width')) {
                    node.css('width', formatPX(node.bounds.width));
                }
                break;
            case CONTAINER_ANDROID.LINE:
                if (!node.hasHeight) {
                    node.setLayoutHeight(formatPX(node.contentBoxHeight || 1));
                }
                break;
        }
        node.setControlType(controlName, containerType);
        node.addAlign(layout.alignmentType);
        node.render(parent);
        return {
            type: NODE_TEMPLATE.XML,
            node,
            parent,
            controlName
        };
    }

    public renderNodeStatic(attrs: RenderNodeStaticAttribute, options?: ViewAttribute) {
        let controlName = attrs.controlName;
        if (!controlName) {
            if (attrs.controlType) {
                controlName = View.getControlName(attrs.controlType, this.userSettings.targetAPI);
            }
            else {
                return '';
            }
        }
        const node = new View();
        this.afterInsertNode(node as T);
        node.setControlType(controlName);
        node.setLayoutWidth(attrs.width || 'wrap_content');
        node.setLayoutHeight(attrs.height || 'wrap_content');
        if (options) {
            node.apply(options);
            options.documentId = node.documentId;
        }
        return this.getEnclosingXmlTag(controlName, this.userSettings.showAttributes ? node.extractAttributes(1) : undefined, attrs.content);
    }

    public renderSpace(options: RenderSpaceAttribute) {
        const android = options.android;
        let { width, height } = options;
        if (width) {
            if (isPercent(width)) {
                android.layout_columnWeight = truncate(parseFloat(width) / 100, this.localSettings.precision.standardFloat);
                width = '0px';
            }
        }
        else {
            width = 'wrap_content';
        }
        if (height) {
            if (isPercent(height)) {
                android.layout_rowWeight = truncate(parseFloat(height) / 100, this.localSettings.precision.standardFloat);
                height = '0px';
            }
        }
        else {
            height = 'wrap_content';
        }
        if (options.column !== undefined) {
            android.layout_column = options.column.toString();
        }
        if (options.columnSpan) {
            android.layout_columnSpan = options.columnSpan.toString();
        }
        if (options.row !== undefined) {
            android.layout_row = options.row.toString();
        }
        if (options.rowSpan) {
            android.layout_rowSpan = options.rowSpan.toString();
        }
        const result: RenderSpaceAttribute = { android, app: options.app };
        const output = this.renderNodeStatic({ controlName: CONTAINER_ANDROID.SPACE, width, height }, result);
        options.documentId = result.documentId;
        return output;
    }

    public addGuideline(node: T, parent: T, options?: GuidelineOptions) {
        this.applyGuideline(node, parent, 'horizontal', options);
        this.applyGuideline(node, parent, 'vertical', options);
    }

    public addBarrier(nodes: T[], barrierDirection: string) {
        const unbound: T[] = [];
        let length = nodes.length;
        let i = 0;
        while (i < length) {
            const node = nodes[i++];
            const barrier = node.constraint.barrier;
            if (!barrier) {
                node.constraint.barrier = {};
            }
            else if (barrier[barrierDirection]) {
                continue;
            }
            unbound.push(node);
        }
        length = unbound.length;
        if (length > 0) {
            const options: ViewAttribute = {
                android: {},
                app: {
                    barrierDirection,
                    constraint_referenced_ids: unbound.map(item => getDocumentId(item.anchorTarget.documentId)).join(',')
                }
            };
            const { api, anchorTarget } = unbound[length - 1];
            const content = this.renderNodeStatic({ controlName: api < BUILD_ANDROID.Q ? CONTAINER_ANDROID.BARRIER : CONTAINER_ANDROID_X.BARRIER }, options);
            switch (barrierDirection) {
                case 'top':
                case 'left':
                    this.addBeforeOutsideTemplate(anchorTarget.id, content, false);
                    break;
                default:
                    this.addAfterOutsideTemplate(anchorTarget.id, content, false);
                    break;
            }
            const documentId = options.documentId;
            if (documentId) {
                i = 0;
                while (i < length) {
                    (unbound[i++].constraint.barrier as {})[barrierDirection] = documentId;
                }
                return documentId;
            }
        }
        return '';
    }

    public evaluateAnchors(nodes: T[]) {
        const horizontalAligned: T[] = [];
        const verticalAligned: T[] = [];
        const length = nodes.length;
        let i = 0;
        while (i < length) {
            const node = nodes[i++];
            if (node.constraint.horizontal) {
                horizontalAligned.push(node);
            }
            if (node.constraint.vertical) {
                verticalAligned.push(node);
            }
            if (node.alignParent('top') || node.alignSibling('top')) {
                let current = node;
                do {
                    const bottomTop = current.alignSibling('bottomTop');
                    if (bottomTop !== '') {
                        const next = nodes.find(item => item.documentId === bottomTop);
                        if (next?.alignSibling('topBottom') === current.documentId) {
                            if (next.alignParent('bottom')) {
                                break;
                            }
                            else {
                                current = next;
                            }
                        }
                        else {
                            break;
                        }
                    }
                    else {
                        if (current !== node && !current.alignParent('bottom')) {
                            if (current.blockHeight) {
                                current.anchor('bottom', 'parent');
                            }
                            else {
                                const documentId = current.constraint.barrier?.bottom || this.addBarrier([current], 'bottom');
                                if (documentId) {
                                    current.anchor('bottomTop', documentId);
                                }
                            }
                        }
                        break;
                    }
                }
                while (true);
            }
        }
        i = 0;
        while (i < length) {
            const node = nodes[i++];
            const constraint = node.constraint;
            const current = constraint.current;
            if (!constraint.horizontal) {
                for (const attr in current) {
                    const { documentId, horizontal } = current[attr];
                    if (horizontal && horizontalAligned.some(item => item.documentId === documentId)) {
                        constraint.horizontal = true;
                        horizontalAligned.push(node);
                        i = 0;
                        break;
                    }
                }
            }
            if (!constraint.vertical) {
                for (const attr in current) {
                    const { documentId, horizontal } = current[attr];
                    if (!horizontal && verticalAligned.some(item => item.documentId === documentId)) {
                        constraint.vertical = true;
                        verticalAligned.push(node);
                        i = 0;
                        break;
                    }
                }
            }
        }
    }

    public createNodeGroup(node: T, children: T[], parent?: T, options?: CreateNodeGroupUIOptions<T>) {
        const group = new ViewGroup(this.application.nextId, node, children) as T;
        this.afterInsertNode(group);
        if (parent) {
            parent.replaceTry({ child: node, replaceWith: group, notFoundAppend: true });
        }
        else {
            group.containerIndex = node.containerIndex;
        }
        this.application.getProcessingCache(node.sessionId).add(group, options?.delegate === true, options?.cascade === true);
        return group;
    }

    public createNodeWrapper(node: T, parent: T, options: CreateNodeWrapperUIOptions<T> = {}) {
        const { children, containerType, alignmentType } = options;
        const container = this.application.createNode(node.sessionId, {
            parent,
            children,
            append: true,
            innerWrap: node,
            delegate: true,
            cascade: options.cascade === true || !!children && children.length > 0 && !node.rootElement
        });
        container.inherit(node, 'base', 'alignment');
        if (node.documentRoot) {
            container.documentRoot = true;
            node.documentRoot = false;
        }
        container.actualParent = parent.naturalElement ? parent : node.actualParent;
        if (containerType) {
            container.setControlType(View.getControlName(containerType, node.api), containerType);
        }
        if (alignmentType) {
            container.addAlign(alignmentType);
        }
        container.addAlign(NODE_ALIGNMENT.WRAPPER);
        container.exclude({
            resource: options.resource ?? NODE_RESOURCE.BOX_STYLE | NODE_RESOURCE.ASSET,
            procedure: options.procedure ?? NODE_PROCEDURE.CUSTOMIZATION,
            section: options.section ?? APP_SECTION.ALL
        });
        container.saveAsInitial();
        container.cssApply({
            marginTop: '0px',
            marginRight: '0px',
            marginBottom: '0px',
            marginLeft: '0px',
            paddingTop: '0px',
            paddingRight: '0px',
            paddingBottom: '0px',
            paddingLeft: '0px',
            borderTopStyle: 'none',
            borderRightStyle: 'none',
            borderBottomStyle: 'none',
            borderLeftStyle: 'none',
            borderRadius: '0px'
        });
        if (options.inheritContentBox !== false) {
            container.setCacheValue('contentBoxWidth', node.contentBoxWidth);
            container.setCacheValue('contentBoxHeight', node.contentBoxHeight);
        }
        if (options.resetMargin) {
            node.resetBox(BOX_STANDARD.MARGIN, container);
        }
        if (options.inheritDataset && node.naturalElement) {
            Object.assign(container.dataset, node.dataset);
        }
        if (node.documentParent.layoutElement) {
            const android = node.namespace('android');
            for (const attr in android) {
                if (attr.startsWith('layout_')) {
                    container.android(attr, android[attr]);
                    delete android[attr];
                }
            }
        }
        if ((node.renderParent || parent).layoutGrid && node.android('layout_width') === '0px') {
            const columnWeight = node.android('layout_columnWeight');
            if (parseFloat(columnWeight) > 0) {
                node.delete('android', 'layout_columnWeight');
                node.setLayoutWidth('match_parent');
                container.android('layout_columnWeight', columnWeight);
                container.setLayoutWidth('0px');
            }
        }
        if (node.renderParent && node.removeTry({ alignSiblings: true })) {
            node.rendered = false;
        }
        return container;
    }

    protected processRelativeHorizontal(node: T, children: T[]) {
        const rowsLeft: T[][] = [];
        let rowsRight: Undef<T[][]>,
            autoPosition = false,
            alignmentMultiLine = false;
        if (node.hasAlign(NODE_ALIGNMENT.VERTICAL)) {
            let previous: Undef<T>;
            const length = children.length;
            let i = 0;
            while (i < length) {
                const item = children[i++];
                if (previous) {
                    item.anchor('topBottom', previous.documentId);
                }
                else {
                    item.anchor('top', 'true');
                }
                if (item.pageFlow) {
                    rowsLeft.push([item]);
                    previous = item;
                }
                else {
                    autoPosition = true;
                }
            }
        }
        else {
            const boxParent = node.nodeGroup ? node.documentParent : node;
            const clearMap = this.application.clearMap;
            const lineWrap = node.css('whiteSpace') !== 'nowrap';
            let boxWidth = boxParent.actualBoxWidth(getBoxWidth.call(this, node, children)),
                textIndent = 0;
            if (node.naturalElement) {
                if (node.blockDimension) {
                    textIndent = node.parseUnit(node.css('textIndent'));
                }
                if (node.floating) {
                    const nextSibling = node.nextSibling;
                    if (nextSibling?.floating && nextSibling.float !== node.float && nextSibling.hasWidth) {
                        boxWidth = Math.max(boxWidth, node.actualParent!.box.width - nextSibling.linear.width);
                        if (!node.visibleStyle.background && !node.hasPX('maxWidth') && boxWidth > node.width) {
                            node.css('width', formatPX(boxWidth), true);
                        }
                    }
                }
            }
            const relativeData: RelativeLayoutData = {
                clearMap,
                textIndent,
                boxWidth,
                rowLength: 0
            };
            const partition = segmentRightAligned(children);
            for (let j = 0; j < 2; ++j) {
                const seg = partition[j];
                const length = seg.length;
                if (length === 0) {
                    continue;
                }
                const leftAlign = j === 1;
                let leftForward = true,
                    rowWidth = 0,
                    textIndentSpacing = false,
                    previousRowLeft: Undef<T>,
                    alignParent: string,
                    rows: T[][],
                    previous!: T,
                    items!: T[];
                if (leftAlign) {
                    if ((!node.naturalElement && seg[0].actualParent || node).cssAny('textAlign', { initial: true, values: ['right', 'end'] })) {
                        alignParent = 'right';
                        leftForward = false;
                        seg[length - 1].anchor(alignParent, 'true');
                    }
                    else {
                        alignParent = 'left';
                    }
                    if (seg.some(item => item.floating)) {
                        sortHorizontalFloat(seg);
                    }
                    rows = rowsLeft;
                }
                else {
                    alignParent = 'right';
                    relativeData.rowLength = 0;
                    rowsRight = [];
                    rows = rowsRight;
                }
                for (let i = 0; i < length; ++i) {
                    const item = seg[i];
                    let alignSibling: string;
                    if (leftAlign && leftForward) {
                        alignSibling = 'leftRight';
                        if (i === 0 && item.inline && Math.abs(textIndent) >= item.actualWidth && item.float !== 'right' && !item.positionRelative) {
                            textIndentSpacing = true;
                            if (!item.floating) {
                                item.setCacheValue('float', 'left');
                                item.setCacheValue('floating', true);
                            }
                        }
                    }
                    else {
                        alignSibling = 'rightLeft';
                    }
                    if (!item.pageFlow) {
                        if (previous) {
                            const documentId = previous.documentId;
                            item.anchor(alignSibling, documentId);
                            item.anchor('top', documentId);
                        }
                        else {
                            item.anchor(alignParent, 'true');
                            item.anchor('top', 'true');
                        }
                        autoPosition = true;
                        continue;
                    }
                    let bounds = item.bounds,
                        multiline = item.multiline,
                        anchored = item.autoMargin.horizontal === true,
                        siblings: Undef<Element[]>;
                    if (item.styleText && !item.hasPX('width')) {
                        const textBounds = item.textBounds;
                        if (textBounds && (textBounds.numberOfLines as number > 1 || Math.ceil(textBounds.width) < item.box.width)) {
                            bounds = textBounds;
                        }
                    }
                    if (multiline && Math.floor(bounds.width) <= boxWidth && !item.hasPX('width') && !isMultiline(item)) {
                        multiline = false;
                        item.multiline = false;
                    }
                    if (anchored) {
                        if (item.autoMargin.leftRight) {
                            item.anchorParent('horizontal');
                        }
                        else {
                            item.anchor(item.autoMargin.left ? 'right' : 'left', 'true');
                        }
                    }
                    if (previous) {
                        siblings = item.inlineVertical && previous.inlineVertical && item.previousSibling !== previous ? getElementsBetweenSiblings(previous.element, item.element!) : undefined;
                        let textNewRow = false,
                            retainMultiline = false;
                        if (item.textElement) {
                            let checkWidth = true;
                            if (previous.textElement) {
                                if (i === 1 && item.plainText && item.previousSibling === previous && !/^\s+/.test(item.textContent) && !/\s+$/.test(previous.textContent)) {
                                    retainMultiline = true;
                                    checkWidth = false;
                                }
                                else if (lineWrap && previous.multiline && (previous.bounds.width >= boxWidth || item.plainText && Resource.hasLineBreak(previous, false, true))) {
                                    textNewRow = true;
                                    checkWidth = false;
                                }
                            }
                            if (checkWidth && lineWrap && !relativeFloatWrap(item, previous, multiline, rowWidth, relativeData)) {
                                if (relativeWrapWidth(item, bounds, multiline, previousRowLeft, rowWidth, relativeData)) {
                                    textNewRow = true;
                                }
                                else if (item.actualParent!.tagName !== 'CODE') {
                                    textNewRow = multiline && item.plainText || isMultiline(item);
                                }
                            }
                        }
                        if (previous.floating && adjustFloatingNegativeMargin(item, previous)) {
                            alignSibling = '';
                        }
                        if (textNewRow ||
                            item.nodeGroup && !item.hasAlign(NODE_ALIGNMENT.SEGMENTED) ||
                            Math.ceil(item.bounds.top) >= previous.bounds.bottom && (item.blockStatic || item.floating && previous.float === item.float) ||
                            !item.textElement && relativeWrapWidth(item, bounds, multiline, previousRowLeft, rowWidth, relativeData) && !relativeFloatWrap(item, previous, multiline, rowWidth, relativeData) ||
                            !item.floating && (previous.blockStatic || item.siblingsLeading.some(sibling => sibling.excluded && sibling.blockStatic) || siblings?.some(element => causesLineBreak(element))) ||
                            previous.autoMargin.horizontal ||
                            clearMap.has(item) ||
                            Resource.checkPreIndent(previous))
                        {
                            if (clearMap.has(item) && !previousRowLeft) {
                                item.setBox(BOX_STANDARD.MARGIN_TOP, { reset: 1 });
                            }
                            if (leftForward) {
                                if (previousRowLeft && (item.bounds.bottom <= previousRowLeft.bounds.bottom || textIndentSpacing)) {
                                    if (!anchored) {
                                        item.anchor(alignSibling, previousRowLeft.documentId);
                                    }
                                }
                                else {
                                    if (!anchored) {
                                        item.anchor(alignParent, 'true');
                                    }
                                    previousRowLeft = undefined;
                                }
                                anchored = true;
                            }
                            else {
                                if (previousRowLeft && item.linear.bottom > previousRowLeft.bounds.bottom) {
                                    previousRowLeft = undefined;
                                }
                                previous.anchor(alignParent, 'true');
                            }
                            rowWidth = Math.min(0, textNewRow && !previous.multiline && multiline && !clearMap.has(item) ? item.linear.right - node.box.right : 0);
                            items = [item];
                            rows.push(items);
                            relativeData.items = items;
                            ++relativeData.rowLength;
                        }
                        else {
                            if (alignSibling !== '') {
                                if (leftForward) {
                                    if (!anchored) {
                                        item.anchor(alignSibling, previous.documentId);
                                        anchored = true;
                                    }
                                }
                                else {
                                    previous.anchor(alignSibling, item.documentId);
                                }
                            }
                            if (multiline && !item.hasPX('width') && !previous.floating && !retainMultiline) {
                                item.multiline = false;
                            }
                            items.push(item);
                        }
                    }
                    else {
                        if (leftForward) {
                            if (!anchored) {
                                item.anchor(alignParent, 'true');
                            }
                        }
                        items = [item];
                        rows.push(items);
                        relativeData.items = items;
                        ++relativeData.rowLength;
                    }
                    if (item.float === 'left' && leftAlign) {
                        if (previousRowLeft) {
                            if (item.linear.bottom > previousRowLeft.linear.bottom) {
                                previousRowLeft = item;
                            }
                        }
                        else {
                            previousRowLeft = item;
                        }
                    }
                    if (siblings?.some(element => !!getElementAsNode(element, item.sessionId) || causesLineBreak(element)) === false) {
                        const betweenStart = getRangeClientRect(siblings[0]);
                        if (!betweenStart.numberOfLines) {
                            const betweenEnd = siblings.length > 1 && getRangeClientRect(siblings.pop()!);
                            if (!betweenEnd || !betweenEnd.numberOfLines) {
                                rowWidth += betweenEnd ? betweenStart.left - betweenEnd.right : betweenStart.width;
                            }
                        }
                    }
                    rowWidth += item.marginLeft + bounds.width + item.marginRight;
                    previous = item;
                }
            }
            if (textIndent < 0 && rowsLeft.length === 1) {
                node.setCacheValue('paddingLeft', Math.max(0, node.paddingLeft + textIndent));
            }
        }
        if (rowsLeft.length > 1 || rowsRight && rowsRight.length > 1) {
            alignmentMultiLine = true;
        }
        const applyLayout = (rows: T[][]) => {
            let previousBaseline: Null<T> = null;
            const length = rows.length;
            const singleRow = length === 1 && !node.hasHeight;
            for (let i = 0, j = 0; i < length; ++i) {
                const items = rows[i];
                let baseline: Null<T>;
                const q = items.length;
                if (q > 1) {
                    const bottomAligned = getTextBottom(items);
                    baseline = NodeUI.baseline(bottomAligned.length > 0 ? items.filter(item => !bottomAligned.includes(item)) : items);
                    let textBottom = bottomAligned[0] as Undef<T>,
                        maxCenterHeight = 0,
                        textBaseline: Null<T> = null;
                    if (baseline && textBottom) {
                        if (baseline !== textBottom && baseline.bounds.height < textBottom.bounds.height) {
                            baseline.anchor('bottom', textBottom.documentId);
                        }
                        else {
                            baseline = NodeUI.baseline(items);
                            textBottom = undefined;
                        }
                    }
                    const baselineAlign: T[] = [];
                    const documentId = i === 0 ? 'true' : baseline?.documentId;
                    j = 0;
                    while (j < q) {
                        const item = items[j++];
                        if (item === baseline || item === textBottom) {
                            continue;
                        }
                        const verticalAlign = item.inlineVertical ? item.css('verticalAlign') : '';
                        if (item.controlElement) {
                            let adjustment = item.bounds.top;
                            if (previousBaseline) {
                                adjustment -= previousBaseline.linear.bottom;
                            }
                            else {
                                item.anchor('top', 'true');
                                adjustment -= node.box.top;
                            }
                            item.setBox(BOX_STANDARD.MARGIN_TOP, { reset: 1, adjustment });
                            item.baselineAltered = true;
                            continue;
                        }
                        let alignTop = false;
                        if (item.baseline) {
                            if (item.renderChildren.length > 0 && (isLength(item.verticalAlign) || !item.baselineElement)) {
                                alignTop = true;
                            }
                            else {
                                baselineAlign.push(item);
                            }
                        }
                        else {
                            switch (verticalAlign) {
                                case 'text-top':
                                    if (!textBaseline) {
                                        textBaseline = NodeUI.baseline(items, true);
                                    }
                                    if (textBaseline && item !== textBaseline) {
                                        item.anchor('top', textBaseline.documentId);
                                    }
                                    break;
                                case 'super':
                                    if (!item.baselineAltered) {
                                        item.modifyBox(BOX_STANDARD.MARGIN_TOP, Math.floor(item.baselineHeight * this.localSettings.deviations.superscriptTopOffset) * -1);
                                    }
                                case 'top':
                                    if (documentId && documentId !== item.documentId) {
                                        item.anchor('top', documentId);
                                    }
                                    else if (baseline) {
                                        item.anchor('top', baseline.documentId);
                                    }
                                    break;
                                case 'middle': {
                                    const height = Math.max(item.actualHeight, item.lineHeight);
                                    if (!alignmentMultiLine) {
                                        item.anchor('centerVertical', 'true');
                                        if (item.imageElement) {
                                            maxCenterHeight = Math.max(height, maxCenterHeight);
                                        }
                                    }
                                    else if (baseline) {
                                        const heightParent = Math.max(baseline.actualHeight, baseline.lineHeight);
                                        if (height < heightParent) {
                                            item.anchor('top', baseline.documentId);
                                            item.setBox(BOX_STANDARD.MARGIN_TOP, { reset: 1, adjustment: Math.round((heightParent - height) / 2) });
                                            item.baselineAltered = true;
                                        }
                                        else if (height > maxCenterHeight) {
                                            maxCenterHeight = height;
                                        }
                                    }
                                    break;
                                }
                                case 'text-bottom':
                                    if (!textBaseline) {
                                        textBaseline = NodeUI.baseline(items, true);
                                    }
                                    if (textBaseline && textBaseline !== item) {
                                        item.anchor('bottom', textBaseline.documentId);
                                    }
                                    else if (baseline) {
                                        item.anchor('bottom', baseline.documentId);
                                    }
                                    break;
                                case 'sub':
                                    if (!item.baselineAltered) {
                                        item.modifyBox(BOX_STANDARD.MARGIN_TOP, Math.ceil(item.baselineHeight * this.localSettings.deviations.subscriptBottomOffset) * 1);
                                    }
                                case 'bottom':
                                    if (documentId && !withinRange(node.bounds.height, item.bounds.height)) {
                                        if (documentId === 'true' && !node.hasHeight) {
                                            item.anchor('top', documentId);
                                            item.setBox(BOX_STANDARD.MARGIN_TOP, { reset: 1, adjustment: item.bounds.top - node.box.top });
                                            item.baselineAltered = true;
                                        }
                                        else {
                                            item.anchor('bottom', documentId);
                                        }
                                    }
                                    break;
                                default:
                                    alignTop = !item.baselineAltered;
                                    break;
                            }
                        }
                        if (i === 0 && alignTop) {
                            item.anchor('top', 'true');
                        }
                    }
                    const r = baselineAlign.length;
                    if (baseline) {
                        baseline.baselineActive = true;
                        if (r > 0) {
                            adjustBaseline(baseline, baselineAlign, singleRow, node.box.top);
                            if (singleRow && baseline.is(CONTAINER_NODE.BUTTON)) {
                                baseline.anchor('centerVertical', 'true');
                                baseline = null;
                            }
                        }
                        else if (baseline.textElement) {
                            if (maxCenterHeight > Math.max(baseline.actualHeight, baseline.lineHeight)) {
                                baseline.anchor('centerVertical', 'true');
                                baseline = null;
                            }
                            else if (baseline.multiline) {
                                const { left, height } = baseline.bounds;
                                let k = 0;
                                while (k < q) {
                                    const item = items[k++];
                                    if (item === baseline) {
                                        break;
                                    }
                                    else if (left < item.bounds.right && height < item.bounds.height) {
                                        baseline.anchor('bottom', item.documentId);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    else if (r > 0 && r < q) {
                        textBottom = getTextBottom(items)[0];
                        if (textBottom) {
                            let k = 0;
                            while (k < r) {
                                const item = baselineAlign[k++];
                                if (item.baseline && !item.multiline && textBottom.bounds.height > item.bounds.height) {
                                    item.anchor('bottom', textBottom.documentId);
                                }
                            }
                        }
                    }
                    let last = true;
                    j = q - 1;
                    while (j >= 0) {
                        const previous = items[j--];
                        if (previous.textElement) {
                            previous.setSingleLine(last && !previous.rightAligned && !previous.centerAligned);
                        }
                        last = false;
                    }
                    if (node.cssInitial('textAlign') === 'center' && length > 1) {
                        const application = this.application;
                        const group = this.createNodeGroup(items[0], items, node);
                        group.setControlType(CONTAINER_ANDROID.RELATIVE, CONTAINER_NODE.RELATIVE);
                        group.render(node);
                        group.anchorParent('horizontal');
                        group.setLayoutWidth('wrap_content');
                        group.setLayoutHeight('wrap_content');
                        let renderIndex = -1;
                        j = 0;
                        while (j < q) {
                            const item = items[j++];
                            const index = children.indexOf(item);
                            if (index !== -1) {
                                if (renderIndex === -1) {
                                    renderIndex = index;
                                }
                                else {
                                    renderIndex = Math.min(index, renderIndex);
                                }
                            }
                            item.removeTry();
                            item.render(group);
                            application.addLayoutTemplate(
                                group,
                                item,
                                {
                                    type: NODE_TEMPLATE.XML,
                                    node: item,
                                    controlName: item.controlName
                                } as NodeXmlTemplate<T>
                            );
                        }
                        application.addLayoutTemplate(
                            node,
                            group,
                            {
                                type: NODE_TEMPLATE.XML,
                                node: group,
                                controlName: group.controlName
                            } as NodeXmlTemplate<T>,
                            renderIndex
                        );
                        if (previousBaseline) {
                            group.anchor('topBottom', previousBaseline.documentId);
                        }
                        else {
                            previousBaseline = group;
                        }
                        continue;
                    }
                }
                else {
                    baseline = items[0];
                    if (baseline.centerAligned) {
                        baseline.anchorParent('horizontal');
                        baseline.anchorDelete('left', 'right');
                    }
                }
                let requireBottom = false;
                if (!baseline) {
                    baseline = items[0];
                    requireBottom = true;
                }
                j = 0;
                while (j < q) {
                    const item = items[j++];
                    if (previousBaseline && !item.alignSibling('baseline')) {
                        item.anchor('topBottom', previousBaseline.documentId);
                    }
                    if (requireBottom && item.linear.bottom >= baseline.linear.bottom) {
                        baseline = item;
                    }
                }
                previousBaseline = baseline;
            }
        };
        applyLayout(rowsLeft);
        if (rowsRight) {
            applyLayout(rowsRight);
        }
        node.horizontalRows = rowsRight ? rowsLeft.concat(rowsRight) : rowsLeft;
        if (autoPosition) {
            node.renderChildren.sort((a, b) => {
                if (!a.pageFlow && b.pageFlow) {
                    return 1;
                }
                else if (!b.pageFlow && a.pageFlow) {
                    return -1;
                }
                return 0;
            });
            node.renderTemplates!.sort((a, b) => {
                const pageFlowA = a.node.pageFlow;
                const pageFlowB = b.node.pageFlow;
                if (!pageFlowA && pageFlowB) {
                    return 1;
                }
                else if (!pageFlowB && pageFlowA) {
                    return -1;
                }
                return 0;
            });
        }
    }

    protected processConstraintHorizontal(node: T, children: T[]) {
        const reverse = node.hasAlign(NODE_ALIGNMENT.RIGHT);
        const [anchorStart, anchorEnd, chainStart, chainEnd] = getAnchorDirection(reverse);
        let valid = true,
            bias = 0,
            baselineCount = 0,
            textBaseline: UndefNull<T>,
            textBottom: UndefNull<T>,
            tallest: Undef<T>,
            bottom: Undef<T>,
            previous: Undef<T>;
        if (!reverse) {
            switch (node.cssAscend('textAlign', { startSelf: true })) {
                case 'center':
                    bias = 0.5;
                    break;
                case 'right':
                case 'end':
                    bias = 1;
                    break;
            }
        }
        if (children.some(item => item.floating)) {
            if (!reverse) {
                switch (bias) {
                    case 0.5: {
                        let floating: T[];
                        [floating, children] = partitionArray(children, item => item.floating || item.autoMargin.horizontal === true);
                        if (floating.length > 0) {
                            this.processConstraintChain(node, floating);
                        }
                        break;
                    }
                    case 1: {
                        let leftAligned: T[];
                        [leftAligned, children] = segmentLeftAligned(children);
                        if (leftAligned.length > 0) {
                            this.processConstraintChain(node, leftAligned);
                        }
                        break;
                    }
                    default: {
                        let rightAligned: T[];
                        [rightAligned, children] = segmentRightAligned(children);
                        if (rightAligned.length > 0) {
                            this.processConstraintChain(node, rightAligned);
                        }
                        break;
                    }
                }
            }
            sortHorizontalFloat(children);
        }
        if (!node.hasPX('width') && children.some(item => item.percentWidth > 0)) {
            node.setLayoutWidth('match_parent');
        }
        const baseline = NodeUI.baseline(children);
        const documentId = baseline?.documentId;
        let percentWidth = View.availablePercent(children, 'width', node.box.width);
        const length = children.length;
        for (let i = 0; i < length; ++i) {
            const item = children[i];
            if (previous) {
                if (item.pageFlow) {
                    previous.anchor(chainEnd, item.documentId);
                    item.anchor(chainStart, previous.documentId);
                    if (i === length - 1) {
                        item.anchor(anchorEnd, 'parent');
                    }
                }
                else if (item.autoPosition) {
                    item.anchor(chainStart, previous.documentId);
                }
            }
            else if (length === 1) {
                bias = item.centerAligned
                    ? 0.5
                    : item.rightAligned
                        ? 1
                        : 0;
                if (item.blockStatic || bias === 0.5) {
                    item.anchorParent('horizontal', bias);
                }
                else {
                    item.anchor(anchorStart, 'parent');
                    item.anchorStyle('horizontal', 0);
                }
            }
            else {
                item.anchor(anchorStart, 'parent');
                item.anchorStyle('horizontal', bias, NodeUI.justified(item.innerMostWrapped) ? 'spread_inside' : 'packed');
            }
            if (item.pageFlow) {
                if (item !== baseline) {
                    if (item.controlElement) {
                        valid = constraintAlignTop(node, item);
                    }
                    else if (item.inlineVertical) {
                        if (!tallest || getMaxHeight(item) > getMaxHeight(tallest)) {
                            tallest = item;
                        }
                        switch (item.css('verticalAlign')) {
                            case 'text-top':
                                if (textBaseline === undefined) {
                                    textBaseline = NodeUI.baseline(children, true);
                                }
                                if (textBaseline && item !== textBaseline) {
                                    item.anchor('top', textBaseline.documentId);
                                }
                                else {
                                    valid = constraintAlignTop(node, item);
                                }
                                break;
                            case 'middle':
                                if (textBottom === undefined) {
                                    textBottom = getTextBottom(children)[0] || null;
                                }
                                if (textBottom || baseline?.textElement === false) {
                                    valid = constraintAlignTop(node, item);
                                }
                                else {
                                    item.anchorParent('vertical', 0.5);
                                }
                                break;
                            case 'text-bottom':
                                if (textBaseline === undefined) {
                                    textBaseline = NodeUI.baseline(children, true);
                                }
                                if (textBaseline && item !== textBaseline) {
                                    if (textBottom === undefined) {
                                        textBottom = getTextBottom(children)[0] || null;
                                    }
                                    if (item !== textBottom) {
                                        item.anchor('bottom', textBaseline.documentId);
                                    }
                                    else if (textBottom) {
                                        valid = constraintAlignTop(node, item);
                                    }
                                    break;
                                }
                            case 'bottom':
                                if (!bottom) {
                                    let j = 0;
                                    while (j < length) {
                                        const child = children[j++];
                                        if (!child.baseline && (!bottom || child.linear.bottom > bottom.linear.bottom)) {
                                            bottom = child;
                                        }
                                    }
                                }
                                if (item === bottom) {
                                    valid = constraintAlignTop(node, item);
                                }
                                else {
                                    item.anchor('bottom', 'parent');
                                }
                                break;
                            case 'baseline':
                                if (!baseline || item.blockVertical || !item.textElement && getMaxHeight(item) > getMaxHeight(baseline)) {
                                    valid = constraintAlignTop(node, item);
                                }
                                else {
                                    item.anchor('baseline', documentId || 'parent');
                                    ++baselineCount;
                                }
                                break;
                            default:
                                valid = constraintAlignTop(node, item);
                                break;
                        }
                    }
                    else if (item.plainText) {
                        item.anchor('baseline', documentId || 'parent');
                        ++baselineCount;
                    }
                    else {
                        valid = constraintAlignTop(node, item);
                    }
                    item.anchored = true;
                }
                percentWidth = View.setConstraintDimension(item, percentWidth);
                previous = item;
            }
            else if (item.autoPosition) {
                if (documentId) {
                    item.anchor('top', documentId);
                }
                else {
                    item.anchorParent('vertical', 0);
                    item.anchored = true;
                    valid = false;
                }
            }
        }
        if (baseline) {
            if (tallest && baseline.textElement && getMaxHeight(tallest) > getMaxHeight(baseline)) {
                switch (tallest.verticalAlign) {
                    case 'middle':
                        baseline.anchorParent('vertical', 0.5, '', true);
                        break;
                    case 'baseline':
                        baseline.anchor('baseline', tallest.documentId);
                        break;
                    case 'bottom':
                    case 'text-bottom':
                        baseline.anchor('bottom', tallest.documentId);
                        break;
                    default:
                        constraintAlignTop(node, baseline);
                        break;
                }
            }
            else if (valid && baseline.baselineElement && !baseline.imageOrSvgElement && node.ascend({ condition: (item: T) => item.layoutHorizontal, error: (item: T) => item.naturalChild && item.layoutVertical || item.layoutGrid, attr: 'renderParent' }).length > 0) {
                baseline.anchorParent('vertical');
                baseline.anchor('baseline', 'parent');
            }
            else {
                constraintAlignTop(node, baseline);
            }
            baseline.baselineActive = baselineCount > 0;
            baseline.anchored = true;
        }
    }

    protected processConstraintChain(node: T, children: T[]) {
        const clearMap = this.application.clearMap;
        const floating = node.hasAlign(NODE_ALIGNMENT.FLOAT);
        const parent = children[0].actualParent || node;
        const horizontal = NodeUI.partitionRows(children, clearMap);
        let previousSiblings: T[] = [],
            previousRow: Undef<T[]>,
            previousAlignParent = false;
        const length = horizontal.length;
        for (let i = 0; i < length; ++i) {
            const partition = horizontal[i];
            const [floatingRight, floatingLeft] = partitionArray(partition, item => item.float === 'right' || item.autoMargin.left === true);
            let alignParent = false,
                aboveRowEnd: Undef<T>,
                currentRowTop: Undef<T>,
                tallest: Undef<T>;
            const applyLayout = (seg: T[], reverse: boolean) => {
                const q = seg.length;
                if (q === 0) {
                    return;
                }
                const [anchorStart, anchorEnd, chainStart, chainEnd] = getAnchorDirection(reverse);
                const rowStart = seg[0];
                const rowEnd = seg[q - 1];
                if (q > 1) {
                    rowStart.anchor(anchorStart, 'parent');
                    if (reverse) {
                        rowEnd.anchorStyle('horizontal', 1, 'packed');
                    }
                    else {
                        rowStart.anchorStyle('horizontal', !floating && parent.css('textAlign') === 'center' ? 0.5 : 0, length === 1 && NodeUI.justified(rowStart.innerMostWrapped) ? 'spread_inside' : 'packed');
                    }
                    rowEnd.anchor(anchorEnd, 'parent');
                }
                else if (!rowStart.constraint.horizontal) {
                    setHorizontalAlignment(rowStart);
                }
                let percentWidth = View.availablePercent(partition, 'width', node.box.width);
                if (i === 1 || previousAlignParent) {
                    alignParent = (
                        !rowStart.floating && previousRow?.every(item => item.floating || !item.pageFlow) === true && (clearMap.size === 0 || !partition.some((item: T) => checkClearMap(item, clearMap))) ||
                        !rowStart.pageFlow && (!rowStart.autoPosition || q === 1) ||
                        previousRow?.every(item => !item.pageFlow) === true
                    );
                    previousAlignParent = alignParent;
                }
                tallest = undefined;
                for (let j = 0; j < q; ++j) {
                    const chain = seg[j];
                    if (i === 0 || alignParent) {
                        if (length === 1) {
                            chain.anchorParent('vertical');
                            setVerticalAlignment(chain, q === 1, true);
                        }
                        else {
                            chain.anchor('top', 'parent');
                            chain.anchorStyle('vertical', 0, 'packed');
                        }
                    }
                    else if (i === length - 1 && !currentRowTop) {
                        chain.anchor('bottom', 'parent');
                    }
                    if (chain.autoMargin.leftRight) {
                        chain.anchorParent('horizontal');
                    }
                    else if (q > 1) {
                        const previous = seg[j - 1];
                        const next = seg[j + 1];
                        if (previous) {
                            if (!previous.pageFlow && previous.autoPosition) {
                                let found: Undef<T>;
                                let k = j - 2;
                                while (k >= 0) {
                                    found = seg[k--];
                                    if (found.pageFlow) {
                                        break;
                                    }
                                    else {
                                        found = undefined;
                                    }
                                }
                                if (found) {
                                    chain.anchor(chainStart, found.documentId);
                                }
                                else if (!chain.constraint.horizontal) {
                                    chain.anchor(anchorStart, 'parent');
                                }
                            }
                            else {
                                chain.anchor(chainStart, previous.documentId);
                            }
                        }
                        if (next) {
                            chain.anchor(chainEnd, next.documentId);
                        }
                    }
                    percentWidth = View.setConstraintDimension(chain, percentWidth);
                    if (previousRow && j === 0) {
                        if (clearMap.has(chain) && !chain.floating) {
                            chain.modifyBox(BOX_STANDARD.MARGIN_TOP, -previousRow[previousRow.length - 1].bounds.height, false);
                        }
                        if (floating) {
                            let checkBottom = false;
                            let k = 0;
                            while (k < previousSiblings.length) {
                                if (chain.bounds.top < Math.floor(previousSiblings[k++].bounds.bottom)) {
                                    checkBottom = true;
                                    break;
                                }
                            }
                            if (checkBottom) {
                                aboveRowEnd = previousRow[previousRow.length - 1];
                                k = previousSiblings.length - 2;
                                while (k >= 0) {
                                    const aboveBefore = previousSiblings[k--];
                                    if (aboveBefore.linear.bottom > aboveRowEnd.linear.bottom) {
                                        if (reverse && Math.ceil(aboveBefore.linear[anchorEnd]) - Math.floor(parent.box[anchorEnd]) < chain.linear.width) {
                                            continue;
                                        }
                                        chain.anchorDelete(anchorStart);
                                        chain.anchor(chainStart, aboveBefore.documentId, true);
                                        if (reverse) {
                                            chain.modifyBox(BOX_STANDARD.MARGIN_RIGHT, aboveBefore.marginLeft);
                                        }
                                        else {
                                            chain.modifyBox(BOX_STANDARD.MARGIN_LEFT, aboveBefore.marginRight);
                                        }
                                        rowStart.delete('app', 'layout_constraintHorizontal_chainStyle', 'layout_constraintHorizontal_bias');
                                        rowStart.anchorDelete(chainEnd);
                                        rowEnd.anchorDelete(anchorEnd);
                                        if (!currentRowTop) {
                                            currentRowTop = chain;
                                        }
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    if (!tallest || chain.linear.height > tallest.linear.height) {
                        tallest = chain;
                    }
                }
            };
            applyLayout(floatingLeft, false);
            applyLayout(floatingRight, true);
            if (floating) {
                previousSiblings = previousSiblings.concat(floatingLeft, floatingRight);
            }
            if (!alignParent) {
                if (previousRow) {
                    const current = partition[0];
                    const q = previousRow.length;
                    const r = partition.length;
                    if (q === 1 && r === 1) {
                        const above = previousRow[0];
                        above.anchor('bottomTop', current.documentId);
                        current.anchor('topBottom', above.documentId);
                        current.app('layout_constraintVertical_bias', '0');
                    }
                    else  {
                        if (!aboveRowEnd || !currentRowTop) {
                            aboveRowEnd = previousRow[0];
                            let k = 1;
                            while (k < q) {
                                const item = previousRow[k++];
                                if (item.linear.bottom > aboveRowEnd.linear.bottom) {
                                    aboveRowEnd = item;
                                }
                            }
                        }
                        if (!currentRowTop) {
                            currentRowTop = partition[0];
                            let currentTop = currentRowTop.linear.top;
                            let k = 1;
                            while (k < r) {
                                const item = partition[k++];
                                const top = item.linear.top;
                                if (top < currentTop || top === currentTop && item.linear.height > currentRowTop.linear.height) {
                                    currentRowTop = item;
                                    currentTop = top;
                                }
                            }
                        }
                        const documentId = currentRowTop.documentId;
                        aboveRowEnd.anchor('bottomTop', documentId);
                        currentRowTop.anchor('topBottom', aboveRowEnd.documentId);
                        setVerticalAlignment(currentRowTop, q === 1, true);
                        const marginTop = currentRowTop.marginTop;
                        let j = 0;
                        while (j < r) {
                            const chain = partition[j++];
                            if (chain !== currentRowTop) {
                                setVerticalAlignment(chain, r === 1);
                                chain.anchor('top', documentId);
                                chain.modifyBox(BOX_STANDARD.MARGIN_TOP, marginTop * -1);
                            }
                        }
                    }
                }
                previousRow = partition;
            }
        }
        node.horizontalRows = horizontal;
        if (!node.hasWidth && children.some(item => item.percentWidth > 0)) {
            node.setLayoutWidth('match_parent', false);
        }
    }

    protected applyGuideline(node: T, parent: T, axis: string, options?: GuidelineOptions) {
        if (node.constraint[axis]) {
            return;
        }
        let orientation: Undef<string>,
            percent: Undef<boolean>,
            opposing: Undef<boolean>;
        if (options) {
            ({ orientation, percent, opposing } = options);
            if (orientation && axis !== orientation) {
                return;
            }
        }
        let documentParent = node.documentParent as T;
        if (parent.nodeGroup && !documentParent.hasAlign(NODE_ALIGNMENT.AUTO_LAYOUT)) {
            documentParent = parent;
        }
        const horizontal = axis === 'horizontal';
        let LT: string,
            RB: string;
        if (horizontal) {
            if (!opposing) {
                LT = 'left';
                RB = 'right';
            }
            else {
                LT = 'right';
                RB = 'left';
            }
        }
        else if (!opposing) {
            LT = 'top';
            RB = 'bottom';
        }
        else {
            LT = 'bottom';
            RB = 'top';
        }
        const linear = node.linear;
        const box = documentParent.box;
        if (!percent && !opposing) {
            if (withinRange(linear[LT], box[LT])) {
                node.anchor(LT, 'parent', true);
                return;
            }
            if (node.autoPosition) {
                const siblings = node.siblingsLeading;
                const length = siblings.length;
                if (length > 0 && !node.alignedVertically()) {
                    let i = length - 1;
                    while (i >= 0) {
                        const previous = siblings[i--] as T;
                        if (previous.pageFlow) {
                            if (previous.renderParent === node.renderParent) {
                                node.anchor(horizontal ? 'leftRight' : 'top', previous.documentId, true);
                                node.constraint[axis] = true;
                                return;
                            }
                            break;
                        }
                    }
                }
            }
            if (!node.pageFlow && node.css('position') !== 'fixed' && !parent.hasAlign(NODE_ALIGNMENT.AUTO_LAYOUT)) {
                const canAlignPosition = (item: T) => {
                    if (!item.pageFlow) {
                        if (horizontal) {
                            if (item.has('right') && !item.has('left')) {
                                return !node.has('left') && !node.has('right');
                            }
                        }
                        else if (item.has('bottom') && !item.has('top')) {
                            return !node.has('top') && !node.has('bottom');
                        }
                    }
                    return true;
                };
                const bounds = node.innerMostWrapped.bounds;
                const renderChildren = parent.renderChildren;
                const length = renderChildren.length;
                let i = 0;
                while (i < length) {
                    const item = renderChildren[i++] as T;
                    if (item === node || item.plainText || item.pseudoElement || item.rootElement || !canAlignPosition(item)) {
                        continue;
                    }
                    const itemA = item.innerMostWrapped as T;
                    if (itemA.pageFlow || item.constraint[axis]) {
                        const { linear: linearA, bounds: boundsA } = itemA;
                        let offset = NaN,
                            position: Undef<string>;
                        if (withinRange(bounds[LT], boundsA[LT])) {
                            position = LT;
                        }
                        else if (withinRange(linear[LT], linearA[LT])) {
                            position = LT;
                            offset = (horizontal ? bounds.left - boundsA.left : bounds.top - boundsA.top) + adjustBodyMargin(node, LT);
                        }
                        else if (withinRange(linear[LT], linearA[RB])) {
                            if (horizontal) {
                                if (!node.hasPX('left') && !node.hasPX('right') || !item.inlineStatic && item.hasPX('width', { percent: false, initial: true })) {
                                    position = 'leftRight';
                                    offset = bounds.left - boundsA.right;
                                }
                            }
                            else if (!node.hasPX('top') && !node.hasPX('bottom') || !item.inlineStatic && item.hasPX('height', { percent: false, initial: true })) {
                                position = 'topBottom';
                                offset = bounds.top - boundsA.bottom;
                            }
                        }
                        if (position) {
                            if (horizontal) {
                                if (!isNaN(offset)) {
                                    node.setBox(BOX_STANDARD.MARGIN_LEFT, { reset: 1, adjustment: 0 });
                                    if (offset !== 0) {
                                        node.translateX(offset);
                                    }
                                }
                            }
                            else if (!isNaN(offset)) {
                                node.setBox(BOX_STANDARD.MARGIN_TOP, { reset: 1, adjustment: 0 });
                                if (offset !== 0) {
                                    node.translateY(offset);
                                }
                            }
                            node.anchor(position, item.documentId, true);
                            node.constraint[axis] = true;
                            return;
                        }
                    }
                }
                const TL = horizontal ? 'top' : 'left';
                let nearest: Undef<T>,
                    adjacent: Undef<T>;
                i = 0;
                while (i < length) {
                    const item = renderChildren[i++] as T;
                    if (item === node || item.pageFlow || item.rootElement || !item.constraint[axis] || !canAlignPosition(item)) {
                        continue;
                    }
                    const itemA = item.innerMostWrapped as T;
                    const boundsA = itemA.bounds;
                    if (withinRange(bounds[TL], boundsA[TL]) || withinRange(linear[TL], itemA.linear[TL])) {
                        const offset = bounds[LT] - boundsA[RB];
                        if (offset >= 0) {
                            setAnchorOffset(node, horizontal, axis, item.documentId, horizontal ? 'leftRight' : 'topBottom', offset);
                            return;
                        }
                    }
                    else if (boundsA[LT] <= bounds[LT]) {
                        if (boundsA[TL] <= bounds[TL]) {
                            nearest = itemA;
                        }
                        else {
                            adjacent = itemA;
                        }
                    }
                }
                if (!nearest) {
                    nearest = adjacent;
                }
                if (nearest) {
                    const offset = bounds[LT] - nearest.bounds[LT] + adjustBodyMargin(node, LT);
                    if (offset >= 0) {
                        setAnchorOffset(node, horizontal, axis, nearest.documentId, LT, offset);
                        return;
                    }
                }
            }
        }
        const absoluteParent = node.absoluteParent as T;
        const bounds = node.positionStatic ? node.bounds : linear;
        let attr = 'layout_constraintGuide_',
            location = 0;
        if (!node.leftTopAxis && documentParent.rootElement) {
            const renderParent = node.renderParent;
            if (documentParent.ascend({ condition: item => item === renderParent, attr: 'renderParent' }).length > 0) {
                location = horizontal
                    ? !opposing
                        ? documentParent.marginLeft
                        : documentParent.marginRight
                    : !opposing
                        ? documentParent.marginTop
                        : documentParent.marginBottom;
            }
        }
        if (percent) {
            const position = Math.abs(bounds[LT] - box[LT]) / (horizontal ? box.width : box.height);
            attr += 'percent';
            location += parseFloat(truncate(!opposing ? position : 1 - position, node.localSettings.floatPrecision));
        }
        else {
            attr += 'begin';
            location += bounds[LT] - box[!opposing ? LT : RB];
        }
        if (!node.pageFlow) {
            if (documentParent.outerWrapper && node.parent === documentParent.outerMostWrapper) {
                location += documentParent[horizontal
                    ? !opposing
                        ? 'paddingLeft'
                        : 'paddingRight'
                    : !opposing
                        ? 'paddingTop'
                        : 'paddingBottom'
                ];
            }
            else if (absoluteParent === node.documentParent) {
                const direction = horizontal
                    ? !opposing
                        ? BOX_STANDARD.PADDING_LEFT
                        : BOX_STANDARD.PADDING_RIGHT
                    : !opposing
                        ? BOX_STANDARD.PADDING_TOP
                        : BOX_STANDARD.PADDING_BOTTOM;
                location = adjustAbsolutePaddingOffset(documentParent, direction, location);
            }
        }
        else if (node.inlineVertical) {
            const offset = convertFloat(node.verticalAlign);
            if (offset < 0) {
                location += offset;
            }
        }
        if (!horizontal && node.marginTop < 0) {
            location -= node.marginTop;
            node.setBox(BOX_STANDARD.MARGIN_TOP, { reset: 1 });
        }
        node.constraint[axis] = true;
        if (location <= 0) {
            node.anchor(LT, 'parent', true);
        }
        else if (horizontal && location + bounds.width >= box.right && documentParent.hasPX('width') && !node.hasPX('right') || !horizontal && location + bounds.height >= box.bottom && documentParent.hasPX('height') && !node.hasPX('bottom')) {
            node.anchor(RB, 'parent', true);
        }
        else {
            const guideline = parent.constraint.guideline || {};
            const anchors = guideline[axis]?.[attr]?.[LT];
            if (anchors) {
                for (const id in anchors) {
                    if (parseInt(anchors[id]) === location) {
                        node.anchor(LT, id, true);
                        node.anchorDelete(RB);
                        return;
                    }
                }
            }
            const templateOptions: ViewAttribute = {
                android: {
                    orientation: horizontal ? 'vertical' : 'horizontal'
                },
                app: {
                    [attr]: percent ? location.toString() : '@dimen/' + Resource.insertStoredAsset('dimens', `constraint_guideline_${!opposing ? LT : RB}`, formatPX(location))
                }
            };
            this.addAfterOutsideTemplate(node.id, this.renderNodeStatic({ controlName: node.api < BUILD_ANDROID.Q ? CONTAINER_ANDROID.GUIDELINE : CONTAINER_ANDROID_X.GUIDELINE }, templateOptions), false);
            const documentId = templateOptions.documentId;
            if (documentId) {
                node.anchor(LT, documentId, true);
                node.anchorDelete(RB);
                if (location > 0) {
                    assignEmptyValue(guideline, axis, attr, LT, documentId, location.toString());
                    parent.constraint.guideline = guideline;
                }
            }
        }
    }

    protected createLayoutGroup(layout: LayoutUI<T>) {
        return this.createNodeGroup(layout.node, layout.children, layout.parent);
    }

    get containerTypeHorizontal(): LayoutType {
        return {
            containerType: CONTAINER_NODE.RELATIVE,
            alignmentType: NODE_ALIGNMENT.HORIZONTAL
        };
    }

    get containerTypeVertical(): LayoutType {
        return {
            containerType: CONTAINER_NODE.CONSTRAINT,
            alignmentType: NODE_ALIGNMENT.VERTICAL
        };
    }

    get containerTypeVerticalMargin(): LayoutType {
        return {
            containerType: CONTAINER_NODE.FRAME,
            alignmentType: NODE_ALIGNMENT.COLUMN
        };
    }

    get containerTypePercent(): LayoutType {
        return {
            containerType: CONTAINER_NODE.CONSTRAINT,
            alignmentType: NODE_ALIGNMENT.PERCENT
        };
    }

    get afterInsertNode() {
        return (node: T) => {
            node.localSettings = this._defaultViewSettings;
            node.api = this._targetAPI;
            node.setExclusions();
        };
    }

    get userSettings() {
        return this.application.userSettings;
    }

    get screenDimension() {
        return this._screenDimension;
    }
}