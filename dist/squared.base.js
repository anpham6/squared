/* squared.base 2.5.9
   https://github.com/anpham6/squared */

this.squared = this.squared || {};
this.squared.base = (function (exports) {
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
    const { FILE: FILE$3, STRING: STRING$2 } = squared.lib.regex;
    const { isUserAgent: isUserAgent$3 } = squared.lib.client;
    const { CSS_PROPERTIES: CSS_PROPERTIES$4, getSpecificity, insertStyleSheetRule: insertStyleSheetRule$1, getPropertiesAsTraits, parseKeyframes, parseSelectorText: parseSelectorText$1 } = squared.lib.css;
    const { getElementCache: getElementCache$3, newSessionInit, setElementCache: setElementCache$3 } = squared.lib.session;
    const { allSettled, capitalize: capitalize$2, convertCamelCase: convertCamelCase$2, escapePattern: escapePattern$3, isBase64: isBase64$1, isEmptyString: isEmptyString$1, resolvePath: resolvePath$1, splitPair: splitPair$4, startsWith: startsWith$9 } = squared.lib.util;
    const REGEXP_IMPORTANT = /\s?([a-z-]+):[^!;]+!important;/g;
    const REGEXP_DATAURI$1 = new RegExp(`\\s?url\\("(${STRING$2.DATAURI})"\\)`, 'g');
    const REGEXP_CSSHOST = /^:(host|host-context)\(\s*([^)]+)\s*\)/;
    const CSS_SHORTHANDNONE = getPropertiesAsTraits(2 /* SHORTHAND */ | 64 /* NONE */);
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
                    resource.addRawData(resourceId, match[1], { mimeType: leading && leading.includes('/') ? leading : 'image/unknown', encoding, content, base64 });
                }
            }
            else {
                const url = resolvePath$1(match[5], styleSheetHref);
                if (url) {
                    if (resource) {
                        resource.addImageData(resourceId, url);
                    }
                    result = (result || value).replace(match[0], `url("${url}")`);
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
            this.closed = false;
            this.elementMap = null;
            this.session = { active: new Map() };
            this._nextId = 0;
            this._resourceHandler = null;
            this._extensionManager = null;
            this.Node = nodeConstructor;
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
        init() { }
        finalize() { return true; }
        createNode(sessionId, options) {
            return this.createNodeStatic(this.getProcessing(sessionId), options.element);
        }
        createNodeStatic(processing, element) {
            const node = new this.Node(this.nextId, processing.sessionId, element);
            this._afterInsertNode(node);
            if (processing.afterInsertNode) {
                processing.afterInsertNode.some(item => item.afterInsertNode(node));
            }
            return node;
        }
        afterCreateCache(processing, node) {
            if (this.userSettings.createElementMap) {
                const elementMap = this.elementMap || (this.elementMap = new WeakMap());
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
            for (const ext of this.extensions) {
                ext.reset();
            }
            this.closed = false;
        }
        parseDocument(...elements) {
            const resource = this.resourceHandler;
            const [processing, rootElements, shadowElements, styleSheets] = this.createSessionThread(elements, this.userSettings.pierceShadowRoot && resource ? resource.userSettings.preloadCustomElements : false);
            if (rootElements.length === 0) {
                return reject(DOCUMENT_ROOT_NOT_FOUND);
            }
            const resourceId = processing.resourceId;
            const documentRoot = rootElements[0];
            const [preloadItems, preloaded] = resource ? resource.preloadAssets(resourceId, documentRoot, shadowElements) : [[], []];
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
                                    if (startsWith$9(mimeType, 'text/css') || styleSheets && styleSheets.includes(item)) {
                                        success({ mimeType: 'text/css', encoding: 'utf8', content: await result.text() });
                                    }
                                    else if (startsWith$9(mimeType, 'image/svg+xml') || FILE$3.SVG.test(item)) {
                                        success({ mimeType: 'image/svg+xml', encoding: 'utf8', content: await result.text() });
                                    }
                                    else {
                                        success({ mimeType: result.headers.get('content-type') || 'font/' + (splitPair$4(item, '.', false, true)[1].toLowerCase() || 'ttf'), buffer: await result.arrayBuffer() });
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
                            resource.addImage(resourceId, data);
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
                    return this.resumeSessionThread(processing, rootElements, elements.length, documentRoot, preloaded);
                });
            }
            return Promise.resolve(this.resumeSessionThread(processing, rootElements, elements.length));
        }
        parseDocumentSync(...elements) {
            const sessionData = this.createSessionThread(elements, false);
            return this.resumeSessionThread(sessionData[0], sessionData[1], elements.length);
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
                        if (startsWith$9(data[0], namespace) && !extensions.includes(ext = data[1])) {
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
        getDatasetName(attr, element) {
            return element.dataset[attr + capitalize$2(this.systemName)] || element.dataset[attr];
        }
        setDatasetName(attr, element, value) {
            element.dataset[attr + capitalize$2(this.systemName)] = value;
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
            const node = this.cascadeParentNode(processing, sessionId, resourceId, rootElement, 0, extensions.length ? extensions : null);
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
        cascadeParentNode(processing, sessionId, resourceId, parentElement, depth, extensions, shadowParent) {
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
                const pierceShadowRoot = this.userSettings.pierceShadowRoot;
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
                        if (child = (shadowRoot || element).childNodes.length ? this.cascadeParentNode(processing, sessionId, resourceId, element, childDepth, extensions, shadowRoot || shadowParent) : this.insertNode(processing, element)) {
                            elements.push(child);
                            inlineText = false;
                        }
                    }
                    else if (child = this.insertNode(processing, element)) {
                        processing.excluded.add(child);
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
                        processing.cache.addAll(children);
                    }
                    else {
                        processing.cache.add(children[0]);
                    }
                }
                if (elements.length && this.userSettings.createQuerySelectorMap) {
                    node.queryMap = this.createQueryMap(elements);
                }
            }
            return node;
        }
        visibleText(node, element) {
            return element.nodeName === '#text' && (!isEmptyString$1(element.textContent) || node.preserveWhiteSpace && (node.tagName !== 'PRE' || node.element.childElementCount === 0));
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
            var _a, _b, _c, _d, _e;
            var _f;
            const resource = this.resourceHandler;
            const cssText = item.cssText;
            switch (item.type) {
                case CSSRule.STYLE_RULE: {
                    const hostElement = documentRoot.host;
                    const baseMap = {};
                    const cssStyle = item.style;
                    const hasExactValue = (attr, value) => new RegExp(`[^-]${attr}\\s*:\\s*${value}\\s*;?`).test(cssText);
                    const hasPartialValue = (attr, value) => new RegExp(`[^-]${attr}\\s*:[^;]*?${value}[^;]*;?`).test(cssText);
                    for (let i = 0, length = cssStyle.length; i < length; ++i) {
                        const attr = cssStyle[i];
                        const baseAttr = convertCamelCase$2(attr);
                        let value = cssStyle[attr];
                        if (value) {
                            switch (value) {
                                case 'initial':
                                    if (isUserAgent$3(2 /* SAFARI */) && startsWith$9(baseAttr, 'background')) {
                                        break;
                                    }
                                    if (((_a = CSS_PROPERTIES$4[baseAttr]) === null || _a === void 0 ? void 0 : _a.value) === 'auto') {
                                        value = 'auto';
                                        break;
                                    }
                                case 'normal':
                                    if (!hasExactValue(attr, value)) {
                                        required: {
                                            for (const name in CSS_SHORTHANDNONE) {
                                                const css = CSS_SHORTHANDNONE[name];
                                                if (css.value.includes(baseAttr)) {
                                                    if (hasExactValue(css.name, 'none')) {
                                                        const valueOfNone = (_b = CSS_PROPERTIES$4[baseAttr]) === null || _b === void 0 ? void 0 : _b.valueOfNone;
                                                        if (valueOfNone) {
                                                            value = valueOfNone;
                                                        }
                                                        break required;
                                                    }
                                                    if (hasExactValue(css.name, 'initial') || value === 'initial' && hasPartialValue(css.name, 'initial') || css.valueOfNone && hasExactValue(css.name, escapePattern$3(css.valueOfNone))) {
                                                        break required;
                                                    }
                                                    break;
                                                }
                                            }
                                            continue;
                                        }
                                    }
                                    break;
                                default:
                                    switch (baseAttr) {
                                        case 'backgroundImage':
                                        case 'listStyleImage':
                                        case 'content':
                                            value = parseImageUrl(value, (_c = item.parentStyleSheet) === null || _c === void 0 ? void 0 : _c.href, resource, resourceId);
                                            break;
                                    }
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
                    let important;
                    if (cssText.includes('!')) {
                        important = {};
                        let match;
                        while (match = REGEXP_IMPORTANT.exec(cssText)) {
                            const attr = convertCamelCase$2(match[1]);
                            const value = (_d = CSS_PROPERTIES$4[attr]) === null || _d === void 0 ? void 0 : _d.value;
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
                    }
                    let processing;
                    for (const selectorText of parseSelectorText$1(item.selectorText)) {
                        const specificity = getSpecificity(selectorText);
                        const [selector, target] = splitPair$4(selectorText, '::');
                        const targetElt = target ? '::' + target : '';
                        let elements;
                        if (startsWith$9(selector, ':host')) {
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
                            if (resource && this.session.unusedStyles && !hostElement) {
                                ((_f = (processing || (processing = this.getProcessing(sessionId)))).unusedStyles || (_f.unusedStyles = new Set())).add(selectorText);
                            }
                            continue;
                        }
                        const attrStyle = 'styleMap' + targetElt;
                        const attrSpecificity = 'styleSpecificity' + targetElt;
                        for (let i = 0; i < length; ++i) {
                            const element = elements[i];
                            const styleData = getElementCache$3(element, attrStyle, sessionId);
                            if (styleData) {
                                const specificityData = getElementCache$3(element, attrSpecificity, sessionId);
                                for (const attr in baseMap) {
                                    const previous = specificityData[attr];
                                    const revised = specificity + (important && important[attr] ? 2000 : 0);
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
                                    specificityData[attr] = specificity + (important && important[attr] ? 2000 : 0);
                                }
                                setElementCache$3(element, 'sessionId', sessionId);
                                setElementCache$3(element, attrStyle, styleMap, sessionId);
                                setElementCache$3(element, attrSpecificity, specificityData, sessionId);
                            }
                        }
                    }
                    break;
                }
                case CSSRule.FONT_FACE_RULE:
                    if (resource) {
                        resource.parseFontFace(resourceId, cssText, (_e = item.parentStyleSheet) === null || _e === void 0 ? void 0 : _e.href);
                    }
                    break;
                case CSSRule.SUPPORTS_RULE:
                    this.applyCssRules(sessionId, resourceId, item.cssRules, documentRoot);
                    break;
            }
        }
        applyStyleSheet(sessionId, resourceId, item, documentRoot, queryRoot) {
            var _a, _b;
            var _c;
            try {
                const cssRules = item.cssRules;
                if (cssRules) {
                    const parseConditionText = (rule, value) => { var _a; return ((_a = new RegExp(`@${rule}([^{]+)`).exec(value)) === null || _a === void 0 ? void 0 : _a[1].trim()) || value; };
                    for (let i = 0, length = cssRules.length; i < length; ++i) {
                        const rule = cssRules[i];
                        const type = rule.type;
                        switch (type) {
                            case CSSRule.STYLE_RULE:
                            case CSSRule.FONT_FACE_RULE:
                                this.applyStyleRule(sessionId, resourceId, rule, documentRoot, queryRoot);
                                break;
                            case CSSRule.IMPORT_RULE: {
                                const uri = resolvePath$1(rule.href, (_a = rule.parentStyleSheet) === null || _a === void 0 ? void 0 : _a.href);
                                if (uri) {
                                    (_b = this.resourceHandler) === null || _b === void 0 ? void 0 : _b.addRawData(resourceId, uri, { mimeType: 'text/css', encoding: 'utf8' });
                                }
                                this.applyStyleSheet(sessionId, resourceId, rule.styleSheet, documentRoot, queryRoot);
                                break;
                            }
                            case CSSRule.MEDIA_RULE:
                                if (window.matchMedia(rule.conditionText || parseConditionText('media', rule.cssText)).matches) {
                                    this.applyCssRules(sessionId, resourceId, rule.cssRules, documentRoot, queryRoot);
                                }
                                else {
                                    this.parseStyleRules(sessionId, resourceId, rule.cssRules);
                                }
                                break;
                            case CSSRule.SUPPORTS_RULE:
                                if (CSS.supports(rule.conditionText || parseConditionText('supports', rule.cssText))) {
                                    this.applyCssRules(sessionId, resourceId, rule.cssRules, documentRoot, queryRoot);
                                }
                                else {
                                    this.parseStyleRules(sessionId, resourceId, rule.cssRules);
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
        createSessionThread(elements, pierceShadowRoot) {
            const rootElements = [];
            const length = elements.length;
            if (length === 0) {
                rootElements.push(this.mainElement);
            }
            else {
                for (let i = 0; i < length; ++i) {
                    let element = elements[i];
                    if (typeof element === 'string') {
                        element = document.getElementById(element);
                    }
                    if (element && !rootElements.includes(element)) {
                        rootElements.push(element);
                    }
                }
                if (rootElements.length === 0) {
                    return [rootElements];
                }
            }
            const { controllerHandler, resourceHandler, resourceId, extensionsAll: extensions } = this;
            const sessionId = controllerHandler.generateSessionId;
            const processing = {
                sessionId,
                resourceId,
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
            if (resourceHandler) {
                resourceHandler.init(resourceId);
            }
            controllerHandler.init(resourceId);
            const queryRoot = rootElements.length === 1 && rootElements[0].parentElement;
            if (queryRoot && queryRoot !== document.documentElement) {
                this.setStyleMap(sessionId, resourceId, document, queryRoot);
            }
            else {
                this.setStyleMap(sessionId, resourceId);
            }
            let shadowElements, styleSheets;
            if (pierceShadowRoot) {
                for (const element of rootElements) {
                    element.querySelectorAll('*').forEach(child => {
                        const shadowRoot = child.shadowRoot;
                        if (shadowRoot) {
                            (shadowElements || (shadowElements = [])).push(shadowRoot);
                        }
                    });
                }
                if (shadowElements) {
                    for (const element of shadowElements) {
                        element.querySelectorAll('link[href][rel*="stylesheet" i]').forEach((child) => (styleSheets || (styleSheets = [])).push(child.href));
                    }
                }
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
        resumeSessionThread(processing, rootElements, multipleRequest, documentRoot, preloaded) {
            processing.initializing = false;
            const { sessionId, extensions } = processing;
            const styleElement = insertStyleSheetRule$1('html > body { overflow: hidden !important; }');
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
                const node = this.createCache(processing, element);
                if (node) {
                    this.afterCreateCache(processing, node);
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
            const extensions = [];
            const children = [];
            for (const processing of active.values()) {
                extensions.push(...processing.extensions);
                children.push(...processing.cache.children);
            }
            return [Array.from(new Set(extensions)), children];
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
        init(resourceId) { }
        sortInitialCache(cache) { }
        applyDefaultStyles(processing, element, pseudoElt) { }
        reset() { }
        includeElement(element) { return true; }
        preventNodeCascade(node) { return false; }
        get generateSessionId() {
            return padStart((++this._sessionId).toString(), 5, '0');
        }
        get afterInsertNode() {
            return (node) => { };
        }
        get userSettings() {
            return this.application.userSettings;
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
                const dependencies = options.dependencies;
                if (dependencies) {
                    for (const item of dependencies) {
                        this.dependencies.push(item);
                    }
                    delete options.dependencies;
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

    const { findSet, isObject: isObject$1 } = squared.lib.util;
    class ExtensionManager {
        constructor(application) {
            this.application = application;
            this.cache = new Set();
        }
        add(ext) {
            if (typeof ext === 'string') {
                const item = this.get(ext, true);
                if (!item) {
                    return false;
                }
                ext = item;
            }
            const { application, extensions } = this;
            if (ext.framework === 0 || ext.framework & application.framework) {
                ext.application = application;
                if (!extensions.includes(ext)) {
                    extensions.push(ext);
                }
                return true;
            }
            return false;
        }
        remove(ext) {
            if (typeof ext === 'string') {
                ext = this.get(ext, true);
                if (!ext) {
                    return false;
                }
            }
            const name = ext.name;
            const index = this.extensions.findIndex(item => item.name === name);
            if (index !== -1) {
                this.extensions.splice(index, 1);
                return true;
            }
            return false;
        }
        get(name, builtIn) {
            return this.extensions.find(item => item.name === name) || findSet(this.cache, item => item.name === name) || (builtIn ? this.application.builtInExtensions.get(name) : undefined);
        }
        checkDependencies() {
            const extensions = this.extensions;
            let result;
            for (let i = 0; i < extensions.length; ++i) {
                const dependencies = extensions[i].dependencies;
                const q = dependencies.length;
                if (q === 0) {
                    continue;
                }
                for (let j = 0, k = 1; j < q; ++j) {
                    const dependency = dependencies[j];
                    const name = dependency.name;
                    const index = extensions.findIndex(item => item.name === name);
                    if (index === -1) {
                        const ext = this.application.builtInExtensions.get(name);
                        if (ext) {
                            ext.application = this.application;
                            if (dependency.leading) {
                                extensions.splice(i - 1, 0, ext);
                            }
                            else if (dependency.trailing) {
                                extensions.splice(i + k++, 0, ext);
                            }
                            else {
                                extensions.push(ext);
                            }
                            continue;
                        }
                    }
                    if (index !== -1) {
                        if (dependency.leading) {
                            if (index > i) {
                                extensions.splice(i - 1, 0, extensions.splice(index, 1)[0]);
                            }
                        }
                        else if (dependency.trailing) {
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
            return isObject$1(options) ? options[attr] : fallback;
        }
        valueAsObject(name, attr, fallback = null) {
            const value = this.valueOf(name, attr);
            return isObject$1(value) ? value : fallback;
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

    const { DOM } = squared.lib.regex;
    const { endsWith: endsWith$3, splitPair: splitPair$3, splitPairEnd: splitPairEnd$1, splitPairStart: splitPairStart$1, startsWith: startsWith$8 } = squared.lib.util;
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
    const HEX_STRING = '0123456789abcdef';
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
    function fromMimeType(value) {
        const [type, name] = value.split('/');
        switch (type) {
            case 'image':
                switch (name) {
                    case 'apng':
                    case 'avif':
                    case 'bmp':
                    case 'heic':
                    case 'heif':
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
                    case 'gif':
                    case 'gsm':
                    case 'ogg':
                    case 'wav':
                    case 'webm':
                        return name;
                    case 'midi':
                        return 'mid';
                    case 'mpeg':
                        return 'mp3';
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
    function appendSeparator(preceding = '', value = '', separator = '/') {
        preceding = preceding.trim();
        value = value.trim();
        switch (separator) {
            case '\\':
                preceding && (preceding = preceding.replace(/\/+/g, '\\'));
                value && (value = value.replace(/\/+/g, '\\'));
                break;
            case '/':
                preceding && (preceding = preceding.replace(/\\+/g, '/'));
                value && (value = value.replace(/\\+/g, '/'));
                break;
        }
        return preceding + (preceding && value && !endsWith$3(preceding, separator) && !startsWith$8(value, separator) ? separator : '') + value;
    }
    function randomUUID(separator = '-') {
        return [8, 4, 4, 4, 12].reduce((a, b, index) => {
            if (index > 0) {
                a += separator;
            }
            for (let i = 0; i < b; ++i) {
                a += HEX_STRING[Math.floor(Math.random() * 16)];
            }
            return a;
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
        const end = endsWith$3(value, '*');
        const search = start && end
            ? (a) => a.includes(value.replace(/^\*/, '').replace(/\*$/, ''))
            : start
                ? (a) => endsWith$3(a, value.replace(/^\*/, ''))
                : end
                    ? (a) => startsWith$8(a, value.replace(/\*$/, ''))
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
    function parseGlob(value, options) {
        value = value.trim();
        let flags = '', fromEnd;
        if (options) {
            if (options.caseSensitive === false) {
                flags += 'i';
            }
            fromEnd = options.fromEnd;
        }
        const trimCurrent = (cwd) => fromEnd && startsWith$8(cwd, './') ? cwd.substring(2) : cwd;
        const source = ((!fromEnd ? '^' : '') + trimCurrent(value))
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
                default:
                    return match[0];
            }
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
                default:
                    return '\\\\' + String.fromCharCode(+match[1]);
            }
        }) + '$';
        return new GlobExp(source, flags, value[0] === '!');
    }
    function parseTask(value) {
        if (value) {
            const result = [];
            for (const item of value.split('+')) {
                const [handler, command] = splitPair$3(item, ':', true);
                if (handler && command) {
                    const [task, preceding] = splitPair$3(command, ':', true);
                    result.push({ handler, task, preceding: preceding === 'true' });
                }
            }
            return result;
        }
    }
    function parseWatchInterval(value) {
        if (value && (value = value.trim())) {
            if (value === 'true') {
                return true;
            }
            const match = /^(~|\d+)(?:\s*::\s*(~|.+?)(?:\s*::\s*(.+?)(?:\[([^\]]+)\])?)?)?\s*$/.exec(value);
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
                        const [socketId, port] = splitPair$3(match[3], ':', true, true);
                        let secure, module;
                        if (match[4]) {
                            secure = match[4].includes('secure');
                            module = match[4].includes('module');
                        }
                        reload = { socketId: socketId !== '~' ? socketId : '', port: port && !isNaN(+port) ? +port : undefined, secure, module };
                    }
                }
                return { interval, expires, reload };
            }
        }
    }

    var util = /*#__PURE__*/Object.freeze({
        __proto__: null,
        fromMimeType: fromMimeType,
        parseMimeType: parseMimeType,
        appendSeparator: appendSeparator,
        randomUUID: randomUUID,
        upperCaseString: upperCaseString,
        lowerCaseString: lowerCaseString,
        searchObject: searchObject,
        parseGlob: parseGlob,
        parseTask: parseTask,
        parseWatchInterval: parseWatchInterval
    });

    const { DIRECTORY_NOT_PROVIDED, INVALID_ASSET_REQUEST, SERVER_REQUIRED } = squared.lib.error;
    const { createElement: createElement$1 } = squared.lib.dom;
    const { escapePattern: escapePattern$2, fromLastIndexOf: fromLastIndexOf$1, isPlainObject, splitPair: splitPair$2, startsWith: startsWith$7, trimEnd } = squared.lib.util;
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
                if (new RegExp(`^${escapePattern$2(trimEnd(value.replace(/\\/g, '/'), '/'))}/?`).test(pathname)) {
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
    const getEndpoint = (hostname, endpoint) => startsWith$7(endpoint, 'http') ? endpoint : hostname + endpoint;
    class File {
        constructor() {
            this.archiveFormats = ['zip', '7z', 'tar', 'gz', 'tgz'];
            this._hostname = '';
            this._endpoints = {
                ASSETS_COPY: '/api/v1/assets/copy',
                ASSETS_ARCHIVE: '/api/v1/assets/archive',
                LOADER_DATA: '/api/v1/loader/data'
            };
        }
        static downloadFile(href, filename, mimeType) {
            if (typeof href !== 'string') {
                href = URL.createObjectURL(new Blob([href], { type: mimeType || 'application/octet-stream' }));
            }
            const element = createElement$1('a', { style: { display: 'none' }, attributes: { href } });
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
        finalizeRequestBody(data, options) { }
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
            let mime, cache;
            if (options) {
                ({ configMime: mime, cache } = options);
            }
            const config = await this.loadData(uri, { type: 'json', mime, cache });
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
            const { type, mime, cache } = options;
            if (this.hasHttpProtocol() && type) {
                return fetch(getEndpoint(this.hostname, this._endpoints.LOADER_DATA) + `/${type}?key=` + encodeURIComponent(value) + (typeof cache === 'boolean' ? '&cache=' + (cache ? '1' : '0') : '') + (mime ? '&mime=' + encodeURIComponent(mime) : ''), {
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
                    const body = this.createRequestBody(options.assets, options);
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
                const body = this.createRequestBody(options.assets, options);
                if (body) {
                    let { filename, format } = options;
                    const setFilename = () => {
                        if (!format || !this.archiveFormats.includes(format = format.toLowerCase())) {
                            [filename, format] = splitPair$2(filename, '.', true, true);
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
        createRequestBody(assets, options) {
            if (assets === null || assets === void 0 ? void 0 : assets.length) {
                const exclusions = options.exclusions;
                if (exclusions) {
                    assets = assets.filter(item => validateAsset(item, exclusions));
                    if (!assets.length) {
                        return;
                    }
                }
                let socketId;
                const documentName = new Set(options.document);
                const taskName = new Set();
                const setSocketId = (watch) => {
                    var _a;
                    socketId || (socketId = randomUUID());
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
                    if (options.watch && isPlainObject(watch)) {
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
                    if (i === 1 && !options.watch) {
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
                                            for (const task of value) {
                                                addTask(task);
                                            }
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
                const data = { assets, document: Array.from(documentName) };
                if (taskName.size) {
                    data.task = Array.from(taskName);
                }
                this.finalizeRequestBody(data, options);
                return data;
            }
        }
        hasHttpProtocol() {
            return startsWith$7(this._hostname || location.protocol, 'http');
        }
        set hostname(value) {
            try {
                const url = new URL(value);
                this._hostname = startsWith$7(url.origin, 'http') ? url.origin : '';
            }
            catch (_a) {
            }
        }
        get hostname() {
            return this._hostname || location.origin;
        }
    }

    const { CSS: CSS$1, FILE: FILE$2 } = squared.lib.regex;
    const { isUserAgent: isUserAgent$2 } = squared.lib.client;
    const { isTransparent } = squared.lib.color;
    const { CSS_PROPERTIES: CSS_PROPERTIES$3, PROXY_INLINESTYLE, checkFontSizeValue, checkStyleValue, checkWritingMode, convertUnit, getRemSize, getStyle: getStyle$4, isAngle, isLength: isLength$6, isPercent: isPercent$4, isPx: isPx$3, isTime, parseSelectorText, parseUnit: parseUnit$2 } = squared.lib.css;
    const { assignRect, getNamedItem: getNamedItem$3, getParentElement: getParentElement$1, getRangeClientRect: getRangeClientRect$1, newBoxRectDimension } = squared.lib.dom;
    const { clamp, truncate } = squared.lib.math;
    const { getElementAsNode: getElementAsNode$2, getElementCache: getElementCache$2, getElementData, setElementCache: setElementCache$2 } = squared.lib.session;
    const { convertCamelCase: convertCamelCase$1, convertFloat, convertInt, convertPercent: convertPercent$3, endsWith: endsWith$2, escapePattern: escapePattern$1, hasValue: hasValue$1, isNumber: isNumber$3, isObject, isSpace, iterateArray: iterateArray$3, iterateReverseArray: iterateReverseArray$1, spliceString, splitEnclosing: splitEnclosing$1, splitPair: splitPair$1, startsWith: startsWith$6 } = squared.lib.util;
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
    const BORDER_TOP$1 = CSS_PROPERTIES$3.borderTop.value;
    const BORDER_RIGHT$1 = CSS_PROPERTIES$3.borderRight.value;
    const BORDER_BOTTOM$1 = CSS_PROPERTIES$3.borderBottom.value;
    const BORDER_LEFT$1 = CSS_PROPERTIES$3.borderLeft.value;
    const BORDER_OUTLINE$1 = CSS_PROPERTIES$3.outline.value;
    const REGEXP_EM = /\dem$/;
    const REGEXP_ENCLOSING = /^:(not|is|where)\((.+?)\)$/i;
    const REGEXP_ISWHERE = /^(.*?)@((?:\{\{.+?\}\})+)(.*)$/;
    const REGEXP_NOTINDEX = /:not-(x+)/;
    const REGEXP_QUERYNTH = /^:nth(-last)?-(child|of-type)\((.+?)\)$/;
    const REGEXP_QUERYNTHPOSITION = /^([+-])?(\d+)?n\s*(?:([+-])\s*(\d+))?$/;
    const REGEXP_DIR = /^:dir\(\s*(ltr|rtl)\s*\)$/;
    function setStyleCache(element, attr, value, style, sessionId) {
        const current = style[attr];
        if (value !== current) {
            const restore = element.style[attr];
            element.style[attr] = value;
            const newValue = element.style[attr];
            if (newValue && current !== newValue) {
                setElementCache$2(element, attr, restore, sessionId);
                return 2 /* CHANGED */;
            }
            return 0 /* FAIL */;
        }
        return 1 /* READY */;
    }
    function parseLineHeight(value, fontSize) {
        const lineHeight = convertPercent$3(value);
        return !isNaN(lineHeight) ? lineHeight * fontSize : parseUnit$2(value, { fontSize });
    }
    function isFontFixedWidth(node) {
        const [fontFirst, fontSecond] = splitPair$1(node.css('fontFamily'), ',', true);
        return fontFirst === 'monospace' && fontSecond !== 'monospace';
    }
    function getFlexValue(node, attr, fallback) {
        const value = +node.css(attr);
        return !isNaN(value) ? value : fallback;
    }
    function hasTextAlign(node, ...values) {
        const value = node.cssAscend('textAlign', { startSelf: node.textElement && node.blockStatic && !node.hasPX('width', { initial: true }) });
        return value !== '' && values.includes(value) && (node.blockStatic ? node.textElement && !node.hasPX('width', { initial: true }) && !node.hasPX('maxWidth', { initial: true }) : startsWith$6(node.display, 'inline'));
    }
    function setDimension(node, styleMap, dimension) {
        const options = { dimension };
        const value = styleMap[dimension];
        const minValue = styleMap[dimension === 'width' ? 'minWidth' : 'minHeight'];
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
                case 'svg':
                case 'IFRAME':
                case 'VIDEO':
                case 'AUDIO':
                case 'CANVAS':
                case 'OBJECT':
                case 'EMBED': {
                    const size = getNamedItem$3(element, dimension);
                    if (size && (result = isNumber$3(size) ? +size : node.parseUnit(size, options))) {
                        node.css(dimension, isPercent$4(size) ? size : size + 'px');
                    }
                    break;
                }
            }
        }
        if (baseValue && !node.imageElement) {
            const attr = dimension === 'width' ? 'maxWidth' : 'maxHeight';
            const max = styleMap[attr];
            if (max) {
                if (value === max) {
                    delete styleMap[attr];
                }
                else {
                    const maxValue = node.parseUnit(max, { dimension });
                    if (maxValue) {
                        if (maxValue <= baseValue && value && isLength$6(value)) {
                            styleMap[dimension] = max;
                            delete styleMap[attr];
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
            const result = isPx$3(width) ? parseFloat(width) : isLength$6(width, true) ? node.parseUnit(width, { dimension }) : parseFloat(node.style[border[0]]);
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
                if (attr.trailing) {
                    const pattern = new RegExp(`^([^:]+:)?${escapePattern$1(attr.key)}$`);
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
                            if (!startsWith$6(value, other)) {
                                return false;
                            }
                            break;
                        case '$':
                            if (!endsWith$2(value, other)) {
                                return false;
                            }
                            break;
                        case '*':
                            if (!value.includes(other)) {
                                return false;
                            }
                            break;
                        case '|':
                            if (value !== other && !startsWith$6(value, other + '-')) {
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
                                        if (index % 2 !== 0) {
                                            return false;
                                        }
                                        break;
                                    case 'odd':
                                        if (index % 2 === 0) {
                                            return false;
                                        }
                                        break;
                                    default:
                                        if (isNumber$3(placement)) {
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
                    if (iterateArray$3(element.parentElement.querySelectorAll(':scope > ' + scoped.join('')), item => item === element) !== Infinity) {
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
                    while (parent && parent.depth - this.depth >= index + offset) {
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
    function getQueryLength(value) {
        let result = 0;
        for (let i = 0, length = value.length; i < length; ++i) {
            if (!isSpace(value[i])) {
                ++result;
            }
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
    const isInlineVertical = (value) => startsWith$6(value, 'inline') || value === 'table-cell';
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
                    setElementCache$2(element, 'node', this, sessionId);
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
                if (value = checkStyleValue(element, attr, value)) {
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
                    sessionId = getElementCache$2(element, 'sessionId', '0');
                    if (sessionId === this.sessionId) {
                        if (cache) {
                            this._cache = {};
                        }
                        return true;
                    }
                    else if (sessionId) {
                        if (elementData = getElementData(element, sessionId)) {
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
                                const length = element.style.length;
                                if (length) {
                                    const style = element.style;
                                    const specificity = elementData.styleSpecificity || (elementData.styleSpecificity = {});
                                    for (let i = 0; i < length; ++i) {
                                        const attr = style[i];
                                        const baseAttr = convertCamelCase$1(attr);
                                        if ((specificity[baseAttr] | 0) <= 1000) {
                                            styleMap[baseAttr] = style.getPropertyValue(attr);
                                            specificity[baseAttr] = 1000;
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
                if (overwrite || !hasValue$1(obj[attr])) {
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
                        case 'fontSize':
                            cache.lineHeight = undefined;
                            break;
                        case 'whiteSpace':
                            cache.preserveWhiteSpace = undefined;
                            cache.textStyle = undefined;
                            this._cacheState.textEmpty = undefined;
                            continue;
                        default:
                            if (startsWith$6(attr, 'background')) {
                                cache.visibleStyle = undefined;
                            }
                            else if (startsWith$6(attr, 'border')) {
                                if (startsWith$6(attr, 'borderTop')) {
                                    cache.borderTopWidth = undefined;
                                    cache.contentBoxHeight = undefined;
                                }
                                else if (startsWith$6(attr, 'borderRight')) {
                                    cache.borderRightWidth = undefined;
                                    cache.contentBoxWidth = undefined;
                                }
                                else if (startsWith$6(attr, 'borderBottom')) {
                                    cache.borderBottomWidth = undefined;
                                    cache.contentBoxHeight = undefined;
                                }
                                else {
                                    cache.borderLeftWidth = undefined;
                                    cache.contentBoxWidth = undefined;
                                }
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
                if (attrs.some(value => CSS_PROPERTIES$3[value].trait & 4 /* LAYOUT */)) {
                    parent = this.pageFlow && this.ascend({ condition: item => item.hasPX('width') && item.hasPX('height') || item.documentRoot })[0] || this;
                }
                else if (attrs.some(value => CSS_PROPERTIES$3[value].trait & 8 /* CONTAIN */)) {
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
            else if (attr !== 'parent' && !endsWith$2(attr, 'Parent')) {
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
            const style = this.style;
            if (this.styleElement && attr in style) {
                if (value === '') {
                    style[attr] = 'initial';
                    const property = CSS_PROPERTIES$3[attr];
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
        cssUnit(attr, options) {
            return this.parseUnit(options && options.initial ? this.cssInitial(attr, options) : this.css(attr), options);
        }
        cssSpecificity(attr) {
            var _a, _b, _c;
            if (this.styleElement) {
                const styleData = !this.pseudoElt ? (_a = this._elementData) === null || _a === void 0 ? void 0 : _a.styleSpecificity : (_c = (_b = this.actualParent) === null || _b === void 0 ? void 0 : _b.elementData) === null || _c === void 0 ? void 0 : _c['styleSpecificity' + this.pseudoElt];
                if (styleData) {
                    return styleData[attr] || 0;
                }
            }
            return 0;
        }
        cssTry(attr, value, callback) {
            if (this.styleElement) {
                const element = this._element;
                if (setStyleCache(element, attr, value, !this.pseudoElement ? this.style : getStyle$4(element), this.sessionId)) {
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
                const style = !this.pseudoElement ? this.style : getStyle$4(element);
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
                    return getStyle$4(this._element, name)[attr];
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
        parseUnit(value, options) {
            if (!value) {
                return 0;
            }
            else if (isPx$3(value)) {
                return parseFloat(value);
            }
            else if (isPercent$4(value)) {
                return convertPercent$3(value) * getBoundsSize(this, options);
            }
            if (!options) {
                options = { fontSize: this.fontSize };
            }
            else {
                options.fontSize || (options.fontSize = this.fontSize);
            }
            return parseUnit$2(value, options);
        }
        convertUnit(value, unit = 'px', options) {
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
                    const data = CSS_PROPERTIES$3[attr];
                    if (data && (value === data.value || (data.trait & 256 /* UNIT */) && this.parseUnit(value) === parseFloat(data.value))) {
                        return false;
                    }
                }
                if (not && (value === not || Array.isArray(not) && not.includes(value))) {
                    return false;
                }
                if (type) {
                    return ((type & 1 /* LENGTH */) > 0 && isLength$6(value) ||
                        (type & 2 /* PERCENT */) > 0 && isPercent$4(value, true) ||
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
            return value ? isLength$6(value, percent !== false) : false;
        }
        setBounds(cache = true) {
            var _a;
            let bounds;
            if (this.styleElement) {
                bounds = assignRect(cache && ((_a = this._elementData) === null || _a === void 0 ? void 0 : _a.clientRect) || this._element.getBoundingClientRect());
            }
            else if (this.plainText) {
                const rect = getRangeClientRect$1(this._element);
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
            return this.querySelectorAll(value)[0] || null;
        }
        querySelectorAll(value, customMap) {
            const queryMap = customMap || this.queryMap;
            const result = [];
            if (queryMap) {
                const queries = [];
                let notIndex;
                const addNot = (part) => {
                    (notIndex || (notIndex = [])).push(part);
                    return ':not-' + 'x'.repeat(notIndex.length);
                };
                const parseNot = (condition) => condition.includes(',') ? parseSelectorText(condition).reduce((a, b) => a + addNot(b), '') : addNot(condition);
                const checkNot = (condition) => {
                    return splitEnclosing$1(condition, /:not/gi).reduce((a, b) => {
                        if (b[0] === ':') {
                            const match = REGEXP_ENCLOSING.exec(b);
                            if (match && match[1].toLowerCase() === 'not') {
                                b = parseNot(match[2].trim());
                            }
                        }
                        return a + b;
                    }, '');
                };
                for (const query of parseSelectorText(value)) {
                    let selector = '', expand;
                    invalid: {
                        let match;
                        for (let seg of splitEnclosing$1(query, CSS$1.SELECTOR_ENCLOSING)) {
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
                            let selector = '', adjacent = '', match;
                            while (match = CSS$1.SELECTOR_G.exec(query)) {
                                let segment = match[1];
                                selector += segment;
                                switch (segment) {
                                    case '+':
                                    case '~':
                                        --offset;
                                    case '>':
                                        if (adjacent || q === 0 && (segment !== '>' || !/^:(root|scope)/.test(query))) {
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
                                        q = selectors.push({ all: true, adjacent });
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
                                        if (startsWith$6(segment, '*|')) {
                                            segment = segment.substring(2);
                                        }
                                        break;
                                }
                                let attrList, subMatch;
                                while (subMatch = CSS$1.SELECTOR_ATTR.exec(segment)) {
                                    let key = subMatch[1].replace('\\:', ':').toLowerCase(), trailing;
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
                                    const caseInsensitive = subMatch[6] === 'i';
                                    let attrValue = subMatch[3] || subMatch[4] || subMatch[5] || '';
                                    if (caseInsensitive) {
                                        attrValue = attrValue.toLowerCase();
                                    }
                                    (attrList || (attrList = [])).push({
                                        key,
                                        symbol: subMatch[2],
                                        value: attrValue,
                                        trailing,
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
                            if (getQueryLength(query) !== getQueryLength(selector)) {
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
                                    if ((all || !result.includes(node)) && ascendQuerySelector.call(this, selectors, q - 1, [node], offset)) {
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
        ancestors(value, options) {
            const result = this.ascend(options);
            if (value && result.length) {
                const customMap = [];
                let depth = NaN;
                iterateReverseArray$1(result, (item) => {
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
                    iterateReverseArray$1(this.actualParent.naturalElements, filterPredicate, 0, this.childIndex);
                }
                else {
                    iterateArray$3(this.actualParent.naturalElements, filterPredicate, this.childIndex + 1);
                }
                if (value) {
                    const ancestors = this.ascend();
                    const customMap = [];
                    iterateReverseArray$1(ancestors, (item) => customMap.push([item]));
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
            return ((_a = this._element) === null || _a === void 0 ? void 0 : _a.id) || '';
        }
        get htmlElement() {
            const result = this._cacheState.htmlElement;
            return result === undefined ? this._cacheState.htmlElement = this._element instanceof HTMLElement : result;
        }
        get svgElement() {
            const result = this._cacheState.svgElement;
            return result === undefined ? this._cacheState.svgElement = !this.htmlElement && this._element instanceof SVGElement || this.imageElement && FILE$2.SVG.test(this.toElementString('src')) : result;
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
            return this._element ? getParentElement$1(this._element) : ((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.element) || null;
        }
        get textElement() {
            return this.plainText || this.inlineText && this.tagName !== 'BUTTON';
        }
        get imageElement() {
            return this.tagName === 'IMG';
        }
        get flexElement() {
            return endsWith$2(this.display, 'flex');
        }
        get gridElement() {
            return endsWith$2(this.display, 'grid');
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
                default:
                    return false;
            }
        }
        get buttonElement() {
            switch (this.tagName) {
                case 'BUTTON':
                    return true;
                case 'INPUT':
                    switch (this.toElementString('type')) {
                        case 'button':
                        case 'submit':
                        case 'reset':
                        case 'file':
                        case 'image':
                            return true;
                    }
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
                    const row = startsWith$6(flexDirection, 'row');
                    result = {
                        row,
                        column: !row,
                        reverse: endsWith$2(flexDirection, 'reverse'),
                        wrap: startsWith$6(flexWrap, 'wrap'),
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
                        grow: getFlexValue(this, 'flexGrow', 0),
                        shrink: getFlexValue(this, 'flexShrink', 1),
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
            return result === undefined ? this._cache.hasHeight = isPercent$4(this.valueOf('height')) ? this.pageFlow ? ((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.hasHeight) || this.documentBody : this.valueOf('position') === 'fixed' || this.hasPX('top') || this.hasPX('bottom') : this.height > 0 || this.hasPX('height', { percent: false }) : result;
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
            return result === undefined ? this._cache.borderTopWidth = convertBorderWidth(this, 'height', BORDER_TOP$1) : result;
        }
        get borderRightWidth() {
            const result = this._cache.borderRightWidth;
            return result === undefined ? this._cache.borderRightWidth = convertBorderWidth(this, 'height', BORDER_RIGHT$1) : result;
        }
        get borderBottomWidth() {
            const result = this._cache.borderBottomWidth;
            return result === undefined ? this._cache.borderBottomWidth = convertBorderWidth(this, 'width', BORDER_BOTTOM$1) : result;
        }
        get borderLeftWidth() {
            const result = this._cache.borderLeftWidth;
            return result === undefined ? this._cache.borderLeftWidth = convertBorderWidth(this, 'width', BORDER_LEFT$1) : result;
        }
        get outlineWidth() {
            const result = this._cache.outlineWidth;
            return result === undefined ? this._cache.outlineWidth = convertBorderWidth(this, 'width', BORDER_OUTLINE$1) : result;
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
            return this.css('boxSizing') !== 'border-box' || this.tableElement && isUserAgent$2(4 /* FIREFOX */);
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
                            result = !this.hasPX('width') && convertFloat(getNamedItem$3(this._element, 'width')) === 0;
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
                            else if (this.inline || startsWith$6(this.display, 'table-') || this.hasPX('maxWidth')) {
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
                    if (isPercent$4(width)) {
                        percent = convertPercent$3(width);
                    }
                    if (isPercent$4(minWidth)) {
                        percent = Math.max(convertPercent$3(minWidth), percent);
                    }
                    if (percent) {
                        const marginLeft = this.valueOf('marginLeft');
                        const marginRight = this.valueOf('marginRight');
                        result = percent + Math.max(0, convertPercent$3(marginLeft, 0)) + convertPercent$3(marginRight, 0) >= 1;
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
                if (this.blockStatic || !this.pageFlow || this.display === 'table') {
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
                this._cache.autoMargin = result;
            }
            return result;
        }
        get baseline() {
            let result = this._cache.baseline;
            if (result === undefined) {
                const display = this.display;
                if ((startsWith$6(display, 'inline') || display === 'list-item') && this.pageFlow && !this.floating && !this.tableElement) {
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
                if (value !== 'baseline' && this.pageFlow) {
                    if (isPx$3(value)) {
                        result = parseFloat(value);
                    }
                    else if (isLength$6(value)) {
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
                                valid = isPercent$4(value);
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
        set textBounds(value) {
            this._textBounds = value;
        }
        get textBounds() {
            let result = this._textBounds;
            if (result === undefined) {
                if (this.naturalChild) {
                    if (this.textElement) {
                        result = getRangeClientRect$1(this._element);
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
                    result = this.css('backgroundColor');
                    if (isTransparent(result) && !this.buttonElement) {
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
                const value = this.valueOf('width');
                return this._cache.percentWidth = convertPercent$3(value, 0);
            }
            return result;
        }
        get percentHeight() {
            var _a;
            const result = this._cache.percentHeight;
            if (result === undefined) {
                const value = this.valueOf('height');
                return this._cache.percentHeight = isPercent$4(value) && (((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.hasHeight) || this.valueOf('position') === 'fixed') ? convertPercent$3(value) : 0;
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
                const parentElement = element && getParentElement$1(element);
                return this._cacheState.actualParent = parentElement && getElementAsNode$2(parentElement, this.sessionId) || this.parent;
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
                    if (!(this.inlineStatic && !this.valueOf('width') || this.display === 'table-cell' || (parent = this.actualParent) && parent.flexElement && parent.flexdata.row)) {
                        result = this.width;
                        if (result && this.contentBox && !this.tableElement) {
                            result += this.contentBoxWidth;
                        }
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
                if (!(this.inlineStatic && !this.valueOf('height') || this.display === 'table-cell' || (parent = this.actualParent) && parent.flexElement && parent.flexdata.column)) {
                    result = this.height;
                    if (result && this.contentBox && !this.tableElement) {
                        result += this.contentBoxHeight;
                    }
                }
                return this._cache.actualHeight = result || this.bounds.height;
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
                const rect = getRangeClientRect$1(this._element);
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
                        if (isPx$3(value)) {
                            result = parseFloat(value);
                        }
                        else if (isPercent$4(value)) {
                            const parent = this.actualParent;
                            if (parent) {
                                result = convertPercent$3(value) * parent.fontSize;
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
                                                if (isPercent$4(value)) {
                                                    emRatio *= convertPercent$3(value);
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
                            result = (endsWith$2(value, 'rem') ? parseFloat(value) * getRemSize(fixedWidth) : parseUnit$2(value, { fixedWidth })) * emRatio;
                        }
                    }
                    else {
                        result = this.actualParent.fontSize;
                    }
                }
                else {
                    const options = { fixedWidth: isFontFixedWidth(this) };
                    result = parseUnit$2(this.css('fontSize'), options) || ((_b = (_a = this.ascend({ condition: item => item.fontSize > 0 })[0]) === null || _a === void 0 ? void 0 : _a.fontSize) !== null && _b !== void 0 ? _b : parseUnit$2('1rem', options));
                }
                this._cache.fontSize = result;
            }
            return result;
        }
        get style() {
            return this._style || (this._style = this.styleElement ? !this.pseudoElt ? getStyle$4(this._element) : getStyle$4(getParentElement$1(this._element), this.pseudoElt) : PROXY_INLINESTYLE);
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
                            node.unsetState('dir');
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
        get center() {
            const bounds = this.bounds;
            return {
                x: (bounds.left + bounds.right) / 2,
                y: (bounds.top + bounds.bottom) / 2
            };
        }
        get initial() {
            return this._initial;
        }
    }

    const { FILE: FILE$1, STRING: STRING$1 } = squared.lib.regex;
    const { extractURL, resolveURL: resolveURL$1 } = squared.lib.css;
    const { convertBase64: convertBase64$1, endsWith: endsWith$1, fromLastIndexOf, isBase64, resolvePath, splitPairStart, startsWith: startsWith$5, trimBoth: trimBoth$1 } = squared.lib.util;
    const REGEXP_FONTFACE = /@font-face\s*{([^}]+)}/;
    const REGEXP_FONTFAMILY = /\bfont-family:\s*([^;]+);/;
    const REGEXP_FONTSTYLE = /\bfont-style:\s*(\w+)\s*;/;
    const REGEXP_FONTWEIGHT = /\bfont-weight:\s*([^;]+);/;
    const REGEXP_FONTURL = /\b(url|local)\(\s*(?:"([^"]+)"|'([^']+)'|([^)]+))\s*\)(?:\s*format\(\s*["']?\s*([\w-]+)\s*["']?\s*\))?/g;
    const REGEXP_DATAURI = new RegExp(`^${STRING$1.DATAURI}$`);
    class Resource {
        constructor(application) {
            this.application = application;
            this._fileHandler = null;
        }
        static hasMimeType(formats, value) {
            return formats === '*' || formats.includes(parseMimeType(value));
        }
        static getExtension(value) {
            var _a;
            return ((_a = /\.([^./]+)\s*$/.exec(value)) === null || _a === void 0 ? void 0 : _a[1]) || '';
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
                    if (leading.includes('/')) {
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
        init(resourceId) {
            var _a;
            const data = (_a = Resource.ASSETS)[resourceId] || (_a[resourceId] = {});
            data.fonts = new Map();
            data.image = new Map();
            data.video = new Map();
            data.audio = new Map();
            data.rawData = new Map();
            data.other = [];
        }
        clear() {
            Resource.ASSETS.length = 0;
        }
        reset() { }
        preloadAssets(resourceId, documentRoot, elements) {
            const { preloadImages, preloadFonts } = this.userSettings;
            const assets = Resource.ASSETS[resourceId];
            const result = [];
            const images = [];
            const preloadMap = [];
            const parseSrcSet = (value) => {
                for (const uri of value.split(',')) {
                    this.addImageData(resourceId, resolvePath(splitPairStart(uri.trim(), ' ')));
                }
            };
            for (const element of elements) {
                element.querySelectorAll('img[srcset], picture > source[srcset]').forEach((source) => parseSrcSet(source.srcset));
                element.querySelectorAll('video').forEach((source) => this.addImageData(resourceId, source.poster));
                element.querySelectorAll('input[type=image]').forEach((image) => this.addImageData(resourceId, image.src, image.width, image.height));
                element.querySelectorAll('object, embed').forEach((source) => {
                    const src = source.data || source.src;
                    if (src && (startsWith$5(source.type, 'image/') || startsWith$5(parseMimeType(src), 'image/'))) {
                        this.addImageData(resourceId, src.trim());
                    }
                });
                element.querySelectorAll('svg use').forEach((use) => {
                    const href = use.href.baseVal || use.getAttributeNS('xlink', 'href');
                    if (href && href.indexOf('#') > 0) {
                        const src = resolvePath(splitPairStart(href, '#'));
                        if (FILE$1.SVG.test(src)) {
                            this.addImageData(resourceId, src);
                        }
                    }
                });
            }
            if (preloadImages) {
                const { image, rawData } = assets;
                for (const item of image.values()) {
                    const uri = item.uri;
                    if (FILE$1.SVG.test(uri)) {
                        result.push(uri);
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
                            images.push(element);
                            result.push(element);
                        }
                    }
                }
                for (const data of rawData) {
                    const item = data[1];
                    const mimeType = item.mimeType;
                    if (startsWith$5(mimeType, 'image/') && !endsWith$1(mimeType, 'svg+xml')) {
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
                        this.addImage(resourceId, image);
                    }
                    else {
                        const src = image.src;
                        if (!preloadMap.includes(src)) {
                            if (FILE$1.SVG.test(src)) {
                                result.push(src);
                            }
                            else if (image.complete) {
                                this.addImage(resourceId, image);
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
            var _a, _b, _c, _d;
            const value = (_a = REGEXP_FONTFACE.exec(cssText)) === null || _a === void 0 ? void 0 : _a[1];
            if (value) {
                let fontFamily = (_b = REGEXP_FONTFAMILY.exec(value)) === null || _b === void 0 ? void 0 : _b[1].trim();
                if (fontFamily) {
                    const fontStyle = ((_c = REGEXP_FONTSTYLE.exec(value)) === null || _c === void 0 ? void 0 : _c[1]) || 'normal';
                    const weight = (_d = REGEXP_FONTWEIGHT.exec(value)) === null || _d === void 0 ? void 0 : _d[1].trim();
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
                    fontFamily = trimBoth$1(fontFamily, '"');
                    let match;
                    while (match = REGEXP_FONTURL.exec(value)) {
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
                            if (startsWith$5(url, 'data:')) {
                                const [mime, base64] = url.split(',');
                                srcBase64 = base64.trim();
                                if (!mime.includes('base64') && !isBase64(srcBase64)) {
                                    continue;
                                }
                                mimeType || (mimeType = mime.toLowerCase());
                            }
                            else {
                                srcUrl = resolvePath(url, styleSheetHref);
                                mimeType || (mimeType = parseMimeType(srcUrl));
                            }
                            if (!srcFormat) {
                                if (mimeType.includes('/ttf')) {
                                    srcFormat = 'truetype';
                                }
                                else if (mimeType.includes('/otf')) {
                                    srcFormat = 'opentype';
                                }
                                else if (mimeType.includes('/woff2')) {
                                    srcFormat = 'woff2';
                                }
                                else if (mimeType.includes('/woff')) {
                                    srcFormat = 'woff';
                                }
                                else if (mimeType.includes('/svg+xml')) {
                                    srcFormat = 'svg';
                                }
                                else if (mimeType.includes('/vnd.ms-fontobject')) {
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
        addAsset(resourceId, asset) {
            const assets = Resource.ASSETS[resourceId];
            if (assets && (asset.content || asset.uri || asset.base64)) {
                const { pathname, filename } = asset;
                const append = assets.other.find(item => item.pathname === pathname && item.filename === filename);
                if (append) {
                    Object.assign(append, asset);
                }
                else {
                    assets.other.push(asset);
                }
            }
        }
        addImage(resourceId, element) {
            const assets = Resource.ASSETS[resourceId];
            if (assets && element.complete) {
                const uri = element.src;
                const image = Resource.parseDataURI(uri);
                if (image) {
                    image.width = element.naturalWidth;
                    image.height = element.naturalHeight;
                    this.addRawData(resourceId, uri, image);
                }
                if (uri) {
                    assets.image.set(uri, { width: element.naturalWidth, height: element.naturalHeight, uri });
                }
            }
        }
        addAudio(resourceId, uri, options) {
            var _a;
            (_a = Resource.ASSETS[resourceId]) === null || _a === void 0 ? void 0 : _a.audio.set(uri, Object.assign({ uri }, options));
        }
        addVideo(resourceId, uri, options) {
            var _a;
            (_a = Resource.ASSETS[resourceId]) === null || _a === void 0 ? void 0 : _a.video.set(uri, Object.assign({ uri }, options));
        }
        addFont(resourceId, data) {
            const assets = Resource.ASSETS[resourceId];
            if (assets) {
                const fontFamily = data.fontFamily.trim().toLowerCase();
                data.fontFamily = fontFamily;
                const items = assets.fonts.get(fontFamily);
                if (items) {
                    items.push(data);
                }
                else {
                    assets.fonts.set(fontFamily, [data]);
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
                            base64 = startsWith$5(content, 'data:') ? content.split(',')[1].trim() : content;
                            content = undefined;
                        }
                        else if (buffer) {
                            base64 = convertBase64$1(buffer);
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
                    const url = uri.split('?')[0];
                    if (!filename) {
                        const ext = '.' + (mimeType && fromMimeType(mimeType) || 'unknown');
                        filename = url.endsWith(ext) ? fromLastIndexOf(url, '/') : this.randomUUID + ext;
                    }
                    assets.rawData.set(uri, {
                        pathname: startsWith$5(url, location.origin) ? url.substring(location.origin.length + 1, url.lastIndexOf('/')) : '',
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
            var _a;
            return (_a = Resource.ASSETS[resourceId]) === null || _a === void 0 ? void 0 : _a.image.get(uri);
        }
        getVideo(resourceId, uri) {
            var _a;
            return (_a = Resource.ASSETS[resourceId]) === null || _a === void 0 ? void 0 : _a.video.get(uri);
        }
        getAudio(resourceId, uri) {
            var _a;
            return (_a = Resource.ASSETS[resourceId]) === null || _a === void 0 ? void 0 : _a.audio.get(uri);
        }
        getFonts(resourceId, fontFamily, fontStyle = 'normal', fontWeight) {
            var _a;
            const font = (_a = Resource.ASSETS[resourceId]) === null || _a === void 0 ? void 0 : _a.fonts.get(fontFamily.trim().toLowerCase());
            if (font) {
                const mimeType = this.mimeTypeMap.font;
                return font.filter(item => startsWith$5(fontStyle, item.fontStyle) && (!fontWeight || item.fontWeight === +fontWeight) && (mimeType === '*' || mimeType.includes(item.mimeType)));
            }
            return [];
        }
        getRawData(resourceId, uri) {
            var _a;
            if (startsWith$5(uri, 'url(')) {
                uri = extractURL(uri);
                if (!uri) {
                    return;
                }
            }
            return (_a = Resource.ASSETS[resourceId]) === null || _a === void 0 ? void 0 : _a.rawData.get(uri);
        }
        addImageData(resourceId, uri, width = 0, height = 0) {
            var _a;
            if (uri && (width && height || !this.getImage(resourceId, uri))) {
                (_a = Resource.ASSETS[resourceId]) === null || _a === void 0 ? void 0 : _a.image.set(uri, { width, height, uri });
            }
        }
        fromImageUrl(resourceId, value) {
            const data = this.getRawData(resourceId, value);
            if (data) {
                return [data];
            }
            const result = [];
            const pattern = /url\([^)]+\)/g;
            let match;
            while (match = pattern.exec(value)) {
                const url = resolveURL$1(match[0]);
                if (url) {
                    const image = this.getImage(resourceId, url);
                    if (image) {
                        result.push(image);
                    }
                }
            }
            return result;
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
        get userSettings() {
            return this.application.userSettings;
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
    Resource.KEY_NAME = 'squared.base.resource';
    Resource.ASSETS = [];

    const { STRING } = squared.lib.regex;
    const { isUserAgent: isUserAgent$1 } = squared.lib.client;
    const { parseColor } = squared.lib.color;
    const { CSS_PROPERTIES: CSS_PROPERTIES$2, calculate, convertAngle, formatPercent: formatPercent$2, formatPX: formatPX$5, getStyle: getStyle$3, hasCoords: hasCoords$3, isCalc: isCalc$1, isLength: isLength$5, isPercent: isPercent$3, parseAngle, parseUnit: parseUnit$1 } = squared.lib.css;
    const { getNamedItem: getNamedItem$2 } = squared.lib.dom;
    const { cos, equal: equal$1, hypotenuse, offsetAngleX, offsetAngleY, relativeAngle, sin, triangulate, truncateFraction } = squared.lib.math;
    const { getElementAsNode: getElementAsNode$1 } = squared.lib.session;
    const { convertBase64, convertCamelCase, convertPercent: convertPercent$2, escapePattern, hasValue, isEqual, isNumber: isNumber$2, isString: isString$1, iterateArray: iterateArray$2, splitPair, startsWith: startsWith$4 } = squared.lib.util;
    const BORDER_TOP = CSS_PROPERTIES$2.borderTop.value;
    const BORDER_RIGHT = CSS_PROPERTIES$2.borderRight.value;
    const BORDER_BOTTOM = CSS_PROPERTIES$2.borderBottom.value;
    const BORDER_LEFT = CSS_PROPERTIES$2.borderLeft.value;
    const BORDER_OUTLINE = CSS_PROPERTIES$2.outline.value;
    const PATTERN_COLOR = '((?:rgb|hsl)a?\\(\\s*\\d+\\s*,\\s*\\d+%?\\s*,\\s*\\d+%?\\s*(?:,\\s*[\\d.]+\\s*)?\\)|#[A-Za-z\\d]{3,8}|[a-z]{3,})';
    const PATTERN_COLORSTOP = `\\s*${PATTERN_COLOR}(?:\\s*(${STRING.LENGTH_PERCENTAGE}|${STRING.CSS_ANGLE}|calc\\((.+)\\)(?=\\s*,)|calc\\((.+)\\))\\s*,?)*\\s*,?`;
    const REGEXP_BACKGROUNDIMAGE = new RegExp(`url\\([^)]+\\)|initial|(repeating-)?(linear|radial|conic)-gradient\\(((?:to\\s+[a-z\\s]+|(?:from\\s+)?-?[\\d.]+(?:deg|rad|turn|grad)|(?:circle|ellipse)?\\s*(?:closest-side|closest-corner|farthest-side|farthest-corner)?)?(?:\\s*(?:(?:-?[\\d.]+(?:[a-z%]+)?\\s*)+)?(?:at\\s+[\\w\\s%]+)?)?)\\s*,?\\s*((?:${PATTERN_COLORSTOP})+)\\)`, 'g');
    const REGEXP_COLORSTOP = new RegExp(PATTERN_COLORSTOP, 'g');
    const REGEXP_TRAILINGINDENT = /\n([^\S\n]*)?$/;
    const CHAR_LEADINGSPACE = /^\s+/;
    const CHAR_TRAILINGSPACE = /\s+$/;
    function parseColorStops(node, gradient, value) {
        const { width, height } = gradient.dimension;
        const result = [];
        let horizontal = true, extent = 1, size, repeat;
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
                    default:
                        size = Math.abs(width * sin(angle - 180)) + Math.abs(height * cos(angle - 180));
                        horizontal = width >= height;
                        break;
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
        let previousOffset = 0, match;
        if (isUserAgent$1(2 /* SAFARI */)) {
            const colors = [];
            const length = value.length;
            const colorPattern = new RegExp(PATTERN_COLOR, 'g');
            while (match = colorPattern.exec(value)) {
                const color = match[1];
                const lastIndex = colorPattern.lastIndex;
                const index = lastIndex - color.length;
                if (/[a-z]/.test(color[0]) && /\d/.test(value[index - 1])) {
                    continue;
                }
                if (colors.length) {
                    colors[colors.length - 1][2] = index;
                }
                colors.push([color, lastIndex, length]);
            }
            let expanded = '';
            for (const item of colors) {
                const color = item[0];
                expanded = value.substring(item[1], item[2]).split(',').reduce((a, b) => b = b.trim() ? a + (a ? ', ' : '') + color + ' ' + b : a, expanded);
            }
            value = expanded;
        }
        while (match = REGEXP_COLORSTOP.exec(value)) {
            const color = parseColor(match[1]);
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
                    if (unit) {
                        if (isPercent$3(unit)) {
                            offset = convertPercent$2(unit);
                        }
                        else if (isLength$5(unit)) {
                            offset = (horizontal ? node.parseWidth(unit, false) : node.parseHeight(unit, false)) / size;
                        }
                        else if (isCalc$1(unit)) {
                            offset = calculate(match[6], { boundingSize: size, fontSize: node.fontSize }) / size;
                        }
                        if (repeat && offset !== -1) {
                            offset *= extent;
                        }
                    }
                }
                if (isNaN(offset)) {
                    continue;
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
                        for (let i = 0; i < length; ++i) {
                            const data = original[i];
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
        REGEXP_COLORSTOP.lastIndex = 0;
        return result;
    }
    function setBorderStyle$2(node, boxStyle, attr, border) {
        let width = node[border[0]];
        if (width > 0) {
            const style = node.css(border[1]) || 'solid';
            let color = node.css(border[2]) || 'rgb(0, 0, 0)';
            if (startsWith$4(color, 'current')) {
                color = node.css('color');
            }
            if (width === 2 && (style === 'inset' || style === 'outset')) {
                width = 1;
            }
            if (color = parseColor(color)) {
                boxStyle[attr] = {
                    width: formatPX$5(width),
                    style,
                    color
                };
                return true;
            }
        }
        return false;
    }
    function setBackgroundOffset(node, boxStyle, attr) {
        switch (node.valueOf(attr) || (attr === 'backgroundClip' ? 'border-box' : 'padding-box')) {
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
    function hasEndingSpace(element) {
        const value = element.textContent;
        const ch = value[value.length - 1];
        return ch === ' ' || ch === '\t';
    }
    function newBoxRectPosition(orientation = ['left', 'top']) {
        return {
            static: true,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            topAsPercent: 0,
            leftAsPercent: 0,
            rightAsPercent: 0,
            bottomAsPercent: 0,
            horizontal: 'left',
            vertical: 'top',
            orientation
        };
    }
    function replaceSvgAttribute(src, tagName, attrs, timestamp, start) {
        const length = attrs.length;
        let i = 0;
        while (i < length) {
            const attr = attrs[i++];
            tagName = (i === 0 && start ? '' : '!' + timestamp) + `(${tagName})`;
            const style = ' ' + attr + `="${attrs[i++]}"`;
            const match = new RegExp(`<${tagName}(${STRING.TAG_OPEN}+?)${attr}\\s*${STRING.TAG_ATTR}(${STRING.TAG_OPEN}*)>`, 'i').exec(src);
            src = match ? src.replace(match[0], '<!' + timestamp + match[1] + match[2] + style + match[6] + '>') : src.replace(new RegExp(`<${tagName}`, 'i'), (...capture) => '<!' + timestamp + capture[1] + style);
        }
        return src;
    }
    function replaceSvgValues(src, children, dimension) {
        for (let i = 0, length = children.length; i < length; ++i) {
            const item = children[i];
            const timestamp = performance.now().toString().replace(/\./, '');
            const tagName = item.tagName;
            let start = true;
            switch (tagName) {
                case 'svg':
                case 'use':
                case 'rect':
                case 'pattern':
                    try {
                        src = replaceSvgAttribute(src, tagName, [
                            'width',
                            dimension && dimension.width || item.width.baseVal.value,
                            'height',
                            dimension && dimension.height || item.height.baseVal.value
                        ], timestamp, true);
                        start = false;
                    }
                    catch (_a) {
                    }
                case 'symbol':
                case 'g':
                case 'path':
                case 'line':
                case 'ellipse':
                case 'circle':
                case 'polyline':
                case 'polygon': {
                    const { stroke, strokeWidth, strokeDasharray, strokeDashoffset, strokeLinecap, strokeLinejoin, strokeMiterlimit, strokeOpacity, fill, fillRule, fillOpacity, clipPath, clipRule } = getStyle$3(item);
                    const strokeColor = parseColor(stroke);
                    const fillColor = parseColor(fill);
                    src = replaceSvgAttribute(src, tagName, [
                        'stroke', strokeColor && !strokeColor.transparent ? strokeColor.valueAsRGBA : 'none',
                        'stroke-width', strokeWidth,
                        'stroke-dasharray', strokeDasharray,
                        'stroke-dashoffset', strokeDashoffset,
                        'stroke-linecap', strokeLinecap,
                        'stroke-linejoin', strokeLinejoin,
                        'stroke-miterlimit', strokeMiterlimit,
                        'stroke-opacity', strokeOpacity,
                        'fill', fillColor && !fillColor.transparent ? fillColor.valueAsRGBA : 'none',
                        'fill-rule', fillRule,
                        'fill-opacity', fillOpacity,
                        'clip-path', clipPath,
                        'clip-rule', clipRule
                    ], timestamp, start);
                    src = replaceSvgValues(src, item.children);
                    break;
                }
                case 'stop': {
                    const { stopColor, stopOpacity } = getStyle$3(item);
                    const color = parseColor(stopColor);
                    src = replaceSvgAttribute(src, tagName, [
                        'stop-color', color && !color.transparent ? color.valueAsRGBA : 'none',
                        'stop-opacity', stopOpacity
                    ], timestamp, true);
                    break;
                }
            }
        }
        return src;
    }
    const parseLength = (value, dimension, options) => isPercent$3(value) ? Math.round(convertPercent$2(value) * dimension) : parseUnit$1(value, options);
    const parsePercent = (value, dimension, options) => isPercent$3(value) ? convertPercent$2(value) : parseUnit$1(value, options) / dimension;
    const checkPreviousSibling = (node) => !node || node.lineBreak || node.floating || node.plainText && CHAR_TRAILINGSPACE.test(node.textContent);
    class ResourceUI extends Resource {
        static generateId(resourceId, section, name, start = 1) {
            const stored = this.STORED[resourceId];
            if (stored) {
                const data = stored.ids.get(section);
                let result = name + (start >= 1 ? '_' + start : '');
                if (data) {
                    do {
                        if (!data.includes(result)) {
                            data.push(result);
                            break;
                        }
                        else {
                            result = name + '_' + ++start;
                        }
                    } while (true);
                }
                else {
                    stored.ids.set(section, [result]);
                }
                return result;
            }
            return '';
        }
        static insertStoredAsset(resourceId, type, name, value) {
            const stored = this.STORED[resourceId];
            if (stored && hasValue(value)) {
                const data = stored[type];
                if (data instanceof Map) {
                    let result = '';
                    if (stored) {
                        for (const item of data) {
                            if (isEqual(value, item[1])) {
                                result = item[0];
                                break;
                            }
                        }
                    }
                    if (!result) {
                        if (isNumber$2(name)) {
                            name = '__' + name;
                        }
                        let i = 0;
                        do {
                            result = i === 0 ? name : name + '_' + i;
                            if (!data.has(result)) {
                                data.set(result, value);
                                break;
                            }
                        } while (++i);
                    }
                    return result;
                }
            }
            return '';
        }
        static getBackgroundPosition(value, dimension, options) {
            if (value && value !== 'left top' && value !== '0% 0%') {
                let fontSize, imageDimension, imageSize, screenDimension;
                if (options) {
                    ({ fontSize, imageDimension, imageSize, screenDimension } = options);
                }
                const { width, height } = dimension;
                const setImageOffset = (position, horizontal, direction, directionAsPercent) => {
                    if (imageDimension && !isLength$5(position)) {
                        let offset = result[directionAsPercent];
                        if (imageSize && imageSize !== 'auto' && imageSize !== 'initial') {
                            const [sizeW, sizeH] = imageSize.split(/\s+/);
                            if (horizontal) {
                                let imageWidth = width;
                                if (isLength$5(sizeW, true)) {
                                    if (isPercent$3(sizeW)) {
                                        imageWidth *= convertPercent$2(sizeW);
                                    }
                                    else {
                                        imageWidth = parseUnit$1(sizeW, { fontSize, screenDimension }) || imageWidth;
                                    }
                                }
                                else if (sizeH) {
                                    let percent = 1;
                                    if (isPercent$3(sizeH)) {
                                        percent = (convertPercent$2(sizeH) * height) / imageDimension.height;
                                    }
                                    else if (isLength$5(sizeH)) {
                                        const unit = parseUnit$1(sizeH, { fontSize, screenDimension });
                                        if (unit) {
                                            percent = unit / imageDimension.height;
                                        }
                                    }
                                    imageWidth = percent * imageDimension.width;
                                }
                                offset *= imageWidth;
                            }
                            else {
                                let imageHeight = height;
                                if (isLength$5(sizeH, true)) {
                                    if (isPercent$3(sizeH)) {
                                        imageHeight *= convertPercent$2(sizeH);
                                    }
                                    else {
                                        imageHeight = parseUnit$1(sizeH, { fontSize, screenDimension }) || imageHeight;
                                    }
                                }
                                else if (sizeW) {
                                    let percent = 1;
                                    if (isPercent$3(sizeW)) {
                                        percent = (convertPercent$2(sizeW) * width) / imageDimension.width;
                                    }
                                    else if (isLength$5(sizeW)) {
                                        const unit = parseUnit$1(sizeW, { fontSize, screenDimension });
                                        if (unit) {
                                            percent = unit / imageDimension.width;
                                        }
                                    }
                                    imageHeight = percent * imageDimension.height;
                                }
                                offset *= imageHeight;
                            }
                        }
                        else {
                            offset *= horizontal ? imageDimension.width : imageDimension.height;
                        }
                        result[direction] -= offset;
                    }
                };
                const orientation = value.split(/\s+/);
                if (orientation.length === 1) {
                    orientation.push('center');
                }
                const result = newBoxRectPosition(orientation);
                const length = Math.min(orientation.length, 4);
                if (length === 2) {
                    orientation.sort((a, b) => {
                        switch (a) {
                            case 'left':
                            case 'right':
                                return -1;
                            case 'top':
                            case 'bottom':
                                return 1;
                        }
                        switch (b) {
                            case 'left':
                            case 'right':
                                return 1;
                            case 'top':
                            case 'bottom':
                                return -1;
                        }
                        return 0;
                    });
                    let direction, offsetParent;
                    for (let i = 0; i < 2; ++i) {
                        let position = orientation[i];
                        const horizontal = i === 0;
                        if (horizontal) {
                            direction = 'left';
                            offsetParent = width;
                        }
                        else {
                            direction = 'top';
                            offsetParent = height;
                        }
                        const directionAsPercent = direction + 'AsPercent';
                        switch (position) {
                            case '0%':
                                if (horizontal) {
                                    position = 'left';
                                }
                            case 'left':
                            case 'top':
                                break;
                            case '100%':
                                if (horizontal) {
                                    position = 'right';
                                }
                            case 'right':
                            case 'bottom':
                                result[direction] = offsetParent;
                                result[directionAsPercent] = 1;
                                break;
                            case '50%':
                            case 'center':
                                position = 'center';
                                result[direction] = offsetParent / 2;
                                result[directionAsPercent] = 0.5;
                                break;
                            default: {
                                const percent = parsePercent(position, offsetParent, { fontSize, screenDimension });
                                if (percent > 1) {
                                    orientation[i] = '100%';
                                    position = horizontal ? 'right' : 'bottom';
                                    result[position] = parseLength(formatPercent$2(percent - 1), offsetParent, { fontSize, screenDimension }) * -1;
                                }
                                else {
                                    result[direction] = parseLength(position, offsetParent, { fontSize, screenDimension });
                                }
                                result[directionAsPercent] = percent;
                                break;
                            }
                        }
                        if (horizontal) {
                            result.horizontal = position;
                        }
                        else {
                            result.vertical = position;
                        }
                        setImageOffset(position, horizontal, direction, directionAsPercent);
                    }
                }
                else {
                    let horizontal = 0, vertical = 0;
                    const checkPosition = (position, nextPosition) => {
                        switch (position) {
                            case 'left':
                            case 'right':
                                result.horizontal = position;
                                ++horizontal;
                                break;
                            case 'center': {
                                if (length === 4) {
                                    return false;
                                }
                                let centerHorizontal = true;
                                if (nextPosition === undefined) {
                                    if (horizontal) {
                                        result.vertical = position;
                                        centerHorizontal = false;
                                    }
                                    else {
                                        result.horizontal = position;
                                    }
                                }
                                else {
                                    switch (nextPosition) {
                                        case 'left':
                                        case 'right':
                                            result.vertical = position;
                                            centerHorizontal = false;
                                            break;
                                        case 'top':
                                        case 'bottom':
                                            result.horizontal = position;
                                            break;
                                        default:
                                            return false;
                                    }
                                }
                                if (centerHorizontal) {
                                    result.left = width / 2;
                                    result.leftAsPercent = 0.5;
                                    setImageOffset(position, true, 'left', 'leftAsPercent');
                                }
                                else {
                                    result.top = height / 2;
                                    result.topAsPercent = 0.5;
                                    setImageOffset(position, false, 'top', 'topAsPercent');
                                }
                                break;
                            }
                            case 'top':
                            case 'bottom':
                                result.vertical = position;
                                ++vertical;
                                break;
                            default:
                                return false;
                        }
                        return horizontal < 2 && vertical < 2;
                    };
                    for (let i = 0; i < length; ++i) {
                        const position = orientation[i];
                        if (isLength$5(position, true)) {
                            const alignment = orientation[i - 1];
                            switch (alignment) {
                                case 'left':
                                case 'right': {
                                    const location = parseLength(position, width, { fontSize, screenDimension });
                                    const locationAsPercent = parsePercent(position, width, { fontSize, screenDimension });
                                    if (alignment === 'right') {
                                        result.right = location;
                                        result.rightAsPercent = locationAsPercent;
                                        setImageOffset(position, true, 'right', 'rightAsPercent');
                                        result.left = width - location;
                                        result.leftAsPercent = 1 - locationAsPercent;
                                    }
                                    else {
                                        if (locationAsPercent > 1) {
                                            const percent = 1 - locationAsPercent;
                                            result.horizontal = 'right';
                                            result.right = parseLength(formatPercent$2(percent), width, { fontSize, screenDimension });
                                            result.rightAsPercent = percent;
                                            setImageOffset(position, true, 'right', 'rightAsPercent');
                                        }
                                        result.left = location;
                                        result.leftAsPercent = locationAsPercent;
                                    }
                                    setImageOffset(position, true, 'left', 'leftAsPercent');
                                    break;
                                }
                                case 'top':
                                case 'bottom': {
                                    const location = parseLength(position, height, { fontSize, screenDimension });
                                    const locationAsPercent = parsePercent(position, height, { fontSize, screenDimension });
                                    if (alignment === 'bottom') {
                                        result.bottom = location;
                                        result.bottomAsPercent = locationAsPercent;
                                        setImageOffset(position, false, 'bottom', 'bottomAsPercent');
                                        result.top = height - location;
                                        result.topAsPercent = 1 - locationAsPercent;
                                    }
                                    else {
                                        if (locationAsPercent > 1) {
                                            const percent = 1 - locationAsPercent;
                                            result.horizontal = 'bottom';
                                            result.bottom = parseLength(formatPercent$2(percent), height, { fontSize, screenDimension });
                                            result.bottomAsPercent = percent;
                                            setImageOffset(position, false, 'bottom', 'bottomAsPercent');
                                        }
                                        result.top = location;
                                        result.topAsPercent = locationAsPercent;
                                    }
                                    setImageOffset(position, false, 'top', 'topAsPercent');
                                    break;
                                }
                                default:
                                    return newBoxRectPosition();
                            }
                        }
                        else if (!checkPosition(position, orientation[i + 1])) {
                            return newBoxRectPosition();
                        }
                    }
                }
                result.static = result.top === 0 && result.right === 0 && result.bottom === 0 && result.left === 0;
                return result;
            }
            return newBoxRectPosition();
        }
        static isBackgroundVisible(object) {
            return object ? 'backgroundImage' in object || 'borderTop' in object || 'borderRight' in object || 'borderBottom' in object || 'borderLeft' in object : false;
        }
        static getOptionArray(element, showDisabled) {
            const result = [];
            let numberArray = true;
            iterateArray$2(element.children, (item) => {
                if (item.disabled && !showDisabled) {
                    return;
                }
                switch (item.tagName) {
                    case 'OPTION': {
                        const value = item.text.trim() || item.value.trim();
                        if (value) {
                            if (numberArray && !isNumber$2(value)) {
                                numberArray = false;
                            }
                            result.push(value);
                        }
                        break;
                    }
                    case 'OPTGROUP': {
                        const [groupStringArray, groupNumberArray] = this.getOptionArray(item, showDisabled);
                        if (groupStringArray) {
                            result.push(...groupStringArray);
                            numberArray = false;
                        }
                        else if (groupNumberArray) {
                            result.push(...groupNumberArray);
                        }
                        break;
                    }
                }
            });
            return numberArray ? [undefined, result] : [result];
        }
        static parseBackgroundImage(node, backgroundImage) {
            var _a, _b;
            const backgroundSize = node.css('backgroundSize').split(/\s*,\s*/);
            const images = [];
            const getGradientPosition = (value) => isString$1(value) ? value.includes('at ') ? /(.+?)?\s*at (.+?)\s*$/.exec(value) : [value, value] : null;
            const getAngle = (value, fallback = 0) => {
                if (value = value.trim()) {
                    let degree = parseAngle(value, fallback);
                    if (!isNaN(degree)) {
                        if (degree < 0) {
                            degree += 360;
                        }
                        return degree;
                    }
                }
                return fallback;
            };
            let i = 0, match;
            while (match = REGEXP_BACKGROUNDIMAGE.exec(backgroundImage)) {
                const value = match[0];
                if (startsWith$4(value, 'url(') || value === 'initial') {
                    images.push(value);
                }
                else {
                    const repeating = !!match[1];
                    const type = match[2];
                    const direction = match[3];
                    const imageDimension = backgroundSize.length ? ResourceUI.getBackgroundSize(node, backgroundSize[i % backgroundSize.length]) : null;
                    const dimension = node.fitToScreen(imageDimension || node.actualDimension);
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
                            let x = truncateFraction(offsetAngleX(angle, width)), y = truncateFraction(offsetAngleY(angle, height));
                            if (x !== width && y !== height && !equal$1(Math.abs(x), Math.abs(y))) {
                                let opposite;
                                if (angle <= 90) {
                                    opposite = relativeAngle({ x: 0, y: height }, { x: width, y: 0 });
                                }
                                else if (angle <= 180) {
                                    opposite = relativeAngle({ x: 0, y: 0 }, { x: width, y: height });
                                }
                                else if (angle <= 270) {
                                    opposite = relativeAngle({ x: 0, y: 0 }, { x: width * -1, y: height });
                                }
                                else {
                                    opposite = relativeAngle({ x: 0, y: height }, { x: width * -1, y: 0 });
                                }
                                const a = Math.abs(opposite - angle);
                                x = truncateFraction(offsetAngleX(angle, triangulate(a, 90 - a, hypotenuse(width, height))[1]));
                                y = truncateFraction(offsetAngleY(angle, triangulate(90, 90 - angle, x)[0]));
                            }
                            gradient = {
                                type,
                                repeating,
                                dimension,
                                angle,
                                angleExtent: { x, y }
                            };
                            gradient.colorStops = parseColorStops(node, gradient, match[4]);
                            break;
                        }
                        case 'radial': {
                            const position = getGradientPosition(direction);
                            const center = ResourceUI.getBackgroundPosition((position === null || position === void 0 ? void 0 : position[2]) || 'center', dimension, { fontSize: node.fontSize, imageDimension, screenDimension: node.localSettings.screenDimension });
                            const { left, top } = center;
                            const { width, height } = dimension;
                            let shape = 'ellipse', closestSide = top, farthestSide = top, closestCorner = Infinity, farthestCorner = -Infinity, radius = 0, radiusExtent = 0;
                            if (position) {
                                const name = (_a = position[1]) === null || _a === void 0 ? void 0 : _a.trim();
                                if (startsWith$4(name, 'circle')) {
                                    shape = 'circle';
                                }
                                else if (name) {
                                    const [radiusX, radiusY] = splitPair(name, ' ', true);
                                    let minRadius = Infinity;
                                    if (radiusX) {
                                        minRadius = node.parseWidth(radiusX, false);
                                    }
                                    if (radiusY) {
                                        minRadius = Math.min(node.parseHeight(radiusY, false), minRadius);
                                    }
                                    radius = minRadius;
                                    radiusExtent = minRadius;
                                    if (length === 1 || radiusX === radiusY) {
                                        shape = 'circle';
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
                                const extent = position && ((_b = position[1]) === null || _b === void 0 ? void 0 : _b.split(' ').pop()) || '';
                                switch (extent) {
                                    case 'closest-corner':
                                    case 'closest-side':
                                    case 'farthest-side': {
                                        const length = radial[convertCamelCase(extent)];
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
                            gradient = {
                                type,
                                dimension,
                                angle: getAngle(direction),
                                center: ResourceUI.getBackgroundPosition((position === null || position === void 0 ? void 0 : position[2]) || 'center', dimension, { fontSize: node.fontSize, imageDimension, screenDimension: node.localSettings.screenDimension })
                            };
                            gradient.colorStops = parseColorStops(node, gradient, match[4]);
                            break;
                        }
                    }
                    images.push(gradient || 'initial');
                }
                ++i;
            }
            REGEXP_BACKGROUNDIMAGE.lastIndex = 0;
            if (images.length) {
                return images;
            }
        }
        static getBackgroundSize(node, value, dimension) {
            switch (value) {
                case '':
                case 'cover':
                case 'contain':
                case '100% 100%':
                case 'auto':
                case 'auto auto':
                case 'initial':
                    return null;
                default: {
                    let width = NaN, height = NaN;
                    value.split(' ').forEach((size, index) => {
                        if (size === 'auto' && !dimension) {
                            size = '100%';
                        }
                        if (index === 0) {
                            width = node.parseWidth(size, false);
                        }
                        else {
                            height = node.parseHeight(size, false);
                        }
                    });
                    if (dimension) {
                        if (isNaN(width) && height) {
                            width = dimension.width * height / dimension.height;
                        }
                        if (isNaN(height) && width) {
                            height = dimension.height * width / dimension.width;
                        }
                    }
                    return width && height ? { width: Math.round(width), height: Math.round(height) } : null;
                }
            }
        }
        static hasLineBreak(node, lineBreak, trim) {
            if (node.naturalElements.length) {
                return node.naturalElements.some(item => item.lineBreak);
            }
            else if (!lineBreak && node.naturalChild) {
                let value = node.textContent;
                if (trim) {
                    value = value.trim();
                }
                return value.includes('\n') && (node.preserveWhiteSpace || node.plainText && node.actualParent.preserveWhiteSpace || node.css('whiteSpace') === 'pre-line');
            }
            return false;
        }
        static checkPreIndent(node) {
            if (node.plainText) {
                const parent = node.actualParent;
                if (parent.preserveWhiteSpace && parent.ancestors('pre', { startSelf: true }).length) {
                    let nextSibling = node.nextSibling;
                    if (nextSibling && nextSibling.naturalElement) {
                        const textContent = node.textContent;
                        if (isString$1(textContent)) {
                            const match = REGEXP_TRAILINGINDENT.exec(textContent);
                            if (match) {
                                if (!nextSibling.textElement) {
                                    nextSibling = nextSibling.find(item => item.naturalChild && item.textElement, { cascade: true, error: item => item.naturalChild && !item.textElement && item.isEmpty() });
                                }
                                if (nextSibling) {
                                    return [match[1] ? match[0] : '', nextSibling];
                                }
                            }
                        }
                    }
                }
            }
        }
        init(resourceId) {
            var _a;
            const data = (_a = ResourceUI.STORED)[resourceId] || (_a[resourceId] = {});
            data.ids = new Map();
            data.strings = new Map();
            data.arrays = new Map();
            data.fonts = new Map();
            data.colors = new Map();
            data.images = new Map();
            super.init(resourceId);
        }
        clear() {
            ResourceUI.STORED.length = 0;
            super.clear();
        }
        setData(rendering) {
            rendering.each(node => {
                if (node.hasResource(1 /* BOX_STYLE */)) {
                    this.setBoxStyle(node);
                }
                if (node.hasResource(8 /* VALUE_STRING */) && (node.visible && !node.imageContainer || node.labelFor)) {
                    if (node.hasResource(4 /* FONT_STYLE */)) {
                        this.setFontStyle(node);
                    }
                    this.setValueString(node);
                }
            });
        }
        writeRawImage(resourceId, filename, options) {
            let base64 = options.base64, content = options.content;
            if (base64 || content || options.buffer) {
                if (!base64) {
                    if (options.buffer) {
                        base64 = convertBase64(options.buffer);
                    }
                    else if (content && options.encoding === 'base64') {
                        base64 = startsWith$4(content, 'data:') ? splitPair(content, ',', true)[1] : content;
                    }
                    else {
                        return;
                    }
                }
                if (options.mimeType === 'image/svg+xml') {
                    content = window.atob(base64);
                    base64 = undefined;
                }
                else {
                    content = undefined;
                }
                const otherAssets = ResourceUI.ASSETS[resourceId].other;
                const pathname = appendSeparator(this.userSettings.outputDirectory, this.controllerSettings.directory.image);
                let result = otherAssets.find(item => item.pathname === pathname && item.filename === filename);
                if (result) {
                    if (content && result.content === content || base64 && result.base64 === base64) {
                        return result;
                    }
                    const ext = ResourceUI.getExtension(filename);
                    const basename = filename.substring(0, filename.length - ext.length);
                    let i = 1;
                    do {
                        filename = `${basename}_${i}.${ext}`;
                    } while (otherAssets.find(item => item.pathname === pathname && item.filename === filename) && ++i);
                }
                result = {
                    pathname,
                    filename,
                    content,
                    base64,
                    mimeType: options.mimeType,
                    width: options.width,
                    height: options.height,
                    tasks: options.tasks,
                    watch: options.watch
                };
                this.addAsset(resourceId, result);
                return result;
            }
        }
        writeRawSvg(resourceId, element, dimension) {
            const content = replaceSvgValues(element.outerHTML.trim().replace(/\s+/g, ' '), [element], dimension)
                .replace(/["']/g, (...capture) => '\\' + capture[0])
                .replace(/<!\d+/g, '<');
            const uri = 'data:image/svg+xml,' + content;
            this.addRawData(resourceId, uri, { mimeType: 'image/svg+xml', content });
            return uri;
        }
        setBoxStyle(node) {
            const visibleStyle = node.visibleStyle;
            if (visibleStyle.background) {
                const boxStyle = {};
                let borderWidth = visibleStyle.borderWidth, backgroundColor = node.backgroundColor, backgroundImage;
                if (borderWidth) {
                    setBorderStyle$2(node, boxStyle, 'borderTop', BORDER_TOP);
                    setBorderStyle$2(node, boxStyle, 'borderRight', BORDER_RIGHT);
                    setBorderStyle$2(node, boxStyle, 'borderBottom', BORDER_BOTTOM);
                    setBorderStyle$2(node, boxStyle, 'borderLeft', BORDER_LEFT);
                }
                if (visibleStyle.outline && setBorderStyle$2(node, boxStyle, 'outline', BORDER_OUTLINE)) {
                    borderWidth = true;
                }
                if (!backgroundColor && !node.documentParent.visible && node.has('backgroundColor')) {
                    backgroundColor = node.css('backgroundColor');
                }
                if (node.hasResource(16 /* IMAGE_SOURCE */)) {
                    const value = node.backgroundImage;
                    if (value) {
                        backgroundImage = ResourceUI.parseBackgroundImage(node, value);
                    }
                }
                if (backgroundColor || backgroundImage || borderWidth) {
                    const color = parseColor(backgroundColor);
                    if (color && (!color.transparent || node.inputElement)) {
                        boxStyle.backgroundColor = color;
                    }
                    boxStyle.backgroundImage = backgroundImage;
                    Object.assign(boxStyle, node.cssAsObject('backgroundSize', 'backgroundRepeat', 'backgroundPositionX', 'backgroundPositionY'));
                    if (setBackgroundOffset(node, boxStyle, 'backgroundClip')) {
                        setBackgroundOffset(node, boxStyle, 'backgroundOrigin');
                    }
                    if (node.css('borderRadius') !== '0px') {
                        const [borderTopLeftRadius, borderTopRightRadius, borderBottomRightRadius, borderBottomLeftRadius] = node.cssAsTuple('borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius');
                        const [A, B] = splitPair(borderTopLeftRadius, ' ');
                        const [C, D] = splitPair(borderTopRightRadius, ' ');
                        const [E, F] = splitPair(borderBottomRightRadius, ' ');
                        const [G, H] = splitPair(borderBottomLeftRadius, ' ');
                        const borderRadius = !B && !D && !F && !H ? [A, C, E, G] : [A, B || A, C, D || C, E, F || E, G, H || G];
                        const horizontal = node.actualWidth >= node.actualHeight;
                        const radius = borderRadius[0];
                        if (borderRadius.every(value => value === radius)) {
                            borderRadius.length = !radius || radius === '0px' ? 0 : 1;
                        }
                        const length = borderRadius.length;
                        if (length) {
                            const dimension = horizontal ? 'width' : 'height';
                            for (let i = 0; i < length; ++i) {
                                borderRadius[i] = formatPX$5(node.parseUnit(borderRadius[i], { dimension, parent: false }));
                            }
                            boxStyle.borderRadius = borderRadius;
                        }
                    }
                    node.data(ResourceUI.KEY_NAME, 'boxStyle', boxStyle);
                }
            }
            else if (visibleStyle.outline) {
                const boxStyle = {};
                if (setBorderStyle$2(node, boxStyle, 'outline', BORDER_OUTLINE)) {
                    node.data(ResourceUI.KEY_NAME, 'boxStyle', boxStyle);
                }
            }
        }
        setFontStyle(node) {
            if ((node.textElement || node.inlineText) && (!node.textEmpty || node.pseudoElement || node.visibleStyle.background) || node.inputElement && !node.controlElement) {
                let fontWeight = node.css('fontWeight');
                if (!isNumber$2(fontWeight)) {
                    switch (fontWeight) {
                        case 'lighter':
                        case 'bolder':
                            fontWeight = node.style.fontWeight;
                            break;
                        case 'bold':
                            fontWeight = '700';
                            break;
                        default:
                            fontWeight = '400';
                            break;
                    }
                }
                node.data(ResourceUI.KEY_NAME, 'fontStyle', {
                    fontFamily: node.css('fontFamily'),
                    fontStyle: node.css('fontStyle'),
                    fontSize: node.fontSize,
                    fontWeight,
                    color: parseColor(node.css('color'))
                });
            }
        }
        setValueString(node) {
            var _a, _b, _c;
            let value, trimming, inlined;
            if (node.naturalChild) {
                const element = node.element;
                let hint;
                switch (element.tagName) {
                    case 'INPUT':
                        value = getNamedItem$2(element, 'value');
                        switch (element.type) {
                            case 'radio':
                            case 'checkbox': {
                                const companion = node.companion;
                                if (companion && !companion.visible) {
                                    value = companion.textContent.trim();
                                }
                                break;
                            }
                            case 'submit':
                                if (!value && !node.visibleStyle.backgroundImage) {
                                    value = isUserAgent$1(4 /* FIREFOX */) ? 'Submit Query' : 'Submit';
                                }
                                break;
                            case 'reset':
                                if (!value && !node.visibleStyle.backgroundImage) {
                                    value = 'Reset';
                                }
                                break;
                            case 'time':
                                if (!value) {
                                    hint = '--:-- --';
                                }
                                break;
                            case 'date':
                            case 'datetime-local':
                                if (!value) {
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
                                if (!value) {
                                    hint = 'Week: --, ----';
                                }
                                break;
                            case 'month':
                                if (!value) {
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
                                if (!value) {
                                    hint = element.placeholder;
                                }
                                break;
                            case 'file':
                                value = isUserAgent$1(4 /* FIREFOX */) ? 'Browse...' : 'Choose File';
                                break;
                            case 'color': {
                                const borderColor = this.controllerSettings.style.inputColorBorderColor;
                                const backgroundColor = (parseColor(value) || parseColor('black')).valueAsRGBA;
                                const { width, height } = node.actualDimension;
                                const backgroundSize = `${width - 10}px ${height - 10}px, ${width - 8}px ${height - 8}px`;
                                const backgroundRepeat = 'no-repeat, no-repeat';
                                const backgroundPositionX = 'center, center';
                                const backgroundPositionY = 'center, center';
                                const backgroundImage = ResourceUI.parseBackgroundImage(node, `linear-gradient(${backgroundColor}, ${backgroundColor}), linear-gradient(${borderColor}, ${borderColor})`);
                                value = '';
                                let boxStyle = node.data(ResourceUI.KEY_NAME, 'boxStyle');
                                if (boxStyle) {
                                    if (boxStyle.backgroundImage) {
                                        boxStyle.backgroundSize = `${backgroundSize}, ${boxStyle.backgroundSize}`;
                                        boxStyle.backgroundRepeat = `${backgroundRepeat}, ${boxStyle.backgroundRepeat}`;
                                        boxStyle.backgroundPositionX = `${backgroundPositionX}, ${boxStyle.backgroundPositionX}`;
                                        boxStyle.backgroundPositionY = `${backgroundPositionY}, ${boxStyle.backgroundPositionY}`;
                                        boxStyle.backgroundImage.unshift(...backgroundImage);
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
                        hint = element.placeholder;
                        break;
                    case 'IFRAME':
                        value = element.src;
                        break;
                    default:
                        trimming = true;
                        if (node.plainText || node.pseudoElement || node.hasAlign(512 /* INLINE */) && node.textElement) {
                            value = trimming ? node.textContent.replace(/&/g, '&amp;') : node.textContent;
                            inlined = true;
                        }
                        else if (node.inlineText) {
                            value = node.textEmpty ? this.STRING_SPACE : node.tagName === 'BUTTON' ? node.textContent : this.removeExcludedText(node, element);
                        }
                        break;
                }
                if (hint) {
                    node.data(ResourceUI.KEY_NAME, 'hintString', hint);
                }
            }
            else if (node.inlineText) {
                value = node.textContent;
                trimming = true;
            }
            if (value) {
                value = this.preFormatString(value);
                switch (node.css('whiteSpace')) {
                    case 'pre':
                    case 'pre-wrap': {
                        if (!node.renderParent.layoutVertical) {
                            value = value.replace(/^\s*\n/, '');
                        }
                        const preIndent = ResourceUI.checkPreIndent(node);
                        if (preIndent) {
                            const [indent, adjacent] = preIndent;
                            if (indent) {
                                adjacent.textContent = indent + adjacent.textContent;
                            }
                            value = value.replace(REGEXP_TRAILINGINDENT, '');
                        }
                    }
                    case 'break-spaces':
                        value = value
                            .replace(/\n/g, this.STRING_NEWLINE)
                            .replace(/\t/g, this.STRING_SPACE.repeat(node.toInt('tabSize', 8)))
                            .replace(/\s/g, this.STRING_SPACE);
                        trimming = false;
                        break;
                    case 'pre-line':
                        value = value
                            .replace(/\n/g, this.STRING_NEWLINE)
                            .replace(/\s{2,}/g, ' ');
                        trimming = false;
                        break;
                    case 'nowrap':
                        inlined = true;
                    default:
                        value = value
                            .replace(/\n+/g, ' ')
                            .replace(/\s{2,}/g, ' ');
                        if (node.onlyChild && node.htmlElement) {
                            value = value
                                .replace(CHAR_LEADINGSPACE, '')
                                .replace(CHAR_TRAILINGSPACE, '');
                        }
                        else if (!node.naturalChild) {
                            if (!node.horizontalRowStart) {
                                const element = node.element;
                                const previousSibling = element && element.previousSibling;
                                if (previousSibling instanceof HTMLElement && !hasEndingSpace(previousSibling) && startsWith$4(element.textContent.trim(), value.trim())) {
                                    value = value.replace(CHAR_LEADINGSPACE, this.STRING_SPACE);
                                    break;
                                }
                            }
                            if (checkPreviousSibling(node.siblingsLeading[0])) {
                                value = value.replace(CHAR_LEADINGSPACE, '');
                            }
                        }
                        else {
                            if (node.horizontalRowStart || ((_a = node.previousSibling) === null || _a === void 0 ? void 0 : _a.blockStatic)) {
                                value = value.replace(CHAR_LEADINGSPACE, '');
                            }
                            if ((_b = node.nextSibling) === null || _b === void 0 ? void 0 : _b.blockStatic) {
                                value = value.replace(CHAR_TRAILINGSPACE, '');
                            }
                        }
                        break;
                }
            }
            else if (node.naturalChildren.length === 0 && !node.hasPX('height') && ResourceUI.isBackgroundVisible(node.data(ResourceUI.KEY_NAME, 'boxStyle')) && !isString$1(node.textContent)) {
                value = node.textContent;
            }
            if (value) {
                if (trimming) {
                    if (!node.naturalChild) {
                        value = value.replace(CHAR_TRAILINGSPACE, node.horizontalRowEnd ? '' : this.STRING_SPACE);
                    }
                    else if (node.pageFlow) {
                        const previousSibling = node.siblingsLeading[0];
                        const nextSibling = node.siblingsTrailing.find(item => !item.excluded || item.lineBreak);
                        let previousSpaceEnd;
                        if (value.length > 1) {
                            if (checkPreviousSibling(previousSibling)) {
                                value = value.replace(CHAR_LEADINGSPACE, '');
                            }
                            else if (previousSibling.naturalElement) {
                                previousSpaceEnd = hasEndingSpace(previousSibling.element) || ((_c = previousSibling.lastStaticChild) === null || _c === void 0 ? void 0 : _c.lineBreak);
                            }
                        }
                        if (inlined) {
                            const trailingSpace = !node.lineBreakTrailing && CHAR_TRAILINGSPACE.test(value);
                            if (CHAR_LEADINGSPACE.test(value) && previousSibling && !previousSibling.block && !previousSibling.lineBreak && !previousSpaceEnd) {
                                value = this.STRING_SPACE + value.trim();
                            }
                            else {
                                value = value.trim();
                            }
                            if (trailingSpace && nextSibling && !nextSibling.blockStatic && !nextSibling.floating) {
                                value += this.STRING_SPACE;
                            }
                        }
                        else if (value.trim()) {
                            value = value
                                .replace(CHAR_LEADINGSPACE, previousSibling && (previousSibling.block ||
                                previousSibling.lineBreak ||
                                previousSpaceEnd && previousSibling.htmlElement && previousSibling.textContent.length > 1 ||
                                node.multiline && ResourceUI.hasLineBreak(node))
                                ? ''
                                : this.STRING_SPACE)
                                .replace(CHAR_TRAILINGSPACE, node.display === 'table-cell' || node.lineBreakTrailing || node.blockStatic || nextSibling && nextSibling.floating ? '' : this.STRING_SPACE);
                        }
                        else if (!node.inlineText) {
                            return;
                        }
                    }
                    else {
                        value = value.trim();
                    }
                }
                if (value) {
                    node.data(ResourceUI.KEY_NAME, 'valueString', value);
                }
            }
        }
        preFormatString(value) {
            return value.replace(/\u00A0/g, this.STRING_SPACE);
        }
        removeExcludedText(node, element) {
            const { preserveWhiteSpace, sessionId } = node;
            const styled = element.children.length > 0 || element.tagName === 'CODE';
            const attr = styled ? 'innerHTML' : 'textContent';
            let value = element[attr] || '';
            element.childNodes.forEach((item, index) => {
                const child = getElementAsNode$1(item, sessionId);
                if (!child || !child.textElement || child.pseudoElement || !child.pageFlow || child.positioned || child.excluded) {
                    if (child) {
                        if (styled && child.htmlElement) {
                            if (child.lineBreak) {
                                const previousSibling = child.previousSibling;
                                value = value.replace(!preserveWhiteSpace ? new RegExp(`\\s*${escapePattern(item.outerHTML)}\\s*`) : item.outerHTML, child.lineBreakTrailing && previousSibling && previousSibling.inlineStatic || !previousSibling && !node.pageFlow ? '' : this.STRING_NEWLINE);
                            }
                            else if (child.positioned) {
                                value = value.replace(item.outerHTML, '');
                            }
                            else if (child.display === 'contents') {
                                value = value.replace(item.outerHTML, child.textContent);
                            }
                            else if (!preserveWhiteSpace) {
                                value = value.replace(item.outerHTML, child.pageFlow && isString$1(child.textContent) ? this.STRING_SPACE : '');
                            }
                            return;
                        }
                        const textContent = child.plainText ? child.textContent : child[attr];
                        if (textContent) {
                            if (!preserveWhiteSpace) {
                                value = value.replace(textContent, '');
                            }
                            return;
                        }
                    }
                    else if (item.nodeName[0] !== '#') {
                        value = value.replace(item.outerHTML, item.tagName === 'WBR' ? this.STRING_WBR : !hasCoords$3(getComputedStyle(item).position) && isString$1(item.textContent) ? this.STRING_SPACE : '');
                    }
                    if (!preserveWhiteSpace) {
                        if (index === 0) {
                            value = value.replace(CHAR_LEADINGSPACE, '');
                        }
                        else if (index === length - 1) {
                            value = value.replace(CHAR_TRAILINGSPACE, '');
                        }
                    }
                }
            });
            if (!styled) {
                return value;
            }
            else if (!preserveWhiteSpace && !value.trim()) {
                return node.blockStatic ? this.STRING_SPACE : '';
            }
            return value;
        }
        get controllerSettings() {
            return this.application.controllerHandler.localSettings;
        }
        get STRING_SPACE() {
            return '&#160;';
        }
        get STRING_NEWLINE() {
            return '&#10;';
        }
        get STRING_WBR() {
            return '&#8203;';
        }
    }
    ResourceUI.STORED = [];

    class ContentUI {
        constructor(parent, node, containerType = 0, alignmentType = 0) {
            this.parent = parent;
            this.node = node;
            this.containerType = containerType;
            this.alignmentType = alignmentType;
        }
        set itemCount(value) { }
        get itemCount() { return 0; }
    }

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

    const { CSS_PROPERTIES: CSS_PROPERTIES$1, isPx: isPx$2 } = squared.lib.css;
    const { createElement, getRangeClientRect } = squared.lib.dom;
    const { equal } = squared.lib.math;
    const { getElementAsNode } = squared.lib.session;
    const { cloneObject, hasKeys, isArray, isEmptyString, startsWith: startsWith$3, withinRange: withinRange$3 } = squared.lib.util;
    const CSS_SPACINGINDEX = [1 /* MARGIN_TOP */, 2 /* MARGIN_RIGHT */, 4 /* MARGIN_BOTTOM */, 8 /* MARGIN_LEFT */, 16 /* PADDING_TOP */, 32 /* PADDING_RIGHT */, 64 /* PADDING_BOTTOM */, 128 /* PADDING_LEFT */];
    function cascadeActualPadding(children, attr, value) {
        let valid = false;
        for (let i = 0, length = children.length; i < length; ++i) {
            const item = children[i];
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
                    valid = true;
                }
            }
        }
        return valid;
    }
    function traverseElementSibling(element, direction, sessionId, options) {
        const result = [];
        let i = 0, floating, pageFlow, lineBreak, excluded;
        while (element) {
            if (i++) {
                const node = getElementAsNode(element, sessionId);
                if (node) {
                    if (lineBreak !== false && node.lineBreak || excluded !== false && node.excluded && !node.lineBreak) {
                        result.push(node);
                    }
                    else if (node.pageFlow && !node.excluded) {
                        if (pageFlow === false) {
                            break;
                        }
                        result.push(node);
                        if (floating || !node.floating && (node.visible || node.rendered) && node.display !== 'none') {
                            break;
                        }
                    }
                }
            }
            else if (options) {
                ({ floating, pageFlow, lineBreak, excluded } = options);
            }
            element = element[direction];
        }
        return result;
    }
    function applyBoxReset(node, start, region, other) {
        const boxReset = node.boxReset;
        for (let i = start; i < start + 4; ++i) {
            const key = CSS_SPACINGINDEX[i];
            if (region & key) {
                boxReset[i] = 1;
                if (other) {
                    const previous = node.registerBox(key);
                    if (previous) {
                        previous.resetBox(key, other);
                    }
                    else {
                        if (node.naturalChild) {
                            const value = getBoxOffset(node, i);
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
    function applyBoxAdjustment(node, start, region, other, boxAdjustment) {
        for (let i = start; i < start + 4; ++i) {
            const key = CSS_SPACINGINDEX[i];
            if (region & key) {
                const previous = node.registerBox(key);
                if (previous) {
                    previous.transferBox(key, other);
                }
                else {
                    if (boxAdjustment) {
                        const value = boxAdjustment[i];
                        if (value !== 0) {
                            other.modifyBox(key, value, false);
                            boxAdjustment[i] = 0;
                        }
                    }
                    node.registerBox(key, other);
                }
            }
        }
    }
    function getBoxSpacing(value) {
        switch (value) {
            case 1 /* MARGIN_TOP */:
                return 0;
            case 2 /* MARGIN_RIGHT */:
                return 1;
            case 4 /* MARGIN_BOTTOM */:
                return 2;
            case 8 /* MARGIN_LEFT */:
                return 3;
            case 16 /* PADDING_TOP */:
                return 4;
            case 32 /* PADDING_RIGHT */:
                return 5;
            case 64 /* PADDING_BOTTOM */:
                return 6;
            case 128 /* PADDING_LEFT */:
                return 7;
        }
        return NaN;
    }
    function getBoxOffset(node, index) {
        switch (index) {
            case 0:
                return node.marginTop;
            case 1:
                return node.marginRight;
            case 2:
                return node.marginBottom;
            case 3:
                return node.marginLeft;
            case 4:
                return node.paddingTop;
            case 5:
                return node.paddingRight;
            case 6:
                return node.paddingBottom;
            case 7:
                return node.paddingLeft;
            default:
                return 0;
        }
    }
    function setOverflow(node) {
        let result = 0;
        if (node.scrollElement) {
            const element = node.element;
            const [overflowX, overflowY] = node.cssAsTuple('overflowX', 'overflowY');
            if (node.hasHeight && (node.hasPX('height') || node.hasPX('maxHeight')) && (overflowY === 'scroll' || overflowY === 'auto' && element.clientHeight !== element.scrollHeight)) {
                result |= 8 /* VERTICAL */;
            }
            if ((node.hasPX('width') || node.hasPX('maxWidth')) && (overflowX === 'scroll' || overflowX === 'auto' && element.clientWidth !== element.scrollWidth)) {
                result |= 4 /* HORIZONTAL */;
            }
        }
        return result;
    }
    function applyExclusionValue(enumeration, value) {
        let offset = 0;
        if (value) {
            for (const name of value.split('|')) {
                offset |= enumeration[name.trim().toUpperCase()] || 0;
            }
        }
        return offset;
    }
    const canCascadeChildren = (node) => node.naturalElements.length > 0 && !node.layoutElement && !node.tableElement;
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
            this.contentAltered = false;
            this.visible = true;
            this.renderChildren = [];
            this.renderParent = null;
            this.renderExtension = null;
            this.renderTemplates = null;
            this.renderedAs = null;
            this._preferInitial = true;
            this._boxRegister = null;
            this._documentParent = null;
            this._locked = null;
            this._siblingsLeading = null;
            this._siblingsTrailing = null;
        }
        static baseline(list, text, image) {
            const result = [];
            for (let i = 0, length = list.length; i < length; ++i) {
                const item = list[i];
                if (item.naturalElements.length && !item.baselineElement || image && item.imageContainer) {
                    continue;
                }
                if (item.baseline && !item.baselineAltered && (!text || item.textElement)) {
                    result.push(item);
                }
            }
            if (result.length > 1) {
                result.sort((a, b) => {
                    const vA = a.css('verticalAlign') === 'baseline';
                    const vB = b.css('verticalAlign') === 'baseline';
                    if (vA && !vB) {
                        return -1;
                    }
                    else if (vB && !vA) {
                        return 1;
                    }
                    const renderA = a.rendering;
                    const renderB = b.rendering;
                    if (!renderA) {
                        if (renderB && b.find(item => item.css('verticalAlign') !== 'baseline')) {
                            return -1;
                        }
                    }
                    else if (!renderB && a.find(item => item.css('verticalAlign') !== 'baseline')) {
                        return 1;
                    }
                    if (renderA && a.baselineElement) {
                        a = a.max('baselineHeight', { self: true, wrapperOf: true });
                    }
                    if (renderB && b.baselineElement) {
                        b = b.max('baselineHeight', { self: true, wrapperOf: true });
                    }
                    const imageA = a.imageContainer;
                    const imageB = b.imageContainer;
                    if (!imageA && imageB) {
                        return -1;
                    }
                    else if (!imageB && imageA) {
                        return 1;
                    }
                    const heightA = a.baselineHeight;
                    const heightB = b.baselineHeight;
                    if (!equal(heightA, heightB)) {
                        return heightB - heightA;
                    }
                    else if (!imageA && !imageB) {
                        const textA = a.textElement;
                        const textB = b.textElement;
                        if (textA && textB) {
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
                        else if (a.containerType !== b.containerType && a.inputElement && b.inputElement) {
                            return b.containerType - a.containerType;
                        }
                        else if (textA && !textB && a.childIndex < b.childIndex) {
                            return -1;
                        }
                        else if (textB && !textA && b.childIndex < a.childIndex) {
                            return 1;
                        }
                    }
                    return 0;
                });
            }
            return result[0] || null;
        }
        static linearData(list, cleared) {
            let linearX = false, linearY = false;
            const length = list.length;
            if (length > 1) {
                const nodes = [];
                let floated;
                for (let i = 0; i < length; ++i) {
                    const item = list[i];
                    if (item.pageFlow) {
                        if (item.floating) {
                            (floated || (floated = new Set())).add(item.float);
                        }
                    }
                    else if (!item.autoPosition) {
                        continue;
                    }
                    nodes.push(item);
                }
                const n = nodes.length;
                if (n) {
                    const siblings = [nodes[0]];
                    let x = 1, y = 1;
                    for (let i = 1; i < n; ++i) {
                        const node = nodes[i];
                        if (node.alignedVertically(siblings, floated ? cleared : null)) {
                            ++y;
                        }
                        else {
                            ++x;
                        }
                        if (x > 1 && y > 1) {
                            break;
                        }
                        siblings.push(node);
                    }
                    linearX = x === n;
                    linearY = y === n;
                    if (floated) {
                        if (linearX) {
                            let boxLeft = Infinity, boxRight = -Infinity, floatLeft = -Infinity, floatRight = Infinity;
                            for (let i = 0; i < n; ++i) {
                                const node = nodes[i];
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
                            for (let i = 0, j = 0, k = 0, l = 0, m = 0; i < n; ++i) {
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
                                if (withinRange$3(left, previous.linear.left) || previous.floating && Math.ceil(node.bounds.top) >= previous.bounds.bottom) {
                                    linearX = false;
                                    break;
                                }
                            }
                        }
                    }
                    return { linearX, linearY, floated };
                }
            }
            else if (length) {
                linearY = list[0].blockStatic;
                linearX = !linearY;
            }
            return { linearX, linearY };
        }
        static partitionRows(list, cleared) {
            const result = [];
            let row = [], siblings = [];
            for (let i = 0, length = list.length; i < length; ++i) {
                const node = list[i];
                let active = node;
                if (!node.naturalChild) {
                    if (node.nodeGroup) {
                        if (row.length) {
                            result.push(row);
                        }
                        result.push([node]);
                        row = [];
                        siblings = [];
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
                else if (active.alignedVertically(siblings, cleared)) {
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
            const obj = this.namespace(name);
            if (value) {
                if (overwrite && this.lockedAttr(name, attr)) {
                    overwrite = false;
                }
                if (!overwrite && obj[attr]) {
                    return obj[attr];
                }
                obj[attr] = value;
                return value;
            }
            return obj[attr] || '';
        }
        delete(name, ...attrs) {
            const obj = this._namespaces[name];
            if (obj) {
                for (let i = 0, length = attrs.length; i < length; ++i) {
                    const attr = attrs[i];
                    if (attr.includes('*')) {
                        for (const item of searchObject(obj, attr, true)) {
                            delete obj[item[0]];
                        }
                    }
                    else {
                        delete obj[attr];
                    }
                }
            }
        }
        namespace(name) {
            var _a;
            return (_a = this._namespaces)[name] || (_a[name] = {});
        }
        namespaces() {
            return Object.entries(this._namespaces);
        }
        unsafe(name, value) {
            if (arguments.length === 1) {
                if (typeof name === 'string') {
                    return this['_' + name];
                }
                for (const attr in name) {
                    this['_' + attr] = name[attr];
                }
            }
            else {
                return this['_' + name] = value;
            }
        }
        lockAttr(name, attr) {
            var _a;
            ((_a = (this._locked || (this._locked = {})))[name] || (_a[name] = {}))[attr] = true;
        }
        unlockAttr(name, attr) {
            const locked = this._locked;
            if (locked) {
                const data = locked[name];
                if (data) {
                    data[attr] = false;
                }
            }
        }
        lockedAttr(name, attr) {
            var _a, _b;
            return !!((_b = (_a = this._locked) === null || _a === void 0 ? void 0 : _a[name]) === null || _b === void 0 ? void 0 : _b[attr]);
        }
        render(parent) {
            this.renderParent = parent;
            this.rendered = true;
        }
        parseUnit(value, options) {
            var _a;
            if (!value) {
                return 0;
            }
            else if (isPx$2(value)) {
                return parseFloat(value);
            }
            (_a = (options || (options = {}))).screenDimension || (_a.screenDimension = this.localSettings.screenDimension);
            return super.parseUnit(value, options);
        }
        parseWidth(value, parent) {
            return this.parseUnit(value, { parent });
        }
        parseHeight(value, parent) {
            return this.parseUnit(value, { dimension: 'height', parent });
        }
        renderEach(predicate) {
            const children = this.renderChildren;
            for (let i = 0, length = children.length; i < length; ++i) {
                predicate(children[i], i, children);
            }
            return this;
        }
        hide(options) {
            this.rendered = true;
            this.visible = false;
            return options && options.remove ? this.removeTry(options) : null;
        }
        inherit(node, ...modules) {
            let result = null;
            for (const module of modules) {
                switch (module) {
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
                        if (result = node.initial) {
                            this.inheritApply('initial', result);
                        }
                        break;
                    case 'alignment':
                        this.cssCopy(node, 'position', 'display', 'verticalAlign', 'float', 'clear', 'zIndex');
                        if (!this.positionStatic) {
                            const setPosition = (attr) => {
                                if (node.hasPX(attr)) {
                                    this._styleMap[attr] = node.css(attr);
                                }
                            };
                            setPosition('top');
                            setPosition('right');
                            setPosition('bottom');
                            setPosition('left');
                        }
                        Object.assign(this.autoMargin, node.autoMargin);
                        this.autoPosition = node.autoPosition;
                        break;
                    case 'styleMap':
                        this.cssCopyIfEmpty(node, ...Object.keys(node.unsafe('styleMap')));
                        break;
                    case 'textStyle':
                        result = node.textStyle;
                        result.fontSize = node.fontSize + 'px';
                        this.cssApply(result);
                        break;
                    case 'boxStyle': {
                        if (this.naturalElement) {
                            const properties = [];
                            if (!this.backgroundImage) {
                                properties.push(...CSS_PROPERTIES$1.background.value);
                                --properties.length;
                            }
                            if (this.borderTopWidth === 0) {
                                properties.push(...CSS_PROPERTIES$1.borderTop.value);
                            }
                            if (this.borderRightWidth === 0) {
                                properties.push(...CSS_PROPERTIES$1.borderRight.value);
                            }
                            if (this.borderBottomWidth === 0) {
                                properties.push(...CSS_PROPERTIES$1.borderBottom.value);
                            }
                            if (this.borderLeftWidth === 0) {
                                properties.push(...CSS_PROPERTIES$1.borderLeft.value);
                            }
                            if (this.cssAny('backgroundColor', ['none', 'transparent', 'rgba(0, 0, 0, 0)'])) {
                                properties.push('backgroundColor');
                            }
                            if (this.css('borderRadius') === '0px') {
                                properties.push(...CSS_PROPERTIES$1.borderRadius.value);
                            }
                            this.cssCopy(node, ...properties);
                        }
                        else {
                            result = node.cssAsObject('backgroundRepeat', 'backgroundSize', 'backgroundPositionX', 'backgroundPositionY', 'backgroundClip', 'boxSizing', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'borderTopStyle', 'borderRightStyle', 'borderBottomStyle', 'borderLeftStyle', 'borderRadius', 'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius');
                            result.backgroundColor = node.backgroundColor;
                            result.backgroundImage = node.backgroundImage;
                            this.inheritApply('boxStyle', result);
                        }
                        this.setCacheValue('visibleStyle', undefined);
                        node.setCacheValue('backgroundColor', '');
                        node.setCacheValue('backgroundImage', '');
                        node.cssApply({
                            backgroundColor: 'transparent',
                            backgroundImage: 'none',
                            borderRadius: '0px'
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
                    this._initial = this._initial ? cloneObject(data, { target: this._initial }) : Object.assign({}, data);
                    break;
                case 'textStyle':
                    this.cssApply(data);
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
            this.alignmentType |= value;
        }
        removeAlign(value) {
            this.alignmentType &= ~value;
        }
        hasAlign(value) {
            return (this.alignmentType & value) > 0;
        }
        hasResource(value) {
            return !this._exclusions || !(this._exclusions[0] & value);
        }
        hasProcedure(value) {
            return !this._exclusions || !(this._exclusions[1] & value);
        }
        hasSection(value) {
            return !this._exclusions || !(this._exclusions[2] & value);
        }
        exclude(options) {
            const { resource, procedure, section } = options;
            const exclusions = this._exclusions || (this._exclusions = [0, 0, 0]);
            if (resource) {
                exclusions[0] |= resource;
            }
            if (procedure) {
                exclusions[1] |= procedure;
            }
            if (section) {
                exclusions[2] |= section;
            }
        }
        setExclusions() {
            if (this.naturalElement) {
                const dataset = this._element.dataset;
                if (hasKeys(dataset)) {
                    const systemName = this.localSettings.systemName;
                    const exclusions = this._exclusions || (this._exclusions = [0, 0, 0]);
                    exclusions[0] |= applyExclusionValue(NODE_RESOURCE, dataset['excludeResource' + systemName] || dataset.excludeResource);
                    exclusions[1] |= applyExclusionValue(NODE_PROCEDURE, dataset['excludeProcedure' + systemName] || dataset.excludeProcedure);
                    exclusions[2] |= applyExclusionValue(APP_SECTION, dataset['excludeSection' + systemName] || dataset.excludeSection);
                    if (!this.isEmpty()) {
                        const resource = applyExclusionValue(NODE_RESOURCE, dataset['excludeResourceChild' + systemName] || dataset.excludeResourceChild);
                        const procedure = applyExclusionValue(NODE_PROCEDURE, dataset['excludeProcedureChild' + systemName] || dataset.excludeProcedureChild);
                        const section = applyExclusionValue(APP_SECTION, dataset['excludeSectionChild' + systemName] || dataset.excludeSectionChild);
                        if (resource || procedure || section) {
                            const data = { resource, procedure, section };
                            this.each((node) => node.exclude(data));
                        }
                    }
                }
            }
        }
        replaceTry(options) {
            var _a;
            const { child, replaceWith } = options;
            const children = this.children;
            for (let i = 0, length = children.length; i < length; ++i) {
                const item = children[i];
                if (item === child || item === child.outerMostWrapper) {
                    (_a = replaceWith.parent) === null || _a === void 0 ? void 0 : _a.remove(replaceWith);
                    let childIndex;
                    if (replaceWith.naturalChild && this.naturalElement) {
                        childIndex = child.childIndex;
                        replaceWith.actualParent.naturalChildren.splice(replaceWith.childIndex, 1);
                        this.naturalChildren.splice(childIndex, 1, replaceWith);
                    }
                    replaceWith.init(this, child.depth, childIndex);
                    children[i] = replaceWith;
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
            const renderParent = this.renderParent;
            if (renderParent) {
                const { renderTemplates, renderChildren } = renderParent;
                if (renderTemplates) {
                    const index = renderChildren.findIndex(node => node === this);
                    if (index !== -1) {
                        const template = renderTemplates[index];
                        if (template.node === this) {
                            let replaceWith, beforeReplace;
                            if (options) {
                                ({ replaceWith, beforeReplace } = options);
                            }
                            if (replaceWith) {
                                const replaceParent = replaceWith.renderParent;
                                if (replaceParent) {
                                    const replaceTemplates = replaceParent.renderTemplates;
                                    if (replaceTemplates) {
                                        const replaceIndex = replaceTemplates.findIndex(item => item.node === replaceWith);
                                        if (replaceIndex !== -1) {
                                            if (beforeReplace) {
                                                beforeReplace(this, replaceWith);
                                            }
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
                                            this.renderParent = null;
                                            return template;
                                        }
                                    }
                                }
                            }
                            else {
                                if (beforeReplace) {
                                    beforeReplace(this);
                                }
                                renderChildren.splice(index, 1);
                                this.renderParent = null;
                                return renderTemplates.splice(index, 1)[0];
                            }
                        }
                    }
                }
            }
            return null;
        }
        alignedVertically(siblings, cleared, horizontal) {
            if (this.lineBreak) {
                return 2 /* LINEBREAK */;
            }
            else if (!this.pageFlow) {
                if (this.autoPosition) {
                    siblings || (siblings = this.siblingsLeading);
                    for (let i = siblings.length - 1; i >= 0; --i) {
                        const previous = siblings[i];
                        if (previous.pageFlow) {
                            return previous.blockStatic || cleared && cleared.has(previous) ? 1 /* VERTICAL */ : 0 /* HORIZONTAL */;
                        }
                    }
                    return 0 /* HORIZONTAL */;
                }
                return 1 /* VERTICAL */;
            }
            const floating = this.floating;
            const checkBlockDimension = (previous) => this.blockDimension && Math.ceil(this.bounds.top) >= previous.bounds.bottom && (this.blockVertical || previous.blockVertical || this.percentWidth > 0 || previous.percentWidth > 0);
            if (isArray(siblings)) {
                const previous = siblings[siblings.length - 1];
                const getPercentWidth = (node) => node.inlineDimension && !node.hasPX('maxWidth') ? node.percentWidth : -Infinity;
                if (cleared) {
                    if (cleared.size && (cleared.has(this) || this.siblingsLeading.some(item => item.excluded && cleared.has(item)))) {
                        return 4 /* FLOAT_CLEAR */;
                    }
                    else if (floating && previous.floating) {
                        if (horizontal && this.float === previous.float || Math.floor(this.bounds.top) === Math.floor(previous.bounds.top)) {
                            return 0 /* HORIZONTAL */;
                        }
                        else if (Math.ceil(this.bounds.top) >= previous.bounds.bottom) {
                            if (siblings.every(item => item.inlineDimension)) {
                                const parent = this.actualParent;
                                if (parent.ascend({ condition: item => !item.inline && item.hasWidth, error: (item) => item.layoutElement, startSelf: true })) {
                                    const length = siblings.length;
                                    if (parent.naturalChildren.filter((item) => item.visible && item.pageFlow).length === length + 1) {
                                        const getLayoutWidth = (node) => node.actualWidth + Math.max(node.marginLeft, 0) + node.marginRight;
                                        let width = parent.box.width - getLayoutWidth(this);
                                        for (let i = 0; i < length; ++i) {
                                            width -= getLayoutWidth(siblings[i]);
                                        }
                                        if (width >= 0) {
                                            return 0 /* HORIZONTAL */;
                                        }
                                    }
                                }
                            }
                            return 6 /* FLOAT_WRAP */;
                        }
                    }
                    else if (this.blockStatic && siblings.reduce((a, b) => a + (b.floating ? b.linear.width : -Infinity), 0) / this.actualParent.box.width >= 0.8) {
                        return 7 /* FLOAT_INTERSECT */;
                    }
                    else if (siblings.every(item => item.inlineDimension && Math.ceil(this.bounds.top) >= item.bounds.bottom)) {
                        return 5 /* FLOAT_BLOCK */;
                    }
                    else if (horizontal !== undefined) {
                        if (floating && !horizontal && previous.blockStatic) {
                            return 0 /* HORIZONTAL */;
                        }
                        else if (!startsWith$3(this.display, 'inline-')) {
                            let { top, bottom } = this.bounds;
                            if (this.textElement && cleared.size && siblings.some(item => cleared.has(item)) && siblings.some(item => Math.floor(top) < item.bounds.top && Math.ceil(bottom) > item.bounds.bottom)) {
                                return 7 /* FLOAT_INTERSECT */;
                            }
                            else if (siblings[0].floating) {
                                const length = siblings.length;
                                if (length > 1) {
                                    const float = siblings[0].float;
                                    let maxBottom = -Infinity, contentWidth = 0;
                                    for (let i = 0; i < length; ++i) {
                                        const item = siblings[i];
                                        if (item.floating) {
                                            if (item.float === float) {
                                                maxBottom = Math.max(item.actualRect('bottom', 'bounds'), maxBottom);
                                            }
                                            contentWidth += item.linear.width;
                                        }
                                    }
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
                                        top = offset <= 0 || offset / (bottom - top) < 0.5 ? -Infinity : Infinity;
                                    }
                                    else {
                                        top = Math.ceil(top);
                                    }
                                    if (top < Math.floor(maxBottom)) {
                                        return horizontal ? 0 /* HORIZONTAL */ : 5 /* FLOAT_BLOCK */;
                                    }
                                    return horizontal ? 5 /* FLOAT_BLOCK */ : 0 /* HORIZONTAL */;
                                }
                                else if (!horizontal) {
                                    return 5 /* FLOAT_BLOCK */;
                                }
                            }
                        }
                    }
                }
                if (checkBlockDimension(previous)) {
                    return 3 /* INLINE_WRAP */;
                }
                const percentWidth = getPercentWidth(this);
                if (percentWidth > 0 && siblings.reduce((a, b) => a + getPercentWidth(b), percentWidth) > 1) {
                    return 8 /* PERCENT_WRAP */;
                }
            }
            const blockStatic = this.blockStatic || this.display === 'table';
            const length = this.siblingsLeading.length;
            if (blockStatic && length === 0) {
                return 1 /* VERTICAL */;
            }
            for (let i = length - 1; i >= 0; --i) {
                const previous = this.siblingsLeading[i];
                if (previous.excluded && cleared && cleared.has(previous)) {
                    return 4 /* FLOAT_CLEAR */;
                }
                else if (previous.blockStatic || previous.autoMargin.leftRight || (horizontal === false || floating && previous.childIndex === 0) && previous.plainText && previous.multiline) {
                    return 1 /* VERTICAL */;
                }
                else if (blockStatic && (!previous.floating || cleared && cleared.has(previous) || i === length - 1 && !previous.pageFlow)) {
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
                    if (this.floatContainer && this.find(item => item.floating && Math.ceil(item.bounds.top) >= previous.bounds.bottom)) {
                        return 5 /* FLOAT_BLOCK */;
                    }
                }
                if (checkBlockDimension(previous)) {
                    return 3 /* INLINE_WRAP */;
                }
            }
            return 0 /* HORIZONTAL */;
        }
        previousSiblings(options) {
            return traverseElementSibling(this.innerMostWrapped.element, 'previousSibling', this.sessionId, options);
        }
        nextSiblings(options) {
            return traverseElementSibling(this.innerMostWrapped.element, 'nextSibling', this.sessionId, options);
        }
        modifyBox(region, value, negative = true) {
            var _a;
            if (value !== 0) {
                const index = getBoxSpacing(region);
                const node = (_a = this._boxRegister) === null || _a === void 0 ? void 0 : _a[index];
                if (node) {
                    node.modifyBox(region, value, negative);
                }
                else {
                    const boxReset = this.boxReset;
                    const boxAdjustment = this.boxAdjustment;
                    if (!negative && (boxReset[index] === 0 ? getBoxOffset(this, index) : 0) + boxAdjustment[index] + value <= 0) {
                        boxAdjustment[index] = 0;
                        if (value < 0 && getBoxOffset(this, index) >= 0) {
                            boxReset[index] = 1;
                        }
                    }
                    else {
                        boxAdjustment[index] += value;
                    }
                }
            }
        }
        getBox(region) {
            const index = getBoxSpacing(region);
            return [this._boxReset ? this._boxReset[index] : 0, this._boxAdjustment ? this._boxAdjustment[index] : 0];
        }
        setBox(region, options) {
            var _a;
            const index = getBoxSpacing(region);
            const node = (_a = this._boxRegister) === null || _a === void 0 ? void 0 : _a[index];
            if (node) {
                node.setBox(region, options);
            }
            else {
                const reset = options.reset;
                if (reset !== undefined) {
                    this.boxReset[index] = reset;
                }
                let value = options.adjustment;
                if (value !== undefined) {
                    const boxAdjustment = this.boxAdjustment;
                    if (options.max) {
                        boxAdjustment[index] = Math.max(value, boxAdjustment[index]);
                    }
                    else if (options.min) {
                        boxAdjustment[index] = Math.min(value, boxAdjustment[index] || Infinity);
                    }
                    else {
                        if (options.accumulate) {
                            value += boxAdjustment[index];
                        }
                        if (options.negative === false) {
                            if ((!this._boxReset || this.boxReset[index] === 0 ? getBoxOffset(this, index) : 0) + value <= 0) {
                                if (value < 0 && getBoxOffset(this, index) >= 0) {
                                    this.boxReset[index] = 1;
                                }
                                value = 0;
                            }
                        }
                        boxAdjustment[index] = value;
                    }
                }
                else if (reset === 1 && !this.naturalChild) {
                    this.boxAdjustment[index] = 0;
                }
            }
        }
        resetBox(region, node) {
            if (15 /* MARGIN */ & region) {
                applyBoxReset(this, 0, region, node);
            }
            if (240 /* PADDING */ & region) {
                applyBoxReset(this, 4, region, node);
            }
        }
        transferBox(region, node) {
            if (15 /* MARGIN */ & region) {
                applyBoxAdjustment(this, 0, region, node, this._boxAdjustment);
            }
            if (240 /* PADDING */ & region) {
                applyBoxAdjustment(this, 4, region, node, this._boxAdjustment);
            }
        }
        registerBox(region, node) {
            var _a;
            this._boxRegister || (this._boxRegister = new Array(8));
            const index = getBoxSpacing(region);
            if (node) {
                this._boxRegister[index] = node;
            }
            else {
                node = this._boxRegister[index];
            }
            while (node) {
                const next = (_a = node.unsafe('boxRegister')) === null || _a === void 0 ? void 0 : _a[index];
                if (next) {
                    node = next;
                }
                else {
                    break;
                }
            }
            return node || null;
        }
        actualPadding(attr, value) {
            if (value > 0) {
                if (!this.layoutElement) {
                    const node = this.innerMostWrapped;
                    if (node !== this) {
                        if (node.naturalChild) {
                            if (!node.getBox(attr === 'paddingTop' ? 16 /* PADDING_TOP */ : 64 /* PADDING_BOTTOM */)[0]) {
                                return 0;
                            }
                        }
                        else {
                            return value;
                        }
                    }
                    if (node.naturalChild) {
                        return canCascadeChildren(node) && cascadeActualPadding(node.naturalElements, attr, value) ? 0 : value;
                    }
                }
                else if (this.gridElement) {
                    switch (this.valueOf('alignContent')) {
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
            value || (value = this.box.width);
            if (this.pageFlow) {
                let offsetLeft = 0, offsetRight = 0, current = this.actualParent;
                while (current) {
                    if (current.hasPX('width', { percent: false }) || !current.pageFlow) {
                        return value;
                    }
                    offsetLeft += Math.max(current.marginLeft, 0) + current.borderLeftWidth + current.paddingLeft;
                    offsetRight += current.paddingRight + current.borderRightWidth + current.marginRight;
                    current = current.actualParent;
                }
                const screenWidth = this.localSettings.screenDimension.width - offsetLeft - offsetRight;
                if (screenWidth > 0) {
                    return Math.min(value, screenWidth);
                }
            }
            return value;
        }
        actualTextHeight(options) {
            var _a;
            let tagName, width, textWrap, textContent;
            if (options) {
                ({ tagName, width, textContent, textWrap } = options);
            }
            tagName || (tagName = this.tagName);
            const style = tagName[0] === '#'
                ? {}
                : this.cssAsObject('paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'borderTopStyle', 'borderRightStyle', 'borderBottomStyle', 'borderLeftStyle');
            Object.assign(style, this.textStyle);
            style.fontSize = this.naturalElement && this.valueOf('fontSize') || this.fontSize + 'px';
            if (width) {
                style.width = width;
            }
            if (textWrap !== true) {
                style.whiteSpace = 'nowrap';
            }
            style.display = 'inline-block';
            const parent = ((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.element) || document.body;
            const element = createElement(tagName !== '#text' ? tagName : 'span', { attributes: { textContent: textContent || 'AgjpqyZ' }, style });
            parent.appendChild(element);
            const result = getRangeClientRect(element);
            parent.removeChild(element);
            return result ? result.height : NaN;
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
            node.lineBreakLeading = this.lineBreakLeading;
            node.lineBreakTrailing = this.lineBreakTrailing;
            node.documentParent = this.documentParent;
            node.renderParent = this.renderParent;
            node.renderedAs = this.renderedAs;
            node.rootElement = this.rootElement;
            if (!this.isEmpty()) {
                node.retainAs(this.toArray());
            }
            node.inherit(this, 'initial', 'base', 'alignment', 'styleMap', 'textStyle');
            Object.assign(node.unsafe('cache'), this._cache);
            Object.assign(node.unsafe('cacheState'), this._cacheState);
        }
        css(attr, value, cache = false) {
            if (arguments.length >= 2) {
                if (value) {
                    this._styleMap[attr] = value;
                }
                else if (value === null) {
                    delete this._styleMap[attr];
                }
                if (cache) {
                    this.unsetCache(attr);
                }
            }
            return this._styleMap[attr] || this.naturalChild && this.style[attr] || '';
        }
        cssApply(values, overwrite = true, cache) {
            if (overwrite) {
                Object.assign(this._styleMap, values);
                if (cache) {
                    this.unsetCache(...Object.keys(values));
                }
            }
            else {
                const styleMap = this._styleMap;
                for (const attr in values) {
                    if (!styleMap[attr]) {
                        styleMap[attr] = values[attr];
                        if (cache) {
                            this.unsetCache(attr);
                        }
                    }
                }
            }
            return this;
        }
        cssSet(attr, value, cache = true) {
            return super.css(attr, value, cache);
        }
        setCacheValue(attr, value) {
            this._cache[attr] = value;
        }
        setCacheState(attr, value) {
            switch (attr) {
                case 'inlineText':
                    this._cacheState.inlineText = value === true;
                    break;
                default:
                    this._cacheState[attr] = value;
                    break;
            }
        }
        unsetCache(...attrs) {
            var _a;
            const length = attrs.length;
            if (length) {
                const cache = this._cache;
                for (let i = 0; i < length; ++i) {
                    switch (attrs[i]) {
                        case 'top':
                        case 'right':
                        case 'bottom':
                        case 'left':
                            cache.autoPosition = undefined;
                            cache.positiveAxis = undefined;
                            break;
                        case 'float':
                            cache.floating = undefined;
                            break;
                        case 'fontSize':
                        case 'lineHeight':
                            cache.baselineHeight = undefined;
                            break;
                        case 'baseline':
                            cache.baselineElement = undefined;
                            (_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.unsetCache('baselineElement');
                            break;
                        case 'height':
                            cache.overflow = undefined;
                        case 'minHeight':
                            cache.blockVertical = undefined;
                            break;
                        case 'width':
                        case 'maxWidth':
                        case 'maxHeight':
                        case 'overflowX':
                        case 'overflowY':
                            cache.overflow = undefined;
                            break;
                    }
                }
            }
            super.unsetCache(...attrs);
        }
        getBoxSpacing() {
            const { boxReset, boxAdjustment } = this;
            return [
                (!boxReset[0] ? this.marginTop : 0) + this.borderTopWidth + (!boxReset[4] ? this.paddingTop : 0) + boxAdjustment[0] + boxAdjustment[4],
                (!boxReset[1] ? this.marginRight : 0) + this.borderRightWidth + (!boxReset[5] ? this.paddingRight : 0) + boxAdjustment[1] + boxAdjustment[5],
                (!boxReset[2] ? this.marginBottom : 0) + this.borderBottomWidth + (!boxReset[6] ? this.paddingBottom : 0) + boxAdjustment[2] + boxAdjustment[6],
                (!boxReset[3] ? this.marginLeft : 0) + this.borderLeftWidth + (!boxReset[7] ? this.paddingLeft : 0) + boxAdjustment[3] + boxAdjustment[7]
            ];
        }
        fitToScreen(value) {
            const { width, height } = this.localSettings.screenDimension;
            if (value.width > width) {
                return { width, height: Math.round(value.height * width / value.width) };
            }
            else if (value.height > height) {
                return { width: Math.round(value.width * height / value.height), height };
            }
            return value;
        }
        cssValue(attr) {
            return this._styleMap[attr] || '';
        }
        cssValues(...attrs) {
            const styleMap = this._styleMap;
            const length = attrs.length;
            const result = new Array(length);
            for (let i = 0; i < length; ++i) {
                result[i] = styleMap[attrs[i]] || '';
            }
            return result;
        }
        get element() {
            return this._element || this.innerWrapped && this.innerMostWrapped.unsafe('element') || null;
        }
        get naturalChild() {
            const result = this._cacheState.naturalChild;
            if (result === undefined) {
                const element = this._element;
                return this._cacheState.naturalChild = !!(element && (element.parentNode || element === document.documentElement));
            }
            return result;
        }
        get pseudoElement() {
            const result = this._cacheState.pseudoElement;
            return result === undefined ? this._cacheState.pseudoElement = this._element ? this._element.className === '__squared-pseudo' : false : result;
        }
        get scrollElement() {
            let result = this._cache.scrollElement;
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
                            result = false;
                            break;
                        default:
                            result = this.blockDimension;
                            break;
                    }
                }
                else {
                    result = false;
                }
                this._cache.scrollElement = result;
            }
            return result;
        }
        get layoutElement() {
            const result = this._cache.layoutElement;
            return result === undefined ? this._cache.layoutElement = this.flexElement || this.gridElement : result;
        }
        get imageElement() {
            const result = this._cache.imageElement;
            return result === undefined ? this._cache.imageElement = super.imageElement : result;
        }
        get flexElement() {
            const result = this._cache.flexElement;
            return result === undefined ? this._cache.flexElement = super.flexElement : result;
        }
        get gridElement() {
            const result = this._cache.gridElement;
            return result === undefined ? this._cache.gridElement = super.gridElement : result;
        }
        get tableElement() {
            const result = this._cache.tableElement;
            return result === undefined ? this._cache.tableElement = super.tableElement : result;
        }
        get inputElement() {
            const result = this._cache.inputElement;
            return result === undefined ? this._cache.inputElement = super.inputElement : result;
        }
        get buttonElement() {
            const result = this._cache.buttonElement;
            return result === undefined ? this._cache.buttonElement = super.buttonElement : result;
        }
        get floating() {
            const result = this._cache.floating;
            return result === undefined ? this._cache.floating = super.floating : result;
        }
        get float() {
            const result = this._cache.float;
            return result === undefined ? this._cache.float = super.float : result;
        }
        set textContent(value) {
            this._cacheState.textContent = value;
        }
        get textContent() {
            const result = this._cacheState.textContent;
            return result === undefined ? this._cacheState.textContent = super.textContent : result;
        }
        get contentBox() {
            const result = this._cache.contentBox;
            return result === undefined ? this._cache.contentBox = super.contentBox : result;
        }
        get positionRelative() {
            const result = this._cache.positionRelative;
            return result === undefined ? this._cache.positionRelative = super.positionRelative : result;
        }
        set documentParent(value) {
            this._documentParent = value;
        }
        get documentParent() {
            return this._documentParent || (this._documentParent = (this.absoluteParent || this.actualParent || this.parent || this));
        }
        set containerName(value) {
            this._cacheState.containerName = value.toUpperCase();
        }
        get containerName() {
            let result = this._cacheState.containerName;
            if (result === undefined) {
                const element = this.element;
                if (element) {
                    if (element.nodeName[0] === '#') {
                        result = 'PLAINTEXT';
                    }
                    else {
                        result = element.tagName.toUpperCase();
                        if (result === 'INPUT') {
                            result += '_' + element.type.toUpperCase();
                        }
                        if (result.includes('-')) {
                            result = result.replace(/-/g, '_');
                        }
                    }
                }
                return this._cacheState.containerName = result || 'UNKNOWN';
            }
            return result;
        }
        get layoutHorizontal() {
            return this.hasAlign(4 /* HORIZONTAL */);
        }
        get layoutVertical() {
            if (this.hasAlign(8 /* VERTICAL */)) {
                return true;
            }
            else if (this.naturalChild) {
                const children = this.naturalChildren;
                return children.length === 1 && children[0].blockStatic;
            }
            return false;
        }
        get nodeGroup() { return false; }
        set renderAs(value) {
            if (!this.rendered && value && !value.renderParent) {
                this._renderAs = value;
            }
            else {
                delete this._renderAs;
            }
        }
        get renderAs() {
            return this._renderAs;
        }
        get inlineVertical() {
            let result = this._cache.inlineVertical;
            if (result === undefined) {
                if (this.naturalElement || this.pseudoElement) {
                    const value = this.display;
                    result = (startsWith$3(value, 'inline') || value === 'table-cell') && !this.floating && this._element !== document.documentElement;
                }
                else {
                    result = false;
                }
                this._cache.inlineVertical = result;
            }
            return result;
        }
        get inlineDimension() {
            const result = this._cache.inlineDimension;
            return result === undefined ? this._cache.inlineDimension = (this.naturalElement || this.pseudoElement) && (startsWith$3(this.display, 'inline-') || this.floating) : result;
        }
        get inlineFlow() {
            var _a;
            const result = this._cache.inlineFlow;
            return result === undefined ? this._cache.inlineFlow = (this.inline || this.inlineDimension || this.inlineVertical || this.floating || this.imageElement || this.svgElement && this.hasPX('width', { percent: false }) || this.tableElement && !!((_a = this.previousSibling) === null || _a === void 0 ? void 0 : _a.floating)) && this.pageFlow : result;
        }
        get blockStatic() {
            return super.blockStatic || this.hasAlign(32 /* BLOCK */) && this.pageFlow && !this.floating;
        }
        get blockDimension() {
            var _a;
            const result = this._cache.blockDimension;
            return result === undefined ? this._cache.blockDimension = this.inlineStatic && !this.isEmpty() ? !!((_a = this.firstStaticChild) === null || _a === void 0 ? void 0 : _a.blockStatic) : this.block || this.inlineDimension || this.display === 'table' || this.imageElement || this.svgElement : result;
        }
        get blockVertical() {
            const result = this._cache.blockVertical;
            return result === undefined ? this._cache.blockVertical = this.blockDimension && this.hasHeight : result;
        }
        get rightAligned() {
            return this.hasAlign(1024 /* RIGHT */) || super.rightAligned;
        }
        get verticalAligned() {
            const result = this._cache.verticalAligned;
            return result === undefined ? this._cache.verticalAligned = this.verticalAlign !== 0 && !isNaN(parseFloat(this.valueOf('verticalAlign'))) : result;
        }
        set autoPosition(value) {
            this._cache.autoPosition = value;
        }
        get autoPosition() {
            let result = this._cache.autoPosition;
            if (result === undefined) {
                if (!this.pageFlow) {
                    const { top, right, bottom, left } = this._styleMap;
                    result = (!top || top === 'auto') && (!left || left === 'auto') && (!right || right === 'auto') && (!bottom || bottom === 'auto');
                }
                else {
                    result = false;
                }
                this._cache.autoPosition = result;
            }
            return result;
        }
        get positiveAxis() {
            const result = this._cache.positiveAxis;
            return result === undefined ? this._cache.positiveAxis = (!this.positionRelative || this.positionRelative && this.top >= 0 && this.left >= 0 && (this.right <= 0 || this.hasPX('left')) && (this.bottom <= 0 || this.hasPX('top'))) && this.marginTop >= 0 && this.marginLeft >= 0 && this.marginRight >= 0 : result;
        }
        get leftTopAxis() {
            let result = this._cache.leftTopAxis;
            if (result === undefined) {
                switch (this.valueOf('position')) {
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
                this._cache.leftTopAxis = result;
            }
            return result;
        }
        get baselineElement() {
            let result = this._cache.baselineElement;
            if (result === undefined) {
                if (this.css('verticalAlign') === 'baseline' && !this.floating) {
                    const children = this.naturalChildren;
                    if (children.length) {
                        result = children.every((node) => {
                            do {
                                if (node.css('verticalAlign') === 'baseline' && !node.floating) {
                                    switch (node.size()) {
                                        case 0:
                                            return node.baselineElement && !(node.positionRelative && (node.top !== 0 || node.bottom !== 0));
                                        case 1:
                                            node = node.children[0];
                                            break;
                                        default:
                                            return false;
                                    }
                                }
                                else {
                                    return false;
                                }
                            } while (true);
                        });
                    }
                    else {
                        result = this.inlineText && this.textElement || this.plainText && !this.multiline || this.inputElement || this.imageElement || this.svgElement;
                    }
                }
                else {
                    result = false;
                }
                this._cache.baselineElement = result;
            }
            return result;
        }
        set multiline(value) {
            this._cache.multiline = value;
            this._cache.baselineElement = undefined;
        }
        get multiline() {
            return super.multiline;
        }
        set controlName(value) {
            if (!this.rendered || !this._cacheState.controlName) {
                this._cacheState.controlName = value;
            }
        }
        get controlName() {
            return this._cacheState.controlName || '';
        }
        set siblingsLeading(value) {
            this._siblingsLeading = value;
        }
        get siblingsLeading() {
            return this._siblingsLeading || (this._siblingsLeading = this.previousSiblings({ floating: true }));
        }
        set siblingsTrailing(value) {
            this._siblingsTrailing = value;
        }
        get siblingsTrailing() {
            return this._siblingsTrailing || (this._siblingsTrailing = this.nextSiblings({ floating: true }));
        }
        get flowElement() {
            return this.pageFlow && (!this.excluded || this.lineBreak);
        }
        get flexbox() {
            return this.naturalChild ? super.flexbox : this.innerMostWrapped.flexbox;
        }
        get previousSibling() {
            const parent = this.actualParent;
            if (parent) {
                const children = parent.naturalChildren;
                for (let i = children.length - 1, found; i >= 0; --i) {
                    const node = children[i];
                    if (found) {
                        if (node.flowElement) {
                            return node;
                        }
                    }
                    else if (node === this) {
                        found = true;
                    }
                }
            }
            return null;
        }
        get nextSibling() {
            const parent = this.actualParent;
            if (parent) {
                const children = parent.naturalChildren;
                for (let i = 0, length = children.length, found; i < length; ++i) {
                    const node = children[i];
                    if (found) {
                        if (node.flowElement) {
                            return node;
                        }
                    }
                    else if (node === this) {
                        found = true;
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
            for (let i = children.length - 1; i >= 0; --i) {
                const node = children[i];
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
            for (let i = children.length - 1; i >= 0; --i) {
                const node = children[i];
                if (node.flowElement) {
                    return node;
                }
            }
            return null;
        }
        get onlyChild() {
            var _a, _b;
            if (!this.rootElement) {
                const children = ((_a = this.renderParent) === null || _a === void 0 ? void 0 : _a.renderChildren) || ((_b = this.parent) === null || _b === void 0 ? void 0 : _b.children);
                if (children) {
                    for (let i = 0, length = children.length; i < length; ++i) {
                        const node = children[i];
                        if (node !== this && node.visible && !(!node.pageFlow && node.opacity === 0)) {
                            return false;
                        }
                    }
                    return true;
                }
            }
            return false;
        }
        get rendering() {
            return this.renderChildren.length > 0;
        }
        get overflowX() {
            let result = this._cache.overflow;
            if (result === undefined) {
                result = setOverflow(this);
                this._cache.overflow = result;
            }
            return (result & 4 /* HORIZONTAL */) > 0;
        }
        get overflowY() {
            let result = this._cache.overflow;
            if (result === undefined) {
                result = setOverflow(this);
                this._cache.overflow = result;
            }
            return (result & 8 /* VERTICAL */) > 0;
        }
        get boxReset() {
            return this._boxReset || (this._boxReset = [0, 0, 0, 0, 0, 0, 0, 0]);
        }
        get boxAdjustment() {
            return this._boxAdjustment || (this._boxAdjustment = [0, 0, 0, 0, 0, 0, 0, 0]);
        }
        get backgroundColor() {
            let result = this._cache.backgroundColor;
            if (result === undefined) {
                result = super.backgroundColor;
                if (result && this.styleElement && !this.inputElement && this.opacity === 1 && this.pageFlow) {
                    let parent = this.actualParent;
                    while (parent) {
                        const backgroundImage = parent.backgroundImage;
                        if (!backgroundImage) {
                            const color = parent.backgroundColor;
                            if (color) {
                                if (color === result && parent.opacity === 1) {
                                    result = '';
                                }
                                break;
                            }
                            parent = parent.actualParent;
                        }
                        else {
                            break;
                        }
                    }
                    this._cache.backgroundColor = result;
                }
            }
            return result;
        }
        get textEmpty() {
            let result = this._cacheState.textEmpty;
            if (result === undefined) {
                if (this.styleElement && !this.imageElement && !this.svgElement && !this.inputElement) {
                    const value = this.textContent;
                    result = value === '' || !this.preserveWhiteSpace && isEmptyString(value);
                }
                else {
                    result = false;
                }
                this._cacheState.textEmpty = result;
            }
            return result;
        }
        set textIndent(value) {
            this._cache.textIndent = value;
        }
        get textIndent() {
            let result = this._cache.textIndent;
            if (result === undefined) {
                if (this.naturalChild) {
                    const hasTextIndent = (node) => node.blockDimension || node.display === 'table-cell';
                    if (hasTextIndent(this)) {
                        const value = this.css('textIndent');
                        if (value === '100%' || (result = this.parseUnit(value)) + this.bounds.width < 0) {
                            return this._cache.textIndent = NaN;
                        }
                    }
                    if (!result) {
                        const parent = this.actualParent;
                        if (parent && parent.firstStaticChild === this && hasTextIndent(parent)) {
                            result = parent.cssUnit('textIndent');
                        }
                    }
                }
                return this._cache.textIndent = result || 0;
            }
            return result;
        }
        get textWidth() {
            const result = this._cache.textWidth;
            if (result === undefined) {
                if (this.styleText && !this.hasPX('width')) {
                    const textBounds = this.textBounds;
                    if (textBounds && (textBounds.numberOfLines > 1 || Math.ceil(textBounds.width) < this.box.width)) {
                        return this._cache.textWidth = textBounds.width;
                    }
                }
                return this._cache.textWidth = this.bounds.width;
            }
            return result;
        }
        set childIndex(value) {
            this._childIndex = value;
        }
        get childIndex() {
            const result = this._childIndex;
            return result === Infinity && this.innerWrapped ? this._childIndex = this.innerMostWrapped.childIndex : result;
        }
        get innerMostWrapped() {
            if (this.naturalChild) {
                return this;
            }
            let result = this._cacheState.innerMostWrapped;
            if (result === undefined) {
                result = this.innerWrapped;
                while (result) {
                    const innerWrapped = result.innerWrapped;
                    if (innerWrapped) {
                        result = innerWrapped;
                    }
                    else {
                        break;
                    }
                }
                return this._cacheState.innerMostWrapped = result || this;
            }
            return result;
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
        get firstLetterStyle() {
            const result = this._cacheState.firstLetterStyle;
            return result === undefined ? this._cacheState.firstLetterStyle = this.cssPseudoElement('::first-letter') || null : result;
        }
        get firstLineStyle() {
            const result = this._cacheState.firstLineStyle;
            return result === undefined ? this._cacheState.firstLineStyle = this.cssPseudoElement('::first-line') || null : result;
        }
        get textAlignLast() {
            if (!this.inlineStatic) {
                const value = this.cssAscend('textAlignLast', { startSelf: true });
                if (!value || value === 'auto') {
                    return '';
                }
                const rtl = this.dir === 'rtl';
                let valid;
                switch (this.css('textAlign')) {
                    case 'left':
                        valid = !(value === 'left' || value === (rtl ? 'end' : 'start'));
                        break;
                    case 'right':
                        valid = !(value === 'right' || value === (rtl ? 'start' : 'end'));
                        break;
                    case 'start':
                        valid = !(value === 'start' || value === (rtl ? 'right' : 'left'));
                        break;
                    case 'end':
                        valid = !(value === 'end' || value === (rtl ? 'left' : 'right'));
                        break;
                    case 'center':
                        valid = value !== 'center';
                        break;
                    case 'justify':
                        valid = value !== 'justify';
                        break;
                    default:
                        return '';
                }
                if (valid) {
                    return value;
                }
            }
            return '';
        }
        get textJustified() {
            if (this.naturalChild && this.cssAscend('textAlign') === 'justify') {
                const { box, naturalChildren } = this.actualParent;
                let inlineWidth = 0;
                for (let i = 0, length = naturalChildren.length; i < length; ++i) {
                    const item = naturalChildren[i];
                    if (item.inlineVertical) {
                        inlineWidth += item.linear.width;
                    }
                    else {
                        return false;
                    }
                }
                if (Math.floor(inlineWidth) > box.width) {
                    return true;
                }
            }
            return false;
        }
        get outerRegion() {
            let top = Infinity, right = -Infinity, bottom = -Infinity, left = Infinity, negativeRight = -Infinity, negativeBottom = -Infinity, actualTop, actualRight, actualBottom, actualLeft;
            this.each((item) => {
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
        set use(value) {
            const use = this.use;
            this.dataset['use' + this.localSettings.systemName] = use ? use + ', ' + value : value;
        }
        get use() {
            const dataset = this.dataset;
            const use = dataset['use' + this.localSettings.systemName] || dataset.use;
            return use ? use.trim() : '';
        }
        get extensions() {
            const result = this._cacheState.extensions;
            if (result === undefined) {
                const use = this.use;
                return this._cacheState.extensions = use ? use.split(/\s*,\s*/) : [];
            }
            return result;
        }
    }

    class LayoutUI extends squared.lib.base.Container {
        constructor(parent, node, containerType = 0, alignmentType = 0, children = node.children) {
            super(children);
            this.parent = parent;
            this.node = node;
            this.containerType = containerType;
            this.alignmentType = alignmentType;
            this._floated = null;
            this._initialized = false;
            this._itemCount = NaN;
            this._linearX = null;
            this._linearY = null;
            this._singleRow = null;
        }
        static create(options) {
            const { itemCount, rowCount, columnCount } = options;
            const layout = new LayoutUI(options.parent, options.node, options.containerType, options.alignmentType, options.children);
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
            const length = this.size();
            if (length > 1) {
                const { linearX, linearY, floated } = NodeUI.linearData(this.children);
                this._linearX = linearX;
                this._linearY = linearY;
                if (floated) {
                    this._floated = floated;
                }
            }
            else if (length === 1) {
                this._linearY = this.children[0].blockStatic;
                this._linearX = !this._linearY;
            }
            else {
                return;
            }
            this._initialized = true;
        }
        setContainerType(containerType, alignmentType) {
            this.containerType = containerType;
            this.addAlign(alignmentType);
        }
        addAlign(value) {
            return this.alignmentType |= value;
        }
        hasAlign(value) {
            return (this.alignmentType & value) > 0;
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
            return isNaN(this._itemCount) ? this.size() : this._itemCount;
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
            return this._floated;
        }
        get singleRowAligned() {
            const result = this._singleRow;
            if (result === null) {
                const children = this.children;
                const length = children.length;
                if (length > 1) {
                    let previousBottom = Infinity;
                    for (let i = 0; i < length; ++i) {
                        const node = children[i];
                        if (node.blockStatic || node.multiline || Math.ceil(node.bounds.top) >= previousBottom) {
                            return this._singleRow = false;
                        }
                        previousBottom = node.bounds.bottom;
                    }
                }
                return this._singleRow = true;
            }
            return result;
        }
    }

    class ExtensionUI extends Extension {
        constructor(name, framework, options) {
            super(name, framework, options);
            this.tagNames = options && options.tagNames;
        }
        static includes(source, value) {
            return source ? source.trim().split(/\s*,\s*/).includes(value) : false;
        }
        static findNestedElement(node, name) {
            if (node.styleElement) {
                const systemName = node.localSettings.systemName;
                const children = node.element.children;
                for (let i = 0, length = children.length; i < length; ++i) {
                    const item = children[i];
                    if (ExtensionUI.includes(item.dataset['use' + systemName] || item.dataset.use, name)) {
                        return item;
                    }
                }
            }
        }
        is(node) {
            return !this.tagNames || this.tagNames.includes(node.tagName);
        }
        condition(node, parent) {
            return node.use ? this.included(node.element) : !!this.tagNames;
        }
        included(element) {
            return ExtensionUI.includes(this.application.getDatasetName('use', element), this.name);
        }
        processNode(node, parent) { }
        processChild(node, parent) { }
        addDescendant(node) {
            const map = this.application.session.extensionMap;
            const extensions = map.get(node);
            if (extensions) {
                if (!extensions.includes(this)) {
                    extensions.push(this);
                }
            }
            else {
                map.set(node, [this]);
            }
        }
        afterBaseLayout(sessionId) { }
        afterConstraints(sessionId) { }
        afterResources(sessionId, resourceId) { }
        afterFinalize(data) { }
        beforeBaseLayout(sessionId) { }
        beforeFinalize(data) { }
    }

    const { isNumber: isNumber$1 } = squared.lib.util;
    function isListItem(node) {
        if (node.display === 'list-item') {
            return true;
        }
        switch (node.tagName) {
            case 'DT':
            case 'DD':
                return true;
            default:
                return false;
        }
    }
    const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const NUMERALS = [
        '', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM',
        '', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC',
        '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'
    ];
    function convertAlpha(value) {
        if (value >= 0) {
            let result = '';
            const length = ALPHA.length;
            while (value >= length) {
                const base = Math.floor(value / length);
                if (base > 1 && base <= length) {
                    result += ALPHA[base - 1];
                    value -= base * length;
                }
                else if (base) {
                    result += 'Z';
                    value -= Math.pow(length, 2);
                    result += convertAlpha(value);
                    return result;
                }
                const index = value % length;
                result += ALPHA[index];
                value -= index + length;
            }
            return ALPHA[value] + result;
        }
        return value.toString();
    }
    function convertRoman(value) {
        const digits = value.toString().split('');
        let result = '', i = 3;
        while (i--) {
            result = (NUMERALS[+digits.pop() + (i * 10)] || '') + result;
        }
        return 'M'.repeat(+digits.join('')) + result;
    }
    const hasSingleImage = (visibleStyle) => visibleStyle.backgroundImage && !visibleStyle.backgroundRepeat;
    function convertListStyle(name, value, fallback) {
        switch (name) {
            case 'decimal':
                return value.toString();
            case 'decimal-leading-zero':
                return (value < 9 ? '0' : '') + value.toString();
            case 'upper-alpha':
            case 'upper-latin':
                if (value >= 1) {
                    return convertAlpha(value - 1);
                }
                break;
            case 'lower-alpha':
            case 'lower-latin':
                if (value >= 1) {
                    return convertAlpha(value - 1).toLowerCase();
                }
                break;
            case 'upper-roman':
                return convertRoman(value);
            case 'lower-roman':
                return convertRoman(value).toLowerCase();
        }
        return fallback ? value.toString() : '';
    }
    class List extends ExtensionUI {
        is(node) {
            return !node.isEmpty() && !!node.find((item) => {
                var _a;
                const type = item.css('listStyleType') !== 'none';
                return (type || ((_a = item.innerBefore) === null || _a === void 0 ? void 0 : _a.pageFlow)) && isListItem(item) || !type && item.marginLeft < 0 && hasSingleImage(item.visibleStyle);
            });
        }
        condition(node) {
            let blockStatic = true, inlineVertical = true, floating = true, blockAlternate = true, floated;
            const children = node.children;
            for (let i = 0, length = children.length; i < length; ++i) {
                const item = children[i];
                if (floating || blockAlternate) {
                    if (item.floating) {
                        (floated || (floated = new Set())).add(item.float);
                        blockAlternate = false;
                    }
                    else {
                        floating = false;
                        if (i > 0 && i < length - 1 && !item.blockStatic && !(children[i - 1].blockStatic && children[i + 1].blockStatic)) {
                            blockAlternate = false;
                        }
                    }
                }
                if (item.blockStatic) {
                    floating = false;
                }
                else {
                    blockStatic = false;
                }
                if (!item.inlineVertical) {
                    inlineVertical = false;
                }
                if (!blockStatic && !inlineVertical && !blockAlternate && !floating) {
                    return false;
                }
            }
            return blockStatic || inlineVertical || blockAlternate || !!floated && floated.size === 1;
        }
        processNode(node) {
            const ordered = node.tagName === 'OL';
            let i = ordered && node.toElementInt('start') || 1;
            node.each((item) => {
                const mainData = {};
                this.data.set(item, mainData);
                if (isListItem(item) || hasSingleImage(item.visibleStyle)) {
                    const type = item.display === 'list-item' ? item.css('listStyleType') : 'none';
                    if (item.has('listStyleImage')) {
                        mainData.imageSrc = item.css('listStyleImage');
                    }
                    else {
                        if (ordered && item.tagName === 'LI') {
                            const value = item.attributes['value'];
                            if (value && isNumber$1(value)) {
                                i = parseInt(value);
                            }
                        }
                        let ordinal = convertListStyle(type, i);
                        if (ordinal) {
                            ordinal += '.';
                        }
                        else {
                            switch (type) {
                                case 'disc':
                                    ordinal = '●';
                                    break;
                                case 'square':
                                    ordinal = '■';
                                    break;
                                case 'none':
                                    if (!item.visibleStyle.backgroundRepeat) {
                                        const src = item.backgroundImage;
                                        if (src) {
                                            mainData.imageSrc = src;
                                            mainData.imagePosition = item.css('backgroundPosition');
                                            item.exclude({ resource: 16 /* IMAGE_SOURCE */ });
                                        }
                                    }
                                    return;
                                default:
                                    ordinal = '○';
                                    break;
                            }
                        }
                        mainData.ordinal = ordinal;
                    }
                    ++i;
                }
            });
        }
    }

    const { FILE } = squared.lib.regex;
    const { formatPX: formatPX$4, getStyle: getStyle$2, hasCoords: hasCoords$2, isCalc, insertStyleSheetRule, resolveURL } = squared.lib.css;
    const { getNamedItem: getNamedItem$1, removeElementsByClassName } = squared.lib.dom;
    const { getElementCache: getElementCache$1, setElementCache: setElementCache$1 } = squared.lib.session;
    const { capitalize: capitalize$1, convertWord, flatArray, isString, iterateArray: iterateArray$1, partitionArray: partitionArray$1, startsWith: startsWith$2, trimBoth, trimString: trimString$1 } = squared.lib.util;
    const REGEXP_PSEUDOCOUNTER = /\s*(?:attr\(([^)]+)\)|(counter)\(([^,)]+)(?:,\s*([a-z-]+))?\)|(counters)\(([^,]+),\s*"((?:[^"]|(?<=\\)")*)"(?:,\s*([a-z-]+))?\)|"((?:[^"]|(?<=\\)")+)")/g;
    const REGEXP_PSEUDOCOUNTERVALUE = /\b([^\-\d][^\-\d]?[^\s]*)\s+(-?\d+)\b/g;
    const REGEXP_PSEUDOQUOTE = /("(?:[^"]|(?<=\\)")+"|[^\s]+)\s+("(?:[^"]|(?<=\\)")+"|[^\s]+)(?:\s+("(?:[^"]|(?<=\\)")+"|[^\s]+)\s+("(?:[^"]|(?<=\\)")+"|[^\s]+))?/;
    function getFloatAlignmentType(nodes) {
        let right, floating;
        for (let i = 0, length = nodes.length; i < length; ++i) {
            const item = nodes[i];
            if (!item.floating) {
                if (right) {
                    return 0;
                }
                floating = true;
            }
            if (!item.rightAligned) {
                if (floating) {
                    return 0;
                }
                right = true;
            }
        }
        let result = 0;
        if (!floating) {
            result |= 256 /* FLOAT */;
        }
        if (!right) {
            result |= 1024 /* RIGHT */;
        }
        return result;
    }
    function checkPseudoDimension(styleMap, after, absolute) {
        switch (styleMap.display) {
            case 'inline':
            case 'block':
            case 'inherit':
            case 'initial':
            case 'unset': {
                const { width, height } = styleMap;
                if ((after || !width || !parseFloat(width) && !isCalc(width)) && (!height || !parseFloat(height) && !isCalc(height))) {
                    for (const attr in styleMap) {
                        const value = styleMap[attr];
                        if (/(padding|Width|Height)/.test(attr) && parseFloat(value) || !absolute && startsWith$2(attr, 'margin') && parseFloat(value)) {
                            return true;
                        }
                    }
                    return false;
                }
            }
            default:
                return true;
        }
    }
    function getPseudoQuoteValue(element, pseudoElt, outside, inside, sessionId) {
        const extractQuote = (value) => { var _a; return ((_a = /^"(.+)"$/.exec(value)) === null || _a === void 0 ? void 0 : _a[1]) || value; };
        let current = element, found = 0, i = 0, j = -1;
        while (current && current.tagName === 'Q') {
            const quotes = (getElementCache$1(current, 'styleMap', sessionId) || getStyle$2(current)).quotes;
            if (quotes) {
                const match = REGEXP_PSEUDOQUOTE.exec(quotes);
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
                    }
                    else {
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
        }
        else if (j === 0) {
            return outside;
        }
        else if (j > 0) {
            return inside;
        }
        return i % 2 === 0 ? outside : inside;
    }
    function getCounterValue(value, counterName, fallback = 1) {
        if (value && value !== 'none') {
            REGEXP_PSEUDOCOUNTERVALUE.lastIndex = 0;
            let match;
            while (match = REGEXP_PSEUDOCOUNTERVALUE.exec(value)) {
                if (match[1] === counterName) {
                    return +match[2];
                }
            }
            return fallback;
        }
    }
    function setColumnMaxWidth(nodes, offset) {
        for (let i = 0, length = nodes.length; i < length; ++i) {
            const child = nodes[i];
            if (!child.hasPX('width') && !child.hasPX('maxWidth') && !child.imageElement && !child.svgElement) {
                child.css('maxWidth', formatPX$4(offset));
            }
        }
    }
    function setElementState(node, styleElement, naturalElement, htmlElement, svgElement) {
        const cacheState = node.unsafe('cacheState');
        cacheState.naturalChild = true;
        cacheState.styleElement = styleElement;
        cacheState.naturalElement = naturalElement;
        cacheState.htmlElement = htmlElement;
        cacheState.svgElement = svgElement;
    }
    class ApplicationUI extends Application {
        constructor() {
            super(...arguments);
            this.session = {
                active: new Map(),
                extensionMap: new WeakMap(),
                clearMap: new Map()
            };
            this.extensions = [];
            this._layouts = [];
        }
        init() {
            const controller = this.controllerHandler;
            const localSettings = controller.localSettings;
            this._visibleElement = controller.visibleElement.bind(controller);
            this._applyDefaultStyles = controller.applyDefaultStyles.bind(controller);
            this._renderNode = controller.renderNode.bind(controller);
            this._renderNodeGroup = controller.renderNodeGroup.bind(controller);
            this._controllerSettings = localSettings;
            this._layoutFileExtension = new RegExp(`\\.${localSettings.layout.fileExtension}$`, 'i');
            this._excludedElements = localSettings.unsupported.excluded;
            this.setResourceId();
        }
        finalize() {
            var _a, _b;
            if (this.closed) {
                return true;
            }
            const controller = this.controllerHandler;
            const [extensions, children] = this.sessionAll;
            let itemCount = 0, length = children.length;
            const rendered = new Array(length);
            for (let i = 0; i < length; ++i) {
                const node = children[i];
                if (node.renderParent && node.visible) {
                    if (node.hasProcedure(2 /* LAYOUT */)) {
                        node.setLayout();
                    }
                    if (node.hasProcedure(4 /* ALIGNMENT */)) {
                        node.setAlignment();
                    }
                    rendered[itemCount++] = node;
                }
            }
            if (itemCount < length) {
                rendered.length = itemCount;
            }
            controller.optimize(rendered);
            length = extensions.length;
            for (let i = 0; i < length; ++i) {
                const ext = extensions[i];
                const postOptimize = ext.postOptimize;
                if (postOptimize) {
                    for (const node of ext.subscribers) {
                        postOptimize.call(ext, node, rendered);
                    }
                }
            }
            const documentRoot = [];
            const finalizeData = { resourceId: this.resourceId, rendered, documentRoot };
            itemCount = rendered.length;
            for (let i = 0; i < itemCount; ++i) {
                const node = rendered[i];
                if (node.hasResource(2 /* BOX_SPACING */)) {
                    node.setBoxSpacing();
                }
                if (node.documentRoot && !(!node.rendering && !node.inlineText && node.naturalElements.length)) {
                    const layoutName = node.innerMostWrapped.data(Application.KEY_NAME, 'layoutName');
                    const renderTemplates = (_a = node.renderParent) === null || _a === void 0 ? void 0 : _a.renderTemplates;
                    if (layoutName && renderTemplates) {
                        documentRoot.push({ node, layoutName, renderTemplates });
                    }
                }
            }
            for (let i = 0; i < length; ++i) {
                const ext = extensions[i];
                const postBoxSpacing = ext.postBoxSpacing;
                if (postBoxSpacing) {
                    for (const node of ext.subscribers) {
                        postBoxSpacing.call(ext, node, rendered);
                    }
                }
                ext.beforeFinalize(finalizeData);
            }
            for (let i = 0, q = documentRoot.length; i < q; ++i) {
                const { node, layoutName, renderTemplates } = documentRoot[i];
                this.saveDocument(layoutName, this._controllerSettings.layout.baseTemplate + controller.writeDocument(renderTemplates, Math.abs(node.depth), this.userSettings.showAttributes), node.dataset['pathname' + capitalize$1(this.systemName)], ((_b = node.renderExtension) === null || _b === void 0 ? void 0 : _b.some(item => item.documentBase)) ? 0 : undefined);
            }
            controller.finalize(this._layouts);
            for (let i = 0; i < length; ++i) {
                extensions[i].afterFinalize(finalizeData);
            }
            removeElementsByClassName('__squared-pseudo');
            return this.closed = true;
        }
        copyTo(pathname, options) {
            return super.copyTo(pathname, this.createAssetOptions(options));
        }
        appendTo(pathname, options) {
            return super.appendTo(pathname, this.createAssetOptions(options));
        }
        saveAs(filename, options) {
            return super.saveAs(filename, this.createAssetOptions(options));
        }
        reset() {
            const session = this.session;
            const iterationName = 'iteration' + capitalize$1(this.systemName);
            for (const item of session.active.values()) {
                for (const element of item.rootElements) {
                    delete element.dataset[iterationName];
                }
            }
            session.active.clear();
            session.extensionMap = new WeakMap();
            session.clearMap.clear();
            this.setResourceId();
            this._nextId = 0;
            this._layouts = [];
            super.reset();
        }
        conditionElement(element, sessionId, cascadeAll, pseudoElt) {
            if (!this._excludedElements.includes(element.tagName)) {
                if (this._visibleElement(element, sessionId, pseudoElt) || cascadeAll) {
                    return true;
                }
                else if (!pseudoElt) {
                    if (hasCoords$2(getStyle$2(element).position)) {
                        return this.useElement(element);
                    }
                    let current = element.parentElement;
                    while (current) {
                        if (getStyle$2(current).display === 'none') {
                            return this.useElement(element);
                        }
                        current = current.parentElement;
                    }
                    const controller = this.controllerHandler;
                    if (iterateArray$1(element.children, (item) => controller.visibleElement(item, sessionId)) === Infinity) {
                        return true;
                    }
                    return this.useElement(element);
                }
            }
            return false;
        }
        saveDocument(filename, content, pathname, index = -1) {
            const layout = {
                pathname: pathname ? trimString$1(pathname.replace(/\\/g, '/'), '/') : appendSeparator(this.userSettings.outputDirectory, this._controllerSettings.layout.pathName),
                filename,
                content,
                index
            };
            if (index === -1 || !(index >= 0 && index < this._layouts.length)) {
                this._layouts.push(layout);
            }
            else {
                this._layouts.splice(index, 0, layout);
            }
        }
        renderNode(layout) {
            return layout.itemCount === 0 ? this._renderNode(layout) : this._renderNodeGroup(layout);
        }
        addLayout(layout) {
            if (layout.alignmentType & 32768 /* FLOAT_LAYOUT */) {
                layout = layout.alignmentType & 8 /* VERTICAL */ ? this.processFloatVertical(layout) : this.processFloatHorizontal(layout);
            }
            if (layout.containerType) {
                const template = this.renderNode(layout);
                if (template) {
                    this.addLayoutTemplate(template.parent || layout.parent, layout.node, template, layout.renderIndex);
                    return true;
                }
            }
            return false;
        }
        addLayoutTemplate(parent, node, template, index = -1) {
            if (!node.renderExclude) {
                if (node.renderParent) {
                    const renderTemplates = parent.renderTemplates || (parent.renderTemplates = []);
                    if (index >= 0 && index < parent.renderChildren.length) {
                        parent.renderChildren.splice(index, 0, node);
                        renderTemplates.splice(index, 0, template);
                    }
                    else {
                        parent.renderChildren.push(node);
                        renderTemplates.push(template);
                    }
                    node.renderedAs = template;
                }
            }
            else {
                node.hide({ remove: true });
                node.excluded = true;
            }
        }
        createNode(sessionId, options) {
            const { element, parent, children, flags = 0 } = options;
            const { cache, afterInsertNode } = this.getProcessing(sessionId);
            const node = new this.Node(this.nextId, sessionId, element);
            this._afterInsertNode(node);
            if (afterInsertNode) {
                afterInsertNode.some(item => item.afterInsertNode(node));
            }
            if (parent) {
                node.depth = parent.depth + 1;
                if (!element && parent.naturalElement) {
                    node.actualParent = parent;
                }
                const child = options.innerWrapped;
                if (child && parent.replaceTry({ child, replaceWith: node })) {
                    child.parent = node;
                    node.innerWrapped = child;
                }
            }
            if (children) {
                for (let i = 0, length = children.length; i < length; ++i) {
                    children[i].parent = node;
                }
            }
            if (~flags & 1 /* DEFER */) {
                cache.add(node, (flags & 2 /* DELEGATE */) > 0, (flags & 4 /* CASCADE */) > 0);
            }
            return node;
        }
        insertNode(processing, element, cascadeAll, pseudoElt) {
            if (element.nodeName === '#text' || this.conditionElement(element, processing.sessionId, cascadeAll, pseudoElt)) {
                this._applyDefaultStyles(processing, element, pseudoElt);
                return this.createNodeStatic(processing, element);
            }
            const node = this.createNodeStatic(processing, element);
            node.visible = false;
            node.excluded = true;
            return node;
        }
        createCache(processing, documentRoot) {
            const node = this.createRootNode(processing, documentRoot);
            if (node) {
                const { cache, excluded } = processing;
                const parent = node.parent;
                if (parent) {
                    parent.visible = false;
                    node.documentParent = parent;
                    setElementState(parent, true, true, true, false);
                    if (parent.tagName === 'HTML') {
                        parent.addAlign(2 /* AUTO_LAYOUT */);
                        parent.exclude({ resource: 4 /* FONT_STYLE */ | 8 /* VALUE_STRING */, procedure: 63 /* ALL */ });
                        cache.add(parent);
                    }
                }
                node.rootElement = true;
                node.renderExclude = false;
                const preAlignment = new WeakMap();
                const direction = new WeakSet();
                const pseudoElements = [];
                let resetBounds;
                cache.each(item => {
                    if (item.styleElement) {
                        const element = item.element;
                        let data;
                        if (!item.isEmpty()) {
                            const textAlign = item.valueOf('textAlign');
                            switch (textAlign) {
                                case 'center':
                                case 'right':
                                case 'end':
                                case 'justify':
                                    element.style.textAlign = 'left';
                                    preAlignment.set(item, data = { textAlign });
                                    break;
                            }
                        }
                        if (item.positionRelative) {
                            const setPosition = (attr) => {
                                if (item.hasPX(attr)) {
                                    if (!data) {
                                        data = {};
                                        preAlignment.set(item, data);
                                    }
                                    data[attr] = item.valueOf(attr);
                                    element.style[attr] = 'auto';
                                    resetBounds = true;
                                }
                            };
                            setPosition('top');
                            setPosition('right');
                            setPosition('bottom');
                            setPosition('left');
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
                    if (item.pseudoElt) {
                        pseudoElements.push(item);
                    }
                    else {
                        item.setBounds(!resetBounds && !preAlignment.get(item));
                    }
                });
                if (pseudoElements.length) {
                    const pseudoMap = [];
                    for (let i = 0, length = pseudoElements.length; i < length; ++i) {
                        const item = pseudoElements[i];
                        const parentElement = item.parentElement;
                        let previousId = null, styleElement;
                        if (item.pageFlow) {
                            let tagName;
                            if (parentElement.shadowRoot) {
                                tagName = ':host';
                            }
                            else {
                                let id = parentElement.id;
                                if (!startsWith$2(id, 'sqd__') && (!id || id !== id.trim())) {
                                    previousId = id;
                                    id = 'sqd__' + Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
                                    parentElement.id = id;
                                }
                                tagName = '#' + id;
                            }
                            styleElement = insertStyleSheetRule(`${tagName + item.pseudoElt} { display: none !important; }`, 0, item.shadowHost);
                        }
                        if (item.cssTry('display', item.display)) {
                            pseudoMap.push([item, previousId, styleElement]);
                        }
                    }
                    const length = pseudoMap.length;
                    for (let i = 0; i < length; ++i) {
                        pseudoMap[i][0].setBounds(false);
                    }
                    for (let i = 0; i < length; ++i) {
                        const [item, previousId, styleElement] = pseudoMap[i];
                        if (previousId !== null) {
                            item.parentElement.id = previousId;
                        }
                        if (styleElement) {
                            try {
                                (item.shadowHost || document.head).removeChild(styleElement);
                            }
                            catch (_a) {
                            }
                        }
                        item.cssFinally('display');
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
                        const reset = preAlignment.get(item);
                        if (reset) {
                            for (const attr in reset) {
                                element.style[attr] = reset[attr];
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
        afterCreateCache(processing, node) {
            super.afterCreateCache(processing, node);
            const systemName = capitalize$1(this.systemName);
            const dataset = node.dataset;
            const filename = dataset['filename' + systemName] || dataset.filename;
            const iteration = dataset['iteration' + systemName];
            const prefix = isString(filename) && filename.replace(this._layoutFileExtension, '') || node.elementId || `document_${this.length}`;
            const suffix = iteration ? +iteration + 1 : 0;
            const layoutName = convertWord(suffix ? prefix + '_' + suffix : prefix);
            dataset['iteration' + systemName] = suffix.toString();
            dataset['layoutName' + systemName] = layoutName;
            node.data(Application.KEY_NAME, 'layoutName', layoutName);
            this.setBaseLayout(processing);
            this.setConstraints(processing);
            this.setResources(processing);
        }
        useElement(element) {
            const use = this.getDatasetName('use', element);
            return use ? use.split(',').some(value => this.extensionManager.get(value.trim())) : false;
        }
        toString() {
            var _a;
            return ((_a = this.layouts[0]) === null || _a === void 0 ? void 0 : _a.content) || '';
        }
        cascadeParentNode(processing, sessionId, resourceId, parentElement, depth, extensions, shadowParent, beforeElement, afterElement, cascadeAll) {
            var _a;
            const node = this.insertNode(processing, parentElement, cascadeAll);
            if (parentElement.tagName === 'svg') {
                setElementState(node, true, true, false, true);
            }
            else {
                setElementState(node, true, true, true, false);
            }
            if (depth === 0) {
                processing.cache.add(node);
                for (const name of node.extensions) {
                    if ((_a = this.extensionManager.get(name)) === null || _a === void 0 ? void 0 : _a.cascadeAll) {
                        cascadeAll = true;
                        break;
                    }
                }
                beforeElement = this.createPseduoElement(sessionId, resourceId, parentElement, '::before');
                afterElement = this.createPseduoElement(sessionId, resourceId, parentElement, '::after');
            }
            const display = node.display;
            if (display !== 'none' || depth === 0 || cascadeAll || node.extensions.some(name => { var _a; return (_a = this.extensionManager.get(name)) === null || _a === void 0 ? void 0 : _a.documentBase; })) {
                if (node.excluded || this._preventNodeCascade(node)) {
                    return node;
                }
                const { cache, rootElements } = processing;
                const pierceShadowRoot = this.userSettings.pierceShadowRoot;
                const hostElement = parentElement.shadowRoot || parentElement;
                const childNodes = hostElement.childNodes;
                const children = [];
                const elements = [];
                const childDepth = depth + 1;
                let inlineText = true, plainText = -1, lineBreak = -1, j = 0;
                for (let i = 0, length = childNodes.length; i < length; ++i) {
                    const element = childNodes[i];
                    let child;
                    if (element === beforeElement) {
                        child = this.insertNode(processing, beforeElement, cascadeAll, '::before');
                        setElementState(child, true, false, true, false);
                        if (!child.textEmpty) {
                            child.cssApply(node.textStyle, false);
                            child.inlineText = true;
                        }
                        inlineText = false;
                        node.innerBefore = child;
                    }
                    else if (element === afterElement) {
                        child = this.insertNode(processing, afterElement, cascadeAll, '::after');
                        setElementState(child, true, false, true, false);
                        if (!child.textEmpty) {
                            child.cssApply(node.textStyle, false);
                            child.inlineText = true;
                        }
                        inlineText = false;
                        node.innerAfter = child;
                    }
                    else if (element.nodeName[0] === '#') {
                        if (this.visibleText(node, element)) {
                            child = this.insertNode(processing, element);
                            setElementState(child, false, false, false, false);
                            child.cssApply(node.textStyle);
                            plainText = j;
                        }
                        else {
                            continue;
                        }
                    }
                    else if (this._includeElement(element)) {
                        if (extensions) {
                            const use = this.getDatasetName('use', element);
                            (use ? ApplicationUI.prioritizeExtensions(use, extensions) : extensions).some(item => item.beforeInsertNode(element, sessionId));
                        }
                        if (!rootElements.includes(element)) {
                            let shadowRoot;
                            if (pierceShadowRoot && (shadowRoot = element.shadowRoot)) {
                                this.replaceShadowRootSlots(shadowRoot);
                                this.setStyleMap(sessionId, resourceId, shadowRoot);
                            }
                            const hostElementChild = shadowRoot || element;
                            const beforeElementChild = this.createPseduoElement(sessionId, resourceId, element, '::before', hostElementChild);
                            const afterElementChild = this.createPseduoElement(sessionId, resourceId, element, '::after', hostElementChild);
                            if (hostElementChild.childNodes.length) {
                                child = this.cascadeParentNode(processing, sessionId, resourceId, element, childDepth, extensions, shadowRoot || shadowParent, beforeElementChild, afterElementChild, cascadeAll);
                                if (child.display === 'contents' && !child.excluded && !shadowRoot) {
                                    for (const item of child.naturalChildren) {
                                        if (item.naturalElement) {
                                            elements.push(item);
                                        }
                                        else if (item.plainText) {
                                            plainText = j;
                                        }
                                        item.init(node, childDepth, j++);
                                        item.actualParent = node;
                                        children.push(item);
                                    }
                                    child.excluded = true;
                                    continue;
                                }
                            }
                            else {
                                child = this.insertNode(processing, element, cascadeAll);
                                if (element.tagName === 'svg') {
                                    setElementState(child, true, true, false, true);
                                }
                                else {
                                    setElementState(child, true, true, true, child.imageElement && FILE.SVG.test(child.toElementString('src')));
                                }
                            }
                            if (!child.excluded) {
                                inlineText = false;
                            }
                            else if (inlineText && child.lineBreak && plainText !== -1 && lineBreak === -1) {
                                lineBreak = j;
                            }
                        }
                        else {
                            child = this.insertNode(processing, element);
                            child.documentRoot = true;
                            child.visible = false;
                            child.excluded = true;
                            inlineText = false;
                        }
                        elements.push(child);
                    }
                    else {
                        continue;
                    }
                    if (shadowParent) {
                        child.shadowHost = shadowParent;
                    }
                    child.init(node, childDepth, j++);
                    child.actualParent = node;
                    children.push(child);
                }
                node.naturalChildren = children;
                node.naturalElements = elements;
                if (hostElement !== parentElement) {
                    node.shadowRoot = true;
                }
                const contents = display === 'contents';
                const length = children.length;
                if (!inlineText) {
                    node.inlineText = false;
                    if (j > 0) {
                        if (length > 1) {
                            let siblingsLeading = [], siblingsTrailing = [], trailing = children[0], floating = false, excluded;
                            for (let i = 0; i < length; ++i) {
                                const child = children[i];
                                if (child.flowElement) {
                                    if (child.floating) {
                                        floating = true;
                                    }
                                    if (i > 0) {
                                        siblingsTrailing.push(child);
                                        if (child.lineBreak) {
                                            children[i - 1].lineBreakTrailing = true;
                                        }
                                    }
                                    child.siblingsLeading = siblingsLeading;
                                    trailing.siblingsTrailing = siblingsTrailing;
                                    siblingsLeading = [];
                                    siblingsTrailing = [];
                                    trailing = child;
                                    if (i < length - 1) {
                                        siblingsLeading.push(child);
                                        if (child.lineBreak) {
                                            children[i + 1].lineBreakLeading = true;
                                        }
                                    }
                                }
                                if (child.excluded && !contents) {
                                    excluded = true;
                                    processing.excluded.add(child);
                                }
                            }
                            trailing.siblingsTrailing = siblingsTrailing;
                            if (!contents) {
                                node.floatContainer = floating;
                                node.retainAs(excluded ? children.filter(item => !item.excluded) : children.slice(0));
                                cache.addAll(node);
                            }
                            else {
                                node.retainAs(children);
                            }
                        }
                        else {
                            const child = children[0];
                            if (!contents) {
                                if (child.excluded) {
                                    processing.excluded.add(child);
                                }
                                else {
                                    node.add(child);
                                    cache.add(child);
                                }
                            }
                            else {
                                node.add(child);
                            }
                        }
                    }
                }
                else {
                    node.inlineText = plainText !== -1;
                    if (lineBreak !== -1 && lineBreak < plainText) {
                        node.multiline = true;
                    }
                    for (let i = 0; i < length; ++i) {
                        const item = children[i];
                        if (item.lineBreak) {
                            if (i > 0) {
                                children[i - 1].lineBreakTrailing = true;
                            }
                            if (i < length - 1) {
                                children[i + 1].lineBreakLeading = true;
                            }
                        }
                        if (item.excluded && !contents) {
                            processing.excluded.add(item);
                        }
                    }
                }
                if (elements.length && this.userSettings.createQuerySelectorMap) {
                    node.queryMap = this.createQueryMap(elements);
                }
            }
            return node;
        }
        setBaseLayout(processing) {
            const controller = this.controllerHandler;
            const { extensionMap, clearMap } = this.session;
            const { sessionId, extensions, cache, node: rootNode } = processing;
            const mapData = new Map();
            const setMapDepth = (depth, node) => {
                const data = mapData.get(depth);
                if (data) {
                    data.add(node);
                }
                else {
                    mapData.set(depth, new Set([node]));
                }
            };
            if (rootNode.parent) {
                setMapDepth(-1, rootNode.parent);
            }
            cache.each(node => {
                if (!node.isEmpty()) {
                    setMapDepth(node.depth, node);
                    if (node.floatContainer) {
                        const floated = new Set();
                        let clearable = [];
                        for (const item of (node.documentChildren || node.naturalChildren)) {
                            if (floated.size && item.pageFlow) {
                                const clear = item.valueOf('clear');
                                if (floated.has(clear) || clear === 'both') {
                                    if (!item.floating) {
                                        item.setBox(1 /* MARGIN_TOP */, { reset: 1 });
                                    }
                                    clearMap.set(item, floated.size === 2 ? 'both' : floated.values().next().value);
                                    floated.clear();
                                    clearable = [];
                                }
                                else if (item.blockStatic && Math.ceil(item.bounds.top) >= Math.max(...clearable.map(previous => previous.bounds.bottom))) {
                                    item.data(Application.KEY_NAME, 'cleared', clearable);
                                    floated.clear();
                                    clearable = [];
                                }
                            }
                            if (item.floating) {
                                floated.add(item.float);
                                clearable.push(item);
                            }
                        }
                    }
                }
            });
            for (const depth of Array.from(mapData.keys())) {
                if (depth !== -1) {
                    mapData.set(-(depth + 2), new Set());
                }
            }
            cache.afterAdd = (node, cascade, remove) => {
                var _a;
                if (remove) {
                    (_a = mapData.get(node.depth)) === null || _a === void 0 ? void 0 : _a.delete(node);
                }
                setMapDepth(-(node.depth + 2), node);
                if (cascade && !node.isEmpty()) {
                    node.cascade((item) => {
                        var _a;
                        if (!item.isEmpty()) {
                            const depth = item.depth;
                            (_a = mapData.get(depth)) === null || _a === void 0 ? void 0 : _a.delete(item);
                            setMapDepth(-(depth + 2), item);
                        }
                    });
                }
            };
            const length = extensions.length;
            for (let i = 0; i < length; ++i) {
                extensions[i].beforeBaseLayout(sessionId);
            }
            let extensionsTraverse = extensions.filter((item) => !item.eventOnly);
            for (const depth of mapData.values()) {
                for (const parent of depth.values()) {
                    const q = parent.size();
                    if (q === 0) {
                        continue;
                    }
                    const renderExtension = parent.renderExtension;
                    const floatContainer = parent.floatContainer;
                    const axisY = parent.toArray();
                    for (let i = 0; i < q; ++i) {
                        let nodeY = axisY[i];
                        if (nodeY.rendered || !nodeY.visible) {
                            continue;
                        }
                        let parentY = nodeY.parent;
                        if (q > 1 && i < q - 1 && nodeY.pageFlow && (parentY.alignmentType === 0 || parentY.hasAlign(1 /* UNKNOWN */) || nodeY.hasAlign(4096 /* EXTENDABLE */)) && !nodeY.nodeGroup && nodeY.hasSection(1 /* DOM_TRAVERSE */)) {
                            const horizontal = [];
                            const vertical = [];
                            let j = i, k = 0;
                            if (parentY.layoutVertical && nodeY.hasAlign(4096 /* EXTENDABLE */)) {
                                horizontal.push(nodeY);
                                ++j;
                                ++k;
                            }
                            traverse: {
                                let floatActive;
                                for (; j < q; ++j, ++k) {
                                    const item = axisY[j];
                                    if (item.pageFlow) {
                                        if (item.labelFor && !item.visible) {
                                            --k;
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
                                        if (k === 0) {
                                            const next = item.siblingsTrailing[0];
                                            if (next) {
                                                if (!item.inlineFlow || next.alignedVertically([item])) {
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
                                                if (status) {
                                                    if (horizontal.length) {
                                                        if (floatActive && status < 4 /* FLOAT_CLEAR */ && !item.siblingsLeading.some((node) => clearMap.has(node) && !horizontal.includes(node))) {
                                                            horizontal.push(item);
                                                            continue;
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
                                                    vertical.push(item);
                                                }
                                                else {
                                                    if (vertical.length) {
                                                        break traverse;
                                                    }
                                                    horizontal.push(item);
                                                }
                                            }
                                            else if (item.alignedVertically(orientation ? horizontal : vertical, undefined, orientation)) {
                                                if (horizontal.length) {
                                                    break traverse;
                                                }
                                                vertical.push(item);
                                            }
                                            else {
                                                if (vertical.length) {
                                                    break traverse;
                                                }
                                                horizontal.push(item);
                                            }
                                        }
                                        else {
                                            break traverse;
                                        }
                                    }
                                    else if (item.autoPosition) {
                                        const r = vertical.length;
                                        if (r) {
                                            if (vertical[r - 1].blockStatic && !item.renderExclude) {
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
                            if (horizontal.length > 1) {
                                const items = horizontal.filter(item => !item.renderExclude || floatContainer && clearMap.has(item));
                                if (items.length > 1) {
                                    const layout = controller.processTraverseHorizontal(new LayoutUI(parentY, nodeY, 0, 0, items), axisY);
                                    if (horizontal[horizontal.length - 1] === axisY[q - 1]) {
                                        parentY.removeAlign(1 /* UNKNOWN */);
                                    }
                                    if (layout && this.addLayout(layout)) {
                                        parentY = nodeY.parent;
                                    }
                                }
                            }
                            else if (vertical.length > 1) {
                                const items = vertical.filter(item => !item.renderExclude || floatContainer && clearMap.has(item));
                                if (items.length > 1) {
                                    const layout = controller.processTraverseVertical(new LayoutUI(parentY, nodeY, 0, 0, items), axisY);
                                    const segEnd = vertical[vertical.length - 1];
                                    if (segEnd === axisY[q - 1]) {
                                        parentY.removeAlign(1 /* UNKNOWN */);
                                    }
                                    else if (segEnd.inlineFlow && segEnd !== axisY[q - 1]) {
                                        segEnd.addAlign(4096 /* EXTENDABLE */);
                                    }
                                    if (layout && this.addLayout(layout)) {
                                        parentY = nodeY.parent;
                                    }
                                }
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
                        if (!nodeY.rendered && nodeY.hasSection(2 /* EXTENSION */)) {
                            const descendant = extensionMap.get(nodeY);
                            let combined = descendant ? renderExtension ? renderExtension.concat(descendant) : descendant : renderExtension, next;
                            if (combined) {
                                for (let j = 0, r = combined.length; j < r; ++j) {
                                    const ext = combined[j];
                                    const result = ext.processChild(nodeY, parentY);
                                    if (result) {
                                        if (result.output) {
                                            this.addLayoutTemplate(result.outerParent || parentY, nodeY, result.output);
                                        }
                                        if (result.renderAs && result.outputAs) {
                                            this.addLayoutTemplate(result.parentAs || parentY, result.renderAs, result.outputAs);
                                        }
                                        if (result.parent) {
                                            parentY = result.parent;
                                        }
                                        if (result.subscribe) {
                                            ext.subscribers.add(nodeY);
                                        }
                                        next = result.next === true;
                                        if (next || result.complete) {
                                            break;
                                        }
                                    }
                                }
                                if (next) {
                                    continue;
                                }
                            }
                            if (nodeY.styleElement) {
                                combined = nodeY.use ? ApplicationUI.prioritizeExtensions(nodeY.use, extensionsTraverse) : extensionsTraverse;
                                for (let j = 0, r = combined.length; j < r; ++j) {
                                    const ext = combined[j];
                                    if (ext.is(nodeY)) {
                                        if (ext.condition(nodeY, parentY) && !(descendant && descendant.includes(ext))) {
                                            const result = ext.processNode(nodeY, parentY);
                                            if (result) {
                                                if (result.output) {
                                                    this.addLayoutTemplate(result.outerParent || parentY, nodeY, result.output);
                                                }
                                                if (result.renderAs && result.outputAs) {
                                                    this.addLayoutTemplate(result.parentAs || parentY, result.renderAs, result.outputAs);
                                                }
                                                if (result.parent) {
                                                    parentY = result.parent;
                                                }
                                                if (result.include) {
                                                    (nodeY.renderExtension || (nodeY.renderExtension = [])).push(ext);
                                                    ext.subscribers.add(nodeY);
                                                }
                                                else if (result.subscribe) {
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
                                                if (next || result.complete) {
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
                        if (!nodeY.rendered && nodeY.hasSection(4 /* RENDER */)) {
                            const containerType = nodeY.containerType;
                            let layout;
                            if (!nodeY.isEmpty()) {
                                layout = new LayoutUI(parentY, nodeY, containerType, nodeY.alignmentType);
                                if (containerType === 0) {
                                    controller.processUnknownParent(layout);
                                }
                            }
                            else {
                                layout = new ContentUI(parentY, nodeY, containerType, nodeY.alignmentType);
                                if (containerType === 0) {
                                    controller.processUnknownChild(layout);
                                }
                            }
                            if (layout.next) {
                                continue;
                            }
                            this.addLayout(layout);
                        }
                    }
                }
            }
            cache.sort((a, b) => {
                const depth = a.depth - b.depth;
                if (depth === 0) {
                    if (!a.naturalChild || !b.naturalChild) {
                        if (a.nodeGroup && b.nodeGroup) {
                            return a.id - b.id;
                        }
                        else if (a.nodeGroup) {
                            return -1;
                        }
                        else if (b.nodeGroup) {
                            return 1;
                        }
                        if (a.innerWrapped === b) {
                            return -1;
                        }
                        else if (a === b.innerWrapped) {
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
                    }
                    return 0;
                }
                return depth;
            });
            for (let i = 0; i < length; ++i) {
                const ext = extensions[i];
                const postBaseLayout = ext.postBaseLayout;
                if (postBaseLayout) {
                    for (const node of ext.subscribers) {
                        if (node.sessionId === sessionId) {
                            postBaseLayout.call(ext, node);
                        }
                    }
                }
                ext.afterBaseLayout(sessionId);
            }
        }
        setConstraints(processing) {
            const { sessionId, cache, extensions } = processing;
            this.controllerHandler.setConstraints(cache);
            for (let i = 0, length = extensions.length; i < length; ++i) {
                const ext = extensions[i];
                const postConstraints = ext.postConstraints;
                if (postConstraints) {
                    for (const node of ext.subscribers) {
                        if (node.sessionId === sessionId) {
                            postConstraints.call(ext, node);
                        }
                    }
                }
                ext.afterConstraints(sessionId);
            }
        }
        setResources(processing) {
            const { sessionId, resourceId, cache, extensions } = processing;
            this.resourceHandler.setData(cache);
            for (let i = 0, length = extensions.length; i < length; ++i) {
                const ext = extensions[i];
                const postResources = ext.postResources;
                if (postResources) {
                    for (const node of ext.subscribers) {
                        if (node.sessionId === sessionId) {
                            postResources.call(ext, node);
                        }
                    }
                }
                ext.afterResources(sessionId, resourceId);
            }
        }
        processFloatHorizontal(layout) {
            const { clearMap, controllerHandler } = this;
            const { containerType, alignmentType } = controllerHandler.containerTypeVertical;
            const verticalMargin = controllerHandler.containerTypeVerticalMargin;
            const layerIndex = [];
            const inlineAbove = [];
            const leftAbove = [];
            const rightAbove = [];
            let boxStyle = null, leftBelow, rightBelow, leftSub, rightSub, inlineBelow, inheritStyle, clearing, clearedFloat;
            layout.each((node, index) => {
                const float = node.float;
                if (clearing && float === 'left') {
                    clearedFloat = true;
                }
                if (index) {
                    const value = clearMap.get(node);
                    if (value) {
                        clearedFloat = true;
                    }
                    else if (node.data(Application.KEY_NAME, 'cleared')) {
                        clearing = true;
                    }
                }
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
                        if (node.blockStatic && leftAbove.some(item => top >= item.bounds.bottom)) {
                            if (inlineBelow) {
                                inlineBelow.push(node);
                            }
                            else {
                                inlineBelow = [node];
                            }
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
                else if (inlineBelow) {
                    inlineBelow.push(node);
                }
                else {
                    inlineBelow = [node];
                }
            });
            if (leftAbove.length) {
                leftSub = leftBelow ? [leftAbove, leftBelow] : leftAbove;
            }
            else if (leftBelow) {
                leftSub = leftBelow;
            }
            if (rightAbove.length) {
                rightSub = rightBelow ? [rightAbove, rightBelow] : rightAbove;
            }
            else if (rightBelow) {
                rightSub = rightBelow;
            }
            if (rightAbove.length + (rightBelow ? rightBelow.length : 0) === layout.size()) {
                layout.addAlign(1024 /* RIGHT */);
            }
            if (inlineAbove.length) {
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
                this.addLayout(new LayoutUI(parent, wrapper, containerType, alignmentType | (parent.blockStatic ? 32 /* BLOCK */ : 0), inlineBelow));
                layout.parent = wrapper;
            }
            layout.setContainerType(verticalMargin.containerType, verticalMargin.alignmentType | 32 /* BLOCK */);
            layout.itemCount = layerIndex.length;
            for (let i = 0; i < layout.itemCount; ++i) {
                const item = layerIndex[i];
                let segments, itemCount, floatgroup;
                if (Array.isArray(item[0])) {
                    segments = item;
                    itemCount = segments.length;
                    const grouping = flatArray(segments, Infinity).sort((a, b) => a.childIndex - b.childIndex);
                    const node = layout.node;
                    if (node.layoutVertical) {
                        floatgroup = node;
                    }
                    else {
                        floatgroup = controllerHandler.createNodeGroup(grouping[0], grouping, node);
                        this.addLayout(LayoutUI.create({
                            parent: node,
                            node: floatgroup,
                            containerType,
                            alignmentType: alignmentType | (segments.some(seg => seg === rightSub || seg === rightAbove) ? 1024 /* RIGHT */ : 0),
                            itemCount
                        }));
                    }
                }
                else {
                    segments = [item];
                    itemCount = 1;
                }
                const parent = floatgroup || layout.node;
                for (let j = 0; j < itemCount; ++j) {
                    const seg = segments[j];
                    const target = controllerHandler.createNodeGroup(seg[0], seg, parent, { flags: 2 /* DELEGATE */ | 4 /* CASCADE */ });
                    const group = new LayoutUI(parent, target, 0, 64 /* SEGMENTED */, seg);
                    if (seg === inlineAbove) {
                        group.addAlign(128 /* COLUMN */);
                        if (inheritStyle) {
                            if (boxStyle) {
                                target.inheritApply('boxStyle', boxStyle);
                            }
                            else {
                                boxStyle = target.inherit(layout.node, 'boxStyle');
                            }
                        }
                    }
                    else {
                        group.addAlign(getFloatAlignmentType(seg));
                    }
                    if (seg.some(child => child.percentWidth > 0 || child.percentHeight > 0)) {
                        const percent = controllerHandler.containerTypePercent;
                        group.setContainerType(percent.containerType, percent.alignmentType);
                        if (seg.length === 1) {
                            group.node.innerWrapped = seg[0];
                        }
                    }
                    else if (seg.length === 1 || group.linearY) {
                        group.setContainerType(containerType, alignmentType);
                    }
                    else if (!group.linearX) {
                        group.setContainerType(containerType, 1 /* UNKNOWN */);
                    }
                    else {
                        controllerHandler.processLayoutHorizontal(group);
                    }
                    this.addLayout(group);
                    if (seg === inlineAbove) {
                        this.setFloatPadding(parent, target, inlineAbove, leftSub && flatArray(leftSub), rightSub && flatArray(rightSub));
                    }
                }
            }
            return layout;
        }
        processFloatVertical(layout) {
            const { clearMap, controllerHandler } = this;
            const { containerType, alignmentType } = controllerHandler.containerTypeVertical;
            if (layout.containerType !== 0) {
                const wrapper = controllerHandler.createNodeWrapper(layout.node, layout.parent, { containerType, alignmentType, flags: 4 /* CASCADE */ });
                this.addLayout(new LayoutUI(wrapper, layout.node, containerType, alignmentType, wrapper.children));
                layout.node = wrapper;
            }
            else {
                layout.setContainerType(containerType, alignmentType);
            }
            const staticRows = [];
            const floatedRows = [];
            let current = [], floated = [], layoutVertical = true, clearReset, blockArea;
            layout.each(node => {
                if (node.blockStatic && floated.length === 0) {
                    current.push(node);
                    blockArea = true;
                }
                else {
                    if (clearMap.has(node)) {
                        if (!node.floating) {
                            node.setBox(1 /* MARGIN_TOP */, { reset: 1 });
                            staticRows.push(current.slice(0));
                            floatedRows.push(floated.slice(0));
                            current = [];
                            floated = [];
                        }
                        else {
                            clearReset = true;
                        }
                    }
                    if (node.floating) {
                        if (blockArea) {
                            staticRows.push(current.slice(0));
                            floatedRows.push(null);
                            current = [];
                            floated = [];
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
                const { containerType: containerTypeParent, alignmentType: alignmentTypeParent } = controllerHandler.containerTypeVerticalMargin;
                const node = layout.node;
                for (let i = 0, length = Math.max(floatedRows.length, staticRows.length); i < length; ++i) {
                    const children = staticRows[i];
                    const floating = floatedRows[i];
                    const blockCount = children.length;
                    if (!floating && blockCount) {
                        const layoutType = controllerHandler.containerTypeVertical;
                        this.addLayout(new LayoutUI(node, controllerHandler.createNodeGroup(children[0], children, node), layoutType.containerType, layoutType.alignmentType | 64 /* SEGMENTED */ | 32 /* BLOCK */, children));
                    }
                    else {
                        const wrapper = [];
                        let alignmentFloat = 0, subgroup;
                        if (floating) {
                            if (floating.length > 1) {
                                const floatgroup = controllerHandler.createNodeGroup(floating[0], floating);
                                alignmentFloat = 256 /* FLOAT */;
                                if (blockCount === 0 && floating.every(item => item.float === 'right')) {
                                    alignmentFloat |= 1024 /* RIGHT */;
                                }
                                wrapper.push(floatgroup);
                            }
                            else {
                                wrapper.push(floating[0]);
                            }
                        }
                        if (blockCount > 1 || floating) {
                            subgroup = controllerHandler.createNodeGroup(children[0], children);
                            wrapper.push(subgroup);
                        }
                        else if (blockCount === 1) {
                            wrapper.push(children[0]);
                        }
                        const container = controllerHandler.createNodeGroup((floating || children)[0], wrapper, node);
                        this.addLayout(new LayoutUI(node, container, containerTypeParent, alignmentTypeParent | alignmentFloat, wrapper));
                        for (const item of wrapper) {
                            this.addLayout(new LayoutUI(container, item, containerType, alignmentType | 64 /* SEGMENTED */ | 32 /* BLOCK */));
                        }
                        if (blockCount && floating && subgroup) {
                            const [leftAbove, rightAbove] = partitionArray$1(floating, item => item.float !== 'right');
                            this.setFloatPadding(node, subgroup, children, leftAbove, rightAbove);
                        }
                    }
                }
            }
            return layout;
        }
        createPseduoElement(sessionId, resourceId, element, pseudoElt, elementRoot = element.shadowRoot || element) {
            var _a;
            let styleMap = getElementCache$1(element, 'styleMap' + pseudoElt, sessionId);
            if (element.tagName === 'Q') {
                if (!styleMap) {
                    styleMap = {};
                    setElementCache$1(element, 'styleMap' + pseudoElt, styleMap, sessionId);
                }
                styleMap.content || (styleMap.content = getStyle$2(element, pseudoElt).content || (pseudoElt === '::before' ? 'open-quote' : 'close-quote'));
            }
            if (styleMap) {
                let value = styleMap.content;
                if (value) {
                    const absolute = hasCoords$2(styleMap.position || (styleMap.position = 'static'));
                    if (absolute && +styleMap.opacity <= 0) {
                        return;
                    }
                    const textContent = trimBoth(value, '"');
                    if (!isString(textContent)) {
                        if (pseudoElt === '::after') {
                            const checkPseudoAfter = (sibling) => sibling.nodeName === '#text' && !/\s+$/.test(sibling.textContent);
                            if ((absolute || !textContent || !checkPseudoAfter(element.lastChild)) && !checkPseudoDimension(styleMap, true, absolute)) {
                                return;
                            }
                        }
                        else {
                            const childNodes = elementRoot.childNodes;
                            for (let i = 0, length = childNodes.length; i < length; ++i) {
                                const child = childNodes[i];
                                if (child.nodeName[0] === '#') {
                                    if (child.nodeName === '#text' && isString(child.textContent)) {
                                        break;
                                    }
                                }
                                else {
                                    const style = getStyle$2(child);
                                    if (hasCoords$2(styleMap.position)) {
                                        continue;
                                    }
                                    else if (style.float !== 'none') {
                                        return;
                                    }
                                    break;
                                }
                            }
                            if (!checkPseudoDimension(styleMap, false, absolute)) {
                                return;
                            }
                        }
                    }
                    else if (value === 'inherit') {
                        let current = element;
                        do {
                            value = getStyle$2(current).content;
                            if (value !== 'inherit') {
                                break;
                            }
                            current = current.parentElement;
                        } while (current);
                    }
                    let content = '', tagName;
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
                                content = getPseudoQuoteValue(element, pseudoElt, '“', "‘", sessionId);
                            }
                            break;
                        case 'close-quote':
                            if (pseudoElt === '::after') {
                                content = getPseudoQuoteValue(element, pseudoElt, '”', "’", sessionId);
                            }
                            break;
                        default: {
                            const url = resolveURL(value);
                            if (url) {
                                if (ResourceUI.hasMimeType(this._controllerSettings.mimeType.image, url)) {
                                    tagName = 'img';
                                    content = url;
                                }
                            }
                            else {
                                const style = getStyle$2(element);
                                const getCounterIncrementValue = (parent, counterName, fallback) => { var _a; return getCounterValue((_a = getElementCache$1(parent, 'styleMap' + pseudoElt, sessionId)) === null || _a === void 0 ? void 0 : _a.counterIncrement, counterName, fallback); };
                                let found, match;
                                while (match = REGEXP_PSEUDOCOUNTER.exec(value)) {
                                    if (match[1]) {
                                        content += getNamedItem$1(element, match[1].trim());
                                    }
                                    else if (match[2] || match[5]) {
                                        const counterType = match[2] === 'counter';
                                        let counterName, styleName;
                                        if (counterType) {
                                            counterName = match[3];
                                            styleName = match[4] || 'decimal';
                                        }
                                        else {
                                            counterName = match[6];
                                            styleName = match[8] || 'decimal';
                                        }
                                        const initialValue = ((_a = getCounterIncrementValue(element, counterName, 0)) !== null && _a !== void 0 ? _a : 1) + (getCounterValue(style.counterReset, counterName, 0) || 0);
                                        const subcounter = [];
                                        let current = element, counter = initialValue, ascending, lastResetElement;
                                        const incrementCounter = (increment, pseudo) => {
                                            if (subcounter.length === 0) {
                                                counter += increment;
                                            }
                                            else if (ascending || pseudo) {
                                                subcounter[subcounter.length - 1] += increment;
                                            }
                                        };
                                        const cascadeCounterSibling = (sibling) => {
                                            if (getCounterValue(getStyle$2(sibling).counterReset, counterName) === undefined) {
                                                iterateArray$1(sibling.children, (item) => {
                                                    if (item.className !== '__squared-pseudo') {
                                                        let increment = getCounterIncrementValue(item, counterName);
                                                        if (increment) {
                                                            incrementCounter(increment, true);
                                                        }
                                                        const childStyle = getStyle$2(item);
                                                        if (increment = getCounterValue(childStyle.counterIncrement, counterName)) {
                                                            incrementCounter(increment, false);
                                                        }
                                                        increment = getCounterValue(childStyle.counterReset, counterName);
                                                        if (increment !== undefined) {
                                                            return true;
                                                        }
                                                        cascadeCounterSibling(item);
                                                    }
                                                });
                                            }
                                        };
                                        while (current) {
                                            ascending = false;
                                            if (current.previousElementSibling) {
                                                if (current = current.previousElementSibling) {
                                                    cascadeCounterSibling(current);
                                                }
                                                else {
                                                    break;
                                                }
                                            }
                                            else {
                                                current = current.parentElement;
                                                if (!current) {
                                                    break;
                                                }
                                                ascending = true;
                                            }
                                            if (current.className !== '__squared-pseudo') {
                                                const pesudoIncrement = getCounterIncrementValue(current, counterName);
                                                if (pesudoIncrement) {
                                                    incrementCounter(pesudoIncrement, true);
                                                }
                                                const currentStyle = getStyle$2(current);
                                                const counterIncrement = getCounterValue(currentStyle.counterIncrement, counterName);
                                                if (counterIncrement) {
                                                    incrementCounter(counterIncrement, false);
                                                }
                                                const counterReset = getCounterValue(currentStyle.counterReset, counterName);
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
                                                content += subcounter.reduce((a, b) => a + convertListStyle(styleName, b, true) + textValue, '');
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
                                REGEXP_PSEUDOCOUNTER.lastIndex = 0;
                                if (!found) {
                                    content = value;
                                }
                            }
                            break;
                        }
                    }
                    if (content || value === '""') {
                        styleMap.display || (styleMap.display = 'inline');
                        tagName || (tagName = /^(inline|table)/.test(styleMap.display) ? 'span' : 'div');
                        const pseudoElement = document.createElement(tagName);
                        pseudoElement.className = '__squared-pseudo';
                        pseudoElement.style.display = 'none';
                        if (pseudoElt === '::before') {
                            elementRoot.insertBefore(pseudoElement, elementRoot.childNodes[0]);
                        }
                        else {
                            elementRoot.appendChild(pseudoElement);
                        }
                        if (content) {
                            if (tagName === 'img') {
                                pseudoElement.src = content;
                                const image = this.resourceHandler.getImage(resourceId, content);
                                if (image) {
                                    if (image.width) {
                                        styleMap.width || (styleMap.width = image.width + 'px');
                                    }
                                    if (image.height) {
                                        styleMap.height || (styleMap.height = image.height + 'px');
                                    }
                                }
                            }
                            else {
                                pseudoElement.innerText = content;
                            }
                        }
                        const style = getStyle$2(element, pseudoElt);
                        for (const attr in styleMap) {
                            if (attr !== 'display') {
                                switch (value = styleMap[attr]) {
                                    case 'inherit':
                                    case 'unset':
                                    case 'revert':
                                        value = style[attr];
                                        styleMap[attr] = value;
                                        break;
                                }
                                pseudoElement.style[attr] = value;
                            }
                        }
                        setElementCache$1(pseudoElement, 'styleMap', styleMap, sessionId);
                        setElementCache$1(pseudoElement, 'pseudoElt', pseudoElt, sessionId);
                        return pseudoElement;
                    }
                }
            }
        }
        setFloatPadding(parent, target, inlineAbove, leftAbove = [], rightAbove = []) {
            const requirePadding = (node, depth) => node.textElement && (node.blockStatic || node.multiline || depth === 1);
            const paddingNodes = [];
            for (let i = 0, length = inlineAbove.length; i < length; ++i) {
                const child = inlineAbove[i];
                if (requirePadding(child) || child.centerAligned) {
                    paddingNodes.push(child);
                }
                if (child.blockStatic) {
                    paddingNodes.push(...child.cascade((item) => requirePadding(item, item.depth - child.depth)));
                }
            }
            const length = paddingNodes.length;
            if (length === 0) {
                return;
            }
            const bottom = target.bounds.bottom;
            let q = leftAbove.length;
            if (q) {
                let floatPosition = -Infinity, marginOffset = 0, spacing;
                for (let i = 0; i < q; ++i) {
                    const child = leftAbove[i];
                    if (child.bounds.top < bottom) {
                        const marginRight = child.marginRight;
                        let right = child.bounds.right;
                        if (marginRight > 0) {
                            right += marginRight;
                        }
                        if (right > floatPosition) {
                            floatPosition = right;
                            if (marginRight < 0) {
                                marginOffset = marginRight;
                            }
                            spacing = true;
                        }
                        else if (right === floatPosition && marginRight <= 0) {
                            spacing = false;
                        }
                    }
                }
                if (floatPosition !== -Infinity) {
                    let marginLeft = -Infinity;
                    for (let i = 0; i < length; ++i) {
                        const child = paddingNodes[i];
                        if (Math.floor(child.linear.left) <= floatPosition || child.centerAligned) {
                            marginLeft = Math.max(marginLeft, child.marginLeft);
                        }
                    }
                    if (marginLeft !== -Infinity) {
                        const offset = floatPosition + marginOffset - (parent.box.left + marginLeft + Math.max(...target.map((child) => !paddingNodes.includes(child) ? child.marginLeft : 0)));
                        if (offset > 0 && offset < parent.actualBoxWidth()) {
                            target.modifyBox(128 /* PADDING_LEFT */, offset + (!spacing && target.find(child => child.multiline, { cascade: item => !item.hasPX('width', { percent: false }) }) ? Math.max(marginLeft, this._controllerSettings.deviations.textMarginBoundarySize) : 0));
                            setColumnMaxWidth(leftAbove, offset);
                        }
                    }
                }
            }
            if (q = rightAbove.length) {
                let floatPosition = Infinity, marginOffset = 0, spacing;
                for (let i = 0; i < q; ++i) {
                    const child = rightAbove[i];
                    if (child.bounds.top < bottom) {
                        const marginLeft = child.marginLeft;
                        const left = child.linear.left;
                        if (left < floatPosition) {
                            floatPosition = left;
                            if (marginLeft < 0) {
                                marginOffset = marginLeft;
                            }
                            spacing = marginLeft > 0;
                        }
                        else if (left === floatPosition && marginLeft <= 0) {
                            spacing = false;
                        }
                    }
                }
                if (floatPosition !== Infinity) {
                    let marginRight = -Infinity;
                    for (let i = 0; i < length; ++i) {
                        const child = paddingNodes[i];
                        if (child.multiline || child.centerAligned || Math.ceil(child.linear.right) >= floatPosition) {
                            marginRight = Math.max(marginRight, child.marginRight);
                        }
                    }
                    if (marginRight !== -Infinity) {
                        const offset = parent.box.right - (floatPosition - marginOffset + marginRight + Math.max(...target.map((child) => !paddingNodes.includes(child) ? child.marginRight : 0)));
                        if (offset > 0 && offset < parent.actualBoxWidth()) {
                            target.modifyBox(32 /* PADDING_RIGHT */, offset + (!spacing && target.find(child => child.multiline, { cascade: item => !item.hasPX('width', { percent: false }) }) ? Math.max(marginRight, this._controllerSettings.deviations.textMarginBoundarySize) : 0));
                            setColumnMaxWidth(rightAbove, offset);
                        }
                    }
                }
            }
        }
        createAssetOptions(options) {
            return options ? Object.assign(Object.assign({}, options), { assets: options.assets ? this.layouts.concat(options.assets) : this.layouts }) : { assets: this.layouts };
        }
        setResourceId() {
            ResourceUI.ASSETS[this._resourceId = ResourceUI.ASSETS.length] = null;
        }
        get mainElement() {
            return document.body;
        }
        get resourceId() {
            return this._resourceId;
        }
        get layouts() {
            return this._layouts.sort((a, b) => {
                const indexA = a.index;
                const indexB = b.index;
                if (indexA !== indexB) {
                    if (indexA === 0 || indexB === Infinity || indexB === -1 && indexA !== Infinity) {
                        return -1;
                    }
                    else if (indexB === 0 || indexA === Infinity || indexA === -1 && indexB !== Infinity) {
                        return 1;
                    }
                    return indexA - indexB;
                }
                return 0;
            });
        }
        get clearMap() {
            return this.session.clearMap;
        }
    }

    const { isUserAgent } = squared.lib.client;
    const { CSS_PROPERTIES, formatPX: formatPX$3, getStyle: getStyle$1, hasCoords: hasCoords$1, isLength: isLength$4, isPercent: isPercent$2, parseUnit } = squared.lib.css;
    const { getParentElement, withinViewport } = squared.lib.dom;
    const { getElementCache, setElementCache } = squared.lib.session;
    const { capitalize, iterateArray, joinArray } = squared.lib.util;
    const BORDER_BOX = [
        CSS_PROPERTIES.borderTop.value,
        CSS_PROPERTIES.borderRight.value,
        CSS_PROPERTIES.borderBottom.value,
        CSS_PROPERTIES.borderLeft.value
    ];
    function setBorderStyle$1(styleMap, defaultColor) {
        let result = false;
        for (let i = 0; i < 4; ++i) {
            const border = BORDER_BOX[i];
            const attr = border[0];
            if (!styleMap[attr]) {
                styleMap[attr] = '1px';
                styleMap[border[1]] = 'outset';
                styleMap[border[2]] = defaultColor;
                result = true;
            }
        }
        return result;
    }
    function setButtonStyle(styleMap, applied, defaultColor) {
        if (applied) {
            if (hasEmptyStyle(styleMap.backgroundColor)) {
                styleMap.backgroundColor = defaultColor;
            }
        }
        styleMap.textAlign || (styleMap.textAlign = 'center');
        styleMap.paddingTop || (styleMap.paddingTop = '2px');
        styleMap.paddingRight || (styleMap.paddingRight = '6px');
        styleMap.paddingBottom || (styleMap.paddingBottom = '3px');
        styleMap.paddingLeft || (styleMap.paddingLeft = '6px');
    }
    function pushIndent(value, depth, char = '\t', indent) {
        if (depth > 0) {
            indent || (indent = char.repeat(depth));
            return joinArray(value.split('\n'), line => line ? indent + line : '', '\n') + '\n';
        }
        return value;
    }
    function pushIndentArray(values, depth, char = '\t', separator = '') {
        if (depth > 0) {
            const indent = char.repeat(depth);
            let result = '';
            for (let i = 0, length = values.length; i < length; ++i) {
                result += (i > 0 ? separator : '') + pushIndent(values[i], depth, char, indent);
            }
            return result;
        }
        return values.join(separator);
    }
    const hasEmptyStyle = (value) => !value || value === 'initial';
    class ControllerUI extends Controller {
        constructor() {
            super(...arguments);
            this._beforeOutside = new WeakMap();
            this._beforeInside = new WeakMap();
            this._afterInside = new WeakMap();
            this._afterOutside = new WeakMap();
            this._requireFormat = false;
        }
        init() {
            const unsupported = this.localSettings.unsupported;
            this._unsupportedCascade = unsupported.cascade;
            this._unsupportedTagName = unsupported.tagName;
            this._innerXmlTags = this.localSettings.layout.innerXmlTags;
            this._settingsStyle = this.localSettings.style;
        }
        preventNodeCascade(node) {
            return this._unsupportedCascade.includes(node.tagName);
        }
        includeElement(element) {
            let tagName = element.tagName;
            if (tagName === 'INPUT') {
                tagName += ':' + element.type;
            }
            return !this._unsupportedTagName.includes(tagName) || element.contentEditable === 'true';
        }
        reset() {
            this._requireFormat = false;
        }
        applyDefaultStyles(processing, element) {
            const sessionId = processing.sessionId;
            if (element.nodeName.charAt(0) === '#') {
                setElementCache(element, 'styleMap', {
                    position: 'static',
                    display: 'inline',
                    verticalAlign: 'baseline',
                    float: 'none'
                }, sessionId);
            }
            else {
                let styleMap = getElementCache(element, 'styleMap', sessionId);
                if (!styleMap) {
                    styleMap = {};
                    setElementCache(element, 'styleMap', styleMap, sessionId);
                }
                if (isUserAgent(4 /* FIREFOX */)) {
                    switch (element.tagName) {
                        case 'BODY':
                            if (styleMap.backgroundColor === 'rgba(0, 0, 0, 0)') {
                                styleMap.backgroundColor = '';
                            }
                            break;
                        case 'INPUT':
                        case 'SELECT':
                        case 'BUTTON':
                        case 'TEXTAREA':
                            styleMap.display || (styleMap.display = 'inline-block');
                            break;
                        case 'FIELDSET':
                            styleMap.display || (styleMap.display = 'block');
                            break;
                        case 'RUBY':
                            styleMap.display || (styleMap.display = 'inline');
                            break;
                    }
                }
                switch (element.tagName) {
                    case 'A':
                        styleMap.color || (styleMap.color = this._settingsStyle.anchorFontColor);
                        styleMap.textDecorationLine || (styleMap.textDecorationLine = 'underline');
                        break;
                    case 'INPUT': {
                        styleMap.fontSize || (styleMap.fontSize = this._settingsStyle.formFontSize);
                        const type = element.type;
                        switch (type) {
                            case 'radio':
                            case 'checkbox':
                            case 'image':
                                break;
                            case 'file':
                            case 'reset':
                            case 'submit':
                            case 'button':
                                setButtonStyle(styleMap, setBorderStyle$1(styleMap, this._settingsStyle.inputBorderColor), this._settingsStyle.inputBackgroundColor);
                                break;
                            default:
                                setBorderStyle$1(styleMap, this._settingsStyle.inputBorderColor);
                                break;
                        }
                        break;
                    }
                    case 'BUTTON':
                        styleMap.fontSize || (styleMap.fontSize = this._settingsStyle.formFontSize);
                        setButtonStyle(styleMap, setBorderStyle$1(styleMap, this._settingsStyle.inputBorderColor), this._settingsStyle.inputBackgroundColor);
                        break;
                    case 'TEXTAREA':
                    case 'SELECT':
                        styleMap.fontSize || (styleMap.fontSize = this._settingsStyle.formFontSize);
                        setBorderStyle$1(styleMap, this._settingsStyle.inputBorderColor);
                        break;
                    case 'BODY':
                        if (hasEmptyStyle(styleMap.backgroundColor) && (getComputedStyle(document.documentElement).backgroundColor === 'rgba(0, 0, 0, 0)')) {
                            styleMap.backgroundColor = 'rgb(255, 255, 255)';
                        }
                        break;
                    case 'H1':
                        if (!styleMap.fontSize) {
                            let parent = element.parentElement;
                            found: {
                                while (parent) {
                                    switch (parent.tagName) {
                                        case 'ARTICLE':
                                        case 'ASIDE':
                                        case 'NAV':
                                        case 'SECTION':
                                            styleMap.fontSize = '1.5em';
                                            break found;
                                        default:
                                            parent = parent.parentElement;
                                            break;
                                    }
                                }
                                styleMap.fontSize = '2em';
                            }
                        }
                        break;
                    case 'H2':
                        styleMap.fontSize || (styleMap.fontSize = '1.5em');
                        break;
                    case 'H3':
                        styleMap.fontSize || (styleMap.fontSize = '1.17em');
                        break;
                    case 'H4':
                        styleMap.fontSize || (styleMap.fontSize = '1em');
                        break;
                    case 'H5':
                        styleMap.fontSize || (styleMap.fontSize = '0.83em');
                        break;
                    case 'H6':
                        styleMap.fontSize || (styleMap.fontSize = '0.67em');
                        break;
                    case 'FORM':
                        styleMap.marginTop || (styleMap.marginTop = '0px');
                        break;
                    case 'LI':
                        styleMap.listStyleImage || (styleMap.listStyleImage = 'inherit');
                        break;
                    case 'SUP':
                    case 'SUB':
                    case 'SMALL':
                        styleMap.fontSize || (styleMap.fontSize = 'smaller');
                        break;
                    case 'RT':
                        if (!styleMap.fontSize && element.parentElement.tagName === 'RUBY') {
                            styleMap.fontSize = '50%';
                        }
                        break;
                    case 'IFRAME':
                        if (!styleMap.display || styleMap.display === 'inline') {
                            styleMap.display = 'inline-block';
                        }
                    case 'IMG':
                    case 'CANVAS':
                    case 'svg':
                    case 'VIDEO':
                    case 'OBJECT':
                    case 'EMBED':
                        this.setElementDimension(processing, element, styleMap, 'width', 'height');
                        this.setElementDimension(processing, element, styleMap, 'height', 'width');
                        break;
                }
            }
        }
        addBeforeOutsideTemplate(node, value, format = true, index = -1) {
            let template = this._beforeOutside.get(node);
            if (!template) {
                template = [];
                this._beforeOutside.set(node, template);
            }
            if (index >= 0 && index < template.length) {
                template.splice(index, 0, value);
            }
            else {
                template.push(value);
            }
            if (format) {
                this._requireFormat = true;
            }
        }
        addBeforeInsideTemplate(node, value, format = true, index = -1) {
            let template = this._beforeInside.get(node);
            if (!template) {
                template = [];
                this._beforeInside.set(node, template);
            }
            if (index >= 0 && index < template.length) {
                template.splice(index, 0, value);
            }
            else {
                template.push(value);
            }
            if (format) {
                this._requireFormat = true;
            }
        }
        addAfterInsideTemplate(node, value, format = true, index = -1) {
            let template = this._afterInside.get(node);
            if (!template) {
                template = [];
                this._afterInside.set(node, template);
            }
            if (index >= 0 && index < template.length) {
                template.splice(index, 0, value);
            }
            else {
                template.push(value);
            }
            if (format) {
                this._requireFormat = true;
            }
        }
        addAfterOutsideTemplate(node, value, format = true, index = -1) {
            let template = this._afterOutside.get(node);
            if (!template) {
                template = [];
                this._afterOutside.set(node, template);
            }
            if (index >= 0 && index < template.length) {
                template.splice(index, 0, value);
            }
            else {
                template.push(value);
            }
            if (format) {
                this._requireFormat = true;
            }
        }
        getBeforeOutsideTemplate(node, depth) {
            const template = this._beforeOutside.get(node);
            return template ? pushIndentArray(template, depth) : '';
        }
        getBeforeInsideTemplate(node, depth) {
            const template = this._beforeInside.get(node);
            return template ? pushIndentArray(template, depth) : '';
        }
        getAfterInsideTemplate(node, depth) {
            const template = this._afterInside.get(node);
            return template ? pushIndentArray(template, depth) : '';
        }
        getAfterOutsideTemplate(node, depth) {
            const template = this._afterOutside.get(node);
            return template ? pushIndentArray(template, depth) : '';
        }
        hasAppendProcessing(node) {
            return node ? this._beforeOutside.has(node) || this._beforeInside.has(node) || this._afterInside.has(node) || this._afterOutside.has(node) : this._requireFormat;
        }
        visibleElement(element, sessionId, pseudoElt) {
            let style, width, height, display;
            if (!pseudoElt) {
                style = getStyle$1(element);
                display = style.display;
                if (display !== 'none') {
                    const bounds = element.getBoundingClientRect();
                    if (!withinViewport(bounds)) {
                        return false;
                    }
                    ({ width, height } = bounds);
                    setElementCache(element, 'clientRect', bounds, sessionId);
                }
                else {
                    return false;
                }
            }
            else {
                const parentElement = getParentElement(element);
                style = parentElement ? getStyle$1(parentElement, pseudoElt) : getStyle$1(element);
                display = style.display;
                if (display === 'none') {
                    return false;
                }
                width = 1;
                height = 1;
            }
            if (width && height) {
                return style.visibility === 'visible' || !hasCoords$1(style.position);
            }
            let parent = element.parentElement;
            while (parent) {
                switch (parent.tagName) {
                    case 'DETAILS':
                        return false;
                    case 'SUMMARY':
                        return true;
                    default:
                        parent = parent.parentElement;
                        break;
                }
            }
            switch (element.tagName) {
                case 'IMG':
                    return display !== 'none';
                case 'SLOT':
                    return true;
                default:
                    return !hasCoords$1(style.position) && (display === 'block' || width > 0 && style.float !== 'none' || style.clear !== 'none') || iterateArray(element.children, (item) => this.visibleElement(item, sessionId)) === Infinity;
            }
        }
        evaluateNonStatic(documentRoot, cache) {
            const altered = new Set();
            const escaped = new Map();
            cache.each(node => {
                if (node.floating) {
                    if (node.float === 'left') {
                        const actualParent = node.actualParent;
                        let parent = actualParent, previousParent;
                        while (parent && parent.tagName === 'P' && !parent.documentRoot) {
                            previousParent = parent;
                            parent = parent.actualParent;
                        }
                        if (parent && previousParent && parent !== actualParent && parent.tagName === 'DIV') {
                            if (escaped.has(previousParent)) {
                                escaped.get(previousParent).appending.push(node);
                            }
                            else {
                                escaped.set(previousParent, { parent, appending: [node] });
                            }
                        }
                    }
                }
                else if (!node.pageFlow && !node.documentRoot) {
                    const actualParent = node.actualParent;
                    const absoluteParent = node.absoluteParent;
                    let parent;
                    switch (node.valueOf('position')) {
                        case 'fixed':
                            if (!node.autoPosition) {
                                parent = documentRoot;
                                break;
                            }
                        case 'absolute':
                            if (node.autoPosition) {
                                if (!node.siblingsLeading.some(item => item.multiline || item.excluded && !item.blockStatic) && node.withinX(actualParent.box, { dimension: 'linear' }) && node.withinY(actualParent.box, { dimension: 'linear' })) {
                                    node.cssApply({ display: 'inline-block', verticalAlign: 'top' }, true, true);
                                    parent = actualParent;
                                    break;
                                }
                                node.autoPosition = false;
                            }
                            parent = absoluteParent;
                            if (this.userSettings.supportNegativeLeftTop && !(node.hasPX('top') && node.hasPX('bottom') || node.hasPX('left') && node.hasPX('right'))) {
                                let outside;
                                while (parent && parent.bounds.height) {
                                    if (parent.layoutElement) {
                                        parent = absoluteParent;
                                        break;
                                    }
                                    else if (parent !== documentRoot && (!parent.rightAligned && !parent.centerAligned || !parent.pageFlow)) {
                                        const linear = parent.linear;
                                        if (!outside) {
                                            const overflowX = parent.valueOf('overflowX') === 'hidden';
                                            const overflowY = parent.valueOf('overflowY') === 'hidden';
                                            if (overflowX && overflowY) {
                                                break;
                                            }
                                            const outsideX = !overflowX && node.outsideX(linear);
                                            const outsideY = !overflowY && node.outsideY(linear);
                                            if (outsideX && (node.left < 0 || node.right > 0) ||
                                                outsideY && (node.top < 0 || node.bottom !== 0) ||
                                                outsideX && outsideY && (!parent.pageFlow || parent.actualParent.documentRoot && (node.top > 0 || node.left > 0)) ||
                                                !overflowX && ((node.left < 0 || node.right > 0) && Math.ceil(node.bounds.right) < linear.left || (node.left > 0 || node.right < 0) && Math.floor(node.bounds.left) > linear.right) && parent.find(item => item.pageFlow) ||
                                                !overflowY && ((node.top < 0 || node.bottom > 0) && Math.ceil(node.bounds.bottom) < parent.bounds.top || (node.top > 0 || node.bottom < 0) && Math.floor(node.bounds.top) > parent.bounds.bottom) ||
                                                !overflowX && !overflowY && !node.intersectX(linear) && !node.intersectY(linear)) {
                                                outside = true;
                                            }
                                            else {
                                                break;
                                            }
                                        }
                                        else if (node.withinX(linear) && node.withinY(linear)) {
                                            break;
                                        }
                                        parent = parent.actualParent;
                                    }
                                    else {
                                        break;
                                    }
                                }
                            }
                            break;
                    }
                    parent || (parent = documentRoot);
                    if (parent !== actualParent) {
                        if (absoluteParent.positionRelative && parent !== absoluteParent) {
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
                            node.resetBounds(true);
                        }
                        let opacity = node.opacity, current = actualParent;
                        do {
                            opacity *= current.opacity;
                            current = current.actualParent;
                        } while (current && current !== parent);
                        node.cssInitial('opacity', { value: opacity.toString() });
                        node.parent = parent;
                        altered.add(parent);
                    }
                    node.documentParent = parent;
                }
            });
            for (const [floated, data] of escaped) {
                const { parent, appending } = data;
                const children = parent.children;
                const containerIndex = children.findIndex(item => item === floated);
                if (containerIndex !== -1) {
                    const childIndex = floated.childIndex;
                    const documentChildren = parent.naturalChildren.slice(0);
                    const target = children[containerIndex];
                    const depth = parent.depth + 1;
                    const actualParent = new Set();
                    for (let i = 0, j = 0, k = 0, prepend = false; i < appending.length; ++i) {
                        const item = appending[i];
                        if (item.actualParent.firstStaticChild === item) {
                            prepend = true;
                        }
                        else if (prepend) {
                            const previous = appending[i - 1];
                            prepend = previous.nextSibling === item && previous.float === item.float;
                        }
                        const increment = j + (prepend ? 0 : k + 1);
                        const l = childIndex + increment;
                        const m = containerIndex + increment;
                        documentChildren.splice(l, 0, item);
                        children.splice(m, 0, item);
                        if (prepend) {
                            target.siblingsLeading.unshift(item);
                            ++j;
                        }
                        else {
                            ++k;
                        }
                        item.parent.remove(item);
                        item.init(parent, depth);
                        item.documentParent = parent;
                        const clear = item.valueOf('clear');
                        switch (clear) {
                            case 'left':
                            case 'right':
                            case 'both':
                                notFound: {
                                    let clearing;
                                    for (let n = l - 1; n >= 0; --n) {
                                        const sibling = documentChildren[n];
                                        if (sibling.floating) {
                                            const float = sibling.float;
                                            if (clear === 'both' || float === clear) {
                                                this.application.clearMap.set(item, clear);
                                                let nextSibling = item.nextElementSibling;
                                                while (nextSibling) {
                                                    if (nextSibling.floating && !appending.includes(nextSibling)) {
                                                        appending.push(nextSibling);
                                                    }
                                                    nextSibling = nextSibling.nextElementSibling;
                                                }
                                                break;
                                            }
                                            else if (float === clearing) {
                                                break;
                                            }
                                        }
                                        else {
                                            const clearBefore = sibling.valueOf('clear');
                                            switch (clearBefore) {
                                                case 'left':
                                                case 'right':
                                                    if (clear === clearBefore) {
                                                        break notFound;
                                                    }
                                                    else {
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
                    parent.floatContainer = true;
                    for (let i = 0, length = appending.length, q = documentChildren.length; i < length; ++i) {
                        const item = appending[i];
                        const index = documentChildren.findIndex(child => child === item);
                        if (index !== -1) {
                            const siblingsLeading = [];
                            const siblingsTrailing = [];
                            for (let j = index - 1; j >= 0; --j) {
                                const sibling = documentChildren[j];
                                siblingsLeading.push(sibling);
                                if (!sibling.excluded) {
                                    break;
                                }
                            }
                            for (let j = index + 1; j < q; ++j) {
                                const sibling = documentChildren[j];
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
                        if (!item.find(child => child.floating)) {
                            item.floatContainer = false;
                        }
                    }
                }
            }
            for (const node of altered) {
                const layers = [];
                node.each((item) => {
                    if (item.parent !== item.actualParent) {
                        const sibling = node.find((adjacent) => {
                            if (adjacent.naturalElements.includes(item)) {
                                return true;
                            }
                            const nested = adjacent.cascade();
                            return item.ascend({ condition: child => nested.includes(child) }).length > 0;
                        });
                        if (sibling) {
                            const index = sibling.childIndex + (item.zIndex >= 0 || sibling !== item.actualParent ? 1 : 0);
                            (layers[index] || (layers[index] = [])).push(item);
                        }
                    }
                });
                const length = layers.length;
                if (length) {
                    const children = [];
                    for (let i = 0; i < length; ++i) {
                        const order = layers[i];
                        if (order) {
                            order.sort((a, b) => {
                                if (a.parent === b.parent) {
                                    const zA = a.zIndex;
                                    const zB = b.zIndex;
                                    return zA === zB ? a.id - b.id : zA - zB;
                                }
                                return 0;
                            });
                            children.push(...order);
                        }
                    }
                    node.each((item) => {
                        if (!children.includes(item)) {
                            children.push(item);
                        }
                    });
                    node.retainAs(children);
                }
            }
        }
        sortInitialCache(cache) {
            cache.sort((a, b) => {
                let depth = a.depth - b.depth;
                if (depth !== 0) {
                    return depth;
                }
                const parentA = a.documentParent;
                const parentB = b.documentParent;
                if (parentA !== parentB) {
                    depth = parentA.depth - parentB.depth;
                    if (depth !== 0) {
                        return depth;
                    }
                    else if (parentA.actualParent === parentB.actualParent) {
                        return parentA.childIndex - parentB.childIndex;
                    }
                    return parentA.id - parentB.id;
                }
                return 0;
            });
        }
        writeDocument(templates, depth, showAttributes) {
            const indent = '\t'.repeat(depth);
            let output = '';
            for (let i = 0, length = templates.length; i < length; ++i) {
                const item = templates[i];
                switch (item.type) {
                    case 1 /* XML */: {
                        const { node, controlName, attributes } = item;
                        const renderTemplates = node.renderTemplates;
                        const next = depth + 1;
                        const previous = node.depth < 0 ? depth + node.depth : depth;
                        const beforeInside = this.getBeforeInsideTemplate(node, next);
                        const afterInside = this.getAfterInsideTemplate(node, next);
                        output +=
                            this.getBeforeOutsideTemplate(node, previous) + indent +
                                `<${controlName + (depth === 0 ? '{#0}' : '')}` +
                                (showAttributes ? !attributes ? node.extractAttributes(next) : pushIndent(attributes, next) : '') +
                                (renderTemplates || beforeInside || afterInside || this._innerXmlTags.includes(controlName)
                                    ? '>\n' +
                                        beforeInside +
                                        (renderTemplates ? this.writeDocument(this.sortRenderPosition(node, renderTemplates), next, showAttributes) : '') +
                                        afterInside +
                                        indent + `</${controlName}>`
                                    : ' />') + '\n' +
                                this.getAfterOutsideTemplate(node, previous);
                        break;
                    }
                    case 2 /* INCLUDE */:
                        output += pushIndent(item.content, depth);
                        break;
                }
            }
            return output;
        }
        getEnclosingXmlTag(controlName, attributes = '', content = '') {
            return '<' + controlName + attributes + (content || this._innerXmlTags.includes(controlName) ? `>\n${content}</${controlName}>\n` : ' />\n');
        }
        setElementDimension(processing, element, styleMap, attr, opposing) {
            var _a;
            const dimension = styleMap[attr];
            if (!dimension || dimension === 'auto') {
                const match = new RegExp(`\\s+${attr}="([^"]+)"`).exec(element.outerHTML);
                if (match) {
                    const value = match[1];
                    if (isPercent$2(value)) {
                        styleMap[attr] = value;
                    }
                    else if (isLength$4(value)) {
                        styleMap[attr] = value + 'px';
                    }
                }
                else if (element.clientWidth === 300 && element.clientHeight === 150 && !((element instanceof HTMLObjectElement || element instanceof HTMLEmbedElement) && element.type.startsWith('image/'))) {
                    if (attr === 'width') {
                        styleMap.width = '300px';
                    }
                    else {
                        styleMap.height = '150px';
                    }
                }
                else {
                    const image = (_a = this.application.resourceHandler) === null || _a === void 0 ? void 0 : _a.getImage(processing.resourceId, element.src);
                    if (image && image.width && image.height) {
                        const value = styleMap[opposing];
                        if (value && isLength$4(value)) {
                            const attrMax = 'max' + capitalize(attr);
                            if (!styleMap[attrMax] || !isPercent$2(attrMax)) {
                                styleMap[attr] = formatPX$3(image[attr] * parseUnit(value, { fontSize: parseFloat(getStyle$1(element).fontSize) }) / image[opposing]);
                            }
                        }
                    }
                }
            }
        }
    }

    const { hasCoords } = squared.lib.css;
    class NodeGroupUI extends NodeUI {
        setBounds() {
            return !this.isEmpty() ? this._bounds = this.outerRegion : null;
        }
        previousSiblings(options) {
            let node = this;
            do {
                node = node.item(0);
            } while (node && node.nodeGroup);
            return node ? node.previousSiblings(options) : [];
        }
        nextSiblings(options) {
            let node = this;
            do {
                node = node.item(-1);
            } while (node && node.nodeGroup);
            return node ? node.nextSiblings(options) : [];
        }
        get inline() {
            if (this.hasAlign(32 /* BLOCK */)) {
                return false;
            }
            const result = this._cache.inline;
            return result === undefined ? this._cache.inline = this.every(node => node.inline) : result;
        }
        get inlineStatic() {
            if (this.hasAlign(32 /* BLOCK */)) {
                return false;
            }
            const result = this._cache.inlineStatic;
            return result === undefined ? this._cache.inlineStatic = this.every(node => node.inlineStatic) : result;
        }
        get inlineVertical() {
            if (this.hasAlign(32 /* BLOCK */)) {
                return false;
            }
            const result = this._cache.inlineVertical;
            return result === undefined ? this._cache.inlineVertical = this.every((node) => node.inlineVertical) : result;
        }
        get inlineFlow() {
            if (this.hasAlign(32 /* BLOCK */)) {
                return false;
            }
            const result = this._cache.inlineFlow;
            return result === undefined ? this._cache.inlineFlow = this.every((node) => node.inlineFlow) : result;
        }
        get inlineDimension() {
            if (this.hasAlign(32 /* BLOCK */)) {
                return false;
            }
            const result = this._cache.inlineDimension;
            return result === undefined ? this._cache.inlineDimension = this.every((node) => node.inlineDimension) : result;
        }
        get block() {
            if (this.hasAlign(32 /* BLOCK */)) {
                return true;
            }
            const result = this._cache.block;
            return result === undefined ? this._cache.block = !!this.find(node => node.block) : result;
        }
        get blockStatic() {
            if (this.hasAlign(32 /* BLOCK */)) {
                return true;
            }
            let result = this._cache.blockStatic;
            if (result === undefined) {
                const parent = this.actualParent || this.documentParent;
                result = parent.blockStatic && (parent.layoutVertical || this.hasAlign(128 /* COLUMN */)) ||
                    parent.percentWidth > 0 ||
                    this.layoutVertical && (parent.hasWidth || !!this.find(node => node.centerAligned || node.rightAligned)) ||
                    !!this.find(node => node.blockStatic && !node.hasWidth || node.percentWidth > 0);
                if (result || this.containerType !== 0) {
                    this._cache.blockStatic = result;
                }
            }
            return result;
        }
        get blockDimension() {
            const result = this._cache.blockDimension;
            return result === undefined ? this._cache.blockDimension = this.every((node) => node.blockDimension) : result;
        }
        get blockVertical() {
            const result = this._cache.blockVertical;
            return result === undefined ? this._cache.blockVertical = this.every((node) => node.blockVertical) : result;
        }
        get pageFlow() {
            const result = this._cache.pageFlow;
            return result === undefined ? this._cache.pageFlow = !hasCoords(this.css('position')) : result;
        }
        set baseline(value) {
            this._cache.baseline = value;
        }
        get baseline() {
            const result = this._cache.baseline;
            return result === undefined ? this._cache.baseline = this.every((node) => node.baselineElement) : result;
        }
        get float() {
            const result = this._cache.float;
            return result === undefined ? this._cache.float = !this.floating ? 'none' : this.hasAlign(1024 /* RIGHT */) ? 'right' : 'left' : result;
        }
        get floating() {
            const result = this._cache.floating;
            return result === undefined ? this._cache.floating = this.hasAlign(256 /* FLOAT */) || this.every((node) => node.floating) : result;
        }
        get display() {
            var _a;
            return super.display || ((_a = this.firstChild) === null || _a === void 0 ? void 0 : _a.blockStatic) ? 'block' : this.blockDimension ? 'inline-block' : 'inline';
        }
        get firstChild() {
            return this.item(0) || null;
        }
        get lastChild() {
            return this.item(-1) || null;
        }
        set childIndex(value) {
            this._childIndex = value;
        }
        get childIndex() {
            const result = super.childIndex;
            return result === Infinity ? super.childIndex = this.min('childIndex', { self: true }).childIndex : result;
        }
        get centerAligned() {
            const result = this._cache.centerAligned;
            return result === undefined ? this._cache.centerAligned = this.every(node => node.centerAligned) : result;
        }
        get rightAligned() {
            if (this.hasAlign(1024 /* RIGHT */)) {
                return true;
            }
            const result = this._cache.rightAligned;
            return result === undefined ? this._cache.rightAligned = this.every(node => node.rightAligned) : result;
        }
        set inlineText(value) { }
        get inlineText() { return false; }
        set multiline(value) { }
        get multiline() { return false; }
        get tagName() { return ''; }
        get plainText() { return false; }
        get styleText() { return false; }
        get nodeGroup() { return true; }
        get naturalChild() { return false; }
        get naturalElement() { return false; }
        get pseudoElement() { return false; }
        get previousSibling() { return null; }
        get nextSibling() { return null; }
        get previousElementSibling() { return null; }
        get nextElementSibling() { return null; }
    }

    class Accessibility extends ExtensionUI {
    }

    const { isLength: isLength$3, isPx: isPx$1 } = squared.lib.css;
    class Column extends ExtensionUI {
        is(node) {
            return node.size() > 1 && (node.blockDimension && node.display !== 'table') && !node.layoutElement;
        }
        condition(node) {
            return node.has('columnCount') || node.hasPX('columnWidth');
        }
        processNode(node, parent) {
            let items = [], maxSize = Infinity, multiline = false;
            const rows = [items];
            node.each((item) => {
                var _a;
                if (item.valueOf('columnSpan') === 'all') {
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
                --rows.length;
            }
            const [borderLeftStyle, borderLeftWidth, borderLeftColor] = node.cssAsTuple('columnRuleStyle', 'columnRuleWidth', 'columnRuleColor');
            const boxWidth = node.box.width;
            const columnCount = node.toInt('columnCount');
            const columnWidth = node.cssUnit('columnWidth');
            let columnGap = node.cssUnit('columnGap'), columnSized;
            const getColumnSizing = () => isNaN(columnCount) && columnWidth > 0 ? boxWidth / (columnWidth + columnGap) : Infinity;
            if (columnGap) {
                columnSized = Math.floor(getColumnSizing());
            }
            else {
                columnGap = (columnWidth && !isNaN(maxSize) && maxSize !== Infinity ? Math.max(maxSize - columnWidth, 0) : 0) + 16;
                columnSized = Math.ceil(getColumnSizing());
            }
            this.data.set(node, {
                rows,
                columnCount,
                columnWidth,
                columnGap,
                columnSized,
                columnRule: {
                    borderLeftStyle,
                    borderLeftWidth: borderLeftStyle !== 'none' ? isPx$1(borderLeftWidth) ? parseFloat(borderLeftWidth) : isLength$3(borderLeftWidth, true) ? node.parseUnit(borderLeftWidth) : parseFloat(node.style.borderLeftWidth) : 0,
                    borderLeftColor
                },
                boxWidth: parent.actualBoxWidth(boxWidth),
                multiline
            });
        }
    }

    const { formatPercent: formatPercent$1, formatPX: formatPX$2, isLength: isLength$2, isPercent: isPercent$1, isPx } = squared.lib.css;
    const { convertPercent: convertPercent$1, endsWith, splitEnclosing, splitPairEnd, startsWith: startsWith$1, trimString, withinRange: withinRange$2 } = squared.lib.util;
    const PATTERN_SIZE = '\\[([^\\]]+)\\]|minmax\\(([^,]+),([^)]+)\\)|fit-content\\(\\s*([\\d.]+[a-z%]+)\\s*\\)|([\\d.]+[a-z%]+|auto|max-content|min-content)';
    const REGEXP_SIZE = new RegExp(PATTERN_SIZE, 'g');
    const REGEXP_REPEAT = /repeat\(\s*(auto-fit|auto-fill|\d+)/;
    function repeatUnit(data, sizes) {
        const repeat = data.repeat;
        const unitPX = [];
        const unitRepeat = [];
        for (let i = 0, length = sizes.length; i < length; ++i) {
            if (repeat[i]) {
                unitRepeat.push(sizes[i]);
            }
            else {
                unitPX.push(sizes[i]);
            }
        }
        const length = data.length;
        const result = new Array(length);
        for (let i = 0, q = length - unitPX.length; i < length; ++i) {
            if (repeat[i]) {
                for (let j = 0, k = 0; j < q; ++i, ++j, ++k) {
                    if (k === unitRepeat.length) {
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
        if (unit.length === 1 && (data.flags & 1 /* AUTO_FIT */ || data.flags & 2 /* AUTO_FILL */)) {
            const unitMin = data.unitMin;
            let sizeMin = 0;
            for (const value of [unit[0], unitMin[0]]) {
                if (isPercent$1(value)) {
                    sizeMin = Math.max(convertPercent$1(value) * dimension, sizeMin);
                }
                else if (isPx(value)) {
                    sizeMin = Math.max(parseFloat(value), sizeMin);
                }
            }
            if (sizeMin) {
                data.length = Math.floor(dimension / (sizeMin + data.gap));
                data.unit = repeatUnit(data, unit);
                data.unitMin = repeatUnit(data, unitMin);
                return true;
            }
        }
        return false;
    }
    function setFlexibleDimension(dimension, gap, count, unit, max) {
        let filled = 0, fractional = 0, percent = 1;
        const length = unit.length;
        for (let i = 0; i < length; ++i) {
            const value = unit[i];
            if (isPx(value)) {
                filled += parseFloat(value);
            }
            else if (endsWith(value, 'fr')) {
                fractional += parseFloat(value);
            }
            else if (isPercent$1(value)) {
                percent -= convertPercent$1(value);
            }
        }
        if (percent < 1 && fractional) {
            const ratio = (dimension * percent - (count - 1) * gap - max.reduce((a, b) => a + Math.max(0, b), 0) - filled) / fractional;
            if (ratio > 0) {
                for (let i = 0; i < length; ++i) {
                    const value = unit[i];
                    if (endsWith(value, 'fr')) {
                        unit[i] = formatPX$2(parseFloat(value) * ratio);
                    }
                }
            }
        }
    }
    function fillUnitEqually(unit, length) {
        if (unit.length === 0) {
            for (let i = 0; i < length; ++i) {
                unit.push('1fr');
            }
        }
    }
    function getOpenCellIndex(iteration, length, available) {
        if (available) {
            for (let i = 0, j = -1, k = 0; i < iteration; ++i) {
                if (!available[i]) {
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
        for (let i = 0, length = cells.length; i < length; ++i) {
            if (cells[i].some(value => value === 0)) {
                return i;
            }
        }
        return Math.max(0, length - 1);
    }
    function createDataAttribute$2(node) {
        const data = node.cssAsObject('alignItems', 'alignContent', 'justifyItems', 'justifyContent', 'gridAutoFlow');
        return Object.assign(Object.assign({}, data), { children: [], rowData: [], rowSpanMultiple: [], rowDirection: !data.gridAutoFlow.includes('column'), dense: data.gridAutoFlow.includes('dense'), templateAreas: {}, row: CssGrid.createDataRowAttribute(node.parseHeight(node.valueOf('rowGap'), false)), column: CssGrid.createDataRowAttribute(node.parseWidth(node.valueOf('columnGap'), false)), emptyRows: [], minCellHeight: 0 });
    }
    function applyLayout(node, data, dataCount, horizontal) {
        let unit = data.unit;
        if (unit.length < dataCount) {
            if (data.flags & 1 /* AUTO_FIT */ || data.flags & 2 /* AUTO_FILL */) {
                if (unit.length === 0) {
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
                const q = auto.length;
                if (q) {
                    for (let i = 0; unit.length < dataCount; ++i) {
                        if (i === q) {
                            i = 0;
                        }
                        unit.push(auto[i]);
                    }
                }
            }
        }
        else if (data.flags & 1 /* AUTO_FIT */ || data.flags & 2 /* AUTO_FILL */ && (horizontal && node.blockStatic && !node.hasWidth && !node.hasPX('maxWidth', { percent: false }) || !horizontal && !node.hasHeight)) {
            unit.length = dataCount;
        }
        let percent = 1, fr = 0, auto = 0;
        const length = unit.length;
        for (let i = 0; i < length; ++i) {
            const value = unit[i];
            if (isPercent$1(value)) {
                percent -= convertPercent$1(value);
            }
            else if (endsWith(value, 'fr')) {
                fr += parseFloat(value);
            }
            else if (value === 'auto') {
                ++auto;
            }
        }
        if (percent < 1 || fr > 0) {
            data.flags |= 8 /* FLEXIBLE */;
        }
        if (percent < 1) {
            if (fr) {
                for (let i = 0; i < length; ++i) {
                    if (endsWith(unit[i], 'fr')) {
                        unit[i] = percent * (parseFloat(unit[i]) / fr) + 'fr';
                    }
                }
            }
            else if (auto === 1) {
                const j = unit.findIndex(value => value === 'auto');
                if (j !== -1) {
                    unit[j] = formatPercent$1(percent);
                }
            }
        }
    }
    const convertLength = (node, value, index) => isLength$2(value) ? formatPX$2(node.parseUnit(value, { dimension: index !== 0 ? 'width' : 'height' })) : value;
    class CssGrid extends ExtensionUI {
        static isAligned(node) {
            return node.hasHeight && /^space-|center|flex-end|end/.test(node.valueOf('alignContent'));
        }
        static isJustified(node) {
            return (node.blockStatic || node.hasWidth) && /^space-|center|flex-end|end|right/.test(node.valueOf('justifyContent'));
        }
        static createDataRowAttribute(gap = 0) {
            return {
                length: 0,
                gap,
                unit: [],
                unitMin: [],
                unitTotal: [],
                repeat: [],
                auto: [],
                name: {},
                frTotal: 0,
                flags: 0
            };
        }
        is(node) {
            return node.gridElement;
        }
        condition(node) {
            return !node.isEmpty();
        }
        processNode(node) {
            var _a;
            const data = this.data;
            const mainData = createDataAttribute$2(node);
            const { column, dense, row, rowDirection: horizontal } = mainData;
            const rowData = [];
            const openCells = [];
            const layout = [];
            const gridTemplates = [node.valueOf('gridTemplateRows'), node.valueOf('gridTemplateColumns'), node.css('gridAutoRows'), node.css('gridAutoColumns')];
            let autoWidth, autoHeight, rowA, colA, rowB, colB, ITERATION, ROW_SPAN, COLUMN_SPAN;
            if (horizontal) {
                rowA = 0;
                colA = 1;
                rowB = 2;
                colB = 3;
            }
            else {
                rowA = 1;
                colA = 0;
                rowB = 3;
                colB = 2;
            }
            const setDataRows = (item, placement) => {
                if (placement.every(value => value > 0)) {
                    for (let i = placement[rowA] - 1; i < placement[rowB] - 1; ++i) {
                        const itemData = rowData[i] || (rowData[i] = []);
                        let cell = openCells[i], j = placement[colA] - 1;
                        if (!cell) {
                            cell = new Array(ITERATION).fill(0);
                            if (!dense) {
                                for (let k = 0; k < j; ++k) {
                                    cell[k] = 1;
                                }
                            }
                            openCells[i] = cell;
                        }
                        while (j < placement[colB] - 1) {
                            (itemData[j] || (itemData[j] = [])).push(item);
                            cell[j++] = 1;
                        }
                    }
                    return true;
                }
                return false;
            };
            for (let index = 0; index < 4; ++index) {
                const value = gridTemplates[index];
                if (value && value !== 'none' && value !== 'auto') {
                    const direction = index === 0 ? row : column;
                    const { name, repeat, unit, unitMin } = direction;
                    let i = 1, match;
                    for (const seg of splitEnclosing(value, 'repeat')) {
                        if (startsWith$1(seg, 'repeat')) {
                            if (match = REGEXP_REPEAT.exec(seg)) {
                                let iterations = 1;
                                switch (match[1]) {
                                    case 'auto-fit':
                                        direction.flags |= 1 /* AUTO_FIT */;
                                        break;
                                    case 'auto-fill':
                                        direction.flags |= 2 /* AUTO_FILL */;
                                        break;
                                    default:
                                        iterations = +match[1] || 1;
                                        break;
                                }
                                if (iterations) {
                                    const repeating = [];
                                    const size = seg.substring(match[0].length);
                                    while (match = REGEXP_SIZE.exec(size)) {
                                        if (match[1]) {
                                            name[_a = match[1]] || (name[_a] = []);
                                            repeating.push({ name: match[1] });
                                        }
                                        else if (match[2]) {
                                            repeating.push({ unitMin: convertLength(node, match[2], index), unit: convertLength(node, match[3], index) });
                                        }
                                        else if (match[4]) {
                                            repeating.push({ unitMin: '0px', unit: convertLength(node, match[4], index) });
                                        }
                                        else if (match[5]) {
                                            repeating.push({ unit: convertLength(node, match[5], index) });
                                        }
                                    }
                                    const q = repeating.length;
                                    if (q) {
                                        for (let j = 0; j < iterations; ++j) {
                                            for (let k = 0; k < q; ++k) {
                                                const item = repeating[k];
                                                if (item.name) {
                                                    name[item.name].push(i);
                                                }
                                                else if (item.unit) {
                                                    unit.push(item.unit);
                                                    unitMin.push(item.unitMin || '');
                                                    repeat.push(true);
                                                    ++i;
                                                }
                                            }
                                        }
                                    }
                                    REGEXP_SIZE.lastIndex = 0;
                                }
                            }
                        }
                        else {
                            while (match = REGEXP_SIZE.exec(seg)) {
                                switch (index) {
                                    case 0:
                                    case 1:
                                        if (match[1]) {
                                            for (const attr of match[1].split(/\s+/)) {
                                                (name[attr] || (name[attr] = [])).push(i);
                                            }
                                        }
                                        else if (match[2]) {
                                            unitMin.push(convertLength(node, match[2], index));
                                            unit.push(convertLength(node, match[3], index));
                                            repeat.push(false);
                                            ++i;
                                        }
                                        else if (match[4]) {
                                            unit.push(convertLength(node, match[4], index));
                                            unitMin.push('0px');
                                            repeat.push(false);
                                            ++i;
                                        }
                                        else if (match[5]) {
                                            unit.push(convertLength(node, match[5], index));
                                            unitMin.push('');
                                            repeat.push(false);
                                            ++i;
                                        }
                                        break;
                                    case 2:
                                    case 3:
                                        (index === 2 ? row : column).auto.push(isLength$2(match[0]) ? formatPX$2(node.parseUnit(match[0], { dimension: index !== 2 ? 'width' : 'height' })) : match[0]);
                                        break;
                                }
                            }
                            REGEXP_SIZE.lastIndex = 0;
                        }
                    }
                }
            }
            if (horizontal) {
                node.children.sort((a, b) => {
                    const linearA = a.linear;
                    const linearB = b.linear;
                    if (!withinRange$2(linearA.top, linearB.top)) {
                        return linearA.top - linearB.top;
                    }
                    else if (!withinRange$2(linearA.left, linearB.left)) {
                        return linearA.left - linearB.left;
                    }
                    return 0;
                });
            }
            else {
                node.children.sort((a, b) => {
                    const linearA = a.linear;
                    const linearB = b.linear;
                    if (!withinRange$2(linearA.left, linearB.left)) {
                        return linearA.left - linearB.left;
                    }
                    else if (!withinRange$2(linearA.top, linearB.top)) {
                        return linearA.top - linearB.top;
                    }
                    return 0;
                });
            }
            if (!node.has('gridTemplateAreas') && node.every(item => item.css('gridRowStart') === 'auto' && item.css('gridColumnStart') === 'auto')) {
                let rowIndex = 0, columnIndex = 0, columnMax = 0, previous, directionA, directionB, indexA, indexB, indexC;
                if (horizontal) {
                    directionA = 'top';
                    directionB = 'bottom';
                    indexA = 2;
                    indexB = 1;
                    indexC = 3;
                }
                else {
                    directionA = 'left';
                    directionB = 'right';
                    indexA = 3;
                    indexB = 0;
                    indexC = 2;
                }
                if (horizontal) {
                    if (column.flags & 2 /* AUTO_FILL */) {
                        autoWidth = setAutoFill(column, node.actualWidth);
                    }
                }
                else if (row.flags & 2 /* AUTO_FILL */) {
                    autoHeight = setAutoFill(row, node.actualHeight);
                }
                node.each((item, index) => {
                    if (!previous || item.linear[directionA] >= previous.linear[directionB] || columnIndex && columnIndex === columnMax) {
                        columnMax = Math.max(columnIndex, columnMax);
                        ++rowIndex;
                        columnIndex = 1;
                    }
                    const [gridRowEnd, gridColumnEnd] = item.cssAsTuple('gridRowEnd', 'gridColumnEnd');
                    let rowSpan = 1, columnSpan = 1, n;
                    if (startsWith$1(gridRowEnd, 'span')) {
                        rowSpan = +splitPairEnd(gridRowEnd, ' ');
                    }
                    else if (!isNaN(n = +gridRowEnd)) {
                        rowSpan = n - rowIndex;
                    }
                    if (startsWith$1(gridColumnEnd, 'span')) {
                        columnSpan = +splitPairEnd(gridColumnEnd, ' ');
                    }
                    else if (!isNaN(n = +gridColumnEnd)) {
                        columnSpan = n - columnIndex;
                    }
                    if (columnIndex === 1 && columnMax) {
                        found: {
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
                                for (let i = 0, j = 0, k = 0, length = available.length; i < length; ++i) {
                                    if (available[i]) {
                                        if (j === 0) {
                                            k = i;
                                        }
                                        if (++j === columnSpan) {
                                            columnIndex = k + 1;
                                            break found;
                                        }
                                    }
                                    else {
                                        j = 0;
                                    }
                                }
                                mainData.emptyRows[rowIndex - 1] = available;
                            } while (++rowIndex);
                        }
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
                node.css('gridTemplateAreas').split(/"\s+"/).forEach((template, rowStart) => {
                    if (template !== 'none') {
                        trimString(template.trim(), '"').split(/\s+/).forEach((area, columnStart) => {
                            if (area[0] !== '.') {
                                const templateArea = templateAreas[area];
                                if (templateArea) {
                                    templateArea.rowSpan = (rowStart - templateArea.rowStart) + 1;
                                    templateArea.columnSpan = (columnStart - templateArea.columnStart) + 1;
                                }
                                else {
                                    templateAreas[area] = {
                                        rowStart,
                                        rowSpan: 1,
                                        columnStart,
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
                    let rowSpan = -1, columnSpan = -1;
                    if (Object.keys(templateAreas).length) {
                        for (let i = 0, template; i < 4; ++i) {
                            const name = positions[i];
                            if (template = templateAreas[name]) {
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
                                const match = /^([\w-]+)-(start|end)$/.exec(name);
                                if (match && (template = templateAreas[match[1]])) {
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
                    if (!placement[0] || !placement[1] || !placement[2] || !placement[3]) {
                        const setPlacement = (value, position, vertical, length) => {
                            let n;
                            if (!isNaN(n = +value)) {
                                const cellIndex = n;
                                if (cellIndex > 0) {
                                    placement[position] = cellIndex;
                                    return true;
                                }
                                else if (cellIndex < 0 && position >= 2) {
                                    const positionA = position - 2;
                                    placement[placement[positionA] ? position : positionA] = cellIndex + length + 2;
                                    return true;
                                }
                            }
                            else if (startsWith$1(value, 'span')) {
                                const span = +splitPairEnd(value, ' ');
                                if (span === length && previousPlacement) {
                                    if (horizontal) {
                                        if (!vertical) {
                                            const end = previousPlacement[2];
                                            if (end && !placement[0]) {
                                                placement[0] = end;
                                            }
                                        }
                                    }
                                    else if (vertical) {
                                        const end = previousPlacement[3];
                                        if (end && !placement[1]) {
                                            placement[1] = end;
                                        }
                                    }
                                }
                                const start = placement[position - 2];
                                switch (position) {
                                    case 0: {
                                        const rowIndex = positions[2];
                                        if (!isNaN(n = +rowIndex)) {
                                            placement[0] = n - span;
                                            placement[2] = n;
                                        }
                                        break;
                                    }
                                    case 1: {
                                        const colIndex = positions[3];
                                        if (!isNaN(n = +colIndex)) {
                                            placement[1] = n - span;
                                            placement[3] = n;
                                        }
                                        break;
                                    }
                                    case 2:
                                    case 3:
                                        if (start) {
                                            placement[position] = start + span;
                                        }
                                        break;
                                }
                                if (vertical) {
                                    if (rowSpan === -1) {
                                        rowSpan = span;
                                    }
                                }
                                else if (columnSpan === -1) {
                                    columnSpan = span;
                                }
                                return true;
                            }
                            return false;
                        };
                        let rowStart, colStart;
                        for (let i = 0, n; i < 4; ++i) {
                            const value = positions[i];
                            if (value !== 'auto' && !placement[i]) {
                                const vertical = i % 2 === 0;
                                const direction = vertical ? row : column;
                                if (!setPlacement(value, i, vertical, Math.max(1, direction.unit.length))) {
                                    const alias = value.split(' ');
                                    if (alias.length === 1) {
                                        alias[1] = alias[0];
                                        alias[0] = '1';
                                    }
                                    else if (!isNaN(n = +alias[0])) {
                                        if (vertical) {
                                            if (rowStart) {
                                                rowSpan = n - +rowStart[0];
                                            }
                                            else {
                                                rowStart = alias;
                                            }
                                        }
                                        else if (colStart) {
                                            columnSpan = n - +colStart[0];
                                        }
                                        else {
                                            colStart = alias;
                                        }
                                    }
                                    const named = direction.name[alias[1]];
                                    if (named) {
                                        n = +alias[0];
                                        if (n <= named.length) {
                                            placement[i] = named[n - 1] + (alias[1] === positions[i - 2] ? 1 : 0);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (!previousPlacement) {
                        if (!placement[0]) {
                            placement[0] = 1;
                        }
                        if (!placement[1]) {
                            placement[1] = 1;
                        }
                    }
                    const [a, b, c, d] = placement;
                    if (rowSpan === -1) {
                        rowSpan = a && c ? c - a : 1;
                    }
                    else if (a && c === 0) {
                        placement[2] = a + rowSpan;
                    }
                    if (columnSpan === -1) {
                        columnSpan = b && d ? d - b : 1;
                    }
                    else if (b && d === 0) {
                        placement[3] = a + columnSpan;
                    }
                    if (!placement[2] && placement[0]) {
                        placement[2] = placement[0] + rowSpan;
                    }
                    if (!placement[3] && placement[1]) {
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
            {
                let totalCount = 1, outerCount = 0, totalSpan, start, end;
                for (let i = 0, length = layout.length; i < length; ++i) {
                    const item = layout[i];
                    if (item) {
                        if (horizontal) {
                            totalSpan = item.columnSpan;
                            start = 1;
                            end = 3;
                        }
                        else {
                            totalSpan = item.rowSpan;
                            start = 0;
                            end = 2;
                        }
                        const placement = item.placement;
                        if (placement.some(value => value > 0)) {
                            totalCount = Math.max(totalCount, totalSpan, placement[start], placement[end] - 1);
                        }
                        if (withinRange$2(item.outerCoord, horizontal ? node.box.top : node.box.left)) {
                            outerCount += totalSpan;
                        }
                    }
                }
                ITERATION = Math.max(totalCount, outerCount, horizontal && !autoWidth ? column.unit.length : 0, !horizontal && !autoHeight ? row.unit.length : 0);
            }
            node.each((item, index) => {
                const { placement, rowSpan, columnSpan } = layout[index];
                if (horizontal) {
                    ROW_SPAN = rowSpan;
                    COLUMN_SPAN = columnSpan;
                }
                else {
                    ROW_SPAN = columnSpan;
                    COLUMN_SPAN = rowSpan;
                }
                while (!placement[0] || !placement[1]) {
                    const PLACEMENT = placement.slice(0);
                    if (!PLACEMENT[rowA]) {
                        for (let i = dense ? 0 : getOpenRowIndex(openCells), j = 0, k = -1, length = rowData.length; i < length; ++i) {
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
                    if (!PLACEMENT[rowA]) {
                        placement[rowA] = rowData.length + 1;
                        if (!placement[colA]) {
                            placement[colA] = 1;
                        }
                    }
                    else if (!PLACEMENT[colA]) {
                        if (!PLACEMENT[rowB]) {
                            PLACEMENT[rowB] = PLACEMENT[rowA] + ROW_SPAN;
                        }
                        const available = [];
                        const l = PLACEMENT[rowA] - 1;
                        const m = PLACEMENT[rowB] - 1;
                        for (let i = l; i < m; ++i) {
                            const itemData = rowData[i];
                            if (!itemData) {
                                available.push([[0, -1]]);
                            }
                            else if (itemData.reduce((a, b) => a + (b ? 1 : 0), 0) + COLUMN_SPAN <= ITERATION) {
                                const range = [];
                                let span = 0;
                                for (let j = 0, k = -1; j < ITERATION; ++j) {
                                    const rowItem = itemData[j];
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
                            const itemData = available[0];
                            if (itemData[0][1] === -1) {
                                PLACEMENT[colA] = 1;
                            }
                            else if (length === m - l) {
                                if (length > 1) {
                                    found: {
                                        for (let i = 0, q = itemData.length; i < q; ++i) {
                                            const outside = itemData[i];
                                            for (let j = outside[0]; j < outside[1]; ++j) {
                                                for (let k = 1; k < length; ++k) {
                                                    const avail = available[k];
                                                    for (let n = 0, r = avail.length; n < r; ++n) {
                                                        const [insideA, insideB] = avail[n];
                                                        if (j >= insideA && (insideB === -1 || j + COLUMN_SPAN <= insideB)) {
                                                            PLACEMENT[colA] = j + 1;
                                                            break found;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                else {
                                    PLACEMENT[colA] = itemData[0][0] + 1;
                                }
                            }
                        }
                    }
                    const indexA = PLACEMENT[rowA];
                    if (indexA) {
                        if (PLACEMENT[colA]) {
                            placement[rowA] = indexA;
                            placement[colA] = PLACEMENT[colA];
                        }
                    }
                }
                if (!placement[rowB]) {
                    placement[rowB] = placement[rowA] + ROW_SPAN;
                }
                if (!placement[colB]) {
                    placement[colB] = placement[colA] + COLUMN_SPAN;
                }
                if (setDataRows(item, placement)) {
                    const [a, b, c, d] = placement;
                    const rowStart = a - 1;
                    const rowCount = c - a;
                    const columnStart = b - 1;
                    if (!dense) {
                        const cellIndex = horizontal ? rowStart : columnStart;
                        if (cellIndex) {
                            const cells = openCells[cellIndex - 1];
                            for (let i = 0; i < ITERATION; ++i) {
                                cells[i] = 1;
                            }
                        }
                    }
                    if (rowCount > 1) {
                        const rowSpanMultiple = mainData.rowSpanMultiple;
                        for (let i = rowStart, length = rowStart + rowCount; i < length; ++i) {
                            rowSpanMultiple[i] = true;
                        }
                    }
                    data.set(item, {
                        rowStart,
                        rowSpan: rowCount,
                        columnStart,
                        columnSpan: d - b
                    });
                }
            });
            let columnCount = rowData.length;
            if (columnCount) {
                let rowMain;
                if (horizontal) {
                    rowMain = rowData;
                    mainData.rowData = rowData;
                    columnCount = Math.max(column.unit.length, ...rowData.map(item => item.length));
                }
                else {
                    rowMain = mainData.rowData;
                    for (let i = 0; i < columnCount; ++i) {
                        const itemData = rowData[i];
                        for (let j = 0, length = itemData.length; j < length; ++j) {
                            (rowMain[j] || (rowMain[j] = []))[i] = itemData[j];
                        }
                    }
                }
                const unitTotal = horizontal ? row.unitTotal : column.unitTotal;
                const children = mainData.children;
                for (let i = 0, length = rowMain.length; i < length; ++i) {
                    const itemData = rowMain[i];
                    for (let j = 0, q = itemData.length; j < q; ++j) {
                        const columnItem = itemData[j];
                        let count = unitTotal[j] || 0;
                        if (columnItem) {
                            let maxDimension = 0;
                            for (let k = 0, r = columnItem.length; k < r; ++k) {
                                const item = columnItem[k];
                                if (!children.includes(item)) {
                                    maxDimension = Math.max(maxDimension, horizontal ? item.bounds.height : item.bounds.width);
                                    children.push(item);
                                }
                            }
                            count += maxDimension;
                        }
                        unitTotal[j] = count;
                    }
                }
                if (children.length === node.size()) {
                    const { gap: rowGap, unit: rowUnit } = row;
                    const columnGap = column.gap;
                    const rowCount = Math.max(rowUnit.length, rowMain.length);
                    const rowMax = new Array(rowCount).fill(0);
                    const columnMax = new Array(columnCount).fill(0);
                    const modified = new WeakSet();
                    let minCellHeight = 0;
                    row.length = rowCount;
                    column.length = columnCount;
                    for (let i = 0; i < rowCount; ++i) {
                        const rowItem = rowMain[i];
                        const unitHeight = rowUnit[i];
                        if (rowItem) {
                            for (let j = 0; j < columnCount; ++j) {
                                const columnItem = rowItem[j];
                                if (columnItem) {
                                    for (let k = 0, length = columnItem.length; k < length; ++k) {
                                        const item = columnItem[k];
                                        if (!modified.has(item)) {
                                            const { columnSpan, rowSpan } = data.get(item);
                                            const x = j + columnSpan - 1;
                                            const y = i + rowSpan - 1;
                                            if (columnGap && x < columnCount - 1) {
                                                item.modifyBox(2 /* MARGIN_RIGHT */, columnGap);
                                            }
                                            if (rowGap && y < rowCount - 1) {
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
                                                    }
                                                    else {
                                                        rowMax[i] = Math.max(boundsHeight, columnHeight);
                                                    }
                                                }
                                                else if (boundsHeight > Math.abs(columnHeight)) {
                                                    rowMax[i] = boundsHeight * -1;
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
                                                    columnMax[j] = boundsWidth * -1;
                                                }
                                            }
                                            modified.add(item);
                                        }
                                    }
                                }
                                else if (!horizontal) {
                                    mainData.emptyRows[j] = [Infinity];
                                }
                            }
                        }
                        else {
                            const n = +unitHeight;
                            if (!isNaN(n)) {
                                rowMax[i] = n;
                            }
                            if (horizontal) {
                                mainData.emptyRows[i] = [Infinity];
                            }
                        }
                    }
                    mainData.minCellHeight = minCellHeight;
                    if (horizontal) {
                        if (node.hasPX('width', { percent: false })) {
                            column.flags |= 4 /* FIXED_WIDTH */;
                            column.flags &= ~8 /* FLEXIBLE */;
                            setFlexibleDimension(node.actualWidth, columnGap, columnCount, column.unit, columnMax);
                        }
                        if (node.hasHeight && !CssGrid.isAligned(node)) {
                            fillUnitEqually(row.unit, rowCount);
                        }
                    }
                    else {
                        if (node.hasPX('height', { percent: false })) {
                            row.flags |= 4 /* FIXED_WIDTH */;
                            row.flags &= ~8 /* FLEXIBLE */;
                            setFlexibleDimension(node.actualHeight, rowGap, rowCount, rowUnit, rowMax);
                        }
                        if (node.hasWidth && !CssGrid.isJustified(node)) {
                            fillUnitEqually(column.unit, columnCount);
                        }
                    }
                    node.retainAs(children).cssSort('zIndex', { byInt: true });
                    node.cssTry('display', 'block', () => {
                        node.each((item) => {
                            const bounds = item.boundingClientRect;
                            data.get(item).bounds = bounds ? Object.assign(Object.assign({}, item.bounds), { width: bounds.width, height: bounds.height }) : item.bounds;
                        });
                    });
                    applyLayout(node, column, columnCount, true);
                    applyLayout(node, row, rowCount, false);
                    data.set(node, mainData);
                }
            }
        }
    }

    const { partitionArray, withinRange: withinRange$1 } = squared.lib.util;
    function createDataAttribute$1(node, children) {
        return Object.assign(Object.assign({}, node.flexdata), { rowCount: 0, columnCount: 0, rowGap: node.cssUnit('rowGap', { dimension: 'height' }), columnGap: node.cssUnit('columnGap'), children });
    }
    class Flexbox extends ExtensionUI {
        is(node) {
            return node.flexElement;
        }
        condition(node) {
            return !node.isEmpty();
        }
        processNode(node) {
            const dataName = this.name;
            const [children, absolute] = partitionArray(node.children, (item) => item.pageFlow && item.visible);
            const mainData = createDataAttribute$1(node, children);
            const row = mainData.row;
            node.cssTryAll({ alignItems: 'start', justifyItems: 'start' }, () => {
                for (let i = 0, length = children.length; i < length; ++i) {
                    const item = children[i];
                    item.cssTryAll({ alignSelf: 'start', justifySelf: 'start' }, function () {
                        const bounds = this.boundingClientRect;
                        this.data(dataName, 'boundsData', bounds ? Object.assign(Object.assign({}, this.bounds), { width: bounds.width, height: bounds.height }) : this.bounds);
                    });
                }
            });
            if (mainData.wrap) {
                const options = { dimension: 'bounds' };
                let align, sort, size, method;
                if (row) {
                    align = 'top';
                    sort = 'left';
                    size = 'right';
                    method = 'intersectY';
                }
                else {
                    align = 'left';
                    sort = 'top';
                    size = 'bottom';
                    method = 'intersectX';
                }
                children.sort((a, b) => {
                    const linearA = a.linear;
                    const linearB = b.linear;
                    if (!a[method](b.bounds, options)) {
                        return linearA[align] - linearB[align];
                    }
                    const posA = linearA[sort];
                    const posB = linearB[sort];
                    if (!withinRange$1(posA, posB)) {
                        return posA - posB;
                    }
                    return 0;
                });
                let rowStart = children[0], items = [rowStart], length = children.length, maxCount = 0;
                const rows = [items];
                for (let i = 1; i < length; ++i) {
                    const item = children[i];
                    if (rowStart[method](item.bounds, options)) {
                        items.push(item);
                    }
                    else {
                        rowStart = item;
                        items = [item];
                        rows.push(items);
                    }
                }
                node.clear();
                length = rows.length;
                if (length > 1) {
                    const boxSize = node.box[size];
                    for (let i = 0; i < length; ++i) {
                        const seg = rows[i];
                        maxCount = Math.max(seg.length, maxCount);
                        const group = this.controller.createNodeGroup(seg[0], seg, node, { alignmentType: 64 /* SEGMENTED */, flags: 2 /* DELEGATE */ | 4 /* CASCADE */ });
                        group.box[size] = boxSize;
                    }
                }
                else {
                    node.retainAs(rows[0]);
                    maxCount = rows[0].length;
                }
                node.addAll(absolute);
                if (row) {
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
                else if (mainData.reverse && children.length > 1) {
                    children.reverse();
                }
                if (row) {
                    mainData.rowCount = 1;
                    mainData.columnCount = node.size();
                }
                else {
                    mainData.rowCount = node.size();
                    mainData.columnCount = 1;
                }
            }
            mainData.singleRow = row && mainData.rowCount === 1 || !row && mainData.columnCount === 1;
            this.data.set(node, mainData);
        }
    }

    const { withinRange } = squared.lib.util;
    function getRowIndex(columns, target) {
        const topA = target.bounds.top;
        for (let i = 0, length = columns.length; i < length; ++i) {
            const index = columns[i].findIndex(item => {
                if (!item) {
                    return false;
                }
                const top = item.bounds.top;
                return withinRange(topA, top) || Math.ceil(topA) >= top && topA < Math.floor(item.bounds.bottom);
            });
            if (index !== -1) {
                return index;
            }
        }
        return -1;
    }
    function checkAlignment(node) {
        if (node.float !== 'right') {
            switch (node.css('verticalAlign')) {
                case 'baseline':
                case 'top':
                case 'middle':
                case 'bottom':
                    return true;
                default:
                    return node.floating;
            }
        }
        return false;
    }
    class Grid extends ExtensionUI {
        static createDataCellAttribute() {
            return {
                rowSpan: 0,
                columnSpan: 0,
                index: -1,
                flags: 0
            };
        }
        condition(node) {
            const size = node.size();
            if (size > 1 && !node.layoutElement && node.tagName !== 'TABLE' && !node.has('listStyle')) {
                if (node.display === 'table') {
                    return node.every(item => item.display === 'table-row' && item.every(child => child.display === 'table-cell')) || node.every(item => item.display === 'table-cell');
                }
                else if (node.percentWidth === 0 || node.documentParent.hasWidth) {
                    let itemCount = 0, minLength = false;
                    const children = node.children;
                    for (let i = 0; i < size; ++i) {
                        const item = children[i];
                        if (item.blockStatic && !item.visibleStyle.background && (item.percentWidth === 0 || item.percentWidth === 1) && !item.autoMargin.leftRight && !item.autoMargin.left && item.pageFlow && !item.find((child) => !checkAlignment(child) || child.percentWidth > 0)) {
                            if (item.size() > 1) {
                                minLength = true;
                            }
                            if (item.display === 'list-item' && !item.has('listStyleType')) {
                                ++itemCount;
                            }
                        }
                        else {
                            return false;
                        }
                    }
                    return itemCount === size || minLength && node.every(item => !item.isEmpty() && NodeUI.linearData(item.children).linearX);
                }
            }
            return false;
        }
        processNode(node) {
            var _a;
            const columnEnd = [];
            const nextMapX = new Map();
            let columns;
            node.each(row => {
                row.each((column) => {
                    if (column.visible) {
                        const index = Math.floor(column.linear.left);
                        let mapX = nextMapX.get(index);
                        if (!mapX) {
                            mapX = [];
                            nextMapX.set(index, mapX);
                        }
                        mapX.push(column);
                    }
                });
            });
            const length = nextMapX.size;
            if (length === 0) {
                return;
            }
            const mapValues = Array.from(nextMapX).sort((a, b) => a[0] - b[0]).map(item => item[1]);
            let columnLength = -1;
            for (let i = 0; i < length; ++i) {
                if (i === 0) {
                    columnLength = length;
                }
                else if (columnLength !== mapValues[i].length) {
                    columnLength = -1;
                    break;
                }
            }
            if (columnLength !== -1) {
                columns = mapValues;
            }
            else {
                columns = new Array(length);
                const columnRight = new Array(length);
                for (let i = 0; i < length; ++i) {
                    const nextAxisX = mapValues[i];
                    const q = nextAxisX.length;
                    if (i === 0) {
                        if (q === 0) {
                            return;
                        }
                        columnRight[0] = 0;
                    }
                    else {
                        columnRight[i] = columnRight[i - 1];
                    }
                    for (let j = 0; j < q; ++j) {
                        const nextX = nextAxisX[j];
                        const { left, right } = nextX.linear;
                        if (i === 0 || Math.ceil(left) >= Math.floor(columnRight[i - 1])) {
                            const row = columns[i] || (columns[i] = []);
                            if (i === 0 || columns[0].length === q) {
                                row[j] = nextX;
                            }
                            else {
                                const index = getRowIndex(columns, nextX);
                                if (index !== -1) {
                                    row[index] = nextX;
                                }
                                else {
                                    return;
                                }
                            }
                        }
                        else {
                            const columnLast = columns[columns.length - 1];
                            if (columnLast) {
                                let minLeft = Infinity, maxRight = -Infinity;
                                for (let k = 0, r = columnLast.length; k < r; ++k) {
                                    const linear = columnLast[k].linear;
                                    minLeft = Math.min(linear.left, minLeft);
                                    maxRight = Math.max(linear.right, maxRight);
                                }
                                if (Math.floor(left) > Math.ceil(minLeft) && Math.floor(right) > Math.ceil(maxRight)) {
                                    const index = getRowIndex(columns, nextX);
                                    if (index !== -1) {
                                        for (let k = columns.length - 1; k >= 0; --k) {
                                            const row = columns[k];
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
                for (let i = 0, j = -1, q = columnRight.length; i < q; ++i) {
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
                for (let l = 0, q = columns.reduce((a, b) => Math.max(a, b.length), 0); l < q; ++l) {
                    for (let m = 0, r = columns.length; m < r; ++m) {
                        const row = columns[m];
                        if (!row[l]) {
                            row[l] = { spacer: 1 };
                        }
                    }
                }
                columnEnd.push(node.box.right);
            }
            const columnCount = columns.length;
            if (columnCount > 1 && columns[0].length === node.size()) {
                const rows = [];
                const assigned = new WeakSet();
                for (let i = 0, count = 0; i < columnCount; ++i) {
                    const column = columns[i];
                    const rowCount = column.length;
                    for (let j = 0, start = 0, spacer = 0; j < rowCount; ++j) {
                        const item = column[j];
                        const rowData = rows[j] || (rows[j] = []);
                        if (!item.spacer) {
                            const cellData = Object.assign(Grid.createDataCellAttribute(), this.data.get(item));
                            let rowSpan = 1, columnSpan = 1 + spacer;
                            for (let k = i + 1; k < columnCount; ++k) {
                                const row = columns[k][j];
                                if (row.spacer === 1) {
                                    ++columnSpan;
                                    row.spacer = 2;
                                }
                                else {
                                    break;
                                }
                            }
                            if (columnSpan === 1) {
                                for (let k = j + 1; k < rowCount; ++k) {
                                    const row = column[k];
                                    if (row.spacer === 1) {
                                        ++rowSpan;
                                        row.spacer = 2;
                                    }
                                    else {
                                        break;
                                    }
                                }
                            }
                            if (columnEnd.length) {
                                const index = Math.min(i + (columnSpan - 1), columnEnd.length - 1);
                                const children = item.actualParent.naturalChildren;
                                for (let k = 0, q = children.length; k < q; ++k) {
                                    const sibling = children[k];
                                    if (!assigned.has(sibling) && !sibling.excluded && sibling.withinX({ left: item.linear.right, right: columnEnd[index] }, { dimension: 'linear' })) {
                                        (cellData.siblings || (cellData.siblings = [])).push(sibling);
                                    }
                                }
                            }
                            cellData.rowSpan = rowSpan;
                            cellData.columnSpan = columnSpan;
                            let flags = 0;
                            if (start++ === 0) {
                                flags |= 1 /* ROW_START */;
                            }
                            if (columnSpan + i === columnCount) {
                                flags |= 2 /* ROW_END */;
                            }
                            if (count++ === 0) {
                                flags |= 4 /* CELL_START */;
                            }
                            if ((flags & 2 /* ROW_END */) && j === rowCount - 1) {
                                flags |= 8 /* CELL_END */;
                            }
                            cellData.flags = flags;
                            cellData.index = i;
                            this.data.set(item, cellData);
                            rowData.push(item);
                            assigned.add(item);
                            spacer = 0;
                        }
                        else if (item.spacer === 1) {
                            ++spacer;
                        }
                    }
                }
                node.each((item) => item.hide());
                node.clear();
                for (let i = 0, q = rows.length; i < q; ++i) {
                    const children = rows[i];
                    for (let j = 0, r = children.length; j < r; ++j) {
                        children[j].parent = node;
                    }
                }
                if (node.tableElement && node.valueOf('borderCollapse') === 'collapse') {
                    node.resetBox(240 /* PADDING */);
                }
                this.data.set(node, columnCount);
            }
        }
    }

    class Relative extends ExtensionUI {
        is(node) {
            return node.positionRelative && !node.autoPosition || node.verticalAligned;
        }
        condition() { return true; }
        processNode() {
            return { subscribe: true };
        }
        postOptimize(node, rendered) {
            const renderParent = node.renderParent;
            const verticalAlign = !node.baselineAltered ? node.verticalAlign : 0;
            let top = 0, right = 0, bottom = 0, left = 0;
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
                let x = 0, y = 0;
                if (left !== 0) {
                    x = left;
                }
                else if (right !== 0) {
                    x = right * -1;
                }
                if (top !== 0) {
                    y = top;
                }
                else if (bottom !== 0) {
                    y = bottom * -1;
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
            }
            else {
                let target = node;
                if ((top !== 0 || bottom !== 0 || verticalAlign !== 0) && renderParent.layoutHorizontal && renderParent.support.positionRelative && !node.rendering) {
                    target = node.clone(this.application.nextId);
                    target.baselineAltered = true;
                    this.application.getProcessingCache(node.sessionId).add(target);
                    const layout = new ContentUI(renderParent, target, target.containerType, target.alignmentType);
                    const index = renderParent.renderChildren.findIndex(item => item === node);
                    if (index !== -1) {
                        layout.renderIndex = index + 1;
                    }
                    this.application.addLayout(layout);
                    rendered.push(target);
                    if (node.baselineActive && node.childIndex === 0 && (top > 0 || verticalAlign < 0)) {
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
                    if ((top < 0 || bottom > 0) && node.floating && node.bounds.height > node.documentParent.box.height) {
                        node.modifyBox(4 /* MARGIN_BOTTOM */, Math.min(top, bottom * -1));
                    }
                    node.hide({ hidden: true });
                }
                else if (node.positionRelative && node.actualParent) {
                    const bounds = node.bounds;
                    const hasVertical = top !== 0 || bottom !== 0;
                    const hasHorizontal = left !== 0 || right !== 0;
                    const children = node.actualParent.naturalChildren;
                    let preceding, previous;
                    for (let i = 0, length = children.length; i < length; ++i) {
                        const item = children[i];
                        if (item === node) {
                            if (preceding) {
                                if (hasVertical && renderParent.layoutVertical) {
                                    const rect = node.boundingClientRect;
                                    if (rect) {
                                        if (top !== 0) {
                                            top -= rect.top - bounds.top;
                                        }
                                        else if (previous && previous.positionRelative && previous.hasPX('top')) {
                                            bottom += bounds.bottom - rect.bottom;
                                        }
                                        else {
                                            bottom += rect.bottom - bounds.bottom;
                                        }
                                    }
                                }
                                if (hasHorizontal && renderParent.layoutHorizontal && !node.alignSibling('leftRight')) {
                                    const rect = node.boundingClientRect;
                                    if (rect) {
                                        if (left !== 0) {
                                            left -= rect.left - bounds.left;
                                        }
                                        else if (previous && previous.positionRelative && previous.hasPX('right')) {
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
                                    if (previous && previous.blockStatic && previous.positionRelative && item.blockStatic) {
                                        top -= previous.top;
                                    }
                                }
                                else if (bottom !== 0 && item.getBox(1 /* MARGIN_TOP */)[0]) {
                                    bottom -= item.marginTop;
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
                    target.modifyBox(1 /* MARGIN_TOP */, verticalAlign * -1);
                }
                if (top !== 0) {
                    target.modifyBox(1 /* MARGIN_TOP */, top);
                }
                else if (bottom !== 0) {
                    target.modifyBox(1 /* MARGIN_TOP */, bottom * -1);
                }
                if (left !== 0) {
                    if (target.autoMargin.left) {
                        target.modifyBox(2 /* MARGIN_RIGHT */, left * -1);
                    }
                    else {
                        target.modifyBox(8 /* MARGIN_LEFT */, left);
                    }
                }
                else if (right !== 0) {
                    target.modifyBox(8 /* MARGIN_LEFT */, right * -1);
                }
                if (target !== node) {
                    target.setBoxSpacing();
                }
            }
        }
    }

    const { isLength: isLength$1 } = squared.lib.css;
    function hasInlineText(node) {
        if (node.inlineText) {
            const textIndent = node.valueOf('textIndent');
            if (textIndent) {
                const offset = node.parseUnit(textIndent);
                if (offset < 0 && Math.abs(offset) >= node.bounds.width) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }
    class Sprite extends ExtensionUI {
        is(node) {
            return node.visibleStyle.backgroundImage && node.isEmpty() && !hasInlineText(node) && node.hasWidth && node.hasHeight && (!node.use || this.included(node.element));
        }
        condition(node) {
            const images = this.resource.fromImageUrl(node.localSettings.resourceId, node.backgroundImage);
            if (images.length === 1) {
                const dimension = node.actualDimension;
                const [backgroundPositionX, backgroundPositionY, backgroundSize] = node.cssAsTuple('backgroundPositionX', 'backgroundPositionY', 'backgroundSize');
                const position = ResourceUI.getBackgroundPosition(backgroundPositionX + ' ' + backgroundPositionY, dimension, { fontSize: node.fontSize, screenDimension: node.localSettings.screenDimension });
                const [sizeW, sizeH] = backgroundSize !== 'auto' ? backgroundSize.split(' ') : ['auto', 'auto'];
                const image = images[0];
                let { width, height } = image;
                if (sizeW !== 'auto' && isLength$1(sizeW, true)) {
                    width = node.parseWidth(sizeW, false);
                    if (sizeH === 'auto') {
                        height = image.height * width / image.width;
                    }
                }
                if (sizeH !== 'auto' && isLength$1(sizeH, true)) {
                    height = node.parseHeight(sizeH, false);
                    if (sizeW === 'auto') {
                        width = image.width * height / image.height;
                    }
                }
                if (width > dimension.width && position.left <= 0 || height > dimension.height && position.top <= 0) {
                    this.data.set(node, { image, width, height, position });
                    return true;
                }
            }
            return false;
        }
    }

    const { formatPercent, formatPX: formatPX$1, getStyle, isLength, isPercent } = squared.lib.css;
    const { getNamedItem } = squared.lib.dom;
    const { convertPercent, isNumber, replaceMap } = squared.lib.util;
    function setAutoWidth(node, td, data) {
        data.percent = Math.round(td.bounds.width / node.box.width * 100) + '%';
        data.expand = true;
    }
    function setBorderStyle(node, attr, including) {
        const cssStyle = attr + 'Style';
        node.ascend({ including }).some((item) => {
            if (item.has(cssStyle)) {
                const cssWidth = attr + 'Width';
                node.cssApply(item.cssAsObject(cssStyle, attr + 'Color', cssWidth));
                node.unsetCache(cssWidth);
                return true;
            }
            return false;
        });
    }
    function hideCell(node) {
        node.exclude({ resource: 31 /* ALL */ });
        node.hide();
    }
    function createDataAttribute(node) {
        let flags = 0;
        if (node.valueOf('tableLayout') === 'fixed') {
            flags |= 1 /* FIXED */;
        }
        if (node.valueOf('borderCollapse') === 'collapse') {
            flags |= 2 /* COLLAPSE */;
        }
        return {
            layoutType: 0,
            rowCount: 0,
            columnCount: 0,
            flags
        };
    }
    function getInheritedStyle(element, attr, exclude) {
        let value = '', current = element.parentElement;
        while (current && current.tagName !== 'TABLE') {
            value = getStyle(current)[attr];
            if (exclude.test(value)) {
                value = '';
            }
            else if (value) {
                break;
            }
            current = current.parentElement;
        }
        return value;
    }
    const setBoundsWidth = (node) => node.css('width', formatPX$1(node.bounds.width), true);
    class Table extends ExtensionUI {
        processNode(node) {
            const mainData = createDataAttribute(node);
            let table = [], tfoot, thead;
            const inheritStyles = (parent, append) => {
                if (parent) {
                    parent.cascade((item) => {
                        switch (item.tagName) {
                            case 'TH':
                            case 'TD':
                                item.inherit(parent, 'styleMap');
                                item.unsetCache('visibleStyle');
                                break;
                        }
                    });
                    if (append) {
                        table.push(...parent.children);
                    }
                    else {
                        table = parent.children.concat(table);
                    }
                }
            };
            node.each((item) => {
                switch (item.tagName) {
                    case 'THEAD':
                        thead || (thead = item);
                        hideCell(item);
                        break;
                    case 'TBODY':
                        table.push(...item.children);
                        hideCell(item);
                        break;
                    case 'TFOOT':
                        tfoot || (tfoot = item);
                        hideCell(item);
                        break;
                }
            });
            inheritStyles(thead, false);
            inheritStyles(tfoot, true);
            const layoutFixed = (mainData.flags & 1 /* FIXED */) > 0;
            const borderCollapse = (mainData.flags & 2 /* COLLAPSE */) > 0;
            const [horizontal, vertical] = !borderCollapse ? replaceMap(node.css('borderSpacing').split(' '), (value, index) => index === 0 ? node.parseUnit(value) : node.parseHeight(value)) : [0, 0];
            const spacingWidth = horizontal > 1 ? Math.round(horizontal / 2) : horizontal;
            const spacingHeight = vertical > 1 ? Math.round(vertical / 2) : vertical;
            const hasWidth = node.hasWidth;
            const colgroup = node.element.querySelector('COLGROUP');
            const caption = node.find(item => item.tagName === 'CAPTION');
            const captionBottom = caption && node.valueOf('captionSide') === 'bottom';
            const rowWidth = [];
            const mapBounds = [];
            const tableFilled = [];
            const mapWidth = [];
            const rowCount = table.length;
            let columnCount = 0, mapPercent = 0, percentAll;
            for (let i = 0; i < rowCount; ++i) {
                const tr = table[i];
                rowWidth[i] = horizontal;
                const row = tableFilled[i] || [];
                tableFilled[i] = row;
                tr.each((td, index) => {
                    const element = td.element;
                    const rowSpan = element.rowSpan;
                    let colSpan = element.colSpan, j = 0;
                    while (row[j]) {
                        ++j;
                    }
                    for (let k = i, q = i + rowSpan; k < q; ++k) {
                        const item = tableFilled[k] || (tableFilled[k] = []);
                        for (let l = j, m = 0, r = j + colSpan; l < r; ++l) {
                            if (!item[l]) {
                                item[l] = td;
                                ++m;
                            }
                            else {
                                colSpan = m;
                                break;
                            }
                        }
                    }
                    if (!td.hasPX('width')) {
                        const value = getNamedItem(element, 'width');
                        if (isPercent(value)) {
                            td.css('width', value, true);
                        }
                        else if (isNumber(value)) {
                            td.css('width', formatPX$1(+value), true);
                        }
                    }
                    if (!td.hasPX('height')) {
                        const value = getNamedItem(element, 'height');
                        if (isPercent(value)) {
                            td.css('height', value);
                        }
                        else if (isNumber(value)) {
                            td.css('height', formatPX$1(+value));
                        }
                    }
                    if (!td.valueOf('verticalAlign')) {
                        td.css('verticalAlign', 'middle');
                    }
                    const visibleStyle = td.visibleStyle;
                    if (!visibleStyle.backgroundImage && !visibleStyle.backgroundColor) {
                        const exclude = /rgba\(0, 0, 0, 0\)|transparent/;
                        if (colgroup) {
                            const group = colgroup.children[index + 1];
                            if (group) {
                                const { backgroundImage, backgroundColor } = getStyle(group);
                                if (backgroundImage !== 'none') {
                                    td.css('backgroundImage', backgroundImage, true);
                                    visibleStyle.backgroundImage = true;
                                }
                                if (!exclude.test(backgroundColor)) {
                                    td.css('backgroundColor', backgroundColor);
                                    td.setCacheValue('backgroundColor', backgroundColor);
                                    visibleStyle.backgroundColor = true;
                                }
                            }
                        }
                        else {
                            let value = getInheritedStyle(element, 'backgroundImage', /none/);
                            if (value) {
                                td.css('backgroundImage', value, true);
                                visibleStyle.backgroundImage = true;
                            }
                            if (value = getInheritedStyle(element, 'backgroundColor', exclude)) {
                                td.css('backgroundColor', value);
                                td.setCacheValue('backgroundColor', value);
                                visibleStyle.backgroundColor = true;
                            }
                        }
                        if (visibleStyle.backgroundImage || visibleStyle.backgroundColor) {
                            visibleStyle.background = true;
                        }
                    }
                    switch (td.tagName) {
                        case 'TD': {
                            const including = td.parent;
                            if (td.borderTopWidth === 0) {
                                setBorderStyle(td, 'borderTop', including);
                            }
                            if (td.borderRightWidth === 0) {
                                setBorderStyle(td, 'borderRight', including);
                            }
                            if (td.borderBottomWidth === 0) {
                                setBorderStyle(td, 'borderBottom', including);
                            }
                            if (td.borderLeftWidth === 0) {
                                setBorderStyle(td, 'borderLeft', including);
                            }
                            break;
                        }
                        case 'TH':
                            if (!td.valueOf('textAlign')) {
                                td.css('textAlign', 'center');
                            }
                            if (td.borderTopWidth === 0) {
                                setBorderStyle(td, 'borderTop', node);
                            }
                            if (td.borderBottomWidth === 0) {
                                setBorderStyle(td, 'borderBottom', node);
                            }
                            if (td.textElement) {
                                td.data(Resource.KEY_NAME, 'hintString', td.textContent);
                            }
                            break;
                    }
                    const columnWidth = td.valueOf('width');
                    const reevaluate = !mapWidth[j] || mapWidth[j] === 'auto';
                    const width = td.bounds.width;
                    if (i === 0 || reevaluate || !layoutFixed) {
                        if (!columnWidth || columnWidth === 'auto') {
                            if (!mapWidth[j]) {
                                mapWidth[j] = columnWidth || '0px';
                                mapBounds[j] = 0;
                            }
                            else if (i === rowCount - 1 && reevaluate && mapBounds[j] === 0) {
                                mapBounds[j] = width;
                            }
                        }
                        else if (reevaluate) {
                            mapWidth[j] = columnWidth;
                            mapBounds[j] = width;
                        }
                        else {
                            const percent = isPercent(columnWidth);
                            const length = isLength(mapWidth[j]);
                            if (width < mapBounds[j] || width === mapBounds[j] && (percent && length || percent && isPercent(mapWidth[j]) && td.parseUnit(columnWidth) >= td.parseUnit(mapWidth[j]) || length && isLength(columnWidth) && td.parseUnit(columnWidth) > td.parseUnit(mapWidth[j]))) {
                                mapWidth[j] = columnWidth;
                            }
                            if (element.colSpan === 1) {
                                mapBounds[j] = width;
                            }
                        }
                    }
                    if (!td.isEmpty() || td.inlineText) {
                        rowWidth[i] += width + horizontal;
                    }
                    if (spacingWidth) {
                        td.modifyBox(8 /* MARGIN_LEFT */, j === 0 ? horizontal : spacingWidth);
                        td.modifyBox(2 /* MARGIN_RIGHT */, index === 0 ? spacingWidth : horizontal);
                    }
                    if (spacingHeight) {
                        td.modifyBox(1 /* MARGIN_TOP */, i === 0 ? vertical : spacingHeight);
                        td.modifyBox(4 /* MARGIN_BOTTOM */, i + rowSpan < rowCount ? spacingHeight : vertical);
                    }
                    this.data.set(td, { colSpan, rowSpan, flags: 0 });
                });
                hideCell(tr);
                columnCount = Math.max(columnCount, row.length);
            }
            if (node.hasPX('width', { percent: false }) && mapWidth.some(value => isPercent(value))) {
                replaceMap(mapWidth, (value, index) => {
                    if (value === 'auto') {
                        const dimension = mapBounds[index];
                        if (dimension) {
                            return formatPX$1(dimension);
                        }
                    }
                    return value;
                });
            }
            if (mapWidth.every(value => isPercent(value))) {
                if (mapWidth.reduce((a, b) => a + convertPercent(b), 0) > 1) {
                    let percentTotal = 1;
                    replaceMap(mapWidth, value => {
                        const percent = convertPercent(value);
                        if (percentTotal <= 0) {
                            value = '0px';
                        }
                        else if (percentTotal - percent < 0) {
                            value = formatPercent(percentTotal);
                        }
                        percentTotal -= percent;
                        return value;
                    });
                }
                if (!hasWidth) {
                    mainData.flags |= 4 /* EXPAND */;
                }
                percentAll = true;
            }
            else if (mapWidth.every(value => isLength(value))) {
                const width = mapWidth.reduce((a, b) => a + parseFloat(b), 0);
                if (hasWidth) {
                    if (width < node.width) {
                        replaceMap(mapWidth, value => value !== '0px' ? formatPercent(parseFloat(value) / width) : value);
                    }
                    else if (width > node.width) {
                        node.css('width', 'auto');
                        if (!layoutFixed) {
                            for (const tr of table) {
                                for (const td of tr) {
                                    td.css('width', 'auto');
                                }
                            }
                        }
                    }
                }
                if (layoutFixed && !node.hasPX('width')) {
                    node.css('width', formatPX$1(node.bounds.width));
                }
            }
            mainData.layoutType = (() => {
                if (mapWidth.length > 1) {
                    mapPercent = mapWidth.reduce((a, b) => a + convertPercent(b, 0), 0);
                    if (layoutFixed && mapWidth.reduce((a, b) => a + (isLength(b) ? parseFloat(b) : 0), 0) >= node.actualWidth) {
                        return 4 /* COMPRESS */;
                    }
                    else if (mapWidth.length > 1 && mapWidth.some(value => isPercent(value)) || mapWidth.every(value => isLength(value) && value !== '0px')) {
                        return 3 /* VARIABLE */;
                    }
                    else if (mapWidth.every(value => value === mapWidth[0])) {
                        if (node.find(td => td.tagName === 'TD' && td.hasHeight, { cascade: true })) {
                            mainData.flags |= 4 /* EXPAND */;
                            return 3 /* VARIABLE */;
                        }
                        else if (mapWidth[0] === 'auto') {
                            return hasWidth ? 3 /* VARIABLE */ : table.some(tr => tr.find(td => td.multiline)) ? 3 /* VARIABLE */ : 0 /* NONE */;
                        }
                        else if (hasWidth) {
                            return 2 /* FIXED */;
                        }
                        else if (mapWidth[0] === '0px') {
                            return 0 /* NONE */;
                        }
                    }
                    if (mapWidth.every(value => value === 'auto' || value !== '0px' && isLength(value, true))) {
                        if (!hasWidth) {
                            mainData.flags |= 4 /* EXPAND */;
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
                            caption.css('maxWidth', formatPX$1(caption.bounds.width));
                        }
                    }
                    else if (caption.bounds.width > Math.max(...rowWidth)) {
                        setBoundsWidth(caption);
                    }
                }
                if (!caption.valueOf('textAlign')) {
                    caption.css('textAlign', 'center');
                }
                this.data.set(caption, { colSpan: columnCount });
                if (!captionBottom) {
                    caption.parent = node;
                }
            }
            for (let i = 0; i < rowCount; ++i) {
                const tr = tableFilled[i];
                const length = tr.length;
                for (let j = 0; j < length;) {
                    const td = tr[j];
                    const cellData = this.data.get(td);
                    const columnWidth = mapWidth[j];
                    let flags = cellData.flags;
                    j += cellData.colSpan;
                    if (flags & 32 /* PLACED */) {
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
                                        if (!hasWidth) {
                                            flags |= 4 /* EXCEED */;
                                        }
                                        flags |= 2 /* DOWNSIZED */;
                                    }
                                    else {
                                        setAutoWidth(node, td, cellData);
                                    }
                                }
                                else if (isPercent(columnWidth)) {
                                    if (percentAll) {
                                        cellData.percent = columnWidth;
                                        flags |= 1 /* EXPAND */;
                                    }
                                    else {
                                        setBoundsWidth(td);
                                    }
                                }
                                else if (isLength(columnWidth)) {
                                    if (td.bounds.width >= td.parseWidth(columnWidth)) {
                                        setBoundsWidth(td);
                                        flags |= 16 /* SHRINK */;
                                    }
                                    else if (layoutFixed) {
                                        setAutoWidth(node, td, cellData);
                                        flags |= 2 /* DOWNSIZED */;
                                    }
                                    else {
                                        setBoundsWidth(td);
                                        flags |= 16 /* SHRINK */;
                                    }
                                }
                                else {
                                    if (!td.hasPX('width', { percent: false }) || td.percentWidth) {
                                        setBoundsWidth(td);
                                    }
                                    flags |= 16 /* SHRINK */;
                                }
                                break;
                            case 2 /* FIXED */:
                                setAutoWidth(node, td, cellData);
                                break;
                            case 1 /* STRETCH */:
                                if (columnWidth === 'auto') {
                                    flags |= 8 /* FLEXIBLE */;
                                }
                                else {
                                    if (layoutFixed) {
                                        flags |= 2 /* DOWNSIZED */;
                                    }
                                    else {
                                        setBoundsWidth(td);
                                    }
                                    flags |= 16 /* SHRINK */;
                                }
                                break;
                            case 4 /* COMPRESS */:
                                if (!isLength(columnWidth)) {
                                    td.hide();
                                }
                                break;
                        }
                    }
                    flags |= 32 /* PLACED */;
                    cellData.flags = flags;
                    td.parent = node;
                }
                if (length < columnCount) {
                    const cellData = this.data.get(tr[length - 1]);
                    if (cellData) {
                        cellData.spaceSpan = columnCount - length;
                    }
                }
            }
            if (caption && captionBottom) {
                caption.parent = node;
            }
            if (borderCollapse) {
                let borderTop, borderRight, borderBottom, borderLeft, hideTop, hideRight, hideBottom, hideLeft;
                for (let i = 0; i < rowCount; ++i) {
                    const tr = tableFilled[i];
                    for (let j = 0; j < columnCount; ++j) {
                        const td = tr[j];
                        if (td && td.css('visibility') === 'visible') {
                            if (i === 0) {
                                if (td.borderTopWidth < node.borderTopWidth) {
                                    td.cssApply(borderTop || (borderTop = node.cssAsObject('borderTopColor', 'borderTopStyle', 'borderTopWidth')));
                                    td.unsetCache('borderTopWidth');
                                }
                                else {
                                    hideTop = true;
                                }
                            }
                            if (i >= 0 && i < rowCount - 1) {
                                const next = tableFilled[i + 1][j];
                                if (next && next.css('visibility') === 'visible' && next !== td) {
                                    if (td.borderBottomWidth > next.borderTopWidth) {
                                        next.css('borderTopWidth', '0px', true);
                                    }
                                    else {
                                        td.css('borderBottomWidth', '0px', true);
                                    }
                                }
                            }
                            if (i === rowCount - 1) {
                                if (td.borderBottomWidth < node.borderBottomWidth) {
                                    td.cssApply(borderBottom || (borderBottom = node.cssAsObject('borderBottomColor', 'borderBottomStyle', 'borderBottomWidth')));
                                    td.unsetCache('borderBottomWidth');
                                }
                                else {
                                    hideBottom = true;
                                }
                            }
                            if (j === 0) {
                                if (td.borderLeftWidth < node.borderLeftWidth) {
                                    td.cssApply(borderLeft || (borderLeft = node.cssAsObject('borderLeftColor', 'borderLeftStyle', 'borderLeftWidth')));
                                    td.unsetCache('borderLeftWidth');
                                }
                                else {
                                    hideLeft = true;
                                }
                            }
                            if (j >= 0 && j < columnCount - 1) {
                                const next = tr[j + 1];
                                if (next && next.css('visibility') === 'visible' && next !== td) {
                                    if (td.borderRightWidth >= next.borderLeftWidth) {
                                        next.css('borderLeftWidth', '0px', true);
                                    }
                                    else {
                                        td.css('borderRightWidth', '0px', true);
                                    }
                                }
                            }
                            if (j === columnCount - 1) {
                                if (td.borderRightWidth < node.borderRightWidth) {
                                    td.cssApply(borderRight || (borderRight = node.cssAsObject('borderRightColor', 'borderRightStyle', 'borderRightWidth')));
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
                    }, true, true);
                }
            }
            mainData.rowCount = rowCount + (caption ? 1 : 0);
            mainData.columnCount = columnCount;
            this.data.set(node, mainData);
        }
    }

    const { formatPX } = squared.lib.css;
    const { iterateReverseArray, minMaxOf, startsWith } = squared.lib.util;
    const DOCTYPE_HTML = !!document.doctype && document.doctype.name === 'html';
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
        if (item.getBox(region)[0]) {
            const registered = item.registerBox(region);
            if (registered) {
                const [reset, value] = registered.getBox(region);
                adjustment = Math.max(value, adjustment);
                if (reset === 1) {
                    registered.setBox(region, { adjustment });
                }
                else {
                    registered.setCacheValue(region === 1 /* MARGIN_TOP */ ? 'marginTop' : 'marginBottom', adjustment);
                }
                return;
            }
        }
        item.setBox(region, { reset: 1, adjustment });
    }
    function applyMarginCollapse(node, child, direction) {
        if (!direction || isBlockElement(child, true)) {
            let marginName, borderWidth, paddingName, region;
            if (direction) {
                marginName = 'marginTop';
                borderWidth = 'borderTopWidth';
                paddingName = 'paddingTop';
                region = 1 /* MARGIN_TOP */;
            }
            else {
                marginName = 'marginBottom';
                borderWidth = 'borderBottomWidth';
                paddingName = 'paddingBottom';
                region = 4 /* MARGIN_BOTTOM */;
            }
            if (node[borderWidth] === 0 && !node.getBox(region)[0]) {
                if (node[paddingName] === 0) {
                    let target = child, targetParent;
                    if (DOCTYPE_HTML) {
                        while (target[marginName] === 0 && target[borderWidth] === 0 && target[paddingName] === 0 && !target.getBox(region)[0] && canResetChild(target)) {
                            if (direction) {
                                const endChild = target.firstStaticChild;
                                if (isBlockElement(endChild, direction)) {
                                    (targetParent || (targetParent = [])).push(target);
                                    target = endChild;
                                }
                                else {
                                    break;
                                }
                            }
                            else {
                                const endChild = getBottomChild(target);
                                if (endChild) {
                                    (targetParent || (targetParent = [])).push(target);
                                    target = endChild;
                                }
                                else {
                                    break;
                                }
                            }
                        }
                    }
                    const offsetParent = node[marginName];
                    const offsetChild = target[marginName];
                    if (offsetParent >= 0 && offsetChild >= 0) {
                        const height = target.bounds.height;
                        let resetChild;
                        if (!DOCTYPE_HTML && offsetParent === 0 && offsetChild > 0 && !target.valueOf(marginName)) {
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
                                            adjustRegion(node, region, value);
                                        }
                                        registered.setBox(region, { reset: 1, adjustment: 0 });
                                    }
                                }
                                else if (!target.getBox(region)[0]) {
                                    if (outside) {
                                        resetChild = offsetChild > 0;
                                    }
                                    else if (node.documentBody) {
                                        resetBox(node, region);
                                        if (direction) {
                                            if (node.bounds.top > 0) {
                                                node.bounds.top = 0;
                                                node.resetBounds(true);
                                            }
                                            if (node.layoutVertical) {
                                                const firstChild = node.renderChildren.find(item => item.pageFlow);
                                                if (firstChild && firstChild !== child.outerMostWrapper && (target.positionStatic || target.top >= 0 && !target.hasPX('bottom'))) {
                                                    adjustRegion(firstChild, region, offsetChild);
                                                    adjustRegion(target, region, 0);
                                                    resetChild = true;
                                                }
                                            }
                                        }
                                    }
                                    else {
                                        adjustRegion(node, region, offsetChild);
                                        resetChild = true;
                                    }
                                }
                            }
                        }
                        if (resetChild) {
                            resetBox(target, region, undefined, targetParent);
                            if (height === 0 && !target.every(item => item.floating || !item.pageFlow)) {
                                resetBox(target, direction ? 4 /* MARGIN_BOTTOM */ : 1 /* MARGIN_TOP */);
                            }
                        }
                    }
                    else if (offsetParent < 0 && offsetChild < 0) {
                        if (!direction) {
                            if (offsetChild < offsetParent) {
                                adjustRegion(node, region, offsetChild);
                            }
                            resetBox(target, region, undefined, targetParent);
                        }
                    }
                }
                else if (child[marginName] === 0 && child[borderWidth] === 0 && canResetChild(child)) {
                    let blockAll = true;
                    do {
                        const endChild = (direction ? child.firstStaticChild : child.lastStaticChild);
                        if (endChild && endChild[marginName] === 0 && endChild[borderWidth] === 0 && !endChild.visibleStyle.background && canResetChild(endChild)) {
                            const value = endChild[paddingName];
                            if (value) {
                                if (value >= node[paddingName]) {
                                    node.setBox(direction ? 16 /* PADDING_TOP */ : 64 /* PADDING_BOTTOM */, { reset: 1 });
                                }
                                else if (blockAll) {
                                    node.modifyBox(direction ? 16 /* PADDING_TOP */ : 64 /* PADDING_BOTTOM */, value * -1, false);
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
        if (!node || !node.styleElement || node.floating || node.lineBreak) {
            return false;
        }
        const display = node.display;
        if (!startsWith(display, 'inline-')) {
            if (node.blockStatic || display === 'table' || display === 'list-item') {
                return true;
            }
            if (direction !== undefined) {
                if (direction) {
                    const firstChild = node.firstStaticChild;
                    return isBlockElement(firstChild) && validAboveChild(firstChild, false);
                }
                const lastChild = node.lastStaticChild;
                return isBlockElement(lastChild) && validBelowChild(lastChild, false);
            }
        }
        return false;
    }
    function getMarginOffset(below, above, lineHeight, aboveLineBreak) {
        let top = Infinity;
        if (below.nodeGroup && below.find(item => item.floating)) {
            below.renderEach((item) => {
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
        let bottomChild = null;
        if (!node.floatContainer) {
            bottomChild = node.lastStaticChild;
            if (!isBlockElement(node, false) || bottomChild && node.hasHeight && Math.floor(bottomChild.linear.bottom) < node.box.bottom) {
                bottomChild = null;
            }
        }
        else {
            let bottomFloat;
            const children = node.naturalChildren;
            for (let j = children.length - 1; j >= 0; --j) {
                const item = children[j];
                if (item.floating) {
                    if (!bottomChild) {
                        const bottom = item.linear.bottom;
                        if (bottomFloat) {
                            if (bottom > bottomFloat.linear.bottom) {
                                bottomFloat = item;
                            }
                        }
                        else if (Math.ceil(item.linear.bottom) >= node.box.bottom) {
                            bottomFloat = item;
                        }
                    }
                    else if (item.linear.bottom >= bottomChild.linear.bottom) {
                        bottomChild = item;
                        break;
                    }
                }
                else if (!bottomChild) {
                    if (bottomFloat && bottomFloat.linear.bottom > item.linear.bottom) {
                        bottomChild = bottomFloat;
                        break;
                    }
                    bottomChild = item;
                }
            }
            if (bottomFloat && !bottomChild) {
                bottomChild = bottomFloat;
            }
        }
        return bottomChild;
    }
    function checkOverflowValue(value) {
        switch (value) {
            case 'auto':
            case 'hidden':
            case 'overlay':
                return false;
            default:
                return true;
        }
    }
    function resetBox(node, region, register, wrapper) {
        node.setBox(region, { reset: 1 });
        if (register) {
            node.registerBox(region, register);
        }
        if (wrapper) {
            for (const parent of wrapper) {
                parent.setBox(region, { reset: 1 });
            }
        }
    }
    const canResetChild = (node, children = true) => (!children && node.blockStatic || children && !node.isEmpty() && !node.floating) && !node.layoutElement && !node.tableElement && node.tagName !== 'FIELDSET';
    const validAboveChild = (node, children) => !node.hasHeight && node.borderBottomWidth === 0 && node.paddingBottom === 0 && canResetChild(node, children);
    const validBelowChild = (node, children) => !node.hasHeight && node.borderTopWidth === 0 && node.paddingTop === 0 && canResetChild(node, children);
    const hasOverflow = (node) => checkOverflowValue(node.valueOf('overflowY')) || checkOverflowValue(node.valueOf('overflowX'));
    const isLowestElement = (node, siblings) => node.linear.bottom >= minMaxOf(siblings, sibling => sibling.linear.bottom, '>')[1];
    class WhiteSpace extends ExtensionUI {
        constructor() {
            super(...arguments);
            this.eventOnly = true;
        }
        afterBaseLayout(sessionId) {
            const { cache, excluded } = this.application.getProcessing(sessionId);
            const clearMap = this.application.clearMap;
            const processed = new WeakSet();
            cache.each(node => {
                var _a, _b;
                if (node.naturalElement && !node.hasAlign(2 /* AUTO_LAYOUT */)) {
                    const children = node.naturalChildren;
                    const length = children.length;
                    if (length === 0) {
                        return;
                    }
                    const collapseMargin = node.pageFlow && isBlockElement(node, true) && ((_a = node.actualParent) === null || _a === void 0 ? void 0 : _a.layoutElement) !== true && hasOverflow(node) && node.tagName !== 'FIELDSET';
                    let firstChild, lastChild, previousChild, belowFloating;
                    for (let i = 0; i < length; ++i) {
                        const current = children[i];
                        if (current.pageFlow) {
                            const floating = current.floating;
                            if (collapseMargin) {
                                if (!floating) {
                                    firstChild || (firstChild = current);
                                    lastChild = current;
                                }
                                else if (belowFloating) {
                                    if (current.bounds.top === belowFloating[0].bounds.top) {
                                        belowFloating.push(current);
                                    }
                                    else if (isLowestElement(current, belowFloating)) {
                                        belowFloating = [current];
                                    }
                                }
                                else {
                                    belowFloating = [current];
                                }
                            }
                            blockMain: {
                                if (isBlockElement(current, true)) {
                                    if (i > 0) {
                                        let previous = children[i - 1], inheritedTop;
                                        if (previous.floating || !previous.pageFlow) {
                                            if (node.layoutVertical) {
                                                const previousSiblings = current.previousSiblings();
                                                if (previousSiblings.some(sibling => sibling.float === 'right' && current.bounds.top > sibling.bounds.top)) {
                                                    const aboveFloating = previousSiblings.filter(sibling => sibling.floating && previous.bounds.top === sibling.bounds.top);
                                                    if (aboveFloating.length) {
                                                        const [nearest, previousBottom] = minMaxOf(aboveFloating, sibling => sibling.linear.bottom, '>');
                                                        if (nearest.marginBottom > 0 && current.bounds.top < previousBottom) {
                                                            if (nearest.marginBottom < current.marginTop) {
                                                                for (const sibling of aboveFloating) {
                                                                    resetBox(sibling, 4 /* MARGIN_BOTTOM */);
                                                                }
                                                            }
                                                            else if (current.marginTop > 0) {
                                                                resetBox(current, 1 /* MARGIN_TOP */);
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            if (previousChild) {
                                                previous = previousChild;
                                            }
                                        }
                                        else if (previous.bounds.height === 0 && previous.find(item => item.floating)) {
                                            const value = current.linear.top - previous.max('linear', { subAttr: 'bottom' }).linear.bottom;
                                            if (value < 0) {
                                                current.modifyBox(1 /* MARGIN_TOP */, Math.floor(value), false);
                                                continue;
                                            }
                                        }
                                        if (isBlockElement(previous, false)) {
                                            let marginBottom = previous.marginBottom, marginTop = current.marginTop;
                                            if (previous.marginTop < 0 && previous.bounds.height === 0) {
                                                const offset = Math.min(marginBottom, previous.marginTop);
                                                if (offset < 0) {
                                                    if (Math.abs(offset) < marginTop) {
                                                        current.modifyBox(1 /* MARGIN_TOP */, offset);
                                                    }
                                                    else {
                                                        resetBox(current, 1 /* MARGIN_TOP */);
                                                    }
                                                    processed.add(previous);
                                                    previous.hide({ collapse: true });
                                                    break blockMain;
                                                }
                                            }
                                            else if (current.marginBottom < 0 && current.bounds.height === 0) {
                                                const offset = Math.min(marginTop, current.marginBottom);
                                                if (offset < 0) {
                                                    if (Math.abs(offset) < marginBottom) {
                                                        previous.modifyBox(4 /* MARGIN_BOTTOM */, offset);
                                                    }
                                                    else {
                                                        resetBox(previous, 4 /* MARGIN_BOTTOM */);
                                                    }
                                                    processed.add(current);
                                                    current.hide({ collapse: true });
                                                    break blockMain;
                                                }
                                            }
                                            let inherit = previous, inheritedBottom;
                                            while (validAboveChild(inherit, true)) {
                                                let bottomChild = getBottomChild(inherit);
                                                if (bottomChild && !bottomChild.getBox(4 /* MARGIN_BOTTOM */)[0]) {
                                                    let childBottom = bottomChild.marginBottom, currentChild = bottomChild;
                                                    while (currentChild.bounds.height === 0 && !currentChild.pseudoElement) {
                                                        const currentTop = currentChild.marginTop;
                                                        childBottom = Math.max(currentTop, currentChild.marginBottom, childBottom);
                                                        if (currentTop !== 0) {
                                                            resetBox(currentChild, 1 /* MARGIN_TOP */);
                                                        }
                                                        if (currentChild.every(item => item.floating || !item.pageFlow)) {
                                                            const nextChild = getBottomChild(currentChild);
                                                            if (nextChild) {
                                                                childBottom = nextChild.marginBottom;
                                                                currentChild = nextChild;
                                                            }
                                                            else {
                                                                break;
                                                            }
                                                        }
                                                        else {
                                                            const sibling = currentChild.previousSibling;
                                                            if (sibling) {
                                                                if (sibling.marginBottom >= childBottom) {
                                                                    if (currentChild.marginBottom !== 0) {
                                                                        resetBox(currentChild, 4 /* MARGIN_BOTTOM */);
                                                                    }
                                                                    bottomChild = sibling;
                                                                    childBottom = sibling.marginBottom;
                                                                    currentChild = sibling;
                                                                }
                                                                else if (sibling.bounds.height) {
                                                                    break;
                                                                }
                                                                else {
                                                                    if (sibling.marginBottom !== 0) {
                                                                        resetBox(sibling, 4 /* MARGIN_BOTTOM */);
                                                                    }
                                                                    currentChild = sibling;
                                                                }
                                                            }
                                                            else {
                                                                break;
                                                            }
                                                        }
                                                    }
                                                    if (childBottom !== 0) {
                                                        resetBox(bottomChild, 4 /* MARGIN_BOTTOM */, !previous.getBox(4 /* MARGIN_BOTTOM */)[0] ? previous : undefined);
                                                    }
                                                    if (childBottom > marginBottom) {
                                                        marginBottom = childBottom;
                                                        inheritedBottom = true;
                                                    }
                                                    else if (childBottom === 0) {
                                                        inherit = bottomChild;
                                                        continue;
                                                    }
                                                }
                                                break;
                                            }
                                            inherit = current;
                                            while (validBelowChild(inherit, true)) {
                                                let topChild = inherit.firstStaticChild;
                                                if (isBlockElement(topChild, true) && !topChild.getBox(1 /* MARGIN_TOP */)[0]) {
                                                    let childTop = topChild.marginTop, currentChild = topChild;
                                                    while (currentChild.bounds.height === 0 && !currentChild.pseudoElement) {
                                                        const currentBottom = currentChild.marginBottom;
                                                        childTop = Math.max(currentChild.marginTop, currentBottom, childTop);
                                                        if (currentBottom !== 0) {
                                                            resetBox(currentChild, 4 /* MARGIN_BOTTOM */);
                                                        }
                                                        if (currentChild.every(item => item.floating || !item.pageFlow)) {
                                                            const nextChild = currentChild.firstStaticChild;
                                                            if (nextChild) {
                                                                childTop = nextChild.marginTop;
                                                                currentChild = nextChild;
                                                            }
                                                            else {
                                                                break;
                                                            }
                                                        }
                                                        else {
                                                            const sibling = currentChild.nextSibling;
                                                            if (sibling) {
                                                                if (sibling.marginTop >= childTop) {
                                                                    if (currentChild.marginTop !== 0) {
                                                                        resetBox(currentChild, 1 /* MARGIN_TOP */);
                                                                    }
                                                                    topChild = sibling;
                                                                    childTop = sibling.marginTop;
                                                                    currentChild = sibling;
                                                                }
                                                                else if (sibling.bounds.height) {
                                                                    break;
                                                                }
                                                                else {
                                                                    if (sibling.marginTop !== 0) {
                                                                        resetBox(sibling, 1 /* MARGIN_TOP */);
                                                                    }
                                                                    currentChild = sibling;
                                                                }
                                                            }
                                                            else {
                                                                break;
                                                            }
                                                        }
                                                    }
                                                    if (childTop !== 0) {
                                                        resetBox(topChild, 1 /* MARGIN_TOP */, !current.getBox(1 /* MARGIN_TOP */)[0] ? current : undefined);
                                                    }
                                                    if (childTop > marginTop) {
                                                        marginTop = childTop;
                                                        inheritedTop = true;
                                                    }
                                                    else if (childTop === 0) {
                                                        inherit = topChild;
                                                        continue;
                                                    }
                                                }
                                                break;
                                            }
                                            if (marginBottom > 0) {
                                                if (marginTop > 0) {
                                                    if (marginTop <= marginBottom) {
                                                        if (!inheritedTop || hasOverflow(current)) {
                                                            resetBox(current, 1 /* MARGIN_TOP */);
                                                            if (current.bounds.height === 0 && marginBottom >= current.marginBottom) {
                                                                resetBox(current, 4 /* MARGIN_BOTTOM */);
                                                            }
                                                            inheritedTop = false;
                                                        }
                                                    }
                                                    else if (!inheritedBottom || hasOverflow(previous)) {
                                                        resetBox(previous, 4 /* MARGIN_BOTTOM */);
                                                        if (previous.bounds.height === 0 && marginTop >= previous.marginTop) {
                                                            resetBox(previous, 1 /* MARGIN_TOP */);
                                                        }
                                                        inheritedBottom = false;
                                                    }
                                                }
                                                else if (current.bounds.height === 0) {
                                                    marginTop = Math.min(marginTop, current.marginBottom);
                                                    if (marginTop < 0) {
                                                        previous.modifyBox(4 /* MARGIN_BOTTOM */, marginTop);
                                                        current.hide({ collapse: true });
                                                    }
                                                }
                                            }
                                            if (marginTop > 0 && previous.floatContainer && current.getBox(1 /* MARGIN_TOP */)[1] === 0 && hasOverflow(previous)) {
                                                let valid;
                                                if (previous.bounds.height === 0) {
                                                    valid = true;
                                                }
                                                else {
                                                    let direction;
                                                    iterateReverseArray(previous.naturalElements, (item) => {
                                                        if (clearMap.has(item)) {
                                                            return true;
                                                        }
                                                        else if (item.floating) {
                                                            if (item.linear.bottom > Math.ceil(previous.bounds.bottom)) {
                                                                direction = item.float;
                                                            }
                                                            return true;
                                                        }
                                                    });
                                                    if (direction) {
                                                        switch ((_b = previous.elementData['styleMap::after']) === null || _b === void 0 ? void 0 : _b.clear) {
                                                            case direction:
                                                            case 'both':
                                                                valid = false;
                                                                break;
                                                            default:
                                                                valid = true;
                                                                break;
                                                        }
                                                    }
                                                }
                                                if (valid) {
                                                    current.modifyBox(1 /* MARGIN_TOP */, current.linear.top - Math.max(...previous.naturalElements.map(item => item.linear.bottom)), false);
                                                }
                                            }
                                            if (inheritedTop) {
                                                let adjacentBottom = 0;
                                                if (previous.bounds.height === 0) {
                                                    const previousSibling = previous.previousSibling;
                                                    adjacentBottom = previousSibling && isBlockElement(previousSibling, false) ? Math.max(previousSibling.getBox(4 /* MARGIN_BOTTOM */)[1], previousSibling.marginBottom) : 0;
                                                }
                                                if (marginTop > adjacentBottom) {
                                                    (current.registerBox(1 /* MARGIN_TOP */) || current).setCacheValue('marginTop', marginTop);
                                                }
                                            }
                                            if (inheritedBottom) {
                                                let adjacentTop = 0;
                                                if (current.bounds.height === 0) {
                                                    const nextSibling = current.nextSibling;
                                                    adjacentTop = nextSibling && isBlockElement(nextSibling, true) ? Math.max(nextSibling.getBox(1 /* MARGIN_TOP */)[1], nextSibling.marginTop) : 0;
                                                }
                                                if (marginBottom >= adjacentTop) {
                                                    (previous.registerBox(4 /* MARGIN_BOTTOM */) || previous).setCacheValue('marginBottom', marginBottom);
                                                }
                                            }
                                        }
                                        else if (current.bounds.height === 0) {
                                            const { marginTop, marginBottom } = current;
                                            if (marginTop > 0 && marginBottom > 0) {
                                                if (marginTop < marginBottom) {
                                                    resetBox(current, 1 /* MARGIN_TOP */);
                                                }
                                                else if (i === length - 1) {
                                                    current.setCacheValue('marginBottom', marginTop);
                                                    resetBox(current, 1 /* MARGIN_TOP */);
                                                }
                                                else {
                                                    resetBox(current, 4 /* MARGIN_BOTTOM */);
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
                                            resetBox(current, 4 /* MARGIN_BOTTOM */);
                                        }
                                    }
                                }
                            }
                            if (!floating) {
                                previousChild = current;
                            }
                        }
                    }
                    if (firstChild && firstChild.naturalElement) {
                        applyMarginCollapse(node, firstChild, true);
                    }
                    if (lastChild && (!belowFloating || isLowestElement(lastChild, belowFloating))) {
                        if (lastChild.naturalElement) {
                            applyMarginCollapse(node, lastChild, false);
                            if (lastChild.marginTop < 0) {
                                const offset = lastChild.bounds.height + lastChild.marginBottom + lastChild.marginTop;
                                if (offset < 0) {
                                    node.modifyBox(64 /* PADDING_BOTTOM */, offset, false);
                                }
                            }
                        }
                    }
                    else if (belowFloating && node.borderBottomWidth === 0 && node.paddingBottom === 0) {
                        const bottomChild = minMaxOf(belowFloating, sibling => sibling.linear.bottom, '>')[0];
                        if (bottomChild.marginBottom >= node.marginBottom && !bottomChild.getBox(4 /* MARGIN_BOTTOM */)[0]) {
                            (node.registerBox(4 /* MARGIN_BOTTOM */) || node).setCacheValue('marginBottom', bottomChild.marginBottom);
                        }
                        for (const sibling of belowFloating) {
                            if (!sibling.getBox(4 /* MARGIN_BOTTOM */)[0]) {
                                resetBox(sibling, 4 /* MARGIN_BOTTOM */);
                            }
                        }
                    }
                }
            });
            excluded.each(node => {
                var _a, _b;
                if (node.lineBreak && !node.lineBreakTrailing && !clearMap.has(node) && !processed.has(node)) {
                    let valid;
                    const previousSiblings = node.previousSiblings();
                    const q = previousSiblings.length;
                    if (q) {
                        const parent = node.actualParent;
                        const nextSiblings = node.siblingsTrailing;
                        const r = nextSiblings.length;
                        if (r) {
                            let above = previousSiblings[q - 1], below = nextSiblings[r - 1], lineHeight = 0, aboveLineBreak = null, offset;
                            if (above.rendered && below.rendered) {
                                if (above.inlineStatic && below.inlineStatic) {
                                    if (q === 1) {
                                        processed.add(node);
                                        return;
                                    }
                                    else if (q > 1) {
                                        aboveLineBreak = previousSiblings[0];
                                        if (aboveLineBreak.lineBreak) {
                                            aboveLineBreak = node;
                                            aboveLineBreak.setBounds(false);
                                        }
                                        else {
                                            aboveLineBreak = null;
                                        }
                                    }
                                }
                                let aboveParent = above.renderParent, belowParent = below.renderParent;
                                if (aboveParent !== belowParent) {
                                    while (aboveParent && aboveParent !== parent) {
                                        above = aboveParent;
                                        aboveParent = above.renderParent;
                                    }
                                    while (belowParent && belowParent !== parent) {
                                        below = belowParent;
                                        belowParent = below.renderParent;
                                    }
                                }
                                if (above.textElement && !above.multiline) {
                                    let value = 0;
                                    if (above.has('lineHeight')) {
                                        value = above.lineHeight;
                                    }
                                    else if (!above.isEmpty()) {
                                        value = above.layoutVertical ? (_a = above.lastStaticChild) === null || _a === void 0 ? void 0 : _a.lineHeight : Math.max(...above.map(item => item.lineHeight));
                                    }
                                    if (value) {
                                        const aboveOffset = Math.floor((value - above.bounds.height) / 2);
                                        if (aboveOffset > 0) {
                                            lineHeight += aboveOffset;
                                        }
                                    }
                                }
                                if (below.textElement && !below.multiline) {
                                    let value = 0;
                                    if (below.has('lineHeight')) {
                                        value = below.lineHeight;
                                    }
                                    else if (!below.isEmpty()) {
                                        if (below.layoutVertical) {
                                            value = (_b = below.firstStaticChild) === null || _b === void 0 ? void 0 : _b.lineHeight;
                                        }
                                        else {
                                            value = Math.max(...below.map(item => item.lineHeight));
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
                                    const top = !below.visible ? below.registerBox(1 /* MARGIN_TOP */) : below;
                                    if (top) {
                                        top.modifyBox(1 /* MARGIN_TOP */, offset);
                                        valid = true;
                                    }
                                    else {
                                        const bottom = !above.visible ? above.registerBox(4 /* MARGIN_BOTTOM */) : above;
                                        if (bottom) {
                                            bottom.modifyBox(4 /* MARGIN_BOTTOM */, offset);
                                            valid = true;
                                        }
                                    }
                                }
                            }
                            else {
                                [offset, below] = getMarginOffset(below, above, lineHeight);
                                if (offset >= 1) {
                                    if ((below.lineBreak || below.excluded) && parent.lastChild === below) {
                                        parent.modifyBox(64 /* PADDING_BOTTOM */, offset);
                                        valid = true;
                                    }
                                    else if ((above.lineBreak || above.excluded) && parent.firstChild === above) {
                                        parent.modifyBox(16 /* PADDING_TOP */, offset);
                                        valid = true;
                                    }
                                }
                            }
                        }
                        else if (parent.visible && !parent.preserveWhiteSpace && parent.tagName !== 'CODE' && !parent.documentRoot && !parent.documentBody) {
                            const previousStart = previousSiblings[previousSiblings.length - 1];
                            const rect = previousStart.bounds.height === 0 && !previousStart.isEmpty() ? previousStart.outerRegion : previousStart.linear;
                            const offset = parent.box.bottom - (previousStart.lineBreak || previousStart.excluded ? rect.top : rect.bottom);
                            if (offset !== 0) {
                                if (previousStart.rendered || parent.visibleStyle.background) {
                                    parent.modifyBox(64 /* PADDING_BOTTOM */, offset);
                                }
                                else if (!parent.hasHeight) {
                                    const value = Math.max(offset, parent.hasPX('minHeight', { percent: false }) ? parent.cssUnit('minHeight', { dimension: 'height' }) : 0);
                                    if (value) {
                                        parent.css('minHeight', formatPX(value));
                                    }
                                }
                            }
                        }
                        if (valid) {
                            for (let i = 0; i < q; ++i) {
                                processed.add(previousSiblings[i]);
                            }
                            for (let i = 0; i < r; ++i) {
                                processed.add(nextSiblings[i]);
                            }
                        }
                    }
                }
            });
        }
        afterConstraints(sessionId) {
            this.application.getProcessingCache(sessionId).each(node => {
                if (node.naturalChild && node.styleElement && node.inlineVertical && node.pageFlow && !node.positioned) {
                    const actualParent = node.actualParent;
                    if (actualParent.layoutElement) {
                        return;
                    }
                    const outerWrapper = node.outerMostWrapper;
                    const renderParent = outerWrapper.renderParent;
                    if (renderParent && !renderParent.hasAlign(2 /* AUTO_LAYOUT */)) {
                        if (node.blockDimension && !node.floating) {
                            if (renderParent.layoutVertical) {
                                const children = renderParent.renderChildren;
                                for (let i = 0, length = children.length; i < length; ++i) {
                                    if (children[i] === outerWrapper) {
                                        if (i > 0 && !node.lineBreakLeading && !node.baselineAltered) {
                                            const previous = children[i - 1];
                                            if (previous.pageFlow && (!previous.blockStatic || node.inlineStatic && node.blockDimension)) {
                                                setSpacingOffset(outerWrapper, 1 /* MARGIN_TOP */, previous.actualRect('bottom'), previous.getBox(4 /* MARGIN_BOTTOM */)[1]);
                                            }
                                        }
                                        if (i < length - 1 && !node.lineBreakTrailing) {
                                            const next = children[i + 1];
                                            if (next.pageFlow && next.styleElement && !next.inlineVertical) {
                                                setSpacingOffset(outerWrapper, 4 /* MARGIN_BOTTOM */, next.actualRect('top'), next.getBox(1 /* MARGIN_TOP */)[1]);
                                            }
                                        }
                                        break;
                                    }
                                }
                            }
                            else if (!node.baselineAltered) {
                                const horizontalRows = renderParent.horizontalRows;
                                const validSibling = (item) => item.pageFlow && item.blockDimension && !item.floating && !item.excluded;
                                let horizontal;
                                if (horizontalRows && horizontalRows.length > 1) {
                                    found: {
                                        for (let i = 0, length = horizontalRows.length; i < length; ++i) {
                                            const row = horizontalRows[i];
                                            const q = row.length;
                                            for (let j = 0; j < q; ++j) {
                                                if (outerWrapper === row[j]) {
                                                    if (i > 0) {
                                                        const previousRow = horizontalRows[i - 1];
                                                        const r = previousRow.length;
                                                        if (!isBlockElement(previousRow[r - 1], false) || !isBlockElement(outerWrapper, true)) {
                                                            let maxBottom = -Infinity;
                                                            for (let k = 0; k < r; ++k) {
                                                                const innerWrapped = previousRow[k].innerMostWrapped;
                                                                if (validSibling(innerWrapped)) {
                                                                    maxBottom = Math.max(innerWrapped.actualRect('bottom'), maxBottom);
                                                                }
                                                            }
                                                            if (maxBottom !== -Infinity) {
                                                                setSpacingOffset(outerWrapper, 1 /* MARGIN_TOP */, maxBottom);
                                                            }
                                                        }
                                                    }
                                                    else {
                                                        horizontal = row;
                                                    }
                                                    break found;
                                                }
                                            }
                                        }
                                    }
                                }
                                else if (renderParent.layoutHorizontal || renderParent.hasAlign(512 /* INLINE */)) {
                                    horizontal = renderParent.renderChildren;
                                }
                                if (horizontal) {
                                    const siblings = [];
                                    let maxBottom = -Infinity;
                                    for (let i = 0, length = horizontal.length; i < length; ++i) {
                                        const item = horizontal[i];
                                        if (item.nodeGroup) {
                                            siblings.push(...item.cascade(child => child.naturalChild));
                                        }
                                        else if (item.innerWrapped) {
                                            siblings.push(item.innerMostWrapped);
                                        }
                                        else {
                                            siblings.push(item);
                                        }
                                    }
                                    const children = actualParent.naturalChildren;
                                    for (let i = 0, length = children.length; i < length; ++i) {
                                        const item = children[i];
                                        if (siblings.includes(item)) {
                                            break;
                                        }
                                        else if (item.lineBreak || item.block) {
                                            maxBottom = -Infinity;
                                        }
                                        else if (validSibling(item)) {
                                            maxBottom = Math.max(item.actualRect('bottom'), maxBottom);
                                        }
                                    }
                                    if (maxBottom !== -Infinity && node.actualRect('top') > maxBottom) {
                                        setSpacingOffset(outerWrapper, 1 /* MARGIN_TOP */, maxBottom);
                                    }
                                }
                            }
                        }
                        if (actualParent.inlineStatic && actualParent.marginLeft > 0 && actualParent.firstStaticChild === node && renderParent.renderParent.outerMostWrapper.layoutVertical) {
                            outerWrapper.modifyBox(8 /* MARGIN_LEFT */, renderParent.marginLeft);
                        }
                        else if (!renderParent.layoutVertical && !outerWrapper.alignParent('left') && !node.textJustified) {
                            const documentId = outerWrapper.alignSibling('leftRight');
                            if (documentId) {
                                const previousSibling = renderParent.renderChildren.find(item => item.documentId === documentId);
                                if (previousSibling && previousSibling.inlineVertical && previousSibling.bounds.width) {
                                    setSpacingOffset(outerWrapper, 8 /* MARGIN_LEFT */, previousSibling.actualRect('right'));
                                }
                            }
                            else {
                                let current = node;
                                while (true) {
                                    const siblingsLeading = current.siblingsLeading;
                                    if (siblingsLeading.length && !siblingsLeading.some(item => item.lineBreak || item.excluded && item.blockStatic)) {
                                        const previousSibling = siblingsLeading[0];
                                        if (previousSibling.inlineVertical) {
                                            setSpacingOffset(outerWrapper, 8 /* MARGIN_LEFT */, previousSibling.actualRect('right'));
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
        WhiteSpace
    };
    const lib = {
        constant,
        util
    };

    exports.Application = Application;
    exports.ApplicationUI = ApplicationUI;
    exports.ContentUI = ContentUI;
    exports.Controller = Controller;
    exports.ControllerUI = ControllerUI;
    exports.Extension = Extension;
    exports.ExtensionManager = ExtensionManager;
    exports.ExtensionUI = ExtensionUI;
    exports.File = File;
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

    return exports;

}({}));
