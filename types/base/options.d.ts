interface CreateNodeOptions {
    element?: Element;
 }

interface CreateNodeUIOptions<T> extends CreateNodeOptions {
    flags?: number;
    parent?: T;
    children?: T[];
    innerWrapped?: T;
}

interface CreateNodeGroupUIOptions extends Partial<LayoutType> {
    flags?: number;
}

interface CreateNodeWrapperUIOptions<T> extends Partial<LayoutType>, ExcludeOptions {
    flags?: number;
    children?: T[];
}

interface LayoutOptions<T> extends Partial<LayoutType> {
    parent: T;
    node: T;
    children?: T[];
    itemCount?: number;
    rowCount?: number;
    columnCount?: number;
    renderType?: number;
}

interface ExtensionOptions {
    dependencies?: ExtensionDependency[];
}

interface ExtensionUIOptions extends ExtensionOptions {
    tagNames?: string[];
}

interface AudioVideoOptions extends ElementScope {
    mimeType?: string;
}

interface RawDataOptions extends Partial<Dimension>, ElementScope {
    mimeType?: string;
    content?: string;
    buffer?: ArrayBuffer;
    base64?: string;
    encoding?: string;
    filename?: string;
}

interface DescendOptions<T> {
    condition?: (item: T) => boolean;
    error?: (item: T) => boolean;
    including?: T;
    excluding?: T;
    every?: boolean;
}

interface AscendOptions<T> extends DescendOptions<T> {
    attr?: "actualParent" | "absoluteParent" | "parent" | "renderParent" | "documentParent" | "outerWrapper";
    startSelf?: boolean;
}

interface SiblingsOptions<T> extends DescendOptions<T> {
    reverse?: boolean;
}

interface TraverseSiblingsOptions {
    floating?: boolean;
    pageFlow?: boolean;
    lineBreak?: boolean;
    excluded?: boolean;
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

interface CssUnitOptions extends NodeParseUnitOptions, CssInitialOptions {}

interface CssInitialOptions {
    initial?: boolean;
    modified?: boolean;
    computed?: boolean;
    value?: string;
}

interface CssAscendOptions extends CssInitialOptions {
    startSelf?: boolean;
}

interface CssAnyOptions extends CssInitialOptions, CssAscendOptions {
    ascend?: boolean;
}

interface HasOptions extends CssInitialOptions {
    not?: StringOfArray;
    type?: number;
    ignoreDefault?: boolean;
}

interface HasPXOptions extends CssInitialOptions {
    percent?: boolean;
}

interface MinMaxOptions extends CssInitialOptions {
    self?: boolean;
    last?: boolean;
    wrapperOf?: boolean;
    subAttr?: string;
    initialValue?: number;
}

interface NodeUnitOptions {
    dimension?: DimensionAttr;
    parent?: boolean;
}

interface NodeParseUnitOptions extends ParseUnitOptions, NodeUnitOptions {}

interface NodeConvertUnitOptions extends NodeParseUnitOptions, ConvertUnitOptions {}

interface TextHeightOptions {
    tagName?: string;
    width?: string;
    textContent?: string;
    textWrap?: boolean;
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

interface CoordsXYOptions {
    dimension?: BoxType;
}

interface OffsetXYOptions extends CoordsXYOptions {
    offset?: number;
}

interface BackgroundPositionOptions extends UnitOptions {
    imageDimension?: Null<Dimension>;
    imageSize?: string;
}

interface ParseGlobOptions {
    fromEnd?: boolean;
    caseSensitive?: boolean;
}

interface LoadDataOptions {
    type?: XMLHttpRequestResponseType;
    mime?: string;
    accept?: string;
    cache?: boolean;
}