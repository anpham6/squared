import { FileAsset, UserSettings } from '../../@types/base/application';
import { ChromeFramework } from '../../@types/chrome/application';

import Application from './application';
import Controller from './controller';
import ExtensionManager from './extensionmanager';
import File from './file';
import Resource from './resource';
import View from './view';

import CompressBrotli from './extensions/compress/brotli';
import CompressGzip from './extensions/compress/gzip';

import SETTINGS from './settings';

import * as constant from './lib/constant';

const { flatArray, isString } = squared.lib.util;

const framework = squared.base.lib.enumeration.APP_FRAMEWORK.CHROME;
let initialized = false;
let application: Application<View>;
let controller: Controller<View>;
let file: File<View>;
let userSettings: UserSettings;
let elementMap: Map<Element, View>;

function findElement(element: HTMLElement, cache: boolean) {
    if (cache) {
        const result = elementMap.get(element);
        if (result) {
            return result;
        }
    }
    const preloadImages = userSettings.preloadImages;
    userSettings.preloadImages = false;
    application.parseDocument(element);
    userSettings.preloadImages = preloadImages;
    return elementMap.get(element) || null;
}

async function findElementAsync(element: HTMLElement, cache: boolean) {
    if (cache) {
        const result = elementMap.get(element);
        if (result) {
            return result;
        }
    }
    await application.parseDocument(element);
    return elementMap.get(element) || null;
}

async function findElementAllAsync(query: NodeListOf<Element>, cache: boolean) {
    const length = query.length;
    const result: View[] = new Array(length);
    let incomplete = false;
    for (let i = 0; i < length; i++) {
        const item = await findElementAsync(<HTMLElement> query[i], cache);
        if (item) {
            result[i] = item;
        }
        else {
            incomplete = true;
        }
    }
    if (incomplete) {
        flatArray<View>(result);
    }
    return result;
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
        constant
    },
    extensions: {
        compress: {
            Brotli: CompressBrotli,
            Gzip: CompressGzip
        }
    },
    system: {
        getElement(element: HTMLElement, cache = true) {
            if (application) {
                return findElement(element, cache);
            }
            return null;
        },
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
                document.querySelectorAll(value).forEach(element => {
                    const item = findElement(<HTMLElement> element, cache);
                    if (item) {
                        result.push(item);
                    }
                });
            }
            return result;
        },
        getElementMap() {
            return controller?.elementMap || new Map<Element, View>();
        },
        clearElementMap() {
            controller?.elementMap.clear();
        },
        copyHtmlPage(directory: string, callback?: CallbackResult, name?: string) {
            if (isString(directory)) {
                file?.copying(directory, <FileAsset[]> file.getHtmlPage(name), callback);
            }
        },
        copyScriptAssets(directory: string, callback?: CallbackResult) {
            if (isString(directory)) {
                file?.copying(directory, <FileAsset[]> file.getScriptAssets(), callback);
            }
        },
        copyLinkAssets(directory: string, callback?: CallbackResult, rel?: string) {
            if (isString(directory)) {
                file?.copying(directory, <FileAsset[]> file.getLinkAssets(rel), callback);
            }
        },
        copyImageAssets(directory: string, callback?: CallbackResult) {
            if (isString(directory)) {
                file?.copying(directory, <FileAsset[]> file.getImageAssets(), callback);
            }
        },
        copyFontAssets(directory: string, callback?: CallbackResult) {
            if (isString(directory)) {
                file?.copying(directory, <FileAsset[]> file.getFontAssets(), callback);
            }
        },
        saveHtmlPage(filename?: string, name?: string) {
            file?.archiving((filename || userSettings.outputArchiveName) + '-html', <FileAsset[]> file.getHtmlPage(name));
        },
        saveScriptAssets(filename?: string) {
            file?.archiving((filename || userSettings.outputArchiveName) + '-script', <FileAsset[]> file.getScriptAssets());
        },
        saveLinkAssets(filename?: string, rel?: string) {
            file?.archiving((filename || userSettings.outputArchiveName) + '-link', <FileAsset[]> file.getLinkAssets(rel));
        },
        saveImageAssets(filename?: string) {
            file?.archiving((filename || userSettings.outputArchiveName) + '-image', <FileAsset[]> file.getImageAssets());
        },
        saveFontAssets(filename?: string) {
            file?.archiving((filename || userSettings.outputArchiveName) + '-font', <FileAsset[]> file.getFontAssets());
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
    getElement: async (element: HTMLElement, cache = true) => {
        if (application) {
            return await findElementAsync(element, cache);
        }
        return null;
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
                return await findElementAllAsync(query, cache);
            }
        }
        return null;
    }
};

export default appBase;