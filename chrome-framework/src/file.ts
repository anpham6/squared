import { RawAsset, FileAsset } from '../../src/base/@types/application';
import { UserSettingsChrome } from './@types/application';

import Resource from './resource';
import View from './view';

const {
    regex: $regex,
    util: $util
} = squared.lib;

const ASSETS = Resource.ASSETS;

function parseUri(value: string) {
    const origin = location.origin + '/';
    if (value.startsWith(origin)) {
        return [value.substring(origin.length, value.lastIndexOf('/')), $util.fromLastIndexOf(value, '/')];
    }
    else {
        const match = $regex.COMPONENT.PROTOCOL.exec(value);
        if (match) {
            const host = match[2];
            const port = match[3];
            const path = match[4];
            return [$util.convertWord(host) + (port ? '/' + port.substring(1) : '') + path.substring(0, origin.lastIndexOf('/')), $util.fromLastIndexOf(path, '/')];
        }
    }
    return [];
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
            const [pathname, filename] = parseUri(uri);
            if (pathname && filename) {
                result.push({ pathname, filename, uri });
            }
        }
        for (const [uri, data] of ASSETS.rawData) {
            const { content, base64, pathname, filename } = data;
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
        for (const data of ASSETS.fonts.values()) {
            for (const font of data) {
                if (font.srcUrl) {
                    const [pathname, filename] = parseUri(font.srcUrl);
                    if (pathname && filename) {
                        result.push({ pathname, filename, uri: font.srcUrl });
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