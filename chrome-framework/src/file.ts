import { FileAsset, RawAsset } from '../../src/base/@types/application';
import { UserSettingsChrome } from './@types/application';

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

function parseUri(value: string): Optional<RawAsset> | undefined {
    const origin = location.origin;
    if (value.startsWith(origin)) {
        return { pathname: value.substring(origin.length + 1, value.lastIndexOf('/')), filename: $util.fromLastIndexOf(value, '/') };
    }
    else {
        const match = $regex.COMPONENT.PROTOCOL.exec(value);
        if (match) {
            const host = match[2];
            const port = match[3];
            const path = match[4];
            return { pathname: $util.convertWord(host) + (port ? '/' + port.substring(1) : '') + path.substring(0, path.lastIndexOf('/')), filename: $util.fromLastIndexOf(path, '/') };
        }
    }
    return undefined;
}

export default class File<T extends View> extends squared.base.File<T> implements chrome.base.File<T> {
    public saveAllToDisk() {
        this.saveToDisk(
            <FileAsset[]> this.getImageAssets().concat(this.getFontAssets()).concat(this.getScriptAssets()).concat(this.getLinkAssets()).concat(this.getHtmlPage()),
            this.userSettings.outputArchiveName
        );
    }

    public getHtmlPage(name?: string) {
        const result: Optional<RawAsset>[] = [];
        const href = location.href;
        const data = <RawAsset> parseUri(href);
        if (data) {
            if (name) {
                data.filename = name;
            }
            else if (data.filename.indexOf('.') === -1) {
                data.pathname += '/' + data.filename;
                data.filename = 'index.html';
            }
            data.uri = href;
            this.checkBrotliCompatibility(data);
            result.push(data);
        }
        return result;
    }

    public getScriptAssets() {
        const result: Optional<RawAsset>[] = [];
        document.querySelectorAll('script').forEach(item => {
            const src = item.src;
            if (src) {
                const uri = $util.resolvePath(src);
                const data = <RawAsset> parseUri(uri);
                if (data) {
                    data.uri = uri;
                    this.checkBrotliCompatibility(data);
                    result.push(data);
                }
            }
        });
        return result;
    }

    public getLinkAssets(rel?: string) {
        const result: Optional<RawAsset>[] = [];
        document.querySelectorAll(rel ? `link[rel="${rel}"]` : 'link').forEach((item: HTMLLinkElement) => {
            const href = item.href;
            if (href) {
                const uri = $util.resolvePath(href);
                const data = <RawAsset> parseUri(uri);
                if (data) {
                    data.uri = uri;
                    this.checkBrotliCompatibility(data);
                    result.push(data);
                }
            }
        });
        return result;
    }

    public getImageAssets() {
        const result: Optional<RawAsset>[] = [];
        for (const uri of ASSETS.images.keys()) {
            const data = <RawAsset> parseUri(uri);
            if (data) {
                data.uri = uri;
                this.checkBrotliCompatibility(data);
                result.push(data);
            }
        }
        for (const [uri, rawData] of ASSETS.rawData) {
            const filename = rawData.filename;
            let data: Optional<RawAsset> | undefined;
            if (filename) {
                const { pathname, base64, content } = rawData;
                if (pathname) {
                    data = { pathname, filename, uri };
                }
                else if (base64) {
                    data = { pathname: 'base64', filename, base64 };
                }
                else if (content) {
                    const mimeType = rawData.mimeType;
                    if (mimeType) {
                        data = { pathname: mimeType, filename, content };
                    }
                }
                if (data) {
                    this.checkBrotliCompatibility(<RawAsset> data);
                    result.push(data);
                }
            }
        }
        document.querySelectorAll('img[srcset], picture > source[srcset]').forEach((element: HTMLImageElement) => {
            let srcset = element.srcset;
            const images: string[] = [];
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
                    if (data) {
                        data.uri = src;
                        result.push(data);
                    }
                }
            }
        });
        return result;
    }

    public getFontAssets() {
        const result: Optional<RawAsset>[] = [];
        for (const fonts of ASSETS.fonts.values()) {
            for (const font of fonts) {
                if (font.srcUrl) {
                    const data = <RawAsset> parseUri(font.srcUrl);
                    if (data) {
                        data.uri = font.srcUrl;
                        this.checkBrotliCompatibility(data);
                        result.push(data);
                    }
                }
            }
        }
        return result;
    }

    private checkBrotliCompatibility(data: RawAsset) {
        const { brotliCompressionQuality, brotliCompatibleExtensions } = this.userSettings;
        if (brotliCompressionQuality) {
            if (brotliCompatibleExtensions.includes($util.fromLastIndexOf(data.filename, '.').toLowerCase())) {
                data.brotliQuality = brotliCompressionQuality;
            }
        }
    }

    get userSettings() {
        return <UserSettingsChrome> this.resource.userSettings;
    }
}