interface ChromeAsset extends FileAsset, BundleAction {
    format?: string;
    preserve?: boolean;
    exclude?: boolean;
    rootDir?: string;
    outerHTML?: string;
    inlineContent?: string;
    attributes?: ObjectMap<UndefNull<string>>;
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

interface RequestData {
    baseUrl?: string;
    templateMap?: TemplateMap;
    unusedStyles?: string[];
}