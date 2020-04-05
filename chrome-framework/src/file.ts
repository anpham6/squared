import type { FileAsset, FileArchivingOptions, FileCopyingOptions } from '../../@types/base/application';
import type { ChromeAsset } from '../../@types/chrome/application';

import Resource from './resource';

type View = chrome.base.View;

const $lib = squared.lib;

const { COMPONENT, FILE } = $lib.regex;
const { appendSeparator, convertWord, fromLastIndexOf, parseMimeType, resolvePath, spliceString, trimEnd } = $lib.util;

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

function convertFileMatch(value: string) {
    value = value.trim()
        .replace(/([.|/\\{}()?])/g, (match, ...capture) => '\\' + capture[0])
        .replace(/\*/g, '.*?');
    return new RegExp(`${value}$`);
}

function processExtensions(this: chrome.base.File<View>, data: ChromeAsset) {
    for (const ext of this.application.extensions) {
        ext.processFile(data);
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
        this.copying({
            ...options,
            assets: <FileAsset[]> this.getAssetsAll().concat(options?.assets || []),
            directory
        });
    }

    public appendToArchive(pathname: string, options?: FileArchivingOptions) {
        this.archiving({
            filename: this.userSettings.outputArchiveName,
            ...options,
            assets: <FileAsset[]> this.getAssetsAll().concat(options?.assets || []),
            appendTo: pathname
        });
    }

    public saveToArchive(filename: string, options?: FileArchivingOptions) {
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
        for (const uri of ASSETS.images.keys()) {
            const data = <ChromeAsset> parseUri(uri);
            if (this.validFile(data)) {
                data.uri = uri;
                processExtensions.bind(this, data)();
                result.push(data);
            }
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
            for (const src of images) {
                if (COMPONENT.PROTOCOL.test(src) && result.findIndex(item => item.uri === src) === -1) {
                    const data = parseUri(src);
                    if (this.validFile(data)) {
                        data.uri = src;
                        result.push(data);
                    }
                }
            }
        });
        if (this.userSettings.compressImages) {
            for (const asset of result) {
                if (Resource.canCompressImage(asset.filename)) {
                    let compress = asset.compress;
                    if (compress === undefined) {
                        compress = [];
                        asset.compress = compress;
                    }
                    compress.unshift({ format: 'png' });
                }
            }
        }
        return result;
    }

    public getFontAssets() {
        const result: ChromeAsset[] = [];
        for (const fonts of ASSETS.fonts.values()) {
            for (const font of fonts) {
                const url = font.srcUrl;
                if (url) {
                    const data = parseUri(url);
                    if (this.validFile(data)) {
                        data.uri = url;
                        processExtensions.bind(this, data)();
                        result.push(data);
                    }
                }
            }
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

    protected getAssetsAll() {
        return this.getHtmlPage()
            .concat(this.getScriptAssets())
            .concat(this.getLinkAssets())
            .concat(this.getImageAssets())
            .concat(this.getFontAssets());
    }

    get outputFileExclusions() {
        let result = this._outputFileExclusions;
        if (result === undefined) {
            const exclusions: RegExp[] = [];
            for (const value of this.userSettings.outputFileExclusions) {
                exclusions.push(convertFileMatch(value));
            }
            result = exclusions;
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