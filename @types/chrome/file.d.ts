interface ChromeAsset extends RequestAsset {
    rootDir?: string;
    moveTo?: string;
    format?: string;
    requestMain?: boolean;
    bundleIndex?: number;
    preserve?: boolean;
    trailingContent?: FormattableContent[];
    outerHTML?: string;
}

interface FileActionAttribute {
    name?: string;
    rel?: string;
    saveAs?: { html?: SaveAsOptions; script?: SaveAsOptions; link?: SaveAsOptions; base64?: SaveAsOptions };
    preserveCrossOrigin?: boolean;
}

interface SaveAsOptions {
    pathname?: string;
    filename?: string;
    format?: string;
    preserve?: boolean;
}

interface FormattableContent {
    value: string;
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