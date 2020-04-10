import { FontFaceData } from '../lib/squared';
import { Asset, ImageAsset, RawAsset } from './file';

export interface ResourceAssetMap {
    ids: Map<string, string[]>;
    fonts: Map<string, FontFaceData[]>;
    image: Map<string, ImageAsset>;
    video: Map<string, Asset>;
    audio: Map<string, Asset>;
    rawData: Map<string, RawAsset>;
}

export interface ResourceStoredMap {
    strings: Map<string, string>;
    arrays: Map<string, string[]>;
    fonts: Map<string, ObjectMap<string>>;
    colors: Map<string, string>;
    images: Map<string, StringMap>;
}