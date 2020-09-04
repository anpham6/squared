import EXT_CHROME = chrome.base.constant.EXT_CHROME;

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

type Node = squared.base.Node;
type FileOptions = IFileArchivingOptions | IFileCopyingOptions;

const { util, session } = squared.lib;

const { isString, isPlainObject } = util;
const { frameworkNotInstalled } = session;

const framework = squared.base.lib.constant.APP_FRAMEWORK.CHROME;
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
    lib: {},
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
        copyHtmlPage(directory: string, options?: IFileCopyingOptions) {
            if (isString(directory)) {
                return file ? file.copying(createAssetsOptions(file.getHtmlPage(options), options, directory)) : frameworkNotInstalled();
            }
            return directoryNotProvided();
        },
        copyScriptAssets(directory: string, options?: IFileCopyingOptions) {
            if (isString(directory)) {
                return file ? file.copying(createAssetsOptions(file.getScriptAssets(options), options, directory)) : frameworkNotInstalled();
            }
            return directoryNotProvided();
        },
        copyLinkAssets(directory: string, options?: IFileCopyingOptions) {
            if (isString(directory)) {
                return file ? file.copying(createAssetsOptions(file.getLinkAssets(options), options, directory)) : frameworkNotInstalled();
            }
            return directoryNotProvided();
        },
        copyImageAssets(directory: string, options?: IFileCopyingOptions) {
            if (isString(directory)) {
                return file ? file.copying(createAssetsOptions(file.getImageAssets(options), options, directory)) : frameworkNotInstalled();
            }
            return directoryNotProvided();
        },
        copyVideoAssets(directory: string, options?: IFileCopyingOptions) {
            if (isString(directory)) {
                return file ? file.copying(createAssetsOptions(file.getVideoAssets(options), options, directory)) : frameworkNotInstalled();
            }
            return directoryNotProvided();
        },
        copyAudioAssets(directory: string, options?: IFileCopyingOptions) {
            if (isString(directory)) {
                return file ? file.copying(createAssetsOptions(file.getAudioAssets(options), options, directory)) : frameworkNotInstalled();
            }
            return directoryNotProvided();
        },
        copyFontAssets(directory: string, options?: IFileCopyingOptions) {
            if (isString(directory)) {
                return file ? file.copying(createAssetsOptions(file.getFontAssets(options), options, directory)) : frameworkNotInstalled();
            }
            return directoryNotProvided();
        },
        saveHtmlPage(filename?: string, options?: IFileArchivingOptions) {
            return file ? file.archiving(createAssetsOptions(file.getHtmlPage(options), options, undefined, checkFileName(filename) + '-html')) : frameworkNotInstalled();
        },
        saveScriptAssets(filename?: string, options?: IFileArchivingOptions) {
            return file ? file.archiving(createAssetsOptions(file.getScriptAssets(options), options, undefined, checkFileName(filename) + '-script')) : frameworkNotInstalled();
        },
        saveLinkAssets(filename?: string, options?: IFileArchivingOptions) {
            return file ? file.archiving(createAssetsOptions(file.getLinkAssets(options), options, undefined, checkFileName(filename) + '-link')) : frameworkNotInstalled();
        },
        saveImageAssets(filename?: string, options?: IFileArchivingOptions) {
            return file ? file.archiving(createAssetsOptions(file.getImageAssets(options), options, undefined, checkFileName(filename) + '-image')) : frameworkNotInstalled();
        },
        saveVideoAssets(filename?: string, options?: IFileArchivingOptions) {
            return file ? file.archiving(createAssetsOptions(file.getVideoAssets(options), options, undefined, checkFileName(filename) + '-video')) : frameworkNotInstalled();
        },
        saveAudioAssets(filename?: string, options?: IFileArchivingOptions) {
            return file ? file.archiving(createAssetsOptions(file.getAudioAssets(options), options, undefined, checkFileName(filename) + '-audio')) : frameworkNotInstalled();
        },
        saveFontAssets(filename?: string, options?: IFileArchivingOptions) {
            return file ? file.archiving(createAssetsOptions(file.getFontAssets(options), options, undefined, checkFileName(filename) + '-font')) : frameworkNotInstalled();
        }
    },
    create() {
        application = new Application<Node>(
            framework,
            squared.base.Node,
            squared.base.Controller,
            squared.base.Resource,
            squared.base.ExtensionManager
        );
        file = new File();
        application.resourceHandler!.fileHandler = file;
        application.builtInExtensions = new Map<string, Extension<Node>>([
            [EXT_CHROME.COMPRESS_BROTLI, new CompressBrotli(EXT_CHROME.COMPRESS_BROTLI, framework)],
            [EXT_CHROME.COMPRESS_GZIP, new CompressGzip(EXT_CHROME.COMPRESS_GZIP, framework)],
            [EXT_CHROME.COMPRESS_JPEG, new CompressJpeg(EXT_CHROME.COMPRESS_JPEG, framework)],
            [EXT_CHROME.COMPRESS_PNG, new CompressPng(EXT_CHROME.COMPRESS_PNG, framework)],
            [EXT_CHROME.CONVERT_BMP, new ConvertBmp(EXT_CHROME.CONVERT_BMP, framework)],
            [EXT_CHROME.CONVERT_GIF, new ConvertGif(EXT_CHROME.CONVERT_GIF, framework)],
            [EXT_CHROME.CONVERT_JPEG, new ConvertJpeg(EXT_CHROME.CONVERT_JPEG, framework)],
            [EXT_CHROME.CONVERT_PNG, new ConvertPng(EXT_CHROME.CONVERT_PNG, framework)],
            [EXT_CHROME.CONVERT_TIFF, new ConvertTiff(EXT_CHROME.CONVERT_TIFF, framework)]
        ]);
        return {
            application,
            framework,
            userSettings: { ...SETTINGS }
        };
    },
    cached() {
        if (application) {
            return {
                application,
                framework,
                userSettings: application.userSettings
            };
        }
        return appBase.create();
    },
    saveAsWebPage: (filename?: string, options?: IFileArchivingOptions) => {
        if (application) {
            options = !isPlainObject(options) ? {} : { ...options };
            options.saveAsWebPage = true;
            const settings = application.userSettings;
            const { preloadImages, preloadFonts } = settings;
            settings.preloadImages = false;
            settings.preloadFonts = false;
            application.reset();
            return application.parseDocument(document.body).then((response: Node) => {
                file!.saveAs(filename || settings.outputArchiveName, options);
                settings.preloadImages = preloadImages;
                settings.preloadFonts = preloadFonts;
                return response;
            });
        }
        return frameworkNotInstalled();
    }
};

export default appBase;