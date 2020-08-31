import type Extension from './extension';

export default class Application<T extends squared.base.Node> extends squared.base.Application<T> implements chrome.base.Application<T> {
    public userSettings!: IUserSettings;
    public builtInExtensions!: Map<string, Extension<T>>;
    public readonly session!: chrome.base.AppSession<T>;
    public readonly extensions: Extension<T>[] = [];
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