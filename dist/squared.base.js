/* squared.base 1.4.1
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
        append(node, delegate = true) {
            var _a;
            super.append(node);
            if (delegate) {
                (_a = this.afterAppend) === null || _a === void 0 ? void 0 : _a.call(this, node);
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
    const { CSS: CSS$1, STRING, XML } = $lib.regex;
    const { buildAlphaString, fromLastIndexOf } = $lib.util;
    const getFileName = () => buildAlphaString(5).toLowerCase() + '_' + new Date().getTime();
    class Resource {
        reset() {
            var _a;
            const ASSETS = Resource.ASSETS;
            for (const name in ASSETS) {
                ASSETS[name].clear();
            }
            (_a = this.fileHandler) === null || _a === void 0 ? void 0 : _a.reset();
        }
        addImage(element) {
            var _a, _b;
            if ((_a = element) === null || _a === void 0 ? void 0 : _a.complete) {
                const uri = element.src;
                if (/^data:image\//.test(uri)) {
                    const match = new RegExp(`^${STRING.DATAURI}$`).exec(uri);
                    if (match) {
                        const mimeType = match[1].split(XML.DELIMITER);
                        this.addRawData(uri, mimeType[0].trim(), ((_b = mimeType[1]) === null || _b === void 0 ? void 0 : _b.trim()) || 'base64', match[2], element.naturalWidth, element.naturalHeight);
                    }
                }
                if (uri !== '') {
                    Resource.ASSETS.images.set(uri, { width: element.naturalWidth, height: element.naturalHeight, uri });
                }
            }
        }
        getImage(src) {
            return Resource.ASSETS.images.get(src);
        }
        addFont(data) {
            const fonts = Resource.ASSETS.fonts;
            const fontFamily = data.fontFamily.trim().toLowerCase();
            data.fontFamily = fontFamily;
            const items = fonts.get(fontFamily) || [];
            items.push(data);
            fonts.set(fontFamily, items);
        }
        getFont(fontFamily, fontStyle = 'normal', fontWeight) {
            const font = Resource.ASSETS.fonts.get(fontFamily.trim().toLowerCase());
            if (font) {
                const fontFormat = this.controllerSettings.supported.fontFormat;
                return font.find(item => item.fontStyle === fontStyle && (fontWeight === undefined || item.fontWeight === parseInt(fontWeight)) && (fontFormat === '*' || fontFormat.includes(item.srcFormat)));
            }
            return undefined;
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
            const imageFormat = this.controllerSettings.supported.imageFormat;
            const origin = location.origin;
            const valid = uri.startsWith(origin);
            const pathname = valid ? uri.substring(origin.length + 1, uri.lastIndexOf('/')) : '';
            let filename;
            if (imageFormat === '*') {
                if (valid) {
                    filename = fromLastIndexOf(uri, '/');
                }
                else {
                    let extension = mimeType.split('/').pop();
                    if (extension === 'svg+xml') {
                        extension = 'svg';
                    }
                    filename = getFileName() + '.' + extension;
                }
            }
            else {
                for (const extension of imageFormat) {
                    if (mimeType.includes(extension)) {
                        filename = uri.endsWith('.' + extension) ? fromLastIndexOf(uri, '/') : getFileName() + '.' + extension;
                        break;
                    }
                }
            }
            if (filename) {
                Resource.ASSETS.rawData.set(uri, {
                    pathname,
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
        getRawData(uri) {
            if (/^url\(/.test(uri)) {
                const match = CSS$1.URL.exec(uri);
                if (match) {
                    uri = match[1];
                }
                else {
                    return undefined;
                }
            }
            return Resource.ASSETS.rawData.get(uri);
        }
        setFileHandler(instance) {
            instance.resource = this;
            this.fileHandler = instance;
        }
    }
    Resource.ASSETS = {
        ids: new Map(),
        images: new Map(),
        fonts: new Map(),
        rawData: new Map()
    };

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
    const { getSpecificity, getStyle, hasComputedStyle, insertStyleSheetRule, parseSelectorText, validMediaRule } = $lib$1.css;
    const { isTextNode } = $lib$1.dom;
    const { convertCamelCase, isString, objectMap, resolvePath } = $lib$1.util;
    const { CHAR, FILE, STRING: STRING$1, XML: XML$1 } = $lib$1.regex;
    const { getElementCache, setElementCache } = $lib$1.session;
    const { images, rawData } = Resource.ASSETS;
    const REGEX_MEDIATEXT = /all|screen/;
    const REGEX_BACKGROUND = /^background/;
    const REGEX_IMPORTANT = /\s*([a-z-]+):.*?!important;/g;
    const REGEX_FONTFACE = /\s*@font-face\s*{([^}]+)}\s*/;
    const REGEX_FONTFAMILY = /\s*font-family:[^\w]*([^'";]+)/;
    const REGEX_FONTSRC = /\s*src:\s*([^;]+);/;
    const REGEX_FONTSTYLE = /\s*font-style:\s*(\w+)\s*;/;
    const REGEX_FONTWEIGHT = /\s*font-weight:\s*(\d+)\s*;/;
    const REGEX_URL = /\s*(url|local)\((?:['""]([^'")]+)['"]|([^)]+))\)(?:\s*format\(['"]?([\w-]+)['"]?\))?\s*/;
    const REGEX_DATAURI = new RegExp(`(url\\("(${STRING$1.DATAURI})"\\)),?\\s*`, 'g');
    function addImageSrc(uri, width = 0, height = 0) {
        const image = images.get(uri);
        if (image === undefined || width > 0 && height > 0 || image.width === 0 || image.height === 0) {
            images.set(uri, { width, height, uri });
        }
    }
    function parseSrcSet(value) {
        if (value !== '') {
            for (const uri of value.split(XML$1.SEPARATOR)) {
                if (uri !== '') {
                    addImageSrc(resolvePath(uri.split(CHAR.SPACE)[0].trim()));
                }
            }
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
            this.Node = nodeConstructor;
            const cache = this.processing.cache;
            this._cache = cache;
            const controllerHandler = new ControllerConstructor(this, cache);
            this._controllerHandler = controllerHandler;
            this._resourceHandler = new ResourceConstructor(this, cache);
            this._extensionManager = new ExtensionManagerConstructor(this, cache);
            this._nodeAfterInsert = controllerHandler.afterInsertNode;
        }
        copyToDisk(directory, callback, assets) {
            var _a;
            (_a = this.fileHandler) === null || _a === void 0 ? void 0 : _a.copyToDisk(directory, assets, callback);
        }
        appendToArchive(pathname, assets) {
            var _a;
            (_a = this.fileHandler) === null || _a === void 0 ? void 0 : _a.appendToArchive(pathname, assets);
        }
        saveToArchive(filename, assets) {
            var _a;
            (_a = this.fileHandler) === null || _a === void 0 ? void 0 : _a.saveToArchive(filename || this.userSettings.outputArchiveName, assets);
        }
        reset() {
            const processing = this.processing;
            processing.cache.reset();
            processing.excluded.clear();
            processing.sessionId = '';
            this.session.active.length = 0;
            this.controllerHandler.reset();
            for (const ext of this.extensions) {
                ext.subscribers.clear();
            }
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
            const styleElement = insertStyleSheetRule(`html > body { overflow: hidden !important; }`);
            let THEN;
            const resume = () => {
                this.initializing = false;
                for (const image of preloaded) {
                    if (image.parentElement) {
                        documentRoot.removeChild(image);
                    }
                }
                preloaded.length = 0;
                for (const ext of this.extensions) {
                    ext.beforeParseDocument();
                }
                for (const element of this.rootElements) {
                    if (this.createCache(element)) {
                        this.afterCreateCache(element);
                    }
                }
                for (const ext of this.extensions) {
                    ext.afterParseDocument();
                }
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
            for (const value of elements) {
                let element;
                if (typeof value === 'string') {
                    element = document.getElementById(value);
                }
                else if (hasComputedStyle(value)) {
                    element = value;
                }
                else {
                    continue;
                }
                if (element) {
                    this.rootElements.add(element);
                }
            }
            const documentRoot = this.rootElements.values().next().value;
            if (preloadImages) {
                for (const element of this.rootElements) {
                    element.querySelectorAll('picture > source').forEach((source) => parseSrcSet(source.srcset));
                    element.querySelectorAll('input[type=image]').forEach((image) => addImageSrc(image.src, image.width, image.height));
                }
                for (const image of images.values()) {
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
            for (const [uri, data] of rawData.entries()) {
                const mimeType = data.mimeType;
                if (isString(mimeType) && /^image\//.test(mimeType) && !/svg\+xml$/.test(mimeType)) {
                    const element = document.createElement('img');
                    element.src = 'data:' + mimeType + ';' + (data.base64 ? 'base64,' + data.base64 : data.content);
                    const { naturalWidth: width, naturalHeight: height } = element;
                    if (width > 0 && height > 0) {
                        data.width = width;
                        data.height = height;
                        images.set(uri, { width, height, uri: data.filename });
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
                    for (let i = 0; i < length; i++) {
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
                    resume();
                })
                    .catch((error) => {
                    if (error instanceof Event) {
                        error = error.target;
                    }
                    const message = error instanceof HTMLImageElement ? error.src : '';
                    if (!this.userSettings.showErrorMessages || !isString(message) || confirm('FAIL: ' + message)) {
                        resume();
                    }
                });
            }
            else {
                resume();
            }
            const PromiseResult = class {
                then(resolve) {
                    if (imageElements.length) {
                        THEN = resolve;
                    }
                    else {
                        resolve();
                    }
                }
            };
            return new PromiseResult();
        }
        createCache(documentRoot) {
            const node = this.createRootNode(documentRoot);
            if (node) {
                node.parent.setBounds();
                for (const item of this._cache) {
                    item.setBounds();
                }
                this.controllerHandler.sortInitialCache();
                return true;
            }
            return false;
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
                const parent = new this.Node(0, processing.sessionId, element.parentElement || document.body, this._nodeAfterInsert);
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
                let j = 0;
                let k = 0;
                for (let i = 0; i < length; i++) {
                    const element = childNodes[i];
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
                if (this.userSettings.createQuerySelectorMap && k > 0) {
                    node.queryMap = this.createQueryMap(elements);
                }
            }
            return node;
        }
        createQueryMap(elements) {
            var _a;
            const result = [elements];
            for (const item of elements) {
                const childMap = item.queryMap;
                if (childMap) {
                    const length = childMap.length;
                    for (let i = 0; i < length; i++) {
                        const j = i + 1;
                        result[j] = ((_a = result[j]) === null || _a === void 0 ? void 0 : _a.concat(childMap[i])) || childMap[i];
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
                        for (let i = 0; i < length; i++) {
                            const rule = cssRules[i];
                            switch (rule.type) {
                                case CSSRule.STYLE_RULE:
                                case CSSRule.FONT_FACE_RULE:
                                    this.applyStyleRule(rule);
                                    break;
                                case CSSRule.IMPORT_RULE:
                                    applyStyleSheet(rule.styleSheet);
                                    break;
                                case CSSRule.MEDIA_RULE:
                                    if (validMediaRule(rule.conditionText || parseConditionText('media', rule.cssText))) {
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
            for (let i = 0; i < length; i++) {
                const styleSheet = styleSheets[i];
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
        applyCSSRuleList(rules) {
            const length = rules.length;
            for (let i = 0; i < length; i++) {
                this.applyStyleRule(rules[i]);
            }
        }
        applyStyleRule(item) {
            var _a, _b, _c, _d, _e, _f, _g;
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
                    const parseImageUrl = (styleMap, attr) => {
                        var _a;
                        const value = styleMap[attr];
                        if (value && value !== 'initial') {
                            let result = value;
                            let match;
                            while ((match = REGEX_DATAURI.exec(value)) !== null) {
                                if (match[3]) {
                                    const mimeType = match[3].split(XML$1.DELIMITER);
                                    resourceHandler.addRawData(match[2], mimeType[0].trim(), ((_a = mimeType[1]) === null || _a === void 0 ? void 0 : _a.trim()) || 'utf8', match[4]);
                                }
                                else if (this.userSettings.preloadImages) {
                                    const uri = resolvePath(match[4], styleSheetHref);
                                    if (uri !== '') {
                                        if (resourceHandler.getImage(uri) === undefined) {
                                            addImageSrc(uri);
                                        }
                                        result = result.replace(match[1], `url("${uri}")`);
                                    }
                                }
                            }
                            styleMap[attr] = result;
                            REGEX_DATAURI.lastIndex = 0;
                        }
                    };
                    const baseMap = {};
                    for (const attr of Array.from(cssStyle)) {
                        baseMap[convertCamelCase(attr)] = cssStyle[attr];
                    }
                    parseImageUrl(baseMap, 'backgroundImage');
                    parseImageUrl(baseMap, 'listStyleImage');
                    parseImageUrl(baseMap, 'content');
                    if (cssText.includes('!important')) {
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
                        REGEX_IMPORTANT.lastIndex = 0;
                    }
                    for (const selectorText of parseSelectorText(item.selectorText)) {
                        const specificity = getSpecificity(selectorText);
                        const [selector, target] = selectorText.split('::');
                        const targetElt = target ? '::' + target : '';
                        document.querySelectorAll(selector || '*').forEach((element) => {
                            const attrStyle = 'styleMap' + targetElt;
                            const attrSpecificity = 'styleSpecificity' + targetElt;
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
                                setElementCache(element, 'style' + targetElt, '0', getStyle(element, targetElt));
                                setElementCache(element, 'sessionId', '0', sessionId);
                                setElementCache(element, attrStyle, sessionId, styleMap);
                                setElementCache(element, attrSpecificity, sessionId, specificityData);
                            }
                        });
                    }
                    break;
                }
                case CSSRule.FONT_FACE_RULE: {
                    const attr = (_b = REGEX_FONTFACE.exec(cssText)) === null || _b === void 0 ? void 0 : _b[1];
                    if (attr) {
                        const fontFamily = (((_c = REGEX_FONTFAMILY.exec(attr)) === null || _c === void 0 ? void 0 : _c[1]) || '').trim();
                        const srcMatch = (((_d = REGEX_FONTSRC.exec(attr)) === null || _d === void 0 ? void 0 : _d[1]) || '').split(XML$1.SEPARATOR);
                        if (fontFamily !== '' && srcMatch.length) {
                            const fontStyle = ((_e = REGEX_FONTSTYLE.exec(attr)) === null || _e === void 0 ? void 0 : _e[1].toLowerCase()) || 'normal';
                            const fontWeight = parseInt(((_f = REGEX_FONTWEIGHT.exec(attr)) === null || _f === void 0 ? void 0 : _f[1]) || '400');
                            for (const value of srcMatch) {
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
                                        srcFormat: ((_g = urlMatch[4]) === null || _g === void 0 ? void 0 : _g.toLowerCase().trim()) || 'truetype'
                                    });
                                }
                            }
                        }
                    }
                    break;
                }
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
                    for (const item of ext.dependencies) {
                        if (item.preload) {
                            name = item.name;
                            if (this.retrieve(name) === null) {
                                const extension = application.builtInExtensions[name];
                                if (extension) {
                                    this.include(extension);
                                }
                            }
                        }
                    }
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
            const extensions = this.application.extensions;
            const length = extensions.length;
            for (let i = 0; i < length; i++) {
                if (extensions[i] === ext) {
                    extensions.splice(i, 1);
                    return true;
                }
            }
            return false;
        }
        retrieve(name) {
            for (const ext of this.application.extensions) {
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
    }

    const { fromLastIndexOf: fromLastIndexOf$1, trimString } = squared.lib.util;
    const isHttpProtocol = () => /^http/.test(location.protocol);
    class File {
        constructor() {
            this.assets = [];
        }
        static getMimeType(value) {
            switch (value.toLowerCase()) {
                case 'aac':
                    return 'audio/aac';
                case 'abw':
                    return 'application/x-abiword';
                case 'arc':
                    return 'application/x-freearc';
                case 'avi':
                    return 'video/x-msvideo';
                case 'azw':
                    return 'application/vnd.amazon.ebook';
                case 'bin':
                    return 'application/octet-stream';
                case 'bmp':
                    return 'image/bmp';
                case 'bz':
                    return 'application/x-bzip';
                case 'bz2':
                    return 'application/x-bzip2';
                case 'csh':
                    return 'application/x-csh';
                case 'css':
                    return 'text/css';
                case 'csv':
                    return 'text/csv';
                case 'doc':
                    return 'application/msword';
                case 'docx':
                    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                case 'eot':
                    return 'application/vnd.ms-fontobject';
                case 'epub':
                    return 'application/epub+zip';
                case 'gif':
                    return 'image/gif';
                case 'htm':
                case 'html':
                    return 'text/html';
                case 'ico':
                    return 'image/vnd.microsoft.icon';
                case 'ics':
                    return 'text/calendar';
                case 'jar':
                    return 'application/java-archive';
                case 'jpeg':
                case 'jpg':
                    return 'image/jpeg';
                case 'js':
                case 'mjs':
                    return 'text/javascript';
                case 'json':
                    return 'application/json';
                case 'jsonld':
                    return 'application/ld+json';
                case 'mid':
                case 'midi':
                    return 'audio/midi';
                case 'mp3':
                    return 'audio/mpeg';
                case 'mpeg':
                    return 'video/mpeg';
                case 'mpkg':
                    return 'application/vnd.apple.installer+xml';
                case 'odp':
                    return 'application/vnd.oasis.opendocument.presentation';
                case 'ods':
                    return 'application/vnd.oasis.opendocument.spreadsheet';
                case 'odt':
                    return 'application/vnd.oasis.opendocument.text';
                case 'oga':
                    return 'audio/ogg';
                case 'ogv':
                    return 'video/ogg';
                case 'ogx':
                    return 'application/ogg';
                case 'otf':
                    return 'font/otf';
                case 'png':
                    return 'image/png';
                case 'pdf':
                    return 'application/pdf';
                case 'ppt':
                    return 'application/vnd.ms-powerpoint';
                case 'pptx':
                    return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
                case 'rar':
                    return 'application/x-rar-compressed';
                case 'rtf':
                    return 'application/rtf';
                case 'sh':
                    return 'application/x-sh';
                case 'svg':
                    return 'image/svg+xml';
                case 'swf':
                    return 'application/x-shockwave-flash';
                case 'tar':
                    return 'application/x-tar';
                case 'tif':
                case 'tiff':
                    return 'image/tiff';
                case 'ts':
                    return 'video/mp2t';
                case 'ttf':
                    return 'font/ttf';
                case 'txt':
                    return 'text/plain';
                case 'vsd':
                    return 'application/vnd.visio';
                case 'wav':
                    return 'audio/wav';
                case 'weba':
                    return 'audio/webm';
                case 'webm':
                    return 'video/webm';
                case 'webp':
                    return 'image/webp';
                case 'woff':
                    return 'font/woff';
                case 'woff2':
                    return 'font/woff2';
                case 'xhtml':
                    return 'application/xhtml+xml';
                case 'xls':
                    return 'application/vnd.ms-excel';
                case 'xlsx':
                    return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                case 'xml':
                    return 'text/xml';
                case 'xul':
                    return 'application/vnd.mozilla.xul+xml';
                case 'zip':
                    return 'application/zip';
                case '3gp':
                    return 'video/3gpp';
                case '.3g2':
                    return 'video/3gpp2';
                case '.7z':
                    return 'application/x-7z-compressed';
                default:
                    return '';
            }
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
        addAsset(data) {
            if (data.content || data.uri || data.base64) {
                const assets = this.assets;
                const { pathname, filename } = data;
                const asset = assets.find(item => item.pathname === pathname && item.filename === filename);
                if (asset) {
                    Object.assign(asset, data);
                }
                else {
                    assets.push(data);
                }
            }
        }
        reset() {
            this.assets.length = 0;
        }
        copying(directory, assets, callback) {
            if (isHttpProtocol()) {
                assets = assets.concat(this.assets);
                if (assets.length) {
                    const { outputDirectory, outputArchiveTimeout } = this.userSettings;
                    fetch('/api/assets/copy' +
                        '?to=' + encodeURIComponent(directory.trim()) +
                        '&directory=' + encodeURIComponent(trimString(outputDirectory, '/')) +
                        '&timeout=' + outputArchiveTimeout, {
                        method: 'POST',
                        headers: new Headers({ 'Accept': 'application/json, text/plain, */*', 'Content-Type': 'application/json' }),
                        body: JSON.stringify(assets)
                    })
                        .then((response) => response.json())
                        .then((result) => {
                        if (result) {
                            if (typeof callback === 'function') {
                                callback(result);
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
                            alert('ERROR: ' + err);
                        }
                    });
                }
            }
            else if (this.userSettings.showErrorMessages) {
                alert('SERVER (required): See README for instructions');
            }
        }
        archiving(filename, assets, appendTo = '') {
            if (isHttpProtocol()) {
                assets = assets.concat(this.assets);
                if (assets.length) {
                    const { outputDirectory, outputArchiveFormat, outputArchiveTimeout } = this.userSettings;
                    fetch('/api/assets/archive' +
                        '?filename=' + encodeURIComponent(filename.trim()) +
                        '&directory=' + encodeURIComponent(trimString(outputDirectory, '/')) +
                        '&format=' + outputArchiveFormat +
                        '&append_to=' + encodeURIComponent(appendTo.trim()) +
                        '&timeout=' + outputArchiveTimeout, {
                        method: 'POST',
                        headers: new Headers({ 'Accept': 'application/json, text/plain, */*', 'Content-Type': 'application/json' }),
                        body: JSON.stringify(assets)
                    })
                        .then((response) => response.json())
                        .then((result) => {
                        if (result) {
                            const zipname = result.zipname;
                            if (zipname) {
                                fetch('/api/browser/download?filename=' + encodeURIComponent(zipname))
                                    .then((response) => response.blob())
                                    .then((blob) => File.downloadFile(blob, fromLastIndexOf$1(zipname, '/')));
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
                            alert('ERROR: ' + err);
                        }
                    });
                }
            }
            else if (this.userSettings.showErrorMessages) {
                alert('SERVER (required): See README for instructions');
            }
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

    const $lib$2 = squared.lib;
    const { USER_AGENT, isUserAgent } = $lib$2.client;
    const { BOX_BORDER, checkStyleValue, formatPX, getInheritedStyle, getStyle: getStyle$1, hasComputedStyle: hasComputedStyle$1, isLength, isPercent, parseSelectorText: parseSelectorText$1, parseUnit } = $lib$2.css;
    const { ELEMENT_BLOCK, assignRect, getNamedItem, getRangeClientRect, newBoxRectDimension } = $lib$2.dom;
    const { CHAR: CHAR$1, CSS: CSS$2, FILE: FILE$1, XML: XML$2 } = $lib$2.regex;
    const { actualClientRect, actualTextRangeRect, deleteElementCache, getElementAsNode, getElementCache: getElementCache$1, getPseudoElt, setElementCache: setElementCache$1 } = $lib$2.session;
    const { aboveRange, belowRange, convertCamelCase: convertCamelCase$1, convertFloat, convertInt, filterArray, hasBit: hasBit$1, hasValue, isNumber, isObject: isObject$1, isString: isString$1, spliceString } = $lib$2.util;
    const { PX, SELECTOR_ATTR, SELECTOR_G, SELECTOR_LABEL, SELECTOR_PSEUDO_CLASS } = CSS$2;
    const REGEX_INLINE = /^inline/;
    const REGEX_INLINEDASH = /^inline-/;
    const REGEX_MARGIN = /^margin/;
    const REGEX_PADDING = /^padding/;
    const REGEX_BORDER = /^border/;
    const REGEX_BACKGROUND$1 = /\s*(url\(.+?\))\s*/;
    const REGEX_QUERY_LANG = /^:lang\(\s*(.+)\s*\)$/;
    const REGEX_QUERY_NTH_CHILD_OFTYPE = /^:nth(-last)?-(child|of-type)\((.+)\)$/;
    const REGEX_QUERY_NTH_CHILD_OFTYPE_VALUE = /^(-)?(\d+)?n\s*([+-]\d+)?$/;
    const REGEX_EM = /em$/;
    const REGEX_GRID = /grid$/;
    const REGEX_FLEX = /flex$/;
    function setNaturalChildren(node) {
        var _a;
        let children;
        if (node.naturalElement) {
            const sessionId = node.sessionId;
            let i = 0;
            children = [];
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
        const children = filterArray(node.naturalChildren, item => item.naturalElement);
        node.naturalElements = children;
        return children;
    }
    function getFlexValue(node, attr, fallback, parent) {
        const value = (parent || node).css(attr);
        if (isNumber(value)) {
            return parseFloat(value);
        }
        else if (value === 'inherit' && parent === undefined) {
            return getFlexValue(node, attr, fallback, node.actualParent);
        }
        return fallback;
    }
    function validateQuerySelector(node, selector, index, last, adjacent) {
        var _a;
        if (selector.all) {
            return true;
        }
        let tagName = selector.tagName;
        if (tagName && tagName !== node.tagName.toUpperCase()) {
            return false;
        }
        const id = selector.id;
        if (id && id !== node.elementId) {
            return false;
        }
        const { attrList, classList, notList, pseudoList } = selector;
        if (pseudoList) {
            const parent = node.actualParent;
            tagName = node.tagName;
            for (const pseudo of pseudoList) {
                switch (pseudo) {
                    case ':first-child':
                    case ':nth-child(1)':
                        if (node !== parent.firstChild) {
                            return false;
                        }
                        break;
                    case ':last-child':
                    case ':nth-last-child(1)':
                        if (node !== parent.lastChild) {
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
                                if (item !== node) {
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
                        if (node.element.childNodes.length) {
                            return false;
                        }
                        break;
                    case ':checked':
                        if (tagName === 'INPUT') {
                            if (!node.toElementBoolean('checked')) {
                                return false;
                            }
                        }
                        else if (tagName === 'OPTION') {
                            if (!node.toElementBoolean('selected')) {
                                return false;
                            }
                        }
                        else {
                            return false;
                        }
                        break;
                    case ':enabled':
                        if (!node.inputElement || node.toElementBoolean('disabled')) {
                            return false;
                        }
                        break;
                    case ':disabled':
                        if (!node.inputElement || !node.toElementBoolean('disabled')) {
                            return false;
                        }
                        break;
                    case ':read-only': {
                        const element = node.element;
                        if (element.isContentEditable || (tagName === 'INPUT' || tagName === 'TEXTAREA') && !element.readOnly) {
                            return false;
                        }
                        break;
                    }
                    case ':read-write': {
                        const element = node.element;
                        if (!element.isContentEditable || (tagName === 'INPUT' || tagName === 'TEXTAREA') && element.readOnly) {
                            return false;
                        }
                        break;
                    }
                    case ':required':
                        if (!node.inputElement || tagName === 'BUTTON' || !node.toElementBoolean('required')) {
                            return false;
                        }
                        break;
                    case ':optional':
                        if (!node.inputElement || tagName === 'BUTTON' || node.toElementBoolean('required')) {
                            return false;
                        }
                        break;
                    case ':placeholder-shown': {
                        if (!((tagName === 'INPUT' || tagName === 'TEXTAREA') && node.toElementString('placeholder') !== '')) {
                            return false;
                        }
                        break;
                    }
                    case ':default': {
                        switch (tagName) {
                            case 'INPUT': {
                                const element = node.element;
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
                                if (node.element.attributes['selected'] === undefined) {
                                    return false;
                                }
                                break;
                            case 'BUTTON': {
                                const form = node.ascend({ condition: item => item.tagName === 'FORM' })[0];
                                if (form) {
                                    const element = node.element;
                                    let valid = false;
                                    const children = form.element.querySelectorAll('*');
                                    const length = children.length;
                                    for (let j = 0; j < length; j++) {
                                        const item = children[index];
                                        if (item.tagName === 'BUTTON') {
                                            valid = element === item;
                                            break;
                                        }
                                        else if (item.tagName === 'INPUT') {
                                            const type = item.type;
                                            if (type === 'submit' || type === 'image') {
                                                valid = element === item;
                                                break;
                                            }
                                        }
                                    }
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
                            const element = node.element;
                            const rangeValue = parseFloat(element.value);
                            if (!isNaN(rangeValue)) {
                                const min = parseFloat(element.min);
                                const max = parseFloat(element.max);
                                if (rangeValue >= min && rangeValue <= max) {
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
                            const element = node.element;
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
                                        const children = (((_a = node.ascend({ condition: item => item.tagName === 'FORM' })[0]) === null || _a === void 0 ? void 0 : _a.element) || document).querySelectorAll(`input[type=radio][name="${element.name}"`);
                                        const length = children.length;
                                        for (let j = 0; j < length; j++) {
                                            if (children[j].checked) {
                                                return false;
                                            }
                                        }
                                    }
                                    break;
                                default:
                                    return false;
                            }
                        }
                        else if (tagName === 'PROGRESS') {
                            if (node.toElementInt('value', -1) !== -1) {
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
                            const element = node.element;
                            if (!(location.hash === '#' + element.id || tagName === 'A' && location.hash === '#' + element.name)) {
                                return false;
                            }
                        }
                        break;
                    }
                    case ':scope':
                        if (!last || adjacent === '>' && node !== this) {
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
                        const element = node.element;
                        const children = parent.element.querySelectorAll(':scope > ' + pseudo);
                        let valid = false;
                        const length = children.length;
                        for (let j = 0; j < length; j++) {
                            if (children.item(index) === element) {
                                valid = true;
                                break;
                            }
                        }
                        if (!valid) {
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
                            const i = (match[2] === 'child' ? children.indexOf(node) : filterArray(children, item => item.tagName === tagName).indexOf(node)) + 1;
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
                                const attributes = node.attributes;
                                if (attributes['lang'] && match[1].toLowerCase() === attributes['lang'].toLowerCase()) {
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
                const notData = { all: false };
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
                            let attrValue = match[3] || match[4] || match[5] || '';
                            if (caseInsensitive) {
                                attrValue = attrValue.toLowerCase();
                            }
                            notData.attrList = [{
                                    key: match[1],
                                    symbol: match[2],
                                    value: attrValue,
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
                }
                if (validateQuerySelector.call(this, node, notData, index, last)) {
                    return false;
                }
            }
        }
        if (classList) {
            const elementList = node.element.classList;
            for (const className of classList) {
                if (!elementList.contains(className)) {
                    return false;
                }
            }
        }
        if (attrList) {
            const attributes = node.attributes;
            for (const attr of attrList) {
                let actualValue = attributes[attr.key];
                if (actualValue === undefined) {
                    return false;
                }
                else {
                    const attrValue = attr.value;
                    if (attrValue) {
                        if (attr.caseInsensitive) {
                            actualValue = actualValue.toLowerCase();
                        }
                        if (attr.symbol) {
                            switch (attr.symbol) {
                                case '~':
                                    if (!actualValue.split(CHAR$1.SPACE).includes(attrValue)) {
                                        return false;
                                    }
                                    break;
                                case '^':
                                    if (!actualValue.startsWith(attrValue)) {
                                        return false;
                                    }
                                    break;
                                case '$':
                                    if (!actualValue.endsWith(attrValue)) {
                                        return false;
                                    }
                                    break;
                                case '*':
                                    if (!actualValue.includes(attrValue)) {
                                        return false;
                                    }
                                    break;
                                case '|':
                                    if (actualValue !== attrValue && !actualValue.startsWith(attrValue + '-')) {
                                        return false;
                                    }
                                    break;
                            }
                        }
                        else if (actualValue !== attrValue) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }
    const validateCssSet = (value, actualValue) => value === actualValue || isLength(value, true) && PX.test(actualValue);
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
            this._inlineText = false;
            if (element) {
                this._element = element;
            }
            else {
                this.style = {};
                this._styleMap = {};
                this._cssStyle = {};
            }
        }
        static isFlexDirection(node, direction) {
            var _a;
            const parent = node.actualParent;
            if (((_a = parent) === null || _a === void 0 ? void 0 : _a.flexElement) && parent.css('flexDirection').startsWith(direction)) {
                if (direction === 'column' && !parent.hasHeight) {
                    const grandParent = parent.actualParent;
                    if (grandParent) {
                        if (grandParent.flexElement && !grandParent.css('flexDirection').includes('column')) {
                            let maxHeight = 0;
                            let parentHeight = 0;
                            for (const item of grandParent) {
                                const height = (item.data(EXT_NAME.FLEXBOX, 'boundsData') || item.bounds).height;
                                if (height > maxHeight) {
                                    maxHeight = height;
                                }
                                if (item === parent) {
                                    parentHeight = height;
                                    if (parentHeight < maxHeight) {
                                        break;
                                    }
                                }
                            }
                            if (parentHeight >= maxHeight) {
                                return false;
                            }
                        }
                        else if (!grandParent.gridElement) {
                            return false;
                        }
                    }
                    else {
                        return false;
                    }
                }
                const { grow, shrink } = node.flexbox;
                return grow > 0 || shrink !== 1;
            }
            return false;
        }
        init() {
            const element = this._element;
            if (element) {
                const sessionId = this.sessionId;
                const styleMap = getElementCache$1(element, 'styleMap', sessionId) || {};
                let style;
                if (!this.pseudoElement) {
                    style = getStyle$1(element);
                    if (this.styleElement) {
                        const items = Array.from(element.style);
                        if (items.length) {
                            const inline = element.style;
                            for (const attr of items) {
                                styleMap[convertCamelCase$1(attr)] = inline.getPropertyValue(attr);
                            }
                        }
                    }
                }
                else {
                    style = getStyle$1(element.parentElement, getPseudoElt(element, sessionId));
                }
                if (this.styleElement) {
                    const revisedMap = {};
                    for (const attr in styleMap) {
                        const value = checkStyleValue(element, attr, styleMap[attr], style);
                        if (value !== '') {
                            revisedMap[attr] = value;
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
                for (const attr of attrs) {
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
                            if (REGEX_MARGIN.test(attr)) {
                                cached.autoMargin = undefined;
                                cached.rightAligned = undefined;
                                cached.centerAligned = undefined;
                                cached.horizontalAligned = undefined;
                            }
                            else if (REGEX_PADDING.test(attr)) {
                                cached.contentBoxWidth = undefined;
                                cached.contentBoxHeight = undefined;
                            }
                            else if (REGEX_BORDER.test(attr)) {
                                cached.visibleStyle = undefined;
                                cached.contentBoxWidth = undefined;
                                cached.contentBoxHeight = undefined;
                            }
                            break;
                    }
                    cached[attr] = undefined;
                }
            }
            else {
                this._cached = {};
                this._textStyle = undefined;
            }
        }
        ascend(options = {}) {
            const { condition, including, error, every, excluding } = options;
            let attr = options.attr;
            if (!isString$1(attr)) {
                attr = 'actualParent';
            }
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
                return (aboveRange(leftA, left) && Math.ceil(leftA) < right ||
                    rightA > Math.ceil(left) && belowRange(rightA, right) ||
                    aboveRange(left, leftA) && belowRange(right, rightA) ||
                    aboveRange(leftA, left) && belowRange(rightA, right));
            }
            return false;
        }
        intersectY(rect, dimension = 'linear') {
            if (rect.height > 0) {
                const { top, bottom } = this[dimension];
                const { top: topA, bottom: bottomA } = rect;
                return (aboveRange(topA, top) && Math.ceil(topA) < bottom ||
                    bottomA > Math.ceil(top) && belowRange(bottomA, bottom) ||
                    aboveRange(top, topA) && belowRange(bottom, bottomA) ||
                    aboveRange(topA, top) && belowRange(bottomA, bottom));
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
                return aboveRange(bounds.top, rect.top) && belowRange(bounds.bottom, rect.bottom);
            }
            return true;
        }
        outsideX(rect, dimension = 'linear') {
            if (this.pageFlow || rect.width > 0) {
                const bounds = this[dimension];
                return bounds.left < Math.floor(rect.left) || Math.floor(bounds.right) > rect.right;
            }
            return false;
        }
        outsideY(rect, dimension = 'linear') {
            if (this.pageFlow || rect.height > 0) {
                const bounds = this[dimension];
                return bounds.top < Math.floor(rect.top) || Math.floor(bounds.bottom) > rect.bottom;
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
            if (this._initial === undefined && !modified) {
                computed = true;
            }
            let value = (!modified && ((_a = this._initial) === null || _a === void 0 ? void 0 : _a.styleMap) || this._styleMap)[attr];
            if (computed && !value) {
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
                    result = (_a = getElementCache$1(element.parentElement, 'styleSpecificity' + getPseudoElt(element, sessionId), sessionId)) === null || _a === void 0 ? void 0 : _a[attr];
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
                const current = getStyle$1(element).getPropertyValue(attr);
                if (current !== value) {
                    const style = element.style;
                    style.setProperty(attr, value);
                    if (validateCssSet(value, style.getPropertyValue(attr))) {
                        setElementCache$1(element, attr, this.sessionId, current);
                        return true;
                    }
                }
                else {
                    return true;
                }
            }
            return false;
        }
        cssFinally(attr) {
            if (this.styleElement) {
                const sessionId = this.sessionId;
                const element = this._element;
                const value = getElementCache$1(element, attr, sessionId);
                if (value) {
                    element.style.setProperty(attr, value);
                    deleteElementCache(element, attr, sessionId);
                    return true;
                }
            }
            return false;
        }
        cssParent(attr, value, cache = false) {
            return this.naturalChild ? this.actualParent.css(attr, value, cache) : '';
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
            if (value) {
                if (isPercent(value)) {
                    const node = parent && this.absoluteParent || this;
                    let result = parseFloat(value) / 100;
                    switch (dimension) {
                        case 'width':
                            result *= node.bounds.width;
                            break;
                        case 'height':
                            result *= node.bounds.height;
                            break;
                    }
                    return result;
                }
                return parseUnit(value, this.fontSize, screenDimension);
            }
            return 0;
        }
        has(attr, checkType = 0, options) {
            var _a, _b, _c;
            const value = (((_a = options) === null || _a === void 0 ? void 0 : _a.map) === 'initial' && ((_b = this._initial) === null || _b === void 0 ? void 0 : _b.styleMap) || this._styleMap)[attr];
            if (value) {
                switch (value) {
                    case 'auto':
                    case 'none':
                    case 'initial':
                    case 'normal':
                    case 'transparent':
                    case 'rgba(0, 0, 0, 0)':
                        return false;
                    case 'baseline':
                    case 'left':
                    case 'start':
                        return this.flexElement || ((_c = this.actualParent) === null || _c === void 0 ? void 0 : _c.flexElement) ? /^(align|justify|place)-/.test(attr) : false;
                    default:
                        if (options) {
                            if (options.not) {
                                if (value === options.not) {
                                    return false;
                                }
                                else if (Array.isArray(options.not)) {
                                    for (const exclude of options.not) {
                                        if (value === exclude) {
                                            return false;
                                        }
                                    }
                                }
                            }
                        }
                        if (checkType > 0) {
                            if (hasBit$1(checkType, 2 /* LENGTH */) && isLength(value)) {
                                return true;
                            }
                            if (hasBit$1(checkType, 4 /* PERCENT */) && isPercent(value)) {
                                return true;
                            }
                        }
                        return checkType === 0;
                }
            }
            return false;
        }
        hasPX(attr, percent = true, initial = false) {
            var _a;
            const value = (initial && ((_a = this._initial) === null || _a === void 0 ? void 0 : _a.styleMap) || this._styleMap)[attr];
            return value ? isLength(value, percent) : false;
        }
        setBounds(cache = true) {
            if (this.styleElement) {
                this._bounds = assignRect(actualClientRect(this._element, this.sessionId, cache));
                if (this.documentBody && this.marginTop === 0) {
                    this._bounds.top = 0;
                }
            }
            else if (this.plainText) {
                const rect = getRangeClientRect(this._element);
                const bounds = assignRect(rect);
                const lines = rect.numberOfLines;
                bounds.numberOfLines = lines;
                this._bounds = bounds;
                this._textBounds = bounds;
                this._cached.multiline = lines > 1;
            }
            if (!cache) {
                this._box = undefined;
                this._linear = undefined;
            }
        }
        querySelector(value) {
            return this.querySelectorAll(value, 1)[0] || null;
        }
        querySelectorAll(value, resultCount = -1) {
            let result = [];
            const queryMap = this.queryMap;
            if (queryMap) {
                const queries = parseSelectorText$1(value);
                for (let i = 0; i < queries.length; i++) {
                    const query = queries[i];
                    const selectors = [];
                    let offset = -1;
                    invalid: {
                        let adjacent;
                        let match;
                        while ((match = SELECTOR_G.exec(query)) !== null) {
                            let segment = match[1];
                            let all = false;
                            let tagName;
                            let id;
                            let classList;
                            let attrList;
                            let pseudoList;
                            let notList;
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
                            else if (/\|\*$/.test(segment)) {
                                all = segment === '*|*';
                            }
                            else if (segment.charAt(0) === '*') {
                                segment = segment.substring(1);
                            }
                            else if (/^::/.test(segment)) {
                                selectors.length = 0;
                                break invalid;
                            }
                            if (!all) {
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
                                    if (/^:not\(/.test(subMatch[0])) {
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
                                        pseudoList.push(subMatch[0]);
                                    }
                                    segment = spliceString(segment, subMatch.index, subMatch[0].length);
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
                                    segment = spliceString(segment, subMatch.index, subMatch[0].length);
                                }
                            }
                            selectors.push({
                                all,
                                tagName,
                                id,
                                adjacent,
                                classList,
                                pseudoList,
                                notList,
                                attrList
                            });
                            offset++;
                            adjacent = undefined;
                        }
                        SELECTOR_G.lastIndex = 0;
                    }
                    let length = queryMap.length;
                    if (selectors.length && offset !== -1 && offset < length) {
                        const dataEnd = selectors.pop();
                        const lastEnd = selectors.length === 0;
                        let pending = [];
                        for (let j = offset; j < length; j++) {
                            const dataMap = queryMap[j];
                            if (dataEnd.all) {
                                pending = pending.concat(dataMap);
                            }
                            else {
                                for (const node of dataMap) {
                                    if (validateQuerySelector.call(this, node, dataEnd, i, lastEnd)) {
                                        pending.push(node);
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
                                for (const node of nodes) {
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
                                                    const lengthA = children.length;
                                                    for (let k = 0; k < lengthA; k++) {
                                                        const sibling = children[k];
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
                            for (const node of pending) {
                                if (ascendQuerySelector(0, dataEnd.adjacent, [node])) {
                                    result.push(node);
                                    if (result.length === resultCount) {
                                        return result;
                                    }
                                }
                            }
                        }
                        else if (result.length === 0 && (i === queries.length - 1 || resultCount >= 0 && resultCount <= pending.length)) {
                            if (resultCount >= 0 && pending.length > resultCount) {
                                pending.length = resultCount;
                            }
                            return pending;
                        }
                        else {
                            result = result.concat(pending);
                            if (resultCount >= 0 && result.length >= resultCount) {
                                result.length = resultCount;
                                return result;
                            }
                        }
                    }
                }
            }
            return result;
        }
        setDimension(attr, attrMin, attrMax) {
            const styleMap = this._styleMap;
            const valueA = styleMap[attr];
            const baseValue = this.parseUnit(valueA, attr);
            let value = Math.max(baseValue, this.parseUnit(styleMap[attrMin], attr));
            if (value === 0 && this.styleElement) {
                const element = this._element;
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
                    case 'CANVAS':
                    case 'OBJECT':
                    case 'EMBED': {
                        const size = getNamedItem(element, attr);
                        if (size !== '') {
                            value = isNumber(size) ? parseFloat(size) : this.parseUnit(size, attr);
                            if (value > 0) {
                                this.css(attr, isPercent(size) ? size : size + 'px');
                            }
                        }
                        break;
                    }
                }
            }
            let maxValue = 0;
            if (baseValue > 0 && !this.imageElement) {
                const valueB = styleMap[attrMax];
                if (valueA === valueB) {
                    delete styleMap[attrMax];
                }
                else {
                    maxValue = this.parseUnit(valueB, attr);
                    if (maxValue > 0 && maxValue <= baseValue && isLength(valueA)) {
                        maxValue = 0;
                        styleMap[attr] = valueB;
                        delete styleMap[attrMax];
                    }
                }
            }
            return maxValue > 0 ? Math.min(value, maxValue) : value;
        }
        convertPosition(attr) {
            if (!this.positionStatic) {
                const unit = this.cssInitial(attr, true);
                if (isLength(unit)) {
                    return this.parseUnit(unit, attr === 'left' || attr === 'right' ? 'width' : 'height');
                }
                else if (isPercent(unit) && this.styleElement) {
                    return convertFloat(this.style[attr]);
                }
            }
            return 0;
        }
        convertBorderWidth(index) {
            if (!this.plainText) {
                const border = BOX_BORDER[index];
                const value = this.css(border[0]);
                if (value !== 'none') {
                    const attr = border[1];
                    const width = this.css(attr);
                    let result;
                    switch (width) {
                        case 'thin':
                        case 'medium':
                        case 'thick':
                            result = convertFloat(this.style[attr]);
                            break;
                        default:
                            result = this.parseUnit(width, index === 1 || index === 3 ? 'width' : 'height');
                            break;
                    }
                    if (result > 0) {
                        return Math.max(Math.round(result), 1);
                    }
                }
            }
            return 0;
        }
        convertBox(attr, margin) {
            var _a, _b;
            switch (this.display) {
                case 'table':
                    if (!margin && this.css('borderCollapse') === 'collapse') {
                        return 0;
                    }
                    break;
                case 'table-row':
                    return 0;
                case 'table-cell':
                    if (margin) {
                        switch (this.tagName) {
                            case 'TD':
                            case 'TH':
                                return 0;
                            default: {
                                const parent = this.ascend({ condition: node => node.tagName === 'TABLE' })[0];
                                if (parent) {
                                    const [horizontal, vertical] = parent.css('borderSpacing').split(' ');
                                    switch (attr) {
                                        case 'marginTop':
                                        case 'marginBottom':
                                            return vertical ? this.parseUnit(vertical, 'height', false) : this.parseUnit(horizontal, 'width', false);
                                        case 'marginRight':
                                            if (((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.lastChild) !== this) {
                                                return this.parseUnit(horizontal, 'width', false);
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
            const result = this.parseUnit(this.css(attr), 'width', ((_b = this.actualParent) === null || _b === void 0 ? void 0 : _b.gridElement) !== true);
            if (!margin) {
                let paddingStart = this.toFloat('paddingInlineStart', 0);
                let paddingEnd = this.toFloat('paddingInlineEnd', 0);
                if (paddingStart > 0 || paddingEnd > 0) {
                    if (this.css('writingMode') === 'vertical-rl') {
                        if (this.dir === 'rtl') {
                            if (attr !== 'paddingBottom') {
                                paddingStart = 0;
                            }
                            if (attr !== 'paddingTop') {
                                paddingEnd = 0;
                            }
                        }
                        else {
                            if (attr !== 'paddingTop') {
                                paddingStart = 0;
                            }
                            if (attr !== 'paddingBottom') {
                                paddingEnd = 0;
                            }
                        }
                    }
                    else {
                        if (this.dir === 'rtl') {
                            if (attr !== 'paddingRight') {
                                paddingStart = 0;
                            }
                            if (attr !== 'paddingLeft') {
                                paddingEnd = 0;
                            }
                        }
                        else {
                            if (attr !== 'paddingLeft') {
                                paddingStart = 0;
                            }
                            if (attr !== 'paddingRight') {
                                paddingEnd = 0;
                            }
                        }
                    }
                    return paddingStart + result + paddingEnd;
                }
            }
            return result;
        }
        set parent(value) {
            var _a;
            if (value) {
                const parent = this._parent;
                if (value !== parent) {
                    (_a = parent) === null || _a === void 0 ? void 0 : _a.remove(this);
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
                result = REGEX_FLEX.test(this.display);
                this._cached.flexElement = result;
            }
            return result;
        }
        get gridElement() {
            let result = this._cached.gridElement;
            if (result === undefined) {
                result = REGEX_GRID.test(this.display);
                this._cached.gridElement = result;
            }
            return result;
        }
        get textElement() {
            let result = this._cached.textElement;
            if (result === undefined) {
                result = this.plainText || this.inlineText;
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
            return this._element === document.body;
        }
        get initial() {
            return this._initial;
        }
        get bounds() {
            return this._bounds || assignRect(this.boundingClientRect);
        }
        get linear() {
            const setDimension = () => {
                const bounds = this._bounds;
                if (bounds) {
                    if (this.styleElement) {
                        const { marginTop, marginBottom, marginLeft, marginRight } = this;
                        this._linear = {
                            top: bounds.top - (marginTop > 0 ? marginTop : 0),
                            right: bounds.right + marginRight,
                            bottom: bounds.bottom + marginBottom,
                            left: bounds.left - (marginLeft > 0 ? marginLeft : 0),
                            width: bounds.width + Math.max(marginLeft, 0) + marginRight,
                            height: bounds.height + Math.max(marginTop, 0) + marginBottom
                        };
                    }
                    else {
                        this._linear = bounds;
                    }
                    return this._linear;
                }
                return newBoxRectDimension();
            };
            return this._linear || setDimension();
        }
        get box() {
            const setDimension = () => {
                const bounds = this._bounds;
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
            return this._box || setDimension();
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
        get flexbox() {
            let result = this._cached.flexbox;
            if (result === undefined) {
                if (this.styleElement) {
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
                result = this.setDimension('width', 'minWidth', 'maxWidth');
                this._cached.width = result;
            }
            return result;
        }
        get height() {
            let result = this._cached.height;
            if (result === undefined) {
                result = this.setDimension('height', 'minHeight', 'maxHeight');
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
                    if (this.pageFlow && (((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.hasHeight) || this.documentBody)) {
                        result = parseFloat(value) > 0;
                    }
                    else {
                        result = false;
                    }
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
                    else if (this.naturalChild) {
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
                    if (hasOwnStyle || value > this.actualHeight || this.multiline || this.block && this.naturalChildren.some(node => node.textElement)) {
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
            var _a;
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
                        const position = ((_a = element) === null || _a === void 0 ? void 0 : _a.parentElement) ? getInheritedStyle(element.parentElement, 'position') : '';
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
                result = this.convertPosition('top');
                this._cached.top = result;
            }
            return result;
        }
        get right() {
            let result = this._cached.right;
            if (result === undefined) {
                result = this.convertPosition('right');
                this._cached.right = result;
            }
            return result;
        }
        get bottom() {
            let result = this._cached.bottom;
            if (result === undefined) {
                result = this.convertPosition('bottom');
                this._cached.bottom = result;
            }
            return result;
        }
        get left() {
            let result = this._cached.left;
            if (result === undefined) {
                result = this.convertPosition('left');
                this._cached.left = result;
            }
            return result;
        }
        get marginTop() {
            let result = this._cached.marginTop;
            if (result === undefined) {
                result = this.inlineStatic ? 0 : this.convertBox('marginTop', true);
                this._cached.marginTop = result;
            }
            return result;
        }
        get marginRight() {
            let result = this._cached.marginRight;
            if (result === undefined) {
                result = this.convertBox('marginRight', true);
                this._cached.marginRight = result;
            }
            return result;
        }
        get marginBottom() {
            let result = this._cached.marginBottom;
            if (result === undefined) {
                result = this.inlineStatic ? 0 : this.convertBox('marginBottom', true);
                this._cached.marginBottom = result;
            }
            return result;
        }
        get marginLeft() {
            let result = this._cached.marginLeft;
            if (result === undefined) {
                result = this.convertBox('marginLeft', true);
                this._cached.marginLeft = result;
            }
            return result;
        }
        get borderTopWidth() {
            let result = this._cached.borderTopWidth;
            if (result === undefined) {
                result = this.convertBorderWidth(0);
                this._cached.borderTopWidth = result;
            }
            return result;
        }
        get borderRightWidth() {
            let result = this._cached.borderRightWidth;
            if (result === undefined) {
                result = this.convertBorderWidth(1);
                this._cached.borderRightWidth = result;
            }
            return result;
        }
        get borderBottomWidth() {
            let result = this._cached.borderBottomWidth;
            if (result === undefined) {
                result = this.convertBorderWidth(2);
                this._cached.borderBottomWidth = result;
            }
            return result;
        }
        get borderLeftWidth() {
            let result = this._cached.borderLeftWidth;
            if (result === undefined) {
                result = this.convertBorderWidth(3);
                this._cached.borderLeftWidth = result;
            }
            return result;
        }
        get paddingTop() {
            let result = this._cached.paddingTop;
            if (result === undefined) {
                result = this.convertBox('paddingTop', false);
                this._cached.paddingTop = result;
            }
            return result;
        }
        get paddingRight() {
            let result = this._cached.paddingRight;
            if (result === undefined) {
                result = this.convertBox('paddingRight', false);
                this._cached.paddingRight = result;
            }
            return result;
        }
        get paddingBottom() {
            let result = this._cached.paddingBottom;
            if (result === undefined) {
                result = this.convertBox('paddingBottom', false);
                this._cached.paddingBottom = result;
            }
            return result;
        }
        get paddingLeft() {
            let result = this._cached.paddingLeft;
            if (result === undefined) {
                result = this.convertBox('paddingLeft', false);
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
                if (this.naturalElement && !this.plainText && !this.floating) {
                    const value = this.display;
                    result = REGEX_INLINE.test(value) || value === 'table-cell';
                }
                else {
                    result = false;
                }
                this._cached.inlineVertical = result;
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
                result = this.pageFlow && (this.block && !this.floating || this.blockDimension && this.cssInitial('width') === '100%' && !this.hasPX('maxWidth'));
                this._cached.blockStatic = result;
            }
            return result;
        }
        get blockDimension() {
            let result = this._cached.blockDimension;
            if (result === undefined) {
                if (this.block || this.imageElement || this.svgElement) {
                    result = true;
                }
                else {
                    const value = this.display;
                    result = REGEX_INLINEDASH.test(value) || value === 'table';
                }
                this._cached.blockDimension = result;
            }
            return result;
        }
        get blockVertical() {
            let result = this._cached.blockVertical;
            if (result === undefined) {
                result = this.blockDimension && this.hasPX('height');
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
                if (this.inline || this.imageElement || this.floating) {
                    result = true;
                }
                else {
                    const value = this.display;
                    result = REGEX_INLINE.test(value) || value === 'table-cell';
                }
                this._cached.inlineFlow = result;
            }
            return result;
        }
        get centerAligned() {
            let result = this._cached.centerAligned;
            if (result === undefined) {
                result = this.autoMargin.leftRight || this.textElement && this.blockStatic && this.cssInitial('textAlign') === 'center' || this.inlineStatic && this.cssAscend('textAlign', true) === 'center';
                this._cached.centerAligned = result;
            }
            return result;
        }
        get rightAligned() {
            var _a;
            let result = this._cached.rightAligned;
            if (result === undefined) {
                const parent = this.actualParent;
                if ((_a = parent) === null || _a === void 0 ? void 0 : _a.flexElement) {
                    result = /(right|end)$/.test(parent.css('justifyContent'));
                }
                else {
                    result = this.float === 'right' || this.autoMargin.left || !this.pageFlow && this.hasPX('right') || this.textElement && this.blockStatic && this.cssInitial('textAlign') === 'right';
                }
                this._cached.rightAligned = result;
            }
            return result;
        }
        get bottomAligned() {
            let result = this._cached.bottomAligned;
            if (result === undefined) {
                result = !this.pageFlow && this.hasPX('bottom') && this.bottom >= 0 && !this.hasPX('top');
                this._cached.bottomAligned = result;
            }
            return result;
        }
        get horizontalAligned() {
            let result = this._cached.horizontalAligned;
            if (result === undefined) {
                result = !this.blockStatic && !this.autoMargin.horizontal && !(this.blockDimension && this.css('width') === '100%') && (!this.multiline || this.floating);
                this._cached.horizontalAligned = result;
            }
            return result;
        }
        get autoMargin() {
            var _a;
            let result = this._cached.autoMargin;
            if (result === undefined) {
                if (!this.pageFlow || this.blockStatic || this.display === 'table') {
                    const styleMap = ((_a = this._initial) === null || _a === void 0 ? void 0 : _a.styleMap) || this._styleMap;
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
        get overflow() {
            let result = this._cached.overflow;
            if (result === undefined) {
                result = 0;
                if (this.htmlElement && !this.inputElement && !this.imageElement && this.tagName !== 'HR' && !this.documentBody) {
                    const element = this._element;
                    const overflowX = this.css('overflowX');
                    const overflowY = this.css('overflowY');
                    if (this.hasHeight && (this.hasPX('height') || this.hasPX('maxHeight')) && (overflowY === 'scroll' || overflowY === 'auto' && element.clientHeight !== element.scrollHeight)) {
                        result |= 16 /* VERTICAL */;
                    }
                    if ((this.hasPX('width') || this.hasPX('maxWidth')) && (overflowX === 'scroll' || overflowX === 'auto' && element.clientWidth !== element.scrollWidth)) {
                        result |= 8 /* HORIZONTAL */;
                    }
                    if (overflowX === 'auto' || overflowX === 'hidden' || overflowX === 'overlay' || overflowY === 'auto' || overflowY === 'hidden' || overflowY === 'overlay') {
                        result |= 64 /* BLOCK */;
                    }
                }
                this._cached.overflow = result;
            }
            return result;
        }
        get overflowX() {
            return hasBit$1(this.overflow, 8 /* HORIZONTAL */);
        }
        get overflowY() {
            return hasBit$1(this.overflow, 16 /* VERTICAL */);
        }
        get baseline() {
            let result = this._cached.baseline;
            if (result === undefined) {
                if (this.pageFlow && !this.floating) {
                    const value = this.cssInitial('verticalAlign', false, true);
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
                result = this.css('verticalAlign');
                if (isLength(result, true)) {
                    result = this.parseUnit(result, 'height') + 'px';
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
            if (this.naturalChild && result === undefined) {
                if (this.textElement) {
                    result = actualTextRangeRect(this._element, this.sessionId);
                }
                else if (this.length) {
                    const nodes = this.cascade(node => node.length === 0);
                    if (nodes.length && nodes.every(item => item.textElement)) {
                        let top = Number.POSITIVE_INFINITY;
                        let right = Number.NEGATIVE_INFINITY;
                        let left = Number.POSITIVE_INFINITY;
                        let bottom = Number.NEGATIVE_INFINITY;
                        let numberOfLines = 0;
                        for (const node of nodes) {
                            const rect = actualTextRangeRect(node.element, node.sessionId);
                            top = Math.min(rect.top, top);
                            right = Math.max(rect.right, right);
                            left = Math.min(rect.left, left);
                            bottom = Math.max(rect.bottom, bottom);
                            numberOfLines += rect.numberOfLines || 0;
                        }
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
                this._textBounds = result;
            }
            return result;
        }
        get multiline() {
            var _a;
            let result = this._cached.multiline;
            if (result === undefined) {
                if (this.plainText) {
                    result = getRangeClientRect(this._element).numberOfLines > 1;
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
                        if (result !== '' && this.pageFlow && !this.plainText && !this.inputElement && (this._initial === undefined || this.cssInitial('backgroundColor') === result)) {
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
            var _a;
            let result = this._cached.backgroundImage;
            if (result === undefined) {
                const value = this.css('backgroundImage');
                if (value !== '' && value !== 'none' && value !== 'initial') {
                    result = value;
                }
                else {
                    result = ((_a = REGEX_BACKGROUND$1.exec(this.css('background'))) === null || _a === void 0 ? void 0 : _a[1]) || '';
                }
                this._cached.backgroundImage = result;
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
                        for (const repeat of this.css('backgroundRepeat').split(XML$2.SEPARATOR)) {
                            const [repeatX, repeatY] = repeat.split(' ');
                            if (!backgroundRepeatX) {
                                backgroundRepeatX = repeatX === 'repeat' || repeatX === 'repeat-x';
                            }
                            if (!backgroundRepeatY) {
                                backgroundRepeatY = repeatX === 'repeat' || repeatX === 'repeat-y' || repeatY === 'repeat';
                            }
                        }
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
                    while (result) {
                        const position = result.cssInitial('position', false, true);
                        if (result.documentBody || position !== 'static' && position !== 'initial') {
                            break;
                        }
                        result = result.actualParent;
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
                    const { left, right } = this.bounds;
                    result = right - left;
                }
                else if (this.display === 'table-cell' || Node.isFlexDirection(this, 'row')) {
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
                if (!this.plainText && this.display !== 'table-cell' && !Node.isFlexDirection(this, 'column')) {
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
            return length > 0 ? children[length - 1] : null;
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
            for (let i = children.length - 1; i >= 0; i--) {
                const node = children[i];
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
                    for (let i = 0; i < length; i++) {
                        const { name, value } = attributes.item(i);
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
            let result = this._fontSize;
            if (result === undefined) {
                const getFontSize = (style) => parseFloat(style.getPropertyValue('font-size'));
                result = this.naturalElement ? getFontSize(this.style) : parseUnit(this.css('fontSize'));
                if (result === 0 && !this.naturalChild) {
                    const element = this.element;
                    result = element && hasComputedStyle$1(element) ? getFontSize(getStyle$1(element)) : NaN;
                }
                while (isNaN(result)) {
                    const parent = this.actualParent;
                    if (parent) {
                        result = getFontSize(parent.style);
                    }
                    else {
                        result = getFontSize(getStyle$1(document.body));
                        break;
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
                result = {
                    fontFamily: this.css('fontFamily'),
                    fontSize: this.css('fontSize'),
                    fontWeight: this.css('fontWeight'),
                    fontStyle: this.css('fontStyle'),
                    color: this.css('color'),
                    whiteSpace: this.css('whiteSpace'),
                    textDecoration: this.css('textDecoration'),
                    textTransform: this.css('textTransform'),
                    letterSpacing: this.css('letterSpacing'),
                    wordSpacing: this.css('wordSpacing')
                };
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
    const { BOX_MARGIN, BOX_PADDING, BOX_POSITION, isPercent: isPercent$1 } = $lib$3.css;
    const { isTextNode: isTextNode$1, newBoxModel } = $lib$3.dom;
    const { equal } = $lib$3.math;
    const { XML: XML$3 } = $lib$3.regex;
    const { getElementAsNode: getElementAsNode$1 } = $lib$3.session;
    const { aboveRange: aboveRange$1, assignEmptyProperty, cloneObject, convertWord, filterArray: filterArray$1, hasBit: hasBit$2, isArray, searchObject, spliceArray, withinRange } = $lib$3.util;
    const CSS_SPACING_KEYS = Array.from(CSS_SPACING.keys());
    const INHERIT_ALIGNMENT = ['position', 'display', 'verticalAlign', 'float', 'clear', 'zIndex'];
    function cascadeActualPadding(children, attr, value) {
        let valid = false;
        for (const item of children) {
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
                    if (!cascadeActualPadding(item.naturalElements, attr, value)) {
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
    const isBlockWrap = (node) => node.blockVertical || node.percentWidth;
    const checkBlockDimension = (node, previous) => node.blockDimension && aboveRange$1(node.linear.top, previous.linear.bottom) && (isBlockWrap(node) || isBlockWrap(previous) || node.float !== previous.float);
    class NodeUI extends Node {
        constructor() {
            super(...arguments);
            this.alignmentType = 0;
            this.baselineActive = false;
            this.baselineAltered = false;
            this.positioned = false;
            this.rendered = false;
            this.excluded = false;
            this.floatContainer = false;
            this.lineBreakLeading = false;
            this.lineBreakTrailing = false;
            this._boxRegister = {};
            this._excludeSection = 0;
            this._excludeProcedure = 0;
            this._excludeResource = 0;
            this._childIndex = Number.POSITIVE_INFINITY;
            this._containerIndex = Number.POSITIVE_INFINITY;
            this._visible = true;
            this._locked = {};
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
            for (const item of list) {
                if (item.baseline && (!text || item.textElement) && !item.baselineAltered) {
                    if (item.naturalChildren.length) {
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
                        if (!a.plainText && b.plainText) {
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
        static linearData(list, clearOnly = false) {
            const floated = new Set();
            const cleared = new Map();
            let linearX = false;
            let linearY = false;
            if (list.length > 1) {
                const nodes = [];
                const floating = new Set();
                const clearable = {};
                for (const node of list) {
                    if (node.pageFlow) {
                        if (floating.size) {
                            const previousFloat = [];
                            const clear = node.css('clear');
                            switch (clear) {
                                case 'left':
                                    previousFloat.push(clearable.left);
                                    break;
                                case 'right':
                                    previousFloat.push(clearable.right);
                                    break;
                                case 'both':
                                    previousFloat.push(clearable.left, clearable.right);
                                    break;
                            }
                            if (!node.floating) {
                                for (const item of previousFloat) {
                                    if (item) {
                                        const float = item.float;
                                        if (floating.has(float) && aboveRange$1(node.linear.top, item.linear.bottom)) {
                                            floating.delete(float);
                                            clearable[float] = undefined;
                                        }
                                    }
                                }
                            }
                            if (clear === 'both') {
                                cleared.set(node, floating.size === 2 ? 'both' : floating.values().next().value);
                                floating.clear();
                                clearable.left = undefined;
                                clearable.right = undefined;
                            }
                            else if (floating.has(clear)) {
                                cleared.set(node, clear);
                                floating.delete(clear);
                                clearable[clear] = undefined;
                            }
                        }
                        if (node.floating) {
                            const float = node.float;
                            floating.add(float);
                            floated.add(float);
                            clearable[float] = node;
                        }
                        nodes.push(node);
                    }
                    else if (node.positionAuto) {
                        nodes.push(node);
                    }
                }
                const length = nodes.length;
                if (length) {
                    if (!clearOnly) {
                        const siblings = [nodes[0]];
                        let x = 1;
                        let y = 1;
                        for (let i = 1; i < length; i++) {
                            const node = nodes[i];
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
                        linearX = x === length;
                        linearY = y === length;
                        if (linearX && floated.size) {
                            let boxLeft = Number.POSITIVE_INFINITY;
                            let boxRight = Number.NEGATIVE_INFINITY;
                            let floatLeft = Number.NEGATIVE_INFINITY;
                            let floatRight = Number.POSITIVE_INFINITY;
                            for (const node of nodes) {
                                const { left, right } = node.linear;
                                boxLeft = Math.min(boxLeft, left);
                                boxRight = Math.max(boxRight, right);
                                if (node.float === 'left') {
                                    floatLeft = Math.max(floatLeft, right);
                                }
                                else if (node.float === 'right') {
                                    floatRight = Math.min(floatRight, left);
                                }
                            }
                            for (let i = 0, j = 0, k = 0, l = 0, m = 0; i < length; i++) {
                                const node = nodes[i];
                                const { left, right } = node.linear;
                                if (Math.floor(left) <= boxLeft) {
                                    j++;
                                }
                                if (Math.ceil(right) >= boxRight) {
                                    k++;
                                }
                                if (!node.floating) {
                                    if (left === floatLeft) {
                                        l++;
                                    }
                                    if (right === floatRight) {
                                        m++;
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
                                if (withinRange(left, previous.linear.left) || previous.floating && aboveRange$1(node.linear.top, previous.linear.bottom)) {
                                    linearX = false;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            else if (list.length) {
                linearY = list[0].blockStatic;
                linearX = !linearY;
            }
            return { linearX, linearY, cleared, floated };
        }
        static partitionRows(list) {
            var _a;
            const parent = list[0].actualParent;
            const cleared = ((_a = parent) === null || _a === void 0 ? void 0 : _a.floatContainer) ? NodeUI.linearData(parent.naturalChildren, true).cleared : undefined;
            const result = [];
            let row = [];
            let siblings = [];
            const length = list.length;
            for (let i = 0; i < length; i++) {
                const node = list[i];
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
            var _a;
            let obj = this['__' + name];
            if (value) {
                if (obj === undefined) {
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
                return ((_a = obj) === null || _a === void 0 ? void 0 : _a[attr]) || '';
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
                for (const attr of attrs) {
                    if (attr.includes('*')) {
                        for (const [key] of searchObject(obj, attr)) {
                            delete obj[key];
                        }
                    }
                    else {
                        delete obj[attr];
                    }
                }
            }
        }
        lockAttr(name, attr) {
            let locked = this._locked[name];
            if (locked === undefined) {
                locked = {};
                this._locked[name] = locked;
            }
            locked[attr] = true;
        }
        unlockAttr(name, attr) {
            const locked = this._locked[name];
            if (locked) {
                locked[attr] = false;
            }
        }
        lockedAttr(name, attr) {
            var _a;
            return ((_a = this._locked[name]) === null || _a === void 0 ? void 0 : _a[attr]) || false;
        }
        render(parent) {
            this.renderParent = parent;
            this.rendered = true;
        }
        parseUnit(value, dimension = 'width', parent = true, screenDimension) {
            return super.parseUnit(value, dimension, parent, screenDimension || this.localSettings.screenDimension);
        }
        renderEach(predicate) {
            const children = this.renderChildren;
            const length = children.length;
            for (let i = 0; i < length; i++) {
                const item = children[i];
                if (item.visible) {
                    predicate(item, i, children);
                }
            }
            return this;
        }
        renderFilter(predicate) {
            return filterArray$1(this.renderChildren, predicate);
        }
        hide(invisible) {
            var _a;
            const renderParent = this.renderParent;
            if (renderParent) {
                const renderTemplates = renderParent.renderTemplates;
                if (renderTemplates) {
                    const index = renderParent.renderChildren.findIndex(node => node === this);
                    if (index !== -1) {
                        const template = renderTemplates[index];
                        if (((_a = template) === null || _a === void 0 ? void 0 : _a.node) === this) {
                            renderTemplates[index] = null;
                        }
                    }
                }
            }
            this.rendered = true;
            this.visible = false;
        }
        inherit(node, ...modules) {
            for (const name of modules) {
                switch (name) {
                    case 'base': {
                        this._documentParent = node.documentParent;
                        this._bounds = Object.assign({}, node.bounds);
                        this._linear = Object.assign({}, node.linear);
                        this._box = Object.assign({}, node.box);
                        this._boxReset = newBoxModel();
                        this._boxAdjustment = newBoxModel();
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
                        for (const attr of INHERIT_ALIGNMENT) {
                            styleMap[attr] = node.css(attr);
                        }
                        if (!this.positionStatic) {
                            for (const attr of BOX_POSITION) {
                                if (node.hasPX(attr)) {
                                    styleMap[attr] = node.css(attr);
                                }
                            }
                        }
                        if (node.autoMargin.horizontal || node.autoMargin.vertical) {
                            for (const attr of BOX_MARGIN) {
                                if (node.cssInitial(attr) === 'auto') {
                                    styleMap[attr] = 'auto';
                                }
                            }
                        }
                        this.positionAuto = node.positionAuto;
                        break;
                    }
                    case 'styleMap':
                        assignEmptyProperty(this._styleMap, node.unsafe('styleMap'));
                        break;
                    case 'textStyle':
                        this.cssApply(node.textStyle);
                        this.fontSize = node.fontSize;
                        break;
                    case 'boxStyle': {
                        const { backgroundColor, backgroundImage } = node;
                        this.cssApply({
                            backgroundColor,
                            backgroundImage,
                            backgroundRepeat: node.css('backgroundRepeat'),
                            backgroundSize: node.css('backgroundSize'),
                            backgroundPositionX: node.css('backgroundPositionX'),
                            backgroundPositionY: node.css('backgroundPositionY'),
                            backgroundClip: node.css('backgroundClip'),
                            boxSizing: node.css('boxSizing'),
                            border: 'initial',
                            borderRadius: 'initial',
                            borderTopWidth: node.css('borderTopWidth'),
                            borderBottomWidth: node.css('borderBottomWidth'),
                            borderRightWidth: node.css('borderRightWidth'),
                            borderLeftWidth: node.css('borderLeftWidth'),
                            borderTopColor: node.css('borderTopColor'),
                            borderBottomColor: node.css('borderBottomColor'),
                            borderRightColor: node.css('borderRightColor'),
                            borderLeftColor: node.css('borderLeftColor'),
                            borderTopStyle: node.css('borderTopStyle'),
                            borderBottomStyle: node.css('borderBottomStyle'),
                            borderRightStyle: node.css('borderRightStyle'),
                            borderLeftStyle: node.css('borderLeftStyle'),
                            borderTopLeftRadius: node.css('borderTopLeftRadius'),
                            borderTopRightRadius: node.css('borderTopRightRadius'),
                            borderBottomRightRadius: node.css('borderBottomRightRadius'),
                            borderBottomLeftRadius: node.css('borderBottomLeftRadius')
                        }, true);
                        this.setCacheValue('backgroundColor', backgroundColor);
                        this.setCacheValue('backgroundImage', backgroundImage);
                        node.setCacheValue('backgroundColor', '');
                        node.setCacheValue('backgroundImage', '');
                        node.resetBox(30 /* MARGIN */ | 480 /* PADDING */, this);
                        const visibleStyle = node.visibleStyle;
                        visibleStyle.background = false;
                        visibleStyle.backgroundImage = false;
                        visibleStyle.backgroundColor = false;
                        visibleStyle.borderWidth = false;
                        break;
                    }
                }
            }
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
            return !hasBit$2(this.excludeResource, value);
        }
        hasProcedure(value) {
            return !hasBit$2(this.excludeProcedure, value);
        }
        hasSection(value) {
            return !hasBit$2(this.excludeSection, value);
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
            if (this.styleElement) {
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
                            for (const name of exclude.split(/\s*\|\s*/)) {
                                const i = enumeration[name.toUpperCase()] || 0;
                                if (i > 0 && !hasBit$2(offset, i)) {
                                    offset |= i;
                                }
                            }
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
            let valid = false;
            const children = this.children;
            const length = children.length;
            for (let i = 0; i < length; i++) {
                if (children[i] === node) {
                    children[i] = replacement;
                    replacement.parent = this;
                    replacement.containerIndex = node.containerIndex;
                    valid = true;
                    break;
                }
            }
            if (!valid && append) {
                replacement.parent = this;
                valid = true;
            }
            return valid;
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
            var _a, _b, _c, _d, _e;
            if (this.lineBreak) {
                return 2 /* LINEBREAK */;
            }
            else if (this.pageFlow || this.positionAuto) {
                if (isArray(siblings)) {
                    if ((_a = cleared) === null || _a === void 0 ? void 0 : _a.has(this)) {
                        return 5 /* FLOAT_CLEAR */;
                    }
                    else {
                        const previous = siblings[siblings.length - 1];
                        const floating = this.floating;
                        if (floating && previous.floating) {
                            const float = this.float;
                            if (horizontal && (float === previous.float || ((_b = cleared) === null || _b === void 0 ? void 0 : _b.size) && !siblings.some((item, index) => index > 0 && cleared.get(item) === float))) {
                                return 0 /* HORIZONTAL */;
                            }
                            else if (aboveRange$1(this.linear.top, previous.linear.bottom)) {
                                return 4 /* FLOAT_WRAP */;
                            }
                        }
                        else if (floating && siblings.some(item => item.multiline)) {
                            return 4 /* FLOAT_WRAP */;
                        }
                        else if (!floating && siblings.every(item => { var _a; return item.float === 'right' && aboveRange$1(((_a = this.textBounds) === null || _a === void 0 ? void 0 : _a.top) || Number.NEGATIVE_INFINITY, item.bounds.bottom); })) {
                            return 6 /* FLOAT_BLOCK */;
                        }
                        else if (horizontal !== undefined) {
                            if (floating && previous.blockStatic && !horizontal) {
                                return 0 /* HORIZONTAL */;
                            }
                            else if (!/^inline-/.test(this.display)) {
                                let { top, bottom } = this.linear;
                                if (this.textElement && ((_c = cleared) === null || _c === void 0 ? void 0 : _c.size) && siblings.some(item => cleared.has(item)) && siblings.some(item => top < item.linear.top && bottom > item.linear.bottom)) {
                                    return 7 /* FLOAT_INTERSECT */;
                                }
                                else if (siblings[0].float === 'right') {
                                    if (siblings.length > 1) {
                                        let maxBottom = Number.NEGATIVE_INFINITY;
                                        for (const item of siblings) {
                                            if (item.float === 'right') {
                                                maxBottom = Math.max(item.actualRect('bottom', 'bounds'), maxBottom);
                                            }
                                        }
                                        if (this.multiline) {
                                            if (this.styleText) {
                                                const textBounds = this.textBounds;
                                                if (textBounds) {
                                                    bottom = textBounds.bottom;
                                                }
                                            }
                                            const offset = bottom - maxBottom;
                                            top = offset <= 0 || offset / (bottom - top) < 0.5 ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
                                        }
                                        if (aboveRange$1(maxBottom, top)) {
                                            return horizontal ? 0 /* HORIZONTAL */ : 6 /* FLOAT_BLOCK */;
                                        }
                                        else {
                                            return horizontal ? 6 /* FLOAT_BLOCK */ : 0 /* HORIZONTAL */;
                                        }
                                    }
                                    else if (!horizontal) {
                                        return 6 /* FLOAT_BLOCK */;
                                    }
                                }
                            }
                        }
                        if (checkBlockDimension(this, previous)) {
                            return 3 /* INLINE_WRAP */;
                        }
                    }
                }
                for (const previous of this.siblingsLeading) {
                    if (previous.blockStatic || previous.autoMargin.leftRight) {
                        return 1 /* VERTICAL */;
                    }
                    else if (previous.lineBreak) {
                        return 2 /* LINEBREAK */;
                    }
                    else {
                        const blockStatic = this.blockStatic || this.display === 'table';
                        if (blockStatic && (!previous.floating || !previous.rightAligned && withinRange(previous.linear.right, (this.actualParent || this.documentParent).box.right) || ((_d = cleared) === null || _d === void 0 ? void 0 : _d.has(previous)))) {
                            return 1 /* VERTICAL */;
                        }
                        else if (previous.floating) {
                            if (this.blockDimension && this.css('width') === '100%' && !this.hasPX('maxWidth') || previous.float === 'left' && this.autoMargin.right || previous.float === 'right' && this.autoMargin.left) {
                                return 1 /* VERTICAL */;
                            }
                            else if (blockStatic && this.some(item => item.floating && aboveRange$1(item.linear.top, previous.linear.bottom))) {
                                return 6 /* FLOAT_BLOCK */;
                            }
                        }
                    }
                    if (((_e = cleared) === null || _e === void 0 ? void 0 : _e.get(previous)) === 'both' && (!isArray(siblings) || siblings[0] !== previous)) {
                        return 5 /* FLOAT_CLEAR */;
                    }
                    else if (checkBlockDimension(this, previous)) {
                        return 3 /* INLINE_WRAP */;
                    }
                }
            }
            return 0 /* HORIZONTAL */;
        }
        previousSiblings(options = {}) {
            var _a, _b, _c;
            return traverseElementSibling(options, (!this.nodeGroup && ((_a = this.innerMostWrapped.element) === null || _a === void 0 ? void 0 : _a.previousSibling) || ((_c = (_b = this.firstChild) === null || _b === void 0 ? void 0 : _b.element) === null || _c === void 0 ? void 0 : _c.previousSibling)), 'previousSibling', this.sessionId);
        }
        nextSiblings(options = {}) {
            var _a, _b, _c;
            return traverseElementSibling(options, (!this.nodeGroup && ((_a = this.innerMostWrapped.element) === null || _a === void 0 ? void 0 : _a.nextSibling) || ((_c = (_b = this.firstChild) === null || _b === void 0 ? void 0 : _b.element) === null || _c === void 0 ? void 0 : _c.nextSibling)), 'nextSibling', this.sessionId);
        }
        modifyBox(region, offset, negative = true) {
            if (offset !== 0) {
                const attr = CSS_SPACING.get(region);
                if (attr) {
                    const setBoxReset = () => {
                        let boxReset = this._boxReset;
                        if (boxReset === undefined) {
                            boxReset = newBoxModel();
                            this._boxReset = boxReset;
                        }
                        boxReset[attr] = 1;
                    };
                    const node = this._boxRegister[region];
                    if (offset === undefined) {
                        if (node) {
                            const value = this[attr] || node.getBox(region)[1];
                            if (value > 0) {
                                node.modifyBox(region, -value, false);
                            }
                        }
                        else {
                            setBoxReset();
                        }
                    }
                    else {
                        if (node) {
                            node.modifyBox(region, offset, negative);
                        }
                        else {
                            let boxAdjustment = this._boxAdjustment;
                            if (boxAdjustment === undefined) {
                                boxAdjustment = newBoxModel();
                                this._boxAdjustment = boxAdjustment;
                            }
                            if (!negative) {
                                if (this[attr] + boxAdjustment[attr] + offset <= 0) {
                                    if (this.naturalChild) {
                                        setBoxReset();
                                    }
                                    boxAdjustment[attr] = 0;
                                    return;
                                }
                            }
                            boxAdjustment[attr] += offset;
                        }
                    }
                }
            }
        }
        getBox(region) {
            var _a, _b;
            const attr = CSS_SPACING.get(region);
            return attr ? [((_a = this._boxReset) === null || _a === void 0 ? void 0 : _a[attr]) || 0, ((_b = this._boxAdjustment) === null || _b === void 0 ? void 0 : _b[attr]) || 0] : [0, 0];
        }
        resetBox(region, node) {
            let boxReset = this._boxReset;
            if (boxReset === undefined) {
                boxReset = newBoxModel();
                this._boxReset = boxReset;
            }
            const applyReset = (attrs, start) => {
                for (let i = 0; i < 4; i++) {
                    const key = CSS_SPACING_KEYS[i + start];
                    if (hasBit$2(region, key)) {
                        boxReset[attrs[i]] = 1;
                        if (node) {
                            const previous = this.registerBox(key);
                            if (previous) {
                                previous.resetBox(key, node);
                            }
                            else {
                                if (this.naturalChild) {
                                    const value = this[CSS_SPACING.get(key)];
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
            let boxAdjustment = this._boxAdjustment;
            if (boxAdjustment === undefined) {
                boxAdjustment = newBoxModel();
                this._boxAdjustment = boxAdjustment;
            }
            const applyReset = (attrs, start) => {
                for (let i = 0; i < 4; i++) {
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
            return boxRegister[region];
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
                        let reset = false;
                        if (canCascadeChildren(node)) {
                            reset = cascadeActualPadding(node.naturalElements, attr, value);
                        }
                        return reset ? 0 : value;
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
                for (const attr of attrs) {
                    switch (attr) {
                        case 'top':
                        case 'right':
                        case 'bottom':
                        case 'left':
                            cached.positionAuto = undefined;
                            break;
                        case 'lineHeight':
                            cached.baselineHeight = undefined;
                            break;
                    }
                }
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
            return this._element || this.innerMostWrapped.unsafe('element') || null;
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
        get excludeSection() {
            return this._excludeSection;
        }
        get excludeProcedure() {
            return this._excludeProcedure;
        }
        get excludeResource() {
            return this._excludeResource;
        }
        get layoutHorizontal() {
            return this.hasAlign(8 /* HORIZONTAL */);
        }
        get layoutVertical() {
            return this.hasAlign(16 /* VERTICAL */);
        }
        get nodeGroup() {
            return false;
        }
        set renderAs(value) {
            var _a;
            if (!this.rendered && ((_a = value) === null || _a === void 0 ? void 0 : _a.rendered) === false) {
                this._renderAs = value;
            }
        }
        get renderAs() {
            return this._renderAs;
        }
        get blockStatic() {
            return super.blockStatic || this.hasAlign(64 /* BLOCK */) && !this.floating;
        }
        get rightAligned() {
            return super.rightAligned || this.hasAlign(2048 /* RIGHT */);
        }
        set positionAuto(value) {
            this._cached.positionAuto = value;
        }
        get positionAuto() {
            var _a;
            let result = this._cached.positionAuto;
            if (result === undefined) {
                if (this.pageFlow) {
                    result = false;
                }
                else {
                    const { top, right, bottom, left } = ((_a = this._initial) === null || _a === void 0 ? void 0 : _a.styleMap) || this._styleMap;
                    result = (!top || top === 'auto') && (!right || right === 'auto') && (!bottom || bottom === 'auto') && (!left || left === 'auto') && this.toFloat('opacity', 1) > 0;
                }
                this._cached.positionAuto = result;
            }
            return result;
        }
        set flexbox(value) {
            this._cached.flexbox = value;
        }
        get flexbox() {
            return super.flexbox;
        }
        set contentBoxWidth(value) {
            this._cached.contentBoxWidth = value;
        }
        get contentBoxWidth() {
            return super.contentBoxWidth;
        }
        set contentBoxHeight(value) {
            this._cached.contentBoxHeight = value;
        }
        get contentBoxHeight() {
            return super.contentBoxHeight;
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
        set overflow(value) {
            if (value === 0 || value === 16 /* VERTICAL */ || value === 8 /* HORIZONTAL */ || value === (8 /* HORIZONTAL */ | 16 /* VERTICAL */)) {
                if (hasBit$2(this.overflow, 64 /* BLOCK */)) {
                    value |= 64 /* BLOCK */;
                }
                this._cached.overflow = value;
            }
        }
        get overflow() {
            return super.overflow;
        }
        get baseline() {
            return super.baseline;
        }
        get baselineElement() {
            let result = this._cached.baselineElement;
            if (result === undefined) {
                if (this.baseline) {
                    const children = this.naturalElements;
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
            if (!this.rendered || this._controlName === undefined) {
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
                    for (let i = index - 1; i >= 0; i--) {
                        const node = children[i];
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
                    for (let i = index + 1; i < length; i++) {
                        const node = children[i];
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
            return (_b = (_a = this.renderParent) === null || _a === void 0 ? void 0 : _a.renderChildren.length, (_b !== null && _b !== void 0 ? _b : (_c = this.parent) === null || _c === void 0 ? void 0 : _c.length)) === 1 && !this.documentRoot;
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
                            const childNodes = parentElement.childNodes;
                            const length = childNodes.length;
                            for (let i = 0; i < length; i++) {
                                if (childNodes[i] === element) {
                                    result = i;
                                    this._childIndex = i;
                                }
                            }
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
                if (this.styleElement && !this.imageElement && !this.svgElement && this.tagName !== 'HR') {
                    const value = this.textContent;
                    result = value === '' || !this.preserveWhiteSpace && !this.pseudoElement && value.trim() === '';
                }
                else {
                    result = false;
                }
                this._cached.textEmpty = result;
            }
            return result;
        }
        get percentWidth() {
            let result = this._cached.percentWidth;
            if (result === undefined) {
                result = isPercent$1(this.cssInitial('width'));
                this._cached.percentWidth = result;
            }
            return result;
        }
        get percentHeight() {
            let result = this._cached.percentHeight;
            if (result === undefined) {
                result = isPercent$1(this.cssInitial('height'));
                this._cached.percentHeight = result;
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
        set fontSize(value) {
            this._fontSize = value;
        }
        get fontSize() {
            return super.fontSize;
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

    const { aboveRange: aboveRange$2, hasBit: hasBit$3 } = squared.lib.util;
    class LayoutUI extends squared.lib.base.Container {
        constructor(parent, node, containerType = 0, alignmentType = 0, children) {
            var _a;
            super(children);
            this.parent = parent;
            this.node = node;
            this.containerType = containerType;
            this.alignmentType = alignmentType;
            this.rowCount = 0;
            this.columnCount = 0;
            this.renderType = 0;
            this.renderIndex = -1;
            this.itemCount = 0;
            if ((_a = children) === null || _a === void 0 ? void 0 : _a.length) {
                this.init();
            }
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
            const children = this.children;
            const length = children.length;
            if (length) {
                let floatedSize;
                if (length > 1) {
                    const linearData = NodeUI.linearData(children);
                    const floated = linearData.floated;
                    this._floated = floated;
                    this._cleared = linearData.cleared;
                    this._linearX = linearData.linearX;
                    this._linearY = linearData.linearY;
                    floatedSize = floated.size;
                }
                else {
                    this._linearY = children[0].blockStatic;
                    this._linearX = !this._linearY;
                    floatedSize = 0;
                }
                let A = true;
                let B = true;
                for (let i = 0; i < length; i++) {
                    const item = children[i];
                    if (!item.floating) {
                        A = false;
                    }
                    if (!item.rightAligned) {
                        B = false;
                    }
                    if (!A && !B) {
                        break;
                    }
                }
                if (A || floatedSize === 2) {
                    this.add(512 /* FLOAT */);
                    if (this.some(node => node.blockStatic)) {
                        this.add(64 /* BLOCK */);
                    }
                }
                if (B) {
                    this.add(2048 /* RIGHT */);
                }
                this.itemCount = length;
            }
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
        get linearX() {
            var _a;
            return _a = this._linearX, (_a !== null && _a !== void 0 ? _a : true);
        }
        get linearY() {
            var _a;
            return _a = this._linearY, (_a !== null && _a !== void 0 ? _a : false);
        }
        get floated() {
            return this._floated || new Set();
        }
        get cleared() {
            return this._cleared || new Map();
        }
        set type(value) {
            this.setContainerType(value.containerType, value.alignmentType);
        }
        get singleRowAligned() {
            let result = this._singleRow;
            if (result === undefined) {
                const length = this.length;
                if (length) {
                    result = true;
                    if (length > 1) {
                        let previousBottom = Number.POSITIVE_INFINITY;
                        for (const node of this.children) {
                            if (node.blockStatic || node.multiline || aboveRange$2(node.linear.top, previousBottom)) {
                                result = false;
                                break;
                            }
                            previousBottom = node.linear.bottom;
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
        get visible() {
            return this.filter(node => node.visible);
        }
    }

    const $lib$4 = squared.lib;
    const { BOX_POSITION: BOX_POSITION$1, convertListStyle, formatPX: formatPX$1, getStyle: getStyle$2, insertStyleSheetRule: insertStyleSheetRule$1, isLength: isLength$1, resolveURL } = $lib$4.css;
    const { getNamedItem: getNamedItem$1, getRangeClientRect: getRangeClientRect$1, isTextNode: isTextNode$2, removeElementsByClassName } = $lib$4.dom;
    const { aboveRange: aboveRange$3, convertFloat: convertFloat$1, convertWord: convertWord$1, filterArray: filterArray$2, flatArray, fromLastIndexOf: fromLastIndexOf$2, hasBit: hasBit$4, isString: isString$2, partitionArray, trimString: trimString$1 } = $lib$4.util;
    const { XML: XML$4 } = $lib$4.regex;
    const { getElementCache: getElementCache$2, getPseudoElt: getPseudoElt$1, setElementCache: setElementCache$2 } = $lib$4.session;
    const { isPlainText } = $lib$4.xml;
    const REGEX_COUNTER = /\s*(?:attr\(([^)]+)\)|(counter)\(([^,)]+)(?:, ([a-z-]+))?\)|(counters)\(([^,]+), "([^"]*)"(?:, ([a-z-]+))?\)|"([^"]+)")\s*/g;
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
        let stored = preAlignment[id];
        if (stored === undefined) {
            stored = {};
            preAlignment[id] = stored;
        }
        stored[attr] = restoreValue;
        element.style.setProperty(attr, value);
    }
    function getCounterValue(name, counterName) {
        if (name !== 'none') {
            const pattern = /\s*([^\-\d][^\-\d]?[^ ]*) (-?\d+)\s*/g;
            let match;
            while ((match = pattern.exec(name)) !== null) {
                if (match[1] === counterName) {
                    return parseInt(match[2]);
                }
            }
        }
        return undefined;
    }
    function getCounterIncrementValue(parent, counterName, pseudoElt, sessionId) {
        var _a;
        const pseduoStyle = getElementCache$2(parent, 'styleMap' + pseudoElt, sessionId);
        if ((_a = pseduoStyle) === null || _a === void 0 ? void 0 : _a.counterIncrement) {
            return getCounterValue(pseduoStyle.counterIncrement, counterName);
        }
        return undefined;
    }
    function checkTraverseHorizontal(node, horizontal, vertical, extended) {
        if (vertical.length || extended) {
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
            for (const ext of extensions) {
                const index = included.indexOf(ext.name);
                if (index !== -1) {
                    result[index] = ext;
                }
                else {
                    untagged.push(ext);
                }
            }
            if (result.length) {
                return flatArray(result).concat(untagged);
            }
        }
        return extensions;
    }
    const requirePadding = (node) => node.textElement && (node.blockStatic || node.multiline);
    class ApplicationUI extends Application {
        constructor(framework, nodeConstructor, ControllerConstructor, ResourceConstructor, ExtensionManagerConstructor) {
            super(framework, nodeConstructor, ControllerConstructor, ResourceConstructor, ExtensionManagerConstructor);
            this.session = {
                cache: new NodeList(),
                excluded: new NodeList(),
                extensionMap: new Map(),
                active: [],
                documentRoot: [],
                targetQueue: new Map()
            };
            this.builtInExtensions = {};
            this.extensions = [];
            this._layouts = [];
            const localSettings = this.controllerHandler.localSettings;
            this._localSettings = localSettings;
            this._excluded = localSettings.unsupported.excluded;
        }
        finalize() {
            var _a, _b;
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
                else if (node.renderParent === undefined) {
                    cache.remove(node);
                }
            }
            const children = cache.children;
            const length = children.length;
            const rendered = new Array(length);
            let j = 0;
            for (let i = 0; i < length; i++) {
                const node = children[i];
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
            for (const ext of extensions) {
                for (const node of ext.subscribers) {
                    ext.postOptimize(node);
                }
            }
            for (const node of rendered) {
                if (node.hasResource(NODE_RESOURCE.BOX_SPACING)) {
                    node.setBoxSpacing();
                }
            }
            for (const ext of extensions) {
                ext.beforeCascade();
            }
            const baseTemplate = this._localSettings.layout.baseTemplate;
            for (const layout of session.documentRoot) {
                const node = layout.node;
                if (node.documentRoot && node.renderChildren.length === 0 && !node.inlineText && node.naturalElements.every(item => item.documentRoot)) {
                    continue;
                }
                const renderTemplates = (_a = node.renderParent) === null || _a === void 0 ? void 0 : _a.renderTemplates;
                if (renderTemplates) {
                    this.saveDocument(layout.layoutName, baseTemplate + controllerHandler.cascadeDocument(renderTemplates, 0), node.dataset.pathname, ((_b = node.renderExtension) === null || _b === void 0 ? void 0 : _b.some(item => item.documentBase)) ? 0 : undefined);
                }
            }
            this.resourceHandler.finalize(layouts);
            controllerHandler.finalize(layouts);
            for (const ext of extensions) {
                ext.afterFinalize();
            }
            removeElementsByClassName('__squared.pseudo');
            this.closed = true;
        }
        copyToDisk(directory, callback) {
            super.copyToDisk(directory, callback, this.layouts);
        }
        appendToArchive(pathname) {
            super.appendToArchive(pathname, this.layouts);
        }
        saveToArchive(filename) {
            super.saveToArchive(filename, this.layouts);
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
            session.documentRoot.length = 0;
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
                            return this.isUseElement(element);
                    }
                    let current = element.parentElement;
                    while (current) {
                        if (getStyle$2(current).display === 'none') {
                            return this.isUseElement(element);
                        }
                        current = current.parentElement;
                    }
                    const controllerHandler = this.controllerHandler;
                    const children = element.children;
                    const length = children.length;
                    for (let i = 0; i < length; i++) {
                        if (controllerHandler.visibleElement(children[i])) {
                            return true;
                        }
                    }
                    return this.isUseElement(element);
                }
            }
            return false;
        }
        insertNode(element, parent, pseudoElt) {
            var _a;
            if (isTextNode$2(element)) {
                if (isPlainText(element.textContent) || ((_a = parent) === null || _a === void 0 ? void 0 : _a.preserveWhiteSpace) && (parent.tagName !== 'PRE' || parent.element.childElementCount === 0)) {
                    this.controllerHandler.applyDefaultStyles(element);
                    const node = this.createNode({ parent, element, append: false });
                    if (parent) {
                        node.cssApply(parent.textStyle);
                        node.fontSize = parent.fontSize;
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
            if (isString$2(content)) {
                const layout = {
                    pathname: pathname ? trimString$1(pathname, '/') : this._localSettings.layout.pathName,
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
                        let renderTemplates = parent.renderTemplates;
                        if (renderTemplates === undefined) {
                            renderTemplates = [];
                            parent.renderTemplates = renderTemplates;
                        }
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
                    node.hide();
                    node.excluded = true;
                }
                return true;
            }
            return false;
        }
        createNode(options) {
            const processing = this.processing;
            const { element, parent, children, replace } = options;
            const node = new this.Node(this.nextId, processing.sessionId, element, this.controllerHandler.afterInsertNode);
            if (parent) {
                node.depth = parent.depth + 1;
                if (parent.naturalElement && (!element || element.parentElement === null)) {
                    node.actualParent = parent;
                }
                if (replace && parent.appendTry(replace, node, false)) {
                    replace.parent = node;
                    node.innerWrapped = replace;
                }
            }
            if (children) {
                for (const item of children) {
                    item.parent = node;
                }
            }
            if (options.append !== false) {
                processing.cache.append(node, children !== undefined);
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
                    parent.visible = false;
                    parent.exclude({
                        resource: NODE_RESOURCE.FONT_STYLE | NODE_RESOURCE.VALUE_STRING,
                        procedure: NODE_PROCEDURE.ALL,
                        section: APP_SECTION.EXTENSION
                    });
                    cache.append(parent);
                }
                node.documentParent = parent;
                for (const item of cache) {
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
                            for (const attr of BOX_POSITION$1) {
                                if (item.hasPX(attr)) {
                                    saveAlignment(preAlignment, element, item.id, attr, 'auto', item.css(attr));
                                    resetBounds = true;
                                }
                            }
                        }
                        if (item.dir === 'rtl') {
                            element.dir = 'ltr';
                            direction.add(element);
                        }
                    }
                }
                if (!resetBounds && direction.size) {
                    resetBounds = true;
                }
                for (const item of this.processing.excluded) {
                    if (!item.pageFlow) {
                        item.cssTry('display', 'none');
                    }
                }
                parent.setBounds();
                for (const item of cache) {
                    if (!item.pseudoElement) {
                        item.setBounds(preAlignment[item.id] === undefined && !resetBounds);
                        if (node.styleText) {
                            item.textBounds = getRangeClientRect$1(node.element);
                        }
                    }
                    else {
                        pseudoElements.push(item);
                    }
                }
                if (pseudoElements.length) {
                    const pseudoMap = [];
                    for (const item of pseudoElements) {
                        const parentElement = item.actualParent.element;
                        let id = parentElement.id;
                        let styleElement;
                        if (item.pageFlow) {
                            if (id === '') {
                                id = '__squared_' + Math.round(Math.random() * new Date().getTime());
                                parentElement.id = id;
                            }
                            styleElement = insertStyleSheetRule$1(`#${id + getPseudoElt$1(item.element, item.sessionId)} { display: none !important; }`);
                        }
                        if (item.cssTry('display', item.display)) {
                            pseudoMap.push({ item, id, parentElement, styleElement });
                        }
                    }
                    for (const data of pseudoMap) {
                        data.item.setBounds(false);
                    }
                    for (const data of pseudoMap) {
                        const { item, parentElement, styleElement } = data;
                        if (/^__squared_/.test(data.id)) {
                            parentElement.id = '';
                        }
                        if (styleElement) {
                            try {
                                document.head.removeChild(styleElement);
                            }
                            catch (_a) {
                            }
                        }
                        item.cssFinally('display');
                    }
                }
                for (const item of this.processing.excluded) {
                    if (!item.lineBreak) {
                        item.setBounds();
                        item.saveAsInitial();
                    }
                    if (!item.pageFlow) {
                        item.cssFinally('display');
                    }
                }
                for (const item of cache) {
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
                }
                controllerHandler.evaluateNonStatic(node, cache);
                controllerHandler.sortInitialCache();
                return true;
            }
            return false;
        }
        afterCreateCache(element) {
            const dataset = element.dataset;
            const { filename, iteration } = dataset;
            const prefix = isString$2(filename) && filename.replace(new RegExp(`\\.${this._localSettings.layout.fileExtension}$`), '') || element.id || 'document_' + this.length;
            const suffix = (iteration ? parseInt(iteration) : -1) + 1;
            const layoutName = convertWord$1(suffix > 1 ? prefix + '_' + suffix : prefix, true);
            dataset.iteration = suffix.toString();
            dataset.layoutName = layoutName;
            this.setBaseLayout();
            this.setConstraints();
            this.setResources(layoutName);
        }
        resolveTarget(target) {
            if (isString$2(target)) {
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
        toString() {
            var _a;
            return ((_a = this._layouts[0]) === null || _a === void 0 ? void 0 : _a.content) || '';
        }
        cascadeParentNode(parentElement, depth, extensions) {
            var _a;
            const node = this.insertNode(parentElement);
            if (node && (node.display !== 'none' || depth === 0 || node.outerExtensionElement)) {
                node.depth = depth;
                if (depth === 0) {
                    this._cache.append(node);
                    const extensionManager = this.extensionManager;
                    for (const name of node.extensions) {
                        const ext = extensionManager.retrieve(name);
                        if ((_a = ext) === null || _a === void 0 ? void 0 : _a.cascadeAll) {
                            this._cascadeAll = true;
                            break;
                        }
                    }
                }
                const controllerHandler = this.controllerHandler;
                if (controllerHandler.preventNodeCascade(parentElement)) {
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
                let j = 0;
                let k = 0;
                for (let i = 0; i < length; i++) {
                    const element = childNodes[i];
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
                            if (child && (!child.excluded || child.tagName === 'WBR')) {
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
                if (this.userSettings.createQuerySelectorMap && k > 0) {
                    node.queryMap = this.createQueryMap(elements);
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
                    for (let i = 0, j = 0; i < length; i++) {
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
                    }
                    child.actualParent = node;
                }
            }
            else {
                inlineText = !node.textEmpty;
            }
            node.inlineText = inlineText;
        }
        createPseduoElement(element, pseudoElt, sessionId) {
            var _a;
            let styleMap = getElementCache$2(element, 'styleMap' + pseudoElt, sessionId);
            let nested = 0;
            if (element.tagName === 'Q') {
                if (styleMap === undefined) {
                    styleMap = {};
                    setElementCache$2(element, 'styleMap' + pseudoElt, sessionId, styleMap);
                }
                let content = styleMap.content;
                if (typeof content !== 'string' || content === '') {
                    content = getStyle$2(element, pseudoElt).getPropertyValue('content') || (pseudoElt === '::before' ? 'open-quote' : 'close-quote');
                    styleMap.content = content;
                }
                if (/-quote$/.test(content)) {
                    let parent = element.parentElement;
                    while (((_a = parent) === null || _a === void 0 ? void 0 : _a.tagName) === 'Q') {
                        nested++;
                        parent = parent.parentElement;
                    }
                }
            }
            if (styleMap) {
                let value = styleMap.content;
                if (value) {
                    if (trimString$1(value, '"').trim() === '' && convertFloat$1(styleMap.width) === 0 && convertFloat$1(styleMap.height) === 0 && (styleMap.position === 'absolute' || styleMap.position === 'fixed' || styleMap.clear && styleMap.clear !== 'none')) {
                        let valid = true;
                        for (const attr in styleMap) {
                            if (/(Width|Height)$/.test(attr)) {
                                const dimension = styleMap[attr];
                                if (isLength$1(dimension, true) && convertFloat$1(dimension) !== 0) {
                                    valid = false;
                                    break;
                                }
                            }
                        }
                        if (valid) {
                            return undefined;
                        }
                    }
                    if (value === 'inherit') {
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
                    if (styleMap.fontFamily === undefined) {
                        styleMap.fontFamily = style.getPropertyValue('font-family');
                    }
                    if (styleMap.fontSize === undefined) {
                        styleMap.fontSize = style.getPropertyValue('font-size');
                    }
                    if (styleMap.fontWeight === undefined) {
                        styleMap.fontWeight = style.getPropertyValue('font-weight');
                    }
                    if (styleMap.color === undefined) {
                        styleMap.color = style.getPropertyValue('color');
                    }
                    if (styleMap.display === undefined) {
                        styleMap.display = 'inline';
                    }
                    let tagName = /^inline/.test(styleMap.display) ? 'span' : 'div';
                    let content = '';
                    switch (value) {
                        case 'normal':
                        case 'none':
                        case 'initial':
                        case 'inherit':
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
                        default:
                            if (/^url\(/.test(value)) {
                                content = resolveURL(value);
                                const format = fromLastIndexOf$2(content, '.').toLowerCase();
                                const imageFormat = this._localSettings.supported.imageFormat;
                                if (imageFormat === '*' || imageFormat.includes(format)) {
                                    tagName = 'img';
                                }
                                else {
                                    content = '';
                                }
                            }
                            else {
                                let found = false;
                                let match;
                                while ((match = REGEX_COUNTER.exec(value)) !== null) {
                                    const attr = match[1];
                                    if (attr) {
                                        content += getNamedItem$1(element, attr.trim());
                                    }
                                    else if (match[2] || match[5]) {
                                        const counterType = match[2] === 'counter';
                                        const [counterName, styleName] = counterType ? [match[3], match[4] || 'decimal'] : [match[6], match[8] || 'decimal'];
                                        const initialValue = (getCounterIncrementValue(element, counterName, pseudoElt, sessionId) || 0) + (getCounterValue(style.getPropertyValue('counter-reset'), counterName) || 0);
                                        const subcounter = [];
                                        let current = element;
                                        let counter = initialValue;
                                        let ascending = false;
                                        let lastResetElement;
                                        const incrementCounter = (increment, pseudo) => {
                                            if (subcounter.length === 0) {
                                                counter += increment;
                                            }
                                            else if (ascending || pseudo) {
                                                subcounter[subcounter.length - 1] += increment;
                                            }
                                        };
                                        const cascadeCounterSibling = (sibling) => {
                                            if (getCounterValue(getStyle$2(sibling).getPropertyValue('counter-reset'), counterName) === undefined) {
                                                const children = sibling.children;
                                                const length = children.length;
                                                for (let i = 0; i < length; i++) {
                                                    const child = children[i];
                                                    if (child.className !== '__squared.pseudo') {
                                                        let increment = getCounterIncrementValue(child, counterName, pseudoElt, sessionId);
                                                        if (increment) {
                                                            incrementCounter(increment, true);
                                                        }
                                                        const childStyle = getStyle$2(child);
                                                        increment = getCounterValue(childStyle.getPropertyValue('counter-increment'), counterName);
                                                        if (increment) {
                                                            incrementCounter(increment, false);
                                                        }
                                                        increment = getCounterValue(childStyle.getPropertyValue('counter-reset'), counterName);
                                                        if (increment !== undefined) {
                                                            return;
                                                        }
                                                        cascadeCounterSibling(child);
                                                    }
                                                }
                                            }
                                        };
                                        do {
                                            ascending = false;
                                            if (current.previousElementSibling) {
                                                current = current.previousElementSibling;
                                                cascadeCounterSibling(current);
                                            }
                                            else if (current.parentElement) {
                                                current = current.parentElement;
                                                ascending = true;
                                            }
                                            else {
                                                break;
                                            }
                                            if (current.className !== '__squared.pseudo') {
                                                const pesudoIncrement = getCounterIncrementValue(current, counterName, pseudoElt, sessionId);
                                                if (pesudoIncrement) {
                                                    incrementCounter(pesudoIncrement, true);
                                                }
                                                const currentStyle = getStyle$2(current);
                                                const counterIncrement = getCounterValue(currentStyle.getPropertyValue('counter-increment'), counterName) || 0;
                                                if (counterIncrement) {
                                                    incrementCounter(counterIncrement, false);
                                                }
                                                const counterReset = getCounterValue(currentStyle.getPropertyValue('counter-reset'), counterName);
                                                if (counterReset !== undefined) {
                                                    if (lastResetElement === undefined) {
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
                                        } while (true);
                                        if (lastResetElement) {
                                            if (!counterType && subcounter.length > 1) {
                                                subcounter.reverse();
                                                subcounter.splice(1, 1);
                                                for (const leading of subcounter) {
                                                    content += convertListStyle(styleName, leading, true) + match[7];
                                                }
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
                                REGEX_COUNTER.lastIndex = 0;
                            }
                            break;
                    }
                    if (content || value === '""') {
                        const pseudoElement = createPseudoElement(element, tagName, pseudoElt === '::before' ? 0 : -1);
                        if (tagName === 'img') {
                            pseudoElement.src = content;
                            const image = this.resourceHandler.getImage(content);
                            if (image) {
                                if (styleMap.width === undefined) {
                                    if (image.width > 0) {
                                        styleMap.width = formatPX$1(image.width);
                                    }
                                }
                                if (styleMap.height === undefined) {
                                    if (image.height > 0) {
                                        styleMap.height = formatPX$1(image.height);
                                    }
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
        setBaseLayout() {
            const { processing, session } = this;
            const cache = processing.cache;
            const documentRoot = processing.node;
            const extensionMap = session.extensionMap;
            const mapY = new Map();
            let extensions = filterArray$2(this.extensions, item => !item.eventOnly);
            let maxDepth = 0;
            function setMapY(depth, id, node) {
                const index = mapY.get(depth) || new Map();
                mapY.set(depth, index.set(id, node));
            }
            function removeMapY(node) {
                const index = mapY.get(node.depth);
                if (index) {
                    index.delete(node.id);
                }
            }
            setMapY(-1, 0, documentRoot.parent);
            for (const node of cache) {
                if (node.length) {
                    const depth = node.depth;
                    setMapY(depth, node.id, node);
                    maxDepth = Math.max(depth, maxDepth);
                }
            }
            for (let i = 0; i < maxDepth; i++) {
                mapY.set((i * -1) - 2, new Map());
            }
            cache.afterAppend = (node) => {
                setMapY((node.depth * -1) - 2, node.id, node);
                for (const item of node.cascade()) {
                    if (item.length) {
                        removeMapY(item);
                        setMapY((item.depth * -1) - 2, item.id, item);
                    }
                }
            };
            for (const ext of this.extensions) {
                ext.beforeBaseLayout();
            }
            for (const depth of mapY.values()) {
                for (const parent of depth.values()) {
                    if (parent.length === 0) {
                        continue;
                    }
                    const floatContainer = parent.floatContainer;
                    const renderExtension = parent.renderExtension;
                    const axisY = parent.duplicate();
                    const length = axisY.length;
                    let cleared;
                    if (floatContainer) {
                        cleared = NodeUI.linearData(parent.naturalElements, true).cleared;
                    }
                    for (let k = 0; k < length; k++) {
                        let nodeY = axisY[k];
                        if (nodeY.rendered || !nodeY.visible || nodeY.naturalElement && this.rootElements.has(nodeY.element) && !nodeY.documentRoot) {
                            continue;
                        }
                        let parentY = nodeY.parent;
                        if (length > 1 && k < length - 1 && nodeY.pageFlow && !nodeY.nodeGroup && (parentY.alignmentType === 0 || parentY.hasAlign(2 /* UNKNOWN */) || nodeY.hasAlign(8192 /* EXTENDABLE */)) && !parentY.hasAlign(4 /* AUTO_LAYOUT */) && nodeY.hasSection(APP_SECTION.DOM_TRAVERSE)) {
                            const horizontal = [];
                            const vertical = [];
                            let extended = false;
                            let l = k;
                            let m = 0;
                            if (parentY.layoutVertical && nodeY.hasAlign(8192 /* EXTENDABLE */)) {
                                horizontal.push(nodeY);
                                l++;
                                m++;
                            }
                            traverse: {
                                let floatActive;
                                let floatCleared;
                                if (floatContainer) {
                                    floatActive = new Set();
                                    floatCleared = new Map();
                                }
                                for (; l < length; l++, m++) {
                                    const item = axisY[l];
                                    if (item.pageFlow) {
                                        if (item.labelFor && !item.visible) {
                                            m--;
                                            continue;
                                        }
                                        if (floatContainer) {
                                            if (floatActive.size) {
                                                const float = cleared.get(item);
                                                if (float) {
                                                    if (float === 'both') {
                                                        floatActive.clear();
                                                    }
                                                    else {
                                                        floatActive.delete(float);
                                                    }
                                                    floatCleared.set(item, float);
                                                }
                                            }
                                            if (item.floating) {
                                                floatActive.add(item.float);
                                            }
                                        }
                                        if (m === 0) {
                                            const next = item.siblingsTrailing[0];
                                            if (next) {
                                                if (!item.horizontalAligned || next.alignedVertically([item]) > 0) {
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
                                            if (floatContainer) {
                                                const status = item.alignedVertically(horizontal.length ? horizontal : vertical, cleared, horizontal.length > 0);
                                                if (status > 0) {
                                                    if (horizontal.length) {
                                                        if (status < 6 /* FLOAT_BLOCK */ && floatActive.size && floatCleared.get(item) !== 'both' && !item.siblingsLeading.some((node) => node.lineBreak && !cleared.has(node))) {
                                                            if (!item.floating || previous.floating && !aboveRange$3(item.linear.top, previous.linear.bottom)) {
                                                                if (floatCleared.has(item)) {
                                                                    if (!item.floating) {
                                                                        item.addAlign(8192 /* EXTENDABLE */);
                                                                        horizontal.push(item);
                                                                        extended = true;
                                                                        continue;
                                                                    }
                                                                    break traverse;
                                                                }
                                                                else {
                                                                    let floatBottom = Number.NEGATIVE_INFINITY;
                                                                    if (!item.floating) {
                                                                        for (const node of horizontal) {
                                                                            if (node.floating) {
                                                                                floatBottom = Math.max(floatBottom, node.linear.bottom);
                                                                            }
                                                                        }
                                                                    }
                                                                    if (!item.floating && !aboveRange$3(item.linear.top, floatBottom) || item.floating && floatActive.has(item.float)) {
                                                                        horizontal.push(item);
                                                                        if (!item.floating && aboveRange$3(item.linear.bottom, floatBottom)) {
                                                                            break traverse;
                                                                        }
                                                                        else {
                                                                            continue;
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                        break traverse;
                                                    }
                                                    if (!checkTraverseVertical(item, horizontal, vertical)) {
                                                        break traverse;
                                                    }
                                                }
                                                else if (!checkTraverseHorizontal(item, horizontal, vertical, extended)) {
                                                    break traverse;
                                                }
                                            }
                                            else {
                                                if (item.alignedVertically() > 0) {
                                                    if (!checkTraverseVertical(item, horizontal, vertical)) {
                                                        break traverse;
                                                    }
                                                }
                                                else if (!checkTraverseHorizontal(item, horizontal, vertical, extended)) {
                                                    break traverse;
                                                }
                                            }
                                        }
                                        else {
                                            break traverse;
                                        }
                                    }
                                    else if (item.positionAuto) {
                                        const lengthA = vertical.length;
                                        if (lengthA) {
                                            if (vertical[lengthA - 1].blockStatic) {
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
                            if (horizontal.length > 1) {
                                layout = this.controllerHandler.processTraverseHorizontal(new LayoutUI(parentY, nodeY, 0, 0, horizontal), axisY);
                                segEnd = horizontal[horizontal.length - 1];
                            }
                            else if (vertical.length > 1) {
                                layout = this.controllerHandler.processTraverseVertical(new LayoutUI(parentY, nodeY, 0, 0, vertical), axisY);
                                segEnd = vertical[vertical.length - 1];
                                if (segEnd.horizontalAligned && segEnd !== axisY[length - 1]) {
                                    segEnd.addAlign(8192 /* EXTENDABLE */);
                                }
                            }
                            if (layout && this.addLayout(layout)) {
                                if (segEnd === axisY[length - 1]) {
                                    parentY.removeAlign(2 /* UNKNOWN */);
                                }
                                parentY = nodeY.parent;
                            }
                        }
                        nodeY.removeAlign(8192 /* EXTENDABLE */);
                        if (k === length - 1) {
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
                            const combined = descendant ? (renderExtension ? renderExtension.concat(descendant) : descendant) : renderExtension;
                            if (combined) {
                                let next = false;
                                for (const ext of combined) {
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
                                let next = false;
                                for (const ext of prioritizeExtensions(nodeY.dataset.use, extensions)) {
                                    if (ext.is(nodeY)) {
                                        if (ext.condition(nodeY, parentY) && (descendant === undefined || !descendant.includes(ext))) {
                                            const result = ext.processNode(nodeY, parentY);
                                            if (result) {
                                                const { output, renderAs, outputAs, include } = result;
                                                if (output) {
                                                    this.addLayoutTemplate(result.outerParent || parentY, nodeY, output);
                                                }
                                                if (renderAs && outputAs) {
                                                    this.addLayoutTemplate(result.parentAs || parentY, renderAs, outputAs);
                                                }
                                                parentY = result.parent || parentY;
                                                if (output && include !== false || include) {
                                                    let renderExt = nodeY.renderExtension;
                                                    if (renderExt === undefined) {
                                                        renderExt = [];
                                                        nodeY.renderExtension = renderExt;
                                                    }
                                                    renderExt.push(ext);
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
                                const result = nodeY.length ? this.controllerHandler.processUnknownParent(layout) : this.controllerHandler.processUnknownChild(layout);
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
                    const groupA = a.nodeGroup;
                    const groupB = b.nodeGroup;
                    if (groupA || groupB) {
                        if (groupA && groupB) {
                            return a.id < b.id ? -1 : 1;
                        }
                        else {
                            return groupA ? -1 : 1;
                        }
                    }
                }
                return a.depth < b.depth ? -1 : 1;
            });
            session.cache.join(cache);
            session.excluded.join(processing.excluded);
            for (const ext of this.extensions) {
                for (const node of ext.subscribers) {
                    if (cache.contains(node)) {
                        ext.postBaseLayout(node);
                    }
                }
                ext.afterBaseLayout();
            }
        }
        setConstraints() {
            const cache = this._cache;
            this.controllerHandler.setConstraints();
            for (const ext of this.extensions) {
                for (const node of ext.subscribers) {
                    if (cache.contains(node)) {
                        ext.postConstraints(node);
                    }
                }
                ext.afterConstraints();
            }
        }
        setResources(layoutName) {
            const resourceHandler = this.resourceHandler;
            for (const node of this._cache) {
                if (node.documentRoot && node.renderParent) {
                    this.session.documentRoot.push({ node, layoutName: node === this.processing.node ? layoutName : '' });
                }
                resourceHandler.setBoxStyle(node);
                if (!node.imageElement && !node.svgElement && node.visible) {
                    resourceHandler.setFontStyle(node);
                    resourceHandler.setValueString(node);
                }
            }
            for (const ext of this.extensions) {
                ext.afterResources();
            }
        }
        processFloatHorizontal(layout) {
            const controllerHandler = this.controllerHandler;
            const { containerType, alignmentType } = controllerHandler.containerTypeVertical;
            const cleared = layout.cleared;
            const layerIndex = [];
            const inlineAbove = [];
            const inlineBelow = [];
            const leftAbove = [];
            const rightAbove = [];
            let leftBelow;
            let rightBelow;
            let leftSub;
            let rightSub;
            let clearedFloat = 0;
            layout.each((node, index) => {
                if (index > 0) {
                    const value = cleared.get(node);
                    if (value) {
                        switch (value) {
                            case 'left':
                                if (!hasBit$4(clearedFloat, 2)) {
                                    clearedFloat |= 2;
                                }
                                break;
                            case 'right':
                                if (!hasBit$4(clearedFloat, 4)) {
                                    clearedFloat |= 4;
                                }
                                break;
                            default:
                                clearedFloat = 6;
                                break;
                        }
                    }
                }
                const float = node.float;
                if (clearedFloat === 0) {
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
                        if (leftAbove.some(item => top >= item.linear.bottom) || rightAbove.some(item => top >= item.linear.bottom)) {
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
                    if (clearedFloat === 2 || clearedFloat === 6) {
                        if (leftBelow === undefined) {
                            leftBelow = [];
                        }
                        leftBelow.push(node);
                    }
                    else {
                        leftAbove.push(node);
                    }
                }
                else if (float === 'right') {
                    if (clearedFloat === 4 || clearedFloat === 6) {
                        if (rightBelow === undefined) {
                            rightBelow = [];
                        }
                        rightBelow.push(node);
                    }
                    else {
                        rightAbove.push(node);
                    }
                }
                else if (clearedFloat === 6) {
                    inlineBelow.push(node);
                }
                else {
                    inlineAbove.push(node);
                }
            });
            if (leftAbove.length) {
                leftSub = leftBelow ? [leftAbove, leftBelow] : leftAbove;
            }
            if (rightAbove.length) {
                rightSub = rightBelow ? [rightAbove, rightBelow] : rightAbove;
            }
            if (rightAbove.length + (rightBelow ? rightBelow.length : 0) === layout.length) {
                layout.add(2048 /* RIGHT */);
            }
            if (inlineBelow.length) {
                const { node, parent } = layout;
                if (inlineBelow.length > 1) {
                    inlineBelow[0].addAlign(8192 /* EXTENDABLE */);
                }
                inlineBelow.unshift(node);
                const wrapper = this.createNode({ parent, children: inlineBelow });
                wrapper.childIndex = node.childIndex;
                wrapper.containerName = node.containerName;
                wrapper.inherit(node, 'boxStyle');
                wrapper.innerWrapped = node;
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
            layout.add(64 /* BLOCK */);
            layout.itemCount = layerIndex.length;
            for (const item of layerIndex) {
                let segments;
                let floatgroup;
                if (Array.isArray(item[0])) {
                    segments = item;
                    const node = layout.node;
                    let grouping = segments[0];
                    for (let i = 1; i < segments.length; i++) {
                        grouping = grouping.concat(segments[i]);
                    }
                    grouping.sort((a, b) => a.childIndex < b.childIndex ? -1 : 1);
                    if (node.layoutVertical) {
                        floatgroup = node;
                    }
                    else {
                        floatgroup = controllerHandler.createNodeGroup(grouping[0], grouping, node);
                        this.addLayout(LayoutUI.create({
                            parent: node,
                            node: floatgroup,
                            containerType,
                            alignmentType: alignmentType | (segments.some(seg => seg === rightSub || seg === rightAbove) ? 2048 /* RIGHT */ : 0),
                            itemCount: segments.length
                        }));
                    }
                }
                else {
                    segments = [item];
                }
                for (const seg of segments) {
                    const node = floatgroup || layout.node;
                    const first = seg[0];
                    const target = controllerHandler.createNodeGroup(first, seg, node, true);
                    const group = new LayoutUI(node, target, 0, 128 /* SEGMENTED */ | (seg === inlineAbove ? 256 /* COLUMN */ : 0), seg);
                    if (seg.length === 1) {
                        if (first.percentWidth) {
                            group.type = controllerHandler.containerTypePercent;
                        }
                        else {
                            group.setContainerType(containerType, alignmentType);
                        }
                        group.node.innerWrapped = first;
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
                }
            }
            return layout;
        }
        processFloatVertical(layout) {
            const controllerHandler = this.controllerHandler;
            const { containerType, alignmentType } = controllerHandler.containerTypeVertical;
            const cleared = layout.cleared;
            if (layout.containerType !== 0) {
                const node = layout.node;
                const parent = controllerHandler.createNodeGroup(node, [node], layout.parent);
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
            for (const node of layout) {
                if (node.blockStatic && floated.length === 0) {
                    current.push(node);
                    blockArea = true;
                }
                else {
                    if (cleared.has(node)) {
                        if (!node.floating) {
                            node.modifyBox(2 /* MARGIN_TOP */);
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
                        if (clearReset && !cleared.has(node)) {
                            layoutVertical = false;
                        }
                        current.push(node);
                    }
                }
            }
            if (floated.length) {
                floatedRows.push(floated);
            }
            if (current.length) {
                staticRows.push(current);
            }
            if (!layoutVertical) {
                const node = layout.node;
                const length = Math.max(floatedRows.length, staticRows.length);
                for (let i = 0; i < length; i++) {
                    const pageFlow = staticRows[i] || [];
                    if (floatedRows[i] === null && pageFlow.length) {
                        const layoutType = controllerHandler.containerTypeVertical;
                        this.addLayout(new LayoutUI(node, controllerHandler.createNodeGroup(pageFlow[0], pageFlow, node), layoutType.containerType, layoutType.alignmentType | 128 /* SEGMENTED */ | 64 /* BLOCK */, pageFlow));
                    }
                    else {
                        const floating = floatedRows[i] || [];
                        if (pageFlow.length || floating.length) {
                            const basegroup = controllerHandler.createNodeGroup(floating[0] || pageFlow[0], [], node);
                            const group = new LayoutUI(node, basegroup);
                            group.type = controllerHandler.containerTypeVerticalMargin;
                            const children = [];
                            let subgroup;
                            if (floating.length) {
                                const floatgroup = controllerHandler.createNodeGroup(floating[0], floating, basegroup);
                                group.add(512 /* FLOAT */);
                                if (pageFlow.length === 0 && floating.every(item => item.float === 'right')) {
                                    group.add(2048 /* RIGHT */);
                                }
                                children.push(floatgroup);
                            }
                            if (pageFlow.length) {
                                subgroup = controllerHandler.createNodeGroup(pageFlow[0], pageFlow, basegroup);
                                children.push(subgroup);
                            }
                            basegroup.init();
                            group.itemCount = children.length;
                            this.addLayout(group);
                            for (let item of children) {
                                if (!item.nodeGroup) {
                                    item = controllerHandler.createNodeGroup(item, [item], basegroup, true);
                                }
                                this.addLayout(new LayoutUI(basegroup, item, containerType, alignmentType | 128 /* SEGMENTED */ | 64 /* BLOCK */, item.children));
                            }
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
        setFloatPadding(parent, target, inlineAbove, leftAbove, rightAbove) {
            if (inlineAbove.some((child) => requirePadding(child) || child.blockStatic && child.cascadeSome((nested) => requirePadding(nested)))) {
                const bottom = target.bounds.bottom;
                if (leftAbove.length) {
                    let floatPosition = Number.NEGATIVE_INFINITY;
                    let marginLeft = 0;
                    let invalid = false;
                    let hasSpacing = false;
                    for (const child of leftAbove) {
                        if (child.bounds.top < bottom) {
                            floatPosition = Math.max(child.linear.right + Math.min(child.marginLeft, 0), floatPosition);
                            hasSpacing = child.marginRight > 0;
                        }
                    }
                    if (floatPosition !== Number.NEGATIVE_INFINITY) {
                        for (const child of inlineAbove) {
                            if (child.bounds.left <= floatPosition) {
                                marginLeft = Math.max(marginLeft, child.marginLeft);
                                invalid = true;
                            }
                        }
                        if (invalid) {
                            const offset = floatPosition - parent.box.left - marginLeft;
                            if (offset > 0) {
                                target.modifyBox(256 /* PADDING_LEFT */, offset + (!hasSpacing && target.cascadeSome(child => child.multiline) ? Math.max(marginLeft, this._localSettings.deviations.textMarginBoundarySize) : 0));
                            }
                        }
                    }
                }
                if (rightAbove.length) {
                    let floatPosition = Number.POSITIVE_INFINITY;
                    let marginRight = 0;
                    let invalid = false;
                    for (const child of rightAbove) {
                        if (child.bounds.top < bottom) {
                            floatPosition = Math.min(child.linear.left + Math.min(child.marginRight, 0), floatPosition);
                        }
                    }
                    if (floatPosition !== Number.POSITIVE_INFINITY) {
                        for (const child of inlineAbove) {
                            if (child.multiline || child.bounds.right >= floatPosition) {
                                marginRight = Math.max(marginRight, child.marginRight);
                                invalid = true;
                            }
                        }
                        if (invalid) {
                            const offset = parent.box.right - floatPosition - marginRight;
                            if (offset > 0) {
                                target.modifyBox(64 /* PADDING_RIGHT */, offset + (target.cascadeSome(child => child.multiline) ? Math.max(marginRight, this._localSettings.deviations.textMarginBoundarySize) : 0));
                            }
                        }
                    }
                }
            }
        }
        createLayoutControl(parent, node) {
            return new LayoutUI(parent, node, node.containerType, node.alignmentType, node.children);
        }
        isUseElement(element) {
            const use = element.dataset.use;
            return isString$2(use) && use.split(XML$4.SEPARATOR).some(value => !!this.extensionManager.retrieve(value));
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
        get extensionsCascade() {
            return this.extensions.filter(item => !!item.init);
        }
        get length() {
            return this.session.documentRoot.length;
        }
    }

    const $lib$5 = squared.lib;
    const { USER_AGENT: USER_AGENT$1, isUserAgent: isUserAgent$1 } = $lib$5.client;
    const { BOX_BORDER: BOX_BORDER$1, BOX_PADDING: BOX_PADDING$1, formatPX: formatPX$2, getStyle: getStyle$3, isLength: isLength$2, isPercent: isPercent$2 } = $lib$5.css;
    const { isTextNode: isTextNode$3 } = $lib$5.dom;
    const { capitalize, convertFloat: convertFloat$2, flatArray: flatArray$1 } = $lib$5.util;
    const { actualClientRect: actualClientRect$1, getElementCache: getElementCache$3, setElementCache: setElementCache$3 } = $lib$5.session;
    const { pushIndent, pushIndentArray } = $lib$5.xml;
    function positionAbsolute(style) {
        const position = style.getPropertyValue('position');
        return position === 'absolute' || position === 'fixed';
    }
    const withinViewport = (rect) => !(rect.top + window.scrollY + rect.height < 0 || rect.left + window.scrollX + rect.width < 0);
    const getBorderWidth = (style, attr) => style.getPropertyValue(attr + '-style') !== 'none' ? getNumberValue(style, attr + '-width') : 0;
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
                    if (styleMap.border === undefined && checkBorderAttribute()) {
                        const inputBorderColor = this.localSettings.style.inputBorderColor;
                        styleMap.border = 'outset 1px ' + inputBorderColor;
                        for (let i = 0; i < 4; i++) {
                            const border = BOX_BORDER$1[i];
                            styleMap[border[0]] = 'outset';
                            styleMap[border[1]] = '1px';
                            styleMap[border[2]] = inputBorderColor;
                        }
                        return true;
                    }
                    return false;
                };
                const setButtonStyle = (appliedBorder) => {
                    if (appliedBorder) {
                        const backgroundColor = styleMap.backgroundColor;
                        if (backgroundColor === undefined || backgroundColor === 'initial') {
                            styleMap.backgroundColor = this.localSettings.style.inputBackgroundColor;
                        }
                    }
                    if (styleMap.textAlign === undefined) {
                        styleMap.textAlign = 'center';
                    }
                    if (styleMap.padding === undefined && !BOX_PADDING$1.some(attr => !!styleMap[attr])) {
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
                        case 'INPUT':
                        case 'SELECT':
                        case 'BUTTON':
                        case 'TEXTAREA':
                            if (styleMap.display === undefined) {
                                styleMap.display = 'inline-block';
                            }
                            break;
                        case 'FIELDSET':
                            if (styleMap.display === undefined) {
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
                        if (backgroundColor === undefined || backgroundColor === 'initial') {
                            styleMap.backgroundColor = 'rgb(255, 255, 255)';
                        }
                        break;
                    }
                    case 'FORM':
                        if (styleMap.marginTop === undefined) {
                            styleMap.marginTop = '0px';
                        }
                        break;
                    case 'LI':
                        if (styleMap.listStyleImage === undefined) {
                            const style = getStyle$3(element);
                            styleMap.listStyleImage = style.getPropertyValue('list-style-image');
                        }
                        break;
                    case 'IFRAME':
                        if (styleMap.display === undefined) {
                            styleMap.display = 'block';
                        }
                    case 'IMG': {
                        const setDimension = (attr, opposing) => {
                            const dimension = styleMap[attr];
                            if (dimension === undefined || dimension === 'auto') {
                                const match = new RegExp(`\\s+${attr}="([^"]+)"`).exec(element.outerHTML);
                                if (match) {
                                    const value = match[1];
                                    if (isLength$2(value)) {
                                        styleMap[attr] = value + 'px';
                                    }
                                    else if (isPercent$2(value)) {
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
                                    if (value && isLength$2(value)) {
                                        const attrMax = 'max' + capitalize(attr);
                                        if (styleMap[attrMax] === undefined || !isPercent$2(attrMax)) {
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
            let template = this._beforeOutside[id];
            if (template === undefined) {
                template = [];
                this._beforeOutside[id] = template;
            }
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
            let template = this._beforeInside[id];
            if (template === undefined) {
                template = [];
                this._beforeInside[id] = template;
            }
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
            let template = this._afterInside[id];
            if (template === undefined) {
                template = [];
                this._afterInside[id] = template;
            }
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
            let template = this._afterOutside[id];
            if (template === undefined) {
                template = [];
                this._afterOutside[id] = template;
            }
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
            let valid;
            if (pseudoElt) {
                const parentElement = element.parentElement;
                style = parentElement ? getStyle$3(parentElement, pseudoElt) : getStyle$3(element);
                if (getNumberValue(style, 'width') === 0) {
                    width = getBorderWidth(style, 'border-left') > 0 ||
                        getNumberValue(style, 'padding-left') > 0 ||
                        getNumberValue(style, 'padding-right') > 0 ||
                        getBorderWidth(style, 'border-right') > 0 ? 1 : 0;
                }
                else {
                    width = 1;
                }
                if (getNumberValue(style, 'height') === 0) {
                    height = getBorderWidth(style, 'border-top') > 0 ||
                        getNumberValue(style, 'padding-top') > 0 ||
                        getNumberValue(style, 'padding-bottom') > 0 ||
                        getBorderWidth(style, 'border-bottom') > 0 ? 1 : 0;
                }
                else {
                    height = 1;
                }
                valid = true;
            }
            else {
                style = getStyle$3(element);
                const rect = actualClientRect$1(element, this.sessionId);
                ({ width, height } = rect);
                valid = withinViewport(rect);
            }
            if (valid) {
                if (width > 0 && height > 0) {
                    if (style.getPropertyValue('visibility') === 'visible') {
                        return true;
                    }
                    return !positionAbsolute(style);
                }
                if (element.tagName === 'IMG' && style.getPropertyValue('display') !== 'none') {
                    return true;
                }
                else if (!positionAbsolute(style)) {
                    return (width > 0 && style.getPropertyValue('float') !== 'none' ||
                        style.getPropertyValue('clear') !== 'none' ||
                        style.getPropertyValue('display') === 'block' && (getNumberValue(style, 'margin-top') !== 0 || getNumberValue(style, 'margin-bottom') !== 0));
                }
            }
            return false;
        }
        evaluateNonStatic(documentRoot, cache) {
            var _a;
            const altered = new Set();
            for (const node of cache) {
                if (!node.documentRoot) {
                    const actualParent = node.parent;
                    const absoluteParent = node.absoluteParent;
                    let parent;
                    switch (node.css('position')) {
                        case 'relative':
                            if (!actualParent.layoutElement && node === actualParent.lastChild) {
                                let valid = false;
                                const box = actualParent.box;
                                if (node.outsideX(box)) {
                                    if (!actualParent.hasPX('width') || actualParent.css('overflowX') === 'hidden') {
                                        continue;
                                    }
                                    valid = true;
                                }
                                if (node.outsideY(box)) {
                                    if (!actualParent.hasHeight && !actualParent.hasPX('height') || actualParent.css('overflowY') === 'hidden') {
                                        continue;
                                    }
                                    valid = true;
                                }
                                if (valid) {
                                    parent = actualParent.actualParent;
                                    while (parent && parent !== documentRoot) {
                                        if (node.withinX(parent.box) && node.withinY(parent.box) || parent.css('overflow') === 'hidden') {
                                            break;
                                        }
                                        parent = parent.actualParent;
                                    }
                                    if (parent) {
                                        node.css('position', 'absolute', true);
                                        node.setBounds(false);
                                    }
                                }
                            }
                            break;
                        case 'fixed':
                            if (!node.positionAuto) {
                                parent = documentRoot;
                                break;
                            }
                        case 'absolute':
                            if (absoluteParent) {
                                parent = absoluteParent;
                                if (node.positionAuto) {
                                    if (!node.siblingsLeading.some(item => item.multiline || item.excluded && !item.blockStatic)) {
                                        node.cssApply({ display: 'inline-block', verticalAlign: 'top' }, true);
                                    }
                                    else {
                                        node.positionAuto = false;
                                    }
                                    parent = actualParent;
                                }
                                else if (this.userSettings.supportNegativeLeftTop) {
                                    const box = parent.box;
                                    let outside = false;
                                    while (parent && parent !== documentRoot) {
                                        if (!outside) {
                                            const overflowX = parent.css('overflowX') === 'hidden';
                                            const overflowY = parent.css('overflowY') === 'hidden';
                                            if (overflowX && overflowY || parseFloat(node.cssInitial('top')) === 0 || parseFloat(node.cssInitial('right')) === 0 || parseFloat(node.cssInitial('bottom')) === 0 || parseFloat(node.cssInitial('left')) === 0) {
                                                break;
                                            }
                                            else {
                                                const outsideX = !overflowX && node.outsideX(box);
                                                const outsideY = !overflowY && node.outsideY(box);
                                                if (!overflowY && node.linear.top < Math.floor(box.top) && (node.top < 0 || node.marginTop < 0)) {
                                                    outside = true;
                                                }
                                                else if (outsideX && !node.hasPX('left') && node.right > 0 || outsideY && !node.hasPX('top') && node.bottom !== 0) {
                                                    outside = true;
                                                }
                                                else if (outsideX && outsideY && (!parent.pageFlow || parent.actualParent.documentBody) && (node.top > 0 || node.left > 0)) {
                                                    outside = true;
                                                }
                                                else if (!overflowX && node.outsideX(parent.linear) && !node.pseudoElement && (node.left < 0 || node.marginLeft < 0 || !node.hasPX('left') && node.right < 0 && node.linear.left >= parent.linear.right)) {
                                                    outside = true;
                                                }
                                                else if (!overflowX && !overflowY && !node.intersectX(box) && !node.intersectY(box)) {
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
                                        else if (node.withinX(box) && node.withinY(box)) {
                                            break;
                                        }
                                        parent = parent.actualParent;
                                    }
                                }
                            }
                            break;
                    }
                    if (parent === undefined) {
                        parent = !node.pageFlow ? documentRoot : actualParent;
                    }
                    if (parent !== actualParent) {
                        if (((_a = absoluteParent) === null || _a === void 0 ? void 0 : _a.positionRelative) && parent !== absoluteParent) {
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
                    }
                    node.documentParent = parent;
                }
            }
            for (const node of altered) {
                const layers = [];
                let maxIndex = -1;
                node.each((item) => {
                    if (item.containerIndex === Number.POSITIVE_INFINITY) {
                        for (const adjacent of node.children) {
                            let valid = adjacent.naturalElements.includes(item);
                            if (!valid) {
                                const nested = adjacent.cascade();
                                valid = item.ascend({ condition: child => nested.includes(child) }).length > 0;
                            }
                            if (valid) {
                                const index = adjacent.containerIndex + (item.zIndex >= 0 || adjacent !== item.actualParent ? 1 : 0);
                                let layer = layers[index];
                                if (layer === undefined) {
                                    layer = [];
                                    layers[index] = layer;
                                }
                                layer.push(item);
                                break;
                            }
                        }
                    }
                    else if (item.containerIndex > maxIndex) {
                        maxIndex = item.containerIndex;
                    }
                });
                const length = layers.length;
                if (length) {
                    const children = node.children;
                    for (let j = 0, k = 0, l = 1; j < length; j++, k++) {
                        const order = layers[j];
                        if (order) {
                            order.sort((a, b) => {
                                if (a.parent === b.parent) {
                                    if (a.zIndex === b.zIndex) {
                                        return a.id < b.id ? -1 : 1;
                                    }
                                    return a.zIndex < b.zIndex ? -1 : 1;
                                }
                                return 0;
                            });
                            for (const item of order) {
                                item.containerIndex = maxIndex + l++;
                            }
                            for (let m = 0; m < children.length; m++) {
                                if (order.includes(children[m])) {
                                    children[m] = undefined;
                                }
                            }
                            children.splice(k, 0, ...order);
                            k += order.length;
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
            const indent = depth > 0 ? '\t'.repeat(depth) : '';
            let output = '';
            for (const item of templates) {
                if (item) {
                    const node = item.node;
                    switch (item.type) {
                        case 1 /* XML */: {
                            const { controlName, attributes } = item;
                            const { id, renderTemplates } = node;
                            const renderDepth = depth + 1;
                            const beforeInside = this.getBeforeInsideTemplate(id, renderDepth);
                            const afterInside = this.getAfterInsideTemplate(id, renderDepth);
                            let template = indent + `<${controlName + (depth === 0 ? '{#0}' : '') + (showAttributes ? (attributes ? pushIndent(attributes, renderDepth) : node.extractAttributes(renderDepth)) : '')}`;
                            if (renderTemplates || beforeInside !== '' || afterInside !== '') {
                                template += '>\n' +
                                    beforeInside +
                                    (renderTemplates ? this.cascadeDocument(this.sortRenderPosition(node, renderTemplates), renderDepth) : '') +
                                    afterInside +
                                    indent + `</${controlName}>\n`;
                            }
                            else {
                                template += ' />\n';
                            }
                            output += this.getBeforeOutsideTemplate(id, depth) + template + this.getAfterOutsideTemplate(id, depth);
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
            }
            return output;
        }
        getEnclosingXmlTag(controlName, attributes, content) {
            return '<' + controlName + (attributes || '') + (content ? '>\n' + content + '</' + controlName + '>\n' : ' />\n');
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
            this._isAll = false;
            this.tagNames = tagNames;
            this._isAll = tagNames.length === 0;
        }
        static findNestedElement(element, name) {
            if (element && hasComputedStyle$2(element)) {
                const children = element.children;
                const length = children.length;
                for (let i = 0; i < length; i++) {
                    const item = children[i];
                    if (includes(item.dataset.use, name)) {
                        return item;
                    }
                }
            }
            return null;
        }
        condition(node, parent) {
            return node.dataset.use ? this.included(node.element) : !this._isAll;
        }
        is(node) {
            return this._isAll || this.tagNames.includes(node.tagName);
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
            const extensions = map.get(id) || [];
            if (!extensions.includes(this)) {
                extensions.push(this);
            }
            map.set(id, extensions);
        }
        postBaseLayout(node) { }
        postConstraints(node) { }
        postOptimize(node) { }
        afterBaseLayout() { }
        afterConstraints() { }
        afterResources() { }
        beforeBaseLayout() { }
        beforeCascade() { }
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

    const { isLength: isLength$3 } = squared.lib.css;
    class NodeGroupUI extends NodeUI {
        init() {
            var _a;
            if (this.length) {
                for (const item of this.children) {
                    item.parent = this;
                }
                this.setBounds();
                this.saveAsInitial();
                this.dir = ((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.dir) || '';
            }
        }
        setBounds() {
            if (this.length) {
                this._bounds = NodeUI.outerRegion(this);
            }
        }
        previousSiblings(options) {
            var _a, _b;
            const node = (((_a = this._initial) === null || _a === void 0 ? void 0 : _a.children) || this.children)[0];
            return ((_b = node) === null || _b === void 0 ? void 0 : _b.previousSiblings(options)) || [];
        }
        nextSiblings(options) {
            var _a, _b;
            const children = ((_a = this._initial) === null || _a === void 0 ? void 0 : _a.children) || this.children;
            const node = children[children.length - 1];
            return ((_b = node) === null || _b === void 0 ? void 0 : _b.nextSiblings(options)) || [];
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
                result = (this.naturalChildren.length > 0 && this.naturalChildren[0].blockStatic ||
                    this.actualWidth === documentParent.actualWidth && !this.some(node => node.plainText || node.naturalElement && node.rightAligned) ||
                    this.layoutVertical && this.some(node => node.blockStatic || node.rightAligned) ||
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
                result = this.some(node => node.blockDimension);
                this._cached.blockDimension = result;
            }
            return result;
        }
        get inline() {
            let result = this._cached.inline;
            if (result === undefined) {
                result = this.every(node => node.inline);
                this._cached.inline = result;
            }
            return result;
        }
        get inlineStatic() {
            let result = this._cached.inlineStatic;
            if (result === undefined) {
                result = this.every(node => node.inlineStatic);
                this._cached.inlineStatic = result;
            }
            return result;
        }
        get inlineVertical() {
            let result = this._cached.inlineVertical;
            if (result === undefined) {
                result = this.every(node => node.inlineVertical);
                this._cached.inlineVertical = result;
            }
            return result;
        }
        get inlineFlow() {
            let result = this._cached.inlineStatic;
            if (result === undefined) {
                result = this.inlineStatic || this.hasAlign(128 /* SEGMENTED */);
                this._cached.inlineStatic = result;
            }
            return result;
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
                    result = value === 'baseline' || isLength$3(value, true);
                }
                this._cached.baseline = result;
            }
            return result;
        }
        get float() {
            let result = this._cached.float;
            if (result === undefined) {
                result = !this.floating ? 'none' : (this.hasAlign(2048 /* RIGHT */) ? 'right' : 'left');
                this._cached.float = result;
            }
            return result;
        }
        get floating() {
            let result = this._cached.floating;
            if (result === undefined) {
                result = this.every(node => node.floating);
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
                for (const node of this) {
                    result = Math.min(node.childIndex, result);
                }
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
                for (const node of this) {
                    result = Math.min(node.containerIndex, result);
                }
                super.containerIndex = result;
            }
            return result;
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
    const { BOX_BORDER: BOX_BORDER$2, calculate, convertAngle, formatPX: formatPX$3, getBackgroundPosition, getInheritedStyle: getInheritedStyle$1, isCalc, isLength: isLength$4, isParentStyle, isPercent: isPercent$3, parseAngle } = $lib$7.css;
    const { cos, equal: equal$1, hypotenuse, offsetAngleX, offsetAngleY, relativeAngle, sin, triangulate, truncateFraction } = $lib$7.math;
    const { CHAR: CHAR$2, ESCAPE, STRING: STRING$2, XML: XML$5 } = $lib$7.regex;
    const { getElementAsNode: getElementAsNode$2 } = $lib$7.session;
    const { convertCamelCase: convertCamelCase$2, convertFloat: convertFloat$3, hasValue: hasValue$1, isEqual, isNumber: isNumber$1, isString: isString$3, trimEnd, trimStart } = $lib$7.util;
    const { STRING_SPACE, STRING_TABSPACE } = $lib$7.xml;
    const STRING_COLORSTOP = `(rgba?\\(\\d+, \\d+, \\d+(?:, [\\d.]+)?\\)|#[A-Za-z\\d]{3,8}|[a-z]+)\\s*(${STRING$2.LENGTH_PERCENTAGE}|${STRING$2.CSS_ANGLE}|(?:${STRING$2.CSS_CALC}(?=,)|${STRING$2.CSS_CALC}))?,?\\s*`;
    const REGEX_URL$1 = /^url/;
    const REGEX_NOBREAKSPACE = /\u00A0/g;
    const REGEX_BACKGROUNDIMAGE = new RegExp(`(?:initial|url\\([^)]+\\)|(repeating)?-?(linear|radial|conic)-gradient\\(((?:to [a-z ]+|(?:from )?-?[\\d.]+(?:deg|rad|turn|grad)|(?:circle|ellipse)?\\s*(?:closest-side|closest-corner|farthest-side|farthest-corner)?)?(?:\\s*(?:(?:-?[\\d.]+(?:[a-z%]+)?\\s*)+)?(?:at [\\w %]+)?)?),?\\s*((?:${STRING_COLORSTOP})+)\\))`, 'g');
    const REGEX_COLORSTOP = new RegExp(STRING_COLORSTOP, 'g');
    function parseColorStops(node, gradient, value) {
        const { width, height } = gradient.dimension;
        let repeat = false;
        let horizontal = true;
        let extent = 1;
        let size;
        switch (gradient.type) {
            case 'conic': {
                size = Math.min(width, height);
                break;
            }
            case 'radial': {
                const { repeating, radiusExtent, radius } = gradient;
                horizontal = node.actualWidth <= node.actualHeight;
                repeat = repeating;
                extent = radiusExtent / radius;
                size = radius;
                break;
            }
            default: {
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
                        size = Math.abs(width * sin(angle)) + Math.abs(height * cos(angle));
                        horizontal = width >= height;
                        break;
                    }
                }
                break;
            }
        }
        const result = [];
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
                    if (isPercent$3(unit)) {
                        offset = parseFloat(unit) / 100;
                    }
                    else if (isLength$4(unit)) {
                        offset = node.parseUnit(unit, horizontal ? 'width' : 'height', false) / size;
                    }
                    else if (isCalc(unit)) {
                        offset = calculate(match[6], size, node.fontSize) / size;
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
        for (let i = 0; i < length; i++) {
            const stop = result[i];
            if (stop.offset === -1) {
                if (i === 0) {
                    stop.offset = 0;
                }
                else {
                    for (let j = i + 1, k = 2; j < length - 1; j++, k++) {
                        const data = result[j];
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
                    const original = result.slice(0);
                    let basePercent = percent;
                    while (percent < 100) {
                        for (const data of original) {
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
        var _a;
        let inlined = false;
        value = value.replace(REGEX_NOBREAKSPACE, STRING_SPACE);
        switch (node.css('whiteSpace')) {
            case 'nowrap':
                value = value.replace(/\n/g, ' ');
                inlined = true;
                break;
            case 'pre':
            case 'pre-wrap':
                if (((_a = node.renderParent) === null || _a === void 0 ? void 0 : _a.layoutVertical) === false) {
                    value = value.replace(/^\s*?\n/, '');
                }
                value = value
                    .replace(/\n/g, '\\n')
                    .replace(/\t/g, STRING_TABSPACE)
                    .replace(/\s/g, STRING_SPACE);
                return [value, true, false];
            case 'pre-line':
                value = value
                    .replace(/\n/g, '\\n')
                    .replace(/[ ]+/g, ' ');
                return [value, true, false];
        }
        if (node.onlyChild && node.htmlElement) {
            value = value
                .replace(CHAR$2.LEADINGSPACE, '')
                .replace(CHAR$2.TRAILINGSPACE, '');
        }
        else {
            const { previousSibling, nextSibling } = node;
            if (previousSibling && (previousSibling.lineBreak || previousSibling.blockStatic)) {
                value = value.replace(CHAR$2.LEADINGSPACE, '');
            }
            if (nextSibling && (nextSibling.lineBreak || nextSibling.blockStatic)) {
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
        switch (node.css(attr)) {
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
    const getGradientPosition = (value) => isString$3(value) ? (value.includes('at ') ? /(.+?)?\s*at (.+?)\s*$/.exec(value) : [value, value]) : null;
    class ResourceUI extends Resource {
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
                    name = prefix + '_' + ++i;
                }
            } while (true);
            ids.set(section, previous);
            return name;
        }
        static insertStoredAsset(asset, name, value) {
            const stored = ResourceUI.STORED[asset];
            if (stored && hasValue$1(value)) {
                let result = this.getStoredName(asset, value);
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
            const children = element.children;
            const length = children.length;
            for (let i = 0; i < length; i++) {
                const item = children[i];
                if (item.disabled && !showDisabled) {
                    continue;
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
            }
            return numberArray ? [undefined, result] : [result];
        }
        static isBackgroundVisible(object) {
            return !!object && ('backgroundImage' in object || 'borderTop' in object || 'borderRight' in object || 'borderBottom' in object || 'borderLeft' in object);
        }
        static parseBackgroundImage(node, screenDimension) {
            var _a, _b, _c, _d, _e;
            const backgroundImage = node.backgroundImage;
            if (backgroundImage !== '') {
                const images = [];
                let match;
                let i = 0;
                while ((match = REGEX_BACKGROUNDIMAGE.exec(backgroundImage)) !== null) {
                    const value = match[0];
                    if (REGEX_URL$1.test(value) || value === 'initial') {
                        images.push(value);
                    }
                    else {
                        const repeating = match[1] === 'repeating';
                        const type = match[2];
                        const direction = match[3];
                        const imageDimension = getBackgroundSize(node, i, node.css('backgroundSize'), screenDimension);
                        const dimension = imageDimension || node.actualDimension;
                        let gradient;
                        switch (type) {
                            case 'conic': {
                                const position = getGradientPosition(direction);
                                const conic = {
                                    type,
                                    dimension,
                                    angle: getAngle(direction),
                                    center: getBackgroundPosition(((_a = position) === null || _a === void 0 ? void 0 : _a[2]) || 'center', dimension, node.fontSize, imageDimension, '', screenDimension)
                                };
                                conic.colorStops = parseColorStops(node, conic, match[4]);
                                gradient = conic;
                                break;
                            }
                            case 'radial': {
                                const position = getGradientPosition(direction);
                                const center = getBackgroundPosition(((_b = position) === null || _b === void 0 ? void 0 : _b[2]) || 'center', dimension, node.fontSize, imageDimension, '', screenDimension);
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
                                    const name = (_c = position[1]) === null || _c === void 0 ? void 0 : _c.trim();
                                    if (name) {
                                        if (/^circle/.test(name)) {
                                            shape = 'circle';
                                        }
                                        else {
                                            let minRadius = Number.POSITIVE_INFINITY;
                                            const radiusXY = name.split(' ');
                                            const length = radiusXY.length;
                                            for (let j = 0; j < length; j++) {
                                                minRadius = Math.min(node.parseUnit(radiusXY[j], j === 0 ? 'width' : 'height', false), minRadius);
                                            }
                                            radius = minRadius;
                                            radiusExtent = minRadius;
                                            if (length === 1 || radiusXY[0] === radiusXY[1]) {
                                                shape = 'circle';
                                            }
                                        }
                                    }
                                }
                                for (const corner of [[0, 0], [width, 0], [width, height], [0, height]]) {
                                    const length = Math.round(hypotenuse(Math.abs(corner[0] - left), Math.abs(corner[1] - top)));
                                    closestCorner = Math.min(length, closestCorner);
                                    farthestCorner = Math.max(length, farthestCorner);
                                }
                                for (const side of [width - left, height - top, left]) {
                                    closestSide = Math.min(side, closestSide);
                                    farthestSide = Math.max(side, farthestSide);
                                }
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
                                    const extent = ((_e = (_d = position) === null || _d === void 0 ? void 0 : _d[1]) === null || _e === void 0 ? void 0 : _e.split(' ').pop()) || '';
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
                        }
                        images.push(gradient || 'initial');
                    }
                    i++;
                }
                REGEX_BACKGROUNDIMAGE.lastIndex = 0;
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
                    const dimensions = value.split(' ');
                    const length = dimensions.length;
                    if (length === 1) {
                        dimensions[1] = dimensions[0];
                    }
                    for (let i = 0; i < length; i++) {
                        let size = dimensions[i];
                        if (size === 'auto') {
                            size = '100%';
                        }
                        if (i === 0) {
                            width = node.parseUnit(size, 'width', false, screenDimension);
                        }
                        else {
                            height = node.parseUnit(size, 'height', false, screenDimension);
                        }
                    }
                    break;
                }
            }
            return width > 0 && height > 0 ? { width: Math.round(width), height: Math.round(height) } : undefined;
        }
        static isInheritedStyle(node, attr) {
            var _a;
            return node.styleElement && node.style[attr] === ((_a = node.actualParent) === null || _a === void 0 ? void 0 : _a.style[attr]) && (node.cssStyle[attr] === 'inherit' || node.cssInitial(attr) === '');
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
                return value.includes('\n') && (node.plainText && isParentStyle(element, 'whiteSpace', 'pre', 'pre-wrap') || /^pre/.test(node.css('whiteSpace')));
            }
            return false;
        }
        static getStoredName(asset, value) {
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
        finalize(layouts) { }
        reset() {
            super.reset();
            const STORED = ResourceUI.STORED;
            for (const name in STORED) {
                STORED[name].clear();
            }
        }
        writeRawImage(filename, base64) {
            var _a;
            (_a = this.fileHandler) === null || _a === void 0 ? void 0 : _a.addAsset({
                pathname: this.controllerSettings.directory.image,
                filename,
                base64
            });
        }
        setBoxStyle(node) {
            var _a;
            if (node.styleElement || node.visibleStyle.background) {
                const boxStyle = {
                    backgroundSize: node.css('backgroundSize'),
                    backgroundRepeat: node.css('backgroundRepeat'),
                    backgroundPositionX: node.css('backgroundPositionX'),
                    backgroundPositionY: node.css('backgroundPositionY')
                };
                if (setBackgroundOffset(node, boxStyle, 'backgroundClip') && node.has('backgroundOrigin')) {
                    setBackgroundOffset(node, boxStyle, 'backgroundOrigin');
                }
                if (node.css('borderRadius') !== '0px') {
                    const [A, B] = node.css('borderTopLeftRadius').split(' ');
                    const [C, D] = node.css('borderTopRightRadius').split(' ');
                    const [E, F] = node.css('borderBottomRightRadius').split(' ');
                    const [G, H] = node.css('borderBottomLeftRadius').split(' ');
                    const borderRadius = !B && !D && !F && !H ? [A, C, E, G] : [A, B || A, C, D || C, E, F || E, G, H || G];
                    const horizontal = node.actualWidth >= node.actualHeight;
                    const radius = borderRadius[0];
                    if (borderRadius.every(value => value === radius)) {
                        borderRadius.length = radius === '0px' || radius === '' ? 0 : 1;
                    }
                    const length = borderRadius.length;
                    if (length) {
                        const dimension = horizontal ? 'width' : 'height';
                        for (let i = 0; i < length; i++) {
                            borderRadius[i] = formatPX$3(node.parseUnit(borderRadius[i], dimension, false));
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
                    boxStyle.backgroundImage = ResourceUI.parseBackgroundImage(node, node.localSettings.screenDimension);
                }
                let backgroundColor = node.backgroundColor;
                if (backgroundColor === '' && !node.documentParent.visible && node.has('backgroundColor')) {
                    backgroundColor = node.css('backgroundColor');
                }
                if (backgroundColor !== '') {
                    boxStyle.backgroundColor = ((_a = parseColor(backgroundColor)) === null || _a === void 0 ? void 0 : _a.valueAsRGBA) || '';
                }
                node.data(ResourceUI.KEY_NAME, 'boxStyle', boxStyle);
            }
        }
        setFontStyle(node) {
            var _a;
            if ((node.textElement || node.inlineText) && (!node.textEmpty || node.visibleStyle.background) || node.inputElement) {
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
                    color: ((_a = color) === null || _a === void 0 ? void 0 : _a.valueAsRGBA) || ''
                });
            }
        }
        setValueString(node) {
            var _a, _b, _c, _d;
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
                                if (((_a = companion) === null || _a === void 0 ? void 0 : _a.visible) === false) {
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
                            [value, inlined, trimming] = replaceWhiteSpace(node, textContent.replace(/&/g, '&amp;'));
                            inlined = true;
                        }
                        else if (node.inlineText) {
                            key = textContent.trim();
                            [value, inlined, trimming] = replaceWhiteSpace(node, this.removeExcludedFromText(element, node.sessionId));
                        }
                        else if (node.naturalElements.length === 0 && ((_b = textContent) === null || _b === void 0 ? void 0 : _b.trim()) === '' && !node.hasPX('height') && ResourceUI.isBackgroundVisible(node.data(ResourceUI.KEY_NAME, 'boxStyle'))) {
                            value = textContent;
                        }
                        break;
                    }
                }
                if (value !== '') {
                    if (trimming) {
                        const previousSibling = node.siblingsLeading[0];
                        let previousSpaceEnd = false;
                        if (value.length > 1) {
                            if (previousSibling === undefined || previousSibling.multiline || previousSibling.lineBreak || previousSibling.plainText && CHAR$2.TRAILINGSPACE.test(previousSibling.textContent)) {
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
                            if (CHAR$2.LEADINGSPACE.test(value) && ((_c = previousSibling) === null || _c === void 0 ? void 0 : _c.block) === false && !previousSibling.lineBreak && !previousSpaceEnd) {
                                value = STRING_SPACE + value.trim();
                            }
                            else {
                                value = value.trim();
                            }
                            if (trailingSpace) {
                                const nextSibling = node.siblingsTrailing.find(item => !item.excluded || item.lineBreak);
                                if (((_d = nextSibling) === null || _d === void 0 ? void 0 : _d.blockStatic) === false) {
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
        removeExcludedFromText(element, sessionId) {
            const styled = element.children.length || element.tagName === 'CODE';
            const attr = styled ? 'innerHTML' : 'textContent';
            let value = element[attr] || '';
            const children = element.childNodes;
            const length = children.length;
            for (let i = 0; i < length; i++) {
                const child = children[i];
                const item = getElementAsNode$2(child, sessionId);
                if (item === null || !item.textElement || !item.pageFlow || item.positioned || item.pseudoElement || item.excluded || item.dataset.target) {
                    if (item) {
                        const preserveWhitespace = item.actualParent.preserveWhiteSpace;
                        if (styled && item.htmlElement) {
                            const outerHTML = item.toElementString('outerHTML');
                            if (item.lineBreak) {
                                value = value.replace(!preserveWhitespace ? new RegExp(`\\s*${outerHTML}\\s*`) : outerHTML, '\\n');
                            }
                            else if (item.positioned) {
                                value = value.replace(outerHTML, '');
                            }
                            else if (!preserveWhitespace) {
                                value = value.replace(outerHTML, item.pageFlow && item.textContent.trim() !== '' ? STRING_SPACE : '');
                            }
                            continue;
                        }
                        else {
                            const textContent = item[attr];
                            if (isString$3(textContent)) {
                                if (!preserveWhitespace) {
                                    value = value.replace(textContent, '');
                                }
                                continue;
                            }
                        }
                    }
                    else if (child instanceof HTMLElement) {
                        const position = getComputedStyle(child).getPropertyValue('position');
                        value = value.replace(child.outerHTML, position !== 'absolute' && position !== 'fixed' && child.textContent.trim() !== '' ? STRING_SPACE : '');
                    }
                    if (i === 0) {
                        value = trimStart(value, ' ');
                    }
                    else if (i === length - 1) {
                        value = trimEnd(value, ' ');
                    }
                }
            }
            return styled ? value.replace(ESCAPE.ENTITY, (match, capture) => String.fromCharCode(parseInt(capture))) : value;
        }
    }
    ResourceUI.KEY_NAME = 'squared.resource';
    ResourceUI.STORED = {
        strings: new Map(),
        arrays: new Map(),
        fonts: new Map(),
        colors: new Map(),
        images: new Map()
    };

    class Accessibility extends ExtensionUI {
    }

    const $lib$8 = squared.lib;
    const { formatPercent, formatPX: formatPX$4, isLength: isLength$5, isPercent: isPercent$4 } = $lib$8.css;
    const { CHAR: CHAR$3, CSS: CSS$3 } = $lib$8.regex;
    const { isNumber: isNumber$2, trimString: trimString$2, withinRange: withinRange$1 } = $lib$8.util;
    const CSS_GRID = EXT_NAME.CSS_GRID;
    const STRING_UNIT = '[\\d.]+[a-z%]+|auto|max-content|min-content';
    const STRING_MINMAX = 'minmax\\(([^,]+), ([^)]+)\\)';
    const STRING_FIT_CONTENT = 'fit-content\\(([\\d.]+[a-z%]+)\\)';
    const STRING_NAMED = '\\[([\\w\\-\\s]+)\\]';
    const REGEX_UNIT = new RegExp(`^(${STRING_UNIT})$`);
    const REGEX_NAMED = new RegExp(`\\s*(repeat\\((auto-fit|auto-fill|\\d+), (.+)\\)|${STRING_NAMED}|${STRING_MINMAX}|${STRING_FIT_CONTENT}|${STRING_UNIT})\\s*`, 'g');
    const REGEX_REPEAT = new RegExp(`\\s*(${STRING_NAMED}|${STRING_MINMAX}|${STRING_FIT_CONTENT}|${STRING_UNIT})\\s*`, 'g');
    const REGEX_STARTEND = /^([\w-]+)-(start|end)$/;
    const REGEX_CELL_UNIT = new RegExp('[\\d.]+[a-z%]+|auto|max-content|min-content');
    const REGEX_CELL_MINMAX = new RegExp('minmax\\(([^,]+), ([^)]+)\\)');
    const REGEX_CELL_FIT_CONTENT = new RegExp('fit-content\\(([\\d.]+[a-z%]+)\\)');
    const REGEX_CELL_NAMED = new RegExp('\\[([\\w\\-\\s]+)\\]');
    const REGEX_SPAN = /^span/;
    function repeatUnit(data, sizes) {
        const repeat = data.repeat;
        const unitPX = [];
        const unitRepeat = [];
        const length = sizes.length;
        for (let i = 0; i < length; i++) {
            if (repeat[i]) {
                unitRepeat.push(sizes[i]);
            }
            else {
                unitPX.push(sizes[i]);
            }
        }
        const lengthA = data.length;
        const lengthB = lengthA - unitPX.length;
        const lengthC = unitRepeat.length;
        const result = new Array(lengthA);
        for (let i = 0; i < lengthA; i++) {
            if (repeat[i]) {
                for (let j = 0, k = 0; j < lengthB; i++, j++, k++) {
                    if (k === lengthC) {
                        k = 0;
                    }
                    result[i] = unitRepeat[k];
                }
                i--;
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
                if (isPercent$4(value)) {
                    sizeMin = Math.max((parseFloat(value) / 100) * dimension, sizeMin);
                }
                else if (isLength$5(value)) {
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
    function getColumnTotal(rows) {
        let value = 0;
        for (const row of rows) {
            if (row) {
                value++;
            }
        }
        return value;
    }
    function setFlexibleDimension(dimension, gap, count, unit, max) {
        let filled = 0;
        let fractional = 0;
        let percent = 1;
        const length = unit.length;
        for (let i = 0; i < length; i++) {
            const value = unit[i];
            if (CSS$3.PX.test(value)) {
                filled += parseFloat(value);
            }
            else if (isFr(value)) {
                fractional += parseFloat(value);
            }
            else if (isPercent$4(value)) {
                percent -= parseFloat(value) / 100;
            }
        }
        if (percent < 1 && fractional > 0) {
            const ratio = (((dimension * percent) - ((count - 1) * gap) - max.reduce((a, b) => a + Math.max(0, b), 0) - filled) / fractional);
            if (ratio > 0) {
                for (let i = 0; i < length; i++) {
                    const value = unit[i];
                    if (isFr(value)) {
                        unit[i] = formatPX$4(parseFloat(value) * ratio);
                    }
                }
            }
        }
    }
    function fillUnitEqually(unit, length) {
        if (unit.length === 0) {
            for (let i = 0; i < length; i++) {
                unit[i] = '1fr';
            }
        }
    }
    function getOpenCellIndex(iteration, length, available) {
        if (available) {
            for (let i = 0, j = -1, k = 0; i < iteration; i++) {
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
        for (let i = 0; i < length; i++) {
            const cell = cells[i];
            for (let j = 0; j < cell.length; j++) {
                if (cell[j] === 0) {
                    return i;
                }
            }
        }
        return Math.max(0, length - 1);
    }
    const isFr = (value) => /fr$/.test(value);
    const convertLength = (node, value, index) => isLength$5(value) ? formatPX$4(node.parseUnit(value, index === 0 ? 'height' : 'width')) : value;
    class CssGrid extends ExtensionUI {
        static isAligned(node) {
            return node.hasHeight && /^space-|center|flex-end|end/.test(node.css('alignContent'));
        }
        static isJustified(node) {
            return (node.blockStatic || node.hasWidth) && /^space-|center|flex-end|end|right/.test(node.css('justifyContent'));
        }
        static createDataAttribute(alignItems, alignContent, justifyItems, justifyContent, autoFlow) {
            return {
                children: [],
                rowData: [],
                rowSpanMultiple: [],
                rowDirection: !autoFlow.includes('column'),
                dense: autoFlow.includes('dense'),
                templateAreas: {},
                row: CssGrid.createDataRowAttribute(),
                column: CssGrid.createDataRowAttribute(),
                emptyRows: [],
                alignItems,
                alignContent,
                justifyItems,
                justifyContent
            };
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
            const mainData = CssGrid.createDataAttribute(node.css('alignItems'), node.css('alignContent'), node.css('justifyItems'), node.css('justifyContent'), node.css('gridAutoFlow'));
            const { column, dense, row, rowDirection: horizontal } = mainData;
            const [rowA, colA, rowB, colB] = horizontal ? [0, 1, 2, 3] : [1, 0, 3, 2];
            const rowData = [];
            const openCells = [];
            const layout = [];
            const setDataRows = (item, placement, length) => {
                if (placement.every(value => value > 0)) {
                    for (let i = placement[rowA] - 1; i < placement[rowB] - 1; i++) {
                        let data = rowData[i];
                        if (data === undefined) {
                            data = [];
                            rowData[i] = data;
                        }
                        let cell = openCells[i];
                        let j = placement[colA] - 1;
                        if (cell === undefined) {
                            cell = new Array(length).fill(0);
                            if (!dense) {
                                for (let k = 0; k < j; k++) {
                                    cell[k] = 1;
                                }
                            }
                            openCells[i] = cell;
                        }
                        for (; j < placement[colB] - 1; j++) {
                            let rowItem = data[j];
                            if (rowItem === undefined) {
                                rowItem = [];
                                data[j] = rowItem;
                            }
                            cell[j] = 1;
                            rowItem.push(item);
                        }
                    }
                    return true;
                }
                return false;
            };
            row.gap = node.parseUnit(node.css('rowGap'), 'height', false);
            column.gap = node.parseUnit(node.css('columnGap'), 'width', false);
            [node.cssInitial('gridTemplateRows', true), node.cssInitial('gridTemplateColumns', true), node.css('gridAutoRows'), node.css('gridAutoColumns')].forEach((value, index) => {
                if (value !== '' && value !== 'none' && value !== 'auto') {
                    const data = index === 0 ? row : column;
                    const { name, repeat, unit, unitMin } = data;
                    let match;
                    let i = 1;
                    while ((match = REGEX_NAMED.exec(value)) !== null) {
                        const command = match[1].trim();
                        switch (index) {
                            case 0:
                            case 1:
                                if (command.charAt(0) === '[') {
                                    for (const attr of match[4].split(CHAR$3.SPACE)) {
                                        let item = name[attr];
                                        if (item === undefined) {
                                            item = [];
                                            name[attr] = item;
                                        }
                                        item.push(i);
                                    }
                                }
                                else if (/^repeat/.test(command)) {
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
                                        let subMatch;
                                        while ((subMatch = REGEX_REPEAT.exec(match[3])) !== null) {
                                            const subPattern = subMatch[1];
                                            let namedMatch;
                                            if ((namedMatch = REGEX_CELL_NAMED.exec(subPattern)) !== null) {
                                                const subName = namedMatch[1];
                                                if (name[subName] === undefined) {
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
                                            for (let j = 0; j < iterations; j++) {
                                                for (const item of repeating) {
                                                    const { name: nameA, unit: unitA } = item;
                                                    if (nameA) {
                                                        name[nameA].push(i);
                                                    }
                                                    else if (unitA) {
                                                        unit.push(unitA);
                                                        unitMin.push(item.unitMin || '');
                                                        repeat.push(true);
                                                        i++;
                                                    }
                                                }
                                            }
                                        }
                                        REGEX_REPEAT.lastIndex = 0;
                                    }
                                }
                                else if (/^minmax/.test(command)) {
                                    unit.push(convertLength(node, match[6], index));
                                    unitMin.push(convertLength(node, match[5], index));
                                    repeat.push(false);
                                    i++;
                                }
                                else if (/^fit-content/.test(command)) {
                                    unit.push(convertLength(node, match[7], index));
                                    unitMin.push('0px');
                                    repeat.push(false);
                                    i++;
                                }
                                else if (REGEX_UNIT.test(command)) {
                                    unit.push(convertLength(node, command, index));
                                    unitMin.push('');
                                    repeat.push(false);
                                    i++;
                                }
                                break;
                            case 2:
                            case 3:
                                (index === 2 ? row : column).auto.push(isLength$5(command) ? formatPX$4(node.parseUnit(command, index === 2 ? 'height' : 'width')) : command);
                                break;
                        }
                    }
                    REGEX_NAMED.lastIndex = 0;
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
                    if (previous === undefined || item.linear[directionA] >= previous.linear[directionB] || columnIndex > 0 && columnIndex === columnMax) {
                        columnMax = Math.max(columnIndex, columnMax);
                        rowIndex++;
                        columnIndex = 1;
                    }
                    const rowEnd = item.css('gridRowEnd');
                    const columnEnd = item.css('gridColumnEnd');
                    let rowSpan = 1;
                    let columnSpan = 1;
                    if (REGEX_SPAN.test(rowEnd)) {
                        rowSpan = parseInt(rowEnd.split(' ')[1]);
                    }
                    else if (isNumber$2(rowEnd)) {
                        rowSpan = parseInt(rowEnd) - rowIndex;
                    }
                    if (REGEX_SPAN.test(columnEnd)) {
                        columnSpan = parseInt(columnEnd.split(' ')[1]);
                    }
                    else if (isNumber$2(columnEnd)) {
                        columnSpan = parseInt(columnEnd) - columnIndex;
                    }
                    if (columnIndex === 1 && columnMax > 0) {
                        let valid = false;
                        do {
                            const available = new Array(columnMax - 1).fill(1);
                            for (const cell of layout) {
                                const placement = cell.placement;
                                if (placement[indexA] > rowIndex) {
                                    for (let i = placement[indexB]; i < placement[indexC]; i++) {
                                        available[i - 1] = 0;
                                    }
                                }
                            }
                            for (let i = 0, j = 0, k = 0; i < available.length; i++) {
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
                        trimString$2(template.trim(), '"').split(CHAR$3.SPACE).forEach((area, j) => {
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
                    const positions = [
                        item.css('gridRowStart'),
                        item.css('gridColumnStart'),
                        item.css('gridRowEnd'),
                        item.css('gridColumnEnd')
                    ];
                    const placement = [0, 0, 0, 0];
                    let rowSpan = -1;
                    let columnSpan = -1;
                    if (Object.keys(templateAreas).length) {
                        for (let i = 0; i < 4; i++) {
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
                            else if (REGEX_SPAN.test(value)) {
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
                        for (let i = 0; i < 4; i++) {
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
                    if (previousPlacement === undefined) {
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
                        outerCoord: horizontal ? item.linear.top : item.linear.left,
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
                for (const item of layout) {
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
                }
                const lengthA = unit.length;
                ITERATION = Math.max(length, outerCount, horizontal && !autoWidth || !horizontal && !autoHeight ? lengthA : 0);
                data.length = ITERATION;
                if (lengthA < ITERATION) {
                    if (data.autoFill || data.autoFit) {
                        if (lengthA === 0) {
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
                        const lengthB = auto.length;
                        if (lengthB) {
                            let i = 0;
                            while (unit.length < ITERATION) {
                                if (i === lengthB) {
                                    i = 0;
                                }
                                unit.push(auto[i]);
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
                for (const value of unit) {
                    if (isPercent$4(value)) {
                        percent -= parseFloat(value) / 100;
                    }
                    else if (isFr(value)) {
                        fr += parseFloat(value);
                    }
                    else if (value === 'auto') {
                        auto++;
                    }
                }
                data.flexible = percent < 1 || fr > 0;
                if (percent < 1) {
                    if (fr > 0) {
                        const lengthB = unit.length;
                        for (let i = 0; i < lengthB; i++) {
                            const value = unit[i];
                            if (isFr(value)) {
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
                        for (let i = (dense ? 0 : getOpenRowIndex(openCells)), j = 0, k = -1; i < length; i++) {
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
                        for (let i = l; i < m; i++) {
                            const data = rowData[i];
                            if (data === undefined) {
                                available.push([[0, -1]]);
                            }
                            else if (getColumnTotal(data) + COLUMN_SPAN <= ITERATION) {
                                const range = [];
                                let span = 0;
                                for (let j = 0, k = -1; j < ITERATION; j++) {
                                    const rowItem = data[j];
                                    if (rowItem === undefined) {
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
                                            for (let i = outside[0]; i < outside[1]; i++) {
                                                for (let j = 1; j < length; j++) {
                                                    const avail = available[j];
                                                    const lengthA = avail.length;
                                                    for (let k = 0; k < lengthA; k++) {
                                                        const inside = avail[k];
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
                            for (let i = 0; i < ITERATION; i++) {
                                cells[i] = 1;
                            }
                        }
                    }
                    if (rowCount > 1) {
                        const rowSpanMultiple = mainData.rowSpanMultiple;
                        for (let i = rowStart; i < rowStart + rowCount; i++) {
                            rowSpanMultiple[i] = true;
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
                    for (let i = 0; i < length; i++) {
                        const data = rowData[i];
                        const lengthA = data.length;
                        for (let j = 0; j < lengthA; j++) {
                            let rowItem = rowMain[j];
                            if (rowItem === undefined) {
                                rowItem = [];
                                rowMain[j] = rowItem;
                            }
                            rowItem[i] = data[j];
                        }
                    }
                }
                const unitTotal = horizontal ? row.unitTotal : column.unitTotal;
                const children = mainData.children;
                const columnCount = column.unit.length;
                for (const data of rowMain) {
                    const length = data.length;
                    for (let i = 0; i < length; i++) {
                        const columnItem = data[i];
                        let count = unitTotal[i] || 0;
                        if (columnItem) {
                            let maxDimension = 0;
                            for (const item of columnItem) {
                                if (!children.includes(item)) {
                                    maxDimension = Math.max(maxDimension, horizontal ? item.bounds.height : item.bounds.width);
                                    children.push(item);
                                }
                            }
                            count += maxDimension;
                        }
                        unitTotal[i] = count;
                    }
                }
                if (children.length === node.length) {
                    const { gap: rowGap, unit: rowUnit } = row;
                    const { gap: columnGap, unit: columnUnit } = column;
                    const rowCount = Math.max(rowUnit.length, rowMain.length);
                    const rowMax = new Array(rowCount).fill(0);
                    const columnMax = new Array(columnCount).fill(0);
                    const modified = new Set();
                    row.length = rowCount;
                    column.length = columnCount;
                    for (let i = 0; i < rowCount; i++) {
                        const rowItem = rowMain[i];
                        const unitHeight = rowUnit[i];
                        if (rowItem) {
                            for (let j = 0; j < columnCount; j++) {
                                const columnItem = rowItem[j];
                                if (columnItem) {
                                    for (const item of columnItem) {
                                        if (!modified.has(item)) {
                                            const { columnSpan, rowSpan } = item.data(CSS_GRID, 'cellData');
                                            const x = j + columnSpan - 1;
                                            const y = i + rowSpan - 1;
                                            if (x < columnCount - 1) {
                                                item.modifyBox(4 /* MARGIN_RIGHT */, columnGap);
                                            }
                                            if (y < rowCount - 1) {
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
                                    }
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

    const { withinRange: withinRange$2 } = squared.lib.util;
    const FLEXBOX = EXT_NAME.FLEXBOX;
    class Flexbox extends ExtensionUI {
        static createDataAttribute(node, children) {
            const wrap = node.css('flexWrap');
            const direction = node.css('flexDirection');
            const directionRow = /^row/.test(direction);
            return {
                directionRow,
                directionColumn: !directionRow,
                directionReverse: /reverse$/.test(direction),
                wrap: /^wrap/.test(wrap),
                wrapReverse: wrap === 'wrap-reverse',
                alignContent: node.css('alignContent'),
                justifyContent: node.css('justifyContent'),
                rowCount: 0,
                columnCount: 0,
                children
            };
        }
        is(node) {
            return node.flexElement;
        }
        condition(node) {
            return node.length > 0;
        }
        processNode(node) {
            const controller = this.controller;
            const [children, absolute] = node.partition((item) => item.pageFlow && !item.renderExclude);
            const mainData = Flexbox.createDataAttribute(node, children);
            if (node.cssTry('align-items', 'start')) {
                if (node.cssTry('justify-items', 'start')) {
                    for (const item of children) {
                        if (item.cssTry('align-self', 'start')) {
                            if (item.cssTry('justify-self', 'start')) {
                                const { width, height } = item.boundingClientRect;
                                item.data(FLEXBOX, 'boundsData', Object.assign(Object.assign({}, item.bounds), { width, height }));
                                item.cssFinally('justify-self');
                            }
                            item.cssFinally('align-self');
                        }
                    }
                    node.cssFinally('justify-items');
                }
                node.cssFinally('align-items');
            }
            if (mainData.wrap) {
                const [align, sort, size, method] = mainData.directionRow ? ['top', 'left', 'right', 'intersectY'] : ['left', 'top', 'bottom', 'intersectX'];
                children.sort((a, b) => {
                    const linearA = a.linear;
                    const linearB = b.linear;
                    if (!a[method](b.bounds, 'bounds')) {
                        return linearA[align] < linearB[align] ? -1 : 1;
                    }
                    else if (!withinRange$2(linearA[sort], linearB[sort])) {
                        return linearA[sort] < linearB[sort] ? -1 : 1;
                    }
                    return 0;
                });
                let rowStart = children[0];
                let row = [rowStart];
                const rows = [row];
                let length = children.length;
                for (let i = 1; i < length; i++) {
                    const item = children[i];
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
                if (length > 1) {
                    const boxSize = node.box[size];
                    for (let i = 0; i < length; i++) {
                        const seg = rows[i];
                        const group = controller.createNodeGroup(seg[0], seg, node, true);
                        group.containerIndex = i;
                        const box = group.unsafe('box');
                        if (box) {
                            box[size] = boxSize;
                        }
                        group.addAlign(128 /* SEGMENTED */);
                        maxCount = Math.max(seg.length, maxCount);
                    }
                    offset = length;
                }
                else {
                    const item = rows[0];
                    node.retain(item);
                    for (let i = 0; i < item.length; i++) {
                        item[i].containerIndex = i;
                    }
                    maxCount = item.length;
                    offset = maxCount;
                }
                for (let i = 0; i < absolute.length; i++) {
                    absolute[i].containerIndex = offset + i;
                }
                node.concat(absolute);
                node.sort();
                if (mainData.directionRow) {
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
                    const [c, d] = mainData.directionReverse ? [-1, 1] : [1, -1];
                    children.sort((a, b) => {
                        const orderA = a.flexbox.order;
                        const orderB = b.flexbox.order;
                        if (orderA === orderB) {
                            return 0;
                        }
                        return orderA > orderB ? c : d;
                    });
                }
                if (mainData.directionRow) {
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
    const { formatPX: formatPX$5, isLength: isLength$6, isPercent: isPercent$5 } = $lib$9.css;
    const { aboveRange: aboveRange$4, belowRange: belowRange$1, withinRange: withinRange$3 } = $lib$9.util;
    const GRID = EXT_NAME.GRID;
    function getRowIndex(columns, target) {
        const topA = target.linear.top;
        for (const column of columns) {
            const index = column.findIndex(item => {
                const top = item.linear.top;
                return withinRange$3(topA, top) || topA > top && topA < item.linear.bottom;
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
                rowStart: false,
                block: false
            };
        }
        condition(node) {
            if (node.length > 1 && !node.layoutElement && !node.has('listStyle')) {
                if (node.display === 'table') {
                    return node.every(item => item.display === 'table-row' && item.every(child => child.display === 'table-cell')) || node.every(item => item.display === 'table-cell');
                }
                else {
                    let length = 0;
                    let itemCount = 0;
                    for (const item of node) {
                        if (item.pageFlow && !item.visibleStyle.background && item.blockStatic && !item.autoMargin.leftRight && !item.autoMargin.left) {
                            if (item.length > 1) {
                                length++;
                            }
                            if (item.display === 'list-item' && !item.has('listStyleType')) {
                                itemCount++;
                            }
                        }
                        else {
                            return false;
                        }
                    }
                    if (itemCount === node.length) {
                        return true;
                    }
                    else if (length) {
                        return node.every(item => item.length > 0 && NodeUI.linearData(item.children).linearX);
                    }
                }
            }
            return false;
        }
        processNode(node) {
            var _a, _b, _c, _d;
            const columnEnd = [];
            const columns = [];
            const nextMapX = {};
            for (const row of node) {
                for (const column of row) {
                    if (column.visible) {
                        const x = Math.floor(column.linear.left);
                        let map = nextMapX[x];
                        if (map === undefined) {
                            map = [];
                            nextMapX[x] = map;
                        }
                        map.push(column);
                    }
                }
            }
            const nextCoordsX = Object.keys(nextMapX);
            const length = nextCoordsX.length;
            if (length) {
                let columnLength = -1;
                for (let i = 0; i < length; i++) {
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
                    for (let i = 0; i < length; i++) {
                        columns.push(nextMapX[nextCoordsX[i]]);
                    }
                }
                else {
                    const columnRight = [];
                    for (let i = 0; i < length; i++) {
                        const nextAxisX = nextMapX[nextCoordsX[i]];
                        const lengthA = nextAxisX.length;
                        if (i === 0 && lengthA === 0) {
                            return undefined;
                        }
                        columnRight[i] = i === 0 ? 0 : columnRight[i - 1];
                        for (let j = 0; j < lengthA; j++) {
                            const nextX = nextAxisX[j];
                            const { left, right } = nextX.linear;
                            if (i === 0 || aboveRange$4(left, columnRight[i - 1])) {
                                let row = columns[i];
                                if (row === undefined) {
                                    row = [];
                                    columns[i] = row;
                                }
                                if (i === 0 || columns[0].length === lengthA) {
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
                                const endIndex = columns.length - 1;
                                if (columns[endIndex]) {
                                    let minLeft = Number.POSITIVE_INFINITY;
                                    let maxRight = Number.NEGATIVE_INFINITY;
                                    columns[endIndex].forEach(item => {
                                        const { left: leftA, right: rightA } = item.linear;
                                        if (leftA < minLeft) {
                                            minLeft = leftA;
                                        }
                                        if (rightA > maxRight) {
                                            maxRight = rightA;
                                        }
                                    });
                                    if (Math.floor(left) > Math.ceil(minLeft) && Math.floor(right) > Math.ceil(maxRight)) {
                                        const index = getRowIndex(columns, nextX);
                                        if (index !== -1) {
                                            for (let k = columns.length - 1; k >= 0; k--) {
                                                const row = columns[k];
                                                if (row) {
                                                    if (row[index] === undefined) {
                                                        columns[endIndex].length = 0;
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
                    const lengthB = columnRight.length;
                    for (let i = 0, j = -1; i < lengthB; i++) {
                        if (columns[i] === undefined) {
                            if (j === -1) {
                                j = i - 1;
                            }
                            else if (i === lengthB - 1) {
                                columnRight[j] = columnRight[i];
                            }
                        }
                        else if (j !== -1) {
                            columnRight[j] = columnRight[i - 1];
                            j = -1;
                        }
                    }
                    for (let i = 0; i < columns.length; i++) {
                        if ((_a = columns[i]) === null || _a === void 0 ? void 0 : _a.length) {
                            columnEnd.push(columnRight[i]);
                        }
                        else {
                            columns.splice(i--, 1);
                        }
                    }
                    const maxColumn = columns.reduce((a, b) => Math.max(a, b.length), 0);
                    for (let l = 0; l < maxColumn; l++) {
                        const lengthC = columns.length;
                        for (let m = 0; m < lengthC; m++) {
                            const row = columns[m];
                            if (row[l] === undefined) {
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
                for (let i = 0, count = 0; i < columnCount; i++) {
                    const column = columns[i];
                    let spacer = 0;
                    for (let j = 0, start = 0; j < column.length; j++) {
                        const item = column[j];
                        const rowCount = column.length;
                        let rowData = children[j];
                        if (rowData === undefined) {
                            rowData = [];
                            children[j] = rowData;
                        }
                        if (!item['spacer']) {
                            const data = Object.assign(Grid.createDataCellAttribute(), item.data(GRID, 'cellData'));
                            let rowSpan = 1;
                            let columnSpan = 1 + spacer;
                            for (let k = i + 1; k < columnCount; k++) {
                                const row = columns[k][j];
                                if (row.spacer === 1) {
                                    columnSpan++;
                                    row.spacer = 2;
                                }
                                else {
                                    break;
                                }
                            }
                            if (columnSpan === 1) {
                                for (let k = j + 1; k < rowCount; k++) {
                                    const row = column[k];
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
                                for (const sibling of item.actualParent.naturalChildren) {
                                    if (!assigned.has(sibling) && sibling.visible && !sibling.rendered) {
                                        const linear = sibling.linear;
                                        if (aboveRange$4(linear.left, item.linear.right) && belowRange$1(linear.right, columnEnd[l])) {
                                            let siblings = data.siblings;
                                            if (siblings === undefined) {
                                                siblings = [];
                                                data.siblings = siblings;
                                            }
                                            siblings.push(sibling);
                                        }
                                    }
                                }
                            }
                            data.rowSpan = rowSpan;
                            data.columnSpan = columnSpan;
                            data.rowStart = start++ === 0;
                            data.rowEnd = columnSpan + i === columnCount;
                            data.cellStart = count === 0;
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
                for (const group of children) {
                    let hasLength = true;
                    let hasPercent = false;
                    for (const item of group) {
                        const width = item.css('width');
                        if (isPercent$5(width)) {
                            hasPercent = true;
                        }
                        else if (!isLength$6(width)) {
                            hasLength = false;
                            break;
                        }
                    }
                    const lengthA = group.length;
                    if (lengthA > 1 && hasLength && hasPercent) {
                        const cellData = group[0].data(GRID, 'cellData');
                        if (((_b = cellData) === null || _b === void 0 ? void 0 : _b.rowSpan) === 1) {
                            let siblings = ((_c = cellData.siblings) === null || _c === void 0 ? void 0 : _c.slice(0)) || [];
                            for (let i = 1; i < lengthA; i++) {
                                const item = group[i];
                                const siblingData = item.data(GRID, 'cellData');
                                if (((_d = siblingData) === null || _d === void 0 ? void 0 : _d.rowSpan) === 1) {
                                    siblings.push(item);
                                    if (siblingData.siblings) {
                                        siblings = siblings.concat(siblingData.siblings);
                                    }
                                }
                                else {
                                    siblings.length = 0;
                                    break;
                                }
                            }
                            if (siblings.length) {
                                cellData.block = true;
                                cellData.columnSpan = columnCount;
                                cellData.siblings = siblings;
                                group.length = 1;
                            }
                        }
                    }
                    for (const item of group) {
                        item.parent = node;
                        if (item.percentWidth && !hasLength) {
                            item.css('width', formatPX$5(item.bounds.width), true);
                        }
                    }
                }
                if (node.tableElement && node.css('borderCollapse') === 'collapse') {
                    node.modifyBox(32 /* PADDING_TOP */);
                    node.modifyBox(64 /* PADDING_RIGHT */);
                    node.modifyBox(128 /* PADDING_BOTTOM */);
                    node.modifyBox(256 /* PADDING_LEFT */);
                }
                node.data(GRID, 'columnCount', columnCount);
            }
            return undefined;
        }
    }

    const { convertListStyle: convertListStyle$1 } = squared.lib.css;
    const hasSingleImage = (visibleStyle) => visibleStyle.backgroundImage && !visibleStyle.backgroundRepeat;
    class List extends ExtensionUI {
        static createDataAttribute() {
            return {
                ordinal: '',
                imageSrc: '',
                imagePosition: ''
            };
        }
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
                for (let i = 0; i < length; i++) {
                    const item = children[i];
                    if (item.display === 'list-item' && (item.css('listStyleType') !== 'none' || item.innerBefore) || item.marginLeft < 0 && item.css('listStyleType') === 'none' && hasSingleImage(item.visibleStyle)) {
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
                const value = item.css('listStyleType');
                const enabled = item.display === 'list-item';
                if (enabled || value !== '' && value !== 'none' || hasSingleImage(item.visibleStyle)) {
                    if (item.has('listStyleImage')) {
                        mainData.imageSrc = item.css('listStyleImage');
                    }
                    else {
                        if (ordered && enabled && item.tagName === 'LI') {
                            i = item.toElementInt('value') || i;
                        }
                        let ordinal = convertListStyle$1(value, i);
                        if (ordinal === '') {
                            switch (value) {
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
                        i++;
                    }
                }
                item.data(EXT_NAME.LIST, 'mainData', mainData);
            });
            return undefined;
        }
    }

    const $lib$a = squared.lib;
    const { assignRect: assignRect$1 } = $lib$a.dom;
    const { convertFloat: convertFloat$4, filterArray: filterArray$3, withinRange: withinRange$4 } = $lib$a.util;
    class Relative extends ExtensionUI {
        is(node) {
            return node.positionRelative || node.toFloat('verticalAlign', 0, true) !== 0;
        }
        condition() {
            return true;
        }
        processNode() {
            return { include: true };
        }
        postOptimize(node) {
            var _a, _b, _c;
            const renderParent = node.renderParent;
            const verticalAlign = convertFloat$4(node.verticalAlign);
            let target = node;
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
            if (renderParent.layoutHorizontal && renderParent.support.positionRelative && node.renderChildren.length === 0 && (top !== 0 || bottom !== 0 || verticalAlign !== 0)) {
                const application = this.application;
                target = node.clone(application.nextId, true, true);
                target.baselineAltered = true;
                node.hide(true);
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
                            const unaligned = filterArray$3(children, item => item.positionRelative && item.length > 0 && convertFloat$4(node.verticalAlign) !== 0);
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
                                for (let i = 0; i < length; i++) {
                                    const item = unaligned[i];
                                    if (i === 0) {
                                        node.modifyBox(2 /* MARGIN_TOP */, convertFloat$4(item.verticalAlign));
                                    }
                                    else {
                                        item.modifyBox(2 /* MARGIN_TOP */, item.linear.top - unaligned[0].linear.top);
                                    }
                                    item.css('verticalAlign', '0px', true);
                                }
                            }
                            break;
                        }
                    }
                }
            }
            else if (node.naturalElement && node.positionRelative) {
                const bounds = node.bounds;
                const hasVertical = top !== 0 || bottom !== 0;
                const hasHorizontal = left !== 0 || right !== 0;
                let preceding = false;
                let previous;
                for (const item of node.actualParent.naturalElements) {
                    if (item === node) {
                        if (preceding) {
                            if (hasVertical && renderParent.layoutVertical) {
                                const rect = assignRect$1(node.boundingClientRect);
                                if (top !== 0) {
                                    top -= rect.top - bounds.top;
                                }
                                else {
                                    if (((_a = previous) === null || _a === void 0 ? void 0 : _a.positionRelative) && previous.has('top')) {
                                        bottom += bounds.bottom - rect.bottom;
                                    }
                                    else {
                                        bottom += rect.bottom - bounds.bottom;
                                    }
                                }
                            }
                            if (hasHorizontal && renderParent.layoutHorizontal && node.alignSibling('leftRight') === '') {
                                const rect = assignRect$1(node.boundingClientRect);
                                if (left !== 0) {
                                    left -= rect.left - bounds.left;
                                }
                                else {
                                    if (((_b = previous) === null || _b === void 0 ? void 0 : _b.positionRelative) && previous.has('right')) {
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
                                if (((_c = previous) === null || _c === void 0 ? void 0 : _c.blockStatic) && previous.positionRelative && item.blockStatic) {
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
                    const backgroundPositionX = node.css('backgroundPositionX');
                    const backgroundPositionY = node.css('backgroundPositionY');
                    const position = getBackgroundPosition$1(backgroundPositionX + ' ' + backgroundPositionY, dimension, node.fontSize, undefined, '', node.localSettings.screenDimension);
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

    const $lib$b = squared.lib;
    const { formatPercent: formatPercent$1, formatPX: formatPX$6, getInheritedStyle: getInheritedStyle$2, getStyle: getStyle$4, isLength: isLength$7, isPercent: isPercent$6 } = $lib$b.css;
    const { getNamedItem: getNamedItem$2 } = $lib$b.dom;
    const { maxArray } = $lib$b.math;
    const { isNumber: isNumber$3, replaceMap, withinRange: withinRange$5 } = $lib$b.util;
    const TABLE = EXT_NAME.TABLE;
    const REGEX_BACKGROUND$2 = /rgba\(0, 0, 0, 0\)|transparent/;
    function setAutoWidth(node, td, data) {
        data.percent = Math.round((td.bounds.width / node.box.width) * 100) + '%';
        data.expand = true;
    }
    const setBoundsWidth = (td) => td.css('width', formatPX$6(td.bounds.width), true);
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
            var _a, _b, _c;
            const mainData = Table.createDataAttribute(node);
            const tbody = [];
            let table = [];
            let tfoot;
            let thead;
            function inheritStyles(parent) {
                if (parent) {
                    for (const item of parent.cascade()) {
                        switch (item.tagName) {
                            case 'TH':
                            case 'TD':
                                item.inherit(parent, 'styleMap');
                                item.unsetCache('visibleStyle');
                                break;
                        }
                    }
                    table = table.concat(parent.children);
                    parent.hide();
                }
            }
            node.each((item) => {
                switch (item.tagName) {
                    case 'THEAD':
                        if (thead === undefined) {
                            thead = item;
                        }
                        else {
                            item.hide();
                        }
                        break;
                    case 'TBODY':
                        tbody.push(item);
                        break;
                    case 'TFOOT':
                        if (tfoot === undefined) {
                            tfoot = item;
                        }
                        else {
                            item.hide();
                        }
                        break;
                }
            });
            inheritStyles(thead);
            for (const section of tbody) {
                table = table.concat(section.children);
                section.hide();
            }
            inheritStyles(tfoot);
            const [horizontal, vertical] = mainData.borderCollapse ? [0, 0] : replaceMap(node.css('borderSpacing').split(' '), (value, index) => node.parseUnit(value, index === 0 ? 'width' : 'height'));
            const spacingWidth = horizontal > 1 ? Math.round(horizontal / 2) : horizontal;
            const spacingHeight = vertical > 1 ? Math.round(vertical / 2) : vertical;
            const colgroup = node.element.querySelector('COLGROUP');
            const rowWidth = [];
            const mapBounds = [];
            const tableFilled = [];
            const mapWidth = [];
            const rowCount = table.length;
            let columnCount = 0;
            for (let i = 0; i < rowCount; i++) {
                const tr = table[i];
                rowWidth[i] = horizontal;
                const row = tableFilled[i] || [];
                tableFilled[i] = row;
                tr.each((td, index) => {
                    const element = td.element;
                    const rowSpan = element.rowSpan;
                    let colSpan = element.colSpan;
                    let j = -1;
                    for (let k = 0; j === -1; k++) {
                        if (row[k] === undefined) {
                            j = k;
                        }
                    }
                    for (let k = i; k < i + rowSpan; k++) {
                        if (tableFilled[k] === undefined) {
                            tableFilled[k] = [];
                        }
                        for (let l = j, m = 0; l < j + colSpan; l++) {
                            if (tableFilled[k][l] === undefined) {
                                tableFilled[k][l] = td;
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
                        if (isPercent$6(value)) {
                            td.css('width', value, true);
                        }
                        else if (isNumber$3(value)) {
                            td.css('width', formatPX$6(parseFloat(value)), true);
                        }
                    }
                    if (!td.hasPX('height')) {
                        const value = getNamedItem$2(element, 'height');
                        if (isPercent$6(value)) {
                            td.css('height', value);
                        }
                        else if (isNumber$3(value)) {
                            td.css('height', formatPX$6(parseFloat(value)));
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
                                td.css('backgroundColor', backgroundColor, true);
                            }
                        }
                        else {
                            let value = getInheritedStyle$2(element, 'backgroundImage', /none/, 'TABLE');
                            if (value !== '') {
                                td.css('backgroundImage', value, true);
                            }
                            value = getInheritedStyle$2(element, 'backgroundColor', REGEX_BACKGROUND$2, 'TABLE');
                            if (value !== '') {
                                td.css('backgroundColor', value, true);
                            }
                        }
                    }
                    function setBorderStyle(attr, including) {
                        const cssStyle = attr + 'Style';
                        td.ascend({ including }).some((item) => {
                            if (item.has(cssStyle)) {
                                const cssColor = attr + 'Color';
                                const cssWidth = attr + 'Width';
                                td.css(cssStyle, item.css(cssStyle));
                                td.css(cssColor, item.css(cssColor));
                                td.css(cssWidth, item.css(cssWidth), true);
                                td.css('border', 'inherit');
                                return true;
                            }
                            return false;
                        });
                    }
                    switch (td.tagName) {
                        case 'TD': {
                            const including = td.parent;
                            if (td.borderTopWidth === 0) {
                                setBorderStyle('borderTop', including);
                            }
                            if (td.borderRightWidth === 0) {
                                setBorderStyle('borderRight', including);
                            }
                            if (td.borderBottomWidth === 0) {
                                setBorderStyle('borderBottom', including);
                            }
                            if (td.borderLeftWidth === 0) {
                                setBorderStyle('borderLeft', including);
                            }
                            break;
                        }
                        case 'TH': {
                            if (td.cssInitial('textAlign') === '') {
                                td.css('textAlign', 'center');
                            }
                            if (td.borderTopWidth === 0) {
                                setBorderStyle('borderTop', node);
                            }
                            if (td.borderBottomWidth === 0) {
                                setBorderStyle('borderBottom', node);
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
                            const percent = isPercent$6(columnWidth);
                            const length = isLength$7(mapWidth[j]);
                            if (reevaluate || width < mapBounds[j] || width === mapBounds[j] && (length && percent || percent && isPercent$6(mapWidth[j]) && td.parseUnit(columnWidth) >= td.parseUnit(mapWidth[j]) || length && isLength$7(columnWidth) && td.parseUnit(columnWidth) > td.parseUnit(mapWidth[j]))) {
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
                tr.hide();
                columnCount = Math.max(columnCount, row.length);
            }
            if (node.hasPX('width', false) && mapWidth.some(value => isPercent$6(value))) {
                replaceMap(mapWidth, (value, index) => {
                    if (value === 'auto') {
                        const dimension = mapBounds[index];
                        if (dimension > 0) {
                            return formatPX$6(dimension);
                        }
                    }
                    return value;
                });
            }
            let percentAll = false;
            if (mapWidth.every(value => isPercent$6(value))) {
                if (mapWidth.reduce((a, b) => a + parseFloat(b), 0) > 1) {
                    let percentTotal = 100;
                    replaceMap(mapWidth, value => {
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
            else if (mapWidth.every(value => isLength$7(value))) {
                const width = mapWidth.reduce((a, b) => a + parseFloat(b), 0);
                if (node.hasWidth) {
                    if (width < node.width) {
                        replaceMap(mapWidth, value => value !== '0px' ? ((parseFloat(value) / width) * 100) + '%' : value);
                    }
                    else if (width > node.width) {
                        node.css('width', 'auto');
                        if (!mainData.layoutFixed) {
                            for (const item of node.cascade()) {
                                item.css('width', 'auto');
                            }
                        }
                    }
                }
                if (mainData.layoutFixed && !node.hasPX('width')) {
                    node.css('width', formatPX$6(node.bounds.width));
                }
            }
            let mapPercent = 0;
            mainData.layoutType = (() => {
                if (mapWidth.length > 1) {
                    mapPercent = mapWidth.reduce((a, b) => a + (isPercent$6(b) ? parseFloat(b) : 0), 0);
                    if (mainData.layoutFixed && mapWidth.reduce((a, b) => a + (isLength$7(b) ? parseFloat(b) : 0), 0) >= node.actualWidth) {
                        return 4 /* COMPRESS */;
                    }
                    else if (mapWidth.length > 1 && mapWidth.some(value => isPercent$6(value)) || mapWidth.every(value => isLength$7(value) && value !== '0px')) {
                        return 3 /* VARIABLE */;
                    }
                    else if (mapWidth.every(value => value === mapWidth[0])) {
                        if (node.cascadeSome(td => td.hasHeight)) {
                            mainData.expand = true;
                            return 3 /* VARIABLE */;
                        }
                        else if (mapWidth[0] === 'auto') {
                            if (node.hasWidth) {
                                return 3 /* VARIABLE */;
                            }
                            else {
                                const td = node.cascade(item => item.tagName === 'TD');
                                if (td.length && td.every(item => withinRange$5(item.bounds.width, td[0].bounds.width))) {
                                    return 0 /* NONE */;
                                }
                                return 3 /* VARIABLE */;
                            }
                        }
                        else if (node.hasWidth) {
                            return 2 /* FIXED */;
                        }
                    }
                    if (mapWidth.every(value => value === 'auto' || isLength$7(value) && value !== '0px')) {
                        if (!node.hasWidth) {
                            mainData.expand = true;
                        }
                        return 1 /* STRETCH */;
                    }
                }
                return 0 /* NONE */;
            })();
            const caption = node.find(item => item.tagName === 'CAPTION');
            node.clear();
            if (caption) {
                if (!caption.hasWidth) {
                    if (caption.textElement) {
                        if (!caption.hasPX('maxWidth')) {
                            caption.css('maxWidth', formatPX$6(caption.bounds.width));
                        }
                    }
                    else if (caption.bounds.width > maxArray(rowWidth)) {
                        setBoundsWidth(caption);
                    }
                }
                if (!caption.cssInitial('textAlign')) {
                    caption.css('textAlign', 'center');
                }
                caption.data(TABLE, 'cellData', { colSpan: columnCount });
                caption.parent = node;
            }
            const hasWidth = node.hasWidth;
            for (let i = 0; i < rowCount; i++) {
                const tr = tableFilled[i];
                const length = tr.length;
                for (let j = 0; j < length;) {
                    const td = tr[j];
                    const data = td.data(TABLE, 'cellData');
                    if (data.placed) {
                        j += data.colSpan;
                        continue;
                    }
                    const columnWidth = mapWidth[j];
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
                                else if (isPercent$6(columnWidth)) {
                                    if (percentAll) {
                                        data.percent = columnWidth;
                                        data.expand = true;
                                    }
                                    else {
                                        setBoundsWidth(td);
                                    }
                                }
                                else if (isLength$7(columnWidth) && parseInt(columnWidth) > 0) {
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
                                td.css('width', '0px');
                                break;
                            case 1 /* STRETCH */:
                                if (columnWidth === 'auto') {
                                    td.css('width', '0px');
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
                                if (!isLength$7(columnWidth)) {
                                    td.hide();
                                }
                                break;
                        }
                    }
                    data.placed = true;
                    td.parent = node;
                    j += data.colSpan;
                }
                if (length < columnCount) {
                    const data = tr[length - 1].data(TABLE, 'cellData');
                    if (data) {
                        data.spaceSpan = columnCount - length;
                    }
                }
            }
            if (mainData.borderCollapse) {
                const borderTopColor = node.css('borderTopColor');
                const borderTopStyle = node.css('borderTopStyle');
                const borderTopWidth = node.css('borderTopWidth');
                const borderRightColor = node.css('borderRightColor');
                const borderRightStyle = node.css('borderRightStyle');
                const borderRightWidth = node.css('borderRightWidth');
                const borderBottomColor = node.css('borderBottomColor');
                const borderBottomStyle = node.css('borderBottomStyle');
                const borderBottomWidth = node.css('borderBottomWidth');
                const borderLeftColor = node.css('borderLeftColor');
                const borderLeftStyle = node.css('borderLeftStyle');
                const borderLeftWidth = node.css('borderLeftWidth');
                let hideTop = false;
                let hideRight = false;
                let hideBottom = false;
                let hideLeft = false;
                for (let i = 0; i < rowCount; i++) {
                    for (let j = 0; j < columnCount; j++) {
                        const td = tableFilled[i][j];
                        if (((_a = td) === null || _a === void 0 ? void 0 : _a.css('visibility')) === 'visible') {
                            if (i === 0) {
                                if (td.borderTopWidth < parseInt(borderTopWidth)) {
                                    td.cssApply({
                                        borderTopColor,
                                        borderTopStyle,
                                        borderTopWidth
                                    }, true);
                                }
                                else {
                                    hideTop = true;
                                }
                            }
                            if (i >= 0 && i < rowCount - 1) {
                                const next = tableFilled[i + 1][j];
                                if (((_b = next) === null || _b === void 0 ? void 0 : _b.css('visibility')) === 'visible' && next !== td) {
                                    if (td.borderBottomWidth > next.borderTopWidth) {
                                        next.css('borderTopWidth', '0px', true);
                                    }
                                    else {
                                        td.css('borderBottomWidth', '0px', true);
                                    }
                                }
                            }
                            if (i === rowCount - 1) {
                                if (td.borderBottomWidth < parseInt(borderBottomWidth)) {
                                    td.cssApply({
                                        borderBottomColor,
                                        borderBottomStyle,
                                        borderBottomWidth
                                    }, true);
                                }
                                else {
                                    hideBottom = true;
                                }
                            }
                            if (j === 0) {
                                if (td.borderLeftWidth < parseInt(borderLeftWidth)) {
                                    td.cssApply({
                                        borderLeftColor,
                                        borderLeftStyle,
                                        borderLeftWidth
                                    }, true);
                                }
                                else {
                                    hideLeft = true;
                                }
                            }
                            if (j >= 0 && j < columnCount - 1) {
                                const next = tableFilled[i][j + 1];
                                if (((_c = next) === null || _c === void 0 ? void 0 : _c.css('visibility')) === 'visible' && next !== td) {
                                    if (td.borderRightWidth >= next.borderLeftWidth) {
                                        next.css('borderLeftWidth', '0px', true);
                                    }
                                    else {
                                        td.css('borderRightWidth', '0px', true);
                                    }
                                }
                            }
                            if (j === columnCount - 1) {
                                if (td.borderRightWidth < parseInt(borderRightWidth)) {
                                    td.cssApply({
                                        borderRightColor,
                                        borderRightStyle,
                                        borderRightWidth
                                    }, true);
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
            mainData.rowCount = rowCount;
            mainData.columnCount = columnCount;
            node.data(TABLE, 'mainData', mainData);
            return undefined;
        }
    }

    const $lib$c = squared.lib;
    const { isLength: isLength$8 } = $lib$c.css;
    const { convertFloat: convertFloat$5 } = $lib$c.util;
    class VerticalAlign extends ExtensionUI {
        is() {
            return true;
        }
        condition(node) {
            let valid = false;
            let alignable = 0;
            let inlineVertical = 0;
            let sameValue = 0;
            for (const item of node) {
                if (item.inlineVertical) {
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
                if (item.positionStatic || item.positionRelative && item.length) {
                    alignable++;
                }
            }
            return valid && isNaN(sameValue) && inlineVertical > 1 && alignable === node.length && NodeUI.linearData(node.children).linearX;
        }
        processNode(node) {
            node.each((item) => {
                if (item.inlineVertical && isLength$8(item.verticalAlign) || item.imageElement || item.svgElement) {
                    item.baselineAltered = true;
                }
            });
            return { include: true };
        }
        postConstraints(node) {
            var _a;
            if (node.layoutHorizontal) {
                for (const children of (node.horizontalRows || [node.renderChildren])) {
                    const aboveBaseline = [];
                    let minTop = Number.POSITIVE_INFINITY;
                    let baseline;
                    for (const item of children) {
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
                    }
                    if (aboveBaseline.length) {
                        const above = aboveBaseline[0];
                        const top = above.linear.top;
                        for (const item of children) {
                            if (item !== baseline) {
                                if (item.inlineVertical) {
                                    if (!aboveBaseline.includes(item)) {
                                        if (isLength$8(item.verticalAlign) || baseline === undefined) {
                                            item.modifyBox(2 /* MARGIN_TOP */, item.linear.top - top);
                                            item.baselineAltered = true;
                                        }
                                    }
                                    else if ((item.imageElement || item.svgElement) && ((_a = baseline) === null || _a === void 0 ? void 0 : _a.documentId) === item.alignSibling('baseline')) {
                                        item.modifyBox(2 /* MARGIN_TOP */, baseline.linear.top - item.linear.top);
                                    }
                                }
                                if (item.baselineAltered) {
                                    item.css('verticalAlign', '0px', true);
                                }
                            }
                        }
                        if (baseline) {
                            baseline.modifyBox(2 /* MARGIN_TOP */, baseline.linear.top - top + Math.min(0, above.parseUnit(above.cssInitial('verticalAlign'), 'height')));
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
    const $lib$d = squared.lib;
    const { formatPX: formatPX$7 } = $lib$d.css;
    const { hasBit: hasBit$5 } = $lib$d.util;
    const DOCTYPE_HTML = ((_a = document.doctype) === null || _a === void 0 ? void 0 : _a.name) === 'html';
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
            (node.renderAs || node.outerMostWrapper).modifyBox(region, offset);
        }
    }
    function applyMarginCollapse(node, child, direction) {
        if (isBlockElement(child, direction)) {
            const [margin, borderWidth, padding, region] = direction ? ['marginTop', 'borderTopWidth', 'paddingTop', 2 /* MARGIN_TOP */]
                : ['marginBottom', 'borderBottomWidth', 'paddingBottom', 8 /* MARGIN_BOTTOM */];
            if (node[borderWidth] === 0) {
                if (node[padding] === 0) {
                    while (DOCTYPE_HTML && child[margin] === 0 && child[borderWidth] === 0 && child[padding] === 0 && canResetChild(child)) {
                        const endChild = (direction ? child.firstStaticChild : child.lastStaticChild);
                        if (isBlockElement(endChild, direction)) {
                            child = endChild;
                        }
                        else {
                            break;
                        }
                    }
                    const offsetParent = node[margin];
                    const offsetChild = child[margin];
                    if (offsetParent > 0 || offsetChild > 0) {
                        const height = child.bounds.height;
                        let resetChild = false;
                        if (!DOCTYPE_HTML && offsetParent === 0 && offsetChild > 0 && child.cssInitial(margin) === '') {
                            resetChild = true;
                        }
                        else {
                            const outside = offsetParent >= offsetChild;
                            if (height === 0 && outside && child.textEmpty && child.extensions.length === 0) {
                                child.hide();
                            }
                            else if (child.getBox(region)[0] !== 1) {
                                if (outside) {
                                    resetChild = true;
                                }
                                else if (node.documentBody) {
                                    resetMargin(node, region);
                                    if (direction) {
                                        node.bounds.top = 0;
                                        node.unset('box');
                                        node.unset('linear');
                                    }
                                }
                                else {
                                    if (node.getBox(region)[0] !== 1) {
                                        node.modifyBox(region);
                                        node.modifyBox(region, offsetChild);
                                    }
                                    resetChild = true;
                                }
                            }
                            else {
                                const outerWrapper = child.registerBox(region);
                                if (outerWrapper) {
                                    const value = outerWrapper.getBox(region)[1];
                                    if (value > 0) {
                                        node.modifyBox(region);
                                        node.modifyBox(region, value);
                                        outerWrapper.modifyBox(region, -value);
                                    }
                                }
                            }
                        }
                        if (resetChild) {
                            resetMargin(child, region);
                            if (height === 0 && !child.every(item => item.floating)) {
                                resetMargin(child, direction ? 8 /* MARGIN_BOTTOM */ : 2 /* MARGIN_TOP */);
                            }
                        }
                    }
                }
                else if (child[margin] === 0 && child[borderWidth] === 0 && canResetChild(child)) {
                    let blockAll = true;
                    do {
                        const endChild = (direction ? child.firstStaticChild : child.lastStaticChild);
                        if (endChild && endChild[margin] === 0 && endChild[borderWidth] === 0 && !endChild.visibleStyle.background && canResetChild(endChild)) {
                            const value = endChild[padding];
                            if (value > 0) {
                                if (value >= node[padding]) {
                                    node.modifyBox(direction ? 32 /* PADDING_TOP */ : 128 /* PADDING_BOTTOM */);
                                }
                                else if (blockAll) {
                                    node.modifyBox(direction ? 32 /* PADDING_TOP */ : 128 /* PADDING_BOTTOM */, -value);
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
    function resetMargin(node, region) {
        if (node.getBox(region)[0] === 0) {
            node.modifyBox(region);
        }
        else {
            const outerWrapper = node.registerBox(region);
            if (outerWrapper) {
                const offset = node[CSS_SPACING.get(region)];
                outerWrapper.modifyBox(region, -offset, false);
            }
        }
    }
    function isBlockElement(node, direction, checkIndex = false) {
        if (node && !node.lineBreak) {
            let valid = false;
            if (node.blockStatic) {
                valid = true;
            }
            else if (!node.floating) {
                switch (node.display) {
                    case 'table':
                    case 'list-item':
                        valid = true;
                        checkIndex = false;
                        break;
                    default:
                        if (direction) {
                            const firstChild = node.firstStaticChild;
                            valid = isBlockElement(firstChild) && validAboveChild(firstChild);
                        }
                        else {
                            const lastChild = node.lastStaticChild;
                            valid = isBlockElement(lastChild) && validBelowChild(lastChild);
                        }
                        break;
                }
            }
            return valid && (!checkIndex || direction === undefined || node.bounds.height > 0);
        }
        return false;
    }
    function getMarginOffset(below, above, lineHeight, aboveLineBreak) {
        const top = below.linear.top;
        if (aboveLineBreak) {
            const bottom = Math.max(aboveLineBreak.linear.top, above.linear.bottom);
            if (bottom < top) {
                return top - bottom - lineHeight;
            }
        }
        return top - above.linear.bottom - lineHeight;
    }
    const setMinHeight = (node, offset) => node.css('minHeight', formatPX$7(Math.max(offset, node.hasPX('minHeight', false) ? node.parseUnit(node.css('minHeight')) : 0)));
    const canResetChild = (node) => !node.layoutElement && !node.tableElement && node.tagName !== 'FIELDSET';
    const validAboveChild = (node) => !node.hasPX('height') && node.paddingBottom === 0 && node.borderBottomWidth === 0 && canResetChild(node);
    const validBelowChild = (node) => !node.hasPX('height') && node.borderTopWidth === 0 && node.paddingTop === 0 && canResetChild(node);
    class WhiteSpace extends ExtensionUI {
        afterBaseLayout() {
            var _a, _b, _c, _d;
            const processed = new Set();
            for (const node of this.cacheProcessing) {
                if (node.naturalElement && node.naturalElements.length && !node.layoutElement && !node.tableElement) {
                    const children = node.naturalChildren;
                    if (children[0].documentBody) {
                        continue;
                    }
                    const actualParent = node.actualParent;
                    const blockParent = isBlockElement(node) && !actualParent.layoutElement;
                    const pageFlow = node.pageFlow;
                    let firstChild;
                    let lastChild;
                    const length = children.length;
                    for (let i = 0; i < length; i++) {
                        const current = children[i];
                        if (current.pageFlow) {
                            if (blockParent) {
                                if (pageFlow && !current.floating) {
                                    if (current.bounds.height > 0 || length === 1 || isBlockElement(current, i === 0 ? true : (i === length - 1 ? false : undefined), true)) {
                                        if (firstChild === undefined) {
                                            firstChild = current;
                                        }
                                        lastChild = current;
                                    }
                                    else if (current.bounds.height === 0 && node.layoutVertical && current.alignSibling('topBottom') === '' && current.alignSibling('bottomTop') === '' && (current.renderChildren.length === 0 || current.every((item) => !item.visible)) && (!current.pseudoElement ||
                                        current.pseudoElement && (length === 1 || i > 0 || children.every((item, index) => index === 0 || item.floating || item.pseudoElement && item.textContent.trim() === '')))) {
                                        current.hide();
                                    }
                                }
                                else {
                                    lastChild = undefined;
                                }
                            }
                            if (i > 0 && isBlockElement(current, false)) {
                                const previousSiblings = current.previousSiblings({ floating: false });
                                const lengthA = previousSiblings.length;
                                if (lengthA) {
                                    let inheritedTop = false;
                                    const previous = previousSiblings[lengthA - 1];
                                    if (isBlockElement(previous, true)) {
                                        let marginBottom = previous.marginBottom;
                                        let marginTop = current.marginTop;
                                        if (previous.excluded && !current.excluded) {
                                            const offset = Math.min(marginBottom, previous.marginTop);
                                            if (offset < 0) {
                                                current.modifyBox(2 /* MARGIN_TOP */, Math.abs(offset) < marginTop ? offset : undefined);
                                                processed.add(previous.id);
                                                continue;
                                            }
                                        }
                                        else if (!previous.excluded && current.excluded) {
                                            const offset = Math.min(marginTop, current.marginBottom);
                                            if (offset < 0) {
                                                previous.modifyBox(8 /* MARGIN_BOTTOM */, Math.abs(offset) < marginBottom ? offset : undefined);
                                                processed.add(current.id);
                                                continue;
                                            }
                                        }
                                        let inheritedBottom = false;
                                        if (blockParent) {
                                            let inherit = previous;
                                            while (validAboveChild(inherit)) {
                                                const bottomChild = inherit.lastStaticChild;
                                                if (isBlockElement(bottomChild, true) && bottomChild.getBox(8 /* MARGIN_BOTTOM */)[0] !== 1) {
                                                    const childBottom = bottomChild.marginBottom;
                                                    resetMargin(bottomChild, 8 /* MARGIN_BOTTOM */);
                                                    if (childBottom > marginBottom) {
                                                        marginBottom = childBottom;
                                                        previous.setCacheValue('marginBottom', marginBottom);
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
                                            while (validBelowChild(inherit)) {
                                                const topChild = inherit.firstStaticChild;
                                                if (isBlockElement(topChild, false) && topChild.getBox(2 /* MARGIN_TOP */)[0] !== 1) {
                                                    const childTop = topChild.marginTop;
                                                    resetMargin(topChild, 2 /* MARGIN_TOP */);
                                                    if (childTop > marginTop) {
                                                        marginTop = childTop;
                                                        current.setCacheValue('marginTop', marginTop);
                                                        inheritedTop = true;
                                                    }
                                                    else if (childTop === 0 && marginTop === 0) {
                                                        inherit = topChild;
                                                        continue;
                                                    }
                                                }
                                                break;
                                            }
                                        }
                                        if (marginBottom > 0) {
                                            if (marginTop > 0) {
                                                if (marginTop <= marginBottom) {
                                                    if (!inheritedTop || !hasBit$5(current.overflow, 64 /* BLOCK */)) {
                                                        if (inheritedTop) {
                                                            current.setCacheValue('marginTop', 0);
                                                            inheritedTop = false;
                                                        }
                                                        resetMargin(current, 2 /* MARGIN_TOP */);
                                                    }
                                                }
                                                else {
                                                    if (!inheritedBottom || !hasBit$5(previous.overflow, 64 /* BLOCK */)) {
                                                        if (inheritedBottom) {
                                                            previous.setCacheValue('marginBottom', 0);
                                                            inheritedBottom = false;
                                                        }
                                                        resetMargin(previous, 8 /* MARGIN_BOTTOM */);
                                                    }
                                                }
                                            }
                                            else if (previous.bounds.height === 0) {
                                                resetMargin(previous, 8 /* MARGIN_BOTTOM */);
                                            }
                                        }
                                        if (inheritedTop) {
                                            (_a = current.registerBox(2 /* MARGIN_TOP */)) === null || _a === void 0 ? void 0 : _a.setCacheValue('marginTop', marginTop);
                                        }
                                        if (inheritedBottom) {
                                            (_b = previous.registerBox(8 /* MARGIN_BOTTOM */)) === null || _b === void 0 ? void 0 : _b.setCacheValue('marginBottom', marginBottom);
                                        }
                                    }
                                    if (!inheritedTop && previousSiblings.length > 1) {
                                        if (previousSiblings[0].floating && (node.layoutVertical || ((_c = current.renderParent) === null || _c === void 0 ? void 0 : _c.layoutVertical))) {
                                            const offset = previousSiblings[0].linear.top - current.linear.top;
                                            if (current === firstChild) {
                                                if (offset > 0) {
                                                    const marginTop = current.marginTop;
                                                    if (marginTop > 0) {
                                                        if (offset < marginTop) {
                                                            current.modifyBox(2 /* MARGIN_TOP */, -offset, false);
                                                        }
                                                        else {
                                                            current.modifyBox(2 /* MARGIN_TOP */);
                                                        }
                                                    }
                                                }
                                            }
                                            else if (offset < 0) {
                                                current.modifyBox(2 /* MARGIN_TOP */, offset, false);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (pageFlow && !hasBit$5(node.overflow, 64 /* BLOCK */) && node.tagName !== 'FIELDSET') {
                        if (firstChild) {
                            applyMarginCollapse(node, firstChild, true);
                        }
                        if (lastChild) {
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
            }
            for (const node of this.application.processing.excluded) {
                if (node.lineBreak && !node.lineBreakTrailing && !processed.has(node.id)) {
                    let valid = false;
                    const previousSiblings = node.previousSiblings({ floating: false });
                    if (previousSiblings.length) {
                        const actualParent = node.actualParent;
                        const nextSiblings = node.nextSiblings({ floating: false });
                        if (nextSiblings.length) {
                            let above = previousSiblings.pop();
                            let below = nextSiblings.pop();
                            let lineHeight = 0;
                            let aboveLineBreak;
                            if (above.rendered && below.rendered) {
                                const inline = above.inlineStatic && below.inlineStatic;
                                if (inline && previousSiblings.length === 0) {
                                    processed.add(node.id);
                                    continue;
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
                                    (_d = aboveLineBreak) === null || _d === void 0 ? void 0 : _d.setBounds(false);
                                }
                                let aboveParent = above.renderParent;
                                let belowParent = below.renderParent;
                                while (aboveParent && aboveParent !== actualParent) {
                                    above = aboveParent;
                                    aboveParent = above.renderParent;
                                }
                                while (belowParent && belowParent !== actualParent) {
                                    below = belowParent;
                                    belowParent = below.renderParent;
                                }
                                const offset = getMarginOffset(below, above, lineHeight, aboveLineBreak);
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
                                const offset = getMarginOffset(below, above, lineHeight);
                                if (offset > 0) {
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
                            if (!actualParent.documentRoot && actualParent.ascend({ condition: item => item.documentRoot, attr: 'outerWrapper' }).length === 0) {
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
                            for (const item of previousSiblings) {
                                processed.add(item.id);
                            }
                            for (const item of nextSiblings) {
                                processed.add(item.id);
                            }
                        }
                    }
                }
            }
        }
        afterConstraints() {
            var _a, _b, _c, _d;
            for (const node of this.cacheProcessing) {
                if (node.naturalChild && node.pageFlow && node.styleElement && node.inlineVertical && !node.positioned && !node.actualParent.layoutElement) {
                    const renderParent = node.outerMostWrapper.renderParent;
                    if (((_a = renderParent) === null || _a === void 0 ? void 0 : _a.hasAlign(4 /* AUTO_LAYOUT */)) === false) {
                        if (node.blockDimension && !node.floating) {
                            if (renderParent.layoutVertical) {
                                const children = renderParent.renderChildren;
                                const index = children.findIndex(item => item === node);
                                if (index !== -1) {
                                    if (!node.lineBreakLeading) {
                                        const previous = children[index - 1];
                                        if ((_b = previous) === null || _b === void 0 ? void 0 : _b.pageFlow) {
                                            setSpacingOffset(node, 2 /* MARGIN_TOP */, previous.actualRect('bottom'), previous.getBox(8 /* MARGIN_BOTTOM */)[1]);
                                        }
                                    }
                                    if (!node.lineBreakTrailing) {
                                        const next = children[index + 1];
                                        if (((_c = next) === null || _c === void 0 ? void 0 : _c.pageFlow) && next.styleElement && !next.inlineVertical) {
                                            setSpacingOffset(node, 8 /* MARGIN_BOTTOM */, next.actualRect('top'), next.getBox(2 /* MARGIN_TOP */)[1]);
                                        }
                                    }
                                }
                            }
                            else {
                                const horizontalRows = renderParent.horizontalRows;
                                const validSibling = (item) => item.pageFlow && item.blockDimension && !item.floating;
                                let horizontal;
                                if (horizontalRows) {
                                    found: {
                                        let maxBottom = Number.NEGATIVE_INFINITY;
                                        const lengthA = horizontalRows.length;
                                        for (let i = 0; i < lengthA; i++) {
                                            const row = horizontalRows[i];
                                            const lengthB = row.length;
                                            for (let j = 0; j < lengthB; j++) {
                                                if (node === row[j]) {
                                                    if (i > 0) {
                                                        setSpacingOffset(node, 2 /* MARGIN_TOP */, maxBottom);
                                                    }
                                                    else {
                                                        horizontal = row;
                                                    }
                                                    break found;
                                                }
                                            }
                                            for (const item of row) {
                                                if (validSibling(item)) {
                                                    maxBottom = Math.max(item.actualRect('bottom'), maxBottom);
                                                }
                                            }
                                            if (maxBottom === Number.NEGATIVE_INFINITY) {
                                                break;
                                            }
                                        }
                                    }
                                }
                                else if (renderParent.layoutHorizontal) {
                                    horizontal = renderParent.renderChildren;
                                }
                                if (horizontal) {
                                    const parent = node.actualParent;
                                    if (parent) {
                                        const top = node.actualRect('top');
                                        let maxBottom = Number.NEGATIVE_INFINITY;
                                        for (const item of parent.naturalChildren) {
                                            if (horizontal.includes(item)) {
                                                break;
                                            }
                                            else if (item.lineBreak) {
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
                                            setSpacingOffset(node, 2 /* MARGIN_TOP */, maxBottom);
                                        }
                                    }
                                }
                            }
                        }
                        if (!renderParent.layoutVertical && !node.alignParent('left')) {
                            const documentId = node.alignSibling('leftRight');
                            if (documentId !== '') {
                                const previousSibling = renderParent.renderChildren.find(item => item.documentId === documentId);
                                if ((_d = previousSibling) === null || _d === void 0 ? void 0 : _d.inlineVertical) {
                                    setSpacingOffset(node, 16 /* MARGIN_LEFT */, previousSibling.actualRect('right'));
                                }
                            }
                            else {
                                let current = node;
                                while (true) {
                                    const siblingsLeading = current.siblingsLeading;
                                    if (siblingsLeading.length && !siblingsLeading.some(item => item.lineBreak || item.excluded && item.blockStatic)) {
                                        const previousSibling = siblingsLeading[0];
                                        if (previousSibling.inlineVertical) {
                                            setSpacingOffset(node, 16 /* MARGIN_LEFT */, previousSibling.actualRect('right'));
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
            }
        }
    }

    const extensions = {
        Accessibility,
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
