import { ControllerSettings, UserSettings } from './@types/application';

export default abstract class Controller<T extends squared.base.Node> implements squared.base.Controller<T> {
    public abstract application: squared.base.Application<T>;
    public abstract cache: squared.base.NodeList<T>;
    public abstract readonly localSettings: ControllerSettings;

    public abstract init(): void;
    public abstract reset(): void;
    public abstract applyDefaultStyles(element: Element): void;
    public abstract includeElement(element: Element): boolean;
    public abstract sortInitialCache(cache: squared.base.NodeList<T>): void;

    public abstract get userSettings(): UserSettings;
    public abstract get afterInsertNode(): BindGeneric<T, void>;

    public preventNodeCascade(element: Element) {
        return false;
    }

    get generateSessionId() {
        return new Date().getTime().toString();
    }
}