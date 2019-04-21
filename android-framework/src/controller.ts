import { ControllerSettings, LayoutType, NodeTagXml, NodeXmlTemplate, ViewData } from '../../src/base/@types/application';
import { UserSettingsAndroid } from './@types/application';
import { ViewAttribute } from './@types/node';

import Resource from './resource';
import View from './view';
import ViewGroup from './viewgroup';

import { AXIS_ANDROID, BOX_ANDROID, CONTAINER_ANDROID } from './lib/constant';
import { BUILD_ANDROID, CONTAINER_NODE } from './lib/enumeration';
import { createViewAttribute, getRootNs } from './lib/util';

import $Layout = squared.base.Layout;
import $NodeList = squared.base.NodeList;

const $enum = squared.base.lib.enumeration;
const $color = squared.lib.color;
const $dom = squared.lib.dom;
const $math = squared.lib.math;
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
            const above = a.node;
            const below = b.node;
            if (above.intersectX(below.bounds, 'bounds') && above.intersectY(below.bounds, 'bounds')) {
                if (above.depth === below.depth) {
                    if (above.documentParent === below.documentParent) {
                        if (above.zIndex === below.zIndex) {
                            return above.siblingIndex < below.siblingIndex ? -1 : 1;
                        }
                        return above.zIndex < below.zIndex ? -1 : 1;
                    }
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
    for (const node of nodes) {
        if (node !== baseline && !node.baselineAltered) {
            if (!node.textElement && node.actualHeight > baseline.actualHeight) {
                if ($util.withinRange(node.linear.top, node.documentParent.box.top)) {
                    node.anchor('top', 'true');
                }
            }
            else if (node.imageElement && baseline.imageElement) {
                if (node.actualHeight < baseline.actualHeight && node.baseline) {
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
}

function checkSingleLine(node: View, nowrap = false, multiline = false) {
    if (node.textElement && node.cssAscend('textAlign', true) !== 'center' && !node.hasWidth && (!node.multiline || multiline) && (nowrap || node.textContent.trim().split(String.fromCharCode(32)).length)) {
        node.android('maxLines', '1');
        node.android('ellipsize', 'end');
    }
}

function adjustDocumentRootOffset(value: number, parent: View, direction: string, boxReset = false) {
    if (value > 0) {
        if (boxReset) {
            value -= parent[`padding${direction}`];
        }
        if (parent.documentBody) {
            value -= parent[`margin${direction}`];
        }
        return Math.max(value, 0);
    }
    return value;
}

function adjustFloatingNegativeMargin(node: View, previous: View) {
    if (previous.float === 'left') {
        if (previous.marginRight < 0) {
            const right = Math.abs(previous.marginRight);
            node.modifyBox($enum.BOX_STANDARD.MARGIN_LEFT, (previous.actualWidth + (previous.hasWidth ? previous.paddingLeft + previous.borderLeftWidth : 0)) - right);
            node.anchor('left', previous.documentId);
            previous.modifyBox($enum.BOX_STANDARD.MARGIN_RIGHT, null);
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
            previous.modifyBox($enum.BOX_STANDARD.MARGIN_LEFT, null);
            return true;
        }
    }
    return false;
}

function constraintMinMax(node: View, dimension: string) {
    const dimensionA = $util.capitalize(dimension);
    const minWH = node.cssInitial(`min${dimensionA}`);
    const maxWH = node.cssInitial(`max${dimensionA}`);
    if ($util.isLength(minWH)) {
        node.app(`layout_constraint${dimensionA}_min`, minWH);
        if (dimension === 'width' && !node.blockStatic && !node.has('width') && node.ascend(false, item => item.has('width') || item.blockStatic).length > 0) {
            node.android(`layout_${dimension}`, '0px', false);
        }
    }
    if ($util.isLength(maxWH)) {
        node.app(`layout_constraint${dimensionA}_max`, maxWH);
        if (dimension === 'width' && node.blockStatic && !node.has('width') && node.ascend(false, item => item.has('width') || item.blockStatic).length > 0) {
            node.android(`layout_${dimension}`, '0px', false);
        }
    }
}

function constraintPercentValue(node: View, dimension: string, opposing: boolean) {
    const value = node.cssInitial(dimension);
    if (opposing) {
        if ($util.isLength(value, true)) {
            const horizontal = dimension === 'width';
            node.android(`layout_${dimension}`, $util.formatPX(node.bounds[dimension]), false);
            if (node.imageElement) {
                const element = <HTMLImageElement> node.element;
                if (element && element.naturalWidth > 0 && element.naturalHeight > 0) {
                    const opposingUnit = (node.bounds[dimension] / (horizontal ? element.naturalWidth : element.naturalHeight)) * (horizontal ? element.naturalHeight : element.naturalWidth);
                    node.android(`layout_${horizontal ? 'height' : 'width'}`, $util.formatPX(opposingUnit), false);
                }
            }
            return true;
        }
    }
    else if ($util.isPercent(value) && value !== '100%') {
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
    else if ($util.isLength(node.cssInitial('height'), true)) {
        node.android('layout_height', $util.formatPX(node.bounds.height), false);
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
    return $util.filterArray(nodes, node => node.verticalAlign === 'text-bottom').sort((a, b) => {
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
    public static evaluateAnchors<T extends View>(nodes: T[]) {
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
                    if (position.horizontal && horizontal.find(item => item.documentId === position.documentId)) {
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
                    if (!position.horizontal && vertical.find(item => item.documentId === position.documentId)) {
                        node.constraint.vertical = true;
                        vertical.push(node);
                        i = -1;
                        break;
                    }
                }
            }
        }
    }

    public static setConstraintDimension<T extends View>(node: T, single = false) {
        constraintPercentWidth(node);
        constraintPercentHeight(node);
        constraintMinMax(node, 'width');
        constraintMinMax(node, 'height');
        if (single) {
            if (node.rightAligned) {
                node.anchor('right', 'parent');
            }
            else if (node.centerAligned) {
                node.anchorParent(AXIS_ANDROID.HORIZONTAL);
            }
            else {
                node.anchor('left', 'parent');
            }
        }
    }

    public static setFlexDimension<T extends View>(node: T, dimension: string) {
        const horizontal = dimension === 'width';
        const flexbox = node.flexbox;
        const basis = flexbox.basis;
        const dimensionA = $util.capitalize(dimension);
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
                    node.app(`layout_constraint${dimensionA}_min`, $util.formatPX((1 - flexbox.shrink) * parseFloat(value)));
                    node.app(`layout_constraint${dimensionA}_max`, value);
                }
                else {
                    node.app(`layout_constraint${dimensionA}_min`, value);
                }
            }
        }
        if ($util.isLength(basis)) {
            setFlexGrow(node.convertPX(basis), node.flexbox.grow);
        }
        else if ($util.isPercent(basis) && basis !== '0%') {
            node.app(`layout_constraint${dimensionA}_percent`, (parseFloat(basis) / 100).toPrecision(node.localSettings.floatPrecision));
            setFlexGrow('', node.flexbox.grow);
        }
        else if (flexbox.grow > 0) {
            setFlexGrow(node.has(dimension, $enum.CSS_STANDARD.LENGTH) ? $util.formatPX(node[`actual${dimensionA}`]) : '', node.flexbox.grow);
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
        constraintMinMax(node, 'width');
        if (horizontal) {
            constraintPercentHeight(node, true);
        }
        else {
            constraintPercentWidth(node, true);
        }
        constraintMinMax(node, 'height');
    }

    public readonly localSettings: ControllerSettings = {
        layout: {
            pathName: 'res/layout',
            fileExtension: 'xml',
            baseTemplate: $xml.STRING_XMLENCODING
        },
        svg: {
            enabled: false
        },
        supported: {
            imageFormat: ['jpg', 'png', 'gif', 'bmp', 'webp', 'ico', 'cur']
        },
        unsupported: {
            excluded: new Set(['BR']),
            tagName: new Set(['OPTION', 'INPUT:hidden', 'MAP', 'AREA', 'SOURCE'])
        },
        precision: {
            standardFloat: 4
        },
        deviations: {
            constraintParentBottomOffset: 3.5,
            subscriptBottomOffset: 0.25,
            superscriptTopOffset: 0.25,
            legendBottomOffset: 0.25
        }
    };

    public finalize(data: ViewData) {
        for (const name in data) {
            for (const view of data[name]) {
                view.content = $xml.replaceTab(view.content.replace(/{#0}/, getRootNs(view.content)), this.userSettings.insertSpaces);
            }
        }
    }

    public processUnknownParent(layout: $Layout<T>) {
        const { node, parent } = layout;
        let next = false;
        let renderAs: T | undefined;
        if (node.has('columnCount') || node.has('columnWidth')) {
            layout.setType(CONTAINER_NODE.CONSTRAINT, $enum.NODE_ALIGNMENT.COLUMN, $enum.NODE_ALIGNMENT.AUTO_LAYOUT);
        }
        else if (layout.some(item => !item.pageFlow)) {
            layout.setType(CONTAINER_NODE.CONSTRAINT, $enum.NODE_ALIGNMENT.ABSOLUTE, $enum.NODE_ALIGNMENT.UNKNOWN);
        }
        else if (layout.length === 1) {
            const child = node.item(0) as T;
            if (node.documentRoot && isTargeted(node, child)) {
                node.hide();
                next = true;
            }
            else if (node.naturalElement && child.plainText && (<Element> node.element).children.length === 0) {
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
                !node.marginTop &&
                !node.marginBottom &&
                !node.hasWidth &&
                !node.hasHeight &&
                !node.visibleStyle.padding &&
                !node.visibleStyle.background &&
                !node.rightAligned &&
                !node.autoMargin.horizontal &&
                !node.autoMargin.vertical &&
                !node.companion &&
                !node.has('maxWidth') &&
                !node.has('maxHeight') &&
                !node.has('textAlign') &&
                !node.has('verticalAlign') &&
                (!node.has('lineHeight') || child.length > 0) &&
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
                node.innerChild = child;
                child.outerParent = node;
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
            layout.setType(layout.some(item => item.positionRelative && !item.positionAuto) ? CONTAINER_NODE.RELATIVE : CONTAINER_NODE.LINEAR, $enum.NODE_ALIGNMENT.VERTICAL, $enum.NODE_ALIGNMENT.UNKNOWN);
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
            layout.setType(layout.some(item => item.positionRelative && !item.positionStatic) ? CONTAINER_NODE.RELATIVE : CONTAINER_NODE.LINEAR, $enum.NODE_ALIGNMENT.VERTICAL, node.documentRoot ? $enum.NODE_ALIGNMENT.UNKNOWN : 0);
        }
        else if (layout.every(item => item.inlineFlow)) {
            if (this.checkFrameHorizontal(layout)) {
                layout.renderType |= $enum.NODE_ALIGNMENT.FLOAT | $enum.NODE_ALIGNMENT.HORIZONTAL;
            }
            else {
                layout.setType(CONTAINER_NODE.RELATIVE, $enum.NODE_ALIGNMENT.HORIZONTAL, $enum.NODE_ALIGNMENT.UNKNOWN);
            }
        }
        else if (layout.some(item => item.alignedVertically(item.previousSiblings(), item.siblingIndex > 0 ? layout.children.slice(0, item.siblingIndex) : undefined, layout.cleared))) {
            layout.setType(CONTAINER_NODE.LINEAR, $enum.NODE_ALIGNMENT.VERTICAL, $enum.NODE_ALIGNMENT.UNKNOWN);
        }
        else {
            layout.setType(CONTAINER_NODE.CONSTRAINT, $enum.NODE_ALIGNMENT.UNKNOWN);
        }
        return { layout, next, renderAs };
    }

    public processUnknownChild(layout: $Layout<T>) {
        const node = layout.node;
        let next = false;
        if (layout.containerType === 0) {
            const style = node.visibleStyle;
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
            layout.setType(CONTAINER_NODE.LINEAR, $enum.NODE_ALIGNMENT.VERTICAL);
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
        return (layout.node.cssInitialAny('textAlign', 'center', 'end', 'right') || !layout.parent.hasHeight && layout.some(node => node.verticalAlign === 'middle' || node.verticalAlign === 'bottom')) && layout.singleRowAligned && layout.every(node => node.positiveAxis || node.renderExclude);
    }

    public checkRelativeHorizontal(layout: $Layout<T>) {
        if (layout.floated.size === 2 || layout.every(node => node.imageElement && node.baseline && !node.positionRelative)) {
            return false;
        }
        return layout.some(node => node.positionRelative || node.textElement || node.imageElement || !node.baseline);
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
                                if (!item.positionAuto && item.leftTopAxis) {
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
                                            item.modifyBox($enum.BOX_STANDARD.MARGIN_LEFT, adjustDocumentRootOffset(item.left, node, 'Left', true));
                                        }
                                        if (item.has('right') && (!item.hasWidth || !item.has('left'))) {
                                            item.anchor('right', 'parent');
                                            item.modifyBox($enum.BOX_STANDARD.MARGIN_RIGHT, adjustDocumentRootOffset(item.right, node, 'Right', true));
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
                                            item.modifyBox($enum.BOX_STANDARD.MARGIN_TOP, adjustDocumentRootOffset(item.top, node, 'Top', true));
                                        }
                                        if (item.has('bottom') && (!item.hasHeight || !item.has('top'))) {
                                            item.anchor('bottom', 'parent');
                                            item.modifyBox($enum.BOX_STANDARD.MARGIN_BOTTOM, adjustDocumentRootOffset(item.bottom, node, 'Bottom', true));
                                        }
                                    }
                                    item.positioned = true;
                                }
                            }
                        }
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
                            for (const item of pageFlow) {
                                if (item.autoMargin.leftRight || (item.inlineStatic && item.cssAscend('textAlign', true) === 'center')) {
                                    item.anchorParent(AXIS_ANDROID.HORIZONTAL);
                                }
                                else if (item.rightAligned && item.outerParent === undefined) {
                                    item.anchor('right', 'parent');
                                }
                                else if ($util.withinRange(item.linear.left, node.box.left) || item.linear.left < node.box.left) {
                                    item.anchor('left', 'parent');
                                }
                                if ($util.withinRange(item.linear.top, node.box.top) || item.linear.top < node.box.top) {
                                    item.anchor('top', 'parent');
                                }
                                if (this.withinParentBottom(item.pageFlow, item.linear.bottom, bottomParent) && item.actualParent && !item.actualParent.documentBody && !item.has('height', $enum.CSS_STANDARD.PERCENT, { not: '100%' })) {
                                    item.anchor('bottom', 'parent');
                                    if (item.alignParent('top')) {
                                        item.anchorStyle(AXIS_ANDROID.VERTICAL, 'packed', 0, false);
                                    }
                                }
                                Controller.setConstraintDimension(item);
                            }
                        }
                        Controller.evaluateAnchors(pageFlow);
                        for (const item of children) {
                            if (!item.anchored) {
                                this.addGuideline(item, node);
                                if (item.pageFlow) {
                                    Controller.evaluateAnchors(pageFlow);
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
            node.alignmentType |= alignmentType;
            node.setControlType(View.getControlName(containerType), containerType);
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
                    if (node.hasResource($enum.NODE_RESOURCE.IMAGE_SOURCE)) {
                        const element = <HTMLImageElement> node.element;
                        const widthPercent = node.has('width', $enum.CSS_STANDARD.PERCENT);
                        const heightPercent = node.has('height', $enum.CSS_STANDARD.PERCENT);
                        let width = node.toFloat('width');
                        let height = node.toFloat('height');
                        let scaleType = 'fitXY';
                        const setWidth = () => {
                            const image = this.application.session.image.get(element.src);
                            if (image && image.width > 0 && image.height > 0) {
                                width = image.width * (height / image.height);
                                node.css('width', $util.formatPX(width), true);
                            }
                            else {
                                node.android('adjustViewBounds', 'true');
                            }
                        };
                        const setHeight = () => {
                            const image = this.application.session.image.get(element.src);
                            if (image && image.width > 0 && image.height > 0) {
                                height = image.height * (width / image.width);
                                node.css('height', $util.formatPX(height), true);
                            }
                            else {
                                node.android('adjustViewBounds', 'true');
                            }
                        };
                        if (widthPercent || heightPercent) {
                            if (!parent.layoutConstraint) {
                                if (widthPercent) {
                                    width *= parent.box.width / 100;
                                    if (width < 100) {
                                        node.css('width', $util.formatPX(width));
                                    }
                                    if (height === 0) {
                                        setHeight();
                                    }
                                }
                                if (heightPercent && height < 100) {
                                    height *= parent.box.height / 100;
                                    if (height < 100) {
                                        node.css('height', $util.formatPX(height));
                                    }
                                    if (width === 0) {
                                        setWidth();
                                    }
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
                        if (width === 0 && height > 0) {
                            setWidth();
                        }
                        if (height === 0 && width > 0) {
                            setHeight();
                        }
                        if (node.baseline) {
                            node.android('baselineAlignBottom', 'true');
                        }
                        const src = Resource.addImageSrc(element);
                        if (src !== '') {
                            node.android('src', `@drawable/${src}`);
                        }
                        if (!node.pageFlow && (node.left < 0 || node.top < 0) && node.absoluteParent && node.absoluteParent.css('overflow') === 'hidden') {
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
                                container.android('layout_width', width < parent.box.width ? $util.formatPX(width) : 'match_parent');
                            }
                            else {
                                container.android('layout_width', 'wrap_content');
                            }
                            if (height > 0) {
                                container.android('layout_height', height < parent.box.height ? $util.formatPX(height) : 'match_parent');
                            }
                            else {
                                container.android('layout_height', 'wrap_content');
                            }
                            container.render(target ? this.application.resolveTarget(target) : parent);
                            container.saveAsInitial();
                            this.application.addRenderTemplate(
                                parent,
                                container,
                                <NodeXmlTemplate<T>> {
                                    type: $enum.NODE_TEMPLATE.XML,
                                    node: container,
                                    controlName: CONTAINER_ANDROID.FRAME
                                }
                            );
                            node.modifyBox($enum.BOX_STANDARD.MARGIN_TOP, node.top);
                            node.modifyBox($enum.BOX_STANDARD.MARGIN_LEFT, node.left);
                            container.innerChild = node;
                            node.outerParent = container;
                            parent = container;
                            layout.parent = container;
                            target = undefined;
                        }
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
                        node.css('width', $util.formatPX(element.cols * 8), true);
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
                        node.css('minWidth', $util.formatPX(node.actualWidth), true);
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
                    node.android('letterSpacing', node.css('letterSpacing'));
                }
                if (node.css('textAlign') === 'justify') {
                    node.android('justificationMode', 'inter_word');
                }
                if (node.has('textShadow')) {
                    const match = /^(rgba?\(\d+, \d+, \d+(?:, [\d.]+)?\)) (-?[\d.]+[a-z]+) (-?[\d.]+[a-z]+)\s*(-?[\d.]+[a-z]+)?$/.exec(node.css('textShadow'));
                    if (match) {
                        const colorName = Resource.addColor($color.parseColor(match[1]));
                        if (colorName !== '') {
                            node.android('shadowColor', `@color/${colorName}`);
                            node.android('shadowDx', $math.truncate($util.parseUnit(match[2], node.fontSize)));
                            node.android('shadowDy', $math.truncate($util.parseUnit(match[3], node.fontSize)));
                            node.android('shadowRadius', match[4] ? $math.truncate($util.parseUnit(match[4], node.fontSize)) : '0');
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
                    node.css('width', $util.formatPX(node.bounds.width), true);
                }
                break;
            case CONTAINER_ANDROID.LINE:
                if (!node.hasHeight) {
                    node.android('layout_height', $util.formatPX(node.contentBoxHeight || 1));
                }
                break;
        }
        if (node.textElement || node.imageElement || node.svgElement) {
            let maxWidth = 0;
            let maxHeight = 0;
            if (node.has('maxWidth')) {
                maxWidth = node.parseUnit(node.css('maxWidth'));
            }
            if (node.has('maxHeight')) {
                maxHeight = node.parseUnit(node.css('maxHeight'), false);
            }
            if (node.imageElement) {
                const image = this.application.session.image.get(node.src);
                if (image) {
                    if (maxWidth > 0 && maxHeight === 0) {
                        maxHeight = image.height * (maxWidth / image.width);
                    }
                    else if (maxHeight > 0 && maxWidth === 0) {
                        maxWidth = image.width * (maxHeight / image.height);
                    }
                    maxWidth = Math.min(maxWidth, image.width);
                    maxHeight = Math.min(maxHeight, image.height);
                    if (maxWidth > 0) {
                        if (node.has('width')) {
                            node.android('layout_width', 'wrap_content');
                            node.android('adjustViewBounds', 'true');
                        }
                        else {
                            if (image.width >= parent.box.width && node.css('maxWidth') === '100%' && parent.has('width')) {
                                node.android('layout_width', 'match_parent');
                            }
                            else if (maxWidth === image.width) {
                                node.android('layout_height', 'wrap_content');
                                node.android('adjustViewBounds', 'true');
                            }
                            else {
                                node.css('width', $util.formatPX(maxWidth), true);
                            }
                            maxWidth = 0;
                        }
                    }
                    if (maxHeight > 0) {
                        if (node.has('height')) {
                            node.android('layout_height', 'wrap_content');
                            node.android('adjustViewBounds', 'true');
                        }
                        else {
                            if (image.height >= parent.box.height && node.css('maxHeight') === '100%' && parent.has('height')) {
                                node.android('layout_height', 'match_parent');
                            }
                            else if (maxHeight === image.height) {
                                node.android('layout_height', 'wrap_content');
                                node.android('adjustViewBounds', 'true');
                            }
                            else {
                                node.css('height', $util.formatPX(maxHeight), true);
                            }
                            maxHeight = 0;
                        }
                    }
                }
            }
            if (maxWidth > 0) {
                node.android('maxWidth', $util.formatPX(maxWidth));
            }
            if (maxHeight > 0) {
                node.android('maxHeight', $util.formatPX(maxHeight));
            }
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

    public renderSpace(width: string, height = '', columnSpan = 0, rowSpan = 0, options?: ViewAttribute) {
        options = createViewAttribute(options);
        if ($util.isPercent(width)) {
            options.android.layout_columnWeight = $math.truncate(parseFloat(width) / 100, this.localSettings.precision.standardFloat);
            width = '0px';
        }
        if ($util.isPercent(height)) {
            options.android.layout_rowWeight = $math.truncate(parseFloat(height) / 100, this.localSettings.precision.standardFloat);
            height = '0px';
        }
        if (columnSpan > 0) {
            options.android.layout_columnSpan = columnSpan.toString();
        }
        if (rowSpan > 0) {
            options.android.layout_rowSpan = rowSpan.toString();
        }
        return this.renderNodeStatic(CONTAINER_ANDROID.SPACE, options, width, height || undefined);
    }

    public addGuideline(node: T, parent: T, orientation = '', percent = false, opposite = false) {
        const documentParent = parent.groupParent && !node.documentParent.hasAlign($enum.NODE_ALIGNMENT.AUTO_LAYOUT) ? parent : node.documentParent as T;
        GUIDELINE_AXIS.forEach(value => {
            if (!node.constraint[value] && (orientation === '' || value === orientation)) {
                const horizontal = value === AXIS_ANDROID.HORIZONTAL;
                const box = documentParent.box;
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
                if (!node.pageFlow && $util.isPercent(node.css(LT))) {
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
                                if (pageFlow || !node.pageFlow && !item.pageFlow) {
                                    if ($util.withinRange(node.bounds[LT], item.bounds[LT])) {
                                        node.anchor(!horizontal && node.textElement && node.baseline && item.textElement && item.baseline ? 'baseline' : LT, item.documentId, true);
                                        valid = true;
                                    }
                                    else if ($util.withinRange(node.bounds[RB], item.bounds[RB])) {
                                        node.anchor(RB, item.documentId, true);
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
                            const previous = previousSiblings[previousSiblings.length - 1];
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
                        if (!node.pageFlow && node.parent === documentParent.outerParent) {
                            location += documentParent[!opposite ? (horizontal ? 'paddingLeft' : 'paddingTop') : (horizontal ? 'paddingRight' : 'paddingBottom')];
                        }
                        beginPercent += 'begin';
                    }
                }
                const guideline = parent.constraint.guideline || {};
                if (!node.pageFlow) {
                    if (node.absoluteParent === node.documentParent) {
                        location = horizontal ? adjustDocumentRootOffset(location, documentParent, 'Left') : adjustDocumentRootOffset(location, documentParent, 'Top', documentParent.valueBox($enum.BOX_STANDARD.PADDING_TOP)[0] === 0);
                    }
                }
                else if (node.inlineVertical) {
                    const verticalAlign = $util.convertFloat(node.verticalAlign);
                    if (verticalAlign < 0) {
                        location += verticalAlign;
                    }
                }
                if (!horizontal && node.marginTop < 0) {
                    location -= node.marginTop;
                    node.modifyBox($enum.BOX_STANDARD.MARGIN_TOP, null);
                }
                node.constraint[value] = true;
                if (location <= 0) {
                    node.anchor(LT, 'parent', true);
                }
                else if (horizontal && documentParent.hasWidth && !node.has('right') && location + bounds.width >= box.right || !horizontal && documentParent.hasHeight && !node.has('bottom') && location + bounds.height >= box.bottom) {
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
                    const options = createViewAttribute({
                        android: {
                            orientation: horizontal ? AXIS_ANDROID.VERTICAL : AXIS_ANDROID.HORIZONTAL
                        },
                        app: {
                            [beginPercent]: usePercent ? location.toString() : $util.formatPX(location)
                        }
                    });
                    this.addAfterOutsideTemplate(node.id, this.renderNodeStatic(CONTAINER_ANDROID.GUIDELINE, options));
                    const documentId: string = options['documentId'];
                    node.anchor(LT, documentId, true);
                    node.anchorDelete(RB);
                    $util.assignEmptyValue(guideline, value, beginPercent, LT, documentId, location.toString());
                    parent.constraint.guideline = guideline;
                }
            }
        });
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
            procedure: $enum.NODE_PROCEDURE.CUSTOMIZATION,
            resource: $enum.NODE_RESOURCE.BOX_STYLE | $enum.NODE_RESOURCE.ASSET
        });
        if (parent) {
            parent.appendTry(node, container);
            node.parent = container;
        }
        else {
            container.innerChild = node;
            container.siblingIndex = node.siblingIndex;
        }
        if (node.renderParent) {
            const renderTemplates = node.renderParent.renderTemplates;
            if (renderTemplates) {
                for (let i = 0; i < renderTemplates.length; i++) {
                    if (renderTemplates[i].node === node) {
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
            borderRadius: '0px',
            display: 'block'
        });
        node.outerParent = container;
        return container;
    }

    protected processRelativeHorizontal(node: T, children: T[]) {
        const rowsLeft: T[][] = [];
        const rowsRight: T[][] = [];
        let alignmentMultiLine = false;
        if (node.hasAlign($enum.NODE_ALIGNMENT.VERTICAL)) {
            for (let i = 0; i < children.length; i++) {
                const item = children[i];
                const previous = children[i - 1];
                if (i === 0) {
                    item.anchor('top', 'true');
                }
                else {
                    item.anchor('topBottom', previous.documentId);
                }
                rowsLeft.push([item]);
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
                }
                return node.box.width - (node.valueBox($enum.BOX_STANDARD.PADDING_LEFT)[1] + node.valueBox($enum.BOX_STANDARD.PADDING_RIGHT)[1]);
            })();
            const maxBoxWidth = Math.min(boxWidth, this.userSettings.maxWordWrapWidth);
            const checkLineWrap = node.css('whiteSpace') !== 'nowrap';
            const cleared = $NodeList.linearData(children, true).cleared;
            const textIndent = node.block || node.blockDimension ? node.toInt('textIndent') : 0;
            let rowWidth = 0;
            let rowPreviousLeft: T | undefined;
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
                for (let i = 0; i < seg.length; i++) {
                    const item = seg[i];
                    const previous = seg[i - 1];
                    let bounds = item.bounds;
                    if (item.inlineText && !item.hasWidth) {
                        const rect = $session.getRangeClientRect(<Element> item.element, item.sessionId);
                        if (rect.multiline > 0 || rect.width < item.box.width) {
                            bounds = rect;
                            if (!item.multiline) {
                                item.multiline = rect.multiline > 0;
                            }
                        }
                    }
                    let multiline = item.multiline;
                    if (multiline && Math.floor(bounds.width) <= maxBoxWidth) {
                        multiline = false;
                    }
                    let alignSibling = leftAlign && leftForward ? 'leftRight' : 'rightLeft';
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
                    if (i === 0) {
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
                            if (rowPreviousLeft && !items.includes(rowPreviousLeft)) {
                                baseWidth += rowPreviousLeft.linear.width;
                            }
                            if (rowPreviousLeft === undefined || !item.plainText || multiline || !items.includes(rowPreviousLeft) || cleared.has(item)) {
                                baseWidth += bounds.width;
                            }
                            if (item.marginRight < 0) {
                                baseWidth += item.marginRight;
                            }
                            maxWidth = ((item.plainText || item.inlineText) && item.textContent.indexOf(' ') !== -1 ? maxBoxWidth : boxWidth);
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
                        siblings = !viewGroup && item.inlineVertical && previous.inlineVertical ? $dom.getElementsBetweenSiblings(previous.element, <Element> item.element, true) : undefined;
                        const startNewRow = () => {
                            if (previous.textElement) {
                                if (i === 1 && siblings === undefined && item.plainText && !$util.REGEXP_COMPILED.TRAILINGSPACE.test(previous.textContent) && !$util.REGEXP_COMPILED.LEADINGSPACE.test(item.textContent)) {
                                    return false;
                                }
                                else if (checkLineWrap && previousMultiline && (previous.bounds.width >= boxWidth || Resource.hasLineBreak(previous, false, true))) {
                                    return true;
                                }
                            }
                            if (previous.floating && rowWidth < maxBoxWidth && previous.alignParent('left')) {
                                return false;
                            }
                            else if (checkLineWrap) {
                                checkWrapWidth();
                                if (baseWidth > maxWidth) {
                                    if (previous && previous.textElement) {
                                        checkSingleLine(previous, true, previousMultiline);
                                    }
                                    return true;
                                }
                                else if (Math.ceil(baseWidth) >= Math.floor(maxWidth) && !item.alignParent(alignParent)) {
                                    checkSingleLine(item, true, multiline);
                                }
                                if (multiline && Resource.hasLineBreak(item) || item.preserveWhiteSpace && $util.REGEXP_COMPILED.LEADINGNEWLINE.test(item.textContent)) {
                                    return true;
                                }
                            }
                            return false;
                        };
                        const textNewRow = item.textElement && startNewRow();
                        if (viewGroup ||
                            textNewRow ||
                            item.linear.top >= previous.linear.bottom && (item.blockStatic || item.floating && previous.float === item.float) ||
                            previous.autoMargin.horizontal ||
                            cleared.has(item) ||
                            !item.textElement && checkWrapWidth() && Math.floor(baseWidth) > maxWidth ||
                            !item.floating && (previous.blockStatic || item.previousSiblings().some(sibling => sibling.lineBreak || sibling.excluded && sibling.blockStatic) || !!siblings && siblings.some(element => $session.causesLineBreak(element, node.sessionId))))
                        {
                            if (leftForward) {
                                if (rowPreviousLeft && item.linear.bottom <= rowPreviousLeft.bounds.bottom) {
                                    if (!anchored) {
                                        item.anchor(alignSibling, rowPreviousLeft.documentId);
                                    }
                                }
                                else {
                                    if (!anchored) {
                                        item.anchor(alignParent, 'true');
                                    }
                                    rowPreviousLeft = undefined;
                                }
                                anchored = true;
                            }
                            else {
                                if (rowPreviousLeft && item.linear.bottom > rowPreviousLeft.bounds.bottom) {
                                    rowPreviousLeft = undefined;
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
                            items.push(item);
                        }
                    }
                    if (item.float === 'left' && leftAlign) {
                        if (rowPreviousLeft) {
                            if (item.linear.bottom >= rowPreviousLeft.linear.bottom) {
                                rowPreviousLeft = item;
                            }
                        }
                        else {
                            rowPreviousLeft = item;
                        }
                    }
                    let previousOffset = 0;
                    if (siblings && !siblings.some(element => !!$session.getElementAsNode(element, item.sessionId) || $session.causesLineBreak(element, item.sessionId))) {
                        const betweenStart = $session.getRangeClientRect(siblings[0], '0');
                        if (!betweenStart.multiline) {
                            const betweenEnd = siblings.length > 1 ? $session.getRangeClientRect(siblings[siblings.length - 1], '0') : undefined;
                            if (betweenEnd === undefined || !betweenEnd.multiline) {
                                previousOffset = betweenEnd ? betweenStart.left - betweenEnd.right : betweenStart.width;
                            }
                        }
                    }
                    rowWidth += previousOffset + item.marginLeft + bounds.width + item.marginRight;
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
                    baseline = baselineItems[0];
                    let textBottom: T | undefined;
                    if (baseline) {
                        textBottom = getTextBottom(items);
                        if (textBottom) {
                            const height = baseline.actualHeight;
                            if (textBottom.actualHeight > height || textBottom.companion && textBottom.companion.actualHeight > height) {
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
                            const baselineActive = item !== baseline ? baseline : undefined;
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
                                                node.css('height', $util.formatPX(node.bounds.height), true);
                                            }
                                            else if (baselineActive) {
                                                documentId = baselineActive.documentId;
                                            }
                                        }
                                        item.anchor('bottom', documentId);
                                    }
                                    break;
                                default:
                                    if (item.verticalAlign !== '0px' && !item.svgElement) {
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
    }

    protected processConstraintHorizontal(node: T, children: T[]) {
        const baseline = $NodeList.baseline(children)[0] as T | undefined;
        const textBaseline = $NodeList.baseline(children, true)[0] as T | undefined;
        const reverse = node.hasAlign($enum.NODE_ALIGNMENT.RIGHT);
        let textBottom = getTextBottom(children);
        let middle: T | undefined;
        let bottom: T | undefined;
        if (baseline) {
            baseline.baselineActive = true;
            if (textBottom && baseline.bounds.height < Math.floor(textBottom.bounds.height)) {
                baseline.anchor('bottom', textBottom.documentId);
            }
            else {
                textBottom = undefined;
            }
        }
        const { anchorStart, anchorEnd, chainStart, chainEnd } = getAnchorDirection(reverse);
        let bias = 0;
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
            if (item.inlineVertical) {
                function setParentVertical() {
                    item.anchorParent(AXIS_ANDROID.VERTICAL);
                    item.anchorStyle(AXIS_ANDROID.VERTICAL);
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
                        if (baseline && !baseline.textElement) {
                            alignTop = true;
                        }
                        else {
                            item.anchorParent(AXIS_ANDROID.VERTICAL);
                            if (!item.textElement && (middle === undefined || getMaxHeight(item) > getMaxHeight(middle))) {
                                middle = item;
                            }
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
                        if (baseline && item !== baseline) {
                            item.anchor('baseline', baseline.documentId);
                        }
                        break;
                    case 'sub':
                    case 'super':
                        alignTop = true;
                        break;
                    default:
                        setParentVertical();
                        break;
                }
                if (alignTop) {
                    setParentVertical();
                    item.modifyBox($enum.BOX_STANDARD.MARGIN_TOP, item.linear.top - node.box.top);
                    item.baselineAltered = true;
                }
            }
            else if (baseline && item !== baseline && item.plainText && item.baseline) {
                item.anchor('baseline', baseline.documentId);
            }
            item.anchored = true;
            item.positioned = true;
        }
        if (middle && baseline && baseline.textElement && getMaxHeight(middle) > getMaxHeight(baseline)) {
            baseline.anchorParent(AXIS_ANDROID.VERTICAL, true);
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
        const columnWidth = node.toFloat('columnWidth');
        const columnGap = $util.convertFloat(node.css('columnGap')) || 16;
        let columnIteration = 0;
        if (columnWidth > 0) {
            let actualWidth = node.actualWidth;
            do {
                actualWidth -= columnWidth;
                if (columnIteration > 0) {
                    actualWidth -= columnGap;
                }
            }
            while (actualWidth > 0 && ++columnIteration);
        }
        const columnCount = Math.max(1, Math.min(node.toInt('columnCount') || Number.POSITIVE_INFINITY, columnIteration || Number.POSITIVE_INFINITY));
        let previous: T | undefined;
        const setColumnHorizontal = (seg: T[]) => {
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
                Controller.setConstraintDimension(item);
                item.anchored = true;
            }
            rowStart.anchor('left', 'parent');
            rowEnd.anchor('right', 'parent');
            rowStart.anchorStyle(AXIS_ANDROID.HORIZONTAL, 'spread_inside');
        };
        const setColumnVertical = (partition: T[][], lastRow: boolean, above?: T) => {
            const rowStart = partition[0][0];
            for (let i = 0; i < partition.length; i++) {
                const seg = partition[i];
                for (let j = 0; j < seg.length; j++) {
                    const item = seg[j];
                    if (j === 0) {
                        if (i === 0) {
                            if (above) {
                                above.anchor('bottomTop', item.documentId);
                                item.anchor('topBottom', above.documentId);
                            }
                            else {
                                item.anchor('top', 'parent');
                            }
                        }
                        else {
                            item.anchor('top', rowStart.documentId);
                            item.modifyBox($enum.BOX_STANDARD.MARGIN_TOP, null);
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
                        if (lastRow && this.withinParentBottom(item.pageFlow, item.linear.bottom, item.documentParent.box.bottom)) {
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
                    Controller.setConstraintDimension(item);
                    item.anchored = true;
                }
                seg[0].anchorStyle(AXIS_ANDROID.VERTICAL);
            }
        };
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowStart = row[0];
            if (row.length === 1) {
                Controller.setConstraintDimension(rowStart, true);
                if (i === 0) {
                    rowStart.anchor('top', 'parent');
                }
                else if (previous) {
                    previous.anchor('bottomTop', rowStart.documentId);
                    rowStart.anchor('topBottom', previous.documentId);
                }
                if (!rowStart.hasWidth) {
                    rowStart.android('layout_width', 'match_parent');
                }
                previous = row[0];
            }
            else {
                let columnMin = Math.min(row.length, columnCount);
                if (row.length > columnCount) {
                    while (row.length / columnMin < 1.5) {
                        columnMin--;
                    }
                }
                const perRowCount = Math.ceil(row.length / columnMin);
                const columns: T[][] = [];
                let totalGap = 0;
                for (let j = 0, k = 0; j < row.length; j++) {
                    const column = row[j];
                    if (j % perRowCount === 0) {
                        if (j > 0) {
                            k++;
                        }
                        if (columns[k] === undefined) {
                            columns[k] = [];
                        }
                    }
                    columns[k].push(column);
                    if (column.length) {
                        totalGap += $math.maxArray($util.objectMap<T, number>(column.children as T[], child => child.marginLeft + child.marginRight));
                    }
                }
                const percentGap = Math.max(((totalGap + (columnGap * (columnMin - 1))) / node.box.width) / columnMin, 0.01);
                const horizontal: T[] = [];
                for (let j = 0; j < columns.length; j++) {
                    const columnStart = columns[j][0];
                    horizontal.push(columnStart);
                    if (columnMin > 1) {
                        for (const item of columns[j]) {
                            const percent = (1 / columnMin) - percentGap;
                            item.android('layout_width', '0px');
                            item.app('layout_constraintWidth_percent', $math.truncate(percent, this.localSettings.precision.standardFloat));
                        }
                    }
                }
                for (let j = 0; j < columns.length - 1; j++) {
                    const item = columns[j];
                    if (item.length > 1) {
                        const columnEnd = item[item.length - 1];
                        if (/H\d/.test(columnEnd.tagName)) {
                            item.pop();
                            horizontal[j + 1] = columnEnd;
                            columns[j + 1].unshift(columnEnd);
                        }
                    }
                }
                for (let j = 0; j < horizontal.length; j++) {
                    const item = horizontal[j];
                    if (j > 0) {
                        item.android(item.localizeString(BOX_ANDROID.MARGIN_LEFT), $util.formatPX(item.marginLeft + columnGap));
                    }
                }
                setColumnHorizontal(horizontal);
                setColumnVertical(columns, i === rows.length - 1, previous);
                let maxHeight = 0;
                for (let j = 0; j < columns.length; j++) {
                    const height = columns[j].reduce((a, b) => a + b.linear.height, 0);
                    if (height > maxHeight) {
                        previous = columns[j][columns[j].length - 1];
                        maxHeight = height;
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
        Controller.evaluateAnchors(children);
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