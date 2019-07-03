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

const $util = squared.lib.util;

const framework = squared.base.lib.enumeration.APP_FRAMEWORK.CHROME;
let initialized = false;
let application: Application<View>;
let controller: Controller<View>;
let file: File<View>;
let userSettings: UserSettings;
let elementMap: Map<Element, View>;

function findElement(element: HTMLElement, cache = true) {
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

async function findElementAsync(element: HTMLElement, cache = true) {
    if (cache) {
        const result = elementMap.get(element);
        if (result) {
            return result;
        }
    }
    await application.parseDocument(element);
    return elementMap.get(element) || null;
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
        querySelector(value: string) {
            if (application) {
                const element = document.querySelector(value);
                if (element) {
                    return findElement(<HTMLElement> element);
                }
            }
            return null;
        },
        querySelectorAll(value: string) {
            const result: View[] = [];
            if (application) {
                document.querySelectorAll(value).forEach(element => {
                    const item = findElement(<HTMLElement> element);
                    if (item) {
                        result.push(item);
                    }
                });
            }
            return result;
        },
        getElementMap() {
            if (controller) {
                return controller.elementMap;
            }
            return new Map<Element, View>();
        },
        clearElementMap() {
            if (controller) {
                return controller.elementMap.clear();
            }
        },
        copyHtmlPage(directory: string, callback?: CallbackResult, name?: string) {
            if (file && $util.isString(directory)) {
                file.copying(directory, <FileAsset[]> file.getHtmlPage(name), callback);
            }
        },
        copyScriptAssets(directory: string, callback?: CallbackResult) {
            if (file && $util.isString(directory)) {
                file.copying(directory, <FileAsset[]> file.getScriptAssets(), callback);
            }
        },
        copyLinkAssets(directory: string, callback?: CallbackResult, rel?: string) {
            if (file && $util.isString(directory)) {
                file.copying(directory, <FileAsset[]> file.getLinkAssets(rel), callback);
            }
        },
        copyImageAssets(directory: string, callback?: CallbackResult) {
            if (file && $util.isString(directory)) {
                file.copying(directory, <FileAsset[]> file.getImageAssets(), callback);
            }
        },
        copyFontAssets(directory: string, callback?: CallbackResult) {
            if (file && $util.isString(directory)) {
                file.copying(directory, <FileAsset[]> file.getFontAssets(), callback);
            }
        },
        saveHtmlPage(filename?: string, name?: string) {
            if (file) {
                file.archiving(filename || `${userSettings.outputArchiveName}-html`, <FileAsset[]> file.getHtmlPage(name));
            }
        },
        saveScriptAssets(filename?: string) {
            if (file) {
                file.archiving(filename || `${userSettings.outputArchiveName}-script`, <FileAsset[]> file.getScriptAssets());
            }
        },
        saveLinkAssets(filename?: string, rel?: string) {
            if (file) {
                file.archiving(filename || `${userSettings.outputArchiveName}-link`, <FileAsset[]> file.getLinkAssets(rel));
            }
        },
        saveImageAssets(filename?: string) {
            if (file) {
                file.archiving(filename || `${userSettings.outputArchiveName}-image`, <FileAsset[]> file.getImageAssets());
            }
        },
        saveFontAssets(filename?: string) {
            if (file) {
                file.archiving(filename || `${userSettings.outputArchiveName}-font`, <FileAsset[]> file.getFontAssets());
            }
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
    querySelector: async (value: string) => {
        if (application) {
            const element = document.querySelector(value);
            if (element) {
                return await findElementAsync(<HTMLElement> element);
            }
        }
        return null;
    },
    querySelectorAll: async (value: string) => {
        if (application) {
            const query = document.querySelectorAll(value);
            const result: View[] = new Array(query.length);
            let incomplete = false;
            await (async () => {
                query.forEach(async (element, index) => {
                    const item = await findElementAsync(<HTMLElement> element);
                    if (item) {
                        result[index] = item;
                    }
                    else {
                        incomplete = true;
                    }
                });
            })();
            return incomplete ? $util.flatArray(result) : result;
        }
        return [];
    }
};

export default appBase;