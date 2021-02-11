import type Application from './application';
import type File from './file';
import type Node from './node';

import { fromMimeType, randomUUID } from './lib/util';

const { extractURL, resolveURL } = squared.lib.css;
const { convertBase64, fromLastIndexOf, parseMimeType, startsWith } = squared.lib.util;

const REGEXP_DATAURI = new RegExp(`^${squared.lib.regex.STRING.DATAURI}$`);

export default class Resource<T extends Node> implements squared.base.Resource<T> {
    public static readonly KEY_NAME = 'squared.base.resource';
    public static readonly ASSETS: ResourceSessionAsset = [];

    public static hasMimeType(formats: MIMEOrAll, value: string) {
        return formats === '*' || formats.has(parseMimeType(value));
    }

    public static getExtension(value: string) {
        const match = /\.([^./]+)\s*$/.exec(value);
        return match ? match[1] : '';
    }

    public static parseDataURI(value: string, mimeType?: string, encoding?: string) {
        const match = REGEXP_DATAURI.exec(value);
        if (match && match[1]) {
            const leading = match[2];
            const trailing = match[3];
            const data = match[4];
            if (trailing) {
                mimeType = leading.trim();
                encoding = trailing.trim();
            }
            else if (leading) {
                if (leading.includes('/')) {
                    mimeType = leading;
                    if (!encoding) {
                        try {
                            if (btoa(atob(data)) === data) {
                                encoding = 'base64';
                            }
                        }
                        catch {
                        }
                    }
                }
                else {
                    encoding = leading;
                }
            }
            return { mimeType, encoding, data } as RawDataOptions;
        }
    }

    private _fileHandler: Null<File<T>> = null;

    constructor(public readonly application: Application<T>) {}

    public init(resourceId: number) {
        const data = Resource.ASSETS[resourceId] ||= {} as ResourceAssetMap;
        data.fonts = new Map();
        data.image = new Map();
        data.video = new Map();
        data.audio = new Map();
        data.rawData = new Map();
        data.other = [];
    }

    public clear() {
        Resource.ASSETS.length = 0;
    }

    public reset() {}

    public addAsset(resourceId: number, asset: RawAsset) {
        const assets = Resource.ASSETS[resourceId];
        if (assets && (asset.content || asset.uri || asset.base64)) {
            const { pathname, filename } = asset;
            const append = assets.other.find(item => item.pathname === pathname && item.filename === filename);
            if (append) {
                Object.assign(append, asset);
            }
            else {
                assets.other.push(asset);
            }
        }
    }

    public addImage(resourceId: number, element: HTMLImageElement) {
        const assets = Resource.ASSETS[resourceId];
        if (assets && element.complete) {
            const uri = element.src;
            const image = Resource.parseDataURI(uri, 'image/unknown', 'base64');
            if (image) {
                image.width = element.naturalWidth;
                image.height = element.naturalHeight;
                this.addRawData(resourceId, uri, image.data as string, image);
            }
            if (uri) {
                assets.image.set(uri, { width: element.naturalWidth, height: element.naturalHeight, uri });
            }
        }
    }

    public addAudio(resourceId: number, uri: string, options?: AudioVideoOptions) {
        Resource.ASSETS[resourceId]?.audio.set(uri, { uri, ...options });
    }

    public addVideo(resourceId: number, uri: string, options?: AudioVideoOptions) {
        Resource.ASSETS[resourceId]?.video.set(uri, { uri, ...options });
    }

    public addFont(resourceId: number, data: FontFaceData) {
        const assets = Resource.ASSETS[resourceId];
        if (assets) {
            const fontFamily = data.fontFamily.trim().toLowerCase();
            data.fontFamily = fontFamily;
            const items = assets.fonts.get(fontFamily);
            if (items) {
                items.push(data);
            }
            else {
                assets.fonts.set(fontFamily, [data]);
            }
        }
    }

    public addRawData(resourceId: number, uri: string, content: Undef<string>, options?: RawDataOptions) {
        const assets = Resource.ASSETS[resourceId];
        if (assets) {
            let filename: Undef<string>,
                mimeType: Undef<string>,
                encoding: Undef<string>,
                data: Undef<string | ArrayBuffer>,
                width: Undef<number>,
                height: Undef<number>;
            if (options) {
                ({ filename, mimeType, encoding, data, width, height } = options);
                mimeType &&= mimeType.toLowerCase();
                encoding &&= encoding.toLowerCase();
            }
            content &&= content.trim();
            let base64: Undef<string>,
                buffer: Undef<ArrayBuffer>;
            if (encoding === 'base64') {
                if (content) {
                    if (mimeType === 'image/svg+xml') {
                        content = window.atob(content);
                    }
                    else {
                        base64 = content;
                        content = undefined;
                    }
                }
                else if (data) {
                    base64 = data instanceof ArrayBuffer ? convertBase64(data) : data.trim();
                }
            }
            else {
                if (data) {
                    if (data instanceof ArrayBuffer) {
                        buffer = data;
                    }
                    else if (!content) {
                        content = data;
                    }
                }
                content &&= content.replace(/\\(["'])/g, (...match: string[]) => match[1]);
            }
            if (!content && !base64 && !buffer) {
                return null;
            }
            const url = uri.split('?')[0];
            if (!filename) {
                const ext = '.' + (mimeType && fromMimeType(mimeType) || 'unknown');
                filename = url.endsWith(ext) ? fromLastIndexOf(url, '/') : this.randomUUID + ext;
            }
            const result = {
                pathname: startsWith(url, location.origin) ? url.substring(location.origin.length + 1, url.lastIndexOf('/')) : '',
                filename,
                content,
                base64,
                mimeType,
                buffer,
                width,
                height
            } as RawAsset;
            assets.rawData.set(uri, result);
            return result;
        }
        return null;
    }

    public getImage(resourceId: number, uri: string) {
        return Resource.ASSETS[resourceId]?.image.get(uri);
    }

    public getVideo(resourceId: number, uri: string) {
        return Resource.ASSETS[resourceId]?.video.get(uri);
    }

    public getAudio(resourceId: number, uri: string) {
        return Resource.ASSETS[resourceId]?.audio.get(uri);
    }

    public getFonts(resourceId: number, fontFamily: string, fontStyle = 'normal', fontWeight?: string) {
        const font = Resource.ASSETS[resourceId]?.fonts.get(fontFamily.trim().toLowerCase());
        if (font) {
            const mimeType = this.mimeTypeMap.font;
            return font.filter(item => startsWith(fontStyle, item.fontStyle) && (!fontWeight || item.fontWeight === +fontWeight) && (mimeType === '*' || mimeType.has(item.mimeType)));
        }
        return [];
    }

    public getRawData(resourceId: number, uri: string) {
        if (startsWith(uri, 'url(')) {
            uri = extractURL(uri)!;
            if (!uri) {
                return;
            }
        }
        return Resource.ASSETS[resourceId]?.rawData.get(uri);
    }

    public addImageData(resourceId: number, uri: string, width = 0, height = 0) {
        if (uri && (width && height || !this.getImage(resourceId, uri))) {
            Resource.ASSETS[resourceId]?.image.set(uri, { width, height, uri });
        }
    }

    public fromImageUrl(resourceId: number, value: string) {
        const data = this.getRawData(resourceId, value);
        if (data) {
            return [data as ImageAsset];
        }
        const result: ImageAsset[] = [];
        const pattern = /url\([^)]+\)/g;
        let match: Null<RegExpExecArray>;
        while (match = pattern.exec(value)) {
            const url = resolveURL(match[0]);
            if (url) {
                const image = this.getImage(resourceId, url);
                if (image) {
                    result.push(image);
                }
            }
        }
        return result;
    }

    set fileHandler(value) {
        if (value) {
            value.resource = this;
        }
        this._fileHandler = value;
    }
    get fileHandler() {
        return this._fileHandler;
    }

    get controllerSettings() {
        return this.application.controllerHandler.localSettings;
    }

    get userSettings() {
        return this.application.userSettings as UserResourceSettings;
    }

    get mimeTypeMap() {
        return this.controllerSettings.mimeType;
    }

    get randomUUID() {
        return randomUUID();
    }

    get mapOfAssets() {
        return Resource.ASSETS;
    }
}