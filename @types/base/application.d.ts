interface UserSettings {
    builtInExtensions: string[];
    showErrorMessages: boolean;
    createElementMap: boolean;
    createQuerySelectorMap: boolean;
}

interface UserResourceSettings extends UserSettings {
    preloadImages: boolean;
    outputEmptyCopyDirectory: boolean;
    outputArchiveFormat: string;
    outputArchiveName: string;
}

interface UserSettingsUI extends UserResourceSettings {
    framesPerSecond: number;
    supportNegativeLeftTop: boolean;
    showAttributes: boolean;
    insertSpaces: number;
    autoCloseOnWrite: boolean;
    outputDirectory: string;
    resolutionScreenWidth?: number;
    resolutionScreenHeight?: number;
}

interface ControllerSettings {
    mimeType: {
        font: MIMEOrAll;
        image: MIMEOrAll;
        audio: MIMEOrAll;
        video: MIMEOrAll;
    };
}

interface ControllerSettingsUI extends ControllerSettings {
    layout: {
        pathName: string;
        fileExtension: string;
        baseTemplate: string;
    };
    directory: {
        string: string;
        font: string;
        image: string;
        video: string;
        audio: string;
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

interface ExtensionDependency {
    name: string;
    preload: boolean;
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
    controlName?: string;
    attributes?: string;
}

interface NodeIncludeTemplate<T> extends NodeTemplate<T> {
    content: string;
}

interface LayoutType {
    containerType: number;
    alignmentType: number;
    renderType?: number;
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

interface CreateNodeOptions {
    element: Element;
}

interface CreateNodeUIOptions<T> {
    parent?: T;
    element?: Null<Element>;
    children?: T[];
    innerWrap?: T;
    append?: boolean;
    delegate?: boolean;
    cascade?: boolean;
}

interface CreateNodeGroupUIOptions<T> {
    delegate?: boolean;
    cascade?: boolean;
}