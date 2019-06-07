import { parseColor } from './color';
import { CSS } from './constant';
import { USER_AGENT, getDeviceDPI, isUserAgent } from './client';
import { CSS as CSS_RX, STRING, UNIT, XML } from './regex';

import { getElementCache, setElementCache } from './session';
import { capitalize, convertAlpha, convertCamelCase, convertFloat, convertInt, convertRoman, fromLastIndexOf, isString, replaceMap, resolvePath } from './util';

const CACHE_PATTERN: ObjectMap<RegExp> = {};

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

const convertLength = (value: string, dimension: number, fontSize?: number) => isPercent(value) ? Math.round(dimension * (convertFloat(value) / 100)) : parseUnit(value, fontSize);

const convertPercent = (value: string, dimension: number, fontSize?: number) => isPercent(value) ? parseFloat(value) / 100 : parseUnit(value, fontSize) / dimension;

export type CSSKeyframesData = ObjectMap<StringMap>;

export interface CSSFontFaceData {
    fontFamily: string;
    fontWeight: number;
    fontStyle: string;
    srcFormat: string;
    srcUrl?: string;
    srcLocal?: string;
}

export const BOX_POSITION = [CSS.TOP, CSS.RIGHT, CSS.BOTTOM, CSS.LEFT];
export const BOX_MARGIN = ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'];
export const BOX_BORDER = [
    ['borderTopStyle', 'borderTopWidth', 'borderTopColor'],
    ['borderRightStyle', 'borderRightWidth', 'borderRightColor'],
    ['borderBottomStyle', 'borderBottomWidth', 'borderBottomColor'],
    ['borderLeftStyle', 'borderLeftWidth', 'borderLeftColor'],
    ['outlineStyle', 'outlineWidth', 'outlineColor']
];
export const BOX_PADDING = ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'];

export function getStyle(element: Element | null, target = '', cache = true): CSSStyleDeclaration {
    if (element) {
        const attr = 'style' + target;
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
    return <CSSStyleDeclaration> { display: CSS.NONE };
}

export function getFontSize(element: Element | null) {
    return parseFloat(getStyle(element).getPropertyValue('font-size')) || undefined;
}

export function hasComputedStyle(element: Element): element is HTMLElement {
    if (element.nodeName.charAt(0) !== '#') {
        return element instanceof HTMLElement || element instanceof SVGElement;
    }
    return false;
}

export function getSpecificity(value: string) {
    CSS_RX.SELECTOR_G.lastIndex = 0;
    let result = 0;
    let match: RegExpExecArray | null;
    while ((match = CSS_RX.SELECTOR_G.exec(value)) !== null) {
        let segment = match[1];
        if (segment.length === 1) {
            switch (segment.charAt(0)) {
                case '+':
                case '~':
                case '>':
                case '*':
                    continue;
            }
        }
        else if (segment.charAt(0) === '*') {
            segment = segment.substring(1);
        }
        CSS_RX.SELECTOR_PSEUDO_G.lastIndex = 0;
        CSS_RX.SELECTOR_ATTR_G.lastIndex = 0;
        CSS_RX.SELECTOR_LABEL_G.lastIndex = 0;
        let subMatch: RegExpExecArray | null;
        let original = segment;
        while ((subMatch = CSS_RX.SELECTOR_PSEUDO_G.exec(segment)) !== null) {
            if (subMatch[0].startsWith(':not(')) {
                if (subMatch[1]) {
                    result += getSpecificity(subMatch[1]);
                }
            }
            else {
                switch (match[2]) {
                    case ':scope':
                    case ':root':
                        break;
                    default:
                        result += 10;
                        break;
                }
            }
            original = original.replace(subMatch[0], '');
        }
        while ((subMatch = CSS_RX.SELECTOR_ATTR_G.exec(segment)) !== null) {
            if (subMatch[1]) {
                result += 1;
            }
            if (subMatch[3] || subMatch[4] || subMatch[5]) {
                result += 10;
            }
            original = original.replace(subMatch[0], '');
        }
        while ((subMatch = CSS_RX.SELECTOR_LABEL_G.exec(original)) !== null) {
            switch (subMatch[0].charAt(0)) {
                case '#':
                    result += 100;
                    break;
                case '.':
                    result += 10;
                    break;
                default:
                    result += 1;
                    break;
            }
        }
    }
    return result;
}

export function checkStyleValue(element: HTMLElement, attr: string, value: string, style?: CSSStyleDeclaration) {
    if (value === 'inherit') {
        value = getInheritedStyle(element, attr);
    }
    else if (isCustomProperty(value)) {
        if (style) {
            return style[attr];
        }
        else {
            const result = calculateVar(element, value, attr);
            return result !== undefined ? result.toString() : '';
        }
    }
    return value || '';
}

export function getDataSet(element: HTMLElement | SVGElement, prefix: string) {
    const result: StringMap = {};
    prefix = convertCamelCase(prefix, '.');
    for (const attr in element.dataset) {
        if (attr.startsWith(prefix)) {
            result[capitalize(attr.substring(prefix.length), false)] = element.dataset[attr] as string;
        }
    }
    return result;
}

export function getKeyframeRules(): ObjectMap<CSSKeyframesData> {
    const result: ObjectMap<CSSKeyframesData> = {};
    violation: {
        const styleSheets = document.styleSheets;
        const lengthA = styleSheets.length;
        for (let i = 0; i < lengthA; i++) {
            const styleSheet = <CSSStyleSheet> styleSheets[i];
            const cssRules = styleSheet.cssRules;
            if (cssRules) {
                const lengthB = cssRules.length;
                for (let j = 0; j < lengthB; j++) {
                    try {
                        const item = <CSSKeyframesRule> cssRules[j];
                        if (item.type === CSSRule.KEYFRAMES_RULE) {
                            const value = parseKeyframeRule(item.cssRules);
                            if (Object.keys(value).length) {
                                if (result[item.name]) {
                                    Object.assign(result[item.name], value);
                                }
                                else {
                                    result[item.name] = value;
                                }
                            }
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

export function parseKeyframeRule(rules: CSSRuleList) {
    if (CACHE_PATTERN.KEYFRAME === undefined) {
        CACHE_PATTERN.KEYFRAME = /((?:\d+%\s*,?\s*)+|from|to)\s*{\s*(.+?)\s*}/;
    }
    const result: CSSKeyframesData = {};
    const length = rules.length;
    for (let i = 0; i < length; i++) {
        const item = rules[i];
        const match = CACHE_PATTERN.KEYFRAME.exec(item.cssText);
        if (match) {
            for (let percent of (item['keyText'] || match[1].trim()).split(XML.SEPARATOR)) {
                percent = percent.trim();
                switch (percent) {
                    case 'from':
                        percent = CSS.PERCENT_0;
                        break;
                    case 'to':
                        percent = CSS.PERCENT_100;
                        break;
                }
                result[percent] = {};
                for (const property of match[2].split(';')) {
                    const [name, value] = property.split(':');
                    if (value) {
                        result[percent][name.trim()] = value.trim();
                    }
                }
            }
        }
    }
    return result;
}

export function validMediaRule(value: string, fontSize?: number) {
    switch (value) {
        case 'only all':
        case 'only screen':
            return true;
        default: {
            if (CACHE_PATTERN.MEDIA_RULE === undefined) {
                CACHE_PATTERN.MEDIA_RULE = /(?:(not|only)?\s*(?:all|screen) and )?((?:\([^)]+\)(?: and )?)+),?\s*/g;
                CACHE_PATTERN.MEDIA_CONDITION = /\(([a-z\-]+)\s*(:|<?=?|=?>?)?\s*([\w.%]+)?\)(?: and )?/g;
            }
            else {
                CACHE_PATTERN.MEDIA_RULE.lastIndex = 0;
            }
            let match: RegExpExecArray | null;
            while ((match = CACHE_PATTERN.MEDIA_RULE.exec(value)) !== null) {
                CACHE_PATTERN.MEDIA_CONDITION.lastIndex = 0;
                const negate = match[1] === 'not';
                let subMatch: RegExpExecArray | null;
                let valid = false;
                while ((subMatch = CACHE_PATTERN.MEDIA_CONDITION.exec(match[2])) !== null) {
                    const attr = subMatch[1];
                    let operation: string;
                    if (subMatch[1].startsWith('min')) {
                        operation = '>=';
                    }
                    else if (subMatch[1].startsWith('max')) {
                        operation = '<=';
                    }
                    else {
                        operation = match[2];
                    }
                    const rule = subMatch[3];
                    switch (attr) {
                        case 'aspect-ratio':
                        case 'min-aspect-ratio':
                        case 'max-aspect-ratio':
                            const [width, height] = replaceMap<string, number>(rule.split('/'), ratio => parseInt(ratio));
                            valid = compareRange(operation, window.innerWidth / window.innerHeight, width / height);
                            break;
                        case CSS.WIDTH:
                        case 'min-width':
                        case 'max-width':
                        case CSS.HEIGHT:
                        case 'min-height':
                        case 'max-height':
                            valid = compareRange(operation, attr.indexOf(CSS.WIDTH) !== -1 ? window.innerWidth : window.innerHeight, parseUnit(rule, fontSize));
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

export function isParentStyle(element: Element, attr: string, ...styles: string[]) {
    return element.nodeName.charAt(0) !== '#' && styles.includes(getStyle(element)[attr]) || element.parentElement && styles.includes(getStyle(element.parentElement)[attr]);
}

export function getInheritedStyle(element: Element, attr: string, exclude?: RegExp, ...tagNames: string[]) {
    let value = '';
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
    return value;
}

export function parseVar(element: HTMLElement | SVGElement, value: string) {
    const style = getStyle(element);
    let match: RegExpMatchArray | null;
    while ((match = CSS_RX.VAR.exec(value)) !== null) {
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
            const rect = (element instanceof SVGElement ? element : (element.parentElement || element)).getBoundingClientRect();
            attr = attr.toLowerCase();
            if (/^margin|padding|border/.test(attr)) {
                dimension = Math.max(rect.width, rect.height);
            }
            else {
                dimension = /top|bottom|height|vertical/.test(attr) || attr.length <= 2 && attr.indexOf('y') !== -1 ? rect.height : rect.width;
            }
        }
        return calculate(result, dimension, getFontSize(element));
    }
    return undefined;
}

export function getBackgroundPosition(value: string, dimension: Dimension, fontSize?: number) {
    const orientation = value === CSS.CENTER ? [CSS.CENTER, CSS.CENTER] : value.split(' ');
    const result: BoxRectPosition = {
        static: true,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        topAsPercent: 0,
        leftAsPercent: 0,
        rightAsPercent: 0,
        bottomAsPercent: 0,
        horizontal: CSS.LEFT,
        vertical: CSS.TOP,
        orientation
    };
    if (orientation.length === 2) {
        for (let i = 0; i < 2; i++) {
            const position = orientation[i];
            let direction: string;
            let offsetParent: number;
            if (i === 0) {
                direction = CSS.LEFT;
                offsetParent = dimension.width;
                result.horizontal = position;
            }
            else {
                direction = CSS.TOP;
                offsetParent = dimension.height;
                result.vertical = position;
            }
            const directionAsPercent = `${direction}AsPercent`;
            switch (position) {
                case CSS.START:
                    result.horizontal = CSS.LEFT;
                    break;
                case CSS.END:
                    result.horizontal = CSS.RIGHT;
                case CSS.RIGHT:
                case CSS.BOTTOM:
                    result[direction] = offsetParent;
                    result[directionAsPercent] = 1;
                    break;
                case CSS.CENTER:
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
        for (let i = 0; i < 4; i++) {
            const position = orientation[i];
            switch (i) {
                case 0:
                    result.horizontal = position;
                    break;
                case 1: {
                    const location = convertLength(position, dimension.width, fontSize);
                    const locationAsPercent = convertPercent(position, dimension.width, fontSize);
                    switch (result.horizontal) {
                        case CSS.END:
                            result.horizontal = CSS.RIGHT;
                        case CSS.RIGHT:
                            result.right = location;
                            result.left = dimension.width - location;
                            result.rightAsPercent = locationAsPercent;
                            result.leftAsPercent = 1 - locationAsPercent;
                            break;
                        case CSS.START:
                            result.horizontal = CSS.LEFT;
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
                    if (result.vertical === CSS.BOTTOM) {
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
    result.static = result.top === 0 && result.right === 0 && result.left === 0 && result.bottom === 0;
    return result;
}

export function getSrcSet(element: HTMLImageElement, mimeType?: string[]) {
    const parentElement = <HTMLPictureElement> element.parentElement;
    const result: ImageSrcSet[] = [];
    let srcset = element.srcset;
    let sizes = element.sizes;
    if (parentElement && parentElement.tagName === 'PICTURE') {
        const children = parentElement.children;
        const length = children.length;
        for (let i = 0; i < length; i++) {
            const source = <HTMLSourceElement> children[i];
            if (source.tagName === 'SOURCE' && isString(source.srcset) && (isString(source.media) && validMediaRule(source.media) || isString(source.type) && mimeType && mimeType.includes((source.type.split('/').pop() as string).toLowerCase()))) {
                srcset = source.srcset;
                sizes = source.sizes;
                break;
            }
        }
    }
    if (srcset !== '') {
        const filepath = element.src.substring(0, element.src.lastIndexOf('/') + 1);
        const pattern = /^(.*?)\s*(?:(\d*\.?\d*)([xw]))?$/;
        for (const src of srcset.split(XML.SEPARATOR)) {
            const match = pattern.exec(src.trim());
            if (match) {
                let width = 0;
                let pixelRatio = 0;
                switch (match[3]) {
                    case 'w':
                        width = parseFloat(match[2]);
                        break;
                    case 'x':
                        pixelRatio = parseFloat(match[2]);
                        break;
                    default:
                        pixelRatio = 1;
                        break;
                }
                result.push({
                    src: filepath + fromLastIndexOf(match[1], '/'),
                    pixelRatio,
                    width
                });
            }
        }
        result.sort((a, b) => {
            if (a.pixelRatio > 0 && b.pixelRatio > 0) {
                if (a.pixelRatio !== b.pixelRatio) {
                    return a.pixelRatio < b.pixelRatio ? -1 : 1;
                }
            }
            else if (a.width > 0 && b.width > 0) {
                if (a.width !== b.width) {
                    return a.width < b.width ? -1 : 1;
                }
            }
            return 0;
        });
    }
    if (result.length === 0) {
        result.push({ src: element.src, pixelRatio: 1, width: 0 });
    }
    else if (result.length > 1 && isString(sizes)) {
        const pattern = new RegExp(`\\s*(\\((?:max|min)-width: ${STRING.LENGTH}\\))?\\s*(.+)`);
        let width = 0;
        for (const value of sizes.split(XML.SEPARATOR)) {
            const match = pattern.exec(value.trim());
            if (match) {
                if (match[1] && !validMediaRule(match[1])) {
                    continue;
                }
                if (match[4]) {
                    const calcMatch = CSS_RX.CALC.exec(match[4]);
                    if (calcMatch) {
                        width = calculate(calcMatch[1]) || 0;
                    }
                    else {
                        width = parseUnit(match[4]);
                    }
                }
                if (width > 0) {
                    break;
                }
            }
        }
        if (width > 0) {
            const resolution = width * window.devicePixelRatio;
            let index = -1;
            const length = result.length;
            for (let i = 0; i < length; i++) {
                const imageWidth = result[i].width;
                if (imageWidth > 0 && imageWidth <= resolution && (index === -1 || result[index].width < imageWidth)) {
                    index = i;
                }
            }
            if (index > 0) {
                const selected = result.splice(index, 1)[0];
                selected.pixelRatio = 1;
                selected.actualWidth = width;
                result.unshift(selected);
            }
            else if (index === 0) {
                result[0].pixelRatio = 1;
                result[0].actualWidth = width;
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
    const match = CSS_RX.URL.exec(value);
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

export function convertAngle(value: string, unit = 'deg') {
    let angle = convertFloat(value);
    switch (unit) {
        case 'rad':
            angle *= 180 / Math.PI;
            break;
        case 'grad':
            angle /= 400;
        case 'turn':
            angle *= 360;
            break;
    }
    return angle;
}

export function convertPX(value: string, fontSize?: number) {
    if (value) {
        value = value.trim();
        if (value.endsWith('px') || value.endsWith('%') || value === CSS.AUTO) {
            return value;
        }
        return `${parseUnit(value, fontSize)}px`;
    }
    return CSS.PX_0;
}

export function calculate(value: string, dimension = 0, fontSize?: number) {
    value = value.trim();
    if (value.charAt(0) !== '(' || value.charAt(value.length - 1) !== ')') {
        value = `(${value})`;
    }
    const opening: boolean[] = [];
    const closing: number[] = [];
    let opened = 0;
    const length = value.length;
    for (let i = 0; i < length; i++) {
        switch (value.charAt(i)) {
            case '(':
                opened++;
                opening[i] = true;
                break;
            case ')':
                closing.push(i);
                break;
        }
    }
    if (opened === closing.length) {
        const symbol = /(\s+[+\-]\s+|\s*[*/]\s*)/;
        const placeholder = /{(\d+)}/;
        const equated: number[] = [];
        let index = 0;
        while (true) {
            for (let i = 0; i < closing.length; i++) {
                let j = closing[i] - 1;
                let valid = false;
                for ( ; j >= 0; j--) {
                    if (opening[j]) {
                        valid = true;
                        opening[j] = false;
                        break;
                    }
                    else if (closing.includes(j)) {
                        break;
                    }
                }
                if (valid) {
                    const seg: number[] = [];
                    const evaluate: string[] = [];
                    for (let partial of value.substring(j + 1, closing[i]).split(symbol)) {
                        partial = partial.trim();
                        switch (partial) {
                            case '+':
                            case '-':
                            case '*':
                            case '/':
                                evaluate.push(partial);
                                break;
                            default:
                                const match = placeholder.exec(partial);
                                if (match) {
                                    seg.push(equated[parseInt(match[1])]);
                                }
                                else if (isLength(partial)) {
                                    seg.push(parseUnit(partial, fontSize));
                                }
                                else if (isPercent(partial)) {
                                    seg.push(parseFloat(partial) / 100 * dimension);
                                }
                                else if (isAngle(partial)) {
                                    seg.push(parseAngle(partial));
                                }
                                else {
                                    return undefined;
                                }
                                break;
                        }
                    }
                    if (seg.length !== evaluate.length + 1) {
                        return undefined;
                    }
                    for (let k = 0; k < evaluate.length; k++) {
                        if (evaluate[k] === '/') {
                            if (Math.abs(seg[k + 1]) !== 0) {
                                seg.splice(k, 2, seg[k] / seg[k + 1]);
                                evaluate.splice(k--, 1);
                            }
                            else {
                                return undefined;
                            }
                        }
                    }
                    for (let k = 0; k < evaluate.length; k++) {
                        if (evaluate[k] === '*') {
                            seg.splice(k, 2, seg[k] * seg[k + 1]);
                            evaluate.splice(k--, 1);
                        }
                    }
                    for (let k = 0; k < evaluate.length; k++) {
                        seg.splice(k, 2, seg[k] + (evaluate[k] === '-' ? -seg[k + 1] : seg[k + 1]));
                        evaluate.splice(k--, 1);
                    }
                    if (seg.length === 1) {
                        if (closing.length === 1) {
                            return seg[0];
                        }
                        else {
                            equated[index] = seg[0];
                            const hash = `{${index++}}`;
                            const remaining = closing[i] + 1;
                            value = value.substring(0, j) + `${hash + ' '.repeat(remaining - (j + hash.length))}` + value.substring(remaining);
                            closing.splice(i--, 1);
                        }
                    }
                    else {
                        return undefined;
                    }
                }
            }
        }
    }
    return undefined;
}

export function parseUnit(value: string, fontSize?: number) {
    if (value) {
        const match = UNIT.LENGTH.exec(value);
        if (match) {
            let result = parseFloat(match[1]);
            switch (match[2]) {
                case 'px':
                    return result;
                case undefined:
                case 'em':
                case 'ch':
                    result *= fontSize || getFontSize(document.body) || 16;
                    break;
                case 'rem':
                    result *= getFontSize(document.body) || 16;
                    break;
                case 'pc':
                    result *= 12;
                case 'pt':
                    result *= 4 / 3;
                    break;
                case 'mm':
                    result /= 10;
                case 'cm':
                    result /= 2.54;
                case 'in':
                    result *= getDeviceDPI();
                    break;
                case 'vw':
                    result *= window.innerWidth / 100;
                    break;
                case 'vh':
                    result *= window.innerHeight / 100;
                    break;
                case 'vmin':
                    result *= Math.min(window.innerWidth, window.innerHeight) / 100;
                    break;
                case 'vmax':
                    result *= Math.max(window.innerWidth, window.innerHeight) / 100;
                    break;
            }
            return result;
        }
    }
    return 0;
}

export function parseAngle(value: string) {
    if (value) {
        const match = CSS_RX.ANGLE.exec(value);
        if (match) {
            return convertAngle(match[1], match[2]);
        }
    }
    return 0;
}

export function formatPX(value: number) {
    return `${Math.round(value) || 0}px`;
}

export function formatPercent(value: string | number, round = true) {
    if (typeof value === 'string') {
        value = parseFloat(value);
        if (isNaN(value)) {
            return CSS.PERCENT_0;
        }
    }
    value *= 100;
    return `${round ? Math.round(value) : value}%`;
}

export function isLength(value: string, percent = false) {
    return UNIT.LENGTH.test(value) || percent && isPercent(value);
}

export function isCalc(value: string) {
    return CSS_RX.CALC.test(value);
}

export function isCustomProperty(value: string) {
    return CSS_RX.CUSTOMPROPERTY.test(value);
}

export function isAngle(value: string) {
    return CSS_RX.ANGLE.test(value);
}

export function isPercent(value: string) {
    return UNIT.PERCENT.test(value);
}