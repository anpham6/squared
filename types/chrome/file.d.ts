interface ChromeAsset extends FileAsset, BundleAction, ElementAction, AttributeAction {
    format?: string;
    preserve?: boolean;
    exclude?: boolean;
    rootDir?: string;
    inlineContent?: string;
}

interface OutputModifiers extends ElementScope {
    inline?: boolean;
    blob?: boolean;
    preserve?: boolean;
    ignore?: boolean;
    exclude?: boolean;
}

interface AssetCommand extends SaveAsOptions, ElementAction {
    selector?: string;
    type?: string;
    saveAs?: string;
    exportAs?: string;
    saveTo?: string;
    cloudDatabase?: unknown;
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