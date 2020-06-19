export default class Application<T extends squared.base.NodeElement> extends squared.base.Application<T> implements chrome.base.Application<T> {
    public userSettings!: ChromeUserSettings;
    public readonly builtInExtensions: ObjectMap<chrome.base.Extension<T>> = {};
    public readonly extensions: chrome.base.Extension<T>[] = [];
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
        return new this.Node(this.nextId, sessionId, element);
    }

    public afterCreateCache(node: T) {
        if (this.userSettings.createElementMap) {
            this.controllerHandler.cacheElementList(this.getProcessingCache(node.sessionId));
        }
    }
}