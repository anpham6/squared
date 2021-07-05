/* vdom-lite-framework
   https://github.com/anpham6/squared */

var vdom = (function () {
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
    const { CSS_PROPERTIES: CSS_PROPERTIES$1, compareSpecificity, getSpecificity, getPropertiesAsTraits, insertStyleSheetRule, parseSelectorText } = squared.lib.internal;
    const { FILE: FILE$1, STRING } = squared.lib.regex;
    const { getElementCache: getElementCache$1, newSessionInit, setElementCache: setElementCache$1 } = squared.lib.session;
    const { allSettled, capitalize, convertCamelCase: convertCamelCase$1, isBase64, isEmptyString, isPlainObject, replaceAll, resolvePath, splitPair: splitPair$1, splitSome: splitSome$1, startsWith: startsWith$1 } = squared.lib.util;
    const REGEXP_IMPORTANT = /([a-z-]+):[^!;]+!important;/g;
    const REGEXP_CSSHOST = /^:(?:host|host-context)\(([^)]+)\)/;
    const REGEXP_DATAURI = new RegExp(`url\\("(${STRING.DATAURI})"\\)`, 'g');
    const CSS_SHORTHANDNONE = getPropertiesAsTraits(64 /* NONE */);
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
    function parseImageUrl(value, styleSheetHref, resource, resourceId, dataUri) {
        REGEXP_DATAURI.lastIndex = 0;
        let result, match;
        while (match = REGEXP_DATAURI.exec(value)) {
            if (match[2]) {
                if (resource) {
                    const leading = match[3];
                    const encoding = match[4] || (isBase64(match[5]) ? 'base64' : 'utf8');
                    let base64, content;
                    if (encoding === 'base64') {
                        base64 = match[5];
                    }
                    else {
                        content = match[5];
                    }
                    resource.addRawData(resourceId, match[1], { mimeType: leading && leading.indexOf('/') !== -1 ? leading : 'image/unknown', encoding, content, base64 });
                    if (dataUri) {
                        return match[1];
                    }
                }
            }
            else {
                const url = resolvePath(match[5], styleSheetHref);
                if (url) {
                    if (resource) {
                        resource.addImage(resourceId, url);
                    }
                    result = replaceAll(result || value, match[0], `url("${url}")`, 1);
                }
            }
        }
        return result || value;
    }
    class Application$1 {
        constructor(framework, nodeConstructor, ControllerConstructor, ExtensionManagerConstructor, ResourceConstructor, builtInExtensions = new Map()) {
            this.framework = framework;
            this.builtInExtensions = builtInExtensions;
            this.extensions = [];
            this.userSettings = {};
            this.closed = false;
            this.elementMap = new WeakMap();
            this.session = {
                active: new Map(),
                data: new Map()
            };
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
            splitSome$1(value, name => {
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
            const fileHandler = this.fileHandler;
            return fileHandler ? fileHandler.copyTo(pathname, options) : reject(OPERATION_NOT_SUPPORTED);
        }
        appendTo(pathname, options) {
            const fileHandler = this.fileHandler;
            return fileHandler ? fileHandler.appendTo(pathname, options) : reject(OPERATION_NOT_SUPPORTED);
        }
        saveAs(filename, options) {
            const fileHandler = this.fileHandler;
            return fileHandler ? fileHandler.saveAs(filename, options) : reject(OPERATION_NOT_SUPPORTED);
        }
        saveFiles(filename, options) {
            const fileHandler = this.fileHandler;
            return fileHandler ? fileHandler.saveFiles(filename, options) : reject(OPERATION_NOT_SUPPORTED);
        }
        appendFiles(filename, options) {
            const fileHandler = this.fileHandler;
            return fileHandler ? fileHandler.appendFiles(filename, options) : reject(OPERATION_NOT_SUPPORTED);
        }
        copyFiles(pathname, options) {
            const fileHandler = this.fileHandler;
            return fileHandler ? fileHandler.copyFiles(pathname, options) : reject(OPERATION_NOT_SUPPORTED);
        }
        reset() {
            this.controllerHandler.reset();
            const resourceHandler = this.resourceHandler;
            if (resourceHandler) {
                resourceHandler.reset();
            }
            this.extensions.forEach(ext => ext.reset());
            this.elementMap = new WeakMap();
            const session = this.session;
            session.active.clear();
            session.data.clear();
            this.closed = false;
        }
        parseDocument(...elements) {
            const resource = this.resourceHandler;
            const [processing, rootElements, shadowElements, styleSheets] = this.createThread(elements, false);
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
                return (Promise.allSettled || allSettled).bind(Promise)(preloadItems.map(item => new Promise((success, error) => {
                    if (typeof item === 'string') {
                        fetch(item)
                            .then(async (result) => {
                            if (result.status >= 300) {
                                error(item + ` (${result.status}: ${result.statusText})`);
                            }
                            else {
                                const mimeType = result.headers.get('content-type') || '';
                                if (styleSheets && styleSheets.includes(item) || mimeType.indexOf('text/css') !== -1) {
                                    success({ mimeType: 'text/css', encoding: 'utf8', content: await result.text() });
                                }
                                else if (FILE$1.SVG.test(item) || mimeType.indexOf('image/svg+xml') !== -1) {
                                    success({ mimeType: 'image/svg+xml', encoding: 'utf8', content: await result.text() });
                                }
                                else {
                                    success({ mimeType: mimeType || 'font/' + (splitPair$1(item, '.', false, true)[1].toLowerCase() || 'ttf'), buffer: await result.arrayBuffer() });
                                }
                            }
                            return result;
                        })
                            .catch(err => error(err));
                    }
                    else {
                        item.addEventListener('load', () => success(item));
                        item.addEventListener('error', err => error(err));
                    }
                })))
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
                        if (errors.length === 1) {
                            this.writeError('FAIL: ' + errors[0]);
                        }
                        else {
                            this.writeError(getErrorMessage(errors), `FAIL: ${errors.length} errors`);
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
                if (isPlainObject(item)) {
                    if (item.element) {
                        settings = item;
                        item = item.element;
                    }
                    else if (i === 0) {
                        settings = item;
                        item = this.mainElement;
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
                        const items = item.querySelectorAll('*');
                        for (let j = 0, q = items.length; j < q; ++j) {
                            const shadowRoot = items[j].shadowRoot;
                            if (shadowRoot) {
                                shadowRoot.querySelectorAll('link[href][rel*="stylesheet" i]').forEach((child) => (styleSheets || (styleSheets = [])).push(child.href));
                                (shadowElements || (shadowElements = [])).push(shadowRoot);
                            }
                        }
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
                    const items = element.querySelectorAll('[style]');
                    const q = items.length;
                    if (q) {
                        for (let i = 0; i < q; ++i) {
                            const { backgroundImage, listStyleImage } = items[i].style;
                            if (backgroundImage) {
                                parseImageUrl(backgroundImage, location.href, resourceHandler, resourceId, false);
                            }
                            if (listStyleImage) {
                                parseImageUrl(listStyleImage, location.href, resourceHandler, resourceId, false);
                            }
                        }
                    }
                }
            }
            return [processing, rootElements, shadowElements ? [...rootElements, ...shadowElements] : rootElements, styleSheets];
        }
        resumeThread(processing, rootElements, requestCount) {
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
                const settings = processing.customSettings[i];
                processing.settings = settings;
                controllerHandler.processUserSettings(processing);
                if (settings && settings.beforeCascade) {
                    settings.beforeCascade(processing.sessionId);
                }
                if (length) {
                    const current = [];
                    const exclude = settings && settings.exclude;
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
                    if (settings) {
                        if (settings.data) {
                            this.session.data.set(sessionId, settings.data);
                        }
                        if (settings.afterCascade) {
                            settings.afterCascade(sessionId, node);
                        }
                    }
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
                        for (let j = 0, q = childNodes.length; j < q; ++j) {
                            const item = childNodes[j];
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
            for (let i = 0, length = namespaces.length, ext; i < length; ++i) {
                let namespace = namespaces[i];
                if (ext = builtInExtensions.get(namespace)) {
                    ext.application = this;
                    extensions.push(ext);
                }
                else {
                    namespace += '.';
                    for (const data of builtInExtensions) {
                        if (startsWith$1(data[0], namespace) && !extensions.includes(ext = data[1])) {
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
            const node = this.cascadeParentNode(processing, sessionId, resourceId, rootElement, 0, this.getUserSetting(processing, 'pierceShadowRoot'), extensions.length ? extensions : null);
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
                            child.internalSelf(parent, depth + 1, i, parent);
                            elements[i] = child;
                        }
                        parent.internalNodes(elements);
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
        cascadeParentNode(processing, sessionId, resourceId, parentElement, depth, pierceShadowRoot, extensions, shadowParent) {
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
                            (use ? Application$1.prioritizeExtensions(use, extensions) : extensions).some(item => item.beforeInsertNode(element, sessionId));
                        }
                        let shadowRoot;
                        if (pierceShadowRoot && (shadowRoot = element.shadowRoot)) {
                            this.setStyleMap(sessionId, resourceId, shadowRoot);
                        }
                        if (child = (shadowRoot || element).childNodes.length ? this.cascadeParentNode(processing, sessionId, resourceId, element, childDepth, pierceShadowRoot, extensions, shadowRoot || shadowParent) : this.insertNode(processing, element)) {
                            elements.push(child);
                            inlineText = false;
                        }
                    }
                    else if (child = this.insertNode(processing, element)) {
                        processing.excluded.add(child);
                    }
                    if (child) {
                        child.internalSelf(node, childDepth, j++, node);
                        if (shadowParent) {
                            child.shadowHost = shadowParent;
                        }
                        children.push(child);
                    }
                }
                node.internalNodes(children, elements, inlineText && plainText && j > 0, hostElement !== parentElement);
                if (j > 0) {
                    node.retainAs(children);
                    if (j > 1) {
                        processing.cache.addAll(children);
                    }
                    else {
                        processing.cache.add(children[0]);
                    }
                }
            }
            return node;
        }
        visibleText(node, element) {
            return element.nodeName === '#text' && (!isEmptyString(element.textContent) || node.preserveWhiteSpace && (node.tagName !== 'PRE' || node.element.childElementCount === 0));
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
                                    value = parseImageUrl(value, (_a = item.parentStyleSheet) === null || _a === void 0 ? void 0 : _a.href, resource, resourceId, false);
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
                    for (const selectorText of parseSelectorText(item.selectorText)) {
                        const specificity = getSpecificity(selectorText);
                        const [selector, target] = splitPair$1(selectorText, '::');
                        const targetElt = target ? '::' + target : '';
                        let elements;
                        if (startsWith$1(selector, ':host')) {
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
                                    const uri = resolvePath(rule.href, (_a = rule.parentStyleSheet) === null || _a === void 0 ? void 0 : _a.href);
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
                                            parseImageUrl(value, (_a = item.parentStyleSheet) === null || _a === void 0 ? void 0 : _a.href, resource, resourceId, false);
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
            const resourceHandler = this.resourceHandler;
            return resourceHandler ? resourceHandler.fileHandler : null;
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
                    for (const item of processing.extensions) {
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
    Application$1.KEY_NAME = 'squared.base.application';

    class Application extends Application$1 {
        constructor() {
            super(...arguments);
            this.systemName = 'vdom';
        }
        insertNode(processing, element) {
            if (element.nodeName[0] !== '#') {
                return new this.Node(this.nextId, processing.sessionId, element);
            }
        }
    }

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

    const { CSS_BORDER_SET, CSS_PROPERTIES, PROXY_INLINESTYLE, convertFontSize, getInitialValue } = squared.lib.internal;
    const { FILE } = squared.lib.regex;
    const { isUserAgent } = squared.lib.client;
    const { isTransparent } = squared.lib.color;
    const { asPercent, asPx, checkStyleValue, checkWritingMode, convertUnit, getRemSize, getStyle, isAngle, isLength, isPercent, isTime, parseUnit } = squared.lib.css;
    const { assignRect, getNamedItem, getParentElement, getRangeClientRect } = squared.lib.dom;
    const { clamp, truncate } = squared.lib.math;
    const { getElementCache, getElementData, setElementCache } = squared.lib.session;
    const { convertCamelCase, convertFloat, convertInt, convertPercent, endsWith, hasValue, isObject, iterateArray, iterateReverseArray, lastItemOf, safeFloat, splitPair, splitSome, startsWith } = squared.lib.util;
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
    const REGEXP_EM = /\dem$/;
    function setStyleCache(sessionId, style, element, attr, value) {
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
            n = asPercent(value);
        }
        return !isNaN(n) ? n * fontSize : parseUnit(value, { fontSize });
    }
    function isFixedFont(node) {
        const [fontFirst, fontSecond] = splitPair(node.css('fontFamily'), ',');
        return fontFirst === 'monospace' && fontSecond.trim() !== 'monospace';
    }
    function getCssFloat(node, attr, fallback) {
        const value = +node.css(attr);
        return !isNaN(value) ? value : fallback;
    }
    function hasTextAlign(node, ...values) {
        const value = node.cssAscend('textAlign', { startSelf: node.textElement && node.blockStatic && !node.hasUnit('width', { initial: true }) });
        return value !== '' && values.includes(value) && (node.blockStatic ? node.textElement && !node.hasUnit('width', { initial: true }) && !node.hasUnit('maxWidth', { initial: true }) : startsWith(node.display, 'inline'));
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
                        node.css(dimension, isPercent(size) ? size : size + 'px');
                    }
                    break;
                }
            }
        }
        if (baseValue && !node.imageElement) {
            const attr = dimension === 'width' ? 'maxWidth' : 'maxHeight';
            const max = style[attr];
            if (max) {
                if (!(max === value || max === 'auto')) {
                    const maxValue = node.parseUnit(max, { dimension, fallback: NaN });
                    if (!isNaN(maxValue)) {
                        if (maxValue <= baseValue && value && isLength(value)) {
                            style[dimension] = max;
                        }
                        else {
                            return Math.min(result, maxValue);
                        }
                    }
                }
                delete style[attr];
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
                result = isLength(width, true) ? node.parseUnit(width, { dimension }) : safeFloat(node.style[border[1]]);
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
                                const [horizontal, vertical] = splitPair(parent.css('borderSpacing'), ' ');
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
    function recurseNaturalElements(result, items, children) {
        for (let i = 0, length = children.length; i < length; ++i) {
            const node = children[i];
            if (items.includes(node.element) && result.push(node) === items.length) {
                return true;
            }
            const next = node.naturalElements;
            if (next.length && recurseNaturalElements(result, items, next)) {
                return true;
            }
        }
    }
    function getMinMax(node, min, attr, options) {
        let self, last, wrapperOf, subAttr, initial, initialValue;
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
    const aboveRange = (a, b, offset = 1) => a + offset >= b;
    const belowRange = (a, b, offset = 1) => a - offset <= b;
    const sortById = (a, b) => a.id - b.id;
    const isInlineVertical = (value) => startsWith(value, 'inline') || value === 'table-cell';
    const canTextAlign = (node) => node.naturalChild && (node.isEmpty() || isInlineVertical(node.display) && node.percentWidth < 1) && !node.floating && node.autoMargin.horizontal !== true;
    const newBoxRectDimension = () => ({ top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 });
    class Node extends squared.lib.base.Container {
        constructor(id, sessionId = '0', element, children) {
            super(children);
            this.id = id;
            this.sessionId = sessionId;
            this.documentRoot = false;
            this.shadowHost = null;
            this.pseudoElt = '';
            this._parent = null;
            this._depth = -1;
            this._cache = {};
            this._cacheState = {};
            this._preferInitial = false;
            this._inlineText = false;
            this._shadowRoot = false;
            this._bounds = null;
            this._box = null;
            this._linear = null;
            this._initial = null;
            this._styleMap = {};
            this._naturalChildren = null;
            this._naturalElements = null;
            this._actualParent = null;
            this._childIndex = Infinity;
            this._elementData = null;
            this._style = null;
            this._data = null;
            this._element = element || null;
            if (element && sessionId !== '0') {
                this.syncWith(sessionId);
                setElementCache(element, 'node', this, sessionId);
            }
        }
        static sanitizeCss(element, input, writingMode, output = {}) {
            for (let attr in input) {
                const alias = checkWritingMode(attr, writingMode);
                let value = input[attr];
                if (alias !== attr) {
                    if (typeof alias === 'string') {
                        if (!input[alias]) {
                            attr = alias;
                        }
                        else {
                            continue;
                        }
                    }
                    else {
                        let actual;
                        for (const alt of alias) {
                            if (!input[alt]) {
                                if (actual || (actual = checkStyleValue(element, alt, value))) {
                                    output[alt] = actual;
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
                    output[attr] = value;
                }
            }
            return output;
        }
        internalSelf(parent, depth, childIndex, actualParent) {
            this._parent = parent;
            this._depth = depth;
            if (childIndex !== undefined) {
                this._childIndex = childIndex;
            }
            if (actualParent !== undefined) {
                this._actualParent = actualParent;
            }
        }
        internalNodes(children, elements, inlineText, shadowRoot) {
            this._naturalChildren = children;
            this._naturalElements = elements || children.filter((item) => item.naturalElement);
            if (inlineText !== undefined) {
                this._inlineText = inlineText;
            }
            if (shadowRoot !== undefined) {
                this._shadowRoot = shadowRoot;
            }
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
                            else if (elementData.pseudoElt) {
                                this.pseudoElt = elementData.pseudoElt;
                            }
                            Node.sanitizeCss(element, styleMap, styleMap.writingMode, this._styleMap);
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
            }
            else {
                if (value !== undefined) {
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
        }
        elementAttr(attr, value) {
            if (this.naturalElement) {
                const element = this._element;
                if (attr in element && typeof value === typeof element[attr]) {
                    element[attr] = value;
                    return element[attr];
                }
            }
        }
        unsetCache(...attrs) {
            const length = attrs.length;
            if (length) {
                const cache = this._cache;
                const resetWidth = () => {
                    cache.actualHeight = undefined;
                    cache.contentBoxWidth = undefined;
                };
                const resetHeight = () => {
                    cache.actualHeight = undefined;
                    cache.contentBoxHeight = undefined;
                };
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
                                this.cascade(item => item.unsetCache('height', 'bottomAligned', 'containerHeight'));
                            }
                            break;
                        case 'actualWidth':
                        case 'contentBoxWidth':
                            resetWidth();
                            break;
                        case 'actualHeight':
                        case 'contentBoxHeight':
                            resetHeight();
                            continue;
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
                            resetWidth();
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
                            resetHeight();
                            break;
                        case 'whiteSpace':
                            cache.preserveWhiteSpace = undefined;
                            cache.textStyle = undefined;
                            this._cacheState.textEmpty = undefined;
                            this._cacheState.textBounds = undefined;
                            continue;
                        default:
                            if (startsWith(attr, 'background')) {
                                cache.visibleStyle = undefined;
                            }
                            else if (startsWith(attr, 'border')) {
                                if (startsWith(attr, 'borderTop')) {
                                    cache.borderTopWidth = undefined;
                                    resetHeight();
                                }
                                else if (startsWith(attr, 'borderRight')) {
                                    cache.borderRightWidth = undefined;
                                    resetWidth();
                                }
                                else if (startsWith(attr, 'borderBottom')) {
                                    cache.borderBottomWidth = undefined;
                                    resetHeight();
                                }
                                else {
                                    cache.borderLeftWidth = undefined;
                                    resetWidth();
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
                parent.querySelectorAll('*').forEach(item => item.resetBounds());
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
                            case 'dir':
                            case 'absoluteParent':
                                reset = true;
                                break;
                            case 'textContent':
                                cacheState.textEmpty = undefined;
                                cacheState.textBounds = undefined;
                                reset = true;
                                break;
                        }
                        cacheState[attr] = undefined;
                    }
                }
            }
            else {
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
            }
            else if (attr !== 'parent' && !endsWith(attr, 'Parent')) {
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
            if (this.styleElement && attr in style && typeof value === 'string') {
                if (value) {
                    const current = style[attr];
                    style[attr] = value;
                    if (current !== style[attr]) {
                        this._styleMap[attr] = value;
                        if (cache) {
                            this.unsetCache(attr);
                        }
                        return value;
                    }
                    return current;
                }
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
                if (ascending !== false) {
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
                if (setStyleCache(this.sessionId, !this.pseudoElement ? this.style : getStyle(element), element, attr, value)) {
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
                    switch (setStyleCache(sessionId, style, element, attr, value)) {
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
                    return ((type & 1 /* LENGTH */) > 0 && isLength(value) ||
                        (type & 2 /* PERCENT */) > 0 && isPercent(value) ||
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
            if (!isNaN(n = asPercent(value))) {
                return n * this.getContainerSize(options);
            }
            if (!options) {
                options = { fontSize: this.fontSize };
            }
            else {
                (_a = options.fontSize) !== null && _a !== void 0 ? _a : (options.fontSize = this.fontSize);
            }
            return parseUnit(value, options);
        }
        convertUnit(value, unit = 'px', options) {
            let result = this.parseUnit(value, options);
            if (unit === '%' || unit === 'percent') {
                result *= 100 / this.getContainerSize(options);
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
        getContainerSize(options) {
            var _a;
            const bounds = (!options || options.parent !== false) && (this.positionFixed ? { width: window.innerWidth, height: window.innerHeight } : (_a = this.absoluteParent) === null || _a === void 0 ? void 0 : _a.box) || this.bounds;
            return bounds[options && options.dimension || 'width'];
        }
        min(attr, options) {
            return getMinMax(this, true, attr, options);
        }
        max(attr, options) {
            return getMinMax(this, false, attr, options);
        }
        querySelector(value) {
            if (this.naturalElement) {
                const element = this._element.querySelector(value);
                if (element) {
                    const result = [];
                    if (recurseNaturalElements(result, [element], this.naturalElements)) {
                        return result[0];
                    }
                }
            }
            return null;
        }
        querySelectorAll(value, queryMap, queryRoot) {
            if (!queryRoot) {
                if (!this.naturalElement) {
                    return [];
                }
                queryRoot = this._element;
            }
            const result = [];
            try {
                const items = Array.from(queryRoot.querySelectorAll(value));
                const itemCount = items.length;
                if (itemCount) {
                    if (queryMap) {
                        for (let i = 0, length = queryMap.length; i < length; ++i) {
                            const node = queryMap[i];
                            if (items.includes(node.element) && result.push(node) === itemCount) {
                                break;
                            }
                        }
                    }
                    else {
                        recurseNaturalElements(result, items, this.naturalElements);
                    }
                }
            }
            catch (_a) {
            }
            return result;
        }
        ancestors(value, options) {
            const result = this.ascend(options);
            return value && result.length ? this.querySelectorAll(value, result, document.documentElement) : result.sort(sortById);
        }
        descendants(value, options) {
            if (this.naturalElements.length) {
                if (options) {
                    const children = this.descend(options);
                    return value && children.length ? this.querySelectorAll(value, children) : children.filter(item => item.naturalElement).sort(sortById);
                }
                return this.querySelectorAll(value || '*');
            }
            return [];
        }
        siblings(value, options) {
            const parent = this.actualParent;
            if (!parent) {
                return [];
            }
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
                iterateReverseArray(parent.naturalElements, filterPredicate, 0, this.childIndex);
            }
            else {
                iterateArray(parent.naturalElements, filterPredicate, this.childIndex + 1);
            }
            if (value) {
                result = parent.querySelectorAll(value, result);
                if (reverse && result.length > 1) {
                    result.reverse();
                }
            }
            return result;
        }
        valueOf(attr, options) {
            return this._preferInitial ? this.cssInitial(attr, options) : this._styleMap[attr] || options && options.computed && this.style[attr] || '';
        }
        get naturalChild() { return true; }
        get pseudoElement() { return false; }
        get parent() {
            return this._parent;
        }
        get shadowRoot() {
            return this._shadowRoot;
        }
        get tagName() {
            const result = this._cache.tagName;
            if (result === undefined) {
                const element = this._element;
                return this._cache.tagName = element ? element.nodeName : '';
            }
            return result;
        }
        get element() {
            return this._element;
        }
        get elementId() {
            const element = this._element;
            return element ? element.id : '';
        }
        get htmlElement() {
            const result = this._cacheState.htmlElement;
            return result === undefined ? this._cacheState.htmlElement = this._element instanceof HTMLElement : result;
        }
        get svgElement() {
            const result = this._cacheState.svgElement;
            return result === undefined ? this._cacheState.svgElement = !this.htmlElement && this._element instanceof SVGElement || this.imageElement && FILE.SVG.test(this._element.src) : result;
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
            return this._element && getParentElement(this._element) || ((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.element) || null;
        }
        get textElement() {
            return this.plainText || this.inlineText && this.tagName !== 'BUTTON';
        }
        get imageElement() {
            return this.tagName === 'IMG';
        }
        get flexElement() {
            return endsWith(this.display, 'flex');
        }
        get gridElement() {
            return endsWith(this.display, 'grid');
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
        get positionFixed() {
            return this.valueOf('position') === 'fixed';
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
            const value = this.valueOf('opacity');
            return value ? clamp(+value) : 1;
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
                const bounds = this._bounds || this.setBounds(false);
                if (bounds) {
                    if (this.styleElement) {
                        let { marginTop, marginBottom, marginRight, marginLeft } = this; // eslint-disable-line prefer-const
                        if (marginTop < 0) {
                            marginTop = 0;
                        }
                        if (marginLeft < 0) {
                            marginLeft = 0;
                        }
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
                const bounds = this._bounds || this.setBounds(false);
                if (bounds) {
                    if (this.styleElement && this.naturalChildren.length) {
                        let { marginTop, marginLeft } = this;
                        if (marginTop > 0) {
                            marginTop = 0;
                        }
                        if (marginLeft > 0) {
                            marginLeft = 0;
                        }
                        return this._box = {
                            top: bounds.top + (this.paddingTop + this.borderTopWidth),
                            right: bounds.right - (this.paddingRight + this.borderRightWidth),
                            bottom: bounds.bottom - (this.paddingBottom + this.borderBottomWidth),
                            left: bounds.left + (this.paddingLeft + this.borderLeftWidth),
                            width: bounds.width + marginLeft - this.contentBoxWidth,
                            height: bounds.height + marginTop - this.contentBoxHeight
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
                    const row = startsWith(flexDirection, 'row');
                    result = {
                        row,
                        column: !row,
                        reverse: endsWith(flexDirection, 'reverse'),
                        wrap: startsWith(flexWrap, 'wrap'),
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
            return result === undefined ? this._cache.hasHeight = isPercent(this.valueOf('height')) ? this.pageFlow ? ((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.hasHeight) || this.documentBody : this.positionFixed || this.hasUnit('top') || this.hasUnit('bottom') : this.height > 0 || this.hasUnit('height', { percent: false }) : result;
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
        get inlineText() {
            return this._inlineText;
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
                            else if (this.inline || startsWith(this.display, 'table-') || this.hasUnit('maxWidth')) {
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
                    if (!isNaN(n = asPercent(width))) {
                        percent = n;
                    }
                    if (!isNaN(n = asPercent(minWidth))) {
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
            var _a;
            let result = this._cache.autoMargin;
            if (result === undefined) {
                if (this.blockStatic || ((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.flexElement) || !this.pageFlow || this.display === 'table') {
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
                if ((startsWith(display, 'inline') || display === 'list-item') && this.pageFlow && !this.floating && !this.tableElement) {
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
            var _a;
            let result = this._cache.verticalAlign;
            if (result === undefined) {
                const value = this.css('verticalAlign');
                if (value !== 'baseline' && this.pageFlow && (((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.flexElement) !== true) && isNaN(result = asPx(value))) {
                    if (isLength(value)) {
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
                    else if (result === 'currentcolor') {
                        result = this.style.backgroundColor;
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
        get containerHeight() {
            var _a;
            let result = this._cache.containerHeight;
            if (result === undefined) {
                if (this.pageFlow) {
                    result = ((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.hasHeight) === true;
                }
                else if (this.positionFixed) {
                    result = true;
                }
                else {
                    const parent = this.absoluteParent;
                    result = !!parent && (parent.hasHeight || parent.naturalChildren.some(item => item.pageFlow && item.bounds.height > 0));
                }
                this._cache.containerHeight = result;
            }
            return result;
        }
        get percentWidth() {
            const result = this._cache.percentWidth;
            if (result === undefined) {
                let value = asPercent(this.valueOf('width'));
                if (value > 0) {
                    const min = asPercent(this.valueOf('minWidth'));
                    const max = asPercent(this.valueOf('maxWidth'));
                    if (!isNaN(min)) {
                        value = Math.max(value, min);
                    }
                    if (!isNaN(max)) {
                        value = Math.min(value, max);
                    }
                }
                else {
                    value = 0;
                }
                return this._cache.percentWidth = value;
            }
            return result;
        }
        get percentHeight() {
            const result = this._cache.percentHeight;
            if (result === undefined) {
                let value = asPercent(this.valueOf('height'));
                if (value > 0 && this.containerHeight) {
                    const min = asPercent(this.valueOf('minHeight'));
                    const max = asPercent(this.valueOf('maxHeight'));
                    if (!isNaN(min)) {
                        value = Math.max(value, min);
                    }
                    if (!isNaN(max)) {
                        value = Math.min(value, max);
                    }
                }
                else {
                    value = 0;
                }
                return this._cache.percentHeight = value;
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
                    const background = backgroundColor || borderWidth || backgroundImage;
                    const borderRadius = (background || this.imageElement || this.svgElement) && this.css('borderRadius') !== '0px';
                    let backgroundRepeatX = false, backgroundRepeatY = false;
                    if (backgroundImage) {
                        splitSome(this.css('backgroundRepeat'), value => {
                            const [repeatX, repeatY] = splitPair(value, ' ');
                            if (repeatX === 'repeat') {
                                backgroundRepeatX = true;
                                backgroundRepeatY = true;
                                return true;
                            }
                            if (repeatX === 'repeat-x') {
                                backgroundRepeatX = true;
                            }
                            if (repeatX === 'repeat-y' || repeatY === 'repeat') {
                                backgroundRepeatY = true;
                            }
                        });
                    }
                    result = {
                        background: background || borderRadius,
                        borderWidth,
                        borderRadius,
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
        get actualParent() {
            return this._actualParent;
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
                    if (!(this.inlineStatic && !this.valueOf('width') || this.display === 'table-cell' || this.bounds.width && (parent = this.actualParent) && parent.flexElement && parent.flexdata.row) && (result = this.width) && this.contentBox && !this.tableElement) {
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
                if (!(this.inlineStatic && !this.valueOf('height') || this.display === 'table-cell' || this.bounds.height && (parent = this.actualParent) && parent.flexElement && parent.flexdata.column) && (result = this.height) && this.contentBox && !this.tableElement) {
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
            if (this.naturalElement) {
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
                        const fixed = isFixedFont(this);
                        let value = convertFontSize(this.valueOf('fontSize'), fixed);
                        if (isNaN(result = asPx(value)) && !isNaN(result = asPercent(value))) {
                            const parent = this.actualParent;
                            if (parent) {
                                result *= parent.fontSize;
                                if (fixed && !isFixedFont(parent)) {
                                    result *= 13 / getRemSize();
                                }
                            }
                            else {
                                result = getRemSize(fixed);
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
                                                const n = asPercent(value = convertFontSize(fontSize));
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
                            result = (endsWith(value, 'rem') ? safeFloat(value, 3) * getRemSize(fixed) : parseUnit(value, { fixedWidth: fixed })) * emRatio;
                        }
                    }
                    else {
                        result = this.actualParent.fontSize;
                    }
                }
                else {
                    const options = { fixedWidth: isFixedFont(this) };
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

    const settings = {
        builtInExtensions: [],
        createElementMap: true,
        pierceShadowRoot: false,
        showErrorMessages: false
    };

    let application = null;
    const appBase = {
        create() {
            application = new Application(1 /* VDOM */, Node, Controller);
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
