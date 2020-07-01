/* chrome-framework 1.13.0
   https://github.com/anpham6/squared */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined'
        ? (module.exports = factory())
        : typeof define === 'function' && define.amd
        ? define(factory)
        : ((global = global || self), (global.chrome = factory()));
})(this, function () {
    'use strict';

    class Application extends squared.base.Application {
        constructor() {
            super(...arguments);
            this.builtInExtensions = {};
            this.extensions = [];
            this.systemName = 'chrome';
        }
        insertNode(element, sessionId) {
            if (element.nodeName === '#text') {
                if (this.userSettings.excludePlainText) {
                    return undefined;
                }
                this.controllerHandler.applyDefaultStyles(element, sessionId);
            }
            return this.createNode(sessionId, { element });
        }
    }

    const { setElementCache } = squared.lib.session;
    class Controller extends squared.base.Controller {
        constructor(application) {
            super();
            this.application = application;
        }
        applyDefaultStyles(element, sessionId) {
            if (element.nodeName === '#text') {
                setElementCache(element, 'styleMap', sessionId, {
                    position: 'static',
                    display: 'inline',
                    verticalAlign: 'baseline',
                    float: 'none',
                    clear: 'none',
                });
            }
        }
        get userSettings() {
            return this.application.userSettings;
        }
    }

    class Resource extends squared.base.Resource {
        constructor(application) {
            super();
            this.application = application;
        }
        get userSettings() {
            return this.application.userSettings;
        }
    }

    const { FILE } = squared.lib.regex;
    const {
        appendSeparator,
        convertWord,
        fromLastIndexOf,
        isString,
        iterateReverseArray,
        parseMimeType,
        partitionLastIndexOf,
        randomUUID,
        resolvePath,
        safeNestedArray,
        trimEnd,
    } = squared.lib.util;
    const STRING_SERVERROOT = '__serverroot__';
    function parseFileAs(attr, value) {
        if (value) {
            const match = new RegExp(`${attr}:\\s*((?:[^"]|\\\\")+)`).exec(value.replace(/\\/g, '/'));
            if (match) {
                const segments = match[1].split('::').map(item => item.trim());
                return [segments[0], segments[1] || undefined, segments[2] === 'preserve'];
            }
        }
        return undefined;
    }
    function getFilePath(value, saveTo) {
        value = value.replace(/\\/g, '/');
        let moveTo;
        if (value.charAt(0) === '/') {
            moveTo = STRING_SERVERROOT;
        } else if (value.startsWith('../')) {
            moveTo = STRING_SERVERROOT;
            const pathname = location.pathname.split('/');
            pathname.pop();
            for (let i = 0; i < value.length && pathname.length > 0; i += 3) {
                if (value.substring(i, i + 3) === '../') {
                    pathname.pop();
                } else {
                    break;
                }
            }
            value = pathname.join('/') + '/' + value.split('../').pop();
        } else if (value.startsWith('./')) {
            value = value.substring(2);
        }
        const result = partitionLastIndexOf(value, '/');
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
        value = value
            .trim()
            .replace(/([.|/\\{}()?])/g, (match, ...capture) => '\\' + capture[0])
            .replace(/\*/g, '.*?');
        return new RegExp(`${value}$`);
    }
    function getExtensions(element) {
        var _a, _b;
        if (element) {
            const dataset = element.dataset;
            const use =
                ((_a = dataset.useChrome) === null || _a === void 0 ? void 0 : _a.trim()) ||
                ((_b = dataset.use) === null || _b === void 0 ? void 0 : _b.trim());
            if (use) {
                return use.split(/\s*,\s*/);
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
            const ext = this.application.extensionManager.retrieve(name, true);
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
                let i = 0;
                while (i < length) {
                    items[i].bundleIndex = i++;
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
                    safeNestedArray(item, 'trailingContent').push({ value: content, format, preserve });
                    return true;
                }
                return;
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
        return undefined;
    }
    function sortBundle(a, b) {
        if (a.bundleIndex === 0) {
            return 1;
        } else if (b.bundleIndex === 0) {
            return -1;
        }
        return 0;
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
            if (
                !local &&
                !relocate &&
                (options === null || options === void 0 ? void 0 : options.preserveCrossOrigin)
            ) {
                return undefined;
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
                            relocate + '/' + randomUUID() + (extension ? '.' + extension : '')
                        );
                    } else {
                        pathname = convertWord(host) + (port ? '/' + port.substring(1) : '') + '/';
                    }
                } else {
                    prefix = location.pathname.substring(0, location.pathname.lastIndexOf('/') + 1);
                    let length = path.length;
                    if (length > 0) {
                        let index = 0;
                        length = Math.min(length, prefix.length);
                        for (let i = 0; i < length; ++i) {
                            if (path.charAt(i) === prefix.charAt(i)) {
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
            return undefined;
        }
        reset() {
            super.reset();
            this._outputFileExclusions = undefined;
        }
        copyToDisk(directory, options) {
            return this.copying(
                Object.assign(Object.assign({}, options), {
                    assets: this.combineAssets().concat(
                        (options === null || options === void 0 ? void 0 : options.assets) || []
                    ),
                    directory,
                })
            );
        }
        appendToArchive(pathname, options) {
            return this.archiving(
                Object.assign(Object.assign({ filename: this.userSettings.outputArchiveName }, options), {
                    assets: this.combineAssets(options).concat(
                        (options === null || options === void 0 ? void 0 : options.assets) || []
                    ),
                    appendTo: pathname,
                })
            );
        }
        saveToArchive(filename, options) {
            return this.archiving(
                Object.assign(Object.assign({}, options), {
                    assets: this.combineAssets(options).concat(
                        (options === null || options === void 0 ? void 0 : options.assets) || []
                    ),
                    filename,
                })
            );
        }
        getHtmlPage(options) {
            var _a;
            let name, saveAs, preserveCrossOrigin;
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
            if (!isString(file) && (saveAs === null || saveAs === void 0 ? void 0 : saveAs.filename)) {
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
            let saveAs, preserveCrossOrigin;
            if (options) {
                preserveCrossOrigin = options.preserveCrossOrigin;
                saveAs = (_a = options.saveAs) === null || _a === void 0 ? void 0 : _a.script;
            }
            const result = [];
            const bundleIndex = {};
            document.querySelectorAll('script').forEach(element => {
                const src = element.src.trim();
                let file = element.dataset.chromeFile;
                if (file !== 'exclude') {
                    let format, outerHTML, preserve, data;
                    if (!isString(file) && (saveAs === null || saveAs === void 0 ? void 0 : saveAs.filename)) {
                        file = appendSeparator(saveAs.pathname || '', saveAs.filename);
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
                        safeNestedArray(bundleIndex, (data.moveTo || '') + data.pathname + data.filename).push(data);
                        data.mimeType =
                            element.type.trim() || (data.uri && parseMimeType(data.uri)) || 'text/javascript';
                        if (outerHTML) {
                            data.outerHTML = outerHTML;
                        }
                        processExtensions.call(this, data, getExtensions(element));
                        result.push(data);
                    }
                }
            });
            setBundleIndex(bundleIndex);
            return result.sort(sortBundle);
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
            document.querySelectorAll((rel ? `link[rel="${rel}"]` : 'link') + ', style').forEach(element => {
                let file = element.dataset.chromeFile;
                if (file !== 'exclude') {
                    let data, href, mimeType, format, preserve, outerHTML;
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
                        (saveAs === null || saveAs === void 0 ? void 0 : saveAs.filename) &&
                        (mimeType === 'text/css' || element instanceof HTMLStyleElement)
                    ) {
                        file = appendSeparator(saveAs.pathname || '', saveAs.filename);
                        format = saveAs.format;
                        preserve = saveAs.preserve;
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
                        safeNestedArray(bundleIndex, (data.moveTo || '') + data.pathname + data.filename).push(data);
                        data.mimeType = mimeType || 'text/css';
                        if (outerHTML) {
                            data.outerHTML = outerHTML;
                        }
                        processExtensions.call(this, data, getExtensions(element));
                        result.push(data);
                    }
                }
            });
            for (const [uri, rawData] of Resource.ASSETS.rawData.entries()) {
                const mimeType = rawData.mimeType;
                if (mimeType === 'text/css') {
                    const data = File.parseUri(resolvePath(uri), {
                        preserveCrossOrigin,
                        format: saveAs === null || saveAs === void 0 ? void 0 : saveAs.format,
                    });
                    if (this.validFile(data)) {
                        data.mimeType = mimeType;
                        processExtensions.call(this, data, []);
                        result.push(data);
                    }
                }
            }
            setBundleIndex(bundleIndex);
            return result.sort(sortBundle);
        }
        getImageAssets(options) {
            var _a;
            let saveAs, preserveCrossOrigin;
            if (options) {
                preserveCrossOrigin = options.preserveCrossOrigin;
                saveAs = (_a = options.saveAs) === null || _a === void 0 ? void 0 : _a.base64;
            }
            const result = [];
            const processUri = (element, uri, mimeType) => {
                uri = uri.trim();
                if (uri !== '') {
                    let file,
                        saveTo = false;
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
                            data.mimeType = file ? mimeType + ':' + data.mimeType : mimeType;
                        }
                        processExtensions.call(this, data, getExtensions(element));
                        result.push(data);
                        return data;
                    }
                }
                return undefined;
            };
            document.querySelectorAll('video').forEach(element => processUri(null, resolvePath(element.poster)));
            document.querySelectorAll('picture > source').forEach(element => {
                for (const uri of element.srcset.trim().split(',')) {
                    processUri(element, resolvePath(uri.split(' ')[0]));
                }
            });
            document.querySelectorAll('img, input[type=image]').forEach(element => {
                const src = element.src.trim();
                if (!src.startsWith('data:image/')) {
                    processUri(element, resolvePath(src));
                }
            });
            document.querySelectorAll('img[srcset], picture > source[srcset]').forEach(element => {
                const pattern = /[\s\n]*(.+?\.[^\s,]+)(\s+[\d.]+[wx]\s*)?,?/g;
                let match;
                while ((match = pattern.exec(element.srcset.trim()))) {
                    processUri(element, resolvePath(match[1]));
                }
            });
            document.querySelectorAll('object, embed').forEach(element => {
                const src = element.data || element.src;
                if (src && (element.type.startsWith('image/') || parseMimeType(src).startsWith('image/'))) {
                    processUri(element, src.trim());
                }
            });
            for (const uri of Resource.ASSETS.image.keys()) {
                processUri(null, uri);
            }
            for (const rawData of Resource.ASSETS.rawData.values()) {
                if (rawData.pathname) {
                    continue;
                } else {
                    const { base64, filename } = rawData;
                    let mimeType = rawData.mimeType,
                        data;
                    if (base64) {
                        if (saveAs) {
                            const format = saveAs.format;
                            if (
                                format &&
                                (mimeType === null || mimeType === void 0 ? void 0 : mimeType.startsWith('image/'))
                            ) {
                                switch (format) {
                                    case 'png':
                                    case 'jpeg':
                                    case 'bmp':
                                    case 'gif':
                                    case 'tiff':
                                        mimeType = `@${format}:${mimeType}`;
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
                        data = { pathname: '__generated__/base64', filename, mimeType, base64 };
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
            const preserveCrossOrigin = options === null || options === void 0 ? void 0 : options.preserveCrossOrigin;
            const result = [];
            for (const fonts of Resource.ASSETS.fonts.values()) {
                let i = 0;
                while (i < fonts.length) {
                    const url = fonts[i++].srcUrl;
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
            if (options.removeUnusedStyles) {
                return { unusedStyles: Array.from(this.application.session.unusedStyles) };
            }
            return undefined;
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
            const preserveCrossOrigin = options === null || options === void 0 ? void 0 : options.preserveCrossOrigin;
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
                for (const [item, uri] of items.entries()) {
                    const saveAs =
                        (_a = parseFileAs('saveTo', item.dataset.chromeFile)) === null || _a === void 0
                            ? void 0
                            : _a[0];
                    const data = File.parseUri(uri, { preserveCrossOrigin, saveAs, saveTo: !!saveAs });
                    if (this.validFile(data)) {
                        processExtensions.call(this, data, getExtensions(item));
                        result.push(data);
                    }
                }
            });
            return result;
        }
        combineAssets(options) {
            const result = this.getHtmlPage(options).concat(this.getLinkAssets(options));
            if (options === null || options === void 0 ? void 0 : options.saveAsWebPage) {
                let i = 0;
                while (i < result.length) {
                    const item = result[i++];
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
            return result
                .concat(this.getScriptAssets(options))
                .concat(this.getImageAssets(options))
                .concat(this.getVideoAssets(options))
                .concat(this.getAudioAssets(options))
                .concat(this.getRawAssets('object', options))
                .concat(this.getRawAssets('embed', options))
                .concat(this.getFontAssets(options));
        }
        get outputFileExclusions() {
            const result = this._outputFileExclusions;
            return result === undefined
                ? (this._outputFileExclusions = this.userSettings.outputFileExclusions.map(value =>
                      convertFileMatch(value)
                  ))
                : result;
        }
        get userSettings() {
            return this.resource.userSettings;
        }
        get application() {
            return this.resource.application;
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
            return result !== '(0,*)' ? result : undefined;
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

    const { safeNestedArray: safeNestedArray$1 } = squared.lib.util;
    class Brotli extends Extension {
        constructor() {
            super(...arguments);
            this.options = {
                mimeTypes: [
                    'text/css',
                    'text/javascript',
                    'text/plain',
                    'text/csv',
                    'text/vtt',
                    'application/json',
                    'application/javascript',
                    'application/ld+json',
                    'application/xml',
                ],
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
                    override = mimeTypes === '*' || (Array.isArray(mimeTypes) && mimeTypes.includes(mimeType));
                }
            }
            if (override) {
                safeNestedArray$1(data, 'compress').push({
                    format: 'br',
                    level: this.options.level,
                    condition: Extension.getCompressOptions(this.options),
                });
                return true;
            }
            return false;
        }
    }

    const { safeNestedArray: safeNestedArray$2 } = squared.lib.util;
    class Gzip extends Extension {
        constructor() {
            super(...arguments);
            this.options = {
                mimeTypes: [
                    'text/css',
                    'text/javascript',
                    'text/plain',
                    'text/csv',
                    'text/vtt',
                    'application/json',
                    'application/javascript',
                    'application/ld+json',
                    'application/xml',
                ],
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
                    override = mimeTypes === '*' || (Array.isArray(mimeTypes) && mimeTypes.includes(mimeType));
                }
            }
            if (override) {
                safeNestedArray$2(data, 'compress').push({
                    format: 'gz',
                    level: this.options.level,
                    condition: Extension.getCompressOptions(this.options),
                });
                return true;
            }
            return false;
        }
    }

    const { safeNestedArray: safeNestedArray$3 } = squared.lib.util;
    class Jpeg extends Extension {
        constructor() {
            super(...arguments);
            this.options = {
                mimeTypes: ['image/jpeg'],
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
                        (mimeTypes === '*' && mimeType.includes('image/')) ||
                        (Array.isArray(mimeTypes) && !!mimeTypes.find(value => mimeType.endsWith(value)));
                }
            }
            if (override) {
                safeNestedArray$3(data, 'compress').push(
                    { format: 'png', condition: Extension.getCompressOptions(this.options) },
                    { format: 'jpeg', level: this.options.level }
                );
                return true;
            }
            return false;
        }
    }

    const { safeNestedArray: safeNestedArray$4 } = squared.lib.util;
    class Png extends Extension {
        constructor() {
            super(...arguments);
            this.options = {
                mimeTypes: ['image/png'],
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
                        mimeType.includes('png:') ||
                        (mimeTypes === '*' && mimeType.includes('image/')) ||
                        (Array.isArray(mimeTypes) && !!mimeTypes.find(value => mimeType.endsWith(value)));
                }
            }
            if (override) {
                safeNestedArray$4(data, 'compress').push({
                    format: 'png',
                    condition: Extension.getCompressOptions(this.options),
                });
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
                largerThan: 0,
                smallerThan: Infinity,
                whenSmaller: false,
                replaceWith: true,
            };
        }
        processFile(data, override) {
            const mimeType = data.mimeType;
            if (mimeType && !/bmp[(%@:]/.test(mimeType)) {
                const mimeTypes = this.options.mimeTypes;
                if (override || (Array.isArray(mimeTypes) && mimeTypes.find(value => mimeType.endsWith(value)))) {
                    data.mimeType = Extension.getConvertOptions('bmp', this.options) + mimeType;
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
                largerThan: 0,
                smallerThan: Infinity,
                whenSmaller: false,
                replaceWith: true,
            };
        }
        processFile(data, override) {
            const mimeType = data.mimeType;
            if (mimeType && !/jpeg[(%@:]/.test(mimeType)) {
                const mimeTypes = this.options.mimeTypes;
                if (override || (Array.isArray(mimeTypes) && mimeTypes.find(value => mimeType.endsWith(value)))) {
                    data.mimeType = Extension.getConvertOptions('jpeg', this.options) + mimeType;
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
                largerThan: 0,
                smallerThan: Infinity,
                whenSmaller: false,
                replaceWith: true,
                opacity: 1,
            };
        }
        processFile(data, override) {
            const mimeType = data.mimeType;
            if (mimeType && !/png[(%@:]/.test(mimeType)) {
                const mimeTypes = this.options.mimeTypes;
                if (override || (Array.isArray(mimeTypes) && mimeTypes.find(value => mimeType.endsWith(value)))) {
                    data.mimeType = Extension.getConvertOptions('png', this.options) + mimeType;
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
                largerThan: 0,
                smallerThan: Infinity,
                whenSmaller: false,
                replaceWith: true,
                opacity: 1,
            };
        }
        processFile(data, override) {
            const mimeType = data.mimeType;
            if (mimeType && !/gif[(%@:]/.test(mimeType)) {
                const mimeTypes = this.options.mimeTypes;
                if (override || (Array.isArray(mimeTypes) && mimeTypes.find(value => mimeType.endsWith(value)))) {
                    data.mimeType = Extension.getConvertOptions('gif', this.options) + mimeType;
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
                largerThan: 0,
                smallerThan: Infinity,
                whenSmaller: false,
                replaceWith: true,
            };
        }
        processFile(data, override) {
            const mimeType = data.mimeType;
            if (mimeType && !/tiff[(%@:]/.test(mimeType)) {
                const mimeTypes = this.options.mimeTypes;
                if (override || (Array.isArray(mimeTypes) && mimeTypes.find(value => mimeType.endsWith(value)))) {
                    data.mimeType = Extension.getConvertOptions('tiff', this.options) + mimeType;
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
        createElementMap: true,
        createQuerySelectorMap: true,
        showErrorMessages: false,
        outputFileExclusions: [],
        outputEmptyCopyDirectory: false,
        outputArchiveName: 'chrome-data',
        outputArchiveFormat: 'zip',
    };

    const EXT_CHROME = {
        COMPRESS_BROTLI: 'chrome.compress.brotli',
        COMPRESS_GZIP: 'chrome.compress.gzip',
        COMPRESS_PNG: 'chrome.compress.png',
        COMPRESS_JPEG: 'chrome.compress.jpeg',
        CONVERT_PNG: 'chrome.convert.png',
        CONVERT_JPEG: 'chrome.convert.jpeg',
        CONVERT_BMP: 'chrome.convert.bmp',
        CONVERT_GIF: 'chrome.convert.gif',
        CONVERT_TIFF: 'chrome.convert.tiff',
    };

    var constant = /*#__PURE__*/ Object.freeze({
        __proto__: null,
        EXT_CHROME: EXT_CHROME,
    });

    const { util, session } = squared.lib;
    const { isString: isString$1, isObject } = util;
    const { frameworkNotInstalled } = session;
    const framework = 4; /* CHROME */
    let initialized = false;
    let application;
    let file;
    function createAssetsOptions(assets, options, directory, filename) {
        if (isObject(options)) {
            const items = options.assets;
            if (items) {
                assets = assets.concat(items);
            }
        } else {
            options = undefined;
        }
        return Object.assign(Object.assign({}, options), { assets, directory, filename });
    }
    const directoryNotProvided = () => Promise.reject('Directory not provided.');
    const appBase = {
        base: {
            Application,
            Controller,
            File,
            Resource,
        },
        lib: {
            constant,
        },
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
                        frameworkNotInstalled()
                    );
                }
                return directoryNotProvided();
            },
            copyScriptAssets(directory, options) {
                if (isString$1(directory)) {
                    return (
                        (file === null || file === void 0
                            ? void 0
                            : file.copying(createAssetsOptions(file.getScriptAssets(options), options, directory))) ||
                        frameworkNotInstalled()
                    );
                }
                return directoryNotProvided();
            },
            copyLinkAssets(directory, options) {
                if (isString$1(directory)) {
                    return (
                        (file === null || file === void 0
                            ? void 0
                            : file.copying(createAssetsOptions(file.getLinkAssets(options), options, directory))) ||
                        frameworkNotInstalled()
                    );
                }
                return directoryNotProvided();
            },
            copyImageAssets(directory, options) {
                if (isString$1(directory)) {
                    return (
                        (file === null || file === void 0
                            ? void 0
                            : file.copying(createAssetsOptions(file.getImageAssets(options), options, directory))) ||
                        frameworkNotInstalled()
                    );
                }
                return directoryNotProvided();
            },
            copyVideoAssets(directory, options) {
                if (isString$1(directory)) {
                    return (
                        (file === null || file === void 0
                            ? void 0
                            : file.copying(createAssetsOptions(file.getVideoAssets(options), options, directory))) ||
                        frameworkNotInstalled()
                    );
                }
                return directoryNotProvided();
            },
            copyAudioAssets(directory, options) {
                if (isString$1(directory)) {
                    return (
                        (file === null || file === void 0
                            ? void 0
                            : file.copying(createAssetsOptions(file.getAudioAssets(options), options, directory))) ||
                        frameworkNotInstalled()
                    );
                }
                return directoryNotProvided();
            },
            copyFontAssets(directory, options) {
                if (isString$1(directory)) {
                    return (
                        (file === null || file === void 0
                            ? void 0
                            : file.copying(createAssetsOptions(file.getFontAssets(options), options, directory))) ||
                        frameworkNotInstalled()
                    );
                }
                return directoryNotProvided();
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
                                  (filename || application.userSettings.outputArchiveName) + '-html'
                              )
                          )) || frameworkNotInstalled()
                );
            },
            saveScriptAssets(filename, options) {
                return (
                    (file === null || file === void 0
                        ? void 0
                        : file.archiving(
                              createAssetsOptions(
                                  file.getScriptAssets(options),
                                  options,
                                  undefined,
                                  (filename || application.userSettings.outputArchiveName) + '-script'
                              )
                          )) || frameworkNotInstalled()
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
                                  (filename || application.userSettings.outputArchiveName) + '-link'
                              )
                          )) || frameworkNotInstalled()
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
                                  (filename || application.userSettings.outputArchiveName) + '-image'
                              )
                          )) || frameworkNotInstalled()
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
                                  (filename || application.userSettings.outputArchiveName) + '-video'
                              )
                          )) || frameworkNotInstalled()
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
                                  (filename || application.userSettings.outputArchiveName) + '-audio'
                              )
                          )) || frameworkNotInstalled()
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
                                  (filename || application.userSettings.outputArchiveName) + '-font'
                              )
                          )) || frameworkNotInstalled()
                );
            },
        },
        create() {
            const EC = EXT_CHROME;
            application = new Application(
                framework,
                squared.base.Node,
                Controller,
                Resource,
                squared.base.ExtensionManager
            );
            file = new File();
            application.resourceHandler.fileHandler = file;
            Object.assign(application.builtInExtensions, {
                [EC.COMPRESS_BROTLI]: new Brotli(EC.COMPRESS_BROTLI, framework),
                [EC.COMPRESS_GZIP]: new Gzip(EC.COMPRESS_GZIP, framework),
                [EC.COMPRESS_JPEG]: new Jpeg(EC.COMPRESS_JPEG, framework),
                [EC.COMPRESS_PNG]: new Png(EC.COMPRESS_PNG, framework),
                [EC.CONVERT_BMP]: new Bmp(EC.CONVERT_BMP, framework),
                [EC.CONVERT_GIF]: new Gif(EC.CONVERT_GIF, framework),
                [EC.CONVERT_JPEG]: new Jpeg$1(EC.CONVERT_JPEG, framework),
                [EC.CONVERT_PNG]: new Png$1(EC.CONVERT_PNG, framework),
                [EC.CONVERT_TIFF]: new Tiff(EC.CONVERT_TIFF, framework),
            });
            initialized = true;
            return {
                application,
                framework,
                userSettings: Object.assign({}, settings),
            };
        },
        cached() {
            if (initialized) {
                return {
                    application,
                    framework,
                    userSettings: application.userSettings,
                };
            }
            return appBase.create();
        },
        saveAsWebPage: (filename, options) => {
            if (application) {
                options = !isObject(options) ? {} : Object.assign({}, options);
                options.saveAsWebPage = true;
                const settings = application.userSettings;
                const preloadImages = settings.preloadImages;
                settings.preloadImages = false;
                application.reset();
                return application.parseDocument(document.body).then(response => {
                    file.saveToArchive(filename || application.userSettings.outputArchiveName, options);
                    settings.preloadImages = preloadImages;
                    return response;
                });
            }
            return frameworkNotInstalled();
        },
    };

    return appBase;
});
