interface FileActionOptions extends squared.FileActionOptions, FileActionAttribute, FileUniversalAttribute {
    baseUrl?: string;
    assetMap?: Map<Element, AssetCommand>;
    templateMap?: TemplateMap;
    database?: CloudDatabase[];
}

interface FileCopyingOptions extends squared.base.FileCopyingOptions, FileActionOptions {}

interface FileArchivingOptions extends squared.base.FileArchivingOptions, FileActionOptions {}

interface SaveAsOptions extends Partial<LocationUri>, OutputAction, OutputModifiers {
    attributes?: ObjectMap<Null<string>>;
}

interface UriOptions {
    element?: HTMLElement;
    saveAs?: string;
    saveTo?: boolean;
    format?: string;
    inline?: boolean;
    preserveCrossOrigin?: boolean;
    fromConfig?: boolean;
}