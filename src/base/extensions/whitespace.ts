import Extension from '../extension';
import Node from '../node';

import { BOX_STANDARD, CSS_STANDARD, NODE_ALIGNMENT } from '../lib/enumeration';

const $dom = squared.lib.dom;
const $util = squared.lib.util;

function setMinHeight<T extends Node>(node: T, offset: number) {
    const minHeight = node.has('minHeight', CSS_STANDARD.LENGTH) ? node.toInt('minHeight') : 0;
    node.css('minHeight', $util.formatPX(Math.max(offset, minHeight)));
}

function applyMarginCollapse<T extends Node>(node: T, child: T, direction: boolean) {
    if (child.blockStatic && !child.lineBreak) {
        if (direction) {
            if (node.borderTopWidth === 0 && node.paddingTop === 0) {
                if (node.marginTop < child.marginTop) {
                    node.modifyBox(BOX_STANDARD.MARGIN_TOP, null);
                    if (node.naturalElement && child.pageFlow) {
                        node.modifyBox(BOX_STANDARD.MARGIN_TOP, child.marginTop);
                    }
                }
                if (node.naturalElement) {
                    child.modifyBox(BOX_STANDARD.MARGIN_TOP, null);
                    if (child.companion) {
                        child.companion.modifyBox(BOX_STANDARD.MARGIN_TOP, null);
                    }
                }
            }
        }
        else if (node.borderBottomWidth === 0 && node.paddingBottom === 0) {
            if (node.marginBottom < child.marginBottom) {
                node.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, null);
                if (node.naturalElement && child.pageFlow) {
                    node.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, child.marginBottom);
                }
            }
            if (node.naturalElement) {
                child.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, null);
                if (child.companion) {
                    child.companion.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, null);
                }
            }
        }
    }
}

export default abstract class WhiteSpace<T extends Node> extends Extension<T> {
    public afterBaseLayout() {
        const processed = new Set<T>();
        for (const node of this.application.processing.cache) {
            if (node.htmlElement) {
                let firstChild: T | undefined;
                let lastChild: T | undefined;
                if (node.naturalElement && node.block) {
                    const element = <HTMLElement> node.element;
                    for (let i = 0; i < element.children.length; i++) {
                        let current = $dom.getElementAsNode<T>(element.children[i]);
                        if (current && current.block) {
                            if (node.blockStatic) {
                                if (firstChild === undefined) {
                                    firstChild = current;
                                }
                                lastChild = current;
                            }
                            if (!current.lineBreak) {
                                const previousSiblings = current.previousSiblings(true, true, true);
                                if (previousSiblings.length) {
                                    let previous = previousSiblings.find(item => !item.floating) as T | undefined;
                                    if (previous && !previous.lineBreak && previous.blockStatic) {
                                        current = (current.renderAs || current) as T;
                                        previous = (previous.renderAs || previous) as T;
                                        let marginTop = $util.convertFloat(current.cssInitial('marginTop', false, true));
                                        const marginBottom = $util.convertFloat(current.cssInitial('marginBottom', false, true));
                                        const previousMarginTop = $util.convertFloat(previous.cssInitial('marginTop', false, true));
                                        let previousMarginBottom = $util.convertFloat(previous.cssInitial('marginBottom', false, true));
                                        if (previous.excluded && !current.excluded) {
                                            const offset = Math.min(previousMarginTop, previousMarginBottom);
                                            if (offset < 0) {
                                                const top = Math.abs(offset) >= marginTop ? null : offset;
                                                current.modifyBox(BOX_STANDARD.MARGIN_TOP, top);
                                                if (current.companion) {
                                                    current.companion.modifyBox(BOX_STANDARD.MARGIN_TOP, top);
                                                }
                                                processed.add(previous);
                                            }
                                        }
                                        else if (!previous.excluded && current.excluded) {
                                            const offset = Math.min(marginTop, marginBottom);
                                            if (offset < 0) {
                                                previous.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, Math.abs(offset) >= previousMarginBottom ? null : offset);
                                                processed.add(current);
                                            }
                                        }
                                        else if (previousMarginBottom > 0 || marginTop > 0) {
                                            if (previousMarginBottom === 0 && previous.length) {
                                                const bottomChild = previous.lastChild;
                                                if (bottomChild && bottomChild.blockStatic) {
                                                    previousMarginBottom = $util.convertFloat(bottomChild.cssInitial('marginBottom', false, true));
                                                    previous = bottomChild as T;
                                                }
                                            }
                                            if (marginTop === 0 && current.length) {
                                                const topChild = current.firstChild;
                                                if (topChild && topChild.blockStatic) {
                                                    marginTop = $util.convertFloat(topChild.cssInitial('marginTop', false, true));
                                                    current = topChild as T;
                                                }
                                            }
                                            if (previousMarginBottom > 0 && marginTop > 0) {
                                                if (marginTop <= previousMarginBottom) {
                                                    current.modifyBox(BOX_STANDARD.MARGIN_TOP, null);
                                                    if (current.companion) {
                                                        current.companion.modifyBox(BOX_STANDARD.MARGIN_TOP, null);
                                                    }
                                                }
                                                else {
                                                    previous.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, null);
                                                    if (previous.companion) {
                                                        previous.companion.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, null);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                else if (node.innerChild) {
                    firstChild = node.innerChild.firstChild as T;
                    lastChild = node.innerChild.lastChild as T;
                }
                if (firstChild) {
                    applyMarginCollapse(node, firstChild, true);
                }
                if (lastChild) {
                    applyMarginCollapse(node, lastChild, false);
                }
            }
        }
        if (this.application.processing.node) {
            const elements = (<HTMLElement> this.application.processing.node.element).getElementsByTagName('BR');
            for (let i = 0; i < elements.length; i++) {
                const node = $dom.getElementAsNode<T>(elements[i]);
                if (node && !processed.has(node)) {
                    const actualParent = node.actualParent;
                    const previousSiblings = node.previousSiblings(true, true, true) as T[];
                    const nextSiblings = node.nextSiblings(true, true, true) as T[];
                    let valid = false;
                    if (previousSiblings.length && nextSiblings.length) {
                        if (nextSiblings[0].lineBreak) {
                            continue;
                        }
                        else {
                            const above = previousSiblings.pop() as T;
                            const below = nextSiblings.pop() as T;
                            if (above.inlineStatic && below.inlineStatic && previousSiblings.length === 0) {
                                processed.add(node);
                                continue;
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
                                if (previousStart.rendered) {
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
                                if (nextStart.rendered) {
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
                        processed.add(node);
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
        for (const node of this.application.processing.excluded) {
            if (!processed.has(node) && !node.lineBreak) {
                const below = node.nextSiblings(true, true, true).pop();
                if (below && below.visible) {
                    const previousSiblings = node.previousSiblings(false, false) as T[];
                    let offset = 0;
                    if (previousSiblings.length) {
                        const previous = previousSiblings.pop() as T;
                        offset = below.linear.top - previous.linear.bottom;
                    }
                    else {
                        offset = below.linear.top - node.linear.top;
                    }
                    if (offset > 0) {
                        below.modifyBox(BOX_STANDARD.MARGIN_TOP, offset);
                    }
                    processed.add(node);
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
                            if (offset !== 0) {
                                (node.renderAs || node).modifyBox(BOX_STANDARD.MARGIN_LEFT, offset);
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