/* squared.base 1.13.0
   https://github.com/anpham6/squared */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined'
        ? factory(exports)
        : typeof define === 'function' && define.amd
        ? define(['exports'], factory)
        : ((global = global || self), factory(((global.squared = global.squared || {}), (global.squared.base = {}))));
})(this, function (exports) {
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
        beforeParseDocument(sessionId) {}
        afterParseDocument(sessionId) {}
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
            if (typeof ext === 'string') {
                const item = this.retrieve(ext);
                if (!item) {
                    return false;
                }
                ext = item;
            }
            const name = ext.name;
            const index = extensions.findIndex(item => item.name === name);
            if (index !== -1) {
                extensions[index] = ext;
                return true;
            } else {
                const { framework, dependencies } = ext;
                if (framework > 0) {
                    const length = dependencies.length;
                    let i = 0;
                    while (i < length) {
                        const item = dependencies[i++];
                        if (item.preload) {
                            if (!this.retrieve(item.name)) {
                                const extension = application.builtInExtensions[item.name];
                                if (extension) {
                                    this.include(extension);
                                }
                            }
                        }
                    }
                }
                if (
                    (framework === 0 || hasBit(framework, application.framework)) &&
                    dependencies.every(item => !!this.retrieve(item.name))
                ) {
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
                if (extensions[i] === ext || (typeof ext === 'string' && this.retrieve(ext))) {
                    extensions.splice(i, 1);
                    return true;
                }
            }
            return false;
        }
        retrieve(name, checkBuiltIn) {
            const extensions = this.extensions;
            const length = extensions.length;
            let i = 0;
            while (i < length) {
                const ext = extensions[i++];
                if (ext.name === name) {
                    return ext;
                }
            }
            return (checkBuiltIn && this.application.builtInExtensions[name]) || null;
        }
        optionValue(name, attr, fallback = undefined) {
            var _a;
            const options = (_a = this.retrieve(name)) === null || _a === void 0 ? void 0 : _a.options;
            return isObject(options) ? options[attr] : fallback;
        }
        optionValueAsObject(name, attr, fallback = null) {
            const value = this.optionValue(name, attr);
            return isObject(value) ? value : fallback;
        }
        optionValueAsString(name, attr, fallback = '') {
            const value = this.optionValue(name, attr);
            return typeof value === 'string' ? value : fallback;
        }
        optionValueAsNumber(name, attr, fallback = NaN) {
            const value = this.optionValue(name, attr);
            return typeof value === 'number' ? value : fallback;
        }
        optionValueAsBoolean(name, attr, fallback = false) {
            const value = this.optionValue(name, attr);
            return typeof value === 'boolean' ? value : fallback;
        }
        get extensions() {
            return this.application.extensions;
        }
    }

    const { frameworkNotInstalled: frameworkNotInstalled$1 } = squared.lib.session;
    const { fromLastIndexOf, trimEnd } = squared.lib.util;
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
        getDataMap(options) {
            return undefined;
        }
        getCopyQueryParameters(options) {
            return '';
        }
        getArchiveQueryParameters(options) {
            return '';
        }
        createFrom(format, options) {
            return this.archiving(
                Object.assign(Object.assign({ filename: this.userSettings.outputArchiveName }, options), { format })
            );
        }
        appendFromArchive(filename, options) {
            return this.archiving(
                Object.assign(Object.assign({ filename: this.userSettings.outputArchiveName }, options), {
                    appendTo: filename,
                    format: filename.substring(filename.lastIndexOf('.') + 1),
                })
            );
        }
        addAsset(asset) {
            if (asset.content || asset.bytes || asset.base64 || asset.uri) {
                const { pathname, filename } = asset;
                const append = this.assets.find(item => item.pathname === pathname && item.filename === filename);
                if (append) {
                    Object.assign(append, asset);
                } else {
                    this.assets.push(asset);
                }
            }
        }
        reset() {
            this.assets.length = 0;
        }
        copying(options) {
            if (this.hasHttpProtocol()) {
                const body = this.createRequestBody(options.assets, options);
                if (body && options.directory) {
                    return fetch(
                        this.hostname +
                            '/api/assets/copy' +
                            '?to=' +
                            encodeURIComponent(options.directory.trim()) +
                            '&empty=' +
                            (this.userSettings.outputEmptyCopyDirectory ? '1' : '0') +
                            this.getCopyQueryParameters(options),
                        {
                            method: 'POST',
                            headers: new Headers({
                                'Accept': 'application/json, text/plain',
                                'Content-Type': 'application/json',
                            }),
                            body: JSON.stringify(body),
                        }
                    )
                        .then(async response => await response.json())
                        .then(result => {
                            if (result) {
                                if (typeof options.callback === 'function') {
                                    options.callback(result);
                                }
                                if (result.system) {
                                    (this.userSettings.showErrorMessages ? alert : console.log)(
                                        result.application + '\n\n' + result.system
                                    );
                                }
                            }
                            return result;
                        });
                }
            } else {
                (this.userSettings.showErrorMessages ? alert : console.log)(
                    'SERVER (required): See README for instructions'
                );
            }
            return frameworkNotInstalled$1();
        }
        archiving(options) {
            if (this.hasHttpProtocol()) {
                const body = this.createRequestBody(options.assets, options);
                if (body && options.filename) {
                    return fetch(
                        this.hostname +
                            '/api/assets/archive' +
                            '?filename=' +
                            encodeURIComponent(options.filename.trim()) +
                            '&format=' +
                            (options.format || this.userSettings.outputArchiveFormat).trim().toLowerCase() +
                            '&to=' +
                            encodeURIComponent((options.copyTo || '').trim()) +
                            '&append_to=' +
                            encodeURIComponent((options.appendTo || '').trim()) +
                            this.getArchiveQueryParameters(options),
                        {
                            method: 'POST',
                            headers: new Headers({
                                'Accept': 'application/json, text/plain',
                                'Content-Type': 'application/json',
                            }),
                            body: JSON.stringify(body),
                        }
                    )
                        .then(async response => await response.json())
                        .then(result => {
                            if (result) {
                                if (typeof options.callback === 'function') {
                                    options.callback(result);
                                }
                                const zipname = result.zipname;
                                if (zipname) {
                                    fetch(
                                        '/api/browser/download?filepath=' + encodeURIComponent(zipname)
                                    ).then(async download =>
                                        File.downloadFile(await download.blob(), fromLastIndexOf(zipname, '/', '\\'))
                                    );
                                } else if (result.system) {
                                    (this.userSettings.showErrorMessages ? alert : console.log)(
                                        result.application + '\n\n' + result.system
                                    );
                                }
                            }
                            return result;
                        });
                }
            } else {
                (this.userSettings.showErrorMessages ? alert : console.log)(
                    'SERVER (required): See README for instructions'
                );
            }
            return frameworkNotInstalled$1();
        }
        createRequestBody(assets, options) {
            const body = assets ? assets.concat(this.assets) : this.assets;
            const asset = body[0];
            if (asset) {
                if (options.exclusions) {
                    asset.exclusions = options.exclusions;
                }
                const dataMap = this.getDataMap(options);
                if (dataMap) {
                    asset.dataMap = dataMap;
                }
                return body;
            }
            return undefined;
        }
        hasHttpProtocol() {
            return (this._hostname || location.protocol).startsWith('http');
        }
        set hostname(value) {
            if (value === null || value === void 0 ? void 0 : value.startsWith('http')) {
                this._hostname = trimEnd(value, '/');
            }
        }
        get hostname() {
            return this._hostname || location.origin;
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
        hasBit: hasBit$1,
        hasValue,
        isNumber,
        isObject: isObject$1,
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
                if (!isObject$1(obj)) {
                    obj = {};
                    data[name] = obj;
                }
                if (overwrite || obj[attr] === undefined) {
                    obj[attr] = value;
                }
            }
            const stored = data[name];
            return isObject$1(stored) ? stored[attr] : undefined;
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
                if (attrs.some(value => hasBit$1(CSS_PROPERTIES$1[value].trait, 4 /* LAYOUT */))) {
                    parent = (this.pageFlow && this.ascend({ condition: item => item.documentRoot })[0]) || this;
                } else if (attrs.some(value => hasBit$1(CSS_PROPERTIES$1[value].trait, 8 /* CONTAIN */))) {
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
                        (hasBit$1(type, 1 /* LENGTH */) && isLength(value)) ||
                        (hasBit$1(type, 2 /* PERCENT */) && isPercent(value)) ||
                        (hasBit$1(type, 4 /* TIME */) && isTime(value)) ||
                        (hasBit$1(type, 8 /* ANGLE */) && isAngle(value))
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

    const { extractURL } = squared.lib.css;
    const { STRING: STRING$1 } = squared.lib.regex;
    const { fromLastIndexOf: fromLastIndexOf$1, fromMimeType, hasMimeType, randomUUID } = squared.lib.util;
    const REGEXP_DATAURI$1 = new RegExp(`^${STRING$1.DATAURI}$`);
    class Resource {
        reset() {
            var _a;
            const ASSETS = Resource.ASSETS;
            for (const name in ASSETS) {
                ASSETS[name].clear();
            }
            (_a = this._fileHandler) === null || _a === void 0 ? void 0 : _a.reset();
        }
        addImage(element) {
            if (element.complete) {
                const uri = element.src;
                if (uri.startsWith('data:image/')) {
                    const match = REGEXP_DATAURI$1.exec(uri);
                    if (match) {
                        const mimeType = match[1].trim().split(/\s*;\s*/);
                        this.addRawData(uri, mimeType[0], match[2], {
                            encoding: mimeType[1] || 'base64',
                            width: element.naturalWidth,
                            height: element.naturalHeight,
                        });
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
            } else {
                fonts.set(fontFamily, [data]);
            }
        }
        addRawData(uri, mimeType, content, options) {
            let filename, encoding, data, width, height;
            if (options) {
                ({ filename, encoding, data, width, height } = options);
                if (encoding) {
                    encoding = encoding.toLowerCase();
                }
            }
            let base64;
            mimeType = mimeType.toLowerCase();
            if (encoding === 'base64') {
                if (content) {
                    if (mimeType === 'image/svg+xml') {
                        content = window.atob(content);
                    } else {
                        base64 = content;
                    }
                } else if (data) {
                    base64 = data;
                } else {
                    return '';
                }
            } else {
                if (content) {
                    content = content.replace(/\\(["'])/g, (match, ...capture) => capture[0]);
                } else if (!Array.isArray(data)) {
                    return '';
                }
            }
            const imageMimeType = this.mimeTypeMap.image;
            if (imageMimeType === '*' || imageMimeType.includes(mimeType)) {
                if (!filename) {
                    const ext = '.' + (fromMimeType(mimeType) || 'unknown');
                    filename = uri.endsWith(ext) ? fromLastIndexOf$1(uri, '/', '\\') : this.randomUUID + ext;
                }
                Resource.ASSETS.rawData.set(uri, {
                    pathname: uri.startsWith(location.origin)
                        ? uri.substring(location.origin.length + 1, uri.lastIndexOf('/'))
                        : '',
                    filename,
                    content,
                    base64,
                    mimeType,
                    bytes: data,
                    width,
                    height,
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
                return font.find(
                    item =>
                        fontStyle.startsWith(item.fontStyle) &&
                        (!fontWeight || item.fontWeight === parseInt(fontWeight)) &&
                        (hasMimeType(mimeType, item.srcFormat) || (item.srcUrl && hasMimeType(mimeType, item.srcUrl)))
                );
            }
            return undefined;
        }
        getRawData(uri) {
            if (uri.startsWith('url(')) {
                const url = extractURL(uri);
                if (!url) {
                    return undefined;
                }
                uri = url;
            }
            return Resource.ASSETS.rawData.get(uri);
        }
        addUnsafeData(name, uri, data) {
            Resource.ASSETS[name].set(uri, data);
        }
        set fileHandler(value) {
            if (value) {
                value.resource = this;
            }
            this._fileHandler = value;
        }
        get fileHandler() {
            return this._fileHandler;
        }
        get controllerSettings() {
            return this.application.controllerHandler.localSettings;
        }
        get mimeTypeMap() {
            return this.controllerSettings.mimeType;
        }
        get randomUUID() {
            return randomUUID();
        }
        get mapOfAssets() {
            return Resource.ASSETS;
        }
    }
    Resource.KEY_NAME = 'squared.resource';
    Resource.ASSETS = {
        fonts: new Map(),
        image: new Map(),
        video: new Map(),
        audio: new Map(),
        rawData: new Map(),
    };
    Resource.canCompressImage = (filename, mimeType) =>
        /\.(png|jpg|jpeg)$/i.test(filename) || mimeType === 'image/png' || mimeType === 'image/jpeg';
    Resource.getExtension = value => {
        var _a;
        return ((_a = /\.(\w+)\s*$/.exec(value)) === null || _a === void 0 ? void 0 : _a[1]) || '';
    };

    var APP_SECTION;
    (function (APP_SECTION) {
        APP_SECTION[(APP_SECTION['DOM_TRAVERSE'] = 1)] = 'DOM_TRAVERSE';
        APP_SECTION[(APP_SECTION['EXTENSION'] = 2)] = 'EXTENSION';
        APP_SECTION[(APP_SECTION['RENDER'] = 4)] = 'RENDER';
        APP_SECTION[(APP_SECTION['ALL'] = 7)] = 'ALL';
    })(APP_SECTION || (APP_SECTION = {}));
    var NODE_RESOURCE;
    (function (NODE_RESOURCE) {
        NODE_RESOURCE[(NODE_RESOURCE['BOX_STYLE'] = 1)] = 'BOX_STYLE';
        NODE_RESOURCE[(NODE_RESOURCE['BOX_SPACING'] = 2)] = 'BOX_SPACING';
        NODE_RESOURCE[(NODE_RESOURCE['FONT_STYLE'] = 4)] = 'FONT_STYLE';
        NODE_RESOURCE[(NODE_RESOURCE['VALUE_STRING'] = 8)] = 'VALUE_STRING';
        NODE_RESOURCE[(NODE_RESOURCE['IMAGE_SOURCE'] = 16)] = 'IMAGE_SOURCE';
        NODE_RESOURCE[(NODE_RESOURCE['ASSET'] = 28)] = 'ASSET';
        NODE_RESOURCE[(NODE_RESOURCE['ALL'] = 31)] = 'ALL';
    })(NODE_RESOURCE || (NODE_RESOURCE = {}));
    var NODE_PROCEDURE;
    (function (NODE_PROCEDURE) {
        NODE_PROCEDURE[(NODE_PROCEDURE['CONSTRAINT'] = 1)] = 'CONSTRAINT';
        NODE_PROCEDURE[(NODE_PROCEDURE['LAYOUT'] = 2)] = 'LAYOUT';
        NODE_PROCEDURE[(NODE_PROCEDURE['ALIGNMENT'] = 4)] = 'ALIGNMENT';
        NODE_PROCEDURE[(NODE_PROCEDURE['ACCESSIBILITY'] = 8)] = 'ACCESSIBILITY';
        NODE_PROCEDURE[(NODE_PROCEDURE['LOCALIZATION'] = 16)] = 'LOCALIZATION';
        NODE_PROCEDURE[(NODE_PROCEDURE['CUSTOMIZATION'] = 32)] = 'CUSTOMIZATION';
        NODE_PROCEDURE[(NODE_PROCEDURE['ALL'] = 63)] = 'ALL';
    })(NODE_PROCEDURE || (NODE_PROCEDURE = {}));

    var enumeration = /*#__PURE__*/ Object.freeze({
        __proto__: null,
        get APP_SECTION() {
            return APP_SECTION;
        },
        get NODE_RESOURCE() {
            return NODE_RESOURCE;
        },
        get NODE_PROCEDURE() {
            return NODE_PROCEDURE;
        },
    });

    const { CSS_PROPERTIES: CSS_PROPERTIES$2 } = squared.lib.css;
    const { equal } = squared.lib.math;
    const { getElementAsNode: getElementAsNode$1 } = squared.lib.session;
    const {
        capitalize: capitalize$1,
        cloneObject,
        convertWord,
        hasBit: hasBit$2,
        hasKeys,
        isArray,
        iterateArray: iterateArray$1,
        safeNestedMap,
        searchObject,
        withinRange,
    } = squared.lib.util;
    const CSS_SPACING = new Map();
    const SPACING_MARGIN = [1 /* MARGIN_TOP */, 2 /* MARGIN_RIGHT */, 4 /* MARGIN_BOTTOM */, 8 /* MARGIN_LEFT */];
    const BOX_MARGIN = CSS_PROPERTIES$2.margin.value;
    const SPACING_PADDING = [
        16 /* PADDING_TOP */,
        32 /* PADDING_RIGHT */,
        64 /* PADDING_BOTTOM */,
        128 /* PADDING_LEFT */,
    ];
    const BOX_PADDING = CSS_PROPERTIES$2.padding.value;
    for (let i = 0; i < 4; ++i) {
        CSS_SPACING.set(SPACING_MARGIN[i], BOX_MARGIN[i]);
        CSS_SPACING.set(SPACING_PADDING[i], BOX_PADDING[i]);
    }
    function cascadeActualPadding(children, attr, value) {
        let valid = false;
        const length = children.length;
        let i = 0;
        while (i < length) {
            const item = children[i++];
            if (item.blockStatic) {
                return false;
            } else if (item.inlineStatic) {
                if (item.has('lineHeight') && item.lineHeight > item.bounds.height) {
                    return false;
                } else if (item[attr] >= value) {
                    valid = true;
                } else if (canCascadeChildren(item)) {
                    if (!cascadeActualPadding(item.naturalChildren, attr, value)) {
                        return false;
                    } else {
                        valid = true;
                    }
                }
            }
        }
        return valid;
    }
    function traverseElementSibling(element, direction, sessionId, options) {
        let floating, pageFlow, lineBreak, excluded;
        if (options) {
            ({ floating, pageFlow, lineBreak, excluded } = options);
        }
        const result = [];
        while (element !== null) {
            const node = getElementAsNode$1(element, sessionId);
            if (node) {
                if (
                    (lineBreak !== false && node.lineBreak) ||
                    (excluded !== false && node.excluded && !node.lineBreak)
                ) {
                    result.push(node);
                } else if (node.pageFlow && !node.excluded) {
                    if (pageFlow === false) {
                        break;
                    }
                    result.push(node);
                    if (
                        floating !== false ||
                        (!node.floating && (node.visible || node.rendered) && node.display !== 'none')
                    ) {
                        break;
                    }
                }
            }
            element = element[direction];
        }
        return result;
    }
    function applyBoxReset(node, boxReset, attrs, spacing, region, other) {
        for (let i = 0; i < 4; ++i) {
            const key = spacing[i];
            if (hasBit$2(region, key)) {
                const name = attrs[i];
                boxReset[name] = 1;
                if (other) {
                    const previous = node.registerBox(key);
                    if (previous) {
                        previous.resetBox(key, other);
                    } else {
                        if (node.naturalChild) {
                            const value = node[name];
                            if (value >= 0) {
                                other.modifyBox(key, value);
                            }
                        }
                        node.transferBox(key, other);
                    }
                }
            }
        }
    }
    function applyBoxAdjustment(node, boxAdjustment, attrs, spacing, region, other) {
        for (let i = 0; i < 4; ++i) {
            const key = spacing[i];
            if (hasBit$2(region, key)) {
                const previous = node.registerBox(key);
                if (previous) {
                    previous.transferBox(key, other);
                } else {
                    const name = attrs[i];
                    const value = boxAdjustment[name];
                    if (value !== 0) {
                        other.modifyBox(key, value, false);
                        boxAdjustment[name] = 0;
                    }
                    node.registerBox(key, other);
                }
            }
        }
    }
    function setOverflow(node) {
        let result = 0;
        if (node.scrollElement) {
            const element = node.element;
            const [overflowX, overflowY] = node.cssAsTuple('overflowX', 'overflowY');
            if (
                node.hasHeight &&
                (node.hasPX('height') || node.hasPX('maxHeight')) &&
                (overflowY === 'scroll' || (overflowY === 'auto' && element.clientHeight !== element.scrollHeight))
            ) {
                result |= 8 /* VERTICAL */;
            }
            if (
                (node.hasPX('width') || node.hasPX('maxWidth')) &&
                (overflowX === 'scroll' || (overflowX === 'auto' && element.clientWidth !== element.scrollWidth))
            ) {
                result |= 4 /* HORIZONTAL */;
            }
        }
        return result;
    }
    function getExclusionValue(enumeration, offset, value) {
        if (value) {
            for (const name of value.split('|')) {
                const i = enumeration[name.trim().toUpperCase()] || 0;
                if (i > 0 && !hasBit$2(offset, i)) {
                    offset |= i;
                }
            }
        }
        return offset;
    }
    const canCascadeChildren = node => node.naturalElements.length > 0 && !node.layoutElement && !node.tableElement;
    const checkBlockDimension = (node, previous) =>
        node.blockDimension &&
        Math.ceil(node.bounds.top) >= previous.bounds.bottom &&
        (node.blockVertical || previous.blockVertical || node.percentWidth > 0 || previous.percentWidth > 0);
    const getPercentWidth = node => (node.inlineDimension && !node.hasPX('maxWidth') ? node.percentWidth : -Infinity);
    const getLayoutWidth = node => node.actualWidth + Math.max(node.marginLeft, 0) + node.marginRight;
    class NodeUI extends Node {
        constructor() {
            super(...arguments);
            this.alignmentType = 0;
            this.rendered = false;
            this.excluded = false;
            this.rootElement = false;
            this.floatContainer = false;
            this.lineBreakLeading = false;
            this.lineBreakTrailing = false;
            this.baselineActive = false;
            this.baselineAltered = false;
            this.visible = true;
            this._preferInitial = true;
            this._excludeSection = 0;
            this._excludeProcedure = 0;
            this._excludeResource = 0;
            this._childIndex = Infinity;
            this._containerIndex = Infinity;
            this._renderAs = null;
            this._locked = {};
        }
        static justified(node) {
            if (node.naturalChild && node.cssAscend('textAlign') === 'justify') {
                let inlineWidth = 0;
                const { box, naturalChildren } = node.actualParent;
                const length = naturalChildren.length;
                let i = 0;
                while (i < length) {
                    const item = naturalChildren[i++];
                    if (!item.inlineVertical) {
                        inlineWidth = NaN;
                        break;
                    } else {
                        inlineWidth += item.linear.width;
                    }
                }
                if (Math.floor(inlineWidth) > box.width) {
                    return true;
                }
            }
            return false;
        }
        static refitScreen(node, value) {
            const { width: screenWidth, height: screenHeight } = node.localSettings.screenDimension;
            let { width, height } = value;
            if (width > screenWidth) {
                height = Math.round((height * screenWidth) / width);
                width = screenWidth;
            } else if (height > screenHeight) {
                width = Math.round((width * screenHeight) / height);
                height = screenHeight;
            } else {
                return value;
            }
            return { width, height };
        }
        static outerRegion(node) {
            let top = Infinity,
                right = -Infinity,
                bottom = -Infinity,
                left = Infinity,
                negativeRight = -Infinity,
                negativeBottom = -Infinity,
                actualTop,
                actualRight,
                actualBottom,
                actualLeft;
            node.each(item => {
                if (item.companion) {
                    actualTop = item.actualRect('top');
                    actualRight = item.actualRect('right');
                    actualBottom = item.actualRect('bottom');
                    actualLeft = item.actualRect('left');
                } else {
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
                height: Math.max(bottom, negativeBottom) - top,
            };
        }
        static baseline(list, text = false) {
            const result = [];
            const length = list.length;
            let i = 0;
            while (i < length) {
                const item = list[i++];
                if (item.baseline && (!text || item.textElement) && !item.baselineAltered) {
                    if (item.naturalElements.length > 0) {
                        if (item.baselineElement) {
                            result.push(item);
                        }
                    } else {
                        result.push(item);
                    }
                }
            }
            if (result.length > 1) {
                result.sort((a, b) => {
                    if (a.length > 0 && b.length === 0) {
                        return 1;
                    } else if (b.length > 0 && a.length === 0) {
                        return -1;
                    }
                    const heightA = a.baselineHeight + a.marginBottom;
                    const heightB = b.baselineHeight + b.marginBottom;
                    if (!equal(heightA, heightB)) {
                        return heightA > heightB ? -1 : 1;
                    } else if (a.textElement && b.textElement) {
                        if (!a.pseudoElement && b.pseudoElement) {
                            return -1;
                        } else if (a.pseudoElement && !b.pseudoElement) {
                            return 1;
                        } else if (!a.plainText && b.plainText) {
                            return -1;
                        } else if (a.plainText && !b.plainText) {
                            return 1;
                        }
                    } else if (a.inputElement && b.inputElement && a.containerType !== b.containerType) {
                        return a.containerType > b.containerType ? -1 : 1;
                    } else if (b.textElement && a.inputElement && b.childIndex < a.childIndex) {
                        return 1;
                    } else if (a.textElement && b.inputElement && a.childIndex < b.childIndex) {
                        return -1;
                    }
                    const bottomA = a.bounds.bottom;
                    const bottomB = b.bounds.bottom;
                    if (bottomA > bottomB) {
                        return -1;
                    } else if (bottomA < bottomB) {
                        return 1;
                    }
                    return 0;
                });
            }
            return result[0] || null;
        }
        static linearData(list, cleared) {
            const floated = new Set();
            let linearX = false,
                linearY = false;
            const length = list.length;
            if (length > 1) {
                const nodes = new Array(length);
                let i = 0,
                    n = 0;
                while (i < length) {
                    const item = list[i++];
                    if (item.pageFlow) {
                        if (item.floating) {
                            floated.add(item.float);
                        }
                        nodes[n++] = item;
                    } else if (item.autoPosition) {
                        nodes[n++] = item;
                    }
                }
                if (n) {
                    nodes.length = n;
                    const floating = floated.size > 0;
                    const siblings = [nodes[0]];
                    let x = 1,
                        y = 1;
                    i = 1;
                    while (i < n) {
                        const node = nodes[i++];
                        if (node.alignedVertically(siblings, floating ? cleared : undefined) > 0) {
                            ++y;
                        } else {
                            ++x;
                        }
                        if (x > 1 && y > 1) {
                            break;
                        }
                        siblings.push(node);
                    }
                    linearX = x === n;
                    linearY = y === n;
                    if (linearX && floating) {
                        let boxLeft = Infinity,
                            boxRight = -Infinity;
                        let floatLeft = -Infinity,
                            floatRight = Infinity;
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
                        let j = 0,
                            k = 0,
                            l = 0,
                            m = 0;
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
                            if (
                                withinRange(left, previous.linear.left) ||
                                (previous.floating && Math.ceil(node.bounds.top) >= previous.bounds.bottom)
                            ) {
                                linearX = false;
                                break;
                            }
                        }
                    }
                }
            } else if (length > 0) {
                linearY = list[0].blockStatic;
                linearX = !linearY;
            }
            return { linearX, linearY, floated, cleared };
        }
        static partitionRows(list, cleared) {
            const result = [];
            let row = [],
                siblings = [];
            const length = list.length;
            let i = 0;
            while (i < length) {
                const node = list[i++];
                let active = node;
                if (!node.naturalChild) {
                    if (node.nodeGroup) {
                        if (row.length > 0) {
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
                } else if (active.alignedVertically(siblings, cleared) > 0) {
                    if (row.length > 0) {
                        result.push(row);
                    }
                    row = [node];
                    siblings = [active];
                } else {
                    row.push(node);
                    siblings.push(active);
                }
            }
            if (row.length > 0) {
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
            const obj = this.namespace(name);
            if (value) {
                if (overwrite && this.lockedAttr(name, attr)) {
                    overwrite = false;
                }
                if (!overwrite && obj[attr]) {
                    return obj[attr];
                } else {
                    obj[attr] = value;
                    return value;
                }
            }
            return obj[attr] || '';
        }
        delete(name, ...attrs) {
            const obj = this._namespaces[name];
            if (obj) {
                let i = 0;
                while (i < attrs.length) {
                    const attr = attrs[i++];
                    if (attr.includes('*')) {
                        for (const [key] of searchObject(obj, attr)) {
                            delete obj[key];
                        }
                    } else {
                        delete obj[attr];
                    }
                }
            }
        }
        namespace(name) {
            const result = this._namespaces[name];
            return result === undefined ? (this._namespaces[name] = {}) : result;
        }
        namespaces() {
            return Object.entries(this._namespaces);
        }
        unsafe(name, value) {
            if (value !== undefined) {
                this['_' + name] = value;
            }
            return this['_' + name];
        }
        unset(name) {
            delete this['_' + name];
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
        parseUnit(value, options = {}) {
            if (!options.screenDimension) {
                options.screenDimension = this.localSettings.screenDimension;
            }
            return super.parseUnit(value, options);
        }
        parseWidth(value, parent = true) {
            return super.parseUnit(value, { parent, screenDimension: this.localSettings.screenDimension });
        }
        parseHeight(value, parent = true) {
            return super.parseUnit(value, {
                dimension: 'height',
                parent,
                screenDimension: this.localSettings.screenDimension,
            });
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
            if (options === null || options === void 0 ? void 0 : options.remove) {
                this.removeTry(options);
            }
            this.rendered = true;
            this.visible = false;
        }
        inherit(node, ...modules) {
            let result;
            let i = 0;
            while (i < modules.length) {
                switch (modules[i++]) {
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
                        result = node.unsafe('initial');
                        if (result) {
                            this.inheritApply('initial', result);
                        }
                        break;
                    case 'alignment': {
                        this.cssCopy(node, 'position', 'display', 'verticalAlign', 'float', 'clear', 'zIndex');
                        if (!this.positionStatic) {
                            let j = 0;
                            while (j < 4) {
                                const attr = NodeUI.BOX_POSITION[j++];
                                if (node.hasPX(attr)) {
                                    this._styleMap[attr] = node.css(attr);
                                }
                            }
                        }
                        Object.assign(this.autoMargin, node.autoMargin);
                        this.autoPosition = node.autoPosition;
                        break;
                    }
                    case 'styleMap':
                        this.cssCopyIfEmpty(node, ...Object.keys(node.unsafe('styleMap')));
                        break;
                    case 'textStyle':
                        result = node.textStyle;
                        this.inheritApply('textStyle', result);
                        break;
                    case 'boxStyle': {
                        result = node.cssAsObject(
                            'backgroundRepeat',
                            'backgroundSize',
                            'backgroundPositionX',
                            'backgroundPositionY',
                            'backgroundClip',
                            'boxSizing',
                            'borderTopWidth',
                            'borderRightWidth',
                            'borderBottomWidth',
                            'borderLeftWidth',
                            'borderTopColor',
                            'borderRightColor',
                            'borderBottomColor',
                            'borderLeftColor',
                            'borderTopStyle',
                            'borderRightStyle',
                            'borderBottomStyle',
                            'borderLeftStyle',
                            'borderTopLeftRadius',
                            'borderTopRightRadius',
                            'borderBottomRightRadius',
                            'borderBottomLeftRadius'
                        );
                        Object.assign(result, {
                            backgroundColor: node.backgroundColor,
                            backgroundImage: node.backgroundImage,
                            border: 'inherit',
                            borderRadius: 'inherit',
                        });
                        this.inheritApply('boxStyle', result);
                        this.setCacheValue('visibleStyle', undefined);
                        node.setCacheValue('backgroundColor', '');
                        node.setCacheValue('backgroundImage', '');
                        node.cssApply({
                            backgroundColor: 'transparent',
                            backgroundImage: 'none',
                            border: 'initial',
                            borderRadius: 'initial',
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
            }
            return result;
        }
        inheritApply(module, data) {
            switch (module) {
                case 'initial':
                    cloneObject(data, this.initial);
                    break;
                case 'textStyle':
                    this.cssApply(data);
                    this.setCacheValue('fontSize', parseFloat(data.fontSize));
                    break;
                case 'boxStyle':
                    this.cssApply(data);
                    this.unsetCache('borderTopWidth', 'borderBottomWidth', 'borderRightWidth', 'borderLeftWidth');
                    this.setCacheValue('backgroundColor', data.backgroundColor);
                    this.setCacheValue('backgroundImage', data.backgroundImage);
                    break;
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
            if (this.naturalElement) {
                const dataset = this._element.dataset;
                if (hasKeys(dataset)) {
                    const systemName = capitalize$1(this.localSettings.systemName);
                    this._excludeResource = getExclusionValue(
                        NODE_RESOURCE,
                        this._excludeResource,
                        dataset['excludeResource' + systemName] || dataset.excludeResource
                    );
                    this._excludeProcedure = getExclusionValue(
                        NODE_PROCEDURE,
                        this._excludeProcedure,
                        dataset['excludeProcedure' + systemName] || dataset.excludeProcedure
                    );
                    this._excludeSection = getExclusionValue(
                        APP_SECTION,
                        this._excludeSection,
                        dataset['excludeSection' + systemName] || dataset.excludeSection
                    );
                    if (this.length) {
                        const resource = getExclusionValue(
                            NODE_RESOURCE,
                            0,
                            dataset['excludeResourceChild' + systemName] || dataset.excludeResourceChild
                        );
                        const procedure = getExclusionValue(
                            NODE_PROCEDURE,
                            0,
                            dataset['excludeProcedureChild' + systemName] || dataset.excludeProcedureChild
                        );
                        const section = getExclusionValue(
                            APP_SECTION,
                            0,
                            dataset['excludeSectionChild' + systemName] || dataset.excludeSectionChild
                        );
                        if (resource > 0 || procedure > 0 || section > 0) {
                            const data = { resource, procedure, section };
                            this.each(node => node.exclude(data));
                        }
                    }
                }
            }
        }
        replaceTry(options) {
            var _a;
            const { child, replaceWith } = options;
            const children = this.children;
            const length = children.length;
            for (let i = 0; i < length; ++i) {
                const item = children[i];
                if (item === child || item === child.outerMostWrapper) {
                    (_a = replaceWith.parent) === null || _a === void 0 ? void 0 : _a.remove(replaceWith);
                    if (replaceWith.naturalChild && this.naturalElement) {
                        replaceWith.actualParent.naturalChildren.splice(replaceWith.childIndex, 1);
                        this.naturalChildren.splice(child.childIndex, 1, replaceWith);
                        replaceWith.init(this, child.depth, child.childIndex);
                    } else {
                        replaceWith.unsafe('parent', this);
                        replaceWith.depth = child.depth;
                    }
                    children[i] = replaceWith;
                    replaceWith.containerIndex = child.containerIndex;
                    return true;
                }
            }
            if (options.notFoundAppend) {
                replaceWith.parent = this;
                return true;
            }
            return false;
        }
        removeTry(options) {
            var _a, _b, _c;
            const renderParent = this.renderParent;
            if (renderParent) {
                const { renderTemplates, renderChildren } = renderParent;
                if (renderTemplates) {
                    const index = renderChildren.findIndex(node => node === this);
                    if (index !== -1) {
                        const template = renderTemplates[index];
                        if (template.node === this) {
                            const replaceWith = options === null || options === void 0 ? void 0 : options.replaceWith;
                            if (replaceWith) {
                                const replaceParent = replaceWith.renderParent;
                                if (replaceParent) {
                                    const replaceTemplates = replaceParent.renderTemplates;
                                    if (replaceTemplates) {
                                        const replaceIndex = replaceTemplates.findIndex(
                                            item => item.node === replaceWith
                                        );
                                        if (replaceIndex !== -1) {
                                            (_b = (_a = options).beforeReplace) === null || _b === void 0
                                                ? void 0
                                                : _b.call(_a, this, replaceWith);
                                            renderChildren[index] = replaceWith;
                                            renderTemplates[index] = replaceTemplates[replaceIndex];
                                            replaceTemplates.splice(replaceIndex, 1);
                                            replaceParent.renderChildren.splice(replaceIndex, 1);
                                            replaceWith.renderParent = renderParent;
                                            if (this.documentRoot) {
                                                replaceWith.documentRoot = true;
                                                this.documentRoot = false;
                                            }
                                            replaceWith.depth = this.depth;
                                            this.renderParent = undefined;
                                            return template;
                                        }
                                    }
                                }
                            } else {
                                (_c = options === null || options === void 0 ? void 0 : options.beforeReplace) ===
                                    null || _c === void 0
                                    ? void 0
                                    : _c.call(options, this, undefined);
                                renderChildren.splice(index, 1);
                                this.renderParent = undefined;
                                return renderTemplates.splice(index, 1)[0];
                            }
                        }
                    }
                }
            }
            return undefined;
        }
        sort(predicate) {
            if (predicate) {
                super.sort(predicate);
            } else {
                this.children.sort((a, b) => (a.containerIndex < b.containerIndex ? -1 : 1));
            }
            return this;
        }
        alignedVertically(siblings, cleared, horizontal) {
            if (this.lineBreak) {
                return 2 /* LINEBREAK */;
            } else if (!this.pageFlow) {
                if (this.autoPosition) {
                    if (!siblings) {
                        siblings = this.siblingsLeading;
                    }
                    const length = siblings.length;
                    let i = length - 1;
                    while (i >= 0) {
                        const previous = siblings[i--];
                        if (previous.pageFlow) {
                            return previous.blockStatic ||
                                (cleared === null || cleared === void 0 ? void 0 : cleared.has(previous))
                                ? 1 /* VERTICAL */
                                : 0 /* HORIZONTAL */;
                        }
                    }
                    return 0 /* HORIZONTAL */;
                }
                return 1 /* VERTICAL */;
            } else {
                const floating = this.floating;
                if (isArray(siblings)) {
                    const previous = siblings[siblings.length - 1];
                    if (cleared) {
                        if (
                            cleared.size > 0 &&
                            (cleared.has(this) || this.siblingsLeading.some(item => item.excluded && cleared.has(item)))
                        ) {
                            return 4 /* FLOAT_CLEAR */;
                        } else {
                            if (floating && previous.floating) {
                                if (
                                    (horizontal && this.float === previous.float) ||
                                    Math.floor(this.bounds.top) === Math.floor(previous.bounds.top)
                                ) {
                                    return 0 /* HORIZONTAL */;
                                } else if (Math.ceil(this.bounds.top) >= previous.bounds.bottom) {
                                    if (siblings.every(item => item.inlineDimension)) {
                                        const actualParent = this.actualParent;
                                        if (
                                            actualParent &&
                                            actualParent.ascend({
                                                condition: item => !item.inline && item.hasWidth,
                                                error: item => item.layoutElement,
                                                startSelf: true,
                                            })
                                        ) {
                                            const length = siblings.length;
                                            if (
                                                actualParent.naturalChildren.filter(
                                                    item => item.visible && item.pageFlow
                                                ).length ===
                                                length + 1
                                            ) {
                                                let width = actualParent.box.width - getLayoutWidth(this);
                                                let i = 0;
                                                while (i < length) {
                                                    width -= getLayoutWidth(siblings[i++]);
                                                }
                                                if (width >= 0) {
                                                    return 0 /* HORIZONTAL */;
                                                }
                                            }
                                        }
                                    }
                                    return 6 /* FLOAT_WRAP */;
                                }
                            } else if (
                                this.blockStatic &&
                                siblings.reduce((a, b) => a + (b.floating ? b.linear.width : -Infinity), 0) /
                                    this.actualParent.box.width >=
                                    0.8
                            ) {
                                return 7 /* FLOAT_INTERSECT */;
                            } else if (
                                siblings.every(
                                    item => item.inlineDimension && Math.ceil(this.bounds.top) >= item.bounds.bottom
                                )
                            ) {
                                return 5 /* FLOAT_BLOCK */;
                            } else if (horizontal !== undefined) {
                                if (floating && !horizontal && previous.blockStatic) {
                                    return 0 /* HORIZONTAL */;
                                } else if (!this.display.startsWith('inline-')) {
                                    let { top, bottom } = this.bounds;
                                    if (
                                        this.textElement &&
                                        cleared.size > 0 &&
                                        siblings.some(item => cleared.has(item)) &&
                                        siblings.some(
                                            item =>
                                                Math.floor(top) < item.bounds.top &&
                                                Math.ceil(bottom) > item.bounds.bottom
                                        )
                                    ) {
                                        return 7 /* FLOAT_INTERSECT */;
                                    } else if (siblings[0].floating) {
                                        const length = siblings.length;
                                        if (length > 1) {
                                            const float = siblings[0].float;
                                            let maxBottom = -Infinity,
                                                contentWidth = 0;
                                            let i = 0;
                                            while (i < length) {
                                                const item = siblings[i++];
                                                if (item.floating) {
                                                    if (item.float === float) {
                                                        maxBottom = Math.max(
                                                            item.actualRect('bottom', 'bounds'),
                                                            maxBottom
                                                        );
                                                    }
                                                    contentWidth += item.linear.width;
                                                }
                                            }
                                            if (Math.ceil(contentWidth) >= this.actualParent.box.width) {
                                                return 5 /* FLOAT_BLOCK */;
                                            } else if (this.multiline) {
                                                if (this.styleText) {
                                                    const textBounds = this.textBounds;
                                                    if (textBounds) {
                                                        bottom = textBounds.bottom;
                                                    }
                                                }
                                                const offset = bottom - maxBottom;
                                                top =
                                                    offset <= 0 || offset / (bottom - top) < 0.5 ? -Infinity : Infinity;
                                            } else {
                                                top = Math.ceil(top);
                                            }
                                            if (top < Math.floor(maxBottom)) {
                                                return horizontal ? 0 /* HORIZONTAL */ : 5 /* FLOAT_BLOCK */;
                                            } else {
                                                return horizontal ? 5 /* FLOAT_BLOCK */ : 0 /* HORIZONTAL */;
                                            }
                                        } else if (!horizontal) {
                                            return 5 /* FLOAT_BLOCK */;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (checkBlockDimension(this, previous)) {
                        return 3 /* INLINE_WRAP */;
                    } else {
                        const percentWidth = getPercentWidth(this);
                        if (percentWidth > 0 && siblings.reduce((a, b) => a + getPercentWidth(b), percentWidth) > 1) {
                            return 8 /* PERCENT_WRAP */;
                        }
                    }
                }
                const blockStatic = this.blockStatic || this.display === 'table';
                const length = this.siblingsLeading.length;
                if (blockStatic && (length === 0 || this.containerIndex === 0)) {
                    return 1 /* VERTICAL */;
                }
                for (let i = length - 1; i >= 0; --i) {
                    const previous = this.siblingsLeading[i];
                    if (
                        previous.excluded &&
                        (cleared === null || cleared === void 0 ? void 0 : cleared.has(previous))
                    ) {
                        return 4 /* FLOAT_CLEAR */;
                    } else if (
                        previous.blockStatic ||
                        previous.autoMargin.leftRight ||
                        ((horizontal === false || (floating && previous.childIndex === 0)) &&
                            previous.plainText &&
                            previous.multiline)
                    ) {
                        return 1 /* VERTICAL */;
                    } else if (
                        blockStatic &&
                        (!previous.floating ||
                            (cleared === null || cleared === void 0 ? void 0 : cleared.has(previous)) ||
                            (i === length - 1 && !previous.pageFlow))
                    ) {
                        return 1 /* VERTICAL */;
                    } else if (previous.floating) {
                        if (previous.float === 'left') {
                            if (this.autoMargin.right) {
                                return 5 /* FLOAT_BLOCK */;
                            }
                        } else if (this.autoMargin.left) {
                            return 5 /* FLOAT_BLOCK */;
                        }
                        if (
                            this.floatContainer &&
                            this.some(item => item.floating && Math.ceil(item.bounds.top) >= previous.bounds.bottom)
                        ) {
                            return 5 /* FLOAT_BLOCK */;
                        }
                    }
                    if (checkBlockDimension(this, previous)) {
                        return 3 /* INLINE_WRAP */;
                    }
                }
                return 0 /* HORIZONTAL */;
            }
        }
        previousSiblings(options) {
            var _a;
            const node = this.innerMostWrapped;
            return options
                ? traverseElementSibling(
                      (_a = node.element) === null || _a === void 0 ? void 0 : _a.previousSibling,
                      'previousSibling',
                      this.sessionId,
                      options
                  )
                : node.siblingsLeading;
        }
        nextSiblings(options) {
            var _a;
            const node = this.innerMostWrapped;
            return options
                ? traverseElementSibling(
                      (_a = node.element) === null || _a === void 0 ? void 0 : _a.nextSibling,
                      'nextSibling',
                      this.sessionId,
                      options
                  )
                : node.siblingsTrailing;
        }
        modifyBox(region, offset, negative = true) {
            var _a;
            if (offset !== 0) {
                const attr = CSS_SPACING.get(region);
                if (attr) {
                    const node = (_a = this._boxRegister) === null || _a === void 0 ? void 0 : _a[region];
                    if (offset === undefined) {
                        if (node) {
                            const value = this[attr] || node.getBox(region)[1];
                            if (value > 0) {
                                node.modifyBox(region, -value, negative);
                            }
                        } else {
                            this._boxReset[attr] = 1;
                        }
                    } else if (node) {
                        node.modifyBox(region, offset, negative);
                    } else {
                        const boxAdjustment = this._boxAdjustment;
                        if (
                            !negative &&
                            (this._boxReset[attr] === 0 ? this[attr] : 0) + boxAdjustment[attr] + offset <= 0
                        ) {
                            boxAdjustment[attr] = 0;
                            if (this[attr] >= 0 && offset < 0) {
                                this._boxReset[attr] = 1;
                            }
                        } else {
                            boxAdjustment[attr] += offset;
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
            var _a;
            const attr = CSS_SPACING.get(region);
            if (attr) {
                const node = (_a = this._boxRegister) === null || _a === void 0 ? void 0 : _a[region];
                if (node) {
                    node.setBox(region, options);
                } else {
                    const { reset, adjustment } = options;
                    const boxReset = this._boxReset;
                    const boxAdjustment = this._boxAdjustment;
                    if (reset !== undefined) {
                        boxReset[attr] = reset;
                    }
                    if (adjustment !== undefined) {
                        let value = adjustment;
                        if (options.accumulate) {
                            value += boxAdjustment[attr];
                        }
                        if (options.negative === false && (boxReset[attr] === 0 ? this[attr] : 0) + value <= 0) {
                            value = 0;
                            if (this[attr] >= 0 && value < 0) {
                                boxReset[attr] = 1;
                            }
                        }
                        boxAdjustment[attr] = value;
                    } else if (reset === 1 && !this.naturalChild) {
                        boxAdjustment[attr] = 0;
                    }
                }
            }
        }
        resetBox(region, node) {
            if (hasBit$2(15 /* MARGIN */, region)) {
                applyBoxReset(this, this._boxReset, BOX_MARGIN, SPACING_MARGIN, region, node);
            }
            if (hasBit$2(240 /* PADDING */, region)) {
                applyBoxReset(this, this._boxReset, BOX_PADDING, SPACING_PADDING, region, node);
            }
        }
        transferBox(region, node) {
            if (hasBit$2(15 /* MARGIN */, region)) {
                applyBoxAdjustment(this, this._boxAdjustment, BOX_MARGIN, SPACING_MARGIN, region, node);
            }
            if (hasBit$2(240 /* PADDING */, region)) {
                applyBoxAdjustment(this, this._boxAdjustment, BOX_PADDING, SPACING_PADDING, region, node);
            }
        }
        registerBox(region, node) {
            var _a;
            if (this._boxRegister === undefined) {
                this._boxRegister = {};
            }
            if (node) {
                this._boxRegister[region] = node;
            } else {
                node = this._boxRegister[region];
            }
            while (node !== undefined) {
                const next = (_a = node.unsafe('boxRegister')) === null || _a === void 0 ? void 0 : _a[region];
                if (next) {
                    node = next;
                } else {
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
                            if (
                                node.getBox(
                                    attr === 'paddingTop' ? 16 /* PADDING_TOP */ : 64 /* PADDING_BOTTOM */
                                )[0] === 0
                            ) {
                                return 0;
                            }
                        } else {
                            return value;
                        }
                    }
                    if (node.naturalChild) {
                        return canCascadeChildren(node) && cascadeActualPadding(node.naturalChildren, attr, value)
                            ? 0
                            : value;
                    }
                } else if (this.gridElement) {
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
            if (this.pageFlow) {
                let offsetLeft = 0,
                    offsetRight = 0,
                    current = this.actualParent;
                while (current !== null) {
                    if (current.hasPX('width', { percent: false }) || !current.pageFlow) {
                        return value;
                    } else {
                        offsetLeft += Math.max(current.marginLeft, 0) + current.borderLeftWidth + current.paddingLeft;
                        offsetRight += current.paddingRight + current.borderRightWidth + current.marginRight;
                    }
                    current = current.actualParent;
                }
                const screenWidth = this.localSettings.screenDimension.width - offsetLeft - offsetRight;
                if (screenWidth > 0) {
                    return Math.min(value, screenWidth);
                }
            }
            return value;
        }
        cloneBase(node) {
            node.depth = this.depth;
            node.childIndex = this.childIndex;
            node.inlineText = this.inlineText;
            node.actualParent = this.actualParent;
            node.documentRoot = this.documentRoot;
            node.localSettings = this.localSettings;
            node.alignmentType = this.alignmentType;
            node.containerName = this.containerName;
            node.visible = this.visible;
            node.excluded = this.excluded;
            node.rendered = this.rendered;
            node.containerIndex = this.containerIndex;
            node.lineBreakLeading = this.lineBreakLeading;
            node.lineBreakTrailing = this.lineBreakTrailing;
            node.documentParent = this.documentParent;
            node.renderParent = this.renderParent;
            node.rootElement = this.rootElement;
            if (this.length > 0) {
                node.retainAs(this.duplicate());
            }
            node.inherit(this, 'initial', 'base', 'alignment', 'styleMap', 'textStyle');
            Object.assign(node.unsafe('cached'), this._cached);
        }
        unsetCache(...attrs) {
            const length = attrs.length;
            if (length > 0) {
                const cached = this._cached;
                let i = 0;
                while (i < length) {
                    switch (attrs[i++]) {
                        case 'top':
                        case 'right':
                        case 'bottom':
                        case 'left':
                            cached.autoPosition = undefined;
                            cached.positiveAxis = undefined;
                            break;
                        case 'float':
                            cached.floating = undefined;
                            break;
                        case 'fontSize':
                        case 'lineHeight':
                            cached.baselineHeight = undefined;
                            break;
                        case 'whiteSpace':
                            cached.preserveWhiteSpace = undefined;
                            cached.textEmpty = undefined;
                            break;
                        case 'width':
                        case 'height':
                        case 'maxWidth':
                        case 'maxHeight':
                        case 'overflowX':
                        case 'overflowY':
                            cached.overflow = undefined;
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
                } else if (value === null) {
                    delete this._styleMap[attr];
                }
                if (cache) {
                    this.unsetCache(attr);
                }
            }
            return this._styleMap[attr] || (this.styleElement && this.style[attr]) || '';
        }
        cssApply(values, cache) {
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
            return this._element || (this.innerWrapped && this.innerMostWrapped.unsafe('element')) || null;
        }
        set naturalChild(value) {
            this._cached.naturalChild = value;
        }
        get naturalChild() {
            const result = this._cached.naturalChild;
            if (result === undefined) {
                const element = this._element;
                return (this._cached.naturalChild = element
                    ? element.parentElement
                        ? true
                        : element === document.documentElement
                    : false);
            }
            return result;
        }
        get pseudoElement() {
            var _a;
            return ((_a = this._element) === null || _a === void 0 ? void 0 : _a.className) === '__squared.pseudo';
        }
        get scrollElement() {
            let result = this._cached.scrollElement;
            if (result === undefined) {
                if (this.htmlElement) {
                    switch (this.tagName) {
                        case 'INPUT':
                            switch (this.toElementString('type')) {
                                case 'button':
                                case 'submit':
                                case 'reset':
                                case 'file':
                                case 'date':
                                case 'datetime-local':
                                case 'month':
                                case 'week':
                                case 'time':
                                case 'range':
                                case 'color':
                                    result = true;
                                    break;
                                default:
                                    result = false;
                                    break;
                            }
                            break;
                        case 'IMG':
                        case 'SELECT':
                        case 'TABLE':
                        case 'VIDEO':
                        case 'AUDIO':
                        case 'PROGRESS':
                        case 'METER':
                        case 'HR':
                        case 'BR':
                        case 'WBR':
                            result = false;
                            break;
                        default:
                            result = this.blockDimension;
                            break;
                    }
                } else {
                    result = false;
                }
                this._cached.scrollElement = result;
            }
            return result;
        }
        get layoutElement() {
            const result = this._cached.layoutElement;
            return result === undefined ? (this._cached.layoutElement = this.flexElement || this.gridElement) : result;
        }
        get imageElement() {
            const result = this._cached.imageElement;
            return result === undefined ? (this._cached.imageElement = super.imageElement) : result;
        }
        get flexElement() {
            const result = this._cached.flexElement;
            return result === undefined ? (this._cached.flexElement = super.flexElement) : result;
        }
        get gridElement() {
            const result = this._cached.gridElement;
            return result === undefined ? (this._cached.gridElement = super.gridElement) : result;
        }
        get tableElement() {
            const result = this._cached.tableElement;
            return result === undefined ? (this._cached.tableElement = super.tableElement) : result;
        }
        get inputElement() {
            const result = this._cached.inputElement;
            return result === undefined ? (this._cached.inputElement = super.inputElement) : result;
        }
        get floating() {
            const result = this._cached.floating;
            return result === undefined ? (this._cached.floating = super.floating) : result;
        }
        get float() {
            const result = this._cached.float;
            return result === undefined ? (this._cached.float = super.float) : result;
        }
        set textContent(value) {
            this._cached.textContent = value;
        }
        get textContent() {
            const result = this._cached.textContent;
            return result === undefined ? (this._cached.textContent = super.textContent) : result;
        }
        get contentBox() {
            const result = this._cached.contentBox;
            return result === undefined ? (this._cached.contentBox = super.contentBox) : result;
        }
        get positionRelative() {
            const result = this._cached.positionRelative;
            return result === undefined ? (this._cached.positionRelative = super.positionRelative) : result;
        }
        set documentParent(value) {
            this._documentParent = value;
        }
        get documentParent() {
            return this._documentParent || this.absoluteParent || this.actualParent || this.parent || this;
        }
        set containerName(value) {
            this._cached.containerName = value.toUpperCase();
        }
        get containerName() {
            let result = this._cached.containerName;
            if (result === undefined) {
                const element = this.element;
                if (element) {
                    if (element.nodeName === '#text') {
                        result = 'PLAINTEXT';
                    } else if (element.tagName === 'INPUT') {
                        result = 'INPUT_' + convertWord(element.type, true).toUpperCase();
                    } else {
                        result = element.tagName.toUpperCase();
                    }
                } else {
                    result = '';
                }
                this._cached.containerName = result;
            }
            return result;
        }
        get layoutHorizontal() {
            return this.hasAlign(4 /* HORIZONTAL */);
        }
        get layoutVertical() {
            if (this.hasAlign(8 /* VERTICAL */)) {
                return true;
            } else if (this.naturalChild) {
                const children = this.naturalChildren;
                return children.length === 1 && children[0].blockStatic;
            }
            return false;
        }
        get nodeGroup() {
            return false;
        }
        set renderAs(value) {
            if (value && !value.renderParent && !this.rendered) {
                this._renderAs = value;
            }
        }
        get renderAs() {
            return this._renderAs;
        }
        get inlineVertical() {
            const result = this._cached.inlineVertical;
            if (result === undefined) {
                if ((this.naturalElement || this.pseudoElement) && !this.floating) {
                    const value = this.display;
                    return (this._cached.inlineVertical = value.startsWith('inline') || value === 'table-cell');
                }
                return (this._cached.inlineVertical = false);
            }
            return result;
        }
        get inlineDimension() {
            const result = this._cached.inlineDimension;
            return result === undefined
                ? (this._cached.inlineDimension =
                      (this.naturalElement || this.pseudoElement) &&
                      (this.display.startsWith('inline-') || this.floating))
                : result;
        }
        get inlineFlow() {
            var _a;
            const result = this._cached.inlineFlow;
            return result === undefined
                ? (this._cached.inlineFlow =
                      this.inline ||
                      this.inlineDimension ||
                      this.inlineVertical ||
                      this.imageElement ||
                      (this.svgElement && this.hasPX('width', { percent: false })) ||
                      (this.tableElement &&
                          ((_a = this.previousSibling) === null || _a === void 0 ? void 0 : _a.floating) === true))
                : result;
        }
        get blockStatic() {
            return super.blockStatic || (this.hasAlign(32 /* BLOCK */) && this.pageFlow && !this.floating);
        }
        get blockDimension() {
            const result = this._cached.blockDimension;
            return result === undefined
                ? this.block || this.inlineDimension || this.imageElement || this.svgElement || this.display === 'table'
                : result;
        }
        get blockVertical() {
            const result = this._cached.blockVertical;
            return result === undefined ? (this._cached.blockVertical = this.blockDimension && this.hasHeight) : result;
        }
        get rightAligned() {
            if (this.hasAlign(1024 /* RIGHT */)) {
                return true;
            }
            return super.rightAligned;
        }
        set autoPosition(value) {
            this._cached.autoPosition = value;
        }
        get autoPosition() {
            const result = this._cached.autoPosition;
            if (result === undefined) {
                if (this.pageFlow) {
                    return (this._cached.autoPosition = false);
                } else {
                    const { top, right, bottom, left } = this._styleMap;
                    return (this._cached.autoPosition =
                        (!top || top === 'auto') &&
                        (!left || left === 'auto') &&
                        (!right || right === 'auto') &&
                        (!bottom || bottom === 'auto'));
                }
            }
            return result;
        }
        get positiveAxis() {
            const result = this._cached.positiveAxis;
            return result === undefined
                ? (this._cached.positiveAxis =
                      (!this.positionRelative ||
                          (this.positionRelative &&
                              this.top >= 0 &&
                              this.left >= 0 &&
                              (this.right <= 0 || this.hasPX('left')) &&
                              (this.bottom <= 0 || this.hasPX('top')))) &&
                      this.marginTop >= 0 &&
                      this.marginLeft >= 0 &&
                      this.marginRight >= 0)
                : result;
        }
        get leftTopAxis() {
            const result = this._cached.leftTopAxis;
            if (result === undefined) {
                switch (this.cssInitial('position')) {
                    case 'absolute':
                        return (this._cached.leftTopAxis = this.absoluteParent === this.documentParent);
                    case 'fixed':
                        return (this._cached.leftTopAxis = true);
                    default:
                        return (this._cached.leftTopAxis = false);
                }
            }
            return result;
        }
        get baselineElement() {
            let result = this._cached.baselineElement;
            if (result === undefined) {
                if (this.baseline) {
                    const children = this.naturalChildren;
                    if (children.length > 0) {
                        result = children.every(node => node.baselineElement && node.length === 0);
                    } else {
                        result =
                            (this.inlineText && this.textElement) ||
                            (this.plainText && !this.multiline) ||
                            this.inputElement ||
                            this.imageElement ||
                            this.svgElement;
                    }
                } else {
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
            const result = this._cached.actualParent;
            return result === undefined
                ? (this._cached.actualParent = super.actualParent || this.innerMostWrapped.actualParent)
                : result;
        }
        set siblingsLeading(value) {
            this._siblingsLeading = value;
        }
        get siblingsLeading() {
            var _a;
            return (_a = this._siblingsLeading) !== null && _a !== void 0
                ? _a
                : (this._siblingsLeading = this.previousSiblings({ lineBreak: true, excluded: true }));
        }
        set siblingsTrailing(value) {
            this._siblingsTrailing = value;
        }
        get siblingsTrailing() {
            var _a;
            return (_a = this._siblingsTrailing) !== null && _a !== void 0
                ? _a
                : (this._siblingsTrailing = this.nextSiblings({ lineBreak: true, excluded: true }));
        }
        get flowElement() {
            return this.pageFlow && (!this.excluded || this.lineBreak);
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
                        if (node.flowElement) {
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
                        if (node.flowElement) {
                            return node;
                        }
                    }
                }
            }
            return null;
        }
        get firstChild() {
            return this.naturalChildren.find(node => !node.excluded || node.lineBreak) || null;
        }
        get lastChild() {
            const children = this.naturalChildren;
            let i = children.length - 1;
            while (i >= 0) {
                const node = children[i--];
                if (!node.excluded || node.lineBreak) {
                    return node;
                }
            }
            return null;
        }
        get firstStaticChild() {
            return this.naturalChildren.find(node => node.flowElement) || null;
        }
        get lastStaticChild() {
            const children = this.naturalChildren;
            let i = children.length - 1;
            while (i >= 0) {
                const node = children[i--];
                if (node.flowElement) {
                    return node;
                }
            }
            return null;
        }
        get onlyChild() {
            var _a, _b, _c;
            return (
                ((_b = (_a = this.renderParent) === null || _a === void 0 ? void 0 : _a.renderChildren.length) !==
                    null && _b !== void 0
                    ? _b
                    : (_c = this.parent) === null || _c === void 0
                    ? void 0
                    : _c.length) === 1 && !this.documentRoot
            );
        }
        get overflowX() {
            let result = this._cached.overflow;
            if (result === undefined) {
                result = setOverflow(this);
                this._cached.overflow = result;
            }
            return hasBit$2(result, 4 /* HORIZONTAL */);
        }
        get overflowY() {
            let result = this._cached.overflow;
            if (result === undefined) {
                result = setOverflow(this);
                this._cached.overflow = result;
            }
            return hasBit$2(result, 8 /* VERTICAL */);
        }
        get textEmpty() {
            const result = this._cached.textEmpty;
            if (result === undefined) {
                if (this.styleElement && !this.imageElement && !this.svgElement && !this.inputElement) {
                    const value = this.textContent;
                    return (this._cached.textEmpty = value === '' || (!this.preserveWhiteSpace && value.trim() === ''));
                }
                return (this._cached.textEmpty = false);
            }
            return result;
        }
        set childIndex(value) {
            this._childIndex = value;
        }
        get childIndex() {
            let result = this._childIndex;
            if (result === Infinity) {
                let wrapped = this.innerWrapped;
                if (wrapped) {
                    do {
                        const index = wrapped.childIndex;
                        if (index !== Infinity) {
                            result = index;
                            this._childIndex = result;
                            break;
                        }
                        wrapped = wrapped.innerWrapped;
                    } while (wrapped !== undefined);
                } else {
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
            if (result === Infinity) {
                let wrapped = this.innerWrapped;
                while (wrapped !== undefined) {
                    const index = wrapped.containerIndex;
                    if (index !== Infinity) {
                        result = index;
                        this._containerIndex = result;
                        break;
                    }
                    wrapped = wrapped.innerWrapped;
                }
            }
            return result;
        }
        get innerMostWrapped() {
            if (this.naturalChild) {
                return this;
            }
            let result = this.innerWrapped;
            while (result !== undefined) {
                const innerWrapped = result.innerWrapped;
                if (innerWrapped) {
                    result = innerWrapped;
                } else {
                    break;
                }
            }
            return result || this;
        }
        get outerMostWrapper() {
            let result = this.outerWrapper;
            while (result !== undefined) {
                const outerWrapper = result.outerWrapper;
                if (outerWrapper) {
                    result = outerWrapper;
                } else {
                    break;
                }
            }
            return result || this;
        }
        get preserveWhiteSpace() {
            const result = this._cached.preserveWhiteSpace;
            if (result === undefined) {
                const value = this.css('whiteSpace');
                return (this._cached.preserveWhiteSpace = value === 'pre' || value === 'pre-wrap');
            }
            return result;
        }
        set use(value) {
            const use = this.use;
            this.dataset['use' + capitalize$1(this.localSettings.systemName)] = (use ? use + ', ' : '') + value;
        }
        get use() {
            const dataset = this.dataset;
            return dataset['use' + capitalize$1(this.localSettings.systemName)] || dataset['use'];
        }
        get extensions() {
            var _a;
            const result = this._cached.extensions;
            if (result === undefined) {
                const use = (_a = this.use) === null || _a === void 0 ? void 0 : _a.trim();
                return (this._cached.extensions = use ? use.split(/\s*,\s*/) : []);
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
            } else if (length === 1) {
                this._linearY = this.children[0].blockStatic;
                this._linearX = !this._linearY;
            } else {
                return;
            }
            this._initialized = true;
        }
        setContainerType(containerType, alignmentType) {
            this.containerType = containerType;
            if (alignmentType) {
                this.addAlign(alignmentType);
            }
        }
        addAlign(value) {
            if (!hasBit$3(this.alignmentType, value)) {
                this.alignmentType |= value;
            }
            return this.alignmentType;
        }
        hasAlign(value) {
            return hasBit$3(this.alignmentType, value);
        }
        addRender(value) {
            if (this.renderType === undefined) {
                this.renderType = 0;
            }
            if (!hasBit$3(this.renderType, value)) {
                this.renderType |= value;
            }
            return this.renderType;
        }
        retainAs(list) {
            super.retainAs(list);
            if (this._initialized) {
                this.init();
            }
            return this;
        }
        set itemCount(value) {
            this._itemCount = value;
        }
        get itemCount() {
            var _a;
            return (_a = this._itemCount) !== null && _a !== void 0 ? _a : this.length;
        }
        set type(value) {
            this.setContainerType(value.containerType, value.alignmentType);
            const renderType = value.renderType;
            if (renderType) {
                this.addRender(renderType);
            }
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
        get singleRowAligned() {
            let result = this._singleRow;
            if (result === undefined) {
                const children = this.children;
                const length = children.length;
                if (length > 0) {
                    result = true;
                    if (length > 1) {
                        let previousBottom = Infinity;
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
                } else {
                    return false;
                }
            }
            return result;
        }
        get unknownAligned() {
            return this.length > 1 && !this.linearX && !this.linearY;
        }
    }

    const {
        convertListStyle,
        formatPX: formatPX$1,
        getStyle: getStyle$1,
        hasComputedStyle: hasComputedStyle$2,
        hasCoords,
        insertStyleSheetRule: insertStyleSheetRule$1,
        resolveURL,
    } = squared.lib.css;
    const { getNamedItem: getNamedItem$1, removeElementsByClassName } = squared.lib.dom;
    const { maxArray } = squared.lib.math;
    const {
        getElementCache: getElementCache$2,
        getPseudoElt: getPseudoElt$1,
        setElementCache: setElementCache$2,
    } = squared.lib.session;
    const {
        appendSeparator,
        capitalize: capitalize$2,
        convertWord: convertWord$1,
        flatArray,
        hasBit: hasBit$4,
        hasMimeType: hasMimeType$1,
        isString,
        iterateArray: iterateArray$2,
        partitionArray,
        safeNestedArray,
        safeNestedMap: safeNestedMap$1,
        trimBoth: trimBoth$1,
        trimString,
    } = squared.lib.util;
    const TEXT_STYLE = NodeUI.TEXT_STYLE.concat(['fontSize']);
    function prioritizeExtensions(value, extensions) {
        const included = value.trim().split(/\s*,\s*/);
        const result = [];
        const untagged = [];
        const length = extensions.length;
        let i = 0;
        while (i < length) {
            const ext = extensions[i++];
            const index = included.indexOf(ext.name);
            if (index !== -1) {
                result[index] = ext;
            } else {
                untagged.push(ext);
            }
        }
        return result.length > 0 ? flatArray(result).concat(untagged) : extensions;
    }
    function getFloatAlignmentType(nodes) {
        let result = 0,
            right = true,
            floating = true;
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
            result |= 256 /* FLOAT */;
        }
        if (right) {
            result |= 1024 /* RIGHT */;
        }
        return result;
    }
    function checkPseudoAfter(element) {
        const previousSibling = element.childNodes[element.childNodes.length - 1];
        return previousSibling.nodeName === '#text' && !/\s+$/.test(previousSibling.textContent);
    }
    function checkPseudoDimension(styleMap, after, absolute) {
        switch (styleMap.display) {
            case undefined:
            case 'block':
            case 'inline':
            case 'inherit':
            case 'initial':
                break;
            default:
                return true;
        }
        if ((after || !parseFloat(styleMap.width)) && !parseFloat(styleMap.height)) {
            for (const attr in styleMap) {
                if (
                    (/(padding|Width|Height)/.test(attr) && parseFloat(styleMap[attr]) > 0) ||
                    (!absolute && attr.startsWith('margin') && parseFloat(styleMap[attr]))
                ) {
                    return true;
                }
            }
            return false;
        }
        return true;
    }
    function getPseudoQuoteValue(element, pseudoElt, outside, inside, sessionId) {
        var _a;
        let current = element,
            found = 0;
        let i = 0,
            j = -1;
        while ((current === null || current === void 0 ? void 0 : current.tagName) === 'Q') {
            const quotes =
                ((_a = getElementCache$2(current, `styleMap`, sessionId)) === null || _a === void 0
                    ? void 0
                    : _a.quotes) || getComputedStyle(current).quotes;
            if (quotes) {
                const match = /("(?:[^"]|\\")+"|[^\s]+)\s+("(?:[^"]|\\")+"|[^\s]+)(?:\s+("(?:[^"]|\\")+"|[^\s]+)\s+("(?:[^"]|\\")+"|[^\s]+))?/.exec(
                    quotes
                );
                if (match) {
                    if (pseudoElt === '::before') {
                        if (found === 0) {
                            outside = extractQuote(match[1]);
                            ++found;
                        }
                        if (match[3] && found < 2) {
                            inside = extractQuote(match[3]);
                            ++found;
                        }
                    } else {
                        if (found === 0) {
                            outside = extractQuote(match[2]);
                            ++found;
                        }
                        if (match[4] && found < 2) {
                            inside = extractQuote(match[4]);
                            ++found;
                        }
                    }
                    j = i;
                }
            }
            current = current.parentElement;
            ++i;
        }
        if (found === 0) {
            --i;
        } else if (j === 0) {
            return outside;
        } else if (j > 0) {
            return inside;
        }
        return i % 2 === 0 ? outside : inside;
    }
    function getRelativeOffset(node, fromRight) {
        return node.positionRelative
            ? node.hasPX('left')
                ? node.left * (fromRight ? 1 : -1)
                : node.right * (fromRight ? -1 : 1)
            : 0;
    }
    function setMapDepth(map, depth, node) {
        const data = map.get(depth);
        if (data) {
            data.add(node);
        } else {
            map.set(depth, new Set([node]));
        }
    }
    function getCounterValue(value, counterName, fallback = 1) {
        if (value && value !== 'none') {
            const pattern = /\b([^\-\d][^\-\d]?[^\s]*)\s+(-?\d+)\b/g;
            let match;
            while ((match = pattern.exec(value))) {
                if (match[1] === counterName) {
                    return parseInt(match[2]);
                }
            }
            return fallback;
        }
        return undefined;
    }
    function setColumnMaxWidth(nodes, offset) {
        const length = nodes.length;
        let i = 0;
        while (i < length) {
            const child = nodes[i++];
            if (!child.hasPX('width') && !child.hasPX('maxWidth') && !child.imageElement && !child.svgElement) {
                child.css('maxWidth', formatPX$1(offset));
            }
        }
    }
    function isPlainText(value) {
        const length = value.length;
        let i = 0;
        while (i < length) {
            switch (value.charCodeAt(i++)) {
                case 32:
                case 9:
                case 10:
                case 11:
                case 13:
                    continue;
                default:
                    return true;
            }
        }
        return false;
    }
    const getCounterIncrementValue = (parent, counterName, pseudoElt, sessionId, fallback) => {
        var _a;
        return getCounterValue(
            (_a = getElementCache$2(parent, `styleMap${pseudoElt}`, sessionId)) === null || _a === void 0
                ? void 0
                : _a.counterIncrement,
            counterName,
            fallback
        );
    };
    const extractQuote = value => {
        var _a;
        return ((_a = /^"(.+)"$/.exec(value)) === null || _a === void 0 ? void 0 : _a[1]) || value;
    };
    const isHorizontalAligned = node =>
        !node.blockStatic &&
        node.autoMargin.horizontal !== true &&
        !(node.blockDimension && node.css('width') === '100%') &&
        (!(node.plainText && node.multiline) || node.floating);
    const requirePadding = (node, depth) => node.textElement && (node.blockStatic || node.multiline || depth === 1);
    const getMapIndex = value => -(value + 2);
    class ApplicationUI extends Application {
        constructor(
            framework,
            nodeConstructor,
            ControllerConstructor,
            ResourceConstructor,
            ExtensionManagerConstructor
        ) {
            super(framework, nodeConstructor, ControllerConstructor, ResourceConstructor, ExtensionManagerConstructor);
            this.session = {
                active: new Map(),
                unusedStyles: new Set(),
                extensionMap: new Map(),
                clearMap: new Map(),
            };
            this.builtInExtensions = {};
            this.extensions = [];
            this._layouts = [];
            const localSettings = this.controllerHandler.localSettings;
            this._controllerSettings = localSettings;
            this._layoutFileExtension = new RegExp(`\\.${localSettings.layout.fileExtension}$`);
            this._conditionExcluded = localSettings.unsupported.excluded;
        }
        finalize() {
            var _a;
            if (super.finalize()) {
                return false;
            }
            const controllerHandler = this.controllerHandler;
            const children = this.childrenAll;
            let length = children.length;
            const rendered = new Array(length);
            let i = 0,
                j = 0;
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
            const extensions = this.extensions;
            length = extensions.length;
            i = 0;
            while (i < length) {
                const ext = extensions[i++];
                for (const node of ext.subscribers) {
                    ext.postOptimize(node);
                }
            }
            const documentRoot = [];
            i = 0;
            while (i < j) {
                const node = rendered[i++];
                if (node.hasResource(NODE_RESOURCE.BOX_SPACING)) {
                    node.setBoxSpacing();
                }
                if (node.documentRoot) {
                    if (
                        node.renderChildren.length === 0 &&
                        !node.inlineText &&
                        node.naturalElements.length > 0 &&
                        node.naturalElements.every(item => item.documentRoot)
                    ) {
                        continue;
                    }
                    const layoutName = node.innerMostWrapped.data(Application.KEY_NAME, 'layoutName');
                    if (layoutName) {
                        documentRoot.push({ node, layoutName });
                    }
                }
            }
            i = 0;
            while (i < length) {
                extensions[i++].beforeCascade(rendered, documentRoot);
            }
            const baseTemplate = this._controllerSettings.layout.baseTemplate;
            const systemName = capitalize$2(this.systemName);
            i = 0;
            while (i < documentRoot.length) {
                const { node, layoutName } = documentRoot[i++];
                const renderTemplates = node.renderParent.renderTemplates;
                if (renderTemplates) {
                    this.saveDocument(
                        layoutName,
                        baseTemplate + controllerHandler.cascadeDocument(renderTemplates, Math.abs(node.depth)),
                        node.dataset['pathname' + systemName],
                        (
                            (_a = node.renderExtension) === null || _a === void 0
                                ? void 0
                                : _a.some(item => item.documentBase)
                        )
                            ? 0
                            : undefined
                    );
                }
            }
            this.resourceHandler.finalize(this._layouts);
            controllerHandler.finalize(this._layouts);
            i = 0;
            while (i < length) {
                extensions[i++].afterFinalize();
            }
            removeElementsByClassName('__squared.pseudo');
            this.closed = true;
            return true;
        }
        copyToDisk(directory, options) {
            return super.copyToDisk(directory, this.createAssetOptions(options));
        }
        appendToArchive(pathname, options) {
            return super.appendToArchive(pathname, this.createAssetOptions(options));
        }
        saveToArchive(filename, options) {
            return super.saveToArchive(filename, this.createAssetOptions(options));
        }
        reset() {
            const session = this.session;
            const iterationName = 'iteration' + capitalize$2(this.systemName);
            for (const item of session.active.values()) {
                for (const element of item.rootElements) {
                    delete element.dataset[iterationName];
                }
            }
            super.reset();
            session.extensionMap.clear();
            session.clearMap.clear();
            this._layouts.length = 0;
        }
        conditionElement(element, sessionId, cascadeAll, pseudoElt) {
            if (!this._conditionExcluded.has(element.tagName)) {
                if (this.controllerHandler.visibleElement(element, sessionId, pseudoElt) || cascadeAll) {
                    return true;
                } else if (!pseudoElt) {
                    if (hasCoords(getStyle$1(element).position)) {
                        return this.useElement(element);
                    }
                    let current = element.parentElement;
                    while (current !== null) {
                        if (getStyle$1(current).display === 'none') {
                            return this.useElement(element);
                        }
                        current = current.parentElement;
                    }
                    const controllerHandler = this.controllerHandler;
                    if (
                        iterateArray$2(element.children, item => controllerHandler.visibleElement(item, sessionId)) ===
                        Infinity
                    ) {
                        return true;
                    }
                    return this.useElement(element);
                }
            }
            return false;
        }
        insertNode(element, sessionId, cascadeAll, pseudoElt) {
            if (element.nodeName === '#text' || this.conditionElement(element, sessionId, cascadeAll, pseudoElt)) {
                this.controllerHandler.applyDefaultStyles(element, sessionId);
                return this.createNode(sessionId, { element, append: false });
            } else {
                const node = this.createNode(sessionId, { element, append: false });
                node.visible = false;
                node.excluded = true;
                return node;
            }
        }
        saveDocument(filename, content, pathname, index) {
            const layout = {
                pathname: pathname
                    ? trimString(pathname.replace(/\\/g, '/'), '/')
                    : appendSeparator(this.userSettings.outputDirectory, this._controllerSettings.layout.pathName),
                filename,
                content,
                index,
            };
            if (index === undefined || !(index >= 0 && index < this._layouts.length)) {
                this._layouts.push(layout);
            } else {
                this._layouts.splice(index, 0, layout);
            }
        }
        renderNode(layout) {
            return layout.itemCount === 0
                ? this.controllerHandler.renderNode(layout)
                : this.controllerHandler.renderNodeGroup(layout);
        }
        addLayout(layout) {
            const renderType = layout.renderType;
            if (renderType && hasBit$4(renderType, 256 /* FLOAT */)) {
                if (hasBit$4(renderType, 4 /* HORIZONTAL */)) {
                    layout = this.processFloatHorizontal(layout);
                } else if (hasBit$4(renderType, 8 /* VERTICAL */)) {
                    layout = this.processFloatVertical(layout);
                }
            }
            if (layout.containerType !== 0) {
                const template = this.renderNode(layout);
                if (template) {
                    this.addLayoutTemplate(template.parent || layout.parent, layout.node, template, layout.renderIndex);
                    return true;
                }
            }
            return false;
        }
        addLayoutTemplate(parent, node, template, index) {
            if (!node.renderExclude) {
                if (node.renderParent) {
                    const renderTemplates = safeNestedArray(parent, 'renderTemplates');
                    if (index === undefined || !(index >= 0 && index < parent.renderChildren.length)) {
                        parent.renderChildren.push(node);
                        renderTemplates.push(template);
                    } else {
                        parent.renderChildren.splice(index, 0, node);
                        renderTemplates.splice(index, 0, template);
                    }
                }
            } else {
                node.hide({ remove: true });
                node.excluded = true;
            }
        }
        createNode(sessionId, options) {
            const { element, parent, children } = options;
            const cache = this.getProcessingCache(sessionId);
            const node = new this.Node(this.nextId, sessionId, element);
            this.controllerHandler.afterInsertNode(node);
            if (parent) {
                node.depth = parent.depth + 1;
                if (!element && parent.naturalElement) {
                    node.actualParent = parent;
                }
                const child = options.innerWrap;
                if (child && parent.replaceTry({ child, replaceWith: node })) {
                    child.parent = node;
                    node.innerWrapped = child;
                }
            }
            if (children) {
                const length = children.length;
                let i = 0;
                while (i < length) {
                    children[i++].parent = node;
                }
            }
            if (options.append !== false) {
                cache.add(node, options.delegate === true, options.cascade === true);
            }
            return node;
        }
        createCache(documentRoot, sessionId) {
            const node = this.createRootNode(documentRoot, sessionId);
            if (node) {
                const { cache, excluded } = this.getProcessing(sessionId);
                const parent = node.parent;
                if (parent) {
                    parent.visible = false;
                    node.documentParent = parent;
                    if (parent.tagName === 'HTML') {
                        parent.addAlign(2 /* AUTO_LAYOUT */);
                        parent.exclude({
                            resource: NODE_RESOURCE.FONT_STYLE | NODE_RESOURCE.VALUE_STRING,
                            procedure: NODE_PROCEDURE.ALL,
                        });
                        cache.add(parent);
                    }
                }
                node.rootElement = true;
                const preAlignment = {};
                const direction = new Set();
                const pseudoElements = [];
                let resetBounds = false;
                cache.each(item => {
                    if (item.styleElement) {
                        const element = item.element;
                        if (item.length > 0) {
                            const textAlign = item.cssInitial('textAlign');
                            switch (textAlign) {
                                case 'center':
                                case 'right':
                                case 'end':
                                    safeNestedMap$1(preAlignment, item.id)['text-align'] = textAlign;
                                    element.style.setProperty('text-align', 'left');
                                    break;
                            }
                        }
                        if (item.positionRelative) {
                            let i = 0;
                            while (i < 4) {
                                const attr = NodeUI.BOX_POSITION[i++];
                                if (item.hasPX(attr)) {
                                    safeNestedMap$1(preAlignment, item.id)[attr] = item.css(attr);
                                    element.style.setProperty(attr, 'auto');
                                    resetBounds = true;
                                }
                            }
                        }
                        if (item.dir === 'rtl') {
                            element.dir = 'ltr';
                            direction.add(element);
                            resetBounds = true;
                        }
                    }
                });
                excluded.each(item => {
                    if (!item.pageFlow) {
                        item.cssTry('display', 'none');
                    }
                });
                cache.each(item => {
                    if (!item.pseudoElement) {
                        item.setBounds(!resetBounds && preAlignment[item.id] === undefined);
                    } else {
                        pseudoElements.push(item);
                    }
                });
                const length = pseudoElements.length;
                if (length > 0) {
                    const pseudoMap = [];
                    let i = 0;
                    while (i < length) {
                        const item = pseudoElements[i++];
                        const parentElement = item.parentElement;
                        let id = parentElement.id.trim(),
                            styleElement;
                        if (item.pageFlow) {
                            if (id === '') {
                                id = '__squared_' + Math.round(Math.random() * new Date().getTime());
                                parentElement.id = id;
                            }
                            styleElement = insertStyleSheetRule$1(
                                `#${id + getPseudoElt$1(item.element, item.sessionId)} { display: none !important; }`
                            );
                        }
                        if (item.cssTry('display', item.display)) {
                            pseudoMap.push({ item, id, parentElement, styleElement });
                        }
                    }
                    const q = pseudoMap.length;
                    i = 0;
                    while (i < q) {
                        pseudoMap[i++].item.setBounds(false);
                    }
                    i = 0;
                    while (i < q) {
                        const data = pseudoMap[i++];
                        const styleElement = data.styleElement;
                        if (data.id.startsWith('__squared_')) {
                            data.parentElement.id = '';
                        }
                        if (styleElement) {
                            try {
                                document.head.removeChild(styleElement);
                            } catch (_a) {}
                        }
                        data.item.cssFinally('display');
                    }
                }
                excluded.each(item => {
                    if (!item.lineBreak) {
                        item.setBounds(!resetBounds);
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
                        item.setExclusions();
                    }
                    item.saveAsInitial();
                });
                this.controllerHandler.evaluateNonStatic(node, cache);
                this.controllerHandler.sortInitialCache(cache);
            }
            return node;
        }
        afterCreateCache(node) {
            super.afterCreateCache(node);
            const systemName = capitalize$2(this.systemName);
            const dataset = node.dataset;
            const filename = dataset['filename' + systemName] || dataset.filename;
            const iteration = dataset['iteration' + systemName];
            const prefix =
                (isString(filename) && filename.replace(this._layoutFileExtension, '')) ||
                node.elementId ||
                `document_${this.length}`;
            const suffix = (iteration ? parseInt(iteration) : -1) + 1;
            const layoutName = convertWord$1(suffix > 0 ? prefix + '_' + suffix : prefix, true);
            dataset['iteration' + systemName] = suffix.toString();
            dataset['layoutName' + systemName] = layoutName;
            node.data(Application.KEY_NAME, 'layoutName', layoutName);
            const sessionId = node.sessionId;
            this.setBaseLayout(sessionId);
            this.setConstraints(sessionId);
            this.setResources(sessionId);
        }
        useElement(element) {
            const use = this.getDatasetName('use', element);
            return isString(use) && use.split(',').some(value => !!this.extensionManager.retrieve(value.trim()));
        }
        toString() {
            var _a;
            return ((_a = this.layouts[0]) === null || _a === void 0 ? void 0 : _a.content) || '';
        }
        cascadeParentNode(cache, excluded, rootElements, parentElement, sessionId, depth, extensions, cascadeAll) {
            var _a;
            const node = this.insertNode(parentElement, sessionId, cascadeAll);
            if (depth === 0) {
                cache.add(node);
                for (const name of node.extensions) {
                    if (
                        (_a = this.extensionManager.retrieve(name)) === null || _a === void 0 ? void 0 : _a.cascadeAll
                    ) {
                        cascadeAll = true;
                        break;
                    }
                }
            }
            if (node.display !== 'none' || depth === 0 || cascadeAll) {
                const controllerHandler = this.controllerHandler;
                if (node.excluded || controllerHandler.preventNodeCascade(node)) {
                    return node;
                }
                const beforeElement = this.createPseduoElement(parentElement, '::before', sessionId);
                const afterElement = this.createPseduoElement(parentElement, '::after', sessionId);
                const childNodes = parentElement.childNodes;
                const length = childNodes.length;
                const children = new Array(length);
                const elements = new Array(parentElement.childElementCount);
                const childDepth = depth + 1;
                let inlineText = true;
                let i = 0,
                    j = 0,
                    k = 0;
                while (i < length) {
                    const element = childNodes[i++];
                    let child;
                    if (element === beforeElement) {
                        child = this.insertNode(beforeElement, sessionId, cascadeAll, '::before');
                        node.innerBefore = child;
                        if (!child.textEmpty) {
                            child.inlineText = true;
                        }
                        inlineText = false;
                    } else if (element === afterElement) {
                        child = this.insertNode(afterElement, sessionId, cascadeAll, '::after');
                        node.innerAfter = child;
                        if (!child.textEmpty) {
                            child.inlineText = true;
                        }
                        inlineText = false;
                    } else if (element.nodeName.charAt(0) === '#') {
                        if (
                            element.nodeName === '#text' &&
                            (isPlainText(element.textContent) ||
                                (node.preserveWhiteSpace &&
                                    (parentElement.tagName !== 'PRE' || parentElement.childElementCount === 0)))
                        ) {
                            child = this.insertNode(element, sessionId);
                            child.cssApply(node.textStyle);
                        } else {
                            continue;
                        }
                    } else if (controllerHandler.includeElement(element)) {
                        if (extensions) {
                            const use = this.getDatasetName('use', element);
                            if (use) {
                                prioritizeExtensions(use, extensions).some(item => item.init(element, sessionId));
                            }
                        }
                        if (!rootElements.has(element)) {
                            child = this.cascadeParentNode(
                                cache,
                                excluded,
                                rootElements,
                                element,
                                sessionId,
                                childDepth,
                                extensions,
                                cascadeAll
                            );
                            if (!child.excluded) {
                                inlineText = false;
                            }
                        } else {
                            child = this.insertNode(element, sessionId);
                            child.documentRoot = true;
                            child.visible = false;
                            child.excluded = true;
                            inlineText = false;
                        }
                        elements[k++] = child;
                    } else {
                        continue;
                    }
                    child.init(node, childDepth, j);
                    child.naturalChild = true;
                    children[j++] = child;
                }
                children.length = j;
                elements.length = k;
                node.naturalChildren = children;
                node.naturalElements = elements;
                node.inlineText = inlineText;
                if (!inlineText) {
                    if (j > 0) {
                        this.cacheNodeChildren(cache, excluded, node, children);
                    }
                    node.inlineText = inlineText;
                } else {
                    node.inlineText = !node.textEmpty;
                }
                if (k > 0 && this.userSettings.createQuerySelectorMap) {
                    node.queryMap = this.createQueryMap(elements, k);
                }
            }
            return node;
        }
        cacheNodeChildren(cache, excluded, node, children) {
            const length = children.length;
            if (length > 1) {
                let siblingsLeading = [],
                    siblingsTrailing = [],
                    trailing = children[0],
                    floating = false,
                    hasExcluded;
                for (let i = 0, j = 0; i < length; ++i) {
                    const child = children[i];
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
                    if (child.excluded) {
                        hasExcluded = true;
                        excluded.add(child);
                    } else {
                        child.containerIndex = j++;
                        cache.add(child);
                    }
                    child.actualParent = node;
                }
                trailing.siblingsTrailing = siblingsTrailing;
                node.floatContainer = floating;
                node.retainAs(hasExcluded ? children.filter(item => !item.excluded) : children.slice(0));
            } else {
                const child = children[0];
                if (child.excluded) {
                    excluded.add(child);
                } else {
                    child.containerIndex = 0;
                    node.add(child);
                    cache.add(child);
                    node.floatContainer = child.floating;
                }
                child.actualParent = node;
            }
        }
        setBaseLayout(sessionId) {
            const { controllerHandler, session } = this;
            const { extensionMap, clearMap } = session;
            const { cache, node: rootNode } = this.getProcessing(sessionId);
            const mapY = new Map();
            {
                let maxDepth = 0;
                setMapDepth(mapY, -1, rootNode.parent);
                cache.each(node => {
                    if (node.length > 0) {
                        const depth = node.depth;
                        setMapDepth(mapY, depth, node);
                        maxDepth = Math.max(depth, maxDepth);
                        if (node.floatContainer) {
                            const floated = new Set();
                            let clearable = [];
                            const children = node.documentChildren || node.naturalChildren;
                            const length = children.length;
                            let i = 0;
                            while (i < length) {
                                const item = children[i++];
                                if (item.pageFlow) {
                                    const floating = item.floating;
                                    if (floated.size > 0) {
                                        const clear = item.css('clear');
                                        if (floated.has(clear) || clear === 'both') {
                                            if (!floating) {
                                                item.setBox(1 /* MARGIN_TOP */, { reset: 1 });
                                            }
                                            clearMap.set(
                                                item,
                                                floated.size === 2 ? 'both' : floated.values().next().value
                                            );
                                            floated.clear();
                                            clearable.length = 0;
                                        } else if (
                                            item.blockStatic &&
                                            Math.ceil(item.bounds.top) >=
                                                maxArray(clearable.map(previous => previous.bounds.bottom))
                                        ) {
                                            item.data(Application.KEY_NAME, 'cleared', clearable);
                                            floated.clear();
                                            clearable = [];
                                        }
                                    }
                                    if (floating) {
                                        const float = item.float;
                                        floated.add(float);
                                        clearable.push(item);
                                    }
                                }
                            }
                        }
                    }
                });
                let i = 0;
                while (i < maxDepth) {
                    mapY.set(getMapIndex(i++), new Set());
                }
                cache.afterAdd = (node, cascade = false) => {
                    setMapDepth(mapY, getMapIndex(node.depth), node);
                    if (cascade && node.length > 0) {
                        node.cascade(item => {
                            var _a;
                            if (item.length > 0) {
                                const depth = item.depth;
                                (_a = mapY.get(depth)) === null || _a === void 0 ? void 0 : _a.delete(item);
                                setMapDepth(mapY, getMapIndex(depth), item);
                            }
                        });
                    }
                };
            }
            const extensions = this.extensions;
            const length = extensions.length;
            let i = 0;
            while (i < length) {
                extensions[i++].beforeBaseLayout(sessionId);
            }
            let extensionsTraverse = this.extensionsTraverse;
            for (const depth of mapY.values()) {
                for (const parent of depth.values()) {
                    if (parent.length === 0) {
                        continue;
                    }
                    const floatContainer = parent.floatContainer;
                    const renderExtension = parent.renderExtension;
                    const axisY = parent.duplicate();
                    const q = axisY.length;
                    for (i = 0; i < q; ++i) {
                        let nodeY = axisY[i];
                        if (nodeY.rendered || !nodeY.visible) {
                            continue;
                        }
                        let parentY = nodeY.parent;
                        if (
                            q > 1 &&
                            i < q - 1 &&
                            nodeY.pageFlow &&
                            !nodeY.nodeGroup &&
                            (parentY.alignmentType === 0 ||
                                parentY.hasAlign(1 /* UNKNOWN */) ||
                                nodeY.hasAlign(4096 /* EXTENDABLE */)) &&
                            !parentY.hasAlign(2 /* AUTO_LAYOUT */) &&
                            nodeY.hasSection(APP_SECTION.DOM_TRAVERSE)
                        ) {
                            const horizontal = [];
                            const vertical = [];
                            let l = i,
                                m = 0;
                            if (parentY.layoutVertical && nodeY.hasAlign(4096 /* EXTENDABLE */)) {
                                horizontal.push(nodeY);
                                ++l;
                                ++m;
                            }
                            traverse: {
                                let floatActive = false,
                                    floating;
                                for (; l < q; ++l, ++m) {
                                    const item = axisY[l];
                                    if (item.pageFlow) {
                                        if (item.labelFor && !item.visible) {
                                            --m;
                                            continue;
                                        }
                                        if (floatContainer) {
                                            if (floatActive) {
                                                const float = clearMap.get(item);
                                                if (float) {
                                                    floatActive = false;
                                                }
                                            }
                                            floating = item.floating;
                                            if (floating) {
                                                floatActive = true;
                                            }
                                        }
                                        if (m === 0) {
                                            const next = item.siblingsTrailing[0];
                                            if (next) {
                                                if (!isHorizontalAligned(item) || next.alignedVertically([item]) > 0) {
                                                    vertical.push(item);
                                                } else {
                                                    horizontal.push(item);
                                                }
                                                continue;
                                            }
                                        }
                                        const previous = item.siblingsLeading[0];
                                        if (previous) {
                                            const orientation = horizontal.length > 0;
                                            if (floatContainer) {
                                                const status = item.alignedVertically(
                                                    orientation ? horizontal : vertical,
                                                    clearMap,
                                                    orientation
                                                );
                                                if (status > 0) {
                                                    if (horizontal.length > 0) {
                                                        if (
                                                            floatActive &&
                                                            status < 4 /* FLOAT_CLEAR */ &&
                                                            !item.siblingsLeading.some(
                                                                node => clearMap.has(node) && !horizontal.includes(node)
                                                            )
                                                        ) {
                                                            horizontal.push(item);
                                                            continue;
                                                        } else {
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
                                                    vertical.push(item);
                                                } else {
                                                    if (vertical.length > 0) {
                                                        break traverse;
                                                    }
                                                    horizontal.push(item);
                                                }
                                            } else {
                                                if (
                                                    item.alignedVertically(
                                                        orientation ? horizontal : vertical,
                                                        undefined,
                                                        orientation
                                                    ) > 0
                                                ) {
                                                    if (horizontal.length > 0) {
                                                        break traverse;
                                                    }
                                                    vertical.push(item);
                                                } else {
                                                    if (vertical.length > 0) {
                                                        break traverse;
                                                    }
                                                    horizontal.push(item);
                                                }
                                            }
                                        } else {
                                            break traverse;
                                        }
                                    } else if (item.autoPosition) {
                                        const r = vertical.length;
                                        if (r > 0) {
                                            if (vertical[r - 1].blockStatic && !item.renderExclude) {
                                                vertical.push(item);
                                            }
                                            break;
                                        } else {
                                            horizontal.push(item);
                                        }
                                    }
                                }
                            }
                            let r = horizontal.length,
                                complete = true,
                                layout,
                                segEnd;
                            if (r > 1) {
                                const items = horizontal.filter(item => !item.renderExclude || clearMap.has(item));
                                if (items.length > 1) {
                                    layout = controllerHandler.processTraverseHorizontal(
                                        new LayoutUI(parentY, nodeY, 0, 0, items),
                                        axisY
                                    );
                                }
                                segEnd = horizontal[r - 1];
                            } else {
                                r = vertical.length;
                                if (r > 1) {
                                    const items = vertical.filter(item => !item.renderExclude || clearMap.has(item));
                                    if (items.length > 1) {
                                        layout = controllerHandler.processTraverseVertical(
                                            new LayoutUI(parentY, nodeY, 0, 0, items),
                                            axisY
                                        );
                                    }
                                    segEnd = vertical[r - 1];
                                    if (isHorizontalAligned(segEnd) && segEnd !== axisY[q - 1]) {
                                        segEnd.addAlign(4096 /* EXTENDABLE */);
                                    }
                                }
                            }
                            if (layout) {
                                if (this.addLayout(layout)) {
                                    parentY = nodeY.parent;
                                } else {
                                    complete = false;
                                }
                            }
                            if (complete && segEnd === axisY[q - 1]) {
                                parentY.removeAlign(1 /* UNKNOWN */);
                            }
                        }
                        nodeY.removeAlign(4096 /* EXTENDABLE */);
                        if (i === q - 1) {
                            parentY.removeAlign(1 /* UNKNOWN */);
                        }
                        if (nodeY.renderAs && parentY.replaceTry({ child: nodeY, replaceWith: nodeY.renderAs })) {
                            nodeY.hide();
                            nodeY = nodeY.renderAs;
                            if (nodeY.positioned) {
                                parentY = nodeY.parent;
                            }
                        }
                        if (!nodeY.rendered && nodeY.hasSection(APP_SECTION.EXTENSION)) {
                            const descendant = extensionMap.get(nodeY.id);
                            let combined = descendant
                                ? (renderExtension === null || renderExtension === void 0
                                      ? void 0
                                      : renderExtension.concat(descendant)) || descendant
                                : renderExtension;
                            let next = false;
                            if (combined) {
                                const r = combined.length;
                                let j = 0;
                                while (j < r) {
                                    const ext = combined[j++];
                                    const result = ext.processChild(nodeY, parentY);
                                    if (result) {
                                        if (result.output) {
                                            this.addLayoutTemplate(result.outerParent || parentY, nodeY, result.output);
                                        }
                                        if (result.renderAs && result.outputAs) {
                                            this.addLayoutTemplate(
                                                result.parentAs || parentY,
                                                result.renderAs,
                                                result.outputAs
                                            );
                                        }
                                        if (result.parent) {
                                            parentY = result.parent;
                                        }
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
                                combined = nodeY.use
                                    ? prioritizeExtensions(nodeY.use, extensionsTraverse)
                                    : extensionsTraverse;
                                const r = combined.length;
                                let j = 0;
                                while (j < r) {
                                    const ext = combined[j++];
                                    if (ext.is(nodeY)) {
                                        if (
                                            ext.condition(nodeY, parentY) &&
                                            (!descendant || !descendant.includes(ext))
                                        ) {
                                            const result = ext.processNode(nodeY, parentY);
                                            if (result) {
                                                if (result.output) {
                                                    this.addLayoutTemplate(
                                                        result.outerParent || parentY,
                                                        nodeY,
                                                        result.output
                                                    );
                                                }
                                                if (result.renderAs && result.outputAs) {
                                                    this.addLayoutTemplate(
                                                        result.parentAs || parentY,
                                                        result.renderAs,
                                                        result.outputAs
                                                    );
                                                }
                                                if (result.parent) {
                                                    parentY = result.parent;
                                                }
                                                if (result.include) {
                                                    safeNestedArray(nodeY, 'renderExtension').push(ext);
                                                    ext.subscribers.add(nodeY);
                                                } else if (result.subscribe) {
                                                    ext.subscribers.add(nodeY);
                                                }
                                                if (result.remove) {
                                                    const index = extensionsTraverse.indexOf(ext);
                                                    if (index !== -1) {
                                                        extensionsTraverse = extensionsTraverse.slice(0);
                                                        extensionsTraverse.splice(index, 1);
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
                                const result =
                                    nodeY.length > 0
                                        ? controllerHandler.processUnknownParent(layout)
                                        : controllerHandler.processUnknownChild(layout);
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
                    if (a.innerWrapped === b) {
                        return -1;
                    } else if (a === b.innerWrapped) {
                        return 1;
                    }
                    const outerA = a.outerWrapper;
                    const outerB = b.outerWrapper;
                    if (a === outerB || (!outerA && outerB)) {
                        return -1;
                    } else if (b === outerA || (!outerB && outerA)) {
                        return 1;
                    }
                    if (a.nodeGroup && b.nodeGroup) {
                        return a.id < b.id ? -1 : 1;
                    } else if (a.nodeGroup) {
                        return -1;
                    } else if (b.nodeGroup) {
                        return 1;
                    }
                    return 0;
                }
                return a.depth < b.depth ? -1 : 1;
            });
            i = 0;
            while (i < length) {
                const ext = extensions[i++];
                for (const node of ext.subscribers) {
                    if (cache.contains(node)) {
                        ext.postBaseLayout(node);
                    }
                }
                ext.afterBaseLayout(sessionId);
            }
        }
        setConstraints(sessionId) {
            const cache = this.getProcessingCache(sessionId);
            this.controllerHandler.setConstraints(cache);
            const extensions = this.extensions;
            const length = extensions.length;
            let i = 0;
            while (i < length) {
                const ext = extensions[i++];
                for (const node of ext.subscribers) {
                    if (cache.contains(node)) {
                        ext.postConstraints(node);
                    }
                }
                ext.afterConstraints(sessionId);
            }
        }
        setResources(sessionId) {
            const resourceHandler = this.resourceHandler;
            this.getProcessingCache(sessionId).each(node => {
                resourceHandler.setBoxStyle(node);
                if (
                    node.hasResource(NODE_RESOURCE.VALUE_STRING) &&
                    node.visible &&
                    !node.imageElement &&
                    !node.svgElement
                ) {
                    resourceHandler.setFontStyle(node);
                    resourceHandler.setValueString(node);
                }
            });
            const extensions = this.extensions;
            const length = extensions.length;
            let i = 0;
            while (i < length) {
                extensions[i++].afterResources(sessionId);
            }
        }
        processFloatHorizontal(layout) {
            const controllerHandler = this.controllerHandler;
            const { containerType, alignmentType } = controllerHandler.containerTypeVertical;
            const clearMap = this.session.clearMap;
            const layerIndex = [];
            const inlineAbove = [];
            const leftAbove = [];
            const rightAbove = [];
            let leftBelow,
                rightBelow,
                leftSub,
                rightSub,
                inlineBelow,
                inheritStyle = false,
                clearing = false,
                clearedFloat = false,
                boxStyle;
            layout.each((node, index) => {
                const float = node.float;
                if (clearing && float === 'left') {
                    clearedFloat = true;
                }
                if (index > 0) {
                    const value = clearMap.get(node);
                    if (value) {
                        clearedFloat = true;
                    } else if (node.data(Application.KEY_NAME, 'cleared')) {
                        clearing = true;
                    }
                }
                if (!clearedFloat) {
                    if (float === 'left') {
                        leftAbove.push(node);
                    } else if (float === 'right') {
                        rightAbove.push(node);
                    } else if (leftAbove.length > 0 || rightAbove.length > 0) {
                        let top = node.linear.top;
                        if (node.styleText) {
                            const textBounds = node.textBounds;
                            if (textBounds) {
                                top = Math.max(textBounds.top, top);
                            }
                        }
                        top = Math.ceil(top);
                        if (node.blockStatic && leftAbove.some(item => top >= item.bounds.bottom)) {
                            if (inlineBelow) {
                                inlineBelow.push(node);
                            } else {
                                inlineBelow = [node];
                            }
                        } else {
                            inlineAbove.push(node);
                        }
                    } else {
                        inlineAbove.push(node);
                    }
                } else if (float === 'left') {
                    if (leftBelow) {
                        leftBelow.push(node);
                    } else {
                        leftBelow = [node];
                    }
                } else if (float === 'right') {
                    if (rightBelow) {
                        rightBelow.push(node);
                    } else {
                        rightBelow = [node];
                    }
                } else if (inlineBelow) {
                    inlineBelow.push(node);
                } else {
                    inlineBelow = [node];
                }
            });
            if (leftAbove.length > 0) {
                leftSub = leftBelow ? [leftAbove, leftBelow] : leftAbove;
            } else if (leftBelow) {
                leftSub = leftBelow;
            }
            if (rightAbove.length > 0) {
                rightSub = rightBelow ? [rightAbove, rightBelow] : rightAbove;
            } else if (rightBelow) {
                rightSub = rightBelow;
            }
            if (
                rightAbove.length +
                    ((rightBelow === null || rightBelow === void 0 ? void 0 : rightBelow.length) || 0) ===
                layout.length
            ) {
                layout.addAlign(1024 /* RIGHT */);
            }
            if (inlineAbove.length > 0) {
                layerIndex.push(inlineAbove);
                inheritStyle = layout.every(item => inlineAbove.includes(item) || !item.imageElement);
            }
            if (leftSub) {
                layerIndex.push(leftSub);
            }
            if (rightSub) {
                layerIndex.push(rightSub);
            }
            if (inlineBelow) {
                const { node, parent } = layout;
                if (inlineBelow.length > 1) {
                    inlineBelow[0].addAlign(4096 /* EXTENDABLE */);
                }
                inlineBelow.unshift(node);
                const wrapper = controllerHandler.createNodeGroup(node, inlineBelow, parent);
                wrapper.childIndex = node.childIndex;
                wrapper.containerName = node.containerName;
                boxStyle = wrapper.inherit(node, 'boxStyle');
                wrapper.innerWrapped = node;
                node.resetBox(15 /* MARGIN */, wrapper);
                node.resetBox(240 /* PADDING */, wrapper);
                this.addLayout(
                    new LayoutUI(
                        parent,
                        wrapper,
                        containerType,
                        alignmentType | (parent.blockStatic ? 32 /* BLOCK */ : 0),
                        inlineBelow
                    )
                );
                layout.parent = wrapper;
            }
            layout.type = controllerHandler.containerTypeVerticalMargin;
            layout.itemCount = layerIndex.length;
            layout.addAlign(32 /* BLOCK */);
            let i = 0,
                j;
            while (i < layout.itemCount) {
                const item = layerIndex[i++];
                let segments, itemCount, floatgroup;
                if (Array.isArray(item[0])) {
                    segments = item;
                    itemCount = segments.length;
                    let grouping = segments[0];
                    j = 1;
                    while (j < itemCount) {
                        grouping = grouping.concat(segments[j++]);
                    }
                    grouping.sort((a, b) => (a.childIndex < b.childIndex ? -1 : 1));
                    const node = layout.node;
                    if (node.layoutVertical) {
                        floatgroup = node;
                    } else {
                        floatgroup = controllerHandler.createNodeGroup(grouping[0], grouping, node);
                        this.addLayout(
                            LayoutUI.create({
                                parent: node,
                                node: floatgroup,
                                containerType,
                                alignmentType:
                                    alignmentType |
                                    (segments.some(seg => seg === rightSub || seg === rightAbove)
                                        ? 1024 /* RIGHT */
                                        : 0),
                                itemCount,
                            })
                        );
                    }
                } else {
                    segments = [item];
                    itemCount = 1;
                }
                j = 0;
                while (j < itemCount) {
                    const seg = segments[j++];
                    const node = floatgroup || layout.node;
                    const target = controllerHandler.createNodeGroup(seg[0], seg, node, {
                        delegate: true,
                        cascade: true,
                    });
                    const group = new LayoutUI(node, target, 0, 64 /* SEGMENTED */);
                    if (seg === inlineAbove) {
                        group.addAlign(128 /* COLUMN */);
                        if (inheritStyle) {
                            if (boxStyle) {
                                target.inheritApply('boxStyle', boxStyle);
                            } else {
                                target.inherit(layout.node, 'boxStyle');
                            }
                        }
                    } else {
                        group.addAlign(getFloatAlignmentType(seg));
                    }
                    if (seg.some(child => child.percentWidth > 0 || child.percentHeight > 0)) {
                        group.type = controllerHandler.containerTypePercent;
                        if (seg.length === 1) {
                            group.node.innerWrapped = seg[0];
                        }
                    } else if (seg.length === 1 || group.linearY) {
                        group.setContainerType(containerType, alignmentType);
                    } else if (!group.linearX) {
                        group.setContainerType(containerType, 1 /* UNKNOWN */);
                    } else {
                        controllerHandler.processLayoutHorizontal(group);
                    }
                    this.addLayout(group);
                    if (seg === inlineAbove) {
                        this.setFloatPadding(
                            node,
                            target,
                            inlineAbove,
                            leftSub && flatArray(leftSub),
                            rightSub && flatArray(rightSub)
                        );
                    }
                }
            }
            return layout;
        }
        processFloatVertical(layout) {
            const controllerHandler = this.controllerHandler;
            const { containerType, alignmentType } = controllerHandler.containerTypeVertical;
            const clearMap = this.session.clearMap;
            if (layout.containerType !== 0) {
                const node = layout.node;
                const parent = controllerHandler.createNodeGroup(node, [node], layout.parent);
                this.addLayout(new LayoutUI(parent, node, containerType, alignmentType, parent.children));
                layout.node = parent;
            } else {
                layout.setContainerType(containerType, alignmentType);
            }
            const staticRows = [];
            const floatedRows = [];
            const current = [];
            const floated = [];
            let clearReset = false,
                blockArea = false,
                layoutVertical = true;
            layout.each(node => {
                if (node.blockStatic && floated.length === 0) {
                    current.push(node);
                    blockArea = true;
                } else {
                    if (clearMap.has(node)) {
                        if (!node.floating) {
                            node.setBox(1 /* MARGIN_TOP */, { reset: 1 });
                            staticRows.push(current.slice(0));
                            floatedRows.push(floated.slice(0));
                            current.length = 0;
                            floated.length = 0;
                        } else {
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
                    } else {
                        if (clearReset && !clearMap.has(node)) {
                            layoutVertical = false;
                        }
                        current.push(node);
                    }
                }
            });
            if (floated.length > 0) {
                floatedRows.push(floated);
            }
            if (current.length > 0) {
                staticRows.push(current);
            }
            if (!layoutVertical) {
                const {
                    containerType: containerTypeParent,
                    alignmentType: alignmentTypeParent,
                } = controllerHandler.containerTypeVerticalMargin;
                const node = layout.node;
                const length = Math.max(floatedRows.length, staticRows.length);
                for (let i = 0; i < length; ++i) {
                    const pageFlow = staticRows[i];
                    const floating = floatedRows[i];
                    const blockCount = pageFlow.length;
                    if (!floating && blockCount > 0) {
                        const layoutType = controllerHandler.containerTypeVertical;
                        this.addLayout(
                            new LayoutUI(
                                node,
                                controllerHandler.createNodeGroup(pageFlow[0], pageFlow, node),
                                layoutType.containerType,
                                layoutType.alignmentType | 64 /* SEGMENTED */ | 32 /* BLOCK */,
                                pageFlow
                            )
                        );
                    } else {
                        const children = [];
                        let alignmentFloat = 0,
                            subgroup;
                        if (floating) {
                            if (floating.length > 1) {
                                const floatgroup = controllerHandler.createNodeGroup(floating[0], floating);
                                alignmentFloat = 256 /* FLOAT */;
                                if (blockCount === 0 && floating.every(item => item.float === 'right')) {
                                    alignmentFloat |= 1024 /* RIGHT */;
                                }
                                children.push(floatgroup);
                            } else {
                                children.push(floating[0]);
                            }
                        }
                        if (blockCount > 1 || floating) {
                            subgroup = controllerHandler.createNodeGroup(pageFlow[0], pageFlow);
                            children.push(subgroup);
                        } else if (blockCount === 1) {
                            children.push(pageFlow[0]);
                        }
                        const parent = controllerHandler.createNodeGroup((floating || pageFlow)[0], children, node);
                        this.addLayout(
                            new LayoutUI(node, parent, containerTypeParent, alignmentTypeParent | alignmentFloat)
                        );
                        let j = 0;
                        while (j < children.length) {
                            const item = children[j++];
                            this.addLayout(
                                new LayoutUI(
                                    parent,
                                    item,
                                    containerType,
                                    alignmentType | 64 /* SEGMENTED */ | 32 /* BLOCK */,
                                    item.children
                                )
                            );
                        }
                        if (blockCount && floating && subgroup) {
                            const [leftAbove, rightAbove] = partitionArray(floating, item => item.float !== 'right');
                            this.setFloatPadding(node, subgroup, pageFlow, leftAbove, rightAbove);
                        }
                    }
                }
            }
            return layout;
        }
        createPseduoElement(element, pseudoElt, sessionId) {
            var _a;
            let styleMap = getElementCache$2(element, `styleMap${pseudoElt}`, sessionId);
            if (element.tagName === 'Q') {
                if (!styleMap) {
                    styleMap = {};
                    setElementCache$2(element, `styleMap${pseudoElt}`, sessionId, styleMap);
                }
                let content = styleMap.content;
                if (!content) {
                    content =
                        getStyle$1(element, pseudoElt).getPropertyValue('content') ||
                        (pseudoElt === '::before' ? 'open-quote' : 'close-quote');
                    styleMap.content = content;
                }
            }
            if (styleMap) {
                let value = styleMap.content;
                if (value) {
                    const textContent = trimBoth$1(value, '"');
                    if (!isString(textContent)) {
                        const absolute = hasCoords(styleMap.position);
                        if (pseudoElt === '::after') {
                            if (
                                (absolute || textContent === '' || !checkPseudoAfter(element)) &&
                                !checkPseudoDimension(styleMap, true, absolute)
                            ) {
                                return undefined;
                            }
                        } else {
                            const childNodes = element.childNodes;
                            const length = childNodes.length;
                            let i = 0;
                            while (i < length) {
                                const child = childNodes[i++];
                                if (child.nodeName === '#text') {
                                    if (isString(child.textContent)) {
                                        break;
                                    }
                                } else if (hasComputedStyle$2(child)) {
                                    const style = getStyle$1(child);
                                    if (hasCoords(styleMap.position)) {
                                        continue;
                                    } else if (style.getPropertyValue('float') !== 'none') {
                                        return undefined;
                                    }
                                    break;
                                }
                            }
                            if (!checkPseudoDimension(styleMap, false, absolute)) {
                                return undefined;
                            }
                        }
                    } else if (value === 'inherit') {
                        let current = element;
                        do {
                            value = getStyle$1(current).getPropertyValue('content');
                            if (value !== 'inherit') {
                                break;
                            }
                            current = current.parentElement;
                        } while (current !== null);
                    }
                    const style = getStyle$1(element);
                    let tagName = '',
                        content = '';
                    let i = 0;
                    while (i < TEXT_STYLE.length) {
                        const attr = TEXT_STYLE[i++];
                        if (!styleMap[attr]) {
                            styleMap[attr] = style[attr];
                        }
                    }
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
                                content = getPseudoQuoteValue(element, pseudoElt, '“', '‘', sessionId);
                            }
                            break;
                        case 'close-quote':
                            if (pseudoElt === '::after') {
                                content = getPseudoQuoteValue(element, pseudoElt, '”', '’', sessionId);
                            }
                            break;
                        default: {
                            const url = resolveURL(value);
                            if (url) {
                                content = url;
                                if (hasMimeType$1(this._controllerSettings.mimeType.image, url)) {
                                    tagName = 'img';
                                } else {
                                    content = '';
                                }
                            } else {
                                const pattern = /\s*(?:attr\(([^)]+)\)|(counter)\(([^,)]+)(?:,\s+([a-z-]+))?\)|(counters)\(([^,]+),\s+"([^"]*)"(?:,\s+([a-z-]+))?\)|"([^"]+)")\s*/g;
                                let found = false,
                                    match;
                                while ((match = pattern.exec(value))) {
                                    const attr = match[1];
                                    if (attr) {
                                        content += getNamedItem$1(element, attr.trim());
                                    } else if (match[2] || match[5]) {
                                        const counterType = match[2] === 'counter';
                                        const [counterName, styleName] = counterType
                                            ? [match[3], match[4] || 'decimal']
                                            : [match[6], match[8] || 'decimal'];
                                        const initialValue =
                                            ((_a = getCounterIncrementValue(
                                                element,
                                                counterName,
                                                pseudoElt,
                                                sessionId,
                                                0
                                            )) !== null && _a !== void 0
                                                ? _a
                                                : 1) +
                                            (getCounterValue(style.getPropertyValue('counter-reset'), counterName, 0) ||
                                                0);
                                        const subcounter = [];
                                        let current = element,
                                            counter = initialValue,
                                            ascending = false,
                                            lastResetElement;
                                        const incrementCounter = (increment, pseudo) => {
                                            if (subcounter.length === 0) {
                                                counter += increment;
                                            } else if (ascending || pseudo) {
                                                subcounter[subcounter.length - 1] += increment;
                                            }
                                        };
                                        const cascadeCounterSibling = sibling => {
                                            if (
                                                getCounterValue(
                                                    getStyle$1(sibling).getPropertyValue('counter-reset'),
                                                    counterName
                                                ) === undefined
                                            ) {
                                                iterateArray$2(sibling.children, item => {
                                                    if (item.className !== '__squared.pseudo') {
                                                        let increment = getCounterIncrementValue(
                                                            item,
                                                            counterName,
                                                            pseudoElt,
                                                            sessionId
                                                        );
                                                        if (increment) {
                                                            incrementCounter(increment, true);
                                                        }
                                                        const childStyle = getStyle$1(item);
                                                        increment = getCounterValue(
                                                            childStyle.getPropertyValue('counter-increment'),
                                                            counterName
                                                        );
                                                        if (increment) {
                                                            incrementCounter(increment, false);
                                                        }
                                                        increment = getCounterValue(
                                                            childStyle.getPropertyValue('counter-reset'),
                                                            counterName
                                                        );
                                                        if (increment !== undefined) {
                                                            return true;
                                                        }
                                                        cascadeCounterSibling(item);
                                                    }
                                                    return;
                                                });
                                            }
                                        };
                                        while (current !== null) {
                                            ascending = false;
                                            if (current.previousElementSibling) {
                                                current = current.previousElementSibling;
                                                if (current) {
                                                    cascadeCounterSibling(current);
                                                } else {
                                                    break;
                                                }
                                            } else {
                                                current = current.parentElement;
                                                if (current === null) {
                                                    break;
                                                }
                                                ascending = true;
                                            }
                                            if (current.className !== '__squared.pseudo') {
                                                const pesudoIncrement = getCounterIncrementValue(
                                                    current,
                                                    counterName,
                                                    pseudoElt,
                                                    sessionId
                                                );
                                                if (pesudoIncrement) {
                                                    incrementCounter(pesudoIncrement, true);
                                                }
                                                const currentStyle = getStyle$1(current);
                                                const counterIncrement = getCounterValue(
                                                    currentStyle.getPropertyValue('counter-increment'),
                                                    counterName
                                                );
                                                if (counterIncrement) {
                                                    incrementCounter(counterIncrement, false);
                                                }
                                                const counterReset = getCounterValue(
                                                    currentStyle.getPropertyValue('counter-reset'),
                                                    counterName
                                                );
                                                if (counterReset !== undefined) {
                                                    if (!lastResetElement) {
                                                        counter += counterReset;
                                                    }
                                                    lastResetElement = current;
                                                    if (counterType) {
                                                        break;
                                                    } else if (ascending) {
                                                        subcounter.push((pesudoIncrement || 0) + counterReset);
                                                    }
                                                }
                                            }
                                        }
                                        if (lastResetElement) {
                                            if (!counterType && subcounter.length > 1) {
                                                subcounter.reverse().splice(1, 1);
                                                const textValue = match[7];
                                                i = 0;
                                                while (i < subcounter.length) {
                                                    content +=
                                                        convertListStyle(styleName, subcounter[i++], true) + textValue;
                                                }
                                            }
                                        } else {
                                            counter = initialValue;
                                        }
                                        content += convertListStyle(styleName, counter, true);
                                    } else if (match[9]) {
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
                    if (!styleMap.display) {
                        styleMap.display = 'inline';
                    }
                    if (content || value === '""') {
                        if (tagName === '') {
                            tagName = /^(inline|table)/.test(styleMap.display) ? 'span' : 'div';
                        }
                        const pseudoElement = document.createElement(tagName);
                        pseudoElement.className = '__squared.pseudo';
                        pseudoElement.style.setProperty('display', 'none');
                        if (pseudoElt === '::before') {
                            element.insertBefore(pseudoElement, element.childNodes[0]);
                        } else {
                            element.appendChild(pseudoElement);
                        }
                        if (tagName === 'img') {
                            pseudoElement.src = content;
                            const image = this.resourceHandler.getImage(content);
                            if (image) {
                                if (!styleMap.width && image.width > 0) {
                                    styleMap.width = formatPX$1(image.width);
                                }
                                if (!styleMap.height && image.height > 0) {
                                    styleMap.height = formatPX$1(image.height);
                                }
                            }
                        } else if (value !== '""') {
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
            return options
                ? Object.assign(Object.assign({}, options), {
                      assets: options.assets ? this.layouts.concat(options.assets) : this.layouts,
                  })
                : { assets: this.layouts };
        }
        createLayoutControl(parent, node) {
            return new LayoutUI(parent, node, node.containerType, node.alignmentType, node.children);
        }
        setFloatPadding(parent, target, inlineAbove, leftAbove = [], rightAbove = []) {
            let paddingNodes = [];
            let i = 0;
            while (i < inlineAbove.length) {
                const child = inlineAbove[i++];
                if (requirePadding(child) || child.centerAligned) {
                    paddingNodes.push(child);
                }
                if (child.blockStatic) {
                    paddingNodes = paddingNodes.concat(
                        child.cascade(item => requirePadding(item, item.depth - child.depth))
                    );
                }
            }
            const length = paddingNodes.length;
            if (length === 0) {
                return;
            }
            const bottom = target.bounds.bottom;
            const boxWidth = parent.actualBoxWidth();
            let q = leftAbove.length;
            if (q > 0) {
                let floatPosition = -Infinity,
                    spacing = false;
                i = 0;
                while (i < q) {
                    const child = leftAbove[i++];
                    if (child.bounds.top < bottom) {
                        const right = child.linear.right + getRelativeOffset(child, false);
                        if (right > floatPosition) {
                            floatPosition = right;
                            spacing = child.marginRight > 0;
                        } else if (right === floatPosition && child.marginRight <= 0) {
                            spacing = false;
                        }
                    }
                }
                if (floatPosition !== -Infinity) {
                    let marginLeft = -Infinity;
                    i = 0;
                    while (i < length) {
                        const child = paddingNodes[i++];
                        if (Math.floor(child.linear.left) <= floatPosition || child.centerAligned) {
                            marginLeft = Math.max(marginLeft, child.marginLeft);
                        }
                    }
                    if (marginLeft !== -Infinity) {
                        const offset =
                            floatPosition -
                            parent.box.left -
                            marginLeft -
                            maxArray(target.map(child => (!paddingNodes.includes(child) ? child.marginLeft : 0)));
                        if (offset > 0 && offset < boxWidth) {
                            target.modifyBox(
                                128 /* PADDING_LEFT */,
                                offset +
                                    (!spacing && target.find(child => child.multiline, { cascade: true })
                                        ? Math.max(
                                              marginLeft,
                                              this._controllerSettings.deviations.textMarginBoundarySize
                                          )
                                        : 0)
                            );
                            setColumnMaxWidth(leftAbove, offset);
                        }
                    }
                }
            }
            q = rightAbove.length;
            if (q > 0) {
                let floatPosition = Infinity,
                    spacing = false;
                i = 0;
                while (i < q) {
                    const child = rightAbove[i++];
                    if (child.bounds.top < bottom) {
                        const left = child.linear.left + getRelativeOffset(child, true);
                        if (left < floatPosition) {
                            floatPosition = left;
                            spacing = child.marginLeft > 0;
                        } else if (left === floatPosition && child.marginLeft <= 0) {
                            spacing = false;
                        }
                    }
                }
                if (floatPosition !== Infinity) {
                    let marginRight = -Infinity;
                    i = 0;
                    while (i < length) {
                        const child = paddingNodes[i++];
                        if (child.multiline || child.centerAligned || Math.ceil(child.linear.right) >= floatPosition) {
                            marginRight = Math.max(marginRight, child.marginRight);
                        }
                    }
                    if (marginRight !== -Infinity) {
                        const offset =
                            parent.box.right -
                            floatPosition -
                            marginRight -
                            maxArray(target.map(child => (!paddingNodes.includes(child) ? child.marginRight : 0)));
                        if (offset > 0 && offset < boxWidth) {
                            target.modifyBox(
                                32 /* PADDING_RIGHT */,
                                offset +
                                    (!spacing && target.find(child => child.multiline, { cascade: true })
                                        ? Math.max(
                                              marginRight,
                                              this._controllerSettings.deviations.textMarginBoundarySize
                                          )
                                        : 0)
                            );
                            setColumnMaxWidth(rightAbove, offset);
                        }
                    }
                }
            }
        }
        get mainElement() {
            return document.body;
        }
        get layouts() {
            return this._layouts.sort((a, b) => {
                const indexA = a.index;
                const indexB = b.index;
                if (indexA !== indexB) {
                    if (indexA === 0 || indexB === Infinity || (indexB === undefined && !(indexA === Infinity))) {
                        return -1;
                    } else if (
                        indexB === 0 ||
                        indexA === Infinity ||
                        (indexA === undefined && !(indexB === Infinity))
                    ) {
                        return 1;
                    } else if (indexA !== undefined && indexB !== undefined) {
                        return indexA < indexB ? -1 : 1;
                    }
                }
                return 0;
            });
        }
        get extensionsCascade() {
            return this.extensions.filter(item => !!item.init);
        }
        get extensionsTraverse() {
            return this.extensions.filter(item => !item.eventOnly);
        }
        get clearMap() {
            return this.session.clearMap;
        }
    }

    const { USER_AGENT: USER_AGENT$1, isUserAgent: isUserAgent$1 } = squared.lib.client;
    const {
        CSS_PROPERTIES: CSS_PROPERTIES$3,
        formatPX: formatPX$2,
        getStyle: getStyle$2,
        hasCoords: hasCoords$1,
        isLength: isLength$1,
        isPercent: isPercent$1,
    } = squared.lib.css;
    const { withinViewport } = squared.lib.dom;
    const {
        actualClientRect: actualClientRect$1,
        getElementCache: getElementCache$3,
        setElementCache: setElementCache$3,
    } = squared.lib.session;
    const {
        capitalize: capitalize$3,
        convertFloat: convertFloat$1,
        flatArray: flatArray$1,
        iterateArray: iterateArray$3,
        joinArray,
        safeNestedArray: safeNestedArray$1,
    } = squared.lib.util;
    const BORDER_TOP$1 = CSS_PROPERTIES$3.borderTop.value;
    const BORDER_RIGHT$1 = CSS_PROPERTIES$3.borderRight.value;
    const BORDER_BOTTOM$1 = CSS_PROPERTIES$3.borderBottom.value;
    const BORDER_LEFT$1 = CSS_PROPERTIES$3.borderLeft.value;
    const BOX_BORDER = [BORDER_TOP$1, BORDER_RIGHT$1, BORDER_BOTTOM$1, BORDER_LEFT$1];
    function setBorderStyle(styleMap, defaultColor) {
        if (
            !styleMap.border &&
            !(
                BORDER_TOP$1[0] in styleMap ||
                BORDER_RIGHT$1[0] in styleMap ||
                BORDER_BOTTOM$1[0] in styleMap ||
                BORDER_LEFT$1[0] in styleMap
            )
        ) {
            styleMap.border = `1px outset ${defaultColor}`;
            let i = 0;
            while (i < 4) {
                const border = BOX_BORDER[i++];
                styleMap[border[0]] = '1px';
                styleMap[border[1]] = 'outset';
                styleMap[border[2]] = defaultColor;
            }
            return true;
        }
        return false;
    }
    function setButtonStyle(styleMap, applied, defaultColor) {
        if (applied) {
            const backgroundColor = styleMap.backgroundColor;
            if (!backgroundColor || backgroundColor === 'initial') {
                styleMap.backgroundColor = defaultColor;
            }
        }
        if (!styleMap.textAlign) {
            styleMap.textAlign = 'center';
        }
        if (!styleMap.padding && !CSS_PROPERTIES$3.padding.value.some(attr => !!styleMap[attr])) {
            styleMap.paddingTop = '2px';
            styleMap.paddingRight = '6px';
            styleMap.paddingBottom = '3px';
            styleMap.paddingLeft = '6px';
        }
    }
    function pushIndent(value, depth, char = '\t', indent) {
        if (depth > 0) {
            if (indent === undefined) {
                indent = char.repeat(depth);
            }
            return joinArray(value.split('\n'), line => (line !== '' ? indent + line : ''));
        }
        return value;
    }
    function pushIndentArray(values, depth, char = '\t', separator = '') {
        if (depth > 0) {
            let result = '';
            const indent = char.repeat(depth);
            const length = values.length;
            let i = 0;
            while (i < length) {
                result += (i > 0 ? separator : '') + pushIndent(values[i++], depth, char, indent);
            }
            return result;
        }
        return values.join(separator);
    }
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
        preventNodeCascade(node) {
            return this._unsupportedCascade.has(node.tagName);
        }
        includeElement(element) {
            const tagName = element.tagName;
            return (
                !(
                    this._unsupportedTagName.has(tagName) ||
                    (tagName === 'INPUT' && this._unsupportedTagName.has(tagName + ':' + element.type))
                ) || element.contentEditable === 'true'
            );
        }
        reset() {
            this._requireFormat = false;
            this._beforeOutside = {};
            this._beforeInside = {};
            this._afterInside = {};
            this._afterOutside = {};
        }
        applyDefaultStyles(element, sessionId) {
            let styleMap;
            if (element.nodeName === '#text') {
                styleMap = {
                    position: 'static',
                    display: 'inline',
                    verticalAlign: 'baseline',
                    float: 'none',
                    clear: 'none',
                };
            } else {
                styleMap = getElementCache$3(element, 'styleMap', sessionId) || {};
                const tagName = element.tagName;
                if (isUserAgent$1(4 /* FIREFOX */)) {
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
                            if (!styleMap.display) {
                                styleMap.display = 'inline-block';
                            }
                            break;
                        case 'FIELDSET':
                            if (!styleMap.display) {
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
                                styleMap.paddingTop = formatPX$2(convertFloat$1(styleMap.paddingTop) + 1);
                                styleMap.paddingRight = formatPX$2(convertFloat$1(styleMap.paddingRight) + 1);
                                styleMap.paddingBottom = formatPX$2(convertFloat$1(styleMap.paddingBottom) + 1);
                                styleMap.paddingLeft = formatPX$2(convertFloat$1(styleMap.paddingLeft) + 1);
                                break;
                            default: {
                                const style = this.localSettings.style;
                                const result = setBorderStyle(styleMap, style.inputBorderColor);
                                switch (type) {
                                    case 'file':
                                    case 'reset':
                                    case 'submit':
                                    case 'button':
                                        setButtonStyle(styleMap, result, style.inputBackgroundColor);
                                        break;
                                }
                                break;
                            }
                        }
                        break;
                    }
                    case 'BUTTON': {
                        const style = this.localSettings.style;
                        setButtonStyle(
                            styleMap,
                            setBorderStyle(styleMap, style.inputBorderColor),
                            style.inputBackgroundColor
                        );
                        break;
                    }
                    case 'TEXTAREA':
                    case 'SELECT':
                        setBorderStyle(styleMap, this.localSettings.style.inputBorderColor);
                        break;
                    case 'BODY': {
                        const backgroundColor = styleMap.backgroundColor;
                        if (!backgroundColor || backgroundColor === 'initial') {
                            styleMap.backgroundColor = 'rgb(255, 255, 255)';
                        }
                        break;
                    }
                    case 'FORM':
                        if (!styleMap.marginTop) {
                            styleMap.marginTop = '0px';
                        }
                        break;
                    case 'LI':
                        if (!styleMap.listStyleImage) {
                            const style = getStyle$2(element);
                            styleMap.listStyleImage = style.getPropertyValue('list-style-image');
                        }
                        break;
                    case 'IFRAME':
                        if (!styleMap.display) {
                            styleMap.display = 'block';
                        }
                    case 'IMG':
                    case 'CANVAS':
                    case 'svg':
                    case 'VIDEO':
                    case 'OBJECT':
                    case 'EMBED': {
                        this.setElementDimension(element, tagName, styleMap, 'width', 'height');
                        this.setElementDimension(element, tagName, styleMap, 'height', 'width');
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
            } else {
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
            } else {
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
            } else {
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
            } else {
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
            return id === undefined
                ? this._requireFormat
                : id in this._beforeOutside ||
                      id in this._beforeInside ||
                      id in this._afterInside ||
                      id in this._afterOutside;
        }
        visibleElement(element, sessionId, pseudoElt) {
            let style, width, height;
            if (pseudoElt) {
                const parentElement = element.parentElement;
                style = parentElement ? getStyle$2(parentElement, pseudoElt) : getStyle$2(element);
                width = 1;
                height = 1;
            } else {
                style = getStyle$2(element);
                if (style.getPropertyValue('display') !== 'none') {
                    const rect = actualClientRect$1(element, sessionId);
                    if (!withinViewport(rect)) {
                        return false;
                    }
                    ({ width, height } = rect);
                } else {
                    return false;
                }
            }
            if (width > 0 && height > 0) {
                return (
                    style.getPropertyValue('visibility') === 'visible' ||
                    !hasCoords$1(style.getPropertyValue('position'))
                );
            } else if (
                !pseudoElt &&
                ((element.tagName === 'IMG' && style.getPropertyValue('display') !== 'none') ||
                    iterateArray$3(element.children, item => this.visibleElement(item, sessionId)) === Infinity)
            ) {
                return true;
            }
            return (
                !hasCoords$1(style.getPropertyValue('position')) &&
                ((width > 0 && style.getPropertyValue('float') !== 'none') ||
                    (pseudoElt && style.getPropertyValue('clear') !== 'none') ||
                    (style.getPropertyValue('display') === 'block' &&
                        (parseInt(style.getPropertyValue('margin-top')) !== 0 ||
                            parseInt(style.getPropertyValue('margin-bottom')) !== 0)))
            );
        }
        evaluateNonStatic(documentRoot, cache) {
            const altered = new Set();
            const removed = new Set();
            const escaped = new Map();
            cache.each(node => {
                if (node.floating) {
                    if (node.float === 'left') {
                        const actualParent = node.actualParent;
                        let parent = actualParent,
                            previousParent;
                        while (
                            (parent === null || parent === void 0 ? void 0 : parent.tagName) === 'P' &&
                            !parent.documentRoot
                        ) {
                            previousParent = parent;
                            parent = parent.actualParent;
                        }
                        if (parent && previousParent && parent !== actualParent && parent.tagName === 'DIV') {
                            if (escaped.has(previousParent)) {
                                escaped.get(previousParent).appending.push(node);
                            } else {
                                escaped.set(previousParent, { parent, appending: [node] });
                            }
                        }
                    }
                } else if (!node.pageFlow && !node.documentRoot) {
                    const actualParent = node.actualParent;
                    const absoluteParent = node.absoluteParent;
                    let parent;
                    switch (node.css('position')) {
                        case 'fixed':
                            if (!node.autoPosition) {
                                parent = documentRoot;
                                break;
                            }
                        case 'absolute': {
                            parent = absoluteParent;
                            if (node.autoPosition) {
                                if (
                                    !node.siblingsLeading.some(
                                        item => item.multiline || (item.excluded && !item.blockStatic)
                                    )
                                ) {
                                    node.cssApply({ display: 'inline-block', verticalAlign: 'top' }, true);
                                } else {
                                    node.autoPosition = false;
                                }
                                parent = actualParent;
                            } else if (this.userSettings.supportNegativeLeftTop) {
                                let outside = false;
                                while (
                                    parent &&
                                    parent !== documentRoot &&
                                    ((!parent.rightAligned && !parent.centerAligned) || !parent.pageFlow)
                                ) {
                                    const linear = parent.linear;
                                    if (!outside) {
                                        if (
                                            (node.hasPX('top') && node.hasPX('bottom')) ||
                                            (node.hasPX('left') && node.hasPX('right'))
                                        ) {
                                            break;
                                        } else {
                                            const overflowX = parent.css('overflowX') === 'hidden';
                                            const overflowY = parent.css('overflowY') === 'hidden';
                                            if (overflowX && overflowY) {
                                                break;
                                            }
                                            const outsideX = !overflowX && node.outsideX(linear);
                                            const outsideY = !overflowY && node.outsideY(linear);
                                            if (
                                                (outsideX && (node.left < 0 || node.right > 0)) ||
                                                (outsideY && (node.top < 0 || node.bottom !== 0))
                                            ) {
                                                outside = true;
                                            } else if (
                                                !overflowX &&
                                                (((node.left < 0 || node.right > 0) &&
                                                    Math.ceil(node.bounds.right) < linear.left) ||
                                                    ((node.left > 0 || node.right < 0) &&
                                                        Math.floor(node.bounds.left) > linear.right)) &&
                                                parent.some(item => item.pageFlow)
                                            ) {
                                                outside = true;
                                            } else if (
                                                !overflowY &&
                                                (((node.top < 0 || node.bottom > 0) &&
                                                    Math.ceil(node.bounds.bottom) < parent.bounds.top) ||
                                                    ((node.top > 0 || node.bottom < 0) &&
                                                        Math.floor(node.bounds.top) > parent.bounds.bottom))
                                            ) {
                                                outside = true;
                                            } else if (
                                                outsideX &&
                                                outsideY &&
                                                (!parent.pageFlow ||
                                                    (parent.actualParent.documentRoot &&
                                                        (node.top > 0 || node.left > 0)))
                                            ) {
                                                outside = true;
                                            } else if (
                                                !overflowX &&
                                                !overflowY &&
                                                !node.intersectX(linear) &&
                                                !node.intersectY(linear)
                                            ) {
                                                outside = true;
                                            } else {
                                                break;
                                            }
                                        }
                                    } else if (parent.layoutElement) {
                                        parent = absoluteParent;
                                        break;
                                    } else if (node.withinX(linear) && node.withinY(linear)) {
                                        break;
                                    }
                                    parent = parent.actualParent;
                                }
                            }
                            break;
                        }
                    }
                    if (!parent) {
                        parent = documentRoot;
                    }
                    if (parent !== actualParent) {
                        if (absoluteParent.positionRelative && parent !== absoluteParent) {
                            const { left, right, top, bottom } = absoluteParent;
                            const bounds = node.bounds;
                            if (left !== 0) {
                                bounds.left += left;
                                bounds.right += left;
                            } else if (!absoluteParent.hasPX('left') && right !== 0) {
                                bounds.left -= right;
                                bounds.right -= right;
                            }
                            if (top !== 0) {
                                bounds.top += top;
                                bounds.bottom += top;
                            } else if (!absoluteParent.hasPX('top') && bottom !== 0) {
                                bounds.top -= bottom;
                                bounds.bottom -= bottom;
                            }
                            node.unset('box');
                            node.unset('linear');
                        }
                        let opacity = node.toFloat('opacity', 1),
                            current = actualParent;
                        do {
                            opacity *= current.toFloat('opacity', 1);
                            current = current.actualParent;
                        } while (current && current !== parent);
                        node.css('opacity', opacity.toString());
                        node.parent = parent;
                        node.containerIndex = Infinity;
                        altered.add(parent);
                        removed.add(actualParent);
                    }
                    node.documentParent = parent;
                }
            });
            for (const node of removed) {
                node.each((item, index) => (item.containerIndex = index));
            }
            for (const [previousParent, data] of escaped.entries()) {
                const { parent, appending } = data;
                const children = parent.children;
                if (children.includes(previousParent)) {
                    const actualParent = new Set();
                    const { childIndex, containerIndex } = previousParent;
                    const documentChildren = parent.naturalChildren.slice(0);
                    const target = children[containerIndex];
                    const depth = parent.depth + 1;
                    for (let i = 0, j = 0, k = 0, prepend = false; i < appending.length; ++i) {
                        const item = appending[i];
                        if (item.containerIndex === 0) {
                            prepend = true;
                        } else if (prepend) {
                            const previous = appending[i - 1];
                            prepend =
                                item.containerIndex - previous.containerIndex === 1 &&
                                item.actualParent === previous.actualParent;
                        }
                        const increment = j + (prepend ? 0 : k + 1);
                        const l = childIndex + increment;
                        const m = containerIndex + increment;
                        documentChildren.splice(l, 0, item);
                        children.splice(m, 0, item);
                        if (prepend) {
                            target.siblingsLeading.unshift(item);
                            ++j;
                        } else {
                            ++k;
                        }
                        item.parent.remove(item);
                        item.init(parent, depth, item.childIndex);
                        item.documentParent = parent;
                        const clear = item.css('clear');
                        switch (clear) {
                            case 'left':
                            case 'right':
                            case 'both':
                                notFound: {
                                    let clearing;
                                    let n = l - 1;
                                    while (n >= 0) {
                                        const sibling = documentChildren[n--];
                                        if (sibling.floating) {
                                            const float = sibling.float;
                                            if (clear === 'both' || float === clear) {
                                                this.application.session.clearMap.set(item, clear);
                                                let nextSibling = item.nextElementSibling;
                                                while (nextSibling !== null) {
                                                    if (nextSibling.floating && !appending.includes(nextSibling)) {
                                                        appending.push(nextSibling);
                                                    }
                                                    nextSibling = nextSibling.nextElementSibling;
                                                }
                                                break;
                                            } else if (float === clearing) {
                                                break;
                                            }
                                        } else {
                                            const clearBefore = sibling.css('clear');
                                            switch (clearBefore) {
                                                case 'left':
                                                case 'right':
                                                    if (clear === clearBefore) {
                                                        break notFound;
                                                    } else {
                                                        clearing = clearBefore;
                                                    }
                                                    break;
                                                case 'both':
                                                    break notFound;
                                            }
                                        }
                                    }
                                }
                                break;
                        }
                        actualParent.add(item.actualParent);
                    }
                    parent.each((item, index) => (item.containerIndex = index));
                    parent.floatContainer = true;
                    const length = documentChildren.length;
                    let i = 0,
                        j;
                    while (i < appending.length) {
                        const item = appending[i++];
                        const index = documentChildren.findIndex(child => child === item);
                        if (index !== -1) {
                            const siblingsLeading = [];
                            const siblingsTrailing = [];
                            j = index - 1;
                            while (j >= 0) {
                                const sibling = documentChildren[j--];
                                siblingsLeading.push(sibling);
                                if (!sibling.excluded) {
                                    break;
                                }
                            }
                            j = index + 1;
                            while (j < length) {
                                const sibling = documentChildren[j++];
                                siblingsTrailing.push(sibling);
                                if (!sibling.excluded) {
                                    break;
                                }
                            }
                            item.siblingsLeading = siblingsLeading;
                            item.siblingsTrailing = siblingsTrailing;
                        }
                    }
                    for (const item of actualParent) {
                        let floating = false;
                        item.each((child, index) => {
                            if (child.floating) {
                                floating = true;
                            }
                            child.containerIndex = index;
                        });
                        if (!floating) {
                            item.floatContainer = false;
                        }
                    }
                }
            }
            for (const node of altered) {
                const layers = [];
                let maxIndex = -1;
                node.each(item => {
                    if (item.containerIndex === Infinity) {
                        node.some(adjacent => {
                            let valid = adjacent.naturalElements.includes(item);
                            if (!valid) {
                                const nested = adjacent.cascade();
                                valid = item.ascend({ condition: child => nested.includes(child) }).length > 0;
                            }
                            if (valid) {
                                safeNestedArray$1(
                                    layers,
                                    adjacent.containerIndex +
                                        (item.zIndex >= 0 || adjacent !== item.actualParent ? 1 : 0)
                                ).push(item);
                            }
                            return valid;
                        });
                    } else if (item.containerIndex > maxIndex) {
                        maxIndex = item.containerIndex;
                    }
                });
                const length = layers.length;
                if (length > 0) {
                    const children = node.children;
                    for (let i = 0, j = 0, k = 1; i < length; ++i, ++j) {
                        const order = layers[i];
                        if (order) {
                            order
                                .sort((a, b) => {
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
                                .forEach(item => (item.containerIndex = maxIndex + k++));
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
                    node.retainAs(flatArray$1(children));
                }
            }
        }
        sortInitialCache(cache) {
            cache.sort((a, b) => {
                if (a.depth !== b.depth) {
                    return a.depth < b.depth ? -1 : 1;
                } else {
                    const parentA = a.documentParent;
                    const parentB = b.documentParent;
                    if (parentA !== parentB) {
                        const depthA = parentA.depth;
                        const depthB = parentB.depth;
                        if (depthA !== depthB) {
                            return depthA < depthB ? -1 : 1;
                        } else if (parentA.actualParent === parentB.actualParent) {
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
                switch (item.type) {
                    case 1 /* XML */: {
                        const node = item.node;
                        const { controlName, attributes } = item;
                        const { id, renderTemplates } = node;
                        const next = depth + 1;
                        const previous = node.depth < 0 ? depth + node.depth : depth;
                        const beforeInside = this.getBeforeInsideTemplate(id, next);
                        const afterInside = this.getAfterInsideTemplate(id, next);
                        let template =
                            indent +
                            '<' +
                            controlName +
                            (depth === 0 ? '{#0}' : '') +
                            (showAttributes
                                ? attributes
                                    ? pushIndent(attributes, next)
                                    : node.extractAttributes(next)
                                : '');
                        if (renderTemplates || beforeInside !== '' || afterInside !== '') {
                            template +=
                                '>\n' +
                                beforeInside +
                                (renderTemplates
                                    ? this.cascadeDocument(this.sortRenderPosition(node, renderTemplates), next)
                                    : '') +
                                afterInside +
                                indent +
                                `</${controlName}>\n`;
                        } else {
                            template += ' />\n';
                        }
                        output +=
                            this.getBeforeOutsideTemplate(id, previous) +
                            template +
                            this.getAfterOutsideTemplate(id, previous);
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
        setElementDimension(element, tagName, styleMap, attr, opposing) {
            var _a;
            const dimension = styleMap[attr];
            if (!dimension || dimension === 'auto') {
                const match = new RegExp(`\\s+${attr}="([^"]+)"`).exec(element.outerHTML);
                if (match) {
                    const value = match[1];
                    if (isLength$1(value)) {
                        styleMap[attr] = value + 'px';
                    } else if (isPercent$1(value)) {
                        styleMap[attr] = value;
                    }
                } else if (element.clientWidth === 300 && element.clientHeight === 150) {
                    if (attr === 'width') {
                        styleMap.width = '300px';
                    } else {
                        styleMap.height = '150px';
                    }
                } else {
                    const image =
                        (_a = this.application.resourceHandler) === null || _a === void 0
                            ? void 0
                            : _a.getImage(element.src);
                    if (image && image.width > 0 && image.height > 0) {
                        const value = styleMap[opposing];
                        if (value && isLength$1(value)) {
                            const attrMax = `max${capitalize$3(attr)}`;
                            if (!styleMap[attrMax] || !isPercent$1(attrMax)) {
                                styleMap[attr] = formatPX$2((image[attr] * parseFloat(value)) / image[opposing]);
                            }
                        }
                    }
                }
            }
        }
    }

    const { capitalize: capitalize$4, includes } = squared.lib.util;
    class ExtensionUI extends Extension {
        constructor(name, framework, options, tagNames = []) {
            super(name, framework, options);
            this.tagNames = tagNames;
            this._isAll = tagNames.length === 0;
        }
        static findNestedElement(node, name) {
            if (node.styleElement) {
                const systemName = capitalize$4(node.localSettings.systemName);
                const children = node.element.children;
                const length = children.length;
                let i = 0;
                while (i < length) {
                    const item = children[i++];
                    if (includes(item.dataset['use' + systemName] || item.dataset.use, name)) {
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
            return node.use ? this.included(node.element) : !this._isAll;
        }
        included(element) {
            return includes(this.application.getDatasetName('use', element), this.name);
        }
        processNode(node, parent) {
            return undefined;
        }
        processChild(node, parent) {
            return undefined;
        }
        addDescendant(node) {
            const map = this.application.session.extensionMap;
            const extensions = map.get(node.id);
            if (extensions) {
                if (!extensions.includes(this)) {
                    extensions.push(this);
                }
            } else {
                map.set(node.id, [this]);
            }
        }
        postBaseLayout(node) {}
        postConstraints(node) {}
        postOptimize(node) {}
        afterBaseLayout(sessionId) {}
        afterConstraints(sessionId) {}
        afterResources(sessionId) {}
        beforeBaseLayout(sessionId) {}
        beforeCascade(rendered, documentRoot) {}
        afterFinalize() {}
        set application(value) {
            this._application = value;
            this._controller = value.controllerHandler;
            this._resource = value.resourceHandler;
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
    }

    class FileUI extends File {
        get directory() {
            return this.resource.controllerSettings.directory;
        }
    }

    const { hasCoords: hasCoords$2, isLength: isLength$2 } = squared.lib.css;
    class NodeGroupUI extends NodeUI {
        init() {
            var _a;
            if (this.length > 0) {
                this.setBounds();
                this.saveAsInitial();
            }
            this.dir = ((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.dir) || '';
        }
        setBounds() {
            if (this.length > 0) {
                this._bounds = NodeUI.outerRegion(this);
                return this._bounds;
            }
            return undefined;
        }
        previousSiblings(options) {
            let node = this;
            do {
                node = node.item(0);
            } while (node === null || node === void 0 ? void 0 : node.nodeGroup);
            return (node === null || node === void 0 ? void 0 : node.previousSiblings(options)) || [];
        }
        nextSiblings(options) {
            let node = this;
            do {
                node = node.item();
            } while (node === null || node === void 0 ? void 0 : node.nodeGroup);
            return (node === null || node === void 0 ? void 0 : node.nextSiblings(options)) || [];
        }
        get inline() {
            if (this.hasAlign(32 /* BLOCK */)) {
                return false;
            }
            const result = this._cached.inline;
            return result === undefined ? (this._cached.inline = this.every(node => node.inline)) : result;
        }
        get inlineStatic() {
            if (this.hasAlign(32 /* BLOCK */)) {
                return false;
            }
            const result = this._cached.inlineStatic;
            return result === undefined ? (this._cached.inlineStatic = this.every(node => node.inlineStatic)) : result;
        }
        get inlineVertical() {
            if (this.hasAlign(32 /* BLOCK */)) {
                return false;
            }
            const result = this._cached.inlineVertical;
            return result === undefined
                ? (this._cached.inlineVertical = this.every(node => node.inlineVertical))
                : result;
        }
        get inlineFlow() {
            if (this.hasAlign(32 /* BLOCK */)) {
                return false;
            }
            const result = this._cached.inlineFlow;
            return result === undefined ? (this._cached.inlineFlow = this.every(node => node.inlineFlow)) : result;
        }
        get inlineDimension() {
            if (this.hasAlign(32 /* BLOCK */)) {
                return false;
            }
            const result = this._cached.inlineDimension;
            return result === undefined
                ? (this._cached.inlineDimension = this.every(node => node.inlineDimension))
                : result;
        }
        get block() {
            if (this.hasAlign(32 /* BLOCK */)) {
                return true;
            }
            const result = this._cached.block;
            return result === undefined ? (this._cached.block = this.some(node => node.block)) : result;
        }
        get blockStatic() {
            if (this.hasAlign(32 /* BLOCK */)) {
                return true;
            }
            let result = this._cached.blockStatic;
            if (result === undefined) {
                const documentParent = this.actualParent || this.documentParent;
                result =
                    this.some(node => node.blockStatic || node.percentWidth > 0) ||
                    (this.layoutVertical &&
                        (documentParent.hasWidth || this.some(node => node.centerAligned || node.rightAligned))) ||
                    documentParent.percentWidth > 0 ||
                    (documentParent.blockStatic && (documentParent.layoutVertical || this.hasAlign(128 /* COLUMN */)));
                if (result || this.containerType !== 0) {
                    this._cached.blockStatic = result;
                }
            }
            return result;
        }
        get blockDimension() {
            const result = this._cached.blockDimension;
            return result === undefined
                ? (this._cached.blockDimension = this.every(node => node.blockDimension))
                : result;
        }
        get blockVertical() {
            const result = this._cached.blockVertical;
            return result === undefined
                ? (this._cached.blockVertical = this.every(node => node.blockVertical))
                : result;
        }
        get pageFlow() {
            const result = this._cached.pageFlow;
            return result === undefined ? (this._cached.pageFlow = !hasCoords$2(this.css('position'))) : result;
        }
        set baseline(value) {
            this._cached.baseline = value;
        }
        get baseline() {
            let result = this._cached.baseline;
            if (result === undefined) {
                if (this.some(node => node.floating || node.hasAlign(256 /* FLOAT */))) {
                    result = false;
                } else {
                    const value = this.css('verticalAlign');
                    result =
                        value === ''
                            ? this.every(node => node.baseline)
                            : value === 'baseline' || isLength$2(value, true);
                }
                this._cached.baseline = result;
            }
            return result;
        }
        get float() {
            if (!this.floating) {
                return 'none';
            } else if (this.hasAlign(1024 /* RIGHT */)) {
                return 'right';
            } else if (this.every(node => node.float === 'right')) {
                this.addAlign(1024 /* RIGHT */);
                return 'right';
            }
            return 'left';
        }
        get floating() {
            return this.every(node => node.floating || node.hasAlign(256 /* FLOAT */));
        }
        get display() {
            return (
                super.display ||
                (this.some(node => node.blockStatic) ? 'block' : this.blockDimension ? 'inline-block' : 'inline')
            );
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
            if (result === Infinity) {
                this.each(node => (result = Math.min(node.childIndex, result)));
                super.childIndex = result;
            }
            return result;
        }
        set containerIndex(value) {
            super.containerIndex = value;
        }
        get containerIndex() {
            let result = super.containerIndex;
            if (result === Infinity) {
                this.each(node => (result = Math.min(node.containerIndex, result)));
                super.containerIndex = result;
            }
            return result;
        }
        get centerAligned() {
            const result = this._cached.centerAligned;
            return result === undefined
                ? (this._cached.centerAligned = this.every(node => node.centerAligned))
                : result;
        }
        get rightAligned() {
            if (this.hasAlign(1024 /* RIGHT */)) {
                return true;
            }
            const result = this._cached.rightAligned;
            return result === undefined ? (this._cached.rightAligned = this.every(node => node.rightAligned)) : result;
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

    const { USER_AGENT: USER_AGENT$2, isUserAgent: isUserAgent$2 } = squared.lib.client;
    const { parseColor } = squared.lib.color;
    const {
        CSS_PROPERTIES: CSS_PROPERTIES$4,
        calculate,
        convertAngle,
        formatPX: formatPX$3,
        getBackgroundPosition,
        getInheritedStyle: getInheritedStyle$1,
        hasComputedStyle: hasComputedStyle$3,
        hasCoords: hasCoords$3,
        isCalc,
        isLength: isLength$3,
        isParentStyle,
        isPercent: isPercent$2,
        parseAngle,
    } = squared.lib.css;
    const { getNamedItem: getNamedItem$2 } = squared.lib.dom;
    const {
        cos,
        equal: equal$1,
        hypotenuse,
        offsetAngleX,
        offsetAngleY,
        relativeAngle,
        sin,
        triangulate,
        truncateFraction,
    } = squared.lib.math;
    const { STRING: STRING$2 } = squared.lib.regex;
    const { getElementAsNode: getElementAsNode$2 } = squared.lib.session;
    const {
        appendSeparator: appendSeparator$1,
        convertCamelCase: convertCamelCase$2,
        hasValue: hasValue$1,
        isEqual,
        isNumber: isNumber$1,
        isString: isString$1,
        iterateArray: iterateArray$4,
    } = squared.lib.util;
    const BORDER_TOP$2 = CSS_PROPERTIES$4.borderTop.value;
    const BORDER_RIGHT$2 = CSS_PROPERTIES$4.borderRight.value;
    const BORDER_BOTTOM$2 = CSS_PROPERTIES$4.borderBottom.value;
    const BORDER_LEFT$2 = CSS_PROPERTIES$4.borderLeft.value;
    const BORDER_OUTLINE = CSS_PROPERTIES$4.outline.value;
    const PATTERN_COLORSTOP = `((?:rgb|hsl)a?\\(\\d+,\\s+\\d+%?,\\s+\\d+%?(?:,\\s+[\\d.]+)?\\)|#[A-Za-z\\d]{3,8}|[a-z]+)\\s*(${STRING$2.LENGTH_PERCENTAGE}|${STRING$2.CSS_ANGLE}|(?:${STRING$2.CSS_CALC}(?=,)|${STRING$2.CSS_CALC}))?,?\\s*`;
    const REGEXP_BACKGROUNDIMAGE = new RegExp(
        `(?:initial|url\\([^)]+\\)|(repeating-)?(linear|radial|conic)-gradient\\(((?:to\\s+[a-z\\s]+|(?:from\\s+)?-?[\\d.]+(?:deg|rad|turn|grad)|(?:circle|ellipse)?\\s*(?:closest-side|closest-corner|farthest-side|farthest-corner)?)?(?:\\s*(?:(?:-?[\\d.]+(?:[a-z%]+)?\\s*)+)?(?:at\\s+[\\w %]+)?)?),?\\s*((?:${PATTERN_COLORSTOP})+)\\))`,
        'g'
    );
    const REGEXP_COLORSTOP = new RegExp(PATTERN_COLORSTOP, 'g');
    const REGEXP_TRAILINGINDENT = /\n([^\S\n]*)?$/;
    const CHAR_LEADINGSPACE = /^\s+/;
    const CHAR_TRAILINGSPACE = /\s+$/;
    function parseColorStops(node, gradient, value) {
        const { width, height } = gradient.dimension;
        const result = [];
        let repeat = false,
            horizontal = true,
            extent = 1,
            size;
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
        let previousOffset = 0,
            match;
        while ((match = REGEXP_COLORSTOP.exec(value))) {
            const color = parseColor(match[1], 1, true);
            if (color) {
                let offset = -1;
                if (gradient.type === 'conic') {
                    const angle = match[3];
                    const unit = match[4];
                    if (angle && unit) {
                        offset = convertAngle(angle, unit) / 360;
                    }
                } else {
                    const unit = match[2];
                    if (isPercent$2(unit)) {
                        offset = parseFloat(unit) / 100;
                    } else if (isLength$3(unit)) {
                        offset = (horizontal ? node.parseWidth(unit, false) : node.parseHeight(unit, false)) / size;
                    } else if (isCalc(unit)) {
                        offset = calculate(match[6], { boundingSize: size, fontSize: node.fontSize }) / size;
                        if (isNaN(offset)) {
                            offset = -1;
                        }
                    }
                    if (repeat && offset !== -1) {
                        offset *= extent;
                    }
                }
                if (isNaN(offset)) {
                    continue;
                }
                if (result.length === 0) {
                    if (offset === -1) {
                        offset = 0;
                    } else if (offset > 0) {
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
                } else {
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
        } else if (percent < 1) {
            result.push(Object.assign(Object.assign({}, result[length - 1]), { offset: 1 }));
        }
        REGEXP_COLORSTOP.lastIndex = 0;
        return result;
    }
    function getBackgroundSize(node, index, value, screenDimension) {
        if (value !== '') {
            const sizes = value.split(/\s*,\s*/);
            return ResourceUI.getBackgroundSize(node, sizes[index % sizes.length], screenDimension);
        }
        return undefined;
    }
    function setBorderStyle$1(node, boxStyle, attr, border) {
        const style = node.css(border[1]) || 'none';
        if (style !== 'none') {
            let width = formatPX$3(attr !== 'outline' ? node[border[0]] : parseFloat(node.style[border[0]]));
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
                        color,
                    };
                    return true;
                }
            }
        }
        return false;
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
                    left: node.borderLeftWidth,
                };
                break;
            case 'content-box':
                boxStyle[attr] = {
                    top: node.borderTopWidth + node.paddingTop,
                    right: node.borderRightWidth + node.paddingRight,
                    bottom: node.borderBottomWidth + node.paddingBottom,
                    left: node.borderLeftWidth + node.paddingLeft,
                };
                break;
        }
        return false;
    }
    function getAngle(value, fallback = 0) {
        value = value.trim();
        if (value !== '') {
            let degree = parseAngle(value, fallback);
            if (!isNaN(degree)) {
                if (degree < 0) {
                    degree += 360;
                }
                return degree;
            }
        }
        return fallback;
    }
    function getGradientPosition(value) {
        return isString$1(value)
            ? value.includes('at ')
                ? /(.+?)?\s*at (.+?)\s*$/.exec(value)
                : [value, value]
            : null;
    }
    class ResourceUI extends Resource {
        static isBackgroundVisible(object) {
            return (
                !!object &&
                ('backgroundImage' in object ||
                    'borderTop' in object ||
                    'borderRight' in object ||
                    'borderBottom' in object ||
                    'borderLeft' in object)
            );
        }
        static generateId(section, name, start = 1) {
            const prefix = name;
            let i = start;
            if (start === 1) {
                name += '_' + i;
            }
            const ids = this.STORED.ids;
            const previous = ids.get(section) || [];
            do {
                if (!previous.includes(name)) {
                    previous.push(name);
                    break;
                } else {
                    name = prefix + '_' + ++i;
                }
            } while (true);
            ids.set(section, previous);
            return name;
        }
        static insertStoredAsset(asset, name, value) {
            const stored = ResourceUI.STORED[asset];
            if (stored && hasValue$1(value)) {
                let result = '';
                if (stored) {
                    for (const [id, data] of stored.entries()) {
                        if (isEqual(value, data)) {
                            result = id;
                            break;
                        }
                    }
                }
                if (result === '') {
                    if (isNumber$1(name)) {
                        name = '__' + name;
                    }
                    let i = 0;
                    do {
                        result = i === 0 ? name : name + '_' + i;
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
        static getOptionArray(element, showDisabled) {
            let result = [],
                numberArray = true;
            iterateArray$4(element.children, item => {
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
                        } else if (groupNumberArray) {
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
                let i = 0,
                    match;
                while ((match = REGEXP_BACKGROUNDIMAGE.exec(backgroundImage))) {
                    const value = match[0];
                    if (value.startsWith('url(') || value === 'initial') {
                        images.push(value);
                    } else {
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
                                let x = truncateFraction(offsetAngleX(angle, width)),
                                    y = truncateFraction(offsetAngleY(angle, height));
                                if (x !== width && y !== height && !equal$1(Math.abs(x), Math.abs(y))) {
                                    let opposite;
                                    if (angle <= 90) {
                                        opposite = relativeAngle({ x: 0, y: height }, { x: width, y: 0 });
                                    } else if (angle <= 180) {
                                        opposite = relativeAngle({ x: 0, y: 0 }, { x: width, y: height });
                                    } else if (angle <= 270) {
                                        opposite = relativeAngle({ x: 0, y: 0 }, { x: -width, y: height });
                                    } else {
                                        opposite = relativeAngle({ x: 0, y: height }, { x: -width, y: 0 });
                                    }
                                    const a = Math.abs(opposite - angle);
                                    x = truncateFraction(
                                        offsetAngleX(angle, triangulate(a, 90 - a, hypotenuse(width, height))[1])
                                    );
                                    y = truncateFraction(offsetAngleY(angle, triangulate(90, 90 - angle, x)[0]));
                                }
                                const linear = {
                                    type,
                                    repeating,
                                    dimension,
                                    angle,
                                    angleExtent: { x, y },
                                };
                                linear.colorStops = parseColorStops(node, linear, match[4]);
                                gradient = linear;
                                break;
                            }
                            case 'radial': {
                                const position = getGradientPosition(direction);
                                const center = getBackgroundPosition(
                                    (position === null || position === void 0 ? void 0 : position[2]) || 'center',
                                    dimension,
                                    { fontSize: node.fontSize, imageDimension, screenDimension }
                                );
                                const { left, top } = center;
                                const { width, height } = dimension;
                                let shape = 'ellipse',
                                    closestSide = top,
                                    farthestSide = top,
                                    closestCorner = Infinity,
                                    farthestCorner = -Infinity,
                                    radius = 0,
                                    radiusExtent = 0;
                                if (position) {
                                    const name = (_a = position[1]) === null || _a === void 0 ? void 0 : _a.trim();
                                    if (name) {
                                        if (name.startsWith('circle')) {
                                            shape = 'circle';
                                        } else {
                                            let minRadius = Infinity;
                                            const radiusXY = name.split(' ');
                                            for (let j = 0; j < radiusXY.length; ++j) {
                                                minRadius = Math.min(
                                                    j === 0
                                                        ? node.parseWidth(radiusXY[j], false)
                                                        : node.parseHeight(radiusXY[j], false),
                                                    minRadius
                                                );
                                            }
                                            radius = minRadius;
                                            radiusExtent = minRadius;
                                            if (length === 1 || radiusXY[0] === radiusXY[1]) {
                                                shape = 'circle';
                                            }
                                        }
                                    }
                                }
                                for (const corner of [
                                    [0, 0],
                                    [width, 0],
                                    [width, height],
                                    [0, height],
                                ]) {
                                    const length = Math.round(
                                        hypotenuse(Math.abs(corner[0] - left), Math.abs(corner[1] - top))
                                    );
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
                                    farthestCorner,
                                };
                                if (radius === 0 && radiusExtent === 0) {
                                    radius = farthestCorner;
                                    const extent =
                                        ((_b = position === null || position === void 0 ? void 0 : position[1]) ===
                                            null || _b === void 0
                                            ? void 0
                                            : _b.split(' ').pop()) || '';
                                    switch (extent) {
                                        case 'closest-corner':
                                        case 'closest-side':
                                        case 'farthest-side': {
                                            const length = radial[convertCamelCase$2(extent)];
                                            if (repeating) {
                                                radiusExtent = length;
                                            } else {
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
                                    center: getBackgroundPosition(
                                        (position === null || position === void 0 ? void 0 : position[2]) || 'center',
                                        dimension,
                                        { fontSize: node.fontSize, imageDimension, screenDimension }
                                    ),
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
                REGEXP_BACKGROUNDIMAGE.lastIndex = 0;
                if (images.length > 0) {
                    return images;
                }
            }
            return undefined;
        }
        static getBackgroundSize(node, value, screenDimension) {
            let width = 0,
                height = 0;
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
                    for (let i = 0; i < dimensions.length; ++i) {
                        let size = dimensions[i];
                        if (size === 'auto') {
                            size = '100%';
                        }
                        switch (i) {
                            case 0:
                                width = node.parseUnit(size, { parent: false, screenDimension });
                                break;
                            case 1:
                                height = node.parseUnit(size, { dimension: 'height', parent: false, screenDimension });
                                break;
                        }
                    }
                    break;
                }
            }
            return width > 0 && height > 0 ? { width: Math.round(width), height: Math.round(height) } : undefined;
        }
        static hasLineBreak(node, lineBreak, trim) {
            if (node.naturalElements.length > 0) {
                return node.naturalElements.some(item => item.lineBreak);
            } else if (!lineBreak && node.naturalChild) {
                const element = node.element;
                let value = element.textContent;
                if (trim) {
                    value = value.trim();
                }
                return (
                    value.includes('\n') &&
                    ((node.plainText && isParentStyle(element, 'whiteSpace', 'pre', 'pre-wrap')) ||
                        node.css('whiteSpace').startsWith('pre'))
                );
            }
            return false;
        }
        static checkPreIndent(node) {
            if (node.plainText) {
                const parent = node.actualParent;
                if (
                    parent.preserveWhiteSpace &&
                    parent.ascend({ condition: item => item.tagName === 'PRE', startSelf: true }).length > 0
                ) {
                    let nextSibling = node.nextSibling;
                    if (nextSibling === null || nextSibling === void 0 ? void 0 : nextSibling.naturalElement) {
                        const textContent = node.textContent;
                        if (isString$1(textContent)) {
                            const match = REGEXP_TRAILINGINDENT.exec(textContent);
                            if (match) {
                                if (!nextSibling.textElement) {
                                    nextSibling = nextSibling.find(item => item.naturalChild && item.textElement, {
                                        cascade: true,
                                        error: item => item.naturalChild && !item.textElement && item.length === 0,
                                    });
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
        finalize(layouts) {}
        reset() {
            super.reset();
            const STORED = ResourceUI.STORED;
            for (const name in STORED) {
                STORED[name].clear();
            }
        }
        writeRawImage(mimeType, options) {
            const fileHandler = this.fileHandler;
            if (fileHandler) {
                const { filename, data, encoding, width, height } = options;
                if (filename && data) {
                    const asset = {
                        pathname: appendSeparator$1(
                            this.userSettings.outputDirectory,
                            this.controllerSettings.directory.image
                        ),
                        filename,
                        mimeType,
                        width,
                        height,
                    };
                    if (typeof data === 'string') {
                        if (encoding === 'base64') {
                            asset.base64 = data.startsWith('data:image/')
                                ? data.substring(data.indexOf(',') + 1)
                                : data;
                        }
                    } else if (Array.isArray(data)) {
                        asset.bytes = data;
                    } else {
                        return undefined;
                    }
                    fileHandler.addAsset(asset);
                    return asset;
                }
            }
            return undefined;
        }
        setBoxStyle(node) {
            var _a;
            if ((node.styleElement || node.visibleStyle.background) && node.hasResource(NODE_RESOURCE.BOX_STYLE)) {
                const boxStyle = {};
                let borderWidth = node.visibleStyle.borderWidth,
                    backgroundColor = node.backgroundColor,
                    backgroundImage;
                if (borderWidth) {
                    if (node.borderTopWidth > 0) {
                        setBorderStyle$1(node, boxStyle, 'borderTop', BORDER_TOP$2);
                    }
                    if (node.borderRightWidth > 0) {
                        setBorderStyle$1(node, boxStyle, 'borderRight', BORDER_RIGHT$2);
                    }
                    if (node.borderBottomWidth > 0) {
                        setBorderStyle$1(node, boxStyle, 'borderBottom', BORDER_BOTTOM$2);
                    }
                    if (node.borderLeftWidth > 0) {
                        setBorderStyle$1(node, boxStyle, 'borderLeft', BORDER_LEFT$2);
                    }
                }
                if (setBorderStyle$1(node, boxStyle, 'outline', BORDER_OUTLINE)) {
                    borderWidth = true;
                }
                if (backgroundColor === '' && node.has('backgroundColor') && !node.documentParent.visible) {
                    backgroundColor = node.css('backgroundColor');
                }
                if (node.hasResource(NODE_RESOURCE.IMAGE_SOURCE)) {
                    backgroundImage = ResourceUI.parseBackgroundImage(
                        node,
                        node.backgroundImage,
                        node.localSettings.screenDimension
                    );
                }
                if (backgroundColor || backgroundImage || borderWidth || node.data(Resource.KEY_NAME, 'embedded')) {
                    boxStyle.backgroundColor =
                        ((_a = parseColor(backgroundColor, 1, node.inputElement)) === null || _a === void 0
                            ? void 0
                            : _a.valueAsRGBA) || '';
                    boxStyle.backgroundImage = backgroundImage;
                    Object.assign(
                        boxStyle,
                        node.cssAsObject(
                            'backgroundSize',
                            'backgroundRepeat',
                            'backgroundPositionX',
                            'backgroundPositionY'
                        )
                    );
                    if (setBackgroundOffset(node, boxStyle, 'backgroundClip')) {
                        setBackgroundOffset(node, boxStyle, 'backgroundOrigin');
                    }
                    if (node.css('borderRadius') !== '0px') {
                        const [
                            borderTopLeftRadius,
                            borderTopRightRadius,
                            borderBottomRightRadius,
                            borderBottomLeftRadius,
                        ] = node.cssAsTuple(
                            'borderTopLeftRadius',
                            'borderTopRightRadius',
                            'borderBottomRightRadius',
                            'borderBottomLeftRadius'
                        );
                        const [A, B] = borderTopLeftRadius.split(' ');
                        const [C, D] = borderTopRightRadius.split(' ');
                        const [E, F] = borderBottomRightRadius.split(' ');
                        const [G, H] = borderBottomLeftRadius.split(' ');
                        const borderRadius =
                            !B && !D && !F && !H ? [A, C, E, G] : [A, B || A, C, D || C, E, F || E, G, H || G];
                        const horizontal = node.actualWidth >= node.actualHeight;
                        const radius = borderRadius[0];
                        if (borderRadius.every(value => value === radius)) {
                            borderRadius.length = radius === '0px' || radius === '' ? 0 : 1;
                        }
                        const length = borderRadius.length;
                        if (length > 0) {
                            const dimension = horizontal ? 'width' : 'height';
                            let i = 0;
                            while (i < length) {
                                borderRadius[i] = formatPX$3(
                                    node.parseUnit(borderRadius[i++], { dimension, parent: false })
                                );
                            }
                            boxStyle.borderRadius = borderRadius;
                        }
                    }
                    node.data(ResourceUI.KEY_NAME, 'boxStyle', boxStyle);
                }
            }
        }
        setFontStyle(node) {
            if (
                ((node.textElement || node.inlineText) &&
                    (!node.textEmpty || node.visibleStyle.background || node.pseudoElement)) ||
                node.inputElement
            ) {
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
                    color: (color === null || color === void 0 ? void 0 : color.valueAsRGBA) || '',
                });
            }
        }
        setValueString(node) {
            var _a, _b, _c;
            const element = node.element;
            if (element) {
                let trimming = false,
                    inlined = false,
                    hint,
                    value;
                switch (element.tagName) {
                    case 'INPUT':
                        value = getNamedItem$2(element, 'value');
                        switch (element.type) {
                            case 'radio':
                            case 'checkbox': {
                                const companion = node.companion;
                                if (
                                    (companion === null || companion === void 0 ? void 0 : companion.visible) === false
                                ) {
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
                                    switch (new Intl.DateTimeFormat().resolvedOptions().locale) {
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
                                value = isUserAgent$2(4 /* FIREFOX */) ? 'Browse...' : 'Choose File';
                                break;
                            case 'color': {
                                const borderColor = this.controllerSettings.style.inputColorBorderColor;
                                const backgroundColor = (parseColor(value) || parseColor('rgb(0, 0, 0)')).valueAsRGBA;
                                const { width, height } = node.actualDimension;
                                const backgroundSize = `${width - 10}px ${height - 10}px, ${width - 8}px ${
                                    height - 8
                                }px`;
                                const backgroundRepeat = 'no-repeat, no-repeat';
                                const backgroundPositionX = 'center, center';
                                const backgroundPositionY = 'center, center';
                                const backgroundImage = ResourceUI.parseBackgroundImage(
                                    node,
                                    `linear-gradient(${backgroundColor}, ${backgroundColor}), linear-gradient(${borderColor}, ${borderColor})`
                                );
                                value = '';
                                let boxStyle = node.data(ResourceUI.KEY_NAME, 'boxStyle');
                                if (boxStyle) {
                                    const backgroundImageA = boxStyle.backgroundImage;
                                    if (backgroundImageA) {
                                        boxStyle.backgroundSize = backgroundSize + ', ' + boxStyle.backgroundSize;
                                        boxStyle.backgroundRepeat = backgroundRepeat + ', ' + boxStyle.backgroundRepeat;
                                        boxStyle.backgroundPositionX =
                                            backgroundPositionX + ', ' + boxStyle.backgroundPositionX;
                                        boxStyle.backgroundPositionY =
                                            backgroundPositionY + ', ' + boxStyle.backgroundPositionY;
                                        backgroundImageA.unshift(...backgroundImage);
                                        break;
                                    }
                                } else {
                                    boxStyle = {};
                                }
                                node.data(
                                    ResourceUI.KEY_NAME,
                                    'boxStyle',
                                    Object.assign(boxStyle, {
                                        backgroundSize,
                                        backgroundRepeat,
                                        backgroundPositionX,
                                        backgroundPositionY,
                                        backgroundImage,
                                    })
                                );
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
                        hint = element.placeholder;
                        break;
                    case 'IFRAME':
                        value = element.src;
                        break;
                    default: {
                        trimming = true;
                        if (
                            node.plainText ||
                            node.pseudoElement ||
                            (node.hasAlign(512 /* INLINE */) && node.textElement)
                        ) {
                            value = node.textContent.replace(/&/g, '&amp;');
                            inlined = true;
                        } else if (node.inlineText) {
                            value = node.textEmpty
                                ? ResourceUI.STRING_SPACE
                                : node.tagName === 'BUTTON'
                                ? node.textContent
                                : this.removeExcludedFromText(node, element);
                        }
                        if (value) {
                            value = value.replace(/\u00A0/g, ResourceUI.STRING_SPACE);
                            switch (node.css('whiteSpace')) {
                                case 'pre':
                                case 'pre-wrap': {
                                    if (
                                        ((_a = node.renderParent) === null || _a === void 0
                                            ? void 0
                                            : _a.layoutVertical) === false
                                    ) {
                                        value = value.replace(/^\s*\n/, '');
                                    }
                                    const preIndent = ResourceUI.checkPreIndent(node);
                                    if (preIndent) {
                                        const [indent, adjacent] = preIndent;
                                        if (indent !== '') {
                                            adjacent.textContent = indent + adjacent.textContent;
                                        }
                                        value = value.replace(REGEXP_TRAILINGINDENT, '');
                                    }
                                    value = value
                                        .replace(/\n/g, '\\n')
                                        .replace(/\t/g, ResourceUI.STRING_SPACE.repeat(node.toInt('tabSize', 8)))
                                        .replace(/\s/g, ResourceUI.STRING_SPACE);
                                    inlined = true;
                                    trimming = false;
                                    break;
                                }
                                case 'pre-line':
                                    value.replace(/\n/g, '\\n').replace(/\s+/g, ' ');
                                    inlined = true;
                                    trimming = false;
                                    break;
                                case 'nowrap':
                                    value = value.replace(/\n+/g, ' ');
                                    inlined = true;
                                default: {
                                    const trimBoth = node.onlyChild && node.htmlElement;
                                    if (
                                        trimBoth ||
                                        ((_b = node.previousSibling) === null || _b === void 0
                                            ? void 0
                                            : _b.blockStatic)
                                    ) {
                                        value = value.replace(CHAR_LEADINGSPACE, '');
                                    }
                                    if (
                                        trimBoth ||
                                        ((_c = node.nextSibling) === null || _c === void 0 ? void 0 : _c.blockStatic)
                                    ) {
                                        value = value.replace(CHAR_TRAILINGSPACE, '');
                                    }
                                }
                            }
                        } else if (
                            node.naturalChildren.length === 0 &&
                            !node.hasPX('height') &&
                            ResourceUI.isBackgroundVisible(node.data(ResourceUI.KEY_NAME, 'boxStyle')) &&
                            !isString$1(node.textContent)
                        ) {
                            value = node.textContent;
                        }
                        break;
                    }
                }
                if (hint) {
                    node.data(ResourceUI.KEY_NAME, 'hintString', hint);
                }
                if (value) {
                    if (trimming) {
                        if (node.pageFlow) {
                            const previousSibling = node.siblingsLeading[0];
                            const nextSibling = node.siblingsTrailing.find(item => !item.excluded || item.lineBreak);
                            let previousSpaceEnd = false;
                            if (value.length > 1) {
                                if (
                                    !previousSibling ||
                                    previousSibling.multiline ||
                                    previousSibling.lineBreak ||
                                    previousSibling.floating ||
                                    (previousSibling.plainText && CHAR_TRAILINGSPACE.test(previousSibling.textContent))
                                ) {
                                    value = value.replace(CHAR_LEADINGSPACE, '');
                                } else if (previousSibling.naturalElement) {
                                    const textContent = previousSibling.textContent;
                                    const length = textContent.length;
                                    if (length > 0) {
                                        previousSpaceEnd = textContent.charCodeAt(length - 1) === 32;
                                    }
                                }
                            }
                            if (inlined) {
                                const trailingSpace = !node.lineBreakTrailing && CHAR_TRAILINGSPACE.test(value);
                                if (
                                    CHAR_LEADINGSPACE.test(value) &&
                                    (previousSibling === null || previousSibling === void 0
                                        ? void 0
                                        : previousSibling.block) === false &&
                                    !previousSibling.lineBreak &&
                                    !previousSpaceEnd
                                ) {
                                    value = ResourceUI.STRING_SPACE + value.trim();
                                } else {
                                    value = value.trim();
                                }
                                if (
                                    trailingSpace &&
                                    (nextSibling === null || nextSibling === void 0
                                        ? void 0
                                        : nextSibling.blockStatic) === false &&
                                    !nextSibling.floating
                                ) {
                                    value += ResourceUI.STRING_SPACE;
                                }
                            } else if (!/^[\s\n]+$/.test(value)) {
                                value = value.replace(
                                    CHAR_LEADINGSPACE,
                                    previousSibling &&
                                        (previousSibling.block ||
                                            previousSibling.lineBreak ||
                                            (previousSpaceEnd &&
                                                previousSibling.htmlElement &&
                                                previousSibling.textContent.length > 1) ||
                                            (node.multiline && ResourceUI.hasLineBreak(node)))
                                        ? ''
                                        : ResourceUI.STRING_SPACE
                                );
                                value = value.replace(
                                    CHAR_TRAILINGSPACE,
                                    node.display === 'table-cell' ||
                                        node.lineBreakTrailing ||
                                        node.blockStatic ||
                                        (nextSibling === null || nextSibling === void 0 ? void 0 : nextSibling.floating)
                                        ? ''
                                        : ResourceUI.STRING_SPACE
                                );
                            } else if (!node.inlineText) {
                                return;
                            }
                        } else {
                            value = value.trim();
                        }
                    }
                    if (value) {
                        node.data(ResourceUI.KEY_NAME, 'valueString', value);
                    }
                }
            } else if (node.inlineText) {
                const value = node.textContent;
                if (value) {
                    node.data(ResourceUI.KEY_NAME, 'valueString', value);
                }
            }
        }
        removeExcludedFromText(node, element) {
            const { preserveWhiteSpace, sessionId } = node;
            const styled = element.children.length > 0 || element.tagName === 'CODE';
            const attr = styled ? 'innerHTML' : 'textContent';
            let value = element[attr] || '';
            element.childNodes.forEach((item, index) => {
                const child = getElementAsNode$2(item, sessionId);
                if (
                    !child ||
                    !child.textElement ||
                    !child.pageFlow ||
                    child.positioned ||
                    child.pseudoElement ||
                    child.excluded
                ) {
                    if (child) {
                        if (styled && child.htmlElement) {
                            const outerHTML = child.toElementString('outerHTML');
                            if (child.lineBreak) {
                                value = value.replace(
                                    !preserveWhiteSpace ? new RegExp(`\\s*${outerHTML}\\s*`) : outerHTML,
                                    '\\n'
                                );
                            } else if (child.positioned) {
                                value = value.replace(outerHTML, '');
                            } else if (!preserveWhiteSpace) {
                                value = value.replace(
                                    outerHTML,
                                    child.pageFlow && isString$1(child.textContent) ? ResourceUI.STRING_SPACE : ''
                                );
                            }
                            return;
                        } else {
                            const textContent = child.plainText ? child.textContent : child[attr];
                            if (isString$1(textContent)) {
                                if (!preserveWhiteSpace) {
                                    value = value.replace(textContent, '');
                                }
                                return;
                            }
                        }
                    } else if (hasComputedStyle$3(item)) {
                        value = value.replace(
                            item.outerHTML,
                            !hasCoords$3(getComputedStyle(item).getPropertyValue('position')) &&
                                isString$1(item.textContent)
                                ? ResourceUI.STRING_SPACE
                                : ''
                        );
                    }
                    if (!preserveWhiteSpace) {
                        if (index === 0) {
                            value = value.replace(CHAR_LEADINGSPACE, '');
                        } else if (index === length - 1) {
                            value = value.replace(CHAR_TRAILINGSPACE, '');
                        }
                    }
                }
            });
            if (!styled) {
                return value;
            } else if (!preserveWhiteSpace && /^[\s\n]+$/.test(value)) {
                return node.blockStatic ? ResourceUI.STRING_SPACE : '';
            }
            return value.replace(/&#(\d+);/g, (match, capture) => String.fromCharCode(parseInt(capture)));
        }
        get controllerSettings() {
            return this.application.controllerHandler.localSettings;
        }
        get mapOfStored() {
            return ResourceUI.STORED;
        }
    }
    ResourceUI.STRING_SPACE = '&#160;';
    ResourceUI.STORED = {
        ids: new Map(),
        strings: new Map(),
        arrays: new Map(),
        fonts: new Map(),
        colors: new Map(),
        images: new Map(),
    };

    class Accessibility extends ExtensionUI {}

    class Column extends ExtensionUI {
        is(node) {
            return node.length > 1 && node.blockDimension && node.display !== 'table' && !node.layoutElement;
        }
        condition(node) {
            return node.has('columnCount') || node.hasPX('columnWidth');
        }
        processNode(node, parent) {
            let items = [],
                maxSize = Infinity,
                multiline = false;
            const rows = [items];
            node.each(item => {
                var _a;
                if (item.css('columnSpan') === 'all') {
                    if (items.length > 0) {
                        rows.push([item]);
                    } else {
                        items.push(item);
                    }
                    items = [];
                    rows.push(items);
                } else {
                    if (item.textElement && ((_a = item.textBounds) === null || _a === void 0 ? void 0 : _a.overflow)) {
                        maxSize = NaN;
                    }
                    if (item.multiline) {
                        multiline = true;
                    } else if (!isNaN(maxSize)) {
                        maxSize = Math.min(item.bounds.width, maxSize);
                    }
                    items.push(item);
                }
            });
            if (items.length === 0) {
                rows.pop();
            }
            const [borderLeftStyle, borderLeftWidth, borderLeftColor] = node.cssAsTuple(
                'columnRuleStyle',
                'columnRuleWidth',
                'columnRuleColor'
            );
            const boxWidth = node.box.width;
            const columnCount = node.toInt('columnCount');
            const columnWidth = node.parseWidth(node.css('columnWidth'));
            let columnGap = node.parseWidth(node.css('columnGap')),
                columnSized;
            const getColumnSizing = () =>
                isNaN(columnCount) && columnWidth > 0 ? boxWidth / (columnWidth + columnGap) : Infinity;
            if (columnGap > 0) {
                columnSized = Math.floor(getColumnSizing());
            } else {
                columnGap =
                    (columnWidth > 0 && !isNaN(maxSize) && maxSize !== Infinity
                        ? Math.max(maxSize - columnWidth, 0)
                        : 0) + 16;
                columnSized = Math.ceil(getColumnSizing());
            }
            node.data(this.name, 'mainData', {
                rows,
                columnCount,
                columnWidth,
                columnGap,
                columnSized,
                columnRule: {
                    borderLeftStyle,
                    borderLeftWidth,
                    borderLeftColor,
                },
                boxWidth: parent.actualBoxWidth(boxWidth),
                multiline,
            });
            return undefined;
        }
    }

    const {
        formatPercent,
        formatPX: formatPX$4,
        isLength: isLength$4,
        isPercent: isPercent$3,
        isPx: isPx$1,
    } = squared.lib.css;
    const { maxArray: maxArray$1 } = squared.lib.math;
    const {
        isNumber: isNumber$2,
        plainMap: plainMap$1,
        safeNestedArray: safeNestedArray$2,
        trimString: trimString$1,
        withinRange: withinRange$1,
    } = squared.lib.util;
    const PATTERN_UNIT = '[\\d.]+[a-z%]+|auto|max-content|min-content';
    const PATTERN_MINMAX = 'minmax\\(\\s*([^,]+),\\s+([^)]+)\\s*\\)';
    const PATTERN_FIT_CONTENT = 'fit-content\\(\\s*([\\d.]+[a-z%]+)\\s*\\)';
    const PATTERN_NAMED = '\\[([\\w\\s\\-]+)\\]';
    const REGEXP_UNIT = new RegExp(`^${PATTERN_UNIT}$`);
    const REGEXP_NAMED = new RegExp(
        `\\s*(repeat\\(\\s*(auto-fit|auto-fill|\\d+),\\s+(.+)\\)|${PATTERN_NAMED}|${PATTERN_MINMAX}|${PATTERN_FIT_CONTENT}|${PATTERN_UNIT}\\s*)\\s*`,
        'g'
    );
    const REGEXP_REPEAT = new RegExp(
        `\\s*(${PATTERN_NAMED}|${PATTERN_MINMAX}|${PATTERN_FIT_CONTENT}|${PATTERN_UNIT})\\s*`,
        'g'
    );
    const REGEXP_CELL_UNIT = new RegExp(PATTERN_UNIT);
    const REGEXP_CELL_MINMAX = new RegExp(PATTERN_MINMAX);
    const REGEXP_CELL_FIT_CONTENT = new RegExp(PATTERN_FIT_CONTENT);
    const REGEXP_CELL_NAMED = new RegExp(PATTERN_NAMED);
    function repeatUnit(data, sizes) {
        const repeat = data.repeat;
        const unitPX = [];
        const unitRepeat = [];
        const length = sizes.length;
        for (let i = 0; i < length; ++i) {
            if (repeat[i]) {
                unitRepeat.push(sizes[i]);
            } else {
                unitPX.push(sizes[i]);
            }
        }
        const q = data.length;
        const r = q - unitPX.length;
        const result = new Array(q);
        for (let i = 0; i < q; ++i) {
            if (repeat[i]) {
                for (let j = 0, k = 0; j < r; ++i, ++j, ++k) {
                    if (k === unitRepeat.length) {
                        k = 0;
                    }
                    result[i] = unitRepeat[k];
                }
                --i;
            } else {
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
            for (const value of [unit[0], unitMin[0]]) {
                if (isPercent$3(value)) {
                    sizeMin = Math.max((parseFloat(value) / 100) * dimension, sizeMin);
                } else if (isLength$4(value)) {
                    sizeMin = Math.max(parseFloat(value), sizeMin);
                }
            }
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
        let filled = 0,
            fractional = 0,
            percent = 1;
        const length = unit.length;
        let i = 0;
        while (i < length) {
            const value = unit[i++];
            if (isPx$1(value)) {
                filled += parseFloat(value);
            } else if (CssGrid.isFr(value)) {
                fractional += parseFloat(value);
            } else if (isPercent$3(value)) {
                percent -= parseFloat(value) / 100;
            }
        }
        if (percent < 1 && fractional > 0) {
            const ratio =
                (dimension * percent - (count - 1) * gap - max.reduce((a, b) => a + Math.max(0, b), 0) - filled) /
                fractional;
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
                } else {
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
            for (const value of cells[i]) {
                if (value === 0) {
                    return i;
                }
            }
        }
        return Math.max(0, length - 1);
    }
    function createDataAttribute(node) {
        const data = node.cssAsObject('alignItems', 'alignContent', 'justifyItems', 'justifyContent', 'gridAutoFlow');
        return Object.assign(data, {
            children: [],
            rowData: [],
            rowSpanMultiple: [],
            rowDirection: !data.gridAutoFlow.includes('column'),
            dense: data.gridAutoFlow.includes('dense'),
            templateAreas: {},
            row: CssGrid.createDataRowAttribute(node.parseHeight(node.css('rowGap'), false)),
            column: CssGrid.createDataRowAttribute(node.parseWidth(node.css('columnGap'), false)),
            emptyRows: [],
            minCellHeight: 0,
        });
    }
    function setDataRows(rowData, openCells, rowA, rowB, colA, colB, item, placement, length, dense) {
        if (placement.every(value => value > 0)) {
            for (let i = placement[rowA] - 1; i < placement[rowB] - 1; ++i) {
                const data = safeNestedArray$2(rowData, i);
                let cell = openCells[i],
                    j = placement[colA] - 1;
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
    }
    function applyLayout(node, data, dataCount, horizontal) {
        let unit = data.unit;
        let length = unit.length;
        if (length < dataCount) {
            if (data.autoFill || data.autoFit) {
                if (length === 0) {
                    unit.push('auto');
                    data.unitMin.push('');
                    data.repeat.push(true);
                }
                unit = repeatUnit(data, unit);
                data.unit = unit;
                data.unitMin = repeatUnit(data, data.unitMin);
            } else {
                const auto = data.auto;
                const q = auto.length;
                if (q > 0) {
                    let i = 0;
                    while (unit.length < dataCount) {
                        if (i === q) {
                            i = 0;
                        }
                        unit.push(auto[i++]);
                    }
                }
            }
        } else if (
            data.autoFit ||
            (data.autoFill &&
                ((horizontal && node.blockStatic && !node.hasWidth && !node.hasPX('maxWidth', { percent: false })) ||
                    (!horizontal && !node.hasHeight)))
        ) {
            unit.length = dataCount;
        }
        let percent = 1,
            fr = 0,
            auto = 0;
        length = unit.length;
        let i = 0;
        while (i < length) {
            const value = unit[i++];
            if (isPercent$3(value)) {
                percent -= parseFloat(value) / 100;
            } else if (CssGrid.isFr(value)) {
                fr += parseFloat(value);
            } else if (value === 'auto') {
                ++auto;
            }
        }
        data.flexible = percent < 1 || fr > 0;
        if (percent < 1) {
            if (fr > 0) {
                for (i = 0; i < length; ++i) {
                    const value = unit[i];
                    if (CssGrid.isFr(value)) {
                        unit[i] = percent * (parseFloat(value) / fr) + 'fr';
                    }
                }
            } else if (auto === 1) {
                const j = unit.findIndex(value => value === 'auto');
                if (j !== -1) {
                    unit[j] = formatPercent(percent);
                }
            }
        }
    }
    const convertLength = (node, value, index) =>
        isLength$4(value) ? formatPX$4(node.parseUnit(value, { dimension: index !== 0 ? 'width' : 'height' })) : value;
    class CssGrid extends ExtensionUI {
        static createDataRowAttribute(gap = 0) {
            return {
                length: 0,
                gap,
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
                frTotal: 0,
            };
        }
        is(node) {
            return node.gridElement;
        }
        condition(node) {
            return node.length > 0;
        }
        processNode(node) {
            const mainData = createDataAttribute(node);
            const { column, dense, row, rowDirection: horizontal } = mainData;
            const rowData = [];
            const openCells = [];
            const layout = [];
            const gridTemplates = [
                node.cssInitial('gridTemplateRows'),
                node.cssInitial('gridTemplateColumns'),
                node.css('gridAutoRows'),
                node.css('gridAutoColumns'),
            ];
            const [rowA, colA, rowB, colB] = horizontal ? [0, 1, 2, 3] : [1, 0, 3, 2];
            let autoWidth = false,
                autoHeight = false,
                ITERATION;
            for (let index = 0; index < 4; ++index) {
                const value = gridTemplates[index];
                if (value !== '' && value !== 'none' && value !== 'auto') {
                    const data = index === 0 ? row : column;
                    const { name, repeat, unit, unitMin } = data;
                    let i = 1,
                        match;
                    while ((match = REGEXP_NAMED.exec(value))) {
                        const command = match[1].trim();
                        switch (index) {
                            case 0:
                            case 1:
                                if (command.startsWith('[')) {
                                    for (const attr of match[4].split(/\s+/)) {
                                        safeNestedArray$2(name, attr).push(i);
                                    }
                                } else if (command.startsWith('repeat')) {
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
                                        while ((subMatch = REGEXP_REPEAT.exec(match[3]))) {
                                            const subPattern = subMatch[1];
                                            let namedMatch;
                                            if ((namedMatch = REGEXP_CELL_NAMED.exec(subPattern))) {
                                                const subName = namedMatch[1];
                                                if (!name[subName]) {
                                                    name[subName] = [];
                                                }
                                                repeating.push({ name: subName });
                                            } else if ((namedMatch = REGEXP_CELL_MINMAX.exec(subPattern))) {
                                                repeating.push({
                                                    unit: convertLength(node, namedMatch[2], index),
                                                    unitMin: convertLength(node, namedMatch[1], index),
                                                });
                                            } else if ((namedMatch = REGEXP_CELL_FIT_CONTENT.exec(subPattern))) {
                                                repeating.push({
                                                    unit: convertLength(node, namedMatch[1], index),
                                                    unitMin: '0px',
                                                });
                                            } else if ((namedMatch = REGEXP_CELL_UNIT.exec(subPattern))) {
                                                repeating.push({ unit: convertLength(node, namedMatch[0], index) });
                                            }
                                        }
                                        if (repeating.length > 0) {
                                            for (let j = 0; j < iterations; ++j) {
                                                for (let k = 0; k < repeating.length; ++k) {
                                                    const item = repeating[k];
                                                    if (item.name) {
                                                        name[item.name].push(i);
                                                    } else if (item.unit) {
                                                        unit.push(item.unit);
                                                        unitMin.push(item.unitMin || '');
                                                        repeat.push(true);
                                                        ++i;
                                                    }
                                                }
                                            }
                                        }
                                        REGEXP_REPEAT.lastIndex = 0;
                                    }
                                } else if (command.startsWith('minmax')) {
                                    unit.push(convertLength(node, match[6], index));
                                    unitMin.push(convertLength(node, match[5], index));
                                    repeat.push(false);
                                    ++i;
                                } else if (command.startsWith('fit-content')) {
                                    unit.push(convertLength(node, match[7], index));
                                    unitMin.push('0px');
                                    repeat.push(false);
                                    ++i;
                                } else if (REGEXP_UNIT.test(command)) {
                                    unit.push(convertLength(node, command, index));
                                    unitMin.push('');
                                    repeat.push(false);
                                    ++i;
                                }
                                break;
                            case 2:
                            case 3:
                                (index === 2 ? row : column).auto.push(
                                    isLength$4(command)
                                        ? formatPX$4(
                                              node.parseUnit(command, { dimension: index !== 2 ? 'width' : 'height' })
                                          )
                                        : command
                                );
                                break;
                        }
                    }
                    REGEXP_NAMED.lastIndex = 0;
                }
            }
            if (horizontal) {
                node.sort((a, b) => {
                    const linearA = a.linear;
                    const linearB = b.linear;
                    if (!withinRange$1(linearA.top, linearB.top)) {
                        return linearA.top < linearB.top ? -1 : 1;
                    } else if (!withinRange$1(linearA.left, linearB.left)) {
                        return linearA.left < linearB.left ? -1 : 1;
                    }
                    return 0;
                });
            } else {
                node.sort((a, b) => {
                    const linearA = a.linear;
                    const linearB = b.linear;
                    if (!withinRange$1(linearA.left, linearB.left)) {
                        return linearA.left < linearB.left ? -1 : 1;
                    } else if (!withinRange$1(linearA.top, linearB.top)) {
                        return linearA.top < linearB.top ? -1 : 1;
                    }
                    return 0;
                });
            }
            if (
                !node.has('gridTemplateAreas') &&
                node.every(item => item.css('gridRowStart') === 'auto' && item.css('gridColumnStart') === 'auto')
            ) {
                const [directionA, directionB, indexA, indexB, indexC] = horizontal
                    ? ['top', 'bottom', 2, 1, 3]
                    : ['left', 'right', 3, 0, 2];
                let rowIndex = 0,
                    columnIndex = 0,
                    columnMax = 0,
                    previous;
                if (horizontal) {
                    if (column.autoFill) {
                        autoWidth = setAutoFill(column, node.actualWidth);
                    }
                } else if (row.autoFill) {
                    autoHeight = setAutoFill(row, node.actualHeight);
                }
                node.each((item, index) => {
                    if (
                        !previous ||
                        item.linear[directionA] >= previous.linear[directionB] ||
                        (columnIndex > 0 && columnIndex === columnMax)
                    ) {
                        columnMax = Math.max(columnIndex, columnMax);
                        ++rowIndex;
                        columnIndex = 1;
                    }
                    const [gridRowEnd, gridColumnEnd] = item.cssAsTuple('gridRowEnd', 'gridColumnEnd');
                    let rowSpan = 1,
                        columnSpan = 1;
                    if (gridRowEnd.startsWith('span')) {
                        rowSpan = parseInt(gridRowEnd.split(' ')[1]);
                    } else if (isNumber$2(gridRowEnd)) {
                        rowSpan = parseInt(gridRowEnd) - rowIndex;
                    }
                    if (gridColumnEnd.startsWith('span')) {
                        columnSpan = parseInt(gridColumnEnd.split(' ')[1]);
                    } else if (isNumber$2(gridColumnEnd)) {
                        columnSpan = parseInt(gridColumnEnd) - columnIndex;
                    }
                    if (columnIndex === 1 && columnMax > 0) {
                        let valid = false;
                        do {
                            const available = new Array(columnMax - 1).fill(1);
                            for (const cell of layout) {
                                const placement = cell.placement;
                                if (placement[indexA] > rowIndex) {
                                    for (let i = placement[indexB]; i < placement[indexC]; ++i) {
                                        available[i - 1] = 0;
                                    }
                                }
                            }
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
                                } else {
                                    j = 0;
                                }
                            }
                            if (!valid) {
                                mainData.emptyRows[rowIndex - 1] = available;
                                ++rowIndex;
                            }
                        } while (!valid);
                    }
                    if (horizontal) {
                        layout[index] = {
                            outerCoord: item.linear.top,
                            placement: [rowIndex, columnIndex, rowIndex + rowSpan, columnIndex + columnSpan],
                            rowSpan,
                            columnSpan,
                        };
                    } else {
                        layout[index] = {
                            outerCoord: item.linear.left,
                            placement: [columnIndex, rowIndex, columnIndex + columnSpan, rowIndex + rowSpan],
                            rowSpan,
                            columnSpan,
                        };
                    }
                    columnIndex += columnSpan;
                    previous = item;
                });
            } else {
                const templateAreas = mainData.templateAreas;
                let previousPlacement;
                autoWidth = setAutoFill(column, node.actualWidth);
                autoHeight = setAutoFill(row, node.actualHeight);
                node.css('gridTemplateAreas')
                    .split(/"[\s\n]+"/)
                    .forEach((template, rowStart) => {
                        if (template !== 'none') {
                            trimString$1(template.trim(), '"')
                                .split(/\s+/)
                                .forEach((area, columnStart) => {
                                    if (area.charAt(0) !== '.') {
                                        const templateArea = templateAreas[area];
                                        if (templateArea) {
                                            templateArea.rowSpan = rowStart - templateArea.rowStart + 1;
                                            templateArea.columnSpan = columnStart - templateArea.columnStart + 1;
                                        } else {
                                            templateAreas[area] = {
                                                rowStart,
                                                rowSpan: 1,
                                                columnStart,
                                                columnSpan: 1,
                                            };
                                        }
                                    }
                                });
                        }
                    });
                node.each((item, index) => {
                    const positions = item.cssAsTuple('gridRowStart', 'gridColumnStart', 'gridRowEnd', 'gridColumnEnd');
                    const placement = [0, 0, 0, 0];
                    let rowSpan = -1,
                        columnSpan = -1;
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
                            } else {
                                const match = /^([\w-]+)-(start|end)$/.exec(name);
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
                                        } else {
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
                                } else if (cellIndex < 0 && position >= 2) {
                                    const positionA = position - 2;
                                    placement[placement[positionA] > 0 ? position : positionA] = cellIndex + length + 2;
                                    return true;
                                }
                            } else if (value.startsWith('span')) {
                                const span = parseInt(value.split(' ')[1]);
                                if (span === length && previousPlacement) {
                                    if (horizontal) {
                                        if (!vertical) {
                                            const end = previousPlacement[2];
                                            if (end > 0 && placement[0] === 0) {
                                                placement[0] = end;
                                            }
                                        }
                                    } else if (vertical) {
                                        const end = previousPlacement[3];
                                        if (end > 0 && placement[1] === 0) {
                                            placement[1] = end;
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
                                } else if (columnSpan === -1) {
                                    columnSpan = span;
                                }
                                return true;
                            }
                            return false;
                        };
                        let rowStart, colStart;
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
                                    } else if (isNumber$2(alias[0])) {
                                        if (vertical) {
                                            if (rowStart) {
                                                rowSpan = parseInt(alias[0]) - parseInt(rowStart[0]);
                                            } else {
                                                rowStart = alias;
                                            }
                                        } else if (colStart) {
                                            columnSpan = parseInt(alias[0]) - parseInt(colStart[0]);
                                        } else {
                                            colStart = alias;
                                        }
                                    }
                                    const named = data.name[alias[1]];
                                    if (named) {
                                        const nameIndex = parseInt(alias[0]);
                                        if (nameIndex <= named.length) {
                                            placement[i] =
                                                named[nameIndex - 1] + (alias[1] === positions[i - 2] ? 1 : 0);
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
                    } else if (a > 0 && c === 0) {
                        placement[2] = a + rowSpan;
                    }
                    if (columnSpan === -1) {
                        columnSpan = b > 0 && d > 0 ? d - b : 1;
                    } else if (b > 0 && d === 0) {
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
                        columnSpan,
                    };
                    previousPlacement = placement;
                });
            }
            {
                let length = 1,
                    outerCount = 0;
                let i = 0;
                while (i < layout.length) {
                    const item = layout[i++];
                    if (item) {
                        const [totalSpan, start, end] = horizontal ? [item.columnSpan, 1, 3] : [item.rowSpan, 0, 2];
                        const placement = item.placement;
                        if (placement.some(value => value > 0)) {
                            length = Math.max(length, totalSpan, placement[start], placement[end] - 1);
                        }
                        if (withinRange$1(item.outerCoord, horizontal ? node.box.top : node.box.left)) {
                            outerCount += totalSpan;
                        }
                    }
                }
                ITERATION = Math.max(
                    length,
                    outerCount,
                    horizontal && !autoWidth ? column.unit.length : 0,
                    !horizontal && !autoHeight ? row.unit.length : 0
                );
            }
            node.each((item, index) => {
                const { placement, rowSpan, columnSpan } = layout[index];
                const [ROW_SPAN, COLUMN_SPAN] = horizontal ? [rowSpan, columnSpan] : [columnSpan, rowSpan];
                while (placement[0] === 0 || placement[1] === 0) {
                    const PLACEMENT = placement.slice(0);
                    if (PLACEMENT[rowA] === 0) {
                        let length = rowData.length;
                        for (let i = dense ? 0 : getOpenRowIndex(openCells), j = 0, k = -1; i < length; ++i) {
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
                            } else {
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
                    } else if (PLACEMENT[colA] === 0) {
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
                            } else if (data.reduce((a, b) => a + (b ? 1 : 0), 0) + COLUMN_SPAN <= ITERATION) {
                                const range = [];
                                let span = 0;
                                for (let j = 0, k = -1; j < ITERATION; ++j) {
                                    const rowItem = data[j];
                                    if (!rowItem) {
                                        if (k === -1) {
                                            k = j;
                                        }
                                        ++span;
                                    }
                                    if (rowItem || j === ITERATION - 1) {
                                        if (span >= COLUMN_SPAN) {
                                            range.push([k, k + span]);
                                        }
                                        k = -1;
                                        span = 0;
                                    }
                                }
                                if (range.length > 0) {
                                    available.push(range);
                                } else {
                                    break;
                                }
                            } else {
                                break;
                            }
                        }
                        const length = available.length;
                        if (length > 0) {
                            const data = available[0];
                            if (data[0][1] === -1) {
                                PLACEMENT[colA] = 1;
                            } else if (length === m - l) {
                                if (length > 1) {
                                    found: {
                                        const q = data.length;
                                        i = 0;
                                        while (i < q) {
                                            const outside = data[i++];
                                            for (let j = outside[0]; j < outside[1]; ++j) {
                                                let k = 1;
                                                while (k < length) {
                                                    const avail = available[k++];
                                                    let n = 0;
                                                    while (n < avail.length) {
                                                        const inside = avail[n++];
                                                        if (
                                                            j >= inside[0] &&
                                                            (inside[1] === -1 || j + COLUMN_SPAN <= inside[1])
                                                        ) {
                                                            PLACEMENT[colA] = j + 1;
                                                            break found;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                } else {
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
                if (setDataRows(rowData, openCells, rowA, rowB, colA, colB, item, placement, ITERATION, dense)) {
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
                    item.data(this.name, 'cellData', {
                        rowStart,
                        rowSpan: rowCount,
                        columnStart,
                        columnSpan: d - b,
                    });
                }
            });
            let columnCount = rowData.length;
            if (columnCount > 0) {
                let rowMain;
                if (horizontal) {
                    rowMain = rowData;
                    mainData.rowData = rowData;
                    columnCount = Math.max(maxArray$1(plainMap$1(rowData, item => item.length)), column.unit.length);
                } else {
                    rowMain = mainData.rowData;
                    let j;
                    for (let i = 0; i < columnCount; ++i) {
                        const data = rowData[i];
                        const length = data.length;
                        j = 0;
                        while (j < length) {
                            safeNestedArray$2(rowMain, j)[i] = data[j++];
                        }
                    }
                }
                const unitTotal = horizontal ? row.unitTotal : column.unitTotal;
                const children = mainData.children;
                {
                    const length = rowMain.length;
                    let i = 0,
                        j,
                        k;
                    while (i < length) {
                        const data = rowMain[i++];
                        const q = data.length;
                        j = 0;
                        while (j < q) {
                            const columnItem = data[j];
                            let count = unitTotal[j] || 0;
                            if (columnItem) {
                                let maxDimension = 0;
                                const r = columnItem.length;
                                k = 0;
                                while (k < r) {
                                    const item = columnItem[k++];
                                    if (!children.includes(item)) {
                                        maxDimension = Math.max(
                                            maxDimension,
                                            horizontal ? item.bounds.height : item.bounds.width
                                        );
                                        children.push(item);
                                    }
                                }
                                count += maxDimension;
                            }
                            unitTotal[j++] = count;
                        }
                    }
                }
                if (children.length === node.length) {
                    const { gap: rowGap, unit: rowUnit } = row;
                    const columnGap = column.gap;
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
                                    const length = columnItem.length;
                                    let k = 0;
                                    while (k < length) {
                                        const item = columnItem[k++];
                                        if (!modified.has(item)) {
                                            const { columnSpan, rowSpan } = item.data(this.name, 'cellData');
                                            const x = j + columnSpan - 1;
                                            const y = i + rowSpan - 1;
                                            if (columnGap > 0 && x < columnCount - 1) {
                                                item.modifyBox(2 /* MARGIN_RIGHT */, columnGap);
                                            }
                                            if (rowGap > 0 && y < rowCount - 1) {
                                                item.modifyBox(4 /* MARGIN_BOTTOM */, rowGap);
                                            }
                                            if (rowSpan === 1) {
                                                const boundsHeight = item.bounds.height;
                                                const columnHeight = rowMax[i];
                                                if (item.hasHeight) {
                                                    if (columnHeight < 0) {
                                                        if (boundsHeight > Math.abs(columnHeight)) {
                                                            rowMax[i] = boundsHeight;
                                                        }
                                                    } else {
                                                        rowMax[i] = Math.max(boundsHeight, columnHeight);
                                                    }
                                                } else if (boundsHeight > Math.abs(columnHeight)) {
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
                                                    } else {
                                                        columnMax[j] = Math.max(boundsWidth, columnWidth);
                                                    }
                                                } else if (boundsWidth > Math.abs(columnWidth)) {
                                                    columnMax[j] = -boundsWidth;
                                                }
                                            }
                                            modified.add(item);
                                        }
                                    }
                                } else if (!horizontal) {
                                    mainData.emptyRows[j] = [Infinity];
                                }
                            }
                        } else {
                            if (isNumber$2(unitHeight)) {
                                rowMax[i] = parseFloat(unitHeight);
                            }
                            if (horizontal) {
                                mainData.emptyRows[i] = [Infinity];
                            }
                        }
                    }
                    mainData.minCellHeight = minCellHeight;
                    if (horizontal) {
                        if (node.hasPX('width', { percent: false })) {
                            column.fixedWidth = true;
                            column.flexible = false;
                            setFlexibleDimension(node.actualWidth, columnGap, columnCount, column.unit, columnMax);
                        }
                        if (node.hasHeight && !CssGrid.isAligned(node)) {
                            fillUnitEqually(row.unit, rowCount);
                        }
                    } else {
                        if (node.hasPX('height', { percent: false })) {
                            row.fixedWidth = true;
                            row.flexible = false;
                            setFlexibleDimension(node.actualHeight, rowGap, rowCount, rowUnit, rowMax);
                        }
                        if (node.hasWidth && !CssGrid.isJustified(node)) {
                            fillUnitEqually(column.unit, columnCount);
                        }
                    }
                    node.retainAs(children);
                    node.cssSort('zIndex', { byInt: true });
                    if (node.cssTry('display', 'block')) {
                        node.each(item => {
                            const { width, height } = item.boundingClientRect;
                            item.data(
                                this.name,
                                'boundsData',
                                Object.assign(Object.assign({}, item.bounds), { width, height })
                            );
                        });
                        node.cssFinally('display');
                    }
                    applyLayout(node, column, columnCount, true);
                    applyLayout(node, row, rowCount, false);
                    node.data(this.name, 'mainData', mainData);
                }
            }
            return undefined;
        }
    }
    CssGrid.isFr = value => /\dfr$/.test(value);
    CssGrid.isAligned = node => node.hasHeight && /^space-|center|flex-end|end/.test(node.css('alignContent'));
    CssGrid.isJustified = node =>
        (node.blockStatic || node.hasWidth) && /^space-|center|flex-end|end|right/.test(node.css('justifyContent'));

    const { withinRange: withinRange$2 } = squared.lib.util;
    function createDataAttribute$1(node, children) {
        return Object.assign(Object.assign({}, node.flexdata), { rowCount: 0, columnCount: 0, children });
    }
    class Flexbox extends ExtensionUI {
        is(node) {
            return node.flexElement;
        }
        condition(node) {
            return node.length > 0;
        }
        processNode(node) {
            const controller = this.controller;
            const [children, absolute] = node.partition(item => item.pageFlow);
            const mainData = createDataAttribute$1(node, children);
            if (node.cssTry('align-items', 'start')) {
                if (node.cssTry('justify-items', 'start')) {
                    const length = children.length;
                    let i = 0;
                    while (i < length) {
                        const item = children[i++];
                        if (item.cssTry('align-self', 'start')) {
                            if (item.cssTry('justify-self', 'start')) {
                                const { width, height } = item.boundingClientRect;
                                item.data(
                                    this.name,
                                    'boundsData',
                                    Object.assign(Object.assign({}, item.bounds), { width, height })
                                );
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
                const [align, sort, size, method] = mainData.row
                    ? ['top', 'left', 'right', 'intersectY']
                    : ['left', 'top', 'bottom', 'intersectX'];
                children.sort((a, b) => {
                    const linearA = a.linear;
                    const linearB = b.linear;
                    if (!a[method](b.bounds, 'bounds')) {
                        return linearA[align] < linearB[align] ? -1 : 1;
                    } else {
                        const posA = linearA[sort];
                        const posB = linearB[sort];
                        if (!withinRange$2(posA, posB)) {
                            return posA < posB ? -1 : 1;
                        }
                    }
                    return 0;
                });
                let rowStart = children[0],
                    row = [rowStart],
                    length = children.length,
                    maxCount = 0,
                    offset;
                const rows = [row];
                let i = 1;
                while (i < length) {
                    const item = children[i++];
                    if (rowStart[method](item.bounds, 'bounds')) {
                        row.push(item);
                    } else {
                        rowStart = item;
                        row = [item];
                        rows.push(row);
                    }
                }
                node.clear();
                length = rows.length;
                i = 0;
                if (length > 1) {
                    const boxSize = node.box[size];
                    while (i < length) {
                        const seg = rows[i];
                        maxCount = Math.max(seg.length, maxCount);
                        const group = controller.createNodeGroup(seg[0], seg, node, { delegate: true, cascade: true });
                        group.addAlign(64 /* SEGMENTED */);
                        group.box[size] = boxSize;
                        group.containerIndex = i++;
                    }
                    offset = length;
                } else {
                    const items = rows[0];
                    node.retainAs(items);
                    maxCount = items.length;
                    while (i < maxCount) {
                        items[i].containerIndex = i++;
                    }
                    offset = maxCount;
                }
                i = 0;
                while (i < absolute.length) {
                    absolute[i].containerIndex = offset + i++;
                }
                node.addAll(absolute);
                if (mainData.row) {
                    mainData.rowCount = length;
                    mainData.columnCount = maxCount;
                } else {
                    mainData.rowCount = maxCount;
                    mainData.columnCount = length;
                }
            } else {
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
                } else if (mainData.reverse) {
                    children.reverse();
                }
                if (mainData.row) {
                    mainData.rowCount = 1;
                    mainData.columnCount = node.length;
                } else {
                    mainData.rowCount = node.length;
                    mainData.columnCount = 1;
                }
            }
            node.data(this.name, 'mainData', mainData);
            return undefined;
        }
    }

    const {
        aboveRange: aboveRange$1,
        belowRange: belowRange$1,
        safeNestedArray: safeNestedArray$3,
        withinRange: withinRange$3,
    } = squared.lib.util;
    function getRowIndex(columns, target) {
        const topA = target.bounds.top;
        const length = columns.length;
        let i = 0;
        while (i < length) {
            const index = columns[i++].findIndex(item => {
                if (!item) {
                    return false;
                }
                const top = item.bounds.top;
                return withinRange$3(topA, top) || (Math.ceil(topA) >= top && topA < Math.floor(item.bounds.bottom));
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
            };
        }
        condition(node) {
            if (node.length > 1 && !node.layoutElement && node.tagName !== 'TABLE' && !node.has('listStyle')) {
                if (node.display === 'table') {
                    return (
                        node.every(
                            item => item.display === 'table-row' && item.every(child => child.display === 'table-cell')
                        ) || node.every(item => item.display === 'table-cell')
                    );
                } else if (node.percentWidth === 0 || !node.find(item => item.percentWidth > 0, { cascade: true })) {
                    let minLength = false,
                        itemCount = 0;
                    for (const item of node) {
                        if (
                            item.pageFlow &&
                            item.blockStatic &&
                            !item.visibleStyle.background &&
                            item.percentWidth === 0 &&
                            !item.autoMargin.leftRight &&
                            !item.autoMargin.left
                        ) {
                            if (item.length > 1) {
                                minLength = true;
                            }
                            if (item.display === 'list-item' && !item.has('listStyleType')) {
                                ++itemCount;
                            }
                        } else {
                            return false;
                        }
                    }
                    return (
                        itemCount === node.length ||
                        (minLength && node.every(item => item.length > 0 && NodeUI.linearData(item.children).linearX))
                    );
                }
            }
            return false;
        }
        processNode(node) {
            var _a;
            const columnEnd = [];
            const nextMapX = {};
            const columns = [];
            node.each(row => {
                row.each(column => {
                    if (column.visible) {
                        safeNestedArray$3(nextMapX, Math.floor(column.linear.left)).push(column);
                    }
                });
            });
            const nextCoordsX = Object.keys(nextMapX);
            const length = nextCoordsX.length;
            if (length > 0) {
                let columnLength = -1;
                for (let i = 0; i < length; ++i) {
                    const nextAxisX = nextMapX[nextCoordsX[i]];
                    if (i === 0) {
                        columnLength = length;
                    } else if (columnLength !== nextAxisX.length) {
                        columnLength = -1;
                        break;
                    }
                }
                if (columnLength !== -1) {
                    let i = 0;
                    while (i < length) {
                        columns.push(nextMapX[nextCoordsX[i++]]);
                    }
                } else {
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
                                } else {
                                    const index = getRowIndex(columns, nextX);
                                    if (index !== -1) {
                                        row[index] = nextX;
                                    } else {
                                        return undefined;
                                    }
                                }
                            } else {
                                const columnLast = columns[columns.length - 1];
                                if (columnLast) {
                                    let minLeft = Infinity,
                                        maxRight = -Infinity;
                                    let k = 0;
                                    while (k < columnLast.length) {
                                        const linear = columnLast[k++].linear;
                                        minLeft = Math.min(linear.left, minLeft);
                                        maxRight = Math.max(linear.right, maxRight);
                                    }
                                    if (
                                        Math.floor(left) > Math.ceil(minLeft) &&
                                        Math.floor(right) > Math.ceil(maxRight)
                                    ) {
                                        const index = getRowIndex(columns, nextX);
                                        if (index !== -1) {
                                            k = columns.length - 1;
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
                            } else if (i === q - 1) {
                                columnRight[j] = columnRight[i];
                            }
                        } else if (j !== -1) {
                            columnRight[j] = columnRight[i - 1];
                            j = -1;
                        }
                    }
                    for (let i = 0; i < columns.length; ++i) {
                        if ((_a = columns[i]) === null || _a === void 0 ? void 0 : _a.length) {
                            columnEnd.push(columnRight[i]);
                        } else {
                            columns.splice(i--, 1);
                        }
                    }
                    const maxColumn = columns.reduce((a, b) => Math.max(a, b.length), 0);
                    for (let l = 0; l < maxColumn; ++l) {
                        const r = columns.length;
                        let m = 0;
                        while (m < r) {
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
                const rows = [];
                const assigned = new Set();
                for (let i = 0, count = 0; i < columnCount; ++i) {
                    const column = columns[i];
                    const rowCount = column.length;
                    for (let j = 0, start = 0, spacer = 0; j < rowCount; ++j) {
                        const item = column[j];
                        const rowData = safeNestedArray$3(rows, j);
                        if (!item['spacer']) {
                            const data = Object.assign(
                                Grid.createDataCellAttribute(),
                                item.data(this.name, 'cellData')
                            );
                            let rowSpan = 1,
                                columnSpan = 1 + spacer;
                            let k = i + 1;
                            while (k < columnCount) {
                                const row = columns[k++][j];
                                if (row.spacer === 1) {
                                    ++columnSpan;
                                    row.spacer = 2;
                                } else {
                                    break;
                                }
                            }
                            if (columnSpan === 1) {
                                k = j + 1;
                                while (k < rowCount) {
                                    const row = column[k++];
                                    if (row.spacer === 1) {
                                        ++rowSpan;
                                        row.spacer = 2;
                                    } else {
                                        break;
                                    }
                                }
                            }
                            if (columnEnd.length > 0) {
                                const l = Math.min(i + (columnSpan - 1), columnEnd.length - 1);
                                const naturalChildren = item.actualParent.naturalChildren;
                                const q = naturalChildren.length;
                                k = 0;
                                while (k < q) {
                                    const sibling = naturalChildren[k++];
                                    if (!assigned.has(sibling) && sibling.visible && !sibling.rendered) {
                                        const { left, right } = sibling.linear;
                                        if (
                                            aboveRange$1(left, item.linear.right) &&
                                            belowRange$1(right, columnEnd[l])
                                        ) {
                                            safeNestedArray$3(data, 'siblings').push(sibling);
                                        }
                                    }
                                }
                            }
                            data.rowSpan = rowSpan;
                            data.columnSpan = columnSpan;
                            data.rowStart = start++ === 0;
                            data.rowEnd = columnSpan + i === columnCount;
                            data.cellStart = count++ === 0;
                            data.cellEnd = data.rowEnd && j === rowCount - 1;
                            data.index = i;
                            spacer = 0;
                            item.data(this.name, 'cellData', data);
                            rowData.push(item);
                            assigned.add(item);
                        } else if (item['spacer'] === 1) {
                            ++spacer;
                        }
                    }
                }
                node.each(item => item.hide());
                node.clear();
                const q = rows.length;
                let i = 0,
                    j;
                while (i < q) {
                    const children = rows[i++];
                    const r = children.length;
                    j = 0;
                    while (j < r) {
                        children[j++].parent = node;
                    }
                }
                if (node.tableElement && node.css('borderCollapse') === 'collapse') {
                    node.resetBox(240 /* PADDING */);
                }
                node.data(this.name, 'columnCount', columnCount);
            }
            return undefined;
        }
    }

    const { convertListStyle: convertListStyle$1 } = squared.lib.css;
    const { isNumber: isNumber$3 } = squared.lib.util;
    const hasSingleImage = visibleStyle => visibleStyle.backgroundImage && !visibleStyle.backgroundRepeat;
    const createDataAttribute$2 = () => ({ ordinal: '', imageSrc: '', imagePosition: '' });
    class List extends ExtensionUI {
        condition(node) {
            const length = node.length;
            if (length > 0) {
                const children = node.children;
                let blockStatic = true,
                    inlineVertical = true,
                    floating = true,
                    blockAlternate = true,
                    bulletVisible = false,
                    floated;
                for (let i = 0; i < length; ++i) {
                    const item = children[i];
                    const type = item.css('listStyleType');
                    if (
                        (item.display === 'list-item' && (type !== 'none' || item.innerBefore)) ||
                        (item.marginLeft < 0 && type === 'none' && hasSingleImage(item.visibleStyle))
                    ) {
                        bulletVisible = true;
                    }
                    if (floating || blockAlternate) {
                        if (item.floating) {
                            if (!floated) {
                                floated = new Set();
                            }
                            floated.add(item.float);
                            blockAlternate = false;
                        } else if (
                            i === 0 ||
                            i === length - 1 ||
                            item.blockStatic ||
                            (children[i - 1].blockStatic && children[i + 1].blockStatic)
                        ) {
                            floating = false;
                        } else {
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
                return (
                    bulletVisible &&
                    (blockStatic ||
                        inlineVertical ||
                        (floated === null || floated === void 0 ? void 0 : floated.size) === 1 ||
                        blockAlternate)
                );
            }
            return false;
        }
        processNode(node) {
            const ordered = node.tagName === 'OL';
            let i = (ordered && node.toElementInt('start')) || 1;
            node.each(item => {
                const mainData = createDataAttribute$2();
                const type = item.css('listStyleType');
                const enabled = item.display === 'list-item';
                if (enabled || (type !== '' && type !== 'none') || hasSingleImage(item.visibleStyle)) {
                    if (item.has('listStyleImage')) {
                        mainData.imageSrc = item.css('listStyleImage');
                    } else {
                        if (ordered && enabled && item.tagName === 'LI') {
                            const value = item.attributes['value'];
                            if (value && isNumber$3(value)) {
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
                                    let src = '',
                                        position = '';
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
                        } else {
                            ordinal += '.';
                        }
                        mainData.ordinal = ordinal;
                    }
                    if (enabled) {
                        ++i;
                    }
                }
                item.data(this.name, 'mainData', mainData);
            });
            return undefined;
        }
    }

    const { assignRect: assignRect$1 } = squared.lib.dom;
    const { convertFloat: convertFloat$2, withinRange: withinRange$4 } = squared.lib.util;
    class Relative extends ExtensionUI {
        is(node) {
            return (node.positionRelative && !node.autoPosition) || convertFloat$2(node.verticalAlign) !== 0;
        }
        condition() {
            return true;
        }
        processNode(node) {
            return { subscribe: true };
        }
        postOptimize(node) {
            const renderParent = node.renderParent;
            const verticalAlign = !node.baselineAltered ? convertFloat$2(node.verticalAlign) : 0;
            let top = 0,
                right = 0,
                bottom = 0,
                left = 0;
            if (node.hasPX('top')) {
                top = node.top;
            } else {
                bottom = node.bottom;
            }
            if (node.hasPX('left')) {
                left = node.left;
            } else {
                right = node.right;
            }
            if (renderParent.support.positionTranslation) {
                let x = 0,
                    y = 0;
                if (left !== 0) {
                    x = left;
                } else if (right !== 0) {
                    x = -right;
                }
                if (top !== 0) {
                    y = top;
                } else if (bottom !== 0) {
                    y = -bottom;
                }
                if (verticalAlign !== 0) {
                    y -= verticalAlign;
                }
                if (x !== 0) {
                    node.translateX(x, { relative: true });
                }
                if (y !== 0) {
                    node.translateY(y, { relative: true });
                }
            } else {
                let target = node;
                if (
                    (top !== 0 || bottom !== 0 || verticalAlign !== 0) &&
                    renderParent.layoutHorizontal &&
                    renderParent.support.positionRelative &&
                    node.renderChildren.length === 0
                ) {
                    target = node.clone(this.application.nextId);
                    target.baselineAltered = true;
                    node.hide({ hidden: true });
                    this.application.getProcessingCache(node.sessionId).add(target, false);
                    const layout = new LayoutUI(renderParent, target, target.containerType, target.alignmentType);
                    const index = renderParent.renderChildren.findIndex(item => item === node);
                    if (index !== -1) {
                        layout.renderIndex = index + 1;
                    }
                    this.application.addLayout(layout);
                    if (node.parseUnit(node.css('textIndent')) < 0) {
                        const documentId = node.documentId;
                        renderParent.renderEach(item => {
                            if (item.alignSibling('topBottom') === documentId) {
                                item.alignSibling('topBottom', target.documentId);
                            } else if (item.alignSibling('bottomTop') === documentId) {
                                item.alignSibling('bottomTop', target.documentId);
                            }
                        });
                    }
                    if (node.baselineActive && !node.baselineAltered) {
                        for (const children of renderParent.horizontalRows || [renderParent.renderChildren]) {
                            if (children.includes(node)) {
                                const unaligned = children.filter(
                                    item =>
                                        item.positionRelative &&
                                        item.length > 0 &&
                                        convertFloat$2(node.verticalAlign) !== 0
                                );
                                const length = unaligned.length;
                                if (length > 0) {
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
                                            node.modifyBox(1 /* MARGIN_TOP */, convertFloat$2(item.verticalAlign));
                                            first = false;
                                        } else {
                                            item.modifyBox(
                                                1 /* MARGIN_TOP */,
                                                item.linear.top - unaligned[0].linear.top
                                            );
                                        }
                                        item.setCacheValue('verticalAlign', '0px');
                                    }
                                }
                                break;
                            }
                        }
                    }
                } else if (node.positionRelative && node.naturalElement) {
                    const bounds = node.bounds;
                    const hasVertical = top !== 0 || bottom !== 0;
                    const hasHorizontal = left !== 0 || right !== 0;
                    const children = node.actualParent.naturalChildren;
                    let preceding = false,
                        previous;
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
                                    } else if (
                                        (previous === null || previous === void 0
                                            ? void 0
                                            : previous.positionRelative) &&
                                        previous.hasPX('top')
                                    ) {
                                        bottom += bounds.bottom - rect.bottom;
                                    } else {
                                        bottom += rect.bottom - bounds.bottom;
                                    }
                                }
                                if (hasHorizontal && renderParent.layoutHorizontal && !node.alignSibling('leftRight')) {
                                    const rect = assignRect$1(node.boundingClientRect);
                                    if (left !== 0) {
                                        left -= rect.left - bounds.left;
                                    } else if (
                                        (previous === null || previous === void 0
                                            ? void 0
                                            : previous.positionRelative) &&
                                        previous.hasPX('right')
                                    ) {
                                        right += bounds.right - rect.right;
                                    } else {
                                        right += rect.right - bounds.right;
                                    }
                                }
                            } else if (renderParent.layoutVertical) {
                                if (top !== 0) {
                                    if (
                                        (previous === null || previous === void 0 ? void 0 : previous.blockStatic) &&
                                        previous.positionRelative &&
                                        item.blockStatic
                                    ) {
                                        top -= previous.top;
                                    }
                                } else if (bottom !== 0) {
                                    const getBox = item.getBox(1 /* MARGIN_TOP */);
                                    if (getBox[0] === 1) {
                                        bottom -= item.marginTop;
                                    }
                                }
                            }
                            break;
                        } else if (item.positionRelative && item.renderParent === renderParent) {
                            preceding = true;
                        }
                        if (item.pageFlow) {
                            previous = item;
                        }
                    }
                }
                if (verticalAlign !== 0) {
                    target.modifyBox(1 /* MARGIN_TOP */, verticalAlign * -1);
                }
                if (top !== 0) {
                    target.modifyBox(1 /* MARGIN_TOP */, top);
                } else if (bottom !== 0) {
                    target.modifyBox(1 /* MARGIN_TOP */, bottom * -1);
                }
                if (left !== 0) {
                    if (target.autoMargin.left) {
                        target.modifyBox(2 /* MARGIN_RIGHT */, left * -1);
                    } else {
                        target.modifyBox(8 /* MARGIN_LEFT */, left);
                    }
                } else if (right !== 0) {
                    target.modifyBox(8 /* MARGIN_LEFT */, right * -1);
                }
                if (target !== node) {
                    target.setBoxSpacing();
                }
            }
        }
    }

    const { getBackgroundPosition: getBackgroundPosition$1, resolveURL: resolveURL$1 } = squared.lib.css;
    class Sprite extends ExtensionUI {
        is(node) {
            return node.length === 0 && node.hasWidth && node.hasHeight;
        }
        condition(node) {
            const backgroundImage = node.backgroundImage;
            if (backgroundImage !== '' && (!node.use || this.included(node.element))) {
                const url = resolveURL$1(backgroundImage);
                const image = this.resource.getRawData(backgroundImage) || (url && this.resource.getImage(url));
                if (image) {
                    const dimension = node.actualDimension;
                    const [backgroundPositionX, backgroundPositionY] = node.cssAsTuple(
                        'backgroundPositionX',
                        'backgroundPositionY'
                    );
                    const position = getBackgroundPosition$1(
                        backgroundPositionX + ' ' + backgroundPositionY,
                        dimension,
                        { fontSize: node.fontSize, screenDimension: node.localSettings.screenDimension }
                    );
                    const pattern = /^0[a-z%]+|left|start|top/;
                    const x = (position.left < 0 || pattern.test(backgroundPositionX)) && image.width > dimension.width;
                    const y =
                        (position.top < 0 || pattern.test(backgroundPositionY)) && image.height > dimension.height;
                    if ((x || y) && (x || position.left === 0) && (y || position.top === 0)) {
                        node.data(this.name, 'mainData', { image, position });
                        return true;
                    }
                }
            }
            return false;
        }
    }

    const {
        formatPercent: formatPercent$1,
        formatPX: formatPX$5,
        getInheritedStyle: getInheritedStyle$2,
        getStyle: getStyle$3,
        isLength: isLength$5,
        isPercent: isPercent$4,
    } = squared.lib.css;
    const { getNamedItem: getNamedItem$3 } = squared.lib.dom;
    const { maxArray: maxArray$2 } = squared.lib.math;
    const {
        isNumber: isNumber$4,
        replaceMap,
        safeNestedArray: safeNestedArray$4,
        withinRange: withinRange$5,
    } = squared.lib.util;
    function setAutoWidth(node, td, data) {
        data.percent = Math.round((td.bounds.width / node.box.width) * 100) + '%';
        data.expand = true;
    }
    function setBorderStyle$2(node, attr, including) {
        const cssStyle = attr + 'Style';
        node.ascend({ including }).some(item => {
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
    function createDataAttribute$3(node) {
        return {
            layoutType: 0,
            rowCount: 0,
            columnCount: 0,
            layoutFixed: node.css('tableLayout') === 'fixed',
            borderCollapse: node.css('borderCollapse') === 'collapse',
            expand: false,
        };
    }
    const setBoundsWidth = node => node.css('width', formatPX$5(node.bounds.width), true);
    class Table extends ExtensionUI {
        processNode(node) {
            const mainData = createDataAttribute$3(node);
            let table = [],
                tfoot,
                thead;
            const inheritStyles = (parent, append) => {
                if (parent) {
                    parent.cascade(item => {
                        switch (item.tagName) {
                            case 'TH':
                            case 'TD':
                                item.inherit(parent, 'styleMap');
                                item.unsetCache('visibleStyle');
                                break;
                        }
                    });
                    table = append ? table.concat(parent.children) : parent.children.concat(table);
                }
            };
            node.each(item => {
                switch (item.tagName) {
                    case 'THEAD':
                        if (!thead) {
                            thead = item;
                        }
                        hideCell(item);
                        break;
                    case 'TBODY':
                        table = table.concat(item.children);
                        hideCell(item);
                        break;
                    case 'TFOOT':
                        if (!tfoot) {
                            tfoot = item;
                        }
                        hideCell(item);
                        break;
                }
            });
            inheritStyles(thead, false);
            inheritStyles(tfoot, true);
            const hasWidth = node.hasWidth;
            const borderCollapse = mainData.borderCollapse;
            const [horizontal, vertical] = borderCollapse
                ? [0, 0]
                : replaceMap(node.css('borderSpacing').split(' '), (value, index) =>
                      index === 0 ? node.parseWidth(value) : node.parseHeight(value)
                  );
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
            let j;
            for (let i = 0; i < rowCount; ++i) {
                const tr = table[i];
                rowWidth[i] = horizontal;
                const row = tableFilled[i] || [];
                tableFilled[i] = row;
                tr.each((td, index) => {
                    const element = td.element;
                    const rowSpan = element.rowSpan;
                    let colSpan = element.colSpan;
                    j = 0;
                    while (row[j]) {
                        ++j;
                    }
                    const q = i + rowSpan;
                    let k = i;
                    while (k < q) {
                        const item = safeNestedArray$4(tableFilled, k++);
                        const r = j + colSpan;
                        for (let l = j, m = 0; l < r; ++l) {
                            if (!item[l]) {
                                item[l] = td;
                                ++m;
                            } else {
                                colSpan = m;
                                break;
                            }
                        }
                    }
                    if (!td.hasPX('width')) {
                        const value = getNamedItem$3(element, 'width');
                        if (isPercent$4(value)) {
                            td.css('width', value, true);
                        } else if (isNumber$4(value)) {
                            td.css('width', formatPX$5(parseFloat(value)), true);
                        }
                    }
                    if (!td.hasPX('height')) {
                        const value = getNamedItem$3(element, 'height');
                        if (isPercent$4(value)) {
                            td.css('height', value);
                        } else if (isNumber$4(value)) {
                            td.css('height', formatPX$5(parseFloat(value)));
                        }
                    }
                    if (td.cssInitial('verticalAlign') === '') {
                        td.css('verticalAlign', 'middle', true);
                    }
                    if (!td.visibleStyle.backgroundImage && !td.visibleStyle.backgroundColor) {
                        const pattern = /rgba\(0, 0, 0, 0\)|transparent/;
                        if (colgroup) {
                            const { backgroundImage, backgroundColor } = getStyle$3(colgroup.children[index + 1]);
                            if (backgroundImage && backgroundImage !== 'none') {
                                td.css('backgroundImage', backgroundImage, true);
                            }
                            if (backgroundColor && !pattern.test(backgroundColor)) {
                                td.css('backgroundColor', backgroundColor);
                                td.setCacheValue('backgroundColor', backgroundColor);
                            }
                        } else {
                            let value = getInheritedStyle$2(element, 'backgroundImage', /none/, 'TABLE');
                            if (value !== '') {
                                td.css('backgroundImage', value, true);
                            }
                            value = getInheritedStyle$2(element, 'backgroundColor', pattern, 'TABLE');
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
                                setBorderStyle$2(td, 'borderTop', including);
                            }
                            if (td.borderRightWidth === 0) {
                                setBorderStyle$2(td, 'borderRight', including);
                            }
                            if (td.borderBottomWidth === 0) {
                                setBorderStyle$2(td, 'borderBottom', including);
                            }
                            if (td.borderLeftWidth === 0) {
                                setBorderStyle$2(td, 'borderLeft', including);
                            }
                            break;
                        }
                        case 'TH':
                            if (td.cssInitial('textAlign') === '') {
                                td.css('textAlign', 'center');
                            }
                            if (td.borderTopWidth === 0) {
                                setBorderStyle$2(td, 'borderTop', node);
                            }
                            if (td.borderBottomWidth === 0) {
                                setBorderStyle$2(td, 'borderBottom', node);
                            }
                            break;
                    }
                    const columnWidth = td.cssInitial('width');
                    const reevaluate = mapWidth[j] === undefined || mapWidth[j] === 'auto';
                    const width = td.bounds.width;
                    if (i === 0 || reevaluate || !mainData.layoutFixed) {
                        if (columnWidth === '' || columnWidth === 'auto') {
                            if (mapWidth[j] === undefined) {
                                mapWidth[j] = columnWidth || '0px';
                                mapBounds[j] = 0;
                            } else if (i === rowCount - 1 && reevaluate && mapBounds[j] === 0) {
                                mapBounds[j] = width;
                            }
                        } else {
                            const percent = isPercent$4(columnWidth);
                            const length = isLength$5(mapWidth[j]);
                            if (
                                reevaluate ||
                                width < mapBounds[j] ||
                                (width === mapBounds[j] &&
                                    ((length && percent) ||
                                        (percent &&
                                            isPercent$4(mapWidth[j]) &&
                                            td.parseWidth(columnWidth) >= td.parseWidth(mapWidth[j])) ||
                                        (length &&
                                            isLength$5(columnWidth) &&
                                            td.parseWidth(columnWidth) > td.parseWidth(mapWidth[j]))))
                            ) {
                                mapWidth[j] = columnWidth;
                            }
                            if (reevaluate || element.colSpan === 1) {
                                mapBounds[j] = width;
                            }
                        }
                    }
                    if (td.length > 0 || td.inlineText) {
                        rowWidth[i] += width + horizontal;
                    }
                    if (spacingWidth > 0) {
                        td.modifyBox(8 /* MARGIN_LEFT */, j === 0 ? horizontal : spacingWidth);
                        td.modifyBox(2 /* MARGIN_RIGHT */, index === 0 ? spacingWidth : horizontal);
                    }
                    if (spacingHeight > 0) {
                        td.modifyBox(1 /* MARGIN_TOP */, i === 0 ? vertical : spacingHeight);
                        td.modifyBox(4 /* MARGIN_BOTTOM */, i + rowSpan < rowCount ? spacingHeight : vertical);
                    }
                    td.data(this.name, 'cellData', { colSpan, rowSpan });
                });
                hideCell(tr);
                columnCount = Math.max(columnCount, row.length);
            }
            if (node.hasPX('width', { percent: false }) && mapWidth.some(value => isPercent$4(value))) {
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
                    replaceMap(mapWidth, value => {
                        const percent = parseFloat(value);
                        if (percentTotal <= 0) {
                            value = '0px';
                        } else if (percentTotal - percent < 0) {
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
            } else if (mapWidth.every(value => isLength$5(value))) {
                const width = mapWidth.reduce((a, b) => a + parseFloat(b), 0);
                if (node.hasWidth) {
                    if (width < node.width) {
                        replaceMap(mapWidth, value =>
                            value !== '0px' ? (parseFloat(value) / width) * 100 + '%' : value
                        );
                    } else if (width > node.width) {
                        node.css('width', 'auto');
                        if (!mainData.layoutFixed) {
                            node.cascade(item => {
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
                    if (
                        mainData.layoutFixed &&
                        mapWidth.reduce((a, b) => a + (isLength$5(b) ? parseFloat(b) : 0), 0) >= node.actualWidth
                    ) {
                        return 4 /* COMPRESS */;
                    } else if (
                        (mapWidth.length > 1 && mapWidth.some(value => isPercent$4(value))) ||
                        mapWidth.every(value => isLength$5(value) && value !== '0px')
                    ) {
                        return 3 /* VARIABLE */;
                    } else if (mapWidth.every(value => value === mapWidth[0])) {
                        if (node.find(td => td.hasHeight, { cascade: true })) {
                            mainData.expand = true;
                            return 3 /* VARIABLE */;
                        } else if (mapWidth[0] === 'auto') {
                            if (node.hasWidth) {
                                return 3 /* VARIABLE */;
                            } else {
                                const td = node.cascade(item => item.tagName === 'TD');
                                return td.length > 0 &&
                                    td.every(item => withinRange$5(item.bounds.width, td[0].bounds.width))
                                    ? 0 /* NONE */
                                    : 3 /* VARIABLE */;
                            }
                        } else if (node.hasWidth) {
                            return 2 /* FIXED */;
                        }
                    }
                    if (mapWidth.every(value => value === 'auto' || (isLength$5(value) && value !== '0px'))) {
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
                    } else if (caption.bounds.width > maxArray$2(rowWidth)) {
                        setBoundsWidth(caption);
                    }
                }
                if (!caption.cssInitial('textAlign')) {
                    caption.css('textAlign', 'center');
                }
                caption.data(this.name, 'cellData', { colSpan: columnCount });
                if (!captionBottom) {
                    caption.parent = node;
                }
            }
            let i = 0;
            while (i < rowCount) {
                const tr = tableFilled[i++];
                const length = tr.length;
                j = 0;
                while (j < length) {
                    const td = tr[j];
                    const cellData = td.data(this.name, 'cellData');
                    const columnWidth = mapWidth[j];
                    j += cellData.colSpan;
                    if (cellData.placed) {
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
                                        cellData.exceed = !hasWidth;
                                        cellData.downsized = true;
                                    } else {
                                        setAutoWidth(node, td, cellData);
                                    }
                                } else if (isPercent$4(columnWidth)) {
                                    if (percentAll) {
                                        cellData.percent = columnWidth;
                                        cellData.expand = true;
                                    } else {
                                        setBoundsWidth(td);
                                    }
                                } else if (isLength$5(columnWidth) && parseInt(columnWidth) > 0) {
                                    if (td.bounds.width >= parseInt(columnWidth)) {
                                        setBoundsWidth(td);
                                        cellData.expand = false;
                                        cellData.downsized = false;
                                    } else if (mainData.layoutFixed) {
                                        setAutoWidth(node, td, cellData);
                                        cellData.downsized = true;
                                    } else {
                                        setBoundsWidth(td);
                                        cellData.expand = false;
                                    }
                                } else {
                                    if (!td.hasPX('width', { percent: false }) || td.percentWidth) {
                                        setBoundsWidth(td);
                                    }
                                    cellData.expand = false;
                                }
                                break;
                            case 2 /* FIXED */:
                                setAutoWidth(node, td, cellData);
                                break;
                            case 1 /* STRETCH */:
                                if (columnWidth === 'auto') {
                                    cellData.flexible = true;
                                } else {
                                    if (mainData.layoutFixed) {
                                        cellData.downsized = true;
                                    } else {
                                        setBoundsWidth(td);
                                    }
                                    cellData.expand = false;
                                }
                                break;
                            case 4 /* COMPRESS */:
                                if (!isLength$5(columnWidth)) {
                                    td.hide();
                                }
                                break;
                        }
                    }
                    cellData.placed = true;
                    td.parent = node;
                }
                if (length < columnCount) {
                    const cellData = tr[length - 1].data(this.name, 'cellData');
                    if (cellData) {
                        cellData.spaceSpan = columnCount - length;
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
                let hideTop = false,
                    hideRight = false,
                    hideBottom = false,
                    hideLeft = false;
                for (i = 0; i < rowCount; ++i) {
                    const tr = tableFilled[i];
                    for (j = 0; j < columnCount; ++j) {
                        const td = tr[j];
                        if ((td === null || td === void 0 ? void 0 : td.css('visibility')) === 'visible') {
                            if (i === 0) {
                                if (td.borderTopWidth < borderTopWidth) {
                                    td.cssApply(borderTop);
                                    td.unsetCache('borderTopWidth');
                                } else {
                                    hideTop = true;
                                }
                            }
                            if (i >= 0 && i < rowCount - 1) {
                                const next = tableFilled[i + 1][j];
                                if (
                                    (next === null || next === void 0 ? void 0 : next.css('visibility')) ===
                                        'visible' &&
                                    next !== td
                                ) {
                                    if (td.borderBottomWidth > next.borderTopWidth) {
                                        next.css('borderTopWidth', '0px', true);
                                    } else {
                                        td.css('borderBottomWidth', '0px', true);
                                    }
                                }
                            }
                            if (i === rowCount - 1) {
                                if (td.borderBottomWidth < borderBottomWidth) {
                                    td.cssApply(borderBottom);
                                    td.unsetCache('borderBottomWidth');
                                } else {
                                    hideBottom = true;
                                }
                            }
                            if (j === 0) {
                                if (td.borderLeftWidth < borderLeftWidth) {
                                    td.cssApply(borderLeft);
                                    td.unsetCache('borderLeftWidth');
                                } else {
                                    hideLeft = true;
                                }
                            }
                            if (j >= 0 && j < columnCount - 1) {
                                const next = tr[j + 1];
                                if (
                                    (next === null || next === void 0 ? void 0 : next.css('visibility')) ===
                                        'visible' &&
                                    next !== td
                                ) {
                                    if (td.borderRightWidth >= next.borderLeftWidth) {
                                        next.css('borderLeftWidth', '0px', true);
                                    } else {
                                        td.css('borderRightWidth', '0px', true);
                                    }
                                }
                            }
                            if (j === columnCount - 1) {
                                if (td.borderRightWidth < borderRightWidth) {
                                    td.cssApply(borderRight);
                                    td.unsetCache('borderRightWidth');
                                } else {
                                    hideRight = true;
                                }
                            }
                        }
                    }
                }
                if (hideTop || hideRight || hideBottom || hideLeft) {
                    node.cssApply(
                        {
                            borderTopWidth: '0px',
                            borderRightWidth: '0px',
                            borderBottomWidth: '0px',
                            borderLeftWidth: '0px',
                        },
                        true
                    );
                }
            }
            mainData.rowCount = rowCount + (caption ? 1 : 0);
            mainData.columnCount = columnCount;
            node.data(this.name, 'mainData', mainData);
            return undefined;
        }
    }

    const { isLength: isLength$6 } = squared.lib.css;
    class VerticalAlign extends ExtensionUI {
        is(node) {
            return node.length > 0;
        }
        condition(node) {
            const children = node.children;
            let valid = false,
                inlineVertical = 0,
                sameValue = 0;
            const length = children.length;
            let i = 0;
            while (i < length) {
                const item = children[i++];
                if (!(item.positionStatic || (item.positionRelative && item.length > 0))) {
                    return false;
                } else if (item.inlineVertical) {
                    const value = parseFloat(item.verticalAlign);
                    if (!isNaN(value)) {
                        valid = true;
                        if (!isNaN(sameValue)) {
                            if (sameValue === 0) {
                                sameValue = value;
                            } else if (sameValue !== value) {
                                sameValue = NaN;
                            }
                        }
                    }
                    ++inlineVertical;
                } else {
                    sameValue = NaN;
                }
            }
            return valid && isNaN(sameValue) && inlineVertical > 1 && NodeUI.linearData(children).linearX;
        }
        processNode(node) {
            node.each(item => {
                if ((item.inlineVertical && isLength$6(item.verticalAlign)) || item.imageElement || item.svgElement) {
                    item.baselineAltered = true;
                }
            });
            return { subscribe: true };
        }
        postConstraints(node) {
            if (node.layoutHorizontal) {
                for (const children of node.horizontalRows || [node.renderChildren]) {
                    const aboveBaseline = [];
                    let minTop = Infinity,
                        baseline;
                    const length = children.length;
                    let i = 0;
                    while (i < length) {
                        const item = children[i++];
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
                    if (aboveBaseline.length > 0) {
                        const above = aboveBaseline[0];
                        const top = above.linear.top;
                        i = 0;
                        while (i < length) {
                            const item = children[i++];
                            if (item !== baseline) {
                                if (item.inlineVertical) {
                                    if (!aboveBaseline.includes(item)) {
                                        if (isLength$6(item.verticalAlign) || !baseline) {
                                            item.setBox(1 /* MARGIN_TOP */, {
                                                reset: 1,
                                                adjustment: item.linear.top - top,
                                            });
                                            item.baselineAltered = true;
                                        }
                                    } else if (
                                        baseline &&
                                        (item.imageElement || item.svgElement) &&
                                        baseline.documentId === item.alignSibling('baseline')
                                    ) {
                                        item.setBox(1 /* MARGIN_TOP */, {
                                            reset: 1,
                                            adjustment: baseline.linear.top - item.linear.top,
                                        });
                                    }
                                }
                                if (item.baselineAltered) {
                                    item.setCacheValue('verticalAlign', '0px');
                                }
                            }
                        }
                        if (baseline) {
                            baseline.setBox(1 /* MARGIN_TOP */, {
                                reset: 1,
                                adjustment:
                                    baseline.linear.top -
                                    top +
                                    Math.min(0, above.parseHeight(above.cssInitial('verticalAlign'))),
                            });
                            baseline.baselineAltered = true;
                        }
                    }
                }
            } else {
                node.each(item => (item.baselineAltered = false));
            }
        }
    }

    var _a;
    const { formatPX: formatPX$6 } = squared.lib.css;
    const { maxArray: maxArray$3 } = squared.lib.math;
    const { getElementCache: getElementCache$4 } = squared.lib.session;
    const { iterateReverseArray } = squared.lib.util;
    const DOCTYPE_HTML = ((_a = document.doctype) === null || _a === void 0 ? void 0 : _a.name) === 'html';
    function setSpacingOffset(node, region, value, adjustment = 0) {
        let offset;
        switch (region) {
            case 1 /* MARGIN_TOP */:
                offset = node.actualRect('top') - value;
                break;
            case 8 /* MARGIN_LEFT */:
                offset = node.actualRect('left') - value;
                break;
            case 4 /* MARGIN_BOTTOM */:
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
    function adjustRegion(item, region, adjustment) {
        if (item.getBox(region)[0] === 1) {
            const registered = item.registerBox(region);
            if (registered) {
                const [reset, value] = registered.getBox(region);
                adjustment = Math.max(value, adjustment);
                if (reset === 1) {
                    registered.setBox(region, { adjustment });
                } else {
                    registered.setCacheValue('marginTop', adjustment);
                }
                return;
            }
        }
        item.setBox(region, { reset: 1, adjustment });
    }
    function applyMarginCollapse(node, child, direction) {
        if (!direction || isBlockElement(child, true)) {
            const [marginName, borderWidth, paddingName, region] = direction
                ? ['marginTop', 'borderTopWidth', 'paddingTop', 1 /* MARGIN_TOP */]
                : ['marginBottom', 'borderBottomWidth', 'paddingBottom', 4 /* MARGIN_BOTTOM */];
            if (node[borderWidth] === 0) {
                if (node[paddingName] === 0) {
                    let target = child;
                    while (
                        DOCTYPE_HTML &&
                        target[marginName] === 0 &&
                        target[borderWidth] === 0 &&
                        target[paddingName] === 0 &&
                        canResetChild(target)
                    ) {
                        if (direction) {
                            const endChild = target.firstStaticChild;
                            if (isBlockElement(endChild, direction)) {
                                target = endChild;
                            } else {
                                break;
                            }
                        } else {
                            const endChild = getBottomChild(target);
                            if (endChild) {
                                target = endChild;
                            } else {
                                break;
                            }
                        }
                    }
                    const offsetParent = node[marginName];
                    const offsetChild = target[marginName];
                    if (offsetParent >= 0 && offsetChild >= 0) {
                        const height = target.bounds.height;
                        let resetChild = false;
                        if (
                            !DOCTYPE_HTML &&
                            offsetParent === 0 &&
                            offsetChild > 0 &&
                            target.cssInitial(marginName) === ''
                        ) {
                            resetChild = true;
                        } else {
                            const outside = offsetParent >= offsetChild;
                            if (height === 0 && outside && target.textEmpty && target.extensions.length === 0) {
                                target.hide({ collapse: true });
                            } else {
                                const registered = target.registerBox(region);
                                if (registered) {
                                    const value = registered.getBox(region)[1];
                                    if (value > 0) {
                                        if (value > offsetParent) {
                                            adjustRegion(node, region, value);
                                        }
                                        registered.setBox(region, { reset: 1, adjustment: 0 });
                                    }
                                } else if (target.getBox(region)[0] === 0) {
                                    if (outside) {
                                        resetChild = offsetChild > 0;
                                    } else if (node.documentBody) {
                                        resetBox(node, region);
                                        if (direction) {
                                            if (node.bounds.top > 0) {
                                                node.bounds.top = 0;
                                                node.unset('box');
                                                node.unset('linear');
                                            }
                                            if (node.layoutVertical) {
                                                const firstChild = node.renderChildren[0];
                                                if (
                                                    (target.positionStatic ||
                                                        (target.top >= 0 && !target.hasPX('bottom'))) &&
                                                    firstChild !== child.outerMostWrapper
                                                ) {
                                                    adjustRegion(firstChild, region, offsetChild);
                                                    adjustRegion(target, region, 0);
                                                    resetChild = true;
                                                }
                                            }
                                        }
                                    } else {
                                        adjustRegion(node, region, offsetChild);
                                        resetChild = true;
                                    }
                                }
                            }
                        }
                        if (resetChild) {
                            resetBox(target, region);
                            if (!direction && target.floating) {
                                const children = target.actualParent.naturalChildren;
                                const length = children.length;
                                let i = 0;
                                while (i < length) {
                                    const item = children[i++];
                                    if (item.floating && item !== target && item.intersectY(target.bounds, 'bounds')) {
                                        resetBox(item, region);
                                    }
                                }
                            }
                            if (height === 0 && !target.every(item => item.floating || !item.pageFlow)) {
                                resetBox(target, direction ? 4 /* MARGIN_BOTTOM */ : 1 /* MARGIN_TOP */);
                            }
                        }
                    } else if (offsetParent < 0 && offsetChild < 0) {
                        if (!direction) {
                            if (offsetChild < offsetParent) {
                                adjustRegion(node, region, offsetChild);
                            }
                            resetBox(target, region);
                        }
                    }
                } else if (child[marginName] === 0 && child[borderWidth] === 0 && canResetChild(child)) {
                    let blockAll = true;
                    do {
                        const endChild = direction ? child.firstStaticChild : child.lastStaticChild;
                        if (
                            endChild &&
                            endChild[marginName] === 0 &&
                            endChild[borderWidth] === 0 &&
                            !endChild.visibleStyle.background &&
                            canResetChild(endChild)
                        ) {
                            const value = endChild[paddingName];
                            if (value > 0) {
                                if (value >= node[paddingName]) {
                                    node.setBox(direction ? 16 /* PADDING_TOP */ : 64 /* PADDING_BOTTOM */, {
                                        reset: 1,
                                    });
                                } else if (blockAll) {
                                    node.modifyBox(
                                        direction ? 16 /* PADDING_TOP */ : 64 /* PADDING_BOTTOM */,
                                        -value,
                                        false
                                    );
                                }
                                break;
                            } else {
                                if (!isBlockElement(endChild, direction)) {
                                    blockAll = false;
                                }
                                child = endChild;
                            }
                        } else {
                            break;
                        }
                    } while (true);
                }
            }
        }
    }
    function isBlockElement(node, direction) {
        if (!node || !node.styleElement || node.lineBreak) {
            return false;
        } else if (node.blockStatic) {
            return true;
        } else if (!node.floating) {
            switch (node.display) {
                case 'table':
                case 'list-item':
                    return true;
                case 'inline-flex':
                case 'inline-grid':
                case 'inline-table':
                    return false;
            }
            if (direction) {
                const firstChild = node.firstStaticChild;
                return isBlockElement(firstChild) && validAboveChild(firstChild, false);
            } else if (direction === false) {
                const lastChild = node.lastStaticChild;
                return isBlockElement(lastChild) && validBelowChild(lastChild, false);
            }
        }
        return false;
    }
    function getMarginOffset(below, above, lineHeight, aboveLineBreak) {
        let top = Infinity;
        if (below.nodeGroup && below.some(item => item.floating)) {
            below.renderEach(item => {
                if (!item.floating) {
                    const topA = item.linear.top;
                    if (topA < top) {
                        top = topA;
                        below = item;
                    }
                }
            });
        }
        if (top === Infinity) {
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
            if (
                !isBlockElement(node, false) ||
                (bottomChild && node.hasHeight && Math.floor(bottomChild.linear.bottom) < node.box.bottom)
            ) {
                bottomChild = undefined;
            }
        } else {
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
                        } else if (Math.ceil(item.linear.bottom) >= node.box.bottom) {
                            bottomFloatChild = item;
                        }
                    } else if (item.linear.bottom >= bottomChild.linear.bottom) {
                        bottomChild = item;
                        break;
                    }
                } else if (!bottomChild) {
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
        for (const value of [node.cssInitial('overflow'), node.cssInitial('overflowX'), node.cssInitial('overflowY')]) {
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
    const setMinHeight = (node, offset) =>
        node.css(
            'minHeight',
            formatPX$6(
                Math.max(
                    offset,
                    node.hasPX('minHeight', { percent: false }) ? node.parseHeight(node.css('minHeight')) : 0
                )
            )
        );
    const canResetChild = (node, children = true) =>
        ((!children && node.blockStatic) || (children && node.length > 0 && !node.floating)) &&
        !node.layoutElement &&
        !node.tableElement &&
        node.tagName !== 'FIELDSET';
    const validAboveChild = (node, children) =>
        !node.hasHeight && node.borderBottomWidth === 0 && node.paddingBottom === 0 && canResetChild(node, children);
    const validBelowChild = (node, children) =>
        !node.hasHeight && node.borderTopWidth === 0 && node.paddingTop === 0 && canResetChild(node, children);
    const validSibling = node => node.pageFlow && node.blockDimension && !node.floating && !node.excluded;
    class WhiteSpace extends ExtensionUI {
        afterBaseLayout(sessionId) {
            const { cache, excluded } = this.application.getProcessing(sessionId);
            const clearMap = this.application.session.clearMap;
            const processed = new Set();
            cache.each(node => {
                var _a, _b;
                if (node.naturalElement && !node.hasAlign(2 /* AUTO_LAYOUT */)) {
                    const children = node.naturalChildren;
                    const length = children.length;
                    if (length === 0) {
                        return;
                    }
                    const pageFlow = node.pageFlow;
                    const collapseMargin = pageFlow && isBlockElement(node, true) && !node.actualParent.layoutElement;
                    let firstChild, lastChild;
                    for (let i = 0; i < length; ++i) {
                        const current = children[i];
                        if (current.pageFlow) {
                            if (collapseMargin) {
                                if (!current.floating) {
                                    if (!firstChild) {
                                        firstChild = current;
                                    }
                                    lastChild = current;
                                } else if (lastChild) {
                                    if (current.linear.bottom >= lastChild.linear.bottom) {
                                        lastChild = current;
                                    }
                                } else {
                                    lastChild = current;
                                }
                            }
                            if (isBlockElement(current, true)) {
                                if (i > 0) {
                                    const previousSiblings = current.previousSiblings({ floating: false });
                                    const q = previousSiblings.length;
                                    if (q > 0) {
                                        let inheritedTop = false;
                                        const previous = previousSiblings[q - 1];
                                        if (isBlockElement(previous, false)) {
                                            let marginBottom = previous.marginBottom,
                                                marginTop = current.marginTop;
                                            if (previous.marginTop < 0 && previous.bounds.height === 0) {
                                                const offset = Math.min(marginBottom, previous.marginTop);
                                                if (offset < 0) {
                                                    if (Math.abs(offset) < marginTop) {
                                                        current.modifyBox(1 /* MARGIN_TOP */, offset);
                                                    } else {
                                                        resetBox(current, 1 /* MARGIN_TOP */);
                                                    }
                                                    processed.add(previous.id);
                                                    previous.hide({ collapse: true });
                                                    continue;
                                                }
                                            } else if (current.marginBottom < 0 && current.bounds.height === 0) {
                                                const offset = Math.min(marginTop, current.marginBottom);
                                                if (offset < 0) {
                                                    if (Math.abs(offset) < marginBottom) {
                                                        previous.modifyBox(4 /* MARGIN_BOTTOM */, offset);
                                                    } else {
                                                        resetBox(previous, 4 /* MARGIN_BOTTOM */);
                                                    }
                                                    processed.add(current.id);
                                                    current.hide({ collapse: true });
                                                    continue;
                                                }
                                            }
                                            let inheritedBottom = false,
                                                inherit = previous;
                                            while (validAboveChild(inherit, true)) {
                                                let bottomChild = getBottomChild(inherit);
                                                if (
                                                    (bottomChild === null || bottomChild === void 0
                                                        ? void 0
                                                        : bottomChild.getBox(4 /* MARGIN_BOTTOM */)[0]) === 0
                                                ) {
                                                    let childBottom = bottomChild.marginBottom,
                                                        currentChild = bottomChild;
                                                    while (
                                                        currentChild.bounds.height === 0 &&
                                                        !currentChild.pseudoElement
                                                    ) {
                                                        const currentTop = currentChild.marginTop;
                                                        childBottom = Math.max(
                                                            currentTop,
                                                            currentChild.marginBottom,
                                                            childBottom
                                                        );
                                                        if (currentTop !== 0) {
                                                            resetBox(currentChild, 1 /* MARGIN_TOP */);
                                                        }
                                                        const sibling = currentChild.previousSibling;
                                                        if (sibling) {
                                                            if (sibling.marginBottom >= childBottom) {
                                                                if (currentChild.marginBottom !== 0) {
                                                                    resetBox(currentChild, 4 /* MARGIN_BOTTOM */);
                                                                }
                                                                bottomChild = sibling;
                                                                childBottom = sibling.marginBottom;
                                                                currentChild = sibling;
                                                            } else if (sibling.bounds.height > 0) {
                                                                break;
                                                            } else {
                                                                if (sibling.marginBottom !== 0) {
                                                                    resetBox(sibling, 4 /* MARGIN_BOTTOM */);
                                                                }
                                                                currentChild = sibling;
                                                            }
                                                        } else {
                                                            break;
                                                        }
                                                    }
                                                    if (childBottom !== 0) {
                                                        resetBox(
                                                            bottomChild,
                                                            4 /* MARGIN_BOTTOM */,
                                                            previous.getBox(4 /* MARGIN_BOTTOM */)[0] === 0
                                                                ? previous
                                                                : undefined
                                                        );
                                                    }
                                                    if (childBottom > marginBottom) {
                                                        marginBottom = childBottom;
                                                        inheritedBottom = true;
                                                    } else if (childBottom === 0 && marginBottom === 0) {
                                                        inherit = bottomChild;
                                                        continue;
                                                    }
                                                }
                                                break;
                                            }
                                            inherit = current;
                                            while (validBelowChild(inherit, true)) {
                                                let topChild = inherit.firstStaticChild;
                                                if (
                                                    isBlockElement(topChild, true) &&
                                                    topChild.getBox(1 /* MARGIN_TOP */)[0] === 0
                                                ) {
                                                    let childTop = topChild.marginTop,
                                                        currentChild = topChild;
                                                    while (
                                                        currentChild.bounds.height === 0 &&
                                                        !currentChild.pseudoElement
                                                    ) {
                                                        const currentBottom = currentChild.marginBottom;
                                                        childTop = Math.max(
                                                            currentChild.marginTop,
                                                            currentBottom,
                                                            childTop
                                                        );
                                                        if (currentBottom !== 0) {
                                                            resetBox(currentChild, 4 /* MARGIN_BOTTOM */);
                                                        }
                                                        const sibling = currentChild.nextSibling;
                                                        if (sibling) {
                                                            if (sibling.marginTop >= childTop) {
                                                                if (currentChild.marginTop !== 0) {
                                                                    resetBox(currentChild, 1 /* MARGIN_TOP */);
                                                                }
                                                                topChild = sibling;
                                                                childTop = sibling.marginTop;
                                                                currentChild = sibling;
                                                            } else if (sibling.bounds.height > 0) {
                                                                break;
                                                            } else {
                                                                if (sibling.marginTop !== 0) {
                                                                    resetBox(sibling, 1 /* MARGIN_TOP */);
                                                                }
                                                                currentChild = sibling;
                                                            }
                                                        } else {
                                                            break;
                                                        }
                                                    }
                                                    if (childTop !== 0) {
                                                        resetBox(
                                                            topChild,
                                                            1 /* MARGIN_TOP */,
                                                            current.getBox(1 /* MARGIN_TOP */)[0] === 0
                                                                ? current
                                                                : undefined
                                                        );
                                                    }
                                                    if (childTop > marginTop) {
                                                        marginTop = childTop;
                                                        inheritedTop = true;
                                                    } else if (childTop === 0 && marginTop === 0) {
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
                                                            resetBox(current, 1 /* MARGIN_TOP */);
                                                            if (
                                                                current.bounds.height === 0 &&
                                                                marginBottom >= current.marginBottom
                                                            ) {
                                                                resetBox(current, 4 /* MARGIN_BOTTOM */);
                                                            }
                                                            inheritedTop = false;
                                                        }
                                                    } else if (!inheritedBottom || !isVerticalOverflow(previous)) {
                                                        resetBox(previous, 4 /* MARGIN_BOTTOM */);
                                                        if (
                                                            previous.bounds.height === 0 &&
                                                            marginTop >= previous.marginTop
                                                        ) {
                                                            resetBox(previous, 1 /* MARGIN_TOP */);
                                                        }
                                                        inheritedBottom = false;
                                                    }
                                                } else if (current.bounds.height === 0) {
                                                    marginTop = Math.min(marginTop, current.marginBottom);
                                                    if (marginTop < 0) {
                                                        previous.modifyBox(4 /* MARGIN_BOTTOM */, marginTop);
                                                        current.hide({ collapse: true });
                                                    }
                                                }
                                            }
                                            if (
                                                marginTop > 0 &&
                                                previous.floatContainer &&
                                                current.getBox(1 /* MARGIN_TOP */)[1] === 0 &&
                                                !isVerticalOverflow(previous)
                                            ) {
                                                let valid = false;
                                                if (previous.bounds.height === 0) {
                                                    valid = true;
                                                } else {
                                                    let float;
                                                    iterateReverseArray(previous.naturalElements, item => {
                                                        if (clearMap.has(item)) {
                                                            return true;
                                                        } else if (item.floating) {
                                                            if (
                                                                item.linear.bottom > Math.ceil(previous.bounds.bottom)
                                                            ) {
                                                                float = item.float;
                                                            }
                                                            return true;
                                                        }
                                                        return;
                                                    });
                                                    if (float) {
                                                        const clear =
                                                            (_a = getElementCache$4(
                                                                previous.element,
                                                                'styleMap::after',
                                                                previous.sessionId
                                                            )) === null || _a === void 0
                                                                ? void 0
                                                                : _a.clear;
                                                        valid = !(clear === 'both' || clear === float);
                                                    }
                                                }
                                                if (valid) {
                                                    current.modifyBox(
                                                        1 /* MARGIN_TOP */,
                                                        previous.box.top -
                                                            maxArray$3(
                                                                previous.naturalElements.map(item => item.linear.bottom)
                                                            ),
                                                        false
                                                    );
                                                }
                                            }
                                            if (inheritedTop) {
                                                let adjacentBottom = 0;
                                                if (previous.bounds.height === 0) {
                                                    const previousSibling = previous.previousSibling;
                                                    adjacentBottom =
                                                        previousSibling && isBlockElement(previousSibling, false)
                                                            ? Math.max(
                                                                  previousSibling.getBox(4 /* MARGIN_BOTTOM */)[1],
                                                                  previousSibling.marginBottom
                                                              )
                                                            : 0;
                                                }
                                                if (marginTop > adjacentBottom) {
                                                    (current.registerBox(1 /* MARGIN_TOP */) || current).setCacheValue(
                                                        'marginTop',
                                                        marginTop
                                                    );
                                                }
                                            }
                                            if (inheritedBottom) {
                                                let adjacentTop = 0;
                                                if (current.bounds.height === 0) {
                                                    const nextSibling = current.nextSibling;
                                                    adjacentTop =
                                                        nextSibling && isBlockElement(nextSibling, true)
                                                            ? Math.max(
                                                                  nextSibling.getBox(1 /* MARGIN_TOP */)[1],
                                                                  nextSibling.marginTop
                                                              )
                                                            : 0;
                                                }
                                                if (marginBottom >= adjacentTop) {
                                                    (
                                                        previous.registerBox(4 /* MARGIN_BOTTOM */) || previous
                                                    ).setCacheValue('marginBottom', marginBottom);
                                                }
                                            }
                                        } else if (current.bounds.height === 0) {
                                            const { marginTop, marginBottom } = current;
                                            if (marginTop > 0 && marginBottom > 0) {
                                                if (marginTop < marginBottom) {
                                                    resetBox(current, 1 /* MARGIN_TOP */);
                                                } else if (i === length - 1) {
                                                    current.setCacheValue('marginBottom', marginTop);
                                                    resetBox(current, 1 /* MARGIN_TOP */);
                                                } else {
                                                    resetBox(current, 4 /* MARGIN_BOTTOM */);
                                                }
                                            }
                                        }
                                        if (
                                            !inheritedTop &&
                                            current !== firstChild &&
                                            previousSiblings.length > 1 &&
                                            (node.layoutVertical ||
                                                ((_b = current.renderParent) === null || _b === void 0
                                                    ? void 0
                                                    : _b.layoutVertical))
                                        ) {
                                            const previousSibling = previousSiblings.pop();
                                            if (
                                                previousSibling.floating &&
                                                Math.floor(previousSibling.bounds.top) ===
                                                    Math.floor(current.bounds.top)
                                            ) {
                                                current.modifyBox(
                                                    1 /* MARGIN_TOP */,
                                                    -previousSibling.bounds.height,
                                                    false
                                                );
                                            }
                                        }
                                    }
                                } else if (current.bounds.height === 0) {
                                    const { marginTop, marginBottom } = current;
                                    if (marginTop > 0 && marginBottom > 0) {
                                        if (marginTop < marginBottom) {
                                            current.setCacheValue('marginTop', marginBottom);
                                        }
                                        resetBox(current, 4 /* MARGIN_BOTTOM */);
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
                                    node.modifyBox(64 /* PADDING_BOTTOM */, offset, false);
                                }
                            }
                        }
                    }
                }
            });
            excluded.each(node => {
                var _a, _b;
                if (node.lineBreak && !node.lineBreakTrailing && !clearMap.has(node) && !processed.has(node.id)) {
                    let valid = false;
                    const previousSiblings = node.previousSiblings({ floating: false });
                    const q = previousSiblings.length;
                    if (q > 0) {
                        const actualParent = node.actualParent;
                        const nextSiblings = node.siblingsTrailing;
                        const r = nextSiblings.length;
                        if (r > 0) {
                            let above = previousSiblings[q - 1],
                                below = nextSiblings[r - 1],
                                lineHeight = 0,
                                aboveLineBreak,
                                offset;
                            if (above.rendered && below.rendered) {
                                const inline = above.inlineStatic && below.inlineStatic;
                                if (inline && previousSiblings.length === 0) {
                                    processed.add(node.id);
                                    return;
                                }
                                if (inline) {
                                    aboveLineBreak = previousSiblings[0];
                                    if (previousSiblings.length === 1) {
                                        aboveLineBreak = aboveLineBreak.lineBreak ? node : undefined;
                                    }
                                    aboveLineBreak === null || aboveLineBreak === void 0
                                        ? void 0
                                        : aboveLineBreak.setBounds(false);
                                }
                                let aboveParent = above.renderParent,
                                    belowParent = below.renderParent;
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
                                if (!above.multiline) {
                                    let value;
                                    if (above.has('lineHeight')) {
                                        value = above.lineHeight;
                                    } else if (above.length > 0) {
                                        if (above.layoutVertical) {
                                            value =
                                                (_a = above.lastStaticChild) === null || _a === void 0
                                                    ? void 0
                                                    : _a.lineHeight;
                                        } else {
                                            value = maxArray$3(above.map(item => item.lineHeight));
                                        }
                                    }
                                    if (value) {
                                        const aboveOffset = Math.floor((value - above.bounds.height) / 2);
                                        if (aboveOffset > 0) {
                                            lineHeight += aboveOffset;
                                        }
                                    }
                                }
                                if (!below.multiline) {
                                    let value;
                                    if (below.has('lineHeight')) {
                                        value = below.lineHeight;
                                    } else if (below.length > 0) {
                                        if (below.layoutVertical) {
                                            value =
                                                (_b = below.firstStaticChild) === null || _b === void 0
                                                    ? void 0
                                                    : _b.lineHeight;
                                        } else {
                                            value = maxArray$3(below.map(item => item.lineHeight));
                                        }
                                    }
                                    if (value) {
                                        const belowOffset = Math.round((value - below.bounds.height) / 2);
                                        if (belowOffset > 0) {
                                            lineHeight += belowOffset;
                                        }
                                    }
                                }
                                [offset, below] = getMarginOffset(below, above, lineHeight, aboveLineBreak);
                                if (offset >= 1) {
                                    if (below.visible) {
                                        below.modifyBox(1 /* MARGIN_TOP */, offset);
                                        valid = true;
                                    } else if (above.visible) {
                                        above.modifyBox(4 /* MARGIN_BOTTOM */, offset);
                                        valid = true;
                                    }
                                }
                            } else {
                                [offset, below] = getMarginOffset(below, above, lineHeight);
                                if (offset >= 1) {
                                    if ((below.lineBreak || below.excluded) && actualParent.lastChild === below) {
                                        actualParent.modifyBox(64 /* PADDING_BOTTOM */, offset);
                                        valid = true;
                                    } else if (
                                        (above.lineBreak || above.excluded) &&
                                        actualParent.firstChild === above
                                    ) {
                                        actualParent.modifyBox(16 /* PADDING_TOP */, offset);
                                        valid = true;
                                    }
                                }
                            }
                        } else if (
                            actualParent.visible &&
                            !actualParent.preserveWhiteSpace &&
                            actualParent.tagName !== 'CODE' &&
                            !actualParent.documentRoot &&
                            !actualParent.documentBody
                        ) {
                            const previousStart = previousSiblings[previousSiblings.length - 1];
                            const rect =
                                previousStart.bounds.height === 0 && previousStart.length > 0
                                    ? NodeUI.outerRegion(previousStart)
                                    : previousStart.linear;
                            const offset =
                                actualParent.box.bottom -
                                (previousStart.lineBreak || previousStart.excluded ? rect.top : rect.bottom);
                            if (offset !== 0) {
                                if (previousStart.rendered || actualParent.visibleStyle.background) {
                                    actualParent.modifyBox(64 /* PADDING_BOTTOM */, offset);
                                } else if (!actualParent.hasHeight) {
                                    setMinHeight(actualParent, offset);
                                }
                            }
                        }
                        if (valid) {
                            let i = 0;
                            while (i < q) {
                                processed.add(previousSiblings[i++].id);
                            }
                            i = 0;
                            while (i < r) {
                                processed.add(nextSiblings[i++].id);
                            }
                        }
                    }
                }
            });
        }
        afterConstraints(sessionId) {
            this.application.getProcessingCache(sessionId).each(node => {
                if (
                    node.naturalChild &&
                    node.styleElement &&
                    node.inlineVertical &&
                    node.pageFlow &&
                    !node.positioned &&
                    !node.actualParent.layoutElement
                ) {
                    const outerWrapper = node.outerMostWrapper;
                    const renderParent = outerWrapper.renderParent;
                    if (
                        (renderParent === null || renderParent === void 0
                            ? void 0
                            : renderParent.hasAlign(2 /* AUTO_LAYOUT */)) === false
                    ) {
                        if (node.blockDimension && !node.floating) {
                            if (renderParent.layoutVertical) {
                                const children = renderParent.renderChildren;
                                const index = children.findIndex(item => item === outerWrapper);
                                if (index !== -1) {
                                    if (!node.lineBreakLeading && !node.baselineAltered) {
                                        const previous = children[index - 1];
                                        if (previous === null || previous === void 0 ? void 0 : previous.pageFlow) {
                                            setSpacingOffset(
                                                outerWrapper,
                                                1 /* MARGIN_TOP */,
                                                previous.actualRect('bottom'),
                                                previous.getBox(4 /* MARGIN_BOTTOM */)[1]
                                            );
                                        }
                                    }
                                    if (!node.lineBreakTrailing) {
                                        const next = children[index + 1];
                                        if (
                                            (next === null || next === void 0 ? void 0 : next.pageFlow) &&
                                            next.styleElement &&
                                            !next.inlineVertical
                                        ) {
                                            setSpacingOffset(
                                                outerWrapper,
                                                4 /* MARGIN_BOTTOM */,
                                                next.actualRect('top'),
                                                next.getBox(1 /* MARGIN_TOP */)[1]
                                            );
                                        }
                                    }
                                }
                            } else if (!node.baselineAltered) {
                                const horizontalRows = renderParent.horizontalRows;
                                let horizontal;
                                if (horizontalRows && horizontalRows.length > 1) {
                                    found: {
                                        let maxBottom = -Infinity;
                                        const length = horizontalRows.length;
                                        let j;
                                        for (let i = 0; i < length; ++i) {
                                            const row = horizontalRows[i];
                                            const q = row.length;
                                            j = 0;
                                            while (j < q) {
                                                if (outerWrapper === row[j++]) {
                                                    if (i > 0) {
                                                        setSpacingOffset(outerWrapper, 1 /* MARGIN_TOP */, maxBottom);
                                                    } else {
                                                        horizontal = row;
                                                    }
                                                    break found;
                                                }
                                            }
                                            let k = 0;
                                            while (k < row.length) {
                                                const innerWrapped = row[k++].innerMostWrapped;
                                                if (validSibling(innerWrapped)) {
                                                    maxBottom = Math.max(innerWrapped.actualRect('bottom'), maxBottom);
                                                }
                                            }
                                            if (maxBottom === -Infinity) {
                                                break;
                                            }
                                        }
                                    }
                                } else if (renderParent.layoutHorizontal || renderParent.hasAlign(512 /* INLINE */)) {
                                    horizontal = renderParent.renderChildren;
                                }
                                if (horizontal) {
                                    let children = [],
                                        maxBottom = -Infinity,
                                        length = horizontal.length;
                                    let i = 0;
                                    while (i < length) {
                                        const item = horizontal[i++];
                                        if (item.nodeGroup) {
                                            children = children.concat(item.cascade(child => child.naturalChild));
                                        } else if (item.innerWrapped) {
                                            children.push(item.innerMostWrapped);
                                        } else {
                                            children.push(item);
                                        }
                                    }
                                    const naturalChildren = node.actualParent.naturalChildren;
                                    length = naturalChildren.length;
                                    i = 0;
                                    while (i < length) {
                                        const item = naturalChildren[i++];
                                        if (children.includes(item)) {
                                            break;
                                        } else if (item.lineBreak || item.block) {
                                            maxBottom = -Infinity;
                                        } else if (validSibling(item)) {
                                            maxBottom = Math.max(item.actualRect('bottom'), maxBottom);
                                        }
                                    }
                                    if (maxBottom !== -Infinity && node.actualRect('top') > maxBottom) {
                                        setSpacingOffset(outerWrapper, 1 /* MARGIN_TOP */, maxBottom);
                                    }
                                }
                            }
                        }
                        if (
                            !renderParent.layoutVertical &&
                            !outerWrapper.alignParent('left') &&
                            !NodeUI.justified(node)
                        ) {
                            const documentId = outerWrapper.alignSibling('leftRight');
                            if (documentId !== '') {
                                const previousSibling = renderParent.renderChildren.find(
                                    item => item.documentId === documentId
                                );
                                if (
                                    (previousSibling === null || previousSibling === void 0
                                        ? void 0
                                        : previousSibling.inlineVertical) &&
                                    previousSibling.bounds.width > 0
                                ) {
                                    setSpacingOffset(
                                        outerWrapper,
                                        8 /* MARGIN_LEFT */,
                                        previousSibling.actualRect('right')
                                    );
                                }
                            } else {
                                let current = node;
                                while (true) {
                                    const siblingsLeading = current.siblingsLeading;
                                    if (
                                        siblingsLeading.length > 0 &&
                                        !siblingsLeading.some(
                                            item => item.lineBreak || (item.excluded && item.blockStatic)
                                        )
                                    ) {
                                        const previousSibling = siblingsLeading[0];
                                        if (previousSibling.inlineVertical) {
                                            setSpacingOffset(
                                                outerWrapper,
                                                8 /* MARGIN_LEFT */,
                                                previousSibling.actualRect('right')
                                            );
                                        } else if (previousSibling.floating) {
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
                    const children = node.naturalChildren;
                    const length = children.length;
                    let i = 0;
                    while (i < length) {
                        const item = children[i++];
                        if (!item.pageFlow) {
                            continue;
                        }
                        if (!item.floating) {
                            const q = floating.length;
                            if (q > 0) {
                                const outerWrapper = item.outerMostWrapper;
                                let renderParent = outerWrapper.renderParent;
                                if (renderParent) {
                                    const [reset, adjustment] = item.getBox(1 /* MARGIN_TOP */);
                                    const marginTop = (reset === 0 ? item.marginTop : 0) + adjustment;
                                    if (marginTop > 0) {
                                        const top = Math.floor(node.bounds.top);
                                        let j = 0;
                                        while (j < q) {
                                            const previous = floating[j++];
                                            if (top <= Math.floor(previous.bounds.top)) {
                                                let floatingRenderParent = previous.outerMostWrapper.renderParent;
                                                if (floatingRenderParent) {
                                                    renderParent =
                                                        renderParent
                                                            .ascend({
                                                                error: parent => parent.naturalChild,
                                                                attr: 'renderParent',
                                                            })
                                                            .pop() || renderParent;
                                                    floatingRenderParent =
                                                        floatingRenderParent
                                                            .ascend({
                                                                error: parent => parent.naturalChild,
                                                                attr: 'renderParent',
                                                            })
                                                            .pop() || floatingRenderParent;
                                                    if (renderParent !== floatingRenderParent) {
                                                        outerWrapper.modifyBox(
                                                            1 /* MARGIN_TOP */,
                                                            (floatingRenderParent !== node
                                                                ? floatingRenderParent
                                                                : previous
                                                            ).linear.height * -1,
                                                            false
                                                        );
                                                    }
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                                floating.length = 0;
                            }
                        } else {
                            floating.push(item);
                        }
                    }
                }
            });
        }
    }

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
        WHITESPACE: 'squared.whitespace',
    };

    var constant = /*#__PURE__*/ Object.freeze({
        __proto__: null,
        EXT_NAME: EXT_NAME,
    });

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
        WhiteSpace,
    };
    const lib = {
        constant,
        enumeration,
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
});
