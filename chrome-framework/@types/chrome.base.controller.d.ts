declare global {
    namespace chrome.base {
        interface Controller<T extends View> extends squared.base.Controller<T> {
            addElement(node: T): void;
            addElementList(list: squared.base.NodeList<T>): void;
            readonly elementMap: Map<Element, T>;
        }

        class Controller<T extends View> implements Controller<T> {
        }
    }
}

export = chrome.base.Controller;