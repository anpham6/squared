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

function parseUri(uri: string): Undef<ChromeAsset> {
    const value = trimEnd(uri, '/');
    const match = COMPONENT.PROTOCOL.exec(value);
    if (match) {
        let pathname = '';
        let filename = '';
        let rootDir = '';
        let moveTo: Undef<string>;
        let local: Undef<boolean>;
        const host = match[2];
        const port = match[3];
        const path = match[4];
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
        if (path && path !== '/') {
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
            assets: <FileAsset[]> this.getAssetsAll(options).concat(options?.assets || []),
            appendTo: pathname
        });
    }

    public saveToArchive(filename: string, options?: FileArchivingOptionsChrome) {
        this.archiving({
            ...options,
            assets: <FileAsset[]> this.getAssetsAll(options).concat(options?.assets || []),
            filename
        });
    }

    public getHtmlPage(name?: string, ignoreExtensions = false) {
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
                data.mimeType = parseMimeType('html');
                if (!ignoreExtensions) {
                    processExtensions.call(this, data);
                }
                result.push(data);
            }
        }
        return result;
    }

    public getScriptAssets(ignoreExtensions = false) {
        const result: ChromeAsset[] = [];
        document.querySelectorAll('script').forEach(element => {
            const src = element.src.trim();
            if (src !== '') {
                const uri = resolvePath(src);
                const data = parseUri(uri);
                if (this.validFile(data)) {
                    data.mimeType = element.type.trim() || parseMimeType(uri) || 'text/javascript';
                    if (!ignoreExtensions) {
                        processExtensions.call(this, data);
                    }
                    result.push(data);
                }
            }
        });
        return result;
    }

    public getLinkAssets(rel?: string, ignoreExtensions = false) {
        const result: ChromeAsset[] = [];
        document.querySelectorAll(rel ? `link[rel="${rel}"]` : 'link').forEach((element: HTMLLinkElement) => {
            const href = element.href.trim();
            if (href !== '') {
                const uri = resolvePath(href);
                const data = parseUri(uri);
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
                    if (!ignoreExtensions) {
                        processExtensions.call(this, data);
                    }
                    result.push(data);
                }
            }
        });
        return result;
    }

    public getImageAssets(ignoreExtensions = false) {
        const result: ChromeAsset[] = [];
        const processUri = (uri: string) => {
            if (uri !== '') {
                const data = <ChromeAsset> parseUri(uri);
                if (this.validFile(data)) {
                    if (!ignoreExtensions) {
                        processExtensions.call(this, data);
                    }
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
                    if (!ignoreExtensions) {
                        processExtensions.call(this, data);
                    }
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

    public getVideoAssets(ignoreExtensions = false) {
        return this.getRawAssets('video', ignoreExtensions);
    }

    public getAudioAssets(ignoreExtensions = false) {
        return this.getRawAssets('audio', ignoreExtensions);
    }

    public getFontAssets(ignoreExtensions = false) {
        const result: ChromeAsset[] = [];
        for (const fonts of ASSETS.fonts.values()) {
            fonts.forEach(font => {
                const url = font.srcUrl;
                if (url) {
                    const data = parseUri(url);
                    if (this.validFile(data)) {
                        if (!ignoreExtensions) {
                            processExtensions.call(this, data);
                        }
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

    protected getRawAssets(tagName: string, ignoreExtensions = false) {
        const result: ChromeAsset[] = [];
        document.querySelectorAll(tagName).forEach((element: HTMLVideoElement | HTMLAudioElement) => {
            const items = new Set<string>();
            resolveAssetSource(items, element.src);
            element.querySelectorAll('source').forEach((source: HTMLSourceElement) => resolveAssetSource(items, source.src));
            for (const uri of items) {
                const data = parseUri(uri);
                if (this.validFile(data)) {
                    if (!ignoreExtensions) {
                        processExtensions.call(this, data);
                    }
                    result.push(data);
                }
            }
        });
        return result;
    }

    protected getAssetsAll(options: FileArchivingOptionsChrome = {}) {
        const { name, rel } = options;
        const saveAsWebPage = options.saveAsWebPage === true;
        const result = this.getHtmlPage(name, saveAsWebPage).concat(this.getLinkAssets(rel, saveAsWebPage));
        if (saveAsWebPage) {
            result.forEach(item => {
                const mimeType = item.mimeType;
                switch (mimeType) {
                    case 'text/html':
                    case 'text/css':
                    case 'application/xhtml+xml':
                        item.mimeType = '@' + mimeType;
                        break;
                }
            });
        }
        return result.concat(this.getScriptAssets(saveAsWebPage))
            .concat(this.getImageAssets(saveAsWebPage))
            .concat(this.getVideoAssets(saveAsWebPage))
            .concat(this.getAudioAssets(saveAsWebPage))
            .concat(this.getFontAssets(saveAsWebPage));
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