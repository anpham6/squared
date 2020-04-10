
import { FileCopyingOptions, FileArchivingOptions } from '../base/application';
import { RequestAsset } from '../base/file';

interface ChromeAsset extends RequestAsset {
    extension?: string;
}

interface FileActionAttribute {
    name?: string;
    rel?: string;
}

interface FileCopyingOptionsChrome extends FileCopyingOptions, FileActionAttribute {
}

interface FileArchivingOptionsChrome extends FileArchivingOptions, FileActionAttribute {
    saveAsWebPage?: boolean;
}