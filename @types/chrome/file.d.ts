
import { FileCopyingOptions, FileArchivingOptions } from '../base/application';
import { RequestAsset } from '../base/file';

export interface ChromeAsset extends RequestAsset {
    extension?: string;
}

export interface FileActionAttribute {
    name?: string;
    rel?: string;
}

export interface FileCopyingOptionsChrome extends FileCopyingOptions, FileActionAttribute {
}

export interface FileArchivingOptionsChrome extends FileArchivingOptions, FileActionAttribute {
    saveAsWebPage?: boolean;
}