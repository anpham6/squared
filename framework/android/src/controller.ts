import BOX_STANDARD = squared.base.BOX_STANDARD;
import NODE_ALIGNMENT = squared.base.NODE_ALIGNMENT;
import NODE_TEMPLATE = squared.base.NODE_TEMPLATE;
import BUILD_VERSION = android.base.BUILD_VERSION;
import PLATFORM = squared.lib.constant.PLATFORM;

import { CONTAINER_NODE, CONTAINER_TAGNAME, CONTAINER_TAGNAME_X } from './lib/constant';

import type Application from './application';

import Resource from './resource';
import View from './view';
import ViewGroup from './viewgroup';

import ContentUI = squared.base.ContentUI;
import LayoutUI = squared.base.LayoutUI;
import NodeUI = squared.base.NodeUI;

import { concatString, createViewAttribute, getDocumentId, getRootNs, replaceTab } from './lib/util';

const { APP_SECTION, NODE_PROCEDURE, NODE_RESOURCE } = squared.base.lib.constant;

const { isPlatform } = squared.lib.client;
const { parseColor } = squared.lib.color;
const { formatPX, getSrcSet, hasCoords, hasComputedStyle } = squared.lib.css;
const { getElementsBetweenSiblings, getRangeClientRect } = squared.lib.dom;
const { truncate } = squared.lib.math;
const { getElementAsNode } = squared.lib.session;
const { assignEmptyValue, capitalize, convertWord, hasBit, isString, iterateArray, lastItemOf, parseMimeType, partitionArray, plainMap, withinRange } = squared.lib.util;

const REGEXP_TEXTSYMBOL = /^[^\w\s\n]+[\s\n]+$/;

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

function doOrderStandard(above: View, below: View): number {
    const parentA = above.actualParent;
    const parentB = below.actualParent;
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
        return above.childIndex - below.childIndex;
    }
    return zA - zB;
}

function setBaselineItems(parent: View, baseline: View, items: View[], index: number) {
    const { documentId, baselineHeight } = baseline;
    let aboveOffset = 0,
        bottomHeight = 0,
        bottomBaseline: Undef<View>;
    for (let i = 0, length = items.length; i < length; ++i) {
        const item = items[i];
        if (item.baselineAltered) {
            continue;
        }
        let height = item.baselineHeight;
        if (height || item.textElement) {
            if (item.blockVertical && baseline.blockVertical) {
                item.anchor('bottom', documentId);
            }
            else {
                let bottomAligned: Undef<boolean>;
                if (isBottomAligned(item)) {
                    bottomAligned = true;
                }
                else if (!item.isEmpty()) {
                    item.renderEach((child: View) => {
                        if (isBottomAligned(child)) {
                            height = Math.max(child.baselineHeight, height);
                            bottomAligned = true;
                        }
                    });
                }
                else {
                    bottomAligned = item.imageContainer && !baseline.textElement;
                }
                if (bottomAligned) {
                    if (height > baselineHeight) {
                        if (height >= bottomHeight) {
                            if (bottomBaseline) {
                                bottomBaseline.anchor(getAnchorBaseline(item), item.documentId);
                            }
                            bottomHeight = height;
                            bottomBaseline = item;
                        }
                        else if (bottomBaseline) {
                            item.anchor(getAnchorBaseline(bottomBaseline), bottomBaseline.documentId);
                        }
                        continue;
                    }
                    else if (index === 0 && Math.floor(item.linear.top) <= Math.ceil(item.renderParent!.box.top)) {
                        item.anchor('top', 'true');
                        continue;
                    }
                    else {
                        bottomAligned = false;
                    }
                }
                const verticalAlign = item.verticalAlign;
                if (verticalAlign !== 0 && item.rendering) {
                    let adjustment: number;
                    if (index === 0) {
                        let minTop = item.bounds.top;
                        item.each(child => minTop = Math.min(child.bounds.top, minTop));
                        adjustment = minTop - parent.box.top + parent.getBox(BOX_STANDARD.MARGIN_TOP)[1] + (verticalAlign < 0 ? verticalAlign * -1 : 0);
                        item.anchor('top', 'true');
                        if (verticalAlign > 0) {
                            aboveOffset = Math.max(verticalAlign, aboveOffset);
                        }
                    }
                    else {
                        adjustment = item.linear.top - baseline.bounds.top;
                        item.anchor('top', documentId);
                    }
                    item.setBox(BOX_STANDARD.MARGIN_TOP, { reset: 1, adjustment });
                    item.baselineAltered = true;
                }
                else if (Math.ceil(height) >= baselineHeight && item.find((child: View) => (!child.baselineElement || child.verticalAligned || child.positionRelative && (child.top < 0 || !child.hasPX('top') && child.bottom > 0)) && (Math.ceil(child.bounds.top + (child.positionRelative ? child.hasPX('top') ? child.top : child.bottom : 0)) < item.box.top)) || item.wrapperOf?.verticalAlign) {
                    item.anchor('top', documentId);
                }
                else {
                    item.anchor(bottomAligned ? 'bottom' : 'baseline', documentId);
                }
            }
        }
        else if (isBottomAligned(item)) {
            if (bottomBaseline) {
                item.anchor('baseline', bottomBaseline.documentId);
            }
            else {
                bottomBaseline = item;
            }
        }
    }
    if (aboveOffset) {
        baseline.modifyBox(BOX_STANDARD.MARGIN_TOP, aboveOffset);
    }
    if (bottomBaseline) {
        baseline.anchorDelete('baseline', 'top', 'bottom');
        baseline.anchor(getAnchorBaseline(bottomBaseline), bottomBaseline.documentId);
    }
}

function getTextBottom<T extends View>(nodes: T[]): T[] {
    return nodes.filter(node => (node.tagName === 'TEXTAREA' || node.tagName === 'SELECT' && node.toElementInt('size') > 1) && (node.baseline || node.verticalAligned) || node.css('verticalAlign') === 'text-bottom' && node.containerName !== 'INPUT_IMAGE').sort((a, b) => {
        if (a.baselineHeight === b.baselineHeight) {
            return a.tagName === 'SELECT' ? 1 : 0;
        }
        return b.baselineHeight - a.baselineHeight;
    });
}

function isConstraintLayout(layout: LayoutUI<View>, vertical: boolean) {
    if (layout.parent.flexElement && (layout.parent.css('alignItems') === 'baseline' || layout.find(item => item.flexbox.alignSelf === 'baseline')) || layout.singleRowAligned && layout.find(item => item.positionRelative && item.percentWidth === 0 && Math.ceil(item.actualRect('bottom', 'bounds')) > Math.floor(layout.node.box.bottom))) {
        return false;
    }
    return layout.find(item => (item.rightAligned || item.centerAligned) && layout.size() > 1 && (item.positionStatic && item.marginTop >= 0 || item.positionRelative && Math.floor(item.actualRect('bottom', 'bounds')) <= Math.ceil(layout.node.box.bottom)) && layout.singleRowAligned || item.percentWidth > 0 && item.percentWidth < 1 || item.hasPX('maxWidth')) && (!vertical || layout.every(item => item.marginTop >= 0));
}

function setVerticalLayout(node: View) {
    node.addAlign(NODE_ALIGNMENT.VERTICAL);
    node.removeAlign(NODE_ALIGNMENT.UNKNOWN);
}

function constraintAlignTop(node: View, boxTop: number) {
    node.anchorParent('vertical', 0);
    const adjustment = node.bounds.top - boxTop;
    if (adjustment !== 0 && Math.floor(adjustment) !== Math.floor(node.marginTop)) {
        node.setBox(BOX_STANDARD.MARGIN_TOP, { reset: 1, adjustment });
        node.baselineAltered = true;
    }
}

function setObjectContainer(layout: ContentUI<View>) {
    const node = layout.node;
    const element = node.element as HTMLEmbedElement & HTMLObjectElement;
    const src = (element.tagName === 'OBJECT' ? element.data : element.src).trim();
    const type = element.type || parseMimeType(src);
    if (type.startsWith('image/')) {
        node.setCacheValue('tagName', 'IMG');
        node.setCacheValue('imageElement', true);
        element.src = src;
        layout.containerType = CONTAINER_NODE.IMAGE;
    }
    else if (type.startsWith('video/')) {
        node.setCacheValue('tagName', 'VIDEO');
        element.src = src;
        layout.containerType = CONTAINER_NODE.VIDEOVIEW;
    }
    else if (type.startsWith('audio/')) {
        node.setCacheValue('tagName', 'AUDIO');
        element.src = src;
        layout.containerType = CONTAINER_NODE.VIDEOVIEW;
    }
    else {
        layout.containerType = CONTAINER_NODE.TEXT;
    }
}

function setConstraintFloatAligmnment(layout: LayoutUI<View>) {
    let left: Undef<boolean>,
        right: Undef<boolean>;
    for (const node of layout) {
        switch (node.float) {
            case 'left':
                left = true;
                break;
            case 'right':
                right = true;
                break;
            default:
                return false;
        }
    }
    layout.addAlign(NODE_ALIGNMENT.FLOAT);
    if (left && right) {
        layout.addAlign(NODE_ALIGNMENT.BLOCK);
    }
    return true;
}

function isBottomAligned(node: View) {
    const wrapperOf = node.wrapperOf;
    if (wrapperOf) {
        node = wrapperOf as View;
    }
    return node.imageContainer && node.baseline || node.tagName === 'RUBY';
}

function canControlAscendItems(node: View) {
    switch (node.tagName) {
        case 'CODE':
        case 'PRE':
        case 'RUBY':
            return false;
    }
    switch (node.controlName) {
        case CONTAINER_TAGNAME.HORIZONTAL_SCROLL:
        case CONTAINER_TAGNAME.VERTICAL_SCROLL:
        case CONTAINER_TAGNAME_X.VERTICAL_SCROLL:
        case CONTAINER_TAGNAME.RADIOGROUP:
            return false;
        default:
            return true;
    }
}

function flattenContainer(node: View) {
    const { renderChildren, renderTemplates } = node;
    for (let i = 0, length = renderChildren.length; i < length; ++i) {
        const item = renderChildren[i] as View;
        if (item.rendering && item.isUnstyled() && !item.inlineDimension && !item.preserveWhiteSpace && !item.layoutGrid && !item.layoutElement && canControlAscendItems(item) && item.removeTry()) {
            item.hide();
            const depth = item.depth;
            const children = flattenContainer(item);
            const r = children.length - 1;
            children[0].modifyBox(BOX_STANDARD.MARGIN_LEFT, item.marginLeft);
            children[r].modifyBox(BOX_STANDARD.MARGIN_RIGHT, item.marginRight);
            renderChildren.splice(i, 0, ...children);
            renderTemplates!.splice(i, 0, ...plainMap(children, child => {
                child.init(node, depth);
                child.renderParent = node;
                return child.renderedAs!;
            }));
            i += r;
            length = renderChildren.length;
        }
    }
    return renderChildren;
}

function getBoxWidth(node: View) {
    const parent = node.actualParent!;
    if (node.naturalElement && node.inlineStatic && parent.blockStatic && parent === node.renderParent) {
        return parent.box.width - (node.linear.left - parent.box.left);
    }
    else if (parent.floatContainer) {
        const container = node.ascend({ condition: (item: View) => item.of(CONTAINER_NODE.FRAME, NODE_ALIGNMENT.COLUMN), including: parent, attr: 'renderParent' });
        if (container.length) {
            const { left, right, width } = node.box;
            let offsetLeft = 0,
                offsetRight = 0;
            const renderChildren = node.renderChildren;
            const children = parent.naturalChildren;
            for (let i = 0, length = children.length; i < length; ++i) {
                const item = children[i] as View;
                if (item.floating) {
                    const linear = item.linear;
                    if (!renderChildren.includes(item) && node.intersectY(linear)) {
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
    return 0;
}

function causesLineBreak(element: Element) {
    if (element.tagName === 'BR') {
        return true;
    }
    else if (hasComputedStyle(element)) {
        const style = getComputedStyle(element);
        const hasWidth = () => (style.getPropertyValue('width') === '100%' || style.getPropertyValue('min-width') === '100%') && (style.getPropertyValue('max-width') === 'none' || style.getPropertyValue('max-width') === '100%');
        if (!hasCoords(style.getPropertyValue('position'))) {
            const display = style.getPropertyValue('display');
            switch (display) {
                case 'block':
                case 'flex':
                case 'grid':
                    return style.getPropertyValue('float') === 'none' || hasWidth();
                default:
                    return (display.startsWith('inline-') || display === 'table') && hasWidth();
            }
        }
    }
    return false;
}

function sortTemplateInvalid(a: NodeXmlTemplate<View>, b: NodeXmlTemplate<View>) {
    const above = a.node.innerMostWrapped as View;
    const below = b.node.innerMostWrapped as View;
    const depthA = above.depth;
    const depthB = below.depth;
    if (depthA === depthB) {
        const parentA = above.actualParent as View;
        const parentB = below.actualParent as View;
        if (parentA && parentB) {
            if (above === parentB) {
                return -1;
            }
            else if (parentA === below) {
                return 1;
            }
            else if (parentA === parentB) {
                return doOrderStandard(above, below);
            }
            else if (parentA.actualParent === parentB.actualParent) {
                return doOrderStandard(parentA, parentB);
            }
        }
        return above.id - below.id;
    }
    return depthA - depthB;
}

const getVerticalLayout = (layout: LayoutUI<View>) => isConstraintLayout(layout, true) ? CONTAINER_NODE.CONSTRAINT : layout.find(item => item.positionRelative || !item.pageFlow && item.autoPosition) ? CONTAINER_NODE.RELATIVE : CONTAINER_NODE.LINEAR;
const getVerticalAlignedLayout = (layout: LayoutUI<View>) => isConstraintLayout(layout, true) ? CONTAINER_NODE.CONSTRAINT : layout.find(item => item.positionRelative) ? CONTAINER_NODE.RELATIVE : CONTAINER_NODE.LINEAR;
const sortTemplateStandard = (a: NodeXmlTemplate<View>, b: NodeXmlTemplate<View>) => doOrderStandard(a.node.innerMostWrapped as View, b.node.innerMostWrapped as View);
const getAnchorDirection = (reverse?: boolean): AnchorPositionAttr[] => reverse ? ['right', 'left', 'rightLeft', 'leftRight'] : ['left', 'right', 'leftRight', 'rightLeft'];
const getAnchorBaseline = (node: View) => isBottomAligned(node) ? 'baseline' : 'bottom';
const hasCleared = (layout: LayoutUI<View>, clearMap: Map<View, string>, ignoreFirst = true) => clearMap.size > 0 && !!layout.find((node, index) => (index > 0 || !ignoreFirst) && clearMap.has(node));
const isUnknownParent = (node: View, containerType: number, length: number) => node.containerType === containerType && node.size() === length && (node.alignmentType === 0 || node.hasAlign(NODE_ALIGNMENT.UNKNOWN));

export function setHorizontalAlignment(node: View) {
    if (node.centerAligned) {
        node.anchorParent('horizontal', 0.5);
    }
    else {
        const autoMargin = node.autoMargin;
        if (autoMargin.horizontal) {
            node.anchorParent('horizontal', autoMargin.leftRight ? 0.5 : autoMargin.left ? 1 : 0);
        }
        else {
            if (node.rightAligned) {
                node.anchor('right', 'parent');
                node.anchorStyle('horizontal', 1);
            }
            else {
                node.anchor('left', 'parent');
                node.anchorStyle('horizontal', 0);
            }
            if (node.blockStatic || node.percentWidth || node.block && node.multiline && node.floating) {
                node.anchor(node.rightAligned ? 'left' : 'right', 'parent');
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
        bias = autoMargin.topBottom ? 0.5 : autoMargin.top ? 1 : 0;
    }
    else if (node.imageContainer || node.inlineVertical) {
        switch (node.css('verticalAlign')) {
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
        const parent = node.actualParent!;
        if (parent.display === 'table-cell') {
            switch (parent.css('verticalAlign')) {
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
    public readonly localSettings: IControllerSettingsUI = {
        layout: {
            pathName: 'res/layout',
            fileExtension: 'xml',
            baseTemplate: '<?xml version="1.0" encoding="utf-8"?>\n'
        },
        directory: {
            string: 'res/values',
            font: 'res/font',
            image: 'res/drawable',
            video: 'res/raw',
            audio: 'res/raw'
        },
        use: {
            svg: false
        },
        style: {
            anchorFontColor: 'rgb(0, 0, 238)',
            formFontSize: '13.3333px',
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
            image: ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/bmp', 'image/webp', 'image/heic', 'image/heif', 'image/x-icon'],
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
        deviations: {
            textMarginBoundarySize: 8,
            legendBottomOffset: 0.25
        },
        floatPrecision: 3
    };

    public readonly application!: Application<T>;

    protected _screenDimension!: Dimension;

    private _targetAPI!: number;
    private _viewSettings!: ILocalSettingsUI;

    public init() {
        const userSettings = this.userSettings;
        const dpiRatio = 160 / userSettings.resolutionDPI;
        this._targetAPI = userSettings.targetAPI || BUILD_VERSION.LATEST;
        this._screenDimension = {
            width: userSettings.resolutionScreenWidth * dpiRatio,
            height: userSettings.resolutionScreenHeight * dpiRatio
        };
        this._viewSettings = {
            systemName: capitalize(this.application.systemName),
            screenDimension: this._screenDimension,
            supportRTL: userSettings.supportRTL,
            lineHeightAdjust: userSettings.lineHeightAdjust,
            floatPrecision: this.localSettings.floatPrecision
        };
        super.init();
    }

    public optimize(rendered: T[]) {
        for (let i = 0, length = rendered.length; i < length; ++i) {
            const node = rendered[i];
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
                        const renderTemplates = parent.renderTemplates || (parent.renderTemplates = []);
                        const index = parseInt(node.dataset.androidTargetIndex!);
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
        switch (node.tagName) {
            case 'OBJECT':
            case 'EMBED':
                setObjectContainer(layout);
                return;
            case 'RUBY': {
                const children: T[] = [];
                let title: T[] = [],
                    content: T[] = [],
                    active: Undef<boolean>;
                const createColumn = () => {
                    let rt: Undef<T>,
                        text: Undef<T>,
                        length = title.length;
                    if (length > 1) {
                        rt = this.createNodeGroup(title[0], title, node, { containerType: CONTAINER_NODE.RELATIVE, alignmentType: NODE_ALIGNMENT.HORIZONTAL, delegate: true });
                        rt.css('whiteSpace', 'nowrap');
                        rt.setLayoutWidth('wrap_content');
                    }
                    else if (length) {
                        rt = title[0];
                    }
                    length = content.length;
                    if (length > 1) {
                        text = this.createNodeGroup(content[0], content, node, { containerType: CONTAINER_NODE.RELATIVE, alignmentType: NODE_ALIGNMENT.HORIZONTAL, delegate: true });
                        text.css('whiteSpace', 'nowrap');
                        text.setLayoutWidth('wrap_content');
                    }
                    else if (length) {
                        text = content[0];
                    }
                    if (rt && text) {
                        const group = this.createNodeGroup(rt, [rt, text], node, { containerType: CONTAINER_NODE.LINEAR, alignmentType: NODE_ALIGNMENT.VERTICAL, delegate: true });
                        group.setLayoutWidth('wrap_content');
                        group.setLayoutHeight('wrap_content');
                        group.mergeGravity('gravity', 'center_horizontal');
                        group.android('baselineAlignedChildIndex', '1');
                        children.push(group);
                    }
                    else if (rt) {
                        rt.mergeGravity('layout_gravity', 'bottom');
                        children.push(rt);
                    }
                    else if (text) {
                        text.mergeGravity('layout_gravity', 'bottom');
                        children.push(text);
                    }
                };
                for (const item of layout.toArray()) {
                    switch (item.tagName) {
                        case 'RP':
                        case 'RT':
                            title.push(item);
                            active = true;
                            break;
                        default:
                            if (active) {
                                createColumn();
                                title = [];
                                content = [];
                                active = false;
                            }
                            content.push(item);
                            break;
                    }
                }
                createColumn();
                node.retainAs(children).each((item: T, index) => item.containerIndex = index);
                node.android('baselineAlignedChildIndex', '0');
                layout.setContainerType(CONTAINER_NODE.LINEAR, NODE_ALIGNMENT.HORIZONTAL);
                return;
            }
        }
        if (layout.find(item => !item.pageFlow && !item.autoPosition)) {
            layout.setContainerType(CONTAINER_NODE.CONSTRAINT, NODE_ALIGNMENT.ABSOLUTE | NODE_ALIGNMENT.UNKNOWN);
        }
        else if (layout.size() <= 1) {
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
                    layout.containerType = CONTAINER_NODE.CONSTRAINT;
                }
                else {
                    const parent = layout.parent;
                    if (parent.layoutHorizontal && (parent.layoutRelative || parent.layoutLinear)) {
                        if (child.positionRelative) {
                            layout.setContainerType(CONTAINER_NODE.RELATIVE, NODE_ALIGNMENT.VERTICAL);
                        }
                        else if (child.baselineElement) {
                            layout.setContainerType(CONTAINER_NODE.LINEAR, NODE_ALIGNMENT.HORIZONTAL);
                        }
                        else {
                            layout.containerType = CONTAINER_NODE.FRAME;
                        }
                    }
                    else if (child.baselineElement && (parent.layoutGrid || parent.flexElement && node.flexbox.alignSelf === 'baseline')) {
                        layout.setContainerType(CONTAINER_NODE.LINEAR, NODE_ALIGNMENT.HORIZONTAL);
                    }
                    else {
                        layout.containerType = CONTAINER_NODE.FRAME;
                    }
                }
                layout.addAlign(NODE_ALIGNMENT.SINGLE);
            }
            else {
                this.processUnknownChild(layout);
            }
        }
        else if (Resource.hasLineBreak(node, true)) {
            layout.setContainerType(getVerticalAlignedLayout(layout), NODE_ALIGNMENT.VERTICAL | NODE_ALIGNMENT.UNKNOWN);
        }
        else if (this.checkConstraintFloat(layout)) {
            layout.containerType = CONTAINER_NODE.CONSTRAINT;
            if (!setConstraintFloatAligmnment(layout)) {
                if (layout.linearY) {
                    layout.addAlign(NODE_ALIGNMENT.VERTICAL);
                }
                else if ((layout.every(item => item.inlineFlow) || layout.find(item => item.floating || item.rightAligned)) && layout.singleRowAligned) {
                    layout.addAlign(NODE_ALIGNMENT.HORIZONTAL);
                }
                else {
                    layout.addAlign(layout.find(item => item.blockStatic) ? NODE_ALIGNMENT.VERTICAL : NODE_ALIGNMENT.INLINE);
                    layout.addAlign(NODE_ALIGNMENT.UNKNOWN);
                }
            }
        }
        else if (layout.linearX || layout.singleRowAligned) {
            if (this.checkFrameHorizontal(layout)) {
                layout.addRender(NODE_ALIGNMENT.FLOAT | NODE_ALIGNMENT.HORIZONTAL);
            }
            else if (this.checkConstraintHorizontal(layout)) {
                layout.containerType = CONTAINER_NODE.CONSTRAINT;
            }
            else if (this.checkLinearHorizontal(layout)) {
                layout.containerType = CONTAINER_NODE.LINEAR;
                if (layout.floated) {
                    sortHorizontalFloat(layout.children);
                }
            }
            else {
                layout.containerType = layout.singleRowAligned && isConstraintLayout(layout, false) ? CONTAINER_NODE.CONSTRAINT : CONTAINER_NODE.RELATIVE;
            }
            layout.addAlign(NODE_ALIGNMENT.HORIZONTAL);
        }
        else if (layout.linearY) {
            layout.setContainerType(getVerticalLayout(layout), NODE_ALIGNMENT.VERTICAL | (node.rootElement || layout.find((item, index) => item.inlineFlow && layout.item(index + 1)!.inlineFlow, { end: layout.size() - 1 }) ? NODE_ALIGNMENT.UNKNOWN : 0));
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
            const siblings: T[] = [];
            const clearMap = layout.parent.floatContainer ? this.application.clearMap : null;
            for (const item of layout) {
                if (item.alignedVertically(siblings, clearMap)) {
                    layout.setContainerType(getVerticalLayout(layout), NODE_ALIGNMENT.VERTICAL | NODE_ALIGNMENT.UNKNOWN);
                    return;
                }
                siblings.push(item);
            }
            layout.setContainerType(CONTAINER_NODE.CONSTRAINT, NODE_ALIGNMENT.UNKNOWN);
        }
    }

    public processUnknownChild(layout: ContentUI<T>) {
        const node = layout.node;
        const background = node.visibleStyle.background;
        if (node.tagName === 'OBJECT') {
            setObjectContainer(layout);
        }
        else if (node.inlineText && (background || !node.textEmpty)) {
            layout.containerType = CONTAINER_NODE.TEXT;
        }
        else if (node.blockStatic && node.naturalChildren.length === 0 && (background || node.contentBoxHeight)) {
            layout.containerType = CONTAINER_NODE.FRAME;
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
            node.use === '')
        {
            node.hide();
            layout.next = true;
        }
        else {
            switch (node.tagName) {
                case 'LI':
                case 'OUTPUT':
                    layout.containerType = CONTAINER_NODE.TEXT;
                    break;
                default:
                    if (node.textContent !== '' && (background || !node.pageFlow || node.pseudoElt === '::after')) {
                        layout.containerType = CONTAINER_NODE.TEXT;
                        node.inlineText = true;
                    }
                    else {
                        layout.containerType = CONTAINER_NODE.FRAME;
                        node.exclude({ resource: NODE_RESOURCE.VALUE_STRING });
                    }
                    break;
            }
        }
    }

    public processTraverseHorizontal(layout: LayoutUI<T>, siblings: T[]) {
        const { parent, floated } = layout;
        if (floated && floated.size === 1 && layout.every(item => item.floating)) {
            if (isUnknownParent(parent, CONTAINER_NODE.CONSTRAINT, layout.size())) {
                parent.addAlign(NODE_ALIGNMENT.FLOAT);
                parent.removeAlign(NODE_ALIGNMENT.UNKNOWN);
                return;
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
        else if (layout.size() !== siblings.length || parent.hasAlign(NODE_ALIGNMENT.VERTICAL)) {
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
        const clearMap = this.application.clearMap;
        const { parent, floated } = layout;
        if (layout.find((item, index) => item.lineBreakTrailing && index < layout.size() - 1)) {
            if (!parent.hasAlign(NODE_ALIGNMENT.VERTICAL)) {
                const containerType = getVerticalLayout(layout);
                if (isUnknownParent(parent, containerType, layout.size())) {
                    setVerticalLayout(parent);
                    return;
                }
                else {
                    if (parent.layoutConstraint) {
                        parent.addAlign(NODE_ALIGNMENT.VERTICAL);
                        if (!parent.hasAlign(NODE_ALIGNMENT.ABSOLUTE)) {
                            return;
                        }
                    }
                    layout.node = this.createLayoutGroup(layout);
                    layout.setContainerType(containerType, NODE_ALIGNMENT.VERTICAL | NODE_ALIGNMENT.UNKNOWN);
                }
            }
        }
        else if (floated) {
            if (floated.size === 1 && layout.every(item => item.floating)) {
                layout.node = this.createLayoutGroup(layout);
                layout.setContainerType(CONTAINER_NODE.CONSTRAINT, NODE_ALIGNMENT.FLOAT);
            }
            else if (hasCleared(layout, clearMap)) {
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
                return;
            }
            else {
                if (parent.layoutConstraint) {
                    parent.addAlign(NODE_ALIGNMENT.VERTICAL);
                    if (!parent.hasAlign(NODE_ALIGNMENT.ABSOLUTE)) {
                        return;
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
            layout.containerType = CONTAINER_NODE.CONSTRAINT;
            if (!setConstraintFloatAligmnment(layout)) {
                layout.addAlign(NODE_ALIGNMENT.INLINE);
            }
        }
        else if (this.checkConstraintHorizontal(layout)) {
            layout.setContainerType(CONTAINER_NODE.CONSTRAINT, NODE_ALIGNMENT.HORIZONTAL);
        }
        else if (this.checkLinearHorizontal(layout)) {
            layout.setContainerType(CONTAINER_NODE.LINEAR, NODE_ALIGNMENT.HORIZONTAL);
            if (layout.floated) {
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
                let result: NodeXmlTemplate<T>[] = [];
                for (let i = 0, length = templates.length; i < length; ++i) {
                    const item = templates[i];
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
                const length = nested.length;
                if (length) {
                    const map = new Map<T, NodeXmlTemplate<T>[]>();
                    const invalid: NodeXmlTemplate<T>[] = [];
                    const below: NodeXmlTemplate<T>[] = [];
                    for (let i = 0; i < length; ++i) {
                        const item = nested[i];
                        const node = item.node.innerMostWrapped;
                        const adjacent = node.ascend({ condition: (above: T) => actualParent.includes(above), error: (above: T) => above.rootElement })[0] as Undef<T>;
                        if (adjacent) {
                            const data = map.get(adjacent);
                            if (data) {
                                data.push(item);
                            }
                            else {
                                map.set(adjacent, [item]);
                            }
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
                            for (let i = 0, q = children.length; i < q; ++i) {
                                const item = children[i];
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

    public checkFrameHorizontal(layout: LayoutUI<T>) {
        const floated = layout.floated;
        if (floated) {
            switch (floated.size) {
                case 1:
                    if (layout.node.cssAscend('textAlign') === 'center' && layout.find(item => !item.block && !item.floating)) {
                        return true;
                    }
                    else if (floated.has('right')) {
                        let pageFlow = 0,
                            multiline: Undef<boolean>;
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
                        return layout.linearY || !!layout.find(item => !item.inlineFlow, { start: 1 });
                    }
                    break;
                case 2:
                    return layout.linearY || !!layout.find(item => !item.inlineFlow || item.lineBreakLeading);
            }
        }
        return false;
    }

    public checkConstraintFloat(layout: LayoutUI<T>) {
        if (layout.size() > 1) {
            const clearMap = this.application.clearMap;
            const emptyMap = clearMap.size === 0;
            let A = true,
                B = true;
            for (const node of layout) {
                if (emptyMap || !clearMap.has(node)) {
                    if (A && !(node.floating || node.autoMargin.horizontal || node.inlineDimension && !node.inputElement && !node.controlElement || node.imageContainer || node.marginTop < 0)) {
                        if (!B) {
                            return false;
                        }
                        A = false;
                    }
                    if (B && node.percentWidth === 0) {
                        if (!A) {
                            return false;
                        }
                        B = false;
                    }
                }
            }
            return true;
        }
        return false;
    }

    public checkConstraintHorizontal(layout: LayoutUI<T>) {
        if (layout.size() > 1 && layout.singleRowAligned) {
            switch (layout.floated?.size) {
                case 1:
                    if (hasCleared(layout, this.application.clearMap)) {
                        return false;
                    }
                    else {
                        let left: Undef<boolean>,
                            right: Undef<boolean>;
                        for (const node of layout) {
                            const { float, autoMargin } = node;
                            if (float === 'left' || autoMargin.right) {
                                if (right) {
                                    return false;
                                }
                                left = true;
                            }
                            if (float === 'right' || autoMargin.left) {
                                if (left) {
                                    return false;
                                }
                                right = true;
                            }
                        }
                    }
                    break;
                case 2:
                    return false;
            }
            return !!layout.find(node => (node.blockVertical || node.autoMargin.leftRight || node.marginTop < 0) && Math.floor(node.bounds.bottom) <= Math.ceil(layout.node.box.bottom) || node.percentWidth > 0 && node.percentWidth < 1 && !node.inputElement && !node.controlElement || node.css('verticalAlign') === 'bottom' && !layout.parent.hasHeight && node.inlineVertical);
        }
        return false;
    }

    public checkLinearHorizontal(layout: LayoutUI<T>) {
        if (layout.node.lineHeight === 0 && (!layout.floated || !layout.floated.has('right')) && layout.singleRowAligned) {
            const { fontSize, lineHeight } = layout.item(0) as T;
            const boxWidth = layout.parent.actualBoxWidth();
            let contentWidth = 0;
            for (const node of layout) {
                if (!(node.naturalChild && node.isEmpty() && !node.positionRelative && node.css('verticalAlign') === 'baseline' && !node.multiline && !node.blockVertical && node.lineHeight === lineHeight && node.fontSize === fontSize && node.zIndex === 0 && !node.inputElement && !node.controlElement)) {
                    return false;
                }
                contentWidth += node.linear.width;
                if (contentWidth >= boxWidth) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    public setConstraints(rendering: squared.base.NodeList<T>) {
        rendering.each(node => {
            if (node.rendering && node.visible && node.hasProcedure(NODE_PROCEDURE.CONSTRAINT)) {
                if (node.hasAlign(NODE_ALIGNMENT.AUTO_LAYOUT)) {
                    if (node.layoutConstraint && !node.layoutElement) {
                        this.evaluateAnchors(node.renderChildren as T[]);
                    }
                }
                else if (node.layoutRelative) {
                    this.processRelativeHorizontal(node);
                }
                else if (node.layoutConstraint) {
                    const renderChildren = node.renderChildren as T[];
                    const length = renderChildren.length;
                    const pageFlow: T[] = new Array(length);
                    let j = 0;
                    for (let i = 0; i < length; ++i) {
                        const item = renderChildren[i];
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
                                            item.getAnchorPosition(node, true);
                                        }
                                        if (!constraint.vertical) {
                                            item.getAnchorPosition(node, false);
                                        }
                                    }
                                    if (!constraint.horizontal) {
                                        this.applyGuideline('horizontal', { target: item, parent: node });
                                    }
                                    if (!constraint.vertical) {
                                        this.applyGuideline('vertical', { target: item, parent: node });
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
                            item.setConstraintDimension(1);
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
                if (layout.rowCount) {
                    android.rowCount = layout.rowCount.toString();
                }
                android.columnCount = layout.columnCount ? layout.columnCount.toString() : '1';
                node.apply(options);
                break;
            }
            default:
                if (layout.isEmpty()) {
                    return this.renderNode(layout);
                }
                return;
        }
        node.setControlType(View.getControlName(containerType, node.api), containerType);
        node.addAlign(layout.alignmentType);
        node.render(layout.parent);
        return {
            type: NODE_TEMPLATE.XML,
            node,
            controlName: node.controlName
        };
    }

    public renderNode(layout: ContentUI<T>): NodeXmlTemplate<T> {
        const node = layout.node;
        let { parent, containerType } = layout,
            controlName = View.getControlName(containerType, node.api);
        const setReadOnly = () => {
            const element = node.element as HTMLInputElement;
            if (element.readOnly) {
                node.android('focusable', 'false');
            }
            if (element.disabled) {
                node.android('enabled', 'false');
            }
        };
        const setInlineBlock = () => {
            const { centerAligned, rightAligned } = node;
            node.css('display', 'inline-block', true);
            node.setCacheValue('centerAligned', centerAligned);
            node.setCacheValue('rightAligned', rightAligned);
        };
        const setBoundsWidth = () => node.css('width', formatPX(node.bounds.width - (node.contentBox ? node.contentBoxWidth : 0)), true);
        const setBoundsHeight = () => node.css('height', formatPX(node.bounds.height - (node.contentBox ? node.contentBoxHeight : 0)), true);
        switch (node.tagName) {
            case 'IMG':
            case 'CANVAS': {
                const element = node.element as HTMLImageElement;
                let imageSet: Undef<ImageSrcSet[]>;
                if (node.actualParent!.tagName === 'PICTURE') {
                    imageSet = getSrcSet(element, this.localSettings.mimeType.image);
                    if (imageSet) {
                        const setImageDimension = (width: number, image: Undef<ImageAsset>) => {
                            node.css('width', formatPX(width), true);
                            if (image && image.width && image.height) {
                                const height = image.height * (width / image.width);
                                node.css('height', formatPX(height), true);
                            }
                        };
                        const image = imageSet[0];
                        if (image.actualWidth) {
                            setImageDimension(image.actualWidth, this.application.resourceHandler.getImage(element.src));
                        }
                        else {
                            const stored = this.application.resourceHandler.getImage(image.src);
                            if (stored) {
                                setImageDimension(stored.width, stored);
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
                            this.application.resourceHandler.writeRawImage({ mimeType: 'image/png', filename: src + '.png', data, encoding: 'base64' });
                        }
                    }
                    else {
                        src = (this.application.resourceHandler as android.base.Resource<T>).addImageSrc(element, '', imageSet);
                    }
                    if (src) {
                        node.android('src', `@drawable/${src}`);
                    }
                }
                if (!node.pageFlow && parent === node.absoluteParent && (node.left < 0 && parent.css('overflowX') === 'hidden' || node.top < 0 && parent.css('overflowY') === 'hidden')) {
                    const container = this.application.createNode(node.sessionId, { parent, innerWrapped: node });
                    container.setControlType(CONTAINER_TAGNAME.FRAME, CONTAINER_NODE.FRAME);
                    container.inherit(node, 'base');
                    container.cssCopy(node, 'position', 'zIndex');
                    container.exclude({ resource: NODE_RESOURCE.ALL, procedure: NODE_PROCEDURE.ALL });
                    container.autoPosition = false;
                    if (node.percentWidth && parent.layoutConstraint && (parent.blockStatic || parent.hasWidth)) {
                        container.app('layout_constraintWidth_percent', truncate(node.percentWidth, node.localSettings.floatPrecision));
                        container.setLayoutHeight('0px');
                    }
                    else if (node.hasPX('width')) {
                        container.setLayoutWidth(formatPX(node.actualWidth));
                    }
                    else {
                        container.setLayoutWidth('wrap_content');
                    }
                    if (node.percentHeight && parent.layoutConstraint) {
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
                            controlName: CONTAINER_TAGNAME.FRAME
                        } as NodeXmlTemplate<T>
                    );
                    parent = container;
                    layout.parent = container;
                }
                break;
            }
            case 'INPUT': {
                const element = node.element as HTMLInputElement;
                const setInputMinMax = () => {
                    if (element.min) {
                        node.android('min', element.min);
                    }
                    if (element.max) {
                        node.android('max', element.max);
                    }
                };
                const setInputMinDimension = () => {
                    if (element.minLength !== -1) {
                        node.android('minLength', element.minLength.toString());
                    }
                    if (element.maxLength) {
                        node.android('maxLength', element.maxLength.toString());
                    }
                };
                switch (element.type) {
                    case 'radio':
                    case 'checkbox':
                        if (element.checked) {
                            node.android('checked', 'true');
                        }
                        node.exclude({ resource: NODE_RESOURCE.BOX_STYLE });
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
                        setInputMinMax();
                        break;
                    case 'time':
                        node.android('inputType', 'time');
                        setInputMinMax();
                        break;
                    case 'date':
                        node.android('inputType', 'date');
                        setInputMinMax();
                        break;
                    case 'datetime-local':
                        node.android('inputType', 'datetime');
                        setInputMinMax();
                        break;
                    case 'email':
                        node.android('inputType', 'textEmailAddress');
                        setInputMinDimension();
                        break;
                    case 'tel':
                        node.android('inputType', 'phone');
                        setInputMinDimension();
                        break;
                    case 'url':
                        node.android('inputType', 'textUri');
                        setInputMinDimension();
                        break;
                    case 'week':
                    case 'month':
                    case 'search':
                        node.android('inputType', 'text');
                        setInputMinDimension();
                        break;
                    case 'image':
                    case 'color':
                        if (!node.hasWidth) {
                            setBoundsWidth();
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
                node.android('minLines', rows ? rows.toString() : '2');
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
                if (maxLength) {
                    node.android('maxLength', maxLength.toString());
                }
                if (!node.hasWidth && cols > 0) {
                    node.css('width', formatPX(cols * 8));
                }
                if (!node.hasHeight) {
                    setBoundsHeight();
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
                    setInlineBlock();
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
                    setBoundsWidth();
                }
                if (!node.hasHeight) {
                    setBoundsHeight();
                }
                node.android('progressTint', `@color/${Resource.addColor(foregroundColor!)}`);
                node.android('progressBackgroundTint', `@color/${Resource.addColor(backgroundColor!)}`);
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
                if (Resource.hasMimeType(videoMimeType, src)) {
                    mimeType = parseMimeType(src);
                }
                else {
                    src = '';
                    iterateArray(element.children, (source: HTMLSourceElement) => {
                        if (source.tagName === 'SOURCE') {
                            if (Resource.hasMimeType(videoMimeType, source.src)) {
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
                    });
                }
                if (!node.hasPX('width')) {
                    setBoundsWidth();
                }
                if (!node.hasPX('height')) {
                    setBoundsHeight();
                }
                if (node.inline) {
                    setInlineBlock();
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
            case CONTAINER_TAGNAME.TEXT: {
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
                        const colorData = parseColor(match[1] || node.css('color'));
                        if (colorData) {
                            const colorName = Resource.addColor(colorData);
                            if (colorName !== '') {
                                const precision = node.localSettings.floatPrecision;
                                node.android('shadowColor', `@color/${colorName}`);
                                node.android('shadowDx', truncate(node.parseWidth(match[2]) * 2, precision));
                                node.android('shadowDy', truncate(node.parseHeight(match[3]) * 2, precision));
                                node.android('shadowRadius', truncate(match[4] ? Math.max(node.parseWidth(match[4]), 0) : 0.01, precision));
                            }
                        }
                    }
                }
                switch (node.css('whiteSpace')) {
                    case 'nowrap':
                        node.android('singleLine', 'true');
                        if (node.css('textOverflow') === 'ellipsis' && node.css('overflow') === 'hidden') {
                            node.android('ellipsize', 'end');
                        }
                        break;
                    case 'pre':
                        node.android('breakStrategy', 'simple');
                        break;
                    default:
                        if (node.css('overflowWrap') === 'break-word') {
                            node.android('breakStrategy', 'high_quality');
                        }
                        break;
                }
                break;
            }
            case CONTAINER_TAGNAME.BUTTON:
                if (!node.hasHeight) {
                    node.android('minHeight', formatPX(Math.ceil(node.actualHeight)));
                }
                node.mergeGravity('gravity', 'center_vertical');
                setReadOnly();
                break;
            case CONTAINER_TAGNAME.SELECT:
            case CONTAINER_TAGNAME.CHECKBOX:
            case CONTAINER_TAGNAME.RADIO:
                setReadOnly();
                break;
            case CONTAINER_TAGNAME.EDIT:
                if (!node.companion && node.hasProcedure(NODE_PROCEDURE.ACCESSIBILITY)) {
                    [node.previousSibling, node.nextSibling].some((sibling: T) => {
                        if (sibling && sibling.visible && sibling.pageFlow) {
                            const id = node.elementId;
                            if (id !== '' && id === sibling.toElementString('htmlFor').trim()) {
                                sibling.android('labelFor', node.documentId);
                                return true;
                            }
                            else if (sibling.textElement && sibling.documentParent.tagName === 'LABEL') {
                                (sibling.documentParent as T).android('labelFor', node.documentId);
                                return true;
                            }
                        }
                        return false;
                    });
                }
                if ((node.element as HTMLInputElement).list?.children.length) {
                    controlName = CONTAINER_TAGNAME.EDIT_LIST;
                }
                else if (node.api >= BUILD_VERSION.OREO) {
                    node.android('importantForAutofill', 'no');
                }
                setReadOnly();
            case CONTAINER_TAGNAME.RANGE:
                if (!node.hasPX('width')) {
                    setBoundsWidth();
                }
                break;
            case CONTAINER_TAGNAME.LINE:
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
        return this.getEnclosingXmlTag(controlName, this.userSettings.showAttributes ? node.extractAttributes(1) : '', attrs.content);
    }

    public renderSpace(attrs: RenderSpaceAttribute) {
        const android = attrs.android;
        let { width, height } = attrs;
        if (width) {
            if (width.endsWith('%')) {
                android.layout_columnWeight = truncate(parseFloat(width) / 100, this.localSettings.floatPrecision);
                width = '0px';
            }
        }
        else {
            width = 'wrap_content';
        }
        if (height) {
            if (height.endsWith('%')) {
                android.layout_rowWeight = truncate(parseFloat(height) / 100, this.localSettings.floatPrecision);
                height = '0px';
            }
        }
        else {
            height = 'wrap_content';
        }
        if (attrs.column !== undefined) {
            android.layout_column = attrs.column.toString();
        }
        if (attrs.columnSpan) {
            android.layout_columnSpan = attrs.columnSpan.toString();
        }
        if (attrs.row !== undefined) {
            android.layout_row = attrs.row.toString();
        }
        if (attrs.rowSpan) {
            android.layout_rowSpan = attrs.rowSpan.toString();
        }
        const result: ViewAttribute = {
            android,
            app: attrs.app
        };
        const output = this.renderNodeStatic({ controlName: CONTAINER_TAGNAME.SPACE, width, height }, result);
        attrs.documentId = result.documentId;
        return output;
    }

    public addGuideline(options: GuidelineOptions<T>) {
        this.applyGuideline('horizontal', options);
        this.applyGuideline('vertical', options);
    }

    public addBarrier(nodes: T[], barrierDirection: string) {
        const unbound: T[] = [];
        for (let i = 0, length = nodes.length; i < length; ++i) {
            const node = nodes[i];
            const barrier = node.constraint.barrier;
            if (!barrier) {
                node.constraint.barrier = {};
            }
            else if (barrier[barrierDirection]) {
                continue;
            }
            unbound.push(node);
        }
        const length = unbound.length;
        if (length) {
            const options: ViewAttribute = {
                android: {},
                app: {
                    barrierDirection,
                    constraint_referenced_ids: concatString(plainMap(unbound, item => getDocumentId(item.anchorTarget.documentId)), ',')
                }
            };
            const { api, anchorTarget } = unbound[length - 1];
            const content = this.renderNodeStatic({ controlName: api < BUILD_VERSION.Q ? CONTAINER_TAGNAME.BARRIER : CONTAINER_TAGNAME_X.BARRIER }, options);
            switch (barrierDirection) {
                case 'top':
                case 'left':
                    this.addBeforeOutsideTemplate(anchorTarget as T, content, false);
                    break;
                default:
                    this.addAfterOutsideTemplate(anchorTarget as T, content, false);
                    break;
            }
            const documentId = options.documentId;
            if (documentId) {
                for (let i = 0; i < length; ++i) {
                    unbound[i].constraint.barrier![barrierDirection] = documentId;
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
        for (let i = 0; i < length; ++i) {
            const node = nodes[i];
            if (node.constraint.horizontal) {
                horizontalAligned.push(node);
            }
            if (node.constraint.vertical) {
                verticalAligned.push(node);
            }
            if (node.alignParent('top') || node.alignSibling('top') !== '') {
                let current = node;
                do {
                    const bottomTop = current.alignSibling('bottomTop');
                    if (bottomTop !== '') {
                        const next = nodes.find(item => item.documentId === bottomTop);
                        if (next && next.alignSibling('topBottom') === current.documentId) {
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
        for (let i = 0; i < length; ++i) {
            const node = nodes[i];
            if (node.anchored) {
                continue;
            }
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

    public createNodeGroup(node: T, children: T[], parent?: T, options?: CreateNodeGroupUIOptions) {
        let containerType: Undef<number>,
            alignmentType: Undef<number>,
            delegate: Undef<boolean>,
            cascade: Undef<boolean>;
        if (options) {
            ({ containerType, alignmentType, delegate, cascade } = options);
        }
        const container = new ViewGroup(this.application.nextId, node, children, parent) as T;
        if (containerType) {
            container.setControlType(View.getControlName(containerType, node.api), containerType);
        }
        if (alignmentType) {
            container.addAlign(alignmentType);
        }
        this.afterInsertNode(container);
        if (parent) {
            if (!parent.contains(container)) {
                parent.add(container);
                container.init(parent, node.depth);
                container.containerIndex = parent.size() - 1;
            }
        }
        else {
            container.containerIndex = node.containerIndex;
        }
        this.application.getProcessingCache(node.sessionId).add(container, !!delegate, !!cascade);
        return container;
    }

    public createNodeWrapper(node: T, parent: T, options: ICreateNodeWrapperUIOptions<T> = {}) {
        const { children, containerType, alignmentType } = options;
        const container = this.application.createNode(node.sessionId, {
            parent,
            children,
            append: true,
            innerWrapped: node,
            delegate: true,
            cascade: !!(options.cascade || children && children.length > 0 && !node.rootElement)
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
        if (options.resetContentBox) {
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
        }
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
            if (parseFloat(columnWeight)) {
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

    protected processRelativeHorizontal(node: T) {
        let autoPosition: Undef<boolean>;
        if (node.hasAlign(NODE_ALIGNMENT.VERTICAL)) {
            let previous: Undef<T>;
            node.renderEach((item: T) => {
                if (previous) {
                    item.anchor('topBottom', previous.documentId);
                }
                else {
                    item.anchor('top', 'true');
                }
                if (item.pageFlow) {
                    if (item.rightAligned) {
                        item.anchor('right');
                    }
                    else if (item.centerAligned) {
                        item.anchorParent('horizontal');
                    }
                    else {
                        item.anchor('left');
                    }
                    previous = item;
                }
                else {
                    item.anchor('left');
                    autoPosition = true;
                }
            });
        }
        else {
            const children = flattenContainer(node) as T[];
            const rowsAll: [Undef<T>, T[][], boolean][] = [];
            const documentParent = node.nodeGroup ? node.documentParent : node;
            let textIndent = 0,
                rightAligned: Undef<boolean>,
                centerAligned: Undef<boolean>;
            switch ((!node.naturalElement && children[0].actualParent || node).cssAscend('textAlign', { startSelf: true })) {
                case 'center':
                    centerAligned = true;
                    break;
                case 'right':
                case 'end':
                    rightAligned = true;
                    break;
            }
            {
                const clearMap = this.application.clearMap;
                const emptyMap = clearMap.size === 0;
                const baseWidth = node.marginLeft + node.marginRight < 0 ? node.marginRight : 0;
                const lineWrap = node.css('whiteSpace') !== 'nowrap';
                let boxWidth = documentParent.actualBoxWidth(getBoxWidth(node)),
                    rowWidth = baseWidth,
                    rows!: T[][],
                    items!: T[],
                    previous!: T,
                    siblings: Null<Element[]> = null,
                    currentFloated: Null<T> = null,
                    currentFloatedWidth = 0,
                    currentFloatedHeight = 0;
                const setCurrentFloated = (item: T) => {
                    currentFloated = item;
                    currentFloatedHeight = Math.floor(item.marginTop + item.bounds.height + Math.max(0, item.marginBottom) + (item.positionRelative ? item.hasPX('top') ? item.top : item.bottom * -1 : 0));
                };
                const createNewRow = (item: T, floating: boolean) => {
                    if (currentFloated) {
                        items = [item];
                        rows.push(items);
                    }
                    else if (floating) {
                        items = [];
                        rows = [items];
                        rowsAll.push([item, rows, true]);
                        setCurrentFloated(item);
                    }
                    else {
                        items = [item];
                        rows = [items];
                        rowsAll.push([undefined, rows, false]);
                    }
                    rowWidth = baseWidth;
                };
                const setRowWidth = (item: T, textWidth: number) => {
                    const linearWidth = item.marginLeft + textWidth + item.marginRight;
                    if (item !== currentFloated) {
                        rowWidth += linearWidth;
                    }
                    else {
                        currentFloatedWidth = linearWidth;
                    }
                    previous = item;
                };
                const relativeWrapWidth = (item: T, textWidth: number) => Math.floor(currentFloatedWidth + rowWidth + textWidth - (item.inlineStatic && item.styleElement ? item.contentBoxWidth : 0)) > Math.ceil(boxWidth + (rowsAll.length === 1 ? textIndent * -1 : 0));
                const isMultiline = (item: T) => item.plainText && Resource.hasLineBreak(item, false, true) || item.preserveWhiteSpace && /^\s*\n+/.test(item.textContent);
                if (node.naturalElement) {
                    if (node.blockDimension) {
                        textIndent = node.parseUnit(node.css('textIndent'));
                        if (textIndent < 0) {
                            node.setCacheValue('paddingLeft', Math.max(0, node.paddingLeft + textIndent));
                        }
                    }
                    if (node.floating) {
                        const nextSibling = node.nextSibling;
                        if (nextSibling && nextSibling.floating && nextSibling.float !== node.float && nextSibling.hasWidth) {
                            boxWidth = Math.max(boxWidth, node.actualParent!.box.width - nextSibling.linear.width);
                            if (boxWidth > node.width && !node.visibleStyle.background && !node.hasPX('maxWidth')) {
                                node.css('width', formatPX(boxWidth), true);
                            }
                        }
                    }
                }
                else if (documentParent.layoutVertical) {
                    textIndent = documentParent.parseUnit(documentParent.css('textIndent'));
                    if (textIndent < 0 && documentParent.getBox(BOX_STANDARD.PADDING_LEFT)[1] === 0) {
                        documentParent.modifyBox(BOX_STANDARD.PADDING_LEFT, textIndent, false);
                    }
                }
                for (let i = 0, length = children.length, start = true; i < length; ++i) {
                    const item = children[i];
                    if (!item.pageFlow) {
                        if (start) {
                            item.anchor('left', 'true');
                            item.anchor('top', 'true');
                        }
                        else {
                            const documentId = previous.documentId;
                            if (previous === currentFloated && currentFloated!.float === 'right') {
                                item.anchor('left', 'true');
                            }
                            else {
                                item.anchor(rightAligned ? 'rightLeft' : 'leftRight', documentId);
                            }
                            item.anchor('top', documentId);
                        }
                        autoPosition = true;
                        continue;
                    }
                    const { floating, textWidth } = item;
                    if (start) {
                        createNewRow(item, floating);
                        start = false;
                    }
                    else {
                        let multiline = item.multiline,
                            textNewRow: Undef<boolean>;
                        if (multiline && Math.floor(textWidth) <= boxWidth && !isMultiline(item)) {
                            multiline = false;
                            if (!item.hasPX('width')) {
                                item.multiline = false;
                            }
                        }
                        siblings = item.naturalChild && previous.naturalChild && item.inlineVertical && previous.inlineVertical && item.previousSibling !== previous ? getElementsBetweenSiblings(previous.element, item.element!) : null;
                        if (item.textElement) {
                            if (!floating && REGEXP_TEXTSYMBOL.test(item.textContent)) {
                                items.push(item);
                                setRowWidth(item, textWidth);
                                continue;
                            }
                            else {
                                let checkWidth = lineWrap;
                                if (previous.textElement) {
                                    if (i === 1 && item.plainText && item.previousSibling === previous && !/^\s+/.test(item.textContent) && !/\s+$/.test(previous.textContent)) {
                                        checkWidth = false;
                                    }
                                    else if (lineWrap && previous.multiline && (previous.bounds.width >= boxWidth || item.plainText && Resource.hasLineBreak(previous, false, true))) {
                                        textNewRow = true;
                                        checkWidth = false;
                                    }
                                }
                                if (checkWidth) {
                                    textNewRow = relativeWrapWidth(item, textWidth) || item.actualParent!.tagName !== 'CODE' && (multiline && item.plainText || isMultiline(item));
                                }
                            }
                        }
                        else {
                            textNewRow = relativeWrapWidth(item, textWidth);
                        }
                        if (previous.floating) {
                            if (previous.float === 'left') {
                                if (previous.marginRight < 0) {
                                    const right = Math.abs(previous.marginRight);
                                    item.modifyBox(BOX_STANDARD.MARGIN_LEFT, previous.actualWidth + (previous.hasWidth ? previous.paddingLeft + previous.borderLeftWidth : 0) - right);
                                    item.anchor('left', previous.documentId);
                                    item.constraint.horizontal = true;
                                    previous.setBox(BOX_STANDARD.MARGIN_RIGHT, { reset: 1 });
                                }
                            }
                            else if (item.float === 'right' && previous.marginLeft < 0) {
                                const left = Math.abs(previous.marginLeft);
                                const width = previous.actualWidth;
                                if (left < width) {
                                    item.modifyBox(BOX_STANDARD.MARGIN_RIGHT, width - left);
                                }
                                item.anchor('right', previous.documentId);
                                item.constraint.horizontal = true;
                                previous.setBox(BOX_STANDARD.MARGIN_LEFT, { reset: 1 });
                            }
                        }
                        if (textNewRow ||
                            Math.ceil(item.bounds.top) >= Math.floor(previous.bounds.bottom) && (item.blockStatic || item.blockDimension && item.baseline || floating && previous.float === item.float || node.preserveWhiteSpace) ||
                            !floating && (previous.blockStatic || item.siblingsLeading.some(sibling => sibling.excluded && sibling.blockStatic) || siblings && siblings.some(element => causesLineBreak(element))) ||
                            floating && !currentFloated && item.float === 'right' && item.previousSibling?.multiline ||
                            previous.autoMargin.horizontal ||
                            !emptyMap && clearMap.has(item) ||
                            Resource.checkPreIndent(previous))
                        {
                            if (!emptyMap && clearMap.has(item)) {
                                item.setBox(BOX_STANDARD.MARGIN_TOP, { reset: 1 });
                                currentFloated = null;
                                currentFloatedWidth = 0;
                            }
                            else if (currentFloated) {
                                let height = 0;
                                for (let j = 0, q = rows.length; j < q; ++j) {
                                    height += Math.ceil(Math.max(...plainMap(rows[j], sibling => Math.max(sibling.lineHeight, sibling.linear.height))));
                                }
                                if (height >= currentFloatedHeight) {
                                    currentFloated = null;
                                    currentFloatedWidth = 0;
                                }
                            }
                            switch (item.tagName) {
                                case 'SUP':
                                case 'SUB':
                                    if (!floating && !previous.floating) {
                                        items.pop();
                                        createNewRow(previous, false);
                                        setRowWidth(previous, previous.textWidth);
                                        items.push(item);
                                        break;
                                    }
                                default:
                                    createNewRow(item, floating);
                                    break;
                            }
                        }
                        else if (floating && !currentFloated && item.float === 'left') {
                            lastItemOf(rowsAll)![0] = item;
                            setCurrentFloated(item);
                        }
                        else {
                            if (currentFloated !== previous && !previous.hasPX('width')) {
                                previous.multiline = false;
                            }
                            if (floating) {
                                lastItemOf(rowsAll)![2] = true;
                            }
                            items.push(item);
                            if (siblings && siblings.some(element => getElementAsNode<T>(element, item.sessionId) || causesLineBreak(element))) {
                                const betweenStart = getRangeClientRect(siblings[0]);
                                if (betweenStart && !betweenStart.numberOfLines) {
                                    const betweenEnd = siblings.length > 1 && getRangeClientRect(siblings.pop()!);
                                    if (!betweenEnd || !betweenEnd.numberOfLines) {
                                        rowWidth += betweenEnd ? betweenStart.left - betweenEnd.right : betweenStart.width;
                                    }
                                }
                            }
                        }
                    }
                    setRowWidth(item, textWidth);
                }
            }
            {
                const length = rowsAll.length;
                const horizontalRows: T[][] = [];
                const firstLineStyle = node.firstLineStyle;
                const textAlignLast = length > 1 ? node.textAlignLast : '';
                const singleLine = !documentParent.preserveWhiteSpace && documentParent.tagName !== 'CODE';
                let previousBaseline: Null<T> = null,
                    float: Undef<string>,
                    baseline: Null<T>;
                const setLayoutBelow = (item: T) => {
                    if (previousBaseline) {
                        item.anchor('topBottom', previousBaseline.documentId);
                    }
                    else {
                        item.anchor('top', 'true');
                    }
                };
                const applyFirstLine = (item: T) => {
                    if (item.textElement) {
                        const plainText = item.plainText && !item.naturalElement;
                        for (const attr in firstLineStyle) {
                            if (!plainText) {
                                const value = item.cssInitial(attr);
                                if (value !== '') {
                                    continue;
                                }
                            }
                            item.css(attr, firstLineStyle[attr]);
                        }
                        item.unsetCache('textStyle');
                    }
                };
                const isMultilineSegment = (item: T) => item.contentAltered && !item.naturalChild && item.inlineText;
                for (let i = 0; i < length; ++i) {
                    const [currentFloated, rows, floating] = rowsAll[i];
                    if (currentFloated) {
                        node.floatContainer = true;
                        currentFloated.anchor(currentFloated.float as AnchorPositionAttr, 'true');
                        setLayoutBelow(currentFloated);
                        float = currentFloated.float;
                    }
                    else {
                        float = '';
                    }
                    const setTextIndent = (item: T) => {
                        if (i > 0 && textIndent < 0) {
                            item.modifyBox(BOX_STANDARD.MARGIN_LEFT, float === 'left' ? Math.max(-(currentFloated!.linear.width + textIndent), 0) : textIndent * -1);
                        }
                    };
                    for (let j = 0, q = rows.length; j < q; ++j) {
                        const items = rows[j];
                        let r = items.length;
                        for (let k = 0; k < r - 1; ++k) {
                            const item = items[k];
                            if (isMultilineSegment(item)) {
                                const element = item.element;
                                if (element) {
                                    let textContent = '',
                                        width = 0,
                                        index: Undef<number>;
                                    const start = k + 1;
                                    for (let l = start; l < r; ++l) {
                                        const next = items[l];
                                        if (isMultilineSegment(next) && next.element === element) {
                                            textContent += next.textContent;
                                            width += next.bounds.width;
                                            next.hide({ remove: true });
                                            next.exclude({ resource: NODE_RESOURCE.VALUE_STRING });
                                            index = l;
                                        }
                                        else {
                                            break;
                                        }
                                    }
                                    if (index) {
                                        let last = items[index],
                                            textRemainder = '',
                                            widthRemainder = 0;
                                        if (k === 0 && index === r - 1 && q === 1 && i < length - 1 && !currentFloated && textAlignLast === '' && (i > 0 || textIndent >= 0 && !firstLineStyle)) {
                                            const nodes: T[] = [];
                                            invalid: {
                                                for (let l = i + 1; l < length; ++l) {
                                                    const [nextFloated, nextRows] = rowsAll[l];
                                                    if (!nextFloated && nextRows.length === 1) {
                                                        const row = nextRows[0];
                                                        for (let m = 0, n = row.length; m < n; ++m) {
                                                            const next = row[m];
                                                            if (isMultilineSegment(next) && next.element === element) {
                                                                textRemainder += next.textContent;
                                                                widthRemainder += next.bounds.width;
                                                                nodes.push(next);
                                                            }
                                                            else {
                                                                textRemainder = '';
                                                                widthRemainder = 0;
                                                                break invalid;
                                                            }
                                                        }
                                                    }
                                                    else {
                                                        textRemainder = '';
                                                        widthRemainder = 0;
                                                        break;
                                                    }
                                                }
                                            }
                                            if (textRemainder !== '') {
                                                const s = nodes.length;
                                                for (let l = 0; l < s; ++l) {
                                                    const sibling = nodes[l];
                                                    sibling.hide({ remove: true });
                                                    sibling.exclude({ resource: NODE_RESOURCE.VALUE_STRING });
                                                }
                                                last = nodes[s - 1];
                                                item.multiline = true;
                                                j = q;
                                                i = length;
                                            }
                                        }
                                        item.textContent = item.textContent + textContent + textRemainder;
                                        item.bounds.width += width + widthRemainder;
                                        item.setCacheValue('marginRight', last.marginRight + last.getBox(BOX_STANDARD.MARGIN_RIGHT)[1]);
                                        item.siblingsTrailing = last.siblingsTrailing;
                                        item.lineBreakTrailing = last.lineBreakTrailing;
                                        last.registerBox(BOX_STANDARD.MARGIN_BOTTOM, item);
                                        items.splice(start, index - k);
                                        r = items.length;
                                    }
                                }
                            }
                        }
                        if (r > 1) {
                            const bottomAligned = getTextBottom(items);
                            let textBottom = bottomAligned[0] as UndefNull<T>,
                                offsetTop = 0,
                                offsetBottom = 0,
                                maxCenter: Null<T> = null,
                                maxCenterHeight = 0,
                                checkBottom: Undef<boolean>,
                                previousFloatRight: Undef<T>,
                                textBaseline: UndefNull<T>;
                            baseline = NodeUI.baseline(textBottom ? items.filter(item => !bottomAligned.includes(item)) : items);
                            if (baseline && textBottom) {
                                if (baseline !== textBottom && baseline.bounds.height < textBottom.bounds.height) {
                                    baseline.anchor('bottom', textBottom.documentId);
                                }
                                else {
                                    baseline = NodeUI.baseline(items);
                                    textBottom = null;
                                }
                            }
                            if (floating) {
                                items.sort((a, b) => {
                                    const floatA = a.float;
                                    const floatB = b.float;
                                    if (floatA === 'left' && floatB === 'left') {
                                        return 0;
                                    }
                                    else if (floatA === 'left') {
                                        return -1;
                                    }
                                    else if (floatB === 'left') {
                                        return 1;
                                    }
                                    return 0;
                                });
                                checkBottom = true;
                            }
                            const baselineAlign: T[] = [];
                            for (let k = 0; k < r; ++k) {
                                const item = items[k];
                                if (firstLineStyle && i === 0 && j === 0) {
                                    applyFirstLine(item);
                                }
                                if (!item.constraint.horizontal) {
                                    const setAlignLeft = () => {
                                        if (k === 0) {
                                            if (float === 'left') {
                                                item.anchor('leftRight', currentFloated!.documentId);
                                            }
                                            else {
                                                item.anchor('left', 'true');
                                            }
                                            setTextIndent(item);
                                        }
                                        else {
                                            item.anchor('leftRight', items[k - 1].documentId);
                                        }
                                        if (r === 1 && item.textElement && centerAligned) {
                                            item.android('textAlignment', 'center');
                                        }
                                    };
                                    const setAlignRight = () => {
                                        if (float === 'right') {
                                            item.anchor('rightLeft', currentFloated!.documentId);
                                        }
                                        else {
                                            item.anchor('right', 'true');
                                        }
                                        if (r === 1 && item.textElement) {
                                            item.android('textAlignment', 'textEnd');
                                        }
                                    };
                                    if (item.autoMargin.horizontal) {
                                        if (item.autoMargin.leftRight) {
                                            item.anchor('centerHorizontal', 'true');
                                        }
                                        else if (item.autoMargin.left) {
                                            setAlignRight();
                                        }
                                        else {
                                            setAlignLeft();
                                        }
                                    }
                                    else if (item.float === 'right') {
                                        if (previousFloatRight) {
                                            item.anchor('rightLeft', previousFloatRight.documentId);
                                        }
                                        else {
                                            setAlignRight();
                                        }
                                        previousFloatRight = item;
                                    }
                                    else if (rightAligned) {
                                        if (k === r - 1) {
                                            setAlignRight();
                                        }
                                        else {
                                            item.anchor('rightLeft', items[k + 1].documentId);
                                        }
                                    }
                                    else {
                                        setAlignLeft();
                                    }
                                }
                                if (singleLine) {
                                    item.setSingleLine(true, k === r - 1);
                                }
                                if (item === baseline || item.baselineAltered || item === textBottom) {
                                    continue;
                                }
                                else if (i === 0 && item.controlElement) {
                                    item.setBox(BOX_STANDARD.MARGIN_TOP, { reset: 1, adjustment: item.bounds.top - node.box.top });
                                    item.anchor('top', 'true');
                                    item.baselineAltered = true;
                                    continue;
                                }
                                const verticalAlign = item.verticalAlign;
                                if (item.multiline) {
                                    checkBottom = true;
                                }
                                if (item.baseline) {
                                    baselineAlign.push(item);
                                }
                                else if (item.inlineVertical) {
                                    switch (item.css('verticalAlign')) {
                                        case 'text-top':
                                            if (textBaseline === undefined) {
                                                textBaseline = NodeUI.baseline(items, true);
                                            }
                                            if (textBaseline && item !== textBaseline) {
                                                item.anchor('top', textBaseline.documentId);
                                                continue;
                                            }
                                            else if (baseline) {
                                                item.anchor('top', baseline.documentId);
                                                continue;
                                            }
                                            break;
                                        case 'top':
                                            if (i === 0) {
                                                item.anchor('top', 'true');
                                                continue;
                                            }
                                            break;
                                        case 'middle': {
                                            const height = item.actualHeight;
                                            if (height > maxCenterHeight) {
                                                maxCenter = item;
                                                maxCenterHeight = height;
                                            }
                                            if (length === 1) {
                                                item.anchor('centerVertical', 'true');
                                                continue;
                                            }
                                            else if (baseline) {
                                                const heightParent = baseline.actualHeight;
                                                if (height < heightParent) {
                                                    item.anchor('top', baseline.documentId);
                                                    item.setBox(BOX_STANDARD.MARGIN_TOP, { reset: 1, adjustment: Math.round((heightParent - height) / 2) });
                                                    item.baselineAltered = true;
                                                    continue;
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
                                                continue;
                                            }
                                            else if (baseline) {
                                                item.anchor('bottom', baseline.documentId);
                                                continue;
                                            }
                                            break;
                                        case 'bottom':
                                            if (length === 1 && node.hasHeight) {
                                                item.anchor('bottom', 'true');
                                                continue;
                                            }
                                            break;
                                    }
                                    if (baseline) {
                                        if (verticalAlign !== 0) {
                                            item.modifyBox(BOX_STANDARD.MARGIN_TOP, verticalAlign * -1);
                                            item.baselineAltered = true;
                                        }
                                        item.anchor('top', baseline.documentId);
                                    }
                                }
                                if (verticalAlign !== 0) {
                                    if (verticalAlign > 0) {
                                        if (i > 0 || node.renderParent!.layoutVertical && items.every(sibling => !sibling.rendering)) {
                                            offsetTop = Math.max(verticalAlign, offsetTop);
                                        }
                                    }
                                    else if (i < length - 1) {
                                        offsetBottom = Math.min(verticalAlign, offsetBottom);
                                    }
                                }
                            }
                            const s = baselineAlign.length;
                            if (baseline) {
                                baseline.baselineActive = true;
                                if (s) {
                                    setBaselineItems(node, baseline, baselineAlign, i);
                                }
                                else if (baseline.multiline) {
                                    const { left, height } = baseline.bounds;
                                    for (let l = 0; l < r; ++l) {
                                        const item = items[l];
                                        if (item === baseline) {
                                            break;
                                        }
                                        else if (left < item.bounds.right && height < item.bounds.height) {
                                            baseline.anchor('bottom', item.documentId);
                                            break;
                                        }
                                    }
                                }
                                if (baseline.alignSibling('bottom') === '') {
                                    if (maxCenter && maxCenterHeight > baseline.actualHeight) {
                                        baseline.setBox(BOX_STANDARD.MARGIN_TOP, { reset: 1, adjustment: baseline.bounds.top - maxCenter.bounds.top });
                                        baseline = maxCenter;
                                        maxCenter.anchorDelete('top');
                                    }
                                    else {
                                        if (offsetTop !== 0) {
                                            baseline.modifyBox(BOX_STANDARD.MARGIN_TOP, offsetTop);
                                        }
                                        if (offsetBottom !== 0) {
                                            baseline.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, Math.abs(offsetBottom));
                                        }
                                    }
                                }
                            }
                            else if (textBottom && s > 0 && s < r) {
                                const height = textBottom.bounds.height;
                                for (let l = 0; l < s; ++l) {
                                    const item = baselineAlign[l];
                                    if (!item.multiline && height > item.bounds.height) {
                                        item.anchor('bottom', textBottom.documentId);
                                    }
                                }
                            }
                            const lastRowAligned = i === length - 1 && textAlignLast !== '' && textAlignLast !== 'justify';
                            if (centerAligned || lastRowAligned) {
                                const application = this.application;
                                baseline = this.createNodeGroup(items[0], items, node, { containerType: CONTAINER_NODE.RELATIVE, alignmentType: NODE_ALIGNMENT.HORIZONTAL });
                                baseline.render(node);
                                if (lastRowAligned) {
                                    switch (textAlignLast) {
                                        case 'center':
                                            baseline.anchor('centerHorizontal', 'true');
                                            break;
                                        case 'right':
                                        case 'end':
                                            baseline.anchor('right', 'true');
                                            break;
                                        default:
                                            baseline.anchor('left', 'true');
                                            break;
                                    }
                                }
                                else {
                                    baseline.anchor('centerHorizontal', 'true');
                                }
                                baseline.setLayoutWidth('wrap_content');
                                baseline.setLayoutHeight('wrap_content');
                                let renderIndex = -1;
                                for (let l = 0; l < r; ++l) {
                                    const item = items[l];
                                    const index = children.indexOf(item);
                                    if (index !== -1) {
                                        renderIndex = renderIndex === -1 ? index : Math.min(index, renderIndex);
                                    }
                                    item.removeTry();
                                    item.render(baseline);
                                    application.addLayoutTemplate(
                                        baseline,
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
                                    baseline,
                                    {
                                        type: NODE_TEMPLATE.XML,
                                        node: baseline,
                                        controlName: baseline.controlName
                                    } as NodeXmlTemplate<T>,
                                    renderIndex
                                );
                                if (previousBaseline) {
                                    baseline.anchor('topBottom', previousBaseline.documentId);
                                }
                            }
                            else {
                                let leftIndent = NaN;
                                if (!baseline) {
                                    baseline = items[0];
                                    checkBottom = true;
                                }
                                if (textIndent < 0 && i === 0 && !rightAligned && !currentFloated) {
                                    leftIndent = 0;
                                    checkBottom = false;
                                }
                                for (let k = 0; k < r; ++k) {
                                    const item = items[k];
                                    if (previousBaseline && item.alignSibling('baseline') === '' && item.alignSibling('top') === '' && item.alignSibling('bottom') === '') {
                                        item.anchor('topBottom', previousBaseline.documentId);
                                    }
                                    if (!isNaN(leftIndent)) {
                                        if (Math.ceil(leftIndent) >= Math.abs(textIndent) || k === r - 1) {
                                            baseline = item;
                                            leftIndent = NaN;
                                        }
                                        else {
                                            leftIndent += item.linear.width;
                                        }
                                    }
                                    else if (checkBottom && item.linear.bottom >= baseline.linear.bottom) {
                                        baseline = item;
                                    }
                                    if (k === 0) {
                                        if (rightAligned) {
                                            item.horizontalRowEnd = true;
                                        }
                                        else {
                                            item.horizontalRowStart = true;
                                        }
                                    }
                                    else if (k === r - 1) {
                                        if (rightAligned) {
                                            item.horizontalRowStart = true;
                                        }
                                        else {
                                            item.horizontalRowEnd = true;
                                        }
                                    }
                                }
                            }
                            horizontalRows.push(items);
                        }
                        else {
                            baseline = items[0];
                            if (baseline) {
                                if (firstLineStyle && i === 0 && j === 0) {
                                    applyFirstLine(baseline);
                                }
                                if (currentFloated) {
                                    if (currentFloated.float === 'left') {
                                        if (rightAligned || baseline.rightAligned) {
                                            baseline.anchor('right', 'true');
                                        }
                                        else {
                                            baseline.anchor('leftRight', currentFloated.documentId);
                                        }
                                    }
                                    else if (rightAligned || baseline.rightAligned) {
                                        baseline.anchor('rightLeft', currentFloated.documentId);
                                    }
                                    else {
                                        baseline.anchor('left', 'true');
                                    }
                                }
                                else if (baseline.floating) {
                                    baseline.anchor(baseline.float as AnchorPositionAttr, 'true');
                                }
                                else if (textAlignLast !== '' && i === length - 1) {
                                    switch (textAlignLast) {
                                        case 'center':
                                            baseline.anchor('centerHorizontal', 'true');
                                            break;
                                        case 'right':
                                        case 'end':
                                            baseline.anchor('right', 'true');
                                            break;
                                        case 'justify':
                                            baseline.android('justificationMode', 'inter_word');
                                        default:
                                            baseline.anchor('left', 'true');
                                            break;
                                    }
                                }
                                else if (centerAligned || baseline.centerAligned) {
                                    baseline.anchor('centerHorizontal', 'true');
                                }
                                else if (rightAligned || baseline.rightAligned) {
                                    baseline.anchor('right', 'true');
                                }
                                else {
                                    baseline.anchor('left', 'true');
                                }
                                setLayoutBelow(baseline);
                                if (!rightAligned) {
                                    setTextIndent(baseline);
                                }
                                if (singleLine && i < length - 1 && !baseline.lineBreakTrailing && !baseline.multiline) {
                                    baseline.setSingleLine(true, true);
                                }
                                baseline.horizontalRowStart = true;
                                baseline.horizontalRowEnd = true;
                                horizontalRows.push(items);
                            }
                            else {
                                if (currentFloated) {
                                    previousBaseline = currentFloated;
                                }
                                continue;
                            }
                        }
                        previousBaseline = baseline;
                    }
                }
                node.horizontalRows = horizontalRows;
            }
        }
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
                const flowA = a.node.pageFlow;
                const flowB = b.node.pageFlow;
                if (!flowA && flowB) {
                    return 1;
                }
                else if (!flowB && flowA) {
                    return -1;
                }
                return 0;
            });
        }
    }

    protected processConstraintHorizontal(node: T, children: T[]) {
        const reverse = node.hasAlign(NODE_ALIGNMENT.RIGHT);
        const [anchorStart, anchorEnd, chainStart, chainEnd] = getAnchorDirection(reverse);
        let bias = 0,
            baselineCount = 0,
            tallest: Undef<T>,
            bottom: Undef<T>,
            previous: Undef<T>,
            textBaseline: UndefNull<T>,
            textBottom: UndefNull<T>;
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
        if (node.floatContainer || children.some(item => item.floating)) {
            if (!reverse) {
                let floating: T[];
                switch (bias) {
                    case 0.5:
                        [floating, children] = partitionArray(children, item => item.floating);
                        break;
                    case 1:
                        [floating, children] = partitionArray<T>(children, item => item.float === 'left');
                        break;
                    default:
                        [floating, children] = partitionArray(children, item => item.float === 'right');
                        break;
                }
                if (floating.length) {
                    this.processConstraintChain(node, floating);
                }
            }
            sortHorizontalFloat(children);
        }
        const { top: boxTop, width: boxWidth } = node.box;
        const baseline = NodeUI.baseline(children, false, true);
        const getMaxHeight = (item: T) => Math.max(item.actualHeight, item.lineHeight);
        let percentWidth = View.availablePercent(children, 'width', boxWidth),
            checkPercent = !node.hasPX('width'),
            baselineActive: boolean,
            documentId: string;
        if (baseline) {
            baselineActive = baseline.baselineElement && !baseline.imageElement;
            documentId = baseline.documentId;
        }
        else {
            baselineActive = false;
            documentId = 'parent';
        }
        for (let i = 0, length = children.length, start = false; i < length; ++i) {
            const item = children[i];
            if (previous) {
                if (item.pageFlow) {
                    const autoMargin = item.autoMargin;
                    let anchoring: boolean;
                    if (autoMargin.leftRight) {
                        item.anchorStyle('horizontal', 0.5);
                        anchoring = true;
                    }
                    else if (autoMargin.left) {
                        item.anchorStyle('horizontal', 1);
                        anchoring = true;
                    }
                    else {
                        anchoring = i === length - 1;
                    }
                    previous.anchor(chainEnd, item.documentId);
                    item.anchor(chainStart, previous.documentId);
                    if (anchoring) {
                        item.anchor(anchorEnd, 'parent');
                    }
                }
                else if (item.autoPosition) {
                    item.anchor(chainStart, previous.documentId);
                }
            }
            else if (length === 1) {
                bias = item.centerAligned ? 0.5 : item.rightAligned ? 1 : 0;
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
                item.anchorStyle('horizontal', bias, item.innerMostWrapped.textJustified ? 'spread_inside' : 'packed');
            }
            if (item.pageFlow) {
                if (item !== baseline) {
                    if (!tallest || getMaxHeight(item) > getMaxHeight(tallest)) {
                        tallest = item;
                    }
                    if (item.controlElement) {
                        constraintAlignTop(item, boxTop);
                    }
                    else if (item.blockVertical) {
                        if (baselineActive && item.baseline) {
                            item.anchor(item.imageElement && !item.svgElement ? 'bottom' : 'baseline', documentId);
                            ++baselineCount;
                        }
                        else {
                            item.anchorParent('vertical');
                            setVerticalAlignment(item, baselineActive, true);
                        }
                    }
                    else if (item.inlineVertical) {
                        switch (item.css('verticalAlign')) {
                            case 'text-top':
                                if (textBaseline === undefined) {
                                    textBaseline = NodeUI.baseline(children, true);
                                }
                                if (textBaseline && item !== textBaseline) {
                                    item.anchor('top', textBaseline.documentId);
                                }
                                else {
                                    constraintAlignTop(item, boxTop);
                                }
                                break;
                            case 'middle':
                                if (textBottom === undefined) {
                                    textBottom = getTextBottom(children)[0] || null;
                                }
                                if (Math.ceil(item.linear.bottom) >= Math.floor(node.box.bottom)) {
                                    item.anchor('bottom', 'parent');
                                }
                                else if (textBottom || baseline && !baseline.textElement) {
                                    constraintAlignTop(item, boxTop);
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
                                        constraintAlignTop(item, boxTop);
                                    }
                                    break;
                                }
                            case 'bottom':
                                if (!bottom) {
                                    bottom = children[0];
                                    for (let j = 1; j < length; ++j) {
                                        const child = children[j];
                                        if (!child.baseline && child.linear.bottom > bottom.linear.bottom) {
                                            bottom = child;
                                        }
                                    }
                                }
                                if (item === bottom) {
                                    constraintAlignTop(item, boxTop);
                                }
                                else {
                                    item.anchor('bottom', 'parent');
                                }
                                break;
                            default:
                                if (baseline && item.baseline && !(!item.textElement && !item.inputElement && getMaxHeight(item) > getMaxHeight(baseline))) {
                                    item.anchor('baseline', documentId);
                                    ++baselineCount;
                                }
                                else {
                                    constraintAlignTop(item, boxTop);
                                }
                                break;
                        }
                    }
                    else if (item.plainText) {
                        item.anchor('baseline', documentId || 'parent');
                        ++baselineCount;
                    }
                    else {
                        constraintAlignTop(item, boxTop);
                    }
                    item.anchored = true;
                }
                if (!start) {
                    if (reverse) {
                        item.horizontalRowEnd = true;
                    }
                    else {
                        item.horizontalRowStart = true;
                    }
                    start = true;
                }
                if (i === length - 1) {
                    if (reverse) {
                        item.horizontalRowStart = true;
                    }
                    else {
                        item.horizontalRowEnd = true;
                    }
                }
                percentWidth = item.setConstraintDimension(percentWidth);
                previous = item;
            }
            else if (item.autoPosition) {
                if (documentId) {
                    item.anchor('top', documentId);
                }
                else {
                    item.anchorParent('vertical', 0);
                    item.anchored = true;
                }
            }
            if (checkPercent && item.percentWidth) {
                node.setLayoutWidth('match_parent');
                checkPercent = false;
            }
        }
        if (baseline) {
            baseline.constraint.horizontal = true;
            baseline.baselineActive = baselineCount > 0;
            if (tallest && !tallest.textElement && baseline.textElement && getMaxHeight(tallest) > getMaxHeight(baseline)) {
                switch (tallest.css('verticalAlign')) {
                    case 'top':
                    case 'text-top':
                        baseline.anchorParent('vertical', 0);
                        return;
                    case 'middle':
                        baseline.anchorParent('vertical', 0.5, '', true);
                        return;
                    case 'baseline':
                        baseline.anchor(getAnchorBaseline(tallest), tallest.documentId);
                        if (node.hasHeight) {
                            tallest.anchorDelete('top', 'bottom');
                            tallest.delete('app', 'layout_constraintVertical*');
                            tallest.setBox(BOX_STANDARD.MARGIN_TOP, { reset: 0, adjustment: 0 });
                            tallest.anchor('baseline', 'parent', true);
                        }
                        else {
                            const adjustment = node.box.bottom - tallest.bounds.bottom;
                            if (adjustment > 0 && Math.floor(adjustment) !== Math.floor(node.marginBottom)) {
                                tallest.setBox(BOX_STANDARD.MARGIN_BOTTOM, { reset: 1, adjustment });
                            }
                        }
                        return;
                    case 'bottom':
                    case 'text-bottom':
                        baseline.anchor('bottom', tallest.documentId);
                        return;
                }
            }
            if (baseline.blockVertical) {
                baseline.anchorParent('vertical');
                setVerticalAlignment(baseline, baselineActive, true);
            }
            else if (baseline.baselineElement) {
                baseline.anchor('baseline', 'parent');
            }
            else {
                switch (baseline.css('verticalAlign')) {
                    case 'top':
                        baseline.anchorParent('vertical', 0);
                        break;
                    case 'middle':
                        baseline.anchorParent('vertical', 0.5);
                        break;
                    case 'bottom':
                        baseline.anchorParent('vertical', 1);
                        break;
                    default:
                        constraintAlignTop(baseline, boxTop);
                        break;
                }
            }
        }
    }

    protected processConstraintChain(node: T, children: T[]) {
        const clearMap = this.application.clearMap;
        const emptyMap = clearMap.size === 0;
        const floating = node.hasAlign(NODE_ALIGNMENT.FLOAT);
        const parent = children[0].actualParent || node;
        const horizontal = NodeUI.partitionRows(children, clearMap);
        const checkClearMap = (item: T) => {
            if (!emptyMap) {
                if (item.naturalChild) {
                    return clearMap.has(item);
                }
                else if (item.nodeGroup) {
                    return !!item.find((child: T) => child.naturalChild && clearMap.has(child), { cascade: true });
                }
                return clearMap.has(item.innerMostWrapped as T);
            }
            return false;
        };
        let checkPercent = !node.hasWidth ? 1 : 0,
            previousSiblings: T[] = [],
            previousRow: Undef<T[]>,
            previousAlignParent: Undef<boolean>;
        for (let i = 0, length = horizontal.length, start = false; i < length; ++i) {
            const partition = horizontal[i];
            const [floatingRight, floatingLeft] = partitionArray(partition, item => item.float === 'right' || !!item.autoMargin.left);
            let alignParent: Undef<boolean>,
                aboveRowEnd: Undef<T>,
                currentRowTop: Undef<T>;
            for (let j = 0; j < 2; ++j) {
                const reverse = j === 1;
                const seg = !reverse ? floatingLeft : floatingRight;
                const q = seg.length;
                if (q === 0) {
                    continue;
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
                        rowStart.anchorStyle('horizontal', !floating && parent.css('textAlign') === 'center' ? 0.5 : 0, length === 1 && rowStart.innerMostWrapped.textJustified ? 'spread_inside' : 'packed');
                    }
                    rowEnd.anchor(anchorEnd, 'parent');
                }
                else if (!rowStart.constraint.horizontal) {
                    setHorizontalAlignment(rowStart);
                }
                if (i === 1 || previousAlignParent) {
                    alignParent =
                        !rowStart.pageFlow && (!rowStart.autoPosition || q === 1) ||
                        previousRow && (
                            !rowStart.floating && previousRow.every(item => item.floating || !item.pageFlow) && (clearMap.size === 0 || !partition.some((item: T) => checkClearMap(item))) ||
                            previousRow.every(item => !item.pageFlow)
                        );
                    previousAlignParent = alignParent;
                }
                let percentWidth = View.availablePercent(partition, 'width', node.box.width),
                    tallest: Undef<T>;
                for (let k = 0; k < q; ++k) {
                    const chain = seg[k];
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
                        const previous = seg[k - 1];
                        const next = seg[k + 1];
                        if (previous) {
                            if (!previous.pageFlow && previous.autoPosition) {
                                let found: Undef<T>;
                                for (let l = k - 2; l >= 0; --l) {
                                    const item = seg[l];
                                    if (item.pageFlow) {
                                        found = item;
                                        break;
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
                    percentWidth = chain.setConstraintDimension(percentWidth);
                    if (checkPercent === 1 && chain.percentWidth) {
                        checkPercent = -1;
                    }
                    if (previousRow && k === 0) {
                        if (!emptyMap && clearMap.has(chain) && !chain.floating) {
                            chain.modifyBox(BOX_STANDARD.MARGIN_TOP, lastItemOf(previousRow)!.bounds.height * -1, false);
                        }
                        if (floating) {
                            let checkBottom: Undef<boolean>;
                            for (let l = 0, r = previousSiblings.length; l < r; ++l) {
                                if (chain.bounds.top < Math.floor(previousSiblings[l].bounds.bottom)) {
                                    checkBottom = true;
                                    break;
                                }
                            }
                            if (checkBottom) {
                                aboveRowEnd = lastItemOf(previousRow)!;
                                for (let l = previousSiblings.length - 2; l >= 0; --l) {
                                    const aboveBefore = previousSiblings[l];
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
                                        rowStart.delete('app', 'layout_constraintHorizontal*');
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
                    if (chain.pageFlow) {
                        if (!start) {
                            if (reverse) {
                                chain.horizontalRowEnd = true;
                            }
                            else {
                                chain.horizontalRowStart = true;
                            }
                            start = true;
                        }
                        if (k === q - 1) {
                            if (reverse) {
                                chain.horizontalRowStart = true;
                            }
                            else {
                                chain.horizontalRowEnd = true;
                            }
                        }
                    }
                    if (!tallest || chain.linear.height > tallest.linear.height) {
                        tallest = chain;
                    }
                }
            }
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
                    else {
                        if (!aboveRowEnd || !currentRowTop) {
                            aboveRowEnd = previousRow[0];
                            for (let k = 1; k < q; ++k) {
                                const item = previousRow[k];
                                if (item.linear.bottom > aboveRowEnd.linear.bottom) {
                                    aboveRowEnd = item;
                                }
                            }
                        }
                        if (!currentRowTop) {
                            currentRowTop = partition[0];
                            let currentTop = currentRowTop.linear.top;
                            for (let k = 1; k < r; ++k) {
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
                        for (let k = 0; k < r; ++k) {
                            const chain = partition[k];
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
        if (checkPercent === -1) {
            node.setLayoutWidth('match_parent', false);
        }
    }

    protected applyGuideline(axis: string, options: GuidelineOptions<T>) {
        const node = options.target;
        if (node.constraint[axis] || options.orientation && axis !== options.orientation) {
            return;
        }
        const { parent, percent, opposing } = options;
        let documentParent = node.documentParent as T;
        if (parent.nodeGroup && !documentParent.hasAlign(NODE_ALIGNMENT.AUTO_LAYOUT)) {
            documentParent = parent;
        }
        const horizontal = axis === 'horizontal';
        let LT: AnchorPositionAttr,
            RB: AnchorPositionAttr;
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
            if (!node.pageFlow && node.css('position') !== 'fixed' && !parent.hasAlign(NODE_ALIGNMENT.AUTO_LAYOUT)) {
                const adjustBodyMargin = (item: T, position: string) => {
                    if (item.leftTopAxis) {
                        const absoluteParent = item.absoluteParent as T;
                        if (absoluteParent.documentBody) {
                            switch (position) {
                                case 'top':
                                    return absoluteParent.getBox(BOX_STANDARD.MARGIN_TOP)[0] === 0 ? absoluteParent.marginTop : 0;
                                case 'left':
                                    return absoluteParent.marginLeft;
                            }
                        }
                    }
                    return 0;
                };
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
                for (let i = 0; i < length; ++i) {
                    const item = renderChildren[i] as T;
                    if (item === node || item.plainText || item.pseudoElement || item.rootElement || !canAlignPosition(item)) {
                        continue;
                    }
                    const itemA = item.innerMostWrapped as T;
                    if (itemA.pageFlow || item.constraint[axis]) {
                        const { linear: linearA, bounds: boundsA } = itemA;
                        let offset = NaN,
                            position: Undef<AnchorPositionAttr>;
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
                                if (node.top !== 0) {
                                    offset = bounds.top - boundsA.bottom;
                                }
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
                const setAnchorOffset = (documentId: string, position: AnchorPositionAttr, adjustment: number) => {
                    node.anchor(position, documentId, true);
                    node.setBox(horizontal ? BOX_STANDARD.MARGIN_LEFT : BOX_STANDARD.MARGIN_TOP, { reset: 1, adjustment });
                    node.constraint[axis] = true;
                };
                let nearest: Undef<T>,
                    adjacent: Undef<T>;
                for (let i = 0; i < length; ++i) {
                    const item = renderChildren[i] as T;
                    if (item === node || item.pageFlow || item.rootElement || !item.constraint[axis] || !canAlignPosition(item)) {
                        continue;
                    }
                    const wrapped = item.innerMostWrapped as T;
                    const boundsA = wrapped.bounds;
                    if (withinRange(bounds[TL], boundsA[TL])) {
                        const offset = bounds[LT] - boundsA[RB];
                        if (offset >= 0) {
                            setAnchorOffset(item.documentId, horizontal ? 'leftRight' : 'topBottom', offset);
                            return;
                        }
                    }
                    else if (boundsA[LT] <= bounds[LT]) {
                        if (boundsA[TL] <= bounds[TL]) {
                            nearest = wrapped;
                        }
                        else {
                            adjacent = wrapped;
                        }
                    }
                }
                if (!nearest) {
                    nearest = adjacent;
                }
                if (nearest) {
                    const offset = bounds[LT] - nearest.bounds[LT] + adjustBodyMargin(node, LT);
                    if (offset >= 0) {
                        setAnchorOffset(nearest.documentId, LT, offset);
                        return;
                    }
                }
            }
        }
        const absoluteParent = node.absoluteParent as T;
        const bounds = node.positionStatic ? node.bounds : linear;
        let location = 0,
            attr: string;
        if (!node.leftTopAxis && documentParent.rootElement) {
            const renderParent = node.renderParent;
            if (documentParent.ascend({ condition: item => item === renderParent, attr: 'renderParent' }).length) {
                location = horizontal ? documentParent[!opposing ? 'marginLeft' : 'marginRight'] : documentParent[!opposing ? 'marginTop' : 'marginBottom'];
            }
        }
        if (percent) {
            const position = Math.abs(bounds[LT] - box[LT]) / (horizontal ? box.width : box.height);
            attr = 'layout_constraintGuide_percent';
            location += parseFloat(truncate(!opposing ? position : 1 - position, node.localSettings.floatPrecision));
        }
        else {
            attr = 'layout_constraintGuide_begin';
            location += bounds[LT] - box[!opposing ? LT : RB];
        }
        if (!node.pageFlow) {
            if (documentParent.outerWrapper && node.parent === documentParent.outerMostWrapper) {
                location += documentParent[horizontal
                    ? !opposing ? 'paddingLeft' : 'paddingRight'
                    : !opposing ? 'paddingTop' : 'paddingBottom'
                ];
            }
            else if (absoluteParent === node.documentParent) {
                const direction = horizontal
                    ? !opposing ? BOX_STANDARD.PADDING_LEFT : BOX_STANDARD.PADDING_RIGHT
                    : !opposing ? BOX_STANDARD.PADDING_TOP : BOX_STANDARD.PADDING_BOTTOM;
                location = documentParent.adjustAbsolutePaddingOffset(direction, location);
            }
        }
        else if (node.inlineVertical) {
            const offset = node.verticalAlign;
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
            const anchors = guideline[axis]?.[attr]?.[LT] as Undef<StringMap>;
            if (anchors) {
                for (const id in anchors) {
                    if (withinRange(parseFloat(anchors[id]!), location)) {
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
                    [attr]: percent ? location.toString() : `@dimen/${Resource.insertStoredAsset('dimens', 'constraint_guideline_' + (!opposing ? LT : RB), formatPX(location))}`
                }
            };
            this.addAfterOutsideTemplate(node, this.renderNodeStatic({ controlName: node.api < BUILD_VERSION.Q ? CONTAINER_TAGNAME.GUIDELINE : CONTAINER_TAGNAME_X.GUIDELINE }, templateOptions), false);
            const documentId = templateOptions.documentId;
            if (documentId) {
                node.anchor(LT, documentId, true);
                node.anchorDelete(RB);
                if (location > 0) {
                    assignEmptyValue(guideline as StandardMap, axis, attr, LT, documentId, location.toString());
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
            node.localSettings = this._viewSettings;
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