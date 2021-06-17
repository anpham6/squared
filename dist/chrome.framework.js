/* chrome-framework
   https://github.com/anpham6/squared */

var chrome = (function () {
    'use strict';

    var Resource = squared.base.Resource;
    const { DOM } = squared.base.lib.regex;
    const { createElement } = squared.lib.dom;
    const { convertWord, escapePattern: escapePattern$1, findReverse, fromLastIndexOf, isPlainObject: isPlainObject$2, hasValue, lastItemOf, replaceAll, resolvePath, splitPair, splitPairEnd, splitPairStart, splitSome: splitSome$1, startsWith } = squared.lib.util;
    const { parseTask, parseWatchInterval } = squared.base.lib.internal;
    const { appendSeparator, fromMimeType, parseMimeType, generateUUID, getComponentEnd, trimEnd } = squared.base.lib.util;
    const FILENAME_MAP = new WeakMap();
    let BUNDLE_ID = 0;
    function parseFileAs(attr, value) {
        if (value) {
            const match = new RegExp(`^(?:^|\\s+)${attr}\\s*:(.+)$`).exec(value);
            if (match) {
                const [file, format] = splitPair(match[1], '::', true);
                return { file: replaceAll(file, '\\', '/'), format };
            }
        }
    }
    function parseOptions(value) {
        const result = {};
        if (value) {
            if (value.indexOf('inline') !== -1) {
                result.inline = true;
            }
            if (value.indexOf('preserve') !== -1) {
                result.preserve = true;
            }
            if (value.indexOf('blob') !== -1) {
                result.blob = true;
            }
            if (value.indexOf('extract') !== -1) {
                result.extract = true;
            }
            if (value.indexOf('crossorigin') !== -1) {
                result.download = false;
            }
            const pattern = /\bcompress\[([^\]]+)\]/g;
            let match;
            while (match = pattern.exec(value)) {
                (result.compress || (result.compress = [])).push({ format: match[1].trim() });
            }
        }
        return result;
    }
    function getFilePath(value, saveTo, ext) {
        if (startsWith(value, './')) {
            value = value.substring(2);
        }
        if (value.indexOf('/') === -1) {
            return [undefined, '', value];
        }
        let moveTo;
        if (value[0] === '/') {
            moveTo = "__serverroot__" /* SERVERROOT */;
            value = value.substring(1);
        }
        else if (startsWith(value, '../')) {
            moveTo = "__serverroot__" /* SERVERROOT */;
            const pathname = location.pathname.split('/');
            if (--pathname.length) {
                for (let i = 0, length = value.length; i < length; i += 3) {
                    if (value.substring(i, i + 3) !== '../' || --pathname.length === 0) {
                        break;
                    }
                }
            }
            value = (pathname.shift() ? pathname.join('/') + '/' : '') + value.split('../').pop();
        }
        const result = splitPair(value, '/', false, true);
        if (saveTo) {
            result[1] = assignFilename(result[1], ext);
        }
        return [moveTo, ...result];
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
                    if (item.uri) {
                        urls.push(new URL(item.uri));
                    }
                }
                invalid: {
                    if (urls.length === length) {
                        const { origin, pathname } = urls[0];
                        let baseDir = pathname.split('/');
                        for (let i = 1; i < length; ++i) {
                            const url = urls[i];
                            if (url.origin === origin) {
                                if (baseDir.length) {
                                    const parts = url.pathname.split('/');
                                    for (let j = 0; j < parts.length; ++j) {
                                        if (baseDir[j] !== parts[j]) {
                                            baseDir = baseDir.slice(0, j);
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
                uri: getBaseUrl(),
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
            const previous = findReverse(assets, item => item.mimeType === mimeType && !item.exclude);
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
        for (const item of assets) {
            if (hasSamePath(item, data, true)) {
                if (item.mimeType === data.mimeType) {
                    return false;
                }
                checkFilename(assets, data);
                break;
            }
        }
        return true;
    }
    function checkFilename(assets, data) {
        const filename = data.filename;
        let i = 0;
        while (assets.find(item => hasSamePath(item, data, false))) {
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
        if (pathname && pathname !== '~') {
            return [pathname, true];
        }
        return ['', false];
    }
    function getCustomPath(uri, pathname, filename) {
        if (pathname === '~') {
            pathname = '';
        }
        if (uri && !pathname && filename) {
            try {
                const asset = new URL(uri);
                if (location.origin === asset.origin && startsWith(asset.pathname, pathname = splitPairStart(location.pathname, '/', false, true))) {
                    const pathsub = asset.pathname.substring(pathname.length + 1);
                    if (pathsub.indexOf('/') !== -1) {
                        pathname = splitPairStart(pathsub, '/', false, true);
                    }
                    else {
                        return filename;
                    }
                }
                else {
                    return '';
                }
            }
            catch (_a) {
            }
        }
        return pathname && filename && appendSeparator(pathname, filename);
    }
    function setUUID(node, element, name) {
        var _a, _b;
        const id = (_a = element.dataset)[_b = name + 'Id'] || (_a[_b] = generateUUID());
        (node.id || (node.id = {}))[name] = id;
    }
    function createFile(mimeType) {
        return {
            pathname: '',
            filename: '',
            mimeType,
            format: 'crossorigin'
        };
    }
    function hasFormat(value) {
        if (value) {
            switch (value) {
                case 'base64':
                case 'crossorigin':
                case 'blob':
                case 'srcset':
                    return false;
            }
            return true;
        }
        return false;
    }
    const assignFilename = (value, ext) => "__assign__" /* ASSIGN */ + '.' + (ext || value && getFileExt(value) || 'unknown');
    const isCrossOrigin = (download, preserveCrossOrigin) => typeof download === 'boolean' ? !download : !!preserveCrossOrigin;
    const getContentType = (element) => element instanceof HTMLLinkElement ? 'style' : element.tagName.toLowerCase();
    const getTagNode = (node, attributes, append) => (Object.assign(Object.assign({}, node), { attributes, append }));
    const getAssetCommand = (assetMap, element) => assetMap && assetMap.get(element);
    const getMimeType = (element, src, fallback = '') => element.type.trim().toLowerCase() || src && parseMimeType(src) || fallback;
    const getFileExt = (value) => splitPairEnd(value, '.', true, true).toLowerCase();
    const getBaseUrl = () => location.origin + location.pathname;
    const hasSamePath = (item, other, bundle) => item.pathname === other.pathname && (item.filename === other.filename || FILENAME_MAP.get(item) === other.filename || bundle && startsWith(item.filename, "__assign__" /* ASSIGN */)) && (item.moveTo || '') === (other.moveTo || '');
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
                document.forEach(name => setUUID(node, element, name));
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
                return createFile(mimeType);
            }
            if (saveAs) {
                saveAs = trimEnd(replaceAll(saveAs, '\\', '/'), '/');
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
                else if (local && file) {
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
                        if (lastItemOf(pathbase) !== '/') {
                            pathbase = splitPairStart(pathbase, '/', false, true);
                        }
                        if (startsWith(pathsub, pathbase)) {
                            pathname = pathsub.substring(pathbase.length + 1);
                        }
                        else {
                            moveTo = "__serverroot__" /* SERVERROOT */;
                            pathname = pathsub[0] === '/' ? pathsub.substring(1) : pathsub;
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
            const command = getAssetCommand(assetMap, element) || saveAsHtml;
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
                    const value = location.pathname.split('/').pop();
                    data.filename = /\.(?:html?|php|jsp|aspx?)$/i.exec(value) ? value : 'index.html';
                }
                if (hasFormat(data.format)) {
                    data.willChange = true;
                }
                return [data];
            }
            return [];
        }
        getScriptAssets(options) {
            var _a;
            let assetMap, preserveCrossOrigin, saveAsScript;
            if (options) {
                ({ assetMap, preserveCrossOrigin } = options);
                saveAsScript = (_a = options.saveAs) === null || _a === void 0 ? void 0 : _a.script;
            }
            const result = [];
            const bundleIndex = {};
            let templateMap;
            const addTemplate = (type, module, identifier, value) => { var _a; return ((_a = (templateMap || (templateMap = { html: {}, js: {}, css: {} }))[type])[module] || (_a[module] = {}))[identifier] = value; };
            if (assetMap) {
                for (const { template, type, selector } of assetMap.values()) {
                    if (template && type && !selector) {
                        switch (type) {
                            case 'html':
                            case 'js':
                            case 'css': {
                                const { module, identifier } = template;
                                let value = template.value;
                                if (module && identifier && value && (value = value.trim()) && value.indexOf('function') !== -1) {
                                    addTemplate(type, module, identifier, value);
                                }
                                break;
                            }
                        }
                    }
                }
            }
            document.querySelectorAll('script').forEach(element => {
                const template = element.dataset.chromeTemplate;
                let mimeType = element.type.toLowerCase();
                if (template || mimeType === 'text/template') {
                    const command = getAssetCommand(assetMap, element);
                    let type, module, identifier;
                    if (command) {
                        type = command.type;
                        if (command.template) {
                            ({ module, identifier } = command.template);
                        }
                    }
                    else if (template) {
                        [type, module, identifier] = template.split('::').map((value, index) => (index === 0 ? value.toLowerCase() : value).trim());
                    }
                    if (type && module && identifier) {
                        switch (type) {
                            case 'html':
                            case 'js':
                            case 'css':
                                addTemplate(type, module, identifier, element.textContent.trim());
                                excludeAsset(result, { exclude: true }, element);
                                return;
                        }
                    }
                    if (command) {
                        excludeAsset(result, command, element);
                    }
                }
                else if (!(mimeType === 'application/json' || mimeType === 'application/ld+json')) {
                    const src = element.src;
                    mimeType = getMimeType(element, src, 'text/javascript');
                    if (mimeType === 'application/javascript') {
                        mimeType = 'text/javascript';
                    }
                    mimeType += '|' + (element.defer ? '1' : '0') + (element.async ? '1' : '0') + (element.noModule ? '1' : '0');
                    this.createBundle(true, result, element, src, mimeType, 'js', { preserveCrossOrigin, bundleIndex, assetMap, saveAsOptions: saveAsScript });
                }
            });
            setBundleIndex(bundleIndex);
            return [result, templateMap];
        }
        getLinkAssets(options) {
            var _a, _b, _c;
            let resourceId, assetMap, preserveCrossOrigin, saveAsLink;
            if (options) {
                ({ resourceId, assetMap, preserveCrossOrigin } = options);
                saveAsLink = (_a = options.saveAs) === null || _a === void 0 ? void 0 : _a.link;
            }
            const result = [];
            const bundleIndex = {};
            const styleMap = new WeakMap();
            document.querySelectorAll('link, style').forEach((element) => {
                let href = '', mimeType = 'text/css';
                if (element instanceof HTMLLinkElement) {
                    const rel = element.rel.trim().toLowerCase();
                    href = element.href;
                    if (rel !== 'stylesheet') {
                        const checkMimeType = () => {
                            const filename = fromLastIndexOf(href, '/');
                            if (filename.indexOf('.') !== -1) {
                                mimeType = getMimeType(element, filename);
                                return true;
                            }
                            return false;
                        };
                        if (getAssetCommand(assetMap, element)) {
                            checkMimeType();
                        }
                        else if (!href || rel.indexOf('icon') === -1 || !checkMimeType()) {
                            return;
                        }
                        else {
                            try {
                                if (new URL(href).origin !== location.origin) {
                                    return;
                                }
                            }
                            catch (_a) {
                                return;
                            }
                        }
                    }
                }
                const data = this.createBundle(mimeType === 'text/css', result, element, href, mimeType, 'css', { preserveCrossOrigin, bundleIndex, assetMap, saveAsOptions: saveAsLink });
                if (data) {
                    styleMap.set(element, data);
                }
            });
            const rawData = (_b = this.getResourceAssets(resourceId)) === null || _b === void 0 ? void 0 : _b.rawData;
            if (rawData) {
                const styleSheets = document.styleSheets;
                const length = styleSheets.length;
                for (const [uri, item] of rawData) {
                    bundled: {
                        if (item.mimeType === 'text/css') {
                            try {
                                invalid: {
                                    if (new URL(uri).origin === location.origin) {
                                        for (let i = 0; i < length; ++i) {
                                            const cssRules = styleSheets[i].cssRules;
                                            for (let j = 0, q = cssRules.length, element; j < q; ++j) {
                                                const rule = cssRules[j];
                                                if (rule.type === rule.IMPORT_RULE && (element = (_c = rule.parentStyleSheet) === null || _c === void 0 ? void 0 : _c.ownerNode) && resolvePath(rule.href, element.href) === uri) {
                                                    const elementData = styleMap.get(element);
                                                    if (elementData) {
                                                        let assetCommand = assetMap && assetMap.get(element), extracted;
                                                        if (assetCommand || (saveAsLink === null || saveAsLink === void 0 ? void 0 : saveAsLink.extract)) {
                                                            const bundleOptions = { preserveCrossOrigin, bundleIndex };
                                                            if (assetCommand) {
                                                                const file = element.dataset.chromeFile;
                                                                if (assetCommand.extract || file && file.indexOf('extract') !== -1) {
                                                                    extracted = true;
                                                                }
                                                                bundleOptions.assetMap = assetMap;
                                                            }
                                                            else if (saveAsLink === null || saveAsLink === void 0 ? void 0 : saveAsLink.extract) {
                                                                if (saveAsLink.customize && saveAsLink.customize.call(null, uri, 'text/css', Object.assign({}, saveAsLink)) === null) {
                                                                    continue;
                                                                }
                                                                assetCommand = Object.assign({}, saveAsLink);
                                                                bundleOptions.assetCommand = assetCommand;
                                                                extracted = true;
                                                            }
                                                            if (assetCommand) {
                                                                if (extracted) {
                                                                    assetCommand.pathname = (elementData.moveTo ? '/' : '') + elementData.pathname;
                                                                    assetCommand.filename = elementData.filename;
                                                                }
                                                                const data = this.createBundle(true, result, element, uri, 'text/css', 'css', bundleOptions);
                                                                if (data) {
                                                                    if (extracted) {
                                                                        data.bundleReplace = escapePattern$1(rule.cssText).replace(/\("/, `(\\s*["']?\\s*`).replace(/"\\\)/, `\\s*["']?\\s*\\)`).replace(/\s+/g, '\\s+');
                                                                    }
                                                                    delete data.element;
                                                                    break bundled;
                                                                }
                                                            }
                                                        }
                                                    }
                                                    break invalid;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            catch (_d) {
                            }
                            let command = saveAsLink, saveAs, filename, compress, download, preserve, process, tasks, cloudStorage, documentData;
                            if (command) {
                                if (command.customize) {
                                    if ((filename = command.customize.call(null, uri, 'text/css', command = Object.assign({}, command))) === null) {
                                        continue;
                                    }
                                    if (command.pathname && filename) {
                                        saveAs = appendSeparator(command.pathname, filename);
                                    }
                                }
                                ({ compress, download, preserve, process, tasks, cloudStorage, document: documentData } = command);
                            }
                            const data = File.parseUri(resolvePath(uri), isCrossOrigin(download, preserveCrossOrigin), { saveAs, mimeType: 'text/css', format: process ? process.join('+') : '' });
                            if (this.processExtensions(data, documentData, compress, tasks, cloudStorage)) {
                                if (filename) {
                                    data.filename = filename;
                                }
                                if (preserve) {
                                    data.preserve = true;
                                }
                                result.push(data);
                            }
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
            document.querySelectorAll('img, input[type=image], picture > source[src], video[poster]').forEach((element) => {
                let src = element instanceof HTMLVideoElement ? element.poster : element.src, mimeType, base64;
                const image = Resource.parseDataURI(src);
                if (image) {
                    if (base64 = image.base64) {
                        src = assignFilename('', (mimeType = image.mimeType) && fromMimeType(mimeType));
                    }
                    else {
                        return;
                    }
                }
                this.processImageUri(result, element, resolvePath(src), saveAsImage, preserveCrossOrigin, assetMap, mimeType, base64);
            });
            document.querySelectorAll('img[srcset], picture > source[srcset]').forEach((element) => {
                splitSome$1(element.srcset, value => {
                    const match = DOM.SRCSET.exec(value);
                    if (match) {
                        const src = resolvePath(match[1]);
                        if (src !== resolvePath(element.src)) {
                            this.processImageUri(result, element, src, saveAsImage, preserveCrossOrigin, assetMap, undefined, undefined, true);
                        }
                    }
                });
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
                if (assets.rawData) {
                    for (const item of assets.rawData.values()) {
                        const { base64, content, mimeType = parseMimeType(item.filename) } = item;
                        if (base64) {
                            if (saveAsImage === null || saveAsImage === void 0 ? void 0 : saveAsImage.blob) {
                                let command = saveAsImage, filename, commands;
                                if (command.customize && (filename = command.customize.call(null, '', mimeType, command = Object.assign({}, command))) === null) {
                                    continue;
                                }
                                const pathname = command.pathname;
                                filename || (filename = item.filename);
                                if (startsWith(mimeType, 'image/') && (commands = command.commands)) {
                                    for (let i = 0; i < commands.length; ++i) {
                                        const match = /^(?:^|\s+)(?:(png|jpeg|webp|bmp)\s*[@%]?)(.*)$/.exec(commands[i]);
                                        if (match) {
                                            commands[i] = match[1] + '@' + match[2].trim();
                                        }
                                        else {
                                            commands.splice(i--, 1);
                                        }
                                    }
                                }
                                const data = this.processImageUri(result, null, resolvePath(pathname ? appendSeparator(pathname, filename) : filename), command, false, undefined, mimeType || 'image/unknown', base64);
                                if (data) {
                                    if (commands && commands.length) {
                                        data.commands = commands;
                                    }
                                    else {
                                        delete data.commands;
                                    }
                                    if (!pathname) {
                                        delete data.uri;
                                    }
                                    if (this.processExtensions(data)) {
                                        result.push(data);
                                    }
                                }
                            }
                        }
                        else if (content && mimeType) {
                            const data = {
                                pathname: "__generated__" /* GENERATED */ + '/' + mimeType.split('/').pop(),
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
                        let command = saveAsFont, data, pathname, filename, inline, blob;
                        if (command) {
                            if (command.customize && (filename = command.customize.call(null, srcUrl || '', mimeType, command = Object.assign({}, command))) === null) {
                                continue;
                            }
                            ({ pathname, inline, blob } = command);
                        }
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
        finalizeRequestBody(options) {
            var _a;
            const productionRelease = options.productionRelease;
            let watchElement;
            if (!productionRelease && options.watch) {
                const socketMap = {};
                const hostname = new URL(this.hostname).hostname;
                const settings = this.application.userSettings;
                for (const { watch } of options.assets) {
                    if (isPlainObject$2(watch) && watch.reload) {
                        const reload = watch.reload;
                        let { socketId, secure, handler = {}, port = secure ? settings.webSocketSecurePort : settings.webSocketPort } = reload; // eslint-disable-line prefer-const
                        if (socketId && hasValue(port) && Math.floor(port = +port) > 0) {
                            socketMap[_a = socketId + `_${port}_` + (secure ? '0' : '1')] || (socketMap[_a] = `socket=new WebSocket("${secure ? 'wss' : 'ws'}://${hostname}:${port}");` +
                                (handler.open ? `socket.onopen=${handler.open};` : '') +
                                'socket.onmessage=' + (handler.message || `function(e){var c=JSON.parse(e.data);if(c&&c.socketId==="${socketId}"&&c.module==="watch"&&c.action==="modified"){if(!c.errors||!c.errors.length){if(c.hot){if(c.type==="text/css"){var a=document.querySelectorAll('link[href^="'+c.src+'"]');if(a.length){a.forEach(function(b){b.href=c.src+c.hot;});return;}}else if(c.type.startsWith("image/")){var a=document.querySelectorAll('img[src^="'+c.src+'"]');if(a.length){a.forEach(function(b){b.src=c.src+c.hot;});return;}}}window.location.reload();}else{console.log("FAIL: "+c.errors.length+" errors\\n\\n"+c.errors.join("\\n"));}}}`) + ';' +
                                (handler.error ? `socket.onerror=${handler.error};` : '') +
                                (handler.close ? `socket.onclose=${handler.close};` : ''));
                        }
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
                let append;
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
                        if (watchElement && (append = element.append) && append.tagName === 'script') {
                            ++append.tagCount;
                        }
                    }
                    if (productionRelease && item.watch) {
                        delete item.watch;
                    }
                }
                if (watchElement) {
                    document.body.removeChild(watchElement);
                }
                if (options.document) {
                    for (const name of options.document) {
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
                switch (element.tagName.toUpperCase()) {
                    case 'VIDEO':
                    case 'AUDIO':
                        element.querySelectorAll('source, track').forEach((source) => resolveAssetSource(source, items));
                        break;
                    case 'IFRAME':
                        if (!(getAssetCommand(assetMap, element) || startsWith(element.dataset.chromeFile, 'saveTo'))) {
                            return;
                        }
                    case 'OBJECT':
                    case 'EMBED': {
                        const src = element instanceof HTMLObjectElement ? element.data : element.src;
                        const mimeType = element.type || parseMimeType(src);
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
                    const command = getAssetCommand(assetMap, item);
                    let saveAs, saveTo, filename, compress, download, tasks, watch, attributes, cloudStorage, documentData, fromConfig;
                    if (command) {
                        ({ filename, compress, download, tasks, watch, attributes, cloudStorage, document: documentData } = command);
                        if (excludeAsset(result, command, item, documentData)) {
                            continue;
                        }
                        [saveAs, saveTo] = checkSaveAs(uri, command.saveTo || command.pathname, filename || getComponentEnd(uri));
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
            var _a;
            const { assetMap, appendMap, nodeMap = new Map(), useOriginalHtmlPage, preserveCrossOrigin } = options;
            const domAll = document.querySelectorAll('*');
            const cache = {};
            const assets = this.getHtmlPage(options).concat(this.getLinkAssets(options));
            if (options.saveAsWebPage) {
                assets.forEach(item => {
                    switch (item.mimeType) {
                        case 'text/html':
                        case 'text/css':
                            item.mimeType = '@' + item.mimeType;
                            item.willChange = true;
                            break;
                    }
                });
            }
            const [scriptAssets, templateMap] = this.getScriptAssets(options);
            scriptAssets.forEach(item => {
                let mimeType = item.mimeType;
                if (mimeType) {
                    mimeType = splitPairStart(mimeType, '|');
                    if (mimeType === 'module') {
                        mimeType = 'application/javascript';
                    }
                    item.mimeType = mimeType;
                }
                if (hasFormat(item.format) || item.bundleId || item.trailingContent) {
                    item.willChange = true;
                }
            });
            assets.push(...scriptAssets, ...this.getImageAssets(options), ...this.getVideoAssets(options), ...this.getAudioAssets(options), ...this.getRawAssets('object', options), ...this.getRawAssets('embed', options), ...this.getRawAssets('iframe', options), ...this.getFontAssets(options));
            if (appendMap) {
                const tagCount = {};
                const getAppendData = (tagName, order, textContent, prepend) => {
                    if (!(tagName in tagCount)) {
                        tagCount[tagName] = document.querySelectorAll(tagName).length;
                    }
                    return { tagName, tagCount: tagCount[tagName], order, textContent, prepend };
                };
                for (const [element, appending] of appendMap) {
                    const node = File.createTagNode(element, domAll, cache);
                    const documentData = (_a = getAssetCommand(assetMap, element)) === null || _a === void 0 ? void 0 : _a.document;
                    const getNextSibling = () => node.index + element.querySelectorAll('*').length + 1;
                    if (!useOriginalHtmlPage) {
                        File.setDocumentId(node, element, documentData);
                    }
                    node.outerXml = element.outerHTML.trim();
                    let i = 0;
                    for (const appendCommand of appending) {
                        const { type, attributes, download, textContent } = appendCommand;
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
                                    if (startsWith(type, 'append/')) {
                                        append.nextSibling = getNextSibling();
                                        elementData = getTagNode(node, attributes, append);
                                    }
                                    else if (startsWith(type, 'prepend/')) {
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
                            appendCommand.document || (appendCommand.document = documentData);
                            delete appendCommand.download;
                            const data = this.createBundle(false, assets, element, url, attributes.type, js ? 'js' : 'css', { appendCommand });
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
            const documentHandler = this.application.userSettings.outputDocumentHandler;
            const documentElement = document.documentElement;
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
                item.document || (item.document = File.copyDocument(documentHandler));
            }
            for (const [node, element] of nodeMap) {
                if (element !== documentElement) {
                    node.outerXml = element.outerHTML.trim();
                }
            }
            if (options.assets) {
                assets.push(...options.assets);
            }
            options.assets = assets;
            options.baseUrl = getBaseUrl();
            if (templateMap) {
                options.templateMap = templateMap;
            }
            delete options.saveAs;
            delete options.assetMap;
            delete options.indexMap;
            delete options.nodeMap;
            delete options.appendMap;
            delete options.sessionId;
            delete options.resourceId;
            return options;
        }
        createBundle(bundling, assets, element, src, mimeType, ext, options) {
            const { preserveCrossOrigin, bundleIndex, assetMap, assetCommand, appendCommand } = options;
            let file = !assetCommand && !appendCommand ? element.dataset.chromeFile : '';
            if (file === 'exclude' || file === 'ignore') {
                return;
            }
            const command = getAssetCommand(assetMap, element) || appendCommand || assetCommand;
            let filename, format, inline, process, compress, download, preserve, tasks, watch, attributes, cloudStorage, documentData, fromConfig, fromSaveAs;
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
                let saveAsOptions = bundling && options.saveAsOptions;
                if (saveAsOptions) {
                    if (saveAsOptions.customize && (filename = saveAsOptions.customize.call(null, src || '', mimeType, saveAsOptions = Object.assign({}, saveAsOptions))) === null) {
                        return;
                    }
                    ({ inline, compress, download, preserve, process, tasks, watch, attributes, cloudStorage, document: documentData } = saveAsOptions);
                    if (excludeAsset(assets, saveAsOptions, element, documentData)) {
                        return;
                    }
                    if (!saveAsOptions.filename) {
                        saveAsOptions.filename = filename || (generateUUID(this.userSettings.formatUUID, this.userSettings.formatDictionary) + '.' + ext);
                    }
                    filename || (filename = saveAsOptions.filename);
                    if (src) {
                        if (file = getCustomPath(src, saveAsOptions.pathname, filename)) {
                            filename = '';
                        }
                    }
                    else {
                        file = './' + filename;
                        filename = '';
                        fromSaveAs = true;
                    }
                }
                const { chromeOptions, chromeTasks, chromeWatch } = element.dataset;
                const dataset = parseOptions(chromeOptions);
                inline !== null && inline !== void 0 ? inline : (inline = dataset.inline);
                preserve !== null && preserve !== void 0 ? preserve : (preserve = dataset.preserve);
                compress || (compress = dataset.compress);
                download !== null && download !== void 0 ? download : (download = dataset.download);
                tasks || (tasks = parseTask(chromeTasks));
                watch || (watch = parseWatchInterval(chromeWatch));
            }
            if (process) {
                format = process.join('+');
            }
            let data;
            if (src) {
                if ((data = File.parseUri(resolvePath(src), isCrossOrigin(download, preserveCrossOrigin) || appendCommand && preserve, { saveAs: file, mimeType, format, fromConfig })) && data.format !== 'crossorigin') {
                    if (appendCommand) {
                        if (inline) {
                            switch (appendCommand.type) {
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
                        if (bundling && checkBundleStart(assets, data)) {
                            data.bundleIndex = -1;
                        }
                    }
                }
            }
            else if (file && bundling) {
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
            else if (!(element instanceof HTMLScriptElement)) {
                data = createFile(mimeType);
            }
            if (this.processExtensions(data, documentData, compress, tasks, cloudStorage, attributes, !assetCommand && !appendCommand ? element : undefined, watch)) {
                if (filename) {
                    data.filename = filename;
                }
                if (preserve) {
                    data.preserve = true;
                }
                if (bundleIndex) {
                    setBundleData(bundleIndex, data);
                }
                if (hasFormat(data.format)) {
                    data.willChange = true;
                }
                assets.push(data);
                return data;
            }
        }
        processImageUri(assets, element, uri, saveAsImage, preserveCrossOrigin, assetMap, mimeType, base64, srcSet) {
            if (uri) {
                let command, saveAs, saveTo, pathname, filename, commands, inline, compress, download, blob, tasks, watch, attributes, cloudStorage, documentData, fromConfig;
                const setFilename = (options) => {
                    if (options.customize && (filename = options.customize.call(null, uri, mimeType || '', command = Object.assign({}, options))) === null) {
                        return false;
                    }
                    return true;
                };
                if (element) {
                    const file = element.dataset.chromeFile;
                    if (file === 'ignore') {
                        return;
                    }
                    if (command = getAssetCommand(assetMap, element)) {
                        ({ pathname, filename, inline, compress, download, blob, commands, tasks, watch, attributes, cloudStorage, document: documentData } = command);
                        if (excludeAsset(assets, command, element, documentData)) {
                            return;
                        }
                        [saveAs, saveTo] = checkSaveAs(uri, command.saveTo || pathname, filename || getComponentEnd(uri));
                        if (saveAs) {
                            filename = '';
                        }
                        fromConfig = true;
                    }
                    else {
                        if (saveAsImage) {
                            if (!setFilename(command = saveAsImage)) {
                                return;
                            }
                            ({ pathname, inline, compress, download, blob, commands, tasks, watch, attributes, cloudStorage, document: documentData } = command);
                            if (excludeAsset(assets, saveAsImage, element, documentData)) {
                                return;
                            }
                            [saveAs, saveTo] = checkSaveAs(uri, pathname, filename || getComponentEnd(uri));
                        }
                        if (file && !pathname) {
                            let fileAs = parseFileAs('saveTo', file);
                            if (fileAs) {
                                [saveAs, saveTo] = checkSaveAs(uri, fileAs.file, filename || getComponentEnd(uri));
                            }
                            else if (fileAs = parseFileAs('saveAs', file)) {
                                saveAs = fileAs.file;
                            }
                        }
                        const { chromeCommands, chromeOptions, chromeTasks, chromeWatch } = element.dataset;
                        if (chromeCommands) {
                            commands || (commands = chromeCommands.split('::').map(value => value.trim()));
                        }
                        const options = parseOptions(chromeOptions);
                        inline !== null && inline !== void 0 ? inline : (inline = options.inline);
                        compress || (compress = options.compress);
                        download !== null && download !== void 0 ? download : (download = options.download);
                        blob !== null && blob !== void 0 ? blob : (blob = options.blob);
                        tasks || (tasks = parseTask(chromeTasks));
                        watch || (watch = parseWatchInterval(chromeWatch));
                    }
                }
                else if (saveAsImage) {
                    if (!setFilename(command = saveAsImage)) {
                        return;
                    }
                    ({ pathname, inline, compress, download, blob, commands, tasks, cloudStorage } = command);
                    [saveAs, saveTo] = checkSaveAs(uri, pathname, filename || getComponentEnd(uri));
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
                    else if (!element && assets.find(item => item.moveTo === data.moveTo && item.pathname === data.pathname && item.filename === data.filename && data.filename.indexOf("__assign__" /* ASSIGN */) === -1)) {
                        return;
                    }
                    if (commands) {
                        data.commands = commands;
                        data.willChange = true;
                    }
                    else if (compress) {
                        data.willChange = true;
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
            return this.resource.application.userSettings;
        }
    }

    const { STRING } = squared.base.lib.regex;
    const { UNABLE_TO_FINALIZE_DOCUMENT, reject: reject$1 } = squared.lib.error;
    const { escapePattern, isPlainObject: isPlainObject$1, splitSome } = squared.lib.util;
    const { trimBoth } = squared.base.lib.util;
    const REGEXP_VAR = new RegExp(STRING.CSS_VARVALUE + '|' + STRING.CSS_VARNAME, 'g');
    const REGEXP_VARNAME = new RegExp(STRING.CSS_VARNAME, 'g');
    const REGEXP_VARVALUE = new RegExp(STRING.CSS_VARVALUE, 'g');
    class Application extends squared.base.Application {
        constructor() {
            super(...arguments);
            this.extensions = [];
            this.systemName = 'chrome';
            this._cssVariables = {};
            this._cssUsedVariables = {};
            this._cssUsedFontFace = {};
            this._cssUsedKeyframes = {};
            this._cssUnusedSelectors = {};
            this._cssUnusedMedia = {};
            this._cssUnusedSupports = {};
        }
        init() {
            this.session.usedSelector = function (sessionId, rule) {
                var _a, _b, _c, _d, _e;
                const { fontFamily, animationName } = rule.style;
                let variables, usedVariables, usedFontFace, usedKeyframes, match;
                while (match = REGEXP_VAR.exec(rule.cssText)) {
                    if (match[3]) {
                        if (!usedVariables) {
                            usedVariables = (_a = this._cssUsedVariables)[sessionId] || (_a[sessionId] = new Set());
                        }
                        usedVariables.add(match[3]);
                    }
                }
                while (match = REGEXP_VARVALUE.exec(rule.cssText)) {
                    if (!variables) {
                        variables = (_b = this._cssVariables)[sessionId] || (_b[sessionId] = {});
                    }
                    (variables[_c = match[1]] || (variables[_c] = new Set())).add(match[2].trim());
                }
                if (fontFamily) {
                    if (!usedFontFace) {
                        usedFontFace = (_d = this._cssUsedFontFace)[sessionId] || (_d[sessionId] = new Set());
                    }
                    splitSome(fontFamily, value => {
                        usedFontFace.add(trimBoth(value));
                    });
                }
                if (animationName) {
                    if (!usedKeyframes) {
                        usedKeyframes = (_e = this._cssUsedKeyframes)[sessionId] || (_e[sessionId] = new Set());
                    }
                    splitSome(animationName, value => {
                        usedKeyframes.add(value);
                    });
                }
                REGEXP_VAR.lastIndex = 0;
                REGEXP_VARVALUE.lastIndex = 0;
            };
            this.session.unusedSelector = function (sessionId, rule, selector, hostElement) {
                var _a;
                if (!hostElement) {
                    ((_a = this._cssUnusedSelectors)[sessionId] || (_a[sessionId] = new Set())).add(selector);
                }
            };
            this.session.unusedMedia = function (sessionId, rule, condition, hostElement) {
                var _a;
                if (!hostElement) {
                    ((_a = this._cssUnusedMedia)[sessionId] || (_a[sessionId] = new Set())).add(condition);
                }
            };
            this.session.unusedSupports = function (sessionId, rule, condition, hostElement) {
                var _a;
                if (!hostElement) {
                    ((_a = this._cssUnusedSupports)[sessionId] || (_a[sessionId] = new Set())).add(condition);
                }
            };
            super.init();
        }
        reset() {
            this._cssVariables = {};
            this._cssUsedVariables = {};
            this._cssUsedFontFace = {};
            this._cssUsedKeyframes = {};
            this._cssUnusedSelectors = {};
            this._cssUnusedMedia = {};
            this._cssUnusedSupports = {};
            super.reset();
        }
        insertNode(processing, element) {
            if (element.nodeName[0] === '#') {
                if (this.getUserSetting(processing, 'excludePlainText')) {
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
            var _a;
            const result = await this.parseDocument();
            if (!result) {
                return reject$1(UNABLE_TO_FINALIZE_DOCUMENT);
            }
            const sessionId = result.sessionId;
            const processing = this.getProcessing(sessionId);
            const resourceId = processing.resourceId;
            const dataSource = [];
            const assetMap = new Map();
            const nodeMap = new Map();
            const appendMap = new Map();
            options = Object.assign(Object.assign({}, options), { saveAsWebPage: true, sessionId, resourceId, assetMap, nodeMap, appendMap });
            const retainUsedStyles = options.retainUsedStyles;
            const retainUsedStylesValue = retainUsedStyles ? retainUsedStyles.filter(value => typeof value === 'string') : [];
            const createSet = (values) => {
                const items = [];
                values.forEach(value => !items.includes(value) && items.push(value));
                return items;
            };
            if (options.removeUnusedVariables) {
                const values = this._cssVariables[sessionId];
                let variables = createSet(Array.from(this._cssUsedVariables[sessionId] || []).concat(retainUsedStylesValue.filter(value => value.startsWith('--'))));
                if (values) {
                    const nested = new Set();
                    for (const name of variables) {
                        (function extractName(data) {
                            if (data) {
                                const pattern = new RegExp(REGEXP_VARNAME);
                                let match;
                                for (const value of data) {
                                    while (match = pattern.exec(value)) {
                                        nested.add(match[1]);
                                        extractName(values[match[1]]);
                                    }
                                    pattern.lastIndex = 0;
                                }
                            }
                        })(values[name]);
                    }
                    if (nested.size) {
                        variables.forEach(name => nested.add(name));
                        variables = Array.from(nested);
                    }
                }
                options.usedVariables = variables;
                delete options.removeUnusedVariables;
            }
            if (options.removeUnusedFontFace) {
                options.usedFontFace = createSet(Array.from(this._cssUsedFontFace[sessionId] || []).concat(retainUsedStylesValue.filter(value => value.startsWith('|font-face:') && value.endsWith('|')).map((value) => trimBoth(value, '|').substring(10).trim())));
                delete options.removeUnusedFontFace;
            }
            if (options.removeUnusedKeyframes) {
                options.usedKeyframes = createSet(Array.from(this._cssUsedKeyframes[sessionId] || []).concat(retainUsedStylesValue.filter(value => value.startsWith('|keyframes:') && value.endsWith('|')).map((value) => trimBoth(value, '|').substring(10).trim())));
                delete options.removeUnusedKeyframes;
            }
            if (options.removeUnusedMedia) {
                const unusedMedia = this._cssUnusedMedia[sessionId];
                if (unusedMedia) {
                    const queries = [];
                    const exclusions = retainUsedStylesValue.filter(value => value.startsWith('|media:') && value.endsWith('|')).map((value) => trimBoth(value, '|').substring(6).trim());
                    unusedMedia.forEach(value => !exclusions.includes(value) && queries.push(value));
                    if (queries.length) {
                        options.unusedMedia = queries;
                    }
                }
                delete options.removeUnusedMedia;
            }
            if (options.removeUnusedSupports) {
                const unusedSupports = this._cssUnusedSupports[sessionId];
                if (unusedSupports) {
                    const supports = [];
                    const exclusions = retainUsedStylesValue.filter(value => value.startsWith('|supports:') && value.endsWith('|')).map((value) => trimBoth(value, '|').substring(9).trim());
                    for (const value of unusedSupports) {
                        if (!exclusions.includes(value)) {
                            supports.push(value);
                        }
                    }
                    if (supports.length) {
                        options.unusedSupports = supports;
                    }
                }
                delete options.removeUnusedSupports;
            }
            if (options.removeUnusedClasses || options.removeUnusedPseudoClasses) {
                const unusedSelectors = this._cssUnusedSelectors[sessionId];
                if (unusedSelectors) {
                    const styles = [];
                    for (const value of unusedSelectors) {
                        if ((value.indexOf(':') !== -1 ? options.removeUnusedPseudoClasses : options.removeUnusedClasses) && (!retainUsedStyles || !retainUsedStyles.find(pattern => typeof pattern === 'string' ? pattern === value : pattern.test(value)))) {
                            styles.push(value);
                        }
                    }
                    if (styles.length) {
                        options.unusedStyles = styles;
                    }
                }
                delete options.removeUnusedClasses;
                delete options.removeUnusedPseudoClasses;
            }
            const uri = (_a = options.config) === null || _a === void 0 ? void 0 : _a.uri;
            if (uri) {
                const commands = await this.fileHandler.loadConfig(uri, options);
                if (commands) {
                    const documentHandler = this.userSettings.outputDocumentHandler;
                    const paramMap = new Map();
                    const replaceParams = (param) => {
                        const type = typeof param;
                        if (param && (type === 'object' || type === 'string')) {
                            const current = type === 'object' ? JSON.stringify(param) : param;
                            let output = current;
                            for (const [pattern, value] of paramMap.values()) {
                                output = output.replace(pattern, (...capture) => {
                                    const quote = capture[1];
                                    if (quote) {
                                        return quote + value.replace(new RegExp(`(?:^${quote}|([^\\\\])${quote})`, 'g'), (...leading) => (leading[1] || '') + '\\' + quote) + quote;
                                    }
                                    return value;
                                });
                            }
                            if (output !== current) {
                                if (type === 'object') {
                                    try {
                                        return JSON.parse(output);
                                    }
                                    catch (_a) {
                                    }
                                }
                                else {
                                    return output;
                                }
                            }
                        }
                        return param;
                    };
                    if (location.search) {
                        new URLSearchParams(location.search).forEach((value, key) => paramMap.set(key, [new RegExp(`(["'])?\\{\\{\\s*${escapePattern(key)}\\s*\\}\\}\\1`, 'g'), value]));
                    }
                    for (const item of commands) {
                        if (item.selector) {
                            const type = item.type;
                            let dataSrc = isPlainObject$1(item.dataSource) ? item.dataSource : null, dataCloud = isPlainObject$1(item.cloudDatabase) ? item.cloudDatabase : null;
                            if (paramMap.size) {
                                const checkValues = (data) => {
                                    if (data) {
                                        for (const attr in data) {
                                            if (attr !== 'value') {
                                                data[attr] = replaceParams(data[attr]);
                                            }
                                        }
                                    }
                                };
                                checkValues(dataSrc);
                                checkValues(dataCloud);
                            }
                            dataSrc && (dataSrc = Object.assign(Object.assign({ document: item.document || File.copyDocument(documentHandler) }, dataSrc), { type }));
                            dataCloud && (dataCloud = Object.assign(Object.assign({ document: item.document || File.copyDocument(documentHandler) }, dataSrc), { type, source: 'cloud' }));
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
                                            let items = appendMap.get(element);
                                            if (!items) {
                                                appendMap.set(element, items = []);
                                            }
                                            items.push(Object.assign({}, item));
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
                const elements = document.querySelectorAll('*');
                const cache = {};
                const items = options.dataSource || (options.dataSource = []);
                for (const [element, data] of dataSource) {
                    const node = File.createTagNode(element, elements, cache);
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

    class Node extends squared.base.Node {
    }

    const settings = {
        builtInExtensions: [],
        preloadImages: false,
        preloadFonts: false,
        preloadCustomElements: false,
        excludePlainText: true,
        createElementMap: true,
        pierceShadowRoot: true,
        showErrorMessages: false,
        webSocketPort: 80,
        webSocketSecurePort: 443,
        formatUUID: "8-4-4-4-12",
        formatDictionary: "0123456789abcdef",
        outputDocumentHandler: "chrome",
        outputEmptyCopyDirectory: false,
        outputTasks: {},
        outputWatch: {},
        outputArchiveName: "chrome-data",
        outputArchiveFormat: "zip",
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
        return Object.assign(options = {}, { assets, filename });
    }
    const checkFileName = (value, type) => value || `${application.userSettings.outputArchiveName}-${type}`;
    const appBase = {
        base: {
            Application,
            Extension,
            File,
            Node
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
            application = new Application(4 /* CHROME */, Node, squared.base.Controller, squared.base.ExtensionManager, squared.base.Resource);
            file = new File(application.resourceHandler);
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
