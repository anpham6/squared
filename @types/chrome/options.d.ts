interface ChromeFileActionOptions extends squared.FileActionOptions, FileActionAttribute, FileUniversalAttribute {}

interface ChromeFileCopyingOptions extends squared.base.FileCopyingOptions, ChromeFileActionOptions {}

interface ChromeFileArchivingOptions extends squared.base.FileArchivingOptions, ChromeFileActionOptions {}

interface CompressOptions {
    level?: number;
    mimeTypes: MIMEOrAll;
    largerThan: number;
    smallerThan: number;
    whenSmaller: boolean;
}

interface ConvertOptions extends CompressOptions {
    mimeTypes: string[];
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