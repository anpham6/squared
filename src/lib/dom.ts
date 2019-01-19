import { REGEXP_PATTERN, capitalize, convertCamelCase, convertInt, convertPX, flatMap, formatPercent, formatPX, hasBit, isPercent, isString, maxArray, minArray, resolvePath, withinFraction } from './util';

type T = squared.base.Node;

export const enum USER_AGENT {
    NONE = 0,
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
    if (navigator.userAgent.indexOf('Edge') !== -1) {
        client = USER_AGENT.EDGE;
    }
    else if (navigator.userAgent.indexOf('Firefox') !== -1) {
        client = USER_AGENT.FIREFOX;
    }
    else if (navigator.userAgent.indexOf('Chrome') === -1 && navigator.userAgent.indexOf('Safari') !== -1) {
        client = USER_AGENT.SAFARI;
    }
    else {
        client = USER_AGENT.CHROME;
    }
    return hasBit(value, client);
}

export function getKeyframeRules(): CSSRuleData {
    const result = new Map<string, ObjectMap<StringMap>>();
    for (let i = 0; i < document.styleSheets.length; i++) {
        const styleSheet = <CSSStyleSheet> document.styleSheets[i];
        if (styleSheet.cssRules) {
            for (let j = 0; j < styleSheet.cssRules.length; j++) {
                const item = styleSheet.cssRules[j];
                try {
                    if (item instanceof CSSKeyframesRule) {
                        const map: ObjectMap<StringMap> = {};
                        Array.from(item.cssRules).forEach(keyframe => {
                            const match = /((?:\d+%\s*,?\s*)+|from|to)\s*{\s*(.*?)\s*}/.exec(keyframe.cssText);
                            if (match) {
                                const keyText = (keyframe['keyText'] as string || match[1].trim()).split(',').map(percent => percent.trim());
                                const properties = flatMap(match[2].split(';'), percent => percent.trim());
                                for (let percent of keyText) {
                                    switch (percent) {
                                        case 'from':
                                            percent = '0%';
                                            break;
                                        case 'to':
                                            percent = '100%';
                                            break;
                                    }
                                    map[percent] = {};
                                    for (const property of properties) {
                                        const [name, value] = property.split(':').map(values => values.trim());
                                        if (name !== '' && value !== '') {
                                            map[percent][name] = value;
                                        }
                                    }
                                }
                            }
                        });
                        result.set(item.name, map);
                    }
                }
                catch {
                }
            }
        }
    }
    return result;
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

export function newRectDimensions(): RectDimensions {
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
    Array.from(document.getElementsByClassName(className)).forEach(element => element.parentElement && element.parentElement.removeChild(element));
}

export function convertClientUnit(value: string, dimension: number, dpi: number, fontSize: number, percent = false) {
    if (percent) {
        return isPercent(value) ? convertInt(value) / 100 : (parseFloat(convertPX(value, dpi, fontSize)) / dimension);
    }
    else {
        return isPercent(value) ? Math.round(dimension * (convertInt(value) / 100)) : parseInt(convertPX(value, dpi, fontSize));
    }
}

export function getRangeClientRect(element: Element): TextDimensions {
    const range = document.createRange();
    range.selectNodeContents(element);
    const domRect = Array.from(range.getClientRects()).filter(item => !(Math.round(item.width) === 0 && withinFraction(item.left, item.right)));
    let bounds: RectDimensions = newRectDimensions();
    let multiline = 0;
    if (domRect.length) {
        bounds = assignBounds(domRect[0]);
        const top = new Set([bounds.top]);
        const bottom = new Set([bounds.bottom]);
        for (let i = 1 ; i < domRect.length; i++) {
            const rect = domRect[i];
            top.add(rect.top);
            bottom.add(rect.bottom);
            bounds.width += rect.width;
            bounds.right = Math.max(rect.right, bounds.right);
            bounds.height = Math.max(rect.height, bounds.height);
        }
        if (top.size > 1 && bottom.size > 1) {
            bounds.top = minArray(Array.from(top));
            bounds.bottom = maxArray(Array.from(bottom));
            if (domRect[domRect.length - 1].top >= domRect[0].bottom && element.textContent && (element.textContent.trim() !== '' || /^\s*\n/.test(element.textContent))) {
                multiline = domRect.length - 1;
            }
        }
    }
    return { ...bounds, multiline };
}

export function assignBounds(bounds: RectDimensions | DOMRect): RectDimensions {
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
                if (node) {
                    if (node.style) {
                        return node.style;
                    }
                    else if (node.plainText) {
                        return node.unsafe('styleMap') as CSSStyleDeclaration;
                    }
                }
            }
        }
        if (element.nodeName.charAt(0) !== '#') {
            const style = getComputedStyle(element);
            setElementCache(element, 'style', style);
            return style;
        }
    }
    return <CSSStyleDeclaration> { display: 'none' };
}

export function cssResolveUrl(value: string) {
    const match = value.match(REGEXP_PATTERN.CSS_URL);
    if (match) {
        return resolvePath(match[1]);
    }
    return '';
}

export function cssInherit(element: Element | null, attr: string, exclude?: string[], tagNames?: string[]) {
    let result = '';
    if (element) {
        let current = element.parentElement;
        while (current && (tagNames === undefined || !tagNames.includes(current.tagName))) {
            result = getStyle(current)[attr];
            if (result === 'inherit' || exclude && exclude.some(value => result.indexOf(value) !== -1)) {
                result = '';
            }
            if (current === document.body || result) {
                break;
            }
            current = current.parentElement;
        }
    }
    return result || '';
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

export function cssAttribute(element: Element, attr: string, computed = false) {
    const name = convertCamelCase(attr);
    const node = getElementAsNode<T>(element);
    let value = node && node.cssInitial(name) || cssInline(element, name);
    if (!value) {
        const attribute = element.attributes.getNamedItem(attr);
        if (attribute) {
            value = attribute.value.trim();
        }
    }
    return value || computed && getStyle(element)[name] as string || '';
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

export function getBackgroundPosition(value: string, dimension: RectDimensions, dpi: number, fontSize: number, leftPerspective = false, percent = false) {
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
        orientation.forEach((position, index) => {
            switch (index) {
                case 0:
                    result.horizontal = position;
                    break;
                case 2:
                    result.vertical = position;
                    break;
                case 1:
                case 3:
                    const clientXY = convertClientUnit(position, index === 1 ? dimension.width : dimension.height, dpi, fontSize, percent);
                    if (index === 1) {
                        if (leftPerspective) {
                            if (result.horizontal === 'right') {
                                if (isPercent(position)) {
                                    result.originalX = formatPercent(100 - parseInt(position));
                                }
                                else {
                                    result.originalX = formatPX(dimension.width - parseInt(convertPX(position, dpi, fontSize)));
                                }
                                result.right = clientXY;
                                result.left = percent ? 1 - clientXY : dimension.width - clientXY;
                            }
                            else {
                                result.left = clientXY;
                                result.originalX = position;
                            }
                        }
                        else {
                            if (result.horizontal !== 'center') {
                                result[result.horizontal] = clientXY;
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
                                    result.originalY = formatPX(dimension.height - parseInt(convertPX(position, dpi, fontSize)));
                                }
                                result.bottom = clientXY;
                                result.top = percent ? 1 - clientXY : dimension.height - clientXY;
                            }
                            else {
                                result.top = clientXY;
                                result.originalY = position;
                            }
                        }
                        else {
                            if (result.vertical !== 'center') {
                                result[result.vertical] = clientXY;
                            }
                        }
                    }
                    break;
            }
        });
    }
    else if (orientation.length === 2) {
        orientation.forEach((position, index) => {
            const offsetParent = index === 0 ? dimension.width : dimension.height;
            const direction = index === 0 ? 'left' : 'top';
            const original = index === 0 ? 'originalX' : 'originalY';
            const clientXY = convertClientUnit(position, offsetParent, dpi, fontSize, percent);
            if (isPercent(position)) {
                result[direction] = clientXY;
                result[original] = position;
            }
            else {
                if (/^[a-z]+$/.test(position)) {
                    result[index === 0 ? 'horizontal' : 'vertical'] = position;
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
                    result[direction] = clientXY;
                    result[original] = position;
                }
            }
        });
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
    function findFreeForm(elements: any[]): boolean {
        return elements.some((child: Element) => {
            if (child.nodeName === '#text') {
                if (isPlainText(child, whiteSpace) || cssParent(child, 'whiteSpace', 'pre', 'pre-wrap') && child.textContent && child.textContent !== '') {
                    return true;
                }
            }
            else if (findFreeForm(Array.from(child.childNodes))) {
                return true;
            }
            return false;
        });
    }
    if (element.nodeName === '#text') {
        return findFreeForm([element]);
    }
    else {
        return findFreeForm(Array.from(element.childNodes));
    }
}

export function isPlainText(element: Element, whiteSpace = false) {
    if (element && element.nodeName === '#text' && element.textContent) {
        if (whiteSpace) {
            const value = element.textContent;
            let valid = false;
            for (let i = 0; i < value.length; i++) {
                switch (value.charCodeAt(i)) {
                    case 9:
                    case 10:
                    case 13:
                    case 32:
                        continue;
                    default:
                        valid = true;
                        break;
                }
            }
            return valid && value !== '';
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
        if (element.children.length && Array.from(element.children).some(item => item.tagName === 'BR')) {
            return true;
        }
        else if (!lineBreak && /\n/.test(value)) {
            const node = getElementAsNode<T>(element);
            const whiteSpace = node ? node.css('whiteSpace') : (getStyle(element).whiteSpace || '');
            return ['pre', 'pre-wrap'].includes(whiteSpace) || element.nodeName === '#text' && cssParent(element, 'whiteSpace', 'pre', 'pre-wrap');
        }
    }
    return false;
}

export function isLineBreak(element: Element, excluded = true) {
    const node = getElementAsNode<T>(element);
    if (node) {
        return node.tagName === 'BR' || excluded && node.excluded && node.blockStatic;
    }
    return false;
}

export function getElementsBetween(elementStart: Element | null, elementEnd: Element, whiteSpace = false, asNode = false) {
    if (!elementStart || elementStart.parentElement === elementEnd.parentElement) {
        const parent = elementEnd.parentElement;
        if (parent) {
            const elements = Array.from(parent.childNodes) as Element[];
            const indexStart = elementStart ? elements.findIndex(element => element === elementStart) : 0;
            const indexEnd = elements.findIndex(element => element === elementEnd);
            if (indexStart !== -1 && indexEnd !== -1 && indexStart !== indexEnd) {
                let result = elements.slice(Math.min(indexStart, indexEnd) + 1, Math.max(indexStart, indexEnd));
                if (whiteSpace) {
                    result = result.filter(element => element.nodeName !== '#comment');
                }
                else {
                    result = result.filter(element => {
                        if (element.nodeName.charAt(0) === '#') {
                            return isPlainText(element);
                        }
                        return true;
                    });
                }
                if (asNode) {
                    result = result.filter(element => getElementAsNode<T>(element));
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

export function hasComputedStyle(element: UndefNull<Element>): element is HTMLElement {
    return !!element && typeof element['style'] === 'object';
}

export function withinViewportOrigin(element: Element) {
    const bounds = element.getBoundingClientRect();
    if (bounds.width !== 0 && bounds.height !== 0) {
        return !(bounds.left < 0 && bounds.top < 0 && Math.abs(bounds.left) >= bounds.width && Math.abs(bounds.top) >= bounds.height);
    }
    return false;
}

export function setElementCache(element: Element, attr: string, data: any) {
    element[`__${attr}`] = data;
}

export function getElementCache(element: Element, attr: string) {
    return element[`__${attr}`] || undefined;
}

export function deleteElementCache(element: Element, ...attrs: string[]) {
    for (const attr of attrs) {
        delete element[`__${attr}`];
    }
}

export function getElementAsNode<T>(element: Element): T | undefined {
    return isString(element.className) && element.className.startsWith('squared') ? undefined : getElementCache(element, 'node');
}