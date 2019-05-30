/* squared.base 1.0.0
   https://github.com/anpham6/squared */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory((global.squared = global.squared || {}, global.squared.base = {})));
}(this, function (exports) { 'use strict';

    const $const = squared.lib.constant;
    const $css = squared.lib.css;
    const $math = squared.lib.math;
    const $util = squared.lib.util;
    class NodeList extends squared.lib.base.Container {
        constructor(children) {
            super(children);
            this._currentId = 0;
        }
        static outerRegion(node) {
            let top = node.item(0);
            let right = top;
            let bottom = top;
            let left = top;
            node.each((item, index) => {
                if (index > 0) {
                    if (item.actualRect($const.CSS.TOP) < top.actualRect($const.CSS.TOP)) {
                        top = item;
                    }
                    if (item.actualRect($const.CSS.RIGHT) > right.actualRect($const.CSS.RIGHT)) {
                        right = item;
                    }
                    if (item.actualRect($const.CSS.BOTTOM) > bottom.actualRect($const.CSS.BOTTOM)) {
                        bottom = item;
                    }
                    if (item.actualRect($const.CSS.LEFT) < left.actualRect($const.CSS.LEFT)) {
                        left = item;
                    }
                }
            });
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
                else {
                    const innerWrapped = node.innerWrapped;
                    if (innerWrapped && innerWrapped.naturalElement && innerWrapped.actualParent) {
                        return innerWrapped.actualParent;
                    }
                    else if (node.groupParent) {
                        const parent = NodeList.actualParent(node.actualChildren);
                        if (parent) {
                            return parent;
                        }
                    }
                }
            }
            return null;
        }
        static baseline(list, text = false) {
            list = $util.filterArray(list, item => {
                if ((item.baseline || $css.isLength(item.verticalAlign)) && (!text || item.textElement && item.naturalElement)) {
                    return !item.floating && !item.baselineAltered && (item.naturalElement && item.length === 0 || !item.layoutVertical && item.every(child => child.baseline && !child.multiline));
                }
                return false;
            });
            if (list.length > 1) {
                list.sort((a, b) => {
                    if (a.length && b.length === 0) {
                        return 1;
                    }
                    else if (b.length && a.length === 0) {
                        return -1;
                    }
                    let heightA = a.baselineHeight;
                    let heightB = b.baselineHeight;
                    if (a.marginTop !== 0) {
                        if (a.imageElement || heightA >= heightB || a.marginTop < 0) {
                            heightA += a.marginTop;
                        }
                        else {
                            return a.marginTop > ((heightB - heightA) / 2) ? -1 : 1;
                        }
                    }
                    if (b.marginTop !== 0) {
                        if (b.imageElement || heightB >= heightA || b.marginTop < 0) {
                            heightB += b.marginTop;
                        }
                        else {
                            return b.marginTop > ((heightA - heightB) / 2) ? 1 : -1;
                        }
                    }
                    if (!$math.isEqual(heightA, heightB)) {
                        return heightA > heightB ? -1 : 1;
                    }
                    else if (a.inputElement && b.inputElement && a.containerType !== b.containerType) {
                        return a.containerType > b.containerType ? -1 : 1;
                    }
                    else if (a.bounds.bottom > b.bounds.bottom) {
                        return -1;
                    }
                    else if (a.bounds.bottom < b.bounds.bottom) {
                        return 1;
                    }
                    return 0;
                });
            }
            return list.shift();
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
                                case $const.CSS.LEFT:
                                    previousFloat.push(clearable.left);
                                    break;
                                case $const.CSS.RIGHT:
                                    previousFloat.push(clearable.right);
                                    break;
                                case 'both':
                                    previousFloat.push(clearable.left, clearable.right);
                                    break;
                            }
                            for (const item of previousFloat) {
                                if (item && floating.has(item.float) && !node.floating && $util.aboveRange(node.linear.top, item.linear.bottom)) {
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
                    else if (node.positionAuto) {
                        nodes.push(node);
                    }
                }
                if (nodes.length) {
                    if (!clearOnly) {
                        const siblings = [nodes[0]];
                        let x = 1;
                        let y = 1;
                        for (let i = 1; i < nodes.length; i++) {
                            if (nodes[i].alignedVertically(siblings, cleared)) {
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
                                    if (node.float === $const.CSS.LEFT) {
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
                                if (previous.floating && $util.aboveRange(item.linear.top, previous.linear.bottom) || $util.withinRange(item.linear.left, previous.linear.left)) {
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
            function includes(node) {
                if (list.includes(node)) {
                    return node;
                }
                let current = node.outerWrapper;
                while (current) {
                    if (list.includes(current)) {
                        return current;
                    }
                    current = current.outerWrapper;
                }
                return undefined;
            }
            for (let i = 0; i < children.length; i++) {
                let node = children[i];
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
                if (i === 0 || node.siblingsLeading.length === 0) {
                    node = includes(node);
                    if (node) {
                        row.push(node);
                    }
                }
                else {
                    if (node.alignedVertically(row, cleared)) {
                        if (row.length) {
                            result.push(row);
                        }
                        node = includes(node);
                        if (node) {
                            row = [node];
                        }
                        else {
                            row = [];
                        }
                    }
                    else {
                        node = includes(node);
                        if (node) {
                            row.push(node);
                        }
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
            const length = this.children.length;
            if (length) {
                if (length > 1) {
                    const linearData = NodeList.linearData(this.children);
                    this._floated = linearData.floated;
                    this._cleared = linearData.cleared;
                    this._linearX = linearData.linearX;
                    this._linearY = linearData.linearY;
                }
                else {
                    this._linearY = this.item(0).blockStatic;
                    this._linearX = !this._linearY;
                }
                let A = 0;
                let B = 0;
                for (let i = 0; i < length; i++) {
                    const item = this.item(i);
                    if (item.floating) {
                        A++;
                    }
                    if (item.rightAligned) {
                        B++;
                    }
                }
                if (A === length || this._floated && this._floated.size === 2) {
                    this.add(512 /* FLOAT */);
                    if (this.some(node => node.blockStatic)) {
                        this.add(64 /* BLOCK */);
                    }
                }
                if (B === length) {
                    this.add(2048 /* RIGHT */);
                }
                this.itemCount = length;
            }
        }
        reset(parent, node) {
            this.containerType = 0;
            this.alignmentType = 0;
            this.rowCount = 0;
            this.columnCount = 0;
            this.renderType = 0;
            this.renderIndex = -1;
            this.itemCount = 0;
            this._linearX = undefined;
            this._linearY = undefined;
            this._floated = undefined;
            this._cleared = undefined;
            if (parent) {
                this.parent = parent;
            }
            if (node) {
                this.node = node;
            }
            this.clear();
        }
        setType(containerType, alignmentType) {
            this.containerType = containerType;
            if (alignmentType) {
                this.add(alignmentType);
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
        get linearX() {
            return this._linearX !== undefined ? this._linearX : true;
        }
        get linearY() {
            return this._linearY !== undefined ? this._linearY : false;
        }
        get floated() {
            return this._floated || new Set();
        }
        get cleared() {
            return this._cleared || new Map();
        }
        get singleRowAligned() {
            if (this._singleRow === undefined) {
                if (this.length) {
                    this._singleRow = true;
                    if (this.length > 1) {
                        let previousBottom = Number.POSITIVE_INFINITY;
                        for (const node of this.children) {
                            if (node.multiline || node.blockStatic) {
                                this._singleRow = false;
                                break;
                            }
                            else {
                                if ($util$1.aboveRange(node.linear.top, previousBottom)) {
                                    this._singleRow = false;
                                    break;
                                }
                                previousBottom = node.linear.bottom;
                            }
                        }
                    }
                }
                else {
                    return false;
                }
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
        NODE_PROCEDURE[NODE_PROCEDURE["ACCESSIBILITY"] = 16] = "ACCESSIBILITY";
        NODE_PROCEDURE[NODE_PROCEDURE["LOCALIZATION"] = 32] = "LOCALIZATION";
        NODE_PROCEDURE[NODE_PROCEDURE["CUSTOMIZATION"] = 64] = "CUSTOMIZATION";
        NODE_PROCEDURE[NODE_PROCEDURE["ALL"] = 126] = "ALL";
    })(NODE_PROCEDURE || (NODE_PROCEDURE = {}));

    var enumeration = /*#__PURE__*/Object.freeze({
        get APP_SECTION () { return APP_SECTION; },
        get NODE_RESOURCE () { return NODE_RESOURCE; },
        get NODE_PROCEDURE () { return NODE_PROCEDURE; }
    });

    const $const$1 = squared.lib.constant;
    const $css$1 = squared.lib.css;
    const $dom = squared.lib.dom;
    const $regex = squared.lib.regex;
    const $session = squared.lib.session;
    const $util$2 = squared.lib.util;
    const $xml = squared.lib.xml;
    const CACHE_PATTERN = {};
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
    function getImageSvgAsync(value) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(value, {
                method: 'GET',
                headers: new Headers({ 'Accept': 'application/xhtml+xml, image/svg+xml', 'Content-Type': 'image/svg+xml' })
            });
            return yield response.text();
        });
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
                if (node.documentRoot && node.renderChildren.length === 0 && !node.inlineText && node.actualChildren.every(item => item.documentRoot)) {
                    continue;
                }
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
                    if (node.naturalElement && !node.pseudoElement) {
                        const element = node.element;
                        $session.deleteElementCache(element, 'node', id);
                        $session.deleteElementCache(element, 'styleMap', id);
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
                if (element && $css$1.hasComputedStyle(element)) {
                    this.rootElements.add(element);
                }
            }
            const ASSETS = this.resourceHandler.assets;
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
                            ASSETS.images.set(uri, { width: image.width, height: image.height, uri });
                        }
                    });
                    element.querySelectorAll('svg image').forEach((image) => {
                        const uri = $util$2.resolvePath(image.href.baseVal);
                        if (uri !== '') {
                            ASSETS.images.set(uri, { width: image.width.baseVal.value, height: image.height.baseVal.value, uri });
                        }
                    });
                }
                for (const image of ASSETS.images.values()) {
                    if (image.uri) {
                        if (image.uri.toLowerCase().endsWith('.svg')) {
                            images.push(image.uri);
                        }
                        else if (image.width === 0 && image.height === 0) {
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
                }
            }
            for (const [uri, data] of ASSETS.rawData.entries()) {
                if (data.mimeType && data.mimeType.startsWith('image/') && !data.mimeType.endsWith('svg+xml')) {
                    const element = document.createElement('img');
                    element.src = `data:${data.mimeType};` + (data.base64 ? `base64,${data.base64}` : data.content);
                    if (element.complete && element.naturalWidth > 0 && element.naturalHeight > 0) {
                        data.width = element.naturalWidth;
                        data.height = element.naturalHeight;
                        ASSETS.images.set(uri, { width: data.width, height: data.height, uri: data.filename });
                    }
                    else {
                        document.body.appendChild(element);
                        preloadImages.push(element);
                    }
                }
            }
            for (const element of this.rootElements) {
                element.querySelectorAll('img').forEach((image) => {
                    if (image.tagName === 'IMG') {
                        if (image.src.toLowerCase().endsWith('.svg')) {
                            if (this.userSettings.preloadImages) {
                                images.push(image.src);
                            }
                        }
                        else if (image.complete) {
                            this.resourceHandler.addImage(image);
                        }
                        else if (this.userSettings.preloadImages) {
                            images.push(image);
                        }
                    }
                });
            }
            if (images.length) {
                this.initialized = true;
                Promise.all($util$2.objectMap(images, image => {
                    return new Promise((resolve, reject) => {
                        if (typeof image === 'string') {
                            resolve(getImageSvgAsync(image));
                        }
                        else {
                            image.onload = () => resolve(image);
                            image.onerror = () => reject(image);
                        }
                    });
                }))
                    .then((result) => {
                    for (let i = 0; i < result.length; i++) {
                        const value = result[i];
                        if (typeof value === 'string') {
                            if (typeof images[i] === 'string') {
                                this.resourceHandler.addRawData(images[i], 'image/svg+xml', 'utf8', value);
                            }
                        }
                        else {
                            value.onload = null;
                            value.onerror = null;
                            this.resourceHandler.addImage(value);
                        }
                    }
                    parseResume();
                })
                    .catch((error) => {
                    const message = error.target ? error.target.src : error['message'];
                    if (!this.userSettings.showErrorMessages || !$util$2.isString(message) || confirm(`FAIL: ${message}`)) {
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
                const layout = {
                    pathname: pathname ? $util$2.trimString(pathname, '/') : this.controllerHandler.localSettings.layout.pathName,
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
            return layout.itemCount === 0 ? this.controllerHandler.renderNode(layout) : this.controllerHandler.renderNodeGroup(layout);
        }
        addLayout(layout) {
            if ($util$2.hasBit(layout.renderType, 512 /* FLOAT */)) {
                if ($util$2.hasBit(layout.renderType, 8 /* HORIZONTAL */)) {
                    layout = this.processFloatHorizontal(layout);
                }
                else if ($util$2.hasBit(layout.renderType, 16 /* VERTICAL */)) {
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
                element.style.setProperty(attr, value);
            }
            let resetBounds = false;
            const CACHE = this.processing.cache;
            for (const node of CACHE) {
                if (node.styleElement) {
                    const element = node.element;
                    if (node.length) {
                        const textAlign = node.cssInitial('textAlign');
                        switch (textAlign) {
                            case $const$1.CSS.CENTER:
                            case $const$1.CSS.RIGHT:
                            case $const$1.CSS.END:
                                saveAlignment(element, node.id, 'text-align', $const$1.CSS.LEFT, textAlign);
                                break;
                        }
                    }
                    if (node.positionRelative) {
                        for (const attr of $css$1.BOX_POSITION) {
                            if (node.has(attr)) {
                                saveAlignment(element, node.id, attr, $const$1.CSS.AUTO, node.css(attr));
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
            for (const node of CACHE) {
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
                            element.id = `id_${Math.round(Math.random() * new Date().getTime())}`;
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
            for (const node of CACHE) {
                if (node.styleElement) {
                    const element = node.element;
                    const reset = preAlignment[node.id];
                    if (reset) {
                        for (const attr in reset) {
                            element.style.setProperty(attr, reset[attr]);
                        }
                    }
                    if (direction.has(element)) {
                        element.dir = 'rtl';
                    }
                }
                node.saveAsInitial();
            }
            this.controllerHandler.evaluateNonStatic(rootNode, CACHE);
            CACHE.sort((a, b) => {
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
                const controller = this.controllerHandler;
                if (controller.localSettings.unsupported.cascade.has(element.tagName)) {
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
                    else if (controller.includeElement(childElement)) {
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
                            const child = this.insertNode(childElement);
                            if (child) {
                                child.documentRoot = true;
                                child.visible = false;
                                child.excluded = true;
                                children.push(child);
                            }
                            includeText = true;
                        }
                    }
                }
                const length = children.length;
                if (length) {
                    let siblingsLeading = [];
                    let siblingsTrailing = [];
                    if (length > 1) {
                        let trailing = children[0];
                        let floating = false;
                        for (let i = 0; i < length; i++) {
                            const child = children[i];
                            if (child.excluded) {
                                this.processing.excluded.append(child);
                            }
                            else if (includeText || !child.plainText) {
                                child.parent = node;
                                this.processing.cache.append(child);
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
                            child.siblingIndex = i;
                        }
                        trailing.siblingsTrailing = siblingsTrailing;
                        node.floatContainer = floating;
                    }
                    else {
                        const child = children[0];
                        if (child.excluded) {
                            this.processing.excluded.append(child);
                        }
                        else {
                            child.siblingsLeading = siblingsLeading;
                            child.siblingsTrailing = siblingsTrailing;
                            if (includeText || !child.plainText) {
                                child.parent = node;
                                this.processing.cache.append(child);
                            }
                        }
                    }
                }
                node.setInlineText(!includeText);
                node.actualChildren = children;
            }
            return node;
        }
        setBaseLayout(layoutName) {
            const CACHE = this.processing.cache;
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
            for (const node of CACHE) {
                if (node.visible) {
                    setMapY(node.depth, node.id, node);
                    maxDepth = Math.max(node.depth, maxDepth);
                }
            }
            for (let i = 0; i < maxDepth; i++) {
                mapY.set((i * -1) - 2, new Map());
            }
            CACHE.afterAppend = (node) => {
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
                    const hasFloat = parent.floatContainer;
                    const length = axisY.length;
                    let cleared;
                    if (hasFloat) {
                        cleared = NodeList.linearData(parent.actualChildren, true).cleared;
                    }
                    for (let k = 0; k < length; k++) {
                        let nodeY = axisY[k];
                        if (nodeY.rendered || !nodeY.visible || nodeY.naturalElement && !nodeY.documentRoot && this.rootElements.has(nodeY.element)) {
                            continue;
                        }
                        let parentY = nodeY.parent;
                        if (length > 1 && k < length - 1 && nodeY.pageFlow && (parentY.alignmentType === 0 || parentY.hasAlign(2 /* UNKNOWN */) || nodeY.hasAlign(8192 /* EXTENDABLE */)) && !parentY.hasAlign(4 /* AUTO_LAYOUT */) && nodeY.hasSection(APP_SECTION.DOM_TRAVERSE)) {
                            const horizontal = [];
                            const vertical = [];
                            let extended = false;
                            function checkHorizontal(node) {
                                if (vertical.length || extended) {
                                    return false;
                                }
                                horizontal.push(node);
                                return true;
                            }
                            function checkVertical(node) {
                                if (horizontal.length) {
                                    return false;
                                }
                                vertical.push(node);
                                return true;
                            }
                            let l = k;
                            let m = 0;
                            if (nodeY.hasAlign(8192 /* EXTENDABLE */) && parentY.layoutVertical) {
                                horizontal.push(nodeY);
                                l++;
                                m++;
                            }
                            traverse: {
                                let floatActive;
                                let floatCleared;
                                if (hasFloat) {
                                    floatActive = new Set();
                                    floatCleared = new Map();
                                }
                                for (; l < length; l++, m++) {
                                    const item = axisY[l];
                                    if (item.pageFlow) {
                                        if (hasFloat) {
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
                                                if (!item.horizontalAligned || next.alignedVertically([item])) {
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
                                            if (hasFloat) {
                                                const status = item.alignedVertically(horizontal.length ? horizontal : vertical, floatCleared, horizontal.length > 0);
                                                if (status > 0) {
                                                    if (horizontal.length) {
                                                        if (status !== 7 /* FLOAT_INTERSECT */ && status !== 6 /* FLOAT_BLOCK */ && floatActive.size && floatCleared.get(item) !== 'both' && !item.siblingsLeading.some((node) => node.lineBreak && !cleared.has(node))) {
                                                            if (!item.floating || previous.floating && !$util$2.aboveRange(item.linear.top, previous.linear.bottom)) {
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
                                                                        $util$2.captureMap(horizontal, node => node.floating, node => floatBottom = Math.max(floatBottom, node.linear.bottom));
                                                                    }
                                                                    if (!item.floating && !$util$2.aboveRange(item.linear.top, floatBottom) || item.floating && floatActive.has(item.float)) {
                                                                        horizontal.push(item);
                                                                        if (!item.floating && $util$2.aboveRange(item.linear.bottom, floatBottom)) {
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
                                                    if (!checkVertical(item)) {
                                                        break traverse;
                                                    }
                                                }
                                                else if (!checkHorizontal(item)) {
                                                    break traverse;
                                                }
                                            }
                                            else {
                                                if (item.alignedVertically()) {
                                                    if (!checkVertical(item)) {
                                                        break traverse;
                                                    }
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
                                    else if (item.positionAuto) {
                                        if (vertical.length) {
                                            if (vertical[vertical.length - 1].blockStatic) {
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
                                layout = this.controllerHandler.processTraverseHorizontal(new Layout(parentY, nodeY, 0, 0, horizontal), axisY);
                                segEnd = horizontal[horizontal.length - 1];
                            }
                            else if (vertical.length > 1) {
                                layout = this.controllerHandler.processTraverseVertical(new Layout(parentY, nodeY, 0, 0, vertical), axisY);
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
                                            if (result.output && result.include !== false || result.include === true) {
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
                            let layout = this.createLayoutControl(parentY, nodeY);
                            if (layout.containerType === 0) {
                                const result = nodeY.length ? this.controllerHandler.processUnknownParent(layout) : this.controllerHandler.processUnknownChild(layout);
                                if (result.next === true) {
                                    continue;
                                }
                                layout = result.layout;
                            }
                            this.addLayout(layout);
                        }
                    }
                }
            }
            for (const node of CACHE) {
                if (node.documentRoot && node.rendered) {
                    this.session.documentRoot.push({ node, layoutName: node === documentRoot ? layoutName : '' });
                }
            }
            CACHE.sort((a, b) => {
                if (a.depth === b.depth) {
                    if (a.groupParent && (b.length === 0 || b.naturalElement)) {
                        return -1;
                    }
                    else if (b.groupParent && (a.length === 0 || a.naturalElement)) {
                        return 1;
                    }
                    return 0;
                }
                return a.depth < b.depth ? -1 : 1;
            });
            this.session.cache.concat(CACHE.children);
            this.session.excluded.concat(this.processing.excluded.children);
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
                    const cleared = layout.cleared.get(node);
                    if (cleared) {
                        switch (cleared) {
                            case $const$1.CSS.LEFT:
                                if (!$util$2.hasBit(clearedFloat, 2)) {
                                    clearedFloat |= 2;
                                }
                                break;
                            case $const$1.CSS.RIGHT:
                                if (!$util$2.hasBit(clearedFloat, 4)) {
                                    clearedFloat |= 4;
                                }
                                break;
                            default:
                                clearedFloat = 6;
                                break;
                        }
                    }
                }
                if (clearedFloat === 0) {
                    if (node.float === $const$1.CSS.RIGHT) {
                        rightAbove.push(node);
                    }
                    else if (node.float === $const$1.CSS.LEFT) {
                        leftAbove.push(node);
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
                else if (node.float === $const$1.CSS.RIGHT) {
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
                else if (node.float === $const$1.CSS.LEFT) {
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
                else if (clearedFloat === 6) {
                    inlineBelow.push(node);
                }
                else {
                    inlineAbove.push(node);
                }
            });
            if (leftAbove.length && leftBelow) {
                leftSub = [leftAbove, leftBelow];
            }
            else if (leftAbove.length) {
                leftSub = leftAbove;
            }
            if (rightAbove.length && rightBelow) {
                rightSub = [rightAbove, rightBelow];
            }
            else if (rightAbove.length) {
                rightSub = rightAbove;
            }
            const { containerType, alignmentType } = controller.containerTypeVertical;
            const verticalMargin = controller.containerTypeVerticalMargin;
            if (rightAbove.length + (rightBelow ? rightBelow.length : 0) === layout.length) {
                layout.add(2048 /* RIGHT */);
            }
            if (inlineBelow.length) {
                if (inlineBelow.length > 1) {
                    inlineBelow[0].addAlign(8192 /* EXTENDABLE */);
                }
                inlineBelow.unshift(layout.node);
                const parent = this.createNode($dom.createElement(layout.node.actualParent && layout.node.actualParent.element), true, layout.parent, inlineBelow);
                this.addLayout(new Layout(layout.parent, parent, containerType, alignmentType | (layout.parent.blockStatic ? 64 /* BLOCK */ : 0), inlineBelow));
                layout.parent = parent;
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
            layout.setType(verticalMargin.containerType, verticalMargin.alignmentType);
            layout.itemCount = layerIndex.length;
            layout.add(64 /* BLOCK */);
            for (const item of layerIndex) {
                let segments;
                let floatgroup;
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
                        const group = new Layout(layout.node, floatgroup, containerType, alignmentType | (segments.some(seg => seg === rightSub || seg === rightAbove) ? 2048 /* RIGHT */ : 0));
                        group.itemCount = segments.length;
                        this.addLayout(group);
                    }
                }
                else {
                    segments = [item];
                }
                for (const seg of segments) {
                    const node = floatgroup || layout.node;
                    const target = controller.createNodeGroup(seg[0], seg, node, true);
                    const group = new Layout(node, target, 0, 128 /* SEGMENTED */ | (seg === inlineAbove ? 256 /* COLUMN */ : 0), seg);
                    if (seg.length === 1) {
                        group.node.innerWrapped = seg[0];
                        seg[0].outerWrapper = group.node;
                        if (seg[0].percentWidth) {
                            const percent = this.controllerHandler.containerTypePercent;
                            group.setType(percent.containerType, percent.alignmentType);
                        }
                        else {
                            group.setType(containerType, alignmentType);
                        }
                    }
                    else if (group.linearY) {
                        group.setType(containerType, alignmentType);
                    }
                    else {
                        controller.processLayoutHorizontal(group);
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
            const controller = this.controllerHandler;
            const { containerType, alignmentType } = controller.containerTypeVertical;
            if (layout.containerType !== 0) {
                const parent = controller.createNodeGroup(layout.node, [layout.node], layout.parent);
                this.addLayout(new Layout(parent, layout.node, containerType, alignmentType, parent.children));
                layout.node = parent;
            }
            else {
                layout.containerType = containerType;
                layout.add(alignmentType);
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
                            const verticalMargin = controller.containerTypeVerticalMargin;
                            const basegroup = controller.createNodeGroup(floating[0] || pageFlow[0], [], layout.node);
                            const layoutGroup = new Layout(layout.node, basegroup, verticalMargin.containerType, verticalMargin.alignmentType);
                            const children = [];
                            let subgroup;
                            if (floating.length) {
                                const floatgroup = controller.createNodeGroup(floating[0], floating, basegroup);
                                layoutGroup.add(512 /* FLOAT */);
                                if (pageFlow.length === 0 && floating.every(item => item.float === $const$1.CSS.RIGHT)) {
                                    layoutGroup.add(2048 /* RIGHT */);
                                }
                                children.push(floatgroup);
                            }
                            if (pageFlow.length) {
                                subgroup = controller.createNodeGroup(pageFlow[0], pageFlow, basegroup);
                                children.push(subgroup);
                            }
                            basegroup.init();
                            layoutGroup.itemCount = children.length;
                            this.addLayout(layoutGroup);
                            for (let node of children) {
                                if (!node.groupParent) {
                                    node = controller.createNodeGroup(node, [node], basegroup, true);
                                }
                                this.addLayout(new Layout(basegroup, node, containerType, alignmentType | 128 /* SEGMENTED */ | 64 /* BLOCK */, node.children));
                            }
                            if (pageFlow.length && floating.length) {
                                const [leftAbove, rightAbove] = $util$2.partitionArray(floating, item => item.float !== 'right');
                                this.setFloatPadding(layout.node, subgroup, pageFlow, leftAbove, rightAbove);
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
                        if ($css$1.getStyle(current).display === $const$1.CSS.NONE) {
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
                if ($util$2.trimString(styleMap.content, '"').trim() === '' && $util$2.convertFloat(styleMap.width) === 0 && $util$2.convertFloat(styleMap.height) === 0 && (styleMap.position === 'absolute' || styleMap.position === 'fixed' || styleMap.clear && styleMap.clear !== $const$1.CSS.NONE)) {
                    let valid = true;
                    for (const attr in styleMap) {
                        if (/(Width|Height)$/.test(attr) && $css$1.isLength(styleMap[attr], true) && $util$2.convertFloat(styleMap[attr]) !== 0) {
                            valid = false;
                            break;
                        }
                    }
                    if (valid) {
                        return undefined;
                    }
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
                    styleMap.fontSize = $css$1.convertPX(styleMap.fontSize);
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
                        if (target === 'before') {
                            content = '&quot;';
                        }
                        break;
                    case 'close-quote':
                        if (target === 'after') {
                            content = '&quot;';
                        }
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
                            if (CACHE_PATTERN.COUNTERS === undefined) {
                                CACHE_PATTERN.COUNTERS = /\s*(?:attr\(([^)]+)\)|(counter)\(([^,)]+)(?:, ([a-z\-]+))?\)|(counters)\(([^,]+), "([^"]*)"(?:, ([a-z\-]+))?\)|"([^"]+)")\s*/g;
                            }
                            let found = false;
                            let match;
                            while ((match = CACHE_PATTERN.COUNTERS.exec(value)) !== null) {
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
                                        if (name !== $const$1.CSS.NONE) {
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
                                    function incrementCounter(increment, pseudo) {
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
                                                        incrementCounter(increment, false);
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
                                                incrementCounter(counterIncrement, false);
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
            const applyStyleSheet = (item) => {
                try {
                    if (item.cssRules) {
                        for (let j = 0; j < item.cssRules.length; j++) {
                            const rule = item.cssRules[j];
                            switch (rule.type) {
                                case CSSRule.STYLE_RULE:
                                case CSSRule.FONT_FACE_RULE:
                                    this.applyStyleRule(rule);
                                    break;
                                case CSSRule.IMPORT_RULE:
                                    applyStyleSheet(rule.styleSheet);
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
                    if (this.userSettings.showErrorMessages && !warning) {
                        alert('CSS cannot be parsed inside <link> tags when loading files directly from your hard drive or from external websites. ' +
                            'Either use a local web server, embed your CSS into a <style> tag, or you can also try using a different browser. ' +
                            'See the README for more detailed instructions.\n\n' +
                            `${item.href}\n\n${error}`);
                        warning = true;
                    }
                }
            };
            for (let i = 0; i < document.styleSheets.length; i++) {
                applyStyleSheet(document.styleSheets[i]);
            }
        }
        applyCSSRuleList(rules) {
            for (let i = 0; i < rules.length; i++) {
                this.applyStyleRule(rules[i]);
            }
        }
        applyStyleRule(item) {
            const sessionId = this.processing.sessionId;
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
                            const styleMap = {};
                            for (const attr of fromRule) {
                                const value = $css$1.checkStyleValue(element, attr, item.style[attr], style);
                                if (value) {
                                    styleMap[attr] = value;
                                }
                            }
                            [styleMap.backgroundImage, styleMap.listStyleImage, styleMap.content].forEach(image => {
                                if (image) {
                                    const pattern = new RegExp(`url\\("(${$regex.STRING.DATAURI})"\\),?\\s*`, 'g');
                                    let match;
                                    while ((match = pattern.exec(image)) !== null) {
                                        if (match[2] && match[3]) {
                                            this.resourceHandler.addRawData(match[1], match[2], match[3], match[4]);
                                        }
                                        else if (this.userSettings.preloadImages) {
                                            const uri = $util$2.resolvePath(match[4]);
                                            if (uri !== '' && this.resourceHandler.getImage(uri) === undefined) {
                                                this.resourceHandler.assets.images.set(uri, { width: 0, height: 0, uri });
                                            }
                                        }
                                    }
                                }
                            });
                            const attrStyle = `styleMap${targetElt}`;
                            const attrSpecificity = `styleSpecificity${targetElt}`;
                            const styleData = $session.getElementCache(element, attrStyle, sessionId);
                            if (styleData) {
                                const specificityData = $session.getElementCache(element, attrSpecificity, sessionId) || {};
                                for (const attr in styleMap) {
                                    if (specificityData[attr] === undefined || specificity >= specificityData[attr]) {
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
                                $session.setElementCache(element, 'sessionId', '0', sessionId);
                                $session.setElementCache(element, attrStyle, sessionId, styleMap);
                                $session.setElementCache(element, attrSpecificity, sessionId, specificityData);
                            }
                        });
                    }
                    break;
                }
                case CSSRule.FONT_FACE_RULE: {
                    if (CACHE_PATTERN.FONT_FACE === undefined) {
                        CACHE_PATTERN.FONT_FACE = /\s*@font-face\s*{([^}]+)}\s*/;
                        CACHE_PATTERN.FONT_FAMILY = /\s*font-family:[^\w]*([^'";]+)/;
                        CACHE_PATTERN.FONT_SRC = /\s*src:\s*([^;]+);/;
                        CACHE_PATTERN.FONT_STYLE = /\s*font-style:\s*(\w+)\s*;/;
                        CACHE_PATTERN.FONT_WEIGHT = /\s*font-weight:\s*(\d+)\s*;/;
                        CACHE_PATTERN.URL = /\s*(url|local)\(['"]([^'")]+)['"]\)\s*format\(['"](\w+)['"]\)\s*/;
                    }
                    const match = CACHE_PATTERN.FONT_FACE.exec(item.cssText);
                    if (match) {
                        const familyMatch = CACHE_PATTERN.FONT_FAMILY.exec(match[1]);
                        const srcMatch = CACHE_PATTERN.FONT_SRC.exec(match[1]);
                        if (familyMatch && srcMatch) {
                            const styleMatch = CACHE_PATTERN.FONT_STYLE.exec(match[1]);
                            const weightMatch = CACHE_PATTERN.FONT_WEIGHT.exec(match[1]);
                            const fontFamily = familyMatch[1].trim();
                            const fontStyle = styleMatch ? styleMatch[1].toLowerCase() : 'normal';
                            const fontWeight = weightMatch ? parseInt(weightMatch[1]) : 400;
                            for (const value of srcMatch[1].split($regex.XML.SEPARATOR)) {
                                const urlMatch = CACHE_PATTERN.URL.exec(value);
                                if (urlMatch) {
                                    let srcUrl;
                                    let srcLocal;
                                    if (urlMatch[1] === 'url') {
                                        srcUrl = $util$2.resolvePath(urlMatch[2].trim());
                                    }
                                    else {
                                        srcLocal = urlMatch[2].trim();
                                    }
                                    this.resourceHandler.addFont({
                                        fontFamily,
                                        fontWeight,
                                        fontStyle,
                                        srcUrl,
                                        srcLocal,
                                        srcFormat: urlMatch[3].toLowerCase().trim()
                                    });
                                }
                            }
                        }
                    }
                    break;
                }
            }
        }
        setFloatPadding(parent, target, inlineAbove, leftAbove, rightAbove) {
            const requirePadding = (node) => node.textElement && (node.blockStatic || node.multiline);
            if (inlineAbove.some(child => requirePadding(child) || child.blockStatic && child.cascadeSome((nested) => requirePadding(nested)))) {
                if (leftAbove.length) {
                    let floatPosition = Number.NEGATIVE_INFINITY;
                    let invalid = 0;
                    let hasSpacing = false;
                    for (const child of leftAbove) {
                        const right = child.linear.right + (child.marginLeft < 0 ? child.marginLeft : 0);
                        if (right > floatPosition) {
                            floatPosition = right;
                            hasSpacing = child.marginRight > 0;
                        }
                    }
                    for (const child of inlineAbove) {
                        if (child.blockStatic && child.bounds.left > floatPosition) {
                            invalid++;
                        }
                    }
                    if (invalid < inlineAbove.length) {
                        const offset = floatPosition - parent.box.left;
                        if (offset > 0) {
                            target.modifyBox(256 /* PADDING_LEFT */, offset + (!hasSpacing && target.cascadeSome(child => child.multiline) ? this.controllerHandler.localSettings.deviations.textMarginBoundarySize : 0));
                        }
                    }
                }
                if (rightAbove.length) {
                    let floatPosition = Number.POSITIVE_INFINITY;
                    let invalid = 0;
                    let hasSpacing = false;
                    for (const child of rightAbove) {
                        const left = child.linear.left + (child.marginRight < 0 ? child.marginRight : 0);
                        if (left < floatPosition) {
                            floatPosition = left;
                            hasSpacing = child.marginLeft > 0;
                        }
                    }
                    for (const child of inlineAbove) {
                        if (child.blockStatic && child.bounds.right < floatPosition) {
                            invalid++;
                        }
                    }
                    if (invalid < inlineAbove.length) {
                        const offset = parent.box.right - floatPosition;
                        if (offset > 0) {
                            target.modifyBox(64 /* PADDING_RIGHT */, offset + (!hasSpacing && target.cascadeSome(child => child.multiline) ? this.controllerHandler.localSettings.deviations.textMarginBoundarySize : 0));
                        }
                    }
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
                    if (a.index === 0 || a.index !== undefined && a.index !== Number.POSITIVE_INFINITY && b.index === undefined || b.index === Number.POSITIVE_INFINITY) {
                        return -1;
                    }
                    else if (b.index === 0 || b.index !== undefined && b.index !== Number.POSITIVE_INFINITY && a.index === undefined || a.index === Number.POSITIVE_INFINITY) {
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

    const $const$2 = squared.lib.constant;
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
                    float: $const$2.CSS.NONE,
                    clear: $const$2.CSS.NONE
                };
            }
            else {
                styleMap = $session$1.getElementCache(element, 'styleMap', this.application.processing.sessionId) || {};
                function checkBorderAttribute(index) {
                    for (let i = 0; i < 4; i++) {
                        if (styleMap[$css$2.BOX_BORDER[i][index]]) {
                            return false;
                        }
                    }
                    return true;
                }
                const setBorderStyle = () => {
                    if (styleMap.border === undefined) {
                        if (checkBorderAttribute(0)) {
                            styleMap.border = `outset 1px ${this.localSettings.style.inputBorderColor}`;
                            for (let i = 0; i < 4; i++) {
                                styleMap[$css$2.BOX_BORDER[i][0]] = 'outset';
                                styleMap[$css$2.BOX_BORDER[i][1]] = '1px';
                                styleMap[$css$2.BOX_BORDER[i][2]] = this.localSettings.style.inputBorderColor;
                            }
                            return true;
                        }
                    }
                    return false;
                };
                const setButtonStyle = (appliedBorder) => {
                    if (appliedBorder && styleMap.backgroundColor === undefined) {
                        styleMap.backgroundColor = this.localSettings.style.inputBackgroundColor;
                    }
                    if (styleMap.textAlign === undefined) {
                        styleMap.textAlign = $const$2.CSS.CENTER;
                    }
                    if (styleMap.padding === undefined && !$css$2.BOX_PADDING.some(attr => !!styleMap[attr])) {
                        styleMap.paddingTop = '2px';
                        styleMap.paddingRight = '6px';
                        styleMap.paddingBottom = '3px';
                        styleMap.paddingLeft = '6px';
                    }
                };
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
                    case 'INPUT': {
                        const type = element.type;
                        switch (type) {
                            case 'radio':
                            case 'checkbox':
                                break;
                            case 'week':
                            case 'month':
                            case 'time':
                            case 'date':
                            case 'datetime-local':
                                styleMap.paddingTop = $css$2.formatPX($util$3.convertFloat(styleMap.paddingTop) + 1);
                                styleMap.paddingRight = $css$2.formatPX($util$3.convertFloat(styleMap.paddingRight) + 1);
                                styleMap.paddingBottom = $css$2.formatPX($util$3.convertFloat(styleMap.paddingBottom) + 1);
                                styleMap.paddingLeft = $css$2.formatPX($util$3.convertFloat(styleMap.paddingLeft) + 1);
                                break;
                            case 'image':
                                if (styleMap.verticalAlign === undefined) {
                                    styleMap.verticalAlign = 'text-bottom';
                                }
                                break;
                            default:
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
                        break;
                    }
                    case 'BUTTON':
                        setButtonStyle(setBorderStyle());
                        break;
                    case 'TEXTAREA':
                    case 'SELECT':
                        setBorderStyle();
                        break;
                    case 'FORM':
                        if (styleMap.marginTop === undefined) {
                            styleMap.marginTop = $const$2.CSS.PX_0;
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
                            if (styleMap[attr] === undefined || styleMap[attr] === $const$2.CSS.AUTO) {
                                const match = new RegExp(`\\s+${attr}="([^"]+)"`).exec(element.outerHTML);
                                if (match) {
                                    if ($css$2.isLength(match[1])) {
                                        styleMap[attr] = `${match[1]}px`;
                                    }
                                    else if ($css$2.isPercent(match[1])) {
                                        styleMap[attr] = match[1];
                                    }
                                }
                                else if (element.tagName === 'IFRAME') {
                                    if (attr === $const$2.CSS.WIDTH) {
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
                        setDimension($const$2.CSS.WIDTH, $const$2.CSS.HEIGHT);
                        setDimension($const$2.CSS.HEIGHT, $const$2.CSS.WIDTH);
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
            if (id === undefined) {
                return Object.keys(this._beforeOutside).length > 0 || Object.keys(this._beforeInside).length > 0 || Object.keys(this._afterInside).length > 0 || Object.keys(this._afterOutside).length > 0;
            }
            return this._beforeOutside[id] !== undefined || this._beforeInside[id] !== undefined || this._afterInside[id] !== undefined || this._afterOutside[id] !== undefined;
        }
        includeElement(element) {
            return !this.localSettings.unsupported.tagName.has(element.tagName) || element.tagName === 'INPUT' && !this.localSettings.unsupported.tagName.has(`${element.tagName}:${element.type}`) || element.contentEditable === 'true';
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
                return element.tagName === 'IMG' && style.getPropertyValue('display') !== $const$2.CSS.NONE || rect.width > 0 && style.getPropertyValue('float') !== $const$2.CSS.NONE || style.getPropertyValue('display') === 'block' && (parseInt(style.getPropertyValue('margin-top')) !== 0 || parseInt(style.getPropertyValue('margin-bottom')) !== 0) || style.getPropertyValue('clear') !== $const$2.CSS.NONE;
            }
            return false;
        }
        evaluateNonStatic(documentRoot, cache) {
            const alteredParent = new Set();
            for (const node of cache) {
                if (!node.documentRoot) {
                    const actualParent = node.parent;
                    const absoluteParent = node.absoluteParent;
                    let parent;
                    switch (node.css('position')) {
                        case 'relative':
                            if (node === actualParent.lastChild) {
                                let valid = false;
                                if (node.outsideX(actualParent.box)) {
                                    if (!actualParent.has($const$2.CSS.WIDTH) || actualParent.css('overflowX') === 'hidden') {
                                        continue;
                                    }
                                    valid = true;
                                }
                                if (node.outsideY(actualParent.box)) {
                                    if (!actualParent.hasHeight && !actualParent.has($const$2.CSS.HEIGHT) || actualParent.css('overflowY') === 'hidden') {
                                        continue;
                                    }
                                    valid = true;
                                }
                                if (valid) {
                                    parent = actualParent.actualParent;
                                    do {
                                        if (node.withinX(parent.box) && node.withinY(parent.box) || parent.css('overflow') === 'hidden') {
                                            break;
                                        }
                                        parent = actualParent.actualParent;
                                    } while (parent && parent !== documentRoot);
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
                                        node.cssApply({ display: 'inline-block', verticalAlign: $const$2.CSS.TOP }, true);
                                    }
                                    else {
                                        node.positionAuto = false;
                                    }
                                    parent = actualParent;
                                }
                                else if (this.userSettings.supportNegativeLeftTop) {
                                    let outside = false;
                                    while (parent && parent !== documentRoot) {
                                        if (!outside) {
                                            const overflowX = parent.css('overflowX') === 'hidden';
                                            const overflowY = parent.css('overflowY') === 'hidden';
                                            if (overflowX && overflowY || node.cssInitial($const$2.CSS.TOP) === $const$2.CSS.PX_0 || node.cssInitial($const$2.CSS.RIGHT) === $const$2.CSS.PX_0 || node.cssInitial($const$2.CSS.BOTTOM) === $const$2.CSS.PX_0 || node.cssInitial($const$2.CSS.LEFT) === $const$2.CSS.PX_0) {
                                                break;
                                            }
                                            else {
                                                const outsideX = !overflowX && node.outsideX(parent.box);
                                                const outsideY = !overflowY && node.outsideY(parent.box);
                                                if (!overflowY && node.linear.top < Math.floor(parent.box.top) && (node.top < 0 || node.marginTop < 0)) {
                                                    outside = true;
                                                }
                                                else if (outsideX && !node.has($const$2.CSS.LEFT) && node.right > 0 || outsideY && !node.has($const$2.CSS.TOP) && node.bottom !== 0) {
                                                    outside = true;
                                                }
                                                else if (outsideX && outsideY && (!parent.pageFlow || parent.actualParent && parent.actualParent.documentBody) && (node.top > 0 || node.left > 0)) {
                                                    outside = true;
                                                }
                                                else if (!overflowX && node.outsideX(parent.linear) && !node.pseudoElement && (node.left < 0 || node.marginLeft < 0 || !node.has($const$2.CSS.LEFT) && node.right < 0 && node.linear.left >= parent.linear.right)) {
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
                                        else if (parent.layoutElement) {
                                            parent = absoluteParent;
                                            break;
                                        }
                                        else if (node.withinX(parent.box) && node.withinY(parent.box)) {
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
                        if (absoluteParent && absoluteParent.positionRelative && parent !== absoluteParent) {
                            const bounds = node.bounds;
                            if (absoluteParent.left !== 0) {
                                bounds.left += absoluteParent.left;
                                bounds.right += absoluteParent.left;
                            }
                            else if (!absoluteParent.has($const$2.CSS.LEFT) && absoluteParent.right !== 0) {
                                bounds.left -= absoluteParent.right;
                                bounds.right -= absoluteParent.right;
                            }
                            if (absoluteParent.top !== 0) {
                                bounds.top += absoluteParent.top;
                                bounds.bottom += absoluteParent.top;
                            }
                            else if (!absoluteParent.has($const$2.CSS.TOP) && absoluteParent.bottom !== 0) {
                                bounds.top -= absoluteParent.bottom;
                                bounds.bottom -= absoluteParent.bottom;
                            }
                            node.unsafe('box', true);
                            node.unsafe('linear', true);
                        }
                        let opacity = node.toFloat('opacity', false, 1);
                        let current = actualParent;
                        while (current && current !== parent) {
                            opacity *= current.toFloat('opacity', false, 1);
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
            for (const node of cache) {
                if (alteredParent.has(node)) {
                    const layers = [];
                    let maxIndex = -1;
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
                        else if (item.siblingIndex > maxIndex) {
                            maxIndex = item.siblingIndex;
                        }
                    });
                    if (layers.length) {
                        const children = node.children;
                        for (let j = 0, k = 0, l = 1; j < layers.length; j++, k++) {
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
                                    item.siblingIndex = maxIndex + l++;
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
                        node.retain($util$3.flatArray(children));
                    }
                }
            }
        }
        cascadeDocument(templates, depth) {
            const indent = depth > 0 ? '\t'.repeat(depth) : '';
            let output = '';
            for (const item of templates) {
                if (item) {
                    const node = item.node;
                    switch (item.type) {
                        case 1 /* XML */: {
                            const controlName = item.controlName;
                            const attributes = item.attributes;
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
                            output += this.getBeforeOutsideTemplate(node.id, depth) + template + this.getAfterOutsideTemplate(node.id, depth);
                            break;
                        }
                        case 2 /* INCLUDE */: {
                            const content = item.content;
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
        getEnclosingXmlTag(controlName, attributes, content) {
            return '<' + controlName + (attributes || '') + (content ? '>\n' + content + '</' + controlName + '>\n' : ' />\n');
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
            if (element && $css$3.hasComputedStyle(element)) {
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
            if (node.styleElement) {
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

    const $const$3 = squared.lib.constant;
    const $util$6 = squared.lib.util;
    class File {
        constructor(resource) {
            this.resource = resource;
            this.appName = '';
            this.assets = [];
            resource.fileHandler = this;
        }
        static downloadToDisk(data, filename, mime) {
            const blob = new Blob([data], { type: mime || 'application/octet-stream' });
            const url = window.URL.createObjectURL(blob);
            const element = document.createElement('a');
            element.style.setProperty('display', $const$3.CSS.NONE);
            element.setAttribute('href', url);
            element.setAttribute('download', filename);
            if (!element.download) {
                element.setAttribute('target', '_blank');
            }
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
            setTimeout(() => window.URL.revokeObjectURL(url), 1);
        }
        addAsset(data) {
            if (data.content || data.uri || data.base64) {
                const index = this.assets.findIndex(item => item.pathname === data.pathname && item.filename === data.filename);
                if (index !== -1) {
                    Object.assign(this.assets[index], data);
                }
                else {
                    this.assets.push(data);
                }
            }
        }
        reset() {
            this.assets.length = 0;
        }
        saveToDisk(files, appName) {
            if (location.protocol.startsWith('http')) {
                if (files.length) {
                    const settings = this.userSettings;
                    $util$6.concatArray(files, this.assets);
                    fetch(`/api/savetodisk` +
                        `?directory=${encodeURIComponent($util$6.trimString(settings.outputDirectory, '/'))}` +
                        (appName ? `&appname=${encodeURIComponent(appName.trim())}` : '') +
                        `&format=${settings.outputArchiveFormat.toLowerCase()}` +
                        `&timeout=${settings.outputArchiveTimeout.toString().trim()}`, {
                        method: 'POST',
                        headers: new Headers({ 'Accept': 'application/json, text/plain, */*', 'Content-Type': 'application/json' }),
                        body: JSON.stringify(files)
                    })
                        .then((response) => response.json())
                        .then((result) => {
                        if (result) {
                            if (result.zipname) {
                                fetch(`/api/downloadtobrowser?filename=${encodeURIComponent(result.zipname)}`)
                                    .then((response) => response.blob())
                                    .then((blob) => File.downloadToDisk(blob, $util$6.fromLastIndexOf(result.zipname, '/')));
                            }
                            else if (result.system && this.userSettings.showErrorMessages) {
                                alert(`${result.application}\n\n${result.system}`);
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
            else if (this.userSettings.showErrorMessages) {
                alert('SERVER (required): See README for instructions');
            }
        }
        get stored() {
            return this.resource.stored;
        }
        get directory() {
            return this.resource.application.controllerHandler.localSettings.directory;
        }
    }

    const STRING_BASE = {
        EXT_DATA: 'mainData',
        TOP_BOTTOM: 'topBottom',
        BOTTOM_TOP: 'bottomTop',
        LEFT_RIGHT: 'leftRight',
        RIGHT_LEFT: 'rightLeft'
    };
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
        STRING_BASE: STRING_BASE,
        CSS_SPACING: CSS_SPACING,
        EXT_NAME: EXT_NAME
    });

    const $const$4 = squared.lib.constant;
    const $css$4 = squared.lib.css;
    const $dom$1 = squared.lib.dom;
    const $session$2 = squared.lib.session;
    const $util$7 = squared.lib.util;
    const REGEXP_BACKGROUND = /\s*(url\(.+?\))\s*/;
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
            this.floatContainer = false;
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
            this._fontSize = 0;
            this._inlineText = false;
            this._element = null;
            if (element) {
                this._element = element;
            }
            else {
                this._styleMap = {};
                this.style = {};
            }
        }
        cloneBase(node) {
            Object.assign(node.localSettings, this.localSettings);
            node.tagName = this.tagName;
            node.alignmentType = this.alignmentType;
            node.depth = this.depth;
            node.visible = this.visible;
            node.excluded = this.excluded;
            node.rendered = this.rendered;
            node.siblingIndex = this.siblingIndex;
            if (this.inlineText) {
                node.setInlineText(true, true);
            }
            node.lineBreakLeading = this.lineBreakLeading;
            node.lineBreakTrailing = this.lineBreakTrailing;
            node.renderParent = this.renderParent;
            node.documentParent = this.documentParent;
            node.documentRoot = this.documentRoot;
            if (this.length) {
                node.retain(this.duplicate());
            }
            node.inherit(this, 'initial', 'base', 'alignment', 'styleMap', 'textStyle');
            Object.assign(node.unsafe('cached'), this._cached);
        }
        init() {
            const element = this._element;
            if (element) {
                const sessionId = this.sessionId;
                if (sessionId !== '0') {
                    $session$2.setElementCache(element, 'node', sessionId, this);
                }
                this.style = $session$2.getElementCache(element, 'style', '0') || $css$4.getStyle(element, undefined, false);
                this._styleMap = Object.assign({}, $session$2.getElementCache(element, 'styleMap', sessionId));
                if (this.styleElement && !this.pseudoElement && sessionId !== '0') {
                    for (let attr of Array.from(element.style)) {
                        let value = element.style.getPropertyValue(attr);
                        attr = $util$7.convertCamelCase(attr);
                        value = $css$4.checkStyleValue(element, attr, value, this.style);
                        if (value !== '') {
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
        is(containerType) {
            return this.containerType === containerType;
        }
        of(containerType, ...alignmentType) {
            return this.containerType === containerType && alignmentType.some(value => this.hasAlign(value));
        }
        unsafe(name, unset = false) {
            if (unset) {
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
            const renderParent = this.renderParent;
            if (renderParent && renderParent.renderTemplates) {
                const index = renderParent.renderChildren.findIndex(node => node === this);
                if (index !== -1) {
                    const template = renderParent.renderTemplates[index];
                    if (template && template.node === this) {
                        renderParent.renderTemplates[index] = null;
                    }
                }
            }
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
                            this._cached.percentWidth = undefined;
                            this._cached.actualWidth = undefined;
                        case 'minWidth':
                            this._cached.width = undefined;
                            break;
                        case 'height':
                            this._cached.percentHeight = undefined;
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
                        case 'backgroundColor':
                        case 'backgroundImage':
                            this._cached.visibleStyle = undefined;
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
            const attr = !generated ? 'actualParent'
                : this.renderParent ? 'renderParent' : 'parent';
            let current = this[attr];
            while (current && current.id !== 0) {
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
        ascendOuter(condition, parent) {
            const result = [];
            let current = this.outerWrapper;
            while (current && current !== parent) {
                if (condition) {
                    if (condition(current)) {
                        return [current];
                    }
                }
                else {
                    result.push(current);
                }
                current = current.outerWrapper;
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
                        this._boxReset = $dom$1.newBoxModel();
                        this._boxAdjustment = $dom$1.newBoxModel();
                        if (node.actualParent) {
                            this.dir = node.actualParent.dir;
                        }
                        break;
                    case 'alignment':
                        this.positionAuto = node.positionAuto;
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
                                if (node.cssInitial(attr) === $const$4.CSS.AUTO) {
                                    this._styleMap[attr] = $const$4.CSS.AUTO;
                                    this._initial.styleMap[attr] = $const$4.CSS.AUTO;
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
                            fontSize: $css$4.formatPX(node.fontSize),
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
        alignedVertically(siblings, cleared, horizontal) {
            if (this.lineBreak) {
                return 2 /* LINEBREAK */;
            }
            else if (this.pageFlow || this.positionAuto) {
                const isBlockWrap = (node) => node.blockVertical || node.percentWidth;
                const checkBlockDimension = (previous) => $util$7.aboveRange(this.linear.top, previous.linear.bottom) && (isBlockWrap(this) || isBlockWrap(previous) || this.float !== previous.float);
                if ($util$7.isArray(siblings)) {
                    if (cleared && cleared.has(this)) {
                        return 5 /* FLOAT_CLEAR */;
                    }
                    else {
                        const lastSibling = siblings[siblings.length - 1];
                        if (this.floating && lastSibling.floating) {
                            if (horizontal && this.float === lastSibling.float) {
                                return 0 /* HORIZONTAL */;
                            }
                            else if ($util$7.aboveRange(this.linear.top, lastSibling.linear.bottom)) {
                                return 4 /* FLOAT_WRAP */;
                            }
                            else if (horizontal && cleared && !siblings.some((item, index) => index > 0 && cleared.get(item) === this.float)) {
                                return 0 /* HORIZONTAL */;
                            }
                        }
                        else if (horizontal === false && this.floating && lastSibling.blockStatic) {
                            return 0 /* HORIZONTAL */;
                        }
                        else if (horizontal !== undefined) {
                            if (!this.display.startsWith('inline-')) {
                                const { top, bottom } = this.linear;
                                if (this.textElement && cleared && cleared.size && siblings.some((item, index) => index > 0 && cleared.has(item)) && siblings.some(item => top < item.linear.top && bottom > item.linear.bottom)) {
                                    return 7 /* FLOAT_INTERSECT */;
                                }
                                else if (siblings[0].float === $const$4.CSS.RIGHT) {
                                    if (siblings.length > 1) {
                                        let minTop = Number.POSITIVE_INFINITY;
                                        let maxBottom = Number.NEGATIVE_INFINITY;
                                        let actualBottom = top;
                                        for (const item of siblings) {
                                            if (item.float === $const$4.CSS.RIGHT) {
                                                if (item.linear.top < minTop) {
                                                    minTop = item.linear.top;
                                                }
                                                if (item.linear.bottom > maxBottom) {
                                                    maxBottom = item.linear.bottom;
                                                }
                                            }
                                        }
                                        if (this.multiline) {
                                            actualBottom = bottom;
                                            if (this.textElement && !this.plainText) {
                                                const rect = $session$2.getRangeClientRect(this._element, this.sessionId);
                                                if (rect.bottom > bottom) {
                                                    actualBottom = rect.bottom;
                                                }
                                            }
                                        }
                                        if ($util$7.belowRange(actualBottom, maxBottom)) {
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
                        if (this.blockDimension && checkBlockDimension(lastSibling)) {
                            return 3 /* INLINE_WRAP */;
                        }
                    }
                }
                if (this.blockDimension && this.css($const$4.CSS.WIDTH) === $const$4.CSS.PERCENT_100 && !this.has('maxWidth')) {
                    return 1 /* VERTICAL */;
                }
                const parent = this.actualParent || this.documentParent;
                const blockStatic = this.blockStatic || this.display === 'table';
                for (const previous of this.siblingsLeading) {
                    if (previous.lineBreak) {
                        return 2 /* LINEBREAK */;
                    }
                    else if (cleared && cleared.get(previous) === 'both' && (!$util$7.isArray(siblings) || siblings[0] !== previous)) {
                        return 5 /* FLOAT_CLEAR */;
                    }
                    else if (blockStatic && (!previous.floating || !previous.rightAligned && $util$7.withinRange(previous.linear.right, parent.box.right) || cleared && cleared.has(previous)) ||
                        previous.blockStatic ||
                        previous.autoMargin.leftRight ||
                        previous.float === $const$4.CSS.LEFT && this.autoMargin.right ||
                        previous.float === $const$4.CSS.RIGHT && this.autoMargin.left) {
                        return 1 /* VERTICAL */;
                    }
                    else if (this.blockDimension && checkBlockDimension(previous)) {
                        return 3 /* INLINE_WRAP */;
                    }
                }
            }
            return 0 /* HORIZONTAL */;
        }
        intersectX(rect, dimension = 'linear') {
            const self = this[dimension];
            return ($util$7.aboveRange(rect.left, self.left) && Math.ceil(rect.left) < self.right ||
                rect.right > Math.ceil(self.left) && $util$7.belowRange(rect.right, self.right) ||
                $util$7.aboveRange(self.left, rect.left) && $util$7.belowRange(self.right, rect.right) ||
                $util$7.aboveRange(rect.left, self.left) && $util$7.belowRange(rect.right, self.right));
        }
        intersectY(rect, dimension = 'linear') {
            const self = this[dimension];
            return ($util$7.aboveRange(rect.top, self.top) && Math.ceil(rect.top) < self.bottom ||
                rect.bottom > Math.ceil(self.top) && $util$7.belowRange(rect.bottom, self.bottom) ||
                $util$7.aboveRange(self.top, rect.top) && $util$7.belowRange(self.bottom, rect.bottom) ||
                $util$7.aboveRange(rect.top, self.top) && $util$7.belowRange(rect.bottom, self.bottom));
        }
        withinX(rect, dimension = 'linear') {
            const self = this[dimension];
            return $util$7.aboveRange(self.left, rect.left) && $util$7.belowRange(self.right, rect.right);
        }
        withinY(rect, dimension = 'linear') {
            const self = this[dimension];
            return $util$7.aboveRange(self.top, rect.top) && $util$7.belowRange(self.bottom, rect.bottom);
        }
        outsideX(rect, dimension = 'linear') {
            const self = this[dimension];
            return self.left < Math.floor(rect.left) || Math.floor(self.right) > rect.right;
        }
        outsideY(rect, dimension = 'linear') {
            const self = this[dimension];
            return self.top < Math.floor(rect.top) || Math.floor(self.bottom) > rect.bottom;
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
        cssAscend(attr, startChild = false, dimension) {
            let current = startChild ? this : this.actualParent;
            let value;
            while (current) {
                value = current.cssInitial(attr);
                if (value !== '') {
                    if (dimension) {
                        return current.convertPX(value, dimension);
                    }
                    return value;
                }
                if (current.documentBody) {
                    break;
                }
                current = current.actualParent;
            }
            return '';
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
                const current = (this.pseudoElement ? element.style : this.style).getPropertyValue(attr);
                element.style.setProperty(attr, value);
                if (element.style.getPropertyValue(attr) === value) {
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
                    element.style.setProperty(attr, value);
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
        parseUnit(value, dimension = $const$4.CSS.WIDTH, parent = true) {
            if (value) {
                if ($css$4.isPercent(value)) {
                    let result = parseFloat(value) / 100;
                    if (parent) {
                        const absoluteParent = this.absoluteParent;
                        if (absoluteParent) {
                            switch (dimension) {
                                case $const$4.CSS.WIDTH:
                                    result *= absoluteParent.has(dimension, 2 /* LENGTH */) ? absoluteParent.actualWidth : absoluteParent.bounds.width;
                                    break;
                                case $const$4.CSS.HEIGHT:
                                    result *= absoluteParent.has(dimension, 2 /* LENGTH */) ? absoluteParent.actualHeight : absoluteParent.bounds.height;
                                    break;
                                default:
                                    result *= Math.max(absoluteParent.actualWidth, absoluteParent.actualHeight);
                                    break;
                            }
                            return result;
                        }
                    }
                    return result * (this.has(dimension, 2 /* LENGTH */) ? this.toFloat(dimension) : this.bounds[dimension]);
                }
                return $css$4.parseUnit(value, this.fontSize);
            }
            return 0;
        }
        convertPX(value, dimension = $const$4.CSS.WIDTH, parent = true) {
            return value.endsWith('px') ? value : `${Math.round(this.parseUnit(value, dimension, parent))}px`;
        }
        has(attr, checkType = 0, options) {
            const value = (options && options.map === 'initial' ? this._initial.styleMap : this._styleMap)[attr];
            if (value) {
                switch (value) {
                    case $const$4.CSS.PX_0:
                        if ($util$7.hasBit(checkType, 64 /* ZERO */)) {
                            return true;
                        }
                        else {
                            switch (attr) {
                                case $const$4.CSS.TOP:
                                case $const$4.CSS.RIGHT:
                                case $const$4.CSS.BOTTOM:
                                case $const$4.CSS.LEFT:
                                    return true;
                            }
                        }
                    case $const$4.CSS.LEFT:
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
            return $util$7.hasBit(this.alignmentType, value);
        }
        hasResource(value) {
            return !$util$7.hasBit(this.excludeResource, value);
        }
        hasProcedure(value) {
            return !$util$7.hasBit(this.excludeProcedure, value);
        }
        hasSection(value) {
            return !$util$7.hasBit(this.excludeSection, value);
        }
        exclude(resource = 0, procedure = 0, section = 0) {
            if (resource > 0 && !$util$7.hasBit(this._excludeResource, resource)) {
                this._excludeResource |= resource;
            }
            if (procedure > 0 && !$util$7.hasBit(this._excludeProcedure, procedure)) {
                this._excludeProcedure |= procedure;
            }
            if (section > 0 && !$util$7.hasBit(this._excludeSection, section)) {
                this._excludeSection |= section;
            }
        }
        setExclusions() {
            if (this.styleElement) {
                const parent = this.actualParent;
                const parseExclusions = (attr, enumeration) => {
                    let exclude = this.dataset[`exclude${attr}`] || '';
                    let offset = 0;
                    if (parent && parent.dataset[`exclude${attr}Child`]) {
                        exclude += (exclude !== '' ? '|' : '') + parent.dataset[`exclude${attr}Child`];
                    }
                    if (exclude !== '') {
                        for (let name of exclude.split('|')) {
                            name = name.trim().toUpperCase();
                            if (enumeration[name] && !$util$7.hasBit(offset, enumeration[name])) {
                                offset |= enumeration[name];
                            }
                        }
                    }
                    return offset;
                };
                this.exclude(parseExclusions('Resource', NODE_RESOURCE), parseExclusions('Procedure', NODE_PROCEDURE), parseExclusions('Section', APP_SECTION));
            }
        }
        setBounds(cache = true) {
            if (this.styleElement) {
                this._bounds = $dom$1.assignRect($session$2.getClientRect(this._element, this.sessionId, cache), true);
                if (this.documentBody && this.marginTop === 0) {
                    this._bounds.top = 0;
                }
            }
            else if (this.plainText) {
                const rect = $session$2.getRangeClientRect(this._element, this.sessionId, cache);
                this._bounds = $dom$1.assignRect(rect, true);
                this._cached.multiline = rect.numberOfLines > 0;
            }
            if (!cache) {
                this._linear = undefined;
                this._box = undefined;
            }
        }
        setInlineText(value, overwrite = false) {
            if (overwrite) {
                this._inlineText = value;
            }
            else if (this.htmlElement) {
                const element = this._element;
                switch (element.tagName) {
                    case 'INPUT':
                    case 'IMG':
                    case 'SELECT':
                    case 'TEXTAREA':
                    case 'HR':
                    case 'SVG':
                        break;
                    case 'BUTTON':
                        this._inlineText = true;
                        break;
                    default:
                        this._inlineText = value;
                        break;
                }
            }
        }
        appendTry(node, replacement, append = true) {
            let valid = false;
            for (let i = 0; i < this.length; i++) {
                if (this.item(i) === node) {
                    this.item(i, replacement);
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
                    if (offset === undefined) {
                        if (this._boxReset === undefined) {
                            this._boxReset = $dom$1.newBoxModel();
                        }
                        this._boxReset[attr] = 1;
                    }
                    else {
                        if (this._boxAdjustment === undefined) {
                            this._boxAdjustment = $dom$1.newBoxModel();
                        }
                        if (!negative) {
                            if (this[attr] + this._boxAdjustment[attr] + offset <= 0) {
                                if (this._boxReset === undefined) {
                                    this._boxReset = $dom$1.newBoxModel();
                                }
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
        }
        getBox(region) {
            const attr = CSS_SPACING.get(region);
            return attr ? [this._boxReset ? this._boxReset[attr] : 0, this._boxAdjustment ? this._boxAdjustment[attr] : 0] : [0, 0];
        }
        resetBox(region, node, fromParent = false) {
            if (this._boxReset === undefined) {
                this._boxReset = $dom$1.newBoxModel();
            }
            const boxReset = this._boxReset;
            const applyReset = (attrs, start) => {
                for (let i = 0; i < attrs.length; i++) {
                    if (boxReset[attrs[i]] === 0) {
                        boxReset[attrs[i]] = 1;
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
        transferBox(region, node) {
            const boxAdjustment = this._boxAdjustment;
            if (boxAdjustment) {
                const applyReset = (attrs, start) => {
                    for (let i = 0; i < attrs.length; i++) {
                        const value = boxAdjustment[attrs[i]];
                        if (value > 0) {
                            node.modifyBox(CSS_SPACING_KEYS[i + start], value, false);
                            boxAdjustment[attrs[i]] = 0;
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
        }
        previousSiblings(options = {}) {
            const floating = options.floating;
            const pageFlow = options.pageFlow;
            const lineBreak = options.lineBreak;
            const excluded = options.excluded;
            const result = [];
            let element = null;
            if (this._element) {
                if (this.naturalElement) {
                    element = this._element.previousSibling;
                }
                else {
                    let current = this.innerWrapped;
                    while (current) {
                        if (current.naturalElement) {
                            element = current.element.previousSibling;
                            break;
                        }
                        current = current.innerWrapped;
                    }
                }
            }
            else {
                const node = this.firstChild;
                if (node) {
                    element = node.element.previousSibling;
                }
            }
            while (element) {
                const node = $session$2.getElementAsNode(element, this.sessionId);
                if (node) {
                    if (lineBreak !== false && node.lineBreak || excluded !== false && node.excluded) {
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
                element = element.previousSibling;
            }
            return result;
        }
        nextSiblings(options = {}) {
            const floating = options.floating;
            const pageFlow = options.pageFlow;
            const lineBreak = options.lineBreak;
            const excluded = options.excluded;
            const result = [];
            let element = null;
            if (this._element) {
                if (this.naturalElement) {
                    element = this._element.nextSibling;
                }
                else {
                    let current = this.innerWrapped;
                    while (current) {
                        if (current.naturalElement) {
                            element = current.element.nextSibling;
                            break;
                        }
                        current = current.innerWrapped;
                    }
                }
            }
            else {
                const node = this.lastChild;
                if (node) {
                    element = node.element.nextSibling;
                }
            }
            while (element) {
                const node = $session$2.getElementAsNode(element, this.sessionId);
                if (node) {
                    if (lineBreak !== false && node.lineBreak || excluded !== false && node.excluded) {
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
                element = element.nextSibling;
            }
            return result;
        }
        getFirstChildElement(options = {}) {
            const lineBreak = options.lineBreak;
            const excluded = options.excluded;
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
            const lineBreak = options.lineBreak;
            const excluded = options.excluded;
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
                case $const$4.CSS.TOP:
                case $const$4.CSS.LEFT:
                    node = this.companion && !this.companion.visible && this.companion[dimension][direction] < this[dimension][direction] ? this.companion : this;
                    break;
                case $const$4.CSS.RIGHT:
                case $const$4.CSS.BOTTOM:
                    node = this.companion && !this.companion.visible && this.companion[dimension][direction] > this[dimension][direction] ? this.companion : this;
                    break;
                default:
                    return NaN;
            }
            return node[dimension][direction];
        }
        setDimension(attr, attrMin, attrMax) {
            const baseValue = this.parseUnit(this._styleMap[attr], attr);
            let value = Math.max(baseValue, this.parseUnit(this._styleMap[attrMin], attr));
            if (value === 0 && this.naturalElement && this.styleElement) {
                switch (this.tagName) {
                    case 'IMG':
                    case 'INPUT_IMAGE':
                    case 'TD':
                    case 'TH':
                    case 'SVG':
                    case 'IFRAME':
                    case 'VIDEO':
                    case 'CANVAS':
                    case 'OBJECT':
                    case 'EMBED':
                        const size = $dom$1.getNamedItem(this._element, attr);
                        if (size !== '') {
                            value = this.parseUnit(size, attr);
                            if (value > 0) {
                                this.css(attr, $css$4.isPercent(size) ? size : `${size}px`);
                            }
                        }
                        break;
                }
            }
            let maxValue = 0;
            if (baseValue > 0 && !this.imageElement) {
                if (this._styleMap[attrMax] === this._styleMap[attr]) {
                    delete this._styleMap[attrMax];
                }
                else {
                    maxValue = this.parseUnit(this._styleMap[attrMax], attr);
                    if (maxValue > 0 && maxValue <= baseValue && $css$4.isLength(this._styleMap[attr])) {
                        maxValue = 0;
                        this._styleMap[attr] = this._styleMap[attrMax];
                        delete this._styleMap[attrMax];
                    }
                }
            }
            return maxValue > 0 ? Math.min(value, maxValue) : value;
        }
        setBoxModel(dimension) {
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
                if ($css$4.isLength(unit)) {
                    value = $util$7.convertFloat(this.convertPX(unit, attr === $const$4.CSS.LEFT || attr === $const$4.CSS.RIGHT ? $const$4.CSS.WIDTH : $const$4.CSS.HEIGHT));
                }
                else if ($css$4.isPercent(unit) && this.styleElement) {
                    value = $util$7.convertFloat(this.style[attr]);
                }
            }
            return value;
        }
        convertBorderWidth(index) {
            if (this.styleElement) {
                const value = this.css($css$4.BOX_BORDER[index][0]);
                if (value !== $const$4.CSS.NONE) {
                    const width = this.css($css$4.BOX_BORDER[index][1]);
                    let result;
                    switch (width) {
                        case 'thin':
                        case 'medium':
                        case 'thick':
                            result = $util$7.convertFloat(this.style[$css$4.BOX_BORDER[index][1]]);
                            break;
                        default:
                            result = this.parseUnit(width, index === 1 || index === 3 ? $const$4.CSS.WIDTH : $const$4.CSS.HEIGHT);
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
                        return 0;
                    }
                    break;
            }
            const result = this.parseUnit(this.css(attr), $const$4.CSS.NONE);
            if (!margin) {
                let paddingStart = this.toFloat('paddingInlineStart');
                let paddingEnd = this.toFloat('paddingInlineEnd');
                if (paddingStart > 0 || paddingEnd > 0) {
                    if (this.css('writingMode') === 'vertical-rl') {
                        if (this.dir === 'ltr') {
                            if (attr !== 'paddingTop') {
                                paddingStart = 0;
                            }
                            if (attr !== 'paddingBottom') {
                                paddingEnd = 0;
                            }
                        }
                        else {
                            if (attr !== 'paddingBottom') {
                                paddingStart = 0;
                            }
                            if (attr !== 'paddingTop') {
                                paddingEnd = 0;
                            }
                        }
                    }
                    else {
                        if (this.dir === 'ltr') {
                            if (attr !== 'paddingLeft') {
                                paddingStart = 0;
                            }
                            if (attr !== 'paddingRight') {
                                paddingEnd = 0;
                            }
                        }
                        else {
                            if (attr !== 'paddingRight') {
                                paddingStart = 0;
                            }
                            if (attr !== 'paddingLeft') {
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
                        value = `INPUT_${element.type}`;
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
            if (this._cached.naturalElement === undefined) {
                this._cached.naturalElement = this._element !== null && this._element.className !== '__squared.placeholder';
            }
            return this._cached.naturalElement;
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
                const value = this.tagName;
                this._cached.inputElement = this._element !== null && this._element.tagName === 'INPUT' || value === 'BUTTON' || value === 'SELECT' || value === 'TEXTAREA';
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
                this.setBoxModel('linear');
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
                this.setBoxModel('box');
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
                    alignSelf: alignSelf === $const$4.CSS.AUTO && actualParent && actualParent.has('alignItems', 16 /* BASELINE */, { all: true }) ? actualParent.css('alignItems') : alignSelf,
                    justifySelf: justifySelf === $const$4.CSS.AUTO && actualParent && actualParent.has('justifyItems') ? actualParent.css('justifyItems') : justifySelf,
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
                this._cached.width = this.setDimension($const$4.CSS.WIDTH, 'minWidth', 'maxWidth');
            }
            return this._cached.width;
        }
        get height() {
            if (this._cached.height === undefined) {
                this._cached.height = this.setDimension($const$4.CSS.HEIGHT, 'minHeight', 'maxHeight');
            }
            return this._cached.height;
        }
        get hasWidth() {
            return this.width > 0;
        }
        get hasHeight() {
            const value = this.css($const$4.CSS.HEIGHT);
            if ($css$4.isPercent(value)) {
                if (this.pageFlow) {
                    const actualParent = this.actualParent;
                    if (actualParent && actualParent.hasHeight) {
                        return parseFloat(value) > 0;
                    }
                }
                return false;
            }
            return this.height > 0;
        }
        get lineHeight() {
            if (this._cached.lineHeight === undefined) {
                if (!this.imageElement && !this.svgElement) {
                    let hasOwnStyle = this.has('lineHeight');
                    let value = 0;
                    if (hasOwnStyle) {
                        value = $css$4.parseUnit(this.css('lineHeight'), this.fontSize);
                    }
                    else if (this.naturalElement) {
                        value = $util$7.convertFloat(this.cssAscend('lineHeight', false, $const$4.CSS.HEIGHT));
                        if (this.styleElement) {
                            const fontSize = this.cssInitial('fontSize');
                            if (fontSize.endsWith('em')) {
                                const emSize = parseFloat(fontSize);
                                if (emSize < 1) {
                                    value *= emSize;
                                    this.css('lineHeight', $css$4.formatPX(value));
                                    hasOwnStyle = true;
                                }
                            }
                        }
                    }
                    this._cached.lineHeight = hasOwnStyle || value > this.actualHeight || this.multiline || this.block && this.actualChildren.some(node => node.textElement) ? value : 0;
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
        set positionStatic(value) {
            this._cached.positionStatic = value;
            this.unsetCache('pageFlow');
        }
        get positionStatic() {
            if (this._cached.positionStatic === undefined) {
                switch (this.css('position')) {
                    case 'fixed':
                    case 'absolute':
                        this._cached.positionStatic = false;
                        break;
                    case 'sticky':
                    case 'relative':
                        this._cached.positionStatic = !this.has($const$4.CSS.TOP) && !this.has($const$4.CSS.RIGHT) && !this.has($const$4.CSS.BOTTOM) && !this.has($const$4.CSS.LEFT);
                        if (this._cached.positionStatic) {
                            this._cached.positionRelative = false;
                        }
                        break;
                    case 'inherit':
                        const position = this._element && this._element.parentElement ? $css$4.getInheritedStyle(this._element.parentElement, 'position') : '';
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
                const value = this.css('position');
                this._cached.positionRelative = value === 'relative' || value === 'sticky';
            }
            return this._cached.positionRelative;
        }
        set positionAuto(value) {
            this._cached.positionAuto = value;
        }
        get positionAuto() {
            if (this._cached.positionAuto === undefined) {
                const styleMap = this._initial.iteration === -1 ? this._styleMap : this._initial.styleMap;
                this._cached.positionAuto = !this.pageFlow && ((!styleMap.top || styleMap.top === $const$4.CSS.AUTO) &&
                    (!styleMap.right || styleMap.right === $const$4.CSS.AUTO) &&
                    (!styleMap.bottom || styleMap.bottom === $const$4.CSS.AUTO) &&
                    (!styleMap.left || styleMap.left === $const$4.CSS.AUTO));
            }
            return this._cached.positionAuto;
        }
        get top() {
            if (this._cached.top === undefined) {
                this._cached.top = this.convertPosition($const$4.CSS.TOP);
            }
            return this._cached.top;
        }
        get right() {
            if (this._cached.right === undefined) {
                this._cached.right = this.convertPosition($const$4.CSS.RIGHT);
            }
            return this._cached.right;
        }
        get bottom() {
            if (this._cached.bottom === undefined) {
                this._cached.bottom = this.convertPosition($const$4.CSS.BOTTOM);
            }
            return this._cached.bottom;
        }
        get left() {
            if (this._cached.left === undefined) {
                this._cached.left = this.convertPosition($const$4.CSS.LEFT);
            }
            return this._cached.left;
        }
        get marginTop() {
            if (this._cached.marginTop === undefined) {
                this._cached.marginTop = this.inlineStatic ? 0 : this.convertBox('marginTop', true);
            }
            return this._cached.marginTop;
        }
        get marginRight() {
            if (this._cached.marginRight === undefined) {
                this._cached.marginRight = this.convertBox('marginRight', true);
            }
            return this._cached.marginRight;
        }
        get marginBottom() {
            if (this._cached.marginBottom === undefined) {
                if (this.inlineStatic) {
                    this._cached.marginBottom = 0;
                }
                else {
                    const value = this.convertBox('marginBottom', true);
                    this._cached.marginBottom = this.bounds.height === 0 && !this.overflowY && value > 0 ? 0 : value;
                }
            }
            return this._cached.marginBottom;
        }
        get marginLeft() {
            if (this._cached.marginLeft === undefined) {
                this._cached.marginLeft = this.convertBox('marginLeft', true);
            }
            return this._cached.marginLeft;
        }
        get borderTopWidth() {
            if (this._cached.borderTopWidth === undefined) {
                this._cached.borderTopWidth = this.convertBorderWidth(0);
            }
            return this._cached.borderTopWidth;
        }
        get borderRightWidth() {
            if (this._cached.borderRightWidth === undefined) {
                this._cached.borderRightWidth = this.convertBorderWidth(1);
            }
            return this._cached.borderRightWidth;
        }
        get borderBottomWidth() {
            if (this._cached.borderBottomWidth === undefined) {
                this._cached.borderBottomWidth = this.convertBorderWidth(2);
            }
            return this._cached.borderBottomWidth;
        }
        get borderLeftWidth() {
            if (this._cached.borderLeftWidth === undefined) {
                this._cached.borderLeftWidth = this.convertBorderWidth(3);
            }
            return this._cached.borderLeftWidth;
        }
        get paddingTop() {
            if (this._cached.paddingTop === undefined) {
                const value = this.convertBox('paddingTop', false);
                if (this.length && value > 0 && !this.layoutElement) {
                    let top = 0;
                    for (const node of this.children) {
                        if (node.inline && !node.has('lineHeight')) {
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
                    this._cached.paddingTop = this.inlineStatic && !this.visibleStyle.background ? 0 : value;
                }
            }
            return this._cached.paddingTop;
        }
        get paddingRight() {
            if (this._cached.paddingRight === undefined) {
                this._cached.paddingRight = this.convertBox('paddingRight', false);
            }
            return this._cached.paddingRight;
        }
        get paddingBottom() {
            if (this._cached.paddingBottom === undefined) {
                const value = this.convertBox('paddingBottom', false);
                if (this.length && value > 0 && !this.layoutElement) {
                    let bottom = 0;
                    for (const node of this.children) {
                        if (node.inline && !node.has('lineHeight')) {
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
                    this._cached.paddingBottom = this.inlineStatic && !this.visibleStyle.background ? 0 : value;
                }
            }
            return this._cached.paddingBottom;
        }
        get paddingLeft() {
            if (this._cached.paddingLeft === undefined) {
                this._cached.paddingLeft = this.convertBox('paddingLeft', false);
            }
            return this._cached.paddingLeft;
        }
        get contentBox() {
            return this.css('boxSizing') !== 'border-box';
        }
        set contentBoxWidth(value) {
            this._cached.contentBoxWidth = value;
        }
        get contentBoxWidth() {
            if (this._cached.contentBoxWidth === undefined) {
                this._cached.contentBoxWidth = this.tableElement && this.css('borderCollapse') === 'collapse' ? 0 : this.borderLeftWidth + this.paddingLeft + this.paddingRight + this.borderRightWidth;
            }
            return this._cached.contentBoxWidth;
        }
        set contentBoxHeight(value) {
            this._cached.contentBoxHeight = value;
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
                const value = this.display;
                this._cached.inlineVertical = (value.startsWith('inline') || value === 'table-cell') && !this.floating && !this.plainText;
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
                    case 'inline':
                        this._cached.block = this.svgElement && !this.hasWidth;
                        break;
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
                this._cached.blockStatic = this.pageFlow && (this.block && !this.floating || this.blockDimension && this.cssInitial($const$4.CSS.WIDTH) === $const$4.CSS.PERCENT_100 && !this.has('maxWidth')) || this.hasAlign(64 /* BLOCK */);
            }
            return this._cached.blockStatic;
        }
        get blockDimension() {
            if (this._cached.blockDimension === undefined) {
                const value = this.display;
                this._cached.blockDimension = this.block || value.startsWith('inline-') || value === 'table' || this.imageElement || this.svgElement;
            }
            return this._cached.blockDimension;
        }
        get blockVertical() {
            if (this._cached.blockVertical === undefined) {
                this._cached.blockVertical = this.blockDimension && this.has($const$4.CSS.HEIGHT);
            }
            return this._cached.blockVertical;
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
                this._cached.centerAligned = this.autoMargin.leftRight || this.textElement && this.blockStatic && this.cssInitial('textAlign') === $const$4.CSS.CENTER || this.inlineStatic && this.cssAscend('textAlign', true) === $const$4.CSS.CENTER;
            }
            return this._cached.centerAligned;
        }
        get rightAligned() {
            if (this._cached.rightAligned === undefined) {
                this._cached.rightAligned = this.float === $const$4.CSS.RIGHT || this.autoMargin.left || !this.pageFlow && this.has($const$4.CSS.RIGHT) || this.textElement && this.blockStatic && this.cssInitial('textAlign') === $const$4.CSS.RIGHT;
            }
            return this._cached.rightAligned || this.hasAlign(2048 /* RIGHT */);
        }
        get bottomAligned() {
            if (this._cached.bottomAligned === undefined) {
                this._cached.bottomAligned = !this.pageFlow && this.has($const$4.CSS.BOTTOM) && this.bottom >= 0;
            }
            return this._cached.bottomAligned;
        }
        get horizontalAligned() {
            if (this._cached.horizontalAligned === undefined) {
                this._cached.horizontalAligned = !this.blockStatic && !this.autoMargin.horizontal && !(this.blockDimension && this.css($const$4.CSS.WIDTH) === $const$4.CSS.PERCENT_100);
            }
            return this._cached.horizontalAligned;
        }
        get autoMargin() {
            if (this._cached.autoMargin === undefined) {
                if (!this.pageFlow || this.blockStatic || this.display === 'table') {
                    const styleMap = this._initial.iteration === -1 ? this._styleMap : this._initial.styleMap;
                    const left = styleMap.marginLeft === $const$4.CSS.AUTO && (this.pageFlow || this.has($const$4.CSS.RIGHT));
                    const right = styleMap.marginRight === $const$4.CSS.AUTO && (this.pageFlow || this.has($const$4.CSS.LEFT));
                    const top = styleMap.marginTop === $const$4.CSS.AUTO && (this.pageFlow || this.has($const$4.CSS.BOTTOM));
                    const bottom = styleMap.marginBottom === $const$4.CSS.AUTO && (this.pageFlow || this.has($const$4.CSS.TOP));
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
                    this._cached.floating = this.cssAny('float', $const$4.CSS.LEFT, $const$4.CSS.RIGHT);
                }
                else {
                    this._cached.floating = false;
                }
            }
            return this._cached.floating;
        }
        get float() {
            if (this._cached.float === undefined) {
                this._cached.float = this.floating ? this.css('float') : $const$4.CSS.NONE;
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
            return this.imageElement || this.tagName === 'INPUT_IMAGE' ? this._element.src : '';
        }
        set overflow(value) {
            if (value === 0 || value === 16 /* VERTICAL */ || value === 8 /* HORIZONTAL */ || value === (8 /* HORIZONTAL */ | 16 /* VERTICAL */)) {
                if ($util$7.hasBit(this.overflow, 64 /* BLOCK */)) {
                    value |= 64 /* BLOCK */;
                }
                this._cached.overflow = value;
            }
        }
        get overflow() {
            if (this._cached.overflow === undefined) {
                let value = 0;
                if (this.styleElement && !this.documentBody) {
                    const element = this._element;
                    const overflowX = this.css('overflowX');
                    const overflowY = this.css('overflowY');
                    if ((this.has($const$4.CSS.WIDTH) || this.has('maxWidth')) && (overflowX === 'scroll' || overflowX === $const$4.CSS.AUTO && element && element.clientWidth !== element.scrollWidth)) {
                        value |= 8 /* HORIZONTAL */;
                    }
                    if (this.hasHeight && (this.has($const$4.CSS.HEIGHT) || this.has('maxHeight')) && (overflowY === 'scroll' || overflowY === $const$4.CSS.AUTO && element && element.clientHeight !== element.scrollHeight)) {
                        value |= 16 /* VERTICAL */;
                    }
                    if (overflowX === $const$4.CSS.AUTO || overflowX === 'hidden' || overflowX === 'overlay' || overflowY === $const$4.CSS.AUTO || overflowY === 'hidden' || overflowY === 'overlay') {
                        value |= 64 /* BLOCK */;
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
                this._cached.baseline = this.pageFlow && !this.floating && this.cssAny('verticalAlign', 'baseline', 'initial', $const$4.CSS.PX_0, $const$4.CSS.PERCENT_0);
            }
            return this._cached.baseline;
        }
        get verticalAlign() {
            if (this._cached.verticalAlign === undefined) {
                let value = this.css('verticalAlign');
                if ($css$4.isLength(value, true)) {
                    value = this.convertPX(value, $const$4.CSS.HEIGHT);
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
                this._cached.positiveAxis = (!this.positionRelative || this.positionRelative && this.top >= 0 && this.left >= 0 && (this.right <= 0 || this.has($const$4.CSS.LEFT)) && (this.bottom <= 0 || this.has($const$4.CSS.TOP))) && this.marginTop >= 0 && this.marginLeft >= 0 && this.marginRight >= 0;
            }
            return this._cached.positiveAxis;
        }
        get leftTopAxis() {
            if (this._cached.leftTopAxis === undefined) {
                const value = this.cssInitial('position');
                this._cached.leftTopAxis = value === 'absolute' && this.absoluteParent === this.documentParent || value === 'fixed';
            }
            return this._cached.leftTopAxis;
        }
        get backgroundColor() {
            if (this._cached.backgroundColor === undefined) {
                let value = this.css('backgroundColor');
                switch (value) {
                    case 'initial':
                    case 'unset':
                    case 'rgba(0, 0, 0, 0)':
                        this._cached.backgroundColor = '';
                        break;
                    default:
                        if (value !== '' && this.pageFlow && (this._initial.iteration === -1 || this.cssInitial('backgroundColor') === value)) {
                            let current = this.actualParent;
                            while (current && current.id !== 0) {
                                const color = current.cssInitial('backgroundColor', true);
                                if (color !== '') {
                                    if (color === value) {
                                        value = '';
                                    }
                                    break;
                                }
                                current = current.actualParent;
                            }
                        }
                        this._cached.backgroundColor = value;
                        break;
                }
            }
            return this._cached.backgroundColor;
        }
        get backgroundImage() {
            if (this._cached.backgroundImage === undefined) {
                const value = this.css('backgroundImage');
                if (value !== '' && value !== $const$4.CSS.NONE) {
                    this._cached.backgroundImage = value;
                }
                else {
                    const match = REGEXP_BACKGROUND.exec(this.css('background'));
                    this._cached.backgroundImage = match ? match[1] : '';
                }
            }
            return this._cached.backgroundImage;
        }
        get visibleStyle() {
            if (this._cached.visibleStyle === undefined) {
                const borderWidth = this.borderTopWidth > 0 || this.borderRightWidth > 0 || this.borderBottomWidth > 0 || this.borderLeftWidth > 0;
                const backgroundColor = this.backgroundColor !== '';
                const backgroundImage = this.backgroundImage !== '';
                this._cached.visibleStyle = {
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
                this._cached.preserveWhiteSpace = this.cssAny('whiteSpace', 'pre', 'pre-wrap');
            }
            return this._cached.preserveWhiteSpace;
        }
        get percentWidth() {
            if (this._cached.percentWidth === undefined) {
                this._cached.percentWidth = this.has($const$4.CSS.WIDTH, 32 /* PERCENT */);
            }
            return this._cached.percentWidth;
        }
        get percentHeight() {
            if (this._cached.percentHeight === undefined) {
                this._cached.percentHeight = this.has($const$4.CSS.HEIGHT, 32 /* PERCENT */);
            }
            return this._cached.percentHeight;
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
            return this._documentParent || this.absoluteParent || this.actualParent || this.parent || this;
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
                    const children = [];
                    this._element.childNodes.forEach((element) => {
                        const node = $session$2.getElementAsNode(element, this.sessionId);
                        if (node) {
                            children.push(node);
                        }
                    });
                    this._cached.actualChildren = children;
                }
                else {
                    if (this._initial.iteration === -1) {
                        this.saveAsInitial();
                    }
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
                    let width = this.parseUnit(this.cssInitial($const$4.CSS.WIDTH, true));
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
                if (!this.plainText && !this.documentParent.flexElement && this.display !== 'table-cell') {
                    let height = this.parseUnit(this.cssInitial($const$4.CSS.HEIGHT, true), $const$4.CSS.HEIGHT);
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
        set siblingsLeading(value) {
            this._siblingsLeading = value;
        }
        get siblingsLeading() {
            if (this._siblingsLeading === undefined) {
                this._siblingsLeading = this.previousSiblings();
            }
            return this._siblingsLeading;
        }
        set siblingsTrailing(value) {
            this._siblingsTrailing = value;
        }
        get siblingsTrailing() {
            if (this._siblingsTrailing === undefined) {
                this._siblingsTrailing = this.nextSiblings();
            }
            return this._siblingsTrailing;
        }
        get firstChild() {
            for (const node of this.actualChildren) {
                if (node.naturalElement) {
                    return node;
                }
            }
            return null;
        }
        get lastChild() {
            for (let i = this.actualChildren.length - 1; i >= 0; i--) {
                const node = this.actualChildren[i];
                if (node.naturalElement) {
                    return node;
                }
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
        get fontSize() {
            if (this._fontSize === 0) {
                this._fontSize = this.styleElement && !this.pseudoElement ? parseFloat(this.style.getPropertyValue('font-size')) : $css$4.parseUnit(this.css('fontSize'));
            }
            return this._fontSize || parseFloat($css$4.getStyle(document.body).getPropertyValue('font-size'));
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
        get center() {
            return {
                x: (this.bounds.left + this.bounds.right) / 2,
                y: (this.bounds.top + this.bounds.bottom) / 2
            };
        }
    }

    const $const$5 = squared.lib.constant;
    class NodeGroup extends Node {
        init() {
            if (this.length) {
                let siblingIndex = Number.POSITIVE_INFINITY;
                for (const item of this.children) {
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
        previousSiblings(options) {
            const node = this.item(0);
            return node ? node.previousSiblings(options) : [];
        }
        nextSiblings(options) {
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
                const value = (this.actualChildren.length && this.actualChildren[0].blockStatic ||
                    this.actualWidth === this.documentParent.actualWidth && !this.some(node => node.plainText || node.naturalElement && node.rightAligned) ||
                    this.layoutVertical && this.some(node => node.naturalElement && node.blockStatic) ||
                    this.documentParent.blockStatic && this.hasAlign(256 /* COLUMN */));
                if (value || this.containerType !== 0) {
                    this._cached.blockStatic = value;
                }
            }
            return this._cached.blockStatic || this.hasAlign(64 /* BLOCK */);
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
                this._cached.inlineStatic = this.inlineStatic || this.hasAlign(128 /* SEGMENTED */);
            }
            return this._cached.inlineStatic;
        }
        get pageFlow() {
            if (this._cached.pageFlow === undefined) {
                this._cached.pageFlow = !this.cssAny('position', 'absolute', 'fixed');
            }
            return this._cached.pageFlow;
        }
        set baseline(value) {
            super.baseline = value;
        }
        get baseline() {
            if (this._cached.baseline === undefined) {
                const value = this.cssInitial('verticalAlign', true);
                this._cached.baseline = value !== '' ? value === 'baseline'
                    : this.layoutHorizontal && this.every(node => node.baseline);
            }
            return this._cached.baseline;
        }
        get float() {
            if (this._cached.float === undefined) {
                this._cached.float = !this.floating ? $const$5.CSS.NONE
                    : this.hasAlign(2048 /* RIGHT */) ? $const$5.CSS.RIGHT : $const$5.CSS.LEFT;
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

    const $client$1 = squared.lib.client;
    const $color = squared.lib.color;
    const $const$6 = squared.lib.constant;
    const $css$5 = squared.lib.css;
    const $math$1 = squared.lib.math;
    const $regex$1 = squared.lib.regex;
    const $session$3 = squared.lib.session;
    const $util$8 = squared.lib.util;
    const STRING_SPACE = '&#160;';
    const STRING_COLORSTOP = `(rgba?\\(\\d+, \\d+, \\d+(?:, [\\d.]+)?\\)|#[A-Za-z\\d]{3,8}|[a-z]+)\\s*(${$regex$1.STRING.LENGTH_PERCENTAGE}|${$regex$1.STRING.CSS_ANGLE}|(?:${$regex$1.STRING.CSS_CALC}(?=,)|${$regex$1.STRING.CSS_CALC}))?,?\\s*`;
    const REGEXP_U00A0 = /\u00A0/g;
    const REGEXP_NEWLINE = /\n/g;
    const REGEXP_AMPERSAND = /&/g;
    const REGEXP_BACKGROUNDIMAGE = new RegExp(`(?:initial|url\\([^)]+\\)|(repeating)?-?(linear|radial|conic)-gradient\\(((?:to [a-z ]+|(?:from )?-?[\\d.]+(?:deg|rad|turn|grad)|(?:circle|ellipse)?\\s*(?:closest-side|closest-corner|farthest-side|farthest-corner)?)?(?:\\s*at [\\w %]+)?),?\\s*((?:${STRING_COLORSTOP})+)\\))`, 'g');
    function removeExcluded(node, element, attr) {
        let value = element[attr];
        const length = node.actualChildren.length;
        for (let i = 0; i < length; i++) {
            const item = node.actualChildren[i];
            if (!item.textElement || !item.pageFlow || item.positioned || item.pseudoElement || item.excluded || item.dataset.target) {
                if (item.htmlElement && attr === 'innerHTML') {
                    if (item.lineBreak) {
                        value = value.replace(new RegExp(`\\s*${item.element.outerHTML}\\s*`), '\\n');
                    }
                    else {
                        value = value.replace(item.element.outerHTML, item.pageFlow && item.textContent ? STRING_SPACE : '');
                    }
                }
                else if ($util$8.isString(item[attr])) {
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
            value = value.replace($regex$1.ESCAPE.ENTITY, (match, capture) => String.fromCharCode(parseInt(capture)));
        }
        return value;
    }
    function parseColorStops(node, gradient, value, opacity) {
        const radial = gradient;
        const dimension = radial.horizontal ? $const$6.CSS.WIDTH : $const$6.CSS.HEIGHT;
        const repeating = radial.repeating === true;
        const extent = repeating && gradient.type === 'radial' ? radial.radiusExtent / radial.radius : 1;
        const pattern = new RegExp(STRING_COLORSTOP, 'g');
        const result = [];
        let match;
        let previousOffset = 0;
        while ((match = pattern.exec(value)) !== null) {
            const color = $color.parseColor(match[1], opacity, true);
            if (color) {
                let offset = -1;
                if (gradient.type === 'conic') {
                    if (match[3] && match[4]) {
                        offset = $css$5.convertAngle(match[3], match[4]) / 360;
                    }
                }
                else if (match[2]) {
                    if ($css$5.isPercent(match[2])) {
                        offset = parseFloat(match[2]) / 100;
                    }
                    else if (repeating) {
                        const size = gradient.type === 'radial' ? radial.radius : gradient.dimension[dimension];
                        if ($css$5.isLength(match[2])) {
                            offset = node.parseUnit(match[2], dimension, false) / size;
                        }
                        else if ($css$5.isCalc(match[2])) {
                            offset = $css$5.calculate(match[6], size, node.fontSize) / size;
                        }
                    }
                    if (repeating && offset !== -1) {
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
        value = value.replace(REGEXP_U00A0, STRING_SPACE);
        switch (node.css('whiteSpace')) {
            case 'nowrap':
                value = value.replace(REGEXP_NEWLINE, ' ');
                break;
            case 'pre':
            case 'pre-wrap':
                if (!parent.layoutVertical) {
                    value = value.replace(/^\s*?\n/, '');
                }
                value = value
                    .replace(REGEXP_NEWLINE, '\\n')
                    .replace(/\s/g, STRING_SPACE);
                break;
            case 'pre-line':
                value = value
                    .replace(REGEXP_NEWLINE, '\\n')
                    .replace(/\s+/g, ' ');
                break;
            default:
                if (element.previousSibling && $session$3.causesLineBreak(element.previousSibling, node.sessionId) || node.singleChild && node.htmlElement) {
                    value = value.replace($regex$1.CHAR.LEADINGSPACE, '');
                }
                if (element.nextSibling && $session$3.causesLineBreak(element.nextSibling, node.sessionId) || node.singleChild && node.htmlElement) {
                    value = value.replace($regex$1.CHAR.TRAILINGSPACE, '');
                }
                return [value, false];
        }
        return [value, true];
    }
    function getBackgroundSize(node, index, value) {
        if (value) {
            const sizes = value.split($regex$1.XML.SEPARATOR);
            return Resource.getBackgroundSize(node, sizes[index % sizes.length]);
        }
        return undefined;
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
        static getOptionArray(element, showDisabled = false) {
            const stringArray = [];
            let numberArray = true;
            for (let i = 0; i < element.children.length; i++) {
                const item = element.children[i];
                if (!showDisabled && item.disabled) {
                    continue;
                }
                const value = item.text.trim() || item.value.trim();
                if (value !== '') {
                    if (numberArray && !$util$8.isNumber(value)) {
                        numberArray = false;
                    }
                    stringArray.push(value);
                }
            }
            return numberArray ? [undefined, stringArray] : [stringArray];
        }
        static isBackgroundVisible(object) {
            return object !== undefined && (!!object.backgroundImage || !!object.borderTop || !!object.borderRight || !!object.borderBottom || !!object.borderLeft);
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
                        if (dimensions[i] === $const$6.CSS.AUTO) {
                            dimensions[i] = $const$6.CSS.PERCENT_100;
                        }
                        if (i === 0) {
                            width = node.parseUnit(dimensions[i], $const$6.CSS.WIDTH, false);
                        }
                        else {
                            height = node.parseUnit(dimensions[i], $const$6.CSS.HEIGHT, false);
                        }
                    }
                    break;
            }
            return width > 0 && height > 0 ? { width: Math.round(width), height: Math.round(height) } : undefined;
        }
        static isInheritedStyle(node, attr) {
            if (node.styleElement) {
                const actualParent = node.actualParent;
                if (actualParent && node.cssInitial(attr) === '') {
                    return node.style[attr] === actualParent.style[attr];
                }
            }
            return false;
        }
        static hasLineBreak(node, lineBreak = false, trim = false) {
            if (node.actualChildren.length) {
                return node.actualChildren.some(item => item.lineBreak);
            }
            else if (!lineBreak && node.naturalElement) {
                const element = node.element;
                let value = element.textContent;
                if (trim) {
                    value = value.trim();
                }
                if (/\n/.test(value)) {
                    if (node.plainText && $css$5.isParentStyle(element, 'whiteSpace', 'pre', 'pre-wrap')) {
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
                if (element.src.startsWith('data:image/')) {
                    const match = new RegExp(`^${$regex$1.STRING.DATAURI}$`).exec(element.src);
                    if (match && match[1] && match[2]) {
                        this.addRawData(element.src, match[1], match[2], match[3], element.naturalWidth, element.naturalHeight);
                    }
                }
                const uri = element.src;
                if (uri !== '') {
                    Resource.ASSETS.images.set(uri, { width: element.naturalWidth, height: element.naturalHeight, uri });
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
        getFont(fontFamily, fontStyle = 'normal', fontWeight) {
            const font = Resource.ASSETS.fonts.get(fontFamily);
            if (font) {
                const fontFormat = this.application.controllerHandler.localSettings.supported.fontFormat;
                return font.find(item => item.fontStyle === fontStyle && (fontWeight === undefined || item.fontWeight === parseInt(fontWeight)) && fontFormat.includes(item.srcFormat));
            }
            return undefined;
        }
        addRawData(dataURI, mimeType, encoding, content, width = 0, height = 0) {
            encoding = encoding.toLowerCase();
            const settings = this.application.controllerHandler.localSettings;
            let base64;
            if (encoding === 'base64') {
                base64 = content;
                if (mimeType === 'image/svg+xml') {
                    content = window.atob(content);
                }
            }
            else {
                content = content.replace(/\\"/g, '"');
            }
            for (const format of settings.supported.imageFormat) {
                if (mimeType.indexOf(format) !== -1) {
                    let filename;
                    if (dataURI.endsWith(`.${format}`)) {
                        filename = $util$8.fromLastIndexOf(dataURI, '/');
                    }
                    else {
                        filename = `${$util$8.buildAlphaString(5).toLowerCase()}_${new Date().getTime()}.${format}`;
                    }
                    Resource.ASSETS.rawData.set(dataURI, {
                        pathname: '',
                        filename,
                        content,
                        base64,
                        mimeType,
                        width,
                        height
                    });
                    return filename;
                }
            }
            return '';
        }
        getRawData(dataURI) {
            if (dataURI.startsWith('url(')) {
                const match = $regex$1.CSS.URL.exec(dataURI);
                if (match) {
                    dataURI = match[1];
                }
            }
            return Resource.ASSETS.rawData.get(dataURI);
        }
        writeRawImage(filename, base64) {
            if (this.fileHandler) {
                this.fileHandler.addAsset({
                    pathname: this.application.controllerHandler.localSettings.directory.image,
                    filename,
                    base64
                });
            }
        }
        setBoxStyle(node) {
            if (node.visible && node.styleElement) {
                const boxStyle = {
                    backgroundSize: node.css('backgroundSize'),
                    backgroundRepeat: node.css('backgroundRepeat'),
                    backgroundPositionX: node.css('backgroundPositionX'),
                    backgroundPositionY: node.css('backgroundPositionY')
                };
                const element = node.element;
                const opacity = node.css('opacity');
                function setBorderStyle(attr, border) {
                    const style = node.css(border[0]) || $const$6.CSS.NONE;
                    let width = $css$5.formatPX(attr !== 'outline' ? node[border[1]] : $util$8.convertFloat(node.style[border[1]]));
                    let color = node.css(border[2]) || 'initial';
                    switch (color) {
                        case 'initial':
                            color = 'rgb(0, 0, 0)';
                            break;
                        case 'inherit':
                        case 'currentcolor':
                            color = $css$5.getInheritedStyle(element, border[2]);
                            break;
                    }
                    if (style !== $const$6.CSS.NONE && width !== $const$6.CSS.PX_0) {
                        if (width === '2px' && (style === 'inset' || style === 'outset')) {
                            width = '1px';
                        }
                        const borderColor = $color.parseColor(color, opacity, true);
                        if (borderColor) {
                            boxStyle[attr] = {
                                width,
                                style,
                                color: borderColor
                            };
                        }
                    }
                }
                switch (node.css('backgroundClip')) {
                    case 'padding-box':
                        boxStyle.backgroundClip = {
                            top: node.borderTopWidth,
                            right: node.borderRightWidth,
                            bottom: node.borderBottomWidth,
                            left: node.borderLeftWidth
                        };
                        break;
                    case 'content-box':
                        boxStyle.backgroundClip = {
                            top: node.borderTopWidth + node.paddingTop,
                            right: node.borderRightWidth + node.paddingRight,
                            bottom: node.borderBottomWidth + node.paddingBottom,
                            left: node.borderLeftWidth + node.paddingLeft
                        };
                        break;
                }
                if (node.css('borderRadius') !== $const$6.CSS.PX_0) {
                    const [A, B] = node.css('borderTopLeftRadius').split(' ');
                    const [C, D] = node.css('borderTopRightRadius').split(' ');
                    const [E, F] = node.css('borderBottomRightRadius').split(' ');
                    const [G, H] = node.css('borderBottomLeftRadius').split(' ');
                    const borderRadius = !B && !D && !F && !H ? [A, C, E, G] : [A, B || A, C, D || C, E, F || E, G, H || G];
                    const horizontal = node.actualWidth >= node.actualHeight;
                    if (borderRadius.every(radius => radius === borderRadius[0])) {
                        if (borderRadius[0] === $const$6.CSS.PX_0 || borderRadius[0] === '') {
                            borderRadius.length = 0;
                        }
                        else {
                            borderRadius.length = 1;
                        }
                    }
                    if (borderRadius.length) {
                        for (let i = 0; i < borderRadius.length; i++) {
                            borderRadius[i] = node.convertPX(borderRadius[i], horizontal ? $const$6.CSS.WIDTH : $const$6.CSS.HEIGHT, false);
                        }
                        boxStyle.borderRadius = borderRadius;
                    }
                }
                if (!node.css('border').startsWith('0px none')) {
                    setBorderStyle('borderTop', $css$5.BOX_BORDER[0]);
                    setBorderStyle('borderRight', $css$5.BOX_BORDER[1]);
                    setBorderStyle('borderBottom', $css$5.BOX_BORDER[2]);
                    setBorderStyle('borderLeft', $css$5.BOX_BORDER[3]);
                    setBorderStyle('outline', $css$5.BOX_BORDER[4]);
                }
                if (node.hasResource(NODE_RESOURCE.IMAGE_SOURCE)) {
                    const images = [];
                    let match;
                    let i = 0;
                    while ((match = REGEXP_BACKGROUNDIMAGE.exec(node.backgroundImage)) !== null) {
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
                                    conic.center = $css$5.getBackgroundPosition(position && position[2] || $const$6.CSS.CENTER, dimension, node.fontSize);
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
                                    radial.center = $css$5.getBackgroundPosition(position && position[2] || $const$6.CSS.CENTER, dimension, node.fontSize);
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
                                    let x = $math$1.truncateFraction($math$1.offsetAngleX(angle, width));
                                    let y = $math$1.truncateFraction($math$1.offsetAngleY(angle, height));
                                    if (x !== width && y !== height && !$math$1.isEqual(Math.abs(x), Math.abs(y))) {
                                        let oppositeAngle;
                                        if (angle <= 90) {
                                            oppositeAngle = $math$1.relativeAngle({ x: 0, y: height }, { x: width, y: 0 });
                                        }
                                        else if (angle <= 180) {
                                            oppositeAngle = $math$1.relativeAngle({ x: 0, y: 0 }, { x: width, y: height });
                                        }
                                        else if (angle <= 270) {
                                            oppositeAngle = $math$1.relativeAngle({ x: 0, y: 0 }, { x: -width, y: height });
                                        }
                                        else {
                                            oppositeAngle = $math$1.relativeAngle({ x: 0, y: height }, { x: -width, y: 0 });
                                        }
                                        let a = Math.abs(oppositeAngle - angle);
                                        let b = 90 - a;
                                        const lenX = $math$1.triangulateASA(a, b, Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)));
                                        x = $math$1.truncateFraction($math$1.offsetAngleX(angle, lenX[1]));
                                        a = 90;
                                        b = 90 - angle;
                                        const lenY = $math$1.triangulateASA(a, b, x);
                                        y = $math$1.truncateFraction($math$1.offsetAngleY(angle, lenY[0]));
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
                const backgroundColor = node.documentParent.visible ? node.backgroundColor : node.css('backgroundColor');
                if (backgroundColor !== '') {
                    const color = $color.parseColor(backgroundColor, opacity);
                    boxStyle.backgroundColor = color ? color.valueAsRGBA : '';
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
            if (!(node.element === null || node.renderChildren.length || node.imageElement || node.svgElement || node.tagName === 'HR' || node.textEmpty && !node.visibleStyle.background)) {
                const color = $color.parseColor(node.css('color'), node.css('opacity'));
                let fontWeight = node.css('fontWeight');
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
                node.data(Resource.KEY_NAME, 'fontStyle', {
                    fontFamily: node.css('fontFamily').trim(),
                    fontStyle: node.css('fontStyle'),
                    fontSize: $css$5.formatPX(node.fontSize),
                    fontWeight,
                    color: color ? color.valueAsRGBA : ''
                });
            }
        }
        setValueString(node) {
            if (node.visible && !node.svgElement) {
                const element = node.element;
                const renderParent = node.renderParent;
                if (element && renderParent) {
                    let name = '';
                    let value = '';
                    let hint = '';
                    let trimming = false;
                    let inlined = false;
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
                                    value = $client$1.isUserAgent(8 /* FIREFOX */) ? 'Browse...' : 'Choose File';
                                    break;
                            }
                            break;
                        case 'TEXTAREA':
                            value = element.value;
                            break;
                        case 'IFRAME':
                            value = element.src;
                            break;
                        default:
                            const textContent = node.textContent;
                            if (node.plainText) {
                                name = textContent.trim();
                                [value] = replaceWhiteSpace(renderParent, node, element, textContent.replace(REGEXP_AMPERSAND, '&amp;'));
                                inlined = true;
                                trimming = true;
                            }
                            else if (node.inlineText) {
                                name = textContent.trim();
                                [value, inlined] = replaceWhiteSpace(renderParent, node, element, removeExcluded(node, element, element.children.length || element.tagName === 'CODE' ? 'innerHTML' : 'textContent'));
                                trimming = true;
                            }
                            else if (textContent.trim() === '' && Resource.isBackgroundVisible(node.data(Resource.KEY_NAME, 'boxStyle'))) {
                                value = textContent;
                            }
                            break;
                    }
                    if (value !== '') {
                        if (trimming) {
                            const previousSibling = node.siblingsLeading[0];
                            let previousSpaceEnd = false;
                            if (value.length > 1) {
                                if (previousSibling === undefined || previousSibling.multiline || previousSibling.lineBreak || previousSibling.plainText && $regex$1.CHAR.TRAILINGSPACE.test(previousSibling.textContent)) {
                                    value = value.replace($regex$1.CHAR.LEADINGSPACE, '');
                                }
                                else if (previousSibling.naturalElement) {
                                    const textContent = previousSibling.textContent;
                                    if (textContent.length) {
                                        previousSpaceEnd = textContent.charCodeAt(textContent.length - 1) === 32;
                                    }
                                }
                            }
                            if (inlined) {
                                const original = value;
                                value = value.trim();
                                if (previousSibling && $regex$1.CHAR.LEADINGSPACE.test(original) && !previousSibling.block && !previousSibling.lineBreak && !previousSpaceEnd) {
                                    value = STRING_SPACE + value;
                                }
                                if (!node.lineBreakTrailing && $regex$1.CHAR.TRAILINGSPACE.test(original)) {
                                    const nextSibling = node.siblingsTrailing.find(item => !item.excluded || item.lineBreak);
                                    if (nextSibling && !nextSibling.blockStatic) {
                                        value += STRING_SPACE;
                                    }
                                }
                            }
                            else if (value.trim() !== '') {
                                value = value.replace($regex$1.CHAR.LEADINGSPACE, previousSibling && (previousSibling.block ||
                                    previousSibling.lineBreak ||
                                    previousSpaceEnd && previousSibling.htmlElement && previousSibling.textContent.length > 1 ||
                                    node.multiline && Resource.hasLineBreak(node)) ? '' : STRING_SPACE);
                                value = value.replace($regex$1.CHAR.TRAILINGSPACE, node.display === 'table-cell' || node.lineBreakTrailing || node.blockStatic ? '' : STRING_SPACE);
                            }
                            else if (!node.inlineText) {
                                return;
                            }
                        }
                        if (value !== '') {
                            node.data(Resource.KEY_NAME, 'valueString', { name, value });
                        }
                    }
                    if (hint !== '') {
                        node.data(Resource.KEY_NAME, 'hintString', hint);
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
        fonts: new Map(),
        rawData: new Map()
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
                showLabel: false
            };
        }
        afterInit() {
            for (const node of this.application.processing.cache) {
                if (node.hasProcedure(NODE_PROCEDURE.ACCESSIBILITY)) {
                    switch (node.tagName) {
                        case 'INPUT_IMAGE':
                            node.extracted = [node];
                            break;
                        case 'INPUT_RADIO':
                        case 'INPUT_CHECKBOX':
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

    const $const$7 = squared.lib.constant;
    const $css$6 = squared.lib.css;
    const $regex$2 = squared.lib.regex;
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
            mainData.row.gap = node.parseUnit(node.css('rowGap'), $const$7.CSS.HEIGHT, false);
            mainData.column.gap = node.parseUnit(node.css('columnGap'), $const$7.CSS.WIDTH, false);
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
                if (value && value !== $const$7.CSS.NONE && value !== $const$7.CSS.AUTO) {
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
                                            repeating.push({ unit: convertLength(node, namedMatch[1]), unitMin: $const$7.CSS.PX_0 });
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
                                data.unitMin.push($const$7.CSS.PX_0);
                                data.repeat.push(false);
                                i++;
                            }
                            else if (REGEXP_GRID.UNIT.test(match[1])) {
                                data.unit.push(match[1] === $const$7.CSS.AUTO ? $const$7.CSS.AUTO : convertLength(node, match[1]));
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
            if (!node.has('gridTemplateAreas') && node.every(item => item.css('gridRowStart') === $const$7.CSS.AUTO && item.css('gridColumnStart') === $const$7.CSS.AUTO)) {
                let directionA;
                let directionB;
                let indexA;
                let indexB;
                let indexC;
                if (horizontal) {
                    directionA = $const$7.CSS.TOP;
                    directionB = $const$7.CSS.BOTTOM;
                    indexA = 2;
                    indexB = 1;
                    indexC = 3;
                }
                else {
                    directionA = $const$7.CSS.LEFT;
                    directionB = $const$7.CSS.RIGHT;
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
                    if (template !== $const$7.CSS.NONE) {
                        const templateAreas = mainData.templateAreas;
                        $util$9.trimString(template.trim(), '"').split($regex$2.CHAR.SPACE).forEach((area, j) => {
                            if (area.charAt(0) !== '.') {
                                if (templateAreas[area]) {
                                    templateAreas[area].rowSpan = (i - templateAreas[area].rowStart) + 1;
                                    templateAreas[area].columnSpan = (j - templateAreas[area].columnStart) + 1;
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
                                        if (match[2] === $const$7.CSS.START) {
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
                            if (value !== $const$7.CSS.AUTO && !placement[i] && !setPlacement(value, i)) {
                                const data = mainData[i % 2 === 0 ? 'row' : 'column'];
                                const alias = value.split(' ');
                                if (alias.length === 1) {
                                    alias[1] = alias[0];
                                    alias[0] = '1';
                                }
                                else if ($util$9.isNumber(alias[0])) {
                                    if (i % 2 === 0) {
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
                        data.unit.push($const$7.CSS.AUTO);
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
                        for (let i = rowStart; i < rowStart + rowSpan; i++) {
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
                    node.data(EXT_NAME.CSS_GRID, STRING_BASE.EXT_DATA, mainData);
                }
            }
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

    const $const$8 = squared.lib.constant;
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
                if (item.pageFlow && item.pseudoElement && item.contentBoxWidth === 0 && item.css('content') === '""') {
                    item.hide();
                    return false;
                }
                return item.pageFlow;
            });
            const mainData = Flexbox.createDataAttribute(node, children);
            if (node.cssTry('align-items', $const$8.CSS.START)) {
                if (node.cssTry('justify-items', $const$8.CSS.START)) {
                    for (const item of children) {
                        const bounds = item.initial.bounds;
                        if (bounds && item.cssTry('align-self', $const$8.CSS.START)) {
                            if (item.cssTry('justify-self', $const$8.CSS.START)) {
                                if (item.cssTry('flex-grow', '0')) {
                                    if (item.cssTry('flex-shrink', '1')) {
                                        const rect = item.element.getBoundingClientRect();
                                        bounds.width = rect.width;
                                        bounds.height = rect.height;
                                        item.cssFinally('flex-shrink');
                                    }
                                    item.cssFinally('flex-grow');
                                }
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
                let align;
                let sort;
                let size;
                let method;
                if (mainData.directionRow) {
                    align = $const$8.CSS.TOP;
                    sort = $const$8.CSS.LEFT;
                    size = $const$8.CSS.RIGHT;
                    method = 'intersectY';
                }
                else {
                    align = $const$8.CSS.LEFT;
                    sort = $const$8.CSS.TOP;
                    size = $const$8.CSS.BOTTOM;
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
                if (rows.length > 1) {
                    for (let i = 0; i < rows.length; i++) {
                        const seg = rows[i];
                        const group = controller.createNodeGroup(seg[0], seg, node, true);
                        group.siblingIndex = i;
                        node.sort(NodeList.siblingIndex);
                        const box = group.unsafe('box');
                        if (box) {
                            box[size] = node.box[size];
                        }
                        group.addAlign(128 /* SEGMENTED */);
                        maxCount = Math.max(seg.length, maxCount);
                    }
                }
                else {
                    maxCount = rows[0].length;
                    node.retain(rows[0]);
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
            node.data(EXT_NAME.FLEXBOX, STRING_BASE.EXT_DATA, mainData);
            return undefined;
        }
    }

    const $const$9 = squared.lib.constant;
    const $css$8 = squared.lib.css;
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
                block: false
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
                            if (i === 0 || $util$b.aboveRange(nextX.linear.left, columnRight[i - 1])) {
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
                                    if (Math.floor(nextX.linear.left) > Math.ceil(minLeft) && Math.floor(nextX.linear.right) > Math.ceil(maxRight)) {
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
                const assigned = new Set();
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
                                for (const sibling of item.documentParent.actualChildren) {
                                    if (!assigned.has(sibling) && sibling.visible && !sibling.rendered && $util$b.aboveRange(sibling.linear.left, item.linear.right) && $util$b.belowRange(sibling.linear.right, columnEnd[l])) {
                                        if (data.siblings === undefined) {
                                            data.siblings = [];
                                        }
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
                            assigned.add(item);
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
                    let hasLength = true;
                    let hasPercent = false;
                    for (const item of group) {
                        const width = item.css($const$9.CSS.WIDTH);
                        if ($css$8.isPercent(width)) {
                            hasPercent = true;
                        }
                        else if (!$css$8.isLength(width)) {
                            hasLength = false;
                            break;
                        }
                    }
                    if (hasLength && hasPercent && group.length > 1) {
                        const cellData = group[0].data(EXT_NAME.GRID, 'cellData');
                        if (cellData && cellData.rowSpan === 1) {
                            const siblings = cellData.siblings ? cellData.siblings.slice(0) : [];
                            for (let i = 1; i < group.length; i++) {
                                const item = group[i];
                                const siblingData = item.data(EXT_NAME.GRID, 'cellData');
                                if (siblingData && siblingData.rowSpan === 1) {
                                    siblings.push(group[i]);
                                    if (siblingData.sibling) {
                                        $util$b.concatArray(siblings, siblingData.sibling);
                                    }
                                }
                                else {
                                    siblings.length = 0;
                                    break;
                                }
                            }
                            if (siblings.length) {
                                cellData.block = true;
                                cellData.columnSpan = mainData.columnCount;
                                cellData.siblings = siblings;
                                group.length = 1;
                            }
                        }
                    }
                    for (const item of group) {
                        item.parent = node;
                        if (!hasLength && item.percentWidth) {
                            item.css($const$9.CSS.WIDTH, $css$8.formatPX(item.bounds.width));
                        }
                    }
                }
                if (node.tableElement && node.css('borderCollapse') === 'collapse') {
                    node.modifyBox(32 /* PADDING_TOP */);
                    node.modifyBox(64 /* PADDING_RIGHT */);
                    node.modifyBox(128 /* PADDING_BOTTOM */);
                    node.modifyBox(256 /* PADDING_LEFT */);
                }
                node.data(EXT_NAME.GRID, STRING_BASE.EXT_DATA, mainData);
            }
            return undefined;
        }
    }

    const $const$a = squared.lib.constant;
    const $css$9 = squared.lib.css;
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
                        const item = node.item(i);
                        const listStyleType = item.css('listStyleType') !== $const$a.CSS.NONE;
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
                        else if (i === 0 || i === length - 1 || item.blockStatic || node.item(i - 1).blockStatic && node.item(i + 1).blockStatic) {
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
                if (item.display === 'list-item' || value && value !== $const$a.CSS.NONE || hasSingleImage(item)) {
                    if (item.has('listStyleImage')) {
                        mainData.imageSrc = item.css('listStyleImage');
                    }
                    else {
                        mainData.ordinal = $css$9.convertListStyle(value, i);
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
                                        src = item.backgroundImage;
                                        position = item.css('backgroundPosition');
                                    }
                                    if (src && src !== $const$a.CSS.NONE) {
                                        mainData.imageSrc = src;
                                        mainData.imagePosition = position;
                                        item.exclude(NODE_RESOURCE.IMAGE_SOURCE);
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
                item.data(EXT_NAME.LIST, STRING_BASE.EXT_DATA, mainData);
            });
            return undefined;
        }
    }

    const $const$b = squared.lib.constant;
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
                let top = node.top;
                let right = node.right;
                let bottom = node.bottom;
                let left = node.left;
                if (renderParent.support.container.positionRelative && renderParent.layoutHorizontal && node.renderChildren.length === 0 && (node.top !== 0 || node.bottom !== 0 || verticalAlign !== 0)) {
                    target = node.clone(this.application.nextId, true, true);
                    target.baselineAltered = true;
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
                            if (item.alignSibling(STRING_BASE.TOP_BOTTOM) === node.documentId) {
                                item.alignSibling(STRING_BASE.TOP_BOTTOM, target.documentId);
                            }
                            else if (item.alignSibling(STRING_BASE.BOTTOM_TOP) === node.documentId) {
                                item.alignSibling(STRING_BASE.BOTTOM_TOP, target.documentId);
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
                                        item.css('verticalAlign', $const$b.CSS.PX_0, true);
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
                        let previous;
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
                                    if (renderParent.layoutHorizontal && (node.left !== 0 || node.right !== 0) && node.alignSibling(STRING_BASE.LEFT_RIGHT) === '') {
                                        const bounds = $dom$2.assignRect(node.element.getBoundingClientRect(), true);
                                        if (left !== 0) {
                                            left -= bounds.left - node.bounds.left;
                                        }
                                        if (right !== 0) {
                                            right += bounds.right - node.bounds.right;
                                        }
                                    }
                                }
                                else if (renderParent.layoutVertical) {
                                    if (top !== 0) {
                                        if (previous && previous.blockStatic && previous.positionRelative && item.blockStatic) {
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
                            previous = item;
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

    const $css$a = squared.lib.css;
    class Sprite extends Extension {
        condition(node) {
            let valid = false;
            if (node.hasWidth && node.hasHeight && node.length === 0 && node.backgroundImage !== '' && (this.included(node.element) || !node.dataset.use)) {
                const image = (this.application.resourceHandler.getRawData(node.backgroundImage) || this.application.resourceHandler.getImage($css$a.resolveURL(node.backgroundImage)));
                if (image) {
                    const dimension = node.actualDimension;
                    const position = $css$a.getBackgroundPosition(`${node.css('backgroundPositionX')} ${node.css('backgroundPositionY')}`, dimension, node.fontSize);
                    if (position.left <= 0 && position.top <= 0 && image.width > dimension.width && image.height > dimension.height) {
                        node.data(EXT_NAME.SPRITE, STRING_BASE.EXT_DATA, { image, position });
                        valid = true;
                    }
                }
            }
            return valid;
        }
    }

    const $css$b = squared.lib.css;
    class Substitute extends Extension {
        constructor(name, framework, tagNames, options) {
            super(name, framework, tagNames, options);
            this.require(EXT_NAME.EXTERNAL, true);
        }
        processNode(node, parent) {
            const data = $css$b.getDataSet(node.element, this.name);
            if (data.tag) {
                node.setControlType(data.tag);
                node.render(parent);
                if (data.tagChild) {
                    node.addAlign(4 /* AUTO_LAYOUT */);
                    node.each(item => {
                        if (item.styleElement) {
                            item.dataset.use = this.name;
                            item.dataset.squaredSubstituteTag = data.tagChild;
                        }
                    });
                }
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

    const $const$c = squared.lib.constant;
    const $css$c = squared.lib.css;
    const $dom$3 = squared.lib.dom;
    const $math$2 = squared.lib.math;
    const $util$d = squared.lib.util;
    const REGEXP_BACKGROUND$1 = /rgba\(0, 0, 0, 0\)|transparent/;
    class Table extends Extension {
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
            const table = [];
            function setAutoWidth(td) {
                td.data(EXT_NAME.TABLE, 'percent', `${Math.round((td.bounds.width / node.box.width) * 100)}%`);
                td.data(EXT_NAME.TABLE, 'expand', true);
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
            const setBoundsWidth = (td) => td.css($const$c.CSS.WIDTH, $css$c.formatPX(td.bounds.width), true);
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
            const [horizontal, vertical] = mainData.borderCollapse ? [0, 0] : $util$d.replaceMap(node.css('borderSpacing').split(' '), (value, index) => node.parseUnit(value, index === 0 ? $const$c.CSS.WIDTH : $const$c.CSS.HEIGHT));
            const spacingWidth = horizontal > 1 ? Math.round(horizontal / 2) : horizontal;
            const spacingHeight = vertical > 1 ? Math.round(vertical / 2) : vertical;
            const colgroup = node.element.querySelector('COLGROUP');
            const rowWidth = [];
            const mapBounds = [];
            const tableFilled = [];
            const mapWidth = [];
            const rowCount = table.length;
            let columnIndex = new Array(rowCount).fill(0);
            let columnCount = 0;
            for (let i = 0; i < rowCount; i++) {
                const tr = table[i];
                rowWidth[i] = horizontal;
                tableFilled[i] = [];
                tr.each((td, j) => {
                    const element = td.element;
                    for (let k = 0; k < element.rowSpan - 1; k++) {
                        const col = i + k + 1;
                        if (columnIndex[col] !== undefined) {
                            columnIndex[col] += element.colSpan;
                        }
                    }
                    if (!td.has($const$c.CSS.WIDTH)) {
                        const width = $dom$3.getNamedItem(element, $const$c.CSS.WIDTH);
                        if ($css$c.isPercent(width)) {
                            td.css($const$c.CSS.WIDTH, width);
                        }
                        else if ($util$d.isNumber(width)) {
                            td.css($const$c.CSS.WIDTH, $css$c.formatPX(parseFloat(width)));
                        }
                    }
                    if (!td.has($const$c.CSS.HEIGHT)) {
                        const height = $dom$3.getNamedItem(element, $const$c.CSS.HEIGHT);
                        if ($css$c.isPercent(height)) {
                            td.css($const$c.CSS.HEIGHT, height);
                        }
                        else if ($util$d.isNumber(height)) {
                            td.css($const$c.CSS.HEIGHT, $css$c.formatPX(parseFloat(height)));
                        }
                    }
                    if (!td.visibleStyle.backgroundImage && !td.visibleStyle.backgroundColor) {
                        if (colgroup) {
                            const style = $css$c.getStyle(colgroup.children[columnIndex[i]]);
                            if (style.backgroundImage && style.backgroundImage !== $const$c.CSS.NONE) {
                                td.css('backgroundImage', style.backgroundImage, true);
                            }
                            if (style.backgroundColor && !REGEXP_BACKGROUND$1.test(style.backgroundColor)) {
                                td.css('backgroundColor', style.backgroundColor, true);
                            }
                        }
                        else {
                            let value = $css$c.getInheritedStyle(element, 'backgroundImage', /none/, 'TABLE');
                            if (value !== '') {
                                td.css('backgroundImage', value, true);
                            }
                            value = $css$c.getInheritedStyle(element, 'backgroundColor', REGEXP_BACKGROUND$1, 'TABLE');
                            if (value !== '') {
                                td.css('backgroundColor', value, true);
                            }
                        }
                    }
                    switch (td.tagName) {
                        case 'TH': {
                            function setBorderStyle(attr) {
                                td.ascend(false, undefined, node).some(item => {
                                    if (item.has(`${attr}Style`)) {
                                        td.css(`${attr}Style`, item.css(`${attr}Style`));
                                        td.css(`${attr}Color`, item.css(`${attr}Color`));
                                        td.css(`${attr}Width`, item.css(`${attr}Width`), true);
                                        td.css('border', 'inherit');
                                        return true;
                                    }
                                    return false;
                                });
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
                                td.css('verticalAlign', $const$c.CSS.MIDDLE, true);
                            }
                            break;
                    }
                    const columnWidth = td.cssInitial($const$c.CSS.WIDTH);
                    const m = columnIndex[i];
                    const reevaluate = mapWidth[m] === undefined || mapWidth[m] === $const$c.CSS.AUTO;
                    if (i === 0 || reevaluate || !mainData.layoutFixed) {
                        if (columnWidth === '' || columnWidth === $const$c.CSS.AUTO) {
                            if (mapWidth[m] === undefined) {
                                mapWidth[m] = columnWidth || $const$c.CSS.PX_0;
                                mapBounds[m] = 0;
                            }
                            else if (i === table.length - 1) {
                                if (reevaluate && mapBounds[m] === 0) {
                                    mapBounds[m] = td.bounds.width;
                                }
                            }
                        }
                        else {
                            const length = $css$c.isLength(mapWidth[m]);
                            const percent = $css$c.isPercent(columnWidth);
                            if (reevaluate || td.bounds.width < mapBounds[m] || td.bounds.width === mapBounds[m] && (length && percent || percent && $css$c.isPercent(mapWidth[m]) && $util$d.convertFloat(columnWidth) > $util$d.convertFloat(mapWidth[m]) || length && $css$c.isLength(columnWidth) && $util$d.convertFloat(columnWidth) > $util$d.convertFloat(mapWidth[m]))) {
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
                        td.modifyBox(16 /* MARGIN_LEFT */, columnIndex[i] === 0 ? horizontal : spacingWidth);
                        td.modifyBox(4 /* MARGIN_RIGHT */, j === 0 ? spacingWidth : horizontal);
                    }
                    if (spacingHeight > 0) {
                        td.modifyBox(2 /* MARGIN_TOP */, i === 0 ? vertical : spacingHeight);
                        td.modifyBox(8 /* MARGIN_BOTTOM */, i + element.rowSpan < table.length ? spacingHeight : vertical);
                    }
                    columnIndex[i] += element.colSpan;
                });
                columnCount = Math.max(columnCount, columnIndex[i]);
            }
            if (node.has($const$c.CSS.WIDTH, 2 /* LENGTH */) && mapWidth.some(value => $css$c.isPercent(value))) {
                $util$d.replaceMap(mapWidth, (value, index) => {
                    if (value === $const$c.CSS.AUTO && mapBounds[index] > 0) {
                        return $css$c.formatPX(mapBounds[index]);
                    }
                    return value;
                });
            }
            if (mapWidth.every(value => $css$c.isPercent(value)) && mapWidth.reduce((a, b) => a + parseFloat(b), 0) > 1) {
                let percentTotal = 100;
                $util$d.replaceMap(mapWidth, value => {
                    const percent = parseFloat(value);
                    if (percentTotal <= 0) {
                        value = $const$c.CSS.PX_0;
                    }
                    else if (percentTotal - percent < 0) {
                        value = $css$c.formatPercent(percentTotal / 100);
                    }
                    percentTotal -= percent;
                    return value;
                });
            }
            else if (mapWidth.every(value => $css$c.isLength(value))) {
                const width = mapWidth.reduce((a, b) => a + parseFloat(b), 0);
                if (node.hasWidth) {
                    if (width < node.width) {
                        $util$d.replaceMap(mapWidth, value => value !== $const$c.CSS.PX_0 ? `${(parseFloat(value) / width) * 100}%` : value);
                    }
                    else if (width > node.width) {
                        node.css($const$c.CSS.WIDTH, $const$c.CSS.AUTO, true);
                        if (!mainData.layoutFixed) {
                            for (const item of node.cascade()) {
                                item.css($const$c.CSS.WIDTH, $const$c.CSS.AUTO, true);
                            }
                        }
                    }
                }
                if (mainData.layoutFixed && !node.has($const$c.CSS.WIDTH)) {
                    node.css($const$c.CSS.WIDTH, $css$c.formatPX(node.bounds.width), true);
                }
            }
            const mapPercent = mapWidth.reduce((a, b) => a + ($css$c.isPercent(b) ? parseFloat(b) : 0), 0);
            mainData.layoutType = (() => {
                if (mainData.layoutFixed && mapWidth.reduce((a, b) => a + ($css$c.isLength(b) ? parseFloat(b) : 0), 0) >= node.actualWidth) {
                    return 4 /* COMPRESS */;
                }
                else if (mapWidth.some(value => $css$c.isPercent(value)) || mapWidth.every(value => $css$c.isLength(value) && value !== $const$c.CSS.PX_0)) {
                    return 3 /* VARIABLE */;
                }
                else if (mapWidth.every(value => value === mapWidth[0])) {
                    if (node.cascadeSome(td => td.hasHeight)) {
                        mainData.expand = true;
                        return 3 /* VARIABLE */;
                    }
                    else if (mapWidth[0] === $const$c.CSS.AUTO) {
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
                if (mapWidth.every(value => value === $const$c.CSS.AUTO || $css$c.isLength(value) && value !== $const$c.CSS.PX_0)) {
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
                if (!caption.hasWidth) {
                    if (caption.textElement) {
                        if (!caption.has('maxWidth')) {
                            caption.css('maxWidth', $css$c.formatPX(caption.bounds.width));
                        }
                    }
                    else if (caption.bounds.width > $math$2.maxArray(rowWidth)) {
                        setBoundsWidth(caption);
                    }
                }
                if (!caption.cssInitial('textAlign')) {
                    caption.css('textAlign', $const$c.CSS.CENTER);
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
                        td.css('verticalAlign', $const$c.CSS.MIDDLE);
                    }
                    const columnWidth = mapWidth[columnIndex[i]];
                    if (columnWidth !== undefined) {
                        switch (mainData.layoutType) {
                            case 3 /* VARIABLE */:
                                if (columnWidth === $const$c.CSS.AUTO) {
                                    if (mapPercent >= 1) {
                                        setBoundsWidth(td);
                                        td.data(EXT_NAME.TABLE, 'exceed', !hasWidth);
                                        td.data(EXT_NAME.TABLE, 'downsized', true);
                                    }
                                    else {
                                        setAutoWidth(td);
                                    }
                                }
                                else if ($css$c.isPercent(columnWidth)) {
                                    td.data(EXT_NAME.TABLE, 'percent', columnWidth);
                                    td.data(EXT_NAME.TABLE, 'expand', true);
                                }
                                else if ($css$c.isLength(columnWidth) && parseInt(columnWidth) > 0) {
                                    if (td.bounds.width >= parseInt(columnWidth)) {
                                        setBoundsWidth(td);
                                        td.data(EXT_NAME.TABLE, 'expand', false);
                                        td.data(EXT_NAME.TABLE, 'downsized', false);
                                    }
                                    else {
                                        if (mainData.layoutFixed) {
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
                                    if (!td.has($const$c.CSS.WIDTH) || td.percentWidth) {
                                        setBoundsWidth(td);
                                    }
                                    td.data(EXT_NAME.TABLE, 'expand', false);
                                }
                                break;
                            case 2 /* FIXED */:
                                td.css($const$c.CSS.WIDTH, $const$c.CSS.PX_0);
                                break;
                            case 1 /* STRETCH */:
                                if (columnWidth === $const$c.CSS.AUTO) {
                                    td.css($const$c.CSS.WIDTH, $const$c.CSS.PX_0);
                                }
                                else {
                                    if (mainData.layoutFixed) {
                                        td.data(EXT_NAME.TABLE, 'downsized', true);
                                    }
                                    else {
                                        setBoundsWidth(td);
                                    }
                                    td.data(EXT_NAME.TABLE, 'expand', false);
                                }
                                break;
                            case 4 /* COMPRESS */:
                                if (!$css$c.isLength(columnWidth)) {
                                    td.hide();
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
                                        next.css('borderTopWidth', $const$c.CSS.PX_0, true);
                                    }
                                    else {
                                        td.css('borderBottomWidth', $const$c.CSS.PX_0, true);
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
                                        next.css('borderLeftWidth', $const$c.CSS.PX_0, true);
                                    }
                                    else {
                                        td.css('borderRightWidth', $const$c.CSS.PX_0, true);
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
                        borderTopWidth: $const$c.CSS.PX_0,
                        borderRightWidth: $const$c.CSS.PX_0,
                        borderBottomWidth: $const$c.CSS.PX_0,
                        borderLeftWidth: $const$c.CSS.PX_0
                    }, true);
                }
            }
            mainData.rowCount = rowCount;
            mainData.columnCount = columnCount;
            node.data(EXT_NAME.TABLE, STRING_BASE.EXT_DATA, mainData);
            return undefined;
        }
    }

    const $const$d = squared.lib.constant;
    const $css$d = squared.lib.css;
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
                                            if ($css$d.isLength(item.verticalAlign) || baseline === undefined) {
                                                valid = true;
                                            }
                                            break;
                                    }
                                    if (valid) {
                                        item.modifyBox(2 /* MARGIN_TOP */, item.linear.top - top);
                                    }
                                }
                                if (item.baselineAltered) {
                                    item.css('verticalAlign', $const$d.CSS.PX_0, true);
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

    const $const$e = squared.lib.constant;
    const $css$e = squared.lib.css;
    const $session$5 = squared.lib.session;
    const $util$f = squared.lib.util;
    const DOCTYPE_HTML = document.doctype !== null && document.doctype.name === 'html';
    function setMinHeight(node, offset) {
        const minHeight = node.has('minHeight', 2 /* LENGTH */) ? node.toFloat('minHeight') : 0;
        node.css('minHeight', $css$e.formatPX(Math.max(offset, minHeight)));
    }
    function isBlockElement(node) {
        return node ? (node.blockStatic || node.display === 'table') && !node.lineBreak : false;
    }
    function resetMargin(node, value) {
        const offset = node[CSS_SPACING.get(value)];
        let valid = false;
        if (node.getBox(value)[0] === 0) {
            node.modifyBox(value);
            valid = true;
        }
        else {
            for (const outerWrapper of node.ascendOuter()) {
                if (outerWrapper.getBox(value)[1] >= offset) {
                    outerWrapper.modifyBox(value, -offset);
                    valid = true;
                    break;
                }
            }
        }
        if (node.companion && valid) {
            node.companion.modifyBox(value, -offset, false);
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
            if (node[borderWidth] === 0) {
                if (node[padding] === 0) {
                    while (DOCTYPE_HTML && child[margin] === 0 && child[borderWidth] === 0 && child[padding] === 0 && !child.layoutElement && !child.tableElement) {
                        const endChild = (direction ? child.firstChild : child.lastChild);
                        if (isBlockElement(endChild)) {
                            child = endChild;
                        }
                        else {
                            break;
                        }
                    }
                    let resetChild = false;
                    if (!DOCTYPE_HTML && node[margin] === 0 && child[margin] > 0 && child.cssInitial(margin) === '') {
                        resetChild = true;
                    }
                    else {
                        const outside = node[margin] >= child[margin];
                        if (child.bounds.height === 0 && outside && child.textElement && child.textContent === '' && child.extensions.length === 0) {
                            child.hide();
                        }
                        else if (child.getBox(boxMargin)[0] !== 1) {
                            if (node.documentBody) {
                                if (outside) {
                                    resetChild = true;
                                }
                                else {
                                    resetMargin(node, boxMargin);
                                    if (direction) {
                                        node.bounds.top = 0;
                                        node.unsafe('box', true);
                                        node.unsafe('linear', true);
                                    }
                                }
                            }
                            else {
                                if (!outside && node.getBox(boxMargin)[0] !== 1) {
                                    node.modifyBox(boxMargin);
                                    node.modifyBox(boxMargin, child[margin]);
                                }
                                resetChild = true;
                            }
                        }
                    }
                    if (resetChild) {
                        resetMargin(child, boxMargin);
                        if (child.bounds.height === 0) {
                            resetMargin(child, direction ? 8 /* MARGIN_BOTTOM */ : 2 /* MARGIN_TOP */);
                        }
                    }
                }
                else if (child[margin] === 0 && child[borderWidth] === 0 && !child.layoutElement && !child.tableElement) {
                    let blockAll = true;
                    do {
                        const endChild = (direction ? child.firstChild : child.lastChild);
                        if (endChild && endChild[margin] === 0 && endChild[borderWidth] === 0) {
                            if (endChild[padding] > 0) {
                                if (endChild[padding] >= node[padding]) {
                                    node.modifyBox(direction ? 32 /* PADDING_TOP */ : 128 /* PADDING_BOTTOM */);
                                }
                                else if (blockAll) {
                                    node.modifyBox(direction ? 32 /* PADDING_TOP */ : 128 /* PADDING_BOTTOM */, -endChild[padding]);
                                }
                                break;
                            }
                            else {
                                if (!isBlockElement(endChild)) {
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
    class WhiteSpace extends Extension {
        afterBaseLayout() {
            const processed = new Set();
            const inheritTop = new Set();
            const inheritBottom = new Set();
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
                            if (!current.floating) {
                                if (firstChild === undefined) {
                                    firstChild = current;
                                }
                                lastChild = current;
                            }
                            else {
                                lastChild = undefined;
                            }
                        }
                        if (i === 0) {
                            continue;
                        }
                        if (isBlockElement(current)) {
                            const previousSiblings = current.previousSiblings({ floating: false });
                            if (previousSiblings.length) {
                                const previous = previousSiblings.find(item => !item.floating);
                                if (previous) {
                                    if (isBlockElement(previous)) {
                                        let marginBottom = previous.marginBottom;
                                        let marginTop = current.marginTop;
                                        if (previous.excluded && !current.excluded) {
                                            const offset = Math.min(marginBottom, previous.marginTop);
                                            if (offset < 0) {
                                                const top = Math.abs(offset) >= marginTop ? undefined : offset;
                                                current.modifyBox(2 /* MARGIN_TOP */, top);
                                                if (current.companion) {
                                                    current.companion.modifyBox(2 /* MARGIN_TOP */, top);
                                                }
                                                processed.add(previous.id);
                                            }
                                        }
                                        else if (!previous.excluded && current.excluded) {
                                            const offset = Math.min(marginTop, current.marginBottom);
                                            if (offset < 0) {
                                                previous.modifyBox(8 /* MARGIN_BOTTOM */, Math.abs(offset) >= marginBottom ? undefined : offset);
                                                processed.add(current.id);
                                            }
                                        }
                                        else {
                                            if (previous.paddingBottom === 0 && previous.borderBottomWidth === 0) {
                                                const bottomChild = previous.lastChild;
                                                if (isBlockElement(bottomChild) && bottomChild.getBox(8 /* MARGIN_BOTTOM */)[0] !== 1) {
                                                    const childBottom = bottomChild.marginBottom;
                                                    if (childBottom > marginBottom) {
                                                        marginBottom = childBottom;
                                                        previous.css('marginBottom', $css$e.formatPX(marginBottom), true);
                                                        inheritBottom.add(previous.id);
                                                    }
                                                    resetMargin(bottomChild, 8 /* MARGIN_BOTTOM */);
                                                }
                                            }
                                            if (current.borderTopWidth === 0 && current.paddingTop === 0) {
                                                const topChild = current.firstChild;
                                                if (isBlockElement(topChild) && topChild.getBox(2 /* MARGIN_TOP */)[0] !== 1) {
                                                    const childTop = topChild.marginTop;
                                                    if (childTop > marginTop) {
                                                        marginTop = childTop;
                                                        current.css('marginTop', $css$e.formatPX(marginTop), true);
                                                        inheritTop.add(current.id);
                                                    }
                                                    resetMargin(topChild, 2 /* MARGIN_TOP */);
                                                }
                                            }
                                            if (marginBottom > 0) {
                                                if (marginTop > 0) {
                                                    if (!inheritTop.has(current.id) || !inheritBottom.has(previous.id) || !$util$f.hasBit(current.overflow, 64 /* BLOCK */) && !$util$f.hasBit(previous.overflow, 64 /* BLOCK */)) {
                                                        if (marginTop <= marginBottom) {
                                                            if (inheritTop.has(current.id)) {
                                                                current.css('marginTop', $const$e.CSS.PX_0, true);
                                                            }
                                                            else {
                                                                resetMargin(current, 2 /* MARGIN_TOP */);
                                                            }
                                                        }
                                                        else {
                                                            if (inheritBottom.has(previous.id)) {
                                                                current.css('marginBottom', $const$e.CSS.PX_0, true);
                                                            }
                                                            else {
                                                                resetMargin(previous, 8 /* MARGIN_BOTTOM */);
                                                            }
                                                        }
                                                    }
                                                }
                                                else if (previous.bounds.height === 0) {
                                                    resetMargin(previous, 8 /* MARGIN_BOTTOM */);
                                                }
                                            }
                                        }
                                    }
                                    else if (previous.blockDimension && !previous.block && current.length === 0) {
                                        const offset = current.linear.top - previous.linear.bottom;
                                        if (Math.floor(offset) > 0 && current.ascend(false, item => item.has($const$e.CSS.HEIGHT)).length === 0) {
                                            current.modifyBox(2 /* MARGIN_TOP */, offset);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (!$util$f.hasBit(node.overflow, 64 /* BLOCK */) && !(node.documentParent.layoutElement && node.documentParent.css('flexDirection') === 'column')) {
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
                if (!processed.has(node.id) && node.lineBreak && !node.lineBreakTrailing) {
                    const previousSiblings = node.previousSiblings({ floating: false });
                    const nextSiblings = node.nextSiblings({ floating: false });
                    let valid = false;
                    if (previousSiblings.length && nextSiblings.length) {
                        let above = previousSiblings.pop();
                        const below = nextSiblings.pop();
                        if (above.inlineStatic && below.inlineStatic) {
                            if (previousSiblings.length === 0) {
                                processed.add(node.id);
                                continue;
                            }
                            else {
                                const abovePrevious = previousSiblings.pop();
                                if (abovePrevious.lineBreak) {
                                    abovePrevious.setBounds();
                                    if (abovePrevious.linear.bottom > above.linear.bottom) {
                                        above = abovePrevious;
                                    }
                                }
                            }
                        }
                        const aboveParent = above.renderParent;
                        const belowParent = below.renderParent;
                        function getMarginOffset() {
                            let offset;
                            if (below.lineHeight > 0 && below.cssTry('line-height', 'normal')) {
                                offset = $session$5.getClientRect(below.element, below.sessionId).top - below.marginTop;
                                below.cssFinally('line-height');
                            }
                            else {
                                offset = below.linear.top;
                            }
                            if (above.lineHeight > 0 && above.cssTry('line-height', 'normal')) {
                                offset -= $session$5.getClientRect(above.element, above.sessionId).bottom + above.marginBottom;
                                above.cssFinally('line-height');
                            }
                            else {
                                offset -= above.linear.bottom;
                            }
                            return offset;
                        }
                        valid = true;
                        if (aboveParent && belowParent) {
                            const aboveGroup = aboveParent.groupParent && aboveParent.lastChild === above;
                            const belowGroup = belowParent.groupParent && belowParent.firstChild === below;
                            if (belowGroup) {
                                belowParent.modifyBox(2 /* MARGIN_TOP */, belowParent.linear.top - (aboveGroup ? aboveParent : above).linear.bottom);
                            }
                            else if (aboveGroup) {
                                aboveParent.modifyBox(8 /* MARGIN_BOTTOM */, below.linear.top - aboveParent.linear.bottom);
                            }
                            else {
                                const offset = getMarginOffset();
                                if (offset !== 0) {
                                    if (belowParent.layoutVertical && below.visible) {
                                        below.modifyBox(2 /* MARGIN_TOP */, offset);
                                    }
                                    else if (aboveParent.layoutVertical && above.visible) {
                                        above.modifyBox(8 /* MARGIN_BOTTOM */, offset);
                                    }
                                }
                            }
                        }
                        else {
                            const actualParent = node.actualParent;
                            if (actualParent) {
                                const offset = getMarginOffset();
                                if (offset !== 0) {
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
                            }
                            else {
                                valid = false;
                            }
                        }
                    }
                    else {
                        const actualParent = node.actualParent;
                        if (actualParent && actualParent.visible) {
                            if (!actualParent.documentRoot && actualParent.ascendOuter(item => item.documentRoot).length === 0 && previousSiblings.length) {
                                const previousStart = previousSiblings[previousSiblings.length - 1];
                                const offset = actualParent.box.bottom - previousStart.linear[previousStart.lineBreak || previousStart.excluded ? $const$e.CSS.TOP : $const$e.CSS.BOTTOM];
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
                                const offset = nextStart.linear[nextStart.lineBreak || nextStart.excluded ? $const$e.CSS.BOTTOM : $const$e.CSS.TOP] - actualParent.box.top;
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
                            processed.add(item.id);
                        }
                        for (const item of nextSiblings) {
                            processed.add(item.id);
                        }
                    }
                }
            }
        }
        afterConstraints() {
            for (const node of this.application.processing.cache) {
                const renderParent = node.renderParent;
                if (renderParent && node.pageFlow) {
                    function setSpacingOffset(region, value) {
                        let offset = 0;
                        switch (region) {
                            case 16 /* MARGIN_LEFT */:
                                offset = node.actualRect($const$e.CSS.LEFT) - value;
                                break;
                            case 2 /* MARGIN_TOP */:
                                offset = node.actualRect($const$e.CSS.TOP) - value;
                                break;
                        }
                        if (offset > 0) {
                            (node.renderAs || node.outerWrapper || node).modifyBox(region, offset);
                        }
                    }
                    if (node.styleElement && node.inlineVertical && !node.positioned && !node.documentParent.layoutElement && !renderParent.tableElement) {
                        if (node.blockDimension && !node.floating) {
                            let horizontal;
                            if (renderParent.layoutVertical) {
                                if (!node.lineBreakLeading) {
                                    const index = renderParent.renderChildren.findIndex(item => item === node);
                                    if (index !== -1) {
                                        const previous = renderParent.renderChildren[index - 1];
                                        if (previous && previous.pageFlow) {
                                            setSpacingOffset(2 /* MARGIN_TOP */, previous.linear.bottom);
                                        }
                                    }
                                }
                            }
                            else if (renderParent.horizontalRows) {
                                found: {
                                    let maxBottom = Number.NEGATIVE_INFINITY;
                                    for (let i = 0; i < renderParent.horizontalRows.length; i++) {
                                        const row = renderParent.horizontalRows[i];
                                        for (let j = 0; j < row.length; j++) {
                                            if (node === row[j]) {
                                                if (i > 0) {
                                                    setSpacingOffset(2 /* MARGIN_TOP */, maxBottom);
                                                }
                                                else {
                                                    horizontal = row;
                                                }
                                                break found;
                                            }
                                        }
                                        for (const item of row) {
                                            if (item.blockDimension && !item.floating && item.linear.bottom > maxBottom) {
                                                maxBottom = item.linear.bottom;
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
                                const actualParent = node.actualParent;
                                if (actualParent) {
                                    let maxBottom = Number.NEGATIVE_INFINITY;
                                    for (const item of actualParent.actualChildren) {
                                        if (horizontal.includes(item)) {
                                            break;
                                        }
                                        else if (item.lineBreak) {
                                            maxBottom = Number.NEGATIVE_INFINITY;
                                        }
                                        else if (item.blockDimension && !item.floating && item.linear.bottom > maxBottom) {
                                            maxBottom = item.linear.bottom;
                                        }
                                    }
                                    if (maxBottom !== Number.NEGATIVE_INFINITY && node.linear.top > maxBottom) {
                                        setSpacingOffset(2 /* MARGIN_TOP */, maxBottom);
                                    }
                                }
                            }
                        }
                        if (!node.alignParent($const$e.CSS.LEFT)) {
                            let current = node;
                            while (true) {
                                const siblingsLeading = current.siblingsLeading;
                                if (siblingsLeading.length && !siblingsLeading.some(item => item.lineBreak || item.excluded && item.blockStatic)) {
                                    const previousSibling = siblingsLeading[0];
                                    if (previousSibling.inlineVertical) {
                                        setSpacingOffset(16 /* MARGIN_LEFT */, previousSibling.actualRect($const$e.CSS.RIGHT));
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
