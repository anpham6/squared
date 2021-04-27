import { CSS_TRAITS, CSS_UNIT } from './constant';

import { CSS_PROPERTIES, PROXY_INLINESTYLE, getDocumentFontSize } from './internal';
import { CSS, STRING } from './regex';

import { getDeviceDPI } from './client';
import { parseColor } from './color';
import { clamp, truncate, truncateFraction } from './math';
import { getElementCache, setElementCache } from './session';
import { endsWith, escapePattern, isSpace, resolvePath, safeFloat, spliceString, splitEnclosing, splitPair, splitSome, trimEnclosing } from './util';

const ELEMENT_BLOCK = [
    'ADDRESS',
    'ARTICLE',
    'ASIDE',
    'BLOCKQUOTE',
    'DD',
    'DETAILS',
    'DIALOG',
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
    'HGROUP',
    'HR',
    'LI',
    'MAIN',
    'NAV',
    'OL',
    'P',
    'PRE',
    'SECTION',
    'TABLE',
    'UL'
];

const REGEXP_LENGTH = new RegExp(`^(?:^|\\s+)${STRING.LENGTH}(?:$|\\s+)$`, 'i');
const REGEXP_LENGTHPERCENTAGE = new RegExp(`^(?:^|\\s+)${STRING.LENGTH_PERCENTAGE}(?:$|\\s+)$`, 'i');
const REGEXP_ANGLE = new RegExp(`^(?:^|\\s+)${STRING.CSS_ANGLE}(?:$|\\s+)$`, 'i');
const REGEXP_TIME = new RegExp(`^(?:^|\\s+)${STRING.CSS_TIME}(?:$|\\s+)$`, 'i');
const REGEXP_RESOLUTION = new RegExp(`^(?:^|\\s+)${STRING.CSS_RESOLUTION}(?:$|\\s+)$`, 'i');
const REGEXP_CALC = /^(?:c(?:alc|lamp)|m(?:in|ax))\((.+)\)$/i;
const REGEXP_CALCNESTED = new RegExp(`(\\s*)(?:calc\\(|(min|max)\\(\\s*${STRING.CSS_CALCUNIT},|(clamp)\\(\\s*${STRING.CSS_CALCUNIT},\\s*${STRING.CSS_CALCUNIT},|\\()\\s*${STRING.CSS_CALCUNIT}\\)(\\s*)`, 'i');
const REGEXP_CALCENCLOSING = /c(?:alc|lamp)|m(?:in|ax)/gi;
const REGEXP_VAR = /^(?:^|\s+)var\(\s*--.*\)(?:$|\s+)$/i;
const REGEXP_VARNESTED = /(.*?)var\(\s*(--[^\s,)]*)\s*(?:\)|((?:,(?!\s*(?:var\(|--))\s*(?:[a-z]+\([^)]+\))?[^,)]*)+)\))(.*)/i;
const REGEXP_CALCWITHIN = /\b(?:c(?:alc|lamp)|m(?:in|ax))\(/i;
const REGEXP_VARWITHIN = /\bvar\(\s*--[^)]*\)/i;
const REGEXP_EMWITHIN = /[\d.]+(?:em|ch|ex)\b/i;
const CALC_OPERATION = /\s+([+-]\s+|\s*[*/])/;
const CHAR_SPACE = /\s+/;
const CHAR_SEPARATOR = /\s*,\s*/;

function calculatePosition(element: StyleElement, value: string, boundingBox?: Null<Dimension>) {
    const alignment: string[] = [];
    splitEnclosing(value, REGEXP_CALCENCLOSING).forEach(seg => {
        if ((seg = seg.trim()).indexOf(' ') !== -1 && !isCalc(seg)) {
            alignment.push(...seg.split(CHAR_SPACE));
        }
        else if (seg) {
            alignment.push(seg);
        }
    });
    const length = alignment.length;
    switch (length) {
        case 1:
        case 2:
            return calculateVarAsString(element, alignment.join(' '), { dimension: ['width', 'height'], boundingBox, parent: false });
        case 3:
        case 4: {
            let horizontal = 0,
                vertical = 0;
            for (let i = 0; i < length; ++i) {
                const position = alignment[i];
                switch (position) {
                    case 'top':
                    case 'bottom':
                        if (++vertical === 2) {
                            return '';
                        }
                        break;
                    case 'center':
                        if (length === 4) {
                            return '';
                        }
                        break;
                    case 'left':
                    case 'right':
                        if (++horizontal === 2) {
                            return '';
                        }
                        break;
                    default: {
                        let dimension: DimensionAttr;
                        switch (alignment[i - 1]) {
                            case 'top':
                            case 'bottom':
                                dimension = 'height';
                                break;
                            case 'left':
                            case 'right':
                                dimension = 'width';
                                break;
                            default:
                                return '';
                        }
                        if (isCalc(position)) {
                            const result = formatVar(calculateVar(element, position, { dimension, boundingBox }));
                            if (!result) {
                                return '';
                            }
                            alignment[i] = result;
                        }
                        break;
                    }
                }
            }
            return alignment.join(' ');
        }
    }
    return '';
}

function calculateColor(element: StyleElement, value: string) {
    const color = splitEnclosing(value);
    const length = color.length;
    if (length > 1) {
        for (let i = 1, seg: string, previous: string; i < length; i += 2) {
            if (hasCalc(seg = color[i])) {
                if (isColor(previous = color[i - 1])) {
                    const component = trimEnclosing(seg.trim()).split(CHAR_SEPARATOR);
                    const q = component.length;
                    if (q >= 3) {
                        const hsl = previous.indexOf('h') !== -1;
                        for (let j = 0; j < q; ++j) {
                            const rgb = component[j];
                            if (isCalc(rgb)) {
                                if (hsl && (j === 1 || j === 2)) {
                                    const result = calculateVar(element, rgb, { unitType: CSS_UNIT.PERCENT, supportPercent: true });
                                    if (isNaN(result)) {
                                        return '';
                                    }
                                    component[j] = clamp(result, 0, 100) + '%';
                                }
                                else if (j === 3) {
                                    const percent = rgb.indexOf('%') !== -1;
                                    let result = calculateVar(element, rgb, percent ? { unitType: CSS_UNIT.PERCENT } : { unitType: CSS_UNIT.DECIMAL });
                                    if (isNaN(result)) {
                                        return '';
                                    }
                                    if (percent) {
                                        result /= 100;
                                    }
                                    component[j] = clamp(result).toString();
                                }
                                else {
                                    const result = calculateVar(element, rgb, { unitType: CSS_UNIT.DECIMAL, supportPercent: false });
                                    if (isNaN(result)) {
                                        return '';
                                    }
                                    component[j] = clamp(result, 0, 255).toString();
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

function calculateGeneric(element: StyleElement, value: string, unitType: number, min: number, boundingBox?: Null<Dimension>, dimension: DimensionAttr = 'width') {
    const segments = splitEnclosing(value, REGEXP_CALCENCLOSING);
    for (let i = 0, length = segments.length, seg: string; i < length; ++i) {
        if (isCalc(seg = segments[i])) {
            const unit = isLength(seg);
            const result = calculateVar(element, seg, unit ? { dimension, boundingBox, min: 0, parent: false } : { unitType, min, supportPercent: false });
            if (isNaN(result)) {
                return '';
            }
            segments[i] = result + (unit ? 'px' : '');
        }
    }
    return segments.join('').trim();
}

function calculateAngle(element: StyleElement, value: string) {
    const result = calculateVar(element, value, { unitType: CSS_UNIT.ANGLE, supportPercent: false });
    if (!isNaN(result)) {
        return result + 'deg';
    }
}

function calculatePercent(element: StyleElement, value: string, restrict?: boolean) {
    const percent = value.indexOf('%') !== -1;
    let result = calculateVar(element, value, { unitType: percent ? CSS_UNIT.PERCENT : CSS_UNIT.DECIMAL });
    if (!isNaN(result)) {
        if (percent) {
            result /= 100;
        }
        return (restrict ? clamp(result) : result).toString();
    }
    return '';
}

function getContentBoxWidth(style: CSSStyleDeclaration) {
    return (
        (hasBorderStyle(style.borderLeftStyle) ? safeFloat(style.borderLeftWidth) : 0) +
        safeFloat(style.paddingLeft) +
        safeFloat(style.paddingRight) +
        (hasBorderStyle(style.borderRightStyle) ? safeFloat(style.borderRightWidth) : 0)
    );
}

function getContentBoxHeight(style: CSSStyleDeclaration) {
    return (
        (hasBorderStyle(style.borderTopStyle) ? safeFloat(style.borderTopWidth) : 0) +
        safeFloat(style.paddingTop) +
        safeFloat(style.paddingBottom) +
        (hasBorderStyle(style.borderBottomStyle) ? safeFloat(style.borderBottomWidth) : 0)
    );
}

function checkCalculateNumber(operand: Undef<string>, operator: Undef<string>) {
    if (operand) {
        switch (operator) {
            case '+':
            case '-':
                if (!isNaN(+operand)) {
                    return false;
                }
                break;
            case '*':
            case '/':
                if (isNaN(+operand)) {
                    return false;
                }
                break;
        }
    }
    return true;
}

function getInnerDimension(horizontal: boolean, options?: ParseUnitOptions) {
    if (options) {
        const screenDimension = options.screenDimension;
        if (screenDimension) {
            return horizontal ? screenDimension.width : screenDimension.height;
        }
    }
    return horizontal ? window.innerWidth : window.innerHeight;
}

function getUnitType(value: Undef<number>) {
    switch (value) {
        case CSS_UNIT.INTEGER:
        case CSS_UNIT.DECIMAL:
            return '';
        case CSS_UNIT.PERCENT:
            return '%';
        case CSS_UNIT.TIME:
            return 'ms';
        case CSS_UNIT.ANGLE:
            return 'deg';
    }
    return 'px';
}

function getContentBoxDimension(element: StyleElement) {
    const { width, height } = element.getBoundingClientRect();
    const style = getStyle(element);
    return { width: Math.max(0, width - getContentBoxWidth(style)), height: Math.max(0, height - getContentBoxHeight(style)) } as Dimension;
}

function checkSpaceEnd(value: string, index: number) {
    for (let i = index + 1; i < value.length; ++i) {
        if (!isSpace(value[i])) {
            return false;
        }
    }
    return true;
}

const trimMethod = (value: string) => value.split(CHAR_SPACE).pop()!.toLowerCase();
const checkCalculateOperator = (operand: Undef<string>, operator: Undef<string>) => !!operand && (operator === '+' || operator === '-');
const getWritingMode = (value?: string) => value ? value === 'vertical-lr' ? 1 : value === 'vertical-rl' ? 2 : 1 : 0;
const hasBorderStyle = (value: string) => value !== 'none' && value !== 'hidden';
const calculateLength = (element: StyleElement, value: string) => formatVar(calculateVar(element, value, { min: 0, supportPercent: false }));
const isColor = (value: string) => /(?:rgb|hsl)a?/i.test(value);
const formatVar = (value: number) => !isNaN(value) ? value + 'px' : '';
const formatDecimal = (value: number) => !isNaN(value) ? value.toString() : '';
const getFallbackResult = (options: Undef<UnitOptions>, value: number) => options && options.fallback !== undefined ? options.fallback : value;

export function getStyle(element: Element, pseudoElt = '') {
    let style = getElementCache<CSSStyleDeclaration>(element, 'style' + pseudoElt, '0');
    if (style) {
        return style;
    }
    if (element.nodeName[0] !== '#') {
        setElementCache(element, 'style' + pseudoElt, style = getComputedStyle(element, pseudoElt));
        return style;
    }
    return PROXY_INLINESTYLE;
}

export function getRemSize(fixedWidth?: boolean) {
    return !fixedWidth ? getDocumentFontSize() : 13;
}

export function getFontSize(element: Element) {
    return safeFloat(getStyle(element.nodeName[0] === '#' ? element.parentElement! : element).fontSize);
}

export function checkWritingMode(attr: string, value?: string) {
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
        case 'overscrollBehaviorInline':
            return getWritingMode(value) === 0 ? 'overscrollBehaviorX' : 'overscrollBehaviorY';
        case 'overscrollBehaviorBlock':
            return getWritingMode(value) === 0 ? 'overscrollBehaviorY' : 'overscrollBehaviorX';
        case 'marginInlineStart':
            return getWritingMode(value) === 0 ? 'marginLeft' : 'marginTop';
        case 'marginInlineEnd':
            return getWritingMode(value) === 0 ? 'marginRight' : 'marginBottom';
        case 'borderInlineStart':
            return getWritingMode(value) === 0 ? 'borderLeft' : 'borderTop';
        case 'borderInlineStartWidth':
            return getWritingMode(value) === 0 ? 'borderLeftWidth' : 'borderTopWidth';
        case 'borderInlineStartStyle':
            return getWritingMode(value) === 0 ? 'borderLeftStyle' : 'borderTopStyle';
        case 'borderInlineStartColor':
            return getWritingMode(value) === 0 ? 'borderLeftColor' : 'borderTopColor';
        case 'borderInlineEnd':
            return getWritingMode(value) === 0 ? 'borderRight' : 'borderBottom';
        case 'borderInlineEndWidth':
            return getWritingMode(value) === 0 ? 'borderRightWidth' : 'borderBottomWidth';
        case 'borderInlineEndStyle':
            return getWritingMode(value) === 0 ? 'borderRightStyle' : 'borderBottomStyle';
        case 'borderInlineEndColor':
            return getWritingMode(value) === 0 ? 'borderRightColor' : 'borderBottomColor';
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
        case 'marginBlockStart':
            switch (getWritingMode(value)) {
                case 0:
                    return 'marginTop';
                case 1:
                    return 'marginLeft';
            }
            return 'marginRight';
        case 'marginBlockEnd':
            switch (getWritingMode(value)) {
                case 0:
                    return 'marginBottom';
                case 1:
                    return 'marginRight';
            }
            return 'marginLeft';
        case 'borderBlockStart':
            switch (getWritingMode(value)) {
                case 0:
                    return 'borderTop';
                case 1:
                    return 'borderLeft';
            }
            return 'borderRight';
        case 'borderBlockStartWidth':
            switch (getWritingMode(value)) {
                case 0:
                    return 'borderTopWidth';
                case 1:
                    return 'borderLeftWidth';
            }
            return 'borderRightWidth';
        case 'borderBlockStartStyle':
            switch (getWritingMode(value)) {
                case 0:
                    return 'borderTopStyle';
                case 1:
                    return 'borderLeftStyle';
            }
            return 'borderRightStyle';
        case 'borderBlockStartColor':
            switch (getWritingMode(value)) {
                case 0:
                    return 'borderTopColor';
                case 1:
                    return 'borderLeftColor';
            }
            return 'borderRightColor';
        case 'borderBlockEnd':
            switch (getWritingMode(value)) {
                case 0:
                    return 'borderBottom';
                case 1:
                    return 'borderRight';
            }
            return 'borderLeft';
        case 'borderBlockEndWidth':
            switch (getWritingMode(value)) {
                case 0:
                    return 'borderBottomWidth';
                case 1:
                    return 'borderRightWidth';
            }
            return 'borderLeftWidth';
        case 'borderBlockEndStyle':
            switch (getWritingMode(value)) {
                case 0:
                    return 'borderBottomStyle';
                case 1:
                    return 'borderRightStyle';
            }
            return 'borderLeftStyle';
        case 'borderBlockEndColor':
            switch (getWritingMode(value)) {
                case 0:
                    return 'borderBottomColor';
                case 1:
                    return 'borderRightColor';
            }
            return 'borderLeftColor';
        case 'paddingBlockStart':
            switch (getWritingMode(value)) {
                case 0:
                    return 'paddingTop';
                case 1:
                    return 'paddingLeft';
            }
            return 'paddingRight';
        case 'paddingBlockEnd':
            switch (getWritingMode(value)) {
                case 0:
                    return 'paddingBottom';
                case 1:
                    return 'paddingRight';
            }
            return 'paddingLeft';
        case 'borderStartStartRadius':
            return getWritingMode(value) === 1 ? 'borderBottomLeftRadius' : 'borderTopLeftRadius';
        case 'borderStartEndRadius':
            return getWritingMode(value) === 1 ? 'borderBottomRightRadius' : 'borderTopRightRadius';
        case 'borderEndStartRadius':
            return getWritingMode(value) === 1 ? 'borderTopLeftRadius' : 'borderBottomLeftRadius';
        case 'borderEndEndRadius':
            return getWritingMode(value) === 1 ? 'borderTopRightRadius' : 'borderBottomRightRadius';
        case 'scrollMarginBlockStart':
            switch (getWritingMode(value)) {
                case 0:
                    return 'scrollMarginTop';
                case 1:
                    return 'scrollMarginLeft';
            }
            return 'scrollMarginRight';
        case 'scrollMarginBlockEnd':
            switch (getWritingMode(value)) {
                case 0:
                    return 'scrollMarginBottom';
                case 1:
                    return 'scrollMarginRight';
            }
            return 'scrollMarginLeft';
        case 'scrollPaddingBlockStart':
            switch (getWritingMode(value)) {
                case 0:
                    return 'scrollPaddingTop';
                case 1:
                    return 'scrollPaddingLeft';
            }
            return 'scrollPaddingRight';
        case 'scrollPaddingBlockEnd':
            switch (getWritingMode(value)) {
                case 0:
                    return 'scrollPaddingBottom';
                case 1:
                    return 'scrollPaddingRight';
            }
            return 'scrollPaddingLeft';
        case 'scrollMarginInline':
            return getWritingMode(value) === 0 ? ['scrollMarginLeft', 'scrollMarginRight'] : ['scrollMarginTop', 'scrollMarginBottom'];
        case 'scrollMarginBlock':
            return getWritingMode(value) === 0 ? ['scrollMarginTop', 'scrollMarginBottom'] : ['scrollMarginLeft', 'scrollMarginRight'];
        case 'scrollPaddingInline':
            return getWritingMode(value) === 0 ? ['scrollPaddingLeft', 'scrollPaddingRight'] : ['scrollPaddingTop', 'scrollPaddingBottom'];
        case 'scrollPaddingBlock':
            return getWritingMode(value) === 0 ? ['scrollPaddingTop', 'scrollPaddingBottom'] : ['scrollPaddingLeft', 'scrollPaddingRight'];
    }
    return attr;
}

export function calculateStyle(element: StyleElement, attr: string, value: string, boundingBox?: Null<Dimension>): string {
    switch (attr) {
        case 'left':
        case 'right':
        case 'textIndent':
            return formatVar(calculateVar(element, value, { dimension: 'width', boundingBox }));
        case 'columnWidth':
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
        case 'columnGap':
        case 'gridColumnGap':
        case 'shapeMargin':
            return formatVar(calculateVar(element, value, { dimension: 'width', boundingBox, min: 0, parent: false }));
        case 'bottom':
        case 'top':
        case 'verticalAlign':
            return formatVar(calculateVar(element, value, { dimension: 'height', boundingBox }));
        case 'height':
        case 'maxHeight':
        case 'minHeight':
            return formatVar(calculateVar(element, value, { dimension: 'height', boundingBox, min: 0 }));
        case 'gridRowGap':
        case 'rowGap':
            return formatVar(calculateVar(element, value, { dimension: 'height', boundingBox, min: 0, parent: false }));
        case 'flexBasis':
            return formatVar(calculateVar(element, value, { dimension: element.parentElement && getStyle(element.parentElement).flexDirection.indexOf('column') !== -1 ? 'height' : 'width', boundingBox, min: 0 }));
        case 'borderBottomWidth':
        case 'borderLeftWidth':
        case 'borderRightWidth':
        case 'borderTopWidth':
        case 'columnRuleWidth':
        case 'letterSpacing':
        case 'outlineOffset':
        case 'outlineWidth':
        case 'perspective':
        case 'wordSpacing':
            return calculateLength(element, value);
        case 'offsetDistance': {
            let boundingSize = 0;
            if (value.indexOf('%') !== -1) {
                const path = getStyle(element).getPropertyValue('offset-path');
                if (path !== 'none') {
                    const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    const match = /^path\("(.+)"\)$/.exec(path);
                    pathElement.setAttribute('d', match ? match[1] : path);
                    boundingSize = pathElement.getTotalLength();
                }
            }
            return formatVar(calculateVar(element, value, { boundingSize }));
        }
        case 'lineHeight':
            return formatVar(calculateVar(element, value, { boundingSize: hasEm(value) ? getFontSize(element) : undefined, min: 0 }));
        case 'fontSize':
            return formatVar(calculateVar(element, value, { boundingSize: hasEm(value) ? getFontSize(element.parentElement || document.documentElement) : undefined, min: 0 }));
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
        case 'backgroundSize':
        case 'maskSize':
        case 'gap':
        case 'gridGap':
        case 'perspectiveOrigin':
            return calculateVarAsString(element, value, { dimension: ['width', 'height'], boundingBox, min: attr === 'perspectiveOrigin' ? -Infinity : 0, parent: false });
        case 'borderImageOutset':
        case 'borderImageWidth':
            return calculateVarAsString(element, value, { dimension: ['height', 'width', 'height', 'width'], boundingBox, min: 0, parent: false });
        case 'borderWidth':
        case 'borderSpacing':
            return calculateVarAsString(element, value, { min: 0, supportPercent: false });
        case 'gridAutoColumns':
        case 'gridTemplateColumns':
            return calculateGeneric(element, value, CSS_UNIT.INTEGER, 1, boundingBox);
        case 'gridAutoRows':
        case 'gridTemplateRows':
            return calculateGeneric(element, value, CSS_UNIT.INTEGER, 1, boundingBox, 'height');
        case 'order':
        case 'zIndex':
            return formatDecimal(calculateVar(element, value, { unitType: CSS_UNIT.INTEGER }));
        case 'tabSize':
        case 'widows':
        case 'orphans':
            return formatDecimal(calculateVar(element, value, { unitType: CSS_UNIT.INTEGER, min: 0 }));
        case 'columnCount':
        case 'fontWeight':
            return formatDecimal(calculateVar(element, value, { unitType: CSS_UNIT.INTEGER, min: 1 }));
        case 'gridRow':
        case 'gridRowEnd':
        case 'gridRowStart':
        case 'gridColumn':
        case 'gridColumnEnd':
        case 'gridColumnStart':
        case 'counterIncrement':
        case 'counterReset':
        case 'counterSet':
            return calculateVarAsString(element, value, { unitType: CSS_UNIT.INTEGER });
        case 'gridArea':
            return calculateVarAsString(element, value, { unitType: CSS_UNIT.INTEGER, min: 1 });
        case 'flexGrow':
        case 'flexShrink':
            return formatDecimal(calculateVar(element, value, { unitType: CSS_UNIT.DECIMAL, min: 0 }));
        case 'animationIterationCount':
        case 'fontSizeAdjust':
            return formatDecimal(calculateVar(element, value, { unitType: CSS_UNIT.DECIMAL, min: 0, supportPercent: false }));
        case 'opacity':
        case 'shapeImageThreshold':
            return calculatePercent(element, value, true);
        case 'fontStretch':
        case 'textSizeAdjust':
            return calculateVarAsString(element, value, { unitType: CSS_UNIT.PERCENT, min: 0, supportPercent: true });
        case 'fontStyle':
        case 'offsetRotate':
            return calculateVarAsString(element, value, { unitType: CSS_UNIT.ANGLE, supportPercent: false });
        case 'offsetAnchor':
            return calculatePosition(element, value, boundingBox);
        case 'transformOrigin':
            return calculateVarAsString(element, value, { dimension: ['width', 'height'], boundingBox, parent: false });
        case 'transform': {
            const transform = splitEnclosing(value);
            const length = transform.length;
            if (length > 1) {
                for (let i = 1, seg: string; i < length; i += 2) {
                    if (hasCalc(seg = transform[i])) {
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
                            case 'rotateZ':
                                calc = calculateAngle(element, seg);
                                break;
                            case 'rotate3d': {
                                const component = seg.split(CHAR_SEPARATOR);
                                const q = component.length;
                                if (q === 3 || q === 4) {
                                    calc = '';
                                    for (let j = 0; j < q; ++j) {
                                        let rotate = component[j];
                                        if (isCalc(rotate)) {
                                            const result = calculateVar(element, rotate, { unitType: j === 3 ? CSS_UNIT.ANGLE : CSS_UNIT.DECIMAL, supportPercent: false });
                                            if (isNaN(result)) {
                                                return '';
                                            }
                                            rotate = result + (j === 3 ? 'deg' : '');
                                        }
                                        calc += calc ? ', ' + rotate : rotate;
                                    }
                                }
                                break;
                            }
                        }
                        if (!calc) {
                            return '';
                        }
                        transform[i] = `(${calc})`;
                    }
                }
                return transform.join('');
            }
            return value;
        }
        case 'backgroundImage':
        case 'maskImage':
        case 'borderImageSource': {
            const image = splitEnclosing(value);
            const length = image.length;
            if (length > 1) {
                for (let i = 1, color: string; i < length; i += 2) {
                    if (!endsWith(image[i - 1], 'url') && hasCalc(color = image[i])) {
                        const component = splitEnclosing(trimEnclosing(color));
                        for (let j = 1, q = component.length, previous: string; j < q; j += 2) {
                            if (hasCalc(component[j])) {
                                if (isColor(previous = component[j - 1])) {
                                    const method = trimMethod(previous);
                                    const result = calculateColor(element, method + component[j]);
                                    if (result) {
                                        component[j] = result.replace(method, '');
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
            const color = splitEnclosing(value);
            const length = color.length;
            if (length > 1) {
                for (let i = 1, previous: string; i < length; i += 2) {
                    if (hasCalc(color[i])) {
                        if (!isColor(previous = color[i - 1])) {
                            return '';
                        }
                        const method = trimMethod(previous);
                        const result = calculateColor(element, method + color[i]);
                        if (!result) {
                            return '';
                        }
                        color[i] = result;
                        color[i - 1] = previous.substring(0, previous.length - method.length);
                    }
                }
                return color.join('');
            }
            return value;
        }
        case 'boxShadow':
        case 'textShadow':
            return calculateVarAsString(element, calculateStyle(element, 'borderColor', value), { supportPercent: false, errorString: /-?[\d.]+[a-z]*\s+-?[\d.]+[a-z]*\s+(-[\d.]+[a-z]*)/ });
        case 'animation':
        case 'animationDelay':
        case 'animationDuration':
        case 'transition':
        case 'transitionDelay':
        case 'transitionDuration':
            return calculateVarAsString(element, value, { unitType: CSS_UNIT.TIME, min: 0, precision: 0, separator: ',' });
        case 'fontFeatureSettings':
        case 'fontVariantCaps':
        case 'fontVariantEastAsian':
        case 'fontVariantLigatures':
        case 'fontVariantNumeric':
        case 'fontVariationSettings':
            return calculateVarAsString(element, value, { unitType: CSS_UNIT.INTEGER, min: 0, separator: ',' });
        case 'columns':
            return calculateGeneric(element, value, CSS_UNIT.INTEGER, 1, boundingBox);
        case 'borderImageSlice':
        case 'flex':
        case 'font':
            return calculateGeneric(element, value, CSS_UNIT.DECIMAL, 0, boundingBox);
        case 'backgroundPosition':
        case 'maskPosition': {
            const result: string[] = [];
            for (const position of value.split(CHAR_SEPARATOR)) {
                const segment = calculatePosition(element, position, boundingBox);
                if (!segment) {
                    return '';
                }
                result.push(segment);
            }
            return result.join(', ');
        }
        case 'border':
        case 'borderBottom':
        case 'borderLeft':
        case 'borderRight':
        case 'borderTop':
        case 'columnRule':
        case 'outline':
        case 'textDecoration': {
            const border = splitEnclosing(value);
            const length = border.length;
            if (length > 1) {
                for (let i = 1, previous: string; i < length; i += 2) {
                    const method = trimMethod(previous = border[i - 1]);
                    let result: string;
                    if (method === 'calc') {
                        result = formatVar(calculateVar(element, method + border[i], { min: 0, supportPercent: false }));
                    }
                    else if (isColor(method)) {
                        result = calculateColor(element, method + border[i]);
                    }
                    else {
                        continue;
                    }
                    if (!result) {
                        return '';
                    }
                    border[i] = result;
                    border[i - 1] = previous.substring(0, previous.length - method.length);
                }
                return border.join('');
            }
            return value;
        }
        case 'animationTimingFunction':
        case 'transitionTimingFunction': {
            const timingFunction = splitEnclosing(value);
            const length = timingFunction.length;
            if (length > 1) {
                for (let i = 1, seg: string; i < length; i += 2) {
                    if (hasCalc(seg = timingFunction[i])) {
                        const prefix = timingFunction[i - 1].toLowerCase();
                        let calc: Undef<string>;
                        seg = trimEnclosing(seg);
                        if (endsWith(prefix, 'cubic-bezier')) {
                            const cubic = seg.split(CHAR_SEPARATOR);
                            const q = cubic.length;
                            if (q === 4) {
                                calc = '';
                                for (let j = 0, bezier: string; j < q; ++j) {
                                    if (isCalc(bezier = cubic[j])) {
                                        const p = calculateVar(element, bezier, j % 2 === 0 ? { unitType: CSS_UNIT.DECIMAL, supportPercent: false, min: 0, max: 1 } : undefined);
                                        if (isNaN(p)) {
                                            return '';
                                        }
                                        bezier = p.toString();
                                    }
                                    calc += calc ? ', ' + bezier : bezier;
                                }
                            }
                        }
                        else if (endsWith(prefix, 'steps')) {
                            calc = calculateVarAsString(element, seg, { unitType: CSS_UNIT.INTEGER, min: 1 });
                        }
                        if (!calc) {
                            return '';
                        }
                        timingFunction[i] = `(${calc})`;
                    }
                }
                return timingFunction.join('');
            }
            return value;
        }
        case 'clip':
            return hasCoords(getStyle(element).position) ? calculateVarAsString(element, value, { supportPercent: false }) : '';
        case 'clipPath':
        case 'offsetPath':
        case 'shapeOutside': {
            const path = splitEnclosing(value);
            const length = path.length;
            if (length === 2) {
                const method = path[0].trim().toLowerCase();
                let shape = trimEnclosing(path[1].trim());
                switch (method) {
                    case 'linear-gradient':
                    case 'radial-gradient':
                    case 'conic-gradient':
                    case 'repeating-linear-gradient':
                    case 'repeating-radial-gradient':
                        return calculateStyle(element, 'backgroundImage', value, boundingBox);
                    case 'circle':
                    case 'ellipse': {
                        const result: string[] = [];
                        let [radius, position] = shape.split(/\s+at\s+/);
                        if (hasCalc(radius)) {
                            const options: CalculateVarAsStringOptions = { boundingBox, min: 0, parent: true };
                            if (method === 'circle') {
                                if (radius.indexOf('%') !== -1) {
                                    boundingBox ||= element.parentElement && getContentBoxDimension(element.parentElement);
                                    if (!boundingBox) {
                                        return '';
                                    }
                                    options.boundingSize = Math.min(boundingBox.width, boundingBox.height);
                                }
                            }
                            else {
                                options.dimension = ['width', 'height'];
                            }
                            if (!(radius = calculateVarAsString(element, radius, options))) {
                                return '';
                            }
                        }
                        if (radius) {
                            result.push(radius);
                        }
                        if (hasCalc(position) && !(position = calculateVarAsString(element, position, { dimension: ['width', 'height'], boundingBox, parent: true }))) {
                            return '';
                        }
                        if (position) {
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
                        for (let points of shape.split(CHAR_SEPARATOR)) {
                            if (hasCalc(points) && !(points = calculateVarAsString(element, points, { dimension: ['width', 'height'], boundingBox, parent: true }))) {
                                return '';
                            }
                            result.push(points);
                        }
                        shape = result.join(', ');
                        break;
                    }
                    default:
                        return !hasCalc(path[1]) ? value : '';
                }
                if (shape) {
                    return `${method}(${shape})`;
                }
            }
            return value;
        }
        case 'grid': {
            let [row, column] = splitPair(value, '/', true);
            if (hasCalc(row)) {
                const result = calculateStyle(element, 'gridTemplateRows', row, boundingBox);
                if (!result) {
                    return '';
                }
                row = result;
            }
            if (hasCalc(column)) {
                const result = calculateStyle(element, 'gridTemplateColumns', column, boundingBox);
                if (!result) {
                    return '';
                }
                column = result;
            }
            return row + (column ? ` / ${column}` : '');
        }
        case 'offset': {
            let [offset, anchor] = splitPair(value, '/', true);
            if (hasCalc(offset)) {
                const url = splitEnclosing(offset);
                const length = url.length;
                if (length < 2) {
                    return '';
                }
                offset = url[0] + url[1];
                if (hasCalc(offset) && !(offset = calculateStyle(element, 'offsetPath', offset, boundingBox))) {
                    return '';
                }
                if (length > 2) {
                    let distance = url.slice(2).join('');
                    if (hasCalc(offset) && !(distance = calculateStyle(element, isLength(distance) ? 'offsetDistance' : 'offsetRotate', distance, boundingBox))) {
                        return '';
                    }
                    offset += ' ' + distance;
                }
            }
            if (hasCalc(anchor)) {
                const result = calculateStyle(element, 'offsetAnchor', anchor, boundingBox);
                if (!result) {
                    return '';
                }
                anchor = result;
            }
            return offset + (anchor ? ` / ${anchor}` : '');
        }
        case 'borderImage': {
            const match = /([a-z-]+\(.+?\))\s*([^/]+)(?:\s*\/\s*)?(.+)?/i.exec(value);
            if (match) {
                let slice = match[2].trim();
                if (hasCalc(slice)) {
                    slice = calculateStyle(element, 'borderImageSlice', slice, boundingBox);
                }
                if (slice) {
                    let width: Undef<string>,
                        outset: Undef<string>;
                    if (match[3]) {
                        [width, outset] = splitPair(match[3], '/', true);
                        if (hasCalc(width)) {
                            const result = calculateStyle(element, 'borderImageWidth', width, boundingBox);
                            if (!result) {
                                return '';
                            }
                            width = result;
                        }
                        if (hasCalc(outset)) {
                            const result = calculateStyle(element, 'borderImageOutset', outset, boundingBox);
                            if (!result) {
                                return '';
                            }
                            outset = result;
                        }
                    }
                    return match[1] + ' ' + slice + (width ? ` / ${width}` : '') + (outset ? ` / ${outset}` : '');
                }
            }
            return '';
        }
        case 'filter':
        case 'backdropFilter': {
            const filters = splitEnclosing(value);
            const length = filters.length;
            if (length > 1) {
                for (let i = 1, seg: string; i < length; i += 2) {
                    if (hasCalc(seg = filters[i])) {
                        seg = trimEnclosing(seg);
                        let result: Undef<string>;
                        switch (filters[i - 1].trim().toLowerCase()) {
                            case 'blur':
                                result = calculateLength(element, seg);
                                break;
                            case 'brightness':
                            case 'saturate':
                                result = calculatePercent(element, seg);
                                break;
                            case 'contrast':
                            case 'grayscale':
                            case 'invert':
                            case 'opacity':
                            case 'sepia':
                                result = calculatePercent(element, seg, true);
                                break;
                            case 'drop-shadow':
                                result = calculateStyle(element, 'boxShadow', seg, boundingBox);
                                break;
                            case 'hue-rotate':
                                result = calculateAngle(element, seg);
                                break;
                            case 'url':
                                continue;
                        }
                        if (!result) {
                            return '';
                        }
                        filters[i] = `(${result})`;
                    }
                }
                return filters.join('');
            }
            return value;
        }
        default: {
            if (endsWith(attr, 'Color') || (CSS_PROPERTIES[attr] && (CSS_PROPERTIES[attr]!.trait & CSS_TRAITS.COLOR))) {
                return calculateColor(element, value);
            }
            const style = getStyle(element);
            const alias = checkWritingMode(attr, style.writingMode);
            if (alias !== attr) {
                return calculateStyle(element, typeof alias === 'string' ? alias : alias[0], value, boundingBox);
            }
            else if (attr in style) {
                return style[attr] as string;
            }
        }
    }
    return '';
}

export function checkStyleValue(element: StyleElement, attr: string, value: string) {
    switch (value) {
        case 'initial':
            switch (attr) {
                case 'position':
                    return 'static';
                case 'display':
                    return ELEMENT_BLOCK.includes(element.tagName) ? 'block' : 'inline';
                case 'fontSize':
                    return 'inherit';
                case 'verticalAlign':
                    switch (element.tagName) {
                        case 'SUP':
                            return 'super';
                        case 'SUB':
                            return 'sub';
                    }
                    return 'baseline';
                case 'backgroundColor':
                    return 'transparent';
                case 'backgroundRepeat':
                    return 'repeat-x repeat-y';
                case 'backgroundImage':
                case 'borderTopStyle':
                case 'borderRightStyle':
                case 'borderBottomStyle':
                case 'borderLeftStyle':
                case 'float':
                    return 'none';
                case 'lineHeight':
                    return 'normal';
                case 'boxSizing':
                    return 'content-box';
                case 'borderCollapse':
                    return 'separate';
                case 'appearance':
                    return CSS_PROPERTIES.appearance!.valueOfSome!(element);
            }
            return '';
        case 'inherit':
        case 'unset':
        case 'revert':
            switch (attr) {
                case 'lineHeight':
                case 'fontSize':
                    return 'inherit';
                default:
                    if (value === 'unset') {
                        const property = CSS_PROPERTIES[attr];
                        if (property && (property.trait & CSS_TRAITS.INHERIT) === 0 && typeof property.value === 'string') {
                            return '';
                        }
                    }
                    break;
            }
            return getStyle(element)[attr] as string;
    }
    if (value.indexOf('(') !== -1) {
        if (hasCalc(value)) {
            return calculateStyle(element, attr, value) || getStyle(element)[attr] as string;
        }
        else if (hasCustomProperty(value)) {
            return parseVar(element, value) || getStyle(element)[attr] as string;
        }
    }
    return value;
}

export function parseVar(element: StyleElement, value: string, style?: CSSStyleDeclaration) {
    let match: Null<RegExpExecArray>;
    while (match = REGEXP_VARNESTED.exec(value)) {
        let propertyValue = (style ||= getStyle(element)).getPropertyValue(match[2]).trim(),
            fallback = match[3];
        if (fallback) {
            const segments = splitEnclosing(fallback);
            const length = segments.length;
            let template: Undef<string[]>;
            if (length > 1) {
                for (let i = 1, j = 0; i < length; i += 2) {
                    (template ||= []).push(segments[i]);
                    segments[i] = `{{${j++}}}`;
                }
                fallback = segments.join('');
            }
            splitSome(fallback, other => {
                if (template) {
                    const index = /{{(\d+)}}/.exec(other);
                    if (index) {
                        other = other.replace(`{{${index[1]}}}`, template[+index[1]]);
                    }
                }
                if (!propertyValue) {
                    propertyValue = other;
                }
                else if (!isNaN(+other) && isNaN(+propertyValue) || isLength(other, true) && !isLength(propertyValue, true) || parseColor(other) && !parseColor(propertyValue)) {
                    propertyValue = other;
                    return true;
                }
            });
        }
        if (!propertyValue) {
            return '';
        }
        value = match[1] + propertyValue + match[4];
    }
    return value;
}

export function calculateVarAsString(element: StyleElement, value: string, options?: CalculateVarAsStringOptions) {
    let orderedSize: Undef<number[]>,
        dimension: Undef<DimensionAttr[]>,
        separator: Undef<string>,
        unitType: Undef<number>,
        checkUnit: Undef<boolean>,
        errorString: Undef<RegExp>;
    if (options) {
        if (Array.isArray(options.orderedSize)) {
            orderedSize = options.orderedSize;
        }
        if (Array.isArray(options.dimension)) {
            dimension = options.dimension;
        }
        ({ separator, unitType, checkUnit, errorString } = options);
    }
    if (separator === ' ') {
        value = value.trim();
    }
    const unit = getUnitType(unitType ||= CSS_UNIT.LENGTH);
    const result: string[] = [];
    for (let seg of separator ? value.split(separator) : [value]) {
        if (seg = seg.trim()) {
            const calc = splitEnclosing(seg, REGEXP_CALCENCLOSING);
            let partial = '';
            for (let i = 0, j = 0, length = calc.length, output: string; i < length; ++i) {
                if (isCalc(output = calc[i])) {
                    if (options) {
                        if (orderedSize && orderedSize[j] !== undefined) {
                            options.boundingSize = orderedSize[j++];
                        }
                        else if (dimension) {
                            options.dimension = dimension[j++];
                            delete options.boundingSize;
                        }
                        else if (orderedSize) {
                            delete options.boundingSize;
                        }
                    }
                    const k = calculateVar(element, output, options as CalculateVarOptions);
                    if (isNaN(k)) {
                        return '';
                    }
                    partial += k + unit;
                }
                else {
                    partial += output;
                    if (dimension && (output = output.trim()) && (!checkUnit || unitType === CSS_UNIT.LENGTH && (isLength(output, true) || output === 'auto'))) {
                        ++j;
                    }
                }
            }
            result.push(partial);
        }
    }
    value = result.length === 1 ? result[0] : result.join(separator === ' ' ? ' ' : separator ? separator + ' ' : '');
    if (errorString) {
        let match: Null<RegExpExecArray>;
        while (match = errorString.exec(value)) {
            if (match[1] === undefined) {
                return '';
            }
            const segment = match[0];
            let optional = segment;
            for (let i = match.length - 1; i >= 1; --i) {
                optional = optional.replace(new RegExp(escapePattern(match[i]) + '$'), '');
            }
            if (optional === segment) {
                return '';
            }
            value = value.replace(segment, optional);
        }
    }
    return value;
}

export function calculateVar(element: StyleElement, value: string, options: CalculateVarOptions = {}) {
    if (value = parseVar(element, value)) {
        const unitType = options.unitType || CSS_UNIT.LENGTH;
        const boundingSize = unitType === CSS_UNIT.LENGTH;
        if (value.indexOf('%') !== -1) {
            if (options.supportPercent === false || unitType === CSS_UNIT.INTEGER) {
                return getFallbackResult(options, NaN);
            }
            else if (boundingSize && options.boundingSize === undefined) {
                const { dimension, boundingBox } = options;
                if (dimension) {
                    if (boundingBox) {
                        options.boundingSize = boundingBox[dimension];
                    }
                    else {
                        let offsetPadding = 0,
                            boundingElement: Null<Element>;
                        if (options.parent === false) {
                            boundingElement = element;
                        }
                        else {
                            boundingElement = element.parentElement;
                            if (boundingElement instanceof HTMLElement) {
                                let style: CSSStyleDeclaration;
                                if (hasCoords(getStyle(element).position)) {
                                    do {
                                        style = getStyle(boundingElement);
                                        if (boundingElement === document.body) {
                                            break;
                                        }
                                        if (style.position === 'static') {
                                            boundingElement = boundingElement.parentElement;
                                        }
                                        else {
                                            break;
                                        }
                                    }
                                    while (boundingElement);
                                }
                                else {
                                    style = getStyle(boundingElement);
                                }
                                offsetPadding = dimension === 'width' ? getContentBoxWidth(style) : getContentBoxHeight(style);
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
            return getFallbackResult(options, NaN);
        }
        if (boundingSize && options.fontSize === undefined && hasEm(value)) {
            options.fontSize = getFontSize(element);
        }
        const result = calculateAll(value, options);
        if (!isNaN(result)) {
            if (options.precision !== undefined) {
                return options.precision === 0 ? Math.floor(result) : +truncate(result, options.precision);
            }
            else if (options.roundValue) {
                return Math.round(result);
            }
            return result;
        }
    }
    return getFallbackResult(options, NaN);
}

export function calculateAll(value: string, options?: CalculateOptions) {
    let match: Null<RegExpExecArray>;
    while (match = REGEXP_CALCNESTED.exec(value)) {
        let result = calculateUnit(match[7], options),
            method = match[2] || match[4];
        if (method) {
            switch (method = method.toLowerCase()) {
                case 'min':
                case 'max':
                    result = Math[method](result, calculateUnit(match[3], options));
                    break;
                case 'clamp': {
                    const min = calculateUnit(match[5], options);
                    const current = calculateUnit(match[6], options);
                    if (isNaN(min) || isNaN(current)) {
                        return getFallbackResult(options, NaN);
                    }
                    result = clamp(current, min, result);
                    break;
                }
            }
        }
        if (!isNaN(result)) {
            if (value.length === match[0].length) {
                return result;
            }
            value = spliceString(value, match.index, match[0].length, match[1] + result + getUnitType(options && options.unitType) + match[8]);
        }
        else {
            break;
        }
    }
    return getFallbackResult(options, NaN);
}

export function calculate(value: string, options?: CalculateOptions) {
    let length = (value = value.trim()).length;
    if (length === 0) {
        return getFallbackResult(options, NaN);
    }
    if (value[0] !== '(' || value[length - 1] !== ')') {
        value = `(${value})`;
        length += 2;
    }
    const opening: number[] = [];
    const closing: number[] = [];
    for (let i = 0; i < length; ++i) {
        switch (value[i]) {
            case '(':
                opening.push(i);
                break;
            case ')':
                closing.push(i);
                break;
        }
    }
    if (opening.length === closing.length) {
        const equated: [number, Undef<NumString>][] = [];
        let index = 0;
        do {
            for (let i = 0; i < closing.length; ++i) {
                let valid: Undef<boolean>,
                    j = closing[i] - 1,
                    l = i;
                for ( ; j >= 0; j--) {
                    const k = opening.indexOf(j);
                    if (k !== -1) {
                        opening[k] = NaN;
                        valid = true;
                        break;
                    }
                    else if (closing.includes(j)) {
                        l = j;
                    }
                }
                if (valid) {
                    let boundingSize: Undef<number>,
                        min: Undef<number>,
                        max: Undef<number>,
                        unitType: Undef<number>,
                        safe: Undef<boolean>,
                        zeroThreshold: Undef<number>;
                    if (options) {
                        ({ boundingSize, min, max, unitType, safe, zeroThreshold } = options);
                    }
                    let found: Undef<boolean>,
                        operand: Undef<string>,
                        operator: Undef<string>;
                    const seg: number[] = [];
                    const evaluate: string[] = [];
                    const operation = value.substring(j + 1, closing[l]).split(CALC_OPERATION);
                    for (let k = 0, n: number, q = operation.length; k < q; ++k) {
                        const partial = operation[k].trim();
                        switch (partial) {
                            case '+':
                            case '-':
                            case '*':
                            case '/':
                                evaluate.push(partial);
                                operator = partial;
                                break;
                            default: {
                                const match = partial.indexOf('{') !== -1 && /{(\d+)}/.exec(partial);
                                if (match) {
                                    switch (unitType) {
                                        case CSS_UNIT.INTEGER:
                                        case CSS_UNIT.DECIMAL:
                                            break;
                                        default:
                                            if (!checkCalculateNumber(operand, operator)) {
                                                return getFallbackResult(options, NaN);
                                            }
                                            break;
                                    }
                                    const unit = equated[+match[1]];
                                    seg.push(unit[0]);
                                    operand = unit[1] ? unit[1].toString() : undefined;
                                    found = true;
                                }
                                else {
                                    n = +partial;
                                    switch (unitType) {
                                        case CSS_UNIT.PERCENT:
                                            if (!isNaN(n)) {
                                                if (checkCalculateOperator(operand, operator)) {
                                                    return getFallbackResult(options, NaN);
                                                }
                                                seg.push(n);
                                            }
                                            else if (!isNaN(n = asPercent(partial))) {
                                                if (!checkCalculateNumber(operand, operator)) {
                                                    return getFallbackResult(options, NaN);
                                                }
                                                seg.push(n * 100);
                                                found = true;
                                            }
                                            else {
                                                return getFallbackResult(options, NaN);
                                            }
                                            break;
                                        case CSS_UNIT.TIME:
                                            if (!isNaN(n)) {
                                                if (checkCalculateOperator(operand, operator)) {
                                                    return getFallbackResult(options, NaN);
                                                }
                                                seg.push(n);
                                            }
                                            else if (isTime(partial)) {
                                                if (!checkCalculateNumber(operand, operator)) {
                                                    return getFallbackResult(options, NaN);
                                                }
                                                seg.push(parseTime(partial) * 1000);
                                                found = true;
                                            }
                                            else {
                                                return getFallbackResult(options, NaN);
                                            }
                                            break;
                                        case CSS_UNIT.ANGLE:
                                            if (!isNaN(n)) {
                                                if (checkCalculateOperator(operand, operator)) {
                                                    return getFallbackResult(options, NaN);
                                                }
                                                seg.push(n);
                                            }
                                            else if (isAngle(partial)) {
                                                if (!checkCalculateNumber(operand, operator)) {
                                                    return getFallbackResult(options, NaN);
                                                }
                                                const angle = parseAngle(partial);
                                                if (!isNaN(angle)) {
                                                    seg.push(angle);
                                                }
                                                else {
                                                    return getFallbackResult(options, NaN);
                                                }
                                                found = true;
                                            }
                                            else {
                                                return getFallbackResult(options, NaN);
                                            }
                                            break;
                                        case CSS_UNIT.INTEGER:
                                            if (!/^-?\d+$/.test(partial)) {
                                                return getFallbackResult(options, NaN);
                                            }
                                            seg.push(n);
                                            found = true;
                                            break;
                                        case CSS_UNIT.DECIMAL:
                                            if (!isNaN(n)) {
                                                seg.push(n);
                                            }
                                            else if (boundingSize !== undefined && !isNaN(n = asPercent(partial)) && !isNaN(boundingSize)) {
                                                seg.push(n * boundingSize);
                                            }
                                            else {
                                                return getFallbackResult(options, NaN);
                                            }
                                            found = true;
                                            break;
                                        default:
                                            if (!isNaN(n)) {
                                                if (checkCalculateOperator(operand, operator)) {
                                                    return getFallbackResult(options, NaN);
                                                }
                                                seg.push(n);
                                            }
                                            else {
                                                if (!checkCalculateNumber(operand, operator)) {
                                                    return getFallbackResult(options, NaN);
                                                }
                                                if (isLength(partial)) {
                                                    seg.push(parseUnit(partial, options));
                                                }
                                                else if (boundingSize !== undefined && !isNaN(n = asPercent(partial)) && !isNaN(boundingSize)) {
                                                    seg.push(n * boundingSize);
                                                }
                                                else {
                                                    return getFallbackResult(options, NaN);
                                                }
                                                found = true;
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
                        return getFallbackResult(options, NaN);
                    }
                    for (let k = 0; k < evaluate.length; ++k) {
                        if (evaluate[k] === '/') {
                            if (Math.abs(seg[k + 1]) !== 0) {
                                seg.splice(k, 2, seg[k] / seg[k + 1]);
                                evaluate.splice(k--, 1);
                            }
                            else {
                                return getFallbackResult(options, NaN);
                            }
                        }
                    }
                    for (let k = 0; k < evaluate.length; ++k) {
                        if (evaluate[k] === '*') {
                            seg.splice(k, 2, seg[k] * seg[k + 1]);
                            evaluate.splice(k--, 1);
                        }
                    }
                    for (let k = 0; k < evaluate.length; ++k) {
                        seg.splice(k, 2, seg[k] + seg[k + 1] * (evaluate[k] === '-' ? -1 : 1));
                        evaluate.splice(k--, 1);
                    }
                    if (seg.length !== 1) {
                        return getFallbackResult(options, NaN);
                    }
                    if (closing.length === 1) {
                        const result = seg[0];
                        if (min !== undefined && result < min || max !== undefined && result > max) {
                            return getFallbackResult(options, NaN);
                        }
                        return truncateFraction(safe ? clamp(result, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER) : result, false, zeroThreshold);
                    }
                    equated[index] = [seg[0], operand];
                    const hash = `{${index++}}`;
                    const remaining = closing[l] + 1;
                    value = value.substring(0, j) + hash + ' '.repeat(remaining - (j + hash.length)) + value.substring(remaining);
                    closing.splice(l, 1);
                    i = -1;
                }
            }
        }
        while (true);
    }
    return getFallbackResult(options, NaN);
}

export function calculateUnit(value: string, options?: CalculateOptions) {
    return isLength(value) ? parseUnit(value, options) : calculate(value, options);
}

export function parseUnit(value: string, options?: ParseUnitOptions) {
    const match = REGEXP_LENGTH.exec(value);
    if (match) {
        let result = +match[1];
        if (match[2]) {
            switch (match[2].toLowerCase()) {
                case 'px':
                    break;
                case 'ex':
                    result /= 2;
                case 'em':
                case 'ch':
                    if (options && options.fontSize !== undefined) {
                        result *= options.fontSize;
                        break;
                    }
                case 'rem':
                    result *= options && options.fixedWidth ? 13 : getDocumentFontSize();
                    break;
                case 'pc':
                    result *= 12;
                case 'pt':
                    result *= 4 / 3;
                    break;
                case 'q':
                    result /= 4;
                case 'mm':
                    result /= 10;
                case 'cm':
                    result /= 2.54;
                case 'in':
                    result *= getDeviceDPI();
                    break;
                case 'vw':
                    result *= getInnerDimension(true, options) / 100;
                    break;
                case 'vh':
                    result *= getInnerDimension(false, options) / 100;
                    break;
                case 'vmin':
                    result *= Math.min(getInnerDimension(true, options), getInnerDimension(false, options)) / 100;
                    break;
                case 'vmax':
                    result *= Math.max(getInnerDimension(true, options), getInnerDimension(false, options)) / 100;
                    break;
            }
        }
        return options && options.safe ? clamp(result, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER) : result;
    }
    return getFallbackResult(options, 0);
}

export function convertUnit(value: NumString, unit = 'px', options?: ConvertUnitOptions) {
    let result = parseUnit('1' + unit, options);
    if (result) {
        result = (typeof value === 'string' ? parseUnit(value, options) : value) / result;
        if (options && options.precision !== undefined) {
            return truncate(result, options.precision) + unit;
        }
    }
    return (result || 0) + unit;
}

export function parseAngle(value: string, fallback = NaN) {
    const match = REGEXP_ANGLE.exec(value);
    return match ? convertAngle(match[1], match[2]) : fallback;
}

export function convertAngle(value: string, unit = 'deg', fallback = NaN) {
    let result = parseFloat(value);
    if (isNaN(result)) {
        return fallback;
    }
    switch (unit.toLowerCase()) {
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

export function parseTime(value: string) {
    const match = REGEXP_TIME.exec(value);
    if (match) {
        let result = +match[1];
        if (match[2].toLowerCase() === 'ms') {
            result /= 1000;
        }
        return result;
    }
    return 0;
}

export function parseResolution(value: string) {
    const match = REGEXP_RESOLUTION.exec(value);
    if (match) {
        let result = +match[1];
        switch (match[2].toLowerCase()) {
            case 'dpcm':
                result *= 2.54 / 96;
                break;
            case 'dpi':
                result /= 96;
                break;
        }
        return result;
    }
    return 0;
}

export function formatPX(value: number) {
    return Math.round(value) + 'px';
}

export function formatPercent(value: NumString, round?: boolean) {
    if (typeof value === 'string' && isNaN(value = +value)) {
        return '0%';
    }
    value *= 100;
    return (round ? Math.round(value) : value) + '%';
}

export function isLength(value: string, percent?: boolean) {
    return !percent ? REGEXP_LENGTH.test(value) : REGEXP_LENGTHPERCENTAGE.test(value);
}

export function isCalc(value: string) {
    return REGEXP_CALC.test(value);
}

export function isCustomProperty(value: string) {
    return REGEXP_VAR.test(value);
}

export function isAngle(value: string) {
    return REGEXP_ANGLE.test(value);
}

export function isTime(value: string) {
    return REGEXP_TIME.test(value);
}

export function asPercent(value: unknown) {
    if (typeof value === 'string') {
        const index = value.lastIndexOf('%');
        if (index !== -1 && (index + 1 === value.length || checkSpaceEnd(value, index))) {
            return +value.substring(0, index) / 100;
        }
    }
    return NaN;
}

export function isPercent(value: unknown) {
    return !isNaN(asPercent(value));
}

export function asPx(value: unknown) {
    if (typeof value === 'string') {
        const index = value.lastIndexOf('x');
        if (index !== -1 && value[index - 1] === 'p' && (index + 1 === value.length || checkSpaceEnd(value, index))) {
            return +value.substring(0, index - 1);
        }
    }
    return NaN;
}

export function isPx(value: unknown) {
    return !isNaN(asPx(value));
}

export function hasEm(value: string) {
    return REGEXP_EMWITHIN.test(value);
}

export function hasCalc(value: string) {
    return REGEXP_CALCWITHIN.test(value);
}

export function hasCustomProperty(value: string) {
    return REGEXP_VARWITHIN.test(value);
}

export function hasCoords(value: string) {
    return value === 'absolute' || value === 'fixed';
}

export function extractURL(value: string) {
    const match = CSS.URL.exec(value);
    if (match) {
        return match[2].trim();
    }
}

export function resolveURL(value: string) {
    const url = extractURL(value);
    if (url) {
        return resolvePath(url);
    }
}