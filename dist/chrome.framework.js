/* chrome-framework 2.5.3
   https://github.com/anpham6/squared */

var chrome = (function () {
    'use strict';

    var Resource = squared.base.Resource;
    var Pattern = squared.lib.base.Pattern;
    const { createElement } = squared.lib.dom;
    const { convertWord, endsWith, fromLastIndexOf, isPlainObject: isPlainObject$2, resolvePath, splitPair, splitPairEnd, splitPairStart, startsWith, trimEnd } = squared.lib.util;
    const { appendSeparator, fromMimeType, parseMimeType, parseTask, parseWatchInterval, randomUUID } = squared.base.lib.util;
    const RE_SRCSET = new Pattern(/\s*(.+?\.[^\s,]+)(\s+[\d.]+[wx])?\s*,?/g);
    const FILENAME_MAP = new WeakMap();
    let BUNDLE_ID = 0;
    function parseFileAs(attr, value) {
        if (value) {
            const match = new RegExp(`^\\s*${attr}\\s*:(.+)$`).exec(value);
            if (match) {
                const segments = match[1].split('::').map(item => item.trim());
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
            return {
                inline: value.includes('inline'),
                compress,
                download: value.includes('crossorigin') ? false : undefined,
                preserve: value.includes('preserve'),
                blob: value.includes('blob')
            };
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
    function createBundleAsset(assets, element, file, mimeType, format, preserve, inline, document) {
        const content = element.innerHTML;
        if (content.trim()) {
            const [moveTo, pathname, filename] = getFilePath(file);
            const data = {
                uri: location.href,
                pathname,
                filename,
                moveTo,
                content,
                mimeType,
                format,
                preserve,
                document
            };
            if (inline) {
                data.inlineContent = getContentType(element);
            }
            const previous = assets[assets.length - 1];
            if (previous && hasSamePath(previous, data, true)) {
                (previous.trailingContent || (previous.trailingContent = [])).push(content);
                excludeAsset(assets, { exclude: true }, element, document);
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
        if (uri) {
            (bundles[uri] || (bundles[uri] = [])).push(data);
        }
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
        return !!command.ignore;
    }
    function checkSaveAs(uri, pathname, filename) {
        const value = getCustomPath(uri, pathname, filename || uri && assignFilename(uri));
        if (value) {
            return [value, false];
        }
        else if (pathname && pathname !== '~') {
            return [pathname, true];
        }
        return ['', false];
    }
    function getCustomPath(uri, pathname, filename) {
        if (pathname === '~') {
            pathname = '';
        }
        if (uri && !pathname) {
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
        return pathname && filename ? appendSeparator(pathname, filename) : '';
    }
    function setUUID(node, element, name) {
        var _a, _b;
        const id = (_a = element.dataset)[_b = name + 'Id'] || (_a[_b] = randomUUID());
        (node.id || (node.id = {}))[name] = id;
    }
    const assignFilename = (value, ext) => "__assign__" /* ASSIGN */ + '.' + (ext || value && getFileExt(value) || 'unknown');
    const isCrossOrigin = (download, preserveCrossOrigin) => typeof download === 'boolean' ? !download : !!preserveCrossOrigin;
    const getContentType = (element) => element.tagName === 'LINK' ? 'style' : element.tagName.toLowerCase();
    const getTagNode = (node, attributes, append) => (Object.assign(Object.assign({}, node), { attributes, append }));
    const getFilename = (value) => value.split('?')[0].split('/').pop();
    const hasSamePath = (item, other, bundle) => item.pathname === other.pathname && (item.filename === other.filename || FILENAME_MAP.get(item) === other.filename || bundle && startsWith(item.filename, "__assign__" /* ASSIGN */)) && (item.moveTo || '') === (other.moveTo || '');
    const getMimeType = (element, src, fallback = '') => element.type.trim().toLowerCase() || src && parseMimeType(src) || fallback;
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
            return { index, tagName, tagIndex, tagCount, ignoreCase: true };
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
            mimeType || (mimeType = parseMimeType(uri));
            let value = trimEnd(uri, '/'), file;
            const local = startsWith(value, location.origin);
            if (!local && preserveCrossOrigin) {
                return {
                    pathname: '',
                    filename: '',
                    mimeType,
                    format: 'crossorigin'
                };
            }
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
                    value = resolvePath(file);
                }
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
                    mimeType,
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
            const command = (assetMap === null || assetMap === void 0 ? void 0 : assetMap.get(element)) || saveAsHtml;
            let filename, format, compress, process, tasks, attributes, cloudStorage, documentData;
            if (command) {
                if (command.ignore || command.exclude) {
                    return [];
                }
                ({ filename, compress, process, tasks, attributes, cloudStorage, document: documentData } = command);
            }
            else {
                const { chromeOptions, chromeTasks } = element.dataset;
                compress = parseOptions(chromeOptions).compress;
                tasks = parseTask(chromeTasks);
            }
            if (filename) {
                file = '';
            }
            if (process) {
                format = process.join('+');
            }
            const data = File.parseUri(location.href, false, { saveAs: file, format, mimeType: 'text/html' });
            if (this.processExtensions(data, documentData, compress, tasks, cloudStorage, attributes, element)) {
                if (filename) {
                    data.filename = filename;
                }
                else if (!data.filename) {
                    const value = getFilename(location.href);
                    data.filename = /\.html?$/i.exec(value) ? value : 'index.html';
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
                                if (module && identifier && value && (value = value.trim()) && value.includes('function')) {
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
                    const command = assetMap === null || assetMap === void 0 ? void 0 : assetMap.get(element);
                    let category, module, identifier;
                    if (command) {
                        category = command.type;
                        if (command.template) {
                            ({ module, identifier } = command.template);
                        }
                        excludeAsset(result, command, element);
                    }
                    else if (template) {
                        [category, module, identifier] = template.split('::').map((value, index) => (index === 0 ? value.toLowerCase() : value).trim());
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
                let mimeType = '', href;
                if (element instanceof HTMLLinkElement) {
                    if (href = element.href) {
                        const rel = element.rel.trim().toLowerCase();
                        const checkMimeType = () => {
                            const filename = fromLastIndexOf(href, '/');
                            if (filename.includes('.')) {
                                mimeType = getMimeType(element, filename);
                                return true;
                            }
                            return false;
                        };
                        switch (rel) {
                            case 'stylesheet':
                                mimeType = 'text/css';
                                break;
                            case 'alternate':
                            case 'help':
                            case 'license':
                            case 'manifest':
                            case 'modulepreload':
                            case 'prefetch':
                            case 'preload':
                            case 'prerender':
                                if (!checkMimeType()) {
                                    return;
                                }
                                break;
                            default:
                                if (!rel.includes('icon') || !checkMimeType()) {
                                    return;
                                }
                                break;
                        }
                    }
                    else {
                        return;
                    }
                }
                else {
                    mimeType = 'text/css';
                }
                this.createBundle(result, element, href, mimeType, preserveCrossOrigin, bundleIndex, assetMap, undefined, saveAsLink, mimeType === 'text/css' || element instanceof HTMLStyleElement);
            });
            const assets = this.getResourceAssets(resourceId);
            if (assets) {
                for (const [uri, item] of assets.rawData) {
                    if (item.mimeType === 'text/css') {
                        let saveAs, filename, compress, download, preserve, process, tasks, cloudStorage, documentData;
                        if (saveAsLink) {
                            let command = saveAsLink;
                            if (saveAsLink.customize) {
                                command = Object.assign({}, command);
                                filename = saveAsLink.customize.call(null, uri, 'text/css', command);
                                if (command.pathname && filename) {
                                    saveAs = appendSeparator(command.pathname, filename);
                                }
                            }
                            ({ compress, download, preserve, process, tasks, cloudStorage, document: documentData } = command);
                        }
                        const data = File.parseUri(resolvePath(uri), isCrossOrigin(download, preserveCrossOrigin), { saveAs, format: process ? process.join('+') : '' });
                        if (this.processExtensions(data, documentData, compress, tasks, cloudStorage)) {
                            if (filename) {
                                data.filename = filename;
                            }
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
                    if (base64 = image.base64) {
                        mimeType = image.mimeType;
                        src = resolvePath(assignFilename('', mimeType && fromMimeType(mimeType)));
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
                    else {
                        this.processImageUri(result, null, uri, saveAsImage, preserveCrossOrigin);
                    }
                }
                for (const item of assets.rawData.values()) {
                    const { base64, content, mimeType = parseMimeType(item.filename) } = item;
                    if (base64) {
                        if (saveAsImage === null || saveAsImage === void 0 ? void 0 : saveAsImage.blob) {
                            let command = saveAsImage, filename, commands;
                            if (saveAsImage.customize) {
                                command = Object.assign({}, command);
                                filename = saveAsImage.customize.call(null, '', mimeType, command);
                            }
                            const pathname = command.pathname;
                            filename || (filename = item.filename);
                            if (startsWith(mimeType, 'image/') && (commands = command.commands)) {
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
                            const data = this.processImageUri(result, null, resolvePath(pathname ? appendSeparator(pathname, filename) : filename), command, false, undefined, mimeType, base64);
                            if (data) {
                                if (endsWith(data.filename, '.unknown')) {
                                    data.mimeType = 'image/unknown';
                                }
                                if (commands && commands.length) {
                                    data.commands = commands;
                                }
                                else {
                                    delete data.commands;
                                }
                                if (!pathname) {
                                    delete data.uri;
                                }
                            }
                        }
                    }
                    else if (content && mimeType) {
                        const data = {
                            pathname: "__generated__" /* GENERATED */ + `/${mimeType.split('/').pop()}`,
                            filename: assignFilename(item.filename),
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
            let resourceId, preserveCrossOrigin, saveAsFont;
            if (options) {
                ({ resourceId, preserveCrossOrigin } = options);
                saveAsFont = (_a = options.saveAs) === null || _a === void 0 ? void 0 : _a.font;
            }
            const result = [];
            const assets = this.getResourceAssets(resourceId);
            if (assets) {
                for (const fonts of assets.fonts.values()) {
                    for (const { srcUrl, srcBase64, mimeType } of fonts) {
                        let pathname, filename, inline, blob;
                        if (saveAsFont) {
                            let command = saveAsFont;
                            if (saveAsFont.customize) {
                                command = Object.assign({}, command);
                                filename = saveAsFont.customize.call(null, srcUrl || '', mimeType, command);
                            }
                            ({ pathname, inline, blob } = command);
                        }
                        let data = null;
                        if (srcUrl) {
                            if ((data = File.parseUri(srcUrl, inline === true ? false : preserveCrossOrigin)) && inline) {
                                data.format = 'base64';
                            }
                        }
                        else if (srcBase64 && blob) {
                            filename || (filename = assignFilename('', fromMimeType(mimeType)));
                            if (data = File.parseUri(resolvePath(pathname ? appendSeparator(pathname, filename) : filename))) {
                                data.format = 'blob';
                                data.base64 = srcBase64;
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
            var _a;
            const productionRelease = options.productionRelease;
            data.baseUrl = options.baseUrl;
            data.dataSource = options.dataSource;
            data.templateMap = options.templateMap;
            data.unusedStyles = options.unusedStyles;
            data.productionRelease = productionRelease;
            let watchElement;
            if (!productionRelease && options.watch) {
                const socketMap = {};
                const hostname = new URL(this.hostname).hostname;
                for (const { watch } of options.assets) {
                    if (isPlainObject$2(watch) && watch.reload) {
                        const reload = watch.reload;
                        const { socketId: id, handler = {}, secure } = reload;
                        const port = reload.port || (secure ? this.userSettings.webSocketSecurePort : this.userSettings.webSocketPort);
                        socketMap[_a = id + '_' + port + (secure ? '_0' : '_1')] || (socketMap[_a] = 'socket=new WebSocket("' + (secure ? 'wss' : 'ws') + `://${hostname}:${port}");` +
                            (handler.open ? `socket.onopen=${handler.open};` : '') +
                            'socket.onmessage=' + (handler.message || `function(e){var c=JSON.parse(e.data);if(c&&c.socketId==="${id}"&&c.module==="watch"&&c.action==="modified"){if(!c.errors||!c.errors.length){if(c.hot){if(c.type==="text/css"){var a=document.querySelectorAll('link[href^="'+c.src+'"]');if(a.length){a.forEach(b=>b.href=c.src+c.hot);return;}}else if(c.type.startsWith("image/")){var a=document.querySelectorAll('img[src^="'+c.src+'"]');if(a.length){a.forEach(b=>b.src=c.src+c.hot);return;}}}window.location.reload();}else{console.log("FAIL: "+c.errors.length+" errors\\n\\n"+c.errors.join("\\n"));}}}`) + ';' +
                            (handler.error ? `socket.onerror=${handler.error};` : '') +
                            (handler.close ? `socket.onclose=${handler.close};` : ''));
                        delete reload.handler;
                    }
                }
                if (Object.keys(socketMap).length) {
                    let textContent = 'document.addEventListener("DOMContentLoaded", function(){var socket;';
                    for (const id in socketMap) {
                        textContent += socketMap[id];
                    }
                    textContent += '});';
                    if (!options.useOriginalHtmlPage) {
                        watchElement = createElement('script', { parent: document.body, attributes: { textContent } });
                    }
                    else {
                        const html = options.assets.find(item => item.mimeType === '@text/html');
                        if (html) {
                            html.element.textContent = `<script>${textContent}</script>`;
                        }
                    }
                }
            }
            if (!options.useOriginalHtmlPage) {
                for (const item of options.assets) {
                    const element = item.element;
                    if (element) {
                        switch (element.tagName) {
                            case 'html':
                                element.innerXml = document.documentElement.innerHTML;
                                break;
                            case 'script':
                                if (watchElement) {
                                    ++element.tagCount;
                                }
                                break;
                        }
                        if (watchElement) {
                            const append = element.append;
                            if ((append === null || append === void 0 ? void 0 : append.tagName) === 'script') {
                                ++append.tagCount;
                            }
                        }
                    }
                    if (productionRelease && item.watch) {
                        delete item.watch;
                    }
                }
                if (watchElement) {
                    document.body.removeChild(watchElement);
                }
                if (data.document) {
                    for (const name of data.document) {
                        const attr = name + 'Id';
                        document.querySelectorAll(`[data-${name}-id]`).forEach((element) => delete element.dataset[attr]);
                    }
                }
                if (options.removeInlineStyles) {
                    document.querySelectorAll(`[style]`).forEach(element => element.removeAttribute('style'));
                }
            }
        }
        getCopyQueryParameters(options) {
            return options.watch && !options.productionRelease ? '&watch=1' : '';
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
                    case 'IFRAME':
                        if (!(assetMap === null || assetMap === void 0 ? void 0 : assetMap.get(element)) && !startsWith(element.dataset.chromeFile, 'saveTo')) {
                            return;
                        }
                    case 'OBJECT':
                    case 'EMBED': {
                        const src = element instanceof HTMLObjectElement ? element.data : element.src;
                        mimeType = element.type || parseMimeType(src);
                        if (startsWith(mimeType, 'image/')) {
                            this.processImageUri(result, element, src, saveAsImage, preserveCrossOrigin, assetMap, mimeType);
                            return;
                        }
                        break;
                    }
                }
                resolveAssetSource(element, items);
                for (const [item, uri] of items) {
                    const file = item.dataset.chromeFile;
                    if (file === 'ignore') {
                        continue;
                    }
                    const command = assetMap === null || assetMap === void 0 ? void 0 : assetMap.get(item);
                    let saveAs, saveTo, filename, compress, download, tasks, watch, attributes, cloudStorage, documentData, fromConfig;
                    if (command) {
                        ({ filename, compress, download, tasks, watch, attributes, cloudStorage, document: documentData } = command);
                        if (excludeAsset(result, command, item, documentData)) {
                            continue;
                        }
                        [saveAs, saveTo] = checkSaveAs(uri, command.saveTo || command.pathname, filename || getFilename(uri));
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
                        ({ compress, download } = parseOptions(chromeOptions));
                        tasks = parseTask(chromeTasks);
                        watch = parseWatchInterval(chromeWatch);
                    }
                    const data = File.parseUri(uri, isCrossOrigin(download, preserveCrossOrigin), { saveAs, saveTo, fromConfig });
                    if (this.processExtensions(data, documentData, compress, tasks, cloudStorage, attributes, item, watch)) {
                        if (filename) {
                            data.filename = filename;
                        }
                        result.push(data);
                    }
                }
            });
            return result;
        }
        processAssets(options) {
            const { assetMap, appendMap, useOriginalHtmlPage, preserveCrossOrigin } = options;
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
                    const command = assetMap === null || assetMap === void 0 ? void 0 : assetMap.get(element);
                    const documentData = command === null || command === void 0 ? void 0 : command.document;
                    const getNextSibling = () => node.index + element.querySelectorAll('*').length + 1;
                    if (!useOriginalHtmlPage) {
                        File.setDocumentId(node, element, documentData);
                    }
                    node.outerXml = element.outerHTML.trim();
                    let i = 0;
                    for (const sibling of siblings) {
                        const { type, attributes, download, textContent } = sibling;
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
                                    let elementData;
                                    if (type === 'replace') {
                                        if (textContent) {
                                            elementData = getTagNode(node, attributes);
                                            elementData.textContent = textContent;
                                        }
                                    }
                                    else {
                                        const append = getAppendData(splitPairEnd(type, '/', true, true).toLowerCase(), ++i, textContent);
                                        if (type.startsWith('append/')) {
                                            append.nextSibling = getNextSibling();
                                            elementData = getTagNode(node, attributes, append);
                                        }
                                        else if (type.startsWith('prepend/')) {
                                            append.prepend = true;
                                            elementData = getTagNode(node, attributes, append);
                                        }
                                    }
                                    if (elementData) {
                                        assets.push({ pathname: '', filename: '', document: documentData, element: elementData });
                                    }
                                    continue;
                                }
                            }
                            if (url && attributes) {
                                sibling.document || (sibling.document = documentData);
                                delete sibling.download;
                                const data = this.createBundle(assets, element, url, attributes.type, undefined, undefined, undefined, sibling);
                                if (data) {
                                    if (isCrossOrigin(download, preserveCrossOrigin)) {
                                        delete data.uri;
                                    }
                                    const append = getAppendData(js ? 'script' : 'link', ++i, undefined, prepend);
                                    if (!prepend) {
                                        append.nextSibling = getNextSibling();
                                    }
                                    data.element = getTagNode(node, attributes, append);
                                }
                            }
                        }
                    }
                }
            }
            const documentHandler = this.userSettings.outputDocumentHandler;
            for (const item of assets) {
                const element = item.element;
                if (element instanceof Element) {
                    const node = File.createTagNode(element, domAll, cache);
                    if (!useOriginalHtmlPage) {
                        File.setDocumentId(node, element, item.document);
                    }
                    item.element = node;
                    nodeMap.set(node, element);
                }
                item.document || (item.document = documentHandler);
            }
            for (const [node, element] of nodeMap) {
                if (element !== document.documentElement) {
                    node.outerXml = element.outerHTML.trim();
                }
            }
            if (options.assets) {
                assets.push(...options.assets);
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
            let command = (assetMap === null || assetMap === void 0 ? void 0 : assetMap.get(element)) || assetCommand, filename, format, inline, process, compress, download, preserve, tasks, watch, attributes, cloudStorage, documentData, fromConfig, fromSaveAs;
            if (command) {
                ({ inline, compress, download, preserve, process, tasks, watch, attributes, cloudStorage, document: documentData } = command);
                if (excludeAsset(assets, command, element, documentData)) {
                    return;
                }
                file = src ? command.saveAs : command.exportAs;
                if (!file && command.filename && (!command.pathname || !(file = checkSaveAs(src, command.pathname, command.filename)[0]))) {
                    filename = command.filename;
                }
                fromConfig = true;
            }
            else {
                if (saveAsCondtion && saveAsOptions) {
                    command = saveAsOptions;
                    if (saveAsOptions.customize) {
                        command = Object.assign({}, command);
                        filename = saveAsOptions.customize.call(null, src || '', mimeType, command);
                    }
                    ({ preserve, inline, compress, download, process, tasks, watch, attributes, cloudStorage, document: documentData } = command);
                    if (excludeAsset(assets, saveAsOptions, element, documentData)) {
                        return;
                    }
                    if (filename || (filename = command.filename)) {
                        if (src) {
                            if (file = getCustomPath(src, command.pathname, filename)) {
                                filename = '';
                            }
                        }
                        else {
                            file = './' + filename;
                            filename = '';
                            fromSaveAs = true;
                        }
                    }
                }
                const { chromeOptions, chromeTasks, chromeWatch } = element.dataset;
                const options = parseOptions(chromeOptions);
                inline !== null && inline !== void 0 ? inline : (inline = options.inline);
                preserve !== null && preserve !== void 0 ? preserve : (preserve = options.preserve);
                compress !== null && compress !== void 0 ? compress : (compress = options.compress);
                download !== null && download !== void 0 ? download : (download = options.download);
                tasks || (tasks = parseTask(chromeTasks));
                watch || (watch = parseWatchInterval(chromeWatch));
            }
            if (process) {
                format = process.join('+');
            }
            let data = null;
            if (src) {
                if ((data = File.parseUri(resolvePath(src), isCrossOrigin(download, preserveCrossOrigin), { saveAs: file, mimeType, format, fromConfig })) && data.format !== 'crossorigin') {
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
                if (data = createBundleAsset(assets, element, file, mimeType, format, preserve, inline, documentData)) {
                    data.bundleIndex = -1;
                }
            }
            if (this.processExtensions(data, documentData, compress, tasks, cloudStorage, attributes, !assetCommand ? element : undefined, watch)) {
                if (filename) {
                    data.filename = filename;
                }
                if (preserve) {
                    data.preserve = true;
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
                let command, saveAs, saveTo, pathname, filename, commands, inline, compress, download, blob, tasks, watch, attributes, cloudStorage, documentData, fromConfig;
                const setFilename = (options) => {
                    if (options.customize) {
                        command = Object.assign({}, options);
                        filename = options.customize.call(null, uri, mimeType || '', command);
                    }
                };
                if (element) {
                    const file = element.dataset.chromeFile;
                    if (file === 'ignore') {
                        return;
                    }
                    if (command = assetMap === null || assetMap === void 0 ? void 0 : assetMap.get(element)) {
                        ({ pathname, filename, inline, compress, download, blob, commands, tasks, watch, attributes, cloudStorage, document: documentData } = command);
                        if (excludeAsset(assets, command, element, documentData)) {
                            return;
                        }
                        [saveAs, saveTo] = checkSaveAs(uri, command.saveTo || pathname, filename || getFilename(uri));
                        if (saveAs) {
                            filename = '';
                        }
                        fromConfig = true;
                    }
                    else {
                        if (saveAsImage) {
                            setFilename(command = saveAsImage);
                            ({ pathname, inline, compress, download, blob, commands, tasks, watch, attributes, cloudStorage, document: documentData } = command);
                            if (excludeAsset(assets, saveAsImage, element, documentData)) {
                                return;
                            }
                            [saveAs, saveTo] = checkSaveAs(uri, pathname, filename || getFilename(uri));
                        }
                        if (file && !pathname) {
                            let fileAs = parseFileAs('saveTo', file);
                            if (fileAs) {
                                [saveAs, saveTo] = checkSaveAs(uri, fileAs.file, filename || getFilename(uri));
                            }
                            else if (fileAs = parseFileAs('saveAs', file)) {
                                saveAs = fileAs.file;
                            }
                        }
                        const { chromeCommands, chromeOptions, chromeTasks, chromeWatch } = element.dataset;
                        if (!commands && chromeCommands) {
                            commands = chromeCommands.split('::').map(value => value.trim());
                        }
                        const options = parseOptions(chromeOptions);
                        inline !== null && inline !== void 0 ? inline : (inline = options.inline);
                        compress !== null && compress !== void 0 ? compress : (compress = options.compress);
                        download !== null && download !== void 0 ? download : (download = options.download);
                        blob !== null && blob !== void 0 ? blob : (blob = options.blob);
                        tasks || (tasks = parseTask(chromeTasks));
                        watch || (watch = parseWatchInterval(chromeWatch));
                    }
                }
                else if (saveAsImage) {
                    setFilename(command = saveAsImage);
                    ({ pathname, inline, compress, download, blob, commands, tasks, cloudStorage } = command);
                    [saveAs, saveTo] = checkSaveAs(uri, pathname, filename || getFilename(uri));
                }
                if (base64 && !blob) {
                    return;
                }
                if (commands && (commands.length === 0 || commands[0] === '~')) {
                    commands = undefined;
                }
                const data = File.parseUri(uri, isCrossOrigin(download, preserveCrossOrigin), { saveAs, saveTo, mimeType, fromConfig });
                if (this.processExtensions(data, documentData, compress, tasks, cloudStorage, attributes, element, watch, !!commands)) {
                    if (filename) {
                        data.filename = filename;
                    }
                    if (base64) {
                        if (!fromConfig && assets.find(item => item.base64 === base64)) {
                            return;
                        }
                        data.format = 'blob';
                        data.base64 = base64;
                    }
                    else if (srcSet) {
                        data.format = 'srcset';
                    }
                    else if (inline) {
                        data.format = 'base64';
                    }
                    else if (!element && assets.find(item => item.moveTo === data.moveTo && item.pathname === data.pathname && item.filename === data.filename && !data.filename.includes("__assign__" /* ASSIGN */))) {
                        return;
                    }
                    if (commands) {
                        data.commands = commands;
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
        processExtensions(data, document, compress, tasks, cloudStorage, attributes, element, watch, modified) {
            if (data) {
                if (compress) {
                    data.compress = compress;
                    modified = true;
                }
                if (tasks) {
                    data.tasks = tasks;
                    modified = true;
                }
                if (attributes) {
                    data.attributes = attributes;
                    modified = true;
                }
                if (cloudStorage) {
                    data.cloudStorage = cloudStorage;
                    modified = true;
                }
                if (watch) {
                    data.watch = watch;
                    modified = true;
                }
                if (element) {
                    data.element = element;
                }
                if (document) {
                    data.document = document;
                }
                for (const ext of this.application.extensions) {
                    if (!ext.processFile(data)) {
                        return false;
                    }
                }
                return modified || data.format !== 'crossorigin';
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

    const { UNABLE_TO_FINALIZE_DOCUMENT, reject: reject$1 } = squared.lib.error;
    const { escapePattern, isPlainObject: isPlainObject$1 } = squared.lib.util;
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
                return reject$1(UNABLE_TO_FINALIZE_DOCUMENT);
            }
            const { resourceId, unusedStyles } = this.getProcessing(result.sessionId);
            const dataSource = [];
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
                const commands = await this.fileHandler.loadConfig(options.configUri, options);
                if (commands) {
                    const documentHandler = this.userSettings.outputDocumentHandler;
                    const paramMap = new Map();
                    const replaceParams = (param) => {
                        if (param && typeof param !== 'number' && typeof param !== 'boolean') {
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
                        return param;
                    };
                    if (location.href.includes('?')) {
                        new URLSearchParams(location.search).forEach((value, key) => paramMap.set(key, [new RegExp(`\\{\\{\\s*${escapePattern(key)}\\s*\\}\\}`, 'g'), value]));
                    }
                    for (const item of commands) {
                        if (item.selector) {
                            const type = item.type;
                            let dataSrc = isPlainObject$1(item.dataSource) ? item.dataSource : null, dataCloud = isPlainObject$1(item.cloudDatabase) ? item.cloudDatabase : null;
                            if (paramMap.size) {
                                for (const data of [dataSrc, dataCloud]) {
                                    if (data) {
                                        for (const attr in data) {
                                            if (attr !== 'value') {
                                                data[attr] = replaceParams(data[attr]);
                                            }
                                        }
                                    }
                                }
                            }
                            dataSrc && (dataSrc = Object.assign(Object.assign({ document: item.document || documentHandler }, dataSrc), { type }));
                            dataCloud && (dataCloud = Object.assign(Object.assign({ document: item.document || documentHandler }, dataSrc), { type, source: 'cloud' }));
                            document.querySelectorAll(item.selector).forEach((element) => {
                                switch (type) {
                                    case 'text':
                                    case 'attribute':
                                    case 'display':
                                        if (dataSrc) {
                                            dataSource.push([element, dataSrc]);
                                        }
                                        else if (dataCloud) {
                                            dataSource.push([element, dataCloud]);
                                        }
                                        break;
                                    default:
                                        if (type && (type === 'replace' || type.startsWith('append/') || type.startsWith('prepend/'))) {
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
            }
            if (assetMap.size === 0) {
                delete options.assetMap;
            }
            if (appendMap.size === 0) {
                delete options.appendMap;
            }
            if (dataSource.length) {
                const useOriginalHtmlPage = options.useOriginalHtmlPage;
                const domAll = document.querySelectorAll('*');
                const cache = {};
                const items = options.dataSource || (options.dataSource = []);
                for (let i = 0, length = dataSource.length; i < length; ++i) {
                    const [element, data] = dataSource[i];
                    const node = File.createTagNode(element, domAll, cache);
                    node.textContent = element.textContent;
                    data.element = node;
                    if (!useOriginalHtmlPage) {
                        File.setDocumentId(node, element, data.document);
                    }
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
        webSocketPort: 80,
        webSocketSecurePort: 443,
        outputDocumentHandler: 'chrome',
        outputEmptyCopyDirectory: false,
        outputTasks: {},
        outputWatch: {},
        outputArchiveName: 'chrome-data',
        outputArchiveFormat: 'zip',
        outputArchiveCache: false
    };

    const { DIRECTORY_NOT_PROVIDED, FRAMEWORK_NOT_INSTALLED, reject } = squared.lib.error;
    const { isString, isPlainObject } = squared.lib.util;
    let application = null;
    let file = null;
    function createAssetsOptions(assets, options, filename) {
        if (isPlainObject(options)) {
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
                    return file ? file.copying(pathname, createAssetsOptions(file.getHtmlPage(options), options)) : reject(FRAMEWORK_NOT_INSTALLED);
                }
                return reject(DIRECTORY_NOT_PROVIDED);
            },
            copyScriptAssets(pathname, options) {
                if (isString(pathname)) {
                    return file ? file.copying(pathname, createAssetsOptions(file.getScriptAssets(options)[0], options)) : reject(FRAMEWORK_NOT_INSTALLED);
                }
                return reject(DIRECTORY_NOT_PROVIDED);
            },
            copyLinkAssets(pathname, options) {
                if (isString(pathname)) {
                    return file ? file.copying(pathname, createAssetsOptions(file.getLinkAssets(options), options)) : reject(FRAMEWORK_NOT_INSTALLED);
                }
                return reject(DIRECTORY_NOT_PROVIDED);
            },
            copyImageAssets(pathname, options) {
                if (isString(pathname)) {
                    return file ? file.copying(pathname, createAssetsOptions(file.getImageAssets(options), options)) : reject(FRAMEWORK_NOT_INSTALLED);
                }
                return reject(DIRECTORY_NOT_PROVIDED);
            },
            copyVideoAssets(pathname, options) {
                if (isString(pathname)) {
                    return file ? file.copying(pathname, createAssetsOptions(file.getVideoAssets(options), options)) : reject(FRAMEWORK_NOT_INSTALLED);
                }
                return reject(DIRECTORY_NOT_PROVIDED);
            },
            copyAudioAssets(pathname, options) {
                if (isString(pathname)) {
                    return file ? file.copying(pathname, createAssetsOptions(file.getAudioAssets(options), options)) : reject(FRAMEWORK_NOT_INSTALLED);
                }
                return reject(DIRECTORY_NOT_PROVIDED);
            },
            copyFontAssets(pathname, options) {
                if (isString(pathname)) {
                    return file ? file.copying(pathname, createAssetsOptions(file.getFontAssets(options), options)) : reject(FRAMEWORK_NOT_INSTALLED);
                }
                return reject(DIRECTORY_NOT_PROVIDED);
            },
            saveHtmlPage(filename, options) {
                return file ? file.archiving('', createAssetsOptions(file.getHtmlPage(options), options, checkFileName(filename, 'html'))) : reject(FRAMEWORK_NOT_INSTALLED);
            },
            saveScriptAssets(filename, options) {
                return file ? file.archiving('', createAssetsOptions(file.getScriptAssets(options)[0], options, checkFileName(filename, 'script'))) : reject(FRAMEWORK_NOT_INSTALLED);
            },
            saveLinkAssets(filename, options) {
                return file ? file.archiving('', createAssetsOptions(file.getLinkAssets(options), options, checkFileName(filename, 'link'))) : reject(FRAMEWORK_NOT_INSTALLED);
            },
            saveImageAssets(filename, options) {
                return file ? file.archiving('', createAssetsOptions(file.getImageAssets(options), options, checkFileName(filename, 'image'))) : reject(FRAMEWORK_NOT_INSTALLED);
            },
            saveVideoAssets(filename, options) {
                return file ? file.archiving('', createAssetsOptions(file.getVideoAssets(options), options, checkFileName(filename, 'video'))) : reject(FRAMEWORK_NOT_INSTALLED);
            },
            saveAudioAssets(filename, options) {
                return file ? file.archiving('', createAssetsOptions(file.getAudioAssets(options), options, checkFileName(filename, 'audio'))) : reject(FRAMEWORK_NOT_INSTALLED);
            },
            saveFontAssets(filename, options) {
                return file ? file.archiving('', createAssetsOptions(file.getFontAssets(options), options, checkFileName(filename, 'font'))) : reject(FRAMEWORK_NOT_INSTALLED);
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
