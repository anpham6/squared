export default class Application<T extends squared.base.Node> extends squared.base.Application<T> implements chrome.base.Application<T> {
    public userSettings!: ChromeUserSettings;
    public builtInExtensions!: Map<string, chrome.base.Extension<T>>;
    public readonly extensions: chrome.base.Extension<T>[] = [];
    public readonly controllerHandler!: chrome.base.Controller<T>;
    public readonly resourceHandler!: chrome.base.Resource<T>;
    public readonly systemName = 'chrome';

    public insertNode(element: Element, sessionId: string) {
        if (element.nodeName[0] === '#') {
            if (this.userSettings.excludePlainText) {
                return;
            }
            this.controllerHandler.applyDefaultStyles(element, sessionId);
        }
        return this.createNode(sessionId, { element });
    }
}