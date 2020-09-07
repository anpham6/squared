interface Asset {
    uri?: string;
    mimeType?: string;
}

interface FileAsset extends Asset {
    pathname: string;
    filename: string;
    content?: string;
    compress?: CompressFormat[];
    exclusions?: Exclusions;
}

interface ImageAsset extends Asset, Dimension {}

interface LayoutAsset extends FileAsset {
    index?: number;
}

interface RequestAsset extends FileAsset {
    bytes?: number[];
    base64?: string;
    dataMap?: StandardMap;
}

interface RawAsset extends RequestAsset, Partial<ImageAsset> {}

interface Exclusions {
    pathname?: string[];
    filename?: string[];
    extension?: string[];
    pattern?: string[];
}

interface CompressFormat {
    format: string;
    level?: number;
    condition?: string;
}

interface ResultOfFileAction {
    success: boolean;
    zipname?: string;
    bytes?: number;
    files?: string[];
    application?: string;
    system?: string;
}