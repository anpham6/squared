/* vdom-lite-framework 2.2.6
   https://github.com/anpham6/squared */

var vdom = (function () {
    'use strict';

    class NodeList extends squared.lib.base.Container {
        constructor(children, sessionId = '') {
            super(children);
            this.sessionId = sessionId;
        }
        add(node, delegate, cascade, remove) {
            super.add(node);
            if (delegate && this.afterAdd) {
                this.afterAdd(node, cascade, remove);
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
    const { isUserAgent } = squared.lib.client;
    const { CSS_PROPERTIES, checkMediaRule, getSpecificity, insertStyleSheetRule, getPropertiesAsTraits, parseKeyframes, parseSelectorText } = squared.lib.css;
    const { getElementCache, newSessionInit, resetSessionAll, setElementCache } = squared.lib.session;
    const { capitalize, convertCamelCase, isEmptyString, parseMimeType, resolvePath, splitPair, splitPairStart, trimBoth } = squared.lib.util;
    const REGEXP_IMPORTANT = /\s*([a-z-]+):[^!;]+!important;/g;
    const REGEXP_FONTFACE = /\s*@font-face\s*{([^}]+)}/;
    const REGEXP_FONTSRC = /\s*src:\s*([^;]+);/;
    const REGEXP_FONTFAMILY = /\s*font-family:\s*([^;]+);/;
    const REGEXP_FONTSTYLE = /\s*font-style:\s*(\w+)\s*;/;
    const REGEXP_FONTWEIGHT = /\s*font-weight:\s*(\d+)\s*;/;
    const REGEXP_FONTURL = /\s*(url|local)\((?:"((?:[^"]|\\")+)"|([^)]+))\)(?:\s*format\("?([\w-]+)"?\))?/;
    const REGEXP_DATAURI = new RegExp(`\\s*url\\("?(${STRING.DATAURI})"?\\)`, 'g');
    const REGEXP_CSSHOST = /^:(host|host-context)\(\s*([^)]+)\s*\)/;
    const CSS_SHORTHANDNONE = getPropertiesAsTraits(2 /* SHORTHAND */ | 64 /* NONE */);
    class Application {
        constructor(framework, nodeConstructor, ControllerConstructor, ExtensionManagerConstructor, ResourceConstructor) {
            this.framework = framework;
            this.extensions = [];
            this.closed = false;
            this.elementMap = new WeakMap();
            this.session = {
                active: new Map()
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
                }
                else {
                    untagged.push(ext);
                }
            }
            return result.length ? result.filter(item => item).concat(untagged) : extensions;
        }
        finalize() { return true; }
        afterCreateCache(node) {
            if (this.userSettings.createElementMap) {
                const elementMap = this.elementMap;
                this.getProcessingCache(node.sessionId).each(item => elementMap.set(item.element, item));
            }
        }
        createNode(sessionId, options) {
            return this.createNodeStatic(sessionId, options.element);
        }
        createNodeStatic(sessionId, element) {
            const afterInsertNode = this.getProcessing(sessionId).afterInsertNode;
            const node = new this.Node(this.nextId, sessionId, element);
            this._afterInsertNode(node);
            if (afterInsertNode) {
                afterInsertNode.some(item => item.afterInsertNode(node));
            }
            return node;
        }
        copyTo(directory, options) {
            var _a;
            return ((_a = this.fileHandler) === null || _a === void 0 ? void 0 : _a.copyTo(directory, options)) || reject(OPERATION_NOT_SUPPORTED);
        }
        appendTo(pathname, options) {
            var _a;
            return ((_a = this.fileHandler) === null || _a === void 0 ? void 0 : _a.appendTo(pathname, options)) || reject(OPERATION_NOT_SUPPORTED);
        }
        saveAs(filename, options) {
            var _a;
            return ((_a = this.fileHandler) === null || _a === void 0 ? void 0 : _a.saveAs(filename || this.resourceHandler.userSettings.outputArchiveName, options)) || reject(OPERATION_NOT_SUPPORTED);
        }
        saveFiles(format, options) {
            var _a;
            return ((_a = this.fileHandler) === null || _a === void 0 ? void 0 : _a.saveFiles(format, options)) || reject(OPERATION_NOT_SUPPORTED);
        }
        appendFiles(filename, options) {
            var _a;
            return ((_a = this.fileHandler) === null || _a === void 0 ? void 0 : _a.appendFiles(filename, options)) || reject(OPERATION_NOT_SUPPORTED);
        }
        copyFiles(directory, options) {
            var _a;
            return ((_a = this.fileHandler) === null || _a === void 0 ? void 0 : _a.copyFiles(directory, options)) || reject(OPERATION_NOT_SUPPORTED);
        }
        reset() {
            var _a;
            this._nextId = 0;
            this.elementMap = new WeakMap();
            resetSessionAll();
            this.session.active.clear();
            this.controllerHandler.reset();
            (_a = this.resourceHandler) === null || _a === void 0 ? void 0 : _a.reset();
            for (const ext of this.extensions) {
                ext.reset();
            }
            this.closed = false;
        }
        parseDocument(...elements) {
            const resource = this.resourceHandler;
            let preloadImages, preloadFonts, preloadCustomElements = true;
            if (resource) {
                ({ preloadImages, preloadFonts, preloadCustomElements } = resource.userSettings);
            }
            const [rootElements, processing, shadowElements, styleSheets] = this.createSessionThread(elements, this.userSettings.pierceShadowRoot && preloadCustomElements);
            if (rootElements.size === 0) {
                return reject(DOCUMENT_ROOT_NOT_FOUND);
            }
            const documentRoot = rootElements.values().next().value;
            const preloadItems = [];
            let preloaded;
            const parseSrcSet = (value) => {
                if (value) {
                    for (const uri of value.split(',')) {
                        resource.addImageData(resolvePath(splitPairStart(uri.trim(), ' ')));
                    }
                }
            };
            if (resource) {
                for (const element of shadowElements) {
                    element.querySelectorAll('picture > source').forEach((source) => parseSrcSet(source.srcset));
                    element.querySelectorAll('video').forEach((source) => resource.addImageData(source.poster));
                    element.querySelectorAll('input[type=image]').forEach((image) => resource.addImageData(image.src, image.width, image.height));
                    element.querySelectorAll('object, embed').forEach((source) => {
                        const src = source.data || source.src;
                        if (src && (source.type.startsWith('image/') || parseMimeType(src).startsWith('image/'))) {
                            resource.addImageData(src.trim());
                        }
                    });
                    element.querySelectorAll('svg use').forEach((use) => {
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
                    }
                    else if (item.width === 0 || item.height === 0) {
                        const element = document.createElement('img');
                        element.src = uri;
                        if (element.naturalWidth && element.naturalHeight) {
                            item.width = element.naturalWidth;
                            item.height = element.naturalHeight;
                        }
                        else {
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
                        }
                        else if (item.content) {
                            src += item.content;
                        }
                        else {
                            continue;
                        }
                        const element = document.createElement('img');
                        element.src = src;
                        const { naturalWidth: width, naturalHeight: height } = element;
                        if (width && height) {
                            item.width = width;
                            item.height = height;
                            image.set(data[0], { width, height, uri: item.filename });
                        }
                        else {
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
                for (const element of shadowElements) {
                    element.querySelectorAll('img').forEach((image) => {
                        parseSrcSet(image.srcset);
                        if (!preloadImages) {
                            resource.addImage(image);
                        }
                        else if (FILE.SVG.test(image.src)) {
                            preloadItems.push(image.src);
                        }
                        else if (image.complete) {
                            resource.addImage(image);
                        }
                        else {
                            preloadItems.push(image);
                        }
                    });
                }
            }
            if (styleSheets) {
                preloadItems.push(...styleSheets);
            }
            if (preloadItems.length) {
                processing.initializing = true;
                return Promise.all(preloadItems.map(item => {
                    return new Promise((success, error) => {
                        if (typeof item === 'string') {
                            fetch(item)
                                .then(async (result) => {
                                const mimeType = result.headers.get('content-type') || '';
                                if (mimeType.startsWith('text/css') || styleSheets && styleSheets.includes(item)) {
                                    success({ mimeType: 'text/css', encoding: 'utf8', data: await result.text() });
                                }
                                else if (mimeType.startsWith('image/svg+xml') || FILE.SVG.test(item)) {
                                    success({ mimeType: 'image/svg+xml', encoding: 'utf8', data: await result.text() });
                                }
                                else {
                                    success({ mimeType: result.headers.get('content-type') || 'font/' + (splitPair(item, '.', false, true)[1].toLowerCase() || 'ttf'), data: await result.arrayBuffer() });
                                }
                            })
                                .catch(() => error(item));
                        }
                        else {
                            item.addEventListener('load', () => success(item));
                            item.addEventListener('error', () => error(item));
                        }
                    });
                }))
                    .then((result) => {
                    for (let i = 0, length = result.length; i < length; ++i) {
                        if (result[i]) {
                            const item = preloadItems[i];
                            if (typeof item === 'string') {
                                resource.addRawData(item, '', '', result[i]);
                            }
                            else {
                                resource.addImage(item);
                            }
                        }
                    }
                    return this.resumeSessionThread(rootElements, processing, elements.length, documentRoot, preloaded);
                })
                    .catch((error) => {
                    let message;
                    if (error instanceof Error) {
                        message = error.message;
                    }
                    else {
                        if (error instanceof Event) {
                            error = error.target;
                        }
                        if (error instanceof HTMLImageElement) {
                            message = error.src;
                        }
                    }
                    return !message || !this.userSettings.showErrorMessages || confirm(`FAIL: ${message}`) ? this.resumeSessionThread(rootElements, processing, elements.length, documentRoot, preloaded) : Promise.reject(new Error(message));
                });
            }
            return Promise.resolve(this.resumeSessionThread(rootElements, processing, elements.length));
        }
        parseDocumentSync(...elements) {
            const sessionData = this.createSessionThread(elements, false);
            return this.resumeSessionThread(sessionData[0], sessionData[1], elements.length);
        }
        createCache(documentRoot, sessionId) {
            const node = this.createRootNode(documentRoot, sessionId);
            if (node) {
                this.controllerHandler.sortInitialCache(this.getProcessingCache(sessionId));
            }
            return node;
        }
        setStyleMap(sessionId, documentRoot = document, queryRoot) {
            const styleSheets = documentRoot.styleSheets;
            let errors;
            for (let i = 0, length = styleSheets.length; i < length; ++i) {
                const styleSheet = styleSheets[i];
                let mediaText;
                try {
                    mediaText = styleSheet.media.mediaText;
                }
                catch (_a) {
                }
                if (!mediaText || checkMediaRule(mediaText)) {
                    try {
                        this.applyStyleSheet(styleSheet, sessionId, documentRoot, queryRoot);
                    }
                    catch (err) {
                        (errors || (errors = [])).push(err.message);
                    }
                }
            }
            if (errors) {
                (this.userSettings.showErrorMessages ? alert : console.log)(CSS_CANNOT_BE_PARSED + '\n\n' + errors.join('\n\n'));
            }
        }
        replaceShadowRootSlots(shadowRoot) {
            shadowRoot.host.querySelectorAll('[slot]').forEach(hostChild => {
                const slot = shadowRoot.querySelector(`slot[name=${hostChild.slot}`);
                if (slot) {
                    const parentSlot = slot.parentElement;
                    if (parentSlot) {
                        const childNodes = parentSlot.childNodes;
                        for (let k = 0, q = childNodes.length; k < q; ++k) {
                            const item = childNodes[k];
                            if (item === slot) {
                                parentSlot.insertBefore(hostChild.cloneNode(true), item);
                                parentSlot.removeChild(item);
                            }
                        }
                    }
                }
            });
        }
        setExtensions(namespaces = this.userSettings.builtInExtensions) {
            const { builtInExtensions, extensions } = this;
            extensions.length = 0;
            for (let i = 0, length = namespaces.length; i < length; ++i) {
                let ext = builtInExtensions.get(namespaces[i]);
                if (ext) {
                    ext.application = this;
                    extensions.push(ext);
                }
                else {
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
            const processing = this.session.active.get(sessionId);
            return processing ? processing.cache : new NodeList();
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
            const node = this.cascadeParentNode(processing, rootElement, sessionId, 0, extensions.length ? extensions : null);
            if (node) {
                node.documentRoot = true;
                processing.node = node;
                if (rootElement === document.documentElement) {
                    processing.documentElement = node;
                }
                else {
                    let previousNode = node, currentElement = rootElement.parentElement, id = 0, depth = -1;
                    while (currentElement) {
                        const previousElement = previousNode.element;
                        const children = currentElement.children;
                        const length = children.length;
                        const elements = new Array(length);
                        const parent = new this.Node(id--, sessionId, currentElement, [previousNode]);
                        this._afterInsertNode(parent);
                        for (let i = 0; i < length; ++i) {
                            const element = children[i];
                            let child;
                            if (element === previousElement) {
                                child = previousNode;
                            }
                            else {
                                child = new this.Node(id--, sessionId, element);
                                this._afterInsertNode(child);
                            }
                            child.init(parent, depth + 1, i);
                            child.actualParent = parent;
                            elements[i] = child;
                        }
                        parent.naturalChildren = elements;
                        parent.naturalElements = elements;
                        if (currentElement === document.documentElement) {
                            processing.documentElement = parent;
                            break;
                        }
                        else {
                            currentElement = currentElement.parentElement;
                            previousNode = parent;
                            --depth;
                        }
                    }
                }
            }
            return node;
        }
        cascadeParentNode(processing, parentElement, sessionId, depth, extensions, shadowParent) {
            const node = this.insertNode(parentElement, sessionId);
            if (node) {
                const cache = processing.cache;
                if (depth === 0) {
                    cache.add(node);
                }
                if (this._preventNodeCascade(node)) {
                    return node;
                }
                const childDepth = depth + 1;
                const hostElement = parentElement.shadowRoot || parentElement;
                const childNodes = hostElement.childNodes;
                const length = childNodes.length;
                const children = [];
                const elements = [];
                const pierceShadowRoot = this.userSettings.pierceShadowRoot;
                let inlineText = true, plainText = false, j = 0;
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
                    }
                    else if (this._includeElement(element)) {
                        if (extensions) {
                            const use = this.getDatasetName('use', element);
                            (use ? Application.prioritizeExtensions(use, extensions) : extensions).some(item => item.beforeInsertNode(element, sessionId));
                        }
                        let shadowRoot;
                        if (pierceShadowRoot) {
                            shadowRoot = element.shadowRoot;
                            if (shadowRoot) {
                                this.setStyleMap(sessionId, shadowRoot);
                            }
                        }
                        child = (shadowRoot || element).childNodes.length ? this.cascadeParentNode(processing, element, sessionId, childDepth, extensions, shadowRoot || shadowParent) : this.insertNode(element, sessionId);
                        if (child) {
                            elements.push(child);
                            inlineText = false;
                        }
                    }
                    else {
                        child = this.insertNode(element, sessionId);
                        if (child) {
                            processing.excluded.add(child);
                        }
                    }
                    if (child) {
                        child.init(node, childDepth, j++);
                        child.actualParent = node;
                        if (shadowParent) {
                            child.shadowHost = shadowParent;
                        }
                        children.push(child);
                    }
                }
                node.naturalChildren = children;
                node.naturalElements = elements;
                if (hostElement !== parentElement) {
                    node.shadowRoot = true;
                }
                if (j > 0) {
                    node.inlineText = inlineText && plainText;
                    node.retainAs(children);
                    if (j > 1) {
                        cache.addAll(children);
                    }
                    else {
                        cache.add(children[0]);
                    }
                }
                if (elements.length && this.userSettings.createQuerySelectorMap) {
                    node.queryMap = this.createQueryMap(elements);
                }
            }
            return node;
        }
        visibleText(node, element) {
            return element.nodeName === '#text' && (!isEmptyString(element.textContent) || node.preserveWhiteSpace && (node.tagName !== 'PRE' || node.element.childElementCount === 0));
        }
        createQueryMap(elements) {
            const result = [elements];
            for (let i = 0, length = elements.length; i < length; ++i) {
                const childMap = elements[i].queryMap;
                if (childMap) {
                    for (let j = 0, k = 1, q = childMap.length; j < q; ++j, ++k) {
                        const items = result[k];
                        if (items) {
                            items.push(...childMap[j]);
                        }
                        else if (q === 1) {
                            result[k] = childMap[j];
                        }
                        else {
                            result[k] = childMap[j].slice(0);
                        }
                    }
                }
            }
            return result;
        }
        applyStyleRule(item, sessionId, documentRoot, queryRoot) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            const resource = this.resourceHandler;
            const styleSheetHref = ((_a = item.parentStyleSheet) === null || _a === void 0 ? void 0 : _a.href) || location.href;
            const cssText = item.cssText;
            switch (item.type) {
                case CSSRule.STYLE_RULE: {
                    const hostElement = documentRoot.host;
                    const unusedStyles = !hostElement && this.session.unusedStyles;
                    const baseMap = {};
                    const important = {};
                    const cssStyle = item.style;
                    const parseImageUrl = (attr) => {
                        const value = baseMap[attr];
                        if (value && value !== 'initial') {
                            let result, match;
                            while (match = REGEXP_DATAURI.exec(value)) {
                                if (match[2]) {
                                    if (resource) {
                                        const [mimeType, encoding] = match[2].trim().split(/\s*;\s*/);
                                        resource.addRawData(match[1], mimeType, match[3], { encoding });
                                    }
                                }
                                else {
                                    const uri = resolvePath(match[3], styleSheetHref);
                                    if (uri) {
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
                    const hasExactValue = (attr, value) => new RegExp(`\\s*${attr}\\s*:\\s*${value}\\s*;?`).test(cssText);
                    const hasPartialValue = (attr, value) => new RegExp(`\\s*${attr}\\s*:[^;]*?${value}[^;]*;?`).test(cssText);
                    const items = Array.from(cssStyle);
                    for (let i = 0, length = items.length; i < length; ++i) {
                        const attr = items[i];
                        if (attr[0] === '-') {
                            continue;
                        }
                        const baseAttr = convertCamelCase(attr);
                        let value = cssStyle[attr];
                        switch (value) {
                            case 'initial':
                                if (isUserAgent(2 /* SAFARI */) && baseAttr.startsWith('background')) {
                                    break;
                                }
                                if (((_b = CSS_PROPERTIES[baseAttr]) === null || _b === void 0 ? void 0 : _b.value) === 'auto') {
                                    value = 'auto';
                                    break;
                                }
                            case 'normal':
                                if (!hasExactValue(attr, value)) {
                                    required: {
                                        for (const name in CSS_SHORTHANDNONE) {
                                            const css = CSS_SHORTHANDNONE[name];
                                            if (css.value.includes(baseAttr)) {
                                                if (hasExactValue(css.name, 'none|initial') || value === 'initial' && hasPartialValue(css.name, 'initial') || css.valueOfNone && hasExactValue(css.name, css.valueOfNone)) {
                                                    break required;
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
                    while (match = REGEXP_IMPORTANT.exec(cssText)) {
                        const attr = convertCamelCase(match[1]);
                        const value = (_c = CSS_PROPERTIES[attr]) === null || _c === void 0 ? void 0 : _c.value;
                        if (Array.isArray(value)) {
                            for (let i = 0, length = value.length; i < length; ++i) {
                                important[value[i]] = true;
                            }
                        }
                        else {
                            important[attr] = true;
                        }
                    }
                    REGEXP_IMPORTANT.lastIndex = 0;
                    parseImageUrl('backgroundImage');
                    parseImageUrl('listStyleImage');
                    parseImageUrl('content');
                    for (const selectorText of parseSelectorText(item.selectorText)) {
                        const specificity = getSpecificity(selectorText);
                        const [selector, target] = splitPair(selectorText, '::');
                        const targetElt = target ? '::' + target : '';
                        let elements;
                        if (selector.startsWith(':host')) {
                            if (!hostElement) {
                                continue;
                            }
                            let valid = false;
                            if (selector === ':host') {
                                valid = true;
                            }
                            else {
                                const matchHost = REGEXP_CSSHOST.exec(selector);
                                if (matchHost) {
                                    if (matchHost[2] === '*') {
                                        valid = true;
                                    }
                                    else {
                                        const result = document.querySelectorAll(matchHost[1] === 'host' ? hostElement.tagName + matchHost[2] : matchHost[2] + ' ' + hostElement.tagName);
                                        for (let i = 0, length = result.length; i < length; ++i) {
                                            if (result[i] === hostElement) {
                                                valid = true;
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                            if (valid) {
                                elements = [hostElement];
                            }
                            else {
                                continue;
                            }
                        }
                        else {
                            elements = (queryRoot || documentRoot).querySelectorAll(selector || '*');
                        }
                        const length = elements.length;
                        if (length === 0) {
                            if (unusedStyles) {
                                unusedStyles.add(selectorText);
                            }
                            continue;
                        }
                        for (let i = 0; i < length; ++i) {
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
                            }
                            else {
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
                case CSSRule.FONT_FACE_RULE:
                    if (resource) {
                        const attr = (_d = REGEXP_FONTFACE.exec(cssText)) === null || _d === void 0 ? void 0 : _d[1];
                        if (attr) {
                            const src = (_e = REGEXP_FONTSRC.exec(attr)) === null || _e === void 0 ? void 0 : _e[1].trim();
                            let fontFamily = (_f = REGEXP_FONTFAMILY.exec(attr)) === null || _f === void 0 ? void 0 : _f[1].trim();
                            if (src && fontFamily) {
                                fontFamily = trimBoth(fontFamily, '"');
                                const fontStyle = ((_g = REGEXP_FONTSTYLE.exec(attr)) === null || _g === void 0 ? void 0 : _g[1].toLowerCase()) || 'normal';
                                const fontWeight = +(((_h = REGEXP_FONTWEIGHT.exec(attr)) === null || _h === void 0 ? void 0 : _h[1]) || '400');
                                for (const value of src.split(',')) {
                                    const match = REGEXP_FONTURL.exec(value);
                                    if (match) {
                                        const data = {
                                            fontFamily,
                                            fontWeight,
                                            fontStyle,
                                            srcFormat: ((_j = match[4]) === null || _j === void 0 ? void 0 : _j.toLowerCase().trim()) || 'truetype'
                                        };
                                        const url = (match[2] || match[3]).trim();
                                        if (match[1] === 'url') {
                                            data.srcUrl = resolvePath(url, styleSheetHref);
                                        }
                                        else {
                                            data.srcLocal = url;
                                        }
                                        resource.addFont(data);
                                    }
                                }
                            }
                        }
                    }
                    break;
                case CSSRule.SUPPORTS_RULE:
                    this.applyCSSRuleList(item.cssRules, sessionId, documentRoot);
                    break;
            }
        }
        applyStyleSheet(item, sessionId, documentRoot, queryRoot) {
            var _a, _b;
            var _c;
            try {
                const cssRules = item.cssRules;
                if (cssRules) {
                    const parseConditionText = (rule, value) => { var _a; return ((_a = new RegExp(`\\s*@${rule}([^{]+)`).exec(value)) === null || _a === void 0 ? void 0 : _a[1].trim()) || value; };
                    for (let i = 0, length = cssRules.length; i < length; ++i) {
                        const rule = cssRules[i];
                        switch (rule.type) {
                            case CSSRule.STYLE_RULE:
                            case CSSRule.FONT_FACE_RULE:
                                this.applyStyleRule(rule, sessionId, documentRoot, queryRoot);
                                break;
                            case CSSRule.IMPORT_RULE: {
                                const uri = resolvePath(rule.href, ((_a = rule.parentStyleSheet) === null || _a === void 0 ? void 0 : _a.href) || location.href);
                                if (uri) {
                                    (_b = this.resourceHandler) === null || _b === void 0 ? void 0 : _b.addRawData(uri, 'text/css', '', { encoding: 'utf8' });
                                }
                                this.applyStyleSheet(rule.styleSheet, sessionId, documentRoot, queryRoot);
                                break;
                            }
                            case CSSRule.MEDIA_RULE:
                                if (checkMediaRule(rule.conditionText || parseConditionText('media', rule.cssText))) {
                                    this.applyCSSRuleList(rule.cssRules, sessionId, documentRoot, queryRoot);
                                }
                                break;
                            case CSSRule.SUPPORTS_RULE:
                                if (CSS.supports(rule.conditionText || parseConditionText('supports', rule.cssText))) {
                                    this.applyCSSRuleList(rule.cssRules, sessionId, documentRoot, queryRoot);
                                }
                                break;
                            case CSSRule.KEYFRAMES_RULE: {
                                const value = parseKeyframes(rule.cssRules);
                                if (value) {
                                    const keyframesMap = (_c = this.getProcessing(sessionId)).keyframesMap || (_c.keyframesMap = new Map());
                                    const name = rule.name;
                                    const keyframe = keyframesMap.get(name);
                                    if (keyframe) {
                                        Object.assign(keyframe, value);
                                    }
                                    else {
                                        keyframesMap.set(name, value);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            catch (err) {
                throw new Error((item.href ? item.href + ' - ' : '') + err);
            }
        }
        applyCSSRuleList(rules, sessionId, documentRoot, queryRoot) {
            for (let i = 0, length = rules.length; i < length; ++i) {
                this.applyStyleRule(rules[i], sessionId, documentRoot, queryRoot);
            }
        }
        createSessionThread(elements, pierceShadowRoot) {
            const rootElements = new Set();
            const length = elements.length;
            if (length === 0) {
                rootElements.add(this.mainElement);
            }
            else {
                for (let i = 0; i < length; ++i) {
                    let element = elements[i];
                    if (typeof element === 'string') {
                        element = document.getElementById(element);
                    }
                    if (element) {
                        rootElements.add(element);
                    }
                }
                if (rootElements.size === 0) {
                    return [rootElements];
                }
            }
            let shadowElements, styleSheets;
            if (pierceShadowRoot) {
                let shadowRootItems;
                for (const element of rootElements) {
                    element.querySelectorAll('*').forEach(child => {
                        const shadowRoot = child.shadowRoot;
                        if (shadowRoot) {
                            (shadowRootItems || (shadowRootItems = new Set())).add(shadowRoot);
                        }
                    });
                }
                if (shadowRootItems) {
                    shadowElements = new Set(rootElements);
                    for (const shadowRoot of shadowRootItems) {
                        shadowElements.add(shadowRoot);
                        shadowRoot.querySelectorAll('link').forEach(element => {
                            const href = element.href.trim();
                            if (href) {
                                const mimeType = element.rel.trim() === 'stylesheet' ? 'text/css' : element.type.trim() || parseMimeType(href);
                                if (mimeType === 'text/css') {
                                    (styleSheets || (styleSheets = [])).push(href);
                                }
                            }
                        });
                    }
                }
            }
            const controller = this.controllerHandler;
            const sessionId = controller.generateSessionId;
            const extensions = this.extensionsAll;
            const processing = {
                sessionId,
                initializing: false,
                cache: new NodeList(undefined, sessionId),
                excluded: new NodeList(undefined, sessionId),
                rootElements,
                node: null,
                documentElement: null,
                elementMap: newSessionInit(sessionId),
                extensions
            };
            const afterInsertNode = extensions.filter(item => item.afterInsertNode);
            if (afterInsertNode.length) {
                processing.afterInsertNode = afterInsertNode;
            }
            this.session.active.set(sessionId, processing);
            controller.init();
            const queryRoot = rootElements.size === 1 && rootElements.values().next().value.parentElement;
            if (queryRoot && queryRoot !== document.documentElement) {
                this.setStyleMap(sessionId, document, queryRoot);
            }
            else {
                this.setStyleMap(sessionId);
            }
            return [rootElements, processing, shadowElements || rootElements, styleSheets];
        }
        resumeSessionThread(rootElements, processing, multipleRequest, documentRoot, preloaded) {
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
            const success = [];
            for (const element of rootElements) {
                const node = this.createCache(element, sessionId);
                if (node) {
                    this.afterCreateCache(node);
                    success.push(node);
                }
            }
            for (let i = 0; i < length; ++i) {
                extensions[i].afterParseDocument(sessionId);
            }
            try {
                document.head.removeChild(styleElement);
            }
            catch (_a) {
            }
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
            var _a;
            return ((_a = this.resourceHandler) === null || _a === void 0 ? void 0 : _a.fileHandler) || null;
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
            const extensions = [], children = [];
            for (const processing of active.values()) {
                extensions.push(...processing.extensions);
                children.push(...processing.cache.children);
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
        init() { }
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
                    video: '*'
                }
            };
        }
        init() { }
        sortInitialCache(cache) { }
        applyDefaultStyles(element, sessionId, pseudoElt) { }
        reset() { }
        includeElement(element) { return true; }
        preventNodeCascade(node) { return false; }
        get generateSessionId() {
            return Date.now() + '#' + this.application.session.active.size;
        }
        get afterInsertNode() {
            return (node) => { };
        }
        get userSettings() {
            return this.application.userSettings;
        }
    }

    const { CSS: CSS$1, FILE: FILE$1 } = squared.lib.regex;
    const { isUserAgent: isUserAgent$1 } = squared.lib.client;
    const { CSS_PROPERTIES: CSS_PROPERTIES$1, PROXY_INLINESTYLE, checkFontSizeValue, checkStyleValue, checkWritingMode, convertUnit, formatPX, getRemSize, getStyle, isAngle, isLength, isPercent, isTime, parseSelectorText: parseSelectorText$1, parseUnit } = squared.lib.css;
    const { assignRect, getNamedItem, getParentElement, getRangeClientRect, newBoxRectDimension } = squared.lib.dom;
    const { clamp, truncate } = squared.lib.math;
    const { getElementAsNode, getElementCache: getElementCache$1, getElementData, setElementCache: setElementCache$1 } = squared.lib.session;
    const { convertCamelCase: convertCamelCase$1, convertFloat, convertInt, convertPercent, hasValue, isNumber, isObject, iterateArray, iterateReverseArray, spliceString, splitEnclosing, splitPair: splitPair$1 } = squared.lib.util;
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
        'wordSpacing'
    ];
    const BORDER_TOP = CSS_PROPERTIES$1.borderTop.value;
    const BORDER_RIGHT = CSS_PROPERTIES$1.borderRight.value;
    const BORDER_BOTTOM = CSS_PROPERTIES$1.borderBottom.value;
    const BORDER_LEFT = CSS_PROPERTIES$1.borderLeft.value;
    const BORDER_OUTLINE = CSS_PROPERTIES$1.outline.value;
    const REGEXP_EM = /\dem$/;
    const REGEXP_ENCLOSING = /^:(not|is|where)\((.+?)\)$/i;
    const REGEXP_ISWHERE = /^(.*?)@((?:\{\{.+?\}\})+)(.*)$/;
    const REGEXP_NOTINDEX = /:not-(x+)/;
    const REGEXP_QUERYNTH = /^:nth(-last)?-(child|of-type)\((.+?)\)$/;
    const REGEXP_QUERYNTHPOSITION = /^(-)?(\d+)?n\s*([+-]\d+)?$/;
    const REGEXP_DIR = /^:dir\(\s*(ltr|rtl)\s*\)$/;
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
    function parseLineHeight(value, fontSize) {
        const lineHeight = convertPercent(value);
        return !isNaN(lineHeight) ? lineHeight * fontSize : parseUnit(value, { fontSize });
    }
    function isFontFixedWidth(node) {
        const [fontFirst, fontSecond] = splitPair$1(node.css('fontFamily'), ',', true);
        return fontFirst === 'monospace' && fontSecond !== 'monospace';
    }
    function getFlexValue(node, attr, fallback, parent) {
        const value = (parent || node).css(attr);
        return isNumber(value) ? +value : fallback;
    }
    function hasTextAlign(node, ...values) {
        const value = node.cssAscend('textAlign', { startSelf: node.textElement && node.blockStatic && !node.hasPX('width', { initial: true }) });
        return value !== '' && values.includes(value) && (node.blockStatic ? node.textElement && !node.hasPX('width', { initial: true }) && !node.hasPX('maxWidth', { initial: true }) : node.display.startsWith('inline'));
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
                    if (size) {
                        result = isNumber(size) ? +size : node.parseUnit(size, options);
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
                }
                else {
                    const maxValue = node.parseUnit(max, { dimension: attr });
                    if (maxValue) {
                        if (maxValue <= baseValue && value && isLength(value)) {
                            styleMap[attr] = max;
                            delete styleMap[attrMax];
                        }
                        else {
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
            if (width) {
                const result = width.endsWith('px') ? parseFloat(width) : isLength(width, true) ? node.parseUnit(width, { dimension }) : parseFloat(node.style[border[0]]);
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
                                        return vertical ? node.parseUnit(vertical, { dimension: 'height', parent: false }) : node.parseUnit(horizontal, { parent: false });
                                    case 'marginRight':
                                        return node.actualParent.lastChild !== node ? node.parseUnit(horizontal, { parent: false }) : 0;
                                }
                            }
                            return 0;
                        }
                    }
                }
                break;
        }
        return node.parseUnit(node.css(attr), ((_a = node.actualParent) === null || _a === void 0 ? void 0 : _a.gridElement) ? { parent: false } : undefined);
    }
    function convertPosition(node, attr) {
        if (!node.positionStatic) {
            const unit = node.valueOf(attr, { modified: true });
            if (unit.endsWith('px')) {
                return parseFloat(unit);
            }
            else if (isPercent(unit)) {
                return node.styleElement && parseFloat(node.style[attr]) || 0;
            }
            return node.parseUnit(unit, attr === 'top' || attr === 'bottom' ? { dimension: 'height' } : undefined);
        }
        return 0;
    }
    function checkReadOnly(element, value) {
        switch (element.tagName) {
            case 'INPUT':
                switch (element.type) {
                    case 'hidden':
                    case 'range':
                    case 'color':
                    case 'checkbox':
                    case 'radio':
                    case 'file':
                    case 'button':
                    case 'submit':
                    case 'reset':
                    case 'image':
                        return false;
                }
            case 'TEXTAREA':
                if (element.readOnly === value) {
                    return false;
                }
                break;
            default:
                if (element.isContentEditable === !value) {
                    return false;
                }
                break;
        }
        return true;
    }
    function hasScopedSelector(parent, element, value) {
        try {
            if (iterateArray(parent.element.querySelectorAll(':scope > ' + value), item => item === element) === Infinity) {
                return true;
            }
        }
        catch (_a) {
        }
        return false;
    }
    function validateQuerySelector(selector, child) {
        if (selector.tagName && selector.tagName !== this.tagName.toUpperCase() || selector.id && selector.id !== this.elementId) {
            return false;
        }
        const element = this.element;
        const { classList, attrList, pseudoList, notList } = selector;
        if (classList) {
            const classes = element.classList;
            for (let i = 0, length = classList.length; i < length; ++i) {
                if (!classes.contains(classList[i])) {
                    return false;
                }
            }
        }
        if (attrList) {
            const attributes = this.attributes;
            for (let i = 0, length = attrList.length; i < length; ++i) {
                const attr = attrList[i];
                let value;
                if (attr.endsWith) {
                    const pattern = new RegExp(`^([^:]+:)?${attr.key}$`);
                    for (const name in attributes) {
                        if (pattern.test(name)) {
                            value = attributes[name];
                            break;
                        }
                    }
                }
                else {
                    value = attributes[attr.key];
                }
                if (value === undefined) {
                    return false;
                }
                const other = attr.value;
                if (other) {
                    if (attr.caseInsensitive) {
                        value = value.toLowerCase();
                    }
                    switch (attr.symbol) {
                        case '~':
                            if (!value.split(/\s+/).includes(other)) {
                                return false;
                            }
                            break;
                        case '^':
                            if (!value.startsWith(other)) {
                                return false;
                            }
                            break;
                        case '$':
                            if (!value.endsWith(other)) {
                                return false;
                            }
                            break;
                        case '*':
                            if (!value.includes(other)) {
                                return false;
                            }
                            break;
                        case '|':
                            if (value !== other && !value.startsWith(other + '-')) {
                                return false;
                            }
                            break;
                        default:
                            if (value !== other) {
                                return false;
                            }
                            break;
                    }
                }
            }
        }
        if (pseudoList) {
            const { actualParent: parent, tagName } = this;
            for (let i = 0, length = pseudoList.length; i < length; ++i) {
                const pseudo = pseudoList[i];
                switch (pseudo) {
                    case ':first-child':
                    case ':nth-child(1)':
                        if (this !== parent.firstElementChild) {
                            return false;
                        }
                        break;
                    case ':last-child':
                    case ':nth-last-child(1)':
                        if (this !== parent.lastElementChild) {
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
                                if (item !== this) {
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
                        if (element.hasChildNodes()) {
                            return false;
                        }
                        break;
                    case ':checked':
                        if (!this.checked) {
                            return false;
                        }
                        break;
                    case ':disabled':
                        if (!this.inputElement || !element.disabled) {
                            return false;
                        }
                        break;
                    case ':enabled':
                        if (!this.inputElement || element.disabled) {
                            return false;
                        }
                        break;
                    case ':read-only':
                        if (!checkReadOnly(element, false)) {
                            return false;
                        }
                        break;
                    case ':read-write':
                        if (!checkReadOnly(element, true)) {
                            return false;
                        }
                        break;
                    case ':required':
                        if (!this.inputElement || !element.required) {
                            return false;
                        }
                        break;
                    case ':optional':
                        if (!this.inputElement || element.required) {
                            return false;
                        }
                        break;
                    case ':placeholder-shown':
                        switch (tagName) {
                            case 'INPUT':
                                switch (element.type) {
                                    case 'text':
                                    case 'search':
                                    case 'tel':
                                    case 'url':
                                    case 'email':
                                        break;
                                    default:
                                        return false;
                                }
                            case 'TEXTAREA':
                                if (element.value || !element.placeholder) {
                                    return false;
                                }
                                break;
                            default:
                                return false;
                        }
                        break;
                    case ':in-range':
                    case ':out-of-range':
                        if (tagName === 'INPUT') {
                            const value = +element.value;
                            if (!isNaN(value)) {
                                const { min, max } = element;
                                if (value >= +min && value <= +max) {
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
                    case ':target':
                        if (!location.hash || !(location.hash === '#' + this.elementId || tagName === 'A' && location.hash === '#' + this.toElementString('name'))) {
                            return false;
                        }
                        break;
                    case ':indeterminate':
                        if (tagName === 'INPUT') {
                            switch (element.type) {
                                case 'checkbox':
                                    if (!element.indeterminate) {
                                        return false;
                                    }
                                    continue;
                                case 'radio':
                                    if (element.checked) {
                                        return false;
                                    }
                                    break;
                                default:
                                    return false;
                            }
                        }
                        else if (tagName === 'PROGRESS') {
                            if (!element.attributes.getNamedItem('value')) {
                                return false;
                            }
                            break;
                        }
                        else {
                            return false;
                        }
                    case ':default':
                    case ':defined':
                    case ':link':
                    case ':visited':
                    case ':any-link':
                    case ':hover':
                    case ':focus':
                    case ':focus-within':
                    case ':valid':
                    case ':invalid':
                        if (!hasScopedSelector(parent, element, pseudo)) {
                            return false;
                        }
                        break;
                    default: {
                        let match;
                        if (match = REGEXP_QUERYNTH.exec(pseudo)) {
                            const children = match[1] ? parent.naturalElements.slice(0).reverse() : parent.naturalElements;
                            const index = match[2] === 'child' ? children.indexOf(this) + 1 : children.filter((item) => item.tagName === tagName).indexOf(this) + 1;
                            if (index) {
                                const placement = match[3].trim();
                                if (isNumber(placement)) {
                                    if (placement !== index.toString()) {
                                        return false;
                                    }
                                }
                                else {
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
                                                const modifier = parseInt(subMatch[3]);
                                                if (subMatch[2]) {
                                                    if (subMatch[1]) {
                                                        return false;
                                                    }
                                                    const increment = +subMatch[2];
                                                    if (increment !== 0) {
                                                        if (index !== modifier) {
                                                            for (let j = increment;; j += increment) {
                                                                const total = increment + modifier;
                                                                if (total === index) {
                                                                    break;
                                                                }
                                                                else if (total > index) {
                                                                    return false;
                                                                }
                                                            }
                                                        }
                                                    }
                                                    else if (index !== modifier) {
                                                        return false;
                                                    }
                                                }
                                                else if (subMatch[3]) {
                                                    if (modifier > 0) {
                                                        if (subMatch[1]) {
                                                            if (index > modifier) {
                                                                return false;
                                                            }
                                                        }
                                                        else if (index < modifier) {
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
                                break;
                            }
                        }
                        else if (pseudo.startsWith(':lang(')) {
                            if (!hasScopedSelector(parent, element, pseudo)) {
                                return false;
                            }
                            break;
                        }
                        else if (match = REGEXP_DIR.exec(pseudo)) {
                            switch (this.dir) {
                                case 'rtl':
                                    if (match[1] === 'ltr') {
                                        return false;
                                    }
                                    break;
                                case 'auto':
                                    if (!hasScopedSelector(parent, element, pseudo)) {
                                        return false;
                                    }
                                    break;
                                default:
                                    if (match[1] === 'rtl') {
                                        return false;
                                    }
                                    break;
                            }
                            break;
                        }
                        return selector.fromNot ? true : false;
                    }
                }
            }
        }
        if (notList) {
            for (let i = 0, length = notList.length; i < length; ++i) {
                const not = notList[i];
                let notData, match;
                switch (not[0]) {
                    case ':':
                        if ((match = CSS$1.SELECTOR_PSEUDO_CLASS.exec(not)) && match[0] === not) {
                            notData = { pseudoList: [not] };
                        }
                        break;
                    case '[': {
                        if ((match = CSS$1.SELECTOR_ATTR.exec(not)) && match[0] === not) {
                            const value = match[3] || match[4] || match[5];
                            const caseInsensitive = match[6] === 'i';
                            notData = {
                                attrList: [{
                                        key: match[1],
                                        symbol: match[2],
                                        value: caseInsensitive && value ? value.toLowerCase() : value,
                                        caseInsensitive
                                    }]
                            };
                        }
                        break;
                    }
                    default:
                        if ((match = CSS$1.SELECTOR_LABEL.exec(not)) && match[0] === not) {
                            switch (not[0]) {
                                case '.':
                                    notData = { classList: [not] };
                                    break;
                                case '#':
                                    notData = { id: not.substring(1) };
                                    break;
                                default:
                                    notData = { tagName: not.toUpperCase() };
                                    break;
                            }
                        }
                        break;
                }
                if (notData) {
                    notData.fromNot = true;
                    if (validateQuerySelector.call(this, notData)) {
                        return false;
                    }
                }
                else if ((child ? this : this.actualParent).querySelectorAll(':scope > ' + not).includes(child || this)) {
                    return false;
                }
            }
        }
        return true;
    }
    function ascendQuerySelector(selectors, index, nodes, offset, checked) {
        const selector = selectors[index];
        const selectorAdjacent = index > 0 && selectors[--index];
        const adjacent = selector.adjacent;
        const next = [];
        for (let i = 0, length = nodes.length; i < length; ++i) {
            const child = nodes[i];
            if (checked || selector.all || validateQuerySelector.call(child, selector)) {
                let parent = child.actualParent;
                if (adjacent) {
                    if (adjacent === '>') {
                        if (!next.includes(parent) && (selectorAdjacent && (selectorAdjacent.all || validateQuerySelector.call(parent, selectorAdjacent, child))) || !selectorAdjacent && parent === this) {
                            next.push(parent);
                        }
                    }
                    else if (selectorAdjacent) {
                        const children = parent.naturalElements;
                        switch (adjacent) {
                            case '+': {
                                const j = children.indexOf(child) - 1;
                                if (j >= 0 && (selectorAdjacent.all || validateQuerySelector.call(children[j], selectorAdjacent))) {
                                    next.push(children[j]);
                                }
                                break;
                            }
                            case '~':
                                for (let j = 0, q = children.length; j < q; ++j) {
                                    const sibling = children[j];
                                    if (sibling === child) {
                                        break;
                                    }
                                    else if (selectorAdjacent.all || validateQuerySelector.call(sibling, selectorAdjacent)) {
                                        next.push(sibling);
                                    }
                                }
                                break;
                        }
                    }
                }
                else if (selectorAdjacent) {
                    while (parent && parent.depth - this.depth > index + offset) {
                        if (selectorAdjacent.all || validateQuerySelector.call(parent, selectorAdjacent)) {
                            next.push(parent);
                        }
                        parent = parent.actualParent;
                    }
                }
                else {
                    next.push(child);
                }
            }
        }
        return next.length > 0 && (index === 0 ? true : ascendQuerySelector.call(this, selectors, index, next, offset + (!adjacent || adjacent === '>' ? 0 : 1), adjacent));
    }
    function getMinMax(node, min, attr, options) {
        let self, last, wrapperOf, initial;
        if (options) {
            ({ self, last, wrapperOf, initial } = options);
        }
        let result, current = min ? Infinity : -Infinity;
        node.each(item => {
            if (wrapperOf) {
                item = item.wrapperOf || item;
            }
            const value = parseFloat(self ? item[attr] : initial ? item.cssInitial(attr, options) : item.css(attr));
            if (!isNaN(value)) {
                if (min) {
                    if (last) {
                        if (value <= current) {
                            result = item;
                            current = value;
                        }
                    }
                    else if (value < current) {
                        result = item;
                        current = value;
                    }
                }
                else if (last) {
                    if (value >= current) {
                        result = item;
                        current = value;
                    }
                }
                else if (value > current) {
                    result = item;
                    current = value;
                }
            }
        });
        return result || node;
    }
    function getQueryLength(value) {
        let result = 0;
        for (let i = 0, length = value.length; i < length; ++i) {
            const n = value.charCodeAt(i);
            if (n < 14 && n > 8 || n === 32) {
                continue;
            }
            ++result;
        }
        return result;
    }
    function getBoundsSize(node, options) {
        var _a;
        const bounds = (!options || options.parent !== false) && ((_a = node.absoluteParent) === null || _a === void 0 ? void 0 : _a.box) || node.bounds;
        return bounds[options && options.dimension || 'width'];
    }
    const aboveRange = (a, b, offset = 1) => a + offset > b;
    const belowRange = (a, b, offset = 1) => a - offset < b;
    const sortById = (a, b) => a.id - b.id;
    const isInlineVertical = (value) => value.startsWith('inline') || value === 'table-cell';
    const canTextAlign = (node) => node.naturalChild && (node.isEmpty() || isInlineVertical(node.display)) && !node.floating && node.autoMargin.horizontal !== true;
    class Node extends squared.lib.base.Container {
        constructor(id, sessionId = '0', element, children) {
            super(children);
            this.id = id;
            this.sessionId = sessionId;
            this.documentRoot = false;
            this.shadowRoot = false;
            this.depth = -1;
            this.queryMap = null;
            this._parent = null;
            this._cache = {};
            this._cacheState = { inlineText: false };
            this._preferInitial = false;
            this._bounds = null;
            this._box = null;
            this._linear = null;
            this._initial = null;
            this._cssStyle = null;
            this._naturalChildren = null;
            this._naturalElements = null;
            this._childIndex = Infinity;
            this._element = null;
            this._style = null;
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
                        }
                        else {
                            continue;
                        }
                    }
                    else {
                        for (const attrAlt of alias) {
                            if (!styleMap[attrAlt]) {
                                const valueAlt = checkStyleValue(element, attrAlt, value);
                                if (valueAlt) {
                                    result[attrAlt] = valueAlt;
                                }
                            }
                        }
                        continue;
                    }
                }
                value = checkStyleValue(element, attr, value);
                if (value) {
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
                    }
                    else if (sessionId) {
                        elementData = getElementData(element, sessionId);
                        if (elementData) {
                            this._elementData = elementData;
                        }
                    }
                    else {
                        return false;
                    }
                }
                else {
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
                            }
                            else {
                                this.pseudoElt = elementData.pseudoElt;
                            }
                            this._styleMap = Node.sanitizeCss(element, styleMap, styleMap.writingMode);
                        }
                        else {
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
                styleMap: Object.assign({}, this._styleMap)
            };
        }
        data(name, attr, value, overwrite = true) {
            const data = this._data || (this._data = {});
            if (value === null) {
                if (data[name]) {
                    delete data[name][attr];
                }
                return;
            }
            else if (value !== undefined) {
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
                            cache.hasWidth = undefined;
                            break;
                        case 'height':
                            cache.actualHeight = undefined;
                            cache.percentHeight = undefined;
                        case 'minHeight':
                            cache.height = undefined;
                            cache.hasHeight = undefined;
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
                            }
                            else if (attr.startsWith('padding')) {
                                cache.contentBoxWidth = undefined;
                                cache.contentBoxHeight = undefined;
                            }
                            else if (attr.startsWith('border')) {
                                cache.visibleStyle = undefined;
                                cache.contentBoxWidth = undefined;
                                cache.contentBoxHeight = undefined;
                            }
                            else if (attr.startsWith('background')) {
                                cache.visibleStyle = undefined;
                            }
                            else if (TEXT_STYLE.includes(attr)) {
                                cache.lineHeight = undefined;
                                cache.textStyle = undefined;
                            }
                            break;
                    }
                    if (attr in cache) {
                        cache[attr] = undefined;
                    }
                }
            }
            else {
                this._cache = {};
            }
            if (!this._preferInitial && this.naturalChild) {
                let parent;
                if (attrs.some(value => CSS_PROPERTIES$1[value].trait & 4 /* LAYOUT */)) {
                    parent = this.pageFlow && this.ascend({ condition: item => item.hasPX('width') && item.hasPX('height') || item.documentRoot })[0] || this;
                }
                else if (attrs.some(value => CSS_PROPERTIES$1[value].trait & 8 /* CONTAIN */)) {
                    parent = this;
                }
                else {
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
                }
                else {
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
            }
            else {
                this._cacheState = { inlineText: false };
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
            }
            else if (attr !== 'parent' && !attr.endsWith('Parent')) {
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
        descend(options) {
            let condition, error, every, including, excluding;
            if (options) {
                ({ condition, error, every, including, excluding } = options);
            }
            let complete;
            return (function recurse(children, result) {
                for (let i = 0, length = children.length; i < length; ++i) {
                    const item = children[i];
                    if (error && error(item) || item === excluding) {
                        complete = true;
                        break;
                    }
                    if (condition) {
                        if (condition(item)) {
                            result.push(item);
                            if (!every) {
                                complete = true;
                                break;
                            }
                        }
                    }
                    else {
                        result.push(item);
                    }
                    if (item === including) {
                        complete = true;
                        break;
                    }
                    if (!item.isEmpty()) {
                        recurse(item.naturalElements, result);
                        if (complete) {
                            break;
                        }
                    }
                }
                return result;
            })(this.naturalElements, []);
        }
        intersectX(rect, options) {
            if (rect.width) {
                const { left, right } = this[(options === null || options === void 0 ? void 0 : options.dimension) || 'linear'];
                const { left: leftA, right: rightA } = rect;
                return (Math.ceil(left) >= leftA && left < Math.floor(rightA) ||
                    Math.floor(right) > leftA && right <= Math.ceil(rightA) ||
                    Math.ceil(leftA) >= left && leftA < Math.floor(right) ||
                    Math.floor(rightA) > left && rightA <= Math.ceil(right));
            }
            return false;
        }
        intersectY(rect, options) {
            if (rect.height) {
                const { top, bottom } = this[(options === null || options === void 0 ? void 0 : options.dimension) || 'linear'];
                const { top: topA, bottom: bottomA } = rect;
                return (Math.ceil(top) >= topA && top < Math.floor(bottomA) ||
                    Math.floor(bottom) > topA && bottom <= Math.ceil(bottomA) ||
                    Math.ceil(topA) >= top && topA < Math.floor(bottom) ||
                    Math.floor(bottomA) > top && bottomA <= Math.ceil(bottom));
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
                return offset === undefined ? left < Math.floor(rect.left) || right > Math.ceil(rect.right) : left < rect.left - offset || right > rect.right + offset;
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
                return offset === undefined ? top < Math.floor(rect.top) || bottom > Math.ceil(rect.bottom) : top < rect.top - offset || bottom > rect.bottom + offset;
            }
            return false;
        }
        css(attr, value, cache = true) {
            if (this.styleElement) {
                if (value === '') {
                    this.style[attr] = 'initial';
                    const property = CSS_PROPERTIES$1[attr];
                    if (property && typeof property.value === 'string') {
                        this._styleMap[attr] = property.valueOfNone || (property.value + (property.trait & 256 /* UNIT */ ? 'px' : ''));
                    }
                    else {
                        delete this._styleMap[attr];
                    }
                    if (cache) {
                        this.unsetCache(attr);
                    }
                }
                else if (value) {
                    const current = this.style[attr];
                    if (current !== undefined) {
                        this.style[attr] = value;
                        if (current !== this.style[attr]) {
                            this._styleMap[attr] = value;
                            if (cache) {
                                this.unsetCache(attr);
                            }
                            return value;
                        }
                        return current;
                    }
                    return '';
                }
            }
            return this._styleMap[attr] || this.style[attr] || '';
        }
        cssApply(values, overwrite = true, cache = true) {
            if (overwrite) {
                for (const attr in values) {
                    this.css(attr, values[attr], cache);
                }
            }
            else {
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
            const dataMap = initial && initial.styleMap || this._styleMap;
            if (options) {
                const value = options.value;
                if (value && initial) {
                    return dataMap[attr] = value;
                }
            }
            return dataMap[attr] || options && (options.modified && this._styleMap[attr] || options.computed && this.style[attr]) || '';
        }
        cssAscend(attr, options) {
            let parent = options && options.startSelf ? this : this.actualParent, value;
            while (parent) {
                value = parent.valueOf(attr, options);
                if (value && value !== 'inherit') {
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
            }
            else {
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
                }
                else if (byInt) {
                    valueA = a.toInt(attr, a.childIndex);
                    valueB = b.toInt(attr, b.childIndex);
                }
                else {
                    valueA = a.css(attr);
                    valueB = b.css(attr);
                }
                if (valueA === valueB) {
                    return 0;
                }
                else if (ascending !== false) {
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
            if (this.styleElement) {
                const styleData = !this.pseudoElt ? (_a = this._elementData) === null || _a === void 0 ? void 0 : _a['styleSpecificity'] : (_c = (_b = this.actualParent) === null || _b === void 0 ? void 0 : _b.elementData) === null || _c === void 0 ? void 0 : _c['styleSpecificity' + this.pseudoElt];
                if (styleData) {
                    return styleData[attr] || 0;
                }
            }
            return 0;
        }
        cssTry(attr, value, callback) {
            if (this.styleElement) {
                const element = this._element;
                if (setStyleCache(element, attr, value, !this.pseudoElement ? this.style : getStyle(element), this._styleMap, this.sessionId)) {
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
                    }
                    else {
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
                }
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
                            return Node.sanitizeCss(this._element, styleMap, styleMap.writingMode || this.valueOf('writingMode'));
                    }
                }
            }
        }
        toInt(attr, fallback = NaN, initial) {
            var _a;
            return convertInt((initial && ((_a = this._initial) === null || _a === void 0 ? void 0 : _a.styleMap) || this._styleMap)[attr], fallback);
        }
        toFloat(attr, fallback = NaN, initial) {
            var _a;
            return convertFloat((initial && ((_a = this._initial) === null || _a === void 0 ? void 0 : _a.styleMap) || this._styleMap)[attr], fallback);
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
                    return value === true;
                }
            }
            return fallback;
        }
        toElementString(attr, fallback = '') {
            if (this.naturalElement) {
                const value = this._element[attr];
                if (value !== undefined) {
                    return value !== null ? value.toString() : '';
                }
            }
            return fallback;
        }
        parseUnit(value, options) {
            if (!value) {
                return 0;
            }
            else if (value.endsWith('px')) {
                return parseFloat(value);
            }
            else if (isPercent(value)) {
                return convertPercent(value) * getBoundsSize(this, options);
            }
            if (!options) {
                options = { fontSize: this.fontSize };
            }
            else {
                options.fontSize || (options.fontSize = this.fontSize);
            }
            return parseUnit(value, options);
        }
        convertUnit(value, unit, options) {
            let result = typeof value === 'string' ? this.parseUnit(value, options) : value;
            if (unit === 'percent' || unit === '%') {
                result *= 100 / getBoundsSize(this, options);
                return (options && options.precision !== undefined ? truncate(result, options.precision) : result) + '%';
            }
            return convertUnit(result, unit, options);
        }
        has(attr, options) {
            const value = options && options.initial ? this.cssInitial(attr, options) : this._styleMap[attr];
            if (value) {
                let type, not, ignoreDefault;
                if (options) {
                    ({ not, type, ignoreDefault } = options);
                }
                if (ignoreDefault !== true) {
                    const data = CSS_PROPERTIES$1[attr];
                    if (data && (value === data.value || (data.trait & 256 /* UNIT */) && this.parseUnit(value) === parseFloat(data.value))) {
                        return false;
                    }
                }
                if (not && (value === not || Array.isArray(not) && not.includes(value))) {
                    return false;
                }
                if (type) {
                    return ((type & 1 /* LENGTH */) > 0 && isLength(value) ||
                        (type & 2 /* PERCENT */) > 0 && isPercent(value, true) ||
                        (type & 4 /* TIME */) > 0 && isTime(value) ||
                        (type & 8 /* ANGLE */) > 0 && isAngle(value));
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
                bounds = assignRect(cache && ((_a = this._elementData) === null || _a === void 0 ? void 0 : _a.clientRect) || this._element.getBoundingClientRect());
            }
            else if (this.plainText) {
                const rect = getRangeClientRect(this._element);
                if (rect) {
                    this._textBounds = rect;
                    this._cache.multiline = rect.numberOfLines > 1;
                }
                bounds = rect || newBoxRectDimension();
            }
            else {
                return null;
            }
            if (!cache) {
                this._box = null;
                this._linear = null;
            }
            return this._bounds = bounds;
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
            return getMinMax(this, true, attr, options);
        }
        max(attr, options) {
            return getMinMax(this, false, attr, options);
        }
        querySelector(value) {
            return this.querySelectorAll(value, undefined, 1)[0] || null;
        }
        querySelectorAll(value, customMap, resultCount = -1) {
            const queryMap = customMap || this.queryMap;
            const result = [];
            if (queryMap && resultCount !== 0) {
                const queries = [];
                let notIndex;
                const addNot = (part) => {
                    (notIndex || (notIndex = [])).push(part);
                    return ':not-' + 'x'.repeat(notIndex.length);
                };
                const parseNot = (condition) => condition.includes(',') ? parseSelectorText$1(condition).reduce((a, b) => a + addNot(b), '') : addNot(condition);
                const checkNot = (condition) => {
                    return splitEnclosing(condition, /:not/i).reduce((a, b) => {
                        if (b[0] === ':') {
                            const match = REGEXP_ENCLOSING.exec(b);
                            if (match && match[1].toLowerCase() === 'not') {
                                b = parseNot(match[2].trim());
                            }
                        }
                        return a + b;
                    }, '');
                };
                for (const query of parseSelectorText$1(value)) {
                    let selector = '', expand;
                    invalid: {
                        let match;
                        for (let seg of splitEnclosing(query, CSS$1.SELECTOR_ENCLOSING)) {
                            if (seg[0] === ':' && (match = REGEXP_ENCLOSING.exec(seg))) {
                                const condition = match[2].trim();
                                switch (match[1].toLowerCase()) {
                                    case 'not':
                                        seg = parseNot(condition);
                                        break;
                                    case 'is':
                                    case 'where':
                                        if (selector && !/\s/.test(selector[selector.length - 1])) {
                                            break invalid;
                                        }
                                        if (condition.includes(',')) {
                                            seg = '@';
                                            for (const part of parseSelectorText$1(condition)) {
                                                seg += '{{' + checkNot(part) + '}}';
                                            }
                                            expand = true;
                                        }
                                        else {
                                            seg = checkNot(condition);
                                        }
                                        break;
                                }
                            }
                            selector += seg;
                        }
                    }
                    if (expand) {
                        (function expandQuery(segments) {
                            for (let i = 0, length = segments.length; i < length; ++i) {
                                const match = REGEXP_ISWHERE.exec(segments[i]);
                                if (match) {
                                    const pending = [];
                                    const pattern = /\{\{(.+?)\}\}/g;
                                    let subMatch;
                                    while (subMatch = pattern.exec(match[2])) {
                                        pending.push(match[1] + subMatch[1] + match[3]);
                                    }
                                    expandQuery(pending);
                                }
                                else {
                                    queries.push(segments[i]);
                                }
                            }
                        })([selector]);
                    }
                    else {
                        queries.push(selector);
                    }
                }
                for (let i = 0, length = queries.length; i < length; ++i) {
                    invalid: {
                        const query = queries[i];
                        const selectors = [];
                        let start, offset = 0;
                        if (query === '*') {
                            selectors.push({ all: true });
                        }
                        else {
                            CSS$1.SELECTOR_G.lastIndex = 0;
                            let adjacent = '', selector = '', match;
                            while (match = CSS$1.SELECTOR_G.exec(query)) {
                                let segment = match[1];
                                selector += segment;
                                switch (segment) {
                                    case '+':
                                    case '~':
                                        --offset;
                                    case '>':
                                        if (adjacent || selectors.length === 0 && (segment !== '>' || !/^:(root|scope)/.test(query))) {
                                            break invalid;
                                        }
                                        adjacent = segment;
                                        continue;
                                    case '*':
                                    case '*|*':
                                        if (match.index) {
                                            if (match[0][0] !== ' ') {
                                                break invalid;
                                            }
                                        }
                                        else {
                                            start = true;
                                        }
                                        selectors.push({ all: true, adjacent });
                                        adjacent = '';
                                        continue;
                                    case ':root':
                                        if (selectors.length === 0 && this._element === document.documentElement) {
                                            if (result.includes(this)) {
                                                result.push(this);
                                            }
                                            start = true;
                                            continue;
                                        }
                                        break invalid;
                                    case ':scope':
                                        if (selectors.length) {
                                            break invalid;
                                        }
                                        start = true;
                                        continue;
                                    default:
                                        if (segment.startsWith('*|')) {
                                            segment = segment.substring(2);
                                        }
                                        break;
                                }
                                let attrList, subMatch;
                                while (subMatch = CSS$1.SELECTOR_ATTR.exec(segment)) {
                                    let key = subMatch[1].replace('\\:', ':').toLowerCase(), endsWith;
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
                                            break invalid;
                                    }
                                    const caseInsensitive = subMatch[6] === 'i';
                                    let attrValue = subMatch[3] || subMatch[4] || subMatch[5] || '';
                                    if (caseInsensitive) {
                                        attrValue = attrValue.toLowerCase();
                                    }
                                    (attrList || (attrList = [])).push({
                                        key,
                                        symbol: subMatch[2],
                                        value: attrValue,
                                        endsWith,
                                        caseInsensitive
                                    });
                                    segment = spliceString(segment, subMatch.index, subMatch[0].length);
                                }
                                if (segment.includes('::')) {
                                    break invalid;
                                }
                                let notList, pseudoList;
                                if (notIndex) {
                                    while (subMatch = REGEXP_NOTINDEX.exec(segment)) {
                                        (notList || (notList = [])).push(notIndex[subMatch[1].length - 1]);
                                        segment = spliceString(segment, subMatch.index, subMatch[0].length);
                                    }
                                }
                                while (subMatch = CSS$1.SELECTOR_PSEUDO_CLASS.exec(segment)) {
                                    const pseudoClass = subMatch[0].toLowerCase();
                                    switch (pseudoClass) {
                                        case ':root':
                                        case ':scope':
                                            break invalid;
                                        default:
                                            (pseudoList || (pseudoList = [])).push(pseudoClass);
                                            break;
                                    }
                                    segment = spliceString(segment, subMatch.index, pseudoClass.length);
                                }
                                let tagName, id, classList;
                                while (subMatch = CSS$1.SELECTOR_LABEL.exec(segment)) {
                                    const label = subMatch[0];
                                    switch (label[0]) {
                                        case '#': {
                                            const subId = label.substring(1);
                                            if (id && id !== subId) {
                                                break invalid;
                                            }
                                            id = subId;
                                            break;
                                        }
                                        case '.':
                                            (classList || (classList = [])).push(label.substring(1));
                                            break;
                                        default:
                                            if (id || classList || tagName) {
                                                break invalid;
                                            }
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
                                adjacent = '';
                            }
                            if (getQueryLength(query) !== getQueryLength(selector)) {
                                continue;
                            }
                        }
                        const q = selectors.length;
                        if (q) {
                            let currentCount = result.length;
                            const all = currentCount === 0;
                            for (let j = start || customMap ? 0 : q - offset, r = queryMap.length; j < r; ++j) {
                                const items = queryMap[j];
                                for (let k = 0, s = items.length; k < s; ++k) {
                                    const node = items[k];
                                    if ((all || !result.includes(node)) && ascendQuerySelector.call(this, selectors, q - 1, [node], offset)) {
                                        result.push(node);
                                        if (++currentCount === resultCount) {
                                            return result.sort(sortById);
                                        }
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
                iterateReverseArray(result, (item) => {
                    if (!isNaN(depth)) {
                        for (let i = item.depth - 1; i > depth; --i) {
                            customMap.push([]);
                        }
                    }
                    customMap.push([item]);
                    depth = item.depth;
                });
                return this.querySelectorAll(value, customMap);
            }
            return result.sort(sortById);
        }
        descendants(value, options) {
            if (this.naturalElements.length) {
                if (options || !this.queryMap) {
                    const children = this.descend(options).filter(item => item.naturalElement);
                    let length = children.length;
                    if (value && length) {
                        const customMap = [];
                        const depth = this.depth + 1;
                        let index;
                        for (let i = 0; i < length; ++i) {
                            const item = children[i];
                            index = item.depth - depth;
                            (customMap[index] || (customMap[index] = [])).push(item);
                        }
                        length = customMap.length;
                        for (let i = 0; i < length; ++i) {
                            customMap[i] || (customMap[i] = []);
                        }
                        return this.querySelectorAll(value, customMap);
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
                const filterPredicate = (item) => {
                    if (error && error(item) || item === excluding) {
                        return true;
                    }
                    if (condition) {
                        if (condition(item)) {
                            result.push(item);
                            if (!every) {
                                return true;
                            }
                        }
                    }
                    else {
                        result.push(item);
                    }
                    return item === including;
                };
                if (reverse) {
                    iterateReverseArray(this.actualParent.naturalElements, filterPredicate, 0, this.childIndex);
                }
                else {
                    iterateArray(this.actualParent.naturalElements, filterPredicate, this.childIndex + 1);
                }
                if (value) {
                    const ancestors = this.ascend();
                    const customMap = [];
                    iterateReverseArray(ancestors, (item) => {
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
            return this._preferInitial ? this.cssInitial(attr, options) : this._styleMap[attr] || options && options.computed && this.style[attr] || '';
        }
        get naturalChild() { return true; }
        get pseudoElement() { return false; }
        set parent(value) {
            if (value) {
                const parent = this._parent;
                if (value !== parent) {
                    if (parent) {
                        parent.remove(this);
                    }
                    this._parent = value;
                    value.add(this);
                }
                else if (!value.contains(this)) {
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
                return this._cache.tagName = element ? element.nodeName[0] === '#' ? element.nodeName : element.tagName : '';
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
            return result === undefined ? this._cacheState.htmlElement = this._element instanceof HTMLElement : result;
        }
        get svgElement() {
            const result = this._cacheState.svgElement;
            return result === undefined ? this._cacheState.svgElement = !this.htmlElement && this._element instanceof SVGElement || this.imageElement && FILE$1.SVG.test(this.toElementString('src')) : result;
        }
        get styleElement() {
            const result = this._cacheState.styleElement;
            return result === undefined ? this._cacheState.styleElement = !!this._element && !this.plainText : result;
        }
        get naturalElement() {
            const result = this._cacheState.naturalElement;
            return result === undefined ? this._cacheState.naturalElement = this.naturalChild && this.styleElement && !this.pseudoElement : result;
        }
        get parentElement() {
            var _a;
            return this._element ? getParentElement(this._element) : ((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.element) || null;
        }
        get textElement() {
            return this.plainText || this.inlineText && this.tagName !== 'BUTTON';
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
            return this.pageFlow && this.css('float') || 'none';
        }
        get floating() {
            return this.float !== 'none';
        }
        get zIndex() {
            return this.toInt('zIndex', 0);
        }
        get opacity() {
            const opacity = this.valueOf('opacity');
            return opacity ? clamp(+opacity) : 1;
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
                        return this._linear = {
                            top: bounds.top - marginTop,
                            right: bounds.right + marginRight,
                            bottom: bounds.bottom + marginBottom,
                            left: bounds.left - marginLeft,
                            width: bounds.width + marginLeft + marginRight,
                            height: bounds.height + marginTop + marginBottom
                        };
                    }
                    return this._linear = bounds;
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
                        return this._box = {
                            top: bounds.top + (this.paddingTop + this.borderTopWidth),
                            right: bounds.right - (this.paddingRight + this.borderRightWidth),
                            bottom: bounds.bottom - (this.paddingBottom + this.borderBottomWidth),
                            left: bounds.left + (this.paddingLeft + this.borderLeftWidth),
                            width: bounds.width - this.contentBoxWidth,
                            height: bounds.height - this.contentBoxHeight
                        };
                    }
                    return this._box = bounds;
                }
                return newBoxRectDimension();
            }
            return this._box;
        }
        get flexdata() {
            let result = this._cache.flexdata;
            if (result === undefined) {
                if (this.flexElement) {
                    const [flexWrap, flexDirection, alignContent, justifyContent] = this.cssAsTuple('flexWrap', 'flexDirection', 'alignContent', 'justifyContent');
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
                return this._cache.flexdata = result || {};
            }
            return result;
        }
        get flexbox() {
            var _a;
            let result = this._cache.flexbox;
            if (result === undefined) {
                if (this.naturalChild && ((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.flexElement)) {
                    const [alignSelf, justifySelf, basis] = this.cssAsTuple('alignSelf', 'justifySelf', 'flexBasis');
                    result = {
                        alignSelf: alignSelf === 'auto' ? this.cssParent('alignItems') : alignSelf,
                        justifySelf: justifySelf === 'auto' ? this.cssParent('justifyItems') : justifySelf,
                        basis,
                        grow: getFlexValue(this, 'flexGrow', 0),
                        shrink: getFlexValue(this, 'flexShrink', 1),
                        order: this.toInt('order', 0)
                    };
                }
                return this._cache.flexbox = result || {};
            }
            return result;
        }
        get width() {
            const result = this._cache.width;
            return result === undefined ? this._cache.width = setDimension(this, this._styleMap, 'width') : result;
        }
        get height() {
            const result = this._cache.height;
            return result === undefined ? this._cache.height = setDimension(this, this._styleMap, 'height') : result;
        }
        get hasWidth() {
            const result = this._cache.hasWidth;
            return result === undefined ? this._cache.hasWidth = this.width > 0 : result;
        }
        get hasHeight() {
            var _a;
            const result = this._cache.hasHeight;
            return result === undefined ? this._cache.hasHeight = isPercent(this.valueOf('height')) ? this.pageFlow ? ((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.hasHeight) || this.documentBody : this.valueOf('position') === 'fixed' || this.hasPX('top') || this.hasPX('bottom') : this.height > 0 || this.hasPX('height', { percent: false }) : result;
        }
        get lineHeight() {
            let result = this._cache.lineHeight;
            if (result === undefined) {
                if (!this.imageElement && !this.svgElement) {
                    let hasOwnStyle = this.has('lineHeight'), value = 0;
                    if (hasOwnStyle) {
                        let lineHeight = this.css('lineHeight');
                        if (lineHeight === 'inherit') {
                            lineHeight = this.cssAscend('lineHeight', { initial: true });
                        }
                        value = parseLineHeight(lineHeight, this.fontSize);
                    }
                    else {
                        let parent = this.ascend({ condition: item => item.has('lineHeight', { initial: true, not: 'inherit' }) })[0];
                        if (parent) {
                            value = parseLineHeight(parent.css('lineHeight'), this.fontSize);
                            if (value) {
                                if (parent !== this.actualParent || REGEXP_EM.test(this.valueOf('fontSize')) || this.multiline) {
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
                    result = hasOwnStyle || value > this.height || this.multiline || this.block && this.naturalChildren.some((node) => node.textElement) ? value : 0;
                }
                return this._cache.lineHeight = result || 0;
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
                        result = !this.documentBody && this.toFloat('top', 0) === 0 && this.toFloat('right', 0) === 0 && this.toFloat('bottom', 0) === 0 && this.toFloat('left', 0) === 0;
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
            return result === undefined ? this._cache.top = convertPosition(this, 'top') : result;
        }
        get right() {
            const result = this._cache.right;
            return result === undefined ? this._cache.right = convertPosition(this, 'right') : result;
        }
        get bottom() {
            const result = this._cache.bottom;
            return result === undefined ? this._cache.bottom = convertPosition(this, 'bottom') : result;
        }
        get left() {
            const result = this._cache.left;
            return result === undefined ? this._cache.left = convertPosition(this, 'left') : result;
        }
        get marginTop() {
            const result = this._cache.marginTop;
            return result === undefined ? this._cache.marginTop = this.inlineStatic ? 0 : convertBox(this, 'marginTop', true) : result;
        }
        get marginRight() {
            const result = this._cache.marginRight;
            return result === undefined ? this._cache.marginRight = convertBox(this, 'marginRight', true) : result;
        }
        get marginBottom() {
            const result = this._cache.marginBottom;
            return result === undefined ? this._cache.marginBottom = this.inlineStatic ? 0 : convertBox(this, 'marginBottom', true) : result;
        }
        get marginLeft() {
            const result = this._cache.marginLeft;
            return result === undefined ? this._cache.marginLeft = convertBox(this, 'marginLeft', true) : result;
        }
        get borderTopWidth() {
            const result = this._cache.borderTopWidth;
            return result === undefined ? this._cache.borderTopWidth = convertBorderWidth(this, 'height', BORDER_TOP) : result;
        }
        get borderRightWidth() {
            const result = this._cache.borderRightWidth;
            return result === undefined ? this._cache.borderRightWidth = convertBorderWidth(this, 'height', BORDER_RIGHT) : result;
        }
        get borderBottomWidth() {
            const result = this._cache.borderBottomWidth;
            return result === undefined ? this._cache.borderBottomWidth = convertBorderWidth(this, 'width', BORDER_BOTTOM) : result;
        }
        get borderLeftWidth() {
            const result = this._cache.borderLeftWidth;
            return result === undefined ? this._cache.borderLeftWidth = convertBorderWidth(this, 'width', BORDER_LEFT) : result;
        }
        get outlineWidth() {
            const result = this._cache.outlineWidth;
            return result === undefined ? this._cache.outlineWidth = convertBorderWidth(this, 'width', BORDER_OUTLINE) : result;
        }
        get paddingTop() {
            const result = this._cache.paddingTop;
            return result === undefined ? this._cache.paddingTop = convertBox(this, 'paddingTop', false) : result;
        }
        get paddingRight() {
            const result = this._cache.paddingRight;
            return result === undefined ? this._cache.paddingRight = convertBox(this, 'paddingRight', false) : result;
        }
        get paddingBottom() {
            const result = this._cache.paddingBottom;
            return result === undefined ? this._cache.paddingBottom = convertBox(this, 'paddingBottom', false) : result;
        }
        get paddingLeft() {
            const result = this._cache.paddingLeft;
            return result === undefined ? this._cache.paddingLeft = convertBox(this, 'paddingLeft', false) : result;
        }
        get contentBox() {
            return this.css('boxSizing') !== 'border-box' || this.tableElement && isUserAgent$1(4 /* FIREFOX */);
        }
        get contentBoxWidth() {
            const result = this._cache.contentBoxWidth;
            return result === undefined ? this._cache.contentBoxWidth = this.tableElement && this.valueOf('borderCollapse') === 'collapse' ? 0 : this.borderLeftWidth + this.paddingLeft + this.paddingRight + this.borderRightWidth : result;
        }
        get contentBoxHeight() {
            const result = this._cache.contentBoxHeight;
            return result === undefined ? this._cache.contentBoxHeight = this.tableElement && this.valueOf('borderCollapse') === 'collapse' ? 0 : this.borderTopWidth + this.paddingTop + this.paddingBottom + this.borderBottomWidth : result;
        }
        get inline() {
            const result = this._cache.inline;
            return result === undefined ? this._cache.inline = this.display === 'inline' : result;
        }
        get inlineStatic() {
            const result = this._cache.inlineStatic;
            return result === undefined ? this._cache.inlineStatic = this.inline && this.pageFlow && !this.floating && !this.imageElement : result;
        }
        set inlineText(value) {
            this._cacheState.inlineText = value || this.tagName === 'BUTTON' && this.textContent.trim() !== '';
        }
        get inlineText() {
            return this._cacheState.inlineText;
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
            var _a;
            let result = this._cache.blockStatic;
            if (result === undefined) {
                const pageFlow = this.pageFlow;
                if (pageFlow) {
                    if (this.block && !this.floating || this.lineBreak) {
                        result = true;
                    }
                    else {
                        const actualParent = this.actualParent;
                        if (actualParent && (actualParent.block && !actualParent.floating || actualParent.hasWidth)) {
                            if (this.inlineStatic && ((_a = this.firstChild) === null || _a === void 0 ? void 0 : _a.blockStatic)) {
                                result = true;
                            }
                            else if (this.inline || this.display.startsWith('table-') || this.hasPX('maxWidth')) {
                                result = false;
                            }
                        }
                        else {
                            result = false;
                        }
                    }
                }
                if (result === undefined) {
                    const width = this.valueOf('width');
                    const minWidth = this.valueOf('minWidth');
                    let percent = 0;
                    if (isPercent(width)) {
                        percent = convertPercent(width);
                    }
                    if (isPercent(minWidth)) {
                        percent = Math.max(convertPercent(minWidth), percent);
                    }
                    if (percent) {
                        const marginLeft = this.valueOf('marginLeft');
                        const marginRight = this.valueOf('marginRight');
                        result = percent + Math.max(0, convertPercent(marginLeft, 0)) + convertPercent(marginRight, 0) >= 1;
                    }
                }
                return this._cache.blockStatic = !!result;
            }
            return result;
        }
        get pageFlow() {
            const result = this._cache.pageFlow;
            return result === undefined ? this._cache.pageFlow = this.positionStatic || this.positionRelative || this.lineBreak : result;
        }
        get centerAligned() {
            const result = this._cache.centerAligned;
            return result === undefined ? this._cache.centerAligned = !this.pageFlow ? this.hasPX('left') && this.hasPX('right') : this.autoMargin.leftRight || canTextAlign(this) && hasTextAlign(this, 'center') : result;
        }
        get rightAligned() {
            const result = this._cache.rightAligned;
            return result === undefined ? this._cache.rightAligned = !this.pageFlow ? this.hasPX('right') && !this.hasPX('left') : this.float === 'right' || this.autoMargin.left || canTextAlign(this) && hasTextAlign(this, 'right', this.dir === 'rtl' ? 'start' : 'end') : result;
        }
        get bottomAligned() {
            var _a;
            const result = this._cache.bottomAligned;
            return result === undefined ? this._cache.bottomAligned = !this.pageFlow ? this.hasPX('bottom') && !this.hasPX('top') : !!(((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.hasHeight) && this.autoMargin.top) : result;
        }
        get autoMargin() {
            let result = this._cache.autoMargin;
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
                return this._cache.autoMargin = result || {};
            }
            return result;
        }
        get baseline() {
            let result = this._cache.baseline;
            if (result === undefined) {
                if (this.pageFlow && !this.floating && !this.tableElement) {
                    const display = this.display;
                    if (display.startsWith('inline') || display === 'list-item') {
                        const value = this.css('verticalAlign');
                        result = value === 'baseline' || !isNaN(parseFloat(value));
                    }
                }
                return this._cache.baseline = !!result;
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
                    }
                    else if (isLength(value)) {
                        result = this.parseUnit(value);
                    }
                    else if (this.styleElement) {
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
                return this._cache.verticalAlign = result || 0;
            }
            return result;
        }
        set textBounds(value) {
            this._textBounds = value;
        }
        get textBounds() {
            let result = this._textBounds;
            if (result === undefined) {
                if (this.naturalChild) {
                    if (this.textElement) {
                        result = getRangeClientRect(this._element);
                    }
                    else if (!this.isEmpty()) {
                        let top = Infinity, right = -Infinity, bottom = -Infinity, left = Infinity, numberOfLines = 0;
                        const children = this.naturalChildren;
                        for (let i = 0, length = children.length; i < length; ++i) {
                            const node = children[i];
                            if (node.textElement) {
                                const rect = node.textBounds;
                                if (rect) {
                                    numberOfLines += rect.numberOfLines || (top === Infinity || rect.top >= bottom || Math.floor(rect.right - rect.left) > Math.ceil(rect.width) ? 1 : 0);
                                    top = Math.min(rect.top, top);
                                    right = Math.max(rect.right, right);
                                    left = Math.min(rect.left, left);
                                    bottom = Math.max(rect.bottom, bottom);
                                }
                            }
                        }
                        if (numberOfLines) {
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
                return this._textBounds = result || null;
            }
            return result;
        }
        get multiline() {
            var _a;
            const result = this._cache.multiline;
            return result === undefined ? this._cache.multiline = (this.plainText || this.styleElement && this.inlineText && (this.inline || this.naturalElements.length === 0 || isInlineVertical(this.display) || this.floating || !this.pageFlow)) && ((_a = this.textBounds) === null || _a === void 0 ? void 0 : _a.numberOfLines) > 1 : result;
        }
        get backgroundColor() {
            let result = this._cache.backgroundColor;
            if (result === undefined) {
                if (!this.plainText) {
                    const isTransparent = (value) => value === 'transparent' || value === 'rgba(0, 0, 0, 0)';
                    result = this.css('backgroundColor');
                    if (isTransparent(result)) {
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
                        }
                        else {
                            result = '';
                        }
                    }
                    if (result && this.styleElement && this.pageFlow && (!this.inputElement && this.opacity === 1 || isTransparent(result))) {
                        let parent = this.actualParent;
                        while (parent) {
                            const backgroundImage = parent.valueOf('backgroundImage');
                            if (!backgroundImage || backgroundImage === 'none') {
                                const color = parent.backgroundColor;
                                if (color && !isTransparent(color)) {
                                    if (color === result && parent.opacity === 1) {
                                        result = '';
                                    }
                                    else if (isTransparent(result)) {
                                        result = color;
                                    }
                                    break;
                                }
                                parent = parent.actualParent;
                            }
                            else {
                                break;
                            }
                        }
                    }
                }
                return this._cache.backgroundColor = result || '';
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
                return this._cache.backgroundImage = value;
            }
            return result;
        }
        get percentWidth() {
            const result = this._cache.percentWidth;
            if (result === undefined) {
                const value = this.valueOf('width');
                return this._cache.percentWidth = convertPercent(value, 0);
            }
            return result;
        }
        get percentHeight() {
            var _a;
            const result = this._cache.percentHeight;
            if (result === undefined) {
                const value = this.valueOf('height');
                return this._cache.percentHeight = isPercent(value) && (((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.hasHeight) || this.valueOf('position') === 'fixed') ? convertPercent(value) : 0;
            }
            return result;
        }
        get visibleStyle() {
            let result = this._cache.visibleStyle;
            if (result === undefined) {
                if (!this.plainText) {
                    const borderWidth = this.borderTopWidth > 0 || this.borderRightWidth > 0 || this.borderBottomWidth > 0 || this.borderLeftWidth > 0;
                    const backgroundColor = this.backgroundColor !== '';
                    const backgroundImage = this.backgroundImage !== '';
                    let backgroundRepeatX = false, backgroundRepeatY = false;
                    if (backgroundImage) {
                        for (const repeat of this.css('backgroundRepeat').split(',')) {
                            const [repeatX, repeatY] = splitPair$1(repeat.trim(), ' ');
                            backgroundRepeatX || (backgroundRepeatX = repeatX === 'repeat' || repeatX === 'repeat-x');
                            backgroundRepeatY || (backgroundRepeatY = repeatX === 'repeat' || repeatX === 'repeat-y' || repeatY === 'repeat');
                        }
                    }
                    result = {
                        background: borderWidth || backgroundImage || backgroundColor,
                        borderWidth,
                        backgroundImage,
                        backgroundColor,
                        backgroundRepeat: backgroundRepeatX || backgroundRepeatY,
                        backgroundRepeatX,
                        backgroundRepeatY,
                        outline: this.outlineWidth > 0
                    };
                }
                return this._cache.visibleStyle = result || {};
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
            const result = this._cacheState.actualParent;
            if (result === undefined) {
                const element = this.element;
                const parentElement = element && getParentElement(element);
                return this._cacheState.actualParent = parentElement && getElementAsNode(parentElement, this.sessionId) || this.parent;
            }
            return result;
        }
        get wrapperOf() {
            let result = this._cacheState.wrapperOf;
            if (result === undefined) {
                let node = this;
                do {
                    if (node.size()) {
                        const children = node.children.filter(item => item.pageFlow);
                        if (children.length === 1) {
                            node = children[0];
                        }
                        else {
                            result = null;
                            break;
                        }
                    }
                    else {
                        result = node === this ? null : node;
                        break;
                    }
                } while (true);
                this._cacheState.wrapperOf = result;
            }
            return result;
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
                }
                else if (this.inlineStatic && !this.valueOf('width') || this.display === 'table-cell' || ((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.flexdata.row)) {
                    result = this.bounds.width;
                }
                else {
                    result = this.width;
                    if (result) {
                        if (this.contentBox && !this.tableElement) {
                            result += this.contentBoxWidth;
                        }
                    }
                    else {
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
                if (this.inlineStatic && !this.valueOf('height') || this.display === 'table-cell' || ((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.flexdata.column)) {
                    result = this.bounds.height;
                }
                else {
                    result = this.height;
                    if (result) {
                        if (this.contentBox && !this.tableElement) {
                            result += this.contentBoxHeight;
                        }
                    }
                    else {
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
            return this._naturalElements || (this._naturalElements = this.naturalChildren.filter((item) => item.naturalElement));
        }
        get firstChild() {
            return this.naturalChildren[0] || null;
        }
        get lastChild() {
            const children = this.naturalChildren;
            return children[children.length - 1] || null;
        }
        get firstElementChild() {
            return this.naturalElements[0] || null;
        }
        get lastElementChild() {
            const children = this.naturalElements;
            return children[children.length - 1] || null;
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
        get checked() {
            switch (this.tagName) {
                case 'INPUT': {
                    const element = this._element;
                    switch (element.type) {
                        case 'radio':
                        case 'checkbox':
                            return element.checked;
                    }
                    break;
                }
                case 'OPTION':
                    return this.parentElement.tagName === 'SELECT' && Array.from(this.parentElement.selectedOptions).includes(this._element);
            }
            return false;
        }
        get boundingClientRect() {
            if (this.styleElement) {
                return this._element.getBoundingClientRect();
            }
            else if (this.plainText && this.naturalChild) {
                const rect = getRangeClientRect(this._element);
                rect.x = rect.left;
                rect.y = rect.top;
                return rect;
            }
            return null;
        }
        get preserveWhiteSpace() {
            let result = this._cache.preserveWhiteSpace;
            if (result === undefined) {
                switch (this.css('whiteSpace')) {
                    case 'pre':
                    case 'pre-wrap':
                    case 'break-spaces':
                        result = true;
                        break;
                }
                return this._cache.preserveWhiteSpace = !!result;
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
                        let value = checkFontSizeValue(this.valueOf('fontSize'), fixedWidth);
                        if (value.endsWith('px')) {
                            result = parseFloat(value);
                        }
                        else if (isPercent(value)) {
                            const parent = this.actualParent;
                            if (parent) {
                                result = convertPercent(value) * parent.fontSize;
                                if (fixedWidth && !isFontFixedWidth(parent)) {
                                    result *= 13 / getRemSize();
                                }
                            }
                            else {
                                result = getRemSize(fixedWidth);
                            }
                        }
                        else {
                            let emRatio = 1;
                            if (REGEXP_EM.test(value)) {
                                emRatio = parseFloat(value);
                                value = 'inherit';
                            }
                            if (value === 'inherit') {
                                let parent = this.actualParent;
                                if (parent) {
                                    do {
                                        if (parent.tagName === 'HTML') {
                                            value = '1rem';
                                            break;
                                        }
                                        else {
                                            const fontSize = parent.valueOf('fontSize');
                                            if (fontSize && fontSize !== 'inherit') {
                                                value = checkFontSizeValue(fontSize);
                                                if (isPercent(value)) {
                                                    emRatio *= convertPercent(value);
                                                }
                                                else if (REGEXP_EM.test(value)) {
                                                    emRatio *= parseFloat(value);
                                                }
                                                else {
                                                    break;
                                                }
                                            }
                                            parent = parent.actualParent;
                                        }
                                    } while (parent);
                                }
                                else {
                                    value = '1rem';
                                }
                            }
                            result = (value.endsWith('rem') ? parseFloat(value) * getRemSize(fixedWidth) : parseUnit(value, { fixedWidth })) * emRatio;
                        }
                    }
                    else {
                        result = this.actualParent.fontSize;
                    }
                }
                else {
                    const options = { fixedWidth: isFontFixedWidth(this) };
                    result = parseUnit(this.css('fontSize'), options) || ((_b = (_a = this.ascend({ condition: item => item.fontSize > 0 })[0]) === null || _a === void 0 ? void 0 : _a.fontSize) !== null && _b !== void 0 ? _b : parseUnit('1rem', options));
                }
                this._cache.fontSize = result;
            }
            return result;
        }
        get style() {
            return this._style || (this._style = this.styleElement ? !this.pseudoElt ? getStyle(this._element) : getStyle(getParentElement(this._element), this.pseudoElt) : PROXY_INLINESTYLE);
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
            switch (value = value.toLowerCase()) {
                case 'ltr':
                case 'rtl':
                case 'auto':
                    if (this.naturalElement) {
                        this._element.dir = value;
                        this.cascade(node => {
                            if (node.dir === value) {
                                return false;
                            }
                            node.unsetCache('dir');
                        });
                    }
                    else if (this.naturalChild) {
                        return;
                    }
                    this._cacheState.dir = value;
                    break;
            }
        }
        get dir() {
            let result = this._cacheState.dir;
            if (result === undefined) {
                result = this.naturalElement ? this._element.dir : '';
                if (!result) {
                    let parent = this.actualParent;
                    while (parent) {
                        result = parent.dir;
                        if (result) {
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
                y: (bounds.top + bounds.bottom) / 2
            };
        }
    }

    const settings = {
        builtInExtensions: [],
        createElementMap: true,
        createQuerySelectorMap: true,
        pierceShadowRoot: false,
        showErrorMessages: false
    };

    let application = null;
    const appBase = {
        create() {
            application = new Application$1(1 /* VDOM */, Node, Controller);
            return {
                application,
                framework: 1 /* VDOM */,
                userSettings: Object.assign({}, settings)
            };
        },
        cached() {
            if (application) {
                return {
                    application,
                    framework: 1 /* VDOM */,
                    userSettings: application.userSettings
                };
            }
            return this.create();
        }
    };

    return appBase;

}());
