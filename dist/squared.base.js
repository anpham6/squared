/* squared.base 0.9.5
   https://github.com/anpham6/squared */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory((global.squared = global.squared || {}, global.squared.base = {})));
}(this, function (exports) { 'use strict';

    const $css = squared.lib.css;
    const $util = squared.lib.util;
    class NodeList extends squared.lib.base.Container {
        constructor(children) {
            super(children);
            this._currentId = 0;
        }
        static outerRegion(node) {
            const nodes = node.duplicate();
            let top = nodes[0];
            let right = top;
            let bottom = top;
            let left = top;
            node.each(item => item.companion && !item.companion.visible && nodes.push(item.companion));
            for (let i = 1; i < nodes.length; i++) {
                const item = nodes[i];
                if (item.linear.top < top.linear.top) {
                    top = item;
                }
                if (item.linear.right > right.linear.right) {
                    right = item;
                }
                if (item.linear.bottom > bottom.linear.bottom) {
                    bottom = item;
                }
                if (item.linear.left < left.linear.left) {
                    left = item;
                }
            }
            return {
                top: top.linear.top,
                right: right.linear.right,
                bottom: bottom.linear.bottom,
                left: left.linear.left
            };
        }
        static actualParent(list) {
            for (const node of list) {
                if (node.naturalElement) {
                    if (node.actualParent) {
                        return node.actualParent;
                    }
                }
                else if (node.groupParent) {
                    const parent = NodeList.actualParent(node.actualChildren);
                    if (parent) {
                        return parent;
                    }
                }
            }
            return null;
        }
        static baseline(list, text = false) {
            const baseline = $util.filterArray(list, item => (item.baseline || $css.isLength(item.verticalAlign)) && !item.floating && !item.baselineAltered && (item.length === 0 || item.every(child => child.baseline && !child.multiline)));
            if (baseline.length) {
                list = baseline;
            }
            else {
                return baseline;
            }
            if (text) {
                $util.spliceArray(list, item => !(item.textElement && item.naturalElement));
            }
            if (list.length > 1) {
                let boundsHeight = 0;
                let lineHeight = 0;
                for (let i = 0; i < list.length; i++) {
                    const item = list[i];
                    if (!(item.layoutVertical && item.length > 1 || item.plainText && item.multiline)) {
                        let height;
                        if (item.multiline && item.cssTry('whiteSpace', 'nowrap')) {
                            height = item.element.getBoundingClientRect().height;
                            item.cssFinally('whiteSpace');
                        }
                        else {
                            height = item.bounds.height;
                        }
                        boundsHeight = Math.max(boundsHeight, height);
                        lineHeight = Math.max(lineHeight, item.lineHeight);
                    }
                    else {
                        list.splice(i--, 1);
                    }
                }
                $util.spliceArray(list, item => lineHeight > boundsHeight ? item.lineHeight !== lineHeight : item.bounds.height < boundsHeight);
                list.sort((a, b) => {
                    if (a.groupParent || a.length || !a.baseline && b.baseline) {
                        return 1;
                    }
                    else if (b.groupParent || b.length || a.baseline && !b.baseline) {
                        return -1;
                    }
                    else if (!a.imageElement || !b.imageElement) {
                        if (a.textElement && b.textElement) {
                            if (a.fontSize === b.fontSize) {
                                if (a.htmlElement && !b.htmlElement) {
                                    return -1;
                                }
                                else if (!a.htmlElement && b.htmlElement) {
                                    return 1;
                                }
                                return a.siblingIndex < b.siblingIndex ? -1 : 1;
                            }
                            return a.fontSize > b.fontSize ? -1 : 1;
                        }
                        else if (a.containerType !== b.containerType) {
                            if (a.textElement) {
                                return -1;
                            }
                            else if (b.textElement) {
                                return 1;
                            }
                            else if (a.imageElement) {
                                return -1;
                            }
                            else if (b.imageElement) {
                                return 1;
                            }
                            return a.containerType < b.containerType ? -1 : 1;
                        }
                    }
                    const heightA = Math.max(a.actualHeight, a.lineHeight);
                    const heightB = Math.max(b.actualHeight, b.lineHeight);
                    if (heightA !== heightB) {
                        return heightA > heightB ? -1 : 1;
                    }
                    return 0;
                });
            }
            return list;
        }
        static linearData(list, clearOnly = false) {
            const nodes = [];
            const floating = new Set();
            const clearable = {};
            const floated = new Set();
            const cleared = new Map();
            let linearX = false;
            let linearY = false;
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
                        for (const item of previousFloat) {
                            if (item && floating.has(item.float) && !node.floating && node.linear.top >= item.linear.bottom) {
                                floating.delete(item.float);
                                clearable[item.float] = undefined;
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
                        floating.add(node.float);
                        floated.add(node.float);
                        clearable[node.float] = node;
                    }
                    nodes.push(node);
                }
            }
            if (nodes.length) {
                if (!clearOnly) {
                    const siblings = [nodes[0]];
                    let x = 1;
                    let y = 1;
                    for (let i = 1; i < nodes.length; i++) {
                        if (nodes[i].alignedVertically(nodes[i].previousSiblings(), siblings, cleared)) {
                            y++;
                        }
                        else {
                            x++;
                        }
                        siblings.push(nodes[i]);
                    }
                    linearX = x === nodes.length;
                    linearY = y === nodes.length;
                    if (linearX && floated.size) {
                        let boxLeft = Number.POSITIVE_INFINITY;
                        let boxRight = Number.NEGATIVE_INFINITY;
                        let floatLeft = Number.NEGATIVE_INFINITY;
                        let floatRight = Number.POSITIVE_INFINITY;
                        for (const node of nodes) {
                            boxLeft = Math.min(boxLeft, node.linear.left);
                            boxRight = Math.max(boxRight, node.linear.right);
                            if (node.floating) {
                                if (node.float === 'left') {
                                    floatLeft = Math.max(floatLeft, node.linear.right);
                                }
                                else {
                                    floatRight = Math.min(floatRight, node.linear.left);
                                }
                            }
                        }
                        for (let i = 0, j = 0, k = 0, l = 0, m = 0; i < nodes.length; i++) {
                            const item = nodes[i];
                            if (Math.floor(item.linear.left) <= boxLeft) {
                                j++;
                            }
                            if (Math.ceil(item.linear.right) >= boxRight) {
                                k++;
                            }
                            if (!item.floating) {
                                if (item.linear.left === floatLeft) {
                                    l++;
                                }
                                if (item.linear.right === floatRight) {
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
                            if (previous.floating && item.linear.top >= previous.linear.bottom || $util.withinRange(item.linear.left, previous.linear.left)) {
                                linearX = false;
                                break;
                            }
                        }
                    }
                }
            }
            return {
                linearX,
                linearY,
                cleared,
                floated
            };
        }
        static partitionRows(list) {
            const parent = this.actualParent(list);
            const children = parent ? parent.actualChildren : list;
            const cleared = this.linearData(list, true).cleared;
            const groupParent = $util.filterArray(list, node => node.groupParent);
            const result = [];
            let row = [];
            for (let i = 0; i < children.length; i++) {
                const node = children[i];
                let next = false;
                for (let j = 0; j < groupParent.length; j++) {
                    const group = groupParent[j];
                    if (group.contains(node) || group === node) {
                        if (row.length) {
                            result.push(row);
                        }
                        result.push([group]);
                        row = [];
                        groupParent.splice(j, 1);
                        next = true;
                        break;
                    }
                }
                if (next) {
                    continue;
                }
                const previousSiblings = node.previousSiblings();
                if (i === 0 || previousSiblings.length === 0) {
                    if (list.includes(node)) {
                        row.push(node);
                    }
                }
                else {
                    if (node.alignedVertically(previousSiblings, row, cleared)) {
                        if (row.length) {
                            result.push(row);
                        }
                        if (list.includes(node)) {
                            row = [node];
                        }
                        else {
                            row = [];
                        }
                    }
                    else if (list.includes(node)) {
                        row.push(node);
                    }
                }
                if (i === children.length - 1 && row.length) {
                    result.push(row);
                }
            }
            return result;
        }
        static siblingIndex(a, b) {
            return a.siblingIndex < b.siblingIndex ? -1 : 1;
        }
        append(node, delegate = true) {
            super.append(node);
            if (delegate && this.afterAppend) {
                this.afterAppend.call(this, node);
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

    const $util$1 = squared.lib.util;
    class Layout extends squared.lib.base.Container {
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
            this.itemCount = 0;
            if (children) {
                this.init();
            }
        }
        init() {
            const linearData = NodeList.linearData(this.children);
            this._floated = linearData.floated;
            this._cleared = linearData.cleared;
            this._linearX = linearData.linearX;
            this._linearY = linearData.linearY;
            if (linearData.floated.size) {
                this.add(512 /* FLOAT */);
                if (this.some(node => node.blockStatic)) {
                    this.add(64 /* BLOCK */);
                }
            }
            if (this.every(item => item.rightAligned)) {
                this.add(1024 /* RIGHT */);
            }
            this.itemCount = this.children.length;
        }
        reset(parent, node) {
            this.containerType = 0;
            this.alignmentType = 0;
            this.rowCount = 0;
            this.columnCount = 0;
            this.renderType = 0;
            this.renderIndex = -1;
            this.itemCount = 0;
            this._floated = undefined;
            this._cleared = undefined;
            this._linearX = undefined;
            this._linearY = undefined;
            if (parent) {
                this.parent = parent;
            }
            if (node) {
                this.node = node;
            }
            this.clear();
        }
        setType(containerType, ...alignmentType) {
            this.containerType = containerType;
            for (const value of alignmentType) {
                this.add(value);
            }
        }
        hasAlign(value) {
            return $util$1.hasBit(this.alignmentType, value);
        }
        add(value) {
            if (!$util$1.hasBit(this.alignmentType, value)) {
                this.alignmentType |= value;
            }
            return this.alignmentType;
        }
        delete(value) {
            if ($util$1.hasBit(this.alignmentType, value)) {
                this.alignmentType ^= value;
            }
            return this.alignmentType;
        }
        retain(list) {
            super.retain(list);
            this.init();
            return this;
        }
        get floated() {
            return this._floated || new Set();
        }
        get cleared() {
            return this._cleared || new Map();
        }
        get linearX() {
            return this._linearX !== undefined ? this._linearX : true;
        }
        get linearY() {
            return this._linearY !== undefined ? this._linearY : false;
        }
        get singleRowAligned() {
            if (this._singleRow === undefined) {
                let previousBottom = Number.POSITIVE_INFINITY;
                for (const node of this.children) {
                    if (!node.inlineVertical && !node.plainText || node.multiline) {
                        return false;
                    }
                    else {
                        const offset = $util$1.convertFloat(node.verticalAlign);
                        if (node.linear.top - offset >= previousBottom) {
                            return false;
                        }
                        previousBottom = node.linear.bottom + offset;
                    }
                }
                this._singleRow = true;
            }
            return this._singleRow;
        }
        get visible() {
            return this.filter(node => node.visible);
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
        NODE_PROCEDURE[NODE_PROCEDURE["AUTOFIT"] = 16] = "AUTOFIT";
        NODE_PROCEDURE[NODE_PROCEDURE["OPTIMIZATION"] = 32] = "OPTIMIZATION";
        NODE_PROCEDURE[NODE_PROCEDURE["CUSTOMIZATION"] = 64] = "CUSTOMIZATION";
        NODE_PROCEDURE[NODE_PROCEDURE["ACCESSIBILITY"] = 128] = "ACCESSIBILITY";
        NODE_PROCEDURE[NODE_PROCEDURE["LOCALIZATION"] = 256] = "LOCALIZATION";
        NODE_PROCEDURE[NODE_PROCEDURE["NONPOSITIONAL"] = 208] = "NONPOSITIONAL";
        NODE_PROCEDURE[NODE_PROCEDURE["ALL"] = 510] = "ALL";
    })(NODE_PROCEDURE || (NODE_PROCEDURE = {}));

    var enumeration = /*#__PURE__*/Object.freeze({
        get APP_SECTION () { return APP_SECTION; },
        get NODE_RESOURCE () { return NODE_RESOURCE; },
        get NODE_PROCEDURE () { return NODE_PROCEDURE; }
    });

    const $css$1 = squared.lib.css;
    const $dom = squared.lib.dom;
    const $regex = squared.lib.regex;
    const $session = squared.lib.session;
    const $util$2 = squared.lib.util;
    const $xml = squared.lib.xml;
    const REGEXP_CACHED = {};
    let NodeConstructor;
    function prioritizeExtensions(element, extensions) {
        if (element.dataset.use) {
            const included = element.dataset.use.split($regex.XML.SEPARATOR);
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
                return $util$2.concatArray($util$2.spliceArray(result, item => item === undefined), untagged);
            }
        }
        return extensions;
    }
    function parseConditionText(rule, value) {
        const match = new RegExp(`^@${rule}([^{]+)`).exec(value);
        if (match) {
            value = match[1].trim();
        }
        return value;
    }
    class Application {
        constructor(framework, nodeConstructor, ControllerConstructor, ResourceConstructor, ExtensionManagerConstructor) {
            this.framework = framework;
            this.initialized = false;
            this.closed = false;
            this.builtInExtensions = {};
            this.extensions = [];
            this.rootElements = new Set();
            this.session = {
                cache: new NodeList(),
                documentRoot: [],
                targetQueue: new Map(),
                excluded: new NodeList(),
                active: [],
                extensionMap: new Map()
            };
            this.processing = {
                cache: new NodeList(),
                node: undefined,
                excluded: new NodeList(),
                sessionId: ''
            };
            this._layouts = [];
            NodeConstructor = nodeConstructor;
            this.controllerHandler = new ControllerConstructor(this, this.processing.cache);
            this.resourceHandler = new ResourceConstructor(this, this.processing.cache);
            this.extensionManager = new ExtensionManagerConstructor(this, this.processing.cache);
        }
        registerController(handler) {
            handler.application = this;
            handler.cache = this.processing.cache;
            this.controllerHandler = handler;
        }
        registerResource(handler) {
            handler.application = this;
            handler.cache = this.processing.cache;
            this.resourceHandler = handler;
        }
        finalize() {
            const controller = this.controllerHandler;
            for (const [node, template] of this.session.targetQueue.entries()) {
                if (node.dataset.target) {
                    const parent = this.resolveTarget(node.dataset.target);
                    if (parent) {
                        node.render(parent);
                        this.addLayoutTemplate(parent, node, template);
                    }
                    else if (node.renderParent === undefined) {
                        this.session.cache.remove(node);
                    }
                }
            }
            const rendered = this.rendered;
            for (const node of rendered) {
                if (node.hasProcedure(NODE_PROCEDURE.LAYOUT)) {
                    node.setLayout();
                }
                if (node.hasProcedure(NODE_PROCEDURE.ALIGNMENT)) {
                    node.setAlignment();
                }
            }
            controller.optimize(rendered);
            for (const ext of this.extensions) {
                for (const node of ext.subscribers) {
                    ext.postOptimize(node);
                }
            }
            for (const node of this.rendered) {
                if (node.hasResource(NODE_RESOURCE.BOX_SPACING)) {
                    node.setBoxSpacing();
                }
            }
            for (const ext of this.extensions) {
                for (const node of ext.subscribers) {
                    ext.postBoxSpacing(node);
                }
                ext.beforeCascade();
            }
            for (const layout of this.session.documentRoot) {
                const node = layout.node;
                const parent = node.renderParent;
                if (parent && parent.renderTemplates) {
                    this.saveDocument(layout.layoutName, controller.localSettings.layout.baseTemplate + controller.cascadeDocument(parent.renderTemplates, 0), node.dataset.pathname, !!node.renderExtension && node.renderExtension.some(item => item.documentBase) ? 0 : undefined);
                }
            }
            this.resourceHandler.finalize(this._layouts);
            controller.finalize(this._layouts);
            for (const ext of this.extensions) {
                ext.afterFinalize();
            }
            $dom.removeElementsByClassName('__squared.placeholder');
            $dom.removeElementsByClassName('__squared.pseudo');
            this.closed = true;
        }
        saveAllToDisk() {
            if (this.resourceHandler.fileHandler) {
                this.resourceHandler.fileHandler.saveAllToDisk(this.layouts);
            }
        }
        reset() {
            for (const id of this.session.active) {
                this.session.cache.each(node => {
                    if (node.element && node.naturalElement && !node.pseudoElement) {
                        $session.deleteElementCache(node.element, 'node', id);
                        $session.deleteElementCache(node.element, 'styleMap', id);
                    }
                });
            }
            for (const element of this.rootElements) {
                element.dataset.iteration = '';
            }
            this.session.documentRoot.length = 0;
            this.session.active.length = 0;
            this.session.targetQueue.clear();
            this.session.cache.reset();
            this.session.excluded.reset();
            this.session.extensionMap.clear();
            this.processing.cache.reset();
            this.controllerHandler.reset();
            this.resourceHandler.reset();
            this._layouts.length = 0;
            for (const ext of this.extensions) {
                ext.subscribers.clear();
            }
            this.closed = false;
        }
        parseDocument(...elements) {
            let __THEN;
            this.rootElements.clear();
            this.initialized = false;
            this.processing.sessionId = this.controllerHandler.generateSessionId;
            this.session.active.push(this.processing.sessionId);
            this.setStyleMap();
            if (elements.length === 0) {
                elements.push(document.body);
            }
            for (const value of elements) {
                const element = typeof value === 'string' ? document.getElementById(value) : value;
                if ($css$1.hasComputedStyle(element)) {
                    this.rootElements.add(element);
                }
            }
            const ASSET_IMAGES = this.resourceHandler.assets.images;
            const documentRoot = this.rootElements.values().next().value;
            const preloadImages = [];
            const parseResume = () => {
                this.initialized = false;
                for (const image of preloadImages) {
                    if (image.parentElement) {
                        documentRoot.removeChild(image);
                    }
                }
                preloadImages.length = 0;
                for (const ext of this.extensions) {
                    ext.beforeParseDocument();
                }
                for (const element of this.rootElements) {
                    const iteration = (element.dataset.iteration ? $util$2.convertInt(element.dataset.iteration) : -1) + 1;
                    element.dataset.iteration = iteration.toString();
                    if (this.createCache(element)) {
                        const filename = element.dataset.filename && element.dataset.filename.replace(new RegExp(`\.${this.controllerHandler.localSettings.layout.fileExtension}$`), '') || element.id || `document_${this.length}`;
                        element.dataset.layoutName = $util$2.convertWord(iteration > 1 ? `${filename}_${iteration}` : filename, true);
                        this.setBaseLayout(element.dataset.layoutName);
                        this.setConstraints();
                        this.setResources();
                    }
                }
                for (const ext of this.extensions) {
                    for (const node of ext.subscribers) {
                        ext.postParseDocument(node);
                    }
                    ext.afterParseDocument();
                }
                if (typeof __THEN === 'function') {
                    __THEN.call(this);
                }
            };
            const images = [];
            if (this.userSettings.preloadImages) {
                for (const element of this.rootElements) {
                    element.querySelectorAll('input[type=image]').forEach((image) => {
                        const uri = image.src;
                        if (uri !== '') {
                            ASSET_IMAGES.set(uri, {
                                width: image.width,
                                height: image.height,
                                uri
                            });
                        }
                    });
                    element.querySelectorAll('svg image').forEach((image) => {
                        const uri = $util$2.resolvePath(image.href.baseVal);
                        if (uri !== '') {
                            ASSET_IMAGES.set(uri, {
                                width: image.width.baseVal.value,
                                height: image.height.baseVal.value,
                                uri
                            });
                        }
                    });
                }
                for (const image of ASSET_IMAGES.values()) {
                    if (image.uri && image.width === 0 && image.height === 0) {
                        const element = document.createElement('img');
                        element.src = image.uri;
                        if (element.complete && element.naturalWidth > 0 && element.naturalHeight > 0) {
                            image.width = element.naturalWidth;
                            image.height = element.naturalHeight;
                        }
                        else {
                            documentRoot.appendChild(element);
                            preloadImages.push(element);
                        }
                    }
                }
                for (const element of this.rootElements) {
                    element.querySelectorAll('img').forEach((image) => {
                        if (image.tagName === 'IMG') {
                            if (image.complete) {
                                this.resourceHandler.addImage(image);
                            }
                            else {
                                images.push(image);
                            }
                        }
                    });
                }
            }
            if (images.length) {
                this.initialized = true;
                Promise.all($util$2.objectMap(images, image => {
                    return new Promise((resolve, reject) => {
                        image.onload = () => {
                            resolve(image);
                        };
                        image.onerror = () => {
                            reject(image);
                        };
                    });
                }))
                    .then((result) => {
                    for (const item of result) {
                        this.resourceHandler.addImage(item);
                    }
                    parseResume();
                })
                    .catch((error) => {
                    const message = error.target && error.target.src;
                    if (!message || confirm(`FAIL: ${message}`)) {
                        parseResume();
                    }
                });
            }
            else {
                parseResume();
            }
            return {
                then: (resolve) => {
                    if (this.initialized) {
                        __THEN = resolve;
                    }
                    else {
                        resolve();
                    }
                }
            };
        }
        saveDocument(filename, content, pathname, index) {
            if ($util$2.isString(content)) {
                if (pathname) {
                    pathname = $util$2.trimString(pathname, '/');
                }
                else {
                    pathname = this.controllerHandler.localSettings.layout.pathName;
                }
                const layout = {
                    pathname,
                    filename,
                    content,
                    index
                };
                if (index !== undefined && index >= 0 && index < this._layouts.length) {
                    this._layouts.splice(index, 0, layout);
                }
                else {
                    this._layouts.push(layout);
                }
            }
        }
        renderNode(layout) {
            if (layout.itemCount === 0) {
                return this.controllerHandler.renderNode(layout);
            }
            else {
                return this.controllerHandler.renderNodeGroup(layout);
            }
        }
        renderLayout(layout, outerParent) {
            if ($util$2.hasBit(layout.renderType, 512 /* FLOAT */)) {
                if ($util$2.hasBit(layout.renderType, 8 /* HORIZONTAL */)) {
                    layout = this.processFloatHorizontal(layout);
                }
                else if ($util$2.hasBit(layout.renderType, 16 /* VERTICAL */)) {
                    layout = this.processFloatVertical(layout, outerParent);
                }
            }
            return layout.containerType !== 0 ? this.renderNode(layout) : undefined;
        }
        addLayout(layout, outerParent) {
            let template;
            if (outerParent) {
                template = this.renderLayout(layout, outerParent);
            }
            else {
                template = this.renderNode(layout);
            }
            return this.addLayoutTemplate(layout.parent, layout.node, template, layout.renderIndex);
        }
        addLayoutTemplate(parent, node, template, index = -1) {
            if (template) {
                if (!node.renderExclude) {
                    if (node.renderParent === undefined) {
                        this.session.targetQueue.set(node, template);
                    }
                    else {
                        if (parent.renderTemplates === undefined) {
                            parent.renderTemplates = [];
                        }
                        if (index >= 0 && index < parent.renderChildren.length) {
                            parent.renderChildren.splice(index, 0, node);
                            parent.renderTemplates.splice(index, 0, template);
                        }
                        else {
                            parent.renderChildren.push(node);
                            parent.renderTemplates.push(template);
                        }
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
        createNode(element, append = true, parent, children) {
            const node = new NodeConstructor(this.nextId, this.processing.sessionId, element, this.controllerHandler.afterInsertNode);
            if (parent) {
                node.depth = parent.depth + 1;
            }
            if (children) {
                for (const item of children) {
                    item.parent = node;
                }
            }
            if (append) {
                this.processing.cache.append(node, children !== undefined);
            }
            return node;
        }
        resolveTarget(target) {
            for (const parent of this.processing.cache) {
                if (parent.elementId === target || parent.controlId === target) {
                    return parent;
                }
            }
            for (const parent of this.session.cache) {
                if (parent.elementId === target || parent.controlId === target) {
                    return parent;
                }
            }
            return undefined;
        }
        toString() {
            return this._layouts.length ? this._layouts[0].content : '';
        }
        createCache(documentRoot) {
            this.processing.node = undefined;
            this.processing.cache.afterAppend = undefined;
            this.processing.cache.clear();
            this.processing.excluded.clear();
            for (const ext of this.extensions) {
                ext.beforeInit(documentRoot);
            }
            const rootNode = this.cascadeParentNode(documentRoot);
            if (rootNode) {
                rootNode.parent = new NodeConstructor(0, this.processing.sessionId, documentRoot.parentElement || document.body, this.controllerHandler.afterInsertNode);
                rootNode.siblingIndex = 0;
                rootNode.documentRoot = true;
                rootNode.documentParent = rootNode.parent;
                this.processing.node = rootNode;
            }
            else {
                return false;
            }
            const preAlignment = {};
            const direction = new Set();
            function saveAlignment(element, id, attr, value, restoreValue) {
                if (preAlignment[id] === undefined) {
                    preAlignment[id] = {};
                }
                preAlignment[id][attr] = restoreValue;
                element.style[attr] = value;
            }
            let resetBounds = false;
            for (const node of this.processing.cache) {
                if (node.styleElement) {
                    const element = node.element;
                    if (node.length) {
                        const textAlign = node.cssInitial('textAlign');
                        switch (textAlign) {
                            case 'center':
                            case 'right':
                            case 'end':
                                saveAlignment(element, node.id, 'textAlign', 'left', textAlign);
                                break;
                        }
                    }
                    if (node.positionRelative) {
                        for (const attr of $css$1.BOX_POSITION) {
                            if (node.has(attr)) {
                                saveAlignment(element, node.id, attr, 'auto', node.css(attr));
                                resetBounds = true;
                            }
                        }
                    }
                    if (node.dir === 'rtl') {
                        element.dir = 'ltr';
                        direction.add(element);
                    }
                }
            }
            const pseudoElement = new Set();
            rootNode.parent.setBounds();
            for (const node of this.processing.cache) {
                if (!node.pseudoElement) {
                    node.setBounds(!resetBounds && preAlignment[node.id] === undefined && direction.size === 0);
                }
                else {
                    pseudoElement.add(node.parent);
                }
            }
            for (const node of pseudoElement) {
                [node.innerBefore, node.innerAfter].forEach((item, index) => {
                    if (item) {
                        const element = node.element;
                        const id = element.id;
                        let styleElement;
                        if (item.pageFlow) {
                            element.id = 'id_' + Math.round(Math.random() * new Date().getTime());
                            styleElement = $css$1.insertStyleSheetRule(`#${element.id}::${index === 0 ? 'before' : 'after'} { display: none !important; }`);
                        }
                        if (item.cssTry('display', item.display)) {
                            item.setBounds(false);
                            item.cssFinally('display');
                        }
                        if (styleElement) {
                            document.head.removeChild(styleElement);
                        }
                        element.id = id;
                    }
                });
            }
            for (const node of this.processing.excluded) {
                if (!node.lineBreak) {
                    node.setBounds();
                    node.saveAsInitial();
                }
            }
            const alteredParent = new Set();
            for (const node of this.processing.cache) {
                if (node.styleElement) {
                    const element = node.element;
                    const reset = preAlignment[node.id];
                    if (reset) {
                        for (const attr in reset) {
                            element.style[attr] = reset[attr];
                        }
                    }
                    if (direction.has(element)) {
                        element.dir = 'rtl';
                    }
                }
                if (!node.documentRoot) {
                    let parent;
                    const actualParent = node.parent;
                    switch (node.position) {
                        case 'fixed':
                            if (!node.positionAuto) {
                                parent = rootNode;
                                break;
                            }
                        case 'absolute':
                            const absoluteParent = node.absoluteParent;
                            if (absoluteParent) {
                                parent = absoluteParent;
                                if (node.positionAuto && node.withinX(parent.box) && node.withinY(parent.box) && !node.previousSiblings().some(item => item.multiline || item.excluded && !item.blockStatic) && (node.nextSiblings().every(item => item.blockStatic || item.lineBreak || item.excluded) || parent && node.element === parent.getLastChildElement())) {
                                    node.cssApply({ display: 'inline-block', verticalAlign: 'top' }, true);
                                    node.positionStatic = true;
                                    parent = actualParent;
                                }
                                else if (this.userSettings.supportNegativeLeftTop) {
                                    let outside = false;
                                    while (parent && parent !== rootNode) {
                                        if (!outside) {
                                            const overflowX = parent.css('overflowX') === 'hidden';
                                            const overflowY = parent.css('overflowY') === 'hidden';
                                            if (overflowX && overflowY || node.cssInitial('top') === '0px' || node.cssInitial('right') === '0px' || node.cssInitial('bottom') === '0px' || node.cssInitial('left') === '0px') {
                                                break;
                                            }
                                            else {
                                                const outsideX = !overflowX && node.outsideX(parent.box);
                                                const outsideY = !overflowY && node.outsideY(parent.box);
                                                if (outsideY && (node.top < 0 || node.marginTop < 0 || !node.has('top') && node.bottom !== 0 || !parent.pageFlow && node.top > 0)) {
                                                    outside = true;
                                                }
                                                else if (outsideX && (!node.has('left') && node.right > 0 || !parent.pageFlow && node.left > 0)) {
                                                    outside = true;
                                                }
                                                else if (!overflowX && node.outsideX(parent.linear) && !node.pseudoElement && (node.left < 0 || node.marginLeft < 0 || !node.has('left') && node.right < 0 && node.linear.left >= parent.linear.right)) {
                                                    outside = true;
                                                }
                                                else if (!overflowX && !overflowY && !node.intersectX(parent.box) && !node.intersectY(parent.box)) {
                                                    outside = true;
                                                }
                                                else {
                                                    break;
                                                }
                                            }
                                        }
                                        else {
                                            if (parent.layoutElement) {
                                                parent = node.absoluteParent;
                                                break;
                                            }
                                            else if (node.withinX(parent.box) && node.withinY(parent.box)) {
                                                break;
                                            }
                                        }
                                        parent = parent.actualParent;
                                    }
                                }
                            }
                            break;
                    }
                    if (parent === undefined) {
                        parent = !node.pageFlow ? rootNode : actualParent;
                    }
                    if (parent !== actualParent) {
                        const absoluteParent = node.absoluteParent;
                        if (absoluteParent && parent !== absoluteParent && absoluteParent.positionRelative) {
                            const bounds = node.bounds;
                            if (absoluteParent.left !== 0) {
                                bounds.left += absoluteParent.left;
                                bounds.right += absoluteParent.left;
                            }
                            else if (!absoluteParent.has('left') && absoluteParent.right !== 0) {
                                bounds.left -= absoluteParent.right;
                                bounds.right -= absoluteParent.right;
                            }
                            if (absoluteParent.top !== 0) {
                                bounds.top += absoluteParent.top;
                                bounds.bottom += absoluteParent.top;
                            }
                            else if (!absoluteParent.has('top') && absoluteParent.bottom !== 0) {
                                bounds.top -= absoluteParent.bottom;
                                bounds.bottom -= absoluteParent.bottom;
                            }
                            node.unsafe('box', true);
                            node.unsafe('linear', true);
                        }
                        let current = actualParent;
                        let opacity = $util$2.convertFloat(node.css('opacity')) || 1;
                        while (current && current !== parent) {
                            opacity *= $util$2.convertFloat(current.css('opacity')) || 1;
                            current = current.actualParent;
                        }
                        node.css('opacity', opacity.toString());
                        node.parent = parent;
                        node.siblingIndex = Number.POSITIVE_INFINITY;
                        alteredParent.add(parent);
                    }
                    node.documentParent = parent;
                }
            }
            for (const node of this.processing.cache) {
                if (alteredParent.has(node)) {
                    const layers = [];
                    node.each((item) => {
                        if (item.siblingIndex === Number.POSITIVE_INFINITY) {
                            for (const adjacent of node.children) {
                                let valid = adjacent.actualChildren.includes(item);
                                if (!valid) {
                                    const nested = adjacent.cascade();
                                    valid = item.ascend(false, child => nested.includes(child)).length > 0;
                                }
                                if (valid) {
                                    const index = adjacent.siblingIndex + (item.zIndex >= 0 || adjacent !== item.actualParent ? 1 : 0);
                                    if (layers[index] === undefined) {
                                        layers[index] = [];
                                    }
                                    layers[index].push(item);
                                    break;
                                }
                            }
                        }
                    });
                    if (layers.length) {
                        const children = node.children;
                        for (let j = 0, k = 0; j < layers.length; j++, k++) {
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
                                for (let l = 0; l < children.length; l++) {
                                    if (order.includes(children[l])) {
                                        children[l] = undefined;
                                    }
                                }
                                children.splice(k, 0, ...order);
                                k += order.length;
                            }
                        }
                        node.retain($util$2.flatArray(children));
                    }
                }
                node.saveAsInitial();
            }
            this.processing.cache.sort((a, b) => {
                if (a.depth !== b.depth) {
                    return a.depth < b.depth ? -1 : 1;
                }
                else if (a.documentParent !== b.documentParent) {
                    return a.documentParent.siblingIndex < b.documentParent.siblingIndex ? -1 : 1;
                }
                return a.siblingIndex < b.siblingIndex ? -1 : 1;
            });
            for (const ext of this.extensions) {
                ext.afterInit(documentRoot);
            }
            return true;
        }
        cascadeParentNode(element, depth = 0) {
            const node = this.insertNode(element);
            if (node) {
                node.depth = depth;
                if (depth === 0) {
                    this.processing.cache.append(node);
                }
                switch (node.tagName) {
                    case 'SELECT':
                    case 'SVG':
                        return node;
                }
                const beforeElement = this.createPseduoElement(element, 'before');
                const afterElement = this.createPseduoElement(element, 'after');
                const children = [];
                let includeText = false;
                for (let i = 0; i < element.childNodes.length; i++) {
                    const childElement = element.childNodes[i];
                    if (childElement === beforeElement) {
                        const child = this.insertNode(beforeElement);
                        if (child) {
                            node.innerBefore = child;
                            child.setInlineText(true);
                            children.push(child);
                            includeText = true;
                        }
                    }
                    else if (childElement === afterElement) {
                        const child = this.insertNode(afterElement);
                        if (child) {
                            node.innerAfter = child;
                            child.setInlineText(true);
                            children.push(child);
                            includeText = true;
                        }
                    }
                    else if (childElement.nodeName.charAt(0) === '#') {
                        if (childElement.nodeName === '#text') {
                            const child = this.insertNode(childElement, node);
                            if (child) {
                                children.push(child);
                            }
                        }
                    }
                    else if (this.controllerHandler.includeElement(childElement)) {
                        prioritizeExtensions(childElement, this.extensions).some(item => item.init(childElement));
                        if (!this.rootElements.has(childElement)) {
                            const child = this.cascadeParentNode(childElement, depth + 1);
                            if (child) {
                                children.push(child);
                                if (!child.excluded) {
                                    includeText = true;
                                }
                            }
                        }
                        else {
                            includeText = true;
                        }
                    }
                }
                for (let i = 0; i < children.length; i++) {
                    const child = children[i];
                    if (child.lineBreak) {
                        if (i > 0) {
                            children[i - 1].lineBreakTrailing = true;
                        }
                        if (i < children.length - 1) {
                            children[i + 1].lineBreakLeading = true;
                        }
                    }
                    if (child.excluded) {
                        this.processing.excluded.append(child);
                    }
                    else if (includeText || !child.plainText) {
                        child.parent = node;
                        this.processing.cache.append(child);
                    }
                    child.siblingIndex = i;
                }
                node.setInlineText(!includeText);
                node.actualChildren = children;
            }
            return node;
        }
        setBaseLayout(layoutName) {
            const controller = this.controllerHandler;
            const documentRoot = this.processing.node;
            const extensions = $util$2.filterArray(this.extensions, item => !item.eventOnly);
            const mapY = new Map();
            function setMapY(depth, id, node) {
                const index = mapY.get(depth) || new Map();
                mapY.set(depth, index.set(id, node));
            }
            function deleteMapY(id) {
                for (const mapNode of mapY.values()) {
                    for (const node of mapNode.values()) {
                        if (node.id === id) {
                            mapNode.delete(node.id);
                            return;
                        }
                    }
                }
            }
            setMapY(-1, 0, documentRoot.parent);
            let maxDepth = 0;
            for (const node of this.processing.cache) {
                if (node.visible) {
                    setMapY(node.depth, node.id, node);
                    maxDepth = Math.max(node.depth, maxDepth);
                }
            }
            for (let i = 0; i < maxDepth; i++) {
                mapY.set((i * -1) - 2, new Map());
            }
            this.processing.cache.afterAppend = (node) => {
                deleteMapY(node.id);
                setMapY((node.depth * -1) - 2, node.id, node);
                for (const item of node.cascade()) {
                    deleteMapY(item.id);
                    setMapY((item.depth * -1) - 2, item.id, item);
                }
            };
            for (const depth of mapY.values()) {
                for (const parent of depth.values()) {
                    if (parent.length === 0) {
                        continue;
                    }
                    const axisY = parent.duplicate();
                    const hasFloat = axisY.some(node => node.floating);
                    let cleared;
                    if (hasFloat) {
                        cleared = NodeList.linearData(parent.actualChildren, true).cleared;
                    }
                    let k = -1;
                    while (++k < axisY.length) {
                        let nodeY = axisY[k];
                        if (!nodeY.visible || nodeY.rendered || nodeY.htmlElement && this.rootElements.has(nodeY.element) && !nodeY.documentRoot && !nodeY.documentBody) {
                            continue;
                        }
                        let parentY = nodeY.parent;
                        const extendable = nodeY.hasAlign(4096 /* EXTENDABLE */);
                        if (axisY.length > 1 && k < axisY.length - 1 && nodeY.pageFlow && (parentY.alignmentType === 0 || parentY.hasAlign(2 /* UNKNOWN */) || extendable) && !parentY.hasAlign(4 /* AUTO_LAYOUT */) && nodeY.hasSection(APP_SECTION.DOM_TRAVERSE)) {
                            const horizontal = [];
                            const vertical = [];
                            let verticalExtended = false;
                            function checkHorizontal(node) {
                                if (vertical.length || verticalExtended) {
                                    return false;
                                }
                                horizontal.push(node);
                                return true;
                            }
                            function checkVertical(node) {
                                if (parentY.layoutVertical && vertical.length) {
                                    const previousAbove = vertical[vertical.length - 1];
                                    if (previousAbove.layoutVertical) {
                                        node.parent = previousAbove;
                                        return;
                                    }
                                }
                                vertical.push(node);
                            }
                            let l = k;
                            let m = 0;
                            if (extendable && parentY.layoutVertical) {
                                horizontal.push(nodeY);
                                l++;
                                m++;
                            }
                            traverse: {
                                const floated = new Set();
                                const floatActive = new Set();
                                for (; l < axisY.length; l++, m++) {
                                    const item = axisY[l];
                                    if (item.pageFlow) {
                                        if (hasFloat) {
                                            const float = cleared.get(item);
                                            if (float) {
                                                if (float === 'both') {
                                                    floatActive.clear();
                                                }
                                                else {
                                                    floatActive.delete(float);
                                                }
                                            }
                                            if (item.floating) {
                                                floated.add(item.float);
                                                floatActive.add(item.float);
                                            }
                                        }
                                        if (m === 0) {
                                            const next = item.nextSiblings().shift();
                                            if (next) {
                                                if (!item.horizontalAligned || next.alignedVertically([item], [item])) {
                                                    vertical.push(item);
                                                }
                                                else {
                                                    horizontal.push(item);
                                                }
                                                continue;
                                            }
                                        }
                                        const previousSiblings = item.previousSiblings();
                                        const previous = previousSiblings[previousSiblings.length - 1];
                                        if (previous) {
                                            if (hasFloat) {
                                                const traverse = item.alignedVertically(previousSiblings, horizontal.length ? horizontal : vertical, cleared, horizontal.length > 0);
                                                if (traverse > 0) {
                                                    if (horizontal.length && traverse !== 7 /* FLOAT_INTERSECT */) {
                                                        if (floatActive.size && !previous.autoMargin.horizontal && cleared.get(item) !== 'both' && !previousSiblings.some(node => node.lineBreak && !cleared.has(node))) {
                                                            function getFloatBottom() {
                                                                let floatBottom = Number.NEGATIVE_INFINITY;
                                                                $util$2.captureMap(horizontal, node => node.floating, node => floatBottom = Math.max(floatBottom, node.linear.bottom));
                                                                return floatBottom;
                                                            }
                                                            if (!item.floating || item.linear.top < getFloatBottom()) {
                                                                if (cleared.has(item)) {
                                                                    if (!item.floating && floatActive.size > 0) {
                                                                        item.alignmentType |= 4096 /* EXTENDABLE */;
                                                                        horizontal.push(item);
                                                                        verticalExtended = true;
                                                                        continue;
                                                                    }
                                                                    break traverse;
                                                                }
                                                                else {
                                                                    const floatBottom = getFloatBottom();
                                                                    if (floated.size === 1 && (!item.floating && item.linear.top < floatBottom || floatActive.has(item.float))) {
                                                                        horizontal.push(item);
                                                                        if (!item.floating && item.linear.bottom >= Math.floor(floatBottom)) {
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
                                                    checkVertical(item);
                                                }
                                                else if (!checkHorizontal(item)) {
                                                    break traverse;
                                                }
                                            }
                                            else {
                                                if (item.alignedVertically(previousSiblings)) {
                                                    checkVertical(item);
                                                }
                                                else if (!checkHorizontal(item)) {
                                                    break traverse;
                                                }
                                            }
                                        }
                                        else {
                                            break traverse;
                                        }
                                    }
                                }
                            }
                            let result;
                            let segEnd;
                            if (horizontal.length > 1) {
                                result = controller.processTraverseHorizontal(new Layout(parentY, nodeY, 0, 0, horizontal), axisY);
                                segEnd = horizontal[horizontal.length - 1];
                            }
                            else if (vertical.length > 1) {
                                result = controller.processTraverseVertical(new Layout(parentY, nodeY, 0, 0, vertical), axisY);
                                segEnd = vertical[vertical.length - 1];
                                if (segEnd.horizontalAligned && segEnd !== axisY[axisY.length - 1]) {
                                    segEnd.alignmentType |= 4096 /* EXTENDABLE */;
                                }
                            }
                            if (parentY.hasAlign(2 /* UNKNOWN */) && segEnd === axisY[axisY.length - 1]) {
                                parentY.alignmentType ^= 2 /* UNKNOWN */;
                            }
                            if (result && this.addLayout(result.layout, parentY)) {
                                parentY = nodeY.parent;
                            }
                        }
                        if (nodeY.hasAlign(4096 /* EXTENDABLE */)) {
                            nodeY.alignmentType ^= 4096 /* EXTENDABLE */;
                        }
                        if (k === axisY.length - 1 && parentY.hasAlign(2 /* UNKNOWN */)) {
                            parentY.alignmentType ^= 2 /* UNKNOWN */;
                        }
                        if (nodeY.renderAs && parentY.appendTry(nodeY, nodeY.renderAs, false)) {
                            nodeY.hide();
                            nodeY = nodeY.renderAs;
                            if (nodeY.positioned) {
                                parentY = nodeY.parent;
                            }
                        }
                        if (!nodeY.rendered && nodeY.hasSection(APP_SECTION.EXTENSION)) {
                            const descendant = this.session.extensionMap.get(nodeY.id);
                            let combined = parent.renderExtension && parent.renderExtension.slice(0);
                            if (descendant) {
                                if (combined) {
                                    $util$2.concatArray(combined, descendant);
                                }
                                else {
                                    combined = descendant.slice(0);
                                }
                            }
                            if (combined) {
                                let next = false;
                                for (const ext of combined) {
                                    const result = ext.processChild(nodeY, parentY);
                                    if (result) {
                                        if (result.output) {
                                            this.addLayoutTemplate(result.parentAs || parentY, nodeY, result.output);
                                        }
                                        if (result.renderAs && result.outputAs) {
                                            this.addLayoutTemplate(parentY, result.renderAs, result.outputAs);
                                        }
                                        if (result.parent) {
                                            parentY = result.parent;
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
                                let next = false;
                                prioritizeExtensions(nodeY.element, extensions).some(item => {
                                    if (item.is(nodeY) && item.condition(nodeY, parentY) && (descendant === undefined || !descendant.includes(item))) {
                                        const result = item.processNode(nodeY, parentY);
                                        if (result) {
                                            if (result.output) {
                                                this.addLayoutTemplate(result.parentAs || parentY, nodeY, result.output);
                                            }
                                            if (result.renderAs && result.outputAs) {
                                                this.addLayoutTemplate(parentY, result.renderAs, result.outputAs);
                                            }
                                            if (result.parent) {
                                                parentY = result.parent;
                                            }
                                            if (result.output || result.include === true) {
                                                if (nodeY.renderExtension === undefined) {
                                                    nodeY.renderExtension = [];
                                                }
                                                nodeY.renderExtension.push(item);
                                                item.subscribers.add(nodeY);
                                            }
                                            next = result.next === true;
                                            if (result.complete || next) {
                                                return true;
                                            }
                                        }
                                    }
                                    return false;
                                });
                                if (next) {
                                    continue;
                                }
                            }
                        }
                        if (!nodeY.rendered && nodeY.hasSection(APP_SECTION.RENDER)) {
                            const layout = this.createLayoutControl(parentY, nodeY);
                            const result = nodeY.length ? controller.processUnknownParent(layout) : controller.processUnknownChild(layout);
                            if (result.next === true) {
                                continue;
                            }
                            else if (result.renderAs) {
                                axisY[k] = result.renderAs;
                                k--;
                                continue;
                            }
                            this.addLayout(result.layout, parentY);
                        }
                    }
                }
            }
            this.processing.cache.sort((a, b) => {
                if (a.depth === b.depth && a.length > 0 && b.length === 0) {
                    return -1;
                }
                return 0;
            });
            this.session.cache.concat(this.processing.cache.children);
            this.session.excluded.concat(this.processing.excluded.children);
            for (const node of this.processing.cache) {
                if (node.documentRoot && node.rendered) {
                    this.session.documentRoot.push({ node, layoutName: node === documentRoot ? layoutName : '' });
                }
            }
            for (const ext of this.extensions) {
                for (const node of ext.subscribers) {
                    ext.postBaseLayout(node);
                }
                ext.afterBaseLayout();
            }
        }
        setConstraints() {
            this.controllerHandler.setConstraints();
            for (const ext of this.extensions) {
                for (const node of ext.subscribers) {
                    ext.postConstraints(node);
                }
                ext.afterConstraints();
            }
        }
        setResources() {
            for (const node of this.processing.cache) {
                this.resourceHandler.setBoxStyle(node);
                this.resourceHandler.setFontStyle(node);
                this.resourceHandler.setValueString(node);
            }
            for (const ext of this.extensions) {
                ext.afterResources();
            }
        }
        processFloatHorizontal(layout) {
            const controller = this.controllerHandler;
            const itemCount = layout.itemCount;
            if (layout.cleared.size === 0 && !layout.some(node => node.autoMargin.horizontal || node.multiline)) {
                const inline = [];
                const left = [];
                const right = [];
                for (const node of layout) {
                    switch (node.float) {
                        case 'left':
                            left.push(node);
                            break;
                        case 'right':
                            right.push(node);
                            break;
                        default:
                            inline.push(node);
                            break;
                    }
                }
                if (inline.length === itemCount || left.length === itemCount || right.length === itemCount || (left.length === 0 || right.length === 0) && !inline.some(item => item.blockStatic)) {
                    controller.processLayoutHorizontal(layout);
                    return layout;
                }
            }
            const layerIndex = [];
            const inlineAbove = [];
            const inlineBelow = [];
            const leftAbove = [];
            const rightAbove = [];
            const leftBelow = [];
            const rightBelow = [];
            let leftSub = [];
            let rightSub = [];
            let current = '';
            let pendingFloat = 0;
            for (const node of layout) {
                const cleared = layout.cleared.get(node);
                if (cleared && ($util$2.hasBit(pendingFloat, cleared === 'right' ? 4 : 2) || pendingFloat !== 0 && cleared === 'both')) {
                    switch (cleared) {
                        case 'left':
                            if ($util$2.hasBit(pendingFloat, 2)) {
                                pendingFloat ^= 2;
                            }
                            current = 'left';
                            break;
                        case 'right':
                            if ($util$2.hasBit(pendingFloat, 4)) {
                                pendingFloat ^= 4;
                            }
                            current = 'right';
                            break;
                        case 'both':
                            switch (pendingFloat) {
                                case 2:
                                    current = 'left';
                                    break;
                                case 4:
                                    current = 'right';
                                    break;
                                default:
                                    current = 'both';
                                    break;
                            }
                            pendingFloat = 0;
                            break;
                    }
                }
                if (node.autoMargin.horizontal) {
                    if (node.autoMargin.leftRight) {
                        if (rightBelow.length) {
                            rightAbove.push(node);
                        }
                        else {
                            leftAbove.push(node);
                        }
                    }
                    else if (node.autoMargin.left) {
                        rightAbove.push(node);
                    }
                    else {
                        leftAbove.push(node);
                    }
                }
                else if (current === '') {
                    if (node.float === 'right') {
                        rightAbove.push(node);
                        if (!$util$2.hasBit(pendingFloat, 4)) {
                            pendingFloat |= 4;
                        }
                    }
                    else if (node.float === 'left') {
                        leftAbove.push(node);
                        if (!$util$2.hasBit(pendingFloat, 2)) {
                            pendingFloat |= 2;
                        }
                    }
                    else if (leftBelow.length || rightBelow.length) {
                        inlineBelow.push(node);
                    }
                    else if (leftAbove.length || rightAbove.length) {
                        let top = node.linear.top;
                        if (node.textElement && !node.plainText) {
                            const rect = $session.getRangeClientRect(node.element, node.sessionId);
                            if (rect.top > top) {
                                top = rect.top;
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
                else if (node.float === 'right') {
                    if (rightBelow.length === 0 && !$util$2.hasBit(pendingFloat, 4)) {
                        pendingFloat |= 4;
                    }
                    if (current !== 'right' && rightAbove.length) {
                        rightAbove.push(node);
                    }
                    else {
                        rightBelow.push(node);
                    }
                }
                else if (node.float === 'left') {
                    if (leftBelow.length === 0 && !$util$2.hasBit(pendingFloat, 2)) {
                        pendingFloat |= 2;
                    }
                    if (current !== 'left' && leftAbove.length) {
                        leftAbove.push(node);
                    }
                    else {
                        leftBelow.push(node);
                    }
                }
                else {
                    switch (current) {
                        case 'left':
                            leftBelow.push(node);
                            break;
                        case 'right':
                            rightBelow.push(node);
                            break;
                        default:
                            inlineBelow.push(node);
                            break;
                    }
                }
            }
            if (leftAbove.length && leftBelow.length) {
                leftSub = [leftAbove, leftBelow];
            }
            else if (leftAbove.length) {
                leftSub = leftAbove;
            }
            else if (leftBelow.length) {
                leftSub = leftBelow;
            }
            if (rightAbove.length && rightBelow.length) {
                rightSub = [rightAbove, rightBelow];
            }
            else if (rightAbove.length) {
                rightSub = rightAbove;
            }
            else if (rightBelow.length) {
                rightSub = rightBelow;
            }
            const vertical = controller.containerTypeVertical;
            const alignmentType = rightAbove.length + rightBelow.length === layout.length ? 1024 /* RIGHT */ : 0;
            if (inlineBelow.length) {
                if (inlineBelow.length > 1) {
                    inlineBelow[0].alignmentType |= 4096 /* EXTENDABLE */;
                }
                inlineBelow.unshift(layout.node);
                const parent = this.createNode($dom.createElement(layout.node.actualParent && layout.node.actualParent.element), true, layout.parent, inlineBelow);
                this.addLayout(new Layout(layout.parent, parent, vertical.containerType, vertical.alignmentType | (layout.parent.blockStatic ? 64 /* BLOCK */ : 0), inlineBelow));
                layout.reset(parent);
            }
            layout.add(alignmentType);
            let outerVertical = controller.containerTypeVerticalMargin;
            if (inlineAbove.length) {
                if (rightBelow.length) {
                    leftSub = [inlineAbove, leftAbove];
                    layerIndex.push(leftSub, rightSub);
                }
                else if (leftBelow.length) {
                    rightSub = [inlineAbove, rightAbove];
                    layerIndex.push(rightSub, leftSub);
                }
                else {
                    layerIndex.push(inlineAbove, leftSub, rightSub);
                }
            }
            else {
                if (leftSub === leftBelow && rightSub === rightAbove || leftSub === leftAbove && rightSub === rightBelow) {
                    if (leftBelow.length === 0) {
                        layerIndex.push([leftAbove, rightBelow]);
                    }
                    else {
                        layerIndex.push([rightAbove, leftBelow]);
                    }
                }
                else {
                    layerIndex.push(leftSub, rightSub);
                }
                if (leftSub.length === 0 || rightSub.length === 0) {
                    outerVertical = vertical;
                }
            }
            $util$2.spliceArray(layerIndex, item => item.length === 0);
            layout.itemCount = layerIndex.length;
            layout.setType(outerVertical.containerType, outerVertical.alignmentType);
            if (layout.hasAlign(1024 /* RIGHT */)) {
                layout.add(64 /* BLOCK */);
            }
            let floatgroup;
            for (let i = 0; i < layerIndex.length; i++) {
                const item = layerIndex[i];
                let segments;
                if (Array.isArray(item[0])) {
                    segments = item;
                    const grouping = [];
                    for (const seg of segments) {
                        $util$2.concatArray(grouping, seg);
                    }
                    grouping.sort(NodeList.siblingIndex);
                    if (layout.node.layoutVertical) {
                        floatgroup = layout.node;
                    }
                    else {
                        floatgroup = controller.createNodeGroup(grouping[0], grouping, layout.node);
                        const group = new Layout(layout.node, floatgroup, vertical.containerType, vertical.alignmentType | (segments.some(seg => seg === rightSub || seg === rightAbove) ? 1024 /* RIGHT */ : 0));
                        group.itemCount = segments.length;
                        this.addLayout(group);
                    }
                }
                else {
                    segments = [item];
                    floatgroup = undefined;
                }
                for (const seg of segments) {
                    const basegroup = floatgroup && (seg === inlineAbove || seg === leftAbove || seg === leftBelow || seg === rightAbove || seg === rightBelow) ? floatgroup : layout.node;
                    const target = controller.createNodeGroup(seg[0], seg, basegroup);
                    const group = new Layout(basegroup, target, 0, seg.length < itemCount ? 128 /* SEGMENTED */ : 0, seg);
                    if (seg.some(child => child.blockStatic || child.multiline && basegroup.blockStatic || child.has('width', 32 /* PERCENT */))) {
                        group.add(64 /* BLOCK */);
                    }
                    if (seg.length === 1) {
                        target.innerWrapped = seg[0];
                        seg[0].outerWrapper = target;
                        if (seg[0].has('width', 32 /* PERCENT */)) {
                            const percent = this.controllerHandler.containerTypePercent;
                            group.setType(percent.containerType, percent.alignmentType);
                        }
                        else {
                            group.setType(vertical.containerType, vertical.alignmentType);
                        }
                    }
                    else if (group.linearY) {
                        group.setType(vertical.containerType, vertical.alignmentType);
                    }
                    else {
                        controller.processLayoutHorizontal(group);
                    }
                    this.addLayout(group);
                    if (seg === inlineAbove) {
                        if (leftAbove.length) {
                            let position = Number.NEGATIVE_INFINITY;
                            let hasSpacing = false;
                            for (const child of leftAbove) {
                                const right = child.linear.right + (child.marginLeft < 0 ? child.marginLeft : 0);
                                if (right > position) {
                                    position = right;
                                    hasSpacing = child.marginRight > 0;
                                }
                            }
                            const offset = position - basegroup.box.left;
                            if (offset > 0) {
                                target.modifyBox(256 /* PADDING_LEFT */, offset + (!hasSpacing && target.cascadeSome(child => child.multiline) ? this.controllerHandler.localSettings.deviations.textMarginBoundarySize : 0));
                            }
                        }
                        if (rightAbove.length) {
                            let position = Number.POSITIVE_INFINITY;
                            let hasSpacing = false;
                            for (const child of rightAbove) {
                                const left = child.linear.left + (child.marginRight < 0 ? child.marginRight : 0);
                                if (left < position) {
                                    position = left;
                                    hasSpacing = child.marginLeft > 0;
                                }
                            }
                            const offset = basegroup.box.right - position;
                            if (offset > 0) {
                                target.modifyBox(64 /* PADDING_RIGHT */, offset + (!hasSpacing && target.cascadeSome(child => child.multiline) ? this.controllerHandler.localSettings.deviations.textMarginBoundarySize : 0));
                            }
                        }
                    }
                }
            }
            return layout;
        }
        processFloatVertical(layout, outerParent) {
            const controller = this.controllerHandler;
            const vertical = controller.containerTypeVertical;
            if (layout.containerType !== 0) {
                const parent = controller.createNodeGroup(layout.node, [layout.node], outerParent);
                this.addLayout(new Layout(parent, layout.node, vertical.containerType, vertical.alignmentType, parent.children));
                layout.node = parent;
            }
            else {
                layout.containerType = vertical.containerType;
                layout.add(vertical.alignmentType);
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
                    if (layout.cleared.has(node)) {
                        if (!node.floating) {
                            node.modifyBox(2 /* MARGIN_TOP */, null);
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
                        if (clearReset && !layout.cleared.has(node)) {
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
                for (let i = 0; i < Math.max(floatedRows.length, staticRows.length); i++) {
                    const pageFlow = staticRows[i] || [];
                    if (floatedRows[i] === null && pageFlow.length) {
                        const layoutType = controller.containerTypeVertical;
                        layoutType.alignmentType |= 128 /* SEGMENTED */ | 64 /* BLOCK */;
                        this.addLayout(new Layout(layout.node, controller.createNodeGroup(pageFlow[0], pageFlow, layout.node), layoutType.containerType, layoutType.alignmentType, pageFlow));
                    }
                    else {
                        const floating = floatedRows[i] || [];
                        if (pageFlow.length || floating.length) {
                            const basegroup = controller.createNodeGroup(floating[0] || pageFlow[0], [], layout.node);
                            const verticalMargin = controller.containerTypeVerticalMargin;
                            const layoutGroup = new Layout(layout.node, basegroup, verticalMargin.containerType, verticalMargin.alignmentType);
                            const children = [];
                            let subgroup;
                            if (floating.length > 1) {
                                subgroup = controller.createNodeGroup(floating[0], floating, basegroup);
                                layoutGroup.add(512 /* FLOAT */);
                                if (pageFlow.length === 0 && floating.every(item => item.float === 'right')) {
                                    layoutGroup.add(1024 /* RIGHT */);
                                }
                            }
                            else if (floating.length) {
                                subgroup = floating[0];
                                subgroup.parent = basegroup;
                            }
                            if (subgroup) {
                                children.push(subgroup);
                                subgroup = undefined;
                            }
                            if (pageFlow.length > 1) {
                                subgroup = controller.createNodeGroup(pageFlow[0], pageFlow, basegroup);
                            }
                            else if (pageFlow.length) {
                                subgroup = pageFlow[0];
                                subgroup.parent = basegroup;
                            }
                            if (subgroup) {
                                children.push(subgroup);
                            }
                            basegroup.init();
                            layoutGroup.itemCount = children.length;
                            this.addLayout(layoutGroup);
                            for (let node of children) {
                                if (!node.groupParent) {
                                    node = controller.createNodeGroup(node, [node], basegroup);
                                }
                                this.addLayout(new Layout(basegroup, node, vertical.containerType, vertical.alignmentType | 128 /* SEGMENTED */ | 64 /* BLOCK */, node.children));
                            }
                        }
                    }
                }
            }
            return layout;
        }
        insertNode(element, parent) {
            if (element.nodeName === '#text') {
                if ($xml.isPlainText(element.textContent) || $css$1.isParentStyle(element, 'whiteSpace', 'pre', 'pre-wrap')) {
                    this.controllerHandler.applyDefaultStyles(element);
                    const node = this.createNode(element, false);
                    if (parent) {
                        node.inherit(parent, 'textStyle');
                        if (!node.pageFlow) {
                            node.css('backgroundColor', parent.css('backgroundColor'));
                        }
                    }
                    return node;
                }
            }
            else if (this.conditionElement(element)) {
                this.controllerHandler.applyDefaultStyles(element);
                const node = this.createNode(element, false);
                if (!this.userSettings.exclusionsDisabled) {
                    node.setExclusions();
                }
                return node;
            }
            else {
                const node = this.createNode(element, false);
                node.visible = false;
                node.excluded = true;
                return node;
            }
            return undefined;
        }
        conditionElement(element) {
            if (!this.controllerHandler.localSettings.unsupported.excluded.has(element.tagName)) {
                if (this.controllerHandler.visibleElement(element) || element.dataset.use && element.dataset.use.split($regex.XML.SEPARATOR).some(value => !!this.extensionManager.retrieve(value.trim()))) {
                    return true;
                }
                else {
                    let current = element.parentElement;
                    let valid = true;
                    while (current) {
                        if ($css$1.getStyle(current).display === 'none') {
                            valid = false;
                            break;
                        }
                        current = current.parentElement;
                    }
                    if (valid) {
                        for (let i = 0; i < element.children.length; i++) {
                            if (this.controllerHandler.visibleElement(element.children[i])) {
                                return true;
                            }
                        }
                    }
                    return false;
                }
            }
            return false;
        }
        createPseduoElement(element, target) {
            const styleMap = $session.getElementCache(element, `styleMap::${target}`, this.processing.sessionId);
            if (styleMap && styleMap.content) {
                if ((styleMap.position === 'absolute' || styleMap.position === 'fixed') && $util$2.trimString(styleMap.content, '"').trim() === '' && (!styleMap.width || !$css$1.isLength(styleMap.width, true))) {
                    return undefined;
                }
                let value = styleMap.content;
                if (value === 'inherit') {
                    let current = element.parentElement;
                    while (current) {
                        value = $css$1.getStyle(current, target).getPropertyValue('content');
                        if (value !== 'inherit') {
                            break;
                        }
                        current = current.parentElement;
                    }
                }
                const style = $css$1.getStyle(element);
                if (styleMap.fontFamily === undefined) {
                    styleMap.fontFamily = style.getPropertyValue('font-family');
                }
                if (styleMap.fontSize) {
                    styleMap.fontSize = $css$1.convertPX(styleMap.fontSize, $css$1.getFontSize(document.body));
                }
                else {
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
                let tagName = styleMap.display.startsWith('inline') ? 'span' : 'div';
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
                        content = target === 'before' ? '&quot;' : '';
                        tagName = 'span';
                        break;
                    case 'close-quote':
                        content = target === 'after' ? '&quot;' : '';
                        tagName = 'span';
                        break;
                    default:
                        if (value.startsWith('url(')) {
                            content = $css$1.resolveURL(value);
                            const format = $util$2.fromLastIndexOf(content, '.').toLowerCase();
                            if (this.controllerHandler.localSettings.supported.imageFormat.includes(format)) {
                                tagName = 'img';
                            }
                            else {
                                content = '';
                            }
                        }
                        else {
                            if (REGEXP_CACHED.COUNTERS === undefined) {
                                REGEXP_CACHED.COUNTERS = /\s*(?:attr\(([^)]+)\)|(counter)\(([^,)]+)(?:, ([a-z\-]+))?\)|(counters)\(([^,]+), "([^"]*)"(?:, ([a-z\-]+))?\)|"([^"]+)")\s*/g;
                            }
                            let match;
                            let found = false;
                            while ((match = REGEXP_CACHED.COUNTERS.exec(value)) !== null) {
                                if (match[1]) {
                                    content += $dom.getNamedItem(element, match[1].trim());
                                }
                                else if (match[2] || match[5]) {
                                    const counterType = match[2] === 'counter';
                                    let counterName;
                                    let styleName;
                                    if (counterType) {
                                        counterName = match[3];
                                        styleName = match[4] || 'decimal';
                                    }
                                    else {
                                        counterName = match[6];
                                        styleName = match[8] || 'decimal';
                                    }
                                    function getCounterValue(name) {
                                        if (name !== 'none') {
                                            const counterPattern = /\s*([^\-\d][^\-\d]?[^ ]*) (-?\d+)\s*/g;
                                            let counterMatch;
                                            while ((counterMatch = counterPattern.exec(name)) !== null) {
                                                if (counterMatch[1] === counterName) {
                                                    return parseInt(counterMatch[2]);
                                                }
                                            }
                                        }
                                        return undefined;
                                    }
                                    const getIncrementValue = (parent) => {
                                        const pseduoStyle = $session.getElementCache(parent, `styleMap::${target}`, this.processing.sessionId);
                                        if (pseduoStyle && pseduoStyle.counterIncrement) {
                                            return getCounterValue(pseduoStyle.counterIncrement);
                                        }
                                        return undefined;
                                    };
                                    const initalValue = (getIncrementValue(element) || 0) + (getCounterValue(style.getPropertyValue('counter-reset')) || 0);
                                    const subcounter = [];
                                    let current = element;
                                    let counter = initalValue;
                                    let ascending = false;
                                    let lastResetElement;
                                    function incrementCounter(increment, pseudo = false) {
                                        if (subcounter.length === 0) {
                                            counter += increment;
                                        }
                                        else if (ascending || pseudo) {
                                            subcounter[subcounter.length - 1] += increment;
                                        }
                                    }
                                    function cascadeSibling(sibling) {
                                        if (getCounterValue($css$1.getStyle(sibling).getPropertyValue('counter-reset')) === undefined) {
                                            for (let i = 0; i < sibling.children.length; i++) {
                                                const child = sibling.children[i];
                                                if (child.className !== '__squared.pseudo') {
                                                    let increment = getIncrementValue(child);
                                                    if (increment) {
                                                        incrementCounter(increment, true);
                                                    }
                                                    const childStyle = $css$1.getStyle(child);
                                                    increment = getCounterValue(childStyle.getPropertyValue('counter-increment'));
                                                    if (increment) {
                                                        incrementCounter(increment);
                                                    }
                                                    increment = getCounterValue(childStyle.getPropertyValue('counter-reset'));
                                                    if (increment !== undefined) {
                                                        return;
                                                    }
                                                    cascadeSibling(child);
                                                }
                                            }
                                        }
                                    }
                                    do {
                                        ascending = false;
                                        if (current.previousElementSibling) {
                                            current = current.previousElementSibling;
                                            cascadeSibling(current);
                                        }
                                        else if (current.parentElement) {
                                            current = current.parentElement;
                                            ascending = true;
                                        }
                                        else {
                                            break;
                                        }
                                        if (current.className !== '__squared.pseudo') {
                                            const pesudoIncrement = getIncrementValue(current);
                                            if (pesudoIncrement) {
                                                incrementCounter(pesudoIncrement, true);
                                            }
                                            const currentStyle = $css$1.getStyle(current);
                                            const counterIncrement = getCounterValue(currentStyle.getPropertyValue('counter-increment')) || 0;
                                            if (counterIncrement) {
                                                incrementCounter(counterIncrement);
                                            }
                                            const counterReset = getCounterValue(currentStyle.getPropertyValue('counter-reset'));
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
                                                content += $css$1.convertListStyle(styleName, leading, true) + match[7];
                                            }
                                        }
                                    }
                                    else {
                                        counter = initalValue;
                                    }
                                    content += $css$1.convertListStyle(styleName, counter, true);
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
                if (content || value === '""') {
                    const pseudoElement = $dom.createElement(element, tagName, false, target === 'before' ? 0 : -1);
                    if (tagName === 'img') {
                        pseudoElement.src = content;
                    }
                    else if (value !== '""') {
                        pseudoElement.innerText = content;
                    }
                    for (const attr in styleMap) {
                        if (attr !== 'display') {
                            pseudoElement.style[attr] = styleMap[attr];
                        }
                    }
                    $session.setElementCache(pseudoElement, 'pseudoType', this.processing.sessionId, target);
                    $session.setElementCache(pseudoElement, 'styleMap', this.processing.sessionId, styleMap);
                    return pseudoElement;
                }
            }
            return undefined;
        }
        setStyleMap() {
            let warning = false;
            for (let i = 0; i < document.styleSheets.length; i++) {
                const item = document.styleSheets[i];
                try {
                    if (item.cssRules) {
                        for (let j = 0; j < item.cssRules.length; j++) {
                            const rule = item.cssRules[j];
                            switch (rule.type) {
                                case CSSRule.STYLE_RULE:
                                case CSSRule.FONT_FACE_RULE:
                                    this.applyStyleRule(rule);
                                    break;
                                case CSSRule.MEDIA_RULE:
                                    if ($css$1.validMediaRule(rule.conditionText || parseConditionText('media', rule.cssText))) {
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
                    if (!warning) {
                        alert('CSS cannot be parsed inside <link> tags when loading files directly from your hard drive or from external websites. ' +
                            'Either use a local web server, embed your CSS into a <style> tag, or you can also try using a different browser. ' +
                            'See the README for more detailed instructions.\n\n' +
                            `${item.href}\n\n${error}`);
                        warning = true;
                    }
                }
            }
        }
        applyCSSRuleList(rules) {
            for (let i = 0; i < rules.length; i++) {
                this.applyStyleRule(rules[i]);
            }
        }
        applyStyleRule(item) {
            switch (item.type) {
                case CSSRule.STYLE_RULE: {
                    const fromRule = [];
                    for (const attr of Array.from(item.style)) {
                        fromRule.push($util$2.convertCamelCase(attr));
                    }
                    for (const selectorText of item.selectorText.split($regex.XML.SEPARATOR)) {
                        const specificity = $css$1.getSpecificity(selectorText);
                        const [selector, target] = selectorText.split('::');
                        const targetElt = target ? '::' + target : '';
                        document.querySelectorAll(selector || '*').forEach((element) => {
                            const style = $css$1.getStyle(element, targetElt);
                            const fontSize = $css$1.parseUnit(style.getPropertyValue('font-size'));
                            const styleMap = {};
                            for (const attr of fromRule) {
                                const value = $css$1.checkStyleValue(element, attr, item.style[attr], style, specificity, fontSize);
                                if (value) {
                                    styleMap[attr] = value;
                                }
                            }
                            if (this.userSettings.preloadImages) {
                                [styleMap.backgroundImage, styleMap.listStyleImage, styleMap.content].forEach(image => {
                                    if (image && image.startsWith('url(')) {
                                        for (const value of image.split($regex.XML.SEPARATOR)) {
                                            const uri = $css$1.resolveURL(value.trim());
                                            if (uri !== '' && this.resourceHandler.getImage(uri) === undefined) {
                                                this.resourceHandler.assets.images.set(uri, { width: 0, height: 0, uri });
                                            }
                                        }
                                    }
                                });
                            }
                            const attrStyle = `styleMap${targetElt}`;
                            const attrSpecificity = `styleSpecificity${targetElt}`;
                            const styleData = $session.getElementCache(element, attrStyle, this.processing.sessionId);
                            if (styleData) {
                                const specificityData = $session.getElementCache(element, attrSpecificity, this.processing.sessionId) || {};
                                for (const attr in styleMap) {
                                    if (styleData[attr] === undefined || specificityData[attr] === undefined || specificity >= specificityData[attr]) {
                                        styleData[attr] = styleMap[attr];
                                        specificityData[attr] = specificity;
                                    }
                                }
                            }
                            else {
                                const specificityData = {};
                                for (const attr in styleMap) {
                                    specificityData[attr] = specificity;
                                }
                                $session.setElementCache(element, `style${targetElt}`, '0', style);
                                $session.setElementCache(element, attrStyle, this.processing.sessionId, styleMap);
                                $session.setElementCache(element, attrSpecificity, this.processing.sessionId, specificityData);
                            }
                        });
                    }
                    break;
                }
                case CSSRule.FONT_FACE_RULE: {
                    if (REGEXP_CACHED.FONT_FACE === undefined) {
                        REGEXP_CACHED.FONT_FACE = /\s*@font-face\s*{([^}]+)}\s*/;
                        REGEXP_CACHED.FONT_FAMILY = /\s*font-family:[^\w]*([^'";]+)/;
                        REGEXP_CACHED.FONT_SRC = /\s*src:\s*([^;]+);/;
                        REGEXP_CACHED.FONT_STYLE = /\s*font-style:\s*(\w+)\s*;/;
                        REGEXP_CACHED.FONT_WEIGHT = /\s*font-weight:\s*(\d+)\s*;/;
                        REGEXP_CACHED.URL = /\s*(url|local)\(['"]([^'")]+)['"]\)\s*format\(['"](\w+)['"]\)\s*/;
                    }
                    const match = REGEXP_CACHED.FONT_FACE.exec(item.cssText);
                    if (match) {
                        const familyMatch = REGEXP_CACHED.FONT_FAMILY.exec(match[1]);
                        const srcMatch = REGEXP_CACHED.FONT_SRC.exec(match[1]);
                        if (familyMatch && srcMatch) {
                            const styleMatch = REGEXP_CACHED.FONT_STYLE.exec(match[1]);
                            const weightMatch = REGEXP_CACHED.FONT_WEIGHT.exec(match[1]);
                            const fontFamily = familyMatch[1].trim();
                            const fontStyle = styleMatch ? styleMatch[1].toLowerCase() : 'normal';
                            const fontWeight = weightMatch ? parseInt(weightMatch[1]) : 400;
                            for (const value of srcMatch[1].split($regex.XML.SEPARATOR)) {
                                const url = REGEXP_CACHED.URL.exec(value);
                                if (url) {
                                    let srcUrl;
                                    let srcLocal;
                                    if (url[1] === 'url') {
                                        srcUrl = $util$2.resolvePath(url[2].trim());
                                    }
                                    else {
                                        srcLocal = url[2].trim();
                                    }
                                    this.resourceHandler.addFont({
                                        fontFamily,
                                        fontWeight,
                                        fontStyle,
                                        srcUrl,
                                        srcLocal,
                                        srcFormat: url[3].toLowerCase().trim()
                                    });
                                }
                            }
                        }
                    }
                    break;
                }
            }
        }
        createLayoutControl(parent, node) {
            return new Layout(parent, node, node.containerType, node.alignmentType, node.children);
        }
        set userSettings(value) {
            this._userSettings = value;
        }
        get userSettings() {
            return this._userSettings || {};
        }
        get layouts() {
            return this._layouts.sort((a, b) => {
                if (a.index !== b.index) {
                    if (a.index === 0 || a.index !== undefined && b.index === undefined || b.index === Number.POSITIVE_INFINITY) {
                        return -1;
                    }
                    else if (b.index === 0 || b.index !== undefined && a.index === undefined || a.index === Number.POSITIVE_INFINITY) {
                        return 1;
                    }
                    else if (a.index !== undefined && b.index !== undefined) {
                        return a.index < b.index ? -1 : 1;
                    }
                }
                return 0;
            });
        }
        get rendered() {
            return this.session.cache.filter(node => node.visible && node.rendered);
        }
        get nextId() {
            return this.processing.cache.nextId;
        }
        get length() {
            return this.session.documentRoot.length;
        }
    }

    const $color = squared.lib.color;
    const $client = squared.lib.client;
    const $css$2 = squared.lib.css;
    const $session$1 = squared.lib.session;
    const $util$3 = squared.lib.util;
    const $xml$1 = squared.lib.xml;
    const withinViewport = (rect) => !(rect.left < 0 && rect.top < 0 && Math.abs(rect.left) >= rect.width && Math.abs(rect.top) >= rect.height);
    class Controller {
        constructor(application, cache) {
            this.application = application;
            this.cache = cache;
            this._beforeOutside = {};
            this._beforeInside = {};
            this._afterInside = {};
            this._afterOutside = {};
        }
        reset() {
            this._beforeOutside = {};
            this._beforeInside = {};
            this._afterInside = {};
            this._afterOutside = {};
        }
        applyDefaultStyles(element) {
            let styleMap;
            if (element.nodeName === '#text') {
                styleMap = {
                    position: 'static',
                    display: 'inline',
                    verticalAlign: 'baseline',
                    float: 'none',
                    clear: 'none'
                };
            }
            else {
                styleMap = $session$1.getElementCache(element, 'styleMap', this.application.processing.sessionId) || {};
                if ($client.isUserAgent(8 /* FIREFOX */)) {
                    switch (element.tagName) {
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
                switch (element.tagName) {
                    case 'INPUT':
                        switch (element.type) {
                            case 'file': {
                                const style = $css$2.getStyle(element);
                                const color = $color.parseColor(style.getPropertyValue('background-color'));
                                if (color === undefined) {
                                    styleMap.backgroundColor = '#DDDDDD';
                                    if (style.getPropertyValue('border-style') === 'none') {
                                        for (const border of ['borderTop', 'borderRight', 'borderBottom', 'borderLeft']) {
                                            styleMap[`${border}Style`] = 'outset';
                                            styleMap[`${border}Color`] = '#DDDDDD';
                                            styleMap[`${border}Width`] = '2px';
                                        }
                                    }
                                }
                            }
                            case 'reset':
                            case 'submit':
                            case 'button':
                                if (styleMap.textAlign === undefined) {
                                    styleMap.textAlign = 'center';
                                }
                                break;
                        }
                        break;
                    case 'BUTTON':
                        if (styleMap.textAlign === undefined) {
                            styleMap.textAlign = 'center';
                        }
                        break;
                    case 'TEXTAREA':
                    case 'SELECT':
                        if (styleMap.verticalAlign === undefined && (element.tagName !== 'SELECT' || element.size > 1)) {
                            styleMap.verticalAlign = 'text-bottom';
                        }
                        break;
                    case 'FORM':
                        if (styleMap.marginTop === undefined) {
                            styleMap.marginTop = '0px';
                        }
                        break;
                    case 'LI':
                        if (styleMap.listStyleImage === undefined) {
                            const style = $css$2.getStyle(element);
                            styleMap.listStyleImage = style.getPropertyValue('list-style-image');
                        }
                        break;
                    case 'IFRAME':
                        if (styleMap.display === undefined) {
                            styleMap.display = 'block';
                        }
                    case 'IMG':
                        const setDimension = (attr, opposing) => {
                            if (styleMap[attr] === undefined || styleMap[attr] === 'auto') {
                                const match = new RegExp(`\\s+${attr}="([^"]+)"`).exec(element.outerHTML);
                                if (match) {
                                    if ($css$2.isLength(match[1])) {
                                        styleMap[attr] = $css$2.formatPX(match[1]);
                                    }
                                    else if ($css$2.isPercent(match[1])) {
                                        styleMap[attr] = match[1];
                                    }
                                }
                                else if (element.tagName === 'IFRAME') {
                                    if (attr === 'width') {
                                        styleMap.width = '300px';
                                    }
                                    else {
                                        styleMap.height = '150px';
                                    }
                                }
                                else if (styleMap[opposing] && $css$2.isLength(styleMap[opposing])) {
                                    const attrMax = `max${$util$3.capitalize(attr)}`;
                                    if (styleMap[attrMax] === undefined || !$css$2.isPercent(attrMax)) {
                                        const image = this.application.resourceHandler.getImage(element.src);
                                        if (image && image.width > 0 && image.height > 0) {
                                            styleMap[attr] = $css$2.formatPX(image[attr] * parseFloat(styleMap[opposing]) / image[opposing]);
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
            $session$1.setElementCache(element, 'styleMap', this.application.processing.sessionId, styleMap);
        }
        addBeforeOutsideTemplate(id, value, index = -1) {
            if (this._beforeOutside[id] === undefined) {
                this._beforeOutside[id] = [];
            }
            if (index !== -1 && index < this._beforeOutside[id].length) {
                this._beforeOutside[id].splice(index, 0, value);
            }
            else {
                this._beforeOutside[id].push(value);
            }
        }
        addBeforeInsideTemplate(id, value, index = -1) {
            if (this._beforeInside[id] === undefined) {
                this._beforeInside[id] = [];
            }
            if (index !== -1 && index < this._beforeInside[id].length) {
                this._beforeInside[id].splice(index, 0, value);
            }
            else {
                this._beforeInside[id].push(value);
            }
        }
        addAfterInsideTemplate(id, value, index = -1) {
            if (this._afterInside[id] === undefined) {
                this._afterInside[id] = [];
            }
            if (index !== -1 && index < this._afterInside[id].length) {
                this._afterInside[id].splice(index, 0, value);
            }
            else {
                this._afterInside[id].push(value);
            }
        }
        addAfterOutsideTemplate(id, value, index = -1) {
            if (this._afterOutside[id] === undefined) {
                this._afterOutside[id] = [];
            }
            if (index !== -1 && index < this._afterOutside[id].length) {
                this._afterOutside[id].splice(index, 0, value);
            }
            else {
                this._afterOutside[id].push(value);
            }
        }
        getBeforeOutsideTemplate(id, depth = 0) {
            return this._beforeOutside[id] ? $xml$1.pushIndentArray(this._beforeOutside[id], depth) : '';
        }
        getBeforeInsideTemplate(id, depth = 0) {
            return this._beforeInside[id] ? $xml$1.pushIndentArray(this._beforeInside[id], depth) : '';
        }
        getAfterInsideTemplate(id, depth = 0) {
            return this._afterInside[id] ? $xml$1.pushIndentArray(this._afterInside[id], depth) : '';
        }
        getAfterOutsideTemplate(id, depth = 0) {
            return this._afterOutside[id] ? $xml$1.pushIndentArray(this._afterOutside[id], depth) : '';
        }
        hasAppendProcessing(id) {
            return this._beforeOutside[id] !== undefined || this._beforeInside[id] !== undefined || this._afterInside[id] !== undefined || this._afterOutside[id] !== undefined;
        }
        includeElement(element) {
            return !this.localSettings.unsupported.tagName.has(element.tagName) || element.tagName === 'INPUT' && !this.localSettings.unsupported.tagName.has(`${element.tagName}:${element.type}`) || element['contentEditable'] === 'true';
        }
        visibleElement(element) {
            if (element.className === '__squared.pseudo') {
                return true;
            }
            const rect = $session$1.getClientRect(element, this.application.processing.sessionId);
            if (withinViewport(rect)) {
                if (rect.width > 0 && rect.height > 0) {
                    return true;
                }
                const style = $css$2.getStyle(element);
                return rect.width > 0 && style.getPropertyValue('float') !== 'none' || style.getPropertyValue('display') === 'block' && (parseInt(style.getPropertyValue('margin-top')) !== 0 || parseInt(style.getPropertyValue('margin-bottom')) !== 0) || style.getPropertyValue('clear') !== 'none';
            }
            return false;
        }
        cascadeDocument(templates, depth) {
            const indent = depth > 0 ? '\t'.repeat(depth) : '';
            let output = '';
            for (let i = 0; i < templates.length; i++) {
                const item = templates[i];
                if (item) {
                    const node = item.node;
                    switch (item.type) {
                        case 1 /* XML */: {
                            const { controlName, attributes } = item;
                            const renderDepth = depth + 1;
                            const beforeInside = this.getBeforeInsideTemplate(node.id, renderDepth);
                            const afterInside = this.getAfterInsideTemplate(node.id, renderDepth);
                            let template = indent + `<${controlName + (depth === 0 ? '{#0}' : '') + (this.userSettings.showAttributes ? (attributes ? $xml$1.pushIndent(attributes, renderDepth) : node.extractAttributes(renderDepth)) : '')}`;
                            if (node.renderTemplates || beforeInside !== '' || afterInside !== '') {
                                template += '>\n' +
                                    beforeInside +
                                    (node.renderTemplates ? this.cascadeDocument(this.sortRenderPosition(node, node.renderTemplates), renderDepth) : '') +
                                    afterInside +
                                    indent + `</${controlName}>\n`;
                            }
                            else {
                                template += ' />\n';
                            }
                            output += this.getBeforeOutsideTemplate(node.id, depth) +
                                template +
                                this.getAfterOutsideTemplate(node.id, depth);
                            break;
                        }
                        case 2 /* INCLUDE */: {
                            const { content } = item;
                            if (content) {
                                output += $xml$1.pushIndent(content, depth);
                            }
                            break;
                        }
                    }
                }
            }
            return output;
        }
        getEnclosingTag(type, options) {
            switch (type) {
                case 1 /* XML */:
                    const { controlName, attributes, content } = options;
                    return '<' + controlName + (attributes || '') + (content ? '>\n' + content + '</' + controlName + '>\n' : ' />\n');
            }
            return '';
        }
        get generateSessionId() {
            return new Date().getTime().toString();
        }
    }

    const $css$3 = squared.lib.css;
    const $util$4 = squared.lib.util;
    class Extension {
        constructor(name, framework, tagNames, options) {
            this.name = name;
            this.framework = framework;
            this.eventOnly = false;
            this.preloaded = false;
            this.documentBase = false;
            this.options = {};
            this.dependencies = [];
            this.subscribers = new Set();
            this.tagNames = Array.isArray(tagNames) ? $util$4.replaceMap(tagNames, value => value.trim().toUpperCase()) : [];
            if (options) {
                Object.assign(this.options, options);
            }
        }
        static findNestedElement(element, name) {
            if ($css$3.hasComputedStyle(element)) {
                for (let i = 0; i < element.children.length; i++) {
                    const item = element.children[i];
                    if ($util$4.includes(item.dataset.use, name)) {
                        return item;
                    }
                }
            }
            return null;
        }
        is(node) {
            return node.styleElement ? this.tagNames.length === 0 || this.tagNames.includes(node.element.tagName) : false;
        }
        require(name, preload = false) {
            this.dependencies.push({ name, preload });
        }
        included(element) {
            return $util$4.includes(element.dataset.use, this.name);
        }
        beforeInit(element, recursive = false) {
            if (!recursive && this.included(element)) {
                for (const item of this.dependencies) {
                    if (item.preload) {
                        const ext = this.application.extensionManager.retrieve(item.name);
                        if (ext && !ext.preloaded) {
                            ext.beforeInit(element, true);
                            ext.preloaded = true;
                        }
                    }
                }
            }
        }
        init(element) {
            return false;
        }
        afterInit(element, recursive = false) {
            if (!recursive && this.included(element)) {
                for (const item of this.dependencies) {
                    if (item.preload) {
                        const ext = this.application.extensionManager.retrieve(item.name);
                        if (ext && ext.preloaded) {
                            ext.afterInit(element, true);
                            ext.preloaded = false;
                        }
                    }
                }
            }
        }
        condition(node, parent) {
            if ($css$3.hasComputedStyle(node.element)) {
                return node.dataset.use ? this.included(node.element) : this.tagNames.length > 0;
            }
            return false;
        }
        processNode(node, parent) {
            return undefined;
        }
        processChild(node, parent) {
            return undefined;
        }
        addDescendant(node) {
            const extensions = this.application.session.extensionMap.get(node.id) || [];
            if (!extensions.includes(this)) {
                extensions.push(this);
            }
            this.application.session.extensionMap.set(node.id, extensions);
        }
        postBaseLayout(node) { }
        postConstraints(node) { }
        postParseDocument(node) { }
        postOptimize(node) { }
        postBoxSpacing(node) { }
        beforeParseDocument() { }
        afterBaseLayout() { }
        afterConstraints() { }
        afterResources() { }
        afterParseDocument() { }
        beforeCascade() { }
        afterFinalize() { }
        get installed() {
            return !!this.application && this.application.extensions.includes(this);
        }
    }

    const $util$5 = squared.lib.util;
    class ExtensionManager {
        constructor(application) {
            this.application = application;
        }
        include(ext) {
            const found = this.retrieve(ext.name);
            if (found) {
                if (Array.isArray(ext.tagNames)) {
                    found.tagNames = ext.tagNames;
                }
                Object.assign(found.options, ext.options);
                return true;
            }
            else {
                if ((ext.framework === 0 || $util$5.hasBit(ext.framework, this.application.framework)) && ext.dependencies.every(item => !!this.retrieve(item.name))) {
                    ext.application = this.application;
                    if (!this.application.extensions.includes(ext)) {
                        this.application.extensions.push(ext);
                    }
                    return true;
                }
            }
            return false;
        }
        exclude(ext) {
            for (let i = 0; i < this.application.extensions.length; i++) {
                if (this.application.extensions[i] === ext) {
                    this.application.extensions.splice(i, 1);
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
            const ext = this.retrieve(name);
            if (ext && typeof ext.options === 'object') {
                return ext.options[attr];
            }
            return undefined;
        }
        optionValueAsObject(name, attr) {
            const value = this.optionValue(name, attr);
            if (typeof value === 'object') {
                return value;
            }
            return null;
        }
        optionValueAsString(name, attr) {
            const value = this.optionValue(name, attr);
            return typeof value === 'string' ? value : '';
        }
        optionValueAsNumber(name, attr) {
            const value = this.optionValue(name, attr);
            return typeof value === 'number' ? value : 0;
        }
        optionValueAsBoolean(name, attr) {
            const value = this.optionValue(name, attr);
            return typeof value === 'boolean' ? value : false;
        }
    }

    const $util$6 = squared.lib.util;
    class File {
        constructor(resource) {
            this.resource = resource;
            this.appName = '';
            this.assets = [];
            resource.fileHandler = this;
        }
        static downloadToDisk(data, filename, mime = '') {
            const blob = new Blob([data], { type: mime || 'application/octet-stream' });
            const url = window.URL.createObjectURL(blob);
            const element = document.createElement('a');
            element.style.setProperty('display', 'none');
            element.setAttribute('href', url);
            element.setAttribute('download', filename);
            if (typeof element.download === 'undefined') {
                element.setAttribute('target', '_blank');
            }
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
            setTimeout(() => window.URL.revokeObjectURL(url), 1);
        }
        addAsset(pathname, filename, content = '', uri = '') {
            if (content || uri) {
                const index = this.assets.findIndex(item => item.pathname === pathname && item.filename === filename);
                if (index !== -1) {
                    this.assets[index].content = content;
                    this.assets[index].uri = uri;
                }
                else {
                    this.assets.push({
                        pathname,
                        filename,
                        content,
                        uri
                    });
                }
            }
        }
        reset() {
            this.assets.length = 0;
        }
        saveToDisk(files, appName) {
            if (!location.protocol.startsWith('http')) {
                alert('SERVER (required): See README for instructions');
                return;
            }
            if (files.length) {
                const settings = this.userSettings;
                $util$6.concatArray(files, this.assets);
                fetch(`/api/savetodisk` +
                    `?directory=${encodeURIComponent($util$6.trimString(settings.outputDirectory, '/'))}` +
                    (appName ? `&appname=${encodeURIComponent(appName.trim())}` : '') +
                    `&filetype=${settings.outputArchiveFileType.toLowerCase()}` +
                    `&processingtime=${settings.outputMaxProcessingTime.toString().trim()}`, {
                    method: 'POST',
                    headers: new Headers({
                        'Accept': 'application/json, text/plain, */*',
                        'Content-Type': 'application/json'
                    }),
                    body: JSON.stringify(files)
                })
                    .then((response) => response.json())
                    .then((result) => {
                    if (result) {
                        if (result.zipname) {
                            fetch(`/api/downloadtobrowser?filename=${encodeURIComponent(result.zipname)}`)
                                .then((responseBlob) => responseBlob.blob())
                                .then((blob) => File.downloadToDisk(blob, $util$6.fromLastIndexOf(result.zipname, '/')));
                        }
                        else if (result.system) {
                            alert(`${result.application}\n\n${result.system}`);
                        }
                    }
                })
                    .catch(err => alert(`ERROR: ${err}`));
            }
        }
        get stored() {
            return this.resource.stored;
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
        EXTERNAL: 'squared.external',
        FLEXBOX: 'squared.flexbox',
        GRID: 'squared.grid',
        LIST: 'squared.list',
        RELATIVE: 'squared.relative',
        SPRITE: 'squared.sprite',
        SUBSTITUTE: 'squared.substitute',
        TABLE: 'squared.table',
        VERTICAL_ALIGN: 'squared.verticalalign',
        WHITESPACE: 'squared.whitespace'
    };

    var constant = /*#__PURE__*/Object.freeze({
        CSS_SPACING: CSS_SPACING,
        EXT_NAME: EXT_NAME
    });

    const $css$4 = squared.lib.css;
    const $dom$1 = squared.lib.dom;
    const $regex$1 = squared.lib.regex;
    const $session$2 = squared.lib.session;
    const $util$7 = squared.lib.util;
    const INHERIT_ALIGNMENT = ['position', 'display', 'verticalAlign', 'float', 'clear', 'zIndex'];
    const CSS_SPACING_KEYS = Array.from(CSS_SPACING.keys());
    class Node extends squared.lib.base.Container {
        constructor(id, sessionId = '0', element) {
            super();
            this.id = id;
            this.sessionId = sessionId;
            this.alignmentType = 0;
            this.depth = -1;
            this.siblingIndex = Number.POSITIVE_INFINITY;
            this.documentRoot = false;
            this.visible = true;
            this.excluded = false;
            this.rendered = false;
            this.baselineActive = false;
            this.baselineAltered = false;
            this.lineBreakLeading = false;
            this.lineBreakTrailing = false;
            this.positioned = false;
            this.controlId = '';
            this._initial = {
                iteration: -1,
                children: [],
                styleMap: {}
            };
            this._data = {};
            this._excludeSection = 0;
            this._excludeProcedure = 0;
            this._excludeResource = 0;
            this._inlineText = false;
            this._element = null;
            if (element) {
                this._element = element;
                this.init();
            }
            else {
                this.style = {};
                this._styleMap = {};
            }
        }
        init() {
            const element = this._element;
            if (element) {
                if (this.sessionId !== '0') {
                    $session$2.setElementCache(element, 'node', this.sessionId, this);
                }
                this.style = $session$2.getElementCache(element, 'style', '0') || $css$4.getStyle(element, undefined, false);
                this._styleMap = Object.assign({}, $session$2.getElementCache(element, 'styleMap', this.sessionId));
                if ($css$4.hasComputedStyle(element) && !this.pseudoElement && this.sessionId !== '0') {
                    const fontSize = parseFloat(this.style.getPropertyValue('font-size'));
                    for (let attr of Array.from(element.style)) {
                        let value = element.style.getPropertyValue(attr);
                        attr = $util$7.convertCamelCase(attr);
                        value = $css$4.checkStyleValue(element, attr, value, this.style, 1000, fontSize);
                        if (value) {
                            this._styleMap[attr] = value;
                        }
                    }
                }
            }
        }
        saveAsInitial(overwrite = false) {
            if (this._initial.iteration === -1 || overwrite) {
                this._initial.children = this.duplicate();
                this._initial.styleMap = Object.assign({}, this._styleMap);
            }
            if (this._bounds) {
                this._initial.bounds = $dom$1.assignRect(this._bounds);
                this._initial.linear = $dom$1.assignRect(this.linear);
                this._initial.box = $dom$1.assignRect(this.box);
            }
            this._initial.iteration++;
        }
        is(...containers) {
            return containers.some(value => this.containerType === value);
        }
        of(containerType, ...alignmentType) {
            return this.containerType === containerType && alignmentType.some(value => this.hasAlign(value));
        }
        unsafe(name, reset = false) {
            if (reset) {
                delete this[`_${name}`];
            }
            else {
                return this[`_${name}`];
            }
        }
        attr(name, attr, value, overwrite = true) {
            let obj = this[`__${name}`];
            if (value) {
                if (obj === undefined) {
                    if (!this._namespaces.includes(name)) {
                        this._namespaces.push(name);
                    }
                    obj = {};
                    this[`__${name}`] = obj;
                }
                if (!overwrite && obj[attr]) {
                    return '';
                }
                obj[attr] = value.toString();
                return obj[attr];
            }
            else {
                return obj && obj[attr] || '';
            }
        }
        namespace(name) {
            return this[`__${name}`] || {};
        }
        delete(name, ...attrs) {
            const obj = this[`__${name}`];
            if (obj) {
                for (const attr of attrs) {
                    if (attr.indexOf('*') !== -1) {
                        for (const [key] of $util$7.searchObject(obj, attr)) {
                            delete obj[key];
                        }
                    }
                    else {
                        delete obj[attr];
                    }
                }
            }
        }
        apply(options) {
            for (const name in options) {
                const obj = options[name];
                if (typeof obj === 'object') {
                    for (const attr in obj) {
                        this.attr(name, attr, obj[attr]);
                    }
                    delete options[name];
                }
            }
        }
        render(parent) {
            this.renderParent = parent;
            this.rendered = true;
        }
        renderEach(predicate) {
            for (let i = 0; i < this.renderChildren.length; i++) {
                if (this.renderChildren[i].visible) {
                    predicate(this.renderChildren[i], i, this.renderChildren);
                }
            }
            return this;
        }
        renderFilter(predicate) {
            return $util$7.filterArray(this.renderChildren, predicate);
        }
        hide(invisible) {
            this.rendered = true;
            this.visible = false;
        }
        data(name, attr, value, overwrite = true) {
            if ($util$7.hasValue(value)) {
                if (typeof this._data[name] !== 'object') {
                    this._data[name] = {};
                }
                if (overwrite || this._data[name][attr] === undefined) {
                    this._data[name][attr] = value;
                }
            }
            else if (value === null) {
                delete this._data[name];
            }
            return this._data[name] === undefined || this._data[name][attr] === undefined ? undefined : this._data[name][attr];
        }
        unsetCache(...attrs) {
            if (attrs.length) {
                for (const attr of attrs) {
                    switch (attr) {
                        case 'position':
                            this._cached = {};
                            return;
                        case 'width':
                            this._cached.actualWidth = undefined;
                        case 'minWidth':
                            this._cached.width = undefined;
                            break;
                        case 'height':
                            this._cached.actualHeight = undefined;
                        case 'minHeight':
                            this._cached.height = undefined;
                            break;
                        case 'verticalAlign':
                            this._cached.baseline = undefined;
                            break;
                        case 'display':
                            this._cached.inline = undefined;
                            this._cached.inlineVertical = undefined;
                            this._cached.inlineFlow = undefined;
                            this._cached.block = undefined;
                            this._cached.blockDimension = undefined;
                            this._cached.blockStatic = undefined;
                            this._cached.autoMargin = undefined;
                            break;
                        case 'pageFlow':
                            this._cached.positionAuto = undefined;
                            this._cached.blockStatic = undefined;
                            this._cached.baseline = undefined;
                            this._cached.floating = undefined;
                            this._cached.autoMargin = undefined;
                            this._cached.rightAligned = undefined;
                            this._cached.bottomAligned = undefined;
                            break;
                        case 'float':
                            this._cached.floating = undefined;
                            break;
                        default:
                            if (attr.startsWith('margin')) {
                                this._cached.autoMargin = undefined;
                            }
                            if (attr.startsWith('padding') || attr.startsWith('border')) {
                                this._cached.contentBoxWidth = undefined;
                                this._cached.contentBoxHeight = undefined;
                            }
                            break;
                    }
                    this._cached[attr] = undefined;
                }
            }
            else {
                this._cached = {};
            }
        }
        ascend(generated = false, condition, parent) {
            const result = [];
            const attr = generated ? (this.renderParent ? 'renderParent' : 'parent') : 'actualParent';
            let current = this[attr];
            while (current && current.id !== 0 && !result.includes(current)) {
                if (condition) {
                    if (condition(current)) {
                        return [current];
                    }
                }
                else {
                    result.push(current);
                }
                if (current === parent) {
                    break;
                }
                current = current[attr];
            }
            return result;
        }
        inherit(node, ...modules) {
            const initial = node.unsafe('initial');
            for (const name of modules) {
                switch (name) {
                    case 'initial':
                        $util$7.cloneObject(initial, this._initial);
                        break;
                    case 'base':
                        this._documentParent = node.documentParent;
                        this._bounds = $dom$1.assignRect(node.bounds);
                        this._linear = $dom$1.assignRect(node.linear);
                        this._box = $dom$1.assignRect(node.box);
                        const actualParent = node.actualParent;
                        if (actualParent) {
                            this.dir = actualParent.dir;
                        }
                        break;
                    case 'alignment':
                        for (const attr of INHERIT_ALIGNMENT) {
                            this._styleMap[attr] = node.css(attr);
                            this._initial.styleMap[attr] = initial.styleMap[attr];
                        }
                        if (!this.positionStatic) {
                            for (const attr of $css$4.BOX_POSITION) {
                                if (node.has(attr)) {
                                    this._styleMap[attr] = node.css(attr);
                                }
                                this._initial.styleMap[attr] = initial.styleMap[attr];
                            }
                        }
                        if (node.autoMargin.horizontal || node.autoMargin.vertical) {
                            for (const attr of $css$4.BOX_MARGIN) {
                                if (node.cssInitial(attr) === 'auto') {
                                    this._styleMap[attr] = 'auto';
                                }
                                if (node.cssInitial(attr) === 'auto') {
                                    this._initial.styleMap[attr] = 'auto';
                                }
                            }
                        }
                        break;
                    case 'styleMap':
                        $util$7.assignEmptyProperty(this._styleMap, node.unsafe('styleMap'));
                        break;
                    case 'textStyle':
                        this.cssApply({
                            fontFamily: node.css('fontFamily'),
                            fontSize: node.css('fontSize'),
                            fontWeight: node.css('fontWeight'),
                            fontStyle: node.css('fontStyle'),
                            color: node.css('color'),
                            whiteSpace: node.css('whiteSpace'),
                            textDecoration: node.css('textDecoration'),
                            textTransform: node.css('textTransform'),
                            wordSpacing: node.css('wordSpacing'),
                            opacity: node.css('opacity')
                        });
                        break;
                }
            }
        }
        alignedVertically(previousSiblings, siblings, cleared, horizontal) {
            if (this.lineBreak) {
                return 2 /* LINEBREAK */;
            }
            else if (this.pageFlow && previousSiblings.length) {
                if ($util$7.isArray(siblings)) {
                    const previous = siblings[siblings.length - 1];
                    if (cleared && cleared.has(this)) {
                        return 5 /* FLOAT_CLEAR */;
                    }
                    else if (this.floating && previous.floating) {
                        if (this.linear.top >= Math.floor(previous.linear.bottom)) {
                            return 4 /* FLOAT_WRAP */;
                        }
                    }
                    else if (this.blockStatic && horizontal !== undefined) {
                        if (cleared && cleared.size && siblings.some(item => cleared.has(item))) {
                            if (this.textElement && siblings.some(item => this.linear.top < item.linear.top && this.linear.bottom > item.linear.bottom)) {
                                return 7 /* FLOAT_INTERSECT */;
                            }
                            else {
                                return 6 /* FLOAT_BLOCK */;
                            }
                        }
                        if (horizontal) {
                            const floated = siblings.find(item => item.floating);
                            if (floated) {
                                let { top, bottom } = this.linear;
                                if (this.textElement && !this.plainText) {
                                    const rect = $session$2.getRangeClientRect(this._element, this.sessionId);
                                    if (rect.top > top) {
                                        top = rect.top;
                                    }
                                    if (rect.bottom > bottom) {
                                        bottom = rect.bottom;
                                    }
                                }
                                return !$util$7.withinRange(top, floated.linear.top) && (this.multiline ? bottom > floated.linear.bottom : top >= floated.linear.bottom) ? 6 /* FLOAT_BLOCK */ : 0 /* HORIZONTAL */;
                            }
                        }
                        else if (siblings.every(item => item.float === 'right')) {
                            return 6 /* FLOAT_BLOCK */;
                        }
                    }
                }
                const actualParent = this.actualParent;
                const blockStatic = this.blockStatic || this.display === 'table';
                for (const previous of previousSiblings) {
                    if (previous.lineBreak) {
                        return 2 /* LINEBREAK */;
                    }
                    else if (cleared && cleared.get(previous) === 'both' && (!$util$7.isArray(siblings) || siblings[0] !== previous)) {
                        return 5 /* FLOAT_CLEAR */;
                    }
                    else if (blockStatic && (!previous.floating || actualParent && previous.float !== 'right' && $util$7.withinRange(previous.linear.right, actualParent.box.right) || cleared && cleared.has(previous)) ||
                        previous.blockStatic ||
                        previous.autoMargin.leftRight ||
                        previous.float === 'left' && this.autoMargin.right ||
                        previous.float === 'right' && this.autoMargin.left) {
                        return 1 /* VERTICAL */;
                    }
                    else if (this.blockDimension) {
                        const previousBottom = $util$7.isArray(siblings) && this.linear.top >= Math.floor(siblings[siblings.length - 1].linear.bottom);
                        if (previousBottom && (!previous.floating || this.has('width', 32 /* PERCENT */)) || this.css('width') === '100%' && !this.has('maxWidth')) {
                            return 3 /* INLINE_WRAP */;
                        }
                    }
                }
            }
            return 0 /* HORIZONTAL */;
        }
        intersectX(rect, dimension = 'linear') {
            const self = this[dimension];
            return (rect.left >= self.left && rect.left < self.right ||
                rect.right > self.left && rect.right <= self.right ||
                self.left >= rect.left && self.right <= rect.right ||
                rect.left >= self.left && rect.right <= self.right);
        }
        intersectY(rect, dimension = 'linear') {
            const self = this[dimension];
            return (rect.top >= self.top && rect.top < self.bottom ||
                rect.bottom > self.top && rect.bottom <= self.bottom ||
                self.top >= rect.top && self.bottom <= rect.bottom ||
                rect.top >= self.top && rect.bottom <= self.bottom);
        }
        withinX(rect, dimension = 'linear') {
            const self = this[dimension];
            return Math.ceil(self.left) >= Math.floor(rect.left) && Math.floor(self.right) <= Math.ceil(rect.right);
        }
        withinY(rect, dimension = 'linear') {
            const self = this[dimension];
            return Math.ceil(self.top) >= Math.floor(rect.top) && Math.floor(self.bottom) <= Math.ceil(rect.bottom);
        }
        outsideX(rect, dimension = 'linear') {
            const self = this[dimension];
            return Math.ceil(self.left) < Math.floor(rect.left) || Math.floor(self.right) > Math.ceil(rect.right);
        }
        outsideY(rect, dimension = 'linear') {
            const self = this[dimension];
            return Math.ceil(self.top) < Math.floor(rect.top) || Math.floor(self.bottom) > Math.ceil(rect.bottom);
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
            return this._styleMap[attr] || this.style[attr] || '';
        }
        cssApply(values, cache = false) {
            Object.assign(this._styleMap, values);
            if (cache) {
                for (const name in values) {
                    this.unsetCache(name);
                }
            }
            return this;
        }
        cssInitial(attr, modified = false, computed = false) {
            if (this._initial.iteration === -1 && !modified) {
                computed = true;
            }
            let value = modified ? this._styleMap[attr] : this._initial.styleMap[attr];
            if (computed && !value) {
                value = this.style[attr];
            }
            return value || '';
        }
        cssAny(attr, ...values) {
            for (const value of values) {
                if (this.css(attr) === value) {
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
        cssAscend(attr, startChild = false, visible = false) {
            let value = '';
            let current = startChild ? this : this.actualParent;
            while (current) {
                value = current.cssInitial(attr);
                if (value !== '') {
                    if (visible && !current.visible) {
                        value = '';
                    }
                    else {
                        break;
                    }
                }
                if (current.documentBody) {
                    break;
                }
                current = current.actualParent;
            }
            return value;
        }
        cssSort(attr, ascending = true, duplicate = false) {
            const children = duplicate ? this.duplicate() : this.children;
            children.sort((a, b) => {
                const valueA = a.toFloat(attr);
                const valueB = b.toFloat(attr);
                if (valueA === valueB) {
                    return 0;
                }
                if (ascending) {
                    return valueA < valueB ? -1 : 1;
                }
                else {
                    return valueA > valueB ? -1 : 1;
                }
            });
            return children;
        }
        cssPX(attr, value, negative = false, cache = false) {
            const current = this._styleMap[attr];
            if (current && $css$4.isLength(current)) {
                value += $css$4.parseUnit(current, this.fontSize);
                if (!negative && value < 0) {
                    value = 0;
                }
                const length = $css$4.formatPX(value);
                this.css(attr, length);
                if (cache) {
                    this.unsetCache(attr);
                }
                return length;
            }
            return '';
        }
        cssSpecificity(attr) {
            if (this.styleElement) {
                const element = this._element;
                const target = this.pseudoElement ? $session$2.getElementCache(element, 'pseudoType', this.sessionId) : '';
                const data = $session$2.getElementCache(element, `styleSpecificity${target ? '::' + target : ''}`, this.sessionId);
                if (data) {
                    return data[attr] || 0;
                }
            }
            return 0;
        }
        cssTry(attr, value) {
            if (this.styleElement) {
                const element = this._element;
                let current = this.css(attr);
                if (value === current) {
                    current = element.style[attr];
                }
                element.style[attr] = value;
                if (element.style[attr] === value) {
                    $session$2.setElementCache(element, attr, this.sessionId, current);
                    return true;
                }
            }
            return false;
        }
        cssFinally(attr) {
            if (this.styleElement) {
                const element = this._element;
                const value = $session$2.getElementCache(element, attr, this.sessionId);
                if (value) {
                    element.style[attr] = value;
                    $session$2.deleteElementCache(element, attr, this.sessionId);
                    return true;
                }
            }
            return false;
        }
        toInt(attr, initial = false, fallback = 0) {
            const value = parseInt((initial ? this._initial.styleMap : this._styleMap)[attr]);
            return isNaN(value) ? fallback : value;
        }
        toFloat(attr, initial = false, fallback = 0) {
            const value = parseFloat((initial ? this._initial.styleMap : this._styleMap)[attr]);
            return isNaN(value) ? fallback : value;
        }
        parseUnit(value, horizontal = true, parent = true) {
            if (value) {
                if ($css$4.isPercent(value)) {
                    const attr = horizontal ? 'width' : 'height';
                    let result = parseFloat(value) / 100;
                    if (parent) {
                        const absoluteParent = this.absoluteParent;
                        if (absoluteParent) {
                            if (absoluteParent.has(attr, 2 /* LENGTH */)) {
                                result *= horizontal ? absoluteParent.toFloat('width') : absoluteParent.toFloat('height');
                            }
                            else {
                                result *= absoluteParent.box[attr];
                            }
                            return result;
                        }
                    }
                    return result * (this.has(attr, 2 /* LENGTH */) ? this.toFloat(attr) : this.bounds[attr]);
                }
                return $css$4.parseUnit(value, this.fontSize);
            }
            return 0;
        }
        convertPX(value, horizontal = true, parent = true) {
            return `${Math.round(this.parseUnit(value, horizontal, parent))}px`;
        }
        has(attr, checkType = 0, options) {
            const value = (options && options.map === 'initial' ? this._initial.styleMap : this._styleMap)[attr];
            if (value) {
                switch (value) {
                    case '0px':
                        if ($util$7.hasBit(checkType, 64 /* ZERO */)) {
                            return true;
                        }
                        else {
                            switch (attr) {
                                case 'top':
                                case 'right':
                                case 'bottom':
                                case 'left':
                                    return true;
                            }
                        }
                    case 'left':
                        if ($util$7.hasBit(checkType, 8 /* LEFT */)) {
                            return true;
                        }
                    case 'baseline':
                        if ($util$7.hasBit(checkType, 16 /* BASELINE */)) {
                            return true;
                        }
                    case 'auto':
                        if ($util$7.hasBit(checkType, 4 /* AUTO */)) {
                            return true;
                        }
                    case 'none':
                    case 'initial':
                    case 'unset':
                    case 'normal':
                    case 'transparent':
                    case 'rgba(0, 0, 0, 0)':
                        return false;
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
                            if (options.all) {
                                return true;
                            }
                        }
                        if (checkType > 0) {
                            if ($util$7.hasBit(checkType, 2 /* LENGTH */) && $css$4.isLength(value)) {
                                return true;
                            }
                            if ($util$7.hasBit(checkType, 32 /* PERCENT */) && $css$4.isPercent(value)) {
                                return true;
                            }
                        }
                        return checkType === 0;
                }
            }
            return false;
        }
        hasAlign(value) {
            return $util$7.hasBit(this.alignmentType, value);
        }
        hasProcedure(value) {
            return !$util$7.hasBit(this.excludeProcedure, value);
        }
        hasResource(value) {
            return !$util$7.hasBit(this.excludeResource, value);
        }
        hasSection(value) {
            return !$util$7.hasBit(this.excludeSection, value);
        }
        exclude({ section = 0, procedure = 0, resource = 0 }) {
            if (section > 0 && !$util$7.hasBit(this._excludeSection, section)) {
                this._excludeSection |= section;
            }
            if (procedure > 0 && !$util$7.hasBit(this._excludeProcedure, procedure)) {
                this._excludeProcedure |= procedure;
            }
            if (resource > 0 && !$util$7.hasBit(this._excludeResource, resource)) {
                this._excludeResource |= resource;
            }
        }
        setExclusions() {
            if (this.styleElement) {
                const actualParent = this.actualParent;
                if (actualParent) {
                    const applyExclusions = (attr, enumeration) => {
                        let exclude = this.dataset[`exclude${attr}`] || '';
                        if (actualParent.dataset[`exclude${attr}Child`]) {
                            exclude += (exclude !== '' ? '|' : '') + actualParent.dataset[`exclude${attr}Child`];
                        }
                        if (exclude !== '') {
                            let offset = 0;
                            for (let name of exclude.split('|')) {
                                name = name.trim().toUpperCase();
                                if (enumeration[name] && !$util$7.hasBit(offset, enumeration[name])) {
                                    offset |= enumeration[name];
                                }
                            }
                            if (offset > 0) {
                                this.exclude({ [attr.toLowerCase()]: offset });
                            }
                        }
                    };
                    applyExclusions('Section', APP_SECTION);
                    applyExclusions('Procedure', NODE_PROCEDURE);
                    applyExclusions('Resource', NODE_RESOURCE);
                }
            }
        }
        setBounds(cache = true) {
            if (this.styleElement) {
                this._bounds = $dom$1.assignRect($session$2.getClientRect(this._element, this.sessionId, cache), true);
                if (this.documentBody) {
                    let marginTop = this.marginTop;
                    if (marginTop > 0) {
                        const firstChild = this.firstChild;
                        if (firstChild && firstChild.blockStatic && !firstChild.lineBreak && firstChild.marginTop >= marginTop) {
                            marginTop = 0;
                        }
                    }
                    this._bounds.top = marginTop;
                }
            }
            else if (this.plainText) {
                const rect = $session$2.getRangeClientRect(this._element, this.sessionId, cache);
                this._bounds = $dom$1.assignRect(rect, true);
                this._cached.multiline = rect.numberOfLines > 0;
            }
        }
        setInlineText(value, overwrite = false) {
            if (overwrite) {
                this._inlineText = value;
            }
            else if (this.htmlElement && !this.svgElement) {
                const element = this._element;
                switch (element.tagName) {
                    case 'INPUT':
                    case 'IMG':
                    case 'SELECT':
                    case 'TEXTAREA':
                    case 'HR':
                    case 'SVG':
                        break;
                    default:
                        this._inlineText = value;
                }
            }
        }
        appendTry(node, replacement, append = true) {
            let valid = false;
            for (let i = 0; i < this.length; i++) {
                if (this.children[i] === node) {
                    this.children[i] = replacement;
                    replacement.parent = this;
                    replacement.innerWrapped = node;
                    valid = true;
                    break;
                }
            }
            if (append) {
                replacement.parent = this;
                valid = true;
            }
            return valid;
        }
        modifyBox(region, offset, negative = true) {
            if (offset !== 0) {
                const attr = CSS_SPACING.get(region);
                if (attr) {
                    if (offset === null) {
                        this._boxReset[attr] = 1;
                    }
                    else if (!negative) {
                        if (this[attr] + this._boxAdjustment[attr] + offset <= 0) {
                            this._boxReset[attr] = 1;
                            this._boxAdjustment[attr] = 0;
                        }
                        else {
                            this._boxAdjustment[attr] += offset;
                        }
                    }
                    else {
                        this._boxAdjustment[attr] += offset;
                    }
                }
            }
        }
        getBox(region) {
            const attr = CSS_SPACING.get(region);
            return attr ? [this._boxReset[attr], this._boxAdjustment[attr]] : [0, 0];
        }
        resetBox(region, node, fromParent = false) {
            const applyReset = (attrs, start) => {
                for (let i = 0; i < attrs.length; i++) {
                    if (this._boxReset[attrs[i]] !== 1) {
                        this._boxReset[attrs[i]] = 1;
                        const attr = CSS_SPACING.get(CSS_SPACING_KEYS[i + start]);
                        const value = this[attr];
                        if (node && value !== 0) {
                            if (!node.naturalElement && node[attr] === 0) {
                                node.css(attr, $css$4.formatPX(value), true);
                            }
                            else {
                                node.modifyBox(CSS_SPACING_KEYS[i + (fromParent ? 0 : 4)], value);
                            }
                        }
                    }
                }
            };
            if ($util$7.hasBit(region, 30 /* MARGIN */)) {
                applyReset($css$4.BOX_MARGIN, 0);
            }
            if ($util$7.hasBit(region, 480 /* PADDING */)) {
                applyReset($css$4.BOX_PADDING, 4);
            }
        }
        inheritBox(region, node) {
            const applyReset = (attrs, start) => {
                for (let i = 0; i < attrs.length; i++) {
                    const value = this._boxAdjustment[attrs[i]];
                    if (value > 0) {
                        node.modifyBox(CSS_SPACING_KEYS[i + start], value, false);
                        this._boxAdjustment[attrs[i]] = 0;
                    }
                }
            };
            if ($util$7.hasBit(region, 30 /* MARGIN */)) {
                applyReset($css$4.BOX_MARGIN, 0);
            }
            if ($util$7.hasBit(region, 480 /* PADDING */)) {
                applyReset($css$4.BOX_PADDING, 4);
            }
        }
        previousSiblings(options = {}) {
            const { floating, pageFlow, lineBreak, excluded } = options;
            const result = [];
            let element = null;
            if (this._element) {
                element = this._element.previousSibling;
            }
            else if (this.actualChildren.length) {
                const children = $util$7.filterArray(this.actualChildren, node => node.pageFlow);
                element = children.length && children[0].element ? children[0].element.previousSibling : null;
            }
            while (element) {
                const node = $session$2.getElementAsNode(element, this.sessionId);
                if (node) {
                    if (lineBreak !== false && node.lineBreak || excluded !== false && node.excluded) {
                        result.push(node);
                    }
                    else if (!node.excluded && node.pageFlow) {
                        if (pageFlow === false) {
                            break;
                        }
                        result.push(node);
                        if (floating !== false || !node.floating && (node.visible || node.rendered)) {
                            break;
                        }
                    }
                }
                element = element.previousSibling;
            }
            return result;
        }
        nextSiblings(options = {}) {
            const { floating, pageFlow, lineBreak, excluded } = options;
            const result = [];
            let element = null;
            if (this._element) {
                element = this._element.nextSibling;
            }
            else if (this.actualChildren.length) {
                const children = $util$7.filterArray(this.actualChildren, node => node.pageFlow);
                if (children.length) {
                    const lastChild = children[children.length - 1];
                    element = lastChild.element && lastChild.element.nextSibling;
                }
            }
            while (element) {
                const node = $session$2.getElementAsNode(element, this.sessionId);
                if (node) {
                    if (lineBreak !== false && node.lineBreak || excluded !== false && node.excluded) {
                        result.push(node);
                    }
                    else if (!node.excluded && node.pageFlow) {
                        if (pageFlow === false) {
                            break;
                        }
                        result.push(node);
                        if (floating !== false || !node.floating && (node.visible || node.rendered)) {
                            break;
                        }
                    }
                }
                element = element.nextSibling;
            }
            return result;
        }
        getFirstChildElement(options = {}) {
            const { lineBreak, excluded } = options;
            if (this.htmlElement) {
                for (const node of this.actualChildren) {
                    if (!node.pseudoElement && (!node.excluded || lineBreak !== false && node.lineBreak || excluded !== false && node.excluded)) {
                        return node.element;
                    }
                }
            }
            return null;
        }
        getLastChildElement(options = {}) {
            const { lineBreak, excluded } = options;
            if (this.htmlElement) {
                const children = this.actualChildren;
                for (let i = children.length - 1; i >= 0; i--) {
                    const node = children[i];
                    if (!node.pseudoElement && (!node.excluded || lineBreak !== false && node.lineBreak || excluded !== false && node.excluded)) {
                        return node.element;
                    }
                }
            }
            return null;
        }
        actualRect(direction, dimension = 'linear') {
            let node;
            switch (direction) {
                case 'top':
                case 'left':
                    node = this.companion && !this.companion.visible && this.companion[dimension][direction] < this[dimension][direction] ? this.companion : this;
                    break;
                case 'right':
                case 'bottom':
                    node = this.companion && !this.companion.visible && this.companion[dimension][direction] > this[dimension][direction] ? this.companion : this;
                    break;
                default:
                    return NaN;
            }
            return node[dimension][direction];
        }
        setDimensions(dimension) {
            const bounds = this.unsafe(dimension);
            if (bounds) {
                bounds.width = this.bounds.width;
                if (this.plainText) {
                    bounds.height = bounds.bottom - bounds.top;
                }
                else {
                    bounds.height = this.bounds.height;
                    switch (dimension) {
                        case 'box':
                            bounds.width -= this.contentBoxWidth;
                            bounds.height -= this.contentBoxHeight;
                            break;
                        case 'linear':
                            bounds.width += (this.marginLeft > 0 ? this.marginLeft : 0) + this.marginRight;
                            bounds.height += (this.marginTop > 0 ? this.marginTop : 0) + this.marginBottom;
                            break;
                    }
                }
                if (this._initial[dimension] === undefined) {
                    this._initial[dimension] = $dom$1.assignRect(bounds);
                }
            }
        }
        convertPosition(attr) {
            let value = 0;
            if (!this.positionStatic) {
                const unit = this.cssInitial(attr, true);
                if ($css$4.isLength(unit) || $css$4.isPercent(unit)) {
                    value = $util$7.convertFloat(this.convertLength(attr, unit, attr === 'left' || attr === 'right'));
                }
            }
            return value;
        }
        convertBorderWidth(attr) {
            if (this.styleElement) {
                const style = this.css(`border${attr}Style`);
                if (style !== 'none') {
                    const width = Math.round($util$7.convertFloat(this.css(`border${attr}Width`)));
                    if (width === 2 && (style === 'inset' || style === 'outset')) {
                        return 1;
                    }
                    return width;
                }
            }
            return 0;
        }
        convertBox(region, direction) {
            const attr = region + direction;
            switch (this.display) {
                case 'table':
                    if (region === 'padding' && this.css('borderCollapse') === 'collapse') {
                        return 0;
                    }
                    break;
                case 'table-row':
                    return 0;
                case 'table-cell':
                    if (region === 'margin') {
                        return 0;
                    }
                    break;
            }
            return $util$7.convertFloat(this.convertLength(attr, this.css(attr), direction === 'Left' || direction === 'Right'));
        }
        convertLength(attr, value, horizontal, parent = true) {
            if ($css$4.isPercent(value)) {
                return $css$4.isLength(this.style[attr]) ? this.style[attr] : this.convertPX(value, horizontal, parent);
            }
            return value;
        }
        set parent(value) {
            if (value) {
                if (value !== this._parent) {
                    if (this._parent) {
                        this._parent.remove(this);
                    }
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
        set tagName(value) {
            this._cached.tagName = value.toUpperCase();
        }
        get tagName() {
            if (this._cached.tagName === undefined) {
                const element = this._element;
                let value = '';
                if (element) {
                    if (element.nodeName === '#text') {
                        value = 'PLAINTEXT';
                    }
                    else if (element.tagName === 'INPUT') {
                        value = element.type;
                    }
                    else {
                        value = element.tagName;
                    }
                }
                this._cached.tagName = value.toUpperCase();
            }
            return this._cached.tagName;
        }
        get element() {
            if (!this.naturalElement && this.innerWrapped) {
                const element = this.innerWrapped.unsafe('element');
                if (element) {
                    return element;
                }
            }
            return this._element;
        }
        get elementId() {
            return this._element ? this._element.id : '';
        }
        get htmlElement() {
            if (this._cached.htmlElement === undefined) {
                this._cached.htmlElement = this._element !== null && !this.plainText && !this.svgElement;
            }
            return this._cached.htmlElement;
        }
        get svgElement() {
            return this._element !== null && this._element.tagName === 'svg';
        }
        get styleElement() {
            return this.htmlElement || this.svgElement;
        }
        get naturalElement() {
            return this._element !== null && this._element.className !== '__squared.placeholder';
        }
        get pseudoElement() {
            return this._element !== null && this._element.className === '__squared.pseudo';
        }
        get imageElement() {
            return this.tagName === 'IMG';
        }
        get flexElement() {
            return this.display === 'flex' || this.display === 'inline-flex';
        }
        get gridElement() {
            return this.display === 'grid' || this.display === 'inline-grid';
        }
        get textElement() {
            return this.plainText || this.inlineText && !this.inputElement;
        }
        get tableElement() {
            return this.tagName === 'TABLE' || this.display === 'table';
        }
        get inputElement() {
            if (this._cached.inputElement === undefined) {
                const tagName = this.tagName;
                this._cached.inputElement = this._element !== null && this._element.tagName === 'INPUT' || tagName === 'BUTTON' || tagName === 'SELECT' || tagName === 'TEXTAREA';
            }
            return this._cached.inputElement;
        }
        get layoutElement() {
            return this.flexElement || this.gridElement;
        }
        get groupParent() {
            return false;
        }
        get plainText() {
            return this.tagName === 'PLAINTEXT';
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
            return this._bounds || $dom$1.newBoxRectDimension();
        }
        get linear() {
            if (this._linear === undefined && this._bounds) {
                if (this._element) {
                    const bounds = this._bounds;
                    this._linear = {
                        top: bounds.top - (this.marginTop > 0 ? this.marginTop : 0),
                        right: bounds.right + this.marginRight,
                        bottom: bounds.bottom + this.marginBottom,
                        left: bounds.left - (this.marginLeft > 0 ? this.marginLeft : 0),
                        width: 0,
                        height: 0
                    };
                }
                else {
                    this._linear = $dom$1.assignRect(this._bounds);
                }
                this.setDimensions('linear');
            }
            return this._linear || $dom$1.newBoxRectDimension();
        }
        get box() {
            if (this._box === undefined && this._bounds) {
                if (this._element) {
                    const bounds = this._bounds;
                    this._box = {
                        top: bounds.top + (this.paddingTop + this.borderTopWidth),
                        right: bounds.right - (this.paddingRight + this.borderRightWidth),
                        bottom: bounds.bottom - (this.paddingBottom + this.borderBottomWidth),
                        left: bounds.left + (this.paddingLeft + this.borderLeftWidth),
                        width: 0,
                        height: 0
                    };
                }
                else {
                    this._box = $dom$1.assignRect(this._bounds);
                }
                this.setDimensions('box');
            }
            return this._box || $dom$1.newBoxRectDimension();
        }
        set renderAs(value) {
            if (!this.rendered && value && !value.rendered) {
                this._renderAs = value;
            }
        }
        get renderAs() {
            return this._renderAs;
        }
        get dataset() {
            return this.htmlElement ? this._element.dataset : {};
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
        get extensions() {
            if (this._cached.extensions === undefined) {
                this._cached.extensions = this.dataset.use ? $util$7.spliceArray(this.dataset.use.split(/\s*,\s*/), value => value === '') : [];
            }
            return this._cached.extensions;
        }
        set flexbox(value) {
            this._cached.flexbox = value;
        }
        get flexbox() {
            if (this._cached.flexbox === undefined) {
                const actualParent = this.actualParent;
                const alignSelf = this.css('alignSelf');
                const justifySelf = this.css('justifySelf');
                const getFlexValue = (attr, initialValue, parent) => {
                    const value = (parent || this).css(attr);
                    if ($util$7.isNumber(value)) {
                        return parseFloat(value);
                    }
                    else if (value === 'inherit' && actualParent && parent === undefined) {
                        return getFlexValue(attr, initialValue, actualParent);
                    }
                    return initialValue;
                };
                this._cached.flexbox = {
                    alignSelf: alignSelf === 'auto' && actualParent && actualParent.has('alignItems', 16 /* BASELINE */, { all: true }) ? actualParent.css('alignItems') : alignSelf,
                    justifySelf: justifySelf === 'auto' && actualParent && actualParent.has('justifyItems') ? actualParent.css('justifyItems') : justifySelf,
                    basis: this.css('flexBasis'),
                    grow: getFlexValue('flexGrow', 0),
                    shrink: getFlexValue('flexShrink', 1),
                    order: this.toInt('order')
                };
            }
            return this._cached.flexbox;
        }
        get width() {
            if (this._cached.width === undefined) {
                this._cached.width = Math.max(this.parseUnit(this._styleMap.width), this.parseUnit(this._styleMap.minWidth));
            }
            return this._cached.width;
        }
        get height() {
            if (this._cached.height === undefined) {
                this._cached.height = Math.max(this.parseUnit(this._styleMap.height, false), this.parseUnit(this._styleMap.minHeight, false));
            }
            return this._cached.height;
        }
        get hasWidth() {
            return this.width > 0;
        }
        get hasHeight() {
            const value = this.cssInitial('height', true);
            if ($css$4.isPercent(value)) {
                const actualParent = this.actualParent;
                if (actualParent && actualParent.hasHeight) {
                    return parseFloat(value) > 0;
                }
                return false;
            }
            return this.height > 0;
        }
        get lineHeight() {
            if (this._cached.lineHeight === undefined) {
                if (!this.imageElement && !this.svgElement) {
                    let hasOwnStyle = this.has('lineHeight');
                    let lineHeight = 0;
                    if (hasOwnStyle) {
                        lineHeight = this.toFloat('lineHeight');
                    }
                    else if (this.naturalElement) {
                        lineHeight = $util$7.convertFloat(this.cssAscend('lineHeight', true));
                        if (!this.plainText) {
                            const element = (this.styleElement ? this._element : this.documentParent.element);
                            const fontSize = $session$2.getElementCache(element, 'fontSize', this.cssSpecificity('fontSize').toString());
                            if (fontSize && fontSize.endsWith('em')) {
                                const emSize = parseFloat(fontSize);
                                if (emSize < 1) {
                                    lineHeight *= emSize;
                                    this.css('lineHeight', $css$4.formatPX(lineHeight));
                                    hasOwnStyle = true;
                                }
                            }
                        }
                    }
                    this._cached.lineHeight = hasOwnStyle || lineHeight > this.actualHeight || this.multiline || this.block && this.actualChildren.some(node => node.textElement) ? lineHeight : 0;
                }
                else {
                    this._cached.lineHeight = 0;
                }
            }
            return this._cached.lineHeight;
        }
        get display() {
            return this.css('display');
        }
        get position() {
            return this.css('position');
        }
        set positionStatic(value) {
            this._cached.positionStatic = value;
            this.unsetCache('pageFlow');
        }
        get positionStatic() {
            if (this._cached.positionStatic === undefined) {
                switch (this.position) {
                    case 'fixed':
                    case 'absolute':
                        this._cached.positionStatic = false;
                        break;
                    case 'sticky':
                    case 'relative':
                        this._cached.positionStatic = !this.has('top') && !this.has('right') && !this.has('bottom') && !this.has('left');
                        if (this._cached.positionStatic) {
                            this._cached.positionRelative = false;
                        }
                        break;
                    case 'inherit':
                        const position = this._element ? $css$4.getInheritedStyle(this._element.parentElement, 'position') : '';
                        this._cached.positionStatic = position !== '' && !(position === 'absolute' || position === 'fixed');
                        break;
                    default:
                        this._cached.positionStatic = true;
                        break;
                }
            }
            return this._cached.positionStatic;
        }
        get positionRelative() {
            if (this._cached.positionRelative === undefined) {
                const value = this.position;
                this._cached.positionRelative = value === 'relative' || value === 'sticky';
            }
            return this._cached.positionRelative;
        }
        get positionAuto() {
            if (this._cached.positionAuto === undefined) {
                const styleMap = this._initial.iteration === -1 ? this._styleMap : this._initial.styleMap;
                this._cached.positionAuto = !this.pageFlow && ((styleMap.top === undefined || styleMap.top === 'auto') &&
                    (styleMap.right === undefined || styleMap.right === 'auto') &&
                    (styleMap.bottom === undefined || styleMap.bottom === 'auto') &&
                    (styleMap.left === undefined || styleMap.left === 'auto'));
            }
            return this._cached.positionAuto;
        }
        get top() {
            if (this._cached.top === undefined) {
                this._cached.top = this.convertPosition('top');
            }
            return this._cached.top;
        }
        get right() {
            if (this._cached.right === undefined) {
                this._cached.right = this.convertPosition('right');
            }
            return this._cached.right;
        }
        get bottom() {
            if (this._cached.bottom === undefined) {
                this._cached.bottom = this.convertPosition('bottom');
            }
            return this._cached.bottom;
        }
        get left() {
            if (this._cached.left === undefined) {
                this._cached.left = this.convertPosition('left');
            }
            return this._cached.left;
        }
        get marginTop() {
            if (this._cached.marginTop === undefined) {
                this._cached.marginTop = this.inlineStatic ? 0 : this.convertBox('margin', 'Top');
            }
            return this._cached.marginTop;
        }
        get marginRight() {
            if (this._cached.marginRight === undefined) {
                this._cached.marginRight = this.convertBox('margin', 'Right');
            }
            return this._cached.marginRight;
        }
        get marginBottom() {
            if (this._cached.marginBottom === undefined) {
                this._cached.marginBottom = this.inlineStatic || this.bounds.height === 0 && this.every(node => !node.pageFlow || node.floating && node.css('clear') === 'none') && !this.overflowY ? 0 : this.convertBox('margin', 'Bottom');
            }
            return this._cached.marginBottom;
        }
        get marginLeft() {
            if (this._cached.marginLeft === undefined) {
                this._cached.marginLeft = this.convertBox('margin', 'Left');
            }
            return this._cached.marginLeft;
        }
        get borderTopWidth() {
            if (this._cached.borderTopWidth === undefined) {
                this._cached.borderTopWidth = this.convertBorderWidth('Top');
            }
            return this._cached.borderTopWidth;
        }
        get borderRightWidth() {
            if (this._cached.borderRightWidth === undefined) {
                this._cached.borderRightWidth = this.convertBorderWidth('Right');
            }
            return this._cached.borderRightWidth;
        }
        get borderBottomWidth() {
            if (this._cached.borderBottomWidth === undefined) {
                this._cached.borderBottomWidth = this.convertBorderWidth('Bottom');
            }
            return this._cached.borderBottomWidth;
        }
        get borderLeftWidth() {
            if (this._cached.borderLeftWidth === undefined) {
                this._cached.borderLeftWidth = this.convertBorderWidth('Left');
            }
            return this._cached.borderLeftWidth;
        }
        get paddingTop() {
            if (this._cached.paddingTop === undefined) {
                const value = this.convertBox('padding', 'Top');
                if (this.length && value > 0 && !this.layoutElement) {
                    let top = 0;
                    for (const node of this) {
                        if (node.inline) {
                            top = Math.max(top, node.paddingTop);
                        }
                        else {
                            top = 0;
                            break;
                        }
                    }
                    this._cached.paddingTop = Math.max(0, value - top);
                }
                else {
                    this._cached.paddingTop = value;
                }
            }
            return this._cached.paddingTop;
        }
        get paddingRight() {
            if (this._cached.paddingRight === undefined) {
                this._cached.paddingRight = this.convertBox('padding', 'Right');
            }
            return this._cached.paddingRight;
        }
        get paddingBottom() {
            if (this._cached.paddingBottom === undefined) {
                const value = this.convertBox('padding', 'Bottom');
                if (this.length && value > 0 && !this.layoutElement) {
                    let bottom = 0;
                    for (const node of this) {
                        if (node.inline) {
                            bottom = Math.max(bottom, node.paddingBottom);
                        }
                        else {
                            bottom = 0;
                            break;
                        }
                    }
                    this._cached.paddingBottom = Math.max(0, value - bottom);
                }
                else {
                    this._cached.paddingBottom = value;
                }
            }
            return this._cached.paddingBottom;
        }
        get paddingLeft() {
            if (this._cached.paddingLeft === undefined) {
                this._cached.paddingLeft = this.convertBox('padding', 'Left');
            }
            return this._cached.paddingLeft;
        }
        get contentBox() {
            return this.css('boxSizing') !== 'border-box';
        }
        get contentBoxWidth() {
            if (this._cached.contentBoxWidth === undefined) {
                this._cached.contentBoxWidth = this.tableElement && this.css('borderCollapse') === 'collapse' ? 0 : this.borderLeftWidth + this.paddingLeft + this.paddingRight + this.borderRightWidth;
            }
            return this._cached.contentBoxWidth;
        }
        get contentBoxHeight() {
            if (this._cached.contentBoxHeight === undefined) {
                this._cached.contentBoxHeight = this.tableElement && this.css('borderCollapse') === 'collapse' ? 0 : this.borderTopWidth + this.paddingTop + this.paddingBottom + this.borderBottomWidth;
            }
            return this._cached.contentBoxHeight;
        }
        get inline() {
            if (this._cached.inline === undefined) {
                const value = this.display;
                this._cached.inline = value === 'inline' || (value === 'initial' || value === 'unset') && !$dom$1.ELEMENT_BLOCK.includes(this.tagName);
            }
            return this._cached.inline;
        }
        get inlineStatic() {
            if (this._cached.inlineStatic === undefined) {
                this._cached.inlineStatic = this.inline && this.pageFlow && !this.floating && !this.imageElement;
            }
            return this._cached.inlineStatic;
        }
        get inlineVertical() {
            if (this._cached.inlineVertical === undefined) {
                const display = this.display;
                this._cached.inlineVertical = (display.startsWith('inline') || display === 'table-cell') && !this.floating && !this.plainText;
            }
            return this._cached.inlineVertical;
        }
        get inlineText() {
            return this._inlineText;
        }
        get block() {
            if (this._cached.block === undefined) {
                const value = this.display;
                switch (value) {
                    case 'block':
                    case 'flex':
                    case 'grid':
                    case 'list-item':
                        this._cached.block = true;
                        break;
                    case 'initial':
                        this._cached.block = $dom$1.ELEMENT_BLOCK.includes(this.tagName);
                        break;
                    default:
                        this._cached.block = false;
                        break;
                }
            }
            return this._cached.block;
        }
        get blockStatic() {
            if (this._cached.blockStatic === undefined) {
                this._cached.blockStatic = this.pageFlow && this.block && (!this.floating || this.cssInitial('width') === '100%' && !this.has('maxWidth')) || this.hasAlign(64 /* BLOCK */);
            }
            return this._cached.blockStatic;
        }
        get blockDimension() {
            if (this._cached.blockDimension === undefined) {
                const value = this.display;
                this._cached.blockDimension = this.block || value.startsWith('inline-') || value === 'table' || this.imageElement;
            }
            return this._cached.blockDimension;
        }
        get pageFlow() {
            if (this._cached.pageFlow === undefined) {
                this._cached.pageFlow = this.positionStatic || this.positionRelative;
            }
            return this._cached.pageFlow;
        }
        get inlineFlow() {
            if (this._cached.inlineFlow === undefined) {
                const display = this.display;
                this._cached.inlineFlow = this.inline || display.startsWith('inline') || display === 'table-cell' || this.imageElement || this.floating;
            }
            return this._cached.inlineFlow;
        }
        get centerAligned() {
            if (this._cached.centerAligned === undefined) {
                this._cached.centerAligned = this.autoMargin.leftRight || this.textElement && this.blockStatic && this.cssInitial('textAlign') === 'center';
            }
            return this._cached.centerAligned;
        }
        get rightAligned() {
            if (this._cached.rightAligned === undefined) {
                this._cached.rightAligned = this.float === 'right' || this.autoMargin.left || !this.pageFlow && this.has('right') || this.textElement && this.blockStatic && this.cssInitial('textAlign') === 'right';
            }
            return this._cached.rightAligned || this.hasAlign(1024 /* RIGHT */);
        }
        get bottomAligned() {
            if (this._cached.bottomAligned === undefined) {
                this._cached.bottomAligned = !this.pageFlow && this.has('bottom') && this.bottom >= 0;
            }
            return this._cached.bottomAligned;
        }
        get horizontalAligned() {
            if (this._cached.horizontalAligned === undefined) {
                this._cached.horizontalAligned = !this.blockStatic && !this.autoMargin.horizontal && !(this.blockDimension && this.css('width') === '100%');
            }
            return this._cached.horizontalAligned;
        }
        get autoMargin() {
            if (this._cached.autoMargin === undefined) {
                if (!this.pageFlow || this.blockStatic || this.display === 'table') {
                    const styleMap = this._initial.iteration === -1 ? this._styleMap : this._initial.styleMap;
                    const left = styleMap.marginLeft === 'auto' && (this.pageFlow || this.has('right'));
                    const right = styleMap.marginRight === 'auto' && (this.pageFlow || this.has('left'));
                    const top = styleMap.marginTop === 'auto' && (this.pageFlow || this.has('bottom'));
                    const bottom = styleMap.marginBottom === 'auto' && (this.pageFlow || this.has('top'));
                    this._cached.autoMargin = {
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
                    this._cached.autoMargin = {
                        horizontal: false,
                        left: false,
                        right: false,
                        leftRight: false,
                        top: false,
                        bottom: false,
                        vertical: false,
                        topBottom: false
                    };
                }
            }
            return this._cached.autoMargin;
        }
        get floating() {
            if (this._cached.floating === undefined) {
                if (this.pageFlow) {
                    this._cached.floating = this.cssAny('float', 'left', 'right');
                }
                else {
                    this._cached.floating = false;
                }
            }
            return this._cached.floating;
        }
        get float() {
            if (this._cached.float === undefined) {
                this._cached.float = this.floating ? this.css('float') : 'none';
            }
            return this._cached.float;
        }
        get zIndex() {
            return this.toInt('zIndex');
        }
        set textContent(value) {
            this._cached.textContent = value;
        }
        get textContent() {
            if (this._cached.textContent === undefined) {
                this._cached.textContent = (this.htmlElement || this.plainText) && this._element.textContent || '';
            }
            return this._cached.textContent;
        }
        get textEmpty() {
            return this.inlineText && (this.textContent === '' || !this.preserveWhiteSpace && this.textContent.trim() === '');
        }
        get src() {
            const element = this._element;
            if (element && (this.imageElement || element.type === 'image')) {
                return element.src;
            }
            return '';
        }
        set overflow(value) {
            if (value === 0 || value === 16 /* VERTICAL */ || value === 8 /* HORIZONTAL */ || value === (8 /* HORIZONTAL */ | 16 /* VERTICAL */)) {
                this._cached.overflow = value;
            }
        }
        get overflow() {
            if (this._cached.overflow === undefined) {
                const element = this._element;
                let value = 0;
                if (!this.documentBody) {
                    const overflow = this.css('overflow');
                    const overflowX = this.css('overflowX');
                    const overflowY = this.css('overflowY');
                    if (this.has('width') && (overflow === 'scroll' || overflowX === 'scroll' || overflowX === 'auto' && element && element.clientWidth !== element.scrollWidth)) {
                        value |= 8 /* HORIZONTAL */;
                    }
                    if (this.has('height') && (overflow === 'scroll' || overflowY === 'scroll' || overflowY === 'auto' && element && element.clientHeight !== element.scrollHeight)) {
                        value |= 16 /* VERTICAL */;
                    }
                }
                this._cached.overflow = value;
            }
            return this._cached.overflow;
        }
        get overflowX() {
            return $util$7.hasBit(this.overflow, 8 /* HORIZONTAL */);
        }
        get overflowY() {
            return $util$7.hasBit(this.overflow, 16 /* VERTICAL */);
        }
        set baseline(value) {
            this._cached.baseline = value;
        }
        get baseline() {
            if (this._cached.baseline === undefined) {
                const value = this.verticalAlign;
                const initialValue = this.cssInitial('verticalAlign');
                this._cached.baseline = this.pageFlow && !this.floating && !this.svgElement && (value === 'baseline' || value === 'initial' || $css$4.isLength(initialValue) && parseInt(initialValue) === 0);
            }
            return this._cached.baseline;
        }
        get verticalAlign() {
            if (this._cached.verticalAlign === undefined) {
                let value = this.css('verticalAlign');
                if ($css$4.isPercent(value)) {
                    value = $css$4.formatPX(parseInt(value) / 100 * this.bounds.height);
                }
                this._cached.verticalAlign = value;
            }
            return this._cached.verticalAlign;
        }
        set multiline(value) {
            this._cached.multiline = value;
        }
        get multiline() {
            if (this._cached.multiline === undefined) {
                this._cached.multiline = this.plainText || this.inlineText && (this.inlineFlow || this.length === 0) ? $session$2.getRangeClientRect(this._element, this.sessionId).numberOfLines > 0 : false;
            }
            return this._cached.multiline;
        }
        get positiveAxis() {
            if (this._cached.positiveAxis === undefined) {
                this._cached.positiveAxis = (!this.positionRelative || this.positionRelative && this.top >= 0 && this.left >= 0 && (this.right <= 0 || this.has('left')) && (this.bottom <= 0 || this.has('top'))) && this.marginTop >= 0 && this.marginLeft >= 0 && this.marginRight >= 0;
            }
            return this._cached.positiveAxis;
        }
        get leftTopAxis() {
            return this.absoluteParent === this.documentParent || this.position === 'fixed';
        }
        set renderExclude(value) {
            this._cached.renderExclude = value;
        }
        get renderExclude() {
            if (this._cached.renderExclude === undefined) {
                this._cached.renderExclude = (this.pseudoElement && this.css('content') === '""' && this.contentBoxWidth === 0 && this.contentBoxHeight === 0 ||
                    this.bounds.height === 0 && (this.marginTop < 0 || this.marginBottom < 0));
            }
            return this._cached.renderExclude;
        }
        get visibleStyle() {
            if (this._cached.visibleStyle === undefined) {
                const borderWidth = this.borderTopWidth > 0 || this.borderRightWidth > 0 || this.borderBottomWidth > 0 || this.borderLeftWidth > 0;
                const backgroundImage = $regex$1.CSS.URL.test(this.css('backgroundImage')) || $regex$1.CSS.URL.test(this.css('background'));
                const backgroundColor = this.has('backgroundColor');
                this._cached.visibleStyle = {
                    padding: this.paddingTop > 0 || this.paddingRight > 0 || this.paddingBottom > 0 || this.paddingLeft > 0,
                    background: borderWidth || backgroundImage || backgroundColor,
                    borderWidth,
                    backgroundImage,
                    backgroundColor,
                    backgroundRepeat: this.css('backgroundRepeat') !== 'no-repeat'
                };
            }
            return this._cached.visibleStyle;
        }
        get preserveWhiteSpace() {
            if (this._cached.preserveWhiteSpace === undefined) {
                const value = this.css('whiteSpace');
                this._cached.preserveWhiteSpace = value === 'pre' || value === 'pre-wrap';
            }
            return this._cached.preserveWhiteSpace;
        }
        get layoutHorizontal() {
            return this.hasAlign(8 /* HORIZONTAL */);
        }
        get layoutVertical() {
            return this.hasAlign(16 /* VERTICAL */);
        }
        set controlName(value) {
            if (!this.rendered || this._controlName === undefined) {
                this._controlName = value;
            }
        }
        get controlName() {
            return this._controlName || '';
        }
        set documentParent(value) {
            this._documentParent = value;
        }
        get documentParent() {
            return this._documentParent || this.actualParent || this.parent || this;
        }
        get absoluteParent() {
            if (this._cached.absoluteParent === undefined) {
                let current = this.actualParent;
                if (!this.pageFlow) {
                    while (current && current.id !== 0) {
                        const position = current.cssInitial('position', false, true);
                        if (current.documentBody || position !== 'static' && position !== 'initial' && position !== 'unset') {
                            break;
                        }
                        current = current.actualParent;
                    }
                }
                this._cached.absoluteParent = current || null;
            }
            return this._cached.absoluteParent;
        }
        get actualParent() {
            if (this._cached.actualParent === undefined) {
                this._cached.actualParent = this._element && this._element.parentElement && $session$2.getElementAsNode(this._element.parentElement, this.sessionId) || null;
            }
            return this._cached.actualParent;
        }
        set actualChildren(value) {
            this._cached.actualChildren = value;
        }
        get actualChildren() {
            if (this._cached.actualChildren === undefined) {
                if (this.htmlElement && this.naturalElement) {
                    const actualChildren = [];
                    this._element.childNodes.forEach((element) => {
                        const node = $session$2.getElementAsNode(element, this.sessionId);
                        if (node) {
                            actualChildren.push(node);
                        }
                    });
                    this._cached.actualChildren = actualChildren;
                }
                else {
                    this._cached.actualChildren = this._initial.children;
                }
            }
            return this._cached.actualChildren;
        }
        get actualWidth() {
            if (this._cached.actualWidth === undefined) {
                if (this.plainText) {
                    this._cached.actualWidth = this.bounds.right - this.bounds.left;
                }
                else if (!this.documentParent.flexElement && this.display !== 'table-cell') {
                    let width = this.parseUnit(this.cssInitial('width', true));
                    if (width > 0) {
                        const maxWidth = this.parseUnit(this.css('maxWidth'));
                        if (maxWidth > 0) {
                            width = Math.min(width, maxWidth);
                        }
                        if (this.contentBox && !this.tableElement) {
                            width += this.contentBoxWidth;
                        }
                        this._cached.actualWidth = width;
                        return width;
                    }
                }
                this._cached.actualWidth = this.bounds.width;
            }
            return this._cached.actualWidth;
        }
        get actualHeight() {
            if (this._cached.actualHeight === undefined) {
                if (this.plainText) {
                    this._cached.actualHeight = this.bounds.bottom - this.bounds.top;
                }
                else if (!this.documentParent.flexElement && this.display !== 'table-cell') {
                    let height = this.parseUnit(this.cssInitial('height', true), false);
                    if (height > 0) {
                        const maxHeight = this.parseUnit(this.css('maxHeight'));
                        if (maxHeight > 0) {
                            height = Math.min(height, maxHeight);
                        }
                        if (this.contentBox && !this.tableElement) {
                            height += this.contentBoxHeight;
                        }
                        this._cached.actualHeight = height;
                        return height;
                    }
                }
                this._cached.actualHeight = this.bounds.height;
            }
            return this._cached.actualHeight;
        }
        get actualDimension() {
            return { width: this.actualWidth, height: this.actualHeight };
        }
        get firstChild() {
            if (this.actualChildren.length) {
                return this.actualChildren[0];
            }
            return null;
        }
        get lastChild() {
            if (this.actualChildren.length) {
                return this.actualChildren[this.actualChildren.length - 1];
            }
            return null;
        }
        get singleChild() {
            if (this.renderParent) {
                return this.renderParent.length === 1;
            }
            else if (this.parent && this.parent.id !== 0) {
                return this.parent.length === 1;
            }
            return false;
        }
        get previousSibling() {
            if (this._cached.previousSibling === undefined) {
                if (this.naturalElement) {
                    let element = this._element.previousSibling;
                    while (element) {
                        const node = $session$2.getElementAsNode(element, this.sessionId);
                        if (node && (!node.excluded || node.lineBreak)) {
                            this._cached.previousSibling = node;
                            return node;
                        }
                        element = element.previousSibling;
                    }
                }
                this._cached.previousSibling = null;
            }
            return this._cached.previousSibling;
        }
        get nextSibling() {
            if (this._cached.nextSibling === undefined) {
                if (this.naturalElement) {
                    let element = this._element.nextSibling;
                    while (element) {
                        const node = $session$2.getElementAsNode(element, this.sessionId);
                        if (node && (!node.excluded || node.lineBreak)) {
                            this._cached.nextSibling = node;
                            return node;
                        }
                        element = element.nextSibling;
                    }
                }
                this._cached.nextSibling = null;
            }
            return this._cached.nextSibling;
        }
        set dir(value) {
            this._cached.dir = value;
        }
        get dir() {
            if (this._cached.dir === undefined) {
                let value = this.naturalElement && this.styleElement && !this.pseudoElement ? this._element.dir : '';
                switch (value) {
                    case 'ltr':
                    case 'rtl':
                        break;
                    default:
                        let parent = this.actualParent;
                        while (parent) {
                            value = parent.dir;
                            if (value) {
                                this._cached.dir = value;
                                break;
                            }
                            parent = parent.actualParent;
                        }
                        break;
                }
                this._cached.dir = value || document.body.dir;
            }
            return this._cached.dir;
        }
        get nodes() {
            return this.rendered ? this.renderChildren : this.children;
        }
        get center() {
            return {
                x: this.bounds.left + Math.floor(this.bounds.width / 2),
                y: this.bounds.top + Math.floor(this.actualHeight / 2)
            };
        }
    }

    class NodeGroup extends Node {
        init() {
            if (this.length) {
                let siblingIndex = Number.POSITIVE_INFINITY;
                for (const item of this) {
                    siblingIndex = Math.min(siblingIndex, item.siblingIndex);
                    item.parent = this;
                }
                if (this.siblingIndex === Number.POSITIVE_INFINITY) {
                    this.siblingIndex = siblingIndex;
                }
                if (this.parent) {
                    this.parent.sort(NodeList.siblingIndex);
                }
                this.setBounds();
                this.saveAsInitial();
                if (this.actualParent) {
                    this.dir = this.actualParent.dir;
                }
            }
        }
        setBounds() {
            if (this.length) {
                const bounds = NodeList.outerRegion(this);
                this._bounds = Object.assign({}, bounds, { width: bounds.right - bounds.left, height: bounds.bottom - bounds.top });
            }
        }
        previousSiblings(options = {}) {
            const node = this.item(0);
            return node ? node.previousSiblings(options) : [];
        }
        nextSiblings(options = {}) {
            const node = this.item();
            return node ? node.nextSiblings(options) : [];
        }
        get block() {
            if (this._cached.block === undefined) {
                this._cached.block = this.some(node => node.block);
            }
            return this._cached.block;
        }
        get blockStatic() {
            if (this._cached.blockStatic === undefined) {
                const value = this.actualChildren.length && this.actualChildren[0].blockStatic || this.actualWidth === this.documentParent.actualWidth || this.hasAlign(64 /* BLOCK */) || this.layoutVertical && this.some(node => node.blockStatic) || this.documentParent.blockStatic && this.hasAlign(256 /* COLUMN */);
                if (!value && this.containerType === 0) {
                    return false;
                }
                this._cached.blockStatic = value;
            }
            return this._cached.blockStatic;
        }
        get blockDimension() {
            if (this._cached.blockDimension === undefined) {
                this._cached.blockDimension = this.some(node => node.blockDimension);
            }
            return this._cached.blockDimension;
        }
        get inline() {
            if (this._cached.inline === undefined) {
                this._cached.inline = this.every(node => node.inline);
            }
            return this._cached.inline;
        }
        get inlineStatic() {
            if (this._cached.inlineStatic === undefined) {
                this._cached.inlineStatic = this.every(node => node.inlineStatic);
            }
            return this._cached.inlineStatic;
        }
        get inlineVertical() {
            if (this._cached.inlineVertical === undefined) {
                this._cached.inlineVertical = this.every(node => node.inlineVertical);
            }
            return this._cached.inlineVertical;
        }
        get inlineFlow() {
            if (this._cached.inlineStatic === undefined) {
                this._cached.inlineStatic = this.hasAlign(128 /* SEGMENTED */) || this.inlineStatic;
            }
            return this._cached.inlineStatic;
        }
        get pageFlow() {
            if (this._cached.pageFlow === undefined) {
                this._cached.pageFlow = this.every(node => node.pageFlow);
            }
            return this._cached.pageFlow;
        }
        get baseline() {
            if (this._cached.baseline === undefined) {
                const value = this.cssInitial('verticalAlign', true);
                if (value !== '') {
                    this._cached.baseline = value === 'baseline';
                }
                else {
                    this._cached.baseline = this.every(node => node.baseline);
                }
            }
            return this._cached.baseline;
        }
        get float() {
            if (this._cached.float === undefined) {
                if (this.floating) {
                    this._cached.float = this.hasAlign(1024 /* RIGHT */) ? 'right' : 'left';
                }
                else {
                    this._cached.float = 'none';
                }
            }
            return this._cached.float;
        }
        get floating() {
            if (this._cached.floating === undefined) {
                this._cached.floating = this.every(node => node.naturalElement && node.floating);
            }
            return this._cached.floating;
        }
        get display() {
            return (this.css('display') ||
                this.some(node => node.blockStatic) ? 'block'
                : this.some(node => node.blockDimension || node.inlineVertical) ? 'inline-block' : 'inline');
        }
        get actualParent() {
            if (this._cached.actualParent === undefined) {
                this._cached.actualParent = NodeList.actualParent(this._initial.children);
            }
            return this._cached.actualParent;
        }
        get groupParent() {
            return true;
        }
        get multiline() {
            return false;
        }
    }

    const $color$1 = squared.lib.color;
    const $client$1 = squared.lib.client;
    const $css$5 = squared.lib.css;
    const $math = squared.lib.math;
    const $regex$2 = squared.lib.regex;
    const $session$3 = squared.lib.session;
    const $util$8 = squared.lib.util;
    const STRING_COLORSTOP = `(rgba?\\(\\d+, \\d+, \\d+(?:, [\\d.]+)?\\)|#[a-zA-Z\\d]{3,8}|[a-z]+)\\s*(${$regex$2.STRING.LENGTH_PERCENTAGE}|${$regex$2.STRING.CSS_ANGLE}|(?:${$regex$2.STRING.CSS_CALC}(?=,)|${$regex$2.STRING.CSS_CALC}))?,?\\s*`;
    const REGEXP_BACKGROUNDIMAGE = new RegExp(`(?:initial|url\\([^)]+\\)|(repeating)?-?(linear|radial|conic)-gradient\\(((?:to [a-z ]+|(?:from )?-?[\\d.]+(?:deg|rad|turn|grad)|(?:circle|ellipse)?\\s*(?:closest-side|closest-corner|farthest-side|farthest-corner)?)?(?:\\s*at [\\w %]+)?),?\\s*((?:${STRING_COLORSTOP})+)\\))`, 'g');
    const REGEXP_LINEBREAK = /\s*<br[^>]*>\s*/g;
    function removeExcluded(node, element, attr) {
        let value = element[attr];
        const length = node.actualChildren.length;
        for (let i = 0; i < length; i++) {
            const item = node.actualChildren[i];
            if (item.excluded || item.pseudoElement || !item.pageFlow || item.dataset.target) {
                if ($util$8.isString(item[attr])) {
                    value = value.replace(item[attr], '');
                }
                else if (i === 0) {
                    value = $util$8.trimStart(value, ' ');
                }
                else if (i === length - 1) {
                    value = $util$8.trimEnd(value, ' ');
                }
            }
        }
        if (attr === 'innerHTML') {
            value = value.replace($regex$2.ESCAPE.ENTITY, (match, capture) => String.fromCharCode(parseInt(capture)));
        }
        return value;
    }
    function parseColorStops(node, gradient, value, opacity) {
        const radial = gradient;
        const repeating = radial.repeating === true;
        const extent = repeating && gradient.type === 'radial' ? radial.radiusExtent / radial.radius : 1;
        const result = [];
        const pattern = new RegExp(STRING_COLORSTOP, 'g');
        let match;
        while ((match = pattern.exec(value)) !== null) {
            const color = $color$1.parseColor(match[1], opacity, true);
            if (color) {
                const item = { color, offset: -1 };
                if (gradient.type === 'conic') {
                    if (match[3] && match[4]) {
                        item.offset = $css$5.convertAngle(match[3], match[4]) / 360;
                    }
                }
                else if (match[2]) {
                    if ($css$5.isPercent(match[2])) {
                        item.offset = parseFloat(match[2]) / 100;
                    }
                    else if (repeating) {
                        const horizontal = radial.horizontal;
                        const dimension = gradient.type === 'radial' ? radial.radius : gradient.dimension[horizontal ? 'width' : 'height'];
                        if ($css$5.isLength(match[2])) {
                            item.offset = node.parseUnit(match[2], horizontal, false) / dimension;
                        }
                        else if ($css$5.isCalc(match[2])) {
                            item.offset = $css$5.calculate(match[6], dimension, node.fontSize) / dimension;
                        }
                    }
                    if (repeating && item.offset !== -1) {
                        item.offset *= extent;
                    }
                }
                if (result.length === 0) {
                    if (item.offset === -1) {
                        item.offset = 0;
                    }
                    else if (item.offset > 0) {
                        result.push({ color, offset: 0 });
                    }
                }
                result.push(item);
            }
        }
        const lastStop = result[result.length - 1];
        if (lastStop.offset === -1) {
            lastStop.offset = 1;
        }
        let percent = 0;
        for (let i = 0; i < result.length; i++) {
            const item = result[i];
            if (item.offset === -1) {
                if (i === 0) {
                    item.offset = 0;
                }
                else {
                    for (let j = i + 1, k = 2; j < result.length - 1; j++, k++) {
                        if (result[j].offset !== -1) {
                            item.offset = (percent + result[j].offset) / k;
                            break;
                        }
                    }
                    if (item.offset === -1) {
                        item.offset = percent + lastStop.offset / (result.length - 1);
                    }
                }
            }
            percent = item.offset;
        }
        if (repeating) {
            if (percent < 100) {
                const original = result.slice(0);
                complete: {
                    let basePercent = percent;
                    while (percent < 100) {
                        for (let i = 0; i < original.length; i++) {
                            percent = Math.min(basePercent + original[i].offset, 1);
                            result.push(Object.assign({}, original[i], { offset: percent }));
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
            result.push(Object.assign({}, result[result.length - 1], { offset: 1 }));
        }
        return result;
    }
    function parseAngle(value) {
        if (value) {
            let degree = $css$5.parseAngle(value.trim());
            if (degree < 0) {
                degree += 360;
            }
            return degree;
        }
        return 0;
    }
    function replaceWhiteSpace(parent, node, element, value) {
        value = value.replace($regex$2.ESCAPE.U00A0, '&#160;');
        switch (node.css('whiteSpace')) {
            case 'nowrap':
                value = value.replace(/\n/g, ' ');
                break;
            case 'pre':
            case 'pre-wrap':
                if (!parent.layoutVertical) {
                    value = value.replace(/^\s*?\n/, '');
                }
                value = value
                    .replace(/\n/g, '\\n')
                    .replace(/\s/g, '&#160;');
                break;
            case 'pre-line':
                value = value
                    .replace(/\n/g, '\\n')
                    .replace(/\s+/g, ' ');
                break;
            default:
                if (element.previousSibling && $session$3.causesLineBreak(element.previousSibling, node.sessionId)) {
                    value = value.replace($regex$2.CHAR.LEADINGSPACE, '');
                }
                if (element.nextSibling && $session$3.causesLineBreak(element.nextSibling, node.sessionId)) {
                    value = value.replace($regex$2.CHAR.TRAILINGSPACE, '');
                }
                return [value, false];
        }
        return [value, true];
    }
    function getBackgroundSize(node, index, value) {
        if (value) {
            const sizes = value.split($regex$2.XML.SEPARATOR);
            return Resource.getBackgroundSize(node, sizes[index % sizes.length]);
        }
        return undefined;
    }
    function applyTextTransform(type, value) {
        if (type === 'none' || type === 'initial') {
            return value;
        }
        const words = value.split($regex$2.XML.BREAKWORD);
        switch (type) {
            case 'uppercase':
                for (const word of words) {
                    if (!$regex$2.XML.ENTITY.test(word)) {
                        value = value.replace(word, word.toUpperCase());
                    }
                }
                break;
            case 'lowercase':
                for (const word of words) {
                    if (!$regex$2.XML.ENTITY.test(word)) {
                        value = value.replace(word, word.toLowerCase());
                    }
                }
                break;
            case 'capitalize':
                for (const word of words) {
                    value = value.replace(word, $util$8.capitalize(word));
                }
                break;
        }
        return value;
    }
    const getGradientPosition = (value) => value ? /(.+?)?\s*at (.+?)$/.exec(value) : null;
    class Resource {
        constructor(application, cache) {
            this.application = application;
            this.cache = cache;
        }
        static generateId(section, name, start = 1) {
            const prefix = name;
            let i = start;
            if (start === 1) {
                name += `_${i.toString()}`;
            }
            const previous = this.ASSETS.ids.get(section) || [];
            do {
                if (!previous.includes(name)) {
                    previous.push(name);
                    break;
                }
                else {
                    name = `${prefix}_${(++i).toString()}`;
                }
            } while (true);
            this.ASSETS.ids.set(section, previous);
            return name;
        }
        static insertStoredAsset(asset, name, value) {
            const stored = Resource.STORED[asset];
            if (stored && $util$8.hasValue(value)) {
                let result = this.getStoredName(asset, value);
                if (result === '') {
                    if ($util$8.isNumber(name)) {
                        name = `__${name}`;
                    }
                    let i = 0;
                    do {
                        result = name;
                        if (i > 0) {
                            result += `_${i}`;
                        }
                        if (!stored.has(result)) {
                            stored.set(result, value);
                        }
                        i++;
                    } while (stored.has(result) && stored.get(result) !== value);
                }
                return result;
            }
            return '';
        }
        static getOptionArray(element) {
            const stringArray = [];
            const textTransform = $css$5.getStyle(element).getPropertyValue('text-transform');
            let numberArray = [];
            let i = -1;
            while (++i < element.children.length) {
                const item = element.children[i];
                const value = item.text.trim();
                if (value !== '') {
                    if (numberArray && stringArray.length === 0 && $util$8.isNumber(value)) {
                        numberArray.push(value);
                    }
                    else {
                        if (numberArray && numberArray.length) {
                            i = -1;
                            numberArray = undefined;
                            continue;
                        }
                        if (value !== '') {
                            stringArray.push(applyTextTransform(textTransform, value));
                        }
                    }
                }
            }
            return [stringArray.length ? stringArray : undefined, numberArray && numberArray.length ? numberArray : undefined];
        }
        static isBackgroundVisible(object) {
            return object !== undefined && (object.backgroundImage !== undefined || object.borderTop !== undefined || object.borderRight !== undefined || object.borderBottom !== undefined || object.borderLeft !== undefined);
        }
        static getBackgroundSize(node, value) {
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
                default:
                    const dimensions = value.split(' ');
                    if (dimensions.length === 1) {
                        dimensions[1] = dimensions[0];
                    }
                    for (let i = 0; i < dimensions.length; i++) {
                        if (dimensions[i] === 'auto') {
                            dimensions[i] = '100%';
                        }
                        if (i === 0) {
                            width = node.parseUnit(dimensions[i], true, false);
                        }
                        else {
                            height = node.parseUnit(dimensions[i], false, false);
                        }
                    }
                    break;
            }
            return width > 0 && height > 0 ? { width: Math.round(width), height: Math.round(height) } : undefined;
        }
        static isInheritedStyle(node, attr) {
            if (node.styleElement) {
                const actualParent = node.actualParent;
                if (actualParent && !node.cssInitial(attr)) {
                    return node.style[attr] === actualParent.style[attr];
                }
            }
            return false;
        }
        static causesLineBreak(node) {
            return node.lineBreak || node.excluded && node.blockStatic;
        }
        static hasLineBreak(node, lineBreak = false, trim = false) {
            if (node.actualChildren.length) {
                return node.actualChildren.some(item => item.lineBreak);
            }
            else if (!lineBreak && node.element && node.element.textContent) {
                let value = node.element.textContent;
                if (trim) {
                    value = value.trim();
                }
                if (/\n/.test(value)) {
                    if (node.plainText && $css$5.isParentStyle(node.element, 'whiteSpace', 'pre', 'pre-wrap')) {
                        return true;
                    }
                    return node.css('whiteSpace').startsWith('pre');
                }
            }
            return false;
        }
        static getStoredName(asset, value) {
            if (Resource.STORED[asset]) {
                for (const [name, data] of Resource.STORED[asset].entries()) {
                    if ($util$8.isEqual(value, data)) {
                        return name;
                    }
                }
            }
            return '';
        }
        finalize(layouts) { }
        reset() {
            for (const name in Resource.ASSETS) {
                Resource.ASSETS[name].clear();
            }
            for (const name in Resource.STORED) {
                Resource.STORED[name].clear();
            }
            if (this.fileHandler) {
                this.fileHandler.reset();
            }
        }
        addImage(element) {
            if (element && element.complete) {
                const uri = element.src.trim();
                if (uri !== '') {
                    Resource.ASSETS.images.set(uri, {
                        width: element.naturalWidth,
                        height: element.naturalHeight,
                        uri
                    });
                }
            }
        }
        getImage(src) {
            return Resource.ASSETS.images.get(src);
        }
        addFont(data) {
            const fonts = Resource.ASSETS.fonts.get(data.fontFamily) || [];
            fonts.push(data);
            Resource.ASSETS.fonts.set(data.fontFamily, fonts);
        }
        getFont(fontFamily, fontStyle = 'normal', fontWeight = '400') {
            const font = Resource.ASSETS.fonts.get(fontFamily);
            if (font) {
                const fontFormat = this.application.controllerHandler.localSettings.supported.fontFormat;
                return font.find(item => item.fontStyle === fontStyle && item.fontWeight === parseInt(fontWeight) && fontFormat.includes(item.srcFormat));
            }
            return undefined;
        }
        setBoxStyle(node) {
            if (node.visible && node.styleElement) {
                const boxStyle = {
                    backgroundColor: '',
                    backgroundSize: '',
                    backgroundRepeat: '',
                    backgroundPositionX: '',
                    backgroundPositionY: '',
                    backgroundImage: undefined,
                    borderRadius: undefined,
                    outline: undefined,
                    backgroundClip: undefined
                };
                if (!node.css('border').startsWith('0px none')) {
                    boxStyle.borderTop = undefined;
                    boxStyle.borderRight = undefined;
                    boxStyle.borderBottom = undefined;
                    boxStyle.borderLeft = undefined;
                }
                for (const attr in boxStyle) {
                    const value = node.css(attr);
                    switch (attr) {
                        case 'backgroundColor': {
                            if (!node.has('backgroundColor') && (value === node.cssAscend('backgroundColor', false, true) || node.documentParent.visible && Resource.isInheritedStyle(node, 'backgroundColor'))) {
                                continue;
                            }
                            const color = $color$1.parseColor(value, node.css('opacity'));
                            if (color) {
                                boxStyle.backgroundColor = color.valueAsRGBA;
                            }
                            break;
                        }
                        case 'backgroundSize':
                        case 'backgroundRepeat':
                        case 'backgroundPositionX':
                        case 'backgroundPositionY':
                            boxStyle[attr] = value;
                            break;
                        case 'backgroundImage':
                            if (value !== 'none' && node.hasResource(NODE_RESOURCE.IMAGE_SOURCE)) {
                                const images = [];
                                const opacity = node.css('opacity');
                                let match;
                                let i = 0;
                                while ((match = REGEXP_BACKGROUNDIMAGE.exec(value)) !== null) {
                                    if (match[0] === 'initial' || match[0].startsWith('url')) {
                                        images.push(match[0]);
                                    }
                                    else {
                                        const repeating = match[1] === 'repeating';
                                        const type = match[2];
                                        const direction = match[3];
                                        const dimension = getBackgroundSize(node, i, boxStyle.backgroundSize) || node.actualDimension;
                                        let gradient;
                                        switch (type) {
                                            case 'conic': {
                                                const position = getGradientPosition(direction);
                                                const conic = {
                                                    type,
                                                    dimension,
                                                    angle: parseAngle(direction)
                                                };
                                                conic.center = $css$5.getBackgroundPosition(position && position[2] || 'center', dimension, node.fontSize);
                                                conic.colorStops = parseColorStops(node, conic, match[4], opacity);
                                                gradient = conic;
                                                break;
                                            }
                                            case 'radial': {
                                                const position = getGradientPosition(direction);
                                                const radial = {
                                                    type,
                                                    repeating,
                                                    horizontal: node.actualWidth <= node.actualHeight,
                                                    dimension,
                                                    shape: position && position[1] && position[1].startsWith('circle') ? 'circle' : 'ellipse'
                                                };
                                                radial.center = $css$5.getBackgroundPosition(position && position[2] || 'center', dimension, node.fontSize);
                                                radial.closestCorner = Number.POSITIVE_INFINITY;
                                                radial.farthestCorner = Number.NEGATIVE_INFINITY;
                                                for (const corner of [[0, 0], [dimension.width, 0], [dimension.width, dimension.height], [0, dimension.height]]) {
                                                    const length = Math.round(Math.sqrt(Math.pow(Math.abs(corner[0] - radial.center.left), 2) + Math.pow(Math.abs(corner[1] - radial.center.top), 2)));
                                                    if (length < radial.closestCorner) {
                                                        radial.closestCorner = length;
                                                    }
                                                    if (length > radial.farthestCorner) {
                                                        radial.farthestCorner = length;
                                                    }
                                                }
                                                radial.closestSide = radial.center.top;
                                                radial.farthestSide = radial.center.top;
                                                for (const side of [dimension.width - radial.center.left, dimension.height - radial.center.top, radial.center.left]) {
                                                    if (side < radial.closestSide) {
                                                        radial.closestSide = side;
                                                    }
                                                    if (side > radial.farthestSide) {
                                                        radial.farthestSide = side;
                                                    }
                                                }
                                                radial.radius = radial.farthestCorner;
                                                const extent = position && position[1] ? position[1].split(' ').pop() : '';
                                                switch (extent) {
                                                    case 'closest-corner':
                                                    case 'closest-side':
                                                    case 'farthest-side':
                                                        const length = radial[$util$8.convertCamelCase(extent)];
                                                        if (repeating) {
                                                            radial.radiusExtent = length;
                                                        }
                                                        else {
                                                            radial.radius = length;
                                                        }
                                                        break;
                                                    default:
                                                        radial.radiusExtent = radial.farthestCorner;
                                                        break;
                                                }
                                                radial.colorStops = parseColorStops(node, radial, match[4], opacity);
                                                gradient = radial;
                                                break;
                                            }
                                            case 'linear': {
                                                let angle = 180;
                                                switch (direction) {
                                                    case 'to top':
                                                        angle = 0;
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
                                                            angle = parseAngle(direction);
                                                        }
                                                        break;
                                                }
                                                const linear = {
                                                    type,
                                                    repeating,
                                                    horizontal: angle >= 45 && angle <= 135 || angle >= 225 && angle <= 315,
                                                    dimension,
                                                    angle
                                                };
                                                linear.colorStops = parseColorStops(node, linear, match[4], opacity);
                                                const width = dimension.width;
                                                const height = dimension.height;
                                                let x = $math.truncateFraction($math.offsetAngleX(angle, width));
                                                let y = $math.truncateFraction($math.offsetAngleY(angle, height));
                                                if (x !== width && y !== height && !$math.isEqual(Math.abs(x), Math.abs(y))) {
                                                    let oppositeAngle;
                                                    if (angle <= 90) {
                                                        oppositeAngle = $math.offsetAngle({ x: 0, y: height }, { x: width, y: 0 });
                                                    }
                                                    else if (angle <= 180) {
                                                        oppositeAngle = $math.offsetAngle({ x: 0, y: 0 }, { x: width, y: height });
                                                    }
                                                    else if (angle <= 270) {
                                                        oppositeAngle = $math.offsetAngle({ x: 0, y: 0 }, { x: -width, y: height });
                                                    }
                                                    else {
                                                        oppositeAngle = $math.offsetAngle({ x: 0, y: height }, { x: -width, y: 0 });
                                                    }
                                                    let a = Math.abs(oppositeAngle - angle);
                                                    let b = 90 - a;
                                                    const lenX = $math.triangulateASA(a, b, Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)));
                                                    x = $math.truncateFraction($math.offsetAngleX(angle, lenX[1]));
                                                    a = 90;
                                                    b = 90 - angle;
                                                    const lenY = $math.triangulateASA(a, b, x);
                                                    y = $math.truncateFraction($math.offsetAngleY(angle, lenY[0]));
                                                }
                                                linear.angleExtent = { x, y };
                                                gradient = linear;
                                                break;
                                            }
                                        }
                                        images.push(gradient || 'initial');
                                    }
                                    i++;
                                }
                                if (images.length) {
                                    boxStyle.backgroundImage = images;
                                }
                            }
                            break;
                        case 'backgroundClip':
                            switch (value) {
                                case 'content-box':
                                    boxStyle.backgroundClip = {
                                        top: node.borderTopWidth + node.paddingTop,
                                        right: node.borderRightWidth + node.paddingRight,
                                        bottom: node.borderBottomWidth + node.paddingBottom,
                                        left: node.borderLeftWidth + node.paddingLeft
                                    };
                                    break;
                                case 'padding-box':
                                    boxStyle.backgroundClip = {
                                        top: node.borderTopWidth,
                                        right: node.borderRightWidth,
                                        bottom: node.borderBottomWidth,
                                        left: node.borderLeftWidth
                                    };
                                    break;
                            }
                            break;
                        case 'borderTop':
                        case 'borderRight':
                        case 'borderBottom':
                        case 'borderLeft':
                        case 'outline': {
                            const style = node.css(`${attr}Style`) || 'none';
                            let width = node.convertPX(node.css(`${attr}Width`), (attr === 'borderLeft' || attr === 'borderRight'), false) || '0px';
                            let color = node.css(`${attr}Color`) || 'initial';
                            switch (color.toLowerCase()) {
                                case 'initial':
                                    color = 'rgb(0, 0, 0)';
                                    break;
                                case 'inherit':
                                case 'currentcolor':
                                    color = $css$5.getInheritedStyle(node.element, `${attr}Color`);
                                    break;
                            }
                            if (style !== 'none' && width !== '0px') {
                                if (width === '2px' && (style === 'inset' || style === 'outset')) {
                                    width = '1px';
                                }
                                const borderColor = $color$1.parseColor(color, node.css('opacity'), true);
                                if (borderColor) {
                                    boxStyle[attr] = {
                                        width,
                                        style,
                                        color: borderColor.valueAsRGBA
                                    };
                                }
                            }
                            break;
                        }
                        case 'borderRadius':
                            if (value !== '0px') {
                                const horizontal = node.actualWidth >= node.actualHeight;
                                const [A, B] = node.css('borderTopLeftRadius').split(' ');
                                const [C, D] = node.css('borderTopRightRadius').split(' ');
                                const [E, F] = node.css('borderBottomRightRadius').split(' ');
                                const [G, H] = node.css('borderBottomLeftRadius').split(' ');
                                let borderRadius;
                                if (!B && !D && !F && !H) {
                                    borderRadius = [A, C, E, G];
                                }
                                else {
                                    borderRadius = [A, B || A, C, D || C, E, F || E, G, H || G];
                                }
                                if (borderRadius.every(radius => radius === borderRadius[0])) {
                                    if (borderRadius[0] === '0px' || borderRadius[0] === '') {
                                        continue;
                                    }
                                    borderRadius.length = 1;
                                }
                                for (let i = 0; i < borderRadius.length; i++) {
                                    borderRadius[i] = node.convertPX(borderRadius[i], horizontal, false);
                                }
                                boxStyle.borderRadius = borderRadius;
                            }
                            break;
                    }
                }
                if (boxStyle.borderTop && boxStyle.borderRight && boxStyle.borderBottom && boxStyle.borderLeft) {
                    let valid = true;
                    for (const attr in boxStyle.borderTop) {
                        const value = boxStyle.borderTop[attr];
                        if (value !== boxStyle.borderRight[attr] || value !== boxStyle.borderBottom[attr] || value !== boxStyle.borderLeft[attr]) {
                            valid = false;
                            break;
                        }
                    }
                    if (valid) {
                        boxStyle.border = boxStyle.borderTop;
                    }
                }
                node.data(Resource.KEY_NAME, 'boxStyle', boxStyle);
            }
        }
        setFontStyle(node) {
            if (!(node.element === null ||
                node.renderChildren.length ||
                node.imageElement ||
                node.svgElement ||
                node.tagName === 'HR' ||
                node.inlineText && !node.preserveWhiteSpace && node.element.innerHTML.trim() === '' && !node.visibleStyle.background)) {
                const opacity = node.css('opacity');
                const color = $color$1.parseColor(node.css('color'), opacity);
                let fontFamily = node.css('fontFamily').trim();
                let fontSize = node.css('fontSize');
                let fontWeight = node.css('fontWeight');
                if (fontFamily === '' && $client$1.isUserAgent(16 /* EDGE */)) {
                    switch (node.tagName) {
                        case 'TT':
                        case 'CODE':
                        case 'KBD':
                        case 'SAMP':
                            fontFamily = 'monospace';
                            break;
                    }
                }
                if ($util$8.convertInt(fontSize) === 0) {
                    switch (fontSize) {
                        case 'xx-small':
                            fontSize = '8px';
                            break;
                        case 'x-small':
                            fontSize = '10px';
                            break;
                        case 'small':
                            fontSize = '13px';
                            break;
                        case 'medium':
                            fontSize = '16px';
                            break;
                        case 'large':
                            fontSize = '18px';
                            break;
                        case 'x-large':
                            fontSize = '24px';
                            break;
                        case 'xx-large':
                            fontSize = '32px';
                            break;
                    }
                }
                if (!$util$8.isNumber(fontWeight)) {
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
                const result = {
                    fontFamily,
                    fontStyle: node.css('fontStyle'),
                    fontSize,
                    fontWeight,
                    color: color ? color.valueAsRGBA : ''
                };
                node.data(Resource.KEY_NAME, 'fontStyle', result);
            }
        }
        setValueString(node) {
            if (node.visible && !node.svgElement) {
                const element = node.element;
                const renderParent = node.renderParent;
                if (element && renderParent) {
                    let name = '';
                    let value = '';
                    let trimming = false;
                    let inlined = false;
                    const transform = node.css('textTransform');
                    switch (element.tagName) {
                        case 'INPUT':
                            value = element.value;
                            switch (element.type) {
                                case 'radio':
                                case 'checkbox':
                                    if (node.companion && !node.companion.visible) {
                                        value = node.companion.textContent;
                                    }
                                    break;
                                case 'submit':
                                    if (value === '' && !node.visibleStyle.backgroundImage) {
                                        value = 'Submit';
                                    }
                                    break;
                                case 'time':
                                    if (value === '') {
                                        value = '--:-- --';
                                    }
                                    break;
                                case 'date':
                                case 'datetime-local':
                                    if (value === '') {
                                        switch ((new Intl.DateTimeFormat()).resolvedOptions().locale) {
                                            case 'en-US':
                                                value = 'mm/dd/yyyy';
                                                break;
                                            default:
                                                value = 'dd/mm/yyyy';
                                                break;
                                        }
                                        if (element.type === 'datetime-local') {
                                            value += ' --:-- --';
                                        }
                                    }
                                    break;
                                case 'week':
                                    if (value === '') {
                                        value = 'Week: --, ----';
                                    }
                                    break;
                                case 'month':
                                    if (value === '') {
                                        value = '--------- ----';
                                    }
                                    break;
                                case 'url':
                                case 'email':
                                case 'search':
                                case 'number':
                                case 'tel':
                                    if (value === '') {
                                        value = element.placeholder;
                                    }
                                    break;
                                case 'file':
                                    value = $client$1.isUserAgent(8 /* FIREFOX */) ? 'Browse...' : 'Choose File';
                                    break;
                            }
                            break;
                        case 'TEXTAREA':
                            value = element.value;
                            break;
                        case 'BUTTON':
                            value = applyTextTransform(transform, element.innerText);
                            break;
                        case 'IFRAME':
                            value = element.src;
                            break;
                        default:
                            if (node.plainText) {
                                name = node.textContent.trim();
                                [value] = replaceWhiteSpace(renderParent, node, element, applyTextTransform(transform, node.textContent.replace($regex$2.ESCAPE.AMP, '&amp;')));
                                inlined = true;
                                trimming = true;
                            }
                            else if (node.inlineText) {
                                name = node.textContent.trim();
                                if (element.tagName === 'CODE') {
                                    value = removeExcluded(node, element, 'innerHTML');
                                }
                                else if (Resource.hasLineBreak(node, true)) {
                                    value = applyTextTransform(transform, removeExcluded(node, element, 'innerHTML')).replace(REGEXP_LINEBREAK, '\\n').replace($regex$2.XML.TAGNAME_G, '');
                                }
                                else {
                                    value = applyTextTransform(transform, removeExcluded(node, element, 'textContent'));
                                }
                                [value, inlined] = replaceWhiteSpace(renderParent, node, element, value);
                                trimming = true;
                            }
                            else if (Resource.isBackgroundVisible(node.data(Resource.KEY_NAME, 'boxStyle')) && element.innerText.trim() === '') {
                                value = applyTextTransform(transform, element.innerText);
                            }
                            break;
                    }
                    if (value !== '') {
                        if (trimming) {
                            const previousSibling = node.previousSiblings().pop();
                            let previousSpaceEnd = false;
                            if (value.length > 1) {
                                if (previousSibling === undefined || previousSibling.multiline || previousSibling.lineBreak || previousSibling.plainText && $regex$2.CHAR.TRAILINGSPACE.test(previousSibling.textContent)) {
                                    value = value.replace($regex$2.CHAR.LEADINGSPACE, '');
                                }
                                else if (previousSibling.element) {
                                    previousSpaceEnd = $regex$2.CHAR.TRAILINGSPACE.test(previousSibling.element.innerHTML || previousSibling.element.innerText || previousSibling.textContent);
                                }
                            }
                            if (inlined) {
                                const original = value;
                                value = value.trim();
                                if (previousSibling && !previousSibling.block && !previousSibling.lineBreak && !previousSpaceEnd && $regex$2.CHAR.LEADINGSPACE.test(original)) {
                                    value = '&#160;' + value;
                                }
                                if (!node.lineBreakTrailing && $regex$2.CHAR.TRAILINGSPACE.test(original)) {
                                    value += '&#160;';
                                }
                            }
                            else if (value.trim() !== '') {
                                value = value.replace($regex$2.CHAR.LEADINGSPACE, previousSibling && (previousSibling.block ||
                                    previousSibling.lineBreak ||
                                    previousSpaceEnd && previousSibling.htmlElement && previousSibling.textContent.length > 1 ||
                                    node.multiline && Resource.hasLineBreak(node)) ? '' : '&#160;');
                                value = value.replace($regex$2.CHAR.TRAILINGSPACE, node.display === 'table-cell' || node.lineBreakTrailing || node.blockStatic ? '' : '&#160;');
                            }
                            else if (!node.inlineText) {
                                return;
                            }
                        }
                        if (value !== '') {
                            node.data(Resource.KEY_NAME, 'valueString', { name, value });
                        }
                    }
                }
            }
        }
        get assets() {
            return Resource.ASSETS;
        }
        get stored() {
            return Resource.STORED;
        }
    }
    Resource.KEY_NAME = 'squared.resource';
    Resource.ASSETS = {
        ids: new Map(),
        images: new Map(),
        fonts: new Map()
    };
    Resource.STORED = {
        strings: new Map(),
        arrays: new Map(),
        fonts: new Map(),
        colors: new Map(),
        images: new Map()
    };

    class Accessibility extends Extension {
        constructor() {
            super(...arguments);
            this.options = {
                showLabel: true
            };
        }
        afterInit() {
            for (const node of this.application.processing.cache) {
                if (node.hasProcedure(NODE_PROCEDURE.ACCESSIBILITY)) {
                    switch (node.tagName) {
                        case 'IMAGE':
                            node.extracted = [node];
                            break;
                        case 'RADIO':
                        case 'CHECKBOX':
                            const element = node.element;
                            [node.nextSibling, node.previousSibling].some(sibling => {
                                if (sibling && sibling.visible && sibling.pageFlow && !sibling.visibleStyle.backgroundImage) {
                                    const labelElement = sibling.element;
                                    const labelParent = sibling.documentParent.tagName === 'LABEL' ? sibling.documentParent : undefined;
                                    if (element.id && element.id === labelElement.htmlFor) {
                                        node.companion = sibling;
                                    }
                                    else if (sibling.textElement && labelParent) {
                                        node.companion = sibling;
                                        labelParent.renderAs = node;
                                    }
                                    else if (sibling.plainText) {
                                        node.companion = sibling;
                                    }
                                    if (node.companion) {
                                        if (!this.options.showLabel) {
                                            sibling.hide();
                                        }
                                        return true;
                                    }
                                }
                                return false;
                            });
                            break;
                        case 'BUTTON':
                            if (node.length) {
                                const extracted = node.filter(item => !item.textElement);
                                if (extracted.length) {
                                    node.extracted = extracted;
                                }
                                node.clear();
                            }
                            break;
                    }
                }
            }
        }
    }

    const $css$6 = squared.lib.css;
    const $util$9 = squared.lib.util;
    const STRING_UNIT = '[\\d.]+[a-z%]+|auto|max-content|min-content';
    const STRING_MINMAX = 'minmax\\(([^,]+), ([^)]+)\\)';
    const STRING_FIT_CONTENT = 'fit-content\\(([\\d.]+[a-z%]+)\\)';
    const STRING_NAMED = '\\[([\\w\\-\\s]+)\\]';
    const REGEXP_GRID = {
        UNIT: new RegExp(`^(${STRING_UNIT})$`),
        NAMED: `\\s*(repeat\\((auto-fit|auto-fill|\\d+), (.+)\\)|${STRING_NAMED}|${STRING_MINMAX}|${STRING_FIT_CONTENT}|${STRING_UNIT})\\s*`,
        REPEAT: `\\s*(${STRING_NAMED}|${STRING_MINMAX}|${STRING_FIT_CONTENT}|${STRING_UNIT})\\s*`,
        STARTEND: /^([\w\-]+)-(start|end)$/
    };
    function repeatUnit(data, dimension) {
        const unitPX = [];
        const unitRepeat = [];
        for (let i = 0; i < dimension.length; i++) {
            if (data.repeat[i]) {
                unitRepeat.push(dimension[i]);
            }
            else {
                unitPX.push(dimension[i]);
            }
        }
        const repeatTotal = data.count - unitPX.length;
        const result = [];
        for (let i = 0; i < data.count; i++) {
            if (data.repeat[i]) {
                for (let j = 0, k = 0; j < repeatTotal; i++, j++, k++) {
                    if (k === unitRepeat.length) {
                        k = 0;
                    }
                    result[i] = unitRepeat[k];
                }
                break;
            }
            else if (unitPX.length) {
                result[i] = unitPX.shift();
            }
        }
        return result;
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
    const convertLength = (node, value) => $css$6.isLength(value) ? node.convertPX(value) : value;
    class CssGrid extends Extension {
        static createDataAttribute() {
            return {
                children: new Set(),
                rowData: [],
                rowHeight: [],
                rowHeightCount: [],
                rowWeight: [],
                rowSpanMultiple: [],
                templateAreas: {},
                row: CssGrid.createDataRowAttribute(),
                column: CssGrid.createDataRowAttribute(),
                emptyRows: [],
                alignItems: '',
                alignContent: '',
                justifyItems: '',
                justifyContent: ''
            };
        }
        static createDataRowAttribute() {
            return {
                count: 0,
                gap: 0,
                unit: [],
                unitMin: [],
                unitTotal: [],
                repeat: [],
                auto: [],
                autoFill: false,
                autoFit: false,
                name: {},
                normal: true
            };
        }
        condition(node) {
            return node.gridElement && node.length > 0;
        }
        processNode(node) {
            const mainData = Object.assign({}, CssGrid.createDataAttribute(), { alignItems: node.css('alignItems'), alignContent: node.css('alignContent'), justifyItems: node.css('justifyItems'), justifyContent: node.css('justifyContent') });
            const gridAutoFlow = node.css('gridAutoFlow');
            const horizontal = gridAutoFlow.indexOf('column') === -1;
            const dense = gridAutoFlow.indexOf('dense') !== -1;
            const rowData = [];
            const cellsPerRow = [];
            const layout = [];
            let rowInvalid = {};
            mainData.row.gap = node.parseUnit(node.css('rowGap'), false, false);
            mainData.column.gap = node.parseUnit(node.css('columnGap'), true, false);
            function setDataRows(item, placement) {
                if (placement.every(value => value > 0)) {
                    for (let i = placement[horizontal ? 0 : 1] - 1; i < placement[horizontal ? 2 : 3] - 1; i++) {
                        if (rowData[i] === undefined) {
                            rowData[i] = [];
                        }
                        for (let j = placement[horizontal ? 1 : 0] - 1; j < placement[horizontal ? 3 : 2] - 1; j++) {
                            if (cellsPerRow[i] === undefined) {
                                cellsPerRow[i] = 0;
                            }
                            if (rowData[i][j] === undefined) {
                                rowData[i][j] = [];
                                cellsPerRow[i]++;
                            }
                            rowData[i][j].push(item);
                        }
                    }
                    return true;
                }
                return false;
            }
            [node.cssInitial('gridTemplateRows', true), node.cssInitial('gridTemplateColumns', true), node.css('gridAutoRows'), node.css('gridAutoColumns')].forEach((value, index) => {
                if (value && value !== 'none' && value !== 'auto') {
                    const pattern = new RegExp(REGEXP_GRID.NAMED, 'g');
                    let match;
                    let i = 1;
                    while ((match = pattern.exec(value)) !== null) {
                        if (index < 2) {
                            const data = mainData[index === 0 ? 'row' : 'column'];
                            if (match[1].startsWith('repeat')) {
                                let iterations = 1;
                                switch (match[2]) {
                                    case 'auto-fit':
                                        data.autoFit = true;
                                        break;
                                    case 'auto-fill':
                                        data.autoFill = true;
                                        break;
                                    default:
                                        iterations = $util$9.convertInt(match[2]);
                                        break;
                                }
                                if (iterations > 0) {
                                    const repeating = [];
                                    const repeatPattern = new RegExp(REGEXP_GRID.REPEAT, 'g');
                                    let repeatMatch;
                                    while ((repeatMatch = repeatPattern.exec(match[3])) !== null) {
                                        let namedMatch;
                                        if ((namedMatch = new RegExp(STRING_NAMED).exec(repeatMatch[1])) !== null) {
                                            if (data.name[namedMatch[1]] === undefined) {
                                                data.name[namedMatch[1]] = [];
                                            }
                                            repeating.push({ name: namedMatch[1] });
                                        }
                                        else if ((namedMatch = new RegExp(STRING_MINMAX).exec(repeatMatch[1])) !== null) {
                                            repeating.push({ unit: convertLength(node, namedMatch[2]), unitMin: convertLength(node, namedMatch[1]) });
                                        }
                                        else if ((namedMatch = new RegExp(STRING_FIT_CONTENT).exec(repeatMatch[1])) !== null) {
                                            repeating.push({ unit: convertLength(node, namedMatch[1]), unitMin: '0px' });
                                        }
                                        else if ((namedMatch = new RegExp(STRING_UNIT).exec(repeatMatch[1])) !== null) {
                                            repeating.push({ unit: convertLength(node, namedMatch[0]) });
                                        }
                                    }
                                    if (repeating.length) {
                                        for (let j = 0; j < iterations; j++) {
                                            for (const item of repeating) {
                                                if (item.name) {
                                                    data.name[item.name].push(i);
                                                }
                                                else if (item.unit) {
                                                    data.unit.push(item.unit);
                                                    data.unitMin.push(item.unitMin || '');
                                                    data.repeat.push(true);
                                                    i++;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            else if (match[1].charAt(0) === '[') {
                                if (data.name[match[4]] === undefined) {
                                    data.name[match[4]] = [];
                                }
                                data.name[match[4]].push(i);
                            }
                            else if (match[1].startsWith('minmax')) {
                                data.unit.push(convertLength(node, match[6]));
                                data.unitMin.push(convertLength(node, match[5]));
                                data.repeat.push(false);
                                i++;
                            }
                            else if (match[1].startsWith('fit-content')) {
                                data.unit.push(convertLength(node, match[7]));
                                data.unitMin.push('0px');
                                data.repeat.push(false);
                                i++;
                            }
                            else if (REGEXP_GRID.UNIT.test(match[1])) {
                                data.unit.push(match[1] === 'auto' ? 'auto' : convertLength(node, match[1]));
                                data.unitMin.push('');
                                data.repeat.push(false);
                                i++;
                            }
                        }
                        else {
                            mainData[index === 2 ? 'row' : 'column'].auto.push(node.convertPX(match[1]));
                        }
                    }
                }
            });
            if (horizontal) {
                node.sort((a, b) => {
                    if (!$util$9.withinRange(a.linear.top, b.linear.top)) {
                        return a.linear.top < b.linear.top ? -1 : 1;
                    }
                    else if (!$util$9.withinRange(a.linear.left, b.linear.left)) {
                        return a.linear.left < b.linear.left ? -1 : 1;
                    }
                    return 0;
                });
            }
            else {
                node.sort((a, b) => {
                    if (!$util$9.withinRange(a.linear.left, b.linear.left)) {
                        return a.linear.left < b.linear.left ? -1 : 1;
                    }
                    else if (!$util$9.withinRange(a.linear.top, b.linear.top)) {
                        return a.linear.top < b.linear.top ? -1 : 1;
                    }
                    return 0;
                });
            }
            if (!node.has('gridTemplateAreas') && node.every(item => item.css('gridRowStart') === 'auto' && item.css('gridColumnStart') === 'auto')) {
                let directionA;
                let directionB;
                let indexA;
                let indexB;
                let indexC;
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
                let row = 0;
                let column = 0;
                let columnMax = 0;
                let previous;
                node.each((item, index) => {
                    if (previous === undefined || item.linear[directionA] >= previous.linear[directionB] || column > 0 && column === columnMax) {
                        columnMax = Math.max(column, columnMax);
                        row++;
                        column = 1;
                    }
                    const rowEnd = item.css('gridRowEnd');
                    const columnEnd = item.css('gridColumnEnd');
                    let rowSpan = 1;
                    let columnSpan = 1;
                    if (rowEnd.startsWith('span')) {
                        rowSpan = parseInt(rowEnd.split(' ')[1]);
                    }
                    else if ($util$9.isNumber(rowEnd)) {
                        rowSpan = parseInt(rowEnd) - row;
                    }
                    if (columnEnd.startsWith('span')) {
                        columnSpan = parseInt(columnEnd.split(' ')[1]);
                    }
                    else if ($util$9.isNumber(columnEnd)) {
                        columnSpan = parseInt(columnEnd) - column;
                    }
                    if (column === 1 && columnMax > 0) {
                        let valid = false;
                        do {
                            const available = new Array(columnMax - 1).fill(1);
                            for (const cell of layout) {
                                const placement = cell.placement;
                                if (placement[indexA] > row) {
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
                                        column = k + 1;
                                        valid = true;
                                        break;
                                    }
                                }
                                else {
                                    j = 0;
                                }
                            }
                            if (!valid) {
                                mainData.emptyRows[row - 1] = available;
                                row++;
                            }
                        } while (!valid);
                    }
                    layout[index] = {
                        placement: horizontal ? [row, column, row + rowSpan, column + columnSpan] : [column, row, column + columnSpan, row + rowSpan],
                        rowSpan,
                        columnSpan
                    };
                    column += columnSpan;
                    previous = item;
                });
            }
            else {
                node.css('gridTemplateAreas').split(/"[\s\n]+"/).forEach((template, i) => {
                    if (template !== 'none') {
                        const templateAreas = mainData.templateAreas;
                        $util$9.trimString(template.trim(), '"').split(' ').forEach((area, j) => {
                            if (area !== '.') {
                                if (templateAreas[area] === undefined) {
                                    templateAreas[area] = {
                                        rowStart: i,
                                        rowSpan: 1,
                                        columnStart: j,
                                        columnSpan: 1
                                    };
                                }
                                else {
                                    templateAreas[area].rowSpan = (i - templateAreas[area].rowStart) + 1;
                                    templateAreas[area].columnSpan = (j - templateAreas[area].columnStart) + 1;
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
                    const placement = [];
                    let rowSpan = 1;
                    let columnSpan = 1;
                    if (Object.keys(mainData.templateAreas).length) {
                        for (let i = 0; i < positions.length; i++) {
                            const name = positions[i];
                            let template = mainData.templateAreas[name];
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
                                const match = REGEXP_GRID.STARTEND.exec(name);
                                if (match) {
                                    template = mainData.templateAreas[match[1]];
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
                    if (!placement[0] || !placement[1] || !placement[2] || !placement[3]) {
                        function setPlacement(value, position) {
                            if ($util$9.isNumber(value)) {
                                placement[position] = parseInt(value);
                                return true;
                            }
                            else if (value.startsWith('span')) {
                                const span = parseInt(value.split(' ')[1]);
                                if (!placement[position - 2]) {
                                    if (position % 2 === 0) {
                                        rowSpan = span;
                                    }
                                    else {
                                        columnSpan = span;
                                    }
                                }
                                else {
                                    placement[position] = placement[position - 2] + span;
                                }
                                return true;
                            }
                            return false;
                        }
                        let rowStart;
                        let colStart;
                        for (let i = 0; i < positions.length; i++) {
                            const value = positions[i];
                            if (value !== 'auto' && !placement[i] && !setPlacement(value, i)) {
                                const data = mainData[i % 2 === 0 ? 'row' : 'column'];
                                const alias = value.split(' ');
                                if (alias.length === 1) {
                                    alias[1] = alias[0];
                                    alias[0] = '1';
                                }
                                else if ($util$9.isNumber(alias[0])) {
                                    if (i % 2 === 0) {
                                        if (rowStart === undefined) {
                                            rowStart = alias;
                                        }
                                        else {
                                            rowSpan = parseInt(alias[0]) - parseInt(rowStart[0]);
                                        }
                                    }
                                    else {
                                        if (colStart === undefined) {
                                            colStart = alias;
                                        }
                                        else {
                                            columnSpan = parseInt(alias[0]) - parseInt(colStart[0]);
                                        }
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
                            if (!placement[i]) {
                                setPlacement(value, i);
                            }
                        }
                    }
                    layout[index] = {
                        placement,
                        rowSpan,
                        columnSpan
                    };
                });
            }
            {
                const data = mainData[horizontal ? 'column' : 'row'];
                data.count = Math.max(1, data.unit.length);
                for (const item of layout) {
                    if (item) {
                        data.count = Math.max(data.count, horizontal ? item.columnSpan : item.rowSpan, item.placement[horizontal ? 1 : 0] || 0, (item.placement[horizontal ? 3 : 2] || 0) - 1);
                    }
                }
                if (data.autoFill || data.autoFit) {
                    if (data.unit.length === 0) {
                        data.unit.push('auto');
                        data.unitMin.push('');
                        data.repeat.push(true);
                    }
                    data.unit = repeatUnit(data, data.unit);
                    data.unitMin = repeatUnit(data, data.unitMin);
                }
                let percent = 1;
                let fr = 0;
                for (const unit of data.unit) {
                    if ($css$6.isPercent(unit)) {
                        percent -= parseFloat(unit) / 100;
                    }
                    else if (unit.endsWith('fr')) {
                        fr += parseFloat(unit);
                    }
                }
                if (percent > 0 && fr > 0) {
                    for (let i = 0; i < data.unit.length; i++) {
                        if (data.unit[i].endsWith('fr')) {
                            data.unit[i] = percent * (parseFloat(data.unit[i]) / fr) + 'fr';
                        }
                    }
                }
                const rowEnd = mainData.row.unit.length + 1;
                const columnEnd = mainData.column.unit.length + 1;
                for (const cell of layout) {
                    const placement = cell.placement;
                    if (placement[2] < 0) {
                        if (rowEnd > 1) {
                            placement[2] += rowEnd + 1;
                        }
                        else {
                            placement[2] = undefined;
                        }
                    }
                    if (placement[3] < 0) {
                        if (columnEnd > 1) {
                            placement[3] += columnEnd + 1;
                        }
                        else {
                            placement[3] = undefined;
                        }
                    }
                }
            }
            node.each((item, index) => {
                const cell = layout[index];
                const placement = cell.placement;
                let ROW_SPAN;
                let COLUMN_SPAN;
                let COLUMN_COUNT;
                let rowA;
                let colA;
                let rowB;
                let colB;
                if (horizontal) {
                    ROW_SPAN = cell.rowSpan;
                    COLUMN_SPAN = cell.columnSpan;
                    COLUMN_COUNT = mainData.column.count;
                    rowA = 0;
                    colA = 1;
                    rowB = 2;
                    colB = 3;
                }
                else {
                    ROW_SPAN = cell.columnSpan;
                    COLUMN_SPAN = cell.rowSpan;
                    COLUMN_COUNT = mainData.row.count;
                    rowA = 1;
                    colA = 0;
                    rowB = 3;
                    colB = 2;
                }
                while (!placement[0] || !placement[1]) {
                    const PLACEMENT = placement.slice(0);
                    if (!PLACEMENT[rowA]) {
                        let l = rowData.length;
                        for (let i = 0, j = 0, k = -1; i < l; i++) {
                            if (!rowInvalid[i]) {
                                if (cellsPerRow[i] === undefined || cellsPerRow[i] < COLUMN_COUNT) {
                                    if (j === 0) {
                                        k = i;
                                        l = Math.max(l, i + ROW_SPAN);
                                    }
                                    if (++j === ROW_SPAN) {
                                        PLACEMENT[rowA] = k + 1;
                                        break;
                                    }
                                }
                                else {
                                    j = 0;
                                    k = -1;
                                    l = rowData.length;
                                }
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
                        for (let i = l; i < m; i++) {
                            if (rowData[i] === undefined) {
                                available.push([[0, -1]]);
                            }
                            else if (getColumnTotal(rowData[i]) + COLUMN_SPAN <= COLUMN_COUNT) {
                                const range = [];
                                let span = 0;
                                for (let j = 0, k = -1; j < COLUMN_COUNT; j++) {
                                    if (rowData[i][j] === undefined) {
                                        if (k === -1) {
                                            k = j;
                                        }
                                        span++;
                                    }
                                    if (rowData[i][j] || j === COLUMN_COUNT - 1) {
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
                        if (available.length) {
                            if (available[0][0][1] === -1) {
                                PLACEMENT[colA] = 1;
                            }
                            else if (available.length === m - l) {
                                if (available.length > 1) {
                                    found: {
                                        for (const outside of available[0]) {
                                            for (let i = outside[0]; i < outside[1]; i++) {
                                                for (let j = 1; j < available.length; j++) {
                                                    for (let k = 0; k < available[j].length; k++) {
                                                        const inside = available[j][k];
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
                                    PLACEMENT[colA] = available[0][0][0] + 1;
                                }
                            }
                        }
                    }
                    if (PLACEMENT[rowA] && PLACEMENT[colA]) {
                        placement[rowA] = PLACEMENT[rowA];
                        placement[colA] = PLACEMENT[colA];
                    }
                    else if (PLACEMENT[rowA]) {
                        rowInvalid[PLACEMENT[rowA] - 1] = true;
                    }
                }
                if (!placement[rowB]) {
                    placement[rowB] = placement[rowA] + ROW_SPAN;
                }
                if (!placement[colB]) {
                    placement[colB] = placement[colA] + COLUMN_SPAN;
                }
                if (setDataRows(item, placement)) {
                    const rowStart = placement[0] - 1;
                    const rowSpan = placement[2] - placement[0];
                    if (rowSpan > 1) {
                        for (let i = rowStart; i < rowSpan; i++) {
                            mainData.rowSpanMultiple[i] = true;
                        }
                    }
                    item.data(EXT_NAME.CSS_GRID, 'cellData', {
                        rowStart,
                        rowSpan,
                        columnStart: placement[1] - 1,
                        columnSpan: placement[3] - placement[1]
                    });
                    if (dense) {
                        rowInvalid = {};
                    }
                }
            });
            if (rowData.length) {
                if (horizontal) {
                    mainData.rowData = rowData;
                }
                else {
                    for (let i = 0; i < rowData.length; i++) {
                        for (let j = 0; j < rowData[i].length; j++) {
                            if (mainData.rowData[j] === undefined) {
                                mainData.rowData[j] = [];
                            }
                            mainData.rowData[j][i] = rowData[i][j];
                        }
                    }
                }
                const unitTotal = mainData[horizontal ? 'row' : 'column'].unitTotal;
                let columnCount = 0;
                for (const row of mainData.rowData) {
                    columnCount = Math.max(row.length, columnCount);
                    for (let i = 0; i < row.length; i++) {
                        const column = row[i];
                        if (unitTotal[i] === undefined) {
                            unitTotal[i] = 0;
                        }
                        if (column) {
                            let maxDimension = 0;
                            for (let j = 0; j < column.length; j++) {
                                const item = column[j];
                                item.positioned = true;
                                if (!mainData.children.has(item)) {
                                    maxDimension = Math.max(maxDimension, horizontal ? item.bounds.height : item.bounds.width);
                                }
                                mainData.children.add(item);
                            }
                            unitTotal[i] += maxDimension;
                        }
                    }
                }
                if (mainData.children.size === node.length) {
                    mainData.row.count = mainData.rowData.length;
                    mainData.column.count = columnCount;
                    const modified = new Set();
                    for (let i = 0; i < mainData.row.count; i++) {
                        mainData.rowHeight.push(0);
                        mainData.rowHeightCount.push(0);
                        for (let j = 0; j < columnCount; j++) {
                            const column = mainData.rowData[i][j];
                            if (column) {
                                for (const item of column) {
                                    if (!modified.has(item)) {
                                        const cellData = item.data(EXT_NAME.CSS_GRID, 'cellData');
                                        const x = j + cellData.columnSpan - 1;
                                        const y = i + cellData.rowSpan - 1;
                                        if (x < columnCount - 1) {
                                            item.modifyBox(4 /* MARGIN_RIGHT */, mainData.column.gap);
                                        }
                                        if (y < mainData.row.count - 1) {
                                            item.modifyBox(8 /* MARGIN_BOTTOM */, mainData.row.gap);
                                        }
                                        if (cellData.rowSpan === 1) {
                                            mainData.rowHeight[i] = Math.max(mainData.rowHeight[i], item.bounds.height);
                                            mainData.rowHeightCount[i]++;
                                        }
                                        modified.add(item);
                                    }
                                }
                            }
                        }
                    }
                    for (let i = 0; i < mainData.rowHeight.length; i++) {
                        mainData.rowWeight[i] = mainData.rowHeight[i] / node.actualHeight;
                    }
                    node.retain(Array.from(mainData.children));
                    node.cssSort('zIndex');
                    if (node.cssTry('display', 'block')) {
                        node.each((item) => {
                            const bounds = item.initial.bounds;
                            if (bounds) {
                                const rect = item.element.getBoundingClientRect();
                                bounds.width = rect.width;
                                bounds.height = rect.height;
                            }
                        });
                        node.cssFinally('display');
                    }
                    node.data(EXT_NAME.CSS_GRID, 'mainData', mainData);
                }
            }
            return undefined;
        }
    }

    const $util$a = squared.lib.util;
    class Flexbox extends Extension {
        static createDataAttribute(node, children) {
            const wrap = node.css('flexWrap');
            const direction = node.css('flexDirection');
            return {
                directionRow: direction.startsWith('row'),
                directionColumn: direction.startsWith('column'),
                directionReverse: direction.endsWith('reverse'),
                wrap: wrap.startsWith('wrap'),
                wrapReverse: wrap === 'wrap-reverse',
                alignContent: node.css('alignContent'),
                justifyContent: node.css('justifyContent'),
                rowCount: 0,
                columnCount: 0,
                children
            };
        }
        condition(node) {
            return node.flexElement && node.length > 0;
        }
        processNode(node) {
            const controller = this.application.controllerHandler;
            const children = node.filter(item => {
                if (item.pageFlow && item.pseudoElement && item.css('content') === '""' && item.contentBoxWidth === 0) {
                    item.hide();
                    return false;
                }
                return item.pageFlow;
            });
            const mainData = Flexbox.createDataAttribute(node, children);
            if (node.cssTry('alignItems', 'start')) {
                if (node.cssTry('justifyItems', 'start')) {
                    for (const item of children) {
                        const bounds = item.initial.bounds;
                        if (bounds && item.cssTry('alignSelf', 'start')) {
                            if (item.cssTry('justifySelf', 'start')) {
                                if (item.cssTry('flexGrow', '0')) {
                                    if (item.cssTry('flexShrink', '1')) {
                                        const rect = item.element.getBoundingClientRect();
                                        bounds.width = rect.width;
                                        bounds.height = rect.height;
                                        item.cssFinally('flexShrink');
                                    }
                                    item.cssFinally('flexGrow');
                                }
                                item.cssFinally('justifySelf');
                            }
                            item.cssFinally('alignSelf');
                        }
                    }
                    node.cssFinally('justifyItems');
                }
                node.cssFinally('alignItems');
            }
            if (mainData.wrap) {
                let align;
                let sort;
                let size;
                let method;
                if (mainData.directionRow) {
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
                    if (!a[method](b.bounds, 'bounds')) {
                        return a.linear[align] < b.linear[align] ? -1 : 1;
                    }
                    else if (!$util$a.withinRange(a.linear[sort], b.linear[sort])) {
                        return a.linear[sort] < b.linear[sort] ? -1 : 1;
                    }
                    return 0;
                });
                let row = [children[0]];
                let rowStart = children[0];
                const rows = [row];
                for (let i = 1; i < children.length; i++) {
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
                for (let i = 0; i < rows.length; i++) {
                    const seg = rows[i];
                    const group = controller.createNodeGroup(seg[0], seg, node);
                    group.siblingIndex = i;
                    node.sort(NodeList.siblingIndex);
                    const box = group.unsafe('box');
                    if (box) {
                        box[size] = node.box[size];
                    }
                    group.alignmentType |= 128 /* SEGMENTED */;
                    maxCount = Math.max(seg.length, maxCount);
                }
                if (mainData.directionRow) {
                    mainData.rowCount = rows.length;
                    mainData.columnCount = maxCount;
                }
                else {
                    mainData.rowCount = maxCount;
                    mainData.columnCount = rows.length;
                }
            }
            else {
                if (children.some(item => item.flexbox.order !== 0)) {
                    const c = mainData.directionReverse ? -1 : 1;
                    const d = mainData.directionReverse ? 1 : -1;
                    children.sort((a, b) => {
                        if (a.flexbox.order === b.flexbox.order) {
                            return 0;
                        }
                        return a.flexbox.order > b.flexbox.order ? c : d;
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
            node.data(EXT_NAME.FLEXBOX, 'mainData', mainData);
            return undefined;
        }
    }

    const $css$7 = squared.lib.css;
    const $session$4 = squared.lib.session;
    class External extends Extension {
        beforeInit(element, internal = false) {
            if (internal || this.included(element)) {
                if (!$session$4.getElementCache(element, 'squaredExternalDisplay', this.application.processing.sessionId)) {
                    const display = [];
                    let current = element;
                    while (current) {
                        display.push($css$7.getStyle(current).getPropertyValue('display'));
                        current.style.setProperty('display', 'block');
                        current = current.parentElement;
                    }
                    $session$4.setElementCache(element, 'squaredExternalDisplay', this.application.processing.sessionId, display);
                }
            }
        }
        init(element) {
            if (this.included(element)) {
                this.application.rootElements.add(element);
            }
            return false;
        }
        afterInit(element, internal = false) {
            if (internal || this.included(element)) {
                const display = $session$4.getElementCache(element, 'squaredExternalDisplay', this.application.processing.sessionId);
                if (Array.isArray(display)) {
                    let current = element;
                    let i = 0;
                    while (current) {
                        current.style.setProperty('display', display[i]);
                        current = current.parentElement;
                        i++;
                    }
                    $session$4.deleteElementCache(element, 'squaredExternalDisplay', this.application.processing.sessionId);
                }
            }
        }
    }

    const $util$b = squared.lib.util;
    function getRowIndex(columns, target) {
        for (const column of columns) {
            const index = column.findIndex(item => $util$b.withinRange(target.linear.top, item.linear.top) || target.linear.top > item.linear.top && target.linear.top < item.linear.bottom);
            if (index !== -1) {
                return index;
            }
        }
        return -1;
    }
    class Grid extends Extension {
        static createDataAttribute() {
            return {
                paddingTop: 0,
                paddingRight: 0,
                paddingBottom: 0,
                paddingLeft: 0,
                columnCount: 0
            };
        }
        static createDataCellAttribute() {
            return {
                rowSpan: 0,
                columnSpan: 0,
                index: -1,
                cellStart: false,
                cellEnd: false,
                rowEnd: false,
                rowStart: false,
                siblings: []
            };
        }
        condition(node) {
            if (node.length > 1 && !node.layoutElement && !node.has('listStyle')) {
                if (node.display === 'table') {
                    return node.every(item => item.display === 'table-row' && item.every(child => child.display === 'table-cell'));
                }
                else {
                    let multipleLength = 0;
                    let listItemCount = 0;
                    for (const item of node) {
                        if (item.pageFlow && !item.visibleStyle.background && item.blockStatic && !item.autoMargin.leftRight && !item.autoMargin.left) {
                            if (item.length > 1) {
                                multipleLength++;
                            }
                            if (item.display === 'list-item' && !item.has('listStyleType')) {
                                listItemCount++;
                            }
                        }
                        else {
                            return false;
                        }
                    }
                    if (listItemCount === node.length) {
                        return true;
                    }
                    else if (multipleLength > 0) {
                        return node.every(item => item.length > 0 && NodeList.linearData(item.children).linearX);
                    }
                }
            }
            return false;
        }
        processNode(node) {
            const columnEnd = [];
            const columns = [];
            const nextMapX = {};
            for (const row of node) {
                for (const column of row) {
                    const x = Math.floor(column.linear.left);
                    if (nextMapX[x] === undefined) {
                        nextMapX[x] = [];
                    }
                    nextMapX[x].push(column);
                }
            }
            const nextCoordsX = Object.keys(nextMapX);
            if (nextCoordsX.length) {
                let columnLength = -1;
                for (let i = 0; i < nextCoordsX.length; i++) {
                    const nextAxisX = nextMapX[nextCoordsX[i]];
                    if (i === 0) {
                        columnLength = nextAxisX.length;
                    }
                    else if (columnLength !== nextAxisX.length) {
                        columnLength = -1;
                        break;
                    }
                }
                if (columnLength !== -1) {
                    for (let i = 0; i < nextCoordsX.length; i++) {
                        columns.push(nextMapX[nextCoordsX[i]]);
                    }
                }
                else {
                    const columnRight = [];
                    for (let i = 0; i < nextCoordsX.length; i++) {
                        const nextAxisX = nextMapX[nextCoordsX[i]];
                        if (i === 0 && nextAxisX.length === 0) {
                            return undefined;
                        }
                        columnRight[i] = i === 0 ? 0 : columnRight[i - 1];
                        for (let j = 0; j < nextAxisX.length; j++) {
                            const nextX = nextAxisX[j];
                            if (i === 0 || nextX.linear.left >= columnRight[i - 1]) {
                                if (columns[i] === undefined) {
                                    columns[i] = [];
                                }
                                if (i === 0 || columns[0].length === nextAxisX.length) {
                                    columns[i][j] = nextX;
                                }
                                else {
                                    const index = getRowIndex(columns, nextX);
                                    if (index !== -1) {
                                        columns[i][index] = nextX;
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
                                        minLeft = Math.min(minLeft, item.linear.left);
                                        maxRight = Math.max(maxRight, item.linear.right);
                                    });
                                    if (nextX.linear.left > Math.ceil(minLeft) && nextX.linear.right > Math.ceil(maxRight)) {
                                        const index = getRowIndex(columns, nextX);
                                        if (index !== -1) {
                                            for (let k = columns.length - 1; k >= 0; k--) {
                                                if (columns[k]) {
                                                    if (columns[k][index] === undefined) {
                                                        columns[endIndex].length = 0;
                                                    }
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            columnRight[i] = Math.max(nextX.linear.right, columnRight[i]);
                        }
                    }
                    for (let i = 0, j = -1; i < columnRight.length; i++) {
                        if (columns[i] === undefined) {
                            if (j === -1) {
                                j = i - 1;
                            }
                            else if (i === columnRight.length - 1) {
                                columnRight[j] = columnRight[i];
                            }
                        }
                        else if (j !== -1) {
                            columnRight[j] = columnRight[i - 1];
                            j = -1;
                        }
                    }
                    for (let i = 0; i < columns.length; i++) {
                        if (columns[i] && columns[i].length) {
                            columnEnd.push(columnRight[i]);
                        }
                        else {
                            columns.splice(i--, 1);
                        }
                    }
                    const maxColumn = columns.reduce((a, b) => Math.max(a, b.length), 0);
                    for (let l = 0; l < maxColumn; l++) {
                        for (let m = 0; m < columns.length; m++) {
                            if (columns[m][l] === undefined) {
                                columns[m][l] = { spacer: 1 };
                            }
                        }
                    }
                    columnEnd.push(node.box.right);
                }
            }
            if (columns.length > 1 && columns[0].length === node.length) {
                const mainData = Object.assign({}, Grid.createDataAttribute(), { columnCount: columns.length });
                const children = [];
                for (let i = 0, count = 0; i < columns.length; i++) {
                    let spacer = 0;
                    for (let j = 0, start = 0; j < columns[i].length; j++) {
                        const item = columns[i][j];
                        if (children[j] === undefined) {
                            children[j] = [];
                        }
                        if (!item['spacer']) {
                            const data = Object.assign(Grid.createDataCellAttribute(), item.data(EXT_NAME.GRID, 'cellData'));
                            let rowSpan = 1;
                            let columnSpan = 1 + spacer;
                            for (let k = i + 1; k < columns.length; k++) {
                                if (columns[k][j].spacer === 1) {
                                    columnSpan++;
                                    columns[k][j].spacer = 2;
                                }
                                else {
                                    break;
                                }
                            }
                            if (columnSpan === 1) {
                                for (let k = j + 1; k < columns[i].length; k++) {
                                    if (columns[i][k].spacer === 1) {
                                        rowSpan++;
                                        columns[i][k].spacer = 2;
                                    }
                                    else {
                                        break;
                                    }
                                }
                            }
                            if (columnEnd.length) {
                                const l = Math.min(i + (columnSpan - 1), columnEnd.length - 1);
                                const actualChildren = item.documentParent.actualChildren;
                                for (const sibling of actualChildren) {
                                    if (sibling.visible && !sibling.rendered && sibling.linear.left >= item.linear.right && sibling.linear.right <= columnEnd[l]) {
                                        data.siblings.push(sibling);
                                    }
                                }
                            }
                            data.rowSpan = rowSpan;
                            data.columnSpan = columnSpan;
                            data.rowStart = start++ === 0;
                            data.rowEnd = columnSpan + i === columns.length;
                            data.cellStart = count === 0;
                            data.cellEnd = data.rowEnd && j === columns[i].length - 1;
                            data.index = i;
                            spacer = 0;
                            item.data(EXT_NAME.GRID, 'cellData', data);
                            children[j].push(item);
                        }
                        else if (item['spacer'] === 1) {
                            spacer++;
                        }
                    }
                }
                for (const item of node) {
                    item.hide();
                }
                node.clear();
                for (const group of children) {
                    for (const item of group) {
                        item.parent = node;
                    }
                }
                if (node.tableElement && node.css('borderCollapse') === 'collapse') {
                    node.modifyBox(32 /* PADDING_TOP */, null);
                    node.modifyBox(64 /* PADDING_RIGHT */, null);
                    node.modifyBox(128 /* PADDING_BOTTOM */, null);
                    node.modifyBox(256 /* PADDING_LEFT */, null);
                }
                node.data(EXT_NAME.GRID, 'mainData', mainData);
            }
            return undefined;
        }
    }

    const $css$8 = squared.lib.css;
    const hasSingleImage = (node) => node.visibleStyle.backgroundImage && !node.visibleStyle.backgroundRepeat;
    class List extends Extension {
        static createDataAttribute() {
            return {
                ordinal: '',
                imageSrc: '',
                imagePosition: ''
            };
        }
        condition(node) {
            if (super.condition(node)) {
                const length = node.length;
                if (length) {
                    const floated = new Set();
                    let blockStatic = 0;
                    let inlineVertical = 0;
                    let floating = 0;
                    let blockAlternate = 0;
                    let imageType = 0;
                    let listType = 0;
                    for (let i = 0; i < length; i++) {
                        const item = node.children[i];
                        const listStyleType = item.css('listStyleType') !== 'none';
                        if (item.display === 'list-item') {
                            if (listStyleType || item.innerBefore || hasSingleImage(item)) {
                                listType++;
                            }
                        }
                        else if (hasSingleImage(item) && !listStyleType && item.marginLeft < 0) {
                            imageType++;
                        }
                        if (item.blockStatic) {
                            blockStatic++;
                        }
                        if (item.inlineVertical) {
                            inlineVertical++;
                        }
                        if (item.floating) {
                            floated.add(item.float);
                            floating++;
                        }
                        else if (i === 0 || i === length - 1 || item.blockStatic || node.children[i - 1].blockStatic && node.children[i + 1].blockStatic) {
                            blockAlternate++;
                        }
                    }
                    return (imageType > 0 || listType > 0) && (blockStatic === length || inlineVertical === length || floating === length && floated.size === 1 || blockAlternate === length);
                }
            }
            return false;
        }
        processNode(node) {
            let i = 1;
            node.each(item => {
                const mainData = List.createDataAttribute();
                const value = item.css('listStyleType');
                if (item.display === 'list-item' || value && value !== 'none' || hasSingleImage(item)) {
                    if (item.has('listStyleImage')) {
                        mainData.imageSrc = item.css('listStyleImage');
                    }
                    else {
                        mainData.ordinal = $css$8.convertListStyle(value, i);
                        if (mainData.ordinal === '') {
                            switch (value) {
                                case 'disc':
                                    mainData.ordinal = '●';
                                    break;
                                case 'square':
                                    mainData.ordinal = '■';
                                    break;
                                case 'none':
                                    let src = '';
                                    let position = '';
                                    if (!item.visibleStyle.backgroundRepeat) {
                                        src = item.css('backgroundImage');
                                        position = item.css('backgroundPosition');
                                    }
                                    if (src && src !== 'none') {
                                        mainData.imageSrc = src;
                                        mainData.imagePosition = position;
                                        item.exclude({ resource: NODE_RESOURCE.IMAGE_SOURCE });
                                    }
                                    break;
                                default:
                                    mainData.ordinal = '○';
                                    break;
                            }
                        }
                        else {
                            mainData.ordinal += '.';
                        }
                    }
                    i++;
                }
                item.data(EXT_NAME.LIST, 'mainData', mainData);
            });
            return undefined;
        }
    }

    const $dom$2 = squared.lib.dom;
    const $util$c = squared.lib.util;
    class Relative extends Extension {
        condition(node) {
            return node.positionRelative || node.toFloat('verticalAlign', true) !== 0;
        }
        processNode() {
            return { include: true };
        }
        postOptimize(node) {
            const renderParent = node.renderParent;
            if (renderParent) {
                const verticalAlign = $util$c.convertFloat(node.verticalAlign);
                let target = node;
                let { top, right, bottom, left } = node;
                if (renderParent.support.container.positionRelative && renderParent.layoutHorizontal && node.renderChildren.length === 0 && (node.top !== 0 || node.bottom !== 0 || verticalAlign !== 0)) {
                    target = node.clone(this.application.nextId, true, true);
                    node.hide(true);
                    this.application.session.cache.append(target, false);
                    const layout = new Layout(renderParent, target, target.containerType, target.alignmentType);
                    const index = renderParent.renderChildren.findIndex(item => item === node);
                    if (index !== -1) {
                        layout.renderIndex = index + 1;
                    }
                    this.application.addLayout(layout);
                    if (renderParent.layoutHorizontal && node.documentParent.toInt('textIndent') < 0) {
                        renderParent.renderEach(item => {
                            if (item.alignSibling('topBottom') === node.documentId) {
                                item.alignSibling('topBottom', target.documentId);
                            }
                            else if (item.alignSibling('bottomTop') === node.documentId) {
                                item.alignSibling('bottomTop', target.documentId);
                            }
                        });
                    }
                    if (node.baselineActive && !node.baselineAltered) {
                        for (const children of (renderParent.horizontalRows || [renderParent.renderChildren])) {
                            if (children.includes(node)) {
                                const unaligned = $util$c.filterArray(children, item => item.positionRelative && item.length > 0 && $util$c.convertFloat(node.verticalAlign) !== 0);
                                if (unaligned.length) {
                                    unaligned.sort((a, b) => {
                                        if ($util$c.withinRange(a.linear.top, b.linear.top)) {
                                            return 0;
                                        }
                                        return a.linear.top < b.linear.top ? -1 : 1;
                                    });
                                    for (let i = 0; i < unaligned.length; i++) {
                                        const item = unaligned[i];
                                        if (i === 0) {
                                            node.modifyBox(2 /* MARGIN_TOP */, $util$c.convertFloat(item.verticalAlign));
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
                    const actualParent = node.actualParent;
                    if (actualParent) {
                        let preceding = false;
                        for (const item of actualParent.actualChildren) {
                            if (item === node) {
                                if (preceding) {
                                    if (renderParent.layoutVertical && (node.top !== 0 || node.bottom !== 0)) {
                                        const bounds = $dom$2.assignRect(node.element.getBoundingClientRect(), true);
                                        if (top !== 0) {
                                            top -= bounds.top - node.bounds.top;
                                        }
                                        if (bottom !== 0) {
                                            bottom += bounds.bottom - node.bounds.bottom;
                                        }
                                    }
                                    if (renderParent.layoutHorizontal && (node.left !== 0 || node.right !== 0) && node.alignSibling('leftRight') === '') {
                                        const bounds = $dom$2.assignRect(node.element.getBoundingClientRect(), true);
                                        if (left !== 0) {
                                            left -= bounds.left - node.bounds.left;
                                        }
                                        if (right !== 0) {
                                            right += bounds.right - node.bounds.right;
                                        }
                                    }
                                }
                                else if (renderParent.layoutVertical && bottom !== 0) {
                                    const getBox = item.getBox(2 /* MARGIN_TOP */);
                                    if (getBox[0] === 1) {
                                        bottom -= item.marginTop;
                                    }
                                }
                                break;
                            }
                            else if (item.positionRelative && item.renderParent === renderParent) {
                                preceding = true;
                            }
                        }
                    }
                }
                if (top !== 0) {
                    target.modifyBox(2 /* MARGIN_TOP */, top);
                }
                else if (bottom !== 0) {
                    target.modifyBox(2 /* MARGIN_TOP */, bottom * -1);
                }
                if (verticalAlign !== 0) {
                    target.modifyBox(2 /* MARGIN_TOP */, verticalAlign * -1);
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
            }
        }
    }

    const $css$9 = squared.lib.css;
    const $regex$3 = squared.lib.regex;
    class Sprite extends Extension {
        condition(node) {
            let valid = false;
            if (node.hasWidth && node.hasHeight && node.length === 0 && (this.included(node.element) || !node.dataset.use)) {
                let url = node.css('backgroundImage');
                if (url === '' || url === 'none') {
                    const match = $regex$3.CSS.URL.exec(node.css('background'));
                    url = match ? match[0] : '';
                }
                if (url !== '') {
                    const image = this.application.resourceHandler.getImage($css$9.resolveURL(url));
                    if (image) {
                        const dimension = node.actualDimension;
                        const position = $css$9.getBackgroundPosition(`${node.css('backgroundPositionX')} ${node.css('backgroundPositionY')}`, dimension, node.fontSize);
                        if (position.left <= 0 && position.top <= 0 && image.width > dimension.width && image.height > dimension.height) {
                            image.position = { x: position.left, y: position.top };
                            node.data(EXT_NAME.SPRITE, 'mainData', image);
                            valid = true;
                        }
                    }
                }
            }
            return valid;
        }
    }

    const $css$a = squared.lib.css;
    class Substitute extends Extension {
        constructor(name, framework, tagNames, options) {
            super(name, framework, tagNames, options);
            this.require(EXT_NAME.EXTERNAL, true);
        }
        processNode(node, parent) {
            const data = $css$a.getDataSet(node.element, this.name);
            if (data.tagChild) {
                node.each(item => {
                    if (item.styleElement) {
                        item.dataset.use = this.name;
                        item.dataset.squaredSubstituteTag = data.tagChild;
                    }
                });
            }
            if (data.tag) {
                node.setControlType(data.tag);
                node.render(parent);
                return {
                    output: {
                        type: 1 /* XML */,
                        node,
                        controlName: data.tag
                    }
                };
            }
            return undefined;
        }
    }

    const $client$2 = squared.lib.client;
    const $css$b = squared.lib.css;
    const $dom$3 = squared.lib.dom;
    const $math$1 = squared.lib.math;
    const $util$d = squared.lib.util;
    const REGEXP_BACKGROUND = /rgba\(0, 0, 0, 0\)|transparent/;
    const REGEXP_BORDER = /none|\s0px|rgba\(0, 0, 0, 0\)|transparent/;
    class Table extends Extension {
        static createDataAttribute() {
            return {
                layoutType: 0,
                rowCount: 0,
                columnCount: 0,
                expand: false
            };
        }
        processNode(node) {
            const mainData = Table.createDataAttribute();
            const table = [];
            function setAutoWidth(td) {
                td.data(EXT_NAME.TABLE, 'percent', `${Math.round((td.bounds.width / node.box.width) * 100)}%`);
                td.data(EXT_NAME.TABLE, 'expand', true);
            }
            function setBoundsWidth(td) {
                td.css('width', $css$b.formatPX(td.bounds.width), true);
            }
            function inheritStyles(section) {
                if (section.length) {
                    for (const item of section[0].cascade()) {
                        if (item.tagName === 'TH' || item.tagName === 'TD') {
                            item.inherit(section[0], 'styleMap');
                            item.unsetCache('visibleStyle');
                        }
                    }
                    $util$d.concatArray(table, section[0].children);
                    for (const item of section) {
                        item.hide();
                    }
                }
            }
            const thead = [];
            const tbody = [];
            const tfoot = [];
            node.each((item) => {
                switch (item.tagName) {
                    case 'THEAD':
                        thead.push(item);
                        break;
                    case 'TBODY':
                        tbody.push(item);
                        break;
                    case 'TFOOT':
                        tfoot.push(item);
                        break;
                }
            });
            inheritStyles(thead);
            for (const section of tbody) {
                $util$d.concatArray(table, section.children);
                section.hide();
            }
            inheritStyles(tfoot);
            const layoutFixed = node.css('tableLayout') === 'fixed';
            const borderCollapse = node.css('borderCollapse') === 'collapse';
            const [horizontal, vertical] = borderCollapse ? [0, 0] : $util$d.replaceMap(node.css('borderSpacing').split(' '), value => parseInt(value));
            const spacingWidth = horizontal > 1 ? Math.round(horizontal / 2) : horizontal;
            const spacingHeight = vertical > 1 ? Math.round(vertical / 2) : vertical;
            const colgroup = node.element && node.element.querySelector('COLGROUP');
            const rowWidth = [];
            const mapBounds = [];
            const tableFilled = [];
            const mapWidth = [];
            const rowCount = table.length;
            let columnIndex = new Array(rowCount).fill(0);
            let columnCount = 0;
            let cellCount = 0;
            for (let i = 0; i < rowCount; i++) {
                const tr = table[i];
                rowWidth[i] = horizontal;
                tableFilled[i] = [];
                tr.each((td, j) => {
                    const element = td.element;
                    for (let k = 0; k < element.rowSpan - 1; k++) {
                        const col = (i + 1) + k;
                        if (columnIndex[col] !== undefined) {
                            columnIndex[col] += element.colSpan;
                        }
                    }
                    if (!td.hasWidth) {
                        const width = $util$d.convertInt($dom$3.getNamedItem(element, 'width'));
                        if (width > 0) {
                            td.css('width', $css$b.formatPX(width));
                        }
                    }
                    if (!td.hasHeight) {
                        const height = $util$d.convertInt($dom$3.getNamedItem(element, 'height'));
                        if (height > 0) {
                            td.css('height', $css$b.formatPX(height));
                        }
                    }
                    if (!td.visibleStyle.backgroundImage && !td.visibleStyle.backgroundColor) {
                        if (colgroup) {
                            const style = $css$b.getStyle(colgroup.children[columnIndex[i]]);
                            if (style.background) {
                                element.style.setProperty('background', style.background);
                            }
                            else if (style.backgroundColor) {
                                element.style.setProperty('background-color', style.backgroundColor);
                            }
                        }
                        else {
                            let value = $css$b.getInheritedStyle(element, 'background', REGEXP_BACKGROUND, 'TABLE');
                            if (value !== '') {
                                element.style.setProperty('background', value);
                            }
                            else {
                                value = $css$b.getInheritedStyle(element, 'backgroundColor', REGEXP_BACKGROUND, 'TABLE');
                                if (value !== '') {
                                    element.style.setProperty('background-color', value);
                                }
                            }
                        }
                    }
                    switch (td.tagName) {
                        case 'TH': {
                            function setBorderStyle(attr) {
                                const value = $css$b.getInheritedStyle(element, attr, REGEXP_BORDER, 'TABLE');
                                if (value !== '') {
                                    const match = /^(\d+[a-z]+) ([a-z]+) (.+)$/.exec(value);
                                    if (match) {
                                        td.css(`${attr}Style`, match[2]);
                                        td.css(`${attr}Color`, match[3]);
                                        td.css(`${attr}Width`, match[1], true);
                                        if (!td.has('border')) {
                                            td.css('border', 'inherit');
                                        }
                                    }
                                }
                            }
                            if (!td.cssInitial('textAlign')) {
                                td.css('textAlign', td.css('textAlign'));
                            }
                            if (td.borderTopWidth === 0) {
                                setBorderStyle('borderTop');
                            }
                            if (td.borderRightWidth === 0) {
                                setBorderStyle('borderRight');
                            }
                            if (td.borderBottomWidth === 0) {
                                setBorderStyle('borderBottom');
                            }
                            if (td.borderLeftWidth === 0) {
                                setBorderStyle('borderLeft');
                            }
                        }
                        case 'TD':
                            if (!td.cssInitial('verticalAlign')) {
                                td.css('verticalAlign', 'middle', true);
                            }
                            break;
                    }
                    const columnWidth = td.cssInitial('width');
                    const m = columnIndex[i];
                    const reevaluate = mapWidth[m] === undefined || mapWidth[m] === 'auto';
                    if (i === 0 || reevaluate || !layoutFixed) {
                        if (columnWidth === '' || columnWidth === 'auto') {
                            if (mapWidth[m] === undefined) {
                                mapWidth[m] = columnWidth || '0px';
                                mapBounds[m] = 0;
                            }
                            else if (i === table.length - 1) {
                                if (reevaluate && mapBounds[m] === 0) {
                                    mapBounds[m] = td.bounds.width;
                                }
                            }
                        }
                        else {
                            const length = $css$b.isLength(mapWidth[m]);
                            const percent = $css$b.isPercent(columnWidth);
                            if (reevaluate || td.bounds.width < mapBounds[m] || td.bounds.width === mapBounds[m] && (length && percent ||
                                percent && $css$b.isPercent(mapWidth[m]) && $util$d.convertFloat(columnWidth) > $util$d.convertFloat(mapWidth[m]) ||
                                length && $css$b.isLength(columnWidth) && $util$d.convertFloat(columnWidth) > $util$d.convertFloat(mapWidth[m]))) {
                                mapWidth[m] = columnWidth;
                            }
                            if (reevaluate || element.colSpan === 1) {
                                mapBounds[m] = td.bounds.width;
                            }
                        }
                    }
                    if (td.length || td.inlineText) {
                        rowWidth[i] += td.bounds.width + horizontal;
                    }
                    if (spacingWidth > 0) {
                        if (j < tr.length - 1) {
                            td.modifyBox(4 /* MARGIN_RIGHT */, spacingWidth);
                        }
                        if (columnIndex[i] !== 0) {
                            td.modifyBox(16 /* MARGIN_LEFT */, spacingWidth);
                        }
                    }
                    if (spacingHeight > 0) {
                        if (i > 0) {
                            td.modifyBox(2 /* MARGIN_TOP */, spacingHeight);
                        }
                        if (i + element.rowSpan < table.length) {
                            td.modifyBox(8 /* MARGIN_BOTTOM */, spacingHeight);
                        }
                    }
                    columnIndex[i] += element.colSpan;
                    cellCount++;
                });
                columnCount = Math.max(columnCount, columnIndex[i]);
            }
            if (horizontal === 0) {
                node.modifyBox(256 /* PADDING_LEFT */, null);
                node.modifyBox(64 /* PADDING_RIGHT */, null);
            }
            else if (cellCount > 1) {
                node.modifyBox(256 /* PADDING_LEFT */, horizontal);
                node.modifyBox(64 /* PADDING_RIGHT */, horizontal);
            }
            else {
                node.modifyBox(16 /* MARGIN_LEFT */, horizontal);
                node.modifyBox(4 /* MARGIN_RIGHT */, horizontal);
            }
            if (vertical === 0) {
                node.modifyBox(32 /* PADDING_TOP */, null);
                node.modifyBox(128 /* PADDING_BOTTOM */, null);
            }
            else if (cellCount > 1) {
                node.modifyBox(32 /* PADDING_TOP */, vertical);
                node.modifyBox(128 /* PADDING_BOTTOM */, vertical);
            }
            else {
                node.modifyBox(2 /* MARGIN_TOP */, vertical);
                node.modifyBox(8 /* MARGIN_BOTTOM */, vertical);
            }
            if (node.has('width', 2 /* LENGTH */) && mapWidth.some(value => $css$b.isPercent(value))) {
                $util$d.replaceMap(mapWidth, (value, index) => {
                    if (value === 'auto' && mapBounds[index] > 0) {
                        return $css$b.formatPX(mapBounds[index]);
                    }
                    return value;
                });
            }
            if (mapWidth.every(value => $css$b.isPercent(value)) && mapWidth.reduce((a, b) => a + parseFloat(b), 0) > 1) {
                let percentTotal = 100;
                $util$d.replaceMap(mapWidth, value => {
                    const percent = parseFloat(value);
                    if (percentTotal <= 0) {
                        value = '0px';
                    }
                    else if (percentTotal - percent < 0) {
                        value = $css$b.formatPercent(percentTotal);
                    }
                    percentTotal -= percent;
                    return value;
                });
            }
            else if (mapWidth.every(value => $css$b.isLength(value))) {
                const width = mapWidth.reduce((a, b) => a + parseFloat(b), 0);
                if (node.hasWidth) {
                    if (width < node.width) {
                        $util$d.replaceMap(mapWidth, value => value !== '0px' ? `${(parseFloat(value) / width) * 100}%` : value);
                    }
                    else if (width > node.width) {
                        node.css('width', 'auto', true);
                        if (!layoutFixed) {
                            for (const item of node.cascade()) {
                                item.css('width', 'auto', true);
                            }
                        }
                    }
                }
                if (layoutFixed && !node.has('width')) {
                    node.css('width', $css$b.formatPX(node.bounds.width), true);
                }
            }
            const mapPercent = mapWidth.reduce((a, b) => a + ($css$b.isPercent(b) ? parseFloat(b) : 0), 0);
            mainData.layoutType = (() => {
                if (mapWidth.some(value => $css$b.isPercent(value)) || mapWidth.every(value => $css$b.isLength(value) && value !== '0px')) {
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
                            if (td.length && td.every(item => $util$d.withinRange(item.bounds.width, td[0].bounds.width))) {
                                return 0 /* NONE */;
                            }
                            return 3 /* VARIABLE */;
                        }
                    }
                    else if (node.hasWidth) {
                        return 2 /* FIXED */;
                    }
                }
                if (mapWidth.every(value => value === 'auto' || $css$b.isLength(value) && value !== '0px')) {
                    if (!node.hasWidth) {
                        mainData.expand = true;
                    }
                    return 1 /* STRETCH */;
                }
                return 0 /* NONE */;
            })();
            const caption = node.find(item => item.tagName === 'CAPTION');
            node.clear();
            if (caption) {
                if (!caption.hasWidth && !$client$2.isUserAgent(16 /* EDGE */)) {
                    if (caption.textElement) {
                        if (!caption.has('maxWidth')) {
                            caption.css('maxWidth', $css$b.formatPX(caption.bounds.width));
                        }
                    }
                    else if (caption.bounds.width > $math$1.maxArray(rowWidth)) {
                        setBoundsWidth(caption);
                    }
                }
                if (!caption.cssInitial('textAlign')) {
                    caption.css('textAlign', 'center');
                }
                caption.data(EXT_NAME.TABLE, 'colSpan', columnCount);
                caption.parent = node;
            }
            columnIndex = new Array(table.length).fill(0);
            const hasWidth = node.hasWidth;
            for (let i = 0; i < table.length; i++) {
                const tr = table[i];
                const children = tr.duplicate();
                for (let j = 0; j < children.length; j++) {
                    const td = children[j];
                    const element = td.element;
                    const rowSpan = element.rowSpan;
                    const colSpan = element.colSpan;
                    for (let k = 0; k < rowSpan - 1; k++) {
                        const l = (i + 1) + k;
                        if (columnIndex[l] !== undefined) {
                            columnIndex[l] += colSpan;
                        }
                    }
                    if (rowSpan > 1) {
                        td.data(EXT_NAME.TABLE, 'rowSpan', rowSpan);
                    }
                    if (colSpan > 1) {
                        td.data(EXT_NAME.TABLE, 'colSpan', colSpan);
                    }
                    if (!td.has('verticalAlign')) {
                        td.css('verticalAlign', 'middle');
                    }
                    const columnWidth = mapWidth[columnIndex[i]];
                    if (columnWidth !== undefined) {
                        switch (mainData.layoutType) {
                            case 3 /* VARIABLE */:
                                if (columnWidth === 'auto') {
                                    if (mapPercent >= 1) {
                                        setBoundsWidth(td);
                                        td.data(EXT_NAME.TABLE, 'exceed', !hasWidth);
                                        td.data(EXT_NAME.TABLE, 'downsized', true);
                                    }
                                    else {
                                        setAutoWidth(td);
                                    }
                                }
                                else if ($css$b.isPercent(columnWidth)) {
                                    td.data(EXT_NAME.TABLE, 'percent', columnWidth);
                                    td.data(EXT_NAME.TABLE, 'expand', true);
                                }
                                else if ($css$b.isLength(columnWidth) && parseInt(columnWidth) > 0) {
                                    if (td.bounds.width >= parseInt(columnWidth)) {
                                        setBoundsWidth(td);
                                        td.data(EXT_NAME.TABLE, 'expand', false);
                                        td.data(EXT_NAME.TABLE, 'downsized', false);
                                    }
                                    else {
                                        if (layoutFixed) {
                                            setAutoWidth(td);
                                            td.data(EXT_NAME.TABLE, 'downsized', true);
                                        }
                                        else {
                                            setBoundsWidth(td);
                                            td.data(EXT_NAME.TABLE, 'expand', false);
                                        }
                                    }
                                }
                                else {
                                    if (!td.has('width') || td.has('width', 32 /* PERCENT */)) {
                                        setBoundsWidth(td);
                                    }
                                    td.data(EXT_NAME.TABLE, 'expand', false);
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
                                    if (layoutFixed) {
                                        td.data(EXT_NAME.TABLE, 'downsized', true);
                                    }
                                    else {
                                        setBoundsWidth(td);
                                    }
                                    td.data(EXT_NAME.TABLE, 'expand', false);
                                }
                                break;
                        }
                    }
                    columnIndex[i] += colSpan;
                    for (let k = 0; k < rowSpan; k++) {
                        for (let l = 0; l < colSpan; l++) {
                            tableFilled[i + k].push(td);
                        }
                    }
                    td.parent = node;
                }
                if (columnIndex[i] < columnCount) {
                    const td = children[children.length - 1];
                    td.data(EXT_NAME.TABLE, 'spaceSpan', columnCount - columnIndex[i]);
                }
                tr.hide();
            }
            if (borderCollapse) {
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
                        if (td && td.css('visibility') === 'visible') {
                            if (i === 0) {
                                if (td.borderTopWidth < parseInt(borderTopWidth)) {
                                    td.cssApply({
                                        borderTopColor,
                                        borderTopStyle,
                                        borderTopWidth
                                    });
                                }
                                else {
                                    hideTop = true;
                                }
                            }
                            if (i >= 0 && i < rowCount - 1) {
                                const next = tableFilled[i + 1][j];
                                if (next && next !== td && next.css('visibility') === 'visible') {
                                    if (td.borderBottomWidth >= next.borderTopWidth) {
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
                                    });
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
                                    });
                                }
                                else {
                                    hideLeft = true;
                                }
                            }
                            if (j >= 0 && j < columnCount - 1) {
                                const next = tableFilled[i][j + 1];
                                if (next && next !== td && next.css('visibility') === 'visible') {
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
                                    });
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
            node.data(EXT_NAME.TABLE, 'mainData', mainData);
            return undefined;
        }
    }

    const $css$c = squared.lib.css;
    const $util$e = squared.lib.util;
    class VerticalAlign extends Extension {
        condition(node) {
            let valid = false;
            let alignable = 0;
            let inlineVertical = 0;
            for (const item of node) {
                if (item.inlineVertical) {
                    inlineVertical++;
                    if ($util$e.convertInt(item.verticalAlign) !== 0) {
                        valid = true;
                    }
                }
                if (item.positionStatic || item.positionRelative && item.length) {
                    alignable++;
                }
            }
            return valid && inlineVertical > 1 && alignable === node.length && NodeList.linearData(node.children).linearX;
        }
        processNode(node) {
            node.each((item) => {
                if (item.inlineVertical && !item.baseline || item.imageElement) {
                    item.baselineAltered = true;
                }
            });
            return { include: true };
        }
        postConstraints(node) {
            if (node.layoutHorizontal) {
                for (const children of (node.horizontalRows || [node.renderChildren])) {
                    const aboveBaseline = [];
                    let minTop = Number.POSITIVE_INFINITY;
                    let baseline;
                    for (const item of children) {
                        if (item.inlineVertical && item.linear.top <= minTop) {
                            if (item.linear.top < minTop) {
                                aboveBaseline.length = 0;
                            }
                            aboveBaseline.push(item);
                            minTop = item.linear.top;
                        }
                        if (item.baselineActive) {
                            baseline = item;
                        }
                    }
                    if (aboveBaseline.length) {
                        const top = aboveBaseline[0].linear.top;
                        for (const item of children) {
                            if (item !== baseline) {
                                if (item.inlineVertical && !item.baseline && !aboveBaseline.includes(item)) {
                                    let valid = false;
                                    switch (item.verticalAlign) {
                                        case 'super':
                                        case 'sub':
                                            valid = true;
                                            break;
                                        default:
                                            if ($css$c.isLength(item.verticalAlign) || baseline === undefined) {
                                                valid = true;
                                            }
                                            break;
                                    }
                                    if (valid) {
                                        item.modifyBox(2 /* MARGIN_TOP */, item.linear.top - top);
                                    }
                                }
                                if (item.baselineAltered) {
                                    item.css('verticalAlign', '0px', true);
                                }
                            }
                        }
                        if (baseline) {
                            baseline.modifyBox(2 /* MARGIN_TOP */, baseline.linear.top - top);
                            baseline.baselineAltered = true;
                        }
                    }
                }
            }
            else {
                node.each(item => item.baselineAltered = false);
            }
        }
    }

    const $session$5 = squared.lib.session;
    const $css$d = squared.lib.css;
    const $util$f = squared.lib.util;
    const HTML5 = document.doctype ? document.doctype.name === 'html' : false;
    function setMinHeight(node, offset) {
        const minHeight = node.has('minHeight', 2 /* LENGTH */) ? node.toFloat('minHeight') : 0;
        node.css('minHeight', $css$d.formatPX(Math.max(offset, minHeight)));
    }
    function isBlockElement(node) {
        return node ? (node.blockStatic || node.display === 'table') && !node.lineBreak && !node.positioned : false;
    }
    function getVisibleNode(node) {
        if (node.visible) {
            const innerWrapped = node.innerWrapped;
            if (innerWrapped && !innerWrapped.naturalElement) {
                return innerWrapped;
            }
            return node;
        }
        else if (node.excluded) {
            return node;
        }
        return node.renderAs || node.outerWrapper || node.innerWrapped || node;
    }
    function resetMargin(node, value) {
        getVisibleNode(node).modifyBox(value, null);
        if (node.companion) {
            node.companion.modifyBox(value, null);
        }
    }
    function applyMarginCollapse(node, child, direction) {
        if (isBlockElement(child)) {
            let margin;
            let borderWidth;
            let padding;
            let boxMargin;
            if (direction) {
                margin = 'marginTop';
                borderWidth = 'borderTopWidth';
                padding = 'paddingTop';
                boxMargin = 2 /* MARGIN_TOP */;
            }
            else {
                padding = 'paddingBottom';
                borderWidth = 'borderBottomWidth';
                margin = 'marginBottom';
                boxMargin = 8 /* MARGIN_BOTTOM */;
            }
            if (node[borderWidth] === 0 && node[padding] === 0) {
                while (child[margin] === 0 && child[borderWidth] === 0 && child[padding] === 0) {
                    const endChild = (direction ? child.firstChild : child.lastChild);
                    if (isBlockElement(endChild)) {
                        child = endChild;
                    }
                    else {
                        break;
                    }
                }
                if (child.getBox(boxMargin)[0] !== 1) {
                    let resetChild = false;
                    if (node.documentBody) {
                        if (node[margin] >= child[margin]) {
                            resetChild = true;
                        }
                        else {
                            resetMargin(node, boxMargin);
                        }
                    }
                    else {
                        if (HTML5 && node[margin] < child[margin]) {
                            const visibleParent = getVisibleNode(node);
                            visibleParent.modifyBox(boxMargin, null);
                            visibleParent.modifyBox(boxMargin, child[margin]);
                        }
                        resetChild = true;
                    }
                    if (resetChild) {
                        resetMargin(child, boxMargin);
                        if (child.bounds.height === 0) {
                            resetMargin(child, direction ? 8 /* MARGIN_BOTTOM */ : 2 /* MARGIN_TOP */);
                        }
                    }
                }
            }
        }
    }
    class WhiteSpace extends Extension {
        afterBaseLayout() {
            const processed = new Set();
            for (const node of this.application.processing.cache) {
                if (node.naturalElement && !node.layoutElement && node.actualChildren.length) {
                    const children = node.actualChildren;
                    let firstChild;
                    let lastChild;
                    for (let i = 0; i < children.length; i++) {
                        const current = children[i];
                        if (!current.pageFlow) {
                            continue;
                        }
                        if (node.blockStatic) {
                            if (firstChild === undefined) {
                                firstChild = current;
                            }
                            lastChild = current;
                        }
                        if (i === 0) {
                            continue;
                        }
                        if (isBlockElement(current)) {
                            const previousSiblings = current.previousSiblings({ floating: false });
                            if (previousSiblings.length) {
                                const previous = previousSiblings.find(item => !item.floating);
                                if (previous) {
                                    const currentVisible = getVisibleNode(current);
                                    if (isBlockElement(previous)) {
                                        const previousVisible = getVisibleNode(previous);
                                        let marginBottom = $util$f.convertFloat(previous.cssInitial('marginBottom', false, true));
                                        let marginTop = $util$f.convertFloat(current.cssInitial('marginTop', false, true));
                                        if (previous.excluded && !current.excluded) {
                                            const offset = Math.min(marginBottom, $util$f.convertFloat(previous.cssInitial('marginTop', false, true)));
                                            if (offset < 0) {
                                                const top = Math.abs(offset) >= marginTop ? null : offset;
                                                currentVisible.modifyBox(2 /* MARGIN_TOP */, top);
                                                if (currentVisible.companion) {
                                                    currentVisible.companion.modifyBox(2 /* MARGIN_TOP */, top);
                                                }
                                                processed.add(previous);
                                            }
                                        }
                                        else if (!previous.excluded && current.excluded) {
                                            const offset = Math.min(marginTop, $util$f.convertFloat(current.cssInitial('marginBottom', false, true)));
                                            if (offset < 0) {
                                                previousVisible.modifyBox(8 /* MARGIN_BOTTOM */, Math.abs(offset) >= marginBottom ? null : offset);
                                                processed.add(current);
                                            }
                                        }
                                        else {
                                            if (previous.paddingBottom === 0 && previous.borderBottomWidth === 0) {
                                                const bottomChild = previous.lastChild;
                                                if (isBlockElement(bottomChild) && bottomChild.getBox(8 /* MARGIN_BOTTOM */)[0] !== 1) {
                                                    const childMarginBottom = $util$f.convertFloat(bottomChild.cssInitial('marginBottom', false, true));
                                                    if (childMarginBottom > marginBottom) {
                                                        marginBottom = childMarginBottom;
                                                        previousVisible.css('marginBottom', $css$d.formatPX(marginBottom), true);
                                                    }
                                                    resetMargin(getVisibleNode(bottomChild), 8 /* MARGIN_BOTTOM */);
                                                }
                                            }
                                            if (current.borderTopWidth === 0 && current.paddingTop === 0) {
                                                const topChild = current.firstChild;
                                                if (isBlockElement(topChild) && topChild.getBox(2 /* MARGIN_TOP */)[0] !== 1) {
                                                    const childMarginTop = $util$f.convertFloat(topChild.cssInitial('marginTop', false, true));
                                                    if (childMarginTop > marginTop) {
                                                        marginTop = childMarginTop;
                                                        currentVisible.css('marginTop', $css$d.formatPX(marginTop), true);
                                                    }
                                                    resetMargin(getVisibleNode(topChild), 2 /* MARGIN_TOP */);
                                                }
                                            }
                                            if (marginBottom > 0) {
                                                if (marginTop > 0) {
                                                    if (marginTop <= marginBottom) {
                                                        resetMargin(currentVisible, 2 /* MARGIN_TOP */);
                                                    }
                                                    else {
                                                        resetMargin(previousVisible, 8 /* MARGIN_BOTTOM */);
                                                    }
                                                }
                                                else if (previous.bounds.height === 0) {
                                                    resetMargin(previousVisible, 8 /* MARGIN_BOTTOM */);
                                                }
                                            }
                                        }
                                    }
                                    else if (previous.blockDimension && !previous.block && current.length === 0) {
                                        const offset = current.linear.top - previous.linear.bottom;
                                        if (Math.floor(offset) > 0 && current.ascend(false, item => item.has('height')).length === 0) {
                                            currentVisible.modifyBox(2 /* MARGIN_TOP */, offset);
                                        }
                                    }
                                }
                            }
                        }
                    }
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
            for (const node of this.application.processing.excluded) {
                if (!processed.has(node) && node.lineBreak && !node.lineBreakTrailing) {
                    const previousSiblings = node.previousSiblings({ floating: false });
                    const nextSiblings = node.nextSiblings({ floating: false });
                    let valid = false;
                    if (previousSiblings.length && nextSiblings.length) {
                        let above = previousSiblings.pop();
                        let below = nextSiblings.pop();
                        if (above.inlineStatic && below.inlineStatic) {
                            if (previousSiblings.length === 0) {
                                processed.add(node);
                                continue;
                            }
                            else {
                                const abovePrevious = previousSiblings.pop();
                                if (abovePrevious.lineBreak) {
                                    abovePrevious.setBounds();
                                    if (abovePrevious.bounds.bottom !== 0) {
                                        above = abovePrevious;
                                    }
                                }
                            }
                        }
                        valid = true;
                        let offset;
                        if (below.lineHeight > 0 && below.element && below.cssTry('lineHeight', '0px')) {
                            offset = $session$5.getClientRect(below.element, below.sessionId).top - below.marginTop;
                            below.cssFinally('lineHeight');
                        }
                        else {
                            offset = below.linear.top;
                        }
                        if (above.lineHeight > 0 && above.element && above.cssTry('lineHeight', '0px')) {
                            offset -= $session$5.getClientRect(above.element, above.sessionId).bottom + above.marginBottom;
                            above.cssFinally('lineHeight');
                        }
                        else {
                            offset -= above.linear.bottom;
                        }
                        if (offset !== 0) {
                            above = getVisibleNode(above);
                            below = getVisibleNode(below);
                            const aboveParent = above.visible && above.renderParent;
                            const belowParent = below.visible && below.renderParent;
                            if (belowParent && belowParent.groupParent && belowParent.firstChild === below) {
                                belowParent.modifyBox(2 /* MARGIN_TOP */, offset);
                            }
                            else if (aboveParent && aboveParent.groupParent && aboveParent.lastChild === above) {
                                aboveParent.modifyBox(8 /* MARGIN_BOTTOM */, offset);
                            }
                            else if (belowParent && belowParent.layoutVertical && below.visible) {
                                below.modifyBox(2 /* MARGIN_TOP */, offset);
                            }
                            else if (aboveParent && aboveParent.layoutVertical && above.visible) {
                                above.modifyBox(8 /* MARGIN_BOTTOM */, offset);
                            }
                            else {
                                const actualParent = node.actualParent;
                                if (!belowParent && !aboveParent && actualParent && actualParent.visible) {
                                    if (below.lineBreak || below.excluded) {
                                        actualParent.modifyBox(128 /* PADDING_BOTTOM */, offset);
                                    }
                                    else if (above.lineBreak || above.excluded) {
                                        actualParent.modifyBox(32 /* PADDING_TOP */, offset);
                                    }
                                    else {
                                        valid = false;
                                    }
                                }
                                else {
                                    valid = false;
                                }
                            }
                        }
                    }
                    else {
                        const actualParent = node.actualParent;
                        if (actualParent && actualParent.visible) {
                            if (!actualParent.documentRoot && previousSiblings.length) {
                                const previousStart = previousSiblings[previousSiblings.length - 1];
                                const offset = actualParent.box.bottom - previousStart.linear[previousStart.lineBreak || previousStart.excluded ? 'top' : 'bottom'];
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
                                const offset = nextStart.linear[nextStart.lineBreak || nextStart.excluded ? 'bottom' : 'top'] - actualParent.box.top;
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
                    }
                    if (valid) {
                        for (const item of previousSiblings) {
                            processed.add(item);
                        }
                        for (const item of nextSiblings) {
                            processed.add(item);
                        }
                    }
                }
            }
        }
        afterConstraints() {
            const modified = [];
            for (let node of this.application.processing.cache) {
                const renderParent = node.renderAs ? node.renderAs.renderParent : node.renderParent;
                if (renderParent && node.pageFlow && node.styleElement && node.inlineVertical && !node.positioned && !node.documentParent.layoutElement && !renderParent.tableElement && !modified.includes(node.id)) {
                    function setSpacingOffset(region, value) {
                        const offset = (region === 16 /* MARGIN_LEFT */ ? node.actualRect('left') : node.actualRect('top')) - value;
                        if (offset > 0) {
                            node = getVisibleNode(node.outerWrapper || node);
                            node.modifyBox(region, offset);
                            modified.push(node.id);
                        }
                    }
                    if (renderParent.layoutVertical) {
                        if (node.blockDimension && !node.lineBreakLeading) {
                            const index = renderParent.renderChildren.findIndex(item => item === node);
                            if (index > 0) {
                                setSpacingOffset(2 /* MARGIN_TOP */, renderParent.renderChildren[index - 1].linear.bottom);
                            }
                        }
                    }
                    else if (!node.alignParent('left')) {
                        let current = node;
                        while (true) {
                            const previous = current.previousSiblings();
                            if (previous.length && !previous.some(item => item.lineBreak || item.excluded && item.blockStatic)) {
                                const previousSibling = previous.pop();
                                if (previousSibling.inlineVertical) {
                                    setSpacingOffset(16 /* MARGIN_LEFT */, previousSibling.actualRect('right'));
                                }
                                else if (previousSibling.floating) {
                                    current = previousSibling;
                                    continue;
                                }
                            }
                            break;
                        }
                    }
                    else if (renderParent.horizontalRows && node.blockDimension && !node.floating) {
                        found: {
                            let maxBottom = 0;
                            for (let i = 0; i < renderParent.horizontalRows.length; i++) {
                                const row = renderParent.horizontalRows[i];
                                for (let j = 0; j < row.length; j++) {
                                    if (node === row[j]) {
                                        if (i > 0) {
                                            setSpacingOffset(2 /* MARGIN_TOP */, maxBottom);
                                        }
                                        break found;
                                    }
                                }
                                let valid = false;
                                for (const item of row) {
                                    if (item.blockDimension && !item.floating && item.linear.bottom > maxBottom) {
                                        maxBottom = item.linear.bottom;
                                        valid = true;
                                    }
                                }
                                if (!valid) {
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
        External,
        Flexbox,
        Grid,
        List,
        Relative,
        Sprite,
        Substitute,
        Table,
        VerticalAlign,
        WhiteSpace
    };
    const lib = {
        constant,
        enumeration
    };

    exports.Application = Application;
    exports.Controller = Controller;
    exports.Extension = Extension;
    exports.ExtensionManager = ExtensionManager;
    exports.File = File;
    exports.Layout = Layout;
    exports.Node = Node;
    exports.NodeGroup = NodeGroup;
    exports.NodeList = NodeList;
    exports.Resource = Resource;
    exports.extensions = extensions;
    exports.lib = lib;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
