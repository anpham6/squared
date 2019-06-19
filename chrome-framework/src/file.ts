import { FileAsset } from '../../src/base/@types/application';
import { ChromeAsset, UserSettingsChrome } from './@types/application';

import Resource from './resource';
import View from './view';

const {
    regex: $regex,
    util: $util
} = squared.lib;

const ASSETS = Resource.ASSETS;
const CACHE_PATTERN = {
    SRCSET: /\s*(.+?\.[^\s,]+).*?,\s*/,
    SRCSET_SPECIFIER: /\s+[0-9.][wx]$/
};

function parseUri(value: string): ChromeAsset | undefined {
    value = $util.trimEnd(value, '/');
    const match = $regex.COMPONENT.PROTOCOL.exec(value);
    let pathname = '';
    let filename = '';
    if (match) {
        const host = match[2];
        const port = match[3];
        const path = match[4];
        if (!value.startsWith($util.trimEnd(location.origin, '/'))) {
            pathname = $util.convertWord(host) + (port ? '/' + port.substring(1) : '');
        }
        if (path) {
            const index = path.lastIndexOf('/');
            if (index > 0) {
                pathname += path.substring(0, index);
                filename = $util.fromLastIndexOf(path, '/');
            }
        }
    }
    if (pathname !== '') {
        const extension = filename.indexOf('.') !== -1 ? $util.fromLastIndexOf(filename, '.').toLowerCase() : undefined;
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

export default class File<T extends View> extends squared.base.File<T> implements chrome.base.File<T> {
    private _outputFileExclusions?: RegExp[];

    public reset() {
        super.reset();
        this._outputFileExclusions = undefined;
    }

    public saveAllToDisk() {
        const files = this.getHtmlPage()
            .concat(this.getScriptAssets())
            .concat(this.getLinkAssets())
            .concat(this.getImageAssets())
            .concat(this.getFontAssets());
        this.saveToDisk(<FileAsset[]> files, this.userSettings.outputArchiveName);
    }

    public getHtmlPage(name?: string) {
        const result: ChromeAsset[] = [];
        const href = location.href;
        const data = parseUri(href);
        if (data) {
            if (name) {
                data.filename = name;
            }
            else if (data.filename.indexOf('.') === -1) {
                data.pathname += '/' + data.filename;
                data.filename = 'index.html';
            }
            if (this.validFile(data)) {
                data.uri = href;
                data.mimeType = File.getMimeType('html');
                this.checkCompressionCompatibility(data);
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
                const uri = $util.resolvePath(src);
                const data = parseUri(uri);
                if (this.validFile(data)) {
                    data.uri = uri;
                    if (element.type) {
                        data.mimeType = element.type;
                    }
                    this.checkCompressionCompatibility(data);
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
                const uri = $util.resolvePath(href);
                const data = parseUri(uri);
                if (this.validFile(data)) {
                    data.uri = uri;
                    this.checkCompressionCompatibility(data);
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
                this.checkCompressionCompatibility(data);
                result.push(data);
            }
        }
        for (const [uri, rawData] of ASSETS.rawData) {
            const filename = rawData.filename;
            if (filename) {
                const { pathname, base64, content, mimeType } = rawData;
                let data: ChromeAsset | undefined;
                if (pathname) {
                    data = { pathname, filename, uri };
                }
                else if (base64) {
                    data = { pathname: 'base64', filename, base64 };
                }
                else if (content && mimeType) {
                    data = { pathname: mimeType, filename, content };
                }
                if (this.validFile(data)) {
                    data.mimeType = rawData.mimeType;
                    this.checkCompressionCompatibility(data);
                    result.push(data);
                }
            }
        }
        document.querySelectorAll('img[srcset], picture > source[srcset]').forEach((element: HTMLImageElement) => {
            const images: string[] = [];
            let srcset = element.srcset.trim();
            let match: RegExpExecArray | null;
            while ((match = CACHE_PATTERN.SRCSET.exec(srcset)) !== null) {
                images.push($util.resolvePath(match[1]));
                srcset = $util.spliceString(srcset, match.index, match[0].length);
            }
            srcset = srcset.trim();
            if (srcset !== '') {
                images.push($util.resolvePath(srcset.replace(CACHE_PATTERN.SRCSET_SPECIFIER, '')));
            }
            for (const src of images) {
                if ($regex.COMPONENT.PROTOCOL.test(src) && result.findIndex(item => item.uri === src) === -1) {
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
                        this.checkCompressionCompatibility(data);
                        result.push(data);
                    }
                }
            }
        }
        return result;
    }

    private validFile(data: ChromeAsset | undefined): data is ChromeAsset {
        if (data) {
            const fullpath = data.pathname + '/' + data.filename;
            return !this.outputFileExclusions.some(pattern => pattern.test(fullpath));
        }
        return false;
    }

    private checkCompressionCompatibility(data: ChromeAsset) {
        if (data.extension) {
            const settings = this.userSettings;
            if (settings.compressFileExtensions.includes(data.extension)) {
                const { gzipCompressionQuality, brotliCompressionQuality } = settings;
                if (gzipCompressionQuality > 0) {
                    data.gzipQuality = gzipCompressionQuality;
                }
                if (brotliCompressionQuality > 0) {
                    data.brotliQuality = brotliCompressionQuality;
                }
            }
        }
    }

    get outputFileExclusions() {
        if (this._outputFileExclusions === undefined) {
            const exclusions: RegExp[] = [];
            for (const value of this.userSettings.outputFileExclusions) {
                exclusions.push(convertFileMatch(value));
            }
            this._outputFileExclusions = exclusions;
        }
        return this._outputFileExclusions;
    }

    get userSettings() {
        return <UserSettingsChrome> this.resource.userSettings;
    }
}