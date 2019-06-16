import { UserSettingsChrome } from './@types/application';

import Resource from './resource';
import View from './view';

const $regex = squared.lib.regex;
const $util = squared.lib.util;

const ASSETS = Resource.ASSETS;

export default class Application<T extends View> extends squared.base.Application<T> {
    public userSettings!: UserSettingsChrome;

    public insertNode(element: Element, parent?: T): T | undefined {
        if (element.nodeName === '#text') {
            if (this.userSettings.excludePlainText) {
                return undefined;
            }
            this.controllerHandler.applyDefaultStyles(element);
        }
        const node = this.createNode(element, false);
        if (node.plainText) {
            View.copyTextStyle(node, parent as T);
        }
        return node;
    }

    public saveAllToDisk() {
        const file = this.resourceHandler.fileHandler;
        if (file) {
            const origin = location.origin + '/';
            const length = origin.length;
            function parseUri(value: string) {
                if (value.startsWith(origin)) {
                    return [value.substring(length, value.lastIndexOf('/')), $util.fromLastIndexOf(value, '/')];
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
            for (const uri of ASSETS.images.keys()) {
                const [pathname, filename] = parseUri(uri);
                if (pathname && filename) {
                    file.addAsset({ pathname, filename, uri });
                }
            }
            for (const [uri, data] of ASSETS.rawData) {
                const { content, base64, pathname, filename } = data;
                if (pathname && filename) {
                    file.addAsset({ pathname, filename, uri });
                }
                else if (base64) {
                    if (uri.startsWith('data:image') && data.filename) {
                        file.addAsset({ pathname: 'base64', filename: data.filename, base64 });
                    }
                }
                else if (content) {
                    if (data.mimeType === 'image/svg+xml') {
                        file.addAsset({ pathname: 'svg+xml', filename: data.filename, content });
                    }
                }
            }
            for (const data of ASSETS.fonts.values()) {
                for (const font of data) {
                    if (font.srcUrl) {
                        const [pathname, filename] = parseUri(font.srcUrl);
                        if (pathname && filename) {
                            file.addAsset({ pathname, filename, uri: font.srcUrl });
                        }
                    }
                }
            }
            if (file.assets.length) {
                file.saveToDisk(file.assets, this.userSettings.outputArchiveName);
            }
        }
    }

    public afterCreateCache() {
        if (this.processing.node) {
            (<chrome.base.Controller<T>> this.controllerHandler).addElementList(this.processing.cache);
        }
    }

    get length() {
        return ASSETS.images.size + ASSETS.rawData.size + ASSETS.fonts.size;
    }
}