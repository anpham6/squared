import { ChromeAsset, UserSettingsChrome } from './application';

type View = chrome.base.View;

declare function getElement(element: HTMLElement, cache?: boolean): Promise<View | null>;
declare function getElementById(value: string, cache?: boolean): Promise<View | null>;
declare function querySelector(value: string): Promise<View | null>;
declare function querySelectorAll(value: string): Promise<View[] | null>;

declare namespace base {
    interface Application<T extends View> extends squared.base.Application<T> {
        userSettings: UserSettingsChrome;
        readonly builtInExtensions: ObjectMap<Extension<T>>;
        readonly extensions: Extension<T>[];
    }

    class Application<T extends View> implements Application<T> {}

    interface Controller<T extends View> extends squared.base.Controller<T> {
        application: Application<T>;
        readonly elementMap: Map<Element, T>;
        readonly userSettings: UserSettingsChrome;
        cacheElementList(list: squared.base.NodeList<T>): void;
    }

    class Controller<T extends View> implements Controller<T> {}

    interface Resource<T extends View> extends squared.base.Resource<T> {
        application: Application<T>;
        readonly userSettings: UserSettingsChrome;
    }

    class Resource<T extends View> implements Resource<T> {}

    interface File<T extends View> extends squared.base.File<T> {
        resource: Resource<T>;
        application: Application<T>;
        readonly userSettings: UserSettingsChrome;
        getHtmlPage(name?: string): ChromeAsset[];
        getScriptAssets(): ChromeAsset[];
        getLinkAssets(): ChromeAsset[];
        getImageAssets(): ChromeAsset[];
        getFontAssets(): ChromeAsset[];
    }

    class File<T extends View> implements File<T> {}

    interface Extension<T extends View> extends squared.base.Extension<T> {
        application: Application<T>;
        processFile(data: ChromeAsset): boolean;
    }

    class Extension<T extends View> implements Extension<T> {
        constructor(name: string, framework: number, options?: ExternalData);
    }

    interface ExtensionManager<T extends View> extends squared.base.ExtensionManager<T> {}

    class ExtensionManager<T extends View> implements ExtensionManager<T> {}

    interface View extends squared.base.Node {}

    class View implements View {
        constructor(id: number, sessionId: string, element: Element, afterInit?: BindGeneric<View, void>);
    }
}

declare namespace extensions {
    namespace compress {
        class Brotli<T extends View> extends chrome.base.Extension<T> {}
        class Gzip<T extends View> extends chrome.base.Extension<T> {}
    }
}

declare namespace lib {
    namespace constant {
        const EXT_CHROME: {
            COMPRESS_BROTLI: string,
            COMPRESS_GZIP: string
        };
    }
}

export as namespace chrome;