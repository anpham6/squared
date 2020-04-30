import { FileAsset } from '../../@types/base/file';
import { ChromeAsset, FileActionAttribute, FileArchivingOptions, FileCopyingOptions } from '../../@types/chrome/file';

import Resource from './resource';

type View = chrome.base.View;

const $lib = squared.lib;

const { CHAR, COMPONENT, FILE, XML } = $lib.regex;
const { appendSeparator, convertWord, fromLastIndexOf, isString, objectMap, parseMimeType, resolvePath, spliceString, trimEnd } = $lib.util;

const ASSETS = Resource.ASSETS;
const REGEX_SRCSET = /\s*(.+?\.[^\s,]+).*?,\s*/;
const REGEX_SRCSET_SPECIFIER = /\s+[0-9.][wx]$/;

function parseUri(uri: string, saveAs?: string, mimeType?: string): Undef<ChromeAsset> {
    const value = trimEnd(uri, '/');
    const match = COMPONENT.PROTOCOL.exec(value);
    if (match) {
        const host = match[2], port = match[3], path = match[4];
        let pathname = '', filename = '';
        let rootDir = '';
        let moveTo: Undef<string>;
        let local: Undef<boolean>;
        let append: Undef<boolean>;
        let format: Undef<string>;
        const getDirectory = (start = 1) => {
            if (start > 1) {
                rootDir = path.substring(0, start);
            }
            return path.substring(start, path.lastIndexOf('/'));
        };
        if (!value.startsWith(trimEnd(location.origin, '/'))) {
            pathname = convertWord(host) + (port ? '/' + port.substring(1) : '') + '/';
        }
        else {
            local = true;
        }
        if (saveAs) {
            const subMatch = /saveAs:([^"']+)/.exec(saveAs);
            if (subMatch) {
                let location: string;
                [location, format] = subMatch[1].split(':').map(value => value.trim());
                if (location.charAt(0) === '/') {
                    moveTo = '__serverroot__';
                    location = location.substring(1);
                }
                const parts = location.split('/');
                filename = parts.pop() as string;
                pathname = parts.join('/');
                append = true;
            }
        }
        else if (path && path !== '/') {
            filename = fromLastIndexOf(path, '/');
            if (local) {
                const prefix = location.pathname.substring(0, location.pathname.lastIndexOf('/') + 1);
                if (path.startsWith(prefix)) {
                    pathname = getDirectory(prefix.length);
                }
                else {
                    moveTo = '__serverroot__';
                    pathname = getDirectory();
                }
            }
            else {
                pathname += getDirectory();
            }
        }
        else {
            filename = 'index.html';
        }
        const extension = filename.includes('.') ? fromLastIndexOf(filename, '.').toLowerCase() : undefined;
        return {
            uri,
            rootDir,
            moveTo,
            pathname,
            filename,
            extension,
            append,
            format,
            mimeType: extension && parseMimeType(extension)
        };
    }
    return undefined;
}

function resolveAssetSource(data: Map<HTMLElement, string>, element: HTMLVideoElement | HTMLAudioElement | HTMLSourceElement) {
    const value = resolvePath(element.src);
    if (value !== '') {
        data.set(element, value);
    }
}

function convertFileMatch(value: string) {
    value = value.trim()
        .replace(/([.|/\\{}()?])/g, (match, ...capture) => '\\' + capture[0])
        .replace(/\*/g, '.*?');
    return new RegExp(`${value}$`);
}

function getExtensions(element: Null<HTMLElement>) {
    const use = element?.dataset.use?.trim();
    return use ? use.split(XML.SEPARATOR) : [];
}

function processExtensions(this: chrome.base.File<View>, data: ChromeAsset, extensions: string[], options?: FileActionAttribute) {
    const processed: chrome.base.Extension<View>[] = [];
    if (options?.ignoreExtensions !== true) {
        this.application.extensions.forEach(ext => {
            if (ext.processFile(data)) {
                processed.push(ext);
            }
        });
    }
    for (const name of extensions) {
        const ext = <chrome.base.Extension<View>> this.application.extensionManager.retrieve(name, true);
        if (ext && !processed.includes(ext)) {
            ext.processFile(data, true);
        }
    }
}

export default class File<T extends chrome.base.View> extends squared.base.File<T> implements chrome.base.File<T> {
    public resource!: chrome.base.Resource<T>;

    private _outputFileExclusions?: RegExp[];

    public reset() {
        super.reset();
        this._outputFileExclusions = undefined;
    }

    public copyToDisk(directory: string, options?: FileCopyingOptions) {
        return this.copying({
            ...options,
            assets: <FileAsset[]> this.getAssetsAll().concat(options?.assets || []),
            directory
        });
    }

    public appendToArchive(pathname: string, options?: FileArchivingOptions) {
        return this.archiving({
            filename: this.userSettings.outputArchiveName,
            ...options,
            assets: <FileAsset[]> this.getAssetsAll(options).concat(options?.assets || []),
            appendTo: pathname
        });
    }

    public saveToArchive(filename: string, options?: FileArchivingOptions) {
        return this.archiving({
            ...options,
            assets: <FileAsset[]> this.getAssetsAll(options).concat(options?.assets || []),
            filename
        });
    }

    public getHtmlPage(options?: FileActionAttribute) {
        const result: ChromeAsset[] = [];
        const href = location.href;
        const data = parseUri(href);
        if (data) {
            const name = options?.name;
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
                data.mimeType = parseMimeType('html');
                processExtensions.call(this, data, getExtensions(document.querySelector('html')), options);
                result.push(data);
            }
        }
        return result;
    }

    public getScriptAssets(options?: FileActionAttribute) {
        const result: ChromeAsset[] = [];
        const saveAs = options?.saveAs?.script;
        document.querySelectorAll('script').forEach(element => {
            let file = element.dataset.chromeFile;
            if (file !== 'exclude') {
                if (!isString(file)) {
                    file = saveAs;
                }
                const src = element.src.trim();
                if (src !== '') {
                    const data = parseUri(resolvePath(src), file);
                    if (this.validFile(data)) {
                        data.mimeType = element.type.trim() || parseMimeType(data.uri!) || 'text/javascript';
                        processExtensions.call(this, data, getExtensions(element), options);
                        result.push(data);
                    }
                }
            }
        });
        return result;
    }

    public getLinkAssets(options?: FileActionAttribute) {
        const result: ChromeAsset[] = [];
        const rel = options?.rel;
        const saveAs = options?.saveAs?.script;
        document.querySelectorAll(rel ? `link[rel="${rel}"]` : 'link').forEach((element: HTMLLinkElement) => {
            let file = element.dataset.chromeFile;
            if (file !== 'exclude') {
                if (!isString(file)) {
                    file = saveAs;
                }
                const href = element.href.trim();
                if (href !== '') {
                    const uri = resolvePath(href);
                    const data = parseUri(resolvePath(href), file);
                    if (this.validFile(data)) {
                        switch (element.rel.trim()) {
                            case 'stylesheet':
                                data.mimeType = 'text/css';
                                break;
                            case 'icon':
                                data.mimeType = 'image/x-icon';
                                break;
                            default:
                                data.mimeType = element.type.trim() || parseMimeType(uri);
                                break;
                        }
                        processExtensions.call(this, data, getExtensions(element), options);
                        result.push(data);
                    }
                }
            }
        });
        return result;
    }

    public getImageAssets(options?: FileActionAttribute) {
        const result: ChromeAsset[] = [];
        const processUri = (element: Null<HTMLElement>, uri: string) => {
            if (uri !== '') {
                const data = <ChromeAsset> parseUri(uri);
                if (this.validFile(data) && !result.find(item => item.uri === uri)) {
                    processExtensions.call(this, data, getExtensions(element), options);
                    result.push(data);
                }
            }
        };
        document.querySelectorAll('picture > source').forEach((source: HTMLSourceElement) => source.srcset.split(XML.SEPARATOR).forEach(uri => processUri(source, resolvePath(uri.split(CHAR.SPACE)[0]))));
        document.querySelectorAll('video').forEach((source: HTMLVideoElement) => processUri(source, resolvePath(source.poster)));
        document.querySelectorAll('img, input[type=image]').forEach((image: HTMLImageElement) => {
            const src = image.src.trim();
            if (!src.startsWith('data:image/')) {
                processUri(image, resolvePath(src));
            }
        });
        document.querySelectorAll('img[srcset], picture > source[srcset]').forEach((element: HTMLImageElement) => {
            const images: string[] = [];
            let srcset = element.srcset.trim();
            let match: Null<RegExpExecArray>;
            while ((match = REGEX_SRCSET.exec(srcset)) !== null) {
                images.push(match[1]);
                srcset = spliceString(srcset, match.index, match[0].length);
            }
            images.push(srcset.trim().replace(REGEX_SRCSET_SPECIFIER, ''));
            images.forEach(src => {
                if (src !== '') {
                    processUri(element, resolvePath(src));
                }
            });
        });
        for (const uri of ASSETS.image.keys()) {
            processUri(null, uri);
        }
        for (const rawData of ASSETS.rawData.values()) {
            if (rawData.pathname) {
                continue;
            }
            else {
                const { base64, content, filename, mimeType } = rawData;
                let data: Undef<ChromeAsset>;
                if (base64) {
                    data = { pathname: '__generated__/base64', filename, base64 };
                }
                else if (content && mimeType) {
                    data = { pathname: `__generated__/${mimeType.split('/').pop()}`, filename, content };
                }
                else {
                    continue;
                }
                if (this.validFile(data)) {
                    data.mimeType = mimeType;
                    processExtensions.call(this, data, [], options);
                    result.push(data);
                }
            }
        }
        return result;
    }

    public getVideoAssets(options?: FileActionAttribute) {
        return this.getRawAssets('video', options);
    }

    public getAudioAssets(options?: FileActionAttribute) {
        return this.getRawAssets('audio', options);
    }

    public getFontAssets(options?: FileActionAttribute) {
        const result: ChromeAsset[] = [];
        for (const fonts of ASSETS.fonts.values()) {
            fonts.forEach(font => {
                const url = font.srcUrl;
                if (url) {
                    const data = parseUri(url);
                    if (this.validFile(data)) {
                        processExtensions.call(this, data, [], options);
                        result.push(data);
                    }
                }
            });
        }
        return result;
    }

    protected validFile(data: Undef<ChromeAsset>): data is ChromeAsset {
        if (data) {
            const fullpath = data.pathname + '/' + data.filename;
            return !this.outputFileExclusions.some(pattern => pattern.test(fullpath));
        }
        return false;
    }

    protected getRawAssets(tagName: string, options?: FileActionAttribute) {
        const result: ChromeAsset[] = [];
        document.querySelectorAll(tagName).forEach((element: HTMLVideoElement | HTMLAudioElement) => {
            const items = new Map<HTMLElement, string>();
            resolveAssetSource(items, element);
            element.querySelectorAll('source').forEach((source: HTMLSourceElement) => resolveAssetSource(items, source));
            for (const [item, uri] of items.entries()) {
                const data = parseUri(uri);
                if (this.validFile(data)) {
                    processExtensions.call(this, data, getExtensions(item), options);
                    result.push(data);
                }
            }
        });
        return result;
    }

    protected getAssetsAll(options: FileArchivingOptions = {}) {
        const saveAsWebPage = options.saveAsWebPage === true;
        if (saveAsWebPage) {
            options = { ...options, ignoreExtensions: true };
        }
        const result = this.getHtmlPage(options).concat(this.getLinkAssets(options));
        if (options.saveAsWebPage) {
            result.forEach(item => {
                const mimeType = item.mimeType;
                if (mimeType) {
                    switch (mimeType) {
                        case 'text/html':
                        case 'text/css':
                        case 'application/xhtml+xml':
                            item.mimeType = '@' + mimeType;
                            break;
                    }
                }
            });
        }
        return result.concat(this.getScriptAssets(options))
            .concat(this.getImageAssets(options))
            .concat(this.getVideoAssets(options))
            .concat(this.getAudioAssets(options))
            .concat(this.getFontAssets(options));
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