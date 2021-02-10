interface FileActionOptions extends squared.FileActionOptions, FileActionAttribute, FileUniversalAttribute {
    resourceId?: number;
    assetMap?: ElementAssetMap;
    appendMap?: AppendAssetMap;
    nodeMap?: Map<XmlNode, HTMLElement>;
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