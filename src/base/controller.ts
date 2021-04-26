import type Application from './application';
import type Node from './node';
import type NodeList from './nodelist';

const { padStart } = squared.lib.util;

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

    public init() {}
    public reset() {}
    public processUserSettings(processing: squared.base.AppProcessing<T>) {}
    public sortInitialCache(cache: NodeList<T>) {}
    public applyDefaultStyles(processing: squared.base.AppProcessing<T>, element: Element, pseudoElt?: PseudoElt) {}
    public includeElement(element: HTMLElement) { return true; }
    public preventNodeCascade(node: T) { return false; }
    public afterInsertNode(node: T, sessionId: string) {}

    get generateSessionId() {
        return padStart((++this._sessionId).toString(), 5, '0');
    }
}