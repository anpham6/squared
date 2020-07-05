import View from '../../view';

import { CONTAINER_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

const { measureTextWidth } = squared.lib.dom;

const { APP_SECTION, NODE_ALIGNMENT, NODE_RESOURCE, NODE_TEMPLATE } = squared.base.lib.enumeration;

const REGEXP_WORD = /(?:&#?[A-Za-z0-9]{2};|[^\w]|\b)*\w+?(?:'[A-Za-z]\s*|&#?[A-Za-z0-9]{2};|[^\w]+|\b)/g;

function getFontMeasureAdjust(node: View) {
    const value = node.dataset.androidFontMeasureAdjust;
    if (value === 'false') {
        return Infinity;
    }
    return value ? parseFloat(value) : NaN;
}

function setContentAltered(node: View, indexing: boolean) {
    if (indexing) {
        node.each((item: View, index: number) => item.containerIndex = index);
    }
    node.exclude({ resource: NODE_RESOURCE.VALUE_STRING });
    node.multiline = false;
    node.contentAltered = true;
}

function isTextElement(node: View) {
    if (!node.visible) {
        return false;
    }
    do {
        if (node.textElement) {
            return !(node.tagName === 'LABEL' && node.toElementString('htmlFor') !== '');
        }
        else if (node.length === 1) {
            node = node.children[0] as View;
        }
        else {
            return false;
        }
    }
    while (true);
}

const isMultiline = (node: View) => node.plainText || node.naturalChild && node.naturalElements.length === 0 && node.contentBoxWidth === 0 && node.contentBoxHeight === 0 && !node.visibleStyle.background && node.verticalAlign === '0px';

export default class Multiline<T extends View> extends squared.base.ExtensionUI<T> {
    public condition(node: T, parent: T) {
        if (!node.preserveWhiteSpace) {
            if (parent.layoutHorizontal) {
                if (node.multiline && parent.layoutRelative && isMultiline(node) && !node.floating) {
                    return true;
                }
            }
            else if (parent.layoutVertical || parent.length === 1) {
                const length = node.length;
                if (length > 0) {
                    const children = node.children as T[];
                    const nodes: T[] = [];
                    let j = 0, k = 0, l = 0;
                    for (let i = 0; i < length; ++i) {
                        const child = children[i];
                        if (!child.inlineFlow || i > 0 && child.lineBreakLeading || child.floating && nodes.length > 0) {
                            return false;
                        }
                        else if (isTextElement(child) && !child.textEmpty) {
                            if (isMultiline(child) && !child.preserveWhiteSpace) {
                                if (child.multiline) {
                                    ++j;
                                }
                                else {
                                    ++k;
                                }
                                nodes.push(child);
                            }
                            ++l;
                        }
                    }
                    if (j > 0 && k === 0 && l > 1 || j + k > 1 && (node.textBounds?.numberOfLines || 0) > 1) {
                        node.data(this.name, 'mainData', nodes);
                        return true;
                    }
                }
            }
        }
        return false;
    }

    public processNode(node: T, parent: T) {
        const nodes = node.data<T[]>(this.name, 'mainData');
        let fontAdjust = getFontMeasureAdjust(node);
        if (fontAdjust === Infinity) {
            return undefined;
        }
        const parentContainer = nodes ? node : parent;
        const { children, sessionId } = parentContainer;
        const afterAdd = this.application.getProcessingCache(sessionId).afterAdd!;
        if (isNaN(fontAdjust)) {
            fontAdjust = (this.application as android.base.Application<T>).userSettings.fontMeasureAdjust;
        }
        const breakable = nodes || [node];
        let modified = false;
        let i = 0;
        while (i < breakable.length) {
            const seg = breakable[i++];
            let adjustment = fontAdjust,
                textContent: string;
            if (seg.naturalElement) {
                textContent = this.resource!.removeExcludedFromText(seg, seg.element!);
                const value = getFontMeasureAdjust(seg);
                if (value === Infinity) {
                    continue;
                }
                else if (!isNaN(value)) {
                    adjustment = value;
                }
            }
            else {
                textContent = seg.textContent;
            }
            const words: string[] = [];
            let match: Null<RegExpMatchArray>;
            while (match = REGEXP_WORD.exec(textContent)) {
                words.push(match[0]);
            }
            REGEXP_WORD.lastIndex = 0;
            const length = words.length;
            if (length > 1) {
                const { depth, textStyle, fontSize, lineHeight } = seg;
                const bounds = !seg.hasPX('width') && seg.textBounds || seg.bounds;
                const height = seg.bounds.height / (bounds.numberOfLines || 1);
                const items: Undef<T[]> = nodes ? new Array(length) : undefined;
                let previous!: T;
                for (let j = 0; j < length; ++j) {
                    const value = words[j];
                    const container = this.application.createNode(sessionId, { parent: parentContainer });
                    container.init(parentContainer, depth);
                    container.naturalChild = false;
                    container.inlineText = true;
                    container.multiline = false;
                    container.renderExclude = false;
                    container.unsafe('element', seg.element);
                    container.setCacheValue('tagName', '#text');
                    container.setCacheValue('naturalElement', false);
                    container.setCacheValue('lineHeight', lineHeight);
                    container.cssApply({
                        position: 'static',
                        display: 'inline',
                        verticalAlign: 'baseline'
                    });
                    container.inheritApply('textStyle', textStyle);
                    container.exclude({ resource: NODE_RESOURCE.BOX_STYLE, section: APP_SECTION.DOM_TRAVERSE | APP_SECTION.EXTENSION });
                    const textBounds = {
                        ...bounds,
                        width: measureTextWidth(value, seg.css('fontFamily'), fontSize) + (value.length * adjustment),
                        height
                    };
                    container.textBounds = textBounds;
                    container.unsafe('bounds', textBounds);
                    container.textContent = value;
                    container.setControlType(CONTAINER_ANDROID.TEXT, CONTAINER_NODE.TEXT);
                    if (items) {
                        items[j] = container;
                    }
                    else {
                        container.render(parentContainer);
                        this.application.addLayoutTemplate(
                            parentContainer,
                            container,
                            {
                                type: NODE_TEMPLATE.XML,
                                node: container,
                                controlName: CONTAINER_ANDROID.TEXT
                            } as NodeXmlTemplate<T>
                        );
                    }
                    if (j === 0) {
                        container.setCacheValue('marginLeft', seg.marginLeft);
                        container.siblingsLeading = seg.siblingsLeading;
                        container.lineBreakLeading = seg.lineBreakLeading;
                    }
                    else {
                        previous.siblingsTrailing = [container];
                        container.siblingsLeading = [previous];
                    }
                    if (j === length - 1) {
                        container.setCacheValue('marginRight', seg.marginRight);
                        container.siblingsTrailing = seg.siblingsTrailing;
                        container.lineBreakTrailing = seg.lineBreakTrailing;
                    }
                    previous = container;
                }
                if (items) {
                    const index = children.findIndex(item => item === seg);
                    if (index === -1) {
                        continue;
                    }
                    children.splice(index, 1, ...items);
                }
                else {
                    setContentAltered(seg, false);
                }
                seg.hide();
                modified = true;
            }
        }
        if (modified) {
            setContentAltered(parentContainer, true);
            if (nodes) {
                parentContainer.setControlType(View.getControlName(CONTAINER_NODE.RELATIVE), CONTAINER_NODE.RELATIVE);
                parentContainer.alignmentType = NODE_ALIGNMENT.HORIZONTAL;
                afterAdd(parentContainer, true, true);
            }
            else {
                return { next: true };
            }
        }
        return undefined;
    }
}