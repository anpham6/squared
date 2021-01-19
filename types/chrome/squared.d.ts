/* eslint no-shadow: "off" */

import * as squared from '../squared';

type Node = squared.base.Node;

declare namespace base {
    interface AppSession<T extends Node> extends squared.base.AppSession<T> {
        unusedStyles: Set<string>;
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
        static setElementData(element: Element, data: ElementAction): ElementAction;
        static parseUri(uri: string, options?: UriOptions): Null<ChromeAsset>;
        copyTo(pathname: string, options: FileCopyingOptions): FileActionResult;
        appendTo(pathname: string, options: FileArchivingOptions): FileActionResult;
        saveAs(filename: string, options: FileArchivingOptions): FileActionResult;
        getHtmlPage(options?: FileActionAttribute): ChromeAsset[];
        getScriptAssets(options?: FileActionAttribute): [ChromeAsset[], Undef<TemplateMap>];
        getLinkAssets(options?: FileActionAttribute): ChromeAsset[];
        getImageAssets(options?: FileActionAttribute): ChromeAsset[];
        getVideoAssets(options?: FileActionAttribute): ChromeAsset[];
        getAudioAssets(options?: FileActionAttribute): ChromeAsset[];
        getFontAssets(options?: FileActionAttribute): ChromeAsset[];
        get application(): Application<T>;
        get userSettings(): UserResourceSettings;
    }

    class Extension<T extends Node> extends squared.base.Extension<T> {
        processFile(data: ChromeAsset): boolean;
    }
}

export as namespace chrome;