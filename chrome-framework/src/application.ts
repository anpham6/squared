import { UserSettingsChrome } from './@types/application';

import Resource from './resource';
import View from './view';

const $dom = squared.lib.dom;

const ASSETS = Resource.ASSETS;

export default class Application<T extends chrome.base.View> extends squared.base.Application<T> implements chrome.base.Application<T> {
    public builtInExtensions: ObjectMap<chrome.base.Extension<T>> = {};
    public extensions: chrome.base.Extension<T>[] = [];
    public userSettings!: UserSettingsChrome;

    public insertNode(element: Element, parent?: T) {
        if ($dom.isPlainText(element)) {
            if (this.userSettings.excludePlainText) {
                return undefined;
            }
            this.controllerHandler.applyDefaultStyles(element);
        }
        const node = this.createNode(element, false);
        if (node.plainText && parent) {
            View.copyTextStyle(node, parent);
        }
        return node;
    }

    public afterCreateCache() {
        if (this.processing.node) {
            (<chrome.base.Controller<T>> this.controllerHandler).cacheElementList(this.processing.cache);
        }
    }

    get length() {
        return ASSETS.images.size + ASSETS.rawData.size + ASSETS.fonts.size;
    }
}