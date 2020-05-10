export interface CompressOptions {
    level?: number;
    mimeTypes: MIMEOrAll;
    largerThan: number;
    smallerThan: number;
    whenSmaller: boolean;
}

export interface ConvertOptions extends CompressOptions {
    mimeTypes: string[];
    replaceWith: boolean;
}