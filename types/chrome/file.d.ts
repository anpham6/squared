interface ChromeAsset extends FileAsset, OutputModifiers {
    rootDir?: string;
    moveTo?: string;
    format?: string;
    preserve?: boolean;
    baseUrl?: string;
    bundleId?: number;
    bundleIndex?: number;
    bundleRoot?: string;
    textContent?: string;
    trailingContent?: FormattableContent[];
    inlineContent?: string;
    exclude?: boolean;
}

interface FormattableContent {
    value: string;
    preserve?: boolean;
}

interface FileModifiers {
    preserve?: boolean;
    inline?: boolean;
    base64?: boolean;
    compress?: CompressFormat[];
}

interface OutputModifiers extends ElementScope {
    commands?: string[];
    attributes?: AttributeValue[];
    cloudStorage?: CloudService[];
    ignore?: boolean;
    exclude?: boolean;
}

interface AttributeValue {
    name: string;
    value?: Null<string>;
}

interface AssetCommand extends Partial<LocationUri>, FileModifiers, OutputModifiers {
    selector?: string;
    type?: string;
    saveAs?: string;
    exportAs?: string;
    saveTo?: string;
    process?: string[];
    template?: {
        module: string;
        identifier?: string;
        value?: string;
    };
}