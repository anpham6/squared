import { NodeOptionsChrome, UserSettingsChrome } from '../../@types/chrome/application';

import Resource from './resource';

const { isTextNode } = squared.lib.dom;

export default class Application<T extends chrome.base.View> extends squared.base.Application<T> implements chrome.base.Application<T> {
    public builtInExtensions: ObjectMap<chrome.base.Extension<T>> = {};
    public extensions: chrome.base.Extension<T>[] = [];
    public userSettings!: UserSettingsChrome;

    public finalize() {}

    public createNode(options: NodeOptionsChrome) {
        return new this.Node(this.nextId, this.processing.sessionId, options.element);
    }

    public insertNode(element: Element, parent?: T) {
        if (isTextNode(element)) {
            if (this.userSettings.excludePlainText) {
                return undefined;
            }
            this.controllerHandler.applyDefaultStyles(element);
            const node = this.createNode({ element });
            if (parent) {
                node.cssApply(parent.textStyle);
            }
            return node;
        }
        return this.createNode({ element });
    }

    public afterCreateCache() {
        if (this.userSettings.cacheQuerySelectorResultSet) {
            (<chrome.base.Controller<T>> this.controllerHandler).cacheElementList(this.processing.cache);
        }
        else {
            (<chrome.base.Controller<T>> this.controllerHandler).cacheElement(this.processing.node as T);
        }
    }

    get length() {
        const assets = Resource.ASSETS;
        let result = 0;
        for (const name in assets) {
            result += assets[name].size;
        }
        return result;
    }
}