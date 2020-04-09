export interface Asset {
    uri?: string;
    index?: number;
    mimeType?: string;
}

export interface FileAsset extends Asset {
    pathname: string;
    filename: string;
    content?: string;
    compress?: CompressionFormat[];
    exclusions?: FileAssetExclude;
}

export interface FileAssetExclude {
    pathname?: string[];
    filename?: string[];
    extension?: string[];
    pattern?: string[];
}

export interface ImageAsset extends Asset {
    width: number;
    height: number;
}

export interface RawAsset extends FileAsset, Partial<ImageAsset> {
    base64?: string;
}

export interface CompressionFormat {
    format: string;
    level?: number;
}