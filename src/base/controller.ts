import type Application from './application';
import type Node from './node';
import type NodeList from './nodelist';

export default class Controller<T extends Node> implements squared.base.Controller<T> {
    public readonly localSettings: ControllerSettings = {
        mimeType: {
            font: '*',
            image: '*',
            audio: '*',
            video: '*'
        }
    };

    constructor(public readonly application: Application<T>) {}

    public init() {}
    public sortInitialCache(cache: NodeList<T>) {}
    public applyDefaultStyles(element: Element, sessionId: string) {}
    public reset() {}
    public includeElement(element: HTMLElement) { return true; }
    public preventNodeCascade(node: T) { return false; }

    get generateSessionId() {
        return Date.now() + '#' + this.application.session.active.size;
    }

    get afterInsertNode(): BindGeneric<T, void> {
        return (node: T) => {};
    }

    get userSettings() {
        return this.application.userSettings;
    }
}