import BOX_STANDARD = squared.base.lib.constant.BOX_STANDARD;
import NODE_ALIGNMENT = squared.base.lib.constant.NODE_ALIGNMENT;

import type NodeUI from '../node-ui';

import ExtensionUI from '../extension-ui';

const { formatPX } = squared.lib.css;
const { iterateReverseArray, minMaxOf, startsWith } = squared.lib.util;

const DOCTYPE_HTML = !!document.doctype && document.doctype.name === 'html';

function setSpacingOffset(node: NodeUI, region: number, value: number, adjustment = 0) {
    let offset: number;
    switch (region) {
        case BOX_STANDARD.MARGIN_TOP:
            offset = node.actualRect('top') - value;
            break;
        case BOX_STANDARD.MARGIN_LEFT:
            offset = node.actualRect('left') - value;
            break;
        case BOX_STANDARD.MARGIN_BOTTOM:
            offset = value - node.actualRect('bottom');
            break;
        default:
            offset = 0;
            break;
    }
    offset -= adjustment;
    if (offset > 0) {
        (node.renderAs || node).modifyBox(region, offset);
    }
}

function adjustRegion(item: NodeUI, region: number, adjustment: number) {
    if (item.getBox(region)[0]) {
        const registered = item.registerBox(region);
        if (registered) {
            const [reset, value] = registered.getBox(region);
            adjustment = Math.max(value, adjustment);
            if (reset === 1) {
                registered.setBox(region, { adjustment });
            }
            else {
                registered.setCacheValue(region === BOX_STANDARD.MARGIN_TOP ? 'marginTop' : 'marginBottom', adjustment);
            }
            return;
        }
    }
    item.setBox(region, { reset: 1, adjustment });
}

function isBlockElement(node: Null<NodeUI>, direction?: boolean): boolean {
    if (!node || !node.styleElement || node.floating || node.lineBreak) {
        return false;
    }
    const display = node.display;
    if (!startsWith(display, 'inline-')) {
        if (node.blockStatic || display === 'table' || display === 'list-item') {
            return true;
        }
        if (direction !== undefined) {
            if (direction) {
                const firstChild = node.firstStaticChild as NodeUI;
                return isBlockElement(firstChild) && validAboveChild(firstChild);
            }
            const lastChild = node.lastStaticChild as NodeUI;
            return isBlockElement(lastChild) && validBelowChild(lastChild);
        }
    }
    return false;
}

function getMarginOffset<T extends NodeUI>(below: T, above: T, lineHeight: number, aboveLineBreak?: Null<T>): [number, T] {
    let top = Infinity;
    if (below.nodeGroup && below.find(item => item.floating)) {
        below.renderEach((item: T) => {
            if (!item.floating) {
                const topA = item.linear.top;
                if (topA < top) {
                    top = topA;
                    below = item;
                }
            }
        });
    }
    if (top === Infinity) {
        top = below.linear.top;
    }
    if (aboveLineBreak) {
        const bottom = Math.max(aboveLineBreak.linear.top, above.linear.bottom);
        if (bottom < top) {
            return [top - bottom - lineHeight, below];
        }
    }
    return [Math.round(top - above.linear.bottom - lineHeight), below];
}

function getBottomChild(node: NodeUI) {
    let bottomChild: Null<NodeUI> = null;
    if (!node.floatContainer) {
        bottomChild = node.lastStaticChild;
        if (!isBlockElement(node, false) || bottomChild && node.hasHeight && Math.floor(bottomChild.linear.bottom) < node.box.bottom) {
            bottomChild = null;
        }
    }
    else {
        let bottomFloat: Undef<NodeUI>;
        const children = node.naturalChildren;
        for (let j = children.length - 1; j >= 0; --j) {
            const item = children[j] as NodeUI;
            if (item.pageFlow) {
                if (item.floating) {
                    if (!bottomChild) {
                        const bottom = item.linear.bottom;
                        if (bottomFloat) {
                            if (bottom > bottomFloat.linear.bottom) {
                                bottomFloat = item;
                            }
                        }
                        else if (Math.ceil(item.linear.bottom) >= node.box.bottom) {
                            bottomFloat = item;
                        }
                    }
                    else if (item.linear.bottom >= bottomChild.linear.bottom) {
                        bottomChild = item;
                        break;
                    }
                }
                else if (!bottomChild) {
                    if (bottomFloat && bottomFloat.linear.bottom > item.linear.bottom) {
                        bottomChild = bottomFloat;
                        break;
                    }
                    bottomChild = item;
                }
            }
        }
        if (bottomFloat && !bottomChild) {
            bottomChild = bottomFloat;
        }
    }
    return bottomChild;
}

function checkOverflowValue(value: string) {
    switch (value) {
        case 'auto':
        case 'hidden':
        case 'overlay':
            return false;
    }
    return true;
}

function getMarginTop(node: NodeUI, opposing: NodeUI, check: boolean): [number, boolean] {
    let marginTop = node.marginTop,
        current = node,
        inherited = false;
    while (validBelowChild(current)) {
        let child = current.firstStaticChild as NodeUI;
        if (isBlockElement(child, true) && !child.getBox(BOX_STANDARD.MARGIN_TOP)[0]) {
            let childTop = child.marginTop,
                currentChild = child;
            while (currentChild.bounds.height === 0 && !currentChild.pseudoElement) {
                const currentBottom = currentChild.marginBottom;
                childTop = Math.max(currentChild.marginTop, currentBottom, childTop);
                if (currentBottom !== 0) {
                    resetBox(currentChild, BOX_STANDARD.MARGIN_BOTTOM);
                }
                if (currentChild.every(item => item.floating || !item.pageFlow)) {
                    const nextChild = currentChild.firstStaticChild;
                    if (nextChild) {
                        childTop = nextChild.marginTop;
                        currentChild = nextChild;
                    }
                    else {
                        break;
                    }
                }
                else {
                    const sibling = currentChild.nextSibling;
                    if (sibling) {
                        if (sibling.marginTop >= childTop) {
                            if (currentChild.marginTop !== 0) {
                                resetBox(currentChild, BOX_STANDARD.MARGIN_TOP);
                            }
                            child = sibling;
                            childTop = sibling.marginTop;
                            currentChild = sibling;
                        }
                        else if (sibling.bounds.height) {
                            break;
                        }
                        else {
                            if (sibling.marginTop !== 0) {
                                resetBox(sibling, BOX_STANDARD.MARGIN_TOP);
                            }
                            currentChild = sibling;
                        }
                    }
                    else {
                        break;
                    }
                }
            }
            if (childTop !== 0) {
                if (!check) {
                    resetBox(child, BOX_STANDARD.MARGIN_TOP, !node.getBox(BOX_STANDARD.MARGIN_TOP)[0] ? node : undefined);
                }
                if (marginTop < 0) {
                    if (childTop > getMarginBottom(opposing, node, true)[0]) {
                        marginTop += childTop;
                        inherited = true;
                    }
                }
                else if (childTop > marginTop) {
                    marginTop = childTop;
                    inherited = true;
                }
            }
            current = child;
        }
        else {
            break;
        }
    }
    return [marginTop, inherited];
}

function getMarginBottom(node: NodeUI, opposing: NodeUI, check: boolean, resetting?: NodeUI[]): [number, boolean] {
    let marginBottom = node.marginBottom,
        current = node,
        inherited = false;
    while (validAboveChild(current)) {
        let child = getBottomChild(current);
        if (child && !child.getBox(BOX_STANDARD.MARGIN_BOTTOM)[0]) {
            let childBottom = child.marginBottom,
                currentChild = child;
            while (currentChild.bounds.height === 0 && !currentChild.pseudoElement) {
                const currentTop = currentChild.marginTop;
                childBottom = Math.max(currentTop, currentChild.marginBottom, childBottom);
                if (currentTop !== 0) {
                    resetBox(currentChild, BOX_STANDARD.MARGIN_TOP);
                }
                if (currentChild.every(item => item.floating || !item.pageFlow)) {
                    const nextChild = getBottomChild(currentChild);
                    if (nextChild) {
                        childBottom = nextChild.marginBottom;
                        currentChild = nextChild;
                    }
                    else {
                        break;
                    }
                }
                else {
                    const sibling = currentChild.previousSibling;
                    if (sibling) {
                        if (sibling.marginBottom >= childBottom) {
                            if (currentChild.marginBottom !== 0) {
                                resetBox(currentChild, BOX_STANDARD.MARGIN_BOTTOM);
                            }
                            child = sibling;
                            childBottom = sibling.marginBottom;
                            currentChild = sibling;
                        }
                        else if (sibling.bounds.height) {
                            break;
                        }
                        else {
                            if (sibling.marginBottom !== 0) {
                                resetBox(sibling, BOX_STANDARD.MARGIN_BOTTOM);
                            }
                            currentChild = sibling;
                        }
                    }
                    else {
                        break;
                    }
                }
            }
            if (childBottom !== 0) {
                if (!check) {
                    resetBox(child, BOX_STANDARD.MARGIN_BOTTOM, !node.getBox(BOX_STANDARD.MARGIN_BOTTOM)[0] ? node : undefined);
                    if (resetting && hasOverflow(node)) {
                        resetting.push(child);
                    }
                }
                if (marginBottom < 0) {
                    if (childBottom > getMarginTop(opposing, node, true)[0]) {
                        marginBottom += childBottom;
                        inherited = true;
                    }
                }
                else if (childBottom > marginBottom) {
                    marginBottom = childBottom;
                    inherited = true;
                }
            }
            current = child;
        }
        else {
            break;
        }
    }
    return [marginBottom, inherited];
}

function resetBox(node: NodeUI, region: number, register?: NodeUI, wrapper?: NodeUI[]) {
    node.setBox(region, { reset: 1 });
    if (register) {
        node.registerBox(region, register);
    }
    if (wrapper) {
        wrapper.forEach(parent => parent.setBox(region, { reset: 1 }));
    }
}

const canResetChild = (node: NodeUI) => isBlockElement(node) && !node.layoutElement && !node.tableElement && node.tagName !== 'FIELDSET';
const validBelowChild = (node: NodeUI) => node.borderTopWidth === 0 && node.paddingTop === 0 && canResetChild(node);
const validAboveChild = (node: NodeUI) => node.borderBottomWidth === 0 && node.paddingBottom === 0 && canResetChild(node);
const hasOverflow = (node: NodeUI) => checkOverflowValue(node.valueOf('overflowY')) || checkOverflowValue(node.valueOf('overflowX'));
const isLowestElement = (node: NodeUI, siblings: NodeUI[]) => node.linear.bottom >= minMaxOf(siblings, sibling => sibling.linear.bottom, '>')[1];

export default abstract class WhiteSpace<T extends NodeUI> extends ExtensionUI<T> {
    public readonly eventOnly = true;

    public afterBaseLayout(sessionId: string, cache = this.application.getProcessingCache(sessionId)) {
        const clearMap = this.application.clearMap;
        const processed = new WeakSet<T>();
        const resetting: T[] = [];
        cache.each(node => {
            if (node.naturalElement && !node.hasAlign(NODE_ALIGNMENT.AUTO_LAYOUT)) {
                const children = node.naturalChildren as T[];
                const length = children.length;
                if (length === 0) {
                    return;
                }
                const collapseMargin = node.pageFlow && isBlockElement(node, true) && node.actualParent?.layoutElement !== true && hasOverflow(node) && node.tagName !== 'FIELDSET';
                let firstChild: Undef<T>,
                    lastChild: Undef<T>,
                    previousChild: Undef<T>,
                    belowFloating: Undef<T[]>;
                for (let i = 0; i < length; ++i) {
                    const current = children[i];
                    if (current.pageFlow) {
                        const floating = current.floating;
                        if (collapseMargin) {
                            if (!floating) {
                                firstChild ||= current;
                                lastChild = current;
                            }
                            else if (belowFloating) {
                                if (current.bounds.top === belowFloating[0].bounds.top) {
                                    belowFloating.push(current);
                                }
                                else if (isLowestElement(current, belowFloating)) {
                                    belowFloating = [current];
                                }
                            }
                            else {
                                belowFloating = [current];
                            }
                        }
                        blockMain: {
                            if (isBlockElement(current, true)) {
                                if (i > 0) {
                                    let previous = children[i - 1];
                                    if (previous.floating || !previous.pageFlow) {
                                        if (node.layoutVertical) {
                                            const previousSiblings = current.previousSiblings();
                                            if (previousSiblings.some(sibling => sibling.float === 'right' && current.bounds.top > sibling.bounds.top)) {
                                                const aboveFloating = previousSiblings.filter(sibling => sibling.floating && previous.bounds.top === sibling.bounds.top);
                                                if (aboveFloating.length) {
                                                    const [nearest, previousBottom] = minMaxOf(aboveFloating, sibling => sibling.linear.bottom, '>');
                                                    if (nearest!.marginBottom > 0 && current.bounds.top < previousBottom) {
                                                        if (nearest!.marginBottom < current.marginTop) {
                                                            aboveFloating.forEach(sibling => resetBox(sibling, BOX_STANDARD.MARGIN_BOTTOM));
                                                        }
                                                        else if (current.marginTop > 0) {
                                                            resetBox(current, BOX_STANDARD.MARGIN_TOP);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        if (previousChild) {
                                            previous = previousChild;
                                        }
                                    }
                                    else if (previous.bounds.height === 0 && previous.find(item => item.floating)) {
                                        const value = current.linear.top - previous.max('linear', { subAttr: 'bottom' }).linear.bottom;
                                        if (value < 0) {
                                            current.modifyBox(BOX_STANDARD.MARGIN_TOP, Math.floor(value), false);
                                            continue;
                                        }
                                    }
                                    if (isBlockElement(previous, false)) {
                                        if (previous.marginTop < 0 && previous.bounds.height === 0) {
                                            const offset = Math.min(previous.marginBottom, previous.marginTop);
                                            if (offset < 0) {
                                                if (Math.abs(offset) < current.marginTop) {
                                                    current.modifyBox(BOX_STANDARD.MARGIN_TOP, offset);
                                                }
                                                else {
                                                    resetBox(current, BOX_STANDARD.MARGIN_TOP);
                                                }
                                                processed.add(previous);
                                                previous.hide({ collapse: true });
                                                break blockMain;
                                            }
                                        }
                                        else if (current.marginBottom < 0 && current.bounds.height === 0) {
                                            const offset = Math.min(current.marginTop, current.marginBottom);
                                            if (offset < 0) {
                                                if (Math.abs(offset) < previous.marginBottom) {
                                                    previous.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, offset);
                                                }
                                                else {
                                                    resetBox(previous, BOX_STANDARD.MARGIN_BOTTOM);
                                                }
                                                processed.add(current);
                                                current.hide({ collapse: true });
                                                break blockMain;
                                            }
                                        }
                                        let [marginTop, inheritedTop] = getMarginTop(current, previous, false),
                                            [marginBottom, inheritedBottom] = getMarginBottom(previous, current, false, resetting); // eslint-disable-line prefer-const
                                        if (marginBottom > 0) {
                                            if (marginTop > 0) {
                                                if (marginTop <= marginBottom) {
                                                    if (!inheritedTop || hasOverflow(current)) {
                                                        resetBox(current, BOX_STANDARD.MARGIN_TOP);
                                                        if (current.bounds.height === 0 && marginBottom >= current.marginBottom) {
                                                            resetBox(current, BOX_STANDARD.MARGIN_BOTTOM);
                                                        }
                                                        inheritedTop = false;
                                                    }
                                                }
                                                else if (!inheritedBottom || hasOverflow(previous)) {
                                                    resetBox(previous, BOX_STANDARD.MARGIN_BOTTOM);
                                                    if (previous.bounds.height === 0 && marginTop >= previous.marginTop) {
                                                        resetBox(previous, BOX_STANDARD.MARGIN_TOP);
                                                    }
                                                    inheritedBottom = false;
                                                }
                                            }
                                            else if (current.bounds.height === 0) {
                                                marginTop = Math.min(marginTop, current.marginBottom);
                                                if (marginTop < 0) {
                                                    previous.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, marginTop);
                                                    current.hide({ collapse: true });
                                                }
                                            }
                                        }
                                        if (marginTop > 0 && previous.floatContainer && current.getBox(BOX_STANDARD.MARGIN_TOP)[1] === 0 && hasOverflow(previous)) {
                                            let valid: Undef<boolean>;
                                            if (previous.bounds.height === 0) {
                                                valid = true;
                                            }
                                            else {
                                                let direction: Undef<string>;
                                                iterateReverseArray(previous.naturalElements, (item: T) => {
                                                    if (clearMap.has(item)) {
                                                        return true;
                                                    }
                                                    else if (item.floating) {
                                                        if (item.linear.bottom > Math.ceil(previous.bounds.bottom)) {
                                                            direction = item.float;
                                                        }
                                                        return true;
                                                    }
                                                });
                                                if (direction) {
                                                    switch (previous.elementData!['styleMap::after']?.clear) {
                                                        case direction:
                                                        case 'both':
                                                            valid = false;
                                                            break;
                                                        default:
                                                            valid = true;
                                                            break;
                                                    }
                                                }
                                            }
                                            if (valid) {
                                                current.modifyBox(BOX_STANDARD.MARGIN_TOP, current.linear.top - Math.max(...previous.naturalElements.map(item => item.linear.bottom)), false);
                                            }
                                        }
                                        if (inheritedTop) {
                                            let adjacentBottom = 0;
                                            if (previous.bounds.height === 0) {
                                                const previousSibling = previous.previousSibling;
                                                adjacentBottom = previousSibling && isBlockElement(previousSibling, false) ? Math.max(previousSibling.getBox(BOX_STANDARD.MARGIN_BOTTOM)[1], previousSibling.marginBottom) : 0;
                                            }
                                            if (marginTop > adjacentBottom) {
                                                (current.registerBox(BOX_STANDARD.MARGIN_TOP) || current).setCacheValue('marginTop', marginTop);
                                            }
                                        }
                                        if (inheritedBottom) {
                                            let adjacentTop = 0;
                                            if (current.bounds.height === 0) {
                                                const nextSibling = current.nextSibling;
                                                adjacentTop = nextSibling && isBlockElement(nextSibling, true) ? Math.max(nextSibling.getBox(BOX_STANDARD.MARGIN_TOP)[1], nextSibling.marginTop) : 0;
                                            }
                                            if (marginBottom >= adjacentTop) {
                                                (previous.registerBox(BOX_STANDARD.MARGIN_BOTTOM) || previous).setCacheValue('marginBottom', marginBottom);
                                            }
                                        }
                                    }
                                    else if (current.bounds.height === 0) {
                                        const { marginTop, marginBottom } = current;
                                        if (marginTop > 0 && marginBottom > 0) {
                                            if (marginTop < marginBottom) {
                                                resetBox(current, BOX_STANDARD.MARGIN_TOP);
                                            }
                                            else if (i === length - 1) {
                                                current.setCacheValue('marginBottom', marginTop);
                                                resetBox(current, BOX_STANDARD.MARGIN_TOP);
                                            }
                                            else {
                                                resetBox(current, BOX_STANDARD.MARGIN_BOTTOM);
                                            }
                                        }
                                    }
                                }
                                else if (current.bounds.height === 0) {
                                    const { marginTop, marginBottom } = current;
                                    if (marginTop > 0 && marginBottom > 0) {
                                        if (marginTop < marginBottom) {
                                            current.setCacheValue('marginTop', marginBottom);
                                        }
                                        resetBox(current, BOX_STANDARD.MARGIN_BOTTOM);
                                    }
                                }
                            }
                        }
                        if (!floating) {
                            previousChild = current;
                        }
                    }
                }
                if (firstChild && firstChild.naturalElement) {
                    this.applyMarginCollapse(node, firstChild, true);
                }
                if (lastChild && (!belowFloating || isLowestElement(lastChild, belowFloating))) {
                    if (lastChild.naturalElement) {
                        const bottomResetChild = this.applyMarginCollapse(node, lastChild, false);
                        if (bottomResetChild) {
                            resetting.push(bottomResetChild);
                        }
                        if (lastChild.marginTop < 0) {
                            const offset = lastChild.bounds.height + lastChild.marginBottom + lastChild.marginTop;
                            if (offset < 0) {
                                node.modifyBox(BOX_STANDARD.PADDING_BOTTOM, offset, false);
                            }
                        }
                    }
                }
                else if (belowFloating && node.borderBottomWidth === 0 && node.paddingBottom === 0) {
                    const { containerType, alignmentType } = this.controller.containerTypeVerticalMargin;
                    if (node.ascend({ condition: (item: T) => item.of(containerType, alignmentType), error: (item: T) => item.naturalChild, attr: 'renderParent' }).length === 0) {
                        const offset = minMaxOf(belowFloating, sibling => sibling.linear.bottom, '>')[1] - node.max('bounds', { subAttr: 'bottom' }).bounds.bottom;
                        if (offset > node.marginBottom) {
                            (node.registerBox(BOX_STANDARD.MARGIN_BOTTOM) || node).setCacheValue('marginBottom', offset);
                        }
                        belowFloating.forEach(sibling => !sibling.getBox(BOX_STANDARD.MARGIN_BOTTOM)[0] && resetBox(sibling, BOX_STANDARD.MARGIN_BOTTOM));
                    }
                }
            }
        });
        if (resetting.length) {
            this.data.set(cache, resetting);
        }
        this.application.getProcessing(sessionId)!.excluded.each(node => {
            if (node.lineBreak && !node.lineBreakTrailing && !clearMap.has(node) && !processed.has(node)) {
                let valid: Undef<boolean>;
                const previousSiblings = node.previousSiblings() as T[];
                const q = previousSiblings.length;
                if (q) {
                    const parent = node.actualParent!;
                    const nextSiblings = node.siblingsTrailing as T[];
                    const r = nextSiblings.length;
                    if (r) {
                        let above = previousSiblings[q - 1],
                            below = nextSiblings[r - 1],
                            lineHeight = 0,
                            aboveLineBreak: Null<T> = null,
                            offset: number;
                        if (above.rendered && below.rendered) {
                            if (above.inlineStatic && below.inlineStatic) {
                                if (q === 1) {
                                    processed.add(node);
                                    return;
                                }
                                else if (q > 1) {
                                    aboveLineBreak = previousSiblings[0];
                                    if (aboveLineBreak.lineBreak) {
                                        aboveLineBreak = node;
                                        aboveLineBreak.setBounds(false);
                                    }
                                    else {
                                        aboveLineBreak = null;
                                    }
                                }
                            }
                            let aboveParent = above.renderParent,
                                belowParent = below.renderParent;
                            if (aboveParent !== belowParent) {
                                while (aboveParent && aboveParent !== parent) {
                                    above = aboveParent as T;
                                    aboveParent = above.renderParent;
                                }
                                while (belowParent && belowParent !== parent) {
                                    below = belowParent as T;
                                    belowParent = below.renderParent;
                                }
                            }
                            if (above.textElement && !above.multiline) {
                                let value: Undef<number> = 0;
                                if (above.has('lineHeight')) {
                                    value = above.lineHeight;
                                }
                                else if (!above.isEmpty()) {
                                    value = above.layoutVertical ? above.lastStaticChild?.lineHeight : Math.max(...above.map(item => item.lineHeight));
                                }
                                if (value) {
                                    const aboveOffset = Math.floor((value - above.bounds.height) / 2);
                                    if (aboveOffset > 0) {
                                        lineHeight += aboveOffset;
                                    }
                                }
                            }
                            if (below.textElement && !below.multiline) {
                                let value: Undef<number> = 0;
                                if (below.has('lineHeight')) {
                                    value = below.lineHeight;
                                }
                                else if (!below.isEmpty()) {
                                    if (below.layoutVertical) {
                                        value = below.firstStaticChild?.lineHeight;
                                    }
                                    else {
                                        value = Math.max(...below.map(item => item.lineHeight));
                                    }
                                }
                                if (value) {
                                    const belowOffset = Math.round((value - below.bounds.height) / 2);
                                    if (belowOffset > 0) {
                                        lineHeight += belowOffset;
                                    }
                                }
                            }
                            [offset, below] = getMarginOffset(below, above, lineHeight, aboveLineBreak);
                            if (offset >= 1) {
                                const top = !below.visible ? below.registerBox(BOX_STANDARD.MARGIN_TOP) : below;
                                if (top) {
                                    top.modifyBox(BOX_STANDARD.MARGIN_TOP, offset);
                                    valid = true;
                                }
                                else {
                                    const bottom = !above.visible ? above.registerBox(BOX_STANDARD.MARGIN_BOTTOM) : above;
                                    if (bottom) {
                                        bottom.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, offset);
                                        valid = true;
                                    }
                                }
                            }
                        }
                        else {
                            [offset, below] = getMarginOffset(below, above, lineHeight);
                            if (offset >= 1) {
                                if ((below.lineBreak || below.excluded) && parent.lastChild === below) {
                                    parent.modifyBox(BOX_STANDARD.PADDING_BOTTOM, offset);
                                    valid = true;
                                }
                                else if ((above.lineBreak || above.excluded) && parent.firstChild === above) {
                                    parent.modifyBox(BOX_STANDARD.PADDING_TOP, offset);
                                    valid = true;
                                }
                            }
                        }
                    }
                    else if (parent.visible && !parent.preserveWhiteSpace && parent.tagName !== 'CODE' && !parent.documentRoot && !parent.documentBody) {
                        const previousStart = previousSiblings[previousSiblings.length - 1];
                        const rect = previousStart.bounds.height === 0 && !previousStart.isEmpty() ? previousStart.outerRegion : previousStart.linear;
                        const offset = parent.box.bottom - (previousStart.lineBreak || previousStart.excluded ? rect.top : rect.bottom);
                        if (offset !== 0) {
                            if (previousStart.rendered || parent.visibleStyle.background) {
                                parent.modifyBox(BOX_STANDARD.PADDING_BOTTOM, offset);
                            }
                            else if (!parent.hasHeight) {
                                const value = Math.max(offset, parent.hasUnit('minHeight', { percent: false }) ? parent.cssUnit('minHeight', { dimension: 'height' }) : 0);
                                if (value) {
                                    parent.css('minHeight', formatPX(value));
                                }
                            }
                        }
                    }
                    if (valid) {
                        for (let i = 0; i < q; ++i) {
                            processed.add(previousSiblings[i]);
                        }
                        for (let i = 0; i < r; ++i) {
                            processed.add(nextSiblings[i]);
                        }
                    }
                }
            }
        });
    }

    public afterConstraints(sessionId: string, cache = this.application.getProcessingCache(sessionId)) {
        const resetting = this.data.get(cache) as Undef<T[]>;
        if (resetting) {
            resetting.forEach(node => node.getAnchoredSiblings('horizontal').forEach(sibling => resetBox(sibling, BOX_STANDARD.MARGIN_BOTTOM)));
        }
        cache.each(node => {
            if (node.naturalChild && node.styleElement && node.inlineVertical && node.pageFlow && !node.positioned) {
                const actualParent = node.actualParent as T;
                if (actualParent.layoutElement) {
                    return;
                }
                const outerWrapper = node.outerMostWrapper;
                const renderParent = outerWrapper.renderParent;
                if (renderParent && !renderParent.hasAlign(NODE_ALIGNMENT.AUTO_LAYOUT)) {
                    if (node.blockDimension && !node.floating) {
                        if (renderParent.layoutVertical) {
                            const children = renderParent.renderChildren;
                            for (let i = 0, length = children.length; i < length; ++i) {
                                if (children[i] === outerWrapper) {
                                    if (i > 0 && !node.lineBreakLeading && !node.baselineAltered) {
                                        const previous = children[i - 1];
                                        if (previous.pageFlow && (!previous.blockStatic || node.inlineStatic)) {
                                            setSpacingOffset(outerWrapper, BOX_STANDARD.MARGIN_TOP, previous.actualRect('bottom'), previous.getBox(BOX_STANDARD.MARGIN_BOTTOM)[1]);
                                        }
                                    }
                                    if (i < length - 1 && !node.lineBreakTrailing) {
                                        const next = children[i + 1];
                                        if (next.pageFlow && next.styleElement && !next.inlineVertical) {
                                            setSpacingOffset(outerWrapper, BOX_STANDARD.MARGIN_BOTTOM, next.actualRect('top'), next.getBox(BOX_STANDARD.MARGIN_TOP)[1]);
                                        }
                                    }
                                    break;
                                }
                            }
                        }
                        else if (!node.baselineAltered) {
                            const horizontalRows = renderParent.horizontalRows;
                            const validSibling = (item: NodeUI) => item.pageFlow && item.blockDimension && !item.floating && !item.excluded;
                            let horizontal: Undef<T[]>;
                            if (horizontalRows && horizontalRows.length > 1) {
                                found: {
                                    for (let i = 0, length = horizontalRows.length; i < length; ++i) {
                                        const row = horizontalRows[i] as T[];
                                        const q = row.length;
                                        for (let j = 0; j < q; ++j) {
                                            if (outerWrapper === row[j]) {
                                                if (i > 0) {
                                                    const previousRow = horizontalRows[i - 1];
                                                    const r = previousRow.length;
                                                    if (!isBlockElement(previousRow[r - 1], false) || !isBlockElement(outerWrapper, true)) {
                                                        let maxBottom = -Infinity;
                                                        for (let k = 0; k < r; ++k) {
                                                            const innerWrapped = previousRow[k].innerMostWrapped;
                                                            if (validSibling(innerWrapped)) {
                                                                maxBottom = Math.max(innerWrapped.actualRect('bottom'), maxBottom);
                                                            }
                                                        }
                                                        if (maxBottom !== -Infinity) {
                                                            setSpacingOffset(outerWrapper, BOX_STANDARD.MARGIN_TOP, maxBottom);
                                                        }
                                                    }
                                                }
                                                else {
                                                    horizontal = row;
                                                }
                                                break found;
                                            }
                                        }
                                    }
                                }
                            }
                            else if (renderParent.layoutHorizontal || renderParent.hasAlign(NODE_ALIGNMENT.INLINE)) {
                                horizontal = renderParent.renderChildren as T[];
                            }
                            if (horizontal) {
                                const siblings: T[] = [];
                                let maxBottom = -Infinity;
                                for (let i = 0, length = horizontal.length; i < length; ++i) {
                                    const item = horizontal[i];
                                    if (item.nodeGroup) {
                                        siblings.push(...item.cascade(child => child.naturalChild) as T[]);
                                    }
                                    else if (item.innerWrapped) {
                                        siblings.push(item.innerMostWrapped as T);
                                    }
                                    else {
                                        siblings.push(item);
                                    }
                                }
                                const children = actualParent.naturalChildren as T[];
                                for (let i = 0, length = children.length; i < length; ++i) {
                                    const item = children[i];
                                    if (siblings.includes(item)) {
                                        break;
                                    }
                                    else if (item.lineBreak || item.block) {
                                        maxBottom = -Infinity;
                                    }
                                    else if (validSibling(item)) {
                                        maxBottom = Math.max(item.actualRect('bottom'), maxBottom);
                                    }
                                }
                                if (maxBottom !== -Infinity && node.actualRect('top') > maxBottom) {
                                    setSpacingOffset(outerWrapper, BOX_STANDARD.MARGIN_TOP, maxBottom);
                                }
                            }
                        }
                    }
                    if (actualParent.inlineStatic && actualParent.marginLeft > 0 && actualParent.firstStaticChild === node && renderParent.renderParent!.outerMostWrapper.layoutVertical) {
                        outerWrapper.modifyBox(BOX_STANDARD.MARGIN_LEFT, renderParent.marginLeft);
                    }
                    else if (!renderParent.layoutVertical && !outerWrapper.alignParent('left') && !node.textJustified) {
                        const documentId = outerWrapper.alignSibling('leftRight');
                        if (documentId) {
                            const previousSibling = renderParent.renderChildren.find(item => item.documentId === documentId);
                            if (previousSibling && previousSibling.inlineVertical && previousSibling.bounds.width) {
                                setSpacingOffset(outerWrapper, BOX_STANDARD.MARGIN_LEFT, previousSibling.actualRect('right'));
                            }
                        }
                        else {
                            let current = node;
                            do {
                                const siblingsLeading = current.siblingsLeading;
                                if (siblingsLeading.length && !siblingsLeading.some(item => item.lineBreak || item.excluded && item.blockStatic)) {
                                    const previousSibling = siblingsLeading[0] as T;
                                    if (previousSibling.inlineVertical) {
                                        setSpacingOffset(outerWrapper, BOX_STANDARD.MARGIN_LEFT, previousSibling.actualRect('right'));
                                    }
                                    else if (previousSibling.floating) {
                                        current = previousSibling;
                                        continue;
                                    }
                                }
                                break;
                            }
                            while (true);
                        }
                    }
                }
            }
        });
    }

    protected applyMarginCollapse(node: T, child: T, direction: boolean) {
        if (!direction || isBlockElement(child, true)) {
            let marginName: CssStyleAttr,
                borderWidth: CssStyleAttr,
                paddingName: CssStyleAttr,
                region: BOX_STANDARD;
            if (direction) {
                marginName = 'marginTop';
                borderWidth = 'borderTopWidth';
                paddingName = 'paddingTop';
                region = BOX_STANDARD.MARGIN_TOP;
            }
            else {
                marginName = 'marginBottom';
                borderWidth = 'borderBottomWidth';
                paddingName = 'paddingBottom';
                region = BOX_STANDARD.MARGIN_BOTTOM;
            }
            if (node[borderWidth] === 0 && !node.getBox(region)[0]) {
                if (node[paddingName] === 0) {
                    let target = child,
                        targetParent: Undef<T[]>;
                    if (DOCTYPE_HTML) {
                        while (target[marginName] === 0 && target[borderWidth] === 0 && target[paddingName] === 0 && !target.getBox(region)[0] && canResetChild(target)) {
                            if (direction) {
                                const endChild = target.firstStaticChild as T;
                                if (isBlockElement(endChild, direction)) {
                                    (targetParent ||= []).push(target);
                                    target = endChild;
                                }
                                else {
                                    break;
                                }
                            }
                            else {
                                const endChild = getBottomChild(target) as Undef<T>;
                                if (endChild) {
                                    (targetParent ||= []).push(target);
                                    target = endChild;
                                }
                                else {
                                    break;
                                }
                            }
                        }
                    }
                    const offsetParent: number = node[marginName];
                    const offsetChild: number = target[marginName];
                    if (offsetParent >= 0 && offsetChild >= 0) {
                        const height = target.bounds.height;
                        let resetChild: Undef<boolean>;
                        if (!DOCTYPE_HTML && offsetParent === 0 && offsetChild > 0 && !target.valueOf(marginName)) {
                            resetChild = true;
                        }
                        else {
                            const outside = offsetParent >= offsetChild;
                            if (height === 0 && outside && target.textEmpty && target.extensions.length === 0) {
                                target.hide({ collapse: true });
                            }
                            else {
                                const registered = target.registerBox(region);
                                if (registered) {
                                    const value = registered.getBox(region)[1];
                                    if (value > 0) {
                                        if (value > offsetParent) {
                                            adjustRegion(node, region, value);
                                        }
                                        registered.setBox(region, { reset: 1, adjustment: 0 });
                                    }
                                }
                                else if (!target.getBox(region)[0]) {
                                    if (outside) {
                                        resetChild = offsetChild > 0;
                                    }
                                    else if (node.documentBody) {
                                        resetBox(node, region);
                                        if (direction) {
                                            if (node.bounds.top > 0) {
                                                node.bounds.top = 0;
                                                node.resetBounds(true);
                                            }
                                            if (node.layoutVertical) {
                                                const firstChild = node.renderChildren.find(item => item.pageFlow);
                                                if (firstChild && firstChild !== child.outerMostWrapper && (target.positionStatic || target.top >= 0 && !target.hasUnit('bottom'))) {
                                                    adjustRegion(firstChild, region, offsetChild);
                                                    adjustRegion(target, region, 0);
                                                    resetChild = true;
                                                }
                                            }
                                        }
                                    }
                                    else {
                                        adjustRegion(node, region, offsetChild);
                                        resetChild = true;
                                    }
                                }
                            }
                        }
                        if (resetChild) {
                            resetBox(target, region, undefined, targetParent);
                            if (height === 0 && !target.every(item => item.floating || !item.pageFlow)) {
                                resetBox(target, direction ? BOX_STANDARD.MARGIN_BOTTOM : BOX_STANDARD.MARGIN_TOP);
                            }
                            if (!direction) {
                                const parent = target.renderParent || target.parent;
                                if (parent?.layoutHorizontal) {
                                    return target;
                                }
                            }
                        }
                    }
                    else if (offsetParent < 0 && offsetChild < 0) {
                        if (!direction) {
                            if (offsetChild < offsetParent) {
                                adjustRegion(node, region, offsetChild);
                            }
                            resetBox(target, region, undefined, targetParent);
                        }
                    }
                }
                else if (child[marginName] === 0 && child[borderWidth] === 0 && canResetChild(child) && !node.documentBody) {
                    let blockAll = true;
                    do {
                        const endChild = (direction ? child.firstStaticChild : child.lastStaticChild) as Null<T>;
                        if (endChild && endChild[marginName] === 0 && endChild[borderWidth] === 0 && !endChild.visibleStyle.background && canResetChild(endChild)) {
                            const value = endChild[paddingName];
                            if (value) {
                                if (value >= node[paddingName]) {
                                    node.setBox(direction ? BOX_STANDARD.PADDING_TOP : BOX_STANDARD.PADDING_BOTTOM, { reset: 1 });
                                }
                                else if (blockAll) {
                                    node.modifyBox(direction ? BOX_STANDARD.PADDING_TOP : BOX_STANDARD.PADDING_BOTTOM, value * -1, false);
                                }
                                break;
                            }
                            else {
                                if (!isBlockElement(endChild, direction)) {
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
}