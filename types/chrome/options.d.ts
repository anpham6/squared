interface FileActionOptions extends squared.FileActionOptions, FileActionAttribute, FileUniversalAttribute {
    assetMap?: ElementAssetMap;
}

interface FileCopyingOptions extends squared.base.FileCopyingOptions, FileActionOptions {}

interface FileArchivingOptions extends squared.base.FileArchivingOptions, FileActionOptions {}

interface SaveAsOptions extends Partial<LocationUri>, AttributeAction, OutputAction, OutputModifiers {}

interface UriOptions {
    element?: HTMLElement;
    saveAs?: string;
    saveTo?: boolean;
    format?: string;
    inline?: boolean;
    preserveCrossOrigin?: boolean;
    document?: string | string[];
    fromConfig?: boolean;
}