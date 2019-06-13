import { ControllerSettings, UserSettings } from './@types/application';

import Application from './application';
import Node from './node';
import NodeList from './nodelist';

export default abstract class Controller<T extends Node> implements squared.base.Controller<T> {
    public abstract readonly localSettings: ControllerSettings;

    protected constructor(
        public application: Application<T>,
        public cache: NodeList<T>)
    {
    }

    public abstract init(): void;
    public abstract reset(): void;
    public abstract applyDefaultStyles(element: Element): void;
    public abstract includeElement(element: Element): boolean;
    public abstract sortInitialCache(cache: NodeList<T>): void;
    public abstract get userSettings(): UserSettings;
    public abstract get afterInsertNode(): BindGeneric<T, void>;

    public preventNodeCascade(element: Element) {
        return false;
    }

    get generateSessionId() {
        return new Date().getTime().toString();
    }
}