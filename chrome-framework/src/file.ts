import { RawAsset, FileAsset } from '../../src/base/@types/application';
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
            return { pathname: $util.convertWord(host) + (port ? '/' + port.substring(1) : '') + path.substring(0, origin.lastIndexOf('/')), filename: $util.fromLastIndexOf(path, '/') };
        }
    }
    return undefined;
}

export default class File<T extends View> extends squared.base.File<T> implements chrome.base.File<T> {
    public saveAllToDisk() {
        this.saveToDisk(
            <FileAsset[]> this.getImageAssets().concat(this.getFontAssets()),
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
            const { pathname, filename, base64, content } = data;
            if (pathname && filename) {
                result.push({ pathname, filename, uri });
            }
            else if (base64) {
                if (uri.startsWith('data:image') && data.filename) {
                    result.push({ pathname: 'base64', filename: data.filename, base64 });
                }
            }
            else if (content) {
                if (data.mimeType === 'image/svg+xml') {
                    result.push({ pathname: 'svg+xml', filename: data.filename, content });
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

    get userSettings() {
        return <UserSettingsChrome> this.resource.userSettings;
    }
}