import { ControllerSettings } from '../../@types/base/application';

import View from './view';

const {
    constant: $const,
    dom: $dom,
    session: $session
} = squared.lib;

export default class Controller<T extends View> extends squared.base.Controller<T> implements chrome.base.Controller<T> {
    public afterInsertNode?: BindGeneric<T, void>;
    public readonly localSettings: ControllerSettings = {
        svg: {
            enabled: true
        },
        supported: {
            fontFormat: '*',
            imageFormat: '*'
        },
        unsupported: {
            cascade: new Set(),
            tagName: new Set(),
            excluded: new Set()
        }
    };

    private _elementMap = new Map<Element, T>();

    constructor(
        public application: chrome.base.Application<T>,
        public cache: squared.base.NodeList<T>)
    {
        super();
    }

    public init() {}
    public sortInitialCache() {}

    public reset() {
        this._elementMap.clear();
    }

    public applyDefaultStyles(element: Element) {
        if ($dom.isPlainText(element)) {
            $session.setElementCache(element, 'styleMap', this.application.processing.sessionId, {
                position: 'static',
                display: 'inline',
                verticalAlign: 'baseline',
                float: $const.CSS.NONE,
                clear: $const.CSS.NONE
            });
        }
    }

    public includeElement() {
        return true;
    }

    public cacheElement(node: T) {
        this._elementMap.set(<Element> node.element, node);
    }

    public cacheElementList(list: squared.base.NodeList<T>) {
        for (const node of list) {
            this._elementMap.set(<Element> node.element, node);
        }
    }

    get elementMap() {
        return this._elementMap;
    }

    get userSettings() {
        return this.application.userSettings;
    }
}