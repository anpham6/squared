type BoxType = "bounds" | "box" | "linear";

interface InitialData<T> {
    styleMap?: StringMap;
    children?: T[];
    bounds?: BoxRectDimension;
}

interface CachedValue<T> {
    htmlElement?: boolean;
    svgElement?: boolean;
    naturalElement?: boolean;
    naturalChild?: boolean;
    pageFlow?: boolean;
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
    block?: boolean;
    blockStatic?: boolean;
    baseline?: boolean;
    baselineElement?: boolean;
    verticalAlign?: number;
    multiline?: boolean;
    centerAligned?: boolean;
    rightAligned?: boolean;
    bottomAligned?: boolean;
    preserveWhiteSpace?: boolean;
    width?: number;
    height?: number;
    hasWidth?: boolean;
    hasHeight?: boolean;
    lineHeight?: number;
    dir?: string;
    tagName?: string;
    actualParent?: Null<T>;
    absoluteParent?: Null<T>;
    actualWidth?: number;
    actualHeight?: number;
    percentWidth?: number;
    percentHeight?: number;
    attributes?: StringMap;
    flexdata?: FlexData;
    flexbox?: FlexBox;
    autoMargin?: AutoMargin;
    backgroundColor?: string;
    backgroundImage?: string;
    visibleStyle?: VisibleStyle;
    extensions?: string[];
}

interface CachedValueUI<T> extends CachedValue<T> {
    float?: string;
    floating?: boolean;
    textContent?: string;
    contentBox?: boolean;
    imageElement?: boolean;
    flexElement?: boolean;
    gridElement?: boolean;
    inputElement?: boolean;
    tableElement?: boolean;
    layoutElement?: boolean;
    scrollElement?: boolean;
    leftTopAxis?: boolean;
    autoPosition?: boolean;
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
    textEmpty?: boolean;
    containerName?: string;
    baselineHeight?: number;
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
}

interface AutoMargin {
    horizontal?: boolean;
    left?: boolean;
    right?: boolean;
    leftRight?: boolean;
    vertical?: boolean;
    top?: boolean;
    bottom?: boolean;
    topBottom?: boolean;
}

interface SiblingOptions {
    floating?: boolean;
    pageFlow?: boolean;
    lineBreak?: boolean;
    excluded?: boolean;
}

interface AscendOptions<T> {
    condition?: (item: T) => boolean;
    error?: (item: T) => boolean;
    including?: T;
    excluding?: T;
    attr?: string;
    startSelf?: boolean;
    every?: boolean;
}

interface BoxOptions {
    reset?: 0 | 1;
    adjustment?: number;
    max?: boolean;
    min?: boolean;
    accumulate?: boolean;
    negative?: boolean;
}

interface CssSortOptions {
    ascending?: boolean;
    duplicate?: boolean;
    byFloat?: true;
    byInt?: true;
}

interface CssPXOptions {
    negative?: boolean;
}

interface CssInitialOptions {
    modified?: boolean;
    computed?: boolean;
}

interface HasOptions extends CssInitialOptions {
    initial?: boolean;
    not?: string | string[];
    type?: number;
}

interface HasPXOptions extends CssInitialOptions {
    initial?: boolean;
    percent?: boolean;
}

interface CssAscendOptions extends CssInitialOptions {
    initial?: boolean;
    startSelf?: boolean;
}

interface CssAnyOptions extends CssInitialOptions {
    initial?: boolean
    values: string[];
}

interface MinMaxOptions extends CssInitialOptions {
    initial?: boolean;
    self?: boolean;
    last?: boolean;
}

interface ParseUnitOptions {
    dimension?: DimensionAttr;
    parent?: boolean;
    screenDimension?: Dimension;
}

interface LinearData<T> {
    linearX: boolean;
    linearY: boolean;
    floated?: Set<string>;
}

interface ExcludeOptions {
    resource?: number;
    procedure?: number;
    section?: number;
}

interface ReplaceTryOptions<T> {
    child: T;
    replaceWith: T;
    notFoundAppend?: boolean;
}

interface RemoveTryOptions<T> {
    replaceWith?: T;
    alignSiblings?: boolean;
    beforeReplace?: BindGeneric<Undef<T>, void>;
}

interface HideOptions<T> extends RemoveTryOptions<T> {
    hidden?: boolean;
    collapse?: boolean;
    remove?: boolean;
}

interface TranslateOptions {
    accumulate?: boolean;
    contain?: boolean;
    oppose?: boolean;
    relative?: boolean;
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
}

interface QueryAttribute extends StringValue {
    symbol?: string;
    endsWith?: boolean;
    caseInsensitive: boolean;
}