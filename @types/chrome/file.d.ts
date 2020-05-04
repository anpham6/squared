import * as file from '../base/file';

export interface RequestAsset extends file.RequestAsset {
    extension?: string;
    rootDir?: string;
    moveTo?: string;
    format?: string;
    bundleIndex?: number;
    requestMain?: boolean;
    outerHTML?: string;
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
}

export interface FormattableContent {
    value: string;
    href: string;
    format?: string;
}