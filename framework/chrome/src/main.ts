import APP_FRAMEWORK = squared.base.lib.constant.APP_FRAMEWORK;

import Application from './application';
import Extension from './extension';
import File from './file';
import Node from './node';

import SETTINGS from './settings';

type FileActionOptions = FileCopyingOptions & FileArchivingOptions;

const { DIRECTORY_NOT_PROVIDED, FRAMEWORK_NOT_INSTALLED, reject } = squared.lib.error;
const { isString, isPlainObject } = squared.lib.util;

let application: Null<Application<Node>> = null;
let file: Null<File<Node>> = null;

function createAssetsOptions(assets: ChromeAsset[], options?: FileActionOptions, filename?: string): FileActionOptions {
    if (isPlainObject<FileActionOptions>(options)) {
        if (options.assets) {
            assets.push(...options.assets);
        }
    }
    return Object.assign(options = {}, { assets, filename });
}

const checkFileName = (value: Undef<string>, type: string) => value || `${(application!.userSettings as UserResourceSettings).outputArchiveName}-${type}`;

const appBase: squared.base.AppFramework<Node> = {
    base: {
        Application,
        Extension,
        File,
        Node
    },
    lib: {},
    extensions: {},
    system: {
        copyHtmlPage(pathname: string, options?: FileCopyingOptions) {
            if (isString(pathname)) {
                return file ? file.copying(pathname, createAssetsOptions(file.getHtmlPage(options), options)) : reject(FRAMEWORK_NOT_INSTALLED);
            }
            return reject(DIRECTORY_NOT_PROVIDED);
        },
        copyScriptAssets(pathname: string, options?: FileCopyingOptions) {
            if (isString(pathname)) {
                return file ? file.copying(pathname, createAssetsOptions(file.getScriptAssets(options)[0], options)) : reject(FRAMEWORK_NOT_INSTALLED);
            }
            return reject(DIRECTORY_NOT_PROVIDED);
        },
        copyLinkAssets(pathname: string, options?: FileCopyingOptions) {
            if (isString(pathname)) {
                return file ? file.copying(pathname, createAssetsOptions(file.getLinkAssets(options), options)) : reject(FRAMEWORK_NOT_INSTALLED);
            }
            return reject(DIRECTORY_NOT_PROVIDED);
        },
        copyImageAssets(pathname: string, options?: FileCopyingOptions) {
            if (isString(pathname)) {
                return file ? file.copying(pathname, createAssetsOptions(file.getImageAssets(options), options)) : reject(FRAMEWORK_NOT_INSTALLED);
            }
            return reject(DIRECTORY_NOT_PROVIDED);
        },
        copyVideoAssets(pathname: string, options?: FileCopyingOptions) {
            if (isString(pathname)) {
                return file ? file.copying(pathname, createAssetsOptions(file.getVideoAssets(options), options)) : reject(FRAMEWORK_NOT_INSTALLED);
            }
            return reject(DIRECTORY_NOT_PROVIDED);
        },
        copyAudioAssets(pathname: string, options?: FileCopyingOptions) {
            if (isString(pathname)) {
                return file ? file.copying(pathname, createAssetsOptions(file.getAudioAssets(options), options)) : reject(FRAMEWORK_NOT_INSTALLED);
            }
            return reject(DIRECTORY_NOT_PROVIDED);
        },
        copyFontAssets(pathname: string, options?: FileCopyingOptions) {
            if (isString(pathname)) {
                return file ? file.copying(pathname, createAssetsOptions(file.getFontAssets(options), options)) : reject(FRAMEWORK_NOT_INSTALLED);
            }
            return reject(DIRECTORY_NOT_PROVIDED);
        },
        saveHtmlPage(filename?: string, options?: FileArchivingOptions) {
            return file ? file.archiving('', createAssetsOptions(file.getHtmlPage(options), options, checkFileName(filename, 'html'))) : reject(FRAMEWORK_NOT_INSTALLED);
        },
        saveScriptAssets(filename?: string, options?: FileArchivingOptions) {
            return file ? file.archiving('', createAssetsOptions(file.getScriptAssets(options)[0], options, checkFileName(filename, 'script'))) : reject(FRAMEWORK_NOT_INSTALLED);
        },
        saveLinkAssets(filename?: string, options?: FileArchivingOptions) {
            return file ? file.archiving('', createAssetsOptions(file.getLinkAssets(options), options, checkFileName(filename, 'link'))) : reject(FRAMEWORK_NOT_INSTALLED);
        },
        saveImageAssets(filename?: string, options?: FileArchivingOptions) {
            return file ? file.archiving('', createAssetsOptions(file.getImageAssets(options), options, checkFileName(filename, 'image'))) : reject(FRAMEWORK_NOT_INSTALLED);
        },
        saveVideoAssets(filename?: string, options?: FileArchivingOptions) {
            return file ? file.archiving('', createAssetsOptions(file.getVideoAssets(options), options, checkFileName(filename, 'video'))) : reject(FRAMEWORK_NOT_INSTALLED);
        },
        saveAudioAssets(filename?: string, options?: FileArchivingOptions) {
            return file ? file.archiving('', createAssetsOptions(file.getAudioAssets(options), options, checkFileName(filename, 'audio'))) : reject(FRAMEWORK_NOT_INSTALLED);
        },
        saveFontAssets(filename?: string, options?: FileArchivingOptions) {
            return file ? file.archiving('', createAssetsOptions(file.getFontAssets(options), options, checkFileName(filename, 'font'))) : reject(FRAMEWORK_NOT_INSTALLED);
        }
    },
    create() {
        application = new Application<Node>(
            APP_FRAMEWORK.CHROME,
            Node,
            squared.base.Controller,
            squared.base.ExtensionManager,
            squared.base.Resource
        );
        file = new File(application.resourceHandler!);
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