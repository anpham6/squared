import { LayoutUI, NodeUI } from './squared';
import { FileAsset, Exclusions } from './file';

import { MIMEOrAll } from '../lib/data';

export interface UserSettings {
    builtInExtensions: string[];
    preloadImages: boolean;
    showErrorMessages: boolean;
    createQuerySelectorMap: boolean;
    outputEmptyCopyDirectory: boolean;
    outputArchiveFormat: string;
    outputArchiveName: string;
}

export interface UserUISettings extends UserSettings {
    framesPerSecond: number;
    supportNegativeLeftTop: boolean;
    exclusionsDisabled: boolean;
    showAttributes: boolean;
    insertSpaces: number;
    autoCloseOnWrite: boolean;
    outputDirectory: string;
    resolutionScreenWidth?: number;
    resolutionScreenHeight?: number;
}

export interface ControllerSettings {
    mimeType: {
        font: MIMEOrAll;
        image: MIMEOrAll;
        audio: MIMEOrAll;
        video: MIMEOrAll;
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

export interface LayoutOptions<T> extends Partial<LayoutType> {
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
    layout: LayoutUI<T>;
    next?: boolean;
    renderAs?: T;
}

export interface LayoutRoot<T extends NodeUI> {
    node: T;
    layoutName: string;
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

export interface FileActionOptions {
    assets?: FileAsset[];
    exclusions?: Exclusions;
    callback?: CallbackResult;
}

export interface FileCopyingOptions extends FileActionOptions {
    directory?: string;
}

export interface FileArchivingOptions extends FileActionOptions {
    filename?: string;
    appendTo?: string;
    format?: string;
}