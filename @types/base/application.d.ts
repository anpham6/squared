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


export interface ControllerSettings {
    mimeType: {
        font: MIMEOrAll;
        image: MIMEOrAll;
        audio: MIMEOrAll;
        video: MIMEOrAll;
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

export interface CreateNodeOptions<T> {
    parent?: T;
    element?: Null<Element>;
    children?: T[];
    innerWrap?: T;
    append?: boolean;
    delegate?: boolean;
    cascade?: boolean;
}

export interface CreateNodeGroupOptions<T> {
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
    format?: string;
    copyTo?: string;
    appendTo?: string;
}