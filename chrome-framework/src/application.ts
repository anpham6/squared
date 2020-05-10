import Resource from './resource';

import { APP_QUERYSTATE } from './lib/enumeration';

const { isTextNode } = squared.lib.dom;

export default class Application<T extends chrome.base.View> extends squared.base.Application<T> implements chrome.base.Application<T> {
    public builtInExtensions: ObjectMap<chrome.base.Extension<T>> = {};
    public extensions: chrome.base.Extension<T>[] = [];
    public systemName = 'chrome';
    public queryState = 0;
    public userSettings!: ChromeUserSettings;

    public finalize() {}

    public createNode(options: NodeOptions) {
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

    public afterCreateCache(node: T) {
        switch (this.queryState) {
            case APP_QUERYSTATE.SINGLE:
                (this.controllerHandler as chrome.base.Controller<T>).cacheElement(node);
                break;
            default:
                (this.controllerHandler as chrome.base.Controller<T>).cacheElementList(this.processing.cache);
                break;
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