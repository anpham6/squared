import { FileAsset, ImageAsset, LayoutType, NodeTemplate, NodeXmlTemplate } from '../../@types/base/application';
import { ControllerSettingsAndroid } from '../../@types/android/application';
import { LocalSettingsAndroidUI, SpacerAttribute, WrapperOptions } from '../../@types/android/node';

import Resource from './resource';
import View from './view';
import ViewGroup from './viewgroup';

import { CONTAINER_ANDROID, CONTAINER_ANDROID_X } from './lib/constant';
import { BUILD_ANDROID, CONTAINER_NODE } from './lib/enumeration';
import { createViewAttribute, getDocumentId, getRootNs } from './lib/util';

type LayoutUI = squared.base.LayoutUI<View>;

const $lib = squared.lib;
const $base = squared.base;

const { PLATFORM, isPlatform } = $lib.client;
const { parseColor } = $lib.color;
const { formatPX, getSrcSet, isLength, isPercent, parseUnit } = $lib.css;
const { getElementsBetweenSiblings, getRangeClientRect } = $lib.dom;
const { truncate } = $lib.math;
const { CHAR } = $lib.regex;
const { getElementAsNode } = $lib.session;
const { assignEmptyValue, convertFloat, hasBit, isString, objectMap, partitionArray, withinRange } = $lib.util;
const { STRING_XMLENCODING, replaceTab } = $lib.xml;

const { APP_SECTION, BOX_STANDARD, NODE_ALIGNMENT, NODE_PROCEDURE, NODE_RESOURCE, NODE_TEMPLATE } = $base.lib.enumeration;

const NodeUI = $base.NodeUI;

const REGEX_TEXTSHADOW = /^(?:(rgba?\([^)]+\)|[a-z]+) )?(-?[\d.]+[a-z]+) (-?[\d.]+[a-z]+)\s*(-?[\d.]+[a-z]+)?.*$/;

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

function sortConstraintAbsolute(templates: NodeXmlTemplate<View>[]) {
    if (templates.length > 1) {
        templates.sort((a, b) => {
            const above = <View> a.node.innerMostWrapped;
            const below = <View> b.node.innerMostWrapped;
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
            else if (node.baselineElement) {
                node.anchor(node.naturalElements.findIndex((item: View) => item.imageOrSvgElement && item.baseline) !== -1 ? 'bottom' : 'baseline', baseline.documentId);
            }
        }
        else if (node.imageOrSvgElement && node.baseline) {
            imageBaseline = node;
        }
    }
    if (imageBaseline) {
        baseline.anchor(getBaselineAnchor(imageBaseline), imageBaseline.documentId);
    }
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
    return 0;
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

function causesLineBreak(element: Element, sessionId: string) {
    if (element.tagName === 'BR') {
        return true;
    }
    else {
        const node = getElementAsNode<View>(element, sessionId);
        if (node?.blockStatic === true && !node.excluded) {
            return true;
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

function setLeftTopAxis(node: View, parent: View, hasDimension: boolean, horizontal: boolean) {
    const [orientation, dimension, posA, posB, marginA, marginB, paddingA, paddingB] = horizontal ? ['horizontal', 'width', 'left', 'right', BOX_STANDARD.MARGIN_LEFT, BOX_STANDARD.MARGIN_RIGHT, BOX_STANDARD.PADDING_LEFT, BOX_STANDARD.PADDING_RIGHT]
                                                                                                  : ['vertical', 'height', 'top', 'bottom', BOX_STANDARD.MARGIN_TOP, BOX_STANDARD.MARGIN_BOTTOM, BOX_STANDARD.PADDING_TOP, BOX_STANDARD.PADDING_BOTTOM];
    const autoMargin = node.autoMargin;
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
            node.anchorParent(orientation);
            node.modifyBox(marginA, node[posA]);
            node.modifyBox(marginB, node[posB]);
        }
    }
    else {
        let expand = 0;
        if (node.hasPX(posA)) {
            node.anchor(posA, 'parent');
            if (!node.hasPX(posB) && node.css(dimension) === '100%') {
                node.anchor(posB, 'parent');
            }
            node.modifyBox(marginA, adjustAbsolutePaddingOffset(parent, paddingA, node[posA]));
            expand++;
        }
        else if (horizontal) {
            if (node.centerAligned) {
                node.anchorParent('horizontal', 0.5);
            }
            else {
                node.anchor(node.rightAligned ? 'right' : 'left', 'parent');
            }
        }
        if (node.hasPX(posB)) {
            if (!node.hasPX(dimension) || node.css(dimension) === '100%' || !node.hasPX(posA)) {
                node.anchor(posB, 'parent');
                node.modifyBox(marginB, adjustAbsolutePaddingOffset(parent, paddingB, node[posB]));
            }
            expand++;
        }
        if (expand === 2 && !hasDimension && !(autoMargin[orientation] && !autoMargin[posA] && !autoMargin[posB])) {
            if (horizontal) {
                node.setLayoutWidth('0px');
            }
            else {
                node.setLayoutHeight('0px');
            }
        }
    }
    node.positioned = true;
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

function setVerticalAlignment(node: View, biasOnly = false) {
    const autoMargin = node.autoMargin;
    let bias = NaN;
    if (node.imageOrSvgElement && !autoMargin.vertical) {
        switch (node.verticalAlign) {
            case 'top':
                bias = 0;
                break;
            case 'middle':
                bias = 0.5;
                break;
            default:
                bias = 1;
                break;
        }
    }
    else if (!autoMargin.topBottom) {
        bias = autoMargin.top ? 1 : 0;
    }
    if (!isNaN(bias)) {
        if (biasOnly) {
            node.app('layout_constraintVertical_bias', bias.toString(), false);
            node.delete('layout_constraintVertical_chainStyle');
        }
        else {
            node.anchorStyle('vertical', bias, 'packed', false);
        }
    }
}

const hasCleared = (nodes: View[], clearMap: Map<View, string>) => clearMap.size && nodes.some(node => clearMap.has(node));
const isMultiline = (node: View) => node.plainText && Resource.hasLineBreak(node, false, true) || node.preserveWhiteSpace && CHAR.LEADINGNEWLINE.test(node.textContent);
const getMaxHeight = (node: View) => Math.max(node.actualHeight, node.lineHeight);
const getBaselineAnchor = (node: View) => node.imageOrSvgElement ? 'baseline' : 'bottom';
const isConstraintLayout = (layout: LayoutUI, vertical: boolean) => layout.some(item => item.rightAligned || item.centerAligned || (item.percentWidth > 0 && item.percentWidth < 1) || item.hasPX('maxWidth')) && (!vertical || layout.every(item => item.marginTop >= 0));
const getVerticalLayout = (layout: LayoutUI) => isConstraintLayout(layout, true) ? CONTAINER_NODE.CONSTRAINT : (layout.some(item => item.positionRelative || !item.pageFlow && item.autoPosition) ? CONTAINER_NODE.RELATIVE : CONTAINER_NODE.LINEAR);
const getVerticalAlignedLayout = (layout: LayoutUI) => isConstraintLayout(layout, true) ? CONTAINER_NODE.CONSTRAINT : (layout.some(item => item.positionRelative) ? CONTAINER_NODE.RELATIVE : CONTAINER_NODE.LINEAR);
const getAnchorDirection = (reverse = false) => reverse ? { anchorStart: 'right', anchorEnd: 'left', chainStart: 'rightLeft', chainEnd: 'leftRight' } : { anchorStart: 'left', anchorEnd: 'right', chainStart: 'leftRight', chainEnd: 'rightLeft' };
const isUnknownParent = (parent: View, value: number, length: number) => parent.containerType === value && parent.length === length && (parent.alignmentType === 0 || parent.hasAlign(NODE_ALIGNMENT.UNKNOWN));

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
            layout.content = replaceTab(layout.content.replace(/{#0}/, getRootNs(layout.content)), insertSpaces);
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
                if (node.documentRoot && isTargeted(node.element, child)) {
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
                    if (child.percentWidth > 0) {
                        if (!node.hasPX('width')) {
                            node.setLayoutWidth('match_parent');
                        }
                        layout.setContainerType(CONTAINER_NODE.CONSTRAINT, NODE_ALIGNMENT.SINGLE | NODE_ALIGNMENT.BLOCK);
                    }
                    else if (child.baseline && (child.textElement || child.inputElement)) {
                        layout.setContainerType(getVerticalAlignedLayout(layout), NODE_ALIGNMENT.VERTICAL);
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
            layout.setContainerType(getVerticalAlignedLayout(layout), NODE_ALIGNMENT.VERTICAL | NODE_ALIGNMENT.UNKNOWN);
        }
        else if (this.checkConstraintFloat(layout)) {
            layout.setContainerType(CONTAINER_NODE.CONSTRAINT, layout.floated.size ? NODE_ALIGNMENT.FLOAT : NODE_ALIGNMENT.UNKNOWN);
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
            layout.setContainerType(getVerticalLayout(layout), NODE_ALIGNMENT.VERTICAL | (node.documentRoot || layout.some((item, index) => index > 0 && item.inlineFlow && (layout.item(index - 1) as T).inlineFlow) ? NODE_ALIGNMENT.UNKNOWN : 0));
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
        const visibleStyle = node.visibleStyle;
        if (node.inlineText && (!node.textEmpty || visibleStyle.borderWidth)) {
            layout.setContainerType(CONTAINER_NODE.TEXT);
        }
        else if (node.blockStatic && (visibleStyle.borderWidth || visibleStyle.backgroundImage || node.paddingTop + node.paddingBottom > 0) && node.naturalChildren.length === 0) {
            layout.setContainerType(CONTAINER_NODE.FRAME);
        }
        else if (
            node.naturalElement &&
            node.elementId === '' &&
            node.bounds.height === 0 &&
            node.marginTop === 0 &&
            node.marginRight === 0 &&
            node.marginBottom === 0 &&
            node.marginLeft === 0 &&
            !node.documentRoot &&
            !visibleStyle.background &&
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
                    if (node.textContent !== '' && (visibleStyle.background || node.pseudoElement)) {
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
            parent.addAlign(NODE_ALIGNMENT.HORIZONTAL);
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
                    layout.node = this.createLayoutNodeGroup(layout);
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
                    layout.node = this.createLayoutNodeGroup(layout);
                    layout.setContainerType(CONTAINER_NODE.CONSTRAINT, NODE_ALIGNMENT.FLOAT);
                }
            }
            else if (hasCleared(layout.children, clearMap) || this.checkFrameHorizontal(layout)) {
                layout.node = this.createLayoutNodeGroup(layout);
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
                    layout.node = this.createLayoutNodeGroup(layout);
                    layout.setContainerType(containerType, NODE_ALIGNMENT.VERTICAL);
                }
            }
        }
        else if (floatSize && hasCleared(layout.children, clearMap)) {
            layout.node = this.createLayoutNodeGroup(layout);
            layout.addRender(NODE_ALIGNMENT.FLOAT);
            layout.addRender(NODE_ALIGNMENT.VERTICAL);
        }
        else if (floatSize && (layout.item(0) as T).floating) {
            layout.node = this.createLayoutNodeGroup(layout);
            layout.addRender(NODE_ALIGNMENT.FLOAT);
            layout.addRender(NODE_ALIGNMENT.HORIZONTAL);
        }
        else if (!parent.hasAlign(NODE_ALIGNMENT.VERTICAL)) {
            const containerType = getVerticalAlignedLayout(layout);
            if (isUnknownParent(parent, containerType, length)) {
                setVerticalLayout();
                return undefined;
            }
            else {
                layout.node = this.createLayoutNodeGroup(layout);
                layout.setContainerType(containerType, NODE_ALIGNMENT.VERTICAL);
            }
        }
        return layout;
    }

    public processLayoutHorizontal(layout: squared.base.LayoutUI<T>) {
        if (this.checkConstraintFloat(layout)) {
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
        if (parent.layoutRelative) {
            if (templates.some(item => item.node.zIndex !== 0)) {
                templates.sort((a, b) => {
                    const indexA = a.node.zIndex;
                    const indexB = b.node.zIndex;
                    if (indexA === indexB) {
                        return 0;
                    }
                    return indexA > indexB ? 1 : -1;
                });
            }
        }
        else if (parent.layoutConstraint) {
            if (templates.some(item => !item.node.pageFlow || item.node.zIndex !== 0)) {
                const below: NodeXmlTemplate<T>[] = [];
                const middle: NodeXmlTemplate<T>[] = [];
                const above: NodeXmlTemplate<T>[] = [];
                for (const item of templates) {
                    const node = item.node;
                    const z = node.zIndex;
                    if (z > 0) {
                        above.push(item);
                    }
                    else if (node.pageFlow) {
                        middle.push(item);
                    }
                    else if (z === 0) {
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
        }
        return templates;
    }

    public checkFrameHorizontal(layout: squared.base.LayoutUI<T>) {
        switch (layout.floated.size) {
            case 1:
                if (layout.node.cssAscend('textAlign', true) === 'center' && layout.some(node => node.pageFlow)) {
                    return true;
                }
                if (layout.floated.has('right')) {
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
                return (<View> layout.item(0)).floating && (
                    layout.linearY ||
                    layout.length > 2 && !layout.singleRowAligned && !layout.every(item => item.inlineFlow) ||
                    layout.every(item => item.floating || item.block && (item.length > 0 || !(item.textElement || item.inputElement || item.imageElement || item.svgElement || item.controlElement)))
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
                    if (A && !(node.floating || node.autoMargin.horizontal || node.inlineDimension && !node.inputElement && !node.controlElement || node.imageOrSvgElement || node.marginTop < 0)) {
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
        const floated = layout.floated;
        let valid = false;
        switch (layout.node.cssInitial('textAlign')) {
            case 'center':
                valid = floated.size === 0;
                break;
            case 'end':
            case 'right':
                valid = floated.size === 0 || floated.has('right') && floated.size === 1 && !hasCleared(layout.children, this.application.clearMap);
                break;
        }
        return (valid || layout.some(node => node.blockVertical || node.percentWidth > 0 && !node.inputElement && !node.controlElement || node.marginTop < 0 || node.verticalAlign === 'bottom' && !layout.parent.hasHeight)) && layout.singleRowAligned;
    }

    public checkLinearHorizontal(layout: squared.base.LayoutUI<T>) {
        const floated = layout.floated;
        if ((floated.size === 0 || floated.size === 1 && floated.has('left')) && layout.node.lineHeight === 0 && layout.singleRowAligned) {
            const { fontSize, lineHeight } = layout.item(0) as T;
            const boxWidth = layout.parent.actualBoxWidth();
            let contentWidth = 0;
            for (const node of layout) {
                if (!(node.naturalChild && node.length === 0 && !node.inputElement && !node.controlElement && !node.positionRelative && node.baseline && !node.blockVertical && node.zIndex === 0 && (lineHeight === 0 || node.lineHeight === lineHeight && node.fontSize === fontSize))) {
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
            if (node.renderChildren.length > 0 && !node.hasAlign(NODE_ALIGNMENT.AUTO_LAYOUT) && node.hasProcedure(NODE_PROCEDURE.CONSTRAINT)) {
                if (node.layoutRelative) {
                    this.processRelativeHorizontal(node, node.renderChildren as T[]);
                }
                else if (node.layoutConstraint) {
                    const renderChildren = node.renderChildren as T[];
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
                                            setLeftTopAxis(item, node, item.hasWidth, true);
                                        }
                                        if (!constraint.vertical) {
                                            setLeftTopAxis(item, node, item.hasHeight, false);
                                        }
                                    }
                                    if (!constraint.horizontal) {
                                        this.addGuideline(item, node, 'horizontal');
                                    }
                                    if (!constraint.vertical) {
                                        this.addGuideline(item, node, 'vertical');
                                    }
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
                                item.anchorParent('horizontal', item.centerAligned ? 0.5 : (item.rightAligned ? 1 : 0), 'packed', false);
                            }
                            if (!vertical) {
                                item.anchorParent('vertical');
                                setVerticalAlignment(item);
                            }
                            View.setConstraintDimension(item);
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
                if (layout.length === 0) {
                    return this.renderNode(layout);
                }
                break;
        }
        if (valid) {
            const dataset = node.dataset;
            const target = !dataset.use && dataset.target
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
                                [width, height] = setImageDimension(node, actualWidth, width, height, this.application.resourceHandler.getImage(element.src));
                            }
                            else {
                                width = node.bounds.width;
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
                    if (percentWidth >= 0) {
                        width *= absoluteParent.box.width / 100;
                        if (percentWidth < 100 && !parent.layoutConstraint) {
                            node.css('width', formatPX(width));
                        }
                    }
                    if (percentHeight >= 0) {
                        height *= absoluteParent.box.height / 100;
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
                    const parentWidth = parent.parseUnit(parent.css('maxWidth'));
                    if (parentWidth <= width) {
                        width = parentWidth;
                        node.css('width', formatPX(width));
                    }
                }
                else if (height > 0 && parent.hasPX('maxHeight', false) && (percentHeight === -1 || percentHeight === 100)) {
                    const parentHeight = parent.parseUnit(parent.css('maxHeight'), 'height');
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
                    const src = (<android.base.Resource<T>> this.application.resourceHandler).addImageSrc(element, '', imageSet);
                    if (src !== '') {
                        node.android('src', '@drawable/' + src);
                    }
                }
                if (!node.pageFlow && parent === absoluteParent && (node.left < 0 && parent.css('overflowX') === 'hidden' || node.top < 0 && parent.css('overflowY') === 'hidden')) {
                    const application = <squared.base.ApplicationUI<T>> this.application;
                    const container = application.createNode({ parent, replace: node });
                    container.setControlType(CONTAINER_ANDROID.FRAME, CONTAINER_NODE.FRAME);
                    container.inherit(node, 'base');
                    container.cssCopy(node, 'position', 'zIndex');
                    container.exclude({ resource: NODE_RESOURCE.ALL, procedure: NODE_PROCEDURE.ALL });
                    container.autoPosition = false;
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
                        if (node.width === 0) {
                            node.css('width', formatPX(node.bounds.width));
                        }
                        break;
                }
                break;
            }
            case 'BUTTON': {
                for (const item of node.naturalChildren as T[]) {
                    if (!item.pageFlow || !item.textElement) {
                        item.android('elevation', '2px');
                    }
                }
                break;
            }
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

    public renderNodeStatic(controlName: string, options?: StandardMap, width?: string, height?: string, content?: string) {
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
        const optionsA: SpacerAttribute = { android, app };
        const output = this.renderNodeStatic(CONTAINER_ANDROID.SPACE, optionsA, width, height);
        options.documentId = optionsA.documentId;
        return output;
    }

    public addGuideline(node: T, parent: T, orientation?: string, percent = false, opposing = false) {
        let documentParent = node.documentParent as T;
        if (parent.nodeGroup && !documentParent.hasAlign(NODE_ALIGNMENT.AUTO_LAYOUT)) {
            documentParent = parent
        }
        const box = documentParent.box;
        const linear = node.linear;
        const bounds = node.positionStatic ? node.bounds : linear;
        const applyLayout = (value: string, horizontal: boolean) => {
            if (node.constraint[value] || orientation && value !== orientation) {
                return;
            }
            let LT: string;
            let RB: string;
            let LTRB: string;
            let RBLT: string;
            if (horizontal) {
                if (!opposing) {
                    LT = 'left';
                    RB = 'right';
                    LTRB = 'leftRight';
                    RBLT = 'rightLeft';
                }
                else {
                    LT = 'right';
                    RB = 'left';
                    LTRB = 'rightLeft';
                    RBLT = 'leftRight';
                }
            }
            else {
                if (!opposing) {
                    LT = 'top';
                    RB = 'bottom';
                    LTRB = 'topBottom';
                    RBLT = 'bottomTop';
                }
                else {
                    LT = 'bottom';
                    RB = 'top';
                    LTRB = 'bottomTop';
                    RBLT = 'topBottom';
                }
            }
            if (withinRange(linear[LT], box[LT])) {
                node.anchor(LT, 'parent', true);
                return;
            }
            if (!percent && !parent.hasAlign(NODE_ALIGNMENT.AUTO_LAYOUT)) {
                const boundsA = node.bounds;
                const found = parent.renderChildren.some(item => {
                    if (item !== node && item.constraint[value]) {
                        let attr: Undef<string>;
                        if (node.pageFlow && item.pageFlow) {
                            if (withinRange(linear[LT], item.linear[RB])) {
                                attr = LTRB;
                            }
                            else if (withinRange(linear[RB], item.linear[LT])) {
                                attr = RBLT;
                            }
                        }
                        if (attr === undefined) {
                            const boundsB = item.bounds;
                            if (withinRange(boundsA[LT], boundsB[LT])) {
                                if (!horizontal && node.baselineElement && item.baselineElement) {
                                    attr = 'baseline';
                                }
                                else {
                                    attr = LT;
                                    if (horizontal) {
                                        node.modifyBox(BOX_STANDARD.MARGIN_LEFT, -item.marginLeft, false);
                                    }
                                    else {
                                        node.modifyBox(BOX_STANDARD.MARGIN_TOP, -item.marginTop, false);
                                    }
                                }
                            }
                            else if (withinRange(boundsA[RB], boundsB[RB])) {
                                attr = RB;
                                node.modifyBox(horizontal ? BOX_STANDARD.MARGIN_RIGHT : BOX_STANDARD.MARGIN_BOTTOM);
                            }
                            else if (!node.pageFlow && item.pageFlow && withinRange(boundsA[LT] + node[LT], boundsB[LT])) {
                                attr = LT;
                                node.modifyBox(horizontal ? BOX_STANDARD.MARGIN_LEFT : BOX_STANDARD.MARGIN_TOP, node[LT]);
                            }
                        }
                        if (attr) {
                            node.anchor(attr, item.documentId, true);
                            node.constraint[value] = true;
                            return true;
                        }
                    }
                    return false;
                });
                if (found) {
                    return;
                }
            }
            if (node.autoPosition) {
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
            const absoluteParent = node.absoluteParent as T;
            let attr = 'layout_constraintGuide_';
            let location: number;
            if (percent) {
                const position = Math.abs(bounds[LT] - box[LT]) / box[horizontal ? 'width' : 'height'];
                location = parseFloat(truncate(!opposing ? position : 1 - position, node.localSettings.floatPrecision));
                attr += 'percent';
            }
            else {
                location = bounds[LT] - box[!opposing ? LT : RB];
                if (!horizontal && !documentParent.nodeGroup) {
                    if (documentParent !== absoluteParent && !node.hasPX('top')) {
                        const previousSibling = node.previousSibling;
                        if (previousSibling?.blockStatic) {
                            location += previousSibling.marginBottom;
                        }
                    }
                }
                attr += 'begin';
            }
            const guideline = parent.constraint.guideline || {};
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
                node.modifyBox(BOX_STANDARD.MARGIN_TOP);
            }
            node.constraint[value] = true;
            if (location <= 0) {
                node.anchor(LT, 'parent', true);
            }
            else if (horizontal && location + bounds.width >= box.right && documentParent.hasPX('width') && !node.hasPX('right') || !horizontal && location + bounds.height >= box.bottom && documentParent.hasPX('height') && !node.hasPX('bottom')) {
                node.anchor(RB, 'parent', true);
            }
            else {
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
                const options = createViewAttribute(undefined, {
                    android: {
                        orientation: horizontal ? 'vertical' : 'horizontal'
                    },
                    app: {
                        [attr]: percent ? location.toString() : '@dimen/' + Resource.insertStoredAsset('dimens', 'constraint_guideline_' + (!opposing ? LT : RB), formatPX(location))
                    }
                });
                this.addAfterOutsideTemplate(node.id, this.renderNodeStatic(node.api < BUILD_ANDROID.Q ? CONTAINER_ANDROID.GUIDELINE : CONTAINER_ANDROID_X.GUIDELINE, options), false);
                const documentId = options.documentId;
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
            const content = this.renderNodeStatic(api < BUILD_ANDROID.Q ? CONTAINER_ANDROID.BARRIER : CONTAINER_ANDROID_X.BARRIER, options);
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
            if (node.alignParent('top')) {
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
                        if (current !== node) {
                            const barrier = current.constraint.barrier;
                            const documentId = barrier === undefined || !isString(barrier.bottom) ? this.addBarrier([current], 'bottom') : barrier.bottom
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
                    if (position.horizontal && horizontalAligned.some(item => item.documentId === position.documentId)) {
                        constraint.horizontal = true;
                        horizontalAligned.push(node);
                        i = -1;
                        break;
                    }
                }
            }
            if (!constraint.vertical) {
                for (const attr in current) {
                    const position = current[attr];
                    if (!position.horizontal && verticalAligned.some(item => item.documentId === position.documentId)) {
                        constraint.vertical = true;
                        verticalAligned.push(node);
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
        const { controlName, containerType, alignmentType } = options;
        let { resource, procedure, section } = options;
        const container = this.application.createNode({ parent, children, append: true, replace: node });
        container.inherit(node, 'base', 'alignment');
        if (node.documentRoot && options.transferRoot !== false) {
            container.documentRoot = true;
            node.documentRoot = false;
        }
        if (container.actualParent === null && parent.naturalElement) {
            container.actualParent = parent;
        }
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
        if (alignmentType) {
            container.addAlign(alignmentType);
        }
        container.addAlign(NODE_ALIGNMENT.WRAPPER);
        container.exclude({ resource, procedure, section });
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
        if (options.resetMargin) {
            node.resetBox(BOX_STANDARD.MARGIN, container);
        }
        return container;
    }

    protected processRelativeHorizontal(node: T, children: T[]) {
        const rowsLeft: T[][] = [];
        const checkLineWrap = node.css('whiteSpace') !== 'nowrap';
        let alignmentMultiLine = false;
        let autoPosition = false;
        let rowsRight: Undef<T[][]>;
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
            const boxWidth = node.actualBoxWidth((() => {
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
                                for (const item of parent.naturalElements as T[]) {
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
                return node.box.width;
                })()
            );
            const clearMap = this.application.clearMap;
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
            let rowWidth = 0;
            let previousRowLeft: Undef<T>;
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
                        if (previous.floating && adjustFloatingNegativeMargin(item, previous)) {
                            alignSibling = '';
                        }
                        siblings = item.inlineVertical && previous.inlineVertical && item.previousSibling !== previous ? getElementsBetweenSiblings(previous.element, <Element> item.element) : undefined;
                        if (textNewRow ||
                            item.nodeGroup && !item.hasAlign(NODE_ALIGNMENT.SEGMENTED) ||
                            Math.ceil(item.bounds.top) >= previous.bounds.bottom && (item.blockStatic || item.floating && previous.float === item.float) ||
                            !item.textElement && !checkFloatWrap() && checkWrapWidth() && Math.floor(baseWidth) > maxWidth ||
                            !item.floating && (previous.blockStatic || item.previousSiblings().some(sibling => sibling.lineBreak || sibling.excluded && sibling.blockStatic) || siblings?.some(element => causesLineBreak(element, node.sessionId))) ||
                            previous.autoMargin.horizontal ||
                            clearMap.has(item) ||
                            Resource.checkPreIndent(previous) !== undefined)
                        {
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
                    if (siblings?.some(element => !!getElementAsNode(element, item.sessionId) || causesLineBreak(element, item.sessionId)) === false) {
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
            if (rowsLeft.length === 1 && textIndent < 0) {
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
                        if (item.controlElement) {
                            if (i === 0) {
                                item.anchor('top', 'true');
                                item.modifyBox(BOX_STANDARD.MARGIN_TOP, item.linear.top - node.box.top);
                                item.baselineAltered = true;
                                continue;
                            }
                            else if (previousBaseline) {
                                item.modifyBox(BOX_STANDARD.MARGIN_TOP, item.linear.top - previousBaseline.box.top);
                                item.baselineAltered = true;
                                continue;
                            }
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
                        else if (baseline.textElement && maxCenterHeight > baseline.actualHeight) {
                            baseline.anchor('centerVertical', 'true');
                            baseline = null;
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
                    baseline.baselineActive = true;
                }
                if (baseline === null) {
                    baseline = items.find(sibling => sibling.baselineElement) || items[0];
                }
                for (const sibling of items) {
                    if (previousBaseline && sibling.alignSibling('baseline') === '') {
                        sibling.anchor('topBottom', previousBaseline.documentId);
                    }
                    if (sibling !== baseline && (sibling.baselineElement || baseline.floating) && sibling.linear.bottom >= baseline.linear.bottom) {
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
        if (alignmentMultiLine) {
            node.horizontalRows = rowsRight ? rowsLeft.concat(rowsRight) : rowsLeft;
        }
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
        const baseline = NodeUI.baseline(children);
        const textBottom = getTextBottom(children)[0];
        const documentId = baseline?.documentId;
        const { anchorStart, anchorEnd, chainStart, chainEnd } = getAnchorDirection(reverse);
        let percentWidth = View.availablePercent(children, 'width', node.box.width);
        let bias = 0;
        let valid = true;
        let tallest: Undef<T>;
        let bottom: Undef<T>;
        let previous: Undef<T>;
        let textBaseline: Null<T> = null;
        const setAlignTop = (item: T) => {
            item.anchorParent('vertical', 0);
            const offset = item.linear.top - node.box.top;
            if (Math.round(offset) !== 0) {
                item.modifyBox(BOX_STANDARD.MARGIN_TOP, offset);
                item.baselineAltered = true;
                valid = false;
            }
        };
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
        if (!node.hasPX('width') && children.some(item => item.percentWidth > 0)) {
            node.setLayoutWidth('match_parent');
        }
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
            else {
                item.anchor(anchorStart, 'parent');
                item.anchorStyle('horizontal', bias);
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
                                }
                                break;
                            default:
                                setAlignTop(item);
                                break;
                        }
                    }
                    else if (item.plainText) {
                        item.anchor('baseline', documentId || 'parent');
                    }
                    else {
                        setAlignTop(item);
                    }
                    item.anchored = true;
                }
                else {
                    baseline.baselineActive = true;
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
                        baseline.anchorParent('vertical', 0.5, 'packed', true);
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
                if (valid && baseline.baselineElement && !baseline.imageOrSvgElement && node.ascend({ condition: (item: T) => item.layoutHorizontal, error: (item: T) => item.layoutVertical || item.layoutGrid, attr: 'renderParent' }).length) {
                    baseline.anchorParent('vertical');
                    baseline.anchor('baseline', 'parent');
                }
                else {
                    baseline.anchorParent('vertical', 0);
                    baseline.modifyBox(BOX_STANDARD.MARGIN_TOP, Math.floor(baseline.linear.top - node.box.top));
                }
            }
            baseline.anchored = true;
        }
    }

    protected processConstraintChain(node: T, children: T[]) {
        const parent = children[0].actualParent || node;
        const clearMap = this.application.clearMap;
        const horizontal = NodeUI.partitionRows(children, clearMap);
        const floating = node.hasAlign(NODE_ALIGNMENT.FLOAT);
        const length = horizontal.length;
        if (length > 1) {
            node.horizontalRows = horizontal;
        }
        if (!node.hasWidth && children.some(item => item.percentWidth > 0)) {
            node.setLayoutWidth('match_parent', false);
        }
        let previousSiblings: T[] = [];
        for (let i = 0; i < length; i++) {
            const partition = horizontal[i];
            const previousRow = horizontal[i - 1];
            const [floatingRight, floatingLeft] = partitionArray(partition, item => item.float === 'right' || item.autoMargin.left === true);
            let aboveRowEnd: Undef<T>;
            let currentRowTop: Undef<T>;
            let tallest: Undef<T>;
            let floatBlock = false;
            const applyLayout = (seg: T[], reverse: boolean) => {
                const q = seg.length;
                if (q === 0) {
                    return;
                }
                const { anchorStart, anchorEnd, chainStart, chainEnd } = getAnchorDirection(reverse);
                const rowStart = seg[0];
                const rowEnd = seg[q - 1];
                rowStart.anchor(anchorStart, 'parent');
                if (q > 1) {
                    if (reverse) {
                        rowEnd.anchorStyle('horizontal', 1);
                    }
                    else {
                        rowStart.anchorStyle('horizontal', !floating && parent.css('textAlign') === 'center' ? 0.5 : 0);
                    }
                }
                else {
                    rowStart.anchorStyle('horizontal', reverse ? 1 : rowStart.centerAligned ? 0.5 : (rowStart.rightAligned ? 1 : 0));
                }
                rowEnd.anchor(anchorEnd, 'parent');
                let percentWidth = View.availablePercent(partition, 'width', node.box.width);
                floatBlock = i === 1 && previousRow.every(item => item.floating && !item.blockStatic) && !rowStart.floating && (clearMap.size === 0 || !partition.some(item => item.naturalChild && clearMap.has(item) || item.nodeGroup && item.some((child: T) => clearMap.has(child) || item.hasAlign(NODE_ALIGNMENT.WRAPPER) && clearMap.has(item.innerMostWrapped as T))));
                tallest = undefined;
                for (let j = 0; j < q; j++) {
                    const chain = seg[j];
                    if (i === 0 || floatBlock) {
                        if (length === 1) {
                            chain.anchorParent('vertical');
                            setVerticalAlignment(chain);
                        }
                        else {
                            chain.anchor('top', 'parent');
                            chain.anchorStyle('vertical', 0);
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
                    if (floating) {
                        if (i > 0 && j === 0) {
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
            if (previousRow && !floatBlock) {
                const current = partition[0];
                if (previousRow.length === 1 && partition.length === 1) {
                    const above = previousRow[0];
                    current.anchor('topBottom', above.documentId);
                    above.anchor('bottomTop', current.documentId);
                }
                else  {
                    if (aboveRowEnd === undefined || currentRowTop === undefined) {
                        aboveRowEnd = previousRow[0];
                        const q = previousRow.length;
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
                        const q = partition.length;
                        for (let k = 1; k < q; k++) {
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
                    setVerticalAlignment(currentRowTop, true);
                    const marginTop = currentRowTop.marginTop;
                    for (const chain of partition) {
                        if (chain !== currentRowTop) {
                            setVerticalAlignment(chain);
                            chain.anchor('top', documentId);
                            chain.modifyBox(BOX_STANDARD.MARGIN_TOP, marginTop * -1);
                        }
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
            alignmentType: NODE_ALIGNMENT.HORIZONTAL
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