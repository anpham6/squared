type Node = squared.base.Node;

export interface InitialData<T> {
    styleMap?: StringMap;
    children?: T[];
}

export interface CachedValue<T> {
    htmlElement?: boolean;
    svgElement?: boolean;
    inputElement?: boolean;
    naturalElement?: boolean;
    textElement?: boolean;
    tableElement?: boolean;
    layoutElement?: boolean;
    flexElement?: boolean;
    gridElement?: boolean;
    naturalChild?: boolean;
    pageFlow?: boolean;
    inlineFlow?: boolean;
    positionStatic?: boolean;
    positionRelative?: boolean;
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
    inlineHorizontal?: boolean;
    inlineVertical?: boolean;
    block?: boolean;
    blockStatic?: boolean;
    blockDimension?: boolean;
    blockVertical?: boolean;
    floating?: boolean;
    baseline?: boolean;
    verticalAlign?: string;
    multiline?: boolean;
    centerAligned?: boolean;
    rightAligned?: boolean;
    bottomAligned?: boolean;
    horizontalAligned?: boolean;
    whiteSpace?: boolean;
    width?: number;
    height?: number;
    hasHeight?: boolean;
    overflow?: number;
    lineHeight?: number;
    dir?: string;
    tagName?: string;
    textContent?: string;
    textEmpty?: boolean;
    float?: string;
    actualParent?: Null<T>;
    absoluteParent?: Null<T>;
    actualWidth?: number;
    actualHeight?: number;
    attributes?: StringMap;
    flexbox?: Flexbox;
    autoMargin?: AutoMargin;
    backgroundColor?: string;
    backgroundImage?: string;
    visibleStyle?: VisibleStyle;
}

export interface CachedValueUI<T> extends CachedValue<T> {
    positionAuto?: boolean;
    positiveAxis?: boolean;
    percentWidth?: boolean;
    percentHeight?: boolean;
    renderExclude?: boolean;
    containerName?: string;
    baselineHeight?: number;
    support?: Support;
    extensions?: string[];
}

export interface VisibleStyle {
    borderWidth: boolean;
    background: boolean;
    backgroundImage: boolean;
    backgroundColor: boolean;
    backgroundRepeat: boolean;
    backgroundRepeatX: boolean;
    backgroundRepeatY: boolean;
}

export interface Support {
    positionRelative: boolean;
}

export type AutoMargin = {
    horizontal?: boolean;
    left?: boolean;
    right?: boolean;
    leftRight?: boolean;
    vertical?: boolean;
    top?: boolean;
    bottom?: boolean;
    topBottom?: boolean;
};

export interface SiblingOptions {
    floating?: boolean;
    pageFlow?: boolean;
    lineBreak?: boolean;
    excluded?: boolean;
}

export interface AscendOptions {
    condition?: (item: Node) => boolean;
    error?: (item: Node) => boolean;
    including?: Node;
    excluding?: Node;
    attr?: string;
    startSelf?: boolean;
    every?: boolean;
}

export interface ExcludeOptions {
    resource?: number;
    procedure?: number;
    section?: number;
}

export interface LinearData<T> {
    linearX: boolean;
    linearY: boolean;
    floated: Set<string>;
    cleared: Map<T, string>;
}