import { FileAsset } from '../../@types/base/file';
import { ChromeFramework } from '../../@types/chrome/internal';
import { UserSettingsChrome } from '../../@types/chrome/application';
import { FileCopyingOptionsChrome, FileArchivingOptionsChrome } from '../../@types/chrome/file';

import Application from './application';
import Controller from './controller';
import ExtensionManager from './extensionmanager';
import File from './file';
import Resource from './resource';
import View from './view';

import CompressBrotli from './extensions/compress/brotli';
import CompressGzip from './extensions/compress/gzip';

import SETTINGS from './settings';

import * as enumeration from './lib/enumeration';
import * as constant from './lib/constant';

type FileOptions = FileArchivingOptionsChrome | FileCopyingOptionsChrome;

const { flatArray, isString, isObject } = squared.lib.util;

const framework = squared.base.lib.enumeration.APP_FRAMEWORK.CHROME;
let initialized = false;
let application: Application<View>;
let controller: Controller<View>;
let file: Undef<File<View>>;
let userSettings: UserSettingsChrome;
let elementMap: Map<Element, View>;

function getCachedElement(element: HTMLElement, cache: boolean) {
    if (!cache) {
        elementMap.clear();
        return undefined;
    }
    return elementMap.get(element);
}

function findElement(element: HTMLElement, cache: boolean) {
    let result = getCachedElement(element, cache);
    if (result === undefined) {
        application.queryState = enumeration.APP_QUERYSTATE.SINGLE;
        application.parseDocument(element);
        result = elementMap.get(element);
        application.queryState = enumeration.APP_QUERYSTATE.NONE;
    }
    return result || null;
}

async function findElementAsync(element: HTMLElement, cache: boolean) {
    let result = getCachedElement(element, cache);
    if (result === undefined) {
        application.queryState = enumeration.APP_QUERYSTATE.SINGLE;
        await application.parseDocumentAsync(element);
        result = elementMap.get(element);
        application.queryState = enumeration.APP_QUERYSTATE.NONE;
    }
    return result || null;
}

function findElementAll(query: NodeListOf<Element>) {
    application.queryState = enumeration.APP_QUERYSTATE.MULTIPLE;
    let incomplete = false;
    const length = query.length;
    const result: View[] = new Array(length);
    for (let i = 0; i < length; ++i) {
        const element = <HTMLElement> query[i];
        let item = elementMap.get(element);
        if (item) {
            result[i] = item;
        }
        else {
            application.parseDocument(element);
            item = elementMap.get(element);
            if (item) {
                result[i] = item;
            }
            else {
                incomplete = true;
            }
        }
    }
    if (incomplete) {
        flatArray<View>(result);
    }
    application.queryState = enumeration.APP_QUERYSTATE.NONE;
    return result;
}

async function findElementAllAsync(query: NodeListOf<Element>) {
    let resultCount = 0;
    const length = query.length;
    const result: View[] = new Array(length);
    for (let i = 0; i < length; ++i) {
        const element = <HTMLElement> query[i];
        const item = elementMap.get(element);
        if (item) {
            result[i] = item;
            resultCount++;
        }
        else {
            application.queryState = enumeration.APP_QUERYSTATE.MULTIPLE;
            await application.parseDocumentAsync(element).then(() => {
                const awaited = elementMap.get(element);
                if (awaited) {
                    result[i] = awaited;
                    resultCount++;
                }
            });
        }
    }
    if (length !== resultCount) {
        flatArray<View>(result);
    }
    application.queryState = enumeration.APP_QUERYSTATE.NONE;
    return result;
}

function createAssetsOptions(assets: FileAsset[], options?: FileOptions, directory?: string, filename?: string): FileOptions {
    if (isObject(options)) {
        const items = options.assets;
        if (items) {
            assets = assets.concat(items);
        }
    }
    else {
        options = undefined;
    }
    return {
        ...options,
        assets,
        directory,
        filename
    };
}

const appBase: ChromeFramework<View> = {
    base: {
        Application,
        ExtensionManager,
        Controller,
        File,
        Resource,
        View
    },
    lib: {
        constant,
        enumeration
    },
    extensions: {
        compress: {
            Brotli: CompressBrotli,
            Gzip: CompressGzip
        }
    },
    system: {
        getElementById(value: string, cache = true) {
            if (application) {
                const element = document.getElementById(value);
                if (element) {
                    return findElement(element, cache);
                }
            }
            return null;
        },
        querySelector(value: string, cache = true) {
            if (application) {
                const element = document.querySelector(value);
                if (element) {
                    return findElement(<HTMLElement> element, cache);
                }
            }
            return null;
        },
        querySelectorAll(value: string, cache = true) {
            const result: View[] = [];
            if (application) {
                const query = document.querySelectorAll(value);
                if (query.length) {
                    if (!cache) {
                        elementMap.clear();
                    }
                    return findElementAll(query);
                }
            }
            return result;
        },
        getElement(element: HTMLElement, cache = false) {
            if (application) {
                return findElement(element, cache);
            }
            return null;
        },
        getElementMap() {
            return controller?.elementMap || new Map<Element, View>();
        },
        clearElementMap() {
            controller?.elementMap.clear();
        },
        copyHtmlPage(directory: string, options?: FileCopyingOptionsChrome) {
            if (isString(directory)) {
                file?.copying(createAssetsOptions(<FileAsset[]> file.getHtmlPage(options?.name), options, directory));
            }
        },
        copyScriptAssets(directory: string, options?: FileCopyingOptionsChrome) {
            if (isString(directory)) {
                file?.copying(createAssetsOptions(<FileAsset[]> file.getScriptAssets(), options, directory));
            }
        },
        copyLinkAssets(directory: string, options?: FileCopyingOptionsChrome) {
            if (isString(directory)) {
                file?.copying(createAssetsOptions(<FileAsset[]> file.getLinkAssets(options?.rel), options, directory));
            }
        },
        copyImageAssets(directory: string, options?: FileCopyingOptionsChrome) {
            if (file && isString(directory)) {
                file.copying(createAssetsOptions(<FileAsset[]> file.getImageAssets(), options, directory));
            }
        },
        copyVideoAssets(directory: string, options?: FileCopyingOptionsChrome) {
            if (isString(directory)) {
                file?.copying(createAssetsOptions(<FileAsset[]> file.getVideoAssets(), options, directory));
            }
        },
        copyAudioAssets(directory: string, options?: FileCopyingOptionsChrome) {
            if (isString(directory)) {
                file?.copying(createAssetsOptions(<FileAsset[]> file.getAudioAssets(), options, directory));
            }
        },
        copyFontAssets(directory: string, options?: FileCopyingOptionsChrome) {
            if (isString(directory)) {
                file?.copying(createAssetsOptions(<FileAsset[]> file.getFontAssets(), options, directory));
            }
        },
        saveHtmlPage(filename?: string, options?: FileArchivingOptionsChrome) {
            file?.archiving(createAssetsOptions(<FileAsset[]> file.getHtmlPage(options?.name), options, undefined, (filename || userSettings.outputArchiveName) + '-html'));
        },
        saveScriptAssets(filename?: string, options?: FileArchivingOptionsChrome) {
            file?.archiving(createAssetsOptions(<FileAsset[]> file.getScriptAssets(), options, undefined, (filename || userSettings.outputArchiveName) + '-script'));
        },
        saveLinkAssets(filename?: string, options?: FileArchivingOptionsChrome) {
            file?.archiving(createAssetsOptions(<FileAsset[]> file.getLinkAssets(options?.rel), options, undefined, (filename || userSettings.outputArchiveName) + '-link'));
        },
        saveImageAssets(filename?: string, options?: FileArchivingOptionsChrome) {
            file?.archiving(createAssetsOptions(<FileAsset[]> file.getImageAssets(), options, undefined, (filename || userSettings.outputArchiveName) + '-image'));
        },
        saveVideoAssets(filename?: string, options?: FileArchivingOptionsChrome) {
            file?.archiving(createAssetsOptions(<FileAsset[]> file.getVideoAssets(), options, undefined, (filename || userSettings.outputArchiveName) + '-video'));
        },
        saveAudioAssets(filename?: string, options?: FileArchivingOptionsChrome) {
            file?.archiving(createAssetsOptions(<FileAsset[]> file.getAudioAssets(), options, undefined, (filename || userSettings.outputArchiveName) + '-audio'));
        },
        saveFontAssets(filename?: string, options?: FileArchivingOptionsChrome) {
            file?.archiving(createAssetsOptions(<FileAsset[]> file.getFontAssets(), options, undefined, (filename || userSettings.outputArchiveName) + '-font'));
        },
        saveAsWebPage: (filename?: string, options?: FileArchivingOptionsChrome) => {
            if (!isObject(options)) {
                options = {};
            }
            options.saveAsWebPage = true;
            file?.saveToArchive(filename || userSettings.outputArchiveName, options);
        }
    },
    create() {
        const EC = constant.EXT_CHROME;
        application = new Application<View>(framework, View, Controller, Resource, ExtensionManager);
        controller = <Controller<View>> application.controllerHandler;
        file = new File();
        application.resourceHandler.setFileHandler(file);
        elementMap = controller.elementMap;
        userSettings = { ...SETTINGS };
        Object.assign(application.builtInExtensions, {
            [EC.COMPRESS_BROTLI]: new CompressBrotli(EC.COMPRESS_BROTLI, framework),
            [EC.COMPRESS_GZIP]: new CompressGzip(EC.COMPRESS_GZIP, framework)
        });
        initialized = true;
        return {
            application,
            framework,
            userSettings
        };
    },
    cached() {
        if (initialized) {
            return {
                application,
                framework,
                userSettings
            };
        }
        return appBase.create();
    },
    getElementById: async (value: string, cache = true) => {
        if (application) {
            const element = document.getElementById(value);
            if (element) {
                return await findElementAsync(element, cache);
            }
        }
        return null;
    },
    querySelector: async (value: string, cache = true) => {
        if (application) {
            const element = document.querySelector(value);
            if (element) {
                return await findElementAsync(<HTMLElement> element, cache);
            }
        }
        return null;
    },
    querySelectorAll: async (value: string, cache = true) => {
        if (application) {
            const query = document.querySelectorAll(value);
            if (query.length) {
                if (!cache) {
                    elementMap.clear();
                }
                return await findElementAllAsync(query);
            }
        }
        return null;
    },
    getElement: async (element: HTMLElement, cache = false) => {
        if (application) {
            return await findElementAsync(element, cache);
        }
        return null;
    }
};

export default appBase;