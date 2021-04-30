/* squared.base-dom
   https://github.com/anpham6/squared */

this.squared = this.squared || {};
this.squared.base = (function (exports) {
    'use strict';

    class NodeList extends squared.lib.base.Container {
        constructor(children, sessionId = '0', resourceId = -1) {
            super(children);
            this.sessionId = sessionId;
            this.resourceId = resourceId;
        }
        add(node, options) {
            super.add(node);
            if (options && this.afterAdd) {
                this.afterAdd.call(node, options);
            }
            return this;
        }
        sort(predicate) {
            this.children.sort(predicate);
            return this;
        }
    }

    const { CSS_CANNOT_BE_PARSED, DOCUMENT_ROOT_NOT_FOUND, OPERATION_NOT_SUPPORTED, reject } = squared.lib.error;
    const { CSS_PROPERTIES: CSS_PROPERTIES$1, compareSpecificity, getSpecificity, getPropertiesAsTraits, insertStyleSheetRule, parseSelectorText: parseSelectorText$1 } = squared.lib.internal;
    const { FILE: FILE$2, STRING: STRING$3 } = squared.lib.regex;
    const { getElementCache: getElementCache$1, newSessionInit, setElementCache: setElementCache$1 } = squared.lib.session;
    const { allSettled, capitalize, convertCamelCase: convertCamelCase$1, isBase64: isBase64$1, isEmptyString, isPlainObject: isPlainObject$1, replaceAll: replaceAll$2, resolvePath: resolvePath$2, splitPair: splitPair$6, splitSome: splitSome$5, startsWith: startsWith$5 } = squared.lib.util;
    const REGEXP_IMPORTANT = /([a-z-]+):[^!;]+!important;/g;
    const REGEXP_CSSHOST = /^:(?:host|host-context)\(([^)]+)\)/;
    const REGEXP_DATAURI$1 = new RegExp(`url\\("(${STRING$3.DATAURI})"\\)`, 'g');
    const CSS_SHORTHANDNONE = getPropertiesAsTraits(64 /* NONE */);
    function parseImageUrl(value, styleSheetHref, resource, resourceId) {
        let result, match;
        while (match = REGEXP_DATAURI$1.exec(value)) {
            if (match[2]) {
                if (resource) {
                    const leading = match[3];
                    const encoding = match[4] || (isBase64$1(match[5]) ? 'base64' : 'utf8');
                    let base64, content;
                    if (encoding === 'base64') {
                        base64 = match[5];
                    }
                    else {
                        content = match[5];
                    }
                    resource.addRawData(resourceId, match[1], { mimeType: leading && leading.indexOf('/') !== -1 ? leading : 'image/unknown', encoding, content, base64 });
                }
            }
            else {
                const url = resolvePath$2(match[5], styleSheetHref);
                if (url) {
                    if (resource) {
                        resource.addImage(resourceId, url);
                    }
                    result = replaceAll$2(result || value, match[0], `url("${url}")`, 1);
                }
            }
        }
        REGEXP_DATAURI$1.lastIndex = 0;
        return result || value;
    }
    function parseError(error) {
        if (typeof error === 'string') {
            return error;
        }
        if (error instanceof Error) {
            return error.message;
        }
        if (error instanceof Event) {
            error = error.target;
        }
        return error instanceof HTMLImageElement ? error.src : '';
    }
    const getErrorMessage = (errors) => errors.map(value => '- ' + value).join('\n');
    class Application {
        constructor(framework, nodeConstructor, ControllerConstructor, ExtensionManagerConstructor, ResourceConstructor, builtInExtensions = new Map()) {
            this.framework = framework;
            this.builtInExtensions = builtInExtensions;
            this.extensions = [];
            this.userSettings = {};
            this.closed = false;
            this.elementMap = new WeakMap();
            this.session = { active: new Map() };
            this._nextId = 0;
            this.Node = nodeConstructor;
            const controller = new ControllerConstructor(this);
            this._controllerHandler = controller;
            this._extensionManager = ExtensionManagerConstructor ? new ExtensionManagerConstructor(this) : null;
            this._resourceHandler = ResourceConstructor ? new ResourceConstructor(this) : null;
            this._afterInsertNode = controller.afterInsertNode.bind(controller);
            this._includeElement = controller.includeElement.bind(controller);
            this._preventNodeCascade = controller.preventNodeCascade.bind(controller);
            this.init();
        }
        static prioritizeExtensions(value, extensions) {
            const result = [];
            splitSome$5(value, name => {
                const index = extensions.findIndex(ext => ext.name === name);
                if (index !== -1) {
                    result.push(extensions[index]);
                }
            });
            return result.length ? result.concat(extensions.filter(ext => !result.includes(ext))) : extensions;
        }
        init() {
            this.controllerHandler.init();
        }
        finalize() { return true; }
        createNode(sessionId, options) {
            return this.createNodeStatic(this.getProcessing(sessionId), options.element);
        }
        createNodeStatic(processing, element) {
            const sessionId = processing.sessionId;
            const node = new this.Node(this.nextId, sessionId, element);
            this._afterInsertNode(node, sessionId);
            if (processing.afterInsertNode) {
                processing.afterInsertNode.some(item => item.afterInsertNode(node));
            }
            return node;
        }
        afterCreateCache(processing, node) {
            if (this.getUserSetting(processing, 'createElementMap')) {
                const elementMap = this.elementMap;
                processing.cache.each(item => elementMap.set(item.element, item));
            }
        }
        copyTo(pathname, options) {
            var _a;
            return ((_a = this.fileHandler) === null || _a === void 0 ? void 0 : _a.copyTo(pathname, options)) || reject(OPERATION_NOT_SUPPORTED);
        }
        appendTo(pathname, options) {
            var _a;
            return ((_a = this.fileHandler) === null || _a === void 0 ? void 0 : _a.appendTo(pathname, options)) || reject(OPERATION_NOT_SUPPORTED);
        }
        saveAs(filename, options) {
            var _a;
            return ((_a = this.fileHandler) === null || _a === void 0 ? void 0 : _a.saveAs(filename, options)) || reject(OPERATION_NOT_SUPPORTED);
        }
        saveFiles(filename, options) {
            var _a;
            return ((_a = this.fileHandler) === null || _a === void 0 ? void 0 : _a.saveFiles(filename, options)) || reject(OPERATION_NOT_SUPPORTED);
        }
        appendFiles(filename, options) {
            var _a;
            return ((_a = this.fileHandler) === null || _a === void 0 ? void 0 : _a.appendFiles(filename, options)) || reject(OPERATION_NOT_SUPPORTED);
        }
        copyFiles(pathname, options) {
            var _a;
            return ((_a = this.fileHandler) === null || _a === void 0 ? void 0 : _a.copyFiles(pathname, options)) || reject(OPERATION_NOT_SUPPORTED);
        }
        reset() {
            var _a;
            this.controllerHandler.reset();
            (_a = this.resourceHandler) === null || _a === void 0 ? void 0 : _a.reset();
            this.extensions.forEach(ext => ext.reset());
            this.elementMap = new WeakMap();
            this.closed = false;
        }
        parseDocument(...elements) {
            const resource = this.resourceHandler;
            const [processing, rootElements, shadowElements, styleSheets] = this.createThread(elements);
            if (rootElements.length === 0) {
                return reject(DOCUMENT_ROOT_NOT_FOUND);
            }
            const resourceId = processing.resourceId;
            const documentRoot = rootElements[0];
            const [preloadItems, preloaded] = resource ? resource.preloadAssets(resourceId, documentRoot, shadowElements, this.getUserSetting(processing, 'preloadImages'), this.getUserSetting(processing, 'preloadFonts')) : [[], []];
            if (styleSheets) {
                preloadItems.push(...styleSheets);
            }
            if (preloadItems.length) {
                processing.initializing = true;
                return (Promise.allSettled.bind(Promise) || allSettled)(preloadItems.map(item => {
                    return new Promise((success, error) => {
                        if (typeof item === 'string') {
                            fetch(item)
                                .then(async (result) => {
                                if (result.status >= 300) {
                                    error(item + ` (${result.status}: ${result.statusText})`);
                                }
                                else {
                                    const mimeType = result.headers.get('content-type') || '';
                                    if (startsWith$5(mimeType, 'text/css') || styleSheets && styleSheets.includes(item)) {
                                        success({ mimeType: 'text/css', encoding: 'utf8', content: await result.text() });
                                    }
                                    else if (startsWith$5(mimeType, 'image/svg+xml') || FILE$2.SVG.test(item)) {
                                        success({ mimeType: 'image/svg+xml', encoding: 'utf8', content: await result.text() });
                                    }
                                    else {
                                        success({ mimeType: result.headers.get('content-type') || 'font/' + (splitPair$6(item, '.', false, true)[1].toLowerCase() || 'ttf'), buffer: await result.arrayBuffer() });
                                    }
                                }
                            })
                                .catch(err => error(err));
                        }
                        else {
                            item.addEventListener('load', () => success(item));
                            item.addEventListener('error', err => error(err));
                        }
                    });
                }))
                    .then((result) => {
                    let errors;
                    for (let i = 0, length = result.length; i < length; ++i) {
                        const item = result[i];
                        if (item.status === 'rejected') {
                            const message = parseError(item.reason);
                            if (message) {
                                (errors || (errors = [])).push(message);
                            }
                            continue;
                        }
                        const data = preloadItems[i];
                        if (typeof data === 'string') {
                            resource.addRawData(resourceId, data, item.value);
                        }
                        else {
                            resource.addImageElement(resourceId, data);
                        }
                    }
                    if (errors) {
                        const length = errors.length;
                        if (length === 1) {
                            this.writeError('FAIL: ' + errors[0]);
                        }
                        else {
                            this.writeError(getErrorMessage(errors), `FAIL: ${length} errors`);
                        }
                    }
                    for (let i = 0, length = preloaded.length; i < length; ++i) {
                        const image = preloaded[i];
                        if (image.parentElement) {
                            documentRoot.removeChild(image);
                        }
                    }
                    return this.resumeThread(processing, rootElements, elements.length);
                });
            }
            return Promise.resolve(this.resumeThread(processing, rootElements, elements.length));
        }
        parseDocumentSync(...elements) {
            const sessionData = this.createThread(elements, true);
            return this.resumeThread(sessionData[0], sessionData[1], elements.length);
        }
        createThread(elements, sync) {
            const { controllerHandler, resourceHandler, resourceId } = this;
            const rootElements = [];
            const customSettings = [];
            const isEnabled = (settings, name) => settings && name in settings ? settings[name] : this.userSettings[name];
            let length = elements.length, shadowElements, styleSheets;
            if (length === 0) {
                elements.push(this.mainElement);
                length = 1;
            }
            for (let i = 0; i < length; ++i) {
                let item = elements[i], settings = null;
                if (isPlainObject$1(item)) {
                    if (item.element) {
                        settings = item;
                        item = item.element;
                    }
                    else {
                        continue;
                    }
                }
                if (typeof item === 'string') {
                    item = document.getElementById(item);
                }
                if (item && !rootElements.includes(item)) {
                    rootElements.push(item);
                    customSettings.push(settings);
                    if (!sync && resourceHandler && isEnabled(settings, 'pierceShadowRoot') && isEnabled(settings, 'preloadCustomElements')) {
                        item.querySelectorAll('*').forEach(host => {
                            const shadowRoot = host.shadowRoot;
                            if (shadowRoot) {
                                shadowRoot.querySelectorAll('link[href][rel*="stylesheet" i]').forEach((child) => (styleSheets || (styleSheets = [])).push(child.href));
                                (shadowElements || (shadowElements = [])).push(shadowRoot);
                            }
                        });
                    }
                }
            }
            if (rootElements.length === 0) {
                return [{}, rootElements, []];
            }
            const sessionId = controllerHandler.generateSessionId;
            const processing = {
                sessionId,
                resourceId,
                initializing: false,
                cache: new NodeList([], sessionId, resourceId),
                excluded: new NodeList([], sessionId, resourceId),
                rootElements,
                settings: customSettings[0],
                customSettings,
                node: null,
                documentElement: null,
                extensions: []
            };
            newSessionInit(sessionId);
            this.session.active.set(sessionId, processing);
            if (resourceHandler) {
                resourceHandler.createThread(resourceId);
            }
            const queryRoot = rootElements.length === 1 && rootElements[0].parentElement;
            if (queryRoot && queryRoot !== document.documentElement) {
                this.setStyleMap(sessionId, resourceId, document, queryRoot);
            }
            else {
                this.setStyleMap(sessionId, resourceId);
            }
            if (resourceHandler) {
                const queryElements = [queryRoot || document];
                if (shadowElements) {
                    queryElements.push(...shadowElements);
                }
                for (const element of queryElements) {
                    element.querySelectorAll('[style]').forEach((child) => {
                        const { backgroundImage, listStyleImage } = child.style;
                        if (backgroundImage) {
                            parseImageUrl(backgroundImage, location.href, resourceHandler, resourceId);
                        }
                        if (listStyleImage) {
                            parseImageUrl(listStyleImage, location.href, resourceHandler, resourceId);
                        }
                    });
                }
            }
            return [processing, rootElements, shadowElements ? [...rootElements, ...shadowElements] : rootElements, styleSheets];
        }
        resumeThread(processing, rootElements, requestCount) {
            var _a;
            processing.initializing = false;
            const { controllerHandler, extensions } = this;
            const sessionId = processing.sessionId;
            const success = [];
            const removeStyle = controllerHandler.localSettings.adoptedStyleSheet && insertStyleSheetRule(controllerHandler.localSettings.adoptedStyleSheet);
            let enabled, disabled;
            const length = extensions.length;
            if (length) {
                enabled = [];
                for (let i = 0, ext; i < length; ++i) {
                    if ((ext = extensions[i]).enabled) {
                        ext.beforeParseDocument(sessionId);
                        enabled.push(ext);
                    }
                    else {
                        (disabled || (disabled = [])).push(ext);
                    }
                }
            }
            for (let i = 0; i < rootElements.length; ++i) {
                processing.settings = processing.customSettings[i];
                controllerHandler.processUserSettings(processing);
                if (length) {
                    const current = [];
                    const exclude = (_a = processing.settings) === null || _a === void 0 ? void 0 : _a.exclude;
                    for (let j = 0; j < length; ++j) {
                        const ext = extensions[j];
                        if (!(exclude === ext.name || Array.isArray(exclude) && exclude.find(name => name === ext.name))) {
                            ext.beforeCascadeRoot(processing);
                            if (ext.enabled) {
                                current.push(ext);
                            }
                        }
                    }
                    processing.extensions = current;
                }
                const node = this.createCache(processing, rootElements[i]);
                if (node) {
                    this.afterCreateCache(processing, node);
                    success.push(node);
                }
            }
            if (length) {
                for (let i = 0, q = enabled.length; i < q; ++i) {
                    const ext = extensions[i];
                    ext.afterParseDocument(sessionId);
                    ext.enabled = true;
                }
                if (disabled) {
                    disabled.forEach(ext => ext.enabled = false);
                }
            }
            if (removeStyle) {
                removeStyle();
            }
            return requestCount > 1 ? success : success[0];
        }
        createCache(processing, documentRoot) {
            const node = this.createRootNode(processing, documentRoot);
            if (node) {
                this.controllerHandler.sortInitialCache(processing.cache);
            }
            return node;
        }
        setStyleMap(sessionId, resourceId, documentRoot = document, queryRoot) {
            const styleSheets = documentRoot.styleSheets;
            let errors;
            for (let i = 0, length = styleSheets.length; i < length; ++i) {
                const styleSheet = styleSheets[i];
                let query;
                try {
                    query = styleSheet.media.mediaText;
                }
                catch (_a) {
                }
                if (!query || window.matchMedia(query).matches) {
                    try {
                        this.applyStyleSheet(sessionId, resourceId, styleSheet, documentRoot, queryRoot);
                    }
                    catch (err) {
                        (errors || (errors = [])).push(err.message);
                    }
                }
            }
            if (errors) {
                this.writeError(getErrorMessage(errors), CSS_CANNOT_BE_PARSED);
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
                        if (startsWith$5(data[0], namespace) && !extensions.includes(ext = data[1])) {
                            ext.application = this;
                            extensions.push(ext);
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
        getUserSetting(processing, name) {
            if (typeof processing === 'string') {
                processing = this.getProcessing(processing);
            }
            if (processing) {
                const settings = processing.settings;
                if (settings && name in settings) {
                    return settings[name];
                }
            }
            return this.userSettings[name];
        }
        getDatasetName(attr, element) {
            return element.dataset[attr + capitalize(this.systemName)] || element.dataset[attr];
        }
        setDatasetName(attr, element, value) {
            element.dataset[attr + capitalize(this.systemName)] = value;
        }
        addRootElement(sessionId, element) {
            var _a;
            const rootElements = (_a = this.getProcessing(sessionId)) === null || _a === void 0 ? void 0 : _a.rootElements;
            if (rootElements && !rootElements.includes(element)) {
                rootElements.push(element);
            }
        }
        writeError(message, hint) {
            (this.userSettings.showErrorMessages ? alert : console.log)((hint ? hint + '\n\n' : '') + message); // eslint-disable-line no-console
        }
        toString() {
            return this.systemName;
        }
        createRootNode(processing, rootElement) {
            const { sessionId, resourceId } = processing;
            const extensions = processing.extensions.filter(item => !!item.beforeInsertNode);
            const node = this.cascadeParentNode(processing, sessionId, resourceId, rootElement, 0, this.getUserSetting(processing, 'pierceShadowRoot'), this.getUserSetting(processing, 'createQuerySelectorMap'), extensions.length ? extensions : null);
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
                        this._afterInsertNode(parent, sessionId);
                        for (let i = 0; i < length; ++i) {
                            const element = children[i];
                            let child;
                            if (element === previousElement) {
                                child = previousNode;
                            }
                            else {
                                child = new this.Node(id--, sessionId, element);
                                this._afterInsertNode(child, sessionId);
                            }
                            child.internalSelf(parent, depth + 1, i);
                            child.actualParent = parent;
                            elements[i] = child;
                        }
                        parent.internalNodes(elements, elements);
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
        cascadeParentNode(processing, sessionId, resourceId, parentElement, depth, pierceShadowRoot, createQuerySelectorMap, extensions, shadowParent) {
            const node = this.insertNode(processing, parentElement);
            if (node) {
                if (depth === 0) {
                    processing.cache.add(node);
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
                let inlineText = true, plainText = false, j = 0;
                for (let i = 0; i < length; ++i) {
                    const element = childNodes[i];
                    let child;
                    if (element.nodeName[0] === '#') {
                        if (this.visibleText(node, element)) {
                            if (child = this.insertNode(processing, element)) {
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
                        if (pierceShadowRoot && (shadowRoot = element.shadowRoot)) {
                            this.setStyleMap(sessionId, resourceId, shadowRoot);
                        }
                        if (child = (shadowRoot || element).childNodes.length ? this.cascadeParentNode(processing, sessionId, resourceId, element, childDepth, pierceShadowRoot, createQuerySelectorMap, extensions, shadowRoot || shadowParent) : this.insertNode(processing, element)) {
                            elements.push(child);
                            inlineText = false;
                        }
                    }
                    else if (child = this.insertNode(processing, element)) {
                        processing.excluded.add(child);
                    }
                    if (child) {
                        child.internalSelf(node, childDepth, j++);
                        child.actualParent = node;
                        if (shadowParent) {
                            child.shadowHost = shadowParent;
                        }
                        children.push(child);
                    }
                }
                node.internalNodes(children, elements);
                if (hostElement !== parentElement) {
                    node.shadowRoot = true;
                }
                if (j > 0) {
                    node.inlineText = inlineText && plainText;
                    node.retainAs(children);
                    if (j > 1) {
                        processing.cache.addAll(children);
                    }
                    else {
                        processing.cache.add(children[0]);
                    }
                }
                if (elements.length && createQuerySelectorMap) {
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
                        else {
                            result[k] = q === 1 ? childMap[j] : childMap[j].slice(0);
                        }
                    }
                }
            }
            return result;
        }
        applyStyleRule(sessionId, resourceId, item, documentRoot, queryRoot) {
            var _a, _b;
            const resource = this.resourceHandler;
            const cssText = item.cssText;
            switch (item.type) {
                case CSSRule.STYLE_RULE: {
                    const hostElement = documentRoot.host;
                    const baseMap = {};
                    const cssStyle = item.style;
                    let important;
                    for (let i = 0, length = cssStyle.length; i < length; ++i) {
                        const attr = cssStyle[i];
                        const baseAttr = convertCamelCase$1(attr);
                        let value = cssStyle[attr];
                        if (value === 'initial') {
                            const property = CSS_PROPERTIES$1[baseAttr];
                            if (property) {
                                if (property.value === 'auto') {
                                    value = 'auto';
                                }
                                else {
                                    for (const parentAttr in CSS_SHORTHANDNONE) {
                                        const css = CSS_SHORTHANDNONE[parentAttr];
                                        if (css.value.includes(baseAttr)) {
                                            if (property.valueOfNone && new RegExp(`\\s${css.name}:\\s+none\\s*;`).test(cssText)) {
                                                value = property.valueOfNone;
                                            }
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        else if (value === 'none') {
                            const property = CSS_SHORTHANDNONE[baseAttr];
                            if (property) {
                                for (const subAttr of property.value) {
                                    const valueOfNone = CSS_PROPERTIES$1[subAttr].valueOfNone;
                                    if (valueOfNone) {
                                        baseMap[subAttr] = valueOfNone;
                                    }
                                }
                            }
                        }
                        else if (value) {
                            switch (baseAttr) {
                                case 'backgroundImage':
                                case 'listStyleImage':
                                case 'content':
                                    value = parseImageUrl(value, (_a = item.parentStyleSheet) === null || _a === void 0 ? void 0 : _a.href, resource, resourceId);
                                    break;
                            }
                        }
                        else if (baseAttr in cssStyle) {
                            value = 'revert';
                        }
                        else {
                            continue;
                        }
                        baseMap[baseAttr] = value;
                    }
                    if (cssText.indexOf('!') !== -1) {
                        important = [];
                        let property, match;
                        while (match = REGEXP_IMPORTANT.exec(cssText)) {
                            const attr = convertCamelCase$1(match[1]);
                            if ((property = CSS_PROPERTIES$1[attr]) && Array.isArray(property.value)) {
                                property.value.forEach(subAttr => important.push(subAttr));
                            }
                            else {
                                important.push(attr);
                            }
                        }
                        REGEXP_IMPORTANT.lastIndex = 0;
                    }
                    const { usedSelector, unusedSelector } = this.session;
                    for (const selectorText of parseSelectorText$1(item.selectorText)) {
                        const specificity = getSpecificity(selectorText);
                        const [selector, target] = splitPair$6(selectorText, '::');
                        const targetElt = target ? '::' + target : '';
                        let elements;
                        if (startsWith$5(selector, ':host')) {
                            if (!hostElement) {
                                continue;
                            }
                            valid: {
                                if (selector !== ':host') {
                                    const host = REGEXP_CSSHOST.exec(selector);
                                    if (host) {
                                        if (host[1] === '*') {
                                            break valid;
                                        }
                                        else {
                                            const result = document.querySelectorAll(host[1] === 'host' ? hostElement.tagName + host[1] : host[1] + ' ' + hostElement.tagName);
                                            for (let i = 0, length = result.length; i < length; ++i) {
                                                if (result[i] === hostElement) {
                                                    break valid;
                                                }
                                            }
                                        }
                                    }
                                    continue;
                                }
                            }
                            elements = [hostElement];
                        }
                        else {
                            elements = (queryRoot || documentRoot).querySelectorAll(selector || '*');
                        }
                        const length = elements.length;
                        if (length === 0) {
                            if (unusedSelector) {
                                unusedSelector.call(this, sessionId, item, selectorText, hostElement);
                            }
                            continue;
                        }
                        else if (usedSelector) {
                            usedSelector.call(this, sessionId, item, selectorText, hostElement);
                        }
                        const attrStyle = 'styleMap' + targetElt;
                        const attrSpecificity = 'styleSpecificity' + targetElt;
                        for (let i = 0; i < length; ++i) {
                            const element = elements[i];
                            const styleData = getElementCache$1(element, attrStyle, sessionId);
                            if (styleData) {
                                const specificityData = getElementCache$1(element, attrSpecificity, sessionId);
                                let revised;
                                for (const attr in baseMap) {
                                    if (important && important.includes(attr)) {
                                        const values = specificity.slice(0);
                                        values.splice(0, 0, 1, 0);
                                        revised = values;
                                    }
                                    else {
                                        revised = specificity;
                                    }
                                    if (compareSpecificity(revised, specificityData[attr])) {
                                        styleData[attr] = baseMap[attr];
                                        specificityData[attr] = revised;
                                    }
                                }
                            }
                            else {
                                const style = Object.assign({}, baseMap);
                                const specificityData = {};
                                for (const attr in style) {
                                    if (important && important.includes(attr)) {
                                        const values = specificity.slice(0);
                                        values.splice(0, 0, 1, 0);
                                        specificityData[attr] = values;
                                    }
                                    else {
                                        specificityData[attr] = specificity;
                                    }
                                }
                                setElementCache$1(element, 'sessionId', sessionId);
                                setElementCache$1(element, attrStyle, style, sessionId);
                                setElementCache$1(element, attrSpecificity, specificityData, sessionId);
                            }
                        }
                    }
                    break;
                }
                case CSSRule.FONT_FACE_RULE:
                    if (resource) {
                        resource.parseFontFace(resourceId, cssText, (_b = item.parentStyleSheet) === null || _b === void 0 ? void 0 : _b.href);
                    }
                    break;
                case CSSRule.SUPPORTS_RULE:
                    this.applyCssRules(sessionId, resourceId, item.cssRules, documentRoot);
                    break;
            }
        }
        applyStyleSheet(sessionId, resourceId, item, documentRoot, queryRoot) {
            var _a;
            try {
                const cssRules = item.cssRules;
                if (cssRules) {
                    const resource = this.resourceHandler;
                    const parseConditionText = (rule, value) => { var _a; return ((_a = new RegExp(`@${rule}([^{]+)`).exec(value)) === null || _a === void 0 ? void 0 : _a[1].trim()) || value; };
                    for (let i = 0, length = cssRules.length; i < length; ++i) {
                        const rule = cssRules[i];
                        switch (rule.type) {
                            case CSSRule.STYLE_RULE:
                            case CSSRule.FONT_FACE_RULE:
                                this.applyStyleRule(sessionId, resourceId, rule, documentRoot, queryRoot);
                                break;
                            case CSSRule.IMPORT_RULE:
                                if (resource) {
                                    const uri = resolvePath$2(rule.href, (_a = rule.parentStyleSheet) === null || _a === void 0 ? void 0 : _a.href);
                                    if (uri) {
                                        resource.addRawData(resourceId, uri, { mimeType: 'text/css', encoding: 'utf8' });
                                    }
                                }
                                this.applyStyleSheet(sessionId, resourceId, rule.styleSheet, documentRoot, queryRoot);
                                break;
                            case CSSRule.MEDIA_RULE: {
                                const conditionText = rule.conditionText || parseConditionText('media', rule.cssText);
                                if (window.matchMedia(conditionText).matches) {
                                    this.applyCssRules(sessionId, resourceId, rule.cssRules, documentRoot, queryRoot);
                                }
                                else {
                                    this.parseStyleRules(sessionId, resourceId, rule.cssRules);
                                    const unusedMedia = this.session.unusedMedia;
                                    if (unusedMedia) {
                                        unusedMedia.call(this, sessionId, rule, conditionText, documentRoot.host);
                                    }
                                }
                                break;
                            }
                            case CSSRule.SUPPORTS_RULE: {
                                const conditionText = rule.conditionText || parseConditionText('supports', rule.cssText);
                                if (CSS.supports(conditionText)) {
                                    this.applyCssRules(sessionId, resourceId, rule.cssRules, documentRoot, queryRoot);
                                }
                                else {
                                    this.parseStyleRules(sessionId, resourceId, rule.cssRules);
                                    const unusedSupports = this.session.unusedSupports;
                                    if (unusedSupports) {
                                        unusedSupports.call(this, sessionId, rule, conditionText, documentRoot.host);
                                    }
                                }
                                break;
                            }
                            case CSSRule.KEYFRAMES_RULE:
                                if (resource) {
                                    resource.parseKeyFrames(resourceId, rule);
                                }
                                break;
                        }
                    }
                }
            }
            catch (err) {
                throw new Error((item.href ? item.href + ' - ' : '') + err);
            }
        }
        applyCssRules(sessionId, resourceId, rules, documentRoot, queryRoot) {
            for (let i = 0, length = rules.length; i < length; ++i) {
                this.applyStyleRule(sessionId, resourceId, rules[i], documentRoot, queryRoot);
            }
        }
        parseStyleRules(sessionId, resourceId, rules) {
            var _a;
            const resource = this.resourceHandler;
            if (resource) {
                for (let i = 0, length = rules.length; i < length; ++i) {
                    const item = rules[i];
                    switch (item.type) {
                        case CSSRule.STYLE_RULE: {
                            const cssStyle = item.style;
                            for (let j = 0, q = cssStyle.length; j < q; ++j) {
                                const attr = cssStyle[j];
                                switch (attr) {
                                    case 'background-image':
                                    case 'list-style-image':
                                    case 'content': {
                                        const value = cssStyle[attr];
                                        if (value !== 'initial') {
                                            parseImageUrl(value, (_a = item.parentStyleSheet) === null || _a === void 0 ? void 0 : _a.href, resource, resourceId);
                                        }
                                        break;
                                    }
                                }
                            }
                            break;
                        }
                        case CSSRule.FONT_FACE_RULE:
                            this.applyStyleRule(sessionId, resourceId, item, document);
                            break;
                    }
                }
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
        get fileHandler() {
            var _a;
            return ((_a = this.resourceHandler) === null || _a === void 0 ? void 0 : _a.fileHandler) || null;
        }
        get extensionManager() {
            return this._extensionManager;
        }
        get sessionAll() {
            const active = this.session.active;
            if (active.size === 1) {
                const processing = active.values().next().value;
                return [processing.extensions, processing.cache.children];
            }
            const extensions = [];
            const children = [];
            for (const processing of active.values()) {
                if (extensions.length) {
                    const items = processing.extensions;
                    for (let i = 0, length = items.length; i < length; ++i) {
                        const item = items[i];
                        if (!extensions.includes(item)) {
                            extensions.push(item);
                        }
                    }
                }
                else {
                    extensions.push(...processing.extensions);
                }
                children.push(...processing.cache.children);
            }
            return [extensions, children];
        }
        get resourceId() {
            let result = -1;
            if (this.resourceHandler) {
                const ASSETS = this.resourceHandler.mapOfAssets;
                ASSETS[result = ASSETS.length] = null;
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
    Application.KEY_NAME = 'squared.base.application';

    const { padStart } = squared.lib.util;
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
            this._sessionId = 0;
        }
        init() { }
        reset() { }
        processUserSettings(processing) { }
        sortInitialCache(cache) { }
        applyDefaultStyles(processing, element, pseudoElt) { }
        includeElement(element) { return true; }
        preventNodeCascade(node) { return false; }
        afterInsertNode(node, sessionId) { }
        get generateSessionId() {
            return padStart((++this._sessionId).toString(), 5, '0');
        }
    }
    Controller.KEY_NAME = 'squared.base.controller';

    class Extension {
        constructor(name, framework, options) {
            this.name = name;
            this.framework = framework;
            this.enabled = true;
            this.resource = null;
            this.data = new WeakMap();
            this.options = {};
            this.dependencies = [];
            this.subscribers = new Set();
            if (options) {
                const items = options.dependencies;
                if (items) {
                    this.dependencies.push(...items);
                }
                Object.assign(this.options, options);
            }
        }
        require(value) {
            this.dependencies.push(value);
        }
        reset() {
            if (this.subscribers.size) {
                this.subscribers.clear();
            }
        }
        beforeParseDocument(sessionId) { }
        beforeCascadeRoot(processing) { }
        afterParseDocument(sessionId) { }
        set application(value) {
            this._application = value;
            this.controller = value.controllerHandler;
            this.resource = value.resourceHandler;
        }
        get application() {
            return this._application;
        }
    }

    const { findSet, isObject: isObject$2 } = squared.lib.util;
    class ExtensionManager {
        constructor(application) {
            this.application = application;
            this.cache = new Set();
        }
        add(ext) {
            if (typeof ext === 'string' && !(ext = this.get(ext, true))) {
                return false;
            }
            if (ext instanceof Extension) {
                const { application, extensions } = this;
                if (ext.framework === 0 || ext.framework & application.framework) {
                    ext.application = application;
                    if (!extensions.includes(ext)) {
                        extensions.push(ext);
                    }
                    return true;
                }
            }
            return false;
        }
        remove(ext) {
            if (typeof ext === 'string' && !(ext = this.get(ext, true))) {
                return false;
            }
            if (ext instanceof Extension) {
                const name = ext.name;
                const index = this.extensions.findIndex(item => item.name === name);
                if (index !== -1) {
                    this.extensions.splice(index, 1);
                    return true;
                }
            }
            return false;
        }
        get(name, builtIn) {
            return this.extensions.find(item => item.name === name) || findSet(this.cache, item => item.name === name) || (builtIn ? this.application.builtInExtensions.get(name) : undefined);
        }
        checkDependencies() {
            const { application, extensions } = this;
            let result;
            for (let i = 0; i < extensions.length; ++i) {
                const items = extensions[i].dependencies;
                for (let j = 0, k = 1, q = items.length; j < q; ++j) {
                    const item = items[j];
                    const name = item.name;
                    const index = extensions.findIndex(ext => ext.name === name);
                    if (index === -1) {
                        const ext = application.builtInExtensions.get(name);
                        if (ext) {
                            ext.application = application;
                            if (item.leading) {
                                extensions.splice(i - 1, 0, ext);
                            }
                            else if (item.trailing) {
                                extensions.splice(i + k++, 0, ext);
                            }
                            else {
                                extensions.push(ext);
                            }
                            continue;
                        }
                    }
                    if (index !== -1) {
                        if (item.leading) {
                            if (index > i) {
                                extensions.splice(i - 1, 0, extensions.splice(index, 1)[0]);
                            }
                        }
                        else if (item.trailing) {
                            if (index < i) {
                                extensions.splice(i + 1 + k++, 0, extensions.splice(index, 1)[0]);
                            }
                        }
                    }
                    else {
                        (result || (result = [])).push(extensions[i].name + `[${name}]`);
                        extensions.splice(i--, 1);
                        break;
                    }
                }
            }
            return result;
        }
        valueOf(name, attr, fallback) {
            var _a;
            const options = (_a = this.get(name, true)) === null || _a === void 0 ? void 0 : _a.options;
            return isObject$2(options) ? options[attr] : fallback;
        }
        valueAsObject(name, attr, fallback = null) {
            const value = this.valueOf(name, attr);
            return isObject$2(value) ? value : fallback;
        }
        valueAsString(name, attr, fallback = '') {
            const value = this.valueOf(name, attr);
            return typeof value === 'string' ? value : fallback;
        }
        valueAsNumber(name, attr, fallback = NaN) {
            const value = this.valueOf(name, attr);
            return typeof value === 'number' ? value : fallback;
        }
        valueAsBoolean(name, attr, fallback = false) {
            const value = this.valueOf(name, attr);
            return typeof value === 'boolean' ? value : fallback;
        }
        get extensions() {
            return this.application.extensions;
        }
    }

    const { CSS_ANGLE, LENGTH_PERCENTAGE, QUOTED } = squared.lib.regex.STRING;
    const CSS_COLOR = '((?:rgb|hsl)a?\\(\\s*\\d+\\s*,\\s*\\d+%?\\s*,\\s*\\d+%?\\s*(?:,\\s*[\\d.]+\\s*)?\\)|#[A-Za-z\\d]{3,8}|[a-z]{3,})';
    const DOM_ENTITY = '#(?:[\\d]+|x[A-Za-z\\d]{5});?|[A-Za-z]{2,};';
    const STRING$2 = {
        CSS_COLOR,
        CSS_COLORSTOP: `\\s*${CSS_COLOR}\\s*(?:(${LENGTH_PERCENTAGE}|${CSS_ANGLE}|(?:c(?:alc|lamp)|m(?:in|ax))\\((.+)\\)(?=\\s*,)|(?:c(?:alc|lamp)|m(?:in|ax))\\((.+)\\))\\s*,?)*\\s*,?`,
        CSS_QUOTE: `(${QUOTED}|[^\\s]+)\\s+(${QUOTED}|[^\\s]+)`,
        CSS_VARNAME: 'var\\(\\s*(--[^\\s:,)]*)\\s*(?!:)',
        CSS_VARVALUE: '(--[^\\s:]*)\\s*:([^;}]+)'
    };
    const CSS$2 = {
        TRANSPARENT: /\b(?:(?:rgb|hsl)a\([^,]+,[^,]+,[^,]+,\s*0(\.0*)?\s*\)|transparent)/,
        BACKGROUNDIMAGE_G: new RegExp(`url\\([^)]+\\)|initial|(repeating-)?(linear|radial|conic)-gradient\\(((?:to\\s+[a-z\\s]+|(?:from\\s+)?-?[\\d.]+(?:deg|rad|turn|grad)|(?:circle|ellipse)?\\s*(?:closest-side|closest-corner|farthest-side|farthest-corner)?)?\\s*(?:(?:(?:-?[\\d.]+(?:[a-z%]+)?\\s*)+)?(?:at\\s+[\\w\\s%]+)?)?)\\s*,?\\s*((?:${STRING$2.CSS_COLORSTOP})+)\\)`, 'g')
    };
    const DOM = {
        SRCSET: /^(.*?)(?:\s+([\d.]+)\s*([xw]))?$/i,
        ENTITY_G: new RegExp('&' + DOM_ENTITY, 'g'),
        AMPERSAND_G: new RegExp(`&(?!${DOM_ENTITY})`, 'g')
    };

    var regex = /*#__PURE__*/Object.freeze({
        __proto__: null,
        STRING: STRING$2,
        CSS: CSS$2,
        DOM: DOM
    });

    const { endsWith: endsWith$2, escapePattern: escapePattern$2, hasValue: hasValue$1, isObject: isObject$1, replaceAll: replaceAll$1, splitPair: splitPair$5, splitPairEnd: splitPairEnd$1, splitPairStart: splitPairStart$1, startsWith: startsWith$4, trimEnclosing } = squared.lib.util;
    class GlobExp extends RegExp {
        constructor(source, flags, negate) {
            super(source, flags);
            this.negate = negate;
        }
        test(value) {
            return this.negate ? !super.test(value) : super.test(value);
        }
        filter(values) {
            return values.filter(value => this.test(value));
        }
    }
    const EXT_DATA = {
        '3gp': 'video/3gpp',
        '3g2': 'video/3gpp2',
        '7z': 'application/x-7z-compressed',
        aac: 'audio/aac',
        abw: 'application/x-abiword',
        apng: 'image/apng',
        arc: 'application/x-freearc',
        asf: 'video/x-ms-asf',
        asx: 'video/x-ms-asf',
        atom: 'application/atom+xml',
        avi: 'video/x-msvideo',
        avif: 'image/avif',
        azw: 'application/vnd.amazon.ebook',
        bin: 'application/octet-stream',
        bmp: 'image/bmp',
        bmpf: 'image/bmp',
        bmpp: 'image/bmp',
        bz: 'application/x-bzip',
        bz2: 'application/x-bzip2',
        cgi: 'application/x-httpd-cgi',
        csh: 'application/x-csh',
        css: 'text/css',
        csv: 'text/csv',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        eot: 'application/vnd.ms-fontobject',
        epub: 'application/epub+zip',
        flac: 'audio/flac',
        flv: 'video/x-flv',
        gif: 'image/gif',
        gsm: 'audio/gsm',
        h264: 'h264',
        heic: 'image/heic',
        heif: 'image/heif',
        htc: 'text/x-component',
        htm: 'text/html',
        html: 'text/html',
        shtml: 'text/html',
        cur: 'image/x-icon',
        ico: 'image/x-icon',
        ics: 'text/calendar',
        jad: 'text/vnd.sun.j2me.app-descriptor',
        jar: 'application/java-archive',
        java: 'text/x-java-source',
        jpeg: 'image/jpeg',
        jpg: 'image/jpeg',
        jfif: 'image/jpeg',
        pjpeg: 'image/jpeg',
        pjp: 'image/jpeg',
        jpeg2000: 'video/jpeg2000',
        js: 'text/javascript',
        mjs: 'text/javascript',
        json: 'application/json',
        jsonp: 'application/javascript',
        jsonld: 'application/ld+json',
        m3u8: 'application/vnd.apple.mpegurl',
        md: 'text/markdown',
        kar: 'audio/midi',
        mid: 'audio/midi',
        midi: 'audio/midi',
        mks: 'video/x-matroska',
        mkv: 'video/x-matroska',
        mk3d: 'video/x-matroska',
        mml: 'text/mathml',
        mng: 'video/x-mng',
        mov: 'video/quicktime',
        mp3: 'audio/mpeg',
        mpeg: 'audio/mpeg',
        mp4: 'video/mp4',
        m4a: 'video/mp4',
        m4v: 'video/x-m4v',
        mpd: 'application/dash+xml',
        mpkg: 'application/vnd.apple.installer+xml',
        odg: 'application/vnd.oasis.opendocument.graphics',
        odp: 'application/vnd.oasis.opendocument.presentation',
        ods: 'application/vnd.oasis.opendocument.spreadsheet',
        odt: 'application/vnd.oasis.opendocument.text',
        oga: 'audio/ogg',
        spx: 'audio/ogg',
        ogg: 'audio/ogg',
        ogv: 'video/ogg',
        ogm: 'video/ogg',
        ogx: 'application/ogg',
        otf: 'font/otf',
        pl: 'application/x-perl',
        png: 'image/png',
        pdf: 'application/pdf',
        ppt: 'application/vnd.ms-powerpoint',
        pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        ps: 'application/postscript',
        ra: 'audio/x-realaudio',
        rar: 'application/x-rar-compressed',
        rss: 'application/rss+xml',
        rtf: 'application/rtf',
        sgml: 'text/sgml',
        sh: 'application/x-sh',
        svg: 'image/svg+xml',
        svgz: 'image/svg+xml',
        swf: 'application/x-shockwave-flash',
        tar: 'application/x-tar',
        tif: 'image/tiff',
        tiff: 'image/tiff',
        ts: 'video/mp2t',
        tsv: 'text/tab-separated-values',
        ttf: 'font/ttf',
        truetype: 'font/ttf',
        txt: 'text/plain',
        vsd: 'application/vnd.visio',
        vtt: 'text/vtt',
        wav: 'audio/wave',
        wbmp: 'image/vnd.wap.wbmp',
        weba: 'audio/webm',
        webm: 'video/webm',
        webp: 'image/webp',
        woff: 'font/woff',
        woff2: 'font/woff2',
        xhtml: 'application/xhtml+xml',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        xml: 'application/xml',
        xul: 'application/vnd.mozilla.xul+xml',
        wml: 'text/vnd.wap.wml',
        wmv: 'video/x-ms-wmv',
        yaml: 'text/yaml',
        yml: 'text/yaml',
        zip: 'application/zip'
    };
    const CACHE_UUID = {};
    const HEX_STRING = '0123456789abcdef';
    function fromMimeType(value) {
        const [type, name] = splitPair$5(value, '/');
        switch (type) {
            case 'image':
                switch (name) {
                    case 'apng':
                    case 'avif':
                    case 'bmp':
                    case 'heic':
                    case 'heif':
                    case 'gif':
                    case 'png':
                    case 'webp':
                        return name;
                    case 'vnd.wap.wbmp':
                        return 'wbmp';
                    case 'jpeg':
                        return 'jpg';
                    case 'svg+xml':
                        return 'svg';
                    case 'tiff':
                        return 'tif';
                    case 'x-ms-bmp':
                        return 'bmp';
                    case 'x-icon':
                        return 'ico';
                }
                break;
            case 'audio':
                switch (name) {
                    case 'aac':
                    case 'flac':
                    case 'gsm':
                    case 'ogg':
                    case 'wav':
                    case 'webm':
                        return name;
                    case 'midi':
                        return 'mid';
                    case 'mpeg':
                        return 'mp3';
                    case 'x-matroska':
                        return 'mka';
                    case 'x-realaudio':
                        return 'ra';
                    case 'wave':
                    case 'x-wav':
                    case 'x-pn-wav':
                        return 'wav';
                }
                break;
            case 'video':
                switch (name) {
                    case 'h264':
                    case 'jpeg2000':
                    case 'mp4':
                    case 'mpeg':
                    case 'webm':
                        return name;
                    case '3gpp':
                        return '3gp';
                    case '3gpp2':
                        return '3g2';
                    case 'ogg':
                        return 'ogv';
                    case 'mp2t':
                        return 'ts';
                    case 'quicktime':
                        return 'mov';
                    case 'x-ms-asf':
                        return 'asf';
                    case 'x-flv':
                        return 'flv';
                    case 'x-m4v':
                        return 'm4v';
                    case 'x-matroska':
                        return 'mkv';
                    case 'x-mng':
                        return 'mng';
                    case 'x-ms-wmv':
                        return 'wmv';
                    case 'x-msvideo':
                        return 'avi';
                }
                break;
            case 'text':
                switch (name) {
                    case 'css':
                    case 'csv':
                    case 'html':
                    case 'sgml':
                    case 'vtt':
                    case 'xml':
                        return name;
                    case 'calendar':
                        return 'ics';
                    case 'javascript':
                        return 'js';
                    case 'markdown':
                        return 'md';
                    case 'mathml':
                        return 'mml';
                    case 'plain':
                        return 'txt';
                    case 'tab-separated-values':
                        return 'tsv';
                    case 'vnd.sun.j2me.app-descriptor':
                        return 'jad';
                    case 'vnd.wap.wml':
                        return 'wml';
                    case 'x-component':
                        return 'htc';
                    case 'x-java-source':
                        return 'java';
                    case 'yaml':
                        return 'yml';
                }
                break;
            case 'font':
                switch (name) {
                    case 'otf':
                    case 'ttf':
                    case 'woff':
                    case 'woff2':
                        return name;
                    case 'sfnt':
                        return 'ttf';
                }
                break;
            case 'application':
                switch (value) {
                    case 'json':
                    case 'pdf':
                    case 'rtf':
                    case 'zip':
                        return name;
                    case 'atom+xml':
                        return 'atom';
                    case 'dash+xml':
                        return 'mpd';
                    case 'epub+zip':
                        return 'epub';
                    case 'java-archive':
                        return 'jar';
                    case 'ld+json':
                        return 'jsonld';
                    case 'msword':
                        return 'doc';
                    case 'postscript':
                        return 'ps';
                    case 'octet-stream':
                        return 'bin';
                    case 'ogg':
                        return 'ogx';
                    case 'rss+xml':
                        return 'rss';
                    case 'vnd.amazon.ebook':
                        return 'azw';
                    case 'vnd.apple.installer+xml':
                        return 'mpkg';
                    case 'vnd.apple.mpegurl':
                    case 'x-mpegurl':
                        return 'm3u8';
                    case 'vnd.mozilla.xul+xml':
                        return 'xul';
                    case 'vnd.ms-excel':
                        return 'xls';
                    case 'vnd.ms-fontobject':
                        return 'eot';
                    case 'vnd.ms-powerpoint':
                        return 'ppt';
                    case 'vnd.oasis.opendocument.graphics':
                        return 'odg';
                    case 'vnd.oasis.opendocument.presentation':
                        return 'odp';
                    case 'vnd.oasis.opendocument.spreadsheet':
                        return 'ods';
                    case 'vnd.oasis.opendocument.text':
                        return 'odt';
                    case 'vnd.openxmlformats-officedocument.presentationml.presentation':
                        return 'pptx';
                    case 'vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                        return 'xlsx';
                    case 'vnd.openxmlformats-officedocument.wordprocessingml.document':
                        return 'docx';
                    case 'vnd.visio':
                        return 'vsd';
                    case 'x-7z-compressed':
                        return '7z';
                    case 'x-abiword':
                        return 'abw';
                    case 'x-bzip':
                        return 'bz';
                    case 'x-bzip2':
                        return 'bz2';
                    case 'x-httpd-cgi':
                        return 'cgi';
                    case 'x-csh':
                        return 'csh';
                    case 'x-freearc':
                        return 'arc';
                    case 'x-perl':
                        return 'pl';
                    case 'x-rar-compressed':
                        return 'rar';
                    case 'x-sh':
                        return 'sh';
                    case 'x-shockwave-flash':
                        return 'swf';
                    case 'x-tar':
                        return 'tar';
                    case 'xhtml+xml':
                        return 'xhtml';
                }
                break;
        }
        return '';
    }
    function parseMimeType(value) {
        return EXT_DATA[splitPairEnd$1(splitPairStart$1(value = value.toLowerCase(), '?'), '.', true, true) || value] || '';
    }
    function getComponentEnd(value, leading = '?', trailing = '/') {
        return splitPairEnd$1(splitPairStart$1(value, leading), trailing, false, true);
    }
    function appendSeparator(preceding = '', value = '', separator = '/') {
        preceding = preceding.trim();
        value = value.trim();
        switch (separator) {
            case '\\':
                preceding && (preceding = replaceAll$1(preceding, '/', '\\'));
                value && (value = replaceAll$1(value, '/', '\\'));
                break;
            case '/':
                preceding && (preceding = replaceAll$1(preceding, '\\', '/'));
                value && (value = replaceAll$1(value, '\\', '/'));
                break;
        }
        return preceding + (preceding && value && !endsWith$2(preceding, separator) && !startsWith$4(value, separator) ? separator : '') + value;
    }
    function assignEmptyValue(dest, ...attrs) {
        const length = attrs.length;
        if (length > 1) {
            let current = dest, i = 0;
            do {
                const name = attrs[i];
                const value = current[name];
                if (i === length - 2) {
                    if (!hasValue$1(value)) {
                        current[name] = attrs[i + 1];
                    }
                    break;
                }
                else if (name) {
                    if (value === undefined || value === null) {
                        current = {};
                        current[name] = current;
                    }
                    else if (isObject$1(value)) {
                        current = value;
                    }
                    else {
                        break;
                    }
                }
                else {
                    break;
                }
            } while (++i);
        }
    }
    function generateUUID(format = '8-4-4-4-12') {
        return (CACHE_UUID[format] || format.match(/(\d+|[^\d]+)/g)).reduce((a, b) => {
            const length = +b;
            if (!isNaN(length)) {
                for (let i = 0; i < length; ++i) {
                    a += HEX_STRING[Math.floor(Math.random() * 16)];
                }
                return a;
            }
            return a + b;
        }, '');
    }
    function upperCaseString(value) {
        const pattern = /\b([a-z])/g;
        let result, match;
        while (match = pattern.exec(value)) {
            (result || (result = value.split('')))[match.index] = match[1][0].toUpperCase();
        }
        return result ? result.join('') : value;
    }
    function lowerCaseString(value) {
        const entities = DOM.ENTITY_G.exec(value);
        return entities ? value.split(DOM.ENTITY_G).reduce((a, b, index) => a + b.toLowerCase() + (entities[index] || ''), '') : value.toLowerCase();
    }
    function* searchObject(obj, value, checkName) {
        const start = value[0] === '*';
        const end = endsWith$2(value, '*');
        const search = start && end
            ? (a) => a.indexOf(value.replace(/^\*/, '').replace(/\*$/, '')) !== -1
            : start
                ? (a) => endsWith$2(a, value.replace(/^\*/, ''))
                : end
                    ? (a) => startsWith$4(a, value.replace(/\*$/, ''))
                    : (a) => a === value;
        for (const attr in obj) {
            if (checkName) {
                if (search(attr)) {
                    yield [attr, obj[attr]];
                }
            }
            else if (typeof obj[attr] === 'string' && search(obj[attr])) {
                yield [attr, obj[attr]];
            }
        }
    }
    function trimBoth(value, char = '"', trim) {
        if (trim) {
            value = value.trim();
        }
        const length = value.length;
        return value[0] === char && value[length - 1] === char ? trimEnclosing(value) : value;
    }
    function trimString(value, pattern) {
        if (pattern.length === 1) {
            return trimEnd(trimStart(value, pattern), pattern);
        }
        const match = new RegExp(`^(?:${pattern = escapePattern$2(pattern)})*([\\s\\S]*?)(?:${pattern})*$`).exec(value);
        return match ? match[1] : value;
    }
    function trimStart(value, pattern) {
        if (pattern.length === 1) {
            for (let i = 0, length = value.length; i < length; ++i) {
                if (value[i] !== pattern) {
                    if (i > 0) {
                        return value.substring(i);
                    }
                    break;
                }
            }
            return value;
        }
        const match = new RegExp(`^(?:${escapePattern$2(pattern)})+`).exec(value);
        return match ? value.substring(match[0].length) : value;
    }
    function trimEnd(value, pattern) {
        if (pattern.length === 1) {
            for (let i = value.length - 1, j = 0; i >= 0; --i, ++j) {
                if (value[i] !== pattern) {
                    if (j > 0) {
                        return value.substring(0, value.length - j);
                    }
                    break;
                }
            }
            return value;
        }
        const match = new RegExp(`(?:${escapePattern$2(pattern)})+$`).exec(value);
        return match ? value.substring(0, value.length - match[0].length) : value;
    }
    function flatArray(list, depth = 1, current = 0) {
        const result = [];
        for (let i = 0, length = list.length; i < length; ++i) {
            const item = list[i];
            if (current < depth && Array.isArray(item)) {
                if (item.length) {
                    result.push(...flatArray(item, depth, current + 1));
                }
            }
            else if (item !== undefined && item !== null) {
                result.push(item);
            }
        }
        return result;
    }
    function parseGlob(value, options) {
        let flags = '', fromEnd;
        if (options) {
            if (options.caseSensitive === false) {
                flags += 'i';
            }
            fromEnd = options.fromEnd;
        }
        const trimCurrent = (cwd) => fromEnd && startsWith$4(cwd, './') ? cwd.substring(2) : cwd;
        const source = ((!fromEnd ? '^' : '') + trimCurrent(value = value.trim()))
            .replace(/\\\\([^\\])/g, (...match) => ':' + match[1].charCodeAt(0))
            .replace(/\\|\/\.\/|\/[^/]+\/\.\.\//g, '/')
            .replace(/\{([^}]+)\}/g, (...match) => {
            return '(' + match[1].split(',').map(group => {
                group = trimCurrent(group);
                const subMatch = /^([^.]+)\.\.([^.]+)$/.exec(group);
                return subMatch ? `[${subMatch[1]}-${subMatch[2]}]` : group;
            }).join('|') + ')';
        })
            .replace(/\./g, '\\.')
            .replace(/\[[!^]([^\]]+)\]/g, (...match) => `[^/${match[1]}]`)
            .replace(/(\*\*\/)*\*+$/, '.::')
            .replace(/(\*\*\/)+/g, '([^/]+/)::')
            .replace(/([!?*+@])(\([^)]+\))/g, (...match) => {
            const escape = () => match[2].replace(/\*/g, ':>').replace(/\?/g, ':<');
            switch (match[1]) {
                case '!':
                    return `(?!${escape()})[^/]+:@`;
                case '?':
                case '*':
                case '+':
                    return escape() + match[1];
                case '@':
                    return match[2];
            }
            return match[0];
        })
            .replace(/\?(?!!)/g, '[^/]')
            .replace(/\*/g, '[^/]*?')
            .replace(/:([@:<>]|\d+)/g, (...match) => {
            switch (match[1]) {
                case ':':
                    return '*';
                case '@':
                    return '?';
                case '>':
                    return '\\*';
                case '<':
                    return '\\?';
            }
            return '\\\\' + String.fromCharCode(+match[1]);
        }) + '$';
        return new GlobExp(source, flags, value[0] === '!');
    }

    var util = /*#__PURE__*/Object.freeze({
        __proto__: null,
        fromMimeType: fromMimeType,
        parseMimeType: parseMimeType,
        getComponentEnd: getComponentEnd,
        appendSeparator: appendSeparator,
        assignEmptyValue: assignEmptyValue,
        generateUUID: generateUUID,
        upperCaseString: upperCaseString,
        lowerCaseString: lowerCaseString,
        searchObject: searchObject,
        trimBoth: trimBoth,
        trimString: trimString,
        trimStart: trimStart,
        trimEnd: trimEnd,
        flatArray: flatArray,
        parseGlob: parseGlob
    });

    const { DIRECTORY_NOT_PROVIDED, INVALID_ASSET_REQUEST, SERVER_REQUIRED } = squared.lib.error;
    const { createElement } = squared.lib.dom;
    const { escapePattern: escapePattern$1, fromLastIndexOf: fromLastIndexOf$1, isPlainObject, replaceAll, splitPair: splitPair$4, startsWith: startsWith$3 } = squared.lib.util;
    function validateAsset(file, exclusions) {
        const { pathname, filename } = file;
        const glob = exclusions.glob;
        const url = appendSeparator(pathname, filename);
        if (glob) {
            for (let i = 0, length = glob.length; i < length; ++i) {
                let value = glob[i];
                if (typeof value === 'string') {
                    value = parseGlob(value, { fromEnd: true });
                    glob[i] = value;
                }
                if (value.test(url)) {
                    return false;
                }
            }
        }
        if (exclusions.pathname) {
            for (const value of exclusions.pathname) {
                if (new RegExp(`^${escapePattern$1(trimEnd(replaceAll(value, '\\', '/'), '/'))}/?`).test(pathname)) {
                    return false;
                }
            }
        }
        if (exclusions.filename) {
            for (const value of exclusions.filename) {
                if (value === filename) {
                    return false;
                }
            }
        }
        if (exclusions.extension) {
            const ext = fromLastIndexOf$1(filename, '.').toLowerCase();
            for (const value of exclusions.extension) {
                if (ext === value.toLowerCase()) {
                    return false;
                }
            }
        }
        if (exclusions.pattern) {
            for (const value of exclusions.pattern) {
                if (new RegExp(value).test(url)) {
                    return false;
                }
            }
        }
        return true;
    }
    const getEndpoint = (hostname, endpoint) => startsWith$3(endpoint, 'http') ? endpoint : hostname + endpoint;
    class File {
        constructor(resource) {
            this.resource = resource;
            this.archiveFormats = ['zip', 'tar', '7z', 'gz', 'tgz'];
            this._hostname = '';
            this._endpoints = {
                ASSETS_COPY: '/api/v1/assets/copy',
                ASSETS_ARCHIVE: '/api/v1/assets/archive',
                LOADER_DATA: '/api/v1/loader/data'
            };
            resource.fileHandler = this;
        }
        static downloadFile(href, filename, mimeType) {
            if (typeof href !== 'string') {
                href = URL.createObjectURL(new Blob([href], { type: mimeType || 'application/octet-stream' }));
            }
            const element = createElement('a', { style: { display: 'none' }, attributes: { href } });
            if (filename) {
                element.download = filename;
            }
            else {
                element.setAttribute('target', '_blank');
            }
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
            setTimeout(() => URL.revokeObjectURL(href), 1);
        }
        static copyDocument(value) {
            return Array.isArray(value) ? value.slice(0) : value;
        }
        finalizeRequestBody(body) { }
        getCopyQueryParameters(options) { return ''; }
        getArchiveQueryParameters(options) { return ''; }
        saveFiles(filename, options) {
            return this.archiving('', Object.assign(Object.assign({}, options), { filename }));
        }
        appendFiles(target, options) {
            return this.archiving(target, Object.assign({}, options));
        }
        copyFiles(pathname, options) {
            return this.copying(pathname, Object.assign({}, options));
        }
        async loadConfig(uri, options) {
            let mimeType, cache;
            if (options) {
                let config;
                ({ config, cache } = options);
                if (config) {
                    mimeType = config.mimeType;
                }
            }
            const config = await this.loadData(uri, { type: 'json', mimeType, cache });
            if (config) {
                if (config.success && Array.isArray(config.data)) {
                    return config.data;
                }
                const error = config.error;
                if (error) {
                    this.writeError(error.message, error.hint);
                }
            }
        }
        loadData(value, options) {
            const { type, mimeType, cache } = options;
            if (this.hasHttpProtocol() && type) {
                return fetch(getEndpoint(this.hostname, this._endpoints.LOADER_DATA) + `/${type}?key=` + encodeURIComponent(value) + (typeof cache === 'boolean' ? '&cache=' + (cache ? '1' : '0') : '') + (mimeType ? '&mime=' + encodeURIComponent(mimeType) : ''), {
                    method: 'GET',
                    headers: new Headers({ Accept: options.accept || '*/*' })
                })
                    .then(response => {
                    switch (type) {
                        case 'json':
                            return response.json();
                        case 'blob':
                            return response.blob();
                        case 'text':
                        case 'document':
                            return response.text();
                        case 'arraybuffer':
                            return response.arrayBuffer();
                        default:
                            return null;
                    }
                });
            }
            return Promise.resolve(null);
        }
        copying(pathname = '', options) {
            if (this.hasHttpProtocol()) {
                if (pathname = pathname.trim()) {
                    const body = this.createRequestBody(options);
                    if (body) {
                        return fetch(getEndpoint(this.hostname, this._endpoints.ASSETS_COPY) +
                            '?to=' + encodeURIComponent(pathname) +
                            '&empty=' + (options.emptyDir ? '2' : this.userSettings.outputEmptyCopyDirectory ? '1' : '0') +
                            this.getCopyQueryParameters(options), {
                            method: 'POST',
                            headers: new Headers({ 'Accept': 'application/json, text/plain', 'Content-Type': 'application/json' }),
                            body: JSON.stringify(body)
                        })
                            .then(async (response) => {
                            const result = await response.json();
                            if (typeof options.callback === 'function') {
                                options.callback.call(null, result);
                            }
                            const error = result.error;
                            if (error) {
                                this.writeError(error.message, error.hint);
                            }
                            return result;
                        });
                    }
                    return Promise.reject(INVALID_ASSET_REQUEST);
                }
                return Promise.reject(DIRECTORY_NOT_PROVIDED);
            }
            return Promise.reject(SERVER_REQUIRED);
        }
        archiving(target = '', options) {
            if (this.hasHttpProtocol()) {
                const body = this.createRequestBody(options);
                if (body) {
                    let { filename, format } = options;
                    const setFilename = () => {
                        if (!format || !this.archiveFormats.includes(format = format.toLowerCase())) {
                            [filename, format] = splitPair$4(filename, '.', false, true);
                            if (format && !this.archiveFormats.includes(format)) {
                                filename += '.' + format;
                                format = '';
                            }
                        }
                    };
                    if (!target) {
                        if (!filename) {
                            filename = this.userSettings.outputArchiveName;
                        }
                        else {
                            setFilename();
                        }
                    }
                    else {
                        filename || (filename = fromLastIndexOf$1(target, '/', '\\'));
                        setFilename();
                    }
                    return fetch(getEndpoint(this.hostname, this._endpoints.ASSETS_ARCHIVE) +
                        '?format=' + (format || this.userSettings.outputArchiveFormat) +
                        '&filename=' + encodeURIComponent(filename) +
                        '&to=' + encodeURIComponent(options.copyTo || '') +
                        '&append_to=' + encodeURIComponent(target || '') +
                        this.getArchiveQueryParameters(options), {
                        method: 'POST',
                        headers: new Headers({ 'Accept': 'application/json, text/plain', 'Content-Type': 'application/json' }),
                        body: JSON.stringify(body)
                    })
                        .then(async (response) => {
                        const result = await response.json();
                        if (typeof options.callback === 'function') {
                            options.callback.call(null, result);
                        }
                        const { downloadKey, filename: zipname, error } = result;
                        if (downloadKey && zipname) {
                            const cache = this.userSettings.outputArchiveCache;
                            const download = await this.loadData(downloadKey, { type: 'blob', cache });
                            if (download) {
                                File.downloadFile(download, zipname);
                            }
                            if (cache) {
                                result.downloadUrl = getEndpoint(this.hostname, this._endpoints.LOADER_DATA) + '/blob?key=' + downloadKey;
                            }
                        }
                        if (error) {
                            this.writeError(error.message, error.hint);
                        }
                        delete result.downloadKey;
                        return result;
                    });
                }
                return Promise.reject(INVALID_ASSET_REQUEST);
            }
            return Promise.reject(SERVER_REQUIRED);
        }
        setEndpoint(name, value) {
            this._endpoints[name] = value;
        }
        writeError(message, hint) {
            (this.userSettings.showErrorMessages ? alert : console.log)((hint ? hint + '\n\n' : '') + message); // eslint-disable-line no-console
        }
        createRequestBody(body) {
            let assets = body.assets;
            if (assets && assets.length) {
                const exclusions = body.exclusions;
                if (exclusions) {
                    if ((assets = assets.filter(item => validateAsset(item, exclusions))).length === 0) {
                        return;
                    }
                    body.assets = assets;
                }
                let socketId;
                const documentName = new Set(body.document);
                const taskName = new Set();
                const setSocketId = (watch) => {
                    var _a;
                    socketId || (socketId = generateUUID());
                    if (watch.reload === true) {
                        watch.reload = { socketId };
                    }
                    else if (watch.reload) {
                        (_a = watch.reload).socketId || (_a.socketId = socketId);
                    }
                };
                for (let i = 0, length = assets.length; i < length; ++i) {
                    const { tasks, watch, document } = assets[i];
                    if (tasks) {
                        tasks.forEach(item => taskName.add(item.handler));
                    }
                    if (body.watch && isPlainObject(watch)) {
                        setSocketId(watch);
                    }
                    if (document) {
                        if (Array.isArray(document)) {
                            document.forEach(value => documentName.add(value));
                        }
                        else {
                            documentName.add(document);
                        }
                    }
                }
                const { outputTasks, outputWatch } = this.userSettings;
                for (let i = 0; i < 2; ++i) {
                    if (i === 1 && !body.watch) {
                        break;
                    }
                    const [output, attr] = i === 0 ? [outputTasks, 'tasks'] : [outputWatch, 'watch'];
                    let unassigned;
                    for (const module in output) {
                        unassigned || (unassigned = assets.filter(item => !item[attr]));
                        let length = unassigned.length;
                        if (length) {
                            const glob = parseGlob(module, { fromEnd: true });
                            for (let j = 0; j < length; ++j) {
                                const item = unassigned[j];
                                if (glob.test(appendSeparator(item.pathname, item.filename))) {
                                    if (i === 0) {
                                        const value = output[module];
                                        const addTask = (task) => {
                                            item.tasks.push(task);
                                            taskName.add(task.handler);
                                        };
                                        item.tasks || (item.tasks = []);
                                        if (Array.isArray(value)) {
                                            value.forEach(task => addTask(task));
                                        }
                                        else if (isPlainObject(value)) {
                                            addTask(value);
                                        }
                                    }
                                    else {
                                        const value = output[module];
                                        if (value === true) {
                                            item.watch = true;
                                        }
                                        else if (isPlainObject(value)) {
                                            setSocketId(item.watch = Object.assign({}, value));
                                        }
                                        else {
                                            continue;
                                        }
                                        unassigned.splice(j--, 1);
                                        --length;
                                    }
                                }
                            }
                        }
                        else {
                            break;
                        }
                    }
                }
                body.document = Array.from(documentName);
                if (taskName.size) {
                    body.task = Array.from(taskName);
                }
                this.finalizeRequestBody(body);
                delete body.config;
                return body;
            }
        }
        hasHttpProtocol() {
            return startsWith$3(this._hostname || location.protocol, 'http');
        }
        set hostname(value) {
            try {
                const url = new URL(value);
                this._hostname = startsWith$3(url.origin, 'http') ? url.origin : '';
            }
            catch (_a) {
            }
        }
        get hostname() {
            return this._hostname || location.origin;
        }
    }

    const { CSS_BORDER_SET, CSS_PROPERTIES, PROXY_INLINESTYLE, convertFontSize, getInitialValue, parseSelectorText } = squared.lib.internal;
    const { CSS: CSS$1, FILE: FILE$1 } = squared.lib.regex;
    const { isUserAgent } = squared.lib.client;
    const { isTransparent } = squared.lib.color;
    const { asPercent: asPercent$1, asPx, checkStyleValue, checkWritingMode, convertUnit, getRemSize, getStyle, isAngle, isLength: isLength$1, isPercent: isPercent$1, isTime, parseUnit: parseUnit$2 } = squared.lib.css;
    const { assignRect, getNamedItem, getParentElement, getRangeClientRect } = squared.lib.dom;
    const { clamp, truncate } = squared.lib.math;
    const { getElementAsNode, getElementCache, getElementData, setElementCache } = squared.lib.session;
    const { convertCamelCase, convertFloat, convertInt, convertPercent, endsWith: endsWith$1, escapePattern, hasValue, isObject, isSpace, iterateArray: iterateArray$1, iterateReverseArray, lastItemOf, safeFloat, spliceString, splitEnclosing: splitEnclosing$2, splitPair: splitPair$3, splitSome: splitSome$4, startsWith: startsWith$2 } = squared.lib.util;
    const TEXT_STYLE = [
        'fontFamily',
        'fontWeight',
        'fontStyle',
        'fontVariant',
        'fontStretch',
        'color',
        'whiteSpace',
        'textDecorationLine',
        'textDecorationStyle',
        'textDecorationColor',
        'textTransform',
        'letterSpacing',
        'wordSpacing'
    ];
    const [BORDER_TOP, BORDER_RIGHT, BORDER_BOTTOM, BORDER_LEFT, BORDER_OUTLINE] = CSS_BORDER_SET;
    const REGEXP_EM = /\dem$/i;
    const REGEXP_NOT = /^:not\((.+)\)$/i;
    const REGEXP_ENCLOSING = /^:(not|is|where)\((.+)\)$/i;
    const REGEXP_ISWHERE = /^(.*?)@((?:\{\{.+?\}\})+)(.*)$/;
    const REGEXP_NOTINDEX = /:not-(x+)/;
    const REGEXP_QUERYNTH = /^:nth(-last)?-(child|of-type)\((.+)\)$/;
    const REGEXP_QUERYNTHPOSITION = /^([+-])?(\d+)?n\s*(?:([+-])\s*(\d+))?$/;
    const REGEXP_DIR = /^:dir\(\s*(ltr|rtl)\s*\)$/;
    function setStyleCache(element, attr, value, style, sessionId) {
        const current = style[attr];
        if (value !== current) {
            const restore = element.style[attr];
            element.style[attr] = value;
            const updated = element.style[attr];
            if (!updated) {
                return 0 /* FAIL */;
            }
            if (updated !== current) {
                setElementCache(element, attr, restore, sessionId);
                return 2 /* CHANGED */;
            }
        }
        return 1 /* READY */;
    }
    function parseLineHeight(value, fontSize) {
        let n = +value;
        if (isNaN(n)) {
            n = asPercent$1(value);
        }
        return !isNaN(n) ? n * fontSize : parseUnit$2(value, { fontSize });
    }
    function isFixedFont(node) {
        const [fontFirst, fontSecond] = splitPair$3(node.css('fontFamily'), ',', true);
        return fontFirst === 'monospace' && fontSecond !== 'monospace';
    }
    function getCssFloat(node, attr, fallback) {
        const value = +node.css(attr);
        return !isNaN(value) ? value : fallback;
    }
    function hasTextAlign(node, ...values) {
        const value = node.cssAscend('textAlign', { startSelf: node.textElement && node.blockStatic && !node.hasUnit('width', { initial: true }) });
        return value !== '' && values.includes(value) && (node.blockStatic ? node.textElement && !node.hasUnit('width', { initial: true }) && !node.hasUnit('maxWidth', { initial: true }) : startsWith$2(node.display, 'inline'));
    }
    function setDimension(node, style, dimension) {
        const options = { dimension };
        const value = style[dimension];
        const minValue = style[dimension === 'width' ? 'minWidth' : 'minHeight'];
        const baseValue = value ? node.parseUnit(value, options) : 0;
        let result = minValue ? Math.max(baseValue, node.parseUnit(minValue, options)) : baseValue;
        if (result === 0 && node.styleElement) {
            const element = node.element;
            switch (element.tagName) {
                case 'INPUT':
                    if (element.type !== 'image') {
                        break;
                    }
                case 'IMG':
                case 'TD':
                case 'TH':
                case 'SVG':
                case 'svg':
                case 'IFRAME':
                case 'VIDEO':
                case 'AUDIO':
                case 'CANVAS':
                case 'OBJECT':
                case 'EMBED': {
                    const size = getNamedItem(element, dimension);
                    if (size && (!isNaN(result = +size) || (result = node.parseUnit(size, options)))) {
                        node.css(dimension, isPercent$1(size) ? size : size + 'px');
                    }
                    break;
                }
            }
        }
        if (baseValue && !node.imageElement) {
            const attr = dimension === 'width' ? 'maxWidth' : 'maxHeight';
            const max = style[attr];
            if (max) {
                if (value === max) {
                    delete style[attr];
                }
                else {
                    const maxValue = node.parseUnit(max, { dimension });
                    if (maxValue) {
                        if (maxValue <= baseValue && value && isLength$1(value)) {
                            style[dimension] = max;
                            delete style[attr];
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
            switch (node.css(border[0])) {
                case 'none':
                case 'hidden':
                    return 0;
            }
            const width = node.css(border[1]);
            let result = asPx(width);
            if (isNaN(result)) {
                result = isLength$1(width, true) ? node.parseUnit(width, { dimension }) : safeFloat(node.style[border[1]]);
            }
            if (result) {
                return Math.max(Math.round(result), 1);
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
                            const parent = node.ascend({ condition: item => item.tableElement })[0];
                            if (parent) {
                                const [horizontal, vertical] = splitPair$3(parent.css('borderSpacing'), ' ');
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
        return node.cssUnit(attr, ((_a = node.actualParent) === null || _a === void 0 ? void 0 : _a.gridElement) ? { parent: false } : undefined);
    }
    function convertPosition(node, attr) {
        if (!node.positionStatic || node.valueOf('position') === 'sticky') {
            const value = node.valueOf(attr, { modified: true });
            if (value) {
                return node.parseUnit(value, attr === 'top' || attr === 'bottom' ? { dimension: 'height' } : undefined);
            }
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
                    case 'button':
                    case 'submit':
                    case 'reset':
                    case 'file':
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
    function validateSelector(selector, child) {
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
                if (attr.trailing) {
                    const pattern = new RegExp(`^([^:]+:)?${escapePattern(attr.key)}$`);
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
                    if (attr.ignoreCase) {
                        value = value.toLowerCase();
                    }
                    switch (attr.symbol) {
                        case '~':
                            if (!splitSome$4(value, item => item === other, /\s+/g)) {
                                return false;
                            }
                            break;
                        case '^':
                            if (!startsWith$2(value, other)) {
                                return false;
                            }
                            break;
                        case '$':
                            if (!endsWith$1(value, other)) {
                                return false;
                            }
                            break;
                        case '*':
                            if (!value.includes(other)) {
                                return false;
                            }
                            break;
                        case '|':
                            if (value !== other && !startsWith$2(value, other + '-')) {
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
            const scoped = [];
            for (let i = 0, length = pseudoList.length; i < length; ++i) {
                const pseudo = pseudoList[i];
                switch (pseudo) {
                    case ':first-child':
                        if (this !== parent.firstElementChild) {
                            return false;
                        }
                        break;
                    case ':last-child':
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
                        if (!this.inputElement && this.tagName !== 'OPTION' || !element.disabled) {
                            return false;
                        }
                        break;
                    case ':enabled':
                        if (!this.inputElement && this.tagName !== 'OPTION' || element.disabled) {
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
                        if (!this.inputElement || this.tagName === 'BUTTON' || !element.required) {
                            return false;
                        }
                        break;
                    case ':optional':
                        if (!this.inputElement || this.tagName === 'BUTTON' || element.required) {
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
                    case ':target': {
                        const hash = location.hash;
                        if (!hash || !(hash === '#' + this.elementId || tagName === 'A' && hash === '#' + this.toElementString('name'))) {
                            return false;
                        }
                        break;
                    }
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
                    case ':focus':
                        if (element !== document.activeElement) {
                            return false;
                        }
                        break;
                    case ':focus-within': {
                        const activeElement = document.activeElement;
                        if (element !== activeElement && !this.querySelectorAll('*').find(item => item.element === activeElement)) {
                            return false;
                        }
                        break;
                    }
                    case ':default':
                    case ':defined':
                    case ':link':
                    case ':visited':
                    case ':hover':
                    case ':active':
                    case ':any-link':
                    case ':fullscreen':
                    case ':valid':
                    case ':invalid':
                        scoped.push(pseudo);
                        break;
                    default: {
                        let match = REGEXP_QUERYNTH.exec(pseudo);
                        if (match) {
                            const children = match[1] ? parent.naturalElements.slice(0).reverse() : parent.naturalElements;
                            const index = match[2] === 'child' ? children.indexOf(this) + 1 : children.filter((item) => item.tagName === tagName).indexOf(this) + 1;
                            if (index) {
                                const placement = match[3].trim();
                                switch (placement) {
                                    case 'even':
                                        if (index % 2) {
                                            return false;
                                        }
                                        break;
                                    case 'odd':
                                        if (index % 2 === 0) {
                                            return false;
                                        }
                                        break;
                                    default:
                                        if (!isNaN(+placement)) {
                                            if (placement !== index.toString()) {
                                                return false;
                                            }
                                        }
                                        else if (match = REGEXP_QUERYNTHPOSITION.exec(placement)) {
                                            const reverse = match[1] === '-';
                                            const increment = match[2] ? +match[2] : 1;
                                            if (match[4]) {
                                                const modifier = +match[4] * (match[3] === '-' ? -1 : 1);
                                                if (increment !== 0) {
                                                    if (index !== modifier) {
                                                        let j = modifier;
                                                        do {
                                                            if (reverse) {
                                                                j -= increment;
                                                                if (j < 0) {
                                                                    return false;
                                                                }
                                                            }
                                                            else {
                                                                j += increment;
                                                                if (j > index) {
                                                                    return false;
                                                                }
                                                            }
                                                            if (j === index) {
                                                                break;
                                                            }
                                                        } while (true);
                                                    }
                                                }
                                                else if (index !== modifier) {
                                                    return false;
                                                }
                                            }
                                            else if (reverse || index % increment !== 0) {
                                                return false;
                                            }
                                        }
                                        else {
                                            return !!selector.fromNot;
                                        }
                                        break;
                                }
                            }
                            else {
                                return !!selector.fromNot;
                            }
                        }
                        else if (match = REGEXP_DIR.exec(pseudo)) {
                            switch (this.dir) {
                                case 'rtl':
                                    if (match[1] === 'ltr') {
                                        return false;
                                    }
                                    break;
                                case 'auto':
                                    scoped.push(pseudo);
                                    break;
                                default:
                                    if (match[1] === 'rtl') {
                                        return false;
                                    }
                                    break;
                            }
                        }
                        else {
                            scoped.push(pseudo);
                        }
                        break;
                    }
                }
            }
            if (scoped.length) {
                try {
                    if (iterateArray$1(element.parentElement.querySelectorAll(':scope > ' + scoped.join('')), item => item === element) !== Infinity) {
                        return false;
                    }
                }
                catch (_a) {
                    return !!selector.fromNot;
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
                    case '[':
                        if ((match = CSS$1.SELECTOR_ATTR.exec(not)) && match[0] === not) {
                            const value = match[3] || match[4] || match[5];
                            const ignoreCase = match[6] === 'i';
                            notData = {
                                attrList: [{
                                        key: match[1],
                                        symbol: match[2],
                                        value: ignoreCase && value ? value.toLowerCase() : value,
                                        ignoreCase
                                    }]
                            };
                        }
                        break;
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
                    if (validateSelector.call(this, notData)) {
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
    function ascendSelector(selectors, index, nodes, offset, checked) {
        const selector = selectors[index];
        const selectorAdjacent = index > 0 && selectors[--index];
        const adjacent = selector.adjacent;
        const next = [];
        for (let i = 0, length = nodes.length; i < length; ++i) {
            const child = nodes[i];
            if (checked || selector.all || validateSelector.call(child, selector)) {
                let parent = child.actualParent;
                if (adjacent) {
                    if (adjacent === '>') {
                        if (!next.includes(parent) && (selectorAdjacent && (selectorAdjacent.all || validateSelector.call(parent, selectorAdjacent, child))) || !selectorAdjacent && parent === this) {
                            next.push(parent);
                        }
                    }
                    else if (selectorAdjacent) {
                        const children = parent.naturalElements;
                        switch (adjacent) {
                            case '+': {
                                const j = children.indexOf(child) - 1;
                                if (j >= 0 && (selectorAdjacent.all || validateSelector.call(children[j], selectorAdjacent))) {
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
                                    else if (selectorAdjacent.all || validateSelector.call(sibling, selectorAdjacent)) {
                                        next.push(sibling);
                                    }
                                }
                                break;
                        }
                    }
                }
                else if (selectorAdjacent) {
                    while (parent && parent.depth - this.depth >= index + offset) {
                        if (selectorAdjacent.all || validateSelector.call(parent, selectorAdjacent)) {
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
        return next.length > 0 && (index === 0 ? true : ascendSelector.call(this, selectors, index, next, offset + (!adjacent || adjacent === '>' ? 0 : 1), adjacent));
    }
    function getMinMax(node, min, attr, options) {
        let self, last, wrapperOf, subAttr, initialValue, initial;
        if (options) {
            ({ self, subAttr, last, wrapperOf, initialValue, initial } = options);
        }
        if (initialValue === undefined) {
            initialValue = min ? Infinity : -Infinity;
        }
        let result;
        node.each(item => {
            if (wrapperOf) {
                item = item.wrapperOf || item;
            }
            let value = NaN;
            if (self || subAttr) {
                const subValue = (subAttr ? item[attr][subAttr] : item[attr]);
                switch (typeof subValue) {
                    case 'number':
                        value = subValue;
                        break;
                    case 'string':
                        value = parseFloat(subValue);
                        break;
                    default:
                        return;
                }
            }
            else {
                value = parseFloat(initial ? item.cssInitial(attr, options) : item.css(attr));
            }
            if (!isNaN(value)) {
                if (min) {
                    if (last) {
                        if (value <= initialValue) {
                            result = item;
                            initialValue = value;
                        }
                    }
                    else if (value < initialValue) {
                        result = item;
                        initialValue = value;
                    }
                }
                else if (last) {
                    if (value >= initialValue) {
                        result = item;
                        initialValue = value;
                    }
                }
                else if (value > initialValue) {
                    result = item;
                    initialValue = value;
                }
            }
        });
        return result || node;
    }
    function getBoundsSize(node, options) {
        var _a;
        const bounds = (!options || options.parent !== false) && ((_a = node.absoluteParent) === null || _a === void 0 ? void 0 : _a.box) || node.bounds;
        return bounds[options && options.dimension || 'width'];
    }
    const aboveRange = (a, b, offset = 1) => a + offset >= b;
    const belowRange = (a, b, offset = 1) => a - offset <= b;
    const sortById = (a, b) => a.id - b.id;
    const isInlineVertical = (value) => startsWith$2(value, 'inline') || value === 'table-cell';
    const canTextAlign = (node) => node.naturalChild && (node.isEmpty() || isInlineVertical(node.display)) && !node.floating && node.autoMargin.horizontal !== true;
    const newBoxRectDimension = () => ({ top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 });
    class Node extends squared.lib.base.Container {
        constructor(id, sessionId = '0', element, children) {
            super(children);
            this.id = id;
            this.sessionId = sessionId;
            this.documentRoot = false;
            this.shadowRoot = false;
            this.queryMap = null;
            this._parent = null;
            this._depth = -1;
            this._cache = {};
            this._cacheState = { inlineText: false };
            this._preferInitial = false;
            this._bounds = null;
            this._box = null;
            this._linear = null;
            this._initial = null;
            this._styleMap = {};
            this._naturalChildren = null;
            this._naturalElements = null;
            this._childIndex = Infinity;
            this._elementData = null;
            this._style = null;
            this._element = element || null;
            if (element && sessionId !== '0') {
                this.syncWith(sessionId);
                setElementCache(element, 'node', this, sessionId);
            }
        }
        static sanitizeCss(element, style, writingMode) {
            const result = {};
            for (let attr in style) {
                let value = style[attr];
                const alias = checkWritingMode(attr, writingMode);
                if (alias !== attr) {
                    if (typeof alias === 'string') {
                        if (!style[alias]) {
                            attr = alias;
                        }
                        else {
                            continue;
                        }
                    }
                    else {
                        let actual;
                        for (const alt of alias) {
                            if (!style[alt]) {
                                if (actual || (actual = checkStyleValue(element, alt, value))) {
                                    result[alt] = actual;
                                }
                                else {
                                    break;
                                }
                            }
                        }
                        continue;
                    }
                }
                if (value = checkStyleValue(element, attr, value)) {
                    result[attr] = value;
                }
            }
            return result;
        }
        internalSelf(parent, depth, childIndex) {
            this._parent = parent;
            this._depth = depth;
            if (childIndex !== undefined) {
                this._childIndex = childIndex;
            }
        }
        internalNodes(children, elements) {
            this._naturalChildren = children;
            this._naturalElements = elements || children.filter((item) => item.naturalElement);
        }
        syncWith(sessionId, cache) {
            const element = this._element;
            if (element) {
                let elementData;
                if ((sessionId || (sessionId = getElementCache(element, 'sessionId', '0'))) && (elementData = getElementData(element, sessionId))) {
                    this._elementData = elementData;
                    const styleMap = elementData.styleMap;
                    if (styleMap) {
                        if (!this.plainText && this.naturalChild) {
                            if (!this.pseudoElement) {
                                const length = element.style.length;
                                if (length) {
                                    const style = element.style;
                                    const specificity = elementData.styleSpecificity || (elementData.styleSpecificity = {});
                                    for (let i = 0; i < length; ++i) {
                                        const attr = style[i];
                                        const baseAttr = convertCamelCase(attr);
                                        const values = specificity[baseAttr];
                                        if (!values || values.length < 5) {
                                            styleMap[baseAttr] = style.getPropertyValue(attr);
                                            specificity[baseAttr] = [1, 0, 0, 0];
                                        }
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
                            i = length;
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
                                this.cascade(item => item.unsetCache('height', 'bottomAligned'));
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
                        case 'paddingLeft':
                        case 'paddingRight':
                            cache.contentBoxWidth = undefined;
                            break;
                        case 'marginLeft':
                        case 'marginRight':
                            cache.rightAligned = undefined;
                            cache.centerAligned = undefined;
                            cache.autoMargin = undefined;
                            break;
                        case 'marginTop':
                        case 'marginBottom':
                            cache.bottomAligned = undefined;
                            cache.autoMargin = undefined;
                            break;
                        case 'paddingTop':
                        case 'paddingBottom':
                            cache.contentBoxHeight = undefined;
                            break;
                        case 'whiteSpace':
                            cache.preserveWhiteSpace = undefined;
                            cache.textStyle = undefined;
                            this._cacheState.textEmpty = undefined;
                            continue;
                        default:
                            if (startsWith$2(attr, 'background')) {
                                cache.visibleStyle = undefined;
                            }
                            else if (startsWith$2(attr, 'border')) {
                                if (startsWith$2(attr, 'borderTop')) {
                                    cache.borderTopWidth = undefined;
                                    cache.contentBoxHeight = undefined;
                                }
                                else if (startsWith$2(attr, 'borderRight')) {
                                    cache.borderRightWidth = undefined;
                                    cache.contentBoxWidth = undefined;
                                }
                                else if (startsWith$2(attr, 'borderBottom')) {
                                    cache.borderBottomWidth = undefined;
                                    cache.contentBoxHeight = undefined;
                                }
                                else {
                                    cache.borderLeftWidth = undefined;
                                    cache.contentBoxWidth = undefined;
                                }
                                cache.visibleStyle = undefined;
                            }
                            else if (attr === 'fontSize' || TEXT_STYLE.includes(attr)) {
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
                if (attrs.some(value => !!CSS_PROPERTIES[value] && (CSS_PROPERTIES[value].trait & 4 /* LAYOUT */))) {
                    parent = this.pageFlow && this.ascend({ condition: item => item.hasUnit('width') && item.hasUnit('height') || item.documentRoot })[0] || this;
                }
                else if (attrs.some(value => !!CSS_PROPERTIES[value] && (CSS_PROPERTIES[value].trait & 8 /* CONTAIN */))) {
                    parent = this;
                }
                else {
                    return;
                }
                parent.resetBounds();
                if (parent.queryMap) {
                    parent.querySelectorAll('*').forEach(item => item.resetBounds());
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
                            case 'inlineText':
                                cacheState.inlineText = false;
                                continue;
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
            else if (attr !== 'parent' && !endsWith$1(attr, 'Parent')) {
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
                const { left, right } = this[options && options.dimension || 'linear'];
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
                const { top, bottom } = this[options && options.dimension || 'linear'];
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
            const style = this.style;
            if (this.styleElement && attr in style) {
                if (value === '') {
                    style[attr] = 'initial';
                    const property = CSS_PROPERTIES[attr];
                    if (property && typeof property.value === 'string') {
                        this._styleMap[attr] = getInitialValue(this._element, attr) + (property.trait & 256 /* UNIT */ ? 'px' : '');
                    }
                    else {
                        delete this._styleMap[attr];
                    }
                    if (cache) {
                        this.unsetCache(attr);
                    }
                }
                else if (value) {
                    const current = style[attr];
                    this.style[attr] = value;
                    if (current !== style[attr]) {
                        this._styleMap[attr] = value;
                        if (cache) {
                            this.unsetCache(attr);
                        }
                        return value;
                    }
                    return current;
                }
            }
            return this._styleMap[attr] || style[attr] || '';
        }
        cssApply(values, overwrite = true, cache = true) {
            if (overwrite) {
                for (const attr in values) {
                    this.css(attr, values[attr], cache);
                }
            }
            else {
                const style = this._styleMap;
                for (const attr in values) {
                    if (!style[attr]) {
                        this.css(attr, values[attr], cache);
                    }
                }
            }
            return this;
        }
        cssParent(attr, value, cache = false) {
            const parent = this.actualParent;
            return parent ? parent.css(attr, value, cache) : '';
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
            let value, parent = options && options.startSelf ? this : this.actualParent;
            while (parent) {
                if ((value = parent.valueOf(attr, options)) && value !== 'inherit') {
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
        cssUnit(attr, options) {
            return this.parseUnit(options && options.initial ? this.cssInitial(attr, options) : this.css(attr), options);
        }
        cssSpecificity(attr) {
            var _a, _b, _c;
            if (this.styleElement) {
                const styleData = !this.pseudoElt ? (_a = this._elementData) === null || _a === void 0 ? void 0 : _a.styleSpecificity : (_c = (_b = this.actualParent) === null || _b === void 0 ? void 0 : _b.elementData) === null || _c === void 0 ? void 0 : _c['styleSpecificity' + this.pseudoElt];
                if (styleData) {
                    return styleData[attr];
                }
            }
        }
        cssTry(attr, value, callback) {
            if (this.styleElement) {
                const element = this._element;
                if (setStyleCache(element, attr, value, !this.pseudoElement ? this.style : getStyle(element), this.sessionId)) {
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
                    switch (setStyleCache(element, attr, value, style, sessionId)) {
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
                        if (value !== undefined) {
                            this._element.style[attrs] = value;
                        }
                    }
                    else {
                        for (const attr in attrs) {
                            const value = elementData[attr];
                            if (value !== undefined) {
                                this._element.style[attr] = value;
                            }
                        }
                    }
                }
            }
        }
        cssCopy(node, ...attrs) {
            const style = this._styleMap;
            for (let i = 0, attr, length = attrs.length; i < length; ++i) {
                style[attr = attrs[i]] = node.css(attr);
            }
        }
        cssCopyIfEmpty(node, ...attrs) {
            const style = this._styleMap;
            for (let i = 0, attr, length = attrs.length; i < length; ++i) {
                if (!style[attr = attrs[i]]) {
                    style[attr] = node.css(attr);
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
            for (let i = 0, attr, length = attrs.length; i < length; ++i) {
                result[attr = attrs[i]] = this.css(attr);
            }
            return result;
        }
        toInt(attr, fallback = NaN, options) {
            return convertInt(this.cssInitial(attr, options), fallback);
        }
        toFloat(attr, fallback = NaN, options) {
            return convertFloat(this.cssInitial(attr, options), fallback);
        }
        toElementInt(attr, fallback = NaN) {
            if (this.naturalElement) {
                const value = this._element[attr];
                switch (typeof value) {
                    case 'number':
                        return Math.floor(value);
                    case 'string':
                        return convertInt(value, fallback);
                }
            }
            return fallback;
        }
        toElementFloat(attr, fallback = NaN) {
            if (this.naturalElement) {
                const value = this._element[attr];
                switch (typeof value) {
                    case 'number':
                        return value;
                    case 'string':
                        return convertFloat(value, fallback);
                }
            }
            return fallback;
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
        has(attr, options) {
            const value = options && options.initial ? this.cssInitial(attr, options) : this._styleMap[attr];
            if (value) {
                let type, not, ignoreDefault;
                if (options) {
                    ({ not, type, ignoreDefault } = options);
                }
                if (ignoreDefault !== true) {
                    const property = CSS_PROPERTIES[attr];
                    if (property) {
                        const propValue = this.styleElement ? getInitialValue(this._element, attr) : property.value;
                        if (typeof propValue === 'string' && (value === propValue || (property.trait & 256 /* UNIT */) && this.parseUnit(value) === parseFloat(propValue))) {
                            return false;
                        }
                    }
                }
                if (not && (value === not || Array.isArray(not) && not.includes(value))) {
                    return false;
                }
                if (type) {
                    return ((type & 1 /* LENGTH */) > 0 && isLength$1(value) ||
                        (type & 2 /* PERCENT */) > 0 && isPercent$1(value) ||
                        (type & 4 /* TIME */) > 0 && isTime(value) ||
                        (type & 8 /* ANGLE */) > 0 && isAngle(value));
                }
                return true;
            }
            return false;
        }
        parseUnit(value, options) {
            var _a;
            switch (typeof value) {
                case 'string':
                    break;
                case 'number':
                    return value;
                default:
                    return options && options.fallback !== undefined ? options.fallback : 0;
            }
            let n = asPx(value);
            if (!isNaN(n)) {
                return n;
            }
            else if (!isNaN(n = asPercent$1(value))) {
                return n * getBoundsSize(this, options);
            }
            if (!options) {
                options = { fontSize: this.fontSize };
            }
            else {
                (_a = options.fontSize) !== null && _a !== void 0 ? _a : (options.fontSize = this.fontSize);
            }
            return parseUnit$2(value, options);
        }
        convertUnit(value, unit = 'px', options) {
            let result = this.parseUnit(value, options);
            if (unit === '%' || unit === 'percent') {
                result *= 100 / getBoundsSize(this, options);
                return (options && options.precision !== undefined ? truncate(result, options.precision) : result) + '%';
            }
            return convertUnit(result, unit, options);
        }
        hasUnit(attr, options) {
            let percent, initial;
            if (options) {
                ({ percent, initial } = options);
            }
            const value = initial ? this.cssInitial(attr, options) : this._styleMap[attr];
            return value ? isLength$1(value, percent !== false) : false;
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
                    this._cacheState.textBounds = rect;
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
                this._cacheState.textBounds = undefined;
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
            return this.querySelectorAll(value)[0] || null;
        }
        querySelectorAll(value, sorted = true, customMap) {
            const queryMap = customMap || this.queryMap;
            const result = [];
            if (queryMap) {
                const queries = [];
                let notIndex;
                const addNot = (part) => {
                    (notIndex || (notIndex = [])).push(part);
                    return ':not-' + 'x'.repeat(notIndex.length);
                };
                const parseNot = (condition) => condition.indexOf(',') !== -1 ? parseSelectorText(condition).reduce((a, b) => a + addNot(b), '') : addNot(condition);
                const checkNot = (condition) => {
                    return splitEnclosing$2(condition, /:not/gi).reduce((a, b) => {
                        if (b[0] === ':') {
                            const match = REGEXP_NOT.exec(b);
                            if (match) {
                                b = parseNot(match[1].trim());
                            }
                        }
                        return a + b;
                    }, '');
                };
                for (const query of parseSelectorText(value)) {
                    let selector = '', expand;
                    invalid: {
                        let match;
                        for (let seg of splitEnclosing$2(query, CSS$1.SELECTOR_ENCLOSING_G)) {
                            if (seg[0] === ':' && (match = REGEXP_ENCLOSING.exec(seg))) {
                                const condition = match[2].trim();
                                switch (match[1].toLowerCase()) {
                                    case 'not':
                                        seg = parseNot(condition);
                                        break;
                                    case 'is':
                                    case 'where':
                                        if (selector && !isSpace(lastItemOf(selector))) {
                                            break invalid;
                                        }
                                        if (condition.indexOf(',') !== -1) {
                                            seg = parseSelectorText(condition).reduce((a, b) => a + '{{' + checkNot(b) + '}}', '@');
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
                        let q = 0, offset = 0, start;
                        if (query === '*') {
                            q = selectors.push({ all: true });
                            start = true;
                        }
                        else {
                            CSS$1.SELECTOR_G.lastIndex = 0;
                            let position = -1, adjacent = '', segment, match;
                            while (match = CSS$1.SELECTOR_G.exec(query)) {
                                if (match.index > position + 1) {
                                    break invalid;
                                }
                                position = match.index + match[0].length;
                                switch (segment = match[1]) {
                                    case '+':
                                    case '~':
                                        --offset;
                                    case '>':
                                        if (adjacent || q === 0 && (segment !== '>' || !/^:(?:root|scope)/i.test(query))) {
                                            break invalid;
                                        }
                                        adjacent = segment;
                                        continue;
                                    case '*':
                                    case '*|*':
                                        q = selectors.push({ all: true, adjacent });
                                        start = true;
                                        adjacent = '';
                                        continue;
                                    case ':root':
                                        if (q === 0 && this._element === document.documentElement) {
                                            if (result.includes(this)) {
                                                result.push(this);
                                            }
                                            start = true;
                                            continue;
                                        }
                                        break invalid;
                                    case ':scope':
                                        if (q) {
                                            break invalid;
                                        }
                                        start = true;
                                        continue;
                                    default:
                                        if (startsWith$2(segment, '*|')) {
                                            segment = segment.substring(2);
                                        }
                                        break;
                                }
                                let attrList, partial;
                                const removeUsed = () => segment = spliceString(segment, partial.index, partial[0].length);
                                while (partial = CSS$1.SELECTOR_ATTR.exec(segment)) {
                                    let key = partial[1].replace('\\:', ':').toLowerCase(), trailing;
                                    switch (key.indexOf('|')) {
                                        case -1:
                                            break;
                                        case 1:
                                            if (key[0] === '*') {
                                                trailing = true;
                                                key = key.substring(2);
                                                break;
                                            }
                                        default:
                                            break invalid;
                                    }
                                    const ignoreCase = partial[6] === 'i';
                                    let attrValue = partial[3] || partial[4] || partial[5] || '';
                                    if (ignoreCase) {
                                        attrValue = attrValue.toLowerCase();
                                    }
                                    (attrList || (attrList = [])).push({
                                        key,
                                        symbol: partial[2],
                                        value: attrValue,
                                        trailing,
                                        ignoreCase
                                    });
                                    removeUsed();
                                }
                                if (segment.indexOf('::') !== -1) {
                                    break invalid;
                                }
                                let notList, pseudoList;
                                if (notIndex) {
                                    while (partial = REGEXP_NOTINDEX.exec(segment)) {
                                        (notList || (notList = [])).push(notIndex[partial[1].length - 1]);
                                        removeUsed();
                                    }
                                }
                                while (partial = CSS$1.SELECTOR_PSEUDO_CLASS.exec(segment)) {
                                    const pseudoClass = partial[0].toLowerCase();
                                    switch (pseudoClass) {
                                        case ':root':
                                        case ':scope':
                                            break invalid;
                                        default:
                                            (pseudoList || (pseudoList = [])).push(pseudoClass);
                                            break;
                                    }
                                    removeUsed();
                                }
                                let tagName, id, classList;
                                while (partial = CSS$1.SELECTOR_LABEL.exec(segment)) {
                                    const label = partial[0];
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
                                    removeUsed();
                                }
                                if (q === 0 && (notList || pseudoList)) {
                                    start = true;
                                }
                                q = selectors.push({
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
                            if (position < query.length) {
                                continue;
                            }
                        }
                        if (q) {
                            if (q > 1 && selectors[0].all && selectors[1].all) {
                                let max = 0, parent = this.actualParent;
                                while (parent) {
                                    ++max;
                                    parent = parent.actualParent;
                                }
                                if (max) {
                                    let min = 0;
                                    for (let j = 2; j < q; ++j) {
                                        if (selectors[j].all) {
                                            ++min;
                                        }
                                        else {
                                            break;
                                        }
                                    }
                                    const s = min <= max ? min + 1 : max;
                                    selectors.splice(0, s);
                                    q -= s;
                                }
                            }
                            const all = result.length === 0;
                            for (let j = start || customMap ? 0 : q - offset - 1, r = queryMap.length; j < r; ++j) {
                                const items = queryMap[j];
                                for (let k = 0, s = items.length; k < s; ++k) {
                                    const node = items[k];
                                    if ((all || !result.includes(node)) && ascendSelector.call(this, selectors, q - 1, [node], offset)) {
                                        result.push(node);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return sorted ? result.sort(sortById) : result;
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
                return this.querySelectorAll(value, true, customMap);
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
                        return this.querySelectorAll(value, true, customMap);
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
                    iterateArray$1(this.actualParent.naturalElements, filterPredicate, this.childIndex + 1);
                }
                if (value) {
                    const ancestors = this.ascend();
                    const customMap = [];
                    iterateReverseArray(ancestors, (item) => customMap.push([item]));
                    customMap.push(result);
                    result = this.querySelectorAll(value, true, customMap).filter(item => !ancestors.includes(item));
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
                if (this._depth === -1) {
                    this._depth = value.depth + 1;
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
            return ((_a = this._element) === null || _a === void 0 ? void 0 : _a.id) || '';
        }
        get htmlElement() {
            const result = this._cacheState.htmlElement;
            return result === undefined ? this._cacheState.htmlElement = this._element instanceof HTMLElement : result;
        }
        get svgElement() {
            const result = this._cacheState.svgElement;
            return result === undefined ? this._cacheState.svgElement = !this.htmlElement && this._element instanceof SVGElement || this.imageElement && FILE$1.SVG.test(this._element.src) : result;
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
            return endsWith$1(this.display, 'flex');
        }
        get gridElement() {
            return endsWith$1(this.display, 'grid');
        }
        get tableElement() {
            return this.tagName === 'TABLE';
        }
        get inputElement() {
            switch (this.tagName) {
                case 'INPUT':
                case 'BUTTON':
                case 'SELECT':
                case 'TEXTAREA':
                    return true;
            }
            return false;
        }
        get buttonElement() {
            switch (this.tagName) {
                case 'BUTTON':
                    return true;
                case 'INPUT':
                    switch (this._element.type) {
                        case 'button':
                        case 'submit':
                        case 'reset':
                        case 'file':
                        case 'image':
                            return true;
                    }
            }
            return false;
        }
        get plainText() {
            return this.tagName[0] === '#';
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
            return this.naturalElement ? this._element.dataset : this._dataset || (this._dataset = {});
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
                    const row = startsWith$2(flexDirection, 'row');
                    result = {
                        row,
                        column: !row,
                        reverse: endsWith$1(flexDirection, 'reverse'),
                        wrap: startsWith$2(flexWrap, 'wrap'),
                        wrapReverse: flexWrap === 'wrap-reverse',
                        alignContent,
                        justifyContent
                    };
                }
                else {
                    result = {};
                }
                this._cache.flexdata = result;
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
                        grow: getCssFloat(this, 'flexGrow', 0),
                        shrink: getCssFloat(this, 'flexShrink', 1),
                        order: this.toInt('order', 0)
                    };
                }
                else {
                    result = {};
                }
                this._cache.flexbox = result;
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
            return result === undefined ? this._cache.hasHeight = isPercent$1(this.valueOf('height')) ? this.pageFlow ? ((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.hasHeight) || this.documentBody : this.valueOf('position') === 'fixed' || this.hasUnit('top') || this.hasUnit('bottom') : this.height > 0 || this.hasUnit('height', { percent: false }) : result;
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
                        if (parent && (value = parseLineHeight(parent.css('lineHeight'), this.fontSize))) {
                            if (parent !== this.actualParent || REGEXP_EM.test(this.valueOf('fontSize')) || this.multiline) {
                                this.css('lineHeight', value + 'px');
                            }
                            hasOwnStyle = true;
                        }
                        if (value === 0 && (parent = this.ascend({ condition: item => item.lineHeight > 0 })[0])) {
                            value = parent.lineHeight;
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
            return this.css('boxSizing') !== 'border-box' || this.tableElement && isUserAgent(4 /* FIREFOX */);
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
                        if (this.tagName.toLowerCase() === 'svg' && this.actualParent.htmlElement) {
                            result = !this.hasUnit('width') && convertFloat(getNamedItem(this._element, 'width')) === 0;
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
                        const parent = this.actualParent;
                        if (parent && (parent.block && !parent.floating || parent.hasWidth)) {
                            if (this.inlineStatic && ((_a = this.firstChild) === null || _a === void 0 ? void 0 : _a.blockStatic)) {
                                result = true;
                            }
                            else if (this.inline || startsWith$2(this.display, 'table-') || this.hasUnit('maxWidth')) {
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
                    let percent = 0, n;
                    if (!isNaN(n = asPercent$1(width))) {
                        percent = n;
                    }
                    if (!isNaN(n = asPercent$1(minWidth))) {
                        percent = Math.max(n, percent);
                    }
                    if (percent) {
                        const marginLeft = this.valueOf('marginLeft');
                        const marginRight = this.valueOf('marginRight');
                        result = percent + Math.max(0, convertPercent(marginLeft)) + convertPercent(marginRight) >= 1;
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
            return result === undefined ? this._cache.centerAligned = !this.pageFlow ? this.hasUnit('left') && this.hasUnit('right') : this.autoMargin.leftRight || canTextAlign(this) && hasTextAlign(this, 'center') : result;
        }
        get rightAligned() {
            const result = this._cache.rightAligned;
            return result === undefined ? this._cache.rightAligned = !this.pageFlow ? this.hasUnit('right') && !this.hasUnit('left') : this.float === 'right' || this.autoMargin.left || canTextAlign(this) && hasTextAlign(this, 'right', this.dir === 'rtl' ? 'start' : 'end') : result;
        }
        get bottomAligned() {
            var _a;
            const result = this._cache.bottomAligned;
            return result === undefined ? this._cache.bottomAligned = !this.pageFlow ? this.hasUnit('bottom') && !this.hasUnit('top') : !!(((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.hasHeight) && this.autoMargin.top) : result;
        }
        get autoMargin() {
            let result = this._cache.autoMargin;
            if (result === undefined) {
                if (this.blockStatic || !this.pageFlow || this.display === 'table') {
                    const style = this._styleMap;
                    const left = style.marginLeft === 'auto' && (this.pageFlow || this.hasUnit('right'));
                    const right = style.marginRight === 'auto' && (this.pageFlow || this.hasUnit('left'));
                    const top = style.marginTop === 'auto' && (this.pageFlow || this.hasUnit('bottom'));
                    const bottom = style.marginBottom === 'auto' && (this.pageFlow || this.hasUnit('top'));
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
                this._cache.autoMargin = result;
            }
            return result;
        }
        get baseline() {
            let result = this._cache.baseline;
            if (result === undefined) {
                const display = this.display;
                if ((startsWith$2(display, 'inline') || display === 'list-item') && this.pageFlow && !this.floating && !this.tableElement) {
                    const value = this.css('verticalAlign');
                    result = value === 'baseline' || !isNaN(parseFloat(value));
                }
                else {
                    result = false;
                }
                this._cache.baseline = result;
            }
            return result;
        }
        get verticalAlign() {
            let result = this._cache.verticalAlign;
            if (result === undefined) {
                const value = this.css('verticalAlign');
                if (value !== 'baseline' && this.pageFlow && isNaN(result = asPx(value))) {
                    if (isLength$1(value)) {
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
                                valid = isPercent$1(value);
                                break;
                        }
                        if (valid && this.cssTry('verticalAlign', 'baseline')) {
                            const bounds = this.boundingClientRect;
                            if (bounds) {
                                result = bounds.top - this.bounds.top;
                            }
                            this.cssFinally('verticalAlign');
                        }
                    }
                }
                return this._cache.verticalAlign = result || 0;
            }
            return result;
        }
        get textBounds() {
            let result = this._cacheState.textBounds;
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
                return this._cacheState.textBounds = result || null;
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
                    if (isTransparent(result = this.css('backgroundColor')) && !this.buttonElement) {
                        result = '';
                    }
                }
                else {
                    result = '';
                }
                this._cache.backgroundColor = result;
            }
            return result;
        }
        get backgroundImage() {
            let result = this._cache.backgroundImage;
            if (result === undefined) {
                if (!this.plainText) {
                    result = this.css('backgroundImage');
                    if (result === 'none') {
                        result = '';
                    }
                }
                else {
                    result = '';
                }
                this._cache.backgroundImage = result;
            }
            return result;
        }
        get percentWidth() {
            const result = this._cache.percentWidth;
            if (result === undefined) {
                return this._cache.percentWidth = asPercent$1(this.valueOf('width')) || 0;
            }
            return result;
        }
        get percentHeight() {
            var _a;
            const result = this._cache.percentHeight;
            if (result === undefined) {
                const value = asPercent$1(this.valueOf('height'));
                return this._cache.percentHeight = !isNaN(value) && (((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.hasHeight) || this.valueOf('position') === 'fixed') ? value : 0;
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
                        splitSome$4(this.css('backgroundRepeat'), repeat => {
                            const [repeatX, repeatY] = splitPair$3(repeat, ' ');
                            backgroundRepeatX || (backgroundRepeatX = repeatX === 'repeat' || repeatX === 'repeat-x');
                            backgroundRepeatY || (backgroundRepeatY = repeatX === 'repeat' || repeatX === 'repeat-y' || repeatY === 'repeat');
                        });
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
                else {
                    result = {};
                }
                this._cache.visibleStyle = result;
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
                else {
                    let parent;
                    if (!(this.inlineStatic && !this.valueOf('width') || this.display === 'table-cell' || (parent = this.actualParent) && parent.flexElement && parent.flexdata.row) && (result = this.width) && this.contentBox && !this.tableElement) {
                        result += this.contentBoxWidth;
                    }
                }
                return this._cache.actualWidth = result || this.bounds.width;
            }
            return result;
        }
        get actualHeight() {
            let result = this._cache.actualHeight;
            if (result === undefined) {
                let parent;
                if (!(this.inlineStatic && !this.valueOf('height') || this.display === 'table-cell' || (parent = this.actualParent) && parent.flexElement && parent.flexdata.column) && (result = this.height) && this.contentBox && !this.tableElement) {
                    result += this.contentBoxHeight;
                }
                return this._cache.actualHeight = result || this.bounds.height;
            }
            return result;
        }
        get actualDimension() {
            return { width: this.actualWidth, height: this.actualHeight };
        }
        get depth() {
            return this._depth;
        }
        get childIndex() {
            return this._childIndex;
        }
        get naturalChildren() {
            return this._naturalChildren || (this._naturalChildren = this.toArray());
        }
        get naturalElements() {
            return this._naturalElements || (this._naturalElements = this.naturalChildren.filter((item) => item.naturalElement));
        }
        get firstChild() {
            return this.naturalChildren[0] || null;
        }
        get lastChild() {
            return lastItemOf(this.naturalChildren) || null;
        }
        get firstElementChild() {
            return this.naturalElements[0] || null;
        }
        get lastElementChild() {
            return lastItemOf(this.naturalElements) || null;
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
                        const item = attributes[i];
                        result[item.name] = item.value;
                    }
                }
                this._cacheState.attributes = result;
            }
            return result;
        }
        get checked() {
            var _a;
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
                    return ((_a = this.parentElement) === null || _a === void 0 ? void 0 : _a.tagName) === 'SELECT' && Array.from(this.parentElement.selectedOptions).includes(this._element);
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
                        const fixedWidth = isFixedFont(this);
                        let value = convertFontSize(this.valueOf('fontSize'), fixedWidth);
                        if (isNaN(result = asPx(value)) && !isNaN(result = asPercent$1(value))) {
                            const parent = this.actualParent;
                            if (parent) {
                                result *= parent.fontSize;
                                if (fixedWidth && !isFixedFont(parent)) {
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
                                emRatio = safeFloat(value);
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
                                                const n = asPercent$1(value = convertFontSize(fontSize));
                                                if (!isNaN(n)) {
                                                    emRatio *= n;
                                                }
                                                else if (REGEXP_EM.test(value)) {
                                                    emRatio *= safeFloat(value);
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
                            result = (endsWith$1(value, 'rem') ? safeFloat(value, 3) * getRemSize(fixedWidth) : parseUnit$2(value, { fixedWidth })) * emRatio;
                        }
                    }
                    else {
                        result = this.actualParent.fontSize;
                    }
                }
                else {
                    const options = { fixedWidth: isFixedFont(this) };
                    result = parseUnit$2(this.css('fontSize'), options) || ((_b = (_a = this.ascend({ condition: item => item.fontSize > 0 })[0]) === null || _a === void 0 ? void 0 : _a.fontSize) !== null && _b !== void 0 ? _b : parseUnit$2('1rem', options));
                }
                this._cache.fontSize = result;
            }
            return result;
        }
        get style() {
            return this._style || (this._style = this.styleElement ? !this.pseudoElt ? getStyle(this._element) : getStyle(getParentElement(this._element), this.pseudoElt) : PROXY_INLINESTYLE);
        }
        get cssStyle() {
            return this._elementData ? Object.assign({}, this._elementData.styleMap) : {};
        }
        get textStyle() {
            let result = this._cache.textStyle;
            if (result === undefined) {
                result = this.cssAsObject(...TEXT_STYLE);
                result.fontSize = 'inherit';
                result.lineHeight = 'inherit';
                this._cache.textStyle = result;
            }
            return result;
        }
        get dir() {
            let result = this._cacheState.dir;
            if (result === undefined) {
                result = this.naturalElement ? this._element.dir : '';
                if (!result) {
                    let parent = this.actualParent;
                    while (parent) {
                        if (result = parent.dir) {
                            break;
                        }
                        parent = parent.actualParent;
                    }
                }
                this._cacheState.dir = result;
            }
            return result;
        }
        get elementData() {
            return this._elementData;
        }
        get initial() {
            return this._initial;
        }
    }

    const { TRANSFORM } = squared.lib.regex;
    const { asPercent, isPercent, convertAngle, parseUnit: parseUnit$1 } = squared.lib.css;
    const { splitEnclosing: splitEnclosing$1, splitPair: splitPair$2, splitSome: splitSome$3, startsWith: startsWith$1 } = squared.lib.util;
    function getKeyframesRules(documentRoot = document) {
        const result = new Map();
        const styleSheets = documentRoot.styleSheets;
        for (let i = 0, length = styleSheets.length; i < length; ++i) {
            try {
                const cssRules = styleSheets[i].cssRules;
                if (cssRules) {
                    for (let j = 0, q = cssRules.length; j < q; ++j) {
                        try {
                            const item = cssRules[j];
                            if (item.type === CSSRule.KEYFRAMES_RULE) {
                                const value = parseKeyframes(item.cssRules);
                                if (value) {
                                    const data = result.get(item.name);
                                    if (data) {
                                        Object.assign(data, value);
                                    }
                                    else {
                                        result.set(item.name, value);
                                    }
                                }
                            }
                        }
                        catch (_a) {
                        }
                    }
                }
            }
            catch (_b) {
            }
        }
        return result;
    }
    function parseKeyframes(rules) {
        const result = {};
        let valid;
        for (let i = 0, length = rules.length; i < length; ++i) {
            const item = rules[i];
            const values = splitEnclosing$1(item.cssText, '', true, '{', '}');
            const items = values[1].trim().split(';');
            items.pop();
            splitSome$3(item.keyText || values[0], percent => {
                switch (percent) {
                    case 'from':
                        percent = '0%';
                        break;
                    case 'to':
                        percent = '100%';
                        break;
                }
                const keyframe = {};
                items.forEach(frame => {
                    const [attr, value] = splitPair$2(frame, ':', true);
                    if (value) {
                        keyframe[attr] = value;
                    }
                });
                result[percent] = keyframe;
                valid = true;
            });
        }
        return valid ? result : null;
    }
    function parseTransform(value, options) {
        var _a, _b, _c, _d;
        let accumulate, boundingBox;
        if (options) {
            ({ accumulate, boundingBox } = options);
        }
        const result = [];
        const transforms = splitEnclosing$1(value);
        for (let i = 0, length = transforms.length; i < length; i += 2) {
            const method = transforms[i].trim();
            const transform = method + transforms[i + 1];
            if (startsWith$1(method, 'translate')) {
                const translate = TRANSFORM.TRANSLATE.exec(transform);
                if (translate) {
                    const tX = translate[2];
                    let x = 0, y = 0, z = 0, group = 'translate', n;
                    switch (method) {
                        case 'translate':
                        case 'translate3d': {
                            if (!isNaN(n = asPercent(tX))) {
                                if (boundingBox) {
                                    x = n * boundingBox.width;
                                }
                            }
                            else {
                                x = parseUnit$1(tX, options);
                            }
                            const tY = translate[3];
                            if (tY) {
                                if (!isNaN(n = asPercent(tY))) {
                                    if (boundingBox) {
                                        y = n * boundingBox.height;
                                    }
                                }
                                else {
                                    y = parseUnit$1(tY, options);
                                }
                            }
                            if (method === 'translate3d') {
                                const tZ = translate[4];
                                if (tZ && !isPercent(tZ)) {
                                    z = parseUnit$1(tZ, options);
                                    group += '3d';
                                }
                                else {
                                    continue;
                                }
                            }
                            break;
                        }
                        case 'translateX':
                            if (!isNaN(n = asPercent(tX))) {
                                if (boundingBox) {
                                    x = n * boundingBox.width;
                                }
                            }
                            else {
                                x = parseUnit$1(tX, options);
                            }
                            break;
                        case 'translateY':
                            if (!isNaN(n = asPercent(tX))) {
                                if (boundingBox) {
                                    y = n * boundingBox.height;
                                }
                            }
                            else {
                                y = parseUnit$1(tX, options);
                            }
                            break;
                        case 'translateZ':
                            z = parseUnit$1(tX, options);
                            break;
                    }
                    if (accumulate) {
                        const values = (_a = result.find(item => item.group === group)) === null || _a === void 0 ? void 0 : _a.values;
                        if (values) {
                            values[0] += x;
                            values[1] += y;
                            values[2] += z;
                            continue;
                        }
                    }
                    result.push({ group, method, values: [x, y, z] });
                }
            }
            else if (startsWith$1(method, 'rotate')) {
                const rotate = TRANSFORM.ROTATE.exec(transform);
                if (rotate) {
                    const angle = convertAngle(rotate[5], rotate[6]);
                    if (!isNaN(angle)) {
                        let x = 0, y = 0, z = 0, group = 'rotate';
                        switch (method) {
                            case 'rotate':
                                x = angle;
                                y = angle;
                                break;
                            case 'rotateX':
                                x = angle;
                                break;
                            case 'rotateY':
                                y = angle;
                                break;
                            case 'rotateZ':
                                z = angle;
                                break;
                            case 'rotate3d':
                                x = +rotate[2];
                                y = +rotate[3];
                                z = +rotate[4];
                                if (isNaN(x) || isNaN(y) || isNaN(z)) {
                                    continue;
                                }
                                group += '3d';
                                break;
                        }
                        if (accumulate) {
                            const data = result.find(item => item.group === group);
                            if (data) {
                                const values = data.values;
                                values[0] += x;
                                values[1] += y;
                                values[2] += z;
                                if (data.angle !== undefined) {
                                    data.angle += angle;
                                }
                                continue;
                            }
                        }
                        result.push({ group, method, values: [x, y, z], angle: method === 'rotate3d' ? angle : undefined });
                    }
                }
            }
            else if (startsWith$1(method, 'scale')) {
                const scale = TRANSFORM.SCALE.exec(transform);
                if (scale) {
                    let x = 1, y = 1, z = 1, group = 'scale';
                    switch (method) {
                        case 'scale':
                        case 'scale3d':
                            x = +scale[2];
                            y = scale[3] ? +scale[3] : x;
                            if (method === 'scale3d') {
                                if (scale[4]) {
                                    z = +scale[4];
                                    group += '3d';
                                }
                                else {
                                    continue;
                                }
                            }
                            break;
                        case 'scaleX':
                            x = +scale[2];
                            break;
                        case 'scaleY':
                            y = +scale[2];
                            break;
                        case 'scaleZ':
                            z = +scale[2];
                            break;
                    }
                    if (accumulate) {
                        const values = (_b = result.find(item => item.group === group)) === null || _b === void 0 ? void 0 : _b.values;
                        if (values) {
                            values[0] *= x;
                            values[1] *= y;
                            values[2] *= z;
                            continue;
                        }
                    }
                    result.push({ group, method, values: [x, y, z] });
                }
            }
            else if (startsWith$1(method, 'skew')) {
                const skew = TRANSFORM.SKEW.exec(transform);
                if (skew) {
                    const angle = convertAngle(skew[2], skew[3]);
                    if (!isNaN(angle)) {
                        let x = 0, y = 0;
                        switch (method) {
                            case 'skew':
                                x = angle;
                                if (skew[4] && skew[5]) {
                                    y = convertAngle(skew[4], skew[5], 0);
                                }
                                break;
                            case 'skewX':
                                x = angle;
                                break;
                            case 'skewY':
                                y = angle;
                                break;
                        }
                        if (accumulate) {
                            const values = (_c = result.find(item => item.group === 'skew')) === null || _c === void 0 ? void 0 : _c.values;
                            if (values) {
                                values[0] += x;
                                values[1] += y;
                                continue;
                            }
                        }
                        result.push({ group: 'skew', method, values: [x, y] });
                    }
                }
            }
            else if (startsWith$1(method, 'matrix')) {
                const matrix = TRANSFORM.MATRIX.exec(transform);
                if (matrix) {
                    let args;
                    if (method === 'matrix') {
                        if (matrix[8]) {
                            continue;
                        }
                        args = 6;
                    }
                    else {
                        if (!matrix[17]) {
                            continue;
                        }
                        args = 16;
                    }
                    const values = new Array(args);
                    for (let j = 0; j < args; ++j) {
                        values[j] = +matrix[j + 2];
                    }
                    result.push({ group: method, method, values });
                }
            }
            else if (method === 'perspective') {
                const perspective = TRANSFORM.PERSPECTIVE.exec(transform);
                if (perspective) {
                    const pX = perspective[2];
                    const n = asPercent(pX);
                    let x = 0;
                    if (!isNaN(n)) {
                        if (boundingBox) {
                            x = n * boundingBox.width;
                        }
                    }
                    else {
                        x = parseUnit$1(pX, options);
                    }
                    if (accumulate) {
                        const values = (_d = result.find(item => item.group === 'perspective')) === null || _d === void 0 ? void 0 : _d.values;
                        if (values) {
                            values[0] = x;
                            continue;
                        }
                    }
                    result.push({ group: 'perspective', method, values: [x] });
                }
            }
        }
        return result;
    }

    var css = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getKeyframesRules: getKeyframesRules,
        parseKeyframes: parseKeyframes,
        parseTransform: parseTransform
    });

    const { FILE, STRING: STRING$1 } = squared.lib.regex;
    const { extractURL, resolveURL } = squared.lib.css;
    const { convertBase64, endsWith, fromLastIndexOf, isBase64, resolvePath: resolvePath$1, splitEnclosing, splitPair: splitPair$1, splitPairEnd, splitPairStart, splitSome: splitSome$2, startsWith } = squared.lib.util;
    const REGEXP_FONTURL = /(url|local)\(\s*(?:"([^"]+)"|'([^']+)'|([^)]+))\s*\)\s*(?:format\(\s*["']?\s*([\w-]+)\s*["']?\s*\))?/g;
    const REGEXP_DATAURI = new RegExp(`^(?:^|\\s+)${STRING$1.DATAURI}(?:$|\\s+)$`);
    class Resource {
        constructor(application) {
            this.application = application;
            this._fileHandler = null;
            this.init();
        }
        static hasMimeType(formats, value) {
            return formats === '*' || formats.includes(parseMimeType(value));
        }
        static getExtension(value) {
            var _a;
            return ((_a = /\.([^.\s/]+?)(?:\s+|$)$/.exec(value)) === null || _a === void 0 ? void 0 : _a[1]) || '';
        }
        static parseDataURI(value, mimeType = 'image/unknown', encoding = 'base64') {
            const match = REGEXP_DATAURI.exec(value);
            if (match && match[1]) {
                const leading = match[2];
                const trailing = match[3];
                const data = match[4];
                if (trailing) {
                    mimeType = leading.trim();
                    encoding = trailing.trim();
                }
                else if (leading) {
                    if (leading.indexOf('/') !== -1) {
                        mimeType = leading;
                        if (!encoding && isBase64(data)) {
                            encoding = 'base64';
                        }
                    }
                    else {
                        encoding = leading;
                    }
                }
                const result = { mimeType, encoding };
                result[encoding === 'base64' ? 'base64' : 'content'] = data;
                return result;
            }
        }
        init() { }
        reset() { }
        clear() {
            Resource.ASSETS.length = 0;
        }
        createThread(resourceId) {
            var _a;
            const data = (_a = Resource.ASSETS)[resourceId] || (_a[resourceId] = {});
            data.fonts = new Map();
            data.image = new Map();
        }
        preloadAssets(resourceId, documentRoot, elements, preloadImages, preloadFonts) {
            const assets = Resource.ASSETS[resourceId];
            const result = [];
            const images = [];
            const preloadMap = [];
            for (const element of elements) {
                element.querySelectorAll('img[srcset], picture > source[srcset]').forEach((source) => splitSome$2(source.srcset, uri => this.addImage(resourceId, resolvePath$1(splitPairStart(uri, ' ', false, true)))));
                element.querySelectorAll('video').forEach((source) => this.addImage(resourceId, source.poster));
                element.querySelectorAll('input[type=image]').forEach((image) => this.addImage(resourceId, image.src, image.width || NaN, image.height || NaN));
                element.querySelectorAll('object, embed').forEach((source) => {
                    const src = source.data || source.src;
                    if (src && (startsWith(source.type, 'image/') || startsWith(parseMimeType(src), 'image/'))) {
                        this.addImage(resourceId, src.trim());
                    }
                });
                element.querySelectorAll('svg use').forEach((use) => {
                    const href = use.href.baseVal || use.getAttributeNS('xlink', 'href');
                    if (href && href.indexOf('#') > 0) {
                        const src = resolvePath$1(splitPairStart(href, '#'));
                        if (FILE.SVG.test(src)) {
                            this.addImage(resourceId, src);
                        }
                    }
                });
            }
            if (preloadImages) {
                const { image, rawData } = assets;
                for (const item of image.values()) {
                    const uri = item.uri;
                    if (FILE.SVG.test(uri)) {
                        result.push(uri);
                    }
                    else if (isNaN(item.width) || isNaN(item.height)) {
                        const element = document.createElement('img');
                        element.src = uri;
                        if (element.naturalWidth && element.naturalHeight) {
                            item.width = element.naturalWidth;
                            item.height = element.naturalHeight;
                        }
                        else {
                            documentRoot.appendChild(element);
                            images.push(element);
                            result.push(element);
                        }
                    }
                }
                if (rawData) {
                    for (const data of rawData) {
                        const item = data[1];
                        const mimeType = item.mimeType;
                        if (startsWith(mimeType, 'image/') && !endsWith(mimeType, 'svg+xml')) {
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
                                images.push(element);
                                result.push(element);
                            }
                        }
                    }
                }
            }
            if (preloadFonts) {
                for (const item of assets.fonts.values()) {
                    for (const font of item) {
                        const srcUrl = font.srcUrl;
                        if (srcUrl) {
                            result.push(srcUrl);
                        }
                    }
                }
            }
            for (const element of elements) {
                element.querySelectorAll('img').forEach((image) => {
                    if (!preloadImages) {
                        this.addImageElement(resourceId, image);
                    }
                    else {
                        const src = image.src;
                        if (!preloadMap.includes(src)) {
                            if (FILE.SVG.test(src)) {
                                result.push(src);
                            }
                            else if (image.complete) {
                                this.addImageElement(resourceId, image);
                            }
                            else {
                                result.push(image);
                            }
                            preloadMap.push(src);
                        }
                    }
                });
            }
            return [result, images];
        }
        parseFontFace(resourceId, cssText, styleSheetHref) {
            const fontFace = splitEnclosing(cssText, '', true, '{', '}')[1];
            if (fontFace) {
                const fontMap = {};
                const items = fontFace.trim().split(';');
                for (let i = 0, length = items.length - 1; i < length; ++i) {
                    const [attr, value] = splitPair$1(items[i], ':', true);
                    fontMap[attr] = value;
                }
                let fontFamily = fontMap['font-family'];
                if (fontMap.src && fontFamily) {
                    const style = fontMap['font-style'];
                    const weight = fontMap['font-weight'];
                    const fontStyle = style || 'normal';
                    let fontWeight = 400;
                    if (weight) {
                        switch (weight) {
                            case 'normal':
                                break;
                            case 'lighter':
                                fontWeight = 100;
                                break;
                            case 'bold':
                            case 'bolder':
                                fontWeight = 700;
                                break;
                            default:
                                fontWeight = +weight || 400;
                                break;
                        }
                    }
                    fontFamily = trimBoth(fontFamily);
                    let match;
                    while (match = REGEXP_FONTURL.exec(fontFace)) {
                        const url = (match[2] || match[3] || match[4]).trim();
                        let srcFormat = match[5], mimeType = '', srcLocal, srcUrl, srcBase64;
                        const setMimeType = () => {
                            switch (srcFormat) {
                                case 'truetype':
                                    mimeType = 'font/ttf';
                                    break;
                                case 'opentype':
                                    mimeType = 'font/otf';
                                    break;
                                case 'woff2':
                                    mimeType = 'font/woff2';
                                    break;
                                case 'woff':
                                    mimeType = 'font/woff';
                                    break;
                                case 'svg':
                                    mimeType = 'image/svg+xml';
                                    break;
                                case 'embedded-opentype':
                                    mimeType = 'application/vnd.ms-fontobject';
                                    break;
                                default:
                                    srcFormat = '';
                                    break;
                            }
                        };
                        setMimeType();
                        if (match[1] === 'local') {
                            srcLocal = url;
                        }
                        else {
                            if (startsWith(url, 'data:')) {
                                let mime;
                                [mime, srcBase64] = splitPair$1(url, ',', true);
                                if (mime.indexOf('base64') === -1 && !isBase64(srcBase64)) {
                                    continue;
                                }
                                mimeType || (mimeType = mime.toLowerCase());
                            }
                            else {
                                srcUrl = resolvePath$1(url, styleSheetHref);
                                mimeType || (mimeType = parseMimeType(srcUrl));
                            }
                            if (!srcFormat) {
                                if (mimeType.indexOf('/ttf') !== -1) {
                                    srcFormat = 'truetype';
                                }
                                else if (mimeType.indexOf('/otf') !== -1) {
                                    srcFormat = 'opentype';
                                }
                                else if (mimeType.indexOf('/woff2') !== -1) {
                                    srcFormat = 'woff2';
                                }
                                else if (mimeType.indexOf('/woff') !== -1) {
                                    srcFormat = 'woff';
                                }
                                else if (mimeType.indexOf('/svg+xml') !== -1) {
                                    srcFormat = 'svg';
                                }
                                else if (mimeType.indexOf('/vnd.ms-fontobject') !== -1) {
                                    srcFormat = 'embedded-opentype';
                                }
                                else {
                                    continue;
                                }
                                setMimeType();
                            }
                        }
                        this.addFont(resourceId, {
                            fontFamily,
                            fontWeight,
                            fontStyle,
                            mimeType,
                            srcFormat,
                            srcUrl,
                            srcLocal,
                            srcBase64
                        });
                    }
                    REGEXP_FONTURL.lastIndex = 0;
                }
            }
        }
        parseKeyFrames(resourceId, cssRule) {
            var _a;
            const value = parseKeyframes(cssRule.cssRules);
            if (value) {
                const keyFrames = (_a = Resource.ASSETS[resourceId]).keyFrames || (_a.keyFrames = new Map());
                const item = keyFrames.get(cssRule.name);
                if (item) {
                    Object.assign(item, value);
                }
                else {
                    keyFrames.set(cssRule.name, value);
                }
            }
        }
        addAsset(resourceId, asset) {
            const assets = Resource.ASSETS[resourceId];
            if (assets && (asset.content || asset.uri || asset.base64)) {
                const other = assets.other || (assets.other = []);
                const { pathname, filename } = asset;
                const append = other.find(item => item.pathname === pathname && item.filename === filename);
                if (append) {
                    Object.assign(append, asset);
                }
                else {
                    other.push(asset);
                }
            }
        }
        addImage(resourceId, uri, width = NaN, height = NaN) {
            const assets = Resource.ASSETS[resourceId];
            if (assets && uri && (width && height || !this.getImage(resourceId, uri))) {
                assets.image.set(uri, { width, height, uri });
            }
        }
        addAudio(resourceId, uri, options) {
            const assets = Resource.ASSETS[resourceId];
            if (assets) {
                (assets.audio || (assets.audio = new Map())).set(uri, Object.assign({ uri }, options));
            }
        }
        addVideo(resourceId, uri, options) {
            const assets = Resource.ASSETS[resourceId];
            if (assets) {
                (assets.video || (assets.video = new Map())).set(uri, Object.assign({ uri }, options));
            }
        }
        addFont(resourceId, data) {
            const assets = Resource.ASSETS[resourceId];
            if (assets) {
                const items = assets.fonts.get(data.fontFamily = data.fontFamily.toLowerCase());
                if (items) {
                    items.push(data);
                }
                else {
                    assets.fonts.set(data.fontFamily, [data]);
                }
            }
        }
        addRawData(resourceId, uri, options) {
            const assets = Resource.ASSETS[resourceId];
            if (assets) {
                let filename, mimeType, encoding, content, base64, buffer, width, height;
                if (options) {
                    ({ filename, mimeType, encoding, content, base64, buffer, width, height } = options);
                    mimeType && (mimeType = mimeType.toLowerCase());
                    encoding && (encoding = encoding.toLowerCase());
                    content && (content = content.trim());
                }
                if (base64 || encoding === 'base64') {
                    if (!base64) {
                        if (content) {
                            base64 = startsWith(content, 'data:') ? splitPairEnd(content, ',', true) : content;
                            content = undefined;
                        }
                        else if (buffer) {
                            base64 = convertBase64(buffer);
                        }
                        else {
                            return;
                        }
                        buffer = undefined;
                    }
                    if (mimeType === 'image/svg+xml') {
                        content = window.atob(base64);
                    }
                }
                else if (buffer) {
                    content = undefined;
                }
                if (content) {
                    content = content.replace(/\\(["'])/g, (...match) => match[1]);
                }
                if (content || base64 || buffer) {
                    const url = splitPairStart(uri, '?');
                    if (!filename) {
                        const ext = mimeType && fromMimeType(mimeType);
                        filename = ext && url.endsWith('.' + ext) ? fromLastIndexOf(url, '/') : this.assignFilename(url, mimeType, ext);
                    }
                    (assets.rawData || (assets.rawData = new Map())).set(uri, {
                        pathname: startsWith(url, location.origin) ? url.substring(location.origin.length + 1, url.lastIndexOf('/')) : '',
                        filename,
                        mimeType,
                        content,
                        base64,
                        buffer,
                        width,
                        height
                    });
                }
            }
        }
        getImage(resourceId, uri) {
            const assets = Resource.ASSETS[resourceId];
            if (assets) {
                return assets.image.get(uri);
            }
        }
        getVideo(resourceId, uri) {
            var _a;
            const video = (_a = Resource.ASSETS[resourceId]) === null || _a === void 0 ? void 0 : _a.video;
            if (video) {
                return video.get(uri);
            }
        }
        getAudio(resourceId, uri) {
            var _a;
            const audio = (_a = Resource.ASSETS[resourceId]) === null || _a === void 0 ? void 0 : _a.audio;
            if (audio) {
                return audio.get(uri);
            }
        }
        getFonts(resourceId, fontFamily, fontStyle = 'normal', fontWeight) {
            const assets = Resource.ASSETS[resourceId];
            if (assets) {
                const font = assets.fonts.get(fontFamily.trim().toLowerCase());
                if (font) {
                    const mimeType = this.mimeTypeMap.font;
                    return font.filter(item => startsWith(fontStyle, item.fontStyle) && (!fontWeight || item.fontWeight === +fontWeight) && (mimeType === '*' || mimeType.includes(item.mimeType))).sort((a, b) => a.fontWeight - b.fontWeight);
                }
            }
            return [];
        }
        getRawData(resourceId, uri) {
            var _a;
            const rawData = (_a = Resource.ASSETS[resourceId]) === null || _a === void 0 ? void 0 : _a.rawData;
            if (rawData) {
                if (startsWith(uri, 'url(')) {
                    uri = extractURL(uri);
                    if (!uri) {
                        return;
                    }
                }
                return rawData.get(uri);
            }
        }
        addImageElement(resourceId, element) {
            var _a;
            if (element.complete) {
                const uri = element.src;
                const image = Resource.parseDataURI(uri);
                if (image) {
                    image.width = element.naturalWidth;
                    image.height = element.naturalHeight;
                    this.addRawData(resourceId, uri, image);
                }
                if (uri) {
                    (_a = Resource.ASSETS[resourceId]) === null || _a === void 0 ? void 0 : _a.image.set(uri, { width: element.naturalWidth, height: element.naturalHeight, uri });
                }
            }
        }
        fromImageUrl(resourceId, value) {
            const data = this.getRawData(resourceId, value);
            if (data) {
                return [data];
            }
            const result = [];
            splitEnclosing(value, 'url').forEach(seg => {
                const url = resolveURL(seg);
                if (url) {
                    const image = this.getImage(resourceId, url);
                    if (image) {
                        result.push(image);
                    }
                }
            });
            return result;
        }
        assignFilename(uri, mimeType, ext = 'unknown') {
            return generateUUID(this.application.userSettings.formatUUID) + '.' + ext;
        }
        set fileHandler(value) {
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
        get mapOfAssets() {
            return Resource.ASSETS;
        }
    }
    Resource.KEY_NAME = 'squared.base.resource';
    Resource.ASSETS = [];

    /* eslint no-shadow: "off" */
    var APP_FRAMEWORK;
    (function (APP_FRAMEWORK) {
        APP_FRAMEWORK[APP_FRAMEWORK["UNIVERSAL"] = 0] = "UNIVERSAL";
        APP_FRAMEWORK[APP_FRAMEWORK["VDOM"] = 1] = "VDOM";
        APP_FRAMEWORK[APP_FRAMEWORK["ANDROID"] = 2] = "ANDROID";
        APP_FRAMEWORK[APP_FRAMEWORK["CHROME"] = 4] = "CHROME";
    })(APP_FRAMEWORK || (APP_FRAMEWORK = {}));
    var NODE_ALIGNMENT;
    (function (NODE_ALIGNMENT) {
        NODE_ALIGNMENT[NODE_ALIGNMENT["UNKNOWN"] = 1] = "UNKNOWN";
        NODE_ALIGNMENT[NODE_ALIGNMENT["AUTO_LAYOUT"] = 2] = "AUTO_LAYOUT";
        NODE_ALIGNMENT[NODE_ALIGNMENT["HORIZONTAL"] = 4] = "HORIZONTAL";
        NODE_ALIGNMENT[NODE_ALIGNMENT["VERTICAL"] = 8] = "VERTICAL";
        NODE_ALIGNMENT[NODE_ALIGNMENT["ABSOLUTE"] = 16] = "ABSOLUTE";
        NODE_ALIGNMENT[NODE_ALIGNMENT["BLOCK"] = 32] = "BLOCK";
        NODE_ALIGNMENT[NODE_ALIGNMENT["SEGMENTED"] = 64] = "SEGMENTED";
        NODE_ALIGNMENT[NODE_ALIGNMENT["COLUMN"] = 128] = "COLUMN";
        NODE_ALIGNMENT[NODE_ALIGNMENT["FLOAT"] = 256] = "FLOAT";
        NODE_ALIGNMENT[NODE_ALIGNMENT["INLINE"] = 512] = "INLINE";
        NODE_ALIGNMENT[NODE_ALIGNMENT["RIGHT"] = 1024] = "RIGHT";
        NODE_ALIGNMENT[NODE_ALIGNMENT["SINGLE"] = 2048] = "SINGLE";
        NODE_ALIGNMENT[NODE_ALIGNMENT["EXTENDABLE"] = 4096] = "EXTENDABLE";
        NODE_ALIGNMENT[NODE_ALIGNMENT["WRAPPER"] = 8192] = "WRAPPER";
        NODE_ALIGNMENT[NODE_ALIGNMENT["PERCENT"] = 16384] = "PERCENT";
    })(NODE_ALIGNMENT || (NODE_ALIGNMENT = {}));
    var BOX_STANDARD;
    (function (BOX_STANDARD) {
        BOX_STANDARD[BOX_STANDARD["MARGIN_TOP"] = 1] = "MARGIN_TOP";
        BOX_STANDARD[BOX_STANDARD["MARGIN_RIGHT"] = 2] = "MARGIN_RIGHT";
        BOX_STANDARD[BOX_STANDARD["MARGIN_BOTTOM"] = 4] = "MARGIN_BOTTOM";
        BOX_STANDARD[BOX_STANDARD["MARGIN_LEFT"] = 8] = "MARGIN_LEFT";
        BOX_STANDARD[BOX_STANDARD["PADDING_TOP"] = 16] = "PADDING_TOP";
        BOX_STANDARD[BOX_STANDARD["PADDING_RIGHT"] = 32] = "PADDING_RIGHT";
        BOX_STANDARD[BOX_STANDARD["PADDING_BOTTOM"] = 64] = "PADDING_BOTTOM";
        BOX_STANDARD[BOX_STANDARD["PADDING_LEFT"] = 128] = "PADDING_LEFT";
        BOX_STANDARD[BOX_STANDARD["MARGIN"] = 15] = "MARGIN";
        BOX_STANDARD[BOX_STANDARD["MARGIN_VERTICAL"] = 5] = "MARGIN_VERTICAL";
        BOX_STANDARD[BOX_STANDARD["MARGIN_HORIZONTAL"] = 10] = "MARGIN_HORIZONTAL";
        BOX_STANDARD[BOX_STANDARD["PADDING"] = 240] = "PADDING";
        BOX_STANDARD[BOX_STANDARD["PADDING_VERTICAL"] = 80] = "PADDING_VERTICAL";
        BOX_STANDARD[BOX_STANDARD["PADDING_HORIZONTAL"] = 160] = "PADDING_HORIZONTAL";
    })(BOX_STANDARD || (BOX_STANDARD = {}));
    var NODE_TRAVERSE;
    (function (NODE_TRAVERSE) {
        NODE_TRAVERSE[NODE_TRAVERSE["HORIZONTAL"] = 0] = "HORIZONTAL";
        NODE_TRAVERSE[NODE_TRAVERSE["VERTICAL"] = 1] = "VERTICAL";
        NODE_TRAVERSE[NODE_TRAVERSE["LINEBREAK"] = 2] = "LINEBREAK";
        NODE_TRAVERSE[NODE_TRAVERSE["INLINE_WRAP"] = 3] = "INLINE_WRAP";
        NODE_TRAVERSE[NODE_TRAVERSE["FLOAT_CLEAR"] = 4] = "FLOAT_CLEAR";
        NODE_TRAVERSE[NODE_TRAVERSE["FLOAT_BLOCK"] = 5] = "FLOAT_BLOCK";
        NODE_TRAVERSE[NODE_TRAVERSE["FLOAT_WRAP"] = 6] = "FLOAT_WRAP";
        NODE_TRAVERSE[NODE_TRAVERSE["FLOAT_INTERSECT"] = 7] = "FLOAT_INTERSECT";
        NODE_TRAVERSE[NODE_TRAVERSE["PERCENT_WRAP"] = 8] = "PERCENT_WRAP";
    })(NODE_TRAVERSE || (NODE_TRAVERSE = {}));
    var NODE_TEMPLATE;
    (function (NODE_TEMPLATE) {
        NODE_TEMPLATE[NODE_TEMPLATE["XML"] = 1] = "XML";
        NODE_TEMPLATE[NODE_TEMPLATE["INCLUDE"] = 2] = "INCLUDE";
    })(NODE_TEMPLATE || (NODE_TEMPLATE = {}));
    var APP_SECTION;
    (function (APP_SECTION) {
        APP_SECTION[APP_SECTION["DOM_TRAVERSE"] = 1] = "DOM_TRAVERSE";
        APP_SECTION[APP_SECTION["EXTENSION"] = 2] = "EXTENSION";
        APP_SECTION[APP_SECTION["RENDER"] = 4] = "RENDER";
        APP_SECTION[APP_SECTION["ALL"] = 7] = "ALL";
    })(APP_SECTION || (APP_SECTION = {}));
    var NODE_RESOURCE;
    (function (NODE_RESOURCE) {
        NODE_RESOURCE[NODE_RESOURCE["BOX_STYLE"] = 1] = "BOX_STYLE";
        NODE_RESOURCE[NODE_RESOURCE["BOX_SPACING"] = 2] = "BOX_SPACING";
        NODE_RESOURCE[NODE_RESOURCE["FONT_STYLE"] = 4] = "FONT_STYLE";
        NODE_RESOURCE[NODE_RESOURCE["VALUE_STRING"] = 8] = "VALUE_STRING";
        NODE_RESOURCE[NODE_RESOURCE["IMAGE_SOURCE"] = 16] = "IMAGE_SOURCE";
        NODE_RESOURCE[NODE_RESOURCE["ASSET"] = 28] = "ASSET";
        NODE_RESOURCE[NODE_RESOURCE["ALL"] = 31] = "ALL";
    })(NODE_RESOURCE || (NODE_RESOURCE = {}));
    var NODE_PROCEDURE;
    (function (NODE_PROCEDURE) {
        NODE_PROCEDURE[NODE_PROCEDURE["CONSTRAINT"] = 1] = "CONSTRAINT";
        NODE_PROCEDURE[NODE_PROCEDURE["LAYOUT"] = 2] = "LAYOUT";
        NODE_PROCEDURE[NODE_PROCEDURE["ALIGNMENT"] = 4] = "ALIGNMENT";
        NODE_PROCEDURE[NODE_PROCEDURE["ACCESSIBILITY"] = 8] = "ACCESSIBILITY";
        NODE_PROCEDURE[NODE_PROCEDURE["LOCALIZATION"] = 16] = "LOCALIZATION";
        NODE_PROCEDURE[NODE_PROCEDURE["CUSTOMIZATION"] = 32] = "CUSTOMIZATION";
        NODE_PROCEDURE[NODE_PROCEDURE["ALL"] = 63] = "ALL";
    })(NODE_PROCEDURE || (NODE_PROCEDURE = {}));

    var constant = /*#__PURE__*/Object.freeze({
        __proto__: null,
        get APP_FRAMEWORK () { return APP_FRAMEWORK; },
        get NODE_ALIGNMENT () { return NODE_ALIGNMENT; },
        get BOX_STANDARD () { return BOX_STANDARD; },
        get NODE_TRAVERSE () { return NODE_TRAVERSE; },
        get NODE_TEMPLATE () { return NODE_TEMPLATE; },
        get APP_SECTION () { return APP_SECTION; },
        get NODE_RESOURCE () { return NODE_RESOURCE; },
        get NODE_PROCEDURE () { return NODE_PROCEDURE; }
    });

    const { STRING } = squared.lib.regex;
    const { calculateVar, getFontSize, isCalc, isLength, parseUnit } = squared.lib.css;
    const { isString, iterateArray, resolvePath, splitSome: splitSome$1 } = squared.lib.util;
    let REGEXP_SOURCESIZES;
    function getAspectRatio(element) {
        if (element.width && element.height) {
            return element.width / element.height;
        }
    }
    function removeElementsByClassName(className) {
        const elements = Array.from(document.getElementsByClassName(className));
        for (let i = 0, length = elements.length; i < length; ++i) {
            const element = elements[i];
            const parentElement = element.parentElement;
            if (parentElement) {
                parentElement.removeChild(element);
            }
        }
    }
    function getElementsBetweenSiblings(elementStart, elementEnd) {
        const parentNode = elementEnd.parentNode;
        const result = [];
        if (parentNode && (!elementStart || parentNode === elementStart.parentNode)) {
            let startIndex = elementStart ? -1 : 0, endIndex = -1;
            iterateArray(parentNode.childNodes, (element, index) => {
                if (element === elementEnd) {
                    endIndex = index;
                    if (startIndex !== -1) {
                        return true;
                    }
                }
                else if (element === elementStart) {
                    startIndex = index;
                    if (endIndex !== -1) {
                        return true;
                    }
                }
            });
            if (startIndex !== -1 && endIndex !== -1) {
                iterateArray(parentNode.childNodes, (element) => {
                    const nodeName = element.nodeName;
                    if (nodeName[0] !== '#' || nodeName === '#text') {
                        result.push(element);
                    }
                }, Math.min(startIndex, endIndex), Math.max(startIndex, endIndex) + 1);
            }
        }
        return result;
    }
    function getTextMetrics(value, fontSize, fontFamily) {
        const context = document.createElement('canvas').getContext('2d');
        if (context) {
            context.font = fontSize + 'px' + (fontFamily ? ' ' + fontFamily : '');
            return context.measureText(value);
        }
    }
    function getSrcSet(element, mimeType, fontSize) {
        const result = [];
        const parentElement = element.parentElement;
        let { srcset, sizes } = element, aspectRatio = getAspectRatio(element);
        if (parentElement && parentElement.tagName === 'PICTURE') {
            iterateArray(parentElement.children, (item) => {
                if (item.tagName === 'SOURCE' && (!item.type || !mimeType || mimeType === '*' || mimeType.includes(item.type.trim().toLowerCase())) && !(isString(item.media) && !window.matchMedia(item.media).matches)) {
                    ({ srcset, sizes } = item);
                    aspectRatio = getAspectRatio(item);
                    return true;
                }
            });
        }
        if (srcset) {
            splitSome$1(srcset, value => {
                const match = DOM.SRCSET.exec(value);
                if (match) {
                    let width = 0, pixelRatio = 1;
                    if (match[3]) {
                        if (match[3].toLowerCase() === 'w') {
                            width = +match[2];
                            pixelRatio = 0;
                        }
                        else {
                            pixelRatio = +match[2];
                        }
                    }
                    result.push({ src: resolvePath(match[1].split(/\s+/)[0]), pixelRatio, width, aspectRatio });
                }
            });
        }
        const length = result.length;
        if (length === 0) {
            return;
        }
        result.sort((a, b) => {
            const pxA = a.pixelRatio;
            const pxB = b.pixelRatio;
            if (pxA && pxB) {
                return pxA - pxB;
            }
            const widthA = a.width;
            const widthB = b.width;
            if (widthA && widthB) {
                return widthA - widthB;
            }
            if (widthA) {
                return -1;
            }
            if (widthB) {
                return 1;
            }
            return 0;
        });
        if (sizes) {
            REGEXP_SOURCESIZES || (REGEXP_SOURCESIZES = new RegExp(`^((?:\\(\\s*)?(?:\\s*(?:(?:and|or|not)\\s+)?(?:\\(\\s*)?(?:orientation\\s*:\\s*(?:portrait|landscape)|(?:max|min)-width\\s*:\\s*${STRING.LENGTH_PERCENTAGE})\\s*(?:\\))?)+\\s*(?:\\))?)?\\s*(.*)$`, 'i'));
            const options = { fontSize: fontSize !== null && fontSize !== void 0 ? fontSize : getFontSize(element), min: 0 };
            let width = NaN;
            splitSome$1(sizes, value => {
                var _a;
                const match = REGEXP_SOURCESIZES.exec(value);
                if (match) {
                    const query = match[1];
                    const unit = match[3];
                    if (!unit || query && !window.matchMedia(((_a = /^\(\s*(\(.+\))\s*\)$/.exec(query)) === null || _a === void 0 ? void 0 : _a[1]) || query).matches) {
                        return;
                    }
                    if (isCalc(unit)) {
                        width = calculateVar(element, unit, options);
                    }
                    else if (isLength(unit)) {
                        width = parseUnit(unit, options);
                    }
                    if (!isNaN(width)) {
                        return true;
                    }
                }
            });
            if (!isNaN(width)) {
                if (length > 1) {
                    const resolution = width * window.devicePixelRatio;
                    let index = -1;
                    for (let i = 0; i < length; ++i) {
                        const imageWidth = result[i].width;
                        if (imageWidth > 0 && imageWidth <= resolution && (index === -1 || result[index].width < imageWidth)) {
                            index = i;
                        }
                    }
                    if (index > 0) {
                        result.unshift(result.splice(index, 1)[0]);
                    }
                    for (let i = 1; i < length; ++i) {
                        const item = result[i];
                        item.pixelRatio || (item.pixelRatio = item.width / width);
                    }
                }
                const item = result[0];
                item.pixelRatio = 1;
                item.actualWidth = width;
            }
        }
        return result;
    }

    var dom = /*#__PURE__*/Object.freeze({
        __proto__: null,
        removeElementsByClassName: removeElementsByClassName,
        getElementsBetweenSiblings: getElementsBetweenSiblings,
        getTextMetrics: getTextMetrics,
        getSrcSet: getSrcSet
    });

    const { splitPair, splitSome } = squared.lib.util;
    function parseTask(value) {
        if (value) {
            const result = [];
            splitSome(value, item => {
                const [handler, command] = splitPair(item, ':', true);
                if (handler && command) {
                    const [task, preceding] = splitPair(command, ':', true);
                    result.push({ handler, task, preceding: preceding === 'true' });
                }
            }, '+');
            return result;
        }
    }
    function parseWatchInterval(value) {
        if (value && (value = value.trim())) {
            if (value === 'true') {
                return true;
            }
            const match = /^(?:^|\s+)(~|\d+)\s*(?:::\s*(~|.+?)\s*(?:::\s*(.+?)(?:\[([^\]]+)\])?)?)?(?:\s+|$)$/.exec(value);
            if (match) {
                let interval, expires, reload;
                if (match[1] !== '~' && !isNaN(+match[1])) {
                    interval = +match[1];
                }
                if (match[2]) {
                    if (match[2] !== '~') {
                        expires = match[2].trim();
                    }
                    if (match[3]) {
                        const [socketId, port] = splitPair(match[3], ':', true, true);
                        let secure, module;
                        if (match[4]) {
                            secure = match[4].indexOf('secure') !== -1;
                            module = match[4].indexOf('module') !== -1;
                        }
                        reload = { socketId: socketId !== '~' && socketId !== 'true' ? socketId : '', port: port && !isNaN(+port) ? +port : undefined, secure, module };
                    }
                }
                return { interval, expires, reload };
            }
        }
    }

    var internal = /*#__PURE__*/Object.freeze({
        __proto__: null,
        parseTask: parseTask,
        parseWatchInterval: parseWatchInterval
    });

    const lib = {
        constant,
        css,
        dom,
        internal,
        regex,
        util
    };

    exports.Application = Application;
    exports.Controller = Controller;
    exports.Extension = Extension;
    exports.ExtensionManager = ExtensionManager;
    exports.File = File;
    exports.Node = Node;
    exports.NodeList = NodeList;
    exports.Resource = Resource;
    exports.lib = lib;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

}({}));
