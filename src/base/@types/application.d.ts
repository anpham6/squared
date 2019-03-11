export interface UserSettings {
    builtInExtensions: string[];
    preloadImages: boolean;
    supportNegativeLeftTop: boolean;
    floatOverlapDisabled: boolean;
    exclusionsDisabled: boolean;
    customizationsDisabled: boolean;
    customizationsOverwritePrivilege: boolean;
    replaceCharacterEntities: boolean;
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
    unsupported: {
        excluded: Set<string>,
        tagName: Set<string>
    };
    relative: {
        boxWidthWordWrapPercent: number;
        superscriptFontScale: number;
        subscriptFontScale: number;
    };
    constraint: {
        withinParentBottomOffset: number;
        percentPrecision: number;
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
    image: Map<string, ImageAsset>;
    renderQueue: Map<string, string[]>;
    excluded: squared.base.NodeList<T>;
    targeted: Map<string, T[]>;
}

export interface AppProcessing<T extends squared.base.Node, U> {
    cache: U;
    depthMap: Map<number, Map<string, string>>;
    node: T | undefined;
    layout: FileAsset | undefined;
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
    output: string;
    complete?: boolean;
    next?: boolean;
    parent?: T;
    renderAs?: T;
    outputAs?: string;
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