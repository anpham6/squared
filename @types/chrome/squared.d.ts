import { UserSettingsChrome } from './application';
import { ChromeAsset } from './file';

import * as squared from '../squared';

type View = base.View;

declare function getElement(element: HTMLElement, cache?: boolean): Promise<Null<View>>;
declare function getElementById(value: string, cache?: boolean): Promise<Null<View>>;
declare function querySelector(value: string): Promise<Null<View>>;
declare function querySelectorAll(value: string): Promise<Null<View>>;

declare namespace base {
    class Application<T extends View> extends squared.base.Application<T> {
        userSettings: UserSettingsChrome;
        queryState: number;
        readonly builtInExtensions: ObjectMap<Extension<T>>;
        readonly extensions: Extension<T>[];
    }

    class Controller<T extends View> extends squared.base.Controller<T> {
        application: Application<T>;
        readonly elementMap: Map<Element, T>;
        readonly userSettings: UserSettingsChrome;
        cacheElement(node: T): void;
        cacheElementList(list: squared.base.NodeList<T>): void;
    }

    class Resource<T extends View> extends squared.base.Resource<T> {
        application: Application<T>;
        readonly userSettings: UserSettingsChrome;
    }

    class File<T extends View> extends squared.base.File<T> {
        resource: Resource<T>;
        application: Application<T>;
        readonly userSettings: UserSettingsChrome;
        readonly outputFileExclusions: RegExp[];
        getHtmlPage(name?: string, ignoreExtensions?: boolean): ChromeAsset[];
        getScriptAssets(ignoreExtensions?: boolean): ChromeAsset[];
        getLinkAssets(rel?: string, ignoreExtensions?: boolean): ChromeAsset[];
        getImageAssets(ignoreExtensions?: boolean): ChromeAsset[];
        getVideoAssets(ignoreExtensions?: boolean): ChromeAsset[];
        getAudioAssets(ignoreExtensions?: boolean): ChromeAsset[];
        getFontAssets(ignoreExtensions?: boolean): ChromeAsset[];
    }

    class Extension<T extends View> extends squared.base.Extension<T> {
        application: Application<T>;
        processFile(data: ChromeAsset): boolean;
    }

    class ExtensionManager<T extends View> extends squared.base.ExtensionManager<T> {}

    class View extends squared.base.Node {
        constructor(id: number, sessionId: string, element: Element, afterInit?: BindGeneric<View, void>);
    }
}

declare namespace extensions {
    namespace compress {
        class Brotli<T extends View> extends squared.base.Extension<T> {}
        class Gzip<T extends View> extends squared.base.Extension<T> {}
        class Jpeg<T extends View> extends squared.base.Extension<T> {}
        class Png<T extends View> extends squared.base.Extension<T> {}
    }
    namespace convert {
        class Bmp<T extends View> extends squared.base.Extension<T> {}
        class Gif<T extends View> extends squared.base.Extension<T> {}
        class Jpeg<T extends View> extends squared.base.Extension<T> {}
        class Png<T extends View> extends squared.base.Extension<T> {}
        class Tiff<T extends View> extends squared.base.Extension<T> {}
    }
}

declare namespace lib {
    namespace constant {
        const EXT_CHROME: {
            COMPRESS_BROTLI: string;
            COMPRESS_GZIP: string;
        };
    }
}

export as namespace chrome;