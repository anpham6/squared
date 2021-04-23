import type Application from './application';
import type File from './file';
import type Node from './node';

import { parseKeyframes } from './lib/css';
import { fromMimeType, generateUUID, parseMimeType, trimBoth } from './lib/util';

type PreloadItem = HTMLImageElement | string;

const { FILE, STRING } = squared.lib.regex;

const { extractURL, resolveURL } = squared.lib.css;
const { convertBase64, endsWith, fromLastIndexOf, isBase64, resolvePath, splitEnclosing, splitPair, splitPairEnd, splitPairStart, splitSome, startsWith } = squared.lib.util;

const REGEXP_FONTURL = /(url|local)\(\s*(?:"([^"]+)"|'([^']+)'|([^)]+))\s*\)\s*(?:format\(\s*["']?\s*([\w-]+)\s*["']?\s*\))?/g;
const REGEXP_DATAURI = new RegExp(`^(?:^|\\s+)${STRING.DATAURI}(?:$|\\s+)$`);

export default class Resource<T extends Node> implements squared.base.Resource<T> {
    public static readonly KEY_NAME = 'squared.base.resource';
    public static readonly ASSETS: ResourceSessionAsset = [];

    public static hasMimeType(formats: MIMEOrAll, value: string) {
        return formats === '*' || formats.includes(parseMimeType(value));
    }

    public static getExtension(value: string) {
        return /\.([^.\s/]+?)(?:\s+|$)$/.exec(value)?.[1] || '';
    }

    public static parseDataURI(value: string, mimeType = 'image/unknown', encoding = 'base64') {
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
                if (leading.indexOf('/') !== -1) {
                    mimeType = leading;
                    if (!encoding && isBase64(data)) {
                        encoding = 'base64';
                    }
                }
                else {
                    encoding = leading;
                }
            }
            const result = { mimeType, encoding } as RawDataOptions;
            result[encoding === 'base64' ? 'base64' : 'content'] = data;
            return result;
        }
    }

    private _fileHandler: Null<File<T>> = null;

    constructor(public readonly application: Application<T>) {}

    public init(resourceId: number) {
        const data = Resource.ASSETS[resourceId] ||= {} as ResourceAssetMap;
        data.fonts = new Map();
        data.image = new Map();
    }

    public clear() {
        Resource.ASSETS.length = 0;
    }

    public reset() {}

    public preloadAssets(resourceId: number, documentRoot: HTMLElement, elements: QuerySelectorElement[], preloadImages?: boolean, preloadFonts?: boolean): [PreloadItem[], HTMLImageElement[]] {
        const assets = Resource.ASSETS[resourceId]!;
        const result: PreloadItem[] = [];
        const images: HTMLImageElement[] = [];
        const preloadMap: string[] = [];
        for (const element of elements) {
            element.querySelectorAll('img[srcset], picture > source[srcset]').forEach((source: HTMLImageElement | HTMLSourceElement) => splitSome(source.srcset, uri => this.addImage(resourceId, resolvePath(splitPairStart(uri, ' ', false, true)))));
            element.querySelectorAll('video').forEach((source: HTMLVideoElement) => this.addImage(resourceId, source.poster));
            element.querySelectorAll('input[type=image]').forEach((image: HTMLInputElement) => this.addImage(resourceId, image.src, image.width || NaN, image.height || NaN));
            element.querySelectorAll('object, embed').forEach((source: HTMLObjectElement & HTMLEmbedElement) => {
                const src = source.data || source.src;
                if (src && (startsWith(source.type, 'image/') || startsWith(parseMimeType(src), 'image/'))) {
                    this.addImage(resourceId, src.trim());
                }
            });
            element.querySelectorAll('svg use').forEach((use: SVGUseElement) => {
                const href = use.href.baseVal || use.getAttributeNS('xlink', 'href');
                if (href && href.indexOf('#') > 0) {
                    const src = resolvePath(splitPairStart(href, '#'));
                    if (FILE.SVG.test(src)) {
                        this.addImage(resourceId, src);
                    }
                }
            });
        }
        if (preloadImages) {
            const { image, rawData } = assets;
            for (const item of image.values()) {
                const uri = item.uri!;
                if (FILE.SVG.test(uri)) {
                    result.push(uri);
                }
                else if (isNaN(item.width) || isNaN(item.height)) {
                    const element = document.createElement('img');
                    element.src = uri;
                    if (element.naturalWidth && element.naturalHeight) {
                        item.width = element.naturalWidth;
                        item.height = element.naturalHeight;
                    }
                    else {
                        documentRoot.appendChild(element);
                        images.push(element);
                        result.push(element);
                    }
                }
            }
            if (rawData) {
                for (const data of rawData) {
                    const item = data[1];
                    const mimeType = item.mimeType;
                    if (startsWith(mimeType, 'image/') && !endsWith(mimeType, 'svg+xml')) {
                        let src = `data:${mimeType!};`;
                        if (item.base64) {
                            src += 'base64,' + item.base64;
                        }
                        else if (item.content) {
                            src += item.content;
                        }
                        else {
                            continue;
                        }
                        const element = document.createElement('img');
                        element.src = src;
                        const { naturalWidth: width, naturalHeight: height } = element;
                        if (width && height) {
                            item.width = width;
                            item.height = height;
                            image.set(data[0], { width, height, uri: item.filename });
                        }
                        else {
                            document.body.appendChild(element);
                            images.push(element);
                            result.push(element);
                        }
                    }
                }
            }
        }
        if (preloadFonts) {
            for (const item of assets.fonts.values()) {
                for (const font of item) {
                    const srcUrl = font.srcUrl;
                    if (srcUrl) {
                        result.push(srcUrl);
                    }
                }
            }
        }
        for (const element of elements) {
            element.querySelectorAll('img').forEach((image: HTMLImageElement) => {
                if (!preloadImages) {
                    this.addImageElement(resourceId, image);
                }
                else {
                    const src = image.src;
                    if (!preloadMap.includes(src)) {
                        if (FILE.SVG.test(src)) {
                            result.push(src);
                        }
                        else if (image.complete) {
                            this.addImageElement(resourceId, image);
                        }
                        else {
                            result.push(image);
                        }
                        preloadMap.push(src);
                    }
                }
            });
        }
        return [result, images];
    }

    public parseFontFace(resourceId: number, cssText: string, styleSheetHref?: Null<string>) {
        const fontFace = splitEnclosing(cssText, '', true, '{', '}')[1];
        if (fontFace) {
            const fontMap: StringMap = {};
            const items = fontFace.trim().split(';');
            for (let i = 0, length = items.length - 1; i < length; ++i) {
                const [attr, value] = splitPair(items[i], ':', true);
                fontMap[attr] = value;
            }
            let fontFamily = fontMap['font-family'];
            if (fontMap.src && fontFamily) {
                const style = fontMap['font-style'];
                const weight = fontMap['font-weight'];
                const fontStyle = style || 'normal';
                let fontWeight = 400;
                if (weight) {
                    switch (weight) {
                        case 'normal':
                            break;
                        case 'lighter':
                            fontWeight = 100;
                            break;
                        case 'bold':
                        case 'bolder':
                            fontWeight = 700;
                            break;
                        default:
                            fontWeight = +weight || 400;
                            break;
                    }
                }
                fontFamily = trimBoth(fontFamily);
                let match: Null<RegExpExecArray>;
                while (match = REGEXP_FONTURL.exec(fontFace)) {
                    const url = (match[2] || match[3] || match[4]).trim();
                    let srcFormat = match[5],
                        mimeType = '',
                        srcLocal: Undef<string>,
                        srcUrl: Undef<string>,
                        srcBase64: Undef<string>;
                    const setMimeType = () => {
                        switch (srcFormat) {
                            case 'truetype':
                                mimeType = 'font/ttf';
                                break;
                            case 'opentype':
                                mimeType = 'font/otf';
                                break;
                            case 'woff2':
                                mimeType = 'font/woff2';
                                break;
                            case 'woff':
                                mimeType = 'font/woff';
                                break;
                            case 'svg':
                                mimeType = 'image/svg+xml';
                                break;
                            case 'embedded-opentype':
                                mimeType = 'application/vnd.ms-fontobject';
                                break;
                            default:
                                srcFormat = '';
                                break;
                        }
                    };
                    setMimeType();
                    if (match[1] === 'local') {
                        srcLocal = url;
                    }
                    else {
                        if (startsWith(url, 'data:')) {
                            let mime: string;
                            [mime, srcBase64] = splitPair(url, ',', true);
                            if (mime.indexOf('base64') === -1 && !isBase64(srcBase64)) {
                                continue;
                            }
                            mimeType ||= mime.toLowerCase();
                        }
                        else {
                            srcUrl = resolvePath(url, styleSheetHref);
                            mimeType ||= parseMimeType(srcUrl);
                        }
                        if (!srcFormat) {
                            if (mimeType.indexOf('/ttf') !== -1) {
                                srcFormat = 'truetype';
                            }
                            else if (mimeType.indexOf('/otf') !== -1) {
                                srcFormat = 'opentype';
                            }
                            else if (mimeType.indexOf('/woff2') !== -1) {
                                srcFormat = 'woff2';
                            }
                            else if (mimeType.indexOf('/woff') !== -1) {
                                srcFormat = 'woff';
                            }
                            else if (mimeType.indexOf('/svg+xml') !== -1) {
                                srcFormat = 'svg';
                            }
                            else if (mimeType.indexOf('/vnd.ms-fontobject') !== -1) {
                                srcFormat = 'embedded-opentype';
                            }
                            else {
                                continue;
                            }
                            setMimeType();
                        }
                    }
                    this.addFont(resourceId, {
                        fontFamily,
                        fontWeight,
                        fontStyle,
                        mimeType,
                        srcFormat,
                        srcUrl,
                        srcLocal,
                        srcBase64
                    } as FontFaceData);
                }
                REGEXP_FONTURL.lastIndex = 0;
            }
        }
    }

    public parseKeyFrames(resourceId: number, cssRule: CSSKeyframesRule) {
        const value = parseKeyframes(cssRule.cssRules);
        if (value) {
            const keyFrames = Resource.ASSETS[resourceId]!.keyFrames ||= new Map();
            const item = keyFrames.get(cssRule.name);
            if (item) {
                Object.assign(item, value);
            }
            else {
                keyFrames.set(cssRule.name, value);
            }
        }
    }

    public addAsset(resourceId: number, asset: RawAsset) {
        const assets = Resource.ASSETS[resourceId];
        if (assets && (asset.content || asset.uri || asset.base64)) {
            const other = assets.other ||= [];
            const { pathname, filename } = asset;
            const append = other.find(item => item.pathname === pathname && item.filename === filename);
            if (append) {
                Object.assign(append, asset);
            }
            else {
                other.push(asset);
            }
        }
    }

    public addImage(resourceId: number, uri: string, width = NaN, height = NaN) {
        const assets = Resource.ASSETS[resourceId];
        if (assets && uri && (width && height || !this.getImage(resourceId, uri))) {
            assets.image.set(uri, { width, height, uri });
        }
    }

    public addAudio(resourceId: number, uri: string, options?: AudioVideoOptions) {
        const assets = Resource.ASSETS[resourceId];
        if (assets) {
            (assets.audio ||= new Map()).set(uri, { uri, ...options });
        }
    }

    public addVideo(resourceId: number, uri: string, options?: AudioVideoOptions) {
        const assets = Resource.ASSETS[resourceId];
        if (assets) {
            (assets.video ||= new Map()).set(uri, { uri, ...options });
        }
    }

    public addFont(resourceId: number, data: FontFaceData) {
        const assets = Resource.ASSETS[resourceId];
        if (assets) {
            const items = assets.fonts.get(data.fontFamily = data.fontFamily.toLowerCase());
            if (items) {
                items.push(data);
            }
            else {
                assets.fonts.set(data.fontFamily, [data]);
            }
        }
    }

    public addRawData(resourceId: number, uri: string, options?: RawDataOptions) {
        const assets = Resource.ASSETS[resourceId];
        if (assets) {
            let filename: Undef<string>,
                mimeType: Undef<string>,
                encoding: Undef<string>,
                content: Undef<string>,
                base64: Undef<string>,
                buffer: Undef<ArrayBuffer>,
                width: Undef<number>,
                height: Undef<number>;
            if (options) {
                ({ filename, mimeType, encoding, content, base64, buffer, width, height } = options);
                mimeType &&= mimeType.toLowerCase();
                encoding &&= encoding.toLowerCase();
                content &&= content.trim();
            }
            if (base64 || encoding === 'base64') {
                if (!base64) {
                    if (content) {
                        base64 = startsWith(content, 'data:') ? splitPairEnd(content, ',', true) : content;
                        content = undefined;
                    }
                    else if (buffer) {
                        base64 = convertBase64(buffer);
                    }
                    else {
                        return;
                    }
                    buffer = undefined;
                }
                if (mimeType === 'image/svg+xml') {
                    content = window.atob(base64);
                }
            }
            else if (buffer) {
                content = undefined;
            }
            if (content) {
                content = content.replace(/\\(["'])/g, (...match: string[]) => match[1]);
            }
            if (content || base64 || buffer) {
                const url = splitPairStart(uri, '?');
                if (!filename) {
                    const ext = mimeType && fromMimeType(mimeType);
                    filename = ext && url.endsWith('.' + ext) ? fromLastIndexOf(url, '/') : this.assignFilename(url, mimeType, ext);
                }
                (assets.rawData ||= new Map()).set(uri, {
                    pathname: startsWith(url, location.origin) ? url.substring(location.origin.length + 1, url.lastIndexOf('/')) : '',
                    filename,
                    mimeType,
                    content,
                    base64,
                    buffer,
                    width,
                    height
                } as RawAsset);
            }
        }
    }

    public getImage(resourceId: number, uri: string) {
        const assets = Resource.ASSETS[resourceId];
        if (assets) {
            return assets.image.get(uri);
        }
    }

    public getVideo(resourceId: number, uri: string) {
        const video = Resource.ASSETS[resourceId]?.video;
        if (video) {
            return video.get(uri);
        }
    }

    public getAudio(resourceId: number, uri: string) {
        const audio = Resource.ASSETS[resourceId]?.audio;
        if (audio) {
            return audio.get(uri);
        }
    }

    public getFonts(resourceId: number, fontFamily: string, fontStyle = 'normal', fontWeight?: string) {
        const assets = Resource.ASSETS[resourceId];
        if (assets) {
            const font = assets.fonts.get(fontFamily.trim().toLowerCase());
            if (font) {
                const mimeType = this.mimeTypeMap.font;
                return font.filter(item => startsWith(fontStyle, item.fontStyle) && (!fontWeight || item.fontWeight === +fontWeight) && (mimeType === '*' || mimeType.includes(item.mimeType))).sort((a, b) => a.fontWeight - b.fontWeight);
            }
        }
        return [];
    }

    public getRawData(resourceId: number, uri: string) {
        const rawData = Resource.ASSETS[resourceId]?.rawData;
        if (rawData) {
            if (startsWith(uri, 'url(')) {
                uri = extractURL(uri)!;
                if (!uri) {
                    return;
                }
            }
            return rawData.get(uri);
        }
    }

    public addImageElement(resourceId: number, element: HTMLImageElement) {
        if (element.complete) {
            const uri = element.src;
            const image = Resource.parseDataURI(uri);
            if (image) {
                image.width = element.naturalWidth;
                image.height = element.naturalHeight;
                this.addRawData(resourceId, uri, image);
            }
            if (uri) {
                Resource.ASSETS[resourceId]?.image.set(uri, { width: element.naturalWidth, height: element.naturalHeight, uri });
            }
        }
    }

    public fromImageUrl(resourceId: number, value: string) {
        const data = this.getRawData(resourceId, value);
        if (data) {
            return [data as ImageAsset];
        }
        const result: ImageAsset[] = [];
        for (const seg of splitEnclosing(value, 'url')) {
            const url = resolveURL(seg);
            if (url) {
                const image = this.getImage(resourceId, url);
                if (image) {
                    result.push(image);
                }
            }
        }
        return result;
    }

    public assignFilename(uri: string, mimeType?: string, ext = 'unknown') {
        return generateUUID((this.application.userSettings as UserResourceSettings).formatUUID) + '.' + ext;
    }

    set fileHandler(value) {
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

    get mapOfAssets() {
        return Resource.ASSETS;
    }
}