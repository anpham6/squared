interface ChromeAsset extends FileAsset, OutputModifiers {
    rootDir?: string;
    moveTo?: string;
    format?: string;
    preserve?: boolean;
    exclude?: boolean;
    basePath?: string;
    bundleId?: number;
    bundleIndex?: number;
    bundleRoot?: string;
    inlineContent?: string;
    trailingContent?: FormattableContent[];
    textContent?: string;
    dataMap?: StandardMap;
}

interface FormattableContent {
    value: string;
    format?: string;
    preserve?: boolean;
}

interface WatchInterval {
    interval?: number;
    expires?: string;
}

interface FileModifiers {
    preserve?: boolean;
    inline?: boolean;
    base64?: boolean;
    compress?: CompressFormat[];
}

interface OutputModifiers {
    tasks?: string[];
    watch?: boolean | WatchInterval;
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
    commands?: string[];
    template?: {
        module: string;
        identifier?: string;
        value?: string;
    };
}