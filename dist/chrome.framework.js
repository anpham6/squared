/* chrome-framework 1.3.7
   https://github.com/anpham6/squared */

var chrome = (function () {
    'use strict';

    class Resource extends squared.base.Resource {
        constructor(application, cache) {
            super();
            this.application = application;
            this.cache = cache;
            this.controllerSettings = application.controllerHandler.localSettings;
        }
        get userSettings() {
            return this.application.userSettings;
        }
    }

    const { isTextNode } = squared.lib.dom;
    const ASSETS = Resource.ASSETS;
    class Application extends squared.base.Application {
        constructor() {
            super(...arguments);
            this.builtInExtensions = {};
            this.extensions = [];
        }
        finalize() { }
        insertNode(element, parent) {
            if (isTextNode(element)) {
                if (this.userSettings.excludePlainText) {
                    return undefined;
                }
                this.controllerHandler.applyDefaultStyles(element);
            }
            const node = this.createNode(element, false);
            if (node.plainText && parent) {
                node.cssApply(parent.textStyle);
            }
            return node;
        }
        afterCreateCache() {
            this.controllerHandler.cacheElementList(this.processing.cache);
        }
        get length() {
            return ASSETS.images.size + ASSETS.rawData.size + ASSETS.fonts.size;
        }
    }

    const $lib = squared.lib;
    const { isTextNode: isTextNode$1 } = $lib.dom;
    const { setElementCache } = $lib.session;
    class Controller extends squared.base.Controller {
        constructor(application, cache) {
            super();
            this.application = application;
            this.cache = cache;
            this.localSettings = {
                supported: {
                    fontFormat: '*',
                    imageFormat: '*'
                }
            };
            this._elementMap = new Map();
        }
        init() { }
        sortInitialCache() { }
        reset() {
            this._elementMap.clear();
        }
        applyDefaultStyles(element) {
            if (isTextNode$1(element)) {
                setElementCache(element, 'styleMap', this.sessionId, {
                    position: 'static',
                    display: 'inline',
                    verticalAlign: 'baseline',
                    float: 'none',
                    clear: 'none'
                });
            }
        }
        includeElement() {
            return true;
        }
        cacheElementList(list) {
            const elementMap = this._elementMap;
            for (const node of list) {
                elementMap.set(node.element, node);
            }
        }
        get elementMap() {
            return this._elementMap;
        }
        get userSettings() {
            return this.application.userSettings;
        }
    }

    class ExtensionManager extends squared.base.ExtensionManager {
    }

    const $lib$1 = squared.lib;
    const { COMPONENT } = $lib$1.regex;
    const { convertWord, fromLastIndexOf, resolvePath, spliceString, trimEnd } = $lib$1.util;
    const ASSETS$1 = Resource.ASSETS;
    const REGEX_SRCSET = /\s*(.+?\.[^\s,]+).*?,\s*/;
    const REGEX_SRCSET_SPECIFIER = /\s+[0-9.][wx]$/;
    function parseUri(value) {
        value = trimEnd(value, '/');
        const match = COMPONENT.PROTOCOL.exec(value);
        let pathname = '';
        let filename = '';
        if (match) {
            const host = match[2];
            const port = match[3];
            const path = match[4];
            if (!value.startsWith(trimEnd(location.origin, '/'))) {
                pathname = convertWord(host) + (port ? '/' + port.substring(1) : '') + '/';
            }
            if (path) {
                const index = path.lastIndexOf('/');
                if (index > 0) {
                    pathname += path.substring(1, index);
                    filename = fromLastIndexOf(path, '/');
                }
            }
        }
        if (pathname !== '') {
            const extension = filename.indexOf('.') !== -1 ? fromLastIndexOf(filename, '.').toLowerCase() : undefined;
            return {
                pathname,
                filename,
                extension,
                mimeType: extension && File.getMimeType(extension)
            };
        }
        return undefined;
    }
    function convertFileMatch(value) {
        value = value.trim()
            .replace(/([.|/\\{}()?])/g, (match, ...capture) => '\\' + capture[0])
            .replace(/\*/g, '.*?');
        return new RegExp(`${value}$`);
    }
    class File extends squared.base.File {
        reset() {
            super.reset();
            this._outputFileExclusions = undefined;
        }
        copyToDisk(directory, assets = [], callback) {
            this.copying(directory, assets.concat(this.getAssetsAll()), callback);
        }
        appendToArchive(pathname, assets = []) {
            this.archiving(this.userSettings.outputArchiveName, assets.concat(this.getAssetsAll()), pathname);
        }
        saveToArchive(filename) {
            this.archiving(filename, this.getAssetsAll());
        }
        getHtmlPage(name) {
            const result = [];
            const href = location.href;
            const data = parseUri(href);
            if (data) {
                if (name) {
                    data.filename = name;
                }
                else {
                    const filename = data.filename;
                    if (filename.indexOf('.') === -1) {
                        data.pathname += '/' + filename;
                        data.filename = 'index.html';
                    }
                }
                if (this.validFile(data)) {
                    data.uri = href;
                    data.mimeType = File.getMimeType('html');
                    this.processExtensions(data);
                    result.push(data);
                }
            }
            return result;
        }
        getScriptAssets() {
            const result = [];
            document.querySelectorAll('script').forEach(element => {
                const src = element.src.trim();
                if (src !== '') {
                    const uri = resolvePath(src);
                    const data = parseUri(uri);
                    if (this.validFile(data)) {
                        data.uri = uri;
                        if (element.type) {
                            data.mimeType = element.type;
                        }
                        this.processExtensions(data);
                        result.push(data);
                    }
                }
            });
            return result;
        }
        getLinkAssets(rel) {
            const result = [];
            document.querySelectorAll(rel ? `link[rel="${rel}"]` : 'link').forEach((element) => {
                const href = element.href.trim();
                if (href !== '') {
                    const uri = resolvePath(href);
                    const data = parseUri(uri);
                    if (this.validFile(data)) {
                        data.uri = uri;
                        this.processExtensions(data);
                        result.push(data);
                    }
                }
            });
            return result;
        }
        getImageAssets() {
            const result = [];
            for (const uri of ASSETS$1.images.keys()) {
                const data = parseUri(uri);
                if (this.validFile(data)) {
                    data.uri = uri;
                    this.processExtensions(data);
                    result.push(data);
                }
            }
            for (const [uri, rawData] of ASSETS$1.rawData) {
                const filename = rawData.filename;
                if (filename) {
                    const { pathname, base64, content, mimeType } = rawData;
                    let data;
                    if (pathname) {
                        data = { pathname, filename, uri };
                    }
                    else if (base64) {
                        data = { pathname: 'generated/base64', filename, base64 };
                    }
                    else if (content && mimeType) {
                        data = { pathname: 'generated/' + mimeType, filename, content };
                    }
                    if (this.validFile(data)) {
                        data.mimeType = mimeType;
                        this.processExtensions(data);
                        result.push(data);
                    }
                }
            }
            document.querySelectorAll('img[srcset], picture > source[srcset]').forEach((element) => {
                const images = [];
                let srcset = element.srcset.trim();
                let match;
                while ((match = REGEX_SRCSET.exec(srcset)) !== null) {
                    images.push(resolvePath(match[1]));
                    srcset = spliceString(srcset, match.index, match[0].length);
                }
                srcset = srcset.trim();
                if (srcset !== '') {
                    images.push(resolvePath(srcset.replace(REGEX_SRCSET_SPECIFIER, '')));
                }
                for (const src of images) {
                    if (COMPONENT.PROTOCOL.test(src) && result.findIndex(item => item.uri === src) === -1) {
                        const data = parseUri(src);
                        if (this.validFile(data)) {
                            data.uri = src;
                            result.push(data);
                        }
                    }
                }
            });
            return result;
        }
        getFontAssets() {
            const result = [];
            for (const fonts of ASSETS$1.fonts.values()) {
                for (const font of fonts) {
                    const url = font.srcUrl;
                    if (url) {
                        const data = parseUri(url);
                        if (this.validFile(data)) {
                            data.uri = url;
                            this.processExtensions(data);
                            result.push(data);
                        }
                    }
                }
            }
            return result;
        }
        getAssetsAll() {
            return this.getHtmlPage()
                .concat(this.getScriptAssets())
                .concat(this.getLinkAssets())
                .concat(this.getImageAssets())
                .concat(this.getFontAssets());
        }
        validFile(data) {
            if (data) {
                const fullpath = data.pathname + '/' + data.filename;
                return !this.outputFileExclusions.some(pattern => pattern.test(fullpath));
            }
            return false;
        }
        processExtensions(data) {
            for (const ext of this.application.extensions) {
                ext.processFile(data);
            }
        }
        get outputFileExclusions() {
            let result = this._outputFileExclusions;
            if (result === undefined) {
                const exclusions = [];
                for (const value of this.userSettings.outputFileExclusions) {
                    exclusions.push(convertFileMatch(value));
                }
                result = exclusions;
                this._outputFileExclusions = result;
            }
            return result;
        }
        get userSettings() {
            return this.resource.userSettings;
        }
        get application() {
            return this.resource.application;
        }
    }

    class View extends squared.base.Node {
        constructor(id, sessionId, element, afterInit) {
            super(id, sessionId, element);
            this._cached = {};
            this.init();
            if (afterInit) {
                afterInit(this);
            }
        }
    }

    class Extension extends squared.base.Extension {
        processFile(data) {
            return false;
        }
    }

    class Brotli extends Extension {
        constructor() {
            super(...arguments);
            this.options = {
                quality: 11,
                fileExtensions: ['js', 'css', 'json', 'svg']
            };
        }
        processFile(data) {
            const extension = data.extension;
            if (extension) {
                const options = this.options;
                if (options.fileExtensions.includes(extension)) {
                    data.brotliQuality = Math.min(options.quality, 11);
                    return true;
                }
            }
            return false;
        }
    }

    class Gzip extends Extension {
        constructor() {
            super(...arguments);
            this.options = {
                quality: 9,
                fileExtensions: ['js', 'css', 'json', 'svg']
            };
        }
        processFile(data) {
            const extension = data.extension;
            if (extension) {
                const options = this.options;
                if (options.fileExtensions.includes(extension)) {
                    data.gzipQuality = Math.min(options.quality, 9);
                    return true;
                }
            }
            return false;
        }
    }

    const settings = {
        builtInExtensions: [
            'chrome.compress.brotli',
            'chrome.compress.gzip'
        ],
        preloadImages: false,
        handleExtensionsAsync: true,
        showErrorMessages: false,
        createQuerySelectorMap: true,
        excludePlainText: true,
        outputFileExclusions: ['squared.*', 'chrome.framework.*'],
        outputDirectory: '',
        outputArchiveName: 'chrome-data',
        outputArchiveFormat: 'zip',
        outputArchiveTimeout: 60
    };

    const EXT_CHROME = {
        COMPRESS_BROTLI: 'chrome.compress.brotli',
        COMPRESS_GZIP: 'chrome.compress.gzip'
    };

    var constant = /*#__PURE__*/Object.freeze({
        __proto__: null,
        EXT_CHROME: EXT_CHROME
    });

    var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    const { flatArray, isString } = squared.lib.util;
    const framework = 4 /* CHROME */;
    let initialized = false;
    let application;
    let controller;
    let file;
    let userSettings;
    let elementMap;
    function findElement(element, cache = true) {
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
    function findElementAsync(element, cache = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (cache) {
                const result = elementMap.get(element);
                if (result) {
                    return result;
                }
            }
            yield application.parseDocument(element);
            return elementMap.get(element) || null;
        });
    }
    const appBase = {
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
                Brotli: Brotli,
                Gzip: Gzip
            }
        },
        system: {
            getElement(element, cache = true) {
                if (application) {
                    return findElement(element, cache);
                }
                return null;
            },
            getElementById(value, cache = true) {
                if (application) {
                    const element = document.getElementById(value);
                    if (element) {
                        return findElement(element, cache);
                    }
                }
                return null;
            },
            querySelector(value) {
                if (application) {
                    const element = document.querySelector(value);
                    if (element) {
                        return findElement(element);
                    }
                }
                return null;
            },
            querySelectorAll(value) {
                const result = [];
                if (application) {
                    document.querySelectorAll(value).forEach(element => {
                        const item = findElement(element);
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
                return new Map();
            },
            clearElementMap() {
                if (controller) {
                    return controller.elementMap.clear();
                }
            },
            copyHtmlPage(directory, callback, name) {
                if (file && isString(directory)) {
                    file.copying(directory, file.getHtmlPage(name), callback);
                }
            },
            copyScriptAssets(directory, callback) {
                if (file && isString(directory)) {
                    file.copying(directory, file.getScriptAssets(), callback);
                }
            },
            copyLinkAssets(directory, callback, rel) {
                if (file && isString(directory)) {
                    file.copying(directory, file.getLinkAssets(rel), callback);
                }
            },
            copyImageAssets(directory, callback) {
                if (file && isString(directory)) {
                    file.copying(directory, file.getImageAssets(), callback);
                }
            },
            copyFontAssets(directory, callback) {
                if (file && isString(directory)) {
                    file.copying(directory, file.getFontAssets(), callback);
                }
            },
            saveHtmlPage(filename, name) {
                if (file) {
                    file.archiving((filename || userSettings.outputArchiveName) + '-html', file.getHtmlPage(name));
                }
            },
            saveScriptAssets(filename) {
                if (file) {
                    file.archiving((filename || userSettings.outputArchiveName) + '-script', file.getScriptAssets());
                }
            },
            saveLinkAssets(filename, rel) {
                if (file) {
                    file.archiving((filename || userSettings.outputArchiveName) + '-link', file.getLinkAssets(rel));
                }
            },
            saveImageAssets(filename) {
                if (file) {
                    file.archiving((filename || userSettings.outputArchiveName) + '-image', file.getImageAssets());
                }
            },
            saveFontAssets(filename) {
                if (file) {
                    file.archiving((filename || userSettings.outputArchiveName) + '-font', file.getFontAssets());
                }
            }
        },
        create() {
            const EC = EXT_CHROME;
            application = new Application(framework, View, Controller, Resource, ExtensionManager);
            controller = application.controllerHandler;
            file = new File();
            application.resourceHandler.setFileHandler(file);
            elementMap = controller.elementMap;
            userSettings = Object.assign({}, settings);
            Object.assign(application.builtInExtensions, {
                [EC.COMPRESS_BROTLI]: new Brotli(EC.COMPRESS_BROTLI, framework),
                [EC.COMPRESS_GZIP]: new Gzip(EC.COMPRESS_GZIP, framework)
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
        getElement: (element, cache = true) => __awaiter(void 0, void 0, void 0, function* () {
            if (application) {
                return yield findElementAsync(element, cache);
            }
            return null;
        }),
        getElementById: (value, cache = true) => __awaiter(void 0, void 0, void 0, function* () {
            if (application) {
                const element = document.getElementById(value);
                if (element) {
                    return yield findElementAsync(element, cache);
                }
            }
            return null;
        }),
        querySelector: (value) => __awaiter(void 0, void 0, void 0, function* () {
            if (application) {
                const element = document.querySelector(value);
                if (element) {
                    return yield findElementAsync(element);
                }
            }
            return null;
        }),
        querySelectorAll: (value) => __awaiter(void 0, void 0, void 0, function* () {
            if (application) {
                const query = document.querySelectorAll(value);
                const result = new Array(query.length);
                let incomplete = false;
                yield (() => __awaiter(void 0, void 0, void 0, function* () {
                    query.forEach((element, index) => __awaiter(void 0, void 0, void 0, function* () {
                        const item = yield findElementAsync(element);
                        if (item) {
                            result[index] = item;
                        }
                        else {
                            incomplete = true;
                        }
                    }));
                }))();
                return incomplete ? flatArray(result) : result;
            }
            return [];
        })
    };

    return appBase;

}());
