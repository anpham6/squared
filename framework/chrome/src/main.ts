import Application from './application';
import Controller from './controller';
import File from './file';
import Resource from './resource';

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

import * as constant from './lib/constant';

type NodeElement = squared.base.NodeElement;
type FileOptions = ChromeFileArchivingOptions | ChromeFileCopyingOptions;

const { util, session } = squared.lib;

const { flatArray, isString, isObject, promisify } = util;
const { frameworkNotInstalled } = session;

const framework = squared.base.lib.enumeration.APP_FRAMEWORK.CHROME;

let initialized = false;
let application: Application<NodeElement>;
let controller: Controller<NodeElement>;
let file: Undef<File<NodeElement>>;
let elementMap: Map<Element, NodeElement>;

function getCachedElement(element: HTMLElement, cache: boolean) {
    if (!cache) {
        elementMap.clear();
        return undefined;
    }
    return elementMap.get(element);
}

function findElement(element: HTMLElement, cache: boolean) {
    const result = getCachedElement(element, cache);
    return result ? Promise.resolve(result) : application.parseDocument(element) as Promise<NodeElement>;
}

async function findElementAll(query: NodeListOf<Element>) {
    let incomplete = false;
    const length = query.length;
    const result: NodeElement[] = new Array(length);
    for (let i = 0; i < length; ++i) {
        const element = query[i] as HTMLElement;
        let item = elementMap.get(element);
        if (item) {
            result[i] = item;
        }
        else {
            item = await application.parseDocument(element) as NodeElement;
            if (item) {
                result[i] = item;
            }
            else {
                incomplete = true;
            }
        }
    }
    if (incomplete) {
        flatArray<NodeElement>(result);
    }
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

const directoryNotProvided = () => Promise.reject('Directory not provided.');

const appBase: chrome.ChromeFramework<NodeElement> = {
    base: {
        Application,
        Controller,
        File,
        Resource
    },
    lib: {
        constant
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
        getElementMap() {
            return controller?.elementMap || new Map<Element, NodeElement>();
        },
        clearElementMap() {
            controller?.elementMap.clear();
        },
        copyHtmlPage(directory: string, options?: ChromeFileCopyingOptions) {
            if (isString(directory)) {
                return file?.copying(createAssetsOptions(file.getHtmlPage(options), options, directory)) || frameworkNotInstalled();
            }
            return directoryNotProvided();
        },
        copyScriptAssets(directory: string, options?: ChromeFileCopyingOptions) {
            if (isString(directory)) {
                return file?.copying(createAssetsOptions(file.getScriptAssets(options), options, directory)) || frameworkNotInstalled();
            }
            return directoryNotProvided();
        },
        copyLinkAssets(directory: string, options?: ChromeFileCopyingOptions) {
            if (isString(directory)) {
                return file?.copying(createAssetsOptions(file.getLinkAssets(options), options, directory)) || frameworkNotInstalled();
            }
            return directoryNotProvided();
        },
        copyImageAssets(directory: string, options?: ChromeFileCopyingOptions) {
            if (isString(directory)) {
                return file?.copying(createAssetsOptions(file.getImageAssets(options), options, directory)) || frameworkNotInstalled();
            }
            return directoryNotProvided();
        },
        copyVideoAssets(directory: string, options?: ChromeFileCopyingOptions) {
            if (isString(directory)) {
                return file?.copying(createAssetsOptions(file.getVideoAssets(options), options, directory)) || frameworkNotInstalled();
            }
            return directoryNotProvided();
        },
        copyAudioAssets(directory: string, options?: ChromeFileCopyingOptions) {
            if (isString(directory)) {
                return file?.copying(createAssetsOptions(file.getAudioAssets(options), options, directory)) || frameworkNotInstalled();
            }
            return directoryNotProvided();
        },
        copyFontAssets(directory: string, options?: ChromeFileCopyingOptions) {
            if (isString(directory)) {
                return file?.copying(createAssetsOptions(file.getFontAssets(options), options, directory)) || frameworkNotInstalled();
            }
            return directoryNotProvided();
        },
        saveHtmlPage(filename?: string, options?: ChromeFileArchivingOptions) {
            return file?.archiving(createAssetsOptions(file.getHtmlPage(options), options, undefined, (filename || application.userSettings.outputArchiveName) + '-html')) || frameworkNotInstalled();
        },
        saveScriptAssets(filename?: string, options?: ChromeFileArchivingOptions) {
            return file?.archiving(createAssetsOptions(file.getScriptAssets(options), options, undefined, (filename || application.userSettings.outputArchiveName) + '-script')) || frameworkNotInstalled();
        },
        saveLinkAssets(filename?: string, options?: ChromeFileArchivingOptions) {
            return file?.archiving(createAssetsOptions(file.getLinkAssets(options), options, undefined, (filename || application.userSettings.outputArchiveName) + '-link')) || frameworkNotInstalled();
        },
        saveImageAssets(filename?: string, options?: ChromeFileArchivingOptions) {
            return file?.archiving(createAssetsOptions(file.getImageAssets(options), options, undefined, (filename || application.userSettings.outputArchiveName) + '-image')) || frameworkNotInstalled();
        },
        saveVideoAssets(filename?: string, options?: ChromeFileArchivingOptions) {
            return file?.archiving(createAssetsOptions(file.getVideoAssets(options), options, undefined, (filename || application.userSettings.outputArchiveName) + '-video')) || frameworkNotInstalled();
        },
        saveAudioAssets(filename?: string, options?: ChromeFileArchivingOptions) {
            return file?.archiving(createAssetsOptions(file.getAudioAssets(options), options, undefined, (filename || application.userSettings.outputArchiveName) + '-audio')) || frameworkNotInstalled();
        },
        saveFontAssets(filename?: string, options?: ChromeFileArchivingOptions) {
            return file?.archiving(createAssetsOptions(file.getFontAssets(options), options, undefined, (filename || application.userSettings.outputArchiveName) + '-font')) || frameworkNotInstalled();
        }
    },
    create() {
        const EC = constant.EXT_CHROME;
        application = new Application<NodeElement>(framework, squared.base.NodeElement, Controller, Resource, squared.base.ExtensionManager);
        controller = application.controllerHandler as Controller<NodeElement>;
        file = new File();
        application.resourceHandler.fileHandler = file;
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
                return findElement(element, cache);
            }
        }
        return Promise.resolve(null);
    },
    querySelector: (value: string, cache = true) => {
        if (application) {
            const element = document.querySelector(value);
            if (element) {
                return findElement(element as HTMLElement, cache);
            }
        }
        return Promise.resolve(null);
    },
    querySelectorAll: (value: string, cache = true) => {
        if (application) {
            const query = document.querySelectorAll(value);
            if (query.length > 0) {
                if (!cache) {
                    elementMap.clear();
                }
                return promisify<NodeElement[]>(findElementAll)(query);
            }
        }
        return Promise.resolve([]);
    },
    getElement: (element: HTMLElement, cache = false) => {
        if (application) {
            return findElement(element, cache);
        }
        return Promise.resolve(null);
    },
    saveAsWebPage: (filename?: string, options?: ChromeFileArchivingOptions) => {
        if (application) {
            options = !isObject(options) ? {} : { ...options };
            options.saveAsWebPage = true;
            const settings = application.userSettings;
            const preloadImages = settings.preloadImages;
            settings.preloadImages = false;
            application.reset();
            return application.parseDocument(document.body).then((response: NodeElement[]) => {
                file!.saveToArchive(filename || application.userSettings.outputArchiveName, options);
                settings.preloadImages = preloadImages;
                return response;
            });
        }
        return frameworkNotInstalled();
    }
};

export default appBase;