import { FileAsset } from '../../@types/base/file';
import { ChromeAsset, FileArchivingOptionsChrome, FileCopyingOptionsChrome } from '../../@types/chrome/file';

import Resource from './resource';

type View = chrome.base.View;

const $lib = squared.lib;

const { CHAR, COMPONENT, FILE, XML } = $lib.regex;
const { appendSeparator, convertWord, fromLastIndexOf, objectMap, parseMimeType, resolvePath, safeNestedArray, spliceString, trimEnd } = $lib.util;

const ASSETS = Resource.ASSETS;
const REGEX_SRCSET = /\s*(.+?\.[^\s,]+).*?,\s*/;
const REGEX_SRCSET_SPECIFIER = /\s+[0-9.][wx]$/;

function parseUri(value: string): Undef<ChromeAsset> {
    value = trimEnd(value, '/');
    const match = COMPONENT.PROTOCOL.exec(value);
    let pathname = '';
    let filename = '';
    if (match) {
        const host = match[2];
        const port = match[3];
        const path = match[4];
        if (!value.startsWith(trimEnd(location.origin, '/'))) {
            pathname = convertWord(host) + (port ? '/' + port.substring(1) : '') + '/';
        }
        if (path) {
            const index = path.lastIndexOf('/');
            if (index > 0) {
                pathname += path.substring(1, index);
                filename = fromLastIndexOf(path, '/');
            }
        }
    }
    if (pathname !== '') {
        const extension = filename.includes('.') ? fromLastIndexOf(filename, '.').toLowerCase() : undefined;
        return {
            pathname,
            filename,
            extension,
            mimeType: extension && parseMimeType(extension)
        };
    }
    return undefined;
}

function resolveAssetSource(data: Set<string>, value: string) {
    const src = resolvePath(value);
    if (src !== '') {
        data.add(src);
    }
}

function convertFileMatch(value: string) {
    value = value.trim()
        .replace(/([.|/\\{}()?])/g, (match, ...capture) => '\\' + capture[0])
        .replace(/\*/g, '.*?');
    return new RegExp(`${value}$`);
}

function processExtensions(this: chrome.base.File<View>, data: ChromeAsset) {
    this.application.extensions.forEach(ext => ext.processFile(data));
}

export default class File<T extends chrome.base.View> extends squared.base.File<T> implements chrome.base.File<T> {
    public resource!: chrome.base.Resource<T>;

    private _outputFileExclusions?: RegExp[];

    public reset() {
        super.reset();
        this._outputFileExclusions = undefined;
    }

    public copyToDisk(directory: string, options?: FileCopyingOptionsChrome) {
        this.copying({
            ...options,
            assets: <FileAsset[]> this.getAssetsAll().concat(options?.assets || []),
            directory
        });
    }

    public appendToArchive(pathname: string, options?: FileArchivingOptionsChrome) {
        this.archiving({
            filename: this.userSettings.outputArchiveName,
            ...options,
            assets: <FileAsset[]> this.getAssetsAll().concat(options?.assets || []),
            appendTo: pathname
        });
    }

    public saveToArchive(filename: string, options?: FileArchivingOptionsChrome) {
        this.archiving({
            ...options,
            assets: <FileAsset[]> this.getAssetsAll().concat(options?.assets || []),
            filename
        });
    }

    public getHtmlPage(name?: string) {
        const result: ChromeAsset[] = [];
        const href = location.href;
        const data = parseUri(href);
        if (data) {
            if (name) {
                data.filename = name;
            }
            else {
                const filename = data.filename;
                if (!FILE.NAME.test(filename)) {
                    data.pathname = appendSeparator(data.pathname, filename);
                    data.filename = 'index.html';
                }
            }
            if (this.validFile(data)) {
                data.uri = href;
                data.mimeType = parseMimeType('html');
                processExtensions.bind(this, data)();
                result.push(data);
            }
        }
        return result;
    }

    public getScriptAssets() {
        const result: ChromeAsset[] = [];
        document.querySelectorAll('script').forEach(element => {
            const src = element.src.trim();
            if (src !== '') {
                const uri = resolvePath(src);
                const data = parseUri(uri);
                if (this.validFile(data)) {
                    data.uri = uri;
                    const type = element.type;
                    if (type) {
                        data.mimeType = type;
                    }
                    processExtensions.bind(this, data)();
                    result.push(data);
                }
            }
        });
        return result;
    }

    public getLinkAssets(rel?: string) {
        const result: ChromeAsset[] = [];
        document.querySelectorAll(rel ? `link[rel="${rel}"]` : 'link').forEach((element: HTMLLinkElement) => {
            const href = element.href.trim();
            if (href !== '') {
                const uri = resolvePath(href);
                const data = parseUri(uri);
                if (this.validFile(data)) {
                    data.uri = uri;
                    processExtensions.bind(this, data)();
                    result.push(data);
                }
            }
        });
        return result;
    }

    public getImageAssets() {
        const result: ChromeAsset[] = [];
        const processUri = (uri: string) => {
            if (uri !== '') {
                const data = <ChromeAsset> parseUri(uri);
                if (this.validFile(data)) {
                    data.uri = uri;
                    processExtensions.bind(this, data)();
                    result.push(data);
                }
            }
        };
        if (this.userSettings.preloadImages) {
            for (const uri of ASSETS.image.keys()) {
                processUri(uri);
            }
        }
        else {
            document.querySelectorAll('picture > source').forEach((source: HTMLSourceElement) => source.srcset.split(XML.SEPARATOR).forEach(uri => processUri(resolvePath(uri.split(CHAR.SPACE)[0]))));
            document.querySelectorAll('video').forEach((source: HTMLVideoElement) => processUri(resolvePath(source.poster)));
            document.querySelectorAll('img, input[type=image]').forEach((image: HTMLInputElement) => {
                const src = image.src.trim();
                if (!src.startsWith('data:image/')) {
                    processUri(resolvePath(src));
                }
            });
        }
        for (const [uri, rawData] of ASSETS.rawData) {
            const filename = rawData.filename;
            if (filename) {
                const { pathname, base64, content, mimeType } = rawData;
                let data: Undef<ChromeAsset>;
                if (pathname) {
                    data = { pathname, filename, uri };
                }
                else if (base64) {
                    data = { pathname: 'generated/base64', filename, base64 };
                }
                else if (content && mimeType) {
                    data = { pathname: `generated/${mimeType}`, filename, content };
                }
                else {
                    continue;
                }
                if (this.validFile(data)) {
                    data.mimeType = mimeType;
                    processExtensions.bind(this, data)();
                    result.push(data);
                }
            }
        }
        document.querySelectorAll('img[srcset], picture > source[srcset]').forEach((element: HTMLImageElement) => {
            const images: string[] = [];
            let srcset = element.srcset.trim();
            let match: Null<RegExpExecArray>;
            while ((match = REGEX_SRCSET.exec(srcset)) !== null) {
                images.push(resolvePath(match[1]));
                srcset = spliceString(srcset, match.index, match[0].length);
            }
            srcset = srcset.trim();
            if (srcset !== '') {
                images.push(resolvePath(srcset.replace(REGEX_SRCSET_SPECIFIER, '')));
            }
            images.forEach(src => {
                if (COMPONENT.PROTOCOL.test(src) && result.findIndex(item => item.uri === src) === -1) {
                    const data = parseUri(src);
                    if (this.validFile(data)) {
                        data.uri = src;
                        result.push(data);
                    }
                }
            });
        });
        if (this.userSettings.compressImages) {
            result.forEach(asset => {
                if (Resource.canCompressImage(asset.filename)) {
                    safeNestedArray(<StandardMap> asset, 'compress').unshift({ format: 'png' });
                }
            });
        }
        return result;
    }

    public getVideoAssets() {
        return this.getRawAssets('video');
    }

    public getAudioAssets() {
        return this.getRawAssets('audio');
    }

    public getFontAssets() {
        const result: ChromeAsset[] = [];
        for (const fonts of ASSETS.fonts.values()) {
            fonts.forEach(font => {
                const url = font.srcUrl;
                if (url) {
                    const data = parseUri(url);
                    if (this.validFile(data)) {
                        data.uri = url;
                        processExtensions.bind(this, data)();
                        result.push(data);
                    }
                }
            });
        }
        return result;
    }

    protected validFile(data: Undef<ChromeAsset>): data is ChromeAsset {
        if (data) {
            const fullpath = `${data.pathname}/${data.filename}`;
            return !this.outputFileExclusions.some(pattern => pattern.test(fullpath));
        }
        return false;
    }

    protected getRawAssets(tagName: string) {
        const result: ChromeAsset[] = [];
        document.querySelectorAll(tagName).forEach((element: HTMLVideoElement | HTMLAudioElement) => {
            const videos = new Set<string>();
            resolveAssetSource(videos, element.src);
            element.querySelectorAll('source').forEach((source: HTMLSourceElement) => resolveAssetSource(videos, source.src));
            for (const uri of videos) {
                const data = parseUri(uri);
                if (this.validFile(data)) {
                    data.uri = uri;
                    processExtensions.bind(this, data)();
                    result.push(data);
                }
            }
        });
        return result;
    }

    protected getAssetsAll() {
        return this.getHtmlPage()
            .concat(this.getScriptAssets())
            .concat(this.getLinkAssets())
            .concat(this.getImageAssets())
            .concat(this.getVideoAssets())
            .concat(this.getAudioAssets())
            .concat(this.getFontAssets());
    }

    get outputFileExclusions() {
        let result = this._outputFileExclusions;
        if (result === undefined) {
            result = objectMap(this.userSettings.outputFileExclusions, value => convertFileMatch(value));
            this._outputFileExclusions = result;
        }
        return result;
    }

    get userSettings() {
        return this.resource.userSettings;
    }

    get application() {
        return this.resource.application;
    }
}