interface RequestData {
    baseUrl?: string;
    templateMap?: TemplateMap;
    unusedStyles?: string[];
    productionRelease?: boolean | string;
}

interface ChromeAsset extends FileAsset, BundleAction, ElementAction, AttributeAction {
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

interface UriDataSource extends TemplateAction {
    format: string;
    uri: string;
    query?: string;
}

interface CloudDataSource extends TemplateAction, PlainObject {}

interface AssetCommand extends SaveAsOptions, ElementAction, DocumentAction {
    selector?: string;
    type?: string;
    saveAs?: string;
    exportAs?: string;
    saveTo?: string;
    textContent?: string;
    dataUri?: UriDataSource;
    cloudDatabase?: CloudDataSource;
    template?: {
        module: string;
        identifier?: string;
        value?: string;
    };
}