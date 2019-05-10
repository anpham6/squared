import { AppProcessing, AppSession, FileAsset, LayoutResult, NodeTemplate, UserSettings } from './@types/application';

import Controller from './controller';
import Extension from './extension';
import ExtensionManager from './extensionmanager';
import Layout from './layout';
import Node from './node';
import NodeList from './nodelist';
import Resource from './resource';

import { APP_SECTION, BOX_STANDARD, CSS_STANDARD, NODE_ALIGNMENT, NODE_PROCEDURE, NODE_RESOURCE, NODE_TRAVERSE } from './lib/enumeration';

const $css = squared.lib.css;
const $dom = squared.lib.dom;
const $regex = squared.lib.regex;
const $session = squared.lib.session;
const $util = squared.lib.util;
const $xml = squared.lib.xml;

const STRING_DATAURI = '(?:data:([^;]+);([^,]+),)?(.*?)';

const REGEXP_CACHED: ObjectMap<RegExp> = {};

let NodeConstructor!: Constructor<Node>;

function prioritizeExtensions<T extends Node>(element: HTMLElement, extensions: Extension<T>[]) {
    if (element.dataset.use) {
        const included = element.dataset.use.split($regex.XML.SEPARATOR);
        const result: Extension<T>[] = [];
        const untagged: Extension<T>[] = [];
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
            return $util.concatArray($util.spliceArray(result, item => item === undefined), untagged);
        }
    }
    return extensions;
}

function parseConditionText(rule: string, value: string) {
    const match = new RegExp(`^@${rule}([^{]+)`).exec(value);
    if (match) {
        value = match[1].trim();
    }
    return value;
}

async function getImageSvgAsync(value: string)  {
    const response = await fetch(value, {
        method: 'GET',
        headers: new Headers({
            'Accept': 'application/xhtml+xml, image/svg+xml',
            'Content-Type': 'image/svg+xml'
        })
    });
    return await response.text();
}

export default class Application<T extends Node> implements squared.base.Application<T> {
    public controllerHandler: Controller<T>;
    public resourceHandler: Resource<T>;
    public extensionManager: ExtensionManager<T>;
    public initialized = false;
    public closed = false;
    public readonly builtInExtensions: ObjectMap<Extension<T>> = {};
    public readonly extensions: Extension<T>[] = [];
    public readonly rootElements = new Set<HTMLElement>();
    public readonly session: AppSession<T, NodeList<T>> = {
        cache: new NodeList<T>(),
        documentRoot: [],
        targetQueue: new Map<T, NodeTemplate<T>>(),
        excluded: new NodeList<T>(),
        active: [],
        extensionMap: new Map<number, Extension<T>[]>()
    };
    public readonly processing: AppProcessing<T, NodeList<T>> = {
        cache: new NodeList<T>(),
        node: undefined,
        excluded: new NodeList<T>(),
        sessionId: ''
    };

    private _userSettings?: UserSettings;
    private readonly _layouts: FileAsset[] = [];

    constructor(
        public framework: number,
        nodeConstructor: Constructor<T>,
        ControllerConstructor: Constructor<T>,
        ResourceConstructor: Constructor<T>,
        ExtensionManagerConstructor: Constructor<T>)
    {
        NodeConstructor = nodeConstructor;
        this.controllerHandler = <Controller<T>> (new ControllerConstructor(this, this.processing.cache) as unknown);
        this.resourceHandler = <Resource<T>> (new ResourceConstructor(this, this.processing.cache) as unknown);
        this.extensionManager = <ExtensionManager<T>> (new ExtensionManagerConstructor(this, this.processing.cache) as unknown);
    }

    public registerController(handler: Controller<T>) {
        handler.application = this;
        handler.cache = this.processing.cache;
        this.controllerHandler = handler;
    }

    public registerResource(handler: Resource<T>) {
        handler.application = this;
        handler.cache = this.processing.cache;
        this.resourceHandler = handler;
    }

    public finalize() {
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
                this.saveDocument(
                    layout.layoutName,
                    controller.localSettings.layout.baseTemplate + controller.cascadeDocument(<NodeTemplate<T>[]> parent.renderTemplates, 0),
                    node.dataset.pathname,
                    !!node.renderExtension && node.renderExtension.some(item => item.documentBase) ? 0 : undefined
                );
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

    public saveAllToDisk() {
        if (this.resourceHandler.fileHandler) {
            this.resourceHandler.fileHandler.saveAllToDisk(this.layouts);
        }
    }

    public reset() {
        for (const id of this.session.active) {
            this.session.cache.each(node => {
                if (node.naturalElement && !node.pseudoElement) {
                    const element = <Element> node.element;
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

    public parseDocument(...elements: any[]): FunctionMap<void> {
        let __THEN: Undefined<() => void>;
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
            if ($css.hasComputedStyle(element)) {
                this.rootElements.add(element);
            }
        }
        const ASSET_IMAGES = this.resourceHandler.assets.images;
        const documentRoot = this.rootElements.values().next().value;
        const preloadImages: HTMLImageElement[] = [];
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
                const iteration = (element.dataset.iteration ? $util.convertInt(element.dataset.iteration) : -1) + 1;
                element.dataset.iteration = iteration.toString();
                if (this.createCache(element)) {
                    const filename = element.dataset.filename && element.dataset.filename.replace(new RegExp(`\.${this.controllerHandler.localSettings.layout.fileExtension}$`), '') || element.id || `document_${this.length}`;
                    element.dataset.layoutName = $util.convertWord(iteration > 1 ? `${filename}_${iteration}` : filename, true);
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
        const images: (HTMLImageElement | string)[] = [];
        if (this.userSettings.preloadImages) {
            for (const element of this.rootElements) {
                element.querySelectorAll('input[type=image]').forEach((image: HTMLInputElement) => {
                    const uri = image.src;
                    if (uri !== '') {
                        ASSET_IMAGES.set(uri, {
                            width: image.width,
                            height: image.height,
                            uri
                        });
                    }
                });
                element.querySelectorAll('svg image').forEach((image: SVGImageElement) => {
                    const uri = $util.resolvePath(image.href.baseVal);
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
        for (const element of this.rootElements) {
            element.querySelectorAll('img').forEach((image: HTMLImageElement) => {
                if (image.tagName === 'IMG') {
                    if (image.src.toLowerCase().endsWith('.svg')) {
                        if (this.userSettings.preloadImages) {
                            images.push(image.src);
                        }
                    }
                    else if (image.complete) {
                        if (image.src.startsWith('data:image/')) {
                            if (REGEXP_CACHED.DATAURI === undefined) {
                                REGEXP_CACHED.DATAURI = new RegExp(`^${STRING_DATAURI}$`);
                            }
                            const match = REGEXP_CACHED.DATAURI.exec(image.src);
                            if (match && match[1] && match[2]) {
                                this.resourceHandler.addRawData(image.src, match[1], match[2], match[3]);
                            }
                        }
                        else {
                            this.resourceHandler.addImage(image);
                        }
                    }
                    else if (this.userSettings.preloadImages) {
                        images.push(image);
                    }
                }
            });
        }
        if (images.length) {
            this.initialized = true;
            Promise.all($util.objectMap<HTMLImageElement | string, {}>(images, image => {
                return new Promise((resolve, reject) => {
                    if (typeof image === 'string') {
                        resolve(getImageSvgAsync(image));
                    }
                    else {
                        image.onload = () => {
                            resolve(image);
                        };
                        image.onerror = () => {
                            reject(image);
                        };
                    }
                });
            }))
            .then((result: (HTMLImageElement | string)[]) => {
                for (let i = 0; i < result.length; i++) {
                    const value = result[i];
                    if (typeof value === 'string') {
                        if (typeof images[i] === 'string') {
                            this.resourceHandler.addRawData(images[i] as string, 'image/svg+xml', 'utf8', value);
                        }
                    }
                    else {
                        this.resourceHandler.addImage(value);
                    }
                }
                parseResume();
            })
            .catch((error: Event) => {
                const message = error.target ? (<HTMLImageElement> error.target).src : error['message'];
                if (!message || confirm(`FAIL: ${message}`)) {
                    parseResume();
                }
            });
        }
        else {
            parseResume();
        }
        return {
            then: (resolve: () => void) => {
                if (this.initialized) {
                    __THEN = resolve;
                }
                else {
                    resolve();
                }
            }
        };
    }

    public saveDocument(filename: string, content: string, pathname?: string, index?: number) {
        if ($util.isString(content)) {
            if (pathname) {
                pathname = $util.trimString(pathname, '/');
            }
            else {
                pathname = this.controllerHandler.localSettings.layout.pathName;
            }
            const layout: FileAsset = {
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

    public renderNode(layout: Layout<T>) {
        return layout.itemCount === 0 ? this.controllerHandler.renderNode(layout) : this.controllerHandler.renderNodeGroup(layout);
    }

    public addLayout(layout: Layout<T>) {
        if ($util.hasBit(layout.renderType, NODE_ALIGNMENT.FLOAT)) {
            if ($util.hasBit(layout.renderType, NODE_ALIGNMENT.HORIZONTAL)) {
                layout = this.processFloatHorizontal(layout);
            }
            else if ($util.hasBit(layout.renderType, NODE_ALIGNMENT.VERTICAL)) {
                layout = this.processFloatVertical(layout);
            }
        }
        if (layout.containerType !== 0) {
            return this.addLayoutTemplate(layout.parent, layout.node, this.renderNode(layout), layout.renderIndex);
        }
        return false;
    }

    public addLayoutTemplate(parent: T, node: T, template: NodeTemplate<T> | undefined, index = -1) {
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

    public createNode(element: Element, append = true, parent?: T, children?: T[]) {
        const node = new NodeConstructor(this.nextId, this.processing.sessionId, element, this.controllerHandler.afterInsertNode) as T;
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

    public resolveTarget(target: string) {
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

    public toString() {
        return this._layouts.length ? this._layouts[0].content : '';
    }

    protected createCache(documentRoot: HTMLElement) {
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
        const preAlignment: ObjectIndex<StringMap> = {};
        const direction = new Set<HTMLElement>();
        function saveAlignment(element: HTMLElement, id: number, attr: string, value: string, restoreValue: string) {
            if (preAlignment[id] === undefined) {
                preAlignment[id] = {};
            }
            preAlignment[id][attr] = restoreValue;
            element.style[attr] = value;
        }
        let resetBounds = false;
        for (const node of this.processing.cache) {
            if (node.styleElement) {
                const element = <HTMLElement> node.element;
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
                    for (const attr of $css.BOX_POSITION) {
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
        const pseudoElement = new Set<T>();
        rootNode.parent.setBounds();
        for (const node of this.processing.cache) {
            if (!node.pseudoElement) {
                node.setBounds(!resetBounds && preAlignment[node.id] === undefined && direction.size === 0);
            }
            else {
                pseudoElement.add(node.parent as T);
            }
        }
        for (const node of pseudoElement) {
            [node.innerBefore, node.innerAfter].forEach((item, index) => {
                if (item) {
                    const element = <HTMLElement> node.element;
                    const id = element.id;
                    let styleElement: HTMLElement | undefined;
                    if (item.pageFlow) {
                        element.id = 'id_' + Math.round(Math.random() * new Date().getTime());
                        styleElement = $css.insertStyleSheetRule(`#${element.id}::${index === 0 ? 'before' : 'after'} { display: none !important; }`);
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
        const alteredParent = new Set<T>();
        for (const node of this.processing.cache) {
            if (node.styleElement) {
                const element = <HTMLElement> node.element;
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
            node.saveAsInitial();
            if (!node.documentRoot) {
                const actualParent = node.parent as T;
                const absoluteParent = node.absoluteParent as T;
                let parent: T | undefined;
                switch (node.position) {
                    case 'relative':
                        if (node === actualParent.lastChild) {
                            let valid = false;
                            if (node.outsideX(actualParent.box)) {
                                if (!actualParent.has('width') || actualParent.css('overflowX') === 'hidden') {
                                    continue;
                                }
                                valid = true;
                            }
                            if (node.outsideY(actualParent.box)) {
                                if (!actualParent.hasHeight && !actualParent.has('height') || actualParent.css('overflowY') === 'hidden') {
                                    continue;
                                }
                                valid = true;
                            }
                            if (valid) {
                                parent = actualParent.actualParent as T;
                                do {
                                    if (node.withinX(parent.box) && node.withinY(parent.box) || parent.css('overflow') === 'hidden') {
                                        break;
                                    }
                                    parent = actualParent.actualParent as T;
                                }
                                while (parent && parent !== rootNode);
                                if (parent) {
                                    node.css('position', 'absolute', true);
                                    node.setBounds(false);
                                }
                            }
                        }
                        break;
                    case 'fixed':
                        if (!node.positionAuto) {
                            parent = rootNode;
                            break;
                        }
                    case 'absolute':
                        if (absoluteParent) {
                            parent = absoluteParent;
                            if (node.positionAuto) {
                                if (!node.previousSiblings().some(item => item.multiline || item.excluded && !item.blockStatic)) {
                                    node.cssApply({ display: 'inline-block', verticalAlign: 'top' }, true);
                                }
                                else {
                                    node.positionAuto = false;
                                }
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
                                            if (outsideY && (node.top < 0 || node.marginTop < 0 || !node.has('top') && node.bottom !== 0)) {
                                                outside = true;
                                            }
                                            else if (outsideX && !node.has('left') && node.right > 0) {
                                                outside = true;
                                            }
                                            else if (!parent.pageFlow && outsideX && outsideY && (node.top > 0 || node.left > 0)) {
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
                                    else if (parent.layoutElement) {
                                        parent = absoluteParent as T;
                                        break;
                                    }
                                    else if (node.withinX(parent.box) && node.withinY(parent.box)) {
                                        break;
                                    }
                                    parent = parent.actualParent as T;
                                }
                            }
                        }
                        break;
                }
                if (parent === undefined) {
                    parent = !node.pageFlow ? rootNode : actualParent;
                }
                if (parent !== actualParent) {
                    if (absoluteParent && absoluteParent.positionRelative && parent !== absoluteParent) {
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
                    let opacity = $util.convertFloat(node.css('opacity')) || 1;
                    let current = actualParent;
                    while (current && current !== parent) {
                        opacity *= $util.convertFloat(current.css('opacity')) || 1;
                        current = current.actualParent as T;
                    }
                    node.css('opacity', opacity.toString());
                    node.parent = parent;
                    node.siblingIndex = Number.POSITIVE_INFINITY;
                    alteredParent.add(parent as T);
                }
                node.documentParent = parent;
            }
        }
        for (const node of this.processing.cache) {
            if (alteredParent.has(node)) {
                const layers: Array<T[]> = [];
                let maxIndex = -1;
                node.each((item: T) => {
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
                    const children = node.children as T[];
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
                                    children[m] = undefined as any;
                                }
                            }
                            children.splice(k, 0, ...order);
                            k += order.length;
                        }
                    }
                    node.retain($util.flatArray(children));
                }
            }
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

    protected cascadeParentNode(element: HTMLElement, depth = 0) {
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
            const children: T[] = [];
            let includeText = false;
            for (let i = 0; i < element.childNodes.length; i++) {
                const childElement = <HTMLInputElement> element.childNodes[i];
                if (childElement === beforeElement) {
                    const child = this.insertNode(<HTMLElement> beforeElement);
                    if (child) {
                        node.innerBefore = child;
                        child.setInlineText(true);
                        children.push(child);
                        includeText = true;
                    }
                }
                else if (childElement === afterElement) {
                    const child = this.insertNode(<HTMLElement> afterElement);
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

    protected setBaseLayout(layoutName: string) {
        const documentRoot = this.processing.node as T;
        const extensions = $util.filterArray(this.extensions, item => !item.eventOnly);
        const mapY = new Map<number, Map<number, T>>();
        function setMapY(depth: number, id: number, node: T) {
            const index = mapY.get(depth) || new Map<number, T>();
            mapY.set(depth, index.set(id, node));
        }
        function deleteMapY(id: number) {
            for (const mapNode of mapY.values()) {
                for (const node of mapNode.values()) {
                    if (node.id === id) {
                        mapNode.delete(node.id);
                        return;
                    }
                }
            }
        }
        setMapY(-1, 0, documentRoot.parent as T);
        let maxDepth = 0;
        for (const node of this.processing.cache) {
            if (node.visible) {
                setMapY(node.depth, node.id, node);
                maxDepth = Math.max(node.depth, maxDepth);
            }
        }
        for (let i = 0; i < maxDepth; i++) {
            mapY.set((i * -1) - 2, new Map<number, T>());
        }
        this.processing.cache.afterAppend = (node: T) => {
            deleteMapY(node.id);
            setMapY((node.depth * -1) - 2, node.id, node);
            for (const item of node.cascade()) {
                deleteMapY(item.id);
                setMapY((item.depth * -1) - 2, item.id, item as T);
            }
        };
        for (const depth of mapY.values()) {
            for (const parent of depth.values()) {
                if (parent.length === 0) {
                    continue;
                }
                const axisY = parent.duplicate() as T[];
                let hasFloat = false;
                let cleared!: Map<T, string>;
                if (axisY.length > 1) {
                    hasFloat = parent.some(node => node.floating);
                    if (hasFloat) {
                        cleared = <Map<T, string>> NodeList.linearData(parent.actualChildren, true).cleared;
                    }
                }
                let k = -1;
                while (++k < axisY.length) {
                    let nodeY = axisY[k];
                    if (!nodeY.visible || nodeY.rendered || nodeY.htmlElement && !nodeY.documentRoot && this.rootElements.has(<HTMLElement> nodeY.element)) {
                        continue;
                    }
                    let parentY = nodeY.parent as T;
                    if (axisY.length > 1 && k < axisY.length - 1 && nodeY.pageFlow && (parentY.alignmentType === 0 || parentY.hasAlign(NODE_ALIGNMENT.UNKNOWN) || nodeY.hasAlign(NODE_ALIGNMENT.EXTENDABLE)) && !parentY.hasAlign(NODE_ALIGNMENT.AUTO_LAYOUT) && nodeY.hasSection(APP_SECTION.DOM_TRAVERSE)) {
                        const horizontal: T[] = [];
                        const vertical: T[] = [];
                        let extended = false;
                        function checkHorizontal(node: T) {
                            if (vertical.length || extended) {
                                return false;
                            }
                            horizontal.push(node);
                            return true;
                        }
                        function checkVertical(node: T) {
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
                        if (nodeY.hasAlign(NODE_ALIGNMENT.EXTENDABLE) && parentY.layoutVertical) {
                            horizontal.push(nodeY);
                            l++;
                            m++;
                        }
                        traverse: {
                            const floated = new Set<string>();
                            const floatActive = new Set<string>();
                            for ( ; l < axisY.length; l++, m++) {
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
                                    const previousSiblings = item.previousSiblings() as T[];
                                    const previous = previousSiblings[previousSiblings.length - 1];
                                    if (previous) {
                                        if (hasFloat) {
                                            const traverse = item.alignedVertically(previousSiblings, horizontal.length ? horizontal : vertical, cleared, horizontal.length > 0);
                                            if (traverse > 0) {
                                                if (horizontal.length && traverse !== NODE_TRAVERSE.FLOAT_INTERSECT) {
                                                    if (floatActive.size && !previous.autoMargin.horizontal && cleared.get(item) !== 'both' && !previousSiblings.some(node => node.lineBreak && !cleared.has(node))) {
                                                        function getFloatBottom() {
                                                            let floatBottom = 0;
                                                            $util.captureMap(
                                                                horizontal,
                                                                node => node.floating,
                                                                node => floatBottom = Math.max(floatBottom, node.linear.bottom)
                                                            );
                                                            return floatBottom;
                                                        }
                                                        if (!item.floating || item.linear.top < getFloatBottom()) {
                                                            if (cleared.has(item)) {
                                                                if (!item.floating && floatActive.size > 0) {
                                                                    item.alignmentType |= NODE_ALIGNMENT.EXTENDABLE;
                                                                    horizontal.push(item);
                                                                    extended = true;
                                                                    continue;
                                                                }
                                                                break traverse;
                                                            }
                                                            else {
                                                                const floatBottom = getFloatBottom();
                                                                if (floated.size === 1 && (!item.floating && item.linear.top < floatBottom || floatActive.has(item.float))) {
                                                                    horizontal.push(item);
                                                                    if (!item.floating && $util.aboveRange(item.linear.bottom, floatBottom)) {
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
                                else if (item.positionAuto) {
                                    if (vertical.length) {
                                        break;
                                    }
                                    else {
                                        horizontal.push(item);
                                    }
                                }
                            }
                        }
                        let result: LayoutResult<T> | undefined;
                        let segEnd: T | undefined;
                        if (horizontal.length > 1) {
                            result = this.controllerHandler.processTraverseHorizontal(new Layout(parentY, nodeY, 0, 0, horizontal), axisY);
                            segEnd = horizontal[horizontal.length - 1];
                        }
                        else if (vertical.length > 1) {
                            result = this.controllerHandler.processTraverseVertical(new Layout(parentY, nodeY, 0, 0, vertical), axisY);
                            segEnd = vertical[vertical.length - 1];
                            if (segEnd.horizontalAligned && segEnd !== axisY[axisY.length - 1]) {
                                segEnd.alignmentType |= NODE_ALIGNMENT.EXTENDABLE;
                            }
                        }
                        if (parentY.hasAlign(NODE_ALIGNMENT.UNKNOWN) && segEnd === axisY[axisY.length - 1]) {
                            parentY.alignmentType ^= NODE_ALIGNMENT.UNKNOWN;
                        }
                        if (result && this.addLayout(result.layout)) {
                            parentY = nodeY.parent as T;
                        }
                    }
                    if (nodeY.hasAlign(NODE_ALIGNMENT.EXTENDABLE)) {
                        nodeY.alignmentType ^= NODE_ALIGNMENT.EXTENDABLE;
                    }
                    if (k === axisY.length - 1 && parentY.hasAlign(NODE_ALIGNMENT.UNKNOWN)) {
                        parentY.alignmentType ^= NODE_ALIGNMENT.UNKNOWN;
                    }
                    if (nodeY.renderAs && parentY.appendTry(nodeY, nodeY.renderAs, false)) {
                        nodeY.hide();
                        nodeY = nodeY.renderAs as T;
                        if (nodeY.positioned) {
                            parentY = nodeY.parent as T;
                        }
                    }
                    if (!nodeY.rendered && nodeY.hasSection(APP_SECTION.EXTENSION)) {
                        const descendant = this.session.extensionMap.get(nodeY.id);
                        let combined = parent.renderExtension && <Extension<T>[]> parent.renderExtension.slice(0);
                        if (descendant) {
                            if (combined) {
                                $util.concatArray(combined, <Extension<T>[]> descendant);
                            }
                            else {
                                combined = <Extension<T>[]> descendant.slice(0);
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
                            prioritizeExtensions(<HTMLElement> nodeY.element, extensions).some(item => {
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
                                            parentY = result.parent as T;
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
                        const result = nodeY.length ? this.controllerHandler.processUnknownParent(layout) : this.controllerHandler.processUnknownChild(layout);
                        if (result.next === true) {
                            continue;
                        }
                        else if (result.renderAs) {
                            axisY[k] = result.renderAs as T;
                            k--;
                            continue;
                        }
                        this.addLayout(result.layout);
                    }
                }
            }
        }
        this.processing.cache.sort((a, b) => {
            if (a.depth === b.depth) {
                if (a.length && b.length === 0) {
                    return -1;
                }
                else if (a.length === 0 && b.length) {
                    return 1;
                }
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

    protected setConstraints() {
        this.controllerHandler.setConstraints();
        for (const ext of this.extensions) {
            for (const node of ext.subscribers) {
                ext.postConstraints(node);
            }
            ext.afterConstraints();
        }
    }

    protected setResources() {
        for (const node of this.processing.cache) {
            this.resourceHandler.setBoxStyle(node);
            this.resourceHandler.setFontStyle(node);
            this.resourceHandler.setValueString(node);
        }
        for (const ext of this.extensions) {
            ext.afterResources();
        }
    }

    protected processFloatHorizontal(layout: Layout<T>) {
        const controller = this.controllerHandler;
        const itemCount = layout.itemCount;
        if (layout.cleared.size === 0 && !layout.some(node => node.autoMargin.horizontal || node.multiline)) {
            const inline: T[] = [];
            const left: T[] = [];
            const right: T[] = [];
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
            if (left.length === itemCount || right.length === itemCount || inline.length === itemCount || (left.length === 0 || right.length === 0) && !inline.some(item => item.blockStatic)) {
                controller.processLayoutHorizontal(layout);
                return layout;
            }
        }
        const layerIndex: Array<T[] | T[][]> = [];
        const inlineAbove: T[] = [];
        const inlineBelow: T[] = [];
        const leftAbove: T[] = [];
        const rightAbove: T[] = [];
        const leftBelow: T[] = [];
        const rightBelow: T[] = [];
        let leftSub: T[] | T[][] = [];
        let rightSub: T[] | T[][] = [];
        let current = '';
        let pendingFloat = 0;
        for (const node of layout) {
            const cleared = layout.cleared.get(node);
            if (cleared) {
                switch (cleared) {
                    case 'left':
                        if ($util.hasBit(pendingFloat, 2)) {
                            pendingFloat ^= 2;
                        }
                        current = 'left';
                        break;
                    case 'right':
                        if ($util.hasBit(pendingFloat, 4)) {
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
                    if (!$util.hasBit(pendingFloat, 4)) {
                        pendingFloat |= 4;
                    }
                }
                else if (node.float === 'left') {
                    leftAbove.push(node);
                    if (!$util.hasBit(pendingFloat, 2)) {
                        pendingFloat |= 2;
                    }
                }
                else if (leftBelow.length || rightBelow.length) {
                    inlineBelow.push(node);
                }
                else if (leftAbove.length || rightAbove.length) {
                    let top = node.linear.top;
                    if (node.textElement && !node.plainText) {
                        const rect = $session.getRangeClientRect(<Element> node.element, node.sessionId);
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
                if (rightBelow.length === 0 && !$util.hasBit(pendingFloat, 4)) {
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
                if (leftBelow.length === 0 && !$util.hasBit(pendingFloat, 2)) {
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
        const alignmentType = rightAbove.length + rightBelow.length === layout.length ? NODE_ALIGNMENT.RIGHT : 0;
        if (inlineBelow.length) {
            if (inlineBelow.length > 1) {
                inlineBelow[0].alignmentType |= NODE_ALIGNMENT.EXTENDABLE;
            }
            inlineBelow.unshift(layout.node);
            const parent = this.createNode($dom.createElement(layout.node.actualParent && layout.node.actualParent.element), true, layout.parent, inlineBelow);
            this.addLayout(new Layout(
                layout.parent,
                parent,
                vertical.containerType,
                vertical.alignmentType | (layout.parent.blockStatic ? NODE_ALIGNMENT.BLOCK : 0),
                inlineBelow
            ));
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
        $util.spliceArray(layerIndex, item => item.length === 0);
        layout.itemCount = layerIndex.length;
        layout.setType(outerVertical.containerType, outerVertical.alignmentType);
        if (layout.hasAlign(NODE_ALIGNMENT.RIGHT)) {
            layout.add(NODE_ALIGNMENT.BLOCK);
        }
        let floatgroup: T | undefined;
        for (let i = 0; i < layerIndex.length; i++) {
            const item = layerIndex[i];
            let segments: T[][];
            if (Array.isArray(item[0])) {
                segments = item as T[][];
                const grouping: T[] = [];
                for (const seg of segments) {
                    $util.concatArray(grouping, seg);
                }
                grouping.sort(NodeList.siblingIndex);
                if (layout.node.layoutVertical) {
                    floatgroup = layout.node;
                }
                else {
                    floatgroup = controller.createNodeGroup(grouping[0], grouping, layout.node);
                    const group = new Layout(
                        layout.node,
                        floatgroup,
                        vertical.containerType,
                        vertical.alignmentType | (segments.some(seg => seg === rightSub || seg === rightAbove) ? NODE_ALIGNMENT.RIGHT : 0),
                    );
                    group.itemCount = segments.length;
                    this.addLayout(group);
                }
            }
            else {
                segments = [item as T[]];
                floatgroup = undefined;
            }
            for (const seg of segments) {
                const basegroup = floatgroup && (seg === inlineAbove || seg === leftAbove || seg === leftBelow || seg === rightAbove || seg === rightBelow) ? floatgroup : layout.node;
                const target = controller.createNodeGroup(seg[0], seg, basegroup);
                const group = new Layout(
                    basegroup,
                    target,
                    0,
                    seg.length < itemCount ? NODE_ALIGNMENT.SEGMENTED : 0,
                    seg
                );
                if (seg.some(child => child.blockStatic || child.multiline && basegroup.blockStatic || child.has('width', CSS_STANDARD.PERCENT))) {
                    group.add(NODE_ALIGNMENT.BLOCK);
                }
                if (seg.length === 1) {
                    target.innerWrapped = seg[0];
                    seg[0].outerWrapper = target;
                    if (seg[0].has('width', CSS_STANDARD.PERCENT)) {
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
                            target.modifyBox(BOX_STANDARD.PADDING_LEFT, offset + (!hasSpacing && target.cascadeSome(child => child.multiline) ? this.controllerHandler.localSettings.deviations.textMarginBoundarySize : 0));
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
                            target.modifyBox(BOX_STANDARD.PADDING_RIGHT, offset + (!hasSpacing && target.cascadeSome(child => child.multiline) ? this.controllerHandler.localSettings.deviations.textMarginBoundarySize : 0));
                        }
                    }
                }
            }
        }
        return layout;
    }

    protected processFloatVertical(layout: Layout<T>) {
        const controller = this.controllerHandler;
        const vertical = controller.containerTypeVertical;
        if (layout.containerType !== 0) {
            const parent = controller.createNodeGroup(layout.node, [layout.node], layout.parent);
            this.addLayout(new Layout(
                parent,
                layout.node,
                vertical.containerType,
                vertical.alignmentType,
                parent.children as T[]
            ));
            layout.node = parent;
        }
        else {
            layout.containerType = vertical.containerType;
            layout.add(vertical.alignmentType);
        }
        const staticRows: T[][] = [];
        const floatedRows: Null<T[]>[] = [];
        const current: T[] = [];
        const floated: T[] = [];
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
                        node.modifyBox(BOX_STANDARD.MARGIN_TOP, null);
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
                    layoutType.alignmentType |= NODE_ALIGNMENT.SEGMENTED | NODE_ALIGNMENT.BLOCK;
                    this.addLayout(new Layout(
                        layout.node,
                        controller.createNodeGroup(pageFlow[0], pageFlow, layout.node),
                        layoutType.containerType,
                        layoutType.alignmentType,
                        pageFlow
                    ));
                }
                else {
                    const floating = floatedRows[i] || [];
                    if (pageFlow.length || floating.length) {
                        const basegroup = controller.createNodeGroup(floating[0] || pageFlow[0], [], layout.node);
                        const verticalMargin = controller.containerTypeVerticalMargin;
                        const layoutGroup = new Layout(
                            layout.node,
                            basegroup,
                            verticalMargin.containerType,
                            verticalMargin.alignmentType
                        );
                        const children: T[] = [];
                        let subgroup: T | undefined;
                        if (floating.length > 1) {
                            subgroup = controller.createNodeGroup(floating[0], floating, basegroup);
                            layoutGroup.add(NODE_ALIGNMENT.FLOAT);
                            if (pageFlow.length === 0 && floating.every(item => item.float === 'right')) {
                                layoutGroup.add(NODE_ALIGNMENT.RIGHT);
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
                            this.addLayout(new Layout(
                                basegroup,
                                node,
                                vertical.containerType,
                                vertical.alignmentType | NODE_ALIGNMENT.SEGMENTED | NODE_ALIGNMENT.BLOCK,
                                node.children as T[]
                            ));
                        }
                    }
                }
            }
        }
        return layout;
    }

    protected insertNode(element: Element, parent?: T) {
        if (element.nodeName === '#text') {
            if ($xml.isPlainText(element.textContent as string) || $css.isParentStyle(element, 'whiteSpace', 'pre', 'pre-wrap')) {
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
        else if (this.conditionElement(<HTMLElement> element)) {
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

    protected conditionElement(element: HTMLElement) {
        if (!this.controllerHandler.localSettings.unsupported.excluded.has(element.tagName)) {
            if (this.controllerHandler.visibleElement(element) || element.dataset.use && element.dataset.use.split($regex.XML.SEPARATOR).some(value => !!this.extensionManager.retrieve(value.trim()))) {
                return true;
            }
            else {
                let current = element.parentElement;
                let valid = true;
                while (current) {
                    if ($css.getStyle(current).display === 'none') {
                        valid = false;
                        break;
                    }
                    current = current.parentElement;
                }
                if (valid) {
                    for (let i = 0; i < element.children.length; i++) {
                        if (this.controllerHandler.visibleElement(<Element> element.children[i])) {
                            return true;
                        }
                    }
                }
                return false;
            }
        }
        return false;
    }

    private createPseduoElement(element: HTMLElement, target: string) {
        const styleMap: StringMap = $session.getElementCache(element, `styleMap::${target}`, this.processing.sessionId);
        if (styleMap && styleMap.content) {
            if ($util.trimString(styleMap.content, '"').trim() === '' && $util.convertFloat(styleMap.width) === 0 && $util.convertFloat(styleMap.height) === 0 && (styleMap.position === 'absolute' || styleMap.position === 'fixed' || styleMap.clear && styleMap.clear !== 'none')) {
                let valid = true;
                for (const attr in styleMap) {
                    if (/(Width|Height)$/.test(attr) && $css.isLength(styleMap[attr], true) && $util.convertFloat(styleMap[attr]) !== 0) {
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
                    value = $css.getStyle(current, target).getPropertyValue('content');
                    if (value !== 'inherit') {
                        break;
                    }
                    current = current.parentElement;
                }
            }
            const style = $css.getStyle(element);
            if (styleMap.fontFamily === undefined) {
                styleMap.fontFamily = style.getPropertyValue('font-family');
            }
            if (styleMap.fontSize) {
                styleMap.fontSize = $css.convertPX(styleMap.fontSize, $css.getFontSize(document.body));
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
                        content = $css.resolveURL(value);
                        const format = $util.fromLastIndexOf(content, '.').toLowerCase();
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
                        let match: RegExpExecArray | null;
                        let found = false;
                        while ((match = REGEXP_CACHED.COUNTERS.exec(value)) !== null) {
                            if (match[1]) {
                                content += $dom.getNamedItem(element, match[1].trim());
                            }
                            else if (match[2] || match[5]) {
                                const counterType = match[2] === 'counter';
                                let counterName: string;
                                let styleName: string;
                                if (counterType) {
                                    counterName = match[3];
                                    styleName = match[4] || 'decimal';
                                }
                                else {
                                    counterName = match[6];
                                    styleName = match[8] || 'decimal';
                                }
                                function getCounterValue(name: string) {
                                    if (name !== 'none') {
                                        const counterPattern = /\s*([^\-\d][^\-\d]?[^ ]*) (-?\d+)\s*/g;
                                        let counterMatch: RegExpExecArray | null;
                                        while ((counterMatch = counterPattern.exec(name)) !== null) {
                                            if (counterMatch[1] === counterName) {
                                                return parseInt(counterMatch[2]);
                                            }
                                        }
                                    }
                                    return undefined;
                                }
                                const getIncrementValue = (parent: Element) => {
                                    const pseduoStyle: StringMap = $session.getElementCache(parent, `styleMap::${target}`, this.processing.sessionId);
                                    if (pseduoStyle && pseduoStyle.counterIncrement) {
                                        return getCounterValue(pseduoStyle.counterIncrement);
                                    }
                                    return undefined;
                                };
                                const initalValue = (getIncrementValue(element) || 0) + (getCounterValue(style.getPropertyValue('counter-reset')) || 0);
                                const subcounter: number[] = [];
                                let current: Element | null = element;
                                let counter = initalValue;
                                let ascending = false;
                                let lastResetElement: Element | undefined;
                                function incrementCounter(increment: number, pseudo = false) {
                                    if (subcounter.length === 0) {
                                        counter += increment;
                                    }
                                    else if (ascending || pseudo) {
                                        subcounter[subcounter.length - 1] += increment;
                                    }
                                }
                                function cascadeSibling(sibling: Element) {
                                    if (getCounterValue($css.getStyle(sibling).getPropertyValue('counter-reset')) === undefined) {
                                        for (let i = 0; i < sibling.children.length; i++) {
                                            const child = sibling.children[i];
                                            if (child.className !== '__squared.pseudo') {
                                                let increment = getIncrementValue(child);
                                                if (increment) {
                                                    incrementCounter(increment, true);
                                                }
                                                const childStyle = $css.getStyle(child);
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
                                        const currentStyle = $css.getStyle(current);
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
                                }
                                while (true);
                                if (lastResetElement) {
                                    if (!counterType && subcounter.length > 1) {
                                        subcounter.reverse();
                                        subcounter.splice(1, 1);
                                        for (const leading of subcounter) {
                                            content += $css.convertListStyle(styleName, leading, true) + match[7];
                                        }
                                    }
                                }
                                else {
                                    counter = initalValue;
                                }
                                content += $css.convertListStyle(styleName, counter, true);
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
                    (<HTMLImageElement> pseudoElement).src = content;
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

    private setStyleMap() {
        let warning = false;
        for (let i = 0; i < document.styleSheets.length; i++) {
            const item = <CSSStyleSheet> document.styleSheets[i];
            try {
                if (item.cssRules) {
                    for (let j = 0; j < item.cssRules.length; j++) {
                        const rule = item.cssRules[j];
                        switch (rule.type) {
                            case CSSRule.STYLE_RULE:
                            case CSSRule.FONT_FACE_RULE:
                                this.applyStyleRule(<CSSStyleRule> rule);
                                break;
                            case CSSRule.MEDIA_RULE:
                                if ($css.validMediaRule((<CSSConditionRule> rule).conditionText || parseConditionText('media', rule.cssText))) {
                                    this.applyCSSRuleList((<CSSConditionRule> rule).cssRules);
                                }
                                break;
                            case CSSRule.SUPPORTS_RULE:
                                if (CSS.supports && CSS.supports((<CSSConditionRule> rule).conditionText || parseConditionText('supports', rule.cssText))) {
                                    this.applyCSSRuleList((<CSSConditionRule> rule).cssRules);
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

    private applyCSSRuleList(rules: CSSRuleList) {
        for (let i = 0; i < rules.length; i++) {
            this.applyStyleRule(<CSSStyleRule> rules[i]);
        }
    }

    private applyStyleRule(item: CSSStyleRule) {
        switch (item.type) {
            case CSSRule.STYLE_RULE: {
                const fromRule: string[] = [];
                for (const attr of Array.from(item.style)) {
                    fromRule.push($util.convertCamelCase(attr));
                }
                for (const selectorText of item.selectorText.split($regex.XML.SEPARATOR)) {
                    const specificity = $css.getSpecificity(selectorText);
                    const [selector, target] = selectorText.split('::');
                    const targetElt = target ? '::' + target : '';
                    document.querySelectorAll(selector || '*').forEach((element: HTMLElement) => {
                        const style = $css.getStyle(element, targetElt);
                        const fontSize = $css.parseUnit(style.getPropertyValue('font-size'));
                        const styleMap: StringMap = {};
                        for (const attr of fromRule) {
                            const value = $css.checkStyleValue(element, attr, item.style[attr], style, specificity, fontSize);
                            if (value) {
                                styleMap[attr] = value;
                            }
                        }
                        [styleMap.backgroundImage, styleMap.listStyleImage, styleMap.content].forEach(image => {
                            if (image) {
                                const pattern = new RegExp(`url\\("(${STRING_DATAURI})"\\),?\\s*`, 'g');
                                let match: RegExpExecArray | null = null;
                                while ((match = pattern.exec(image)) !== null) {
                                    if (match[2] && match[3]) {
                                        this.resourceHandler.addRawData(match[1], match[2], match[3], match[4]);
                                    }
                                    else if (this.userSettings.preloadImages) {
                                        const uri = $css.resolveURL(match[4].trim());
                                        if (uri !== '' && this.resourceHandler.getImage(uri) === undefined) {
                                            this.resourceHandler.assets.images.set(uri, { width: 0, height: 0, uri });
                                        }
                                    }
                                }
                            }
                        });
                        const attrStyle = `styleMap${targetElt}`;
                        const attrSpecificity = `styleSpecificity${targetElt}`;
                        const styleData: StringMap = $session.getElementCache(element, attrStyle, this.processing.sessionId);
                        if (styleData) {
                            const specificityData: ObjectMap<number> = $session.getElementCache(element, attrSpecificity, this.processing.sessionId) || {};
                            for (const attr in styleMap) {
                                if (styleData[attr] === undefined || specificityData[attr] === undefined || specificity >= specificityData[attr]) {
                                    styleData[attr] = styleMap[attr];
                                    specificityData[attr] = specificity;
                                }
                            }
                        }
                        else {
                            const specificityData: ObjectMap<number> = {};
                            for (const attr in styleMap) {
                                specificityData[attr] = specificity;
                            }
                            $session.setElementCache(element, `style${targetElt}`, '0', style);
                            $session.setElementCache(element, 'sessionId', '0', this.processing.sessionId);
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
                            const urlMatch = REGEXP_CACHED.URL.exec(value);
                            if (urlMatch) {
                                let srcUrl: string | undefined;
                                let srcLocal: string | undefined;
                                if (urlMatch[1] === 'url') {
                                    srcUrl = $util.resolvePath(urlMatch[2].trim());
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

    private createLayoutControl(parent: T, node: T) {
        return new Layout(
            parent,
            node,
            node.containerType,
            node.alignmentType,
            node.children as T[]
        );
    }

    set userSettings(value) {
        this._userSettings = value;
    }
    get userSettings() {
        return this._userSettings || {} as UserSettings;
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