interface CssProperties {
    [key: string]: Undef<CssPropertyData>;
}

interface CssPropertyData {
    name?: string;
    readonly trait: number;
    readonly value: StringOfArray;
    readonly alias?: string;
    readonly valueOfNone?: string;
    readonly valueOfSome?: (elememt: Element) => string;
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
    styleSpecificity?: ObjectMap<Specificity>;
    'style::before'?: CSSStyleDeclaration;
    'style::after'?: CSSStyleDeclaration;
    'style::first-letter'?: CSSStyleDeclaration;
    'style::first-line'?: CSSStyleDeclaration;
    'style::marker'?: CSSStyleDeclaration;
    'style::placeholder'?: CSSStyleDeclaration;
    'styleMap::before'?: CssStyleMap;
    'styleMap::after'?: CssStyleMap;
    'styleMap::first-letter'?: CssStyleMap;
    'styleMap::first-line'?: CssStyleMap;
    'styleMap::marker'?: CssStyleMap;
    'styleMap::placeholder'?: CssStyleMap;
    'styleSpecificity::before'?: ObjectMap<number>;
    'styleSpecificity::after'?: ObjectMap<number>;
    'styleSpecificity::first-letter'?: ObjectMap<number>;
    'styleSpecificity::first-line'?: ObjectMap<number>;
    'styleSpecificity::marker'?: ObjectMap<number>;
    'styleSpecificity::placeholder'?: ObjectMap<number>;
}