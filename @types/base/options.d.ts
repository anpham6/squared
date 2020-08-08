interface CreateNodeOptions {
    element?: Element;
}

interface CreateNodeUIOptions<T> extends CreateNodeOptions {
    parent?: T;
    children?: T[];
    innerWrapped?: T;
    append?: boolean;
    delegate?: boolean;
    cascade?: boolean;
}

interface CreateNodeGroupUIOptions {
    delegate?: boolean;
    cascade?: boolean;
}

interface CreateNodeWrapperUIOptions<T> extends ExcludeOptions {
    children?: T[];
    containerType?: number;
    alignmentType?: number;
    cascade?: boolean;
}

interface LayoutOptions<T> extends Partial<LayoutType> {
    parent: T;
    node: T;
    containerType?: number;
    alignmentType?: number;
    children?: T[];
    itemCount?: number;
    rowCount?: number;
    columnCount?: number;
}

interface ExtensionOptions {
    dependencies?: ExtensionDependency[];
}

interface ExtensionUIOptions extends ExtensionOptions {
    tagNames?: string[];
}

interface DocumentWriteExtensionUIOptions<T extends squared.base.NodeUI> {
    rendered: T[];
    documentRoot: squared.base.LayoutRoot<T>[];
}

interface RawDataOptions {
    mimeType?: string;
    data?: any;
    width?: number;
    height?: number;
    encoding?: string;
    filename?: string;
}

interface SiblingOptions {
    floating?: boolean;
    pageFlow?: boolean;
    lineBreak?: boolean;
    excluded?: boolean;
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
    initial?: boolean;
    modified?: boolean;
    computed?: boolean;
}

interface CssAscendOptions extends CssInitialOptions {
    startSelf?: boolean;
}

interface CssAnyOptions extends CssInitialOptions, CssAscendOptions {
    ascend?: boolean;
}

interface HasOptions extends CssInitialOptions {
    not?: string | string[];
    type?: number;
    ignoreDefault?: boolean;
    map?: "document" | "svg";
}

interface HasPXOptions extends CssInitialOptions {
    percent?: boolean;
}

interface MinMaxOptions extends CssInitialOptions {
    self?: boolean;
    last?: boolean;
    wrapperOf?: boolean;
}

interface NodeParseUnitOptions extends ParseUnitOptions {
    dimension?: DimensionAttr;
    parent?: boolean;
}

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