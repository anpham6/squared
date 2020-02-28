import ExtensionUI from '../extension-ui';
import NodeUI from '../node-ui';

import { CSS_SPACING } from '../lib/constant';
import { BOX_STANDARD, NODE_ALIGNMENT } from '../lib/enumeration';

const $lib = squared.lib;

const { formatPX } = $lib.css;
const { hasBit } = $lib.util;

const DOCTYPE_HTML = document.doctype?.name === 'html';
const COLLAPSE_TOP: [string, string, string, number] = ['marginTop', 'borderTopWidth', 'paddingTop', BOX_STANDARD.MARGIN_TOP];
const COLLAPSE_BOTTOM: [string, string, string, number] = ['marginBottom', 'borderBottomWidth', 'paddingBottom', BOX_STANDARD.MARGIN_BOTTOM];

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

function applyMarginCollapse(node: NodeUI, child: NodeUI, direction: boolean) {
    if (!direction || isBlockElement(child, true)) {
        const [marginName, borderWidth, paddingName, region] = direction ? COLLAPSE_TOP : COLLAPSE_BOTTOM;
        if (node[borderWidth] === 0) {
            if (node[paddingName] === 0) {
                let target = child;
                while (DOCTYPE_HTML && target[marginName] === 0 && target[borderWidth] === 0 && target[paddingName] === 0 && canResetChild(target)) {
                    if (direction) {
                        const endChild = <NodeUI> target.firstStaticChild;
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
                if (offsetParent > 0 || offsetChild > 0) {
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
                        else if (target.getBox(region)[0] !== 1) {
                            if (outside) {
                                resetChild = true;
                            }
                            else if (node.documentBody) {
                                if (direction) {
                                    resetMargin(node, region);
                                    node.bounds.top = 0;
                                    node.unset('box');
                                    node.unset('linear');
                                    if (node.layoutVertical) {
                                        const firstChild = node.renderChildren[0];
                                        if (firstChild && firstChild !== child.outerMostWrapper) {
                                            firstChild.modifyBox(region, offsetChild);
                                            target.modifyBox(region, -offsetChild, false);
                                            resetChild = true;
                                        }
                                    }
                                }
                            }
                            else {
                                if (node.getBox(region)[0] !== 1) {
                                    node.modifyBox(region);
                                    node.modifyBox(region, offsetChild);
                                }
                                else {
                                    node.registerBox(region)?.modifyBox(region, offsetChild);
                                }
                                resetChild = true;
                            }
                        }
                        else {
                            const registered = target.registerBox(region);
                            if (registered) {
                                const value = registered.getBox(region)[1];
                                if (value > 0) {
                                    node.modifyBox(region);
                                    node.modifyBox(region, value);
                                    registered.modifyBox(region, -value);
                                }
                            }
                        }
                    }
                    if (resetChild) {
                        resetMargin(target, region);
                        if (!direction && child.floating) {
                            const bounds = target.bounds;
                            for (const item of node.naturalChildren as NodeUI[]) {
                                if (item.floating && item !== target && item.intersectY(bounds, 'bounds')) {
                                    resetMargin(item, region);
                                }
                            }
                        }
                        if (height === 0 && !target.every(item => item.floating || !item.pageFlow)) {
                            resetMargin(target, direction ? BOX_STANDARD.MARGIN_BOTTOM : BOX_STANDARD.MARGIN_TOP);
                        }
                    }
                }
            }
            else if (child[marginName] === 0 && child[borderWidth] === 0 && canResetChild(child)) {
                let blockAll = true;
                do {
                    const endChild = <NodeUI> (direction ? child.firstStaticChild : child.lastStaticChild);
                    if (endChild && endChild[marginName] === 0 && endChild[borderWidth] === 0 && !endChild.visibleStyle.background && canResetChild(endChild)) {
                        const value = endChild[paddingName];
                        if (value > 0) {
                            if (value >= node[paddingName]) {
                                node.modifyBox(direction ? BOX_STANDARD.PADDING_TOP : BOX_STANDARD.PADDING_BOTTOM);
                            }
                            else if (blockAll) {
                                node.modifyBox(direction ? BOX_STANDARD.PADDING_TOP : BOX_STANDARD.PADDING_BOTTOM, -value);
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

function resetMargin(node: NodeUI, region: number) {
    if (node.getBox(region)[0] === 0) {
        node.modifyBox(region);
    }
    else {
        const outerWrapper = node.registerBox(region);
        if (outerWrapper) {
            const offset: number = node[CSS_SPACING.get(region) as string];
            outerWrapper.modifyBox(region, -offset, false);
        }
    }
}

function isBlockElement(node: Null<NodeUI>, direction?: boolean): boolean {
    if (node === null || node.lineBreak) {
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
        }
        if (direction !== undefined) {
            if (direction) {
                const firstChild = <NodeUI> node.firstStaticChild;
                return isBlockElement(firstChild) && validAboveChild(firstChild, false);
            }
            else {
                const lastChild = <NodeUI> node.lastStaticChild;
                return isBlockElement(lastChild) && validBelowChild(lastChild, false);
            }
        }
    }
    return false;
}

function getMarginOffset<T extends NodeUI>(below: T, above: T, lineHeight: number, aboveLineBreak?: T): [number, T] {
    let top = Number.POSITIVE_INFINITY;
    if (below.nodeGroup && below.some(item => item.floating)) {
        for (const item of below.renderChildren as T[]) {
            if (!item.floating) {
                const topA = item.linear.top;
                if (topA < top) {
                    top = topA;
                    below = item;
                }
            }
        }
    }
    if (top === Number.POSITIVE_INFINITY) {
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
        bottomChild = <NodeUI> node.lastStaticChild;
        if (!isBlockElement(node, false)) {
            bottomChild = undefined;
        }
    }
    else {
        let bottomFloatChild: Undef<NodeUI>;
        const children = node.naturalChildren;
        for (let j = children.length - 1; j >= 0; j--) {
            const item = <NodeUI> children[j];
            if (item.floating) {
                if (bottomChild === undefined) {
                    const bottom = item.linear.bottom;
                    if (bottomFloatChild) {
                        if (bottom > bottomFloatChild.linear.bottom) {
                            bottomFloatChild = item;
                        }
                    }
                    else if (item.linear.bottom >= node.box.bottom) {
                        bottomFloatChild = item;
                    }
                }
                else if (item.linear.bottom >= bottomChild.linear.bottom) {
                    bottomChild = item;
                    break;
                }
            }
            else if (bottomChild === undefined) {
                if (bottomFloatChild && bottomFloatChild.linear.bottom > item.linear.bottom) {
                    bottomChild = bottomFloatChild;
                    break;
                }
                bottomChild = item;
            }
        }
        if (bottomChild === undefined) {
            bottomChild = bottomFloatChild;
        }
    }
    return bottomChild;
}

const setMinHeight = (node: NodeUI, offset: number) => node.css('minHeight', formatPX(Math.max(offset, node.hasPX('minHeight', false) ? node.parseUnit(node.css('minHeight')) : 0)));
const canResetChild = (node: NodeUI, children = true) => (!children && node.blockStatic || children && node.length > 0) && !node.layoutElement && !node.tableElement && node.tagName !== 'FIELDSET';
const validAboveChild = (node: NodeUI, children: boolean) => !node.hasPX('height') && node.borderBottomWidth === 0 && node.paddingBottom === 0 && canResetChild(node, children);
const validBelowChild = (node: NodeUI, children: boolean) => !node.hasPX('height') && node.borderTopWidth === 0 && node.paddingTop === 0 && canResetChild(node, children);

export default abstract class WhiteSpace<T extends NodeUI> extends ExtensionUI<T> {
    public afterBaseLayout() {
        const application = this.application;
        const processed = new Set<number>();
        const clearMap = application.session.clearMap;
        for (const node of this.cacheProcessing) {
            if (node.naturalElement && !node.hasAlign(NODE_ALIGNMENT.AUTO_LAYOUT)) {
                const children = node.naturalChildren;
                const length = children.length;
                if (length === 0 || node.id === 0) {
                    continue;
                }
                const actualParent = node.actualParent as T;
                const blockParent = isBlockElement(node, true) && !actualParent.layoutElement;
                const pageFlow = node.pageFlow;
                const collapseMargin = blockParent && pageFlow;
                let firstChild: Undef<T>;
                let lastChild: Undef<T>;
                for (let i = 0; i < length; i++) {
                    const current = children[i] as T;
                    if (current.pageFlow) {
                        if (collapseMargin) {
                            if (!current.floating) {
                                if (firstChild === undefined && (current.bounds.height > 0 || length === 1 || isBlockElement(current, true))) {
                                    firstChild = current;
                                }
                                lastChild = current;
                            }
                            else {
                                if (lastChild) {
                                    if (current.linear.bottom >= lastChild.linear.bottom) {
                                        lastChild = current;
                                    }
                                }
                                else {
                                    lastChild = current;
                                }
                            }
                        }
                        if (i > 0 && isBlockElement(current, true)) {
                            const previousSiblings = current.previousSiblings({ floating: false });
                            const q = previousSiblings.length;
                            if (q) {
                                let inheritedTop = false;
                                const previous = previousSiblings[q - 1];
                                if (isBlockElement(previous, false)) {
                                    let marginBottom = previous.marginBottom;
                                    let marginTop = current.marginTop;
                                    if (previous.excluded && !current.excluded) {
                                        const offset = Math.min(marginBottom, previous.marginTop);
                                        if (offset < 0) {
                                            current.modifyBox(BOX_STANDARD.MARGIN_TOP, Math.abs(offset) < marginTop ? offset : undefined);
                                            processed.add(previous.id);
                                            continue;
                                        }
                                    }
                                    else if (!previous.excluded && current.excluded) {
                                        const offset = Math.min(marginTop, current.marginBottom);
                                        if (offset < 0) {
                                            previous.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, Math.abs(offset) < marginBottom ? offset : undefined);
                                            processed.add(current.id);
                                            continue;
                                        }
                                    }
                                    let inheritedBottom = false;
                                    if (blockParent) {
                                        let inherit = previous;
                                        while (validAboveChild(inherit, true)) {
                                            let bottomChild = getBottomChild(inherit);
                                            if (bottomChild?.getBox(BOX_STANDARD.MARGIN_BOTTOM)[0] === 0) {
                                                let childBottom = bottomChild.marginBottom;
                                                let currentChild = bottomChild;
                                                while (currentChild.bounds.height === 0) {
                                                    childBottom = Math.max(currentChild.marginTop, currentChild.marginBottom, childBottom);
                                                    resetMargin(currentChild, BOX_STANDARD.MARGIN_TOP);
                                                    const sibling = currentChild.previousSibling as T;
                                                    if (sibling) {
                                                        if (sibling.marginBottom >= childBottom) {
                                                            resetMargin(currentChild, BOX_STANDARD.MARGIN_BOTTOM);
                                                            bottomChild = sibling;
                                                            childBottom = sibling.marginBottom;
                                                            currentChild = sibling;
                                                        }
                                                        else if (sibling.bounds.height > 0) {
                                                            break;
                                                        }
                                                        else {
                                                            resetMargin(sibling, BOX_STANDARD.MARGIN_BOTTOM);
                                                            currentChild = sibling;
                                                        }
                                                    }
                                                    else {
                                                        break;
                                                    }
                                                }
                                                resetMargin(bottomChild, BOX_STANDARD.MARGIN_BOTTOM);
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
                                                let childTop = topChild.marginTop;
                                                let currentChild = topChild;
                                                while (currentChild.bounds.height === 0) {
                                                    childTop = Math.max(currentChild.marginTop, currentChild.marginBottom, childTop);
                                                    resetMargin(currentChild, BOX_STANDARD.MARGIN_BOTTOM);
                                                    const sibling = currentChild.nextSibling as T;
                                                    if (sibling) {
                                                        if (sibling.marginTop >= childTop) {
                                                            resetMargin(currentChild, BOX_STANDARD.MARGIN_TOP);
                                                            topChild = sibling;
                                                            childTop = sibling.marginTop;
                                                            currentChild = sibling;
                                                        }
                                                        else if (sibling.bounds.height > 0) {
                                                            break;
                                                        }
                                                        else {
                                                            resetMargin(sibling, BOX_STANDARD.MARGIN_TOP);
                                                            currentChild = sibling;
                                                        }
                                                    }
                                                    else {
                                                        break;
                                                    }
                                                }
                                                resetMargin(topChild, BOX_STANDARD.MARGIN_TOP);
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
                                    }
                                    if (marginBottom > 0 && marginTop > 0) {
                                        if (marginTop <= marginBottom) {
                                            if (!inheritedTop || !hasBit(current.overflow, NODE_ALIGNMENT.BLOCK)) {
                                                if (inheritedTop) {
                                                    inheritedTop = false;
                                                }
                                                resetMargin(current, BOX_STANDARD.MARGIN_TOP);
                                                if (current.bounds.height === 0 && marginBottom >= current.marginBottom) {
                                                    resetMargin(current, BOX_STANDARD.MARGIN_BOTTOM);
                                                }
                                            }
                                        }
                                        else {
                                            if (!inheritedBottom || !hasBit(previous.overflow, NODE_ALIGNMENT.BLOCK)) {
                                                if (inheritedBottom) {
                                                    inheritedBottom = false;
                                                }
                                                resetMargin(previous, BOX_STANDARD.MARGIN_BOTTOM);
                                                if (previous.bounds.height === 0 && marginTop >= previous.marginTop) {
                                                    resetMargin(previous, BOX_STANDARD.MARGIN_TOP);
                                                }
                                            }
                                        }
                                    }
                                    if (inheritedTop) {
                                        const previousSibling = previous.previousSibling;
                                        const adjacentBottom = previousSibling && isBlockElement(previousSibling, false) ? Math.max(previousSibling.getBox(BOX_STANDARD.MARGIN_BOTTOM)[1], previousSibling.marginBottom) : 0;
                                        if (marginTop > adjacentBottom) {
                                            (current.registerBox(BOX_STANDARD.MARGIN_TOP) || current).setCacheValue('marginTop', marginTop);
                                        }
                                    }
                                    if (inheritedBottom) {
                                        const nextSibling = previous.nextSibling;
                                        const adjacentTop = nextSibling && isBlockElement(nextSibling, true) ? Math.max(nextSibling.getBox(BOX_STANDARD.MARGIN_TOP)[1], nextSibling.marginTop) : 0;
                                        if (marginBottom >= adjacentTop) {
                                            (previous.registerBox(BOX_STANDARD.MARGIN_BOTTOM) || previous).setCacheValue('marginBottom', marginBottom);
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
                    }
                }
                if (pageFlow && !hasBit(node.overflow, NODE_ALIGNMENT.BLOCK) && node.tagName !== 'FIELDSET') {
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
        for (const node of application.processing.excluded) {
            if (node.lineBreak && !node.lineBreakTrailing && !clearMap.has(node) && !processed.has(node.id)) {
                let valid = false;
                const previousSiblings = node.previousSiblings({ floating: false });
                if (previousSiblings.length) {
                    const actualParent = node.actualParent as T;
                    const nextSiblings = node.nextSiblings();
                    if (nextSiblings.length) {
                        let above = previousSiblings.pop() as T;
                        let below = nextSiblings.pop() as T;
                        let lineHeight = 0;
                        let aboveLineBreak: Undef<T>;
                        let offset: number;
                        if (above.rendered && below.rendered) {
                            const inline = above.inlineStatic && below.inlineStatic;
                            if (inline && previousSiblings.length === 0) {
                                processed.add(node.id);
                                continue;
                            }
                            if (!above.multiline && above.has('lineHeight')) {
                                const aboveOffset = Math.floor((above.lineHeight - above.bounds.height) / 2);
                                if (aboveOffset > 0) {
                                    lineHeight += aboveOffset;
                                }
                            }
                            if (!below.multiline && below.has('lineHeight')) {
                                const belowOffset = Math.round((below.lineHeight - below.bounds.height) / 2);
                                if (belowOffset > 0) {
                                    lineHeight += belowOffset;
                                }
                            }
                            if (inline) {
                                aboveLineBreak = previousSiblings[0] as T;
                                if (previousSiblings.length === 1) {
                                    aboveLineBreak = aboveLineBreak.lineBreak ? node : undefined;
                                }
                                aboveLineBreak?.setBounds(false);
                            }
                            let aboveParent = above.renderParent;
                            let belowParent = below.renderParent;
                            while (aboveParent && aboveParent !== actualParent) {
                                above = aboveParent as T;
                                aboveParent = above.renderParent;
                            }
                            while (belowParent && belowParent !== actualParent) {
                                below = belowParent as T;
                                belowParent = below.renderParent;
                            }
                            [offset, below] = getMarginOffset(below, above, lineHeight, aboveLineBreak);
                            if (offset >= 1) {
                                if (below.visible) {
                                    below.modifyBox(BOX_STANDARD.MARGIN_TOP, offset);
                                    valid = true;
                                }
                                else if (above.visible) {
                                    above.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, offset);
                                    valid = true;
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
                    else if (actualParent.visible && !actualParent.preserveWhiteSpace && actualParent.tagName !== 'CODE') {
                        if (!actualParent.documentRoot && actualParent.ascend({ condition: item => item.documentRoot, attr: 'outerWrapper' }).length === 0) {
                            const previousStart = previousSiblings[previousSiblings.length - 1];
                            const rect = previousStart.bounds.height === 0 && previousStart.length ? NodeUI.outerRegion(previousStart) : previousStart.linear;
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
                        else if (nextSiblings.length) {
                            const nextStart = nextSiblings[nextSiblings.length - 1];
                            const offset = (nextStart.lineBreak || nextStart.excluded ? nextStart.linear.bottom : nextStart.linear.top) - actualParent.box.top;
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
                            processed.add(item.id);
                        }
                        for (const item of nextSiblings) {
                            processed.add(item.id);
                        }
                    }
                }
            }
        }
    }

    public afterConstraints() {
        for (const node of this.cacheProcessing) {
            if (node.naturalChild && node.styleElement && node.inlineVertical && node.pageFlow && !node.positioned && !(node.actualParent as T).layoutElement) {
                const outerWrapper = node.outerMostWrapper;
                const renderParent = outerWrapper.renderParent;
                if (renderParent?.hasAlign(NODE_ALIGNMENT.AUTO_LAYOUT) === false) {
                    if (node.blockDimension && !node.floating) {
                        if (renderParent.layoutVertical) {
                            const children = renderParent.renderChildren;
                            const index = children.findIndex(item => item === outerWrapper);
                            if (index !== -1) {
                                if (!node.lineBreakLeading) {
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
                        else {
                            const horizontalRows = renderParent.horizontalRows;
                            const validSibling = (item: T) => item.pageFlow && item.blockDimension && !item.floating;
                            let horizontal: Undef<T[]>;
                            if (horizontalRows && horizontalRows.length > 1) {
                                found: {
                                    let maxBottom = Number.NEGATIVE_INFINITY;
                                    const q = horizontalRows.length;
                                    for (let i = 0; i < q; i++) {
                                        const row = horizontalRows[i] as T[];
                                        const r = row.length;
                                        for (let j = 0; j < r; j++) {
                                            if (outerWrapper === row[j]) {
                                                if (i > 0) {
                                                    setSpacingOffset(outerWrapper, BOX_STANDARD.MARGIN_TOP, maxBottom);
                                                }
                                                else {
                                                    horizontal = row;
                                                }
                                                break found;
                                            }
                                        }
                                        for (const item of row) {
                                            const innerWrapped = item.innerMostWrapped as T;
                                            if (validSibling(innerWrapped)) {
                                                maxBottom = Math.max(innerWrapped.actualRect('bottom'), maxBottom);
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
                                let actualChildren: T[] = [];
                                for (const item of horizontal) {
                                    if (item.nodeGroup) {
                                        actualChildren = actualChildren.concat(item.cascade(child => child.naturalChild) as T[]);
                                    }
                                    else if (item.innerWrapped) {
                                        actualChildren.push(item.innerMostWrapped as T);
                                    }
                                    else {
                                        actualChildren.push(item);
                                    }
                                }
                                const parent = node.actualParent as T;
                                const top = node.actualRect('top');
                                let maxBottom = Number.NEGATIVE_INFINITY;
                                for (const item of parent.naturalChildren as T[]) {
                                    if (actualChildren.includes(item)) {
                                        break;
                                    }
                                    else if (item.lineBreak) {
                                        maxBottom = Number.NEGATIVE_INFINITY;
                                    }
                                    else if (item.excluded) {
                                        continue;
                                    }
                                    else if (validSibling(item)) {
                                        maxBottom = Math.max(item.actualRect('bottom'), maxBottom);
                                    }
                                }
                                if (maxBottom !== Number.NEGATIVE_INFINITY && top > maxBottom) {
                                    setSpacingOffset(outerWrapper, BOX_STANDARD.MARGIN_TOP, maxBottom);
                                }
                            }
                        }
                    }
                    if (!renderParent.layoutVertical && !outerWrapper.alignParent('left')) {
                        const documentId = outerWrapper.alignSibling('leftRight');
                        if (documentId !== '') {
                            const previousSibling = renderParent.renderChildren.find(item => item.documentId === documentId);
                            if (previousSibling?.inlineVertical) {
                                setSpacingOffset(outerWrapper, BOX_STANDARD.MARGIN_LEFT, previousSibling.actualRect('right'));
                            }
                        }
                        else {
                            let current = node;
                            while (true) {
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
                        }
                    }
                }
            }
            if (node.floatContainer && node.layoutVertical) {
                const floating: T[] = [];
                for (const item of node.naturalChildren as T[]) {
                    if (!item.floating) {
                        if (floating.length) {
                            const outerWrapper = item.outerMostWrapper;
                            let renderParent = outerWrapper.renderParent;
                            if (renderParent) {
                                const [reset, adjustment] = item.getBox(BOX_STANDARD.MARGIN_TOP);
                                const marginTop = (!reset ? item.marginTop : 0) + adjustment;
                                if (marginTop > 0) {
                                    const top = Math.floor(node.bounds.top);
                                    for (const previous of floating) {
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
        }
    }
}