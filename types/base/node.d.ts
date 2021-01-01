interface InitialData<T> extends StandardMap {
    styleMap?: CssStyleMap;
    children?: T[];
    bounds?: Null<BoxRectDimension>;
}

interface CacheValue extends Partial<BoxModel>, Partial<Dimension>, Partial<BoxRect> {
    pageFlow?: boolean;
    positionStatic?: boolean;
    positionRelative?: boolean;
    contentBoxWidth?: number;
    contentBoxHeight?: number;
    outlineWidth?: number;
    inline?: boolean;
    inlineStatic?: boolean;
    block?: boolean;
    blockStatic?: boolean;
    baseline?: boolean;
    verticalAlign?: number;
    multiline?: boolean;
    centerAligned?: boolean;
    rightAligned?: boolean;
    bottomAligned?: boolean;
    preserveWhiteSpace?: boolean;
    hasWidth?: boolean;
    hasHeight?: boolean;
    lineHeight?: number;
    tagName?: string;
    actualWidth?: number;
    actualHeight?: number;
    percentWidth?: number;
    percentHeight?: number;
    flexdata?: FlexData;
    flexbox?: FlexBox;
    autoMargin?: AutoMargin;
    backgroundColor?: string;
    backgroundImage?: string;
    visibleStyle?: VisibleStyle;
    textStyle?: CssStyleMap;
    fontSize?: number;
}

interface CacheValueUI extends CacheValue {
    float?: string;
    floating?: boolean;
    contentBox?: boolean;
    imageElement?: boolean;
    flexElement?: boolean;
    gridElement?: boolean;
    inputElement?: boolean;
    buttonElement?: boolean;
    tableElement?: boolean;
    layoutElement?: boolean;
    scrollElement?: boolean;
    baselineElement?: boolean;
    autoPosition?: boolean;
    leftTopAxis?: boolean;
    positiveAxis?: boolean;
    renderExclude?: boolean;
    inlineFlow?: boolean;
    inlineVertical?: boolean;
    inlineDimension?: boolean;
    blockDimension?: boolean;
    blockVertical?: boolean;
    verticalAligned?: boolean;
    overflow?: number;
    textIndent?: number;
    textWidth?: number;
    baselineHeight?: number;
}

interface CacheState<T> {
    inlineText: boolean;
    htmlElement?: boolean;
    svgElement?: boolean;
    styleElement?: boolean;
    naturalElement?: boolean;
    naturalChild?: boolean;
    actualParent?: Null<T>;
    absoluteParent?: Null<T>;
    wrapperOf?: Null<T>;
    textContent?: string;
    textEmpty?: boolean;
    firstLineStyle?: Null<CssStyleMap>;
    firstLetterStyle?: Null<CssStyleMap>;
    dir?: string;
    attributes?: StringMap;
    extensions?: string[];
}

interface CacheStateUI<T> extends CacheState<T> {
    controlName?: string;
    containerName?: string;
    pseudoElement?: boolean;
    innerMostWrapped?: T;
}

interface LocalSettingsUI {
    systemName: string;
    screenDimension: Dimension;
}

interface SupportUI {
    positionRelative: boolean;
    positionTranslation: boolean;
}

interface VisibleStyle {
    borderWidth: boolean;
    background: boolean;
    backgroundImage: boolean;
    backgroundColor: boolean;
    backgroundRepeat: boolean;
    backgroundRepeatX: boolean;
    backgroundRepeatY: boolean;
    outline: boolean;
}

interface AutoMargin extends Partial<BoxRect<boolean>> {
    horizontal?: boolean;
    leftRight?: boolean;
    vertical?: boolean;
    topBottom?: boolean;
}

interface LinearData {
    linearX: boolean;
    linearY: boolean;
    floated?: Set<string>;
}

interface QueryData {
    all?: boolean;
    tagName?: string;
    id?: string;
    adjacent?: string;
    classList?: string[];
    attrList?: QueryAttribute[];
    pseudoList?: string[];
    notList?: string[];
    fromNot?: boolean;
}

interface QueryAttribute extends StringValue<Undef<string>> {
    caseInsensitive: boolean;
    symbol?: string;
    endsWith?: boolean;
}