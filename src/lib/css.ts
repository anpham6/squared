import { parseColor } from './color';
import { USER_AGENT, getDeviceDPI, isUserAgent } from './client';
import { CSS, STRING, UNIT, XML } from './regex';

import { capitalize, convertAlpha, convertCamelCase, convertFloat, convertRoman, isString, replaceMap, resolvePath, spliceString } from './util';

type CSSKeyframesData = squared.lib.css.CSSKeyframesData;

const REGEX_KEYFRAME = /((?:\d+%\s*,?\s*)+|from|to)\s*{\s*(.+?)\s*}/;
const REGEX_MEDIARULE = /(?:(not|only)?\s*(?:all|screen) and )?((?:\([^)]+\)(?: and )?)+),?\s*/g;
const REGEX_MEDIACONDITION = /\(([a-z-]+)\s*(:|<?=?|=?>?)?\s*([\w.%]+)?\)(?: and )?/g;
const REGEX_SRCSET = /^(.*?)\s*(?:(\d*\.?\d*)([xw]))?$/;
const REGEX_CALCULATE = /(\s+[+-]\s+|\s*[*/]\s*)/;
const REGEX_PX = CSS.PX;

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
const convertPercent = (value: string, dimension: number, fontSize?: number) => Math.min(isPercent(value) ? parseFloat(value) / 100 : parseUnit(value, fontSize) / dimension, 1);

export const BOX_POSITION = ['top', 'right', 'bottom', 'left'];
export const BOX_MARGIN = ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'];
export const BOX_BORDER = [
    ['borderTopStyle', 'borderTopWidth', 'borderTopColor'],
    ['borderRightStyle', 'borderRightWidth', 'borderRightColor'],
    ['borderBottomStyle', 'borderBottomWidth', 'borderBottomColor'],
    ['borderLeftStyle', 'borderLeftWidth', 'borderLeftColor'],
    ['outlineStyle', 'outlineWidth', 'outlineColor']
];
export const BOX_PADDING = ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'];

export function getStyle(element: Element | null, pseudoElt = ''): CSSStyleDeclaration {
    if (element) {
        const cached = element['__style' + pseudoElt];
        if (cached) {
            return cached;
        }
        if (hasComputedStyle(element)) {
            const style = getComputedStyle(element, pseudoElt);
            element['__style' + pseudoElt] = style;
            return style;
        }
        return <CSSStyleDeclaration> { display: 'inline' };
    }
    return <CSSStyleDeclaration> { display: 'none' };
}

export function getFontSize(element: Element | null) {
    return parseFloat(getStyle(element).getPropertyValue('font-size'));
}

export function hasComputedStyle(element: Element): element is HTMLElement {
    return element.nodeName.charAt(0) !== '#' ? (element instanceof HTMLElement || element instanceof SVGElement) : false;
}

export function parseSelectorText(value: string) {
    value = value.trim();
    if (value.includes(',')) {
        let separatorValue = value;
        let match: RegExpExecArray | null;
        let found = false;
        while ((match = CSS.SELECTOR_ATTR.exec(separatorValue)) !== null) {
            const index = match.index;
            const length = match[0].length;
            separatorValue = (index > 0 ? separatorValue.substring(0, index) : '') + '_'.repeat(length) + separatorValue.substring(index + length);
            found = true;
        }
        if (found) {
            const result: string[] = [];
            let index: number;
            let position = 0;
            while (true) {
                index = separatorValue.indexOf(',', position);
                if (index !== -1) {
                    result.push(value.substring(position, index).trim());
                    position = index + 1;
                }
                else {
                    if (position > 0) {
                        result.push(value.substring(position).trim());
                    }
                    break;
                }
            }
            return result;
        }
        return value.split(XML.SEPARATOR);
    }
    return [value];
}

export function getSpecificity(value: string) {
    CSS.SELECTOR_G.lastIndex = 0;
    let result = 0;
    let match: RegExpExecArray | null;
    while ((match = CSS.SELECTOR_G.exec(value)) !== null) {
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
        else if (/\|\*^/.test(segment)) {
            continue;
        }
        else if (segment.charAt(0) === '*') {
            segment = segment.substring(1);
        }
        let subMatch: RegExpExecArray | null;
        while ((subMatch = CSS.SELECTOR_ATTR.exec(segment)) !== null) {
            if (subMatch[1]) {
                result += 1;
            }
            if (subMatch[3] || subMatch[4] || subMatch[5]) {
                result += 10;
            }
            segment = spliceString(segment, subMatch.index, subMatch[0].length);
        }
        while ((subMatch = CSS.SELECTOR_PSEUDO_CLASS.exec(segment)) !== null) {
            if (/^:not\(/.test(subMatch[0])) {
                if (subMatch[1]) {
                    const lastIndex = CSS.SELECTOR_G.lastIndex;
                    result += getSpecificity(subMatch[1]);
                    CSS.SELECTOR_G.lastIndex = lastIndex;
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
            segment = spliceString(segment, subMatch.index, subMatch[0].length);
        }
        while ((subMatch = CSS.SELECTOR_PSEUDO_ELEMENT.exec(segment)) !== null) {
            result += 1;
            segment = spliceString(segment, subMatch.index, subMatch[0].length);
        }
        while ((subMatch = CSS.SELECTOR_LABEL.exec(segment)) !== null) {
            const command = subMatch[0];
            switch (command.charAt(0)) {
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
            segment = spliceString(segment, subMatch.index, command.length);
        }
    }
    return result;
}

export function checkStyleValue(element: HTMLElement, attr: string, value: string, style?: CSSStyleDeclaration) {
    if (value === 'inherit') {
        switch (attr) {
            case 'fontSize':
            case 'lineHeight':
                if (style) {
                    return style[attr];
                }
            default:
                return getInheritedStyle(element, attr);
        }
    }
    else if (isCustomProperty(value)) {
        if (style) {
            return style[attr];
        }
        else if (isCalc(value)) {
            value = calculateVar(element, value, attr)?.toString() as string;
        }
        else {
            value = parseVar(element, value) as string;
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
        const length = styleSheets.length;
        for (let i = 0; i < length; i++) {
            const styleSheet = <CSSStyleSheet> styleSheets[i];
            const cssRules = styleSheet.cssRules;
            if (cssRules) {
                const lengthA = cssRules.length;
                for (let j = 0; j < lengthA; j++) {
                    try {
                        const item = <CSSKeyframesRule> cssRules[j];
                        if (item.type === CSSRule.KEYFRAMES_RULE) {
                            const value = parseKeyframeRule(item.cssRules);
                            if (Object.keys(value).length) {
                                const name = item.name;
                                if (result[name]) {
                                    Object.assign(result[name], value);
                                }
                                else {
                                    result[name] = value;
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
    const length = rules.length;
    for (let i = 0; i < length; i++) {
        const item = rules[i];
        const match = REGEX_KEYFRAME.exec(item.cssText);
        if (match) {
            for (let percent of (item['keyText'] || match[1].trim()).split(XML.SEPARATOR)) {
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
    if (value) {
        switch (value) {
            case 'only all':
            case 'only screen':
                return true;
            default: {
                REGEX_MEDIARULE.lastIndex = 0;
                let match: RegExpExecArray | null;
                while ((match = REGEX_MEDIARULE.exec(value)) !== null) {
                    const negate = match[1] === 'not';
                    let subMatch: RegExpExecArray | null;
                    let valid = false;
                    while ((subMatch = REGEX_MEDIACONDITION.exec(match[2])) !== null) {
                        const attr = subMatch[1];
                        let operation: string;
                        if (/^min/.test(attr)) {
                            operation = '>=';
                        }
                        else if (/^max/.test(attr)) {
                            operation = '<=';
                        }
                        else {
                            operation = subMatch[2];
                        }
                        const rule = subMatch[3];
                        switch (attr) {
                            case 'aspect-ratio':
                            case 'min-aspect-ratio':
                            case 'max-aspect-ratio':
                                if (rule) {
                                    const [width, height] = replaceMap<string, number>(rule.split('/'), ratio => parseInt(ratio));
                                    valid = compareRange(operation, window.innerWidth / window.innerHeight, width / height);
                                }
                                else {
                                    valid = false;
                                }
                                break;
                            case 'width':
                            case 'min-width':
                            case 'max-width':
                            case 'height':
                            case 'min-height':
                            case 'max-height':
                                valid = compareRange(operation, /width$/.test(attr) ? window.innerWidth : window.innerHeight, parseUnit(rule, fontSize));
                                break;
                            case 'orientation':
                                valid = rule !== undefined && (rule === 'portrait' && window.innerWidth <= window.innerHeight || rule === 'landscape' && window.innerWidth > window.innerHeight);
                                break;
                            case 'resolution':
                            case 'min-resolution':
                            case 'max-resolution':
                                if (rule) {
                                    let resolution = parseFloat(rule);
                                    if (/dpcm$/.test(rule)) {
                                        resolution *= 2.54;
                                    }
                                    else if (/dppx$/.test(rule)) {
                                        resolution *= 96;
                                    }
                                    valid = compareRange(operation, getDeviceDPI(), resolution);
                                }
                                else {
                                    valid = false;
                                }
                                break;
                            case 'grid':
                                valid = rule === '0';
                                break;
                            case 'color':
                                valid = rule === undefined || parseInt(rule) > 0;
                                break;
                            case 'min-color':
                                valid = parseInt(rule) <= screen.colorDepth / 3;
                                break;
                            case 'max-color':
                                valid = parseInt(rule) >= screen.colorDepth / 3;
                                break;
                            case 'color-index':
                            case 'min-color-index':
                            case 'monochrome':
                            case 'min-monochrome':
                                valid = rule === '0';
                                break;
                            case 'max-color-index':
                            case 'max-monochrome':
                                valid = parseInt(rule) >= 0;
                                break;
                            default:
                                valid = false;
                                break;
                        }
                        if (!valid) {
                            break;
                        }
                    }
                    REGEX_MEDIACONDITION.lastIndex = 0;
                    if (!negate && valid || negate && !valid) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

export function isParentStyle(element: Element, attr: string, ...styles: string[]) {
    if (element.nodeName.charAt(0) !== '#' && styles.includes(getStyle(element)[attr])) {
        return true;
    }
    else {
        const parentElement = element.parentElement;
        if (parentElement) {
            return styles.includes(getStyle(parentElement)[attr]);
        }
    }
    return false;
}

export function getInheritedStyle(element: Element, attr: string, exclude?: RegExp, ...tagNames: string[]) {
    let value = '';
    let current = element.parentElement;
    while (current && !tagNames.includes(current.tagName)) {
        value = getStyle(current)[attr];
        if (value === 'inherit' || exclude?.test(value)) {
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
    while ((match = CSS.VAR.exec(value)) !== null) {
        let propertyValue = style.getPropertyValue(match[1]).trim();
        const subValue = match[2];
        if (subValue && (isLength(subValue, true) && !isLength(propertyValue, true) || parseColor(subValue) && parseColor(propertyValue) === undefined)) {
            propertyValue = subValue;
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
            if (/^(margin|padding|border)/.test(attr)) {
                dimension = rect.width;
            }
            else {
                dimension = /top|bottom|height|vertical/.test(attr) || attr.length <= 2 && attr.includes('y') ? rect.height : rect.width;
            }
        }
        return calculate(result, dimension, getFontSize(element));
    }
    return undefined;
}

export function getBackgroundPosition(value: string, dimension: Dimension, fontSize?: number, imageDimension?: Dimension, imageSize?: string) {
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
    function setImageOffset(position: string, horizontal: boolean, direction: string, directionAsPercent: string) {
        if (imageDimension && !isLength(position)) {
            let offset = result[directionAsPercent];
            if (imageSize && imageSize !== 'auto' && imageSize !== 'initial') {
                const [sizeW, sizeH] = imageSize.split(' ');
                if (horizontal) {
                    let width = dimension.width;
                    if (sizeW && isLength(sizeW, true)) {
                        if (isPercent(sizeW)) {
                            width *= parseFloat(sizeW) / 100;
                        }
                        else {
                            const length = parseUnit(sizeW, fontSize);
                            if (length) {
                                width = length;
                            }
                        }
                    }
                    else if (sizeH) {
                        let percent = 1;
                        if (isPercent(sizeH)) {
                            percent = ((parseFloat(sizeH) / 100) * dimension.height) / imageDimension.height;
                        }
                        else if (isLength(sizeH)) {
                            const length = parseUnit(sizeH, fontSize);
                            if (length) {
                                percent = length / imageDimension.height;
                            }
                        }
                        width = percent * imageDimension.width;
                    }
                    offset *= width;
                }
                else {
                    let height = dimension.height;
                    if (sizeH && isLength(sizeH, true)) {
                        if (isPercent(sizeH)) {
                            height *= parseFloat(sizeH) / 100;
                        }
                        else {
                            const length = parseUnit(sizeH, fontSize);
                            if (length) {
                                height = length;
                            }
                        }
                    }
                    else if (sizeW) {
                        let percent = 1;
                        if (isPercent(sizeW)) {
                            percent = ((parseFloat(sizeW) / 100) * dimension.width) / imageDimension.width;
                        }
                        else if (isLength(sizeW)) {
                            const length = parseUnit(sizeW, fontSize);
                            if (length) {
                                percent = length / imageDimension.width;
                            }
                        }
                        height = percent * imageDimension.height;
                    }
                    offset *= height;
                }
            }
            else {
                offset *= horizontal ? imageDimension.width : imageDimension.height;
            }
            result[direction] -= offset;
        }
    }
    if (orientation.length === 2) {
        for (let i = 0; i < 2; i++) {
            const position = orientation[i];
            const horizontal = i === 0;
            let direction: string;
            let offsetParent: number;
            if (horizontal) {
                direction = 'left';
                offsetParent = dimension.width;
                result.horizontal = position;
            }
            else {
                direction = 'top';
                offsetParent = dimension.height;
                result.vertical = position;
            }
            const directionAsPercent = direction + 'AsPercent';
            switch (position) {
                case '0%':
                case 'start':
                    if (horizontal) {
                        result.horizontal = 'left';
                    }
                    break;
                case '100%':
                case 'end':
                    if (horizontal) {
                        result.horizontal = 'right';
                    }
                case 'right':
                case 'bottom':
                    result[direction] = offsetParent;
                    result[directionAsPercent] = 1;
                    break;
                case '50%':
                case 'center':
                    result[direction] = offsetParent / 2;
                    result[directionAsPercent] = 0.5;
                    break;
                default:
                    result[direction] = convertLength(position, offsetParent, fontSize);
                    result[directionAsPercent] = convertPercent(position, offsetParent, fontSize);
                    break;
            }
            setImageOffset(position, horizontal, direction, directionAsPercent);
        }
    }
    else if (orientation.length === 4) {
        for (let i = 0; i < 4; i++) {
            const position = orientation[i];
            switch (i) {
                case 0:
                    switch (position) {
                        case '0%':
                            result.horizontal = 'left';
                            break;
                        case '50%':
                            result.horizontal = 'center';
                            break;
                        case '100%':
                            result.horizontal = 'right';
                            break;
                        default:
                            result.horizontal = position;
                            break;
                    }
                    break;
                case 1: {
                    const location = convertLength(position, dimension.width, fontSize);
                    const locationAsPercent = convertPercent(position, dimension.width, fontSize);
                    switch (result.horizontal) {
                        case 'end':
                            result.horizontal = 'right';
                        case 'right':
                            result.right = location;
                            result.rightAsPercent = locationAsPercent;
                            setImageOffset(position, true, 'right', 'rightAsPercent');
                            result.left = dimension.width - result.right;
                            result.leftAsPercent = 1 - locationAsPercent;
                            break;
                        case 'start':
                            result.horizontal = 'left';
                        default:
                            result.left = location;
                            result.leftAsPercent = locationAsPercent;
                            break;
                    }
                    setImageOffset(position, true, 'left', 'leftAsPercent');
                    break;
                }
                case 2:
                    switch (position) {
                        case '0%':
                            result.vertical = 'top';
                            break;
                        case '50%':
                            result.vertical = 'center';
                            break;
                        case '100%':
                            result.vertical = 'bottom';
                            break;
                        default:
                            result.vertical = position;
                            break;
                    }
                    break;
                case 3: {
                    const location = convertLength(position, dimension.height, fontSize);
                    const locationAsPercent = convertPercent(position, dimension.height, fontSize);
                    if (result.vertical === 'bottom') {
                        result.bottom = location;
                        result.bottomAsPercent = locationAsPercent;
                        setImageOffset(position, false, 'bottom', 'bottomAsPercent');
                        result.top = dimension.height - result.bottom;
                        result.topAsPercent = 1 - locationAsPercent;
                    }
                    else {
                        result.top = location;
                        result.topAsPercent = locationAsPercent;
                    }
                    setImageOffset(position, false, 'top', 'topAsPercent');
                    break;
                }
            }
        }
    }
    result.static = result.top === 0 && result.right === 0 && result.bottom === 0 && result.left === 0;
    return result;
}

export function getSrcSet(element: HTMLImageElement, mimeType?: string[]) {
    const parentElement = <HTMLPictureElement> element.parentElement;
    const result: ImageSrcSet[] = [];
    let { srcset, sizes } = element;
    if (parentElement?.tagName === 'PICTURE') {
        const children = parentElement.children;
        const length = children.length;
        for (let i = 0; i < length; i++) {
            const source = <HTMLSourceElement> children[i];
            if (source.tagName === 'SOURCE') {
                const type = source.type.trim();
                const value = source.srcset.trim();
                if (value !== '' && (isString(source.media) && validMediaRule(source.media) || type !== '' && mimeType?.includes((type.split('/').pop() as string).toLowerCase()))) {
                    srcset = value;
                    sizes = source.sizes;
                    break;
                }
            }
        }
    }
    if (srcset !== '') {
        for (const value of srcset.split(XML.SEPARATOR)) {
            const match = REGEX_SRCSET.exec(value.trim());
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
                    src: resolvePath(match[1]),
                    pixelRatio,
                    width
                });
            }
        }
        result.sort((a, b) => {
            const pxA = a.pixelRatio;
            const pxB = b.pixelRatio;
            if (pxA > 0 && pxB > 0) {
                if (pxA !== pxB) {
                    return pxA < pxB ? -1 : 1;
                }
            }
            else {
                const widthA = a.width;
                const widthB = b.width;
                if (widthA > 0 && widthB > 0) {
                    if (widthA !== widthB) {
                        return widthA < widthB ? -1 : 1;
                    }
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
                if (!validMediaRule(match[1])) {
                    continue;
                }
                const unit = match[4];
                if (unit) {
                    const calcMatch = CSS.CALC.exec(unit);
                    if (calcMatch) {
                        width = calculate(calcMatch[1]) || 0;
                    }
                    else {
                        width = parseUnit(unit);
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
            if (index === 0) {
                const item = result[0];
                item.pixelRatio = 1;
                item.actualWidth = width;
            }
            else if (index > 0) {
                const selected = result.splice(index, 1)[0];
                selected.pixelRatio = 1;
                selected.actualWidth = width;
                result.unshift(selected);
            }
            for (let i = 1; i < length; i++) {
                const item = result[i];
                if (item.pixelRatio === 0) {
                    item.pixelRatio = item.width / width;
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
    const match = CSS.URL.exec(value);
    return match ? resolvePath(match[1]) : '';
}

export function insertStyleSheetRule(value: string, index = 0) {
    const style = document.createElement('style');
    if (isUserAgent(USER_AGENT.SAFARI)) {
        style.appendChild(document.createTextNode(''));
    }
    document.head.appendChild(style);
    const sheet = style.sheet as any;
    if (typeof sheet?.insertRule === 'function') {
        try {
            sheet.insertRule(value, index);
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
    return value ? (REGEX_PX.test(value) ? value : parseUnit(value, fontSize) + 'px') : '0px';
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
                    for (let partial of value.substring(j + 1, closing[i]).split(REGEX_CALCULATE)) {
                        partial = partial.trim();
                        switch (partial) {
                            case '+':
                            case '-':
                            case '*':
                            case '/':
                                evaluate.push(partial);
                                break;
                            default: {
                                const match = /{(\d+)}/.exec(partial);
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
                            value = value.substring(0, j) + hash + ' '.repeat(remaining - (j + hash.length)) + value.substring(remaining);
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
                    result *= fontSize !== undefined && !isNaN(fontSize) ? fontSize : (getFontSize(document.body) || 16);
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

export function formatPX(value: number) {
    return (Math.round(value) || 0) + 'px';
}

export function formatPercent(value: string | number, round = true) {
    if (typeof value === 'string') {
        value = parseFloat(value);
        if (isNaN(value)) {
            return '0%';
        }
    }
    value *= 100;
    return (round ? Math.round(value) : value) + '%';
}

export function isLength(value: string, percent = false) {
    return UNIT.LENGTH.test(value) || percent && isPercent(value);
}

export function isCalc(value: string) {
    return CSS.CALC.test(value);
}

export function isCustomProperty(value: string) {
    return CSS.CUSTOM_PROPERTY.test(value);
}

export function isAngle(value: string) {
    return CSS.ANGLE.test(value);
}

export function isPercent(value: string) {
    return UNIT.PERCENT.test(value);
}