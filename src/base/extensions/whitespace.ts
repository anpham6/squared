import ExtensionUI from '../extension-ui';
import NodeUI from '../node-ui';

import { CSS_SPACING } from '../lib/constant';
import { BOX_STANDARD, NODE_ALIGNMENT } from '../lib/enumeration';

const {
    css: $css,
    util: $util
} = squared.lib;

const DOCTYPE_HTML = document.doctype !== null && document.doctype.name === 'html';

function setMinHeight(node: NodeUI, offset: number) {
    const minHeight = node.hasPX('minHeight', false) ? node.parseUnit(node.css('minHeight')) : 0;
    node.css('minHeight', $css.formatPX(Math.max(offset, minHeight)));
}

function setSpacingOffset(node: NodeUI, region: number, value: number) {
    let offset = 0;
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
    }
    if (offset > 0) {
        (node.renderAs || node.outerWrapper || node).modifyBox(region, offset);
    }
}

function applyMarginCollapse(node: NodeUI, child: NodeUI, direction: boolean) {
    if (isBlockElement(child, direction)) {
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
                while (DOCTYPE_HTML && child[margin] === 0 && child[borderWidth] === 0 && child[padding] === 0 && canResetChild(child)) {
                    const endChild = <NodeUI> (direction ? child.firstStaticChild : child.lastStaticChild);
                    if (isBlockElement(endChild, direction)) {
                        child = endChild;
                    }
                    else {
                        break;
                    }
                }
                const offsetParent = node[margin];
                const offsetChild = child[margin];
                const height = child.bounds.height;
                let resetChild = false;
                if (!DOCTYPE_HTML && offsetParent === 0 && offsetChild > 0 && child.cssInitial(margin) === '') {
                    resetChild = true;
                }
                else {
                    const outside = offsetParent >= offsetChild;
                    if (height === 0 && outside && child.textEmpty && child.extensions.length === 0) {
                        child.hide();
                    }
                    else if (child.getBox(boxMargin)[0] !== 1) {
                        if (outside) {
                            resetChild = true;
                        }
                        else if (node.documentBody) {
                            resetMargin(node, boxMargin);
                            if (direction) {
                                node.bounds.top = 0;
                                node.unset('box');
                                node.unset('linear');
                            }
                        }
                        else {
                            if (node.getBox(boxMargin)[0] !== 1) {
                                node.modifyBox(boxMargin);
                                node.modifyBox(boxMargin, offsetChild);
                            }
                            resetChild = true;
                        }
                    }
                }
                if (resetChild) {
                    resetMargin(child, boxMargin);
                    if (height === 0) {
                        resetMargin(child, direction ? BOX_STANDARD.MARGIN_BOTTOM : BOX_STANDARD.MARGIN_TOP);
                    }
                }
            }
            else if (child[margin] === 0 && child[borderWidth] === 0 && canResetChild(child)) {
                let blockAll = true;
                do {
                    const endChild = <NodeUI> (direction ? child.firstStaticChild : child.lastStaticChild);
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

function resetMargin(node: NodeUI, value: number) {
    const offset = node[CSS_SPACING.get(value) as string];
    if (node.getBox(value)[0] === 0) {
        node.modifyBox(value);
    }
    else {
        for (const outerWrapper of node.ascend(undefined, undefined, 'outerWrapper')) {
            if (outerWrapper.getBox(value)[1] >= offset) {
                outerWrapper.modifyBox(value, -offset);
                break;
            }
        }
    }
}

function isBlockElement(node: NodeUI | null, direction?: boolean): boolean {
    if (node && !node.floating && !node.lineBreak) {
        if (node.blockStatic || node.display === 'table') {
            return true;
        }
        else if (direction !== undefined) {
            if (direction) {
                const firstChild = <NodeUI> node.firstStaticChild;
                return isBlockElement(firstChild) && validAboveChild(firstChild);
            }
            else {
                const lastChild = <NodeUI> node.lastStaticChild;
                return isBlockElement(lastChild) && validBelowChild(lastChild);
            }
        }
    }
    return false;
}

const canResetChild = (node: NodeUI) => !node.layoutElement && !node.tableElement && node.tagName !== 'FIELDSET';

const validAboveChild = (node: NodeUI) => !node.hasPX('height') && node.paddingBottom === 0 && node.borderBottomWidth === 0 && canResetChild(node);

const validBelowChild = (node: NodeUI) => !node.hasPX('height') && node.borderTopWidth === 0 && node.paddingTop === 0 && canResetChild(node);

export default abstract class WhiteSpace<T extends NodeUI> extends ExtensionUI<T> {
    public afterBaseLayout() {
        const processed = new Set<number>();
        for (const node of this.application.processing.cache) {
            if (node.naturalElement && !node.layoutElement && !node.tableElement && node.naturalElements.length && node.id !== 0) {
                let firstChild: T | undefined;
                let lastChild: T | undefined;
                const children = node.naturalChildren;
                const length = children.length;
                for (let i = 0; i < length; i++) {
                    const current = children[i] as T;
                    if (!current.pageFlow) {
                        continue;
                    }
                    if (!node.floating) {
                        if (!current.floating) {
                            if (current.bounds.height > 0 || length === 1 || current.tagName === 'HR') {
                                if (firstChild === undefined) {
                                    firstChild = current;
                                }
                                lastChild = current;
                            }
                        }
                        else {
                            lastChild = undefined;
                        }
                    }
                    if (i > 0 && isBlockElement(current, false)) {
                        const previousSiblings = current.previousSiblings({ floating: false });
                        if (previousSiblings.length) {
                            const previous = previousSiblings[previousSiblings.length - 1];
                            let inheritedTop = false;
                            if (isBlockElement(previous, true)) {
                                let marginBottom = previous.marginBottom;
                                let marginTop = current.marginTop;
                                if (previous.excluded && !current.excluded) {
                                    const offset = Math.min(marginBottom, previous.marginTop);
                                    if (offset < 0) {
                                        const top = Math.abs(offset) >= marginTop ? undefined : offset;
                                        current.modifyBox(BOX_STANDARD.MARGIN_TOP, top);
                                        processed.add(previous.id);
                                        continue;
                                    }
                                }
                                else if (!previous.excluded && current.excluded) {
                                    const offset = Math.min(marginTop, current.marginBottom);
                                    if (offset < 0) {
                                        previous.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, Math.abs(offset) >= marginBottom ? undefined : offset);
                                        processed.add(current.id);
                                        continue;
                                    }
                                }
                                let inherit = previous;
                                let inheritedBottom = false;
                                while (validAboveChild(inherit)) {
                                    const bottomChild = inherit.lastStaticChild as T;
                                    if (isBlockElement(bottomChild, true) && bottomChild.getBox(BOX_STANDARD.MARGIN_BOTTOM)[0] !== 1) {
                                        const childBottom = bottomChild.marginBottom;
                                        resetMargin(bottomChild, BOX_STANDARD.MARGIN_BOTTOM);
                                        if (childBottom > marginBottom) {
                                            marginBottom = childBottom;
                                            previous.setCacheValue('marginBottom', marginBottom);
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
                                while (validBelowChild(inherit)) {
                                    const topChild = inherit.firstStaticChild as T;
                                    if (isBlockElement(topChild, false) && topChild.getBox(BOX_STANDARD.MARGIN_TOP)[0] !== 1) {
                                        const childTop = topChild.marginTop;
                                        resetMargin(topChild, BOX_STANDARD.MARGIN_TOP);
                                        if (childTop > marginTop) {
                                            marginTop = childTop;
                                            current.setCacheValue('marginTop', marginTop);
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
                                            if (!inheritedTop || !$util.hasBit(current.overflow, NODE_ALIGNMENT.BLOCK)) {
                                                if (inheritedTop) {
                                                    current.setCacheValue('marginTop', 0);
                                                    inheritedTop = false;
                                                }
                                                resetMargin(current, BOX_STANDARD.MARGIN_TOP);
                                            }
                                        }
                                        else {
                                            if (!inheritedBottom || !$util.hasBit(previous.overflow, NODE_ALIGNMENT.BLOCK)) {
                                                if (inheritedBottom) {
                                                    previous.setCacheValue('marginBottom', 0);
                                                    inheritedBottom = false;
                                                }
                                                resetMargin(previous, BOX_STANDARD.MARGIN_BOTTOM);
                                            }
                                        }
                                    }
                                    else if (previous.bounds.height === 0) {
                                        resetMargin(previous, BOX_STANDARD.MARGIN_BOTTOM);
                                    }
                                }
                                if (inheritedTop) {
                                    for (const item of current.registerBox(BOX_STANDARD.MARGIN_TOP)) {
                                        item.setCacheValue('marginTop', marginTop);
                                    }
                                }
                                if (inheritedBottom) {
                                    for (const item of previous.registerBox(BOX_STANDARD.MARGIN_BOTTOM)) {
                                        item.setCacheValue('marginBottom', marginBottom);
                                    }
                                }
                            }
                            if (!inheritedTop && previousSiblings.length > 1) {
                                const adjacent = previousSiblings[0];
                                if (adjacent.floating) {
                                    if (node.layoutVertical || current.renderParent && current.renderParent.layoutVertical) {
                                        const offset = adjacent.linear.top - current.linear.top;
                                        if (offset < 0) {
                                            current.modifyBox(BOX_STANDARD.MARGIN_TOP, offset, false);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if (!$util.hasBit(node.overflow, NODE_ALIGNMENT.BLOCK) && !(node.documentParent.layoutElement && node.documentParent.css('flexDirection') === 'column') && node.tagName !== 'FIELDSET') {
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
            if (node.lineBreak && !node.lineBreakTrailing && !processed.has(node.id)) {
                const previousSiblings = node.previousSiblings({ floating: false });
                const nextSiblings = node.nextSiblings({ floating: false });
                let valid = false;
                if (previousSiblings.length && nextSiblings.length) {
                    let above = previousSiblings.pop() as T;
                    let below = nextSiblings.pop() as T;
                    if (above.inlineStatic && below.inlineStatic && previousSiblings.length === 0) {
                        processed.add(node.id);
                        continue;
                    }
                    const actualParent = node.actualParent as T;
                    if (actualParent) {
                        let lineHeight = 0;
                        const getMarginOffset = () => below.linear.top - above.linear.bottom - lineHeight;
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
                        let aboveParent = above.renderParent;
                        let belowParent = below.renderParent;
                        if (aboveParent && belowParent) {
                            while (aboveParent && aboveParent !== actualParent) {
                                above = aboveParent as T;
                                aboveParent = above.renderParent;
                            }
                            while (belowParent && belowParent !== actualParent) {
                                below = belowParent as T;
                                belowParent = below.renderParent;
                            }
                            if (belowParent === aboveParent) {
                                const offset = getMarginOffset();
                                if (offset !== 0) {
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
                        }
                        else {
                            const offset = getMarginOffset();
                            if (offset !== 0) {
                                if (below.lineBreak || below.excluded) {
                                    actualParent.modifyBox(BOX_STANDARD.PADDING_BOTTOM, offset);
                                    valid = true;
                                }
                                else if (above.lineBreak || above.excluded) {
                                    actualParent.modifyBox(BOX_STANDARD.PADDING_TOP, offset);
                                    valid = true;
                                }
                            }
                        }
                    }
                }
                else {
                    const actualParent = <NodeUI> node.actualParent;
                    if (actualParent && actualParent.visible) {
                        if (!actualParent.documentRoot && actualParent.ascend(item => item.documentRoot, undefined, 'outerWrapper').length === 0 && previousSiblings.length) {
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
        const cache = this.application.processing.cache;
        for (const node of cache) {
            if (node.pageFlow) {
                const renderParent = node.renderParent;
                if (renderParent && node.styleElement && node.inlineVertical && !node.positioned && !node.documentParent.layoutElement && !renderParent.tableElement) {
                    if (node.blockDimension && !node.floating) {
                        if (renderParent.layoutVertical) {
                            const children = renderParent.renderChildren;
                            const index = children.findIndex(item => item === node);
                            if (index !== -1) {
                                if (!node.lineBreakLeading) {
                                    const previous = children[index - 1];
                                    if (previous && previous.pageFlow) {
                                        setSpacingOffset(node, BOX_STANDARD.MARGIN_TOP, previous.actualRect('bottom'));
                                    }
                                }
                                if (!node.lineBreakTrailing) {
                                    const next = children[index + 1];
                                    if (next && next.pageFlow && next.styleElement && !next.inlineVertical) {
                                        setSpacingOffset(node, BOX_STANDARD.MARGIN_BOTTOM, next.actualRect('top'));
                                    }
                                }
                            }
                        }
                        else {
                            let horizontal: T[] | undefined;
                            if (renderParent.horizontalRows) {
                                found: {
                                    const horizontalRows = renderParent.horizontalRows;
                                    let maxBottom = Number.NEGATIVE_INFINITY;
                                    const lengthA = horizontalRows.length;
                                    for (let i = 0; i < lengthA; i++) {
                                        const row = horizontalRows[i] as T[];
                                        const lengthB = row.length;
                                        for (let j = 0; j < lengthB; j++) {
                                            if (node === row[j]) {
                                                if (i > 0) {
                                                    setSpacingOffset(node, BOX_STANDARD.MARGIN_TOP, maxBottom);
                                                }
                                                else {
                                                    horizontal = row;
                                                }
                                                break found;
                                            }
                                        }
                                        for (const item of row) {
                                            if (item.blockDimension && !item.floating) {
                                                const bottom = item.actualRect('bottom');
                                                if (bottom > maxBottom) {
                                                    maxBottom = bottom;
                                                }
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
                                    const top = node.actualRect('top');
                                    let maxBottom = Number.NEGATIVE_INFINITY;
                                    for (const item of actualParent.naturalChildren as T[]) {
                                        if (horizontal.includes(item as T)) {
                                            break;
                                        }
                                        else if (item.lineBreak) {
                                            maxBottom = Number.NEGATIVE_INFINITY;
                                        }
                                        else if (item.blockDimension && !item.floating) {
                                            const bottom = item.actualRect('bottom');
                                            if (bottom > maxBottom) {
                                                maxBottom = bottom;
                                            }
                                        }
                                    }
                                    if (maxBottom !== Number.NEGATIVE_INFINITY && top > maxBottom) {
                                        setSpacingOffset(node, BOX_STANDARD.MARGIN_TOP, maxBottom);
                                    }
                                }
                            }
                        }
                    }
                    if (renderParent.layoutHorizontal && !node.alignParent('left')) {
                        const documentId = node.alignSibling('leftRight');
                        if (documentId !== '') {
                            const previousSibling = renderParent.renderChildren.find(item => item.documentId === documentId);
                            if (previousSibling && previousSibling.inlineVertical) {
                                setSpacingOffset(node, BOX_STANDARD.MARGIN_LEFT, previousSibling.actualRect('right'));
                            }
                        }
                        else {
                            let current = node;
                            while (true) {
                                const siblingsLeading = current.siblingsLeading;
                                if (siblingsLeading.length && !siblingsLeading.some(item => item.lineBreak || item.excluded && item.blockStatic)) {
                                    const previousSibling = siblingsLeading[0] as T;
                                    if (previousSibling.inlineVertical) {
                                        setSpacingOffset(node, BOX_STANDARD.MARGIN_LEFT, previousSibling.actualRect('right'));
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
}