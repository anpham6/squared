interface Asset {
    uri?: string;
    mimeType?: string;
    tasks?: string[];
}

interface LocationUri {
    pathname: string;
    filename: string;
}

interface TextAsset extends Asset, LocationUri {
    content?: string;
}

interface ImageAsset extends Asset, Dimension {}

interface LayoutAsset extends TextAsset {
    index?: number;
}

interface FileAsset extends TextAsset {
    base64?: string;
    commands?: string[];
    compress?: CompressFormat[];
}

interface RawAsset extends FileAsset, Partial<ImageAsset> {
    buffer?: ArrayBuffer;
}

interface Exclusions {
    pathname?: string[];
    filename?: string[];
    extension?: string[];
    pattern?: (string | RegExp)[];
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