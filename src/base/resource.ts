import { ControllerSettings, ResourceAssetMap, UserSettings } from '../../@types/base/application';

type CSSFontFaceData = squared.lib.css.CSSFontFaceData;

const $lib = squared.lib;
const { CSS, STRING } = $lib.regex;
const { buildAlphaString, fromLastIndexOf } = $lib.util;

export default abstract class Resource<T extends squared.base.Node> implements squared.base.Resource<T> {
    public static ASSETS: ResourceAssetMap = {
        ids: new Map(),
        images: new Map(),
        fonts: new Map(),
        rawData: new Map()
    };

    public fileHandler?: squared.base.File<T>;
    public readonly abstract application: squared.base.Application<T>;
    public readonly abstract cache: squared.base.NodeList<T>;
    public abstract controllerSettings: ControllerSettings;

    public abstract get userSettings(): UserSettings;

    public reset() {
        for (const name in Resource.ASSETS) {
            Resource.ASSETS[name].clear();
        }
        this.fileHandler?.reset();
    }

    public addImage(element: HTMLImageElement | undefined) {
        if (element?.complete) {
            const uri = element.src;
            if (/^data\:image\//.test(uri)) {
                const match = new RegExp(`^${STRING.DATAURI}$`).exec(uri);
                if (match) {
                    const mimeType = match[1];
                    const encoding = match[2];
                    if (mimeType && encoding) {
                        this.addRawData(uri, mimeType, encoding, match[3], element.naturalWidth, element.naturalHeight);
                    }
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

    public addFont(data: CSSFontFaceData) {
        const fonts = Resource.ASSETS.fonts;
        const fontFamily = data.fontFamily.trim().toLowerCase();
        data.fontFamily = fontFamily;
        const items = fonts.get(fontFamily) || [];
        items.push(data);
        fonts.set(fontFamily, items);
    }

    public getFont(fontFamily: string, fontStyle = 'normal', fontWeight?: string) {
        const font = Resource.ASSETS.fonts.get(fontFamily.trim().toLowerCase());
        if (font) {
            const fontFormat = this.controllerSettings.supported.fontFormat;
            return font.find(item => item.fontStyle === fontStyle && (fontWeight === undefined || item.fontWeight === parseInt(fontWeight)) && (fontFormat === '*' || fontFormat.includes(item.srcFormat)));
        }
        return undefined;
    }

    public addRawData(uri: string, mimeType: string, encoding: string, content: string, width = 0, height = 0) {
        mimeType = mimeType.toLowerCase();
        encoding = encoding.toLowerCase();
        let base64: string | undefined;
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
        const pathname = valid ? uri.substring(origin.length + 1, uri.lastIndexOf('/')) : '';
        const getFileName = () => buildAlphaString(5).toLowerCase() + '_' + new Date().getTime();
        let filename: string | undefined;
        if (imageFormat === '*') {
            if (valid) {
                filename = fromLastIndexOf(uri, '/');
            }
            else {
                let extension = mimeType.split('/').pop() as string;
                if (extension === 'svg+xml') {
                    extension = 'svg';
                }
                filename = getFileName() + '.' + extension;
            }
        }
        else {
            for (const extension of imageFormat) {
                if (mimeType.indexOf(extension) !== -1) {
                    filename = uri.endsWith('.' + extension) ? fromLastIndexOf(uri, '/') : getFileName() + '.' + extension;
                    break;
                }
            }
        }
        if (filename) {
            Resource.ASSETS.rawData.set(uri, {
                pathname,
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
        if (/^url\(/.test(uri)) {
            const match = CSS.URL.exec(uri);
            if (match) {
                uri = match[1];
            }
            else {
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