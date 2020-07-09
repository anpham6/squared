import View from '../../view';

import { CONTAINER_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

const { measureTextWidth } = squared.lib.dom;

const { APP_SECTION, BOX_STANDARD, NODE_ALIGNMENT, NODE_RESOURCE, NODE_TEMPLATE } = squared.base.lib.enumeration;

const REGEXP_WORD = /(?:&#?[A-Za-z0-9]{2};[^\w]*|[^\w]|\b)*\w+?(?:'[A-Za-z]\s*|[^\w]*&#?[A-Za-z0-9]{2};|[^\w]+|\b)/g;

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
    else {
        node.hide();
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

const isUnstyled = (node: View) => node.baseline && node.contentBoxWidth === 0 && node.contentBoxHeight === 0 && !node.visibleStyle.background;
const isMultiline = (node: View): boolean => node.plainText || node.naturalChild && node.naturalElements.length === 0 && isUnstyled(node);

export default class Multiline<T extends View> extends squared.base.ExtensionUI<T> {
    public condition(node: T, parent: T) {
        if (!node.preserveWhiteSpace) {
            if (node.naturalElements.length === 0) {
                if (parent.layoutHorizontal && parent.layoutRelative) {
                    if (node.multiline && isMultiline(node)) {
                        return true;
                    }
                }
                else if (parent.layoutVertical && node.textElement && node.naturalElement && node.textIndent < 0) {
                    node.data(this.name, 'mainData', [node]);
                    return true;
                }
            }
            const length = node.length;
            if (length > 0) {
                const children = node.children as T[];
                const nodes: T[] = [];
                let textHeight = 0,
                    floatHeight = 0;
                let j = 0, k = 0, l = 0;
                for (let i = 0; i < length; ++i) {
                    const child = children[i];
                    if (!child.inlineFlow) {
                        return false;
                    }
                    else if (isTextElement(child) && !child.textEmpty && !(child.lineBreakLeading && (i === length - 1 || child.lineBreakTrailing))) {
                        if (isMultiline(child) && !child.preserveWhiteSpace) {
                            if (child.multiline) {
                                ++j;
                            }
                            else {
                                ++k;
                            }
                            textHeight += child.bounds.height;
                            nodes.push(child);
                        }
                        ++l;
                    }
                    else if (child.floating) {
                        floatHeight = Math.max(child.linear.height, floatHeight);
                    }
                }
                if (j > 1 || j > 0 && k === 0 && (l > 1 || floatHeight > 0 && textHeight > floatHeight) || j + k > 1 && (node.textBounds?.numberOfLines || 0) > 1) {
                    node.data(this.name, 'mainData', nodes);
                    return true;
                }
            }
        }
        return false;
    }

    public beforeParseDocument() {
        this.enabled = (this.application as android.base.Application<T>).userSettings.fontMeasureWrap === true;
    }

    public processNode(node: T, parent: T) {
        const nodes = node.data<T[]>(this.name, 'mainData');
        let fontAdjust = getFontMeasureAdjust(node);
        if (fontAdjust === Infinity) {
            return undefined;
        }
        const outerContainer = !!nodes && parent.layoutHorizontal && parent.layoutRelative && isUnstyled(node);
        const parentContainer = !nodes || outerContainer ? parent : node;
        const { children, sessionId } = parentContainer;
        let childIndex = outerContainer ? children.findIndex(item => item === node) : -1;
        if (outerContainer && childIndex === -1) {
            return undefined;
        }
        const afterAdd = this.application.getProcessingCache(sessionId).afterAdd!;
        if (isNaN(fontAdjust)) {
            fontAdjust = (this.application as android.base.Application<T>).userSettings.fontMeasureAdjust;
        }
        const breakable = nodes || [node];
        let modified = false;
        const length = breakable.length;
        for (let i = 0; i < length; ++i) {
            const seg = breakable[i];
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
            const q = words.length;
            if (q > 1 || outerContainer) {
                const { depth, textStyle, fontSize, lineHeight } = seg;
                const bounds = !seg.hasPX('width') && seg.textBounds || seg.bounds;
                const height = seg.bounds.height / (bounds.numberOfLines || 1);
                const items: Undef<T[]> = nodes ? new Array(q) : undefined;
                let previous!: T;
                for (let j = 0; j < q; ++j) {
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
                        if (seg !== node || !nodes) {
                            container.setCacheValue('marginLeft', seg.marginLeft);
                            container.siblingsLeading = seg.siblingsLeading;
                            container.lineBreakLeading = seg.lineBreakLeading;
                            container.textIndent = seg.textIndent;
                            seg.registerBox(BOX_STANDARD.MARGIN_TOP, container);
                            if (outerContainer && i === 0) {
                                container.modifyBox(BOX_STANDARD.MARGIN_LEFT, node.marginLeft);
                            }
                        }
                        else{
                            container.siblingsLeading = [];
                        }
                    }
                    else {
                        previous.siblingsTrailing = [container];
                        container.siblingsLeading = [previous];
                    }
                    if (j === q - 1) {
                        if (seg !== node || !nodes) {
                            container.setCacheValue('marginRight', seg.marginRight + (outerContainer ? node.marginRight : 0));
                            container.siblingsTrailing = seg.siblingsTrailing;
                            container.lineBreakTrailing = seg.lineBreakTrailing;
                            seg.registerBox(BOX_STANDARD.MARGIN_BOTTOM, container);
                            if (outerContainer && i === length - 1) {
                                container.modifyBox(BOX_STANDARD.MARGIN_RIGHT, node.marginRight);
                            }
                        }
                        else{
                            container.siblingsTrailing = [];
                        }
                    }
                    previous = container;
                }
                if (items) {
                    if (outerContainer) {
                        children.splice(childIndex, i === 0 ? 1 : 0, ...items);
                        childIndex += items.length;
                    }
                    else if (seg === node) {
                        node.each((item: T) => item.hide());
                        node.retainAs(items);
                    }
                    else {
                        const index = children.findIndex(item => item === seg);
                        if (index === -1) {
                            continue;
                        }
                        children.splice(index, 1, ...items);
                        seg.hide();
                    }
                }
                else {
                    setContentAltered(seg, false);
                }
                modified = true;
            }
        }
        if (modified) {
            setContentAltered(parentContainer, true);
            if (nodes) {
                if (outerContainer) {
                    node.hide();
                }
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