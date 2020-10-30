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

interface OutputAction {
    preserve?: boolean;
    compress?: boolean;
    base64?: boolean;
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

interface FileCommand extends PathData, OutputAction {
    commands?: string[];
}

interface TransformCommand extends FileCommand {
    id: string;
}

interface AssetCommand extends FileCommand, StandardMap {
    selector?: string;
    type?: string;
    saveTo?: string;
    process?: string[];
    commands?: string[];
    ignore?: boolean;
    template?: {
        module?: string;
        identifier?: string;
        value?: string;
    };
}