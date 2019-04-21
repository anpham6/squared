import { parseColor } from './color';
import { getElementCache, setElementCache } from './session';
import { REGEXP_COMPILED, STRING_PATTERN, USER_AGENT, calculate, capitalize, convertAlpha, convertInt, convertRoman, convertCamelCase, convertPX, convertLength, convertPercent, getDeviceDPI, isCustomProperty, isLength, isNumber, isPercent, isUserAgent, parseUnit, replaceMap, resolvePath } from './util';

export const BOX_POSITION = ['top', 'right', 'bottom', 'left'];
export const BOX_MARGIN = ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'];
export const BOX_PADDING = ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'];

export function getStyle(element: Element | null, target?: string, cache = true): CSSStyleDeclaration {
    if (element) {
        const attr = 'style' + (target ? '::' + target : '');
        if (cache) {
            const style = getElementCache(element, attr, '0');
            if (style) {
                return style;
            }
        }
        if (hasComputedStyle(element)) {
            const style = getComputedStyle(element, target);
            setElementCache(element, attr, '0', style);
            return style;
        }
        return <CSSStyleDeclaration> { display: 'inline' };
    }
    return <CSSStyleDeclaration> { display: 'none' };
}

export function hasComputedStyle(element: Element | null): element is HTMLElement {
    return !!element && typeof element['style'] === 'object' && typeof element['style']['display'] === 'string';
}

export function getSpecificity(value: string) {
    const pattern = new RegExp(STRING_PATTERN.SELECTOR, 'g');
    let result = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(value.trim())) !== null) {
        if (match[0]) {
            if (match[1]) {
                let check = true;
                switch (match[1].charAt(0)) {
                    case '*':
                    case '>':
                    case '+':
                    case '~':
                        continue;
                    case ':':
                    case '[':
                        check = false;
                        break;
                    case '#':
                        result += 100;
                        break;
                    case '.':
                        result += 10;
                        match[1] = match[1].substring(1);
                        break;
                    default:
                        if (match[1].indexOf('#') > 0) {
                            result += 100;
                        }
                        result += 1;
                        break;
                }
                if (check) {
                    result += (match[1].split('.').length - 1) * 10;
                }
            }
            if (match[2]) {
                if (match[2].startsWith(':not(')) {
                    if (match[3]) {
                        result += getSpecificity(match[3]);
                    }
                }
                else {
                    switch (match[2]) {
                        case ':root':
                        case ':global':
                        case ':local':
                            break;
                        default:
                            result += 10;
                            break;
                    }
                }
            }
            if (match[4]) {
                result += 1;
            }
            if (match[5]) {
                result += 10;
            }
        }
        else {
            break;
        }
    }
    return result;
}

export function checkStyleValue(element: Element, attr: string, value: string, style: CSSStyleDeclaration, specificity = 0, fontSize?: number) {
    if (value && value !== 'initial') {
        if (value === 'inherit') {
            value = getInheritedStyle(element, attr);
        }
        const computed = style[attr];
        if (value !== computed && value !== 'auto') {
            const numeric = isNumber(value);
            if (computed) {
                let valid = false;
                switch (attr) {
                    case 'fontSize':
                    case 'fontWeight':
                    case 'color':
                    case 'backgroundColor':
                    case 'borderTopColor':
                    case 'borderRightColor':
                    case 'borderBottomColor':
                    case 'borderLeftColor':
                        valid = true;
                        break;
                    default:
                        if (isPercent(value)) {
                            switch (attr) {
                                case 'width':
                                case 'minWidth':
                                case 'maxWidth':
                                case 'height':
                                case 'minHeight':
                                case 'maxHeight':
                                case 'columnWidth':
                                    break;
                                default:
                                    valid = true;
                                    break;
                            }
                        }
                        break;
                }
                if (valid || numeric || isCustomProperty(value)) {
                    setElementCache(element, attr, specificity.toString(), value);
                    return computed;
                }
            }
            switch (attr) {
                case 'borderTopWidth':
                case 'borderRightWidth':
                case 'borderBottomWidth':
                case 'borderLeftWidth':
                    switch (value) {
                        case 'thin':
                            value = '1px';
                            break;
                        case 'medium':
                            value = '2px';
                            break;
                        case 'thick':
                            value = '3px';
                            break;
                    }
                    break;
            }
            if (numeric) {
                setElementCache(element, attr, specificity.toString(), value);
            }
            else if (isLength(value)) {
                setElementCache(element, attr, specificity.toString(), value);
                return convertPX(value, fontSize);
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

export function getKeyframeRules(): CSSRuleData {
    const pattern = /((?:\d+%\s*,?\s*)+|from|to)\s*{\s*(.+?)\s*}/;
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
                                const match = pattern.exec(item.cssRules[k].cssText);
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

export function parseConditionText(rule: string, value: string) {
    const match = new RegExp(`^@${rule}([^{]+)`).exec(value);
    if (match) {
        value = match[1].trim();
    }
    return value;
}

export function validMediaRule(value: string) {
    switch (value) {
        case 'only all':
        case 'only screen':
            return true;
        default: {
            function compareRange(operation: string, unit: number, range: number) {
                switch (operation) {
                    case '<=':
                        return unit <= range;
                    case '<':
                        return unit < range;
                    case '>=':
                        return unit >= range;
                    case '>':
                        return unit > range;
                    default:
                        return unit === range;
                }
            }
            const pattern = /(?:(not|only)?\s*(?:all|screen) and )?((?:\([^)]+\)(?: and )?)+),?\s*/g;
            const fontSize = parseUnit(getStyle(document.body).getPropertyValue('font-size'));
            let match: RegExpExecArray | null;
            while ((match = pattern.exec(value)) !== null) {
                const negate = match[1] === 'not';
                const patternCondition = /\(([a-z\-]+)\s*(:|<?=?|=?>?)?\s*([\w.%]+)?\)(?: and )?/g;
                let condition: RegExpExecArray | null;
                let valid = false;
                while ((condition = patternCondition.exec(match[2])) !== null) {
                    const attr = condition[1];
                    let operation: string;
                    if (condition[1].startsWith('min')) {
                        operation = '>=';
                    }
                    else if (condition[1].startsWith('max')) {
                        operation = '<=';
                    }
                    else {
                        operation = match[2];
                    }
                    const rule = condition[3];
                    switch (attr) {
                        case 'aspect-ratio':
                        case 'min-aspect-ratio':
                        case 'max-aspect-ratio':
                            const [width, height] = replaceMap<string, number>(rule.split('/'), ratio => parseInt(ratio));
                            valid = compareRange(operation, window.innerWidth / window.innerHeight, width / height);
                            break;
                        case 'width':
                        case 'min-width':
                        case 'max-width':
                        case 'height':
                        case 'min-height':
                        case 'max-height':
                            valid = compareRange(operation, attr.indexOf('width') !== -1 ? window.innerWidth : window.innerHeight, parseUnit(rule, fontSize));
                            break;
                        case 'orientation':
                            valid = rule === 'portrait' && window.innerWidth <= window.innerHeight || rule === 'landscape' && window.innerWidth > window.innerHeight;
                            break;
                        case 'resolution':
                        case 'min-resolution':
                        case 'max-resolution':
                            let resolution = parseFloat(rule);
                            if (rule.endsWith('dpcm')) {
                                resolution *= 2.54;
                            }
                            else if (rule.endsWith('dppx') || rule.endsWith('x')) {
                                resolution *= 96;
                            }
                            valid = compareRange(operation, getDeviceDPI(), resolution);
                            break;
                        case 'grid':
                            valid = rule === '0';
                            break;
                        case 'color':
                            valid = rule === undefined || convertInt(rule) > 0;
                            break;
                        case 'min-color':
                            valid = convertInt(rule) <= screen.colorDepth / 3;
                            break;
                        case 'max-color':
                            valid = convertInt(rule) >= screen.colorDepth / 3;
                            break;
                        case 'color-index':
                        case 'min-color-index':
                        case 'monochrome':
                        case 'min-monochrome':
                            valid = rule === '0';
                            break;
                        case 'max-color-index':
                        case 'max-monochrome':
                            valid = convertInt(rule) >= 0;
                            break;
                        default:
                            valid = false;
                            break;
                    }
                    if (!valid) {
                        break;
                    }
                }
                if (!negate && valid || negate && !valid) {
                    return true;
                }
            }
        }
    }
    return false;
}

export function getFontSize(element: Element | null) {
    return parseFloat(getStyle(element).getPropertyValue('font-size')) || undefined;
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
            value = getStyle(current)[attr];
            if (value === 'inherit' || exclude && exclude.test(value)) {
                value = '';
            }
            if (value || current === document.body) {
                break;
            }
            current = current.parentElement;
        }
    }
    return value;
}

export function parseVar(element: HTMLElement | SVGElement, value: string) {
    const style = getStyle(element);
    let match: RegExpMatchArray | null;
    while ((match = new RegExp(`${STRING_PATTERN.VAR}`).exec(value)) !== null) {
        let propertyValue = style.getPropertyValue(match[1]).trim();
        if (match[2] && (isLength(match[2], true) && !isLength(propertyValue, true) || parseColor(match[2]) !== undefined && parseColor(propertyValue) === undefined)) {
            propertyValue = match[2];
        }
        if (propertyValue !== '') {
            value = value.replace(match[0], propertyValue);
        }
        else {
            return undefined;
        }
    }
    return value;
}

export function calculateVar(element: HTMLElement | SVGElement, value: string, attr?: string, dimension?: number) {
    const result = parseVar(element, value);
    if (result) {
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
    return undefined;
}

export function getBackgroundPosition(value: string, dimension: Dimension, fontSize?: number) {
    const orientation = value === 'center' ? ['center', 'center'] : value.split(' ');
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
        vertical: 'top',
        orientation
    };
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

export function convertListStyle(name: string, value: number, valueAsDefault = false) {
    switch (name) {
        case 'decimal':
            return value.toString();
        case 'decimal-leading-zero':
            return (value < 9 ? '0' : '') + value.toString();
        case 'upper-alpha':
        case 'upper-latin':
            if (value >= 1) {
                return convertAlpha(value - 1);
            }
            break;
        case 'lower-alpha':
        case 'lower-latin':
            if (value >= 1) {
                return convertAlpha(value - 1).toLowerCase();
            }
            break;
        case 'upper-roman':
            return convertRoman(value);
        case 'lower-roman':
            return convertRoman(value).toLowerCase();
    }
    return valueAsDefault ? value.toString() : '';
}

export function resolveURL(value: string) {
    const match = REGEXP_COMPILED.URL.exec(value);
    return match ? resolvePath(match[1]) : '';
}

export function insertStyleSheetRule(value: string, index = 0) {
    const style = document.createElement('style');
    if (isUserAgent(USER_AGENT.SAFARI)) {
        style.appendChild(document.createTextNode(''));
    }
    document.head.appendChild(style);
    const sheet = style.sheet;
    if (sheet && typeof sheet['insertRule'] === 'function') {
        try {
            (sheet as any).insertRule(value, index);
        }
        catch {
            return null;
        }
    }
    return style;
}