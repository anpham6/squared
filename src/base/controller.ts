export default abstract class Controller<T extends squared.base.Node> implements squared.base.Controller<T> {
    public sessionId!: string;
    public abstract application: squared.base.Application<T>;
    public abstract cache: squared.base.NodeList<T>;
    public abstract readonly localSettings: ControllerSettings;

    public init() {}
    public sortInitialCache() {}
    public applyDefaultStyles(element: Element) {}
    public reset() {}

    public includeElement(element: Element) {
        return true;
    }

    public preventNodeCascade(node: T) {
        return false;
    }

    get generateSessionId() {
        return Date.now().toString() + '-' + this.application.session.active.length;
    }

    get afterInsertNode(): BindGeneric<T, void> {
        return (node: T) => {};
    }

    get userSettings() {
        return this.application.userSettings;
    }
}