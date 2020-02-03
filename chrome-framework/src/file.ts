import { FileAsset } from '../../@types/base/application';
import { ChromeAsset } from '../../@types/chrome/application';

import Resource from './resource';

const $lib = squared.lib;

const { COMPONENT } = $lib.regex;
const { convertWord, fromLastIndexOf, resolvePath, spliceString, trimEnd } = $lib.util;

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
            mimeType: extension && File.getMimeType(extension)
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

export default class File<T extends chrome.base.View> extends squared.base.File<T> implements chrome.base.File<T> {
    public resource!: chrome.base.Resource<T>;

    private _outputFileExclusions?: RegExp[];

    public reset() {
        super.reset();
        this._outputFileExclusions = undefined;
    }

    public copyToDisk(directory: string, assets: FileAsset[] = [], callback?: CallbackResult) {
        this.copying(directory, assets.concat(<FileAsset[]> this.getAssetsAll()), callback);
    }

    public appendToArchive(pathname: string, assets: FileAsset[] = []) {
        this.archiving(this.userSettings.outputArchiveName, assets.concat(<FileAsset[]> this.getAssetsAll()), pathname);
    }

    public saveToArchive(filename: string) {
        this.archiving(filename, <FileAsset[]> this.getAssetsAll());
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
                if (!filename.includes('.')) {
                    data.pathname += '/' + filename;
                    data.filename = 'index.html';
                }
            }
            if (this.validFile(data)) {
                data.uri = href;
                data.mimeType = File.getMimeType('html');
                this.processExtensions(data);
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
                    if (element.type) {
                        data.mimeType = element.type;
                    }
                    this.processExtensions(data);
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
                    this.processExtensions(data);
                    result.push(data);
                }
            }
        });
        return result;
    }

    public getImageAssets() {
        const result: ChromeAsset[] = [];
        for (const uri of ASSETS.images.keys()) {
            const data = parseUri(uri);
            if (this.validFile(data)) {
                data.uri = uri;
                this.processExtensions(data);
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
                    data = { pathname: 'generated/' + mimeType, filename, content };
                }
                if (this.validFile(data)) {
                    data.mimeType = mimeType;
                    this.processExtensions(data);
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
                        this.processExtensions(data);
                        result.push(data);
                    }
                }
            }
        }
        return result;
    }

    private getAssetsAll() {
        return this.getHtmlPage()
            .concat(this.getScriptAssets())
            .concat(this.getLinkAssets())
            .concat(this.getImageAssets())
            .concat(this.getFontAssets());
    }

    private validFile(data: Undef<ChromeAsset>): data is ChromeAsset {
        if (data) {
            const fullpath = data.pathname + '/' + data.filename;
            return !this.outputFileExclusions.some(pattern => pattern.test(fullpath));
        }
        return false;
    }

    private processExtensions(data: ChromeAsset) {
        for (const ext of this.application.extensions) {
            ext.processFile(data);
        }
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