import { ResourceAssetMap, UserSettings } from './@types/application';

import Application from './application';
import Node from './node';

type CSSFontFaceData = squared.lib.css.CSSFontFaceData;

const $regex = squared.lib.regex;
const $util = squared.lib.util;

export default abstract class Resource<T extends Node> implements squared.base.Resource<T> {
    public static ASSETS: ResourceAssetMap = {
        ids: new Map(),
        images: new Map(),
        fonts: new Map(),
        rawData: new Map()
    };

    public fileHandler?: squared.base.File<T>;

    protected constructor(
        public application: Application<T>,
        public cache: squared.base.NodeList<T>)
    {
    }

    public abstract get userSettings(): UserSettings;

    public reset() {
        for (const name in Resource.ASSETS) {
            Resource.ASSETS[name].clear();
        }
        if (this.fileHandler) {
            this.fileHandler.reset();
        }
    }

    public addImage(element: HTMLImageElement | undefined) {
        if (element && element.complete) {
            if (element.src.startsWith('data:image/')) {
                const match = new RegExp(`^${$regex.STRING.DATAURI}$`).exec(element.src);
                if (match && match[1] && match[2]) {
                    this.addRawData(element.src, match[1], match[2], match[3], element.naturalWidth, element.naturalHeight);
                }
            }
            const uri = element.src;
            if (uri !== '') {
                Resource.ASSETS.images.set(uri, { width: element.naturalWidth, height: element.naturalHeight, uri });
            }
        }
    }

    public getImage(src: string) {
        return Resource.ASSETS.images.get(src);
    }

    public addFont(data: CSSFontFaceData) {
        const fonts = Resource.ASSETS.fonts.get(data.fontFamily) || [];
        fonts.push(data);
        Resource.ASSETS.fonts.set(data.fontFamily, fonts);
    }

    public getFont(fontFamily: string, fontStyle = 'normal', fontWeight?: string) {
        const font = Resource.ASSETS.fonts.get(fontFamily);
        if (font) {
            const fontFormat = this.application.controllerHandler.localSettings.supported.fontFormat;
            return font.find(item => item.fontStyle === fontStyle && (fontWeight === undefined || item.fontWeight === parseInt(fontWeight)) && (fontFormat === '*' || fontFormat.includes(item.srcFormat)));
        }
        return undefined;
    }

    public addRawData(dataURI: string, mimeType: string, encoding: string, content: string, width = 0, height = 0) {
        encoding = encoding.toLowerCase();
        const settings = this.application.controllerHandler.localSettings;
        let base64: string | undefined;
        if (encoding === 'base64') {
            base64 = content;
            if (mimeType === 'image/svg+xml') {
                content = window.atob(content);
            }
        }
        else {
            content = content.replace(/\\"/g, '"');
        }
        const getFileName = () => $util.buildAlphaString(5).toLowerCase() + '_' + new Date().getTime();
        const pathname = dataURI.startsWith(location.origin) ? dataURI.substring(location.origin.length + 1, dataURI.lastIndexOf('/')) : '';
        let filename: string | undefined;
        if (settings.supported.imageFormat === '*') {
            if (dataURI.startsWith(location.origin)) {
                filename = $util.fromLastIndexOf(dataURI, '/');
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
            for (const format of settings.supported.imageFormat) {
                if (mimeType.indexOf(format) !== -1) {
                    if (dataURI.endsWith(`.${format}`)) {
                        filename = $util.fromLastIndexOf(dataURI, '/');
                    }
                    else {
                        filename = getFileName() + '.' + format;
                    }
                    break;
                }
            }
        }
        if (filename) {
            Resource.ASSETS.rawData.set(dataURI, {
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

    public getRawData(dataURI: string) {
        if (dataURI.startsWith('url(')) {
            const match = $regex.CSS.URL.exec(dataURI);
            if (match) {
                dataURI = match[1];
            }
        }
        return Resource.ASSETS.rawData.get(dataURI);
    }

    public setFileHandler(instance: squared.base.File<T>) {
        instance.resource = this;
        this.fileHandler = instance;
    }

    get assets() {
        return Resource.ASSETS;
    }
}