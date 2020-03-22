type Node = squared.base.Node;
type NodeUI = squared.base.NodeUI;

export interface UserSettings {
    builtInExtensions: string[];
    preloadImages: boolean;
    handleExtensionsAsync: boolean;
    showErrorMessages: boolean;
    createQuerySelectorMap: boolean;
    outputDirectory: string;
    outputEmptyCopyDirectory: boolean;
    outputArchiveFormat: string;
    outputArchiveName: string;
    outputArchiveTimeout: number;
}

export interface UserUISettings extends UserSettings {
    framesPerSecond: number;
    supportNegativeLeftTop: boolean;
    exclusionsDisabled: boolean;
    showAttributes: boolean;
    insertSpaces: number;
    autoCloseOnWrite: boolean;
    resolutionScreenWidth?: number;
    resolutionScreenHeight?: number;
}

export interface ControllerSettings {
    supported: {
        fontFormat: '*' | string[];
        imageFormat: '*' | string[];
    };
}

export interface ControllerUISettings extends ControllerSettings {
    layout: {
        pathName: string;
        fileExtension: string;
        baseTemplate: string;
    };
    directory: {
        string: string;
        font: string;
        image: string;
    };
    style: {
        inputBorderColor: string;
        inputBackgroundColor: string;
        inputColorBorderColor: string;
        meterForegroundColor?: string;
        meterBackgroundColor?: string;
        progressForegroundColor?: string;
        progressBackgroundColor?: string;
    };
    svg: {
        enabled: boolean;
    };
    unsupported: {
        cascade: Set<string>;
        excluded: Set<string>;
        tagName: Set<string>;
    };
    precision: {
        standardFloat: number;
    };
    deviations: {
        textMarginBoundarySize: number;
    };
}

export interface AppFramework<T extends Node> {
    base: {};
    extensions: {};
    lib: {};
    system: FunctionMap<any>;
    create(): AppBase<T>;
    cached(): AppBase<T>;
}

export interface AppBase<T extends Node> {
    application: squared.base.Application<T>;
    framework: number;
    userSettings: UserSettings;
}

export interface AppHandler<T extends Node> {
    application: squared.base.Application<T>;
    cache: squared.base.NodeList<T>;
    readonly userSettings: UserSettings;
}

export interface AppSession<T> {
    active: string[];
}

export interface AppSessionUI<T extends NodeUI> extends AppSession<T> {
    cache: squared.base.NodeList<T>;
    excluded: squared.base.NodeList<T>;
    extensionMap: Map<number, squared.base.Extension<T>[]>;
    clearMap: Map<T, string>;
    targetQueue: Map<T, NodeTemplate<T>>;
}

export interface AppProcessing<T extends Node> {
    cache: squared.base.NodeList<T>;
    excluded: squared.base.NodeList<T>;
    sessionId: string;
    node?: T;
}

export interface AppProcessingUI<T extends Node> extends AppProcessing<T> {}

export interface AppViewModel extends StandardMap {}

export interface ExtensionDependency {
    name: string;
    preload: boolean;
}

export interface ExtensionResult<T> {
    output?: NodeTemplate<T>;
    parent?: T;
    outerParent?: T;
    parentAs?: T;
    renderAs?: T;
    outputAs?: NodeTemplate<T>;
    complete?: boolean;
    next?: boolean;
    include?: boolean;
    subscribe?: boolean;
    remove?: boolean;
}

export interface LayoutType {
    containerType: number;
    alignmentType: number;
    renderType?: number;
}

export interface LayoutOptions<T> extends Optional<LayoutType> {
    parent: T;
    node: T;
    containerType?: number;
    alignmentType?: number;
    children?: T[];
    itemCount?: number;
    rowCount?: number;
    columnCount?: number;
}

export interface LayoutResult<T extends NodeUI> {
    layout: squared.base.LayoutUI<T>;
    next?: boolean;
    renderAs?: T;
}

export interface LayoutRoot<T extends NodeUI> {
    node: T;
    layoutName: string
}

export interface ResourceAssetMap {
    ids: Map<string, string[]>;
    images: Map<string, ImageAsset>;
    fonts: Map<string, squared.lib.css.FontFaceData[]>;
    rawData: Map<string, RawAsset>;
}

export interface ResourceStoredMap {
    strings: Map<string, string>;
    arrays: Map<string, string[]>;
    fonts: Map<string, ObjectMap<string>>;
    colors: Map<string, string>;
    images: Map<string, StringMap>;
}

export interface Asset {
    uri?: string;
    index?: number;
    mimeType?: string;
}

export interface FileAsset extends Asset {
    pathname: string;
    filename: string;
    content: string;
}

export interface ImageAsset extends Asset, Dimension {}

export interface RawAsset extends FileAsset, ImageAsset {
    base64?: string;
}

export interface NodeTemplate<T> {
    type: number;
    node: T;
    parent?: T;
}

export interface NodeXmlTemplate<T> extends NodeTemplate<T> {
    controlName?: string;
    attributes?: string;
}

export interface NodeIncludeTemplate<T> extends NodeTemplate<T> {
    content: string;
}

export interface FileActionOptions {
    assets?: FileAsset[];
    callback?: CallbackResult;
}

export interface FileCopyingOptions extends FileActionOptions {
    directory?: string;
}

export interface FileArchivingOptions extends FileActionOptions {
    filename?: string;
    appendTo?: string;
}

export interface NodeUIOptions<T> {
    parent?: T;
    element?: Null<Element>;
    children?: T[];
    append?: boolean;
    delegate?: boolean;
    cascade?: boolean;
    replace?: T;
}

export interface NodeGroupUIOptions<T> {
    parent?: T;
    delegate?: boolean;
    cascade?: boolean;
}