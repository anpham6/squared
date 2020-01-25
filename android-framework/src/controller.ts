import { FileAsset, ImageAsset, LayoutType, NodeTemplate, NodeXmlTemplate } from '../../@types/base/application';
import { ControllerSettingsAndroid } from '../../@types/android/application';
import { LocalSettings, SpacerAttribute, WrapperOptions } from '../../@types/android/node';

import Resource from './resource';
import View from './view';
import ViewGroup from './viewgroup';

import { CONTAINER_ANDROID, CONTAINER_ANDROID_X, STRING_ANDROID } from './lib/constant';
import { BUILD_ANDROID, CONTAINER_NODE } from './lib/enumeration';
import { createViewAttribute, getDocumentId, getRootNs } from './lib/util';

const $lib = squared.lib;
const { PLATFORM, USER_AGENT, isPlatform, isUserAgent } = $lib.client;
const { parseColor } = $lib.color;
const { formatPX, getSrcSet, isLength, isPercent, parseUnit } = $lib.css;
const { createElement, getElementsBetweenSiblings, getRangeClientRect } = $lib.dom;
const { maxArray, truncate } = $lib.math;
const { CHAR } = $lib.regex;
const { getElementAsNode } = $lib.session;
const { aboveRange, assignEmptyValue, convertFloat, filterArray, hasBit, isString, objectMap, optionalAsObject, partitionArray, withinRange } = $lib.util;
const { STRING_XMLENCODING, replaceTab } = $lib.xml;

const $base = squared.base;
const { Node, NodeUI } = $base;
const { APP_SECTION, BOX_STANDARD, NODE_ALIGNMENT, NODE_PROCEDURE, NODE_RESOURCE, NODE_TEMPLATE } = $base.lib.enumeration;

const REGEX_TEXTSHADOW = /^(?:(rgba?\([^)]+\)|[a-z]+) )?(-?[\d.]+[a-z]+) (-?[\d.]+[a-z]+)\s*(-?[\d.]+[a-z]+)?.*$/;

function sortHorizontalFloat(list: View[]) {
    if (list.some(node => node.floating)) {
        list.sort((a, b) => {
            const floatingA = a.floating;
            const floatingB = b.floating;
            if (floatingA && floatingB) {
                const floatA = a.float;
                const floatB = b.float;
                if (floatA !== floatB) {
                    return floatA === 'left' ? -1 : 1;
                }
                else if (floatA === 'right' && floatB === 'right') {
                    return 1;
                }
            }
            else if (floatingA) {
                return a.float === 'left' ? -1 : 1;
            }
            else if (floatingB) {
                return b.float === 'left' ? 1 : -1;
            }
            return 0;
        });
    }
}

function sortConstraintAbsolute(templates: NodeXmlTemplate<View>[]) {
    if (templates.length > 1) {
        templates.sort((a, b) => {
            const nodeA = a.node;
            const nodeB = b.node;
            const above = nodeA.innerMostWrapped as View || nodeA;
            const below = nodeB.innerMostWrapped as View || nodeB;
            if (above.absoluteParent === below.absoluteParent) {
                if (above.zIndex === below.zIndex) {
                    return above.childIndex < below.childIndex ? -1 : 1;
                }
                return above.zIndex < below.zIndex ? -1 : 1;
            }
            else {
                const bounds = below.bounds;
                if (above.intersectX(bounds, 'bounds') && above.intersectY(bounds, 'bounds')) {
                    if (above.depth === below.depth) {
                        return 0;
                    }
                    return above.id < below.id ? -1 : 1;
                }
            }
            return 0;
        });
    }
    return templates;
}

function adjustBaseline(baseline: View, nodes: View[], singleRow: boolean, boxTop: number) {
    const baselineHeight = baseline.baselineHeight;
    let imageHeight = 0;
    let imageBaseline: View | undefined;
    for (const node of nodes) {
        if (!node.baselineAltered) {
            let height = node.baselineHeight;
            if (height > 0 || node.textElement) {
                if (node.blockVertical && baseline.blockVertical) {
                    node.anchor('bottom', baseline.documentId);
                    continue;
                }
                else {
                    const imageElements = node.renderChildren.filter(item => item.imageOrSvgElement && item.baseline);
                    if (node.imageOrSvgElement || imageElements.length) {
                        for (const image of imageElements) {
                            height = Math.max(image.baselineHeight, height);
                        }
                        if (height > baselineHeight) {
                            if (imageBaseline === undefined || height >= imageHeight) {
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
                }
                if (singleRow && node.is(CONTAINER_NODE.BUTTON)) {
                    node.anchor('centerVertical', 'true');
                }
                else if (node.naturalChild && node.length === 0) {
                    node.anchor('baseline', baseline.documentId);
                }
                else if (isLayoutBaselineAligned(node)) {
                    node.anchor(node.naturalElements.findIndex((item: View) => item.imageOrSvgElement && item.baseline) !== -1 ? 'bottom' : 'baseline', baseline.documentId);
                }
            }
            else if (node.imageOrSvgElement && node.baseline) {
                imageBaseline = node;
            }
        }
    }
    if (imageBaseline) {
        baseline.anchor(getBaselineAnchor(imageBaseline), imageBaseline.documentId);
    }
}

function isLayoutBaselineAligned(node: View) {
    if (!node.floating) {
        const children = node.renderChildren;
        if (node.layoutHorizontal) {
            return children.every(item => item.baseline && !item.baselineAltered && (!item.positionRelative || item.top === 0 && item.bottom === 0));
        }
        else if (node.layoutVertical) {
            const firstChild = children[0];
            return firstChild.baseline && (firstChild.textElement || firstChild.inputElement);
        }
        else if (node.layoutFrame && children.length === 1 && children[0].baseline) {
            return true;
        }
    }
    return false;
}

function adjustAbsolutePaddingOffset(parent: View, direction: number, value: number) {
    if (value > 0) {
        if (parent.documentBody) {
            switch (direction) {
                case BOX_STANDARD.PADDING_TOP:
                    value -= parent.marginTop;
                    break;
                case BOX_STANDARD.PADDING_RIGHT:
                    value -= parent.marginRight;
                    break;
                case BOX_STANDARD.PADDING_BOTTOM:
                    value -= parent.marginBottom;
                    break;
                case BOX_STANDARD.PADDING_LEFT:
                    value -= parent.marginLeft;
                    break;
            }
        }
        if (parent.getBox(direction)[0] !== 1) {
            switch (direction) {
                case BOX_STANDARD.PADDING_TOP:
                    value += parent.borderTopWidth - parent.paddingTop;
                    break;
                case BOX_STANDARD.PADDING_RIGHT:
                    value += parent.borderRightWidth - parent.paddingRight;
                    break;
                case BOX_STANDARD.PADDING_BOTTOM:
                    value += parent.borderBottomWidth - parent.paddingBottom;
                    break;
                case BOX_STANDARD.PADDING_LEFT:
                    value += parent.borderLeftWidth - parent.paddingLeft;
                    break;
            }
        }
        return Math.max(value, 0);
    }
    return value;
}

function adjustFloatingNegativeMargin(node: View, previous: View) {
    if (previous.float === 'left') {
        if (previous.marginRight < 0) {
            const right = Math.abs(previous.marginRight);
            node.modifyBox(BOX_STANDARD.MARGIN_LEFT, previous.actualWidth + (previous.hasWidth ? previous.paddingLeft + previous.borderLeftWidth : 0) - right);
            node.anchor('left', previous.documentId);
            previous.modifyBox(BOX_STANDARD.MARGIN_RIGHT);
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
        previous.modifyBox(BOX_STANDARD.MARGIN_LEFT);
        return true;
    }
    return false;
}

function constraintMinMax(node: View, horizontal: boolean) {
    const minWH = node.cssInitial(horizontal ? 'minWidth' : 'minHeight', true);
    if (isLength(minWH, true) && minWH !== '0px') {
        if (horizontal) {
            if (View.ascendFlexibleWidth(node)) {
                node.setLayoutWidth('0px', false);
                if (node.flexibleWidth) {
                    node.app('layout_constraintWidth_min', formatPX(node.parseUnit(minWH) + node.contentBoxWidth));
                    node.css('minWidth', 'auto');
                }
            }
        }
        else if (View.ascendFlexibleHeight(node)) {
            node.setLayoutHeight('0px', false);
            if (node.flexibleHeight) {
                node.app('layout_constraintHeight_min', formatPX(node.parseUnit(minWH, 'height') + node.contentBoxHeight));
                node.css(horizontal ? 'minWidth' : 'minHeight', 'auto');
            }
        }
    }
    const maxWH = node.cssInitial(horizontal ? 'maxWidth' : 'maxHeight', true);
    if (isLength(maxWH, true)) {
        if (horizontal) {
            if (View.ascendFlexibleWidth(node)) {
                node.setLayoutWidth((node.renderParent as  View).flexibleWidth ? 'match_parent' : '0px', node.innerMostWrapped?.naturalChild === true);
                if (node.flexibleWidth) {
                    const value = node.parseUnit(maxWH);
                    node.app('layout_constraintWidth_max', formatPX(value + node.contentBoxWidth));
                    node.css('maxWidth', 'auto');
                    if (node.layoutVertical) {
                        node.each(item => {
                            if (item.textElement && !item.hasPX('maxWidth')) {
                                item.css('maxWidth', formatPX(value));
                            }
                        });
                    }
                }
            }
        }
        else if (View.ascendFlexibleHeight(node)) {
            node.setLayoutHeight((node.renderParent as View).flexibleHeight ? 'match_parent' : '0px', node.innerMostWrapped?.naturalChild === true);
            if (node.flexibleHeight) {
                node.app('layout_constraintHeight_max', formatPX(node.parseUnit(maxWH, 'height') + node.contentBoxHeight));
                node.css('maxHeight', 'auto');
            }
        }
    }
}

function setConstraintPercent(node: View, value: string, horizontal: boolean, percent: number) {
    const actualParent = node.actualParent || node.documentParent;
    let basePercent = (parseFloat(value) / 100);
    if (basePercent < 1 && !(actualParent.flexElement && isPercent(node.flexbox.basis)) && (percent < 1 || node.blockStatic && !actualParent.gridElement)) {
        const parent = node.actualParent;
        let boxPercent = horizontal ? node.contentBoxWidthPercent : node.contentBoxHeightPercent;
        let marginPercent = 0;
        if (parent) {
            marginPercent = (horizontal ? node.marginLeft + node.marginRight : node.marginTop + node.marginBottom) / parent.box.width;
        }
        if (boxPercent > 0) {
            if (percent < boxPercent) {
                boxPercent = Math.max(percent, 0);
                percent = 0;
            }
            else {
                percent -= boxPercent;
            }
        }
        if (percent === 0) {
            boxPercent -= marginPercent;
        }
        else {
            percent = Math.max(percent - marginPercent, 0);
        }
        basePercent = Math.min(basePercent + boxPercent, 1);
    }
    node.app(horizontal ? 'layout_constraintWidth_percent' : 'layout_constraintHeight_percent', truncate(basePercent, node.localSettings.floatPrecision));
    setLayoutDimension(node, basePercent === 1 && !node.hasPX('maxWidth') ? 'match_parent' : '0px', horizontal, false);
    return percent;
}

function setLayoutDimension(node: View, value: string, horizontal: boolean, overwrite: boolean) {
    if (horizontal) {
        node.setLayoutWidth(value, overwrite);
    }
    else {
        node.setLayoutHeight(value, overwrite);
    }
}

function constraintPercentValue(node: View, dimension: string, horizontal: boolean, opposing: boolean, percent: number) {
    const value = node.cssInitial(dimension, true);
    if (opposing) {
        if (isLength(value, true)) {
            const size = node.bounds[dimension];
            setLayoutDimension(node, formatPX(size), horizontal, true);
            if (node.imageElement) {
                const { naturalWidth, naturalHeight } = <HTMLImageElement> node.element;
                if (naturalWidth > 0 && naturalHeight > 0) {
                    const opposingUnit = formatPX((size / (horizontal ? naturalWidth : naturalHeight)) * (horizontal ? naturalHeight : naturalWidth));
                    if (horizontal) {
                        node.setLayoutHeight(opposingUnit, false);
                    }
                    else {
                        node.setLayoutWidth(opposingUnit, false);
                    }
                }
            }
        }
    }
    else if (isPercent(value)) {
        return setConstraintPercent(node, value, horizontal, percent);
    }
    return percent;
}

function constraintPercentWidth(node: View, opposing: boolean, percent = 1) {
    if (!opposing && !node.documentParent.layoutElement && node.documentParent.hasPX('width', false)) {
        const value = node.cssInitial('width', true);
        if (isPercent(value)) {
            if (value !== '100%') {
                node.setLayoutWidth(formatPX(node.bounds.width));
            }
            else {
                node.setLayoutWidth('match_parent', false);
            }
        }
    }
    else if (!node.inputElement) {
        return constraintPercentValue(node, 'width', true, opposing, percent);
    }
    return percent;
}

function constraintPercentHeight(node: View, opposing: boolean, percent = 1) {
    if (node.documentParent.hasPX('height', false)) {
        if (!opposing && !node.documentParent.layoutElement) {
            const value = node.cssInitial('height', true);
            if (isPercent(value)) {
                if (value !== '100%') {
                    node.setLayoutHeight(formatPX(node.bounds.height));
                }
                else {
                    node.setLayoutHeight('match_parent', false);
                }
            }
        }
        else if (!node.inputElement) {
            return constraintPercentValue(node, 'height', false, opposing, percent);
        }
    }
    else {
        const height = node.cssInitial('height');
        if (height === '100%' && node.alignParent('top') && node.alignParent('bottom')) {
            node.setLayoutHeight('0px', false);
        }
        else if (isLength(height, true)) {
            node.setLayoutHeight(formatPX(node.bounds.height), false);
        }
    }
    return percent;
}

function isTargeted(parent: View, node: View) {
    if (node.dataset.target && parent.element) {
        const element = document.getElementById(node.dataset.target);
        return element !== null && element !== parent.element;
    }
    return false;
}

function getTextBottom(nodes: View[]): View[] {
    return filterArray(nodes, node => (node.baseline || isLength(node.verticalAlign, true)) && (node.tagName === 'TEXTAREA' || node.tagName === 'SELECT' && node.toElementInt('size') > 1) || node.verticalAlign === 'text-bottom' && node.containerName !== 'INPUT_IMAGE').sort((a, b) => {
        if (a.baselineHeight === b.baselineHeight) {
            return a.tagName === 'SELECT' ? 1 : 0;
        }
        return a.baselineHeight > b.baselineHeight ? -1 : 1;
    });
}

function causesLineBreak(element: Element, sessionId: string) {
    if (element.tagName === 'BR') {
        return true;
    }
    else {
        const node = getElementAsNode<View>(element, sessionId);
        if (node) {
            return !node.excluded && node.blockStatic;
        }
    }
    return false;
}

function setColumnHorizontal(seg: View[]) {
    const length = seg.length;
    for (let i = 0; i < length; i++) {
        const item = seg[i];
        if (i > 0) {
            item.anchor('leftRight', seg[i - 1].documentId);
        }
        if (i < length - 1) {
            item.anchor('rightLeft', seg[i + 1].documentId);
        }
        item.anchored = true;
    }
    const rowStart = seg[0];
    const rowEnd = seg[length - 1];
    rowStart.anchor('left', 'parent');
    rowEnd.anchor('right', 'parent');
    rowStart.anchorStyle(STRING_ANDROID.HORIZONTAL, 'spread_inside');
}

function setColumnVertical(partition: View[][], lastRow: boolean, previousRow?: View | string) {
    const rowStart = partition[0][0];
    const length = partition.length;
    for (let i = 0; i < length; i++) {
        const seg = partition[i];
        const lengthB = seg.length;
        for (let j = 0; j < lengthB; j++) {
            const item = seg[j];
            if (j === 0) {
                if (i === 0) {
                    if (previousRow) {
                        previousRow.anchor('bottomTop', item.documentId);
                        item.anchor('topBottom', typeof previousRow === 'string' ? previousRow : previousRow.documentId);
                    }
                    else {
                        item.anchor('top', 'parent');
                        item.anchorStyle(STRING_ANDROID.VERTICAL);
                    }
                }
                else {
                    item.anchor('top', rowStart.documentId);
                    item.anchorStyle(STRING_ANDROID.VERTICAL);
                    item.modifyBox(BOX_STANDARD.MARGIN_TOP);
                }
            }
            else {
                seg[j - 1].anchor('bottomTop', item.documentId);
                item.anchor('topBottom', seg[j - 1].documentId);
            }
            if (j > 0) {
                item.anchor('left', seg[0].documentId);
            }
            if (j === lengthB - 1) {
                if (lastRow) {
                    item.anchor('bottom', 'parent');
                }
                else if (i > 0 && !item.multiline) {
                    const adjacent = partition[i - 1][j];
                    if (adjacent && !adjacent.multiline && withinRange(item.bounds.top, adjacent.bounds.top)) {
                        item.anchor('top', adjacent.documentId);
                        item.modifyBox(BOX_STANDARD.MARGIN_TOP, -adjacent.marginTop);
                    }
                }
                item.modifyBox(BOX_STANDARD.MARGIN_BOTTOM);
            }
            item.anchored = true;
            item.positioned = true;
        }
    }
}

function setReadOnly(node: View) {
    const element = <HTMLInputElement> node.element;
    if (element.readOnly) {
        node.android('focusable', 'false');
    }
    if (element.disabled) {
        node.android('enabled', 'false');
    }
}

function setLeftTopAxis(node: View, parent: View, hasDimension: boolean, horizontal: boolean) {
    const autoMargin = node.autoMargin;
    const [orientation, dimension, leftA, rightA, leftB, rightB, leftC, rightC] =
        horizontal
            ? [STRING_ANDROID.HORIZONTAL, 'width', 'left', 'right', BOX_STANDARD.MARGIN_LEFT, BOX_STANDARD.MARGIN_RIGHT, BOX_STANDARD.PADDING_LEFT, BOX_STANDARD.PADDING_RIGHT]
            : [STRING_ANDROID.VERTICAL, 'height', 'top', 'bottom', BOX_STANDARD.MARGIN_TOP, BOX_STANDARD.MARGIN_BOTTOM, BOX_STANDARD.PADDING_TOP, BOX_STANDARD.PADDING_BOTTOM];
    if (hasDimension && autoMargin[orientation]) {
        if (node.hasPX(leftA) && autoMargin[rightA]) {
            node.anchor(leftA, 'parent');
            node.modifyBox(leftB, node[leftA]);
        }
        else if (node.hasPX(rightA) && autoMargin[leftA]) {
            node.anchor(rightA, 'parent');
            node.modifyBox(rightB, node[rightA]);
        }
        else {
            node.anchorParent(orientation);
            node.modifyBox(leftB, node.left);
            node.modifyBox(rightB, node[rightA]);
        }
    }
    else {
        let expand = 0;
        if (node.hasPX(leftA)) {
            node.anchor(leftA, 'parent');
            if (!node.hasPX(rightA) && node.css(dimension) === '100%') {
                node.anchor(rightA, 'parent');
                expand++;
            }
            node.modifyBox(leftB, adjustAbsolutePaddingOffset(parent, leftC, node[leftA]));
            expand++;
        }
        if (node.hasPX(rightA) && (!node.hasPX(dimension) || node.css(dimension) === '100%' || !node.hasPX(leftA))) {
            node.anchor(rightA, 'parent');
            node.modifyBox(rightB, adjustAbsolutePaddingOffset(parent, rightC, node[rightA]));
            expand++;
        }
        if (expand === 2) {
            if (horizontal) {
                node.setLayoutWidth('match_parent');
            }
            else {
                node.setLayoutHeight('match_parent');
            }
        }
    }
    node.positioned = true;
}

function setImageDimension(node: View, value: number, width: number, height: number, image: ImageAsset | undefined) {
    width = value;
    node.css('width', formatPX(value), true);
    if (image && image.width > 0 && image.height > 0) {
        height = image.height * (width / image.width);
        node.css('height', formatPX(height), true);
    }
    else {
        node.android('adjustViewBounds', 'true');
    }
    return [width, height];
}

function setInputMinDimension(node: View, element: HTMLInputElement) {
    const { minLength, maxLength } = element;
    if (minLength !== -1) {
        node.android('minLength', minLength.toString());
    }
    if (maxLength > 0) {
        node.android('maxLength', maxLength.toString());
    }
}
function setInputMinMax(node: View, element: HTMLInputElement) {
    const { min, max } = element;
    if (isString(min)) {
        node.android('min', min);
    }
    if (isString(max)) {
        node.android('max', max);
    }
}

const isMultiline = (node: View) => node.plainText && Resource.hasLineBreak(node, false, true) || node.preserveWhiteSpace && CHAR.LEADINGNEWLINE.test(node.textContent);
const getMaxHeight = (node: View) => Math.max(node.actualHeight, node.lineHeight);
const getBaselineAnchor = (node: View) => node.imageOrSvgElement ? 'baseline' : 'bottom';
const getRelativeVertical = (layout: squared.base.LayoutUI<View>) => layout.some(item => item.positionRelative || !item.pageFlow && item.positionAuto) ? CONTAINER_NODE.RELATIVE : CONTAINER_NODE.LINEAR;
const getRelativeVerticalAligned = (layout: squared.base.LayoutUI<View>) => layout.some(item => item.positionRelative) ? CONTAINER_NODE.RELATIVE : CONTAINER_NODE.LINEAR;
const getAnchorDirection = (reverse: boolean) => reverse ? ['right', 'left', 'rightLeft', 'leftRight'] : ['left', 'right', 'leftRight', 'rightLeft'];

export default class Controller<T extends View> extends squared.base.ControllerUI<T> implements android.base.Controller<T> {
    public static setConstraintDimension<T extends View>(node: T, percentWidth = 1): number {
        percentWidth = constraintPercentWidth(node, false, percentWidth);
        constraintPercentHeight(node, false, 1);
        if (!node.inputElement && !node.imageOrSvgElement) {
            constraintMinMax(node, true);
            constraintMinMax(node, false);
        }
        return percentWidth;
    }

    public static setFlexDimension<T extends View>(node: T, dimension: string, percentWidth = 1, percentHeight = 1): [number, number] {
        const horizontal = dimension === 'width';
        const { grow, basis, shrink } = node.flexbox;
        function setFlexGrow(value: string) {
            if (grow > 0) {
                node.app(horizontal ? 'layout_constraintHorizontal_weight' : 'layout_constraintVertical_weight', truncate(grow, node.localSettings.floatPrecision));
                return true;
            }
            else if (value !== '') {
                if (shrink > 1) {
                    value = formatPX(parseFloat(value) / shrink);
                }
                else if (shrink > 1) {
                    value = formatPX((1 - shrink) * parseFloat(value));
                }
                node.app(horizontal ? 'layout_constraintWidth_min' : 'layout_constraintHeight_min', value);
            }
            return false;
        }
        if (isLength(basis)) {
            setFlexGrow(node.convertPX(basis, dimension));
            setLayoutDimension(node, '0px', horizontal, true);
        }
        else if (basis !== '0%' && isPercent(basis)) {
            setFlexGrow('');
            if (horizontal) {
                percentWidth = setConstraintPercent(node, basis, true, percentWidth);
            }
            else {
                percentHeight = setConstraintPercent(node, basis, false, percentHeight);
            }
        }
        else {
            let flexible = false;
            if (Node.isFlexibleDirection(node, horizontal ? 'row' : 'column')) {
                flexible = setFlexGrow(node.hasPX(dimension, false) ? formatPX(horizontal ? node.actualWidth : node.actualHeight) : '');
                if (flexible) {
                    setLayoutDimension(node, '0px', horizontal, true);
                }
            }
            if (!flexible) {
                if (horizontal) {
                    percentWidth = constraintPercentWidth(node, false, percentWidth);
                }
                else {
                    percentHeight = constraintPercentHeight(node, false, percentHeight);
                }
            }
        }
        if (shrink > 1) {
            node.app(horizontal ? 'layout_constrainedWidth' : 'layout_constrainedHeight', 'true');
        }
        if (horizontal) {
            constraintPercentHeight(node, true);
        }
        else {
            constraintPercentWidth(node, true);
        }
        if (!node.inputElement && !node.imageOrSvgElement) {
            constraintMinMax(node, true);
            constraintMinMax(node, false);
        }
        return [percentWidth, percentHeight];
    }

    public readonly localSettings: ControllerSettingsAndroid = {
        layout: {
            pathName: 'res/layout',
            fileExtension: 'xml',
            baseTemplate: STRING_XMLENCODING
        },
        directory: {
            string: 'res/values',
            font: 'res/font',
            image: 'res/drawable'
        },
        svg: {
            enabled: false
        },
        style: {
            inputBorderColor: 'rgb(0, 0, 0)',
            inputBackgroundColor: isPlatform(PLATFORM.MAC) ? 'rgb(255, 255, 255)' : 'rgb(221, 221, 221)',
            meterForegroundColor: 'rgb(99, 206, 68)',
            meterBackgroundColor: 'rgb(237, 237, 237)',
            progressForegroundColor: 'rgb(138, 180, 248)',
            progressBackgroundColor: 'rgb(237, 237, 237)'
        },
        supported: {
            fontFormat: ['truetype', 'opentype'],
            imageFormat: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'cur']
        },
        unsupported: {
            cascade: new Set(['SELECT', 'svg']),
            tagName: new Set([
                'HEAD',
                'TITLE',
                'META',
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
                'DATALIST'
            ]),
            excluded: new Set(['BR', 'WBR'])
        },
        precision: {
            standardFloat: 3
        },
        deviations: {
            textMarginBoundarySize: 8,
            subscriptBottomOffset: 0.5,
            superscriptTopOffset: 0.5,
            legendBottomOffset: 0.25
        }
    };

    private _defaultViewSettings!: LocalSettings;
    private _targetAPI!: number;

    constructor(
        public application: android.base.Application<T>,
        public cache: squared.base.NodeList<T>)
    {
        super();
    }

    public init() {
        const settings = this.userSettings;
        this._targetAPI = settings.targetAPI || BUILD_ANDROID.LATEST;
        this._defaultViewSettings = {
            supportRTL: !!settings.supportRTL,
            floatPrecision: this.localSettings.precision.standardFloat
        };
        super.init();
    }

    public optimize(nodes: T[]) {
        for (const node of nodes) {
            node.applyOptimizations();
            if (node.hasProcedure(NODE_PROCEDURE.CUSTOMIZATION)) {
                node.applyCustomizations(this.userSettings.customizationsOverwritePrivilege);
            }
        }
    }

    public finalize(layouts: FileAsset[]) {
        const insertSpaces = this.userSettings.insertSpaces;
        for (const layout of layouts) {
            layout.content = replaceTab(layout.content.replace(/{#0}/, getRootNs(layout.content)), insertSpaces);
        }
    }

    public processUnknownParent(layout: squared.base.LayoutUI<T>) {
        const node = layout.node;
        if (node.has('columnCount') || node.hasPX('columnWidth')) {
            layout.setContainerType(CONTAINER_NODE.CONSTRAINT, NODE_ALIGNMENT.COLUMN | NODE_ALIGNMENT.AUTO_LAYOUT);
        }
        else if (layout.some(item => !item.pageFlow && !item.positionAuto)) {
            layout.setContainerType(CONTAINER_NODE.CONSTRAINT, NODE_ALIGNMENT.ABSOLUTE | NODE_ALIGNMENT.UNKNOWN);
        }
        else if (layout.visible.length <= 1) {
            const child = node.find((item: T) => item.visible) as T;
            if (child) {
                if (node.documentRoot && isTargeted(node, child)) {
                    node.hide();
                    return { layout, next: true };
                }
                else if (node.naturalElement && child.plainText) {
                    node.clear();
                    node.inlineText = true;
                    node.textContent = child.textContent;
                    child.hide();
                    layout.setContainerType(CONTAINER_NODE.TEXT);
                }
                else if (node.autoMargin.horizontal || layout.parent.layoutConstraint && layout.parent.flexElement && node.flexbox.alignSelf === 'baseline' && child.textElement) {
                    layout.setContainerType(CONTAINER_NODE.LINEAR, NODE_ALIGNMENT.HORIZONTAL | NODE_ALIGNMENT.SINGLE);
                }
                else {
                    if (child.percentWidth) {
                        if (!node.hasPX('width')) {
                            node.setLayoutWidth('match_parent');
                        }
                        layout.setContainerType(CONTAINER_NODE.CONSTRAINT, NODE_ALIGNMENT.SINGLE | NODE_ALIGNMENT.BLOCK);
                    }
                    else if (child.baseline && (child.textElement || child.inputElement)) {
                        layout.setContainerType(getRelativeVerticalAligned(layout), NODE_ALIGNMENT.VERTICAL);
                    }
                    else {
                        layout.setContainerType(CONTAINER_NODE.FRAME, NODE_ALIGNMENT.SINGLE);
                    }
                }
            }
            else {
                return this.processUnknownChild(layout);
            }
        }
        else if (Resource.hasLineBreak(node, true)) {
            layout.setContainerType(getRelativeVerticalAligned(layout), NODE_ALIGNMENT.VERTICAL | NODE_ALIGNMENT.UNKNOWN);
        }
        else if (this.checkConstraintFloat(layout)) {
            layout.setContainerType(CONTAINER_NODE.CONSTRAINT, NODE_ALIGNMENT.FLOAT);
        }
        else if (layout.linearX) {
            if (this.checkFrameHorizontal(layout)) {
                layout.renderType |= NODE_ALIGNMENT.FLOAT | NODE_ALIGNMENT.HORIZONTAL;
            }
            else if (this.checkConstraintHorizontal(layout)) {
                layout.setContainerType(CONTAINER_NODE.CONSTRAINT);
            }
            else if (this.checkLinearHorizontal(layout)) {
                layout.setContainerType(CONTAINER_NODE.LINEAR);
                if (layout.floated.size) {
                    sortHorizontalFloat(layout.children);
                }
            }
            else {
                layout.setContainerType(CONTAINER_NODE.RELATIVE);
            }
            layout.add(NODE_ALIGNMENT.HORIZONTAL);
        }
        else if (layout.linearY) {
            layout.setContainerType(getRelativeVertical(layout), NODE_ALIGNMENT.VERTICAL | ( node.documentRoot ? NODE_ALIGNMENT.UNKNOWN : 0));
        }
        else if (layout.every(item => item.inlineFlow)) {
            if (this.checkFrameHorizontal(layout)) {
                layout.renderType |= NODE_ALIGNMENT.FLOAT | NODE_ALIGNMENT.HORIZONTAL;
            }
            else {
                layout.setContainerType(getRelativeVertical(layout), NODE_ALIGNMENT.VERTICAL | NODE_ALIGNMENT.UNKNOWN);
            }
        }
        else if (layout.some((item, index) => item.alignedVertically(index > 0 ? layout.children.slice(0, index) : undefined, layout.cleared) > 0)) {
            layout.setContainerType(getRelativeVertical(layout), NODE_ALIGNMENT.VERTICAL | NODE_ALIGNMENT.UNKNOWN);
        }
        else {
            layout.setContainerType(CONTAINER_NODE.CONSTRAINT, NODE_ALIGNMENT.UNKNOWN);
        }
        return { layout };
    }

    public processUnknownChild(layout: squared.base.LayoutUI<T>) {
        const node = layout.node;
        const visibleStyle = node.visibleStyle;
        if (node.inlineText && (!node.textEmpty || visibleStyle.borderWidth)) {
            layout.setContainerType(CONTAINER_NODE.TEXT);
        }
        else if (node.blockStatic && (visibleStyle.borderWidth || visibleStyle.backgroundImage || node.paddingTop + node.paddingBottom > 0) && node.naturalChildren.length === 0) {
            layout.setContainerType(CONTAINER_NODE.FRAME);
        }
        else if (
            node.naturalElement &&
            !node.documentRoot &&
            node.elementId === '' &&
            node.bounds.height === 0 &&
            node.marginTop === 0 &&
            node.marginRight === 0 &&
            node.marginBottom === 0 &&
            node.marginLeft === 0 &&
            !visibleStyle.background &&
            !node.dataset.use)
        {
            node.hide();
            return { layout, next: true };
        }
        else if (visibleStyle.background) {
            layout.setContainerType(CONTAINER_NODE.TEXT);
            node.inlineText = true;
        }
        else {
            layout.setContainerType(CONTAINER_NODE.FRAME);
        }
        return { layout };
    }

    public processTraverseHorizontal(layout: squared.base.LayoutUI<T>, siblings: T[]) {
        const parent = layout.parent;
        if (layout.floated.size === 1 && layout.same((item, index) => item.floating && (item.positiveAxis || item.renderExclude) ? -1 : index)) {
            layout.node = this.createNodeGroup(layout.node, layout.children, parent);
            layout.setContainerType(CONTAINER_NODE.CONSTRAINT, NODE_ALIGNMENT.FLOAT);
        }
        else if (this.checkFrameHorizontal(layout)) {
            layout.node = this.createNodeGroup(layout.node, layout.children, parent);
            layout.renderType |= NODE_ALIGNMENT.FLOAT | NODE_ALIGNMENT.HORIZONTAL;
        }
        else if (layout.length !== siblings.length || parent.hasAlign(NODE_ALIGNMENT.VERTICAL)) {
            layout.node = this.createNodeGroup(layout.node, layout.children, parent);
            this.processLayoutHorizontal(layout);
        }
        else {
            parent.addAlign(NODE_ALIGNMENT.HORIZONTAL);
        }
        return layout;
    }

    public processTraverseVertical(layout: squared.base.LayoutUI<T>) {
        const { floated, cleared } = layout;
        if (layout.some((item, index) => item.lineBreakTrailing && index < layout.length - 1)) {
            if (!layout.parent.hasAlign(NODE_ALIGNMENT.VERTICAL)) {
                layout.node = this.createLayoutNodeGroup(layout);
                layout.setContainerType(getRelativeVertical(layout), NODE_ALIGNMENT.VERTICAL | NODE_ALIGNMENT.UNKNOWN);
            }
        }
        else if (floated.size === 1 && layout.every((item, index) => index === 0 || index === layout.length - 1 || cleared.has(item))) {
            layout.node = this.createLayoutNodeGroup(layout);
            if (layout.same(node => node.float)) {
                layout.setContainerType(CONTAINER_NODE.CONSTRAINT, NODE_ALIGNMENT.FLOAT);
            }
            else if (cleared.size) {
                layout.renderType |= NODE_ALIGNMENT.FLOAT | NODE_ALIGNMENT.HORIZONTAL;
            }
            else {
                layout.setContainerType(getRelativeVerticalAligned(layout), NODE_ALIGNMENT.VERTICAL);
            }
        }
        else if (floated.size && cleared.size) {
            layout.node = this.createLayoutNodeGroup(layout);
            layout.renderType |= NODE_ALIGNMENT.FLOAT | NODE_ALIGNMENT.VERTICAL;
        }
        else if (floated.size && (layout.item(0) as T).floating) {
            layout.node = this.createLayoutNodeGroup(layout);
            layout.renderType |= NODE_ALIGNMENT.FLOAT | NODE_ALIGNMENT.HORIZONTAL;
        }
        else if (!layout.parent.hasAlign(NODE_ALIGNMENT.VERTICAL)) {
            layout.node = this.createLayoutNodeGroup(layout);
            layout.setContainerType(getRelativeVerticalAligned(layout), NODE_ALIGNMENT.VERTICAL);
        }
        return layout;
    }

    public processLayoutHorizontal(layout: squared.base.LayoutUI<T>) {
        if (this.checkConstraintFloat(layout, true)) {
            layout.setContainerType(CONTAINER_NODE.CONSTRAINT, NODE_ALIGNMENT.FLOAT);
        }
        else if (this.checkConstraintHorizontal(layout)) {
            layout.setContainerType(CONTAINER_NODE.CONSTRAINT, NODE_ALIGNMENT.HORIZONTAL);
        }
        else if (this.checkLinearHorizontal(layout)) {
            layout.setContainerType(CONTAINER_NODE.LINEAR, NODE_ALIGNMENT.HORIZONTAL);
            if (layout.floated.size) {
                sortHorizontalFloat(layout.children);
            }
        }
        else {
            layout.setContainerType(CONTAINER_NODE.RELATIVE, NODE_ALIGNMENT.HORIZONTAL);
        }
        return layout;
    }

    public sortRenderPosition(parent: T, templates: NodeXmlTemplate<T>[]) {
        if (parent.layoutRelative && templates.some(item => item.node.zIndex !== 0)) {
            templates.sort((a, b) => {
                const indexA = a.node.zIndex;
                const indexB = b.node.zIndex;
                if (indexA === indexB) {
                    return 0;
                }
                else if (indexA > indexB) {
                    return 1;
                }
                else {
                    return -1;
                }
            });
        }
        else if (parent.layoutConstraint && templates.some(item => !item.node.pageFlow || item.node.zIndex !== 0)) {
            const below: NodeXmlTemplate<T>[] = [];
            const middle: NodeXmlTemplate<T>[] = [];
            const above: NodeXmlTemplate<T>[] = [];
            for (const item of templates) {
                const node = item.node;
                if (node.pageFlow) {
                    middle.push(item);
                }
                else if (node.zIndex >= 0) {
                    above.push(item);
                }
                else {
                    below.push(item);
                }
            }
            sortConstraintAbsolute(below);
            sortConstraintAbsolute(above);
            return below.concat(middle, above);
        }
        return templates;
    }

    public checkFrameHorizontal(layout: squared.base.LayoutUI<T>) {
        const floated = layout.floated;
        if (floated.size === 2 || floated.size === 1 && layout.node.cssAscend('textAlign', true) === 'center' && layout.some(node => node.pageFlow)) {
            return true;
        }
        else if (floated.has('right')) {
            let pageFlow = 0;
            let multiline = false;
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
                pageFlow++;
            }
            return pageFlow > 0;
        }
        else if (floated.has('left') && !layout.linearX) {
            const node = layout.item(0) as T;
            return node.pageFlow && node.floating;
        }
        return false;
    }

    public checkConstraintFloat(layout: squared.base.LayoutUI<T>, horizontal = false) {
        if (layout.length > 1) {
            let A = 0;
            let B = 0;
            for (const node of layout) {
                const excluded = layout.cleared.has(node) || node.renderExclude;
                if (A !== -1 && (node.positiveAxis && (!node.positionRelative || node.positionAuto) && (node.floating || node.autoMargin.horizontal) || excluded)) {
                    A++;
                }
                else {
                    A = -1;
                }
                if (B !== -1 && (node.percentWidth || excluded)) {
                    B++;
                }
                else if (!horizontal) {
                    B = -1;
                }
                if (A <= 0 && B <= 0) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    public checkConstraintHorizontal(layout: squared.base.LayoutUI<T>) {
        const floated = layout.floated;
        let valid = false;
        switch (layout.node.cssInitial('textAlign')) {
            case 'center':
                valid = floated.size === 0;
                break;
            case 'end':
            case 'right':
                valid = floated.size === 0 || floated.has('right') && floated.size === 1 && layout.cleared.size === 0;
                break;
        }
        if (valid || layout.some(node => node.blockVertical || node.percentWidth || (node.verticalAlign === 'middle' || node.verticalAlign === 'bottom') && !layout.parent.hasHeight)) {
            return layout.singleRowAligned && layout.every(node => node.positiveAxis || node.renderExclude);
        }
        return false;
    }

    public checkLinearHorizontal(layout: squared.base.LayoutUI<T>) {
        const floated = layout.floated;
        if ((floated.size === 0 || floated.size === 1 && floated.has('left')) && layout.node.lineHeight === 0 && layout.singleRowAligned) {
            const { fontSize, lineHeight } = layout.item(0) as T;
            for (const node of layout) {
                if (!(node.naturalChild && node.baseline && node.length === 0 && !node.inputElement && !node.positionRelative && !node.blockVertical && !node.positionAuto && node.zIndex === 0 && (lineHeight === 0 || node.lineHeight === lineHeight && node.fontSize === fontSize))) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    public setConstraints() {
        for (const node of this.cache) {
            if (node.layoutRelative) {
                this.processRelativeHorizontal(node, node.renderChildren as T[]);
            }
            else if (node.layoutConstraint) {
                const children = node.renderFilter((item: T) => !item.positioned) as T[];
                if (children.length) {
                    const pageFlow: T[] = [];
                    for (const item of children) {
                        if (item.pageFlow || item.positionAuto) {
                            pageFlow.push(item);
                        }
                        else if (item.leftTopAxis) {
                            setLeftTopAxis(item, node, item.hasWidth, true);
                            setLeftTopAxis(item, node, item.hasHeight, false);
                        }
                    }
                    if (pageFlow.length) {
                        if (node.layoutHorizontal && !node.layoutElement) {
                            this.processConstraintHorizontal(node, pageFlow);
                        }
                        else if (node.hasAlign(NODE_ALIGNMENT.COLUMN)) {
                            this.processConstraintColumn(node, pageFlow);
                        }
                        else if (pageFlow.length > 1) {
                            this.processConstraintChain(node, pageFlow);
                        }
                        else {
                            const item = pageFlow[0];
                            item.anchorParent(STRING_ANDROID.HORIZONTAL);
                            item.anchorParent(STRING_ANDROID.VERTICAL);
                            if (item.rightAligned) {
                                item.anchorStyle(STRING_ANDROID.HORIZONTAL, 'packed', 1, false);
                            }
                            else if (!item.centerAligned) {
                                item.anchorStyle(STRING_ANDROID.HORIZONTAL, 'packed', 0, false);
                            }
                            if (!item.autoMargin.topBottom) {
                                item.anchorStyle(STRING_ANDROID.VERTICAL, 'packed', 0, false);
                            }
                            Controller.setConstraintDimension(item);
                        }
                        this.evaluateAnchors(pageFlow);
                    }
                    for (const item of children) {
                        if (!item.anchored) {
                            if (item.outerWrapper) {
                                const { horizontal, vertical } = item.constraint;
                                if (horizontal) {
                                    item.anchorParent(STRING_ANDROID.HORIZONTAL);
                                }
                                if (vertical) {
                                    item.anchorParent(STRING_ANDROID.VERTICAL);
                                }
                            }
                            else {
                                this.addGuideline(item, node);
                            }
                        }
                    }
                }
            }
        }
    }

    public renderNodeGroup(layout: squared.base.LayoutUI<T>) {
        const { node, containerType, alignmentType } = layout;
        const options = createViewAttribute();
        let valid = false;
        switch (containerType) {
            case CONTAINER_NODE.LINEAR:
                if (hasBit(alignmentType, NODE_ALIGNMENT.VERTICAL)) {
                    options.android.orientation = STRING_ANDROID.VERTICAL;
                    valid = true;
                }
                else if (hasBit(alignmentType, NODE_ALIGNMENT.HORIZONTAL)) {
                    options.android.orientation = STRING_ANDROID.HORIZONTAL;
                    valid = true;
                }
                break;
            case CONTAINER_NODE.GRID: {
                const { columnCount, rowCount } = layout;
                const android = options.android;
                if (rowCount > 0) {
                    android.rowCount = rowCount.toString();
                }
                android.columnCount = columnCount > 0 ? columnCount.toString() : '2';
                valid = true;
                break;
            }
            case CONTAINER_NODE.FRAME:
            case CONTAINER_NODE.RELATIVE:
            case CONTAINER_NODE.CONSTRAINT:
                valid = true;
                break;
            default:
                if (layout.length === 0) {
                    return this.renderNode(layout);
                }
                break;
        }
        if (valid) {
            const dataset = node.dataset;
            const target = !dataset.use && dataset.target
            node.setControlType(View.getControlName(containerType, node.api), containerType);
            node.addAlign(alignmentType);
            node.render(target ? (<squared.base.ApplicationUI<T>> this.application).resolveTarget(target) : layout.parent);
            node.apply(options);
            return <NodeXmlTemplate<T>> {
                type: NODE_TEMPLATE.XML,
                node,
                controlName: node.controlName
            };
        }
        return undefined;
    }

    public renderNode(layout: squared.base.LayoutUI<T>) {
        const { containerType, node } = layout;
        const dataset = node.dataset;
        let controlName = View.getControlName(containerType, node.api);
        node.setControlType(controlName, containerType);
        node.addAlign(layout.alignmentType);
        let parent = layout.parent;
        let target = !dataset.use && dataset.target;
        switch (node.tagName) {
            case 'IMG': {
                const element = <HTMLImageElement> node.element;
                const absoluteParent = node.absoluteParent || node.documentParent;
                let width = node.toFloat('width', 0);
                let height = node.toFloat('height', 0);
                let percentWidth = node.percentWidth ? width : -1;
                const percentHeight = node.percentHeight ? height : -1;
                let scaleType = 'fitXY';
                let imageSet: ImageSrcSet[] | undefined;
                if (element.srcset || node.actualParent?.tagName === 'PICTURE') {
                    imageSet = getSrcSet(element, this.localSettings.supported.imageFormat as string[]);
                    if (imageSet.length) {
                        const image = imageSet[0];
                        const actualWidth = image.actualWidth;
                        if (actualWidth) {
                            if (percentWidth === -1) {
                                [width, height] = setImageDimension(node, actualWidth, width, height, this.application.resourceHandler.getImage(element.src));
                            }
                            else {
                                width = node.bounds.width;
                                node.android('adjustViewBounds', 'true');
                                percentWidth = -1;
                            }
                        }
                        else {
                            const stored = this.application.resourceHandler.getImage(image.src);
                            if (stored) {
                                if (percentWidth === -1) {
                                    [width, height] = setImageDimension(node, stored.width, width, height, stored);
                                }
                                else {
                                    width = node.bounds.width;
                                    node.android('adjustViewBounds', 'true');
                                    percentWidth = -1;
                                }
                            }
                        }
                    }
                    else {
                        imageSet = undefined;
                    }
                }
                if (node.hasResource(NODE_RESOURCE.IMAGE_SOURCE)) {
                    const src = (<android.base.Resource<T>> this.application.resourceHandler).addImageSrc(element, '', imageSet);
                    if (src !== '') {
                        node.android('src', '@drawable/' + src);
                    }
                }
                if (percentWidth !== -1 || percentHeight !== -1) {
                    if (percentWidth >= 0) {
                        width *= absoluteParent.box.width / 100;
                        if (percentWidth < 100 && !parent.layoutConstraint) {
                            node.css('width', formatPX(width));
                            node.android('adjustViewBounds', 'true');
                        }
                    }
                    if (percentHeight >= 0) {
                        height *= absoluteParent.box.height / 100;
                        if (percentHeight < 100 && !(parent.layoutConstraint && absoluteParent.hasHeight)) {
                            node.css('height', formatPX(height));
                            node.android('adjustViewBounds', 'true');
                        }
                    }
                }
                else {
                    switch (node.css('objectFit')) {
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
                    if (width === 0 && height > 0 || height === 0 && width > 0) {
                        node.android('adjustViewBounds', 'true');
                    }
                }
                node.android('scaleType', scaleType);
                if (node.baseline) {
                    node.android('baselineAlignBottom', 'true');
                    if (node.marginBottom > 0 && parent.layoutLinear && parent.layoutHorizontal) {
                        node.mergeGravity('layout_gravity', 'bottom');
                    }
                }
                if (!node.pageFlow && parent === absoluteParent && (node.left < 0 && parent.css('overflowX') === 'hidden' || node.top < 0 && parent.css('overflowY') === 'hidden')) {
                    const application = <squared.base.ApplicationUI<T>> this.application;
                    const container = application.createNode({ parent });
                    container.setControlType(CONTAINER_ANDROID.FRAME, CONTAINER_NODE.FRAME);
                    container.inherit(node, 'base');
                    container.exclude({ resource: NODE_RESOURCE.ALL, procedure: NODE_PROCEDURE.ALL });
                    container.cssApply({ position: node.css('position'), zIndex: node.zIndex.toString() });
                    container.positionAuto = false;
                    parent.appendTry(node, container);
                    node.parent = container;
                    if (width > 0) {
                        container.setLayoutWidth(width < absoluteParent.box.width ? formatPX(width) : 'match_parent');
                    }
                    else {
                        container.setLayoutWidth('wrap_content');
                    }
                    if (height > 0) {
                        container.setLayoutHeight(height < absoluteParent.box.height ? formatPX(height) : 'match_parent');
                    }
                    else {
                        container.setLayoutHeight('wrap_content');
                    }
                    container.render(target ? application.resolveTarget(target) : parent);
                    container.saveAsInitial();
                    container.innerWrapped = node;
                    if (!parent.layoutConstraint) {
                        node.modifyBox(BOX_STANDARD.MARGIN_TOP, node.top);
                        node.modifyBox(BOX_STANDARD.MARGIN_LEFT, node.left);
                    }
                    application.addLayoutTemplate(
                        parent,
                        container,
                        <NodeXmlTemplate<T>> {
                            type: NODE_TEMPLATE.XML,
                            node: container,
                            controlName: CONTAINER_ANDROID.FRAME
                        }
                    );
                    parent = container;
                    layout.parent = container;
                    target = undefined;
                }
                break;
            }
            case 'INPUT': {
                const element = <HTMLInputElement> node.element;
                const type = element.type;
                switch (type) {
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
                }
                break;
            }
            case 'TEXTAREA': {
                const { cols, maxLength, placeholder, rows } = <HTMLTextAreaElement> node.element;
                node.android('minLines', rows > 0 ? rows.toString() : '2');
                switch (node.css('verticalAlign')) {
                    case 'middle':
                        node.mergeGravity('gravity', STRING_ANDROID.CENTER_VERTICAL);
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
                if (!node.hasPX('width') && cols > 0) {
                    node.css('width', formatPX(cols * 8));
                }
                node.android('hint', placeholder);
                node.android('scrollbars', STRING_ANDROID.VERTICAL);
                node.android('inputType', 'textMultiLine');
                if (node.overflowX) {
                    node.android('scrollHorizontally', 'true');
                }
                break;
            }
            case 'LEGEND': {
                if (!node.hasWidth) {
                    node.css('minWidth', formatPX(node.actualWidth), true);
                    node.css('display', 'inline-block', true);
                }
                const offset = node.actualHeight * this.localSettings.deviations.legendBottomOffset;
                node.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, offset);
                node.linear.bottom += offset;
                break;
            }
            case 'METER':
            case 'PROGRESS': {
                const { min, max, value } = <HTMLMeterElement> node.element;
                let foregroundColor: string | undefined;
                let backgroundColor: string | undefined;
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
                node.inlineText = false;
                break;
            }
        }
        switch (controlName) {
            case CONTAINER_ANDROID.TEXT: {
                let overflow = '';
                if (node.overflowX) {
                    overflow += STRING_ANDROID.HORIZONTAL;
                }
                if (node.overflowY) {
                    overflow += (overflow !== '' ? '|' : '') + STRING_ANDROID.VERTICAL;
                }
                if (overflow !== '') {
                    node.android('scrollbars', overflow);
                }
                if (node.has('letterSpacing')) {
                    node.android('letterSpacing', truncate(node.toFloat('letterSpacing') / node.fontSize, this.localSettings.precision.standardFloat));
                }
                if (node.css('textAlign') === 'justify') {
                    node.android('justificationMode', 'inter_word');
                }
                if (node.has('textShadow')) {
                    const match = REGEX_TEXTSHADOW.exec(node.css('textShadow'));
                    if (match) {
                        const color = Resource.addColor(parseColor(match[1] || node.css('color')));
                        if (color !== '') {
                            const precision = this.localSettings.precision.standardFloat;
                            const fontSize = node.fontSize;
                            const shadowRadius = match[4];
                            node.android('shadowColor', '@color/' + color);
                            node.android('shadowDx', truncate(parseUnit(match[2], fontSize) * 2, precision));
                            node.android('shadowDy', truncate(parseUnit(match[3], fontSize) * 2, precision));
                            node.android('shadowRadius', truncate(isString(shadowRadius) ? parseUnit(shadowRadius, fontSize) : 0.01, precision));
                        }
                    }
                }
                if (node.css('whiteSpace') === 'nowrap') {
                    node.android('maxLines', '1');
                    node.android('ellipsize', 'end');
                }
                break;
            }
            case CONTAINER_ANDROID.BUTTON:
                if (!node.hasHeight) {
                    node.android('minHeight', formatPX(Math.ceil(node.actualHeight)));
                }
                node.mergeGravity('gravity', STRING_ANDROID.CENTER_VERTICAL);
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
                            const element = <HTMLInputElement> node.element;
                            const labelElement = <HTMLLabelElement> sibling.element;
                            const labelParent = sibling.documentParent.tagName === 'LABEL' && sibling.documentParent as T;
                            if (element.id && element.id === labelElement.htmlFor) {
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
                if ((<HTMLInputElement> node.element).list?.children.length) {
                    controlName = CONTAINER_ANDROID.EDIT_LIST;
                    node.controlName = controlName;
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
        if (node.inlineVertical && (!parent.layoutHorizontal || parent.layoutLinear)) {
            switch (node.verticalAlign) {
                case 'sub':
                    node.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, Math.floor(node.baselineHeight * this.localSettings.deviations.subscriptBottomOffset) * -1);
                    break;
                case 'super':
                    node.modifyBox(BOX_STANDARD.MARGIN_TOP, Math.floor(node.baselineHeight * this.localSettings.deviations.superscriptTopOffset) * -1);
                    break;
            }
        }
        node.render(target ? this.application.resolveTarget(target) : parent);
        return <NodeXmlTemplate<T>> {
            type: NODE_TEMPLATE.XML,
            node,
            parent,
            controlName
        };
    }

    public renderNodeStatic(controlName: string, options?: ExternalData, width?: string, height?: string, content?: string) {
        const node = new View(0, '0', undefined, this.afterInsertNode);
        node.setControlType(controlName);
        node.setLayoutWidth(width || 'wrap_content');
        node.setLayoutHeight(height || 'wrap_content');
        if (options) {
            node.apply(options);
            options.documentId = node.documentId;
        }
        return this.getEnclosingXmlTag(controlName, this.userSettings.showAttributes ? node.extractAttributes(1) : undefined, content);
    }

    public renderSpace(options: SpacerAttribute) {
        const { android, app, column, columnSpan, row, rowSpan } = options;
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
        if (column !== undefined) {
            android.layout_column = column.toString();
        }
        if (columnSpan) {
            android.layout_columnSpan = columnSpan.toString();
        }
        if (row !== undefined) {
            android.layout_row = row.toString();
        }
        if (rowSpan) {
            android.layout_rowSpan = rowSpan.toString();
        }
        return this.renderNodeStatic(CONTAINER_ANDROID.SPACE, { android, app }, width, height);
    }

    public addGuideline(node: T, parent: T, orientation?: string, percent = false, opposite = false) {
        const absoluteParent = node.absoluteParent as T;
        const boxParent = parent.nodeGroup && !node.documentParent.hasAlign(NODE_ALIGNMENT.AUTO_LAYOUT) ? parent : node.documentParent as T;
        const box = boxParent.box;
        const linear = node.linear;
        const bounds = node.positionStatic ? node.bounds : linear;
        const applyLayout = (value: string, horizontal: boolean) => {
            if (!node.constraint[value] && (!orientation || value === orientation)) {
                let LT: string;
                let RB: string;
                let LTRB: string;
                let RBLT: string;
                if (horizontal) {
                    if (opposite) {
                        LT = 'right';
                        RB = 'left';
                        LTRB = 'rightLeft';
                        RBLT = 'leftRight';
                    }
                    else {
                        LT = 'left';
                        RB = 'right';
                        LTRB = 'leftRight';
                        RBLT = 'rightLeft';
                    }
                }
                else {
                    if (opposite) {
                        LT = 'bottom';
                        RB = 'top';
                        LTRB = 'bottomTop';
                        RBLT = 'topBottom';
                    }
                    else {
                        LT = 'top';
                        RB = 'bottom';
                        LTRB = 'topBottom';
                        RBLT = 'bottomTop';
                    }
                }
                if (withinRange(linear[LT], box[LT])) {
                    node.anchor(LT, 'parent', true);
                    return;
                }
                let beginPercent = 'layout_constraintGuide_';
                let location: number;
                if (!percent && !parent.hasAlign(NODE_ALIGNMENT.AUTO_LAYOUT)) {
                    const found = parent.renderChildren.some(item => {
                        if (item !== node && item.constraint[value]) {
                            let valid = false;
                            if (node.pageFlow && item.pageFlow) {
                                if (withinRange(linear[LT], item.linear[RB])) {
                                    node.anchor(LTRB, item.documentId, true);
                                    valid = true;
                                }
                                else if (withinRange(linear[RB], item.linear[LT])) {
                                    node.anchor(RBLT, item.documentId, true);
                                    valid = true;
                                }
                            }
                            if (!valid) {
                                if (withinRange(node.bounds[LT], item.bounds[LT])) {
                                    if (!horizontal && node.textElement && node.baseline && item.textElement && item.baseline) {
                                        node.anchor('baseline', item.documentId, true);
                                    }
                                    else {
                                        node.anchor(LT, item.documentId, true);
                                        if (horizontal) {
                                            node.modifyBox(BOX_STANDARD.MARGIN_LEFT, -item.marginLeft, false);
                                        }
                                        else {
                                            node.modifyBox(BOX_STANDARD.MARGIN_TOP, -item.marginTop, false);
                                        }
                                    }
                                    valid = true;
                                }
                                else if (withinRange(node.bounds[RB], item.bounds[RB])) {
                                    node.anchor(RB, item.documentId, true);
                                    node.modifyBox(horizontal ? BOX_STANDARD.MARGIN_RIGHT : BOX_STANDARD.MARGIN_BOTTOM);
                                    valid = true;
                                }
                                else if (!node.pageFlow && item.pageFlow && withinRange(node.bounds[LT] + node[LT], item.bounds[LT])) {
                                    node.anchor(LT, item.documentId, true);
                                    node.modifyBox(horizontal ? BOX_STANDARD.MARGIN_LEFT : BOX_STANDARD.MARGIN_TOP, node[LT]);
                                    valid = true;
                                }
                            }
                            if (valid) {
                                item.constraint[value] = true;
                                return true;
                            }
                        }
                        return false;
                    });
                    if (found) {
                        return;
                    }
                }
                if (node.positionAuto) {
                    const siblingsLeading = node.siblingsLeading;
                    if (siblingsLeading.length && !node.alignedVertically()) {
                        const previousSibling = siblingsLeading[0] as T;
                        if (previousSibling.renderParent === node.renderParent) {
                            node.anchor(horizontal ? 'rightLeft' : 'top', previousSibling.documentId, true);
                            node.constraint[value] = previousSibling.constraint[value];
                            return;
                        }
                    }
                }
                if (percent) {
                    const position = Math.abs(bounds[LT] - box[LT]) / box[horizontal ? 'width' : 'height'];
                    location = parseFloat(truncate(opposite ? 1 - position : position, this.localSettings.precision.standardFloat));
                    beginPercent += 'percent';
                }
                else {
                    location = bounds[LT] - box[!opposite ? LT : RB];
                    if (!horizontal && !boxParent.nodeGroup) {
                        if (boxParent !== absoluteParent) {
                            if (!absoluteParent.positionRelative && absoluteParent.getBox(BOX_STANDARD.MARGIN_TOP)[0] === 1) {
                                location -= absoluteParent.marginTop;
                            }
                        }
                        else if (!node.hasPX('top')) {
                            const previousSibling = node.previousSibling;
                            if (previousSibling?.blockStatic) {
                                location += previousSibling.marginBottom;
                            }
                        }
                    }
                    beginPercent += 'begin';
                }
                const guideline = parent.constraint.guideline || {};
                if (!node.pageFlow) {
                    if (node.parent === boxParent.outerMostWrapper) {
                        location += boxParent[!opposite ? (horizontal ? 'paddingLeft' : 'paddingTop') : (horizontal ? 'paddingRight' : 'paddingBottom')];
                    }
                    else if (absoluteParent === node.documentParent) {
                        let direction: number;
                        if (horizontal) {
                            direction = !opposite ? BOX_STANDARD.PADDING_LEFT : BOX_STANDARD.PADDING_RIGHT;
                        }
                        else {
                            direction = !opposite ? BOX_STANDARD.PADDING_TOP : BOX_STANDARD.PADDING_BOTTOM;
                        }
                        location = adjustAbsolutePaddingOffset(boxParent, direction, location);
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
                    node.modifyBox(BOX_STANDARD.MARGIN_TOP);
                }
                node.constraint[value] = true;
                if (location <= 0) {
                    node.anchor(LT, 'parent', true);
                    if (location < 0) {
                        const innerWrapped = node.innerMostWrapped;
                        if (innerWrapped?.pageFlow === false) {
                            let boxMargin = 0;
                            switch (LT) {
                                case 'top':
                                    boxMargin = BOX_STANDARD.MARGIN_TOP;
                                    break;
                                case 'left':
                                    boxMargin = BOX_STANDARD.MARGIN_LEFT;
                                    break;
                                case 'bottom':
                                    boxMargin = BOX_STANDARD.MARGIN_BOTTOM;
                                    break;
                                case 'right':
                                    boxMargin = BOX_STANDARD.MARGIN_RIGHT;
                                    break;
                            }
                            innerWrapped.modifyBox(boxMargin, location);
                        }
                    }
                }
                else if (horizontal && location + bounds.width >= box.right && boxParent.hasPX('width') && !node.hasPX('right') || !horizontal && location + bounds.height >= box.bottom && boxParent.hasPX('height') && !node.hasPX('bottom')) {
                    node.anchor(RB, 'parent', true);
                }
                else {
                    const anchors = optionalAsObject(guideline, `${value}.${beginPercent}.${LT}`);
                    if (anchors) {
                        for (const id in anchors) {
                            if (parseInt(anchors[id]) === location) {
                                node.anchor(LT, id, true);
                                node.anchorDelete(RB);
                                return;
                            }
                        }
                    }
                    let resourceValue: string;
                    if (percent) {
                        resourceValue = location.toString();
                    }
                    else {
                        resourceValue = '@dimen/' + Resource.insertStoredAsset('dimens', 'constraint_guideline_' + (!opposite ? LT : RB), formatPX(location));
                    }
                    const options = createViewAttribute(undefined, {
                        android: {
                            orientation: horizontal ? STRING_ANDROID.VERTICAL : STRING_ANDROID.HORIZONTAL
                        },
                        app: {
                            [beginPercent]: resourceValue
                        }
                    });
                    this.addAfterOutsideTemplate(node.id, this.renderNodeStatic(node.api < BUILD_ANDROID.Q ? CONTAINER_ANDROID.GUIDELINE : CONTAINER_ANDROID_X.GUIDELINE, options), false);
                    const documentId = options.documentId;
                    if (documentId) {
                        node.anchor(LT, documentId, true);
                        node.anchorDelete(RB);
                        if (location > 0) {
                            assignEmptyValue(guideline, value, beginPercent, LT, documentId, location.toString());
                            parent.constraint.guideline = guideline;
                        }
                    }
                }
            }
        };
        applyLayout(STRING_ANDROID.HORIZONTAL, true);
        applyLayout(STRING_ANDROID.VERTICAL, false);
    }

    public addBarrier(nodes: T[], barrierDirection: string) {
        const unbound = [];
        for (const node of nodes) {
            const barrier = node.constraint.barrier;
            if (barrier === undefined) {
                node.constraint.barrier = {};
            }
            else if (barrier[barrierDirection]) {
                continue;
            }
            unbound.push(node);
        }
        if (unbound.length) {
            const options = createViewAttribute(undefined, {
                android: {},
                app: {
                    barrierDirection,
                    constraint_referenced_ids: objectMap(unbound, item => getDocumentId(item.documentId)).join(',')
                }
            });
            const target = unbound[unbound.length - 1];
            this.addAfterOutsideTemplate(target.id, this.renderNodeStatic(target.api < BUILD_ANDROID.Q ? CONTAINER_ANDROID.BARRIER : CONTAINER_ANDROID_X.BARRIER, options), false);
            for (const node of unbound) {
                (node.constraint.barrier as {})[barrierDirection] = options.documentId;
            }
            return options.documentId;
        }
        return '';
    }

    public evaluateAnchors(nodes: T[]) {
        const horizontal: T[] = [];
        const vertical: T[] = [];
        for (const node of nodes) {
            if (node.constraint.horizontal) {
                horizontal.push(node);
            }
            if (node.constraint.vertical) {
                vertical.push(node);
            }
            if (node.alignParent('top')) {
                let current = node;
                do {
                    const bottomTop = current.alignSibling('bottomTop');
                    if (bottomTop !== '') {
                        const next = nodes.find(item => item.documentId === bottomTop);
                        if (next?.alignSibling('topBottom') === current.documentId) {
                            if (next.alignParent('bottom')) {
                                node.anchorStyle(STRING_ANDROID.VERTICAL, 'packed', 0, false);
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
                        if (current !== node) {
                            const barrier = current.constraint.barrier;
                            let documentId: string | undefined;
                            if (barrier === undefined || !barrier.bottom) {
                                documentId = this.addBarrier([current], 'bottom');
                            }
                            else {
                                documentId = barrier.bottom;
                            }
                            if (documentId) {
                                current.anchor('bottomTop', documentId);
                            }
                        }
                        break;
                    }
                }
                while (true);
            }
        }
        let i = -1;
        while (++i < nodes.length) {
            const node = nodes[i];
            const constraint = node.constraint;
            const current = constraint.current;
            if (!constraint.horizontal) {
                for (const attr in current) {
                    const position = current[attr];
                    if (position.horizontal && horizontal.some(item => item.documentId === position.documentId)) {
                        constraint.horizontal = true;
                        horizontal.push(node);
                        i = -1;
                        break;
                    }
                }
            }
            if (!constraint.vertical) {
                for (const attr in current) {
                    const position = current[attr];
                    if (!position.horizontal && vertical.some(item => item.documentId === position.documentId)) {
                        constraint.vertical = true;
                        vertical.push(node);
                        i = -1;
                        break;
                    }
                }
            }
        }
    }

    public createNodeGroup(node: T, children: T[], parent?: T, traverse = false) {
        const group = new ViewGroup(this.cache.nextId, node, children, this.afterInsertNode) as T;
        if (parent) {
            parent.appendTry(node, group);
            group.init();
        }
        else {
            group.containerIndex = node.containerIndex;
        }
        this.cache.append(group, traverse);
        return group;
    }

    public createNodeWrapper(node: T, parent: T, children?: T[], options: WrapperOptions = {}) {
        const container = this.application.createNode({ parent, children, append: true });
        container.addAlign(NODE_ALIGNMENT.WRAPPER);
        if (node.documentRoot) {
            container.documentRoot = true;
            node.documentRoot = false;
        }
        if (parent.naturalElement && container.actualParent === null) {
            container.actualParent = parent;
        }
        container.inherit(node, 'base', 'alignment');
        const { controlName, containerType } = options;
        let { resource, procedure, section } = options;
        if (resource === undefined) {
            resource = NODE_RESOURCE.BOX_STYLE | NODE_RESOURCE.ASSET;
        }
        if (procedure === undefined) {
            procedure = NODE_PROCEDURE.CUSTOMIZATION;
        }
        if (section === undefined) {
            section = APP_SECTION.ALL;
        }
        if (controlName) {
            container.setControlType(controlName, containerType);
        }
        container.exclude({ resource, procedure, section });
        parent.appendTry(node, container);
        node.parent = container;
        const { documentParent, renderParent } = node;
        if (renderParent) {
            const renderTemplates = renderParent.renderTemplates;
            if (renderTemplates) {
                const length = renderTemplates.length;
                for (let i = 0; i < length; i++) {
                    if (renderTemplates[i]?.node === node) {
                        node.renderChildren.splice(i, 1);
                        renderTemplates.splice(i, 1);
                        break;
                    }
                }
            }
            node.rendered = false;
            node.renderParent = undefined;
        }
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
        if (documentParent.layoutElement) {
            if (documentParent.gridElement) {
                if (node.innerWrapped) {
                    node.transferBox(BOX_STANDARD.MARGIN, container);
                }
                else {
                    node.resetBox(BOX_STANDARD.MARGIN, container);
                }
            }
            const android = node.namespace('android');
            for (const attr in android) {
                if (/^layout_/.test(attr)) {
                    container.android(attr, android[attr]);
                    delete android[attr];
                }
            }
            node.transferBox(BOX_STANDARD.MARGIN, container);
        }
        container.innerWrapped = node;
        return container;
    }

    protected processRelativeHorizontal(node: T, children: T[]) {
        const rowsLeft: T[][] = [];
        const checkLineWrap = node.css('whiteSpace') !== 'nowrap';
        let alignmentMultiLine = false;
        let sortPositionAuto = false;
        let rowsRight: T[][] | undefined;
        if (node.hasAlign(NODE_ALIGNMENT.VERTICAL)) {
            let previous: T | undefined;
            for (const item of children) {
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
                    sortPositionAuto = true;
                }
            }
        }
        else {
            const boxWidth = (() => {
                const renderParent = node.renderParent as T;
                if (renderParent.overflowY) {
                    return renderParent.box.width;
                }
                else {
                    const parent = node.actualParent as T | null;
                    if (parent) {
                        if (node.naturalElement && node.inlineStatic && parent.blockStatic && parent === renderParent) {
                            const box = parent.box;
                            return box.width - (node.linear.left - box.left);
                        }
                        else if (parent.floatContainer) {
                            const { containerType, alignmentType } = this.containerTypeVerticalMargin;
                            const container = node.ascend({ condition: (item: T) => item.of(containerType, alignmentType), including: parent, attr: 'renderParent' });
                            if (container.length) {
                                const box = node.box;
                                let leftOffset = 0;
                                let rightOffset = 0;
                                for (const item of parent.naturalElements as T[]) {
                                    const linear = item.linear;
                                    if (item.floating && !children.includes(item) && node.intersectY(linear)) {
                                        if (item.float === 'left') {
                                            if (Math.floor(linear.right) > box.left) {
                                                leftOffset = Math.max(leftOffset, linear.right - box.left);
                                            }
                                        }
                                        else if (item.float === 'right' && box.right > Math.ceil(linear.left)) {
                                            rightOffset = Math.max(rightOffset, box.right - linear.left);
                                        }
                                    }
                                }
                                return box.width - leftOffset - rightOffset;
                            }
                        }
                    }
                }
                return node.box.width;
            })();
            const cleared = NodeUI.linearData(children, true).cleared;
            const centerAligned = node.cssInitial('textAlign') === 'center';
            let textIndent = 0;
            if (node.naturalElement) {
                if (node.blockDimension) {
                    textIndent = node.parseUnit(node.css('textIndent'));
                }
            }
            else {
                const parent = node.parent as T;
                if (parent?.blockDimension && parent.firstChild === node) {
                    const value = parent.css('textIndent');
                    textIndent = node.parseUnit(value);
                    if (textIndent !== 0) {
                        if (textIndent < 0) {
                            parent.setCacheValue('paddingLeft', Math.max(0, parent.paddingLeft + textIndent));
                        }
                        node.setCacheValue('blockDimension', true);
                        node.css('textIndent', value);
                        parent.css('textIndent', '0px');
                    }
                }
            }
            let rowWidth = 0;
            let previousRowLeft: T | undefined;
            let textIndentSpacing = false;
            partitionArray(children, item => item.float !== 'right').forEach((seg, index) => {
                const length = seg.length;
                if (length === 0) {
                    return;
                }
                const leftAlign = index === 0;
                let leftForward = true;
                let alignParent: string;
                let rows: T[][];
                if (leftAlign) {
                    if (seg[0].actualParent?.cssInitialAny('textAlign', 'right', 'end')) {
                        alignParent = 'right';
                        leftForward = false;
                        seg[length - 1].anchor(alignParent, 'true');
                    }
                    else {
                        alignParent = 'left';
                    }
                    sortHorizontalFloat(seg);
                    rows = rowsLeft;
                }
                else {
                    alignParent = 'right';
                    rowsRight = [];
                    rows = rowsRight;
                }
                let previous!: T;
                for (let i = 0; i < length; i++) {
                    const item = seg[i];
                    let alignSibling: string;
                    if (leftAlign && leftForward) {
                        alignSibling = 'leftRight';
                        if (i === 0 && item.inline && Math.abs(textIndent) > item.actualWidth && item.float !== 'right' && !item.positionRelative) {
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
                        sortPositionAuto = true;
                        continue;
                    }
                    let bounds = item.bounds;
                    let siblings: Element[] | undefined;
                    if (item.styleText && !item.hasPX('width')) {
                        const textBounds = item.textBounds;
                        if (textBounds && (<number> textBounds.numberOfLines > 1 || Math.ceil(textBounds.width) < item.box.width)) {
                            bounds = textBounds;
                        }
                    }
                    let multiline = item.multiline;
                    if (multiline && Math.floor(bounds.width) <= boxWidth && !item.hasPX('width') && !isMultiline(item)) {
                        multiline = false;
                        item.multiline = false;
                    }
                    let anchored = item.autoMargin.horizontal;
                    if (anchored) {
                        const autoMargin = item.autoMargin;
                        if (autoMargin.leftRight) {
                            item.anchor('centerHorizontal', 'true');
                        }
                        else if (autoMargin.left) {
                            item.anchor('right', 'true');
                        }
                        else {
                            item.anchor('left', 'true');
                        }
                    }
                    if (previous) {
                        const items = rows[rows.length - 1];
                        let maxWidth = 0;
                        let baseWidth = 0;
                        const checkFloatWrap = () => {
                            if (previous.floating && previous.alignParent('left') && (multiline || Math.floor(rowWidth + item.actualWidth) < boxWidth)) {
                                return true;
                            }
                            else if (node.floating && i === length - 1 && item.textElement && !/\s|-/.test(item.textContent.trim())) {
                                if (node.hasPX('width')) {
                                    const width = node.css('width');
                                    if (node.parseUnit(width) > node.parseUnit(node.css('minWidth'))) {
                                        node.cssApply({ width: 'auto', minWidth: width });
                                    }
                                }
                                node.android('maxLines', '1');
                                return true;
                            }
                            return false;
                        };
                        const checkWrapWidth = () => {
                            baseWidth = rowWidth + item.marginLeft;
                            if (previousRowLeft && !items.includes(previousRowLeft)) {
                                baseWidth += previousRowLeft.linear.width;
                            }
                            if (previousRowLeft === undefined || !item.plainText || multiline || !items.includes(previousRowLeft) || cleared.has(item)) {
                                baseWidth += bounds.width;
                            }
                            if (item.marginRight < 0) {
                                baseWidth += item.marginRight;
                            }
                            maxWidth = boxWidth;
                            if (textIndent < 0) {
                                if (rows.length <= 1) {
                                    maxWidth += textIndent;
                                }
                            }
                            else if (textIndent > 0 && rows.length === 1) {
                                maxWidth -= textIndent;
                            }
                            if (item.styleElement && item.inlineStatic) {
                                baseWidth -= item.contentBoxWidth;
                            }
                            maxWidth = Math.ceil(maxWidth);
                            return true;
                        };
                        if (previous.floating && adjustFloatingNegativeMargin(item, previous)) {
                            alignSibling = '';
                        }
                        const viewGroup = item.nodeGroup && !item.hasAlign(NODE_ALIGNMENT.SEGMENTED);
                        let retainMultiline = false;
                        siblings = item.inlineVertical && previous.inlineVertical && item.previousSibling !== previous ? getElementsBetweenSiblings(previous.element, <Element> item.element) : undefined;
                        const startNewRow = () => {
                            if (previous.textElement) {
                                if (i === 1 && item.plainText && item.previousSibling === previous && !CHAR.TRAILINGSPACE.test(previous.textContent) && !CHAR.LEADINGSPACE.test(item.textContent)) {
                                    retainMultiline = true;
                                    return false;
                                }
                                else if (checkLineWrap) {
                                    if (previous.multiline && (previous.bounds.width >= boxWidth || item.plainText && Resource.hasLineBreak(previous, false, true))) {
                                        return true;
                                    }
                                }
                            }
                            if (checkFloatWrap()) {
                                return false;
                            }
                            else if (checkLineWrap) {
                                if (checkWrapWidth() && baseWidth > maxWidth) {
                                    return true;
                                }
                                else if (item.actualParent?.tagName !== 'CODE') {
                                    return multiline && item.plainText || isMultiline(item);
                                }
                            }
                            return false;
                        };
                        const textNewRow = item.textElement && startNewRow();
                        if (textNewRow ||
                            viewGroup ||
                            aboveRange(item.linear.top, previous.linear.bottom) && (item.blockStatic || item.floating && previous.float === item.float) ||
                            !item.textElement && !checkFloatWrap() && checkWrapWidth() && Math.floor(baseWidth) > maxWidth ||
                            !item.floating && (previous.blockStatic || item.previousSiblings().some(sibling => sibling.lineBreak || sibling.excluded && sibling.blockStatic) || siblings?.some(element => causesLineBreak(element, node.sessionId))) ||
                            previous.autoMargin.horizontal ||
                            cleared.has(item))
                        {
                            if (leftForward) {
                                if (previousRowLeft && (item.linear.bottom <= previousRowLeft.bounds.bottom || textIndentSpacing)) {
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
                            if (items.length === 1 && (previous.centerAligned || centerAligned && !previous.blockStatic)) {
                                previous.anchorDelete(alignParent);
                                previous.anchor('centerHorizontal', 'true');
                            }
                            rowWidth = Math.min(0, textNewRow && !previous.multiline && multiline && !cleared.has(item) ? item.linear.right - node.box.right : 0);
                            rows.push([item]);
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
                        rows.push([item]);
                    }
                    if (item.float === 'left' && leftAlign) {
                        if (previousRowLeft) {
                            if (aboveRange(item.linear.bottom, previousRowLeft.linear.bottom)) {
                                previousRowLeft = item;
                            }
                        }
                        else {
                            previousRowLeft = item;
                        }
                    }
                    if (siblings && !siblings.some(element => !!getElementAsNode(element, item.sessionId) || causesLineBreak(element, item.sessionId))) {
                        const betweenStart = getRangeClientRect(siblings[0]);
                        if (!betweenStart.numberOfLines) {
                            const betweenEnd = siblings.length > 1 ? getRangeClientRect(siblings[siblings.length - 1]) : undefined;
                            if (betweenEnd === undefined || !betweenEnd.numberOfLines) {
                                rowWidth += betweenEnd ? betweenStart.left - betweenEnd.right : betweenStart.width;
                            }
                        }
                    }
                    rowWidth += item.marginLeft + bounds.width + item.marginRight;
                    previous = item;
                }
            });
            if (rowsLeft.length === 1 && textIndent < 0) {
                node.setCacheValue('paddingLeft', Math.max(0, node.paddingLeft + textIndent));
            }
        }
        if (rowsLeft.length > 1 || rowsRight && rowsRight.length > 1) {
            alignmentMultiLine = true;
        }
        const setVerticalAlign = (rows: T[][]) => {
            let previousBaseline: T | null = null;
            const length = rows.length;
            const singleRow = length === 1 && !node.hasHeight;
            for (let i = 0; i < length; i++) {
                const items = rows[i];
                let baseline: T | null;
                if (items.length > 1) {
                    const bottomAligned = getTextBottom(items);
                    let textBottom = bottomAligned[0] as T | undefined;
                    baseline = NodeUI.baseline(bottomAligned.length ? items.filter(item => !bottomAligned.includes(item)) : items);
                    if (baseline && textBottom) {
                        if (baseline !== textBottom && textBottom.bounds.height > baseline.bounds.height) {
                            baseline.anchor('bottom', textBottom.documentId);
                        }
                        else {
                            baseline = NodeUI.baseline(items);
                            textBottom = undefined;
                        }
                    }
                    const baselineAlign: T[] = [];
                    let documentId = i === 0 ? 'true' : (baseline ? baseline.documentId : '');
                    let maxCenterHeight = 0;
                    let textBaseline: T | null = null;
                    for (const item of items) {
                        if (item !== baseline && item !== textBottom) {
                            if (item.baseline) {
                                baselineAlign.push(item);
                            }
                            else if (item.inlineVertical) {
                                switch (item.verticalAlign) {
                                    case 'text-top':
                                        if (textBaseline === null) {
                                            textBaseline = NodeUI.baseline(items, true);
                                        }
                                        if (textBaseline) {
                                            if (item !== textBaseline) {
                                                item.anchor('top', textBaseline.documentId);
                                                break;
                                            }
                                        }
                                        break;
                                    case 'super':
                                        if (!item.baselineAltered) {
                                            item.modifyBox(BOX_STANDARD.MARGIN_TOP, Math.floor(item.baselineHeight * this.localSettings.deviations.superscriptTopOffset) * -1);
                                        }
                                    case 'top':
                                        if (documentId !== '' && documentId !== item.documentId) {
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
                                                item.modifyBox(BOX_STANDARD.MARGIN_TOP);
                                                item.modifyBox(BOX_STANDARD.MARGIN_TOP, Math.round((heightParent - height) / 2));
                                            }
                                            else if (height > maxCenterHeight) {
                                                maxCenterHeight = height;
                                            }
                                        }
                                        break;
                                    }
                                    case 'text-bottom':
                                        if (textBaseline === null) {
                                            textBaseline = NodeUI.baseline(items, true);
                                        }
                                        if (textBaseline !== item && textBaseline) {
                                            item.anchor('bottom', textBaseline.documentId);
                                        }
                                        else if (baseline) {
                                            item.anchor('bottom', baseline.documentId);
                                        }
                                        break;
                                    case 'sub':
                                        if (!item.baselineAltered) {
                                            item.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, Math.ceil(item.baselineHeight * this.localSettings.deviations.subscriptBottomOffset) * -1);
                                        }
                                    case 'bottom':
                                        if (documentId !== '' && !withinRange(node.bounds.height, item.bounds.height)) {
                                            if (!node.hasHeight && documentId === 'true') {
                                                if (!alignmentMultiLine) {
                                                    node.css('height', formatPX(node.bounds.height));
                                                }
                                                else if (baseline) {
                                                    documentId = baseline.documentId;
                                                }
                                            }
                                            item.anchor('bottom', documentId);
                                        }
                                        break;
                                    default:
                                        if (!item.baselineAltered) {
                                            baselineAlign.push(item);
                                        }
                                        break;
                                }
                            }
                            else if (isLayoutBaselineAligned(item)) {
                                baselineAlign.push(item);
                            }
                            else if (i === 0) {
                                item.anchor('top', 'true');
                            }
                        }
                    }
                    const lengthA = baselineAlign.length;
                    if (baseline) {
                        baseline.baselineActive = true;
                        if (lengthA) {
                            adjustBaseline(baseline, baselineAlign, singleRow, node.box.top);
                            if (singleRow && baseline.is(CONTAINER_NODE.BUTTON)) {
                                baseline.anchor('centerVertical', 'true');
                                baseline = null;
                            }
                        }
                        else if (baseline.textElement && maxCenterHeight > baseline.actualHeight) {
                            baseline.anchor('centerVertical', 'true');
                            baseline = null;
                        }
                    }
                    else if (lengthA > 0 && lengthA < items.length) {
                        textBottom = getTextBottom(items)[0] as T;
                        if (textBottom) {
                            for (const item of baselineAlign) {
                                if (item.baseline && !item.multiline && textBottom.bounds.height > item.bounds.height) {
                                    item.anchor('bottom', textBottom.documentId);
                                }
                            }
                        }
                    }
                    for (let j = items.length - 1, isLast = true; j > 0; j--) {
                        const previous = items[j];
                        if (previous.textElement) {
                            previous.setSingleLine(isLast && !previous.rightAligned && !previous.centerAligned);
                            isLast = false;
                        }
                    }
                }
                else {
                    baseline = items[0];
                    baseline.baselineActive = true;
                }
                if (i > 0) {
                    const previousRow = rows[i - 1];
                    if (previousBaseline === null) {
                        previousBaseline = previousRow.find(sibling => !sibling.floating) || previousRow[0];
                    }
                    for (const sibling of previousRow) {
                        if (sibling.baselineHeight >= previousBaseline.baselineHeight && sibling.linear.bottom >= previousBaseline.linear.bottom && (!sibling.floating || previousBaseline.floating)) {
                            previousBaseline = sibling;
                        }
                    }
                    for (const item of items) {
                        if (item.alignSibling('baseline') === '') {
                            item.anchor('topBottom', previousBaseline.documentId);
                        }
                    }
                }
                previousBaseline = baseline;
            }
        };
        setVerticalAlign(rowsLeft);
        if (rowsRight) {
            setVerticalAlign(rowsRight);
        }
        if (alignmentMultiLine) {
            node.horizontalRows = rowsRight ? rowsLeft.concat(rowsRight) : rowsLeft;
        }
        if (sortPositionAuto) {
            const renderChildren = node.renderChildren;
            const renderTemplates = <NodeTemplate<T>[]> node.renderTemplates;
            const positionAuto: NodeTemplate<T>[] = [];
            for (let i = 0; i < renderChildren.length; i++) {
                if (!renderChildren[i].pageFlow) {
                    positionAuto.push(renderTemplates[i]);
                    renderChildren.splice(i, 1);
                    renderTemplates.splice(i--, 1);
                }
            }
            for (const item of positionAuto) {
                renderChildren.push(item.node);
                renderTemplates.push(item);
            }
        }
    }

    protected processConstraintHorizontal(node: T, children: T[]) {
        const baseline = NodeUI.baseline(children);
        const textBaseline = NodeUI.baseline(children, true);
        const reverse = node.hasAlign(NODE_ALIGNMENT.RIGHT);
        const textBottom = getTextBottom(children)[0];
        const documentId = baseline ? baseline.documentId : '';
        const [anchorStart, anchorEnd, chainStart, chainEnd] = getAnchorDirection(reverse);
        let percentWidth = View.availablePercent(children, 'width', node.box.width);
        let bias = 0;
        switch (node.cssAscend('textAlign', true)) {
            case 'center':
                bias = 0.5;
                break;
            case 'right':
            case 'end':
                if (!reverse) {
                    bias = 1;
                }
                break;
        }
        sortHorizontalFloat(children);
        if (!node.hasPX('width') && children.some(item => item.percentWidth)) {
            node.setLayoutWidth('match_parent');
        }
        let tallest: T | undefined;
        let bottom: T | undefined;
        let previous: T | undefined;
        const length = children.length;
        for (let i = 0; i < length; i++) {
            const item = children[i];
            if (previous) {
                if (item.pageFlow) {
                    previous.anchor(chainEnd, item.documentId);
                    item.anchor(chainStart, previous.documentId);
                    if (i === length - 1) {
                        item.anchor(anchorEnd, 'parent');
                    }
                }
                else if (item.positionAuto) {
                    item.anchor(chainStart, previous.documentId);
                }
            }
            else {
                item.anchor(anchorStart, 'parent');
                item.anchorStyle(STRING_ANDROID.HORIZONTAL, 'packed', bias);
            }
            if (item.pageFlow) {
                if (item !== baseline) {
                    if (item.inlineVertical) {
                        let alignTop = false;
                        if (tallest === undefined || getMaxHeight(item) > getMaxHeight(tallest)) {
                            tallest = item;
                        }
                        switch (item.verticalAlign) {
                            case 'text-top':
                                if (textBaseline && item !== textBaseline) {
                                    item.anchor('top', textBaseline.documentId);
                                }
                                else {
                                    alignTop = true;
                                }
                                break;
                            case 'middle':
                                if (baseline?.textElement === false || textBottom) {
                                    alignTop = true;
                                }
                                else {
                                    item.anchorParent(STRING_ANDROID.VERTICAL);
                                }
                                break;
                            case 'text-bottom':
                                if (textBaseline && item !== textBaseline) {
                                    if (item !== textBottom) {
                                        item.anchor('bottom', textBaseline.documentId);
                                    }
                                    else if (textBottom) {
                                        alignTop = true;
                                    }
                                    break;
                                }
                            case 'bottom':
                                if (bottom === undefined) {
                                    for (const child of children) {
                                        if (!child.baseline && (bottom === undefined || child.linear.bottom > bottom.linear.bottom)) {
                                            bottom = child;
                                        }
                                    }
                                }
                                if (item === bottom) {
                                    alignTop = true;
                                }
                                else {
                                    item.anchor('bottom', 'parent');
                                }
                                break;
                            case 'baseline':
                                if (baseline === null || item.blockVertical || !item.textElement && getMaxHeight(item) > getMaxHeight(baseline)) {
                                    alignTop = true;
                                }
                                else {
                                    item.anchor('baseline', documentId);
                                }
                                break;
                            default:
                                alignTop = true;
                                break;
                        }
                        if (alignTop) {
                            item.anchorParent(STRING_ANDROID.VERTICAL, 'packed');
                            item.modifyBox(BOX_STANDARD.MARGIN_TOP, item.linear.top - node.box.top);
                            item.baselineAltered = true;
                        }
                    }
                    else if (item.plainText && baseline) {
                        item.anchor('baseline', documentId);
                    }
                    else {
                        item.anchorParent(STRING_ANDROID.VERTICAL, 'packed');
                    }
                    item.anchored = true;
                }
                else {
                    baseline.baselineActive = true;
                }
                percentWidth = Controller.setConstraintDimension(item, percentWidth);
                previous = item;
            }
            else if (item.positionAuto) {
                item.anchorParent(STRING_ANDROID.VERTICAL, 'packed');
                item.anchored = true;
            }
        }
        if (baseline) {
            if (tallest && tallest !== baseline && baseline.textElement && getMaxHeight(tallest) > getMaxHeight(baseline)) {
                switch (tallest.verticalAlign) {
                    case 'middle':
                        baseline.anchorParent(STRING_ANDROID.VERTICAL, undefined, undefined, true);
                        break;
                    case 'baseline':
                        baseline.anchor('baseline', tallest.documentId);
                        break;
                    case 'bottom':
                    case 'text-bottom':
                        baseline.anchor('bottom', tallest.documentId);
                        break;
                    case 'sub':
                        if (!tallest.textElement) {
                            baseline.anchor('bottom', tallest.documentId);
                            baseline.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, Math.floor(baseline.baselineHeight * this.localSettings.deviations.subscriptBottomOffset) * -1);
                        }
                        break;
                    case 'super':
                        if (!tallest.textElement) {
                            baseline.anchor('bottom', tallest.documentId);
                            baseline.modifyBox(BOX_STANDARD.MARGIN_TOP, Math.floor(baseline.baselineHeight * this.localSettings.deviations.superscriptTopOffset) * -1);
                        }
                        break;
                }
            }
            else {
                baseline.anchorParent(STRING_ANDROID.VERTICAL, 'packed');
                baseline.modifyBox(BOX_STANDARD.MARGIN_TOP, Math.floor(baseline.linear.top - node.box.top));
            }
            baseline.anchored = true;
        }
    }

    protected processConstraintColumn(node: T, children: T[]) {
        let items: T[] = [];
        const rows: T[][] = [items];
        for (const item of children) {
            if (item.css('columnSpan') === 'all') {
                if (items.length) {
                    rows.push([item]);
                }
                else {
                    items.push(item);
                }
                items = [];
                rows.push(items);
            }
            else {
                items.push(item);
            }
        }
        if (items.length === 0) {
            rows.pop();
        }
        const columnGap = node.parseUnit(node.css('columnGap')) || node.fontSize;
        const columnWidth = node.parseUnit(node.css('columnWidth'), 'width');
        const columnCount = node.toInt('columnCount');
        let columnSized = 0;
        if (columnWidth > 0) {
            let boxWidth: number;
            if (isUserAgent(USER_AGENT.SAFARI)) {
                boxWidth = Math.min(node.width > 0 ? node.width - node.contentBoxWidth : Number.POSITIVE_INFINITY, node.box.width * (columnCount || 1), node.documentParent.box.width - node.contentBoxWidth);
            }
            else {
                boxWidth = node.box.width;
            }
            while (boxWidth - columnWidth >= 0) {
                columnSized++;
                boxWidth -= columnWidth + columnGap;
            }
        }
        else {
            columnSized = Number.POSITIVE_INFINITY;
        }
        let previousRow: T | string | undefined;
        const length = rows.length;
        for (let i = 0; i < length; i++) {
            const row = rows[i];
            const rowStart = row[0];
            if (row.length === 1) {
                if (i === 0) {
                    rowStart.anchor('top', 'parent');
                    rowStart.anchorStyle(STRING_ANDROID.VERTICAL);
                }
                else if (previousRow) {
                    previousRow.anchor('bottomTop', rowStart.documentId);
                    rowStart.anchor('topBottom', typeof previousRow === 'string' ? previousRow : previousRow.documentId);
                }
                if (rowStart.rightAligned) {
                    rowStart.anchorParent(STRING_ANDROID.HORIZONTAL, 'packed', 1);
                }
                else if (rowStart.centerAligned) {
                    rowStart.anchorParent(STRING_ANDROID.HORIZONTAL);
                }
                else {
                    rowStart.anchorParent(STRING_ANDROID.HORIZONTAL, 'packed');
                }
                if (i === length - 1) {
                    rowStart.anchor('bottom', 'parent');
                }
                else {
                    previousRow = row[0];
                }
            }
            else {
                const columns: T[][] = [];
                const lengthA = row.length;
                let columnMin = Math.min(lengthA, columnSized, columnCount || Number.POSITIVE_INFINITY);
                let percentGap = 0;
                if (columnMin > 1) {
                    let perRowCount = lengthA >= columnMin ? Math.ceil(lengthA / columnMin) : 1;
                    const maxHeight = Math.floor(row.reduce((a, b) => a + b.bounds.height, 0) / columnMin);
                    let excessCount = perRowCount > 1 && lengthA % columnMin !== 0 ? lengthA - columnMin : Number.POSITIVE_INFINITY;
                    let totalGap = 0;
                    for (let j = 0, k = 0, l = 0; j < lengthA; j++, l++) {
                        const column = row[j];
                        const rowIteration = l % perRowCount === 0;
                        if (k < columnMin - 1 && (rowIteration || excessCount <= 0 || j > 0 && (row[j - 1].bounds.height >= maxHeight || columns[k].length && (row.length - j + 1 === columnMin - k) && row[j - 1].bounds.height > row[j + 1].bounds.height))) {
                            if (j > 0) {
                                k++;
                                if (rowIteration) {
                                    excessCount--;
                                }
                                else {
                                    excessCount++;
                                }
                            }
                            l = 0;
                        }
                        let col = columns[k];
                        if (col === undefined) {
                            col = [];
                            columns[k] = col;
                        }
                        col.push(column);
                        if (column.length) {
                            totalGap += maxArray(objectMap<T, number>(column.children as T[], child => child.marginLeft + child.marginRight));
                        }
                        if (j > 0 && /^H\d/.test(column.tagName)) {
                            if (col.length === 1 && j === row.length - 2) {
                                columnMin--;
                                excessCount = 0;
                            }
                            else if ((l + 1) % perRowCount === 0 && row.length - j > columnMin && !row[j + 1].multiline && row[j + 1].bounds.height < maxHeight) {
                                col.push(row[++j]);
                                l = -1;
                            }
                        }
                        else if (row.length - j === columnMin - k && excessCount !== Number.POSITIVE_INFINITY) {
                            perRowCount = 1;
                        }
                    }
                    percentGap = columnMin > 1 ? Math.max(((totalGap + (columnGap * (columnMin - 1))) / node.box.width) / columnMin, 0.01) : 0;
                }
                else {
                    columns.push(row);
                }
                const horizontal: T[] = [];
                const lengthB = columns.length;
                for (let j = 0; j < lengthB; j++) {
                    const data = columns[j];
                    for (const item of data) {
                        item.app('layout_constraintWidth_percent', truncate((1 / columnMin) - percentGap, this.localSettings.precision.standardFloat));
                        item.setLayoutWidth('0px');
                    }
                    horizontal.push(data[0]);
                }
                const columnHeight: number[] = new Array(lengthB).fill(0);
                const barrier: T[] = [];
                for (let j = 0; j < lengthB; j++) {
                    const item = columns[j];
                    if (j < lengthB - 1 && item.length > 1) {
                        const columnEnd = item[item.length - 1];
                        if (/^H\d/.test(columnEnd.tagName)) {
                            item.pop();
                            horizontal[j + 1] = columnEnd;
                            columns[j + 1].unshift(columnEnd);
                        }
                    }
                    const elements: Element[] = [];
                    const lengthC = item.length;
                    for (let k = 0; k < lengthC; k++) {
                        const column = item[k];
                        if (column.naturalChild) {
                            elements.push(<Element> (<Element> column.element).cloneNode(true));
                        }
                        else {
                            columnHeight[j] += column.linear.height;
                        }
                    }
                    if (elements.length) {
                        const container = createElement(document.body, 'div', {
                            width: formatPX(columnWidth || node.box.width / columnMin),
                            visibility: 'hidden'
                        });
                        for (const element of elements) {
                            container.appendChild(element);
                        }
                        columnHeight[j] += container.getBoundingClientRect().height;
                        document.body.removeChild(container);
                    }
                }
                const lengthD = horizontal.length;
                for (let j = 1; j < lengthD; j++) {
                    horizontal[j].modifyBox(BOX_STANDARD.MARGIN_LEFT, columnGap);
                }
                setColumnHorizontal(horizontal);
                setColumnVertical(columns, i === length - 1, previousRow);
                previousRow = undefined;
                if (columns.every(item => item.length === 1)) {
                    for (const item of columns) {
                        barrier.push(item[item.length - 1]);
                    }
                    previousRow = this.addBarrier(barrier, 'bottom');
                }
                if (!previousRow) {
                    let maxColumnHeight = 0;
                    const lengthE = columnHeight.length;
                    for (let j = 0; j < lengthE; j++) {
                        if (columnHeight[j] >= maxColumnHeight) {
                            previousRow = columns[j].pop() as T;
                            maxColumnHeight = columnHeight[j];
                        }
                    }
                }
            }
        }
    }

    protected processConstraintChain(node: T, children: T[]) {
        const parent = children[0].actualParent || node;
        const horizontal = NodeUI.partitionRows(children);
        const floating = node.hasAlign(NODE_ALIGNMENT.FLOAT);
        const length = horizontal.length;
        if (length > 1) {
            node.horizontalRows = horizontal;
        }
        if (!node.hasWidth && children.some(item => item.percentWidth)) {
            node.setLayoutWidth('match_parent');
        }
        let previousSiblings: T[] = [];
        let bottomFloating = false;
        for (let i = 0; i < length; i++) {
            const partition = horizontal[i];
            const previousRow = horizontal[i - 1];
            const [floatingRight, floatingLeft] = partitionArray(partition, item => item.float === 'right' || item.autoMargin.left === true);
            let percentWidth = View.availablePercent(partition, 'width', node.box.width);
            let aboveRowEnd: T | undefined;
            let currentRowBottom: T | undefined;
            const applyLayout = (seg: T[], reverse: boolean) => {
                const lengthA = seg.length;
                if (lengthA) {
                    const [anchorStart, anchorEnd, chainStart, chainEnd] = getAnchorDirection(reverse);
                    const rowStart = seg[0];
                    const rowEnd = seg[lengthA - 1];
                    rowStart.anchor(anchorStart, 'parent');
                    if (!floating && parent.css('textAlign') === 'center') {
                        rowStart.anchorStyle(STRING_ANDROID.HORIZONTAL, 'spread');
                    }
                    else if (lengthA > 1) {
                        if (reverse) {
                            rowEnd.anchorStyle(STRING_ANDROID.HORIZONTAL, 'packed', 1);
                        }
                        else {
                            rowStart.anchorStyle(STRING_ANDROID.HORIZONTAL);
                        }
                    }
                    if (lengthA > 1 || rowEnd.autoMargin.leftRight) {
                        rowEnd.anchor(anchorEnd, 'parent');
                    }
                    for (let j = 0; j < lengthA; j++) {
                        const chain = seg[j];
                        const previous = seg[j - 1];
                        const next = seg[j + 1];
                        if (i === 0) {
                            if (length === 1) {
                                chain.anchorParent(STRING_ANDROID.VERTICAL);
                                if (!chain.autoMargin.topBottom) {
                                    chain.anchorStyle(STRING_ANDROID.VERTICAL, 'packed', chain.autoMargin.top ? 1 : 0);
                                }
                            }
                            else {
                                chain.anchor('top', 'parent');
                            }
                        }
                        else if (!bottomFloating && i === length - 1) {
                            chain.anchor('bottom', 'parent');
                        }
                        if (chain.autoMargin.leftRight) {
                            chain.anchorParent(STRING_ANDROID.HORIZONTAL);
                        }
                        else {
                            if (previous) {
                                if (!previous.pageFlow && previous.positionAuto) {
                                    let found: T | undefined;
                                    for (let k = j - 2; k >= 0; k--) {
                                        found = seg[k];
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
                                    else {
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
                        percentWidth = Controller.setConstraintDimension(chain, percentWidth);
                        if (floating) {
                            if (i > 0 && j === 0) {
                                let checkBottom = false;
                                for (const item of previousSiblings) {
                                    if (Math.ceil(chain.linear.top) < Math.floor(item.linear.bottom)) {
                                        checkBottom = true;
                                        break;
                                    }
                                }
                                if (checkBottom) {
                                    aboveRowEnd = previousRow[previousRow.length - 1];
                                    for (let k = previousSiblings.length - 2; k >= 0; k--) {
                                        const aboveBefore = previousSiblings[k];
                                        if (aboveBefore.linear.bottom > aboveRowEnd.linear.bottom) {
                                            if (reverse && Math.ceil(aboveBefore.linear[anchorEnd]) - Math.floor(parent.box[anchorEnd]) < chain.linear.width) {
                                                continue;
                                            }
                                            const adjacent = previousSiblings[k + 1];
                                            chain.anchor(anchorStart, adjacent.documentId, true);
                                            if (reverse) {
                                                chain.modifyBox(BOX_STANDARD.MARGIN_RIGHT, -adjacent.marginRight, false);
                                            }
                                            else {
                                                chain.modifyBox(BOX_STANDARD.MARGIN_LEFT, -adjacent.marginLeft, false);
                                            }
                                            rowStart.anchorDelete(chainEnd);
                                            rowEnd.anchorDelete(anchorEnd);
                                            rowStart.delete('app', 'layout_constraintHorizontal_chainStyle', 'layout_constraintHorizontal_bias');
                                            if (currentRowBottom === undefined) {
                                                currentRowBottom = chain;
                                                bottomFloating = true;
                                            }
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            };
            applyLayout(floatingLeft, false);
            applyLayout(floatingRight, true);
            if (floating) {
                previousSiblings = previousSiblings.concat(floatingLeft, floatingRight);
            }
            if (i > 0) {
                if (aboveRowEnd === undefined) {
                    aboveRowEnd = previousRow[0];
                    const lengthB = previousRow.length;
                    for (let k = 1; k < lengthB; k++) {
                        if (previousRow[k].linear.bottom >= aboveRowEnd.linear.bottom) {
                            aboveRowEnd = previousRow[k];
                        }
                    }
                }
                if (currentRowBottom === undefined) {
                    currentRowBottom = partition[0];
                    const lengthB = partition.length;
                    for (let k = 1; k < lengthB; k++) {
                        const row = partition[k];
                        if (row.linear.bottom >= currentRowBottom.linear.bottom) {
                            currentRowBottom = row;
                        }
                    }
                    bottomFloating = false;
                }
                currentRowBottom.anchor('topBottom', aboveRowEnd.documentId);
                aboveRowEnd.anchor('bottomTop', currentRowBottom.documentId);
                for (const chain of partition) {
                    if (chain !== currentRowBottom) {
                        const autoMargin = chain.autoMargin;
                        if (!autoMargin.topBottom) {
                            chain.anchorStyle(STRING_ANDROID.VERTICAL, 'packed', autoMargin.top ? 1 : 0);
                        }
                        chain.anchor('top', currentRowBottom.documentId);
                        chain.modifyBox(BOX_STANDARD.MARGIN_TOP, currentRowBottom.marginTop * -1);
                    }
                }
            }
        }
    }

    private createLayoutNodeGroup(layout: squared.base.LayoutUI<T>) {
        return this.createNodeGroup(layout.node, layout.children, layout.parent);
    }

    get containerTypeHorizontal(): LayoutType {
        return {
            containerType: CONTAINER_NODE.LINEAR,
            alignmentType: NODE_ALIGNMENT.HORIZONTAL,
            renderType: 0
        };
    }

    get containerTypeVertical(): LayoutType {
        return {
            containerType: CONTAINER_NODE.LINEAR,
            alignmentType: NODE_ALIGNMENT.VERTICAL,
            renderType: 0
        };
    }

    get containerTypeVerticalMargin(): LayoutType {
        return {
            containerType: CONTAINER_NODE.FRAME,
            alignmentType: NODE_ALIGNMENT.COLUMN,
            renderType: 0
        };
    }

    get containerTypePercent(): LayoutType {
        return {
            containerType: CONTAINER_NODE.CONSTRAINT,
            alignmentType: NODE_ALIGNMENT.HORIZONTAL,
            renderType: 0
        };
    }

    get afterInsertNode() {
        return (node: T) => {
            if (!this.userSettings.exclusionsDisabled) {
                node.setExclusions();
            }
            node.localSettings = this._defaultViewSettings;
            node.api = this._targetAPI;
        };
    }

    get userSettings() {
        return this.application.userSettings;
    }
}