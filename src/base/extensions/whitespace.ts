import ExtensionUI from '../extension-ui';
import NodeUI from '../node-ui';

import { BOX_STANDARD, NODE_ALIGNMENT } from '../lib/enumeration';

const { formatPX } = squared.lib.css;
const { getElementCache } = squared.lib.session;
const { iterateReverseArray } = squared.lib.util;

const DOCTYPE_HTML = document.doctype?.name === 'html';

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
    if (item.getBox(region)[0] === 1) {
        const registered = item.registerBox(region);
        if (registered) {
            const [reset, value] = registered.getBox(region);
            adjustment = Math.max(value, adjustment);
            if (reset === 1) {
                registered.setBox(region, { adjustment });
            }
            else {
                registered.setCacheValue('marginTop', adjustment);
            }
            return;
        }
    }
    item.setBox(region, { reset: 1, adjustment });
}

function applyMarginCollapse(node: NodeUI, child: NodeUI, direction: boolean) {
    if (!direction || isBlockElement(child, true)) {
        const [marginName, borderWidth, paddingName, region] =
            direction
                ? ['marginTop', 'borderTopWidth', 'paddingTop', BOX_STANDARD.MARGIN_TOP]
                : ['marginBottom', 'borderBottomWidth', 'paddingBottom', BOX_STANDARD.MARGIN_BOTTOM];
        if (node[borderWidth] === 0) {
            if (node[paddingName] === 0) {
                let target = child;
                while (DOCTYPE_HTML && target[marginName] === 0 && target[borderWidth] === 0 && target[paddingName] === 0 && canResetChild(target)) {
                    if (direction) {
                        const endChild = target.firstStaticChild as NodeUI;
                        if (isBlockElement(endChild, direction)) {
                            target = endChild;
                        }
                        else {
                            break;
                        }
                    }
                    else {
                        const endChild = getBottomChild(target);
                        if (endChild) {
                            target = endChild;
                        }
                        else {
                            break;
                        }
                    }
                }
                const offsetParent: number = node[marginName];
                const offsetChild: number = target[marginName];
                if (offsetParent >= 0 && offsetChild >= 0) {
                    const height = target.bounds.height;
                    let resetChild = false;
                    if (!DOCTYPE_HTML && offsetParent === 0 && offsetChild > 0 && target.cssInitial(marginName) === '') {
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
                            else if (target.getBox(region)[0] === 0) {
                                if (outside) {
                                    resetChild = offsetChild > 0;
                                }
                                else if (node.documentBody) {
                                    resetBox(node, region);
                                    if (direction) {
                                        if (node.bounds.top > 0) {
                                            node.bounds.top = 0;
                                            node.unset('box');
                                            node.unset('linear');
                                        }
                                        if (node.layoutVertical) {
                                            const firstChild = node.renderChildren.find(item => item.pageFlow);
                                            if (firstChild && firstChild !== child.outerMostWrapper && (target.positionStatic || target.top >= 0 && !target.hasPX('bottom'))) {
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
                        resetBox(target, region);
                        if (!direction && target.floating) {
                            const children = target.actualParent!.naturalChildren;
                            const length = children.length;
                            let i = 0;
                            while (i < length) {
                                const item = children[i++];
                                if (item.floating && item !== target && item.intersectY(target.bounds, 'bounds')) {
                                    resetBox(item as NodeUI, region);
                                }
                            }
                        }
                        if (height === 0 && !target.every(item => item.floating || !item.pageFlow)) {
                            resetBox(target, direction ? BOX_STANDARD.MARGIN_BOTTOM : BOX_STANDARD.MARGIN_TOP);
                        }
                    }
                }
                else if (offsetParent < 0 && offsetChild < 0) {
                    if (!direction) {
                        if (offsetChild < offsetParent) {
                            adjustRegion(node, region, offsetChild);
                        }
                        resetBox(target, region);
                    }
                }
            }
            else if (child[marginName] === 0 && child[borderWidth] === 0 && canResetChild(child)) {
                let blockAll = true;
                do {
                    const endChild = (direction ? child.firstStaticChild : child.lastStaticChild) as NodeUI;
                    if (endChild && endChild[marginName] === 0 && endChild[borderWidth] === 0 && !endChild.visibleStyle.background && canResetChild(endChild)) {
                        const value = endChild[paddingName];
                        if (value > 0) {
                            if (value >= node[paddingName]) {
                                node.setBox(direction ? BOX_STANDARD.PADDING_TOP : BOX_STANDARD.PADDING_BOTTOM, { reset: 1 });
                            }
                            else if (blockAll) {
                                node.modifyBox(direction ? BOX_STANDARD.PADDING_TOP : BOX_STANDARD.PADDING_BOTTOM, -value, false);
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

function isBlockElement(node: Null<NodeUI>, direction?: boolean): boolean {
    if (!node || !node.styleElement || node.lineBreak) {
        return false;
    }
    else if (node.blockStatic) {
        return true;
    }
    else if (!node.floating) {
        switch (node.display) {
            case 'table':
            case 'list-item':
                return true;
            case 'inline-flex':
            case 'inline-grid':
            case 'inline-table':
                return false;
        }
        if (direction) {
            const firstChild = node.firstStaticChild as NodeUI;
            return isBlockElement(firstChild) && validAboveChild(firstChild, false);
        }
        else if (direction === false) {
            const lastChild = node.lastStaticChild as NodeUI;
            return isBlockElement(lastChild) && validBelowChild(lastChild, false);
        }
    }
    return false;
}

function getMarginOffset<T extends NodeUI>(below: T, above: T, lineHeight: number, aboveLineBreak?: T): [number, T] {
    let top = Infinity;
    if (below.nodeGroup && below.some(item => item.floating)) {
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
    let bottomChild: Undef<NodeUI>;
    if (!node.floatContainer) {
        bottomChild = node.lastStaticChild as NodeUI;
        if (!isBlockElement(node, false) || bottomChild && node.hasHeight && Math.floor(bottomChild.linear.bottom) < node.box.bottom) {
            bottomChild = undefined;
        }
    }
    else {
        let bottomFloatChild: Undef<NodeUI>;
        const children = node.naturalChildren;
        let j = children.length - 1;
        while (j >= 0) {
            const item = children[j--] as NodeUI;
            if (item.floating) {
                if (!bottomChild) {
                    const bottom = item.linear.bottom;
                    if (bottomFloatChild) {
                        if (bottom > bottomFloatChild.linear.bottom) {
                            bottomFloatChild = item;
                        }
                    }
                    else if (Math.ceil(item.linear.bottom) >= node.box.bottom) {
                        bottomFloatChild = item;
                    }
                }
                else if (item.linear.bottom >= bottomChild.linear.bottom) {
                    bottomChild = item;
                    break;
                }
            }
            else if (!bottomChild) {
                if (bottomFloatChild && bottomFloatChild.linear.bottom > item.linear.bottom) {
                    bottomChild = bottomFloatChild;
                    break;
                }
                bottomChild = item;
            }
        }
        if (!bottomChild) {
            bottomChild = bottomFloatChild;
        }
    }
    return bottomChild;
}

function isVerticalOverflow(node: NodeUI) {
    for (const value of [node.cssInitial('overflow'), node.cssInitial('overflowX'), node.cssInitial('overflowY')]) {
        switch (value) {
            case 'auto':
            case 'hidden':
            case 'overlay':
                return true;
        }
    }
    return false;
}

function resetBox(node: NodeUI, region: number, register?: NodeUI) {
    node.setBox(region, { reset: 1 });
    if (register) {
        node.registerBox(region, register);
    }
}

const setMinHeight = (node: NodeUI, offset: number) => node.css('minHeight', formatPX(Math.max(offset, node.hasPX('minHeight', { percent: false }) ? node.parseHeight(node.css('minHeight')) : 0)));
const canResetChild = (node: NodeUI, children = true) => (!children && node.blockStatic || children && node.length > 0 && !node.floating) && !node.layoutElement && !node.tableElement && node.tagName !== 'FIELDSET';
const validAboveChild = (node: NodeUI, children: boolean) => !node.hasHeight && node.borderBottomWidth === 0 && node.paddingBottom === 0 && canResetChild(node, children);
const validBelowChild = (node: NodeUI, children: boolean) => !node.hasHeight && node.borderTopWidth === 0 && node.paddingTop === 0 && canResetChild(node, children);
const validSibling = (node: NodeUI) => node.pageFlow && node.blockDimension && !node.floating && !node.excluded;

export default class WhiteSpace<T extends NodeUI> extends ExtensionUI<T> {
    public readonly eventOnly = true;

    public afterBaseLayout(sessionId: string) {
        const { cache, excluded } = this.application.getProcessing(sessionId)!;
        const clearMap = this.application.clearMap;
        const processed = new Set<number>();
        cache.each(node => {
            if (node.naturalElement && !node.hasAlign(NODE_ALIGNMENT.AUTO_LAYOUT)) {
                const children = node.naturalChildren;
                const length = children.length;
                if (length === 0) {
                    return;
                }
                const pageFlow = node.pageFlow;
                const collapseMargin = pageFlow && isBlockElement(node, true) && !node.actualParent!.layoutElement;
                let firstChild: Undef<T>,
                    lastChild: Undef<T>;
                for (let i = 0; i < length; ++i) {
                    const current = children[i] as T;
                    if (current.pageFlow) {
                        if (collapseMargin) {
                            if (!current.floating) {
                                if (!firstChild) {
                                    firstChild = current;
                                }
                                lastChild = current;
                            }
                            else if (lastChild) {
                                if (current.linear.bottom >= lastChild.linear.bottom) {
                                    lastChild = current;
                                }
                            }
                            else {
                                lastChild = current;
                            }
                        }
                        if (isBlockElement(current, true)) {
                            if (i > 0) {
                                const previousSiblings = current.previousSiblings({ floating: false });
                                const q = previousSiblings.length;
                                if (q > 0) {
                                    let inheritedTop = false;
                                    const previous = previousSiblings[q - 1];
                                    if (isBlockElement(previous, false)) {
                                        let marginBottom = previous.marginBottom,
                                            marginTop = current.marginTop;
                                        if (previous.marginTop < 0 && previous.bounds.height === 0) {
                                            const offset = Math.min(marginBottom, previous.marginTop);
                                            if (offset < 0) {
                                                if (Math.abs(offset) < marginTop) {
                                                    current.modifyBox(BOX_STANDARD.MARGIN_TOP, offset);
                                                }
                                                else {
                                                    resetBox(current, BOX_STANDARD.MARGIN_TOP);
                                                }
                                                processed.add(previous.id);
                                                previous.hide({ collapse: true });
                                                continue;
                                            }
                                        }
                                        else if (current.marginBottom < 0 && current.bounds.height === 0) {
                                            const offset = Math.min(marginTop, current.marginBottom);
                                            if (offset < 0) {
                                                if (Math.abs(offset) < marginBottom) {
                                                    previous.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, offset);
                                                }
                                                else {
                                                    resetBox(previous, BOX_STANDARD.MARGIN_BOTTOM);
                                                }
                                                processed.add(current.id);
                                                current.hide({ collapse: true });
                                                continue;
                                            }
                                        }
                                        let inheritedBottom = false,
                                            inherit = previous;
                                        while (validAboveChild(inherit, true)) {
                                            let bottomChild = getBottomChild(inherit);
                                            if (bottomChild?.getBox(BOX_STANDARD.MARGIN_BOTTOM)[0] === 0) {
                                                let childBottom = bottomChild.marginBottom,
                                                    currentChild = bottomChild;
                                                while (currentChild.bounds.height === 0 && !currentChild.pseudoElement) {
                                                    const currentTop = currentChild.marginTop;
                                                    childBottom = Math.max(currentTop, currentChild.marginBottom, childBottom);
                                                    if (currentTop !== 0) {
                                                        resetBox(currentChild, BOX_STANDARD.MARGIN_TOP);
                                                    }
                                                    const sibling = currentChild.previousSibling as T;
                                                    if (sibling) {
                                                        if (sibling.marginBottom >= childBottom) {
                                                            if (currentChild.marginBottom !== 0) {
                                                                resetBox(currentChild, BOX_STANDARD.MARGIN_BOTTOM);
                                                            }
                                                            bottomChild = sibling;
                                                            childBottom = sibling.marginBottom;
                                                            currentChild = sibling;
                                                        }
                                                        else if (sibling.bounds.height > 0) {
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
                                                if (childBottom !== 0) {
                                                    resetBox(bottomChild, BOX_STANDARD.MARGIN_BOTTOM, previous.getBox(BOX_STANDARD.MARGIN_BOTTOM)[0] === 0 ? previous : undefined);
                                                }
                                                if (childBottom > marginBottom) {
                                                    marginBottom = childBottom;
                                                    inheritedBottom = true;
                                                }
                                                else if (childBottom === 0 && marginBottom === 0) {
                                                    inherit = bottomChild;
                                                    continue;
                                                }
                                            }
                                            break;
                                        }
                                        inherit = current;
                                        while (validBelowChild(inherit, true)) {
                                            let topChild = inherit.firstStaticChild as T;
                                            if (isBlockElement(topChild, true) && topChild.getBox(BOX_STANDARD.MARGIN_TOP)[0] === 0) {
                                                let childTop = topChild.marginTop,
                                                    currentChild = topChild;
                                                while (currentChild.bounds.height === 0 && !currentChild.pseudoElement) {
                                                    const currentBottom = currentChild.marginBottom;
                                                    childTop = Math.max(currentChild.marginTop, currentBottom, childTop);
                                                    if (currentBottom !== 0) {
                                                        resetBox(currentChild, BOX_STANDARD.MARGIN_BOTTOM);
                                                    }
                                                    const sibling = currentChild.nextSibling as T;
                                                    if (sibling) {
                                                        if (sibling.marginTop >= childTop) {
                                                            if (currentChild.marginTop !== 0) {
                                                                resetBox(currentChild, BOX_STANDARD.MARGIN_TOP);
                                                            }
                                                            topChild = sibling;
                                                            childTop = sibling.marginTop;
                                                            currentChild = sibling;
                                                        }
                                                        else if (sibling.bounds.height > 0) {
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
                                                if (childTop !== 0) {
                                                    resetBox(topChild, BOX_STANDARD.MARGIN_TOP, current.getBox(BOX_STANDARD.MARGIN_TOP)[0] === 0 ? current : undefined);
                                                }
                                                if (childTop > marginTop) {
                                                    marginTop = childTop;
                                                    inheritedTop = true;
                                                }
                                                else if (childTop === 0 && marginTop === 0) {
                                                    inherit = topChild;
                                                    continue;
                                                }
                                            }
                                            break;
                                        }
                                        if (marginBottom > 0) {
                                            if (marginTop > 0) {
                                                if (marginTop <= marginBottom) {
                                                    if (!inheritedTop || !isVerticalOverflow(current)) {
                                                        resetBox(current, BOX_STANDARD.MARGIN_TOP);
                                                        if (current.bounds.height === 0 && marginBottom >= current.marginBottom) {
                                                            resetBox(current, BOX_STANDARD.MARGIN_BOTTOM);
                                                        }
                                                        inheritedTop = false;
                                                    }
                                                }
                                                else if (!inheritedBottom || !isVerticalOverflow(previous)) {
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
                                        if (marginTop > 0 && previous.floatContainer && current.getBox(BOX_STANDARD.MARGIN_TOP)[1] === 0 && !isVerticalOverflow(previous)) {
                                            let valid = false;
                                            if (previous.bounds.height === 0) {
                                                valid = true;
                                            }
                                            else {
                                                let float: Undef<string>;
                                                iterateReverseArray(previous.naturalElements, (item: T) => {
                                                    if (clearMap.has(item)) {
                                                        return true;
                                                    }
                                                    else if (item.floating) {
                                                        if (item.linear.bottom > Math.ceil(previous.bounds.bottom)) {
                                                            float = item.float;
                                                        }
                                                        return true;
                                                    }
                                                    return;
                                                });
                                                if (float) {
                                                    const clear = getElementCache<StringMap>(previous.element as Element, 'styleMap::after', previous.sessionId)?.clear;
                                                    valid = !(clear === 'both' || clear === float);
                                                }
                                            }
                                            if (valid) {
                                                current.modifyBox(BOX_STANDARD.MARGIN_TOP, previous.box.top - Math.max(...previous.naturalElements.map(item => item.linear.bottom)), false);
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
                                    if (!inheritedTop && current !== firstChild && previousSiblings.length > 1 && (node.layoutVertical || current.renderParent?.layoutVertical)) {
                                        const previousSibling = previousSiblings.pop() as T;
                                        if (previousSibling.floating && Math.floor(previousSibling.bounds.top) === Math.floor(current.bounds.top)) {
                                            current.modifyBox(BOX_STANDARD.MARGIN_TOP, -previousSibling.bounds.height, false);
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
                }
                if (pageFlow && !isVerticalOverflow(node) && node.tagName !== 'FIELDSET') {
                    if (firstChild?.naturalElement) {
                        applyMarginCollapse(node, firstChild, true);
                    }
                    if (lastChild?.naturalElement) {
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
        });
        excluded.each(node => {
            if (node.lineBreak && !node.lineBreakTrailing && !clearMap.has(node) && !processed.has(node.id)) {
                let valid = false;
                const previousSiblings = node.previousSiblings({ floating: false });
                const q = previousSiblings.length;
                if (q > 0) {
                    const actualParent = node.actualParent as T;
                    const nextSiblings = node.siblingsTrailing;
                    const r = nextSiblings.length;
                    if (r > 0) {
                        let above = previousSiblings[q - 1],
                            below = nextSiblings[r - 1],
                            lineHeight = 0,
                            aboveLineBreak: Undef<T>,
                            offset: number;
                        if (above.rendered && below.rendered) {
                            const inline = above.inlineStatic && below.inlineStatic;
                            if (inline && previousSiblings.length === 0) {
                                processed.add(node.id);
                                return;
                            }
                            if (inline) {
                                aboveLineBreak = previousSiblings[0] as T;
                                if (previousSiblings.length === 1) {
                                    aboveLineBreak = aboveLineBreak.lineBreak ? node : undefined;
                                }
                                if (aboveLineBreak) {
                                    aboveLineBreak.setBounds(false);
                                }
                            }
                            let aboveParent = above.renderParent,
                                belowParent = below.renderParent;
                            if (aboveParent !== belowParent) {
                                while (aboveParent && aboveParent !== actualParent) {
                                    above = aboveParent as T;
                                    aboveParent = above.renderParent;
                                }
                                while (belowParent && belowParent !== actualParent) {
                                    below = belowParent as T;
                                    belowParent = below.renderParent;
                                }
                            }
                            if (!above.multiline) {
                                let value: Undef<number>;
                                if (above.has('lineHeight')) {
                                    value = above.lineHeight;
                                }
                                else if (above.length > 0) {
                                    if (above.layoutVertical) {
                                        value = above.lastStaticChild?.lineHeight;
                                    }
                                    else {
                                        value = Math.max(...above.map(item => item.lineHeight));
                                    }
                                }
                                if (value) {
                                    const aboveOffset = Math.floor((value - above.bounds.height) / 2);
                                    if (aboveOffset > 0) {
                                        lineHeight += aboveOffset;
                                    }
                                }
                            }
                            if (!below.multiline) {
                                let value: Undef<number>;
                                if (below.has('lineHeight')) {
                                    value = below.lineHeight;
                                }
                                else if (below.length > 0) {
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
                                if ((below.lineBreak || below.excluded) && actualParent.lastChild === below) {
                                    actualParent.modifyBox(BOX_STANDARD.PADDING_BOTTOM, offset);
                                    valid = true;
                                }
                                else if ((above.lineBreak || above.excluded) && actualParent.firstChild === above) {
                                    actualParent.modifyBox(BOX_STANDARD.PADDING_TOP, offset);
                                    valid = true;
                                }
                            }
                        }
                    }
                    else if (actualParent.visible && !actualParent.preserveWhiteSpace && actualParent.tagName !== 'CODE' && !actualParent.documentRoot && !actualParent.documentBody) {
                        const previousStart = previousSiblings[previousSiblings.length - 1];
                        const rect = previousStart.bounds.height === 0 && previousStart.length > 0 ? NodeUI.outerRegion(previousStart) : previousStart.linear;
                        const offset = actualParent.box.bottom - (previousStart.lineBreak || previousStart.excluded ? rect.top : rect.bottom);
                        if (offset !== 0) {
                            if (previousStart.rendered || actualParent.visibleStyle.background) {
                                actualParent.modifyBox(BOX_STANDARD.PADDING_BOTTOM, offset);
                            }
                            else if (!actualParent.hasHeight) {
                                setMinHeight(actualParent, offset);
                            }
                        }
                    }
                    if (valid) {
                        let i = 0;
                        while (i < q) {
                            processed.add(previousSiblings[i++].id);
                        }
                        i = 0;
                        while (i < r) {
                            processed.add(nextSiblings[i++].id);
                        }
                    }
                }
            }
        });
    }

    public afterConstraints(sessionId: string) {
        this.application.getProcessingCache(sessionId).each(node => {
            if (node.naturalChild && node.styleElement && node.inlineVertical && node.pageFlow && !node.positioned && !node.actualParent!.layoutElement) {
                const outerWrapper = node.outerMostWrapper;
                const renderParent = outerWrapper.renderParent;
                if (renderParent?.hasAlign(NODE_ALIGNMENT.AUTO_LAYOUT) === false) {
                    if (node.blockDimension && !node.floating) {
                        if (renderParent.layoutVertical) {
                            const children = renderParent.renderChildren;
                            const index = children.findIndex(item => item === outerWrapper);
                            if (index !== -1) {
                                if (!node.lineBreakLeading && !node.baselineAltered) {
                                    const previous = children[index - 1];
                                    if (previous?.pageFlow) {
                                        setSpacingOffset(outerWrapper, BOX_STANDARD.MARGIN_TOP, previous.actualRect('bottom'), previous.getBox(BOX_STANDARD.MARGIN_BOTTOM)[1]);
                                    }
                                }
                                if (!node.lineBreakTrailing) {
                                    const next = children[index + 1];
                                    if (next?.pageFlow && next.styleElement && !next.inlineVertical) {
                                        setSpacingOffset(outerWrapper, BOX_STANDARD.MARGIN_BOTTOM, next.actualRect('top'), next.getBox(BOX_STANDARD.MARGIN_TOP)[1]);
                                    }
                                }
                            }
                        }
                        else if (!node.baselineAltered) {
                            const horizontalRows = renderParent.horizontalRows;
                            let horizontal: Undef<T[]>;
                            if (horizontalRows && horizontalRows.length > 1) {
                                found: {
                                    let maxBottom = -Infinity;
                                    for (let i = 0, length = horizontalRows.length; i < length; ++i) {
                                        const row = horizontalRows[i] as T[];
                                        const q = row.length;
                                        let j = 0;
                                        while (j < q) {
                                            if (outerWrapper === row[j++]) {
                                                if (i > 0) {
                                                    setSpacingOffset(outerWrapper, BOX_STANDARD.MARGIN_TOP, maxBottom);
                                                }
                                                else {
                                                    horizontal = row;
                                                }
                                                break found;
                                            }
                                        }
                                        let k = 0;
                                        while (k < row.length) {
                                            const innerWrapped = row[k++].innerMostWrapped;
                                            if (validSibling(innerWrapped)) {
                                                maxBottom = Math.max(innerWrapped.actualRect('bottom'), maxBottom);
                                            }
                                        }
                                        if (maxBottom === -Infinity) {
                                            break;
                                        }
                                    }
                                }
                            }
                            else if (renderParent.layoutHorizontal || renderParent.hasAlign(NODE_ALIGNMENT.INLINE)) {
                                horizontal = renderParent.renderChildren as T[];
                            }
                            if (horizontal) {
                                let children: T[] = [],
                                    maxBottom = -Infinity,
                                    length = horizontal.length;
                                let i = 0;
                                while (i < length) {
                                    const item = horizontal[i++];
                                    if (item.nodeGroup) {
                                        children = children.concat(item.cascade(child => child.naturalChild) as T[]);
                                    }
                                    else if (item.innerWrapped) {
                                        children.push(item.innerMostWrapped as T);
                                    }
                                    else {
                                        children.push(item);
                                    }
                                }
                                const naturalChildren = node.actualParent!.naturalChildren as T[];
                                length = naturalChildren.length;
                                i = 0;
                                while (i < length) {
                                    const item = naturalChildren[i++];
                                    if (children.includes(item)) {
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
                    if (!renderParent.layoutVertical && !outerWrapper.alignParent('left') && !NodeUI.justified(node)) {
                        const documentId = outerWrapper.alignSibling('leftRight');
                        if (documentId !== '') {
                            const previousSibling = renderParent.renderChildren.find(item => item.documentId === documentId);
                            if (previousSibling?.inlineVertical && previousSibling.bounds.width > 0) {
                                setSpacingOffset(outerWrapper, BOX_STANDARD.MARGIN_LEFT, previousSibling.actualRect('right'));
                            }
                        }
                        else {
                            let current = node;
                            while (true) {
                                const siblingsLeading = current.siblingsLeading;
                                if (siblingsLeading.length > 0 && !siblingsLeading.some(item => item.lineBreak || item.excluded && item.blockStatic)) {
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
                        }
                    }
                }
            }
            if (node.floatContainer && node.layoutVertical) {
                const floating: T[] = [];
                const children = node.naturalChildren as T[];
                const length = children.length;
                let i = 0;
                while (i < length) {
                    const item = children[i++];
                    if (!item.pageFlow) {
                        continue;
                    }
                    if (!item.floating) {
                        const q = floating.length;
                        if (q > 0) {
                            const outerWrapper = item.outerMostWrapper;
                            let renderParent = outerWrapper.renderParent;
                            if (renderParent) {
                                const [reset, adjustment] = item.getBox(BOX_STANDARD.MARGIN_TOP);
                                const marginTop = (reset === 0 ? item.marginTop : 0) + adjustment;
                                if (marginTop > 0) {
                                    const top = Math.floor(node.bounds.top);
                                    let j = 0;
                                    while (j < q) {
                                        const previous = floating[j++];
                                        if (top <= Math.floor(previous.bounds.top)) {
                                            let floatingRenderParent = previous.outerMostWrapper.renderParent;
                                            if (floatingRenderParent) {
                                                renderParent = renderParent.ascend({ error: parent => parent.naturalChild, attr: 'renderParent' }).pop() as NodeUI || renderParent;
                                                floatingRenderParent = floatingRenderParent.ascend({ error: parent => parent.naturalChild, attr: 'renderParent' }).pop() as NodeUI || floatingRenderParent;
                                                if (renderParent !== floatingRenderParent) {
                                                    outerWrapper.modifyBox(BOX_STANDARD.MARGIN_TOP, (floatingRenderParent !== node ? floatingRenderParent : previous).linear.height * -1, false);
                                                }
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                            floating.length = 0;
                        }
                    }
                    else {
                        floating.push(item);
                    }
                }
            }
        });
    }
}