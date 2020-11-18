interface FileActionOptions extends squared.FileActionOptions, FileActionAttribute, FileUniversalAttribute {
    assetMap?: Map<Element, AssetCommand>;
    transpileMap?: TranspileMap;
}

interface FileCopyingOptions extends squared.base.FileCopyingOptions, FileActionOptions {
    watch?: boolean;
}

interface FileArchivingOptions extends squared.base.FileArchivingOptions, FileActionOptions {}

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
    quality?: number;
}

interface SaveAsOptions extends Partial<LocationUri>, FileModifiers, OutputModifiers {
    format?: string;
}

interface UriOptions extends FileModifiers {
    element?: HTMLElement;
    saveAs?: string;
    saveTo?: boolean;
    format?: string;
    preserveCrossOrigin?: boolean;
    fromConfig?: boolean;
}