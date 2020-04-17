/* chrome-framework 1.6.1
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
    class Application extends squared.base.Application {
        constructor() {
            super(...arguments);
            this.builtInExtensions = {};
            this.extensions = [];
            this.queryState = 0;
        }
        finalize() { }
        createNode(options) {
            return new this.Node(this.nextId, this.processing.sessionId, options.element);
        }
        insertNode(element, parent) {
            if (isTextNode(element)) {
                if (this.userSettings.excludePlainText) {
                    return undefined;
                }
                this.controllerHandler.applyDefaultStyles(element);
                const node = this.createNode({ element });
                if (parent) {
                    node.cssApply(parent.textStyle);
                }
                return node;
            }
            return this.createNode({ element });
        }
        afterCreateCache(node) {
            switch (this.queryState) {
                case 1 /* SINGLE */:
                    this.controllerHandler.cacheElement(node);
                    break;
                default:
                    this.controllerHandler.cacheElementList(this.processing.cache);
                    break;
            }
        }
        get length() {
            const assets = Resource.ASSETS;
            let result = 0;
            for (const name in assets) {
                result += assets[name].size;
            }
            return result;
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
                mimeType: {
                    font: '*',
                    image: '*',
                    audio: '*',
                    video: '*'
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
        cacheElement(node) {
            this._elementMap.set(node.element, node);
        }
        cacheElementList(list) {
            const elementMap = this._elementMap;
            list.each(node => elementMap.set(node.element, node));
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
    const { CHAR, COMPONENT, FILE, XML } = $lib$1.regex;
    const { appendSeparator, convertWord, fromLastIndexOf, objectMap, parseMimeType, resolvePath, safeNestedArray, spliceString, trimEnd } = $lib$1.util;
    const ASSETS = Resource.ASSETS;
    const REGEX_SRCSET = /\s*(.+?\.[^\s,]+).*?,\s*/;
    const REGEX_SRCSET_SPECIFIER = /\s+[0-9.][wx]$/;
    function parseUri(uri) {
        const value = trimEnd(uri, '/');
        const match = COMPONENT.PROTOCOL.exec(value);
        if (match) {
            let pathname = '';
            let filename = '';
            let rootDir = '';
            let moveTo;
            const host = match[2];
            const port = match[3];
            const path = match[4];
            const getDirectory = (start = 1) => {
                if (start > 1) {
                    rootDir = path.substring(0, start);
                }
                return path.substring(start, path.lastIndexOf('/'));
            };
            let local = true;
            if (!value.startsWith(trimEnd(location.origin, '/'))) {
                pathname = convertWord(host) + (port ? '/' + port.substring(1) : '') + '/';
                local = false;
            }
            if (path && path !== '/') {
                filename = fromLastIndexOf(path, '/');
                if (local) {
                    const prefix = location.pathname.substring(0, location.pathname.lastIndexOf('/') + 1);
                    if (path.startsWith(prefix)) {
                        pathname = getDirectory(prefix.length);
                    }
                    else {
                        moveTo = '__serverroot__';
                        pathname = getDirectory();
                    }
                }
                else {
                    pathname += getDirectory();
                }
            }
            else {
                filename = 'index.html';
            }
            const extension = filename.includes('.') ? fromLastIndexOf(filename, '.').toLowerCase() : undefined;
            return {
                uri,
                rootDir,
                moveTo,
                pathname,
                filename,
                extension,
                mimeType: extension && parseMimeType(extension)
            };
        }
        return undefined;
    }
    function resolveAssetSource(data, value) {
        const src = resolvePath(value);
        if (src !== '') {
            data.add(src);
        }
    }
    function convertFileMatch(value) {
        value = value.trim()
            .replace(/([.|/\\{}()?])/g, (match, ...capture) => '\\' + capture[0])
            .replace(/\*/g, '.*?');
        return new RegExp(`${value}$`);
    }
    function processExtensions(data) {
        this.application.extensions.forEach(ext => ext.processFile(data));
    }
    class File extends squared.base.File {
        reset() {
            super.reset();
            this._outputFileExclusions = undefined;
        }
        copyToDisk(directory, options) {
            this.copying(Object.assign(Object.assign({}, options), { assets: this.getAssetsAll().concat((options === null || options === void 0 ? void 0 : options.assets) || []), directory }));
        }
        appendToArchive(pathname, options) {
            this.archiving(Object.assign(Object.assign({ filename: this.userSettings.outputArchiveName }, options), { assets: this.getAssetsAll(options).concat((options === null || options === void 0 ? void 0 : options.assets) || []), appendTo: pathname }));
        }
        saveToArchive(filename, options) {
            this.archiving(Object.assign(Object.assign({}, options), { assets: this.getAssetsAll(options).concat((options === null || options === void 0 ? void 0 : options.assets) || []), filename }));
        }
        getHtmlPage(name, ignoreExtensions = false) {
            const result = [];
            const href = location.href;
            const data = parseUri(href);
            if (data) {
                if (name) {
                    data.filename = name;
                }
                else {
                    const filename = data.filename;
                    if (!FILE.NAME.test(filename)) {
                        data.pathname = appendSeparator(data.pathname, filename);
                        data.filename = 'index.html';
                    }
                }
                if (this.validFile(data)) {
                    data.mimeType = parseMimeType('html');
                    if (!ignoreExtensions) {
                        processExtensions.bind(this, data)();
                    }
                    result.push(data);
                }
            }
            return result;
        }
        getScriptAssets(ignoreExtensions = false) {
            const result = [];
            document.querySelectorAll('script').forEach(element => {
                const src = element.src.trim();
                if (src !== '') {
                    const uri = resolvePath(src);
                    const data = parseUri(uri);
                    if (this.validFile(data)) {
                        data.mimeType = element.type.trim() || parseMimeType(uri) || 'text/javascript';
                        if (!ignoreExtensions) {
                            processExtensions.bind(this, data)();
                        }
                        result.push(data);
                    }
                }
            });
            return result;
        }
        getLinkAssets(rel, ignoreExtensions = false) {
            const result = [];
            document.querySelectorAll(rel ? `link[rel="${rel}"]` : 'link').forEach((element) => {
                const href = element.href.trim();
                if (href !== '') {
                    const uri = resolvePath(href);
                    const data = parseUri(uri);
                    if (this.validFile(data)) {
                        switch (element.rel.trim()) {
                            case 'stylesheet':
                                data.mimeType = 'text/css';
                                break;
                            case 'icon':
                                data.mimeType = 'image/x-icon';
                                break;
                            default:
                                data.mimeType = element.type.trim() || parseMimeType(uri);
                                break;
                        }
                        if (!ignoreExtensions) {
                            processExtensions.bind(this, data)();
                        }
                        result.push(data);
                    }
                }
            });
            return result;
        }
        getImageAssets(ignoreExtensions = false) {
            const result = [];
            const processUri = (uri) => {
                if (uri !== '') {
                    const data = parseUri(uri);
                    if (this.validFile(data)) {
                        if (!ignoreExtensions) {
                            processExtensions.bind(this, data)();
                        }
                        result.push(data);
                    }
                }
            };
            if (this.userSettings.preloadImages) {
                for (const uri of ASSETS.image.keys()) {
                    processUri(uri);
                }
            }
            else {
                document.querySelectorAll('picture > source').forEach((source) => source.srcset.split(XML.SEPARATOR).forEach(uri => processUri(resolvePath(uri.split(CHAR.SPACE)[0]))));
                document.querySelectorAll('video').forEach((source) => processUri(resolvePath(source.poster)));
                document.querySelectorAll('img, input[type=image]').forEach((image) => {
                    const src = image.src.trim();
                    if (!src.startsWith('data:image/')) {
                        processUri(resolvePath(src));
                    }
                });
            }
            for (const [uri, rawData] of ASSETS.rawData) {
                const filename = rawData.filename;
                if (filename) {
                    const { pathname, base64, content, mimeType } = rawData;
                    let data;
                    if (pathname) {
                        data = { pathname, filename, uri };
                    }
                    else if (base64) {
                        data = { pathname: '__generated__/base64', filename, base64 };
                    }
                    else if (content && mimeType) {
                        data = { pathname: `__generated__/${mimeType.split('/').pop()}`, filename, content };
                    }
                    else {
                        continue;
                    }
                    if (this.validFile(data)) {
                        data.mimeType = mimeType;
                        if (!ignoreExtensions) {
                            processExtensions.bind(this, data)();
                        }
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
                images.forEach(src => {
                    if (COMPONENT.PROTOCOL.test(src) && result.findIndex(item => item.uri === src) === -1) {
                        const data = parseUri(src);
                        if (this.validFile(data)) {
                            result.push(data);
                        }
                    }
                });
            });
            if (this.userSettings.compressImages) {
                result.forEach(asset => {
                    if (Resource.canCompressImage(asset.filename)) {
                        safeNestedArray(asset, 'compress').unshift({ format: 'png' });
                    }
                });
            }
            return result;
        }
        getVideoAssets(ignoreExtensions = false) {
            return this.getRawAssets('video', ignoreExtensions);
        }
        getAudioAssets(ignoreExtensions = false) {
            return this.getRawAssets('audio', ignoreExtensions);
        }
        getFontAssets(ignoreExtensions = false) {
            const result = [];
            for (const fonts of ASSETS.fonts.values()) {
                fonts.forEach(font => {
                    const url = font.srcUrl;
                    if (url) {
                        const data = parseUri(url);
                        if (this.validFile(data)) {
                            if (!ignoreExtensions) {
                                processExtensions.bind(this, data)();
                            }
                            result.push(data);
                        }
                    }
                });
            }
            return result;
        }
        validFile(data) {
            if (data) {
                const fullpath = `${data.pathname}/${data.filename}`;
                return !this.outputFileExclusions.some(pattern => pattern.test(fullpath));
            }
            return false;
        }
        getRawAssets(tagName, ignoreExtensions = false) {
            const result = [];
            document.querySelectorAll(tagName).forEach((element) => {
                const items = new Set();
                resolveAssetSource(items, element.src);
                element.querySelectorAll('source').forEach((source) => resolveAssetSource(items, source.src));
                for (const uri of items) {
                    const data = parseUri(uri);
                    if (this.validFile(data)) {
                        if (!ignoreExtensions) {
                            processExtensions.bind(this, data)();
                        }
                        result.push(data);
                    }
                }
            });
            return result;
        }
        getAssetsAll(options = {}) {
            const { name, rel } = options;
            const saveAsWebPage = options.saveAsWebPage === true;
            const result = this.getHtmlPage(name, saveAsWebPage).concat(this.getLinkAssets(rel, saveAsWebPage));
            if (saveAsWebPage) {
                result.forEach(item => {
                    const mimeType = item.mimeType;
                    switch (mimeType) {
                        case 'text/html':
                        case 'text/css':
                        case 'application/xhtml+xml':
                            item.mimeType = '@' + mimeType;
                            break;
                    }
                });
            }
            return result.concat(this.getScriptAssets(saveAsWebPage))
                .concat(this.getImageAssets(saveAsWebPage))
                .concat(this.getVideoAssets(saveAsWebPage))
                .concat(this.getAudioAssets(saveAsWebPage))
                .concat(this.getFontAssets(saveAsWebPage));
        }
        get outputFileExclusions() {
            let result = this._outputFileExclusions;
            if (result === undefined) {
                result = objectMap(this.userSettings.outputFileExclusions, value => convertFileMatch(value));
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
            this._preferInitial = false;
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

    const { safeNestedArray: safeNestedArray$1 } = squared.lib.util;
    class Brotli extends Extension {
        constructor() {
            super(...arguments);
            this.options = {
                level: 11,
                mimeTypes: ['text/css', 'text/javascript', 'text/plain', 'text/csv', 'application/json', 'application/javascript', 'application/ld+json', 'application/xml']
            };
        }
        processFile(data) {
            const mimeType = data.mimeType;
            if (mimeType) {
                const { level, mimeTypes } = this.options;
                if (mimeTypes === "*" || mimeTypes.includes(mimeType)) {
                    safeNestedArray$1(data, 'compress').push({ format: 'br', level });
                    return true;
                }
            }
            return false;
        }
    }

    const { safeNestedArray: safeNestedArray$2 } = squared.lib.util;
    class Gzip extends Extension {
        constructor() {
            super(...arguments);
            this.options = {
                level: 9,
                mimeTypes: ['text/css', 'text/javascript', 'text/plain', 'text/csv', 'application/json', 'application/javascript', 'application/ld+json', 'application/xml']
            };
        }
        processFile(data) {
            const mimeType = data.mimeType;
            if (mimeType) {
                const { level, mimeTypes } = this.options;
                if (mimeTypes === '*' || mimeTypes.includes(mimeType)) {
                    safeNestedArray$2(data, 'compress').push({ format: 'gz', level });
                    return true;
                }
            }
            return false;
        }
    }

    const { safeNestedArray: safeNestedArray$3 } = squared.lib.util;
    class Jpeg extends Extension {
        constructor() {
            super(...arguments);
            this.options = {
                level: 100,
                mimeTypes: ['image/jpeg']
            };
        }
        processFile(data) {
            const mimeType = data.mimeType;
            if (mimeType) {
                const { level, mimeTypes } = this.options;
                if (mimeTypes === '*' && mimeType.startsWith('image/') || mimeTypes.includes(mimeType)) {
                    safeNestedArray$3(data, 'compress').push({ format: 'jpeg', level });
                    return true;
                }
            }
            return false;
        }
    }

    const { safeNestedArray: safeNestedArray$4 } = squared.lib.util;
    class Png extends Extension {
        constructor() {
            super(...arguments);
            this.options = {
                mimeTypes: ['image/png']
            };
        }
        processFile(data) {
            const mimeType = data.mimeType;
            if (mimeType) {
                const mimeTypes = this.options.mimeTypes;
                if (mimeTypes === '*' && mimeType.startsWith('image/') || mimeTypes.includes(mimeType)) {
                    safeNestedArray$4(data, 'compress').push({ format: 'png' });
                    return true;
                }
            }
            return false;
        }
    }

    class Bmp extends Extension {
        constructor() {
            super(...arguments);
            this.options = {
                mimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/tiff'],
                replaceWith: true,
                pickSmaller: false
            };
        }
        processFile(data) {
            const mimeType = data.mimeType;
            if (mimeType) {
                const options = this.options;
                if (options.mimeTypes.includes(mimeType)) {
                    let command = '';
                    if (options.replaceWith) {
                        command = '@';
                    }
                    else if (options.pickSmaller) {
                        command = '%';
                    }
                    data.mimeType = command + 'bmp:' + mimeType;
                    return true;
                }
            }
            return false;
        }
    }

    class Jpeg$1 extends Extension {
        constructor() {
            super(...arguments);
            this.options = {
                mimeTypes: ['image/png', 'image/bmp', 'image/gif', 'image/tiff'],
                replaceWith: true,
                pickSmaller: false
            };
        }
        processFile(data) {
            const mimeType = data.mimeType;
            if (mimeType) {
                const options = this.options;
                if (options.mimeTypes.includes(mimeType)) {
                    let command = '';
                    if (options.replaceWith) {
                        command = '@';
                    }
                    else if (options.pickSmaller) {
                        command = '%';
                    }
                    data.mimeType = command + 'jpeg:' + mimeType;
                    return true;
                }
            }
            return false;
        }
    }

    class Png$1 extends Extension {
        constructor() {
            super(...arguments);
            this.options = {
                mimeTypes: ['image/jpeg', 'image/bmp', 'image/gif', 'image/tiff'],
                replaceWith: true,
                pickSmaller: false
            };
        }
        processFile(data) {
            const mimeType = data.mimeType;
            if (mimeType) {
                const options = this.options;
                if (options.mimeTypes.includes(mimeType)) {
                    let command = '';
                    if (options.replaceWith) {
                        command = '@';
                    }
                    else if (options.pickSmaller) {
                        command = '%';
                    }
                    data.mimeType = command + 'png:' + mimeType;
                    return true;
                }
            }
            return false;
        }
    }

    class Gif extends Extension {
        constructor() {
            super(...arguments);
            this.options = {
                mimeTypes: ['image/png', 'image/jpeg', 'image/bmp', 'image/tiff'],
                replaceWith: true,
                pickSmaller: false
            };
        }
        processFile(data) {
            const mimeType = data.mimeType;
            if (mimeType) {
                const options = this.options;
                if (options.mimeTypes.includes(mimeType)) {
                    let command = '';
                    if (options.replaceWith) {
                        command = '@';
                    }
                    else if (options.pickSmaller) {
                        command = '%';
                    }
                    data.mimeType = command + 'gif:' + mimeType;
                    return true;
                }
            }
            return false;
        }
    }

    class Tiff extends Extension {
        constructor() {
            super(...arguments);
            this.options = {
                mimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/bmp'],
                replaceWith: true,
                pickSmaller: false
            };
        }
        processFile(data) {
            const mimeType = data.mimeType;
            if (mimeType) {
                const options = this.options;
                if (options.mimeTypes.includes(mimeType)) {
                    let command = '';
                    if (options.replaceWith) {
                        command = '@';
                    }
                    else if (options.pickSmaller) {
                        command = '%';
                    }
                    data.mimeType = command + 'tiff:' + mimeType;
                    return true;
                }
            }
            return false;
        }
    }

    const settings = {
        builtInExtensions: [],
        preloadImages: false,
        compressImages: false,
        excludePlainText: true,
        createQuerySelectorMap: true,
        showErrorMessages: false,
        outputFileExclusions: ['squared.*', 'chrome.framework.*'],
        outputEmptyCopyDirectory: false,
        outputArchiveName: 'chrome-data',
        outputArchiveFormat: 'zip'
    };

    var enumeration = /*#__PURE__*/Object.freeze({
        __proto__: null
    });

    const EXT_CHROME = {
        COMPRESS_BROTLI: 'chrome.compress.brotli',
        COMPRESS_GZIP: 'chrome.compress.gzip',
        COMPRESS_PNG: 'chrome.compress.png',
        COMPRESS_JPEG: 'chrome.compress.jpeg',
        CONVERT_PNG: 'chrome.convert.png',
        CONVERT_JPEG: 'chrome.convert.jpeg',
        CONVERT_BMP: 'chrome.convert.bmp',
        CONVERT_GIF: 'chrome.convert.gif',
        CONVERT_TIFF: 'chrome.convert.tiff'
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
    const { flatArray, isString, isObject } = squared.lib.util;
    const framework = 4 /* CHROME */;
    let initialized = false;
    let application;
    let controller;
    let file;
    let userSettings;
    let elementMap;
    function getCachedElement(element, cache) {
        if (!cache) {
            elementMap.clear();
            return undefined;
        }
        return elementMap.get(element);
    }
    function findElement(element, cache) {
        let result = getCachedElement(element, cache);
        if (result === undefined) {
            application.queryState = 1 /* SINGLE */;
            application.parseDocument(element);
            result = elementMap.get(element);
            application.queryState = 0 /* NONE */;
        }
        return result || null;
    }
    function findElementAsync(element, cache) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = getCachedElement(element, cache);
            if (result === undefined) {
                application.queryState = 1 /* SINGLE */;
                yield application.parseDocumentAsync(element);
                result = elementMap.get(element);
                application.queryState = 0 /* NONE */;
            }
            return result || null;
        });
    }
    function findElementAll(query) {
        application.queryState = 2 /* MULTIPLE */;
        let incomplete = false;
        const length = query.length;
        const result = new Array(length);
        for (let i = 0; i < length; ++i) {
            const element = query[i];
            let item = elementMap.get(element);
            if (item) {
                result[i] = item;
            }
            else {
                application.parseDocument(element);
                item = elementMap.get(element);
                if (item) {
                    result[i] = item;
                }
                else {
                    incomplete = true;
                }
            }
        }
        if (incomplete) {
            flatArray(result);
        }
        application.queryState = 0 /* NONE */;
        return result;
    }
    function findElementAllAsync(query) {
        return __awaiter(this, void 0, void 0, function* () {
            let incomplete = false;
            const length = query.length;
            const result = new Array(length);
            yield (() => __awaiter(this, void 0, void 0, function* () {
                for (let i = 0; i < length; ++i) {
                    const element = query[i];
                    const item = elementMap.get(element);
                    if (item) {
                        result[i] = item;
                    }
                    else {
                        application.queryState = 2 /* MULTIPLE */;
                        yield application.parseDocumentAsync(element).then(() => {
                            const awaited = elementMap.get(element);
                            if (awaited) {
                                result[i] = awaited;
                            }
                            else {
                                incomplete = true;
                            }
                        });
                    }
                }
            }))();
            if (incomplete) {
                flatArray(result);
            }
            application.queryState = 0 /* NONE */;
            return result;
        });
    }
    function createAssetsOptions(assets, options, directory, filename) {
        if (isObject(options)) {
            const items = options.assets;
            if (items) {
                assets = assets.concat(items);
            }
        }
        else {
            options = undefined;
        }
        return Object.assign(Object.assign({}, options), { assets,
            directory,
            filename });
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
            constant,
            enumeration
        },
        extensions: {
            compress: {
                Brotli: Brotli,
                Gzip: Gzip,
                Jpeg: Jpeg,
                Png: Png
            },
            convert: {
                Bmp: Bmp,
                Gif: Gif,
                Jpeg: Jpeg$1,
                Png: Png$1,
                Tiff: Tiff
            }
        },
        system: {
            getElementById(value, cache = true) {
                if (application) {
                    const element = document.getElementById(value);
                    if (element) {
                        return findElement(element, cache);
                    }
                }
                return null;
            },
            querySelector(value, cache = true) {
                if (application) {
                    const element = document.querySelector(value);
                    if (element) {
                        return findElement(element, cache);
                    }
                }
                return null;
            },
            querySelectorAll(value, cache = true) {
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
            getElement(element, cache = false) {
                if (application) {
                    return findElement(element, cache);
                }
                return null;
            },
            getElementMap() {
                return (controller === null || controller === void 0 ? void 0 : controller.elementMap) || new Map();
            },
            clearElementMap() {
                controller === null || controller === void 0 ? void 0 : controller.elementMap.clear();
            },
            copyHtmlPage(directory, options) {
                if (isString(directory)) {
                    file === null || file === void 0 ? void 0 : file.copying(createAssetsOptions(file.getHtmlPage(options === null || options === void 0 ? void 0 : options.name), options, directory));
                }
            },
            copyScriptAssets(directory, options) {
                if (isString(directory)) {
                    file === null || file === void 0 ? void 0 : file.copying(createAssetsOptions(file.getScriptAssets(), options, directory));
                }
            },
            copyLinkAssets(directory, options) {
                if (isString(directory)) {
                    file === null || file === void 0 ? void 0 : file.copying(createAssetsOptions(file.getLinkAssets(options === null || options === void 0 ? void 0 : options.rel), options, directory));
                }
            },
            copyImageAssets(directory, options) {
                if (file && isString(directory)) {
                    file.copying(createAssetsOptions(file.getImageAssets(), options, directory));
                }
            },
            copyVideoAssets(directory, options) {
                if (isString(directory)) {
                    file === null || file === void 0 ? void 0 : file.copying(createAssetsOptions(file.getVideoAssets(), options, directory));
                }
            },
            copyAudioAssets(directory, options) {
                if (isString(directory)) {
                    file === null || file === void 0 ? void 0 : file.copying(createAssetsOptions(file.getAudioAssets(), options, directory));
                }
            },
            copyFontAssets(directory, options) {
                if (isString(directory)) {
                    file === null || file === void 0 ? void 0 : file.copying(createAssetsOptions(file.getFontAssets(), options, directory));
                }
            },
            saveHtmlPage(filename, options) {
                file === null || file === void 0 ? void 0 : file.archiving(createAssetsOptions(file.getHtmlPage(options === null || options === void 0 ? void 0 : options.name), options, undefined, (filename || userSettings.outputArchiveName) + '-html'));
            },
            saveScriptAssets(filename, options) {
                file === null || file === void 0 ? void 0 : file.archiving(createAssetsOptions(file.getScriptAssets(), options, undefined, (filename || userSettings.outputArchiveName) + '-script'));
            },
            saveLinkAssets(filename, options) {
                file === null || file === void 0 ? void 0 : file.archiving(createAssetsOptions(file.getLinkAssets(options === null || options === void 0 ? void 0 : options.rel), options, undefined, (filename || userSettings.outputArchiveName) + '-link'));
            },
            saveImageAssets(filename, options) {
                file === null || file === void 0 ? void 0 : file.archiving(createAssetsOptions(file.getImageAssets(), options, undefined, (filename || userSettings.outputArchiveName) + '-image'));
            },
            saveVideoAssets(filename, options) {
                file === null || file === void 0 ? void 0 : file.archiving(createAssetsOptions(file.getVideoAssets(), options, undefined, (filename || userSettings.outputArchiveName) + '-video'));
            },
            saveAudioAssets(filename, options) {
                file === null || file === void 0 ? void 0 : file.archiving(createAssetsOptions(file.getAudioAssets(), options, undefined, (filename || userSettings.outputArchiveName) + '-audio'));
            },
            saveFontAssets(filename, options) {
                file === null || file === void 0 ? void 0 : file.archiving(createAssetsOptions(file.getFontAssets(), options, undefined, (filename || userSettings.outputArchiveName) + '-font'));
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
                [EC.COMPRESS_GZIP]: new Gzip(EC.COMPRESS_GZIP, framework),
                [EC.COMPRESS_JPEG]: new Jpeg(EC.COMPRESS_JPEG, framework),
                [EC.COMPRESS_PNG]: new Png(EC.COMPRESS_PNG, framework),
                [EC.CONVERT_BMP]: new Bmp(EC.CONVERT_BMP, framework),
                [EC.CONVERT_GIF]: new Gif(EC.CONVERT_GIF, framework),
                [EC.CONVERT_JPEG]: new Jpeg$1(EC.CONVERT_JPEG, framework),
                [EC.CONVERT_PNG]: new Png$1(EC.CONVERT_PNG, framework),
                [EC.CONVERT_TIFF]: new Tiff(EC.CONVERT_TIFF, framework)
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
        getElementById: (value, cache = true) => __awaiter(void 0, void 0, void 0, function* () {
            if (application) {
                const element = document.getElementById(value);
                if (element) {
                    return yield findElementAsync(element, cache);
                }
            }
            return null;
        }),
        querySelector: (value, cache = true) => __awaiter(void 0, void 0, void 0, function* () {
            if (application) {
                const element = document.querySelector(value);
                if (element) {
                    return yield findElementAsync(element, cache);
                }
            }
            return null;
        }),
        querySelectorAll: (value, cache = true) => __awaiter(void 0, void 0, void 0, function* () {
            if (application) {
                const query = document.querySelectorAll(value);
                if (query.length) {
                    if (!cache) {
                        elementMap.clear();
                    }
                    return yield findElementAllAsync(query);
                }
            }
            return null;
        }),
        getElement: (element, cache = false) => __awaiter(void 0, void 0, void 0, function* () {
            if (application) {
                return yield findElementAsync(element, cache);
            }
            return null;
        }),
        saveAsWebPage: (filename, options) => __awaiter(void 0, void 0, void 0, function* () {
            if (file) {
                if (!isObject(options)) {
                    options = {};
                }
                options.saveAsWebPage = true;
                const preloadImages = userSettings.preloadImages;
                userSettings.preloadImages = true;
                yield application.parseDocumentAsync(document.body).then(() => {
                    file.saveToArchive(filename || userSettings.outputArchiveName, options);
                    userSettings.preloadImages = preloadImages;
                });
            }
        })
    };

    return appBase;

}());
