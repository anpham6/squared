import * as file from '../base/file';

export interface RequestAsset extends file.RequestAsset {
    rootDir?: string;
    moveTo?: string;
    format?: string;
    bundleIndex?: number;
    requestMain?: boolean;
    outerHTML?: string;
    preserve?: boolean;
    trailingContent?: FormattableContent[];
}

export interface FileActionAttribute {
    name?: string;
    rel?: string;
    saveAs?: { html?: SaveAsOptions; script?: SaveAsOptions; link?: SaveAsOptions; base64?: SaveAsOptions };
    preserveCrossOrigin?: boolean;
}

export interface SaveAsOptions {
    pathname?: string;
    filename?: string;
    format?: string;
    preserve?: boolean;
}

export interface FormattableContent {
    value: string;
    format?: string;
    preserve?: boolean;
}

export interface UriOptions {
    saveAs?: string;
    saveTo?: boolean;
    format?: string;
    preserve?: boolean;
    preserveCrossOrigin?: boolean;
}