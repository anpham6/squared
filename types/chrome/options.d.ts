interface IFileActionOptions extends squared.FileActionOptions, FileActionAttribute, FileUniversalAttribute {
    assetMap?: Map<Element, AssetCommand>;
    transpileMap?: TranspileMap;
}

interface IFileCopyingOptions extends squared.base.FileCopyingOptions, IFileActionOptions {}

interface IFileArchivingOptions extends squared.base.FileArchivingOptions, IFileActionOptions {}

interface CompressOptions {
    mimeTypes: MIMEOrAll;
    minSize: number;
    maxSize: number;
    whenSmaller: boolean;
    level?: number;
}

interface ConvertOptions extends CompressOptions {
    mimeTypes: Set<string>;
    replaceWith: boolean;
    opacity?: number;
}

interface SaveAsOptions extends Partial<LocationUri>, FileModifiers {
    format?: string;
    tasks?: string[];
}

interface UriOptions extends FileModifiers {
    element?: HTMLElement;
    saveAs?: string;
    saveTo?: boolean;
    preserveCrossOrigin?: boolean;
    format?: string;
    tasks?: string[];
    fromConfig?: boolean;
}