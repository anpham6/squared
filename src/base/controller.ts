export default abstract class Controller<T extends squared.base.Node> implements squared.base.Controller<T> {
    public abstract application: squared.base.Application<T>;

    public readonly localSettings: ControllerSettings = {
        mimeType: {
            font: '*',
            image: '*',
            audio: '*',
            video: '*'
        }
    };

    public init() {}
    public sortInitialCache(cache: squared.base.NodeList<T>) {}
    public applyDefaultStyles(element: Element, sessionId: string) {}
    public reset() {}

    public includeElement(element: Element) {
        return true;
    }

    public preventNodeCascade(node: T) {
        return false;
    }

    get generateSessionId() {
        return Date.now().toString() + '-' + this.application.session.active.size;
    }

    get afterInsertNode(): BindGeneric<T, void> {
        return (node: T) => {};
    }

    get userSettings() {
        return this.application.userSettings;
    }
}