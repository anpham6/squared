import { UserSettingsChrome } from '../src/@types/application';

declare global {
    namespace chrome.base {
        interface Controller<T extends View> extends squared.base.Controller<T> {
            readonly elementMap: Map<Element, T>;
            readonly userSettings: UserSettingsChrome;
            addElement(node: T): void;
            addElementList(list: squared.base.NodeList<T>): void;
        }

        class Controller<T extends View> implements Controller<T> {}
    }
}

export = chrome.base.Controller;