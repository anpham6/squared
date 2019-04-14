export interface InitialData<T> {
    iteration: number;
    styleMap: StringMap;
    children: T[];
    bounds?: RectDimension;
    linear?: RectDimension;
    box?: RectDimension;
}

export interface CachedValue<T> {
    htmlElement?: boolean;
    naturalElement?: boolean;
    pseudoElement?: boolean;
    pageFlow?: boolean;
    inlineFlow?: boolean;
    positionStatic?: boolean;
    positionRelative?: boolean;
    positionAuto?: boolean;
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
    marginTop?: number;
    marginRight?: number;
    marginBottom?: number;
    marginLeft?: number;
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    borderTopWidth?: number;
    borderRightWidth?: number;
    borderBottomWidth?: number;
    borderLeftWidth?: number;
    contentBoxWidth?: number;
    contentBoxHeight?: number;
    inline?: boolean;
    inlineStatic?: boolean;
    inlineVertical?: boolean;
    block?: boolean;
    blockStatic?: boolean;
    blockDimension?: boolean;
    floating?: boolean;
    baseline?: boolean;
    verticalAlign?: string;
    multiline?: boolean;
    hasWidth?: boolean;
    hasHeight?: boolean;
    centerAligned?: boolean;
    rightAligned?: boolean;
    bottomAligned?: boolean;
    renderExclude?: boolean;
    preserveWhiteSpace?: boolean;
    width?: number;
    height?: number;
    overflow?: number;
    lineHeight?: number;
    dir?: string;
    tagName?: string;
    textContent?: string;
    float?: string;
    actualParent?: T | null;
    absoluteParent?: T | null;
    actualChildren?: T[];
    actualWidth?: number;
    actualHeight?: number;
    flexbox?: Flexbox;
    autoMargin?: AutoMargin;
    visibleStyle?: VisibleStyle;
    support?: Support;
    extensions?: string[];
}

export interface VisibleStyle {
    padding: boolean;
    borderWidth: boolean;
    background: boolean;
    backgroundImage: boolean;
    backgroundColor: boolean;
    backgroundRepeat: boolean;
}

export interface Support {
    container: {
        positionRelative: boolean;
    };
}

export type AutoMargin = {
    horizontal: boolean;
    left: boolean;
    right: boolean;
    leftRight: boolean;
    vertical: boolean;
    top: boolean;
    bottom: boolean;
    topBottom: boolean;
};

export interface SiblingDirection {
    floating?: boolean;
    pageFlow?: boolean;
    lineBreak?: boolean;
    excluded?: boolean;
}