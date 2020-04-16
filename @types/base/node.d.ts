import { Node } from './squared';

export type BoxType = "bounds" | "box" | "linear";

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
    inlineVertical?: boolean;
    inlineDimension?: boolean;
    block?: boolean;
    blockStatic?: boolean;
    blockDimension?: boolean;
    blockVertical?: boolean;
    floating?: boolean;
    baseline?: boolean;
    baselineElement?: boolean;
    verticalAlign?: string;
    multiline?: boolean;
    centerAligned?: boolean;
    rightAligned?: boolean;
    bottomAligned?: boolean;
    preserveWhiteSpace?: boolean;
    width?: number;
    height?: number;
    hasWidth?: boolean;
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
    percentWidth?: number;
    percentHeight?: number;
    attributes?: StringMap;
    flexdata?: FlexData;
    flexbox?: FlexBox;
    autoMargin?: AutoMargin;
    backgroundColor?: string;
    backgroundImage?: string;
    visibleStyle?: VisibleStyle;
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

export interface AutoMargin {
    horizontal?: boolean;
    left?: boolean;
    right?: boolean;
    leftRight?: boolean;
    vertical?: boolean;
    top?: boolean;
    bottom?: boolean;
    topBottom?: boolean;
}

export interface QueryData {
    all?: boolean;
    tagName?: string;
    id?: string;
    adjacent?: string;
    classList?: string[];
    attrList?: QueryAttribute[];
    pseudoList?: string[];
    notList?: string[];
}

export interface QueryAttribute extends StringValue {
    symbol?: string;
    caseInsensitive: boolean;
}

export interface LocalSettingsUI {
    screenDimension: Dimension;
}

export interface SupportUI {
    positionRelative: boolean;
    positionTranslation: boolean;
}

export interface CachedValueUI<T> extends CachedValue<T> {
    leftTopAxis?: boolean;
    autoPosition?: boolean;
    positiveAxis?: boolean;
    renderExclude?: boolean;
    containerName?: string;
    baselineHeight?: number;
    support?: SupportUI;
    extensions?: string[];
}

export interface LinearDataUI<T> {
    linearX: boolean;
    linearY: boolean;
    floated: Set<string>;
    cleared?: Map<T, string>;
}

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

export interface HasOptions {
    map?: string;
    not?: string | string[];
    type?: number;
}

export interface BoxOptions {
    reset?: 0 | 1;
    adjustment?: number;
    accumulate?: boolean;
    negative?: boolean;
}

export interface ExcludeUIOptions {
    resource?: number;
    procedure?: number;
    section?: number;
}

export interface HideUIOptions<T> {
    hidden?: boolean;
    collapse?: boolean;
    remove?: boolean;
    replacement?: T;
}

export interface TranslateUIOptions {
    accumulate?: boolean;
    contain?: boolean;
    oppose?: boolean;
    relative?: boolean;
}