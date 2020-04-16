/* squared.base 1.6.0
   https://github.com/anpham6/squared */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory((global.squared = global.squared || {}, global.squared.base = {})));
}(this, (function (exports) { 'use strict';

    class NodeList extends squared.lib.base.Container {
        constructor(children) {
            super(children);
            this._currentId = 0;
        }
        append(node, delegate = false, cascade = false) {
            var _a;
            super.append(node);
            if (delegate) {
                (_a = this.afterAppend) === null || _a === void 0 ? void 0 : _a.call(this, node, cascade);
            }
            return this;
        }
        reset() {
            this._currentId = 0;
            this.clear();
            return this;
        }
        get nextId() {
            return ++this._currentId;
        }
    }

    const $lib = squared.lib;
    const { STRING, XML } = $lib.regex;
    const { extractURL } = $lib.css;
    const { fromLastIndexOf, fromMimeType, hasMimeType, randomUUID } = $lib.util;
    class Resource {
        reset() {
            const ASSETS = Resource.ASSETS;
            for (const name in ASSETS) {
                ASSETS[name].clear();
            }
        }
        addImage(element) {
            var _a;
            if (element === null || element === void 0 ? void 0 : element.complete) {
                const uri = element.src;
                if (uri.startsWith('data:image/')) {
                    const match = new RegExp(`^${STRING.DATAURI}$`).exec(uri);
                    if (match) {
                        const mimeType = match[1].split(XML.DELIMITER);
                        this.addRawData(uri, mimeType[0].trim(), ((_a = mimeType[1]) === null || _a === void 0 ? void 0 : _a.trim()) || 'base64', match[2], element.naturalWidth, element.naturalHeight);
                    }
                }
                if (uri !== '') {
                    Resource.ASSETS.image.set(uri, { width: element.naturalWidth, height: element.naturalHeight, uri });
                }
            }
        }
        addVideo(uri, mimeType) {
            Resource.ASSETS.video.set(uri, { uri, mimeType });
        }
        addAudio(uri, mimeType) {
            Resource.ASSETS.audio.set(uri, { uri, mimeType });
        }
        addFont(data) {
            const fonts = Resource.ASSETS.fonts;
            const fontFamily = data.fontFamily.trim().toLowerCase();
            data.fontFamily = fontFamily;
            const items = fonts.get(fontFamily);
            if (items) {
                items.push(data);
            }
            else {
                fonts.set(fontFamily, [data]);
            }
        }
        addRawData(uri, mimeType, encoding, content, width = 0, height = 0) {
            mimeType = mimeType.toLowerCase();
            encoding = encoding.toLowerCase();
            let base64;
            if (encoding === 'base64') {
                base64 = content;
                if (mimeType === 'image/svg+xml') {
                    content = window.atob(content);
                }
            }
            else {
                content = content.replace(/\\(["'])/g, (match, ...capture) => capture[0]);
            }
            const imageMimeType = this.mimeTypeMap.image;
            if (imageMimeType === '*' || imageMimeType.includes(mimeType)) {
                const origin = location.origin;
                const ext = fromMimeType(mimeType);
                const filename = uri.endsWith('.' + ext) ? fromLastIndexOf(uri, '/') : this.randomUUID + '.' + ext;
                Resource.ASSETS.rawData.set(uri, {
                    pathname: uri.startsWith(origin) ? uri.substring(origin.length + 1, uri.lastIndexOf('/')) : '',
                    filename,
                    content,
                    base64,
                    mimeType,
                    width,
                    height
                });
                return filename;
            }
            return '';
        }
        getImage(uri) {
            return Resource.ASSETS.image.get(uri);
        }
        getVideo(uri) {
            return Resource.ASSETS.video.get(uri);
        }
        getAudio(uri) {
            return Resource.ASSETS.audio.get(uri);
        }
        getFont(fontFamily, fontStyle = 'normal', fontWeight) {
            const font = Resource.ASSETS.fonts.get(fontFamily.trim().toLowerCase());
            if (font) {
                const mimeType = this.mimeTypeMap.font;
                return font.find(item => item.fontStyle === fontStyle && (!fontWeight || item.fontWeight === parseInt(fontWeight)) && (hasMimeType(mimeType, item.srcFormat) || item.srcUrl && hasMimeType(mimeType, item.srcUrl)));
            }
            return undefined;
        }
        getRawData(uri) {
            if (uri.startsWith('url(')) {
                uri = extractURL(uri);
                if (uri === '') {
                    return undefined;
                }
            }
            return Resource.ASSETS.rawData.get(uri);
        }
        setFileHandler(instance) {
            instance.resource = this;
            this.fileHandler = instance;
        }
        get mimeTypeMap() {
            return this.controllerSettings.mimeType;
        }
        get randomUUID() {
            return randomUUID();
        }
    }
    Resource.KEY_NAME = 'squared.resource';
    Resource.ASSETS = {
        ids: new Map(),
        fonts: new Map(),
        image: new Map(),
        video: new Map(),
        audio: new Map(),
        rawData: new Map()
    };
    Resource.canCompressImage = (filename) => /\.(png|jpg|jpeg)$/i.test(filename);

    var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    const $lib$1 = squared.lib;
    const { getSpecificity, getStyle, hasComputedStyle, insertStyleSheetRule, parseSelectorText, checkMediaRule } = $lib$1.css;
    const { isTextNode } = $lib$1.dom;
    const { convertCamelCase, isString, objectMap, resolvePath } = $lib$1.util;
    const { CHAR, FILE, STRING: STRING$1, XML: XML$1 } = $lib$1.regex;
    const { getElementCache, setElementCache } = $lib$1.session;
    const { image: ASSET_IMAGE, rawData: ASSET_RAWDATA } = Resource.ASSETS;
    const REGEX_MEDIATEXT = /all|screen/;
    const REGEX_BACKGROUND = /^background/;
    const REGEX_IMPORTANT = /\s*([a-z-]+):[^!;]+!important;/g;
    const REGEX_FONTFACE = /\s*@font-face\s*{([^}]+)}\s*/;
    const REGEX_FONTFAMILY = /\s*font-family:[^\w]*([^'";]+)/;
    const REGEX_FONTSRC = /\s*src:\s*([^;]+);/;
    const REGEX_FONTSTYLE = /\s*font-style:\s*(\w+)\s*;/;
    const REGEX_FONTWEIGHT = /\s*font-weight:\s*(\d+)\s*;/;
    const REGEX_URL = /\s*(url|local)\((?:["']([^'")]+)["']|([^)]+))\)(?:\s*format\(["']?([\w-]+)["']?\))?\s*/;
    const REGEX_DATAURI = new RegExp(`url\\(["']?(${STRING$1.DATAURI})["']?\\),?\\s*`, 'g');
    function addImageSrc(uri, width = 0, height = 0) {
        if (uri !== '') {
            const image = ASSET_IMAGE.get(uri);
            if (width > 0 && height > 0 || !image || image.width === 0 || image.height === 0) {
                ASSET_IMAGE.set(uri, { width, height, uri });
            }
        }
    }
    function parseSrcSet(value) {
        if (value !== '') {
            value.split(XML$1.SEPARATOR).forEach(uri => {
                if (uri !== '') {
                    addImageSrc(resolvePath(uri.split(CHAR.SPACE)[0]));
                }
            });
        }
    }
    function getImageSvgAsync(value) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield fetch(value, { method: 'GET', headers: new Headers({ 'Accept': 'application/xhtml+xml, image/svg+xml', 'Content-Type': 'image/svg+xml' }) })).text();
        });
    }
    const isSvg = (value) => FILE.SVG.test(value);
    const parseConditionText = (rule, value) => { var _a; return ((_a = new RegExp(`\\s*@${rule}([^{]+)`).exec(value)) === null || _a === void 0 ? void 0 : _a[1].trim()) || value; };
    class Application {
        constructor(framework, nodeConstructor, ControllerConstructor, ResourceConstructor, ExtensionManagerConstructor) {
            this.framework = framework;
            this.initializing = false;
            this.closed = false;
            this.rootElements = new Set();
            this.session = {
                active: []
            };
            this.processing = {
                cache: new NodeList(),
                excluded: new NodeList(),
                sessionId: ''
            };
            this._cascadeAll = false;
            const cache = this.processing.cache;
            this._cache = cache;
            this._controllerHandler = new ControllerConstructor(this, cache);
            this._resourceHandler = new ResourceConstructor(this, cache);
            this._extensionManager = new ExtensionManagerConstructor(this, cache);
            this._afterInsertNode = this._controllerHandler.afterInsertNode;
            this.Node = nodeConstructor;
        }
        copyToDisk(directory, options) {
            var _a;
            (_a = this.fileHandler) === null || _a === void 0 ? void 0 : _a.copyToDisk(directory, options);
        }
        appendToArchive(pathname, options) {
            var _a;
            (_a = this.fileHandler) === null || _a === void 0 ? void 0 : _a.appendToArchive(pathname, options);
        }
        saveToArchive(filename, options) {
            var _a;
            (_a = this.fileHandler) === null || _a === void 0 ? void 0 : _a.saveToArchive(filename || this.userSettings.outputArchiveName, options);
        }
        createFrom(format, options) {
            var _a;
            (_a = this.fileHandler) === null || _a === void 0 ? void 0 : _a.createFrom(format, options);
        }
        appendFromArchive(filename, options) {
            var _a;
            (_a = this.fileHandler) === null || _a === void 0 ? void 0 : _a.appendFromArchive(filename, options);
        }
        reset() {
            var _a;
            const processing = this.processing;
            processing.cache.reset();
            processing.excluded.clear();
            processing.sessionId = '';
            this.session.active.length = 0;
            this.controllerHandler.reset();
            this.resourceHandler.reset();
            (_a = this.fileHandler) === null || _a === void 0 ? void 0 : _a.reset();
            this.extensions.forEach(ext => ext.subscribers.clear());
            this.closed = false;
        }
        parseDocument(...elements) {
            const { controllerHandler: controller, resourceHandler: resource } = this;
            this.initializing = false;
            this.rootElements.clear();
            const sessionId = controller.generateSessionId;
            this.processing.sessionId = sessionId;
            this.session.active.push(sessionId);
            controller.sessionId = sessionId;
            controller.init();
            this.setStyleMap();
            const preloaded = [];
            const preloadImages = this.userSettings.preloadImages;
            const imageElements = [];
            const styleElement = insertStyleSheetRule('html > body { overflow: hidden !important; }');
            const removePreloaded = () => {
                this.initializing = false;
                preloaded.forEach(image => {
                    if (image.parentElement) {
                        documentRoot.removeChild(image);
                    }
                });
                preloaded.length = 0;
            };
            let THEN;
            let CATCH;
            const resumeThread = () => {
                removePreloaded();
                this.extensions.forEach(ext => ext.beforeParseDocument());
                for (const element of this.rootElements) {
                    const node = this.createCache(element);
                    if (node) {
                        this.afterCreateCache(node);
                    }
                }
                this.extensions.forEach(ext => ext.afterParseDocument());
                try {
                    document.head.removeChild(styleElement);
                }
                catch (_a) {
                }
                if (typeof THEN === 'function') {
                    THEN.call(this);
                }
            };
            if (elements.length === 0) {
                elements.push(document.body);
            }
            elements.forEach(value => {
                let element;
                if (typeof value === 'string') {
                    element = document.getElementById(value);
                }
                else if (hasComputedStyle(value)) {
                    element = value;
                }
                else {
                    return;
                }
                if (element) {
                    this.rootElements.add(element);
                }
            });
            const documentRoot = this.rootElements.values().next().value;
            if (preloadImages) {
                for (const element of this.rootElements) {
                    element.querySelectorAll('picture > source').forEach((source) => parseSrcSet(source.srcset));
                    element.querySelectorAll('video').forEach((source) => addImageSrc(source.poster));
                    element.querySelectorAll('input[type=image]').forEach((image) => addImageSrc(image.src, image.width, image.height));
                }
                for (const image of ASSET_IMAGE.values()) {
                    const uri = image.uri;
                    if (isSvg(uri)) {
                        imageElements.push(uri);
                    }
                    else if (image.width === 0 || image.height === 0) {
                        const element = document.createElement('img');
                        element.src = uri;
                        if (element.naturalWidth > 0 && element.naturalHeight > 0) {
                            image.width = element.naturalWidth;
                            image.height = element.naturalHeight;
                        }
                        else {
                            documentRoot.appendChild(element);
                            preloaded.push(element);
                        }
                    }
                }
            }
            for (const [uri, data] of ASSET_RAWDATA.entries()) {
                const mimeType = data.mimeType;
                if ((mimeType === null || mimeType === void 0 ? void 0 : mimeType.startsWith('image/')) && !mimeType.endsWith('svg+xml')) {
                    const element = document.createElement('img');
                    element.src = `data:${mimeType};${data.base64 ? `base64,${data.base64}` : data.content}`;
                    const { naturalWidth: width, naturalHeight: height } = element;
                    if (width > 0 && height > 0) {
                        data.width = width;
                        data.height = height;
                        ASSET_IMAGE.set(uri, { width, height, uri: data.filename });
                    }
                    else {
                        document.body.appendChild(element);
                        preloaded.push(element);
                    }
                }
            }
            for (const element of this.rootElements) {
                element.querySelectorAll('img').forEach((image) => {
                    if (isSvg(image.src)) {
                        if (preloadImages) {
                            imageElements.push(image.src);
                        }
                    }
                    else {
                        if (preloadImages) {
                            parseSrcSet(image.srcset);
                        }
                        if (image.complete) {
                            resource.addImage(image);
                        }
                        else if (preloadImages) {
                            imageElements.push(image);
                        }
                    }
                });
            }
            if (imageElements.length) {
                this.initializing = true;
                Promise.all(objectMap(imageElements, image => {
                    return new Promise((resolve, reject) => {
                        if (typeof image === 'string') {
                            resolve(getImageSvgAsync(image));
                        }
                        else {
                            image.addEventListener('load', () => resolve(image));
                            image.addEventListener('error', () => reject(image));
                        }
                    });
                }))
                    .then((result) => {
                    const length = result.length;
                    for (let i = 0; i < length; ++i) {
                        const value = result[i];
                        if (typeof value === 'string') {
                            const uri = imageElements[i];
                            if (typeof uri === 'string') {
                                resource.addRawData(uri, 'image/svg+xml', 'utf8', value);
                            }
                        }
                        else {
                            resource.addImage(value);
                        }
                    }
                    resumeThread();
                })
                    .catch((error) => {
                    let target = error;
                    if (error instanceof Event) {
                        target = error.target;
                    }
                    const message = target instanceof HTMLImageElement ? target.src : '';
                    if (CATCH) {
                        if (!(error instanceof Error)) {
                            error = new Error(message ? `FAIL: ${message}` : 'Unable to preload images.');
                        }
                        removePreloaded();
                        CATCH(error, resumeThread);
                    }
                    else if (!this.userSettings.showErrorMessages || !isString(message) || confirm(`FAIL: ${message}`)) {
                        resumeThread();
                    }
                    else {
                        removePreloaded();
                    }
                });
            }
            else {
                resumeThread();
            }
            const Result = class {
                then(callback) {
                    if (imageElements.length) {
                        THEN = callback;
                    }
                    else {
                        callback();
                    }
                    return this;
                }
                catch(callback) {
                    CATCH = callback;
                    return this;
                }
            };
            return new Result();
        }
        parseDocumentAsync(...elements) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.parseDocument(...elements);
            });
        }
        createCache(documentRoot) {
            const node = this.createRootNode(documentRoot);
            if (node) {
                this.controllerHandler.sortInitialCache();
            }
            return node;
        }
        toString() {
            return '';
        }
        createRootNode(element) {
            const processing = this.processing;
            const cache = processing.cache;
            cache.clear();
            processing.excluded.clear();
            this._cascadeAll = false;
            const extensions = this.extensionsCascade;
            const node = this.cascadeParentNode(element, 0, extensions.length ? extensions : undefined);
            if (node) {
                const parent = new this.Node(0, processing.sessionId, element.parentElement || document.body, this._afterInsertNode);
                node.parent = parent;
                node.actualParent = parent;
                node.childIndex = 0;
                node.documentRoot = true;
            }
            processing.node = node;
            cache.afterAppend = undefined;
            return node;
        }
        cascadeParentNode(parentElement, depth, extensions) {
            const node = this.insertNode(parentElement);
            if (node) {
                const { controllerHandler: controller, processing } = this;
                const cache = processing.cache;
                node.depth = depth;
                if (depth === 0) {
                    cache.append(node);
                }
                if (controller.preventNodeCascade(parentElement)) {
                    return node;
                }
                const { childElementCount, childNodes } = parentElement;
                const length = childNodes.length;
                const children = new Array(length);
                const elements = new Array(childElementCount);
                let inlineText = true;
                let i = 0, j = 0, k = 0;
                while (i < length) {
                    const element = childNodes[i++];
                    let child;
                    if (element.nodeName.charAt(0) === '#') {
                        if (isTextNode(element)) {
                            child = this.insertNode(element, node);
                        }
                    }
                    else if (controller.includeElement(element)) {
                        child = this.cascadeParentNode(element, depth + 1, extensions);
                        if (child) {
                            elements[k++] = child;
                            cache.append(child);
                            inlineText = false;
                        }
                    }
                    else {
                        child = this.insertNode(element);
                        if (child) {
                            processing.excluded.append(child);
                            inlineText = false;
                        }
                    }
                    if (child) {
                        child.parent = node;
                        child.actualParent = node;
                        child.childIndex = j;
                        children[j++] = child;
                    }
                }
                children.length = j;
                elements.length = k;
                node.naturalChildren = children;
                node.naturalElements = elements;
                node.inlineText = inlineText;
                if (k > 0 && this.userSettings.createQuerySelectorMap) {
                    node.queryMap = this.createQueryMap(elements, k);
                }
            }
            return node;
        }
        createQueryMap(elements, length) {
            var _a;
            const result = [elements];
            let i = 0;
            while (i < length) {
                const childMap = elements[i++].queryMap;
                if (childMap) {
                    const q = childMap.length;
                    for (let j = 0; j < q; ++j) {
                        const k = j + 1;
                        result[k] = ((_a = result[k]) === null || _a === void 0 ? void 0 : _a.concat(childMap[j])) || childMap[j];
                    }
                }
            }
            return result;
        }
        setStyleMap() {
            let warning = false;
            const applyStyleSheet = (item) => {
                try {
                    const cssRules = item.cssRules;
                    if (cssRules) {
                        const length = cssRules.length;
                        let i = 0;
                        while (i < length) {
                            const rule = cssRules[i++];
                            switch (rule.type) {
                                case CSSRule.STYLE_RULE:
                                case CSSRule.FONT_FACE_RULE:
                                    this.applyStyleRule(rule);
                                    break;
                                case CSSRule.IMPORT_RULE:
                                    applyStyleSheet(rule.styleSheet);
                                    break;
                                case CSSRule.MEDIA_RULE:
                                    if (checkMediaRule(rule.conditionText || parseConditionText('media', rule.cssText))) {
                                        this.applyCSSRuleList(rule.cssRules);
                                    }
                                    break;
                                case CSSRule.SUPPORTS_RULE:
                                    if (CSS.supports && CSS.supports(rule.conditionText || parseConditionText('supports', rule.cssText))) {
                                        this.applyCSSRuleList(rule.cssRules);
                                    }
                                    break;
                            }
                        }
                    }
                }
                catch (error) {
                    if (this.userSettings.showErrorMessages && !warning) {
                        alert('CSS cannot be parsed inside <link> tags when loading files directly from your hard drive or from external websites. ' +
                            'Either use a local web server, embed your CSS into a <style> tag, or you can also try using a different browser. ' +
                            'See the README for more detailed instructions.\n\n' +
                            item.href + '\n\n' + error);
                        warning = true;
                    }
                }
            };
            const styleSheets = document.styleSheets;
            const length = styleSheets.length;
            let i = 0;
            while (i < length) {
                const styleSheet = styleSheets[i++];
                let mediaText;
                try {
                    mediaText = styleSheet.media.mediaText;
                }
                catch (_a) {
                }
                if (!isString(mediaText) || REGEX_MEDIATEXT.test(mediaText)) {
                    applyStyleSheet(styleSheet);
                }
            }
        }
        applyStyleRule(item) {
            var _a, _b, _c, _d, _e, _f;
            const resourceHandler = this.resourceHandler;
            const sessionId = this.processing.sessionId;
            const styleSheetHref = ((_a = item.parentStyleSheet) === null || _a === void 0 ? void 0 : _a.href) || undefined;
            const cssText = item.cssText;
            switch (item.type) {
                case CSSRule.SUPPORTS_RULE:
                    this.applyCSSRuleList(item.cssRules);
                    break;
                case CSSRule.STYLE_RULE: {
                    const cssStyle = item.style;
                    const important = {};
                    const baseMap = {};
                    const parseImageUrl = (attr) => {
                        var _a;
                        const value = baseMap[attr];
                        if (value && value !== 'initial') {
                            let result = value;
                            REGEX_DATAURI.lastIndex = 0;
                            let match;
                            while ((match = REGEX_DATAURI.exec(value)) !== null) {
                                if (match[2]) {
                                    const mimeType = match[2].split(XML$1.DELIMITER);
                                    resourceHandler.addRawData(match[1], mimeType[0].trim(), ((_a = mimeType[1]) === null || _a === void 0 ? void 0 : _a.trim()) || 'utf8', match[3]);
                                }
                                else if (this.userSettings.preloadImages) {
                                    const uri = resolvePath(match[3], styleSheetHref);
                                    if (uri !== '') {
                                        if (!resourceHandler.getImage(uri)) {
                                            addImageSrc(uri);
                                        }
                                        result = result.replace(match[0], `url("${uri}")`);
                                    }
                                }
                            }
                            baseMap[attr] = result;
                        }
                    };
                    Array.from(cssStyle).forEach(attr => baseMap[convertCamelCase(attr)] = cssStyle[attr]);
                    parseImageUrl('backgroundImage');
                    parseImageUrl('listStyleImage');
                    parseImageUrl('content');
                    REGEX_IMPORTANT.lastIndex = 0;
                    let match;
                    while ((match = REGEX_IMPORTANT.exec(cssText)) !== null) {
                        const attr = convertCamelCase(match[1]);
                        switch (attr) {
                            case 'margin':
                                important.marginTop = true;
                                important.marginRight = true;
                                important.marginBottom = true;
                                important.marginLeft = true;
                                break;
                            case 'padding':
                                important.paddingTop = true;
                                important.paddingRight = true;
                                important.paddingBottom = true;
                                important.paddingLeft = true;
                                break;
                            case 'background':
                                important.backgroundColor = true;
                                important.backgroundImage = true;
                                important.backgroundSize = true;
                                important.backgroundRepeat = true;
                                important.backgroundPositionX = true;
                                important.backgroundPositionY = true;
                                break;
                            case 'backgroundPosition':
                                important.backgroundPositionX = true;
                                important.backgroundPositionY = true;
                                break;
                            case 'border':
                                important.borderTopStyle = true;
                                important.borderRightStyle = true;
                                important.borderBottomStyle = true;
                                important.borderLeftStyle = true;
                                important.borderTopWidth = true;
                                important.borderRightWidth = true;
                                important.borderBottomWidth = true;
                                important.borderLeftWidth = true;
                                important.borderTopColor = true;
                                important.borderRightColor = true;
                                important.borderBottomColor = true;
                                important.borderLeftColor = true;
                                break;
                            case 'borderStyle':
                                important.borderTopStyle = true;
                                important.borderRightStyle = true;
                                important.borderBottomStyle = true;
                                important.borderLeftStyle = true;
                                break;
                            case 'borderWidth':
                                important.borderTopWidth = true;
                                important.borderRightWidth = true;
                                important.borderBottomWidth = true;
                                important.borderLeftWidth = true;
                                break;
                            case 'borderColor':
                                important.borderTopColor = true;
                                important.borderRightColor = true;
                                important.borderBottomColor = true;
                                important.borderLeftColor = true;
                                break;
                            case 'font':
                                important.fontFamily = true;
                                important.fontStyle = true;
                                important.fontSize = true;
                                important.fontWeight = true;
                                important.lineHeight = true;
                                break;
                        }
                        important[attr] = true;
                    }
                    parseSelectorText(item.selectorText, true).forEach(selectorText => {
                        const specificity = getSpecificity(selectorText);
                        const [selector, target] = selectorText.split('::');
                        const targetElt = target ? '::' + target : '';
                        document.querySelectorAll(selector || '*').forEach((element) => {
                            const attrStyle = `styleMap${targetElt}`;
                            const attrSpecificity = `styleSpecificity${targetElt}`;
                            const styleData = getElementCache(element, attrStyle, sessionId);
                            if (styleData) {
                                const specificityData = getElementCache(element, attrSpecificity, sessionId) || {};
                                for (const attr in baseMap) {
                                    const previous = specificityData[attr];
                                    const revised = specificity + (important[attr] ? 1000 : 0);
                                    if (previous === undefined || revised >= previous) {
                                        const value = baseMap[attr];
                                        if (value === 'initial' && REGEX_BACKGROUND.test(attr)) {
                                            if (cssStyle.background === 'none') {
                                                delete styleData[attr];
                                            }
                                        }
                                        else {
                                            styleData[attr] = value;
                                        }
                                        specificityData[attr] = revised;
                                    }
                                }
                            }
                            else {
                                const styleMap = Object.assign({}, baseMap);
                                const specificityData = {};
                                for (const attr in styleMap) {
                                    specificityData[attr] = specificity + (important[attr] ? 1000 : 0);
                                }
                                setElementCache(element, `style${targetElt}`, '0', getStyle(element, targetElt));
                                setElementCache(element, 'sessionId', '0', sessionId);
                                setElementCache(element, attrStyle, sessionId, styleMap);
                                setElementCache(element, attrSpecificity, sessionId, specificityData);
                            }
                        });
                    });
                    break;
                }
                case CSSRule.FONT_FACE_RULE: {
                    const attr = (_b = REGEX_FONTFACE.exec(cssText)) === null || _b === void 0 ? void 0 : _b[1];
                    if (attr) {
                        const fontFamily = (((_c = REGEX_FONTFAMILY.exec(attr)) === null || _c === void 0 ? void 0 : _c[1]) || '').trim();
                        const match = (((_d = REGEX_FONTSRC.exec(attr)) === null || _d === void 0 ? void 0 : _d[1]) || '').split(XML$1.SEPARATOR);
                        if (fontFamily !== '' && match.length) {
                            const fontStyle = ((_e = REGEX_FONTSTYLE.exec(attr)) === null || _e === void 0 ? void 0 : _e[1].toLowerCase()) || 'normal';
                            const fontWeight = parseInt(((_f = REGEX_FONTWEIGHT.exec(attr)) === null || _f === void 0 ? void 0 : _f[1]) || '400');
                            match.forEach(value => {
                                var _a;
                                const urlMatch = REGEX_URL.exec(value);
                                if (urlMatch) {
                                    let srcUrl;
                                    let srcLocal;
                                    const url = (urlMatch[2] || urlMatch[3]).trim();
                                    if (urlMatch[1] === 'url') {
                                        srcUrl = resolvePath(url, styleSheetHref);
                                    }
                                    else {
                                        srcLocal = url;
                                    }
                                    resourceHandler.addFont({
                                        fontFamily,
                                        fontWeight,
                                        fontStyle,
                                        srcUrl,
                                        srcLocal,
                                        srcFormat: ((_a = urlMatch[4]) === null || _a === void 0 ? void 0 : _a.toLowerCase().trim()) || 'truetype'
                                    });
                                }
                            });
                        }
                    }
                    break;
                }
            }
        }
        applyCSSRuleList(rules) {
            const length = rules.length;
            let i = 0;
            while (i < length) {
                this.applyStyleRule(rules[i++]);
            }
        }
        get controllerHandler() {
            return this._controllerHandler;
        }
        get resourceHandler() {
            return this._resourceHandler;
        }
        get extensionManager() {
            return this._extensionManager;
        }
        get fileHandler() {
            return this._resourceHandler.fileHandler;
        }
        get extensionsCascade() {
            return [];
        }
        get nextId() {
            return this._cache.nextId;
        }
        get length() {
            return 0;
        }
    }
    Application.KEY_NAME = 'squared.application';

    class Controller {
        preventNodeCascade(element) {
            return false;
        }
        get generateSessionId() {
            return new Date().getTime().toString();
        }
    }

    class Extension {
        constructor(name, framework, options) {
            this.name = name;
            this.framework = framework;
            this.options = {};
            this.dependencies = [];
            this.subscribers = new Set();
            if (options) {
                Object.assign(this.options, options);
            }
        }
        require(name, preload = false) {
            this.dependencies.push({ name, preload });
        }
        beforeParseDocument() { }
        afterParseDocument() { }
        set application(value) {
            this._application = value;
            this._controller = value.controllerHandler;
        }
        get application() {
            return this._application;
        }
        get controller() {
            return this._controller;
        }
    }

    const { hasBit, isObject } = squared.lib.util;
    class ExtensionManager {
        constructor(application) {
            this.application = application;
        }
        include(ext) {
            const application = this.application;
            const extensions = application.extensions;
            let name = ext.name;
            const index = extensions.findIndex(item => item.name === name);
            if (index !== -1) {
                extensions[index] = ext;
                return true;
            }
            else {
                const framework = ext.framework;
                if (framework > 0) {
                    ext.dependencies.forEach(item => {
                        if (item.preload) {
                            name = item.name;
                            if (this.retrieve(name) === null) {
                                const extension = application.builtInExtensions[name];
                                if (extension) {
                                    this.include(extension);
                                }
                            }
                        }
                    });
                }
                if ((framework === 0 || hasBit(framework, application.framework)) && ext.dependencies.every(item => !!this.retrieve(item.name))) {
                    ext.application = application;
                    extensions.push(ext);
                    return true;
                }
            }
            return false;
        }
        exclude(ext) {
            const extensions = this.extensions;
            const length = extensions.length;
            for (let i = 0; i < length; ++i) {
                if (extensions[i] === ext) {
                    extensions.splice(i, 1);
                    return true;
                }
            }
            return false;
        }
        retrieve(name) {
            const extensions = this.extensions;
            const length = extensions.length;
            let i = 0;
            while (i < length) {
                const ext = extensions[i++];
                if (ext.name === name) {
                    return ext;
                }
            }
            return null;
        }
        optionValue(name, attr) {
            var _a;
            const options = (_a = this.retrieve(name)) === null || _a === void 0 ? void 0 : _a.options;
            return isObject(options) ? options[attr] : undefined;
        }
        optionValueAsObject(name, attr) {
            const value = this.optionValue(name, attr);
            return isObject(value) ? value : null;
        }
        optionValueAsString(name, attr) {
            const value = this.optionValue(name, attr);
            return typeof value === 'string' ? value : '';
        }
        optionValueAsNumber(name, attr) {
            const value = this.optionValue(name, attr);
            return typeof value === 'number' ? value : NaN;
        }
        optionValueAsBoolean(name, attr) {
            const value = this.optionValue(name, attr);
            return typeof value === 'boolean' ? value : false;
        }
        get extensions() {
            return this.application.extensions;
        }
    }

    const { fromLastIndexOf: fromLastIndexOf$1, isString: isString$1 } = squared.lib.util;
    const isHttpProtocol = () => location.protocol.startsWith('http');
    class File {
        constructor() {
            this.assets = [];
        }
        static downloadFile(data, filename, mimeType) {
            const blob = new Blob([data], { type: mimeType || 'application/octet-stream' });
            const url = window.URL.createObjectURL(blob);
            const element = document.createElement('a');
            element.style.setProperty('display', 'none');
            element.setAttribute('href', url);
            element.setAttribute('download', filename);
            if (!element.download) {
                element.setAttribute('target', '_blank');
            }
            const body = document.body;
            body.appendChild(element);
            element.click();
            body.removeChild(element);
            setTimeout(() => window.URL.revokeObjectURL(url), 1);
        }
        createFrom(format, options) {
            this.archiving(Object.assign(Object.assign({ filename: this.userSettings.outputArchiveName }, options), { format }));
        }
        appendFromArchive(filename, options) {
            this.archiving(Object.assign(Object.assign({ filename: this.userSettings.outputArchiveName }, options), { appendTo: filename, format: filename.substring(filename.lastIndexOf('.') + 1) }));
        }
        addAsset(data) {
            if (data.content || data.uri || data.base64) {
                const { pathname, filename } = data;
                const asset = this.assets.find(item => item.pathname === pathname && item.filename === filename);
                if (asset) {
                    Object.assign(asset, data);
                }
                else {
                    this.assets.push(data);
                }
            }
        }
        reset() {
            this.assets.length = 0;
        }
        copying(options) {
            if (isHttpProtocol()) {
                const { assets, directory } = options;
                if (isString$1(directory)) {
                    const body = assets ? assets.concat(this.assets) : this.assets;
                    if (body.length) {
                        body[0].exclusions = options.exclusions;
                        fetch('/api/assets/copy' +
                            '?to=' + encodeURIComponent(directory.trim()) +
                            '&empty=' + (this.userSettings.outputEmptyCopyDirectory ? '1' : '0'), {
                            method: 'POST',
                            headers: new Headers({ 'Accept': 'application/json, text/plain', 'Content-Type': 'application/json' }),
                            body: JSON.stringify(body)
                        })
                            .then((response) => response.json())
                            .then((result) => {
                            if (result) {
                                if (typeof options.callback === 'function') {
                                    options.callback(result);
                                }
                                if (this.userSettings.showErrorMessages) {
                                    const { application, system } = result;
                                    if (system) {
                                        alert(application + '\n\n' + system);
                                    }
                                }
                            }
                        })
                            .catch(err => {
                            if (this.userSettings.showErrorMessages) {
                                alert(`ERROR: ${err}`);
                            }
                        });
                    }
                }
            }
            else if (this.userSettings.showErrorMessages) {
                alert('SERVER (required): See README for instructions');
            }
        }
        archiving(options) {
            if (isHttpProtocol()) {
                const { assets, filename } = options;
                if (isString$1(filename)) {
                    const body = assets ? assets.concat(this.assets) : this.assets;
                    if (body.length) {
                        body[0].exclusions = options.exclusions;
                        fetch('/api/assets/archive' +
                            '?filename=' + encodeURIComponent(filename.trim()) +
                            '&format=' + (options.format || this.userSettings.outputArchiveFormat).trim().toLowerCase() +
                            '&append_to=' + encodeURIComponent((options.appendTo || '').trim()), {
                            method: 'POST',
                            headers: new Headers({ 'Accept': 'application/json, text/plain', 'Content-Type': 'application/json' }),
                            body: JSON.stringify(body)
                        })
                            .then((response) => response.json())
                            .then((result) => {
                            if (result) {
                                if (typeof options.callback === 'function') {
                                    options.callback(result);
                                }
                                const zipname = result.zipname;
                                if (isString$1(zipname)) {
                                    fetch('/api/browser/download?filepath=' + encodeURIComponent(zipname))
                                        .then((response) => response.blob())
                                        .then((blob) => File.downloadFile(blob, fromLastIndexOf$1(zipname, '/', '\\')));
                                }
                                else if (this.userSettings.showErrorMessages) {
                                    const { application, system } = result;
                                    if (system) {
                                        alert(application + '\n\n' + system);
                                    }
                                }
                            }
                        })
                            .catch(err => {
                            if (this.userSettings.showErrorMessages) {
                                alert(`ERROR: ${err}`);
                            }
                        });
                    }
                }
            }
            else if (this.userSettings.showErrorMessages) {
                alert('SERVER (required): See README for instructions');
            }
        }
    }

    const $lib$2 = squared.lib;
    const { USER_AGENT, isUserAgent } = $lib$2.client;
    const { BOX_BORDER, CSS_UNIT, TEXT_STYLE, checkStyleValue, checkWritingMode, formatPX, getInheritedStyle, getStyle: getStyle$1, hasComputedStyle: hasComputedStyle$1, isLength, isPercent, parseSelectorText: parseSelectorText$1, parseUnit } = $lib$2.css;
    const { ELEMENT_BLOCK, assignRect, getNamedItem, getRangeClientRect, newBoxRectDimension } = $lib$2.dom;
    const { CHAR: CHAR$1, CSS: CSS$1, FILE: FILE$1, XML: XML$2 } = $lib$2.regex;
    const { actualClientRect, actualTextRangeRect, deleteElementCache, getElementAsNode, getElementCache: getElementCache$1, getPseudoElt, setElementCache: setElementCache$1 } = $lib$2.session;
    const { aboveRange, belowRange, convertCamelCase: convertCamelCase$1, convertFloat, convertInt, hasBit: hasBit$1, hasValue, isNumber, isObject: isObject$1, isString: isString$2, iterateArray, spliceString, splitEnclosing } = $lib$2.util;
    const { PX, SELECTOR_ATTR, SELECTOR_G, SELECTOR_LABEL, SELECTOR_PSEUDO_CLASS } = CSS$1;
    const REGEX_BACKGROUND$1 = /\s*(url|[a-z-]+gradient)/;
    const REGEX_QUERY_LANG = /^:lang\(\s*(.+)\s*\)$/;
    const REGEX_QUERY_NTH_CHILD_OFTYPE = /^:nth(-last)?-(child|of-type)\((.+)\)$/;
    const REGEX_QUERY_NTH_CHILD_OFTYPE_VALUE = /^(-)?(\d+)?n\s*([+-]\d+)?$/;
    const REGEX_EM = /\dem$/;
    function setNaturalChildren(node) {
        var _a;
        let children;
        if (node.naturalElement) {
            const sessionId = node.sessionId;
            children = [];
            let i = 0;
            node.element.childNodes.forEach((element) => {
                const item = getElementAsNode(element, sessionId);
                if (item) {
                    item.childIndex = i++;
                    children.push(item);
                }
            });
        }
        else {
            children = (((_a = node.initial) === null || _a === void 0 ? void 0 : _a.children) || node.children).slice(0);
        }
        node.naturalChildren = children;
        return children;
    }
    function setNaturalElements(node) {
        const children = node.naturalChildren.filter(item => item.naturalElement);
        node.naturalElements = children;
        return children;
    }
    function getFlexValue(node, attr, fallback, parent) {
        const value = (parent || node).css(attr);
        if (isNumber(value)) {
            return parseFloat(value);
        }
        else if (value === 'inherit' && !parent) {
            return getFlexValue(node, attr, fallback, node.actualParent);
        }
        return fallback;
    }
    function validateQuerySelector(child, selector, index, last, adjacent) {
        var _a, _b;
        if (selector.all) {
            return true;
        }
        let tagName = selector.tagName;
        if (tagName && tagName !== child.tagName.toUpperCase()) {
            return false;
        }
        const id = selector.id;
        if (id && id !== child.elementId) {
            return false;
        }
        const { attrList, classList, notList, pseudoList } = selector;
        if (pseudoList) {
            const parent = child.actualParent;
            tagName = child.tagName;
            for (const pseudo of pseudoList) {
                switch (pseudo) {
                    case ':first-child':
                    case ':nth-child(1)':
                        if (child !== parent.firstChild) {
                            return false;
                        }
                        break;
                    case ':last-child':
                    case ':nth-last-child(1)':
                        if (child !== parent.lastChild) {
                            return false;
                        }
                        break;
                    case ':only-child':
                        if (parent.naturalElements.length > 1) {
                            return false;
                        }
                        break;
                    case ':only-of-type': {
                        let j = 0;
                        for (const item of parent.naturalElements) {
                            if (item.tagName === tagName && ++j > 1) {
                                return false;
                            }
                        }
                        break;
                    }
                    case ':first-of-type': {
                        for (const item of parent.naturalElements) {
                            if (item.tagName === tagName) {
                                if (item !== child) {
                                    return false;
                                }
                                break;
                            }
                        }
                        break;
                    }
                    case ':nth-child(n)':
                    case ':nth-last-child(n)':
                        break;
                    case ':empty':
                        if (child.element.childNodes.length) {
                            return false;
                        }
                        break;
                    case ':checked':
                        switch (tagName) {
                            case 'INPUT':
                                if (!child.toElementBoolean('checked')) {
                                    return false;
                                }
                                break;
                            case 'OPTION':
                                if (!child.toElementBoolean('selected')) {
                                    return false;
                                }
                                break;
                            default:
                                return false;
                        }
                        break;
                    case ':enabled':
                        if (!child.inputElement || child.toElementBoolean('disabled')) {
                            return false;
                        }
                        break;
                    case ':disabled':
                        if (!child.inputElement || !child.toElementBoolean('disabled')) {
                            return false;
                        }
                        break;
                    case ':read-only': {
                        const element = child.element;
                        if (element.isContentEditable || (tagName === 'INPUT' || tagName === 'TEXTAREA') && !element.readOnly) {
                            return false;
                        }
                        break;
                    }
                    case ':read-write': {
                        const element = child.element;
                        if (!element.isContentEditable || (tagName === 'INPUT' || tagName === 'TEXTAREA') && element.readOnly) {
                            return false;
                        }
                        break;
                    }
                    case ':required':
                        if (!child.inputElement || tagName === 'BUTTON' || !child.toElementBoolean('required')) {
                            return false;
                        }
                        break;
                    case ':optional':
                        if (!child.inputElement || tagName === 'BUTTON' || child.toElementBoolean('required')) {
                            return false;
                        }
                        break;
                    case ':placeholder-shown': {
                        if (!((tagName === 'INPUT' || tagName === 'TEXTAREA') && child.toElementString('placeholder') !== '')) {
                            return false;
                        }
                        break;
                    }
                    case ':default': {
                        switch (tagName) {
                            case 'INPUT': {
                                const element = child.element;
                                switch (element.type) {
                                    case 'radio':
                                    case 'checkbox':
                                        if (!element.checked) {
                                            return false;
                                        }
                                        break;
                                    default:
                                        return false;
                                }
                                break;
                            }
                            case 'OPTION':
                                if (child.element.attributes['selected'] === undefined) {
                                    return false;
                                }
                                break;
                            case 'BUTTON': {
                                const form = child.ascend({ condition: item => item.tagName === 'FORM' })[0];
                                if (form) {
                                    let valid = false;
                                    const element = child.element;
                                    iterateArray(form.element.querySelectorAll('*'), (item) => {
                                        switch (item.tagName) {
                                            case 'BUTTON':
                                                valid = element === item;
                                                return true;
                                            case 'INPUT':
                                                switch (item.type) {
                                                    case 'submit':
                                                    case 'image':
                                                        valid = element === item;
                                                        return true;
                                                }
                                                break;
                                        }
                                        return;
                                    });
                                    if (!valid) {
                                        return false;
                                    }
                                }
                                break;
                            }
                            default:
                                return false;
                        }
                        break;
                    }
                    case ':in-range':
                    case ':out-of-range': {
                        if (tagName === 'INPUT') {
                            const element = child.element;
                            const value = parseFloat(element.value);
                            if (!isNaN(value)) {
                                const min = parseFloat(element.min);
                                const max = parseFloat(element.max);
                                if (value >= min && value <= max) {
                                    if (pseudo === ':out-of-range') {
                                        return false;
                                    }
                                }
                                else if (pseudo === ':in-range') {
                                    return false;
                                }
                            }
                            else if (pseudo === ':in-range') {
                                return false;
                            }
                        }
                        else {
                            return false;
                        }
                        break;
                    }
                    case ':indeterminate':
                        if (tagName === 'INPUT') {
                            const element = child.element;
                            switch (element.type) {
                                case 'checkbox':
                                    if (!element.indeterminate) {
                                        return false;
                                    }
                                    break;
                                case 'radio':
                                    if (element.checked) {
                                        return false;
                                    }
                                    else if (element.name) {
                                        if (iterateArray((((_a = child.ascend({ condition: item => item.tagName === 'FORM' })[0]) === null || _a === void 0 ? void 0 : _a.element) || document).querySelectorAll(`input[type=radio][name="${element.name}"`), (item) => item.checked) === Number.POSITIVE_INFINITY) {
                                            return false;
                                        }
                                    }
                                    break;
                                default:
                                    return false;
                            }
                        }
                        else if (tagName === 'PROGRESS') {
                            if (child.toElementInt('value', -1) !== -1) {
                                return false;
                            }
                        }
                        else {
                            return false;
                        }
                        break;
                    case ':target': {
                        if (location.hash === '') {
                            return false;
                        }
                        else {
                            const element = child.element;
                            if (!(location.hash === `#${element.id}` || tagName === 'A' && location.hash === `#${element.name}`)) {
                                return false;
                            }
                        }
                        break;
                    }
                    case ':scope':
                        if (!last || adjacent === '>' && child !== this) {
                            return false;
                        }
                        break;
                    case ':root':
                        if (!last || adjacent) {
                            return false;
                        }
                        break;
                    case ':link':
                    case ':visited':
                    case ':any-link':
                    case ':hover':
                    case ':focus':
                    case ':focus-within':
                    case ':valid':
                    case ':invalid': {
                        const element = child.element;
                        if (iterateArray(parent.element.querySelectorAll(':scope > ' + pseudo), item => item === element) !== Number.POSITIVE_INFINITY) {
                            return false;
                        }
                        break;
                    }
                    default: {
                        let match = REGEX_QUERY_NTH_CHILD_OFTYPE.exec(pseudo);
                        if (match) {
                            const placement = match[3].trim();
                            let children = parent.naturalElements;
                            if (match[1]) {
                                children = children.slice(0).reverse();
                            }
                            const i = (match[2] === 'child' ? children.indexOf(child) : children.filter(item => item.tagName === tagName).indexOf(child)) + 1;
                            if (i > 0) {
                                if (isNumber(placement)) {
                                    if (parseInt(placement) !== i) {
                                        return false;
                                    }
                                }
                                else {
                                    switch (placement) {
                                        case 'even':
                                            if (i % 2 !== 0) {
                                                return false;
                                            }
                                            break;
                                        case 'odd':
                                            if (i % 2 === 0) {
                                                return false;
                                            }
                                            break;
                                        default: {
                                            const subMatch = REGEX_QUERY_NTH_CHILD_OFTYPE_VALUE.exec(placement);
                                            if (subMatch) {
                                                const modifier = convertInt(subMatch[3]);
                                                if (subMatch[2]) {
                                                    if (subMatch[1]) {
                                                        return false;
                                                    }
                                                    const increment = parseInt(subMatch[2]);
                                                    if (increment !== 0) {
                                                        if (i !== modifier) {
                                                            for (let j = increment;; j += increment) {
                                                                const total = increment + modifier;
                                                                if (total === i) {
                                                                    break;
                                                                }
                                                                else if (total > i) {
                                                                    return false;
                                                                }
                                                            }
                                                        }
                                                    }
                                                    else if (i !== modifier) {
                                                        return false;
                                                    }
                                                }
                                                else if (subMatch[3]) {
                                                    if (modifier > 0) {
                                                        if (subMatch[1]) {
                                                            if (i > modifier) {
                                                                return false;
                                                            }
                                                        }
                                                        else if (i < modifier) {
                                                            return false;
                                                        }
                                                    }
                                                    else {
                                                        return false;
                                                    }
                                                }
                                            }
                                            break;
                                        }
                                    }
                                }
                                continue;
                            }
                        }
                        else {
                            match = REGEX_QUERY_LANG.exec(pseudo);
                            if (match) {
                                if (((_b = child.attributes['lang']) === null || _b === void 0 ? void 0 : _b.trim().toLowerCase()) === match[1].toLowerCase()) {
                                    continue;
                                }
                            }
                        }
                        return false;
                    }
                }
            }
        }
        if (notList) {
            for (const not of notList) {
                const notData = {};
                switch (not.charAt(0)) {
                    case '.':
                        notData.classList = [not];
                        break;
                    case '#':
                        notData.id = not.substring(1);
                        break;
                    case ':':
                        notData.pseudoList = [not];
                        break;
                    case '[': {
                        SELECTOR_ATTR.lastIndex = 0;
                        const match = SELECTOR_ATTR.exec(not);
                        if (match) {
                            const caseInsensitive = match[6] === 'i';
                            let value = match[3] || match[4] || match[5] || '';
                            if (caseInsensitive) {
                                value = value.toLowerCase();
                            }
                            notData.attrList = [{
                                    key: match[1],
                                    symbol: match[2],
                                    value,
                                    caseInsensitive
                                }];
                        }
                        else {
                            continue;
                        }
                        break;
                    }
                    default:
                        if (CHAR$1.WORDDASH.test(not)) {
                            notData.tagName = not;
                        }
                        else {
                            return false;
                        }
                        break;
                }
                if (validateQuerySelector.call(this, child, notData, index, last)) {
                    return false;
                }
            }
        }
        if (classList) {
            const elementList = child.element.classList;
            for (const className of classList) {
                if (!elementList.contains(className)) {
                    return false;
                }
            }
        }
        if (attrList) {
            const attributes = child.attributes;
            for (const attr of attrList) {
                let value = attributes[attr.key];
                if (value === undefined) {
                    return false;
                }
                else {
                    const valueA = attr.value;
                    if (valueA) {
                        if (attr.caseInsensitive) {
                            value = value.toLowerCase();
                        }
                        if (attr.symbol) {
                            switch (attr.symbol) {
                                case '~':
                                    if (!value.split(CHAR$1.SPACE).includes(valueA)) {
                                        return false;
                                    }
                                    break;
                                case '^':
                                    if (!value.startsWith(valueA)) {
                                        return false;
                                    }
                                    break;
                                case '$':
                                    if (!value.endsWith(valueA)) {
                                        return false;
                                    }
                                    break;
                                case '*':
                                    if (!value.includes(valueA)) {
                                        return false;
                                    }
                                    break;
                                case '|':
                                    if (value !== valueA && !value.startsWith(valueA + '-')) {
                                        return false;
                                    }
                                    break;
                            }
                        }
                        else if (value !== valueA) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }
    function hasTextAlign(node, value, localizedValue) {
        const textAlign = node.cssAscend('textAlign', node.textElement && node.blockStatic && !node.hasPX('width'));
        return (textAlign === value || textAlign === localizedValue) && (node.blockStatic ? node.textElement && !node.hasPX('width', true, true) && !node.hasPX('maxWidth', true, true) : node.display.startsWith('inline'));
    }
    function setStyleCache(element, attr, sessionId, value, current) {
        if (current !== value) {
            element.style.setProperty(attr, value);
            if (validateCssSet(value, element.style.getPropertyValue(attr))) {
                setElementCache$1(element, attr, sessionId, value !== 'auto' ? current : '');
                return true;
            }
            return false;
        }
        return true;
    }
    function deleteStyleCache(element, attr, sessionId) {
        const value = getElementCache$1(element, attr, sessionId);
        if (value !== undefined) {
            element.style.setProperty(attr, value);
            deleteElementCache(element, attr, sessionId);
        }
    }
    function flexParent(node, direction) {
        const parent = node.actualParent;
        return (parent === null || parent === void 0 ? void 0 : parent.flexElement) === true && parent.flexdata[direction] === true;
    }
    function setDimension(node, styleMap, attr, attrMin, attrMax) {
        const valueA = styleMap[attr];
        const baseValue = node.parseUnit(valueA, attr);
        let value = Math.max(baseValue, node.parseUnit(styleMap[attrMin], attr));
        if (value === 0 && node.styleElement) {
            const element = node.element;
            switch (element.tagName) {
                case 'IMG':
                case 'INPUT':
                    if (element.type !== 'image') {
                        break;
                    }
                case 'TD':
                case 'TH':
                case 'SVG':
                case 'IFRAME':
                case 'VIDEO':
                case 'AUDIO':
                case 'CANVAS':
                case 'OBJECT':
                case 'EMBED': {
                    const size = getNamedItem(element, attr);
                    if (size !== '') {
                        value = isNumber(size) ? parseFloat(size) : node.parseUnit(size, attr);
                        if (value > 0) {
                            node.css(attr, isPercent(size) ? size : size + 'px');
                        }
                    }
                    break;
                }
            }
        }
        let maxValue = 0;
        if (baseValue > 0 && !node.imageElement) {
            const valueB = styleMap[attrMax];
            if (valueA === valueB) {
                delete styleMap[attrMax];
            }
            else {
                maxValue = node.parseUnit(valueB, attr);
                if (maxValue > 0 && maxValue <= baseValue && isLength(valueA)) {
                    maxValue = 0;
                    styleMap[attr] = valueB;
                    delete styleMap[attrMax];
                }
            }
        }
        return maxValue > 0 ? Math.min(value, maxValue) : value;
    }
    function setOverflow(node) {
        let result = 0;
        if (node.htmlElement && !node.inputElement && !node.imageElement && node.tagName !== 'HR' && !node.documentBody) {
            const element = node.element;
            const { overflowX, overflowY } = node.cssAsObject('overflowX', 'overflowY');
            if (node.hasHeight && (node.hasPX('height') || node.hasPX('maxHeight')) && (overflowY === 'scroll' || overflowY === 'auto' && element.clientHeight !== element.scrollHeight)) {
                result |= 16 /* VERTICAL */;
            }
            if ((node.hasPX('width') || node.hasPX('maxWidth')) && (overflowX === 'scroll' || overflowX === 'auto' && element.clientWidth !== element.scrollWidth)) {
                result |= 8 /* HORIZONTAL */;
            }
        }
        return result;
    }
    function convertPosition(node, attr) {
        if (!node.positionStatic) {
            const unit = node.cssInitial(attr, true);
            if (isLength(unit)) {
                return node.parseUnit(unit, attr === 'left' || attr === 'right' ? 'width' : 'height');
            }
            else if (isPercent(unit) && node.styleElement) {
                return convertFloat(node.style[attr]);
            }
        }
        return 0;
    }
    function convertBorderWidth(node, dimension, border) {
        if (!node.plainText) {
            switch (node.css(border[0])) {
                case 'none':
                case 'initial':
                case 'hidden':
                    return 0;
            }
            const width = node.css(border[1]);
            const result = isLength(width, true) ? node.parseUnit(width, dimension) : convertFloat(node.style[border[1]]);
            if (result > 0) {
                return Math.max(Math.round(result), 1);
            }
        }
        return 0;
    }
    function convertBox(node, attr, margin) {
        var _a, _b;
        switch (node.display) {
            case 'table':
                if (!margin && node.css('borderCollapse') === 'collapse') {
                    return 0;
                }
                break;
            case 'table-row':
                return 0;
            case 'table-cell':
                if (margin) {
                    switch (node.tagName) {
                        case 'TD':
                        case 'TH':
                            return 0;
                        default: {
                            const parent = node.ascend({ condition: item => item.tagName === 'TABLE' })[0];
                            if (parent) {
                                const [horizontal, vertical] = parent.css('borderSpacing').split(' ');
                                switch (attr) {
                                    case 'marginTop':
                                    case 'marginBottom':
                                        return vertical ? node.parseUnit(vertical, 'height', false) : node.parseUnit(horizontal, 'width', false);
                                    case 'marginRight':
                                        if (((_a = node.actualParent) === null || _a === void 0 ? void 0 : _a.lastChild) !== node) {
                                            return node.parseUnit(horizontal, 'width', false);
                                        }
                                    case 'marginLeft':
                                        return 0;
                                }
                            }
                            break;
                        }
                    }
                    return 0;
                }
                break;
        }
        return node.parseUnit(node.css(attr), 'width', ((_b = node.actualParent) === null || _b === void 0 ? void 0 : _b.gridElement) !== true);
    }
    const canTextAlign = (node) => node.naturalChild && (node.inlineVertical || node.length === 0) && !node.floating && node.autoMargin.horizontal !== true;
    const validateCssSet = (value, actualValue) => value === actualValue || isLength(value, true) && PX.test(actualValue);
    const soryById = (a, b) => a.id < b.id ? -1 : 1;
    class Node extends squared.lib.base.Container {
        constructor(id, sessionId = '0', element) {
            super();
            this.id = id;
            this.sessionId = sessionId;
            this.documentRoot = false;
            this.depth = -1;
            this.childIndex = Number.POSITIVE_INFINITY;
            this._element = null;
            this._data = {};
            this._documentBody = false;
            this._inlineText = false;
            if (element) {
                this._element = element;
                this._documentBody = element === document.body;
            }
            else {
                this.style = {};
                this._styleMap = {};
                this._cssStyle = {};
            }
        }
        init() {
            const element = this._element;
            if (element) {
                const styleElement = this.styleElement;
                const sessionId = this.sessionId;
                const styleMap = getElementCache$1(element, 'styleMap', sessionId) || {};
                let style;
                if (!this.pseudoElement) {
                    style = getStyle$1(element);
                    if (styleElement) {
                        const items = Array.from(element.style);
                        const length = items.length;
                        if (length) {
                            const inline = element.style;
                            let i = 0;
                            while (i < length) {
                                const attr = items[i++];
                                styleMap[convertCamelCase$1(attr)] = inline.getPropertyValue(attr);
                            }
                        }
                    }
                }
                else {
                    style = getStyle$1(element.parentElement, getPseudoElt(element, sessionId));
                }
                if (styleElement) {
                    const revisedMap = {};
                    const writingMode = style.writingMode;
                    for (let attr in styleMap) {
                        const value = styleMap[attr];
                        const alias = checkWritingMode(attr, writingMode);
                        if (alias !== '') {
                            if (!styleMap[alias]) {
                                attr = alias;
                            }
                            else {
                                continue;
                            }
                        }
                        const result = checkStyleValue(element, attr, value, style);
                        if (result !== '') {
                            revisedMap[attr] = result;
                        }
                    }
                    this._styleMap = revisedMap;
                }
                else {
                    this._styleMap = styleMap;
                }
                this.style = style;
                this._cssStyle = styleMap;
                if (sessionId !== '0') {
                    setElementCache$1(element, 'node', sessionId, this);
                }
            }
        }
        saveAsInitial(overwrite = false) {
            if (this._initial === undefined || overwrite) {
                this._initial = {
                    children: this.duplicate(),
                    styleMap: Object.assign({}, this._styleMap)
                };
            }
        }
        data(name, attr, value, overwrite = true) {
            const data = this._data;
            if (hasValue(value)) {
                let obj = data[name];
                if (!isObject$1(obj)) {
                    obj = {};
                    data[name] = obj;
                }
                if (overwrite || obj[attr] === undefined) {
                    obj[attr] = value;
                }
            }
            else if (value === null) {
                delete data[name];
                return undefined;
            }
            const stored = data[name];
            return isObject$1(stored) ? stored[attr] : undefined;
        }
        unsetCache(...attrs) {
            if (attrs.length) {
                const cached = this._cached;
                attrs.forEach(attr => {
                    switch (attr) {
                        case 'position':
                        case 'display':
                            this._cached = {};
                            return;
                        case 'width':
                            cached.actualWidth = undefined;
                        case 'minWidth':
                            cached.width = undefined;
                        case 'maxWidth':
                            cached.overflow = undefined;
                            break;
                        case 'height':
                            cached.actualHeight = undefined;
                        case 'minHeight':
                            cached.height = undefined;
                        case 'maxHeight':
                            cached.overflow = undefined;
                            break;
                        case 'verticalAlign':
                            cached.baseline = undefined;
                            break;
                        case 'textAlign':
                            cached.rightAligned = undefined;
                            cached.centerAligned = undefined;
                            break;
                        case 'top':
                        case 'bottom':
                            cached.bottomAligned = undefined;
                            break;
                        case 'backgroundColor':
                        case 'backgroundImage':
                            cached.visibleStyle = undefined;
                            break;
                        case 'float':
                            cached.floating = undefined;
                            break;
                        case 'overflowX':
                        case 'overflowY':
                            cached.overflow = undefined;
                            break;
                        default:
                            if (attr.startsWith('margin')) {
                                cached.autoMargin = undefined;
                                cached.rightAligned = undefined;
                                cached.centerAligned = undefined;
                            }
                            else if (attr.startsWith('padding')) {
                                cached.contentBoxWidth = undefined;
                                cached.contentBoxHeight = undefined;
                            }
                            else if (attr.startsWith('border')) {
                                cached.visibleStyle = undefined;
                                cached.contentBoxWidth = undefined;
                                cached.contentBoxHeight = undefined;
                            }
                            break;
                    }
                    cached[attr] = undefined;
                });
            }
            else {
                this._cached = {};
                this._textStyle = undefined;
            }
        }
        ascend(options = {}) {
            let attr = options.attr;
            if (!isString$2(attr)) {
                attr = 'actualParent';
            }
            else if (!/Parent$/i.test(attr)) {
                return [];
            }
            const { condition, including, error, every, excluding } = options;
            const result = [];
            let parent = options.startSelf ? this : this[attr];
            while (parent && parent !== excluding) {
                if (error && error(parent)) {
                    break;
                }
                if (condition) {
                    if (condition(parent)) {
                        result.push(parent);
                        if (!every) {
                            break;
                        }
                    }
                }
                else {
                    result.push(parent);
                }
                if (parent === including) {
                    break;
                }
                parent = parent[attr];
            }
            return result;
        }
        intersectX(rect, dimension = 'linear') {
            if (rect.width > 0) {
                const { left, right } = this[dimension];
                const { left: leftA, right: rightA } = rect;
                return (Math.ceil(left) >= leftA && Math.floor(left) <= rightA ||
                    right >= Math.floor(leftA) && right <= Math.ceil(rightA) ||
                    Math.ceil(leftA) >= left && Math.floor(leftA) <= right ||
                    rightA >= Math.floor(left) && rightA <= Math.ceil(right));
            }
            return false;
        }
        intersectY(rect, dimension = 'linear') {
            if (rect.height > 0) {
                const { top, bottom } = this[dimension];
                const { top: topA, bottom: bottomA } = rect;
                return (Math.ceil(top) >= topA && Math.floor(top) <= bottomA ||
                    bottom >= Math.floor(topA) && bottom <= Math.ceil(bottomA) ||
                    Math.ceil(topA) >= top && Math.floor(topA) <= bottom ||
                    bottomA >= Math.floor(top) && bottomA <= Math.ceil(bottom));
            }
            return false;
        }
        withinX(rect, dimension = 'linear') {
            if (this.pageFlow || rect.width > 0) {
                const bounds = this[dimension];
                return aboveRange(bounds.left, rect.left) && belowRange(bounds.right, rect.right);
            }
            return true;
        }
        withinY(rect, dimension = 'linear') {
            if (this.pageFlow || rect.height > 0) {
                const bounds = this[dimension];
                return Math.ceil(bounds.top) >= rect.top && Math.floor(bounds.bottom) <= rect.bottom;
            }
            return true;
        }
        outsideX(rect, dimension = 'linear') {
            if (this.pageFlow || rect.width > 0) {
                const bounds = this[dimension];
                return bounds.left < Math.floor(rect.left) || bounds.right > Math.ceil(rect.right);
            }
            return false;
        }
        outsideY(rect, dimension = 'linear') {
            if (this.pageFlow || rect.height > 0) {
                const bounds = this[dimension];
                return bounds.top < Math.floor(rect.top) || bounds.bottom > Math.ceil(rect.bottom);
            }
            return false;
        }
        css(attr, value, cache = true) {
            if (value && this.styleElement) {
                this.style[attr] = value;
                if (validateCssSet(value, this.style[attr])) {
                    this._styleMap[attr] = value;
                    if (cache) {
                        this.unsetCache(attr);
                    }
                    return value;
                }
            }
            return this._styleMap[attr] || this.styleElement && this.style[attr] || '';
        }
        cssApply(values, cache = true) {
            for (const attr in values) {
                const value = values[attr];
                if (this.css(attr, value, cache) === value && cache) {
                    this.unsetCache(attr);
                }
            }
            return this;
        }
        cssInitial(attr, modified = false, computed = false) {
            var _a;
            let value = (((_a = this._initial) === null || _a === void 0 ? void 0 : _a.styleMap) || this._styleMap)[attr] || modified && this._styleMap[attr];
            if (!value && computed) {
                value = this.style[attr];
            }
            return value || '';
        }
        cssAny(attr, ...values) {
            const result = this.css(attr);
            for (const value of values) {
                if (result === value) {
                    return true;
                }
            }
            return false;
        }
        cssInitialAny(attr, ...values) {
            for (const value of values) {
                if (this.cssInitial(attr) === value) {
                    return true;
                }
            }
            return false;
        }
        cssAscend(attr, startSelf = false) {
            let parent = startSelf ? this : this.actualParent;
            let value;
            while (parent) {
                value = parent.cssInitial(attr);
                if (value !== '') {
                    return value;
                }
                if (parent.documentBody) {
                    break;
                }
                parent = parent.actualParent;
            }
            return '';
        }
        cssSort(attr, ascending = true, duplicate = false) {
            return (duplicate ? this.duplicate() : this.children).sort((a, b) => {
                const valueA = a.toFloat(attr, a.childIndex);
                const valueB = b.toFloat(attr, b.childIndex);
                if (valueA === valueB) {
                    return 0;
                }
                else if (ascending) {
                    return valueA < valueB ? -1 : 1;
                }
                return valueA > valueB ? -1 : 1;
            });
        }
        cssPX(attr, value, negative = false, cache = false) {
            const current = this._styleMap[attr];
            if (current && isLength(current)) {
                value += parseUnit(current, this.fontSize);
                if (!negative && value < 0) {
                    value = 0;
                }
                const length = formatPX(value);
                this.css(attr, length);
                if (cache) {
                    this.unsetCache(attr);
                }
                return length;
            }
            return '';
        }
        cssSpecificity(attr) {
            var _a, _b;
            let result;
            if (this.styleElement) {
                if (this.pseudoElement) {
                    const element = this._element;
                    const sessionId = this.sessionId;
                    result = (_a = getElementCache$1(element.parentElement, `styleSpecificity${getPseudoElt(element, sessionId)}`, sessionId)) === null || _a === void 0 ? void 0 : _a[attr];
                }
                else {
                    result = (_b = getElementCache$1(this._element, 'styleSpecificity', this.sessionId)) === null || _b === void 0 ? void 0 : _b[attr];
                }
            }
            return result || 0;
        }
        cssTry(attr, value) {
            if (this.styleElement) {
                const element = this._element;
                return setStyleCache(element, attr, this.sessionId, value, getStyle$1(element).getPropertyValue(attr));
            }
            return false;
        }
        cssFinally(attrs) {
            if (this.styleElement) {
                if (typeof attrs === 'string') {
                    deleteStyleCache(this._element, attrs, this.sessionId);
                }
                else {
                    const sessionId = this.sessionId;
                    const element = this._element;
                    for (const attr in attrs) {
                        deleteStyleCache(element, attr, sessionId);
                    }
                }
            }
        }
        cssTryAll(values) {
            if (this.styleElement) {
                const sessionId = this.sessionId;
                const element = this._element;
                const style = getStyle$1(element);
                const valid = [];
                for (const attr in values) {
                    if (setStyleCache(element, attr, sessionId, values[attr], style.getPropertyValue(attr))) {
                        valid.push(attr);
                    }
                    else {
                        valid.forEach(value => this.cssFinally(value));
                        return undefined;
                    }
                }
                return values;
            }
            return undefined;
        }
        cssParent(attr, value, cache = false) {
            return this.naturalChild ? this.actualParent.css(attr, value, cache) : '';
        }
        cssCopy(node, ...attrs) {
            const styleMap = this._styleMap;
            attrs.forEach(attr => styleMap[attr] = node.css(attr));
        }
        cssCopyIfEmpty(node, ...attrs) {
            const styleMap = this._styleMap;
            attrs.forEach(attr => {
                if (!hasValue(styleMap[attr])) {
                    styleMap[attr] = node.css(attr);
                }
            });
        }
        cssAsTuple(...attrs) {
            const length = attrs.length;
            const result = new Array(length);
            let i = 0;
            while (i < length) {
                result[i] = this.css(attrs[i++]);
            }
            return result;
        }
        cssAsObject(...attrs) {
            const result = {};
            attrs.forEach(attr => result[attr] = this.css(attr));
            return result;
        }
        toInt(attr, fallback = NaN, initial = false) {
            var _a;
            const value = parseInt((initial && ((_a = this._initial) === null || _a === void 0 ? void 0 : _a.styleMap) || this._styleMap)[attr]);
            return isNaN(value) ? fallback : value;
        }
        toFloat(attr, fallback = NaN, initial = false) {
            var _a;
            const value = parseFloat((initial && ((_a = this._initial) === null || _a === void 0 ? void 0 : _a.styleMap) || this._styleMap)[attr]);
            return isNaN(value) ? fallback : value;
        }
        toElementInt(attr, fallback = NaN) {
            var _a;
            const value = parseInt((_a = this._element) === null || _a === void 0 ? void 0 : _a[attr]);
            return !isNaN(value) ? value : fallback;
        }
        toElementFloat(attr, fallback = NaN) {
            var _a;
            const value = parseFloat((_a = this._element) === null || _a === void 0 ? void 0 : _a[attr]);
            return !isNaN(value) ? value : fallback;
        }
        toElementBoolean(attr, fallback = false) {
            var _a;
            const value = (_a = this._element) === null || _a === void 0 ? void 0 : _a[attr];
            return typeof value === 'boolean' ? value : fallback;
        }
        toElementString(attr, fallback = '') {
            var _a;
            return (((_a = this._element) === null || _a === void 0 ? void 0 : _a[attr]) || fallback).toString();
        }
        parseUnit(value, dimension = 'width', parent = true, screenDimension) {
            var _a;
            if (value) {
                if (isPercent(value)) {
                    const bounds = parent && ((_a = this.absoluteParent) === null || _a === void 0 ? void 0 : _a.box) || this.bounds;
                    let result = parseFloat(value) / 100;
                    switch (dimension) {
                        case 'width':
                            result *= bounds.width;
                            break;
                        case 'height':
                            result *= bounds.height;
                            break;
                    }
                    return result;
                }
                return parseUnit(value, this.fontSize, screenDimension);
            }
            return 0;
        }
        has(attr, options) {
            var _a;
            let map;
            let not;
            let type;
            if (options) {
                ({ map, not, type } = options);
            }
            const value = (map === 'initial' && ((_a = this._initial) === null || _a === void 0 ? void 0 : _a.styleMap) || this._styleMap)[attr];
            if (value) {
                switch (value) {
                    case 'auto':
                    case 'none':
                    case 'initial':
                    case 'normal':
                    case 'rgba(0, 0, 0, 0)':
                        return false;
                    case 'baseline':
                        return attr !== 'verticalAlign';
                    case 'left':
                    case 'start':
                        return attr !== 'textAlign';
                    default:
                        if (not) {
                            if (Array.isArray(not)) {
                                for (const exclude of not) {
                                    if (value === exclude) {
                                        return false;
                                    }
                                }
                            }
                            else if (value === not) {
                                return false;
                            }
                        }
                        if (type) {
                            if (hasBit$1(type, 2 /* LENGTH */) && isLength(value) || hasBit$1(type, 4 /* PERCENT */) && isPercent(value)) {
                                return true;
                            }
                            return false;
                        }
                        return true;
                }
            }
            return false;
        }
        hasPX(attr, percent = true, initial = false) {
            var _a;
            return isLength((initial && ((_a = this._initial) === null || _a === void 0 ? void 0 : _a.styleMap) || this._styleMap)[attr], percent);
        }
        hasFlex(direction) {
            return flexParent(this, direction);
        }
        setBounds(cache = true) {
            let bounds;
            if (this.styleElement) {
                bounds = assignRect(actualClientRect(this._element, cache ? this.sessionId : undefined));
                this._bounds = bounds;
            }
            else if (this.plainText) {
                const rect = getRangeClientRect(this._element);
                bounds = assignRect(rect);
                const lines = rect.numberOfLines;
                bounds.numberOfLines = lines;
                this._bounds = bounds;
                this._textBounds = bounds;
                this._cached.multiline = lines > 1;
            }
            if (!cache && bounds) {
                this._box = undefined;
                this._linear = undefined;
            }
            return bounds;
        }
        querySelector(value) {
            return this.querySelectorAll(value, 1)[0] || null;
        }
        querySelectorAll(value, resultCount = -1) {
            let result = [];
            const queryMap = this.queryMap;
            if (queryMap && resultCount !== 0) {
                const queries = parseSelectorText$1(value);
                let length = queries.length;
                let i = 0;
                while (i < length) {
                    const query = queries[i++];
                    const selectors = [];
                    let offset = -1;
                    invalid: {
                        if (query === '*') {
                            selectors.push({ all: true });
                            offset++;
                        }
                        else {
                            let adjacent;
                            SELECTOR_G.lastIndex = 0;
                            let match;
                            while ((match = SELECTOR_G.exec(query)) !== null) {
                                let segment = match[1];
                                let all = false;
                                if (segment.length === 1) {
                                    const ch = segment.charAt(0);
                                    switch (ch) {
                                        case '+':
                                        case '~':
                                            offset--;
                                        case '>':
                                            if (adjacent || selectors.length === 0) {
                                                selectors.length = 0;
                                                break invalid;
                                            }
                                            adjacent = ch;
                                            continue;
                                        case '*':
                                            all = true;
                                            break;
                                    }
                                }
                                else if (segment.endsWith('|*')) {
                                    all = segment === '*|*';
                                }
                                else if (segment.charAt(0) === '*') {
                                    segment = segment.substring(1);
                                }
                                else if (segment.startsWith('::')) {
                                    selectors.length = 0;
                                    break invalid;
                                }
                                if (all) {
                                    selectors.push({ all: true });
                                }
                                else {
                                    let tagName;
                                    let id;
                                    let classList;
                                    let attrList;
                                    let pseudoList;
                                    let notList;
                                    let subMatch;
                                    while ((subMatch = SELECTOR_ATTR.exec(segment)) !== null) {
                                        if (attrList === undefined) {
                                            attrList = [];
                                        }
                                        const caseInsensitive = subMatch[6] === 'i';
                                        let attrValue = subMatch[3] || subMatch[4] || subMatch[5] || '';
                                        if (caseInsensitive) {
                                            attrValue = attrValue.toLowerCase();
                                        }
                                        attrList.push({
                                            key: subMatch[1],
                                            symbol: subMatch[2],
                                            value: attrValue,
                                            caseInsensitive
                                        });
                                        segment = spliceString(segment, subMatch.index, subMatch[0].length);
                                    }
                                    if (segment.includes('::')) {
                                        selectors.length = 0;
                                        break invalid;
                                    }
                                    while ((subMatch = SELECTOR_PSEUDO_CLASS.exec(segment)) !== null) {
                                        const pseudoClass = subMatch[0];
                                        if (pseudoClass.startsWith(':not(')) {
                                            if (subMatch[1]) {
                                                if (notList === undefined) {
                                                    notList = [];
                                                }
                                                notList.push(subMatch[1]);
                                            }
                                        }
                                        else {
                                            if (pseudoList === undefined) {
                                                pseudoList = [];
                                            }
                                            pseudoList.push(pseudoClass);
                                        }
                                        segment = spliceString(segment, subMatch.index, pseudoClass.length);
                                    }
                                    while ((subMatch = SELECTOR_LABEL.exec(segment)) !== null) {
                                        const label = subMatch[0];
                                        switch (label.charAt(0)) {
                                            case '#':
                                                id = label.substring(1);
                                                break;
                                            case '.':
                                                if (classList === undefined) {
                                                    classList = [];
                                                }
                                                classList.push(label.substring(1));
                                                break;
                                            default:
                                                tagName = label.toUpperCase();
                                                break;
                                        }
                                        segment = spliceString(segment, subMatch.index, label.length);
                                    }
                                    selectors.push({
                                        tagName,
                                        id,
                                        adjacent,
                                        classList,
                                        pseudoList,
                                        notList,
                                        attrList
                                    });
                                }
                                offset++;
                                adjacent = undefined;
                            }
                        }
                    }
                    length = queryMap.length;
                    if (selectors.length && offset !== -1 && offset < length) {
                        const dataEnd = selectors.pop();
                        const lastEnd = selectors.length === 0;
                        const currentCount = result.length;
                        let pending;
                        if (dataEnd.all && length - offset === 1) {
                            pending = queryMap[offset];
                        }
                        else {
                            pending = [];
                            let j = offset;
                            while (j < length) {
                                const dataMap = queryMap[j++];
                                if (dataEnd.all) {
                                    pending = pending.concat(dataMap);
                                }
                                else {
                                    const q = dataMap.length;
                                    let k = 0;
                                    while (k < q) {
                                        const node = dataMap[k++];
                                        if ((currentCount === 0 || !result.includes(node)) && validateQuerySelector.call(this, node, dataEnd, i, lastEnd)) {
                                            pending.push(node);
                                        }
                                    }
                                }
                            }
                        }
                        if (selectors.length) {
                            const depth = this.depth;
                            selectors.reverse();
                            length = selectors.length;
                            const ascendQuerySelector = (index, adjacent, nodes) => {
                                const selector = selectors[index];
                                const last = index === length - 1;
                                const next = [];
                                const q = nodes.length;
                                let j = 0;
                                while (j < q) {
                                    const node = nodes[j++];
                                    if (adjacent) {
                                        const parent = node.actualParent;
                                        if (adjacent === '>') {
                                            if (validateQuerySelector.call(this, parent, selector, i, last, adjacent)) {
                                                next.push(parent);
                                            }
                                        }
                                        else {
                                            const children = parent.naturalElements;
                                            switch (adjacent) {
                                                case '+': {
                                                    const indexA = children.indexOf(node);
                                                    if (indexA > 0) {
                                                        const sibling = children[indexA - 1];
                                                        if (sibling && validateQuerySelector.call(this, sibling, selector, i, last, adjacent)) {
                                                            next.push(sibling);
                                                        }
                                                    }
                                                    break;
                                                }
                                                case '~': {
                                                    const r = children.length;
                                                    let k = 0;
                                                    while (k < r) {
                                                        const sibling = children[k++];
                                                        if (sibling === node) {
                                                            break;
                                                        }
                                                        else if (validateQuerySelector.call(this, sibling, selector, i, last, adjacent)) {
                                                            next.push(sibling);
                                                        }
                                                    }
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                    else if (node.depth - depth >= length - index) {
                                        let parent = node.actualParent;
                                        do {
                                            if (validateQuerySelector.call(this, parent, selector, i, last)) {
                                                next.push(parent);
                                            }
                                            parent = parent.actualParent;
                                        } while (parent);
                                    }
                                }
                                if (next.length) {
                                    if (++index === length) {
                                        return true;
                                    }
                                    return ascendQuerySelector(index, selector.adjacent, next);
                                }
                                return false;
                            };
                            let count = currentCount;
                            const r = pending.length;
                            let j = 0;
                            while (j < r) {
                                const node = pending[j++];
                                if ((currentCount === 0 || !result.includes(node)) && ascendQuerySelector(0, dataEnd.adjacent, [node])) {
                                    result.push(node);
                                    if (++count === resultCount) {
                                        return result.sort(soryById);
                                    }
                                }
                            }
                        }
                        else if (currentCount === 0) {
                            if (i === queries.length - 1 || resultCount > 0 && resultCount <= pending.length) {
                                if (resultCount > 0 && pending.length > resultCount) {
                                    pending.length = resultCount;
                                }
                                return pending.sort(soryById);
                            }
                            else {
                                result = pending;
                            }
                        }
                        else {
                            const q = pending.length;
                            if (resultCount > 0) {
                                let count = currentCount;
                                let j = 0;
                                while (j < q) {
                                    const node = pending[j++];
                                    if (!result.includes(node)) {
                                        result.push(node);
                                        if (++count === resultCount) {
                                            return result.sort(soryById);
                                        }
                                    }
                                }
                            }
                            else {
                                let j = 0;
                                while (j < q) {
                                    const node = pending[j++];
                                    if (!result.includes(node)) {
                                        result.push(node);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return result.sort(soryById);
        }
        set parent(value) {
            if (value) {
                const parent = this._parent;
                if (value !== parent) {
                    parent === null || parent === void 0 ? void 0 : parent.remove(this);
                    this._parent = value;
                }
                if (!value.contains(this)) {
                    value.append(this);
                }
                if (this.depth === -1) {
                    this.depth = value.depth + 1;
                }
            }
        }
        get parent() {
            return this._parent;
        }
        get tagName() {
            let result = this._cached.tagName;
            if (result === undefined) {
                const element = this._element;
                if (element) {
                    const nodeName = element.nodeName;
                    result = nodeName.charAt(0) === '#' ? nodeName : element.tagName;
                }
                else {
                    result = '';
                }
                this._cached.tagName = result;
            }
            return result;
        }
        get element() {
            return this._element;
        }
        get elementId() {
            var _a;
            return ((_a = this._element) === null || _a === void 0 ? void 0 : _a.id) || '';
        }
        get htmlElement() {
            let result = this._cached.htmlElement;
            if (result === undefined) {
                result = !this.plainText && this._element instanceof HTMLElement;
                this._cached.htmlElement = result;
            }
            return result;
        }
        get svgElement() {
            let result = this._cached.svgElement;
            if (result === undefined) {
                result = !this.htmlElement && !this.plainText && this._element instanceof SVGElement || this.imageElement && FILE$1.SVG.test(this.src);
                this._cached.svgElement = result;
            }
            return result;
        }
        get styleElement() {
            return this.htmlElement || this.svgElement;
        }
        get naturalChild() {
            return true;
        }
        get naturalElement() {
            let result = this._cached.naturalElement;
            if (result === undefined) {
                result = this.naturalChild && this.styleElement && !this.pseudoElement;
                this._cached.naturalElement = result;
            }
            return result;
        }
        get pseudoElement() {
            return false;
        }
        get imageElement() {
            return this.tagName === 'IMG';
        }
        get flexElement() {
            let result = this._cached.flexElement;
            if (result === undefined) {
                result = this.display.endsWith('flex');
                this._cached.flexElement = result;
            }
            return result;
        }
        get gridElement() {
            let result = this._cached.gridElement;
            if (result === undefined) {
                result = this.display.endsWith('grid');
                this._cached.gridElement = result;
            }
            return result;
        }
        get textElement() {
            let result = this._cached.textElement;
            if (result === undefined) {
                result = this.plainText || this.inlineText && !this.inputElement;
                this._cached.textElement = result;
            }
            return result;
        }
        get tableElement() {
            let result = this._cached.tableElement;
            if (result === undefined) {
                result = this.tagName === 'TABLE' || this.display === 'table';
                this._cached.tableElement = result;
            }
            return result;
        }
        get inputElement() {
            let result = this._cached.inputElement;
            if (result === undefined) {
                switch (this.tagName) {
                    case 'INPUT':
                    case 'BUTTON':
                    case 'SELECT':
                    case 'TEXTAREA':
                        result = true;
                        break;
                    default:
                        result = false;
                        break;
                }
                this._cached.inputElement = result;
            }
            return result;
        }
        get layoutElement() {
            let result = this._cached.layoutElement;
            if (result === undefined) {
                result = this.flexElement || this.gridElement;
                this._cached.layoutElement = result;
            }
            return result;
        }
        get plainText() {
            return this.tagName === '#text';
        }
        get styleText() {
            return this.naturalElement && this.inlineText;
        }
        get lineBreak() {
            return this.tagName === 'BR';
        }
        get documentBody() {
            return this._documentBody;
        }
        get initial() {
            return this._initial;
        }
        get bounds() {
            return this._bounds || this.setBounds() || assignRect(this.boundingClientRect);
        }
        get linear() {
            const setBoxRect = () => {
                const bounds = this.bounds;
                if (bounds) {
                    if (this.styleElement) {
                        const { marginBottom, marginRight } = this;
                        const marginTop = Math.max(this.marginTop, 0);
                        const marginLeft = Math.max(this.marginLeft, 0);
                        this._linear = {
                            top: bounds.top - marginTop,
                            right: bounds.right + marginRight,
                            bottom: bounds.bottom + marginBottom,
                            left: bounds.left - marginLeft,
                            width: bounds.width + marginLeft + marginRight,
                            height: bounds.height + marginTop + marginBottom
                        };
                    }
                    else {
                        this._linear = bounds;
                    }
                    return this._linear;
                }
                return newBoxRectDimension();
            };
            return this._linear || setBoxRect();
        }
        get box() {
            const setBoxRect = () => {
                const bounds = this.bounds;
                if (bounds) {
                    if (this.styleElement) {
                        this._box = {
                            top: bounds.top + (this.paddingTop + this.borderTopWidth),
                            right: bounds.right - (this.paddingRight + this.borderRightWidth),
                            bottom: bounds.bottom - (this.paddingBottom + this.borderBottomWidth),
                            left: bounds.left + (this.paddingLeft + this.borderLeftWidth),
                            width: bounds.width - this.contentBoxWidth,
                            height: bounds.height - this.contentBoxHeight
                        };
                    }
                    else {
                        this._box = bounds;
                    }
                    return this._box;
                }
                return newBoxRectDimension();
            };
            return this._box || setBoxRect();
        }
        get dataset() {
            if (this.styleElement) {
                return this._element.dataset;
            }
            else {
                let result = this._dataset;
                if (result === undefined) {
                    result = {};
                    this._dataset = result;
                }
                return result;
            }
        }
        get flexdata() {
            let result = this._cached.flexdata;
            if (result === undefined) {
                if (this.flexElement) {
                    const { flexWrap, flexDirection, alignContent, justifyContent } = this.cssAsObject('flexWrap', 'flexDirection', 'alignContent', 'justifyContent');
                    const row = flexDirection.startsWith('row');
                    result = {
                        row,
                        column: !row,
                        reverse: flexDirection.endsWith('reverse'),
                        wrap: flexWrap.startsWith('wrap'),
                        wrapReverse: flexWrap === 'wrap-reverse',
                        alignContent,
                        justifyContent
                    };
                }
                else {
                    result = {};
                }
                this._cached.flexdata = result;
            }
            return result;
        }
        get flexbox() {
            var _a;
            let result = this._cached.flexbox;
            if (result === undefined) {
                if (((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.flexElement) && this.styleElement) {
                    const alignSelf = this.css('alignSelf');
                    const justifySelf = this.css('justifySelf');
                    result = {
                        alignSelf: alignSelf === 'auto' ? this.cssParent('alignItems') : alignSelf,
                        justifySelf: justifySelf === 'auto' ? this.cssParent('justifyItems') : justifySelf,
                        basis: this.css('flexBasis'),
                        grow: getFlexValue(this, 'flexGrow', 0),
                        shrink: getFlexValue(this, 'flexShrink', 1),
                        order: this.toInt('order', 0)
                    };
                }
                else {
                    result = {
                        alignSelf: 'auto',
                        justifySelf: 'auto',
                        basis: 'auto',
                        grow: 0,
                        shrink: 1,
                        order: 0
                    };
                }
                this._cached.flexbox = result;
            }
            return result;
        }
        get width() {
            let result = this._cached.width;
            if (result === undefined) {
                result = setDimension(this, this._styleMap, 'width', 'minWidth', 'maxWidth');
                this._cached.width = result;
            }
            return result;
        }
        get height() {
            let result = this._cached.height;
            if (result === undefined) {
                result = setDimension(this, this._styleMap, 'height', 'minHeight', 'maxHeight');
                this._cached.height = result;
            }
            return result;
        }
        get hasWidth() {
            let result = this._cached.hasWidth;
            if (result === undefined) {
                result = this.width > 0;
                this._cached.hasWidth = result;
            }
            return result;
        }
        get hasHeight() {
            var _a;
            let result = this._cached.hasHeight;
            if (result === undefined) {
                const value = this.css('height');
                if (isPercent(value)) {
                    result = this.pageFlow && (((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.hasHeight) || this.documentBody) ? parseFloat(value) > 0 : this.css('position') === 'fixed';
                }
                else {
                    result = this.height > 0;
                }
                this._cached.hasHeight = result;
            }
            return result;
        }
        get lineHeight() {
            let result = this._cached.lineHeight;
            if (result === undefined) {
                result = 0;
                if (!this.imageElement && !this.svgElement) {
                    let hasOwnStyle = this.has('lineHeight');
                    let value = 0;
                    if (hasOwnStyle) {
                        const lineHeight = this.css('lineHeight');
                        if (isPercent(lineHeight)) {
                            value = convertFloat(this.style.lineHeight);
                        }
                        else if (isNumber(lineHeight)) {
                            value = parseFloat(lineHeight) * this.fontSize;
                        }
                        else {
                            value = parseUnit(lineHeight, this.fontSize);
                            if (PX.test(lineHeight) && this._cssStyle.lineHeight !== 'inherit') {
                                const fontSize = this.cssInitial('fontSize');
                                if (REGEX_EM.test(fontSize)) {
                                    value *= parseFloat(fontSize);
                                }
                            }
                        }
                    }
                    else {
                        const parent = this.ascend({ condition: item => item.lineHeight > 0 })[0];
                        if (parent) {
                            value = parent.lineHeight;
                        }
                        if (this.styleElement) {
                            const fontSize = this.cssInitial('fontSize');
                            if (REGEX_EM.test(fontSize)) {
                                const emSize = parseFloat(fontSize);
                                if (emSize !== 1) {
                                    value *= emSize;
                                    this.css('lineHeight', formatPX(value));
                                    hasOwnStyle = true;
                                }
                            }
                        }
                    }
                    if (hasOwnStyle || value > this.height || this.multiline || this.block && this.naturalChildren.some(node => node.textElement)) {
                        result = value;
                    }
                }
                this._cached.lineHeight = result;
            }
            return result;
        }
        get display() {
            return this.css('display');
        }
        get positionStatic() {
            let result = this._cached.positionStatic;
            if (result === undefined) {
                switch (this.css('position')) {
                    case 'fixed':
                    case 'absolute':
                        result = false;
                        break;
                    case 'relative':
                        if (!this.documentBody) {
                            result = !this.hasPX('top') && !this.hasPX('right') && !this.hasPX('bottom') && !this.hasPX('left');
                            if (result) {
                                this._cached.positionRelative = false;
                            }
                        }
                        else {
                            result = false;
                        }
                        break;
                    case 'inherit': {
                        const element = this._element;
                        const position = (element === null || element === void 0 ? void 0 : element.parentElement) ? getInheritedStyle(element.parentElement, 'position') : '';
                        result = position !== '' && !(position === 'absolute' || position === 'fixed');
                        break;
                    }
                    default:
                        result = true;
                        break;
                }
                this._cached.positionStatic = result;
            }
            return result;
        }
        get positionRelative() {
            let result = this._cached.positionRelative;
            if (result === undefined) {
                result = this.css('position') === 'relative';
                this._cached.positionRelative = result;
            }
            return result;
        }
        get top() {
            let result = this._cached.top;
            if (result === undefined) {
                result = convertPosition(this, 'top');
                this._cached.top = result;
            }
            return result;
        }
        get right() {
            let result = this._cached.right;
            if (result === undefined) {
                result = convertPosition(this, 'right');
                this._cached.right = result;
            }
            return result;
        }
        get bottom() {
            let result = this._cached.bottom;
            if (result === undefined) {
                result = convertPosition(this, 'bottom');
                this._cached.bottom = result;
            }
            return result;
        }
        get left() {
            let result = this._cached.left;
            if (result === undefined) {
                result = convertPosition(this, 'left');
                this._cached.left = result;
            }
            return result;
        }
        get marginTop() {
            let result = this._cached.marginTop;
            if (result === undefined) {
                result = this.inlineStatic ? 0 : convertBox(this, 'marginTop', true);
                this._cached.marginTop = result;
            }
            return result;
        }
        get marginRight() {
            let result = this._cached.marginRight;
            if (result === undefined) {
                result = convertBox(this, 'marginRight', true);
                this._cached.marginRight = result;
            }
            return result;
        }
        get marginBottom() {
            let result = this._cached.marginBottom;
            if (result === undefined) {
                result = this.inlineStatic ? 0 : convertBox(this, 'marginBottom', true);
                this._cached.marginBottom = result;
            }
            return result;
        }
        get marginLeft() {
            let result = this._cached.marginLeft;
            if (result === undefined) {
                result = convertBox(this, 'marginLeft', true);
                this._cached.marginLeft = result;
            }
            return result;
        }
        get borderTopWidth() {
            let result = this._cached.borderTopWidth;
            if (result === undefined) {
                result = convertBorderWidth(this, 'height', BOX_BORDER[0]);
                this._cached.borderTopWidth = result;
            }
            return result;
        }
        get borderRightWidth() {
            let result = this._cached.borderRightWidth;
            if (result === undefined) {
                result = convertBorderWidth(this, 'height', BOX_BORDER[1]);
                this._cached.borderRightWidth = result;
            }
            return result;
        }
        get borderBottomWidth() {
            let result = this._cached.borderBottomWidth;
            if (result === undefined) {
                result = convertBorderWidth(this, 'width', BOX_BORDER[2]);
                this._cached.borderBottomWidth = result;
            }
            return result;
        }
        get borderLeftWidth() {
            let result = this._cached.borderLeftWidth;
            if (result === undefined) {
                result = convertBorderWidth(this, 'width', BOX_BORDER[3]);
                this._cached.borderLeftWidth = result;
            }
            return result;
        }
        get paddingTop() {
            let result = this._cached.paddingTop;
            if (result === undefined) {
                result = convertBox(this, 'paddingTop', false);
                this._cached.paddingTop = result;
            }
            return result;
        }
        get paddingRight() {
            let result = this._cached.paddingRight;
            if (result === undefined) {
                result = convertBox(this, 'paddingRight', false);
                this._cached.paddingRight = result;
            }
            return result;
        }
        get paddingBottom() {
            let result = this._cached.paddingBottom;
            if (result === undefined) {
                result = convertBox(this, 'paddingBottom', false);
                this._cached.paddingBottom = result;
            }
            return result;
        }
        get paddingLeft() {
            let result = this._cached.paddingLeft;
            if (result === undefined) {
                result = convertBox(this, 'paddingLeft', false);
                this._cached.paddingLeft = result;
            }
            return result;
        }
        get contentBox() {
            return this.css('boxSizing') !== 'border-box' || this.tableElement && isUserAgent(8 /* FIREFOX */);
        }
        get contentBoxWidth() {
            let result = this._cached.contentBoxWidth;
            if (result === undefined) {
                result = this.tableElement && this.css('borderCollapse') === 'collapse' ? 0 : this.borderLeftWidth + this.paddingLeft + this.paddingRight + this.borderRightWidth;
                this._cached.contentBoxWidth = result;
            }
            return result;
        }
        get contentBoxHeight() {
            let result = this._cached.contentBoxHeight;
            if (result === undefined) {
                result = this.tableElement && this.css('borderCollapse') === 'collapse' ? 0 : this.borderTopWidth + this.paddingTop + this.paddingBottom + this.borderBottomWidth;
                this._cached.contentBoxHeight = result;
            }
            return result;
        }
        get inline() {
            let result = this._cached.inline;
            if (result === undefined) {
                const value = this.display;
                result = value === 'inline' || value === 'initial' && !ELEMENT_BLOCK.includes(this.tagName);
                this._cached.inline = result;
            }
            return result;
        }
        get inlineStatic() {
            let result = this._cached.inlineStatic;
            if (result === undefined) {
                result = this.inline && this.pageFlow && !this.floating && !this.imageElement;
                this._cached.inlineStatic = result;
            }
            return result;
        }
        get inlineVertical() {
            let result = this._cached.inlineVertical;
            if (result === undefined) {
                if (this.naturalElement && !this.floating) {
                    const value = this.display;
                    result = value.startsWith('inline') || value === 'table-cell';
                }
                else {
                    result = false;
                }
                this._cached.inlineVertical = result;
            }
            return result;
        }
        get inlineDimension() {
            let result = this._cached.inlineDimension;
            if (result === undefined) {
                result = this.naturalElement && (this.display.startsWith('inline-') || this.floating);
                this._cached.inlineDimension = result;
            }
            return result;
        }
        set inlineText(value) {
            switch (this.tagName) {
                case 'INPUT':
                case 'IMG':
                case 'SELECT':
                case 'SVG':
                case 'BR':
                case 'HR':
                case 'TEXTAREA':
                case 'PROGRESS':
                case 'METER':
                    this._inlineText = false;
                    break;
                case 'BUTTON':
                    this._inlineText = this.textContent.trim() !== '';
                    break;
                default:
                    this._inlineText = value;
                    this._cached.textElement = undefined;
                    break;
            }
        }
        get inlineText() {
            return this._inlineText;
        }
        get block() {
            var _a;
            let result = this._cached.block;
            if (result === undefined) {
                switch (this.display) {
                    case 'block':
                    case 'flex':
                    case 'grid':
                    case 'list-item':
                        result = true;
                        break;
                    case 'initial':
                        result = ELEMENT_BLOCK.includes(this.tagName);
                        break;
                    case 'inline':
                        if (this.tagName === 'svg' && ((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.htmlElement)) {
                            result = !this.hasPX('width') && convertFloat(getNamedItem(this._element, 'width')) === 0;
                            break;
                        }
                    default:
                        result = false;
                        break;
                }
                this._cached.block = result;
            }
            return result;
        }
        get blockStatic() {
            let result = this._cached.blockStatic;
            if (result === undefined) {
                result = this.pageFlow && (this.block && !this.floating || this.lineBreak || this.blockDimension && (this.cssInitial('width') === '100%' || this.cssInitial('minWidth') === '100%') && !this.hasPX('maxWidth'));
                this._cached.blockStatic = result;
            }
            return result;
        }
        get blockDimension() {
            let result = this._cached.blockDimension;
            if (result === undefined) {
                if (this.block || this.floating || this.imageElement || this.svgElement) {
                    result = true;
                }
                else {
                    const value = this.display;
                    result = value.startsWith('inline-') || value === 'table';
                }
                this._cached.blockDimension = result;
            }
            return result;
        }
        get blockVertical() {
            let result = this._cached.blockVertical;
            if (result === undefined) {
                result = this.blockDimension && this.hasHeight;
                this._cached.blockVertical = result;
            }
            return result;
        }
        get pageFlow() {
            let result = this._cached.pageFlow;
            if (result === undefined) {
                result = this.positionStatic || this.positionRelative;
                this._cached.pageFlow = result;
            }
            return result;
        }
        get inlineFlow() {
            let result = this._cached.inlineFlow;
            if (result === undefined) {
                result = this.inline || this.inlineDimension || this.inlineVertical || this.imageElement;
                this._cached.inlineFlow = result;
            }
            return result;
        }
        get centerAligned() {
            let result = this._cached.centerAligned;
            if (result === undefined) {
                if (!this.pageFlow) {
                    result = this.hasPX('left') && this.hasPX('right');
                }
                else {
                    result = this.autoMargin.leftRight || canTextAlign(this) && hasTextAlign(this, 'center');
                }
                this._cached.centerAligned = result;
            }
            return result;
        }
        get rightAligned() {
            let result = this._cached.rightAligned;
            if (result === undefined) {
                if (!this.pageFlow) {
                    result = this.hasPX('right') && !this.hasPX('left');
                }
                else {
                    result = this.float === 'right' || this.autoMargin.left || canTextAlign(this) && hasTextAlign(this, 'right', 'end');
                }
                this._cached.rightAligned = result;
            }
            return result;
        }
        get bottomAligned() {
            var _a;
            let result = this._cached.bottomAligned;
            if (result === undefined) {
                if (!this.pageFlow) {
                    result = this.hasPX('bottom') && !this.hasPX('top');
                }
                else {
                    result = ((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.hasHeight) === true && this.autoMargin.top === true;
                }
                this._cached.bottomAligned = result;
            }
            return result;
        }
        get autoMargin() {
            let result = this._cached.autoMargin;
            if (result === undefined) {
                if (!this.pageFlow || this.blockStatic || this.display === 'table') {
                    const styleMap = this._styleMap;
                    const left = styleMap.marginLeft === 'auto' && (this.pageFlow || this.hasPX('right'));
                    const right = styleMap.marginRight === 'auto' && (this.pageFlow || this.hasPX('left'));
                    const top = styleMap.marginTop === 'auto' && (this.pageFlow || this.hasPX('bottom'));
                    const bottom = styleMap.marginBottom === 'auto' && (this.pageFlow || this.hasPX('top'));
                    result = {
                        horizontal: left || right,
                        left: left && !right,
                        right: !left && right,
                        leftRight: left && right,
                        vertical: top || bottom,
                        top: top && !bottom,
                        bottom: !top && bottom,
                        topBottom: top && bottom
                    };
                }
                else {
                    result = {};
                }
                this._cached.autoMargin = result;
            }
            return result;
        }
        get floating() {
            let result = this._cached.floating;
            if (result === undefined) {
                result = this.float !== 'none';
                this._cached.floating = result;
            }
            return result;
        }
        get float() {
            let result = this._cached.float;
            if (result === undefined) {
                result = this.pageFlow && this.css('float') || 'none';
                this._cached.float = result;
            }
            return result;
        }
        get zIndex() {
            return this.toInt('zIndex', 0);
        }
        get textContent() {
            let result = this._cached.textContent;
            if (result === undefined) {
                result = !this.svgElement ? this._element.textContent : '';
                this._cached.textContent = result;
            }
            return result;
        }
        get src() {
            return this.htmlElement && this._element.src || '';
        }
        get overflowX() {
            let result = this._cached.overflow;
            if (result === undefined) {
                result = setOverflow(this);
                this._cached.overflow = result;
            }
            return hasBit$1(result, 8 /* HORIZONTAL */);
        }
        get overflowY() {
            let result = this._cached.overflow;
            if (result === undefined) {
                result = setOverflow(this);
                this._cached.overflow = result;
            }
            return hasBit$1(result, 16 /* VERTICAL */);
        }
        get baseline() {
            let result = this._cached.baseline;
            if (result === undefined) {
                if (this.pageFlow && !this.floating) {
                    const value = this.css('verticalAlign');
                    result = value === 'baseline' || value === 'initial' || this.naturalElements.length === 0 && isLength(value, true);
                }
                else {
                    result = false;
                }
                this._cached.baseline = result;
            }
            return result;
        }
        get verticalAlign() {
            let result = this._cached.verticalAlign;
            if (result === undefined) {
                if (this.pageFlow) {
                    result = this.css('verticalAlign');
                    if (isLength(result, true)) {
                        result = this.parseUnit(result, 'height') + 'px';
                    }
                }
                else {
                    result = '0px';
                }
                this._cached.verticalAlign = result;
            }
            return result;
        }
        set textBounds(value) {
            this._textBounds = value;
        }
        get textBounds() {
            let result = this._textBounds;
            if (result === undefined) {
                result = null;
                if (this.naturalChild) {
                    if (this.textElement) {
                        result = actualTextRangeRect(this._element, this.sessionId);
                    }
                    else {
                        const children = this.naturalChildren;
                        const length = children.length;
                        if (length) {
                            let top = Number.POSITIVE_INFINITY;
                            let right = Number.NEGATIVE_INFINITY;
                            let left = Number.POSITIVE_INFINITY;
                            let bottom = Number.NEGATIVE_INFINITY;
                            let numberOfLines = 0;
                            let i = 0;
                            while (i < length) {
                                const node = children[i++];
                                if (node.textElement) {
                                    const rect = actualTextRangeRect(node.element, node.sessionId);
                                    top = Math.min(rect.top, top);
                                    right = Math.max(rect.right, right);
                                    left = Math.min(rect.left, left);
                                    bottom = Math.max(rect.bottom, bottom);
                                    numberOfLines += rect.numberOfLines || 0;
                                }
                            }
                            if (numberOfLines > 0) {
                                result = {
                                    top,
                                    right,
                                    left,
                                    bottom,
                                    width: right - left,
                                    height: bottom - top,
                                    numberOfLines
                                };
                            }
                        }
                    }
                }
                this._textBounds = result;
            }
            return result;
        }
        get multiline() {
            var _a;
            let result = this._cached.multiline;
            if (result === undefined) {
                if (this.plainText) {
                    result = Math.floor(getRangeClientRect(this._element).width) > this.actualParent.box.width;
                }
                else if (this.styleText && (this.inlineFlow || this.naturalElements.length === 0)) {
                    result = ((_a = this.textBounds) === null || _a === void 0 ? void 0 : _a.numberOfLines) > 1;
                }
                else {
                    result = false;
                }
                this._cached.multiline = result;
            }
            return result;
        }
        get backgroundColor() {
            let result = this._cached.backgroundColor;
            if (result === undefined) {
                result = this.css('backgroundColor');
                switch (result) {
                    case 'initial':
                    case 'transparent':
                    case 'rgba(0, 0, 0, 0)':
                        result = '';
                        break;
                    default:
                        if (result !== '' && this.pageFlow && this.styleElement && !this.inputElement && (!this._initial || this.cssInitial('backgroundColor') === result)) {
                            let parent = this.actualParent;
                            while (parent) {
                                const color = parent.cssInitial('backgroundColor', true);
                                if (color !== '') {
                                    if (color === result && parent.backgroundColor === '') {
                                        result = '';
                                    }
                                    break;
                                }
                                parent = parent.actualParent;
                            }
                        }
                        break;
                }
                this._cached.backgroundColor = result;
            }
            return result;
        }
        get backgroundImage() {
            let result = this._cached.backgroundImage;
            if (result === undefined) {
                let value = this.css('backgroundImage');
                if (value !== '' && value !== 'none' && value !== 'initial') {
                    result = value;
                }
                else {
                    value = this.css('background');
                    if (REGEX_BACKGROUND$1.test(value)) {
                        const segments = [];
                        const background = splitEnclosing(value);
                        const length = background.length;
                        for (let i = 1; i < length; ++i) {
                            const name = background[i - 1].trim();
                            if (REGEX_BACKGROUND$1.test(name)) {
                                segments.push(name + background[i]);
                            }
                        }
                        result = segments.join(', ');
                    }
                    else {
                        result = '';
                    }
                }
                this._cached.backgroundImage = result;
            }
            return result;
        }
        get percentWidth() {
            let result = this._cached.percentWidth;
            if (result === undefined) {
                const value = this.cssInitial('width');
                result = isPercent(value) ? parseFloat(value) / 100 : 0;
                this._cached.percentWidth = result;
            }
            return result;
        }
        get percentHeight() {
            var _a;
            let result = this._cached.percentHeight;
            if (result === undefined) {
                const value = this.cssInitial('height');
                result = isPercent(value) && (((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.hasHeight) || this.css('position') === 'fixed') ? parseFloat(value) / 100 : 0;
                this._cached.percentHeight = result;
            }
            return result;
        }
        get visibleStyle() {
            let result = this._cached.visibleStyle;
            if (result === undefined) {
                if (this.plainText) {
                    result = {
                        background: false,
                        borderWidth: false,
                        backgroundImage: false,
                        backgroundColor: false,
                        backgroundRepeat: false,
                        backgroundRepeatX: false,
                        backgroundRepeatY: false
                    };
                }
                else {
                    const borderWidth = this.borderTopWidth > 0 || this.borderRightWidth > 0 || this.borderBottomWidth > 0 || this.borderLeftWidth > 0;
                    const backgroundColor = this.backgroundColor !== '';
                    const backgroundImage = this.backgroundImage !== '';
                    let backgroundRepeatX = false;
                    let backgroundRepeatY = false;
                    if (backgroundImage) {
                        this.css('backgroundRepeat').split(XML$2.SEPARATOR).forEach(repeat => {
                            const [repeatX, repeatY] = repeat.split(CHAR$1.SPACE);
                            if (!backgroundRepeatX) {
                                backgroundRepeatX = repeatX === 'repeat' || repeatX === 'repeat-x';
                            }
                            if (!backgroundRepeatY) {
                                backgroundRepeatY = repeatX === 'repeat' || repeatX === 'repeat-y' || repeatY === 'repeat';
                            }
                        });
                    }
                    result = {
                        background: borderWidth || backgroundImage || backgroundColor,
                        borderWidth,
                        backgroundImage,
                        backgroundColor,
                        backgroundRepeat: backgroundRepeatX || backgroundRepeatY,
                        backgroundRepeatX,
                        backgroundRepeatY
                    };
                }
                this._cached.visibleStyle = result;
            }
            return result;
        }
        get absoluteParent() {
            let result = this._cached.absoluteParent;
            if (result === undefined) {
                result = this.actualParent;
                if (!this.pageFlow && !this.documentBody) {
                    while (result && !result.documentBody) {
                        switch (result.cssInitial('position', false, true)) {
                            case 'static':
                            case 'initial':
                            case 'unset':
                                result = result.actualParent;
                                continue;
                        }
                        break;
                    }
                }
                this._cached.absoluteParent = result;
            }
            return result;
        }
        set actualParent(value) {
            this._cached.actualParent = value;
        }
        get actualParent() {
            var _a;
            let result = this._cached.actualParent;
            if (result === undefined) {
                const parentElement = (_a = this._element) === null || _a === void 0 ? void 0 : _a.parentElement;
                result = parentElement && getElementAsNode(parentElement, this.sessionId) || null;
                this._cached.actualParent = result;
            }
            return result;
        }
        get actualWidth() {
            let result = this._cached.actualWidth;
            if (result === undefined) {
                if (this.plainText) {
                    const bounds = this.bounds;
                    switch (bounds.numberOfLines || 1) {
                        case 1:
                            result = bounds.width;
                            break;
                        case 2:
                            result = Math.min(bounds.width, this.actualParent.box.width);
                            break;
                        default:
                            result = Math.min(bounds.right - bounds.left, this.actualParent.box.width);
                            break;
                    }
                }
                else if (this.inlineStatic || this.display === 'table-cell' || flexParent(this, 'row')) {
                    result = this.bounds.width;
                }
                else {
                    result = this.width;
                    if (result > 0) {
                        if (this.contentBox && !this.tableElement) {
                            result += this.contentBoxWidth;
                        }
                    }
                    else {
                        result = this.bounds.width;
                    }
                }
                this._cached.actualWidth = result;
            }
            return result;
        }
        get actualHeight() {
            let result = this._cached.actualHeight;
            if (result === undefined) {
                if (!this.inlineStatic && this.display !== 'table-cell' && !flexParent(this, 'column')) {
                    result = this.height;
                    if (result > 0) {
                        if (this.contentBox && !this.tableElement) {
                            result += this.contentBoxHeight;
                        }
                    }
                    else {
                        result = this.bounds.height;
                    }
                }
                else {
                    result = this.bounds.height;
                }
                this._cached.actualHeight = result;
            }
            return result;
        }
        get actualDimension() {
            return { width: this.actualWidth, height: this.actualHeight };
        }
        set naturalChildren(value) {
            this._naturalChildren = value;
        }
        get naturalChildren() {
            return this._naturalChildren || setNaturalChildren(this);
        }
        set naturalElements(value) {
            this._naturalElements = value;
        }
        get naturalElements() {
            return this._naturalElements || setNaturalElements(this);
        }
        get firstChild() {
            return this.naturalElements[0] || null;
        }
        get lastChild() {
            const children = this.naturalElements;
            const length = children.length;
            return length ? children[length - 1] : null;
        }
        get firstStaticChild() {
            for (const node of this.naturalChildren) {
                if (node.pageFlow) {
                    return node;
                }
            }
            return null;
        }
        get lastStaticChild() {
            const children = this.naturalChildren;
            let i = children.length - 1;
            while (i >= 0) {
                const node = children[i--];
                if (node.pageFlow) {
                    return node;
                }
            }
            return null;
        }
        get previousSibling() {
            var _a;
            return ((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.naturalChildren[this.childIndex - 1]) || null;
        }
        get nextSibling() {
            var _a;
            return ((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.naturalChildren[this.childIndex + 1]) || null;
        }
        get previousElementSibling() {
            var _a;
            const children = (_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.naturalElements;
            if (children) {
                const index = children.indexOf(this);
                if (index > 0) {
                    return children[index - 1];
                }
            }
            return null;
        }
        get nextElementSibling() {
            var _a;
            const children = (_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.naturalElements;
            if (children) {
                const index = children.indexOf(this);
                if (index !== -1) {
                    return children[index + 1] || null;
                }
            }
            return null;
        }
        get attributes() {
            let result = this._cached.attributes;
            if (result === undefined) {
                result = {};
                if (this.styleElement) {
                    const attributes = this._element.attributes;
                    const length = attributes.length;
                    let i = 0;
                    while (i < length) {
                        const { name, value } = attributes.item(i++);
                        result[name] = value;
                    }
                }
                this._cached.attributes = result;
            }
            return result;
        }
        get boundingClientRect() {
            var _a;
            return (this.naturalElement && ((_a = this._element) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect()) || this._bounds || newBoxRectDimension());
        }
        get fontSize() {
            var _a, _b;
            let result = this._fontSize;
            if (result === undefined) {
                const getFontSize = (style) => parseFloat(style.getPropertyValue('font-size'));
                if (this.naturalChild && this.styleElement) {
                    const value = this.css('fontSize');
                    if (PX.test(value)) {
                        result = parseFloat(value);
                    }
                    else if (isPercent(value) && !this.documentBody) {
                        result = (((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.fontSize) || getFontSize(getStyle$1(document.body))) * parseFloat(value) / 100;
                    }
                    else {
                        result = getFontSize(this.style);
                    }
                }
                else {
                    result = parseUnit(this.css('fontSize'));
                }
                if (result === 0 && !this.naturalChild) {
                    const element = this.element;
                    if (element && hasComputedStyle$1(element)) {
                        const node = getElementAsNode(element, this.sessionId);
                        result = (node === null || node === void 0 ? void 0 : node.fontSize) || getFontSize(getStyle$1(element));
                    }
                    else {
                        result = ((_b = this.ascend({ condition: item => item.fontSize > 0 })[0]) === null || _b === void 0 ? void 0 : _b.fontSize) || getFontSize(getStyle$1(document.body));
                    }
                }
                this._fontSize = result;
            }
            return result;
        }
        get cssStyle() {
            return this._cssStyle;
        }
        get textStyle() {
            let result = this._textStyle;
            if (result === undefined) {
                result = this.cssAsObject(...TEXT_STYLE);
                result.fontSize = this.fontSize + 'px';
                this._textStyle = result;
            }
            return result;
        }
        set dir(value) {
            this._cached.dir = value;
        }
        get dir() {
            let result = this._cached.dir;
            if (result === undefined) {
                result = this.naturalElement ? this._element.dir : '';
                if (result === '') {
                    let parent = this.actualParent;
                    while (parent) {
                        result = parent.dir;
                        if (result !== '') {
                            break;
                        }
                        parent = parent.actualParent;
                    }
                }
                this._cached.dir = result;
            }
            return result;
        }
        get center() {
            const bounds = this.bounds;
            return {
                x: (bounds.left + bounds.right) / 2,
                y: (bounds.top + bounds.bottom) / 2
            };
        }
    }

    const CSS_SPACING = new Map([
        [2 /* MARGIN_TOP */, 'marginTop'],
        [4 /* MARGIN_RIGHT */, 'marginRight'],
        [8 /* MARGIN_BOTTOM */, 'marginBottom'],
        [16 /* MARGIN_LEFT */, 'marginLeft'],
        [32 /* PADDING_TOP */, 'paddingTop'],
        [64 /* PADDING_RIGHT */, 'paddingRight'],
        [128 /* PADDING_BOTTOM */, 'paddingBottom'],
        [256 /* PADDING_LEFT */, 'paddingLeft']
    ]);
    const EXT_NAME = {
        ACCESSIBILITY: 'squared.accessibility',
        COLUMN: 'squared.column',
        CSS_GRID: 'squared.css-grid',
        FLEXBOX: 'squared.flexbox',
        GRID: 'squared.grid',
        LIST: 'squared.list',
        RELATIVE: 'squared.relative',
        SPRITE: 'squared.sprite',
        TABLE: 'squared.table',
        VERTICAL_ALIGN: 'squared.verticalalign',
        WHITESPACE: 'squared.whitespace'
    };

    var constant = /*#__PURE__*/Object.freeze({
        __proto__: null,
        CSS_SPACING: CSS_SPACING,
        EXT_NAME: EXT_NAME
    });

    var APP_SECTION;
    (function (APP_SECTION) {
        APP_SECTION[APP_SECTION["DOM_TRAVERSE"] = 2] = "DOM_TRAVERSE";
        APP_SECTION[APP_SECTION["EXTENSION"] = 4] = "EXTENSION";
        APP_SECTION[APP_SECTION["RENDER"] = 8] = "RENDER";
        APP_SECTION[APP_SECTION["ALL"] = 14] = "ALL";
    })(APP_SECTION || (APP_SECTION = {}));
    var NODE_RESOURCE;
    (function (NODE_RESOURCE) {
        NODE_RESOURCE[NODE_RESOURCE["BOX_STYLE"] = 2] = "BOX_STYLE";
        NODE_RESOURCE[NODE_RESOURCE["BOX_SPACING"] = 4] = "BOX_SPACING";
        NODE_RESOURCE[NODE_RESOURCE["FONT_STYLE"] = 8] = "FONT_STYLE";
        NODE_RESOURCE[NODE_RESOURCE["VALUE_STRING"] = 16] = "VALUE_STRING";
        NODE_RESOURCE[NODE_RESOURCE["IMAGE_SOURCE"] = 32] = "IMAGE_SOURCE";
        NODE_RESOURCE[NODE_RESOURCE["ASSET"] = 56] = "ASSET";
        NODE_RESOURCE[NODE_RESOURCE["ALL"] = 126] = "ALL";
    })(NODE_RESOURCE || (NODE_RESOURCE = {}));
    var NODE_PROCEDURE;
    (function (NODE_PROCEDURE) {
        NODE_PROCEDURE[NODE_PROCEDURE["CONSTRAINT"] = 2] = "CONSTRAINT";
        NODE_PROCEDURE[NODE_PROCEDURE["LAYOUT"] = 4] = "LAYOUT";
        NODE_PROCEDURE[NODE_PROCEDURE["ALIGNMENT"] = 8] = "ALIGNMENT";
        NODE_PROCEDURE[NODE_PROCEDURE["ACCESSIBILITY"] = 16] = "ACCESSIBILITY";
        NODE_PROCEDURE[NODE_PROCEDURE["LOCALIZATION"] = 32] = "LOCALIZATION";
        NODE_PROCEDURE[NODE_PROCEDURE["CUSTOMIZATION"] = 64] = "CUSTOMIZATION";
        NODE_PROCEDURE[NODE_PROCEDURE["ALL"] = 126] = "ALL";
    })(NODE_PROCEDURE || (NODE_PROCEDURE = {}));

    var enumeration = /*#__PURE__*/Object.freeze({
        __proto__: null,
        get APP_SECTION () { return APP_SECTION; },
        get NODE_RESOURCE () { return NODE_RESOURCE; },
        get NODE_PROCEDURE () { return NODE_PROCEDURE; }
    });

    const $lib$3 = squared.lib;
    const { BOX_MARGIN, BOX_PADDING, BOX_POSITION } = $lib$3.css;
    const { isTextNode: isTextNode$1 } = $lib$3.dom;
    const { equal } = $lib$3.math;
    const { XML: XML$3 } = $lib$3.regex;
    const { getElementAsNode: getElementAsNode$1 } = $lib$3.session;
    const { cloneObject, convertWord, hasBit: hasBit$2, isArray, iterateArray: iterateArray$1, safeNestedMap, searchObject, spliceArray, withinRange } = $lib$3.util;
    const CSS_SPACING_KEYS = Array.from(CSS_SPACING.keys());
    const INHERIT_ALIGNMENT = ['position', 'display', 'verticalAlign', 'float', 'clear', 'zIndex'];
    function cascadeActualPadding(children, attr, value) {
        let valid = false;
        const length = children.length;
        let i = 0;
        while (i < length) {
            const item = children[i++];
            if (item.blockStatic) {
                return false;
            }
            else if (item.inlineStatic) {
                if (item.has('lineHeight') && item.lineHeight > item.bounds.height) {
                    return false;
                }
                else if (item[attr] >= value) {
                    valid = true;
                }
                else if (canCascadeChildren(item)) {
                    if (!cascadeActualPadding(item.naturalChildren, attr, value)) {
                        return false;
                    }
                    else {
                        valid = true;
                    }
                }
            }
        }
        return valid;
    }
    function traverseElementSibling(options = {}, element, direction, sessionId) {
        const { floating, pageFlow, lineBreak, excluded } = options;
        const result = [];
        while (element) {
            const node = getElementAsNode$1(element, sessionId);
            if (node) {
                if (lineBreak !== false && node.lineBreak || excluded !== false && node.excluded && !node.lineBreak) {
                    result.push(node);
                }
                else if (node.pageFlow && !node.excluded) {
                    if (pageFlow === false) {
                        break;
                    }
                    result.push(node);
                    if (floating !== false || !node.floating && (node.visible || node.rendered) && node.display !== 'none') {
                        break;
                    }
                }
            }
            element = element[direction];
        }
        return result;
    }
    const canCascadeChildren = (node) => node.naturalElements.length > 0 && !node.layoutElement && !node.tableElement;
    const isBlockWrap = (node) => node.blockVertical || node.percentWidth > 0;
    const checkBlockDimension = (node, previous) => node.blockDimension && Math.ceil(node.bounds.top) >= previous.bounds.bottom && (isBlockWrap(node) || isBlockWrap(previous));
    const getPercentWidth = (node) => node.inlineDimension && !node.hasPX('maxWidth') ? node.percentWidth : Number.NEGATIVE_INFINITY;
    class NodeUI extends Node {
        constructor() {
            super(...arguments);
            this.alignmentType = 0;
            this.rendered = false;
            this.excluded = false;
            this.originalRoot = false;
            this.floatContainer = false;
            this.lineBreakLeading = false;
            this.lineBreakTrailing = false;
            this.baselineActive = false;
            this.baselineAltered = false;
            this.positioned = false;
            this._boxRegister = {};
            this._excludeSection = 0;
            this._excludeProcedure = 0;
            this._excludeResource = 0;
            this._childIndex = Number.POSITIVE_INFINITY;
            this._containerIndex = Number.POSITIVE_INFINITY;
            this._visible = true;
            this._locked = {};
        }
        static refitScreen(node, value) {
            const { width: screenWidth, height: screenHeight } = node.localSettings.screenDimension;
            let { width, height } = value;
            if (width > screenWidth) {
                height = Math.round(height * screenWidth / width);
                width = screenWidth;
            }
            else if (height > screenHeight) {
                width = Math.round(width * screenHeight / height);
                height = screenHeight;
            }
            else {
                return value;
            }
            return { width, height };
        }
        static outerRegion(node) {
            let top = Number.POSITIVE_INFINITY;
            let right = Number.NEGATIVE_INFINITY;
            let bottom = Number.NEGATIVE_INFINITY;
            let left = Number.POSITIVE_INFINITY;
            let negativeRight = Number.NEGATIVE_INFINITY;
            let negativeBottom = Number.NEGATIVE_INFINITY;
            let actualTop;
            let actualRight;
            let actualBottom;
            let actualLeft;
            node.each((item) => {
                if (item.companion) {
                    actualTop = item.actualRect('top');
                    actualRight = item.actualRect('right');
                    actualBottom = item.actualRect('bottom');
                    actualLeft = item.actualRect('left');
                }
                else {
                    ({ top: actualTop, right: actualRight, bottom: actualBottom, left: actualLeft } = item.linear);
                    if (item.marginRight < 0) {
                        const value = actualRight + Math.abs(item.marginRight);
                        if (value > negativeRight) {
                            negativeRight = value;
                        }
                    }
                    if (item.marginBottom < 0) {
                        const value = actualBottom + Math.abs(item.marginBottom);
                        if (value > negativeBottom) {
                            negativeBottom = value;
                        }
                    }
                }
                if (actualTop < top) {
                    top = actualTop;
                }
                if (actualRight > right) {
                    right = actualRight;
                }
                if (actualBottom > bottom) {
                    bottom = actualBottom;
                }
                if (actualLeft < left) {
                    left = actualLeft;
                }
            });
            return {
                top,
                right,
                bottom,
                left,
                width: Math.max(right, negativeRight) - left,
                height: Math.max(bottom, negativeBottom) - top
            };
        }
        static baseline(list, text = false) {
            const result = [];
            const length = list.length;
            let i = 0;
            while (i < length) {
                const item = list[i++];
                if (item.baseline && (!text || item.textElement) && !item.baselineAltered) {
                    if (item.naturalElements.length) {
                        if (item.baselineElement) {
                            result.push(item);
                        }
                    }
                    else {
                        result.push(item);
                    }
                }
            }
            if (result.length > 1) {
                result.sort((a, b) => {
                    if (a.length && b.length === 0) {
                        return 1;
                    }
                    else if (b.length && a.length === 0) {
                        return -1;
                    }
                    const heightA = a.baselineHeight + a.marginBottom;
                    const heightB = b.baselineHeight + b.marginBottom;
                    if (!equal(heightA, heightB)) {
                        return heightA > heightB ? -1 : 1;
                    }
                    else if (a.textElement && b.textElement) {
                        if (!a.pseudoElement && b.pseudoElement) {
                            return -1;
                        }
                        else if (a.pseudoElement && !b.pseudoElement) {
                            return 1;
                        }
                        else if (!a.plainText && b.plainText) {
                            return -1;
                        }
                        else if (a.plainText && !b.plainText) {
                            return 1;
                        }
                    }
                    else if (a.inputElement && b.inputElement && a.containerType !== b.containerType) {
                        return a.containerType > b.containerType ? -1 : 1;
                    }
                    else if (b.textElement && a.inputElement && b.childIndex < a.childIndex) {
                        return 1;
                    }
                    else if (a.textElement && b.inputElement && a.childIndex < b.childIndex) {
                        return -1;
                    }
                    const bottomA = a.bounds.bottom;
                    const bottomB = b.bounds.bottom;
                    if (bottomA > bottomB) {
                        return -1;
                    }
                    else if (bottomA < bottomB) {
                        return 1;
                    }
                    return 0;
                });
            }
            return result[0] || null;
        }
        static linearData(list, cleared) {
            const floated = new Set();
            let linearX = false;
            let linearY = false;
            const length = list.length;
            if (length > 1) {
                const nodes = new Array(length);
                let i = 0, n = 0;
                while (i < length) {
                    const item = list[i++];
                    if (item.pageFlow) {
                        if (item.floating) {
                            floated.add(item.float);
                        }
                        nodes[n++] = item;
                    }
                    else if (item.autoPosition) {
                        nodes[n++] = item;
                    }
                }
                if (n) {
                    nodes.length = n;
                    const siblings = [nodes[0]];
                    let x = 1;
                    let y = 1;
                    i = 1;
                    while (i < n) {
                        const node = nodes[i++];
                        if (node.alignedVertically(siblings, cleared) > 0) {
                            y++;
                        }
                        else {
                            x++;
                        }
                        if (x > 1 && y > 1) {
                            break;
                        }
                        siblings.push(node);
                    }
                    linearX = x === n;
                    linearY = y === n;
                    if (linearX && floated.size) {
                        let boxLeft = Number.POSITIVE_INFINITY;
                        let boxRight = Number.NEGATIVE_INFINITY;
                        let floatLeft = Number.NEGATIVE_INFINITY;
                        let floatRight = Number.POSITIVE_INFINITY;
                        i = 0;
                        while (i < n) {
                            const node = nodes[i++];
                            const { left, right } = node.linear;
                            boxLeft = Math.min(boxLeft, left);
                            boxRight = Math.max(boxRight, right);
                            switch (node.float) {
                                case 'left':
                                    floatLeft = Math.max(floatLeft, right);
                                    break;
                                case 'right':
                                    floatRight = Math.min(floatRight, left);
                                    break;
                            }
                        }
                        let j = 0, k = 0, l = 0, m = 0;
                        for (i = 0; i < n; ++i) {
                            const node = nodes[i];
                            const { left, right } = node.linear;
                            if (Math.floor(left) <= boxLeft) {
                                ++j;
                            }
                            if (Math.ceil(right) >= boxRight) {
                                ++k;
                            }
                            if (!node.floating) {
                                if (left === floatLeft) {
                                    ++l;
                                }
                                if (right === floatRight) {
                                    ++m;
                                }
                            }
                            if (i === 0) {
                                continue;
                            }
                            if (j === 2 || k === 2 || l === 2 || m === 2) {
                                linearX = false;
                                break;
                            }
                            const previous = nodes[i - 1];
                            if (withinRange(left, previous.linear.left) || previous.floating && Math.ceil(node.bounds.top) >= previous.bounds.bottom) {
                                linearX = false;
                                break;
                            }
                        }
                    }
                }
            }
            else if (length) {
                linearY = list[0].blockStatic;
                linearX = !linearY;
            }
            return { linearX, linearY, floated, cleared };
        }
        static partitionRows(list, cleared) {
            const result = [];
            let row = [];
            let siblings = [];
            const length = list.length;
            let i = 0;
            while (i < length) {
                const node = list[i++];
                let active = node;
                if (!node.naturalChild) {
                    if (node.nodeGroup) {
                        if (row.length) {
                            result.push(row);
                        }
                        result.push([node]);
                        row = [];
                        siblings.length = 0;
                        continue;
                    }
                    const wrapped = node.innerMostWrapped;
                    if (wrapped !== node) {
                        active = wrapped;
                    }
                }
                if (row.length === 0) {
                    row.push(node);
                    siblings.push(active);
                }
                else {
                    if (active.alignedVertically(siblings, cleared) > 0) {
                        if (row.length) {
                            result.push(row);
                        }
                        row = [node];
                        siblings = [active];
                    }
                    else {
                        row.push(node);
                        siblings.push(active);
                    }
                }
            }
            if (row.length) {
                result.push(row);
            }
            return result;
        }
        is(containerType) {
            return this.containerType === containerType;
        }
        of(containerType, ...alignmentType) {
            return this.is(containerType) && alignmentType.some(value => this.hasAlign(value));
        }
        attr(name, attr, value, overwrite = true) {
            let obj = this['__' + name];
            if (value) {
                if (!obj) {
                    if (!this._namespaces.includes(name)) {
                        this._namespaces.push(name);
                    }
                    obj = {};
                    this['__' + name] = obj;
                }
                if (overwrite && this.lockedAttr(name, attr)) {
                    overwrite = false;
                }
                if (!overwrite && obj[attr]) {
                    value = obj[attr];
                }
                else {
                    obj[attr] = value;
                }
                return value;
            }
            else {
                return (obj === null || obj === void 0 ? void 0 : obj[attr]) || '';
            }
        }
        unsafe(name, value) {
            if (value !== undefined) {
                this['_' + name] = value;
            }
            else {
                return this['_' + name];
            }
        }
        unset(name) {
            delete this['_' + name];
        }
        namespace(name) {
            return this['__' + name] || {};
        }
        delete(name, ...attrs) {
            const obj = this['__' + name];
            if (obj) {
                attrs.forEach(attr => {
                    if (attr.includes('*')) {
                        for (const [key] of searchObject(obj, attr)) {
                            delete obj[key];
                        }
                    }
                    else {
                        delete obj[attr];
                    }
                });
            }
        }
        lockAttr(name, attr) {
            safeNestedMap(this._locked, name)[attr] = true;
        }
        unlockAttr(name, attr) {
            const locked = this._locked[name];
            if (locked) {
                locked[attr] = false;
            }
        }
        lockedAttr(name, attr) {
            var _a;
            return ((_a = this._locked[name]) === null || _a === void 0 ? void 0 : _a[attr]) === true;
        }
        render(parent) {
            this.renderParent = parent;
            this.rendered = true;
        }
        parseUnit(value, dimension = 'width', parent = true, screenDimension) {
            return super.parseUnit(value, dimension, parent, screenDimension || this.localSettings.screenDimension);
        }
        parseWidth(value, parent = true) {
            return super.parseUnit(value, 'width', parent, this.localSettings.screenDimension);
        }
        parseHeight(value, parent = true) {
            return super.parseUnit(value, 'height', parent, this.localSettings.screenDimension);
        }
        renderEach(predicate) {
            const children = this.renderChildren;
            const length = children.length;
            let i = 0;
            while (i < length) {
                predicate(children[i], i++, children);
            }
            return this;
        }
        hide(options) {
            let remove;
            let replacement;
            if (options) {
                ({ remove, replacement } = options);
            }
            if (remove) {
                this.removeTry(replacement);
            }
            this.rendered = true;
            this.visible = false;
        }
        inherit(node, ...modules) {
            modules.forEach(name => {
                switch (name) {
                    case 'base': {
                        this._documentParent = node.documentParent;
                        this._bounds = node.bounds;
                        this._linear = node.linear;
                        this._box = node.box;
                        if (this.depth === -1) {
                            this.depth = node.depth;
                        }
                        const actualParent = node.actualParent;
                        if (actualParent) {
                            this.actualParent = actualParent;
                            this.dir = actualParent.dir;
                        }
                        break;
                    }
                    case 'initial':
                        cloneObject(node.unsafe('initial'), this.initial);
                        break;
                    case 'alignment': {
                        const styleMap = this._styleMap;
                        INHERIT_ALIGNMENT.forEach(attr => styleMap[attr] = node.css(attr));
                        if (!this.positionStatic) {
                            BOX_POSITION.forEach(attr => {
                                if (node.hasPX(attr)) {
                                    styleMap[attr] = node.css(attr);
                                }
                            });
                        }
                        Object.assign(this.autoMargin, node.autoMargin);
                        this.autoPosition = node.autoPosition;
                        break;
                    }
                    case 'styleMap':
                        this.cssCopyIfEmpty(node, ...Object.keys(node.unsafe('styleMap')));
                        break;
                    case 'textStyle':
                        this.cssApply(node.textStyle);
                        this.setCacheValue('fontSize', node.fontSize);
                        break;
                    case 'boxStyle': {
                        const { backgroundColor, backgroundImage } = node;
                        this.cssApply(node.cssAsObject('backgroundRepeat', 'backgroundSize', 'backgroundPositionX', 'backgroundPositionY', 'backgroundClip', 'boxSizing', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'borderTopStyle', 'borderRightStyle', 'borderBottomStyle', 'borderLeftStyle', 'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius'));
                        this.cssApply({
                            backgroundColor,
                            backgroundImage,
                            border: 'inherit',
                            borderRadius: 'inherit'
                        });
                        this.unsetCache('borderTopWidth', 'borderBottomWidth', 'borderRightWidth', 'borderLeftWidth');
                        this.setCacheValue('backgroundColor', backgroundColor);
                        this.setCacheValue('backgroundImage', backgroundImage);
                        node.setCacheValue('backgroundColor', '');
                        node.setCacheValue('backgroundImage', '');
                        node.cssApply({
                            backgroundColor: 'rgba(0, 0, 0, 0)',
                            backgroundImage: 'none',
                            border: 'initial',
                            borderRadius: 'initial'
                        });
                        const visibleStyle = node.visibleStyle;
                        visibleStyle.background = false;
                        visibleStyle.backgroundImage = false;
                        visibleStyle.backgroundRepeatX = false;
                        visibleStyle.backgroundRepeatY = false;
                        visibleStyle.backgroundColor = false;
                        visibleStyle.borderWidth = false;
                        break;
                    }
                }
            });
        }
        addAlign(value) {
            if (!this.hasAlign(value)) {
                this.alignmentType |= value;
            }
        }
        removeAlign(value) {
            if (this.hasAlign(value)) {
                this.alignmentType ^= value;
            }
        }
        hasAlign(value) {
            return hasBit$2(this.alignmentType, value);
        }
        hasResource(value) {
            return !hasBit$2(this._excludeResource, value);
        }
        hasProcedure(value) {
            return !hasBit$2(this._excludeProcedure, value);
        }
        hasSection(value) {
            return !hasBit$2(this._excludeSection, value);
        }
        exclude(options) {
            const { resource, procedure, section } = options;
            if (resource && !hasBit$2(this._excludeResource, resource)) {
                this._excludeResource |= resource;
            }
            if (procedure && !hasBit$2(this._excludeProcedure, procedure)) {
                this._excludeProcedure |= procedure;
            }
            if (section && !hasBit$2(this._excludeSection, section)) {
                this._excludeSection |= section;
            }
        }
        setExclusions() {
            var _a;
            if (this.naturalElement) {
                const dataset = this._element.dataset;
                const parentDataset = ((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.dataset) || {};
                if (Object.keys(dataset).length || Object.keys(parentDataset).length) {
                    const parseExclusions = (attr, enumeration) => {
                        let exclude = dataset[attr] || '';
                        let offset = 0;
                        const value = parentDataset[attr + 'Child'];
                        if (value) {
                            exclude += (exclude !== '' ? '|' : '') + value;
                        }
                        if (exclude !== '') {
                            exclude.split(/\s*\|\s*/).forEach(name => {
                                const i = enumeration[name.toUpperCase()] || 0;
                                if (i > 0 && !hasBit$2(offset, i)) {
                                    offset |= i;
                                }
                            });
                        }
                        return offset;
                    };
                    this.exclude({
                        resource: parseExclusions('excludeResource', NODE_RESOURCE),
                        procedure: parseExclusions('excludeProcedure', NODE_PROCEDURE),
                        section: parseExclusions('excludeSection', APP_SECTION)
                    });
                }
            }
        }
        appendTry(node, replacement, append = true) {
            const children = this.children;
            const length = children.length;
            for (let i = 0; i < length; ++i) {
                const item = children[i];
                if (item === node || item === node.innerMostWrapped || item === node.outerMostWrapper) {
                    children[i] = replacement;
                    replacement.parent = this;
                    replacement.containerIndex = node.containerIndex;
                    return true;
                }
            }
            if (append) {
                replacement.parent = this;
                return true;
            }
            return false;
        }
        removeTry(replacement, beforeReplace) {
            const renderParent = this.renderParent;
            if (renderParent) {
                const { renderTemplates, renderChildren } = renderParent;
                if (renderTemplates) {
                    const index = renderChildren.findIndex(node => node === this);
                    if (index !== -1) {
                        const template = renderTemplates[index];
                        if ((template === null || template === void 0 ? void 0 : template.node) === this) {
                            if (replacement) {
                                const parent = replacement.renderParent;
                                if (parent === this) {
                                    const templates = parent.renderTemplates;
                                    if (templates) {
                                        const replaceIndex = templates.findIndex(item => (item === null || item === void 0 ? void 0 : item.node) === replacement);
                                        if (replaceIndex !== -1) {
                                            parent.renderChildren.splice(replaceIndex, 1);
                                        }
                                        if (renderParent.appendTry(this, replacement, false)) {
                                            if (beforeReplace) {
                                                beforeReplace.bind(this, replacement)();
                                            }
                                            renderTemplates[index] = templates[replaceIndex];
                                            replacement.renderParent = renderParent;
                                            renderChildren[index] = replacement;
                                            if (this.documentRoot) {
                                                replacement.documentRoot = true;
                                                this.documentRoot = false;
                                            }
                                            replacement.depth = this.depth;
                                            this.renderParent = undefined;
                                            return true;
                                        }
                                    }
                                }
                            }
                            else {
                                if (beforeReplace) {
                                    beforeReplace.bind(this, replacement)();
                                }
                                renderTemplates.splice(index, 1);
                                renderChildren.splice(index, 1);
                                this.renderParent = undefined;
                                return true;
                            }
                        }
                    }
                }
            }
            return false;
        }
        sort(predicate) {
            if (predicate) {
                super.sort(predicate);
            }
            else {
                this.children.sort((a, b) => a.containerIndex < b.containerIndex ? -1 : 1);
            }
            return this;
        }
        alignedVertically(siblings, cleared, horizontal) {
            if (this.lineBreak) {
                return 2 /* LINEBREAK */;
            }
            else if (this.autoPosition && isArray(siblings)) {
                return siblings[siblings.length - 1].blockStatic ? 1 /* VERTICAL */ : 0 /* HORIZONTAL */;
            }
            else if (this.pageFlow) {
                const floating = this.floating;
                if (isArray(siblings)) {
                    const previous = siblings[siblings.length - 1];
                    if (cleared) {
                        if (cleared.size && (cleared.has(this) || this.siblingsLeading.some(item => item.excluded && cleared.has(item)))) {
                            return 4 /* FLOAT_CLEAR */;
                        }
                        else {
                            if (floating && previous.floating) {
                                if (horizontal && this.float === previous.float || Math.floor(this.bounds.top) === Math.floor(previous.bounds.top)) {
                                    return 0 /* HORIZONTAL */;
                                }
                                else if (Math.ceil(this.bounds.top) >= previous.bounds.bottom) {
                                    if (siblings.every(item => item.inlineDimension)) {
                                        const actualParent = this.actualParent;
                                        if (actualParent && actualParent.ascend({ condition: item => !item.inline && item.hasWidth, error: item => item.layoutElement, startSelf: true })) {
                                            const length = actualParent.naturalChildren.filter((item) => item.visible && item.pageFlow).length;
                                            if (length === siblings.length + 1) {
                                                const getLayoutWidth = (node) => node.actualWidth + Math.max(node.marginLeft, 0) + node.marginRight;
                                                let width = actualParent.box.width - getLayoutWidth(this);
                                                siblings.forEach(item => width -= getLayoutWidth(item));
                                                if (width >= 0) {
                                                    return 0 /* HORIZONTAL */;
                                                }
                                            }
                                        }
                                    }
                                    return 6 /* FLOAT_WRAP */;
                                }
                            }
                            else if (this.blockStatic && siblings.reduce((a, b) => a + (b.floating ? b.linear.width : Number.NEGATIVE_INFINITY), 0) / this.actualParent.box.width >= 0.8) {
                                return 7 /* FLOAT_INTERSECT */;
                            }
                            else if (siblings.every(item => item.inlineDimension && Math.ceil(this.bounds.top) >= item.bounds.bottom)) {
                                return 5 /* FLOAT_BLOCK */;
                            }
                            else if (horizontal !== undefined) {
                                if (floating && !horizontal && previous.blockStatic) {
                                    return 0 /* HORIZONTAL */;
                                }
                                else if (!this.display.startsWith('inline-')) {
                                    let { top, bottom } = this.bounds;
                                    if (this.textElement && cleared.size && siblings.some(item => cleared.has(item)) && siblings.some(item => Math.floor(top) < item.bounds.top && Math.ceil(bottom) > item.bounds.bottom)) {
                                        return 7 /* FLOAT_INTERSECT */;
                                    }
                                    else if (siblings[0].floating) {
                                        if (siblings.length > 1) {
                                            const float = siblings[0].float;
                                            let maxBottom = Number.NEGATIVE_INFINITY;
                                            let contentWidth = 0;
                                            siblings.forEach(item => {
                                                if (item.floating) {
                                                    if (item.float === float) {
                                                        maxBottom = Math.max(item.actualRect('bottom', 'bounds'), maxBottom);
                                                    }
                                                    contentWidth += item.linear.width;
                                                }
                                            });
                                            if (Math.ceil(contentWidth) >= this.actualParent.box.width) {
                                                return 5 /* FLOAT_BLOCK */;
                                            }
                                            else if (this.multiline) {
                                                if (this.styleText) {
                                                    const textBounds = this.textBounds;
                                                    if (textBounds) {
                                                        bottom = textBounds.bottom;
                                                    }
                                                }
                                                const offset = bottom - maxBottom;
                                                top = offset <= 0 || offset / (bottom - top) < 0.5 ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
                                            }
                                            else {
                                                top = Math.ceil(top);
                                            }
                                            if (top < Math.floor(maxBottom)) {
                                                return horizontal ? 0 /* HORIZONTAL */ : 5 /* FLOAT_BLOCK */;
                                            }
                                            else {
                                                return horizontal ? 5 /* FLOAT_BLOCK */ : 0 /* HORIZONTAL */;
                                            }
                                        }
                                        else if (!horizontal) {
                                            return 5 /* FLOAT_BLOCK */;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (checkBlockDimension(this, previous)) {
                        return 3 /* INLINE_WRAP */;
                    }
                    else {
                        const percentWidth = getPercentWidth(this);
                        if (percentWidth > 0 && siblings.reduce((a, b) => a + getPercentWidth(b), percentWidth) > 1) {
                            return 8 /* PERCENT_WRAP */;
                        }
                    }
                }
                for (const previous of this.siblingsLeading) {
                    if (previous.lineBreak) {
                        return 2 /* LINEBREAK */;
                    }
                    else if (previous.blockStatic || previous.autoMargin.leftRight || (floating && previous.childIndex === 0 || horizontal === false) && previous.plainText && previous.multiline) {
                        return 1 /* VERTICAL */;
                    }
                    else if ((this.blockStatic || this.display === 'table') && (!previous.floating || (cleared === null || cleared === void 0 ? void 0 : cleared.has(previous)))) {
                        return 1 /* VERTICAL */;
                    }
                    else if (previous.floating) {
                        if (previous.float === 'left') {
                            if (this.autoMargin.right) {
                                return 5 /* FLOAT_BLOCK */;
                            }
                        }
                        else if (this.autoMargin.left) {
                            return 5 /* FLOAT_BLOCK */;
                        }
                        if (this.floatContainer && this.some(item => item.floating && Math.ceil(item.bounds.top) >= previous.bounds.bottom)) {
                            return 5 /* FLOAT_BLOCK */;
                        }
                    }
                    if ((cleared === null || cleared === void 0 ? void 0 : cleared.has(previous)) && !((siblings === null || siblings === void 0 ? void 0 : siblings[0]) === previous)) {
                        return 4 /* FLOAT_CLEAR */;
                    }
                    else if (checkBlockDimension(this, previous)) {
                        return 3 /* INLINE_WRAP */;
                    }
                }
            }
            else {
                return 1 /* VERTICAL */;
            }
            return 0 /* HORIZONTAL */;
        }
        previousSiblings(options = {}) {
            var _a, _b, _c;
            return traverseElementSibling(options, (this.nodeGroup ? (_b = (_a = this.firstChild) === null || _a === void 0 ? void 0 : _a.element) === null || _b === void 0 ? void 0 : _b.previousSibling : (_c = this.innerMostWrapped.element) === null || _c === void 0 ? void 0 : _c.previousSibling), 'previousSibling', this.sessionId);
        }
        nextSiblings(options = {}) {
            var _a, _b, _c;
            return traverseElementSibling(options, (this.nodeGroup ? (_b = (_a = this.firstChild) === null || _a === void 0 ? void 0 : _a.element) === null || _b === void 0 ? void 0 : _b.nextSibling : (_c = this.innerMostWrapped.element) === null || _c === void 0 ? void 0 : _c.nextSibling), 'nextSibling', this.sessionId);
        }
        modifyBox(region, offset, negative = true) {
            if (offset !== 0) {
                const attr = CSS_SPACING.get(region);
                if (attr) {
                    const node = this._boxRegister[region];
                    if (offset === undefined) {
                        if (node) {
                            const value = this[attr] || node.getBox(region)[1];
                            if (value > 0) {
                                node.modifyBox(region, -value, negative);
                            }
                        }
                        else {
                            this._boxReset[attr] = 1;
                        }
                    }
                    else {
                        if (node) {
                            node.modifyBox(region, offset, negative);
                        }
                        else {
                            const boxAdjustment = this._boxAdjustment;
                            if (!negative && (this._boxReset[attr] === 0 ? this[attr] : 0) + boxAdjustment[attr] + offset <= 0) {
                                boxAdjustment[attr] = 0;
                                if (this[attr] >= 0 && offset < 0) {
                                    this._boxReset[attr] = 1;
                                }
                            }
                            else {
                                boxAdjustment[attr] += offset;
                            }
                        }
                    }
                }
            }
        }
        getBox(region) {
            const attr = CSS_SPACING.get(region);
            return attr ? [this._boxReset[attr], this._boxAdjustment[attr]] : [NaN, 0];
        }
        setBox(region, options) {
            const attr = CSS_SPACING.get(region);
            if (attr) {
                const node = this._boxRegister[region];
                if (node) {
                    node.setBox(region, options);
                }
                else {
                    const { reset, adjustment } = options;
                    const boxReset = this._boxReset;
                    const boxAdjustment = this._boxAdjustment;
                    if (reset !== undefined) {
                        boxReset[attr] = reset;
                    }
                    if (adjustment !== undefined) {
                        let value = boxAdjustment[attr];
                        if (options.accumulate) {
                            value += adjustment;
                        }
                        else {
                            value = adjustment;
                        }
                        if (options.negative === false && (boxReset[attr] === 0 ? this[attr] : 0) + value <= 0) {
                            value = 0;
                            if (this[attr] >= 0 && value < 0) {
                                boxReset[attr] = 1;
                            }
                        }
                        boxAdjustment[attr] = value;
                    }
                    else if (reset === 1 && !this.naturalChild) {
                        boxAdjustment[attr] = 0;
                    }
                }
            }
        }
        resetBox(region, node) {
            const boxReset = this._boxReset;
            const applyReset = (attrs, start) => {
                for (let i = 0; i < 4; ++i) {
                    const key = CSS_SPACING_KEYS[i + start];
                    if (hasBit$2(region, key)) {
                        const name = attrs[i];
                        boxReset[name] = 1;
                        if (node) {
                            const previous = this.registerBox(key);
                            if (previous) {
                                previous.resetBox(key, node);
                            }
                            else {
                                if (this.naturalChild) {
                                    const value = this[name];
                                    if (value >= 0) {
                                        node.modifyBox(key, value);
                                    }
                                }
                                this.transferBox(key, node);
                            }
                        }
                    }
                }
            };
            if (hasBit$2(30 /* MARGIN */, region)) {
                applyReset(BOX_MARGIN, 0);
            }
            if (hasBit$2(480 /* PADDING */, region)) {
                applyReset(BOX_PADDING, 4);
            }
        }
        transferBox(region, node) {
            const boxAdjustment = this._boxAdjustment;
            const applyReset = (attrs, start) => {
                for (let i = 0; i < 4; ++i) {
                    const key = CSS_SPACING_KEYS[i + start];
                    if (hasBit$2(region, key)) {
                        const previous = this.registerBox(key);
                        if (previous) {
                            previous.transferBox(key, node);
                        }
                        else {
                            const name = attrs[i];
                            const value = boxAdjustment[name];
                            if (value !== 0) {
                                node.modifyBox(key, value, false);
                                boxAdjustment[name] = 0;
                            }
                            this.registerBox(key, node);
                        }
                    }
                }
            };
            if (hasBit$2(30 /* MARGIN */, region)) {
                applyReset(BOX_MARGIN, 0);
            }
            if (hasBit$2(480 /* PADDING */, region)) {
                applyReset(BOX_PADDING, 4);
            }
        }
        registerBox(region, node) {
            const boxRegister = this._boxRegister;
            if (node) {
                boxRegister[region] = node;
            }
            else {
                node = boxRegister[region];
            }
            while (node) {
                const next = node.unsafe('boxRegister')[region];
                if (next) {
                    node = next;
                }
                else {
                    break;
                }
            }
            return node;
        }
        actualPadding(attr, value) {
            if (value > 0) {
                if (!this.layoutElement) {
                    const node = this.innerMostWrapped;
                    if (node !== this) {
                        if (node.naturalChild) {
                            if (node.getBox(attr === 'paddingTop' ? 32 /* PADDING_TOP */ : 128 /* PADDING_BOTTOM */)[0] === 0) {
                                return 0;
                            }
                        }
                        else {
                            return value;
                        }
                    }
                    if (node.naturalChild) {
                        return canCascadeChildren(node) && cascadeActualPadding(node.naturalChildren, attr, value) ? 0 : value;
                    }
                }
                else if (this.gridElement) {
                    switch (this.css('alignContent')) {
                        case 'space-around':
                        case 'space-evenly':
                            return 0;
                    }
                }
                return value;
            }
            return 0;
        }
        actualBoxWidth(value) {
            if (!value) {
                value = this.box.width;
            }
            if (this.pageFlow && !this.documentRoot) {
                let offsetLeft = 0;
                let offsetRight = 0;
                let current = this.actualParent;
                while (current) {
                    if (current.hasPX('width', false) || !current.pageFlow) {
                        return value;
                    }
                    else {
                        offsetLeft += Math.max(current.marginLeft, 0) + current.borderLeftWidth + current.paddingLeft;
                        offsetRight += current.paddingRight + current.borderRightWidth + current.marginRight;
                    }
                    if (current.documentRoot) {
                        break;
                    }
                    else {
                        current = current.actualParent;
                    }
                }
                const screenWidth = this.localSettings.screenDimension.width - offsetLeft - offsetRight;
                if (screenWidth > 0) {
                    return Math.min(value, screenWidth);
                }
            }
            return value;
        }
        cloneBase(node) {
            node.localSettings = this.localSettings;
            node.alignmentType = this.alignmentType;
            node.containerName = this.containerName;
            node.depth = this.depth;
            node.visible = this.visible;
            node.excluded = this.excluded;
            node.rendered = this.rendered;
            node.childIndex = this.childIndex;
            node.containerIndex = this.containerIndex;
            node.inlineText = this.inlineText;
            node.lineBreakLeading = this.lineBreakLeading;
            node.lineBreakTrailing = this.lineBreakTrailing;
            node.actualParent = this.actualParent;
            node.documentParent = this.documentParent;
            node.documentRoot = this.documentRoot;
            node.renderParent = this.renderParent;
            if (this.length) {
                node.retain(this.duplicate());
            }
            node.inherit(this, 'initial', 'base', 'alignment', 'styleMap', 'textStyle');
            Object.assign(node.unsafe('cached'), this._cached);
        }
        unsetCache(...attrs) {
            if (attrs.length) {
                const cached = this._cached;
                attrs.forEach(attr => {
                    switch (attr) {
                        case 'top':
                        case 'right':
                        case 'bottom':
                        case 'left':
                            cached.autoPosition = undefined;
                            break;
                        case 'lineHeight':
                            cached.baselineHeight = undefined;
                            break;
                    }
                });
            }
            super.unsetCache(...attrs);
        }
        css(attr, value, cache = false) {
            if (arguments.length >= 2) {
                if (value) {
                    this._styleMap[attr] = value;
                }
                else {
                    delete this._styleMap[attr];
                }
                if (cache) {
                    this.unsetCache(attr);
                }
            }
            return this._styleMap[attr] || this.styleElement && this.style[attr] || '';
        }
        cssApply(values, cache = false) {
            Object.assign(this._styleMap, values);
            if (cache) {
                this.unsetCache(...Object.keys(values));
            }
            return this;
        }
        cssSet(attr, value, cache = true) {
            return super.css(attr, value, cache);
        }
        setCacheValue(attr, value) {
            this._cached[attr] = value;
        }
        get element() {
            return this._element || !!this.innerWrapped && this.innerMostWrapped.unsafe('element') || null;
        }
        set naturalChild(value) {
            this._cached.naturalChild = value;
        }
        get naturalChild() {
            var _a;
            let result = this._cached.naturalChild;
            if (result === undefined) {
                result = !!((_a = this._element) === null || _a === void 0 ? void 0 : _a.parentElement);
                this._cached.naturalChild = result;
            }
            return result;
        }
        get pseudoElement() {
            var _a;
            return ((_a = this._element) === null || _a === void 0 ? void 0 : _a.className) === '__squared.pseudo';
        }
        set documentParent(value) {
            this._documentParent = value;
        }
        get documentParent() {
            return (this._documentParent || this.absoluteParent || this.actualParent || this.parent || this);
        }
        set containerName(value) {
            this._cached.containerName = value.toUpperCase();
        }
        get containerName() {
            let result = this._cached.containerName;
            if (result === undefined) {
                const element = this.element;
                if (element) {
                    if (isTextNode$1(element)) {
                        result = 'PLAINTEXT';
                    }
                    else if (element.tagName === 'INPUT') {
                        result = 'INPUT_' + convertWord(element.type, true).toUpperCase();
                    }
                    else {
                        result = element.tagName.toUpperCase();
                    }
                }
                else {
                    result = '';
                }
                this._cached.containerName = result;
            }
            return result;
        }
        get layoutHorizontal() {
            return this.hasAlign(8 /* HORIZONTAL */);
        }
        get layoutVertical() {
            if (this.hasAlign(16 /* VERTICAL */)) {
                return true;
            }
            else if (this.naturalChild) {
                const children = this.naturalChildren;
                return children.length === 1 && children[0].blockStatic;
            }
            return false;
        }
        get nodeGroup() {
            return false;
        }
        set renderAs(value) {
            if (!this.rendered && (value === null || value === void 0 ? void 0 : value.rendered) === false) {
                this._renderAs = value;
            }
        }
        get renderAs() {
            return this._renderAs;
        }
        get blockStatic() {
            return super.blockStatic || this.hasAlign(64 /* BLOCK */) && this.pageFlow && !this.floating;
        }
        get rightAligned() {
            return super.rightAligned || this.hasAlign(2048 /* RIGHT */);
        }
        set autoPosition(value) {
            this._cached.autoPosition = value;
        }
        get autoPosition() {
            let result = this._cached.autoPosition;
            if (result === undefined) {
                if (this.pageFlow) {
                    result = false;
                }
                else {
                    const { top, right, bottom, left } = this._styleMap;
                    result = (!top || top === 'auto') && (!left || left === 'auto') && (!right || right === 'auto') && (!bottom || bottom === 'auto');
                }
                this._cached.autoPosition = result;
            }
            return result;
        }
        set textContent(value) {
            this._cached.textContent = value;
        }
        get textContent() {
            let result = this._cached.textContent;
            if (result === undefined) {
                result = this.naturalChild && this._element.textContent || '';
                this._cached.textContent = result;
            }
            return result;
        }
        get positiveAxis() {
            let result = this._cached.positiveAxis;
            if (result === undefined) {
                result = (!this.positionRelative || this.positionRelative && this.top >= 0 && this.left >= 0 && (this.right <= 0 || this.hasPX('left')) && (this.bottom <= 0 || this.hasPX('top'))) && this.marginTop >= 0 && this.marginLeft >= 0 && this.marginRight >= 0;
                this._cached.positiveAxis = result;
            }
            return result;
        }
        get leftTopAxis() {
            let result = this._cached.leftTopAxis;
            if (result === undefined) {
                switch (this.cssInitial('position')) {
                    case 'absolute':
                        result = this.absoluteParent === this.documentParent;
                        break;
                    case 'fixed':
                        result = true;
                        break;
                    default:
                        result = false;
                        break;
                }
                this._cached.leftTopAxis = result;
            }
            return result;
        }
        get baselineElement() {
            let result = this._cached.baselineElement;
            if (result === undefined) {
                if (this.baseline) {
                    const children = this.naturalChildren;
                    if (children.length) {
                        result = children.every((node) => node.baselineElement && node.length === 0);
                    }
                    else {
                        result = this.inlineText && this.textElement || this.plainText && !this.multiline || this.inputElement || this.imageElement || this.svgElement;
                    }
                }
                else {
                    result = false;
                }
                this._cached.baselineElement = result;
            }
            return result;
        }
        set multiline(value) {
            this._cached.multiline = value;
            this._cached.baselineElement = undefined;
        }
        get multiline() {
            return super.multiline;
        }
        set visible(value) {
            this._visible = value;
        }
        get visible() {
            return this._visible;
        }
        set controlName(value) {
            if (!this.rendered || !this._controlName) {
                this._controlName = value;
            }
        }
        get controlName() {
            return this._controlName || '';
        }
        set actualParent(value) {
            this._cached.actualParent = value;
        }
        get actualParent() {
            let result = this._cached.actualParent;
            if (result === undefined) {
                result = super.actualParent;
                if (result === null) {
                    result = this.innerMostWrapped.actualParent;
                }
                this._cached.actualParent = result;
            }
            return result;
        }
        set siblingsLeading(value) {
            this._siblingsLeading = value;
        }
        get siblingsLeading() {
            return this._siblingsLeading || this.previousSiblings();
        }
        set siblingsTrailing(value) {
            this._siblingsTrailing = value;
        }
        get siblingsTrailing() {
            return this._siblingsTrailing || this.nextSiblings();
        }
        get previousSibling() {
            const parent = this.actualParent;
            if (parent) {
                const children = parent.naturalChildren;
                const index = children.indexOf(this);
                if (index !== -1) {
                    let i = index - 1;
                    while (i >= 0) {
                        const node = children[i--];
                        if (node && (!node.excluded || node.lineBreak)) {
                            return node;
                        }
                    }
                }
            }
            return null;
        }
        get nextSibling() {
            const parent = this.actualParent;
            if (parent) {
                const children = parent.naturalChildren;
                const index = children.indexOf(this);
                if (index !== -1) {
                    const length = children.length;
                    let i = index + 1;
                    while (i < length) {
                        const node = children[i++];
                        if (node && (!node.excluded || node.lineBreak)) {
                            return node;
                        }
                    }
                }
            }
            return null;
        }
        get firstChild() {
            return this.naturalChildren[0] || null;
        }
        get lastChild() {
            const children = this.naturalChildren;
            return children[children.length - 1] || null;
        }
        get onlyChild() {
            var _a, _b, _c;
            return ((_b = (_a = this.renderParent) === null || _a === void 0 ? void 0 : _a.renderChildren.length) !== null && _b !== void 0 ? _b : (_c = this.parent) === null || _c === void 0 ? void 0 : _c.length) === 1 && !this.documentRoot;
        }
        set childIndex(value) {
            this._childIndex = value;
        }
        get childIndex() {
            let result = this._childIndex;
            if (result === Number.POSITIVE_INFINITY) {
                let wrapped = this.innerWrapped;
                if (wrapped) {
                    do {
                        const index = wrapped.childIndex;
                        if (index !== Number.POSITIVE_INFINITY) {
                            result = index;
                            this._childIndex = result;
                            break;
                        }
                        wrapped = wrapped.innerWrapped;
                    } while (wrapped);
                }
                else {
                    const element = this._element;
                    if (element) {
                        const parentElement = element.parentElement;
                        if (parentElement) {
                            iterateArray$1(parentElement.childNodes, (item, index) => {
                                if (item === element) {
                                    result = index;
                                    this._childIndex = index;
                                    return true;
                                }
                                return;
                            });
                        }
                    }
                }
            }
            return result;
        }
        set containerIndex(value) {
            this._containerIndex = value;
        }
        get containerIndex() {
            let result = this._containerIndex;
            if (result === Number.POSITIVE_INFINITY) {
                let wrapped = this.innerWrapped;
                while (wrapped) {
                    const index = wrapped.containerIndex;
                    if (index !== Number.POSITIVE_INFINITY) {
                        result = index;
                        this._containerIndex = result;
                        break;
                    }
                    wrapped = wrapped.innerWrapped;
                }
            }
            return result;
        }
        get textEmpty() {
            let result = this._cached.textEmpty;
            if (result === undefined) {
                if (this.styleElement && !this.imageElement && !this.svgElement) {
                    const value = this.textContent;
                    result = value === '' || !this.preserveWhiteSpace && value.trim() === '';
                }
                else {
                    result = false;
                }
                this._cached.textEmpty = result;
            }
            return result;
        }
        get innerMostWrapped() {
            if (this.naturalChild) {
                return this;
            }
            let result = this.innerWrapped;
            while (result) {
                const innerWrapped = result.innerWrapped;
                if (innerWrapped) {
                    result = innerWrapped;
                }
                else {
                    break;
                }
            }
            return result || this;
        }
        get outerMostWrapper() {
            let result = this.outerWrapper;
            while (result) {
                const outerWrapper = result.outerWrapper;
                if (outerWrapper) {
                    result = outerWrapper;
                }
                else {
                    break;
                }
            }
            return result || this;
        }
        get preserveWhiteSpace() {
            let result = this._cached.whiteSpace;
            if (result === undefined) {
                const value = this.css('whiteSpace');
                result = value === 'pre' || value === 'pre-wrap';
                this._cached.whiteSpace = result;
            }
            return result;
        }
        get outerExtensionElement() {
            if (this.naturalChild) {
                let parent = this._element.parentElement;
                while (parent) {
                    if (parent.dataset.use) {
                        return parent;
                    }
                    parent = parent.parentElement;
                }
            }
            return null;
        }
        get extensions() {
            let result = this._cached.extensions;
            if (result === undefined) {
                const use = this.dataset.use;
                result = use ? spliceArray(use.split(XML$3.SEPARATOR), value => value === '') : [];
                this._cached.extensions = result;
            }
            return result;
        }
    }

    const { hasBit: hasBit$3 } = squared.lib.util;
    class LayoutUI extends squared.lib.base.Container {
        constructor(parent, node, containerType = 0, alignmentType = 0, children) {
            super(children);
            this.parent = parent;
            this.node = node;
            this.containerType = containerType;
            this.alignmentType = alignmentType;
            this.rowCount = 0;
            this.columnCount = 0;
            this.renderType = 0;
            this.renderIndex = -1;
        }
        static create(options) {
            const { parent, node, containerType, alignmentType, children, itemCount, rowCount, columnCount } = options;
            const layout = new LayoutUI(parent, node, containerType, alignmentType, children);
            if (itemCount) {
                layout.itemCount = itemCount;
            }
            if (rowCount) {
                layout.rowCount = rowCount;
            }
            if (columnCount) {
                layout.columnCount = columnCount;
            }
            return layout;
        }
        init() {
            const length = this.length;
            if (length > 1) {
                const linearData = NodeUI.linearData(this.children);
                this._floated = linearData.floated;
                this._linearX = linearData.linearX;
                this._linearY = linearData.linearY;
            }
            else if (length) {
                this._linearY = this.item(0).blockStatic;
                this._linearX = !this._linearY;
            }
            else {
                return;
            }
            this._initialized = true;
        }
        setContainerType(containerType, alignmentType) {
            this.containerType = containerType;
            if (alignmentType) {
                this.add(alignmentType);
            }
        }
        hasAlign(value) {
            return hasBit$3(this.alignmentType, value);
        }
        add(value) {
            if (!hasBit$3(this.alignmentType, value)) {
                this.alignmentType |= value;
            }
            return this.alignmentType;
        }
        addRender(value) {
            if (!hasBit$3(this.renderType, value)) {
                this.renderType |= value;
            }
            return this.renderType;
        }
        delete(value) {
            if (hasBit$3(this.alignmentType, value)) {
                this.alignmentType ^= value;
            }
            return this.alignmentType;
        }
        retain(list) {
            super.retain(list);
            this.init();
            return this;
        }
        set itemCount(value) {
            this._itemCount = value;
        }
        get itemCount() {
            var _a;
            return (_a = this._itemCount) !== null && _a !== void 0 ? _a : this.length;
        }
        get linearX() {
            var _a;
            if (!this._initialized) {
                this.init();
            }
            return (_a = this._linearX) !== null && _a !== void 0 ? _a : true;
        }
        get linearY() {
            var _a;
            if (!this._initialized) {
                this.init();
            }
            return (_a = this._linearY) !== null && _a !== void 0 ? _a : false;
        }
        get floated() {
            if (!this._initialized) {
                this.init();
            }
            return this._floated || new Set();
        }
        set type(value) {
            this.setContainerType(value.containerType, value.alignmentType);
            const renderType = value.renderType;
            if (renderType) {
                this.addRender(renderType);
            }
        }
        get singleRowAligned() {
            let result = this._singleRow;
            if (result === undefined) {
                const length = this.length;
                if (length) {
                    result = true;
                    if (length > 1) {
                        let previousBottom = Number.POSITIVE_INFINITY;
                        const children = this.children;
                        let i = 0;
                        while (i < length) {
                            const node = children[i++];
                            if (node.blockStatic || node.multiline || Math.ceil(node.bounds.top) >= previousBottom) {
                                result = false;
                                break;
                            }
                            previousBottom = node.bounds.bottom;
                        }
                    }
                    this._singleRow = result;
                }
                else {
                    result = false;
                }
            }
            return result;
        }
        get unknownAligned() {
            return this.length > 1 && !this.linearX && !this.linearY;
        }
    }

    const $lib$4 = squared.lib;
    const { BOX_POSITION: BOX_POSITION$1, TEXT_STYLE: TEXT_STYLE$1, convertListStyle, formatPX: formatPX$1, getStyle: getStyle$2, insertStyleSheetRule: insertStyleSheetRule$1, resolveURL } = $lib$4.css;
    const { getNamedItem: getNamedItem$1, isTextNode: isTextNode$2, removeElementsByClassName } = $lib$4.dom;
    const { maxArray } = $lib$4.math;
    const { appendSeparator, convertFloat: convertFloat$1, convertWord: convertWord$1, flatArray, hasBit: hasBit$4, hasMimeType: hasMimeType$1, isString: isString$3, iterateArray: iterateArray$2, partitionArray, safeNestedArray, safeNestedMap: safeNestedMap$1, trimBoth, trimString } = $lib$4.util;
    const { XML: XML$4 } = $lib$4.regex;
    const { getElementCache: getElementCache$2, getPseudoElt: getPseudoElt$1, setElementCache: setElementCache$2 } = $lib$4.session;
    const { isPlainText } = $lib$4.xml;
    const REGEX_COUNTER = /\s*(?:attr\(([^)]+)\)|(counter)\(([^,)]+)(?:,\s+([a-z-]+))?\)|(counters)\(([^,]+),\s+"([^"]*)"(?:,\s+([a-z-]+))?\)|"([^"]+)")\s*/g;
    const STRING_PSEUDOPREFIX = '__squared_';
    function createPseudoElement(parent, tagName = 'span', index = -1) {
        const element = document.createElement(tagName);
        element.className = '__squared.pseudo';
        element.style.setProperty('display', 'none');
        if (index >= 0 && index < parent.childNodes.length) {
            parent.insertBefore(element, parent.childNodes[index]);
        }
        else {
            parent.appendChild(element);
        }
        return element;
    }
    function saveAlignment(preAlignment, element, id, attr, value, restoreValue) {
        safeNestedMap$1(preAlignment, id)[attr] = restoreValue;
        element.style.setProperty(attr, value);
    }
    function getCounterValue(name, counterName, fallback = 1) {
        if (name !== 'none') {
            const pattern = /\s*([^\-\d][^\-\d]?[^\s]*)\s+(-?\d+)\s*/g;
            let match;
            while ((match = pattern.exec(name)) !== null) {
                if (match[1] === counterName) {
                    return parseInt(match[2]);
                }
            }
            return fallback;
        }
        return undefined;
    }
    function getCounterIncrementValue(parent, counterName, pseudoElt, sessionId, fallback) {
        var _a;
        const counterIncrement = (_a = getElementCache$2(parent, `styleMap${pseudoElt}`, sessionId)) === null || _a === void 0 ? void 0 : _a.counterIncrement;
        return counterIncrement ? getCounterValue(counterIncrement, counterName, fallback) : undefined;
    }
    function checkTraverseHorizontal(node, horizontal, vertical) {
        if (vertical.length) {
            return false;
        }
        horizontal.push(node);
        return true;
    }
    function checkTraverseVertical(node, horizontal, vertical) {
        if (horizontal.length) {
            return false;
        }
        vertical.push(node);
        return true;
    }
    function prioritizeExtensions(value, extensions) {
        if (value) {
            const included = value.split(XML$4.SEPARATOR);
            const result = [];
            const untagged = [];
            extensions.forEach(ext => {
                const index = included.indexOf(ext.name);
                if (index !== -1) {
                    result[index] = ext;
                }
                else {
                    untagged.push(ext);
                }
            });
            if (result.length) {
                return flatArray(result).concat(untagged);
            }
        }
        return extensions;
    }
    function getFloatAlignmentType(nodes) {
        let result = 0;
        let floating = true;
        let right = true;
        const length = nodes.length;
        let i = 0;
        while (i < length) {
            const item = nodes[i++];
            if (!item.floating) {
                floating = false;
            }
            if (!item.rightAligned) {
                right = false;
            }
            if (!floating && !right) {
                break;
            }
        }
        if (floating) {
            result |= 512 /* FLOAT */;
        }
        if (right) {
            result |= 2048 /* RIGHT */;
        }
        return result;
    }
    const isHorizontalAligned = (node) => !node.blockStatic && node.autoMargin.horizontal !== true && !(node.blockDimension && node.css('width') === '100%') && (!(node.plainText && node.multiline) || node.floating);
    const requirePadding = (node) => node.textElement && (node.blockStatic || node.multiline);
    const getRelativeOffset = (item, fromRight) => item.positionRelative ? (item.hasPX('left') ? item.left * (fromRight ? 1 : -1) : item.right * (fromRight ? -1 : 1)) : 0;
    class ApplicationUI extends Application {
        constructor(framework, nodeConstructor, ControllerConstructor, ResourceConstructor, ExtensionManagerConstructor) {
            super(framework, nodeConstructor, ControllerConstructor, ResourceConstructor, ExtensionManagerConstructor);
            this.session = {
                cache: new NodeList(),
                excluded: new NodeList(),
                extensionMap: new Map(),
                clearMap: new Map(),
                active: [],
                targetQueue: new Map()
            };
            this.builtInExtensions = {};
            this.extensions = [];
            this._layouts = [];
            const localSettings = this.controllerHandler.localSettings;
            this._controllerSettings = localSettings;
            this._excluded = localSettings.unsupported.excluded;
        }
        finalize() {
            if (this.closed) {
                return;
            }
            const { controllerHandler, session } = this;
            const cache = session.cache;
            const extensions = this.extensions;
            const layouts = this._layouts;
            for (const [node, template] of session.targetQueue.entries()) {
                const parent = this.resolveTarget(node.dataset.target);
                if (parent) {
                    node.render(parent);
                    this.addLayoutTemplate(parent, node, template);
                }
                else if (!node.renderParent) {
                    cache.remove(node);
                }
            }
            const children = cache.children;
            const length = children.length;
            const rendered = new Array(length);
            let i = 0, j = 0;
            while (i < length) {
                const node = children[i++];
                if (node.renderParent && node.visible) {
                    if (node.hasProcedure(NODE_PROCEDURE.LAYOUT)) {
                        node.setLayout();
                    }
                    if (node.hasProcedure(NODE_PROCEDURE.ALIGNMENT)) {
                        node.setAlignment();
                    }
                    rendered[j++] = node;
                }
            }
            rendered.length = j;
            controllerHandler.optimize(rendered);
            extensions.forEach(ext => {
                for (const node of ext.subscribers) {
                    ext.postOptimize(node);
                }
            });
            const documentRoot = [];
            i = 0;
            while (i < j) {
                const node = rendered[i++];
                if (node.hasResource(NODE_RESOURCE.BOX_SPACING)) {
                    node.setBoxSpacing();
                }
                if (node.documentRoot) {
                    if (node.renderChildren.length === 0 && !node.inlineText) {
                        const naturalElement = node.naturalElements;
                        if (naturalElement.length && naturalElement.every(item => item.documentRoot)) {
                            continue;
                        }
                    }
                    const layoutName = node.innerMostWrapped.data(Application.KEY_NAME, 'layoutName');
                    if (layoutName) {
                        documentRoot.push({ node, layoutName });
                    }
                }
            }
            extensions.forEach(ext => ext.beforeCascade(documentRoot));
            const baseTemplate = this._controllerSettings.layout.baseTemplate;
            documentRoot.forEach(layout => {
                var _a;
                const node = layout.node;
                const renderTemplates = node.renderParent.renderTemplates;
                if (renderTemplates) {
                    this.saveDocument(layout.layoutName, baseTemplate + controllerHandler.cascadeDocument(renderTemplates, Math.abs(node.depth)), node.dataset.pathname, ((_a = node.renderExtension) === null || _a === void 0 ? void 0 : _a.some(item => item.documentBase)) ? 0 : undefined);
                }
            });
            this.resourceHandler.finalize(layouts);
            controllerHandler.finalize(layouts);
            extensions.forEach(ext => ext.afterFinalize());
            removeElementsByClassName('__squared.pseudo');
            this.closed = true;
        }
        copyToDisk(directory, options) {
            super.copyToDisk(directory, this.createAssetOptions(options));
        }
        appendToArchive(pathname, options) {
            super.appendToArchive(pathname, this.createAssetOptions(options));
        }
        saveToArchive(filename, options) {
            super.saveToArchive(filename, this.createAssetOptions(options));
        }
        reset() {
            super.reset();
            for (const element of this.rootElements) {
                element.dataset.iteration = '';
            }
            const session = this.session;
            session.cache.reset();
            session.excluded.reset();
            session.extensionMap.clear();
            session.targetQueue.clear();
            this._layouts.length = 0;
        }
        conditionElement(element, pseudoElt) {
            if (!this._excluded.has(element.tagName)) {
                if (this.controllerHandler.visibleElement(element, pseudoElt) || this._cascadeAll) {
                    return true;
                }
                else if (!pseudoElt) {
                    switch (getStyle$2(element).position) {
                        case 'absolute':
                        case 'fixed':
                            return this.useElement(element);
                    }
                    let current = element.parentElement;
                    while (current) {
                        if (getStyle$2(current).display === 'none') {
                            return this.useElement(element);
                        }
                        current = current.parentElement;
                    }
                    const controllerHandler = this.controllerHandler;
                    if (iterateArray$2(element.children, (item) => controllerHandler.visibleElement(item)) === Number.POSITIVE_INFINITY) {
                        return true;
                    }
                    return this.useElement(element);
                }
            }
            return false;
        }
        insertNode(element, parent, pseudoElt) {
            if (isTextNode$2(element)) {
                if (isPlainText(element.textContent) || (parent === null || parent === void 0 ? void 0 : parent.preserveWhiteSpace) && (parent.tagName !== 'PRE' || parent.element.childElementCount === 0)) {
                    this.controllerHandler.applyDefaultStyles(element);
                    const node = this.createNode({ parent, element, append: false });
                    if (parent) {
                        node.cssApply(parent.textStyle);
                        node.setCacheValue('fontSize', parent.fontSize);
                    }
                    return node;
                }
            }
            else if (this.conditionElement(element, pseudoElt)) {
                this.controllerHandler.applyDefaultStyles(element);
                return this.createNode({ parent, element, append: false });
            }
            else {
                const node = this.createNode({ parent, element, append: false });
                node.visible = false;
                node.excluded = true;
                return node;
            }
            return undefined;
        }
        saveDocument(filename, content, pathname, index) {
            if (isString$3(content)) {
                const layout = {
                    pathname: pathname ? trimString(pathname, '/') : appendSeparator(this.userSettings.outputDirectory, this._controllerSettings.layout.pathName),
                    filename,
                    content,
                    index
                };
                const layouts = this._layouts;
                if (index !== undefined && index >= 0 && index < layouts.length) {
                    layouts.splice(index, 0, layout);
                }
                else {
                    layouts.push(layout);
                }
            }
        }
        renderNode(layout) {
            return layout.itemCount === 0 ? this.controllerHandler.renderNode(layout) : this.controllerHandler.renderNodeGroup(layout);
        }
        addLayout(layout) {
            const renderType = layout.renderType;
            if (hasBit$4(renderType, 512 /* FLOAT */)) {
                if (hasBit$4(renderType, 8 /* HORIZONTAL */)) {
                    layout = this.processFloatHorizontal(layout);
                }
                else if (hasBit$4(renderType, 16 /* VERTICAL */)) {
                    layout = this.processFloatVertical(layout);
                }
            }
            if (layout.containerType !== 0) {
                const template = this.renderNode(layout);
                if (template) {
                    return this.addLayoutTemplate(template.parent || layout.parent, layout.node, template, layout.renderIndex);
                }
            }
            return false;
        }
        addLayoutTemplate(parent, node, template, index = -1) {
            if (template) {
                if (!node.renderExclude) {
                    if (node.renderParent) {
                        const renderTemplates = safeNestedArray(parent, 'renderTemplates');
                        if (index >= 0 && index < parent.renderChildren.length) {
                            parent.renderChildren.splice(index, 0, node);
                            renderTemplates.splice(index, 0, template);
                        }
                        else {
                            parent.renderChildren.push(node);
                            renderTemplates.push(template);
                        }
                    }
                    else {
                        this.session.targetQueue.set(node, template);
                    }
                }
                else {
                    node.hide({ remove: true });
                    node.excluded = true;
                }
                return true;
            }
            return false;
        }
        createNode(options) {
            const processing = this.processing;
            const { element, parent, children } = options;
            const node = new this.Node(this.nextId, processing.sessionId, element, this.controllerHandler.afterInsertNode);
            if (parent) {
                node.depth = parent.depth + 1;
                if (parent.naturalElement && (!element || element.parentElement === null)) {
                    node.actualParent = parent;
                }
                const replace = options.replace;
                if (replace && parent.appendTry(replace, node, false)) {
                    replace.parent = node;
                    node.innerWrapped = replace;
                }
            }
            children === null || children === void 0 ? void 0 : children.forEach(item => item.parent = node);
            if (options.append !== false) {
                processing.cache.append(node, options.delegate === true, options.cascade === true);
            }
            return node;
        }
        createCache(documentRoot) {
            const node = this.createRootNode(documentRoot);
            if (node) {
                const controllerHandler = this.controllerHandler;
                const cache = this._cache;
                const parent = node.parent;
                const preAlignment = {};
                const direction = new Set();
                const pseudoElements = [];
                let resetBounds = false;
                if (node.documentBody) {
                    parent.naturalChild = true;
                    parent.setCacheValue('naturalElement', true);
                    parent.visible = false;
                    parent.addAlign(4 /* AUTO_LAYOUT */);
                    parent.exclude({ resource: NODE_RESOURCE.FONT_STYLE | NODE_RESOURCE.VALUE_STRING, procedure: NODE_PROCEDURE.ALL });
                    cache.append(parent);
                }
                node.originalRoot = true;
                node.documentParent = parent;
                cache.each(item => {
                    if (item.styleElement) {
                        const element = item.element;
                        if (item.length) {
                            const textAlign = item.cssInitial('textAlign');
                            switch (textAlign) {
                                case 'center':
                                case 'right':
                                case 'end':
                                    saveAlignment(preAlignment, element, item.id, 'text-align', 'left', textAlign);
                                    break;
                            }
                        }
                        if (item.positionRelative) {
                            BOX_POSITION$1.forEach(attr => {
                                if (item.hasPX(attr)) {
                                    saveAlignment(preAlignment, element, item.id, attr, 'auto', item.css(attr));
                                    resetBounds = true;
                                }
                            });
                        }
                        if (item.dir === 'rtl') {
                            element.dir = 'ltr';
                            direction.add(element);
                        }
                    }
                });
                if (!resetBounds && direction.size) {
                    resetBounds = true;
                }
                this.processing.excluded.each(item => {
                    if (!item.pageFlow) {
                        item.cssTry('display', 'none');
                    }
                });
                cache.each(item => {
                    if (!item.pseudoElement) {
                        item.setBounds(preAlignment[item.id] === undefined && !resetBounds);
                    }
                    else {
                        pseudoElements.push(item);
                    }
                });
                if (pseudoElements.length) {
                    const pseudoMap = [];
                    pseudoElements.forEach((item) => {
                        const parentElement = item.actualParent.element;
                        let id = parentElement.id;
                        let styleElement;
                        if (item.pageFlow) {
                            if (id === '') {
                                id = STRING_PSEUDOPREFIX + Math.round(Math.random() * new Date().getTime());
                                parentElement.id = id;
                            }
                            styleElement = insertStyleSheetRule$1(`#${id + getPseudoElt$1(item.element, item.sessionId)} { display: none !important; }`);
                        }
                        if (item.cssTry('display', item.display)) {
                            pseudoMap.push({ item, id, parentElement, styleElement });
                        }
                    });
                    pseudoMap.forEach(data => data.item.setBounds(false));
                    pseudoMap.forEach(data => {
                        const styleElement = data.styleElement;
                        if (data.id.startsWith(STRING_PSEUDOPREFIX)) {
                            data.parentElement.id = '';
                        }
                        if (styleElement) {
                            try {
                                document.head.removeChild(styleElement);
                            }
                            catch (_a) {
                            }
                        }
                        data.item.cssFinally('display');
                    });
                }
                this.processing.excluded.each(item => {
                    if (!item.lineBreak) {
                        item.setBounds();
                        item.saveAsInitial();
                    }
                    if (!item.pageFlow) {
                        item.cssFinally('display');
                    }
                });
                cache.each(item => {
                    if (item.styleElement) {
                        const element = item.element;
                        const reset = preAlignment[item.id];
                        if (reset) {
                            for (const attr in reset) {
                                element.style.setProperty(attr, reset[attr]);
                            }
                        }
                        if (direction.has(element)) {
                            element.dir = 'rtl';
                        }
                    }
                    item.saveAsInitial();
                });
                controllerHandler.evaluateNonStatic(node, cache);
                controllerHandler.sortInitialCache();
            }
            return node;
        }
        afterCreateCache(node) {
            const dataset = node.dataset;
            const { filename, iteration } = dataset;
            const prefix = isString$3(filename) && filename.replace(new RegExp(`\\.${this._controllerSettings.layout.fileExtension}$`), '') || node.elementId || `document_${this.length}`;
            const postfix = (iteration ? parseInt(iteration) : -1) + 1;
            const layoutName = convertWord$1(postfix > 0 ? `${prefix}_${postfix}` : prefix, true);
            dataset.iteration = postfix.toString();
            dataset.layoutName = layoutName;
            node.data(Application.KEY_NAME, 'layoutName', layoutName);
            this.setBaseLayout();
            this.setConstraints();
            this.setResources();
        }
        resolveTarget(target) {
            if (isString$3(target)) {
                for (const parent of this._cache) {
                    if (parent.elementId === target || parent.controlId === target) {
                        return parent;
                    }
                }
                for (const parent of this.session.cache) {
                    if (parent.elementId === target || parent.controlId === target) {
                        return parent;
                    }
                }
            }
            return undefined;
        }
        useElement(element) {
            const use = element.dataset.use;
            return isString$3(use) && use.split(XML$4.SEPARATOR).some(value => !!this.extensionManager.retrieve(value));
        }
        toString() {
            var _a;
            return ((_a = this.layouts[0]) === null || _a === void 0 ? void 0 : _a.content) || '';
        }
        cascadeParentNode(parentElement, depth, extensions) {
            var _a;
            const node = this.insertNode(parentElement);
            if (node && (node.display !== 'none' || depth === 0 || node.outerExtensionElement)) {
                node.depth = depth;
                if (depth === 0) {
                    this._cache.append(node);
                    for (const name of node.extensions) {
                        if ((_a = this.extensionManager.retrieve(name)) === null || _a === void 0 ? void 0 : _a.cascadeAll) {
                            this._cascadeAll = true;
                            break;
                        }
                    }
                }
                const controllerHandler = this.controllerHandler;
                if (node.excluded && node.outerExtensionElement === null || controllerHandler.preventNodeCascade(parentElement)) {
                    return node;
                }
                const sessionId = this.processing.sessionId;
                const beforeElement = this.createPseduoElement(parentElement, '::before', sessionId);
                const afterElement = this.createPseduoElement(parentElement, '::after', sessionId);
                const childNodes = parentElement.childNodes;
                const length = childNodes.length;
                const children = new Array(length);
                const elements = new Array(parentElement.childElementCount);
                let inlineText = true;
                let i = 0, j = 0, k = 0;
                while (i < length) {
                    const element = childNodes[i++];
                    let child;
                    if (element === beforeElement) {
                        child = this.insertNode(beforeElement, undefined, '::before');
                        if (child) {
                            node.innerBefore = child;
                            if (!child.textEmpty) {
                                child.inlineText = true;
                            }
                            inlineText = false;
                        }
                    }
                    else if (element === afterElement) {
                        child = this.insertNode(afterElement, undefined, '::after');
                        if (child) {
                            node.innerAfter = child;
                            if (!child.textEmpty) {
                                child.inlineText = true;
                            }
                            inlineText = false;
                        }
                    }
                    else if (element.nodeName.charAt(0) === '#') {
                        if (isTextNode$2(element)) {
                            child = this.insertNode(element, node);
                        }
                    }
                    else if (controllerHandler.includeElement(element)) {
                        if (extensions) {
                            prioritizeExtensions(element.dataset.use, extensions).some(item => item.init(element));
                        }
                        if (!this.rootElements.has(element)) {
                            child = this.cascadeParentNode(element, depth + 1, extensions);
                            if ((child === null || child === void 0 ? void 0 : child.excluded) === false) {
                                inlineText = false;
                            }
                        }
                        else {
                            child = this.insertNode(element);
                            if (child) {
                                child.documentRoot = true;
                                child.visible = false;
                                child.excluded = true;
                            }
                            inlineText = false;
                        }
                        if (child) {
                            elements[k++] = child;
                        }
                    }
                    if (child) {
                        child.childIndex = j;
                        child.naturalChild = true;
                        children[j++] = child;
                    }
                }
                children.length = j;
                elements.length = k;
                node.naturalChildren = children;
                node.naturalElements = elements;
                this.cacheNodeChildren(node, children, inlineText);
                if (k > 0 && this.userSettings.createQuerySelectorMap) {
                    node.queryMap = this.createQueryMap(elements, k);
                }
            }
            return node;
        }
        cacheNodeChildren(node, children, inlineText) {
            const length = children.length;
            if (length) {
                const cache = this._cache;
                let siblingsLeading = [];
                let siblingsTrailing = [];
                if (length > 1) {
                    let trailing = children[0];
                    let floating = false;
                    for (let i = 0, j = 0; i < length; ++i) {
                        const child = children[i];
                        if (child.excluded) {
                            this.processing.excluded.append(child);
                        }
                        else if (!child.plainText || !inlineText) {
                            child.containerIndex = j++;
                            child.parent = node;
                            cache.append(child);
                        }
                        if (child.pageFlow) {
                            if (child.floating) {
                                floating = true;
                            }
                            if (i > 0) {
                                siblingsTrailing.push(child);
                                if (child.lineBreak) {
                                    children[i - 1].lineBreakTrailing = true;
                                }
                            }
                            if (!child.excluded) {
                                child.siblingsLeading = siblingsLeading;
                                trailing.siblingsTrailing = siblingsTrailing;
                                siblingsLeading = [];
                                siblingsTrailing = [];
                                trailing = child;
                            }
                            if (i < length - 1) {
                                siblingsLeading.push(child);
                                if (child.lineBreak) {
                                    children[i + 1].lineBreakLeading = true;
                                }
                            }
                        }
                        child.actualParent = node;
                    }
                    trailing.siblingsTrailing = siblingsTrailing;
                    node.floatContainer = floating;
                }
                else {
                    const child = children[0];
                    if (child.excluded) {
                        this.processing.excluded.append(child);
                    }
                    else if (!child.plainText) {
                        child.siblingsLeading = siblingsLeading;
                        child.siblingsTrailing = siblingsTrailing;
                        child.parent = node;
                        child.containerIndex = 0;
                        cache.append(child);
                        node.floatContainer = child.floating;
                    }
                    child.actualParent = node;
                }
            }
            else {
                inlineText = !node.textEmpty;
            }
            node.inlineText = inlineText;
        }
        setBaseLayout() {
            const { controllerHandler, processing, session } = this;
            const { extensionMap, clearMap } = session;
            const cache = processing.cache;
            const documentRoot = processing.node;
            const mapY = new Map();
            let extensions = this.extensionsTraverse;
            {
                let maxDepth = 0;
                const setMap = (depth, id, node) => { var _a; return ((_a = mapY.get(depth)) === null || _a === void 0 ? void 0 : _a.set(id, node)) || mapY.set(depth, new Map([[id, node]])); };
                const getIndex = (value) => (value * -1) - 2;
                setMap(-1, 0, documentRoot.parent);
                cache.each(node => {
                    if (node.length) {
                        const depth = node.depth;
                        setMap(depth, node.id, node);
                        maxDepth = Math.max(depth, maxDepth);
                        if (node.floatContainer) {
                            const floated = new Set();
                            const clearable = {};
                            node.naturalChildren.forEach((item) => {
                                if (item.pageFlow) {
                                    const floating = item.floating;
                                    if (floated.size) {
                                        const clear = item.css('clear');
                                        if (clear !== 'none') {
                                            if (!floating) {
                                                let previousFloat;
                                                switch (clear) {
                                                    case 'left':
                                                        previousFloat = [clearable.left];
                                                        break;
                                                    case 'right':
                                                        previousFloat = [clearable.right];
                                                        break;
                                                    case 'both':
                                                        previousFloat = [clearable.left, clearable.right];
                                                        break;
                                                }
                                                previousFloat === null || previousFloat === void 0 ? void 0 : previousFloat.forEach(previous => {
                                                    if (previous) {
                                                        const float = previous.float;
                                                        if (floated.has(float) && Math.ceil(item.bounds.top) >= previous.bounds.bottom) {
                                                            floated.delete(float);
                                                            clearable[float] = undefined;
                                                        }
                                                    }
                                                });
                                            }
                                            if (floated.has(clear) || clear === 'both') {
                                                clearMap.set(item, floated.size === 2 ? 'both' : clear);
                                                if (!floating) {
                                                    item.setBox(2 /* MARGIN_TOP */, { reset: 1 });
                                                }
                                                floated.clear();
                                                clearable.left = undefined;
                                                clearable.right = undefined;
                                            }
                                        }
                                    }
                                    if (floating) {
                                        const float = item.float;
                                        floated.add(float);
                                        clearable[float] = item;
                                    }
                                }
                            });
                        }
                    }
                });
                let i = 0;
                while (i < maxDepth) {
                    mapY.set(getIndex(i++), new Map());
                }
                cache.afterAppend = (node, cascade = false) => {
                    setMap(getIndex(node.depth), node.id, node);
                    if (cascade && node.length) {
                        node.cascade((item) => {
                            var _a;
                            if (item.length) {
                                const depth = item.depth;
                                (_a = mapY.get(depth)) === null || _a === void 0 ? void 0 : _a.delete(item.id);
                                setMap(getIndex(depth), item.id, item);
                            }
                            return false;
                        });
                    }
                };
            }
            this.extensions.forEach(ext => ext.beforeBaseLayout());
            for (const depth of mapY.values()) {
                for (const parent of depth.values()) {
                    if (parent.length === 0) {
                        continue;
                    }
                    const floatContainer = parent.floatContainer;
                    const renderExtension = parent.renderExtension;
                    const axisY = parent.duplicate();
                    const length = axisY.length;
                    for (let i = 0; i < length; ++i) {
                        let nodeY = axisY[i];
                        if (nodeY.rendered || !nodeY.visible) {
                            continue;
                        }
                        let parentY = nodeY.parent;
                        if (length > 1 && i < length - 1 && nodeY.pageFlow && (parentY.alignmentType === 0 || parentY.hasAlign(2 /* UNKNOWN */) || nodeY.hasAlign(8192 /* EXTENDABLE */)) && !parentY.hasAlign(4 /* AUTO_LAYOUT */) && !nodeY.nodeGroup && nodeY.hasSection(APP_SECTION.DOM_TRAVERSE)) {
                            const horizontal = [];
                            const vertical = [];
                            let l = i;
                            let m = 0;
                            if (parentY.layoutVertical && nodeY.hasAlign(8192 /* EXTENDABLE */)) {
                                horizontal.push(nodeY);
                                ++l;
                                ++m;
                            }
                            traverse: {
                                let floatActive = false;
                                for (; l < length; ++l, ++m) {
                                    const item = axisY[l];
                                    if (item.pageFlow) {
                                        if (item.labelFor && !item.visible) {
                                            m--;
                                            continue;
                                        }
                                        if (floatContainer) {
                                            if (floatActive) {
                                                const float = clearMap.get(item);
                                                if (float) {
                                                    floatActive = false;
                                                }
                                            }
                                            if (item.floating) {
                                                floatActive = true;
                                            }
                                        }
                                        if (m === 0) {
                                            const next = item.siblingsTrailing[0];
                                            if (next) {
                                                if (!isHorizontalAligned(item) || next.alignedVertically([item]) > 0) {
                                                    vertical.push(item);
                                                }
                                                else {
                                                    horizontal.push(item);
                                                }
                                                continue;
                                            }
                                        }
                                        const previous = item.siblingsLeading[0];
                                        if (previous) {
                                            const orientation = horizontal.length > 0;
                                            if (floatContainer) {
                                                const status = item.alignedVertically(orientation ? horizontal : vertical, clearMap, orientation);
                                                if (status > 0) {
                                                    if (orientation) {
                                                        if (status < 4 /* FLOAT_CLEAR */ && floatActive && !item.siblingsLeading.some((node) => node.lineBreak && !clearMap.has(node))) {
                                                            if (!item.floating || previous.floating && item.bounds.top < Math.floor(previous.bounds.bottom)) {
                                                                let floatBottom = Number.NEGATIVE_INFINITY;
                                                                if (!item.floating) {
                                                                    horizontal.forEach(node => {
                                                                        if (node.floating) {
                                                                            floatBottom = Math.max(floatBottom, node.bounds.bottom);
                                                                        }
                                                                    });
                                                                }
                                                                if (!item.floating && item.bounds.top < Math.floor(floatBottom) || floatActive) {
                                                                    horizontal.push(item);
                                                                    if (!item.floating && Math.ceil(item.bounds.bottom) > floatBottom) {
                                                                        break traverse;
                                                                    }
                                                                    else {
                                                                        continue;
                                                                    }
                                                                }
                                                            }
                                                        }
                                                        else {
                                                            switch (status) {
                                                                case 6 /* FLOAT_WRAP */:
                                                                case 7 /* FLOAT_INTERSECT */:
                                                                    if (!clearMap.has(item)) {
                                                                        clearMap.set(item, 'both');
                                                                    }
                                                                    break;
                                                            }
                                                        }
                                                        break traverse;
                                                    }
                                                    if (!checkTraverseVertical(item, horizontal, vertical)) {
                                                        break traverse;
                                                    }
                                                }
                                                else if (!checkTraverseHorizontal(item, horizontal, vertical)) {
                                                    break traverse;
                                                }
                                            }
                                            else {
                                                if (item.alignedVertically(orientation ? horizontal : vertical, undefined, orientation) > 0) {
                                                    if (!checkTraverseVertical(item, horizontal, vertical)) {
                                                        break traverse;
                                                    }
                                                }
                                                else if (!checkTraverseHorizontal(item, horizontal, vertical)) {
                                                    break traverse;
                                                }
                                            }
                                        }
                                        else {
                                            break traverse;
                                        }
                                    }
                                    else if (item.autoPosition) {
                                        const q = vertical.length;
                                        if (q) {
                                            if (vertical[q - 1].blockStatic) {
                                                vertical.push(item);
                                            }
                                            break;
                                        }
                                        else {
                                            horizontal.push(item);
                                        }
                                    }
                                }
                            }
                            let layout;
                            let segEnd;
                            let q = horizontal.length;
                            if (q > 1) {
                                layout = controllerHandler.processTraverseHorizontal(new LayoutUI(parentY, nodeY, 0, 0, horizontal), axisY);
                                segEnd = horizontal[q - 1];
                            }
                            else {
                                q = vertical.length;
                                if (q > 1) {
                                    layout = controllerHandler.processTraverseVertical(new LayoutUI(parentY, nodeY, 0, 0, vertical), axisY);
                                    segEnd = vertical[q - 1];
                                    if (isHorizontalAligned(segEnd) && segEnd !== axisY[length - 1]) {
                                        segEnd.addAlign(8192 /* EXTENDABLE */);
                                    }
                                }
                            }
                            let complete = false;
                            if (layout) {
                                if (this.addLayout(layout)) {
                                    complete = true;
                                    parentY = nodeY.parent;
                                }
                            }
                            else {
                                complete = true;
                            }
                            if (complete && segEnd === axisY[length - 1]) {
                                parentY.removeAlign(2 /* UNKNOWN */);
                            }
                        }
                        nodeY.removeAlign(8192 /* EXTENDABLE */);
                        if (i === length - 1) {
                            parentY.removeAlign(2 /* UNKNOWN */);
                        }
                        if (nodeY.renderAs && parentY.appendTry(nodeY, nodeY.renderAs, false)) {
                            nodeY.hide();
                            nodeY = nodeY.renderAs;
                            if (nodeY.positioned) {
                                parentY = nodeY.parent;
                            }
                        }
                        if (!nodeY.rendered && nodeY.hasSection(APP_SECTION.EXTENSION)) {
                            const descendant = extensionMap.get(nodeY.id);
                            let combined = descendant ? (renderExtension ? renderExtension.concat(descendant) : descendant) : renderExtension;
                            let next = false;
                            if (combined) {
                                const q = combined.length;
                                let j = 0;
                                while (j < q) {
                                    const ext = combined[j++];
                                    const result = ext.processChild(nodeY, parentY);
                                    if (result) {
                                        const { output, renderAs, outputAs } = result;
                                        if (output) {
                                            this.addLayoutTemplate(result.outerParent || parentY, nodeY, output);
                                        }
                                        if (renderAs && outputAs) {
                                            this.addLayoutTemplate(result.parentAs || parentY, renderAs, outputAs);
                                        }
                                        parentY = result.parent || parentY;
                                        if (result.subscribe) {
                                            ext.subscribers.add(nodeY);
                                        }
                                        next = result.next === true;
                                        if (result.complete || next) {
                                            break;
                                        }
                                    }
                                }
                                if (next) {
                                    continue;
                                }
                            }
                            if (nodeY.styleElement) {
                                combined = prioritizeExtensions(nodeY.dataset.use, extensions);
                                const q = combined.length;
                                let j = 0;
                                while (j < q) {
                                    const ext = combined[j++];
                                    if (ext.is(nodeY)) {
                                        if (ext.condition(nodeY, parentY) && (!descendant || !descendant.includes(ext))) {
                                            const result = ext.processNode(nodeY, parentY);
                                            if (result) {
                                                const { output, renderAs, outputAs } = result;
                                                if (output) {
                                                    this.addLayoutTemplate(result.outerParent || parentY, nodeY, output);
                                                }
                                                if (renderAs && outputAs) {
                                                    this.addLayoutTemplate(result.parentAs || parentY, renderAs, outputAs);
                                                }
                                                parentY = result.parent || parentY;
                                                if (result.include) {
                                                    safeNestedArray(nodeY, 'renderExtension').push(ext);
                                                    ext.subscribers.add(nodeY);
                                                }
                                                else if (result.subscribe) {
                                                    ext.subscribers.add(nodeY);
                                                }
                                                if (result.remove) {
                                                    const index = extensions.indexOf(ext);
                                                    if (index !== -1) {
                                                        extensions = extensions.slice(0);
                                                        extensions.splice(index, 1);
                                                    }
                                                }
                                                next = result.next === true;
                                                if (result.complete || next) {
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                                if (next) {
                                    continue;
                                }
                            }
                        }
                        if (!nodeY.rendered && nodeY.hasSection(APP_SECTION.RENDER)) {
                            let layout = this.createLayoutControl(parentY, nodeY);
                            if (layout.containerType === 0) {
                                const result = nodeY.length ? controllerHandler.processUnknownParent(layout) : controllerHandler.processUnknownChild(layout);
                                if (result.next) {
                                    continue;
                                }
                                layout = result.layout;
                            }
                            this.addLayout(layout);
                        }
                    }
                }
            }
            cache.sort((a, b) => {
                if (a.depth === b.depth) {
                    const innerA = a.innerWrapped;
                    const innerB = b.innerWrapped;
                    if (innerA === b) {
                        return -1;
                    }
                    else if (a === innerB) {
                        return 1;
                    }
                    const outerA = a.outerWrapper;
                    const outerB = b.outerWrapper;
                    if (a === outerB || !outerA && outerB) {
                        return -1;
                    }
                    else if (b === outerA || !outerB && outerA) {
                        return 1;
                    }
                    const groupA = a.nodeGroup;
                    const groupB = b.nodeGroup;
                    if (groupA && groupB) {
                        return a.id < b.id ? -1 : 1;
                    }
                    else if (groupA) {
                        return -1;
                    }
                    else if (groupB) {
                        return 1;
                    }
                    return 0;
                }
                return a.depth < b.depth ? -1 : 1;
            });
            this.extensions.forEach(ext => {
                for (const node of ext.subscribers) {
                    if (cache.contains(node)) {
                        ext.postBaseLayout(node);
                    }
                }
                ext.afterBaseLayout();
            });
            session.cache.join(cache);
            session.excluded.join(processing.excluded);
        }
        setConstraints() {
            const cache = this._cache;
            this.controllerHandler.setConstraints();
            this.extensions.forEach(ext => {
                for (const node of ext.subscribers) {
                    if (cache.contains(node)) {
                        ext.postConstraints(node);
                    }
                }
                ext.afterConstraints();
            });
        }
        setResources() {
            const resourceHandler = this.resourceHandler;
            this._cache.each(node => {
                resourceHandler.setBoxStyle(node);
                if (!node.imageElement && !node.svgElement && node.visible) {
                    resourceHandler.setFontStyle(node);
                    resourceHandler.setValueString(node);
                }
            });
            this.extensions.forEach(ext => ext.afterResources());
        }
        processFloatHorizontal(layout) {
            const controllerHandler = this.controllerHandler;
            const { containerType, alignmentType } = controllerHandler.containerTypeVertical;
            const clearMap = this.session.clearMap;
            const layerIndex = [];
            const inlineAbove = [];
            const inlineBelow = [];
            const leftAbove = [];
            const rightAbove = [];
            let leftBelow;
            let rightBelow;
            let leftSub;
            let rightSub;
            let clearedFloat = false;
            layout.each((node, index) => {
                if (index > 0) {
                    const value = clearMap.get(node);
                    if (value) {
                        clearedFloat = true;
                    }
                }
                const float = node.float;
                if (!clearedFloat) {
                    if (float === 'left') {
                        leftAbove.push(node);
                    }
                    else if (float === 'right') {
                        rightAbove.push(node);
                    }
                    else if (leftAbove.length || rightAbove.length) {
                        let top = node.linear.top;
                        if (node.styleText) {
                            const textBounds = node.textBounds;
                            if (textBounds) {
                                top = Math.max(textBounds.top, top);
                            }
                        }
                        top = Math.ceil(top);
                        if (leftAbove.some(item => top >= item.bounds.bottom) || rightAbove.some(item => top >= item.bounds.bottom)) {
                            inlineBelow.push(node);
                        }
                        else {
                            inlineAbove.push(node);
                        }
                    }
                    else {
                        inlineAbove.push(node);
                    }
                }
                else if (float === 'left') {
                    if (leftBelow) {
                        leftBelow.push(node);
                    }
                    else {
                        leftBelow = [node];
                    }
                }
                else if (float === 'right') {
                    if (rightBelow) {
                        rightBelow.push(node);
                    }
                    else {
                        rightBelow = [node];
                    }
                }
                else {
                    inlineBelow.push(node);
                }
            });
            if (leftAbove.length) {
                leftSub = leftBelow ? [leftAbove, leftBelow] : leftAbove;
            }
            if (rightAbove.length) {
                rightSub = rightBelow ? [rightAbove, rightBelow] : rightAbove;
            }
            if (rightAbove.length + ((rightBelow === null || rightBelow === void 0 ? void 0 : rightBelow.length) || 0) === layout.length) {
                layout.add(2048 /* RIGHT */);
            }
            if (inlineBelow.length) {
                const { node, parent } = layout;
                if (inlineBelow.length > 1) {
                    inlineBelow[0].addAlign(8192 /* EXTENDABLE */);
                }
                inlineBelow.unshift(node);
                const wrapper = controllerHandler.createNodeGroup(node, inlineBelow, { parent });
                wrapper.childIndex = node.childIndex;
                wrapper.containerName = node.containerName;
                wrapper.inherit(node, 'boxStyle');
                wrapper.innerWrapped = node;
                node.resetBox(30 /* MARGIN */, wrapper);
                node.resetBox(480 /* PADDING */, wrapper);
                this.addLayout(new LayoutUI(parent, wrapper, containerType, alignmentType | (parent.blockStatic ? 64 /* BLOCK */ : 0), inlineBelow));
                layout.parent = wrapper;
            }
            if (inlineAbove.length) {
                layerIndex.push(inlineAbove);
            }
            if (leftSub) {
                layerIndex.push(leftSub);
            }
            if (rightSub) {
                layerIndex.push(rightSub);
            }
            layout.type = controllerHandler.containerTypeVerticalMargin;
            layout.itemCount = layerIndex.length;
            layout.add(64 /* BLOCK */);
            layerIndex.forEach(item => {
                let segments;
                let floatgroup;
                if (Array.isArray(item[0])) {
                    segments = item;
                    const itemCount = segments.length;
                    let grouping = segments[0];
                    let i = 1;
                    while (i < itemCount) {
                        grouping = grouping.concat(segments[i++]);
                    }
                    grouping.sort((a, b) => a.childIndex < b.childIndex ? -1 : 1);
                    const node = layout.node;
                    if (node.layoutVertical) {
                        floatgroup = node;
                    }
                    else {
                        floatgroup = controllerHandler.createNodeGroup(grouping[0], grouping, { parent: node });
                        this.addLayout(LayoutUI.create({
                            parent: node,
                            node: floatgroup,
                            containerType,
                            alignmentType: alignmentType | (segments.some(seg => seg === rightSub || seg === rightAbove) ? 2048 /* RIGHT */ : 0),
                            itemCount
                        }));
                    }
                }
                else {
                    segments = [item];
                }
                segments.forEach(seg => {
                    const first = seg[0];
                    const node = floatgroup || layout.node;
                    const target = controllerHandler.createNodeGroup(first, seg, { parent: node, delegate: true });
                    const group = new LayoutUI(node, target, 0, 128 /* SEGMENTED */);
                    if (seg === inlineAbove) {
                        group.add(256 /* COLUMN */);
                    }
                    else {
                        group.add(getFloatAlignmentType(seg));
                    }
                    if (seg.some(child => child.percentWidth > 0)) {
                        group.type = controllerHandler.containerTypePercent;
                        if (seg.length === 1) {
                            group.node.innerWrapped = first;
                        }
                    }
                    else if (seg.length === 1) {
                        group.setContainerType(containerType, alignmentType);
                    }
                    else if (group.linearY || group.unknownAligned) {
                        group.setContainerType(containerType, alignmentType | (group.unknownAligned ? 2 /* UNKNOWN */ : 0));
                    }
                    else {
                        controllerHandler.processLayoutHorizontal(group);
                    }
                    this.addLayout(group);
                    if (seg === inlineAbove) {
                        this.setFloatPadding(node, target, inlineAbove, leftAbove, rightAbove);
                    }
                });
            });
            return layout;
        }
        processFloatVertical(layout) {
            const controllerHandler = this.controllerHandler;
            const { containerType, alignmentType } = controllerHandler.containerTypeVertical;
            const clearMap = this.session.clearMap;
            if (layout.containerType !== 0) {
                const node = layout.node;
                const parent = controllerHandler.createNodeGroup(node, [node], { parent: layout.parent });
                this.addLayout(new LayoutUI(parent, node, containerType, alignmentType, parent.children));
                layout.node = parent;
            }
            else {
                layout.setContainerType(containerType, alignmentType);
            }
            const staticRows = [];
            const floatedRows = [];
            const current = [];
            const floated = [];
            let clearReset = false;
            let blockArea = false;
            let layoutVertical = true;
            layout.each(node => {
                if (node.blockStatic && floated.length === 0) {
                    current.push(node);
                    blockArea = true;
                }
                else {
                    if (clearMap.has(node)) {
                        if (!node.floating) {
                            node.setBox(2 /* MARGIN_TOP */, { reset: 1 });
                            staticRows.push(current.slice(0));
                            floatedRows.push(floated.slice(0));
                            current.length = 0;
                            floated.length = 0;
                        }
                        else {
                            clearReset = true;
                        }
                    }
                    if (node.floating) {
                        if (blockArea) {
                            staticRows.push(current.slice(0));
                            floatedRows.push(null);
                            current.length = 0;
                            floated.length = 0;
                            blockArea = false;
                        }
                        floated.push(node);
                    }
                    else {
                        if (clearReset && !clearMap.has(node)) {
                            layoutVertical = false;
                        }
                        current.push(node);
                    }
                }
            });
            if (floated.length) {
                floatedRows.push(floated);
            }
            if (current.length) {
                staticRows.push(current);
            }
            if (!layoutVertical) {
                const node = layout.node;
                const length = Math.max(floatedRows.length, staticRows.length);
                for (let i = 0; i < length; ++i) {
                    const pageFlow = staticRows[i] || [];
                    if (floatedRows[i] === null && pageFlow.length) {
                        const layoutType = controllerHandler.containerTypeVertical;
                        this.addLayout(new LayoutUI(node, controllerHandler.createNodeGroup(pageFlow[0], pageFlow, { parent: node }), layoutType.containerType, layoutType.alignmentType | 128 /* SEGMENTED */ | 64 /* BLOCK */, pageFlow));
                    }
                    else {
                        const floating = floatedRows[i] || [];
                        if (pageFlow.length || floating.length) {
                            const basegroup = controllerHandler.createNodeGroup(floating[0] || pageFlow[0], [], { parent: node });
                            const group = new LayoutUI(node, basegroup);
                            group.type = controllerHandler.containerTypeVerticalMargin;
                            const children = [];
                            let subgroup;
                            if (floating.length) {
                                const floatgroup = controllerHandler.createNodeGroup(floating[0], floating, { parent: basegroup });
                                group.add(512 /* FLOAT */);
                                if (pageFlow.length === 0 && floating.every(item => item.float === 'right')) {
                                    group.add(2048 /* RIGHT */);
                                }
                                children.push(floatgroup);
                            }
                            if (pageFlow.length) {
                                subgroup = controllerHandler.createNodeGroup(pageFlow[0], pageFlow, { parent: basegroup });
                                children.push(subgroup);
                            }
                            group.itemCount = children.length;
                            this.addLayout(group);
                            children.forEach(item => {
                                if (!item.nodeGroup) {
                                    item = controllerHandler.createNodeGroup(item, [item], { parent: basegroup, delegate: true });
                                }
                                this.addLayout(new LayoutUI(basegroup, item, containerType, alignmentType | 128 /* SEGMENTED */ | 64 /* BLOCK */, item.children));
                            });
                            if (pageFlow.length && floating.length) {
                                const [leftAbove, rightAbove] = partitionArray(floating, item => item.float !== 'right');
                                this.setFloatPadding(node, subgroup, pageFlow, leftAbove, rightAbove);
                            }
                        }
                    }
                }
            }
            return layout;
        }
        createPseduoElement(element, pseudoElt, sessionId) {
            let styleMap = getElementCache$2(element, `styleMap${pseudoElt}`, sessionId);
            let nested = 0;
            if (element.tagName === 'Q') {
                if (!styleMap) {
                    styleMap = {};
                    setElementCache$2(element, `styleMap${pseudoElt}`, sessionId, styleMap);
                }
                let content = styleMap.content;
                if (typeof content !== 'string' || content === '') {
                    content = getStyle$2(element, pseudoElt).getPropertyValue('content') || (pseudoElt === '::before' ? 'open-quote' : 'close-quote');
                    styleMap.content = content;
                }
                if (content.endsWith('-quote')) {
                    let parent = element.parentElement;
                    while ((parent === null || parent === void 0 ? void 0 : parent.tagName) === 'Q') {
                        nested++;
                        parent = parent.parentElement;
                    }
                }
            }
            if (styleMap) {
                let value = styleMap.content;
                if (value) {
                    const textContent = trimBoth(value, '"');
                    let absolute = false;
                    switch (styleMap.position) {
                        case 'absolute':
                        case 'fixed':
                            absolute = true;
                            break;
                    }
                    const checkPseudoAfter = () => {
                        if (!absolute && textContent !== '') {
                            const previousSibling = element.childNodes[element.childNodes.length - 1];
                            if (isTextNode$2(previousSibling)) {
                                return !/\s+$/.test(previousSibling.textContent);
                            }
                        }
                        return false;
                    };
                    if (textContent.trim() === '') {
                        const checkDimension = (after) => {
                            if ((after || convertFloat$1(styleMap.width) === 0) && convertFloat$1(styleMap.height) === 0) {
                                for (const attr in styleMap) {
                                    if (/(padding|Width|Height)/.test(attr) && convertFloat$1(styleMap[attr]) > 0) {
                                        return true;
                                    }
                                    else if (!absolute && attr.startsWith('margin') && convertFloat$1(styleMap[attr]) !== 0) {
                                        return true;
                                    }
                                }
                                return false;
                            }
                            return true;
                        };
                        if (pseudoElt === '::after') {
                            if (!checkPseudoAfter() && !checkDimension(true)) {
                                return undefined;
                            }
                        }
                        else {
                            const childNodes = element.childNodes;
                            const length = childNodes.length;
                            let i = 0;
                            while (i < length) {
                                const child = childNodes[i++];
                                if (isTextNode$2(child)) {
                                    if (child.textContent.trim() !== '') {
                                        break;
                                    }
                                }
                                else if (child instanceof HTMLElement) {
                                    const style = getStyle$2(child);
                                    switch (style.getPropertyValue('position')) {
                                        case 'fixed':
                                        case 'absolute':
                                            continue;
                                    }
                                    if (style.getPropertyValue('float') !== 'none') {
                                        return undefined;
                                    }
                                    break;
                                }
                            }
                            switch (styleMap.display) {
                                case undefined:
                                case 'block':
                                case 'inline':
                                case 'inherit':
                                case 'initial': {
                                    if (!checkDimension(false)) {
                                        return undefined;
                                    }
                                    break;
                                }
                            }
                        }
                    }
                    else if (value === 'inherit') {
                        let current = element;
                        do {
                            value = getStyle$2(current).getPropertyValue('content');
                            if (value !== 'inherit') {
                                break;
                            }
                            current = current.parentElement;
                        } while (current);
                    }
                    const style = getStyle$2(element);
                    TEXT_STYLE$1.forEach(attr => {
                        if (!isString$3(styleMap[attr])) {
                            styleMap[attr] = style[attr];
                        }
                    });
                    let tagName = '';
                    let content = '';
                    switch (value) {
                        case 'normal':
                        case 'none':
                        case 'initial':
                        case 'inherit':
                        case 'unset':
                        case 'no-open-quote':
                        case 'no-close-quote':
                        case '""':
                            break;
                        case 'open-quote':
                            if (pseudoElt === '::before') {
                                content = nested % 2 === 0 ? '“' : "‘";
                            }
                            break;
                        case 'close-quote':
                            if (pseudoElt === '::after') {
                                content = nested % 2 === 0 ? '”' : "’";
                            }
                            break;
                        default: {
                            const url = resolveURL(value);
                            if (url !== '') {
                                content = url;
                                if (hasMimeType$1(this._controllerSettings.mimeType.image, url)) {
                                    tagName = 'img';
                                }
                                else {
                                    content = '';
                                }
                            }
                            else {
                                let found = false;
                                REGEX_COUNTER.lastIndex = 0;
                                let match;
                                while ((match = REGEX_COUNTER.exec(value)) !== null) {
                                    const attr = match[1];
                                    if (attr) {
                                        content += getNamedItem$1(element, attr.trim());
                                    }
                                    else if (match[2] || match[5]) {
                                        const counterType = match[2] === 'counter';
                                        const [counterName, styleName] = counterType ? [match[3], match[4] || 'decimal'] : [match[6], match[8] || 'decimal'];
                                        const initialValue = (getCounterIncrementValue(element, counterName, pseudoElt, sessionId, 0) || 0) + (getCounterValue(style.getPropertyValue('counter-reset'), counterName, 0) || 0);
                                        const subcounter = [];
                                        let current = element;
                                        let counter = initialValue;
                                        let ascending = false;
                                        let lastResetElement;
                                        const incrementCounter = (increment, pseudo) => {
                                            const length = subcounter.length;
                                            if (length === 0) {
                                                counter += increment;
                                            }
                                            else if (ascending || pseudo) {
                                                subcounter[length - 1] += increment;
                                            }
                                        };
                                        const cascadeCounterSibling = (sibling) => {
                                            if (getCounterValue(getStyle$2(sibling).getPropertyValue('counter-reset'), counterName) === undefined) {
                                                iterateArray$2(sibling.children, item => {
                                                    if (item.className !== '__squared.pseudo') {
                                                        let increment = getCounterIncrementValue(item, counterName, pseudoElt, sessionId);
                                                        if (increment) {
                                                            incrementCounter(increment, true);
                                                        }
                                                        const childStyle = getStyle$2(item);
                                                        increment = getCounterValue(childStyle.getPropertyValue('counter-increment'), counterName);
                                                        if (increment) {
                                                            incrementCounter(increment, false);
                                                        }
                                                        increment = getCounterValue(childStyle.getPropertyValue('counter-reset'), counterName);
                                                        if (increment !== undefined) {
                                                            return true;
                                                        }
                                                        cascadeCounterSibling(item);
                                                    }
                                                    return;
                                                });
                                            }
                                        };
                                        while (current) {
                                            ascending = false;
                                            if (current.previousElementSibling) {
                                                current = current.previousElementSibling;
                                                if (current) {
                                                    cascadeCounterSibling(current);
                                                }
                                            }
                                            else if (current.parentElement) {
                                                current = current.parentElement;
                                                ascending = true;
                                            }
                                            else {
                                                break;
                                            }
                                            if (current && current.className !== '__squared.pseudo') {
                                                const pesudoIncrement = getCounterIncrementValue(current, counterName, pseudoElt, sessionId);
                                                if (pesudoIncrement) {
                                                    incrementCounter(pesudoIncrement, true);
                                                }
                                                const currentStyle = getStyle$2(current);
                                                const counterIncrement = getCounterValue(currentStyle.getPropertyValue('counter-increment'), counterName);
                                                if (counterIncrement) {
                                                    incrementCounter(counterIncrement, false);
                                                }
                                                const counterReset = getCounterValue(currentStyle.getPropertyValue('counter-reset'), counterName);
                                                if (counterReset !== undefined) {
                                                    if (!lastResetElement) {
                                                        counter += counterReset;
                                                    }
                                                    lastResetElement = current;
                                                    if (counterType) {
                                                        break;
                                                    }
                                                    else if (ascending) {
                                                        subcounter.push((pesudoIncrement || 0) + counterReset);
                                                    }
                                                }
                                            }
                                        }
                                        if (lastResetElement) {
                                            if (!counterType && subcounter.length > 1) {
                                                subcounter.reverse().splice(1, 1);
                                                const textValue = match[7];
                                                subcounter.forEach(leading => content += convertListStyle(styleName, leading, true) + textValue);
                                            }
                                        }
                                        else {
                                            counter = initialValue;
                                        }
                                        content += convertListStyle(styleName, counter, true);
                                    }
                                    else if (match[9]) {
                                        content += match[9];
                                    }
                                    found = true;
                                }
                                if (!found) {
                                    content = value;
                                }
                            }
                            break;
                        }
                    }
                    if (!isString$3(styleMap.display)) {
                        styleMap.display = 'inline';
                    }
                    if (content || value === '""') {
                        if (tagName === '') {
                            tagName = /^(inline|table)/.test(styleMap.display) ? 'span' : 'div';
                        }
                        const pseudoElement = createPseudoElement(element, tagName, pseudoElt === '::before' ? 0 : -1);
                        if (tagName === 'img') {
                            pseudoElement.src = content;
                            const image = this.resourceHandler.getImage(content);
                            if (image) {
                                if (!isString$3(styleMap.width) && image.width > 0) {
                                    styleMap.width = formatPX$1(image.width);
                                }
                                if (!isString$3(styleMap.height) && image.height > 0) {
                                    styleMap.height = formatPX$1(image.height);
                                }
                            }
                        }
                        else if (value !== '""') {
                            pseudoElement.innerText = content;
                        }
                        for (const attr in styleMap) {
                            if (attr !== 'display') {
                                pseudoElement.style[attr] = styleMap[attr];
                            }
                        }
                        setElementCache$2(pseudoElement, 'pseudoElement', sessionId, pseudoElt);
                        setElementCache$2(pseudoElement, 'styleMap', sessionId, styleMap);
                        return pseudoElement;
                    }
                }
            }
            return undefined;
        }
        createAssetOptions(options) {
            let assets = options === null || options === void 0 ? void 0 : options.assets;
            if (assets) {
                assets = this.layouts.concat(assets);
            }
            else {
                assets = this.layouts;
            }
            return Object.assign(Object.assign({}, options), { assets });
        }
        createLayoutControl(parent, node) {
            return new LayoutUI(parent, node, node.containerType, node.alignmentType, node.children);
        }
        setFloatPadding(parent, target, inlineAbove, leftAbove, rightAbove) {
            let paddingNodes = [];
            inlineAbove.forEach(child => {
                if (requirePadding(child) || child.centerAligned) {
                    paddingNodes.push(child);
                }
                if (child.blockStatic) {
                    paddingNodes = paddingNodes.concat(child.cascade((item) => requirePadding(item)));
                }
            });
            const bottom = target.bounds.bottom;
            const boxWidth = parent.actualBoxWidth();
            if (leftAbove.length) {
                let floatPosition = Number.NEGATIVE_INFINITY;
                let marginLeft = 0;
                let invalid = false;
                let spacing = false;
                leftAbove.forEach(child => {
                    if (child.bounds.top < bottom) {
                        const right = child.linear.right + getRelativeOffset(child, false);
                        if (right > floatPosition) {
                            floatPosition = right;
                            spacing = child.marginRight > 0;
                        }
                        else if (right === floatPosition && child.marginRight <= 0) {
                            spacing = false;
                        }
                    }
                });
                if (floatPosition !== Number.NEGATIVE_INFINITY) {
                    paddingNodes.forEach(child => {
                        if (Math.floor(child.linear.left) <= floatPosition || child.centerAligned) {
                            marginLeft = Math.max(marginLeft, child.marginLeft);
                            invalid = true;
                        }
                    });
                    if (invalid) {
                        const offset = floatPosition - parent.box.left - marginLeft - maxArray(target.map((child) => !paddingNodes.includes(child) ? child.marginLeft : 0));
                        if (offset > 0 && offset < boxWidth) {
                            target.modifyBox(256 /* PADDING_LEFT */, offset + (!spacing && target.find(child => child.multiline, { cascade: true }) ? Math.max(marginLeft, this._controllerSettings.deviations.textMarginBoundarySize) : 0));
                        }
                    }
                }
            }
            if (rightAbove.length) {
                let floatPosition = Number.POSITIVE_INFINITY;
                let marginRight = 0;
                let invalid = false;
                let spacing = false;
                rightAbove.forEach(child => {
                    if (child.bounds.top < bottom) {
                        const left = child.linear.left + getRelativeOffset(child, true);
                        if (left < floatPosition) {
                            floatPosition = left;
                            spacing = child.marginLeft > 0;
                        }
                        else if (left === floatPosition && child.marginLeft <= 0) {
                            spacing = false;
                        }
                    }
                });
                if (floatPosition !== Number.POSITIVE_INFINITY) {
                    paddingNodes.forEach(child => {
                        if (child.multiline || Math.ceil(child.linear.right) >= floatPosition) {
                            marginRight = Math.max(marginRight, child.marginRight);
                            invalid = true;
                        }
                    });
                    if (invalid) {
                        const offset = parent.box.right - floatPosition - marginRight - maxArray(target.map((child) => !paddingNodes.includes(child) ? child.marginRight : 0));
                        if (offset > 0 && offset < boxWidth) {
                            target.modifyBox(64 /* PADDING_RIGHT */, offset + (!spacing && target.find(child => child.multiline, { cascade: true }) ? Math.max(marginRight, this._controllerSettings.deviations.textMarginBoundarySize) : 0));
                        }
                    }
                }
            }
        }
        get layouts() {
            return this._layouts.sort((a, b) => {
                const indexA = a.index;
                const indexB = b.index;
                if (indexA !== indexB) {
                    if (indexA === 0 || indexB === Number.POSITIVE_INFINITY || indexB === undefined && !(indexA === Number.POSITIVE_INFINITY)) {
                        return -1;
                    }
                    else if (indexB === 0 || indexA === Number.POSITIVE_INFINITY || indexA === undefined && !(indexB === Number.POSITIVE_INFINITY)) {
                        return 1;
                    }
                    else if (indexA !== undefined && indexB !== undefined) {
                        return indexA < indexB ? -1 : 1;
                    }
                }
                return 0;
            });
        }
        get clearMap() {
            return this.session.clearMap;
        }
        get extensionsCascade() {
            return this.extensions.filter(item => !!item.init);
        }
        get extensionsTraverse() {
            return this.extensions.filter(item => !item.eventOnly);
        }
        get length() {
            return this.session.cache.length;
        }
    }

    const $lib$5 = squared.lib;
    const { USER_AGENT: USER_AGENT$1, isUserAgent: isUserAgent$1, isWinEdge } = $lib$5.client;
    const { BOX_BORDER: BOX_BORDER$1, BOX_PADDING: BOX_PADDING$1, formatPX: formatPX$2, getStyle: getStyle$3, isLength: isLength$1, isPercent: isPercent$1 } = $lib$5.css;
    const { isTextNode: isTextNode$3, withinViewport } = $lib$5.dom;
    const { capitalize, convertFloat: convertFloat$2, flatArray: flatArray$1, isString: isString$4, iterateArray: iterateArray$3, safeNestedArray: safeNestedArray$1 } = $lib$5.util;
    const { actualClientRect: actualClientRect$1, getElementCache: getElementCache$3, setElementCache: setElementCache$3 } = $lib$5.session;
    const { pushIndent, pushIndentArray } = $lib$5.xml;
    function positionAbsolute(style) {
        switch (style.getPropertyValue('position')) {
            case 'absolute':
            case 'fixed':
                return true;
        }
        return false;
    }
    const getNumberValue = (style, attr) => parseInt(style.getPropertyValue(attr));
    class ControllerUI extends Controller {
        constructor() {
            super(...arguments);
            this._requireFormat = false;
            this._beforeOutside = {};
            this._beforeInside = {};
            this._afterInside = {};
            this._afterOutside = {};
        }
        init() {
            const unsupported = this.localSettings.unsupported;
            this._unsupportedCascade = unsupported.cascade;
            this._unsupportedTagName = unsupported.tagName;
        }
        reset() {
            this._requireFormat = false;
            this._beforeOutside = {};
            this._beforeInside = {};
            this._afterInside = {};
            this._afterOutside = {};
        }
        preventNodeCascade(element) {
            return this._unsupportedCascade.has(element.tagName);
        }
        applyDefaultStyles(element) {
            const sessionId = this.sessionId;
            let styleMap;
            if (isTextNode$3(element)) {
                styleMap = {
                    position: 'static',
                    display: 'inline',
                    verticalAlign: 'baseline',
                    float: 'none',
                    clear: 'none'
                };
            }
            else {
                styleMap = getElementCache$3(element, 'styleMap', sessionId) || {};
                const setBorderStyle = () => {
                    if (!isString$4(styleMap.border) && checkBorderAttribute()) {
                        const inputBorderColor = this.localSettings.style.inputBorderColor;
                        styleMap.border = `outset 1px ${inputBorderColor}`;
                        for (let i = 0; i < 4; ++i) {
                            const border = BOX_BORDER$1[i];
                            styleMap[border[0]] = 'outset';
                            styleMap[border[1]] = '1px';
                            styleMap[border[2]] = inputBorderColor;
                        }
                        return true;
                    }
                    return false;
                };
                const setButtonStyle = (applied) => {
                    if (applied) {
                        const backgroundColor = styleMap.backgroundColor;
                        if (!isString$4(backgroundColor) || backgroundColor === 'initial') {
                            styleMap.backgroundColor = this.localSettings.style.inputBackgroundColor;
                        }
                    }
                    if (!isString$4(styleMap.textAlign)) {
                        styleMap.textAlign = 'center';
                    }
                    if (!isString$4(styleMap.padding) && !BOX_PADDING$1.some(attr => !!styleMap[attr])) {
                        styleMap.paddingTop = '2px';
                        styleMap.paddingRight = '6px';
                        styleMap.paddingBottom = '3px';
                        styleMap.paddingLeft = '6px';
                    }
                };
                const checkBorderAttribute = () => !(BOX_BORDER$1[0][0] in styleMap || BOX_BORDER$1[1][0] in styleMap || BOX_BORDER$1[2][0] in styleMap || BOX_BORDER$1[3][0] in styleMap);
                const tagName = element.tagName;
                if (isUserAgent$1(8 /* FIREFOX */)) {
                    switch (tagName) {
                        case 'BODY':
                            if (styleMap.backgroundColor === 'rgba(0, 0, 0, 0)') {
                                styleMap.backgroundColor = 'rgb(255, 255, 255)';
                            }
                            break;
                        case 'INPUT':
                        case 'SELECT':
                        case 'BUTTON':
                        case 'TEXTAREA':
                            if (!isString$4(styleMap.display)) {
                                styleMap.display = 'inline-block';
                            }
                            break;
                        case 'FIELDSET':
                            if (!isString$4(styleMap.display)) {
                                styleMap.display = 'block';
                            }
                            break;
                    }
                }
                else if (isWinEdge()) {
                    switch (tagName) {
                        case 'BODY':
                            if (styleMap.backgroundColor === 'transparent') {
                                styleMap.backgroundColor = 'rgb(255, 255, 255)';
                            }
                            break;
                        case 'INPUT':
                            switch (element.type) {
                                case 'text':
                                case 'password':
                                case 'time':
                                case 'date':
                                case 'datetime-local':
                                case 'week':
                                case 'month':
                                case 'url':
                                case 'email':
                                case 'search':
                                case 'number':
                                case 'tel':
                                    if (!isString$4(styleMap.fontSize)) {
                                        styleMap.fontSize = '13.3333px';
                                    }
                                    break;
                            }
                            break;
                        case 'CODE':
                            if (!isString$4(styleMap.fontFamily)) {
                                styleMap.fontFamily = 'monospace';
                            }
                            break;
                        case 'LEGEND':
                        case 'RT':
                            if (!isString$4(styleMap.display)) {
                                styleMap.display = 'block';
                            }
                            break;
                    }
                }
                switch (tagName) {
                    case 'INPUT': {
                        const type = element.type;
                        switch (type) {
                            case 'radio':
                            case 'checkbox':
                            case 'image':
                                break;
                            case 'week':
                            case 'month':
                            case 'time':
                            case 'date':
                            case 'datetime-local':
                                styleMap.paddingTop = formatPX$2(convertFloat$2(styleMap.paddingTop) + 1);
                                styleMap.paddingRight = formatPX$2(convertFloat$2(styleMap.paddingRight) + 1);
                                styleMap.paddingBottom = formatPX$2(convertFloat$2(styleMap.paddingBottom) + 1);
                                styleMap.paddingLeft = formatPX$2(convertFloat$2(styleMap.paddingLeft) + 1);
                                break;
                            default: {
                                const result = setBorderStyle();
                                switch (type) {
                                    case 'file':
                                    case 'reset':
                                    case 'submit':
                                    case 'button':
                                        setButtonStyle(result);
                                        break;
                                }
                                break;
                            }
                        }
                        break;
                    }
                    case 'BUTTON':
                        setButtonStyle(setBorderStyle());
                        break;
                    case 'TEXTAREA':
                    case 'SELECT':
                        setBorderStyle();
                        break;
                    case 'BODY': {
                        const backgroundColor = styleMap.backgroundColor;
                        if (!isString$4(backgroundColor) || backgroundColor === 'initial') {
                            styleMap.backgroundColor = 'rgb(255, 255, 255)';
                        }
                        break;
                    }
                    case 'FORM':
                        if (!isString$4(styleMap.marginTop)) {
                            styleMap.marginTop = '0px';
                        }
                        break;
                    case 'LI':
                        if (!isString$4(styleMap.listStyleImage)) {
                            const style = getStyle$3(element);
                            styleMap.listStyleImage = style.getPropertyValue('list-style-image');
                        }
                        break;
                    case 'IFRAME':
                        if (!isString$4(styleMap.display)) {
                            styleMap.display = 'block';
                        }
                    case 'VIDEO':
                    case 'svg':
                    case 'IMG': {
                        const setDimension = (attr, opposing) => {
                            const dimension = styleMap[attr];
                            if (!isString$4(dimension) || dimension === 'auto') {
                                const match = new RegExp(`\\s+${attr}="([^"]+)"`).exec(element.outerHTML);
                                if (match) {
                                    const value = match[1];
                                    if (isLength$1(value)) {
                                        styleMap[attr] = value + 'px';
                                    }
                                    else if (isPercent$1(value)) {
                                        styleMap[attr] = value;
                                    }
                                }
                                else if (tagName === 'IFRAME') {
                                    if (attr === 'width') {
                                        styleMap.width = '300px';
                                    }
                                    else {
                                        styleMap.height = '150px';
                                    }
                                }
                                else {
                                    const value = styleMap[opposing];
                                    if (value && isLength$1(value)) {
                                        const attrMax = `max${capitalize(attr)}`;
                                        if (!isString$4(styleMap[attrMax]) || !isPercent$1(attrMax)) {
                                            const image = this.application.resourceHandler.getImage(element.src);
                                            if (image && image.width > 0 && image.height > 0) {
                                                styleMap[attr] = formatPX$2(image[attr] * parseFloat(value) / image[opposing]);
                                            }
                                        }
                                    }
                                }
                            }
                        };
                        setDimension('width', 'height');
                        setDimension('height', 'width');
                        break;
                    }
                }
            }
            setElementCache$3(element, 'styleMap', sessionId, styleMap);
        }
        addBeforeOutsideTemplate(id, value, format = true, index = -1) {
            const template = safeNestedArray$1(this._beforeOutside, id);
            if (index !== -1 && index < template.length) {
                template.splice(index, 0, value);
            }
            else {
                template.push(value);
            }
            if (format) {
                this._requireFormat = true;
            }
        }
        addBeforeInsideTemplate(id, value, format = true, index = -1) {
            const template = safeNestedArray$1(this._beforeInside, id);
            if (index !== -1 && index < template.length) {
                template.splice(index, 0, value);
            }
            else {
                template.push(value);
            }
            if (format) {
                this._requireFormat = true;
            }
        }
        addAfterInsideTemplate(id, value, format = true, index = -1) {
            const template = safeNestedArray$1(this._afterInside, id);
            if (index !== -1 && index < template.length) {
                template.splice(index, 0, value);
            }
            else {
                template.push(value);
            }
            if (format) {
                this._requireFormat = true;
            }
        }
        addAfterOutsideTemplate(id, value, format = true, index = -1) {
            const template = safeNestedArray$1(this._afterOutside, id);
            if (index !== -1 && index < template.length) {
                template.splice(index, 0, value);
            }
            else {
                template.push(value);
            }
            if (format) {
                this._requireFormat = true;
            }
        }
        getBeforeOutsideTemplate(id, depth) {
            const template = this._beforeOutside[id];
            return template ? pushIndentArray(template, depth) : '';
        }
        getBeforeInsideTemplate(id, depth) {
            const template = this._beforeInside[id];
            return template ? pushIndentArray(template, depth) : '';
        }
        getAfterInsideTemplate(id, depth) {
            const template = this._afterInside[id];
            return template ? pushIndentArray(template, depth) : '';
        }
        getAfterOutsideTemplate(id, depth) {
            const template = this._afterOutside[id];
            return template ? pushIndentArray(template, depth) : '';
        }
        hasAppendProcessing(id) {
            return id === undefined ? this._requireFormat : (id in this._beforeOutside || id in this._beforeInside || id in this._afterInside || id in this._afterOutside);
        }
        includeElement(element) {
            return !(this._unsupportedTagName.has(element.tagName) || element.tagName === 'INPUT' && this._unsupportedTagName.has(element.tagName + ':' + element.type)) || element.contentEditable === 'true';
        }
        visibleElement(element, pseudoElt) {
            let style;
            let width;
            let height;
            if (pseudoElt) {
                const parentElement = element.parentElement;
                style = parentElement ? getStyle$3(parentElement, pseudoElt) : getStyle$3(element);
                width = 1;
                height = 1;
            }
            else {
                style = getStyle$3(element);
                if (style.getPropertyValue('display') !== 'none') {
                    const rect = actualClientRect$1(element, this.sessionId);
                    if (!withinViewport(rect)) {
                        return false;
                    }
                    ({ width, height } = rect);
                }
                else {
                    return false;
                }
            }
            if (width > 0 && height > 0) {
                return style.getPropertyValue('visibility') === 'visible' || !positionAbsolute(style);
            }
            else if (!pseudoElt) {
                if (iterateArray$3(element.children, (item) => this.visibleElement(item)) === Number.POSITIVE_INFINITY) {
                    return true;
                }
                if (element.tagName === 'IMG' && style.getPropertyValue('display') !== 'none') {
                    return true;
                }
            }
            if (!positionAbsolute(style)) {
                return (width > 0 && style.getPropertyValue('float') !== 'none' ||
                    !!pseudoElt && style.getPropertyValue('clear') !== 'none' ||
                    style.getPropertyValue('display') === 'block' && (getNumberValue(style, 'margin-top') !== 0 || getNumberValue(style, 'margin-bottom') !== 0));
            }
            return false;
        }
        evaluateNonStatic(documentRoot, cache) {
            const altered = new Set();
            const removed = new Set();
            cache.each(node => {
                if (!node.documentRoot && !node.pageFlow) {
                    const actualParent = node.parent;
                    let parent;
                    switch (node.css('position')) {
                        case 'fixed':
                            if (!node.autoPosition) {
                                parent = documentRoot;
                                break;
                            }
                        case 'absolute': {
                            const absoluteParent = node.absoluteParent;
                            if (absoluteParent) {
                                parent = absoluteParent;
                                if (node.autoPosition) {
                                    if (!node.siblingsLeading.some(item => item.multiline || item.excluded && !item.blockStatic)) {
                                        node.cssApply({ display: 'inline-block', verticalAlign: 'top' }, true);
                                    }
                                    else {
                                        node.autoPosition = false;
                                    }
                                    parent = actualParent;
                                }
                                else if (this.userSettings.supportNegativeLeftTop) {
                                    let outside = false;
                                    while (parent && parent !== documentRoot && (!parent.rightAligned && !parent.centerAligned || !parent.pageFlow)) {
                                        const linear = parent.linear;
                                        if (!outside) {
                                            if (node.hasPX('top') && node.hasPX('bottom') || node.hasPX('left') && node.hasPX('right')) {
                                                break;
                                            }
                                            else {
                                                const overflowX = parent.css('overflowX') === 'hidden';
                                                const overflowY = parent.css('overflowY') === 'hidden';
                                                if (overflowX && overflowY) {
                                                    break;
                                                }
                                                const outsideX = !overflowX && node.outsideX(linear);
                                                const outsideY = !overflowY && node.outsideY(linear);
                                                if (outsideX && (node.left < 0 || node.right > 0) || outsideY && (node.top < 0 || node.bottom !== 0)) {
                                                    outside = true;
                                                }
                                                else if (!overflowX && ((node.left < 0 || node.right > 0) && Math.ceil(node.bounds.right) < linear.left || (node.left > 0 || node.right < 0) && Math.floor(node.bounds.left) > linear.right) && parent.some(item => item.pageFlow)) {
                                                    outside = true;
                                                }
                                                else if (!overflowY && ((node.top < 0 || node.bottom > 0) && Math.ceil(node.bounds.bottom) < parent.bounds.top || (node.top > 0 || node.bottom < 0) && Math.floor(node.bounds.top) > parent.bounds.bottom)) {
                                                    outside = true;
                                                }
                                                else if (outsideX && outsideY && (!parent.pageFlow || parent.actualParent.documentRoot) && (node.top > 0 || node.left > 0)) {
                                                    outside = true;
                                                }
                                                else if (!overflowX && !overflowY && !node.intersectX(linear) && !node.intersectY(linear)) {
                                                    outside = true;
                                                }
                                                else {
                                                    break;
                                                }
                                            }
                                        }
                                        else if (parent.layoutElement) {
                                            parent = absoluteParent;
                                            break;
                                        }
                                        else if (node.withinX(linear) && node.withinY(linear)) {
                                            break;
                                        }
                                        parent = parent.actualParent;
                                    }
                                }
                            }
                            break;
                        }
                    }
                    if (!parent) {
                        parent = documentRoot;
                    }
                    if (parent !== actualParent) {
                        const absoluteParent = node.absoluteParent;
                        if ((absoluteParent === null || absoluteParent === void 0 ? void 0 : absoluteParent.positionRelative) && parent !== absoluteParent) {
                            const { left, right, top, bottom } = absoluteParent;
                            const bounds = node.bounds;
                            if (left !== 0) {
                                bounds.left += left;
                                bounds.right += left;
                            }
                            else if (!absoluteParent.hasPX('left') && right !== 0) {
                                bounds.left -= right;
                                bounds.right -= right;
                            }
                            if (top !== 0) {
                                bounds.top += top;
                                bounds.bottom += top;
                            }
                            else if (!absoluteParent.hasPX('top') && bottom !== 0) {
                                bounds.top -= bottom;
                                bounds.bottom -= bottom;
                            }
                            node.unset('box');
                            node.unset('linear');
                        }
                        let opacity = node.toFloat('opacity', 1);
                        let current = actualParent;
                        do {
                            opacity *= current.toFloat('opacity', 1);
                            current = current.actualParent;
                        } while (current && current !== parent);
                        node.css('opacity', opacity.toString());
                        node.parent = parent;
                        node.containerIndex = Number.POSITIVE_INFINITY;
                        altered.add(parent);
                        removed.add(actualParent);
                    }
                    node.documentParent = parent;
                }
            });
            for (const node of removed) {
                node.each((item, index) => item.containerIndex = index);
            }
            for (const node of altered) {
                const layers = [];
                let maxIndex = -1;
                node.each((item) => {
                    if (item.containerIndex === Number.POSITIVE_INFINITY) {
                        node.some((adjacent) => {
                            let valid = adjacent.naturalElements.includes(item);
                            if (!valid) {
                                const nested = adjacent.cascade();
                                valid = item.ascend({ condition: child => nested.includes(child) }).length > 0;
                            }
                            if (valid) {
                                safeNestedArray$1(layers, adjacent.containerIndex + (item.zIndex >= 0 || adjacent !== item.actualParent ? 1 : 0)).push(item);
                            }
                            return valid;
                        });
                    }
                    else if (item.containerIndex > maxIndex) {
                        maxIndex = item.containerIndex;
                    }
                });
                const length = layers.length;
                if (length) {
                    const children = node.children;
                    for (let i = 0, j = 0, k = 1; i < length; ++i, ++j) {
                        const order = layers[i];
                        if (order) {
                            order.sort((a, b) => {
                                if (a.parent === b.parent) {
                                    const zA = a.zIndex;
                                    const zB = b.zIndex;
                                    if (zA === zB) {
                                        return a.id < b.id ? -1 : 1;
                                    }
                                    return zA < zB ? -1 : 1;
                                }
                                return 0;
                            })
                                .forEach(item => item.containerIndex = maxIndex + k++);
                            const q = children.length;
                            for (let l = 0; l < q; ++l) {
                                if (order.includes(children[l])) {
                                    children[l] = undefined;
                                }
                            }
                            children.splice(j, 0, ...order);
                            j += order.length;
                        }
                    }
                    node.retain(flatArray$1(children));
                }
            }
        }
        sortInitialCache(cache) {
            (cache || this.cache).sort((a, b) => {
                if (a.depth !== b.depth) {
                    return a.depth < b.depth ? -1 : 1;
                }
                else {
                    const parentA = a.documentParent;
                    const parentB = b.documentParent;
                    if (parentA !== parentB) {
                        const depthA = parentA.depth;
                        const depthB = parentB.depth;
                        if (depthA !== depthB) {
                            return depthA < depthB ? -1 : 1;
                        }
                        else if (parentA.actualParent === parentB.actualParent) {
                            return parentA.childIndex < parentB.childIndex ? -1 : 1;
                        }
                        return parentA.id < parentB.id ? -1 : 1;
                    }
                }
                return 0;
            });
        }
        cascadeDocument(templates, depth) {
            const showAttributes = this.userSettings.showAttributes;
            const indent = '\t'.repeat(depth);
            let output = '';
            const length = templates.length;
            let i = 0;
            while (i < length) {
                const item = templates[i++];
                const node = item.node;
                switch (item.type) {
                    case 1 /* XML */: {
                        const { controlName, attributes } = item;
                        const { id, renderTemplates } = node;
                        const next = depth + 1;
                        const previous = node.depth < 0 ? depth + node.depth : depth;
                        const beforeInside = this.getBeforeInsideTemplate(id, next);
                        const afterInside = this.getAfterInsideTemplate(id, next);
                        let template = indent + `<${controlName + (depth === 0 ? '{#0}' : '') + (showAttributes ? (attributes ? pushIndent(attributes, next) : node.extractAttributes(next)) : '')}`;
                        if (renderTemplates || beforeInside !== '' || afterInside !== '') {
                            template += '>\n' +
                                beforeInside +
                                (renderTemplates ? this.cascadeDocument(this.sortRenderPosition(node, renderTemplates), next) : '') +
                                afterInside +
                                indent + `</${controlName}>\n`;
                        }
                        else {
                            template += ' />\n';
                        }
                        output += this.getBeforeOutsideTemplate(id, previous) + template + this.getAfterOutsideTemplate(id, previous);
                        break;
                    }
                    case 2 /* INCLUDE */: {
                        const content = item.content;
                        if (content) {
                            output += pushIndent(content, depth);
                        }
                        break;
                    }
                }
            }
            return output;
        }
        getEnclosingXmlTag(controlName, attributes = '', content) {
            return '<' + controlName + attributes + (content ? `>\n${content}</${controlName}>\n` : ' />\n');
        }
        get generateSessionId() {
            return new Date().getTime().toString();
        }
    }

    const $lib$6 = squared.lib;
    const { hasComputedStyle: hasComputedStyle$2 } = $lib$6.css;
    const { includes } = $lib$6.util;
    class ExtensionUI extends Extension {
        constructor(name, framework, options, tagNames = []) {
            super(name, framework, options);
            this.eventOnly = false;
            this.documentBase = false;
            this.cascadeAll = false;
            this.removeIs = false;
            this.tagNames = tagNames;
            this._isAll = tagNames.length === 0;
        }
        static findNestedElement(element, name) {
            if (element && hasComputedStyle$2(element)) {
                const children = element.children;
                const length = children.length;
                let i = 0;
                while (i < length) {
                    const item = children[i++];
                    if (includes(item.dataset.use, name)) {
                        return item;
                    }
                }
            }
            return null;
        }
        is(node) {
            return this._isAll || this.tagNames.includes(node.tagName);
        }
        condition(node, parent) {
            return node.dataset.use ? this.included(node.element) : !this._isAll;
        }
        included(element) {
            return includes(element.dataset.use, this.name);
        }
        processNode(node, parent) {
            return undefined;
        }
        processChild(node, parent) {
            return undefined;
        }
        addDescendant(node) {
            const map = this.application.session.extensionMap;
            const id = node.id;
            const extensions = map.get(id);
            if (extensions) {
                if (!extensions.includes(this)) {
                    extensions.push(this);
                }
            }
            else {
                map.set(id, [this]);
            }
        }
        postBaseLayout(node) { }
        postConstraints(node) { }
        postOptimize(node) { }
        afterBaseLayout() { }
        afterConstraints() { }
        afterResources() { }
        beforeBaseLayout() { }
        beforeCascade(documentRoot) { }
        afterFinalize() { }
        set application(value) {
            this._application = value;
            this._controller = value.controllerHandler;
            this._resource = value.resourceHandler;
            this._cache = value.session.cache;
            this._cacheProcessing = value.processing.cache;
        }
        get application() {
            return this._application;
        }
        get controller() {
            return this._controller;
        }
        get resource() {
            return this._resource;
        }
        get cache() {
            return this._cache;
        }
        get cacheProcessing() {
            return this._cacheProcessing;
        }
    }

    class FileUI extends File {
        get directory() {
            return this.resource.controllerSettings.directory;
        }
    }

    const { isLength: isLength$2 } = squared.lib.css;
    class NodeGroupUI extends NodeUI {
        init() {
            var _a;
            if (this.length) {
                this.each(item => item.parent = this);
                this.setBounds();
                this.saveAsInitial();
                this.dir = ((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.dir) || '';
            }
        }
        setBounds() {
            if (this.length) {
                this._bounds = NodeUI.outerRegion(this);
                return this._bounds;
            }
            return undefined;
        }
        previousSiblings(options) {
            var _a;
            const node = (((_a = this._initial) === null || _a === void 0 ? void 0 : _a.children) || this.children)[0];
            return (node === null || node === void 0 ? void 0 : node.previousSiblings(options)) || [];
        }
        nextSiblings(options) {
            var _a;
            const children = ((_a = this._initial) === null || _a === void 0 ? void 0 : _a.children) || this.children;
            const node = children[children.length - 1];
            return (node === null || node === void 0 ? void 0 : node.nextSiblings(options)) || [];
        }
        get block() {
            let result = this._cached.block;
            if (result === undefined) {
                result = this.some(node => node.block);
                this._cached.block = result;
            }
            return result;
        }
        get blockStatic() {
            let result = this._cached.blockStatic;
            if (result === undefined) {
                const documentParent = this.actualParent || this.documentParent;
                result = (this.some(node => node.blockStatic || node.percentWidth > 0) ||
                    documentParent.percentWidth > 0 ||
                    this.layoutVertical && (documentParent.hasWidth || this.some(node => node.centerAligned || node.rightAligned)) ||
                    documentParent.blockStatic && (documentParent.layoutVertical || this.hasAlign(256 /* COLUMN */)));
                if (result || this.containerType !== 0) {
                    this._cached.blockStatic = result;
                }
            }
            return result || this.hasAlign(64 /* BLOCK */);
        }
        get blockDimension() {
            let result = this._cached.blockDimension;
            if (result === undefined) {
                result = this.every(node => node.blockDimension);
                this._cached.blockDimension = result;
            }
            return result;
        }
        get blockVertical() {
            let result = this._cached.blockVertical;
            if (result === undefined) {
                result = this.every(node => node.blockVertical);
                this._cached.blockVertical = result;
            }
            return result;
        }
        get inline() {
            let result = this._cached.inline;
            if (result === undefined) {
                result = this.every(node => node.inline);
                this._cached.inline = result;
            }
            return result && !this.hasAlign(64 /* BLOCK */);
        }
        get inlineStatic() {
            let result = this._cached.inlineStatic;
            if (result === undefined) {
                result = this.every(node => node.inlineStatic);
                this._cached.inlineStatic = result;
            }
            return result && !this.hasAlign(64 /* BLOCK */);
        }
        get inlineVertical() {
            let result = this._cached.inlineVertical;
            if (result === undefined) {
                result = this.every(node => node.inlineVertical);
                this._cached.inlineVertical = result;
            }
            return result && !this.hasAlign(64 /* BLOCK */);
        }
        get inlineFlow() {
            let result = this._cached.inlineFlow;
            if (result === undefined) {
                result = this.every(node => node.inlineFlow);
                this._cached.inlineFlow = result;
            }
            return result && !this.hasAlign(64 /* BLOCK */);
        }
        get inlineDimension() {
            let result = this._cached.inlineDimension;
            if (result === undefined) {
                result = this.every(node => node.inlineDimension);
                this._cached.inlineDimension = result;
            }
            return result && !this.hasAlign(64 /* BLOCK */);
        }
        get pageFlow() {
            let result = this._cached.pageFlow;
            if (result === undefined) {
                const value = this.css('position');
                result = value !== 'absolute' && value !== 'fixed';
                this._cached.pageFlow = result;
            }
            return result;
        }
        set baseline(value) {
            this._cached.baseline = value;
        }
        get baseline() {
            let result = this._cached.baseline;
            if (result === undefined) {
                const value = this.cssInitial('verticalAlign', true);
                if (value === '') {
                    result = this.every((node) => node.baseline);
                }
                else {
                    result = value === 'baseline' || isLength$2(value, true);
                }
                this._cached.baseline = result;
            }
            return result;
        }
        get float() {
            let result = this._cached.float;
            if (result === undefined) {
                if (this.floating) {
                    if (this.hasAlign(2048 /* RIGHT */)) {
                        result = 'right';
                    }
                    else if (this.every(node => node.float === 'right')) {
                        this.addAlign(2048 /* RIGHT */);
                        result = 'right';
                    }
                    else {
                        result = 'left';
                    }
                }
                else {
                    result = 'none';
                }
                this._cached.float = result;
            }
            return result;
        }
        get floating() {
            let result = this._cached.floating;
            if (result === undefined) {
                result = this.every((node) => node.floating || node.hasAlign(512 /* FLOAT */));
                this._cached.floating = result;
            }
            return result;
        }
        get display() {
            return super.display || (this.some(node => node.blockStatic) ? 'block' : (this.blockDimension ? 'inline-block' : 'inline'));
        }
        get firstChild() {
            return this.children[0] || null;
        }
        get lastChild() {
            const children = this.children;
            return children[children.length - 1] || null;
        }
        set childIndex(value) {
            super.childIndex = value;
        }
        get childIndex() {
            let result = super.childIndex;
            if (result === Number.POSITIVE_INFINITY) {
                this.each(node => result = Math.min(node.childIndex, result));
                super.childIndex = result;
            }
            return result;
        }
        set containerIndex(value) {
            super.containerIndex = value;
        }
        get containerIndex() {
            let result = super.containerIndex;
            if (result === Number.POSITIVE_INFINITY) {
                this.each(node => result = Math.min(node.containerIndex, result));
                super.containerIndex = result;
            }
            return result;
        }
        get centerAligned() {
            let result = this._cached.centerAligned;
            if (result === undefined) {
                result = this.every(node => node.centerAligned);
                this._cached.centerAligned = result;
            }
            return result;
        }
        get rightAligned() {
            let result = this._cached.rightAligned;
            if (result === undefined) {
                result = this.every(node => node.rightAligned);
                this._cached.rightAligned = result;
            }
            return result || this.hasAlign(2048 /* RIGHT */);
        }
        get tagName() {
            return '';
        }
        get plainText() {
            return false;
        }
        get styleText() {
            return false;
        }
        get multiline() {
            return false;
        }
        get nodeGroup() {
            return true;
        }
        get naturalChild() {
            return false;
        }
        get naturalElement() {
            return false;
        }
        get pseudoElement() {
            return false;
        }
        get previousSibling() {
            return null;
        }
        get nextSibling() {
            return null;
        }
        get previousElementSibling() {
            return null;
        }
        get nextElementSibling() {
            return null;
        }
    }

    const $lib$7 = squared.lib;
    const { USER_AGENT: USER_AGENT$2, isUserAgent: isUserAgent$2 } = $lib$7.client;
    const { parseColor } = $lib$7.color;
    const { BOX_BORDER: BOX_BORDER$2, calculate, convertAngle, formatPX: formatPX$3, getBackgroundPosition, getInheritedStyle: getInheritedStyle$1, isCalc, isLength: isLength$3, isParentStyle, isPercent: isPercent$2, parseAngle } = $lib$7.css;
    const { cos, equal: equal$1, hypotenuse, offsetAngleX, offsetAngleY, relativeAngle, sin, triangulate, truncateFraction } = $lib$7.math;
    const { CHAR: CHAR$2, ESCAPE, STRING: STRING$2, XML: XML$5 } = $lib$7.regex;
    const { getElementAsNode: getElementAsNode$2 } = $lib$7.session;
    const { appendSeparator: appendSeparator$1, convertCamelCase: convertCamelCase$2, convertFloat: convertFloat$3, hasValue: hasValue$1, isEqual, isNumber: isNumber$1, isString: isString$5, iterateArray: iterateArray$4, trimEnd, trimStart } = $lib$7.util;
    const { STRING_SPACE, STRING_TABSPACE } = $lib$7.xml;
    const STRING_COLORSTOP = `((?:rgb|hsl)a?\\(\\d+,\\s+\\d+%?,\\s+\\d+%?(?:,\\s+[\\d.]+)?\\)|#[A-Za-z\\d]{3,8}|[a-z]+)\\s*(${STRING$2.LENGTH_PERCENTAGE}|${STRING$2.CSS_ANGLE}|(?:${STRING$2.CSS_CALC}(?=,)|${STRING$2.CSS_CALC}))?,?\\s*`;
    const REGEX_NOBREAKSPACE = /\u00A0/g;
    const REGEX_BACKGROUNDIMAGE = new RegExp(`(?:initial|url\\([^)]+\\)|(repeating-)?(linear|radial|conic)-gradient\\(((?:to\\s+[a-z\\s]+|(?:from\\s+)?-?[\\d.]+(?:deg|rad|turn|grad)|(?:circle|ellipse)?\\s*(?:closest-side|closest-corner|farthest-side|farthest-corner)?)?(?:\\s*(?:(?:-?[\\d.]+(?:[a-z%]+)?\\s*)+)?(?:at\\s+[\\w %]+)?)?),?\\s*((?:${STRING_COLORSTOP})+)\\))`, 'g');
    const REGEX_COLORSTOP = new RegExp(STRING_COLORSTOP, 'g');
    const REGEX_TRAILINGINDENT = /\n([^\S\n]*)?$/;
    function parseColorStops(node, gradient, value) {
        const { width, height } = gradient.dimension;
        const result = [];
        let repeat = false;
        let horizontal = true;
        let extent = 1;
        let size;
        switch (gradient.type) {
            case 'linear': {
                const { repeating, angle } = gradient;
                repeat = repeating;
                switch (angle) {
                    case 0:
                    case 180:
                    case 360:
                        size = height;
                        horizontal = false;
                        break;
                    case 90:
                    case 270:
                        size = width;
                        break;
                    default: {
                        size = Math.abs(width * sin(angle - 180)) + Math.abs(height * cos(angle - 180));
                        horizontal = width >= height;
                        break;
                    }
                }
                break;
            }
            case 'radial': {
                const { repeating, radiusExtent, radius } = gradient;
                horizontal = node.actualWidth >= node.actualHeight;
                repeat = repeating;
                extent = radiusExtent / radius;
                size = radius;
                break;
            }
            case 'conic':
                size = Math.min(width, height);
                break;
            default:
                return result;
        }
        let previousOffset = 0;
        let match;
        while ((match = REGEX_COLORSTOP.exec(value)) !== null) {
            const color = parseColor(match[1], 1, true);
            if (color) {
                let offset = -1;
                if (gradient.type === 'conic') {
                    const angle = match[3];
                    const unit = match[4];
                    if (angle && unit) {
                        offset = convertAngle(angle, unit) / 360;
                    }
                }
                else {
                    const unit = match[2];
                    if (isPercent$2(unit)) {
                        offset = parseFloat(unit) / 100;
                    }
                    else if (isLength$3(unit)) {
                        offset = (horizontal ? node.parseWidth(unit, false) : node.parseHeight(unit, false)) / size;
                    }
                    else if (isCalc(unit)) {
                        offset = calculate(match[6], { boundingSize: size, fontSize: node.fontSize }) / size;
                        if (isNaN(offset)) {
                            offset = -1;
                        }
                    }
                    if (repeat && offset !== -1) {
                        offset *= extent;
                    }
                }
                if (result.length === 0) {
                    if (offset === -1) {
                        offset = 0;
                    }
                    else if (offset > 0) {
                        result.push({ color, offset: 0 });
                    }
                }
                if (offset !== -1) {
                    offset = Math.max(previousOffset, offset);
                    previousOffset = offset;
                }
                result.push({ color, offset });
            }
        }
        const length = result.length;
        const lastStop = result[length - 1];
        if (lastStop.offset === -1) {
            lastStop.offset = 1;
        }
        let percent = 0;
        for (let i = 0; i < length; ++i) {
            const stop = result[i];
            if (stop.offset === -1) {
                if (i === 0) {
                    stop.offset = 0;
                }
                else {
                    for (let j = i + 1, k = 2; j < length - 1; ++k) {
                        const data = result[j++];
                        if (data.offset !== -1) {
                            stop.offset = (percent + data.offset) / k;
                            break;
                        }
                    }
                    if (stop.offset === -1) {
                        stop.offset = percent + lastStop.offset / (length - 1);
                    }
                }
            }
            percent = stop.offset;
        }
        if (repeat) {
            if (percent < 100) {
                complete: {
                    let basePercent = percent;
                    const original = result.slice(0);
                    while (percent < 100) {
                        let i = 0;
                        while (i < length) {
                            const data = original[i++];
                            percent = Math.min(basePercent + data.offset, 1);
                            result.push(Object.assign(Object.assign({}, data), { offset: percent }));
                            if (percent === 1) {
                                break complete;
                            }
                        }
                        basePercent = percent;
                    }
                }
            }
        }
        else if (percent < 1) {
            result.push(Object.assign(Object.assign({}, result[length - 1]), { offset: 1 }));
        }
        REGEX_COLORSTOP.lastIndex = 0;
        return result;
    }
    function getAngle(value, fallback = 0) {
        value = value.trim();
        if (value !== '') {
            let degree = parseAngle(value);
            if (degree < 0) {
                degree += 360;
            }
            return degree;
        }
        return fallback;
    }
    function replaceWhiteSpace(node, value) {
        var _a, _b, _c;
        let inlined = false;
        value = value.replace(REGEX_NOBREAKSPACE, STRING_SPACE);
        switch (node.css('whiteSpace')) {
            case 'nowrap':
                value = value.replace(/\n/g, ' ');
                inlined = true;
                break;
            case 'pre':
            case 'pre-wrap': {
                if (((_a = node.renderParent) === null || _a === void 0 ? void 0 : _a.layoutVertical) === false) {
                    value = value.replace(/^\s*\n/, '');
                }
                const preIndent = ResourceUI.checkPreIndent(node);
                if (preIndent) {
                    const [indent, adjacent] = preIndent;
                    if (indent !== '') {
                        adjacent.textContent = indent + adjacent.textContent;
                    }
                    value = value.replace(REGEX_TRAILINGINDENT, '');
                }
                value = value
                    .replace(/\n/g, '\\n')
                    .replace(/\t/g, STRING_TABSPACE)
                    .replace(/\s/g, STRING_SPACE);
                return [value, true, false];
            }
            case 'pre-line':
                value = value
                    .replace(/\n/g, '\\n')
                    .replace(/\s+/g, ' ');
                return [value, true, false];
        }
        if (node.onlyChild && node.htmlElement) {
            value = value
                .replace(CHAR$2.LEADINGSPACE, '')
                .replace(CHAR$2.TRAILINGSPACE, '');
        }
        else {
            if ((_b = node.previousSibling) === null || _b === void 0 ? void 0 : _b.blockStatic) {
                value = value.replace(CHAR$2.LEADINGSPACE, '');
            }
            if ((_c = node.nextSibling) === null || _c === void 0 ? void 0 : _c.blockStatic) {
                value = value.replace(CHAR$2.TRAILINGSPACE, '');
            }
        }
        return [value, inlined, true];
    }
    function getBackgroundSize(node, index, value, screenDimension) {
        if (value) {
            const sizes = value.split(XML$5.SEPARATOR);
            return ResourceUI.getBackgroundSize(node, sizes[index % sizes.length], screenDimension);
        }
        return undefined;
    }
    function setBorderStyle(node, boxStyle, attr, border) {
        const style = node.css(border[0]) || 'none';
        if (style !== 'none') {
            let width = formatPX$3(attr !== 'outline' ? node[border[1]] : convertFloat$3(node.style[border[1]]));
            if (width !== '0px') {
                let color = node.css(border[2]) || 'initial';
                switch (color) {
                    case 'initial':
                        color = 'rgb(0, 0, 0)';
                        break;
                    case 'inherit':
                    case 'currentcolor':
                    case 'currentColor':
                        color = getInheritedStyle$1(node.element, border[2]);
                        break;
                }
                if (width === '2px' && (style === 'inset' || style === 'outset')) {
                    width = '1px';
                }
                color = parseColor(color, 1, true);
                if (color) {
                    boxStyle[attr] = {
                        width,
                        style,
                        color
                    };
                }
            }
        }
    }
    function setBackgroundOffset(node, boxStyle, attr) {
        let value = node.css(attr);
        if (value === 'initial') {
            value = attr === 'backgroundClip' ? 'border-box' : 'padding-box';
        }
        switch (value) {
            case 'border-box':
                return true;
            case 'padding-box':
                boxStyle[attr] = {
                    top: node.borderTopWidth,
                    right: node.borderRightWidth,
                    bottom: node.borderBottomWidth,
                    left: node.borderLeftWidth
                };
                break;
            case 'content-box':
                boxStyle[attr] = {
                    top: node.borderTopWidth + node.paddingTop,
                    right: node.borderRightWidth + node.paddingRight,
                    bottom: node.borderBottomWidth + node.paddingBottom,
                    left: node.borderLeftWidth + node.paddingLeft
                };
                break;
        }
        return false;
    }
    function getStoredName(asset, value) {
        const stored = ResourceUI.STORED[asset];
        if (stored) {
            for (const [name, data] of stored.entries()) {
                if (isEqual(value, data)) {
                    return name;
                }
            }
        }
        return '';
    }
    const replaceAmpersand = (value) => value.replace(/&/g, '&amp;');
    const getGradientPosition = (value) => isString$5(value) ? (value.includes('at ') ? /(.+?)?\s*at (.+?)\s*$/.exec(value) : [value, value]) : null;
    class ResourceUI extends Resource {
        static isInheritedStyle(node, attr) {
            var _a;
            return node.styleElement && node.style[attr] === ((_a = node.actualParent) === null || _a === void 0 ? void 0 : _a.style[attr]) && (node.cssStyle[attr] === 'inherit' || node.cssInitial(attr) === '');
        }
        static isBackgroundVisible(object) {
            return !!object && ('backgroundImage' in object || 'borderTop' in object || 'borderRight' in object || 'borderBottom' in object || 'borderLeft' in object);
        }
        static generateId(section, name, start = 1) {
            const prefix = name;
            let i = start;
            if (start === 1) {
                name += '_' + i;
            }
            const ids = this.ASSETS.ids;
            const previous = ids.get(section) || [];
            do {
                if (!previous.includes(name)) {
                    previous.push(name);
                    break;
                }
                else {
                    name = `${prefix}_${++i}`;
                }
            } while (true);
            ids.set(section, previous);
            return name;
        }
        static insertStoredAsset(asset, name, value) {
            const stored = ResourceUI.STORED[asset];
            if (stored && hasValue$1(value)) {
                let result = getStoredName(asset, value);
                if (result === '') {
                    if (isNumber$1(name)) {
                        name = '__' + name;
                    }
                    let i = 0;
                    do {
                        result = name + (i > 0 ? '_' + i : '');
                        if (!stored.has(result)) {
                            stored.set(result, value);
                            break;
                        }
                    } while (++i);
                }
                return result;
            }
            return '';
        }
        static getOptionArray(element, showDisabled = false) {
            let result = [];
            let numberArray = true;
            iterateArray$4(element.children, (item) => {
                if (item.disabled && !showDisabled) {
                    return;
                }
                switch (item.tagName) {
                    case 'OPTION': {
                        const value = item.text.trim() || item.value.trim();
                        if (value !== '') {
                            if (numberArray && !isNumber$1(value)) {
                                numberArray = false;
                            }
                            result.push(value);
                        }
                        break;
                    }
                    case 'OPTGROUP': {
                        const [groupStringArray, groupNumberArray] = this.getOptionArray(item, showDisabled);
                        if (groupStringArray) {
                            result = result.concat(groupStringArray);
                            numberArray = false;
                        }
                        else if (groupNumberArray) {
                            result = result.concat(groupNumberArray);
                        }
                        break;
                    }
                }
            });
            return numberArray ? [undefined, result] : [result];
        }
        static parseBackgroundImage(node, backgroundImage, screenDimension) {
            var _a, _b;
            if (backgroundImage !== '') {
                const images = [];
                let i = 0;
                REGEX_BACKGROUNDIMAGE.lastIndex = 0;
                let match;
                while ((match = REGEX_BACKGROUNDIMAGE.exec(backgroundImage)) !== null) {
                    const value = match[0];
                    if (value.startsWith('url(') || value === 'initial') {
                        images.push(value);
                    }
                    else {
                        const repeating = !!match[1];
                        const type = match[2];
                        const direction = match[3];
                        const imageDimension = getBackgroundSize(node, i, node.css('backgroundSize'), screenDimension);
                        const dimension = NodeUI.refitScreen(node, imageDimension || node.actualDimension);
                        let gradient;
                        switch (type) {
                            case 'linear': {
                                const { width, height } = dimension;
                                let angle = 180;
                                switch (direction) {
                                    case 'to top':
                                        angle = 360;
                                        break;
                                    case 'to right top':
                                        angle = 45;
                                        break;
                                    case 'to right':
                                        angle = 90;
                                        break;
                                    case 'to right bottom':
                                        angle = 135;
                                        break;
                                    case 'to bottom':
                                        break;
                                    case 'to left bottom':
                                        angle = 225;
                                        break;
                                    case 'to left':
                                        angle = 270;
                                        break;
                                    case 'to left top':
                                        angle = 315;
                                        break;
                                    default:
                                        if (direction) {
                                            angle = getAngle(direction, 180) || 360;
                                        }
                                        break;
                                }
                                let x = truncateFraction(offsetAngleX(angle, width));
                                let y = truncateFraction(offsetAngleY(angle, height));
                                if (x !== width && y !== height && !equal$1(Math.abs(x), Math.abs(y))) {
                                    let opposite;
                                    if (angle <= 90) {
                                        opposite = relativeAngle({ x: 0, y: height }, { x: width, y: 0 });
                                    }
                                    else if (angle <= 180) {
                                        opposite = relativeAngle({ x: 0, y: 0 }, { x: width, y: height });
                                    }
                                    else if (angle <= 270) {
                                        opposite = relativeAngle({ x: 0, y: 0 }, { x: -width, y: height });
                                    }
                                    else {
                                        opposite = relativeAngle({ x: 0, y: height }, { x: -width, y: 0 });
                                    }
                                    const a = Math.abs(opposite - angle);
                                    x = truncateFraction(offsetAngleX(angle, triangulate(a, 90 - a, hypotenuse(width, height))[1]));
                                    y = truncateFraction(offsetAngleY(angle, triangulate(90, 90 - angle, x)[0]));
                                }
                                const linear = {
                                    type,
                                    repeating,
                                    dimension,
                                    angle,
                                    angleExtent: { x, y }
                                };
                                linear.colorStops = parseColorStops(node, linear, match[4]);
                                gradient = linear;
                                break;
                            }
                            case 'radial': {
                                const position = getGradientPosition(direction);
                                const center = getBackgroundPosition((position === null || position === void 0 ? void 0 : position[2]) || 'center', dimension, { fontSize: node.fontSize, imageDimension, screenDimension });
                                const { left, top } = center;
                                const { width, height } = dimension;
                                let shape = 'ellipse';
                                let closestSide = top;
                                let farthestSide = top;
                                let closestCorner = Number.POSITIVE_INFINITY;
                                let farthestCorner = Number.NEGATIVE_INFINITY;
                                let radius = 0;
                                let radiusExtent = 0;
                                if (position) {
                                    const name = (_a = position[1]) === null || _a === void 0 ? void 0 : _a.trim();
                                    if (name) {
                                        if (name.startsWith('circle')) {
                                            shape = 'circle';
                                        }
                                        else {
                                            let minRadius = Number.POSITIVE_INFINITY;
                                            const radiusXY = name.split(' ');
                                            const length = radiusXY.length;
                                            for (let j = 0; j < length; ++j) {
                                                minRadius = Math.min(j === 0 ? node.parseWidth(radiusXY[j], false) : node.parseHeight(radiusXY[j], false), minRadius);
                                            }
                                            radius = minRadius;
                                            radiusExtent = minRadius;
                                            if (length === 1 || radiusXY[0] === radiusXY[1]) {
                                                shape = 'circle';
                                            }
                                        }
                                    }
                                }
                                [[0, 0], [width, 0], [width, height], [0, height]].forEach(corner => {
                                    const length = Math.round(hypotenuse(Math.abs(corner[0] - left), Math.abs(corner[1] - top)));
                                    closestCorner = Math.min(length, closestCorner);
                                    farthestCorner = Math.max(length, farthestCorner);
                                });
                                [width - left, height - top, left].forEach(side => {
                                    closestSide = Math.min(side, closestSide);
                                    farthestSide = Math.max(side, farthestSide);
                                });
                                const radial = {
                                    type,
                                    repeating,
                                    dimension,
                                    shape,
                                    center,
                                    closestSide,
                                    farthestSide,
                                    closestCorner,
                                    farthestCorner
                                };
                                if (radius === 0 && radiusExtent === 0) {
                                    radius = farthestCorner;
                                    const extent = ((_b = position === null || position === void 0 ? void 0 : position[1]) === null || _b === void 0 ? void 0 : _b.split(' ').pop()) || '';
                                    switch (extent) {
                                        case 'closest-corner':
                                        case 'closest-side':
                                        case 'farthest-side': {
                                            const length = radial[convertCamelCase$2(extent)];
                                            if (repeating) {
                                                radiusExtent = length;
                                            }
                                            else {
                                                radius = length;
                                            }
                                            break;
                                        }
                                        default:
                                            radiusExtent = farthestCorner;
                                            break;
                                    }
                                }
                                radial.radius = radius;
                                radial.radiusExtent = radiusExtent;
                                radial.colorStops = parseColorStops(node, radial, match[4]);
                                gradient = radial;
                                break;
                            }
                            case 'conic': {
                                const position = getGradientPosition(direction);
                                const conic = {
                                    type,
                                    dimension,
                                    angle: getAngle(direction),
                                    center: getBackgroundPosition((position === null || position === void 0 ? void 0 : position[2]) || 'center', dimension, { fontSize: node.fontSize, imageDimension, screenDimension })
                                };
                                conic.colorStops = parseColorStops(node, conic, match[4]);
                                gradient = conic;
                                break;
                            }
                        }
                        images.push(gradient || 'initial');
                    }
                    ++i;
                }
                if (images.length) {
                    return images;
                }
            }
            return undefined;
        }
        static getBackgroundSize(node, value, screenDimension) {
            let width = 0;
            let height = 0;
            switch (value) {
                case '':
                case 'cover':
                case 'contain':
                case '100% 100%':
                case 'auto':
                case 'auto auto':
                case 'initial':
                    return undefined;
                default: {
                    const dimensions = value.split(CHAR$2.SPACE);
                    const length = dimensions.length;
                    if (length === 1) {
                        dimensions[1] = dimensions[0];
                    }
                    dimensions.forEach((size, index) => {
                        if (size === 'auto') {
                            size = '100%';
                        }
                        switch (index) {
                            case 0:
                                width = node.parseUnit(size, 'width', false, screenDimension);
                                break;
                            case 1:
                                height = node.parseUnit(size, 'height', false, screenDimension);
                                break;
                        }
                    });
                    break;
                }
            }
            return width > 0 && height > 0 ? { width: Math.round(width), height: Math.round(height) } : undefined;
        }
        static hasLineBreak(node, lineBreak = false, trim = false) {
            if (node.naturalElements.length) {
                return node.naturalElements.some(item => item.lineBreak);
            }
            else if (!lineBreak && node.naturalChild) {
                const element = node.element;
                let value = element.textContent;
                if (trim) {
                    value = value.trim();
                }
                return value.includes('\n') && (node.plainText && isParentStyle(element, 'whiteSpace', 'pre', 'pre-wrap') || node.css('whiteSpace').startsWith('pre'));
            }
            return false;
        }
        static checkPreIndent(node) {
            if (node.plainText) {
                const parent = node.actualParent;
                if ((parent === null || parent === void 0 ? void 0 : parent.preserveWhiteSpace) && parent.ascend({ condition: item => item.tagName === 'PRE', startSelf: true }).length) {
                    let nextSibling = node.nextSibling;
                    if (nextSibling === null || nextSibling === void 0 ? void 0 : nextSibling.naturalElement) {
                        const textContent = node.textContent;
                        if (textContent.trim() !== '') {
                            const match = REGEX_TRAILINGINDENT.exec(textContent);
                            if (match) {
                                if (!nextSibling.textElement) {
                                    nextSibling = nextSibling.find(item => item.naturalChild && item.textElement, { cascade: true, error: item => item.naturalChild && !item.textElement && item.length === 0 });
                                }
                                if (nextSibling) {
                                    return [match[1] ? match[0] : '', nextSibling];
                                }
                            }
                        }
                    }
                }
            }
            return undefined;
        }
        finalize(layouts) { }
        reset() {
            super.reset();
            const STORED = ResourceUI.STORED;
            for (const name in STORED) {
                STORED[name].clear();
            }
        }
        writeRawImage(filename, base64) {
            const fileHandler = this.fileHandler;
            if (fileHandler) {
                const asset = { pathname: appendSeparator$1(this.userSettings.outputDirectory, this.controllerSettings.directory.image), filename, base64 };
                fileHandler.addAsset(asset);
                return asset;
            }
            return undefined;
        }
        setBoxStyle(node) {
            var _a;
            if ((node.styleElement || node.visibleStyle.background) && node.hasResource(NODE_RESOURCE.BOX_STYLE)) {
                const boxStyle = node.cssAsObject('backgroundSize', 'backgroundRepeat', 'backgroundPositionX', 'backgroundPositionY');
                if (setBackgroundOffset(node, boxStyle, 'backgroundClip')) {
                    setBackgroundOffset(node, boxStyle, 'backgroundOrigin');
                }
                if (node.css('borderRadius') !== '0px') {
                    const { borderTopLeftRadius, borderTopRightRadius, borderBottomRightRadius, borderBottomLeftRadius } = node.cssAsObject('borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius');
                    const [A, B] = borderTopLeftRadius.split(' ');
                    const [C, D] = borderTopRightRadius.split(' ');
                    const [E, F] = borderBottomRightRadius.split(' ');
                    const [G, H] = borderBottomLeftRadius.split(' ');
                    const borderRadius = !B && !D && !F && !H ? [A, C, E, G] : [A, B || A, C, D || C, E, F || E, G, H || G];
                    const horizontal = node.actualWidth >= node.actualHeight;
                    const radius = borderRadius[0];
                    if (borderRadius.every(value => value === radius)) {
                        borderRadius.length = radius === '0px' || radius === '' ? 0 : 1;
                    }
                    const length = borderRadius.length;
                    if (length) {
                        const dimension = horizontal ? 'width' : 'height';
                        let i = 0;
                        while (i < length) {
                            borderRadius[i] = formatPX$3(node.parseUnit(borderRadius[i++], dimension, false));
                        }
                        boxStyle.borderRadius = borderRadius;
                    }
                }
                if (node.visibleStyle.borderWidth) {
                    if (node.borderTopWidth > 0) {
                        setBorderStyle(node, boxStyle, 'borderTop', BOX_BORDER$2[0]);
                    }
                    if (node.borderRightWidth > 0) {
                        setBorderStyle(node, boxStyle, 'borderRight', BOX_BORDER$2[1]);
                    }
                    if (node.borderBottomWidth > 0) {
                        setBorderStyle(node, boxStyle, 'borderBottom', BOX_BORDER$2[2]);
                    }
                    if (node.borderLeftWidth > 0) {
                        setBorderStyle(node, boxStyle, 'borderLeft', BOX_BORDER$2[3]);
                    }
                }
                setBorderStyle(node, boxStyle, 'outline', BOX_BORDER$2[4]);
                if (node.hasResource(NODE_RESOURCE.IMAGE_SOURCE)) {
                    boxStyle.backgroundImage = ResourceUI.parseBackgroundImage(node, node.backgroundImage, node.localSettings.screenDimension);
                }
                let backgroundColor = node.backgroundColor;
                if (backgroundColor === '' && node.has('backgroundColor') && !node.documentParent.visible) {
                    backgroundColor = node.css('backgroundColor');
                }
                if (backgroundColor !== '') {
                    boxStyle.backgroundColor = ((_a = parseColor(backgroundColor)) === null || _a === void 0 ? void 0 : _a.valueAsRGBA) || '';
                }
                node.data(ResourceUI.KEY_NAME, 'boxStyle', boxStyle);
            }
        }
        setFontStyle(node) {
            if ((node.textElement || node.inlineText) && (!node.textEmpty || node.visibleStyle.background || node.pseudoElement) || node.inputElement) {
                const color = parseColor(node.css('color'));
                let fontWeight = node.css('fontWeight');
                if (!isNumber$1(fontWeight)) {
                    switch (fontWeight) {
                        case 'lighter':
                            fontWeight = '200';
                            break;
                        case 'bold':
                            fontWeight = '700';
                            break;
                        case 'bolder':
                            fontWeight = '900';
                            break;
                        default:
                            fontWeight = '400';
                            break;
                    }
                }
                node.data(ResourceUI.KEY_NAME, 'fontStyle', {
                    fontFamily: node.css('fontFamily').trim(),
                    fontStyle: node.css('fontStyle'),
                    fontSize: node.fontSize,
                    fontWeight,
                    color: (color === null || color === void 0 ? void 0 : color.valueAsRGBA) || ''
                });
            }
        }
        setValueString(node) {
            const element = node.element;
            if (element) {
                let key = '';
                let value = '';
                let hint = '';
                let trimming = true;
                let inlined = false;
                switch (element.tagName) {
                    case 'INPUT':
                        value = element.value;
                        switch (element.type) {
                            case 'radio':
                            case 'checkbox': {
                                const companion = node.companion;
                                if ((companion === null || companion === void 0 ? void 0 : companion.visible) === false) {
                                    value = companion.textContent.trim();
                                }
                                break;
                            }
                            case 'submit':
                                if (value === '' && !node.visibleStyle.backgroundImage) {
                                    value = 'Submit';
                                }
                                break;
                            case 'reset':
                                if (value === '' && !node.visibleStyle.backgroundImage) {
                                    value = 'Reset';
                                }
                                break;
                            case 'time':
                                if (value === '') {
                                    hint = '--:-- --';
                                }
                                break;
                            case 'date':
                            case 'datetime-local':
                                if (value === '') {
                                    switch ((new Intl.DateTimeFormat()).resolvedOptions().locale) {
                                        case 'en-US':
                                            hint = 'mm/dd/yyyy';
                                            break;
                                        default:
                                            hint = 'dd/mm/yyyy';
                                            break;
                                    }
                                    if (element.type === 'datetime-local') {
                                        hint += ' --:-- --';
                                    }
                                }
                                break;
                            case 'week':
                                if (value === '') {
                                    hint = 'Week: --, ----';
                                }
                                break;
                            case 'month':
                                if (value === '') {
                                    hint = '--------- ----';
                                }
                                break;
                            case 'text':
                            case 'password':
                            case 'url':
                            case 'email':
                            case 'search':
                            case 'number':
                            case 'tel':
                                if (value === '') {
                                    hint = element.placeholder;
                                }
                                break;
                            case 'file':
                                value = isUserAgent$2(8 /* FIREFOX */) ? 'Browse...' : 'Choose File';
                                break;
                            case 'color': {
                                const borderColor = this.controllerSettings.style.inputColorBorderColor;
                                const backgroundColor = (parseColor(value) || parseColor('rgb(0, 0, 0)')).valueAsRGBA;
                                const { width, height } = node.actualDimension;
                                const backgroundSize = `${width - 10}px ${height - 10}px, ${width - 8}px ${height - 8}px`;
                                const backgroundRepeat = 'no-repeat, no-repeat';
                                const backgroundPositionX = 'center, center';
                                const backgroundPositionY = 'center, center';
                                const backgroundImage = ResourceUI.parseBackgroundImage(node, `linear-gradient(${backgroundColor}, ${backgroundColor}), linear-gradient(${borderColor}, ${borderColor})`);
                                value = '';
                                let boxStyle = node.data(ResourceUI.KEY_NAME, 'boxStyle');
                                if (boxStyle) {
                                    const backgroundImageA = boxStyle.backgroundImage;
                                    if (backgroundImageA) {
                                        boxStyle.backgroundSize = backgroundSize + ', ' + boxStyle.backgroundSize;
                                        boxStyle.backgroundRepeat = backgroundRepeat + ', ' + boxStyle.backgroundRepeat;
                                        boxStyle.backgroundPositionX = backgroundPositionX + ', ' + boxStyle.backgroundPositionX;
                                        boxStyle.backgroundPositionY = backgroundPositionY + ', ' + boxStyle.backgroundPositionY;
                                        backgroundImageA.unshift(...backgroundImage);
                                        break;
                                    }
                                }
                                else {
                                    boxStyle = {};
                                }
                                node.data(ResourceUI.KEY_NAME, 'boxStyle', Object.assign(boxStyle, {
                                    backgroundSize,
                                    backgroundRepeat,
                                    backgroundPositionX,
                                    backgroundPositionY,
                                    backgroundImage
                                }));
                                break;
                            }
                            case 'range':
                                hint = value;
                                value = '';
                                break;
                        }
                        break;
                    case 'TEXTAREA':
                        value = element.value;
                        break;
                    case 'IFRAME':
                        value = element.src;
                        break;
                    default: {
                        const textContent = node.textContent;
                        if (node.plainText || node.pseudoElement) {
                            key = textContent.trim();
                            [value, inlined, trimming] = replaceWhiteSpace(node, replaceAmpersand(textContent));
                            inlined = true;
                        }
                        else if (node.inlineText) {
                            key = textContent.trim();
                            [value, inlined, trimming] = replaceWhiteSpace(node, node.hasAlign(1024 /* INLINE */) ? replaceAmpersand(textContent) : this.removeExcludedFromText(node, element));
                        }
                        else if (node.naturalChildren.length === 0 && (textContent === null || textContent === void 0 ? void 0 : textContent.trim()) === '' && !node.hasPX('height') && ResourceUI.isBackgroundVisible(node.data(ResourceUI.KEY_NAME, 'boxStyle'))) {
                            value = textContent;
                        }
                        break;
                    }
                }
                if (value !== '') {
                    if (trimming && node.pageFlow) {
                        const previousSibling = node.siblingsLeading[0];
                        let previousSpaceEnd = false;
                        if (value.length > 1) {
                            if (!previousSibling || previousSibling.multiline || previousSibling.lineBreak || previousSibling.plainText && CHAR$2.TRAILINGSPACE.test(previousSibling.textContent)) {
                                value = value.replace(CHAR$2.LEADINGSPACE, '');
                            }
                            else if (previousSibling.naturalElement) {
                                const textContent = previousSibling.textContent;
                                const length = textContent.length;
                                if (length) {
                                    previousSpaceEnd = textContent.charCodeAt(length - 1) === 32;
                                }
                            }
                        }
                        if (inlined) {
                            const trailingSpace = !node.lineBreakTrailing && CHAR$2.TRAILINGSPACE.test(value);
                            if (CHAR$2.LEADINGSPACE.test(value) && (previousSibling === null || previousSibling === void 0 ? void 0 : previousSibling.block) === false && !previousSibling.lineBreak && !previousSpaceEnd) {
                                value = STRING_SPACE + value.trim();
                            }
                            else {
                                value = value.trim();
                            }
                            if (trailingSpace) {
                                const nextSibling = node.siblingsTrailing.find(item => !item.excluded || item.lineBreak);
                                if ((nextSibling === null || nextSibling === void 0 ? void 0 : nextSibling.blockStatic) === false) {
                                    value += STRING_SPACE;
                                }
                            }
                        }
                        else if (value.trim() !== '') {
                            value = value.replace(CHAR$2.LEADINGSPACE, previousSibling && (previousSibling.block ||
                                previousSibling.lineBreak ||
                                previousSpaceEnd && previousSibling.htmlElement && previousSibling.textContent.length > 1 ||
                                node.multiline && ResourceUI.hasLineBreak(node)) ? '' : STRING_SPACE);
                            value = value.replace(CHAR$2.TRAILINGSPACE, node.display === 'table-cell' || node.lineBreakTrailing || node.blockStatic ? '' : STRING_SPACE);
                        }
                        else if (!node.inlineText) {
                            return;
                        }
                    }
                    if (value !== '') {
                        node.data(ResourceUI.KEY_NAME, 'valueString', { key, value });
                    }
                }
                if (hint !== '') {
                    node.data(ResourceUI.KEY_NAME, 'hintString', hint);
                }
            }
            else if (node.inlineText) {
                const value = node.textContent;
                if (value) {
                    node.data(ResourceUI.KEY_NAME, 'valueString', { key: value, value });
                }
            }
        }
        removeExcludedFromText(node, element) {
            const styled = element.children.length > 0 || element.tagName === 'CODE';
            const preserveWhitespace = node.preserveWhiteSpace;
            const attr = styled ? 'innerHTML' : 'textContent';
            let value = element[attr] || '';
            if (value.trim() === '') {
                return preserveWhitespace ? value : STRING_SPACE;
            }
            const sessionId = node.sessionId;
            element.childNodes.forEach((item, index) => {
                const child = getElementAsNode$2(item, sessionId);
                if (child === null || !child.textElement || !child.pageFlow || child.positioned || child.pseudoElement || child.excluded || child.dataset.target) {
                    if (child) {
                        if (styled && child.htmlElement) {
                            const outerHTML = child.toElementString('outerHTML');
                            if (child.lineBreak) {
                                value = value.replace(!preserveWhitespace ? new RegExp(`\\s*${outerHTML}\\s*`) : outerHTML, '\\n');
                            }
                            else if (child.positioned) {
                                value = value.replace(outerHTML, '');
                            }
                            else if (!preserveWhitespace) {
                                value = value.replace(outerHTML, child.pageFlow && child.textContent.trim() !== '' ? STRING_SPACE : '');
                            }
                            return;
                        }
                        else {
                            const textContent = child.plainText ? child.textContent : child[attr];
                            if (isString$5(textContent)) {
                                if (!preserveWhitespace) {
                                    value = value.replace(textContent, '');
                                }
                                return;
                            }
                        }
                    }
                    else if (item instanceof HTMLElement) {
                        const position = getComputedStyle(item).getPropertyValue('position');
                        value = value.replace(item.outerHTML, position !== 'absolute' && position !== 'fixed' && item.textContent.trim() !== '' ? STRING_SPACE : '');
                    }
                    if (index === 0) {
                        value = trimStart(value, ' ');
                    }
                    else if (index === length - 1) {
                        value = trimEnd(value, ' ');
                    }
                }
            });
            if (styled) {
                value = value
                    .replace(/^\\n\\n/, '\\n')
                    .replace(/\\n\\n$/, '\\n')
                    .replace(ESCAPE.ENTITY, (match, capture) => String.fromCharCode(parseInt(capture)));
            }
            return value;
        }
    }
    ResourceUI.STORED = {
        strings: new Map(),
        arrays: new Map(),
        fonts: new Map(),
        colors: new Map(),
        images: new Map()
    };

    class Accessibility extends ExtensionUI {
    }

    class Column extends ExtensionUI {
        is(node) {
            return (node.blockDimension && node.display !== 'table') && !node.layoutElement && node.length > 1;
        }
        condition(node) {
            return node.has('columnCount') || node.hasPX('columnWidth');
        }
        processNode(node, parent) {
            let items = [];
            const rows = [items];
            let maxSize = Number.POSITIVE_INFINITY;
            let multiline = false;
            node.each((item) => {
                var _a;
                if (item.css('columnSpan') === 'all') {
                    if (items.length) {
                        rows.push([item]);
                    }
                    else {
                        items.push(item);
                    }
                    items = [];
                    rows.push(items);
                }
                else {
                    if (item.textElement && ((_a = item.textBounds) === null || _a === void 0 ? void 0 : _a.overflow)) {
                        maxSize = NaN;
                    }
                    if (item.multiline) {
                        multiline = true;
                    }
                    else if (!isNaN(maxSize)) {
                        maxSize = Math.min(item.bounds.width, maxSize);
                    }
                    items.push(item);
                }
            });
            if (items.length === 0) {
                rows.pop();
            }
            const [borderLeftStyle, borderLeftWidth, borderLeftColor] = node.cssAsTuple('columnRuleStyle', 'columnRuleWidth', 'columnRuleColor');
            const boxWidth = node.box.width;
            const columnCount = node.toInt('columnCount');
            const columnWidth = node.parseWidth(node.css('columnWidth'));
            let columnGap = node.parseWidth(node.css('columnGap'));
            let columnSized;
            const getColumnSizing = () => isNaN(columnCount) && columnWidth > 0 ? boxWidth / (columnWidth + columnGap) : Number.POSITIVE_INFINITY;
            if (columnGap > 0) {
                columnSized = Math.floor(getColumnSizing());
            }
            else {
                columnGap = (columnWidth > 0 && !isNaN(maxSize) && maxSize !== Number.POSITIVE_INFINITY ? Math.max(maxSize - columnWidth, 0) : 0) + 16;
                columnSized = Math.ceil(getColumnSizing());
            }
            node.data(EXT_NAME.COLUMN, 'mainData', {
                rows,
                columnCount,
                columnWidth,
                columnGap,
                columnSized,
                columnRule: {
                    borderLeftStyle,
                    borderLeftWidth,
                    borderLeftColor
                },
                boxWidth: parent.actualBoxWidth(boxWidth),
                multiline
            });
            return undefined;
        }
    }

    const $lib$8 = squared.lib;
    const { formatPercent, formatPX: formatPX$4, isLength: isLength$4, isPercent: isPercent$3 } = $lib$8.css;
    const { CHAR: CHAR$3, CSS: CSS$2 } = $lib$8.regex;
    const { isNumber: isNumber$2, safeNestedArray: safeNestedArray$2, trimString: trimString$1, withinRange: withinRange$1 } = $lib$8.util;
    const CSS_GRID = EXT_NAME.CSS_GRID;
    const STRING_UNIT = '[\\d.]+[a-z%]+|auto|max-content|min-content';
    const STRING_MINMAX = 'minmax\\(\\s*([^,]+),\\s+([^)]+)\\s*\\)';
    const STRING_FIT_CONTENT = 'fit-content\\(\\s*([\\d.]+[a-z%]+)\\s*\\)';
    const STRING_NAMED = '\\[([\\w\\s\\-]+)\\]';
    const REGEX_UNIT = new RegExp(`^${STRING_UNIT}$`);
    const REGEX_NAMED = new RegExp(`\\s*(repeat\\(\\s*(auto-fit|auto-fill|\\d+),\\s+(.+)\\)|${STRING_NAMED}|${STRING_MINMAX}|${STRING_FIT_CONTENT}|${STRING_UNIT}\\s*)\\s*`, 'g');
    const REGEX_REPEAT = new RegExp(`\\s*(${STRING_NAMED}|${STRING_MINMAX}|${STRING_FIT_CONTENT}|${STRING_UNIT})\\s*`, 'g');
    const REGEX_CELL_UNIT = new RegExp(STRING_UNIT);
    const REGEX_CELL_MINMAX = new RegExp(STRING_MINMAX);
    const REGEX_CELL_FIT_CONTENT = new RegExp(STRING_FIT_CONTENT);
    const REGEX_CELL_NAMED = new RegExp(STRING_NAMED);
    const REGEX_STARTEND = /^([\w-]+)-(start|end)$/;
    function repeatUnit(data, sizes) {
        const repeat = data.repeat;
        const unitPX = [];
        const unitRepeat = [];
        const length = sizes.length;
        for (let i = 0; i < length; ++i) {
            if (repeat[i]) {
                unitRepeat.push(sizes[i]);
            }
            else {
                unitPX.push(sizes[i]);
            }
        }
        const q = data.length;
        const r = q - unitPX.length;
        const s = unitRepeat.length;
        const result = new Array(q);
        for (let i = 0; i < q; i++) {
            if (repeat[i]) {
                for (let j = 0, k = 0; j < r; ++i, ++j, ++k) {
                    if (k === s) {
                        k = 0;
                    }
                    result[i] = unitRepeat[k];
                }
                --i;
            }
            else {
                result[i] = unitPX.shift();
            }
        }
        return result;
    }
    function setAutoFill(data, dimension) {
        const unit = data.unit;
        if (unit.length === 1 && (data.autoFill || data.autoFit)) {
            const unitMin = data.unitMin;
            let sizeMin = 0;
            [unit[0], unitMin[0]].forEach(value => {
                if (isPercent$3(value)) {
                    sizeMin = Math.max(parseFloat(value) / 100 * dimension, sizeMin);
                }
                else if (isLength$4(value)) {
                    sizeMin = Math.max(parseFloat(value), sizeMin);
                }
            });
            if (sizeMin > 0) {
                data.length = Math.floor(dimension / (sizeMin + data.gap));
                data.unit = repeatUnit(data, unit);
                data.unitMin = repeatUnit(data, unitMin);
                return true;
            }
        }
        return false;
    }
    function setFlexibleDimension(dimension, gap, count, unit, max) {
        let filled = 0;
        let fractional = 0;
        let percent = 1;
        const length = unit.length;
        let i = 0;
        while (i < length) {
            const value = unit[i++];
            if (CSS$2.PX.test(value)) {
                filled += parseFloat(value);
            }
            else if (CssGrid.isFr(value)) {
                fractional += parseFloat(value);
            }
            else if (isPercent$3(value)) {
                percent -= parseFloat(value) / 100;
            }
        }
        if (percent < 1 && fractional > 0) {
            const ratio = (((dimension * percent) - ((count - 1) * gap) - max.reduce((a, b) => a + Math.max(0, b), 0) - filled) / fractional);
            if (ratio > 0) {
                for (i = 0; i < length; ++i) {
                    const value = unit[i];
                    if (CssGrid.isFr(value)) {
                        unit[i] = formatPX$4(parseFloat(value) * ratio);
                    }
                }
            }
        }
    }
    function fillUnitEqually(unit, length) {
        if (unit.length === 0) {
            let i = 0;
            while (i < length) {
                unit[i++] = '1fr';
            }
        }
    }
    function getOpenCellIndex(iteration, length, available) {
        if (available) {
            for (let i = 0, j = -1, k = 0; i < iteration; ++i) {
                if (available[i] === 0) {
                    if (j === -1) {
                        j = i;
                    }
                    if (++k === length) {
                        return j;
                    }
                }
                else {
                    j = -1;
                }
            }
            return -1;
        }
        return 0;
    }
    function getOpenRowIndex(cells) {
        const length = cells.length;
        for (let i = 0; i < length; ++i) {
            const cell = cells[i];
            for (const value of cell) {
                if (value === 0) {
                    return i;
                }
            }
        }
        return Math.max(0, length - 1);
    }
    const convertLength = (node, value, index) => isLength$4(value) ? formatPX$4(node.parseUnit(value, index !== 0 ? 'width' : 'height')) : value;
    class CssGrid extends ExtensionUI {
        static createDataAttribute(data) {
            const autoFlow = data.gridAutoFlow;
            return Object.assign(data, {
                children: [],
                rowData: [],
                rowSpanMultiple: [],
                rowDirection: !autoFlow.includes('column'),
                dense: autoFlow.includes('dense'),
                templateAreas: {},
                row: CssGrid.createDataRowAttribute(),
                column: CssGrid.createDataRowAttribute(),
                emptyRows: [],
                minCellHeight: 0
            });
        }
        static createDataRowAttribute() {
            return {
                length: 0,
                gap: 0,
                unit: [],
                unitMin: [],
                unitTotal: [],
                repeat: [],
                auto: [],
                autoFill: false,
                autoFit: false,
                name: {},
                fixedWidth: false,
                flexible: false,
                frTotal: 0
            };
        }
        is(node) {
            return node.gridElement;
        }
        condition(node) {
            return node.length > 0;
        }
        processNode(node) {
            const mainData = CssGrid.createDataAttribute(node.cssAsObject('alignItems', 'alignContent', 'justifyItems', 'justifyContent', 'gridAutoFlow'));
            const { column, dense, row, rowDirection: horizontal } = mainData;
            const [rowA, colA, rowB, colB] = horizontal ? [0, 1, 2, 3] : [1, 0, 3, 2];
            const rowData = [];
            const openCells = [];
            const layout = [];
            const setDataRows = (item, placement, length) => {
                if (placement.every(value => value > 0)) {
                    for (let i = placement[rowA] - 1; i < placement[rowB] - 1; ++i) {
                        const data = safeNestedArray$2(rowData, i);
                        let cell = openCells[i];
                        let j = placement[colA] - 1;
                        if (!cell) {
                            cell = new Array(length).fill(0);
                            if (!dense) {
                                let k = 0;
                                while (k < j) {
                                    cell[k++] = 1;
                                }
                            }
                            openCells[i] = cell;
                        }
                        while (j < placement[colB] - 1) {
                            safeNestedArray$2(data, j).push(item);
                            cell[j++] = 1;
                        }
                    }
                    return true;
                }
                return false;
            };
            column.gap = node.parseWidth(node.css('columnGap'), false);
            row.gap = node.parseHeight(node.css('rowGap'), false);
            [node.cssInitial('gridTemplateRows', true), node.cssInitial('gridTemplateColumns', true), node.css('gridAutoRows'), node.css('gridAutoColumns')].forEach((value, index) => {
                if (value !== '' && value !== 'none' && value !== 'auto') {
                    const data = index === 0 ? row : column;
                    const { name, repeat, unit, unitMin } = data;
                    let i = 1;
                    REGEX_NAMED.lastIndex = 0;
                    let match;
                    while ((match = REGEX_NAMED.exec(value)) !== null) {
                        const command = match[1].trim();
                        switch (index) {
                            case 0:
                            case 1:
                                if (command.startsWith('[')) {
                                    match[4].split(CHAR$3.SPACE).forEach(attr => safeNestedArray$2(name, attr).push(i));
                                }
                                else if (command.startsWith('repeat')) {
                                    let iterations = 1;
                                    switch (match[2]) {
                                        case 'auto-fit':
                                            data.autoFit = true;
                                            break;
                                        case 'auto-fill':
                                            data.autoFill = true;
                                            break;
                                        default:
                                            iterations = parseInt(match[2]) || 1;
                                            break;
                                    }
                                    if (iterations > 0) {
                                        const repeating = [];
                                        REGEX_REPEAT.lastIndex = 0;
                                        let subMatch;
                                        while ((subMatch = REGEX_REPEAT.exec(match[3])) !== null) {
                                            const subPattern = subMatch[1];
                                            let namedMatch;
                                            if ((namedMatch = REGEX_CELL_NAMED.exec(subPattern)) !== null) {
                                                const subName = namedMatch[1];
                                                if (!name[subName]) {
                                                    name[subName] = [];
                                                }
                                                repeating.push({ name: subName });
                                            }
                                            else if ((namedMatch = REGEX_CELL_MINMAX.exec(subPattern)) !== null) {
                                                repeating.push({ unit: convertLength(node, namedMatch[2], index), unitMin: convertLength(node, namedMatch[1], index) });
                                            }
                                            else if ((namedMatch = REGEX_CELL_FIT_CONTENT.exec(subPattern)) !== null) {
                                                repeating.push({ unit: convertLength(node, namedMatch[1], index), unitMin: '0px' });
                                            }
                                            else if ((namedMatch = REGEX_CELL_UNIT.exec(subPattern)) !== null) {
                                                repeating.push({ unit: convertLength(node, namedMatch[0], index) });
                                            }
                                        }
                                        if (repeating.length) {
                                            for (let j = 0; j < iterations; ++j) {
                                                repeating.forEach(item => {
                                                    const { name: nameA, unit: unitA } = item;
                                                    if (nameA) {
                                                        name[nameA].push(i);
                                                    }
                                                    else if (unitA) {
                                                        unit.push(unitA);
                                                        unitMin.push(item.unitMin || '');
                                                        repeat.push(true);
                                                        ++i;
                                                    }
                                                });
                                            }
                                        }
                                    }
                                }
                                else if (command.startsWith('minmax')) {
                                    unit.push(convertLength(node, match[6], index));
                                    unitMin.push(convertLength(node, match[5], index));
                                    repeat.push(false);
                                    ++i;
                                }
                                else if (command.startsWith('fit-content')) {
                                    unit.push(convertLength(node, match[7], index));
                                    unitMin.push('0px');
                                    repeat.push(false);
                                    ++i;
                                }
                                else if (REGEX_UNIT.test(command)) {
                                    unit.push(convertLength(node, command, index));
                                    unitMin.push('');
                                    repeat.push(false);
                                    ++i;
                                }
                                break;
                            case 2:
                            case 3:
                                (index === 2 ? row : column).auto.push(isLength$4(command) ? formatPX$4(node.parseUnit(command, index !== 2 ? 'width' : 'height')) : command);
                                break;
                        }
                    }
                }
            });
            if (horizontal) {
                node.sort((a, b) => {
                    const { left, top } = a.linear;
                    const { left: leftB, top: topB } = b.linear;
                    if (!withinRange$1(top, topB)) {
                        return top < topB ? -1 : 1;
                    }
                    else if (!withinRange$1(left, leftB)) {
                        return left < leftB ? -1 : 1;
                    }
                    return 0;
                });
            }
            else {
                node.sort((a, b) => {
                    const { left, top } = a.linear;
                    const { left: leftB, top: topB } = b.linear;
                    if (!withinRange$1(left, leftB)) {
                        return left < leftB ? -1 : 1;
                    }
                    else if (!withinRange$1(top, topB)) {
                        return top < topB ? -1 : 1;
                    }
                    return 0;
                });
            }
            let autoWidth = false;
            let autoHeight = false;
            if (!node.has('gridTemplateAreas') && node.every(item => item.css('gridRowStart') === 'auto' && item.css('gridColumnStart') === 'auto')) {
                const [directionA, directionB, indexA, indexB, indexC] = horizontal ? ['top', 'bottom', 2, 1, 3] : ['left', 'right', 3, 0, 2];
                let rowIndex = 0;
                let columnIndex = 0;
                let columnMax = 0;
                let previous;
                if (horizontal) {
                    if (column.autoFill) {
                        autoWidth = setAutoFill(column, node.actualWidth);
                    }
                }
                else if (row.autoFill) {
                    autoHeight = setAutoFill(row, node.actualHeight);
                }
                node.each((item, index) => {
                    if (!previous || item.linear[directionA] >= previous.linear[directionB] || columnIndex > 0 && columnIndex === columnMax) {
                        columnMax = Math.max(columnIndex, columnMax);
                        rowIndex++;
                        columnIndex = 1;
                    }
                    const { gridRowEnd, gridColumnEnd } = item.cssAsObject('gridRowEnd', 'gridColumnEnd');
                    let rowSpan = 1;
                    let columnSpan = 1;
                    if (gridRowEnd.startsWith('span')) {
                        rowSpan = parseInt(gridRowEnd.split(' ')[1]);
                    }
                    else if (isNumber$2(gridRowEnd)) {
                        rowSpan = parseInt(gridRowEnd) - rowIndex;
                    }
                    if (gridColumnEnd.startsWith('span')) {
                        columnSpan = parseInt(gridColumnEnd.split(' ')[1]);
                    }
                    else if (isNumber$2(gridColumnEnd)) {
                        columnSpan = parseInt(gridColumnEnd) - columnIndex;
                    }
                    if (columnIndex === 1 && columnMax > 0) {
                        let valid = false;
                        do {
                            const available = new Array(columnMax - 1).fill(1);
                            layout.forEach(cell => {
                                const placement = cell.placement;
                                if (placement[indexA] > rowIndex) {
                                    for (let i = placement[indexB]; i < placement[indexC]; ++i) {
                                        available[i - 1] = 0;
                                    }
                                }
                            });
                            const length = available.length;
                            for (let i = 0, j = 0, k = 0; i < length; ++i) {
                                if (available[i]) {
                                    if (j === 0) {
                                        k = i;
                                    }
                                    if (++j === columnSpan) {
                                        columnIndex = k + 1;
                                        valid = true;
                                        break;
                                    }
                                }
                                else {
                                    j = 0;
                                }
                            }
                            if (!valid) {
                                mainData.emptyRows[rowIndex - 1] = available;
                                rowIndex++;
                            }
                        } while (!valid);
                    }
                    if (horizontal) {
                        layout[index] = {
                            outerCoord: item.linear.top,
                            placement: [rowIndex, columnIndex, rowIndex + rowSpan, columnIndex + columnSpan],
                            rowSpan,
                            columnSpan
                        };
                    }
                    else {
                        layout[index] = {
                            outerCoord: item.linear.left,
                            placement: [columnIndex, rowIndex, columnIndex + columnSpan, rowIndex + rowSpan],
                            rowSpan,
                            columnSpan
                        };
                    }
                    columnIndex += columnSpan;
                    previous = item;
                });
            }
            else {
                const templateAreas = mainData.templateAreas;
                let previousPlacement;
                autoWidth = setAutoFill(column, node.actualWidth);
                autoHeight = setAutoFill(row, node.actualHeight);
                node.css('gridTemplateAreas').split(/"[\s\n]+"/).forEach((template, i) => {
                    if (template !== 'none') {
                        trimString$1(template.trim(), '"').split(CHAR$3.SPACE).forEach((area, j) => {
                            if (area.charAt(0) !== '.') {
                                const templateArea = templateAreas[area];
                                if (templateArea) {
                                    templateArea.rowSpan = (i - templateArea.rowStart) + 1;
                                    templateArea.columnSpan = (j - templateArea.columnStart) + 1;
                                }
                                else {
                                    templateAreas[area] = {
                                        rowStart: i,
                                        rowSpan: 1,
                                        columnStart: j,
                                        columnSpan: 1
                                    };
                                }
                            }
                        });
                    }
                });
                node.each((item, index) => {
                    const positions = item.cssAsTuple('gridRowStart', 'gridColumnStart', 'gridRowEnd', 'gridColumnEnd');
                    const placement = [0, 0, 0, 0];
                    let rowSpan = -1;
                    let columnSpan = -1;
                    if (Object.keys(templateAreas).length) {
                        for (let i = 0; i < 4; ++i) {
                            const name = positions[i];
                            let template = templateAreas[name];
                            if (template) {
                                switch (i) {
                                    case 0:
                                        placement[0] = template.rowStart + 1;
                                        break;
                                    case 1:
                                        placement[1] = template.columnStart + 1;
                                        break;
                                    case 2:
                                        placement[2] = template.rowStart + template.rowSpan + 1;
                                        break;
                                    case 3:
                                        placement[3] = template.columnStart + template.columnSpan + 1;
                                        break;
                                }
                            }
                            else {
                                const match = REGEX_STARTEND.exec(name);
                                if (match) {
                                    template = templateAreas[match[1]];
                                    if (template) {
                                        if (match[2] === 'start') {
                                            switch (i) {
                                                case 0:
                                                case 2:
                                                    placement[i] = template.rowStart + 1;
                                                    break;
                                                case 1:
                                                case 3:
                                                    placement[i] = template.columnStart + 1;
                                                    break;
                                            }
                                        }
                                        else {
                                            switch (i) {
                                                case 0:
                                                case 2:
                                                    placement[i] = template.rowStart + template.rowSpan + 1;
                                                    break;
                                                case 1:
                                                case 3:
                                                    placement[i] = template.columnStart + template.columnSpan + 1;
                                                    break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (placement[0] === 0 || placement[1] === 0 || placement[2] === 0 || placement[3] === 0) {
                        const setPlacement = (value, position, vertical, length) => {
                            if (isNumber$2(value)) {
                                const cellIndex = parseInt(value);
                                if (cellIndex > 0) {
                                    placement[position] = cellIndex;
                                    return true;
                                }
                                else if (cellIndex < 0 && position >= 2) {
                                    const positionA = position - 2;
                                    placement[placement[positionA] > 0 ? position : positionA] = cellIndex + length + 2;
                                    return true;
                                }
                            }
                            else if (value.startsWith('span')) {
                                const span = parseInt(value.split(' ')[1]);
                                if (span === length && previousPlacement) {
                                    if (horizontal) {
                                        if (!vertical) {
                                            const end = previousPlacement[2];
                                            if (end > 0 && placement[0] === 0) {
                                                placement[0] = end;
                                            }
                                        }
                                    }
                                    else {
                                        if (vertical) {
                                            const end = previousPlacement[3];
                                            if (end > 0 && placement[1] === 0) {
                                                placement[1] = end;
                                            }
                                        }
                                    }
                                }
                                const start = placement[position - 2];
                                switch (position) {
                                    case 0: {
                                        const rowIndex = positions[2];
                                        if (isNumber$2(rowIndex)) {
                                            const pos = parseInt(rowIndex);
                                            placement[0] = pos - span;
                                            placement[2] = pos;
                                        }
                                        break;
                                    }
                                    case 1: {
                                        const colIndex = positions[3];
                                        if (isNumber$2(colIndex)) {
                                            const pos = parseInt(colIndex);
                                            placement[1] = pos - span;
                                            placement[3] = pos;
                                        }
                                        break;
                                    }
                                    case 2:
                                    case 3:
                                        if (start > 0) {
                                            placement[position] = start + span;
                                        }
                                        break;
                                }
                                if (vertical) {
                                    if (rowSpan === -1) {
                                        rowSpan = span;
                                    }
                                }
                                else {
                                    if (columnSpan === -1) {
                                        columnSpan = span;
                                    }
                                }
                                return true;
                            }
                            return false;
                        };
                        let rowStart;
                        let colStart;
                        for (let i = 0; i < 4; ++i) {
                            const value = positions[i];
                            if (value !== 'auto' && placement[i] === 0) {
                                const vertical = i % 2 === 0;
                                const data = vertical ? row : column;
                                if (!setPlacement(value, i, vertical, Math.max(1, data.unit.length))) {
                                    const alias = value.split(' ');
                                    if (alias.length === 1) {
                                        alias[1] = alias[0];
                                        alias[0] = '1';
                                    }
                                    else if (isNumber$2(alias[0])) {
                                        if (vertical) {
                                            if (rowStart) {
                                                rowSpan = parseInt(alias[0]) - parseInt(rowStart[0]);
                                            }
                                            else {
                                                rowStart = alias;
                                            }
                                        }
                                        else if (colStart) {
                                            columnSpan = parseInt(alias[0]) - parseInt(colStart[0]);
                                        }
                                        else {
                                            colStart = alias;
                                        }
                                    }
                                    const named = data.name[alias[1]];
                                    if (named) {
                                        const nameIndex = parseInt(alias[0]);
                                        if (nameIndex <= named.length) {
                                            placement[i] = named[nameIndex - 1] + (alias[1] === positions[i - 2] ? 1 : 0);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (!previousPlacement) {
                        if (placement[0] === 0) {
                            placement[0] = 1;
                        }
                        if (placement[1] === 0) {
                            placement[1] = 1;
                        }
                    }
                    const [a, b, c, d] = placement;
                    if (rowSpan === -1) {
                        rowSpan = a > 0 && c > 0 ? c - a : 1;
                    }
                    else if (a > 0 && c === 0) {
                        placement[2] = a + rowSpan;
                    }
                    if (columnSpan === -1) {
                        columnSpan = b > 0 && d > 0 ? d - b : 1;
                    }
                    else if (b > 0 && d === 0) {
                        placement[3] = a + columnSpan;
                    }
                    if (placement[2] === 0 && placement[0] > 0) {
                        placement[2] = placement[0] + rowSpan;
                    }
                    if (placement[3] === 0 && placement[1] > 0) {
                        placement[3] = placement[1] + columnSpan;
                    }
                    layout[index] = {
                        outerCoord: horizontal ? item.bounds.top : item.bounds.left,
                        placement,
                        rowSpan,
                        columnSpan
                    };
                    previousPlacement = placement;
                });
            }
            let ITERATION;
            {
                const [data, outerCoord] = horizontal ? [column, node.box.top] : [row, node.box.left];
                let unit = data.unit;
                let length = 1;
                let outerCount = 0;
                layout.forEach(item => {
                    if (item) {
                        const [totalSpan, start, end] = horizontal ? [item.columnSpan, 1, 3] : [item.rowSpan, 0, 2];
                        const placement = item.placement;
                        if (placement.some(value => value > 0)) {
                            length = Math.max(length, totalSpan, placement[start], placement[end] - 1);
                        }
                        if (withinRange$1(item.outerCoord, outerCoord)) {
                            outerCount += totalSpan;
                        }
                    }
                });
                let q = unit.length;
                ITERATION = Math.max(length, outerCount, horizontal && !autoWidth || !horizontal && !autoHeight ? q : 0);
                data.length = ITERATION;
                if (q < ITERATION) {
                    if (data.autoFill || data.autoFit) {
                        if (q === 0) {
                            unit.push('auto');
                            data.unitMin.push('');
                            data.repeat.push(true);
                        }
                        unit = repeatUnit(data, unit);
                        data.unit = unit;
                        data.unitMin = repeatUnit(data, data.unitMin);
                    }
                    else {
                        const auto = data.auto;
                        const r = auto.length;
                        if (r) {
                            let i = 0;
                            while (unit.length < ITERATION) {
                                if (i === r) {
                                    i = 0;
                                }
                                unit.push(auto[i++]);
                            }
                        }
                    }
                }
                else if (data.autoFit || data.autoFill && node.blockStatic && (horizontal && !node.hasWidth && !node.hasPX('maxWidth', false) || !horizontal && !node.hasHeight)) {
                    unit.length = ITERATION;
                }
                let percent = 1;
                let fr = 0;
                let auto = 0;
                unit.forEach(value => {
                    if (isPercent$3(value)) {
                        percent -= parseFloat(value) / 100;
                    }
                    else if (CssGrid.isFr(value)) {
                        fr += parseFloat(value);
                    }
                    else if (value === 'auto') {
                        auto++;
                    }
                });
                data.flexible = percent < 1 || fr > 0;
                if (percent < 1) {
                    if (fr > 0) {
                        q = unit.length;
                        for (let i = 0; i < q; ++i) {
                            const value = unit[i];
                            if (CssGrid.isFr(value)) {
                                unit[i] = percent * (parseFloat(value) / fr) + 'fr';
                            }
                        }
                    }
                    else if (auto === 1) {
                        const index = unit.findIndex(value => value === 'auto');
                        if (index !== -1) {
                            unit[index] = formatPercent(percent);
                        }
                    }
                }
            }
            node.each((item, index) => {
                const { placement, rowSpan, columnSpan } = layout[index];
                const [ROW_SPAN, COLUMN_SPAN] = horizontal ? [rowSpan, columnSpan] : [columnSpan, rowSpan];
                while (placement[0] === 0 || placement[1] === 0) {
                    const PLACEMENT = placement.slice(0);
                    if (PLACEMENT[rowA] === 0) {
                        let length = rowData.length;
                        for (let i = (dense ? 0 : getOpenRowIndex(openCells)), j = 0, k = -1; i < length; ++i) {
                            const l = getOpenCellIndex(ITERATION, COLUMN_SPAN, openCells[i]);
                            if (l !== -1) {
                                if (j === 0) {
                                    k = i;
                                    length = Math.max(length, i + ROW_SPAN);
                                }
                                if (++j === ROW_SPAN) {
                                    PLACEMENT[rowA] = k + 1;
                                    break;
                                }
                            }
                            else {
                                j = 0;
                                k = -1;
                                length = rowData.length;
                            }
                        }
                    }
                    if (PLACEMENT[rowA] === 0) {
                        placement[rowA] = rowData.length + 1;
                        if (placement[colA] === 0) {
                            placement[colA] = 1;
                        }
                    }
                    else if (PLACEMENT[colA] === 0) {
                        if (PLACEMENT[rowB] === 0) {
                            PLACEMENT[rowB] = PLACEMENT[rowA] + ROW_SPAN;
                        }
                        const available = [];
                        const l = PLACEMENT[rowA] - 1;
                        const m = PLACEMENT[rowB] - 1;
                        let i = l;
                        while (i < m) {
                            const data = rowData[i++];
                            if (!data) {
                                available.push([[0, -1]]);
                            }
                            else if (data.reduce((a, b) => a + (b ? 1 : 0), 0) + COLUMN_SPAN <= ITERATION) {
                                const range = [];
                                let span = 0;
                                for (let j = 0, k = -1; j < ITERATION; ++j) {
                                    const rowItem = data[j];
                                    if (!rowItem) {
                                        if (k === -1) {
                                            k = j;
                                        }
                                        span++;
                                    }
                                    if (rowItem || j === ITERATION - 1) {
                                        if (span >= COLUMN_SPAN) {
                                            range.push([k, k + span]);
                                        }
                                        k = -1;
                                        span = 0;
                                    }
                                }
                                if (range.length) {
                                    available.push(range);
                                }
                                else {
                                    break;
                                }
                            }
                            else {
                                break;
                            }
                        }
                        const length = available.length;
                        if (length) {
                            const data = available[0];
                            if (data[0][1] === -1) {
                                PLACEMENT[colA] = 1;
                            }
                            else if (length === m - l) {
                                if (length > 1) {
                                    found: {
                                        for (const outside of data) {
                                            for (i = outside[0]; i < outside[1]; ++i) {
                                                let j = 1;
                                                while (j < length) {
                                                    const avail = available[j++];
                                                    const q = avail.length;
                                                    let k = 0;
                                                    while (k < q) {
                                                        const inside = avail[k++];
                                                        if (i >= inside[0] && (inside[1] === -1 || i + COLUMN_SPAN <= inside[1])) {
                                                            PLACEMENT[colA] = i + 1;
                                                            break found;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                else {
                                    PLACEMENT[colA] = data[0][0] + 1;
                                }
                            }
                        }
                    }
                    const indexA = PLACEMENT[rowA];
                    if (indexA > 0) {
                        const positionA = PLACEMENT[colA];
                        if (positionA > 0) {
                            placement[rowA] = indexA;
                            placement[colA] = positionA;
                        }
                    }
                }
                if (placement[rowB] === 0) {
                    placement[rowB] = placement[rowA] + ROW_SPAN;
                }
                if (placement[colB] === 0) {
                    placement[colB] = placement[colA] + COLUMN_SPAN;
                }
                if (setDataRows(item, placement, ITERATION)) {
                    const [a, b, c, d] = placement;
                    const rowStart = a - 1;
                    const rowCount = c - a;
                    const columnStart = b - 1;
                    if (!dense) {
                        const cellIndex = horizontal ? rowStart : columnStart;
                        if (cellIndex > 0) {
                            const cells = openCells[cellIndex - 1];
                            let i = 0;
                            while (i < ITERATION) {
                                cells[i++] = 1;
                            }
                        }
                    }
                    if (rowCount > 1) {
                        const rowSpanMultiple = mainData.rowSpanMultiple;
                        const length = rowStart + rowCount;
                        let i = rowStart;
                        while (i < length) {
                            rowSpanMultiple[i++] = true;
                        }
                    }
                    item.data(CSS_GRID, 'cellData', {
                        rowStart,
                        rowSpan: rowCount,
                        columnStart,
                        columnSpan: d - b
                    });
                }
            });
            if (rowData.length) {
                let rowMain;
                if (horizontal) {
                    rowMain = rowData;
                    mainData.rowData = rowData;
                }
                else {
                    rowMain = mainData.rowData;
                    const length = rowData.length;
                    for (let i = 0; i < length; ++i) {
                        const data = rowData[i];
                        const q = data.length;
                        let j = 0;
                        while (j < q) {
                            safeNestedArray$2(rowMain, j)[i] = data[j++];
                        }
                    }
                }
                const unitTotal = horizontal ? row.unitTotal : column.unitTotal;
                const children = mainData.children;
                const columnCount = column.unit.length;
                rowMain.forEach(data => {
                    const length = data.length;
                    let i = 0;
                    while (i < length) {
                        const columnItem = data[i];
                        let count = unitTotal[i] || 0;
                        if (columnItem) {
                            let maxDimension = 0;
                            columnItem.forEach(item => {
                                if (!children.includes(item)) {
                                    maxDimension = Math.max(maxDimension, horizontal ? item.bounds.height : item.bounds.width);
                                    children.push(item);
                                }
                            });
                            count += maxDimension;
                        }
                        unitTotal[i++] = count;
                    }
                });
                if (children.length === node.length) {
                    const { gap: rowGap, unit: rowUnit } = row;
                    const { gap: columnGap, unit: columnUnit } = column;
                    const rowCount = Math.max(rowUnit.length, rowMain.length);
                    const rowMax = new Array(rowCount).fill(0);
                    const columnMax = new Array(columnCount).fill(0);
                    const modified = new Set();
                    row.length = rowCount;
                    column.length = columnCount;
                    let minCellHeight = 0;
                    for (let i = 0; i < rowCount; ++i) {
                        const rowItem = rowMain[i];
                        const unitHeight = rowUnit[i];
                        if (rowItem) {
                            for (let j = 0; j < columnCount; ++j) {
                                const columnItem = rowItem[j];
                                if (columnItem) {
                                    columnItem.forEach((item) => {
                                        if (!modified.has(item)) {
                                            const { columnSpan, rowSpan } = item.data(CSS_GRID, 'cellData');
                                            const x = j + columnSpan - 1;
                                            const y = i + rowSpan - 1;
                                            if (columnGap > 0 && x < columnCount - 1) {
                                                item.modifyBox(4 /* MARGIN_RIGHT */, columnGap);
                                            }
                                            if (rowGap > 0 && y < rowCount - 1) {
                                                item.modifyBox(8 /* MARGIN_BOTTOM */, rowGap);
                                            }
                                            if (rowSpan === 1) {
                                                const boundsHeight = item.bounds.height;
                                                const columnHeight = rowMax[i];
                                                if (item.hasHeight) {
                                                    if (columnHeight < 0) {
                                                        if (boundsHeight > Math.abs(columnHeight)) {
                                                            rowMax[i] = boundsHeight;
                                                        }
                                                    }
                                                    else {
                                                        rowMax[i] = Math.max(boundsHeight, columnHeight);
                                                    }
                                                }
                                                else if (boundsHeight > Math.abs(columnHeight)) {
                                                    rowMax[i] = -boundsHeight;
                                                }
                                                minCellHeight = Math.max(boundsHeight, minCellHeight);
                                            }
                                            if (columnSpan === 1) {
                                                const boundsWidth = item.bounds.width;
                                                const columnWidth = columnMax[j];
                                                if (item.hasWidth) {
                                                    if (columnWidth < 0) {
                                                        if (boundsWidth > Math.abs(columnWidth)) {
                                                            columnMax[j] = boundsWidth;
                                                        }
                                                    }
                                                    else {
                                                        columnMax[j] = Math.max(boundsWidth, columnWidth);
                                                    }
                                                }
                                                else if (boundsWidth > Math.abs(columnWidth)) {
                                                    columnMax[j] = -boundsWidth;
                                                }
                                            }
                                            modified.add(item);
                                        }
                                    });
                                }
                                else if (!horizontal) {
                                    mainData.emptyRows[j] = [Number.POSITIVE_INFINITY];
                                }
                            }
                        }
                        else {
                            rowMax[i] = parseFloat(unitHeight) || 0;
                            if (horizontal) {
                                mainData.emptyRows[i] = [Number.POSITIVE_INFINITY];
                            }
                        }
                    }
                    mainData.minCellHeight = minCellHeight;
                    if (horizontal) {
                        if (node.hasPX('width', false)) {
                            column.fixedWidth = true;
                            column.flexible = false;
                            setFlexibleDimension(node.actualWidth, columnGap, columnCount, columnUnit, columnMax);
                        }
                        if (node.hasHeight && !CssGrid.isAligned(node)) {
                            fillUnitEqually(row.unit, rowCount);
                        }
                    }
                    else {
                        if (node.hasPX('height', false)) {
                            row.fixedWidth = true;
                            row.flexible = false;
                            setFlexibleDimension(node.actualHeight, rowGap, rowCount, rowUnit, rowMax);
                        }
                        if (node.hasWidth && !CssGrid.isJustified(node)) {
                            fillUnitEqually(column.unit, columnCount);
                        }
                    }
                    node.retain(children);
                    node.cssSort('zIndex');
                    if (node.cssTry('display', 'block')) {
                        node.each((item) => {
                            const { width, height } = item.boundingClientRect;
                            item.data(CSS_GRID, 'boundsData', Object.assign(Object.assign({}, item.bounds), { width, height }));
                        });
                        node.cssFinally('display');
                    }
                    node.data(CSS_GRID, 'mainData', mainData);
                }
            }
            return undefined;
        }
    }
    CssGrid.isFr = (value) => /\dfr$/.test(value);
    CssGrid.isPx = (value) => CSS$2.PX.test(value);
    CssGrid.isAligned = (node) => node.hasHeight && /^space-|center|flex-end|end/.test(node.css('alignContent'));
    CssGrid.isJustified = (node) => (node.blockStatic || node.hasWidth) && /^space-|center|flex-end|end|right/.test(node.css('justifyContent'));

    const { withinRange: withinRange$2 } = squared.lib.util;
    const FLEXBOX = EXT_NAME.FLEXBOX;
    class Flexbox extends ExtensionUI {
        static createDataAttribute(node, children) {
            return Object.assign(Object.assign({}, node.flexdata), { rowCount: 0, columnCount: 0, children });
        }
        is(node) {
            return node.flexElement;
        }
        condition(node) {
            return node.length > 0;
        }
        processNode(node) {
            const controller = this.controller;
            const [children, absolute] = node.partition((item) => item.pageFlow);
            const mainData = Flexbox.createDataAttribute(node, children);
            if (node.cssTry('align-items', 'start')) {
                if (node.cssTry('justify-items', 'start')) {
                    children.forEach(item => {
                        if (item.cssTry('align-self', 'start')) {
                            if (item.cssTry('justify-self', 'start')) {
                                const { width, height } = item.boundingClientRect;
                                item.data(FLEXBOX, 'boundsData', Object.assign(Object.assign({}, item.bounds), { width, height }));
                                item.cssFinally('justify-self');
                            }
                            item.cssFinally('align-self');
                        }
                    });
                    node.cssFinally('justify-items');
                }
                node.cssFinally('align-items');
            }
            if (mainData.wrap) {
                const [align, sort, size, method] = mainData.row ? ['top', 'left', 'right', 'intersectY'] : ['left', 'top', 'bottom', 'intersectX'];
                children.sort((a, b) => {
                    const linearA = a.linear;
                    const linearB = b.linear;
                    if (!a[method](b.bounds, 'bounds')) {
                        return linearA[align] < linearB[align] ? -1 : 1;
                    }
                    else {
                        const posA = linearA[sort];
                        const posB = linearB[sort];
                        if (!withinRange$2(posA, posB)) {
                            return posA < posB ? -1 : 1;
                        }
                    }
                    return 0;
                });
                let rowStart = children[0];
                let row = [rowStart];
                const rows = [row];
                let length = children.length;
                let i = 1;
                while (i < length) {
                    const item = children[i++];
                    if (rowStart[method](item.bounds, 'bounds')) {
                        row.push(item);
                    }
                    else {
                        rowStart = item;
                        row = [item];
                        rows.push(row);
                    }
                }
                node.clear();
                let maxCount = 0;
                let offset;
                length = rows.length;
                i = 0;
                if (length > 1) {
                    const boxSize = node.box[size];
                    while (i < length) {
                        const seg = rows[i];
                        maxCount = Math.max(seg.length, maxCount);
                        const group = controller.createNodeGroup(seg[0], seg, { parent: node, delegate: true, cascade: true });
                        group.addAlign(128 /* SEGMENTED */);
                        group.box[size] = boxSize;
                        group.containerIndex = i++;
                    }
                    offset = length;
                }
                else {
                    const item = rows[0];
                    node.retain(item);
                    maxCount = item.length;
                    while (i < maxCount) {
                        item[i].containerIndex = i++;
                    }
                    offset = maxCount;
                }
                const q = absolute.length;
                i = 0;
                while (i < q) {
                    absolute[i].containerIndex = offset + i++;
                }
                node.concat(absolute);
                node.sort();
                if (mainData.row) {
                    mainData.rowCount = length;
                    mainData.columnCount = maxCount;
                }
                else {
                    mainData.rowCount = maxCount;
                    mainData.columnCount = length;
                }
            }
            else {
                if (children.some(item => item.flexbox.order !== 0)) {
                    const [c, d] = mainData.reverse ? [-1, 1] : [1, -1];
                    children.sort((a, b) => {
                        const orderA = a.flexbox.order;
                        const orderB = b.flexbox.order;
                        if (orderA === orderB) {
                            return 0;
                        }
                        return orderA > orderB ? c : d;
                    });
                }
                if (mainData.row) {
                    mainData.rowCount = 1;
                    mainData.columnCount = node.length;
                }
                else {
                    mainData.rowCount = node.length;
                    mainData.columnCount = 1;
                }
            }
            node.data(FLEXBOX, 'mainData', mainData);
            return undefined;
        }
    }

    const $lib$9 = squared.lib;
    const { aboveRange: aboveRange$1, belowRange: belowRange$1, objectMap: objectMap$1, safeNestedArray: safeNestedArray$3, withinRange: withinRange$3 } = $lib$9.util;
    const GRID = EXT_NAME.GRID;
    function getRowIndex(columns, target) {
        const topA = target.bounds.top;
        const length = columns.length;
        let i = 0;
        while (i < length) {
            const index = columns[i++].findIndex(item => {
                const top = item.bounds.top;
                return withinRange$3(topA, top) || Math.ceil(topA) >= top && topA < Math.floor(item.bounds.bottom);
            });
            if (index !== -1) {
                return index;
            }
        }
        return -1;
    }
    class Grid extends ExtensionUI {
        static createDataCellAttribute() {
            return {
                rowSpan: 0,
                columnSpan: 0,
                index: -1,
                cellStart: false,
                cellEnd: false,
                rowEnd: false,
                rowStart: false
            };
        }
        condition(node) {
            if (node.length > 1 && !node.layoutElement && node.tagName !== 'TABLE' && !node.has('listStyle')) {
                if (node.display === 'table') {
                    return node.every(item => item.display === 'table-row' && item.every(child => child.display === 'table-cell')) || node.every(item => item.display === 'table-cell');
                }
                else if (node.percentWidth === 0 || !node.find(item => item.percentWidth > 0, { cascade: true })) {
                    let minLength = false;
                    let itemCount = 0;
                    for (const item of node) {
                        if (item.pageFlow && !item.visibleStyle.background && item.blockStatic && item.percentWidth === 0 && !item.autoMargin.leftRight && !item.autoMargin.left) {
                            if (item.length > 1) {
                                minLength = true;
                            }
                            if (item.display === 'list-item' && !item.has('listStyleType')) {
                                itemCount++;
                            }
                        }
                        else {
                            return false;
                        }
                    }
                    return itemCount === node.length || minLength && node.every(item => item.length > 0 && NodeUI.linearData(item.children).linearX);
                }
            }
            return false;
        }
        processNode(node) {
            var _a;
            const columnEnd = [];
            const nextMapX = {};
            let columns = [];
            node.each(row => {
                row.each((column) => {
                    if (column.visible) {
                        safeNestedArray$3(nextMapX, Math.floor(column.linear.left)).push(column);
                    }
                });
            });
            const nextCoordsX = Object.keys(nextMapX);
            const length = nextCoordsX.length;
            if (length) {
                let columnLength = -1;
                for (let i = 0; i < length; ++i) {
                    const nextAxisX = nextMapX[nextCoordsX[i]];
                    if (i === 0) {
                        columnLength = length;
                    }
                    else if (columnLength !== nextAxisX.length) {
                        columnLength = -1;
                        break;
                    }
                }
                if (columnLength !== -1) {
                    columns = objectMap$1(nextCoordsX, value => nextMapX[value]);
                }
                else {
                    const columnRight = [];
                    for (let i = 0; i < length; ++i) {
                        const nextAxisX = nextMapX[nextCoordsX[i]];
                        const q = nextAxisX.length;
                        if (i === 0 && q === 0) {
                            return undefined;
                        }
                        columnRight[i] = i === 0 ? 0 : columnRight[i - 1];
                        for (let j = 0; j < q; ++j) {
                            const nextX = nextAxisX[j];
                            const { left, right } = nextX.linear;
                            if (i === 0 || aboveRange$1(left, columnRight[i - 1])) {
                                const row = safeNestedArray$3(columns, i);
                                if (i === 0 || columns[0].length === q) {
                                    row[j] = nextX;
                                }
                                else {
                                    const index = getRowIndex(columns, nextX);
                                    if (index !== -1) {
                                        row[index] = nextX;
                                    }
                                    else {
                                        return undefined;
                                    }
                                }
                            }
                            else {
                                const columnLast = columns[columns.length - 1];
                                if (columnLast) {
                                    let minLeft = Number.POSITIVE_INFINITY;
                                    let maxRight = Number.NEGATIVE_INFINITY;
                                    columnLast.forEach(item => {
                                        const linear = item.linear;
                                        minLeft = Math.min(linear.left, minLeft);
                                        maxRight = Math.max(linear.right, maxRight);
                                    });
                                    if (Math.floor(left) > Math.ceil(minLeft) && Math.floor(right) > Math.ceil(maxRight)) {
                                        const index = getRowIndex(columns, nextX);
                                        if (index !== -1) {
                                            let k = columns.length - 1;
                                            while (k >= 0) {
                                                const row = columns[k--];
                                                if (row) {
                                                    if (!row[index]) {
                                                        columnLast.length = 0;
                                                    }
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            columnRight[i] = Math.max(right, columnRight[i]);
                        }
                    }
                    const q = columnRight.length;
                    for (let i = 0, j = -1; i < q; ++i) {
                        if (!columns[i]) {
                            if (j === -1) {
                                j = i - 1;
                            }
                            else if (i === q - 1) {
                                columnRight[j] = columnRight[i];
                            }
                        }
                        else if (j !== -1) {
                            columnRight[j] = columnRight[i - 1];
                            j = -1;
                        }
                    }
                    for (let i = 0; i < columns.length; ++i) {
                        if ((_a = columns[i]) === null || _a === void 0 ? void 0 : _a.length) {
                            columnEnd.push(columnRight[i]);
                        }
                        else {
                            columns.splice(i--, 1);
                        }
                    }
                    const maxColumn = columns.reduce((a, b) => Math.max(a, b.length), 0);
                    for (let l = 0; l < maxColumn; ++l) {
                        const s = columns.length;
                        let m = 0;
                        while (m < s) {
                            const row = columns[m++];
                            if (!row[l]) {
                                row[l] = { spacer: 1 };
                            }
                        }
                    }
                    columnEnd.push(node.box.right);
                }
            }
            const columnCount = columns.length;
            if (columnCount > 1 && columns[0].length === node.length) {
                const children = [];
                const assigned = new Set();
                for (let i = 0, count = 0; i < columnCount; ++i) {
                    const column = columns[i];
                    const rowCount = column.length;
                    for (let j = 0, start = 0, spacer = 0; j < rowCount; ++j) {
                        const item = column[j];
                        const rowData = safeNestedArray$3(children, j);
                        if (!item['spacer']) {
                            const data = Object.assign(Grid.createDataCellAttribute(), item.data(GRID, 'cellData'));
                            let rowSpan = 1;
                            let columnSpan = 1 + spacer;
                            let k = i + 1;
                            while (k < columnCount) {
                                const row = columns[k++][j];
                                if (row.spacer === 1) {
                                    columnSpan++;
                                    row.spacer = 2;
                                }
                                else {
                                    break;
                                }
                            }
                            if (columnSpan === 1) {
                                k = j + 1;
                                while (k < rowCount) {
                                    const row = column[k++];
                                    if (row.spacer === 1) {
                                        rowSpan++;
                                        row.spacer = 2;
                                    }
                                    else {
                                        break;
                                    }
                                }
                            }
                            if (columnEnd.length) {
                                const l = Math.min(i + (columnSpan - 1), columnEnd.length - 1);
                                item.actualParent.naturalChildren.forEach((sibling) => {
                                    if (!assigned.has(sibling) && sibling.visible && !sibling.rendered) {
                                        const { left, right } = sibling.linear;
                                        if (aboveRange$1(left, item.linear.right) && belowRange$1(right, columnEnd[l])) {
                                            safeNestedArray$3(data, 'siblings').push(sibling);
                                        }
                                    }
                                });
                            }
                            data.rowSpan = rowSpan;
                            data.columnSpan = columnSpan;
                            data.rowStart = start++ === 0;
                            data.rowEnd = columnSpan + i === columnCount;
                            data.cellStart = count++ === 0;
                            data.cellEnd = data.rowEnd && j === rowCount - 1;
                            data.index = i;
                            spacer = 0;
                            item.data(GRID, 'cellData', data);
                            rowData.push(item);
                            assigned.add(item);
                        }
                        else if (item['spacer'] === 1) {
                            spacer++;
                        }
                    }
                }
                node.each((item) => item.hide());
                node.clear();
                children.forEach(group => group.forEach(item => item.parent = node));
                if (node.tableElement && node.css('borderCollapse') === 'collapse') {
                    node.resetBox(480 /* PADDING */);
                }
                node.data(GRID, 'columnCount', columnCount);
            }
            return undefined;
        }
    }

    const $lib$a = squared.lib;
    const { convertListStyle: convertListStyle$1 } = $lib$a.css;
    const { isNumber: isNumber$3 } = $lib$a.util;
    const hasSingleImage = (visibleStyle) => visibleStyle.backgroundImage && !visibleStyle.backgroundRepeat;
    class List extends ExtensionUI {
        condition(node) {
            const length = node.length;
            if (length) {
                const floated = new Set();
                let blockStatic = true;
                let inlineVertical = true;
                let floating = true;
                let blockAlternate = true;
                let bulletVisible = false;
                const children = node.children;
                for (let i = 0; i < length; ++i) {
                    const item = children[i];
                    const type = item.css('listStyleType');
                    if (item.display === 'list-item' && (type !== 'none' || item.innerBefore) || item.marginLeft < 0 && type === 'none' && hasSingleImage(item.visibleStyle)) {
                        bulletVisible = true;
                    }
                    if (floating || blockAlternate) {
                        if (item.floating) {
                            floated.add(item.float);
                            blockAlternate = false;
                        }
                        else if (i === 0 || i === length - 1 || item.blockStatic || children[i - 1].blockStatic && children[i + 1].blockStatic) {
                            floating = false;
                        }
                        else {
                            floating = false;
                            blockAlternate = false;
                        }
                    }
                    if (!item.blockStatic) {
                        blockStatic = false;
                    }
                    if (!item.inlineVertical) {
                        inlineVertical = false;
                    }
                    if (!blockStatic && !inlineVertical && !blockAlternate && !floating) {
                        return false;
                    }
                }
                return bulletVisible && (blockStatic || inlineVertical || floating && floated.size === 1 || blockAlternate);
            }
            return false;
        }
        processNode(node) {
            const ordered = node.tagName === 'OL';
            let i = ordered && node.toElementInt('start') || 1;
            node.each((item) => {
                const mainData = List.createDataAttribute();
                const type = item.css('listStyleType');
                const enabled = item.display === 'list-item';
                if (enabled || type !== '' && type !== 'none' || hasSingleImage(item.visibleStyle)) {
                    if (item.has('listStyleImage')) {
                        mainData.imageSrc = item.css('listStyleImage');
                    }
                    else {
                        if (ordered && enabled && item.tagName === 'LI') {
                            const value = item.attributes['value'];
                            if (isNumber$3(value)) {
                                i = Math.floor(parseFloat(value));
                            }
                        }
                        let ordinal = convertListStyle$1(type, i);
                        if (ordinal === '') {
                            switch (type) {
                                case 'disc':
                                    ordinal = '●';
                                    break;
                                case 'square':
                                    ordinal = '■';
                                    break;
                                case 'none': {
                                    let src = '';
                                    let position = '';
                                    if (!item.visibleStyle.backgroundRepeat) {
                                        src = item.backgroundImage;
                                        position = item.css('backgroundPosition');
                                    }
                                    if (src !== '' && src !== 'none') {
                                        mainData.imageSrc = src;
                                        mainData.imagePosition = position;
                                        item.exclude({ resource: NODE_RESOURCE.IMAGE_SOURCE });
                                    }
                                    break;
                                }
                                default:
                                    ordinal = '○';
                                    break;
                            }
                        }
                        else {
                            ordinal += '.';
                        }
                        mainData.ordinal = ordinal;
                    }
                    if (enabled) {
                        ++i;
                    }
                }
                item.data(EXT_NAME.LIST, 'mainData', mainData);
            });
            return undefined;
        }
    }
    List.createDataAttribute = () => ({ ordinal: '', imageSrc: '', imagePosition: '' });

    const $lib$b = squared.lib;
    const { assignRect: assignRect$1 } = $lib$b.dom;
    const { convertFloat: convertFloat$4, withinRange: withinRange$4 } = $lib$b.util;
    const TRANSLATE_OPTIONS = { relative: true };
    class Relative extends ExtensionUI {
        is(node) {
            return node.positionRelative && !node.autoPosition || convertFloat$4(node.verticalAlign) !== 0;
        }
        condition() {
            return true;
        }
        processNode(node) {
            return { subscribe: true };
        }
        postOptimize(node) {
            const renderParent = node.renderParent;
            const verticalAlign = !node.baselineAltered ? convertFloat$4(node.verticalAlign) : 0;
            let top = 0;
            let right = 0;
            let bottom = 0;
            let left = 0;
            if (node.hasPX('top')) {
                top = node.top;
            }
            else {
                bottom = node.bottom;
            }
            if (node.hasPX('left')) {
                left = node.left;
            }
            else {
                right = node.right;
            }
            if (renderParent.support.positionTranslation) {
                let x = 0;
                let y = 0;
                if (left !== 0) {
                    x = left;
                }
                else if (right !== 0) {
                    x = -right;
                }
                if (top !== 0) {
                    y = top;
                }
                else if (bottom !== 0) {
                    y = -bottom;
                }
                if (verticalAlign !== 0) {
                    y -= verticalAlign;
                }
                if (x !== 0) {
                    node.translateX(x, TRANSLATE_OPTIONS);
                }
                if (y !== 0) {
                    node.translateY(y, TRANSLATE_OPTIONS);
                }
            }
            else {
                let target = node;
                if ((top !== 0 || bottom !== 0 || verticalAlign !== 0) && renderParent.layoutHorizontal && renderParent.support.positionRelative && node.renderChildren.length === 0) {
                    const application = this.application;
                    target = node.clone(application.nextId, true, true);
                    target.baselineAltered = true;
                    node.hide({ hidden: true });
                    this.cache.append(target, false);
                    const layout = new LayoutUI(renderParent, target, target.containerType, target.alignmentType);
                    const index = renderParent.renderChildren.findIndex(item => item === node);
                    if (index !== -1) {
                        layout.renderIndex = index + 1;
                    }
                    application.addLayout(layout);
                    if (node.parseUnit(node.css('textIndent')) < 0) {
                        const documentId = node.documentId;
                        renderParent.renderEach(item => {
                            if (item.alignSibling('topBottom') === documentId) {
                                item.alignSibling('topBottom', target.documentId);
                            }
                            else if (item.alignSibling('bottomTop') === documentId) {
                                item.alignSibling('bottomTop', target.documentId);
                            }
                        });
                    }
                    if (node.baselineActive && !node.baselineAltered) {
                        for (const children of (renderParent.horizontalRows || [renderParent.renderChildren])) {
                            if (children.includes(node)) {
                                const unaligned = children.filter(item => item.positionRelative && item.length > 0 && convertFloat$4(node.verticalAlign) !== 0);
                                const length = unaligned.length;
                                if (length) {
                                    unaligned.sort((a, b) => {
                                        const topA = a.linear.top;
                                        const topB = b.linear.top;
                                        if (withinRange$4(topA, topB)) {
                                            return 0;
                                        }
                                        return topA < topB ? -1 : 1;
                                    });
                                    let first = true;
                                    let i = 0;
                                    while (i < length) {
                                        const item = unaligned[i++];
                                        if (first) {
                                            node.modifyBox(2 /* MARGIN_TOP */, convertFloat$4(item.verticalAlign));
                                            first = false;
                                        }
                                        else {
                                            item.modifyBox(2 /* MARGIN_TOP */, item.linear.top - unaligned[0].linear.top);
                                        }
                                        item.setCacheValue('verticalAlign', '0px');
                                    }
                                }
                                break;
                            }
                        }
                    }
                }
                else if (node.positionRelative && node.naturalElement) {
                    const bounds = node.bounds;
                    const hasVertical = top !== 0 || bottom !== 0;
                    const hasHorizontal = left !== 0 || right !== 0;
                    let preceding = false;
                    let previous;
                    const children = node.actualParent.naturalChildren;
                    const length = children.length;
                    let i = 0;
                    while (i < length) {
                        const item = children[i++];
                        if (item === node) {
                            if (preceding) {
                                if (hasVertical && renderParent.layoutVertical) {
                                    const rect = assignRect$1(node.boundingClientRect);
                                    if (top !== 0) {
                                        top -= rect.top - bounds.top;
                                    }
                                    else {
                                        if ((previous === null || previous === void 0 ? void 0 : previous.positionRelative) && previous.hasPX('top')) {
                                            bottom += bounds.bottom - rect.bottom;
                                        }
                                        else {
                                            bottom += rect.bottom - bounds.bottom;
                                        }
                                    }
                                }
                                if (hasHorizontal && renderParent.layoutHorizontal && !node.alignSibling('leftRight')) {
                                    const rect = assignRect$1(node.boundingClientRect);
                                    if (left !== 0) {
                                        left -= rect.left - bounds.left;
                                    }
                                    else {
                                        if ((previous === null || previous === void 0 ? void 0 : previous.positionRelative) && previous.hasPX('right')) {
                                            right += bounds.right - rect.right;
                                        }
                                        else {
                                            right += rect.right - bounds.right;
                                        }
                                    }
                                }
                            }
                            else if (renderParent.layoutVertical) {
                                if (top !== 0) {
                                    if ((previous === null || previous === void 0 ? void 0 : previous.blockStatic) && previous.positionRelative && item.blockStatic) {
                                        top -= previous.top;
                                    }
                                }
                                else if (bottom !== 0) {
                                    const getBox = item.getBox(2 /* MARGIN_TOP */);
                                    if (getBox[0] === 1) {
                                        bottom -= item.marginTop;
                                    }
                                }
                            }
                            break;
                        }
                        else if (item.positionRelative && item.renderParent === renderParent) {
                            preceding = true;
                        }
                        if (item.pageFlow) {
                            previous = item;
                        }
                    }
                }
                if (verticalAlign !== 0) {
                    target.modifyBox(2 /* MARGIN_TOP */, verticalAlign * -1);
                }
                if (top !== 0) {
                    target.modifyBox(2 /* MARGIN_TOP */, top);
                }
                else if (bottom !== 0) {
                    target.modifyBox(2 /* MARGIN_TOP */, bottom * -1);
                }
                if (left !== 0) {
                    if (target.autoMargin.left) {
                        target.modifyBox(4 /* MARGIN_RIGHT */, left * -1);
                    }
                    else {
                        target.modifyBox(16 /* MARGIN_LEFT */, left);
                    }
                }
                else if (right !== 0) {
                    target.modifyBox(16 /* MARGIN_LEFT */, right * -1);
                }
                if (target !== node) {
                    target.setBoxSpacing();
                }
            }
        }
    }

    const { getBackgroundPosition: getBackgroundPosition$1, resolveURL: resolveURL$1 } = squared.lib.css;
    const REGEX_BACKGROUNDPOSITION = /^0[a-z%]+|left|start|top/;
    class Sprite extends ExtensionUI {
        is(node) {
            return node.length === 0 && node.hasWidth && node.hasHeight;
        }
        condition(node) {
            const backgroundImage = node.backgroundImage;
            if (backgroundImage !== '' && (this.included(node.element) || !node.dataset.use)) {
                const image = (this.resource.getRawData(backgroundImage) || this.resource.getImage(resolveURL$1(backgroundImage)));
                if (image) {
                    const dimension = node.actualDimension;
                    const { backgroundPositionX, backgroundPositionY } = node.cssAsObject('backgroundPositionX', 'backgroundPositionY');
                    const position = getBackgroundPosition$1(backgroundPositionX + ' ' + backgroundPositionY, dimension, { fontSize: node.fontSize, screenDimension: node.localSettings.screenDimension });
                    const x = (position.left < 0 || REGEX_BACKGROUNDPOSITION.test(backgroundPositionX)) && image.width > dimension.width;
                    const y = (position.top < 0 || REGEX_BACKGROUNDPOSITION.test(backgroundPositionY)) && image.height > dimension.height;
                    if ((x || y) && (x || position.left === 0) && (y || position.top === 0)) {
                        node.data(EXT_NAME.SPRITE, 'mainData', { image, position });
                        return true;
                    }
                }
            }
            return false;
        }
    }

    const $lib$c = squared.lib;
    const { formatPercent: formatPercent$1, formatPX: formatPX$5, getInheritedStyle: getInheritedStyle$2, getStyle: getStyle$4, isLength: isLength$5, isPercent: isPercent$4 } = $lib$c.css;
    const { getNamedItem: getNamedItem$2 } = $lib$c.dom;
    const { maxArray: maxArray$1 } = $lib$c.math;
    const { isNumber: isNumber$4, replaceMap, safeNestedArray: safeNestedArray$4, withinRange: withinRange$5 } = $lib$c.util;
    const TABLE = EXT_NAME.TABLE;
    const REGEX_BACKGROUND$2 = /rgba\(0, 0, 0, 0\)|transparent/;
    function setAutoWidth(node, td, data) {
        data.percent = Math.round((td.bounds.width / node.box.width) * 100) + '%';
        data.expand = true;
    }
    function setBorderStyle$1(node, attr, including) {
        const cssStyle = attr + 'Style';
        node.ascend({ including }).some((item) => {
            if (item.has(cssStyle)) {
                const cssColor = attr + 'Color';
                const cssWidth = attr + 'Width';
                node.css('border', 'inherit');
                node.cssApply(item.cssAsObject(cssStyle, cssColor, cssWidth));
                node.unsetCache(cssWidth);
                return true;
            }
            return false;
        });
    }
    function hideCell(node) {
        node.exclude({ resource: NODE_RESOURCE.ALL });
        node.hide();
    }
    const setBoundsWidth = (node) => node.css('width', formatPX$5(node.bounds.width), true);
    class Table extends ExtensionUI {
        static createDataAttribute(node) {
            return {
                layoutType: 0,
                rowCount: 0,
                columnCount: 0,
                layoutFixed: node.css('tableLayout') === 'fixed',
                borderCollapse: node.css('borderCollapse') === 'collapse',
                expand: false
            };
        }
        processNode(node) {
            const mainData = Table.createDataAttribute(node);
            const tbody = [];
            let table = [];
            let tfoot;
            let thead;
            const inheritStyles = (parent) => {
                if (parent) {
                    parent.cascade((item) => {
                        switch (item.tagName) {
                            case 'TH':
                            case 'TD':
                                item.inherit(parent, 'styleMap');
                                item.unsetCache('visibleStyle');
                                break;
                        }
                        return false;
                    });
                    table = table.concat(parent.children);
                    hideCell(parent);
                }
            };
            node.each((item) => {
                switch (item.tagName) {
                    case 'THEAD':
                        if (!thead) {
                            thead = item;
                        }
                        else {
                            hideCell(item);
                        }
                        break;
                    case 'TBODY':
                        tbody.push(item);
                        break;
                    case 'TFOOT':
                        if (!tfoot) {
                            tfoot = item;
                        }
                        else {
                            hideCell(item);
                        }
                        break;
                }
            });
            inheritStyles(thead);
            tbody.forEach(section => {
                table = table.concat(section.children);
                hideCell(section);
            });
            inheritStyles(tfoot);
            const hasWidth = node.hasWidth;
            const borderCollapse = mainData.borderCollapse;
            const [horizontal, vertical] = borderCollapse ? [0, 0] : replaceMap(node.css('borderSpacing').split(' '), (value, index) => index === 0 ? node.parseWidth(value) : node.parseHeight(value));
            const spacingWidth = horizontal > 1 ? Math.round(horizontal / 2) : horizontal;
            const spacingHeight = vertical > 1 ? Math.round(vertical / 2) : vertical;
            const colgroup = node.element.querySelector('COLGROUP');
            const caption = node.find(item => item.tagName === 'CAPTION');
            const captionBottom = node.css('captionSide') === 'bottom';
            const rowWidth = [];
            const mapBounds = [];
            const tableFilled = [];
            const mapWidth = [];
            const rowCount = table.length;
            let columnCount = 0;
            for (let i = 0; i < rowCount; ++i) {
                const tr = table[i];
                rowWidth[i] = horizontal;
                const row = tableFilled[i] || [];
                tableFilled[i] = row;
                tr.each((td, index) => {
                    const element = td.element;
                    const rowSpan = element.rowSpan;
                    let colSpan = element.colSpan;
                    let j = 0;
                    while (row[j]) {
                        j++;
                    }
                    const q = i + rowSpan;
                    let k = i;
                    while (k < q) {
                        const item = safeNestedArray$4(tableFilled, k++);
                        const r = j + colSpan;
                        for (let l = j, m = 0; l < r; ++l) {
                            if (!item[l]) {
                                item[l] = td;
                                m++;
                            }
                            else {
                                colSpan = m;
                                break;
                            }
                        }
                    }
                    if (!td.hasPX('width')) {
                        const value = getNamedItem$2(element, 'width');
                        if (isPercent$4(value)) {
                            td.css('width', value, true);
                        }
                        else if (isNumber$4(value)) {
                            td.css('width', formatPX$5(parseFloat(value)), true);
                        }
                    }
                    if (!td.hasPX('height')) {
                        const value = getNamedItem$2(element, 'height');
                        if (isPercent$4(value)) {
                            td.css('height', value);
                        }
                        else if (isNumber$4(value)) {
                            td.css('height', formatPX$5(parseFloat(value)));
                        }
                    }
                    if (td.cssInitial('verticalAlign') === '') {
                        td.css('verticalAlign', 'middle', true);
                    }
                    if (!td.visibleStyle.backgroundImage && !td.visibleStyle.backgroundColor) {
                        if (colgroup) {
                            const { backgroundImage, backgroundColor } = getStyle$4(colgroup.children[index + 1]);
                            if (backgroundImage && backgroundImage !== 'none') {
                                td.css('backgroundImage', backgroundImage, true);
                            }
                            if (backgroundColor && !REGEX_BACKGROUND$2.test(backgroundColor)) {
                                td.css('backgroundColor', backgroundColor);
                                td.setCacheValue('backgroundColor', backgroundColor);
                            }
                        }
                        else {
                            let value = getInheritedStyle$2(element, 'backgroundImage', /none/, 'TABLE');
                            if (value !== '') {
                                td.css('backgroundImage', value, true);
                            }
                            value = getInheritedStyle$2(element, 'backgroundColor', REGEX_BACKGROUND$2, 'TABLE');
                            if (value !== '') {
                                td.css('backgroundColor', value);
                                td.setCacheValue('backgroundColor', value);
                            }
                        }
                    }
                    switch (td.tagName) {
                        case 'TD': {
                            const including = td.parent;
                            if (td.borderTopWidth === 0) {
                                setBorderStyle$1(td, 'borderTop', including);
                            }
                            if (td.borderRightWidth === 0) {
                                setBorderStyle$1(td, 'borderRight', including);
                            }
                            if (td.borderBottomWidth === 0) {
                                setBorderStyle$1(td, 'borderBottom', including);
                            }
                            if (td.borderLeftWidth === 0) {
                                setBorderStyle$1(td, 'borderLeft', including);
                            }
                            break;
                        }
                        case 'TH': {
                            if (td.cssInitial('textAlign') === '') {
                                td.css('textAlign', 'center');
                            }
                            if (td.borderTopWidth === 0) {
                                setBorderStyle$1(td, 'borderTop', node);
                            }
                            if (td.borderBottomWidth === 0) {
                                setBorderStyle$1(td, 'borderBottom', node);
                            }
                            break;
                        }
                    }
                    const columnWidth = td.cssInitial('width');
                    const reevaluate = mapWidth[j] === undefined || mapWidth[j] === 'auto';
                    const width = td.bounds.width;
                    if (i === 0 || reevaluate || !mainData.layoutFixed) {
                        if (columnWidth === '' || columnWidth === 'auto') {
                            if (mapWidth[j] === undefined) {
                                mapWidth[j] = columnWidth || '0px';
                                mapBounds[j] = 0;
                            }
                            else if (i === rowCount - 1 && reevaluate && mapBounds[j] === 0) {
                                mapBounds[j] = width;
                            }
                        }
                        else {
                            const percent = isPercent$4(columnWidth);
                            const length = isLength$5(mapWidth[j]);
                            if (reevaluate || width < mapBounds[j] || width === mapBounds[j] && (length && percent || percent && isPercent$4(mapWidth[j]) && td.parseWidth(columnWidth) >= td.parseWidth(mapWidth[j]) || length && isLength$5(columnWidth) && td.parseWidth(columnWidth) > td.parseWidth(mapWidth[j]))) {
                                mapWidth[j] = columnWidth;
                            }
                            if (reevaluate || element.colSpan === 1) {
                                mapBounds[j] = width;
                            }
                        }
                    }
                    if (td.length || td.inlineText) {
                        rowWidth[i] += width + horizontal;
                    }
                    if (spacingWidth > 0) {
                        td.modifyBox(16 /* MARGIN_LEFT */, j === 0 ? horizontal : spacingWidth);
                        td.modifyBox(4 /* MARGIN_RIGHT */, index === 0 ? spacingWidth : horizontal);
                    }
                    if (spacingHeight > 0) {
                        td.modifyBox(2 /* MARGIN_TOP */, i === 0 ? vertical : spacingHeight);
                        td.modifyBox(8 /* MARGIN_BOTTOM */, i + rowSpan < rowCount ? spacingHeight : vertical);
                    }
                    td.data(TABLE, 'cellData', { colSpan, rowSpan });
                });
                hideCell(tr);
                columnCount = Math.max(columnCount, row.length);
            }
            if (node.hasPX('width', false) && mapWidth.some(value => isPercent$4(value))) {
                replaceMap(mapWidth, (value, index) => {
                    if (value === 'auto') {
                        const dimension = mapBounds[index];
                        if (dimension > 0) {
                            return formatPX$5(dimension);
                        }
                    }
                    return value;
                });
            }
            let percentAll = false;
            let mapPercent = 0;
            if (mapWidth.every(value => isPercent$4(value))) {
                if (mapWidth.reduce((a, b) => a + parseFloat(b), 0) > 1) {
                    let percentTotal = 100;
                    replaceMap(mapWidth, (value) => {
                        const percent = parseFloat(value);
                        if (percentTotal <= 0) {
                            value = '0px';
                        }
                        else if (percentTotal - percent < 0) {
                            value = formatPercent$1(percentTotal / 100);
                        }
                        percentTotal -= percent;
                        return value;
                    });
                }
                if (!node.hasWidth) {
                    mainData.expand = true;
                }
                percentAll = true;
            }
            else if (mapWidth.every(value => isLength$5(value))) {
                const width = mapWidth.reduce((a, b) => a + parseFloat(b), 0);
                if (node.hasWidth) {
                    if (width < node.width) {
                        replaceMap(mapWidth, (value) => value !== '0px' ? ((parseFloat(value) / width) * 100) + '%' : value);
                    }
                    else if (width > node.width) {
                        node.css('width', 'auto');
                        if (!mainData.layoutFixed) {
                            node.cascade((item) => {
                                item.css('width', 'auto');
                                return false;
                            });
                        }
                    }
                }
                if (mainData.layoutFixed && !node.hasPX('width')) {
                    node.css('width', formatPX$5(node.bounds.width));
                }
            }
            mainData.layoutType = (() => {
                if (mapWidth.length > 1) {
                    mapPercent = mapWidth.reduce((a, b) => a + (isPercent$4(b) ? parseFloat(b) : 0), 0);
                    if (mainData.layoutFixed && mapWidth.reduce((a, b) => a + (isLength$5(b) ? parseFloat(b) : 0), 0) >= node.actualWidth) {
                        return 4 /* COMPRESS */;
                    }
                    else if (mapWidth.length > 1 && mapWidth.some(value => isPercent$4(value)) || mapWidth.every(value => isLength$5(value) && value !== '0px')) {
                        return 3 /* VARIABLE */;
                    }
                    else if (mapWidth.every(value => value === mapWidth[0])) {
                        if (node.find(td => td.hasHeight, { cascade: true })) {
                            mainData.expand = true;
                            return 3 /* VARIABLE */;
                        }
                        else if (mapWidth[0] === 'auto') {
                            if (node.hasWidth) {
                                return 3 /* VARIABLE */;
                            }
                            else {
                                const td = node.cascade(item => item.tagName === 'TD');
                                return td.length && td.every(item => withinRange$5(item.bounds.width, td[0].bounds.width)) ? 0 /* NONE */ : 3 /* VARIABLE */;
                            }
                        }
                        else if (node.hasWidth) {
                            return 2 /* FIXED */;
                        }
                    }
                    if (mapWidth.every(value => value === 'auto' || isLength$5(value) && value !== '0px')) {
                        if (!node.hasWidth) {
                            mainData.expand = true;
                        }
                        return 1 /* STRETCH */;
                    }
                }
                return 0 /* NONE */;
            })();
            node.clear();
            if (caption) {
                if (!caption.hasWidth) {
                    if (caption.textElement) {
                        if (!caption.hasPX('maxWidth')) {
                            caption.css('maxWidth', formatPX$5(caption.bounds.width));
                        }
                    }
                    else if (caption.bounds.width > maxArray$1(rowWidth)) {
                        setBoundsWidth(caption);
                    }
                }
                if (!caption.cssInitial('textAlign')) {
                    caption.css('textAlign', 'center');
                }
                caption.data(TABLE, 'cellData', { colSpan: columnCount });
                if (!captionBottom) {
                    caption.parent = node;
                }
            }
            let i = 0;
            while (i < rowCount) {
                const tr = tableFilled[i++];
                const length = tr.length;
                let j = 0;
                while (j < length) {
                    const td = tr[j];
                    const data = td.data(TABLE, 'cellData');
                    const columnWidth = mapWidth[j];
                    j += data.colSpan;
                    if (data.placed) {
                        continue;
                    }
                    if (columnWidth) {
                        switch (mainData.layoutType) {
                            case 0 /* NONE */:
                                break;
                            case 3 /* VARIABLE */:
                                if (columnWidth === 'auto') {
                                    if (mapPercent >= 1) {
                                        setBoundsWidth(td);
                                        data.exceed = !hasWidth;
                                        data.downsized = true;
                                    }
                                    else {
                                        setAutoWidth(node, td, data);
                                    }
                                }
                                else if (isPercent$4(columnWidth)) {
                                    if (percentAll) {
                                        data.percent = columnWidth;
                                        data.expand = true;
                                    }
                                    else {
                                        setBoundsWidth(td);
                                    }
                                }
                                else if (isLength$5(columnWidth) && parseInt(columnWidth) > 0) {
                                    if (td.bounds.width >= parseInt(columnWidth)) {
                                        setBoundsWidth(td);
                                        data.expand = false;
                                        data.downsized = false;
                                    }
                                    else {
                                        if (mainData.layoutFixed) {
                                            setAutoWidth(node, td, data);
                                            data.downsized = true;
                                        }
                                        else {
                                            setBoundsWidth(td);
                                            data.expand = false;
                                        }
                                    }
                                }
                                else {
                                    if (!td.hasPX('width', false) || td.percentWidth) {
                                        setBoundsWidth(td);
                                    }
                                    data.expand = false;
                                }
                                break;
                            case 2 /* FIXED */:
                                setAutoWidth(node, td, data);
                                break;
                            case 1 /* STRETCH */:
                                if (columnWidth === 'auto') {
                                    data.flexible = true;
                                }
                                else {
                                    if (mainData.layoutFixed) {
                                        data.downsized = true;
                                    }
                                    else {
                                        setBoundsWidth(td);
                                    }
                                    data.expand = false;
                                }
                                break;
                            case 4 /* COMPRESS */:
                                if (!isLength$5(columnWidth)) {
                                    td.hide();
                                }
                                break;
                        }
                    }
                    data.placed = true;
                    td.parent = node;
                }
                if (length < columnCount) {
                    const data = tr[length - 1].data(TABLE, 'cellData');
                    if (data) {
                        data.spaceSpan = columnCount - length;
                    }
                }
            }
            if (caption && captionBottom) {
                caption.parent = node;
            }
            if (mainData.borderCollapse) {
                const borderTop = node.cssAsObject('borderTopColor', 'borderTopStyle', 'borderTopWidth');
                const borderRight = node.cssAsObject('borderRightColor', 'borderRightStyle', 'borderRightWidth');
                const borderBottom = node.cssAsObject('borderBottomColor', 'borderBottomStyle', 'borderBottomWidth');
                const borderLeft = node.cssAsObject('borderLeftColor', 'borderLeftStyle', 'borderLeftWidth');
                const borderTopWidth = parseInt(borderTop.borderTopWidth);
                const borderRightWidth = parseInt(borderRight.borderRightWidth);
                const borderBottomWidth = parseInt(borderBottom.borderBottomWidth);
                const borderLeftWidth = parseInt(borderLeft.borderLeftWidth);
                let hideTop = false;
                let hideRight = false;
                let hideBottom = false;
                let hideLeft = false;
                for (i = 0; i < rowCount; ++i) {
                    const tr = tableFilled[i];
                    for (let j = 0; j < columnCount; ++j) {
                        const td = tr[j];
                        if ((td === null || td === void 0 ? void 0 : td.css('visibility')) === 'visible') {
                            if (i === 0) {
                                if (td.borderTopWidth < borderTopWidth) {
                                    td.cssApply(borderTop);
                                    td.unsetCache('borderTopWidth');
                                }
                                else {
                                    hideTop = true;
                                }
                            }
                            if (i >= 0 && i < rowCount - 1) {
                                const next = tableFilled[i + 1][j];
                                if ((next === null || next === void 0 ? void 0 : next.css('visibility')) === 'visible' && next !== td) {
                                    if (td.borderBottomWidth > next.borderTopWidth) {
                                        next.css('borderTopWidth', '0px', true);
                                    }
                                    else {
                                        td.css('borderBottomWidth', '0px', true);
                                    }
                                }
                            }
                            if (i === rowCount - 1) {
                                if (td.borderBottomWidth < borderBottomWidth) {
                                    td.cssApply(borderBottom);
                                    td.unsetCache('borderBottomWidth');
                                }
                                else {
                                    hideBottom = true;
                                }
                            }
                            if (j === 0) {
                                if (td.borderLeftWidth < borderLeftWidth) {
                                    td.cssApply(borderLeft);
                                    td.unsetCache('borderLeftWidth');
                                }
                                else {
                                    hideLeft = true;
                                }
                            }
                            if (j >= 0 && j < columnCount - 1) {
                                const next = tr[j + 1];
                                if ((next === null || next === void 0 ? void 0 : next.css('visibility')) === 'visible' && next !== td) {
                                    if (td.borderRightWidth >= next.borderLeftWidth) {
                                        next.css('borderLeftWidth', '0px', true);
                                    }
                                    else {
                                        td.css('borderRightWidth', '0px', true);
                                    }
                                }
                            }
                            if (j === columnCount - 1) {
                                if (td.borderRightWidth < borderRightWidth) {
                                    td.cssApply(borderRight);
                                    td.unsetCache('borderRightWidth');
                                }
                                else {
                                    hideRight = true;
                                }
                            }
                        }
                    }
                }
                if (hideTop || hideRight || hideBottom || hideLeft) {
                    node.cssApply({
                        borderTopWidth: '0px',
                        borderRightWidth: '0px',
                        borderBottomWidth: '0px',
                        borderLeftWidth: '0px'
                    }, true);
                }
            }
            mainData.rowCount = rowCount + (caption ? 1 : 0);
            mainData.columnCount = columnCount;
            node.data(TABLE, 'mainData', mainData);
            return undefined;
        }
    }

    const $lib$d = squared.lib;
    const { isLength: isLength$6 } = $lib$d.css;
    const { convertFloat: convertFloat$5 } = $lib$d.util;
    class VerticalAlign extends ExtensionUI {
        is(node) {
            return node.length > 0;
        }
        condition(node) {
            let valid = false;
            let inlineVertical = 0;
            let sameValue = 0;
            const children = node.children;
            const length = children.length;
            let i = 0;
            while (i < length) {
                const item = children[i++];
                if (!(item.positionStatic || item.positionRelative && item.length)) {
                    return false;
                }
                else if (item.inlineVertical) {
                    const value = convertFloat$5(item.verticalAlign);
                    if (value !== 0) {
                        valid = true;
                    }
                    if (!isNaN(sameValue)) {
                        if (sameValue === 0) {
                            sameValue = value;
                        }
                        else if (sameValue !== value) {
                            sameValue = NaN;
                        }
                    }
                    inlineVertical++;
                }
                else {
                    sameValue = NaN;
                }
            }
            return valid && isNaN(sameValue) && inlineVertical > 1 && NodeUI.linearData(node.children).linearX;
        }
        processNode(node) {
            node.each((item) => {
                if (item.inlineVertical && isLength$6(item.verticalAlign) || item.imageElement || item.svgElement) {
                    item.baselineAltered = true;
                }
            });
            return { subscribe: true };
        }
        postConstraints(node) {
            if (node.layoutHorizontal) {
                for (const children of (node.horizontalRows || [node.renderChildren])) {
                    const aboveBaseline = [];
                    let minTop = Number.POSITIVE_INFINITY;
                    let baseline;
                    children.forEach(item => {
                        const top = item.linear.top;
                        if (item.inlineVertical && top <= minTop) {
                            if (top < minTop) {
                                aboveBaseline.length = 0;
                            }
                            aboveBaseline.push(item);
                            minTop = top;
                        }
                        if (item.baselineActive) {
                            baseline = item;
                        }
                    });
                    if (aboveBaseline.length) {
                        const above = aboveBaseline[0];
                        const top = above.linear.top;
                        children.forEach(item => {
                            if (item !== baseline) {
                                if (item.inlineVertical) {
                                    if (!aboveBaseline.includes(item)) {
                                        if (isLength$6(item.verticalAlign) || !baseline) {
                                            item.setBox(2 /* MARGIN_TOP */, { reset: 1, adjustment: item.linear.top - top });
                                            item.baselineAltered = true;
                                        }
                                    }
                                    else if (baseline && (item.imageElement || item.svgElement) && baseline.documentId === item.alignSibling('baseline')) {
                                        item.setBox(2 /* MARGIN_TOP */, { reset: 1, adjustment: baseline.linear.top - item.linear.top });
                                    }
                                }
                                if (item.baselineAltered) {
                                    item.setCacheValue('verticalAlign', '0px');
                                }
                            }
                        });
                        if (baseline) {
                            baseline.setBox(2 /* MARGIN_TOP */, { reset: 1, adjustment: baseline.linear.top - top + Math.min(0, above.parseHeight(above.cssInitial('verticalAlign'))) });
                            baseline.baselineAltered = true;
                        }
                    }
                }
            }
            else {
                node.each((item) => item.baselineAltered = false);
            }
        }
    }

    var _a;
    const $lib$e = squared.lib;
    const { formatPX: formatPX$6 } = $lib$e.css;
    const { maxArray: maxArray$2 } = $lib$e.math;
    const { getElementCache: getElementCache$4 } = $lib$e.session;
    const { iterateReverseArray } = $lib$e.util;
    const DOCTYPE_HTML = ((_a = document.doctype) === null || _a === void 0 ? void 0 : _a.name) === 'html';
    const COLLAPSE_TOP = ['marginTop', 'borderTopWidth', 'paddingTop', 2 /* MARGIN_TOP */];
    const COLLAPSE_BOTTOM = ['marginBottom', 'borderBottomWidth', 'paddingBottom', 8 /* MARGIN_BOTTOM */];
    function setSpacingOffset(node, region, value, adjustment = 0) {
        let offset;
        switch (region) {
            case 2 /* MARGIN_TOP */:
                offset = node.actualRect('top') - value;
                break;
            case 16 /* MARGIN_LEFT */:
                offset = node.actualRect('left') - value;
                break;
            case 8 /* MARGIN_BOTTOM */:
                offset = value - node.actualRect('bottom');
                break;
            default:
                offset = 0;
                break;
        }
        offset -= adjustment;
        if (offset > 0) {
            (node.renderAs || node).modifyBox(region, offset);
        }
    }
    function applyMarginCollapse(node, child, direction) {
        if (!direction || isBlockElement(child, true)) {
            const [marginName, borderWidth, paddingName, region] = direction ? COLLAPSE_TOP : COLLAPSE_BOTTOM;
            if (node[borderWidth] === 0) {
                if (node[paddingName] === 0) {
                    let target = child;
                    while (DOCTYPE_HTML && target[marginName] === 0 && target[borderWidth] === 0 && target[paddingName] === 0 && canResetChild(target)) {
                        if (direction) {
                            const endChild = target.firstStaticChild;
                            if (isBlockElement(endChild, direction)) {
                                target = endChild;
                            }
                            else {
                                break;
                            }
                        }
                        else {
                            const endChild = getBottomChild(target);
                            if (endChild) {
                                target = endChild;
                            }
                            else {
                                break;
                            }
                        }
                    }
                    const offsetParent = node[marginName];
                    const offsetChild = target[marginName];
                    const adjustRegion = (item, adjustment) => {
                        if (item.getBox(region)[0] === 1) {
                            const registered = item.registerBox(region);
                            if (registered) {
                                const [reset, value] = registered.getBox(region);
                                adjustment = Math.max(value, adjustment);
                                if (reset === 1) {
                                    registered.setBox(region, { adjustment });
                                }
                                else {
                                    registered.setCacheValue('marginTop', adjustment);
                                }
                                return;
                            }
                        }
                        item.setBox(region, { reset: 1, adjustment });
                    };
                    if (offsetParent >= 0 && offsetChild >= 0) {
                        const height = target.bounds.height;
                        let resetChild = false;
                        if (!DOCTYPE_HTML && offsetParent === 0 && offsetChild > 0 && target.cssInitial(marginName) === '') {
                            resetChild = true;
                        }
                        else {
                            const outside = offsetParent >= offsetChild;
                            if (height === 0 && outside && target.textEmpty && target.extensions.length === 0) {
                                target.hide({ collapse: true });
                            }
                            else {
                                const registered = target.registerBox(region);
                                if (registered) {
                                    const value = registered.getBox(region)[1];
                                    if (value > 0) {
                                        if (value > offsetParent) {
                                            adjustRegion(node, value);
                                        }
                                        registered.setBox(region, { reset: 1, adjustment: 0 });
                                    }
                                }
                                else if (target.getBox(region)[0] === 0) {
                                    if (outside) {
                                        resetChild = offsetChild > 0;
                                    }
                                    else if (node.documentBody) {
                                        resetBox(node, region);
                                        if (direction) {
                                            if (node.bounds.top > 0) {
                                                node.bounds.top = 0;
                                                node.unset('box');
                                                node.unset('linear');
                                            }
                                            if (node.layoutVertical) {
                                                const firstChild = node.renderChildren[0];
                                                if ((target.positionStatic || target.top >= 0 && !target.hasPX('bottom')) && firstChild !== child.outerMostWrapper) {
                                                    adjustRegion(firstChild, offsetChild);
                                                    adjustRegion(target, 0);
                                                    resetChild = true;
                                                }
                                            }
                                        }
                                    }
                                    else {
                                        adjustRegion(node, offsetChild);
                                        resetChild = true;
                                    }
                                }
                            }
                        }
                        if (resetChild) {
                            resetBox(target, region);
                            if (!direction && target.floating) {
                                const bounds = target.bounds;
                                target.actualParent.naturalChildren.forEach(item => {
                                    if (item.floating && item !== target && item.intersectY(bounds, 'bounds')) {
                                        resetBox(item, region);
                                    }
                                });
                            }
                            if (height === 0 && !target.every(item => item.floating || !item.pageFlow)) {
                                resetBox(target, direction ? 8 /* MARGIN_BOTTOM */ : 2 /* MARGIN_TOP */);
                            }
                        }
                    }
                    else if (offsetParent < 0 && offsetChild < 0) {
                        if (!direction) {
                            if (offsetChild < offsetParent) {
                                adjustRegion(node, offsetChild);
                            }
                            resetBox(target, region);
                        }
                    }
                }
                else if (child[marginName] === 0 && child[borderWidth] === 0 && canResetChild(child)) {
                    let blockAll = true;
                    do {
                        const endChild = (direction ? child.firstStaticChild : child.lastStaticChild);
                        if (endChild && endChild[marginName] === 0 && endChild[borderWidth] === 0 && !endChild.visibleStyle.background && canResetChild(endChild)) {
                            const value = endChild[paddingName];
                            if (value > 0) {
                                if (value >= node[paddingName]) {
                                    node.setBox(direction ? 32 /* PADDING_TOP */ : 128 /* PADDING_BOTTOM */, { reset: 1 });
                                }
                                else if (blockAll) {
                                    node.modifyBox(direction ? 32 /* PADDING_TOP */ : 128 /* PADDING_BOTTOM */, -value, false);
                                }
                                break;
                            }
                            else {
                                if (!isBlockElement(endChild, direction)) {
                                    blockAll = false;
                                }
                                child = endChild;
                            }
                        }
                        else {
                            break;
                        }
                    } while (true);
                }
            }
        }
    }
    function isBlockElement(node, direction) {
        if (node === null || !node.styleElement || node.lineBreak) {
            return false;
        }
        else if (node.blockStatic) {
            return true;
        }
        else if (!node.floating) {
            switch (node.display) {
                case 'table':
                case 'list-item':
                    return true;
            }
            if (direction !== undefined) {
                if (direction) {
                    const firstChild = node.firstStaticChild;
                    return isBlockElement(firstChild) && validAboveChild(firstChild, false);
                }
                else {
                    const lastChild = node.lastStaticChild;
                    return isBlockElement(lastChild) && validBelowChild(lastChild, false);
                }
            }
        }
        return false;
    }
    function getMarginOffset(below, above, lineHeight, aboveLineBreak) {
        let top = Number.POSITIVE_INFINITY;
        if (below.nodeGroup && below.some(item => item.floating)) {
            below.renderChildren.forEach((item) => {
                if (!item.floating) {
                    const topA = item.linear.top;
                    if (topA < top) {
                        top = topA;
                        below = item;
                    }
                }
            });
        }
        if (top === Number.POSITIVE_INFINITY) {
            top = below.linear.top;
        }
        if (aboveLineBreak) {
            const bottom = Math.max(aboveLineBreak.linear.top, above.linear.bottom);
            if (bottom < top) {
                return [top - bottom - lineHeight, below];
            }
        }
        return [Math.round(top - above.linear.bottom - lineHeight), below];
    }
    function getBottomChild(node) {
        let bottomChild;
        if (!node.floatContainer) {
            bottomChild = node.lastStaticChild;
            if (!isBlockElement(node, false) || node.hasHeight && Math.floor(bottomChild.linear.bottom) < node.box.bottom) {
                bottomChild = undefined;
            }
        }
        else {
            let bottomFloatChild;
            const children = node.naturalChildren;
            let j = children.length - 1;
            while (j >= 0) {
                const item = children[j--];
                if (item.floating) {
                    if (!bottomChild) {
                        const bottom = item.linear.bottom;
                        if (bottomFloatChild) {
                            if (bottom > bottomFloatChild.linear.bottom) {
                                bottomFloatChild = item;
                            }
                        }
                        else if (Math.ceil(item.linear.bottom) >= node.box.bottom) {
                            bottomFloatChild = item;
                        }
                    }
                    else if (item.linear.bottom >= bottomChild.linear.bottom) {
                        bottomChild = item;
                        break;
                    }
                }
                else if (!bottomChild) {
                    if (bottomFloatChild && bottomFloatChild.linear.bottom > item.linear.bottom) {
                        bottomChild = bottomFloatChild;
                        break;
                    }
                    bottomChild = item;
                }
            }
            if (!bottomChild) {
                bottomChild = bottomFloatChild;
            }
        }
        return bottomChild;
    }
    function isVerticalOverflow(node) {
        for (const value of [node.cssInitial('overflowX'), node.cssInitial('overflowY')]) {
            switch (value) {
                case 'auto':
                case 'hidden':
                case 'overlay':
                    return true;
            }
        }
        return false;
    }
    function resetBox(node, region, register) {
        node.setBox(region, { reset: 1 });
        if (register) {
            node.registerBox(region, register);
        }
    }
    const setMinHeight = (node, offset) => node.css('minHeight', formatPX$6(Math.max(offset, node.hasPX('minHeight', false) ? node.parseHeight(node.css('minHeight')) : 0)));
    const canResetChild = (node, children = true) => (!children && node.blockStatic || children && node.length > 0 && !node.floating) && !node.layoutElement && !node.tableElement && node.tagName !== 'FIELDSET';
    const validAboveChild = (node, children) => !node.hasHeight && node.borderBottomWidth === 0 && node.paddingBottom === 0 && canResetChild(node, children);
    const validBelowChild = (node, children) => !node.hasHeight && node.borderTopWidth === 0 && node.paddingTop === 0 && canResetChild(node, children);
    class WhiteSpace extends ExtensionUI {
        afterBaseLayout() {
            const application = this.application;
            const processed = new Set();
            const clearMap = application.session.clearMap;
            this.cacheProcessing.each(node => {
                var _a, _b;
                if (node.naturalElement && !node.hasAlign(4 /* AUTO_LAYOUT */)) {
                    const children = node.naturalChildren;
                    const length = children.length;
                    if (length === 0) {
                        return;
                    }
                    const pageFlow = node.pageFlow;
                    const collapseMargin = pageFlow && isBlockElement(node, true) && !node.actualParent.layoutElement;
                    let firstChild;
                    let lastChild;
                    for (let i = 0; i < length; ++i) {
                        const current = children[i];
                        if (current.pageFlow) {
                            if (collapseMargin) {
                                if (!current.floating) {
                                    if (!firstChild) {
                                        firstChild = current;
                                    }
                                    lastChild = current;
                                }
                                else {
                                    if (lastChild) {
                                        if (current.linear.bottom >= lastChild.linear.bottom) {
                                            lastChild = current;
                                        }
                                    }
                                    else {
                                        lastChild = current;
                                    }
                                }
                            }
                            if (isBlockElement(current, true)) {
                                if (i > 0) {
                                    const previousSiblings = current.previousSiblings({ floating: false });
                                    const q = previousSiblings.length;
                                    if (q) {
                                        let inheritedTop = false;
                                        const previous = previousSiblings[q - 1];
                                        if (isBlockElement(previous, false)) {
                                            let marginBottom = previous.marginBottom;
                                            let marginTop = current.marginTop;
                                            if (previous.marginTop < 0 && previous.bounds.height === 0) {
                                                const offset = Math.min(marginBottom, previous.marginTop);
                                                if (offset < 0) {
                                                    if (Math.abs(offset) < marginTop) {
                                                        current.modifyBox(2 /* MARGIN_TOP */, offset);
                                                    }
                                                    else {
                                                        resetBox(current, 2 /* MARGIN_TOP */);
                                                    }
                                                    processed.add(previous.id);
                                                    previous.hide({ collapse: true });
                                                    continue;
                                                }
                                            }
                                            else if (current.marginBottom < 0 && current.bounds.height === 0) {
                                                const offset = Math.min(marginTop, current.marginBottom);
                                                if (offset < 0) {
                                                    if (Math.abs(offset) < marginBottom) {
                                                        previous.modifyBox(8 /* MARGIN_BOTTOM */, offset);
                                                    }
                                                    else {
                                                        resetBox(previous, 8 /* MARGIN_BOTTOM */);
                                                    }
                                                    processed.add(current.id);
                                                    current.hide({ collapse: true });
                                                    continue;
                                                }
                                            }
                                            let inheritedBottom = false;
                                            let inherit = previous;
                                            while (validAboveChild(inherit, true)) {
                                                let bottomChild = getBottomChild(inherit);
                                                if ((bottomChild === null || bottomChild === void 0 ? void 0 : bottomChild.getBox(8 /* MARGIN_BOTTOM */)[0]) === 0) {
                                                    let childBottom = bottomChild.marginBottom;
                                                    let currentChild = bottomChild;
                                                    while (currentChild.bounds.height === 0 && !currentChild.pseudoElement) {
                                                        const currentTop = currentChild.marginTop;
                                                        childBottom = Math.max(currentTop, currentChild.marginBottom, childBottom);
                                                        if (currentTop !== 0) {
                                                            resetBox(currentChild, 2 /* MARGIN_TOP */);
                                                        }
                                                        const sibling = currentChild.previousSibling;
                                                        if (sibling) {
                                                            if (sibling.marginBottom >= childBottom) {
                                                                if (currentChild.marginBottom !== 0) {
                                                                    resetBox(currentChild, 8 /* MARGIN_BOTTOM */);
                                                                }
                                                                bottomChild = sibling;
                                                                childBottom = sibling.marginBottom;
                                                                currentChild = sibling;
                                                            }
                                                            else if (sibling.bounds.height > 0) {
                                                                break;
                                                            }
                                                            else {
                                                                if (sibling.marginBottom !== 0) {
                                                                    resetBox(sibling, 8 /* MARGIN_BOTTOM */);
                                                                }
                                                                currentChild = sibling;
                                                            }
                                                        }
                                                        else {
                                                            break;
                                                        }
                                                    }
                                                    if (childBottom !== 0) {
                                                        resetBox(bottomChild, 8 /* MARGIN_BOTTOM */, previous.getBox(8 /* MARGIN_BOTTOM */)[0] === 0 ? previous : undefined);
                                                    }
                                                    if (childBottom > marginBottom) {
                                                        marginBottom = childBottom;
                                                        inheritedBottom = true;
                                                    }
                                                    else if (childBottom === 0 && marginBottom === 0) {
                                                        inherit = bottomChild;
                                                        continue;
                                                    }
                                                }
                                                break;
                                            }
                                            inherit = current;
                                            while (validBelowChild(inherit, true)) {
                                                let topChild = inherit.firstStaticChild;
                                                if (isBlockElement(topChild, true) && topChild.getBox(2 /* MARGIN_TOP */)[0] === 0) {
                                                    let childTop = topChild.marginTop;
                                                    let currentChild = topChild;
                                                    while (currentChild.bounds.height === 0 && !currentChild.pseudoElement) {
                                                        const currentBottom = currentChild.marginBottom;
                                                        childTop = Math.max(currentChild.marginTop, currentBottom, childTop);
                                                        if (currentBottom !== 0) {
                                                            resetBox(currentChild, 8 /* MARGIN_BOTTOM */);
                                                        }
                                                        const sibling = currentChild.nextSibling;
                                                        if (sibling) {
                                                            if (sibling.marginTop >= childTop) {
                                                                if (currentChild.marginTop !== 0) {
                                                                    resetBox(currentChild, 2 /* MARGIN_TOP */);
                                                                }
                                                                topChild = sibling;
                                                                childTop = sibling.marginTop;
                                                                currentChild = sibling;
                                                            }
                                                            else if (sibling.bounds.height > 0) {
                                                                break;
                                                            }
                                                            else {
                                                                if (sibling.marginTop !== 0) {
                                                                    resetBox(sibling, 2 /* MARGIN_TOP */);
                                                                }
                                                                currentChild = sibling;
                                                            }
                                                        }
                                                        else {
                                                            break;
                                                        }
                                                    }
                                                    if (childTop !== 0) {
                                                        resetBox(topChild, 2 /* MARGIN_TOP */, current.getBox(2 /* MARGIN_TOP */)[0] === 0 ? current : undefined);
                                                    }
                                                    if (childTop > marginTop) {
                                                        marginTop = childTop;
                                                        inheritedTop = true;
                                                    }
                                                    else if (childTop === 0 && marginTop === 0) {
                                                        inherit = topChild;
                                                        continue;
                                                    }
                                                }
                                                break;
                                            }
                                            if (marginBottom > 0) {
                                                if (marginTop > 0) {
                                                    if (marginTop <= marginBottom) {
                                                        if (!inheritedTop || !isVerticalOverflow(current)) {
                                                            resetBox(current, 2 /* MARGIN_TOP */);
                                                            if (current.bounds.height === 0 && marginBottom >= current.marginBottom) {
                                                                resetBox(current, 8 /* MARGIN_BOTTOM */);
                                                            }
                                                            inheritedTop = false;
                                                        }
                                                    }
                                                    else {
                                                        if (!inheritedBottom || !isVerticalOverflow(previous)) {
                                                            resetBox(previous, 8 /* MARGIN_BOTTOM */);
                                                            if (previous.bounds.height === 0 && marginTop >= previous.marginTop) {
                                                                resetBox(previous, 2 /* MARGIN_TOP */);
                                                            }
                                                            inheritedBottom = false;
                                                        }
                                                    }
                                                }
                                                else if (current.bounds.height === 0) {
                                                    marginTop = Math.min(marginTop, current.marginBottom);
                                                    if (marginTop < 0) {
                                                        previous.modifyBox(8 /* MARGIN_BOTTOM */, marginTop);
                                                        current.hide({ collapse: true });
                                                    }
                                                }
                                            }
                                            if (marginTop > 0 && previous.floatContainer && current.getBox(2 /* MARGIN_TOP */)[1] === 0 && !isVerticalOverflow(previous)) {
                                                let valid = false;
                                                if (previous.bounds.height === 0) {
                                                    valid = true;
                                                }
                                                else {
                                                    let float;
                                                    iterateReverseArray(previous.naturalElements, (item) => {
                                                        if (clearMap.has(item)) {
                                                            return true;
                                                        }
                                                        else if (item.floating) {
                                                            if (item.linear.bottom > Math.ceil(previous.bounds.bottom)) {
                                                                float = item.float;
                                                            }
                                                            return true;
                                                        }
                                                        return;
                                                    });
                                                    if (float) {
                                                        const clear = (_a = getElementCache$4(previous.element, 'styleMap::after', previous.sessionId)) === null || _a === void 0 ? void 0 : _a.clear;
                                                        valid = !(clear === 'both' || clear === float);
                                                    }
                                                }
                                                if (valid) {
                                                    current.modifyBox(2 /* MARGIN_TOP */, previous.box.top - maxArray$2(previous.naturalElements.map(item => item.linear.bottom)), false);
                                                }
                                            }
                                            if (inheritedTop) {
                                                let adjacentBottom = 0;
                                                if (previous.bounds.height === 0) {
                                                    const previousSibling = previous.previousSibling;
                                                    adjacentBottom = previousSibling && isBlockElement(previousSibling, false) ? Math.max(previousSibling.getBox(8 /* MARGIN_BOTTOM */)[1], previousSibling.marginBottom) : 0;
                                                }
                                                if (marginTop > adjacentBottom) {
                                                    (current.registerBox(2 /* MARGIN_TOP */) || current).setCacheValue('marginTop', marginTop);
                                                }
                                            }
                                            if (inheritedBottom) {
                                                let adjacentTop = 0;
                                                if (current.bounds.height === 0) {
                                                    const nextSibling = current.nextSibling;
                                                    adjacentTop = nextSibling && isBlockElement(nextSibling, true) ? Math.max(nextSibling.getBox(2 /* MARGIN_TOP */)[1], nextSibling.marginTop) : 0;
                                                }
                                                if (marginBottom >= adjacentTop) {
                                                    (previous.registerBox(8 /* MARGIN_BOTTOM */) || previous).setCacheValue('marginBottom', marginBottom);
                                                }
                                            }
                                        }
                                        else if (current.bounds.height === 0) {
                                            const { marginTop, marginBottom } = current;
                                            if (marginTop > 0 && marginBottom > 0) {
                                                if (marginTop < marginBottom) {
                                                    resetBox(current, 2 /* MARGIN_TOP */);
                                                }
                                                else {
                                                    if (i === length - 1) {
                                                        current.setCacheValue('marginBottom', marginTop);
                                                        resetBox(current, 2 /* MARGIN_TOP */);
                                                    }
                                                    else {
                                                        resetBox(current, 8 /* MARGIN_BOTTOM */);
                                                    }
                                                }
                                            }
                                        }
                                        if (!inheritedTop && current !== firstChild && previousSiblings.length > 1 && (node.layoutVertical || ((_b = current.renderParent) === null || _b === void 0 ? void 0 : _b.layoutVertical))) {
                                            const previousSibling = previousSiblings.pop();
                                            if (previousSibling.floating && Math.floor(previousSibling.bounds.top) === Math.floor(current.bounds.top)) {
                                                current.modifyBox(2 /* MARGIN_TOP */, -previousSibling.bounds.height, false);
                                            }
                                        }
                                    }
                                }
                                else if (current.bounds.height === 0) {
                                    const { marginTop, marginBottom } = current;
                                    if (marginTop > 0 && marginBottom > 0) {
                                        if (marginTop < marginBottom) {
                                            current.setCacheValue('marginTop', marginBottom);
                                        }
                                        resetBox(current, 8 /* MARGIN_BOTTOM */);
                                    }
                                }
                            }
                        }
                    }
                    if (pageFlow && !isVerticalOverflow(node) && node.tagName !== 'FIELDSET') {
                        if (firstChild === null || firstChild === void 0 ? void 0 : firstChild.naturalElement) {
                            applyMarginCollapse(node, firstChild, true);
                        }
                        if (lastChild === null || lastChild === void 0 ? void 0 : lastChild.naturalElement) {
                            applyMarginCollapse(node, lastChild, false);
                            if (lastChild.marginTop < 0) {
                                const offset = lastChild.bounds.height + lastChild.marginBottom + lastChild.marginTop;
                                if (offset < 0) {
                                    node.modifyBox(128 /* PADDING_BOTTOM */, offset, false);
                                }
                            }
                        }
                    }
                }
            });
            application.processing.excluded.each(node => {
                if (node.lineBreak && !node.lineBreakTrailing && !clearMap.has(node) && !processed.has(node.id)) {
                    let valid = false;
                    const previousSiblings = node.previousSiblings({ floating: false });
                    if (previousSiblings.length) {
                        const actualParent = node.actualParent;
                        const nextSiblings = node.nextSiblings();
                        if (nextSiblings.length) {
                            let above = previousSiblings.pop();
                            let below = nextSiblings.pop();
                            let lineHeight = 0;
                            let aboveLineBreak;
                            let offset;
                            if (above.rendered && below.rendered) {
                                const inline = above.inlineStatic && below.inlineStatic;
                                if (inline && previousSiblings.length === 0) {
                                    processed.add(node.id);
                                    return;
                                }
                                if (!above.multiline && above.has('lineHeight')) {
                                    const aboveOffset = Math.floor((above.lineHeight - above.bounds.height) / 2);
                                    if (aboveOffset > 0) {
                                        lineHeight += aboveOffset;
                                    }
                                }
                                if (!below.multiline && below.has('lineHeight')) {
                                    const belowOffset = Math.round((below.lineHeight - below.bounds.height) / 2);
                                    if (belowOffset > 0) {
                                        lineHeight += belowOffset;
                                    }
                                }
                                if (inline) {
                                    aboveLineBreak = previousSiblings[0];
                                    if (previousSiblings.length === 1) {
                                        aboveLineBreak = aboveLineBreak.lineBreak ? node : undefined;
                                    }
                                    aboveLineBreak === null || aboveLineBreak === void 0 ? void 0 : aboveLineBreak.setBounds(false);
                                }
                                let aboveParent = above.renderParent;
                                let belowParent = below.renderParent;
                                if (aboveParent !== belowParent) {
                                    while (aboveParent && aboveParent !== actualParent) {
                                        above = aboveParent;
                                        aboveParent = above.renderParent;
                                    }
                                    while (belowParent && belowParent !== actualParent) {
                                        below = belowParent;
                                        belowParent = below.renderParent;
                                    }
                                }
                                [offset, below] = getMarginOffset(below, above, lineHeight, aboveLineBreak);
                                if (offset >= 1) {
                                    if (below.visible) {
                                        below.modifyBox(2 /* MARGIN_TOP */, offset);
                                        valid = true;
                                    }
                                    else if (above.visible) {
                                        above.modifyBox(8 /* MARGIN_BOTTOM */, offset);
                                        valid = true;
                                    }
                                }
                            }
                            else {
                                [offset, below] = getMarginOffset(below, above, lineHeight);
                                if (offset >= 1) {
                                    if ((below.lineBreak || below.excluded) && actualParent.lastChild === below) {
                                        actualParent.modifyBox(128 /* PADDING_BOTTOM */, offset);
                                        valid = true;
                                    }
                                    else if ((above.lineBreak || above.excluded) && actualParent.firstChild === above) {
                                        actualParent.modifyBox(32 /* PADDING_TOP */, offset);
                                        valid = true;
                                    }
                                }
                            }
                        }
                        else if (actualParent.visible && !actualParent.preserveWhiteSpace && actualParent.tagName !== 'CODE') {
                            if (!actualParent.originalRoot) {
                                const previousStart = previousSiblings[previousSiblings.length - 1];
                                const rect = previousStart.bounds.height === 0 && previousStart.length ? NodeUI.outerRegion(previousStart) : previousStart.linear;
                                const offset = actualParent.box.bottom - (previousStart.lineBreak || previousStart.excluded ? rect.top : rect.bottom);
                                if (offset !== 0) {
                                    if (previousStart.rendered || actualParent.visibleStyle.background) {
                                        actualParent.modifyBox(128 /* PADDING_BOTTOM */, offset);
                                    }
                                    else if (!actualParent.hasHeight) {
                                        setMinHeight(actualParent, offset);
                                    }
                                }
                            }
                            else if (nextSiblings.length) {
                                const nextStart = nextSiblings[nextSiblings.length - 1];
                                const offset = (nextStart.lineBreak || nextStart.excluded ? nextStart.linear.bottom : nextStart.linear.top) - actualParent.box.top;
                                if (offset !== 0) {
                                    if (nextStart.rendered || actualParent.visibleStyle.background) {
                                        actualParent.modifyBox(32 /* PADDING_TOP */, offset);
                                    }
                                    else if (!actualParent.hasHeight) {
                                        setMinHeight(actualParent, offset);
                                    }
                                }
                            }
                            valid = true;
                        }
                        if (valid) {
                            previousSiblings.forEach(item => processed.add(item.id));
                            nextSiblings.forEach(item => processed.add(item.id));
                        }
                    }
                }
            });
        }
        afterConstraints() {
            this.cacheProcessing.each(node => {
                if (node.naturalChild && node.styleElement && node.inlineVertical && node.pageFlow && !node.positioned && !node.actualParent.layoutElement) {
                    const outerWrapper = node.outerMostWrapper;
                    const renderParent = outerWrapper.renderParent;
                    if ((renderParent === null || renderParent === void 0 ? void 0 : renderParent.hasAlign(4 /* AUTO_LAYOUT */)) === false) {
                        if (node.blockDimension && !node.floating) {
                            if (renderParent.layoutVertical) {
                                const children = renderParent.renderChildren;
                                const index = children.findIndex(item => item === outerWrapper);
                                if (index !== -1) {
                                    if (!node.lineBreakLeading && !node.baselineAltered) {
                                        const previous = children[index - 1];
                                        if (previous === null || previous === void 0 ? void 0 : previous.pageFlow) {
                                            setSpacingOffset(outerWrapper, 2 /* MARGIN_TOP */, previous.actualRect('bottom'), previous.getBox(8 /* MARGIN_BOTTOM */)[1]);
                                        }
                                    }
                                    if (!node.lineBreakTrailing) {
                                        const next = children[index + 1];
                                        if ((next === null || next === void 0 ? void 0 : next.pageFlow) && next.styleElement && !next.inlineVertical) {
                                            setSpacingOffset(outerWrapper, 8 /* MARGIN_BOTTOM */, next.actualRect('top'), next.getBox(2 /* MARGIN_TOP */)[1]);
                                        }
                                    }
                                }
                            }
                            else if (!node.baselineAltered) {
                                const horizontalRows = renderParent.horizontalRows;
                                const validSibling = (item) => item.pageFlow && item.blockDimension && !item.floating;
                                let horizontal;
                                if (horizontalRows && horizontalRows.length > 1) {
                                    found: {
                                        let maxBottom = Number.NEGATIVE_INFINITY;
                                        const length = horizontalRows.length;
                                        for (let i = 0; i < length; ++i) {
                                            const row = horizontalRows[i];
                                            const q = row.length;
                                            let j = 0;
                                            while (j < q) {
                                                if (outerWrapper === row[j++]) {
                                                    if (i > 0) {
                                                        setSpacingOffset(outerWrapper, 2 /* MARGIN_TOP */, maxBottom);
                                                    }
                                                    else {
                                                        horizontal = row;
                                                    }
                                                    break found;
                                                }
                                            }
                                            row.forEach((item) => {
                                                const innerWrapped = item.innerMostWrapped;
                                                if (validSibling(innerWrapped)) {
                                                    maxBottom = Math.max(innerWrapped.actualRect('bottom'), maxBottom);
                                                }
                                            });
                                            if (maxBottom === Number.NEGATIVE_INFINITY) {
                                                break;
                                            }
                                        }
                                    }
                                }
                                else if (renderParent.layoutHorizontal || renderParent.hasAlign(1024 /* INLINE */)) {
                                    horizontal = renderParent.renderChildren;
                                }
                                if (horizontal) {
                                    let actualChildren = [];
                                    horizontal.forEach(item => {
                                        if (item.nodeGroup) {
                                            actualChildren = actualChildren.concat(item.cascade(child => child.naturalChild));
                                        }
                                        else if (item.innerWrapped) {
                                            actualChildren.push(item.innerMostWrapped);
                                        }
                                        else {
                                            actualChildren.push(item);
                                        }
                                    });
                                    let maxBottom = Number.NEGATIVE_INFINITY;
                                    const parent = node.actualParent;
                                    const top = node.actualRect('top');
                                    const naturalChildren = parent.naturalChildren;
                                    const length = naturalChildren.length;
                                    let i = 0;
                                    while (i < length) {
                                        const item = naturalChildren[i++];
                                        if (actualChildren.includes(item)) {
                                            break;
                                        }
                                        else if (item.lineBreak || item.block) {
                                            maxBottom = Number.NEGATIVE_INFINITY;
                                        }
                                        else if (item.excluded) {
                                            continue;
                                        }
                                        else if (validSibling(item)) {
                                            maxBottom = Math.max(item.actualRect('bottom'), maxBottom);
                                        }
                                    }
                                    if (maxBottom !== Number.NEGATIVE_INFINITY && top > maxBottom) {
                                        setSpacingOffset(outerWrapper, 2 /* MARGIN_TOP */, maxBottom);
                                    }
                                }
                            }
                        }
                        if (!renderParent.layoutVertical && !outerWrapper.alignParent('left')) {
                            const documentId = outerWrapper.alignSibling('leftRight');
                            if (documentId !== '') {
                                const previousSibling = renderParent.renderChildren.find(item => item.documentId === documentId);
                                if (previousSibling === null || previousSibling === void 0 ? void 0 : previousSibling.inlineVertical) {
                                    setSpacingOffset(outerWrapper, 16 /* MARGIN_LEFT */, previousSibling.actualRect('right'));
                                }
                            }
                            else {
                                let current = node;
                                while (true) {
                                    const siblingsLeading = current.siblingsLeading;
                                    if (siblingsLeading.length && !siblingsLeading.some(item => item.lineBreak || item.excluded && item.blockStatic)) {
                                        const previousSibling = siblingsLeading[0];
                                        if (previousSibling.inlineVertical) {
                                            setSpacingOffset(outerWrapper, 16 /* MARGIN_LEFT */, previousSibling.actualRect('right'));
                                        }
                                        else if (previousSibling.floating) {
                                            current = previousSibling;
                                            continue;
                                        }
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }
                if (node.floatContainer && node.layoutVertical) {
                    const floating = [];
                    node.naturalChildren.forEach((item) => {
                        if (!item.pageFlow) {
                            return;
                        }
                        if (!item.floating) {
                            if (floating.length) {
                                const outerWrapper = item.outerMostWrapper;
                                let renderParent = outerWrapper.renderParent;
                                if (renderParent) {
                                    const [reset, adjustment] = item.getBox(2 /* MARGIN_TOP */);
                                    const marginTop = (reset === 0 ? item.marginTop : 0) + adjustment;
                                    if (marginTop > 0) {
                                        const top = Math.floor(node.bounds.top);
                                        const length = floating.length;
                                        let i = 0;
                                        while (i < length) {
                                            const previous = floating[i++];
                                            if (top <= Math.floor(previous.bounds.top)) {
                                                let floatingRenderParent = previous.outerMostWrapper.renderParent;
                                                if (floatingRenderParent) {
                                                    renderParent = renderParent.ascend({ error: parent => parent.naturalChild, attr: 'renderParent' }).pop() || renderParent;
                                                    floatingRenderParent = floatingRenderParent.ascend({ error: parent => parent.naturalChild, attr: 'renderParent' }).pop() || floatingRenderParent;
                                                    if (renderParent !== floatingRenderParent) {
                                                        outerWrapper.modifyBox(2 /* MARGIN_TOP */, (floatingRenderParent !== node ? floatingRenderParent : previous).linear.height * -1, false);
                                                    }
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                                floating.length = 0;
                            }
                        }
                        else {
                            floating.push(item);
                        }
                    });
                }
            });
        }
    }

    const extensions = {
        Accessibility,
        Column,
        CssGrid,
        Flexbox,
        Grid,
        List,
        Relative,
        Sprite,
        Table,
        VerticalAlign,
        WhiteSpace
    };
    const lib = {
        constant,
        enumeration
    };

    exports.Application = Application;
    exports.ApplicationUI = ApplicationUI;
    exports.Controller = Controller;
    exports.ControllerUI = ControllerUI;
    exports.Extension = Extension;
    exports.ExtensionManager = ExtensionManager;
    exports.ExtensionUI = ExtensionUI;
    exports.File = File;
    exports.FileUI = FileUI;
    exports.LayoutUI = LayoutUI;
    exports.Node = Node;
    exports.NodeGroupUI = NodeGroupUI;
    exports.NodeList = NodeList;
    exports.NodeUI = NodeUI;
    exports.Resource = Resource;
    exports.ResourceUI = ResourceUI;
    exports.extensions = extensions;
    exports.lib = lib;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
