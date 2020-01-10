import { ControllerSettings } from '../../@types/base/application';

import View from './view';

const $lib = squared.lib;
const { isTextNode } = $lib.dom;
const { setElementCache } = $lib.session;

export default class Controller<T extends View> extends squared.base.Controller<T> implements chrome.base.Controller<T> {
    public afterInsertNode?: BindGeneric<T, void>;
    public readonly localSettings: ControllerSettings = {
        supported: {
            fontFormat: '*',
            imageFormat: '*'
        }
    };

    private _elementMap = new Map<Element, T>();

    constructor(
        public readonly application: chrome.base.Application<T>,
        public readonly cache: squared.base.NodeList<T>)
    {
        super();
    }

    public init() {}
    public sortInitialCache() {}

    public reset() {
        this._elementMap.clear();
    }

    public applyDefaultStyles(element: Element) {
        if (isTextNode(element)) {
            setElementCache(element, 'styleMap', this.sessionId, {
                position: 'static',
                display: 'inline',
                verticalAlign: 'baseline',
                float: 'none',
                clear: 'none'
            });
        }
    }

    public includeElement() {
        return true;
    }

    public cacheElementList(list: squared.base.NodeList<T>) {
        const elementMap = this._elementMap;
        for (const node of list) {
            elementMap.set(<Element> node.element, node);
        }
    }

    get elementMap() {
        return this._elementMap;
    }

    get userSettings() {
        return this.application.userSettings;
    }
}