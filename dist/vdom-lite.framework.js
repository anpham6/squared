/* vdom-lite-framework 1.13.0
   https://github.com/anpham6/squared */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined'
        ? (module.exports = factory())
        : typeof define === 'function' && define.amd
        ? define(factory)
        : ((global = global || self), (global.vdom = factory()));
})(this, function () {
    'use strict';

    class NodeList extends squared.lib.base.Container {
        constructor(children) {
            super(children);
        }
        add(node, delegate = false, cascade = false) {
            var _a;
            super.add(node);
            if (delegate) {
                (_a = this.afterAdd) === null || _a === void 0 ? void 0 : _a.call(this, node, cascade);
            }
            return this;
        }
        reset() {
            this.clear();
            return this;
        }
    }

    const {
        CSS_PROPERTIES,
        checkMediaRule,
        getSpecificity,
        hasComputedStyle,
        insertStyleSheetRule,
        parseSelectorText,
    } = squared.lib.css;
    const { FILE, STRING } = squared.lib.regex;
    const { frameworkNotInstalled, getElementCache, setElementCache } = squared.lib.session;
    const {
        capitalize,
        convertCamelCase,
        parseMimeType,
        plainMap,
        promisify,
        resolvePath,
        trimBoth,
    } = squared.lib.util;
    const REGEXP_DATAURI = new RegExp(`url\\("?(${STRING.DATAURI})"?\\),?\\s*`, 'g');
    const CSS_IMAGEURI = ['backgroundImage', 'listStyleImage', 'content'];
    function addImageSrc(resourceHandler, uri, width = 0, height = 0) {
        if (uri !== '') {
            if ((width > 0 && height > 0) || !resourceHandler.getImage(uri)) {
                resourceHandler.addUnsafeData('image', uri, { width, height, uri });
            }
        }
    }
    function parseSrcSet(resourceHandler, value) {
        if (value !== '') {
            for (const uri of value.split(',')) {
                addImageSrc(resourceHandler, resolvePath(uri.trim().split(' ')[0]));
            }
        }
    }
    const isSvg = value => FILE.SVG.test(value);
    const parseConditionText = (rule, value) => {
        var _a;
        return (
            ((_a = new RegExp(`\\s*@${rule}([^{]+)`).exec(value)) === null || _a === void 0 ? void 0 : _a[1].trim()) ||
            value
        );
    };
    class Application {
        constructor(
            framework,
            nodeConstructor,
            ControllerConstructor,
            ResourceConstructor,
            ExtensionManagerConstructor
        ) {
            this.framework = framework;
            this.builtInExtensions = {};
            this.extensions = [];
            this.closed = false;
            this.elementMap = new Map();
            this.session = {
                active: new Map(),
                unusedStyles: new Set(),
            };
            this._nextId = 0;
            this._controllerHandler = new ControllerConstructor(this);
            if (ResourceConstructor) {
                this._resourceHandler = new ResourceConstructor(this);
            }
            if (ExtensionManagerConstructor) {
                this._extensionManager = new ExtensionManagerConstructor(this);
            }
            this._afterInsertNode = this._controllerHandler.afterInsertNode;
            this.Node = nodeConstructor;
        }
        afterCreateCache(node) {
            if (this.userSettings.createElementMap) {
                const elementMap = this.elementMap;
                this.getProcessingCache(node.sessionId).each(item => elementMap.set(item.element, item));
            }
        }
        createNode(sessionId, options) {
            const node = new this.Node(this.nextId, sessionId, options.element);
            this.controllerHandler.afterInsertNode(node);
            return node;
        }
        copyToDisk(directory, options) {
            var _a, _b;
            return (
                ((_b = (_a = this._resourceHandler) === null || _a === void 0 ? void 0 : _a.fileHandler) === null ||
                _b === void 0
                    ? void 0
                    : _b.copyToDisk(directory, options)) || frameworkNotInstalled()
            );
        }
        appendToArchive(pathname, options) {
            var _a, _b;
            return (
                ((_b = (_a = this._resourceHandler) === null || _a === void 0 ? void 0 : _a.fileHandler) === null ||
                _b === void 0
                    ? void 0
                    : _b.appendToArchive(pathname, options)) || frameworkNotInstalled()
            );
        }
        saveToArchive(filename, options) {
            var _a;
            const resourceHandler = this._resourceHandler;
            return (
                (resourceHandler &&
                    ((_a = resourceHandler.fileHandler) === null || _a === void 0
                        ? void 0
                        : _a.saveToArchive(filename || resourceHandler.userSettings.outputArchiveName, options))) ||
                frameworkNotInstalled()
            );
        }
        createFrom(format, options) {
            var _a, _b;
            return (
                ((_b = (_a = this._resourceHandler) === null || _a === void 0 ? void 0 : _a.fileHandler) === null ||
                _b === void 0
                    ? void 0
                    : _b.createFrom(format, options)) || frameworkNotInstalled()
            );
        }
        appendFromArchive(filename, options) {
            var _a, _b;
            return (
                ((_b = (_a = this._resourceHandler) === null || _a === void 0 ? void 0 : _a.fileHandler) === null ||
                _b === void 0
                    ? void 0
                    : _b.appendFromArchive(filename, options)) || frameworkNotInstalled()
            );
        }
        finalize() {
            return this.closed;
        }
        reset() {
            var _a;
            this._nextId = 0;
            this.elementMap.clear();
            this.session.active.clear();
            this.session.unusedStyles.clear();
            this.controllerHandler.reset();
            (_a = this.resourceHandler) === null || _a === void 0 ? void 0 : _a.reset();
            for (const ext of this.extensions) {
                ext.subscribers.clear();
            }
            this.closed = false;
        }
        parseDocument(...elements) {
            const resourceHandler = this._resourceHandler;
            const preloadImages =
                (resourceHandler === null || resourceHandler === void 0
                    ? void 0
                    : resourceHandler.userSettings.preloadImages) === true;
            const sessionId = this._controllerHandler.generateSessionId;
            const rootElements = new Set();
            const imageElements = [];
            const processing = {
                cache: new NodeList(),
                excluded: new NodeList(),
                rootElements,
                initializing: false,
            };
            let documentRoot, preloaded;
            this.session.active.set(sessionId, processing);
            this._controllerHandler.init();
            this.setStyleMap(sessionId);
            const styleElement = insertStyleSheetRule('html > body { overflow: hidden !important; }');
            if (elements.length === 0) {
                documentRoot = this.mainElement;
                rootElements.add(documentRoot);
            } else {
                let i = 0;
                while (i < elements.length) {
                    let element = elements[i++];
                    if (typeof element === 'string') {
                        element = document.getElementById(element);
                    }
                    if (!element || !hasComputedStyle(element)) {
                        continue;
                    }
                    if (!documentRoot) {
                        documentRoot = element;
                    }
                    rootElements.add(element);
                }
            }
            if (!documentRoot) {
                return Promise.reject(new Error('Document root not found.'));
            }
            if (resourceHandler) {
                for (const element of rootElements) {
                    element
                        .querySelectorAll('picture > source')
                        .forEach(source => parseSrcSet(resourceHandler, source.srcset));
                    element.querySelectorAll('video').forEach(source => addImageSrc(resourceHandler, source.poster));
                    element
                        .querySelectorAll('input[type=image]')
                        .forEach(image => addImageSrc(resourceHandler, image.src, image.width, image.height));
                    element.querySelectorAll('object, embed').forEach(source => {
                        const src = source.data || source.src;
                        if (src && (source.type.startsWith('image/') || parseMimeType(src).startsWith('image/'))) {
                            addImageSrc(resourceHandler, src.trim());
                        }
                    });
                    element.querySelectorAll('svg use').forEach(use => {
                        const href = use.href.baseVal || use.getAttributeNS('xlink', 'href');
                        if (href && href.indexOf('#') > 0) {
                            const src = resolvePath(href.split('#')[0]);
                            if (isSvg(src)) {
                                addImageSrc(resourceHandler, src);
                            }
                        }
                    });
                }
            }
            const resumeThread = () => {
                const extensions = this.extensions;
                processing.initializing = false;
                let i, length;
                if (preloaded) {
                    length = preloaded.length;
                    i = 0;
                    while (i < length) {
                        const image = preloaded[i++];
                        if (image.parentElement) {
                            documentRoot.removeChild(image);
                        }
                    }
                }
                length = extensions.length;
                i = 0;
                while (i < length) {
                    extensions[i++].beforeParseDocument(sessionId);
                }
                const success = [];
                for (const element of rootElements) {
                    const node = this.createCache(element, sessionId);
                    if (node) {
                        this.afterCreateCache(node);
                        success.push(node);
                    }
                }
                i = 0;
                while (i < length) {
                    extensions[i++].afterParseDocument(sessionId);
                }
                try {
                    document.head.removeChild(styleElement);
                } catch (_a) {}
                return elements.length > 1 ? success : success[0];
            };
            if (preloadImages) {
                const { image, rawData } = resourceHandler.mapOfAssets;
                preloaded = [];
                for (const item of image.values()) {
                    const uri = item.uri;
                    if (isSvg(uri)) {
                        imageElements.push(uri);
                    } else if (item.width === 0 || item.height === 0) {
                        const element = document.createElement('img');
                        element.src = uri;
                        if (element.naturalWidth > 0 && element.naturalHeight > 0) {
                            item.width = element.naturalWidth;
                            item.height = element.naturalHeight;
                        } else {
                            documentRoot.appendChild(element);
                            preloaded.push(element);
                        }
                    }
                }
                for (const [uri, data] of rawData.entries()) {
                    const mimeType = data.mimeType;
                    if (
                        (mimeType === null || mimeType === void 0 ? void 0 : mimeType.startsWith('image/')) &&
                        !mimeType.endsWith('svg+xml')
                    ) {
                        const element = document.createElement('img');
                        element.src = `data:${mimeType};${data.base64 ? `base64,${data.base64}` : data.content}`;
                        const { naturalWidth: width, naturalHeight: height } = element;
                        if (width > 0 && height > 0) {
                            data.width = width;
                            data.height = height;
                            image.set(uri, { width, height, uri: data.filename });
                        } else {
                            document.body.appendChild(element);
                            preloaded.push(element);
                        }
                    }
                }
            }
            if (resourceHandler) {
                for (const element of rootElements) {
                    element.querySelectorAll('img').forEach(image => {
                        parseSrcSet(resourceHandler, image.srcset);
                        if (!preloadImages) {
                            resourceHandler.addImage(image);
                        } else {
                            if (isSvg(image.src)) {
                                imageElements.push(image.src);
                            } else if (image.complete) {
                                resourceHandler.addImage(image);
                            } else {
                                imageElements.push(image);
                            }
                        }
                    });
                }
            }
            if (imageElements.length > 0) {
                processing.initializing = true;
                return Promise.all(
                    plainMap(imageElements, image => {
                        return new Promise((resolve, reject) => {
                            if (typeof image === 'string') {
                                fetch(image, {
                                    method: 'GET',
                                    headers: new Headers({
                                        'Accept': 'application/xhtml+xml, image/svg+xml',
                                        'Content-Type': 'image/svg+xml',
                                    }),
                                }).then(async result => resolve(await result.text()));
                            } else {
                                image.addEventListener('load', () => resolve(image));
                                image.addEventListener('error', () => reject(image));
                            }
                        });
                    })
                )
                    .then(result => {
                        const length = result.length;
                        for (let i = 0; i < length; ++i) {
                            const value = result[i];
                            if (typeof value === 'string') {
                                const uri = imageElements[i];
                                if (typeof uri === 'string') {
                                    resourceHandler.addRawData(uri, 'image/svg+xml', value, { encoding: 'utf8' });
                                }
                            } else {
                                resourceHandler.addImage(value);
                            }
                        }
                        return resumeThread();
                    })
                    .catch(error => {
                        if (error instanceof Event) {
                            error = error.target;
                        }
                        const message = error instanceof HTMLImageElement ? error.src : '';
                        return message === '' || !this.userSettings.showErrorMessages || confirm(`FAIL: ${message}`)
                            ? resumeThread()
                            : Promise.reject(message);
                    });
            }
            return promisify(resumeThread)();
        }
        createCache(documentRoot, sessionId) {
            const node = this.createRootNode(documentRoot, sessionId);
            if (node) {
                this.controllerHandler.sortInitialCache(this.getProcessingCache(sessionId));
            }
            return node;
        }
        setStyleMap(sessionId) {
            const styleSheets = document.styleSheets;
            const length = styleSheets.length;
            let i = 0;
            while (i < length) {
                const styleSheet = styleSheets[i++];
                let mediaText;
                try {
                    mediaText = styleSheet.media.mediaText;
                } catch (_a) {}
                if (!mediaText || checkMediaRule(mediaText)) {
                    this.applyStyleSheet(styleSheet, sessionId);
                }
            }
        }
        getProcessing(sessionId) {
            return this.session.active.get(sessionId);
        }
        getProcessingCache(sessionId) {
            var _a;
            return (
                ((_a = this.session.active.get(sessionId)) === null || _a === void 0 ? void 0 : _a.cache) ||
                new NodeList()
            );
        }
        getDatasetName(attr, element) {
            return element.dataset[attr + capitalize(this.systemName)] || element.dataset[attr];
        }
        setDatasetName(attr, element, value) {
            element.dataset[attr + capitalize(this.systemName)] = value;
        }
        toString() {
            return this.systemName;
        }
        createRootNode(element, sessionId) {
            const processing = this.getProcessing(sessionId);
            const extensions = this.extensionsCascade;
            const node = this.cascadeParentNode(
                processing.cache,
                processing.excluded,
                processing.rootElements,
                element,
                sessionId,
                0,
                extensions.length > 0 ? extensions : undefined
            );
            if (node) {
                const parent = new this.Node(0, sessionId, element.parentElement);
                this._afterInsertNode(parent);
                node.parent = parent;
                node.actualParent = parent;
                if (node.tagName === 'HTML') {
                    processing.documentElement = node;
                } else if (parent.tagName === 'HTML') {
                    processing.documentElement = parent;
                }
                node.depth = 0;
                node.childIndex = 0;
                node.documentRoot = true;
                processing.node = node;
            }
            return node;
        }
        cascadeParentNode(cache, excluded, rootElements, parentElement, sessionId, depth, extensions) {
            const node = this.insertNode(parentElement, sessionId);
            if (node) {
                const controllerHandler = this.controllerHandler;
                if (depth === 0) {
                    cache.add(node);
                }
                if (controllerHandler.preventNodeCascade(node)) {
                    return node;
                }
                const childDepth = depth + 1;
                const childNodes = parentElement.childNodes;
                const length = childNodes.length;
                const children = new Array(length);
                const elements = new Array(parentElement.childElementCount);
                let inlineText = true;
                let i = 0,
                    j = 0,
                    k = 0;
                while (i < length) {
                    const element = childNodes[i++];
                    let child;
                    if (element.nodeName.charAt(0) === '#') {
                        if (element.nodeName === '#text') {
                            child = this.insertNode(element, sessionId);
                            child === null || child === void 0 ? void 0 : child.cssApply(node.textStyle);
                        }
                    } else if (controllerHandler.includeElement(element)) {
                        child = this.cascadeParentNode(
                            cache,
                            excluded,
                            rootElements,
                            element,
                            sessionId,
                            childDepth,
                            extensions
                        );
                        if (child) {
                            elements[k++] = child;
                            inlineText = false;
                        }
                    } else {
                        child = this.insertNode(element, sessionId);
                        if (child) {
                            excluded.add(child);
                            inlineText = false;
                        }
                    }
                    if (child) {
                        child.init(node, childDepth, j);
                        child.actualParent = node;
                        children[j++] = child;
                        cache.add(child);
                    }
                }
                children.length = j;
                elements.length = k;
                node.naturalChildren = children;
                node.naturalElements = elements;
                node.inlineText = inlineText;
                node.retainAs(children);
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
                        result[k] =
                            ((_a = result[k]) === null || _a === void 0 ? void 0 : _a.concat(childMap[j])) ||
                            childMap[j];
                    }
                }
            }
            return result;
        }
        applyStyleRule(item, sessionId) {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const resourceHandler = this._resourceHandler;
            const styleSheetHref =
                ((_a = item.parentStyleSheet) === null || _a === void 0 ? void 0 : _a.href) || location.href;
            const cssText = item.cssText;
            switch (item.type) {
                case CSSRule.SUPPORTS_RULE:
                    this.applyCSSRuleList(item.cssRules, sessionId);
                    break;
                case CSSRule.STYLE_RULE: {
                    const unusedStyles = this.session.unusedStyles;
                    const baseMap = {};
                    const important = {};
                    const cssStyle = item.style;
                    const items = Array.from(cssStyle);
                    const length = items.length;
                    let i = 0;
                    while (i < length) {
                        const attr = items[i++];
                        baseMap[convertCamelCase(attr)] = cssStyle[attr];
                    }
                    const pattern = /\s*([a-z-]+):[^!;]+!important;/g;
                    let match;
                    while ((match = pattern.exec(cssText))) {
                        const attr = convertCamelCase(match[1]);
                        const value = (_b = CSS_PROPERTIES[attr]) === null || _b === void 0 ? void 0 : _b.value;
                        if (Array.isArray(value)) {
                            i = 0;
                            while (i < value.length) {
                                important[value[i++]] = true;
                            }
                        } else {
                            important[attr] = true;
                        }
                    }
                    i = 0;
                    while (i < 3) {
                        const attr = CSS_IMAGEURI[i++];
                        const value = baseMap[attr];
                        if (value && value !== 'initial') {
                            let result;
                            while ((match = REGEXP_DATAURI.exec(value))) {
                                if (match[2]) {
                                    if (resourceHandler) {
                                        const [mimeType, encoding] = match[2].trim().split(/\s*;\s*/);
                                        resourceHandler.addRawData(match[1], mimeType, match[3], { encoding });
                                    }
                                } else {
                                    const uri = resolvePath(match[3], styleSheetHref);
                                    if (uri !== '') {
                                        if (resourceHandler) {
                                            addImageSrc(resourceHandler, uri);
                                        }
                                        result = (result || value).replace(match[0], `url("${uri}")`);
                                    }
                                }
                            }
                            if (result) {
                                baseMap[attr] = result;
                            }
                            REGEXP_DATAURI.lastIndex = 0;
                        }
                    }
                    for (const selectorText of parseSelectorText(item.selectorText, true)) {
                        const specificity = getSpecificity(selectorText);
                        const [selector, target] = selectorText.split('::');
                        const targetElt = target ? '::' + target : '';
                        const elements = document.querySelectorAll(selector || '*');
                        const q = elements.length;
                        if (q === 0) {
                            unusedStyles.add(selectorText);
                            continue;
                        }
                        i = 0;
                        while (i < q) {
                            const element = elements[i++];
                            const attrStyle = `styleMap${targetElt}`;
                            const attrSpecificity = `styleSpecificity${targetElt}`;
                            const styleData = getElementCache(element, attrStyle, sessionId);
                            if (styleData) {
                                const specificityData = getElementCache(element, attrSpecificity, sessionId) || {};
                                for (const attr in baseMap) {
                                    const previous = specificityData[attr];
                                    const revised = specificity + (important[attr] ? 1000 : 0);
                                    if (!previous || revised >= previous) {
                                        styleData[attr] = baseMap[attr];
                                        specificityData[attr] = revised;
                                    }
                                }
                            } else {
                                const styleMap = Object.assign({}, baseMap);
                                const specificityData = {};
                                for (const attr in styleMap) {
                                    specificityData[attr] = specificity + (important[attr] ? 1000 : 0);
                                }
                                setElementCache(element, 'sessionId', '0', sessionId);
                                setElementCache(element, attrStyle, sessionId, styleMap);
                                setElementCache(element, attrSpecificity, sessionId, specificityData);
                            }
                        }
                    }
                    break;
                }
                case CSSRule.FONT_FACE_RULE: {
                    if (resourceHandler) {
                        const attr =
                            (_c = /\s*@font-face\s*{([^}]+)}\s*/.exec(cssText)) === null || _c === void 0
                                ? void 0
                                : _c[1];
                        if (attr) {
                            const src =
                                (_d = /\s*src:\s*([^;]+);/.exec(attr)) === null || _d === void 0 ? void 0 : _d[1];
                            let fontFamily =
                                (_e = /\s*font-family:([^;]+);/.exec(attr)) === null || _e === void 0
                                    ? void 0
                                    : _e[1].trim();
                            if (src && fontFamily) {
                                fontFamily = trimBoth(fontFamily, '"');
                                const fontStyle =
                                    ((_f = /\s*font-style:\s*(\w+)\s*;/.exec(attr)) === null || _f === void 0
                                        ? void 0
                                        : _f[1].toLowerCase()) || 'normal';
                                const fontWeight = parseInt(
                                    ((_g = /\s*font-weight:\s*(\d+)\s*;/.exec(attr)) === null || _g === void 0
                                        ? void 0
                                        : _g[1]) || '400'
                                );
                                for (const value of src.split(',')) {
                                    const urlMatch = /\s*(url|local)\((?:"((?:[^"]|\\")+)"|([^)]+))\)(?:\s*format\("?([\w-]+)"?\))?\s*/.exec(
                                        value
                                    );
                                    if (urlMatch) {
                                        const data = {
                                            fontFamily,
                                            fontWeight,
                                            fontStyle,
                                            srcFormat:
                                                ((_h = urlMatch[4]) === null || _h === void 0
                                                    ? void 0
                                                    : _h.toLowerCase().trim()) || 'truetype',
                                        };
                                        const url = (urlMatch[2] || urlMatch[3]).trim();
                                        if (urlMatch[1] === 'url') {
                                            data.srcUrl = resolvePath(url, styleSheetHref);
                                        } else {
                                            data.srcLocal = url;
                                        }
                                        resourceHandler.addFont(data);
                                    }
                                }
                            }
                        }
                    }
                    break;
                }
            }
        }
        applyStyleSheet(item, sessionId) {
            var _a;
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
                                this.applyStyleRule(rule, sessionId);
                                break;
                            case CSSRule.IMPORT_RULE:
                                if (this._resourceHandler) {
                                    const uri = resolvePath(
                                        rule.href,
                                        ((_a = rule.parentStyleSheet) === null || _a === void 0 ? void 0 : _a.href) ||
                                            location.href
                                    );
                                    if (uri !== '') {
                                        this._resourceHandler.addRawData(uri, 'text/css', undefined, {
                                            encoding: 'utf8',
                                        });
                                    }
                                }
                                this.applyStyleSheet(rule.styleSheet, sessionId);
                                break;
                            case CSSRule.MEDIA_RULE:
                                if (checkMediaRule(rule.conditionText || parseConditionText('media', rule.cssText))) {
                                    this.applyCSSRuleList(rule.cssRules, sessionId);
                                }
                                break;
                            case CSSRule.SUPPORTS_RULE:
                                if (CSS.supports(rule.conditionText || parseConditionText('supports', rule.cssText))) {
                                    this.applyCSSRuleList(rule.cssRules, sessionId);
                                }
                                break;
                        }
                    }
                }
            } catch (error) {
                (this.userSettings.showErrorMessages
                    ? alert
                    : console.log)('CSS cannot be parsed inside <link> tags when loading files directly from your hard drive or from external websites. ' + 'Either use a local web server, embed your CSS into a <style> tag, or you can also try using a different browser. ' + 'See the README for more detailed instructions.\n\n' + item.href + '\n\n' + error);
            }
        }
        applyCSSRuleList(rules, sessionId) {
            const length = rules.length;
            let i = 0;
            while (i < length) {
                this.applyStyleRule(rules[i++], sessionId);
            }
        }
        get mainElement() {
            return document.documentElement;
        }
        get initializing() {
            for (const processing of this.session.active.values()) {
                if (processing.initializing) {
                    return true;
                }
            }
            return false;
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
        get extensionsCascade() {
            return [];
        }
        get childrenAll() {
            const active = this.session.active;
            if (active.size === 1) {
                return active.values().next().value.cache.children;
            }
            let result = [];
            for (const item of active.values()) {
                result = result.concat(item.cache.children);
            }
            return result;
        }
        get nextId() {
            return ++this._nextId;
        }
        get length() {
            return this.session.active.size;
        }
    }
    Application.KEY_NAME = 'squared.application';

    class Application$1 extends Application {
        constructor(framework, nodeConstructor, ControllerConstructor) {
            super(framework, nodeConstructor, ControllerConstructor);
            this.systemName = 'vdom';
        }
        insertNode(element, sessionId) {
            return element.nodeName !== '#text' ? new this.Node(this.nextId, sessionId, element) : undefined;
        }
    }

    class Controller {
        constructor(application) {
            this.application = application;
            this.localSettings = {
                mimeType: {
                    font: '*',
                    image: '*',
                    audio: '*',
                    video: '*',
                },
            };
        }
        init() {}
        sortInitialCache(cache) {}
        applyDefaultStyles(element, sessionId) {}
        reset() {}
        includeElement(element) {
            return true;
        }
        preventNodeCascade(node) {
            return false;
        }
        get generateSessionId() {
            return Date.now().toString() + '-' + this.application.session.active.size;
        }
        get afterInsertNode() {
            return node => {};
        }
        get userSettings() {
            return this.application.userSettings;
        }
    }

    const { USER_AGENT, isUserAgent } = squared.lib.client;
    const {
        CSS_PROPERTIES: CSS_PROPERTIES$1,
        CSS_TRAITS,
        CSS_UNIT,
        checkStyleValue,
        checkWritingMode,
        formatPX,
        getInheritedStyle,
        getStyle,
        hasComputedStyle: hasComputedStyle$1,
        isAngle,
        isLength,
        isPercent,
        isTime,
        isPx,
        parseSelectorText: parseSelectorText$1,
        parseUnit,
    } = squared.lib.css;
    const { ELEMENT_BLOCK, assignRect, getNamedItem, getRangeClientRect, newBoxRectDimension } = squared.lib.dom;
    const { CSS: CSS$1, FILE: FILE$1 } = squared.lib.regex;
    const {
        actualClientRect,
        actualTextRangeRect,
        deleteElementCache,
        getElementAsNode,
        getElementCache: getElementCache$1,
        getPseudoElt,
        setElementCache: setElementCache$1,
    } = squared.lib.session;
    const {
        aboveRange,
        belowRange,
        convertCamelCase: convertCamelCase$1,
        convertFloat,
        convertInt,
        hasBit,
        hasValue,
        isNumber,
        isObject,
        iterateArray,
        spliceString,
        splitEnclosing,
    } = squared.lib.util;
    const { SELECTOR_ATTR, SELECTOR_G, SELECTOR_LABEL, SELECTOR_PSEUDO_CLASS } = CSS$1;
    const BORDER_TOP = CSS_PROPERTIES$1.borderTop.value;
    const BORDER_RIGHT = CSS_PROPERTIES$1.borderRight.value;
    const BORDER_BOTTOM = CSS_PROPERTIES$1.borderBottom.value;
    const BORDER_LEFT = CSS_PROPERTIES$1.borderLeft.value;
    function setStyleCache(element, attr, sessionId, value, current) {
        if (current !== value) {
            element.style.setProperty(attr, value);
            if (validateCssSet(value, element.style.getPropertyValue(attr))) {
                setElementCache$1(element, attr, sessionId, value !== 'auto' ? current : '');
            } else {
                return false;
            }
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
    const validateCssSet = (value, actualValue) =>
        value === actualValue || (isLength(value, true) && isPx(actualValue));
    const sortById = (a, b) => (a.id < b.id ? -1 : 1);
    const getFontSize = style => parseFloat(style.getPropertyValue('font-size'));
    const isEm = value => /\dem$/.test(value);
    const isInlineVertical = value => /^(inline|table-cell)/.test(value);
    function setNaturalChildren(node) {
        var _a;
        let children;
        if (node.naturalElement) {
            children = [];
            const sessionId = node.sessionId;
            let i = 0;
            node.element.childNodes.forEach(element => {
                const item = getElementAsNode(element, sessionId);
                if (item) {
                    item.childIndex = i++;
                    children.push(item);
                }
            });
        } else {
            children = (((_a = node.initial) === null || _a === void 0 ? void 0 : _a.children) || node.children).slice(
                0
            );
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
        } else if (value === 'inherit' && !parent) {
            return getFlexValue(node, attr, fallback, node.actualParent);
        }
        return fallback;
    }
    function hasTextAlign(node, ...values) {
        const value = node.cssAscend('textAlign', {
            startSelf: node.textElement && node.blockStatic && !node.hasPX('width', { initial: true }),
        });
        return (
            value !== '' &&
            values.includes(value) &&
            (node.blockStatic
                ? node.textElement &&
                  !node.hasPX('width', { initial: true }) &&
                  !node.hasPX('maxWidth', { initial: true })
                : node.display.startsWith('inline'))
        );
    }
    function setDimension(node, styleMap, attr, attrMin, attrMax) {
        const options = { dimension: attr };
        const value = styleMap[attr];
        const min = styleMap[attrMin];
        const baseValue = value ? node.parseUnit(value, options) : 0;
        let result = Math.max(baseValue, min ? node.parseUnit(min, options) : 0);
        if (result === 0 && node.styleElement) {
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
                        result = isNumber(size) ? parseFloat(size) : node.parseUnit(size, options);
                        if (result > 0) {
                            node.css(attr, isPercent(size) ? size : size + 'px');
                        }
                    }
                    break;
                }
            }
        }
        if (baseValue > 0 && !node.imageElement) {
            const max = styleMap[attrMax];
            if (max) {
                if (value === max) {
                    delete styleMap[attrMax];
                } else {
                    const maxValue = node.parseUnit(max, { dimension: attr });
                    if (maxValue > 0) {
                        if (maxValue <= baseValue && value && isLength(value)) {
                            styleMap[attr] = max;
                            delete styleMap[attrMax];
                        } else {
                            return Math.min(result, maxValue);
                        }
                    }
                }
            }
        }
        return result;
    }
    function convertBorderWidth(node, dimension, border) {
        if (!node.plainText) {
            switch (node.css(border[1])) {
                case 'none':
                case 'initial':
                case 'hidden':
                    return 0;
            }
            const width = node.css(border[0]);
            const result = isLength(width, true)
                ? node.parseUnit(width, { dimension })
                : convertFloat(node.style[border[0]]);
            if (result > 0) {
                return Math.max(Math.round(result), 1);
            }
        }
        return 0;
    }
    function convertBox(node, attr, margin) {
        var _a;
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
                                        return vertical
                                            ? node.parseUnit(vertical, { dimension: 'height', parent: false })
                                            : node.parseUnit(horizontal, { parent: false });
                                    case 'marginRight':
                                        if (node.actualParent.lastChild !== node) {
                                            return node.parseUnit(horizontal, { parent: false });
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
        return node.parseUnit(node.css(attr), {
            parent: !(((_a = node.actualParent) === null || _a === void 0 ? void 0 : _a.gridElement) === true),
        });
    }
    function convertPosition(node, attr) {
        if (!node.positionStatic) {
            const unit = getInitialValue.call(node, attr, { modified: true });
            if (isLength(unit)) {
                return node.parseUnit(unit, { dimension: attr === 'left' || attr === 'right' ? 'width' : 'height' });
            } else if (isPercent(unit) && node.styleElement) {
                return convertFloat(node.style[attr]);
            }
        }
        return 0;
    }
    function validateQuerySelector(node, child, selector, index, last, adjacent) {
        var _a;
        if (selector.all) {
            return true;
        }
        let tagName = selector.tagName;
        if (tagName && tagName !== child.tagName.toUpperCase()) {
            return false;
        }
        if (selector.id && selector.id !== child.elementId) {
            return false;
        }
        const { attrList, classList, notList, pseudoList } = selector;
        if (pseudoList) {
            const parent = child.actualParent;
            tagName = child.tagName;
            let i = 0;
            while (i < pseudoList.length) {
                const pseudo = pseudoList[i++];
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
                        const children = parent.naturalElements;
                        const length = children.length;
                        let j = 0,
                            k = 0;
                        while (j < length) {
                            if (children[j++].tagName === tagName && ++k > 1) {
                                return false;
                            }
                        }
                        break;
                    }
                    case ':first-of-type': {
                        const children = parent.naturalElements;
                        const length = children.length;
                        let j = 0;
                        while (j < length) {
                            const item = children[j++];
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
                        if (child.element.childNodes.length > 0) {
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
                        if (!child.inputElement || child.toElementBoolean('disabled', true)) {
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
                        if (
                            element.isContentEditable ||
                            ((tagName === 'INPUT' || tagName === 'TEXTAREA') && !element.readOnly)
                        ) {
                            return false;
                        }
                        break;
                    }
                    case ':read-write': {
                        const element = child.element;
                        if (
                            !element.isContentEditable ||
                            ((tagName === 'INPUT' || tagName === 'TEXTAREA') && element.readOnly)
                        ) {
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
                        if (!child.inputElement || tagName === 'BUTTON' || child.toElementBoolean('required', true)) {
                            return false;
                        }
                        break;
                    case ':placeholder-shown':
                        if (
                            !(
                                (tagName === 'INPUT' || tagName === 'TEXTAREA') &&
                                child.toElementString('placeholder') !== ''
                            )
                        ) {
                            return false;
                        }
                        break;
                    case ':default':
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
                                    iterateArray(form.element.querySelectorAll('*'), item => {
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
                    case ':in-range':
                    case ':out-of-range':
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
                                } else if (pseudo === ':in-range') {
                                    return false;
                                }
                            } else if (pseudo === ':in-range') {
                                return false;
                            }
                        } else {
                            return false;
                        }
                        break;
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
                                    } else if (element.name) {
                                        if (
                                            iterateArray(
                                                (
                                                    ((_a = child.ascend({
                                                        condition: item => item.tagName === 'FORM',
                                                    })[0]) === null || _a === void 0
                                                        ? void 0
                                                        : _a.element) || document
                                                ).querySelectorAll(`input[type=radio][name="${element.name}"`),
                                                item => item.checked
                                            ) === Infinity
                                        ) {
                                            return false;
                                        }
                                    }
                                    break;
                                default:
                                    return false;
                            }
                        } else if (tagName === 'PROGRESS') {
                            if (child.toElementInt('value', -1) !== -1) {
                                return false;
                            }
                        } else {
                            return false;
                        }
                        break;
                    case ':target':
                        if (location.hash === '') {
                            return false;
                        } else if (
                            !(
                                location.hash === `#${child.elementId}` ||
                                (tagName === 'A' && location.hash === `#${child.toElementString('name')}`)
                            )
                        ) {
                            return false;
                        }
                        break;
                    case ':scope':
                        if (!last || (adjacent === '>' && child !== node)) {
                            return false;
                        }
                        break;
                    case ':root':
                        if (!last && node.tagName !== 'HTML') {
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
                        if (
                            iterateArray(
                                parent.element.querySelectorAll(':scope > ' + pseudo),
                                item => item === element
                            ) !== Infinity
                        ) {
                            return false;
                        }
                        break;
                    }
                    default: {
                        let match = /^:nth(-last)?-(child|of-type)\((.+)\)$/.exec(pseudo);
                        if (match) {
                            const placement = match[3].trim();
                            let children = parent.naturalElements;
                            if (match[1]) {
                                children = children.slice(0).reverse();
                            }
                            const j =
                                match[2] === 'child'
                                    ? children.indexOf(child) + 1
                                    : children.filter(item => item.tagName === tagName).indexOf(child) + 1;
                            if (j > 0) {
                                if (isNumber(placement)) {
                                    if (parseInt(placement) !== j) {
                                        return false;
                                    }
                                } else {
                                    switch (placement) {
                                        case 'even':
                                            if (j % 2 !== 0) {
                                                return false;
                                            }
                                            break;
                                        case 'odd':
                                            if (j % 2 === 0) {
                                                return false;
                                            }
                                            break;
                                        default: {
                                            const subMatch = /^(-)?(\d+)?n\s*([+-]\d+)?$/.exec(placement);
                                            if (subMatch) {
                                                const modifier = convertInt(subMatch[3]);
                                                if (subMatch[2]) {
                                                    if (subMatch[1]) {
                                                        return false;
                                                    }
                                                    const increment = parseInt(subMatch[2]);
                                                    if (increment !== 0) {
                                                        if (j !== modifier) {
                                                            for (let k = increment; ; k += increment) {
                                                                const total = increment + modifier;
                                                                if (total === j) {
                                                                    break;
                                                                } else if (total > j) {
                                                                    return false;
                                                                }
                                                            }
                                                        }
                                                    } else if (j !== modifier) {
                                                        return false;
                                                    }
                                                } else if (subMatch[3]) {
                                                    if (modifier > 0) {
                                                        if (subMatch[1]) {
                                                            if (j > modifier) {
                                                                return false;
                                                            }
                                                        } else if (j < modifier) {
                                                            return false;
                                                        }
                                                    } else {
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
                        } else if (child.attributes['lang']) {
                            match = /^:lang\((.+)\)$/.exec(pseudo);
                            if (match) {
                                if (child.attributes['lang'].trim().toLowerCase() === match[1].trim().toLowerCase()) {
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
            let i = 0;
            while (i < notList.length) {
                const not = notList[i++];
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
                        const match = SELECTOR_ATTR.exec(not);
                        if (match) {
                            const caseInsensitive = match[6] === 'i';
                            let value = match[3] || match[4] || match[5] || '';
                            if (caseInsensitive) {
                                value = value.toLowerCase();
                            }
                            notData.attrList = [
                                {
                                    key: match[1],
                                    symbol: match[2],
                                    value,
                                    caseInsensitive,
                                },
                            ];
                            SELECTOR_ATTR.lastIndex = 0;
                        } else {
                            continue;
                        }
                        break;
                    }
                    default:
                        if (/^[a-z\d+#.-]+$/i.test(not)) {
                            notData.tagName = not;
                        } else {
                            return false;
                        }
                        break;
                }
                if (validateQuerySelector(node, child, notData, index, last)) {
                    return false;
                }
            }
        }
        if (classList) {
            const elementList = child.element.classList;
            let i = 0;
            while (i < classList.length) {
                if (!elementList.contains(classList[i++])) {
                    return false;
                }
            }
        }
        if (attrList) {
            const attributes = child.attributes;
            let i = 0;
            while (i < attrList.length) {
                const attr = attrList[i++];
                let value;
                if (attr.endsWith) {
                    const pattern = new RegExp(`^(.+:)?${attr.key}$`);
                    for (const name in attributes) {
                        if (pattern.test(name)) {
                            value = attributes[name];
                            break;
                        }
                    }
                } else {
                    value = attributes[attr.key];
                }
                if (value === undefined) {
                    return false;
                } else {
                    const valueA = attr.value;
                    if (valueA) {
                        if (attr.caseInsensitive) {
                            value = value.toLowerCase();
                        }
                        if (attr.symbol) {
                            switch (attr.symbol) {
                                case '~':
                                    if (!value.split(/\s+/).includes(valueA)) {
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
                        } else if (value !== valueA) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }
    function ascendQuerySelector(node, selectors, i, index, adjacent, nodes) {
        const depth = node.depth;
        const selector = selectors[index];
        const length = selectors.length;
        const last = index === length - 1;
        const next = [];
        const q = nodes.length;
        let j = 0;
        while (j < q) {
            const child = nodes[j++];
            if (adjacent) {
                const parent = child.actualParent;
                if (adjacent === '>') {
                    if (validateQuerySelector(node, parent, selector, i, last, adjacent)) {
                        next.push(parent);
                    }
                } else {
                    const children = parent.naturalElements;
                    switch (adjacent) {
                        case '+': {
                            const k = children.indexOf(child) - 1;
                            if (k >= 0) {
                                const sibling = children[k];
                                if (validateQuerySelector(node, sibling, selector, i, last, adjacent)) {
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
                                if (sibling === child) {
                                    break;
                                } else if (validateQuerySelector(node, sibling, selector, i, last, adjacent)) {
                                    next.push(sibling);
                                }
                            }
                            break;
                        }
                    }
                }
            } else if (child.depth - depth >= length - index) {
                let parent = child.actualParent;
                do {
                    if (validateQuerySelector(node, parent, selector, i, last)) {
                        next.push(parent);
                    }
                    parent = parent.actualParent;
                } while (parent !== null);
            }
        }
        return next.length
            ? ++index === length
                ? true
                : ascendQuerySelector(node, selectors, i, index, selector.adjacent, next)
            : false;
    }
    const canTextAlign = node =>
        node.naturalChild &&
        (node.length === 0 || isInlineVertical(node.display)) &&
        !node.floating &&
        node.autoMargin.horizontal !== true;
    function getInitialValue(attr, options) {
        return (!this._preferInitial && this._styleMap[attr]) || this.cssInitial(attr, options);
    }
    class Node extends squared.lib.base.Container {
        constructor(id, sessionId = '0', element) {
            super();
            this.id = id;
            this.sessionId = sessionId;
            this.documentRoot = false;
            this.depth = -1;
            this.childIndex = Infinity;
            this._parent = null;
            this._cached = {};
            this._preferInitial = false;
            this._element = null;
            this._data = {};
            this._inlineText = false;
            if (element) {
                this._element = element;
                this.style = !this.pseudoElement
                    ? getStyle(element)
                    : getStyle(element.parentElement, getPseudoElt(element, sessionId));
                if (!this.syncWith(sessionId)) {
                    this._styleMap = {};
                }
                if (sessionId !== '0') {
                    setElementCache$1(element, 'node', sessionId, this);
                }
            } else {
                this.style = {};
                this._styleMap = {};
            }
        }
        init(parent, depth, index) {
            this._parent = parent;
            this.depth = depth;
            this.childIndex = index;
        }
        syncWith(sessionId, cache) {
            const element = this._element;
            if (element) {
                if (!sessionId) {
                    sessionId = getElementCache$1(element, 'sessionId', '0');
                    if (sessionId === this.sessionId) {
                        return true;
                    }
                }
                const styleMap = getElementCache$1(element, 'styleMap', sessionId);
                if (styleMap) {
                    if (this.styleElement) {
                        const style = this.style;
                        const revisedMap = {};
                        const writingMode = style.writingMode;
                        if (!this.pseudoElement) {
                            const items = Array.from(element.style);
                            const length = items.length;
                            if (length > 0) {
                                let i = 0;
                                while (i < length) {
                                    const attr = items[i++];
                                    styleMap[convertCamelCase$1(attr)] = element.style.getPropertyValue(attr);
                                }
                            }
                        }
                        for (let attr in styleMap) {
                            const value = styleMap[attr];
                            const alias = checkWritingMode(attr, writingMode);
                            if (alias !== '') {
                                if (!styleMap[alias]) {
                                    attr = alias;
                                } else {
                                    continue;
                                }
                            }
                            const result = checkStyleValue(element, attr, value, style);
                            if (result !== '') {
                                revisedMap[attr] = result;
                            }
                        }
                        this._styleMap = revisedMap;
                    } else {
                        this._styleMap = styleMap;
                    }
                    this._cssStyle = styleMap;
                    if (cache) {
                        this._cached = {};
                    }
                    return true;
                }
            }
            return false;
        }
        saveAsInitial() {
            this._initial = {
                styleMap: Object.assign({}, this._styleMap),
                children: this.length > 0 ? this.duplicate() : undefined,
                bounds: this._bounds,
            };
        }
        data(name, attr, value, overwrite = true) {
            const data = this._data;
            if (value === null) {
                if (data[name]) {
                    delete data[name][attr];
                }
                return undefined;
            } else if (value !== undefined) {
                let obj = data[name];
                if (!isObject(obj)) {
                    obj = {};
                    data[name] = obj;
                }
                if (overwrite || obj[attr] === undefined) {
                    obj[attr] = value;
                }
            }
            const stored = data[name];
            return isObject(stored) ? stored[attr] : undefined;
        }
        unsetCache(...attrs) {
            const length = attrs.length;
            if (length > 0) {
                const cached = this._cached;
                let i = 0;
                while (i < length) {
                    const attr = attrs[i++];
                    switch (attr) {
                        case 'position':
                            if (!this._preferInitial) {
                                this.cascade(item => !item.pageFlow && item.unsetCache('absoluteParent'));
                            }
                        case 'display':
                        case 'float':
                        case 'tagName':
                            this._cached = {};
                            return;
                        case 'width':
                            cached.actualWidth = undefined;
                            cached.percentWidth = undefined;
                        case 'minWidth':
                            cached.width = undefined;
                            break;
                        case 'height':
                            cached.actualHeight = undefined;
                            cached.percentHeight = undefined;
                        case 'minHeight':
                            cached.height = undefined;
                            if (!this._preferInitial) {
                                this.unsetCache('blockVertical');
                                this.each(item =>
                                    item.unsetCache(
                                        'height',
                                        'actualHeight',
                                        'blockVertical',
                                        'overflow',
                                        'bottomAligned'
                                    )
                                );
                            }
                            break;
                        case 'verticalAlign':
                            cached.baseline = undefined;
                            break;
                        case 'left':
                        case 'right':
                        case 'textAlign':
                            cached.rightAligned = undefined;
                            cached.centerAligned = undefined;
                            break;
                        case 'top':
                        case 'bottom':
                            cached.bottomAligned = undefined;
                            break;
                        default:
                            if (attr.startsWith('margin')) {
                                cached.autoMargin = undefined;
                                cached.rightAligned = undefined;
                                cached.centerAligned = undefined;
                            } else if (attr.startsWith('padding')) {
                                cached.contentBoxWidth = undefined;
                                cached.contentBoxHeight = undefined;
                            } else if (attr.startsWith('border')) {
                                cached.visibleStyle = undefined;
                                cached.contentBoxWidth = undefined;
                                cached.contentBoxHeight = undefined;
                            } else if (attr.startsWith('background')) {
                                cached.visibleStyle = undefined;
                            } else if (Node.TEXT_STYLE.includes(attr)) {
                                cached.lineHeight = undefined;
                                this._textStyle = undefined;
                            }
                            break;
                    }
                    if (attr in cached) {
                        cached[attr] = undefined;
                    }
                }
            } else {
                this._cached = {};
                this._textStyle = undefined;
            }
            if (!this._preferInitial) {
                let parent;
                if (attrs.some(value => hasBit(CSS_PROPERTIES$1[value].trait, 4 /* LAYOUT */))) {
                    parent = (this.pageFlow && this.ascend({ condition: item => item.documentRoot })[0]) || this;
                } else if (attrs.some(value => hasBit(CSS_PROPERTIES$1[value].trait, 8 /* CONTAIN */))) {
                    parent = this;
                }
                if (parent) {
                    parent.resetBounds();
                    const queryMap = parent.queryMap;
                    if (queryMap) {
                        const q = queryMap.length;
                        let i = 0,
                            j;
                        while (i < q) {
                            const children = queryMap[i++];
                            const r = children.length;
                            j = 0;
                            while (j < r) {
                                children[j++].resetBounds();
                            }
                        }
                    } else {
                        this.cascade(item => item.resetBounds());
                    }
                }
            }
        }
        ascend(options) {
            let attr = options.attr;
            if (!attr) {
                attr = 'actualParent';
            } else if (!/[pP]arent$/.test(attr)) {
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
                } else {
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
                return (
                    (Math.ceil(left) >= leftA && left < Math.floor(rightA)) ||
                    (Math.floor(right) > leftA && right <= Math.ceil(rightA)) ||
                    (Math.ceil(leftA) >= left && leftA < Math.floor(right)) ||
                    (Math.floor(rightA) > left && rightA <= Math.ceil(right))
                );
            }
            return false;
        }
        intersectY(rect, dimension = 'linear') {
            if (rect.height > 0) {
                const { top, bottom } = this[dimension];
                const { top: topA, bottom: bottomA } = rect;
                return (
                    (Math.ceil(top) >= topA && top < Math.floor(bottomA)) ||
                    (Math.floor(bottom) > topA && bottom <= Math.ceil(bottomA)) ||
                    (Math.ceil(topA) >= top && topA < Math.floor(bottom)) ||
                    (Math.floor(bottomA) > top && bottomA <= Math.ceil(bottom))
                );
            }
            return false;
        }
        withinX(rect, dimension = 'linear') {
            if (this.pageFlow || rect.width > 0) {
                const { left, right } = this[dimension];
                return aboveRange(left, rect.left) && belowRange(right, rect.right);
            }
            return true;
        }
        withinY(rect, dimension = 'linear') {
            if (this.pageFlow || rect.height > 0) {
                const { top, bottom } = this[dimension];
                return Math.ceil(top) >= rect.top && Math.floor(bottom) <= rect.bottom;
            }
            return true;
        }
        outsideX(rect, dimension = 'linear') {
            if (this.pageFlow || rect.width > 0) {
                const { left, right } = this[dimension];
                return left < Math.floor(rect.left) || right > Math.ceil(rect.right);
            }
            return false;
        }
        outsideY(rect, dimension = 'linear') {
            if (this.pageFlow || rect.height > 0) {
                const { top, bottom } = this[dimension];
                return top < Math.floor(rect.top) || bottom > Math.ceil(rect.bottom);
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
            return this._styleMap[attr] || (this.styleElement && this.style[attr]) || '';
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
        cssParent(attr, value, cache = false) {
            var _a;
            return ((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.css(attr, value, cache)) || '';
        }
        cssInitial(attr, options) {
            var _a;
            return (
                (((_a = this._initial) === null || _a === void 0 ? void 0 : _a.styleMap) || this._styleMap)[attr] ||
                ((options === null || options === void 0 ? void 0 : options.modified) && this._styleMap[attr]) ||
                ((options === null || options === void 0 ? void 0 : options.computed) && this.style[attr]) ||
                ''
            );
        }
        cssAscend(attr, options) {
            let startSelf, initial;
            if (options) {
                ({ startSelf, initial } = options);
            }
            let parent = startSelf ? this : this.actualParent,
                value;
            while (parent !== null) {
                value = initial ? parent.cssInitial(attr) : parent.css(attr);
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
        cssAny(attr, options) {
            const value = options.initial ? this.cssInitial(attr, options) : this.css(attr);
            return value !== '' && options.values.includes(value);
        }
        cssSort(attr, options = {}) {
            const ascending = options.ascending !== false;
            const byFloat = options.byFloat === true;
            const byInt = !byFloat && options.byInt === true;
            return (options.duplicate ? this.duplicate() : this.children).sort((a, b) => {
                let valueA, valueB;
                if (byFloat) {
                    (valueA = a.toFloat(attr, a.childIndex)), (valueB = b.toFloat(attr, b.childIndex));
                } else if (byInt) {
                    (valueA = a.toInt(attr, a.childIndex)), (valueB = b.toInt(attr, b.childIndex));
                } else {
                    (valueA = a.css(attr)), (valueB = b.css(attr));
                }
                if (valueA === valueB) {
                    return 0;
                } else if (ascending) {
                    return valueA < valueB ? -1 : 1;
                }
                return valueA > valueB ? -1 : 1;
            });
        }
        cssPX(attr, value, cache, options) {
            const current = this._styleMap[attr];
            if (current && isLength(current)) {
                value += parseUnit(current, this.fontSize);
                if (value < 0 && (options === null || options === void 0 ? void 0 : options.negative) !== true) {
                    value = 0;
                }
                const unit = formatPX(value);
                this.css(attr, unit);
                if (cache) {
                    this.unsetCache(attr);
                }
                return unit;
            }
            return '';
        }
        cssSpecificity(attr) {
            var _a, _b;
            if (this.styleElement) {
                const element = this._element;
                return (
                    (this.pseudoElement
                        ? (_a = getElementCache$1(
                              element.parentElement,
                              `styleSpecificity${getPseudoElt(element, this.sessionId)}`,
                              this.sessionId
                          )) === null || _a === void 0
                            ? void 0
                            : _a[attr]
                        : (_b = getElementCache$1(element, 'styleSpecificity', this.sessionId)) === null ||
                          _b === void 0
                        ? void 0
                        : _b[attr]) || 0
                );
            }
            return 0;
        }
        cssTry(attr, value) {
            if (this.styleElement) {
                const element = this._element;
                return setStyleCache(element, attr, this.sessionId, value, getStyle(element).getPropertyValue(attr));
            }
            return false;
        }
        cssFinally(attrs) {
            if (this.styleElement) {
                const element = this._element;
                if (typeof attrs === 'string') {
                    deleteStyleCache(element, attrs, this.sessionId);
                } else {
                    for (const attr in attrs) {
                        deleteStyleCache(element, attr, this.sessionId);
                    }
                }
            }
        }
        cssTryAll(values) {
            if (this.styleElement) {
                const success = [];
                const element = this._element;
                const style = getStyle(element);
                for (const attr in values) {
                    if (setStyleCache(element, attr, this.sessionId, values[attr], style.getPropertyValue(attr))) {
                        success.push(attr);
                    } else {
                        let i = 0;
                        while (i < success.length) {
                            this.cssFinally(success[i++]);
                        }
                        return undefined;
                    }
                }
                return values;
            }
            return undefined;
        }
        cssCopy(node, ...attrs) {
            const styleMap = this._styleMap;
            let i = 0;
            while (i < attrs.length) {
                const attr = attrs[i++];
                styleMap[attr] = node.css(attr);
            }
        }
        cssCopyIfEmpty(node, ...attrs) {
            const styleMap = this._styleMap;
            let i = 0;
            while (i < attrs.length) {
                const attr = attrs[i++];
                if (!hasValue(styleMap[attr])) {
                    styleMap[attr] = node.css(attr);
                }
            }
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
            let i = 0;
            while (i < attrs.length) {
                const attr = attrs[i++];
                result[attr] = this.css(attr);
            }
            return result;
        }
        toInt(attr, fallback = NaN, initial = false) {
            var _a;
            const value = parseInt(
                ((initial && ((_a = this._initial) === null || _a === void 0 ? void 0 : _a.styleMap)) ||
                    this._styleMap)[attr]
            );
            return !isNaN(value) ? value : fallback;
        }
        toFloat(attr, fallback = NaN, initial = false) {
            var _a;
            const value = parseFloat(
                ((initial && ((_a = this._initial) === null || _a === void 0 ? void 0 : _a.styleMap)) ||
                    this._styleMap)[attr]
            );
            return !isNaN(value) ? value : fallback;
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
            var _a, _b;
            return ((_b = (_a = this._element) === null || _a === void 0 ? void 0 : _a[attr]) !== null && _b !== void 0
                ? _b
                : fallback
            ).toString();
        }
        parseUnit(value, options) {
            var _a;
            let parent, dimension, screenDimension;
            if (options) {
                ({ parent, dimension, screenDimension } = options);
            }
            if (isPercent(value)) {
                const bounds =
                    (parent !== false && ((_a = this.absoluteParent) === null || _a === void 0 ? void 0 : _a.box)) ||
                    this.bounds;
                let result = parseFloat(value) / 100;
                switch (dimension) {
                    case 'height':
                        result *= bounds.height;
                        break;
                    default:
                        result *= bounds.width;
                        break;
                }
                return result;
            }
            return parseUnit(value, this.fontSize, screenDimension);
        }
        has(attr, options) {
            var _a, _b;
            const value = (((options === null || options === void 0 ? void 0 : options.map) === 'initial' &&
                ((_a = this._initial) === null || _a === void 0 ? void 0 : _a.styleMap)) ||
                this._styleMap)[attr];
            if (value) {
                if (
                    value === 'initial' ||
                    value === ((_b = CSS_PROPERTIES$1[attr]) === null || _b === void 0 ? void 0 : _b.value)
                ) {
                    return false;
                }
                let not, type;
                if (options) {
                    ({ not, type } = options);
                }
                if (not) {
                    if (value === not) {
                        return false;
                    } else if (Array.isArray(not)) {
                        let i = 0;
                        while (i < not.length) {
                            if (value === not[i++]) {
                                return false;
                            }
                        }
                    }
                }
                if (type) {
                    return (
                        (hasBit(type, 1 /* LENGTH */) && isLength(value)) ||
                        (hasBit(type, 2 /* PERCENT */) && isPercent(value)) ||
                        (hasBit(type, 4 /* TIME */) && isTime(value)) ||
                        (hasBit(type, 8 /* ANGLE */) && isAngle(value))
                    );
                }
                return true;
            }
            return false;
        }
        hasPX(attr, options) {
            var _a;
            let initial, percent;
            if (options) {
                ({ initial, percent } = options);
            }
            const value = ((initial && ((_a = this._initial) === null || _a === void 0 ? void 0 : _a.styleMap)) ||
                this._styleMap)[attr];
            return !!value && isLength(value, percent !== false);
        }
        setBounds(cache = true) {
            let bounds;
            if (this.styleElement) {
                if (!cache) {
                    deleteElementCache(this._element, 'clientRect', this.sessionId);
                }
                bounds = assignRect(actualClientRect(this._element, this.sessionId));
                this._bounds = bounds;
            } else if (this.plainText) {
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
        resetBounds() {
            this._bounds = undefined;
            this._box = undefined;
            this._linear = undefined;
            this._textBounds = undefined;
            this._cached.multiline = undefined;
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
                    if (query === '*') {
                        selectors.push({ all: true });
                        ++offset;
                    } else {
                        invalid: {
                            let adjacent, match;
                            while ((match = SELECTOR_G.exec(query))) {
                                let segment = match[1],
                                    all = false;
                                if (segment.length === 1) {
                                    const ch = segment.charAt(0);
                                    switch (ch) {
                                        case '+':
                                        case '~':
                                            --offset;
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
                                } else if (segment.startsWith('*|*')) {
                                    if (segment.length > 3) {
                                        selectors.length = 0;
                                        break invalid;
                                    }
                                    all = true;
                                } else if (segment.startsWith('*|')) {
                                    segment = segment.substring(2);
                                } else if (segment.startsWith('::')) {
                                    selectors.length = 0;
                                    break invalid;
                                }
                                if (all) {
                                    selectors.push({ all: true });
                                } else {
                                    let tagName, id, classList, attrList, pseudoList, notList, subMatch;
                                    while ((subMatch = SELECTOR_ATTR.exec(segment))) {
                                        if (!attrList) {
                                            attrList = [];
                                        }
                                        let key = subMatch[1].replace('\\:', ':'),
                                            endsWith = false;
                                        switch (key.indexOf('|')) {
                                            case -1:
                                                break;
                                            case 1:
                                                if (key.charAt(0) === '*') {
                                                    endsWith = true;
                                                    key = key.substring(2);
                                                    break;
                                                }
                                            default:
                                                selectors.length = 0;
                                                break invalid;
                                        }
                                        const caseInsensitive = subMatch[6] === 'i';
                                        let attrValue = subMatch[3] || subMatch[4] || subMatch[5] || '';
                                        if (caseInsensitive) {
                                            attrValue = attrValue.toLowerCase();
                                        }
                                        attrList.push({
                                            key,
                                            symbol: subMatch[2],
                                            value: attrValue,
                                            endsWith,
                                            caseInsensitive,
                                        });
                                        segment = spliceString(segment, subMatch.index, subMatch[0].length);
                                    }
                                    if (segment.includes('::')) {
                                        selectors.length = 0;
                                        break invalid;
                                    }
                                    while ((subMatch = SELECTOR_PSEUDO_CLASS.exec(segment))) {
                                        const pseudoClass = subMatch[0];
                                        if (pseudoClass.startsWith(':not(')) {
                                            if (subMatch[1]) {
                                                if (!notList) {
                                                    notList = [];
                                                }
                                                notList.push(subMatch[1]);
                                            }
                                        } else {
                                            if (!pseudoList) {
                                                pseudoList = [];
                                            }
                                            pseudoList.push(pseudoClass);
                                        }
                                        segment = spliceString(segment, subMatch.index, pseudoClass.length);
                                    }
                                    while ((subMatch = SELECTOR_LABEL.exec(segment))) {
                                        const label = subMatch[0];
                                        switch (label.charAt(0)) {
                                            case '#':
                                                id = label.substring(1);
                                                break;
                                            case '.':
                                                if (!classList) {
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
                                        attrList,
                                    });
                                }
                                ++offset;
                                adjacent = undefined;
                            }
                        }
                        SELECTOR_G.lastIndex = 0;
                    }
                    length = queryMap.length;
                    if (selectors.length > 0 && offset !== -1 && offset < length) {
                        const dataEnd = selectors.pop();
                        const lastEnd = selectors.length === 0;
                        const currentCount = result.length;
                        let pending;
                        if (dataEnd.all && length - offset === 1) {
                            pending = queryMap[offset];
                        } else {
                            pending = [];
                            let j = offset;
                            while (j < length) {
                                const children = queryMap[j++];
                                if (dataEnd.all) {
                                    pending = pending.concat(children);
                                } else {
                                    const q = children.length;
                                    let k = 0;
                                    while (k < q) {
                                        const node = children[k++];
                                        if (
                                            (currentCount === 0 || !result.includes(node)) &&
                                            validateQuerySelector(this, node, dataEnd, i, lastEnd)
                                        ) {
                                            pending.push(node);
                                        }
                                    }
                                }
                            }
                        }
                        if (selectors.length > 0) {
                            selectors.reverse();
                            let count = currentCount;
                            const r = pending.length;
                            let j = 0;
                            while (j < r) {
                                const node = pending[j++];
                                if (
                                    (currentCount === 0 || !result.includes(node)) &&
                                    ascendQuerySelector(this, selectors, i, 0, dataEnd.adjacent, [node])
                                ) {
                                    result.push(node);
                                    if (++count === resultCount) {
                                        return result.sort(sortById);
                                    }
                                }
                            }
                        } else if (currentCount === 0) {
                            if (i === queries.length - 1 || (resultCount > 0 && resultCount <= pending.length)) {
                                if (resultCount > 0 && pending.length > resultCount) {
                                    pending.length = resultCount;
                                }
                                return pending.sort(sortById);
                            } else {
                                result = pending;
                            }
                        } else {
                            const q = pending.length;
                            if (resultCount > 0) {
                                let count = currentCount;
                                let j = 0;
                                while (j < q) {
                                    const node = pending[j++];
                                    if (!result.includes(node)) {
                                        result.push(node);
                                        if (++count === resultCount) {
                                            return result.sort(sortById);
                                        }
                                    }
                                }
                            } else {
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
            return result.sort(sortById);
        }
        set parent(value) {
            if (value) {
                const parent = this._parent;
                if (value !== parent) {
                    parent === null || parent === void 0 ? void 0 : parent.remove(this);
                    this._parent = value;
                    value.add(this);
                } else if (!value.contains(this)) {
                    value.add(this);
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
            const result = this._cached.tagName;
            if (result === undefined) {
                const element = this._element;
                if (element) {
                    const nodeName = element.nodeName;
                    return (this._cached.tagName = nodeName.charAt(0) === '#' ? nodeName : element.tagName);
                }
                return (this._cached.tagName = '');
            }
            return result;
        }
        get element() {
            return this._element;
        }
        get elementId() {
            var _a;
            return (((_a = this._element) === null || _a === void 0 ? void 0 : _a.id) || '').trim();
        }
        get htmlElement() {
            const result = this._cached.htmlElement;
            return result === undefined
                ? (this._cached.htmlElement = !this.plainText && this._element instanceof HTMLElement)
                : result;
        }
        get svgElement() {
            const result = this._cached.svgElement;
            return result === undefined
                ? (this._cached.svgElement =
                      (!this.htmlElement && !this.plainText && this._element instanceof SVGElement) ||
                      (this.imageElement && FILE$1.SVG.test(this.toElementString('src'))))
                : result;
        }
        get styleElement() {
            return this.htmlElement || this.svgElement;
        }
        get naturalChild() {
            return true;
        }
        get naturalElement() {
            const result = this._cached.naturalElement;
            return result === undefined
                ? (this._cached.naturalElement = this.naturalChild && this.styleElement && !this.pseudoElement)
                : result;
        }
        get parentElement() {
            var _a, _b;
            return (
                ((_a = this._element) === null || _a === void 0 ? void 0 : _a.parentElement) ||
                ((_b = this.actualParent) === null || _b === void 0 ? void 0 : _b.element) ||
                null
            );
        }
        get textElement() {
            return this.plainText || (this.inlineText && this.tagName !== 'BUTTON');
        }
        get pseudoElement() {
            return false;
        }
        get imageElement() {
            return this.tagName === 'IMG';
        }
        get flexElement() {
            return this.display.endsWith('flex');
        }
        get gridElement() {
            return this.display.endsWith('grid');
        }
        get tableElement() {
            return this.tagName === 'TABLE' || this.display === 'table';
        }
        get inputElement() {
            switch (this.tagName) {
                case 'INPUT':
                case 'BUTTON':
                case 'SELECT':
                case 'TEXTAREA':
                    return true;
                default:
                    return false;
            }
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
        get display() {
            return this.css('display');
        }
        get positionRelative() {
            return this.css('position') === 'relative';
        }
        get floating() {
            return this.float !== 'none';
        }
        get float() {
            return (this.pageFlow && this.css('float')) || 'none';
        }
        get zIndex() {
            return this.toInt('zIndex', 0);
        }
        get textContent() {
            return this.naturalChild && !this.svgElement ? this._element.textContent : '';
        }
        get dataset() {
            if (this.styleElement) {
                return this._element.dataset;
            } else {
                const result = this._dataset;
                return result === undefined ? (this._dataset = {}) : result;
            }
        }
        get documentBody() {
            return this._element === document.body;
        }
        get initial() {
            return this._initial;
        }
        get bounds() {
            return this._bounds || this.setBounds(false) || assignRect(this.boundingClientRect);
        }
        get linear() {
            if (this._linear === undefined) {
                const bounds = this.bounds;
                if (bounds) {
                    if (this.styleElement) {
                        const { marginBottom, marginRight } = this;
                        const marginTop = Math.max(this.marginTop, 0);
                        const marginLeft = Math.max(this.marginLeft, 0);
                        return (this._linear = {
                            top: bounds.top - marginTop,
                            right: bounds.right + marginRight,
                            bottom: bounds.bottom + marginBottom,
                            left: bounds.left - marginLeft,
                            width: bounds.width + marginLeft + marginRight,
                            height: bounds.height + marginTop + marginBottom,
                        });
                    }
                    return (this._linear = bounds);
                }
                return newBoxRectDimension();
            }
            return this._linear;
        }
        get box() {
            if (this._box === undefined) {
                const bounds = this.bounds;
                if (bounds) {
                    if (this.styleElement && this.naturalChildren.length > 0) {
                        return (this._box = {
                            top: bounds.top + (this.paddingTop + this.borderTopWidth),
                            right: bounds.right - (this.paddingRight + this.borderRightWidth),
                            bottom: bounds.bottom - (this.paddingBottom + this.borderBottomWidth),
                            left: bounds.left + (this.paddingLeft + this.borderLeftWidth),
                            width: bounds.width - this.contentBoxWidth,
                            height: bounds.height - this.contentBoxHeight,
                        });
                    }
                    return (this._box = bounds);
                }
                return newBoxRectDimension();
            }
            return this._box;
        }
        get flexdata() {
            const result = this._cached.flexdata;
            if (result === undefined) {
                if (this.flexElement) {
                    const { flexWrap, flexDirection, alignContent, justifyContent } = this.cssAsObject(
                        'flexWrap',
                        'flexDirection',
                        'alignContent',
                        'justifyContent'
                    );
                    const row = flexDirection.startsWith('row');
                    return (this._cached.flexdata = {
                        row,
                        column: !row,
                        reverse: flexDirection.endsWith('reverse'),
                        wrap: flexWrap.startsWith('wrap'),
                        wrapReverse: flexWrap === 'wrap-reverse',
                        alignContent,
                        justifyContent,
                    });
                }
                return (this._cached.flexdata = {});
            }
            return result;
        }
        get flexbox() {
            const result = this._cached.flexbox;
            if (result === undefined) {
                if (this.styleElement && this.actualParent.flexElement) {
                    const [alignSelf, justifySelf, basis] = this.cssAsTuple('alignSelf', 'justifySelf', 'flexBasis');
                    return (this._cached.flexbox = {
                        alignSelf: alignSelf === 'auto' ? this.cssParent('alignItems') : alignSelf,
                        justifySelf: justifySelf === 'auto' ? this.cssParent('justifyItems') : justifySelf,
                        basis,
                        grow: getFlexValue(this, 'flexGrow', 0),
                        shrink: getFlexValue(this, 'flexShrink', 1),
                        order: this.toInt('order', 0),
                    });
                }
                return (this._cached.flexbox = {});
            }
            return result;
        }
        get width() {
            const result = this._cached.width;
            return result === undefined
                ? (this._cached.width = setDimension(this, this._styleMap, 'width', 'minWidth', 'maxWidth'))
                : result;
        }
        get height() {
            const result = this._cached.height;
            return result === undefined
                ? (this._cached.height = setDimension(this, this._styleMap, 'height', 'minHeight', 'maxHeight'))
                : result;
        }
        get hasWidth() {
            const result = this._cached.hasWidth;
            return result === undefined ? (this._cached.hasWidth = this.width > 0) : result;
        }
        get hasHeight() {
            var _a;
            const result = this._cached.hasHeight;
            if (result === undefined) {
                const value = this.css('height');
                if (isPercent(value)) {
                    return (this._cached.hasHeight = this.pageFlow
                        ? ((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.hasHeight) ||
                          this.documentBody
                        : this.css('position') === 'fixed' || this.hasPX('top') || this.hasPX('bottom'));
                }
                return (this._cached.hasHeight = this.height > 0 || this.hasPX('height', { percent: false }));
            }
            return result;
        }
        get lineHeight() {
            var _a;
            let result = this._cached.lineHeight;
            if (result === undefined) {
                if (!this.imageElement && !this.svgElement) {
                    let hasOwnStyle = this.has('lineHeight'),
                        value = 0;
                    if (hasOwnStyle) {
                        const lineHeight = this.css('lineHeight');
                        if (isPercent(lineHeight)) {
                            value = convertFloat(this.style.lineHeight);
                        } else if (isNumber(lineHeight)) {
                            value = parseFloat(lineHeight) * this.fontSize;
                        } else {
                            value = parseUnit(lineHeight, this.fontSize);
                            if (
                                isPx(lineHeight) &&
                                ((_a = this._cssStyle) === null || _a === void 0 ? void 0 : _a.lineHeight) !== 'inherit'
                            ) {
                                const fontSize = getInitialValue.call(this, 'fontSize');
                                if (isEm(fontSize)) {
                                    value *= parseFloat(fontSize);
                                }
                            }
                        }
                    } else {
                        let parent = this.ascend({ condition: item => item.has('lineHeight') })[0];
                        if (parent) {
                            const lineHeight = parent.css('lineHeight');
                            if (isNumber(lineHeight)) {
                                value = parseFloat(lineHeight) * this.fontSize;
                                hasOwnStyle = true;
                            }
                        }
                        if (value === 0) {
                            parent = this.ascend({ condition: item => item.lineHeight > 0 })[0];
                            if (parent) {
                                value = parent.lineHeight;
                            }
                        }
                        if (this.styleElement) {
                            const fontSize = getInitialValue.call(this, 'fontSize');
                            if (isEm(fontSize)) {
                                const emSize = parseFloat(fontSize);
                                if (emSize !== 1) {
                                    value *= emSize;
                                    this.css('lineHeight', formatPX(value));
                                    hasOwnStyle = true;
                                }
                            }
                        }
                    }
                    result =
                        hasOwnStyle ||
                        value > this.height ||
                        this.multiline ||
                        (this.block && this.naturalChildren.some(node => node.textElement))
                            ? value
                            : 0;
                } else {
                    result = 0;
                }
                this._cached.lineHeight = result;
            }
            return result;
        }
        get positionStatic() {
            var _a;
            let result = this._cached.positionStatic;
            if (result === undefined) {
                switch (this.css('position')) {
                    case 'absolute':
                    case 'fixed':
                        result = false;
                        break;
                    case 'relative':
                        result =
                            !this.documentBody &&
                            this.toFloat('top', 0) === 0 &&
                            this.toFloat('right', 0) === 0 &&
                            this.toFloat('bottom', 0) === 0 &&
                            this.toFloat('left', 0) === 0;
                        this._cached.positionRelative = !result;
                        break;
                    case 'inherit': {
                        const parentElement =
                            (_a = this._element) === null || _a === void 0 ? void 0 : _a.parentElement;
                        if (parentElement) {
                            const position = getInheritedStyle(parentElement, 'position');
                            result = position === 'static' || position === 'initial';
                            break;
                        }
                    }
                    default:
                        result = true;
                        break;
                }
                this._cached.positionStatic = result;
            }
            return result;
        }
        get top() {
            const result = this._cached.top;
            return result === undefined ? (this._cached.top = convertPosition(this, 'top')) : result;
        }
        get right() {
            const result = this._cached.right;
            return result === undefined ? (this._cached.right = convertPosition(this, 'right')) : result;
        }
        get bottom() {
            const result = this._cached.bottom;
            return result === undefined ? (this._cached.bottom = convertPosition(this, 'bottom')) : result;
        }
        get left() {
            const result = this._cached.left;
            return result === undefined ? (this._cached.left = convertPosition(this, 'left')) : result;
        }
        get marginTop() {
            const result = this._cached.marginTop;
            return result === undefined
                ? (this._cached.marginTop = this.inlineStatic ? 0 : convertBox(this, 'marginTop', true))
                : result;
        }
        get marginRight() {
            const result = this._cached.marginRight;
            return result === undefined ? (this._cached.marginRight = convertBox(this, 'marginRight', true)) : result;
        }
        get marginBottom() {
            const result = this._cached.marginBottom;
            return result === undefined
                ? (this._cached.marginBottom = this.inlineStatic ? 0 : convertBox(this, 'marginBottom', true))
                : result;
        }
        get marginLeft() {
            const result = this._cached.marginLeft;
            return result === undefined ? (this._cached.marginLeft = convertBox(this, 'marginLeft', true)) : result;
        }
        get borderTopWidth() {
            const result = this._cached.borderTopWidth;
            return result === undefined
                ? (this._cached.borderTopWidth = convertBorderWidth(this, 'height', BORDER_TOP))
                : result;
        }
        get borderRightWidth() {
            const result = this._cached.borderRightWidth;
            return result === undefined
                ? (this._cached.borderRightWidth = convertBorderWidth(this, 'height', BORDER_RIGHT))
                : result;
        }
        get borderBottomWidth() {
            const result = this._cached.borderBottomWidth;
            return result === undefined
                ? (this._cached.borderBottomWidth = convertBorderWidth(this, 'width', BORDER_BOTTOM))
                : result;
        }
        get borderLeftWidth() {
            const result = this._cached.borderLeftWidth;
            return result === undefined
                ? (this._cached.borderLeftWidth = convertBorderWidth(this, 'width', BORDER_LEFT))
                : result;
        }
        get paddingTop() {
            const result = this._cached.paddingTop;
            return result === undefined ? (this._cached.paddingTop = convertBox(this, 'paddingTop', false)) : result;
        }
        get paddingRight() {
            const result = this._cached.paddingRight;
            return result === undefined
                ? (this._cached.paddingRight = convertBox(this, 'paddingRight', false))
                : result;
        }
        get paddingBottom() {
            const result = this._cached.paddingBottom;
            return result === undefined
                ? (this._cached.paddingBottom = convertBox(this, 'paddingBottom', false))
                : result;
        }
        get paddingLeft() {
            const result = this._cached.paddingLeft;
            return result === undefined ? (this._cached.paddingLeft = convertBox(this, 'paddingLeft', false)) : result;
        }
        get contentBox() {
            return this.css('boxSizing') !== 'border-box' || (this.tableElement && isUserAgent(4 /* FIREFOX */));
        }
        get contentBoxWidth() {
            const result = this._cached.contentBoxWidth;
            if (result === undefined) {
                return (this._cached.contentBoxWidth =
                    this.tableElement && this.css('borderCollapse') === 'collapse'
                        ? 0
                        : this.borderLeftWidth + this.paddingLeft + this.paddingRight + this.borderRightWidth);
            }
            return result;
        }
        get contentBoxHeight() {
            const result = this._cached.contentBoxHeight;
            if (result === undefined) {
                return (this._cached.contentBoxHeight =
                    this.tableElement && this.css('borderCollapse') === 'collapse'
                        ? 0
                        : this.borderTopWidth + this.paddingTop + this.paddingBottom + this.borderBottomWidth);
            }
            return result;
        }
        get inline() {
            const result = this._cached.inline;
            if (result === undefined) {
                const value = this.display;
                return (this._cached.inline =
                    value === 'inline' || (value === 'initial' && !ELEMENT_BLOCK.includes(this.tagName)));
            }
            return result;
        }
        get inlineStatic() {
            const result = this._cached.inlineStatic;
            return result === undefined
                ? (this._cached.inlineStatic = this.inline && this.pageFlow && !this.floating && !this.imageElement)
                : result;
        }
        set inlineText(value) {
            switch (this.tagName) {
                case 'IMG':
                case 'INPUT':
                case 'SELECT':
                case 'TEXTAREA':
                case 'SVG':
                case 'BR':
                case 'HR':
                case 'PROGRESS':
                case 'METER':
                case 'CANVAS':
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
                        if (this.tagName === 'svg' && this.actualParent.htmlElement) {
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
            const result = this._cached.blockStatic;
            if (result === undefined) {
                const pageFlow = this.pageFlow;
                if (pageFlow && ((this.block && !this.floating) || this.lineBreak)) {
                    return (this._cached.blockStatic = true);
                } else if (
                    !pageFlow ||
                    (!this.inline && !this.display.startsWith('table-') && !this.hasPX('maxWidth'))
                ) {
                    const width = getInitialValue.call(this, 'width');
                    const minWidth = getInitialValue.call(this, 'minWidth');
                    let percent = 0;
                    if (isPercent(width)) {
                        percent = parseFloat(width);
                    }
                    if (isPercent(minWidth)) {
                        percent = Math.max(parseFloat(minWidth), percent);
                    }
                    if (percent > 0) {
                        const marginLeft = getInitialValue.call(this, 'marginLeft');
                        const marginRight = getInitialValue.call(this, 'marginRight');
                        return (this._cached.blockStatic =
                            percent +
                                (isPercent(marginLeft) ? parseFloat(marginLeft) : 0) +
                                (isPercent(marginRight) ? parseFloat(marginRight) : 0) >=
                            100);
                    }
                }
                return (this._cached.blockStatic = false);
            }
            return result;
        }
        get pageFlow() {
            const result = this._cached.pageFlow;
            return result === undefined
                ? (this._cached.pageFlow = this.positionStatic || this.positionRelative)
                : result;
        }
        get centerAligned() {
            const result = this._cached.centerAligned;
            if (result === undefined) {
                return (this._cached.centerAligned = !this.pageFlow
                    ? this.hasPX('left') && this.hasPX('right')
                    : this.autoMargin.leftRight || (canTextAlign(this) && hasTextAlign(this, 'center')));
            }
            return result;
        }
        get rightAligned() {
            const result = this._cached.rightAligned;
            if (result === undefined) {
                return (this._cached.rightAligned = !this.pageFlow
                    ? this.hasPX('right') && !this.hasPX('left')
                    : this.float === 'right' ||
                      this.autoMargin.left ||
                      (canTextAlign(this) && hasTextAlign(this, 'right', 'end')));
            }
            return result;
        }
        get bottomAligned() {
            var _a;
            const result = this._cached.bottomAligned;
            if (result === undefined) {
                return (this._cached.bottomAligned = !this.pageFlow
                    ? this.hasPX('bottom') && !this.hasPX('top')
                    : ((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.hasHeight) === true &&
                      this.autoMargin.top === true);
            }
            return result;
        }
        get autoMargin() {
            const result = this._cached.autoMargin;
            if (result === undefined) {
                if (!this.pageFlow || this.blockStatic || this.display === 'table') {
                    const styleMap = this._styleMap;
                    const left = styleMap.marginLeft === 'auto' && (this.pageFlow || this.hasPX('right'));
                    const right = styleMap.marginRight === 'auto' && (this.pageFlow || this.hasPX('left'));
                    const top = styleMap.marginTop === 'auto' && (this.pageFlow || this.hasPX('bottom'));
                    const bottom = styleMap.marginBottom === 'auto' && (this.pageFlow || this.hasPX('top'));
                    return (this._cached.autoMargin = {
                        horizontal: left || right,
                        left: left && !right,
                        right: !left && right,
                        leftRight: left && right,
                        vertical: top || bottom,
                        top: top && !bottom,
                        bottom: !top && bottom,
                        topBottom: top && bottom,
                    });
                }
                return (this._cached.autoMargin = {});
            }
            return result;
        }
        get baseline() {
            const result = this._cached.baseline;
            if (result === undefined) {
                if (this.pageFlow && !this.floating) {
                    const value = this.css('verticalAlign');
                    return (this._cached.baseline =
                        value === 'baseline' ||
                        value === 'initial' ||
                        (this.naturalElements.length === 0 && isLength(value, true)));
                }
                return (this._cached.baseline = false);
            }
            return result;
        }
        get verticalAlign() {
            let result = this._cached.verticalAlign;
            if (result === undefined) {
                if (this.pageFlow) {
                    result = this.css('verticalAlign');
                    if (isLength(result, true)) {
                        result = this.parseUnit(result, { dimension: 'height' }) + 'px';
                    }
                } else {
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
            const result = this._textBounds;
            if (result === undefined) {
                if (this.naturalChild) {
                    if (this.textElement) {
                        return (this._textBounds = actualTextRangeRect(this._element, this.sessionId));
                    } else {
                        const children = this.naturalChildren;
                        const length = children.length;
                        if (length > 0) {
                            let top = Infinity,
                                right = -Infinity,
                                bottom = -Infinity,
                                left = Infinity,
                                numberOfLines = 0;
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
                                return (this._textBounds = {
                                    top,
                                    right,
                                    left,
                                    bottom,
                                    width: right - left,
                                    height: bottom - top,
                                    numberOfLines,
                                });
                            }
                        }
                    }
                }
                return (this._textBounds = null);
            }
            return result;
        }
        get multiline() {
            var _a;
            const result = this._cached.multiline;
            if (result === undefined) {
                return (this._cached.multiline = this.styleText
                    ? (this.inline ||
                          this.naturalElements.length === 0 ||
                          isInlineVertical(this.display) ||
                          this.floating) &&
                      ((_a = this.textBounds) === null || _a === void 0 ? void 0 : _a.numberOfLines) > 1
                    : this.plainText &&
                      Math.floor(getRangeClientRect(this._element).width) > this.actualParent.box.width);
            }
            return result;
        }
        get backgroundColor() {
            let result = this._cached.backgroundColor;
            if (result === undefined) {
                if (!this.plainText) {
                    result = this.css('backgroundColor');
                    switch (result) {
                        case 'initial':
                        case 'transparent':
                        case 'rgba(0, 0, 0, 0)':
                            result = '';
                            if (this.inputElement) {
                                if (this.tagName === 'BUTTON') {
                                    result = 'rgba(0, 0, 0, 0)';
                                } else {
                                    switch (this.toElementString('type')) {
                                        case 'button':
                                        case 'submit':
                                        case 'reset':
                                        case 'image':
                                            result = 'rgba(0, 0, 0, 0)';
                                            break;
                                    }
                                }
                            }
                            break;
                        default:
                            if (
                                result !== '' &&
                                this.styleElement &&
                                !this.inputElement &&
                                (!this._initial || getInitialValue.call(this, 'backgroundColor') === result)
                            ) {
                                let parent = this.actualParent;
                                while (parent !== null) {
                                    const color = getInitialValue.call(parent, 'backgroundColor', { modified: true });
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
                } else {
                    result = '';
                }
                this._cached.backgroundColor = result;
            }
            return result;
        }
        get backgroundImage() {
            let result = this._cached.backgroundImage;
            if (result === undefined) {
                if (!this.plainText) {
                    let value = this.css('backgroundImage');
                    if (value !== '' && value !== 'none' && value !== 'initial') {
                        result = value;
                    } else {
                        result = '';
                        const pattern = /\s*(url|[a-z-]+gradient)/;
                        value = this.css('background');
                        if (pattern.test(value)) {
                            const background = splitEnclosing(value);
                            const length = background.length;
                            for (let i = 1; i < length; ++i) {
                                const name = background[i - 1].trim();
                                if (pattern.test(name)) {
                                    result += (result !== '' ? ', ' : '') + name + background[i];
                                }
                            }
                        }
                    }
                } else {
                    result = '';
                }
                this._cached.backgroundImage = result;
            }
            return result;
        }
        get percentWidth() {
            const result = this._cached.percentWidth;
            if (result === undefined) {
                const value = getInitialValue.call(this, 'width');
                return (this._cached.percentWidth = isPercent(value) ? parseFloat(value) / 100 : 0);
            }
            return result;
        }
        get percentHeight() {
            var _a;
            const result = this._cached.percentHeight;
            if (result === undefined) {
                const value = getInitialValue.call(this, 'height');
                return (this._cached.percentHeight =
                    isPercent(value) &&
                    (((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.hasHeight) ||
                        this.css('position') === 'fixed')
                        ? parseFloat(value) / 100
                        : 0);
            }
            return result;
        }
        get visibleStyle() {
            const result = this._cached.visibleStyle;
            if (result === undefined) {
                if (!this.plainText) {
                    const borderWidth =
                        this.borderTopWidth > 0 ||
                        this.borderRightWidth > 0 ||
                        this.borderBottomWidth > 0 ||
                        this.borderLeftWidth > 0;
                    const backgroundColor = this.backgroundColor !== '';
                    const backgroundImage = this.backgroundImage !== '';
                    let backgroundRepeatX = false,
                        backgroundRepeatY = false;
                    if (backgroundImage) {
                        for (const repeat of this.css('backgroundRepeat').split(',')) {
                            const [repeatX, repeatY] = repeat.trim().split(' ');
                            if (!backgroundRepeatX) {
                                backgroundRepeatX = repeatX === 'repeat' || repeatX === 'repeat-x';
                            }
                            if (!backgroundRepeatY) {
                                backgroundRepeatY =
                                    repeatX === 'repeat' || repeatX === 'repeat-y' || repeatY === 'repeat';
                            }
                        }
                    }
                    return (this._cached.visibleStyle = {
                        background: borderWidth || backgroundImage || backgroundColor,
                        borderWidth,
                        backgroundImage,
                        backgroundColor,
                        backgroundRepeat: backgroundRepeatX || backgroundRepeatY,
                        backgroundRepeatX,
                        backgroundRepeatY,
                    });
                }
                return (this._cached.visibleStyle = {});
            }
            return result;
        }
        get absoluteParent() {
            let result = this._cached.absoluteParent;
            if (result === undefined) {
                result = this.actualParent;
                if (!this.pageFlow && !this.documentBody) {
                    while (result && !result.documentBody) {
                        switch (getInitialValue.call(result, 'position', { computed: true })) {
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
            const result = this._cached.actualParent;
            if (result === undefined) {
                const parentElement = (_a = this._element) === null || _a === void 0 ? void 0 : _a.parentElement;
                return (this._cached.actualParent =
                    (parentElement && getElementAsNode(parentElement, this.sessionId)) || null);
            }
            return result;
        }
        get actualWidth() {
            var _a;
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
                } else if (
                    this.inlineStatic ||
                    this.display === 'table-cell' ||
                    ((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.flexdata.row) === true
                ) {
                    result = this.bounds.width;
                } else {
                    result = this.width;
                    if (result > 0) {
                        if (this.contentBox && !this.tableElement) {
                            result += this.contentBoxWidth;
                        }
                    } else {
                        result = this.bounds.width;
                    }
                }
                this._cached.actualWidth = result;
            }
            return result;
        }
        get actualHeight() {
            var _a;
            let result = this._cached.actualHeight;
            if (result === undefined) {
                if (
                    this.inlineStatic ||
                    this.display === 'table-cell' ||
                    ((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.flexdata.column) === true
                ) {
                    result = this.bounds.height;
                } else {
                    result = this.height;
                    if (result > 0) {
                        if (this.contentBox && !this.tableElement) {
                            result += this.contentBoxHeight;
                        }
                    } else {
                        result = this.bounds.height;
                    }
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
        get previousSibling() {
            var _a;
            return (
                ((_a = this.actualParent) === null || _a === void 0
                    ? void 0
                    : _a.naturalChildren[this.childIndex - 1]) || null
            );
        }
        get nextSibling() {
            var _a;
            return (
                ((_a = this.actualParent) === null || _a === void 0
                    ? void 0
                    : _a.naturalChildren[this.childIndex + 1]) || null
            );
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
                        const item = attributes.item(i++);
                        result[item.name] = item.value;
                    }
                }
                this._cached.attributes = result;
            }
            return result;
        }
        get boundingClientRect() {
            var _a;
            return (
                (this.naturalElement &&
                    ((_a = this._element) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect())) ||
                this._bounds ||
                newBoxRectDimension()
            );
        }
        get fontSize() {
            var _a, _b, _c, _d;
            let result = this._fontSize;
            if (result === undefined) {
                if (this.naturalChild && this.styleElement) {
                    const value = getInitialValue.call(this, 'fontSize');
                    if (isPx(value)) {
                        result = parseFloat(value);
                    } else if (isPercent(value) && this._element !== document.documentElement) {
                        result =
                            (((_b = (_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.fontSize) !==
                                null && _b !== void 0
                                ? _b
                                : getFontSize(getStyle(this._element.parentElement || document.documentElement))) *
                                parseFloat(value)) /
                            100;
                    } else {
                        result = getFontSize(this.style);
                    }
                } else {
                    result = parseUnit(this.css('fontSize'));
                }
                if (result === 0 && !this.naturalChild) {
                    const element = this.element;
                    result =
                        element && hasComputedStyle$1(element)
                            ? ((_c = getElementAsNode(element, this.sessionId)) === null || _c === void 0
                                  ? void 0
                                  : _c.fontSize) || getFontSize(getStyle(element))
                            : ((_d = this.ascend({ condition: item => item.fontSize > 0 })[0]) === null || _d === void 0
                                  ? void 0
                                  : _d.fontSize) || getFontSize(getStyle(document.documentElement));
                }
                this._fontSize = result;
            }
            return result;
        }
        get cssStyle() {
            return Object.assign({}, this._cssStyle);
        }
        get textStyle() {
            let result = this._textStyle;
            if (result === undefined) {
                result = this.cssAsObject(...Node.TEXT_STYLE);
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
                    while (parent !== null) {
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
                y: (bounds.top + bounds.bottom) / 2,
            };
        }
    }
    Node.BOX_POSITION = ['top', 'right', 'bottom', 'left'];
    Node.TEXT_STYLE = [
        'fontFamily',
        'fontWeight',
        'fontStyle',
        'fontVariant',
        'fontStretch',
        'color',
        'whiteSpace',
        'textDecoration',
        'textTransform',
        'letterSpacing',
        'wordSpacing',
    ];

    const settings = {
        builtInExtensions: [],
        createElementMap: true,
        createQuerySelectorMap: true,
        showErrorMessages: false,
    };

    const framework = 1; /* VDOM */
    let initialized = false;
    let application;
    const appBase = {
        base: {
            Application: Application$1,
        },
        lib: {},
        extensions: {},
        system: {},
        create() {
            application = new Application$1(framework, Node, Controller);
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
    };

    return appBase;
});
