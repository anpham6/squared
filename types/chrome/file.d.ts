interface RequestData {
    baseUrl?: string;
    templateMap?: TemplateMap;
    unusedStyles?: string[];
    productionRelease?: boolean | string;
}

interface ChromeAsset extends FileAsset, BundleAction, ElementAction, AttributeAction, StorageAction {
    format?: string;
    preserve?: boolean;
    exclude?: boolean;
    inlineContent?: string;
}

interface OutputModifiers extends ElementScope {
    inline?: boolean;
    blob?: boolean;
    preserve?: boolean;
    download?: boolean;
    ignore?: boolean;
    exclude?: boolean;
}

interface DataSource {
    type: "text" | "attribute";
    value?: string | ObjectMap<unknown>;
    viewEngine?: ViewEngine | string;
}

interface OutputCommand extends Partial<LocationUri>, OutputAction, AttributeAction, StorageAction {}

interface AssetCommand extends OutputCommand, ElementAction, DocumentAction, OutputModifiers {
    selector?: string;
    type?: string;
    saveAs?: string;
    exportAs?: string;
    saveTo?: string;
    textContent?: string;
    dataSource?: DataSource;
    cloudDatabase?: DataSource;
    template?: {
        module: string;
        identifier?: string;
        value?: string;
    };
}