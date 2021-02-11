interface CssProperties {
    [key: string]: CssPropertyData;
}

interface CssPropertyData {
    name?: string;
    readonly trait: number;
    readonly value: StringOfArray;
    readonly alias?: string;
    readonly valueOfNone?: string;
}

interface KeyframeData extends ObjectMap<StringMap> {}

interface TransformData {
    group: string;
    method: string;
    values: number[];
    angle?: number;
}

interface ElementData {
    sessionId?: string;
    clientRect?: DOMRect;
    textRangeRect?: BoxRectDimension;
    pseudoElt?: PseudoElt;
    node?: unknown;
    style?: CSSStyleDeclaration;
    styleMap?: CssStyleMap;
    styleSpecificity?: ObjectMap<number>;
    'style::before'?: CSSStyleDeclaration;
    'style::after'?: CSSStyleDeclaration;
    'styleMap::before'?: CssStyleMap;
    'styleMap::after'?: CssStyleMap;
    'styleMap::first-letter'?: CssStyleMap;
    'styleMap::first-line'?: CssStyleMap;
    'styleSpecificity::before'?: ObjectMap<number>;
    'styleSpecificity::after'?: ObjectMap<number>;
    'styleSpecificity::first-letter'?: ObjectMap<number>;
    'styleSpecificity::first-line'?: ObjectMap<number>;
}