import type Application from './application';
import type File from './file';
import type Node from './node';

import { randomUUID } from './lib/util';

const { STRING } = squared.lib.regex;

const { extractURL } = squared.lib.css;
const { convertBase64, fromLastIndexOf, fromMimeType, parseMimeType } = squared.lib.util;

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

    public static canCompressImage(filename: string, mimeType?: string) {
        return /\.(png|jpg|jpeg)$/i.test(filename) || mimeType === 'image/png' || mimeType === 'image/jpeg';
    }

    public static getExtension(value: string) {
        const match = /\.(\w+)\s*$/.exec(value);
        return match ? match[1] : '';
    }

    public static resetDataMap(data: ResourceMap) {
        for (const name in data) {
            const map = data[name];
            if (map.size) {
                map.clear();
            }
        }
    }

    private _fileHandler: Null<File<T>> = null;

    constructor(public readonly application: Application<T>) {}

    public reset() {
        Resource.resetDataMap(Resource.ASSETS);
        if (this._fileHandler) {
            this._fileHandler.reset();
        }
    }

    public addImage(element: HTMLImageElement) {
        if (element.complete) {
            const uri = element.src;
            if (uri.startsWith('data:image/')) {
                const match = REGEXP_DATAURI.exec(uri);
                if (match) {
                    const mimeType = match[1].trim().split(/\s*;\s*/);
                    this.addRawData(uri, mimeType[0], match[2], { encoding: mimeType[1] || 'base64', width: element.naturalWidth, height: element.naturalHeight });
                }
            }
            if (uri) {
                Resource.ASSETS.image.set(uri, { width: element.naturalWidth, height: element.naturalHeight, uri });
            }
        }
    }

    public addVideo(uri: string, mimeType?: string) {
        Resource.ASSETS.video.set(uri, { uri, mimeType });
    }

    public addAudio(uri: string, mimeType?: string) {
        Resource.ASSETS.audio.set(uri, { uri, mimeType });
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

    public addRawData(uri: string, mimeType: string, content: Undef<string>, options?: RawDataOptions) {
        let filename: Undef<string>,
            encoding: Undef<string>,
            data: Undef<string | ArrayBuffer>,
            width: Undef<number>,
            height: Undef<number>;
        if (options) {
            ({ filename, encoding, data, width, height } = options);
            mimeType ||= options.mimeType || '';
            encoding &&= encoding.toLowerCase();
        }
        mimeType = mimeType.toLowerCase();
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
            content &&= content.replace(/\\(["'])/g, (match, ...capture: string[]) => capture[0]);
        }
        if (!content && !base64 && !buffer) {
            return '';
        }
        if (!filename) {
            const ext = '.' + (fromMimeType(mimeType) || 'unknown');
            filename = uri.endsWith(ext) ? fromLastIndexOf(uri, '/', '\\') : this.randomUUID + ext;
        }
        Resource.ASSETS.rawData.set(uri, {
            pathname: uri.startsWith(location.origin) ? uri.substring(location.origin.length + 1, uri.lastIndexOf('/')) : '',
            filename,
            content,
            base64,
            mimeType,
            buffer,
            width,
            height
        });
        return filename;
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
            return font.find(item => fontStyle.startsWith(item.fontStyle) && (!fontWeight || item.fontWeight === parseInt(fontWeight)) && (Resource.hasMimeType(mimeType, item.srcFormat) || item.srcUrl && Resource.hasMimeType(mimeType, item.srcUrl)));
        }
    }

    public getRawData(uri: string) {
        if (uri.startsWith('url(')) {
            const url = extractURL(uri);
            if (!url) {
                return;
            }
            uri = url;
        }
        return Resource.ASSETS.rawData.get(uri);
    }

    public addImageData(uri: string, width = 0, height = 0) {
        if (uri !== '' && (width && height || !this.getImage(uri))) {
            Resource.ASSETS.image.set(uri, { width, height, uri });
        }
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