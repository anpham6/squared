import Extension from '../extension';
import Node from '../node';

import { BOX_STANDARD, CSS_STANDARD, NODE_ALIGNMENT } from '../lib/enumeration';

const $util = squared.lib.util;

function setMinHeight<T extends Node>(node: T, offset: number) {
    const minHeight = node.has('minHeight', CSS_STANDARD.LENGTH) ? node.toFloat('minHeight') : 0;
    node.css('minHeight', $util.formatPX(Math.max(offset, minHeight)));
}

function isBlockElement<T extends Node>(node: T | undefined) {
    return node ? node.blockStatic && !node.lineBreak && !node.positioned : false;
}

function getVisibleNode<T extends Node>(node: T) {
    return node.visible || node.excluded ? node : node.renderAs || node.outerParent || node.innerChild || node;
}

function applyMarginCollapse<T extends Node>(node: T, visibleNode: T, child: T, direction: boolean) {
    if (isBlockElement(child)) {
        const HTML5 = document.doctype ? document.doctype.name === 'html' : false;
        if (direction) {
            if (node.borderTopWidth === 0 && node.paddingTop === 0) {
                let replaced = false;
                if (child.marginTop === 0 && child.borderTopWidth === 0 && child.paddingTop === 0) {
                    const firstChild = child.firstChild as T;
                    if (isBlockElement(firstChild)) {
                        if (child.has('marginTop', CSS_STANDARD.ZERO)) {
                            if (HTML5 && firstChild.marginTop !== 0) {
                                firstChild.modifyBox(BOX_STANDARD.MARGIN_TOP, null);
                            }
                        }
                        else {
                            child = firstChild;
                            replaced = true;
                        }
                    }
                }
                if (HTML5 && node.marginTop < child.marginTop) {
                    if (node.elementId === '')  {
                        visibleNode.modifyBox(BOX_STANDARD.MARGIN_TOP, null);
                    }
                    if (!replaced && !node.documentBody) {
                        if (child.marginTop > node.marginTop) {
                            if (node.elementId !== '')  {
                                visibleNode.modifyBox(BOX_STANDARD.MARGIN_TOP, null);
                            }
                            visibleNode.modifyBox(BOX_STANDARD.MARGIN_TOP, child.marginTop);
                        }
                        child.modifyBox(BOX_STANDARD.MARGIN_TOP, null);
                        if (child.companion) {
                            child.companion.modifyBox(BOX_STANDARD.MARGIN_TOP, null);
                        }
                    }
                }
                else if (node.naturalElement && node.marginTop > 0) {
                    let valid = false;
                    if (node.visible && child.visible) {
                        child.modifyBox(BOX_STANDARD.MARGIN_TOP, null);
                        valid = true;
                    }
                    else {
                        let replacement: T | undefined;
                        if (child.outerParent) {
                            replacement = child.outerParent as T;
                        }
                        else if (child.innerChild) {
                            replacement = child.innerChild as T;
                        }
                        if (replacement) {
                            replacement.modifyBox(BOX_STANDARD.MARGIN_TOP, -child.marginTop, false);
                            child = replacement;
                            valid = true;
                        }
                    }
                    if (valid && child.companion) {
                        child.companion.modifyBox(BOX_STANDARD.MARGIN_TOP, null);
                    }
                }
            }
        }
        else {
            if (node.paddingBottom === 0 && node.borderBottomWidth === 0) {
                let replaced = false;
                if (child.paddingBottom === 0 && child.borderBottomWidth === 0 && child.marginBottom === 0) {
                    const lastChild = child.lastChild as T;
                    if (isBlockElement(lastChild)) {
                        if (child.has('marginBottom', CSS_STANDARD.ZERO)) {
                            if (HTML5 && lastChild.marginBottom !== 0) {
                                lastChild.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, null);
                            }
                        }
                        else {
                            child = lastChild;
                            replaced = true;
                        }
                    }
                }
                if (HTML5 && node.marginBottom < child.marginBottom) {
                    if (node.elementId === '')  {
                        visibleNode.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, null);
                    }
                    if (!replaced && !node.documentBody) {
                        if (child.marginBottom > node.marginBottom) {
                            if (node.elementId !== '')  {
                                visibleNode.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, null);
                            }
                            visibleNode.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, child.marginBottom);
                        }
                        child.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, null);
                        if (child.companion) {
                            child.companion.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, null);
                        }
                    }
                }
                else if (node.naturalElement && node.marginBottom > 0) {
                    let valid = false;
                    if (node.visible && child.visible) {
                        child.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, null);
                        valid = true;
                    }
                    else {
                        let replacement: T | undefined;
                        if (child.outerParent) {
                            replacement = child.outerParent as T;
                        }
                        else if (child.innerChild) {
                            replacement = child.innerChild as T;
                        }
                        if (replacement) {
                            replacement.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, -child.marginBottom, false);
                            child = replacement;
                            valid = true;
                        }
                    }
                    if (valid && child.companion) {
                        child.companion.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, null);
                    }
                }
            }
        }
    }
}

export default abstract class WhiteSpace<T extends Node> extends Extension<T> {
    public afterBaseLayout() {
        const processed = new Set<T>();
        for (const node of this.application.processing.cache) {
            if (node.naturalElement) {
                const children = node.actualChildren;
                let firstChild: T | undefined;
                let lastChild: T | undefined;
                for (let i = 0; i < children.length; i++) {
                    const current = children[i] as T;
                    if (node.blockStatic) {
                        if (firstChild === undefined) {
                            firstChild = current;
                        }
                        lastChild = current;
                    }
                    if (i === 0) {
                        continue;
                    }
                    if (isBlockElement(current)) {
                        const previousSiblings = current.previousSiblings(true, true, true);
                        if (previousSiblings.length) {
                            const previous = previousSiblings.find(item => !item.floating) as T;
                            const currentVisible = getVisibleNode(current);
                            if (isBlockElement(previous)) {
                                const previousVisible = getVisibleNode(previous);
                                let marginBottom = $util.convertFloat(previous.cssInitial('marginBottom', false, true));
                                let marginTop = $util.convertFloat(current.cssInitial('marginTop', false, true));
                                if (previous.excluded && !current.excluded) {
                                    const offset = Math.min(marginBottom, $util.convertFloat(previous.cssInitial('marginTop', false, true)));
                                    if (offset < 0) {
                                        const top = Math.abs(offset) >= marginTop ? null : offset;
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
                                        previousVisible.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, Math.abs(offset) >= marginBottom ? null : offset);
                                        processed.add(current);
                                    }
                                }
                                else {
                                    if (previous.paddingBottom === 0 && previous.borderBottomWidth === 0) {
                                        const bottomChild = previous.lastChild as T;
                                        if (isBlockElement(bottomChild) && bottomChild.elementId === '') {
                                            const childMarginBottom = $util.convertFloat(bottomChild.cssInitial('marginBottom', false, true));
                                            if (childMarginBottom > marginBottom) {
                                                marginBottom = childMarginBottom;
                                                previous.css('marginBottom', $util.formatPX(marginBottom), true);
                                            }
                                            if (previous.visible) {
                                                bottomChild.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, null);
                                                if (bottomChild.companion) {
                                                    bottomChild.companion.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, null);
                                                }
                                            }
                                        }
                                    }
                                    if (current.borderTopWidth === 0 && current.paddingTop === 0) {
                                        const topChild = current.firstChild as T;
                                        if (isBlockElement(topChild) && topChild.elementId === '') {
                                            const childMarginTop = $util.convertFloat(topChild.cssInitial('marginTop', false, true));
                                            if (childMarginTop > marginTop) {
                                                marginTop = childMarginTop;
                                                current.css('marginTop', $util.formatPX(marginTop), true);
                                            }
                                            if (current.visible) {
                                                topChild.modifyBox(BOX_STANDARD.MARGIN_TOP, null);
                                                if (topChild.companion) {
                                                    topChild.companion.modifyBox(BOX_STANDARD.MARGIN_TOP, null);
                                                }
                                            }
                                        }
                                    }
                                    if (marginBottom > 0 && marginTop > 0) {
                                        if (marginTop <= marginBottom) {
                                            currentVisible.modifyBox(BOX_STANDARD.MARGIN_TOP, null);
                                            if (currentVisible.companion) {
                                                currentVisible.companion.modifyBox(BOX_STANDARD.MARGIN_TOP, null);
                                            }
                                        }
                                        else {
                                            previousVisible.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, null);
                                            if (previousVisible.companion) {
                                                previousVisible.companion.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, null);
                                            }
                                        }
                                    }
                                }
                            }
                            else if (previous && previous.tagName === 'IMG') {
                                const offset = current.linear.top - previous.linear.bottom;
                                if (offset > 0 && !current.ascend(true).some(item => item.has('height'))) {
                                    currentVisible.modifyBox(BOX_STANDARD.MARGIN_TOP, offset);
                                }
                            }
                        }
                    }
                }
                const visibleNode = getVisibleNode(node);
                if (firstChild) {
                    applyMarginCollapse(node, visibleNode, firstChild, true);
                }
                if (lastChild) {
                    applyMarginCollapse(node, visibleNode, lastChild, false);
                }
            }
        }
        for (const node of this.application.processing.excluded) {
            if (!processed.has(node)) {
                if (node.lineBreak) {
                    const actualParent = node.actualParent;
                    const previousSiblings = node.previousSiblings(true, true, true) as T[];
                    const nextSiblings = node.nextSiblings(true, true, true) as T[];
                    let valid = false;
                    if (previousSiblings.length && nextSiblings.length) {
                        if (nextSiblings[0].lineBreak) {
                            continue;
                        }
                        else {
                            let above = previousSiblings.pop() as T;
                            const below = nextSiblings.pop() as T;
                            if (above.inlineStatic && below.inlineStatic) {
                                if (previousSiblings.length === 0) {
                                    processed.add(node);
                                    continue;
                                }
                                else {
                                    const abovePrevious = previousSiblings.pop() as T;
                                    if (abovePrevious.lineBreak) {
                                        abovePrevious.setBounds();
                                        if (abovePrevious.bounds.bottom !== 0) {
                                            above = abovePrevious;
                                        }
                                    }
                                }
                            }
                            valid = true;
                            let offset: number;
                            if (below.lineHeight > 0 && below.element && below.cssTry('lineHeight', '0px')) {
                                offset = below.element.getBoundingClientRect().top - below.marginTop;
                                below.cssFinally('lineHeight');
                            }
                            else {
                                offset = below.linear.top;
                            }
                            if (above.lineHeight > 0 && above.element && above.cssTry('lineHeight', '0px')) {
                                offset -= above.element.getBoundingClientRect().bottom + above.marginBottom;
                                above.cssFinally('lineHeight');
                            }
                            else {
                                offset -= above.linear.bottom;
                            }
                            if (offset !== 0) {
                                const aboveParent = above.visible && above.renderParent;
                                const belowParent = below.visible && below.renderParent;
                                if (belowParent && belowParent.groupParent && belowParent.firstChild === below) {
                                    belowParent.modifyBox(BOX_STANDARD.MARGIN_TOP, offset);
                                }
                                else if (aboveParent && aboveParent.groupParent && aboveParent.lastChild === above) {
                                    aboveParent.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, offset);
                                }
                                else if (belowParent && belowParent.layoutVertical && (below.visible || below.renderAs)) {
                                    (below.renderAs || below).modifyBox(BOX_STANDARD.MARGIN_TOP, offset);
                                }
                                else if (aboveParent && aboveParent.layoutVertical && (above.visible || above.renderAs)) {
                                    (above.renderAs || above).modifyBox(BOX_STANDARD.MARGIN_BOTTOM, offset);
                                }
                                else if (!belowParent && !aboveParent && actualParent && actualParent.visible) {
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
                    else if (actualParent && actualParent.visible) {
                        if (!actualParent.documentRoot && previousSiblings.length) {
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
                    if (valid) {
                        for (const item of previousSiblings) {
                            processed.add(item);
                        }
                        for (const item of nextSiblings) {
                            processed.add(item);
                        }
                    }
                }
                else {
                    const below = node.nextSiblings(true, true, true).pop();
                    if (below && below.visible) {
                        const previousSiblings = node.previousSiblings(false, false) as T[];
                        let offset = below.linear.top;
                        if (previousSiblings.length) {
                            const previous = previousSiblings.pop() as T;
                            offset -= previous.linear.bottom;
                        }
                        else {
                            offset -= node.linear.top;
                        }
                        if (offset > 0) {
                            below.modifyBox(BOX_STANDARD.MARGIN_TOP, offset);
                        }
                    }
                }
            }
        }
    }

    public afterConstraints() {
        for (const node of this.application.processing.cache) {
            const renderParent = node.renderAs ? node.renderAs.renderParent : node.renderParent;
            if (renderParent && !renderParent.hasAlign(NODE_ALIGNMENT.AUTO_LAYOUT) && node.pageFlow && node.styleElement && node.inlineVertical && !node.alignParent('left')) {
                const previous: T[] = [];
                let current = node;
                while (true) {
                    $util.concatArray(previous, current.previousSiblings());
                    if (previous.length && !previous.some(item => item.lineBreak || item.excluded && item.blockStatic)) {
                        const previousSibling = previous[previous.length - 1];
                        if (previousSibling.inlineVertical) {
                            const offset = node.linear.left - previousSibling.actualRight();
                            if (offset > 0) {
                                getVisibleNode(node).modifyBox(BOX_STANDARD.MARGIN_LEFT, offset);
                            }
                        }
                        else if (previousSibling.floating) {
                            previous.length = 0;
                            current = previousSibling;
                            continue;
                        }
                    }
                    break;
                }
            }
        }
    }
}