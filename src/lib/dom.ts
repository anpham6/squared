import { REGEXP_PATTERN, capitalize, convertCamelCase, convertPercent, convertPX, convertUnit, formatPercent, formatPX, hasBit, isPercent, isString, resolvePath, spliceArray, withinFraction } from './util';

type T = squared.base.Node;

const REGEXP_KEYFRAMERULE = /((?:\d+%\s*,?\s*)+|from|to)\s*{\s*(.+?)\s*}/;

export const enum USER_AGENT {
    CHROME = 2,
    SAFARI = 4,
    EDGE = 8,
    FIREFOX = 16
}

export const ELEMENT_BLOCK = [
    'ADDRESS',
    'ARTICLE',
    'ASIDE',
    'BLOCKQUOTE',
    'CANVAS',
    'DD',
    'DIV',
    'DL',
    'DT',
    'FIELDSET',
    'FIGCAPTION',
    'FIGURE',
    'FOOTER',
    'FORM',
    'H1',
    'H2',
    'H3',
    'H4',
    'H5',
    'H6',
    'HEADER',
    'LI',
    'MAIN',
    'NAV',
    'OL',
    'OUTPUT',
    'P',
    'PRE',
    'SECTION',
    'TFOOT',
    'TH',
    'THEAD',
    'TR',
    'UL',
    'VIDEO'
];

export const ELEMENT_INLINE = [
    'A',
    'ABBR',
    'ACRONYM',
    'B',
    'BDO',
    'BIG',
    'BR',
    'BUTTON',
    'CITE',
    'CODE',
    'DFN',
    'EM',
    'I',
    'IFRAME',
    'IMG',
    'INPUT',
    'KBD',
    'LABEL',
    'MAP',
    'OBJECT',
    'Q',
    'S',
    'SAMP',
    'SCRIPT',
    'SELECT',
    'SMALL',
    'SPAN',
    'STRIKE',
    'STRONG',
    'SUB',
    'SUP',
    'TEXTAREA',
    'TIME',
    'TT',
    'U',
    'VAR',
    'PLAINTEXT'
];

export function isUserAgent(value: string | number) {
    if (typeof value === 'string') {
        const name = value.toUpperCase();
        value = 0;
        if (name.indexOf('CHROME') !== -1) {
            value |= USER_AGENT.CHROME;
        }
        if (name.indexOf('SAFARI') !== -1) {
            value |= USER_AGENT.SAFARI;
        }
        if (name.indexOf('FIREFOX') !== -1) {
            value |= USER_AGENT.FIREFOX;
        }
        if (name.indexOf('EDGE') !== -1) {
            value |= USER_AGENT.EDGE;
        }
    }
    let client: number;
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf('Safari') !== -1 && userAgent.indexOf('Chrome') === -1) {
        client = USER_AGENT.SAFARI;
    }
    else if (userAgent.indexOf('Firefox') !== -1) {
        client = USER_AGENT.FIREFOX;
    }
    else if (userAgent.indexOf('Edge') !== -1) {
        client = USER_AGENT.EDGE;
    }
    else {
        client = USER_AGENT.CHROME;
    }
    return hasBit(value, client);
}

export function getDeviceDPI() {
    return window.devicePixelRatio * 96;
}

export function getKeyframeRules(): CSSRuleData {
    const result = new Map<string, ObjectMap<StringMap>>();
    violation: {
        for (let i = 0; i < document.styleSheets.length; i++) {
            const styleSheet = <CSSStyleSheet> document.styleSheets[i];
            if (styleSheet.cssRules) {
                for (let j = 0; j < styleSheet.cssRules.length; j++) {
                    try {
                        const item = <CSSKeyframesRule> styleSheet.cssRules[j];
                        if (item.type === 7) {
                            const map: ObjectMap<StringMap> = {};
                            for (let k = 0; k < item.cssRules.length; k++) {
                                const match = REGEXP_KEYFRAMERULE.exec(item.cssRules[k].cssText);
                                if (match) {
                                    for (let percent of (item.cssRules[k]['keyText'] as string || match[1].trim()).split(',')) {
                                        percent = percent.trim();
                                        switch (percent) {
                                            case 'from':
                                                percent = '0%';
                                                break;
                                            case 'to':
                                                percent = '100%';
                                                break;
                                        }
                                        map[percent] = {};
                                        for (const property of match[2].split(';')) {
                                            const [name, value] = property.split(':');
                                            if (value) {
                                                map[percent][name.trim()] = value.trim();
                                            }
                                        }
                                    }
                                }
                            }
                            result.set(item.name, map);
                        }
                    }
                    catch {
                        break violation;
                    }
                }
            }
        }
    }
    return result;
}

export function checkStyleAttribute(element: Element, attr: string, value: string, style?: CSSStyleDeclaration, fontSize?: number) {
    if (style === undefined) {
        style = getStyle(element);
    }
    if (value === 'inherit') {
        value = cssInheritStyle(element.parentElement, attr);
    }
    if (value !== 'initial') {
        if (value !== style[attr]) {
            switch (attr) {
                case 'backgroundColor':
                case 'borderTopColor':
                case 'borderRightColor':
                case 'borderBottomColor':
                case 'borderLeftColor':
                case 'color':
                case 'fontSize':
                case 'fontWeight':
                    return style[attr] || value;
                case 'width':
                case 'height':
                case 'minWidth':
                case 'maxWidth':
                case 'minHeight':
                case 'maxHeight':
                case 'lineHeight':
                case 'verticalAlign':
                case 'textIndent':
                case 'columnGap':
                case 'top':
                case 'right':
                case 'bottom':
                case 'left':
                case 'marginTop':
                case 'marginRight':
                case 'marginBottom':
                case 'marginLeft':
                case 'paddingTop':
                case 'paddingRight':
                case 'paddingBottom':
                case 'paddingLeft':
                    return /^[A-Za-z\-]+$/.test(value) || isPercent(value) ? value : convertPX(value, fontSize);
            }
        }
        return value;
    }
    return '';
}

export function getDataSet(element: Element | null, prefix: string) {
    const result: StringMap = {};
    if (hasComputedStyle(element)) {
        prefix = convertCamelCase(prefix, '\\.');
        for (const attr in element.dataset) {
            if (attr.length > prefix.length && attr.startsWith(prefix)) {
                result[capitalize(attr.substring(prefix.length), false)] = element.dataset[attr] as string;
            }
        }
    }
    return result;
}

export function newBoxRect(): BoxRect {
    return {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    };
}

export function newRectDimension(): RectDimension {
    return { width: 0, height: 0, ...newBoxRect() };
}

export function newBoxModel(): BoxModel {
    return {
        marginTop: 0,
        marginRight: 0,
        marginBottom: 0,
        marginLeft: 0,
        paddingTop: 0,
        paddingRight: 0,
        paddingBottom: 0,
        paddingLeft: 0
    };
}

export function getDOMRect(element: Element) {
    const result: Partial<DOMRect> = element.getBoundingClientRect();
    result.x = result.left;
    result.y = result.top;
    return <DOMRect> result;
}

export function createElement(parent: Element | null, block = false) {
    const element = document.createElement(block ? 'div' : 'span');
    const style = element.style;
    style.position = 'static';
    style.margin = '0px';
    style.padding = '0px';
    style.border = 'none';
    style.cssFloat = 'none';
    style.clear = 'none';
    style.display = 'none';
    element.className = '__css.placeholder';
    if (parent) {
        parent.appendChild(element);
    }
    return element;
}

export function removeElementsByClassName(className: string) {
    const elements = document.getElementsByClassName(className);
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (element.parentElement) {
            element.parentElement.removeChild(element);
        }
    }
}

export function getRangeClientRect(element: Element): TextDimension {
    const range = document.createRange();
    range.selectNodeContents(element);
    const clientRects = range.getClientRects();
    const domRect: ClientRect[] = [];
    for (let i = 0; i < clientRects.length; i++) {
        const item = <ClientRect> clientRects.item(i);
        if (!(Math.round(item.width) === 0 && withinFraction(item.left, item.right))) {
            domRect.push(item);
        }
    }
    let bounds: RectDimension = newRectDimension();
    let multiline = 0;
    if (domRect.length) {
        bounds = assignBounds(domRect[0]);
        const top = new Set([bounds.top]);
        const bottom = new Set([bounds.bottom]);
        let minTop = bounds.top;
        let maxBottom = bounds.bottom;
        for (let i = 1 ; i < domRect.length; i++) {
            const rect = domRect[i];
            top.add(Math.round(rect.top));
            bottom.add(Math.round(rect.bottom));
            minTop = Math.min(minTop, rect.top);
            maxBottom = Math.min(maxBottom, rect.bottom);
            bounds.width += rect.width;
            bounds.right = Math.max(rect.right, bounds.right);
            bounds.height = Math.max(rect.height, bounds.height);
        }
        if (top.size > 1 && bottom.size > 1) {
            bounds.top = minTop;
            bounds.bottom = maxBottom;
            if (domRect[domRect.length - 1].top >= domRect[0].bottom && element.textContent && (element.textContent.trim() !== '' || /^\s*\n/.test(element.textContent))) {
                multiline = domRect.length - 1;
            }
        }
    }
    return { ...bounds, multiline };
}

export function assignBounds(bounds: RectDimension | DOMRect): RectDimension {
    return {
        top: bounds.top,
        right: bounds.right,
        bottom: bounds.bottom,
        left: bounds.left,
        width: bounds.width,
        height: bounds.height
    };
}

export function getStyle(element: Element | null, cache = true): CSSStyleDeclaration {
    if (element) {
        if (cache) {
            const style = getElementCache(element, 'style');
            if (style) {
                return style;
            }
            else {
                const node = getElementAsNode<T>(element);
                if (node && node.plainText) {
                    return node.unsafe('styleMap') as CSSStyleDeclaration;
                }
            }
        }
        if (hasComputedStyle(element)) {
            const style = getComputedStyle(element);
            setElementCache(element, 'style', style);
            return style;
        }
        return <CSSStyleDeclaration> {};
    }
    return <CSSStyleDeclaration> { display: 'none' };
}

export function getFontSize(element: Element | null) {
    return parseInt(getStyle(element).fontSize || '16px');
}

export function resolveURL(value: string) {
    const match = value.match(REGEXP_PATTERN.URL);
    if (match) {
        return resolvePath(match[1]);
    }
    return '';
}

export function cssInheritStyle(element: Element | null, attr: string, exclude?: string[], tagNames?: string[]) {
    let value = '';
    if (element) {
        let current = element.parentElement;
        while (current && (tagNames === undefined || !tagNames.includes(current.tagName))) {
            value = getStyle(current)[attr] || '';
            if (value === 'inherit' || exclude && exclude.some(style => value.indexOf(style) !== -1)) {
                value = '';
            }
            if (value !== '' || current === document.body) {
                break;
            }
            current = current.parentElement;
        }
    }
    return value;
}

export function cssParent(element: Element | null, attr: string, ...styles: string[]) {
    if (element) {
        if (element.nodeName.charAt(0) !== '#') {
            if (styles.includes(getStyle(element)[attr])) {
                return true;
            }
        }
        if (element.parentElement) {
            return styles.includes(getStyle(element.parentElement)[attr]);
        }
    }
    return false;
}

export function cssFromParent(element: Element | null, attr: string) {
    if (hasComputedStyle(element) && element.parentElement) {
        const node = getElementAsNode<T>(element);
        const style = getStyle(element);
        if (node && style) {
            return style[attr] === getStyle(element.parentElement)[attr] && !node.cssInitial(attr);
        }
    }
    return false;
}

export function cssInline(element: Element, attr: string) {
    let value = '';
    if (typeof element['style'] === 'object') {
        value = element['style'][attr];
    }
    if (!value) {
        const styleMap = getElementCache(element, 'styleMap');
        if (styleMap) {
            value = styleMap[attr];
        }
    }
    return value || '';
}

export function cssAttribute(element: Element, attr: string, computed = false) {
    const node = getElementAsNode<T>(element);
    const name = convertCamelCase(attr);
    return node && node.cssInitial(name) || cssInline(element, name) || getNamedItem(element, attr) || computed && getStyle(element)[name] as string || '';
}

export function cssInheritAttribute(element: Element | null, attr: string) {
    let current: HTMLElement | Element | null = element;
    let value = '';
    while (current) {
        value = cssAttribute(current, attr);
        if (value !== '' && value !== 'inherit') {
            break;
        }
        current = current.parentElement;
    }
    return value;
}

export function getNamedItem(element: Element | null, attr: string) {
    if (element) {
        const item = element.attributes.getNamedItem(attr);
        if (item) {
            return item.value.trim();
        }
    }
    return '';
}

export function getBackgroundPosition(value: string, dimension: RectDimension, fontSize?: number, leftPerspective = false, percent = false) {
    const result: RectPosition = {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        horizontal: 'left',
        vertical: 'top',
        originalX: '',
        originalY: ''
    };
    const orientation = value === 'center' ? ['center', 'center'] : value.split(' ');
    if (orientation.length === 4) {
        for (let i = 0; i < orientation.length; i++) {
            const position = orientation[i];
            switch (i) {
                case 0:
                    result.horizontal = position;
                    break;
                case 2:
                    result.vertical = position;
                    break;
                case 1:
                case 3:
                    const location = percent ? convertPercent(position, i === 1 ? dimension.width : dimension.height, fontSize) : convertUnit(position, i === 1 ? dimension.width : dimension.height, fontSize);
                    if (i === 1) {
                        if (leftPerspective) {
                            if (result.horizontal === 'right') {
                                if (isPercent(position)) {
                                    result.originalX = formatPercent(100 - parseInt(position));
                                }
                                else {
                                    result.originalX = formatPX(dimension.width - parseInt(convertPX(position, fontSize)));
                                }
                                result.right = location;
                                result.left = percent ? 1 - location : dimension.width - location;
                            }
                            else {
                                result.left = location;
                                result.originalX = position;
                            }
                        }
                        else {
                            if (result.horizontal !== 'center') {
                                result[result.horizontal] = location;
                            }
                        }
                    }
                    else {
                        if (leftPerspective) {
                            if (result.vertical === 'bottom') {
                                if (isPercent(position)) {
                                    result.originalY = formatPercent(100 - parseInt(position));
                                }
                                else {
                                    result.originalY = formatPX(dimension.height - parseInt(convertPX(position, fontSize)));
                                }
                                result.bottom = location;
                                result.top = percent ? 1 - location : dimension.height - location;
                            }
                            else {
                                result.top = location;
                                result.originalY = position;
                            }
                        }
                        else {
                            if (result.vertical !== 'center') {
                                result[result.vertical] = location;
                            }
                        }
                    }
                    break;
            }
        }
    }
    else if (orientation.length === 2) {
        for (let i = 0; i < orientation.length; i++) {
            const position = orientation[i];
            let offsetParent: number;
            let direction: string;
            let original: string;
            if (i === 0) {
                offsetParent = dimension.width;
                direction = 'left';
                original = 'originalX';
            }
            else {
                offsetParent = dimension.height;
                direction = 'top';
                original = 'originalY';
            }
            const location = percent ? convertPercent(position, offsetParent, fontSize) : convertUnit(position, offsetParent, fontSize);
            if (isPercent(position)) {
                result[direction] = location;
                result[original] = position;
            }
            else {
                if (/^[a-z]+$/.test(position)) {
                    result[i === 0 ? 'horizontal' : 'vertical'] = position;
                    if (leftPerspective) {
                        switch (position) {
                            case 'left':
                            case 'top':
                                result[original] = '0%';
                                break;
                            case 'right':
                            case 'bottom':
                                result[direction] = percent ? 1 : offsetParent;
                                result[original] = '100%';
                                break;
                            case 'center':
                                result[direction] = percent ? 0.5 : Math.round(offsetParent / 2);
                                result[original] = '50%';
                                break;
                        }
                    }
                }
                else {
                    result[direction] = location;
                    result[original] = position;
                }
            }
        }
    }
    return result;
}

export function getFirstChildElement(element: Element | null, lineBreak = false) {
    if (element) {
        for (let i = 0; i < element.childNodes.length; i++) {
            const node = getElementAsNode<T>(<Element> element.childNodes[i]);
            if (node && (!node.excluded || (lineBreak && node.lineBreak))) {
                return node.element;
            }
        }
    }
    return null;
}

export function getLastChildElement(element: Element | null, lineBreak = false) {
    if (element) {
        for (let i = element.childNodes.length - 1; i >= 0; i--) {
            const node = getElementAsNode<T>(<Element> element.childNodes[i]);
            if (node && node.naturalElement && (!node.excluded || (lineBreak && node.lineBreak))) {
                return node.element;
            }
        }
    }
    return null;
}

export function hasFreeFormText(element: Element, whiteSpace = true) {
    function findFreeForm(elements: NodeListOf<ChildNode> | Element[]): boolean {
        for (let i = 0; i < elements.length; i++) {
            const child = <Element> elements[i];
            if (child.nodeName === '#text') {
                if (isPlainText(child, whiteSpace) || cssParent(child, 'whiteSpace', 'pre', 'pre-wrap') && child.textContent && child.textContent !== '') {
                    return true;
                }
            }
            else if (findFreeForm(child.childNodes)) {
                return true;
            }
        }
        return false;
    }
    return findFreeForm(element.nodeName === '#text' ? [element] : element.childNodes);
}

export function isPlainText(element: Element, whiteSpace = false) {
    if (element && element.nodeName === '#text' && element.textContent) {
        if (whiteSpace) {
            const value = element.textContent;
            for (let i = 0; i < value.length; i++) {
                switch (value.charCodeAt(i)) {
                    case 9:
                    case 10:
                    case 13:
                    case 32:
                        continue;
                    default:
                        return true;
                }
            }
            return false;
        }
        else {
            return element.textContent.trim() !== '';
        }
    }
    return false;
}

export function hasLineBreak(element: Element | null, lineBreak = false, trimString = false) {
    if (element) {
        let value = element.textContent || '';
        if (trimString) {
            value = value.trim();
        }
        if (element.children) {
            for (let i = 0; i < element.children.length; i++) {
                if (element.children[i].tagName === 'BR') {
                    return true;
                }
            }
        }
        else if (!lineBreak && /\n/.test(value)) {
            const node = getElementAsNode<T>(element);
            const whiteSpace = node ? node.css('whiteSpace') : (getStyle(element).whiteSpace || '');
            return ['pre', 'pre-wrap'].includes(whiteSpace) || element.nodeName === '#text' && cssParent(element, 'whiteSpace', 'pre', 'pre-wrap');
        }
    }
    return false;
}

export function isLineBreak(element: Element | null, excluded = true) {
    if (element) {
        const node = getElementAsNode<T>(element);
        if (node) {
            return node.tagName === 'BR' || excluded && node.excluded && node.blockStatic;
        }
    }
    return false;
}

export function getElementsBetween(elementStart: Element | null, elementEnd: Element, whiteSpace = false) {
    if (!elementStart || elementStart.parentElement === elementEnd.parentElement) {
        const parent = elementEnd.parentElement;
        if (parent) {
            let startIndex = elementStart ? -1 : 0;
            let endIndex = -1;
            const elements = <Element[]> Array.from(parent.childNodes);
            for (let i = 0; i < elements.length; i++) {
                if (elements[i] === elementStart) {
                    startIndex = i;
                }
                if (elements[i] === elementEnd) {
                    endIndex = i;
                }
            }
            if (startIndex !== -1 && endIndex !== -1 && startIndex !== endIndex) {
                const result = elements.slice(Math.min(startIndex, endIndex) + 1, Math.max(startIndex, endIndex));
                if (whiteSpace) {
                    spliceArray(result, element => element.nodeName === '#comment');
                }
                else {
                    spliceArray(result, element => element.nodeName.charAt(0) === '#' && !isPlainText(element));
                }
                return result;
            }
        }
    }
    return [];
}

export function getPreviousElementSibling(element: Element | null) {
    if (element) {
        element = <Element> element.previousSibling;
        while (element) {
            const node = getElementAsNode<T>(element);
            if (node && (!node.excluded || node.lineBreak)) {
                return node.element;
            }
            element = <Element> element.previousSibling;
        }
    }
    return null;
}

export function getNextElementSibling(element: Element | null) {
    if (element) {
        element = <Element> element.nextSibling;
        while (element) {
            const node = getElementAsNode<T>(element);
            if (node && (!node.excluded || node.lineBreak)) {
                return node.element;
            }
            element = <Element> element.nextSibling;
        }
    }
    return null;
}

export function hasComputedStyle(element: Element | null): element is HTMLElement {
    return !!element && typeof element['style'] === 'object';
}

export function hasVisibleRect(element: Element, checkViewport = false) {
    const bounds = element.getBoundingClientRect();
    return bounds.width !== 0 && bounds.height !== 0 && (!checkViewport || withinViewport(bounds));
}

export function withinViewport(bounds: ClientRect | DOMRect) {
    return !(bounds.left < 0 && bounds.top < 0 && Math.abs(bounds.left) >= bounds.width && Math.abs(bounds.top) >= bounds.height);
}

export function setElementCache(element: Element, attr: string, data: any) {
    element[`__${attr}`] = data;
}

export function getElementCache(element: Element, attr: string) {
    return element[`__${attr}`] || undefined;
}

export function deleteElementCache(element: Element, ...attrs: string[]) {
    for (const attr of attrs) {
        element[`__${attr}`] = undefined;
    }
}

export function getElementAsNode<T>(element: Element): T | undefined {
    return isString(element.className) && element.className.startsWith('squared') ? undefined : getElementCache(element, 'node');
}