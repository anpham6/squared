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
            for (const uri of ASSETS.images.keys()) {
                let pathname: string | undefined;
                let filename: string | undefined;
                if (uri.startsWith(origin)) {
                    const length = origin.length;
                    filename = $util.fromLastIndexOf(uri, '/');
                    pathname = uri.substring(length, uri.lastIndexOf('/'));
                }
                else {
                    const match = $regex.COMPONENT.PROTOCOL.exec(uri);
                    if (match) {
                        const host = match[2];
                        const port = match[3];
                        const path = match[4];
                        filename = $util.fromLastIndexOf(path, '/');
                        pathname = $util.convertWord(host) + (port ? '/' + port.substring(1) : '') + path.substring(0, origin.lastIndexOf('/'));
                    }
                }
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
                        file.addAsset({ pathname: 'data_base64', filename: data.filename, base64 });
                    }
                }
                else if (content) {
                    if (data.mimeType === 'image/svg+xml') {
                        file.addAsset({ pathname: 'data_svg', filename: data.filename, content });
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
        return ASSETS.images.size + ASSETS.rawData.size;
    }
}