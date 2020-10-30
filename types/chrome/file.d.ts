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

interface PathData {
    pathname?: string;
    filename?: string;
}

interface TransformCommand extends PathData {
    id: string;
    commands?: string;
    compress?: boolean;
    base64?: boolean;
}