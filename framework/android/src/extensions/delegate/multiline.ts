import View from '../../view';

import { isUnstyled } from '../../lib/util';

import { CONTAINER_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

type MultilineData<T> = [number, T][];

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
    if (!node.visible || node.textEmpty || node.contentAltered) {
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

const checkBreakable = (node: View, checkMargin?: boolean): boolean => node.plainText || node.naturalChild && node.naturalElements.length === 0 && !node.floating && node.innerAfter === undefined && node.innerBefore === undefined && isUnstyled(node, checkMargin);
const hasTextIndent = (node: View) => node.textElement && node.textIndent < 0 && node.naturalElement && !node.floating;

export default class Multiline<T extends View> extends squared.base.ExtensionUI<T> {
    public is(node: T) {
        return !node.preserveWhiteSpace;
    }

    public condition(node: T, parent: T) {
        if (node.naturalElements.length === 0) {
            if (parent.layoutHorizontal && parent.layoutRelative) {
                if ((node.multiline || node.textElement && (parent.contentAltered || node.previousSibling?.multiline || node.nextSibling?.multiline)) && checkBreakable(node)) {
                    return true;
                }
            }
            else if (parent.layoutVertical && hasTextIndent(node)) {
                node.data(this.name, 'mainData', [[1, node]]);
                return true;
            }
        }
        const length = node.length;
        if (length > 0) {
            const children = node.children as T[];
            if (node.has('columnWidth') || node.has('columnCount')) {
                const columnCount = node.toInt('columnCount', Infinity);
                const columnWidth = node.parseWidth(node.css('columnWidth'));
                const columnGap = node.parseWidth(node.css('columnGap'));
                const minCount = columnWidth > 0 ? Math.min(Math.floor(node.box.width / (columnWidth + columnGap)), columnCount) : columnCount;
                if (minCount !== Infinity) {
                    let remaining = minCount - node.length;
                    if (remaining > 0) {
                        const nodes: MultilineData<T> = [];
                        const breakable = children.filter((child: T) => isTextElement(child) && checkBreakable(child, false) && child.css('columnSpan') !== 'all').sort((a, b) => a.textContent.length >= b.textContent.length ? -1 : 1);
                        const q = breakable.length;
                        const maxCount = Math.ceil(q / remaining);
                        for (let i = 0; i < q; ++i) {
                            const item = breakable[i];
                            const range = document.createRange();
                            range.selectNodeContents(item.element!);
                            const clientRects = range.getClientRects();
                            let columns = -1,
                                previousLeft = -Infinity;
                            for (let j = 0, r = clientRects.length; j < r; ++j) {
                                const { left, right } = clientRects.item(j) as ClientRect;
                                if (Math.floor(left) >= previousLeft) {
                                    ++columns;
                                }
                                previousLeft = Math.ceil(right);
                            }
                            if (columns > maxCount) {
                                columns = maxCount;
                            }
                            if (columns > 0 && remaining - columns >= 0) {
                                nodes.push([columns + 1, item]);
                                remaining -= columns;
                                if (remaining === 0) {
                                    break;
                                }
                            }
                        }
                        if (nodes.length > 0) {
                            node.data(this.name, 'mainData', nodes);
                            return true;
                        }
                    }
                }
                return false;
            }
            const nodes: MultilineData<T> = [];
            let textHeight = 0,
                floatHeight = 0,
                leading: Undef<T>,
                valid: Undef<boolean>;
            let j = 0, k = 0, l = 0, m = 0, n = 0;
            for (let i = 0; i < length; ++i) {
                const child = children[i];
                if (!child.inlineFlow) {
                    if (i < length - 1) {
                        return false;
                    }
                }
                else if (child.floating) {
                    floatHeight = Math.max(child.linear.height, floatHeight);
                }
                else if (isTextElement(child) && !(child.lineBreakLeading && (i === length - 1 || child.lineBreakTrailing) || i === 0 && child.lineBreakTrailing)) {
                    if (checkBreakable(child) && !child.preserveWhiteSpace) {
                        if (valid === undefined) {
                            valid = !!node.firstLineStyle || node.textAlignLast !== '';
                        }
                        if (child.multiline) {
                            ++j;
                            nodes.push([1, child]);
                        }
                        else if (j + k++ > 0 || valid) {
                            nodes.push([1, child]);
                        }
                        else {
                            leading = child;
                        }
                        if (child.styleElement) {
                            ++m;
                        }
                        else {
                            ++n;
                        }
                        textHeight += child.bounds.height;
                    }
                    ++l;
                }
            }
            if (j > 0 && (k > 0 || l > 1 || valid || floatHeight > 0 && textHeight > floatHeight) || (k > 1 || m > 0 && n > 1) && (valid || (node.textBounds?.numberOfLines || 0) > 1)) {
                if (leading) {
                    nodes.unshift([1, leading]);
                }
                node.data(this.name, 'mainData', nodes);
                return true;
            }
        }
        else if (node.textElement && node.firstLineStyle || node.multiline && node.textAlignLast !== '') {
            node.data(this.name, 'mainData', [[NaN, node]]);
            return true;
        }
        return false;
    }

    public processNode(node: T, parent: T) {
        let fontAdjust = getFontMeasureAdjust(node);
        if (fontAdjust === Infinity) {
            return undefined;
        }
        const application = this.application as android.base.Application<T>;
        const mainData = node.data<MultilineData<T>>(this.name, 'mainData');
        const parentContainer = mainData ? node : parent;
        const { children, sessionId } = parentContainer;
        if (isNaN(fontAdjust)) {
            fontAdjust = application.userSettings.fontMeasureAdjust;
        }
        let modified: Undef<boolean>,
            partition: Undef<boolean>;
        const breakable = mainData || [[1, node]];
        for (let i = 0, length = breakable.length; i < length; ++i) {
            const [columns, seg] = breakable[i];
            const element = seg.element!;
            partition = columns > 1;
            let adjustment = fontAdjust,
                textContent: string,
                wrapperContainer: Undef<T[]>;
            if (seg.naturalElement) {
                textContent = this.resource!.removeExcludedFromText(seg, element);
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
            if (partition && words.length <= 1) {
                (wrapperContainer ?? (wrapperContainer = [])).push(seg);
            }
            else {
                const q = words.length;
                if (q > 1) {
                    const { textStyle, fontSize, lineHeight, naturalElement } = seg;
                    const depth = seg.depth + (seg === node ? 1 : 0);
                    const fontFamily = seg.css('fontFamily');
                    const bounds = !seg.hasPX('width') && seg.textBounds || seg.bounds;
                    const height = Math.floor(seg.bounds.height / (bounds.numberOfLines || 1));
                    const initialData: InitialData<T> = Object.freeze({ styleMap: { ...seg.unsafe<StringMap>('styleMap') } });
                    initialData.styleMap!.lineHeight = undefined;
                    const cssData: StringMap = {
                        position: 'static',
                        display: partition ? seg.display : 'inline',
                        verticalAlign: 'baseline'
                    };
                    const createContainer = (tagName: string, value: string) => {
                        const container = application.createNode(sessionId, { parent: parentContainer });
                        container.init(parentContainer, depth);
                        container.naturalChild = false;
                        container.inlineText = true;
                        container.renderExclude = false;
                        container.contentAltered = true;
                        container.textContent = value;
                        container.actualParent = parentContainer;
                        container.unsafe('element', element);
                        container.unsafe('initial', initialData);
                        container.setCacheValue('naturalElement', naturalElement && !isNaN(columns));
                        container.setCacheValue('tagName', tagName);
                        container.setCacheValue('fontSize', fontSize);
                        container.setCacheValue('lineHeight', lineHeight);
                        container.inheritApply('textStyle', textStyle);
                        container.cssApply(cssData);
                        const textBounds = {
                            ...bounds,
                            width: measureTextWidth(value, fontFamily, fontSize) + (value.length * adjustment),
                            height
                        };
                        container.textBounds = textBounds;
                        container.unsafe('bounds', textBounds);
                        container.setControlType(CONTAINER_ANDROID.TEXT, CONTAINER_NODE.TEXT);
                        container.exclude({ resource: NODE_RESOURCE.BOX_STYLE, section: APP_SECTION.DOM_TRAVERSE | APP_SECTION.EXTENSION });
                        return container;
                    };
                    let previous!: T;
                    if (partition) {
                        const { marginLeft, marginRight } = seg;
                        let r: number;
                        for (let j = 0, k = 0, l = q; j < columns; ++j, l -= r, k += r) {
                            r = j === columns - 1 ? l : Math.floor(q / columns);
                            const container = createContainer(seg.tagName, words.slice(k, k + r).join(''));
                            container.multiline = true;
                            if (j === 0) {
                                container.siblingsLeading = seg.siblingsLeading;
                                container.lineBreakLeading = seg.lineBreakLeading;
                                container.textIndent = seg.textIndent;
                                container.setCacheValue('marginTop', seg.marginTop);
                                seg.registerBox(BOX_STANDARD.MARGIN_TOP, container);
                            }
                            else {
                                previous.siblingsTrailing = [container];
                                container.siblingsLeading = [previous];
                            }
                            if (j === q - 1) {
                                container.siblingsTrailing = seg.siblingsTrailing;
                                container.lineBreakTrailing = seg.lineBreakTrailing;
                                container.setCacheValue('marginBottom', seg.marginBottom);
                                seg.registerBox(BOX_STANDARD.MARGIN_BOTTOM, container);
                            }
                            container.setCacheValue('marginLeft', marginLeft);
                            container.setCacheValue('marginRight', marginRight);
                            (wrapperContainer ?? (wrapperContainer = [])).push(container);
                            previous = container;
                        }
                    }
                    else {
                        const items: Undef<T[]> = mainData ? new Array(q) : undefined;
                        for (let j = 0; j < q; ++j) {
                            const container = createContainer('#text', words[j]);
                            if (items) {
                                items[j] = container;
                            }
                            else {
                                container.render(parentContainer);
                                application.addLayoutTemplate(
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
                                if (seg !== node || !mainData) {
                                    container.setCacheValue('marginLeft', seg.marginLeft);
                                    container.siblingsLeading = seg.siblingsLeading;
                                    container.lineBreakLeading = seg.lineBreakLeading;
                                    container.textIndent = seg.textIndent;
                                    seg.registerBox(BOX_STANDARD.MARGIN_TOP, container);
                                }
                                else {
                                    container.siblingsLeading = [];
                                }
                            }
                            else {
                                previous.siblingsTrailing = [container];
                                container.siblingsLeading = [previous];
                            }
                            if (j === q - 1) {
                                if (seg !== node || !mainData) {
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
            }
            if (wrapperContainer) {
                const index = children.findIndex(item => item === seg);
                if (index !== -1) {
                    children.splice(index, 1, ...wrapperContainer);
                    seg.hide();
                }
            }
        }
        if (modified) {
            setContentAltered(parentContainer, true);
            if (mainData) {
                if (!partition) {
                    parentContainer.setControlType(View.getControlName(CONTAINER_NODE.RELATIVE), CONTAINER_NODE.RELATIVE);
                    parentContainer.alignmentType = NODE_ALIGNMENT.HORIZONTAL;
                    if (hasTextIndent(node) || isNaN(breakable[0][0])) {
                        application.getProcessingCache(sessionId).afterAdd!(parentContainer, true, true);
                    }
                }
            }
            else {
                return { next: true };
            }
        }
        return undefined;
    }

    public beforeParseDocument() {
        this.enabled = (this.application as android.base.Application<T>).userSettings.fontMeasureWrap === true;
    }
}