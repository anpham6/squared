interface ChromeAsset extends FileAsset, BundleAction, AttributeAction {
    format?: string;
    preserve?: boolean;
    exclude?: boolean;
    rootDir?: string;
    outerHTML?: string;
    inlineContent?: string;
}

interface OutputModifiers extends ElementScope {
    inline?: boolean;
    blob?: boolean;
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

interface AttributeAction {
    attributes?: AttributeMap;
}

interface RequestData {
    baseUrl?: string;
    templateMap?: TemplateMap;
    unusedStyles?: string[];
}