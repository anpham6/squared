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

interface FormattableContent {
    value: string;
    format?: string;
    preserve?: boolean;
}