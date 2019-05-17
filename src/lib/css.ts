import { parseColor } from './color';
import { USER_AGENT, getDeviceDPI, isUserAgent } from './client';
import { CSS, STRING, UNIT, XML } from './regex';
import { getElementCache, setElementCache } from './session';
import { capitalize, convertAlpha, convertCamelCase, convertFloat, convertInt, convertRoman, fromLastIndexOf, isNumber, isString, replaceMap, resolvePath } from './util';

const REGEXP_KEYFRAME = /((?:\d+%\s*,?\s*)+|from|to)\s*{\s*(.+?)\s*}/;

function convertLength(value: string, dimension: number, fontSize?: number) {
    return isPercent(value) ? Math.round(dimension * (convertFloat(value) / 100)) : parseUnit(value, fontSize);
}

function convertPercent(value: string, dimension: number, fontSize?: number) {
    return isPercent(value) ? parseFloat(value) / 100 : parseUnit(value, fontSize) / dimension;
}

export type CSSKeyframesData = ObjectMap<StringMap>;

export interface CSSFontFaceData {
    fontFamily: string;
    fontWeight: number;
    fontStyle: string;
    srcFormat: string;
    srcUrl?: string;
    srcLocal?: string;
}

export const BOX_POSITION = ['top', 'right', 'bottom', 'left'];
export const BOX_MARGIN = ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'];
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
    return <CSSStyleDeclaration> { display: 'none' };
}

export function hasComputedStyle(element: Element | null): element is HTMLElement {
    return !!element && typeof element['style'] === 'object' && typeof element['style']['display'] === 'string';
}

export function getSpecificity(value: string) {
    const pattern = new RegExp(STRING.CSS_SELECTOR, 'g');
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
                    case 'borderTopWidth':
                    case 'borderRightWidth':
                    case 'borderBottomWidth':
                    case 'borderLeftWidth':
                        switch (value) {
                            case 'thin':
                            case 'medium':
                            case 'thick':
                                valid = true;
                                break;
                        }
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
                                case 'offsetDistance':
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

export function getKeyframeRules(): ObjectMap<CSSKeyframesData> {
    const result: ObjectMap<CSSKeyframesData> = {};
    violation: {
        for (let i = 0; i < document.styleSheets.length; i++) {
            const styleSheet = <CSSStyleSheet> document.styleSheets[i];
            if (styleSheet.cssRules) {
                for (let j = 0; j < styleSheet.cssRules.length; j++) {
                    try {
                        const item = <CSSKeyframesRule> styleSheet.cssRules[j];
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
    const result: CSSKeyframesData = {};
    for (let k = 0; k < rules.length; k++) {
        const match = REGEXP_KEYFRAME.exec(rules[k].cssText);
        if (match) {
            for (let percent of (rules[k]['keyText'] || match[1].trim()).split(XML.SEPARATOR)) {
                percent = percent.trim();
                switch (percent) {
                    case 'from':
                        percent = '0%';
                        break;
                    case 'to':
                        percent = '100%';
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
            if (!fontSize) {
                fontSize = getFontSize(document.body);
            }
            const pattern = /(?:(not|only)?\s*(?:all|screen) and )?((?:\([^)]+\)(?: and )?)+),?\s*/g;
            let match: RegExpExecArray | null;
            while ((match = pattern.exec(value)) !== null) {
                const negate = match[1] === 'not';
                const conditionPattern = /\(([a-z\-]+)\s*(:|<?=?|=?>?)?\s*([\w.%]+)?\)(?: and )?/g;
                let conditionMatch: RegExpExecArray | null;
                let valid = false;
                while ((conditionMatch = conditionPattern.exec(match[2])) !== null) {
                    const attr = conditionMatch[1];
                    let operation: string;
                    if (conditionMatch[1].startsWith('min')) {
                        operation = '>=';
                    }
                    else if (conditionMatch[1].startsWith('max')) {
                        operation = '<=';
                    }
                    else {
                        operation = match[2];
                    }
                    const rule = conditionMatch[3];
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
    while ((match = new RegExp(STRING.CSS_VAR).exec(value)) !== null) {
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
    result.static = result.top === 0 && result.right === 0 && result.left === 0 && result.bottom === 0;
    return result;
}

export function getSrcSet(element: HTMLImageElement, mimeType?: string[]) {
    const parentElement = <HTMLPictureElement> element.parentElement;
    const result: ImageSrcSet[] = [];
    let srcset = element.srcset;
    let sizes = element.sizes;
    if (parentElement && parentElement.tagName === 'PICTURE') {
        for (let i = 0; i < parentElement.children.length; i++) {
            const source = <HTMLSourceElement> parentElement.children[i];
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
        const fontSize = getFontSize(document.body);
        let width = 0;
        for (const value of sizes.split(XML.SEPARATOR)) {
            const match = pattern.exec(value.trim());
            if (match) {
                if (match[1] && !validMediaRule(match[1], fontSize)) {
                    continue;
                }
                if (match[4]) {
                    const calcMatch = CSS.CALC.exec(match[4]);
                    if (calcMatch) {
                        width = calculate(calcMatch[1]) || 0;
                    }
                    else {
                        width = parseUnit(match[4], fontSize);
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
            for (let i = 0; i < result.length; i++) {
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
    const match = CSS.URL.exec(value);
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
    let angle = parseFloat(value);
    if (!isNaN(angle)) {
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
    return 0;
}

export function convertPX(value: string, fontSize?: number) {
    if (value) {
        value = value.trim();
        if (value.endsWith('%') || value === 'auto') {
            return value;
        }
        return `${parseUnit(value, fontSize)}px`;
    }
    return '0px';
}

export function calculate(value: string, dimension = 0, fontSize?: number) {
    value = value.trim();
    if (value.charAt(0) !== '(' || value.charAt(value.length - 1) !== ')') {
        value = `(${value})`;
    }
    const opening: boolean[] = [];
    const closing: number[] = [];
    let opened = 0;
    for (let i = 0; i < value.length; i++) {
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
                case 'em':
                case 'ch':
                    result *= fontSize || 16;
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
        const match = CSS.ANGLE.exec(value);
        if (match) {
            return convertAngle(match[1], match[2]);
        }
    }
    return 0;
}

export function formatPX(value: string | number) {
    if (typeof value === 'string') {
        value = parseFloat(value);
    }
    return isNaN(value) ? '0px' : `${Math.round(value)}px`;
}

export function formatPercent(value: string | number, round = true) {
    if (typeof value === 'string') {
        value = parseFloat(value);
        if (isNaN(value)) {
            return '0%';
        }
    }
    value *= 100;
    return `${round ? Math.round(value) : value}%`;
}

export function isLength(value: string, percent = false) {
    return UNIT.LENGTH.test(value) || percent && isPercent(value);
}

export function isCalc(value: string) {
    return CSS.CALC.test(value);
}

export function isCustomProperty(value: string) {
    return CSS.CUSTOMPROPERTY.test(value);
}

export function isAngle(value: string) {
    return CSS.ANGLE.test(value);
}

export function isPercent(value: string) {
    return UNIT.PERCENT.test(value);
}