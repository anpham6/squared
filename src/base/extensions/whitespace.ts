import Extension from '../extension';
import Node from '../node';

import { BOX_STANDARD, CSS_STANDARD, NODE_ALIGNMENT } from '../lib/enumeration';

const $session = squared.lib.session;
const $css = squared.lib.css;
const $util = squared.lib.util;

const doctypeHTML = document.doctype !== null && document.doctype.name === 'html';

function setMinHeight(node: Node, offset: number) {
    const minHeight = node.has('minHeight', CSS_STANDARD.LENGTH) ? node.toFloat('minHeight') : 0;
    node.css('minHeight', $css.formatPX(Math.max(offset, minHeight)));
}

function isBlockElement(node: Node | undefined) {
    return node ? (node.blockStatic || node.display === 'table') && !node.lineBreak && !node.positioned : false;
}

function getVisibleNode(node: Node) {
    if (node.visible) {
        const innerWrapped = node.innerWrapped;
        if (innerWrapped && !innerWrapped.naturalElement) {
            return innerWrapped;
        }
        return node;
    }
    else if (node.excluded) {
        return node;
    }
    return node.renderAs || node.outerWrapper || node.innerWrapped || node;
}

function resetMargin(node: Node, value: number) {
    if (node.getBox(value)[0] !== 1) {
        getVisibleNode(node).modifyBox(value);
        if (node.companion) {
            node.companion.modifyBox(value);
        }
    }
}

function applyMarginCollapse(node: Node, child: Node, direction: boolean) {
    if (isBlockElement(child)) {
        let margin: string;
        let borderWidth: string;
        let padding: string;
        let boxMargin: number;
        if (direction) {
            margin = 'marginTop';
            borderWidth = 'borderTopWidth';
            padding = 'paddingTop';
            boxMargin = BOX_STANDARD.MARGIN_TOP;
        }
        else {
            padding = 'paddingBottom';
            borderWidth = 'borderBottomWidth';
            margin = 'marginBottom';
            boxMargin = BOX_STANDARD.MARGIN_BOTTOM;
        }
        if (node[borderWidth] === 0 && node[padding] === 0) {
            while (doctypeHTML && child[margin] === 0 && child[borderWidth] === 0 && child[padding] === 0) {
                const endChild = (direction ? child.firstChild : child.lastChild) as Node;
                if (isBlockElement(endChild)) {
                    child = endChild;
                }
                else {
                    break;
                }
            }
            let resetChild = false;
            if (!doctypeHTML && node[margin] === 0 && child[margin] > 0 && child.cssInitial(margin) === '') {
                resetChild = true;
            }
            else {
                const outside = node[margin] >= child[margin];
                if (child.bounds.height === 0 && outside && child.textElement && child.textContent === '' && child.extensions.length === 0) {
                    child.hide();
                }
                else if (child.getBox(boxMargin)[0] !== 1) {
                    if (node.documentBody) {
                        if (outside) {
                            resetChild = true;
                        }
                        else {
                            resetMargin(node, boxMargin);
                            if (direction) {
                                node.bounds.top = 0;
                                node.unsafe('box', true);
                                node.unsafe('linear', true);
                            }
                        }
                    }
                    else {
                        if (!outside && node.getBox(boxMargin)[0] !== 1) {
                            const visibleParent = getVisibleNode(node);
                            visibleParent.modifyBox(boxMargin);
                            visibleParent.modifyBox(boxMargin, child[margin]);
                        }
                        resetChild = true;
                    }
                }
            }
            if (resetChild) {
                resetMargin(child, boxMargin);
                if (child.bounds.height === 0) {
                    resetMargin(child, direction ? BOX_STANDARD.MARGIN_BOTTOM : BOX_STANDARD.MARGIN_TOP);
                }
            }
        }
    }
}

export default abstract class WhiteSpace<T extends Node> extends Extension<T> {
    public afterBaseLayout() {
        const processed = new Set<T>();
        for (const node of this.application.processing.cache) {
            if (node.naturalElement && !node.layoutElement && node.actualChildren.length) {
                const children = node.actualChildren;
                let firstChild: T | undefined;
                let lastChild: T | undefined;
                for (let i = 0; i < children.length; i++) {
                    const current = children[i] as T;
                    if (!current.pageFlow) {
                        continue;
                    }
                    if (node.blockStatic) {
                        if (!current.floating) {
                            if (firstChild === undefined) {
                                firstChild = current;
                            }
                            lastChild = current;
                        }
                        else {
                            lastChild = undefined;
                        }
                    }
                    if (i === 0) {
                        continue;
                    }
                    if (isBlockElement(current)) {
                        const previousSiblings = current.previousSiblings({ floating: false });
                        if (previousSiblings.length) {
                            const previous = previousSiblings.find(item => !item.floating) as T;
                            if (previous) {
                                const currentVisible = getVisibleNode(current);
                                if (isBlockElement(previous)) {
                                    const previousVisible = getVisibleNode(previous);
                                    let inheritedBottom = false;
                                    let inheritedTop = false;
                                    let marginBottom = $util.convertFloat(previous.cssInitial('marginBottom', false, true));
                                    if (marginBottom === 0 && previous.marginBottom > 0) {
                                        marginBottom = previous.marginBottom;
                                        inheritedBottom = true;
                                    }
                                    let marginTop = $util.convertFloat(current.cssInitial('marginTop', false, true));
                                    if (marginTop === 0 && current.marginTop > 0) {
                                        marginTop = previous.marginTop;
                                        inheritedTop = true;
                                    }
                                    if (previous.excluded && !current.excluded) {
                                        const offset = Math.min(marginBottom, previous.marginTop);
                                        if (offset < 0) {
                                            const top = Math.abs(offset) >= marginTop ? undefined : offset;
                                            currentVisible.modifyBox(BOX_STANDARD.MARGIN_TOP, top);
                                            if (currentVisible.companion) {
                                                currentVisible.companion.modifyBox(BOX_STANDARD.MARGIN_TOP, top);
                                            }
                                            processed.add(previous);
                                        }
                                    }
                                    else if (!previous.excluded && current.excluded) {
                                        const offset = Math.min(marginTop, $util.convertFloat(current.cssInitial('marginBottom', false, true)));
                                        if (offset < 0) {
                                            previousVisible.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, Math.abs(offset) >= marginBottom ? undefined : offset);
                                            processed.add(current);
                                        }
                                    }
                                    else {
                                        if (previous.paddingBottom === 0 && previous.borderBottomWidth === 0) {
                                            const bottomChild = previous.lastChild as T;
                                            if (isBlockElement(bottomChild) && bottomChild.getBox(BOX_STANDARD.MARGIN_BOTTOM)[0] !== 1) {
                                                const childMarginBottom = $util.convertFloat(bottomChild.cssInitial('marginBottom', false, true));
                                                if (childMarginBottom > marginBottom) {
                                                    marginBottom = childMarginBottom;
                                                    previousVisible.css('marginBottom', $css.formatPX(childMarginBottom), true);
                                                    inheritedBottom = true;
                                                }
                                                resetMargin(getVisibleNode(bottomChild), BOX_STANDARD.MARGIN_BOTTOM);
                                            }
                                        }
                                        if (current.borderTopWidth === 0 && current.paddingTop === 0) {
                                            const topChild = current.firstChild as T;
                                            if (isBlockElement(topChild) && topChild.getBox(BOX_STANDARD.MARGIN_TOP)[0] !== 1) {
                                                const childMarginTop = $util.convertFloat(topChild.cssInitial('marginTop', false, true));
                                                if (childMarginTop > marginTop) {
                                                    marginTop = childMarginTop;
                                                    currentVisible.css('marginTop', $css.formatPX(childMarginTop), true);
                                                    inheritedTop = true;
                                                }
                                                resetMargin(getVisibleNode(topChild), BOX_STANDARD.MARGIN_TOP);
                                            }
                                        }
                                        if (marginBottom > 0) {
                                            if (marginTop > 0) {
                                                if (!$util.hasBit(current.overflow, NODE_ALIGNMENT.BLOCK) && !$util.hasBit(previous.overflow, NODE_ALIGNMENT.BLOCK)) {
                                                    if (marginTop <= marginBottom) {
                                                        if (inheritedTop) {
                                                            currentVisible.css('marginTop', '0px', true);
                                                        }
                                                        else {
                                                            resetMargin(currentVisible, BOX_STANDARD.MARGIN_TOP);
                                                        }
                                                    }
                                                    else {
                                                        if (inheritedBottom) {
                                                            currentVisible.css('marginBottom', '0px', true);
                                                        }
                                                        else {
                                                            resetMargin(previousVisible, BOX_STANDARD.MARGIN_BOTTOM);
                                                        }
                                                    }
                                                }
                                            }
                                            else if (previous.bounds.height === 0) {
                                                resetMargin(previousVisible, BOX_STANDARD.MARGIN_BOTTOM);
                                            }
                                        }
                                    }
                                }
                                else if (previous.blockDimension && !previous.block && current.length === 0) {
                                    const offset = current.linear.top - previous.linear.bottom;
                                    if (Math.floor(offset) > 0 && current.ascend(false, item => item.has('height')).length === 0) {
                                        currentVisible.modifyBox(BOX_STANDARD.MARGIN_TOP, offset);
                                    }
                                }
                            }
                        }
                    }
                }
                if (!$util.hasBit(node.overflow, NODE_ALIGNMENT.BLOCK)) {
                    if (firstChild) {
                        applyMarginCollapse(node, firstChild, true);
                    }
                    if (lastChild) {
                        applyMarginCollapse(node, lastChild, false);
                        if (lastChild.marginTop < 0) {
                            const offset = lastChild.bounds.height + lastChild.marginBottom + lastChild.marginTop;
                            if (offset < 0) {
                                node.modifyBox(BOX_STANDARD.PADDING_BOTTOM, offset, false);
                            }
                        }
                    }
                }
            }
        }
        for (const node of this.application.processing.excluded) {
            if (!processed.has(node) && node.lineBreak && !node.lineBreakTrailing) {
                const previousSiblings = node.previousSiblings({ floating: false }) as T[];
                const nextSiblings = node.nextSiblings({ floating: false }) as T[];
                let valid = false;
                if (previousSiblings.length && nextSiblings.length) {
                    let above = previousSiblings.pop() as T;
                    let below = nextSiblings.pop() as T;
                    if (above.inlineStatic && below.inlineStatic) {
                        if (previousSiblings.length === 0) {
                            processed.add(node);
                            continue;
                        }
                        else {
                            const abovePrevious = previousSiblings.pop() as T;
                            if (abovePrevious.lineBreak) {
                                abovePrevious.setBounds();
                                if (abovePrevious.linear.bottom > above.linear.bottom) {
                                    above = abovePrevious;
                                }
                            }
                        }
                    }
                    let offset: number;
                    if (below.lineHeight > 0 && below.element && below.cssTry('lineHeight', 'normal')) {
                        offset = $session.getClientRect(below.element, below.sessionId).top - below.marginTop;
                        below.cssFinally('lineHeight');
                    }
                    else {
                        offset = below.linear.top;
                    }
                    if (above.lineHeight > 0 && above.element && above.cssTry('lineHeight', 'normal')) {
                        offset -= $session.getClientRect(above.element, above.sessionId).bottom + above.marginBottom;
                        above.cssFinally('lineHeight');
                    }
                    else {
                        offset -= above.linear.bottom;
                    }
                    valid = true;
                    if (offset !== 0) {
                        above = getVisibleNode(above) as T;
                        below = getVisibleNode(below) as T;
                        const aboveParent = above.visible && above.renderParent;
                        const belowParent = below.visible && below.renderParent;
                        if (belowParent && belowParent.groupParent && belowParent.firstChild === below) {
                            belowParent.modifyBox(BOX_STANDARD.MARGIN_TOP, offset);
                        }
                        else if (aboveParent && aboveParent.groupParent && aboveParent.lastChild === above) {
                            aboveParent.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, offset);
                        }
                        else if (belowParent && belowParent.layoutVertical && below.visible) {
                            below.modifyBox(BOX_STANDARD.MARGIN_TOP, offset);
                        }
                        else if (aboveParent && aboveParent.layoutVertical && above.visible) {
                            above.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, offset);
                        }
                        else {
                            const actualParent = node.actualParent;
                            if (!belowParent && !aboveParent && actualParent && actualParent.visible) {
                                if (below.lineBreak || below.excluded) {
                                    actualParent.modifyBox(BOX_STANDARD.PADDING_BOTTOM, offset);
                                }
                                else if (above.lineBreak || above.excluded) {
                                    actualParent.modifyBox(BOX_STANDARD.PADDING_TOP, offset);
                                }
                                else {
                                    valid = false;
                                }
                            }
                            else {
                                valid = false;
                            }
                        }
                    }
                }
                else {
                    const actualParent = node.actualParent;
                    if (actualParent && actualParent.visible) {
                        if (!actualParent.documentRoot && actualParent.ascendOuter(item => item.documentRoot).length === 0 && previousSiblings.length) {
                            const previousStart = previousSiblings[previousSiblings.length - 1];
                            const offset = actualParent.box.bottom - previousStart.linear[previousStart.lineBreak || previousStart.excluded ? 'top' : 'bottom'];
                            if (offset !== 0) {
                                if (previousStart.rendered || actualParent.visibleStyle.background) {
                                    actualParent.modifyBox(BOX_STANDARD.PADDING_BOTTOM, offset);
                                }
                                else if (!actualParent.hasHeight) {
                                    setMinHeight(actualParent, offset);
                                }
                            }
                        }
                        else if (nextSiblings.length) {
                            const nextStart = nextSiblings[nextSiblings.length - 1];
                            const offset = nextStart.linear[nextStart.lineBreak || nextStart.excluded ? 'bottom' : 'top'] - actualParent.box.top;
                            if (offset !== 0) {
                                if (nextStart.rendered || actualParent.visibleStyle.background) {
                                    actualParent.modifyBox(BOX_STANDARD.PADDING_TOP, offset);
                                }
                                else if (!actualParent.hasHeight) {
                                    setMinHeight(actualParent, offset);
                                }
                            }
                        }
                        valid = true;
                    }
                }
                if (valid) {
                    for (const item of previousSiblings) {
                        processed.add(item);
                    }
                    for (const item of nextSiblings) {
                        processed.add(item);
                    }
                }
            }
        }
    }

    public afterConstraints() {
        const modified: number[] = [];
        for (let node of this.application.processing.cache) {
            const renderParent = node.renderAs ? node.renderAs.renderParent : node.renderParent;
            if (renderParent && node.pageFlow && node.styleElement && node.inlineVertical && !node.positioned && !node.documentParent.layoutElement && !renderParent.tableElement && !modified.includes(node.id)) {
                function setSpacingOffset(region: number, value: number) {
                    let offset = 0 ;
                    switch (region) {
                        case BOX_STANDARD.MARGIN_LEFT:
                            offset = node.actualRect('left') - value;
                            break;
                        case BOX_STANDARD.MARGIN_TOP:
                            offset = node.actualRect('top') - value;
                            break;
                        case BOX_STANDARD.MARGIN_BOTTOM:
                            offset = value - node.actualRect('bottom');
                            break;
                    }
                    if (offset > 0) {
                        node = getVisibleNode(node.outerWrapper || node) as T;
                        node.modifyBox(region, offset);
                        modified.push(node.id);
                    }
                }
                if (renderParent.layoutVertical) {
                    if (node.blockDimension) {
                        const index = renderParent.renderChildren.findIndex(item => item === node);
                        if (index !== -1) {
                            if (!node.lineBreakLeading) {
                                const previous = renderParent.renderChildren[index - 1];
                                if (previous) {
                                    setSpacingOffset(BOX_STANDARD.MARGIN_TOP, previous.linear.bottom);
                                }
                            }
                            if (!node.lineBreakTrailing) {
                                const next = renderParent.renderChildren[index + 1];
                                if (next) {
                                    setSpacingOffset(BOX_STANDARD.MARGIN_BOTTOM, next.linear.top);
                                }
                            }
                        }
                    }
                }
                else if (!node.alignParent('left')) {
                    let current = node;
                    while (true) {
                        const previous = current.previousSiblings() as T[];
                        if (previous.length && !previous.some(item => item.lineBreak || item.excluded && item.blockStatic)) {
                            const previousSibling = previous.pop() as T;
                            if (previousSibling.inlineVertical) {
                                setSpacingOffset(BOX_STANDARD.MARGIN_LEFT, previousSibling.actualRect('right'));
                            }
                            else if (previousSibling.floating) {
                                current = previousSibling;
                                continue;
                            }
                        }
                        break;
                    }
                }
                else if (renderParent.horizontalRows && node.blockDimension && !node.floating) {
                    found: {
                        let maxBottom = 0;
                        for (let i = 0; i < renderParent.horizontalRows.length; i++) {
                            const row = renderParent.horizontalRows[i];
                            for (let j = 0; j < row.length; j++) {
                                if (node === row[j]) {
                                    if (i > 0) {
                                        setSpacingOffset(BOX_STANDARD.MARGIN_TOP, maxBottom);
                                    }
                                    break found;
                                }
                            }
                            let valid = false;
                            for (const item of row) {
                                if (item.blockDimension && !item.floating && item.linear.bottom > maxBottom) {
                                    maxBottom = item.linear.bottom;
                                    valid = true;
                                }
                            }
                            if (!valid) {
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
}