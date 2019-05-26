import Extension from '../extension';
import Node from '../node';

import { CSS_SPACING } from '../lib/constant';
import { BOX_STANDARD, CSS_STANDARD, NODE_ALIGNMENT } from '../lib/enumeration';

const $const = squared.lib.constant;
const $css = squared.lib.css;
const $session = squared.lib.session;
const $util = squared.lib.util;

const DOCTYPE_HTML = document.doctype !== null && document.doctype.name === 'html';

function setMinHeight(node: Node, offset: number) {
    const minHeight = node.has('minHeight', CSS_STANDARD.LENGTH) ? node.toFloat('minHeight') : 0;
    node.css('minHeight', $css.formatPX(Math.max(offset, minHeight)));
}

function isBlockElement(node: Node | null) {
    return node ? (node.blockStatic || node.display === 'table') && !node.lineBreak : false;
}

function resetMargin(node: Node, value: number) {
    const offset = node[CSS_SPACING.get(value) as string];
    let valid = false;
    if (node.getBox(value)[0] === 0) {
        node.modifyBox(value);
        valid = true;
    }
    else {
        for (const outerWrapper of node.ascendOuter()) {
            if (outerWrapper.getBox(value)[1] >= offset) {
                outerWrapper.modifyBox(value, -offset);
                valid = true;
                break;
            }
        }
    }
    if (node.companion && valid) {
        node.companion.modifyBox(value, -offset, false);
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
        if (node[borderWidth] === 0) {
            if (node[padding] === 0) {
                while (DOCTYPE_HTML && child[margin] === 0 && child[borderWidth] === 0 && child[padding] === 0 && !child.layoutElement && !child.tableElement) {
                    const endChild = (direction ? child.firstChild : child.lastChild) as Node;
                    if (isBlockElement(endChild)) {
                        child = endChild;
                    }
                    else {
                        break;
                    }
                }
                let resetChild = false;
                if (!DOCTYPE_HTML && node[margin] === 0 && child[margin] > 0 && child.cssInitial(margin) === '') {
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
                                node.modifyBox(boxMargin);
                                node.modifyBox(boxMargin, child[margin]);
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
            else if (child[margin] === 0 && child[borderWidth] === 0 && !child.layoutElement && !child.tableElement) {
                let blockAll = true;
                do {
                    const endChild = (direction ? child.firstChild : child.lastChild) as Node;
                    if (endChild && endChild[margin] === 0 && endChild[borderWidth] === 0) {
                        if (endChild[padding] > 0) {
                            if (endChild[padding] >= node[padding]) {
                                node.modifyBox(direction ? BOX_STANDARD.PADDING_TOP : BOX_STANDARD.PADDING_BOTTOM);
                            }
                            else if (blockAll) {
                                node.modifyBox(direction ? BOX_STANDARD.PADDING_TOP : BOX_STANDARD.PADDING_BOTTOM, -endChild[padding]);
                            }
                            break;
                        }
                        else {
                            if (!isBlockElement(endChild)) {
                                blockAll = false;
                            }
                            child = endChild;
                        }
                    }
                    else {
                        break;
                    }
                }
                while (true);
            }
        }
    }
}

export default abstract class WhiteSpace<T extends Node> extends Extension<T> {
    public afterBaseLayout() {
        const processed = new Set<number>();
        const inheritTop = new Set<number>();
        const inheritBottom = new Set<number>();
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
                                if (isBlockElement(previous)) {
                                    let marginBottom = previous.marginBottom;
                                    let marginTop = current.marginTop;
                                    if (previous.excluded && !current.excluded) {
                                        const offset = Math.min(marginBottom, previous.marginTop);
                                        if (offset < 0) {
                                            const top = Math.abs(offset) >= marginTop ? undefined : offset;
                                            current.modifyBox(BOX_STANDARD.MARGIN_TOP, top);
                                            if (current.companion) {
                                                current.companion.modifyBox(BOX_STANDARD.MARGIN_TOP, top);
                                            }
                                            processed.add(previous.id);
                                        }
                                    }
                                    else if (!previous.excluded && current.excluded) {
                                        const offset = Math.min(marginTop, current.marginBottom);
                                        if (offset < 0) {
                                            previous.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, Math.abs(offset) >= marginBottom ? undefined : offset);
                                            processed.add(current.id);
                                        }
                                    }
                                    else {
                                        if (previous.paddingBottom === 0 && previous.borderBottomWidth === 0) {
                                            const bottomChild = previous.lastChild as T;
                                            if (isBlockElement(bottomChild) && bottomChild.getBox(BOX_STANDARD.MARGIN_BOTTOM)[0] !== 1) {
                                                const childBottom = bottomChild.marginBottom;
                                                if (childBottom > marginBottom) {
                                                    marginBottom = childBottom;
                                                    previous.css('marginBottom', $css.formatPX(marginBottom), true);
                                                    inheritBottom.add(previous.id);
                                                }
                                                resetMargin(bottomChild, BOX_STANDARD.MARGIN_BOTTOM);
                                            }
                                        }
                                        if (current.borderTopWidth === 0 && current.paddingTop === 0) {
                                            const topChild = current.firstChild as T;
                                            if (isBlockElement(topChild) && topChild.getBox(BOX_STANDARD.MARGIN_TOP)[0] !== 1) {
                                                const childTop = topChild.marginTop;
                                                if (childTop > marginTop) {
                                                    marginTop = childTop;
                                                    current.css('marginTop', $css.formatPX(marginTop), true);
                                                    inheritTop.add(current.id);
                                                }
                                                resetMargin(topChild, BOX_STANDARD.MARGIN_TOP);
                                            }
                                        }
                                        if (marginBottom > 0) {
                                            if (marginTop > 0) {
                                                if (!inheritTop.has(current.id) || !inheritBottom.has(previous.id) || !$util.hasBit(current.overflow, NODE_ALIGNMENT.BLOCK) && !$util.hasBit(previous.overflow, NODE_ALIGNMENT.BLOCK)) {
                                                    if (marginTop <= marginBottom) {
                                                        if (inheritTop.has(current.id)) {
                                                            current.css('marginTop', $const.CSS.PX_0, true);
                                                        }
                                                        else {
                                                            resetMargin(current, BOX_STANDARD.MARGIN_TOP);
                                                        }
                                                    }
                                                    else {
                                                        if (inheritBottom.has(previous.id)) {
                                                            current.css('marginBottom', $const.CSS.PX_0, true);
                                                        }
                                                        else {
                                                            resetMargin(previous, BOX_STANDARD.MARGIN_BOTTOM);
                                                        }
                                                    }
                                                }
                                            }
                                            else if (previous.bounds.height === 0) {
                                                resetMargin(previous, BOX_STANDARD.MARGIN_BOTTOM);
                                            }
                                        }
                                    }
                                }
                                else if (previous.blockDimension && !previous.block && current.length === 0) {
                                    const offset = current.linear.top - previous.linear.bottom;
                                    if (Math.floor(offset) > 0 && current.ascend(false, item => item.has($const.CSS.HEIGHT)).length === 0) {
                                        current.modifyBox(BOX_STANDARD.MARGIN_TOP, offset);
                                    }
                                }
                            }
                        }
                    }
                }
                if (!$util.hasBit(node.overflow, NODE_ALIGNMENT.BLOCK) && !(node.documentParent.layoutElement && node.documentParent.css('flexDirection') === 'column')) {
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
            if (!processed.has(node.id) && node.lineBreak && !node.lineBreakTrailing) {
                const previousSiblings = node.previousSiblings({ floating: false }) as T[];
                const nextSiblings = node.nextSiblings({ floating: false }) as T[];
                let valid = false;
                if (previousSiblings.length && nextSiblings.length) {
                    let above = previousSiblings.pop() as T;
                    const below = nextSiblings.pop() as T;
                    if (above.inlineStatic && below.inlineStatic) {
                        if (previousSiblings.length === 0) {
                            processed.add(node.id);
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
                        const aboveParent = above.renderParent;
                        const belowParent = below.renderParent;
                        if (aboveParent && belowParent) {
                            const aboveGroup = aboveParent.groupParent && aboveParent.lastChild === above;
                            const belowGroup = belowParent.groupParent && belowParent.firstChild === below;
                            if (aboveGroup && belowGroup) {
                                belowParent.modifyBox(BOX_STANDARD.MARGIN_TOP, belowParent.linear.top - aboveParent.linear.bottom);
                            }
                            else if (belowGroup) {
                                belowParent.modifyBox(BOX_STANDARD.MARGIN_TOP, offset);
                            }
                            else if (aboveGroup) {
                                aboveParent.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, offset);
                            }
                            else if (belowParent.layoutVertical && below.visible) {
                                below.modifyBox(BOX_STANDARD.MARGIN_TOP, offset);
                            }
                            else if (aboveParent.layoutVertical && above.visible) {
                                above.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, offset);
                            }
                        }
                        else {
                            const actualParent = node.actualParent;
                            if (actualParent) {
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
                            const offset = actualParent.box.bottom - previousStart.linear[previousStart.lineBreak || previousStart.excluded ? $const.CSS.TOP : $const.CSS.BOTTOM];
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
                            const offset = nextStart.linear[nextStart.lineBreak || nextStart.excluded ? $const.CSS.BOTTOM : $const.CSS.TOP] - actualParent.box.top;
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
                        processed.add(item.id);
                    }
                    for (const item of nextSiblings) {
                        processed.add(item.id);
                    }
                }
            }
        }
    }

    public afterConstraints() {
        for (const node of this.application.processing.cache) {
            const renderParent = node.renderParent;
            if (renderParent && node.pageFlow) {
                function setSpacingOffset(region: number, value: number) {
                    let offset = 0 ;
                    switch (region) {
                        case BOX_STANDARD.MARGIN_LEFT:
                            offset = node.actualRect($const.CSS.LEFT) - value;
                            break;
                        case BOX_STANDARD.MARGIN_TOP:
                            offset = node.actualRect($const.CSS.TOP) - value;
                            break;
                    }
                    if (offset > 0) {
                        (node.renderAs || node.outerWrapper || node).modifyBox(region, offset);
                    }
                }
                if (node.styleElement && node.inlineVertical && !node.positioned && !node.documentParent.layoutElement && !renderParent.tableElement) {
                    if (node.blockDimension && !node.floating) {
                        let horizontal: T[] | undefined;
                        if (renderParent.layoutVertical) {
                            if (!node.lineBreakLeading) {
                                const index = renderParent.renderChildren.findIndex(item => item === node);
                                if (index !== -1) {
                                    const previous = renderParent.renderChildren[index - 1];
                                    if (previous && previous.pageFlow) {
                                        setSpacingOffset(BOX_STANDARD.MARGIN_TOP, previous.linear.bottom);
                                    }
                                }
                            }
                        }
                        else if (renderParent.horizontalRows) {
                            found: {
                                let maxBottom = Number.NEGATIVE_INFINITY;
                                for (let i = 0; i < renderParent.horizontalRows.length; i++) {
                                    const row = renderParent.horizontalRows[i] as T[];
                                    for (let j = 0; j < row.length; j++) {
                                        if (node === row[j]) {
                                            if (i > 0) {
                                                setSpacingOffset(BOX_STANDARD.MARGIN_TOP, maxBottom);
                                            }
                                            else {
                                                horizontal = row;
                                            }
                                            break found;
                                        }
                                    }
                                    for (const item of row) {
                                        if (item.blockDimension && !item.floating && item.linear.bottom > maxBottom) {
                                            maxBottom = item.linear.bottom;
                                        }
                                    }
                                    if (maxBottom === Number.NEGATIVE_INFINITY) {
                                        break;
                                    }
                                }
                            }
                        }
                        else if (renderParent.layoutHorizontal) {
                            horizontal = renderParent.renderChildren as T[];
                        }
                        if (horizontal) {
                            const actualParent = node.actualParent;
                            if (actualParent) {
                                let maxBottom = Number.NEGATIVE_INFINITY;
                                for (const item of actualParent.actualChildren) {
                                    if (horizontal.includes(item as T)) {
                                        break;
                                    }
                                    else if (item.lineBreak) {
                                        maxBottom = Number.NEGATIVE_INFINITY;
                                    }
                                    else if (item.blockDimension && !item.floating && item.linear.bottom > maxBottom) {
                                        maxBottom = item.linear.bottom;
                                    }
                                }
                                if (maxBottom !== Number.NEGATIVE_INFINITY && node.linear.top > maxBottom) {
                                    setSpacingOffset(BOX_STANDARD.MARGIN_TOP, maxBottom);
                                }
                            }
                        }
                    }
                    if (!node.alignParent($const.CSS.LEFT)) {
                        let current = node;
                        while (true) {
                            const siblingsLeading = current.siblingsLeading;
                            if (siblingsLeading.length && !siblingsLeading.some(item => item.lineBreak || item.excluded && item.blockStatic)) {
                                const previousSibling = siblingsLeading[0] as T;
                                if (previousSibling.inlineVertical) {
                                    setSpacingOffset(BOX_STANDARD.MARGIN_LEFT, previousSibling.actualRect($const.CSS.RIGHT));
                                }
                                else if (previousSibling.floating) {
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
    }
}