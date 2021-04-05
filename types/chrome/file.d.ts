interface RequestData extends DocumentOutput, CssSelectorData {
    baseUrl?: string;
    templateMap?: TemplateMap;
}

interface DocumentOutput {
    productionRelease?: boolean | string;
    normalizeHtmlOutput?: boolean;
}

interface CssSelectorData {
    usedVariables?: string[];
    usedFonts?: string[];
    usedKeyframes?: string[];
    unusedStyles?: string[];
    unusedMediaQueries?: string[];
    unusedSupports?: string[];
}

interface ChromeAsset extends FileAsset, BundleAction, ElementAction, AttributeAction, StorageAction {
    format?: string;
    preserve?: boolean;
    exclude?: boolean;
    inlineContent?: string;
}

interface OutputModifiers {
    inline?: boolean;
    blob?: boolean;
    preserve?: boolean;
    download?: boolean;
    ignore?: boolean;
    exclude?: boolean;
}

interface DataSource {
    type: "text" | "attribute" | "display";
    value?: StringOfArray | ObjectMap<unknown>;
    viewEngine?: ViewEngine | string;
}

interface AssetCommand extends OutputCommand, ElementAction, OutputModifiers {
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