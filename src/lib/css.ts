import { parseColor } from './color';
import { USER_AGENT, getDeviceDPI, isUserAgent } from './client';
import { clamp, truncate } from './math';
import { CHAR, CSS, STRING, UNIT, XML } from './regex';
import { convertAlpha, convertFloat, convertRoman, isNumber, isString, iterateArray, replaceMap, resolvePath, spliceString, splitEnclosing } from './util';

type KeyframesData = squared.lib.css.KeyframesData;
type BackgroundPositionOptions = squared.lib.css.BackgroundPositionOptions;
type CalculateOptions = squared.lib.css.CalculateOptions;
type CalculateVarOptions = squared.lib.css.CalculateVarOptions;
type CalculateVarAsStringOptions = squared.lib.css.CalculateVarAsStringOptions;

const STRING_SIZES = `(\\(\\s*(?:orientation:\\s*(?:portrait|landscape)|(?:max|min)-width:\\s*${STRING.LENGTH_PERCENTAGE})\\s*\\))`;
const REGEX_KEYFRAME = /((?:\d+%\s*,?\s*)+|from|to)\s*{\s*(.+?)\s*}/;
const REGEX_MEDIARULE = /(?:(not|only)?\s*(?:all|screen) and )?((?:\([^)]+\)(?: and )?)+),?\s*/g;
const REGEX_MEDIACONDITION = /\(([a-z-]+)\s*(:|<?=?|=?>?)?\s*([\w.%]+)?\)(?: and )?/g;
const REGEX_SRCSET = /^(.*?)\s*(?:([\d.]+)([xw]))?$/;
const REGEX_OPERATOR = /\s+([+-]\s+|\s*[*/])\s*/;
const REGEX_INTEGER = /^\s*-?\d+\s*$/;
const REGEX_CALC = new RegExp(STRING.CSS_CALC);
const REGEX_LENGTH = new RegExp(`(${STRING.UNIT_LENGTH}|%)`);
const REGEX_WIDTH = new RegExp(`\\s*(?:(\\(\\s*)?${STRING_SIZES}|(\\(\\s*))?\\s*(and|or|not)?\\s*(?:${STRING_SIZES}(\\s*\\))?)?\\s*(.+)`);
const REGEX_DIVIDER = /\s*\/\s*/;

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

function calculatePosition(element: CSSElement, value: string, boundingBox?: Dimension) {
    const component = splitEnclosing(value.trim(), 'calc').filter(item => item.trim() !== '');
    const length = component.length;
    switch (length) {
        case 1:
        case 2:
            return calculateVarAsString(element, component.join(''), { parent: false, dimension: ['width', 'height'], boundingBox });
        case 3:
        case 4: {
            const options: CalculateVarOptions = { boundingBox };
            let horizontal = 0;
            let vertical = 0;
            for (let i = 0; i < length; i++) {
                const calc = component[i].trim();
                if (isCalc(calc)) {
                    if (i === 0) {
                        if (length === 3 && !/^(top|right|bottom|left)$/.test(component[2].trim())) {
                            switch (component[1]) {
                                case 'top':
                                case 'bottom':
                                    options.dimension = 'width';
                                    break;
                                case 'left':
                                case 'right':
                                    options.dimension = 'height';
                                    break;
                                default:
                                    return '';
                            }
                        }
                    }
                    else {
                        switch (component[i - 1]) {
                            case 'top':
                            case 'bottom':
                                options.dimension = 'height';
                                break;
                            case 'left':
                            case 'right':
                                options.dimension = 'width';
                                break;
                            default:
                                return '';
                        }
                    }
                    options.boundingSize = undefined;
                    const result = formatVar(calculateVar(element, calc, options));
                    if (result !== '') {
                        component[i] = result;
                    }
                    else {
                        return '';
                    }
                }
                else {
                    switch (calc) {
                        case 'top':
                        case 'bottom':
                            if (++vertical > 1) {
                                return '';
                            }
                            break;
                        case 'left':
                        case 'right':
                            if (++horizontal > 1) {
                                return '';
                            }
                            break;
                    }
                    component[i] = calc;
                }
            }
            return component.join(' ');
        }
    }
    return '';
}

function calculateColor(element: CSSElement, value: string) {
    const color = splitEnclosing(value);
    const length = color.length;
    if (length > 1) {
        for (let i = 1; i < length; i++) {
            const seg = color[i].trim();
            if (hasCalc(seg)) {
                const name = color[i - 1].trim();
                if (isColor(name)) {
                    const component = trimEnclosing(seg).split(XML.SEPARATOR);
                    const q = component.length;
                    if (q >= 3) {
                        const hsl = /^hsl/.test(name);
                        for (let j = 0; j < q; j++) {
                            const rgb = component[j];
                            if (isCalc(rgb)) {
                                if (hsl && (j === 1 || j === 2)) {
                                    const result = calculateVar(element, rgb, { unitType: CSS_UNIT.PERCENT, supportPercent: true });
                                    if (!isNaN(result)) {
                                        component[j] = clamp(result, 0, 100) + '%';
                                    }
                                    else {
                                        return '';
                                    }
                                }
                                else if (j === 3) {
                                    const percent = rgb.includes('%');
                                    let result = calculateVar(element, rgb, percent ? { unitType: CSS_UNIT.PERCENT } : { unitType: CSS_UNIT.DECIMAL });
                                    if (!isNaN(result)) {
                                        if (percent) {
                                            result /= 100;
                                        }
                                        component[j] = clamp(result).toString();
                                    }
                                    else {
                                        return '';
                                    }
                                }
                                else {
                                    const result = calculateVar(element, rgb, { unitType: CSS_UNIT.DECIMAL, supportPercent: false });
                                    if (!isNaN(result)) {
                                        component[j] = clamp(result, 0, 255).toString();
                                    }
                                    else {
                                        return '';
                                    }
                                }
                            }
                        }
                        color[i] = `(${component.join(', ')})`;
                        continue;
                    }
                }
                return '';
            }
        }
        return color.join('');
    }
    return value;
}

function calculateGeneric(element: CSSElement, value: string, unitType: number, min: number, boundingBox?: Dimension, dimension: DimensionAttr = 'width') {
    const segments = splitEnclosing(value, 'calc');
    const length = segments.length;
    for (let i = 0; i < length; i++) {
        const seg = segments[i];
        if (isCalc(seg)) {
            const px = REGEX_LENGTH.test(seg);
            const result = calculateVar(element, seg, px ? { dimension, boundingBox, min: 0, parent: false } : { unitType, min, supportPercent: false });
            if (!isNaN(result)) {
                segments[i] = result + (px ? 'px' : '');
            }
            else {
                return '';
            }
        }
    }
    return segments.join('').trim();
}

function getWritingMode(value: string) {
    switch (value) {
        case 'vertical-lr':
            return 1;
        case 'vertical-rl':
            return 2;
    }
    return 0;
}

function hasBorderStyle(value: string) {
    switch (value) {
        case 'none':
        case 'initial':
        case 'hidden':
            return false;
    }
    return true;
}

function getContentBoxWidth(style: CSSStyleDeclaration) {
    return (
        (hasBorderStyle(style.getPropertyValue('border-left-style')) ? parseFloat(style.getPropertyValue('border-left-width')) : 0) +
        parseFloat(style.getPropertyValue('padding-left')) +
        parseFloat(style.getPropertyValue('padding-right')) +
        (hasBorderStyle(style.getPropertyValue('border-right-style')) ? parseFloat(style.getPropertyValue('border-right-width')) : 0)
    );
}

function getContentBoxHeight(style: CSSStyleDeclaration) {
    return (
        (hasBorderStyle(style.getPropertyValue('border-top-style')) ? parseFloat(style.getPropertyValue('border-top-width')) : 0) +
        parseFloat(style.getPropertyValue('padding-top')) +
        parseFloat(style.getPropertyValue('padding-bottom')) +
        (hasBorderStyle(style.getPropertyValue('border-bottom-style')) ? parseFloat(style.getPropertyValue('border-bottom-width')) : 0)
    );
}

function getBoundingWidth(element: HTMLElement) {
    const parentElement = element.parentElement;
    return parentElement ? Math.max(0, parentElement.getBoundingClientRect().width - getContentBoxWidth(getStyle(parentElement))) : 0;
}

function isAbsolutePosition(value: string) {
    switch (value) {
        case 'absolute':
        case 'fixed':
            return true;
    }
    return false;
}

const getInnerWidth = (dimension: Undef<Dimension>) => dimension?.width || window.innerWidth;
const getInnerHeight = (dimension: Undef<Dimension>) => dimension?.height || window.innerHeight;
const convertLength = (value: string, dimension: number, fontSize?: number, screenDimension?: Dimension) => isPercent(value) ? Math.round(dimension * (convertFloat(value) / 100)) : parseUnit(value, fontSize, screenDimension);
const convertPercent = (value: string, dimension: number, fontSize?: number, screenDimension?: Dimension) => isPercent(value) ? parseFloat(value) / 100 : parseUnit(value, fontSize, screenDimension) / dimension;
const isColor = (value: string) => /(rgb|hsl)a?/.test(value);
const formatVar = (value: number) => !isNaN(value) ? value + 'px' : '';
const formatDecimal = (value: number) => !isNaN(value) ? value.toString() : '';
const trimEnclosing = (value: string) => value.substring(1, value.length - 1);

export const enum CSS_UNIT {
    NONE = 0,
    LENGTH = 2,
    PERCENT = 4,
    TIME = 8,
    ANGLE = 16,
    INTEGER = 32,
    DECIMAL = 64
}

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
export const TEXT_STYLE = ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'color', 'whiteSpace', 'textDecoration', 'textTransform', 'letterSpacing', 'wordSpacing'];

export function getStyle(element: Null<Element>, pseudoElt = ''): CSSStyleDeclaration {
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
        return <CSSStyleDeclaration> { position: 'static', display: 'inline' };
    }
    return <CSSStyleDeclaration> { position: 'static', display: 'none' };
}

export function getFontSize(element: Null<Element>) {
    return parseFloat(getStyle(element).getPropertyValue('font-size'));
}

export function hasComputedStyle(element: Element): element is HTMLElement {
    return element.nodeName.charAt(0) !== '#' && (element instanceof HTMLElement || element instanceof SVGElement);
}

export function parseSelectorText(value: string) {
    value = value.trim();
    if (value.includes(',')) {
        let separatorValue = value;
        let found = false;
        let match: Null<RegExpExecArray>;
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
    let match: Null<RegExpExecArray>;
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
        else if (segment.endsWith('|*')) {
            continue;
        }
        else if (segment.charAt(0) === '*') {
            segment = segment.substring(1);
        }
        let subMatch: Null<RegExpExecArray>;
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
                const attr = subMatch[1];
                if (attr) {
                    const lastIndex = CSS.SELECTOR_G.lastIndex;
                    result += getSpecificity(attr);
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

export function checkWritingMode(attr: string, value: string) {
    switch (attr) {
        case 'inlineSize':
            return getWritingMode(value) === 0 ? 'width': 'height';
        case 'blockSize':
            return getWritingMode(value) === 0 ? 'height' : 'width';
        case 'maxInlineSize':
            return getWritingMode(value) === 0 ? 'maxWidth': 'maxHeight';
        case 'maxBlockSize':
            return getWritingMode(value) === 0 ? 'maxHeight' : 'maxWidth';
        case 'minInlineSize':
            return getWritingMode(value) === 0 ? 'minWidth': 'minHeight';
        case 'minBlockSize':
            return getWritingMode(value) === 0 ? 'minHeight' : 'minWidth';
        case 'borderInlineStart':
            return getWritingMode(value) === 0 ? 'borderLeft' : 'borderTop';
        case 'borderInlineEnd':
            return getWritingMode(value) === 0 ? 'borderRight' : 'borderBottom';
        case 'borderInlineStartWidth':
            return getWritingMode(value) === 0 ? 'borderLeftWidth' : 'borderTopWidth';
        case 'borderInlineEndWidth':
            return getWritingMode(value) === 0 ? 'borderRightWidth' : 'borderBottomWidth';
        case 'insetInlineStart':
            return getWritingMode(value) === 0 ? 'left' : 'top';
        case 'insetInlineEnd':
            return getWritingMode(value) === 0 ? 'right' : 'bottom';
        case 'marginInlineStart':
            return getWritingMode(value) === 0 ? 'marginLeft' : 'marginTop';
        case 'marginInlineEnd':
            return getWritingMode(value) === 0 ? 'marginRight' : 'marginBottom';
        case 'paddingInlineStart':
            return getWritingMode(value) === 0 ? 'paddingLeft' : 'paddingTop';
        case 'paddingInlineEnd':
            return getWritingMode(value) === 0 ? 'paddingRight' : 'paddingBottom';
        case 'scrollMarginInlineStart':
            return getWritingMode(value) === 0 ? 'scrollMarginLeft' : 'scrollMarginTop';
        case 'scrollMarginInlineEnd':
            return getWritingMode(value) === 0 ? 'scrollMarginRight' : 'scrollMarginBottom';
        case 'scrollPaddingInlineStart':
            return getWritingMode(value) === 0 ? 'scrollPaddingLeft' : 'scrollPaddingTop';
        case 'scrollPaddingInlineEnd':
            return getWritingMode(value) === 0 ? 'scrollPaddingRight' : 'scrollPaddingBottom';
        case 'borderBlockStart':
            switch (getWritingMode(value)) {
                case 0:
                    return 'borderTop';
                case 1:
                    return 'borderLeft';
                case 2:
                    return 'borderRight';
            }
        case 'borderBlockEnd':
            switch (getWritingMode(value)) {
                case 0:
                    return 'borderBottom';
                case 1:
                    return 'borderRight';
                case 2:
                    return 'borderLeft';
            }
        case 'borderBlockStartWidth':
            switch (getWritingMode(value)) {
                case 0:
                    return 'borderTopWidth';
                case 1:
                    return 'borderLeftWidth';
                case 2:
                    return 'borderRightWidth';
            }
        case 'borderBlockEndWidth':
            switch (getWritingMode(value)) {
                case 0:
                    return 'borderBottomWidth';
                case 1:
                    return 'borderRightWidth';
                case 2:
                    return 'borderLeftWidth';
            }
        case 'insetBlockStart':
            switch (getWritingMode(value)) {
                case 0:
                    return 'top';
                case 1:
                    return 'left';
                case 2:
                    return 'right';
            }
        case 'insetBlockEnd':
            switch (getWritingMode(value)) {
                case 0:
                    return 'bottom';
                case 1:
                    return 'right';
                case 2:
                    return 'left';
            }
        case 'marginBlockStart':
            switch (getWritingMode(value)) {
                case 0:
                    return 'marginTop';
                case 1:
                    return 'marginLeft';
                case 2:
                    return 'marginRight';
            }
        case 'marginBlockEnd':
            switch (getWritingMode(value)) {
                case 0:
                    return 'marginBottom';
                case 1:
                    return 'marginRight';
                case 2:
                    return 'marginLeft';
            }
        case 'paddingBlockStart':
            switch (getWritingMode(value)) {
                case 0:
                    return 'paddingTop';
                case 1:
                    return 'paddingLeft';
                case 2:
                    return 'paddingRight';
            }
        case 'paddingBlockEnd':
            switch (getWritingMode(value)) {
                case 0:
                    return 'paddingBottom';
                case 1:
                    return 'paddingRight';
                case 2:
                    return 'paddingLeft';
            }
        case 'scrollMarginBlockStart':
            switch (getWritingMode(value)) {
                case 0:
                    return 'scrollMarginTop';
                case 1:
                    return 'scrollMarginLeft';
                case 2:
                    return 'scrollMarginRight';
            }
        case 'scrollMarginBlockEnd':
            switch (getWritingMode(value)) {
                case 0:
                    return 'scrollMarginBottom';
                case 1:
                    return 'scrollMarginRight';
                case 2:
                    return 'scrollMarginLeft';
            }
        case 'scrollPaddingBlockStart':
            switch (getWritingMode(value)) {
                case 0:
                    return 'scrollPaddingTop';
                case 1:
                    return 'scrollPaddingLeft';
                case 2:
                    return 'scrollPaddingRight';
            }
        case 'scrollPaddingBlockEnd':
            switch (getWritingMode(value)) {
                case 0:
                    return 'scrollPaddingBottom';
                case 1:
                    return 'scrollPaddingRight';
                case 2:
                    return 'scrollPaddingLeft';
            }
    }
    return '';
}

export function calculateStyle(element: CSSElement, attr: string, value: string, boundingBox?: Dimension): string {
    switch (attr) {
        case 'left':
        case 'right':
        case 'textIndent':
            return formatVar(calculateVar(element, value, { dimension: 'width', boundingBox }));
        case 'columnGap':
        case 'columnWidth':
        case 'gridColumnGap':
        case 'marginBottom':
        case 'marginLeft':
        case 'marginRight':
        case 'marginTop':
        case 'maxWidth':
        case 'minWidth':
        case 'paddingBottom':
        case 'paddingLeft':
        case 'paddingRight':
        case 'paddingTop':
        case 'scrollMarginBottom':
        case 'scrollMarginLeft':
        case 'scrollMarginRight':
        case 'scrollMarginTop':
        case 'scrollPaddingBottom':
        case 'scrollPaddingLeft':
        case 'scrollPaddingRight':
        case 'scrollPaddingTop':
        case 'width':
            return formatVar(calculateVar(element, value, { dimension: 'width', boundingBox, min: 0 }));
        case 'shapeMargin':
            return formatVar(calculateVar(element, value, { dimension: 'width', boundingBox, min: 0, parent: false }));
        case 'bottom':
        case 'top':
        case 'verticalAlign':
            return formatVar(calculateVar(element, value, { dimension: 'height', boundingBox }));
        case 'gridRowGap':
        case 'height':
        case 'maxHeight':
        case 'minHeight':
        case 'rowGap':
            return formatVar(calculateVar(element, value, { dimension: 'height', boundingBox, min: 0 }));
        case 'flexBasis': {
            const parentElement = element.parentElement;
            if (parentElement) {
                const { display, flexDirection } = getStyle(parentElement);
                if (display.includes('flex')) {
                    return formatVar(calculateVar(element, value, { dimension: flexDirection.includes('column') ? 'height' : 'width', boundingBox, min: 0 }));
                }
            }
            break;
        }
        case 'borderBottomWidth':
        case 'borderLeftWidth':
        case 'borderRightWidth':
        case 'borderTopWidth':
        case 'letterSpacing':
        case 'outlineOffset':
        case 'outlineWidth':
        case 'perspective':
        case 'wordSpacing':
            return formatVar(calculateVar(element, value, { min: 0, supportPercent: false }));
        case 'offsetDistance': {
            let boundingSize = 0;
            if (value.includes('%')) {
                const offsetPath = getStyle(element).getPropertyValue('offset-path');
                if (offsetPath !== 'none') {
                    const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    pathElement.setAttribute('d', offsetPath);
                    boundingSize = pathElement.getTotalLength();
                }
            }
            return formatVar(calculateVar(element, value, { boundingSize }));
        }
        case 'fontSize':
            return formatVar(calculateVar(element, value, { boundingSize: getFontSize(element.parentElement), min: 0 }));
        case 'lineHeight':
            return formatVar(calculateVar(element, value, { boundingSize: getFontSize(element), min: 0 }));
        case 'margin':
            return calculateVarAsString(element, value, { dimension: 'width', boundingBox });
        case 'borderBottomLeftRadius':
        case 'borderBottomRightRadius':
        case 'borderTopLeftRadius':
        case 'borderTopRightRadius':
        case 'borderRadius':
        case 'padding':
        case 'scrollMargin':
        case 'scrollMarginBlock':
        case 'scrollMarginInline':
        case 'scrollPadding':
        case 'scrollPaddingBlock':
        case 'scrollPaddingInline':
            return calculateVarAsString(element, value, { dimension: 'width', boundingBox, min: 0 });
        case 'objectPosition':
            return calculateVarAsString(element, value, { dimension: ['width', 'height'], boundingBox });
        case 'gridGap':
        case 'perspectiveOrigin':
            return calculateVarAsString(element, value, { dimension: ['width', 'height'], boundingBox, min: attr === 'gridGap' ? 0 : undefined, parent: false });
        case 'borderImageOutset':
        case 'borderImageWidth':
            return calculateVarAsString(element, value, { dimension: ['height', 'width', 'height', 'width'], boundingBox, min: 0, parent: false });
        case 'borderWidth':
        case 'borderSpacing':
        case 'columnRule':
            return calculateVarAsString(element, value, { min: 0, supportPercent: false });
        case 'gridAutoColumns':
        case 'gridTemplateColumns':
            return calculateGeneric(element, value, CSS_UNIT.INTEGER, 1, boundingBox);
        case 'gridAutoRows':
        case 'gridTemplateRows':
            return calculateGeneric(element, value, CSS_UNIT.INTEGER, 1, boundingBox, 'height');
        case 'zIndex':
            return formatDecimal(calculateVar(element, value, { unitType: CSS_UNIT.INTEGER }));
        case 'tabSize':
            return formatDecimal(calculateVar(element, value, { unitType: CSS_UNIT.INTEGER, min: 0 }));
        case 'columnCount':
        case 'fontWeight':
        case 'widows':
            return formatDecimal(calculateVar(element, value, { unitType: CSS_UNIT.INTEGER, min: 1 }));
        case 'gridRow':
        case 'gridRowEnd':
        case 'gridRowStart':
        case 'gridColumn':
        case 'gridColumnEnd':
        case 'gridColumnStart':
        case 'counterIncrement':
        case 'counterReset':
            return calculateVarAsString(element, value, { unitType: CSS_UNIT.INTEGER });
        case 'fontVariationSettings':
            return calculateVarAsString(element, value, { unitType: CSS_UNIT.INTEGER, min: 0 });
        case 'gridArea':
            return calculateVarAsString(element, value, { unitType: CSS_UNIT.INTEGER, min: 1 });
        case 'flexGrow':
        case 'flexShrink':
            return formatDecimal(calculateVar(element, value, { unitType: CSS_UNIT.DECIMAL, min: 0 }));
        case 'animationIterationCount':
        case 'fontSizeAdjust':
            return formatDecimal(calculateVar(element, value, { unitType: CSS_UNIT.DECIMAL, min: 0, supportPercent: false }));
        case 'opacity':
        case 'shapeImageThreshold': {
            const percent = value.includes('%');
            const result = calculateVar(element, value, { unitType: percent ? CSS_UNIT.PERCENT : CSS_UNIT.DECIMAL });
            return !isNaN(result) ? clamp(result * (percent ? 1 / 100 : 1)).toString() : '';
        }
        case 'fontStretch':
            return calculateVarAsString(element, value, { unitType: CSS_UNIT.PERCENT, min: 0, supportPercent: true });
        case 'fontStyle':
        case 'offsetRotate':
            return calculateVarAsString(element, value, { unitType: CSS_UNIT.ANGLE, supportPercent: false });
        case 'offsetAnchor':
        case 'transformOrigin':
            return calculatePosition(element, value, boundingBox);
        case 'transform': {
            value = value.trim();
            const transform = splitEnclosing(value);
            const length = transform.length;
            if (length > 1) {
                for (let i = 1; i < length; i++) {
                    let seg = transform[i];
                    if (hasCalc(seg)) {
                        seg = trimEnclosing(seg);
                        let calc: Undef<string>;
                        switch (transform[i - 1].trim()) {
                            case 'matrix':
                            case 'matrix3d':
                                calc = calculateVarAsString(element, seg, { unitType: CSS_UNIT.DECIMAL, supportPercent: false });
                                break;
                            case 'scaleX':
                            case 'scaleY':
                            case 'scaleZ': {
                                const result = calculateVar(element, seg, { unitType: CSS_UNIT.DECIMAL, min: 0, supportPercent: false });
                                if (!isNaN(result)) {
                                    calc = result.toString();
                                }
                                break;
                            }
                            case 'scale':
                            case 'scale3d':
                                calc = calculateVarAsString(element, seg, { unitType: CSS_UNIT.DECIMAL, min: 0, supportPercent: false });
                                break;
                            case 'translateX':
                                calc = formatVar(calculateVar(element, seg, { dimension: 'width', boundingBox, parent: true }));
                                break;
                            case 'translateY':
                                calc = formatVar(calculateVar(element, seg, { dimension: 'height', boundingBox, parent: true }));
                                break;
                            case 'translateZ':
                            case 'perspective':
                                calc = formatVar(calculateVar(element, seg, { supportPercent: false }));
                                break;
                            case 'translate':
                            case 'translate3d':
                                calc = calculateVarAsString(element, seg, { dimension: ['width', 'height'], boundingBox, parent: true });
                                break;
                            case 'skew':
                            case 'rotate':
                                calc = calculateVarAsString(element, seg, { unitType: CSS_UNIT.ANGLE, supportPercent: false });
                                break;
                            case 'skewX':
                            case 'skewY':
                            case 'rotateX':
                            case 'rotateY':
                            case 'rotateZ': {
                                const result = calculateVar(element, seg, { unitType: CSS_UNIT.ANGLE, supportPercent: false });
                                if (!isNaN(result)) {
                                    calc = result + 'deg';
                                }
                                break;
                            }
                            case 'rotate3d': {
                                const component = seg.split(XML.SEPARATOR);
                                const q = component.length;
                                if (q === 3 || q === 4) {
                                    calc = '';
                                    for (let j = 0; j < q; j++) {
                                        let rotate = component[j];
                                        if (isCalc(rotate)) {
                                            const result = calculateVar(element, rotate, { unitType: j === 3 ? CSS_UNIT.ANGLE : CSS_UNIT.DECIMAL, supportPercent: false });
                                            if (!isNaN(result)) {
                                                rotate = result + (j === 3 ? 'deg' : '');
                                            }
                                            else {
                                                return '';
                                            }
                                        }
                                        calc += (calc !== '' ? ', ' : '') + rotate;
                                    }
                                }
                                break;
                            }
                        }
                        if (calc) {
                            transform[i] = `(${calc})`;
                        }
                        else {
                            return '';
                        }
                    }
                }
                return transform.join('');
            }
            return value;
        }
        case 'backgroundImage':
        case 'borderImageSource':
        case 'maskImage': {
            value = value.trim();
            const image = splitEnclosing(value);
            const length = image.length;
            if (length > 1) {
                for (let i = 1; i < length; i++) {
                    const color = image[i];
                    if (isColor(color) && hasCalc(color)) {
                        const component = splitEnclosing(trimEnclosing(color));
                        const q = component.length;
                        for (let j = 1; j < q; j++) {
                            if (hasCalc(component[j])) {
                                const previous = component[j - 1];
                                if (isColor(previous)) {
                                    const name = previous.split(CHAR.SPACE).pop() as string;
                                    const segment = calculateColor(element, name + component[j]);
                                    if (segment !== '') {
                                        component[j] = segment.replace(name, '');
                                        continue;
                                    }
                                }
                                return '';
                            }
                        }
                        image[i] = `(${component.join('')})`;
                    }
                }
                return image.join('');
            }
            return value;
        }
        case 'borderColor':
        case 'scrollbarColor': {
            const result: string[] = [];
            for (const color of value.trim().split(XML.SEPARATOR)) {
                const segment = calculateColor(element, color);
                if (segment !== '') {
                    result.push(segment);
                }
                else {
                    return '';
                }
            }
            return result.join(', ');
        }
        case 'boxShadow':
        case 'textShadow':
            return calculateVarAsString(element, value, { min: 0, supportPercent: false, separator: ',' });
        case 'backgroundSize':
        case 'maskPosition':
        case 'maskSize':
            return calculateVarAsString(element, value, { dimension: ['width', 'height'], boundingBox, min: attr !== 'maskPosition' ? 0 : undefined, parent: false, separator: ',' });
        case 'animation':
        case 'animationDelay':
        case 'animationDuration':
        case 'transition':
        case 'transitionDelay':
        case 'transitionDuration':
            return calculateVarAsString(element, value, { unitType: CSS_UNIT.TIME, min: 0, supportPercent: false, roundValue: true, separator: ',' });
        case 'columns':
            return calculateGeneric(element, value, CSS_UNIT.INTEGER, 1, boundingBox);
        case 'borderImageSlice':
        case 'flex':
        case 'font':
            return calculateGeneric(element, value, CSS_UNIT.DECIMAL, 0, boundingBox);
        case 'backgroundPosition': {
            const result: string[] = [];
            for (const position of value.split(XML.SEPARATOR)) {
                const segment = calculatePosition(element, position, boundingBox);
                if (segment !== '') {
                    result.push(segment);
                }
                else {
                    return '';
                }
            }
            return result.join(', ');
        }
        case 'border':
        case 'borderBottom':
        case 'borderLeft':
        case 'borderRight':
        case 'borderTop':
        case 'outline': {
            value = value.trim();
            const border = splitEnclosing(value);
            const length = border.length;
            if (length > 1) {
                for (let i = 1; i < length; i++) {
                    const previous = border[i - 1].trim();
                    let seg = border[i];
                    if (previous === 'calc') {
                        border[i - 1] = '';
                        seg = formatVar(calculateVar(element, `calc${seg}`, { min: 0, supportPercent: false }));
                    }
                    else if (isColor(previous)) {
                        const partial = previous.split(CHAR.SPACE);
                        seg = calculateColor(element, partial.pop() + seg);
                        border[i - 1] = partial.join(' ');
                    }
                    else {
                        continue;
                    }
                    if (seg !== '') {
                        border[i] = seg;
                    }
                    else {
                        return '';
                    }
                }
                return border.join(' ');
            }
            return value;
        }
        case 'animationTimingFunction':
        case 'transitionTimingFunction': {
            value = value.trim();
            const timingFunction = splitEnclosing(value);
            const length = timingFunction.length;
            if (length > 1) {
                for (let i = 1; i < length; i++) {
                    let seg = timingFunction[i];
                    if (hasCalc(seg)) {
                        const name = timingFunction[i - 1].trim();
                        seg = trimEnclosing(seg);
                        let calc: Undef<string>;
                        if (/cubic-bezier$/.test(name)) {
                            const cubic = seg.split(XML.SEPARATOR);
                            const q = cubic.length;
                            if (q === 4) {
                                calc = '';
                                const options: CalculateVarOptions = { unitType: CSS_UNIT.DECIMAL, supportPercent: false };
                                for (let j = 0; j < q; j++) {
                                    let bezier = cubic[j];
                                    if (isCalc(bezier)) {
                                        if (j % 2 === 0) {
                                            options.min = 0;
                                            options.max = 1;
                                        }
                                        else {
                                            options.min = undefined;
                                            options.max = undefined;
                                        }
                                        const p = calculateVar(element, bezier, options);
                                        if (!isNaN(p)) {
                                            bezier = p.toString();
                                        }
                                        else {
                                            return '';
                                        }
                                    }
                                    calc += (calc !== '' ? ', ' : '') + bezier;
                                }
                            }
                        }
                        else if (/steps$/.test(name)) {
                            calc = calculateVarAsString(element, seg, { unitType: CSS_UNIT.INTEGER, min: 1 });
                        }
                        if (calc) {
                            timingFunction[i] = `(${calc})`;
                        }
                        else {
                            return '';
                        }
                    }
                }
                return timingFunction.join('');
            }
            return value;
        }
        case 'clip':
            return isAbsolutePosition(getStyle(element).position) ? calculateVarAsString(element, value, { supportPercent: false }) : '';
        case 'clipPath':
        case 'offsetPath':
        case 'shapeOutside': {
            value = value.trim();
            const path = splitEnclosing(value);
            const length = path.length;
            if (length === 2) {
                const name = path[0].trim();
                switch (name) {
                    case 'url':
                    case 'path':
                        return !hasCalc(path[1]) ? value : '';
                    case 'linear-gradient':
                    case 'repeating-linear-gradient':
                    case 'radial-gradient':
                    case 'repeating-radial-gradient':
                    case 'conic-gradient':
                        return calculateStyle(element, 'backgroundImage', value, boundingBox);
                }
                let shape = path[1].trim();
                shape = trimEnclosing(shape);
                switch (name) {
                    case 'circle':
                    case 'ellipse': {
                        const result: string[] = [];
                        let [radius, position] = shape.split(/\s+at\s+/);
                        if (hasCalc(radius)) {
                            const options: CalculateVarAsStringOptions = { boundingBox, min: 0, parent: true };
                            if (name === 'circle') {
                                if (radius.includes('%')) {
                                    if (boundingBox) {
                                        const { width, height } = boundingBox;
                                        options.boundingSize = Math.min(width, height);
                                    }
                                    else {
                                        const parentElement = element.parentElement;
                                        if (parentElement) {
                                            const { width, height } = parentElement.getBoundingClientRect();
                                            const style = getStyle(parentElement);
                                            options.boundingSize = Math.max(0, Math.min(width - getContentBoxWidth(style), height - getContentBoxHeight(style)));
                                        }
                                        else {
                                            return '';
                                        }
                                    }
                                }
                            }
                            else {
                                options.dimension = ['width', 'height'];
                            }
                            radius = calculateVarAsString(element, radius, options);
                            if (radius !== '') {
                                result.push(radius);
                            }
                            else {
                                return '';
                            }
                        }
                        else if (radius) {
                            result.push(radius);
                        }
                        if (hasCalc(position)) {
                            position = calculateVarAsString(element, position, { dimension: ['width', 'height'], boundingBox, parent: true });
                            if (position !== '') {
                                result.push(position);
                            }
                            else {
                                return '';
                            }
                        }
                        else if (position) {
                            result.push(position);
                        }
                        shape = result.join(' at ');
                        break;
                    }
                    case 'inset':
                        shape = calculateVarAsString(element, shape, { dimension: ['height', 'width', 'height', 'width', 'width'], boundingBox, checkUnit: true });
                        break;
                    case 'polygon': {
                        const result: string[] = [];
                        for (let points of shape.split(XML.SEPARATOR)) {
                            if (hasCalc(points)) {
                                points = calculateVarAsString(element, points, { dimension: ['width', 'height'], boundingBox, parent: true });
                                if (points !== '') {
                                    result.push(points);
                                }
                                else {
                                    return '';
                                }
                            }
                            else {
                                result.push(points);
                            }
                        }
                        shape = result.join(', ');
                        break;
                    }
                }
                if (shape !== '') {
                    return `${name}(${shape})`;
                }
            }
            return value;
        }
        case 'grid': {
            let [row, column] = value.trim().split(REGEX_DIVIDER);
            if (hasCalc(row)) {
                const result = calculateStyle(element, 'gridTemplateRows', row, boundingBox);
                if (result !== '') {
                    row = result;
                }
                else {
                    return '';
                }
            }
            if (hasCalc(column)) {
                const result = calculateStyle(element, 'gridTemplateColumns', column, boundingBox);
                if (result !== '') {
                    column = result;
                }
                else {
                    return '';
                }
            }
            return row + (column ? ` / ${column}` : '');
        }
        case 'offset': {
            let [offset, anchor] = value.trim().split(REGEX_DIVIDER);
            if (hasCalc(offset)) {
                const url = splitEnclosing(offset.trim());
                const length = url.length;
                if (length >= 2) {
                    offset = url[0] + url[1];
                    if (hasCalc(offset)) {
                        offset = calculateStyle(element, 'offsetPath', offset, boundingBox);
                        if (offset === '') {
                            return '';
                        }
                    }
                    if (length > 2) {
                        let distance = url.slice(2).join('');
                        if (hasCalc(offset)) {
                            distance = calculateStyle(element, REGEX_LENGTH.test(distance) ? 'offsetDistance' : 'offsetRotate', distance, boundingBox);
                            if (distance === '') {
                                return '';
                            }
                        }
                        offset += ' ' + distance;
                    }
                }
                else {
                    return '';
                }
            }
            if (hasCalc(anchor)) {
                const result = calculateStyle(element, 'offsetAnchor', anchor, boundingBox);
                if (result !== '') {
                    anchor = result;
                }
                else {
                    return '';
                }
            }
            return offset + (anchor ? ` / ${anchor}` : '');
        }
        case 'borderImage': {
            const match = /([a-z-]+\(.+?\))\s*([^/]+)(?:\s*\/\s*)?(.+)?/.exec(value.trim());
            if (match) {
                let slice = match[2].trim();
                slice = hasCalc(slice) ? calculateStyle(element, 'borderImageSlice', slice, boundingBox) : slice;
                if (slice !== '') {
                    let width: Undef<string>;
                    let outset: Undef<string>;
                    if (match[3]) {
                        [width, outset] = match[3].trim().split(REGEX_DIVIDER);
                        if (hasCalc(width)) {
                            const result = calculateStyle(element, 'borderImageWidth', width, boundingBox);
                            if (result !== '') {
                                width = result;
                            }
                            else {
                                return '';
                            }
                        }
                        if (hasCalc(outset)) {
                            const result = calculateStyle(element, 'borderImageOutset', outset, boundingBox);
                            if (result !== '') {
                                outset = result;
                            }
                            else {
                                return '';
                            }
                        }
                    }
                    return match[1] + ' ' + slice + (width ? ` / ${width}` : '') + (outset ? ` / ${outset}` : '');
                }
            }
            return '';
        }
        case 'background':
        case 'gridTemplate':
            break;
        default:
            if (/Color$/.test(attr)) {
                return calculateColor(element, value.trim());
            }
            else {
                const alias = checkWritingMode(attr, getStyle(element).writingMode);
                if (alias !== '') {
                    return calculateStyle(element, alias, value, boundingBox);
                }
            }
    }
    return '';
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
    else if (hasCalc(value)) {
        value = calculateStyle(element, attr, value);
        if (value === '' && style) {
            value = style[attr];
        }
    }
    else if (isCustomProperty(value)) {
        value = parseVar(element, value);
        if (value === '' && style) {
            value = style[attr];
        }
    }
    return value || '';
}

export function getKeyframeRules(): ObjectMap<KeyframesData> {
    const result: ObjectMap<KeyframesData> = {};
    violation: {
        const styleSheets = document.styleSheets;
        const length = styleSheets.length;
        for (let i = 0; i < length; i++) {
            const styleSheet = <CSSStyleSheet> styleSheets[i];
            const cssRules = styleSheet.cssRules;
            if (cssRules) {
                const q = cssRules.length;
                for (let j = 0; j < q; j++) {
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
    const result: KeyframesData = {};
    for (let i = 0; i < length; i++) {
        const item = rules[i];
        const match = REGEX_KEYFRAME.exec(item.cssText);
        if (match) {
            for (let percent of (item['keyText'] || match[1]).trim().split(XML.SEPARATOR)) {
                switch (percent) {
                    case 'from':
                        percent = '0%';
                        break;
                    case 'to':
                        percent = '100%';
                        break;
                }
                const keyframe: StringMap = {};
                for (const property of match[2].split(XML.DELIMITER)) {
                    const index = property.indexOf(':');
                    if (index !== -1) {
                        const value = property.substring(index + 1).trim();
                        if (value !== '') {
                            const attr = property.substring(0, index).trim();
                            keyframe[attr] = value;
                        }
                    }
                }
                result[percent] = keyframe;
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
                let match: Null<RegExpExecArray>;
                while ((match = REGEX_MEDIARULE.exec(value)) !== null) {
                    const negate = match[1] === 'not';
                    let valid = false;
                    let condition: Null<RegExpExecArray>;
                    while ((condition = REGEX_MEDIACONDITION.exec(match[2])) !== null) {
                        const attr = condition[1];
                        let operation = condition[2];
                        const rule = condition[3];
                        if (/^min/.test(attr)) {
                            operation = '>=';
                        }
                        else if (/^max/.test(attr)) {
                            operation = '<=';
                        }
                        switch (attr) {
                            case 'aspect-ratio':
                            case 'min-aspect-ratio':
                            case 'max-aspect-ratio':
                                if (rule) {
                                    const [width, height] = replaceMap(rule.split('/'), (ratio: string) => parseInt(ratio));
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
                                valid = rule === 'portrait' && window.innerWidth <= window.innerHeight || rule === 'landscape' && window.innerWidth > window.innerHeight;
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
        if (value) {
            break;
        }
        current = current.parentElement;
    }
    return value;
}

export function parseVar(element: CSSElement, value: string) {
    const style = getStyle(element);
    let match: Null<RegExpMatchArray>;
    while ((match = CSS.VAR.exec(value)) !== null) {
        let customValue = style.getPropertyValue(match[1]).trim();
        const fallback = match[2];
        if (fallback && (customValue === '' || isLength(fallback, true) && !isLength(customValue, true) || isNumber(fallback) && !isNumber(customValue) || parseColor(fallback) && !parseColor(customValue))) {
            customValue = fallback;
        }
        if (customValue) {
            value = value.replace(match[0], customValue).trim();
        }
        else {
            return '';
        }
    }
    return value;
}

export function calculateVarAsString(element: CSSElement, value: string, options?: CalculateVarAsStringOptions) {
    value = value.trim();
    const optionsVar = <CalculateVarOptions> Object.assign({}, options);
    let orderedSize: Undef<number[]>;
    let dimension: Undef<DimensionAttr[]>;
    let separator: Undef<string>;
    let unitType: Undef<number>;
    let checkUnit: Undef<boolean>;
    if (options) {
        if (Array.isArray(options.dimension)) {
            dimension = options.dimension;
        }
        if (Array.isArray(options.orderedSize)) {
            orderedSize = options.orderedSize;
        }
        ({ separator, unitType, checkUnit } = options);
    }
    let unit: string;
    switch (unitType) {
        case CSS_UNIT.INTEGER:
        case CSS_UNIT.DECIMAL:
            unit = '';
            break;
        case CSS_UNIT.PERCENT:
            unit = '%';
            break;
        case CSS_UNIT.TIME:
            unit = 'ms';
            break;
        case CSS_UNIT.ANGLE:
            unit = 'deg';
            break;
        default:
            unit = 'px';
            unitType = CSS_UNIT.LENGTH;
            break;
    }
    const result: string[] = [];
    const segments = separator ? value.split(separator) : [value];
    for (let seg of segments) {
        seg = seg.trim();
        if (seg !== '') {
            const calc = splitEnclosing(seg, 'calc');
            const length = calc.length;
            if (length) {
                let partial = '';
                for (let i = 0, j = 0; i < length; i++) {
                    let output = calc[i];
                    if (isCalc(output)) {
                        if (orderedSize && orderedSize[j + 1] !== undefined) {
                            optionsVar.boundingSize = orderedSize[j++];
                        }
                        else if (dimension) {
                            optionsVar.dimension = dimension[j++];
                            optionsVar.boundingSize = undefined;
                        }
                        const k = calculateVar(element, output, optionsVar);
                        if (!isNaN(k)) {
                            partial += k + unit;
                        }
                        else {
                            return '';
                        }
                    }
                    else {
                        partial += output;
                        if (dimension) {
                            output = output.trim();
                            if (output !== '' && (!checkUnit || unitType === CSS_UNIT.LENGTH && (isLength(output, true) || output === 'auto'))) {
                                j++;
                            }
                        }
                    }
                }
                result.push(partial);
            }
            else {
                return '';
            }
        }
    }
    return result.length === 1 ? result[0] : result.join(separator === ' ' ? ' ' : (separator ? separator + ' ' : ''));
}

export function calculateVar(element: CSSElement, value: string, options: CalculateVarOptions = {}) {
    const output = parseVar(element, value);
    if (output) {
        const { precision, unitType } = options;
        if (value.includes('%')) {
            if (options.supportPercent === false || unitType === CSS_UNIT.INTEGER) {
                return NaN;
            }
            if (options.boundingSize === undefined) {
                const { dimension, boundingBox } = options;
                if (dimension) {
                    if (boundingBox) {
                        options.boundingSize = boundingBox[dimension];
                    }
                    else {
                        let boundingElement: Null<Element>;
                        let offsetPadding = 0;
                        if (options.parent === false) {
                            boundingElement = element;
                        }
                        else {
                            boundingElement = element.parentElement;
                            if (boundingElement instanceof HTMLElement) {
                                let style: CSSStyleDeclaration | undefined;
                                if (isAbsolutePosition(getStyle(element).position)) {
                                    do {
                                        style = getStyle(boundingElement);
                                        if (boundingElement === document.body) {
                                            break;
                                        }
                                        switch (style.position) {
                                            case 'static':
                                            case 'initial':
                                            case 'unset':
                                                boundingElement = boundingElement.parentElement;
                                                continue;
                                        }
                                        break;
                                    }
                                    while (boundingElement);
                                }
                                else {
                                    style = getStyle(boundingElement);
                                }
                                if (style) {
                                    offsetPadding = dimension === 'width' ? getContentBoxWidth(style) : getContentBoxHeight(style);
                                }
                            }
                            else if (element instanceof SVGElement) {
                                if (options.parent !== true) {
                                    boundingElement = element;
                                }
                            }
                            else {
                                boundingElement = null;
                            }
                        }
                        if (boundingElement) {
                            options.boundingSize = Math.max(0, boundingElement.getBoundingClientRect()[dimension] - offsetPadding);
                        }
                    }
                }
            }
        }
        else if (options.supportPercent) {
            return NaN;
        }
        if ((!unitType || unitType === CSS_UNIT.LENGTH) && /\d(em|ch)/.test(value) && options.fontSize === undefined) {
            options.fontSize = getFontSize(element);
        }
        let result = calculate(output, options);
        if (precision !== undefined) {
            result = precision === 0 ? Math.floor(result) : parseFloat(truncate(result, precision));
        }
        else if (options.roundValue) {
            result = Math.round(result);
        }
        return result;
    }
    return NaN;
}

export function getBackgroundPosition(value: string, dimension: Dimension, options: BackgroundPositionOptions = {}) {
    const { fontSize, imageDimension, imageSize, screenDimension } = options;
    const orientation = value === 'center' ? ['center', 'center'] : value.split(CHAR.SPACE);
    const { width, height } = dimension;
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
    const setImageOffset = (position: string, horizontal: boolean, direction: string, directionAsPercent: string) => {
        if (imageDimension && !isLength(position)) {
            let offset = result[directionAsPercent];
            if (imageSize && imageSize !== 'auto' && imageSize !== 'initial') {
                const [sizeW, sizeH] = imageSize.split(CHAR.SPACE);
                if (horizontal) {
                    let imageWidth = width;
                    if (isLength(sizeW, true)) {
                        if (isPercent(sizeW)) {
                            imageWidth *= parseFloat(sizeW) / 100;
                        }
                        else {
                            const length = parseUnit(sizeW, fontSize, screenDimension);
                            if (length) {
                                imageWidth = length;
                            }
                        }
                    }
                    else if (sizeH) {
                        let percent = 1;
                        if (isPercent(sizeH)) {
                            percent = ((parseFloat(sizeH) / 100) * height) / imageDimension.height;
                        }
                        else if (isLength(sizeH)) {
                            const length = parseUnit(sizeH, fontSize, screenDimension);
                            if (length) {
                                percent = length / imageDimension.height;
                            }
                        }
                        imageWidth = percent * imageDimension.width;
                    }
                    offset *= imageWidth;
                }
                else {
                    let imageHeight = height;
                    if (isLength(sizeH, true)) {
                        if (isPercent(sizeH)) {
                            imageHeight *= parseFloat(sizeH) / 100;
                        }
                        else {
                            const length = parseUnit(sizeH, fontSize, screenDimension);
                            if (length) {
                                imageHeight = length;
                            }
                        }
                    }
                    else if (sizeW) {
                        let percent = 1;
                        if (isPercent(sizeW)) {
                            percent = ((parseFloat(sizeW) / 100) * width) / imageDimension.width;
                        }
                        else if (isLength(sizeW)) {
                            const length = parseUnit(sizeW, fontSize, screenDimension);
                            if (length) {
                                percent = length / imageDimension.width;
                            }
                        }
                        imageHeight = percent * imageDimension.height;
                    }
                    offset *= imageHeight;
                }
            }
            else {
                offset *= horizontal ? imageDimension.width : imageDimension.height;
            }
            result[direction] -= offset;
        }
    };
    if (orientation.length === 2) {
        for (let i = 0; i < 2; i++) {
            let position = orientation[i];
            const horizontal = i === 0;
            const [direction, offsetParent] = horizontal ? ['left', width] : ['top', height];
            const directionAsPercent = direction + 'AsPercent';
            switch (position) {
                case '0%':
                    if (horizontal) {
                        position = 'left';
                    }
                case 'left':
                case 'top':
                    break;
                case '100%':
                    if (horizontal) {
                        position = 'right';
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
                default: {
                    const percent = convertPercent(position, offsetParent, fontSize, screenDimension);
                    if (percent > 1) {
                        orientation[i] = '100%';
                        position = horizontal ? 'right' : 'bottom';
                        result[position] = convertLength(formatPercent(percent - 1), offsetParent, fontSize, screenDimension) * -1;
                    }
                    else {
                        result[direction] = convertLength(position, offsetParent, fontSize, screenDimension);
                    }
                    result[directionAsPercent] = percent;
                    break;
                }
            }
            if (horizontal) {
                result.horizontal = position;
            }
            else {
                result.vertical = position;
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
                    const location = convertLength(position, width, fontSize, screenDimension);
                    const locationAsPercent = convertPercent(position, width, fontSize, screenDimension);
                    if (result.horizontal === 'right') {
                        result.right = location;
                        result.rightAsPercent = locationAsPercent;
                        setImageOffset(position, true, 'right', 'rightAsPercent');
                        result.left = width - location;
                        result.leftAsPercent = 1 - locationAsPercent;
                    }
                    else {
                        if (locationAsPercent > 1) {
                            const percent = 1 - locationAsPercent;
                            result.horizontal = 'right';
                            result.right = convertLength(formatPercent(percent), width, fontSize, screenDimension);
                            result.rightAsPercent = percent;
                            setImageOffset(position, true, 'right', 'rightAsPercent');
                        }
                        result.left = location;
                        result.leftAsPercent = locationAsPercent;
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
                    const location = convertLength(position, height, fontSize, screenDimension);
                    const locationAsPercent = convertPercent(position, height, fontSize, screenDimension);
                    if (result.vertical === 'bottom') {
                        result.bottom = location;
                        result.bottomAsPercent = locationAsPercent;
                        setImageOffset(position, false, 'bottom', 'bottomAsPercent');
                        result.top = height - location;
                        result.topAsPercent = 1 - locationAsPercent;
                    }
                    else {
                        if (locationAsPercent > 1) {
                            const percent = 1 - locationAsPercent;
                            result.horizontal = 'bottom';
                            result.bottom = convertLength(formatPercent(percent), height, fontSize, screenDimension);
                            result.bottomAsPercent = percent;
                            setImageOffset(position, false, 'bottom', 'bottomAsPercent');
                        }
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
        iterateArray(parentElement.children, (item: HTMLSourceElement) => {
            if (item.tagName === 'SOURCE') {
                const type = item.type.trim();
                const media = item.media.trim();
                const value = item.srcset.trim();
                if (value !== '' && (media !== '' && validMediaRule(media) || type !== '' && mimeType?.includes((type.split('/').pop() as string).toLowerCase()))) {
                    srcset = value;
                    sizes = item.sizes;
                    return true;
                }
            }
            return;
        });
    }
    if (srcset !== '') {
        for (const value of srcset.trim().split(XML.SEPARATOR)) {
            const match = REGEX_SRCSET.exec(value);
            if (match) {
                let width = 0;
                let pixelRatio = 0;
                switch (match[3]) {
                    case 'w':
                        width = convertFloat(match[2]);
                        break;
                    case 'x':
                        pixelRatio = convertFloat(match[2]);
                        break;
                    default:
                        pixelRatio = 1;
                        break;
                }
                result.push({ src: resolvePath(match[1].split(CHAR.SPACE)[0]), pixelRatio, width });
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
                if (widthA !== widthB && widthA > 0 && widthB > 0) {
                    return widthA < widthB ? -1 : 1;
                }
            }
            return 0;
        });
    }
    if (result.length === 0) {
        result.push({ src: element.src, pixelRatio: 1, width: 0 });
    }
    else if (result.length > 1 && isString(sizes)) {
        let width = NaN;
        for (const value of sizes.trim().split(XML.SEPARATOR)) {
            let match = REGEX_WIDTH.exec(value);
            if (match) {
                const ruleA = match[2] ? validMediaRule(match[2]) : undefined;
                const ruleB = match[6] ? validMediaRule(match[6]) : undefined;
                switch (match[5]) {
                    case 'and':
                        if (!ruleA || !ruleB) {
                            continue;
                        }
                        break;
                    case 'or':
                        if (!ruleA && !ruleB) {
                            continue;
                        }
                        break;
                    case 'not':
                        if (ruleA !== undefined || ruleB) {
                            continue;
                        }
                        break;
                    default:
                        if (ruleA === false || ruleB !== undefined) {
                            continue;
                        }
                        break;
                }
                const unit = match[9];
                if (unit) {
                    match = CSS.CALC.exec(unit);
                    if (match) {
                        width = calculate(match[1], match[1].includes('%') ? { boundingSize: getBoundingWidth(element) } : undefined);
                    }
                    else if (isPercent(unit)) {
                        width = parseFloat(unit) / 100 * getBoundingWidth(element);
                    }
                    else if (isLength(unit)) {
                        width = parseUnit(unit);
                    }
                }
                if (!isNaN(width)) {
                    break;
                }
            }
        }
        if (!isNaN(width)) {
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

export function convertListStyle(name: string, value: number, valueAsDefault?: boolean) {
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
    let result = convertFloat(value);
    switch (unit) {
        case 'rad':
            result *= 180 / Math.PI;
            break;
        case 'grad':
            result /= 400;
        case 'turn':
            result *= 360;
            break;
    }
    return result;
}

export function convertTime(value: string, unit = 's') {
    let result = convertFloat(value);
    switch (unit) {
        case 's':
            result *= 1000;
            break;
    }
    return result;
}

export function convertPX(value: string, fontSize?: number) {
    return value ? parseUnit(value, fontSize) + 'px' : '0px';
}

export function calculate(value: string, options: CalculateOptions = {}) {
    value = value.trim();
    if (value === '') {
        return NaN;
    }
    const { boundingSize, min, max, unitType, fontSize } = options;
    let length = value.length;
    if (value.charAt(0) !== '(' || value.charAt(length - 1) !== ')') {
        value = `(${value})`;
        length += 2;
    }
    let opened = 0;
    const opening: boolean[] = [];
    const closing: number[] = [];
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
                    let operand: Undef<string>;
                    let operator: Undef<string>;
                    const checkNumber = () => {
                        if (operand) {
                            switch (operator) {
                                case '+':
                                case '-':
                                    if (isNumber(operand)) {
                                        return false;
                                    }
                                    break;
                                case '*':
                                case '/':
                                    if (!isNumber(operand)) {
                                        return false;
                                    }
                                    break;
                            }
                        }
                        return true;
                    };
                    const checkOperator = () => {
                        if (operand) {
                            switch (operator) {
                                case '+':
                                case '-':
                                    return false;
                            }
                        }
                        return true;
                    };
                    const seg: number[] = [];
                    const evaluate: string[] = [];
                    let found = false;
                    for (let partial of value.substring(j + 1, closing[i]).split(REGEX_OPERATOR)) {
                        partial = partial.trim();
                        switch (partial) {
                            case '+':
                            case '-':
                            case '*':
                            case '/':
                                evaluate.push(partial);
                                operator = partial;
                                break;
                            default: {
                                const match = /\s*{(\d+)}\s*/.exec(partial);
                                if (match) {
                                    switch (unitType) {
                                        case CSS_UNIT.INTEGER:
                                        case CSS_UNIT.DECIMAL:
                                            break;
                                        default:
                                            if (!checkNumber()) {
                                                return NaN;
                                            }
                                            break;
                                    }
                                    const unit = equated[parseInt(match[1])];
                                    seg.push(unit);
                                    operand = unit.toString();
                                    found = true;
                                }
                                else {
                                    switch (unitType) {
                                        case CSS_UNIT.PERCENT:
                                            if (isNumber(partial)) {
                                                if (!checkOperator()) {
                                                    return NaN;
                                                }
                                                seg.push(parseFloat(partial));
                                            }
                                            else if (isPercent(partial)) {
                                                if (!checkNumber()) {
                                                    return NaN;
                                                }
                                                seg.push(parseFloat(partial));
                                                found = true;
                                            }
                                            else {
                                                return NaN;
                                            }
                                            break;
                                        case CSS_UNIT.TIME:
                                            if (isNumber(partial)) {
                                                if (!checkOperator()) {
                                                    return NaN;
                                                }
                                                seg.push(parseFloat(partial));
                                            }
                                            else if (isTime(partial)) {
                                                if (!checkNumber()) {
                                                    return NaN;
                                                }
                                                seg.push(parseTime(partial));
                                                found = true;
                                            }
                                            else {
                                                return NaN;
                                            }
                                            break;
                                        case CSS_UNIT.ANGLE:
                                            if (isNumber(partial)) {
                                                if (!checkOperator()) {
                                                    return NaN;
                                                }
                                                seg.push(parseFloat(partial));
                                            }
                                            else if (isAngle(partial)) {
                                                if (!checkNumber()) {
                                                    return NaN;
                                                }
                                                seg.push(parseAngle(partial));
                                                found = true;
                                            }
                                            else {
                                                return NaN;
                                            }
                                            break;
                                        case CSS_UNIT.INTEGER:
                                            if (REGEX_INTEGER.test(partial)) {
                                                seg.push(parseInt(partial));
                                                found = true;
                                            }
                                            else {
                                                return NaN;
                                            }
                                            break;
                                        case CSS_UNIT.DECIMAL:
                                            if (isNumber(partial)) {
                                                seg.push(parseFloat(partial));
                                                found = true;
                                            }
                                            else if (isPercent(partial) && boundingSize !== undefined && !isNaN(boundingSize)) {
                                                seg.push(parseFloat(partial) / 100 * boundingSize);
                                            }
                                            else {
                                                return NaN;
                                            }
                                            break;
                                        default:
                                            if (isNumber(partial)) {
                                                if (!checkOperator()) {
                                                    return NaN;
                                                }
                                                seg.push(parseFloat(partial));
                                            }
                                            else if (isLength(partial)) {
                                                if (!checkNumber()) {
                                                    return NaN;
                                                }
                                                seg.push(parseUnit(partial, fontSize));
                                                found = true;
                                            }
                                            else if (isPercent(partial) && boundingSize !== undefined && !isNaN(boundingSize)) {
                                                if (!checkNumber()) {
                                                    return NaN;
                                                }
                                                seg.push(parseFloat(partial) / 100 * boundingSize);
                                                found = true;
                                            }
                                            else {
                                                return NaN;
                                            }
                                            break;
                                    }
                                    operand = partial;
                                }
                                break;
                            }
                        }
                    }
                    if (!found || seg.length !== evaluate.length + 1) {
                        return NaN;
                    }
                    for (let k = 0; k < evaluate.length; k++) {
                        if (evaluate[k] === '/') {
                            if (Math.abs(seg[k + 1]) !== 0) {
                                seg.splice(k, 2, seg[k] / seg[k + 1]);
                                evaluate.splice(k--, 1);
                            }
                            else {
                                return NaN;
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
                        seg.splice(k, 2, seg[k] + seg[k + 1] * (evaluate[k] === '-' ? -1 : 1));
                        evaluate.splice(k--, 1);
                    }
                    if (seg.length === 1) {
                        if (closing.length === 1) {
                            const result = seg[0];
                            if (min !== undefined && result < min || max !== undefined && result > max) {
                                return NaN;
                            }
                            return result;
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
                        return NaN;
                    }
                }
            }
        }
    }
    return NaN;
}

export function parseUnit(value: string, fontSize?: number, screenDimension?: Dimension) {
    const match = UNIT.LENGTH.exec(value);
    if (match) {
        let result = parseFloat(match[1]);
        switch (match[2]) {
            case 'px':
            case undefined:
                return result;
            case 'em':
            case 'ch':
                result *= fontSize ?? (getFontSize(document.body) || 16);
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
                result *= getInnerWidth(screenDimension) / 100;
                break;
            case 'vh':
                result *= getInnerHeight(screenDimension) / 100;
                break;
            case 'vmin':
                result *= Math.min(getInnerWidth(screenDimension), getInnerHeight(screenDimension)) / 100;
                break;
            case 'vmax':
                result *= Math.max(getInnerWidth(screenDimension), getInnerHeight(screenDimension)) / 100;
                break;
        }
        return result;
    }
    return 0;
}

export function parseAngle(value: string) {
    const match = CSS.ANGLE.exec(value);
    return match ? convertAngle(match[1], match[2]) : 0;
}

export function parseTime(value: string) {
    const match = CSS.TIME.exec(value);
    return match ? convertTime(match[1], match[2]) : 0;
}

export function formatPX(value: number) {
    return Math.round(value) + 'px';
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

export function isLength(value: string, percent?: boolean) {
    return !percent ? UNIT.LENGTH.test(value) : UNIT.LENGTH_PERCENTAGE.test(value);
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

export function isTime(value: string) {
    return CSS.TIME.test(value);
}

export function isPercent(value: string) {
    return UNIT.PERCENT.test(value);
}

export function hasCalc(value: string) {
    return REGEX_CALC.test(value);
}