import { UserSettingsChrome } from './@types/application';

import Resource from './resource';
import View from './view';

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

    public afterCreateCache() {
        if (this.processing.node) {
            (<chrome.base.Controller<T>> this.controllerHandler).addElementList(this.processing.cache);
        }
    }

    get length() {
        return ASSETS.images.size + ASSETS.rawData.size + ASSETS.fonts.size;
    }
}