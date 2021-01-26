interface FileActionOptions extends squared.FileActionOptions, FileActionAttribute, FileUniversalAttribute {
    assetMap?: ElementAssetMap;
    appendMap?: AppendAssetMap;
    indexMap?: Map<ElementIndex, HTMLElement>;
}

interface FileCopyingOptions extends squared.base.FileCopyingOptions, FileActionOptions {}

interface FileArchivingOptions extends squared.base.FileArchivingOptions, FileActionOptions {}

interface SaveAsOptions extends Partial<LocationUri>, AttributeAction, OutputAction, OutputModifiers {}

interface UriOptions {
    saveAs?: string;
    saveTo?: boolean;
    format?: string;
    mimeType?: string;
    preserveCrossOrigin?: boolean;
    fromConfig?: boolean;
}