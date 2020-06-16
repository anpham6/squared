import Resource from './resource';

import { APP_QUERYSTATE } from './lib/enumeration';

export default class Application<T extends squared.base.NodeElement> extends squared.base.Application<T> implements chrome.base.Application<T> {
    public builtInExtensions: ObjectMap<chrome.base.Extension<T>> = {};
    public extensions: chrome.base.Extension<T>[] = [];
    public queryState = 0;
    public userSettings!: ChromeUserSettings;
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