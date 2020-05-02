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
    exclusions?: Exclusions;
}

export interface ImageAsset extends Omit<Asset, "index"> {
    width: number;
    height: number;
}

export interface RequestAsset extends Omit<FileAsset, "index"> {
    base64?: string;
}

export interface RawAsset extends RequestAsset, Partial<ImageAsset> {}

export interface Exclusions {
    pathname?: string[];
    filename?: string[];
    extension?: string[];
    pattern?: string[];
}

export interface CompressionFormat {
    format: string;
    level?: number;
}

export interface ResultOfFileAction {
    success: boolean;
    zipname?: string;
    bytes?: number;
    files?: string[];
    application?: string;
    system?: string;
}