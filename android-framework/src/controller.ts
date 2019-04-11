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

function setColumnHorizontal<T extends View>(seg: T[]) {
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
        item.app('layout_constraintVertical_bias', '0');
        item.anchored = true;
    }
    rowStart.anchor('left', 'parent');
    rowEnd.anchor('right', 'parent');
    rowStart.app('layout_constraintHorizontal_chainStyle', 'spread_inside');
}

function setColumnVertical<T extends View>(partition: T[][], lastRow: boolean, above?: T) {
    const rowStart = partition[0][0];
    for (let i = 0; i < partition.length; i++) {
        const seg = partition[i];
        for (let j = 0; j < seg.length; j++) {
            const item = seg[j];
            const previous = seg[j - 1];
            if (i === 0 && j === 0) {
                if (above) {
                    above.anchor('bottomTop', item.documentId);
                    item.anchor('topBottom', above.documentId);
                }
                else {
                    item.anchor('top', 'parent');
                }
            }
            else {
                if (j === 0) {
                    item.anchor('top', rowStart.documentId);
                    item.modifyBox($enum.BOX_STANDARD.MARGIN_TOP, null);
                }
                else {
                    previous.anchor('bottomTop', item.documentId);
                    item.anchor('topBottom', previous.documentId);
                }
            }
            if (j > 0) {
                item.anchor('left', seg[0].documentId);
            }
            if (j === seg.length - 1) {
                if (lastRow && $util.withinRange(item.linear.bottom, item.documentParent.box.bottom)) {
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
        seg[0].app('layout_constraintVertical_chainStyle', 'packed');
        seg[0].app('layout_constraintVertical_bias', '0');
    }
}

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

function adjustBaseline(baseline: View, nodes: View[]) {
    for (const node of nodes) {
        if (node !== baseline && !node.baselineAltered) {
            if (node.imageElement && node.actualHeight > baseline.actualHeight) {
                if (node.renderParent && $util.withinRange(node.linear.top, node.renderParent.box.top)) {
                    node.anchor('top', 'true');
                }
            }
            else if (node.imageElement && baseline.imageElement) {
                continue;
            }
            else if (node.element && node.length === 0 || node.layoutHorizontal && node.renderChildren.every(item => item.baseline)) {
                node.anchor('baseline', baseline.documentId);
            }
        }
    }
}

function checkSingleLine(node: View, nowrap = false) {
    if (node.textElement && node.cssAscend('textAlign', true) !== 'center' && !node.hasWidth && !node.multiline && (nowrap || node.textContent.trim().split(String.fromCharCode(32)).length)) {
        node.android('singleLine', 'true');
    }
}

function adjustDocumentRootOffset(value: number, parent: View, direction: string, boxReset = false) {
    if (value > 0) {
        if (!boxReset) {
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
    const minWH = node.cssInitial(`min${dimension}`);
    const maxWH = node.cssInitial(`max${dimension}`);
    if ($util.isLength(minWH)) {
        node.actualAnchor.app(`layout_constraint${dimension}_min`, minWH);
        node.constraint.minWidth = true;
    }
    if ($util.isLength(maxWH)) {
        node.actualAnchor.app(`layout_constraint${dimension}_max`, maxWH);
        node.constraint.minHeight = true;
    }
}

function constraintPercentValue(node: View, dimension: string, value: string, requirePX: boolean) {
    if ($util.isPercent(value)) {
        const actualAnchor = node.actualAnchor;
        if (requirePX) {
            actualAnchor.android(`layout_${dimension.toLowerCase()}`, node.convertPX(value, dimension === 'Width'));
        }
        else if (value !== '100%') {
            const percent = parseFloat(value) / 100;
            actualAnchor.app(`layout_constraint${dimension}_percent`, $math.truncate(percent, node.localSettings.floatPrecision));
            actualAnchor.android(`layout_${dimension.toLowerCase()}`, '0px');
        }
    }
}

function constraintPercentWidth(node: View, requirePX = false) {
    let value = node.cssInitial('width');
    if (!$util.isPercent(value)) {
        value = node.css('width');
    }
    constraintPercentValue(node, 'Width', value, requirePX);
}

function constraintPercentHeight(node: View, requirePX = false) {
    if (node.documentParent.hasHeight) {
        const value = node.has('height') ? node.css('height') : '';
        constraintPercentValue(node, 'Height', value, requirePX);
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
    return $util.filterArray(nodes, node => node.verticalAlign === 'text-bottom').sort((a, b) => {
        if (a.bounds.height === b.bounds.height) {
            return a.is(CONTAINER_NODE.SELECT) ? 1 : -1;
        }
        return a.bounds.height > b.bounds.height ? -1 : 1;
    })[0];
}

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
                                node.app('layout_constraintVertical_chainStyle', 'packed', false);
                                node.app('layout_constraintVertical_bias', '0', false);
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
        constraintMinMax(node, 'Width');
        constraintMinMax(node, 'Height');
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
        const actualAnchor = node.actualAnchor;
        const dimensionA = $util.capitalize(dimension);
        function setFlexGrow(value?: string) {
            actualAnchor.android(`layout_${dimension}`, '0px');
            if (flexbox.grow > 0) {
                actualAnchor.app(`layout_constraint${horizontal ? 'Horizontal' : 'Vertical'}_weight`, $math.truncate(flexbox.grow, node.localSettings.floatPrecision));
            }
            if (value) {
                if (flexbox.grow === 0) {
                    actualAnchor.app(`layout_constraint${dimensionA}_max`, value);
                }
                if (flexbox.shrink < 1) {
                    actualAnchor.app(`layout_constraint${dimensionA}_min`, $util.formatPX((1 - flexbox.shrink) * parseFloat(value)));
                }
            }
        }
        if ($util.isLength(basis)) {
            setFlexGrow(node.convertPX(basis));
        }
        else if ($util.isPercent(basis) && basis !== '0%') {
            actualAnchor.android(`layout_${dimension}`, '0px');
            actualAnchor.app(`layout_constraint${dimensionA}_percent`, (parseFloat(basis) / 100).toPrecision(node.localSettings.floatPrecision));
        }
        else if (flexbox.grow > 0) {
            setFlexGrow();
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
            actualAnchor.app(`layout_constrained${horizontal ? 'Width' : 'Height'}`, 'true');
        }
        if (horizontal) {
            constraintPercentHeight(node, true);
        }
        else {
            constraintPercentWidth(node, true);
        }
        constraintMinMax(node, 'Width');
        constraintMinMax(node, 'Height');
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
            standardFloat: 3
        },
        deviations: {
            subscriptBottomOffset: 0.25,
            superscriptTopOffset: 0.25,
            parentBottomOffset: 3.5
        }
    };

    public finalize(data: ViewData) {
        for (const name in data) {
            for (const view of data[name]) {
                view.content = $xml.replaceTab(
                    view.content.replace(/{#0}/, getRootNs(view.content)),
                    this.userSettings.insertSpaces
                );
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
            else if (child.plainText) {
                child.hide();
                node.clear();
                node.setInlineText(true);
                layout.setType(CONTAINER_NODE.TEXT);
            }
            else if (
                this.userSettings.collapseUnattributedElements &&
                node.element &&
                node.positionStatic &&
                node.documentParent === node.actualParent &&
                !node.groupParent &&
                !node.blockStatic &&
                !node.elementId &&
                !node.marginTop &&
                !node.marginBottom &&
                !node.hasWidth &&
                !node.hasHeight &&
                !node.visibleStyle.padding &&
                !node.visibleStyle.background &&
                !node.rightAligned &&
                !node.autoMargin.horizontal &&
                !node.companion &&
                !node.has('maxWidth') &&
                !node.has('maxHeight') &&
                !node.has('textAlign') &&
                !node.has('verticalAlign') &&
                node.lineHeight <= child.lineHeight &&
                !node.documentParent.hasAlign($enum.NODE_ALIGNMENT.AUTO_LAYOUT) &&
                !node.dataset.use &&
                !node.dataset.target &&
                !this.hasAppendProcessing(node.id))
            {
                child.documentRoot = node.documentRoot;
                child.siblingIndex = node.siblingIndex;
                child.parent = parent;
                node.renderAs = child;
                node.resetBox($enum.BOX_STANDARD.MARGIN, child, true);
                node.hide();
                node.innerChild = child;
                child.outerParent = node;
                renderAs = child;
            }
            else if (node.autoMargin.horizontal) {
                layout.setType(CONTAINER_NODE.LINEAR, $enum.NODE_ALIGNMENT.VERTICAL | $enum.NODE_ALIGNMENT.SINGLE);
            }
            else if (parent.layoutConstraint && parent.flexElement && node.flexbox.alignSelf === 'baseline' && child.textElement) {
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
        else if (layout.some(item => item.alignedVertically(item.previousSiblings(), layout.children, layout.cleared))) {
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
            else if (node.blockStatic && (style.borderWidth || style.backgroundImage || style.paddingVertical)) {
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

    public processLayoutHorizontal(layout: $Layout<T>, strictMode = false) {
        let containerType = 0;
        if (this.checkConstraintFloat(layout)) {
            layout.setType(CONTAINER_NODE.CONSTRAINT, $enum.NODE_ALIGNMENT.FLOAT);
        }
        else if (this.checkConstraintHorizontal(layout)) {
            containerType = CONTAINER_NODE.CONSTRAINT;
        }
        else if (this.checkRelativeHorizontal(layout)) {
            containerType = CONTAINER_NODE.RELATIVE;
        }
        else if (!strictMode || layout.linearX && !layout.floated.has('right')) {
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
            return $util.concatMultiArray($util.sortArray(below, true, 'zIndex', 'siblingIndex'), middle, $util.sortArray(above, true, 'zIndex', 'siblingIndex'));
        }
        return templates;
    }

    public checkFrameHorizontal(layout: $Layout<T>) {
        const [floating, sibling] = layout.partition(node => node.floating);
        if (layout.floated.size === 2 || layout.cleared.size || layout.some(node => node.pageFlow && node.autoMargin.horizontal)) {
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

    public checkConstraintFloat(layout: $Layout<T>) {
        if (layout.every(node => node.floating && node.marginLeft >= 0 && node.marginRight >= 0 && (!node.positionRelative || node.left >= 0 && node.top >= 0) || node.naturalElement && node.css('clear') !== 'none')) {
            if (layout.floated.size === 1 || layout.every(node => node.has('width', $enum.CSS_STANDARD.PERCENT) || node.naturalElement && node.css('clear') !== 'none')) {
                return true;
            }
        }
        else if (layout.every(node => node.inlineFlow && node.has('width', $enum.CSS_STANDARD.PERCENT) || node.renderExclude)) {
            return true;
        }
        return false;
    }

    public checkConstraintHorizontal(layout: $Layout<T>) {
        let sameHeight = true;
        let previousHeight = layout.children[0].actualHeight;
        for (let i = 1; i < layout.length; i++) {
            if (previousHeight !== layout.children[i].actualHeight) {
                sameHeight = false;
                break;
            }
            previousHeight = layout.children[i].actualHeight;
        }
        return !sameHeight && !layout.parent.hasHeight && layout.some(node => node.verticalAlign === 'bottom') && layout.every(node => node.inlineVertical && (node.baseline || node.verticalAlign === 'bottom'));
    }

    public checkRelativeHorizontal(layout: $Layout<T>) {
        if (layout.floated.size === 2 || layout.every(node => (node.imageElement || node.float === 'right') && node.baseline && !node.positionRelative)) {
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
                                if (!item.positionAuto && (item.documentParent === item.absoluteParent || item.position === 'fixed')) {
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
                                            item.modifyBox($enum.BOX_STANDARD.MARGIN_LEFT, adjustDocumentRootOffset(item.left, node, 'Left'));
                                        }
                                        if (item.has('right') && (!item.hasWidth || !item.has('left'))) {
                                            item.anchor('right', 'parent');
                                            item.modifyBox($enum.BOX_STANDARD.MARGIN_RIGHT, adjustDocumentRootOffset(item.right, node, 'Right'));
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
                                            item.modifyBox($enum.BOX_STANDARD.MARGIN_TOP, adjustDocumentRootOffset(item.top, node, 'Top', node.valueBox($enum.BOX_STANDARD.PADDING_TOP)[0] === 1));
                                        }
                                        if (item.has('bottom') && (!item.hasHeight || !item.has('top'))) {
                                            item.anchor('bottom', 'parent');
                                            item.modifyBox($enum.BOX_STANDARD.MARGIN_BOTTOM, adjustDocumentRootOffset(item.bottom, node, 'Bottom', node.valueBox($enum.BOX_STANDARD.PADDING_BOTTOM)[0] === 1));
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
                            this.processConstraintChain(node, pageFlow, bottomParent);
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
                                if (this.withinParentBottom(item.linear.bottom, bottomParent) && item.actualParent && !item.actualParent.documentBody) {
                                    item.anchor('bottom', 'parent');
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
                            if (!item.hasWidth && item.alignParent('left') && item.alignParent('right')) {
                                item.android('layout_width', item.textElement && item.multiline ? '0dp' : 'match_parent');
                            }
                            if (!item.hasHeight && item.alignParent('top') && item.alignParent('bottom')) {
                                item.android('layout_height', item.textElement && item.multiline ? '0dp' : 'match_parent');
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
                        const image = this.application.session.image.get(element.src);
                        let width = node.toFloat('width');
                        let height = node.toFloat('height');
                        let scaleType = 'fitXY';
                        if (widthPercent || heightPercent) {
                            if (!parent.layoutConstraint) {
                                if (widthPercent) {
                                    width *= parent.box.width / 100;
                                    if (width < 100) {
                                        node.css('width', $util.formatPX(width));
                                    }
                                    if (height === 0 && image) {
                                        height = image.height * (width / image.width);
                                        node.css('height', $util.formatPX(height));
                                    }
                                }
                                if (heightPercent && height < 100) {
                                    height *= parent.box.height / 100;
                                    if (height < 100) {
                                        node.css('height', $util.formatPX(height));
                                    }
                                    if (width === 0 && image) {
                                        width = image.width * (height / image.height);
                                        node.css('width', $util.formatPX(width));
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
                        if (image && (width === 0 || height === 0)) {
                            if (width === 0) {
                                width = image.width;
                            }
                            if (height === 0) {
                                height = image.height;
                            }
                        }
                        if (width > 0 && height === 0 || width === 0 && height > 0) {
                            node.android('adjustViewBounds', 'true');
                        }
                        if (node.baseline) {
                            node.android('baselineAlignBottom', 'true');
                        }
                        const src = Resource.addImageSrc(element);
                        if (src !== '') {
                            node.android('src', `@drawable/${src}`);
                        }
                        if (!node.pageFlow && (node.left < 0 || node.top < 0)) {
                            if (node.absoluteParent && node.absoluteParent.css('overflow') === 'hidden') {
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
                            if (element.value) {
                                node.android('progress', element.value);
                            }
                        case 'time':
                        case 'week':
                        case 'month':
                        case 'number':
                        case 'datetime-local':
                            if (element.min) {
                                node.android('min', element.min);
                            }
                            if (element.max) {
                                node.android('max', element.max);
                            }
                            break;
                        case 'url':
                        case 'email':
                        case 'search':
                        case 'tel':
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
                case 'SELECT': {
                    const element = <HTMLSelectElement> node.element;
                    if (element.size > 1 && !node.cssInitial('verticalAlign')) {
                        node.css('verticalAlign', 'text-bottom', true);
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
                    if (!node.cssInitial('verticalAlign')) {
                        node.css('verticalAlign', 'text-bottom', true);
                    }
                    break;
                }
                case 'LEGEND': {
                    const offset = Math.floor((node.bounds.height - node.fontSize) / 2);
                    if (offset > 0) {
                        node.modifyBox($enum.BOX_STANDARD.MARGIN_BOTTOM, offset);
                    }
                    if (!node.hasWidth) {
                        node.css('minWidth', $util.formatPX(node.bounds.width), true);
                        node.css('display', 'inline-block', true);
                    }
                    break;
                }
            }
        }
        if (node.inlineVertical) {
            switch (node.verticalAlign) {
                case 'sub':
                    node.modifyBox($enum.BOX_STANDARD.MARGIN_BOTTOM, Math.ceil(node.fontSize * this.localSettings.deviations.subscriptBottomOffset) * -1);
                    break;
                case 'super':
                    node.modifyBox($enum.BOX_STANDARD.MARGIN_TOP, Math.ceil(node.fontSize * this.localSettings.deviations.superscriptTopOffset) * -1);
                    break;
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
                    node.android('singleLine', 'true');
                }
                break;
            case CONTAINER_ANDROID.EDIT:
            case CONTAINER_ANDROID.RANGE:
                if (!node.hasWidth) {
                    node.css('width', $util.formatPX(node.bounds.width), true);
                }
                break;
            case CONTAINER_ANDROID.BUTTON:
                if (node.cssInitial('verticalAlign') === '') {
                    node.css('verticalAlign', 'text-bottom', true);
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
                            if (image.width >= parent.box.width && node.css('maxWidth') === '100%') {
                                node.android('layout_width', 'match_parent');
                            }
                            else if (maxWidth === image.width) {
                                node.android('layout_height', 'wrap_content');
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
                            if (image.height >= parent.box.height && node.css('maxHeight') === '100%') {
                                node.android('layout_height', 'match_parent');
                            }
                            else if (maxHeight === image.height) {
                                node.android('layout_height', 'wrap_content');
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
                        location = horizontal ? adjustDocumentRootOffset(location, documentParent, 'Left') : adjustDocumentRootOffset(location, documentParent, 'Top', documentParent.valueBox($enum.BOX_STANDARD.PADDING_TOP)[0] === 1);
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
                    if (horizontal) {
                        node.constraint.guidelineHorizontal = documentId;
                    }
                    else {
                        node.constraint.guidelineVertical = documentId;
                    }
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
        node.outerParent = container;
        return container;
    }

    protected processRelativeHorizontal(node: T, children: T[]) {
        const rows: T[][] = [];
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
                rows.push([item]);
            }
        }
        else {
            const boxWidth = (() => {
                const renderParent = node.renderParent;
                if (renderParent) {
                    if (renderParent.overflowX) {
                        let width = renderParent.actualWidth;
                        if (renderParent.css('boxSizing') === 'content-box') {
                            width -= renderParent.contentBoxWidth;
                        }
                        return width;
                    }
                    else if (renderParent.groupParent) {
                        let floatStart = Number.NEGATIVE_INFINITY;
                        $util.captureMap(
                            node.documentParent.actualChildren,
                            (item: T) => item.float === 'left' && !children.includes(item),
                            item => floatStart = Math.max(floatStart, item.linear.right)
                        );
                        if (floatStart !== Number.NEGATIVE_INFINITY && children.some(item => $util.withinRange(item.linear.left, floatStart))) {
                            return node.box.right - floatStart;
                        }
                    }
                }
                return node.box.width - (node.valueBox($enum.BOX_STANDARD.PADDING_LEFT)[1] + node.valueBox($enum.BOX_STANDARD.PADDING_RIGHT)[1]);
            })();
            const maxBoxWidth = Math.min(boxWidth, this.userSettings.maxWordWrapWidth);
            const alignmentSingle = !node.groupParent && node.inline && node.linear.right <= node.documentParent.box.right;
            const checkLineWrap = node.css('whiteSpace') !== 'nowrap';
            const cleared = $NodeList.linearData(children, true).cleared;
            const textIndent = node.toInt('textIndent');
            let rowWidth = 0;
            let rowPreviousLeft: T | undefined;
            let rowPreviousBottom: T | undefined;
            $util.partitionArray(children, item => item.float !== 'right').forEach((seg, index) => {
                if (seg.length === 0) {
                    return;
                }
                const leftAlign = index === 0;
                let leftForward = true;
                let alignParent: string;
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
                }
                else {
                    alignParent = 'right';
                }
                for (let i = 0; i < seg.length; i++) {
                    const item = seg[i];
                    const previous = seg[i - 1];
                    let bounds = item.bounds;
                    if (item.inlineText && !item.hasWidth) {
                        const rect = $dom.getRangeClientRect(<Element> item.element);
                        if (rect.multiline > 0 || rect.width < item.box.width) {
                            bounds = rect;
                            if (!item.multiline) {
                                item.multiline = rect.multiline > 0;
                            }
                        }
                    }
                    if (item.multiline && bounds.width <= maxBoxWidth) {
                        item.multiline = false;
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
                        const checkWidthWrap = () => {
                            if (alignmentSingle) {
                                return false;
                            }
                            let baseWidth = rowWidth + item.marginLeft;
                            if (rowPreviousLeft && !items.includes(rowPreviousLeft)) {
                                baseWidth += rowPreviousLeft.linear.width;
                            }
                            if (rowPreviousLeft === undefined || !item.plainText || item.multiline || !items.includes(rowPreviousLeft) || cleared.has(item)) {
                                baseWidth += bounds.width;
                            }
                            if (item.marginRight < 0) {
                                baseWidth += item.marginRight;
                            }
                            const maxWidth = ((item.plainText || item.inlineText) && item.textContent.indexOf(' ') !== -1 ? maxBoxWidth : boxWidth) - (rows.length === 1 ? textIndent : 0);
                            return Math.floor(baseWidth) - (item.styleElement && item.inlineStatic ? item.paddingLeft + item.paddingRight : 0) > maxWidth;
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
                                else if (checkLineWrap && (previous.multiline && (previous.bounds.width >= boxWidth || Resource.hasLineBreak(previous, false, true)))) {
                                    return true;
                                }
                            }
                            if (previous.floating && rowWidth < maxBoxWidth && previous.alignParent('left')) {
                                return false;
                            }
                            else if (checkLineWrap && (checkWidthWrap() || item.multiline && Resource.hasLineBreak(item) || item.preserveWhiteSpace && $util.REGEXP_COMPILED.LEADINGNEWLINE.test(item.textContent))) {
                                return true;
                            }
                            return false;
                        };
                        const textNewRow = item.textElement && startNewRow();
                        if (viewGroup ||
                            item.linear.top >= previous.linear.bottom && (item.blockStatic || item.floating && previous.float === item.float) ||
                            textNewRow ||
                            !item.textElement && checkWidthWrap() ||
                            !item.floating && (previous.blockStatic || item.previousSiblings().some(sibling => sibling.lineBreak || sibling.excluded && sibling.blockStatic) || !!siblings && siblings.some(element => $session.isLineBreak(element, node.sessionId))) ||
                            cleared.has(item) ||
                            previous.autoMargin.horizontal)
                        {
                            rowPreviousBottom = items.find(sibling => !sibling.floating) || items[0];
                            for (const sibling of items) {
                                if (sibling !== rowPreviousBottom && sibling.linear.bottom >= rowPreviousBottom.linear.bottom && (!sibling.floating || rowPreviousBottom.floating)) {
                                    rowPreviousBottom = sibling;
                                }
                            }
                            item.anchor('topBottom', rowPreviousBottom.documentId);
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
                            if (textNewRow && item.multiline) {
                                checkSingleLine(previous, checkLineWrap);
                            }
                            rowWidth = Math.min(0, textNewRow && !previous.multiline && item.multiline && !cleared.has(item) ? item.linear.right - node.box.right : 0);
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
                            if (rowPreviousBottom) {
                                item.anchor('topBottom', rowPreviousBottom.documentId);
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
                    if (siblings && !siblings.some(element => !!$session.getElementAsNode(element, item.sessionId) || $session.isLineBreak(element, item.sessionId))) {
                        const betweenStart = $dom.getRangeClientRect(siblings[0]);
                        if (!betweenStart.multiline) {
                            const betweenEnd = siblings.length > 1 ? $dom.getRangeClientRect(siblings[siblings.length - 1]) : undefined;
                            if (betweenEnd === undefined || !betweenEnd.multiline) {
                                previousOffset = betweenEnd ? betweenStart.left - betweenEnd.right : betweenStart.width;
                            }
                        }
                    }
                    rowWidth += previousOffset + item.marginLeft + bounds.width + item.marginRight;
                    if ((alignmentSingle || i < seg.length - 1) && Math.ceil(rowWidth) >= this.userSettings.maxWordWrapWidth && !item.alignParent(alignParent)) {
                        checkSingleLine(item, checkLineWrap);
                    }
                }
            });
        }
        if (rows.length > 1) {
            node.alignmentType |= $enum.NODE_ALIGNMENT.MULTILINE;
            node.horizontalRows = rows;
            alignmentMultiLine = true;
        }
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
                        const height = baseline.bounds.height;
                        if (textBottom.bounds.height > height || textBottom.companion && textBottom.companion.bounds.height > height || textBottom.some(item => !!item.companion && item.companion.bounds.height > height)) {
                            baseline.anchor('bottom', textBottom.documentId);
                        }
                        else {
                            textBottom = undefined;
                        }
                    }
                }
                const textBaseline = $NodeList.baseline(items, true)[0] as T | undefined;
                const baselineAlign: T[] = [];
                let documentId = i === 0 ? 'true' : (baseline ? baseline.documentId : '');
                let maxCenterHeight = 0;
                for (const item of items) {
                    if (item.baseline) {
                        if (item !== baseline) {
                            baselineAlign.push(item);
                        }
                    }
                    else if (item.inlineVertical) {
                        switch (item.verticalAlign) {
                            case 'text-top':
                                if (textBaseline) {
                                    item.anchor('top', textBaseline.documentId);
                                }
                                break;
                            case 'super':
                            case 'top':
                                if (documentId) {
                                    item.anchor('top', documentId);
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
                                        item.modifyBox($enum.BOX_STANDARD.MARGIN_TOP, Math.round((heightParent - height) / 2));
                                    }
                                }
                                break;
                            case 'text-bottom':
                                if (textBaseline && item !== textBottom) {
                                    item.anchor('bottom', textBaseline.documentId);
                                }
                                break;
                            case 'sub':
                            case 'bottom':
                                if (!$util.withinRange(node.bounds.height, item.bounds.height)) {
                                    if (!node.hasHeight && documentId === 'true') {
                                        if (!alignmentMultiLine) {
                                            node.css('height', $util.formatPX(node.bounds.height), true);
                                        }
                                        else {
                                            documentId = baseline.documentId;
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
                    if (baseline.textElement && maxCenterHeight > baseline.actualHeight) {
                        baseline.anchor('centerVertical', 'true');
                    }
                    if (baselineAlign.length) {
                        adjustBaseline(baseline, baselineAlign);
                    }
                }
            }
            else {
                items[0].baselineActive = true;
            }
        }
    }

    protected processConstraintHorizontal(node: T, children: T[]) {
        const baseline = $NodeList.baseline(children)[0] as T | undefined;
        const baselineText = $NodeList.baseline(children, true)[0] as T | undefined;
        const reverse = node.hasAlign($enum.NODE_ALIGNMENT.RIGHT);
        let textBottom = getTextBottom(children);
        if (baseline) {
            baseline.baselineActive = true;
            if (textBottom && baseline.bounds.height < textBottom.bounds.height) {
                baseline.anchor('bottom', textBottom.documentId);
            }
            else {
                textBottom = undefined;
            }
        }
        for (let i = 0; i < children.length; i++) {
            const item = children[i];
            const previous = children[i - 1];
            if (i === 0) {
                item.anchor(reverse ? 'right' : 'left', 'parent');
            }
            else {
                item.anchor(reverse ? 'rightLeft' : 'leftRight', previous.documentId);
            }
            if (item.inlineVertical) {
                switch (item.verticalAlign) {
                    case 'text-top':
                        if (baselineText && item !== baselineText) {
                            item.anchor('top', baselineText.documentId);
                        }
                        break;
                    case 'super':
                    case 'top':
                        item.anchor('top', 'parent');
                        break;
                    case 'middle':
                        item.anchorParent(AXIS_ANDROID.VERTICAL);
                        break;
                    case 'text-bottom':
                        if (baselineText && item !== baselineText && item !== textBottom) {
                            item.anchor('bottom', baselineText.documentId);
                        }
                        break;
                    case 'sub':
                    case 'bottom':
                        item.anchor('bottom', 'parent');
                        break;
                    case 'baseline':
                        if (baseline && item !== baseline) {
                            item.anchor('baseline', baseline.documentId);
                        }
                        break;
                }
            }
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
        const columnGap = $util.convertInt(node.css('columnGap')) || 16;
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
                previous = row[0];
            }
            else {
                let columnMin = Math.min(row.length, columnCount);
                if (row.length > columnCount) {
                    while (row.length / columnMin < 2) {
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

    protected processConstraintChain(node: T, children: T[], linearBottomParent: number) {
        const documentParent = $NodeList.actualParent(children) || node;
        const horizontal = $NodeList.partitionRows(children);
        const floating = node.hasAlign($enum.NODE_ALIGNMENT.FLOAT);
        if (horizontal.length > 1) {
            node.alignmentType |= $enum.NODE_ALIGNMENT.MULTILINE;
            node.horizontalRows = horizontal;
        }
        if (floating && !node.hasWidth && children.some(item => item.has('width', $enum.CSS_STANDARD.PERCENT))) {
            node.android('layout_width', 'match_parent');
        }
        for (const item of children) {
            if (!floating) {
                if (item.rightAligned) {
                    if ($util.withinRange(item.linear.right, documentParent.box.right) || item.linear.right > documentParent.box.right) {
                        item.anchor('right', 'parent');
                    }
                }
                else if ($util.withinRange(item.linear.left, documentParent.box.left) || item.linear.left < documentParent.box.left) {
                    item.anchor('left', 'parent');
                }
            }
            if ($util.withinRange(item.linear.top, node.box.top) || item.linear.top < node.box.top || item.floating && horizontal.length === 1) {
                item.anchor('top', 'parent');
            }
            if (this.withinParentBottom(item.linear.bottom, linearBottomParent) && !documentParent.documentBody && (documentParent.hasHeight || !item.alignParent('top'))) {
                item.anchor('bottom', 'parent');
            }
        }
        const previousSiblings: T[] = [];
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
                let anchorStart: string;
                let anchorEnd: string;
                let chainStart: string;
                let chainEnd: string;
                if (reverse) {
                    anchorStart = 'right';
                    anchorEnd = 'left';
                    chainStart = 'rightLeft';
                    chainEnd = 'leftRight';
                }
                else {
                    anchorStart = 'left';
                    anchorEnd = 'right';
                    chainStart = 'leftRight';
                    chainEnd = 'rightLeft';
                    sortHorizontalFloat(floatingLeft);
                }
                const rowStart = seg[0];
                const rowEnd = seg[seg.length - 1];
                rowStart.anchor(anchorStart, 'parent');
                if (!floating && documentParent.css('textAlign') === 'center') {
                    rowStart.app('layout_constraintHorizontal_chainStyle', 'spread');
                }
                else if (seg.length > 1) {
                    if (reverse) {
                        rowEnd.app('layout_constraintHorizontal_chainStyle', 'packed');
                        rowEnd.app('layout_constraintHorizontal_bias', '1');
                    }
                    else {
                        rowStart.app('layout_constraintHorizontal_chainStyle', 'packed');
                        rowStart.app('layout_constraintHorizontal_bias', '0');
                    }
                }
                if (seg.length > 1) {
                    rowEnd.anchor(anchorEnd, 'parent');
                }
                for (let j = 0; j < seg.length; j++) {
                    const chain = seg[j];
                    const previous = seg[j - 1];
                    const next = seg[j + 1];
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
                                if (chain.linear.top < Math.floor(item.linear.bottom)) {
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
                }
                currentRowBottom.anchor('topBottom', aboveRowEnd.documentId);
                aboveRowEnd.anchor('bottomTop', currentRowBottom.documentId);
                for (const chain of partition) {
                    if (chain !== currentRowBottom) {
                        chain.anchor('top', currentRowBottom.documentId);
                        chain.modifyBox($enum.BOX_STANDARD.MARGIN_TOP, currentRowBottom.marginTop * -1);
                    }
                }
            }
        }
        Controller.evaluateAnchors(children);
    }

    private withinParentBottom(bottom: number, boxBottom: number) {
        return $util.withinRange(bottom, boxBottom, this.localSettings.deviations.parentBottomOffset);
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