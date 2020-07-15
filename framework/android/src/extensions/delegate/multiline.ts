import View from '../../view';

import { isUnstyled } from '../../lib/util';

import { CONTAINER_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

const { measureTextWidth } = squared.lib.dom;

const { APP_SECTION, BOX_STANDARD, NODE_ALIGNMENT, NODE_RESOURCE, NODE_TEMPLATE } = squared.base.lib.enumeration;

const REGEXP_WORD = /(?:[^\w\s\n]+[\s\n]+|(?:&#?[A-Za-z0-9]{2};[^\w]*|[^\w]+|\b)*\w+?(?:'[A-Za-z]\s*|[^\w]*&#?[A-Za-z0-9]{2};|[^\w]+|\b))/g;

function getFontMeasureAdjust(node: View) {
    const value = node.dataset.androidFontMeasureAdjust;
    if (value) {
        return value === 'false' ? Infinity : parseFloat(value);
    }
    return NaN;
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
    if (!node.visible || node.contentAltered) {
        return false;
    }
    else if (node.plainText) {
        return true;
    }
    const wrapperOf = node.wrapperOf;
    if (wrapperOf) {
        node = wrapperOf as View;
    }
    return node.textElement && !(node.tagName === 'LABEL' && node.toElementString('htmlFor') !== '');
}

const checkBreakable = (node: View): boolean => node.plainText || node.naturalChild && node.naturalElements.length === 0 && node.innerAfter === undefined && node.innerBefore === undefined && isUnstyled(node);

export const REGEXP_TRAILINGCHAR = /^[^\w\s\n]+[\s\n]+$/;

export default class Multiline<T extends View> extends squared.base.ExtensionUI<T> {
    public condition(node: T, parent: T) {
        if (!node.preserveWhiteSpace) {
            if (node.naturalElements.length === 0) {
                if (parent.layoutHorizontal && parent.layoutRelative) {
                    if ((node.multiline || parent.contentAltered) && checkBreakable(node)) {
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
                let j = 0, k = 0, l = 0, m = 0, n = 0;
                for (let i = 0; i < length; ++i) {
                    const child = children[i];
                    if (!child.inlineFlow) {
                        return false;
                    }
                    else if (isTextElement(child) && !child.textEmpty && !(child.lineBreakLeading && (i === length - 1 || child.lineBreakTrailing))) {
                        if (checkBreakable(child) && !child.preserveWhiteSpace) {
                            if (child.multiline) {
                                ++j;
                            }
                            else {
                                ++k;
                            }
                            textHeight += child.bounds.height;
                            if (child.styleElement) {
                                ++m;
                            }
                            else {
                                ++n;
                            }
                            nodes.push(child);
                        }
                        ++l;
                    }
                    else if (child.floating) {
                        floatHeight = Math.max(child.linear.height, floatHeight);
                    }
                }
                if (j > 0 && (k > 0 || l > 1 || floatHeight > 0 && textHeight > floatHeight) || (k > 1 || m > 0 && n > 1) && (node.textBounds?.numberOfLines || 0) > 1) {
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
        const parentContainer = nodes ? node : parent;
        const { children, sessionId } = parentContainer;
        if (isNaN(fontAdjust)) {
            fontAdjust = (this.application as android.base.Application<T>).userSettings.fontMeasureAdjust;
        }
        let modified = false;
        const breakable = nodes || [node];
        for (let i = 0, length = breakable.length; i < length; ++i) {
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
            if (q > 1) {
                const { element, depth, textStyle, fontSize, lineHeight } = seg;
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
                    container.contentAltered = true;
                    container.unsafe('element', element);
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
                    const measuredValue = REGEXP_TRAILINGCHAR.test(value) ? value.trim() + ' ' : value;
                    const textBounds = {
                        ...bounds,
                        width: measureTextWidth(measuredValue, seg.css('fontFamily'), fontSize) + (measuredValue.length * adjustment),
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
                            container.setCacheValue('marginRight', seg.marginRight);
                            container.siblingsTrailing = seg.siblingsTrailing;
                            container.lineBreakTrailing = seg.lineBreakTrailing;
                            seg.registerBox(BOX_STANDARD.MARGIN_BOTTOM, container);
                        }
                        else {
                            container.siblingsTrailing = [];
                        }
                    }
                    previous = container;
                }
                if (items) {
                    if (seg === node) {
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
                parentContainer.setControlType(View.getControlName(CONTAINER_NODE.RELATIVE), CONTAINER_NODE.RELATIVE);
                parentContainer.alignmentType = NODE_ALIGNMENT.HORIZONTAL;
                this.application.getProcessingCache(sessionId).afterAdd!(parentContainer, true, true);
            }
            else {
                return { next: true };
            }
        }
        return undefined;
    }
}