import Application from './application';
import Controller from './controller';
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

type FileOptions = ChromeFileArchivingOptions | ChromeFileCopyingOptions;

const { util, session } = squared.lib;

const { flatArray, isString, isObject, promisify } = util;
const { frameworkNotInstalled } = session;

const framework = squared.base.lib.enumeration.APP_FRAMEWORK.CHROME;

let initialized = false;
let application: Application<View>;
let controller: Controller<View>;
let file: Undef<File<View>>;
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
            const element = query[i] as HTMLElement;
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

function createAssetsOptions(assets: ChromeAsset[], options?: FileOptions, directory?: string, filename?: string): FileOptions {
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

const appBase: chrome.ChromeFramework<View> = {
    base: {
        Application,
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
                    return findElement(element as HTMLElement, cache);
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
        copyHtmlPage(directory: string, options?: ChromeFileCopyingOptions) {
            if (isString(directory)) {
                file?.copying(createAssetsOptions(file.getHtmlPage(options), options, directory));
            }
        },
        copyScriptAssets(directory: string, options?: ChromeFileCopyingOptions) {
            if (isString(directory)) {
                file?.copying(createAssetsOptions(file.getScriptAssets(options), options, directory));
            }
        },
        copyLinkAssets(directory: string, options?: ChromeFileCopyingOptions) {
            if (isString(directory)) {
                file?.copying(createAssetsOptions(file.getLinkAssets(options), options, directory));
            }
        },
        copyImageAssets(directory: string, options?: ChromeFileCopyingOptions) {
            if (file && isString(directory)) {
                file.copying(createAssetsOptions(file.getImageAssets(options), options, directory));
            }
        },
        copyVideoAssets(directory: string, options?: ChromeFileCopyingOptions) {
            if (isString(directory)) {
                file?.copying(createAssetsOptions(file.getVideoAssets(options), options, directory));
            }
        },
        copyAudioAssets(directory: string, options?: ChromeFileCopyingOptions) {
            if (isString(directory)) {
                file?.copying(createAssetsOptions(file.getAudioAssets(options), options, directory));
            }
        },
        copyFontAssets(directory: string, options?: ChromeFileCopyingOptions) {
            if (isString(directory)) {
                file?.copying(createAssetsOptions(file.getFontAssets(options), options, directory));
            }
        },
        saveHtmlPage(filename?: string, options?: ChromeFileArchivingOptions) {
            file?.archiving(createAssetsOptions(file.getHtmlPage(options), options, undefined, (filename || application.userSettings.outputArchiveName) + '-html'));
        },
        saveScriptAssets(filename?: string, options?: ChromeFileArchivingOptions) {
            file?.archiving(createAssetsOptions(file.getScriptAssets(options), options, undefined, (filename || application.userSettings.outputArchiveName) + '-script'));
        },
        saveLinkAssets(filename?: string, options?: ChromeFileArchivingOptions) {
            file?.archiving(createAssetsOptions(file.getLinkAssets(options), options, undefined, (filename || application.userSettings.outputArchiveName) + '-link'));
        },
        saveImageAssets(filename?: string, options?: ChromeFileArchivingOptions) {
            file?.archiving(createAssetsOptions(file.getImageAssets(options), options, undefined, (filename || application.userSettings.outputArchiveName) + '-image'));
        },
        saveVideoAssets(filename?: string, options?: ChromeFileArchivingOptions) {
            file?.archiving(createAssetsOptions(file.getVideoAssets(options), options, undefined, (filename || application.userSettings.outputArchiveName) + '-video'));
        },
        saveAudioAssets(filename?: string, options?: ChromeFileArchivingOptions) {
            file?.archiving(createAssetsOptions(file.getAudioAssets(options), options, undefined, (filename || application.userSettings.outputArchiveName) + '-audio'));
        },
        saveFontAssets(filename?: string, options?: ChromeFileArchivingOptions) {
            file?.archiving(createAssetsOptions(file.getFontAssets(options), options, undefined, (filename || application.userSettings.outputArchiveName) + '-font'));
        }
    },
    create() {
        const EC = constant.EXT_CHROME;
        application = new Application<View>(framework, View, Controller, Resource);
        controller = application.controllerHandler as Controller<View>;
        file = new File();
        application.resourceHandler!.fileHandler = file;
        elementMap = controller.elementMap;
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
            userSettings: { ...SETTINGS }
        };
    },
    cached() {
        if (initialized) {
            return {
                application,
                framework,
                userSettings: application.userSettings
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
                return promisify<Null<View>>(findElement)(element, cache);
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
    saveAsWebPage: (filename?: string, options?: ChromeFileArchivingOptions) => {
        if (file) {
            options = !isObject(options) ? {} : { ...options };
            options.saveAsWebPage = true;
            const settings = application.userSettings;
            const preloadImages = settings.preloadImages;
            settings.preloadImages = false;
            application.reset();
            return application.parseDocument(document.body).then((response: View[]) => {
                file!.saveToArchive(filename || application.userSettings.outputArchiveName, options);
                settings.preloadImages = preloadImages;
                return response;
            });
        }
        return frameworkNotInstalled();
    }
};

export default appBase;