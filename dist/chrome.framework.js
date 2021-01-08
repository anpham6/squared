/* chrome-framework 2.3.3
   https://github.com/anpham6/squared */

var chrome = (function () {
    'use strict';

    const { UNABLE_TO_FINALIZE_DOCUMENT, reject } = squared.lib.error;
    const { isPlainObject } = squared.lib.util;
    class Application extends squared.base.Application {
        constructor() {
            super(...arguments);
            this.extensions = [];
            this.systemName = 'chrome';
        }
        init() {
            this.session.unusedStyles = new Set();
        }
        reset() {
            this.session.unusedStyles.clear();
            super.reset();
        }
        insertNode(processing, element) {
            if (element.nodeName[0] === '#') {
                if (this.userSettings.excludePlainText) {
                    return;
                }
                this.controllerHandler.applyDefaultStyles(element, processing.sessionId);
            }
            return this.createNodeStatic(processing, element);
        }
        saveAs(filename, options) {
            return this.processAssets('saveAs', filename, options);
        }
        copyTo(directory, options) {
            return this.processAssets('copyTo', directory, options);
        }
        appendTo(uri, options) {
            return this.processAssets('appendTo', uri, options);
        }
        async processAssets(module, pathname, options) {
            this.reset();
            if (!this.parseDocumentSync()) {
                return reject(UNABLE_TO_FINALIZE_DOCUMENT);
            }
            options = !isPlainObject(options) ? {} : Object.assign({}, options);
            options.saveAsWebPage = true;
            const fileHandler = this.fileHandler;
            if (options.removeUnusedStyles) {
                const unusedStyles = Array.from(this.session.unusedStyles);
                if (unusedStyles.length) {
                    options.unusedStyles = options.unusedStyles ? Array.from(new Set(options.unusedStyles.concat(unusedStyles))) : unusedStyles;
                }
            }
            if (options.configUri) {
                const assetMap = new Map();
                options.assetMap = assetMap;
                options.database || (options.database = []);
                const database = options.database;
                const config = await fileHandler.loadData(options.configUri, { type: 'json', cache: options.cache });
                if (config) {
                    if (config.success && Array.isArray(config.data)) {
                        const data = config.data;
                        const paramMap = new Map();
                        if (location.href.includes('?')) {
                            new URLSearchParams(location.search).forEach((value, key) => paramMap.set(key, [new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), value]));
                        }
                        const replaceParams = (param) => {
                            if (param) {
                                if (typeof param !== 'number' && typeof param !== 'boolean') {
                                    const original = param;
                                    const converted = typeof param === 'object' || Array.isArray(param);
                                    if (converted) {
                                        param = JSON.stringify(param);
                                    }
                                    const current = param;
                                    for (const [pattern, value] of paramMap.values()) {
                                        param = param.replace(pattern, value);
                                    }
                                    if (current === param) {
                                        return original;
                                    }
                                    if (converted) {
                                        try {
                                            return JSON.parse(param);
                                        }
                                        catch (_a) {
                                            return original;
                                        }
                                    }
                                }
                            }
                            return param;
                        };
                        for (const item of data) {
                            if (item.selector) {
                                const cloudDatabase = item.cloudDatabase;
                                if (cloudDatabase && paramMap.size) {
                                    for (const attr in cloudDatabase) {
                                        if (attr !== 'value') {
                                            cloudDatabase[attr] = replaceParams(cloudDatabase[attr]);
                                        }
                                    }
                                }
                                document.querySelectorAll(item.selector).forEach(element => {
                                    switch (item.type) {
                                        case 'text':
                                        case 'attribute':
                                            if (cloudDatabase) {
                                                database.push(Object.assign(Object.assign({}, cloudDatabase), { element: { outerHTML: element.outerHTML } }));
                                            }
                                            break;
                                        default:
                                            assetMap.set(element, item);
                                            break;
                                    }
                                });
                            }
                        }
                    }
                    else if (config.error) {
                        fileHandler.writeErrorMesssage(config.error);
                    }
                    if (database.length === 0) {
                        delete options.database;
                    }
                }
            }
            return fileHandler[module](pathname, options);
        }
        get initializing() {
            return false;
        }
        get length() {
            return 1;
        }
    }

    class Extension extends squared.base.Extension {
        processFile(data) {
            return true;
        }
    }

    var Pattern = squared.lib.base.Pattern;
    const { FILE } = squared.lib.regex;
    const ASSETS = squared.base.Resource.ASSETS;
    const { convertWord, fromLastIndexOf, parseMimeType, replaceMap, resolvePath, splitPair, splitPairStart, trimEnd } = squared.lib.util;
    const { appendSeparator, parseWatchInterval } = squared.base.lib.util;
    const RE_SRCSET = new Pattern(/\s*(.+?\.[^\s,]+)(\s+[\d.]+[wx])?\s*,?/g);
    const FILENAME_MAP = new WeakMap();
    let BUNDLE_ID = 0;
    function parseFileAs(attr, value) {
        if (value) {
            const match = new RegExp(`${attr}:\\s*((?:[^"]|\\\\")+)`).exec(normalizePath(value));
            if (match) {
                const segments = replaceMap(match[1].split('::'), item => item.trim());
                return { file: segments[0], format: segments[1] };
            }
        }
    }
    function parseOptions(value) {
        if (value) {
            let compress;
            const pattern = /\bcompress\[\s*([a-z\d]+)\s*\]/g;
            let match;
            while (match = pattern.exec(value)) {
                (compress || (compress = [])).push({ format: match[1] });
            }
            return {
                preserve: value.includes('preserve'),
                inline: value.includes('inline'),
                compress
            };
        }
        return {};
    }
    function getFilePath(value, saveTo, ext) {
        value = normalizePath(value);
        if (value.startsWith('./')) {
            value = value.substring(2);
        }
        if (!value.includes('/')) {
            return ['', '', value];
        }
        let moveTo;
        if (value[0] === '/') {
            moveTo = "__serverroot__" /* SERVERROOT */;
        }
        else if (value.startsWith('../')) {
            moveTo = "__serverroot__" /* SERVERROOT */;
            const pathname = location.pathname.split('/');
            if (--pathname.length) {
                for (let i = 0, length = value.length; i < length; i += 3) {
                    if (value.substring(i, i + 3) !== '../' || --pathname.length === 0) {
                        break;
                    }
                }
            }
            value = pathname.join('/') + '/' + value.split('../').pop();
        }
        const result = splitPair(value, '/', false, true);
        if (saveTo) {
            result[1] = assignFilename(result[1], ext);
        }
        return [moveTo, result[0], result[1]];
    }
    function assignFilename(value, ext) {
        ext || (ext = getFileExt(value));
        return "__assign__" /* ASSIGN */ + (ext ? '.' + ext : 'unknown');
    }
    function resolveAssetSource(element, data) {
        const value = resolvePath(element instanceof HTMLObjectElement ? element.data : element.src);
        if (value) {
            data.set(element, value);
        }
    }
    function setBundleIndex(bundleIndex) {
        for (const pathUri in bundleIndex) {
            const items = bundleIndex[pathUri];
            const length = items.length;
            if (length > 1) {
                const urls = [];
                const id = ++BUNDLE_ID;
                for (let i = 0; i < length; ++i) {
                    const item = items[i];
                    item.bundleId = id;
                    item.bundleIndex = i;
                    if (i > 0) {
                        delete item.cloudStorage;
                    }
                    if (urls && item.uri) {
                        urls.push(new URL(item.uri));
                    }
                }
                invalid: {
                    if (urls.length === length) {
                        const origin = urls[0].origin;
                        const baseDir = urls[0].pathname.split('/');
                        for (let i = 1; i < length; ++i) {
                            const url = urls[i];
                            if (url.origin === origin) {
                                if (baseDir.length) {
                                    const parts = url.pathname.split('/');
                                    for (let j = 0; j < parts.length; ++j) {
                                        if (baseDir[j] !== parts[j]) {
                                            baseDir.splice(j, Infinity);
                                            break;
                                        }
                                    }
                                }
                            }
                            else {
                                break invalid;
                            }
                        }
                        items[0].bundleRoot = origin + baseDir.join('/') + '/';
                    }
                }
            }
        }
    }
    function createBundleAsset(assets, element, file, format, preserve, inline) {
        const content = element.innerHTML;
        if (content.trim()) {
            const [moveTo, pathname, filename] = getFilePath(file);
            const previous = assets[assets.length - 1];
            const data = {
                uri: resolvePath(file, location.href),
                pathname,
                filename,
                moveTo,
                content,
                format,
                preserve,
                inlineContent: inline ? getContentType(element) : undefined,
                document: ['chrome']
            };
            if (previous && hasSamePath(previous, data, true)) {
                (previous.trailingContent || (previous.trailingContent = [])).push(content);
            }
            else {
                checkFilename(assets, data);
                return data;
            }
        }
        return null;
    }
    function setBundleData(bundleIndex, data) {
        const pathUri = (data.moveTo || '') + data.pathname + '/' + data.filename;
        (bundleIndex[pathUri] || (bundleIndex[pathUri] = [])).push(data);
    }
    function checkBundleStart(assets, data) {
        for (let i = 0, length = assets.length; i < length; ++i) {
            if (hasSamePath(assets[i], data)) {
                for (let j = i + 1; j < length; ++j) {
                    if (!hasSamePath(assets[j], data)) {
                        checkFilename(assets, data);
                        return true;
                    }
                }
                return false;
            }
        }
        checkFilename(assets, data);
        return true;
    }
    function checkFilename(assets, data) {
        const filename = data.filename;
        let i = 0;
        while (assets.find(item => hasSamePath(item, data))) {
            const [start, end] = splitPair(data.filename, '.');
            data.filename = start + '_' + ++i + (end ? '.' + end : '');
        }
        if (i > 0) {
            FILENAME_MAP.set(data, filename);
        }
    }
    function getContentType(element) {
        switch (element.tagName) {
            case 'SCRIPT':
                return 'script';
            case 'LINK':
            case 'STYLE':
                return 'style';
        }
    }
    function excludeAsset(assets, command, outerHTML) {
        if (command.exclude) {
            assets.push({
                pathname: '',
                filename: '',
                exclude: true,
                outerHTML
            });
            return true;
        }
        if (command.ignore) {
            return true;
        }
        return false;
    }
    function checkSaveAs(uri, pathname, filename) {
        if (filename) {
            const value = getCustomPath(uri, pathname, filename);
            if (value) {
                return [value, false];
            }
        }
        else if (pathname && pathname !== '~') {
            return [pathname, true];
        }
        return ['', false];
    }
    function setOutputModifiers(item, compress, tasks, cloudStorage, attributes) {
        if (compress) {
            (item.compress || (item.compress = [])).push(...compress);
        }
        if (tasks) {
            item.tasks = tasks;
        }
        if (attributes) {
            item.attributes = attributes;
        }
        if (cloudStorage) {
            item.cloudStorage = cloudStorage;
        }
    }
    function getCustomPath(uri, pathname, filename) {
        if (uri && (!pathname || pathname === '~')) {
            const asset = new URL(uri);
            if (location.origin === asset.origin) {
                const length = location.origin.length;
                const seg = uri.substring(length + 1).split('/');
                for (const dir of location.href.substring(length + 1).split('/')) {
                    if (dir !== seg.shift()) {
                        return '';
                    }
                }
                pathname = seg.join('/');
            }
        }
        return appendSeparator(pathname, filename);
    }
    function getPageFilename() {
        const filename = location.href.split('/').pop().split('?')[0];
        return /\.html?$/.exec(filename) ? filename : 'index.html';
    }
    const hasSamePath = (item, other, bundle) => item.pathname === other.pathname && (item.filename === other.filename || FILENAME_MAP.get(item) === other.filename || bundle && item.filename.startsWith("__assign__" /* ASSIGN */)) && (item.moveTo || '') === (other.moveTo || '');
    const getTasks = (element) => { var _a; return (_a = element.dataset.chromeTasks) === null || _a === void 0 ? void 0 : _a.trim().split(/\s*\+\s*/); };
    const getMimeType = (element, src, fallback) => element.type.trim().toLowerCase() || src && parseMimeType(src) || fallback;
    const getFileExt = (value) => value.includes('.') ? fromLastIndexOf(value, '.').trim().toLowerCase() : '';
    const getDirectory = (path, start) => path.substring(start, path.lastIndexOf('/'));
    const normalizePath = (value) => value.replace(/\\+/g, '/');
    class File extends squared.base.File {
        static parseUri(uri, options) {
            let element, saveAs, format, saveTo, inline, outerHTML, fromConfig;
            if (options) {
                ({ element, saveAs, format, saveTo, inline, fromConfig } = options);
            }
            let value = trimEnd(uri, '/'), file;
            const local = value.startsWith(trimEnd(location.origin, '/'));
            if (saveAs) {
                saveAs = trimEnd(normalizePath(saveAs), '/');
                if (saveTo || fromConfig) {
                    file = saveAs;
                }
                else {
                    const data = parseFileAs('saveAs', saveAs);
                    if (data) {
                        ({ file, format } = data);
                        if (inline && element) {
                            outerHTML = element.outerHTML;
                        }
                    }
                    else {
                        file = saveAs;
                    }
                }
                if (file === '~') {
                    file = '';
                }
                if (local && file) {
                    value = resolvePath(file, location.href);
                }
            }
            if (!local && !file && options && options.preserveCrossOrigin) {
                return null;
            }
            const match = FILE.PROTOCOL.exec(value);
            if (match) {
                const host = match[2];
                const port = match[3];
                const path = match[4] || '';
                const ext = getFileExt(uri);
                let pathname = '', filename = '', prefix = '', rootDir, moveTo;
                if (file && saveTo) {
                    [moveTo, pathname, filename] = getFilePath(appendSeparator(file, "__assign__" /* ASSIGN */ + (ext ? '.' + ext : '')));
                }
                else if (!local) {
                    pathname = convertWord(host) + (port ? '/' + port.substring(1) : '') + '/';
                }
                else {
                    prefix = splitPairStart(location.pathname, '/', false, true) + '/';
                    let length = path.length;
                    if (length) {
                        let index = 0;
                        length = Math.min(length, prefix.length);
                        for (let i = 0; i < length; ++i) {
                            if (path[i] === prefix[i]) {
                                index = i;
                            }
                            else {
                                break;
                            }
                        }
                        rootDir = path.substring(0, index + 1);
                    }
                }
                if (!filename) {
                    if (file) {
                        [moveTo, pathname, filename] = getFilePath(file);
                    }
                    else if (path && path !== '/') {
                        filename = fromLastIndexOf(path, '/', '\\');
                        if (local) {
                            if (path.startsWith(prefix)) {
                                pathname = getDirectory(path, prefix.length);
                            }
                            else {
                                moveTo = "__serverroot__" /* SERVERROOT */;
                                rootDir = '';
                                pathname = getDirectory(path, 0);
                            }
                        }
                        else {
                            pathname += getDirectory(path, 1);
                        }
                    }
                }
                return {
                    uri,
                    rootDir,
                    moveTo,
                    pathname: normalizePath(decodeURIComponent(pathname)),
                    filename: decodeURIComponent(filename),
                    mimeType: ext && parseMimeType(ext),
                    format,
                    outerHTML,
                    inlineContent: inline && element ? getContentType(element) : undefined,
                    document: ['chrome']
                };
            }
            return null;
        }
        copyTo(directory, options = {}) {
            options.directory = directory;
            return this.copying(this.processAssets(options));
        }
        appendTo(pathname, options = {}) {
            options.appendTo = pathname;
            return this.archiving(this.processAssets(options));
        }
        saveAs(filename, options = {}) {
            options.filename = filename;
            return this.archiving(this.processAssets(options));
        }
        getHtmlPage(options) {
            var _a, _b;
            const element = document.documentElement;
            let file = element.dataset.chromeFile;
            if (file === 'ignore') {
                return [];
            }
            let assetMap, preserveCrossOrigin, saveAsHtml;
            if (options) {
                ({ preserveCrossOrigin, assetMap } = options);
                saveAsHtml = (_a = options.saveAs) === null || _a === void 0 ? void 0 : _a.html;
            }
            let filename, format, process, compress, tasks, cloudStorage, attributes;
            if (assetMap && assetMap.has(element)) {
                const command = assetMap.get(element);
                if (command.ignore || command.exclude) {
                    return [];
                }
                ({ filename, process, compress, tasks, cloudStorage, attributes } = command);
            }
            else if (saveAsHtml) {
                if (saveAsHtml.ignore || saveAsHtml.exclude) {
                    return [];
                }
                ({ filename, process, compress, tasks, cloudStorage, attributes } = saveAsHtml);
            }
            else {
                tasks = getTasks(element);
            }
            if (filename) {
                file = '';
            }
            if (process) {
                format = process.join('+');
            }
            const data = File.parseUri(location.href, { preserveCrossOrigin, saveAs: file, format });
            if (this.processExtensions(data)) {
                setOutputModifiers(data, compress, tasks, cloudStorage, attributes);
                if (attributes) {
                    data.outerHTML = (_b = /^\s*<[\S\s]*html[^>]+>\s*/i.exec(element.outerHTML)) === null || _b === void 0 ? void 0 : _b[0].replace(/(\s?[\w-]+="")+>/g, '');
                }
                data.filename || (data.filename = filename || getPageFilename());
                data.mimeType = 'text/html';
                return [data];
            }
            return [];
        }
        getScriptAssets(options) {
            var _a;
            var _b;
            let assetMap, preserveCrossOrigin, saveAsScript;
            if (options) {
                ({ assetMap, preserveCrossOrigin } = options);
                saveAsScript = (_a = options.saveAs) === null || _a === void 0 ? void 0 : _a.script;
            }
            const result = [];
            const bundleIndex = {};
            let templateMap;
            if (assetMap) {
                for (const item of assetMap.values()) {
                    if (!item.selector) {
                        const template = item.template;
                        if (template) {
                            switch (item.type) {
                                case 'html':
                                case 'js':
                                case 'css': {
                                    const { module, identifier } = template;
                                    let value = template.value;
                                    if (module && identifier && value && (value = value.trim()) && value.startsWith('function')) {
                                        ((_b = (templateMap || (templateMap = { html: {}, js: {}, css: {} }))[item.type])[module] || (_b[module] = {}))[identifier] = value;
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            document.querySelectorAll('script').forEach(element => {
                var _a;
                const template = element.dataset.chromeTemplate;
                if (template || element.type === 'text/template') {
                    let category, module, identifier;
                    if (assetMap && assetMap.has(element)) {
                        const command = assetMap.get(element);
                        category = command.type;
                        if (command.template) {
                            ({ module, identifier } = command.template);
                        }
                        excludeAsset(result, command, element.outerHTML);
                    }
                    else if (template) {
                        [category, module, identifier] = replaceMap(template.split('::'), (value, index) => (index === 0 ? value.toLowerCase() : value).trim());
                    }
                    if (category && module && identifier) {
                        switch (category) {
                            case 'html':
                            case 'js':
                            case 'css':
                                ((_a = (templateMap || (templateMap = { html: {}, js: {}, css: {} }))[category])[module] || (_a[module] = {}))[identifier] = element.textContent.trim();
                                break;
                        }
                    }
                }
                else {
                    const src = element.src.trim();
                    this.createBundle(result, bundleIndex, element, src, getMimeType(element, src, 'text/javascript'), preserveCrossOrigin, assetMap, saveAsScript);
                }
            });
            setBundleIndex(bundleIndex);
            return [result, templateMap];
        }
        getLinkAssets(options) {
            var _a;
            let assetMap, saveAsLink, preserveCrossOrigin;
            if (options) {
                ({ assetMap, preserveCrossOrigin } = options);
                saveAsLink = (_a = options.saveAs) === null || _a === void 0 ? void 0 : _a.link;
            }
            const result = [];
            const bundleIndex = {};
            document.querySelectorAll('link, style').forEach((element) => {
                let href, mimeType;
                if (element instanceof HTMLLinkElement && (href = element.href.trim())) {
                    switch (element.rel.trim().toLowerCase()) {
                        case 'stylesheet':
                            mimeType = 'text/css';
                            break;
                        case 'icon':
                            mimeType = 'image/x-icon';
                            break;
                    }
                }
                this.createBundle(result, bundleIndex, element, href, mimeType || getMimeType(element, href, 'text/css'), preserveCrossOrigin, assetMap, saveAsLink, mimeType === 'text/css' || element instanceof HTMLStyleElement);
            });
            let process, compress, preserve, tasks, cloudStorage;
            if (saveAsLink) {
                ({ process, compress, preserve, tasks, cloudStorage } = saveAsLink);
            }
            for (const [uri, item] of ASSETS.rawData) {
                if (item.mimeType === 'text/css') {
                    const data = File.parseUri(resolvePath(uri), { preserveCrossOrigin, format: process ? process.join('+') : undefined });
                    if (this.processExtensions(data)) {
                        setOutputModifiers(data, compress, tasks, cloudStorage);
                        if (preserve) {
                            data.preserve = true;
                        }
                        data.mimeType = item.mimeType;
                        result.push(data);
                    }
                }
            }
            setBundleIndex(bundleIndex);
            return result;
        }
        getImageAssets(options) {
            let assetMap, preserveCrossOrigin, saveAsImage, saveAsBase64;
            if (options) {
                ({ assetMap, preserveCrossOrigin } = options);
                if (options.saveAs) {
                    ({ image: saveAsImage, base64: saveAsBase64 } = options.saveAs);
                }
            }
            const result = [];
            document.querySelectorAll('video').forEach((element) => this.processImageUri(result, element, resolvePath(element.poster), saveAsImage, preserveCrossOrigin, assetMap));
            document.querySelectorAll('picture > source').forEach((element) => {
                for (const uri of element.srcset.trim().split(',')) {
                    this.processImageUri(result, element, resolvePath(splitPairStart(uri, ' ')), saveAsImage, preserveCrossOrigin, assetMap);
                }
            });
            document.querySelectorAll('img, input[type=image]').forEach((element) => {
                const src = element.src.trim();
                if (!src.startsWith('data:image/')) {
                    this.processImageUri(result, element, resolvePath(src), saveAsImage, preserveCrossOrigin, assetMap);
                }
            });
            document.querySelectorAll('img[srcset], picture > source[srcset]').forEach((element) => {
                RE_SRCSET.matcher(element.srcset.trim());
                while (RE_SRCSET.find()) {
                    this.processImageUri(result, element, resolvePath(RE_SRCSET.group(1)), saveAsImage, preserveCrossOrigin, assetMap);
                }
            });
            for (const uri of ASSETS.image.keys()) {
                this.processImageUri(result, null, uri, saveAsImage, preserveCrossOrigin);
            }
            for (const rawData of ASSETS.rawData.values()) {
                const { base64, filename, mimeType } = rawData;
                if (base64) {
                    if (saveAsBase64) {
                        let commands;
                        if (mimeType && mimeType.startsWith('image/') && (commands = saveAsBase64.commands)) {
                            for (let i = 0; i < commands.length; ++i) {
                                const match = /^\s*(?:(png|jpeg|webp|bmp)\s*[@%]?)([\S\s]*)$/.exec(commands[i]);
                                if (match) {
                                    commands[i] = match[1] + '@' + match[2].trim();
                                }
                                else {
                                    commands.splice(i--, 1);
                                }
                            }
                        }
                        const data = this.processImageUri(result, null, resolvePath(getFilePath(appendSeparator(saveAsBase64.pathname, filename))[1] + '/' + filename, location.href), saveAsImage, preserveCrossOrigin);
                        if (data) {
                            data.base64 = base64;
                            if (commands && commands.length) {
                                data.commands || (data.commands = commands);
                            }
                            data.cloudStorage = saveAsBase64.cloudStorage;
                        }
                    }
                }
                else if (mimeType && rawData.content) {
                    const data = {
                        pathname: "__generated__" /* GENERATED */ + `/${mimeType.split('/').pop()}`,
                        filename,
                        content: rawData.content,
                        mimeType
                    };
                    if (this.processExtensions(data)) {
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
            const preserveCrossOrigin = options && options.preserveCrossOrigin;
            const result = [];
            for (const fonts of ASSETS.fonts.values()) {
                for (let i = 0, length = fonts.length; i < length; ++i) {
                    const url = fonts[i].srcUrl;
                    if (url) {
                        const data = File.parseUri(url, { preserveCrossOrigin });
                        if (this.processExtensions(data)) {
                            result.push(data);
                        }
                    }
                }
            }
            return result;
        }
        finalizeRequestBody(data, options) {
            data.baseUrl = options.baseUrl;
            data.database = options.database;
            data.unusedStyles = options.unusedStyles;
            data.templateMap = options.templateMap;
        }
        getCopyQueryParameters(options) {
            return this.getArchiveQueryParameters(options) + (options.watch ? '&watch=1' : '');
        }
        getArchiveQueryParameters(options) {
            return '&chrome=1' + (options.productionRelease ? '&release=1' : '');
        }
        getRawAssets(tagName, options) {
            var _a;
            let assetMap, preserveCrossOrigin, saveAsImage;
            if (options) {
                ({ assetMap, preserveCrossOrigin } = options);
                saveAsImage = (_a = options.saveAs) === null || _a === void 0 ? void 0 : _a.image;
            }
            const result = [];
            document.querySelectorAll(tagName).forEach(element => {
                const items = new Map();
                let type = '';
                switch (element.tagName) {
                    case 'VIDEO':
                    case 'AUDIO':
                        element.querySelectorAll('source, track').forEach((source) => resolveAssetSource(source, items));
                        break;
                    case 'OBJECT':
                    case 'EMBED':
                        type = element.type;
                    case 'IFRAME': {
                        const iframe = element.tagName === 'IFRAME';
                        const file = element.dataset.chromeFile;
                        if (!iframe || file && file.startsWith('saveTo')) {
                            const src = (element instanceof HTMLObjectElement ? element.data : element.src).trim();
                            if (type.startsWith('image/') || parseMimeType(src).startsWith('image/')) {
                                this.processImageUri(result, element, src, saveAsImage, preserveCrossOrigin, assetMap);
                                return;
                            }
                        }
                        else if (iframe) {
                            return;
                        }
                    }
                }
                resolveAssetSource(element, items);
                for (const [item, uri] of items) {
                    const file = item.dataset.chromeFile;
                    let saveAs, saveTo, filename, compress, tasks, watch, cloudStorage, attributes, fromConfig;
                    if (file === 'ignore') {
                        continue;
                    }
                    if (assetMap && assetMap.has(item)) {
                        const command = assetMap.get(item);
                        if (excludeAsset(result, command, item.outerHTML)) {
                            continue;
                        }
                        ({ saveTo: saveAs, filename, compress, tasks, watch, cloudStorage, attributes } = command);
                        [saveAs, saveTo] = checkSaveAs(uri, saveAs || command.pathname, filename);
                        if (saveAs) {
                            filename = '';
                        }
                        fromConfig = true;
                    }
                    else {
                        const command = parseFileAs('saveAs', file);
                        if (command) {
                            saveAs = command.file;
                        }
                        ({ compress } = parseOptions(item.dataset.chromeOptions));
                        tasks = getTasks(item);
                        watch = parseWatchInterval(item.dataset.chromeWatch);
                    }
                    const data = File.parseUri(uri, { preserveCrossOrigin, saveAs, saveTo, fromConfig });
                    if (this.processExtensions(data)) {
                        setOutputModifiers(data, compress, tasks, cloudStorage, attributes);
                        if (filename) {
                            data.filename = filename;
                        }
                        if (watch) {
                            data.watch = watch;
                        }
                        data.outerHTML = item.outerHTML;
                        result.push(data);
                    }
                }
            });
            return result;
        }
        processAssets(options) {
            const assets = this.getHtmlPage(options).concat(this.getLinkAssets(options));
            if (options.saveAsWebPage) {
                for (let i = 0, length = assets.length; i < length; ++i) {
                    const item = assets[i];
                    switch (item.mimeType) {
                        case 'text/html':
                        case 'text/css':
                            item.mimeType = '@' + item.mimeType;
                            break;
                    }
                }
            }
            const [scriptAssets, templateMap] = this.getScriptAssets(options);
            assets.push(...scriptAssets, ...this.getImageAssets(options), ...this.getVideoAssets(options), ...this.getAudioAssets(options), ...this.getRawAssets('object', options), ...this.getRawAssets('embed', options), ...this.getRawAssets('iframe', options), ...this.getFontAssets(options));
            options.assets = assets;
            options.baseUrl = location.href;
            if (templateMap) {
                options.templateMap = templateMap;
            }
            delete options.assetMap;
            return options;
        }
        createBundle(assets, bundleIndex, element, src, mimeType, preserveCrossOrigin, assetMap, saveAsOptions, saveAsCondtion = true) {
            let file = element.dataset.chromeFile;
            if (file === 'exclude' || file === 'ignore') {
                return;
            }
            let filename, format, preserve, inline, process, compress, tasks, watch, cloudStorage, attributes, fromConfig, fromSaveAs;
            if (assetMap && assetMap.has(element)) {
                const command = assetMap.get(element);
                if (excludeAsset(assets, command, element.outerHTML)) {
                    return;
                }
                let filenameAs;
                ({ filename: filenameAs, preserve, inline, process, compress, tasks, watch, cloudStorage, attributes } = command);
                file = src ? command.saveAs : command.exportAs;
                if (!file && filenameAs) {
                    if (command.pathname) {
                        [file] = checkSaveAs(src, command.pathname, filenameAs);
                        if (!file) {
                            filename = filenameAs;
                        }
                    }
                    else {
                        filename = filenameAs;
                    }
                }
                fromConfig = true;
            }
            else if (saveAsCondtion && saveAsOptions) {
                if (excludeAsset(assets, saveAsOptions, element.outerHTML)) {
                    return;
                }
                filename = saveAsOptions.filename;
                ({ preserve, inline, process, compress, tasks, watch, cloudStorage, attributes } = saveAsOptions);
                if (src) {
                    if (file = filename && getCustomPath(src, saveAsOptions.pathname, filename)) {
                        filename = '';
                    }
                }
                else {
                    if (!filename) {
                        return;
                    }
                    file = './' + filename;
                    filename = '';
                }
                fromSaveAs = true;
            }
            else {
                ({ preserve, inline, compress } = parseOptions(element.dataset.chromeOptions));
                tasks = getTasks(element);
                watch = parseWatchInterval(element.dataset.chromeWatch);
            }
            if (process) {
                format = process.join('+');
            }
            let data = null;
            if (src) {
                data = File.parseUri(resolvePath(src), { element, saveAs: file, format, inline, preserveCrossOrigin, fromConfig });
                if (data && checkBundleStart(assets, data)) {
                    data.bundleIndex = -1;
                }
            }
            else if (file) {
                if (!fromConfig && !fromSaveAs) {
                    const command = parseFileAs('exportAs', file);
                    if (command) {
                        ({ file, format } = command);
                    }
                }
                if (data = createBundleAsset(assets, element, file, format, preserve, inline)) {
                    data.bundleIndex = -1;
                }
            }
            if (this.processExtensions(data)) {
                setOutputModifiers(data, compress, tasks, cloudStorage, attributes);
                if (filename) {
                    data.filename = filename;
                }
                if (preserve) {
                    data.preserve = true;
                }
                if (watch) {
                    data.watch = watch;
                }
                data.mimeType = mimeType;
                data.outerHTML = element.outerHTML;
                setBundleData(bundleIndex, data);
                assets.push(data);
            }
        }
        processImageUri(assets, element, uri, saveAsImage, preserveCrossOrigin, assetMap) {
            if (uri = uri.trim()) {
                let saveAs, saveTo, pathname, filename, inline, compress, commands, tasks, watch, cloudStorage, attributes, fromConfig;
                if (element) {
                    const file = element.dataset.chromeFile;
                    if (file === 'ignore') {
                        return;
                    }
                    if (assetMap && assetMap.has(element)) {
                        const command = assetMap.get(element);
                        if (excludeAsset(assets, command, element.outerHTML)) {
                            return;
                        }
                        ({ saveTo: saveAs, pathname, filename, commands, inline, compress, tasks, watch, cloudStorage, attributes } = command);
                        [saveAs, saveTo] = checkSaveAs(uri, saveAs || pathname, filename);
                        if (saveAs) {
                            filename = '';
                        }
                        fromConfig = true;
                    }
                    else if (saveAsImage) {
                        if (excludeAsset(assets, saveAsImage, element.outerHTML)) {
                            return;
                        }
                        ({ pathname, commands, inline, compress, tasks, watch, cloudStorage, attributes } = saveAsImage);
                        [saveAs, saveTo] = checkSaveAs(uri, pathname);
                    }
                    else {
                        if (file) {
                            let fileAs = parseFileAs('saveTo', file);
                            if (fileAs) {
                                [saveAs, saveTo] = checkSaveAs(uri, fileAs.file);
                            }
                            else if (fileAs = parseFileAs('saveAs', file)) {
                                saveAs = fileAs.file;
                            }
                        }
                        const { chromeCommands, chromeOptions, chromeWatch } = element.dataset;
                        if (chromeCommands) {
                            commands = replaceMap(chromeCommands.split('::'), value => value.trim());
                        }
                        ({ inline, compress } = parseOptions(chromeOptions));
                        tasks = getTasks(element);
                        watch = parseWatchInterval(chromeWatch);
                    }
                }
                else if (saveAsImage) {
                    ({ pathname, commands, inline, compress, tasks, cloudStorage } = saveAsImage);
                    [saveAs, saveTo] = checkSaveAs(uri, pathname);
                }
                const data = File.parseUri(uri, { preserveCrossOrigin, saveAs, saveTo, fromConfig });
                if (this.processExtensions(data)) {
                    setOutputModifiers(data, compress, tasks, cloudStorage, attributes);
                    if (filename) {
                        data.filename = filename;
                    }
                    if (commands && commands.length && commands[0] !== '~') {
                        data.commands = commands;
                    }
                    if (inline) {
                        data.format = 'base64';
                    }
                    if (watch) {
                        data.watch = watch;
                    }
                    if (element) {
                        data.outerHTML = element.outerHTML;
                    }
                    assets.push(data);
                    return data;
                }
            }
        }
        processExtensions(data) {
            if (data) {
                for (const ext of this.application.extensions) {
                    if (!ext.processFile(data)) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        }
        get application() {
            return this.resource.application;
        }
        get userSettings() {
            return this.resource.userSettings;
        }
    }

    const settings = {
        builtInExtensions: [],
        preloadImages: false,
        preloadFonts: false,
        preloadCustomElements: false,
        excludePlainText: true,
        createElementMap: true,
        createQuerySelectorMap: true,
        pierceShadowRoot: false,
        showErrorMessages: false,
        outputEmptyCopyDirectory: false,
        outputTasks: {},
        outputWatch: {},
        outputArchiveName: 'chrome-data',
        outputArchiveFormat: 'zip'
    };

    const { DIRECTORY_NOT_PROVIDED, FRAMEWORK_NOT_INSTALLED, reject: reject$1 } = squared.lib.error;
    const { isString, isPlainObject: isPlainObject$1 } = squared.lib.util;
    let application = null;
    let file = null;
    function createAssetsOptions(assets, options, directory, filename) {
        if (isPlainObject$1(options)) {
            if (options.assets) {
                assets.push(...options.assets);
            }
        }
        else {
            options = {};
        }
        return Object.assign(options, { assets, directory, filename });
    }
    const checkFileName = (value) => value || application.userSettings.outputArchiveName;
    const appBase = {
        base: {
            Application,
            Extension,
            File
        },
        lib: {},
        extensions: {},
        system: {
            copyHtmlPage(directory, options) {
                if (isString(directory)) {
                    return file ? file.copying(createAssetsOptions(file.getHtmlPage(options), options, directory)) : reject$1(FRAMEWORK_NOT_INSTALLED);
                }
                return reject$1(DIRECTORY_NOT_PROVIDED);
            },
            copyScriptAssets(directory, options) {
                if (isString(directory)) {
                    return file ? file.copying(createAssetsOptions(file.getScriptAssets(options)[0], options, directory)) : reject$1(FRAMEWORK_NOT_INSTALLED);
                }
                return reject$1(DIRECTORY_NOT_PROVIDED);
            },
            copyLinkAssets(directory, options) {
                if (isString(directory)) {
                    return file ? file.copying(createAssetsOptions(file.getLinkAssets(options), options, directory)) : reject$1(FRAMEWORK_NOT_INSTALLED);
                }
                return reject$1(DIRECTORY_NOT_PROVIDED);
            },
            copyImageAssets(directory, options) {
                if (isString(directory)) {
                    return file ? file.copying(createAssetsOptions(file.getImageAssets(options), options, directory)) : reject$1(FRAMEWORK_NOT_INSTALLED);
                }
                return reject$1(DIRECTORY_NOT_PROVIDED);
            },
            copyVideoAssets(directory, options) {
                if (isString(directory)) {
                    return file ? file.copying(createAssetsOptions(file.getVideoAssets(options), options, directory)) : reject$1(FRAMEWORK_NOT_INSTALLED);
                }
                return reject$1(DIRECTORY_NOT_PROVIDED);
            },
            copyAudioAssets(directory, options) {
                if (isString(directory)) {
                    return file ? file.copying(createAssetsOptions(file.getAudioAssets(options), options, directory)) : reject$1(FRAMEWORK_NOT_INSTALLED);
                }
                return reject$1(DIRECTORY_NOT_PROVIDED);
            },
            copyFontAssets(directory, options) {
                if (isString(directory)) {
                    return file ? file.copying(createAssetsOptions(file.getFontAssets(options), options, directory)) : reject$1(FRAMEWORK_NOT_INSTALLED);
                }
                return reject$1(DIRECTORY_NOT_PROVIDED);
            },
            saveHtmlPage(filename, options) {
                return file ? file.archiving(createAssetsOptions(file.getHtmlPage(options), options, undefined, checkFileName(filename) + '-html')) : reject$1(FRAMEWORK_NOT_INSTALLED);
            },
            saveScriptAssets(filename, options) {
                return file ? file.archiving(createAssetsOptions(file.getScriptAssets(options)[0], options, undefined, checkFileName(filename) + '-script')) : reject$1(FRAMEWORK_NOT_INSTALLED);
            },
            saveLinkAssets(filename, options) {
                return file ? file.archiving(createAssetsOptions(file.getLinkAssets(options), options, undefined, checkFileName(filename) + '-link')) : reject$1(FRAMEWORK_NOT_INSTALLED);
            },
            saveImageAssets(filename, options) {
                return file ? file.archiving(createAssetsOptions(file.getImageAssets(options), options, undefined, checkFileName(filename) + '-image')) : reject$1(FRAMEWORK_NOT_INSTALLED);
            },
            saveVideoAssets(filename, options) {
                return file ? file.archiving(createAssetsOptions(file.getVideoAssets(options), options, undefined, checkFileName(filename) + '-video')) : reject$1(FRAMEWORK_NOT_INSTALLED);
            },
            saveAudioAssets(filename, options) {
                return file ? file.archiving(createAssetsOptions(file.getAudioAssets(options), options, undefined, checkFileName(filename) + '-audio')) : reject$1(FRAMEWORK_NOT_INSTALLED);
            },
            saveFontAssets(filename, options) {
                return file ? file.archiving(createAssetsOptions(file.getFontAssets(options), options, undefined, checkFileName(filename) + '-font')) : reject$1(FRAMEWORK_NOT_INSTALLED);
            }
        },
        create() {
            application = new Application(4 /* CHROME */, squared.base.Node, squared.base.Controller, squared.base.ExtensionManager, squared.base.Resource);
            file = new File();
            application.resourceHandler.fileHandler = file;
            return {
                application,
                framework: 4 /* CHROME */,
                userSettings: Object.assign({}, settings)
            };
        },
        cached() {
            if (application) {
                return {
                    application,
                    framework: 4 /* CHROME */,
                    userSettings: application.userSettings
                };
            }
            return this.create();
        }
    };

    return appBase;

}());
