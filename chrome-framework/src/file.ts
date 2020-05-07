import { FileAsset } from '../../@types/base/file';
import { FileActionOptions, FileArchivingOptions, FileCopyingOptions } from '../../@types/chrome/application';
import { FileActionAttribute, RequestAsset, SaveAsOptions, UriOptions } from '../../@types/chrome/file';

import Resource from './resource';

type View = chrome.base.View;
type BundleIndex = ObjectMap<RequestAsset[]>;

const $lib = squared.lib;

const { CHAR, COMPONENT, FILE, XML } = $lib.regex;
const { appendSeparator, convertWord, fromLastIndexOf, isString, iterateReverseArray, objectMap, parseMimeType, partitionLastIndexOf, randomUUID, resolvePath, safeNestedArray, trimEnd } = $lib.util;

const ASSETS = Resource.ASSETS;
const REGEX_SRCSET = /[\s\n]*(.+?\.[^\s,]+).*?,?/g;

function parseFileAs(attr: string, value: Undef<string>): [string, Undef<string>, boolean] | undefined {
    if (value) {
        const match = new RegExp(`${attr}:\\s*((?:[^"]|\\\\")+)`).exec(value.replace(/\\/g, '/'));
        if (match) {
            const segments = match[1].split('::').map(item => item.trim());
            return [segments[0], segments[1] || undefined, segments[2] === 'preserve'];
        }
    }
    return undefined;
}

function getFilePath(value: string): string[] {
    value = value.replace(/\\/g, '/');
    let moveTo: Undef<string>;
    if (value.charAt(0) === '/') {
        moveTo = '__serverroot__';
    }
    else if (value.startsWith('../')) {
        moveTo = '__serverroot__';
        const pathname = location.pathname.split('/');
        pathname.pop();
        for (let i = 0; i < value.length && pathname.length > 0; i += 3) {
            if (value.substring(i, i + 3) === '../') {
                pathname.pop();
            }
            else {
                break;
            }
        }
        value = pathname.join('/') + '/' + value.split('../').pop();
    }
    else if (value.startsWith('./')) {
        value = value.substring(2);
    }
    const result = partitionLastIndexOf(value, '/');
    result.unshift(moveTo as string);
    return result;
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
    if (element) {
        const dataset = element.dataset;
        const use = dataset.useChrome?.trim() || dataset.use?.trim();
        if (use) {
            return use.split(XML.SEPARATOR);
        }
    }
    return [];
}

function processExtensions(this: chrome.base.File<View>, data: RequestAsset, extensions: string[]) {
    const processed: chrome.base.Extension<View>[] = [];
    this.application.extensions.forEach(ext => {
        if (ext.processFile(data)) {
            processed.push(ext);
        }
    });
    for (const name of extensions) {
        const ext = <chrome.base.Extension<View>> this.application.extensionManager.retrieve(name, true);
        if (ext && !processed.includes(ext)) {
            ext.processFile(data, true);
        }
    }
}

function setBundleIndex(bundleIndex: BundleIndex) {
    for (const saveTo in bundleIndex) {
        const items = bundleIndex[saveTo];
        const length = items.length;
        if (length > 1) {
            let i = 0;
            while (i < length) {
                items[i].bundleIndex = i++;
            }
        }
    }
}

function createBundleAsset(bundles: RequestAsset[], element: HTMLElement, saveTo: string, format?: string, preserve?: boolean) {
    const content = element.innerHTML.trim();
    if (content) {
        const [moveTo, pathname, filename] = getFilePath(saveTo);
        const index = iterateReverseArray(bundles, item => {
            if ((item.moveTo === moveTo || !item.moveTo && !moveTo) && item.pathname === pathname && item.filename === filename) {
                safeNestedArray(<StandardMap> item, 'trailingContent').push({ value: content, format });
                return true;
            }
            return;
        });
        if (index !== Infinity) {
            return <RequestAsset> {
                uri: resolvePath(saveTo, location.href),
                pathname,
                filename,
                moveTo,
                content,
                format,
                preserve
            };
        }
    }
    return undefined;
}

export default class File<T extends chrome.base.View> extends squared.base.File<T> implements chrome.base.File<T> {
    public static parseUri(uri: string, options: UriOptions = {}): Undef<RequestAsset> {
        const { preserveCrossOrigin, saveTo } = options;
        let { saveAs, format, preserve } = options;
        let value = trimEnd(uri, '/');
        const local = value.startsWith(trimEnd(location.origin, '/'));
        if (!local && preserveCrossOrigin) {
            return undefined;
        }
        let relocate: Undef<string>;
        if (saveAs) {
            saveAs = trimEnd(saveAs.replace(/\\/g, '/'), '/');
            const data = parseFileAs('saveAs', saveAs);
            if (data) {
                [relocate, format, preserve] = data;
            }
            else {
                relocate = saveAs;
            }
            if (local && relocate) {
                value = resolvePath(relocate, location.href);
            }
        }
        const match = COMPONENT.PROTOCOL.exec(value);
        if (match) {
            const host = match[2], port = match[3], path = match[4];
            const extension = uri.includes('.') ? fromLastIndexOf(uri, '.').toLowerCase() : undefined;
            let pathname = '', filename = '';
            let rootDir: Undef<string>;
            let moveTo: Undef<string>;
            let prefix!: string;
            const getDirectory = (start: number) => path.substring(start, path.lastIndexOf('/'));
            if (!local) {
                if (saveTo && relocate) {
                    [moveTo, pathname, filename] = getFilePath(relocate + '/' + randomUUID() + (extension ? '.' + extension : ''));
                }
                else {
                    pathname = convertWord(host) + (port ? '/' + port.substring(1) : '') + '/';
                }
            }
            else {
                prefix = location.pathname.substring(0, location.pathname.lastIndexOf('/') + 1);
                let j = 0;
                const length = Math.min(path.length, prefix.length);
                for (let i = 0; i < length; ++i) {
                    if (path.charAt(i) === prefix.charAt(i)) {
                        j = i;
                    }
                    else {
                        break;
                    }
                }
                rootDir = path.substring(0, j + 1);
            }
            if (filename === '') {
                if (local && relocate) {
                    [moveTo, pathname, filename] = getFilePath(relocate);
                }
                else if (path && path !== '/') {
                    filename = fromLastIndexOf(path, '/', '\\');
                    if (local) {
                        if (path.startsWith(prefix)) {
                            pathname = getDirectory(prefix.length);
                        }
                        else {
                            moveTo = '__serverroot__';
                            rootDir = '';
                            pathname = getDirectory(0);
                        }
                    }
                    else {
                        pathname += getDirectory(1);
                    }
                }
                else {
                    filename = 'index.html';
                }
            }
            return {
                uri,
                rootDir,
                moveTo,
                pathname: pathname.replace(/\\/g, '/'),
                filename,
                mimeType: extension && parseMimeType(extension),
                format,
                preserve
            };
        }
        return undefined;
    }

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
        const result: RequestAsset[] = [];
        const href = location.href;
        const element = document.querySelector('html');
        const saveAs = options?.saveAs?.html;
        let file: Undef<string>;
        let format: Undef<string>;
        if (element) {
            file = element.dataset.chromeFile;
        }
        if (!isString(file) && saveAs?.filename) {
            file = fromLastIndexOf(saveAs.filename);
            format = saveAs.format;
        }
        const data = File.parseUri(href, { preserveCrossOrigin: options?.preserveCrossOrigin, saveAs: file, format });
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
                data.requestMain = true;
                data.mimeType = parseMimeType('html');
                processExtensions.call(this, data, getExtensions(document.querySelector('html')));
                result.push(data);
            }
        }
        return result;
    }

    public getScriptAssets(options?: FileActionAttribute) {
        let preserveCrossOrigin: Undef<boolean>;
        let saveAs: Undef<SaveAsOptions>;
        if (options) {
            preserveCrossOrigin = options.preserveCrossOrigin;
            saveAs = options.saveAs?.script;
        }
        const result: RequestAsset[] = [];
        const bundleIndex: BundleIndex = {};
        document.querySelectorAll('script').forEach(element => {
            const src = element.src.trim();
            let file = element.dataset.chromeFile;
            if (file !== 'exclude') {
                let format: Undef<string>;
                let outerHTML: Undef<string>;
                if (!isString(file) && saveAs) {
                    const { pathname, filename } = saveAs;
                    if (filename) {
                        file = appendSeparator(pathname || '', filename);
                        format = saveAs.format;
                        outerHTML = element.outerHTML;
                    }
                }
                let data: Undef<RequestAsset>;
                if (src !== '') {
                    data = File.parseUri(resolvePath(src), { preserveCrossOrigin, saveAs: file, format });
                }
                else if (isString(file)) {
                    if (!outerHTML) {
                        const command = parseFileAs('exportAs', file);
                        if (command) {
                            [file, format] = command;
                        }
                    }
                    if (file) {
                        data = createBundleAsset(result, element, file, format);
                    }
                }
                if (this.validFile(data)) {
                    safeNestedArray(bundleIndex, (data.moveTo || '') + data.pathname + data.filename).push(data);
                    data.mimeType = element.type.trim() || data.uri && parseMimeType(data.uri) || 'text/javascript';
                    if (outerHTML) {
                        data.outerHTML = outerHTML;
                    }
                    processExtensions.call(this, data, getExtensions(element));
                    result.push(data);
                }
            }
        });
        setBundleIndex(bundleIndex);
        return result;
    }

    public getLinkAssets(options?: FileActionAttribute) {
        let preserveCrossOrigin: Undef<boolean>;
        let saveAs: Undef<SaveAsOptions>;
        let rel: Undef<string>;
        if (options) {
            ({ rel, preserveCrossOrigin } = options);
            saveAs = options.saveAs?.link;
        }
        const result: RequestAsset[] = [];
        const bundleIndex: BundleIndex = {};
        document.querySelectorAll((rel ? `link[rel="${rel}"]` : 'link') + ', style').forEach((element: HTMLLinkElement | HTMLStyleElement) => {
            let file = element.dataset.chromeFile;
            if (file !== 'exclude') {
                let data: Undef<RequestAsset>;
                let mimeType: Undef<string>;
                let format: Undef<string>;
                let preserve: Undef<boolean>;
                let outerHTML: Undef<string>;
                if (!isString(file) && saveAs && (mimeType === 'text/css' || element instanceof HTMLStyleElement)) {
                    const { pathname, filename } = saveAs;
                    if (filename) {
                        file = appendSeparator(pathname || '', filename);
                        format = saveAs.format;
                        preserve = saveAs.preserve;
                        outerHTML = element.outerHTML;
                    }
                }
                if (element instanceof HTMLLinkElement) {
                    const href = element.href.trim();
                    if (href !== '') {
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
                        data = File.parseUri(resolvePath(href), { preserveCrossOrigin, saveAs: file, format, preserve });
                    }
                }
                else if (isString(file)) {
                    if (!outerHTML) {
                        const command = parseFileAs('exportAs', file);
                        if (command) {
                            [file, format, preserve] = command;
                        }
                    }
                    if (file) {
                        data = createBundleAsset(result, element, file, format, preserve);
                    }
                }
                if (this.validFile(data)) {
                    safeNestedArray(bundleIndex, (data.moveTo || '') + data.pathname + data.filename).push(data);
                    data.mimeType = mimeType || 'text/css';
                    if (outerHTML) {
                        data.outerHTML = outerHTML;
                    }
                    processExtensions.call(this, data, getExtensions(element));
                    result.push(data);
                }
            }
        });
        for (const [uri, rawData] of ASSETS.rawData.entries()) {
            const mimeType = rawData.mimeType;
            if (mimeType === 'text/css') {
                const data = File.parseUri(resolvePath(uri), { preserveCrossOrigin, format: saveAs?.format });
                if (this.validFile(data)) {
                    data.mimeType = mimeType;
                    processExtensions.call(this, data, []);
                    result.push(data);
                }
            }
        }
        setBundleIndex(bundleIndex);
        return result;
    }

    public getImageAssets(options?: FileActionAttribute) {
        let preserveCrossOrigin: Undef<boolean>;
        let saveAs: Undef<SaveAsOptions>;
        if (options) {
            preserveCrossOrigin = options.preserveCrossOrigin;
            saveAs = options.saveAs?.base64;
        }
        const result: RequestAsset[] = [];
        const processUri = (element: Null<HTMLElement>, uri: string, mimeType?: string) => {
            if (uri !== '') {
                let file: Undef<string>;
                if (element) {
                    const saveTo = parseFileAs('saveTo', element.dataset.chromeFile);
                    if (saveTo) {
                        [file, mimeType] = saveTo;
                    }
                }
                const data = File.parseUri(uri, { preserveCrossOrigin, saveAs: file, saveTo: true });
                if (this.validFile(data) && !result.find(item => item.uri === uri)) {
                    if (mimeType) {
                        data.mimeType = file ? mimeType + ':' + data.mimeType : mimeType;
                    }
                    processExtensions.call(this, data, getExtensions(element));
                    result.push(data);
                    return data;
                }
            }
            return undefined;
        };
        document.querySelectorAll('video').forEach((source: HTMLVideoElement) => processUri(null, resolvePath(source.poster)));
        document.querySelectorAll('picture > source').forEach((source: HTMLSourceElement) => source.srcset.split(XML.SEPARATOR).forEach(uri => processUri(source, resolvePath(uri.split(CHAR.SPACE)[0]))));
        document.querySelectorAll('img, input[type=image]').forEach((image: HTMLImageElement) => {
            const src = image.src.trim();
            if (!src.startsWith('data:image/')) {
                processUri(image, resolvePath(src));
            }
        });
        document.querySelectorAll('img[srcset], picture > source[srcset]').forEach((element: HTMLImageElement) => {
            REGEX_SRCSET.lastIndex = 0;
            let match: Null<RegExpExecArray>;
            while ((match = REGEX_SRCSET.exec(element.srcset.trim())) !== null) {
                processUri(element, resolvePath(match[1]));
            }
        });
        for (const uri of ASSETS.image.keys()) {
            processUri(null, uri);
        }
        for (const rawData of ASSETS.rawData.values()) {
            if (rawData.pathname) {
                continue;
            }
            else {
                const { base64, content, filename } = rawData;
                let mimeType = rawData.mimeType;
                let data: Undef<RequestAsset>;
                if (base64) {
                    if (saveAs) {
                        const format = saveAs.format;
                        if (format && mimeType?.startsWith('image/')) {
                            switch (format) {
                                case 'png':
                                case 'jpeg':
                                case 'bmp':
                                case 'gif':
                                case 'tiff':
                                    mimeType = `@${format}:${mimeType}`;
                                    break;
                            }
                        }
                        const pathname = trimEnd(saveAs.pathname || '', '/').replace(/\\/g, '/');
                        data = processUri(
                            null,
                            resolvePath(getFilePath(pathname + (pathname !== '' ? '/' : '') + filename)[1] + filename, location.href),
                            mimeType
                        );
                        if (data) {
                            data.base64 = base64;
                            continue;
                        }
                    }
                    data = { pathname: '__generated__/base64', filename, mimeType, base64 };
                }
                else if (content && mimeType) {
                    data = { pathname: `__generated__/${mimeType.split('/').pop()}`, filename, content };
                }
                else {
                    continue;
                }
                if (this.validFile(data)) {
                    data.mimeType = mimeType;
                    processExtensions.call(this, data, []);
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
        const preserveCrossOrigin = options?.preserveCrossOrigin;
        const result: RequestAsset[] = [];
        for (const fonts of ASSETS.fonts.values()) {
            fonts.forEach(font => {
                const url = font.srcUrl;
                if (url) {
                    const data = File.parseUri(url, { preserveCrossOrigin });
                    if (this.validFile(data)) {
                        processExtensions.call(this, data, []);
                        result.push(data);
                    }
                }
            });
        }
        return result;
    }

    public getDataMap(options: FileActionOptions) {
        if (options.removeUnusedStyles) {
            return { unusedStyles: Array.from(this.application.processing.unusedStyles) };
        }
        return undefined;
    }

    public getCopyQueryParameters(options: FileCopyingOptions) {
        return options.productionRelease ? '&release=1' : '';
    }

    public getArchiveQueryParameters(options: FileArchivingOptions) {
        return options.productionRelease ? '&release=1' : '';
    }

    protected validFile(data: Undef<RequestAsset>): data is RequestAsset {
        if (data) {
            const fullpath = data.pathname + '/' + data.filename;
            return !this.outputFileExclusions.some(pattern => pattern.test(fullpath));
        }
        return false;
    }

    protected getRawAssets(tagName: string, options?: FileActionAttribute) {
        const preserveCrossOrigin = options?.preserveCrossOrigin;
        const result: RequestAsset[] = [];
        document.querySelectorAll(tagName).forEach((element: HTMLVideoElement | HTMLAudioElement) => {
            const items = new Map<HTMLElement, string>();
            resolveAssetSource(items, element);
            element.querySelectorAll('source').forEach((source: HTMLSourceElement) => resolveAssetSource(items, source));
            for (const [item, uri] of items.entries()) {
                const data = File.parseUri(uri, { preserveCrossOrigin });
                if (this.validFile(data)) {
                    processExtensions.call(this, data, getExtensions(item));
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