interface ResourceAssetMap {
    fonts: Map<string, FontFaceData[]>;
    image: Map<string, ImageAsset>;
    video: Map<string, Asset>;
    audio: Map<string, Asset>;
    rawData: Map<string, RawAsset>;
}

interface ResourceStoredMap {
    ids: Map<string, string[]>;
    strings: Map<string, string>;
    arrays: Map<string, string[]>;
    fonts: Map<string, ObjectMap<string>>;
    colors: Map<string, string>;
    images: Map<string, StringMap>;
}

interface RawDataOptions {
    data?: any;
    width?: number;
    height?: number;
    encoding?: string;
    filename?: string;
}