
import { FileCopyingOptions, FileArchivingOptions } from '../base/application';
import { RawAsset } from '../base/file';

interface ChromeAsset extends Omit<RawAsset, keyof Dimension | 'content'> {
    content?: string;
    extension?: string;
}

interface FileActionAttribute {
    name?: string;
    rel?: string;
}

interface FileCopyingOptionsChrome extends FileCopyingOptions, FileActionAttribute {
}

interface FileArchivingOptionsChrome extends FileArchivingOptions, FileActionAttribute {
}