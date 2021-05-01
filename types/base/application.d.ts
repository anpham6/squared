interface UserSettings {
    builtInExtensions: string[];
    showErrorMessages: boolean;
    pierceShadowRoot: boolean;
    createElementMap: boolean;
    createQuerySelectorMap: boolean;
}

interface UserResourceSettings extends UserSettings {
    preloadImages: boolean;
    preloadFonts: boolean;
    preloadCustomElements: boolean;
    formatUUID: string;
    outputTasks: ObjectMap<TaskAction | TaskAction[]>;
    outputWatch: ObjectMap<WatchValue>;
    outputEmptyCopyDirectory: boolean;
    outputDocumentHandler: StringOfArray;
    outputArchiveFormat: string;
    outputArchiveName: string;
    outputArchiveCache: boolean;
}

interface UserResourceSettingsUI extends UserResourceSettings {
    enabledSVG: boolean;
    framesPerSecond: number;
    supportNegativeLeftTop: boolean;
    showAttributes: boolean;
    insertSpaces: number;
    outputDirectory: string;
    resolutionScreenWidth?: number;
    resolutionScreenHeight?: number;
}

interface ControllerSettings {
    adoptedStyleSheet?: string;
    mimeType: {
        font: MIMEOrAll;
        image: MIMEOrAll;
        audio: MIMEOrAll;
        video: MIMEOrAll;
    };
}

interface ControllerSettingsUI extends ControllerSettings {
    layout: ControllerSettingsLayoutUI;
    directory: ControllerSettingsDirectoryUI;
    style: ControllerSettingsStyleUI;
    unsupported: ControllerSettingsUnsupportedUI;
    deviations: ControllerSettingsDeviationsUI;
    floatPrecision: number;
}

interface ControllerSettingsLayoutUI {
    baseDirectory: string;
    fileExtension: string;
    baseTemplate: string;
    innerXmlTags: string[];
}

interface ControllerSettingsDirectoryUI {
    string: string;
    font: string;
    image: string;
    video: string;
    audio: string;
}

interface ControllerSettingsStyleUI {
    anchorFontColor: string;
    formFontSize: string;
    inputBorderColor: string;
    inputBorderWidth: string;
    inputBorderStyle: string;
    inputBackgroundColor?: string;
    inputDisabledBorderColor: string;
    inputDisabledBackgroundColor: string;
    buttonBorderColor: string;
    buttonBorderWidth: string;
    buttonBorderStyle: string;
    buttonPaddingVertical: string;
    buttonPaddingHorizontal: string;
    buttonBackgroundColor: string;
    buttonDisabledBorderColor: string;
    buttonDisabledBackgroundColor: string;
    hrBorderColor: string;
    rangeForegroundColor: string;
    rangeBackgroundColor: string;
    rangeBackgroundCenterHeight: number;
    meterForegroundColor: string;
    meterBackgroundColor: string;
    progressForegroundColor: string;
    progressBackgroundColor: string;
}

interface ControllerSettingsUnsupportedUI {
    cascade: string[];
    excluded: string[];
    tagName: string[];
}

interface ControllerSettingsDeviationsUI {
    textMarginBoundarySize: number;
}

interface ExtensionDependency {
    name: string;
    leading?: boolean;
    trailing?: boolean;
}

interface ExtensionResult<T> {
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

interface NodeTemplate<T> {
    type: number;
    node: T;
    parent?: T;
}

interface NodeXmlTemplate<T> extends NodeTemplate<T> {
    controlName: string;
    attributes?: string;
}

interface NodeIncludeTemplate<T> extends NodeTemplate<T> {
    content: string;
}

interface LayoutType {
    containerType: number;
    alignmentType: number;
}

interface LayoutRoot<T> extends Partial<LocationUri> {
    node: T;
    renderTemplates: NodeTemplate<T>[];
    filename: string;
    documentBase?: boolean;
}

interface FinalizeDataExtensionUI<T> {
    resourceId: number;
    rendered: T[];
    documentRoot: LayoutRoot<T>[];
}

interface ResourceMap extends ObjectMap<Map<string, unknown> | unknown[]> {}

interface ResourceAssetMap extends ResourceMap {
    fonts: Map<string, FontFaceData[]>;
    image: Map<string, ImageAsset>;
    video?: Map<string, Asset>;
    audio?: Map<string, Asset>;
    rawData?: Map<string, RawAsset>;
    other?: RawAsset[];
    keyFrames?: KeyframesMap;
}

interface ResourceStoredMap extends ResourceMap {
    ids: Map<string, string[]>;
    strings: Map<string, string>;
    arrays: Map<string, string[]>;
    fonts: Map<string, StringMap>;
    colors: Map<string, string>;
    images: Map<string, StringMap>;
}

interface FontFaceData {
    fontFamily: string;
    fontWeight: number;
    fontStyle: string;
    mimeType: string;
    srcFormat: string;
    srcUrl?: string;
    srcLocal?: string;
    srcBase64?: string;
}