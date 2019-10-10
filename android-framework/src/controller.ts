import { FileAsset, LayoutType, NodeTemplate, NodeXmlTemplate } from '../../@types/base/application';
import { ControllerSettingsAndroid } from '../../@types/android/application';
import { LocalSettings, ViewAttribute } from '../../@types/android/node';

import Resource from './resource';
import View from './view';
import ViewGroup from './viewgroup';

import { CONTAINER_ANDROID, CONTAINER_ANDROID_X, STRING_ANDROID } from './lib/constant';
import { BUILD_ANDROID, CONTAINER_NODE } from './lib/enumeration';
import { createViewAttribute, getDocumentId, getRootNs } from './lib/util';

const {
    client: $client,
    color: $color,
    css: $css,
    dom: $dom,
    math: $math,
    regex: $regex,
    session: $session,
    util: $util,
    xml: $xml
} = squared.lib;

const {
    constant: $c,
    enumeration: $e
} = squared.base.lib;

const $NodeUI = squared.base.NodeUI;

const GUIDELINE_AXIS = [STRING_ANDROID.HORIZONTAL, STRING_ANDROID.VERTICAL];
const CACHE_PATTERN: ObjectMap<RegExp> = {};
let DEFAULT_VIEWSETTINGS!: LocalSettings;

function sortHorizontalFloat(list: View[]) {
    if (list.some(node => node.floating)) {
        list.sort((a, b) => {
            if (a.floating && !b.floating) {
                return a.float === 'left' ? -1 : 1;
            }
            else if (!a.floating && b.floating) {
                return b.float === 'left' ? 1 : -1;
            }
            else if (a.floating && b.floating) {
                if (a.float !== b.float) {
                    return a.float === 'left' ? -1 : 1;
                }
                else if (a.float === 'right' && b.float === 'right') {
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
    let imageHeight = 0;
    for (const node of nodes) {
        if (node !== baseline && !node.baselineAltered) {
            let height = node.bounds.height;
            if (height > 0 || node.textElement) {
                if (node.blockVertical && baseline.blockVertical) {
                    node.anchor('bottom', baseline.documentId);
                    continue;
                }
                else if (!node.textElement && !node.inputElement) {
                    for (const image of node.renderChildren.filter(item => item.imageOrSvgElement && item.baseline)) {
                        if (image.bounds.height > height) {
                            height = image.bounds.height;
                        }
                    }
                    if (height > baseline.bounds.height) {
                        if (imageBaseline === undefined || height >= imageHeight) {
                            if (imageBaseline) {
                                imageBaseline.anchor(node.imageOrSvgElement ? 'baseline' : 'bottom', node.documentId);
                            }
                            imageBaseline = node;
                            imageHeight = height;
                        }
                        else {
                            node.anchor(imageBaseline.imageOrSvgElement ? 'baseline' : 'bottom', imageBaseline.documentId);
                        }
                        continue;
                    }
                    else if ($util.withinRange(node.linear.top, node.documentParent.box.top)) {
                        node.anchor('top', 'true');
                        continue;
                    }
                }
                if (node.naturalChild && node.length === 0 || isLayoutBaselineAligned(node)) {
                    node.anchor('baseline', baseline.documentId);
                }
            }
            else if (node.imageOrSvgElement && node.baseline) {
                imageBaseline = node;
            }
        }
    }
    if (imageBaseline) {
        baseline.anchor(imageBaseline.imageOrSvgElement ? 'baseline' : 'bottom', imageBaseline.documentId);
    }
}

function isLayoutBaselineAligned(node: View) {
    if (node.layoutHorizontal) {
        const children = node.renderChildren;
        return children.length && children.every(item => item.baseline && !item.baselineAltered && (!item.positionRelative || item.positionRelative && item.top === 0 && item.bottom === 0));
    }
    else if (node.layoutVertical) {
        const children = node.renderChildren;
        const firstChild = children[0];
        return firstChild && firstChild.baseline && (children.length === 1 || firstChild.textElement);
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
    if (previous.float === 'left') {
        if (previous.marginRight < 0) {
            const right = Math.abs(previous.marginRight);
            node.modifyBox($e.BOX_STANDARD.MARGIN_LEFT, previous.actualWidth + (previous.hasWidth ? previous.paddingLeft + previous.borderLeftWidth : 0) - right);
            node.anchor('left', previous.documentId);
            previous.modifyBox($e.BOX_STANDARD.MARGIN_RIGHT);
            return true;
        }
    }
    else if (node.float === 'right' && previous.float === 'right') {
        if (previous.marginLeft < 0) {
            const left = Math.abs(previous.marginLeft);
            const width = previous.actualWidth;
            if (left < width) {
                node.modifyBox($e.BOX_STANDARD.MARGIN_RIGHT, width - left);
            }
            node.anchor('right', previous.documentId);
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
                if ($css.isLength(minWH, true) && minWH !== '0px') {
                    let valid = false;
                    if (horizontal) {
                        if (node.ascend(item => item.hasPX('width') || item.blockStatic).length) {
                            node.setLayoutWidth('0px', false);
                            valid = node.flexibleWidth;
                            setAlignmentBlock();
                        }
                    }
                    else if ((node.absoluteParent || documentParent).hasHeight && !node.hasPX('height')) {
                        node.setLayoutHeight('0px', false);
                        valid = node.flexibleHeight;
                    }
                    if (valid) {
                        node.app(horizontal ? 'layout_constraintWidth_min' : 'layout_constraintHeight_min', $css.formatPX(node.parseUnit(minWH, dimension.toLowerCase())));
                        node.css(horizontal ? 'minWidth' : 'minHeight', 'auto');
                    }
                }
            }
            const maxWH = node.cssInitial(horizontal ? 'maxWidth' : 'maxHeight', true);
            let contentBox = 0;
            if ($css.isLength(maxWH, true)) {
                let valid = false;
                if (horizontal) {
                    if (node.outerWrapper || node.ascend(item => item.hasPX('width') || item.blockStatic).length) {
                        node.setLayoutWidth(renderParent.flexibleWidth ? 'match_parent' : '0px', node.innerWrapped && node.innerWrapped.naturalChild);
                        valid = node.flexibleWidth;
                        setAlignmentBlock();
                        if (valid && !$css.isPercent(maxWH)) {
                            contentBox += node.contentBoxWidth;
                        }
                    }
                }
                else if ((node.absoluteParent || documentParent).hasHeight && !node.hasPX('height')) {
                    node.setLayoutHeight(renderParent.flexibleHeight ? 'match_parent' : '0px', node.innerWrapped && node.innerWrapped.naturalChild);
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
    else if ($css.isPercent(value) && value !== '100%') {
        const percent = parseFloat(value) / 100;
        node.app(horizontal ? 'layout_constraintWidth_percent' : 'layout_constraintHeight_percent', $math.truncate(percent, node.localSettings.floatPrecision));
        unit = '0px';
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
    if (!opposing && !node.documentParent.layoutElement && node.documentParent.hasPX('width', false)) {
        const value = node.cssInitial('width', true);
        if ($css.isPercent(value) && value !== '100%') {
            node.setLayoutWidth($css.formatPX(node.bounds.width));
        }
    }
    else {
        constraintPercentValue(node, 'width', true, opposing);
    }
}

function constraintPercentHeight(node: View, opposing: boolean) {
    if (node.documentParent.hasPX('height', false)) {
        if (!opposing && !node.documentParent.layoutElement) {
            const value = node.cssInitial('height', true);
            if ($css.isPercent(value) && value !== '100%') {
                node.setLayoutHeight($css.formatPX(node.bounds.height));
            }
        }
        else {
            constraintPercentValue(node, 'height', false, opposing);
        }
    }
    else if ($css.isLength(node.cssInitial('height'), true)) {
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

function getTextBottom<T extends View>(nodes: T[]): T[] {
    return $util.filterArray(nodes, node => (node.baseline || $css.isLength(node.verticalAlign, true)) && (node.tagName === 'TEXTAREA' || node.tagName === 'SELECT' && (<HTMLSelectElement> node.element).size > 1) || node.verticalAlign === 'text-bottom' && node.containerName !== 'INPUT_IMAGE').sort((a, b) => {
        if (a.baselineHeight === b.baselineHeight) {
            return a.tagName === 'SELECT' ? 1 : 0;
        }
        return a.baselineHeight > b.baselineHeight ? -1 : 1;
    });
}

function getAnchorDirection(reverse: boolean) {
    if (reverse) {
        return ['right', 'left', $c.STRING_BASE.RIGHT_LEFT, $c.STRING_BASE.LEFT_RIGHT];
    }
    else {
        return ['left', 'right', $c.STRING_BASE.LEFT_RIGHT, $c.STRING_BASE.RIGHT_LEFT];
    }
}

function causesLineBreak(element: Element, sessionId: string) {
    if (element.tagName === 'BR') {
        return true;
    }
    else {
        const node = $session.getElementAsNode<View>(element, sessionId);
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
            item.anchor($c.STRING_BASE.LEFT_RIGHT, seg[i - 1].documentId);
        }
        if (i < length - 1) {
            item.anchor($c.STRING_BASE.RIGHT_LEFT, seg[i + 1].documentId);
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
                        previousRow.anchor($c.STRING_BASE.BOTTOM_TOP, item.documentId);
                        item.anchor($c.STRING_BASE.TOP_BOTTOM, typeof previousRow === 'string' ? previousRow : previousRow.documentId);
                    }
                    else {
                        item.anchor('top', 'parent');
                        item.anchorStyle(STRING_ANDROID.VERTICAL);
                    }
                }
                else {
                    item.anchor('top', rowStart.documentId);
                    item.anchorStyle(STRING_ANDROID.VERTICAL);
                    item.modifyBox($e.BOX_STANDARD.MARGIN_TOP);
                }
            }
            else {
                seg[j - 1].anchor($c.STRING_BASE.BOTTOM_TOP, item.documentId);
                item.anchor($c.STRING_BASE.TOP_BOTTOM, seg[j - 1].documentId);
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
                    if (adjacent && !adjacent.multiline && $util.withinRange(item.bounds.top, adjacent.bounds.top)) {
                        item.anchor('top', adjacent.documentId);
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

const isMultiline = (node: View) => node.plainText && Resource.hasLineBreak(node, false, true) || node.preserveWhiteSpace && $regex.CHAR.LEADINGNEWLINE.test(node.textContent);

const getRelativeVertical = (layout: squared.base.LayoutUI<View>) => layout.some(item => item.positionRelative || !item.pageFlow && item.positionAuto) ? CONTAINER_NODE.RELATIVE : CONTAINER_NODE.LINEAR;

const getMaxHeight = (node: View) => Math.max(node.actualHeight, node.lineHeight);

export default class Controller<T extends View> extends squared.base.ControllerUI<T> implements android.base.Controller<T> {
    public static setConstraintDimension<T extends View>(node: T) {
        constraintPercentWidth(node, false);
        constraintPercentHeight(node, false);
        constraintMinMax(node, 'Width', true);
        constraintMinMax(node, 'Height', false);
    }

    public static setFlexDimension<T extends View>(node: T, dimension: string) {
        const horizontal = dimension === 'width';
        const flexbox = node.flexbox;
        const basis = flexbox.basis;
        function setFlexGrow(value: string, grow: number) {
            node.android(horizontal ? 'layout_width' : 'layout_height', '0px');
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
            setFlexGrow(node.convertPX(basis), flexbox.grow);
        }
        else if (basis !== '0%' && $css.isPercent(basis)) {
            node.app(horizontal ? 'layout_constraintWidth_percent' : 'layout_constraintHeight_percent', (parseFloat(basis) / 100).toPrecision(node.localSettings.floatPrecision));
            setFlexGrow('', flexbox.grow);
        }
        else if (flexbox.grow > 0 && (horizontal && node.documentParent.css('flexDirection') === 'column' || !horizontal && node.documentParent.css('flexDirection') === 'row')) {
            setFlexGrow(node.hasPX(dimension, false) ? $css.formatPX(node[horizontal ? 'actualWidth' : 'actualHeight']) : '', flexbox.grow);
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
            inputBackgroundColor: $client.isPlatform($client.PLATFORM.MAC) ? 'rgb(255, 255, 255)' : 'rgb(221, 221, 221)',
            meterForegroundColor: 'rgb(99, 206, 68)',
            meterBackgroundColor: 'rgb(237, 237, 237)',
            progressForegroundColor: 'rgb(153, 153, 158)',
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
            standardFloat: 4
        },
        deviations: {
            textMarginBoundarySize: 8,
            subscriptBottomOffset: 0.25,
            superscriptTopOffset: 0.25,
            legendBottomOffset: 0.25
        }
    };

    constructor(
        public application: android.base.Application<T>,
        public cache: squared.base.NodeList<T>)
    {
        super();
    }

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
        const insertSpaces = this.userSettings.insertSpaces;
        for (const layout of layouts) {
            layout.content = $xml.replaceTab(layout.content.replace(/{#0}/, getRootNs(layout.content)), insertSpaces);
        }
    }

    public processUnknownParent(layout: squared.base.LayoutUI<T>) {
        const node = layout.node;
        if (node.has('columnCount') || node.hasPX('columnWidth')) {
            layout.setContainerType(CONTAINER_NODE.CONSTRAINT, $e.NODE_ALIGNMENT.COLUMN | $e.NODE_ALIGNMENT.AUTO_LAYOUT);
        }
        else if (layout.some(item => !item.pageFlow && !item.positionAuto)) {
            layout.setContainerType(CONTAINER_NODE.CONSTRAINT, $e.NODE_ALIGNMENT.ABSOLUTE | $e.NODE_ALIGNMENT.UNKNOWN);
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
                    layout.setContainerType(CONTAINER_NODE.LINEAR, $e.NODE_ALIGNMENT.HORIZONTAL | $e.NODE_ALIGNMENT.SINGLE);
                }
                else {
                    if (child.percentWidth) {
                        if (!node.hasPX('width')) {
                            node.setLayoutWidth('match_parent');
                        }
                        layout.setContainerType(CONTAINER_NODE.CONSTRAINT, $e.NODE_ALIGNMENT.SINGLE | $e.NODE_ALIGNMENT.BLOCK);
                    }
                    else if (child.baseline && (child.textElement || child.inputElement)) {
                        layout.setContainerType(CONTAINER_NODE.LINEAR, $e.NODE_ALIGNMENT.VERTICAL);
                    }
                    else {
                        layout.setContainerType(CONTAINER_NODE.FRAME, $e.NODE_ALIGNMENT.SINGLE);
                    }
                }
            }
            else {
                return this.processUnknownChild(layout);
            }
        }
        else if (Resource.hasLineBreak(node, true)) {
            layout.setContainerType(layout.some(item => item.positionRelative) ? CONTAINER_NODE.RELATIVE : CONTAINER_NODE.LINEAR, $e.NODE_ALIGNMENT.VERTICAL | $e.NODE_ALIGNMENT.UNKNOWN);
        }
        else if (this.checkConstraintFloat(layout)) {
            layout.setContainerType(CONTAINER_NODE.CONSTRAINT, $e.NODE_ALIGNMENT.FLOAT);
        }
        else if (layout.linearX) {
            if (this.checkFrameHorizontal(layout)) {
                layout.renderType |= $e.NODE_ALIGNMENT.FLOAT | $e.NODE_ALIGNMENT.HORIZONTAL;
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
            layout.add($e.NODE_ALIGNMENT.HORIZONTAL);
        }
        else if (layout.linearY) {
            layout.setContainerType(getRelativeVertical(layout), $e.NODE_ALIGNMENT.VERTICAL | ( node.documentRoot ? $e.NODE_ALIGNMENT.UNKNOWN : 0));
        }
        else if (layout.every(item => item.inlineFlow)) {
            if (this.checkFrameHorizontal(layout)) {
                layout.renderType |= $e.NODE_ALIGNMENT.FLOAT | $e.NODE_ALIGNMENT.HORIZONTAL;
            }
            else {
                layout.setContainerType(getRelativeVertical(layout), $e.NODE_ALIGNMENT.VERTICAL | $e.NODE_ALIGNMENT.UNKNOWN);
            }
        }
        else if (layout.some(item => item.alignedVertically(item.childIndex > 0 ? layout.children.slice(0, item.childIndex) : undefined, layout.cleared) > 0)) {
            layout.setContainerType(getRelativeVertical(layout), $e.NODE_ALIGNMENT.VERTICAL | $e.NODE_ALIGNMENT.UNKNOWN);
        }
        else {
            layout.setContainerType(CONTAINER_NODE.CONSTRAINT, $e.NODE_ALIGNMENT.UNKNOWN);
        }
        return { layout };
    }

    public processUnknownChild(layout: squared.base.LayoutUI<T>) {
        const node = layout.node;
        const style = node.visibleStyle;
        if (node.inlineText && (!node.textEmpty || style.borderWidth)) {
            layout.setContainerType(CONTAINER_NODE.TEXT);
        }
        else if (node.blockStatic && (style.borderWidth || style.backgroundImage || node.paddingTop + node.paddingBottom > 0) && node.naturalElements.length === 0) {
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
            !style.background &&
            !node.dataset.use)
        {
            node.hide();
            return { layout, next: true };
        }
        else if (style.background) {
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
            layout.setContainerType(CONTAINER_NODE.CONSTRAINT, $e.NODE_ALIGNMENT.FLOAT);
        }
        else if (this.checkFrameHorizontal(layout)) {
            layout.node = this.createNodeGroup(layout.node, layout.children, parent);
            layout.renderType |= $e.NODE_ALIGNMENT.FLOAT | $e.NODE_ALIGNMENT.HORIZONTAL;
        }
        else if (layout.length !== siblings.length || parent.hasAlign($e.NODE_ALIGNMENT.VERTICAL)) {
            layout.node = this.createNodeGroup(layout.node, layout.children, parent);
            this.processLayoutHorizontal(layout);
        }
        else {
            parent.addAlign($e.NODE_ALIGNMENT.HORIZONTAL);
        }
        return layout;
    }

    public processTraverseVertical(layout: squared.base.LayoutUI<T>) {
        const { floated, cleared } = layout;
        if (layout.some((item, index) => item.lineBreakTrailing && index < layout.length - 1)) {
            if (!layout.parent.hasAlign($e.NODE_ALIGNMENT.VERTICAL)) {
                layout.node = this.createLayoutNodeGroup(layout);
                layout.setContainerType(getRelativeVertical(layout), $e.NODE_ALIGNMENT.VERTICAL | $e.NODE_ALIGNMENT.UNKNOWN);
            }
        }
        else if (floated.size === 1 && layout.every((item, index) => index === 0 || index === layout.length - 1 || cleared.has(item))) {
            layout.node = this.createLayoutNodeGroup(layout);
            if (layout.same(node => node.float)) {
                layout.setContainerType(CONTAINER_NODE.CONSTRAINT, $e.NODE_ALIGNMENT.FLOAT);
            }
            else if (cleared.size) {
                layout.renderType |= $e.NODE_ALIGNMENT.FLOAT | $e.NODE_ALIGNMENT.HORIZONTAL;
            }
            else {
                layout.setContainerType(layout.some(item => item.positionRelative) ? CONTAINER_NODE.RELATIVE : CONTAINER_NODE.LINEAR, $e.NODE_ALIGNMENT.VERTICAL);
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
            layout.setContainerType(layout.some(item => item.positionRelative) ? CONTAINER_NODE.RELATIVE : CONTAINER_NODE.LINEAR, $e.NODE_ALIGNMENT.VERTICAL);
        }
        return layout;
    }

    public processLayoutHorizontal(layout: squared.base.LayoutUI<T>) {
        if (this.checkConstraintFloat(layout, true)) {
            layout.setContainerType(CONTAINER_NODE.CONSTRAINT, $e.NODE_ALIGNMENT.FLOAT);
        }
        else if (this.checkConstraintHorizontal(layout)) {
            layout.setContainerType(CONTAINER_NODE.CONSTRAINT, $e.NODE_ALIGNMENT.HORIZONTAL);
        }
        else if (this.checkLinearHorizontal(layout)) {
            layout.setContainerType(CONTAINER_NODE.LINEAR, $e.NODE_ALIGNMENT.HORIZONTAL);
            if (layout.floated.size) {
                sortHorizontalFloat(layout.children);
            }
        }
        else {
            layout.setContainerType(CONTAINER_NODE.RELATIVE, $e.NODE_ALIGNMENT.HORIZONTAL);
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

    public checkFrameHorizontal(layout: squared.base.LayoutUI<T>) {
        const floated = layout.floated;
        if (floated.size === 2) {
            return true;
        }
        else {
            if ((floated.has('right') || floated.size === 1 && layout.node.cssAscend('textAlign', true) === 'center') && layout.some(node => node.pageFlow)) {
                return true;
            }
            else if (floated.has('left') && !layout.linearX) {
                const node = layout.item(0) as T;
                return node.pageFlow && node.floating;
            }
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
            const { fontSize, lineHeight } = layout.children[0];
            for (const node of layout) {
                if (!(node.naturalChild && node.length === 0 && !node.inputElement && !node.positionRelative && !node.blockVertical && !node.positionAuto && (lineHeight === 0 || node.lineHeight === lineHeight && node.fontSize === fontSize) && node.tagName !== 'WBR' && (node.baseline || node.cssAny('verticalAlign', 'top', 'middle', 'bottom')))) {
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
            else if (node.layoutConstraint && node.hasProcedure($e.NODE_PROCEDURE.CONSTRAINT)) {
                const children = node.renderFilter((item: T) => !item.positioned) as T[];
                if (children.length) {
                    const [pageFlow, absolute] = $util.partitionArray(children, item => item.pageFlow || item.positionAuto);
                    if (absolute.length) {
                        for (const item of absolute) {
                            if (item.leftTopAxis) {
                                const autoMargin = item.autoMargin;
                                if (item.hasWidth && autoMargin.horizontal) {
                                    if (item.hasPX('left') && autoMargin.right) {
                                        item.anchor('left', 'parent');
                                        item.modifyBox($e.BOX_STANDARD.MARGIN_LEFT, item.left);
                                    }
                                    else if (item.hasPX('right') && autoMargin.left) {
                                        item.anchor('right', 'parent');
                                        item.modifyBox($e.BOX_STANDARD.MARGIN_RIGHT, item.right);
                                    }
                                    else {
                                        item.anchorParent(STRING_ANDROID.HORIZONTAL);
                                        item.modifyBox($e.BOX_STANDARD.MARGIN_LEFT, item.left);
                                        item.modifyBox($e.BOX_STANDARD.MARGIN_RIGHT, item.right);
                                    }
                                }
                                else {
                                    if (item.hasPX('left')) {
                                        item.anchor('left', 'parent');
                                        if (!item.hasPX('right') && item.css('width') === '100%') {
                                            item.anchor('right', 'parent');
                                        }
                                        item.modifyBox($e.BOX_STANDARD.MARGIN_LEFT, adjustAbsolutePaddingOffset(node, $e.BOX_STANDARD.PADDING_LEFT, item.left));
                                    }
                                    if (item.hasPX('right') && (!item.hasPX('width') || item.css('width') === '100%' || !item.hasPX('left'))) {
                                        item.anchor('right', 'parent');
                                        item.modifyBox($e.BOX_STANDARD.MARGIN_RIGHT, adjustAbsolutePaddingOffset(node, $e.BOX_STANDARD.PADDING_RIGHT, item.right));
                                    }
                                }
                                if (item.hasHeight && autoMargin.vertical) {
                                    if (item.hasPX('top') && autoMargin.bottom) {
                                        item.anchor('top', 'parent');
                                        item.modifyBox($e.BOX_STANDARD.MARGIN_TOP, item.top);
                                    }
                                    else if (item.hasPX('bottom') && autoMargin.top) {
                                        item.anchor('bottom', 'parent');
                                        item.modifyBox($e.BOX_STANDARD.MARGIN_BOTTOM, item.bottom);
                                    }
                                    else {
                                        item.anchorParent(STRING_ANDROID.VERTICAL);
                                        item.modifyBox($e.BOX_STANDARD.MARGIN_TOP, item.top);
                                        item.modifyBox($e.BOX_STANDARD.MARGIN_BOTTOM, item.bottom);
                                    }
                                }
                                else {
                                    if (item.hasPX('top')) {
                                        item.anchor('top', 'parent');
                                        if (!item.hasPX('bottom') && item.css('height') === '100%') {
                                            item.anchor('bottom', 'parent');
                                        }
                                        item.modifyBox($e.BOX_STANDARD.MARGIN_TOP, adjustAbsolutePaddingOffset(node, $e.BOX_STANDARD.PADDING_TOP, item.top));
                                    }
                                    if (item.hasPX('bottom') && (!item.hasPX('height') || item.css('height') === '100%' || !item.hasPX('top'))) {
                                        item.anchor('bottom', 'parent');
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

    public renderNodeGroup(layout: squared.base.LayoutUI<T>) {
        const { node, containerType, alignmentType } = layout;
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
            const dataset = node.dataset;
            node.setControlType(View.getControlName(containerType, node.localSettings.targetAPI), containerType);
            node.addAlign(alignmentType);
            node.render(!dataset.use && dataset.target ? (<squared.base.ApplicationUI<T>> this.application).resolveTarget(dataset.target) : layout.parent);
            node.apply(options);
            return <NodeXmlTemplate<T>> {
                type: $e.NODE_TEMPLATE.XML,
                node,
                controlName: node.controlName
            };
        }
        return undefined;
    }

    public renderNode(layout: squared.base.LayoutUI<T>) {
        const node = layout.node;
        let controlName = View.getControlName(layout.containerType, node.localSettings.targetAPI);
        node.setControlType(controlName, layout.containerType);
        node.addAlign(layout.alignmentType);
        let parent = layout.parent;
        let target = !node.dataset.use ? node.dataset.target : undefined;
        switch (node.tagName) {
            case 'IMG': {
                const element = <HTMLImageElement> node.element;
                const absoluteParent = node.absoluteParent || node.documentParent;
                let width = node.toFloat('width');
                let height = node.toFloat('height');
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
                                node.css('width', $css.formatPX(width), true);
                                const image = this.application.resourceHandler.getImage(element.src);
                                if (image && image.width > 0 && image.height > 0) {
                                    height = image.height * (width / image.width);
                                    node.css('height', $css.formatPX(height), true);
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
                        node.android('src', '@drawable/' + src);
                    }
                }
                if (percentWidth !== -1 || percentHeight !== -1) {
                    if (percentWidth >= 0) {
                        width *= absoluteParent.box.width / 100;
                        if (percentWidth < 100 && !parent.layoutConstraint) {
                            node.css('width', $css.formatPX(width));
                            node.android('adjustViewBounds', 'true');
                        }
                    }
                    if (percentHeight >= 0) {
                        height *= absoluteParent.box.height / 100;
                        if (percentHeight < 100 && !(parent.layoutConstraint && absoluteParent.hasHeight)) {
                            node.css('height', $css.formatPX(height));
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
                        container.setLayoutWidth(width < absoluteParent.box.width ? $css.formatPX(width) : 'match_parent');
                    }
                    else {
                        container.setLayoutWidth('wrap_content');
                    }
                    if (height > 0) {
                        container.setLayoutHeight(height < absoluteParent.box.height ? $css.formatPX(height) : 'match_parent');
                    }
                    else {
                        container.setLayoutHeight('wrap_content');
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
                    case 'range':
                    case 'time':
                    case 'number':
                    case 'date':
                    case 'datetime-local':
                        switch (type) {
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
                        switch (type) {
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
                node.android('minLines', element.rows > 0 ? element.rows.toString() : '2');
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
                if (element.maxLength > 0) {
                    node.android('maxLength', element.maxLength.toString());
                }
                if (!node.hasPX('width') && element.cols > 0) {
                    node.css('width', $css.formatPX(element.cols * 8), true);
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
                const offset = node.actualHeight * this.localSettings.deviations.legendBottomOffset;
                node.modifyBox($e.BOX_STANDARD.MARGIN_BOTTOM, offset);
                const linear = node.unsafe('linear');
                linear.bottom += offset;
                break;
            }
            case 'METER':
            case 'PROGRESS': {
                let foregroundColor: string | undefined;
                let backgroundColor: string | undefined;
                if (node.tagName === 'METER') {
                    ({ meterForegroundColor: foregroundColor, meterBackgroundColor: backgroundColor } = this.localSettings.style);
                    const element = <HTMLMeterElement> node.element;
                    const { value, max } = element;
                    if (max) {
                        if (value) {
                            node.android('progress', Math.round((value / max) * 100).toString());
                        }
                        if (max === 100) {
                            node.android('min', element.min.toString());
                            node.android('max', max.toString());
                        }
                    }
                }
                else {
                    ({ progressForegroundColor: foregroundColor, progressBackgroundColor: backgroundColor } = this.localSettings.style);
                    const element = <HTMLProgressElement> node.element;
                    const { value, max } = element;
                    if (value) {
                        node.android('progress', value.toString());
                    }
                    if (max) {
                        node.android('max', max.toString());
                    }
                }
                if (!node.hasWidth) {
                    node.css('width', $css.formatPX(node.bounds.width), true);
                }
                if (!node.hasHeight) {
                    node.css('height', $css.formatPX(node.bounds.height), true);
                }
                node.android('progressTint', '@color/' + Resource.addColor(foregroundColor));
                node.android('progressBackgroundTint', '@color/' + Resource.addColor(backgroundColor));
                node.inlineText = false;
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
                        CACHE_PATTERN.TEXT_SHADOW = /^(rgba?\([^)]+\)|[a-z]+) (-?[\d.]+[a-z]+) (-?[\d.]+[a-z]+)\s*(-?[\d.]+[a-z]+)?.*$/;
                    }
                    const match = CACHE_PATTERN.TEXT_SHADOW.exec(node.css('textShadow'));
                    if (match) {
                        const color = Resource.addColor($color.parseColor(match[1]));
                        if (color !== '') {
                            node.android('shadowColor', '@color/' + color);
                            node.android('shadowDx', $math.truncate($css.parseUnit(match[2], node.fontSize) * 2));
                            node.android('shadowDy', $math.truncate($css.parseUnit(match[3], node.fontSize) * 2));
                            node.android('shadowRadius', match[4] ? $math.truncate(Math.max($css.parseUnit(match[4], node.fontSize), 1)) : '1');
                        }
                    }
                }
                if (node.css('whiteSpace') === 'nowrap') {
                    node.android('maxLines', '1');
                    node.android('ellipsize', 'end');
                }
                break;
            case CONTAINER_ANDROID.BUTTON:
                if (!node.hasHeight) {
                    node.android('minHeight', $css.formatPX(Math.ceil(node.actualHeight)));
                }
                node.mergeGravity('gravity', STRING_ANDROID.CENTER_VERTICAL);
                break;
            case CONTAINER_ANDROID.EDIT: {
                const element = <HTMLInputElement> node.element;
                if (element.list && element.list.children.length) {
                    controlName = CONTAINER_ANDROID.EDIT_LIST;
                    node.controlName = controlName;
                }
            }
            case CONTAINER_ANDROID.RANGE:
                if (!node.hasPX('width')) {
                    node.css('width', $css.formatPX(node.bounds.width), true);
                }
                break;
            case CONTAINER_ANDROID.LINE:
                if (!node.hasHeight) {
                    node.setLayoutHeight($css.formatPX(node.contentBoxHeight || 1));
                }
                break;
        }
        if (node.inlineVertical && (!parent.layoutHorizontal || parent.layoutLinear)) {
            switch (node.verticalAlign) {
                case 'sub':
                    node.modifyBox($e.BOX_STANDARD.MARGIN_BOTTOM, Math.ceil(node.fontSize * this.localSettings.deviations.subscriptBottomOffset) * -1);
                    break;
                case 'super':
                    node.modifyBox($e.BOX_STANDARD.MARGIN_TOP, Math.ceil(node.fontSize * this.localSettings.deviations.superscriptTopOffset) * -1);
                    break;
            }
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
            node.setLayoutWidth(width || 'wrap_content');
        }
        if (height !== '') {
            node.setLayoutHeight(height || 'wrap_content');
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
            width = '0px';
        }
        if (height && $css.isPercent(height)) {
            options.android.layout_rowWeight = $math.truncate(parseFloat(height) / 100, this.localSettings.precision.standardFloat);
            height = '0px';
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
                    LT = !opposite ? 'left' : 'right';
                    RB = !opposite ? 'right' : 'left';
                    LTRB = !opposite ? $c.STRING_BASE.LEFT_RIGHT : $c.STRING_BASE.RIGHT_LEFT;
                    RBLT = !opposite ? $c.STRING_BASE.RIGHT_LEFT : $c.STRING_BASE.LEFT_RIGHT;
                }
                else {
                    LT = !opposite ? 'top' : 'bottom';
                    RB = !opposite ? 'bottom' : 'top';
                    LTRB = !opposite ? $c.STRING_BASE.TOP_BOTTOM : $c.STRING_BASE.BOTTOM_TOP;
                    RBLT = !opposite ? $c.STRING_BASE.BOTTOM_TOP : $c.STRING_BASE.TOP_BOTTOM;
                }
                if ($util.withinRange(node.linear[LT], box[LT])) {
                    node.anchor(LT, 'parent', true);
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
                            node.anchor(horizontal ? $c.STRING_BASE.RIGHT_LEFT : 'top', previousSibling.documentId, true);
                            node.constraint[value] = previousSibling.constraint[value];
                            return;
                        }
                    }
                }
                if (percent) {
                    const position = Math.abs(bounds[LT] - box[LT]) / box[horizontal ? 'width' : 'height'];
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
                    node.anchor(LT, 'parent', true);
                    if (location < 0) {
                        const innerWrapped = node.innerWrapped;
                        if (innerWrapped && !innerWrapped.pageFlow) {
                            let boxMargin = 0;
                            switch (LT) {
                                case 'top':
                                    boxMargin = $e.BOX_STANDARD.MARGIN_TOP;
                                    break;
                                case 'left':
                                    boxMargin = $e.BOX_STANDARD.MARGIN_LEFT;
                                    break;
                                case 'bottom':
                                    boxMargin = $e.BOX_STANDARD.MARGIN_BOTTOM;
                                    break;
                                case 'right':
                                    boxMargin = $e.BOX_STANDARD.MARGIN_RIGHT;
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
                        resourceValue = '@dimen/' + Resource.insertStoredAsset('dimens', 'constraint_guideline_' + (!opposite ? LT : RB), $css.formatPX(location));
                    }
                    const options = createViewAttribute(
                        undefined,
                        { orientation: horizontal ? STRING_ANDROID.VERTICAL : STRING_ANDROID.HORIZONTAL },
                        { [beginPercent]: resourceValue }
                    );
                    this.addAfterOutsideTemplate(node.id, this.renderNodeStatic(node.localSettings.targetAPI < BUILD_ANDROID.Q ? CONTAINER_ANDROID.GUIDELINE : CONTAINER_ANDROID_X.GUIDELINE, options), false);
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
            const options = createViewAttribute(
                undefined,
                undefined,
                {
                    barrierDirection,
                    constraint_referenced_ids: $util.objectMap(unbound, item => getDocumentId(item.documentId)).join(',')
                }
            );
            const target = unbound[unbound.length - 1];
            this.addAfterOutsideTemplate(target.id, this.renderNodeStatic(target.localSettings.targetAPI < BUILD_ANDROID.Q ? CONTAINER_ANDROID.BARRIER : CONTAINER_ANDROID_X.BARRIER, options), false);
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
                while (true) {
                    const bottomTop = current.alignSibling($c.STRING_BASE.BOTTOM_TOP);
                    if (bottomTop !== '') {
                        const next = nodes.find(item => item.documentId === bottomTop);
                        if (next && next.alignSibling($c.STRING_BASE.TOP_BOTTOM) === current.documentId) {
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
        const checkLineWrap = node.css('whiteSpace') !== 'nowrap';
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
                if (renderParent) {
                    if (renderParent.overflowY) {
                        return renderParent.box.width;
                    }
                    else {
                        const parent = node.actualParent as T;
                        if (parent) {
                            if (parent === renderParent && parent.blockStatic && node.naturalElement && node.inlineStatic) {
                                const box = parent.box;
                                return box.width - (node.linear.left - box.left);
                            }
                            else if (parent.floatContainer) {
                                const { containerType, alignmentType } = this.containerTypeVerticalMargin;
                                const container = node.ascend((item: T) => item.of(containerType, alignmentType), parent, 'renderParent');
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
                }
                return node.box.width;
            })();
            const cleared = $NodeUI.linearData(children, true).cleared;
            const centerAligned = node.cssInitial('textAlign') === 'center';
            let textIndent = 0;
            if (node.naturalElement) {
                if (node.blockDimension) {
                    textIndent = node.parseUnit(node.css('textIndent'));
                }
            }
            else {
                const parent = node.parent as T;
                if (parent && parent.blockDimension && parent.children[0] === node) {
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
            $util.partitionArray(children, item => item.float !== 'right').forEach((seg, index) => {
                const length = seg.length;
                if (length === 0) {
                    return;
                }
                const leftAlign = index === 0;
                let leftForward = true;
                let alignParent: string;
                let rows: T[][];
                if (leftAlign) {
                    const parent = seg[0].actualParent;
                    if (parent && parent.cssInitialAny('textAlign', 'right', 'end')) {
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
                        alignSibling = $c.STRING_BASE.LEFT_RIGHT;
                        if (i === 0 && item.inline && Math.abs(textIndent) > item.actualWidth && item.float !== 'right' && !item.positionRelative) {
                            textIndentSpacing = true;
                            if (!item.floating) {
                                item.setCacheValue('float', 'left');
                                item.setCacheValue('floating', true);
                            }
                        }
                    }
                    else {
                        alignSibling = $c.STRING_BASE.RIGHT_LEFT;
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
                    let anchored = true;
                    if (item.autoMargin.leftRight) {
                        item.anchor('centerHorizontal', 'true');
                    }
                    else if (item.autoMargin.left) {
                        item.anchor('right', 'true');
                    }
                    else if (item.autoMargin.right) {
                        item.anchor('left', 'true');
                    }
                    else {
                        anchored = false;
                    }
                    if (previous) {
                        const items = rows[rows.length - 1];
                        let maxWidth = 0;
                        let baseWidth = 0;
                        function checkFloatWrap() {
                            if (previous.floating && previous.alignParent('left') && (multiline || Math.floor(rowWidth + item.actualWidth) < boxWidth)) {
                                return true;
                            }
                            else if (node.floating && i === length - 1 && item.textElement && !/\s|-/.test(item.textContent.trim())) {
                                if (node.hasPX('width')) {
                                    const width = node.css('width');
                                    if (node.parseUnit(width) > node.parseUnit(node.css('minWidth'))) {
                                        node.cssApply({
                                            width: 'auto',
                                            minWidth: width
                                        }, true);
                                    }
                                }
                                node.android('maxLines', '1');
                                return true;
                            }
                            return false;
                        }
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
                            return true;
                        };
                        if (adjustFloatingNegativeMargin(item, previous)) {
                            alignSibling = '';
                        }
                        const viewGroup = item.nodeGroup && !item.hasAlign($e.NODE_ALIGNMENT.SEGMENTED);
                        let retainMultiline = false;
                        siblings = item.inlineVertical && previous.inlineVertical && item.previousSibling !== previous ? $dom.getElementsBetweenSiblings(previous.element, <Element> item.element) : undefined;
                        const startNewRow = () => {
                            if (previous.textElement) {
                                if (i === 1 && item.plainText && item.previousSibling === previous && !$regex.CHAR.TRAILINGSPACE.test(previous.textContent) && !$regex.CHAR.LEADINGSPACE.test(item.textContent)) {
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
                                else {
                                    const actualParent = item.actualParent as T;
                                    if (actualParent && actualParent.tagName !== 'CODE') {
                                        return multiline && item.plainText || isMultiline(item);
                                    }
                                }
                            }
                            return false;
                        };
                        const textNewRow = item.textElement && startNewRow();
                        if (textNewRow ||
                            viewGroup ||
                            $util.aboveRange(item.linear.top, previous.linear.bottom) && (item.blockStatic || item.floating && previous.float === item.float) ||
                            !item.textElement && !checkFloatWrap() && checkWrapWidth() && Math.floor(baseWidth) > maxWidth ||
                            !item.floating && (previous.blockStatic || item.previousSiblings().some(sibling => sibling.lineBreak || sibling.excluded && sibling.blockStatic) || !!siblings && siblings.some(element => causesLineBreak(element, node.sessionId))) ||
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
                            if ($util.aboveRange(item.linear.bottom, previousRowLeft.linear.bottom)) {
                                previousRowLeft = item;
                            }
                        }
                        else {
                            previousRowLeft = item;
                        }
                    }
                    if (siblings && !siblings.some(element => !!$session.getElementAsNode(element, item.sessionId) || causesLineBreak(element, item.sessionId))) {
                        const betweenStart = $dom.getRangeClientRect(siblings[0]);
                        if (!betweenStart.numberOfLines) {
                            const betweenEnd = siblings.length > 1 ? $dom.getRangeClientRect(siblings[siblings.length - 1]) : undefined;
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
            for (let i = 0; i < length; i++) {
                const items = rows[i];
                let baseline: T | null;
                if (items.length > 1) {
                    const bottomAligned = getTextBottom(items);
                    let textBottom = bottomAligned[0] as T | undefined;
                    baseline = $NodeUI.baseline(bottomAligned.length ? items.filter(item => !bottomAligned.includes(item)) : items);
                    if (baseline && textBottom) {
                        if (baseline !== textBottom && textBottom.bounds.height > baseline.bounds.height) {
                            baseline.anchor('bottom', textBottom.documentId);
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
                                                item.anchor('top', textBaseline.documentId);
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
                                            item.anchor('top', documentId);
                                        }
                                        else if (baseline) {
                                            item.anchor('top', baseline.documentId);
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
                                                item.anchor('top', baseline.documentId);
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
                                            item.anchor('bottom', textBaseline.documentId);
                                        }
                                        else if (baseline) {
                                            item.anchor('bottom', baseline.documentId);
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
                                                    node.css('height', $css.formatPX(node.bounds.height), true);
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
                        textBottom = getTextBottom(items)[0];
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
                    if (previousBaseline === null) {
                        const previousRow = rows[i - 1];
                        previousBaseline = previousRow.find(sibling => !sibling.floating) || previousRow[0];
                        let valid = false;
                        for (const sibling of previousRow) {
                            if (sibling === previousBaseline) {
                                valid = true;
                            }
                            else if (valid && sibling.linear.bottom >= previousBaseline.linear.bottom && (!sibling.floating || previousBaseline.floating)) {
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
        const textBottom = getTextBottom(children)[0];
        const documentId = baseline ? baseline.documentId : '';
        const [anchorStart, anchorEnd, chainStart, chainEnd] = getAnchorDirection(reverse);
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
                            item.modifyBox($e.BOX_STANDARD.MARGIN_TOP, item.linear.top - node.box.top);
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
                        baseline.anchor('bottom', tallest.documentId);
                        break;
                    case 'sub':
                        if (!tallest.textElement) {
                            baseline.anchor('bottom', tallest.documentId);
                            baseline.modifyBox($e.BOX_STANDARD.MARGIN_BOTTOM, Math.ceil(baseline.fontSize * this.localSettings.deviations.subscriptBottomOffset) * -1);
                        }
                        break;
                    case 'super':
                        if (!tallest.textElement) {
                            baseline.anchor('bottom', tallest.documentId);
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
        const columnWidth = node.parseUnit(node.css('columnWidth'), 'width');
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
                        item.setLayoutWidth('0px');
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
        const horizontal = $NodeUI.partitionRows(children);
        const floating = node.hasAlign($e.NODE_ALIGNMENT.FLOAT);
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
            const [floatingRight, floatingLeft] = $util.partitionArray(partition, item => item.float === 'right' || item.autoMargin.left === true);
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
                                        if (reverse && Math.ceil(aboveBefore.linear[anchorEnd]) - Math.floor(parent.box[anchorEnd]) < chain.linear.width) {
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
                        chain.anchor('top', currentRowBottom.documentId);
                        if (!chain.autoMargin.topBottom) {
                            chain.anchorStyle(STRING_ANDROID.VERTICAL, 'packed', chain.autoMargin.top ? 1 : 0);
                        }
                        chain.modifyBox($e.BOX_STANDARD.MARGIN_TOP, currentRowBottom.marginTop * -1);
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

    get userSettings() {
        return this.application.userSettings;
    }
}