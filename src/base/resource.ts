import { UserSettings } from '../../@types/base/application';
import { ResourceAssetMap } from '../../@types/base/resource';

import { FontFaceData } from '../../@types/lib/data';

const $lib = squared.lib;

const { STRING, XML } = $lib.regex;
const { extractURL } = $lib.css;
const { fromLastIndexOf, fromMimeType, hasMimeType, randomUUID } = $lib.util;

const REGEX_DATAURI = new RegExp(`^${STRING.DATAURI}$`);

export default abstract class Resource<T extends squared.base.Node> implements squared.base.Resource<T> {
    public static KEY_NAME = 'squared.resource';
    public static ASSETS: ResourceAssetMap = {
        ids: new Map(),
        fonts: new Map(),
        image: new Map(),
        video: new Map(),
        audio: new Map(),
        rawData: new Map()
    };

    public static canCompressImage = (filename: string) => /\.(png|jpg|jpeg)$/i.test(filename);

    public fileHandler?: squared.base.File<T>;
    public readonly abstract application: squared.base.Application<T>;
    public readonly abstract cache: squared.base.NodeList<T>;
    public readonly abstract fileSeparator: string;

    public abstract get userSettings(): UserSettings;

    public reset() {
        const ASSETS = Resource.ASSETS;
        for (const name in ASSETS) {
            ASSETS[name].clear();
        }
    }

    public addImage(element: Undef<HTMLImageElement>) {
        if (element?.complete) {
            const uri = element.src;
            if (uri.startsWith('data:image/')) {
                const match = REGEX_DATAURI.exec(uri);
                if (match) {
                    const mimeType = match[1].split(XML.DELIMITER);
                    this.addRawData(uri, mimeType[0].trim(), mimeType[1]?.trim() || 'base64', match[2], element.naturalWidth, element.naturalHeight);
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

    public addRawData(uri: string, mimeType: string, encoding: string, content: string, width = 0, height = 0) {
        mimeType = mimeType.toLowerCase();
        encoding = encoding.toLowerCase();
        let base64: Undef<string>;
        if (encoding === 'base64') {
            base64 = content;
            if (mimeType === 'image/svg+xml') {
                content = window.atob(content);
            }
        }
        else {
            content = content.replace(/\\(["'])/g, (match, ...capture) => capture[0]);
        }
        const imageMimeType = this.mimeTypeMap.image;
        if (imageMimeType === '*' || imageMimeType.includes(mimeType)) {
            const ext = '.' + fromMimeType(mimeType);
            const filename = uri.endsWith(ext) ? fromLastIndexOf(uri, '/', '\\') : this.randomUUID + ext;
            Resource.ASSETS.rawData.set(uri, {
                pathname: uri.startsWith(location.origin) ? uri.substring(location.origin.length + 1, uri.lastIndexOf('/')) : '',
                filename,
                content,
                base64,
                mimeType,
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
            return font.find(item => item.fontStyle === fontStyle && (!fontWeight || item.fontWeight === parseInt(fontWeight)) && (hasMimeType(mimeType, item.srcFormat) || item.srcUrl && hasMimeType(mimeType, item.srcUrl)));
        }
        return undefined;
    }

    public getRawData(uri: string) {
        if (uri.startsWith('url(')) {
            uri = extractURL(uri);
            if (uri === '') {
                return undefined;
            }
        }
        return Resource.ASSETS.rawData.get(uri);
    }

    public setFileHandler(instance: squared.base.File<T>) {
        instance.resource = this;
        this.fileHandler = instance;
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