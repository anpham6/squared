import { ControllerSettings } from '../../src/base/@types/application';
import { UserSettingsChrome } from './@types/application';

import View from './view';

import $NodeList = squared.base.NodeList;

const $const = squared.lib.constant;
const $session = squared.lib.session;

export default class Controller<T extends View> extends squared.base.Controller<T> implements chrome.base.Controller<T> {
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
    public afterInsertNode?: BindGeneric<T, void>;

    private _elementMap = new Map<Element, T>();

    public init() {}
    public sortInitialCache() {}

    public reset() {
        this._elementMap.clear();
    }

    public evaluateNonStatic(documentRoot: T, cache: $NodeList<T>) {
        for (const node of cache) {
            if (!node.documentRoot) {
                let parent: T | undefined;
                switch (node.css('position')) {
                    case 'fixed':
                        parent = documentRoot;
                        break;
                    case 'absolute':
                        parent = node.absoluteParent as T;
                        break;
                }
                node.documentParent = parent || node.parent as T;
            }
        }
    }

    public applyDefaultStyles(element: Element) {
        if (element.nodeName === '#text') {
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

    public addElement(node: T) {
        this._elementMap.set(<Element> node.element, node);
    }

    public addElementList(list: squared.base.NodeList<T>) {
        for (const node of list) {
            this._elementMap.set(<Element> node.element, node);
        }
    }

    get elementMap() {
        return this._elementMap;
    }

    get userSettings() {
        return <UserSettingsChrome> this.application.userSettings;
    }
}