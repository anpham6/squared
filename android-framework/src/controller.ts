import type { FileAsset, ImageAsset, LayoutType, NodeGroupUIOptions, NodeTemplate, NodeXmlTemplate } from '../../@types/base/application';
import type { ControllerSettingsAndroid, GuidelineOptions, RenderNodeStaticAttribute } from '../../@types/android/application';
import type { LocalSettingsAndroidUI, RenderSpaceAttribute, ViewAttribute, WrapperOptions } from '../../@types/android/node';

import Resource from './resource';
import View from './view';
import ViewGroup from './viewgroup';

import { CONTAINER_ANDROID, CONTAINER_ANDROID_X } from './lib/constant';
import { BUILD_ANDROID, CONTAINER_NODE } from './lib/enumeration';
import { adjustAbsolutePaddingOffset, createViewAttribute, getDocumentId, getRootNs } from './lib/util';

type LayoutUI = squared.base.LayoutUI<View>;

const $lib = squared.lib;
const $base = squared.base;

const { PLATFORM, isPlatform } = $lib.client;
const { parseColor } = $lib.color;
const { formatPX, getSrcSet, hasComputedStyle, isLength, isPercent } = $lib.css;
const { getElementsBetweenSiblings, getRangeClientRect } = $lib.dom;
const { truncate } = $lib.math;
const { CHAR } = $lib.regex;
const { getElementAsNode, getPseudoElt } = $lib.session;
const { assignEmptyValue, convertFloat, hasBit, isString, objectMap, partitionArray, withinRange } = $lib.util;
const { STRING_XMLENCODING, replaceTab } = $lib.xml;

const { APP_SECTION, BOX_STANDARD, NODE_ALIGNMENT, NODE_PROCEDURE, NODE_RESOURCE, NODE_TEMPLATE } = $base.lib.enumeration;

const NodeUI = $base.NodeUI;

const REGEX_TEXTSHADOW = /((?:rgb|hsl)a?\([^)]+\)|[a-z]{4,})?\s*(-?[\d.]+[a-z]+)\s+(-?[\d.]+[a-z]+)\s*([\d.]+[a-z]+)?/;

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

function sortTemplateInvalid(a: NodeXmlTemplate<View>, b: NodeXmlTemplate<View>) {
    const above = <View> a.node.innerMostWrapped;
    const below = <View> b.node.innerMostWrapped;
    return getSortOrderInvalid(above, below);
}

function sortTemplateStandard(a: NodeXmlTemplate<View>, b: NodeXmlTemplate<View>) {
    const above = <View> a.node.innerMostWrapped;
    const below = <View> b.node.innerMostWrapped;
    return getSortOrderStandard(above, below);
}

function getSortOrderStandard(above: View, below: View): number {
    const parentA = <View> above.actualParent;
    const parentB = <View> below.actualParent;
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
        const parentA = <View> above.actualParent;
        const parentB = <View> below.actualParent;
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
    const baselineHeight = baseline.baselineHeight;
    const isBaselineImage = (item: View) => item.imageOrSvgElement && item.baseline;
    const getBaselineAnchor = (node: View) => node.imageOrSvgElement ? 'baseline' : 'bottom';
    let imageHeight = 0;
    let imageBaseline: Undef<View>;
    for (const node of nodes) {
        if (node.baselineAltered) {
            continue;
        }
        let height = node.baselineHeight;
        if (height > 0 || node.textElement) {
            if (node.blockVertical && baseline.blockVertical) {
                node.anchor('bottom', baseline.documentId);
                continue;
            }
            else {
                const imageElements = node.renderChildren.filter((item: View) => isBaselineImage(item));
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
            else if (node.naturalChild && node.isEmpty) {
                node.anchor('baseline', baseline.documentId);
            }
            else if (node.baselineElement) {
                node.anchor(node.naturalElements.find((item: View) => isBaselineImage(item)) ? 'bottom' : 'baseline', baseline.documentId);
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

function isTargeted(parentElement: Null<Element>, node: View) {
    const target = node.dataset.target;
    if (target && parentElement) {
        const element = document.getElementById(target);
        return !!element && element !== parentElement;
    }
    return false;
}

function getTextBottom(nodes: View[]): View[] {
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
            const hasWidth = () => (style.getPropertyValue('width') === '100%' || style.getPropertyValue('minWidth') === '100%') && style.getPropertyValue('max-width') === 'none';
            switch (display) {
                case 'block':
                case 'flex':
                case 'grid':
                    return !floating || hasWidth();
            }
            return (/^inline-/.test(display) || display === 'table') && hasWidth();
        }
    }
    return false;
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

function setLeftTopAxis(node: View, parent: View, horizontal: boolean) {
    const [orientation, dimension, posA, posB, marginA, marginB, paddingA, paddingB] = horizontal ? ['horizontal', 'width', 'left', 'right', BOX_STANDARD.MARGIN_LEFT, BOX_STANDARD.MARGIN_RIGHT, BOX_STANDARD.PADDING_LEFT, BOX_STANDARD.PADDING_RIGHT]
                                                                                                  : ['vertical', 'height', 'top', 'bottom', BOX_STANDARD.MARGIN_TOP, BOX_STANDARD.MARGIN_BOTTOM, BOX_STANDARD.PADDING_TOP, BOX_STANDARD.PADDING_BOTTOM];
    const autoMargin = node.autoMargin;
    const hasDimension = node.hasPX(dimension);
    if (hasDimension && autoMargin[orientation]) {
        if (node.hasPX(posA) && autoMargin[posB]) {
            node.anchor(posA, 'parent');
            node.modifyBox(marginA, node[posA]);
        }
        else if (node.hasPX(posB) && autoMargin[posA]) {
            node.anchor(posB, 'parent');
            node.modifyBox(marginB, node[posB]);
        }
        else {
            node.anchorParent(orientation, 0.5);
            node.modifyBox(marginA, node[posA]);
            node.modifyBox(marginB, node[posB]);
        }
    }
    else {
        const blockStatic = node.css(dimension) === '100%' || node.css(horizontal ? 'minWidth' : 'minHeight') === '100%';
        let expand = 0;
        if (node.hasPX(posA)) {
            node.anchor(posA, 'parent');
            if (!node.hasPX(posB) && blockStatic) {
                node.anchor(posB, 'parent');
                expand++;
            }
            node.modifyBox(marginA, adjustAbsolutePaddingOffset(parent, paddingA, node[posA]));
            expand++;
        }
        if (node.hasPX(posB)) {
            if (blockStatic || !hasDimension || !node.hasPX(posA)) {
                node.anchor(posB, 'parent');
                node.modifyBox(marginB, adjustAbsolutePaddingOffset(parent, paddingB, node[posB]));
            }
            expand++;
        }
        if (expand === 0) {
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
        }
        else if (expand === 2 && !hasDimension && !(autoMargin[orientation] && !autoMargin[posA] && !autoMargin[posB])) {
            if (horizontal) {
                node.setLayoutWidth('0px');
            }
            else {
                node.setLayoutHeight('0px');
            }
        }
    }
}

function setImageDimension(node: View, value: number, width: number, height: number, image: Undef<ImageAsset>) {
    width = value;
    node.css('width', formatPX(value), true);
    if (image && image.width > 0 && image.height > 0) {
        height = image.height * (width / image.width);
        node.css('height', formatPX(height), true);
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

function checkClearMap(node: View, clearMap: Map<View, string>) {
    if (node.naturalChild) {
        return clearMap.has(node);
    }
    else if (node.nodeGroup) {
        return node.cascade(item => item.naturalChild).some((item: View) => clearMap.has(item));
    }
    else {
        return clearMap.has(<View> node.innerMostWrapped);
    }
}

function isConstraintLayout(layout: LayoutUI, vertical: boolean) {
    const parent = layout.parent;
    if (parent.flexElement && (parent.css('alignItems') === 'baseline' || layout.some(item => item.flexbox.alignSelf === 'baseline'))) {
        return false;
    }
    const multiple = layout.length > 1;
    return layout.some(item => multiple && (item.rightAligned || item.centerAligned) || (item.percentWidth > 0 && item.percentWidth < 1) || item.hasPX('maxWidth')) && (!vertical || layout.every(item => item.marginTop >= 0));
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

function segmentRightAligned<T extends View>(children: T[]) {
    return partitionArray<T>(children, item => item.float === 'right' || item.autoMargin.left === true);
}

function segmentLeftAligned<T extends View>(children: T[]) {
    return partitionArray<T>(children, item => item.float === 'left' || item.autoMargin.right === true);
}

const hasCleared = (layout: LayoutUI, clearMap: Map<View, string>, ignoreFirst = true) => clearMap.size && layout.some((node, index) => (index > 0 || !ignoreFirst) && clearMap.has(node));
const isMultiline = (node: View) => node.plainText && Resource.hasLineBreak(node, false, true) || node.preserveWhiteSpace && CHAR.LEADINGNEWLINE.test(node.textContent);
const requireSorting = (node: View) => node.zIndex !== 0 || !node.pageFlow && node.documentParent !== node.actualParent;
const getMaxHeight = (node: View) => Math.max(node.actualHeight, node.lineHeight);
const getVerticalLayout = (layout: LayoutUI) => isConstraintLayout(layout, true) ? CONTAINER_NODE.CONSTRAINT : (layout.some(item => item.positionRelative || !item.pageFlow && item.autoPosition) ? CONTAINER_NODE.RELATIVE : CONTAINER_NODE.LINEAR);
const getVerticalAlignedLayout = (layout: LayoutUI) => isConstraintLayout(layout, true) ? CONTAINER_NODE.CONSTRAINT : (layout.some(item => item.positionRelative) ? CONTAINER_NODE.RELATIVE : CONTAINER_NODE.LINEAR);
const getAnchorDirection = (reverse = false) => reverse ? { anchorStart: 'right', anchorEnd: 'left', chainStart: 'rightLeft', chainEnd: 'leftRight' } : { anchorStart: 'left', anchorEnd: 'right', chainStart: 'leftRight', chainEnd: 'rightLeft' };
const isUnknownParent = (parent: View, value: number, length: number) => parent.containerType === value && parent.length === length && (parent.alignmentType === 0 || parent.hasAlign(NODE_ALIGNMENT.UNKNOWN));

export function setHorizontalAlignment(node: View) {
    if (node.centerAligned) {
        node.anchorParent('horizontal', 0.5);
    }
    else {
        const autoMargin = node.autoMargin;
        if (autoMargin.horizontal) {
            node.anchorParent('horizontal', autoMargin.left ? 1 : (autoMargin.leftRight ? 0.5 : 0));
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

export function setVerticalAlignment(node: View, onlyChild = true, biasOnly = false) {
    const autoMargin = node.autoMargin;
    let bias = onlyChild ? 0 : NaN;
    if (node.floating) {
        bias = 0;
    }
    else if (autoMargin.vertical) {
        bias = autoMargin.top ? 1 : (autoMargin.topBottom ? 0.5 : 0);
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
        if (parent && parent.display === 'table-cell') {
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
            inputColorBorderColor: 'rgb(119, 119, 199)',
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
            subscriptBottomOffset: 0.35,
            superscriptTopOffset: 0.35,
            legendBottomOffset: 0.25
        }
    };

    protected _screenDimension!: Dimension;

    private _defaultViewSettings!: LocalSettingsAndroidUI;
    private _targetAPI!: number;

    constructor(
        public application: android.base.Application<T>,
        public cache: squared.base.NodeList<T>)
    {
        super();
    }

    public init() {
        const { resolutionDPI, resolutionScreenWidth, resolutionScreenHeight, supportRTL, targetAPI } = this.userSettings;
        const dpiRatio = 160 / resolutionDPI;
        const screenDimension = { width: resolutionScreenWidth * dpiRatio, height: resolutionScreenHeight * dpiRatio };
        this._targetAPI = targetAPI || BUILD_ANDROID.LATEST;
        this._screenDimension = screenDimension;
        this._defaultViewSettings = {
            screenDimension,
            supportRTL,
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
            const content = layout.content;
            layout.content = replaceTab(content.replace(/{#0}/, getRootNs(content)), insertSpaces);
        }
    }

    public processUnknownParent(layout: squared.base.LayoutUI<T>) {
        const node = layout.node;
        if (layout.some(item => !item.pageFlow && !item.autoPosition)) {
            layout.setContainerType(CONTAINER_NODE.CONSTRAINT, NODE_ALIGNMENT.ABSOLUTE | NODE_ALIGNMENT.UNKNOWN);
        }
        else if (layout.length <= 1) {
            const child = <Undef<T>> node.item(0);
            if (child) {
                if (node.originalRoot && isTargeted(node.element, child)) {
                    node.hide();
                    return { layout, next: true };
                }
                else if (node.naturalElement && child.plainText) {
                    child.hide();
                    node.clear();
                    node.inlineText = true;
                    node.textContent = child.textContent;
                    layout.setContainerType(CONTAINER_NODE.TEXT);
                    layout.add(NODE_ALIGNMENT.INLINE);
                }
                else if (layout.parent.flexElement && child.baselineElement && node.flexbox.alignSelf === 'baseline') {
                    layout.setContainerType(CONTAINER_NODE.LINEAR, NODE_ALIGNMENT.HORIZONTAL);
                }
                else if (child.percentWidth > 0 && child.percentWidth < 1) {
                    layout.setContainerType(CONTAINER_NODE.CONSTRAINT, NODE_ALIGNMENT.PERCENT);
                }
                else if (node.autoMargin.leftRight || node.autoMargin.left) {
                    layout.setContainerType(CONTAINER_NODE.CONSTRAINT);
                }
                else if (child.baselineElement) {
                    layout.setContainerType(getVerticalAlignedLayout(layout), NODE_ALIGNMENT.VERTICAL);
                }
                else {
                    layout.setContainerType(CONTAINER_NODE.FRAME);
                }
                layout.add(NODE_ALIGNMENT.SINGLE);
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
                layout.add(NODE_ALIGNMENT.FLOAT);
            }
            else if (layout.linearY) {
                layout.add(NODE_ALIGNMENT.VERTICAL);
            }
            else if (layout.some(item => item.floating || item.rightAligned) && layout.singleRowAligned) {
                layout.add(NODE_ALIGNMENT.HORIZONTAL);
            }
            else {
                layout.add(layout.some(item => item.blockStatic) ? NODE_ALIGNMENT.VERTICAL : NODE_ALIGNMENT.INLINE);
                layout.add(NODE_ALIGNMENT.UNKNOWN);
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
                if (layout.floated.size) {
                    sortHorizontalFloat(layout.children);
                }
            }
            else {
                layout.setContainerType(isConstraintLayout(layout, false) ? CONTAINER_NODE.CONSTRAINT : CONTAINER_NODE.RELATIVE);
            }
            layout.add(NODE_ALIGNMENT.HORIZONTAL);
        }
        else if (layout.linearY) {
            layout.setContainerType(getVerticalLayout(layout), NODE_ALIGNMENT.VERTICAL | (node.originalRoot || layout.some((item, index) => index > 0 && item.inlineFlow && (layout.item(index - 1) as T).inlineFlow) ? NODE_ALIGNMENT.UNKNOWN : 0));
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
            const clearMap = this.application.clearMap;
            if (layout.some((item, index) => item.alignedVertically(index > 0 ? children.slice(0, index) : undefined, clearMap) > 0)) {
                layout.setContainerType(getVerticalLayout(layout), NODE_ALIGNMENT.VERTICAL | NODE_ALIGNMENT.UNKNOWN);
            }
            else {
                layout.setContainerType(CONTAINER_NODE.CONSTRAINT, NODE_ALIGNMENT.UNKNOWN);
            }
        }
        return { layout };
    }

    public processUnknownChild(layout: squared.base.LayoutUI<T>) {
        const node = layout.node;
        const background = node.visibleStyle.background;
        if (node.inlineText && (!node.textEmpty || background)) {
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
            !node.originalRoot &&
            !background &&
            !node.dataset.use)
        {
            node.hide();
            return { layout, next: true };
        }
        else {
            switch (node.tagName)  {
                case 'OUTPUT':
                    layout.setContainerType(CONTAINER_NODE.TEXT);
                    break;
                default: {
                    if (node.textContent !== '' && (background || node.pseudoElement && getPseudoElt(<Element> node.element, node.sessionId) === '::after')) {
                        layout.setContainerType(CONTAINER_NODE.TEXT);
                        node.inlineText = true;
                    }
                    else {
                        layout.setContainerType(CONTAINER_NODE.FRAME);
                    }
                }
            }
        }
        return { layout };
    }

    public processTraverseHorizontal(layout: squared.base.LayoutUI<T>, siblings: T[]) {
        const parent = layout.parent;
        if (layout.floated.size === 1 && layout.every(item => item.floating)) {
            if (isUnknownParent(parent, CONTAINER_NODE.CONSTRAINT, layout.length)) {
                parent.addAlign(NODE_ALIGNMENT.FLOAT);
                parent.removeAlign(NODE_ALIGNMENT.UNKNOWN);
                return undefined;
            }
            else {
                layout.node = this.createNodeGroup(layout.node, layout.children, { parent });
                layout.setContainerType(CONTAINER_NODE.CONSTRAINT, NODE_ALIGNMENT.FLOAT);
            }
        }
        else if (this.checkFrameHorizontal(layout)) {
            layout.node = this.createNodeGroup(layout.node, layout.children, { parent });
            layout.addRender(NODE_ALIGNMENT.FLOAT);
            layout.addRender(NODE_ALIGNMENT.HORIZONTAL);
        }
        else if (layout.length !== siblings.length || parent.hasAlign(NODE_ALIGNMENT.VERTICAL)) {
            layout.node = this.createNodeGroup(layout.node, layout.children, { parent });
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

    public processTraverseVertical(layout: squared.base.LayoutUI<T>) {
        const parent = layout.parent;
        const clearMap = this.application.clearMap;
        const floatSize = layout.floated.size;
        const length = layout.length;
        const setVerticalLayout = () => {
            parent.addAlign(NODE_ALIGNMENT.VERTICAL);
            parent.removeAlign(NODE_ALIGNMENT.UNKNOWN);
        };
        if (layout.some((item, index) => item.lineBreakTrailing && index < length - 1)) {
            if (!parent.hasAlign(NODE_ALIGNMENT.VERTICAL)) {
                const containerType = getVerticalLayout(layout);
                if (isUnknownParent(parent, containerType, length)) {
                    setVerticalLayout();
                    return undefined;
                }
                else {
                    if (parent.layoutConstraint) {
                        parent.addAlign(NODE_ALIGNMENT.VERTICAL);
                        if (!parent.hasAlign(NODE_ALIGNMENT.ABSOLUTE)) {
                            return undefined;
                        }
                    }
                    layout.node = this._createLayoutNodeGroup(layout);
                    layout.setContainerType(containerType, NODE_ALIGNMENT.VERTICAL | NODE_ALIGNMENT.UNKNOWN);
                }
            }
        }
        else if (floatSize === 1 && layout.every((item, index) => index === 0 || index === length - 1 || clearMap.has(item))) {
            if (layout.same(node => node.float)) {
                if (isUnknownParent(parent, CONTAINER_NODE.CONSTRAINT, length)) {
                    setVerticalLayout();
                    return undefined;
                }
                else {
                    layout.node = this._createLayoutNodeGroup(layout);
                    layout.setContainerType(CONTAINER_NODE.CONSTRAINT, NODE_ALIGNMENT.FLOAT);
                }
            }
            else if (hasCleared(layout, clearMap) || this.checkFrameHorizontal(layout)) {
                layout.node = this._createLayoutNodeGroup(layout);
                layout.addRender(NODE_ALIGNMENT.FLOAT);
                layout.addRender(NODE_ALIGNMENT.HORIZONTAL);
            }
            else {
                const containerType = getVerticalAlignedLayout(layout);
                if (isUnknownParent(parent, containerType, length)) {
                    setVerticalLayout();
                    return undefined;
                }
                else {
                    if (parent.layoutConstraint) {
                        parent.addAlign(NODE_ALIGNMENT.VERTICAL);
                        if (!parent.hasAlign(NODE_ALIGNMENT.ABSOLUTE)) {
                            return undefined;
                        }
                    }
                    layout.node = this._createLayoutNodeGroup(layout);
                    layout.setContainerType(containerType, NODE_ALIGNMENT.VERTICAL);
                }
            }
        }
        else if (floatSize) {
            if (hasCleared(layout, clearMap)) {
                layout.node = this._createLayoutNodeGroup(layout);
                layout.addRender(NODE_ALIGNMENT.FLOAT);
                layout.addRender(NODE_ALIGNMENT.VERTICAL);
            }
            else if ((layout.item(0) as T).floating) {
                layout.node = this._createLayoutNodeGroup(layout);
                layout.addRender(NODE_ALIGNMENT.FLOAT);
                layout.addRender(NODE_ALIGNMENT.HORIZONTAL);
            }
        }
        if (!parent.hasAlign(NODE_ALIGNMENT.VERTICAL)) {
            const containerType = getVerticalAlignedLayout(layout);
            if (isUnknownParent(parent, containerType, length)) {
                setVerticalLayout();
                return undefined;
            }
            else {
                if (parent.layoutConstraint) {
                    parent.addAlign(NODE_ALIGNMENT.VERTICAL);
                    if (!parent.hasAlign(NODE_ALIGNMENT.ABSOLUTE)) {
                        return undefined;
                    }
                }
                layout.node = this._createLayoutNodeGroup(layout);
                layout.setContainerType(containerType, NODE_ALIGNMENT.VERTICAL);
            }
        }
        return layout;
    }

    public processLayoutHorizontal(layout: squared.base.LayoutUI<T>) {
        if (this.checkConstraintFloat(layout)) {
            layout.setContainerType(CONTAINER_NODE.CONSTRAINT, layout.every(item => item.floating) ? NODE_ALIGNMENT.FLOAT : NODE_ALIGNMENT.INLINE);
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
        if (parent.layoutRelative) {
            if (templates.some(item => item.node.zIndex !== 0)) {
                templates.sort(sortTemplateStandard);
            }
        }
        else if (parent.layoutConstraint) {
            if (templates.some(item => requireSorting(item.node))) {
                let result: NodeXmlTemplate<T>[] = [];
                const originalParent = parent.innerMostWrapped as T;
                const actualParent: T[] = [];
                const nested: NodeXmlTemplate<T>[] = [];
                for (const item of templates) {
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
                if (nested.length) {
                    const map = new Map<T, NodeXmlTemplate<T>[]>();
                    const invalid: NodeXmlTemplate<T>[] = [];
                    const below: NodeXmlTemplate<T>[] = [];
                    for (const item of nested) {
                        const node = item.node.innerMostWrapped;
                        const adjacent = node.ascend({ condition: (above: T) => actualParent.includes(above), error: (above: T) => above.originalRoot })[0] as T | undefined;
                        if (adjacent) {
                            map.get(adjacent)?.push(item) || map.set(adjacent, [item]);
                        }
                        else {
                            if (node.zIndex < 0) {
                                below.push(item);
                            }
                            else {
                                invalid.push(item);
                            }
                        }
                    }
                    for (const [adjacent, children] of map.entries()) {
                        children.sort(sortTemplateStandard);
                        const index = result.findIndex(item => item.node.innerMostWrapped === adjacent);
                        if (index !== -1) {
                            result.splice(index + 1, 0, ...children);
                        }
                        else {
                            for (const item of children) {
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
                    if (below.length) {
                        below.sort(sortTemplateInvalid);
                        result = below.concat(result);
                    }
                    if (invalid.length) {
                        invalid.sort(sortTemplateInvalid);
                        result = result.concat(invalid);
                    }
                }
                return result;
            }
        }
        return templates;
    }

    public checkFrameHorizontal(layout: squared.base.LayoutUI<T>) {
        switch (layout.floated.size) {
            case 1:
                if (layout.node.cssAscend('textAlign', true) === 'center' && layout.some(node => node.pageFlow)) {
                    return true;
                }
                else if (layout.floated.has('right')) {
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
                    return pageFlow > 0 && !layout.singleRowAligned;
                }
                return (<View> layout.item(0)).floating && (
                    layout.linearY ||
                    layout.length > 2 && !layout.singleRowAligned && !layout.every(item => item.inlineFlow) ||
                    layout.every(item => item.floating || item.block && (!item.isEmpty || !(item.textElement || item.inputElement || item.imageElement || item.svgElement || item.controlElement)))
                );
            case 2:
                return true;
        }
        return false;
    }

    public checkConstraintFloat(layout: squared.base.LayoutUI<T>) {
        const length = layout.length;
        if (length > 1) {
            const clearMap = this.application.clearMap;
            let A = true;
            let B = true;
            for (const node of layout) {
                if (clearMap.has(node)) {
                    continue;
                }
                else {
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

    public checkConstraintHorizontal(layout: squared.base.LayoutUI<T>) {
        if (layout.length > 1 && layout.singleRowAligned) {
            const floatedSize = layout.floated.size;
            if (floatedSize && (
                    floatedSize === 2 ||
                    hasCleared(layout, this.application.clearMap) ||
                    layout.some(item => item.float === 'left') && layout.some(item => item.autoMargin.left === true) ||
                    layout.some(item => item.float === 'right') && layout.some(item => item.autoMargin.right === true)
                ))
            {
                return false;
            }
            return layout.some(node => node.blockVertical || node.percentWidth > 0 && node.percentWidth < 1 && !node.inputElement && !node.controlElement || node.marginTop < 0 || node.verticalAlign === 'bottom' && !layout.parent.hasHeight);
        }
        return false;
    }

    public checkLinearHorizontal(layout: squared.base.LayoutUI<T>) {
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

    public setConstraints() {
        for (const node of this.cache) {
            const renderChildren = node.renderChildren as T[];
            if (renderChildren.length && node.hasProcedure(NODE_PROCEDURE.CONSTRAINT)) {
                if (node.hasAlign(NODE_ALIGNMENT.AUTO_LAYOUT)) {
                    if (node.layoutConstraint && !node.layoutElement) {
                        this.evaluateAnchors(renderChildren);
                    }
                }
                else if (node.layoutRelative) {
                    this.processRelativeHorizontal(node, renderChildren);
                }
                else if (node.layoutConstraint) {
                    let j = 0;
                    const length = renderChildren.length;
                    const pageFlow: T[] = new Array(length);
                    for (const item of renderChildren) {
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
                                            setLeftTopAxis(item, node, true);
                                        }
                                        if (!constraint.vertical) {
                                            setLeftTopAxis(item, node, false);
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
                            const { horizontal, vertical } = item.constraint;
                            if (!horizontal) {
                                setHorizontalAlignment(item);
                            }
                            if (!vertical) {
                                item.anchorParent('vertical');
                                setVerticalAlignment(item);
                            }
                            View.setConstraintDimension(item, 1);
                        }
                        this.evaluateAnchors(pageFlow);
                    }
                }
            }
        }
    }

    public renderNodeGroup(layout: squared.base.LayoutUI<T>) {
        const { node, containerType } = layout;
        const options = createViewAttribute();
        let valid = false;
        switch (containerType) {
            case CONTAINER_NODE.LINEAR:
                if (hasBit(layout.alignmentType, NODE_ALIGNMENT.VERTICAL)) {
                    options.android.orientation = 'vertical';
                    valid = true;
                }
                else {
                    options.android.orientation = 'horizontal';
                    valid = true;
                }
                break;
            case CONTAINER_NODE.GRID: {
                const { columnCount, rowCount } = layout;
                const android = options.android;
                if (rowCount > 0) {
                    android.rowCount = rowCount.toString();
                }
                android.columnCount = columnCount > 0 ? columnCount.toString() : '1';
                valid = true;
                break;
            }
            case CONTAINER_NODE.FRAME:
            case CONTAINER_NODE.RELATIVE:
            case CONTAINER_NODE.CONSTRAINT:
                valid = true;
                break;
            default:
                if (layout.isEmpty) {
                    return this.renderNode(layout);
                }
                break;
        }
        if (valid) {
            const dataset = node.dataset;
            const target = !dataset.use && dataset.target;
            node.setControlType(View.getControlName(containerType, node.api), containerType);
            node.addAlign(layout.alignmentType);
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
                const application = this.application;
                const element = <HTMLImageElement> node.element;
                const absoluteParent = node.absoluteParent || node.documentParent;
                let width = node.toFloat('width', 0);
                let height = node.toFloat('height', 0);
                let percentWidth = node.percentWidth > 0 ? width : -1;
                const percentHeight = node.percentHeight > 0 ? height : -1;
                let scaleType = 'fitXY';
                let imageSet: Undef<ImageSrcSet[]>;
                if (isString(element.srcset) || node.actualParent?.tagName === 'PICTURE') {
                    imageSet = getSrcSet(element, this.localSettings.supported.imageFormat as string[]);
                    if (imageSet.length) {
                        const image = imageSet[0];
                        const actualWidth = image.actualWidth;
                        if (actualWidth) {
                            if (percentWidth === -1) {
                                [width, height] = setImageDimension(node, actualWidth, width, height, application.resourceHandler.getImage(element.src));
                            }
                            else {
                                width = node.bounds.width;
                                percentWidth = -1;
                            }
                        }
                        else {
                            const stored = application.resourceHandler.getImage(image.src);
                            if (stored) {
                                if (percentWidth === -1) {
                                    [width, height] = setImageDimension(node, stored.width, width, height, stored);
                                }
                                else {
                                    width = node.bounds.width;
                                    percentWidth = -1;
                                }
                            }
                        }
                    }
                    else {
                        imageSet = undefined;
                    }
                }
                if (percentWidth !== -1 || percentHeight !== -1) {
                    const box = absoluteParent.box;
                    if (percentWidth >= 0) {
                        width *= box.width / 100;
                        if (percentWidth < 100 && !parent.layoutConstraint) {
                            node.css('width', formatPX(width));
                        }
                    }
                    if (percentHeight >= 0) {
                        height *= box.height / 100;
                        if (percentHeight < 100 && !(parent.layoutConstraint && absoluteParent.hasHeight)) {
                            node.css('height', formatPX(height));
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
                }
                node.android('scaleType', scaleType);
                if (width > 0 && parent.hasPX('maxWidth', false) && (percentWidth === -1 || percentWidth === 100)) {
                    const parentWidth = parent.parseWidth(parent.css('maxWidth'));
                    if (parentWidth <= width) {
                        width = parentWidth;
                        node.css('width', formatPX(width));
                    }
                }
                else if (height > 0 && parent.hasPX('maxHeight', false) && (percentHeight === -1 || percentHeight === 100)) {
                    const parentHeight = parent.parseHeight(parent.css('maxHeight'));
                    if (parentHeight <= height) {
                        height = parentHeight;
                        node.css('maxHeight', formatPX(height));
                        node.setLayoutHeight('wrap_content');
                    }
                }
                if (node.baseline) {
                    node.android('baselineAlignBottom', 'true');
                    if (node.marginBottom > 0 && parent.layoutLinear && parent.layoutHorizontal) {
                        node.mergeGravity('layout_gravity', 'bottom');
                    }
                }
                if (node.hasResource(NODE_RESOURCE.IMAGE_SOURCE)) {
                    const src = application.resourceHandler.addImageSrc(element, '', imageSet);
                    if (src !== '') {
                        node.android('src', `@drawable/${src}`);
                    }
                }
                if (!node.pageFlow && parent === absoluteParent && (node.left < 0 && parent.css('overflowX') === 'hidden' || node.top < 0 && parent.css('overflowY') === 'hidden')) {
                    const box = absoluteParent.box;
                    const container = application.createNode({ parent, replace: node });
                    container.setControlType(CONTAINER_ANDROID.FRAME, CONTAINER_NODE.FRAME);
                    container.inherit(node, 'base');
                    container.cssCopy(node, 'position', 'zIndex');
                    container.exclude({ resource: NODE_RESOURCE.ALL, procedure: NODE_PROCEDURE.ALL });
                    container.autoPosition = false;
                    if (width > 0) {
                        container.setLayoutWidth(width < box.width ? formatPX(width) : 'match_parent');
                    }
                    else {
                        container.setLayoutWidth('wrap_content');
                    }
                    if (height > 0) {
                        container.setLayoutHeight(height < box.height ? formatPX(height) : 'match_parent');
                    }
                    else {
                        container.setLayoutHeight('wrap_content');
                    }
                    container.render(target ? application.resolveTarget(target) : parent);
                    container.saveAsInitial();
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
                        if (node.width === 0) {
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
                const { cols, maxLength, placeholder, rows } = <HTMLTextAreaElement> node.element;
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
                if (!node.hasPX('width') && cols > 0) {
                    node.css('width', formatPX(cols * 8));
                }
                node.android('hint', placeholder);
                node.android('scrollbars', 'vertical');
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
                let foregroundColor: Undef<string>;
                let backgroundColor: Undef<string>;
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
                    const match = REGEX_TEXTSHADOW.exec(node.css('textShadow'));
                    if (match) {
                        const color = Resource.addColor(parseColor(match[1] || node.css('color')));
                        if (color !== '') {
                            const precision = node.localSettings.floatPrecision;
                            node.android('shadowColor', `@color/${color}`);
                            node.android('shadowDx', truncate(node.parseWidth(match[2]) * 2, precision));
                            node.android('shadowDy', truncate(node.parseHeight(match[3]) * 2, precision));
                            node.android('shadowRadius', truncate(isString(match[4]) ? Math.max(node.parseWidth(match[4]), 0) : 0.01, precision));
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
                if (node.companion === undefined && node.hasProcedure(NODE_PROCEDURE.ACCESSIBILITY)) {
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

    public renderNodeStatic(attrs: RenderNodeStaticAttribute, options?: ViewAttribute) {
        const { controlType, width, height, content } = attrs;
        let controlName = attrs.controlName;
        if (!isString(controlName)) {
            if (controlType) {
                controlName = View.getControlName(controlType, this.userSettings.targetAPI);
            }
            else {
                return '';
            }
        }
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

    public renderSpace(options: RenderSpaceAttribute) {
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
        const optionsA: RenderSpaceAttribute = { android, app };
        const output = this.renderNodeStatic({ controlName: CONTAINER_ANDROID.SPACE, width, height }, optionsA);
        options.documentId = optionsA.documentId;
        return output;
    }

    public addGuideline(node: T, parent: T, options?: GuidelineOptions) {
        let percent = false;
        let opposing = false;
        let orientation: Undef<string>;
        if (options) {
            percent = options.percent === true;
            opposing = options.opposing === true;
            orientation = options.orientation;
        }
        let documentParent = node.documentParent as T;
        if (parent.nodeGroup && !documentParent.hasAlign(NODE_ALIGNMENT.AUTO_LAYOUT)) {
            documentParent = parent;
        }
        const box = documentParent.box;
        const linear = node.linear;
        const applyLayout = (value: string, horizontal: boolean) => {
            if (node.constraint[value] || orientation && value !== orientation) {
                return;
            }
            let LT: string;
            let RB: string;
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
            else {
                if (!opposing) {
                    LT = 'top';
                    RB = 'bottom';
                }
                else {
                    LT = 'bottom';
                    RB = 'top';
                }
            }
            if (!percent && !opposing) {
                if (withinRange(linear[LT], box[LT])) {
                    node.anchor(LT, 'parent', true);
                    return;
                }
                if (node.autoPosition) {
                    const siblingsLeading = node.siblingsLeading;
                    const length = siblingsLeading.length;
                    if (length && !node.alignedVertically()) {
                        const previousSibling = siblingsLeading[length - 1] as T;
                        if (previousSibling.pageFlow && previousSibling.renderParent === node.renderParent) {
                            node.anchor(horizontal ? 'leftRight' : 'top', previousSibling.documentId, true);
                            node.constraint[value] = true;
                            return;
                        }
                    }
                }
                if (!node.pageFlow && node.css('position') !== 'fixed' && !parent.hasAlign(NODE_ALIGNMENT.AUTO_LAYOUT)) {
                    const bounds = node.innerMostWrapped.bounds;
                    for (const item of parent.renderChildren as T[]) {
                        if (item === node || item.plainText || item.pseudoElement || item.originalRoot) {
                            continue;
                        }
                        const itemA = item.innerMostWrapped as T;
                        if (itemA.pageFlow || item.constraint[value]) {
                            const { linear: linearA, bounds: boundsA } = itemA;
                            let position: Undef<string>;
                            let offset = NaN;
                            if (withinRange(bounds[LT], boundsA[LT])) {
                                position = LT;
                            }
                            else if (withinRange(linear[LT], linearA[LT])) {
                                position = LT;
                                if (horizontal) {
                                    offset = bounds.left - boundsA.left;
                                }
                                else {
                                    offset = bounds.top - boundsA.top;
                                }
                                offset += adjustBodyMargin(node, LT);
                            }
                            else if (withinRange(linear[LT], linearA[RB])) {
                                if (horizontal) {
                                    if (!node.hasPX('left') && !node.hasPX('right') || !item.inlineStatic && item.hasPX('width', false, true)) {
                                        position = 'leftRight';
                                        offset = bounds.left - boundsA.right;
                                    }
                                    else {
                                        continue;
                                    }
                                }
                                else {
                                    if (!node.hasPX('top') && !node.hasPX('bottom') || !item.inlineStatic && item.hasPX('height', false, true)) {
                                        position = 'topBottom';
                                        offset = bounds.top - boundsA.bottom;
                                    }
                                    else {
                                        continue;
                                    }
                                }
                            }
                            else {
                                continue;
                            }
                            if (horizontal) {
                                if (!isNaN(offset)) {
                                    node.setBox(BOX_STANDARD.MARGIN_LEFT, { reset: 1, adjustment: 0 });
                                    if (offset !== 0) {
                                        node.translateX(offset);
                                    }
                                }
                            }
                            else {
                                if (!isNaN(offset)) {
                                    node.setBox(BOX_STANDARD.MARGIN_TOP, { reset: 1, adjustment: 0 });
                                    if (offset !== 0) {
                                        node.translateY(offset);
                                    }
                                }
                            }
                            node.anchor(position, item.documentId, true);
                            node.constraint[value] = true;
                            return;
                        }
                    }
                    const TL = horizontal ? 'top' : 'left';
                    let nearest: Undef<T>;
                    let adjacent: Undef<T>;
                    const setMarginOffset = (documentId: string, position: string, adjustment: number) => {
                        node.anchor(position, documentId, true);
                        node.setBox(horizontal ? BOX_STANDARD.MARGIN_LEFT : BOX_STANDARD.MARGIN_TOP, { reset: 1, adjustment });
                        node.constraint[value] = true;
                    };
                    for (const item of parent.renderChildren as T[]) {
                        if (item === node || item.pageFlow || item.originalRoot || !item.constraint[value]) {
                            continue;
                        }
                        const itemA = item.innerMostWrapped as T;
                        const boundsA = itemA.bounds;
                        if (withinRange(bounds[TL], boundsA[TL]) || withinRange(linear[TL], itemA.linear[TL])) {
                            const offset = bounds[LT] - boundsA[RB];
                            if (offset >= 0) {
                                setMarginOffset(item.documentId, horizontal ? 'leftRight' : 'topBottom', offset);
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
                    if (nearest === undefined) {
                        nearest = adjacent;
                    }
                    if (nearest) {
                        const offset = bounds[LT] - nearest.bounds[LT] + adjustBodyMargin(node, LT);
                        if (offset >= 0) {
                            setMarginOffset(nearest.documentId, LT, offset);
                            return;
                        }
                    }
                }
            }
            const absoluteParent = node.absoluteParent as T;
            const bounds = node.positionStatic ? node.bounds : linear;
            let attr = 'layout_constraintGuide_';
            let location = 0;
            if (!node.leftTopAxis && documentParent.originalRoot) {
                const renderParent = node.renderParent;
                if (documentParent.ascend({ condition: item => item === renderParent, attr: 'renderParent' }).length) {
                    if (horizontal) {
                        location += !opposing ? documentParent.marginLeft : documentParent.marginRight;
                    }
                    else {
                        location += !opposing ? documentParent.marginTop : documentParent.marginBottom;
                    }
                }
            }
            if (percent) {
                const position = Math.abs(bounds[LT] - box[LT]) / (horizontal ? box.width : box.height);
                location += parseFloat(truncate(!opposing ? position : 1 - position, node.localSettings.floatPrecision));
                attr += 'percent';
            }
            else {
                location += bounds[LT] - box[!opposing ? LT : RB];
                attr += 'begin';
            }
            if (!node.pageFlow) {
                if (documentParent.outerWrapper && node.parent === documentParent.outerMostWrapper) {
                    location += documentParent[!opposing ? (horizontal ? 'paddingLeft' : 'paddingTop') : (horizontal ? 'paddingRight' : 'paddingBottom')];
                }
                else if (absoluteParent === node.documentParent) {
                    let direction: number;
                    if (horizontal) {
                        direction = !opposing ? BOX_STANDARD.PADDING_LEFT : BOX_STANDARD.PADDING_RIGHT;
                    }
                    else {
                        direction = !opposing ? BOX_STANDARD.PADDING_TOP : BOX_STANDARD.PADDING_BOTTOM;
                    }
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
            node.constraint[value] = true;
            if (location <= 0) {
                node.anchor(LT, 'parent', true);
            }
            else if (horizontal && location + bounds.width >= box.right && documentParent.hasPX('width') && !node.hasPX('right') || !horizontal && location + bounds.height >= box.bottom && documentParent.hasPX('height') && !node.hasPX('bottom')) {
                node.anchor(RB, 'parent', true);
            }
            else {
                const guideline = parent.constraint.guideline || {};
                const anchors = guideline[value]?.[attr]?.[LT];
                if (anchors) {
                    for (const id in anchors) {
                        if (parseInt(anchors[id]) === location) {
                            node.anchor(LT, id, true);
                            node.anchorDelete(RB);
                            return;
                        }
                    }
                }
                const templateOptions = createViewAttribute(undefined, {
                    android: {
                        orientation: horizontal ? 'vertical' : 'horizontal'
                    },
                    app: {
                        [attr]: percent ? location.toString() : '@dimen/' + Resource.insertStoredAsset('dimens', `constraint_guideline_${!opposing ? LT : RB}`, formatPX(location))
                    }
                });
                this.addAfterOutsideTemplate(node.id, this.renderNodeStatic({ controlName: node.api < BUILD_ANDROID.Q ? CONTAINER_ANDROID.GUIDELINE : CONTAINER_ANDROID_X.GUIDELINE }, templateOptions), false);
                const documentId = templateOptions.documentId;
                if (documentId) {
                    node.anchor(LT, documentId, true);
                    node.anchorDelete(RB);
                    if (location > 0) {
                        assignEmptyValue(guideline, value, attr, LT, documentId, location.toString());
                        parent.constraint.guideline = guideline;
                    }
                }
            }
        };
        applyLayout('horizontal', true);
        applyLayout('vertical', false);
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
                    constraint_referenced_ids: objectMap(unbound, item => getDocumentId(item.anchorTarget.documentId)).join(',')
                }
            });
            const { api, anchorTarget } = unbound[unbound.length - 1];
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
                for (const node of unbound) {
                    (node.constraint.barrier as {})[barrierDirection] = documentId;
                }
                return documentId;
            }
        }
        return '';
    }

    public evaluateAnchors(nodes: T[]) {
        const horizontalAligned: T[] = [];
        const verticalAligned: T[] = [];
        for (const node of nodes) {
            const { horizontal, vertical } = node.constraint;
            if (horizontal) {
                horizontalAligned.push(node);
            }
            if (vertical) {
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
                                const barrier = current.constraint.barrier;
                                const documentId = barrier === undefined || !isString(barrier.bottom) ? this.addBarrier([current], 'bottom') : barrier.bottom;
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
        let i = -1;
        while (++i < nodes.length) {
            const node = nodes[i];
            const constraint = node.constraint;
            const current = constraint.current;
            if (!constraint.horizontal) {
                for (const attr in current) {
                    const { documentId, horizontal } = current[attr];
                    if (horizontal && horizontalAligned.some(item => item.documentId === documentId)) {
                        constraint.horizontal = true;
                        horizontalAligned.push(node);
                        i = -1;
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
                        i = -1;
                        break;
                    }
                }
            }
        }
    }

    public createNodeGroup(node: T, children: T[], options: NodeGroupUIOptions<T> = {}) {
        const { parent, delegate, cascade } = options;
        const group = new ViewGroup(this.cache.nextId, node, children, this.afterInsertNode) as T;
        if (parent) {
            parent.appendTry(node, group);
            group.init();
        }
        else {
            group.containerIndex = node.containerIndex;
        }
        this.cache.append(group, delegate === true, cascade === true);
        return group;
    }

    public createNodeWrapper(node: T, parent: T, options: WrapperOptions<T> = {}) {
        const { children, containerType, alignmentType, resource, procedure, section } = options;
        const container = this.application.createNode({ parent, children, append: true, replace: node, delegate: true, cascade: options.cascade === true || !!children && children.length > 0 && !node.originalRoot });
        container.inherit(node, 'base', 'alignment');
        if (node.documentRoot) {
            container.documentRoot = true;
            node.documentRoot = false;
        }
        if (container.actualParent === null && parent.naturalElement) {
            container.actualParent = parent;
        }
        if (containerType) {
            container.setControlType(View.getControlName(containerType, node.api), containerType);
        }
        if (alignmentType) {
            container.addAlign(alignmentType);
        }
        container.addAlign(NODE_ALIGNMENT.WRAPPER);
        container.exclude({
            resource: resource === undefined ? NODE_RESOURCE.BOX_STYLE | NODE_RESOURCE.ASSET : resource,
            procedure: procedure === undefined ? NODE_PROCEDURE.CUSTOMIZATION : procedure,
            section: section === undefined ? APP_SECTION.ALL : section
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
            const dataset = container.dataset;
            Object.assign(dataset, node.dataset);
            delete dataset.use;
        }
        if (node.renderParent && node.removeTry()) {
            node.rendered = false;
        }
        if (node.documentParent.layoutElement) {
            const android = node.namespace('android');
            for (const attr in android) {
                if (/^layout_/.test(attr)) {
                    container.android(attr, android[attr]);
                    delete android[attr];
                }
            }
        }
        return container;
    }

    protected processRelativeHorizontal(node: T, children: T[]) {
        const rowsLeft: T[][] = [];
        let rowsRight: Undef<T[][]>;
        let autoPosition = false;
        let alignmentMultiLine = false;
        if (node.hasAlign(NODE_ALIGNMENT.VERTICAL)) {
            let previous: Undef<T>;
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
                    autoPosition = true;
                }
            }
        }
        else {
            const boxParent = node.nodeGroup ? node.documentParent : node;
            const boxWidth = boxParent.actualBoxWidth((() => {
                const renderParent = node.renderParent as T;
                if (renderParent.overflowY) {
                    return renderParent.box.width;
                }
                else {
                    const parent = <Null<T>> node.actualParent;
                    if (parent) {
                        if (node.naturalElement && node.inlineStatic && parent.blockStatic && parent === renderParent) {
                            const { left, width } = parent.box;
                            return width - (node.linear.left - left);
                        }
                        else if (parent.floatContainer) {
                            const { containerType, alignmentType } = this.containerTypeVerticalMargin;
                            const container = node.ascend({ condition: (item: T) => item.of(containerType, alignmentType), including: parent, attr: 'renderParent' });
                            if (container.length) {
                                const { left, right, width } = node.box;
                                let offsetLeft = 0;
                                let offsetRight = 0;
                                for (const item of parent.naturalChildren as T[]) {
                                    const linear = item.linear;
                                    if (item.floating && !children.includes(item) && node.intersectY(linear)) {
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
                                return width - offsetLeft - offsetRight;
                            }
                        }
                    }
                }
                return boxParent.box.width;
                })()
            );
            const clearMap = this.application.clearMap;
            const checkLineWrap = node.css('whiteSpace') !== 'nowrap';
            let rowWidth = 0;
            let previousRowLeft: Undef<T>;
            let textIndentSpacing = false;
            let textIndent = 0;
            if (node.naturalElement) {
                if (node.blockDimension) {
                    textIndent = node.parseUnit(node.css('textIndent'));
                }
            }
            else {
                const parent = node.actualParent as T;
                if (parent?.blockDimension && parent.has('textIndent')) {
                    const target = children[0];
                    if (!target.rightAligned) {
                        const value = parent.css('textIndent');
                        textIndent = parent.parseUnit(value);
                        if (textIndent !== 0) {
                            if (textIndent < 0) {
                                parent.setCacheValue('paddingLeft', Math.max(0, parent.paddingLeft + textIndent));
                            }
                            target.setCacheValue('blockDimension', true);
                            target.css('textIndent', value);
                            parent.css('textIndent', '0px');
                        }
                    }
                }
            }
            segmentRightAligned(children).forEach((seg: T[], index) => {
                const length = seg.length;
                if (length === 0) {
                    return;
                }
                const leftAlign = index === 1;
                let leftForward = true;
                let alignParent: string;
                let rows: T[][];
                if (leftAlign) {
                    if ((!node.naturalElement && seg[0].actualParent || node).cssInitialAny('textAlign', 'right', 'end')) {
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
                    rowsRight = [];
                    rows = rowsRight;
                }
                let previous!: T;
                let items!: T[];
                for (let i = 0; i < length; i++) {
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
                    let bounds = item.bounds;
                    let siblings: Undef<Element[]>;
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
                    let anchored = item.autoMargin.horizontal === true;
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
                        let maxWidth = 0;
                        let baseWidth = 0;
                        let retainMultiline = false;
                        const checkFloatWrap = () => {
                            if (previous.floating && previous.alignParent('left') && (multiline || Math.floor(rowWidth + item.actualWidth) < boxWidth)) {
                                return true;
                            }
                            else if (node.floating && i === length - 1 && item.textElement && !/\s|-/.test(item.textContent.trim())) {
                                const width = node.css('width');
                                if (isLength(width) && node.parseWidth(width) > node.parseWidth(node.css('minWidth'))) {
                                    node.cssApply({ width: 'auto', minWidth: width });
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
                            if (previousRowLeft === undefined || !item.plainText || multiline || !items.includes(previousRowLeft) || clearMap.has(item)) {
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
                        const startNewRow = () => {
                            if (previous.textElement) {
                                if (i === 1 && item.plainText && item.previousSibling === previous && !CHAR.TRAILINGSPACE.test(previous.textContent) && !CHAR.LEADINGSPACE.test(item.textContent)) {
                                    retainMultiline = true;
                                    return false;
                                }
                                else if (checkLineWrap && previous.multiline && (previous.bounds.width >= boxWidth || item.plainText && Resource.hasLineBreak(previous, false, true))) {
                                    return true;
                                }
                            }
                            if (checkFloatWrap()) {
                                return false;
                            }
                            else if (checkLineWrap) {
                                if (checkWrapWidth() && Math.floor(baseWidth) > maxWidth) {
                                    return true;
                                }
                                else if (item.actualParent?.tagName !== 'CODE') {
                                    return multiline && item.plainText || isMultiline(item);
                                }
                            }
                            return false;
                        };
                        const textNewRow = item.textElement && startNewRow();
                        if (previous.floating && adjustFloatingNegativeMargin(item, previous)) {
                            alignSibling = '';
                        }
                        siblings = item.inlineVertical && previous.inlineVertical && item.previousSibling !== previous ? getElementsBetweenSiblings(previous.element, <Element> item.element) : undefined;
                        const cleared = clearMap.has(item);
                        if (textNewRow ||
                            item.nodeGroup && !item.hasAlign(NODE_ALIGNMENT.SEGMENTED) ||
                            Math.ceil(item.bounds.top) >= previous.bounds.bottom && (item.blockStatic || item.floating && previous.float === item.float) ||
                            !item.textElement && !checkFloatWrap() && checkWrapWidth() && Math.floor(baseWidth) > maxWidth ||
                            !item.floating && (previous.blockStatic || item.previousSiblings().some(sibling => sibling.excluded && sibling.blockStatic) || siblings?.some(element => causesLineBreak(element))) ||
                            cleared ||
                            previous.autoMargin.horizontal ||
                            Resource.checkPreIndent(previous))
                        {
                            if (cleared && previousRowLeft === undefined) {
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
                            rowWidth = Math.min(0, textNewRow && !previous.multiline && multiline && !cleared ? item.linear.right - node.box.right : 0);
                            items = [item];
                            rows.push(items);
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
                            const betweenEnd = siblings.length > 1 && getRangeClientRect(<Element> siblings.pop());
                            if (!betweenEnd || !betweenEnd.numberOfLines) {
                                rowWidth += betweenEnd ? betweenStart.left - betweenEnd.right : betweenStart.width;
                            }
                        }
                    }
                    rowWidth += item.marginLeft + bounds.width + item.marginRight;
                    previous = item;
                }
            });
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
            for (let i = 0; i < length; i++) {
                const items = rows[i];
                let baseline: Null<T>;
                if (items.length > 1) {
                    const bottomAligned = getTextBottom(items);
                    let textBottom = <Undef<T>> bottomAligned[0];
                    baseline = NodeUI.baseline(bottomAligned.length ? items.filter(item => !bottomAligned.includes(item)) : items);
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
                    let documentId = i === 0 ? 'true' : baseline?.documentId;
                    let maxCenterHeight = 0;
                    let textBaseline: Null<T> = null;
                    for (const item of items) {
                        if (item === baseline || item === textBottom) {
                            continue;
                        }
                        else if (item.controlElement) {
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
                            if (item.naturalElements.length && (isLength(item.verticalAlign) || !item.baselineElement)) {
                                alignTop = true;
                            }
                            else {
                                baselineAlign.push(item);
                            }
                        }
                        else if (item.inlineVertical) {
                            switch (item.css('verticalAlign')) {
                                case 'text-top':
                                    if (textBaseline === null) {
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
                                    if (documentId && !withinRange(node.bounds.height, item.bounds.height)) {
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
                                    alignTop = !item.baselineAltered;
                                    break;
                            }
                        }
                        else {
                            alignTop = true;
                        }
                        if (alignTop && i === 0) {
                            item.anchor('top', 'true');
                        }
                    }
                    const q = baselineAlign.length;
                    if (baseline) {
                        baseline.baselineActive = true;
                        if (q) {
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
                                for (const item of items) {
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
                    else if (q > 0 && q < items.length) {
                        textBottom = getTextBottom(items)[0] as T;
                        if (textBottom) {
                            for (const item of baselineAlign) {
                                if (item.baseline && !item.multiline && textBottom.bounds.height > item.bounds.height) {
                                    item.anchor('bottom', textBottom.documentId);
                                }
                            }
                        }
                    }
                    for (let j = items.length - 1, last = true; j >= 0; j--) {
                        const previous = items[j];
                        if (previous.textElement) {
                            previous.setSingleLine(last && !previous.rightAligned && !previous.centerAligned);
                            last = false;
                        }
                    }
                }
                else {
                    baseline = items[0];
                }
                let requireBottom = false;
                if (baseline === null) {
                    baseline = items[0];
                    requireBottom = true;
                }
                for (const sibling of items) {
                    if (previousBaseline && !sibling.alignSibling('baseline')) {
                        sibling.anchor('topBottom', previousBaseline.documentId);
                    }
                    if (requireBottom && sibling.linear.bottom >= baseline.linear.bottom) {
                        baseline = sibling;
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
            const renderChildren = node.renderChildren;
            const renderTemplates = <NodeTemplate<T>[]> node.renderTemplates;
            const templates: NodeTemplate<T>[] = [];
            for (let i = 0; i < renderChildren.length; i++) {
                if (!renderChildren[i].pageFlow) {
                    templates.push(renderTemplates[i]);
                    renderChildren.splice(i, 1);
                    renderTemplates.splice(i--, 1);
                }
            }
            for (const item of templates) {
                renderChildren.push(item.node);
                renderTemplates.push(item);
            }
        }
    }

    protected processConstraintHorizontal(node: T, children: T[]) {
        const reverse = node.hasAlign(NODE_ALIGNMENT.RIGHT);
        const { anchorStart, anchorEnd, chainStart, chainEnd } = getAnchorDirection(reverse);
        let bias = 0;
        let valid = true;
        let tallest: Undef<T>;
        let bottom: Undef<T>;
        let previous: Undef<T>;
        let textBaseline: Null<T> = null;
        let baselineCount = 0;
        const setAlignTop = (item: T) => {
            item.anchorParent('vertical', 0);
            item.setBox(BOX_STANDARD.MARGIN_TOP, { reset: 1, adjustment: Math.max(item.bounds.top - node.box.top, Math.min(convertFloat(item.verticalAlign) * -1, 0)) });
            item.baselineAltered = true;
            valid = false;
        };
        if (!reverse) {
            switch (node.cssAscend('textAlign', true)) {
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
                        if (floating.length) {
                            this.processConstraintChain(node, floating);
                        }
                        break;
                    }
                    case 1: {
                        let leftAligned: T[];
                        [leftAligned, children] = segmentLeftAligned(children);
                        if (leftAligned.length) {
                            this.processConstraintChain(node, leftAligned);
                        }
                        break;
                    }
                    default: {
                        let rightAligned: T[];
                        [rightAligned, children] = segmentRightAligned(children);
                        if (rightAligned.length) {
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
        const textBottom = getTextBottom(children)[0];
        const documentId = baseline?.documentId;
        let percentWidth = View.availablePercent(children, 'width', node.box.width);
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
                else if (item.autoPosition) {
                    item.anchor(chainStart, previous.documentId);
                }
            }
            else if (length === 1) {
                bias = item.centerAligned ? 0.5 : (item.rightAligned ? 1 :0);
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
                item.anchorStyle('horizontal', bias, 'packed');
            }
            if (item.pageFlow) {
                if (item !== baseline) {
                    if (item.controlElement) {
                        setAlignTop(item);
                    }
                    else if (item.inlineVertical) {
                        if (tallest === undefined || getMaxHeight(item) > getMaxHeight(tallest)) {
                            tallest = item;
                        }
                        switch (item.css('verticalAlign')) {
                            case 'text-top':
                                if (textBaseline === null) {
                                    textBaseline = NodeUI.baseline(children, true);
                                }
                                if (textBaseline && item !== textBaseline) {
                                    item.anchor('top', textBaseline.documentId);
                                }
                                else {
                                    setAlignTop(item);
                                }
                                break;
                            case 'middle':
                                if (baseline?.textElement === false || textBottom) {
                                    setAlignTop(item);
                                }
                                else {
                                    item.anchorParent('vertical', 0.5);
                                }
                                break;
                            case 'text-bottom':
                                if (textBaseline === null) {
                                    textBaseline = NodeUI.baseline(children, true);
                                }
                                if (textBaseline && item !== textBaseline) {
                                    if (item !== textBottom) {
                                        item.anchor('bottom', textBaseline.documentId);
                                    }
                                    else if (textBottom) {
                                        setAlignTop(item);
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
                                    setAlignTop(item);
                                }
                                else {
                                    item.anchor('bottom', 'parent');
                                }
                                break;
                            case 'baseline':
                                if (baseline === null || item.blockVertical || !item.textElement && getMaxHeight(item) > getMaxHeight(baseline)) {
                                    setAlignTop(item);
                                }
                                else {
                                    item.anchor('baseline', documentId || 'parent');
                                    baselineCount++;
                                }
                                break;
                            default:
                                setAlignTop(item);
                                break;
                        }
                    }
                    else if (item.plainText) {
                        item.anchor('baseline', documentId || 'parent');
                        baselineCount++;
                    }
                    else {
                        setAlignTop(item);
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
            if (tallest && tallest !== baseline && baseline.textElement && getMaxHeight(tallest) > getMaxHeight(baseline)) {
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
                if (valid && baseline.baselineElement && !baseline.imageOrSvgElement && node.ascend({ condition: (item: T) => item.layoutHorizontal, error: (item: T) => item.naturalChild && item.layoutVertical || item.layoutGrid, attr: 'renderParent' }).length) {
                    baseline.anchorParent('vertical');
                    baseline.anchor('baseline', 'parent');
                }
                else {
                    setAlignTop(baseline);
                }
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
        const length = horizontal.length;
        if (!node.hasWidth && children.some(item => item.percentWidth > 0)) {
            node.setLayoutWidth('match_parent', false);
        }
        let previousSiblings: T[] = [];
        let previousRow: Undef<T[]>;
        for (let i = 0; i < length; i++) {
            const partition = horizontal[i];
            const [floatingRight, floatingLeft] = partitionArray(partition, item => item.float === 'right' || item.autoMargin.left === true);
            let aboveRowEnd: Undef<T>;
            let currentRowTop: Undef<T>;
            let tallest: Undef<T>;
            let alignParent = false;
            const applyLayout = (seg: T[], reverse: boolean) => {
                const q = seg.length;
                if (q === 0) {
                    return;
                }
                const { anchorStart, anchorEnd, chainStart, chainEnd } = getAnchorDirection(reverse);
                const rowStart = seg[0];
                const rowEnd = seg[q - 1];
                if (q > 1) {
                    rowStart.anchor(anchorStart, 'parent');
                    if (reverse) {
                        rowEnd.anchorStyle('horizontal', 1, 'packed');
                    }
                    else {
                        rowStart.anchorStyle('horizontal', !floating && parent.css('textAlign') === 'center' ? 0.5 : 0, 'packed');
                    }
                    rowEnd.anchor(anchorEnd, 'parent');
                }
                else {
                    setHorizontalAlignment(rowStart);
                }
                let percentWidth = View.availablePercent(partition, 'width', node.box.width);
                alignParent = i === 1 && !rowStart.floating && previousRow?.every(item => item.floating) === true && (clearMap.size === 0 || !partition.some((item: T) => checkClearMap(item, clearMap))) || !rowStart.pageFlow && (!rowStart.autoPosition || q === 1);
                tallest = undefined;
                for (let j = 0; j < q; j++) {
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
                    else if (i === length - 1 && currentRowTop === undefined) {
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
                    percentWidth = View.setConstraintDimension(chain, percentWidth);
                    if (previousRow && j === 0) {
                        if (clearMap.has(chain) && !chain.floating) {
                            chain.modifyBox(BOX_STANDARD.MARGIN_TOP, -previousRow[previousRow.length - 1].bounds.height, false);
                        }
                        if (floating) {
                            let checkBottom = false;
                            for (const item of previousSiblings) {
                                if (chain.bounds.top < Math.floor(item.bounds.bottom)) {
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
                                        if (currentRowTop === undefined) {
                                            currentRowTop = chain;
                                        }
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    if (tallest === undefined || chain.linear.height > tallest.linear.height) {
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
                        if (aboveRowEnd === undefined || currentRowTop === undefined) {
                            aboveRowEnd = previousRow[0];
                            for (let k = 1; k < q; k++) {
                                const item = previousRow[k];
                                if (item.linear.bottom > aboveRowEnd.linear.bottom) {
                                    aboveRowEnd = item;
                                }
                            }
                        }
                        if (currentRowTop === undefined) {
                            currentRowTop = partition[0];
                            let currentTop = currentRowTop.linear.top;
                            for (let k = 1; k < r; k++) {
                                const item = partition[k];
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
                        for (const chain of partition) {
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
    }

    private _createLayoutNodeGroup(layout: squared.base.LayoutUI<T>) {
        return this.createNodeGroup(layout.node, layout.children, { parent: layout.parent });
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

    get screenDimension() {
        return this._screenDimension;
    }
}