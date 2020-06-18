export default class Application<T extends squared.base.NodeElement> extends squared.base.Application<T> implements chrome.base.Application<T> {
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
        (this.controllerHandler as chrome.base.Controller<T>).cacheElementList(this.getProcessingCache(node.sessionId));
    }
}