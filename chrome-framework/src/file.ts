import { FileAsset } from '../../@types/base/file';
import { ChromeAsset, FileActionAttribute, FileArchivingOptions, FileCopyingOptions, SaveAsOptions } from '../../@types/chrome/file';

import Resource from './resource';

type View = chrome.base.View;

const $lib = squared.lib;

const { CHAR, COMPONENT, FILE, XML } = $lib.regex;
const { appendSeparator, convertWord, fromLastIndexOf, isString, iterateReverseArray, objectMap, parseMimeType, resolvePath, safeNestedArray, spliceString, trimEnd } = $lib.util;

const ASSETS = Resource.ASSETS;
const REGEX_SRCSET = /\s*(.+?\.[^\s,]+).*?,\s*/;
const REGEX_SRCSET_SPECIFIER = /\s+[0-9.][wx]$/;

function getFilePath(location: string): [Undef<string>, string, string] {
    let moveTo: Undef<string>;
    if (location.charAt(0) === '/') {
        moveTo = '__serverroot__';
        location = location.substring(1);
    }
    const parts = location.split('/');
    const filename = parts.pop() as string;
    return [moveTo, parts.join('/'), filename];
}

function parseUri(uri: string, saveAs?: string, format?: string, outerHTML?: string, bundleIndex?: number): Undef<ChromeAsset> {
    const value = trimEnd(uri, '/');
    const match = COMPONENT.PROTOCOL.exec(value);
    if (match) {
        const host = match[2], port = match[3], path = match[4];
        let pathname = '', filename = '';
        let rootDir = '';
        let moveTo: Undef<string>;
        let local: Undef<boolean>;
        let append: Undef<boolean>;
        let bundleMain: Undef<boolean>;
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
            let location: string;
            const subMatch = /saveAs:([^"']+)/.exec(saveAs);
            if (subMatch) {
                [location, format] = subMatch[1].split('::').map(item => item.trim());
            }
            else {
                location = saveAs;
                bundleMain = bundleIndex === 0;
            }
            [moveTo, pathname, filename] = getFilePath(location);
            append = true;
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
            mimeType: extension && parseMimeType(extension),
            format,
            outerHTML,
            append,
            bundleMain
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
        const element = document.querySelector('html');
        const saveAs = options?.saveAs?.html;
        let file: Undef<string>;
        let format: Undef<string>;
        if (element) {
            file = element.dataset.chromeFile;
        }
        if (!isString(file) && saveAs) {
            file = fromLastIndexOf(saveAs.filename, '/');
            format = saveAs.format;
        }
        const data = parseUri(href, file, format);
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
        const saveAs = options?.saveAs?.script;
        const result: ChromeAsset[] = [];
        let bundleIndex = 0;
        document.querySelectorAll('script').forEach(element => {
            const src = element.src.trim();
            let file = element.dataset.chromeFile;
            if (file !== 'exclude') {
                let format: Undef<string>;
                let outerHTML: Undef<string>;
                if (!isString(file) && saveAs) {
                    file = saveAs.filename;
                    format = saveAs.format;
                    outerHTML = element.outerHTML;
                }
                let data: Undef<ChromeAsset>;
                if (src !== '') {
                    data = parseUri(resolvePath(src), file, format, outerHTML, bundleIndex);
                }
                else if (file && outerHTML) {
                    const content = element.innerHTML.trim();
                    if (content) {
                        const [moveTo, pathname, filename] = getFilePath(file);
                        const index = iterateReverseArray(result, item => {
                            if ((item.moveTo === moveTo || !item.moveTo && !moveTo) && item.pathname === pathname && item.filename === filename) {
                                safeNestedArray(<StandardMap> item, 'trailingContent').push({ value: content, format });
                                return true;
                            }
                            return;
                        });
                        if (index !== Infinity) {
                            data = {
                                pathname,
                                filename,
                                moveTo,
                                content,
                                format,
                                outerHTML,
                                append: true,
                                bundleMain: true
                            };
                        }
                        else {
                            return;
                        }
                    }
                }
                if (this.validFile(data)) {
                    if (outerHTML) {
                        ++bundleIndex;
                    }
                    data.mimeType = element.type.trim() || data.uri && parseMimeType(data.uri) || 'text/javascript';
                    processExtensions.call(this, data, getExtensions(element), options);
                    result.push(data);
                }
            }
        });
        return result;
    }

    public getLinkAssets(options?: FileActionAttribute) {
        let rel: Undef<string>;
        let saveAs: Undef<SaveAsOptions>;
        if (options) {
            rel = options.rel;
            saveAs = options.saveAs?.link;
        }
        const result: ChromeAsset[] = [];
        let bundleIndex = 0;
        document.querySelectorAll(rel ? `link[rel="${rel}"]` : 'link').forEach((element: HTMLLinkElement) => {
            const href = element.href.trim();
            let file = element.dataset.chromeFile;
            if (file !== 'exclude' && href !== '') {
                let mimeType: string;
                switch (element.rel.trim()) {
                    case 'stylesheet':
                        mimeType = 'text/css';
                        break;
                    case 'icon':
                        mimeType = 'image/x-icon';
                        break;
                    default:
                        mimeType = element.type.trim() || parseMimeType(href);
                        break;
                }
                let format: Undef<string>;
                let outerHTML: Undef<string>;
                if (saveAs && !isString(file) && mimeType === 'text/css') {
                    file = saveAs.filename;
                    format = saveAs.format;
                    outerHTML = element.outerHTML;
                }
                const data = parseUri(resolvePath(href), file, format, outerHTML, bundleIndex);
                if (this.validFile(data)) {
                    data.mimeType = mimeType;
                    if (outerHTML) {
                        ++bundleIndex;
                    }
                    processExtensions.call(this, data, getExtensions(element), options);
                    result.push(data);
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
        const result = this.getHtmlPage(options).concat(this.getLinkAssets(options));
        if (options.saveAsWebPage) {
            result.forEach(item => {
                const mimeType = item.mimeType;
                switch (mimeType) {
                    case 'text/html':
                    case 'application/xhtml+xml':
                    case 'text/css':
                        item.mimeType = '@' + mimeType;
                        break;
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