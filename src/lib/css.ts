import { getElementAsNode, getElementCache, setElementCache } from './dom';
import { REGEXP_COMPILED, STRING_PATTERN, calculate, capitalize, convertCamelCase, convertPX, convertLength, convertPercent, isLength, resolvePath } from './util';

type T = squared.base.Node;

export const BOX_POSITION = ['top', 'right', 'bottom', 'left'];
export const BOX_MARGIN = ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'];
export const BOX_PADDING = ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'];

export function getKeyframeRules(): CSSRuleData {
    const keyFrameRule = /((?:\d+%\s*,?\s*)+|from|to)\s*{\s*(.+?)\s*}/;
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
                                const match = keyFrameRule.exec(item.cssRules[k].cssText);
                                if (match) {
                                    for (let percent of (item.cssRules[k]['keyText'] || match[1].trim()).split(REGEXP_COMPILED.SEPARATOR)) {
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
        return typeof element['style'] === 'object' && element['style'] !== null && element['style']['display'] !== null;
    }
    return false;
}

export function checkStyleValue(element: Element, attr: string, value: string, style?: CSSStyleDeclaration, fontSize?: number) {
    if (style === undefined) {
        style = getStyle(element);
    }
    if (value === 'inherit') {
        value = getInheritedStyle(element, attr);
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
                    return isLength(value) ? convertPX(value, fontSize) : value;
            }
        }
        return value;
    }
    return '';
}

export function getDataSet(element: HTMLElement | null, prefix: string) {
    const result: StringMap = {};
    if (element) {
        prefix = convertCamelCase(prefix, '.');
        for (const attr in element.dataset) {
            if (attr.startsWith(prefix)) {
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
        return element.nodeName.charAt(0) !== '#' && styles.includes(getStyle(element)[attr]) || element.parentElement && styles.includes(getStyle(element.parentElement)[attr]);
    }
    return false;
}

export function getInheritedStyle(element: Element | null, attr: string, exclude?: RegExp, ...tagNames: string[]) {
    let value = '';
    if (element) {
        let current = element.parentElement;
        while (current && !tagNames.includes(current.tagName)) {
            value = getStyle(current, false)[attr] || '';
            if (value === 'inherit' || exclude && exclude.test(value)) {
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
        if (node && !node.cssInitial(attr)) {
            return getStyle(element)[attr] === getStyle(element.parentElement)[attr];
        }
    }
    return false;
}

export function getInlineStyle(element: Element, attr: string) {
    let value: string = hasComputedStyle(element) ? element.style[attr] : '';
    if (!value) {
        const styleMap: StringMap = getElementCache(element, 'styleMap');
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

export function calculateVar(element: HTMLElement | SVGElement, value: string, attr?: string, dimension?: number) {
    const style = getComputedStyle(element);
    const pattern = new RegExp(`${STRING_PATTERN.VAR}`, 'g');
    let match: RegExpMatchArray | null;
    let result = value;
    while ((match = pattern.exec(value)) !== null) {
        const propertyValue = style.getPropertyValue(match[1]).trim();
        if (propertyValue !== '') {
            result = result.replace(match[0], propertyValue);
        }
        else {
            return undefined;
        }
    }
    if (attr && !dimension) {
        const vertical = /(top|bottom|height)/.test(attr.toLowerCase());
        if (element instanceof SVGElement) {
            const rect = element.getBoundingClientRect();
            dimension = vertical || attr.length <= 2 && attr.indexOf('y') !== -1 ? rect.height : rect.width;
        }
        else {
            const rect = (element.parentElement || element).getBoundingClientRect();
            dimension = vertical ? rect.height : rect.width;
        }
    }
    return calculate(result, dimension, getFontSize(element));
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

export function getBackgroundPosition(value: string, dimension: Dimension, fontSize?: number) {
    const result: RectPosition = {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        topAsPercent: 0,
        leftAsPercent: 0,
        rightAsPercent: 0,
        bottomAsPercent: 0,
        horizontal: 'left',
        vertical: 'top'
    };
    const orientation = value === 'center' ? ['center', 'center'] : value.split(' ');
    if (orientation.length === 2) {
        for (let i = 0; i < orientation.length; i++) {
            const position = orientation[i];
            let direction: string;
            let offsetParent: number;
            if (i === 0) {
                direction = 'left';
                offsetParent = dimension.width;
                result.horizontal = position;
            }
            else {
                direction = 'top';
                offsetParent = dimension.height;
                result.vertical = position;
            }
            const directionAsPercent = `${direction}AsPercent`;
            switch (position) {
                case 'start':
                    result.horizontal = 'left';
                    break;
                case 'end':
                    result.horizontal = 'right';
                case 'right':
                case 'bottom':
                    result[direction] = offsetParent;
                    result[directionAsPercent] = 1;
                    break;
                case 'center':
                    result[direction] = offsetParent / 2;
                    result[directionAsPercent] = 0.5;
                    break;
                default:
                    result[direction] = convertLength(position, offsetParent, fontSize);
                    result[directionAsPercent] = convertPercent(position, offsetParent, fontSize);
                    break;
            }
        }
    }
    else if (orientation.length === 4) {
        for (let i = 0; i < orientation.length; i++) {
            const position = orientation[i];
            switch (i) {
                case 0:
                    result.horizontal = position;
                    break;
                case 1: {
                    const location = convertLength(position, dimension.width, fontSize);
                    const locationAsPercent = convertPercent(position, dimension.width, fontSize);
                    switch (result.horizontal) {
                        case 'end:':
                            result.horizontal = 'right';
                        case 'right':
                            result.right = location;
                            result.left = dimension.width - location;
                            result.rightAsPercent = locationAsPercent;
                            result.leftAsPercent = 1 - locationAsPercent;
                            break;
                        case 'start':
                            result.horizontal = 'left';
                        default:
                            result.left = location;
                            result.leftAsPercent = locationAsPercent;
                            break;
                    }
                    break;
                }
                case 2:
                    result.vertical = position;
                    break;
                case 3: {
                    const location = convertLength(position, dimension.height, fontSize);
                    const locationAsPercent = convertPercent(position, dimension.height, fontSize);
                    if (result.vertical === 'bottom') {
                        result.bottom = location;
                        result.top = dimension.height - location;
                        result.bottomAsPercent = locationAsPercent;
                        result.topAsPercent = 1 - locationAsPercent;
                    }
                    else {
                        result.top = location;
                        result.topAsPercent = locationAsPercent;
                    }
                    break;
                }
            }
        }
    }
    return result;
}

export function resolveURL(value: string) {
    const match = value.match(REGEXP_COMPILED.URL);
    return match ? resolvePath(match[1]) : '';
}