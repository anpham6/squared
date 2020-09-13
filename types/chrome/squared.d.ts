import * as squared from '../squared';

type Node = squared.base.Node;

declare interface ChromeFramework<T extends Node> extends squared.base.AppFramework<T> {
    saveAsWebPage: (filename?: string, options?: squared.base.FileArchivingOptions) => Promise<Node>;
}

declare namespace base {
    const enum EXT_CHROME {
        COMPRESS_BROTLI = 'chrome.compress.brotli',
        COMPRESS_GZIP = 'chrome.compress.gzip',
        COMPRESS_JPEG = 'chrome.compress.jpeg',
        COMPRESS_PNG = 'chrome.compress.png',
        CONVERT_BMP = 'chrome.convert.bmp',
        CONVERT_GIF = 'chrome.convert.gif',
        CONVERT_JPEG = 'chrome.convert.jpeg',
        CONVERT_PNG = 'chrome.convert.png',
        CONVERT_TIFF = 'chrome.convert.tiff'
    }

    interface AppSession<T extends Node> extends squared.base.AppSession<T> {
        transpileMap: { html: ObjectMap<StringMap>; js: ObjectMap<StringMap>; css: ObjectMap<StringMap> };
    }

    class Application<T extends Node> extends squared.base.Application<T> {
        userSettings: UserResourceSettings;
        builtInExtensions: Map<string, Extension<T>>;
        readonly session: AppSession<T>;
        readonly extensions: Extension<T>[];
        createNode(sessionId: string, options: CreateNodeOptions): T;
    }

    class Controller<T extends Node> extends squared.base.Controller<T> {}

    class Resource<T extends Node> extends squared.base.Resource<T> {}

    class File<T extends Node> extends squared.base.File<T> {
        static parseUri(uri: string, options?: UriOptions): Null<ChromeAsset>;
        getHtmlPage(options?: FileActionAttribute): ChromeAsset[];
        getScriptAssets(options?: FileActionAttribute): ChromeAsset[];
        getLinkAssets(options?: FileActionAttribute): ChromeAsset[];
        getImageAssets(options?: FileActionAttribute): ChromeAsset[];
        getVideoAssets(options?: FileActionAttribute): ChromeAsset[];
        getAudioAssets(options?: FileActionAttribute): ChromeAsset[];
        getFontAssets(options?: FileActionAttribute): ChromeAsset[];
        get application(): Application<T>;
        get userSettings(): UserResourceSettings;
        get outputFileExclusions(): RegExp[];
    }

    class Extension<T extends Node> extends squared.base.Extension<T> {
        static getConvertOptions(name: string, options: ConvertOptions): Undef<string>;
        static getCompressOptions(name: string, options: CompressOptions): string;
        processFile(data: ChromeAsset, override?: boolean): boolean;
    }
}

declare namespace extensions {
    namespace compress {
        class Brotli<T extends Node> extends squared.base.Extension<T> {}
        class Gzip<T extends Node> extends squared.base.Extension<T> {}
        class Jpeg<T extends Node> extends squared.base.Extension<T> {}
        class Png<T extends Node> extends squared.base.Extension<T> {}
    }
    namespace convert {
        class Bmp<T extends Node> extends squared.base.Extension<T> {}
        class Gif<T extends Node> extends squared.base.Extension<T> {}
        class Jpeg<T extends Node> extends squared.base.Extension<T> {}
        class Png<T extends Node> extends squared.base.Extension<T> {}
        class Tiff<T extends Node> extends squared.base.Extension<T> {}
    }
}

export as namespace chrome;