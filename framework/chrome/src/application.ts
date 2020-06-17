import Resource from './resource';

import { APP_QUERYSTATE } from './lib/enumeration';

export default class Application<T extends squared.base.NodeElement> extends squared.base.Application<T> implements chrome.base.Application<T> {
    public queryState = 0;
    public builtInExtensions: ObjectMap<chrome.base.Extension<T>> = {};
    public extensions: chrome.base.Extension<T>[] = [];
    public userSettings!: ChromeUserSettings;
    public readonly controllerHandler!: chrome.base.Controller<T>;
    public readonly resourceHandler!: chrome.base.Resource<T>;
    public readonly systemName = 'chrome';

    public insertNode(element: Element, sessionId: string) {
        if (element.nodeName === '#text') {
            if (this.userSettings.excludePlainText) {
                return undefined;
            }
            this.controllerHandler.applyDefaultStyles(element, sessionId);
        }
        return super.createNode(sessionId, { element });
    }

    public afterCreateCache(node: T) {
        switch (this.queryState) {
            case APP_QUERYSTATE.SINGLE:
                (this.controllerHandler as chrome.base.Controller<T>).cacheElement(node);
                break;
            default:
                (this.controllerHandler as chrome.base.Controller<T>).cacheElementList(this.getProcessingCache(node.sessionId));
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