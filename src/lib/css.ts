import { parseColor } from './color';
import { USER_AGENT, getDeviceDPI, isUserAgent } from './client';
import { clamp, truncate } from './math';
import { CSS, STRING, UNIT, XML } from './regex';
import { convertAlpha, convertFloat, convertRoman, isNumber, isString, iterateArray, replaceMap, resolvePath, spliceString, splitEnclosing } from './util';

type KeyframesData = squared.lib.css.KeyframesData;
type BackgroundPositionOptions = squared.lib.css.BackgroundPositionOptions;
type CalculateOptions = squared.lib.css.CalculateOptions;
type CalculateVarOptions = squared.lib.css.CalculateVarOptions;
type CalculateVarAsStringOptions = squared.lib.css.CalculateVarAsStringOptions;

const REGEX_KEYFRAME = /((?:\d+%\s*,?\s*)+|from|to)\s*{\s*(.+?)\s*}/;
const REGEX_MEDIARULE = /(?:(not|only)?\s*(?:all|screen) and )?((?:\([^)]+\)(?: and )?)+),?\s*/g;
const REGEX_MEDIACONDITION = /\(([a-z-]+)\s*(:|<?=?|=?>?)?\s*([\w.%]+)?\)(?: and )?/g;
const REGEX_SRCSET = /^(.*?)\s*(?:(\d*\.?\d*)([xw]))?$/;
const REGEX_CALCULATE = /(\s+[+-]\s+|\s*[*/]\s*)/;
const REGEX_INTEGER = /^-?\d+$/;
const REGEX_CALC = new RegExp(STRING.CSS_CALC);

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

const getInnerWidth = (dimension: Undef<Dimension>) => dimension?.width || window.innerWidth;
const getInnerHeight = (dimension: Undef<Dimension>) => dimension?.height || window.innerHeight;
const convertLength = (value: string, dimension: number, fontSize?: number, screenDimension?: Dimension) => isPercent(value) ? Math.round(dimension * (convertFloat(value) / 100)) : parseUnit(value, fontSize, screenDimension);
const convertPercent = (value: string, dimension: number, fontSize?: number, screenDimension?: Dimension) => isPercent(value) ? parseFloat(value) / 100 : parseUnit(value, fontSize, screenDimension) / dimension;

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
    return element.nodeName.charAt(0) !== '#' ? (element instanceof HTMLElement || element instanceof SVGElement) : false;
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

export function calculateStyle(element: HTMLElement | SVGElement, attr: string, value: string) {
    value = value.trim();
    switch (attr) {
        case 'width':
        case 'minWidth':
        case 'maxWidth':
        case 'left':
        case 'right':
        case 'textIndent':
        case 'columnWidth':
        case 'marginTop':
        case 'marginRight':
        case 'marginBottom':
        case 'marginLeft':
        case 'paddingTop':
        case 'paddingRight':
        case 'paddingBottom':
        case 'paddingLeft':
        case 'columnGap':
        case 'gridColumnGap': {
            const result = calculateVar(element, value, { dimension: 'width', min: 0 });
            return !isNaN(result) ? result + 'px' : '';
        }
        case 'height':
        case 'minHeight':
        case 'maxHeight':
        case 'top':
        case 'bottom':
        case 'verticalAlign':
        case 'rowGap':
        case 'gridRowGap': {
            const result = calculateVar(element, value, { dimension: 'height', min: 0 });
            return !isNaN(result) ? result + 'px' : '';
        }
        case 'gridGap':
            return calculateVarAsString(element, value, { dimension: ['width', 'height'], unitType: CSS_UNIT.LENGTH, min: 0 });
        case 'clip':
            return calculateVarAsString(element, value, { parent: false, dimension: ['height', 'width', 'height', 'width'], unitType: CSS_UNIT.LENGTH, min: 0 });
        case 'backgroundSize':
        case 'maskSize':
            return calculateVarAsString(element, value, { parent: false, dimension: ['width', 'height'], unitType: CSS_UNIT.LENGTH, min: 0, separator: ',' });
        case 'boxShadow':
        case 'textShadow':
            return calculateVarAsString(element, value, { parent: false, dimension: ['width', 'height', 'width'], unitType: CSS_UNIT.LENGTH, min: 0, separator: ',' });
        case 'margin':
        case 'padding':
        case 'outline':
        case 'columnRule':
        case 'borderRadius':
        case 'borderBottomLeftRadius':
        case 'borderBottomRightRadius':
        case 'borderTopLeftRadius':
        case 'borderTopRightRadius':
        case 'borderSpacing':
        case 'borderImageOutset':
        case 'borderImageWidth':
        case 'borderInline':
        case 'borderBlock':
            return calculateVarAsString(element, value, { dimension: 'width', unitType: CSS_UNIT.LENGTH, min: 0 });
        case 'insetInline':
        case 'insetBlock':
            return calculateVarAsString(element, value, { parent: false, dimension: 'width', unitType: CSS_UNIT.LENGTH, min: 0 });
        case 'shapeMargin':
        case 'marginInlineStart':
        case 'marginInlineEnd':
        case 'marginBlockStart':
        case 'marginBlockEnd':
        case 'paddingInlineStart':
        case 'paddingInlineEnd':
        case 'paddingBlockStart':
        case 'paddingBlockEnd':
        case 'insetInlineStart':
        case 'insetInlineEnd':
        case 'insetBlockStart':
        case 'insetBlockEnd':
        case 'borderInlineStart':
        case 'borderInlineEnd':
        case 'borderBlockStart':
        case 'borderBlockEnd': {
            const result = calculateVar(element, value, { parent: false, dimension: 'width', min: 0 });
            return !isNaN(result) ? result + 'px' : '';
        }
        case 'borderImageSlice':
            return calculateVarAsString(element, value, { parent: false, dimension: 'width', roundValue: true, min: 0 });
        case 'inlineSize':
        case 'blockSize':
        case 'minInlineSize':
        case 'minBlocKSize':
        case 'maxInlineSize':
        case 'maxBlocKSize': {
            let boundingSize: Undef<number>;
            if (value.includes('%')) {
                let current: Null<HTMLElement> = <HTMLElement> element;
                while (current && getStyle(current).display === 'block') {
                    current = current.parentElement;
                }
                if (current) {
                    boundingSize = current.getBoundingClientRect()[!getStyle(element).writingMode.includes('vertical') ? 'width' : 'height'];
                }
                else {
                    return '';
                }
            }
            const result = calculateVar(element, value, { boundingSize, min: 0 });
            return !isNaN(result) ? result + 'px' : '';
        }
        case 'gridAutoRows':
        case 'gridTemplateRows':
        case 'gridAutoColumns':
        case 'gridTemplateColumns':
            return calculateVarAsString(element, value, { parent: false, dimension: attr.endsWith('Columns') ? 'width' : 'height', unitType: CSS_UNIT.LENGTH, min: 0 });
        case 'columnCount':
        case 'flexGrow':
        case 'flexShrink':
        case 'fontWeight':
        case 'widows': {
            const result = calculateVar(element, value, { checkPercent: false, unitType: CSS_UNIT.INTEGER, min: 0 });
            return !isNaN(result) ? result.toString() : '';
        }
        case 'fontSizeAdjust':
        case 'animationIterationCount': {
            const result = calculateVar(element, value, { checkPercent: false, unitType: CSS_UNIT.DECIMAL, min: 0 });
            return !isNaN(result) ? result.toString() : '';
        }
        case 'letterSpacing':
        case 'wordSpacing':
        case 'outlineOffset':
        case 'outlineWidth':
        case 'perspective': {
            const result = calculateVar(element, value, { checkPercent: false, min: 0 });
            return !isNaN(result) ? result + 'px' : '';
        }
        case 'fontVariationSettings':
            return calculateVarAsString(element, value, { checkPercent: false, unitType: CSS_UNIT.INTEGER, min: 0 });
        case 'fontStretch':
            return calculateVarAsString(element, value, { checkPercent: false, unitType: CSS_UNIT.PERCENT, min: 0 });
        case 'transition':
        case 'transitionDelay':
        case 'transitionDuration':
        case 'animationDelay':
        case 'animationDuration':
            return calculateVarAsString(element, value, { checkPercent: false, unitType: CSS_UNIT.TIME, roundValue: true, min: 0, separator: ',' });
        case 'fontSize': {
            const parentElement = element.parentElement;
            if (parentElement) {
                const result = calculateVar(element, value, { boundingSize: getFontSize(parentElement), min: 0 });
                return !isNaN(result) ? result.toString() : '';
            }
            break;
        }
        case 'lineHeight': {
            const boundingSize = getFontSize(element);
            if (isNumber(value)) {
                return parseFloat(value) * boundingSize + 'px';
            }
            const result = calculateVar(element, value, { boundingSize, min: 0 });
            return !isNaN(result) ? result.toString() : '';
        }
        case 'tabSize': {
            if (isNumber(value)) {
                const result = parseInt(value);
                return result >= 0 && REGEX_INTEGER.test(value) ? result.toString() : '';
            }
            const result = calculateVar(element, value, { checkPercent: false, min: 0 });
            return !isNaN(result) ? result.toString() : '';
        }
        case 'flexBasis': {
            const parentElement = element.parentElement;
            if (parentElement) {
                const { display, flexDirection } = getStyle(parentElement);
                if (display.includes('flex')) {
                    return calculateVarAsString(element, value, { dimension: flexDirection.includes('column') ? 'height' : 'width', unitType: CSS_UNIT.LENGTH, min: 0 });
                }
            }
            break;
        }
        case 'gridArea':
            return calculateVarAsString(element, value, { checkPercent: false, unitType: CSS_UNIT.INTEGER, min: 1 });
        case 'objectPosition':
            return calculateVarAsString(element, value, { dimension: ['width', 'height'], unitType: CSS_UNIT.LENGTH });
        case 'maskPosition':
            return calculateVarAsString(element, value, { parent: false, dimension: ['width', 'height'], unitType: CSS_UNIT.LENGTH, separator: ',' });
        case 'perspectiveOrigin':
            return calculateVarAsString(element, value, { parent: false, dimension: ['width', 'height'], unitType: CSS_UNIT.LENGTH });
        case 'gridRow':
        case 'gridRowStart':
        case 'gridRowEnd':
        case 'gridColumn':
        case 'gridColumnStart':
        case 'gridColumnEnd':
        case 'counterSet':
        case 'counterReset':
        case 'counterIncrement':
            return calculateVarAsString(element, value, { checkPercent: false, unitType: CSS_UNIT.INTEGER });
        case 'fontStyle':
        case 'offsetRotate':
            return calculateVarAsString(element, value, { checkPercent: false, unitType: CSS_UNIT.ANGLE });
        case 'zIndex': {
            const result = calculateVar(element, value, { checkPercent: false, unitType: CSS_UNIT.INTEGER });
            return !isNaN(result) ? result.toString() : '';
        }
        case 'opacity':
        case 'shapeImageThreshold': {
            const result = calculateVar(element, value, { boundingSize: 1, unitType: CSS_UNIT.DECIMAL });
            return !isNaN(result) ? clamp(result).toString() : '';
        }
        case 'offsetDistance': {
            if (element instanceof SVGGeometryElement) {
                const result = calculateVar(element, value, { boundingSize: element.getTotalLength(), unitType: CSS_UNIT.LENGTH });
                return !isNaN(result) ? Math.max(result, 0).toString() : '';
            }
            return '';
        }
        case 'transform': {
            const transforms = splitEnclosing(value);
            const length = transforms.length;
            if (length > 1) {
                for (let i = 1; i < length; i++) {
                    let seg = transforms[i];
                    seg = seg.substring(1, seg.length - 1);
                    if (hasCalc(seg)) {
                        let calc: Undef<string>;
                        switch (transforms[i - 1].trim()) {
                            case 'matrix':
                            case 'matrix3d':
                                calc = calculateVarAsString(element, seg, { checkPercent: false, unitType: CSS_UNIT.DECIMAL });
                                break;
                            case 'scale':
                            case 'scaleX':
                            case 'scaleY':
                            case 'scaleZ':
                            case 'scale3d':
                                calc = calculateVarAsString(element, seg, { checkPercent: false, unitType: CSS_UNIT.DECIMAL, min: 0 });
                                break;
                            case 'translateX':
                                calc = calculateVarAsString(element, seg, { parent: true, dimension: 'width', unitType: CSS_UNIT.LENGTH });
                                break;
                            case 'translateY':
                                calc = calculateVarAsString(element, seg, { parent: true, dimension: 'height', unitType: CSS_UNIT.LENGTH });
                                break;
                            case 'translateZ':
                            case 'perspective':
                                calc = calculateVarAsString(element, seg, { checkPercent: false, unitType: CSS_UNIT.LENGTH });
                                break;
                            case 'translate':
                            case 'translate3d':
                                calc = calculateVarAsString(element, seg, { parent: true, dimension: ['width', 'height'], unitType: CSS_UNIT.LENGTH });
                                break;
                            case 'rotate':
                            case 'rotateX':
                            case 'rotateY':
                            case 'rotateZ':
                            case 'rotate3d':
                            case 'skew':
                            case 'skewX':
                            case 'skewY':
                                calc = calculateVarAsString(element, seg, { checkPercent: false, unitType: CSS_UNIT.ANGLE });
                                break;
                        }
                        if (calc) {
                            transforms[i] = `(${calc})`;
                        }
                        else {
                            return '';
                        }
                    }
                }
                return transforms.join('');
            }
            break;
        }
        case 'offsetAnchor':
        case 'transformOrigin':
        case 'backgroundPosition':
            break;
        case 'shapeOutside':
            break;
        case 'clipPath':
            break;
        case 'backgroundImage':
        case 'maskImage':
            break;
        case 'borderImage':
            break;
        case 'scrollbarColor':
            break;
        case 'transitionTimingFunction':
            break;
        case 'font':
        case 'background':
        case 'borderColor':
        case 'grid':
        case 'gridTemplate':
        case 'flex':
        case 'rows':
        case 'columns':
        case 'animation':
        case 'offset':
            break;
        default:
            if (/Color$/.test(attr)) {
            }
            else if (/^scroll(Margin|Padding)/.test(attr)) {
                return calculateVarAsString(element, value, { dimension: 'width', unitType: CSS_UNIT.LENGTH });
            }
            else if (isCalc(value)) {
                if (/Width$/.test(attr)) {
                    const result = calculateVar(element, value, { dimension: 'width', min: 0 });
                    if (!isNaN(result)) {
                        return result + 'px';
                    }
                }
                else {
                    const result = calculateVar(element, value, { unitType: CSS_UNIT.DECIMAL });
                    if (!isNaN(result)) {
                        return result.toString();
                    }
                }
            }
            break;
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
        const result: string = style?.[attr];
        if (result) {
            return result;
        }
        return calculateStyle(element, attr, value);
    }
    else if (isCustomProperty(value)) {
        const result: string = style?.[attr];
        if (result) {
            return result;
        }
        return parseVar(element, value);
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
                for (const property of match[2].split(XML.DELIMITER)) {
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
                let match: Null<RegExpExecArray>;
                while ((match = REGEX_MEDIARULE.exec(value)) !== null) {
                    const negate = match[1] === 'not';
                    let subMatch: Null<RegExpExecArray>;
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

export function parseVar(element: HTMLElement | SVGElement, value: string) {
    const style = getStyle(element);
    let match: Null<RegExpMatchArray>;
    while ((match = CSS.VAR.exec(value)) !== null) {
        let customValue = style.getPropertyValue(match[1]).trim();
        const fallback = match[2];
        if (fallback && (isLength(fallback, true) && !isLength(customValue, true) || isNumber(fallback) && !isNumber(customValue) || parseColor(fallback) && !parseColor(customValue))) {
            customValue = fallback;
        }
        if (customValue) {
            value = value.replace(match[0], customValue);
        }
        else {
            return '';
        }
    }
    return value;
}

export function calculateVarAsString(element: HTMLElement | SVGElement, value: string, options?: CalculateVarAsStringOptions) {
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
    let unit = '';
    switch (unitType) {
        case CSS_UNIT.LENGTH:
            unit = 'px';
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
                    const output = calc[i];
                    if (isCalc(output)) {
                        if (orderedSize) {
                            optionsVar.boundingSize = orderedSize[j++];
                        }
                        else if (dimension) {
                            optionsVar.dimension = dimension[j++];
                        }
                        const k = calculateVar(element, output, optionsVar);
                        if (!isNaN(k)) {
                            partial += k + unit;
                        }
                        else {
                            return '';
                        }
                        j++;
                    }
                    else {
                        partial += output;
                        if (dimension && (!checkUnit && output.trim() !== '' || unitType === CSS_UNIT.LENGTH && (isLength(output, true) || output === 'auto'))) {
                            j++;
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

export function calculateVar(element: HTMLElement | SVGElement, value: string, options?: CalculateVarOptions) {
    const output = parseVar(element, value);
    if (output) {
        let boundingSize: Undef<number>;
        let fontSize: Undef<number>;
        let precision: Undef<number>;
        let roundValue: Undef<boolean>;
        let unitType: Undef<number>;
        if (options) {
            ({ boundingSize, unitType, fontSize, precision, roundValue } = options);
            if (value.includes('%')) {
                if (options.checkPercent === false) {
                    return NaN;
                }
                if (boundingSize === undefined) {
                    let boundingElement: Null<Element> = element.parentElement;
                    if (boundingElement instanceof HTMLElement) {
                        if (options.parent === false) {
                            boundingElement = element;
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
                    if (boundingElement) {
                        const rect = boundingElement.getBoundingClientRect();
                        const dimension = options.dimension;
                        if (dimension) {
                            boundingSize = rect[dimension];
                        }
                    }
                }
            }
        }
        let result = calculate(output, { boundingSize, unitType, fontSize: fontSize || getFontSize(element) });
        if (precision !== undefined) {
            result = precision === 0 ? Math.floor(result) : parseFloat(truncate(result, precision));
        }
        else if (roundValue) {
            result = Math.round(result);
        }
        return result;
    }
    return NaN;
}

export function getBackgroundPosition(value: string, dimension: Dimension, options?: BackgroundPositionOptions) {
    let fontSize: Undef<number>;
    let imageDimension: Undef<Dimension>;
    let imageSize: Undef<string>;
    let screenDimension: Undef<Dimension>;
    if (options) {
        ({ fontSize, imageDimension, imageSize, screenDimension } = options);
    }
    const orientation = value === 'center' ? ['center', 'center'] : value.split(' ');
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
                const [sizeW, sizeH] = imageSize.split(' ');
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
                case 'start':
                case 'left':
                case 'top':
                    if (horizontal) {
                        position = 'left';
                    }
                    break;
                case '100%':
                case 'end':
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
                    switch (result.horizontal) {
                        case 'end':
                            result.horizontal = 'right';
                        case 'right':
                            result.right = location;
                            result.rightAsPercent = locationAsPercent;
                            setImageOffset(position, true, 'right', 'rightAsPercent');
                            result.left = width - location;
                            result.leftAsPercent = 1 - locationAsPercent;
                            break;
                        case 'start':
                            result.horizontal = 'left';
                        default:
                            if (locationAsPercent > 1) {
                                const percent = 1 - locationAsPercent;
                                result.horizontal = 'right';
                                result.right = convertLength(formatPercent(percent), width, fontSize, screenDimension);
                                result.rightAsPercent = percent;
                                setImageOffset(position, true, 'right', 'rightAsPercent');
                            }
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
                result.push({ src: resolvePath(match[1]), pixelRatio, width });
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
        const pattern = new RegExp(`\\s*(\\((?:max|min)-width: ${STRING.LENGTH}\\))?\\s*(.+)`);
        let width = 0;
        for (const value of sizes.split(XML.SEPARATOR)) {
            let match = pattern.exec(value.trim());
            if (match) {
                if (!validMediaRule(match[1])) {
                    continue;
                }
                const unit = match[4];
                if (unit) {
                    match = CSS.CALC.exec(unit);
                    if (match) {
                        width = calculate(match[1], { boundingSize: element.parentElement?.getBoundingClientRect().width, unitType: CSS_UNIT.LENGTH });
                    }
                    else if (isPercent(unit)) {
                        width = parseFloat(unit) / 100 * (element.parentElement?.getBoundingClientRect().width || 0);
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
        case 'm':
            result *= 60;
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
    if (value.charAt(0) !== '(' || value.charAt(value.length - 1) !== ')') {
        value = `(${value})`;
    }
    let opened = 0;
    const opening: boolean[] = [];
    const closing: number[] = [];
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
                                const match = /\s*{(\d+)}\s*/.exec(partial);
                                if (match) {
                                    seg.push(equated[parseInt(match[1])]);
                                }
                                else {
                                    switch (unitType) {
                                        case CSS_UNIT.TIME:
                                            if (isTime(partial)) {
                                                seg.push(parseTime(partial));
                                            }
                                            else {
                                                return NaN;
                                            }
                                            break;
                                        case CSS_UNIT.ANGLE:
                                            if (isAngle(partial)) {
                                                seg.push(parseAngle(partial));
                                            }
                                            else {
                                                return NaN;
                                            }
                                            break;
                                        case CSS_UNIT.DECIMAL:
                                            if (isNumber(partial)) {
                                                seg.push(parseFloat(partial));
                                            }
                                            else if (boundingSize !== undefined && isPercent(partial)) {
                                                seg.push(parseFloat(partial) / 100 * boundingSize);
                                            }
                                            else {
                                                return NaN;
                                            }
                                            break;
                                        case CSS_UNIT.INTEGER:
                                            if (REGEX_INTEGER.test(partial.trim())) {
                                                seg.push(parseInt(partial));
                                            }
                                            else {
                                                return NaN;
                                            }
                                            break;
                                        case CSS_UNIT.PERCENT:
                                            if (isPercent(partial)) {
                                                seg.push(parseFloat(partial));
                                            }
                                            else {
                                                return NaN;
                                            }
                                            break;
                                        default:
                                            if (isNumber(partial)) {
                                                return NaN;
                                            }
                                            else if (isLength(partial)) {
                                                seg.push(parseUnit(partial, fontSize));
                                            }
                                            else if (boundingSize !== undefined && isPercent(partial)) {
                                                seg.push(parseFloat(partial) / 100 * boundingSize);
                                            }
                                            else {
                                                return NaN;
                                            }
                                            break;
                                    }
                                }
                                break;
                            }
                        }
                    }
                    if (seg.length !== evaluate.length + 1) {
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
                        seg.splice(k, 2, seg[k] + (evaluate[k] === '-' ? -seg[k + 1] : seg[k + 1]));
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