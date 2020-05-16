import { parseColor } from './color';
import { USER_AGENT, getDeviceDPI, isUserAgent } from './client';
import { clamp, truncate, truncateFraction } from './math';
import { CSS, STRING, UNIT } from './regex';
import { convertAlpha, convertFloat, convertRoman, hasKeys, isNumber, isString, iterateArray, replaceMap, resolvePath, spliceString, splitEnclosing } from './util';

const STRING_SIZES = `(\\(\\s*(?:orientation:\\s*(?:portrait|landscape)|(?:max|min)-width:\\s*${STRING.LENGTH_PERCENTAGE})\\s*\\))`;
const REGEX_KEYFRAME = /((?:\d+%\s*,?\s*)+|from|to)\s*{\s*(.+?)\s*}/;
const REGEX_MEDIARULE = /(?:(not|only)?\s*(?:all|screen)\s+and\s+)?((?:\([^)]+\)(?:\s+and\s+)?)+),?\s*/g;
const REGEX_MEDIACONDITION = /\(([a-z-]+)\s*(:|<?=?|=?>?)?\s*([\w.%]+)?\)(?:\s+and\s+)?/g;
const REGEX_SRCSET = /^(.*?)(?:\s+([\d.]+)([xw]))?$/;
const REGEX_OPERATOR = /\s+([+-]\s+|\s*[*/])\s*/;
const REGEX_INTEGER = /^\s*-?\d+\s*$/;
const REGEX_SELECTORALL = /^\*(\s+\*){0,2}$/;
const REGEX_SELECTORTRIM = /^(\*\s+){1,2}/;
const REGEX_CALC = new RegExp(STRING.CSS_CALC);
const REGEX_LENGTH = new RegExp(`(${STRING.UNIT_LENGTH}|%)`);
const REGEX_SOURCESIZES = new RegExp(`\\s*(?:(\\(\\s*)?${STRING_SIZES}|(\\(\\s*))?\\s*(and|or|not)?\\s*(?:${STRING_SIZES}(\\s*\\))?)?\\s*(.+)`);
const CHAR_SPACE = /\s+/;
const CHAR_SEPARATOR = /\s*,\s*/;
const CHAR_DIVIDER = /\s*\/\s*/;

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
    const alignment: string[] = [];
    for (const seg of replaceMap(splitEnclosing(value.trim(), 'calc'), (item: string) => item.trim())) {
        if (seg.includes(' ') && !isCalc(seg)) {
            alignment.push(...seg.split(CHAR_SPACE));
        }
        else {
            alignment.push(seg);
        }
    }
    const length = alignment.length;
    switch (length) {
        case 1:
        case 2:
            return calculateVarAsString(element, alignment.join(' '), { dimension: ['width', 'height'], boundingBox, parent: false });
        case 3:
        case 4: {
            let horizontal = 0;
            let vertical = 0;
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
                            if (result !== '') {
                                alignment[i] = result;
                            }
                            else {
                                return '';
                            }
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

function calculateColor(element: CSSElement, value: string) {
    const color = splitEnclosing(value);
    const length = color.length;
    if (length > 1) {
        for (let i = 1; i < length; ++i) {
            const seg = color[i].trim();
            if (hasCalc(seg)) {
                const name = color[i - 1].trim();
                if (isColor(name)) {
                    const component = trimEnclosing(seg).split(CHAR_SEPARATOR);
                    const q = component.length;
                    if (q >= 3) {
                        const hsl = name.startsWith('hsl');
                        for (let j = 0; j < q; ++j) {
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
    for (let i = 0; i < length; ++i) {
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

function isAbsolutePosition(value: string) {
    switch (value) {
        case 'absolute':
        case 'fixed':
            return true;
    }
    return false;
}

function newBoxRectPosition(orientation: string[] = ['left', 'top']) {
    return {
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
    } as BoxRectPosition;
}

function checkCalculateNumber(operand: Undef<string>, operator: Undef<string>) {
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
}

function checkCalculateOperator(operand: Undef<string>, operator: Undef<string>) {
    if (operand) {
        switch (operator) {
            case '+':
            case '-':
                return false;
        }
    }
    return true;
}

const getInnerWidth = (dimension: Undef<Dimension>) => dimension?.width || window.innerWidth;
const getInnerHeight = (dimension: Undef<Dimension>) => dimension?.height || window.innerHeight;
const convertLength = (value: string, dimension: number, fontSize?: number, screenDimension?: Dimension) => isPercent(value) ? Math.round(convertFloat(value) / 100 * dimension) : parseUnit(value, fontSize, screenDimension);
const convertPercent = (value: string, dimension: number, fontSize?: number, screenDimension?: Dimension) => isPercent(value) ? parseFloat(value) / 100 : parseUnit(value, fontSize, screenDimension) / dimension;
const isColor = (value: string) => /(rgb|hsl)a?/.test(value);
const formatVar = (value: number) => !isNaN(value) ? value + 'px' : '';
const formatDecimal = (value: number) => !isNaN(value) ? value.toString() : '';
const trimEnclosing = (value: string) => value.substring(1, value.length - 1);
const trimSelector = (value: string) => REGEX_SELECTORALL.test(value) ? '*' : value.replace(REGEX_SELECTORTRIM, '');

export const CSS_PROPERTIES = {
    "alignContent": {
        "contain": true,
        "value": "normal"
    },
    "alignItems": {
        "contain": true,
        "value": "normal"
    },
    "alignSelf": {
        "contain": true,
        "value": "auto"
    },
    "animation": {
        "value": [
            "animationDuration",
            "animationTimingFunction",
            "animationDelay",
            "animationIterationCount",
            "animationDirection",
            "animationFillMode",
            "animationPlayState",
            "animationName"
        ]
    },
    "animationDelay": {
        "value": "0s"
    },
    "animationDirection": {
        "value": "normal"
    },
    "animationDuration": {
        "value": "0s"
    },
    "animationFillMode": {
        "value": "none"
    },
    "animationIterationCount": {
        "value": "1"
    },
    "animationName": {
        "value": "none"
    },
    "animationPlayState": {
        "value": "running"
    },
    "animationTimingFunction": {
        "value": "ease"
    },
    "backfaceVisibility": {
        "value": "visible"
    },
    "background": {
        "value": [
            "backgroundImage",
            "backgroundPositionX",
            "backgroundPositionY",
            "backgroundSize",
            "backgroundRepeat",
            "backgroundAttachment",
            "backgroundOrigin",
            "backgroundClip",
            "backgroundColor"
        ]
    },
    "backgroundAttachment": {
        "value": "scroll"
    },
    "backgroundClip": {
        "value": "border-box"
    },
    "backgroundColor": {
        "value": "transparent"
    },
    "backgroundImage": {
        "value": "none"
    },
    "backgroundOrigin": {
        "value": "padding-box"
    },
    "backgroundPosition": {
        "value": [
            "backgroundPositionX",
            "backgroundPositionY"
        ]
    },
    "backgroundPositionX": {
        "value": "0%"
    },
    "backgroundPositionY": {
        "value": "0%"
    },
    "backgroundRepeat": {
        "value": "repeat"
    },
    "backgroundSize": {
        "value": "auto auto"
    },
    "border": {
        "layout": true,
        "value": [
            "borderTopStyle",
            "borderTopWidth",
            "borderTopColor",
            "borderRightStyle",
            "borderRightWidth",
            "borderRightColor",
            "borderBottomStyle",
            "borderBottomWidth",
            "borderBottomColor",
            "borderLeftStyle",
            "borderLeftWidth",
            "borderLeftColor"
        ]
    },
    "borderBottom": {
        "value": [
            "borderBottomStyle",
            "borderBottomWidth",
            "borderBottomColor"
        ]
    },
    "borderBottomColor": {
        "value": "*"
    },
    "borderBottomLeftRadius": {
        "value": "0"
    },
    "borderBottomRightRadius": {
        "value": "0"
    },
    "borderBottomStyle": {
        "value": "none"
    },
    "borderBottomWidth": {
        "layout": true,
        "value": "medium"
    },
    "borderCollapse": {
        "layout": true,
        "value": "separate"
    },
    "borderColor": {
        "value": [
            "borderTopColor",
            "borderRightColor",
            "borderBottomColor",
            "borderLeftColor"
        ]
    },
    "borderImage": {
        "value": [
            "borderImageSource",
            "borderImageSlice",
            "borderImageWidth",
            "borderImageOutset",
            "borderImageRepeat"
        ]
    },
    "borderImageOutset": {
        "value": "0"
    },
    "borderImageRepeat": {
        "value": "stretch"
    },
    "borderImageSlice": {
        "value": "100%"
    },
    "borderImageSource": {
        "value": "none"
    },
    "borderImageWidth": {
        "value": "1"
    },
    "borderLeft": {
        "value": [
            "borderLeftStyle",
            "borderLeftWidth",
            "borderLeftColor"
        ]
    },
    "borderLeftColor": {
        "value": "*"
    },
    "borderLeftStyle": {
        "value": "none"
    },
    "borderLeftWidth": {
        "layout": true,
        "value": "medium"
    },
    "borderRadius": {
        "value": [
            "borderTopLeftRadius",
            "borderTopRightRadius",
            "borderBottomRightRadius",
            "borderBottomLeftRadius"
        ]
    },
    "borderRight": {
        "value": [
            "borderRightStyle",
            "borderRightWidth",
            "borderRightColor"
        ]
    },
    "borderRightColor": {
        "value": "*"
    },
    "borderRightStyle": {
        "value": "none"
    },
    "borderRightWidth": {
        "layout": true,
        "value": "medium"
    },
    "borderSpacing": {
        "value": "0"
    },
    "borderStyle": {
        "value": [
            "borderTopStyle",
            "borderRightStyle",
            "borderBottomStyle",
            "borderLeftStyle"
        ]
    },
    "borderTop": {
        "value": [
            "borderTopStyle",
            "borderTopWidth",
            "borderTopColor"
        ]
    },
    "borderTopColor": {
        "value": "*"
    },
    "borderTopLeftRadius": {
        "value": "0"
    },
    "borderTopRightRadius": {
        "value": "0"
    },
    "borderTopStyle": {
        "value": "none"
    },
    "borderTopWidth": {
        "layout": true,
        "value": "medium"
    },
    "borderWidth": {
        "layout": true,
        "value": [
            "borderTopWidth",
            "borderRightWidth",
            "borderBottomWidth",
            "borderLeftWidth"
        ]
    },
    "bottom": {
        "layout": true,
        "value": "auto"
    },
    "boxShadow": {
        "layout": true,
        "value": "none"
    },
    "boxSizing": {
        "layout": true,
        "value": "content-box"
    },
    "captionSide": {
        "value": "top"
    },
    "clear": {
        "layout": true,
        "value": "none"
    },
    "color": {
        "value": "*"
    },
    "columnCount": {
        "value": "auto"
    },
    "columnFill": {
        "value": "balance"
    },
    "columnGap": {
        "value": "normal"
    },
    "columnRule": {
        "value": [
            "columRuleWidth",
            "columnRuleStyle",
            "columnRuleColor"
        ]
    },
    "columnRuleColor": {
        "value": "*"
    },
    "columnRuleStyle": {
        "value": "none"
    },
    "columnRuleWidth": {
        "value": "medium"
    },
    "columnSpan": {
        "value": "none"
    },
    "columnWidth": {
        "value": "auto"
    },
    "columns": {
        "value": [
            "columnCount",
            "columnWidth"
        ]
    },
    "content": {
        "value": "normal"
    },
    "counterIncrement": {
        "value": "none"
    },
    "counterReset": {
        "value": "none"
    },
    "cursor": {
        "value": "auto"
    },
    "direction": {
        "layout": true,
        "value": "ltr"
    },
    "display": {
        "layout": true,
        "value": "inline"
    },
    "emptyCells": {
        "value": "show"
    },
    "flex": {
        "value": [
            "flexGrow",
            "flexShrink",
            "flexBasis"
        ]
    },
    "flexBasis": {
        "layout": true,
        "value": "auto"
    },
    "flexDirection": {
        "layout": true,
        "value": "row"
    },
    "flexFlow": {
        "layout": true,
        "value": [
            "flexDirection",
            "flexWrap"
        ]
    },
    "flexGrow": {
        "layout": true,
        "value": "0"
    },
    "flexShrink": {
        "layout": true,
        "value": "1"
    },
    "flexWrap": {
        "layout": true,
        "value": "nowrap"
    },
    "float": {
        "layout": true,
        "value": "none"
    },
    "font": {
        "layout": true,
        "value": [
            "fontStyle",
            "fontVariant",
            "fontWeight",
            "fontStretch",
            "fontSize",
            "lineHeight",
            "fontFamily"
        ]
    },
    "fontFamily": {
        "layout": true,
        "value": "*"
    },
    "fontFeatureSettings": {
        "layout": true,
        "value": "normal"
    },
    "fontKerning": {
        "layout": true,
        "value": "auto"
    },
    "fontSize": {
        "layout": true,
        "value": "medium"
    },
    "fontSizeAdjust": {
        "layout": true,
        "value": "none"
    },
    "fontStretch": {
        "layout": true,
        "value": "normal"
    },
    "fontStyle": {
        "layout": true,
        "value": "normal"
    },
    "fontVariant": {
        "layout": true,
        "value": [
            "fontVariantCaps",
            "fontVariantLigatures",
            "fontVariantNumeric",
            "fontVariantEastAsian"
        ]
    },
    "fontVariantCaps": {
        "layout": true,
        "value": "normal"
    },
    "fontVariantEastAsian": {
        "layout": true,
        "value": "normal"
    },
    "fontVariantLigatures": {
        "layout": true,
        "value": "normal"
    },
    "fontVariantNumeric": {
        "layout": true,
        "value": "normal"
    },
    "fontVariationSettings": {
        "layout": true,
        "value": "normal"
    },
    "fontWeight": {
        "layout": true,
        "value": "normal"
    },
    "gap": {
        "layout": true,
        "value": [
            "rowGap",
            "columnGap"
        ]
    },
    "grid": {
        "layout": true,
        "value": [
            "gridTemplateRows",
            "gridAutoColumns",
            "gridTemplateColumns",
            "gridAutoRows",
            "gridTemplateAreas",
            "gridAutoFlow",
            "gridRowGap",
            "gridColumnGap"
        ]
    },
    "gridArea": {
        "layout": true,
        "value": [
            "gridRowStart",
            "gridColumnStart",
            "gridRowEnd",
            "gridColumnEnd"
        ]
    },
    "gridAutoColumns": {
        "layout": true,
        "value": "auto"
    },
    "gridAutoFlow": {
        "layout": true,
        "value": "row"
    },
    "gridAutoRows": {
        "layout": true,
        "value": "auto"
    },
    "gridColumn": {
        "layout": true,
        "value": [
            "gridColumnStart",
            "gridColumnEnd"
        ]
    },
    "gridColumnEnd": {
        "layout": true,
        "value": "auto"
    },
    "gridColumnGap": {
        "layout": true,
        "value": "normal"
    },
    "gridColumnStart": {
        "layout": true,
        "value": "auto"
    },
    "gridGap": {
        "layout": true,
        "value": [
            "gridRowGap",
            "gridColumnGap"
        ]
    },
    "gridRow": {
        "layout": true,
        "value": [
            "gridRowStart",
            "gridRowEnd"
        ]
    },
    "gridRowEnd": {
        "layout": true,
        "value": "auto"
    },
    "gridRowGap": {
        "layout": true,
        "value": "normal"
    },
    "gridRowStart": {
        "layout": true,
        "value": "auto"
    },
    "gridTemplate": {
        "layout": true,
        "value": [
            "gridTemplateRows",
            "gridTemplateColumns",
            "gridTemplateAreas"
        ]
    },
    "gridTemplateAreas": {
        "layout": true,
        "value": "none"
    },
    "gridTemplateColumns": {
        "layout": true,
        "value": "none"
    },
    "gridTemplateRows": {
        "layout": true,
        "value": "none"
    },
    "height": {
        "layout": true,
        "value": "auto"
    },
    "justifyContent": {
        "contain": true,
        "value": "normal"
    },
    "justifyIems": {
        "contain": true,
        "value": "normal"
    },
    "justifySelf": {
        "contain": true,
        "value": "auto"
    },
    "left": {
        "layout": true,
        "value": "auto"
    },
    "letterSpacing": {
        "layout": true,
        "value": "normal"
    },
    "lineHeight": {
        "layout": true,
        "value": "normal"
    },
    "listStyle": {
        "layout": true,
        "value": [
            "listStyleType",
            "listStylePosition",
            "listStyleImage"
        ]
    },
    "listStyleImage": {
        "layout": true,
        "value": "normal"
    },
    "listStylePosition": {
        "layout": true,
        "value": "outside"
    },
    "listStyleType": {
        "layout": true,
        "value": "disc"
    },
    "margin": {
        "layout": true,
        "value": [
            "marginTop",
            "marginRight",
            "marginBottom",
            "marginLeft"
        ]
    },
    "marginBottom": {
        "layout": true,
        "value": "0"
    },
    "marginLeft": {
        "layout": true,
        "value": "0"
    },
    "marginRight": {
        "layout": true,
        "value": "0"
    },
    "marginTop": {
        "layout": true,
        "value": "0"
    },
    "maxHeight": {
        "layout": true,
        "value": "none"
    },
    "maxWidth": {
        "layout": true,
        "value": "none"
    },
    "minHeight": {
        "layout": true,
        "value": "0"
    },
    "minWidth": {
        "layout": true,
        "value": "0"
    },
    "offset": {
        "value": [
            "offsetPath",
            "offsetDistance",
            "offsetRotate",
            "offsetAnchor"
        ]
    },
    "offsetPath": {
        "value": ""
    },
    "offsetDistance": {
        "value": ""
    },
    "offsetRotate": {
        "value": ""
    },
    "offsetAnchor": {
        "value": ""
    },
    "opacity": {
        "value": "1"
    },
    "order": {
        "layout": true,
        "value": "0"
    },
    "outline": {
        "value": [
            "outlineWidth",
            "outlineStyle",
            "outlineColor"
        ]
    },
    "outlineColor": {
        "value": "invert"
    },
    "outlineOffset": {
        "value": "0"
    },
    "outlineStyle": {
        "value": "none"
    },
    "outlineWidth": {
        "value": "medium"
    },
    "overflow": {
        "layout": true,
        "value": [
            "overflowX",
            "overflowY"
        ]
    },
    "overflowX": {
        "layout": true,
        "value": "visible"
    },
    "overflowY": {
        "layout": true,
        "value": "visible"
    },
    "padding": {
        "layout": true,
        "value": [
            "paddingTop",
            "paddingRight",
            "paddingBottom",
            "paddingLeft"
        ]
    },
    "paddingBottom": {
        "layout": true,
        "value": "0"
    },
    "paddingLeft": {
        "layout": true,
        "value": "0"
    },
    "paddingRight": {
        "layout": true,
        "value": "0"
    },
    "paddingTop": {
        "layout": true,
        "value": "0"
    },
    "pageBreakAfter": {
        "value": ""
    },
    "pageBreakBefore": {
        "value": "auto"
    },
    "pageBreakInside": {
        "value": "auto"
    },
    "perspective": {
        "value": "none"
    },
    "perspectiveOrigin": {
        "value": "50% 50%"
    },
    "placeContent": {
        "contain": true,
        "value": [
           "alignContent",
           "justifyContent"
        ]
    },
    "placeItems": {
        "contain": true,
        "value": [
           "alignItems",
           "justifyItems"
        ]
    },
    "placeSelf": {
        "contain": true,
        "value": [
           "alignSelf",
           "justifySelf"
        ]
    },
    "position": {
        "layout": true,
        "value": "static"
    },
    "quotes": {
        "layout": true,
        "value": "none"
    },
    "resize": {
        "layout": true,
        "value": "none"
    },
    "right": {
        "layout": true,
        "value": "0"
    },
    "rowGap": {
        "layout": true,
        "value": "normal"
    },
    "scrollMargin": {
        "layout": true,
        "value": [
            "scrollMarginTop",
            "scrollMarginRight",
            "scrollMarginBottom",
            "scrollMarginLeft"
        ]
    },
    "scrollMarginBottom": {
        "layout": true,
        "value": "0"
    },
    "scrollMarginLeft": {
        "layout": true,
        "value": "0"
    },
    "scrollMarginRight": {
        "layout": true,
        "value": "0"
    },
    "scrollMarginTop": {
        "layout": true,
        "value": "0"
    },
    "scrollPadding": {
        "layout": true,
        "value": [
            "scrollPaddingTop",
            "scrollPaddingRight",
            "scrollPaddingBottom",
            "scrollPaddingLeft"
        ]
    },
    "scrollPaddingBottom": {
        "layout": true,
        "value": "0"
    },
    "scrollPaddingLeft": {
        "layout": true,
        "value": "0"
    },
    "scrollPaddingRight": {
        "layout": true,
        "value": "0"
    },
    "scrollPaddingTop": {
        "layout": true,
        "value": "0"
    },
    "tabSize": {
        "layout": true,
        "value": "8"
    },
    "tableLayout": {
        "layout": true,
        "value": "auto"
    },
    "textAlign": {
        "value": "left"
    },
    "textAlignLast": {
        "value": "auto"
    },
    "textDecoration": {
        "value": [
            "textDecorationLine",
            "textDecorationStyle",
            "textDecorationColor",
            "textDecorationThickness"
        ]
    },
    "textDecorationColor": {
        "value": "*"
    },
    "textDecorationLine": {
        "value": "none"
    },
    "textDecorationStyle": {
        "value": "solid"
    },
    "textDecorationThickness": {
        "value": "auto"
    },
    "textIndent": {
        "layout": true,
        "value": "0"
    },
    "textJustify": {
        "value": "auto"
    },
    "textOverflow": {
        "value": "clip"
    },
    "textShadow": {
        "value": "none"
    },
    "textTransform": {
        "layout": true,
        "value": "none"
    },
    "top": {
        "layout": true,
        "value": "0"
    },
    "transform": {
        "value": "none"
    },
    "transformOrigin": {
        "value": "50% 50% 0"
    },
    "transformStyle": {
        "value": "flat"
    },
    "transition": {
        "value": [
            "transitionProperty",
            "transitionDuration",
            "transitionTimingFunction",
            "transitionDelay"
        ]
    },
    "transitionDelay": {
        "value": "0s"
    },
    "transitionDuration": {
        "value": "0s"
    },
    "transitionProperty": {
        "value": "all"
    },
    "transitionTimingFunction": {
        "value": "ease"
    },
    "unicodeBidi": {
        "layout": true,
        "value": "normal"
    },
    "verticalAlign": {
        "layout": true,
        "value": "baseline"
    },
    "visibility": {
        "layout": true,
        "value": "visible"
    },
    "whiteSpace": {
        "layout": true,
        "value": "normal"
    },
    "width": {
        "layout": true,
        "value": "auto"
    },
    "wordBreak": {
        "layout": true,
        "value": "normal"
    },
    "wordSpacing": {
        "layout": true,
        "value": "normal"
    },
    "wordWrap": {
        "layout": true,
        "value": "normal"
    },
    "zIndex": {
        "value": "auto"
    }
};

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
        return { position: 'static', display: 'inline' } as CSSStyleDeclaration;
    }
    return { position: 'static', display: 'none' } as CSSStyleDeclaration;
}

export function getFontSize(element: Element) {
    if (element.nodeName.charAt(0) === '#') {
        element = element.parentElement || document.body;
    }
    return parseFloat(getStyle(element).getPropertyValue('font-size'));
}

export function hasComputedStyle(element: Element): element is HTMLElement {
    return element.nodeName.charAt(0) !== '#' && (element instanceof HTMLElement || element instanceof SVGElement);
}

export function parseSelectorText(value: string, document?: boolean) {
    value = document ? value.trim() : trimSelector(value.trim());
    if (value.includes(',')) {
        let normalized = value;
        let found = false;
        let match: Null<RegExpExecArray>;
        while ((match = CSS.SELECTOR_ATTR.exec(normalized)) !== null) {
            const index = match.index;
            const length = match[0].length;
            normalized = (index > 0 ? normalized.substring(0, index) : '') + '_'.repeat(length) + normalized.substring(index + length);
            found = true;
        }
        if (found) {
            const result = [];
            let position = 0;
            while (true) {
                const index = normalized.indexOf(',', position);
                if (index !== -1) {
                    const segment = value.substring(position, index).trim();
                    result.push(position === 0 ? segment : trimSelector(segment));
                    position = index + 1;
                }
                else {
                    if (position > 0) {
                        result.push(trimSelector(value.substring(position).trim()));
                    }
                    break;
                }
            }
            return result;
        }
        return replaceMap(value.split(CHAR_SEPARATOR), (selector: string) => trimSelector(selector));
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
        else if (segment.startsWith('*|*')) {
            if (segment.length > 3) {
                return 0;
            }
        }
        else if (segment.startsWith('*|')) {
            segment = segment.substring(2);
        }
        else if (segment.startsWith('::')) {
            return 0;
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
            if (subMatch[0].startsWith(':not(')) {
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
        case 'flexBasis': {
            const parentElement = element.parentElement;
            return formatVar(calculateVar(element, value, { dimension: !!parentElement && getStyle(parentElement).flexDirection.includes('column') ? 'height' : 'width', boundingBox, min: 0 }));
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
        case 'lineHeight':
            return formatVar(calculateVar(element, value, { boundingSize: getFontSize(element), min: 0 }));
        case 'fontSize':
            return formatVar(calculateVar(element, value, { boundingSize: getFontSize(element.parentElement || document.body), min: 0 }));
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
        case 'gap':
        case 'gridGap':
        case 'perspectiveOrigin':
            return calculateVarAsString(element, value, { dimension: ['width', 'height'], boundingBox, min: attr === 'perspectiveOrigin' ? undefined : 0, parent: false });
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
            return !isNaN(result) ? clamp(result / (percent ? 100 : 1)).toString() : '';
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
                for (let i = 1; i < length; ++i) {
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
                                const component = seg.split(CHAR_SEPARATOR);
                                const q = component.length;
                                if (q === 3 || q === 4) {
                                    calc = '';
                                    for (let j = 0; j < q; ++j) {
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
                for (let i = 1; i < length; ++i) {
                    const color = image[i];
                    if (isColor(color) && hasCalc(color)) {
                        const component = splitEnclosing(trimEnclosing(color));
                        const q = component.length;
                        for (let j = 1; j < q; ++j) {
                            if (hasCalc(component[j])) {
                                const previous = component[j - 1];
                                if (isColor(previous)) {
                                    const prefix = previous.split(CHAR_SPACE).pop() as string;
                                    const result = calculateColor(element, prefix + component[j]);
                                    if (result !== '') {
                                        component[j] = result.replace(prefix, '');
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
            value = value.trim();
            const color = splitEnclosing(value);
            const length = color.length;
            if (length > 1) {
                for (let i = 1; i < length; ++i) {
                    const previous = color[i - 1];
                    if (isColor(previous) && hasCalc(color[i])) {
                        const prefix = previous.split(CHAR_SPACE).pop() as string;
                        const result = calculateColor(element, prefix + color[i]);
                        if (result !== '') {
                            color[i] = result;
                            color[i - 1] = previous.substring(0, previous.length - prefix.length);
                        }
                        else {
                            return '';
                        }
                    }
                }
                return color.join('');
            }
            return value;
        }
        case 'boxShadow':
        case 'textShadow':
            return calculateVarAsString(element, calculateStyle(element, 'borderColor', value), { supportPercent: false, errorString: /-?[\d.]+[a-z]*\s+-?[\d.]+[a-z]*(\s+-[\d.]+[a-z]*)/ });
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
            return calculateVarAsString(element, value, { unitType: CSS_UNIT.TIME, min: 0, precision: 0, separator: ',' });
        case 'columns':
            return calculateGeneric(element, value, CSS_UNIT.INTEGER, 1, boundingBox);
        case 'borderImageSlice':
        case 'flex':
        case 'font':
            return calculateGeneric(element, value, CSS_UNIT.DECIMAL, 0, boundingBox);
        case 'backgroundPosition': {
            const result: string[] = [];
            for (const position of value.split(CHAR_SEPARATOR)) {
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
                for (let i = 1; i < length; ++i) {
                    const previous = border[i - 1];
                    const prefix = previous.split(CHAR_SPACE).pop() as string;
                    let result: string;
                    if (prefix === 'calc') {
                        result = formatVar(calculateVar(element, prefix + border[i], { min: 0, supportPercent: false }));
                    }
                    else if (isColor(prefix)) {
                        result = calculateColor(element, prefix + border[i]);
                    }
                    else {
                        continue;
                    }
                    if (result !== '') {
                        border[i] = result;
                        border[i - 1] = previous.substring(0, previous.length - prefix.length);
                    }
                    else {
                        return '';
                    }
                }
                return border.join('');
            }
            return value;
        }
        case 'animationTimingFunction':
        case 'transitionTimingFunction': {
            value = value.trim();
            const timingFunction = splitEnclosing(value);
            const length = timingFunction.length;
            if (length > 1) {
                for (let i = 1; i < length; ++i) {
                    let seg = timingFunction[i];
                    if (hasCalc(seg)) {
                        const prefix = timingFunction[i - 1].trim();
                        seg = trimEnclosing(seg);
                        let calc: Undef<string>;
                        if (prefix.endsWith('cubic-bezier')) {
                            const cubic = seg.split(CHAR_SEPARATOR);
                            const q = cubic.length;
                            if (q === 4) {
                                calc = '';
                                const options: CalculateVarOptions = { unitType: CSS_UNIT.DECIMAL, supportPercent: false };
                                for (let j = 0; j < q; ++j) {
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
                        else if (prefix.endsWith('steps')) {
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
                const prefix = path[0].trim();
                switch (prefix) {
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
                switch (prefix) {
                    case 'circle':
                    case 'ellipse': {
                        const result: string[] = [];
                        let [radius, position] = shape.split(/\s+at\s+/);
                        if (hasCalc(radius)) {
                            const options: CalculateVarAsStringOptions = { boundingBox, min: 0, parent: true };
                            if (prefix === 'circle') {
                                if (radius.includes('%')) {
                                    const { width, height } = boundingBox || getParentBoxDimension(element);
                                    if (width > 0 && height > 0) {
                                        options.boundingSize = Math.min(width, height);
                                    }
                                    else {
                                        return '';
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
                        for (let points of shape.split(CHAR_SEPARATOR)) {
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
                    return `${prefix}(${shape})`;
                }
            }
            return value;
        }
        case 'grid': {
            let [row, column] = value.trim().split(CHAR_DIVIDER);
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
            let [offset, anchor] = value.trim().split(CHAR_DIVIDER);
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
                if (hasCalc(slice)) {
                    slice = calculateStyle(element, 'borderImageSlice', slice, boundingBox);
                }
                if (slice !== '') {
                    let width: Undef<string>;
                    let outset: Undef<string>;
                    if (match[3]) {
                        [width, outset] = match[3].trim().split(CHAR_DIVIDER);
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
            return getStyle(element)[attr];
        default:
            if (attr.endsWith('Color')) {
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

export function getKeyframesRules(): ObjectMap<KeyframesData> {
    const result: ObjectMap<KeyframesData> = {};
    violation: {
        const styleSheets = document.styleSheets;
        const length = styleSheets.length;
        let i = 0;
        while (i < length) {
            const cssRules = (styleSheets[i++] as CSSStyleSheet).cssRules;
            if (cssRules) {
                const q = cssRules.length;
                for (let j = 0; j < q; ++j) {
                    try {
                        const item = cssRules[j] as CSSKeyframesRule;
                        if (item.type === CSSRule.KEYFRAMES_RULE) {
                            const value = parseKeyframes(item.cssRules);
                            if (hasKeys(value)) {
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

export function parseKeyframes(rules: CSSRuleList) {
    const result: KeyframesData = {};
    const length = rules.length;
    let i = 0;
    while (i < length) {
        const item = rules[i++];
        const match = REGEX_KEYFRAME.exec(item.cssText);
        if (match) {
            for (let percent of (item['keyText'] as string || match[1]).trim().split(CHAR_SEPARATOR)) {
                switch (percent) {
                    case 'from':
                        percent = '0%';
                        break;
                    case 'to':
                        percent = '100%';
                        break;
                }
                const keyframe: StringMap = {};
                for (const property of match[2].split(/\s*;\s*/)) {
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

export function checkMediaRule(value: string, fontSize?: number) {
    switch (value.trim()) {
        case 'all':
        case 'screen':
        case 'only all':
        case 'only screen':
            return true;
        default: {
            REGEX_MEDIARULE.lastIndex = 0;
            let match: Null<RegExpExecArray>;
            while ((match = REGEX_MEDIARULE.exec(value)) !== null) {
                REGEX_MEDIACONDITION.lastIndex = 0;
                const negate = match[1] === 'not';
                let valid = false;
                let condition: Null<RegExpExecArray>;
                while ((condition = REGEX_MEDIACONDITION.exec(match[2])) !== null) {
                    const attr = condition[1];
                    let operation = condition[2];
                    const rule = condition[3];
                    if (attr.startsWith('min')) {
                        operation = '>=';
                    }
                    else if (attr.startsWith('max')) {
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
                            valid = compareRange(operation, attr.endsWith('width') ? window.innerWidth : window.innerHeight, parseUnit(rule, fontSize));
                            break;
                        case 'orientation':
                            valid = rule === 'portrait' && window.innerWidth <= window.innerHeight || rule === 'landscape' && window.innerWidth > window.innerHeight;
                            break;
                        case 'resolution':
                        case 'min-resolution':
                        case 'max-resolution':
                            if (rule) {
                                let resolution = parseFloat(rule);
                                if (rule.endsWith('dpcm')) {
                                    resolution *= 2.54;
                                }
                                else if (rule.endsWith('dppx')) {
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
                if (!negate && valid || negate && !valid) {
                    return true;
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
        else if (value) {
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
    let orderedSize: Undef<number[]>, dimension: Undef<DimensionAttr[]>,  separator: Undef<string>,  unitType: Undef<number>, checkUnit: Undef<boolean>, errorString: Undef<RegExp>;
    const optionsVar = {} as CalculateVarOptions;
    if (options) {
        Object.assign(optionsVar, options);
        if (Array.isArray(options.orderedSize)) {
            orderedSize = options.orderedSize;
        }
        if (Array.isArray(options.dimension)) {
            dimension = options.dimension;
        }
        ({ separator, unitType, checkUnit, errorString } = options);
    }
    value = value.trim();
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
    for (let seg of (separator ? value.split(separator) : [value])) {
        seg = seg.trim();
        if (seg !== '') {
            const calc = splitEnclosing(seg, 'calc');
            const length = calc.length;
            if (length) {
                let partial = '';
                let i = 0, j = 0;
                while (i < length) {
                    let output = calc[i++];
                    if (isCalc(output)) {
                        if (orderedSize?.[j] !== undefined) {
                            optionsVar.boundingSize = orderedSize[j++];
                        }
                        else if (dimension) {
                            optionsVar.dimension = dimension[j++];
                            optionsVar.boundingSize = undefined;
                        }
                        else if (orderedSize) {
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
                                ++j;
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
    value = result.length === 1 ? result[0] : result.join(separator === ' ' ? ' ' : (separator ? separator + ' ' : ''));
    if (errorString) {
        let match: RegExpExecArray | null;
        while ((match = errorString.exec(value)) !== null) {
            if (match[1] === undefined) {
                return '';
            }
            const segment = match[0];
            let optional = segment;
            const length = match.length;
            let i = length - 1;
            while (i >= 1) {
                optional = optional.replace(new RegExp(match[i--] + '$'), '');
            }
            if (optional === segment) {
                return '';
            }
            else {
                value = value.replace(segment, optional);
            }
        }
    }
    return value;
}

export function calculateVar(element: CSSElement, value: string, options: CalculateVarOptions = {}) {
    const output = parseVar(element, value);
    if (output) {
        const { precision, unitType } = options;
        if (value.includes('%')) {
            if (options.supportPercent === false || unitType === CSS_UNIT.INTEGER) {
                return NaN;
            }
            else if (options.boundingSize === undefined) {
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

export function getParentBoxDimension(element: CSSElement) {
    const parentElement = element.parentElement;
    let width = 0;
    let height = 0;
    if (parentElement) {
        const style = getStyle(parentElement);
        ({ width, height } = parentElement.getBoundingClientRect());
        width = Math.max(0, width - getContentBoxWidth(style));
        height = Math.max(0, height - getContentBoxHeight(style));
    }
    return { width, height };
}

export function getBackgroundPosition(value: string, dimension: Dimension, options?: BackgroundPositionOptions) {
    value = value.trim();
    if (value !== '') {
        const orientation = value.split(CHAR_SPACE);
        if (orientation.length === 1) {
            orientation.push('center');
        }
        const length = orientation.length;
        if (length <= 4) {
            let fontSize: Undef<number>, imageDimension: Undef<Dimension>, imageSize: Undef<string>, screenDimension: Undef<Dimension>;
            if (options) {
                ({ fontSize, imageDimension, imageSize, screenDimension } = options);
            }
            const { width, height } = dimension;
            const result = newBoxRectPosition(orientation);
            const setImageOffset = (position: string, horizontal: boolean, direction: string, directionAsPercent: string) => {
                if (imageDimension && !isLength(position)) {
                    let offset = result[directionAsPercent];
                    if (imageSize && imageSize !== 'auto' && imageSize !== 'initial') {
                        const [sizeW, sizeH] = imageSize.split(CHAR_SPACE);
                        if (horizontal) {
                            let imageWidth = width;
                            if (isLength(sizeW, true)) {
                                if (isPercent(sizeW)) {
                                    imageWidth *= parseFloat(sizeW) / 100;
                                }
                                else {
                                    const unit = parseUnit(sizeW, fontSize, screenDimension);
                                    if (unit) {
                                        imageWidth = unit;
                                    }
                                }
                            }
                            else if (sizeH) {
                                let percent = 1;
                                if (isPercent(sizeH)) {
                                    percent = (parseFloat(sizeH) / 100 * height) / imageDimension.height;
                                }
                                else if (isLength(sizeH)) {
                                    const unit = parseUnit(sizeH, fontSize, screenDimension);
                                    if (unit) {
                                        percent = unit / imageDimension.height;
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
                                    const unit = parseUnit(sizeH, fontSize, screenDimension);
                                    if (unit) {
                                        imageHeight = unit;
                                    }
                                }
                            }
                            else if (sizeW) {
                                let percent = 1;
                                if (isPercent(sizeW)) {
                                    percent = (parseFloat(sizeW) / 100 * width) / imageDimension.width;
                                }
                                else if (isLength(sizeW)) {
                                    const unit = parseUnit(sizeW, fontSize, screenDimension);
                                    if (unit) {
                                        percent = unit / imageDimension.width;
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
            if (length === 2) {
                orientation.sort((a, b) => {
                    switch (a) {
                        case 'left':
                        case 'right':
                            return -1;
                        case 'top':
                        case 'bottom':
                            return 1;
                    }
                    switch (b) {
                        case 'left':
                        case 'right':
                            return 1;
                        case 'top':
                        case 'bottom':
                            return -1;
                    }
                    return 0;
                });
                for (let i = 0; i < 2; ++i) {
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
                            position = 'center';
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
            else {
                let horizontal = 0;
                let vertical = 0;
                const checkPosition = (position: string, nextPosition?: string) => {
                    switch (position) {
                        case 'left':
                        case 'right':
                            result.horizontal = position;
                            ++horizontal;
                            break;
                        case 'center':
                            if (length === 4) {
                                return false;
                            }
                            else {
                                let centerHorizontal = true;
                                if (nextPosition === undefined) {
                                    if (horizontal > 0) {
                                        result.vertical = position;
                                        centerHorizontal = false;
                                    }
                                    else {
                                        result.horizontal = position;
                                    }
                                }
                                else {
                                    switch (nextPosition) {
                                        case 'left':
                                        case 'right':
                                            result.vertical = position;
                                            centerHorizontal = false;
                                            break;
                                        case 'top':
                                        case 'bottom':
                                            result.horizontal = position;
                                            break;
                                        default:
                                            return false;
                                    }
                                }
                                if (centerHorizontal) {
                                    result.left = width / 2;
                                    result.leftAsPercent = 0.5;
                                    setImageOffset(position, true, 'left', 'leftAsPercent');
                                }
                                else {
                                    result.top = height / 2;
                                    result.topAsPercent = 0.5;
                                    setImageOffset(position, false, 'top', 'topAsPercent');
                                }
                            }
                            break;
                        case 'top':
                        case 'bottom':
                            result.vertical = position;
                            ++vertical;
                            break;
                        default:
                            return false;
                    }
                    return horizontal < 2 && vertical < 2;
                };
                for (let i = 0; i < length; ++i) {
                    const position = orientation[i];
                    if (isLength(position, true)) {
                        const alignment = orientation[i - 1];
                        switch (alignment) {
                            case 'left':
                            case 'right': {
                                const location = convertLength(position, width, fontSize, screenDimension);
                                const locationAsPercent = convertPercent(position, width, fontSize, screenDimension);
                                if (alignment === 'right') {
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
                            case 'top':
                            case 'bottom': {
                                const location = convertLength(position, height, fontSize, screenDimension);
                                const locationAsPercent = convertPercent(position, height, fontSize, screenDimension);
                                if (alignment === 'bottom') {
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
                            default:
                                return newBoxRectPosition();
                        }
                    }
                    else if (!checkPosition(position, orientation[i + 1])) {
                        return newBoxRectPosition();
                    }
                }
            }
            result.static = result.top === 0 && result.right === 0 && result.bottom === 0 && result.left === 0;
            return result;
        }
    }
    return newBoxRectPosition();
}

export function getSrcSet(element: HTMLImageElement, mimeType?: string[]) {
    const parentElement = element.parentElement as HTMLPictureElement;
    const result: ImageSrcSet[] = [];
    let { srcset, sizes } = element;
    if (parentElement?.tagName === 'PICTURE') {
        iterateArray(parentElement.children, (item: HTMLSourceElement) => {
            if (item.tagName === 'SOURCE') {
                const { media, type, srcset: srcsetA } = item;
                if (isString(srcsetA) && !(isString(media) && !checkMediaRule(media)) && (!isString(type) || !mimeType || mimeType.includes(type.trim().toLowerCase()))) {
                    srcset = srcsetA;
                    sizes = item.sizes;
                    return true;
                }
            }
            return;
        });
    }
    if (srcset !== '') {
        for (const value of srcset.trim().split(CHAR_SEPARATOR)) {
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
                result.push({ src: resolvePath(match[1].split(CHAR_SPACE)[0]), pixelRatio, width });
            }
        }
    }
    const length = result.length;
    if (length === 0) {
        result.push({ src: element.src, pixelRatio: 1, width: 0 });
    }
    else if (length > 1) {
        result.sort((a, b) => {
            const pxA = a.pixelRatio, pxB = b.pixelRatio;
            if (pxA > 0 && pxB > 0) {
                if (pxA !== pxB) {
                    return pxA < pxB ? -1 : 1;
                }
            }
            else {
                const widthA = a.width, widthB = b.width;
                if (widthA !== widthB && widthA > 0 && widthB > 0) {
                    return widthA < widthB ? -1 : 1;
                }
            }
            return 0;
        });
        if (isString(sizes)) {
            let width = NaN;
            for (const value of sizes.trim().split(CHAR_SEPARATOR)) {
                let match = REGEX_SOURCESIZES.exec(value);
                if (match) {
                    const ruleA = match[2] ? checkMediaRule(match[2]) : undefined;
                    const ruleB = match[6] ? checkMediaRule(match[6]) : undefined;
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
                            width = calculate(match[1], match[1].includes('%') ? { boundingSize: getParentBoxDimension(element).width } : undefined);
                        }
                        else if (isPercent(unit)) {
                            width = parseFloat(unit) / 100 * getParentBoxDimension(element).width;
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
                for (let i = 0; i < length; ++i) {
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
                let i = 1;
                while (i < length) {
                    const item = result[i++];
                    if (item.pixelRatio === 0) {
                        item.pixelRatio = item.width / width;
                    }
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

export function extractURL(value: string) {
    const match = CSS.URL.exec(value);
    return match ? match[1] || match[2] : '';
}

export function resolveURL(value: string) {
    value = extractURL(value);
    return value !== '' ? resolvePath(value) : '';
}

export function insertStyleSheetRule(value: string, index = 0) {
    const style = document.createElement('style');
    if (isUserAgent(USER_AGENT.SAFARI)) {
        style.appendChild(document.createTextNode(''));
    }
    document.head.appendChild(style);
    const sheet = style.sheet as CSSStyleSheet;
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

export function convertPX(value: string, fontSize?: number) {
    return value ? parseUnit(value, fontSize) + 'px' : '0px';
}

export function calculate(value: string, options?: CalculateOptions) {
    value = value.trim();
    if (value === '') {
        return NaN;
    }
    let length = value.length;
    if (value.charAt(0) !== '(' || value.charAt(length - 1) !== ')') {
        value = `(${value})`;
        length += 2;
    }
    let opened = 0;
    const opening: boolean[] = [];
    const closing: number[] = [];
    for (let i = 0; i < length; ++i) {
        switch (value.charAt(i)) {
            case '(':
                ++opened;
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
            for (let i = 0; i < closing.length; ++i) {
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
                    let boundingSize: Undef<number>, min: Undef<number>, max: Undef<number>, unitType: Undef<number>, fontSize: Undef<number>;
                    if (options) {
                        ({ boundingSize, min, max, unitType, fontSize } = options);
                    }
                    let operand: Undef<string>, operator: Undef<string>;
                    let found = false;
                    const seg: number[] = [];
                    const evaluate: string[] = [];
                    const operation = value.substring(j + 1, closing[i]).split(REGEX_OPERATOR);
                    const q = operation.length;
                    let k = 0;
                    while (k < q) {
                        const partial = operation[k++].trim();
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
                                            if (!checkCalculateNumber(operand, operator)) {
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
                                                if (!checkCalculateOperator(operand, operator)) {
                                                    return NaN;
                                                }
                                                seg.push(parseFloat(partial));
                                            }
                                            else if (isPercent(partial)) {
                                                if (!checkCalculateNumber(operand, operator)) {
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
                                                if (!checkCalculateOperator(operand, operator)) {
                                                    return NaN;
                                                }
                                                seg.push(parseFloat(partial));
                                            }
                                            else if (isTime(partial)) {
                                                if (!checkCalculateNumber(operand, operator)) {
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
                                                if (!checkCalculateOperator(operand, operator)) {
                                                    return NaN;
                                                }
                                                seg.push(parseFloat(partial));
                                            }
                                            else if (isAngle(partial)) {
                                                if (!checkCalculateNumber(operand, operator)) {
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
                                                if (!checkCalculateOperator(operand, operator)) {
                                                    return NaN;
                                                }
                                                seg.push(parseFloat(partial));
                                            }
                                            else if (isLength(partial)) {
                                                if (!checkCalculateNumber(operand, operator)) {
                                                    return NaN;
                                                }
                                                seg.push(parseUnit(partial, fontSize));
                                                found = true;
                                            }
                                            else if (isPercent(partial) && boundingSize !== undefined && !isNaN(boundingSize)) {
                                                if (!checkCalculateNumber(operand, operator)) {
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
                    for (k = 0; k < evaluate.length; ++k) {
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
                    for (k = 0; k < evaluate.length; ++k) {
                        if (evaluate[k] === '*') {
                            seg.splice(k, 2, seg[k] * seg[k + 1]);
                            evaluate.splice(k--, 1);
                        }
                    }
                    for (k = 0; k < evaluate.length; ++k) {
                        seg.splice(k, 2, seg[k] + seg[k + 1] * (evaluate[k] === '-' ? -1 : 1));
                        evaluate.splice(k--, 1);
                    }
                    if (seg.length === 1) {
                        if (closing.length === 1) {
                            const result = seg[0];
                            if (min !== undefined && result < min || max !== undefined && result > max) {
                                return NaN;
                            }
                            return truncateFraction(result);
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
                return result;
            case 'em':
            case 'ch':
                return result * (fontSize ?? (getFontSize(document.body) || 16));
            case 'rem':
                return result * (getFontSize(document.querySelector('html') || document.body) || 16);
            case 'pc':
                result *= 12;
            case 'pt':
                return result * 4 / 3;
            case 'mm':
                result /= 10;
            case 'cm':
                result /= 2.54;
            case 'in':
                return result * getDeviceDPI();
            case 'vw':
                return result * getInnerWidth(screenDimension) / 100;
            case 'vh':
                return result * getInnerHeight(screenDimension) / 100;
            case 'vmin':
                return result * Math.min(getInnerWidth(screenDimension), getInnerHeight(screenDimension)) / 100;
            case 'vmax':
                return result * Math.max(getInnerWidth(screenDimension), getInnerHeight(screenDimension)) / 100;
        }
    }
    return 0;
}

export function parseAngle(value: string) {
    const match = CSS.ANGLE.exec(value);
    return match ? convertAngle(match[1], match[2]) : 0;
}

export function parseTime(value: string) {
    const match = CSS.TIME.exec(value);
    if (match) {
        switch (match[2]) {
            case 'ms':
                return parseInt(match[1]);
            case 's':
                return parseFloat(match[1]) * 1000;
        }
    }
    return 0;
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