/* chrome-framework 2.4.0
   https://github.com/anpham6/squared */

var chrome = (function () {
    'use strict';

    var Resource = squared.base.Resource;
    var Pattern = squared.lib.base.Pattern;
    const { convertWord, endsWith, parseMimeType, replaceMap, resolvePath, splitPair, splitPairEnd, splitPairStart, startsWith, trimEnd } = squared.lib.util;
    const { appendSeparator, fromMimeType, parseTask, parseWatchInterval, randomUUID } = squared.base.lib.util;
    const RE_SRCSET = new Pattern(/\s*(.+?\.[^\s,]+)(\s+[\d.]+[wx])?\s*,?/g);
    const FILENAME_MAP = new WeakMap();
    let BUNDLE_ID = 0;
    function parseFileAs(attr, value) {
        if (value) {
            const match = new RegExp(`^\\s*${attr}\\s*:(.+)$`).exec(value);
            if (match) {
                const segments = replaceMap(match[1].split('::'), item => item.trim());
                return { file: normalizePath(segments[0]), format: segments[1] };
            }
        }
    }
    function parseOptions(value) {
        if (value) {
            const pattern = /\bcompress\[\s*([a-z\d]+)\s*\]/g;
            let compress, match;
            while (match = pattern.exec(value)) {
                (compress || (compress = [])).push({ format: match[1] });
            }
            return { preserve: value.includes('preserve'), inline: value.includes('inline'), blob: value.includes('blob'), compress };
        }
        return {};
    }
    function getFilePath(value, saveTo, ext) {
        if (startsWith(value, './')) {
            value = value.substring(2);
        }
        if (!value.includes('/')) {
            return ['', '', value];
        }
        let moveTo;
        if (value[0] === '/') {
            moveTo = "__serverroot__" /* SERVERROOT */;
            value = value.substring(1);
        }
        else if (startsWith(value, '../')) {
            moveTo = "__serverroot__" /* SERVERROOT */;
            let pathname = location.pathname.split('/');
            if (--pathname.length) {
                for (let i = 0, length = value.length; i < length; i += 3) {
                    if (value.substring(i, i + 3) !== '../' || --pathname.length === 0) {
                        break;
                    }
                }
            }
            pathname.shift();
            pathname = pathname.join('/');
            value = (pathname ? pathname + '/' : '') + value.split('../').pop();
        }
        const result = splitPair(value, '/', false, true);
        if (saveTo) {
            result[1] = assignFilename(result[1], ext);
        }
        return [moveTo, result[0], result[1]];
    }
    function assignFilename(value, ext) {
        ext || (ext = value && getFileExt(value));
        return "__assign__" /* ASSIGN */ + (ext ? '.' + ext : 'unknown');
    }
    function resolveAssetSource(element, data) {
        const value = resolvePath(element instanceof HTMLObjectElement ? element.data : element.src);
        if (value) {
            data.set(element, value);
        }
    }
    function setBundleIndex(bundles) {
        for (const uri in bundles) {
            const items = bundles[uri];
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
    function createBundleAsset(assets, element, file, mimeType, format, documentData, preserve, inline) {
        const content = element.innerHTML;
        if (content.trim()) {
            const [moveTo, pathname, filename] = getFilePath(file);
            const previous = assets[assets.length - 1];
            const data = {
                uri: location.href,
                pathname,
                filename,
                moveTo,
                content,
                mimeType,
                format,
                preserve,
                inlineContent: inline ? getContentType(element) : undefined
            };
            if (previous && hasSamePath(previous, data, true)) {
                (previous.trailingContent || (previous.trailingContent = [])).push(content);
                excludeAsset(assets, { exclude: true }, element, documentData);
            }
            else {
                checkFilename(assets, data);
                return data;
            }
        }
        return null;
    }
    function setBundleData(bundles, data) {
        const uri = (data.moveTo || '') + data.pathname + data.filename;
        (bundles[uri] || (bundles[uri] = [])).push(data);
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
    function excludeAsset(assets, command, element, document) {
        if (command.exclude) {
            assets.push({ pathname: '', filename: '', exclude: true, element, document });
            return true;
        }
        if (command.ignore) {
            return true;
        }
        return false;
    }
    function checkSaveAs(uri, pathname, filename) {
        const value = getCustomPath(uri, pathname, filename || assignFilename(''));
        if (value) {
            return [value, false];
        }
        else if (pathname && pathname !== '~') {
            return [pathname, true];
        }
        return ['', false];
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
    function getPageFilename(value) {
        if (!value) {
            value = getFilename(location.href);
            return /\.html?$/i.exec(value) ? value : 'index.html';
        }
        return value;
    }
    function setUUID(node, element, name) {
        var _a, _b;
        const id = (_a = element.dataset)[_b = name + 'Id'] || (_a[_b] = randomUUID());
        (node.id || (node.id = {}))[name] = id;
    }
    const getContentType = (element) => element.tagName === 'LINK' ? 'style' : element.tagName.toLowerCase();
    const getTagNode = (node, attributes, append) => (Object.assign(Object.assign({}, node), { attributes, append }));
    const getFilename = (value) => value.split('?')[0].split('/').pop();
    const copyDocument = (value) => Array.isArray(value) ? value.slice(0) : value;
    const hasSamePath = (item, other, bundle) => item.pathname === other.pathname && (item.filename === other.filename || FILENAME_MAP.get(item) === other.filename || bundle && startsWith(item.filename, "__assign__" /* ASSIGN */)) && (item.moveTo || '') === (other.moveTo || '');
    const getMimeType = (element, src, fallback) => element.type.trim().toLowerCase() || src && parseMimeType(src) || fallback;
    const getFileExt = (value) => splitPairEnd(value, '.', true, true).toLowerCase();
    const normalizePath = (value) => value.replace(/\\+/g, '/');
    class File extends squared.base.File {
        static createTagNode(element, domAll, cache) {
            const tagName = element.tagName.toLowerCase();
            const elements = cache[tagName] || (cache[tagName] = document.querySelectorAll(tagName));
            const tagCount = elements.length;
            let index = -1, tagIndex = -1;
            for (let i = 0, length = domAll.length; i < length; ++i) {
                if (domAll[i] === element) {
                    index = i;
                }
            }
            for (let i = 0; i < tagCount; ++i) {
                if (elements[i] === element) {
                    tagIndex = i;
                    break;
                }
            }
            return { index, tagName, tagIndex, tagCount, lowerCase: true };
        }
        static setDocumentId(node, element, document) {
            if (Array.isArray(document)) {
                for (const name of document) {
                    setUUID(node, element, name);
                }
            }
            else if (document) {
                setUUID(node, element, document);
            }
        }
        static parseUri(uri, preserveCrossOrigin, options) {
            let saveAs, mimeType, format, saveTo, fromConfig;
            if (options) {
                ({ saveAs, mimeType, format, saveTo, fromConfig } = options);
            }
            let value = trimEnd(uri, '/'), file;
            const local = startsWith(value, location.origin);
            if (saveAs) {
                saveAs = trimEnd(normalizePath(saveAs), '/');
                if (saveTo || fromConfig) {
                    file = saveAs;
                }
                else {
                    const data = parseFileAs('saveAs', saveAs);
                    if (data) {
                        ({ file, format } = data);
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
            if (!local && !file && preserveCrossOrigin) {
                return null;
            }
            try {
                const { host, port, pathname: path } = new URL(value);
                const [pathsub, filesub] = splitPair(path, '/', false, true);
                let pathname = '', filename = '', moveTo;
                if (file) {
                    [moveTo, pathname, filename] = getFilePath(file, saveTo, getFileExt(uri));
                }
                else if (!local) {
                    pathname = convertWord(host) + (port ? '/' + port.substring(1) : '') + pathsub;
                }
                if (uri !== location.href) {
                    if (local && !pathname) {
                        let pathbase = location.pathname;
                        if (!pathbase.endsWith('/')) {
                            pathbase = splitPairStart(pathbase, '/', false, true);
                        }
                        if (pathsub.startsWith(pathbase)) {
                            pathname = pathsub.substring(pathbase.length + 1);
                        }
                        else {
                            moveTo = "__serverroot__" /* SERVERROOT */;
                            pathname = pathsub;
                        }
                    }
                    filename || (filename = filesub);
                }
                return {
                    uri,
                    moveTo,
                    pathname: decodeURIComponent(pathname),
                    filename: decodeURIComponent(filename),
                    mimeType: mimeType || parseMimeType(uri),
                    format
                };
            }
            catch (_a) {
            }
            return null;
        }
        copyTo(pathname, options) {
            return this.copying(pathname, this.processAssets(options));
        }
        appendTo(target, options) {
            return this.archiving(target, this.processAssets(options));
        }
        saveAs(filename, options) {
            if (filename) {
                options.filename = filename;
            }
            return this.archiving('', this.processAssets(options));
        }
        getHtmlPage(options) {
            var _a;
            const element = document.documentElement;
            let file = element.dataset.chromeFile;
            if (file === 'ignore') {
                return [];
            }
            let assetMap, saveAsHtml;
            if (options) {
                assetMap = options.assetMap;
                saveAsHtml = (_a = options.saveAs) === null || _a === void 0 ? void 0 : _a.html;
            }
            const command = assetMap && assetMap.get(element);
            let filename, format, process, compress, tasks, attributes, cloudStorage, documentData;
            if (command) {
                if (command.ignore || command.exclude) {
                    return [];
                }
                ({ filename, process, compress, tasks, attributes, cloudStorage, document: documentData } = command);
            }
            else if (saveAsHtml) {
                if (saveAsHtml.ignore || saveAsHtml.exclude) {
                    return [];
                }
                ({ filename, process, compress, tasks, attributes, cloudStorage, document: documentData } = saveAsHtml);
            }
            else {
                tasks = parseTask(element.dataset.chromeTasks);
            }
            if (filename) {
                file = '';
            }
            if (process) {
                format = process.join('+');
            }
            const data = File.parseUri(location.href, false, { saveAs: file, format, mimeType: 'text/html' });
            if (this.processExtensions(data, documentData, compress, tasks, cloudStorage, attributes, element)) {
                if (filename || !data.filename) {
                    data.filename = getPageFilename(filename);
                }
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
                for (const { selector, type, template } of assetMap.values()) {
                    if (template && type && !selector) {
                        switch (type) {
                            case 'html':
                            case 'js':
                            case 'css': {
                                const { module, identifier } = template;
                                let value = template.value;
                                if (module && identifier && value && (value = value.trim()) && startsWith(value, 'function')) {
                                    ((_b = (templateMap || (templateMap = { html: {}, js: {}, css: {} }))[type])[module] || (_b[module] = {}))[identifier] = value;
                                }
                                break;
                            }
                        }
                    }
                }
            }
            document.querySelectorAll('script').forEach(element => {
                var _a;
                const template = element.dataset.chromeTemplate;
                if (template || element.type === 'text/template') {
                    const command = assetMap && assetMap.get(element);
                    let category, module, identifier;
                    if (command) {
                        category = command.type;
                        if (command.template) {
                            ({ module, identifier } = command.template);
                        }
                        excludeAsset(result, command, element, this.userSettings.outputDocumentHandler);
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
                                element.dataset.chromeFile = 'exclude';
                                break;
                        }
                    }
                }
                else {
                    const src = element.src;
                    this.createBundle(result, element, src, getMimeType(element, src, 'text/javascript'), preserveCrossOrigin, bundleIndex, assetMap, undefined, saveAsScript);
                }
            });
            setBundleIndex(bundleIndex);
            return [result, templateMap];
        }
        getLinkAssets(options) {
            var _a;
            let resourceId, assetMap, preserveCrossOrigin, saveAsLink;
            if (options) {
                ({ resourceId, assetMap, preserveCrossOrigin } = options);
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
                this.createBundle(result, element, href, mimeType || getMimeType(element, href, 'text/css'), preserveCrossOrigin, bundleIndex, assetMap, undefined, saveAsLink, mimeType === 'text/css' || element instanceof HTMLStyleElement);
            });
            let process, compress, preserve, tasks, cloudStorage, documentData;
            if (saveAsLink) {
                ({ process, compress, preserve, tasks, cloudStorage, document: documentData } = saveAsLink);
            }
            const assets = this.getResourceAssets(resourceId);
            if (assets) {
                for (const [uri, item] of assets.rawData) {
                    if (item.mimeType === 'text/css') {
                        const data = File.parseUri(resolvePath(uri), preserveCrossOrigin, { format: process ? process.join('+') : undefined });
                        if (this.processExtensions(data, documentData, compress, tasks, cloudStorage)) {
                            if (preserve) {
                                data.preserve = true;
                            }
                            data.mimeType = item.mimeType;
                            result.push(data);
                        }
                    }
                }
            }
            setBundleIndex(bundleIndex);
            return result;
        }
        getImageAssets(options) {
            var _a;
            let resourceId, assetMap, preserveCrossOrigin, saveAsImage;
            if (options) {
                ({ resourceId, assetMap, preserveCrossOrigin } = options);
                saveAsImage = (_a = options.saveAs) === null || _a === void 0 ? void 0 : _a.image;
            }
            const result = [];
            document.querySelectorAll('img, input[type=image], picture > source[src]').forEach((element) => {
                let src = element instanceof HTMLVideoElement ? element.poster : element.src, mimeType, base64;
                const image = Resource.parseDataURI(src);
                if (image) {
                    base64 = image.base64;
                    if (base64) {
                        mimeType = image.mimeType;
                        src = resolvePath(randomUUID() + '.' + (mimeType && fromMimeType(mimeType) || 'unknown'), location.href);
                    }
                    else {
                        return;
                    }
                }
                else {
                    src = resolvePath(src);
                }
                this.processImageUri(result, element, src, saveAsImage, preserveCrossOrigin, assetMap, mimeType, base64);
            });
            document.querySelectorAll('img[srcset], picture > source[srcset]').forEach((element) => {
                RE_SRCSET.matcher(element.srcset.trim());
                while (RE_SRCSET.find()) {
                    const src = resolvePath(RE_SRCSET.group(1));
                    if (src !== resolvePath(element.src)) {
                        this.processImageUri(result, element, src, saveAsImage, preserveCrossOrigin, assetMap, undefined, undefined, true);
                    }
                }
            });
            const assets = this.getResourceAssets(resourceId);
            if (assets) {
                for (const uri of assets.image.keys()) {
                    const image = Resource.parseDataURI(uri);
                    if (image) {
                        if (image.base64) {
                            this.resource.addRawData(resourceId, uri, image);
                        }
                    }
                    else if (!result.find(item => item.uri === uri)) {
                        this.processImageUri(result, null, uri, saveAsImage, preserveCrossOrigin);
                    }
                }
                for (const { base64, content, filename, mimeType = parseMimeType(filename) } of assets.rawData.values()) {
                    if (base64) {
                        if ((saveAsImage === null || saveAsImage === void 0 ? void 0 : saveAsImage.blob) && !result.find(item => item.base64 === base64)) {
                            let commands;
                            if (startsWith(mimeType, 'image/') && (commands = saveAsImage.commands)) {
                                for (let i = 0; i < commands.length; ++i) {
                                    const match = /^\s*(?:(png|jpeg|webp|bmp)\s*[@%]?)(.*)$/.exec(commands[i]);
                                    if (match) {
                                        commands[i] = match[1] + '@' + match[2].trim();
                                    }
                                    else {
                                        commands.splice(i--, 1);
                                    }
                                }
                            }
                            const pathname = saveAsImage.pathname;
                            const data = this.processImageUri(result, null, resolvePath(pathname ? appendSeparator(pathname, filename) : filename, location.href), saveAsImage, preserveCrossOrigin, undefined, mimeType, base64);
                            if (data) {
                                if (endsWith(data.filename, '.unknown')) {
                                    data.mimeType = 'image/unknown';
                                }
                                if (commands && commands.length) {
                                    data.commands || (data.commands = commands);
                                }
                                data.cloudStorage = saveAsImage.cloudStorage;
                                if (!pathname) {
                                    delete data.uri;
                                }
                            }
                        }
                    }
                    else if (content && mimeType) {
                        const data = {
                            pathname: "__generated__" /* GENERATED */ + `/${mimeType.split('/').pop()}`,
                            filename: assignFilename(filename),
                            content,
                            mimeType
                        };
                        if (this.processExtensions(data)) {
                            result.push(data);
                        }
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
            var _a;
            let resourceId, pathname, inline, blob, preserveCrossOrigin;
            if (options) {
                ({ resourceId, preserveCrossOrigin } = options);
                const font = (_a = options.saveAs) === null || _a === void 0 ? void 0 : _a.font;
                if (font) {
                    ({ pathname, inline, blob } = font);
                }
            }
            const result = [];
            const assets = this.getResourceAssets(resourceId);
            if (assets) {
                for (const fonts of assets.fonts.values()) {
                    for (const { srcUrl, srcBase64, mimeType } of fonts) {
                        let data = null;
                        if (srcUrl) {
                            data = File.parseUri(srcUrl, preserveCrossOrigin);
                            if (data && inline) {
                                data.format = 'base64';
                            }
                        }
                        else if (srcBase64 && blob) {
                            const filename = assignFilename('', fromMimeType(mimeType));
                            data = File.parseUri(resolvePath(pathname ? appendSeparator(pathname, filename) : filename, location.href));
                            if (data) {
                                data.format = 'blob';
                                data.base64 = srcBase64;
                                delete data.watch;
                            }
                        }
                        if (this.processExtensions(data)) {
                            result.push(data);
                        }
                    }
                }
            }
            return result;
        }
        finalizeRequestBody(data, options) {
            data.database = options.database;
            data.baseUrl = options.baseUrl;
            data.unusedStyles = options.unusedStyles;
            data.templateMap = options.templateMap;
            if (data.document) {
                for (const name of data.document) {
                    const attr = name + 'Id';
                    document.querySelectorAll(`[data-${name}-id]`).forEach((element) => delete element.dataset[attr]);
                }
            }
        }
        getCopyQueryParameters(options) {
            return this.getArchiveQueryParameters(options) + (options.watch ? '&watch=1' : '');
        }
        getArchiveQueryParameters(options) {
            return options.productionRelease ? '&release=1' : '';
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
                let mimeType = '';
                switch (element.tagName) {
                    case 'VIDEO':
                    case 'AUDIO':
                        element.querySelectorAll('source, track').forEach((source) => resolveAssetSource(source, items));
                        break;
                    case 'OBJECT':
                    case 'EMBED':
                        mimeType = element.type;
                    case 'IFRAME': {
                        const iframe = element.tagName === 'IFRAME';
                        const file = element.dataset.chromeFile;
                        if (!iframe || startsWith(file, 'saveTo')) {
                            const src = element instanceof HTMLObjectElement ? element.data : element.src;
                            if (startsWith(mimeType, 'image/') || startsWith(parseMimeType(src), 'image/')) {
                                this.processImageUri(result, element, src, saveAsImage, preserveCrossOrigin, assetMap, mimeType);
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
                    if (file === 'ignore') {
                        continue;
                    }
                    const command = assetMap && assetMap.get(item);
                    let saveAs, saveTo, filename, compress, tasks, watch, attributes, cloudStorage, documentData, fromConfig;
                    if (command) {
                        ({ saveTo: saveAs, filename, compress, tasks, watch, attributes, cloudStorage, document: documentData } = command);
                        if (excludeAsset(result, command, item, documentData || this.userSettings.outputDocumentHandler)) {
                            continue;
                        }
                        [saveAs, saveTo] = checkSaveAs(uri, saveAs || command.pathname, filename || getFilename(uri));
                        if (saveAs) {
                            filename = '';
                        }
                        fromConfig = true;
                    }
                    else {
                        const fileAs = parseFileAs('saveAs', file);
                        if (fileAs) {
                            saveAs = fileAs.file;
                        }
                        const { chromeOptions, chromeTasks, chromeWatch } = item.dataset;
                        compress = parseOptions(chromeOptions).compress;
                        tasks = parseTask(chromeTasks);
                        watch = parseWatchInterval(chromeWatch);
                    }
                    const data = File.parseUri(uri, preserveCrossOrigin, { saveAs, saveTo, fromConfig });
                    if (this.processExtensions(data, documentData, compress, tasks, cloudStorage, attributes, item)) {
                        if (filename) {
                            data.filename = filename;
                        }
                        if (watch) {
                            data.watch = watch;
                        }
                        result.push(data);
                    }
                }
            });
            return result;
        }
        processAssets(options) {
            var _a;
            const { appendMap, preserveCrossOrigin } = options;
            const nodeMap = options.nodeMap || (options.nodeMap = new Map());
            const domAll = document.querySelectorAll('*');
            const cache = {};
            const assets = this.getHtmlPage(options).concat(this.getLinkAssets(options));
            if (options.saveAsWebPage) {
                for (const item of assets) {
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
            if (appendMap) {
                const tagCount = {};
                const getAppendData = (tagName, order, textContent, prepend) => {
                    if (!(tagName in tagCount)) {
                        tagCount[tagName] = document.querySelectorAll(tagName).length;
                    }
                    return { tagName, tagCount: tagCount[tagName], textContent, order, prepend };
                };
                for (const [element, siblings] of appendMap) {
                    const node = File.createTagNode(element, domAll, cache);
                    const command = (_a = options.assetMap) === null || _a === void 0 ? void 0 : _a.get(element);
                    const documentData = command && command.document || this.userSettings.outputDocumentHandler;
                    File.setDocumentId(node, element, documentData);
                    node.outerXml = element.outerHTML.trim();
                    let i = 0;
                    for (const sibling of siblings) {
                        const { type, attributes, preserve = preserveCrossOrigin } = sibling;
                        if (type) {
                            let js, url, prepend;
                            switch (type) {
                                case 'prepend/js':
                                    prepend = true;
                                case 'append/js':
                                    if (attributes) {
                                        url = attributes.src;
                                        attributes.type || (attributes.type = 'text/javascript');
                                        js = true;
                                    }
                                    break;
                                case 'prepend/css':
                                    prepend = true;
                                case 'append/css':
                                    if (attributes) {
                                        url = attributes.href;
                                        attributes.type || (attributes.type = 'text/css');
                                    }
                                    break;
                                default: {
                                    const data = getAppendData(splitPairEnd(type, '/', true, true).toLowerCase(), ++i, sibling.textContent);
                                    let elementData;
                                    if (type.startsWith('append/')) {
                                        elementData = getTagNode(node, attributes, data);
                                    }
                                    else if (type.startsWith('prepend/')) {
                                        data.prepend = true;
                                        elementData = getTagNode(node, attributes, data);
                                    }
                                    if (elementData) {
                                        assets.push({ pathname: '', filename: '', document: documentData, element: elementData });
                                    }
                                    continue;
                                }
                            }
                            if (url && attributes) {
                                const data = this.createBundle(assets, element, url, attributes.type, undefined, undefined, undefined, sibling);
                                if (data) {
                                    if (preserve) {
                                        delete data.uri;
                                    }
                                    data.element = getTagNode(node, attributes, getAppendData(js ? 'script' : 'link', ++i, undefined, prepend));
                                }
                            }
                        }
                    }
                }
            }
            if (options.assets) {
                assets.push(...options.assets);
            }
            for (const asset of assets) {
                const element = asset.element;
                if (element instanceof Element) {
                    const node = File.createTagNode(element, domAll, cache);
                    File.setDocumentId(node, element, asset.document);
                    asset.element = node;
                    nodeMap.set(node, element);
                }
            }
            for (const [node, element] of nodeMap) {
                if (element.tagName === 'HTML') {
                    node.innerXml = element.innerHTML;
                }
                else {
                    node.outerXml = element.outerHTML.trim();
                }
            }
            options.assets = assets;
            options.baseUrl = location.href;
            if (templateMap) {
                options.templateMap = templateMap;
            }
            delete options.assetMap;
            delete options.indexMap;
            delete options.nodeMap;
            delete options.appendMap;
            return options;
        }
        createBundle(assets, element, src, mimeType, preserveCrossOrigin, bundleIndex, assetMap, assetCommand, saveAsOptions, saveAsCondtion = true) {
            let file = !assetCommand ? element.dataset.chromeFile : '';
            if (file === 'exclude' || file === 'ignore') {
                return;
            }
            let filename, format, preserve, inline, process, compress, tasks, watch, attributes, cloudStorage, documentData, fromConfig, fromSaveAs;
            const command = assetMap && assetMap.get(element) || assetCommand;
            if (command) {
                let filenameAs;
                ({ filename: filenameAs, preserve, inline, process, compress, tasks, watch, attributes, cloudStorage, document: documentData } = command);
                if (excludeAsset(assets, command, element, documentData || this.userSettings.outputDocumentHandler)) {
                    return;
                }
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
            else {
                if (saveAsCondtion && saveAsOptions) {
                    ({ preserve, inline, process, compress, tasks, watch, attributes, cloudStorage, document: documentData } = saveAsOptions);
                    if (excludeAsset(assets, saveAsOptions, element, documentData || this.userSettings.outputDocumentHandler)) {
                        return;
                    }
                    filename = saveAsOptions.filename;
                    if (src) {
                        if (file = filename && getCustomPath(src, saveAsOptions.pathname, filename)) {
                            filename = '';
                        }
                    }
                    else if (filename) {
                        file = './' + filename;
                        filename = '';
                        fromSaveAs = true;
                    }
                }
                const { chromeOptions, chromeTasks, chromeWatch } = element.dataset;
                const options = parseOptions(chromeOptions);
                inline !== null && inline !== void 0 ? inline : (inline = options.inline);
                compress !== null && compress !== void 0 ? compress : (compress = options.compress);
                preserve !== null && preserve !== void 0 ? preserve : (preserve = options.preserve);
                tasks || (tasks = parseTask(chromeTasks));
                watch || (watch = parseWatchInterval(chromeWatch));
            }
            if (process) {
                format = process.join('+');
            }
            let data = null;
            if (src) {
                data = File.parseUri(resolvePath(src), preserveCrossOrigin, { saveAs: file, mimeType, format, fromConfig });
                if (data) {
                    if (assetCommand) {
                        if (inline) {
                            switch (assetCommand.type) {
                                case 'append/js':
                                    data.inlineContent = 'script';
                                    break;
                                case 'append/css':
                                    data.inlineContent = 'style';
                                    break;
                            }
                        }
                    }
                    else {
                        if (inline) {
                            data.inlineContent = getContentType(element);
                        }
                        if (checkBundleStart(assets, data)) {
                            data.bundleIndex = -1;
                        }
                    }
                }
            }
            else if (file) {
                if (!fromConfig && !fromSaveAs) {
                    const exportAs = parseFileAs('exportAs', file);
                    if (exportAs) {
                        ({ file, format } = exportAs);
                    }
                }
                if (data = createBundleAsset(assets, element, file, mimeType, format, this.userSettings.outputDocumentHandler, preserve, inline)) {
                    data.bundleIndex = -1;
                }
            }
            if (this.processExtensions(data, documentData, compress, tasks, cloudStorage, attributes, !assetCommand ? element : undefined)) {
                if (filename) {
                    data.filename = filename;
                }
                if (preserve) {
                    data.preserve = true;
                }
                if (watch) {
                    data.watch = watch;
                }
                if (bundleIndex) {
                    setBundleData(bundleIndex, data);
                }
                assets.push(data);
                return data;
            }
        }
        processImageUri(assets, element, uri, saveAsImage, preserveCrossOrigin, assetMap, mimeType, base64, srcSet) {
            if (uri) {
                let saveAs, saveTo, pathname, filename, blob, inline, compress, commands, tasks, watch, attributes, cloudStorage, documentData, fromConfig;
                if (element) {
                    const file = element.dataset.chromeFile;
                    if (file === 'ignore') {
                        return;
                    }
                    const command = assetMap && assetMap.get(element);
                    if (command) {
                        ({ saveTo: saveAs, pathname, filename, commands, inline, blob, compress, tasks, watch, attributes, cloudStorage, document: documentData } = command);
                        if (excludeAsset(assets, command, element, documentData || this.userSettings.outputDocumentHandler)) {
                            return;
                        }
                        [saveAs, saveTo] = checkSaveAs(uri, saveAs || pathname, filename || getFilename(uri));
                        if (saveAs) {
                            filename = '';
                        }
                        fromConfig = true;
                    }
                    else {
                        if (saveAsImage) {
                            ({ pathname, commands, inline, blob, compress, tasks, watch, attributes, cloudStorage, document: documentData } = saveAsImage);
                            if (excludeAsset(assets, saveAsImage, element, documentData || this.userSettings.outputDocumentHandler)) {
                                return;
                            }
                            [saveAs, saveTo] = checkSaveAs(uri, pathname, getFilename(uri));
                        }
                        if (file && !pathname) {
                            let fileAs = parseFileAs('saveTo', file);
                            if (fileAs) {
                                [saveAs, saveTo] = checkSaveAs(uri, fileAs.file, getFilename(uri));
                            }
                            else if (fileAs = parseFileAs('saveAs', file)) {
                                saveAs = fileAs.file;
                            }
                        }
                        const { chromeCommands, chromeOptions, chromeTasks, chromeWatch } = element.dataset;
                        if (!commands && chromeCommands) {
                            commands = replaceMap(chromeCommands.split('::'), value => value.trim());
                        }
                        const options = parseOptions(chromeOptions);
                        inline !== null && inline !== void 0 ? inline : (inline = options.inline);
                        compress !== null && compress !== void 0 ? compress : (compress = options.compress);
                        blob !== null && blob !== void 0 ? blob : (blob = options.blob);
                        tasks || (tasks = parseTask(chromeTasks));
                        watch || (watch = parseWatchInterval(chromeWatch));
                    }
                }
                else if (saveAsImage) {
                    ({ pathname, commands, inline, blob, compress, tasks, cloudStorage } = saveAsImage);
                    [saveAs, saveTo] = checkSaveAs(uri, pathname, getFilename(uri));
                }
                if (base64 && !blob) {
                    return;
                }
                const data = File.parseUri(uri, preserveCrossOrigin, { saveAs, saveTo, mimeType, fromConfig });
                if (this.processExtensions(data, documentData, compress, tasks, cloudStorage, attributes, element)) {
                    if (filename) {
                        data.filename = filename;
                    }
                    if (commands && commands.length && commands[0] !== '~') {
                        data.commands = commands;
                    }
                    if (watch) {
                        data.watch = watch;
                    }
                    if (base64) {
                        data.format = 'blob';
                        data.base64 = base64;
                        delete data.watch;
                    }
                    else if (srcSet) {
                        data.format = 'srcset';
                    }
                    else if (inline) {
                        data.format = 'base64';
                    }
                    assets.push(data);
                    return data;
                }
            }
        }
        getResourceAssets(resourceId) {
            if (resourceId !== undefined && resourceId !== -1) {
                return Resource.ASSETS[resourceId];
            }
        }
        processExtensions(data, document, compress, tasks, cloudStorage, attributes, element) {
            if (data) {
                data.document = document || copyDocument(this.userSettings.outputDocumentHandler);
                if (compress) {
                    data.compress = compress;
                }
                if (tasks) {
                    data.tasks = tasks;
                }
                if (attributes) {
                    data.attributes = attributes;
                }
                if (cloudStorage) {
                    data.cloudStorage = cloudStorage;
                }
                if (element) {
                    data.element = element;
                }
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

    const { UNABLE_TO_FINALIZE_DOCUMENT, reject } = squared.lib.error;
    const { isPlainObject } = squared.lib.util;
    class Application extends squared.base.Application {
        constructor() {
            super(...arguments);
            this.extensions = [];
            this.systemName = 'chrome';
        }
        insertNode(processing, element) {
            if (element.nodeName[0] === '#') {
                if (this.userSettings.excludePlainText) {
                    return;
                }
                this.controllerHandler.applyDefaultStyles(processing, element);
            }
            return this.createNodeStatic(processing, element);
        }
        saveAs(filename, options) {
            return this.processAssets('saveAs', filename, options);
        }
        copyTo(pathname, options) {
            return this.processAssets('copyTo', pathname, options);
        }
        appendTo(target, options) {
            return this.processAssets('appendTo', target, options);
        }
        async processAssets(module, pathname, options) {
            const result = await this.parseDocument();
            if (!result) {
                return reject(UNABLE_TO_FINALIZE_DOCUMENT);
            }
            const { resourceId, unusedStyles } = this.getProcessing(result.sessionId);
            const database = [];
            const assetMap = new Map();
            const nodeMap = new Map();
            const appendMap = new Map();
            options = Object.assign(Object.assign({}, options), { saveAsWebPage: true, resourceId, assetMap, nodeMap, appendMap });
            if (unusedStyles) {
                const { removeUnusedClasses, removeUnusedSelectors, retainUsedStyles = [] } = options;
                if (removeUnusedClasses || removeUnusedSelectors) {
                    options.unusedStyles = Array.from(unusedStyles).filter(value => (value.includes(':') ? removeUnusedSelectors : removeUnusedClasses) && !retainUsedStyles.includes(value));
                }
            }
            if (options.configUri) {
                const config = await this.fileHandler.loadData(options.configUri, { type: 'json', cache: options.cache });
                if (config) {
                    if (config.success && Array.isArray(config.data)) {
                        const documentHandler = this.userSettings.outputDocumentHandler;
                        const paramMap = new Map();
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
                        if (location.href.includes('?')) {
                            new URLSearchParams(location.search).forEach((value, key) => paramMap.set(key, [new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), value]));
                        }
                        for (const item of config.data) {
                            if (item.selector) {
                                const cloudDatabase = isPlainObject(item.cloudDatabase) && item.cloudDatabase;
                                if (cloudDatabase && paramMap.size) {
                                    for (const attr in cloudDatabase) {
                                        if (attr !== 'value') {
                                            cloudDatabase[attr] = replaceParams(cloudDatabase[attr]);
                                        }
                                    }
                                }
                                document.querySelectorAll(item.selector).forEach((element) => {
                                    const type = item.type;
                                    switch (type) {
                                        case 'text':
                                        case 'attribute':
                                            if (cloudDatabase) {
                                                database.push([element, Object.assign({ document: item.document || documentHandler }, cloudDatabase)]);
                                            }
                                            break;
                                        default:
                                            if (type && (type.startsWith('append/') || type.startsWith('prepend/'))) {
                                                const items = appendMap.get(element) || [];
                                                items.push(Object.assign({}, item));
                                                appendMap.set(element, items);
                                            }
                                            else {
                                                assetMap.set(element, Object.assign({}, item));
                                            }
                                            break;
                                    }
                                });
                            }
                        }
                    }
                    else {
                        const error = config.error;
                        if (error) {
                            this.writeError(error.message, error.hint);
                        }
                    }
                }
            }
            if (assetMap.size === 0) {
                delete options.assetMap;
            }
            if (appendMap.size === 0) {
                delete options.appendMap;
            }
            if (database.length) {
                const domAll = document.querySelectorAll('*');
                const cache = {};
                const items = options.database || (options.database = []);
                for (let i = 0, length = database.length; i < length; ++i) {
                    const [element, data] = database[i];
                    const node = File.createTagNode(element, domAll, cache);
                    data.element = node;
                    File.setDocumentId(node, element, data.document);
                    nodeMap.set(node, element);
                    items.push(data);
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

    class Extension extends squared.base.Extension {
        processFile(data) {
            return true;
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
        pierceShadowRoot: true,
        showErrorMessages: false,
        outputDocumentHandler: 'chrome',
        outputEmptyCopyDirectory: false,
        outputTasks: {},
        outputWatch: {},
        outputArchiveName: 'chrome-data',
        outputArchiveFormat: 'zip',
        outputArchiveCache: false
    };

    const { DIRECTORY_NOT_PROVIDED, FRAMEWORK_NOT_INSTALLED, reject: reject$1 } = squared.lib.error;
    const { isString, isPlainObject: isPlainObject$1 } = squared.lib.util;
    let application = null;
    let file = null;
    function createAssetsOptions(assets, options, filename) {
        if (isPlainObject$1(options)) {
            if (options.assets) {
                assets.push(...options.assets);
            }
        }
        else {
            options = {};
        }
        return Object.assign(options, { assets, filename });
    }
    const checkFileName = (value, type) => value || `${application.userSettings.outputArchiveName}-${type}`;
    const appBase = {
        base: {
            Application,
            Extension,
            File
        },
        lib: {},
        extensions: {},
        system: {
            copyHtmlPage(pathname, options) {
                if (isString(pathname)) {
                    return file ? file.copying(pathname, createAssetsOptions(file.getHtmlPage(options), options)) : reject$1(FRAMEWORK_NOT_INSTALLED);
                }
                return reject$1(DIRECTORY_NOT_PROVIDED);
            },
            copyScriptAssets(pathname, options) {
                if (isString(pathname)) {
                    return file ? file.copying(pathname, createAssetsOptions(file.getScriptAssets(options)[0], options)) : reject$1(FRAMEWORK_NOT_INSTALLED);
                }
                return reject$1(DIRECTORY_NOT_PROVIDED);
            },
            copyLinkAssets(pathname, options) {
                if (isString(pathname)) {
                    return file ? file.copying(pathname, createAssetsOptions(file.getLinkAssets(options), options)) : reject$1(FRAMEWORK_NOT_INSTALLED);
                }
                return reject$1(DIRECTORY_NOT_PROVIDED);
            },
            copyImageAssets(pathname, options) {
                if (isString(pathname)) {
                    return file ? file.copying(pathname, createAssetsOptions(file.getImageAssets(options), options)) : reject$1(FRAMEWORK_NOT_INSTALLED);
                }
                return reject$1(DIRECTORY_NOT_PROVIDED);
            },
            copyVideoAssets(pathname, options) {
                if (isString(pathname)) {
                    return file ? file.copying(pathname, createAssetsOptions(file.getVideoAssets(options), options)) : reject$1(FRAMEWORK_NOT_INSTALLED);
                }
                return reject$1(DIRECTORY_NOT_PROVIDED);
            },
            copyAudioAssets(pathname, options) {
                if (isString(pathname)) {
                    return file ? file.copying(pathname, createAssetsOptions(file.getAudioAssets(options), options)) : reject$1(FRAMEWORK_NOT_INSTALLED);
                }
                return reject$1(DIRECTORY_NOT_PROVIDED);
            },
            copyFontAssets(pathname, options) {
                if (isString(pathname)) {
                    return file ? file.copying(pathname, createAssetsOptions(file.getFontAssets(options), options)) : reject$1(FRAMEWORK_NOT_INSTALLED);
                }
                return reject$1(DIRECTORY_NOT_PROVIDED);
            },
            saveHtmlPage(filename, options) {
                return file ? file.archiving('', createAssetsOptions(file.getHtmlPage(options), options, checkFileName(filename, 'html'))) : reject$1(FRAMEWORK_NOT_INSTALLED);
            },
            saveScriptAssets(filename, options) {
                return file ? file.archiving('', createAssetsOptions(file.getScriptAssets(options)[0], options, checkFileName(filename, 'script'))) : reject$1(FRAMEWORK_NOT_INSTALLED);
            },
            saveLinkAssets(filename, options) {
                return file ? file.archiving('', createAssetsOptions(file.getLinkAssets(options), options, checkFileName(filename, 'link'))) : reject$1(FRAMEWORK_NOT_INSTALLED);
            },
            saveImageAssets(filename, options) {
                return file ? file.archiving('', createAssetsOptions(file.getImageAssets(options), options, checkFileName(filename, 'image'))) : reject$1(FRAMEWORK_NOT_INSTALLED);
            },
            saveVideoAssets(filename, options) {
                return file ? file.archiving('', createAssetsOptions(file.getVideoAssets(options), options, checkFileName(filename, 'video'))) : reject$1(FRAMEWORK_NOT_INSTALLED);
            },
            saveAudioAssets(filename, options) {
                return file ? file.archiving('', createAssetsOptions(file.getAudioAssets(options), options, checkFileName(filename, 'audio'))) : reject$1(FRAMEWORK_NOT_INSTALLED);
            },
            saveFontAssets(filename, options) {
                return file ? file.archiving('', createAssetsOptions(file.getFontAssets(options), options, checkFileName(filename, 'font'))) : reject$1(FRAMEWORK_NOT_INSTALLED);
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
