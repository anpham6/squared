import Extension from '../extension';
import Node from '../node';

import { BOX_STANDARD, CSS_STANDARD } from '../lib/enumeration';

const $session = squared.lib.session;
const $css = squared.lib.css;
const $util = squared.lib.util;

const HTML5 = document.doctype ? document.doctype.name === 'html' : false;

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
    node.modifyBox(value, null);
    if (node.companion) {
        node.companion.modifyBox(value, null);
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
            while (child[margin] === 0 && child[borderWidth] === 0 && child[padding] === 0) {
                const endChild = (direction ? child.firstChild : child.lastChild) as Node;
                if (isBlockElement(endChild)) {
                    child = endChild;
                }
                else {
                    break;
                }
            }
            if (child.valueBox(boxMargin)[0] !== 1) {
                if (HTML5 && node[margin] < child[margin]) {
                    const visibleParent = getVisibleNode(node);
                    visibleParent.modifyBox(boxMargin, null);
                    visibleParent.modifyBox(boxMargin, child[margin]);
                }
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
                        if (firstChild === undefined) {
                            firstChild = current;
                        }
                        lastChild = current;
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
                                            if (isBlockElement(bottomChild) && bottomChild.valueBox(BOX_STANDARD.MARGIN_BOTTOM)[0] !== 1) {
                                                const childMarginBottom = $util.convertFloat(bottomChild.cssInitial('marginBottom', false, true));
                                                if (childMarginBottom > marginBottom) {
                                                    marginBottom = childMarginBottom;
                                                    previousVisible.css('marginBottom', $css.formatPX(marginBottom), true);
                                                }
                                                resetMargin(getVisibleNode(bottomChild), BOX_STANDARD.MARGIN_BOTTOM);
                                            }
                                        }
                                        if (current.borderTopWidth === 0 && current.paddingTop === 0) {
                                            const topChild = current.firstChild as T;
                                            if (isBlockElement(topChild) && topChild.valueBox(BOX_STANDARD.MARGIN_TOP)[0] !== 1) {
                                                const childMarginTop = $util.convertFloat(topChild.cssInitial('marginTop', false, true));
                                                if (childMarginTop > marginTop) {
                                                    marginTop = childMarginTop;
                                                    currentVisible.css('marginTop', $css.formatPX(marginTop), true);
                                                }
                                                resetMargin(getVisibleNode(topChild), BOX_STANDARD.MARGIN_TOP);
                                            }
                                        }
                                        if (marginBottom > 0) {
                                            if (marginTop > 0) {
                                                if (marginTop <= marginBottom) {
                                                    resetMargin(currentVisible, BOX_STANDARD.MARGIN_TOP);
                                                }
                                                else {
                                                    resetMargin(previousVisible, BOX_STANDARD.MARGIN_BOTTOM);
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
                                if (abovePrevious.bounds.bottom !== 0) {
                                    above = abovePrevious;
                                }
                            }
                        }
                    }
                    valid = true;
                    let offset: number;
                    if (below.lineHeight > 0 && below.element && below.cssTry('lineHeight', '0px')) {
                        offset = $session.getClientRect(below.element, below.sessionId).top - below.marginTop;
                        below.cssFinally('lineHeight');
                    }
                    else {
                        offset = below.linear.top;
                    }
                    if (above.lineHeight > 0 && above.element && above.cssTry('lineHeight', '0px')) {
                        offset -= $session.getClientRect(above.element, above.sessionId).bottom + above.marginBottom;
                        above.cssFinally('lineHeight');
                    }
                    else {
                        offset -= above.linear.bottom;
                    }
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
            if (renderParent && node.pageFlow && node.styleElement && node.inlineVertical && !node.documentParent.layoutElement && !renderParent.tableElement && !modified.includes(node.id)) {
                function setSpacingOffset(region: number, value: number) {
                    const offset = (region === BOX_STANDARD.MARGIN_LEFT ? node.actualRect('left') : node.actualRect('top')) - value;
                    if (offset > 0) {
                        node = getVisibleNode(node.outerWrapper || node) as T;
                        node.modifyBox(region, offset);
                        modified.push(node.id);
                    }
                }
                if (renderParent.layoutVertical) {
                    if (node.blockDimension && !node.lineBreakLeading) {
                        const index = renderParent.renderChildren.findIndex(item => item === node);
                        if (index > 0) {
                            setSpacingOffset(BOX_STANDARD.MARGIN_TOP, renderParent.renderChildren[index - 1].linear.bottom);
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