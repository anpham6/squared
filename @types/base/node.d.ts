export interface InitialData<T> {
    iteration: number;
    styleMap: StringMap;
    children: T[];
    bounds?: BoxRectDimension;
    linear?: BoxRectDimension;
    box?: BoxRectDimension;
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
    leftTopAxis?: boolean;
    positiveAxis?: boolean;
    centerAligned?: boolean;
    rightAligned?: boolean;
    bottomAligned?: boolean;
    horizontalAligned?: boolean;
    renderExclude?: boolean;
    whiteSpace?: boolean;
    width?: number;
    height?: number;
    overflow?: number;
    lineHeight?: number;
    baselineHeight?: number;
    dir?: string;
    tagName?: string;
    containerName?: string;
    textContent?: string;
    textEmpty?: boolean;
    src?: string;
    float?: string;
    actualParent?: T | null;
    absoluteParent?: T | null;
    actualWidth?: number;
    actualHeight?: number;
    attributes?: StringMap;
    flexbox?: Flexbox;
    autoMargin?: AutoMargin;
    backgroundColor?: string;
    backgroundImage?: string;
    visibleStyle?: VisibleStyle;
    percentWidth?: boolean;
    percentHeight?: boolean;
    support?: Support;
    extensions?: string[];
}

export interface VisibleStyle {
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

export interface LinearData<T> {
    linearX: boolean;
    linearY: boolean;
    floated: Set<string>;
    cleared: Map<T, string>;
}