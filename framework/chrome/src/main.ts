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

type Node = squared.base.Node;
type FileOptions = ChromeFileArchivingOptions | ChromeFileCopyingOptions;

const { util, session } = squared.lib;

const { isString, isObject } = util;
const { frameworkNotInstalled } = session;

const framework = squared.base.lib.enumeration.APP_FRAMEWORK.CHROME;

let initialized = false;
let application: Application<Node>;
let file: Undef<File<Node>>;

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

const checkFileName = (value: Undef<string>) => value || application.userSettings.outputArchiveName;
const directoryNotProvided = () => Promise.reject('Directory not provided.');

const appBase: chrome.ChromeFramework<Node> = {
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
            return file?.archiving(createAssetsOptions(file.getHtmlPage(options), options, undefined, checkFileName(filename) + '-html')) || frameworkNotInstalled();
        },
        saveScriptAssets(filename?: string, options?: ChromeFileArchivingOptions) {
            return file?.archiving(createAssetsOptions(file.getScriptAssets(options), options, undefined, checkFileName(filename) + '-script')) || frameworkNotInstalled();
        },
        saveLinkAssets(filename?: string, options?: ChromeFileArchivingOptions) {
            return file?.archiving(createAssetsOptions(file.getLinkAssets(options), options, undefined, checkFileName(filename) + '-link')) || frameworkNotInstalled();
        },
        saveImageAssets(filename?: string, options?: ChromeFileArchivingOptions) {
            return file?.archiving(createAssetsOptions(file.getImageAssets(options), options, undefined, checkFileName(filename) + '-image')) || frameworkNotInstalled();
        },
        saveVideoAssets(filename?: string, options?: ChromeFileArchivingOptions) {
            return file?.archiving(createAssetsOptions(file.getVideoAssets(options), options, undefined, checkFileName(filename) + '-video')) || frameworkNotInstalled();
        },
        saveAudioAssets(filename?: string, options?: ChromeFileArchivingOptions) {
            return file?.archiving(createAssetsOptions(file.getAudioAssets(options), options, undefined, checkFileName(filename) + '-audio')) || frameworkNotInstalled();
        },
        saveFontAssets(filename?: string, options?: ChromeFileArchivingOptions) {
            return file?.archiving(createAssetsOptions(file.getFontAssets(options), options, undefined, checkFileName(filename) + '-font')) || frameworkNotInstalled();
        }
    },
    create() {
        const EC = constant.EXT_CHROME;
        application = new Application<Node>(framework, squared.base.Node, Controller, Resource, squared.base.ExtensionManager);
        file = new File();
        application.resourceHandler.fileHandler = file;
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
    saveAsWebPage: (filename?: string, options?: ChromeFileArchivingOptions) => {
        if (application) {
            options = !isObject(options) ? {} : { ...options };
            options.saveAsWebPage = true;
            const settings = application.userSettings;
            const preloadImages = settings.preloadImages;
            settings.preloadImages = false;
            application.reset();
            return application.parseDocument(document.body).then((response: Node[]) => {
                file!.saveToArchive(filename || application.userSettings.outputArchiveName, options);
                settings.preloadImages = preloadImages;
                return response;
            });
        }
        return frameworkNotInstalled();
    }
};

export default appBase;