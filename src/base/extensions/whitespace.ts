import ExtensionUI from '../extension-ui';
import NodeUI from '../node-ui';

import { CSS_SPACING } from '../lib/constant';
import { BOX_STANDARD, NODE_ALIGNMENT } from '../lib/enumeration';

const {
    css: $css,
    session: $session,
    util: $util
} = squared.lib;

const DOCTYPE_HTML = document.doctype !== null && document.doctype.name === 'html';

function setMinHeight(node: NodeUI, offset: number) {
    const minHeight = node.hasPX('minHeight', false) ? node.parseUnit(node.css('minHeight')) : 0;
    node.css('minHeight', $css.formatPX(Math.max(offset, minHeight)));
}

function setSpacingOffset(node: NodeUI, region: number, value: number) {
    let offset = 0 ;
    switch (region) {
        case BOX_STANDARD.MARGIN_LEFT:
            offset = node.actualRect('left') - value;
            break;
        case BOX_STANDARD.MARGIN_TOP:
            offset = node.actualRect('top') - value;
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
                    const endChild = <NodeUI> (direction ? child.firstChild : child.lastChild);
                    if (isBlockElement(endChild, direction)) {
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
                    if (child.bounds.height === 0 && outside && child.textEmpty && child.extensions.length === 0) {
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
                                    node.unset('box');
                                    node.unset('linear');
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
            else if (child[margin] === 0 && child[borderWidth] === 0 && canResetChild(child)) {
                let blockAll = true;
                do {
                    const endChild = <NodeUI> (direction ? child.firstChild : child.lastChild);
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
    let valid = false;
    if (node.getBox(value)[0] === 0) {
        node.modifyBox(value);
        valid = true;
    }
    else {
        for (const outerWrapper of node.ascend(undefined, undefined, 'outerWrapper')) {
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

function isBlockElement(node: NodeUI | null, direction?: boolean): boolean {
    if (node && !node.floating && !node.lineBreak) {
        if (node.blockStatic || node.display === 'table') {
            return true;
        }
        else if (direction !== undefined) {
            if (direction) {
                const firstChild = <NodeUI> node.firstChild;
                return isBlockElement(firstChild) && validAboveChild(firstChild);
            }
            else {
                const lastChild = <NodeUI> node.lastChild;
                return isBlockElement(lastChild) && validBelowChild(lastChild);
            }
        }
    }
    return false;
}

const canResetChild = (node: NodeUI) => !node.layoutElement && !node.tableElement && node.tagName !== 'FIELDSET';

const validAboveChild = (node: NodeUI) => node.paddingBottom === 0 && node.borderBottomWidth === 0 && canResetChild(node);

const validBelowChild = (node: NodeUI) => node.borderTopWidth === 0 && node.paddingTop === 0 && canResetChild(node);

export default abstract class WhiteSpace<T extends NodeUI> extends ExtensionUI<T> {
    public afterBaseLayout() {
        const processed = new Set<number>();
        for (const node of this.application.processing.cache) {
            if (node.naturalElement && !node.layoutElement && node.naturalElements.length && node.id !== 0) {
                const children = node.naturalChildren;
                let firstChild: T | undefined;
                let lastChild: T | undefined;
                const length = children.length;
                for (let i = 0; i < length; i++) {
                    const current = children[i] as T;
                    if (!current.pageFlow) {
                        continue;
                    }
                    if (!node.floating) {
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
                    if (i > 0 && isBlockElement(current, false)) {
                        const previousSiblings = current.previousSiblings({ floating: false });
                        if (previousSiblings.length) {
                            const previous = previousSiblings.find(item => !item.floating) as T;
                            if (isBlockElement(previous, true)) {
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
                                    let inherit = previous;
                                    let inheritTop = false;
                                    let inheritBottom = false;
                                    while (validAboveChild(inherit)) {
                                        const bottomChild = inherit.lastChild as T;
                                        if (isBlockElement(bottomChild, true) && bottomChild.getBox(BOX_STANDARD.MARGIN_BOTTOM)[0] !== 1) {
                                            const childBottom = bottomChild.marginBottom;
                                            resetMargin(bottomChild, BOX_STANDARD.MARGIN_BOTTOM);
                                            if (childBottom > marginBottom) {
                                                marginBottom = childBottom;
                                                previous.setCacheValue('marginBottom', marginBottom);
                                                inheritBottom = true;
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
                                        const topChild = inherit.firstChild as T;
                                        if (isBlockElement(topChild, false) && topChild.getBox(BOX_STANDARD.MARGIN_TOP)[0] !== 1) {
                                            const childTop = topChild.marginTop;
                                            resetMargin(topChild, BOX_STANDARD.MARGIN_TOP);
                                            if (childTop > marginTop) {
                                                marginTop = childTop;
                                                current.setCacheValue('marginTop', marginTop);
                                                inheritTop = true;
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
                                            if (!$util.hasBit(current.overflow, NODE_ALIGNMENT.BLOCK) && !$util.hasBit(previous.overflow, NODE_ALIGNMENT.BLOCK)) {
                                                if (marginTop <= marginBottom) {
                                                    if (inheritTop) {
                                                        current.setCacheValue('marginTop', 0);
                                                    }
                                                    resetMargin(current, BOX_STANDARD.MARGIN_TOP);
                                                }
                                                else {
                                                    if (inheritBottom) {
                                                        previous.setCacheValue('marginBottom', 0);
                                                    }
                                                    resetMargin(previous, BOX_STANDARD.MARGIN_BOTTOM);
                                                }
                                            }
                                        }
                                        else if (previous.bounds.height === 0) {
                                            resetMargin(previous, BOX_STANDARD.MARGIN_BOTTOM);
                                        }
                                    }
                                }
                            }
                            else if (previous && previous.blockDimension && !previous.block && current.length === 0) {
                                const offset = current.linear.top - previous.linear.bottom;
                                if (Math.floor(offset) > 0 && current.ascend(item => item.hasPX('height')).length === 0) {
                                    current.modifyBox(BOX_STANDARD.MARGIN_TOP, offset);
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
                    const aboveParent = above.renderParent;
                    const belowParent = below.renderParent;
                    function getMarginOffset() {
                        let offset: number;
                        if (below.lineHeight > 0 && below.cssTry('line-height', 'normal')) {
                            offset = $session.actualClientRect(<Element> below.element, below.sessionId).top - below.marginTop;
                            below.cssFinally('line-height');
                        }
                        else {
                            offset = below.linear.top;
                        }
                        if (above.lineHeight > 0 && above.cssTry('line-height', 'normal')) {
                            offset -= $session.actualClientRect(<Element> above.element, above.sessionId).bottom + above.marginBottom;
                            above.cssFinally('line-height');
                        }
                        else {
                            offset -= above.linear.bottom;
                        }
                        return offset;
                    }
                    valid = true;
                    if (aboveParent && belowParent) {
                        const aboveGroup = aboveParent.nodeGroup && aboveParent.lastChild === above;
                        const belowGroup = belowParent.nodeGroup && belowParent.firstChild === below;
                        if (belowGroup) {
                            belowParent.modifyBox(BOX_STANDARD.MARGIN_TOP, belowParent.linear.top - (aboveGroup ? aboveParent : above).linear.bottom);
                        }
                        else if (aboveGroup) {
                            aboveParent.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, below.linear.top - aboveParent.linear.bottom);
                        }
                        else {
                            const offset = getMarginOffset();
                            if (offset !== 0) {
                                if (belowParent.layoutVertical && below.visible) {
                                    below.modifyBox(BOX_STANDARD.MARGIN_TOP, offset);
                                }
                                else if (aboveParent.layoutVertical && above.visible) {
                                    above.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, offset);
                                }
                            }
                        }
                    }
                    else {
                        const actualParent = <NodeUI> node.actualParent;
                        if (actualParent) {
                            const offset = getMarginOffset();
                            if (offset !== 0) {
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
                        }
                        else {
                            valid = false;
                        }
                    }
                }
                else {
                    const actualParent = <NodeUI> node.actualParent;
                    if (actualParent && actualParent.visible) {
                        if (!actualParent.documentRoot && actualParent.ascend(item => item.documentRoot, undefined, 'outerWrapper').length === 0 && previousSiblings.length) {
                            const previousStart = previousSiblings[previousSiblings.length - 1];
                            const rect = previousStart.bounds.height === 0 && previousStart.length ? NodeUI.outerRegion(previousStart) : previousStart.linear;
                            const offset = actualParent.box.bottom - rect[previousStart.lineBreak || previousStart.excluded ? 'top' : 'bottom'];
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
            if (node.pageFlow) {
                const renderParent = node.renderParent;
                if (renderParent && node.styleElement && node.inlineVertical && !node.positioned && !node.documentParent.layoutElement && !renderParent.tableElement) {
                    if (node.blockDimension && !node.floating) {
                        let horizontal: T[] | undefined;
                        if (renderParent.layoutVertical) {
                            if (!node.lineBreakLeading) {
                                const index = renderParent.renderChildren.findIndex(item => item === node);
                                if (index !== -1) {
                                    const previous = renderParent.renderChildren[index - 1];
                                    if (previous && previous.pageFlow) {
                                        setSpacingOffset(node, BOX_STANDARD.MARGIN_TOP, previous.linear.bottom);
                                    }
                                }
                            }
                        }
                        else if (renderParent.horizontalRows) {
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
                                for (const item of actualParent.naturalChildren) {
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
                                    setSpacingOffset(node, BOX_STANDARD.MARGIN_TOP, maxBottom);
                                }
                            }
                        }
                    }
                    if (!node.alignParent('left')) {
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