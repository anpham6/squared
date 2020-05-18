import * as squared from '../squared';

type View = base.View;

declare function getElement(element: HTMLElement, cache?: boolean): Promise<Null<View>>;
declare function getElementById(value: string, cache?: boolean): Promise<Null<View>>;
declare function querySelector(value: string): Promise<Null<View>>;
declare function querySelectorAll(value: string): Promise<Null<View>>;

declare interface ChromeFramework<T extends View> extends squared.base.AppFramework<T> {
    getElement: (element: HTMLElement, cache?: boolean) => Promise<Null<View>>;
    getElementById: (value: string, cache?: boolean) => Promise<Null<View>>;
    querySelector: (value: string) => Promise<Null<View>>;
    querySelectorAll: (value: string) => Promise<View[]>;
    saveAsWebPage: (filename?: string, options?: squared.base.FileArchivingOptions) => Promise<View[] | void>;
}

declare namespace base {
    class Application<T extends View> extends squared.base.Application<T> {
        userSettings: ChromeUserSettings;
        queryState: number;
        readonly builtInExtensions: ObjectMap<Extension<T>>;
        readonly extensions: Extension<T>[];
        createNode(options: NodeOptions): T;
    }

    class Controller<T extends View> extends squared.base.Controller<T> {
        application: Application<T>;
        get elementMap(): Map<Element, T>;
        get userSettings(): ChromeUserSettings;
        cacheElement(node: T): void;
        cacheElementList(list: squared.base.NodeList<T>): void;
    }

    class Resource<T extends View> extends squared.base.Resource<T> {
        application: Application<T>;
        get userSettings(): ChromeUserSettings;
    }

    class File<T extends View> extends squared.base.File<T> {
        static parseUri(uri: string, options?: UriOptions): Undef<ChromeAsset>;
        resource: Resource<T>;
        get application(): Application<T>;
        get userSettings(): ChromeUserSettings;
        get outputFileExclusions(): RegExp[];
        getHtmlPage(options?: FileActionAttribute): ChromeAsset[];
        getScriptAssets(options?: FileActionAttribute): ChromeAsset[];
        getLinkAssets(options?: FileActionAttribute): ChromeAsset[];
        getImageAssets(options?: FileActionAttribute): ChromeAsset[];
        getVideoAssets(options?: FileActionAttribute): ChromeAsset[];
        getAudioAssets(options?: FileActionAttribute): ChromeAsset[];
        getFontAssets(options?: FileActionAttribute): ChromeAsset[];
    }

    class Extension<T extends View> extends squared.base.Extension<T> {
        static getConvertOptions(name: string, options: ConvertOptions): Undef<string>;
        static getCompressOptions(name: string, options: CompressOptions): string;
        application: Application<T>;
        processFile(data: ChromeAsset, override?: boolean): boolean;
    }

    class ExtensionManager<T extends View> extends squared.base.ExtensionManager<T> {}

    class View extends squared.base.Node {
        constructor(id: number, sessionId: string, element: Element);
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