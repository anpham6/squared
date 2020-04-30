/* chrome-framework 1.7.0
   https://github.com/anpham6/squared */

var chrome = (function () {
    'use strict';

    class Resource extends squared.base.Resource {
        constructor(application, cache) {
            super();
            this.application = application;
            this.cache = cache;
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
            this.systemName = 'chrome';
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

    const $lib$1 = squared.lib;
    const { CHAR, COMPONENT, FILE, XML } = $lib$1.regex;
    const { appendSeparator, convertWord, fromLastIndexOf, isString, objectMap, parseMimeType, resolvePath, spliceString, trimEnd } = $lib$1.util;
    const ASSETS = Resource.ASSETS;
    const REGEX_SRCSET = /\s*(.+?\.[^\s,]+).*?,\s*/;
    const REGEX_SRCSET_SPECIFIER = /\s+[0-9.][wx]$/;
    function parseUri(uri, saveAs) {
        var _a;
        const value = trimEnd(uri, '/');
        const match = COMPONENT.PROTOCOL.exec(value);
        if (match) {
            const host = match[2], port = match[3], path = match[4];
            let pathname = '', filename = '';
            let rootDir = '';
            let moveTo;
            let local;
            let append;
            const getDirectory = (start = 1) => {
                if (start > 1) {
                    rootDir = path.substring(0, start);
                }
                return path.substring(start, path.lastIndexOf('/'));
            };
            if (!value.startsWith(trimEnd(location.origin, '/'))) {
                pathname = convertWord(host) + (port ? '/' + port.substring(1) : '') + '/';
            }
            else {
                local = true;
            }
            if (saveAs) {
                let location = (_a = /saveAs:([^;"']+)/.exec(saveAs)) === null || _a === void 0 ? void 0 : _a[1];
                if (location) {
                    if (location.charAt(0) === '/') {
                        moveTo = '__serverroot__';
                        location = location.substring(1);
                    }
                    const parts = location.split('/');
                    filename = decodeURIComponent(parts.pop());
                    pathname = parts.join('/');
                    append = true;
                }
            }
            else if (path && path !== '/') {
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
                append,
                mimeType: extension && parseMimeType(extension)
            };
        }
        return undefined;
    }
    function resolveAssetSource(data, element) {
        const value = resolvePath(element.src);
        if (value !== '') {
            data.set(element, value);
        }
    }
    function convertFileMatch(value) {
        value = value.trim()
            .replace(/([.|/\\{}()?])/g, (match, ...capture) => '\\' + capture[0])
            .replace(/\*/g, '.*?');
        return new RegExp(`${value}$`);
    }
    function getExtensions(element) {
        var _a;
        const use = (_a = element === null || element === void 0 ? void 0 : element.dataset.use) === null || _a === void 0 ? void 0 : _a.trim();
        return use ? use.split(XML.SEPARATOR) : [];
    }
    function processExtensions(data, extensions, options) {
        const processed = [];
        if ((options === null || options === void 0 ? void 0 : options.ignoreExtensions) !== true) {
            this.application.extensions.forEach(ext => {
                if (ext.processFile(data)) {
                    processed.push(ext);
                }
            });
        }
        for (const name of extensions) {
            const ext = this.application.extensionManager.retrieve(name, true);
            if (ext && !processed.includes(ext)) {
                ext.processFile(data, true);
            }
        }
    }
    class File extends squared.base.File {
        reset() {
            super.reset();
            this._outputFileExclusions = undefined;
        }
        copyToDisk(directory, options) {
            return this.copying(Object.assign(Object.assign({}, options), { assets: this.getAssetsAll().concat((options === null || options === void 0 ? void 0 : options.assets) || []), directory }));
        }
        appendToArchive(pathname, options) {
            return this.archiving(Object.assign(Object.assign({ filename: this.userSettings.outputArchiveName }, options), { assets: this.getAssetsAll(options).concat((options === null || options === void 0 ? void 0 : options.assets) || []), appendTo: pathname }));
        }
        saveToArchive(filename, options) {
            return this.archiving(Object.assign(Object.assign({}, options), { assets: this.getAssetsAll(options).concat((options === null || options === void 0 ? void 0 : options.assets) || []), filename }));
        }
        getHtmlPage(options) {
            const result = [];
            const href = location.href;
            const data = parseUri(href);
            if (data) {
                const name = options === null || options === void 0 ? void 0 : options.name;
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
                    processExtensions.call(this, data, getExtensions(document.querySelector('html')), options);
                    result.push(data);
                }
            }
            return result;
        }
        getScriptAssets(options) {
            var _a;
            const result = [];
            const saveAs = (_a = options === null || options === void 0 ? void 0 : options.saveAs) === null || _a === void 0 ? void 0 : _a.script;
            document.querySelectorAll('script').forEach(element => {
                let file = element.dataset.chromeFile;
                if (file !== 'exclude') {
                    if (!isString(file)) {
                        file = saveAs;
                    }
                    const src = element.src.trim();
                    if (src !== '') {
                        const data = parseUri(resolvePath(src), file);
                        if (this.validFile(data)) {
                            data.mimeType = element.type.trim() || parseMimeType(data.uri) || 'text/javascript';
                            processExtensions.call(this, data, getExtensions(element), options);
                            result.push(data);
                        }
                    }
                }
            });
            return result;
        }
        getLinkAssets(options) {
            var _a;
            const result = [];
            const rel = options === null || options === void 0 ? void 0 : options.rel;
            const saveAs = (_a = options === null || options === void 0 ? void 0 : options.saveAs) === null || _a === void 0 ? void 0 : _a.script;
            document.querySelectorAll(rel ? `link[rel="${rel}"]` : 'link').forEach((element) => {
                let file = element.dataset.chromeFile;
                if (file !== 'exclude') {
                    if (!isString(file)) {
                        file = saveAs;
                    }
                    const href = element.href.trim();
                    if (href !== '') {
                        const data = parseUri(resolvePath(href), file);
                        if (this.validFile(data)) {
                            switch (element.rel.trim()) {
                                case 'stylesheet':
                                    data.mimeType = 'text/css';
                                    break;
                                case 'icon':
                                    data.mimeType = 'image/x-icon';
                                    break;
                                default:
                                    data.mimeType = element.type.trim() || parseMimeType(data.uri);
                                    break;
                            }
                            processExtensions.call(this, data, getExtensions(element), options);
                            result.push(data);
                        }
                    }
                }
            });
            return result;
        }
        getImageAssets(options) {
            const result = [];
            const processUri = (element, uri) => {
                if (uri !== '') {
                    const data = parseUri(uri);
                    if (this.validFile(data) && !result.find(item => item.uri === uri)) {
                        processExtensions.call(this, data, getExtensions(element), options);
                        result.push(data);
                    }
                }
            };
            document.querySelectorAll('picture > source').forEach((source) => source.srcset.split(XML.SEPARATOR).forEach(uri => processUri(source, resolvePath(uri.split(CHAR.SPACE)[0]))));
            document.querySelectorAll('video').forEach((source) => processUri(source, resolvePath(source.poster)));
            document.querySelectorAll('img, input[type=image]').forEach((image) => {
                const src = image.src.trim();
                if (!src.startsWith('data:image/')) {
                    processUri(image, resolvePath(src));
                }
            });
            document.querySelectorAll('img[srcset], picture > source[srcset]').forEach((element) => {
                const images = [];
                let srcset = element.srcset.trim();
                let match;
                while ((match = REGEX_SRCSET.exec(srcset)) !== null) {
                    images.push(match[1]);
                    srcset = spliceString(srcset, match.index, match[0].length);
                }
                images.push(srcset.trim().replace(REGEX_SRCSET_SPECIFIER, ''));
                images.forEach(src => {
                    if (src !== '') {
                        processUri(element, resolvePath(src));
                    }
                });
            });
            for (const uri of ASSETS.image.keys()) {
                processUri(null, uri);
            }
            for (const rawData of ASSETS.rawData.values()) {
                if (rawData.pathname) {
                    continue;
                }
                else {
                    const { base64, content, filename, mimeType } = rawData;
                    let data;
                    if (base64) {
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
                        processExtensions.call(this, data, [], options);
                        result.push(data);
                    }
                }
            }
            return result;
        }
        getVideoAssets(options) {
            return this.getRawAssets('video', options);
        }
        getAudioAssets(options) {
            return this.getRawAssets('audio', options);
        }
        getFontAssets(options) {
            const result = [];
            for (const fonts of ASSETS.fonts.values()) {
                fonts.forEach(font => {
                    const url = font.srcUrl;
                    if (url) {
                        const data = parseUri(url);
                        if (this.validFile(data)) {
                            processExtensions.call(this, data, [], options);
                            result.push(data);
                        }
                    }
                });
            }
            return result;
        }
        validFile(data) {
            if (data) {
                const fullpath = data.pathname + '/' + data.filename;
                return !this.outputFileExclusions.some(pattern => pattern.test(fullpath));
            }
            return false;
        }
        getRawAssets(tagName, options) {
            const result = [];
            document.querySelectorAll(tagName).forEach((element) => {
                const items = new Map();
                resolveAssetSource(items, element);
                element.querySelectorAll('source').forEach((source) => resolveAssetSource(items, source));
                for (const [item, uri] of items.entries()) {
                    const data = parseUri(uri);
                    if (this.validFile(data)) {
                        processExtensions.call(this, data, getExtensions(item), options);
                        result.push(data);
                    }
                }
            });
            return result;
        }
        getAssetsAll(options = {}) {
            const saveAsWebPage = options.saveAsWebPage === true;
            if (saveAsWebPage) {
                options = Object.assign(Object.assign({}, options), { ignoreExtensions: true });
            }
            const result = this.getHtmlPage(options).concat(this.getLinkAssets(options));
            if (options.saveAsWebPage) {
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
            return result.concat(this.getScriptAssets(options))
                .concat(this.getImageAssets(options))
                .concat(this.getVideoAssets(options))
                .concat(this.getAudioAssets(options))
                .concat(this.getFontAssets(options));
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
        constructor(id, sessionId, element) {
            super(id, sessionId, element);
            this._cached = {};
            this._preferInitial = false;
            this.init();
        }
    }

    class Extension extends squared.base.Extension {
        processFile(data, override = false) {
            return false;
        }
    }

    const { safeNestedArray } = squared.lib.util;
    class Brotli extends Extension {
        constructor() {
            super(...arguments);
            this.options = {
                level: 11,
                mimeTypes: ['text/css', 'text/javascript', 'text/plain', 'text/csv', 'application/json', 'application/javascript', 'application/ld+json', 'application/xml']
            };
        }
        processFile(data, override = false) {
            if (!override) {
                const mimeType = data.mimeType;
                if (mimeType) {
                    const mimeTypes = this.options.mimeTypes;
                    override = mimeTypes === "*" || mimeTypes.includes(mimeType);
                }
            }
            if (override) {
                safeNestedArray(data, 'compress').push({ format: 'br', level: this.options.level });
                return true;
            }
            return false;
        }
    }

    const { safeNestedArray: safeNestedArray$1 } = squared.lib.util;
    class Gzip extends Extension {
        constructor() {
            super(...arguments);
            this.options = {
                level: 9,
                mimeTypes: ['text/css', 'text/javascript', 'text/plain', 'text/csv', 'application/json', 'application/javascript', 'application/ld+json', 'application/xml']
            };
        }
        processFile(data, override = false) {
            if (!override) {
                const mimeType = data.mimeType;
                if (mimeType) {
                    const mimeTypes = this.options.mimeTypes;
                    override = mimeTypes === "*" || mimeTypes.includes(mimeType);
                }
            }
            if (override) {
                safeNestedArray$1(data, 'compress').push({ format: 'gz', level: this.options.level });
                return true;
            }
            return false;
        }
    }

    const { safeNestedArray: safeNestedArray$2 } = squared.lib.util;
    class Jpeg extends Extension {
        constructor() {
            super(...arguments);
            this.options = {
                level: 100,
                mimeTypes: ['image/jpeg']
            };
        }
        processFile(data, override = false) {
            if (!override) {
                const mimeType = data.mimeType;
                if (mimeType) {
                    const mimeTypes = this.options.mimeTypes;
                    override = /[@%]jpeg:/.test(mimeType) || Array.isArray(mimeTypes) && !!mimeTypes.find(value => mimeType.endsWith(value)) || mimeTypes === '*' && mimeType.includes('image/');
                }
            }
            if (override) {
                safeNestedArray$2(data, 'compress').push({ format: 'png' }, { format: 'jpeg', level: this.options.level });
                return true;
            }
            return false;
        }
    }

    const { safeNestedArray: safeNestedArray$3 } = squared.lib.util;
    class Png extends Extension {
        constructor() {
            super(...arguments);
            this.options = {
                mimeTypes: ['image/png']
            };
        }
        processFile(data, override = false) {
            if (!override) {
                const mimeType = data.mimeType;
                if (mimeType) {
                    const mimeTypes = this.options.mimeTypes;
                    override = /[@%]png:/.test(mimeType) || Array.isArray(mimeTypes) && !!mimeTypes.find(value => mimeType.endsWith(value)) || mimeTypes === '*' && mimeType.includes('image/');
                }
            }
            if (override) {
                safeNestedArray$3(data, 'compress').push({ format: 'png' });
                return true;
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
        processFile(data, override = false) {
            const mimeType = data.mimeType;
            if (mimeType) {
                const options = this.options;
                if (override || options.mimeTypes.find(value => mimeType.endsWith(value))) {
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
        processFile(data, override = false) {
            const mimeType = data.mimeType;
            if (mimeType) {
                const options = this.options;
                if (override || options.mimeTypes.find(value => mimeType.endsWith(value))) {
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
        processFile(data, override = false) {
            const mimeType = data.mimeType;
            if (mimeType) {
                const options = this.options;
                if (override || options.mimeTypes.find(value => mimeType.endsWith(value))) {
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
        processFile(data, override = false) {
            const mimeType = data.mimeType;
            if (mimeType) {
                const options = this.options;
                if (override || options.mimeTypes.find(value => mimeType.endsWith(value))) {
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
        processFile(data, override = false) {
            const mimeType = data.mimeType;
            if (mimeType) {
                const options = this.options;
                if (override || options.mimeTypes.find(value => mimeType.endsWith(value))) {
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
        excludePlainText: true,
        createQuerySelectorMap: true,
        showErrorMessages: false,
        outputFileExclusions: [],
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

    const { util, session } = squared.lib;
    const { flatArray, isString: isString$1, isObject, promisify } = util;
    const { frameworkNotInstalled } = session;
    const framework = 4 /* CHROME */;
    let initialized = false;
    let application;
    let controller;
    let file;
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
            (async () => { await application.parseDocument(element); })();
            result = elementMap.get(element);
            application.queryState = 0 /* NONE */;
        }
        return result || null;
    }
    function findElementAll(query) {
        application.queryState = 2 /* MULTIPLE */;
        let incomplete = false;
        const length = query.length;
        const result = new Array(length);
        (async () => {
            for (let i = 0; i < length; ++i) {
                const element = query[i];
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
            flatArray(result);
        }
        application.queryState = 0 /* NONE */;
        return result;
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
                if (isString$1(directory)) {
                    file === null || file === void 0 ? void 0 : file.copying(createAssetsOptions(file.getHtmlPage(options), options, directory));
                }
            },
            copyScriptAssets(directory, options) {
                if (isString$1(directory)) {
                    file === null || file === void 0 ? void 0 : file.copying(createAssetsOptions(file.getScriptAssets(options), options, directory));
                }
            },
            copyLinkAssets(directory, options) {
                if (isString$1(directory)) {
                    file === null || file === void 0 ? void 0 : file.copying(createAssetsOptions(file.getLinkAssets(options), options, directory));
                }
            },
            copyImageAssets(directory, options) {
                if (file && isString$1(directory)) {
                    file.copying(createAssetsOptions(file.getImageAssets(options), options, directory));
                }
            },
            copyVideoAssets(directory, options) {
                if (isString$1(directory)) {
                    file === null || file === void 0 ? void 0 : file.copying(createAssetsOptions(file.getVideoAssets(options), options, directory));
                }
            },
            copyAudioAssets(directory, options) {
                if (isString$1(directory)) {
                    file === null || file === void 0 ? void 0 : file.copying(createAssetsOptions(file.getAudioAssets(options), options, directory));
                }
            },
            copyFontAssets(directory, options) {
                if (isString$1(directory)) {
                    file === null || file === void 0 ? void 0 : file.copying(createAssetsOptions(file.getFontAssets(options), options, directory));
                }
            },
            saveHtmlPage(filename, options) {
                file === null || file === void 0 ? void 0 : file.archiving(createAssetsOptions(file.getHtmlPage(options), options, undefined, (filename || application.userSettings.outputArchiveName) + '-html'));
            },
            saveScriptAssets(filename, options) {
                file === null || file === void 0 ? void 0 : file.archiving(createAssetsOptions(file.getScriptAssets(options), options, undefined, (filename || application.userSettings.outputArchiveName) + '-script'));
            },
            saveLinkAssets(filename, options) {
                file === null || file === void 0 ? void 0 : file.archiving(createAssetsOptions(file.getLinkAssets(options), options, undefined, (filename || application.userSettings.outputArchiveName) + '-link'));
            },
            saveImageAssets(filename, options) {
                file === null || file === void 0 ? void 0 : file.archiving(createAssetsOptions(file.getImageAssets(options), options, undefined, (filename || application.userSettings.outputArchiveName) + '-image'));
            },
            saveVideoAssets(filename, options) {
                file === null || file === void 0 ? void 0 : file.archiving(createAssetsOptions(file.getVideoAssets(options), options, undefined, (filename || application.userSettings.outputArchiveName) + '-video'));
            },
            saveAudioAssets(filename, options) {
                file === null || file === void 0 ? void 0 : file.archiving(createAssetsOptions(file.getAudioAssets(options), options, undefined, (filename || application.userSettings.outputArchiveName) + '-audio'));
            },
            saveFontAssets(filename, options) {
                file === null || file === void 0 ? void 0 : file.archiving(createAssetsOptions(file.getFontAssets(options), options, undefined, (filename || application.userSettings.outputArchiveName) + '-font'));
            }
        },
        create() {
            const EC = EXT_CHROME;
            application = new Application(framework, View, Controller, Resource);
            controller = application.controllerHandler;
            file = new File();
            application.resourceHandler.setFileHandler(file);
            elementMap = controller.elementMap;
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
                userSettings: Object.assign({}, settings)
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
        getElementById: (value, cache = true) => {
            if (application) {
                const element = document.getElementById(value);
                if (element) {
                    return promisify(findElement)(element, cache);
                }
            }
            return frameworkNotInstalled();
        },
        querySelector: (value, cache = true) => {
            if (application) {
                const element = document.querySelector(value);
                if (element) {
                    return promisify(findElement)(element, cache);
                }
            }
            return frameworkNotInstalled();
        },
        querySelectorAll: (value, cache = true) => {
            if (application) {
                const query = document.querySelectorAll(value);
                if (query.length) {
                    if (!cache) {
                        elementMap.clear();
                    }
                    return promisify(findElementAll)(query);
                }
            }
            return frameworkNotInstalled();
        },
        getElement: (element, cache = false) => {
            if (application) {
                return promisify(findElement)(element, cache);
            }
            return frameworkNotInstalled();
        },
        saveAsWebPage: (filename, options) => {
            if (file) {
                options = !isObject(options) ? {} : Object.assign({}, options);
                options.saveAsWebPage = true;
                const settings = application.userSettings;
                const restoreValue = settings.preloadImages;
                settings.preloadImages = true;
                application.reset();
                return application.parseDocument(document.body).then((response) => {
                    file.saveToArchive(filename || application.userSettings.outputArchiveName, options);
                    settings.preloadImages = restoreValue;
                    return response;
                });
            }
            return frameworkNotInstalled();
        }
    };

    return appBase;

}());
