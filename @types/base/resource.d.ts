import { FontFaceData } from '../lib/squared';
import { ImageAsset, RawAsset } from './file';

export interface ResourceAssetMap {
    ids: Map<string, string[]>;
    images: Map<string, ImageAsset>;
    fonts: Map<string, FontFaceData[]>;
    rawData: Map<string, RawAsset>;
}

export interface ResourceStoredMap {
    strings: Map<string, string>;
    arrays: Map<string, string[]>;
    fonts: Map<string, ObjectMap<string>>;
    colors: Map<string, string>;
    images: Map<string, StringMap>;
}