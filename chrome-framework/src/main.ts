import { FileAsset } from '../../@types/base/file';
import { ChromeFramework } from '../../@types/chrome/internal';
import { UserSettings } from '../../@types/chrome/application';
import { FileArchivingOptions, FileCopyingOptions } from '../../@types/chrome/file';

import Application from './application';
import Controller from './controller';
import ExtensionManager from './extensionmanager';
import File from './file';
import Resource from './resource';
import View from './view';

import CompressBrotli from './extensions/compress/brotli';
import CompressGzip from './extensions/compress/gzip';
import CompressJpeg from './extensions/compress/jpeg';
import CompressPng from './extensions/compress/png';

import ConvertBmp from './extensions/convert/bmp';
import ConvertJpeg from './extensions/convert/jpeg';
import ConvertPng from './extensions/convert/png';
import ConvertGif from './extensions/convert/gif';
import ConvertTiff from './extensions/convert/tiff';

import SETTINGS from './settings';

import * as enumeration from './lib/enumeration';
import * as constant from './lib/constant';

type FileOptions = FileArchivingOptions | FileCopyingOptions;

const { util, session } = squared.lib;

const { flatArray, isString, isObject, promisify } = util;
const { frameworkNotInstalled } = session;

const framework = squared.base.lib.enumeration.APP_FRAMEWORK.CHROME;
let initialized = false;
let application: Application<View>;
let controller: Controller<View>;
let file: Undef<File<View>>;
let userSettings: UserSettings;
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
        (async () => { await application.parseDocument(element); })();
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
    (async () => {
        for (let i = 0; i < length; ++i) {
            const element = <HTMLElement> query[i];
            let item = elementMap.get(element);
            if (item) {
                result[i] = item;
            }
            else {
                await application.parseDocument(element);
                item = elementMap.get(element);
                if (item) {
                    result[i] = item;
                }
                else {
                    incomplete = true;
                }
            }
        }
    })();
    if (incomplete) {
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
            Gzip: CompressGzip,
            Jpeg: CompressJpeg,
            Png: CompressPng
        },
        convert: {
            Bmp: ConvertBmp,
            Gif: ConvertGif,
            Jpeg: ConvertJpeg,
            Png: ConvertPng,
            Tiff: ConvertTiff
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
            if (application) {
                const query = document.querySelectorAll(value);
                if (query.length) {
                    if (!cache) {
                        elementMap.clear();
                    }
                    return findElementAll(query);
                }
            }
            return [];
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
        copyHtmlPage(directory: string, options?: FileCopyingOptions) {
            if (isString(directory)) {
                file?.copying(createAssetsOptions(file.getHtmlPage(options?.name), options, directory));
            }
        },
        copyScriptAssets(directory: string, options?: FileCopyingOptions) {
            if (isString(directory)) {
                file?.copying(createAssetsOptions(file.getScriptAssets(), options, directory));
            }
        },
        copyLinkAssets(directory: string, options?: FileCopyingOptions) {
            if (isString(directory)) {
                file?.copying(createAssetsOptions(file.getLinkAssets(options?.rel), options, directory));
            }
        },
        copyImageAssets(directory: string, options?: FileCopyingOptions) {
            if (file && isString(directory)) {
                file.copying(createAssetsOptions(file.getImageAssets(), options, directory));
            }
        },
        copyVideoAssets(directory: string, options?: FileCopyingOptions) {
            if (isString(directory)) {
                file?.copying(createAssetsOptions(file.getVideoAssets(), options, directory));
            }
        },
        copyAudioAssets(directory: string, options?: FileCopyingOptions) {
            if (isString(directory)) {
                file?.copying(createAssetsOptions(file.getAudioAssets(), options, directory));
            }
        },
        copyFontAssets(directory: string, options?: FileCopyingOptions) {
            if (isString(directory)) {
                file?.copying(createAssetsOptions(file.getFontAssets(), options, directory));
            }
        },
        saveHtmlPage(filename?: string, options?: FileArchivingOptions) {
            file?.archiving(createAssetsOptions(file.getHtmlPage(options?.name), options, undefined, (filename || userSettings.outputArchiveName) + '-html'));
        },
        saveScriptAssets(filename?: string, options?: FileArchivingOptions) {
            file?.archiving(createAssetsOptions(file.getScriptAssets(), options, undefined, (filename || userSettings.outputArchiveName) + '-script'));
        },
        saveLinkAssets(filename?: string, options?: FileArchivingOptions) {
            file?.archiving(createAssetsOptions(file.getLinkAssets(options?.rel), options, undefined, (filename || userSettings.outputArchiveName) + '-link'));
        },
        saveImageAssets(filename?: string, options?: FileArchivingOptions) {
            file?.archiving(createAssetsOptions(file.getImageAssets(), options, undefined, (filename || userSettings.outputArchiveName) + '-image'));
        },
        saveVideoAssets(filename?: string, options?: FileArchivingOptions) {
            file?.archiving(createAssetsOptions(file.getVideoAssets(), options, undefined, (filename || userSettings.outputArchiveName) + '-video'));
        },
        saveAudioAssets(filename?: string, options?: FileArchivingOptions) {
            file?.archiving(createAssetsOptions(file.getAudioAssets(), options, undefined, (filename || userSettings.outputArchiveName) + '-audio'));
        },
        saveFontAssets(filename?: string, options?: FileArchivingOptions) {
            file?.archiving(createAssetsOptions(file.getFontAssets(), options, undefined, (filename || userSettings.outputArchiveName) + '-font'));
        },
        saveAsWebPage: (filename?: string, options?: FileArchivingOptions) => {
            if (file) {
                if (!isObject(options)) {
                    options = {};
                }
                options.saveAsWebPage = true;
                const preloadImages = userSettings.preloadImages;
                userSettings.preloadImages = true;
                (async () => {
                    await application.parseDocument(document.body).then(() => {
                        file!.saveToArchive(filename || userSettings.outputArchiveName, options);
                        userSettings.preloadImages = preloadImages;
                    });
                })();
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
            [EC.COMPRESS_GZIP]: new CompressGzip(EC.COMPRESS_GZIP, framework),
            [EC.COMPRESS_JPEG]: new CompressJpeg(EC.COMPRESS_JPEG, framework),
            [EC.COMPRESS_PNG]: new CompressPng(EC.COMPRESS_PNG, framework),
            [EC.CONVERT_BMP]: new ConvertBmp(EC.CONVERT_BMP, framework),
            [EC.CONVERT_GIF]: new ConvertGif(EC.CONVERT_GIF, framework),
            [EC.CONVERT_JPEG]: new ConvertJpeg(EC.CONVERT_JPEG, framework),
            [EC.CONVERT_PNG]: new ConvertPng(EC.CONVERT_PNG, framework),
            [EC.CONVERT_TIFF]: new ConvertTiff(EC.CONVERT_TIFF, framework)
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
    getElementById: (value: string, cache = true) => {
        if (application) {
            const element = document.getElementById(value);
            if (element) {
                return promisify<Null<View>>(findElement)(element, cache);
            }
        }
        return frameworkNotInstalled();
    },
    querySelector: (value: string, cache = true) => {
        if (application) {
            const element = document.querySelector(value);
            if (element) {
                return promisify<Null<View>>(findElement)(<HTMLElement> element, cache);
            }
        }
        return frameworkNotInstalled();
    },
    querySelectorAll: (value: string, cache = true) => {
        if (application) {
            const query = document.querySelectorAll(value);
            if (query.length) {
                if (!cache) {
                    elementMap.clear();
                }
                return promisify<View[]>(findElementAll)(query);
            }
        }
        return frameworkNotInstalled();
    },
    getElement: (element: HTMLElement, cache = false) => {
        if (application) {
            return promisify<Null<View>>(findElement)(element, cache);
        }
        return frameworkNotInstalled();
    },
    saveAsWebPage: (filename?: string, options?: FileArchivingOptions) => {
        if (file) {
            if (!isObject(options)) {
                options = {};
            }
            options.saveAsWebPage = true;
            const preloadImages = userSettings.preloadImages;
            userSettings.preloadImages = true;
            return application.parseDocument(document.body).then(() => {
                file!.saveToArchive(filename || userSettings.outputArchiveName, options);
                userSettings.preloadImages = preloadImages;
            });
        }
        return frameworkNotInstalled();
    }
};

export default appBase;