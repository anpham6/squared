type Node = squared.base.Node;
type NodeUI = squared.base.NodeUI;

export interface UserSettings {
    builtInExtensions: string[];
    preloadImages: boolean;
    handleExtensionsAsync: boolean;
    showErrorMessages: boolean;
    createQuerySelectorMap: boolean;
    outputDirectory: string;
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
}

export interface ControllerSettings {
    svg: {
        enabled: boolean;
    };
    supported: {
        fontFormat: '*' | string[];
        imageFormat: '*' | string[];
    };
    unsupported: {
        cascade: Set<string>;
        excluded: Set<string>;
        tagName: Set<string>;
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

export interface AppSession<T extends Node> {
    active: string[];
}

export interface AppSessionUI<T extends NodeUI> extends AppSession<T> {
    cache: squared.base.NodeList<T>;
    excluded: squared.base.NodeList<T>;
    extensionMap: Map<number, squared.base.Extension<T>[]>;
    documentRoot: { node: T, layoutName: string }[];
    targetQueue: Map<T, NodeTemplate<T>>;
}

export interface AppProcessing<T extends Node> {
    cache: squared.base.NodeList<T>;
    excluded: squared.base.NodeList<T>;
    sessionId: string;
    node?: T;
}

export interface ExtensionDependency {
    name: string;
    preload: boolean;
}

export interface ExtensionResult<T extends NodeUI> {
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

export interface LayoutResult<T extends NodeUI> {
    layout: squared.base.LayoutUI<T>;
    next?: boolean;
    renderAs?: T;
}

export interface ResourceAssetMap {
    ids: Map<string, string[]>;
    images: Map<string, ImageAsset>;
    fonts: Map<string, squared.lib.css.CSSFontFaceData[]>;
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

export interface ImageAsset extends Asset {
    width: number;
    height: number;
}

export interface RawAsset extends FileAsset, ImageAsset {
    base64?: string;
}

export interface NodeTemplate<T extends NodeUI> {
    type: number;
    node: T;
    parent?: T;
}

export interface NodeXmlTemplate<T extends NodeUI> extends NodeTemplate<T> {
    controlName?: string;
    attributes?: string;
}

export interface NodeIncludeTemplate<T extends NodeUI> extends NodeTemplate<T> {
    content: string;
}