interface IFileActionOptions extends squared.FileActionOptions, FileActionAttribute, FileUniversalAttribute {
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

interface SaveAsOptions {
    pathname?: string;
    filename?: string;
    format?: string;
    preserve?: boolean;
}

interface UriOptions {
    saveAs?: string;
    saveTo?: boolean;
    format?: string;
    preserve?: boolean;
    preserveCrossOrigin?: boolean;
}