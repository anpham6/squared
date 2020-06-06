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