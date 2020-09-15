/* chrome-framework 2.0.0
   https://github.com/anpham6/squared */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined'
        ? (module.exports = factory())
        : typeof define === 'function' && define.amd
        ? define(factory)
        : ((global = typeof globalThis !== 'undefined' ? globalThis : global || self), (global.chrome = factory()));
})(this, function () {
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
        insertNode(element, sessionId) {
            if (element.nodeName[0] === '#') {
                if (this.userSettings.excludePlainText) {
                    return;
                }
                this.controllerHandler.applyDefaultStyles(element, sessionId);
            }
            return this.createNode(sessionId, { element });
        }
        saveAs(filename, options) {
            return this.processAssets('saveAs', filename || this.userSettings.outputArchiveName, options);
        }
        copyTo(directory, options) {
            return this.processAssets('copyTo', directory, options);
        }
        appendTo(pathname, options) {
            return this.processAssets('appendTo', pathname, options);
        }
        processAssets(module, pathname, options) {
            options = !isPlainObject(options) ? {} : Object.assign({}, options);
            options.saveAsWebPage = true;
            this.reset();
            const result = this.parseDocumentSync();
            if (!result) {
                return reject(UNABLE_TO_FINALIZE_DOCUMENT);
            }
            if (options.removeUnusedStyles) {
                const unusedStyles = Array.from(this.session.unusedStyles);
                if (unusedStyles.length) {
                    options.unusedStyles = options.unusedStyles
                        ? Array.from(new Set(options.unusedStyles.concat(unusedStyles)))
                        : unusedStyles;
                }
            }
            return this.fileHandler[module](pathname, options);
        }
        get initializing() {
            return false;
        }
        get length() {
            return 1;
        }
    }

    const getSizeRange = options =>
        '(' +
        Math.max(options.largerThan, 0) +
        ',' +
        (options.smallerThan < Infinity ? options.smallerThan : '*') +
        ')';
    class Extension extends squared.base.Extension {
        static getCompressOptions(options) {
            const result = (options.whenSmaller ? '%' : '') + getSizeRange(options);
            if (result !== '(0,*)') {
                return result;
            }
        }
        static getConvertOptions(name, options) {
            const opacity = options.opacity || 1;
            let result = '';
            if (options.replaceWith) {
                result += '@';
            } else if (options.whenSmaller) {
                result += '%';
            }
            result += getSizeRange(options);
            return name + (result !== '(0,*)' ? result : '') + (opacity > 0 && opacity < 1 ? `|${opacity}|` : '') + ':';
        }
        processFile(data, override) {
            return false;
        }
    }

    var Pattern = squared.lib.base.Pattern;
    const { FILE } = squared.lib.regex;
    const ASSETS = squared.base.Resource.ASSETS;
    const {
        convertWord,
        fromLastIndexOf,
        isString,
        iterateReverseArray,
        parseMimeType,
        resolvePath,
        splitPairStart,
        trimEnd,
    } = squared.lib.util;
    const { appendSeparator, randomUUID } = squared.base.lib.util;
    const STRING_SERVERROOT = '__serverroot__';
    const RE_SRCSET = new Pattern(/[\s\n]*(.+?\.[^\s,]+)(\s+[\d.]+[wx]\s*)?,?/g);
    function parseFileAs(attr, value) {
        if (value) {
            const match = new RegExp(`${attr}:\\s*((?:[^"]|\\\\")+)`).exec(value.replace(/\\/g, '/'));
            if (match) {
                const segments = match[1].split('::').map(item => item.trim());
                return [segments[0], segments[1] || undefined, segments[2] === 'preserve'];
            }
        }
    }
    function getFilePath(value, saveTo) {
        let moveTo;
        value = value.replace(/\\/g, '/');
        if (value[0] === '/') {
            moveTo = STRING_SERVERROOT;
        } else if (value.startsWith('../')) {
            moveTo = STRING_SERVERROOT;
            const pathname = location.pathname.split('/');
            if (--pathname.length) {
                for (let i = 0, length = value.length; i < length; i += 3) {
                    if (value.substring(i, i + 3) !== '../' || --pathname.length === 0) {
                        break;
                    }
                }
            }
            value = `${pathname.join('/')}/${value.split('../').pop()}`;
        } else if (value.startsWith('./')) {
            value = value.substring(2);
        }
        const result = splitLastIndexOf(value, '/');
        if (saveTo) {
            const extension = getFileExt(result[1]);
            result[1] = randomUUID() + (extension ? '.' + extension : '');
        }
        return [moveTo, result[0], result[1]];
    }
    function resolveAssetSource(element, data) {
        const value = resolvePath(element instanceof HTMLObjectElement ? element.data : element.src);
        if (value !== '') {
            data.set(element, value);
        }
    }
    function convertFileMatch(value) {
        value = value.replace(/([.|/\\{}()?])/g, (match, ...capture) => '\\' + capture[0]).replace(/\*/g, '.*?');
        return new RegExp(`${value}$`);
    }
    function getExtensions(element) {
        if (element) {
            const dataset = element.dataset;
            const use = dataset.useChrome || dataset.use;
            if (use) {
                return use.trim().split(/\s*,\s*/);
            }
        }
        return [];
    }
    function processExtensions(data, extensions) {
        const processed = [];
        for (const ext of this.application.extensions) {
            if (ext.processFile(data)) {
                processed.push(ext);
            }
        }
        for (const name of extensions) {
            const ext = this.application.extensionManager.get(name, true);
            if (ext && !processed.includes(ext)) {
                ext.processFile(data, true);
            }
        }
    }
    function setBundleIndex(bundleIndex) {
        for (const saveTo in bundleIndex) {
            const items = bundleIndex[saveTo];
            const length = items.length;
            if (length > 1) {
                for (let i = 0; i < length; ++i) {
                    items[i].bundleIndex = i;
                }
            }
        }
    }
    function createBundleAsset(bundles, element, saveTo, format, preserve) {
        const content = element.innerHTML.trim();
        if (content) {
            const [moveTo, pathname, filename] = getFilePath(saveTo);
            const index = iterateReverseArray(bundles, item => {
                if (
                    (item.moveTo === moveTo || (!item.moveTo && !moveTo)) &&
                    item.pathname === pathname &&
                    item.filename === filename
                ) {
                    (item.trailingContent || (item.trailingContent = [])).push({ value: content, format, preserve });
                    return true;
                }
            });
            if (index !== Infinity) {
                return {
                    uri: resolvePath(saveTo, location.href),
                    pathname,
                    filename,
                    moveTo,
                    content,
                    format,
                    preserve,
                };
            }
        }
        return null;
    }
    function setBundleData(bundleIndex, data) {
        const name = (data.moveTo || '') + data.pathname + data.filename;
        (bundleIndex[name] || (bundleIndex[name] = [])).push(data);
    }
    function sortBundle(a, b) {
        if (a.bundleIndex === 0) {
            return 1;
        } else if (b.bundleIndex === 0) {
            return -1;
        }
        return 0;
    }
    function splitLastIndexOf(value, ...char) {
        let i = 0;
        while (i < char.length) {
            const index = value.lastIndexOf(char[i++]);
            if (index !== -1) {
                return [value.substring(0, index), value.substring(index + 1)];
            }
        }
        return ['', value];
    }
    const getFileExt = value => (value.includes('.') ? fromLastIndexOf(value, '.').toLowerCase() : '');
    const getDirectory = (path, start) => path.substring(start, path.lastIndexOf('/'));
    class File extends squared.base.File {
        static parseUri(uri, options) {
            let saveAs, format, saveTo, preserve;
            if (options) {
                ({ saveAs, format, saveTo, preserve } = options);
            }
            let value = trimEnd(uri, '/'),
                relocate;
            const local = value.startsWith(trimEnd(location.origin, '/'));
            if (saveAs) {
                saveAs = trimEnd(saveAs.replace(/\\/g, '/'), '/');
                if (saveTo) {
                    relocate = saveAs;
                } else {
                    const data = parseFileAs('saveAs', saveAs);
                    if (data) {
                        [relocate, format, preserve] = data;
                    } else {
                        relocate = saveAs;
                    }
                }
                if (local && relocate) {
                    value = resolvePath(relocate, location.href);
                }
            }
            if (!local && !relocate && options && options.preserveCrossOrigin) {
                return null;
            }
            const match = FILE.PROTOCOL.exec(value);
            if (match) {
                const host = match[2];
                const port = match[3];
                const path = match[4] || '';
                const extension = getFileExt(uri);
                let pathname = '',
                    filename = '',
                    prefix = '',
                    rootDir,
                    moveTo;
                if (!local) {
                    if (saveTo && relocate) {
                        [moveTo, pathname, filename] = getFilePath(
                            `${relocate}/${randomUUID() + (extension ? '.' + extension : '')}`
                        );
                    } else {
                        pathname = convertWord(host) + (port ? '/' + port.substring(1) : '') + '/';
                    }
                } else {
                    prefix = location.pathname.substring(0, location.pathname.lastIndexOf('/') + 1);
                    let length = path.length;
                    if (length) {
                        let index = 0;
                        length = Math.min(length, prefix.length);
                        for (let i = 0; i < length; ++i) {
                            if (path[i] === prefix[i]) {
                                index = i;
                            } else {
                                break;
                            }
                        }
                        rootDir = path.substring(0, index + 1);
                    }
                }
                if (filename === '') {
                    if (local && relocate) {
                        [moveTo, pathname, filename] = getFilePath(relocate, saveTo);
                    } else if (path && path !== '/') {
                        filename = fromLastIndexOf(path, '/', '\\');
                        if (local) {
                            if (path.startsWith(prefix)) {
                                pathname = getDirectory(path, prefix.length);
                            } else {
                                moveTo = STRING_SERVERROOT;
                                rootDir = '';
                                pathname = getDirectory(path, 0);
                            }
                        } else {
                            pathname += getDirectory(path, 1);
                        }
                    } else {
                        filename = 'index.html';
                    }
                }
                return {
                    uri,
                    rootDir,
                    moveTo,
                    pathname: pathname.replace(/\\/g, '/'),
                    filename,
                    mimeType: extension && parseMimeType(extension),
                    format,
                    preserve,
                };
            }
            return null;
        }
        reset() {
            delete this._outputFileExclusions;
            super.reset();
        }
        copyTo(directory, options = {}) {
            options.directory = directory;
            return this.copying(this.processAssets(options));
        }
        appendTo(pathname, options = {}) {
            options.filename || (options.filename = this.userSettings.outputArchiveName);
            options.appendTo = pathname;
            return this.archiving(this.processAssets(options));
        }
        saveAs(filename, options = {}) {
            options.filename = filename;
            return this.archiving(this.processAssets(options));
        }
        getHtmlPage(options) {
            var _a;
            let name, preserveCrossOrigin, saveAs;
            if (options) {
                ({ name, preserveCrossOrigin } = options);
                saveAs = (_a = options.saveAs) === null || _a === void 0 ? void 0 : _a.html;
            }
            const result = [];
            const element = document.querySelector('html');
            const href = location.href;
            let file, format;
            if (element) {
                file = element.dataset.chromeFile;
            }
            if (!isString(file) && saveAs && saveAs.filename) {
                file = fromLastIndexOf(saveAs.filename, '/', '\\');
                format = saveAs.format;
            }
            const data = File.parseUri(href, { preserveCrossOrigin, saveAs: file, format });
            if (data) {
                if (name) {
                    data.filename = name;
                } else {
                    const filename = data.filename;
                    if (!FILE.NAME.test(filename)) {
                        data.pathname = appendSeparator(data.pathname, filename);
                        data.filename = 'index.html';
                    }
                }
                if (this.validFile(data)) {
                    data.requestMain = true;
                    data.mimeType = parseMimeType('html');
                    processExtensions.call(this, data, getExtensions(document.querySelector('html')));
                    result.push(data);
                }
            }
            return result;
        }
        getScriptAssets(options) {
            var _a;
            let preserveCrossOrigin, saveAs;
            if (options) {
                preserveCrossOrigin = options.preserveCrossOrigin;
                saveAs = (_a = options.saveAs) === null || _a === void 0 ? void 0 : _a.script;
            }
            const result = [];
            const bundleIndex = {};
            const transpileMap = { html: {}, js: {}, css: {} };
            document.querySelectorAll('script').forEach(element => {
                var _a;
                const template = element.dataset.chromeTemplate;
                if (template) {
                    if (element.type === 'text/template') {
                        const [category, module, name] = template
                            .split('::')
                            .map((value, index) => (index === 0 ? value.toLowerCase() : value).trim());
                        if (category && module && name) {
                            switch (category) {
                                case 'html':
                                case 'js':
                                case 'css': {
                                    ((_a = transpileMap[category])[module] || (_a[module] = {}))[
                                        name
                                    ] = element.textContent.trim();
                                    break;
                                }
                            }
                        }
                    }
                } else {
                    let file = element.dataset.chromeFile;
                    if (file !== 'exclude') {
                        const src = element.src.trim();
                        let data = null,
                            format,
                            outerHTML,
                            preserve;
                        if (!isString(file) && saveAs && saveAs.filename) {
                            file = appendSeparator(saveAs.pathname, saveAs.filename);
                            format = saveAs.format;
                            outerHTML = element.outerHTML;
                        }
                        if (src !== '') {
                            data = File.parseUri(resolvePath(src), { preserveCrossOrigin, saveAs: file, format });
                        } else if (isString(file)) {
                            if (!outerHTML) {
                                const command = parseFileAs('exportAs', file);
                                if (command) {
                                    [file, format, preserve] = command;
                                }
                            }
                            if (file) {
                                data = createBundleAsset(result, element, file, format, preserve);
                            }
                        }
                        if (this.validFile(data)) {
                            setBundleData(bundleIndex, data);
                            data.mimeType =
                                element.type.trim() || (data.uri && parseMimeType(data.uri)) || 'text/javascript';
                            if (outerHTML) {
                                data.outerHTML = outerHTML;
                            }
                            processExtensions.call(this, data, getExtensions(element));
                            result.push(data);
                        }
                    }
                }
            });
            setBundleIndex(bundleIndex);
            return [result.sort(sortBundle), transpileMap];
        }
        getLinkAssets(options) {
            var _a;
            let rel, saveAs, preserveCrossOrigin;
            if (options) {
                ({ rel, preserveCrossOrigin } = options);
                saveAs = (_a = options.saveAs) === null || _a === void 0 ? void 0 : _a.link;
            }
            const result = [];
            const bundleIndex = {};
            document.querySelectorAll(`${rel ? `link[rel="${rel}"]` : 'link'}, style`).forEach(element => {
                let file = element.dataset.chromeFile;
                if (file !== 'exclude') {
                    let data = null,
                        href,
                        mimeType,
                        format,
                        preserve,
                        outerHTML;
                    if (element instanceof HTMLLinkElement) {
                        href = element.href.trim();
                        if (href !== '') {
                            switch (element.rel.trim()) {
                                case 'stylesheet':
                                    mimeType = 'text/css';
                                    break;
                                case 'icon':
                                    mimeType = 'image/x-icon';
                                    break;
                                default:
                                    mimeType = element.type.trim() || parseMimeType(href);
                                    break;
                            }
                        }
                    }
                    if (
                        !isString(file) &&
                        saveAs &&
                        saveAs.filename &&
                        (mimeType === 'text/css' || element instanceof HTMLStyleElement)
                    ) {
                        file = appendSeparator(saveAs.pathname, saveAs.filename);
                        ({ format, preserve } = saveAs);
                        outerHTML = element.outerHTML;
                    }
                    if (href) {
                        data = File.parseUri(resolvePath(href), {
                            preserveCrossOrigin,
                            saveAs: file,
                            format,
                            preserve,
                        });
                    } else if (isString(file)) {
                        if (!outerHTML) {
                            const command = parseFileAs('exportAs', file);
                            if (command) {
                                [file, format, preserve] = command;
                            }
                        }
                        if (file) {
                            data = createBundleAsset(result, element, file, format, preserve);
                        }
                    }
                    if (this.validFile(data)) {
                        setBundleData(bundleIndex, data);
                        data.mimeType = mimeType || 'text/css';
                        if (outerHTML) {
                            data.outerHTML = outerHTML;
                        }
                        processExtensions.call(this, data, getExtensions(element));
                        result.push(data);
                    }
                }
            });
            for (const data of ASSETS.rawData) {
                const item = data[1];
                if (item.mimeType === 'text/css') {
                    const asset = File.parseUri(resolvePath(data[0]), {
                        preserveCrossOrigin,
                        format: saveAs && saveAs.format,
                    });
                    if (this.validFile(asset)) {
                        asset.mimeType = item.mimeType;
                        processExtensions.call(this, asset, []);
                        result.push(asset);
                    }
                }
            }
            setBundleIndex(bundleIndex);
            return result.sort(sortBundle);
        }
        getImageAssets(options) {
            var _a;
            let preserveCrossOrigin, saveAs;
            if (options) {
                preserveCrossOrigin = options.preserveCrossOrigin;
                saveAs = (_a = options.saveAs) === null || _a === void 0 ? void 0 : _a.base64;
            }
            const result = [];
            const processUri = (element, uri, mimeType) => {
                uri = uri.trim();
                if (uri !== '') {
                    let file, saveTo;
                    if (element) {
                        const fileAs = parseFileAs('saveTo', element.dataset.chromeFile);
                        if (fileAs) {
                            [file, mimeType] = fileAs;
                            saveTo = true;
                        }
                    }
                    const data = File.parseUri(uri, { preserveCrossOrigin, saveAs: file, saveTo });
                    if (this.validFile(data) && !result.find(item => item.uri === uri)) {
                        if (mimeType) {
                            data.mimeType = file && data.mimeType ? mimeType + ':' + data.mimeType : mimeType;
                        }
                        processExtensions.call(this, data, getExtensions(element));
                        result.push(data);
                        return data;
                    }
                }
            };
            document.querySelectorAll('video').forEach(element => processUri(null, resolvePath(element.poster)));
            document.querySelectorAll('picture > source').forEach(element => {
                for (const uri of element.srcset.trim().split(',')) {
                    processUri(element, resolvePath(splitPairStart(uri, ' ')));
                }
            });
            document.querySelectorAll('img, input[type=image]').forEach(element => {
                const src = element.src.trim();
                if (!src.startsWith('data:image/')) {
                    processUri(element, resolvePath(src));
                }
            });
            document.querySelectorAll('img[srcset], picture > source[srcset]').forEach(element => {
                RE_SRCSET.matcher(element.srcset.trim());
                while (RE_SRCSET.find()) {
                    processUri(element, resolvePath(RE_SRCSET.group(1)));
                }
            });
            document.querySelectorAll('object, embed').forEach(element => {
                const src = element.data || element.src;
                if (src && (element.type.startsWith('image/') || parseMimeType(src).startsWith('image/'))) {
                    processUri(element, src);
                }
            });
            for (const uri of ASSETS.image.keys()) {
                processUri(null, uri);
            }
            for (const rawData of ASSETS.rawData.values()) {
                if (rawData.pathname) {
                    continue;
                } else {
                    const { base64, filename } = rawData;
                    let mimeType = rawData.mimeType,
                        data;
                    if (base64) {
                        if (saveAs) {
                            const format = saveAs.format;
                            if (format && mimeType && mimeType.startsWith('image/')) {
                                switch (format) {
                                    case 'png':
                                    case 'jpeg':
                                    case 'bmp':
                                    case 'gif':
                                    case 'tiff':
                                        mimeType = '@' + format + ':' + mimeType;
                                        break;
                                }
                            }
                            const pathname = trimEnd(saveAs.pathname || '', '/').replace(/\\/g, '/');
                            data = processUri(
                                null,
                                resolvePath(
                                    getFilePath(pathname + (pathname !== '' ? '/' : '') + filename)[1] + filename,
                                    location.href
                                ),
                                mimeType
                            );
                            if (data) {
                                data.base64 = base64;
                                continue;
                            }
                        }
                        data = {
                            pathname: '__generated__/base64',
                            filename,
                            mimeType,
                            base64,
                        };
                    } else if (mimeType && rawData.content) {
                        data = {
                            pathname: `__generated__/${mimeType.split('/').pop()}`,
                            filename,
                            content: rawData.content,
                        };
                    } else {
                        continue;
                    }
                    if (this.validFile(data)) {
                        data.mimeType = mimeType;
                        processExtensions.call(this, data, []);
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
                        if (this.validFile(data)) {
                            processExtensions.call(this, data, []);
                            result.push(data);
                        }
                    }
                }
            }
            return result;
        }
        getDataMap(options) {
            return {
                unusedStyles: options.unusedStyles,
                transpileMap: options.transpileMap,
            };
        }
        getCopyQueryParameters(options) {
            return options.productionRelease ? '&release=1' : '';
        }
        getArchiveQueryParameters(options) {
            return options.productionRelease ? '&release=1' : '';
        }
        validFile(data) {
            if (data) {
                const fullpath = appendSeparator(data.pathname, data.filename);
                return !this.outputFileExclusions.some(pattern => pattern.test(fullpath));
            }
            return false;
        }
        getRawAssets(tagName, options) {
            const preserveCrossOrigin = options && options.preserveCrossOrigin;
            const result = [];
            document.querySelectorAll(tagName).forEach(element => {
                var _a;
                const items = new Map();
                resolveAssetSource(element, items);
                switch (element.tagName) {
                    case 'VIDEO':
                    case 'AUDIO':
                        element.querySelectorAll('source, track').forEach(source => resolveAssetSource(source, items));
                        break;
                }
                for (const data of items) {
                    const saveAs =
                        (_a = parseFileAs('saveTo', data[0].dataset.chromeFile)) === null || _a === void 0
                            ? void 0
                            : _a[0];
                    const asset = File.parseUri(data[1], { preserveCrossOrigin, saveAs, saveTo: !!saveAs });
                    if (this.validFile(asset)) {
                        processExtensions.call(this, asset, getExtensions(data[0]));
                        result.push(asset);
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
                    const mimeType = item.mimeType;
                    switch (mimeType) {
                        case 'text/html':
                        case 'application/xhtml+xml':
                        case 'text/css':
                            item.mimeType = '@' + mimeType;
                            break;
                    }
                }
            }
            const [scriptAssets, transpileMap] = this.getScriptAssets(options);
            options.assets = assets
                .concat(scriptAssets)
                .concat(this.getImageAssets(options))
                .concat(this.getVideoAssets(options))
                .concat(this.getAudioAssets(options))
                .concat(this.getRawAssets('object', options))
                .concat(this.getRawAssets('embed', options))
                .concat(this.getFontAssets(options))
                .concat(options.assets || []);
            options.transpileMap = transpileMap;
            return options;
        }
        get outputFileExclusions() {
            return (
                this._outputFileExclusions ||
                (this._outputFileExclusions = this.userSettings.outputFileExclusions.map(value =>
                    convertFileMatch(value)
                ))
            );
        }
        get application() {
            return this.resource.application;
        }
        get userSettings() {
            return this.resource.userSettings;
        }
    }

    class Brotli extends Extension {
        constructor() {
            super(...arguments);
            this.options = {
                mimeTypes: new Set([
                    'text/css',
                    'text/javascript',
                    'text/plain',
                    'text/csv',
                    'text/vtt',
                    'application/json',
                    'application/javascript',
                    'application/ld+json',
                    'application/xml',
                ]),
                largerThan: 0,
                smallerThan: Infinity,
                whenSmaller: true,
                level: 11,
            };
        }
        processFile(data, override) {
            if (!override) {
                const mimeType = data.mimeType;
                if (mimeType) {
                    const mimeTypes = this.options.mimeTypes;
                    override = mimeTypes === '*' || mimeTypes.has(mimeType);
                }
            }
            if (override) {
                (data.compress || (data.compress = [])).push({
                    format: 'br',
                    level: this.options.level,
                    condition: Extension.getCompressOptions(this.options),
                });
                return true;
            }
            return false;
        }
    }

    class Gzip extends Extension {
        constructor() {
            super(...arguments);
            this.options = {
                mimeTypes: new Set([
                    'text/css',
                    'text/javascript',
                    'text/plain',
                    'text/csv',
                    'text/vtt',
                    'application/json',
                    'application/javascript',
                    'application/ld+json',
                    'application/xml',
                ]),
                largerThan: 0,
                smallerThan: Infinity,
                whenSmaller: true,
                level: 9,
            };
        }
        processFile(data, override) {
            if (!override) {
                const mimeType = data.mimeType;
                if (mimeType) {
                    const mimeTypes = this.options.mimeTypes;
                    override = mimeTypes === '*' || mimeTypes.has(mimeType);
                }
            }
            if (override) {
                (data.compress || (data.compress = [])).push({
                    format: 'gz',
                    level: this.options.level,
                    condition: Extension.getCompressOptions(this.options),
                });
                return true;
            }
            return false;
        }
    }

    const { findSet } = squared.lib.util;
    class Jpeg extends Extension {
        constructor() {
            super(...arguments);
            this.options = {
                mimeTypes: new Set(['image/jpeg']),
                largerThan: 0,
                smallerThan: Infinity,
                whenSmaller: true,
                level: 100,
            };
        }
        processFile(data, override) {
            if (!override) {
                const mimeType = data.mimeType;
                if (mimeType) {
                    const mimeTypes = this.options.mimeTypes;
                    override =
                        mimeType.includes('jpeg:') ||
                        (mimeTypes === '*'
                            ? mimeType.includes('image/')
                            : !!findSet(mimeTypes, value => mimeType.endsWith(value)));
                }
            }
            if (override) {
                (data.compress || (data.compress = [])).push(
                    { format: 'png', condition: Extension.getCompressOptions(this.options) },
                    { format: 'jpeg', level: this.options.level }
                );
                return true;
            }
            return false;
        }
    }

    const { findSet: findSet$1 } = squared.lib.util;
    class Png extends Extension {
        constructor() {
            super(...arguments);
            this.options = {
                mimeTypes: new Set(['image/png']),
                largerThan: 0,
                smallerThan: Infinity,
                whenSmaller: true,
            };
        }
        processFile(data, override) {
            if (!override) {
                const mimeType = data.mimeType;
                if (mimeType) {
                    const mimeTypes = this.options.mimeTypes;
                    override =
                        mimeType.includes('png:') || mimeTypes === '*'
                            ? mimeType.includes('image/')
                            : !!findSet$1(mimeTypes, value => mimeType.endsWith(value));
                }
            }
            if (override) {
                (data.compress || (data.compress = [])).push({
                    format: 'png',
                    condition: Extension.getCompressOptions(this.options),
                });
                return true;
            }
            return false;
        }
    }

    const { findSet: findSet$2 } = squared.lib.util;
    class Bmp extends Extension {
        constructor() {
            super(...arguments);
            this.options = {
                mimeTypes: new Set(['image/png', 'image/jpeg', 'image/gif', 'image/tiff']),
                largerThan: 0,
                smallerThan: Infinity,
                whenSmaller: false,
                replaceWith: true,
            };
        }
        processFile(data, override) {
            const mimeType = data.mimeType;
            if (
                mimeType &&
                !/bmp[(%@:]/.test(mimeType) &&
                (override || findSet$2(this.options.mimeTypes, value => mimeType.endsWith(value)))
            ) {
                data.mimeType = Extension.getConvertOptions('bmp', this.options) + mimeType;
                return true;
            }
            return false;
        }
    }

    const { findSet: findSet$3 } = squared.lib.util;
    class Jpeg$1 extends Extension {
        constructor() {
            super(...arguments);
            this.options = {
                mimeTypes: new Set(['image/png', 'image/bmp', 'image/gif', 'image/tiff']),
                largerThan: 0,
                smallerThan: Infinity,
                whenSmaller: false,
                replaceWith: true,
            };
        }
        processFile(data, override) {
            const mimeType = data.mimeType;
            if (
                mimeType &&
                !/jpeg[(%@:]/.test(mimeType) &&
                (override || findSet$3(this.options.mimeTypes, value => mimeType.endsWith(value)))
            ) {
                data.mimeType = Extension.getConvertOptions('jpeg', this.options) + mimeType;
                return true;
            }
            return false;
        }
    }

    const { findSet: findSet$4 } = squared.lib.util;
    class Png$1 extends Extension {
        constructor() {
            super(...arguments);
            this.options = {
                mimeTypes: new Set(['image/jpeg', 'image/bmp', 'image/gif', 'image/tiff']),
                largerThan: 0,
                smallerThan: Infinity,
                whenSmaller: false,
                replaceWith: true,
                opacity: 1,
            };
        }
        processFile(data, override) {
            const mimeType = data.mimeType;
            if (
                mimeType &&
                !/png[(%@:]/.test(mimeType) &&
                (override || findSet$4(this.options.mimeTypes, value => mimeType.endsWith(value)))
            ) {
                data.mimeType = Extension.getConvertOptions('png', this.options) + mimeType;
                return true;
            }
            return false;
        }
    }

    const { findSet: findSet$5 } = squared.lib.util;
    class Gif extends Extension {
        constructor() {
            super(...arguments);
            this.options = {
                mimeTypes: new Set(['image/png', 'image/jpeg', 'image/bmp', 'image/tiff']),
                largerThan: 0,
                smallerThan: Infinity,
                whenSmaller: false,
                replaceWith: true,
                opacity: 1,
            };
        }
        processFile(data, override) {
            const mimeType = data.mimeType;
            if (
                mimeType &&
                !/gif[(%@:]/.test(mimeType) &&
                (override || findSet$5(this.options.mimeTypes, value => mimeType.endsWith(value)))
            ) {
                data.mimeType = Extension.getConvertOptions('gif', this.options) + mimeType;
                return true;
            }
            return false;
        }
    }

    const { findSet: findSet$6 } = squared.lib.util;
    class Tiff extends Extension {
        constructor() {
            super(...arguments);
            this.options = {
                mimeTypes: new Set(['image/png', 'image/jpeg', 'image/gif', 'image/bmp']),
                largerThan: 0,
                smallerThan: Infinity,
                whenSmaller: false,
                replaceWith: true,
            };
        }
        processFile(data, override) {
            const mimeType = data.mimeType;
            if (
                mimeType &&
                !/tiff[(%@:]/.test(mimeType) &&
                (override || findSet$6(this.options.mimeTypes, value => mimeType.endsWith(value)))
            ) {
                data.mimeType = Extension.getConvertOptions('tiff', this.options) + mimeType;
                return true;
            }
            return false;
        }
    }

    const settings = {
        builtInExtensions: [],
        preloadImages: false,
        preloadFonts: false,
        excludePlainText: true,
        createElementMap: true,
        createQuerySelectorMap: true,
        showErrorMessages: false,
        outputFileExclusions: [],
        outputEmptyCopyDirectory: false,
        outputArchiveName: 'chrome-data',
        outputArchiveFormat: 'zip',
    };

    const { DIRECTORY_NOT_PROVIDED, FRAMEWORK_NOT_INSTALLED, reject: reject$1 } = squared.lib.error;
    const { isString: isString$1, isPlainObject: isPlainObject$1 } = squared.lib.util;
    let application = null;
    let file = null;
    function createAssetsOptions(assets, options, directory, filename) {
        if (isPlainObject$1(options)) {
            if (options.assets) {
                assets = assets.concat(options.assets);
            }
        } else {
            options = {};
        }
        return Object.assign(options, { assets, directory, filename });
    }
    const checkFileName = value => value || application.userSettings.outputArchiveName;
    const appBase = {
        base: {
            Application,
            Extension,
            File,
        },
        lib: {},
        extensions: {
            compress: {
                Brotli: Brotli,
                Gzip: Gzip,
                Jpeg: Jpeg,
                Png: Png,
            },
            convert: {
                Bmp: Bmp,
                Gif: Gif,
                Jpeg: Jpeg$1,
                Png: Png$1,
                Tiff: Tiff,
            },
        },
        system: {
            copyHtmlPage(directory, options) {
                if (isString$1(directory)) {
                    return (
                        (file === null || file === void 0
                            ? void 0
                            : file.copying(createAssetsOptions(file.getHtmlPage(options), options, directory))) ||
                        reject$1(FRAMEWORK_NOT_INSTALLED)
                    );
                }
                return reject$1(DIRECTORY_NOT_PROVIDED);
            },
            copyScriptAssets(directory, options) {
                if (isString$1(directory)) {
                    return (
                        (file === null || file === void 0
                            ? void 0
                            : file.copying(
                                  createAssetsOptions(file.getScriptAssets(options)[0], options, directory)
                              )) || reject$1(FRAMEWORK_NOT_INSTALLED)
                    );
                }
                return reject$1(DIRECTORY_NOT_PROVIDED);
            },
            copyLinkAssets(directory, options) {
                if (isString$1(directory)) {
                    return (
                        (file === null || file === void 0
                            ? void 0
                            : file.copying(createAssetsOptions(file.getLinkAssets(options), options, directory))) ||
                        reject$1(FRAMEWORK_NOT_INSTALLED)
                    );
                }
                return reject$1(DIRECTORY_NOT_PROVIDED);
            },
            copyImageAssets(directory, options) {
                if (isString$1(directory)) {
                    return (
                        (file === null || file === void 0
                            ? void 0
                            : file.copying(createAssetsOptions(file.getImageAssets(options), options, directory))) ||
                        reject$1(FRAMEWORK_NOT_INSTALLED)
                    );
                }
                return reject$1(DIRECTORY_NOT_PROVIDED);
            },
            copyVideoAssets(directory, options) {
                if (isString$1(directory)) {
                    return (
                        (file === null || file === void 0
                            ? void 0
                            : file.copying(createAssetsOptions(file.getVideoAssets(options), options, directory))) ||
                        reject$1(FRAMEWORK_NOT_INSTALLED)
                    );
                }
                return reject$1(DIRECTORY_NOT_PROVIDED);
            },
            copyAudioAssets(directory, options) {
                if (isString$1(directory)) {
                    return (
                        (file === null || file === void 0
                            ? void 0
                            : file.copying(createAssetsOptions(file.getAudioAssets(options), options, directory))) ||
                        reject$1(FRAMEWORK_NOT_INSTALLED)
                    );
                }
                return reject$1(DIRECTORY_NOT_PROVIDED);
            },
            copyFontAssets(directory, options) {
                if (isString$1(directory)) {
                    return (
                        (file === null || file === void 0
                            ? void 0
                            : file.copying(createAssetsOptions(file.getFontAssets(options), options, directory))) ||
                        reject$1(FRAMEWORK_NOT_INSTALLED)
                    );
                }
                return reject$1(DIRECTORY_NOT_PROVIDED);
            },
            saveHtmlPage(filename, options) {
                return (
                    (file === null || file === void 0
                        ? void 0
                        : file.archiving(
                              createAssetsOptions(
                                  file.getHtmlPage(options),
                                  options,
                                  undefined,
                                  checkFileName(filename) + '-html'
                              )
                          )) || reject$1(FRAMEWORK_NOT_INSTALLED)
                );
            },
            saveScriptAssets(filename, options) {
                return (
                    (file === null || file === void 0
                        ? void 0
                        : file.archiving(
                              createAssetsOptions(
                                  file.getScriptAssets(options)[0],
                                  options,
                                  undefined,
                                  checkFileName(filename) + '-script'
                              )
                          )) || reject$1(FRAMEWORK_NOT_INSTALLED)
                );
            },
            saveLinkAssets(filename, options) {
                return (
                    (file === null || file === void 0
                        ? void 0
                        : file.archiving(
                              createAssetsOptions(
                                  file.getLinkAssets(options),
                                  options,
                                  undefined,
                                  checkFileName(filename) + '-link'
                              )
                          )) || reject$1(FRAMEWORK_NOT_INSTALLED)
                );
            },
            saveImageAssets(filename, options) {
                return (
                    (file === null || file === void 0
                        ? void 0
                        : file.archiving(
                              createAssetsOptions(
                                  file.getImageAssets(options),
                                  options,
                                  undefined,
                                  checkFileName(filename) + '-image'
                              )
                          )) || reject$1(FRAMEWORK_NOT_INSTALLED)
                );
            },
            saveVideoAssets(filename, options) {
                return (
                    (file === null || file === void 0
                        ? void 0
                        : file.archiving(
                              createAssetsOptions(
                                  file.getVideoAssets(options),
                                  options,
                                  undefined,
                                  checkFileName(filename) + '-video'
                              )
                          )) || reject$1(FRAMEWORK_NOT_INSTALLED)
                );
            },
            saveAudioAssets(filename, options) {
                return (
                    (file === null || file === void 0
                        ? void 0
                        : file.archiving(
                              createAssetsOptions(
                                  file.getAudioAssets(options),
                                  options,
                                  undefined,
                                  checkFileName(filename) + '-audio'
                              )
                          )) || reject$1(FRAMEWORK_NOT_INSTALLED)
                );
            },
            saveFontAssets(filename, options) {
                return (
                    (file === null || file === void 0
                        ? void 0
                        : file.archiving(
                              createAssetsOptions(
                                  file.getFontAssets(options),
                                  options,
                                  undefined,
                                  checkFileName(filename) + '-font'
                              )
                          )) || reject$1(FRAMEWORK_NOT_INSTALLED)
                );
            },
        },
        create() {
            application = new Application(
                4 /* CHROME */,
                squared.base.Node,
                squared.base.Controller,
                squared.base.ExtensionManager,
                squared.base.Resource
            );
            file = new File();
            application.resourceHandler.fileHandler = file;
            application.builtInExtensions = new Map([
                [
                    'chrome.compress.brotli' /* COMPRESS_BROTLI */,
                    new Brotli('chrome.compress.brotli' /* COMPRESS_BROTLI */, 4 /* CHROME */),
                ],
                [
                    'chrome.compress.gzip' /* COMPRESS_GZIP */,
                    new Gzip('chrome.compress.gzip' /* COMPRESS_GZIP */, 4 /* CHROME */),
                ],
                [
                    'chrome.compress.jpeg' /* COMPRESS_JPEG */,
                    new Jpeg('chrome.compress.jpeg' /* COMPRESS_JPEG */, 4 /* CHROME */),
                ],
                [
                    'chrome.compress.png' /* COMPRESS_PNG */,
                    new Png('chrome.compress.png' /* COMPRESS_PNG */, 4 /* CHROME */),
                ],
                [
                    'chrome.convert.bmp' /* CONVERT_BMP */,
                    new Bmp('chrome.convert.bmp' /* CONVERT_BMP */, 4 /* CHROME */),
                ],
                [
                    'chrome.convert.gif' /* CONVERT_GIF */,
                    new Gif('chrome.convert.gif' /* CONVERT_GIF */, 4 /* CHROME */),
                ],
                [
                    'chrome.convert.jpeg' /* CONVERT_JPEG */,
                    new Jpeg$1('chrome.convert.jpeg' /* CONVERT_JPEG */, 4 /* CHROME */),
                ],
                [
                    'chrome.convert.png' /* CONVERT_PNG */,
                    new Png$1('chrome.convert.png' /* CONVERT_PNG */, 4 /* CHROME */),
                ],
                [
                    'chrome.convert.tiff' /* CONVERT_TIFF */,
                    new Tiff('chrome.convert.tiff' /* CONVERT_TIFF */, 4 /* CHROME */),
                ],
            ]);
            return {
                application,
                framework: 4 /* CHROME */,
                userSettings: Object.assign({}, settings),
            };
        },
        cached() {
            if (application) {
                return {
                    application,
                    framework: 4 /* CHROME */,
                    userSettings: application.userSettings,
                };
            }
            return this.create();
        },
    };

    return appBase;
});
