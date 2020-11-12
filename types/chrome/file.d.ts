interface ChromeAsset extends FileAsset, OutputModifiers {
    rootDir?: string;
    moveTo?: string;
    format?: string;
    preserve?: boolean;
    exclude?: boolean;
    basePath?: string;
    bundleIndex?: number;
    inlineContent?: string;
    trailingContent?: FormattableContent[];
    textContent?: string;
    cloudStorage?: CloudService[];
    dataMap?: StandardMap;
}

interface FormattableContent {
    value: string;
    format?: string;
    preserve?: boolean;
}

interface FileModifiers {
    preserve?: boolean;
    inline?: boolean;
    base64?: boolean;
    compress?: CompressFormat[];
    ignore?: boolean;
    exclude?: boolean;
}

interface OutputModifiers {
    tasks?: string[];
    attributes?: AttributeValue[];
    cloudStorage?: CloudService[];
}

interface AttributeValue {
    name: string;
    value?: Null<string>;
}

interface CloudService {
    service: string;
    bucket: string;
    active?: boolean;
    filename?: string;
    localStorage?: boolean;
    [key: string]: Undef<unknown>;
}

interface AssetCommand extends Partial<LocationUri>, FileModifiers, OutputModifiers {
    selector?: string;
    type?: string;
    saveAs?: string;
    exportAs?: string;
    saveTo?: string;
    process?: string[];
    commands?: string[];
    template?: {
        module: string;
        identifier?: string;
        value?: string;
    };
}