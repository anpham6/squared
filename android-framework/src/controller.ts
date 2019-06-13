import { FileAsset, LayoutType, NodeTemplate, NodeXmlTemplate } from '../../src/base/@types/application';
import { ControllerSettingsAndroid, UserSettingsAndroid } from './@types/application';
import { LocalSettings, ViewAttribute } from './@types/node';

import Resource from './resource';
import View from './view';
import ViewGroup from './viewgroup';

import { CONTAINER_ANDROID, STRING_ANDROID } from './lib/constant';
import { BUILD_ANDROID, CONTAINER_NODE } from './lib/enumeration';
import { createViewAttribute, getDocumentId, getRootNs } from './lib/util';

import $LayoutUI = squared.base.LayoutUI;
import $NodeUI = squared.base.NodeUI;
import $NodeList = squared.base.NodeList;

const $client = squared.lib.client;
const $color = squared.lib.color;
const $const = squared.lib.constant;
const $css = squared.lib.css;
const $dom = squared.lib.dom;
const $math = squared.lib.math;
const $regex = squared.lib.regex;
const $session = squared.lib.session;
const $util = squared.lib.util;
const $xml = squared.lib.xml;
const $c = squared.base.lib.constant;
const $e = squared.base.lib.enumeration;

const GUIDELINE_AXIS = [STRING_ANDROID.HORIZONTAL, STRING_ANDROID.VERTICAL];
const CACHE_PATTERN: ObjectMap<RegExp> = {};
let DEFAULT_VIEWSETTINGS!: LocalSettings;

function sortHorizontalFloat(list: View[]) {
    if (list.some(node => node.floating)) {
        list.sort((a, b) => {
            if (a.floating && !b.floating) {
                return a.float === $const.CSS.LEFT ? -1 : 1;
            }
            else if (!a.floating && b.floating) {
                return b.float === $const.CSS.LEFT ? 1 : -1;
            }
            else if (a.floating && b.floating) {
                if (a.float !== b.float) {
                    return a.float === $const.CSS.LEFT ? -1 : 1;
                }
                else if (a.float === $const.CSS.RIGHT && b.float === $const.CSS.RIGHT) {
                    return 1;
                }
            }
            return 0;
        });
    }
}

function sortConstraintAbsolute(templates: NodeXmlTemplate<View>[]) {
    if (templates.length > 1) {
        templates.sort((a, b) => {
            const above = <View> a.node.innerWrapped || a.node;
            const below = <View> b.node.innerWrapped || b.node;
            if (above.absoluteParent === below.absoluteParent) {
                if (above.zIndex === below.zIndex) {
                    return above.childIndex < below.childIndex ? -1 : 1;
                }
                return above.zIndex < below.zIndex ? -1 : 1;
            }
            else if (above.intersectX(below.bounds, 'bounds') && above.intersectY(below.bounds, 'bounds')) {
                if (above.depth === below.depth) {
                    return 0;
                }
                return above.id < below.id ? -1 : 1;
            }
            return 0;
        });
    }
    return templates;
}

function adjustBaseline(baseline: View, nodes: View[]) {
    let imageBaseline: View | undefined;
    for (const node of nodes) {
        if (node !== baseline && !node.baselineAltered) {
            if (node.bounds.height > 0 || node.textElement) {
                if (node.blockVertical && baseline.blockVertical) {
                    node.anchor('bottom', baseline.documentId);
                }
                else if (!node.textElement && !node.inputElement && node.bounds.height > baseline.bounds.height) {
                    if ($util.withinRange(node.linear.top, node.documentParent.box.top)) {
                        node.anchor($const.CSS.TOP, 'true');
                    }
                    if (node.imageOrSvgElement && (imageBaseline === undefined || node.bounds.height >= imageBaseline.bounds.height)) {
                        if (imageBaseline) {
                            imageBaseline.anchor('baseline', node.documentId);
                        }
                        imageBaseline = node;
                    }
                }
                else if (node.naturalChild && node.length === 0 || node.layoutHorizontal && node.renderChildren.every(item => item.baseline)) {
                    node.anchor('baseline', baseline.documentId);
                }
            }
            else if (node.imageOrSvgElement && node.baseline) {
                imageBaseline = node;
            }
        }
    }
    if (imageBaseline) {
        baseline.anchor('baseline', imageBaseline.documentId);
    }
}

function checkSingleLine(node: View, nowrap: boolean, multiline: boolean) {
    if (node.textElement && !node.centerAligned && !node.hasPX($const.CSS.WIDTH) && (!node.multiline || multiline) && (nowrap || node.textContent.trim().indexOf(' ') !== -1)) {
        node.android('maxLines', '1');
        node.android('ellipsize', $const.CSS.END);
        return true;
    }
    return false;
}

function adjustAbsolutePaddingOffset(parent: View, direction: number, value: number) {
    if (value > 0) {
        if (parent.documentBody) {
            switch (direction) {
                case $e.BOX_STANDARD.PADDING_TOP:
                    value -= parent.marginTop;
                    break;
                case $e.BOX_STANDARD.PADDING_RIGHT:
                    value -= parent.marginRight;
                    break;
                case $e.BOX_STANDARD.PADDING_BOTTOM:
                    value -= parent.marginBottom;
                    break;
                case $e.BOX_STANDARD.PADDING_LEFT:
                    value -= parent.marginLeft;
                    break;
            }
        }
        if (parent.getBox(direction)[0] !== 1) {
            switch (direction) {
                case $e.BOX_STANDARD.PADDING_TOP:
                    value += parent.borderTopWidth - parent.paddingTop;
                    break;
                case $e.BOX_STANDARD.PADDING_RIGHT:
                    value += parent.borderRightWidth - parent.paddingRight;
                    break;
                case $e.BOX_STANDARD.PADDING_BOTTOM:
                    value += parent.borderBottomWidth - parent.paddingBottom;
                    break;
                case $e.BOX_STANDARD.PADDING_LEFT:
                    value += parent.borderLeftWidth - parent.paddingLeft;
                    break;
            }
        }
        return Math.max(value, 0);
    }
    return value;
}

function adjustFloatingNegativeMargin(node: View, previous: View) {
    if (previous.float === $const.CSS.LEFT) {
        if (previous.marginRight < 0) {
            const right = Math.abs(previous.marginRight);
            node.modifyBox($e.BOX_STANDARD.MARGIN_LEFT, previous.actualWidth + (previous.hasWidth ? previous.paddingLeft + previous.borderLeftWidth : 0) - right);
            node.anchor($const.CSS.LEFT, previous.documentId);
            previous.modifyBox($e.BOX_STANDARD.MARGIN_RIGHT);
            return true;
        }
    }
    else if (node.float === $const.CSS.RIGHT && previous.float === $const.CSS.RIGHT) {
        if (previous.marginLeft < 0) {
            const left = Math.abs(previous.marginLeft);
            const width = previous.actualWidth;
            if (left < width) {
                node.modifyBox($e.BOX_STANDARD.MARGIN_RIGHT, width - left);
            }
            node.anchor($const.CSS.RIGHT, previous.documentId);
            previous.modifyBox($e.BOX_STANDARD.MARGIN_LEFT);
            return true;
        }
    }
    return false;
}

function constraintMinMax(node: View, dimension: string, horizontal: boolean) {
    if (!node.inputElement && !node.imageOrSvgElement) {
        const documentParent = node.documentParent;
        const renderParent = <View> node.renderParent;
        if (renderParent) {
            function setAlignmentBlock() {
                if (renderParent.nodeGroup) {
                    renderParent.addAlign($e.NODE_ALIGNMENT.BLOCK);
                    renderParent.unsetCache('blockStatic');
                }
            }
            if (!node.blockWidth && !documentParent.flexElement) {
                const minWH = node.cssInitial(horizontal ? 'minWidth' : 'minHeight', true);
                if ($css.isLength(minWH, true) && minWH !== $const.CSS.PX_0) {
                    let valid = false;
                    if (horizontal) {
                        if (node.ascend(item => item.hasPX($const.CSS.WIDTH) || item.blockStatic).length) {
                            node.setLayoutWidth($const.CSS.PX_0, false);
                            valid = node.flexibleWidth;
                            setAlignmentBlock();
                        }
                    }
                    else if ((node.absoluteParent || documentParent).hasHeight && !node.hasPX($const.CSS.HEIGHT)) {
                        node.setLayoutHeight($const.CSS.PX_0, false);
                        valid = node.flexibleHeight;
                    }
                    if (valid) {
                        node.app(horizontal ? 'layout_constraintWidth_min' : 'layout_constraintHeight_min', $css.formatPX(node.parseUnit(minWH, dimension.toLowerCase())));
                        node.css(horizontal ? 'minWidth' : 'minHeight', $const.CSS.AUTO);
                    }
                }
            }
            const maxWH = node.cssInitial(horizontal ? 'maxWidth' : 'maxHeight', true);
            let contentBox = 0;
            if ($css.isLength(maxWH, true)) {
                let valid = false;
                if (horizontal) {
                    if (node.outerWrapper || node.ascend(item => item.hasPX($const.CSS.WIDTH) || item.blockStatic).length) {
                        node.setLayoutWidth(renderParent.flexibleWidth ? STRING_ANDROID.MATCH_PARENT : $const.CSS.PX_0, node.innerWrapped && node.innerWrapped.naturalChild);
                        valid = node.flexibleWidth;
                        setAlignmentBlock();
                        if (valid && !$css.isPercent(maxWH)) {
                            contentBox += node.contentBoxWidth;
                        }
                    }
                }
                else if ((node.absoluteParent || documentParent).hasHeight && !node.hasPX($const.CSS.HEIGHT)) {
                    node.setLayoutHeight(renderParent.flexibleHeight ? STRING_ANDROID.MATCH_PARENT : $const.CSS.PX_0, node.innerWrapped && node.innerWrapped.naturalChild);
                    valid = node.flexibleHeight;
                    if (valid && !$css.isPercent(maxWH)) {
                        contentBox += node.contentBoxHeight;
                    }
                }
                if (valid) {
                    const maxDimension = node.parseUnit(maxWH, dimension.toLowerCase());
                    node.app(horizontal ? 'layout_constraintWidth_max' : 'layout_constraintHeight_max', $css.formatPX(maxDimension + contentBox));
                    if (horizontal && node.layoutVertical) {
                        node.each(item => {
                            if (item.textElement && !item.hasPX('maxWidth')) {
                                item.css('maxWidth', $css.formatPX(maxDimension));
                            }
                        });
                    }
                }
            }
        }
    }
}

function constraintPercentValue(node: View, dimension: string, horizontal: boolean, opposing: boolean) {
    const value = node.cssInitial(dimension, true);
    let unit: string | undefined;
    if (opposing) {
        if ($css.isLength(value, true)) {
            unit = $css.formatPX(node.bounds[dimension]);
            if (node.imageElement) {
                const element = <HTMLImageElement> node.element;
                if (element && element.naturalWidth > 0 && element.naturalHeight > 0) {
                    const opposingUnit = (node.bounds[dimension] / (horizontal ? element.naturalWidth : element.naturalHeight)) * (horizontal ? element.naturalHeight : element.naturalWidth);
                    if (horizontal) {
                        node.setLayoutHeight($css.formatPX(opposingUnit), false);
                    }
                    else {
                        node.setLayoutWidth($css.formatPX(opposingUnit), false);
                    }
                }
            }
        }
    }
    else if ($css.isPercent(value) && value !== $const.CSS.PERCENT_100) {
        const percent = parseFloat(value) / 100;
        node.app(horizontal ? 'layout_constraintWidth_percent' : 'layout_constraintHeight_percent', $math.truncate(percent, node.localSettings.floatPrecision));
        unit = $const.CSS.PX_0;
    }
    if (unit) {
        if (horizontal) {
            node.setLayoutWidth(unit, false);
        }
        else {
            node.setLayoutHeight(unit, false);
        }
        return true;
    }
    return false;
}

function constraintPercentWidth(node: View, opposing: boolean) {
    if (!opposing && !node.documentParent.layoutElement && node.documentParent.hasPX($const.CSS.WIDTH, false)) {
        const value = node.cssInitial($const.CSS.WIDTH, true);
        if ($css.isPercent(value) && value !== $const.CSS.PERCENT_100) {
            node.setLayoutWidth($css.formatPX(node.bounds.width));
        }
    }
    else {
        constraintPercentValue(node, $const.CSS.WIDTH, true, opposing);
    }
}

function constraintPercentHeight(node: View, opposing: boolean) {
    if (node.documentParent.hasPX($const.CSS.HEIGHT, false)) {
        if (!opposing && !node.documentParent.layoutElement) {
            const value = node.cssInitial($const.CSS.HEIGHT, true);
            if ($css.isPercent(value) && value !== $const.CSS.PERCENT_100) {
                node.setLayoutHeight($css.formatPX(node.bounds.height));
            }
        }
        else {
            constraintPercentValue(node, $const.CSS.HEIGHT, false, opposing);
        }
    }
    else if ($css.isLength(node.cssInitial($const.CSS.HEIGHT), true)) {
        node.setLayoutHeight($css.formatPX(node.bounds.height), false);
    }
}

function isTargeted(parent: View, node: View) {
    if (parent.element && node.dataset.target) {
        const element = document.getElementById(node.dataset.target);
        return element !== null && element !== parent.element;
    }
    return false;
}

function getTextBottom<T extends View>(nodes: T[]): T | undefined {
    return $util.filterArray(nodes, node => {
        if ((node.baseline || $css.isLength(node.verticalAlign, true)) && (node.tagName === 'TEXTAREA' || node.tagName === 'SELECT' && (<HTMLSelectElement> node.element).size > 1) || node.verticalAlign === 'text-bottom' && node.containerName !== 'INPUT_IMAGE') {
            return true;
        }
        return false;
    })
    .sort((a, b) => {
        if (a.baselineHeight === b.baselineHeight) {
            return a.tagName === 'SELECT' ? 1 : 0;
        }
        return a.baselineHeight > b.baselineHeight ? -1 : 1;
    })[0];
}

function getAnchorDirection(reverse: boolean) {
    if (reverse) {
        return [$const.CSS.RIGHT, $const.CSS.LEFT, $c.STRING_BASE.RIGHT_LEFT, $c.STRING_BASE.LEFT_RIGHT];
    }
    else {
        return [$const.CSS.LEFT, $const.CSS.RIGHT, $c.STRING_BASE.LEFT_RIGHT, $c.STRING_BASE.RIGHT_LEFT];
    }
}

const getRelativeVertical = (layout: $LayoutUI<View>) => layout.some(item => item.positionRelative || !item.pageFlow && item.positionAuto) ? CONTAINER_NODE.RELATIVE : CONTAINER_NODE.LINEAR;

const getMaxHeight = (node: View) => Math.max(node.actualHeight, node.lineHeight);

export default class Controller<T extends View> extends squared.base.ControllerUI<T> implements android.base.Controller<T> {
    public static setConstraintDimension<T extends View>(node: T) {
        constraintPercentWidth(node, false);
        constraintPercentHeight(node, false);
        constraintMinMax(node, 'Width', true);
        constraintMinMax(node, 'Height', false);
    }

    public static setFlexDimension<T extends View>(node: T, dimension: string) {
        const horizontal = dimension === $const.CSS.WIDTH;
        const flexbox = node.flexbox;
        const basis = flexbox.basis;
        function setFlexGrow(value: string, grow: number) {
            node.android(horizontal ? 'layout_width' : 'layout_height', $const.CSS.PX_0);
            if (grow > 0) {
                node.app(horizontal ? 'layout_constraintHorizontal_weight' : 'layout_constraintVertical_weight', $math.truncate(grow, node.localSettings.floatPrecision));
                if (value !== '') {
                    node.css(horizontal ? 'minWidth' : 'minHeight', value, true);
                }
            }
            else if (value !== '') {
                if (flexbox.shrink < 1) {
                    node.app(horizontal ? 'layout_constraintWidth_min' : 'layout_constraintHeight_min', $css.formatPX((1 - flexbox.shrink) * parseFloat(value)));
                    node.app(horizontal ? 'layout_constraintWidth_max' : 'layout_constraintHeight_max', value);
                }
                else {
                    node.app(horizontal ? 'layout_constraintWidth_min' : 'layout_constraintHeight_min', value);
                }
            }
        }
        if ($css.isLength(basis)) {
            setFlexGrow(node.convertPX(basis), node.flexbox.grow);
        }
        else if (basis !== $const.CSS.PERCENT_0 && $css.isPercent(basis)) {
            node.app(horizontal ? 'layout_constraintWidth_percent' : 'layout_constraintHeight_percent', (parseFloat(basis) / 100).toPrecision(node.localSettings.floatPrecision));
            setFlexGrow('', node.flexbox.grow);
        }
        else if (flexbox.grow > 0) {
            setFlexGrow(node.hasPX(dimension, false) ? $css.formatPX(node[horizontal ? 'actualWidth' : 'actualHeight']) : '', node.flexbox.grow);
        }
        else {
            if (horizontal) {
                constraintPercentWidth(node, false);
            }
            else {
                constraintPercentHeight(node, false);
            }
        }
        if (flexbox.shrink > 1) {
            node.app(horizontal ? 'layout_constrainedWidth' : 'layout_constrainedHeight', 'true');
        }
        constraintMinMax(node, 'Width', true);
        if (horizontal) {
            constraintPercentHeight(node, true);
        }
        else {
            constraintPercentWidth(node, true);
        }
        constraintMinMax(node, 'Height', false);
    }

    public readonly localSettings: ControllerSettingsAndroid = {
        layout: {
            pathName: 'res/layout',
            fileExtension: 'xml',
            baseTemplate: $xml.STRING_XMLENCODING
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
            inputBackgroundColor: $client.isPlatform($client.PLATFORM.MAC) ? 'rgb(255, 255, 255)' : 'rgb(221, 221, 221)'
        },
        supported: {
            fontFormat: ['truetype', 'opentype'],
            imageFormat: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'cur']
        },
        unsupported: {
            cascade: new Set(['SELECT', 'svg']),
            tagName: new Set(['SCRIPT', 'STYLE', 'OPTION', 'INPUT:hidden', 'MAP', 'AREA', 'SOURCE', 'TEMPLATE', 'DATALIST', 'WBR']),
            excluded: new Set(['BR'])
        },
        precision: {
            standardFloat: 4
        },
        deviations: {
            textMarginBoundarySize: 8,
            subscriptBottomOffset: 0.25,
            superscriptTopOffset: 0.25,
            legendBottomOffset: 0.25
        }
    };

    public init() {
        const settings = this.userSettings;
        DEFAULT_VIEWSETTINGS = {
            targetAPI: settings.targetAPI || BUILD_ANDROID.LATEST,
            supportRTL: typeof settings.supportRTL === 'boolean' ? settings.supportRTL : true,
            floatPrecision: this.localSettings.precision.standardFloat
        };
    }

    public optimize(nodes: T[]) {
        for (const node of nodes) {
            node.applyOptimizations();
            if (node.hasProcedure($e.NODE_PROCEDURE.CUSTOMIZATION)) {
                node.applyCustomizations(this.userSettings.customizationsOverwritePrivilege);
            }
        }
    }

    public finalize(layouts: FileAsset[]) {
        for (const layout of layouts) {
            layout.content = $xml.replaceTab(layout.content.replace(/{#0}/, getRootNs(layout.content)), this.userSettings.insertSpaces);
        }
    }

    public processUnknownParent(layout: $LayoutUI<T>) {
        const node = layout.node;
        if (node.has('columnCount') || node.hasPX('columnWidth')) {
            layout.setType(CONTAINER_NODE.CONSTRAINT, $e.NODE_ALIGNMENT.COLUMN | $e.NODE_ALIGNMENT.AUTO_LAYOUT);
        }
        else if (layout.some(item => !item.pageFlow && !item.positionAuto)) {
            layout.setType(CONTAINER_NODE.CONSTRAINT, $e.NODE_ALIGNMENT.ABSOLUTE | $e.NODE_ALIGNMENT.UNKNOWN);
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
                    layout.setType(CONTAINER_NODE.TEXT);
                }
                else if (node.autoMargin.horizontal || layout.parent.layoutConstraint && layout.parent.flexElement && node.flexbox.alignSelf === 'baseline' && child.textElement) {
                    layout.setType(CONTAINER_NODE.LINEAR, $e.NODE_ALIGNMENT.HORIZONTAL | $e.NODE_ALIGNMENT.SINGLE);
                }
                else {
                    if (child.percentWidth) {
                        if (!node.hasPX($const.CSS.WIDTH)) {
                            node.setLayoutWidth(STRING_ANDROID.MATCH_PARENT);
                        }
                        layout.setType(CONTAINER_NODE.CONSTRAINT, $e.NODE_ALIGNMENT.SINGLE | $e.NODE_ALIGNMENT.BLOCK);
                    }
                    else if (child.baseline && (child.textElement || child.inputElement)) {
                        layout.setType(CONTAINER_NODE.LINEAR, $e.NODE_ALIGNMENT.VERTICAL);
                    }
                    else {
                        layout.setType(CONTAINER_NODE.FRAME, $e.NODE_ALIGNMENT.SINGLE);
                    }
                }
            }
            else {
                return this.processUnknownChild(layout);
            }
        }
        else if (Resource.hasLineBreak(node, true)) {
            layout.setType(layout.some(item => item.positionRelative) ? CONTAINER_NODE.RELATIVE : CONTAINER_NODE.LINEAR, $e.NODE_ALIGNMENT.VERTICAL | $e.NODE_ALIGNMENT.UNKNOWN);
        }
        else if (this.checkConstraintFloat(layout)) {
            layout.setType(CONTAINER_NODE.CONSTRAINT, $e.NODE_ALIGNMENT.FLOAT);
        }
        else if (layout.linearX) {
            if (this.checkFrameHorizontal(layout)) {
                layout.renderType |= $e.NODE_ALIGNMENT.FLOAT | $e.NODE_ALIGNMENT.HORIZONTAL;
            }
            else if (this.checkConstraintHorizontal(layout)) {
                layout.setType(CONTAINER_NODE.CONSTRAINT);
            }
            else if (this.checkLinearHorizontal(layout)) {
                layout.setType(CONTAINER_NODE.LINEAR);
                if (layout.floated.size) {
                    sortHorizontalFloat(layout.children);
                }
            }
            else {
                layout.setType(CONTAINER_NODE.RELATIVE);
            }
            layout.add($e.NODE_ALIGNMENT.HORIZONTAL);
        }
        else if (layout.linearY) {
            layout.setType(getRelativeVertical(layout), $e.NODE_ALIGNMENT.VERTICAL | ( node.documentRoot ? $e.NODE_ALIGNMENT.UNKNOWN : 0));
        }
        else if (layout.every(item => item.inlineFlow)) {
            if (this.checkFrameHorizontal(layout)) {
                layout.renderType |= $e.NODE_ALIGNMENT.FLOAT | $e.NODE_ALIGNMENT.HORIZONTAL;
            }
            else {
                layout.setType(getRelativeVertical(layout), $e.NODE_ALIGNMENT.VERTICAL | $e.NODE_ALIGNMENT.UNKNOWN);
            }
        }
        else if (layout.some(item => item.alignedVertically(item.childIndex > 0 ? layout.children.slice(0, item.childIndex) : undefined, layout.cleared) > 0)) {
            layout.setType(getRelativeVertical(layout), $e.NODE_ALIGNMENT.VERTICAL | $e.NODE_ALIGNMENT.UNKNOWN);
        }
        else {
            layout.setType(CONTAINER_NODE.CONSTRAINT, $e.NODE_ALIGNMENT.UNKNOWN);
        }
        return { layout };
    }

    public processUnknownChild(layout: $LayoutUI<T>) {
        const node = layout.node;
        const style = node.visibleStyle;
        if (node.inlineText && (!node.textEmpty || style.borderWidth)) {
            layout.setType(CONTAINER_NODE.TEXT);
        }
        else if (node.blockStatic && (style.borderWidth || style.backgroundImage || node.paddingTop + node.paddingBottom > 0) && node.naturalElements.length === 0) {
            layout.setType(CONTAINER_NODE.FRAME);
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
            !style.background &&
            !node.dataset.use)
        {
            node.hide();
            return { layout, next: true };
        }
        else {
            layout.setType(style.background ? CONTAINER_NODE.TEXT : CONTAINER_NODE.FRAME);
        }
        return { layout };
    }

    public processTraverseHorizontal(layout: $LayoutUI<T>, siblings: T[]) {
        const node = layout.node;
        const parent = layout.parent;
        const children = layout.children;
        if (layout.floated.size === 1 && layout.same((item, index) => item.floating && (item.positiveAxis || item.renderExclude) ? -1 : index)) {
            layout.node = this.createNodeGroup(node, children, parent);
            layout.setType(CONTAINER_NODE.CONSTRAINT, $e.NODE_ALIGNMENT.FLOAT);
        }
        else if (this.checkFrameHorizontal(layout)) {
            layout.node = this.createNodeGroup(node, children, parent);
            layout.renderType |= $e.NODE_ALIGNMENT.FLOAT | $e.NODE_ALIGNMENT.HORIZONTAL;
        }
        else if (layout.length !== siblings.length || parent.hasAlign($e.NODE_ALIGNMENT.VERTICAL)) {
            layout.node = this.createNodeGroup(node, children, parent);
            this.processLayoutHorizontal(layout);
        }
        else {
            parent.addAlign($e.NODE_ALIGNMENT.HORIZONTAL);
        }
        return layout;
    }

    public processTraverseVertical(layout: $LayoutUI<T>) {
        const floated = layout.floated;
        const cleared = layout.cleared;
        if (layout.some((item, index) => item.lineBreakTrailing && index < layout.length - 1)) {
            if (!layout.parent.hasAlign($e.NODE_ALIGNMENT.VERTICAL)) {
                layout.node = this.createLayoutNodeGroup(layout);
                layout.setType(getRelativeVertical(layout), $e.NODE_ALIGNMENT.VERTICAL | $e.NODE_ALIGNMENT.UNKNOWN);
            }
        }
        else if (floated.size === 1 && layout.every((item, index) => index === 0 || index === layout.length - 1 || cleared.has(item))) {
            layout.node = this.createLayoutNodeGroup(layout);
            if (layout.same(node => node.float)) {
                layout.setType(CONTAINER_NODE.CONSTRAINT, $e.NODE_ALIGNMENT.FLOAT);
            }
            else {
                layout.renderType |= $e.NODE_ALIGNMENT.FLOAT | $e.NODE_ALIGNMENT.HORIZONTAL;
            }
        }
        else if (floated.size && cleared.size) {
            layout.node = this.createLayoutNodeGroup(layout);
            layout.renderType |= $e.NODE_ALIGNMENT.FLOAT | $e.NODE_ALIGNMENT.VERTICAL;
        }
        else if (floated.size && layout.children[0].floating) {
            layout.node = this.createLayoutNodeGroup(layout);
            layout.renderType |= $e.NODE_ALIGNMENT.FLOAT | $e.NODE_ALIGNMENT.HORIZONTAL;
        }
        else if (!layout.parent.hasAlign($e.NODE_ALIGNMENT.VERTICAL)) {
            layout.node = this.createLayoutNodeGroup(layout);
            layout.setType(layout.some(item => item.positionRelative) ? CONTAINER_NODE.RELATIVE : CONTAINER_NODE.LINEAR, $e.NODE_ALIGNMENT.VERTICAL);
        }
        return layout;
    }

    public processLayoutHorizontal(layout: $LayoutUI<T>) {
        if (this.checkConstraintFloat(layout, true)) {
            layout.setType(CONTAINER_NODE.CONSTRAINT, $e.NODE_ALIGNMENT.FLOAT);
        }
        else if (this.checkConstraintHorizontal(layout)) {
            layout.setType(CONTAINER_NODE.CONSTRAINT, $e.NODE_ALIGNMENT.HORIZONTAL);
        }
        else if (this.checkLinearHorizontal(layout)) {
            layout.setType(CONTAINER_NODE.LINEAR, $e.NODE_ALIGNMENT.HORIZONTAL);
            if (layout.floated.size) {
                sortHorizontalFloat(layout.children);
            }
        }
        else {
            layout.setType(CONTAINER_NODE.RELATIVE, $e.NODE_ALIGNMENT.HORIZONTAL);
        }
        return layout;
    }

    public sortRenderPosition(parent: T, templates: NodeXmlTemplate<T>[]) {
        if (parent.layoutConstraint && templates.some(item => !item.node.pageFlow || item.node.zIndex !== 0)) {
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

    public checkFrameHorizontal(layout: $LayoutUI<T>) {
        const floated = layout.floated;
        if (floated.size === 2) {
            return true;
        }
        else {
            if ((floated.has($const.CSS.RIGHT) || floated.size === 1 && layout.node.cssAscend('textAlign', true) === $const.CSS.CENTER) && layout.some(node => node.pageFlow)) {
                return true;
            }
            else if (floated.has($const.CSS.LEFT) && !layout.linearX) {
                const node = layout.item(0) as T;
                return node.pageFlow && node.floating;
            }
        }
        return false;
    }

    public checkConstraintFloat(layout: $LayoutUI<T>, horizontal = false) {
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

    public checkConstraintHorizontal(layout: $LayoutUI<T>) {
        const floated = layout.floated;
        let valid = false;
        switch (layout.node.cssInitial('textAlign')) {
            case $const.CSS.CENTER:
                valid = floated.size === 0;
                break;
            case $const.CSS.END:
            case $const.CSS.RIGHT:
                valid = floated.size === 0 || floated.has($const.CSS.RIGHT) && floated.size === 1 && layout.cleared.size === 0;
                break;
        }
        if (valid || layout.some(node => node.blockVertical || node.percentWidth || (node.verticalAlign === $const.CSS.MIDDLE || node.verticalAlign === $const.CSS.BOTTOM) && !layout.parent.hasHeight)) {
            return layout.singleRowAligned && layout.every(node => node.positiveAxis || node.renderExclude);
        }
        return false;
    }

    public checkLinearHorizontal(layout: $LayoutUI<T>) {
        const floated = layout.floated;
        if ((floated.size === 0 || floated.size === 1 && floated.has($const.CSS.LEFT)) && layout.singleRowAligned) {
            const lineHeight = layout.children[0].lineHeight;
            for (const node of layout) {
                if (!(node.naturalChild && node.length === 0 && !node.inputElement && !node.positionRelative && !node.blockVertical && !node.positionAuto && node.lineHeight === lineHeight && (node.baseline || node.cssAny('verticalAlign', $const.CSS.TOP, $const.CSS.MIDDLE, $const.CSS.BOTTOM)))) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    public setConstraints() {
        for (const node of this.cache as $NodeList<T>) {
            if (node.layoutRelative) {
                this.processRelativeHorizontal(node, node.renderChildren as T[]);
            }
            else if (node.layoutConstraint && node.hasProcedure($e.NODE_PROCEDURE.CONSTRAINT)) {
                const children = node.renderFilter((item: T) => !item.positioned) as T[];
                if (children.length) {
                    const [pageFlow, absolute] = $util.partitionArray(children, item => item.pageFlow || item.positionAuto);
                    if (absolute.length) {
                        for (const item of absolute) {
                            if (item.leftTopAxis) {
                                if (item.hasWidth && item.autoMargin.horizontal) {
                                    if (item.hasPX($const.CSS.LEFT) && item.autoMargin.right) {
                                        item.anchor($const.CSS.LEFT, STRING_ANDROID.PARENT);
                                        item.modifyBox($e.BOX_STANDARD.MARGIN_LEFT, item.left);
                                    }
                                    else if (item.hasPX($const.CSS.RIGHT) && item.autoMargin.left) {
                                        item.anchor($const.CSS.RIGHT, STRING_ANDROID.PARENT);
                                        item.modifyBox($e.BOX_STANDARD.MARGIN_RIGHT, item.right);
                                    }
                                    else {
                                        item.anchorParent(STRING_ANDROID.HORIZONTAL);
                                        item.modifyBox($e.BOX_STANDARD.MARGIN_LEFT, item.left);
                                        item.modifyBox($e.BOX_STANDARD.MARGIN_RIGHT, item.right);
                                    }
                                }
                                else {
                                    if (item.hasPX($const.CSS.LEFT)) {
                                        item.anchor($const.CSS.LEFT, STRING_ANDROID.PARENT);
                                        if (!item.hasPX($const.CSS.RIGHT) && item.css($const.CSS.WIDTH) === $const.CSS.PERCENT_100) {
                                            item.anchor($const.CSS.RIGHT, STRING_ANDROID.PARENT);
                                        }
                                        item.modifyBox($e.BOX_STANDARD.MARGIN_LEFT, adjustAbsolutePaddingOffset(node, $e.BOX_STANDARD.PADDING_LEFT, item.left));
                                    }
                                    if (item.hasPX($const.CSS.RIGHT) && (!item.hasPX($const.CSS.WIDTH) || item.css($const.CSS.WIDTH) === $const.CSS.PERCENT_100 || !item.hasPX($const.CSS.LEFT))) {
                                        item.anchor($const.CSS.RIGHT, STRING_ANDROID.PARENT);
                                        item.modifyBox($e.BOX_STANDARD.MARGIN_RIGHT, adjustAbsolutePaddingOffset(node, $e.BOX_STANDARD.PADDING_RIGHT, item.right));
                                    }
                                }
                                if (item.hasHeight && item.autoMargin.vertical) {
                                    if (item.hasPX($const.CSS.TOP) && item.autoMargin.bottom) {
                                        item.anchor($const.CSS.TOP, STRING_ANDROID.PARENT);
                                        item.modifyBox($e.BOX_STANDARD.MARGIN_TOP, item.top);
                                    }
                                    else if (item.hasPX($const.CSS.BOTTOM) && item.autoMargin.top) {
                                        item.anchor($const.CSS.BOTTOM, STRING_ANDROID.PARENT);
                                        item.modifyBox($e.BOX_STANDARD.MARGIN_BOTTOM, item.bottom);
                                    }
                                    else {
                                        item.anchorParent(STRING_ANDROID.VERTICAL);
                                        item.modifyBox($e.BOX_STANDARD.MARGIN_TOP, item.top);
                                        item.modifyBox($e.BOX_STANDARD.MARGIN_BOTTOM, item.bottom);
                                    }
                                }
                                else {
                                    if (item.hasPX($const.CSS.TOP)) {
                                        item.anchor($const.CSS.TOP, STRING_ANDROID.PARENT);
                                        if (!item.hasPX($const.CSS.BOTTOM) && item.css($const.CSS.HEIGHT) === $const.CSS.PERCENT_100) {
                                            item.anchor($const.CSS.BOTTOM, STRING_ANDROID.PARENT);
                                        }
                                        item.modifyBox($e.BOX_STANDARD.MARGIN_TOP, adjustAbsolutePaddingOffset(node, $e.BOX_STANDARD.PADDING_TOP, item.top));
                                    }
                                    if (item.hasPX($const.CSS.BOTTOM) && (!item.hasPX($const.CSS.HEIGHT) || item.css($const.CSS.HEIGHT) === $const.CSS.PERCENT_100 || !item.hasPX($const.CSS.TOP))) {
                                        item.anchor($const.CSS.BOTTOM, STRING_ANDROID.PARENT);
                                        item.modifyBox($e.BOX_STANDARD.MARGIN_BOTTOM, adjustAbsolutePaddingOffset(node, $e.BOX_STANDARD.PADDING_BOTTOM, item.bottom));
                                    }
                                }
                                item.positioned = true;
                            }
                        }
                    }
                    if (pageFlow.length) {
                        if (node.layoutHorizontal) {
                            this.processConstraintHorizontal(node, pageFlow);
                        }
                        else if (node.hasAlign($e.NODE_ALIGNMENT.COLUMN)) {
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
                                item.anchorStyle(STRING_ANDROID.HORIZONTAL, 'packed', 1);
                            }
                            else if (!item.centerAligned) {
                                item.anchorStyle(STRING_ANDROID.HORIZONTAL);
                            }
                            if (!item.autoMargin.topBottom) {
                                item.anchorStyle(STRING_ANDROID.VERTICAL);
                            }
                            Controller.setConstraintDimension(item);
                        }
                        this.evaluateAnchors(pageFlow);
                    }
                    for (const item of children) {
                        if (!item.anchored) {
                            if (item.outerWrapper) {
                                if (item.constraint.horizontal) {
                                    item.anchorParent(STRING_ANDROID.HORIZONTAL);
                                }
                                if (item.constraint.vertical) {
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

    public renderNodeGroup(layout: $LayoutUI<T>) {
        const node = layout.node;
        const containerType = layout.containerType;
        const alignmentType = layout.alignmentType;
        const options = createViewAttribute();
        let valid = false;
        switch (containerType) {
            case CONTAINER_NODE.LINEAR:
                if ($util.hasBit(alignmentType, $e.NODE_ALIGNMENT.VERTICAL)) {
                    options.android.orientation = STRING_ANDROID.VERTICAL;
                    valid = true;
                }
                else if ($util.hasBit(alignmentType, $e.NODE_ALIGNMENT.HORIZONTAL)) {
                    options.android.orientation = STRING_ANDROID.HORIZONTAL;
                    valid = true;
                }
                break;
            case CONTAINER_NODE.GRID:
                options.android.rowCount = layout.rowCount ? layout.rowCount.toString() : '';
                options.android.columnCount = layout.columnCount ? layout.columnCount.toString() : '2';
                valid = true;
                break;
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
            node.setControlType(View.getControlName(containerType), containerType);
            node.addAlign(alignmentType);
            node.render(!node.dataset.use && node.dataset.target ? (<squared.base.ApplicationUI<T>> this.application).resolveTarget(node.dataset.target) : layout.parent);
            node.apply(options);
            return <NodeXmlTemplate<T>> {
                type: $e.NODE_TEMPLATE.XML,
                node,
                controlName: node.controlName
            };
        }
        return undefined;
    }

    public renderNode(layout: $LayoutUI<T>) {
        const node = layout.node;
        let controlName = View.getControlName(layout.containerType);
        node.setControlType(controlName, layout.containerType);
        node.addAlign(layout.alignmentType);
        let parent = layout.parent;
        let target = !node.dataset.use ? node.dataset.target : undefined;
        switch (node.tagName) {
            case 'IMG': {
                const element = <HTMLImageElement> node.element;
                const absoluteParent = node.absoluteParent || node.documentParent;
                let width = node.toFloat($const.CSS.WIDTH);
                let height = node.toFloat($const.CSS.HEIGHT);
                let percentWidth = node.percentWidth ? width : -1;
                const percentHeight = node.percentHeight ? height : -1;
                let scaleType = 'fitXY';
                let imageSet: ImageSrcSet[] | undefined;
                if (element.srcset) {
                    imageSet = $css.getSrcSet(element, this.localSettings.supported.imageFormat as string[]);
                    if (imageSet.length) {
                        if (imageSet[0].actualWidth) {
                            if (percentWidth === -1) {
                                width = imageSet[0].actualWidth;
                                node.css($const.CSS.WIDTH, $css.formatPX(width), true);
                                const image = this.application.resourceHandler.getImage(element.src);
                                if (image && image.width > 0 && image.height > 0) {
                                    height = image.height * (width / image.width);
                                    node.css($const.CSS.HEIGHT, $css.formatPX(height), true);
                                }
                                else {
                                    node.android('adjustViewBounds', 'true');
                                }
                            }
                            else {
                                width = parent.box.width;
                                node.android('adjustViewBounds', 'true');
                            }
                            percentWidth = -1;
                        }
                    }
                    else {
                        imageSet = undefined;
                    }
                }
                if (node.hasResource($e.NODE_RESOURCE.IMAGE_SOURCE)) {
                    const src = (<android.base.Resource<T>> this.application.resourceHandler).addImageSrc(element, '', imageSet);
                    if (src !== '') {
                        node.android('src', `@drawable/${src}`);
                    }
                }
                if (percentWidth !== -1 || percentHeight !== -1) {
                    if (percentWidth >= 0) {
                        width *= absoluteParent.box.width / 100;
                        if (percentWidth < 100 && !parent.layoutConstraint) {
                            node.css($const.CSS.WIDTH, $css.formatPX(width));
                            node.android('adjustViewBounds', 'true');
                        }
                    }
                    if (percentHeight >= 0) {
                        height *= absoluteParent.box.height / 100;
                        if (percentHeight < 100 && !(parent.layoutConstraint && absoluteParent.hasHeight)) {
                            node.css($const.CSS.HEIGHT, $css.formatPX(height));
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
                            scaleType = $const.CSS.CENTER;
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
                        node.mergeGravity(STRING_ANDROID.LAYOUT_GRAVITY, $const.CSS.BOTTOM);
                    }
                }
                if (!node.pageFlow && parent === node.absoluteParent && (node.left < 0 && parent.css('overflowX') === 'hidden' || node.top < 0 && parent.css('overflowY') === 'hidden')) {
                    const application = <squared.base.ApplicationUI<T>> this.application;
                    const container = application.createNode();
                    container.setControlType(CONTAINER_ANDROID.FRAME, CONTAINER_NODE.FRAME);
                    container.inherit(node, 'base');
                    container.positionAuto = false;
                    container.exclude($e.NODE_RESOURCE.ALL, $e.NODE_PROCEDURE.ALL);
                    container.cssApply({
                        position: node.css('position'),
                        zIndex: node.zIndex.toString()
                    });
                    parent.appendTry(node, container);
                    node.parent = container;
                    if (width > 0) {
                        container.setLayoutWidth(width < absoluteParent.box.width ? $css.formatPX(width) : STRING_ANDROID.MATCH_PARENT);
                    }
                    else {
                        container.setLayoutWidth(STRING_ANDROID.WRAP_CONTENT);
                    }
                    if (height > 0) {
                        container.setLayoutHeight(height < absoluteParent.box.height ? $css.formatPX(height) : STRING_ANDROID.MATCH_PARENT);
                    }
                    else {
                        container.setLayoutHeight(STRING_ANDROID.WRAP_CONTENT);
                    }
                    container.render(target ? application.resolveTarget(target) : parent);
                    container.saveAsInitial();
                    container.innerWrapped = node;
                    node.outerWrapper = container;
                    if (!parent.layoutConstraint) {
                        node.modifyBox($e.BOX_STANDARD.MARGIN_TOP, node.top);
                        node.modifyBox($e.BOX_STANDARD.MARGIN_LEFT, node.left);
                    }
                    application.addLayoutTemplate(
                        parent,
                        container,
                        <NodeXmlTemplate<T>> {
                            type: $e.NODE_TEMPLATE.XML,
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
                switch (element.type) {
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
                    case 'range':
                    case 'time':
                    case 'number':
                    case 'date':
                    case 'datetime-local':
                        switch (element.type) {
                            case 'number':
                            case 'range':
                                node.android('inputType', 'number');
                                break;
                            case 'date':
                                node.android('inputType', 'date');
                                break;
                            case 'time':
                                node.android('inputType', 'time');
                                break;
                            case 'datetime-local':
                                node.android('inputType', 'datetime');
                                break;
                        }
                        if ($util.isString(element.min)) {
                            node.android('min', element.min);
                        }
                        if ($util.isString(element.max)) {
                            node.android('max', element.max);
                        }
                        break;
                    case 'email':
                    case 'tel':
                    case 'url':
                    case 'week':
                    case 'month':
                    case 'search':
                        switch (element.type) {
                            case 'email':
                                node.android('inputType', 'textEmailAddress');
                                break;
                            case 'tel':
                                node.android('inputType', 'phone');
                                break;
                            case 'url':
                                node.android('inputType', 'textUri');
                                break;
                            default:
                                node.android('inputType', 'text');
                                break;
                        }
                        if (element.minLength !== -1) {
                            node.android('minLength', element.minLength.toString());
                        }
                        if (element.maxLength > 0) {
                            node.android('maxLength', element.maxLength.toString());
                        }
                        break;
                }
                break;
            }
            case 'TEXTAREA': {
                const element = <HTMLTextAreaElement> node.element;
                node.android('minLines', element.rows ? element.rows.toString() : '2');
                switch (node.css('verticalAlign')) {
                    case $const.CSS.MIDDLE:
                        node.mergeGravity(STRING_ANDROID.GRAVITY, STRING_ANDROID.CENTER_VERTICAL);
                        break;
                    case $const.CSS.BOTTOM:
                        node.mergeGravity(STRING_ANDROID.GRAVITY, $const.CSS.BOTTOM);
                        break;
                    default:
                        node.mergeGravity(STRING_ANDROID.GRAVITY, $const.CSS.TOP);
                        break;
                }
                if (element.maxLength > 0) {
                    node.android('maxLength', element.maxLength.toString());
                }
                if (!node.hasPX($const.CSS.WIDTH) && element.cols > 0) {
                    node.css($const.CSS.WIDTH, $css.formatPX(element.cols * 8), true);
                }
                node.android('hint', element.placeholder);
                node.android('scrollbars', STRING_ANDROID.VERTICAL);
                node.android('inputType', 'textMultiLine');
                if (node.overflowX) {
                    node.android('scrollHorizontally', 'true');
                }
                break;
            }
            case 'LEGEND': {
                if (!node.hasWidth) {
                    node.css('minWidth', $css.formatPX(node.actualWidth), true);
                    node.css('display', 'inline-block', true);
                }
                node.modifyBox($e.BOX_STANDARD.MARGIN_BOTTOM, node.actualHeight * this.localSettings.deviations.legendBottomOffset);
                break;
            }
        }
        switch (controlName) {
            case CONTAINER_ANDROID.TEXT:
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
                    node.android('letterSpacing', $math.truncate(node.toFloat('letterSpacing') / node.fontSize, this.localSettings.precision.standardFloat));
                }
                if (node.css('textAlign') === 'justify') {
                    node.android('justificationMode', 'inter_word');
                }
                if (node.has('textShadow')) {
                    if (CACHE_PATTERN.TEXT_SHADOW === undefined) {
                        CACHE_PATTERN.TEXT_SHADOW = /^(rgba?\(\d+, \d+, \d+(?:, [\d.]+)?\)) (-?[\d.]+[a-z]+) (-?[\d.]+[a-z]+)\s*(-?[\d.]+[a-z]+)?$/;
                    }
                    const match = CACHE_PATTERN.TEXT_SHADOW.exec(node.css('textShadow'));
                    if (match) {
                        const color = Resource.addColor($color.parseColor(match[1]));
                        if (color !== '') {
                            node.android('shadowColor', `@color/${color}`);
                            node.android('shadowDx', $math.truncate($css.parseUnit(match[2], node.fontSize) * 2));
                            node.android('shadowDy', $math.truncate($css.parseUnit(match[3], node.fontSize) * 2));
                            node.android('shadowRadius', match[4] ? $math.truncate(Math.max($css.parseUnit(match[4], node.fontSize), 1)) : '1');
                        }
                    }
                }
                if (node.css('whiteSpace') === 'nowrap') {
                    node.android('maxLines', '1');
                    node.android('ellipsize', $const.CSS.END);
                }
                break;
            case CONTAINER_ANDROID.BUTTON:
                if (!node.hasHeight) {
                    node.android('minHeight', $css.formatPX(Math.ceil(node.actualHeight)));
                }
                node.mergeGravity(STRING_ANDROID.GRAVITY, STRING_ANDROID.CENTER_VERTICAL);
                break;
            case CONTAINER_ANDROID.EDIT: {
                const element = <HTMLInputElement> node.element;
                if (element.list && element.list.children.length) {
                    controlName = CONTAINER_ANDROID.EDIT_LIST;
                    node.controlName = controlName;
                }
            }
            case CONTAINER_ANDROID.RANGE:
                if (!node.hasPX($const.CSS.WIDTH)) {
                    node.css($const.CSS.WIDTH, $css.formatPX(node.bounds.width), true);
                }
                break;
            case CONTAINER_ANDROID.LINE:
                if (!node.hasHeight) {
                    node.setLayoutHeight($css.formatPX(node.contentBoxHeight || 1));
                }
                break;
        }
        node.render(target ? (<android.base.Application<T>> this.application).resolveTarget(target) : parent);
        return <NodeXmlTemplate<T>> {
            type: $e.NODE_TEMPLATE.XML,
            node,
            parent,
            controlName
        };
    }

    public renderNodeStatic(controlName: string, options?: ExternalData, width?: string, height?: string, content?: string) {
        const node = new View(0, '0', undefined, this.afterInsertNode);
        node.setControlType(controlName);
        if (width !== '') {
            node.setLayoutWidth(width || STRING_ANDROID.WRAP_CONTENT);
        }
        if (height !== '') {
            node.setLayoutHeight(height || STRING_ANDROID.WRAP_CONTENT);
        }
        if (options) {
            node.apply(options);
            options.documentId = node.documentId;
        }
        return this.getEnclosingXmlTag(controlName, this.userSettings.showAttributes ? node.extractAttributes(1) : undefined, content);
    }

    public renderSpace(width: string, height?: string, columnSpan?: number, rowSpan?: number, options?: ViewAttribute) {
        if (options === undefined) {
            options = createViewAttribute();
        }
        if ($css.isPercent(width)) {
            options.android.layout_columnWeight = $math.truncate(parseFloat(width) / 100, this.localSettings.precision.standardFloat);
            width = $const.CSS.PX_0;
        }
        if (height && $css.isPercent(height)) {
            options.android.layout_rowWeight = $math.truncate(parseFloat(height) / 100, this.localSettings.precision.standardFloat);
            height = $const.CSS.PX_0;
        }
        if (columnSpan) {
            options.android.layout_columnSpan = columnSpan.toString();
        }
        if (rowSpan) {
            options.android.layout_rowSpan = rowSpan.toString();
        }
        return this.renderNodeStatic(CONTAINER_ANDROID.SPACE, options, width, height || undefined);
    }

    public addGuideline(node: T, parent: T, orientation?: string, percent = false, opposite = false) {
        const absoluteParent = node.absoluteParent as T;
        const boxParent = parent.nodeGroup && !(node.documentParent as T).hasAlign($e.NODE_ALIGNMENT.AUTO_LAYOUT) ? parent : node.documentParent as T;
        GUIDELINE_AXIS.forEach(value => {
            if (!node.constraint[value] && (!orientation || value === orientation)) {
                const horizontal = value === STRING_ANDROID.HORIZONTAL;
                const box = boxParent.box;
                let LT: string;
                let RB: string;
                let LTRB: string;
                let RBLT: string;
                if (horizontal) {
                    LT = !opposite ? $const.CSS.LEFT : $const.CSS.RIGHT;
                    RB = !opposite ? $const.CSS.RIGHT : $const.CSS.LEFT;
                    LTRB = !opposite ? $c.STRING_BASE.LEFT_RIGHT : $c.STRING_BASE.RIGHT_LEFT;
                    RBLT = !opposite ? $c.STRING_BASE.RIGHT_LEFT : $c.STRING_BASE.LEFT_RIGHT;
                }
                else {
                    LT = !opposite ? $const.CSS.TOP : $const.CSS.BOTTOM;
                    RB = !opposite ? $const.CSS.BOTTOM : $const.CSS.TOP;
                    LTRB = !opposite ? $c.STRING_BASE.TOP_BOTTOM : $c.STRING_BASE.BOTTOM_TOP;
                    RBLT = !opposite ? $c.STRING_BASE.BOTTOM_TOP : $c.STRING_BASE.TOP_BOTTOM;
                }
                if ($util.withinRange(node.linear[LT], box[LT])) {
                    node.anchor(LT, STRING_ANDROID.PARENT, true);
                    return;
                }
                const bounds = node.positionStatic ? node.bounds : node.linear;
                let beginPercent = 'layout_constraintGuide_';
                let location: number;
                if (!percent && !parent.hasAlign($e.NODE_ALIGNMENT.AUTO_LAYOUT)) {
                    const found = parent.renderChildren.some(item => {
                        if (item !== node && item.constraint[value]) {
                            let valid = false;
                            if (node.pageFlow && item.pageFlow) {
                                if ($util.withinRange(node.linear[LT], item.linear[RB])) {
                                    node.anchor(LTRB, item.documentId, true);
                                    valid = true;
                                }
                                else if ($util.withinRange(node.linear[RB], item.linear[LT])) {
                                    node.anchor(RBLT, item.documentId, true);
                                    valid = true;
                                }
                            }
                            if (!valid) {
                                if ($util.withinRange(node.bounds[LT], item.bounds[LT])) {
                                    if (!horizontal && node.textElement && node.baseline && item.textElement && item.baseline) {
                                        node.anchor('baseline', item.documentId, true);
                                    }
                                    else {
                                        node.anchor(LT, item.documentId, true);
                                        if (horizontal) {
                                            node.modifyBox($e.BOX_STANDARD.MARGIN_LEFT, -item.marginLeft, false);
                                        }
                                        else {
                                            node.modifyBox($e.BOX_STANDARD.MARGIN_TOP, -item.marginTop, false);
                                        }
                                    }
                                    valid = true;
                                }
                                else if ($util.withinRange(node.bounds[RB], item.bounds[RB])) {
                                    node.anchor(RB, item.documentId, true);
                                    node.modifyBox(horizontal ? $e.BOX_STANDARD.MARGIN_RIGHT : $e.BOX_STANDARD.MARGIN_BOTTOM);
                                    valid = true;
                                }
                                else if (!node.pageFlow && item.pageFlow && $util.withinRange(node.bounds[LT] + node[LT], item.bounds[LT])) {
                                    node.anchor(LT, item.documentId, true);
                                    node.modifyBox(horizontal ? $e.BOX_STANDARD.MARGIN_LEFT : $e.BOX_STANDARD.MARGIN_TOP, node[LT]);
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
                            node.anchor(horizontal ? $c.STRING_BASE.RIGHT_LEFT : $const.CSS.TOP, previousSibling.documentId, true);
                            node.constraint[value] = previousSibling.constraint[value];
                            return;
                        }
                    }
                }
                if (percent) {
                    const position = Math.abs(bounds[LT] - box[LT]) / box[horizontal ? $const.CSS.WIDTH : $const.CSS.HEIGHT];
                    location = parseFloat($math.truncate(opposite ? 1 - position : position, this.localSettings.precision.standardFloat));
                    beginPercent += 'percent';
                }
                else {
                    location = bounds[LT] - box[!opposite ? LT : RB];
                    if (!horizontal && !boxParent.nodeGroup && boxParent !== absoluteParent && absoluteParent.getBox($e.BOX_STANDARD.MARGIN_TOP)[0] === 1) {
                        location -= absoluteParent.marginTop;
                    }
                    beginPercent += 'begin';
                }
                const guideline = parent.constraint.guideline || {};
                if (!node.pageFlow) {
                    if (node.parent === boxParent.outerWrapper) {
                        location += boxParent[!opposite ? (horizontal ? 'paddingLeft' : 'paddingTop') : (horizontal ? 'paddingRight' : 'paddingBottom')];
                    }
                    else if (absoluteParent === node.documentParent) {
                        let direction: number;
                        if (horizontal) {
                            direction = !opposite ? $e.BOX_STANDARD.PADDING_LEFT : $e.BOX_STANDARD.PADDING_RIGHT;
                        }
                        else {
                            direction = !opposite ? $e.BOX_STANDARD.PADDING_TOP : $e.BOX_STANDARD.PADDING_BOTTOM;
                        }
                        location = adjustAbsolutePaddingOffset(boxParent, direction, location);
                    }
                }
                else if (node.inlineVertical) {
                    const offset = $util.convertFloat(node.verticalAlign);
                    if (offset < 0) {
                        location += offset;
                    }
                }
                if (!horizontal && node.marginTop < 0) {
                    location -= node.marginTop;
                    node.modifyBox($e.BOX_STANDARD.MARGIN_TOP);
                }
                node.constraint[value] = true;
                if (location <= 0) {
                    node.anchor(LT, STRING_ANDROID.PARENT, true);
                    if (location < 0) {
                        const innerWrapped = node.innerWrapped;
                        if (innerWrapped && !innerWrapped.pageFlow) {
                            let boxMargin = 0;
                            switch (LT) {
                                case $const.CSS.TOP:
                                    boxMargin = $e.BOX_STANDARD.MARGIN_TOP;
                                    break;
                                case $const.CSS.LEFT:
                                    boxMargin = $e.BOX_STANDARD.MARGIN_LEFT;
                                    break;
                                case $const.CSS.BOTTOM:
                                    boxMargin = $e.BOX_STANDARD.MARGIN_BOTTOM;
                                    break;
                                case $const.CSS.RIGHT:
                                    boxMargin = $e.BOX_STANDARD.MARGIN_RIGHT;
                                    break;
                            }
                            innerWrapped.modifyBox(boxMargin, location);
                        }
                    }
                }
                else if (horizontal && location + bounds.width >= box.right && boxParent.hasPX($const.CSS.WIDTH) && !node.hasPX($const.CSS.RIGHT) || !horizontal && location + bounds.height >= box.bottom && boxParent.hasPX($const.CSS.HEIGHT) && !node.hasPX($const.CSS.BOTTOM)) {
                    node.anchor(RB, STRING_ANDROID.PARENT, true);
                }
                else {
                    const anchors = $util.optionalAsObject(guideline, `${value}.${beginPercent}.${LT}`);
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
                        resourceValue = `@dimen/${Resource.insertStoredAsset('dimens', `constraint_guideline_${!opposite ? LT : RB}`, $css.formatPX(location))}`;
                    }
                    const options = createViewAttribute(
                        undefined,
                        { orientation: horizontal ? STRING_ANDROID.VERTICAL : STRING_ANDROID.HORIZONTAL },
                        { [beginPercent]: resourceValue }
                    );
                    this.addAfterOutsideTemplate(node.id, this.renderNodeStatic(CONTAINER_ANDROID.GUIDELINE, options), false);
                    const documentId = options.documentId;
                    if (documentId) {
                        node.anchor(LT, documentId, true);
                        node.anchorDelete(RB);
                        if (location > 0) {
                            $util.assignEmptyValue(guideline, value, beginPercent, LT, documentId, location.toString());
                            parent.constraint.guideline = guideline;
                        }
                    }
                }
            }
        });
    }

    public addBarrier(nodes: T[], barrierDirection: string) {
        const unbound = [];
        for (const node of nodes) {
            if (node.constraint.barrier === undefined) {
                node.constraint.barrier = {};
            }
            else if (node.constraint.barrier[barrierDirection]) {
                continue;
            }
            unbound.push(node);
        }
        if (unbound.length) {
            const options = createViewAttribute(
                undefined,
                undefined,
                {
                    barrierDirection,
                    constraint_referenced_ids: $util.objectMap(unbound, item => getDocumentId(item.documentId)).join(',')
                }
            );
            this.addAfterOutsideTemplate(unbound[unbound.length - 1].id, this.renderNodeStatic(CONTAINER_ANDROID.BARRIER, options), false);
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
            if (node.alignParent($const.CSS.TOP)) {
                let current = node;
                while (true) {
                    const bottomTop = current.alignSibling($c.STRING_BASE.BOTTOM_TOP);
                    if (bottomTop !== '') {
                        const next = nodes.find(item => item.documentId === bottomTop);
                        if (next && next.alignSibling($c.STRING_BASE.TOP_BOTTOM) === current.documentId) {
                            if (next.alignParent($const.CSS.BOTTOM)) {
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
                            let documentId: string | undefined;
                            if (current.constraint.barrier === undefined || !current.constraint.barrier.bottom) {
                                documentId = this.addBarrier([current], $const.CSS.BOTTOM);
                            }
                            else {
                                documentId = current.constraint.barrier.bottom;
                            }
                            if (documentId) {
                                current.anchor($c.STRING_BASE.BOTTOM_TOP, documentId);
                            }
                        }
                        break;
                    }
                }
            }
        }
        let i = -1;
        while (++i < nodes.length) {
            const node = nodes[i];
            if (!node.constraint.horizontal) {
                for (const attr in node.constraint.current) {
                    const position = node.constraint.current[attr];
                    if (position.horizontal && horizontal.some(item => item.documentId === position.documentId)) {
                        node.constraint.horizontal = true;
                        horizontal.push(node);
                        i = -1;
                        break;
                    }
                }
            }
            if (!node.constraint.vertical) {
                for (const attr in node.constraint.current) {
                    const position = node.constraint.current[attr];
                    if (!position.horizontal && vertical.some(item => item.documentId === position.documentId)) {
                        node.constraint.vertical = true;
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

    public createNodeWrapper(node: T, parent: T, children?: T[], controlName?: string, containerType?: number) {
        const container = this.application.createNode(undefined, true, parent, children);
        container.addAlign($e.NODE_ALIGNMENT.WRAPPER);
        if (node.documentRoot) {
            container.documentRoot = true;
            node.documentRoot = false;
        }
        container.inherit(node, 'base', 'alignment');
        if (controlName) {
            container.setControlType(controlName, containerType);
        }
        container.exclude($e.NODE_RESOURCE.BOX_STYLE | $e.NODE_RESOURCE.ASSET, $e.NODE_PROCEDURE.CUSTOMIZATION, $e.APP_SECTION.ALL);
        parent.appendTry(node, container);
        node.parent = container;
        const outerWrapper = node.outerWrapper;
        if (outerWrapper) {
            container.outerWrapper = outerWrapper;
            outerWrapper.innerWrapped = container;
        }
        if (node.renderParent) {
            const renderTemplates = node.renderParent.renderTemplates;
            if (renderTemplates) {
                const length = renderTemplates.length;
                for (let i = 0; i < length; i++) {
                    const template = renderTemplates[i];
                    if (template && template.node === node) {
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
            marginTop: $const.CSS.PX_0,
            marginRight: $const.CSS.PX_0,
            marginBottom: $const.CSS.PX_0,
            marginLeft: $const.CSS.PX_0,
            paddingTop: $const.CSS.PX_0,
            paddingRight: $const.CSS.PX_0,
            paddingBottom: $const.CSS.PX_0,
            paddingLeft: $const.CSS.PX_0,
            borderTopStyle: $const.CSS.NONE,
            borderRightStyle: $const.CSS.NONE,
            borderBottomStyle: $const.CSS.NONE,
            borderLeftStyle: $const.CSS.NONE,
            borderRadius: $const.CSS.PX_0
        });
        if (node.documentParent.layoutElement) {
            const android = node.namespace('android');
            for (const attr in android) {
                if (attr.startsWith('layout_')) {
                    container.android(attr, android[attr]);
                    delete android[attr];
                }
            }
            node.transferBox($e.BOX_STANDARD.MARGIN, container);
        }
        container.innerWrapped = node;
        node.outerWrapper = container;
        return container;
    }

    protected processRelativeHorizontal(node: T, children: T[]) {
        const rowsLeft: T[][] = [];
        let rowsRight: T[][] | undefined;
        let alignmentMultiLine = false;
        let sortPositionAuto = false;
        if (node.hasAlign($e.NODE_ALIGNMENT.VERTICAL)) {
            let previous: T | undefined;
            for (const item of children) {
                if (previous) {
                    item.anchor($c.STRING_BASE.TOP_BOTTOM, previous.documentId);
                }
                else {
                    item.anchor($const.CSS.TOP, 'true');
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
                if (renderParent) {
                    if (renderParent.overflowY) {
                        return renderParent.box.width;
                    }
                    else {
                        const actualParent = node.actualParent as T;
                        if (actualParent) {
                            if (actualParent === renderParent && actualParent.blockStatic && node.naturalElement && node.inlineStatic) {
                                return actualParent.box.width - (node.linear.left - actualParent.box.left);
                            }
                            else if (actualParent.floatContainer) {
                                const { containerType, alignmentType } = this.containerTypeVerticalMargin;
                                const container = node.ascend((item: T) => item.of(containerType, alignmentType), actualParent, 'renderParent');
                                if (container.length) {
                                    let leftOffset = 0;
                                    let rightOffset = 0;
                                    for (const item of actualParent.naturalElements as T[]) {
                                        if (item.floating && !children.includes(item) && node.intersectY(item.linear)) {
                                            if (item.float === $const.CSS.LEFT) {
                                                if (Math.floor(item.linear.right) > node.box.left) {
                                                    leftOffset = Math.max(leftOffset, item.linear.right - node.box.left);
                                                }
                                            }
                                            else if (item.float === $const.CSS.RIGHT && node.box.right > Math.ceil(item.linear.left)) {
                                                rightOffset = Math.max(rightOffset, node.box.right - item.linear.left);
                                            }
                                        }
                                    }
                                    return node.box.width - leftOffset - rightOffset;
                                }
                            }
                        }
                    }
                }
                return node.box.width;
            })();
            const checkLineWrap = node.css('whiteSpace') !== 'nowrap';
            const cleared = $NodeUI.linearData(children, true).cleared;
            const textIndent = node.blockDimension ? node.parseUnit(node.css('textIndent')) : 0;
            let rowWidth = 0;
            let previousRowLeft: T | undefined;
            $util.partitionArray(children, item => item.float !== $const.CSS.RIGHT).forEach((seg, index) => {
                const length = seg.length;
                if (length === 0) {
                    return;
                }
                const leftAlign = index === 0;
                let leftForward = true;
                let alignParent: string;
                let rows: T[][];
                if (leftAlign) {
                    const actualParent = seg[0].actualParent;
                    if (actualParent && actualParent.cssInitialAny('textAlign', $const.CSS.RIGHT, $const.CSS.END)) {
                        alignParent = $const.CSS.RIGHT;
                        leftForward = false;
                        seg[length - 1].anchor(alignParent, 'true');
                    }
                    else {
                        alignParent = $const.CSS.LEFT;
                    }
                    sortHorizontalFloat(seg);
                    rows = rowsLeft;
                }
                else {
                    alignParent = $const.CSS.RIGHT;
                    rowsRight = [];
                    rows = rowsRight;
                }
                let previousMultiline = false;
                let previous!: T;
                for (let i = 0; i < length; i++) {
                    const item = seg[i];
                    let alignSibling = leftAlign && leftForward ? $c.STRING_BASE.LEFT_RIGHT : $c.STRING_BASE.RIGHT_LEFT;
                    if (!item.pageFlow) {
                        if (previous) {
                            item.anchor(alignSibling, previous.documentId);
                            item.anchor($const.CSS.TOP, previous.documentId);
                        }
                        else {
                            item.anchor(alignParent, 'true');
                            item.anchor($const.CSS.TOP, 'true');
                        }
                        sortPositionAuto = true;
                        continue;
                    }
                    let bounds = item.bounds;
                    if (item.naturalElement && item.inlineText && !item.hasPX($const.CSS.WIDTH)) {
                        const rect = $session.getRangeClientRect(<Element> item.element, item.sessionId);
                        if (rect.numberOfLines || rect.width < item.box.width) {
                            bounds = rect;
                            if (!item.multiline) {
                                item.multiline = rect.numberOfLines ? rect.numberOfLines > 0 : false;
                            }
                        }
                    }
                    let multiline = item.multiline;
                    if (multiline && Math.floor(bounds.width) <= boxWidth) {
                        multiline = false;
                    }
                    let anchored = true;
                    let siblings: Element[] | undefined;
                    if (item.autoMargin.leftRight) {
                        item.anchor('centerHorizontal', 'true');
                    }
                    else if (item.autoMargin.left) {
                        item.anchor($const.CSS.RIGHT, 'true');
                    }
                    else if (item.autoMargin.right) {
                        item.anchor($const.CSS.LEFT, 'true');
                    }
                    else {
                        anchored = false;
                    }
                    if (previous) {
                        const items = rows[rows.length - 1];
                        let maxWidth = 0;
                        let baseWidth = 0;
                        const checkFloatWrap = () => previous.floating && previous.alignParent($const.CSS.LEFT) && (item.multiline || Math.floor(rowWidth + item.width) < boxWidth);
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
                                maxWidth += rows.length > 1 ? 0 : textIndent;
                            }
                            else if (textIndent > 0) {
                                maxWidth -= rows.length === 1 ? textIndent : 0;
                            }
                            if (item.styleElement && item.inlineStatic) {
                                baseWidth -= item.contentBoxWidth;
                            }
                            return true;
                        };
                        if (adjustFloatingNegativeMargin(item, previous)) {
                            alignSibling = '';
                        }
                        const viewGroup = item.nodeGroup && !item.hasAlign($e.NODE_ALIGNMENT.SEGMENTED);
                        let retainMultiline = false;
                        siblings = !viewGroup && item.inlineVertical && previous.inlineVertical ? $dom.getElementsBetweenSiblings(previous.element, <Element> item.element, true) : undefined;
                        const startNewRow = () => {
                            if (previous.textElement) {
                                if (i === 1 && siblings === undefined && item.plainText && !$regex.CHAR.TRAILINGSPACE.test(previous.textContent) && !$regex.CHAR.LEADINGSPACE.test(item.textContent)) {
                                    retainMultiline = true;
                                    return false;
                                }
                                else if (checkLineWrap && previousMultiline && (previous.bounds.width >= boxWidth || Resource.hasLineBreak(previous, false, true))) {
                                    return true;
                                }
                            }
                            if (checkFloatWrap()) {
                                return false;
                            }
                            else if (checkLineWrap) {
                                checkWrapWidth();
                                if (baseWidth > maxWidth) {
                                    if (previous && previous.textElement) {
                                        checkSingleLine(previous, false, previousMultiline);
                                    }
                                    return true;
                                }
                                else if ($util.aboveRange(baseWidth, maxWidth) && !item.alignParent(alignParent)) {
                                    checkSingleLine(item, true, multiline);
                                }
                                if (multiline && Resource.hasLineBreak(item) || item.preserveWhiteSpace && $regex.CHAR.LEADINGNEWLINE.test(item.textContent)) {
                                    return true;
                                }
                            }
                            return false;
                        };
                        const textNewRow = item.textElement && startNewRow();
                        if (textNewRow ||
                            viewGroup ||
                            $util.aboveRange(item.linear.top, previous.linear.bottom) && (item.blockStatic || item.floating && previous.float === item.float) ||
                            previous.autoMargin.horizontal ||
                            cleared.has(item) ||
                            !item.textElement && !checkFloatWrap() && checkWrapWidth() && Math.floor(baseWidth) > maxWidth ||
                            !item.floating && (previous.blockStatic || item.previousSiblings().some(sibling => sibling.lineBreak || sibling.excluded === true && sibling.blockStatic) || !!siblings && siblings.some(element => Controller.causesLineBreak(element, node.sessionId))))
                        {
                            if (leftForward) {
                                if (previousRowLeft && item.linear.bottom <= previousRowLeft.bounds.bottom) {
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
                            if (textNewRow && multiline) {
                                checkSingleLine(previous, checkLineWrap, false);
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
                            if (!previous.floating && !retainMultiline && item.multiline && !item.hasPX($const.CSS.WIDTH)) {
                                multiline = false;
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
                    if (item.float === $const.CSS.LEFT && leftAlign) {
                        if (previousRowLeft) {
                            if ($util.aboveRange(item.linear.bottom, previousRowLeft.linear.bottom)) {
                                previousRowLeft = item;
                            }
                        }
                        else {
                            previousRowLeft = item;
                        }
                    }
                    let previousOffset = 0;
                    if (siblings && !siblings.some(element => !!$session.getElementAsNode(element, item.sessionId) || Controller.causesLineBreak(element, item.sessionId))) {
                        const betweenStart = $session.getRangeClientRect(siblings[0], '0');
                        if (!betweenStart.numberOfLines) {
                            const betweenEnd = siblings.length > 1 ? $session.getRangeClientRect(siblings[siblings.length - 1], '0') : undefined;
                            if (betweenEnd === undefined || !betweenEnd.numberOfLines) {
                                previousOffset = betweenEnd ? betweenStart.left - betweenEnd.right : betweenStart.width;
                            }
                        }
                    }
                    rowWidth += previousOffset + item.marginLeft + bounds.width + item.marginRight;
                    previous = item;
                    previousMultiline = multiline;
                }
            });
        }
        if (rowsLeft.length > 1 || rowsRight && rowsRight.length > 1) {
            alignmentMultiLine = true;
        }
        const setVerticalAlign = (rows: T[][]) => {
            let previousBaseline: T | null = null;
            const length = rows.length;
            for (let i = 0; i < length; i++) {
                const items = rows[i];
                let baseline: T | null;
                if (items.length > 1) {
                    let textBottom = getTextBottom(items);
                    baseline = $NodeUI.baseline(textBottom ? items.filter(item => item !== textBottom) : items);
                    if (baseline && textBottom) {
                        if (baseline !== textBottom && textBottom.bounds.height > baseline.bounds.height) {
                            baseline.anchor($const.CSS.BOTTOM, textBottom.documentId);
                        }
                        else {
                            baseline = $NodeUI.baseline(items);
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
                                            textBaseline = $NodeUI.baseline(items, true);
                                        }
                                        if (textBaseline) {
                                            if (item !== textBaseline) {
                                                item.anchor($const.CSS.TOP, textBaseline.documentId);
                                                break;
                                            }
                                        }
                                        break;
                                    case 'super':
                                        if (!item.baselineAltered) {
                                            item.modifyBox($e.BOX_STANDARD.MARGIN_TOP, Math.ceil(item.fontSize * this.localSettings.deviations.superscriptTopOffset) * -1);
                                        }
                                    case 'top':
                                        if (documentId !== '' && documentId !== item.documentId) {
                                            item.anchor($const.CSS.TOP, documentId);
                                        }
                                        else if (baseline) {
                                            item.anchor($const.CSS.TOP, baseline.documentId);
                                        }
                                        break;
                                    case 'middle':
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
                                                item.anchor($const.CSS.TOP, baseline.documentId);
                                                item.modifyBox($e.BOX_STANDARD.MARGIN_TOP);
                                                item.modifyBox($e.BOX_STANDARD.MARGIN_TOP, Math.round((heightParent - height) / 2));
                                            }
                                            else if (height > maxCenterHeight) {
                                                maxCenterHeight = height;
                                            }
                                        }
                                        break;
                                    case 'text-bottom':
                                        if (textBaseline === null) {
                                            textBaseline = $NodeUI.baseline(items, true);
                                        }
                                        if (textBaseline && textBaseline !== item) {
                                            item.anchor($const.CSS.BOTTOM, textBaseline.documentId);
                                        }
                                        else if (baseline) {
                                            item.anchor($const.CSS.BOTTOM, baseline.documentId);
                                        }
                                        break;
                                    case 'sub':
                                        if (!item.baselineAltered) {
                                            item.modifyBox($e.BOX_STANDARD.MARGIN_BOTTOM, Math.ceil(item.fontSize * this.localSettings.deviations.subscriptBottomOffset) * -1);
                                        }
                                    case 'bottom':
                                        if (documentId !== '' && !$util.withinRange(node.bounds.height, item.bounds.height)) {
                                            if (!node.hasHeight && documentId === 'true') {
                                                if (!alignmentMultiLine) {
                                                    node.css($const.CSS.HEIGHT, $css.formatPX(node.bounds.height), true);
                                                }
                                                else if (baseline) {
                                                    documentId = baseline.documentId;
                                                }
                                            }
                                            item.anchor($const.CSS.BOTTOM, documentId);
                                        }
                                        break;
                                    default:
                                        if (!item.baselineAltered) {
                                            baselineAlign.push(item);
                                        }
                                        break;
                                }
                            }
                        }
                    }
                    if (baseline) {
                        baseline.baselineActive = true;
                        if (baselineAlign.length) {
                            adjustBaseline(baseline, baselineAlign);
                        }
                        else if (baseline.textElement && maxCenterHeight > baseline.actualHeight) {
                            baseline.anchor('centerVertical', 'true');
                            baseline = null;
                        }
                    }
                    else if (baselineAlign.length && baselineAlign.length < items.length) {
                        textBottom = getTextBottom(items);
                        if (textBottom) {
                            for (const item of baselineAlign) {
                                if (item.baseline && !item.multiline && textBottom.bounds.height > item.bounds.height) {
                                    item.anchor($const.CSS.BOTTOM, textBottom.documentId);
                                }
                            }
                        }
                    }
                    const itemEnd = items[items.length - 1];
                    if (itemEnd.textElement && !itemEnd.multiline && !checkSingleLine(itemEnd, false, false)) {
                        itemEnd.android('maxLines', '1');
                    }
                }
                else {
                    baseline = items[0];
                    baseline.baselineActive = true;
                }
                if (i > 0) {
                    if (previousBaseline === null) {
                        const previousRow = rows[i - 1];
                        previousBaseline = previousRow.find(sibling => !sibling.floating) || previousRow[0];
                        let valid = false;
                        for (const sibling of previousRow) {
                            if (!valid && sibling === previousBaseline) {
                                valid = true;
                            }
                            else if (sibling.linear.bottom >= previousBaseline.linear.bottom && (!sibling.floating || previousBaseline.floating)) {
                                previousBaseline = sibling;
                            }
                        }
                    }
                    for (const item of items) {
                        if (item.alignSibling('baseline') === '') {
                            item.anchor($c.STRING_BASE.TOP_BOTTOM, previousBaseline.documentId);
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
                    positionAuto.push(<NodeTemplate<T>> renderTemplates[i]);
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
        const baseline = $NodeUI.baseline(children);
        const textBaseline = $NodeUI.baseline(children, true);
        const reverse = node.hasAlign($e.NODE_ALIGNMENT.RIGHT);
        const textBottom = getTextBottom(children);
        const [anchorStart, anchorEnd, chainStart, chainEnd] = getAnchorDirection(reverse);
        let bias = 0;
        switch (node.cssAscend('textAlign', true)) {
            case $const.CSS.CENTER:
                bias = 0.5;
                break;
            case $const.CSS.RIGHT:
            case $const.CSS.END:
                if (!reverse) {
                    bias = 1;
                }
                break;
        }
        sortHorizontalFloat(children);
        if (!node.hasPX($const.CSS.WIDTH) && children.some(item => item.percentWidth)) {
            node.setLayoutWidth(STRING_ANDROID.MATCH_PARENT);
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
                        item.anchor(anchorEnd, STRING_ANDROID.PARENT);
                    }
                }
                else if (item.positionAuto) {
                    item.anchor(chainStart, previous.documentId);
                }
            }
            else {
                item.anchor(anchorStart, STRING_ANDROID.PARENT);
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
                                    item.anchor($const.CSS.TOP, textBaseline.documentId);
                                }
                                else {
                                    alignTop = true;
                                }
                                break;
                            case 'middle':
                                if (baseline && !baseline.textElement || textBottom) {
                                    alignTop = true;
                                }
                                else {
                                    item.anchorParent(STRING_ANDROID.VERTICAL);
                                }
                                break;
                            case 'text-bottom':
                                if (textBaseline && item !== textBaseline) {
                                    if (item !== textBottom) {
                                        item.anchor($const.CSS.BOTTOM, textBaseline.documentId);
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
                                    item.anchor($const.CSS.BOTTOM, STRING_ANDROID.PARENT);
                                }
                                break;
                            case 'baseline':
                                if (baseline === null || item.blockVertical || !item.textElement && getMaxHeight(item) > getMaxHeight(baseline)) {
                                    alignTop = true;
                                }
                                else {
                                    item.anchor('baseline', baseline.documentId);
                                }
                                break;
                            default:
                                alignTop = true;
                                break;
                        }
                        if (alignTop) {
                            item.anchorParent(STRING_ANDROID.VERTICAL, 'packed');
                            item.modifyBox($e.BOX_STANDARD.MARGIN_TOP, item.linear.top - node.box.top);
                            item.baselineAltered = true;
                        }
                    }
                    else if (item.plainText && baseline) {
                        item.anchor('baseline', baseline.documentId);
                    }
                    else {
                        item.anchorParent(STRING_ANDROID.VERTICAL, 'packed');
                    }
                    item.anchored = true;
                }
                else {
                    baseline.baselineActive = true;
                }
                Controller.setConstraintDimension(item);
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
                        baseline.anchor($const.CSS.BOTTOM, tallest.documentId);
                        break;
                    case 'sub':
                        if (!tallest.textElement) {
                            baseline.anchor($const.CSS.BOTTOM, tallest.documentId);
                            baseline.modifyBox($e.BOX_STANDARD.MARGIN_BOTTOM, Math.ceil(baseline.fontSize * this.localSettings.deviations.subscriptBottomOffset) * -1);
                        }
                        break;
                    case 'super':
                        if (!tallest.textElement) {
                            baseline.anchor($const.CSS.BOTTOM, tallest.documentId);
                            baseline.modifyBox($e.BOX_STANDARD.MARGIN_TOP, Math.ceil(baseline.fontSize * this.localSettings.deviations.superscriptTopOffset) * -1);
                        }
                        break;
                }
            }
            else {
                baseline.anchorParent(STRING_ANDROID.VERTICAL, 'packed');
                baseline.modifyBox($e.BOX_STANDARD.MARGIN_TOP, Math.floor(baseline.linear.top - node.box.top));
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
        const columnWidth = node.parseUnit(node.css('columnWidth'), $const.CSS.WIDTH);
        const columnCount = node.toInt('columnCount');
        let columnSized = 0;
        if (columnWidth > 0) {
            let boxWidth: number;
            if ($client.isUserAgent($client.USER_AGENT.SAFARI)) {
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
        function setColumnHorizontal(seg: T[]) {
            const lengthA = seg.length;
            for (let i = 0; i < lengthA; i++) {
                const item = seg[i];
                if (i > 0) {
                    item.anchor($c.STRING_BASE.LEFT_RIGHT, seg[i - 1].documentId);
                }
                if (i < lengthA - 1) {
                    item.anchor($c.STRING_BASE.RIGHT_LEFT, seg[i + 1].documentId);
                }
                item.anchored = true;
            }
            const rowStart = seg[0];
            const rowEnd = seg[lengthA - 1];
            rowStart.anchor($const.CSS.LEFT, STRING_ANDROID.PARENT);
            rowEnd.anchor($const.CSS.RIGHT, STRING_ANDROID.PARENT);
            rowStart.anchorStyle(STRING_ANDROID.HORIZONTAL, 'spread_inside');
        }
        function setColumnVertical(partition: T[][], lastRow: boolean) {
            const rowStart = partition[0][0];
            const lengthA = partition.length;
            for (let i = 0; i < lengthA; i++) {
                const seg = partition[i];
                const lengthB = seg.length;
                for (let j = 0; j < lengthB; j++) {
                    const item = seg[j];
                    if (j === 0) {
                        if (i === 0) {
                            if (previousRow) {
                                previousRow.anchor($c.STRING_BASE.BOTTOM_TOP, item.documentId);
                                item.anchor($c.STRING_BASE.TOP_BOTTOM, typeof previousRow === 'string' ? previousRow : previousRow.documentId);
                            }
                            else {
                                item.anchor($const.CSS.TOP, STRING_ANDROID.PARENT);
                                item.anchorStyle(STRING_ANDROID.VERTICAL);
                            }
                        }
                        else {
                            item.anchor($const.CSS.TOP, rowStart.documentId);
                            item.anchorStyle(STRING_ANDROID.VERTICAL);
                            item.modifyBox($e.BOX_STANDARD.MARGIN_TOP);
                        }
                    }
                    else {
                        seg[j - 1].anchor($c.STRING_BASE.BOTTOM_TOP, item.documentId);
                        item.anchor($c.STRING_BASE.TOP_BOTTOM, seg[j - 1].documentId);
                    }
                    if (j > 0) {
                        item.anchor($const.CSS.LEFT, seg[0].documentId);
                    }
                    if (j === lengthB - 1) {
                        if (lastRow) {
                            item.anchor($const.CSS.BOTTOM, STRING_ANDROID.PARENT);
                        }
                        else if (i > 0 && !item.multiline) {
                            const adjacent = partition[i - 1][j];
                            if (adjacent && !adjacent.multiline && $util.withinRange(item.bounds.top, adjacent.bounds.top)) {
                                item.anchor($const.CSS.TOP, adjacent.documentId);
                                item.modifyBox($e.BOX_STANDARD.MARGIN_TOP, -adjacent.marginTop);
                            }
                        }
                        item.modifyBox($e.BOX_STANDARD.MARGIN_BOTTOM);
                    }
                    item.anchored = true;
                    item.positioned = true;
                }
            }
        }
        const length = rows.length;
        for (let i = 0; i < length; i++) {
            const row = rows[i];
            const rowStart = row[0];
            if (row.length === 1) {
                if (i === 0) {
                    rowStart.anchor($const.CSS.TOP, STRING_ANDROID.PARENT);
                    rowStart.anchorStyle(STRING_ANDROID.VERTICAL);
                }
                else if (previousRow) {
                    previousRow.anchor($c.STRING_BASE.BOTTOM_TOP, rowStart.documentId);
                    rowStart.anchor($c.STRING_BASE.TOP_BOTTOM, typeof previousRow === 'string' ? previousRow : previousRow.documentId);
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
                    rowStart.anchor($const.CSS.BOTTOM, STRING_ANDROID.PARENT);
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
                            if (columns[k] === undefined) {
                                columns[k] = [];
                            }
                            l = 0;
                        }
                        columns[k].push(column);
                        if (column.length) {
                            totalGap += $math.maxArray($util.objectMap<T, number>(column.children as T[], child => child.marginLeft + child.marginRight));
                        }
                        if (j > 0 && /H\d/.test(column.tagName)) {
                            if (columns[k].length === 1 && j === row.length - 2) {
                                columnMin--;
                                excessCount = 0;
                            }
                            else if ((l + 1) % perRowCount === 0 && row.length - j > columnMin && !row[j + 1].multiline && row[j + 1].bounds.height < maxHeight) {
                                columns[k].push(row[++j]);
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
                        item.setLayoutWidth($const.CSS.PX_0);
                        item.app('layout_constraintWidth_percent', $math.truncate((1 / columnMin) - percentGap, this.localSettings.precision.standardFloat));
                    }
                    horizontal.push(data[0]);
                }
                const columnHeight: number[] = new Array(lengthB).fill(0);
                const barrier: T[] = [];
                for (let j = 0; j < lengthB; j++) {
                    const item = columns[j];
                    if (j < lengthB - 1 && item.length > 1) {
                        const columnEnd = item[item.length - 1];
                        if (/H\d/.test(columnEnd.tagName)) {
                            item.pop();
                            horizontal[j + 1] = columnEnd;
                            columns[j + 1].unshift(columnEnd);
                        }
                    }
                    const elements: Element[] = [];
                    for (let k = 0; k < item.length; k++) {
                        const column = item[k];
                        if (column.naturalChild) {
                            elements.push(<Element> (<Element> column.element).cloneNode(true));
                        }
                        else {
                            columnHeight[j] += column.linear.height;
                        }
                    }
                    if (elements.length) {
                        const container = $dom.createElement(document.body, 'div', {
                            width: $css.formatPX(columnWidth || node.box.width / columnMin),
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
                    horizontal[j].modifyBox($e.BOX_STANDARD.MARGIN_LEFT, columnGap);
                }
                setColumnHorizontal(horizontal);
                setColumnVertical(columns, i === length - 1);
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
        const actualParent = children[0].actualParent || node;
        const horizontal = $NodeUI.partitionRows(children);
        const floating = node.hasAlign($e.NODE_ALIGNMENT.FLOAT);
        const length = horizontal.length;
        if (length > 1) {
            node.horizontalRows = horizontal;
        }
        if (!node.hasWidth && children.some(item => item.percentWidth)) {
            node.setLayoutWidth(STRING_ANDROID.MATCH_PARENT);
        }
        let previousSiblings: T[] = [];
        let bottomFloating = false;
        for (let i = 0; i < length; i++) {
            const partition = horizontal[i];
            const previousRow = horizontal[i - 1];
            const [floatingRight, floatingLeft] = $util.partitionArray(partition, item => item.float === $const.CSS.RIGHT || item.autoMargin.left === true);
            let aboveRowEnd: T | undefined;
            let currentRowBottom: T | undefined;
            [floatingLeft, floatingRight].forEach(seg => {
                const lengthA = seg.length;
                if (lengthA === 0) {
                    return;
                }
                const reverse = seg === floatingRight;
                const [anchorStart, anchorEnd, chainStart, chainEnd] = getAnchorDirection(reverse);
                const rowStart = seg[0];
                const rowEnd = seg[lengthA - 1];
                rowStart.anchor(anchorStart, STRING_ANDROID.PARENT);
                if (!floating && actualParent.css('textAlign') === $const.CSS.CENTER) {
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
                    rowEnd.anchor(anchorEnd, STRING_ANDROID.PARENT);
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
                            chain.anchor($const.CSS.TOP, STRING_ANDROID.PARENT);
                        }
                    }
                    else if (!bottomFloating && i === length - 1) {
                        chain.anchor($const.CSS.BOTTOM, STRING_ANDROID.PARENT);
                    }
                    if (chain.autoMargin.leftRight) {
                        chain.anchorParent(STRING_ANDROID.HORIZONTAL);
                    }
                    else {
                        if (previous) {
                            chain.anchor(chainStart, previous.documentId);
                        }
                        if (next) {
                            chain.anchor(chainEnd, next.documentId);
                        }
                    }
                    Controller.setConstraintDimension(chain);
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
                                        if (reverse && Math.ceil(aboveBefore.linear[anchorEnd]) - Math.floor(actualParent.box[anchorEnd]) < chain.linear.width) {
                                            continue;
                                        }
                                        const adjacent = previousSiblings[k + 1];
                                        chain.anchor(anchorStart, adjacent.documentId, true);
                                        if (reverse) {
                                            chain.modifyBox($e.BOX_STANDARD.MARGIN_RIGHT, -adjacent.marginRight, false);
                                        }
                                        else {
                                            chain.modifyBox($e.BOX_STANDARD.MARGIN_LEFT, -adjacent.marginLeft, false);
                                        }
                                        rowStart.anchorDelete(chainEnd);
                                        rowEnd.anchorDelete(anchorEnd);
                                        rowStart.delete(STRING_ANDROID.APP, 'layout_constraintHorizontal_chainStyle', 'layout_constraintHorizontal_bias');
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
            });
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
                        if (partition[k].linear.bottom >= currentRowBottom.linear.bottom) {
                            currentRowBottom = partition[k];
                        }
                    }
                    bottomFloating = false;
                }
                currentRowBottom.anchor($c.STRING_BASE.TOP_BOTTOM, aboveRowEnd.documentId);
                aboveRowEnd.anchor($c.STRING_BASE.BOTTOM_TOP, currentRowBottom.documentId);
                for (const chain of partition) {
                    if (chain !== currentRowBottom) {
                        chain.anchor($const.CSS.TOP, currentRowBottom.documentId);
                        if (!chain.autoMargin.topBottom) {
                            chain.anchorStyle(STRING_ANDROID.VERTICAL, 'packed', chain.autoMargin.top ? 1 : 0);
                        }
                        chain.modifyBox($e.BOX_STANDARD.MARGIN_TOP, currentRowBottom.marginTop * -1);
                    }
                }
            }
        }
    }

    private createLayoutNodeGroup(layout: $LayoutUI<T>) {
        return this.createNodeGroup(layout.node, layout.children, layout.parent);
    }

    get userSettings() {
        return <UserSettingsAndroid> this.application.userSettings;
    }

    get containerTypeHorizontal(): LayoutType {
        return {
            containerType: CONTAINER_NODE.LINEAR,
            alignmentType: $e.NODE_ALIGNMENT.HORIZONTAL,
            renderType: 0
        };
    }

    get containerTypeVertical(): LayoutType {
        return {
            containerType: CONTAINER_NODE.LINEAR,
            alignmentType: $e.NODE_ALIGNMENT.VERTICAL,
            renderType: 0
        };
    }

    get containerTypeVerticalMargin(): LayoutType {
        return {
            containerType: CONTAINER_NODE.FRAME,
            alignmentType: $e.NODE_ALIGNMENT.COLUMN,
            renderType: 0
        };
    }

    get containerTypePercent(): LayoutType {
        return {
            containerType: CONTAINER_NODE.CONSTRAINT,
            alignmentType: $e.NODE_ALIGNMENT.HORIZONTAL,
            renderType: 0
        };
    }

    get afterInsertNode() {
        return (node: View) => {
            if (!this.userSettings.exclusionsDisabled) {
                node.setExclusions();
            }
            node.localSettings = DEFAULT_VIEWSETTINGS;
        };
    }
}