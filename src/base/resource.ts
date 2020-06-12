const { STRING } = squared.lib.regex;
const { extractURL } = squared.lib.css;
const { fromLastIndexOf, fromMimeType, hasMimeType, randomUUID } = squared.lib.util;

const REGEXP_DATAURI = new RegExp(`^${STRING.DATAURI}$`);

export default abstract class Resource<T extends squared.base.Node> implements squared.base.Resource<T> {
    public static readonly KEY_NAME = 'squared.resource';

    public static readonly ASSETS: ResourceAssetMap = {
        ids: new Map(),
        fonts: new Map(),
        image: new Map(),
        video: new Map(),
        audio: new Map(),
        rawData: new Map()
    };

    public static canCompressImage = (filename: string, mimeType?: string) => /\.(png|jpg|jpeg)$/i.test(filename) || mimeType === 'image/png' || mimeType === 'image/jpeg';
    public static getExtension = (value: string) => /\.(\w+)\s*$/.exec(value)?.[1] || '';

    private _fileHandler: Undef<squared.base.File<T>>;

    public readonly abstract application: squared.base.Application<T>;
    public readonly abstract cache: squared.base.NodeList<T>;
    public readonly abstract fileSeparator: string;

    public abstract get userSettings(): UserSettings;

    public reset() {
        const ASSETS = Resource.ASSETS;
        for (const name in ASSETS) {
            ASSETS[name].clear();
        }
        this._fileHandler?.reset();
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
            if (uri !== '') {
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
        let filename: Undef<string>, encoding: Undef<string>, data: Undef<any>, width: Undef<number>, height: Undef<number>;
        if (options) {
            ({ filename, encoding, data, width, height } = options);
            if (encoding) {
                encoding = encoding.toLowerCase();
            }
        }
        let base64: Undef<string>;
        mimeType = mimeType.toLowerCase();
        if (content) {
            if (encoding === 'base64') {
                if (mimeType === 'image/svg+xml') {
                    content = window.atob(content);
                }
                else {
                    base64 = content;
                }
            }
            else {
                content = content.replace(/\\(["'])/g, (match, ...capture) => capture[0]);
            }
        }
        else if (!data) {
            return '';
        }
        const imageMimeType = this.mimeTypeMap.image;
        if (imageMimeType === '*' || imageMimeType.includes(mimeType)) {
            if (!filename) {
                const ext = '.' + fromMimeType(mimeType);
                filename = uri.endsWith(ext) ? fromLastIndexOf(uri, '/', '\\') : this.randomUUID + ext;
            }
            Resource.ASSETS.rawData.set(uri, {
                pathname: uri.startsWith(location.origin) ? uri.substring(location.origin.length + 1, uri.lastIndexOf('/')) : '',
                filename,
                content,
                base64,
                mimeType,
                data,
                width,
                height
            });
            return filename;
        }
        return '';
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
            return font.find(item => fontStyle.startsWith(item.fontStyle) && (!fontWeight || item.fontWeight === parseInt(fontWeight)) && (hasMimeType(mimeType, item.srcFormat) || item.srcUrl && hasMimeType(mimeType, item.srcUrl)));
        }
        return undefined;
    }

    public getRawData(uri: string) {
        if (uri.startsWith('url(')) {
            const url = extractURL(uri);
            if (!url) {
                return undefined;
            }
            uri = url;
        }
        return Resource.ASSETS.rawData.get(uri);
    }

    set fileHandler(value: Undef<squared.base.File<T>>) {
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

    get mimeTypeMap() {
        return this.controllerSettings.mimeType;
    }

    get randomUUID() {
        return randomUUID();
    }
}