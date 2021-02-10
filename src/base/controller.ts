import type Application from './application';
import type Node from './node';
import type NodeList from './nodelist';

export default class Controller<T extends Node> implements squared.base.Controller<T> {
    public static readonly KEY_NAME = 'squared.base.controller';
    public readonly localSettings: ControllerSettings = {
        mimeType: {
            font: '*',
            image: '*',
            audio: '*',
            video: '*'
        }
    };

    private _sessionId = 0;

    constructor(public readonly application: Application<T>) {}

    public init(resourceId: number) {}
    public sortInitialCache(cache: NodeList<T>) {}
    public applyDefaultStyles(processing: squared.base.AppProcessing<T>, element: Element, pseudoElt?: PseudoElt) {}
    public reset() {}
    public includeElement(element: HTMLElement) { return true; }
    public preventNodeCascade(node: T) { return false; }

    get generateSessionId() {
        return (++this._sessionId).toString().padStart(5, '0');
    }

    get afterInsertNode(): BindGeneric<T, void> {
        return (node: T) => {};
    }

    get userSettings() {
        return this.application.userSettings;
    }
}