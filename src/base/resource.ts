import type Application from './application';
import type File from './file';
import type Node from './node';

import { fromMimeType, randomUUID } from './lib/util';

const { STRING } = squared.lib.regex;

const { extractURL, resolveURL } = squared.lib.css;
const { convertBase64, fromLastIndexOf, parseMimeType, startsWith } = squared.lib.util;

const REGEXP_DATAURI = new RegExp(`^${STRING.DATAURI}$`);

export default class Resource<T extends Node> implements squared.base.Resource<T> {
    public static readonly KEY_NAME = 'squared.base.resource';
    public static readonly ASSETS: ResourceAssetMap = {
        fonts: new Map(),
        image: new Map(),
        video: new Map(),
        audio: new Map(),
        rawData: new Map()
    };

    public static hasMimeType(formats: MIMEOrAll, value: string) {
        return formats === '*' || formats.has(parseMimeType(value));
    }

    public static getExtension(value: string) {
        const match = /\.([^./]+)\s*$/.exec(value);
        return match ? match[1] : '';
    }

    public static resetDataMap(data: ResourceMap) {
        for (const name in data) {
            const map = data[name]!;
            if (map.size) {
                map.clear();
            }
        }
    }

    private _fileHandler: Null<File<T>> = null;

    constructor(public readonly application: Application<T>) {}

    public reset() {
        Resource.resetDataMap(Resource.ASSETS);
        this.fileHandler?.reset();
    }

    public addImage(element: HTMLImageElement) {
        if (element.complete) {
            const uri = element.src;
            if (startsWith(uri, 'data:image/')) {
                const match = REGEXP_DATAURI.exec(uri);
                if (match) {
                    const [mimeType, encoding] = match[1].split(/\s*;\s*/);
                    this.addRawData(uri, match[2], { encoding: encoding || 'base64', mimeType, width: element.naturalWidth, height: element.naturalHeight });
                }
            }
            if (uri) {
                Resource.ASSETS.image.set(uri, { width: element.naturalWidth, height: element.naturalHeight, uri });
            }
        }
    }

    public addAudio(uri: string, options?: AudioVideoOptions) {
        Resource.ASSETS.audio.set(uri, { uri, ...options });
    }

    public addVideo(uri: string, options?: AudioVideoOptions) {
        Resource.ASSETS.video.set(uri, { uri, ...options });
    }

    public addFont(data: FontFaceData) {
        const fonts = Resource.ASSETS.fonts;
        const fontFamily = data.fontFamily.trim().toLowerCase();
        data.fontFamily = fontFamily;
        const items = fonts.get(fontFamily);
        if (items) {
            items.push(data);
        }
        else {
            fonts.set(fontFamily, [data]);
        }
    }

    public addRawData(uri: string, content: Undef<string>, options?: RawDataOptions) {
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
                }
            }
            else if (data) {
                base64 = data instanceof ArrayBuffer ? convertBase64(data) : data;
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
        Resource.ASSETS.rawData.set(uri, result);
        return result;
    }

    public getImage(uri: string) {
        return Resource.ASSETS.image.get(uri);
    }

    public getVideo(uri: string) {
        return Resource.ASSETS.video.get(uri);
    }

    public getAudio(uri: string) {
        return Resource.ASSETS.audio.get(uri);
    }

    public getFont(fontFamily: string, fontStyle = 'normal', fontWeight?: string) {
        const font = Resource.ASSETS.fonts.get(fontFamily.trim().toLowerCase());
        if (font) {
            const mimeType = this.mimeTypeMap.font;
            return font.find(item => startsWith(fontStyle, item.fontStyle) && (!fontWeight || item.fontWeight === +fontWeight) && (Resource.hasMimeType(mimeType, item.srcFormat) || item.srcUrl && Resource.hasMimeType(mimeType, item.srcUrl)));
        }
    }

    public getRawData(uri: string) {
        if (startsWith(uri, 'url(')) {
            uri = extractURL(uri)!;
            if (!uri) {
                return;
            }
        }
        return Resource.ASSETS.rawData.get(uri);
    }

    public addImageData(uri: string, width = 0, height = 0) {
        if (uri && (width && height || !this.getImage(uri))) {
            Resource.ASSETS.image.set(uri, { width, height, uri });
        }
    }

    public fromImageUrl(value: string) {
        const data = this.getRawData(value);
        if (data) {
            return [data as ImageAsset];
        }
        const result: ImageAsset[] = [];
        const pattern = /url\([^)]+\)/g;
        let match: Null<RegExpExecArray>;
        while (match = pattern.exec(value)) {
            const url = resolveURL(match[0]);
            if (url) {
                const image = this.getImage(url);
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