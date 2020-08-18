import { parseColor } from './color';
import { USER_AGENT, getDeviceDPI, isUserAgent } from './client';
import { clamp, truncate, truncateFraction } from './math';
import { CSS, STRING, TRANSFORM } from './regex';
import { getElementCache, setElementCache } from './session';
import { convertAlpha, convertFloat, convertHyphenated, convertRoman, hasBit, hasKeys, isNumber, isString, iterateArray, replaceMap, resolvePath, spliceString, splitEnclosing, splitPair, trimBoth } from './util';

const DOCUMENT_ELEMENT = document.documentElement;
const DOCUMENT_FIXEDMAP = [9/13, 10/13, 12/13, 16/13, 20/13, 2, 3];
const DOCUMENT_FIXEDSIZE = 13;
let DOCUMENT_FONTMAP!: number[];
let DOCUMENT_FONTBASE!: number;
let DOCUMENT_FONTSIZE!: number;

const PATTERN_SIZES = `(\\(\\s*(?:orientation:\\s*(?:portrait|landscape)|(?:max|min)-width:\\s*${STRING.LENGTH_PERCENTAGE})\\s*\\))`;
const REGEXP_LENGTH = new RegExp(`^${STRING.LENGTH}$`);
const REGEXP_PERCENT = new RegExp(`^${STRING.PERCENT}$`);
const REGEXP_LENGTHPERCENTAGE = new RegExp(`^${STRING.LENGTH_PERCENTAGE}$`);
const REGEXP_ANGLE = new RegExp(`^${STRING.CSS_ANGLE}$`);
const REGEXP_TIME = new RegExp(`^${STRING.CSS_TIME}$`);
const REGEXP_CALC = new RegExp(`^${STRING.CSS_CALC}$`);
const REGEXP_CALCWITHIN = new RegExp(STRING.CSS_CALC);
const REGEXP_SOURCESIZES = new RegExp(`\\s*(?:(\\(\\s*)?${PATTERN_SIZES}|(\\(\\s*))?\\s*(and|or|not)?\\s*(?:${PATTERN_SIZES}(\\s*\\))?)?\\s*(.+)`);
const REGEXP_KEYFRAMES = /((?:\d+%\s*,?\s*)+|from|to)\s*{\s*(.+?)\s*}/;
const REGEXP_MEDIARULE = /(?:(not|only)?\s*(?:all|screen)\s+and\s+)?((?:\([^)]+\)(?:\s+and\s+)?)+),?\s*/g;
const REGEXP_MEDIARULECONDITION = /\(([a-z-]+)\s*(:|<?=?|=?>?)?\s*([\w.%]+)?\)(?:\s+and\s+)?/g;
const REGEXP_VAR = /var\((--[A-Za-z\d-]+)\s*(?!,\s*var\()(?:,\s*([a-z-]+\([^)]+\)|[^)]+))?\)/;
const REGEXP_CUSTOMPROPERTY = /^\s*var\(--.+\)$/;
const REGEXP_IMGSRCSET = /^(.*?)(?:\s+([\d.]+)([xw]))?$/;
const REGEXP_CALCOPERATION = /\s+([+-]\s+|\s*[*/])\s*/;
const REGEXP_CALCUNIT = /\s*{(\d+)}\s*/;
const REGEXP_TRANSFORM = /(\w+)\([^)]+\)/g;
const REGEXP_EM = /\dem$/;
const REGEXP_EMBASED = /\d(?:em|ch|ex)\b/;
const CHAR_SPACE = /\s+/;
const CHAR_SEPARATOR = /\s*,\s*/;
const CHAR_DIVIDER = /\s*\/\s*/;

updateDocumentFont();

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
    for (let i = 0, length = segments.length; i < length; ++i) {
        const seg = segments[i];
        if (isCalc(seg)) {
            const px = REGEXP_LENGTH.test(seg);
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

function getWritingMode(value?: string) {
    if (!value) {
        return 0;
    }
    switch (value) {
        case 'vertical-lr':
            return 1;
        case 'vertical-rl':
            return 2;
        default:
            return 0;
    }
}

function hasBorderStyle(value: string) {
    switch (value) {
        case 'none':
        case 'initial':
        case 'hidden':
            return false;
        default:
            return true;
    }
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

const fromFontNamedValue = (index: number, fixedWidth?: boolean) => (!fixedWidth ? DOCUMENT_FONTMAP[index] : DOCUMENT_FIXEDMAP[index]).toPrecision(8) + 'rem';
const getInnerWidth = (dimension: Undef<Dimension>) => dimension && dimension.width || window.innerWidth;
const getInnerHeight = (dimension: Undef<Dimension>) => dimension && dimension.height || window.innerHeight;
const isColor = (value: string) => /(rgb|hsl)a?/.test(value);
const formatVar = (value: number) => !isNaN(value) ? value + 'px' : '';
const formatDecimal = (value: number) => !isNaN(value) ? value.toString() : '';
const trimEnclosing = (value: string) => value.substring(1, value.length - 1);
const trimSelector = (value: string) => /^\*(\s+\*){0,2}$/.test(value) ? '*' : value.replace(/^(\*\s+){1,2}/, '');

export const enum CSS_UNIT {
    NONE = 0,
    LENGTH = 1,
    PERCENT = 1 << 1,
    TIME = 1 << 2,
    ANGLE = 1 << 3,
    INTEGER = 1 << 4,
    DECIMAL = 1 << 5
}

export const enum CSS_TRAITS {
    CALC = 1,
    SHORTHAND = 1 << 1,
    LAYOUT = 1 << 2,
    CONTAIN = 1 << 3,
    COLOR = 1 << 4,
    DEPRECATED = 1 << 5,
    NONE = 1 << 6,
    AUTO = 1 << 7,
    UNIT = 1 << 8
}

export const CSS_PROPERTIES: CssProperties = {
    alignContent: {
        trait: CSS_TRAITS.CONTAIN,
        value: 'normal'
    },
    alignItems: {
        trait: CSS_TRAITS.CONTAIN,
        value: 'normal'
    },
    alignSelf: {
        trait: CSS_TRAITS.CONTAIN,
        value: 'auto'
    },
    animation: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND,
        value: [
            'animationDuration',
            'animationTimingFunction',
            'animationDelay',
            'animationIterationCount',
            'animationDirection',
            'animationFillMode',
            'animationPlayState',
            'animationName'
        ]
    },
    animationDelay: {
        trait: CSS_TRAITS.CALC,
        value: '0s'
    },
    animationDirection: {
        trait: 0,
        value: 'normal'
    },
    animationDuration: {
        trait: CSS_TRAITS.CALC,
        value: '0s'
    },
    animationFillMode: {
        trait: 0,
        value: 'none'
    },
    animationIterationCount: {
        trait: CSS_TRAITS.CALC,
        value: '1'
    },
    animationName: {
        trait: 0,
        value: 'none'
    },
    animationPlayState: {
        trait: 0,
        value: 'running'
    },
    animationTimingFunction: {
        trait: 0,
        value: 'ease'
    },
    backfaceVisibility: {
        trait: 0,
        value: 'visible'
    },
    background: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND | CSS_TRAITS.NONE | CSS_TRAITS.AUTO,
        value: [
            'backgroundImage',
            'backgroundPositionX',
            'backgroundPositionY',
            'backgroundSize',
            'backgroundRepeat',
            'backgroundAttachment',
            'backgroundOrigin',
            'backgroundClip',
            'backgroundColor'
        ]
    },
    backgroundAttachment: {
        trait: 0,
        value: 'scroll'
    },
    backgroundClip: {
        trait: 0,
        value: 'border-box'
    },
    backgroundColor: {
        trait: CSS_TRAITS.CALC,
        value: 'transparent'
    },
    backgroundImage: {
        trait: CSS_TRAITS.CALC,
        value: 'none'
    },
    backgroundOrigin: {
        trait: 0,
        value: 'padding-box'
    },
    backgroundPosition: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND,
        value: [
            'backgroundPositionX',
            'backgroundPositionY'
        ]
    },
    backgroundPositionX: {
        trait: CSS_TRAITS.CALC,
        value: 'left'
    },
    backgroundPositionY: {
        trait: CSS_TRAITS.CALC,
        value: 'top'
    },
    backgroundRepeat: {
        trait: 0,
        value: 'repeat'
    },
    backgroundSize: {
        trait: CSS_TRAITS.CALC,
        value: 'auto'
    },
    border: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND | CSS_TRAITS.LAYOUT | CSS_TRAITS.NONE,
        value: [
            'borderTopWidth',
            'borderTopStyle',
            'borderTopColor',
            'borderRightWidth',
            'borderRightStyle',
            'borderRightColor',
            'borderBottomWidth',
            'borderBottomStyle',
            'borderBottomColor',
            'borderLeftWidth',
            'borderLeftStyle',
            'borderLeftColor'
        ]
    },
    borderBottom: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND | CSS_TRAITS.NONE,
        value: [
            'borderBottomWidth',
            'borderBottomStyle',
            'borderBottomColor'
        ]
    },
    borderBottomColor: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.COLOR,
        value: 'currentcolor'
    },
    borderBottomLeftRadius: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.UNIT,
        value: '0'
    },
    borderBottomRightRadius: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.UNIT,
        value: '0'
    },
    borderBottomStyle: {
        trait: 0,
        value: 'none'
    },
    borderBottomWidth: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'medium'
    },
    borderCollapse: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'separate'
    },
    borderColor: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND,
        value: [
            'borderTopColor',
            'borderRightColor',
            'borderBottomColor',
            'borderLeftColor'
        ]
    },
    borderImage: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND | CSS_TRAITS.NONE,
        value: [
            'borderImageSource',
            'borderImageSlice',
            'borderImageWidth',
            'borderImageOutset',
            'borderImageRepeat'
        ],
        valueOfNone: 'none 100% / 1 / 0 stretch'
    },
    borderImageOutset: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.UNIT,
        value: '0'
    },
    borderImageRepeat: {
        trait: 0,
        value: 'stretch'
    },
    borderImageSlice: {
        trait: CSS_TRAITS.CALC,
        value: '100%'
    },
    borderImageSource: {
        trait: CSS_TRAITS.CALC,
        value: 'none'
    },
    borderImageWidth: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.UNIT,
        value: '1'
    },
    borderLeft: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND | CSS_TRAITS.NONE,
        value: [
            'borderLeftWidth',
            'borderLeftStyle',
            'borderLeftColor'
        ]
    },
    borderLeftColor: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.COLOR,
        value: 'currentcolor'
    },
    borderLeftStyle: {
        trait: 0,
        value: 'none'
    },
    borderLeftWidth: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'medium'
    },
    borderRadius: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND,
        value: [
            'borderTopLeftRadius',
            'borderTopRightRadius',
            'borderBottomRightRadius',
            'borderBottomLeftRadius'
        ]
    },
    borderRight: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND | CSS_TRAITS.NONE,
        value: [
            'borderRightWidth',
            'borderRightStyle',
            'borderRightColor'
        ]
    },
    borderRightColor: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.COLOR,
        value: 'currentcolor'
    },
    borderRightStyle: {
        trait: 0,
        value: 'none'
    },
    borderRightWidth: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'medium'
    },
    borderSpacing: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.UNIT,
        value: '0'
    },
    borderStyle: {
        trait: CSS_TRAITS.SHORTHAND | CSS_TRAITS.NONE,
        value: [
            'borderTopStyle',
            'borderRightStyle',
            'borderBottomStyle',
            'borderLeftStyle'
        ]
    },
    borderTop: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND | CSS_TRAITS.NONE,
        value: [
            'borderTopWidth',
            'borderTopStyle',
            'borderTopColor'
        ]
    },
    borderTopColor: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.COLOR,
        value: 'currentcolor'
    },
    borderTopLeftRadius: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.UNIT,
        value: '0'
    },
    borderTopRightRadius: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.UNIT,
        value: '0'
    },
    borderTopStyle: {
        trait: 0,
        value: 'none'
    },
    borderTopWidth: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'medium'
    },
    borderWidth: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND | CSS_TRAITS.LAYOUT,
        value: [
            'borderTopWidth',
            'borderRightWidth',
            'borderBottomWidth',
            'borderLeftWidth'
        ]
    },
    bottom: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'auto'
    },
    boxShadow: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'none'
    },
    boxSizing: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'content-box'
    },
    captionSide: {
        trait: 0,
        value: 'top'
    },
    clear: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'none'
    },
    clip: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.DEPRECATED,
        value: 'clip'
    },
    clipPath: {
        trait: CSS_TRAITS.CALC,
        value: 'none'
    },
    color: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.COLOR,
        value: 'black'
    },
    columnCount: {
        trait: CSS_TRAITS.CALC,
        value: 'auto'
    },
    columnFill: {
        trait: 0,
        value: 'balance'
    },
    columnGap: {
        trait: CSS_TRAITS.CALC,
        value: 'normal'
    },
    columnRule: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND | CSS_TRAITS.NONE,
        value: [
            'columnRuleWidth',
            'columnRuleStyle',
            'columnRuleColor'
        ]
    },
    columnRuleColor: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.COLOR,
        value: 'currentcolor'
    },
    columnRuleStyle: {
        trait: 0,
        value: 'none'
    },
    columnRuleWidth: {
        trait: CSS_TRAITS.CALC,
        value: 'medium'
    },
    columnSpan: {
        trait: 0,
        value: 'none'
    },
    columnWidth: {
        trait: CSS_TRAITS.CALC,
        value: 'auto'
    },
    columns: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND | CSS_TRAITS.AUTO,
        value: [
            'columnCount',
            'columnWidth'
        ]
    },
    content: {
        trait: 0,
        value: 'normal'
    },
    counterIncrement: {
        trait: CSS_TRAITS.CALC,
        value: 'none'
    },
    counterReset: {
        trait: CSS_TRAITS.CALC,
        value: 'none'
    },
    cursor: {
        trait: 0,
        value: 'auto'
    },
    direction: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'ltr'
    },
    display: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'inline'
    },
    emptyCells: {
        trait: 0,
        value: 'show'
    },
    flex: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND | CSS_TRAITS.AUTO,
        value: [
            'flexGrow',
            'flexShrink',
            'flexBasis'
        ]
    },
    flexBasis: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'auto'
    },
    flexDirection: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'row'
    },
    flexFlow: {
        trait: CSS_TRAITS.SHORTHAND | CSS_TRAITS.LAYOUT,
        value: [
            'flexDirection',
            'flexWrap'
        ]
    },
    flexGrow: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT | CSS_TRAITS.UNIT,
        value: '0'
    },
    flexShrink: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT | CSS_TRAITS.UNIT,
        value: '1'
    },
    flexWrap: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'nowrap'
    },
    float: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'none'
    },
    font: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND | CSS_TRAITS.LAYOUT,
        value: [
            'fontStyle',
            'fontVariant',
            'fontWeight',
            'fontStretch',
            'fontSize',
            'lineHeight',
            'fontFamily'
        ]
    },
    fontFamily: {
        trait: CSS_TRAITS.LAYOUT,
        value: ''
    },
    fontFeatureSettings: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'normal'
    },
    fontKerning: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'auto'
    },
    fontSize: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'medium'
    },
    fontSizeAdjust: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'none'
    },
    fontStretch: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'normal'
    },
    fontStyle: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'normal'
    },
    fontVariant: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND | CSS_TRAITS.LAYOUT | CSS_TRAITS.NONE,
        value: [
            'fontVariantCaps',
            'fontVariantLigatures',
            'fontVariantNumeric',
            'fontVariantEastAsian'
        ],
        valueOfNone: 'no-common-ligatures no-discretionary-ligatures no-historical-ligatures no-contextual'
    },
    fontVariantCaps: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'normal'
    },
    fontVariantEastAsian: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'normal'
    },
    fontVariantLigatures: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'normal'
    },
    fontVariantNumeric: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'normal'
    },
    fontVariationSettings: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'normal'
    },
    fontWeight: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'normal'
    },
    gap: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND | CSS_TRAITS.LAYOUT,
        value: [
            'rowGap',
            'columnGap'
        ]
    },
    grid: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND | CSS_TRAITS.LAYOUT,
        value: [
            'gridTemplateRows',
            'gridAutoColumns',
            'gridTemplateColumns',
            'gridAutoRows',
            'gridTemplateAreas',
            'gridAutoFlow',
            'gridRowGap',
            'gridColumnGap'
        ]
    },
    gridArea: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND | CSS_TRAITS.LAYOUT | CSS_TRAITS.NONE | CSS_TRAITS.AUTO,
        value: [
            'gridRowStart',
            'gridColumnStart',
            'gridRowEnd',
            'gridColumnEnd'
        ],
        valueOfNone: 'none / none / none / none'
    },
    gridAutoColumns: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'auto'
    },
    gridAutoFlow: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'row'
    },
    gridAutoRows: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'auto'
    },
    gridColumn: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND | CSS_TRAITS.LAYOUT | CSS_TRAITS.NONE,
        value: [
            'gridColumnStart',
            'gridColumnEnd'
        ],
        valueOfNone: 'none / none'
    },
    gridColumnEnd: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'auto'
    },
    gridColumnGap: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'normal'
    },
    gridColumnStart: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'auto'
    },
    gridGap: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND | CSS_TRAITS.LAYOUT,
        value: [
            'gridRowGap',
            'gridColumnGap'
        ]
    },
    gridRow: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND | CSS_TRAITS.LAYOUT | CSS_TRAITS.NONE,
        value: [
            'gridRowStart',
            'gridRowEnd'
        ],
        valueOfNone: 'none / none'
    },
    gridRowEnd: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'auto'
    },
    gridRowGap: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'normal'
    },
    gridRowStart: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'auto'
    },
    gridTemplate: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND | CSS_TRAITS.LAYOUT,
        value: [
            'gridTemplateRows',
            'gridTemplateColumns',
            'gridTemplateAreas'
        ]
    },
    gridTemplateAreas: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'none'
    },
    gridTemplateColumns: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'none'
    },
    gridTemplateRows: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'none'
    },
    height: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'auto'
    },
    justifyContent: {
        trait: CSS_TRAITS.CONTAIN,
        value: 'normal'
    },
    justifyItems: {
        trait: CSS_TRAITS.CONTAIN,
        value: 'normal'
    },
    justifySelf: {
        trait: CSS_TRAITS.CONTAIN,
        value: 'auto'
    },
    left: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'auto'
    },
    letterSpacing: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'normal'
    },
    lineHeight: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'normal'
    },
    listStyle: {
        trait: CSS_TRAITS.SHORTHAND | CSS_TRAITS.LAYOUT,
        value: [
            'listStyleType',
            'listStylePosition',
            'listStyleImage'
        ]
    },
    listStyleImage: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'none'
    },
    listStylePosition: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'outside'
    },
    listStyleType: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'disc'
    },
    margin: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND | CSS_TRAITS.LAYOUT | CSS_TRAITS.AUTO,
        value: [
            'marginTop',
            'marginRight',
            'marginBottom',
            'marginLeft'
        ]
    },
    marginBottom: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT | CSS_TRAITS.UNIT,
        value: '0'
    },
    marginLeft: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT | CSS_TRAITS.UNIT,
        value: '0'
    },
    marginRight: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT | CSS_TRAITS.UNIT,
        value: '0'
    },
    marginTop: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT | CSS_TRAITS.UNIT,
        value: '0'
    },
    maxHeight: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'none'
    },
    maxWidth: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'none'
    },
    minHeight: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'auto'
    },
    minWidth: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'auto'
    },
    offset: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND | CSS_TRAITS.NONE | CSS_TRAITS.AUTO,
        value: [
            'offsetPath',
            'offsetDistance',
            'offsetRotate',
            'offsetAnchor'
        ]
    },
    offsetPath: {
        trait: 0,
        value: 'none'
    },
    offsetDistance: {
        trait: CSS_TRAITS.CALC,
        value: '0'
    },
    offsetRotate: {
        trait: CSS_TRAITS.CALC,
        value: 'auto 0deg'
    },
    offsetAnchor: {
        trait: CSS_TRAITS.CALC,
        value: 'auto'
    },
    opacity: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.UNIT,
        value: '1'
    },
    order: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND | CSS_TRAITS.LAYOUT | CSS_TRAITS.UNIT,
        value: '0'
    },
    outline: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND | CSS_TRAITS.NONE,
        value: [
            'outlineWidth',
            'outlineStyle',
            'outlineColor'
        ]
    },
    outlineColor: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.COLOR,
        value: 'currentcolor'
    },
    outlineOffset: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.UNIT,
        value: '0'
    },
    outlineStyle: {
        trait: 0,
        value: 'none'
    },
    outlineWidth: {
        trait: CSS_TRAITS.CALC,
        value: 'medium'
    },
    overflow: {
        trait: CSS_TRAITS.SHORTHAND | CSS_TRAITS.LAYOUT,
        value: [
            'overflowX',
            'overflowY'
        ]
    },
    overflowX: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'visible'
    },
    overflowY: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'visible'
    },
    padding: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND | CSS_TRAITS.LAYOUT,
        value: [
            'paddingTop',
            'paddingRight',
            'paddingBottom',
            'paddingLeft'
        ]
    },
    paddingBottom: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT | CSS_TRAITS.UNIT,
        value: '0'
    },
    paddingLeft: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT | CSS_TRAITS.UNIT,
        value: '0'
    },
    paddingRight: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT | CSS_TRAITS.UNIT,
        value: '0'
    },
    paddingTop: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT | CSS_TRAITS.UNIT,
        value: '0'
    },
    pageBreakAfter: {
        trait: 0,
        value: 'auto'
    },
    pageBreakBefore: {
        trait: 0,
        value: 'auto'
    },
    pageBreakInside: {
        trait: 0,
        value: 'auto'
    },
    perspective: {
        trait: CSS_TRAITS.CALC,
        value: 'none'
    },
    perspectiveOrigin: {
        trait: CSS_TRAITS.CALC,
        value: '50% 50%'
    },
    placeContent: {
        trait: CSS_TRAITS.CONTAIN,
        value: [
           'alignContent',
           'justifyContent'
        ]
    },
    placeItems: {
        trait: CSS_TRAITS.SHORTHAND | CSS_TRAITS.CONTAIN,
        value: [
           'alignItems',
           'justifyItems'
        ]
    },
    placeSelf: {
        trait: CSS_TRAITS.SHORTHAND | CSS_TRAITS.CONTAIN,
        value: [
           'alignSelf',
           'justifySelf'
        ]
    },
    position: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'static'
    },
    quotes: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'none'
    },
    resize: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'none'
    },
    right: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'auto'
    },
    rowGap: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'normal'
    },
    scrollMargin: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND | CSS_TRAITS.LAYOUT,
        value: [
            'scrollMarginTop',
            'scrollMarginRight',
            'scrollMarginBottom',
            'scrollMarginLeft'
        ]
    },
    scrollMarginBottom: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT | CSS_TRAITS.UNIT,
        value: '0'
    },
    scrollMarginLeft: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT | CSS_TRAITS.UNIT,
        value: '0'
    },
    scrollMarginRight: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT | CSS_TRAITS.UNIT,
        value: '0'
    },
    scrollMarginTop: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT | CSS_TRAITS.UNIT,
        value: '0'
    },
    scrollPadding: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND | CSS_TRAITS.LAYOUT | CSS_TRAITS.AUTO,
        value: [
            'scrollPaddingTop',
            'scrollPaddingRight',
            'scrollPaddingBottom',
            'scrollPaddingLeft'
        ]
    },
    scrollPaddingBottom: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'auto'
    },
    scrollPaddingLeft: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'auto'
    },
    scrollPaddingRight: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'auto'
    },
    scrollPaddingTop: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'auto'
    },
    shapeOutside: {
        trait: CSS_TRAITS.CALC,
        value: 'none'
    },
    tabSize: {
        trait: CSS_TRAITS.LAYOUT,
        value: '8'
    },
    tableLayout: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'auto'
    },
    textAlign: {
        trait: 0,
        value: 'start'
    },
    textAlignLast: {
        trait: 0,
        value: 'auto'
    },
    textDecoration: {
        trait: CSS_TRAITS.SHORTHAND | CSS_TRAITS.NONE,
        value: [
            'textDecorationLine',
            'textDecorationStyle',
            'textDecorationColor'
        ]
    },
    textDecorationColor: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.COLOR,
        value: 'currentcolor'
    },
    textDecorationLine: {
        trait: 0,
        value: 'none'
    },
    textDecorationStyle: {
        trait: 0,
        value: 'solid'
    },
    textIndent: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT | CSS_TRAITS.UNIT,
        value: '0'
    },
    textJustify: {
        trait: 0,
        value: 'auto'
    },
    textOverflow: {
        trait: 0,
        value: 'clip'
    },
    textShadow: {
        trait: CSS_TRAITS.CALC,
        value: 'none'
    },
    textTransform: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'none'
    },
    top: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'auto'
    },
    transform: {
        trait: CSS_TRAITS.CALC,
        value: 'none'
    },
    transformOrigin: {
        trait: CSS_TRAITS.CALC,
        value: '50% 50% 0'
    },
    transformStyle: {
        trait: 0,
        value: 'flat'
    },
    transition: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND | CSS_TRAITS.NONE,
        value: [
            'transitionProperty',
            'transitionDuration',
            'transitionTimingFunction',
            'transitionDelay'
        ],
        valueOfNone: 'one 0s ease 0s'
    },
    transitionDelay: {
        trait: CSS_TRAITS.CALC,
        value: '0s'
    },
    transitionDuration: {
        trait: CSS_TRAITS.CALC,
        value: '0s'
    },
    transitionProperty: {
        trait: 0,
        value: 'all'
    },
    transitionTimingFunction: {
        trait: CSS_TRAITS.CALC,
        value: 'ease'
    },
    unicodeBidi: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'normal'
    },
    verticalAlign: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'baseline'
    },
    visibility: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'visible'
    },
    whiteSpace: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'normal'
    },
    width: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'auto'
    },
    wordBreak: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'normal'
    },
    wordSpacing: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'normal'
    },
    wordWrap: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'normal'
    },
    zIndex: {
        trait: CSS_TRAITS.CALC,
        value: 'auto'
    }
};

export const SVG_PROPERTIES: CssProperties = {
    clipRule: {
        trait: 0,
        value: 'nonzero'
    },
    cx: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.UNIT,
        value: '0'
    },
    cy: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.UNIT,
        value: '0'
    },
    fill: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.COLOR,
        value: 'black'
    },
    fillOpacity: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.UNIT,
        value: '1'
    },
    fillRule: {
        trait: 0,
        value: 'nonzero'
    },
    stroke: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.COLOR,
        value: 'none'
    },
    strokeDasharray: {
        trait: CSS_TRAITS.CALC,
        value: 'none'
    },
    strokeDashoffset: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.UNIT,
        value: '0'
    },
    strokeLinecap: {
        trait: 0,
        value: 'butt'
    },
    strokeLinejoin: {
        trait: 0,
        value: 'miter'
    },
    strokeMiterlimit: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.UNIT,
        value: '4'
    },
    strokeOpacity: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.UNIT,
        value: '1'
    },
    strokeWidth: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.UNIT,
        value: '1'
    },
    r: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.UNIT,
        value: '0'
    },
    rx: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.UNIT,
        value: '0'
    },
    ry: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.UNIT,
        value: '0'
    },
    x: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.UNIT,
        value: '0'
    },
    x1: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.UNIT,
        value: '0'
    },
    x2: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.UNIT,
        value: '0'
    },
    y: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.UNIT,
        value: '0'
    },
    y1: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.UNIT,
        value: '0'
    },
    y2: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.UNIT,
        value: '0'
    }
};

export const PROXY_INLINESTYLE = Object.freeze(
    new Proxy({
        lineHeight: 'inherit',
        fontSize: 'inherit'
    } as CSSStyleDeclaration,
    {
        get: (target, attr) => {
            let value: Undef<string | string[]> = target[attr];
            if (value) {
                return value as string;
            }
            value = CSS_PROPERTIES[attr.toString()]?.value;
            if (value) {
                return typeof value === 'string' ? value : '';
            }
        }
    })
);

export const ELEMENT_BLOCK = new Set([
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
]);

export function getPropertiesAsTraits(value: number, map?: string) {
    const result: ObjectMap<CssPropertyData> = {};
    const data = map === 'svg' ? SVG_PROPERTIES : CSS_PROPERTIES;
    for (const attr in data) {
        const item = data[attr];
        if (hasBit(item.trait, value)) {
            item.name = convertHyphenated(attr);
            result[attr] = item;
        }
    }
    return result;
}

export function getStyle(element: Element, pseudoElt = '') {
    let style = getElementCache<CSSStyleDeclaration>(element, 'style' + pseudoElt, '0');
    if (style) {
        return style;
    }
    if (hasComputedStyle(element)) {
        style = getComputedStyle(element, pseudoElt);
        setElementCache(element, 'style' + pseudoElt, '0', style);
        return style;
    }
    return PROXY_INLINESTYLE;
}

export function updateDocumentFont() {
    const computedStyle = getComputedStyle(DOCUMENT_ELEMENT);
    DOCUMENT_FONTSIZE = parseFloat(computedStyle.fontSize) || 16;
    const style = DOCUMENT_ELEMENT.style;
    const fontSize = style.fontSize;
    style.fontSize = 'initial';
    DOCUMENT_FONTBASE = parseFloat(computedStyle.fontSize) || 16;
    style.fontSize = fontSize;
    const index = 16 - Math.floor(DOCUMENT_FONTBASE);
    if (index < 0) {
        DOCUMENT_FONTMAP = [0.6, 0.75, 0.89, 1.2, 1.5, 2, 3];
    }
    else {
        switch (index) {
            case 0:
                DOCUMENT_FONTMAP = [9/16, 10/16, 13/16, 18/16, 24/16, 2, 3];
                break;
            case 1:
                DOCUMENT_FONTMAP = [9/15, 10/15, 13/15, 18/15, 23/15, 2, 3];
                break;
            case 2:
                DOCUMENT_FONTMAP = [9/14, 10/14, 12/14, 17/14, 21/14, 2, 3];
                break;
            case 3:
                DOCUMENT_FONTMAP = DOCUMENT_FIXEDMAP;
                break;
            case 4:
                DOCUMENT_FONTMAP = [9/12, 9/12, 10/12, 14/12, 18/12, 2, 3];
                break;
            case 5:
                DOCUMENT_FONTMAP = [9/11, 9/11, 10/11, 13/11, 17/11, 2, 3];
                break;
            case 6:
                DOCUMENT_FONTMAP = [9/10, 9/10, 9/10, 12/10, 15/10, 2, 3];
                break;
            default:
                DOCUMENT_FONTMAP = [1, 1, 1, 11/9, 14/9, 2, 3];
                break;
        }
    }
}

export function getRemSize(fixedWidth?: boolean) {
    return !fixedWidth ? DOCUMENT_FONTSIZE : DOCUMENT_FIXEDSIZE;
}

export function getFontSize(element: Element) {
    if (element.nodeName[0] === '#') {
        element = element.parentElement || DOCUMENT_ELEMENT;
    }
    return parseFloat(getStyle(element).getPropertyValue('font-size'));
}

export function hasComputedStyle(element: Element): element is HTMLElement {
    return element.nodeName[0] !== '#' && (element instanceof HTMLElement || element instanceof SVGElement);
}

export function parseSelectorText(value: string, document?: boolean) {
    value = document ? value.trim() : trimSelector(value.trim());
    if (value.includes(',')) {
        let normalized = value,
            found: Undef<boolean>,
            match: Null<RegExpExecArray>;
        while (match = CSS.SELECTOR_ATTR.exec(normalized)) {
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
            return result.length ? result : [value];
        }
        return replaceMap(value.split(CHAR_SEPARATOR), (selector: string) => trimSelector(selector));
    }
    return [value];
}

export function getSpecificity(value: string) {
    let result = 0,
        match: Null<RegExpExecArray>;
    while (match = CSS.SELECTOR_G.exec(value)) {
        let segment = match[1];
        if (segment.length === 1) {
            switch (segment[0]) {
                case '+':
                case '~':
                case '>':
                case '*':
                    continue;
            }
        }
        else if (segment.startsWith('*|*')) {
            if (segment.length > 3) {
                result = 0;
                break;
            }
        }
        else if (segment.startsWith('*|')) {
            segment = segment.substring(2);
        }
        else if (segment.startsWith('::')) {
            result = 0;
            break;
        }
        let subMatch: Null<RegExpExecArray>;
        while (subMatch = CSS.SELECTOR_ATTR.exec(segment)) {
            if (subMatch[1]) {
                result += 1;
            }
            if (subMatch[3] || subMatch[4] || subMatch[5]) {
                result += 10;
            }
            segment = spliceString(segment, subMatch.index, subMatch[0].length);
        }
        while (subMatch = CSS.SELECTOR_PSEUDO_CLASS.exec(segment)) {
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
        while (subMatch = CSS.SELECTOR_PSEUDO_ELEMENT.exec(segment)) {
            result += 1;
            segment = spliceString(segment, subMatch.index, subMatch[0].length);
        }
        while (subMatch = CSS.SELECTOR_LABEL.exec(segment)) {
            const command = subMatch[0];
            switch (command[0]) {
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
    CSS.SELECTOR_G.lastIndex = 0;
    return result;
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
        case 'columnRuleWidth':
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
            return formatVar(calculateVar(element, value, { boundingSize: isEmBased(value) ? getFontSize(element) : undefined, min: 0 }));
        case 'fontSize':
            return formatVar(calculateVar(element, value, { boundingSize: isEmBased(value) ? getFontSize(element.parentElement || DOCUMENT_ELEMENT) : undefined, min: 0 }));
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
        case 'borderImageSource': {
            const image = splitEnclosing(value);
            const length = image.length;
            if (length > 1) {
                for (let i = 1; i < length; ++i) {
                    const color = image[i];
                    if (isColor(color) && hasCalc(color)) {
                        const component = splitEnclosing(trimEnclosing(color));
                        for (let j = 1, q = component.length; j < q; ++j) {
                            if (hasCalc(component[j])) {
                                const previous = component[j - 1];
                                if (isColor(previous)) {
                                    const prefix = previous.split(CHAR_SPACE).pop()!;
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
            const color = splitEnclosing(value);
            const length = color.length;
            if (length > 1) {
                for (let i = 1; i < length; ++i) {
                    const previous = color[i - 1];
                    if (isColor(previous) && hasCalc(color[i])) {
                        const prefix = previous.split(CHAR_SPACE).pop()!;
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
        case 'columnRule':
        case 'outline': {
            const border = splitEnclosing(value);
            const length = border.length;
            if (length > 1) {
                for (let i = 1; i < length; ++i) {
                    const previous = border[i - 1];
                    const prefix = previous.split(CHAR_SPACE).pop()!;
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
                                for (let j = 0; j < q; ++j) {
                                    let bezier = cubic[j];
                                    if (isCalc(bezier)) {
                                        const p = calculateVar(element, bezier, j % 2 === 0 ? { unitType: CSS_UNIT.DECIMAL, supportPercent: false, min: 0, max: 1 } : undefined);
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
            return hasCoords(getStyle(element).position) ? calculateVarAsString(element, value, { supportPercent: false }) : '';
        case 'clipPath':
        case 'offsetPath':
        case 'shapeOutside': {
            const path = splitEnclosing(value);
            const length = path.length;
            if (length === 2) {
                const prefix = path[0].trim();
                let shape = trimEnclosing(path[1].trim());
                switch (prefix) {
                    case 'url':
                    case 'path':
                        return !hasCalc(path[1]) ? value : '';
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
                            if (prefix === 'circle') {
                                if (radius.includes('%')) {
                                    const { width, height } = boundingBox || getContentBoxDimension(element.parentElement);
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
                    default:
                        return value;
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
                            distance = calculateStyle(element, REGEXP_LENGTH.test(distance) ? 'offsetDistance' : 'offsetRotate', distance, boundingBox);
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
                    let width: Undef<string>,
                        outset: Undef<string>;
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

export function checkStyleValue(element: CSSElement, attr: string, value: string) {
    switch (value) {
        case 'unset':
            switch (attr) {
                case 'lineHeight':
                case 'fontSize':
                    return 'inherit';
            }
        case 'initial':
            switch (attr) {
                case 'position':
                    return 'static';
                case 'display':
                    return ELEMENT_BLOCK.has(element.tagName) ? 'block' : 'inline';
                case 'fontSize':
                    return 'inherit';
                case 'verticalAlign':
                    switch (element.tagName) {
                        case 'SUP':
                            return 'super';
                        case 'SUB':
                            return 'sub';
                        default:
                            return 'baseline';
                    }
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
                default:
                    return '';
            }
        case 'inherit':
            switch (attr) {
                case 'fontSize':
                case 'lineHeight':
                    return 'inherit';
                default:
                    return getStyle(element)[attr] as string;
            }
    }
    if (hasCalc(value)) {
        return calculateStyle(element, attr, value) || getStyle(element)[attr] as string;
    }
    else if (isCustomProperty(value)) {
        return parseVar(element, value) || getStyle(element)[attr] as string;
    }
    return value;
}

export function checkFontSizeValue(value: string, fixedWidth?: boolean) {
    if (value === '') {
        return 'inherit';
    }
    switch (value) {
        case 'medium':
            return '1rem';
        case 'smaller':
            return '0.833333em';
        case 'larger':
            return '1.2em';
        case 'xxx-large':
            return fromFontNamedValue(6, fixedWidth);
        case 'xx-large':
            return fromFontNamedValue(5, fixedWidth);
        case 'x-large':
            return fromFontNamedValue(4, fixedWidth);
        case 'large':
            return fromFontNamedValue(3, fixedWidth);
        case 'small':
            return fromFontNamedValue(2, fixedWidth);
        case 'x-small':
            return fromFontNamedValue(1, fixedWidth);
        case 'xx-small':
            return fromFontNamedValue(0, fixedWidth);
        default:
            return value;
    }
}

export function getKeyframesRules(): ObjectMap<KeyframesData> {
    const result: ObjectMap<KeyframesData> = {};
    violation: {
        const styleSheets = document.styleSheets;
        for (let i = 0, length = styleSheets.length; i < length; ++i) {
            try {
                const cssRules = styleSheets[i].cssRules;
                if (cssRules) {
                    for (let j = 0, q = cssRules.length; j < q; ++j) {
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
            catch {
            }
        }
    }
    return result;
}

export function parseKeyframes(rules: CSSRuleList) {
    const result: KeyframesData = {};
    for (let i = 0, length = rules.length; i < length; ++i) {
        const item = rules[i];
        const match = REGEXP_KEYFRAMES.exec(item.cssText);
        if (match) {
            const keyframes = (item['keyText'] as string || match[1]).trim().split(CHAR_SEPARATOR);
            for (let j = 0, q = keyframes.length; j < q; ++j) {
                let percent = keyframes[j];
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
                    const [attr, value] = splitPair(property, ':');
                    if (value !== '') {
                        keyframe[attr.trim()] = value.trim();
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
            REGEXP_MEDIARULE.lastIndex = 0;
            let match: Null<RegExpExecArray>;
            while (match = REGEXP_MEDIARULE.exec(value)) {
                const negate = match[1] === 'not';
                let valid: Undef<boolean>,
                    condition: Null<RegExpExecArray>;
                while (condition = REGEXP_MEDIARULECONDITION.exec(match[2])) {
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
                                const [width, height] = splitPair(rule, '/');
                                valid = compareRange(operation, window.innerWidth / window.innerHeight, parseInt(width) / parseInt(height));
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
                            valid = compareRange(operation, attr.endsWith('width') ? window.innerWidth : window.innerHeight, parseUnit(rule, { fontSize }));
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
                            valid = parseInt(rule) > 0;
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
                REGEXP_MEDIARULECONDITION.lastIndex = 0;
                if (!negate && valid || negate && !valid) {
                    return true;
                }
            }
        }
    }
    return false;
}

export function getInheritedStyle(element: Element, attr: string, options?: InheritedStyleOptions) {
    let exclude: Undef<RegExp>,
        tagNames: Undef<string[]>;
    if (options) {
        ({ exclude, tagNames } = options);
    }
    let value = '',
        current = element.parentElement;
    while (current && (tagNames === undefined || !tagNames.includes(current.tagName))) {
        value = getStyle(current)[attr];
        if (value === 'inherit' || exclude && exclude.test(value)) {
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
    while (match = REGEXP_VAR.exec(value)) {
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
    let orderedSize: Undef<number[]>,
        dimension: Undef<DimensionAttr[]>,
        separator: Undef<string>,
        unitType: Undef<number>,
        checkUnit: Undef<boolean>,
        errorString: Undef<RegExp>;
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
    if (separator === ' ') {
        value = value.trim();
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
    for (let seg of separator ? value.split(separator) : [value]) {
        seg = seg.trim();
        if (seg !== '') {
            const calc = splitEnclosing(seg, 'calc');
            const length = calc.length;
            if (length > 0) {
                let partial = '';
                for (let i = 0, j = 0; i < length; ++i) {
                    let output = calc[i];
                    if (isCalc(output)) {
                        if (orderedSize && orderedSize[j] !== undefined) {
                            optionsVar.boundingSize = orderedSize[j++];
                        }
                        else if (dimension) {
                            optionsVar.dimension = dimension[j++];
                            delete optionsVar.boundingSize;
                        }
                        else if (orderedSize) {
                            delete optionsVar.boundingSize;
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
                optional = optional.replace(new RegExp(match[i] + '$'), '');
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
        if (value.includes('%')) {
            if (options.supportPercent === false || options.unitType === CSS_UNIT.INTEGER) {
                return NaN;
            }
            else if (options.boundingSize === undefined) {
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
                                let style: Undef<CSSStyleDeclaration>;
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
        if ((!options.unitType || options.unitType === CSS_UNIT.LENGTH) && isEmBased(value) && options.fontSize === undefined) {
            options.fontSize = getFontSize(element);
        }
        let result = calculate(output, options);
        if (options.precision !== undefined) {
            result = options.precision === 0 ? Math.floor(result) : parseFloat(truncate(result, options.precision));
        }
        else if (options.roundValue) {
            result = Math.round(result);
        }
        return result;
    }
    return NaN;
}

export function getContentBoxDimension(element: Null<CSSElement>) {
    if (element) {
        const style = getStyle(element);
        const { width, height } = element.getBoundingClientRect();
        return { width: Math.max(0, width - getContentBoxWidth(style)), height: Math.max(0, height - getContentBoxHeight(style)) };
    }
    return { width: 0, height: 0 };
}

export function getSrcSet(element: HTMLImageElement, mimeType?: MIMEOrAll) {
    const result: ImageSrcSet[] = [];
    const parentElement = element.parentElement as HTMLPictureElement;
    let { srcset, sizes } = element;
    if (parentElement && parentElement.tagName === 'PICTURE') {
        iterateArray(parentElement.children, (item: HTMLSourceElement) => {
            if (item.tagName === 'SOURCE') {
                if (isString(item.srcset) && !(isString(item.media) && !checkMediaRule(item.media)) && (!mimeType || mimeType === '*' || !isString(item.type) || mimeType.includes(item.type.trim().toLowerCase()))) {
                    ({ srcset, sizes } = item);
                    return true;
                }
            }
        });
    }
    if (srcset !== '') {
        for (const value of srcset.trim().split(CHAR_SEPARATOR)) {
            const match = REGEXP_IMGSRCSET.exec(value);
            if (match) {
                let width = 0,
                    pixelRatio = 0;
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
        return;
    }
    else if (length > 1) {
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
        if (isString(sizes)) {
            let width = NaN;
            for (const value of sizes.trim().split(CHAR_SEPARATOR)) {
                let match = REGEXP_SOURCESIZES.exec(value);
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
                        match = REGEXP_CALC.exec(unit);
                        if (match) {
                            width = calculate(match[1], match[1].includes('%') ? { boundingSize: getContentBoxDimension(element.parentElement).width } : undefined);
                        }
                        else if (isPercent(unit)) {
                            width = parseFloat(unit) / 100 * getContentBoxDimension(element.parentElement).width;
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
                for (let i = 1; i < length; ++i) {
                    const item = result[i];
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
    if (match) {
        return trimBoth(match[1].trim(), '"').trim();
    }
}

export function resolveURL(value: string) {
    const url = extractURL(value);
    if (url) {
        return resolvePath(url);
    }
}

export function insertStyleSheetRule(value: string, index = 0) {
    const style = document.createElement('style');
    if (isUserAgent(USER_AGENT.SAFARI)) {
        style.appendChild(document.createTextNode(''));
    }
    document.head.appendChild(style);
    const sheet = style.sheet as CSSStyleSheet;
    if (sheet && typeof sheet.insertRule === 'function') {
        try {
            sheet.insertRule(value, index);
        }
        catch {
            return null;
        }
    }
    return style;
}

export function calculate(value: string, options?: CalculateOptions) {
    value = value.trim();
    if (value === '') {
        return NaN;
    }
    let length = value.length;
    if (value[0] !== '(' || value[length - 1] !== ')') {
        value = `(${value})`;
        length += 2;
    }
    let opened = 0;
    const opening: boolean[] = [];
    const closing: number[] = [];
    for (let i = 0; i < length; ++i) {
        switch (value[i]) {
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
                let valid: Undef<boolean>,
                    j = closing[i] - 1;
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
                    let boundingSize: Undef<number>,
                        min: Undef<number>,
                        max: Undef<number>,
                        unitType: Undef<number>,
                        fontSize: Undef<number>;
                    if (options) {
                        ({ boundingSize, min, max, unitType, fontSize } = options);
                    }
                    let found: Undef<boolean>,
                        operand: Undef<string>,
                        operator: Undef<string>;
                    const seg: number[] = [];
                    const evaluate: string[] = [];
                    const operation = value.substring(j + 1, closing[i]).split(REGEXP_CALCOPERATION);
                    for (let k = 0, q = operation.length; k < q; ++k) {
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
                                const match = REGEXP_CALCUNIT.exec(partial);
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
                                                const angle = parseAngle(partial);
                                                if (!isNaN(angle)) {
                                                    seg.push();
                                                    found = true;
                                                }
                                                else {
                                                    return NaN;
                                                }
                                            }
                                            else {
                                                return NaN;
                                            }
                                            break;
                                        case CSS_UNIT.INTEGER:
                                            if (/^\s*-?\d+\s*$/.test(partial)) {
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
                                                seg.push(parseUnit(partial, { fontSize }));
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
                    for (let k = 0; k < evaluate.length; ++k) {
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

export function parseUnit(value: string, options?: ParseUnitOptions) {
    const match = REGEXP_LENGTH.exec(value);
    if (match) {
        let result = parseFloat(match[1]);
        switch (match[2]) {
            case 'px':
                return result;
            case 'ex':
                result /= 2;
            case 'em':
            case 'ch': {
                const fontSize = options && options.fontSize;
                if (fontSize !== undefined) {
                    return result * fontSize;
                }
            }
            case 'rem':
                return result * (options && options.fixedWidth ? DOCUMENT_FIXEDSIZE : DOCUMENT_FONTSIZE);
            case 'pc':
                result *= 12;
            case 'pt':
                return result * 4 / 3;
            case 'Q':
                result /= 4;
            case 'mm':
                result /= 10;
            case 'cm':
                result /= 2.54;
            case 'in':
                return result * getDeviceDPI();
            case 'vw':
                return result * getInnerWidth(options?.screenDimension) / 100;
            case 'vh':
                return result * getInnerHeight(options?.screenDimension) / 100;
            case 'vmin': {
                const screenDimension = options && options.screenDimension;
                return result * Math.min(getInnerWidth(screenDimension), getInnerHeight(screenDimension)) / 100;
            }
            case 'vmax': {
                const screenDimension = options && options.screenDimension;
                return result * Math.max(getInnerWidth(screenDimension), getInnerHeight(screenDimension)) / 100;
            }
        }
    }
    return 0;
}

export function parseTransform(value: string, options?: TransformOptions) {
    let accumulate: Undef<boolean>,
        fontSize: Undef<number>,
        boundingBox: Undef<Dimension>;
    if (options) {
        ({ accumulate, fontSize, boundingBox } = options);
    }
    const result: TransformData[] = [];
    let match: Null<RegExpExecArray>;
    while (match = REGEXP_TRANSFORM.exec(value)) {
        const method = match[1];
        if (method.startsWith('translate')) {
            const translate = TRANSFORM.TRANSLATE.exec(match[0]);
            if (translate) {
                const tX = translate[2];
                const tY = translate[3];
                if (accumulate) {
                    let x = 0,
                        y = 0,
                        z = 0;
                    switch (method) {
                        case 'translate':
                            if (isPercent(tX)) {
                                if (boundingBox) {
                                    x = parseFloat(tX) / 100 * boundingBox.width;
                                }
                            }
                            else {
                                x = parseUnit(tX, { fontSize });
                            }
                            if (tY) {
                                if (isPercent(tY)) {
                                    if (boundingBox) {
                                        y = parseFloat(tY) / 100 * boundingBox.height;
                                    }
                                }
                                else {
                                    y = parseUnit(tY, { fontSize });
                                }
                            }
                            break;
                        case 'translateX':
                            if (isPercent(tX)) {
                                if (boundingBox) {
                                    x = parseFloat(tX) / 100 * boundingBox.width;
                                }
                            }
                            else {
                                x = parseUnit(tX, { fontSize });
                            }
                            break;
                        case 'translateY':
                            if (isPercent(tY)) {
                                if (boundingBox) {
                                    y = parseFloat(tY) / 100 * boundingBox.height;
                                }
                            }
                            else {
                                y = parseUnit(tY, { fontSize });
                            }
                            break;
                        case 'translateZ':
                            z = parseUnit(tX, { fontSize });
                            break;
                    }
                    const values = result.find(item => item.method === 'translate')?.values;
                    if (values) {
                        values[0] += x;
                        values[1] += y;
                        values[2] += z;
                    }
                    else {
                        result.push({ method: 'translate', values: [x, y, z] });
                    }
                }
                else {
                    const values: number[] = [parseUnit(tX, { fontSize })];
                    if (method === 'translate' && tY) {
                        values.push(parseUnit(tY, { fontSize }));
                    }
                    result.push({ method, values });
                }
            }
        }
        else if (method.startsWith('rotate')) {
            const rotate = TRANSFORM.ROTATE.exec(match[0]);
            if (rotate) {
                const angle = convertAngle(rotate[2], rotate[3]);
                if (!isNaN(angle)) {
                    if (accumulate) {
                        let x = 0,
                            y = 0,
                            z = 0;
                        switch (method) {
                            case 'rotate':
                                x = angle;
                                y = angle;
                                break;
                            case 'rotateX':
                                x = angle;
                                break;
                            case 'rotateY':
                                y = angle;
                                break;
                            case 'rotateZ':
                                z = angle;
                                break;
                        }
                        const values = result.find(item => item.method === 'rotate')?.values;
                        if (values) {
                            values[0] += x;
                            values[1] += y;
                            values[2] += z;
                        }
                        else {
                            result.push({ method: 'rotate', values: [x, y, z] });
                        }
                    }
                    else {
                        result.push({ method, values: [angle] });
                    }
                }
            }
        }
        else if (method.startsWith('scale')) {
            const scale = TRANSFORM.SCALE.exec(match[0]);
            if (scale) {
                if (accumulate) {
                    let x = 1,
                        y = 1,
                        z = 1;
                    switch (method) {
                        case 'scale':
                            x = parseFloat(scale[2]);
                            y = parseFloat(scale[3]) || x;
                            break;
                        case 'scaleX':
                            x = parseFloat(scale[2]);
                            break;
                        case 'scaleY':
                            y = parseFloat(scale[2]);
                            break;
                        case 'scaleZ':
                            z = parseFloat(scale[2]);
                            break;
                    }
                    const values = result.find(item => item.method === 'scale')?.values;
                    if (values) {
                        values[0] *= x;
                        values[1] *= y;
                        values[2] *= z;
                    }
                    else {
                        result.push({ method: 'scale', values: [x, y, z] });
                    }
                }
                else {
                    const values: number[] = [parseFloat(scale[2])];
                    if (method === 'scale' && scale[3]) {
                        values.push(parseFloat(scale[3]));
                    }
                    result.push({ method, values });
                }
            }
        }
        else if (method.startsWith('skew')) {
            const skew = TRANSFORM.SKEW.exec(match[0]);
            if (skew) {
                let angle = convertAngle(skew[2], skew[3]);
                if (!isNaN(angle)) {
                    if (accumulate) {
                        let x = 0,
                            y = 0;
                        switch (method) {
                            case 'skew':
                                x = angle;
                                if (skew[4] && skew[5]) {
                                    y = convertAngle(skew[4], skew[5], 0);
                                }
                                break;
                            case 'skewX':
                                x = angle;
                                break;
                            case 'skewY':
                                y = angle;
                                break;
                        }
                        const values = result.find(item => item.method === 'skew')?.values;
                        if (values) {
                            values[0] += x;
                            values[1] += y;
                        }
                        else {
                            result.push({ method: 'skew', values: [x, y] });
                        }
                    }
                    else {
                        const values: number[] = [angle];
                        if (method === 'skew' && skew[4] && skew[5]) {
                            angle = convertAngle(skew[4], skew[5]);
                            if (!isNaN(angle)) {
                                values.push(angle);
                            }
                        }
                        result.push({ method, values});
                    }
                }
            }
        }
        else if (method.startsWith('matrix') && !accumulate) {
            const matrix = TRANSFORM.MATRIX.exec(match[0]);
            if (matrix) {
                result.push({
                    method,
                    values: [parseFloat(matrix[2]), parseFloat(matrix[3]), parseFloat(matrix[4]), parseFloat(matrix[5]), parseFloat(matrix[6]), parseFloat(matrix[7])]
                });
            }
        }
    }
    REGEXP_TRANSFORM.lastIndex = 0;
    return result;
}

export function parseAngle(value: string, fallback = NaN) {
    const match = REGEXP_ANGLE.exec(value);
    return match ? convertAngle(match[1], match[2]) : fallback;
}

export function convertAngle(value: string, unit = 'deg', fallback = NaN) {
    let result = convertFloat(value);
    if (isNaN(result)) {
        return fallback;
    }
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

export function parseTime(value: string) {
    const match = REGEXP_TIME.exec(value);
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

export function formatPercent(value: NumString, round?: boolean) {
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
    return !percent ? REGEXP_LENGTH.test(value) : REGEXP_LENGTHPERCENTAGE.test(value);
}

export function isEm(value: string) {
    return REGEXP_EM.test(value);
}

export function isEmBased(value: string) {
    return REGEXP_EMBASED.test(value);
}

export function isCalc(value: string) {
    return REGEXP_CALC.test(value);
}

export function isCustomProperty(value: string) {
    return REGEXP_CUSTOMPROPERTY.test(value);
}

export function isAngle(value: string) {
    return REGEXP_ANGLE.test(value);
}

export function isTime(value: string) {
    return REGEXP_TIME.test(value);
}

export function isPercent(value: string) {
    return REGEXP_PERCENT.test(value);
}

export function hasCalc(value: string) {
    return REGEXP_CALCWITHIN.test(value);
}

export function hasCoords(value: string) {
    return value === 'absolute' || value === 'fixed';
}