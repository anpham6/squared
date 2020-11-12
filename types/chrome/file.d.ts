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
}

interface FileCommand extends Partial<LocationUri>, FileModifiers, OutputModifiers {
    commands?: string[];
}

interface TransformCommand extends FileCommand {
    id: string;
}

interface AttributeValue {
    name: string;
    value?: Null<string>;
}

interface AssetCommand extends FileCommand {
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