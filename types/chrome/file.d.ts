interface RequestData {
    baseUrl?: string;
    templateMap?: TemplateMap;
    unusedStyles?: string[];
    productionRelease?: boolean | string;
}

interface StorageAction<T = unknown> {
    cloudStorage?: T[];
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
    ignore?: boolean;
    exclude?: boolean;
}

interface TemplateAction {
    type: "text" | "attribute";
    value?: string | ObjectMap<unknown>;
    viewEngine?: ViewEngine | string;
}

interface DataSource extends TemplateAction {}

interface AssetCommand extends SaveAsOptions, ElementAction, DocumentAction, StorageAction {
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