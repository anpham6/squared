import * as application from '../base/application';
import * as file from '../base/file';

export interface ChromeAsset extends file.RequestAsset {
    extension?: string;
}

export interface FileCopyingOptions extends application.FileCopyingOptions, FileActionAttribute {}

export interface FileArchivingOptions extends application.FileArchivingOptions, FileActionAttribute {
    saveAsWebPage?: boolean;
}

export interface FileActionAttribute {
    name?: string;
    rel?: string;
    saveAs?: { html?: SaveAsOptions; script?: SaveAsOptions; link?: SaveAsOptions };
    ignoreExtensions?: boolean;
}

export interface SaveAsOptions {
    filename: string;
    format?: string;
}