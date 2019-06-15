import { UserSettingsChrome } from '../src/@types/application';

declare namespace base {
    interface Controller<T extends View> extends squared.base.Controller<T> {
        readonly elementMap: Map<Element, T>;
        readonly userSettings: UserSettingsChrome;
        addElement(node: T): void;
        addElementList(list: squared.base.NodeList<T>): void;
    }

    class Controller<T extends View> implements Controller<T> {}

    interface Resource<T extends View> extends squared.base.Resource<T> {
        readonly userSettings: UserSettingsChrome;
    }

    class Resource<T extends View> implements Resource<T> {}

    interface View extends squared.base.Node {
    }

    class View implements View {
        constructor(id: number, sessionId: string, element: Element);
    }
}

export as namespace chrome;