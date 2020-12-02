interface ChromeAsset extends FileAsset {
    rootDir?: string;
    moveTo?: string;
    format?: string;
    preserve?: boolean;
    exclude?: boolean;
    baseUrl?: string;
    bundleId?: number;
    bundleIndex?: number;
    bundleRoot?: string;
    trailingContent?: FormattableContent[];
    inlineContent?: string;
    outerHTML?: string;
    attributes?: ObjectMap<UndefNull<string>>;
}

interface FormattableContent {
    value: string;
    preserve?: boolean;
}

interface OutputModifiers extends ElementScope {
    process?: string[];
    inline?: boolean;
    preserve?: boolean;
    ignore?: boolean;
    exclude?: boolean;
}

interface AssetCommand extends SaveAsOptions {
    selector?: string;
    type?: string;
    saveAs?: string;
    exportAs?: string;
    saveTo?: string;
    cloudDatabase?: CloudDatabase;
    template?: {
        module: string;
        identifier?: string;
        value?: string;
    };
}