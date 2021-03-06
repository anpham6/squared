interface RequestData extends DocumentOutput, ICssRuleData {
    baseUrl?: string;
    templateMap?: TemplateMap;
}

interface DocumentOutput {
    productionRelease?: boolean | string;
    normalizeHtmlOutput?: boolean;
}

interface ICssRuleData {
    usedVariables?: string[];
    usedFontFace?: string[];
    usedKeyframes?: string[];
    unusedStyles?: string[];
    unusedMedia?: string[];
    unusedSupports?: string[];
}

interface ChromeAsset extends FileAsset, BundleAction, ElementAction, AttributeAction, StorageAction {
    preserve?: boolean;
    exclude?: boolean;
    inlineContent?: string;
}

interface OutputModifiers {
    inline?: boolean;
    blob?: boolean;
    preserve?: boolean;
    download?: boolean;
    extract?: boolean;
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