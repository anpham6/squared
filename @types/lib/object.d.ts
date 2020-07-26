interface CssProperties {
    [key: string]: CssPropertyData;
}

interface CssPropertyData {
    trait: number;
    value: string | string[];
    name?: string;
    valueOfNone?: string;
}

interface KeyframesData extends ObjectMap<StringMap> {}

interface FontFaceData {
    fontFamily: string;
    fontWeight: number;
    fontStyle: string;
    srcFormat: string;
    srcUrl?: string;
    srcLocal?: string;
}

interface TransformData {
    method: string;
    values: number[];
}

interface ElementData {
    sessionId?: string;
    clientRect?: DOMRect;
    textRangeRect?: BoxRectDimension;
    pseudoElt?: string;
    node?: squared.base.Node;
    style?: StringMap;
    styleMap?: CSSStyleDeclaration;
    styleSpecificity?: StringMap;
    'style::before'?: CSSStyleDeclaration;
    'style::after'?: CSSStyleDeclaration;
    'styleMap::before'?: StringMap;
    'styleMap::after'?: StringMap;
    'styleMap::first-letter'?: StringMap;
    'styleMap::first-line'?: StringMap;
    'styleSpecificity::before'?: StringMap;
    'styleSpecificity::after'?: StringMap;
    'styleSpecificity::first-letter'?: StringMap;
    'styleSpecificity::first-line'?: StringMap;
}

type MIMEOrAll = string[] | "*";