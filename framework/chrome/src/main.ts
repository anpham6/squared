import APP_FRAMEWORK = squared.base.lib.constant.APP_FRAMEWORK;

import Application from './application';
import Extension from './extension';
import File from './file';

import SETTINGS from './settings';

type Node = squared.base.Node;
type FileOptions = IFileArchivingOptions | IFileCopyingOptions;

const { DIRECTORY_NOT_PROVIDED, FRAMEWORK_NOT_INSTALLED, reject } = squared.lib.error;
const { isString, isPlainObject } = squared.lib.util;

let application: Null<Application<Node>> = null;
let file: Null<File<Node>> = null;

function createAssetsOptions(assets: ChromeAsset[], options?: FileOptions, directory?: string, filename?: string): FileOptions {
    if (isPlainObject<FileOptions>(options)) {
        if (options.assets) {
            assets.push(...options.assets);
        }
    }
    else {
        options = {};
    }
    return Object.assign(options, { assets, directory, filename });
}

const checkFileName = (value: Undef<string>) => value || application!.userSettings.outputArchiveName;

const appBase: squared.base.AppFramework<Node> = {
    base: {
        Application,
        Extension,
        File
    },
    lib: {},
    extensions: {},
    system: {
        copyHtmlPage(directory: string, options?: IFileCopyingOptions) {
            if (isString(directory)) {
                return file ? file.copying(createAssetsOptions(file.getHtmlPage(options), options, directory)) : reject(FRAMEWORK_NOT_INSTALLED);
            }
            return reject(DIRECTORY_NOT_PROVIDED);
        },
        copyScriptAssets(directory: string, options?: IFileCopyingOptions) {
            if (isString(directory)) {
                return file ? file.copying(createAssetsOptions(file.getScriptAssets(options)[0], options, directory)) : reject(FRAMEWORK_NOT_INSTALLED);
            }
            return reject(DIRECTORY_NOT_PROVIDED);
        },
        copyLinkAssets(directory: string, options?: IFileCopyingOptions) {
            if (isString(directory)) {
                return file ? file.copying(createAssetsOptions(file.getLinkAssets(options), options, directory)) : reject(FRAMEWORK_NOT_INSTALLED);
            }
            return reject(DIRECTORY_NOT_PROVIDED);
        },
        copyImageAssets(directory: string, options?: IFileCopyingOptions) {
            if (isString(directory)) {
                return file ? file.copying(createAssetsOptions(file.getImageAssets(options), options, directory)) : reject(FRAMEWORK_NOT_INSTALLED);
            }
            return reject(DIRECTORY_NOT_PROVIDED);
        },
        copyVideoAssets(directory: string, options?: IFileCopyingOptions) {
            if (isString(directory)) {
                return file ? file.copying(createAssetsOptions(file.getVideoAssets(options), options, directory)) : reject(FRAMEWORK_NOT_INSTALLED);
            }
            return reject(DIRECTORY_NOT_PROVIDED);
        },
        copyAudioAssets(directory: string, options?: IFileCopyingOptions) {
            if (isString(directory)) {
                return file ? file.copying(createAssetsOptions(file.getAudioAssets(options), options, directory)) : reject(FRAMEWORK_NOT_INSTALLED);
            }
            return reject(DIRECTORY_NOT_PROVIDED);
        },
        copyFontAssets(directory: string, options?: IFileCopyingOptions) {
            if (isString(directory)) {
                return file ? file.copying(createAssetsOptions(file.getFontAssets(options), options, directory)) : reject(FRAMEWORK_NOT_INSTALLED);
            }
            return reject(DIRECTORY_NOT_PROVIDED);
        },
        saveHtmlPage(filename?: string, options?: IFileArchivingOptions) {
            return file ? file.archiving(createAssetsOptions(file.getHtmlPage(options), options, undefined, checkFileName(filename) + '-html')) : reject(FRAMEWORK_NOT_INSTALLED);
        },
        saveScriptAssets(filename?: string, options?: IFileArchivingOptions) {
            return file ? file.archiving(createAssetsOptions(file.getScriptAssets(options)[0], options, undefined, checkFileName(filename) + '-script')) : reject(FRAMEWORK_NOT_INSTALLED);
        },
        saveLinkAssets(filename?: string, options?: IFileArchivingOptions) {
            return file ? file.archiving(createAssetsOptions(file.getLinkAssets(options), options, undefined, checkFileName(filename) + '-link')) : reject(FRAMEWORK_NOT_INSTALLED);
        },
        saveImageAssets(filename?: string, options?: IFileArchivingOptions) {
            return file ? file.archiving(createAssetsOptions(file.getImageAssets(options), options, undefined, checkFileName(filename) + '-image')) : reject(FRAMEWORK_NOT_INSTALLED);
        },
        saveVideoAssets(filename?: string, options?: IFileArchivingOptions) {
            return file ? file.archiving(createAssetsOptions(file.getVideoAssets(options), options, undefined, checkFileName(filename) + '-video')) : reject(FRAMEWORK_NOT_INSTALLED);
        },
        saveAudioAssets(filename?: string, options?: IFileArchivingOptions) {
            return file ? file.archiving(createAssetsOptions(file.getAudioAssets(options), options, undefined, checkFileName(filename) + '-audio')) : reject(FRAMEWORK_NOT_INSTALLED);
        },
        saveFontAssets(filename?: string, options?: IFileArchivingOptions) {
            return file ? file.archiving(createAssetsOptions(file.getFontAssets(options), options, undefined, checkFileName(filename) + '-font')) : reject(FRAMEWORK_NOT_INSTALLED);
        }
    },
    create() {
        application = new Application<Node>(
            APP_FRAMEWORK.CHROME,
            squared.base.Node,
            squared.base.Controller,
            squared.base.ExtensionManager,
            squared.base.Resource
        );
        file = new File();
        application.resourceHandler!.fileHandler = file;
        return {
            application,
            framework: APP_FRAMEWORK.CHROME,
            userSettings: { ...SETTINGS }
        };
    },
    cached() {
        if (application) {
            return {
                application,
                framework: APP_FRAMEWORK.CHROME,
                userSettings: application.userSettings
            };
        }
        return this.create();
    }
};

export default appBase;