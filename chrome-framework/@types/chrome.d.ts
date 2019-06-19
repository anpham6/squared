import { ChromeAsset, UserSettingsChrome } from '../src/@types/application';

type View = chrome.base.View;

declare function getElement(element: HTMLElement, cache?: boolean): Promise<View | null>;
declare function getElementById(value: string, cache?: boolean): Promise<View | null>;
declare function querySelector(value: string): Promise<View | null>;
declare function querySelectorAll(value: string): Promise<View[] | null>;

declare namespace base {
    interface Controller<T extends View> extends squared.base.Controller<T> {
        readonly elementMap: Map<Element, T>;
        readonly userSettings: UserSettingsChrome;
        cacheElement(node: T): void;
        cacheElementList(list: squared.base.NodeList<T>): void;
    }

    class Controller<T extends View> implements Controller<T> {}

    interface Resource<T extends View> extends squared.base.Resource<T> {
        readonly userSettings: UserSettingsChrome;
    }

    class Resource<T extends View> implements Resource<T> {}

    interface File<T extends View> extends squared.base.File<T> {
        readonly userSettings: UserSettingsChrome;
        getHtmlPage(name?: string): ChromeAsset[];
        getScriptAssets(): ChromeAsset[];
        getLinkAssets(): ChromeAsset[];
        getImageAssets(): ChromeAsset[];
        getFontAssets(): ChromeAsset[];
    }

    class File<T extends View> implements File<T> {}

    interface View extends squared.base.Node {}

    class View implements View {
        constructor(id: number, sessionId: string, element: Element, afterInit?: BindGeneric<View, void>);
    }
}

export as namespace chrome;