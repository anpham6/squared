import type { ControllerSettings, ResourceAssetMap, UserSettings } from '../../@types/base/application';

type FontFaceData = squared.lib.css.FontFaceData;

const $lib = squared.lib;

const { STRING, XML } = $lib.regex;
const { extractURL } = $lib.css;
const { fromLastIndexOf, randomUUID } = $lib.util;

export default abstract class Resource<T extends squared.base.Node> implements squared.base.Resource<T> {
    public static ASSETS: ResourceAssetMap = {
        ids: new Map(),
        images: new Map(),
        fonts: new Map(),
        rawData: new Map()
    };

    public static canCompressImage(filename: string) {
        return /\.(png|jpg|jpeg)$/i.test(filename);
    }

    public fileHandler?: squared.base.File<T>;
    public readonly abstract application: squared.base.Application<T>;
    public readonly abstract cache: squared.base.NodeList<T>;
    public readonly abstract fileSeparator: string;
    public abstract controllerSettings: ControllerSettings;

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
                const match = new RegExp(`^${STRING.DATAURI}$`).exec(uri);
                if (match) {
                    const mimeType = match[1].split(XML.DELIMITER);
                    this.addRawData(uri, mimeType[0].trim(), mimeType[1]?.trim() || 'base64', match[2], element.naturalWidth, element.naturalHeight);
                }
            }
            if (uri !== '') {
                Resource.ASSETS.images.set(uri, { width: element.naturalWidth, height: element.naturalHeight, uri });
            }
        }
    }

    public getImage(src: string) {
        return Resource.ASSETS.images.get(src);
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

    public getFont(fontFamily: string, fontStyle = 'normal', fontWeight?: string) {
        const font = Resource.ASSETS.fonts.get(fontFamily.trim().toLowerCase());
        if (font) {
            const fontFormat = this.controllerSettings.supported.fontFormat;
            return font.find(item => item.fontStyle === fontStyle && (!fontWeight || item.fontWeight === parseInt(fontWeight)) && (fontFormat === '*' || fontFormat.includes(item.srcFormat)));
        }
        return undefined;
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
        const imageFormat = this.controllerSettings.supported.imageFormat;
        const origin = location.origin;
        const valid = uri.startsWith(origin);
        let filename: Undef<string>;
        if (imageFormat === '*') {
            if (valid) {
                filename = fromLastIndexOf(uri, '/');
            }
            else {
                let extension = mimeType.split('/').pop() as string;
                if (extension === 'svg+xml') {
                    extension = 'svg';
                }
                filename = randomUUID(this.fileSeparator) + '.' + extension;
            }
        }
        else {
            const length = imageFormat.length;
            let i = 0;
            while (i < length) {
                const extension = imageFormat[i++];
                if (mimeType.includes(extension)) {
                    const ext = '.' + extension;
                    filename = uri.endsWith(ext) ? fromLastIndexOf(uri, '/') : randomUUID(this.fileSeparator) + ext;
                    break;
                }
            }
        }
        if (filename) {
            Resource.ASSETS.rawData.set(uri, {
                pathname: valid ? uri.substring(origin.length + 1, uri.lastIndexOf('/')) : '',
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
}