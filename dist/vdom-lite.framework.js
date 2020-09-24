/* vdom-lite-framework 2.0.1
   https://github.com/anpham6/squared */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined'
        ? (module.exports = factory())
        : typeof define === 'function' && define.amd
        ? define(factory)
        : ((global = typeof globalThis !== 'undefined' ? globalThis : global || self), (global.vdom = factory()));
})(this, function () {
    'use strict';

    class NodeList extends squared.lib.base.Container {
        constructor(children, sessionId = '') {
            super(children);
            this.sessionId = sessionId;
        }
        add(node, delegate, cascade, remove) {
            super.add(node);
            if (delegate && this.afterAdd) {
                this.afterAdd.call(this, node, cascade, remove);
            }
            return this;
        }
        sort(predicate) {
            this.children.sort(predicate);
            return this;
        }
    }

    const { CSS_CANNOT_BE_PARSED, DOCUMENT_ROOT_NOT_FOUND, OPERATION_NOT_SUPPORTED, reject } = squared.lib.error;
    const { FILE, STRING } = squared.lib.regex;
    const {
        CSS_PROPERTIES,
        checkMediaRule,
        getSpecificity,
        insertStyleSheetRule,
        getPropertiesAsTraits,
        parseKeyframes,
        parseSelectorText,
    } = squared.lib.css;
    const { isUserAgent } = squared.lib.client;
    const { getElementCache, newSessionInit, resetSessionAll, setElementCache } = squared.lib.session;
    const {
        capitalize,
        convertCamelCase,
        isEmptyString,
        parseMimeType,
        resolvePath,
        splitPair,
        splitPairStart,
        trimBoth,
    } = squared.lib.util;
    const REGEXP_IMPORTANT = /\s*([a-z-]+):[^!;]+!important;/g;
    const REGEXP_FONTFACE = /\s*@font-face\s*{([^}]+)}\s*/;
    const REGEXP_FONTSRC = /\s*src:\s*([^;]+);/;
    const REGEXP_FONTFAMILY = /\s*font-family:\s*([^;]+);/;
    const REGEXP_FONTSTYLE = /\s*font-style:\s*(\w+)\s*;/;
    const REGEXP_FONTWEIGHT = /\s*font-weight:\s*(\d+)\s*;/;
    const REGEXP_FONTURL = /\s*(url|local)\((?:"((?:[^"]|\\")+)"|([^)]+))\)(?:\s*format\("?([\w-]+)"?\))?\s*/;
    const REGEXP_DATAURI = new RegExp(`url\\("?(${STRING.DATAURI})"?\\),?\\s*`, 'g');
    const CSS_SHORTHANDNONE = getPropertiesAsTraits(2 /* SHORTHAND */ | 64 /* NONE */);
    class Application {
        constructor(
            framework,
            nodeConstructor,
            ControllerConstructor,
            ExtensionManagerConstructor,
            ResourceConstructor
        ) {
            this.framework = framework;
            this.extensions = [];
            this.closed = false;
            this.elementMap = new WeakMap();
            this.session = {
                active: new Map(),
            };
            this._nextId = 0;
            this._resourceHandler = null;
            this._extensionManager = null;
            const controller = new ControllerConstructor(this);
            this._controllerHandler = controller;
            if (ExtensionManagerConstructor) {
                this._extensionManager = new ExtensionManagerConstructor(this);
            }
            if (ResourceConstructor) {
                this._resourceHandler = new ResourceConstructor(this);
            }
            this._afterInsertNode = controller.afterInsertNode.bind(controller);
            this._includeElement = controller.includeElement.bind(controller);
            this._preventNodeCascade = controller.preventNodeCascade.bind(controller);
            this.Node = nodeConstructor;
            this.init();
        }
        static prioritizeExtensions(value, extensions) {
            const included = value.trim().split(/\s*,\s*/);
            const result = [];
            const untagged = [];
            for (let i = 0, length = extensions.length; i < length; ++i) {
                const ext = extensions[i];
                const index = included.indexOf(ext.name);
                if (index !== -1) {
                    result[index] = ext;
                } else {
                    untagged.push(ext);
                }
            }
            return result.length ? result.filter(item => item).concat(untagged) : extensions;
        }
        finalize() {
            return true;
        }
        afterCreateCache(node) {
            if (this.userSettings.createElementMap) {
                const elementMap = this.elementMap;
                this.getProcessingCache(node.sessionId).each(item => elementMap.set(item.element, item));
            }
        }
        createNode(sessionId, options) {
            const node = new this.Node(this.nextId, sessionId, options.element);
            this._afterInsertNode(node);
            const afterInsertNode = this.getProcessing(sessionId).afterInsertNode;
            if (afterInsertNode) {
                afterInsertNode.some(item => item.afterInsertNode(node));
            }
            return node;
        }
        copyTo(directory, options) {
            var _a;
            return (
                ((_a = this.fileHandler) === null || _a === void 0 ? void 0 : _a.copyTo(directory, options)) ||
                reject(OPERATION_NOT_SUPPORTED)
            );
        }
        appendTo(pathname, options) {
            var _a;
            return (
                ((_a = this.fileHandler) === null || _a === void 0 ? void 0 : _a.appendTo(pathname, options)) ||
                reject(OPERATION_NOT_SUPPORTED)
            );
        }
        saveAs(filename, options) {
            var _a;
            return (
                ((_a = this.fileHandler) === null || _a === void 0
                    ? void 0
                    : _a.saveAs(filename || this._resourceHandler.userSettings.outputArchiveName, options)) ||
                reject(OPERATION_NOT_SUPPORTED)
            );
        }
        saveFiles(format, options) {
            var _a;
            return (
                ((_a = this.fileHandler) === null || _a === void 0 ? void 0 : _a.saveFiles(format, options)) ||
                reject(OPERATION_NOT_SUPPORTED)
            );
        }
        appendFiles(filename, options) {
            var _a;
            return (
                ((_a = this.fileHandler) === null || _a === void 0 ? void 0 : _a.appendFiles(filename, options)) ||
                reject(OPERATION_NOT_SUPPORTED)
            );
        }
        copyFiles(directory, options) {
            var _a;
            return (
                ((_a = this.fileHandler) === null || _a === void 0 ? void 0 : _a.copyFiles(directory, options)) ||
                reject(OPERATION_NOT_SUPPORTED)
            );
        }
        reset() {
            this._nextId = 0;
            this.elementMap = new WeakMap();
            resetSessionAll();
            this.session.active.clear();
            this._controllerHandler.reset();
            if (this._resourceHandler) {
                this._resourceHandler.reset();
            }
            for (const ext of this.extensions) {
                ext.reset();
            }
            this.closed = false;
        }
        parseDocument(...elements) {
            const [processing, rootElements] = this.createSessionThread(elements);
            if (rootElements.size === 0) {
                return reject(DOCUMENT_ROOT_NOT_FOUND);
            }
            const resource = this._resourceHandler;
            const documentRoot = rootElements.values().next().value;
            const preloadItems = [];
            let preloaded, preloadImages, preloadFonts;
            if (resource) {
                ({ preloadImages, preloadFonts } = resource.userSettings);
            }
            const parseSrcSet = value => {
                if (value !== '') {
                    for (const uri of value.split(',')) {
                        resource.addImageData(resolvePath(splitPairStart(uri.trim(), ' ')));
                    }
                }
            };
            if (resource) {
                for (const element of rootElements) {
                    element.querySelectorAll('picture > source').forEach(source => parseSrcSet(source.srcset));
                    element.querySelectorAll('video').forEach(source => resource.addImageData(source.poster));
                    element
                        .querySelectorAll('input[type=image]')
                        .forEach(image => resource.addImageData(image.src, image.width, image.height));
                    element.querySelectorAll('object, embed').forEach(source => {
                        const src = source.data || source.src;
                        if (src && (source.type.startsWith('image/') || parseMimeType(src).startsWith('image/'))) {
                            resource.addImageData(src.trim());
                        }
                    });
                    element.querySelectorAll('svg use').forEach(use => {
                        const href = use.href.baseVal || use.getAttributeNS('xlink', 'href');
                        if (href && href.indexOf('#') > 0) {
                            const src = resolvePath(splitPairStart(href, '#'));
                            if (FILE.SVG.test(src)) {
                                resource.addImageData(src);
                            }
                        }
                    });
                }
            }
            if (preloadImages) {
                preloaded = [];
                const { image, rawData } = resource.mapOfAssets;
                for (const item of image.values()) {
                    const uri = item.uri;
                    if (FILE.SVG.test(uri)) {
                        preloadItems.push(uri);
                    } else if (item.width === 0 || item.height === 0) {
                        const element = document.createElement('img');
                        element.src = uri;
                        if (element.naturalWidth && element.naturalHeight) {
                            item.width = element.naturalWidth;
                            item.height = element.naturalHeight;
                        } else {
                            documentRoot.appendChild(element);
                            preloaded.push(element);
                        }
                    }
                }
                for (const data of rawData) {
                    const item = data[1];
                    const mimeType = item.mimeType;
                    if (mimeType && mimeType.startsWith('image/') && !mimeType.endsWith('svg+xml')) {
                        let src = `data:${mimeType};`;
                        if (item.base64) {
                            src += 'base64,' + item.base64;
                        } else if (item.content) {
                            src += item.content;
                        } else {
                            continue;
                        }
                        const element = document.createElement('img');
                        element.src = src;
                        const { naturalWidth: width, naturalHeight: height } = element;
                        if (width && height) {
                            item.width = width;
                            item.height = height;
                            image.set(data[0], { width, height, uri: item.filename });
                        } else {
                            document.body.appendChild(element);
                            preloaded.push(element);
                        }
                    }
                }
            }
            if (preloadFonts) {
                for (const item of resource.mapOfAssets.fonts.values()) {
                    for (const font of item) {
                        const srcUrl = font.srcUrl;
                        if (srcUrl && !preloadItems.includes(srcUrl)) {
                            preloadItems.push(srcUrl);
                        }
                    }
                }
            }
            if (resource) {
                for (const element of rootElements) {
                    element.querySelectorAll('img').forEach(image => {
                        parseSrcSet(image.srcset);
                        if (!preloadImages) {
                            resource.addImage(image);
                        } else if (FILE.SVG.test(image.src)) {
                            preloadItems.push(image.src);
                        } else if (image.complete) {
                            resource.addImage(image);
                        } else {
                            preloadItems.push(image);
                        }
                    });
                }
            }
            if (preloadItems.length) {
                processing.initializing = true;
                return Promise.all(
                    preloadItems.map(item => {
                        return new Promise((success, error) => {
                            if (typeof item === 'string') {
                                if (FILE.SVG.test(item)) {
                                    fetch(item).then(async result => success(await result.text()));
                                } else {
                                    fetch(item).then(async result => success(await result.arrayBuffer()));
                                }
                            } else {
                                item.addEventListener('load', () => success(item));
                                item.addEventListener('error', () => error(item));
                            }
                        });
                    })
                )
                    .then(result => {
                        for (let i = 0, length = result.length; i < length; ++i) {
                            const value = result[i];
                            const uri = preloadItems[i];
                            if (typeof uri === 'string') {
                                if (typeof value === 'string') {
                                    if (FILE.SVG.test(uri)) {
                                        resource.addRawData(uri, 'image/svg+xml', value, { encoding: 'utf8' });
                                    }
                                }
                            } else {
                                resource.addImage(value);
                            }
                        }
                        return this.resumeSessionThread(
                            processing,
                            rootElements,
                            elements.length,
                            documentRoot,
                            preloaded
                        );
                    })
                    .catch(error => {
                        let message;
                        if (error instanceof Error) {
                            message = error.message;
                        } else {
                            if (error instanceof Event) {
                                error = error.target;
                            }
                            if (error instanceof HTMLImageElement) {
                                message = error.src;
                            }
                        }
                        return !message || !this.userSettings.showErrorMessages || confirm(`FAIL: ${message}`)
                            ? this.resumeSessionThread(
                                  processing,
                                  rootElements,
                                  elements.length,
                                  documentRoot,
                                  preloaded
                              )
                            : Promise.reject(new Error(message));
                    });
            }
            return Promise.resolve(this.resumeSessionThread(processing, rootElements, elements.length));
        }
        parseDocumentSync(...elements) {
            const sessionData = this.createSessionThread(elements);
            return this.resumeSessionThread(sessionData[0], sessionData[1], elements.length);
        }
        createCache(documentRoot, sessionId) {
            const node = this.createRootNode(documentRoot, sessionId);
            if (node) {
                this.controllerHandler.sortInitialCache(this.getProcessingCache(sessionId));
            }
            return node;
        }
        setStyleMap(sessionId, processing) {
            const styleSheets = document.styleSheets;
            for (let i = 0, length = styleSheets.length; i < length; ++i) {
                const styleSheet = styleSheets[i];
                let mediaText;
                try {
                    mediaText = styleSheet.media.mediaText;
                } catch (_a) {}
                if (!mediaText || checkMediaRule(mediaText)) {
                    this.applyStyleSheet(styleSheet, sessionId, processing);
                }
            }
        }
        setExtensions(namespaces = this.userSettings.builtInExtensions) {
            const { builtInExtensions, extensions } = this;
            extensions.length = 0;
            for (let i = 0, length = namespaces.length; i < length; ++i) {
                let ext = builtInExtensions.get(namespaces[i]);
                if (ext) {
                    ext.application = this;
                    extensions.push(ext);
                } else {
                    const namespace = namespaces[i] + '.';
                    for (const data of builtInExtensions) {
                        if (data[0].startsWith(namespace)) {
                            ext = data[1];
                            if (!extensions.includes(ext)) {
                                ext.application = this;
                                extensions.push(ext);
                            }
                        }
                    }
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
        createRootNode(rootElement, sessionId) {
            const processing = this.getProcessing(sessionId);
            const extensions = processing.extensions.filter(item => !!item.beforeInsertNode);
            const node = this.cascadeParentNode(
                processing.cache,
                processing.excluded,
                rootElement,
                sessionId,
                0,
                processing.rootElements,
                extensions.length ? extensions : null
            );
            if (node) {
                node.documentRoot = true;
                processing.node = node;
                if (rootElement === document.documentElement) {
                    processing.documentElement = node;
                } else {
                    let previousNode = node,
                        currentElement = rootElement.parentElement,
                        id = 0,
                        depth = -1;
                    while (currentElement) {
                        const previousElement = previousNode.element;
                        const children = currentElement.children;
                        const length = children.length;
                        const elements = new Array(length);
                        const parent = new this.Node(id--, sessionId, currentElement, [previousNode]);
                        this._afterInsertNode(parent);
                        let j = 0;
                        for (let i = 0; i < length; ++i) {
                            const element = children[i];
                            let child;
                            if (element === previousElement) {
                                child = previousNode;
                            } else {
                                child = new this.Node(id--, sessionId, element);
                                this._afterInsertNode(child);
                            }
                            if (child) {
                                child.init(parent, depth + 1, j);
                                child.actualParent = parent;
                                elements[j++] = child;
                            }
                        }
                        elements.length = j;
                        parent.naturalChildren = elements;
                        parent.naturalElements = elements;
                        if (currentElement === document.documentElement) {
                            processing.documentElement = parent;
                            break;
                        } else {
                            currentElement = currentElement.parentElement;
                            previousNode = parent;
                            --depth;
                        }
                    }
                }
            }
            return node;
        }
        cascadeParentNode(cache, excluded, parentElement, sessionId, depth, rootElements, extensions) {
            const node = this.insertNode(parentElement, sessionId);
            if (node) {
                if (depth === 0) {
                    cache.add(node);
                }
                if (this._preventNodeCascade(node)) {
                    return node;
                }
                const childDepth = depth + 1;
                const childNodes = parentElement.childNodes;
                const length = childNodes.length;
                const children = new Array(length);
                const elements = new Array(parentElement.childElementCount);
                let inlineText = true,
                    plainText = false,
                    j = 0,
                    k = 0;
                for (let i = 0; i < length; ++i) {
                    const element = childNodes[i];
                    let child;
                    if (element.nodeName[0] === '#') {
                        if (this.visibleText(node, element)) {
                            child = this.insertNode(element, sessionId);
                            if (child) {
                                child.cssApply(node.textStyle);
                            }
                            plainText = true;
                        }
                    } else if (this._includeElement(element)) {
                        if (extensions) {
                            const use = this.getDatasetName('use', element);
                            (use ? Application.prioritizeExtensions(use, extensions) : extensions).some(item =>
                                item.beforeInsertNode(element, sessionId)
                            );
                        }
                        child =
                            element.childNodes.length === 0
                                ? this.insertNode(element, sessionId)
                                : this.cascadeParentNode(
                                      cache,
                                      excluded,
                                      element,
                                      sessionId,
                                      childDepth,
                                      rootElements,
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
                        }
                    }
                    if (child) {
                        child.init(node, childDepth, j);
                        child.actualParent = node;
                        children[j++] = child;
                    }
                }
                children.length = j;
                elements.length = k;
                node.naturalChildren = children;
                node.naturalElements = elements;
                if (j > 0) {
                    node.inlineText = inlineText && plainText;
                    node.retainAs(children);
                    if (j > 1) {
                        cache.addAll(children);
                    } else {
                        cache.add(children[0]);
                    }
                }
                if (k > 0 && this.userSettings.createQuerySelectorMap) {
                    node.queryMap = this.createQueryMap(elements, k);
                }
            }
            return node;
        }
        visibleText(node, element) {
            return (
                element.nodeName === '#text' &&
                (!isEmptyString(element.textContent) ||
                    (node.preserveWhiteSpace && (node.tagName !== 'PRE' || node.element.childElementCount === 0)))
            );
        }
        createQueryMap(elements, length) {
            var _a;
            const result = [elements];
            for (let i = 0; i < length; ++i) {
                const childMap = elements[i].queryMap;
                if (childMap) {
                    for (let j = 0, k = 1, q = childMap.length; j < q; ++j) {
                        result[k] =
                            ((_a = result[k++]) === null || _a === void 0 ? void 0 : _a.concat(childMap[j])) ||
                            childMap[j];
                    }
                }
            }
            return result;
        }
        applyStyleRule(item, sessionId) {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const resource = this._resourceHandler;
            const styleSheetHref =
                ((_a = item.parentStyleSheet) === null || _a === void 0 ? void 0 : _a.href) || location.href;
            const cssText = item.cssText;
            switch (item.type) {
                case CSSRule.STYLE_RULE: {
                    const unusedStyles = this.session.unusedStyles;
                    const baseMap = {};
                    const important = {};
                    const cssStyle = item.style;
                    const parseImageUrl = attr => {
                        const value = baseMap[attr];
                        if (value && value !== 'initial') {
                            let result, match;
                            while ((match = REGEXP_DATAURI.exec(value))) {
                                if (match[2]) {
                                    if (resource) {
                                        const [mimeType, encoding] = match[2].trim().split(/\s*;\s*/);
                                        resource.addRawData(match[1], mimeType, match[3], { encoding });
                                    }
                                } else {
                                    const uri = resolvePath(match[3], styleSheetHref);
                                    if (uri !== '') {
                                        if (resource) {
                                            resource.addImageData(uri);
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
                    };
                    const hasExactValue = (attr, value) =>
                        new RegExp(`\\b${attr}[\\s\\n]*:[\\s\\n]*(?:${value})[\\s\\n]*;?`).test(cssText);
                    const hasPartialValue = (attr, value) =>
                        new RegExp(`\\b${attr}[\\s\\n]*:[^;]*?${value}[^;]*;?`).test(cssText);
                    const items = Array.from(cssStyle);
                    for (let i = 0, length = items.length; i < length; ++i) {
                        const attr = items[i];
                        if (attr[0] === '-') {
                            continue;
                        }
                        const baseAttr = convertCamelCase(attr);
                        let value = cssStyle[attr];
                        switch (value) {
                            case 'initial': {
                                if (isUserAgent(2 /* SAFARI */) && baseAttr.startsWith('background')) {
                                    break;
                                }
                                const property = CSS_PROPERTIES[baseAttr];
                                if (property && property.value === 'auto') {
                                    value = 'auto';
                                    break;
                                }
                            }
                            case 'normal':
                                valid: {
                                    if (!hasExactValue(attr, value)) {
                                        for (const name in CSS_SHORTHANDNONE) {
                                            const css = CSS_SHORTHANDNONE[name];
                                            if (css.value.includes(baseAttr)) {
                                                const cssName = css.name;
                                                if (
                                                    hasExactValue(cssName, 'none|initial') ||
                                                    (value === 'initial' && hasPartialValue(cssName, 'initial')) ||
                                                    (css.valueOfNone && hasExactValue(cssName, css.valueOfNone))
                                                ) {
                                                    break valid;
                                                }
                                                break;
                                            }
                                        }
                                        continue;
                                    }
                                }
                                break;
                        }
                        baseMap[baseAttr] = value;
                    }
                    let match;
                    while ((match = REGEXP_IMPORTANT.exec(cssText))) {
                        const attr = convertCamelCase(match[1]);
                        const value = (_b = CSS_PROPERTIES[attr]) === null || _b === void 0 ? void 0 : _b.value;
                        if (Array.isArray(value)) {
                            for (let i = 0, length = value.length; i < length; ++i) {
                                important[value[i]] = true;
                            }
                        } else {
                            important[attr] = true;
                        }
                    }
                    REGEXP_IMPORTANT.lastIndex = 0;
                    parseImageUrl('backgroundImage');
                    parseImageUrl('listStyleImage');
                    parseImageUrl('content');
                    for (const selectorText of parseSelectorText(item.selectorText, true)) {
                        const specificity = getSpecificity(selectorText);
                        const [selector, target] = splitPair(selectorText, '::');
                        const targetElt = target ? '::' + target : '';
                        const elements = document.querySelectorAll(selector || '*');
                        const q = elements.length;
                        if (q === 0) {
                            if (unusedStyles) {
                                unusedStyles.add(selectorText);
                            }
                            continue;
                        }
                        for (let i = 0; i < q; ++i) {
                            const element = elements[i];
                            const attrStyle = 'styleMap' + targetElt;
                            const attrSpecificity = 'styleSpecificity' + targetElt;
                            const styleData = getElementCache(element, attrStyle, sessionId);
                            if (styleData) {
                                const specificityData = getElementCache(element, attrSpecificity, sessionId);
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
                                setElementCache(element, 'sessionId', sessionId);
                                setElementCache(element, attrStyle, styleMap, sessionId);
                                setElementCache(element, attrSpecificity, specificityData, sessionId);
                            }
                        }
                    }
                    break;
                }
                case CSSRule.FONT_FACE_RULE: {
                    if (resource) {
                        const attr = (_c = REGEXP_FONTFACE.exec(cssText)) === null || _c === void 0 ? void 0 : _c[1];
                        if (attr) {
                            const src =
                                (_d = REGEXP_FONTSRC.exec(attr)) === null || _d === void 0 ? void 0 : _d[1].trim();
                            let fontFamily =
                                (_e = REGEXP_FONTFAMILY.exec(attr)) === null || _e === void 0 ? void 0 : _e[1].trim();
                            if (src && fontFamily) {
                                fontFamily = trimBoth(fontFamily, '"');
                                const fontStyle =
                                    ((_f = REGEXP_FONTSTYLE.exec(attr)) === null || _f === void 0
                                        ? void 0
                                        : _f[1].toLowerCase()) || 'normal';
                                const fontWeight = parseInt(
                                    ((_g = REGEXP_FONTWEIGHT.exec(attr)) === null || _g === void 0 ? void 0 : _g[1]) ||
                                        '400'
                                );
                                for (const value of src.split(',')) {
                                    const urlMatch = REGEXP_FONTURL.exec(value);
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
                                        resource.addFont(data);
                                    }
                                }
                            }
                        }
                    }
                    break;
                }
                case CSSRule.SUPPORTS_RULE:
                    this.applyCSSRuleList(item.cssRules, sessionId);
                    break;
            }
        }
        applyStyleSheet(item, sessionId, processing) {
            var _a;
            try {
                const cssRules = item.cssRules;
                if (cssRules) {
                    const parseConditionText = (rule, value) => {
                        var _a;
                        return (
                            ((_a = new RegExp(`\\s*@${rule}([^{]+)`).exec(value)) === null || _a === void 0
                                ? void 0
                                : _a[1].trim()) || value
                        );
                    };
                    for (let i = 0, length = cssRules.length; i < length; ++i) {
                        const rule = cssRules[i];
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
                                this.applyStyleSheet(rule.styleSheet, sessionId, processing);
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
                            case CSSRule.KEYFRAMES_RULE: {
                                const value = parseKeyframes(rule.cssRules);
                                if (value) {
                                    const keyframesMap =
                                        processing.keyframesMap || (processing.keyframesMap = new Map());
                                    const name = rule.name;
                                    const keyframe = keyframesMap.get(name);
                                    if (keyframe) {
                                        Object.assign(keyframe, value);
                                    } else {
                                        keyframesMap.set(name, value);
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (err) {
                (this.userSettings.showErrorMessages
                    ? alert
                    : console.log)(CSS_CANNOT_BE_PARSED + '\n\n' + item.href + '\n\n' + err);
            }
        }
        applyCSSRuleList(rules, sessionId) {
            for (let i = 0, length = rules.length; i < length; ++i) {
                this.applyStyleRule(rules[i], sessionId);
            }
        }
        createSessionThread(elements) {
            const sessionId = this._controllerHandler.generateSessionId;
            const rootElements = new Set();
            const extensions = this.extensionsAll;
            const processing = {
                sessionId,
                initializing: false,
                cache: new NodeList(undefined, sessionId),
                excluded: new NodeList(undefined, sessionId),
                rootElements,
                elementMap: newSessionInit(sessionId),
                extensions,
            };
            const afterInsertNode = extensions.filter(item => !!item.afterInsertNode);
            if (afterInsertNode.length) {
                processing.afterInsertNode = afterInsertNode;
            }
            this.session.active.set(sessionId, processing);
            this._controllerHandler.init();
            this.setStyleMap(sessionId, processing);
            const length = elements.length;
            if (length === 0) {
                rootElements.add(this.mainElement);
            } else {
                for (let i = 0; i < length; ++i) {
                    let element = elements[i];
                    if (typeof element === 'string') {
                        element = document.getElementById(element);
                    }
                    if (!element || element.nodeName[0] === '#') {
                        continue;
                    }
                    rootElements.add(element);
                }
            }
            return [processing, rootElements];
        }
        resumeSessionThread(processing, rootElements, multipleRequest, documentRoot, preloaded) {
            processing.initializing = false;
            const { sessionId, extensions } = processing;
            const styleElement = insertStyleSheetRule('html > body { overflow: hidden !important; }');
            if (preloaded) {
                for (let i = 0, length = preloaded.length; i < length; ++i) {
                    const image = preloaded[i];
                    if (image.parentElement) {
                        documentRoot.removeChild(image);
                    }
                }
            }
            const length = extensions.length;
            for (let i = 0; i < length; ++i) {
                extensions[i].beforeParseDocument(sessionId);
            }
            const success = new Array(rootElements.size);
            let j = 0;
            for (const element of rootElements) {
                const node = this.createCache(element, sessionId);
                if (node) {
                    this.afterCreateCache(node);
                    success[j++] = node;
                }
            }
            success.length = j;
            for (let i = 0; i < length; ++i) {
                extensions[i].afterParseDocument(sessionId);
            }
            try {
                document.head.removeChild(styleElement);
            } catch (_a) {}
            return multipleRequest > 1 ? success : success[0];
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
        get fileHandler() {
            return this._resourceHandler ? this._resourceHandler.fileHandler : null;
        }
        get extensionManager() {
            return this._extensionManager;
        }
        get extensionsAll() {
            return this.extensions.filter(item => item.enabled);
        }
        get sessionAll() {
            const active = this.session.active;
            if (active.size === 1) {
                const processing = active.values().next().value;
                return [processing.extensions, processing.cache.children];
            }
            let extensions = [],
                children = [];
            for (const processing of active.values()) {
                extensions = extensions.concat(processing.extensions);
                children = children.concat(processing.cache.children);
            }
            return [Array.from(new Set(extensions)), children];
        }
        get nextId() {
            return ++this._nextId;
        }
        get length() {
            return this.session.active.size;
        }
    }
    Application.KEY_NAME = 'squared.base.application';

    class Application$1 extends Application {
        constructor() {
            super(...arguments);
            this.systemName = 'vdom';
        }
        init() {}
        insertNode(element, sessionId) {
            if (element.nodeName[0] !== '#') {
                return new this.Node(this.nextId, sessionId, element);
            }
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
        applyDefaultStyles(element, sessionId, pseudoElt) {}
        reset() {}
        includeElement(element) {
            return true;
        }
        preventNodeCascade(node) {
            return false;
        }
        get generateSessionId() {
            return Date.now() + '#' + this.application.session.active.size;
        }
        get afterInsertNode() {
            return node => {};
        }
        get userSettings() {
            return this.application.userSettings;
        }
    }

    const { CSS: CSS$1, FILE: FILE$1 } = squared.lib.regex;
    const { SELECTOR_ATTR, SELECTOR_G, SELECTOR_LABEL, SELECTOR_PSEUDO_CLASS } = CSS$1;
    const { isUserAgent: isUserAgent$1 } = squared.lib.client;
    const {
        CSS_PROPERTIES: CSS_PROPERTIES$1,
        PROXY_INLINESTYLE,
        checkFontSizeValue,
        checkStyleValue,
        checkWritingMode,
        formatPX,
        getRemSize,
        getStyle,
        isAngle,
        isLength,
        isPercent,
        isTime,
        parseSelectorText: parseSelectorText$1,
        parseUnit,
    } = squared.lib.css;
    const { assignRect, getNamedItem, getRangeClientRect, newBoxRectDimension } = squared.lib.dom;
    const {
        getElementAsNode,
        getElementCache: getElementCache$1,
        getElementData,
        setElementCache: setElementCache$1,
    } = squared.lib.session;
    const {
        convertCamelCase: convertCamelCase$1,
        convertFloat,
        convertInt,
        hasBit,
        hasValue,
        isNumber,
        isObject,
        iterateArray,
        iterateReverseArray,
        spliceString,
        splitPair: splitPair$1,
    } = squared.lib.util;
    var STYLE_CACHE;
    (function (STYLE_CACHE) {
        STYLE_CACHE[(STYLE_CACHE['FAIL'] = 0)] = 'FAIL';
        STYLE_CACHE[(STYLE_CACHE['READY'] = 1)] = 'READY';
        STYLE_CACHE[(STYLE_CACHE['CHANGED'] = 2)] = 'CHANGED';
    })(STYLE_CACHE || (STYLE_CACHE = {}));
    const TEXT_STYLE = [
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
    const BORDER_TOP = CSS_PROPERTIES$1.borderTop.value;
    const BORDER_RIGHT = CSS_PROPERTIES$1.borderRight.value;
    const BORDER_BOTTOM = CSS_PROPERTIES$1.borderBottom.value;
    const BORDER_LEFT = CSS_PROPERTIES$1.borderLeft.value;
    const BORDER_OUTLINE = CSS_PROPERTIES$1.outline.value;
    const REGEXP_EM = /\dem$/;
    const REGEXP_QUERYNTH = /^:nth(-last)?-(child|of-type)\((.+)\)$/;
    const REGEXP_QUERYNTHPOSITION = /^(-)?(\d+)?n\s*([+-]\d+)?$/;
    function setStyleCache(element, attr, value, style, styleMap, sessionId) {
        let current = style.getPropertyValue(attr);
        if (value !== current) {
            element.style.setProperty(attr, value);
            const newValue = element.style.getPropertyValue(attr);
            if (current !== newValue) {
                if (current.endsWith('px')) {
                    const styleValue = styleMap[convertCamelCase$1(attr)];
                    if (styleValue) {
                        current = styleValue;
                        value = '';
                    }
                }
                setElementCache$1(element, attr, value !== 'auto' ? current : '', sessionId);
                return 2 /* CHANGED */;
            }
            return 0 /* FAIL */;
        }
        return 1 /* READY */;
    }
    function parseLineHeight(lineHeight, fontSize) {
        if (isPercent(lineHeight)) {
            return (parseFloat(lineHeight) / 100) * fontSize;
        } else if (isNumber(lineHeight)) {
            return parseFloat(lineHeight) * fontSize;
        }
        return parseUnit(lineHeight, { fontSize });
    }
    function isFontFixedWidth(node) {
        const [fontFirst, fontSecond] = splitPair$1(node.css('fontFamily'), ',', true);
        return (
            fontFirst.toLowerCase() === 'monospace' && !(fontSecond !== '' && fontSecond.toLowerCase() === 'monospace')
        );
    }
    function getFlexValue(node, attr, fallback, parent) {
        const value = (parent || node).css(attr);
        return isNumber(value) ? parseFloat(value) : fallback;
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
    function setDimension(node, styleMap, attr) {
        const options = { dimension: attr };
        const value = styleMap[attr];
        const min = styleMap[attr === 'width' ? 'minWidth' : 'minHeight'];
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
                case 'svg':
                case 'IFRAME':
                case 'VIDEO':
                case 'AUDIO':
                case 'CANVAS':
                case 'OBJECT':
                case 'EMBED': {
                    const size = getNamedItem(element, attr);
                    if (size !== '') {
                        result = isNumber(size) ? parseFloat(size) : node.parseUnit(size, options);
                        if (result) {
                            node.css(attr, isPercent(size) ? size : size + 'px');
                        }
                    }
                    break;
                }
            }
        }
        if (baseValue && !node.imageElement) {
            const attrMax = attr === 'width' ? 'maxWidth' : 'maxHeight';
            const max = styleMap[attrMax];
            if (max) {
                if (value === max) {
                    delete styleMap[attrMax];
                } else {
                    const maxValue = node.parseUnit(max, { dimension: attr });
                    if (maxValue) {
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
                case 'hidden':
                    return 0;
            }
            const width = node.css(border[0]);
            if (width !== '') {
                let result;
                switch (width) {
                    case 'thin':
                        result = 1;
                        break;
                    case 'medium':
                        result = 3;
                        break;
                    case 'thick':
                        result = 5;
                        break;
                    default:
                        result = isLength(width, true)
                            ? node.parseUnit(width, { dimension })
                            : convertFloat(node.style[border[0]]);
                        break;
                }
                if (result) {
                    return Math.max(Math.round(result), 1);
                }
            }
        }
        return 0;
    }
    function convertBox(node, attr, margin) {
        var _a;
        switch (node.display) {
            case 'table':
                if (!margin && node.valueOf('borderCollapse') === 'collapse') {
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
                                const [horizontal, vertical] = splitPair$1(parent.css('borderSpacing'), ' ');
                                switch (attr) {
                                    case 'marginTop':
                                    case 'marginBottom':
                                        return vertical
                                            ? node.parseUnit(vertical, { dimension: 'height', parent: false })
                                            : node.parseUnit(horizontal, { parent: false });
                                    case 'marginRight':
                                        return node.actualParent.lastChild !== node
                                            ? node.parseUnit(horizontal, { parent: false })
                                            : 0;
                                }
                            }
                            return 0;
                        }
                    }
                }
                break;
        }
        return node.parseUnit(
            node.css(attr),
            ((_a = node.actualParent) === null || _a === void 0 ? void 0 : _a.gridElement)
                ? { parent: false }
                : undefined
        );
    }
    function convertPosition(node, attr) {
        if (!node.positionStatic) {
            const unit = node.valueOf(attr, { modified: true });
            if (unit.endsWith('px')) {
                return parseFloat(unit);
            } else if (isPercent(unit)) {
                return node.styleElement ? convertFloat(node.style[attr]) : 0;
            }
            return node.parseUnit(unit, attr === 'top' || attr === 'bottom' ? { dimension: 'height' } : undefined);
        }
        return 0;
    }
    function validateQuerySelector(node, child, selector, last, adjacent) {
        var _a;
        if (selector.all) {
            return true;
        } else if (
            (selector.tagName && selector.tagName !== child.tagName.toUpperCase()) ||
            (selector.id && selector.id !== child.elementId)
        ) {
            return false;
        }
        const { attrList, classList, notList, pseudoList } = selector;
        if (pseudoList) {
            const { actualParent: parent, tagName } = child;
            for (let i = 0, length = pseudoList.length; i < length; ++i) {
                const pseudo = pseudoList[i];
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
                        for (let j = 0, k = 0, q = children.length; j < q; ++j) {
                            if (children[j].tagName === tagName && ++k > 1) {
                                return false;
                            }
                        }
                        break;
                    }
                    case ':first-of-type': {
                        const children = parent.naturalElements;
                        for (let j = 0, q = children.length; j < q; ++j) {
                            const item = children[j];
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
                        if (child.element.hasChildNodes()) {
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
                                    let valid;
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
                                    if (
                                        element.checked ||
                                        (element.name &&
                                            iterateArray(
                                                (
                                                    ((_a = child.ascend({
                                                        condition: item => item.tagName === 'FORM',
                                                    })[0]) === null || _a === void 0
                                                        ? void 0
                                                        : _a.element) || document
                                                ).querySelectorAll(`input[type=radio][name="${element.name}"`),
                                                item => item.checked
                                            ) === Infinity)
                                    ) {
                                        return false;
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
                        let match = REGEXP_QUERYNTH.exec(pseudo);
                        if (match) {
                            const children = match[1]
                                ? parent.naturalElements.slice(0).reverse()
                                : parent.naturalElements;
                            const index =
                                match[2] === 'child'
                                    ? children.indexOf(child) + 1
                                    : children.filter(item => item.tagName === tagName).indexOf(child) + 1;
                            if (index) {
                                const placement = match[3].trim();
                                if (isNumber(placement)) {
                                    if (parseInt(placement) !== index) {
                                        return false;
                                    }
                                } else {
                                    switch (placement) {
                                        case 'even':
                                            if (index % 2 !== 0) {
                                                return false;
                                            }
                                            break;
                                        case 'odd':
                                            if (index % 2 === 0) {
                                                return false;
                                            }
                                            break;
                                        default: {
                                            const subMatch = REGEXP_QUERYNTHPOSITION.exec(placement);
                                            if (subMatch) {
                                                const modifier = convertInt(subMatch[3]);
                                                if (subMatch[2]) {
                                                    if (subMatch[1]) {
                                                        return false;
                                                    }
                                                    const increment = parseInt(subMatch[2]);
                                                    if (increment !== 0) {
                                                        if (index !== modifier) {
                                                            for (let j = increment; ; j += increment) {
                                                                const total = increment + modifier;
                                                                if (total === index) {
                                                                    break;
                                                                } else if (total > index) {
                                                                    return false;
                                                                }
                                                            }
                                                        }
                                                    } else if (index !== modifier) {
                                                        return false;
                                                    }
                                                } else if (subMatch[3]) {
                                                    if (modifier > 0) {
                                                        if (subMatch[1]) {
                                                            if (index > modifier) {
                                                                return false;
                                                            }
                                                        } else if (index < modifier) {
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
                            if (
                                match &&
                                child.attributes['lang'].trim().toLowerCase() === match[1].trim().toLowerCase()
                            ) {
                                continue;
                            }
                        }
                        return false;
                    }
                }
            }
        }
        if (notList) {
            for (let i = 0, length = notList.length; i < length; ++i) {
                const not = notList[i];
                const notData = {};
                switch (not[0]) {
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
                if (validateQuerySelector(node, child, notData, last)) {
                    return false;
                }
            }
        }
        if (classList) {
            const elementList = child.element.classList;
            for (let i = 0, length = classList.length; i < length; ++i) {
                if (!elementList.contains(classList[i])) {
                    return false;
                }
            }
        }
        if (attrList) {
            const attributes = child.attributes;
            for (let i = 0, length = attrList.length; i < length; ++i) {
                const attr = attrList[i];
                let value;
                if (attr.endsWith) {
                    const pattern = new RegExp(`^(?:.+:)?${attr.key}$`);
                    for (const name in attributes) {
                        if (pattern.test(name)) {
                            value = attributes[name];
                            break;
                        }
                    }
                } else {
                    value = attributes[attr.key];
                }
                if (!value) {
                    return false;
                } else {
                    const valueAlt = attr.value;
                    if (valueAlt) {
                        if (attr.caseInsensitive) {
                            value = value.toLowerCase();
                        }
                        if (attr.symbol) {
                            switch (attr.symbol) {
                                case '~':
                                    if (!value.split(/\s+/).includes(valueAlt)) {
                                        return false;
                                    }
                                    break;
                                case '^':
                                    if (!value.startsWith(valueAlt)) {
                                        return false;
                                    }
                                    break;
                                case '$':
                                    if (!value.endsWith(valueAlt)) {
                                        return false;
                                    }
                                    break;
                                case '*':
                                    if (!value.includes(valueAlt)) {
                                        return false;
                                    }
                                    break;
                                case '|':
                                    if (value !== valueAlt && !value.startsWith(valueAlt + '-')) {
                                        return false;
                                    }
                                    break;
                            }
                        } else if (value !== valueAlt) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }
    function ascendQuerySelector(node, selectors, i, j, nodes, adjacent) {
        const depth = node.depth;
        const selector = selectors[j];
        const length = selectors.length;
        const last = j === length - 1;
        const next = [];
        for (let k = 0, q = nodes.length; k < q; ++k) {
            const child = nodes[k];
            if (adjacent) {
                const parent = child.actualParent;
                if (adjacent === '>') {
                    if (validateQuerySelector(node, parent, selector, last, adjacent)) {
                        next.push(parent);
                    }
                } else {
                    const children = parent.naturalElements;
                    switch (adjacent) {
                        case '+': {
                            const l = children.indexOf(child) - 1;
                            if (l >= 0) {
                                const sibling = children[l];
                                if (validateQuerySelector(node, sibling, selector, last, adjacent)) {
                                    next.push(sibling);
                                }
                            }
                            break;
                        }
                        case '~': {
                            for (let l = 0, r = children.length; l < r; ++l) {
                                const sibling = children[l];
                                if (sibling === child) {
                                    break;
                                } else if (validateQuerySelector(node, sibling, selector, last, adjacent)) {
                                    next.push(sibling);
                                }
                            }
                            break;
                        }
                    }
                }
            } else if (child.depth - depth >= length - j) {
                let parent = child.actualParent;
                while (parent) {
                    if (validateQuerySelector(node, parent, selector, last)) {
                        next.push(parent);
                    }
                    parent = parent.actualParent;
                }
            }
        }
        if (next.length === 0) {
            return false;
        }
        return ++j === length ? true : ascendQuerySelector(node, selectors, i, j, next, selector.adjacent);
    }
    const aboveRange = (a, b, offset = 1) => a + offset > b;
    const belowRange = (a, b, offset = 1) => a - offset < b;
    const sortById = (a, b) => a.id - b.id;
    const isInlineVertical = value => value.startsWith('inline') || value === 'table-cell';
    const canTextAlign = node =>
        node.naturalChild &&
        (node.isEmpty() || isInlineVertical(node.display)) &&
        !node.floating &&
        node.autoMargin.horizontal !== true;
    class Node extends squared.lib.base.Container {
        constructor(id, sessionId = '0', element, children) {
            super(children);
            this.id = id;
            this.sessionId = sessionId;
            this.documentRoot = false;
            this.depth = -1;
            this._parent = null;
            this._cache = {};
            this._cacheState = {};
            this._preferInitial = false;
            this._bounds = null;
            this._box = null;
            this._linear = null;
            this._childIndex = Infinity;
            this._element = null;
            if (element) {
                this._element = element;
                if (sessionId !== '0') {
                    setElementCache$1(element, 'node', this, sessionId);
                    const elementData = getElementData(element, sessionId);
                    if (elementData) {
                        this._elementData = elementData;
                        if (!this.syncWith(sessionId)) {
                            this._styleMap = {};
                        }
                        return;
                    }
                }
            }
            this._styleMap = {};
            this._elementData = null;
        }
        static sanitizeCss(element, styleMap, writingMode) {
            const result = {};
            for (let attr in styleMap) {
                let value = styleMap[attr];
                const alias = checkWritingMode(attr, writingMode);
                if (alias !== attr) {
                    if (typeof alias === 'string') {
                        if (!styleMap[alias]) {
                            attr = alias;
                        } else {
                            continue;
                        }
                    } else {
                        for (const attrAlt of alias) {
                            if (!styleMap[attrAlt]) {
                                const valueAlt = checkStyleValue(element, attrAlt, value);
                                if (valueAlt !== '') {
                                    result[attrAlt] = valueAlt;
                                }
                            }
                        }
                        continue;
                    }
                }
                value = checkStyleValue(element, attr, value);
                if (value !== '') {
                    result[attr] = value;
                }
            }
            return result;
        }
        init(parent, depth, index) {
            this._parent = parent;
            this.depth = depth;
            if (index !== undefined) {
                this.childIndex = index;
            }
        }
        syncWith(sessionId, cache) {
            const element = this._element;
            if (element) {
                let elementData;
                if (!sessionId) {
                    sessionId = getElementCache$1(element, 'sessionId', '0');
                    if (sessionId === this.sessionId) {
                        if (cache) {
                            this._cache = {};
                        }
                        return true;
                    } else if (!sessionId) {
                        return false;
                    } else {
                        elementData = getElementData(element, sessionId);
                        if (elementData) {
                            this._elementData = elementData;
                        }
                    }
                } else {
                    elementData = this._elementData;
                }
                if (elementData) {
                    const styleMap = elementData.styleMap;
                    if (styleMap) {
                        if (!this.plainText && this.naturalChild) {
                            if (!this.pseudoElement) {
                                const items = Array.from(element.style);
                                const length = items.length;
                                if (length) {
                                    for (let i = 0; i < length; ++i) {
                                        const attr = items[i];
                                        styleMap[convertCamelCase$1(attr)] = element.style.getPropertyValue(attr);
                                    }
                                }
                            } else {
                                this.pseudoElt = elementData.pseudoElt;
                            }
                            this._styleMap = Node.sanitizeCss(element, styleMap, styleMap.writingMode);
                        } else {
                            this._styleMap = styleMap;
                        }
                        this._cssStyle = styleMap;
                        if (cache) {
                            this._cache = {};
                        }
                        return true;
                    }
                }
            }
            return false;
        }
        saveAsInitial() {
            this._initial = {
                styleMap: Object.assign({}, this._styleMap),
                bounds: this._bounds,
                children: !this.isEmpty() ? this.toArray() : undefined,
            };
        }
        data(name, attr, value, overwrite = true) {
            const data = this._data || (this._data = {});
            if (value === null) {
                if (data[name]) {
                    delete data[name][attr];
                }
                return;
            } else if (value !== undefined) {
                let obj = data[name];
                if (!isObject(obj)) {
                    obj = {};
                    data[name] = obj;
                }
                if (overwrite || !hasValue(obj[attr])) {
                    obj[attr] = value;
                }
            }
            const stored = data[name];
            if (isObject(stored)) {
                return stored[attr];
            }
        }
        unsetCache(...attrs) {
            const length = attrs.length;
            if (length) {
                const cache = this._cache;
                for (let i = 0; i < length; ++i) {
                    const attr = attrs[i];
                    switch (attr) {
                        case 'position':
                            if (!this._preferInitial) {
                                this.cascade(item => {
                                    if (!item.pageFlow) {
                                        item.unsetState('absoluteParent');
                                    }
                                });
                            }
                        case 'display':
                        case 'float':
                        case 'tagName':
                            this._cache = {};
                            break;
                        case 'width':
                            cache.actualWidth = undefined;
                            cache.percentWidth = undefined;
                        case 'minWidth':
                            cache.width = undefined;
                            break;
                        case 'height':
                            cache.actualHeight = undefined;
                            cache.percentHeight = undefined;
                        case 'minHeight':
                            cache.height = undefined;
                            if (!this._preferInitial) {
                                this.unsetCache('blockVertical');
                                this.each(item => item.unsetCache());
                            }
                            break;
                        case 'verticalAlign':
                            cache.baseline = undefined;
                            break;
                        case 'left':
                        case 'right':
                        case 'textAlign':
                            cache.rightAligned = undefined;
                            cache.centerAligned = undefined;
                            break;
                        case 'top':
                        case 'bottom':
                            cache.bottomAligned = undefined;
                            break;
                        case 'whiteSpace':
                            cache.preserveWhiteSpace = undefined;
                            cache.textStyle = undefined;
                            this._cacheState.textEmpty = undefined;
                            continue;
                        default:
                            if (attr.startsWith('margin')) {
                                cache.autoMargin = undefined;
                                cache.rightAligned = undefined;
                                cache.centerAligned = undefined;
                                cache.bottomAligned = undefined;
                            } else if (attr.startsWith('padding')) {
                                cache.contentBoxWidth = undefined;
                                cache.contentBoxHeight = undefined;
                            } else if (attr.startsWith('border')) {
                                cache.visibleStyle = undefined;
                                cache.contentBoxWidth = undefined;
                                cache.contentBoxHeight = undefined;
                            } else if (attr.startsWith('background')) {
                                cache.visibleStyle = undefined;
                            } else if (TEXT_STYLE.includes(attr)) {
                                cache.lineHeight = undefined;
                                cache.textStyle = undefined;
                            }
                            break;
                    }
                    if (attr in cache) {
                        cache[attr] = undefined;
                    }
                }
            } else {
                this._cache = {};
            }
            if (!this._preferInitial && this.naturalChild) {
                let parent;
                if (attrs.some(value => hasBit(CSS_PROPERTIES$1[value].trait, 4 /* LAYOUT */))) {
                    parent = (this.pageFlow && this.ascend({ condition: item => item.documentRoot })[0]) || this;
                } else if (attrs.some(value => hasBit(CSS_PROPERTIES$1[value].trait, 8 /* CONTAIN */))) {
                    parent = this;
                } else {
                    return;
                }
                parent.resetBounds();
                const queryMap = parent.queryMap;
                if (queryMap) {
                    for (let i = 0, q = queryMap.length; i < q; ++i) {
                        const children = queryMap[i];
                        for (let j = 0, r = children.length; j < r; ++j) {
                            children[j].resetBounds();
                        }
                    }
                } else {
                    this.cascade(item => item.resetBounds());
                }
            }
        }
        unsetState(...attrs) {
            let reset;
            const length = attrs.length;
            if (length) {
                const cacheState = this._cacheState;
                for (let i = 0; i < length; ++i) {
                    const attr = attrs[i];
                    if (attr in cacheState) {
                        switch (attr) {
                            case 'actualParent':
                                cacheState.absoluteParent = undefined;
                                reset = true;
                                break;
                            case 'absoluteParent':
                                reset = true;
                                break;
                            case 'textContent':
                                cacheState.textEmpty = undefined;
                                reset = true;
                                break;
                        }
                        cacheState[attr] = undefined;
                    }
                }
            } else {
                this._cacheState = {};
                reset = true;
            }
            if (reset && !this._preferInitial && this.naturalChild) {
                this.resetBounds();
            }
        }
        ascend(options) {
            let condition, error, every, including, excluding, attr, startSelf;
            if (options) {
                ({ condition, error, every, including, excluding, attr, startSelf } = options);
            }
            if (!attr) {
                attr = 'actualParent';
            } else if (attr !== 'parent' && !attr.endsWith('Parent')) {
                return [];
            }
            const result = [];
            let parent = startSelf ? this : this[attr];
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
        descend(options) {
            let condition, error, every, including, excluding;
            if (options) {
                ({ condition, error, every, including, excluding } = options);
            }
            let invalid;
            const recurse = parent => {
                let result = [];
                const children = parent.naturalElements;
                for (let i = 0, length = children.length; i < length; ++i) {
                    const item = children[i];
                    if ((error && error(item)) || item === excluding) {
                        invalid = true;
                        break;
                    }
                    if (condition) {
                        if (condition(item)) {
                            result.push(item);
                            if (!every || item === including) {
                                invalid = true;
                                break;
                            }
                        }
                    } else {
                        result.push(item);
                        if (item === including) {
                            invalid = true;
                            break;
                        }
                    }
                    if (item instanceof Node && !item.isEmpty()) {
                        result = result.concat(recurse(item));
                        if (invalid) {
                            break;
                        }
                    }
                }
                return result;
            };
            return recurse(this);
        }
        intersectX(rect, options) {
            if (rect.width) {
                const { left, right } = this[
                    (options === null || options === void 0 ? void 0 : options.dimension) || 'linear'
                ];
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
        intersectY(rect, options) {
            if (rect.height) {
                const { top, bottom } = this[
                    (options === null || options === void 0 ? void 0 : options.dimension) || 'linear'
                ];
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
        withinX(rect, options) {
            if (rect.width || this.pageFlow) {
                let dimension, offset;
                if (options) {
                    ({ dimension, offset } = options);
                }
                const { left, right } = this[dimension || 'bounds'];
                return aboveRange(left, rect.left, offset) && belowRange(right, rect.right, offset);
            }
            return true;
        }
        withinY(rect, options) {
            if (rect.height || this.pageFlow) {
                let dimension, offset;
                if (options) {
                    ({ dimension, offset } = options);
                }
                const { top, bottom } = this[dimension || 'bounds'];
                return aboveRange(top, rect.top, offset) && belowRange(bottom, rect.bottom, offset);
            }
            return true;
        }
        outsideX(rect, options) {
            if (rect.width || this.pageFlow) {
                let dimension, offset;
                if (options) {
                    ({ dimension, offset } = options);
                }
                const { left, right } = this[dimension || 'linear'];
                return offset === undefined
                    ? left < Math.floor(rect.left) || right > Math.ceil(rect.right)
                    : left < rect.left - offset || right > rect.right + offset;
            }
            return false;
        }
        outsideY(rect, options) {
            if (rect.height || this.pageFlow) {
                let dimension, offset;
                if (options) {
                    ({ dimension, offset } = options);
                }
                const { top, bottom } = this[dimension || 'linear'];
                return offset === undefined
                    ? top < Math.floor(rect.top) || bottom > Math.ceil(rect.bottom)
                    : top < rect.top - offset || bottom > rect.bottom + offset;
            }
            return false;
        }
        css(attr, value, cache = true) {
            if (value && this.styleElement) {
                const previousValue = this.style[attr];
                if (previousValue !== undefined) {
                    this.style[attr] = value;
                    if (previousValue !== this.style[attr]) {
                        this._styleMap[attr] = value;
                        if (cache) {
                            this.unsetCache(attr);
                        }
                        return value;
                    }
                    return previousValue;
                }
                return '';
            }
            return this._styleMap[attr] || this.style[attr] || '';
        }
        cssApply(values, overwrite = true, cache = true) {
            if (overwrite) {
                for (const attr in values) {
                    this.css(attr, values[attr], cache);
                }
            } else {
                const styleMap = this._styleMap;
                for (const attr in values) {
                    if (!styleMap[attr]) {
                        this.css(attr, values[attr], cache);
                    }
                }
            }
            return this;
        }
        cssParent(attr, value, cache = false) {
            var _a;
            return ((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.css(attr, value, cache)) || '';
        }
        cssInitial(attr, options) {
            const initial = this._initial;
            return (
                ((initial && initial.styleMap) || this._styleMap)[attr] ||
                (options && ((options.modified && this._styleMap[attr]) || (options.computed && this.style[attr]))) ||
                ''
            );
        }
        cssAscend(attr, options) {
            let parent = options && options.startSelf ? this : this.actualParent,
                value;
            while (parent) {
                value = parent.valueOf(attr, options);
                if (value !== '' && value !== 'inherit') {
                    return value;
                }
                parent = parent.actualParent;
            }
            return '';
        }
        cssAny(attr, values, options) {
            let ascend, initial;
            if (options) {
                ({ ascend, initial } = options);
            }
            let value;
            if (ascend) {
                options.startSelf = true;
                value = this.cssAscend(attr, options);
            } else {
                value = initial ? this.cssInitial(attr, options) : this.css(attr);
            }
            return value !== '' && values.includes(value);
        }
        cssSort(attr, options) {
            let ascending, byFloat, byInt, duplicate;
            if (options) {
                ({ ascending, byFloat, byInt, duplicate } = options);
            }
            return (duplicate ? this.toArray() : this.children).sort((a, b) => {
                let valueA, valueB;
                if (byFloat) {
                    valueA = a.toFloat(attr, a.childIndex);
                    valueB = b.toFloat(attr, b.childIndex);
                } else if (byInt) {
                    valueA = a.toInt(attr, a.childIndex);
                    valueB = b.toInt(attr, b.childIndex);
                } else {
                    valueA = a.css(attr);
                    valueB = b.css(attr);
                }
                if (valueA === valueB) {
                    return 0;
                } else if (ascending !== false) {
                    return valueA < valueB ? -1 : 1;
                }
                return valueA > valueB ? -1 : 1;
            });
        }
        cssPX(attr, value, cache, options) {
            const current = this._styleMap[attr];
            if (current && isLength(current)) {
                value += parseUnit(current, { fontSize: this.fontSize });
                if (value < 0 && !(options && options.negative)) {
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
            var _a, _b, _c;
            let value;
            if (this.styleElement) {
                const styleData = !this.pseudoElt
                    ? (_a = this._elementData) === null || _a === void 0
                        ? void 0
                        : _a['styleSpecificity']
                    : (_c = (_b = this.actualParent) === null || _b === void 0 ? void 0 : _b.elementData) === null ||
                      _c === void 0
                    ? void 0
                    : _c['styleSpecificity' + this.pseudoElt];
                if (styleData) {
                    value = styleData[attr];
                }
            }
            return value || 0;
        }
        cssTry(attr, value, callback) {
            if (this.styleElement) {
                const element = this._element;
                if (
                    setStyleCache(
                        element,
                        attr,
                        value,
                        !this.pseudoElement ? this.style : getStyle(element),
                        this._styleMap,
                        this.sessionId
                    )
                ) {
                    if (callback) {
                        callback.call(this, attr);
                        this.cssFinally(attr);
                    }
                    return true;
                }
            }
            return false;
        }
        cssTryAll(values, callback) {
            if (this.styleElement) {
                const result = {};
                const sessionId = this.sessionId;
                const element = this._element;
                const style = !this.pseudoElement ? this.style : getStyle(element);
                for (const attr in values) {
                    const value = values[attr];
                    switch (setStyleCache(element, attr, value, style, this._styleMap, sessionId)) {
                        case 0 /* FAIL */:
                            this.cssFinally(result);
                            return false;
                        case 1 /* READY */:
                            continue;
                        case 2 /* CHANGED */:
                            result[attr] = value;
                            break;
                    }
                }
                if (callback) {
                    callback.call(this, result);
                    this.cssFinally(result);
                    return true;
                }
                return result;
            }
            return false;
        }
        cssFinally(attrs) {
            if (this.styleElement) {
                const elementData = this._elementData;
                if (elementData) {
                    if (typeof attrs === 'string') {
                        const value = elementData[attrs];
                        if (value) {
                            this._element.style.setProperty(attrs, value);
                        }
                    } else {
                        for (const attr in attrs) {
                            const value = elementData[attr];
                            if (value) {
                                this._element.style.setProperty(attr, value);
                            }
                        }
                    }
                }
            }
        }
        cssCopy(node, ...attrs) {
            const styleMap = this._styleMap;
            for (let i = 0, length = attrs.length; i < length; ++i) {
                const attr = attrs[i];
                styleMap[attr] = node.css(attr);
            }
        }
        cssCopyIfEmpty(node, ...attrs) {
            const styleMap = this._styleMap;
            for (let i = 0, length = attrs.length; i < length; ++i) {
                const attr = attrs[i];
                if (!styleMap[attr]) {
                    styleMap[attr] = node.css(attr);
                }
            }
        }
        cssAsTuple(...attrs) {
            const length = attrs.length;
            const result = new Array(length);
            for (let i = 0; i < length; ++i) {
                result[i] = this.css(attrs[i]);
            }
            return result;
        }
        cssAsObject(...attrs) {
            const result = {};
            for (let i = 0, length = attrs.length; i < length; ++i) {
                const attr = attrs[i];
                result[attr] = this.css(attr);
            }
            return result;
        }
        cssPseudoElement(name, attr) {
            if (this.naturalElement) {
                if (attr) {
                    return getStyle(this._element, name)[attr];
                } else {
                    const styleMap = this._elementData['styleMap' + name];
                    if (styleMap) {
                        switch (name) {
                            case '::first-letter':
                            case '::first-line':
                                switch (this.display) {
                                    case 'block':
                                    case 'inline-block':
                                    case 'list-item':
                                    case 'table-cell':
                                        break;
                                    default:
                                        return;
                                }
                            case '::before':
                            case '::after':
                                return Node.sanitizeCss(
                                    this._element,
                                    styleMap,
                                    styleMap.writingMode || this.valueOf('writingMode')
                                );
                        }
                    }
                }
            }
        }
        toInt(attr, fallback = NaN, initial) {
            var _a;
            return convertInt(
                ((initial && ((_a = this._initial) === null || _a === void 0 ? void 0 : _a.styleMap)) ||
                    this._styleMap)[attr],
                fallback
            );
        }
        toFloat(attr, fallback = NaN, initial) {
            var _a;
            return convertFloat(
                ((initial && ((_a = this._initial) === null || _a === void 0 ? void 0 : _a.styleMap)) ||
                    this._styleMap)[attr],
                fallback
            );
        }
        toElementInt(attr, fallback = NaN) {
            return this.naturalElement ? convertInt(this._element[attr], fallback) : fallback;
        }
        toElementFloat(attr, fallback = NaN) {
            return this.naturalElement ? convertFloat(this._element[attr], fallback) : fallback;
        }
        toElementBoolean(attr, fallback = false) {
            if (this.naturalElement) {
                const value = this._element[attr];
                if (value !== undefined) {
                    return !!value;
                }
            }
            return fallback;
        }
        toElementString(attr, fallback = '') {
            if (this.naturalElement) {
                const value = this._element[attr];
                if (value !== undefined) {
                    return value ? value.toString() : '';
                }
            }
            return fallback;
        }
        parseUnit(value, options) {
            var _a;
            if (value === '') {
                return 0;
            } else if (value.endsWith('px')) {
                return parseFloat(value);
            } else if (isPercent(value)) {
                const bounds =
                    ((!options || options.parent !== false) &&
                        ((_a = this.absoluteParent) === null || _a === void 0 ? void 0 : _a.box)) ||
                    this.bounds;
                return (parseFloat(value) / 100) * bounds[(options && options.dimension) || 'width'];
            }
            if (!options) {
                options = { fontSize: this.fontSize };
            } else if (options.fontSize === undefined) {
                options.fontSize = this.fontSize;
            }
            return parseUnit(value, options);
        }
        has(attr, options) {
            const value = options && options.initial ? this.cssInitial(attr, options) : this._styleMap[attr];
            if (value) {
                let not, type, ignoreDefault;
                if (options) {
                    ({ not, type, ignoreDefault } = options);
                }
                if (ignoreDefault !== true) {
                    const data = CSS_PROPERTIES$1[attr];
                    if (
                        data &&
                        (value === data.value ||
                            (hasBit(data.trait, 256 /* UNIT */) && parseFloat(value) === parseFloat(data.value)))
                    ) {
                        return false;
                    }
                }
                if (not) {
                    if (value === not) {
                        return false;
                    } else if (Array.isArray(not)) {
                        for (let i = 0, length = not.length; i < length; ++i) {
                            if (value === not[i]) {
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
            let percent, initial;
            if (options) {
                ({ percent, initial } = options);
            }
            const value = initial ? this.cssInitial(attr, options) : this._styleMap[attr];
            return !!value && isLength(value, percent !== false);
        }
        setBounds(cache = true) {
            var _a;
            let bounds;
            if (this.styleElement) {
                bounds = assignRect(
                    (cache && ((_a = this._elementData) === null || _a === void 0 ? void 0 : _a.clientRect)) ||
                        this._element.getBoundingClientRect()
                );
                this._bounds = bounds;
            } else if (this.plainText) {
                const rect = getRangeClientRect(this._element);
                if (rect) {
                    this._textBounds = rect;
                    this._cache.multiline = rect.numberOfLines > 1;
                }
                bounds = rect || newBoxRectDimension();
                this._bounds = bounds;
            } else {
                return null;
            }
            if (!cache) {
                this._box = null;
                this._linear = null;
            }
            return bounds;
        }
        resetBounds(recalibrate) {
            if (!recalibrate) {
                this._bounds = null;
                this._textBounds = undefined;
                this._cache.multiline = undefined;
            }
            this._box = null;
            this._linear = null;
        }
        min(attr, options) {
            let self, last, wrapperOf, initial;
            if (options) {
                ({ self, last, wrapperOf, initial } = options);
            }
            let result,
                min = Infinity;
            this.each(item => {
                if (wrapperOf) {
                    const child = item.wrapperOf;
                    if (child) {
                        item = child;
                    }
                }
                const value = parseFloat(self ? item[attr] : initial ? item.cssInitial(attr, options) : item.css(attr));
                if (!isNaN(value)) {
                    if (last) {
                        if (value <= min) {
                            result = item;
                            min = value;
                        }
                    } else if (value < min) {
                        result = item;
                        min = value;
                    }
                }
            });
            return result || this;
        }
        max(attr, options) {
            let self, last, wrapperOf, initial;
            if (options) {
                ({ self, last, wrapperOf, initial } = options);
            }
            let result,
                max = -Infinity;
            this.each(item => {
                if (wrapperOf) {
                    const child = item.wrapperOf;
                    if (child) {
                        item = child;
                    }
                }
                const value = parseFloat(self ? item[attr] : initial ? item.cssInitial(attr, options) : item.css(attr));
                if (!isNaN(value)) {
                    if (last) {
                        if (value >= max) {
                            result = item;
                            max = value;
                        }
                    } else if (value > max) {
                        result = item;
                        max = value;
                    }
                }
            });
            return result || this;
        }
        querySelector(value) {
            return this.querySelectorAll(value, undefined, 1)[0] || null;
        }
        querySelectorAll(value, customMap, resultCount = -1) {
            const queryMap = customMap || this.queryMap;
            let result = [];
            if (queryMap && resultCount !== 0) {
                const queries = parseSelectorText$1(value);
                for (let i = 0, length = queries.length; i < length; ++i) {
                    const query = queries[i];
                    const selectors = [];
                    let offset = -1;
                    if (query === '*') {
                        selectors.push({ all: true });
                        ++offset;
                    } else {
                        invalid: {
                            let adjacent = '',
                                segment,
                                all,
                                match;
                            while ((match = SELECTOR_G.exec(query))) {
                                segment = match[1];
                                all = false;
                                if (segment.length === 1) {
                                    const ch = segment[0];
                                    switch (ch) {
                                        case '+':
                                        case '~':
                                            --offset;
                                        case '>':
                                            if (adjacent !== '' || selectors.length === 0) {
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
                                        attrList || (attrList = []);
                                        let key = subMatch[1].replace('\\:', ':'),
                                            endsWith;
                                        switch (key.indexOf('|')) {
                                            case -1:
                                                break;
                                            case 1:
                                                if (key[0] === '*') {
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
                                                (notList || (notList = [])).push(subMatch[1]);
                                            }
                                        } else {
                                            (pseudoList || (pseudoList = [])).push(pseudoClass);
                                        }
                                        segment = spliceString(segment, subMatch.index, pseudoClass.length);
                                    }
                                    while ((subMatch = SELECTOR_LABEL.exec(segment))) {
                                        const label = subMatch[0];
                                        switch (label[0]) {
                                            case '#':
                                                id = label.substring(1);
                                                break;
                                            case '.':
                                                (classList || (classList = [])).push(label.substring(1));
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
                                adjacent = '';
                            }
                        }
                        SELECTOR_G.lastIndex = 0;
                    }
                    if (customMap) {
                        offset = 0;
                    }
                    const q = queryMap.length;
                    let r = selectors.length;
                    if (r && offset !== -1 && offset < q) {
                        const dataEnd = selectors.pop();
                        --r;
                        const lastEnd = r === 0;
                        const currentCount = result.length;
                        let pending;
                        if (dataEnd.all && q - offset === 1) {
                            pending = queryMap[offset];
                        } else {
                            pending = [];
                            for (let j = offset; j < q; ++j) {
                                const children = queryMap[j];
                                if (dataEnd.all) {
                                    pending = pending.concat(children);
                                } else {
                                    for (let k = 0, s = children.length; k < s; ++k) {
                                        const node = children[k];
                                        if (
                                            (currentCount === 0 || !result.includes(node)) &&
                                            validateQuerySelector(this, node, dataEnd, lastEnd)
                                        ) {
                                            pending.push(node);
                                        }
                                    }
                                }
                            }
                        }
                        const s = pending.length;
                        if (r && (dataEnd.adjacent || resultCount !== -Infinity)) {
                            if (r > 1) {
                                selectors.reverse();
                            }
                            let count = currentCount;
                            for (let j = 0; j < s; ++j) {
                                const node = pending[j];
                                if (
                                    (currentCount === 0 || !result.includes(node)) &&
                                    ascendQuerySelector(this, selectors, i, 0, [node], dataEnd.adjacent)
                                ) {
                                    result.push(node);
                                    if (++count === resultCount) {
                                        return result.sort(sortById);
                                    }
                                }
                            }
                        } else if (currentCount === 0) {
                            if (i === queries.length - 1 || (resultCount > 0 && resultCount <= s)) {
                                if (resultCount > 0 && s > resultCount) {
                                    pending.length = resultCount;
                                }
                                return pending.sort(sortById);
                            } else {
                                result = pending;
                            }
                        } else {
                            let count = currentCount;
                            for (let j = 0; j < s; ++j) {
                                const node = pending[j];
                                if (currentCount === 0 || !result.includes(node)) {
                                    result.push(node);
                                    if (resultCount > 0 && ++count === resultCount) {
                                        return result.sort(sortById);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return result.sort(sortById);
        }
        ancestors(value, options) {
            const result = this.ascend(options);
            if (value && result.length) {
                const customMap = [];
                let depth = NaN;
                iterateReverseArray(result, item => {
                    if (!isNaN(depth)) {
                        for (let i = item.depth - 1; i > depth; --i) {
                            customMap.push([]);
                        }
                    }
                    customMap.push([item]);
                    depth = item.depth;
                });
                return this.querySelectorAll(value, customMap, -Infinity);
            }
            return result.sort(sortById);
        }
        descendants(value, options) {
            if (this.naturalElements.length) {
                if (options || !this.queryMap) {
                    const children = this.descend(options).filter(item => item.naturalElement);
                    let length = children.length;
                    if (value && length) {
                        const result = [];
                        const depth = this.depth + 1;
                        let index;
                        for (let i = 0; i < length; ++i) {
                            const item = children[i];
                            index = item.depth - depth;
                            (result[index] || (result[index] = [])).push(item);
                        }
                        length = result.length;
                        for (let i = 0; i < length; ++i) {
                            if (!result[i]) {
                                result[i] = [];
                            }
                        }
                        return this.querySelectorAll(value, result);
                    }
                    return children.sort(sortById);
                }
                return this.querySelectorAll(value || '*');
            }
            return [];
        }
        siblings(value, options) {
            if (this.naturalElement) {
                let condition, error, every, including, excluding, reverse;
                if (options) {
                    ({ condition, error, every, including, excluding, reverse } = options);
                }
                let result = [];
                const filterPredicate = item => {
                    if ((error && error(item)) || item === excluding) {
                        return true;
                    }
                    if (condition) {
                        if (condition(item)) {
                            result.push(item);
                            if (!every) {
                                return true;
                            }
                        }
                    } else {
                        result.push(item);
                    }
                    return item === including;
                };
                if (reverse) {
                    iterateReverseArray(this.actualParent.naturalElements, filterPredicate, 0, this.childIndex);
                } else {
                    iterateArray(this.actualParent.naturalElements, filterPredicate, this.childIndex + 1);
                }
                if (value) {
                    const ancestors = this.ascend();
                    const customMap = [];
                    iterateReverseArray(ancestors, item => {
                        customMap.push([item]);
                    });
                    customMap.push(result);
                    result = this.querySelectorAll(value, customMap).filter(item => !ancestors.includes(item));
                }
                return reverse && result.length > 1 ? result.reverse() : result;
            }
            return [];
        }
        valueOf(attr, options) {
            return this._preferInitial
                ? this.cssInitial(attr, options)
                : this._styleMap[attr] || (options && options.computed && this.style[attr]) || '';
        }
        set parent(value) {
            if (value) {
                const parent = this._parent;
                if (value !== parent) {
                    if (parent) {
                        parent.remove(this);
                    }
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
            const result = this._cache.tagName;
            if (result === undefined) {
                const element = this._element;
                return (this._cache.tagName = element
                    ? element.nodeName[0] === '#'
                        ? element.nodeName
                        : element.tagName
                    : '');
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
            const result = this._cacheState.htmlElement;
            return result === undefined
                ? (this._cacheState.htmlElement = this._element instanceof HTMLElement)
                : result;
        }
        get svgElement() {
            const result = this._cacheState.svgElement;
            return result === undefined
                ? (this._cacheState.svgElement =
                      (!this.htmlElement && this._element instanceof SVGElement) ||
                      (this.imageElement && FILE$1.SVG.test(this.toElementString('src'))))
                : result;
        }
        get styleElement() {
            const result = this._cacheState.styleElement;
            return result === undefined ? (this._cacheState.styleElement = !!this._element && !this.plainText) : result;
        }
        get naturalChild() {
            return true;
        }
        get naturalElement() {
            const result = this._cacheState.naturalElement;
            return result === undefined
                ? (this._cacheState.naturalElement = this.naturalChild && this.styleElement && !this.pseudoElement)
                : result;
        }
        get parentElement() {
            var _a;
            return this._element
                ? this._element.parentElement
                : ((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.element) || null;
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
            return this.tagName[0] === '#';
        }
        get styleText() {
            return this.naturalElement && this.inlineText;
        }
        get lineBreak() {
            return this.tagName === 'BR';
        }
        get positionRelative() {
            return this.valueOf('position') === 'relative';
        }
        get display() {
            return this.css('display');
        }
        get float() {
            return (this.pageFlow && this.css('float')) || 'none';
        }
        get floating() {
            return this.float !== 'none';
        }
        get zIndex() {
            return this.toInt('zIndex', 0);
        }
        get textContent() {
            return this.naturalChild && !this.svgElement ? this._element.textContent : '';
        }
        get dataset() {
            return this._dataset || (this._dataset = this.styleElement ? this._element.dataset : {});
        }
        get documentBody() {
            return this._element === document.body;
        }
        get bounds() {
            return this._bounds || this.setBounds(false) || newBoxRectDimension();
        }
        get linear() {
            if (!this._linear) {
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
            if (!this._box) {
                const bounds = this.bounds;
                if (bounds) {
                    if (this.styleElement && this.naturalChildren.length) {
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
            const result = this._cache.flexdata;
            if (result === undefined) {
                if (this.flexElement) {
                    const { flexWrap, flexDirection, alignContent, justifyContent } = this.cssAsObject(
                        'flexWrap',
                        'flexDirection',
                        'alignContent',
                        'justifyContent'
                    );
                    const row = flexDirection.startsWith('row');
                    return (this._cache.flexdata = {
                        row,
                        column: !row,
                        reverse: flexDirection.endsWith('reverse'),
                        wrap: flexWrap.startsWith('wrap'),
                        wrapReverse: flexWrap === 'wrap-reverse',
                        alignContent,
                        justifyContent,
                    });
                }
                return (this._cache.flexdata = {});
            }
            return result;
        }
        get flexbox() {
            var _a;
            const result = this._cache.flexbox;
            if (result === undefined) {
                if (
                    this.styleElement &&
                    ((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.flexElement)
                ) {
                    const [alignSelf, justifySelf, basis] = this.cssAsTuple('alignSelf', 'justifySelf', 'flexBasis');
                    return (this._cache.flexbox = {
                        alignSelf: alignSelf === 'auto' ? this.cssParent('alignItems') : alignSelf,
                        justifySelf: justifySelf === 'auto' ? this.cssParent('justifyItems') : justifySelf,
                        basis,
                        grow: getFlexValue(this, 'flexGrow', 0),
                        shrink: getFlexValue(this, 'flexShrink', 1),
                        order: this.toInt('order', 0),
                    });
                }
                return (this._cache.flexbox = {});
            }
            return result;
        }
        get width() {
            const result = this._cache.width;
            return result === undefined ? (this._cache.width = setDimension(this, this._styleMap, 'width')) : result;
        }
        get height() {
            const result = this._cache.height;
            return result === undefined ? (this._cache.height = setDimension(this, this._styleMap, 'height')) : result;
        }
        get hasWidth() {
            const result = this._cache.hasWidth;
            return result === undefined ? (this._cache.hasWidth = this.width > 0) : result;
        }
        get hasHeight() {
            var _a;
            const result = this._cache.hasHeight;
            return result === undefined
                ? (this._cache.hasHeight = isPercent(this.valueOf('height'))
                      ? this.pageFlow
                          ? ((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.hasHeight) ||
                            this.documentBody
                          : this.valueOf('position') === 'fixed' || this.hasPX('top') || this.hasPX('bottom')
                      : this.height > 0 || this.hasPX('height', { percent: false }))
                : result;
        }
        get lineHeight() {
            let result = this._cache.lineHeight;
            if (result === undefined) {
                if (!this.imageElement && !this.svgElement) {
                    let hasOwnStyle = this.has('lineHeight'),
                        value = 0;
                    if (hasOwnStyle) {
                        let lineHeight = this.css('lineHeight');
                        if (lineHeight === 'inherit') {
                            lineHeight = this.cssAscend('lineHeight', { initial: true });
                        }
                        value = parseLineHeight(lineHeight, this.fontSize);
                    } else {
                        let parent = this.ascend({
                            condition: item => item.has('lineHeight', { initial: true, not: 'inherit' }),
                        })[0];
                        if (parent) {
                            value = parseLineHeight(parent.css('lineHeight'), this.fontSize);
                            if (value) {
                                if (
                                    parent !== this.actualParent ||
                                    REGEXP_EM.test(this.valueOf('fontSize')) ||
                                    this.multiline
                                ) {
                                    this.css('lineHeight', value + 'px');
                                }
                                hasOwnStyle = true;
                            }
                        }
                        if (value === 0) {
                            parent = this.ascend({ condition: item => item.lineHeight > 0 })[0];
                            if (parent) {
                                value = parent.lineHeight;
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
                }
                return (this._cache.lineHeight = result || 0);
            }
            return result;
        }
        get positionStatic() {
            let result = this._cache.positionStatic;
            if (result === undefined) {
                switch (this.valueOf('position')) {
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
                        this._cache.positionRelative = !result;
                        break;
                    default:
                        result = true;
                        break;
                }
                this._cache.positionStatic = result;
            }
            return result;
        }
        get top() {
            const result = this._cache.top;
            return result === undefined ? (this._cache.top = convertPosition(this, 'top')) : result;
        }
        get right() {
            const result = this._cache.right;
            return result === undefined ? (this._cache.right = convertPosition(this, 'right')) : result;
        }
        get bottom() {
            const result = this._cache.bottom;
            return result === undefined ? (this._cache.bottom = convertPosition(this, 'bottom')) : result;
        }
        get left() {
            const result = this._cache.left;
            return result === undefined ? (this._cache.left = convertPosition(this, 'left')) : result;
        }
        get marginTop() {
            const result = this._cache.marginTop;
            return result === undefined
                ? (this._cache.marginTop = this.inlineStatic ? 0 : convertBox(this, 'marginTop', true))
                : result;
        }
        get marginRight() {
            const result = this._cache.marginRight;
            return result === undefined ? (this._cache.marginRight = convertBox(this, 'marginRight', true)) : result;
        }
        get marginBottom() {
            const result = this._cache.marginBottom;
            return result === undefined
                ? (this._cache.marginBottom = this.inlineStatic ? 0 : convertBox(this, 'marginBottom', true))
                : result;
        }
        get marginLeft() {
            const result = this._cache.marginLeft;
            return result === undefined ? (this._cache.marginLeft = convertBox(this, 'marginLeft', true)) : result;
        }
        get borderTopWidth() {
            const result = this._cache.borderTopWidth;
            return result === undefined
                ? (this._cache.borderTopWidth = convertBorderWidth(this, 'height', BORDER_TOP))
                : result;
        }
        get borderRightWidth() {
            const result = this._cache.borderRightWidth;
            return result === undefined
                ? (this._cache.borderRightWidth = convertBorderWidth(this, 'height', BORDER_RIGHT))
                : result;
        }
        get borderBottomWidth() {
            const result = this._cache.borderBottomWidth;
            return result === undefined
                ? (this._cache.borderBottomWidth = convertBorderWidth(this, 'width', BORDER_BOTTOM))
                : result;
        }
        get borderLeftWidth() {
            const result = this._cache.borderLeftWidth;
            return result === undefined
                ? (this._cache.borderLeftWidth = convertBorderWidth(this, 'width', BORDER_LEFT))
                : result;
        }
        get outlineWidth() {
            const result = this._cache.outlineWidth;
            return result === undefined
                ? (this._cache.outlineWidth = convertBorderWidth(this, 'width', BORDER_OUTLINE))
                : result;
        }
        get paddingTop() {
            const result = this._cache.paddingTop;
            return result === undefined ? (this._cache.paddingTop = convertBox(this, 'paddingTop', false)) : result;
        }
        get paddingRight() {
            const result = this._cache.paddingRight;
            return result === undefined ? (this._cache.paddingRight = convertBox(this, 'paddingRight', false)) : result;
        }
        get paddingBottom() {
            const result = this._cache.paddingBottom;
            return result === undefined
                ? (this._cache.paddingBottom = convertBox(this, 'paddingBottom', false))
                : result;
        }
        get paddingLeft() {
            const result = this._cache.paddingLeft;
            return result === undefined ? (this._cache.paddingLeft = convertBox(this, 'paddingLeft', false)) : result;
        }
        get contentBox() {
            return this.css('boxSizing') !== 'border-box' || (this.tableElement && isUserAgent$1(4 /* FIREFOX */));
        }
        get contentBoxWidth() {
            const result = this._cache.contentBoxWidth;
            return result === undefined
                ? (this._cache.contentBoxWidth =
                      this.tableElement && this.valueOf('borderCollapse') === 'collapse'
                          ? 0
                          : this.borderLeftWidth + this.paddingLeft + this.paddingRight + this.borderRightWidth)
                : result;
        }
        get contentBoxHeight() {
            const result = this._cache.contentBoxHeight;
            return result === undefined
                ? (this._cache.contentBoxHeight =
                      this.tableElement && this.valueOf('borderCollapse') === 'collapse'
                          ? 0
                          : this.borderTopWidth + this.paddingTop + this.paddingBottom + this.borderBottomWidth)
                : result;
        }
        get inline() {
            const result = this._cache.inline;
            return result === undefined ? (this._cache.inline = this.display === 'inline') : result;
        }
        get inlineStatic() {
            const result = this._cache.inlineStatic;
            return result === undefined
                ? (this._cache.inlineStatic = this.inline && this.pageFlow && !this.floating && !this.imageElement)
                : result;
        }
        set inlineText(value) {
            switch (this.tagName) {
                case 'IMG':
                case 'INPUT':
                case 'SELECT':
                case 'TEXTAREA':
                case 'svg':
                case 'BR':
                case 'HR':
                case 'PROGRESS':
                case 'METER':
                case 'CANVAS':
                    this._cacheState.inlineText = false;
                    break;
                case 'BUTTON':
                    this._cacheState.inlineText = this.textContent.trim() !== '';
                    break;
                default:
                    this._cacheState.inlineText = value;
                    break;
            }
        }
        get inlineText() {
            var _a;
            return (_a = this._cacheState.inlineText) !== null && _a !== void 0 ? _a : false;
        }
        get block() {
            let result = this._cache.block;
            if (result === undefined) {
                switch (this.display) {
                    case 'block':
                    case 'flex':
                    case 'grid':
                    case 'list-item':
                        result = true;
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
                this._cache.block = result;
            }
            return result;
        }
        get blockStatic() {
            const result = this._cache.blockStatic;
            if (result === undefined) {
                const pageFlow = this.pageFlow;
                if (pageFlow && ((this.block && !this.floating) || this.lineBreak)) {
                    return (this._cache.blockStatic = true);
                } else if (
                    !pageFlow ||
                    (!this.inline && !this.display.startsWith('table-') && !this.hasPX('maxWidth'))
                ) {
                    const width = this.valueOf('width');
                    const minWidth = this.valueOf('minWidth');
                    let percent = 0;
                    if (isPercent(width)) {
                        percent = parseFloat(width);
                    }
                    if (isPercent(minWidth)) {
                        percent = Math.max(parseFloat(minWidth), percent);
                    }
                    if (percent) {
                        const marginLeft = this.valueOf('marginLeft');
                        const marginRight = this.valueOf('marginRight');
                        return (this._cache.blockStatic =
                            percent +
                                (isPercent(marginLeft) ? Math.max(0, parseFloat(marginLeft)) : 0) +
                                (isPercent(marginRight) ? parseFloat(marginRight) : 0) >=
                            100);
                    }
                }
                return (this._cache.blockStatic = false);
            }
            return result;
        }
        get pageFlow() {
            const result = this._cache.pageFlow;
            return result === undefined
                ? (this._cache.pageFlow = this.positionStatic || this.positionRelative || this.lineBreak)
                : result;
        }
        get centerAligned() {
            const result = this._cache.centerAligned;
            return result === undefined
                ? (this._cache.centerAligned = !this.pageFlow
                      ? this.hasPX('left') && this.hasPX('right')
                      : this.autoMargin.leftRight || (canTextAlign(this) && hasTextAlign(this, 'center')))
                : result;
        }
        get rightAligned() {
            const result = this._cache.rightAligned;
            return result === undefined
                ? (this._cache.rightAligned = !this.pageFlow
                      ? this.hasPX('right') && !this.hasPX('left')
                      : this.float === 'right' ||
                        this.autoMargin.left ||
                        (canTextAlign(this) && hasTextAlign(this, 'right', this.dir === 'rtl' ? 'start' : 'end')))
                : result;
        }
        get bottomAligned() {
            var _a;
            const result = this._cache.bottomAligned;
            return result === undefined
                ? (this._cache.bottomAligned = !this.pageFlow
                      ? this.hasPX('bottom') && !this.hasPX('top')
                      : !!(
                            ((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.hasHeight) &&
                            this.autoMargin.top
                        ))
                : result;
        }
        get autoMargin() {
            const result = this._cache.autoMargin;
            if (result === undefined) {
                if (!this.pageFlow || this.blockStatic || this.display === 'table') {
                    const styleMap = this._styleMap;
                    const left = styleMap.marginLeft === 'auto' && (this.pageFlow || this.hasPX('right'));
                    const right = styleMap.marginRight === 'auto' && (this.pageFlow || this.hasPX('left'));
                    const top = styleMap.marginTop === 'auto' && (this.pageFlow || this.hasPX('bottom'));
                    const bottom = styleMap.marginBottom === 'auto' && (this.pageFlow || this.hasPX('top'));
                    return (this._cache.autoMargin = {
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
                return (this._cache.autoMargin = {});
            }
            return result;
        }
        get baseline() {
            const result = this._cache.baseline;
            if (result === undefined) {
                if (this.pageFlow && !this.floating && !this.tableElement) {
                    const display = this.display;
                    if (display.startsWith('inline') || display === 'list-item') {
                        const value = this.css('verticalAlign');
                        return (this._cache.baseline = value === 'baseline' || !isNaN(parseFloat(value)));
                    }
                }
                return (this._cache.baseline = false);
            }
            return result;
        }
        get verticalAlign() {
            let result = this._cache.verticalAlign;
            if (result === undefined) {
                const value = this.css('verticalAlign');
                if (value !== 'baseline' && this.pageFlow) {
                    if (value.endsWith('px')) {
                        result = parseFloat(value);
                    } else if (isLength(value)) {
                        result = this.parseUnit(value);
                    } else if (this.styleElement) {
                        let valid;
                        switch (value) {
                            case 'baseline':
                                break;
                            case 'text-top':
                                if (this.imageElement || this.svgElement) {
                                    break;
                                }
                            case 'sub':
                            case 'super':
                            case 'text-bottom':
                            case 'middle':
                            case 'top':
                            case 'bottom':
                                valid = true;
                                break;
                            default:
                                valid = isPercent(value);
                                break;
                        }
                        if (valid && this.cssTry('vertical-align', 'baseline')) {
                            const bounds = this.boundingClientRect;
                            if (bounds) {
                                result = bounds.top - this.bounds.top;
                            }
                            this.cssFinally('vertical-align');
                        }
                    }
                }
                return (this._cache.verticalAlign = result || 0);
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
                        return (this._textBounds = getRangeClientRect(this._element));
                    } else if (!this.isEmpty()) {
                        const children = this.naturalChildren;
                        const length = children.length;
                        if (length) {
                            let top = Infinity,
                                right = -Infinity,
                                bottom = -Infinity,
                                left = Infinity,
                                numberOfLines = 0;
                            for (let i = 0; i < length; ++i) {
                                const node = children[i];
                                if (node.textElement) {
                                    const rect = node.textBounds;
                                    if (rect) {
                                        numberOfLines +=
                                            rect.numberOfLines ||
                                            (top === Infinity ||
                                            rect.top >= bottom ||
                                            Math.floor(rect.right - rect.left) > Math.ceil(rect.width)
                                                ? 1
                                                : 0);
                                        top = Math.min(rect.top, top);
                                        right = Math.max(rect.right, right);
                                        left = Math.min(rect.left, left);
                                        bottom = Math.max(rect.bottom, bottom);
                                    }
                                }
                            }
                            if (numberOfLines) {
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
            const result = this._cache.multiline;
            return result === undefined
                ? (this._cache.multiline =
                      (this.plainText ||
                          (this.styleElement &&
                              this.inlineText &&
                              (this.inline ||
                                  this.naturalElements.length === 0 ||
                                  isInlineVertical(this.display) ||
                                  this.floating ||
                                  !this.pageFlow))) &&
                      ((_a = this.textBounds) === null || _a === void 0 ? void 0 : _a.numberOfLines) > 1)
                : result;
        }
        get backgroundColor() {
            let result = this._cache.backgroundColor;
            if (result === undefined) {
                if (!this.plainText) {
                    result = this.css('backgroundColor');
                    switch (result) {
                        case 'transparent':
                        case 'rgba(0, 0, 0, 0)':
                            if (this.inputElement) {
                                if (this.tagName !== 'BUTTON') {
                                    switch (this.toElementString('type')) {
                                        case 'button':
                                        case 'submit':
                                        case 'reset':
                                        case 'image':
                                            break;
                                        default:
                                            result = '';
                                            break;
                                    }
                                }
                            } else {
                                result = '';
                            }
                            break;
                        default:
                            if (
                                result !== '' &&
                                this.styleElement &&
                                this.pageFlow &&
                                !this.inputElement &&
                                this.css('opacity') === '1'
                            ) {
                                let parent = this.actualParent;
                                while (parent) {
                                    const backgroundImage = parent.valueOf('backgroundImage');
                                    if (backgroundImage === '' || backgroundImage === 'none') {
                                        const color = parent.backgroundColor;
                                        if (color !== '') {
                                            if (color === result && parent.css('opacity') === '1') {
                                                result = '';
                                            }
                                            break;
                                        }
                                        parent = parent.actualParent;
                                    } else {
                                        break;
                                    }
                                }
                            }
                            break;
                    }
                }
                return (this._cache.backgroundColor = result || '');
            }
            return result;
        }
        get backgroundImage() {
            const result = this._cache.backgroundImage;
            if (result === undefined) {
                let value = '';
                if (!this.plainText) {
                    value = this.css('backgroundImage');
                    if (value === 'none') {
                        value = '';
                    }
                }
                return (this._cache.backgroundImage = value);
            }
            return result;
        }
        get percentWidth() {
            const result = this._cache.percentWidth;
            if (result === undefined) {
                const value = this.valueOf('width');
                return (this._cache.percentWidth = isPercent(value) ? parseFloat(value) / 100 : 0);
            }
            return result;
        }
        get percentHeight() {
            var _a;
            const result = this._cache.percentHeight;
            if (result === undefined) {
                const value = this.valueOf('height');
                return (this._cache.percentHeight =
                    isPercent(value) &&
                    (((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.hasHeight) ||
                        this.valueOf('position') === 'fixed')
                        ? parseFloat(value) / 100
                        : 0);
            }
            return result;
        }
        get visibleStyle() {
            const result = this._cache.visibleStyle;
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
                            const [repeatX, repeatY] = splitPair$1(repeat.trim(), ' ');
                            backgroundRepeatX || (backgroundRepeatX = repeatX === 'repeat' || repeatX === 'repeat-x');
                            backgroundRepeatY ||
                                (backgroundRepeatY =
                                    repeatX === 'repeat' || repeatX === 'repeat-y' || repeatY === 'repeat');
                        }
                    }
                    return (this._cache.visibleStyle = {
                        background: borderWidth || backgroundImage || backgroundColor,
                        borderWidth,
                        backgroundImage,
                        backgroundColor,
                        backgroundRepeat: backgroundRepeatX || backgroundRepeatY,
                        backgroundRepeatX,
                        backgroundRepeatY,
                        outline: this.outlineWidth > 0,
                    });
                }
                return (this._cache.visibleStyle = {});
            }
            return result;
        }
        get absoluteParent() {
            let result = this._cacheState.absoluteParent;
            if (result === undefined) {
                result = this.actualParent;
                if (!this.pageFlow && !this.documentBody) {
                    while (result && result.css('position') === 'static' && !result.documentBody) {
                        result = result.actualParent;
                    }
                }
                this._cacheState.absoluteParent = result;
            }
            return result;
        }
        set actualParent(value) {
            this._cacheState.actualParent = value;
        }
        get actualParent() {
            var _a;
            const result = this._cacheState.actualParent;
            if (result === undefined) {
                const parentElement = (_a = this.element) === null || _a === void 0 ? void 0 : _a.parentElement;
                return (this._cacheState.actualParent =
                    (parentElement && getElementAsNode(parentElement, this.sessionId)) || this.parent);
            }
            return result;
        }
        get wrapperOf() {
            let node = this;
            do {
                switch (node.size()) {
                    case 0:
                        return node === this ? null : node;
                    case 1:
                        node = node.children[0];
                        break;
                    default:
                        return null;
                }
            } while (true);
        }
        get actualWidth() {
            var _a;
            let result = this._cache.actualWidth;
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
                    (this.inlineStatic && this.valueOf('width') === '') ||
                    this.display === 'table-cell' ||
                    ((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.flexdata.row)
                ) {
                    result = this.bounds.width;
                } else {
                    result = this.width;
                    if (result) {
                        if (this.contentBox && !this.tableElement) {
                            result += this.contentBoxWidth;
                        }
                    } else {
                        result = this.bounds.width;
                    }
                }
                this._cache.actualWidth = result;
            }
            return result;
        }
        get actualHeight() {
            var _a;
            let result = this._cache.actualHeight;
            if (result === undefined) {
                if (
                    (this.inlineStatic && this.valueOf('height') === '') ||
                    this.display === 'table-cell' ||
                    ((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.flexdata.column)
                ) {
                    result = this.bounds.height;
                } else {
                    result = this.height;
                    if (result) {
                        if (this.contentBox && !this.tableElement) {
                            result += this.contentBoxHeight;
                        }
                    } else {
                        result = this.bounds.height;
                    }
                }
                this._cache.actualHeight = result;
            }
            return result;
        }
        get actualDimension() {
            return { width: this.actualWidth, height: this.actualHeight };
        }
        set childIndex(value) {
            this._childIndex = value;
        }
        get childIndex() {
            return this._childIndex;
        }
        set naturalChildren(value) {
            this._naturalChildren = value;
        }
        get naturalChildren() {
            return this._naturalChildren || (this._naturalChildren = this.toArray());
        }
        set naturalElements(value) {
            this._naturalElements = value;
        }
        get naturalElements() {
            return (
                this._naturalElements ||
                (this._naturalElements = this.naturalChildren.filter(item => item.naturalElement))
            );
        }
        get firstChild() {
            return this.naturalElements[0] || null;
        }
        get lastChild() {
            const children = this.naturalElements;
            return children[children.length - 1] || null;
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
            let result = this._cacheState.attributes;
            if (result === undefined) {
                result = {};
                if (this.styleElement) {
                    const attributes = this._element.attributes;
                    for (let i = 0, length = attributes.length; i < length; ++i) {
                        const item = attributes.item(i);
                        result[item.name] = item.value;
                    }
                }
                this._cacheState.attributes = result;
            }
            return result;
        }
        get boundingClientRect() {
            if (this.styleElement) {
                return this._element.getBoundingClientRect();
            } else if (this.plainText && this.naturalChild) {
                const rect = getRangeClientRect(this._element);
                rect.x = rect.left;
                rect.y = rect.top;
                return rect;
            }
            return null;
        }
        get preserveWhiteSpace() {
            const result = this._cache.preserveWhiteSpace;
            if (result === undefined) {
                switch (this.css('whiteSpace')) {
                    case 'pre':
                    case 'pre-wrap':
                    case 'break-spaces':
                        return (this._cache.preserveWhiteSpace = true);
                    default:
                        return (this._cache.preserveWhiteSpace = false);
                }
            }
            return result;
        }
        get fontSize() {
            var _a, _b;
            let result = this._cache.fontSize;
            if (result === undefined) {
                if (this.naturalChild) {
                    if (this.styleElement) {
                        const fixedWidth = isFontFixedWidth(this);
                        let value = checkFontSizeValue(this.valueOf('fontSize'), fixedWidth),
                            emRatio = 1;
                        if (REGEXP_EM.test(value)) {
                            emRatio *= parseFloat(value);
                            value = 'inherit';
                        }
                        if (value === 'inherit') {
                            let parent = this.actualParent;
                            if (parent) {
                                do {
                                    if (parent.tagName === 'HTML') {
                                        value = '1rem';
                                        break;
                                    } else {
                                        const fontSize = parent.valueOf('fontSize');
                                        if (fontSize !== '' && fontSize !== 'inherit') {
                                            value = checkFontSizeValue(fontSize);
                                            if (isPercent(value)) {
                                                emRatio *= parseFloat(value) / 100;
                                            } else if (REGEXP_EM.test(value)) {
                                                emRatio *= parseFloat(value);
                                            } else {
                                                break;
                                            }
                                        }
                                        parent = parent.actualParent;
                                    }
                                } while (parent);
                            } else {
                                value = '1rem';
                            }
                        }
                        if (value === '1rem') {
                            result = getRemSize(fixedWidth);
                        } else if (value.endsWith('px')) {
                            result = parseFloat(value);
                        } else if (isPercent(value)) {
                            const parent = this.actualParent;
                            result = parent ? (parseFloat(value) / 100) * parent.fontSize : getRemSize();
                        } else {
                            result = parseUnit(value, fixedWidth ? { fixedWidth: true } : undefined);
                        }
                        result *= emRatio;
                    } else {
                        result = this.plainText ? this.actualParent.fontSize : getRemSize();
                    }
                } else {
                    const options = isFontFixedWidth(this) ? { fixedWidth: true } : undefined;
                    result =
                        parseUnit(this.css('fontSize'), options) ||
                        ((_b =
                            (_a = this.ascend({ condition: item => item.fontSize > 0 })[0]) === null || _a === void 0
                                ? void 0
                                : _a.fontSize) !== null && _b !== void 0
                            ? _b
                            : parseUnit('1rem', options));
                }
                this._cache.fontSize = result;
            }
            return result;
        }
        get style() {
            return (
                this._style ||
                (this._style = this.styleElement
                    ? !this.pseudoElt
                        ? getStyle(this._element)
                        : getStyle(this._element.parentElement, this.pseudoElt)
                    : PROXY_INLINESTYLE)
            );
        }
        get cssStyle() {
            return Object.assign({}, this._cssStyle);
        }
        get textStyle() {
            let result = this._cache.textStyle;
            if (result === undefined) {
                result = this.cssAsObject(...TEXT_STYLE);
                result.fontSize = 'inherit';
                this._cache.textStyle = result;
            }
            return result;
        }
        get elementData() {
            return this._elementData;
        }
        set dir(value) {
            this._cacheState.dir = value;
        }
        get dir() {
            let result = this._cacheState.dir;
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
                this._cacheState.dir = result;
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

    const settings = {
        builtInExtensions: [],
        createElementMap: true,
        createQuerySelectorMap: true,
        showErrorMessages: false,
    };

    let application = null;
    const appBase = {
        create() {
            application = new Application$1(1 /* VDOM */, Node, Controller);
            return {
                application,
                framework: 1 /* VDOM */,
                userSettings: Object.assign({}, settings),
            };
        },
        cached() {
            if (application) {
                return {
                    application,
                    framework: 1 /* VDOM */,
                    userSettings: application.userSettings,
                };
            }
            return this.create();
        },
    };

    return appBase;
});
