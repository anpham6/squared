interface ChromeAsset extends RequestAsset {
    rootDir?: string;
    moveTo?: string;
    format?: string;
    requestMain?: boolean;
    bundleIndex?: number;
    preserve?: boolean;
    inlineContent?: string;
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

interface FileCommand extends Partial<LocationUri>, OutputAction {
    commands?: string[];
}

interface TransformCommand extends FileCommand {
    id: string;
}

interface AssetCommand extends FileCommand, StandardMap {
    selector?: string;
    type?: string;
    saveAs?: string;
    exportAs?: string;
    saveTo?: string;
    process?: string[];
    inline?: boolean;
    ignore?: boolean;
    template?: {
        module?: string;
        identifier?: string;
        value?: string;
    };
}