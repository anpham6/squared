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
    cloudStorage?: CloudService[];
}

interface RawAsset extends FileAsset, Partial<ImageAsset> {
    buffer?: ArrayBuffer;
}

interface CloudService {
    service: string;
    active?: boolean;
    localStorage?: boolean;
    uploadAll?: boolean;
    filename?: string;
    apiEndpoint?: string;
    settings?: string;
    objects?: CloudObject[];
    [key: string]: Undef<unknown>;
}

interface FileResponseData {
    success: boolean;
    zipname?: string;
    bytes?: number;
    files?: string[];
    error?: {
        message: string;
        hint?: string;
    };
}

interface CloudObject extends Partial<LocationUri> {
    keyName: string;
}

interface Exclusions {
    glob?: string[];
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