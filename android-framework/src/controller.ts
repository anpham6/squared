import { FileAsset, LayoutType, NodeTagXml, NodeTemplate, NodeXmlTemplate } from '../../src/base/@types/application';
import { ControllerSettingsAndroid, UserSettingsAndroid } from './@types/application';
import { ViewAttribute } from './@types/node';

import Resource from './resource';
import View from './view';
import ViewGroup from './viewgroup';

import { AXIS_ANDROID, CONTAINER_ANDROID } from './lib/constant';
import { BUILD_ANDROID, CONTAINER_NODE } from './lib/enumeration';
import { createViewAttribute, getRootNs, stripId } from './lib/util';

import $Layout = squared.base.Layout;
import $NodeList = squared.base.NodeList;

const $enum = squared.base.lib.enumeration;
const $color = squared.lib.color;
const $css = squared.lib.css;
const $dom = squared.lib.dom;
const $math = squared.lib.math;
const $regex = squared.lib.regex;
const $session = squared.lib.session;
const $util = squared.lib.util;
const $xml = squared.lib.xml;

const GUIDELINE_AXIS = [AXIS_ANDROID.HORIZONTAL, AXIS_ANDROID.VERTICAL];

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
            const above = (a.node.innerWrapped as View) || a.node;
            const below = (b.node.innerWrapped as View) || b.node;
            if (above.absoluteParent === below.absoluteParent) {
                if (above.zIndex === below.zIndex) {
                    return above.siblingIndex < below.siblingIndex ? -1 : 1;
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
        if (node !== baseline && !node.baselineAltered && (node.bounds.height > 0 || node.textElement)) {
            if (!node.textElement && node.bounds.height > baseline.bounds.height) {
                if ($util.withinRange(node.linear.top, node.documentParent.box.top)) {
                    node.anchor('top', 'true');
                }
                if (node.imageOrSvgElement && (imageBaseline === undefined || node.bounds.height > imageBaseline.bounds.height)) {
                    imageBaseline = node;
                }
            }
            else if (node.imageOrSvgElement && baseline.imageOrSvgElement) {
                if (node.bounds.height < baseline.bounds.height && node.baseline) {
                    node.anchor('baseline', baseline.documentId);
                }
            }
            else if (node.inputElement) {
                if (node.baseline && baseline.textElement) {
                    node.anchor('bottom', baseline.documentId);
                }
                else if (!node.baseline && node.verticalAlign !== '0px') {
                    node.anchor('baseline', baseline.documentId);
                }
            }
            else if (node.element && node.length === 0 || node.layoutHorizontal && node.renderChildren.every(item => item.baseline)) {
                node.anchor('baseline', baseline.documentId);
            }
        }
    }
    if (imageBaseline) {
        baseline.anchor('baseline', imageBaseline.documentId);
    }
}

function checkSingleLine(node: View, nowrap = false, multiline = false) {
    if (node.textElement && node.cssAscend('textAlign', true) !== 'center' && !node.has('width') && (!node.multiline || multiline) && (nowrap || node.textContent.trim().indexOf(' ') !== -1)) {
        node.android('maxLines', '1');
        node.android('ellipsize', 'end');
    }
}

function adjustAbsolutePaddingOffset(parent: View, direction: number, value: number) {
    if (value > 0) {
        if (parent.documentBody) {
            switch (direction) {
                case $enum.BOX_STANDARD.PADDING_TOP:
                    value -= parent.marginTop;
                    break;
                case $enum.BOX_STANDARD.PADDING_RIGHT:
                    value -= parent.marginRight;
                    break;
                case $enum.BOX_STANDARD.PADDING_BOTTOM:
                    value -= parent.marginBottom;
                    break;
                case $enum.BOX_STANDARD.PADDING_LEFT:
                    value -= parent.marginLeft;
                    break;
            }
        }
        if (parent.getBox(direction)[0] !== 1) {
            switch (direction) {
                case $enum.BOX_STANDARD.PADDING_TOP:
                    value += parent.borderTopWidth - parent.paddingTop;
                    break;
                case $enum.BOX_STANDARD.PADDING_RIGHT:
                    value += parent.borderRightWidth - parent.paddingRight;
                    break;
                case $enum.BOX_STANDARD.PADDING_BOTTOM:
                    value += parent.borderBottomWidth - parent.paddingBottom;
                    break;
                case $enum.BOX_STANDARD.PADDING_LEFT:
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
            node.modifyBox($enum.BOX_STANDARD.MARGIN_LEFT, previous.actualWidth + (previous.hasWidth ? previous.paddingLeft + previous.borderLeftWidth : 0) - right);
            node.anchor('left', previous.documentId);
            previous.modifyBox($enum.BOX_STANDARD.MARGIN_RIGHT);
            return true;
        }
    }
    else if (node.float === 'right' && previous.float === 'right') {
        if (previous.marginLeft < 0) {
            const left = Math.abs(previous.marginLeft);
            const width = previous.actualWidth;
            if (left < width) {
                node.modifyBox($enum.BOX_STANDARD.MARGIN_RIGHT, width - left);
            }
            node.anchor('right', previous.documentId);
            previous.modifyBox($enum.BOX_STANDARD.MARGIN_LEFT);
            return true;
        }
    }
    return false;
}

function constraintMinMax(node: View, dimension: string, horizontal: boolean) {
    const documentParent = node.documentParent;
    if (!node.inputElement && !node.imageOrSvgElement) {
        const renderParent = node.renderParent as View;
        if (renderParent) {
            function setAlignmentBlock() {
                if (renderParent.groupParent) {
                    renderParent.alignmentType |= $enum.NODE_ALIGNMENT.BLOCK;
                    renderParent.unsetCache('blockStatic');
                }
            }
            const dimensionA = $util.capitalize(dimension);
            if (!documentParent.flexElement) {
                const minWH = node.cssInitial(`min${dimensionA}`, true);
                if ($css.isLength(minWH, true) && minWH !== '0px') {
                    let valid = false;
                    if (horizontal) {
                        if (node.ascend(false, item => item.has('width') || item.blockStatic).length) {
                            node.android('layout_width', '0px', node.blockWidth);
                            valid = true;
                            setAlignmentBlock();
                        }
                    }
                    else if ((node.absoluteParent || documentParent).hasHeight && !node.has('height')) {
                        node.android('layout_height', '0px', node.blockHeight);
                        valid = true;
                    }
                    if (valid) {
                        node.app(`layout_constraint${dimensionA}_min`, $css.formatPX(node.parseUnit(minWH, horizontal)));
                        node.css(`min${dimensionA}`, 'auto');
                    }
                }
            }
            const maxWH = node.cssInitial(`max${dimensionA}`, true);
            let contentBox = 0;
            if ($css.isLength(maxWH, true)) {
                let valid = false;
                if (horizontal) {
                    if (node.outerWrapper || node.ascend(false, item => item.has('width') || item.blockStatic).length) {
                        node.android('layout_width', renderParent.flexibleWidth ? 'match_parent' : '0px');
                        valid = true;
                        if (!$css.isPercent(maxWH)) {
                            contentBox += node.contentBoxWidth;
                        }
                        setAlignmentBlock();
                    }
                }
                else if ((node.absoluteParent || documentParent).hasHeight && !node.has('height')) {
                    node.android('layout_height', renderParent.flexibleHeight ? 'match_parent' : '0px');
                    if (!$css.isPercent(maxWH)) {
                        contentBox += node.contentBoxHeight;
                    }
                    valid = true;
                }
                if (valid) {
                    node.app(`layout_constraint${dimensionA}_max`, $css.formatPX(node.parseUnit(maxWH, horizontal) + contentBox));
                }
            }
        }
    }
}

function constraintPercentValue(node: View, dimension: string, opposing: boolean) {
    const horizontal = dimension === 'width';
    const value = node.cssInitial(dimension, true);
    if (opposing) {
        if ($css.isLength(value, true)) {
            node.android(`layout_${dimension}`, $css.formatPX(node.bounds[dimension]), false);
            if (node.imageElement) {
                const element = <HTMLImageElement> node.element;
                if (element && element.naturalWidth > 0 && element.naturalHeight > 0) {
                    const opposingUnit = (node.bounds[dimension] / (horizontal ? element.naturalWidth : element.naturalHeight)) * (horizontal ? element.naturalHeight : element.naturalWidth);
                    node.android(`layout_${horizontal ? 'height' : 'width'}`, $css.formatPX(opposingUnit), false);
                }
            }
            return true;
        }
    }
    else if ($css.isPercent(value) && value !== '100%') {
        const percent = parseFloat(value) / 100;
        node.app(`layout_constraint${$util.capitalize(dimension)}_percent`, $math.truncate(percent, node.localSettings.floatPrecision));
        node.android(`layout_${dimension}`, '0px');
        return true;
    }
    return false;
}

function constraintPercentHeight(node: View, opposing = false) {
    if (node.documentParent.has('height', $enum.CSS_STANDARD.LENGTH)) {
        return constraintPercentValue(node, 'height', opposing);
    }
    else if ($css.isLength(node.cssInitial('height'), true)) {
        node.android('layout_height', $css.formatPX(node.bounds.height), false);
        return true;
    }
    return false;
}

function isTargeted(parent: View, node: View) {
    if (parent.element && node.dataset.target) {
        const element = document.getElementById(node.dataset.target);
        return element !== null && element !== parent.element;
    }
    return false;
}

function getTextBottom<T extends View>(nodes: T[]): T | undefined {
    return $util.filterArray(nodes, node => node.verticalAlign === 'text-bottom' || node.display === 'inline-block' && node.baseline).sort((a, b) => {
        if (a.bounds.height === b.bounds.height) {
            return a.is(CONTAINER_NODE.SELECT) ? 1 : -1;
        }
        return a.bounds.height > b.bounds.height ? -1 : 1;
    })[0];
}

function getAnchorDirection(reverse: boolean) {
    if (reverse) {
        return {
            anchorStart: 'right',
            anchorEnd: 'left',
            chainStart: 'rightLeft',
            chainEnd: 'leftRight'
        };
    }
    else {
        return {
            anchorStart: 'left',
            anchorEnd: 'right',
            chainStart: 'leftRight',
            chainEnd: 'rightLeft'
        };
    }
}

const constraintPercentWidth = (node: View, opposing = false) => constraintPercentValue(node, 'width', opposing);

const getMaxHeight = (node: View) => Math.max(node.actualHeight, node.lineHeight);

export default class Controller<T extends View> extends squared.base.Controller<T> implements android.base.Controller<T> {
    public static setConstraintDimension<T extends View>(node: T) {
        constraintPercentWidth(node);
        constraintPercentHeight(node);
        constraintMinMax(node, 'width', true);
        constraintMinMax(node, 'height', false);
    }

    public static setFlexDimension<T extends View>(node: T, dimension: string) {
        const horizontal = dimension === 'width';
        const dimensionA = $util.capitalize(dimension);
        const flexbox = node.flexbox;
        const basis = flexbox.basis;
        function setFlexGrow(value: string, grow: number) {
            node.android(`layout_${dimension}`, '0px');
            if (grow > 0) {
                node.app(`layout_constraint${horizontal ? 'Horizontal' : 'Vertical'}_weight`, $math.truncate(grow, node.localSettings.floatPrecision));
                if (value !== '') {
                    node.css(`min${dimensionA}`, value, true);
                }
            }
            else if (value !== '') {
                if (flexbox.shrink < 1) {
                    node.app(`layout_constraint${dimensionA}_min`, $css.formatPX((1 - flexbox.shrink) * parseFloat(value)));
                    node.app(`layout_constraint${dimensionA}_max`, value);
                }
                else {
                    node.app(`layout_constraint${dimensionA}_min`, value);
                }
            }
        }
        if ($css.isLength(basis)) {
            setFlexGrow(node.convertPX(basis), node.flexbox.grow);
        }
        else if (basis !== '0%' && $css.isPercent(basis)) {
            node.app(`layout_constraint${dimensionA}_percent`, (parseFloat(basis) / 100).toPrecision(node.localSettings.floatPrecision));
            setFlexGrow('', node.flexbox.grow);
        }
        else if (flexbox.grow > 0) {
            setFlexGrow(node.has(dimension, $enum.CSS_STANDARD.LENGTH) ? $css.formatPX(node[`actual${dimensionA}`]) : '', node.flexbox.grow);
        }
        else {
            if (horizontal) {
                constraintPercentWidth(node);
            }
            else {
                constraintPercentHeight(node);
            }
        }
        if (flexbox.shrink > 1) {
            node.app(`layout_constrained${dimensionA}`, 'true');
        }
        constraintMinMax(node, 'width', true);
        if (horizontal) {
            constraintPercentHeight(node, true);
        }
        else {
            constraintPercentWidth(node, true);
        }
        constraintMinMax(node, 'height', false);
    }

    public readonly localSettings: ControllerSettingsAndroid = {
        layout: {
            pathName: 'res/layout',
            fileExtension: 'xml',
            baseTemplate: $xml.STRING_XMLENCODING
        },
        directory: {
            font: 'res/font',
            image: 'res/drawable'
        },
        svg: {
            enabled: false
        },
        supported: {
            fontFormat: ['truetype', 'opentype'],
            imageFormat: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'cur']
        },
        unsupported: {
            excluded: new Set(['BR']),
            tagName: new Set(['SCRIPT', 'STYLE', 'OPTION', 'INPUT:hidden', 'MAP', 'AREA', 'SOURCE'])
        },
        precision: {
            standardFloat: 4
        },
        deviations: {
            textMarginBoundarySize: 8,
            constraintParentBottomOffset: 3.5,
            subscriptBottomOffset: 0.25,
            superscriptTopOffset: 0.25,
            legendBottomOffset: 0.25
        }
    };

    public optimize(nodes: T[]) {
        for (const node of nodes) {
            if (node.hasProcedure($enum.NODE_PROCEDURE.OPTIMIZATION)) {
                node.applyOptimizations();
            }
            if (node.hasProcedure($enum.NODE_PROCEDURE.CUSTOMIZATION)) {
                node.applyCustomizations(this.userSettings.customizationsOverwritePrivilege);
            }
        }
    }

    public finalize(layouts: FileAsset[]) {
        for (const layout of layouts) {
            layout.content = $xml.replaceTab(layout.content.replace(/{#0}/, getRootNs(layout.content)), this.userSettings.insertSpaces);
        }
    }

    public processUnknownParent(layout: $Layout<T>) {
        const { node, parent } = layout;
        let next = false;
        let renderAs: T | undefined;
        if (node.has('columnCount') || node.has('columnWidth')) {
            layout.setType(CONTAINER_NODE.CONSTRAINT, $enum.NODE_ALIGNMENT.COLUMN, $enum.NODE_ALIGNMENT.AUTO_LAYOUT);
        }
        else if (layout.some(item => !item.pageFlow && !item.positionAuto)) {
            layout.setType(CONTAINER_NODE.CONSTRAINT, $enum.NODE_ALIGNMENT.ABSOLUTE, $enum.NODE_ALIGNMENT.UNKNOWN);
        }
        else if (layout.length === 1) {
            const child = node.item(0) as T;
            if (node.documentRoot && isTargeted(node, child)) {
                node.hide();
                next = true;
            }
            else if (node.naturalElement && child.plainText) {
                node.clear();
                node.setInlineText(true);
                node.textContent = child.textContent;
                child.hide();
                layout.setType(CONTAINER_NODE.TEXT);
            }
            else if (
                this.userSettings.collapseUnattributedElements &&
                node.naturalElement &&
                node.positionStatic &&
                node.documentParent === node.actualParent &&
                !node.documentParent.hasAlign($enum.NODE_ALIGNMENT.AUTO_LAYOUT) &&
                !node.groupParent &&
                !node.pseudoElement &&
                !node.elementId &&
                !node.blockStatic &&
                !node.marginTop &&
                !node.marginBottom &&
                !node.hasWidth &&
                !node.hasHeight &&
                !node.contentBoxWidth &&
                !node.contentBoxHeight &&
                !node.visibleStyle.background &&
                !node.rightAligned &&
                !node.autoMargin.horizontal &&
                !node.autoMargin.vertical &&
                !node.companion &&
                !node.has('maxWidth') &&
                !node.has('maxHeight') &&
                !node.has('textAlign') &&
                !node.has('verticalAlign') &&
                (!node.has('lineHeight') || child.length) &&
                (!node.blockStatic || child.blockStatic) &&
                !node.dataset.use &&
                !node.dataset.target &&
                !this.hasAppendProcessing(node.id))
            {
                child.documentRoot = node.documentRoot;
                child.parent = parent;
                node.renderAs = child;
                node.resetBox($enum.BOX_STANDARD.MARGIN, child, true);
                node.hide();
                node.innerWrapped = child;
                child.outerWrapper = node;
                renderAs = child;
            }
            else if (node.autoMargin.horizontal || parent.layoutConstraint && parent.flexElement && node.flexbox.alignSelf === 'baseline' && child.textElement) {
                layout.setType(CONTAINER_NODE.LINEAR, $enum.NODE_ALIGNMENT.HORIZONTAL | $enum.NODE_ALIGNMENT.SINGLE);
            }
            else {
                layout.setType(CONTAINER_NODE.FRAME, $enum.NODE_ALIGNMENT.SINGLE);
            }
        }
        else if (node.element && Resource.hasLineBreak(node, true)) {
            layout.setType(layout.some(item => item.positionRelative) ? CONTAINER_NODE.RELATIVE : CONTAINER_NODE.LINEAR, $enum.NODE_ALIGNMENT.VERTICAL, $enum.NODE_ALIGNMENT.UNKNOWN);
        }
        else if (this.checkConstraintFloat(layout)) {
            layout.setType(CONTAINER_NODE.CONSTRAINT, $enum.NODE_ALIGNMENT.FLOAT);
        }
        else if (layout.linearX) {
            if (this.checkFrameHorizontal(layout)) {
                layout.renderType |= $enum.NODE_ALIGNMENT.FLOAT | $enum.NODE_ALIGNMENT.HORIZONTAL;
            }
            else if (this.checkConstraintHorizontal(layout)) {
                layout.setType(CONTAINER_NODE.CONSTRAINT);
            }
            else if (this.checkRelativeHorizontal(layout)) {
                layout.setType(CONTAINER_NODE.RELATIVE);
            }
            else {
                layout.setType(CONTAINER_NODE.LINEAR);
                if (layout.floated.size) {
                    sortHorizontalFloat(layout.children);
                }
            }
            layout.add($enum.NODE_ALIGNMENT.HORIZONTAL);
        }
        else if (layout.linearY) {
            layout.setType(layout.some(item => item.positionRelative || !item.pageFlow && item.positionAuto) ? CONTAINER_NODE.RELATIVE : CONTAINER_NODE.LINEAR, $enum.NODE_ALIGNMENT.VERTICAL, node.documentRoot ? $enum.NODE_ALIGNMENT.UNKNOWN : 0);
        }
        else if (layout.every(item => item.inlineFlow)) {
            if (this.checkFrameHorizontal(layout)) {
                layout.renderType |= $enum.NODE_ALIGNMENT.FLOAT | $enum.NODE_ALIGNMENT.HORIZONTAL;
            }
            else {
                layout.setType(CONTAINER_NODE.RELATIVE, $enum.NODE_ALIGNMENT.HORIZONTAL, $enum.NODE_ALIGNMENT.UNKNOWN);
            }
        }
        else if (layout.some(item => item.alignedVertically(item.previousSiblings(), item.siblingIndex > 0 ? layout.children.slice(0, item.siblingIndex) : undefined, layout.cleared) > 0)) {
            layout.setType(layout.some(item => item.positionRelative || !item.pageFlow && item.positionAuto) ? CONTAINER_NODE.RELATIVE : CONTAINER_NODE.LINEAR, $enum.NODE_ALIGNMENT.VERTICAL, $enum.NODE_ALIGNMENT.UNKNOWN);
        }
        else {
            layout.setType(CONTAINER_NODE.CONSTRAINT, $enum.NODE_ALIGNMENT.UNKNOWN);
        }
        return { layout, next, renderAs };
    }

    public processUnknownChild(layout: $Layout<T>) {
        const node = layout.node;
        const style = node.visibleStyle;
        let next = false;
        if (node.textContent.length && (node.inlineText || style.borderWidth)) {
            layout.setType(CONTAINER_NODE.TEXT);
        }
        else if (node.blockStatic && (style.borderWidth || style.backgroundImage || node.paddingTop + node.paddingBottom > 0)) {
            layout.setType(CONTAINER_NODE.LINE);
        }
        else if (
            this.userSettings.collapseUnattributedElements &&
            node.naturalElement &&
            !node.documentRoot &&
            !node.elementId &&
            !node.bounds.height &&
            !node.marginTop &&
            !node.marginBottom &&
            !style.background &&
            !node.dataset.use)
        {
            node.hide();
            next = true;
        }
        else {
            layout.setType(style.background ? CONTAINER_NODE.TEXT : CONTAINER_NODE.FRAME);
        }
        return { layout, next };
    }

    public processTraverseHorizontal(layout: $Layout<T>, siblings?: T[]) {
        const { node, parent, children } = layout;
        if (this.checkFrameHorizontal(layout)) {
            layout.node = this.createNodeGroup(node, children, parent);
            layout.renderType |= $enum.NODE_ALIGNMENT.FLOAT | $enum.NODE_ALIGNMENT.HORIZONTAL;
        }
        else if (siblings === undefined || layout.length !== siblings.length || parent.hasAlign($enum.NODE_ALIGNMENT.VERTICAL)) {
            layout.node = this.createNodeGroup(node, children, parent);
            this.processLayoutHorizontal(layout);
        }
        else if (!parent.hasAlign($enum.NODE_ALIGNMENT.HORIZONTAL)) {
            parent.alignmentType |= $enum.NODE_ALIGNMENT.HORIZONTAL;
        }
        return { layout };
    }

    public processTraverseVertical(layout: $Layout<T>, siblings?: T[]) {
        const { node, parent, children, floated, cleared } = layout;
        if (floated.size && cleared.size && !(floated.size === 1 && layout.every((item, index) => index === 0 || index === layout.length - 1 || cleared.has(item)))) {
            layout.node = this.createNodeGroup(node, children, parent);
            layout.renderType |= $enum.NODE_ALIGNMENT.FLOAT | $enum.NODE_ALIGNMENT.VERTICAL;
        }
        else if (floated.size && children[0].floating) {
            layout.node = this.createNodeGroup(node, children, parent);
            layout.renderType |= $enum.NODE_ALIGNMENT.FLOAT | $enum.NODE_ALIGNMENT.HORIZONTAL;
        }
        else if (siblings === undefined || layout.length !== siblings.length || parent.hasAlign($enum.NODE_ALIGNMENT.HORIZONTAL)) {
            layout.node = this.createNodeGroup(node, children, parent);
            layout.setType(layout.some(item => item.positionRelative) ? CONTAINER_NODE.RELATIVE : CONTAINER_NODE.LINEAR, $enum.NODE_ALIGNMENT.VERTICAL);
        }
        else if (!parent.hasAlign($enum.NODE_ALIGNMENT.VERTICAL)) {
            parent.alignmentType |= $enum.NODE_ALIGNMENT.VERTICAL;
        }
        return { layout };
    }

    public processLayoutHorizontal(layout: $Layout<T>) {
        let containerType = 0;
        if (this.checkConstraintFloat(layout, true)) {
            layout.setType(CONTAINER_NODE.CONSTRAINT, $enum.NODE_ALIGNMENT.FLOAT);
        }
        else if (this.checkConstraintHorizontal(layout)) {
            containerType = CONTAINER_NODE.CONSTRAINT;
        }
        else if (this.checkRelativeHorizontal(layout)) {
            containerType = CONTAINER_NODE.RELATIVE;
        }
        else {
            containerType = CONTAINER_NODE.LINEAR;
            if (layout.floated.size) {
                sortHorizontalFloat(layout.children);
            }
        }
        if (containerType !== 0) {
            layout.setType(containerType, $enum.NODE_ALIGNMENT.HORIZONTAL);
        }
        return { layout };
    }

    public sortRenderPosition(parent: T, templates: NodeXmlTemplate<T>[]) {
        if (parent.layoutConstraint && templates.some(item => !item.node.pageFlow)) {
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
            return $util.concatMultiArray(below, middle, above);
        }
        return templates;
    }

    public checkFrameHorizontal(layout: $Layout<T>) {
        const [floating, sibling] = layout.partition(node => node.floating);
        if (layout.floated.size === 2 || layout.cleared.size || layout.some(node => node.pageFlow && (node.autoMargin.left || node.autoMargin.right))) {
            return true;
        }
        else if (sibling.length) {
            if (layout.floated.has('right')) {
                return true;
            }
            else if (layout.floated.has('left') && !layout.linearX) {
                let flowIndex = Number.POSITIVE_INFINITY;
                for (const node of sibling) {
                    flowIndex = Math.min(flowIndex, node.siblingIndex);
                }
                return $util.replaceMap<T, number>(floating, node => node.siblingIndex).some(value => value < flowIndex);
            }
        }
        return false;
    }

    public checkConstraintFloat(layout: $Layout<T>, horizontal = false) {
        let A = 0;
        let B = 0;
        for (const node of layout) {
            const excluded = layout.cleared.has(node) || node.renderExclude;
            if (A !== -1 && ((node.floating || node.autoMargin.horizontal) && node.positiveAxis || excluded)) {
                A++;
            }
            else {
                A = -1;
            }
            if (B !== -1 && (node.has('width', $enum.CSS_STANDARD.PERCENT) || excluded)) {
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

    public checkConstraintHorizontal(layout: $Layout<T>) {
        if (layout.node.cssInitialAny('textAlign', 'center', 'end', 'right') || !layout.parent.hasHeight && layout.some(node => node.verticalAlign === 'middle' || node.verticalAlign === 'bottom')) {
            return layout.singleRowAligned && layout.every(node => node.positiveAxis || node.renderExclude);
        }
        return false;
    }

    public checkRelativeHorizontal(layout: $Layout<T>) {
        const lineHeight = layout.children[0].lineHeight;
        if (layout.every(node => node.baseline && !node.positionRelative && node.lineHeight === lineHeight && (node.imageElement || node.textElement && !node.multiline)) && layout.singleRowAligned) {
            return false;
        }
        return layout.some(node => node.textElement || !node.baseline || node.imageElement || node.positionRelative || !node.pageFlow && node.positionAuto);
    }

    public setConstraints() {
        for (const node of this.cache) {
            if ((node.layoutRelative || node.layoutConstraint) && node.hasProcedure($enum.NODE_PROCEDURE.CONSTRAINT)) {
                const children = node.renderFilter(item => !item.positioned) as T[];
                if (children.length) {
                    if (node.layoutRelative) {
                        this.processRelativeHorizontal(node, children);
                    }
                    else {
                        const [pageFlow, absolute] = $util.partitionArray(children, item => item.pageFlow);
                        let bottomParent = node.box.bottom;
                        if (absolute.length) {
                            node.renderEach(item => bottomParent = Math.max(bottomParent, item.linear.bottom));
                            for (const item of absolute) {
                                if (item.leftTopAxis) {
                                    if (!item.positionAuto) {
                                        if (item.hasWidth && item.autoMargin.horizontal) {
                                            if (item.has('left') && item.autoMargin.right) {
                                                item.anchor('left', 'parent');
                                                item.modifyBox($enum.BOX_STANDARD.MARGIN_LEFT, item.left);
                                            }
                                            else if (item.has('right') && item.autoMargin.left) {
                                                item.anchor('right', 'parent');
                                                item.modifyBox($enum.BOX_STANDARD.MARGIN_RIGHT, item.right);
                                            }
                                            else {
                                                item.anchorParent(AXIS_ANDROID.HORIZONTAL);
                                                item.modifyBox($enum.BOX_STANDARD.MARGIN_LEFT, item.left);
                                                item.modifyBox($enum.BOX_STANDARD.MARGIN_RIGHT, item.right);
                                            }
                                        }
                                        else {
                                            if (item.has('left')) {
                                                item.anchor('left', 'parent');
                                                if (!item.has('right') && item.css('width') === '100%') {
                                                    item.anchor('right', 'parent');
                                                }
                                                item.modifyBox($enum.BOX_STANDARD.MARGIN_LEFT, adjustAbsolutePaddingOffset(node, $enum.BOX_STANDARD.PADDING_LEFT, item.left));
                                            }
                                            if (item.has('right') && (!item.has('width') || item.css('width') === '100%' || !item.has('left'))) {
                                                item.anchor('right', 'parent');
                                                item.modifyBox($enum.BOX_STANDARD.MARGIN_RIGHT, adjustAbsolutePaddingOffset(node, $enum.BOX_STANDARD.PADDING_RIGHT, item.right));
                                            }
                                        }
                                        if (item.hasHeight && item.autoMargin.vertical) {
                                            if (item.has('top') && item.autoMargin.bottom) {
                                                item.anchor('top', 'parent');
                                                item.modifyBox($enum.BOX_STANDARD.MARGIN_TOP, item.top);
                                            }
                                            else if (item.has('bottom') && item.autoMargin.top) {
                                                item.anchor('bottom', 'parent');
                                                item.modifyBox($enum.BOX_STANDARD.MARGIN_BOTTOM, item.bottom);
                                            }
                                            else {
                                                item.anchorParent(AXIS_ANDROID.VERTICAL);
                                                item.modifyBox($enum.BOX_STANDARD.MARGIN_TOP, item.top);
                                                item.modifyBox($enum.BOX_STANDARD.MARGIN_BOTTOM, item.bottom);
                                            }
                                        }
                                        else {
                                            if (item.has('top')) {
                                                item.anchor('top', 'parent');
                                                if (!item.has('bottom') && item.css('height') === '100%') {
                                                    item.anchor('bottom', 'parent');
                                                }
                                                item.modifyBox($enum.BOX_STANDARD.MARGIN_TOP, adjustAbsolutePaddingOffset(node, $enum.BOX_STANDARD.PADDING_TOP, item.top));
                                            }
                                            if (item.has('bottom') && (!item.has('height') || item.css('height') === '100%' || !item.has('top'))) {
                                                item.anchor('bottom', 'parent');
                                                item.modifyBox($enum.BOX_STANDARD.MARGIN_BOTTOM, adjustAbsolutePaddingOffset(node, $enum.BOX_STANDARD.PADDING_BOTTOM, item.bottom));
                                            }
                                        }
                                    }
                                    if (item.outerWrapper) {
                                        if (!item.alignParent('bottom')) {
                                            item.anchor('top', 'parent', false);
                                        }
                                        if (!item.alignParent('right')) {
                                            item.anchor('left', 'parent', false);
                                        }
                                    }
                                }
                                item.positioned = true;
                            }
                        }
                        if (pageFlow.length) {
                            if (node.layoutHorizontal) {
                                this.processConstraintHorizontal(node, pageFlow);
                            }
                            else if (node.hasAlign($enum.NODE_ALIGNMENT.COLUMN)) {
                                this.processConstraintColumn(node, pageFlow);
                            }
                            else if (pageFlow.length > 1) {
                                this.processConstraintChain(node, pageFlow);
                            }
                            else {
                                const item = pageFlow[0];
                                if (item.autoMargin.leftRight || item.inlineStatic && item.cssAscend('textAlign', true) === 'center') {
                                    item.anchorParent(AXIS_ANDROID.HORIZONTAL);
                                }
                                else if (item.rightAligned) {
                                    item.anchor('right', 'parent');
                                }
                                else {
                                    item.anchor('left', 'parent');
                                }
                                if (item.autoMargin.topBottom) {
                                    item.anchorParent(AXIS_ANDROID.VERTICAL);
                                }
                                else {
                                    item.anchor('top', 'parent');
                                    if (this.withinParentBottom(item.pageFlow, item.linear.bottom, bottomParent) && item.actualParent && !item.actualParent.documentBody && !item.has('height', $enum.CSS_STANDARD.PERCENT, { not: '100%' })) {
                                        item.anchor('bottom', 'parent');
                                        item.anchorStyle(AXIS_ANDROID.VERTICAL);
                                    }
                                }
                                Controller.setConstraintDimension(item);
                            }
                            this.evaluateAnchors(pageFlow);
                        }
                        for (const item of children) {
                            if (!item.anchored) {
                                this.addGuideline(item, node);
                                if (item.pageFlow) {
                                    this.evaluateAnchors(pageFlow);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    public renderNodeGroup(layout: $Layout<T>) {
        const { node, parent, containerType, alignmentType, rowCount, columnCount } = layout;
        const options = createViewAttribute();
        let valid = false;
        switch (containerType) {
            case CONTAINER_NODE.LINEAR:
                if ($util.hasBit(alignmentType, $enum.NODE_ALIGNMENT.VERTICAL)) {
                    options.android.orientation = AXIS_ANDROID.VERTICAL;
                    valid = true;
                }
                else if ($util.hasBit(alignmentType, $enum.NODE_ALIGNMENT.HORIZONTAL)) {
                    options.android.orientation = AXIS_ANDROID.HORIZONTAL;
                    valid = true;
                }
                break;
            case CONTAINER_NODE.GRID:
                options.android.rowCount = rowCount ? rowCount.toString() : '';
                options.android.columnCount = columnCount ? columnCount.toString() : '2';
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
            node.alignmentType |= alignmentType;
            node.render(!node.dataset.use && node.dataset.target ? this.application.resolveTarget(node.dataset.target) : parent);
            node.apply(options);
            return <NodeXmlTemplate<T>> {
                type: $enum.NODE_TEMPLATE.XML,
                node,
                controlName: node.controlName
            };
        }
        return undefined;
    }

    public renderNode(layout: $Layout<T>) {
        const { node, containerType, alignmentType } = layout;
        const controlName = View.getControlName(containerType);
        node.setControlType(controlName, containerType);
        node.alignmentType |= alignmentType;
        let parent = layout.parent;
        let target = !node.dataset.use ? node.dataset.target : undefined;
        if (node.element) {
            switch (node.element.tagName) {
                case 'IMG': {
                    const element = <HTMLImageElement> node.element;
                    const absoluteParent = node.absoluteParent || node.documentParent;
                    let width = node.toFloat('width');
                    let height = node.toFloat('height');
                    let percentWidth = node.has('width', $enum.CSS_STANDARD.PERCENT) ? width : -1;
                    const percentHeight = node.has('height', $enum.CSS_STANDARD.PERCENT) ? height : -1;
                    let scaleType = 'fitXY';
                    let imageSet: ImageSrcSet[] | undefined;
                    if (element.srcset) {
                        imageSet = $css.getSrcSet(element, this.localSettings.supported.imageFormat);
                        if (imageSet.length) {
                            if (imageSet[0].actualWidth) {
                                if (percentWidth === -1 || width < 100) {
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
                    if (node.hasResource($enum.NODE_RESOURCE.IMAGE_SOURCE)) {
                        const src = (<android.base.Resource<T>> this.application.resourceHandler).addImageSrc(element, '', imageSet);
                        if (src !== '') {
                            node.android('src', `@drawable/${src}`);
                        }
                    }
                    if (percentWidth !== -1 || percentHeight !== -1) {
                        if (percentWidth >= 0) {
                            width *= absoluteParent.box.width / 100;
                            if (percentWidth < 100 && !parent.layoutConstraint) {
                                node.css('width', $css.formatPX(width));
                            }
                        }
                        if (percentHeight >= 0) {
                            height *= absoluteParent.box.height / 100;
                            if (percentHeight < 100 && !(parent.layoutConstraint && absoluteParent.has('height', $enum.CSS_STANDARD.LENGTH))) {
                                node.css('height', $css.formatPX(height));
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
                        const container = this.application.createNode($dom.createElement(node.actualParent && node.actualParent.element));
                        container.setControlType(CONTAINER_ANDROID.FRAME, CONTAINER_NODE.FRAME);
                        container.inherit(node, 'base');
                        container.exclude({
                            procedure: $enum.NODE_PROCEDURE.ALL,
                            resource: $enum.NODE_RESOURCE.ALL
                        });
                        container.cssApply({
                            position: node.position,
                            zIndex: node.zIndex.toString()
                        });
                        parent.appendTry(node, container);
                        node.parent = container;
                        if (width > 0) {
                            container.android('layout_width', width < absoluteParent.box.width ? $css.formatPX(width) : 'match_parent');
                        }
                        else {
                            container.android('layout_width', 'wrap_content');
                        }
                        if (height > 0) {
                            container.android('layout_height', height < absoluteParent.box.height ? $css.formatPX(height) : 'match_parent');
                        }
                        else {
                            container.android('layout_height', 'wrap_content');
                        }
                        container.render(target ? this.application.resolveTarget(target) : parent);
                        container.saveAsInitial();
                        container.innerWrapped = node;
                        node.outerWrapper = container;
                        if (!parent.layoutConstraint) {
                            node.modifyBox($enum.BOX_STANDARD.MARGIN_TOP, node.top);
                            node.modifyBox($enum.BOX_STANDARD.MARGIN_LEFT, node.left);
                        }
                        this.application.addLayoutTemplate(
                            parent,
                            container,
                            <NodeXmlTemplate<T>> {
                                type: $enum.NODE_TEMPLATE.XML,
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
                        case 'datetime-local':
                            switch (element.type) {
                                case 'number':
                                case 'range':
                                    node.android('inputType', 'number');
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
                    if (element.maxLength > 0) {
                        node.android('maxLength', element.maxLength.toString());
                    }
                    if (!node.hasWidth && element.cols > 0) {
                        node.css('width', $css.formatPX(element.cols * 8), true);
                    }
                    node.android('hint', element.placeholder);
                    node.android('scrollbars', AXIS_ANDROID.VERTICAL);
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
                    node.modifyBox($enum.BOX_STANDARD.MARGIN_BOTTOM, node.actualHeight * this.localSettings.deviations.legendBottomOffset);
                    break;
                }
            }
        }
        switch (controlName) {
            case CONTAINER_ANDROID.TEXT:
                let overflow = '';
                if (node.overflowX) {
                    overflow += AXIS_ANDROID.HORIZONTAL;
                }
                if (node.overflowY) {
                    overflow += (overflow !== '' ? '|' : '') + AXIS_ANDROID.VERTICAL;
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
                    const match = /^(rgba?\(\d+, \d+, \d+(?:, [\d.]+)?\)) (-?[\d.]+[a-z]+) (-?[\d.]+[a-z]+)\s*(-?[\d.]+[a-z]+)?$/.exec(node.css('textShadow'));
                    if (match) {
                        const color = Resource.addColor($color.parseColor(match[1]));
                        if (color !== '') {
                            node.android('shadowColor', `@color/${color}`);
                            node.android('shadowDx', $math.truncate($css.parseUnit(match[2], node.fontSize)));
                            node.android('shadowDy', $math.truncate($css.parseUnit(match[3], node.fontSize)));
                            node.android('shadowRadius', match[4] ? $math.truncate($css.parseUnit(match[4], node.fontSize)) : '0');
                        }
                    }
                }
                if (node.css('whiteSpace') === 'nowrap') {
                    node.android('maxLines', '1');
                    node.android('ellipsize', 'end');
                }
                break;
            case CONTAINER_ANDROID.BUTTON:
                node.mergeGravity('gravity', 'center_vertical');
                break;
            case CONTAINER_ANDROID.EDIT:
            case CONTAINER_ANDROID.RANGE:
                if (!node.hasWidth) {
                    node.css('width', $css.formatPX(node.bounds.width), true);
                }
                break;
            case CONTAINER_ANDROID.LINE:
                if (!node.hasHeight) {
                    node.android('layout_height', $css.formatPX(node.contentBoxHeight || 1));
                }
                break;
        }
        node.render(target ? this.application.resolveTarget(target) : parent);
        return <NodeXmlTemplate<T>> {
            type: $enum.NODE_TEMPLATE.XML,
            node,
            controlName
        };
    }

    public renderNodeStatic(controlName: string, options?: ExternalData, width?: string, height?: string, content?: string) {
        const node = new View(0, '0', undefined, this.afterInsertNode) as T;
        node.setControlType(controlName);
        if (width !== '') {
            node.android('layout_width', width || 'wrap_content');
        }
        if (height !== '') {
            node.android('layout_height', height || 'wrap_content');
        }
        if (options) {
            node.apply(options);
            options.documentId = node.documentId;
        }
        return this.getEnclosingTag($enum.NODE_TEMPLATE.XML, <NodeTagXml<T>> { controlName, attributes: this.userSettings.showAttributes ? node.extractAttributes(1) : undefined, content });
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
        const boxParent = parent.groupParent && !node.documentParent.hasAlign($enum.NODE_ALIGNMENT.AUTO_LAYOUT) ? parent : node.documentParent as T;
        const absoluteParent = node.absoluteParent as T;
        GUIDELINE_AXIS.forEach(value => {
            if (!node.constraint[value] && (!orientation || value === orientation)) {
                const horizontal = value === AXIS_ANDROID.HORIZONTAL;
                const box = boxParent.box;
                let LT: string;
                let RB: string;
                let LTRB: string;
                let RBLT: string;
                if (horizontal) {
                    LT = !opposite ? 'left' : 'right';
                    RB = !opposite ? 'right' : 'left';
                    LTRB = !opposite ? 'leftRight' : 'rightLeft';
                    RBLT = !opposite ? 'rightLeft' : 'leftRight';
                }
                else {
                    LT = !opposite ? 'top' : 'bottom';
                    RB = !opposite ? 'bottom' : 'top';
                    LTRB = !opposite ? 'topBottom' : 'bottomTop';
                    RBLT = !opposite ? 'bottomTop' : 'topBottom';
                }
                if ($util.withinRange(node.linear[LT], box[LT])) {
                    node.anchor(LT, 'parent', true);
                    return;
                }
                const bounds = node.positionStatic ? node.bounds : node.linear;
                let beginPercent = 'layout_constraintGuide_';
                let usePercent = false;
                let location: number;
                if (!node.pageFlow && $css.isPercent(node.css(LT))) {
                    location = parseFloat(node.css(LT)) / 100;
                    usePercent = true;
                    beginPercent += 'percent';
                }
                else {
                    if (!percent && !parent.hasAlign($enum.NODE_ALIGNMENT.AUTO_LAYOUT)) {
                        const found = parent.renderChildren.some(item => {
                            if (item !== node && item.constraint[value]) {
                                const pageFlow = node.pageFlow && item.pageFlow;
                                let valid = false;
                                if (pageFlow) {
                                    if ($util.withinRange(node.linear[LT], item.linear[RB])) {
                                        node.anchor(LTRB, item.documentId, true);
                                        valid = true;
                                    }
                                    else if ($util.withinRange(node.linear[RB], item.linear[LT])) {
                                        node.anchor(RBLT, item.documentId, true);
                                        valid = true;
                                    }
                                }
                                if (pageFlow || !node.pageFlow && !item.pageFlow && node.bounds[LT] >= 0 && node.bounds[LT] >= 0) {
                                    if ($util.withinRange(node.bounds[LT], item.bounds[LT])) {
                                        node.anchor(!horizontal && node.textElement && node.baseline && item.textElement && item.baseline ? 'baseline' : LT, item.documentId, true);
                                        node.modifyBox(horizontal ? $enum.BOX_STANDARD.MARGIN_LEFT : $enum.BOX_STANDARD.MARGIN_TOP);
                                        valid = true;
                                    }
                                    else if ($util.withinRange(node.bounds[RB], item.bounds[RB])) {
                                        node.anchor(RB, item.documentId, true);
                                        node.modifyBox(horizontal ? $enum.BOX_STANDARD.MARGIN_RIGHT : $enum.BOX_STANDARD.MARGIN_BOTTOM);
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
                        const previousSiblings = node.previousSiblings() as T[];
                        if (previousSiblings.length && !node.alignedVertically(previousSiblings)) {
                            const previous = previousSiblings.pop() as T;
                            if (previous.renderParent === node.renderParent) {
                                node.anchor(horizontal ? 'rightLeft' : 'top', previous.documentId, true);
                                node.constraint[value] = previous.constraint[value];
                                return;
                            }
                        }
                    }
                    if (percent) {
                        const position = Math.abs(bounds[LT] - box[LT]) / box[horizontal ? 'width' : 'height'];
                        location = parseFloat($math.truncate(opposite ? 1 - position : position, this.localSettings.precision.standardFloat));
                        usePercent = true;
                        beginPercent += 'percent';
                    }
                    else {
                        location = bounds[LT] - box[!opposite ? LT : RB];
                        if (!horizontal && !boxParent.groupParent && boxParent !== absoluteParent && absoluteParent.getBox($enum.BOX_STANDARD.MARGIN_TOP)[0] === 1) {
                            location -= absoluteParent.marginTop;
                        }
                        beginPercent += 'begin';
                    }
                }
                const guideline = parent.constraint.guideline || {};
                if (!node.pageFlow) {
                    if (node.parent === boxParent.outerWrapper) {
                        location += boxParent[!opposite ? (horizontal ? 'paddingLeft' : 'paddingTop') : (horizontal ? 'paddingRight' : 'paddingBottom')];
                    }
                    else if (absoluteParent === node.documentParent) {
                        let direction: number;
                        if (horizontal) {
                            direction = !opposite ? $enum.BOX_STANDARD.PADDING_LEFT : $enum.BOX_STANDARD.PADDING_RIGHT;
                        }
                        else {
                            direction = !opposite ? $enum.BOX_STANDARD.PADDING_TOP : $enum.BOX_STANDARD.PADDING_BOTTOM;
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
                    node.modifyBox($enum.BOX_STANDARD.MARGIN_TOP);
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
                                    boxMargin = $enum.BOX_STANDARD.MARGIN_TOP;
                                    break;
                                case 'left':
                                    boxMargin = $enum.BOX_STANDARD.MARGIN_LEFT;
                                    break;
                                case 'bottom':
                                    boxMargin = $enum.BOX_STANDARD.MARGIN_BOTTOM;
                                    break;
                                case 'right':
                                    boxMargin = $enum.BOX_STANDARD.MARGIN_RIGHT;
                                    break;
                            }
                            innerWrapped.modifyBox(boxMargin, location);
                        }
                    }
                }
                else if (horizontal && location + bounds.width >= box.right && boxParent.has('width') && !node.has('right') || !horizontal && location + bounds.height >= box.bottom && boxParent.has('height') && !node.has('bottom')) {
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
                    const options = createViewAttribute(
                        undefined,
                        { orientation: horizontal ? AXIS_ANDROID.VERTICAL : AXIS_ANDROID.HORIZONTAL },
                        { [beginPercent]: usePercent ? location.toString() : $css.formatPX(location) }
                    );
                    this.addAfterOutsideTemplate(node.id, this.renderNodeStatic(CONTAINER_ANDROID.GUIDELINE, options));
                    const documentId: string = options['documentId'];
                    node.anchor(LT, documentId, true);
                    node.anchorDelete(RB);
                    if (location > 0) {
                        $util.assignEmptyValue(guideline, value, beginPercent, LT, documentId, location.toString());
                        parent.constraint.guideline = guideline;
                    }
                }
            }
        });
    }

    public addBarrier(nodes: T[], barrierDirection: string): string {
        const options = createViewAttribute(
            undefined,
            undefined,
            { barrierDirection, constraint_referenced_ids: $util.objectMap(nodes, node => stripId(node.documentId)).join(',') }
        );
        this.addAfterOutsideTemplate(nodes[nodes.length - 1].id, this.renderNodeStatic(CONTAINER_ANDROID.BARRIER, options));
        return options['documentId'];
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
                    const bottomTop = current.alignSibling('bottomTop');
                    if (bottomTop !== '') {
                        const next = nodes.find(item => item.documentId === bottomTop);
                        if (next && next.alignSibling('topBottom') === current.documentId) {
                            if (next.alignParent('bottom')) {
                                node.anchorStyle(AXIS_ANDROID.VERTICAL, 'packed', 0, false);
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
                            const documentId = this.addBarrier([current], 'bottom');
                            current.anchor('bottomTop', documentId);
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

    public createNodeGroup(node: T, children: T[], parent?: T, replacement?: T) {
        const group = new ViewGroup(this.cache.nextId, node, children, this.afterInsertNode) as T;
        if (parent) {
            parent.appendTry(replacement || node, group);
            group.init();
        }
        else {
            group.siblingIndex = node.siblingIndex;
        }
        this.cache.append(group);
        return group;
    }

    public createNodeWrapper(node: T, parent?: T, children?: T[], controlName?: string, containerType?: number) {
        const container = this.application.createNode($dom.createElement(node.actualParent && node.actualParent.element, node.block ? 'div' : 'span'), true, parent, children);
        if (node.documentRoot) {
            container.documentRoot = true;
            node.documentRoot = false;
        }
        container.inherit(node, 'base', 'alignment');
        if (controlName) {
            container.setControlType(controlName, containerType);
        }
        container.exclude({
            section: $enum.APP_SECTION.ALL,
            procedure: $enum.NODE_PROCEDURE.NONPOSITIONAL,
            resource: $enum.NODE_RESOURCE.BOX_STYLE | $enum.NODE_RESOURCE.ASSET
        });
        if (parent) {
            parent.appendTry(node, container);
            node.parent = container;
        }
        else {
            container.innerWrapped = node;
            container.siblingIndex = node.siblingIndex;
        }
        if (node.renderParent) {
            const renderTemplates = node.renderParent.renderTemplates;
            if (renderTemplates) {
                for (let i = 0; i < renderTemplates.length; i++) {
                    if (renderTemplates[i].node === node) {
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
        node.outerWrapper = container;
        return container;
    }

    protected processRelativeHorizontal(node: T, children: T[]) {
        const rowsLeft: T[][] = [];
        const rowsRight: T[][] = [];
        let alignmentMultiLine = false;
        let sortPositionAuto = false;
        if (node.hasAlign($enum.NODE_ALIGNMENT.VERTICAL)) {
            let previous: T | undefined;
            for (let i = 0; i < children.length; i++) {
                const item = children[i];
                if (previous === undefined) {
                    item.anchor('top', 'true');
                }
                else {
                    item.anchor('topBottom', previous.documentId);
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
                const renderParent = node.renderParent;
                if (renderParent) {
                    if (renderParent.overflowX) {
                        return renderParent.box.width;
                    }
                    else if (renderParent.groupParent) {
                        let floatStart = Number.NEGATIVE_INFINITY;
                        for (const item of node.documentParent.actualChildren) {
                            if (item.float === 'left' && item.linear.right > floatStart && !children.includes(item as T)) {
                                floatStart = item.linear.right;
                            }
                        }
                        if (floatStart !== Number.NEGATIVE_INFINITY) {
                            for (const child of node.documentParent.actualChildren) {
                                if (child.linear.right === floatStart && children.some(item => $util.withinRange(item.linear.left, floatStart) && item.intersectY(child.linear))) {
                                    return node.box.right - floatStart;
                                }
                            }
                        }
                    }
                    else if (renderParent === node.documentParent && renderParent.blockStatic && node.naturalElement && node.inlineStatic) {
                        return renderParent.box.width - (node.linear.left - renderParent.box.left);
                    }
                }
                return node.box.width - (node.getBox($enum.BOX_STANDARD.PADDING_LEFT)[1] + node.getBox($enum.BOX_STANDARD.PADDING_RIGHT)[1]);
            })();
            const checkLineWrap = node.css('whiteSpace') !== 'nowrap';
            const cleared = $NodeList.linearData(children, true).cleared;
            const textIndent = node.block || node.blockDimension ? node.toInt('textIndent') : 0;
            let rowWidth = 0;
            let previousRowLeft: T | undefined;
            $util.partitionArray(children, item => item.float !== 'right').forEach((seg, index) => {
                if (seg.length === 0) {
                    return;
                }
                const leftAlign = index === 0;
                let leftForward = true;
                let alignParent: string;
                let rows: T[][];
                if (leftAlign) {
                    const actualParent = $NodeList.actualParent(seg);
                    if (actualParent && actualParent.cssInitialAny('textAlign', 'right', 'end')) {
                        alignParent = 'right';
                        leftForward = false;
                        seg[seg.length - 1].anchor(alignParent, 'true');
                    }
                    else {
                        alignParent = 'left';
                    }
                    sortHorizontalFloat(seg);
                    rows = rowsLeft;
                }
                else {
                    alignParent = 'right';
                    rows = rowsRight;
                }
                let previousMultiline = false;
                let previous!: T;
                for (let i = 0; i < seg.length; i++) {
                    const item = seg[i];
                    let alignSibling = leftAlign && leftForward ? 'leftRight' : 'rightLeft';
                    if (!item.pageFlow) {
                        if (previous) {
                            item.anchor(alignSibling, previous.documentId);
                            item.anchor('top', previous.documentId);
                        }
                        else {
                            item.anchor(alignParent, 'true');
                            item.anchor('top', 'true');
                        }
                        sortPositionAuto = true;
                        continue;
                    }
                    let bounds = item.bounds;
                    if (item.naturalElement && item.inlineText && !item.has('width')) {
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
                        item.anchor('right', 'true');
                    }
                    else if (item.autoMargin.right) {
                        item.anchor('left', 'true');
                    }
                    else {
                        anchored = false;
                    }
                    if (previous === undefined) {
                        if (leftForward) {
                            if (!anchored) {
                                item.anchor(alignParent, 'true');
                            }
                            rows.push([item]);
                        }
                        else {
                            rows.push([]);
                        }
                    }
                    else {
                        const items = rows[rows.length - 1];
                        let maxWidth = 0;
                        let baseWidth = 0;
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
                                baseWidth -= item.paddingLeft + item.paddingRight;
                            }
                            return true;
                        };
                        if (adjustFloatingNegativeMargin(item, previous)) {
                            alignSibling = '';
                        }
                        const viewGroup = item.groupParent && !item.hasAlign($enum.NODE_ALIGNMENT.SEGMENTED);
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
                            if (previous.floating && rowWidth < boxWidth && previous.alignParent('left')) {
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
                            !item.textElement && checkWrapWidth() && Math.floor(baseWidth) > maxWidth ||
                            !item.floating && (previous.blockStatic || item.previousSiblings().some(sibling => sibling.lineBreak || sibling.excluded && sibling.blockStatic) || !!siblings && siblings.some(element => $session.causesLineBreak(element, node.sessionId))))
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
                                checkSingleLine(previous, checkLineWrap);
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
                            if (!previous.floating && !retainMultiline && item.multiline && !item.has('width')) {
                                item.multiline = false;
                                multiline = false;
                            }
                            items.push(item);
                        }
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
                    let previousOffset = 0;
                    if (siblings && !siblings.some(element => !!$session.getElementAsNode(element, item.sessionId) || $session.causesLineBreak(element, item.sessionId))) {
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
        if (rowsLeft.length > 1 || rowsRight.length > 1) {
            alignmentMultiLine = true;
        }
        [rowsLeft, rowsRight].forEach(rows => {
            let previousBaseline: T | undefined;
            for (let i = 0; i < rows.length; i++) {
                const items = rows[i];
                let baseline: T | undefined;
                if (items.length > 1) {
                    const baselineItems = $NodeList.baseline(items);
                    let textBottom: T | undefined;
                    baseline = baselineItems[0];
                    if (baseline) {
                        textBottom = getTextBottom(items);
                        if (textBottom) {
                            if (baseline !== textBottom && (textBottom.actualHeight > baseline.actualHeight || textBottom.companion && textBottom.companion.actualHeight > baseline.actualHeight)) {
                                baseline.anchor('bottom', textBottom.documentId);
                            }
                            else {
                                textBottom = undefined;
                            }
                        }
                    }
                    const baselineAlign: T[] = [];
                    let documentId = i === 0 ? 'true' : (baseline ? baseline.documentId : '');
                    let maxCenterHeight = 0;
                    let textBaseline: UndefNull<T> = null;
                    for (const item of items) {
                         if (item.baseline) {
                            if (item !== baseline) {
                                if (textBottom && item.inputElement) {
                                    if (item !== textBottom) {
                                        item.anchor('bottom', textBottom.documentId);
                                    }
                                }
                                else {
                                    baselineAlign.push(item);
                                }
                            }
                        }
                        else if (item.inlineVertical) {
                            const baselineActive = item !== baseline && baseline;
                            switch (item.verticalAlign) {
                                case 'text-top':
                                    if (textBaseline === null) {
                                        textBaseline = $NodeList.baseline(items, true)[0];
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
                                        item.modifyBox($enum.BOX_STANDARD.MARGIN_TOP, Math.ceil(item.fontSize * this.localSettings.deviations.superscriptTopOffset) * -1);
                                    }
                                case 'top':
                                    if (documentId !== '' && documentId !== item.documentId) {
                                        item.anchor('top', documentId);
                                    }
                                    else if (baselineActive) {
                                        item.anchor('top', baselineActive.documentId);
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
                                    else if (baselineActive) {
                                        const heightParent = Math.max(baselineActive.actualHeight, baselineActive.lineHeight);
                                        if (height < heightParent) {
                                            item.anchor('top', baselineActive.documentId);
                                            item.modifyBox($enum.BOX_STANDARD.MARGIN_TOP, Math.round((heightParent - height) / 2));
                                        }
                                    }
                                    break;
                                case 'text-bottom':
                                    if (textBottom) {
                                        if (item !== textBottom) {
                                            item.anchor('bottom', textBottom.documentId);
                                        }
                                    }
                                    else {
                                        if (textBaseline === null) {
                                            textBaseline = $NodeList.baseline(items, true)[0];
                                        }
                                        if (textBaseline && textBaseline !== item) {
                                            item.anchor('bottom', textBaseline.documentId);
                                        }
                                    }
                                    break;
                                case 'sub':
                                    if (!item.baselineAltered) {
                                        item.modifyBox($enum.BOX_STANDARD.MARGIN_BOTTOM, Math.ceil(item.fontSize * this.localSettings.deviations.subscriptBottomOffset) * -1);
                                    }
                                case 'bottom':
                                    if (documentId !== '' && !$util.withinRange(node.bounds.height, item.bounds.height)) {
                                        if (!node.hasHeight && documentId === 'true') {
                                            if (!alignmentMultiLine) {
                                                node.css('height', $css.formatPX(node.bounds.height), true);
                                            }
                                            else if (baselineActive) {
                                                documentId = baselineActive.documentId;
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
                    }
                    if (baseline) {
                        baseline.baselineActive = true;
                        if (baselineAlign.length) {
                            adjustBaseline(baseline, baselineAlign);
                        }
                        if (baseline.textElement && maxCenterHeight > baseline.actualHeight) {
                            baseline.anchor('centerVertical', 'true');
                            baseline = undefined;
                        }
                    }
                    else if (baselineAlign.length && baselineAlign.length < items.length) {
                        textBottom = getTextBottom(items);
                        if (textBottom) {
                            for (const item of baselineAlign) {
                                if (item.baseline && !item.multiline) {
                                    item.anchor('bottom', textBottom.documentId);
                                }
                            }
                        }
                    }
                    checkSingleLine(items[items.length - 1]);
                }
                else {
                    baseline = items[0];
                    baseline.baselineActive = true;
                }
                if (i > 0) {
                    if (previousBaseline === undefined) {
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
                            item.anchor('topBottom', previousBaseline.documentId);
                        }
                    }
                }
                previousBaseline = baseline;
            }
        });
        if (alignmentMultiLine) {
            node.horizontalRows = $util.concatArray(rowsLeft, rowsRight);
        }
        if (sortPositionAuto) {
            const renderChildren = node.renderChildren as T[];
            const renderTemplates = node.renderTemplates as NodeTemplate<T>[];
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
        const baseline = $NodeList.baseline(children)[0] as T | undefined;
        const textBaseline = $NodeList.baseline(children, true)[0] as T | undefined;
        const reverse = node.hasAlign($enum.NODE_ALIGNMENT.RIGHT);
        const textBottom = getTextBottom(children);
        const { anchorStart, anchorEnd, chainStart, chainEnd } = getAnchorDirection(reverse);
        let bias = 0;
        let tallest: T | undefined;
        let bottom: T | undefined;
        switch (node.cssInitial('textAlign')) {
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
        function setParentVertical(item: T) {
            item.anchorParent(AXIS_ANDROID.VERTICAL);
            item.anchorStyle(AXIS_ANDROID.VERTICAL);
        }
        for (let i = 0; i < children.length; i++) {
            const item = children[i];
            if (i === 0) {
                item.anchor(anchorStart, 'parent');
                item.anchorStyle(AXIS_ANDROID.HORIZONTAL, 'packed', bias);
            }
            else {
                const previous = children[i - 1];
                previous.anchor(chainEnd, item.documentId);
                item.anchor(chainStart, previous.documentId);
                if (i === children.length - 1) {
                    item.anchor(anchorEnd, 'parent');
                }
            }
            if (item !== baseline) {
                if (item.inlineVertical) {
                    if (tallest === undefined || getMaxHeight(item) > getMaxHeight(tallest)) {
                        tallest = item;
                    }
                    let alignTop = false;
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
                                item.anchorParent(AXIS_ANDROID.VERTICAL);
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
                                for (let j = 0; j < children.length; j++) {
                                    const child = children[j];
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
                            if (baseline) {
                                item.anchor('baseline', baseline.documentId);
                            }
                            break;
                        case 'sub':
                        case 'super':
                            alignTop = true;
                            break;
                        default:
                            setParentVertical(item);
                            break;
                    }
                    if (alignTop) {
                        setParentVertical(item);
                        item.modifyBox($enum.BOX_STANDARD.MARGIN_TOP, item.linear.top - node.box.top);
                        item.baselineAltered = true;
                    }
                }
                else if (baseline && item.plainText && item.baseline) {
                    item.anchor('baseline', baseline.documentId);
                }
                else {
                    setParentVertical(item);
                }
                item.anchored = true;
            }
            else {
                baseline.baselineActive = true;
            }
            Controller.setConstraintDimension(item);
        }
        if (baseline) {
            if (tallest && tallest !== baseline && baseline.textElement && getMaxHeight(tallest) > getMaxHeight(baseline)) {
                switch (tallest.verticalAlign) {
                    case 'middle':
                        baseline.anchorParent(AXIS_ANDROID.VERTICAL, true);
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
                            baseline.modifyBox($enum.BOX_STANDARD.MARGIN_BOTTOM, Math.ceil(baseline.fontSize * this.localSettings.deviations.subscriptBottomOffset) * -1);
                        }
                        break;
                    case 'super':
                        if (!tallest.textElement) {
                            baseline.anchor('bottom', tallest.documentId);
                            baseline.modifyBox($enum.BOX_STANDARD.MARGIN_TOP, Math.ceil(baseline.fontSize * this.localSettings.deviations.superscriptTopOffset) * -1);
                        }
                        break;
                }
            }
            else {
                setParentVertical(baseline);
            }
            baseline.anchored = true;
        }
    }

    protected processConstraintColumn(node: T, children: T[]) {
        let items: T[] = [];
        const rows: T[][] = [items];
        for (let i = 0; i < children.length; i++) {
            const item = children[i];
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
        const columnGap = $util.convertFloat(node.css('columnGap')) || $css.getFontSize(document.body) || 16;
        const columnWidth = node.toFloat('columnWidth');
        const columnCount = node.toInt('columnCount');
        const columnSized = columnWidth > 0 ? Math.floor(node.actualWidth / columnWidth) : Number.POSITIVE_INFINITY;
        let previousRow: T | undefined;
        function setColumnHorizontal(seg: T[]) {
            const rowStart = seg[0];
            const rowEnd = seg[seg.length - 1];
            for (let i = 0; i < seg.length; i++) {
                const item = seg[i];
                if (i > 0) {
                    item.anchor('leftRight', seg[i - 1].documentId);
                }
                if (i < seg.length - 1) {
                    item.anchor('rightLeft', seg[i + 1].documentId);
                }
                item.anchored = true;
            }
            rowStart.anchor('left', 'parent');
            rowEnd.anchor('right', 'parent');
            rowStart.anchorStyle(AXIS_ANDROID.HORIZONTAL, 'spread_inside');
        }
        function setColumnVertical(partition: T[][], lastRow: boolean) {
            const rowStart = partition[0][0];
            for (let i = 0; i < partition.length; i++) {
                const seg = partition[i];
                for (let j = 0; j < seg.length; j++) {
                    const item = seg[j];
                    if (j === 0) {
                        if (i === 0) {
                            if (previousRow) {
                                previousRow.anchor('bottomTop', item.documentId);
                                item.anchor('topBottom', previousRow.documentId);
                            }
                            else {
                                item.anchor('top', 'parent');
                                item.anchorStyle(AXIS_ANDROID.VERTICAL);
                            }
                        }
                        else {
                            item.anchor('top', rowStart.documentId);
                            item.anchorStyle(AXIS_ANDROID.VERTICAL);
                            item.modifyBox($enum.BOX_STANDARD.MARGIN_TOP);
                        }
                    }
                    else {
                        seg[j - 1].anchor('bottomTop', item.documentId);
                        item.anchor('topBottom', seg[j - 1].documentId);
                    }
                    if (j > 0) {
                        item.anchor('left', seg[0].documentId);
                    }
                    if (j === seg.length - 1) {
                        if (lastRow) {
                            item.anchor('bottom', 'parent');
                        }
                        else if (i > 0 && !item.multiline) {
                            const adjacent = partition[i - 1][j];
                            if (adjacent && !adjacent.multiline && $util.withinRange(item.bounds.top, adjacent.bounds.top)) {
                                item.anchor('top', adjacent.documentId);
                                item.modifyBox($enum.BOX_STANDARD.MARGIN_TOP, -adjacent.marginTop);
                            }
                        }
                    }
                    item.anchored = true;
                    item.positioned = true;
                }
            }
        }
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowStart = row[0];
            if (row.length === 1) {
                if (i === 0) {
                    rowStart.anchor('top', 'parent');
                    rowStart.anchorStyle(AXIS_ANDROID.VERTICAL);
                }
                else if (previousRow) {
                    previousRow.anchor('bottomTop', rowStart.documentId);
                    rowStart.anchor('topBottom', previousRow.documentId);
                }
                if (node.rightAligned) {
                    node.anchor('right', 'parent');
                }
                else if (node.centerAligned) {
                    node.anchorParent(AXIS_ANDROID.HORIZONTAL);
                }
                else {
                    node.anchor('left', 'parent');
                }
                if (i === rows.length - 1) {
                    rowStart.anchor('bottom', 'parent');
                }
                else {
                    previousRow = row[0];
                }
            }
            else {
                const columns: T[][] = [];
                let columnMin = Math.min(row.length, columnSized, columnCount || Number.POSITIVE_INFINITY);
                let perRowCount = row.length >= columnMin ? Math.ceil(row.length / columnMin) : 1;
                let maxHeight = Math.floor(row.reduce((a, b) => a + b.bounds.height, 0) / columnMin);
                let excessCount = perRowCount > 1 && row.length % columnMin !== 0 ? row.length - columnMin : Number.POSITIVE_INFINITY;
                let totalGap = 0;
                for (let j = 0, k = 0, l = 0; j < row.length; j++, l++) {
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
                    if (columns[k].length === 1 && /H\d/.test(column.tagName) && j === row.length - 2) {
                        columnMin--;
                        excessCount = 0;
                    }
                    else if (row.length - j === columnMin - k && excessCount !== Number.POSITIVE_INFINITY) {
                        perRowCount = 1;
                    }
                }
                const percentGap = columnMin > 1 ? Math.max(((totalGap + (columnGap * (columnMin - 1))) / node.box.width) / columnMin, 0.01) : 0;
                const horizontal: T[] = [];
                for (let j = 0; j < columns.length; j++) {
                    const columnStart = columns[j][0];
                    horizontal.push(columnStart);
                    for (const item of columns[j]) {
                        item.android('layout_width', '0px');
                        item.app('layout_constraintWidth_percent', $math.truncate((1 / columnMin) - percentGap, this.localSettings.precision.standardFloat));
                    }
                }
                const columnHeight: number[] = new Array(columns.length).fill(0);
                for (let j = 0; j < columns.length; j++) {
                    const item = columns[j];
                    if (j < columns.length - 1 && item.length > 1) {
                        const columnEnd = item[item.length - 1];
                        if (/H\d/.test(columnEnd.tagName)) {
                            item.pop();
                            horizontal[j + 1] = columnEnd;
                            columns[j + 1].unshift(columnEnd);
                            columnEnd.modifyBox($enum.BOX_STANDARD.MARGIN_TOP);
                        }
                    }
                    const elements: Element[] = [];
                    for (let k = 0; k < item.length; k++) {
                        const column = item[k];
                        if (column.naturalElement) {
                            elements.push(<Element> (<Element> column.element).cloneNode(true));
                        }
                        else {
                            columnHeight[j] += column.linear.height;
                        }
                    }
                    if (elements.length) {
                        const container = document.createElement('div');
                        container.style.width = $css.formatPX(columnWidth || node.box.width / columnMin);
                        container.style.visibility = 'hidden';
                        for (const element of elements) {
                            container.appendChild(element);
                        }
                        document.body.appendChild(container);
                        columnHeight[j] += container.getBoundingClientRect().height;
                        document.body.removeChild(container);
                    }
                }
                for (let j = 0; j < horizontal.length; j++) {
                    const item = horizontal[j];
                    if (j > 0) {
                        item.modifyBox($enum.BOX_STANDARD.MARGIN_LEFT, columnGap);
                    }
                }
                setColumnHorizontal(horizontal);
                setColumnVertical(columns, i === rows.length - 1);
                maxHeight = 0;
                for (let j = 0; j < columnHeight.length; j++) {
                    if (columnHeight[j] >= maxHeight) {
                        previousRow = columns[j].pop() as T;
                        maxHeight = columnHeight[j];
                    }
                }
            }
        }
    }

    protected processConstraintChain(node: T, children: T[]) {
        const documentParent = $NodeList.actualParent(children) || node;
        const horizontal = $NodeList.partitionRows(children);
        const floating = node.hasAlign($enum.NODE_ALIGNMENT.FLOAT);
        if (horizontal.length > 1) {
            node.horizontalRows = horizontal;
        }
        if (!node.hasWidth && children.some(item => item.has('width', $enum.CSS_STANDARD.PERCENT))) {
            node.android('layout_width', 'match_parent');
        }
        const previousSiblings: T[] = [];
        let bottomFloating = false;
        for (let i = 0; i < horizontal.length; i++) {
            const partition = horizontal[i];
            const previousRow = horizontal[i - 1];
            const [floatingRight, floatingLeft] = $util.partitionArray(partition, item => item.float === 'right' || item.autoMargin.left);
            let aboveRowEnd: T | undefined;
            let currentRowBottom: T | undefined;
            [floatingLeft, floatingRight].forEach(seg => {
                if (seg.length === 0) {
                    return;
                }
                const reverse = seg === floatingRight;
                const { anchorStart, anchorEnd, chainStart, chainEnd } = getAnchorDirection(reverse);
                const rowStart = seg[0];
                const rowEnd = seg[seg.length - 1];
                rowStart.anchor(anchorStart, 'parent');
                if (!floating && documentParent.css('textAlign') === 'center') {
                    rowStart.anchorStyle(AXIS_ANDROID.HORIZONTAL, 'spread');
                }
                else if (seg.length > 1) {
                    if (reverse) {
                        rowEnd.anchorStyle(AXIS_ANDROID.HORIZONTAL, 'packed', 1);
                    }
                    else {
                        rowStart.anchorStyle(AXIS_ANDROID.HORIZONTAL);
                    }
                }
                if (seg.length > 1 || rowEnd.autoMargin.leftRight) {
                    rowEnd.anchor(anchorEnd, 'parent');
                }
                for (let j = 0; j < seg.length; j++) {
                    const chain = seg[j];
                    const previous = seg[j - 1];
                    const next = seg[j + 1];
                    if (i === 0) {
                        chain.anchor('top', 'parent');
                    }
                    else if (!bottomFloating && i === horizontal.length - 1) {
                        chain.anchor('bottom', 'parent');
                    }
                    if (chain.autoMargin.leftRight) {
                        chain.anchorParent(AXIS_ANDROID.HORIZONTAL);
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
                                        if (reverse && Math.ceil(aboveBefore.linear[anchorEnd]) - Math.floor(documentParent.box[anchorEnd]) < chain.linear.width) {
                                            continue;
                                        }
                                        const adjacent = previousSiblings[k + 1];
                                        chain.anchor(anchorStart, adjacent.documentId, true);
                                        if (reverse) {
                                            chain.modifyBox($enum.BOX_STANDARD.MARGIN_RIGHT, -adjacent.marginRight, false);
                                        }
                                        else {
                                            chain.modifyBox($enum.BOX_STANDARD.MARGIN_LEFT, -adjacent.marginLeft, false);
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
                $util.concatMultiArray(previousSiblings, floatingLeft, floatingRight);
            }
            if (i > 0) {
                if (aboveRowEnd === undefined) {
                    aboveRowEnd = previousRow[0];
                    for (let k = 1; k < previousRow.length; k++) {
                        if (previousRow[k].linear.bottom >= aboveRowEnd.linear.bottom) {
                            aboveRowEnd = previousRow[k];
                        }
                    }
                }
                if (currentRowBottom === undefined) {
                    currentRowBottom = partition[0];
                    for (let k = 1; k < partition.length; k++) {
                        if (partition[k].linear.bottom >= currentRowBottom.linear.bottom) {
                            currentRowBottom = partition[k];
                        }
                    }
                    bottomFloating = false;
                }
                currentRowBottom.anchor('topBottom', aboveRowEnd.documentId);
                aboveRowEnd.anchor('bottomTop', currentRowBottom.documentId);
                for (const chain of partition) {
                    if (chain !== currentRowBottom) {
                        chain.anchor('top', currentRowBottom.documentId);
                        if (!chain.autoMargin.topBottom) {
                            chain.anchorStyle(AXIS_ANDROID.VERTICAL, 'packed', chain.autoMargin.top ? 1 : 0);
                        }
                        chain.modifyBox($enum.BOX_STANDARD.MARGIN_TOP, currentRowBottom.marginTop * -1);
                    }
                }
            }
        }
        this.evaluateAnchors(children);
    }

    private withinParentBottom(pageFlow: boolean, bottom: number, boxBottom: number) {
        return $util.withinRange(bottom, boxBottom, this.localSettings.deviations.constraintParentBottomOffset) || pageFlow && bottom > boxBottom;
    }

    get userSettings() {
        return this.application.userSettings as UserSettingsAndroid;
    }

    get containerTypeHorizontal(): LayoutType {
        return {
            containerType: CONTAINER_NODE.LINEAR,
            alignmentType: $enum.NODE_ALIGNMENT.HORIZONTAL,
            renderType: 0
        };
    }

    get containerTypeVertical(): LayoutType {
        return {
            containerType: CONTAINER_NODE.LINEAR,
            alignmentType: $enum.NODE_ALIGNMENT.VERTICAL,
            renderType: 0
        };
    }

    get containerTypeVerticalMargin(): LayoutType {
        return {
            containerType: CONTAINER_NODE.FRAME,
            alignmentType: $enum.NODE_ALIGNMENT.COLUMN,
            renderType: 0
        };
    }

    get containerTypePercent(): LayoutType {
        return {
            containerType: CONTAINER_NODE.CONSTRAINT,
            alignmentType: $enum.NODE_ALIGNMENT.HORIZONTAL,
            renderType: 0
        };
    }

    get afterInsertNode(): BindGeneric<T, void> {
        const settings = this.userSettings;
        return (target: T) => {
            target.localSettings = {
                targetAPI: settings.targetAPI !== undefined ? settings.targetAPI : BUILD_ANDROID.LATEST,
                supportRTL: settings.supportRTL !== undefined ? settings.supportRTL : true,
                floatPrecision: this.localSettings.precision.standardFloat
            };
        };
    }
}