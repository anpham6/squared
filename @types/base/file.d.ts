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
    exclusions?: FileExclude;
}

export interface ImageAsset extends Omit<Asset, "index"> {
    width: number;
    height: number;
}

export interface ExternalAsset extends Omit<FileAsset, "index"> {
    base64?: string;
}

export interface RawAsset extends ExternalAsset, Partial<ImageAsset> {}

export interface RequestAsset extends ExternalAsset {
    base64?: string;
    rootDir?: string;
    moveTo?: string;
}

export interface FileExclude {
    pathname?: string[];
    filename?: string[];
    extension?: string[];
    pattern?: string[];
}

export interface CompressionFormat {
    format: string;
    level?: number;
}