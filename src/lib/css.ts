import { getElementAsNode, getElementCache, setElementCache } from './dom';
import { REGEXP_COMPILED, calculateUnit, capitalize, convertCamelCase, convertPX, convertUnit, formatPercent, formatPX, isPercent, isUnit, resolvePath } from './util';

type T = squared.base.Node;

const REGEXP_KEYFRAMERULE = /((?:\d+%\s*,?\s*)+|from|to)\s*{\s*(.+?)\s*}/;

function convertPercent(value: string, dimension: number, fontSize?: number) {
    return isPercent(value) ? parseFloat(value) / 100 : calculateUnit(value, fontSize) / dimension;
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
                                    for (let percent of (item.cssRules[k]['keyText'] as string || match[1].trim()).split(REGEXP_COMPILED.SEPARATOR)) {
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

export function hasComputedStyle(element: Element | null): element is HTMLElement {
    if (element) {
        return typeof element['style'] === 'object' && element['style'] !== null;
    }
    return false;
}

export function checkStyleValue(element: Element, attr: string, value: string, style?: CSSStyleDeclaration, fontSize?: number) {
    if (style === undefined) {
        style = getStyle(element);
    }
    if (value === 'inherit') {
        value = getInheritedStyle(element.parentElement, attr);
    }
    if (value && value !== 'initial') {
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
                    return style[attr];
            }
            if (REGEXP_COMPILED.CUSTOMPROPERTY.test(value)) {
                return style[attr];
            }
            switch (attr) {
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
                    return isUnit(value) ? convertPX(value, fontSize) : value;
            }
        }
        return value;
    }
    return '';
}

export function getDataSet(element: HTMLElement | null, prefix: string) {
    const result: StringMap = {};
    if (element) {
        prefix = convertCamelCase(prefix, '\\.');
        for (const attr in element.dataset) {
            if (attr.length > prefix.length && attr.startsWith(prefix)) {
                result[capitalize(attr.substring(prefix.length), false)] = element.dataset[attr] as string;
            }
        }
    }
    return result;
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

export function isParentStyle(element: Element | null, attr: string, ...styles: string[]) {
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

export function getInheritedStyle(element: Element | null, attr: string, exclude?: string[], tagNames?: string[]) {
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

export function isInheritedStyle(element: Element | null, attr: string) {
    if (hasComputedStyle(element) && element.parentElement) {
        const node = getElementAsNode<T>(element);
        const style = getStyle(element);
        if (node && style) {
            return style[attr] === getStyle(element.parentElement)[attr] && !node.cssInitial(attr);
        }
    }
    return false;
}

export function getInlineStyle(element: Element, attr: string) {
    let value = '';
    if (hasComputedStyle(element)) {
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

export function getAttribute(element: Element, attr: string, computed = false) {
    const node = getElementAsNode<T>(element);
    const name = convertCamelCase(attr);
    return node && node.cssInitial(name) || getInlineStyle(element, name) || getNamedItem(element, attr) || computed && getStyle(element)[name] as string || '';
}

export function getParentAttribute(element: Element | null, attr: string) {
    let current: HTMLElement | Element | null = element;
    let value = '';
    while (current) {
        value = getAttribute(current, attr);
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

export function getBackgroundPosition(value: string, dimension: Dimension, fontSize?: number, percent = false) {
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
                else {
                    result[direction] = location;
                    result[original] = position;
                }
            }
        }
    }
    return result;
}

export function resolveURL(value: string) {
    const match = value.match(REGEXP_COMPILED.URL);
    if (match) {
        return resolvePath(match[1]);
    }
    return '';
}