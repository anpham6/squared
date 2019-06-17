import { FileAsset, RawAsset } from '../../src/base/@types/application';
import { UserSettingsChrome } from './@types/application';

import Resource from './resource';
import View from './view';

const {
    regex: $regex,
    util: $util
} = squared.lib;

const ASSETS = Resource.ASSETS;

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
            <FileAsset[]> this.getImageAssets().concat(this.getFontAssets()).concat(this.getScriptAssets()).concat(this.getLinkAssets()),
            this.userSettings.outputArchiveName
        );
    }

    public getImageAssets() {
        const result: Optional<RawAsset>[] = [];
        for (const uri of ASSETS.images.keys()) {
            const data = parseUri(uri);
            if (data) {
                data.uri = uri;
                result.push(data);
            }
        }
        for (const [uri, data] of ASSETS.rawData) {
            const filename = data.filename;
            if (filename) {
                const { pathname, base64, content } = data;
                if (pathname) {
                    result.push({ pathname, filename, uri });
                }
                else if (base64) {
                    result.push({ pathname: 'base64', filename, base64 });
                }
                else if (content) {
                    const mimeType = data.mimeType;
                    if (mimeType) {
                        result.push({ pathname: mimeType, filename, content });
                    }
                }
            }
        }
        return result;
    }

    public getFontAssets() {
        const result: Optional<RawAsset>[] = [];
        for (const fonts of ASSETS.fonts.values()) {
            for (const font of fonts) {
                if (font.srcUrl) {
                    const data = parseUri(font.srcUrl);
                    if (data) {
                        data.uri = font.srcUrl;
                        result.push(data);
                    }
                }
            }
        }
        return result;
    }

    public getScriptAssets() {
        const result: Optional<RawAsset>[] = [];
        document.querySelectorAll('script').forEach(item => {
            const src = item.src;
            if (src) {
                const uri = $util.resolvePath(src);
                const data = parseUri(uri);
                if (data) {
                    data.uri = uri;
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
                const data = parseUri(uri);
                if (data) {
                    data.uri = uri;
                    result.push(data);
                }
            }
        });
        return result;
    }

    get userSettings() {
        return <UserSettingsChrome> this.resource.userSettings;
    }
}