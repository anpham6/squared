type Node = squared.base.Node;

export interface UserSettings {
    builtInExtensions: string[];
    preloadImages: boolean;
    framesPerSecond: number;
    supportNegativeLeftTop: boolean;
    exclusionsDisabled: boolean;
    showAttributes: boolean;
    insertSpaces: number;
    handleExtensionsAsync: boolean;
    autoCloseOnWrite: boolean;
    outputDirectory: string;
    outputMainFileName: string;
    outputArchiveFileType: string;
    outputMaxProcessingTime: number;
}

export interface ControllerSettings {
    layout: {
        pathName: string;
        fileExtension: string;
        baseTemplate: string;
    };
    svg: {
        enabled: boolean;
    };
    supported: {
        fontFormat: string[];
        imageFormat: string[];
    };
    unsupported: {
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

export interface AppSession<T extends Node, U> {
    cache: U;
    documentRoot: { node: T, layoutName: string }[];
    excluded: squared.base.NodeList<T>;
    targetQueue: Map<T, NodeTemplate<T>>;
    active: string[];
    extensionMap: Map<number, squared.base.Extension<T>[]>;
}

export interface AppProcessing<T extends Node, U> {
    cache: U;
    sessionId: string;
    node: T | undefined;
    excluded: squared.base.NodeList<T>;
}

export interface ExtensionDependency {
    name: string;
    preload: boolean;
}

export interface ExtensionResult<T extends Node> {
    parentAs?: T;
    output?: NodeTemplate<T>;
    renderAs?: T;
    outputAs?: NodeTemplate<T>;
    parent?: T;
    complete?: boolean;
    next?: boolean;
    include?: boolean;
}

export interface LayoutType {
    containerType: number;
    alignmentType: number;
    renderType: number;
}

export interface LayoutResult<T extends Node> {
    layout: squared.base.Layout<T>;
    next?: boolean;
    renderAs?: T;
}

export interface ResourceAssetMap {
    ids: Map<string, string[]>;
    images: Map<string, ImageAsset>;
    fonts: Map<string, squared.lib.css.CSSFontFaceData[]>;
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
}

export interface FileAsset extends Asset {
    pathname: string;
    filename: string;
    content: string;
}

export interface ImageAsset extends Asset {
    width: number;
    height: number;
    position?: Point;
}

export interface NodeTag<T extends Node> extends Optional<NodeTemplate<T>> {
}

export interface NodeTagXml<T extends Node> extends NodeTag<T> {
    controlName: string;
    attributes?: string;
    content?: string;
}

export interface NodeTemplate<T extends Node> {
    type: number;
    node: T;
}

export interface NodeXmlTemplate<T extends Node> extends NodeTemplate<T> {
    controlName?: string;
    attributes?: string;
}

export interface NodeIncludeTemplate<T extends Node> extends NodeTemplate<T> {
    content: string;
}