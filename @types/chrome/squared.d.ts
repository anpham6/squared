import * as squared from '../squared';

type NodeElement = squared.base.NodeElement;

declare function getElement(element: HTMLElement, cache?: boolean): Promise<Null<NodeElement>>;
declare function getElementById(value: string, cache?: boolean): Promise<Null<NodeElement>>;
declare function querySelector(value: string): Promise<Null<NodeElement>>;
declare function querySelectorAll(value: string): Promise<Null<NodeElement>>;

declare interface ChromeFramework<T extends NodeElement> extends squared.base.AppFramework<T> {
    getElement: (element: HTMLElement, cache?: boolean) => Promise<Null<NodeElement>>;
    getElementById: (value: string, cache?: boolean) => Promise<Null<NodeElement>>;
    querySelector: (value: string) => Promise<Null<NodeElement>>;
    querySelectorAll: (value: string) => Promise<NodeElement[]>;
    saveAsWebPage: (filename?: string, options?: squared.base.FileArchivingOptions) => Promise<NodeElement[] | void>;
}

declare namespace base {
    class Application<T extends NodeElement> extends squared.base.Application<T> {
        userSettings: ChromeUserSettings;
        queryState: number;
        readonly builtInExtensions: ObjectMap<Extension<T>>;
        readonly extensions: Extension<T>[];
        createNode(options: CreateNodeOptions): T;
    }

    class Controller<T extends NodeElement> extends squared.base.Controller<T> {
        application: Application<T>;
        get elementMap(): Map<Element, T>;
        get userSettings(): ChromeUserSettings;
        cacheElement(node: T): void;
        cacheElementList(list: squared.base.NodeList<T>): void;
    }

    class Resource<T extends NodeElement> extends squared.base.Resource<T> {
        application: Application<T>;
        get userSettings(): ChromeUserSettings;
    }

    class File<T extends NodeElement> extends squared.base.File<T> {
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

    class Extension<T extends NodeElement> extends squared.base.Extension<T> {
        static getConvertOptions(name: string, options: ConvertOptions): Undef<string>;
        static getCompressOptions(name: string, options: CompressOptions): string;
        application: Application<T>;
        processFile(data: ChromeAsset, override?: boolean): boolean;
    }
}

declare namespace extensions {
    namespace compress {
        class Brotli<T extends NodeElement> extends squared.base.Extension<T> {}
        class Gzip<T extends NodeElement> extends squared.base.Extension<T> {}
        class Jpeg<T extends NodeElement> extends squared.base.Extension<T> {}
        class Png<T extends NodeElement> extends squared.base.Extension<T> {}
    }
    namespace convert {
        class Bmp<T extends NodeElement> extends squared.base.Extension<T> {}
        class Gif<T extends NodeElement> extends squared.base.Extension<T> {}
        class Jpeg<T extends NodeElement> extends squared.base.Extension<T> {}
        class Png<T extends NodeElement> extends squared.base.Extension<T> {}
        class Tiff<T extends NodeElement> extends squared.base.Extension<T> {}
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