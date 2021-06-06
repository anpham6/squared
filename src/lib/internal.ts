import { CSS_TRAITS, PLATFORM, USER_AGENT } from './constant';

import { CSS } from './regex';

import { isPlatform, isUserAgent } from './client';
import { setElementCache } from './session';
import { convertCamelCase, convertHyphenated, replaceAll, safeFloat, spliceString, splitEnclosing, startsWith } from './util';

const DOCUMENT_FIXEDMAP = [9/13, 10/13, 12/13, 16/13, 20/13, 2, 3];
let DOCUMENT_FONTMAP!: number[];
let DOCUMENT_FONTBASE!: number;
let DOCUMENT_FONTSIZE!: number;

const SELECTOR_GROUP = /^:(?:not|is|where)\(/i;
const SPEC_GROUP = /:(?:is|where)/;
const SPEC_ISWHERE = /^:(is|where)\((.+)\)$/;
const SPEC_NOT = /^:not\((.+)\)$/;

updateDocumentFont();

function calculateSpecificity(value: string) {
    const result: Specificity = [0, 0, 0];
    let match: Null<RegExpExecArray>;
    splitEnclosing(value, ':not').forEach(seg => {
        if (seg[0] === ':' && (match = SPEC_NOT.exec(seg))) {
            addSpecificity(result, getSelectorValue(match[1]));
            value = spliceString(value, match.index, match[0].length);
        }
    });
    CSS.SELECTOR_G.lastIndex = 0;
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
        else if (startsWith(segment, '*|')) {
            if (segment === '*|*') {
                continue;
            }
            segment = segment.substring(2);
        }
        let partial: Null<RegExpExecArray>;
        const removeUsed = () => segment = spliceString(segment, partial!.index, partial![0].length);
        while (partial = CSS.SELECTOR_ATTR.exec(segment)) {
            if (partial[1]) {
                ++result[2];
            }
            if (partial[3] || partial[4] || partial[5]) {
                ++result[1];
            }
            removeUsed();
        }
        while (partial = CSS.SELECTOR_PSEUDO_ELEMENT.exec(segment)) {
            ++result[2];
            removeUsed();
        }
        while (partial = CSS.SELECTOR_PSEUDO_CLASS.exec(segment)) {
            ++result[1];
            removeUsed();
        }
        while (partial = CSS.SELECTOR_LABEL.exec(segment)) {
            const label = partial[0];
            switch (label[0]) {
                case '#':
                    ++result[0];
                    break;
                case '.':
                    ++result[1];
                    break;
                default:
                    ++result[2];
                    break;
            }
            removeUsed();
        }
    }
    return result;
}

function getSelectorValue(value: string) {
    let result: Undef<Specificity>;
    for (const part of parseSelectorText(value)) {
        const seg = calculateSpecificity(part);
        if (compareSpecificity(seg, result)) {
            result = seg;
        }
    }
    return result;
}

function addSpecificity(value: Specificity, other: Undef<Specificity>) {
    if (other) {
        for (let i = 0; i < 3; ++i) {
            value[i]! += other[i]!;
        }
    }
}

function mergeSelector(value: string) {
    const result: string[] = [];
    let match: Null<RegExpExecArray>;
    for (let seg of parseSelectorText(value)) {
        if (seg[0] === ':' && (match = SPEC_ISWHERE.exec(seg))) {
            if (match[1][0] === 'w') {
                continue;
            }
            seg = mergeSelector(match[2]);
        }
        result.push(seg);
    }
    return result.join(', ');
}

const fromFontNamedValue = (index: number, fixedWidth?: boolean) => (!fixedWidth ? DOCUMENT_FONTMAP[index] : DOCUMENT_FIXEDMAP[index]).toPrecision(8) + 'rem';

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
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND | CSS_TRAITS.NONE,
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
        trait: CSS_TRAITS.CALC,
        value: 'ease'
    },
    appearance: {
        trait: 0,
        value: 'none',
        "valueOfSome": function(element: StyleElement) {
            switch (element.tagName) {
                case 'SELECT':
                case 'TEXTAREA':
                case 'BUTTON':
                case 'INPUT':
                    return 'auto';
            }
            return 'none';
        }
    },
    backdropFilter: {
        trait: CSS_TRAITS.CALC,
        value: 'none'
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
    backgroundBlendMode: {
        trait: 0,
        value: 'normal'
    },
    backgroundClip: {
        trait: 0,
        value: 'border-box'
    },
    backgroundColor: {
        trait: CSS_TRAITS.CALC,
        value: 'transparent',
        valueOfNone: 'transparent'
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
            'borderBottomStyle',
            'borderBottomWidth',
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
        trait: CSS_TRAITS.LAYOUT | CSS_TRAITS.INHERIT,
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
        ]
    },
    borderImageOutset: {
        trait: CSS_TRAITS.CALC,
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
        trait: CSS_TRAITS.CALC,
        value: '1'
    },
    borderLeft: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND | CSS_TRAITS.NONE,
        value: [
            'borderLeftStyle',
            'borderLeftWidth',
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
            'borderRightStyle',
            'borderRightWidth',
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
        trait: CSS_TRAITS.CALC | CSS_TRAITS.UNIT | CSS_TRAITS.INHERIT,
        value: '0',
        valueOfNone: '0px 0px'
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
            'borderTopStyle',
            'borderTopWidth',
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
    breakAfter: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'auto'
    },
    breakBefore: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'auto'
    },
    breakInside: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'auto'
    },
    captionSide: {
        trait: CSS_TRAITS.INHERIT,
        value: 'top'
    },
    caretColor: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.COLOR | CSS_TRAITS.INHERIT,
        value: 'auto'
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
        trait: CSS_TRAITS.CALC | CSS_TRAITS.COLOR | CSS_TRAITS.INHERIT,
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
            'columnRuleStyle',
            'columnRuleWidth',
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
        trait: CSS_TRAITS.LAYOUT,
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
        trait: CSS_TRAITS.LAYOUT,
        value: 'normal'
    },
    counterIncrement: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'none'
    },
    counterReset: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'none'
    },
    counterSet: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'none'
    },
    cursor: {
        trait: CSS_TRAITS.INHERIT,
        value: 'auto'
    },
    direction: {
        trait: CSS_TRAITS.LAYOUT | CSS_TRAITS.INHERIT,
        value: 'ltr'
    },
    display: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'inline'
    },
    emptyCells: {
        trait: CSS_TRAITS.INHERIT,
        value: 'show'
    },
    filter: {
        trait: CSS_TRAITS.CALC,
        value: 'none'
    },
    flex: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND | CSS_TRAITS.NONE | CSS_TRAITS.AUTO,
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
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: '0'
    },
    flexShrink: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
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
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND | CSS_TRAITS.LAYOUT | CSS_TRAITS.INHERIT,
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
        trait: CSS_TRAITS.LAYOUT | CSS_TRAITS.INHERIT,
        value: isPlatform(PLATFORM.MAC) ? 'Helvetica' : 'Arial'
    },
    fontFeatureSettings: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT | CSS_TRAITS.INHERIT,
        value: 'normal'
    },
    fontKerning: {
        trait: CSS_TRAITS.LAYOUT | CSS_TRAITS.INHERIT,
        value: 'auto'
    },
    fontSize: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT | CSS_TRAITS.INHERIT,
        value: 'medium'
    },
    fontSizeAdjust: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT | CSS_TRAITS.INHERIT,
        value: 'none'
    },
    fontOpticalSizing: {
        trait: CSS_TRAITS.LAYOUT | CSS_TRAITS.INHERIT,
        value: 'auto'
    },
    fontStretch: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT | CSS_TRAITS.INHERIT,
        value: 'normal'
    },
    fontStyle: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT | CSS_TRAITS.INHERIT,
        value: 'normal'
    },
    fontVariant: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND | CSS_TRAITS.LAYOUT | CSS_TRAITS.NONE | CSS_TRAITS.INHERIT,
        value: [
            'fontVariantCaps',
            'fontVariantLigatures',
            'fontVariantNumeric',
            'fontVariantEastAsian'
        ]
    },
    fontVariantCaps: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT | CSS_TRAITS.INHERIT,
        value: 'normal'
    },
    fontVariantEastAsian: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT | CSS_TRAITS.INHERIT,
        value: 'normal'
    },
    fontVariantLigatures: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT | CSS_TRAITS.INHERIT,
        value: 'normal'
    },
    fontVariantNumeric: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT | CSS_TRAITS.INHERIT,
        value: 'normal'
    },
    fontVariationSettings: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT | CSS_TRAITS.INHERIT,
        value: 'normal'
    },
    fontWeight: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT | CSS_TRAITS.INHERIT,
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
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND | CSS_TRAITS.LAYOUT | CSS_TRAITS.NONE,
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
        ]
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
        ]
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
        ]
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
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND | CSS_TRAITS.LAYOUT | CSS_TRAITS.NONE,
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
    hyphens: {
        trait: CSS_TRAITS.LAYOUT | CSS_TRAITS.INHERIT,
        value: 'manual'
    },
    imageRendering: {
        trait: 0,
        value: 'auto'
    },
    isolation: {
        trait: 0,
        value: 'auto'
    },
    lineBreak: {
        trait: CSS_TRAITS.LAYOUT,
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
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT | CSS_TRAITS.INHERIT,
        value: 'normal'
    },
    lineHeight: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT | CSS_TRAITS.INHERIT,
        value: 'normal'
    },
    listStyle: {
        trait: CSS_TRAITS.SHORTHAND | CSS_TRAITS.LAYOUT | CSS_TRAITS.NONE | CSS_TRAITS.INHERIT,
        value: [
            'listStyleType',
            'listStylePosition',
            'listStyleImage'
        ]
    },
    listStyleImage: {
        trait: CSS_TRAITS.LAYOUT | CSS_TRAITS.INHERIT,
        value: 'none'
    },
    listStylePosition: {
        trait: CSS_TRAITS.LAYOUT | CSS_TRAITS.INHERIT,
        value: 'outside'
    },
    listStyleType: {
        trait: CSS_TRAITS.LAYOUT | CSS_TRAITS.INHERIT,
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
    maskType: {
        trait: 0,
        value: 'luminance'
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
    mixBlendMode: {
        trait: 0,
        value: 'normal'
    },
    objectFit: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'fill'
    },
    objectPosition: {
        trait: CSS_TRAITS.CALC,
        value: '50% 50%'
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
        trait: CSS_TRAITS.CALC,
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
        trait: CSS_TRAITS.CALC,
        value: '1'
    },
    order: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND | CSS_TRAITS.LAYOUT,
        value: '0'
    },
    orphans: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT | CSS_TRAITS.INHERIT,
        value: '2'
    },
    outline: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND | CSS_TRAITS.NONE,
        value: [
            'outlineStyle',
            'outlineWidth',
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
    overflowAnchor: {
        trait: 0,
        value: 'auto'
    },
    overflowWrap: {
        trait: CSS_TRAITS.LAYOUT | CSS_TRAITS.INHERIT,
        value: 'normal'
    },
    overflowX: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'visible'
    },
    overflowY: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'visible'
    },
    overscrollBehavior: {
        trait: CSS_TRAITS.SHORTHAND | CSS_TRAITS.NONE | CSS_TRAITS.AUTO,
        value: [
            'overscrollBehaviorX',
            'overscrollBehaviorY'
        ]
    },
    overscrollBehaviorX: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'auto'
    },
    overscrollBehaviorY: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'auto'
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
        trait: CSS_TRAITS.LAYOUT,
        value: 'auto',
        alias: 'breakAfter'
    },
    pageBreakBefore: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'auto',
        alias: 'breakBefore'
    },
    pageBreakInside: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'auto',
        alias: 'breakInside'
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
        trait: CSS_TRAITS.LAYOUT | CSS_TRAITS.INHERIT,
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
    scrollBehavior: {
        trait: 0,
        value: 'auto'
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
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'auto'
    },
    scrollPaddingLeft: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'auto'
    },
    scrollPaddingRight: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'auto'
    },
    scrollPaddingTop: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'auto'
    },
    scrollSnapAlign: {
        trait: 0,
        value: 'none'
    },
    scrollSnapStop: {
        trait: 0,
        value: 'none'
    },
    scrollSnapType: {
        trait: 0,
        value: 'none'
    },
    shapeImageThreshold: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: '0'
    },
    shapeMargin: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT | CSS_TRAITS.UNIT,
        value: '0'
    },
    shapeOutside: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'none'
    },
    tabSize: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT | CSS_TRAITS.INHERIT,
        value: '8'
    },
    tableLayout: {
        trait: CSS_TRAITS.LAYOUT,
        value: 'auto'
    },
    textAlign: {
        trait: CSS_TRAITS.CONTAIN | CSS_TRAITS.INHERIT,
        value: 'start'
    },
    textAlignLast: {
        trait: CSS_TRAITS.CONTAIN | CSS_TRAITS.INHERIT,
        value: 'auto'
    },
    textDecoration: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.SHORTHAND | CSS_TRAITS.NONE,
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
        value: 'none',
        valueOfNone: 'none'
    },
    textDecorationSkipInk: {
        trait: CSS_TRAITS.INHERIT,
        value: 'auto'
    },
    textDecorationStyle: {
        trait: 0,
        value: 'solid'
    },
    textIndent: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT | CSS_TRAITS.UNIT | CSS_TRAITS.INHERIT,
        value: '0'
    },
    textJustify: {
        trait: CSS_TRAITS.CONTAIN | CSS_TRAITS.INHERIT,
        value: 'auto'
    },
    textOrientation: {
        trait: CSS_TRAITS.LAYOUT | CSS_TRAITS.INHERIT,
        value: 'mixed'
    },
    textOverflow: {
        trait: 0,
        value: 'clip'
    },
    textShadow: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.INHERIT,
        value: 'none'
    },
    textSizeAdjust: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'auto'
    },
    textTransform: {
        trait: CSS_TRAITS.LAYOUT | CSS_TRAITS.INHERIT,
        value: 'none'
    },
    textUnderlinePosition: {
        trait: CSS_TRAITS.INHERIT,
        value: 'auto'
    },
    top: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'auto'
    },
    touchAction: {
        trait: 0,
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
        ]
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
    userSelect: {
        trait: 0,
        value: 'none'
    },
    verticalAlign: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'baseline'
    },
    visibility: {
        trait: CSS_TRAITS.LAYOUT | CSS_TRAITS.INHERIT,
        value: 'visible'
    },
    whiteSpace: {
        trait: CSS_TRAITS.LAYOUT | CSS_TRAITS.INHERIT,
        value: 'normal'
    },
    widows: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT | CSS_TRAITS.INHERIT,
        value: '2'
    },
    width: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT,
        value: 'auto'
    },
    willChange: {
        trait: 0,
        value: 'auto'
    },
    wordBreak: {
        trait: CSS_TRAITS.LAYOUT | CSS_TRAITS.INHERIT,
        value: 'normal'
    },
    wordSpacing: {
        trait: CSS_TRAITS.CALC | CSS_TRAITS.LAYOUT | CSS_TRAITS.INHERIT,
        value: 'normal'
    },
    wordWrap: {
        trait: CSS_TRAITS.LAYOUT | CSS_TRAITS.DEPRECATED | CSS_TRAITS.INHERIT,
        value: 'normal',
        alias: 'overflowWrap'
    },
    writingMode: {
        trait: CSS_TRAITS.LAYOUT | CSS_TRAITS.INHERIT,
        value: 'horizontal-tb'
    },
    zIndex: {
        trait: CSS_TRAITS.CALC,
        value: 'auto'
    }
};

export const PROXY_INLINESTYLE = Object.freeze(
    new Proxy(
        Object.create({
            fontSize: 'inherit',
            lineHeight: 'inherit',
            "setProperty": function() {},
            "getPropertyValue": function(p: string) { return this[convertCamelCase(p)] as string; }
        }
    ) as CSSStyleDeclaration,
    {
        get: (target, attr: CssStyleAttr) => {
            let value: Undef<unknown>;
            return target[attr] || (value = CSS_PROPERTIES[attr]?.value) && typeof value === 'string' && value || '';
        }
    })
);

export const CSS_BORDER_SET = [
    CSS_PROPERTIES.borderTop!.value as string[],
    CSS_PROPERTIES.borderRight!.value as string[],
    CSS_PROPERTIES.borderBottom!.value as string[],
    CSS_PROPERTIES.borderLeft!.value as string[],
    CSS_PROPERTIES.outline!.value as string[]
];

export function updateDocumentFont() {
    const element = document.documentElement;
    const style = getComputedStyle(element);
    DOCUMENT_FONTSIZE = safeFloat(style.fontSize) || 16;
    const elementStyle = element.style;
    const fontSize = elementStyle.fontSize;
    elementStyle.fontSize = 'initial';
    DOCUMENT_FONTBASE = safeFloat(style.fontSize) || 16;
    elementStyle.fontSize = fontSize;
    const index = 16 - Math.floor(DOCUMENT_FONTBASE);
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
            DOCUMENT_FONTMAP = index < 0 ? [0.6, 0.75, 0.89, 1.2, 1.5, 2, 3] : [1, 1, 1, 11/9, 14/9, 2, 3];
            break;
    }
    setElementCache(element, 'style', style);
}

export function getDocumentFontSize() {
    return DOCUMENT_FONTSIZE;
}

export function convertFontSize(value: string, fixedWidth?: boolean) {
    switch (value) {
        case '':
            return 'inherit';
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
    }
    return value;
}

export function getPropertiesAsTraits(...values: number[]) {
    const result: ObjectMap<CssPropertyData> = {};
    for (const attr in CSS_PROPERTIES) {
        const item = CSS_PROPERTIES[attr]!;
        if (values.every(value => item.trait & value)) {
            item.name = convertHyphenated(attr);
            result[attr] = item;
        }
    }
    return result;
}

export function getInitialValue(element: Element, attr: CssStyleAttr) {
    const property = CSS_PROPERTIES[attr];
    if (property) {
        if (property.valueOfSome) {
            return property.valueOfSome(element);
        }
        if (typeof property.value === 'string') {
            return property.value;
        }
    }
    return '';
}

export function compareSpecificity(value: Specificity, preceding: Undef<Specificity>) {
    if (preceding) {
        const j = value.length;
        const k = preceding.length;
        if (k > j) {
            return false;
        }
        if (j === k) {
            for (let i = 0; i < j; ++i) {
                if (value[i]! !== preceding[i]!) {
                    return value[i]! > preceding[i]!;
                }
            }
        }
    }
    return true;
}

export function getSpecificity(value: string) {
    if (value.indexOf('(') === -1) {
        return calculateSpecificity(value);
    }
    const items = splitEnclosing(value, SPEC_GROUP);
    let result: Undef<Specificity>;
    for (let i = 0, length = items.length, match: Null<RegExpExecArray>; i < length; ++i) {
        const seg = items[i];
        let group: Undef<Specificity>;
        if (seg[0] === ':' && (match = SPEC_ISWHERE.exec(seg))) {
            if (match[1][0] === 'w') {
                continue;
            }
            group = getSelectorValue(mergeSelector(match[2]));
        }
        else {
            group = calculateSpecificity(seg);
        }
        if (!result) {
            result = group;
        }
        else {
            addSpecificity(result, group);
        }
    }
    return result || [0, 0, 0];
}

export function parseSelectorText(value: string) {
    if ((value = value.trim()).indexOf(',') === -1) {
        return [value];
    }
    const items = splitEnclosing(value, CSS.SELECTOR_ENCLOSING_G);
    let timestamp: Undef<number>,
        removed: Undef<string[]>;
    for (let i = 0; i < items.length; ++i) {
        const seg = items[i];
        if (seg[0] === ':' && seg.indexOf(',') !== -1 && SELECTOR_GROUP.test(seg)) {
            (removed ||= []).push(seg);
            items[i] = (timestamp ||= Date.now()) + '-' + (removed.length - 1);
        }
    }
    if (removed) {
        value = items.join('');
    }
    CSS.SELECTOR_ATTR_G.lastIndex = 0;
    let result: string[],
        normalized = value,
        found: Undef<boolean>,
        match: Null<RegExpExecArray>;
    while (match = CSS.SELECTOR_ATTR_G.exec(normalized)) {
        if (match[0].indexOf(',') !== -1) {
            const index = match.index;
            const length = match[0].length;
            normalized = (index ? normalized.substring(0, index) : '') + '_'.repeat(length) + normalized.substring(index + length);
            found = true;
        }
    }
    if (found) {
        result = [];
        let position = 0;
        do {
            const index = normalized.indexOf(',', position);
            if (index !== -1) {
                result.push(value.substring(position, index));
                position = index + 1;
            }
            else {
                result.push(value.substring(position));
                break;
            }
        }
        while (true);
    }
    else {
        result = value.split(/\s*,\s*/);
    }
    if (removed) {
        for (let i = 0, k = 0; i < removed.length; ++i) {
            const part = removed[i];
            const placeholder = timestamp! + '-' + i;
            for (let j = k; j < result.length; ++j) {
                const seg = result[j];
                result[j] = replaceAll(seg, placeholder, part, 1);
                if (seg !== result[j]) {
                    k = j;
                    break;
                }
            }
        }
    }
    return result;
}

export function insertStyleSheetRule(value: string, shadowRoot?: ShadowRoot) {
    if (isUserAgent(USER_AGENT.CHROME | USER_AGENT.EDGE, 73)) {
        try {
            const sheet = new CSSStyleSheet();
            sheet.replaceSync!(value);
            const target = shadowRoot || document;
            target.adoptedStyleSheets = [...target.adoptedStyleSheets!, sheet] as CSSStyleSheet[];
            return () => target.adoptedStyleSheets = target.adoptedStyleSheets!.filter(item => item !== sheet);
        }
        catch {
        }
    }
    const style = document.createElement('style');
    const sheet = style.sheet as CSSStyleSheet;
    if (sheet && typeof sheet.insertRule === 'function') {
        try {
            if (isUserAgent(USER_AGENT.SAFARI)) {
                style.appendChild(document.createTextNode(''));
            }
            sheet.insertRule(value);
            const parentElement = shadowRoot || document.head;
            parentElement.appendChild(style);
            return () => {
                try {
                    parentElement.removeChild(style);
                }
                catch {
                }
            };
        }
        catch {
        }
    }
    return null;
}