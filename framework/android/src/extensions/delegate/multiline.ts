import BOX_STANDARD = squared.base.lib.constant.BOX_STANDARD;
import NODE_ALIGNMENT = squared.base.lib.constant.NODE_ALIGNMENT;
import NODE_TEMPLATE = squared.base.lib.constant.NODE_TEMPLATE;

import { CONTAINER_NODE, CONTAINER_TAGNAME } from '../../lib/constant';

import View from '../../view';

import { concatString } from '../../lib/util';

type MultilineData<T> = [number, T][];

const { APP_SECTION, NODE_RESOURCE } = squared.base.lib.constant;

const { getTextMetrics } = squared.lib.dom;

const REGEXP_WORD = /(?:[^\w\s]+\s+|(?:&#?[A-Za-z0-9]{2};[^\w]*|[^\w]+|\b)*\w+?(?:'[A-Za-z]\s*|[^\w]*&#?[A-Za-z0-9]{2};|[^\w]+|\b))/g;

function getFontMeasureAdjust(node: View) {
    const value = node.dataset.androidFontMeasureAdjust;
    return value === 'false' ? Infinity : value ? +value : NaN;
}

function setContentAltered(node: View, visible: boolean) {
    if (!visible) {
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
    return node.textElement && !(node.tagName === 'LABEL' && node.toElementString('htmlFor'));
}

const checkBreakable = (node: View, checkMargin?: boolean) => node.plainText || node.naturalChild && node.naturalElements.length === 0 && !node.floating && !node.innerAfter && !node.innerBefore && node.isUnstyled(checkMargin);
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
                this.data.set(node, [[1, node]] as MultilineData<T>);
                return true;
            }
        }
        const length = node.size();
        if (length) {
            const children = node.children as T[];
            if (node.has('columnWidth') || node.has('columnCount')) {
                const columnCount = node.toInt('columnCount', Infinity);
                const columnWidth = node.parseUnit(node.valueAt('columnWidth'));
                const columnGap = node.parseUnit(node.valueAt('columnGap'));
                const minCount = columnWidth ? Math.min(Math.floor(node.box.width / (columnWidth + columnGap)), columnCount) : columnCount;
                if (minCount !== Infinity) {
                    let remaining = minCount - length;
                    if (remaining > 0) {
                        const nodes: MultilineData<T> = [];
                        const breakable = children.filter((child: T) => isTextElement(child) && checkBreakable(child, false) && child.valueAt('columnSpan') !== 'all').sort((a, b) => b.textContent.length - a.textContent.length);
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
                        if (nodes.length) {
                            this.data.set(node, nodes);
                            return true;
                        }
                    }
                }
                return false;
            }
            const nodes: MultilineData<T> = [];
            const checkWidth = node.blockStatic && !node.hasPX('width', { percent: false }) && node.tagName !== 'LEGEND';
            let textWidth = 0,
                textHeight = 0,
                floatHeight = 0,
                leading: Undef<T>,
                valid: Undef<boolean>,
                j = 0, k = 0, l = 0, m = 0, n = 0;
            for (let i = 0; i < length; ++i) {
                const child = children[i];
                if (!child.inlineFlow) {
                    if (i < length - 1) {
                        return false;
                    }
                }
                else {
                    if (child.floating) {
                        floatHeight = Math.max(child.linear.height, floatHeight);
                    }
                    else if (isTextElement(child) && !(child.lineBreakLeading && (i === length - 1 || child.lineBreakTrailing) || i === 0 && child.lineBreakTrailing)) {
                        if (checkBreakable(child) && !child.preserveWhiteSpace) {
                            if (valid === undefined) {
                                valid = !!(node.firstLineStyle || node.textAlignLast);
                            }
                            if (child.multiline) {
                                ++j;
                                nodes.push([1, child]);
                            }
                            else if (j + k++ || valid) {
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
                    if (checkWidth) {
                        textWidth += child.textWidth;
                    }
                }
            }
            if (j > 0 && (k > 0 || l > 1 || valid || floatHeight && textHeight > floatHeight) || checkWidth && j + k > 1 && Math.floor(textWidth) > Math.ceil(node.actualBoxWidth()) || (k > 1 || m && n > 1) && (valid || node.textBounds?.numberOfLines as number > 1)) {
                if (leading) {
                    nodes.unshift([1, leading]);
                }
                this.data.set(node, nodes);
                return true;
            }
        }
        else if (node.textElement && node.firstLineStyle || node.multiline && node.textAlignLast) {
            this.data.set(node, [[NaN, node]] as MultilineData<T>);
            return true;
        }
        return false;
    }

    public processNode(node: T, parent: T): Void<ExtensionResult<T>> {
        let fontAdjust = getFontMeasureAdjust(node);
        if (fontAdjust === Infinity) {
            return;
        }
        const application = this.application as android.base.Application<T>;
        if (isNaN(fontAdjust)) {
            fontAdjust = application.userSettings.fontMeasureAdjust;
        }
        const mainData = this.data.get(node) as MultilineData<T>;
        const parentContainer = mainData ? node : parent;
        const { children, sessionId } = parentContainer;
        const breakable = mainData || [[1, node]];
        let modified: Undef<boolean>,
            partition: Undef<boolean>;
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
                (wrapperContainer ||= []).push(seg);
            }
            else {
                const q = words.length;
                if (q > 1) {
                    const { fontSize, lineHeight, naturalElement, elementData } = seg;
                    const depth = seg.depth + (seg === node ? 1 : 0);
                    const fontFamily = seg.textStyle.fontFamily!;
                    const styleMap: StringMap = { ...seg.unsafe<StringMap>('styleMap') };
                    if ('lineHeight' in styleMap) {
                        delete styleMap.lineHeight;
                    }
                    const initialData: InitialData<T> = Object.freeze({ styleMap });
                    const cssData: StringMap = {
                        position: 'static',
                        display: partition ? seg.display : 'inline',
                        verticalAlign: 'baseline',
                        ...seg.textStyle
                    };
                    const bounds = !seg.hasPX('width') && seg.textBounds || seg.bounds;
                    const boxRect: Partial<BoxRectDimension> = {
                        top: bounds.top,
                        right: bounds.right,
                        bottom: bounds.bottom,
                        left: bounds.left,
                        height: Math.floor(seg.bounds.height / (bounds.numberOfLines || 1))
                    };
                    const createContainer = (tagName: string, value: string) => {
                        const container = application.createNode(sessionId, { parent: parentContainer });
                        container.init(parentContainer, depth);
                        container.inlineText = true;
                        container.renderExclude = false;
                        container.contentAltered = true;
                        container.textContent = value;
                        container.actualParent = parentContainer;
                        container.unsafe('element', element);
                        container.unsafe('initial', initialData);
                        container.unsafe('elementData', elementData);
                        container.unsafe('preferInitial', false);
                        container.setCacheState('naturalChild', false);
                        container.setCacheState('naturalElement', naturalElement && !isNaN(columns));
                        container.setCacheState('htmlElement', naturalElement);
                        container.setCacheState('styleElement', naturalElement);
                        container.setCacheValue('tagName', tagName);
                        container.setCacheValue('fontSize', fontSize);
                        container.setCacheValue('lineHeight', lineHeight);
                        container.cssApply(cssData);
                        const metrics = getTextMetrics(value, fontSize, fontFamily);
                        const textBounds = { ...boxRect, width: (metrics ? metrics.width : 0) + (value.length * adjustment) } as BoxRectDimension;
                        container.textBounds = textBounds;
                        container.unsafe('bounds', textBounds);
                        container.setControlType(CONTAINER_TAGNAME.TEXT, CONTAINER_NODE.TEXT);
                        container.exclude({ resource: NODE_RESOURCE.BOX_STYLE, section: APP_SECTION.DOM_TRAVERSE | APP_SECTION.EXTENSION });
                        return container;
                    };
                    let previous!: T;
                    if (partition) {
                        const { marginLeft, marginRight } = seg;
                        for (let j = 0, k = 0, l = q, r: number; j < columns; ++j, l -= r, k += r) {
                            r = j === columns - 1 ? l : Math.floor(q / columns);
                            const container = createContainer(seg.tagName, concatString(words.slice(k, k + r)));
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
                            (wrapperContainer ||= []).push(container);
                            previous = container;
                        }
                    }
                    else {
                        const items: Null<T[]> = mainData ? new Array(q) : null;
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
                                        controlName: CONTAINER_TAGNAME.TEXT
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
    }

    public beforeParseDocument() {
        this.enabled = (this.application as android.base.Application<T>).userSettings.fontMeasureWrap;
    }
}