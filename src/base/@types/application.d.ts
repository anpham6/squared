export interface UserSettings {
    builtInExtensions: string[];
    preloadImages: boolean;
    maxWordWrapWidth: number;
    supportNegativeLeftTop: boolean;
    exclusionsDisabled: boolean;
    customizationsDisabled: boolean;
    customizationsOverwritePrivilege: boolean;
    replaceCharacterEntities: boolean;
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
    baseTemplate: string;
    floatPrecision: number;
    layout: {
        pathName: string;
        fileExtension: string;
    };
    svg: {
        enabled: boolean
    };
    unsupported: {
        excluded: Set<string>,
        tagName: Set<string>
    };
    relative: {
        superscriptFontScale: number;
        subscriptFontScale: number;
    };
    constraint: {
        withinParentBottomOffset: number;
    };
}

export interface AppFramework<T extends squared.base.Node> {
    base: {};
    extensions: {};
    lib: {};
    system: FunctionMap<any>;
    create(): AppBase<T>;
    cached(): AppBase<T>;
}

export interface AppBase<T extends squared.base.Node> {
    application: squared.base.Application<T>;
    framework: number;
    userSettings: UserSettings;
}

export interface AppHandler<T extends squared.base.Node> {
    application: squared.base.Application<T>;
    cache: squared.base.NodeList<T>;
    readonly userSettings: UserSettings;
}

export interface AppSession<T extends squared.base.Node, U> {
    cache: U;
    documentRoot: { node: T, layoutName: string }[];
    image: Map<string, ImageAsset>;
    excluded: squared.base.NodeList<T>;
    targetQueue: Map<T, NodeTemplate<T>>;
    renderPosition: Map<T, T[]>;
    extensionMap: Map<number, squared.base.Extension<T>[]>;
}

export interface AppProcessing<T extends squared.base.Node, U> {
    cache: U;
    node: T | undefined;
    excluded: squared.base.NodeList<T>;
}

export interface SessionData<T> {
    cache: T;
    templates: FileAsset[];
}

export interface ExtensionDependency {
    name: string;
    preload: boolean;
}

export interface ExtensionResult<T extends squared.base.Node> {
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

export interface LayoutResult<T extends squared.base.Node> {
    layout: squared.base.Layout<T>;
    next?: boolean;
    renderAs?: T;
}

export interface ResourceAssetMap {
    ids: Map<string, string[]>;
    images: Map<string, ImageAsset>;
}

export interface ResourceStoredMap {
    strings: Map<string, string>;
    arrays: Map<string, string[]>;
    fonts: Map<string, ObjectMap<boolean>>;
    colors: Map<string, string>;
    images: Map<string, StringMap>;
}

export interface TemplateData {
    [name: string]: string | ExternalData[] | false;
}

export interface TemplateDataA {
    A: TemplateDataAA[];
    B?: TemplateDataAA[] | false;
    C?: TemplateDataAA[] | false;
    D?: TemplateDataAA[] | false;
    E?: TemplateDataAA[] | false;
    F?: TemplateDataAA[] | false;
    [name: string]: Undefined<string | ExternalData[] | false>;
}

export interface TemplateDataAA {
    AA?: TemplateDataAAA[] | false;
    BB?: TemplateDataAAA[] | false;
    CC?: TemplateDataAAA[] | false;
    DD?: TemplateDataAAA[] | false;
    EE?: TemplateDataAAA[] | false;
    FF?: TemplateDataAAA[] | false;
    [name: string]: Undefined<string | ExternalData[] | false>;
}

export interface TemplateDataAAA {
    AAA?: any[] | false;
    BBB?: any[] | false;
    CCC?: any[] | false;
    DDD?: any[] | false;
    EEE?: any[] | false;
    FFF?: any[] | false;
    [name: string]: Undefined<string | ExternalData[] | false>;
}

export interface Asset {
    id?: number;
    uri?: string;
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

export interface NodeTemplate<T extends squared.base.Node> {
    type: number;
    node: T;
}

export interface NodeXmlTemplate<T extends squared.base.Node> extends NodeTemplate<T> {
    controlName?: string;
    attributes?: string;
}

export interface NodeIncludeTemplate<T extends squared.base.Node> extends NodeTemplate<T> {
    content: string;
    indent?: boolean;
}