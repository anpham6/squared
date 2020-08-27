import Application from './application';
import Extension from './extension';
import File from './file';

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

const { isString, isPlainObject } = util;
const { frameworkNotInstalled } = session;

let application: Null<Application<Node>> = null;
let file: Null<File<Node>> = null;

function createAssetsOptions(assets: ChromeAsset[], options?: FileOptions, directory?: string, filename?: string): FileOptions {
    if (isPlainObject<FileOptions>(options)) {
        if (options.assets) {
            assets = assets.concat(options.assets);
        }
    }
    else {
        options = {};
    }
    return Object.assign(options, { assets, directory, filename });
}

const checkFileName = (value: Undef<string>) => value || application!.userSettings.outputArchiveName;
const directoryNotProvided = () => Promise.reject(squared.lib.error.DIRECTORY_NOT_PROVIDED);

const appBase: chrome.ChromeFramework<Node> = {
    base: {
        Application,
        Extension,
        File
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
                return file ? file.copying(createAssetsOptions(file.getHtmlPage(options), options, directory)) : frameworkNotInstalled();
            }
            return directoryNotProvided();
        },
        copyScriptAssets(directory: string, options?: ChromeFileCopyingOptions) {
            if (isString(directory)) {
                return file ? file.copying(createAssetsOptions(file.getScriptAssets(options), options, directory)) : frameworkNotInstalled();
            }
            return directoryNotProvided();
        },
        copyLinkAssets(directory: string, options?: ChromeFileCopyingOptions) {
            if (isString(directory)) {
                return file ? file.copying(createAssetsOptions(file.getLinkAssets(options), options, directory)) : frameworkNotInstalled();
            }
            return directoryNotProvided();
        },
        copyImageAssets(directory: string, options?: ChromeFileCopyingOptions) {
            if (isString(directory)) {
                return file ? file.copying(createAssetsOptions(file.getImageAssets(options), options, directory)) : frameworkNotInstalled();
            }
            return directoryNotProvided();
        },
        copyVideoAssets(directory: string, options?: ChromeFileCopyingOptions) {
            if (isString(directory)) {
                return file ? file.copying(createAssetsOptions(file.getVideoAssets(options), options, directory)) : frameworkNotInstalled();
            }
            return directoryNotProvided();
        },
        copyAudioAssets(directory: string, options?: ChromeFileCopyingOptions) {
            if (isString(directory)) {
                return file ? file.copying(createAssetsOptions(file.getAudioAssets(options), options, directory)) : frameworkNotInstalled();
            }
            return directoryNotProvided();
        },
        copyFontAssets(directory: string, options?: ChromeFileCopyingOptions) {
            if (isString(directory)) {
                return file ? file.copying(createAssetsOptions(file.getFontAssets(options), options, directory)) : frameworkNotInstalled();
            }
            return directoryNotProvided();
        },
        saveHtmlPage(filename?: string, options?: ChromeFileArchivingOptions) {
            return file ? file.archiving(createAssetsOptions(file.getHtmlPage(options), options, undefined, checkFileName(filename) + '-html')) : frameworkNotInstalled();
        },
        saveScriptAssets(filename?: string, options?: ChromeFileArchivingOptions) {
            return file ? file.archiving(createAssetsOptions(file.getScriptAssets(options), options, undefined, checkFileName(filename) + '-script')) : frameworkNotInstalled();
        },
        saveLinkAssets(filename?: string, options?: ChromeFileArchivingOptions) {
            return file ? file.archiving(createAssetsOptions(file.getLinkAssets(options), options, undefined, checkFileName(filename) + '-link')) : frameworkNotInstalled();
        },
        saveImageAssets(filename?: string, options?: ChromeFileArchivingOptions) {
            return file ? file.archiving(createAssetsOptions(file.getImageAssets(options), options, undefined, checkFileName(filename) + '-image')) : frameworkNotInstalled();
        },
        saveVideoAssets(filename?: string, options?: ChromeFileArchivingOptions) {
            return file ? file.archiving(createAssetsOptions(file.getVideoAssets(options), options, undefined, checkFileName(filename) + '-video')) : frameworkNotInstalled();
        },
        saveAudioAssets(filename?: string, options?: ChromeFileArchivingOptions) {
            return file ? file.archiving(createAssetsOptions(file.getAudioAssets(options), options, undefined, checkFileName(filename) + '-audio')) : frameworkNotInstalled();
        },
        saveFontAssets(filename?: string, options?: ChromeFileArchivingOptions) {
            return file ? file.archiving(createAssetsOptions(file.getFontAssets(options), options, undefined, checkFileName(filename) + '-font')) : frameworkNotInstalled();
        }
    },
    create() {
        const EC = constant.EXT_CHROME;
        application = new Application<Node>(
            squared.base.lib.enumeration.APP_FRAMEWORK.CHROME, squared.base.Node,
            squared.base.Controller,
            squared.base.Resource,
            squared.base.ExtensionManager
        );
        file = new File();
        application.resourceHandler!.fileHandler = file;
        application.builtInExtensions = new Map<string, Extension<Node>>([
            [EC.COMPRESS_BROTLI, new CompressBrotli(EC.COMPRESS_BROTLI, squared.base.lib.enumeration.APP_FRAMEWORK.CHROME)],
            [EC.COMPRESS_GZIP, new CompressGzip(EC.COMPRESS_GZIP, squared.base.lib.enumeration.APP_FRAMEWORK.CHROME)],
            [EC.COMPRESS_JPEG, new CompressJpeg(EC.COMPRESS_JPEG, squared.base.lib.enumeration.APP_FRAMEWORK.CHROME)],
            [EC.COMPRESS_PNG, new CompressPng(EC.COMPRESS_PNG, squared.base.lib.enumeration.APP_FRAMEWORK.CHROME)],
            [EC.CONVERT_BMP, new ConvertBmp(EC.CONVERT_BMP, squared.base.lib.enumeration.APP_FRAMEWORK.CHROME)],
            [EC.CONVERT_GIF, new ConvertGif(EC.CONVERT_GIF, squared.base.lib.enumeration.APP_FRAMEWORK.CHROME)],
            [EC.CONVERT_JPEG, new ConvertJpeg(EC.CONVERT_JPEG, squared.base.lib.enumeration.APP_FRAMEWORK.CHROME)],
            [EC.CONVERT_PNG, new ConvertPng(EC.CONVERT_PNG, squared.base.lib.enumeration.APP_FRAMEWORK.CHROME)],
            [EC.CONVERT_TIFF, new ConvertTiff(EC.CONVERT_TIFF, squared.base.lib.enumeration.APP_FRAMEWORK.CHROME)]
        ]);
        return {
            application,
            framework: squared.base.lib.enumeration.APP_FRAMEWORK.CHROME,
            userSettings: { ...SETTINGS }
        };
    },
    cached() {
        if (application) {
            return {
                application,
                framework: squared.base.lib.enumeration.APP_FRAMEWORK.CHROME,
                userSettings: application.userSettings
            };
        }
        return appBase.create();
    },
    saveAsWebPage: (filename?: string, options?: ChromeFileArchivingOptions) => {
        if (application) {
            options = !isPlainObject(options) ? {} : { ...options };
            options.saveAsWebPage = true;
            const settings = application.userSettings;
            const { preloadImages, preloadFonts } = settings;
            settings.preloadImages = false;
            settings.preloadFonts = false;
            application.reset();
            return application.parseDocument(document.body).then((response: Node) => {
                file!.saveToArchive(filename || settings.outputArchiveName, options);
                settings.preloadImages = preloadImages;
                settings.preloadFonts = preloadFonts;
                return response;
            });
        }
        return frameworkNotInstalled();
    }
};

export default appBase;