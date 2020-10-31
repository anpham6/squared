interface ChromeAsset extends RequestAsset {
    rootDir?: string;
    moveTo?: string;
    format?: string;
    preserve?: boolean;
    exclude?: boolean;
    requestMain?: boolean;
    bundleIndex?: number;
    inlineContent?: string;
    trailingContent?: FormattableContent[];
    outerHTML?: string;
}

interface FormattableContent {
    value: string;
    format?: string;
    preserve?: boolean;
}

interface FileModifiers {
    preserve?: boolean;
    inline?: boolean;
    compress?: boolean;
    base64?: boolean;
    ignore?: boolean;
    exclude?: boolean;
}

interface FileCommand extends Partial<LocationUri>, FileModifiers {
    commands?: string[];
}

interface TransformCommand extends FileCommand {
    id: string;
}

interface AssetCommand extends FileCommand, FileModifiers {
    selector?: string;
    type?: string;
    saveAs?: string;
    exportAs?: string;
    saveTo?: string;
    process?: string[];
    template?: {
        module?: string;
        identifier?: string;
        value?: string;
    };
}