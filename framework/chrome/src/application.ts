export default class Application<T extends squared.base.Node> extends squared.base.Application<T> implements chrome.base.Application<T> {
    public userSettings!: ChromeUserSettings;
    public builtInExtensions!: Map<string, chrome.base.Extension<T>>;
    public readonly session!: chrome.base.ChromeAppSession<T>;
    public readonly extensions: chrome.base.Extension<T>[] = [];
    public readonly systemName = 'chrome';

    public init() {
        this.session.unusedStyles = new Set<string>();
        this.session.transpileMap = { html: {}, js: {}, css: {} };
    }

    public reset() {
        super.reset();
        this.session.unusedStyles!.clear();
    }

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