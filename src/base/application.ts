import { AppProcessing, AppSession, FileAsset, ImageAsset, LayoutResult, NodeTemplate, SessionData, UserSettings } from './@types/application';

import Controller from './controller';
import Extension from './extension';
import ExtensionManager from './extensionmanager';
import Layout from './layout';
import Node from './node';
import NodeList from './nodelist';
import Resource from './resource';

import { APP_SECTION, BOX_STANDARD, NODE_ALIGNMENT, NODE_PROCEDURE, NODE_RESOURCE } from './lib/enumeration';

const $css = squared.lib.css;
const $dom = squared.lib.dom;
const $element = squared.lib.element;
const $util = squared.lib.util;

const REGEXP_CACHED: ObjectMap<RegExp> = {};
let NodeConstructor!: Constructor<Node>;

function checkPositionStatic(node: Node, parent?: Node) {
    const previousSiblings = node.previousSiblings();
    const nextSiblings = node.nextSiblings();
    if (!previousSiblings.some(item => item.multiline || item.excluded && !item.blockStatic) && (nextSiblings.every(item => item.blockStatic || item.lineBreak || item.excluded) || parent && node.element === $dom.getLastChildElement(parent.element))) {
        node.cssApply({ display: 'inline-block', verticalAlign: 'top' }, true);
        node.positionStatic = true;
        return true;
    }
    return false;
}

function prioritizeExtensions<T extends Node>(element: HTMLElement, extensions: Extension<T>[], documentRoot: HTMLElement | null = null) {
    const tagged: string[] = [];
    let current: HTMLElement | null = element;
    while (current) {
        if (current.dataset.use) {
            for (const value of current.dataset.use.split($util.REGEXP_COMPILED.SEPARATOR)) {
                tagged.push(value);
            }
        }
        if (documentRoot === null || current === documentRoot) {
            break;
        }
        else if (current !== documentRoot) {
            current = current.parentElement;
        }
    }
    if (tagged.length) {
        const result: Extension<T>[] = [];
        const untagged: Extension<T>[] = [];
        for (const ext of extensions) {
            const index = tagged.indexOf(ext.name);
            if (index !== -1) {
                result[index] = ext;
            }
            else {
                untagged.push(ext);
            }
        }
        return $util.concatArray($util.spliceArray(result, item => item === undefined), untagged);
    }
    return extensions;
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
        image: new Map<string, ImageAsset>(),
        targetQueue: new Map<T, NodeTemplate<T>>(),
        excluded: new NodeList<T>(),
        renderPosition: new Map<T, T[]>(),
        extensionMap: new Map<number, Extension<T>[]>()
    };
    public readonly processing: AppProcessing<T, NodeList<T>> = {
        cache: new NodeList<T>(),
        node: undefined,
        excluded: new NodeList<T>()
    };

    private _userSettings?: UserSettings;
    private readonly _views: FileAsset[] = [];
    private readonly _includes: FileAsset[] = [];

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
                    this.addRenderTemplate(parent, node, template);
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
        for (const node of rendered) {
            if (node.hasProcedure(NODE_PROCEDURE.OPTIMIZATION)) {
                node.applyOptimizations();
            }
            if (!this.userSettings.customizationsDisabled && node.hasProcedure(NODE_PROCEDURE.CUSTOMIZATION)) {
                node.applyCustomizations(this.userSettings.customizationsOverwritePrivilege);
            }
        }
        for (const ext of this.extensions) {
            for (const node of ext.subscribers) {
                ext.postProcedure(node);
            }
        }
        for (const node of this.rendered) {
            if (node.hasResource(NODE_RESOURCE.BOX_SPACING)) {
                node.setBoxSpacing();
            }
        }
        for (const ext of this.extensions) {
            ext.beforeCascadeDocument();
        }
        for (const layout of this.session.documentRoot) {
            const node = layout.node;
            const parent = layout.node.renderParent;
            if (parent && parent.renderTemplates) {
                this.addLayoutFile(
                    layout.layoutName,
                    controller.localSettings.layout.baseTemplate + controller.cascadeDocument(<NodeTemplate<T>[]> parent.renderTemplates, 0),
                    node.dataset.pathname,
                    !!node.renderExtension && node.renderExtension.some(item => item.documentBase)
                );
            }
        }
        const sessionData = this.sessionData;
        this.resourceHandler.finalize(sessionData);
        controller.finalize(sessionData);
        for (const ext of this.extensions) {
            ext.afterFinalize();
        }
        $dom.removeElementsByClassName('__squared.placeholder');
        $dom.removeElementsByClassName('__squared.pseudo');
        this.closed = true;
    }

    public saveAllToDisk() {
        if (this.resourceHandler.fileHandler) {
            this.resourceHandler.fileHandler.saveAllToDisk(this.sessionData);
        }
    }

    public reset() {
        this.session.cache.each(node => node.element && $dom.deleteElementCache(node.element, 'node', 'style', 'styleMap'));
        for (const element of this.rootElements) {
            element.dataset.iteration = '';
        }
        this.session.documentRoot.length = 0;
        this.session.targetQueue.clear();
        this.session.image.clear();
        this.session.cache.reset();
        this.session.excluded.reset();
        this.session.renderPosition.clear();
        this.session.extensionMap.clear();
        this.processing.cache.reset();
        this.controllerHandler.reset();
        this.resourceHandler.reset();
        this._views.length = 0;
        this._includes.length = 0;
        for (const ext of this.extensions) {
            ext.subscribers.clear();
        }
        this.closed = false;
    }

    public parseDocument(...elements: any[]): FunctionMap<void> {
        let __THEN: () => void;
        this.rootElements.clear();
        this.initialized = false;
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
        const documentRoot = this.rootElements.values().next().value;
        const fileExtension = new RegExp(`\.${this.controllerHandler.localSettings.layout.fileExtension}$`);
        const preloadImages: HTMLImageElement[] = [];
        const parseResume = () => {
            this.initialized = false;
            for (const image of preloadImages) {
                documentRoot.removeChild(image);
            }
            for (const [uri, image] of this.session.image.entries()) {
                Resource.ASSETS.images.set(uri, image);
            }
            for (const ext of this.extensions) {
                ext.beforeParseDocument();
            }
            for (const element of this.rootElements) {
                const iteration = (element.dataset.iteration ? $util.convertInt(element.dataset.iteration) : -1) + 1;
                element.dataset.iteration = iteration.toString();
                if (this.createCache(element)) {
                    const filename = element.dataset.filename && element.dataset.filename.replace(fileExtension, '') || element.id || `document_${this.length}`;
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
        const images: HTMLImageElement[] = [];
        if (this.userSettings.preloadImages) {
            for (const element of this.rootElements) {
                element.querySelectorAll('input[type=image]').forEach((image: HTMLInputElement) => {
                    const uri = image.src;
                    if (uri !== '') {
                        this.session.image.set(uri, {
                            width: image.width,
                            height: image.height,
                            uri
                        });
                    }
                });
                element.querySelectorAll('svg image').forEach((image: SVGImageElement) => {
                    const uri = $util.resolvePath(image.href.baseVal);
                    if (uri !== '') {
                        this.session.image.set(uri, {
                            width: image.width.baseVal.value,
                            height: image.height.baseVal.value,
                            uri
                        });
                    }
                });
            }
            for (const image of this.session.image.values()) {
                if (image.width === 0 && image.height === 0 && image.uri) {
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
                element.querySelectorAll('IMG').forEach((image: HTMLImageElement) => {
                    if (image.tagName === 'IMG') {
                        if (image.complete) {
                            this.addImagePreload(image);
                        }
                        else {
                            images.push(image);
                        }
                    }
                });
            }
        }
        if (images.length === 0) {
            parseResume();
        }
        else {
            this.initialized = true;
            Promise.all($util.objectMap<HTMLImageElement, {}>(images, image => {
                return new Promise((resolve, reject) => {
                    image.onload = () => {
                        resolve(image);
                    };
                    image.onerror = () => {
                        reject(image);
                    };
                });
            }))
            .then((result: HTMLImageElement[]) => {
                for (const item of result) {
                    this.addImagePreload(item);
                }
                parseResume();
            })
            .catch((error: Event) => {
                const message = error.target ? (<HTMLImageElement> error.target).src : '';
                if (!$util.hasValue(message) || confirm(`FAIL: ${message}`)) {
                    parseResume();
                }
            });
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

    public renderNode(layout: Layout<T>) {
        if (layout.itemCount === 0) {
            return this.controllerHandler.renderNode(layout);
        }
        else {
            return this.controllerHandler.renderNodeGroup(layout);
        }
    }

    public renderLayout(layout: Layout<T>, outerParent: T) {
        if ($util.hasBit(layout.renderType, NODE_ALIGNMENT.FLOAT)) {
            if ($util.hasBit(layout.renderType, NODE_ALIGNMENT.HORIZONTAL)) {
                layout = this.processFloatHorizontal(layout);
            }
            else if ($util.hasBit(layout.renderType, NODE_ALIGNMENT.VERTICAL)) {
                layout = this.processFloatVertical(layout, outerParent);
            }
        }
        return layout.containerType !== 0 ? this.renderNode(layout) : undefined;
    }

    public addLayoutFile(filename: string, content: string, pathname?: string, documentBase = false) {
        if (content !== '') {
            const layout: FileAsset = {
                pathname: $util.trimString(pathname || this.controllerHandler.localSettings.layout.pathName, '/'),
                filename,
                content
            };
            if (documentBase) {
                this._views.unshift(layout);
            }
            else {
                this._views.push(layout);
            }
        }
    }

    public addIncludeFile(id: number, filename: string, content: string) {
        this._includes.push({
            id,
            pathname: this.controllerHandler.localSettings.layout.pathName,
            filename,
            content
        });
    }

    public addRenderLayout(layout: Layout<T>, outerParent?: T) {
        let template: NodeTemplate<T> | undefined;
        if (outerParent) {
            template = this.renderLayout(layout, outerParent);
        }
        else {
            template = this.renderNode(layout);
        }
        return this.addRenderTemplate(layout.parent, layout.node, template, layout.renderIndex);
    }

    public addRenderTemplate(parent: T, node: T, template: NodeTemplate<T> | undefined, index = -1) {
        if (template) {
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
            return true;
        }
        return false;
    }

    public addImagePreload(element: HTMLImageElement | undefined) {
        if (element && element.complete) {
            const uri = element.src.trim();
            if (uri !== '') {
                this.session.image.set(uri, {
                    width: element.naturalWidth,
                    height: element.naturalHeight,
                    uri
                });
            }
        }
    }

    public createNode(element: Element, append = true, delegate = false) {
        const node = new NodeConstructor(this.nextId, element, this.controllerHandler.afterInsertNode) as T;
        if (append) {
            this.processing.cache.append(node, delegate);
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
        return this._views.length ? this._views[0].content : '';
    }

    protected createCache(documentRoot: HTMLElement) {
        this.processing.cache.afterAppend = undefined;
        this.processing.cache.clear();
        this.processing.excluded.clear();
        this.processing.node = undefined;
        for (const ext of this.extensions) {
            ext.beforeInit(documentRoot);
        }
        const rootNode = this.cascadeParentNode(documentRoot);
        if (rootNode) {
            rootNode.parent = new NodeConstructor(0, documentRoot.parentElement || document.body, this.controllerHandler.afterInsertNode);
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
        for (const node of this.processing.cache) {
            if (node.styleElement) {
                const element = <HTMLElement> node.element;
                if (node.length) {
                    const textAlign = node.cssInitial('textAlign');
                    switch (textAlign) {
                        case 'center':
                        case 'right':
                        case 'end':
                            preAlignment[node.id] = { textAlign };
                            element.style.textAlign = 'left';
                            break;
                    }
                }
                if (node.positionRelative && !node.positionStatic) {
                    if (preAlignment[node.id] === undefined) {
                        preAlignment[node.id] = {};
                    }
                    for (const attr of $css.BOX_POSITION) {
                        if (node.has(attr)) {
                            preAlignment[node.id][attr] = node.css(attr);
                            element.style[attr] = 'auto';
                        }
                    }
                }
                if (element.dir === 'rtl') {
                    element.dir = 'ltr';
                    direction.add(element);
                }
            }
        }
        const pseudoElement = new Set<T>();
        rootNode.parent.setBounds();
        for (const node of this.processing.cache) {
            if (!node.pseudoElement) {
                node.setBounds();
            }
            else {
                pseudoElement.add(node.parent as T);
            }
        }
        for (const node of pseudoElement) {
            [node.beforePseudoChild, node.afterPseudoChild].forEach((item, index) => {
                if (item) {
                    const element = <HTMLElement> node.element;
                    const id = element.id;
                    let styleElement: HTMLElement | undefined;
                    if (item.pageFlow) {
                        element.id = 'id_' + Math.round(Math.random() * new Date().getTime());
                        styleElement = $css.insertStyleSheetRule(`#${element.id}::${index === 0 ? 'before' : 'after'} { display: none !important; }`);
                    }
                    if (item.cssTry('display', item.display)) {
                        item.setBounds();
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
            }
        }
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
            if (!node.documentRoot) {
                let parent = node.actualParent;
                switch (node.position) {
                    case 'fixed':
                        if (!node.positionAuto) {
                            parent = rootNode;
                            break;
                        }
                    case 'absolute':
                        if (node.positionAuto && checkPositionStatic(node, parent)) {
                            break;
                        }
                        else if (this.userSettings.supportNegativeLeftTop) {
                            const absoluteParent = node.absoluteParent;
                            let documentParent: T | undefined;
                            let outside = false;
                            while (parent && (parent !== rootNode || parent.id !== 0)) {
                                if (documentParent === undefined) {
                                    if (absoluteParent === parent) {
                                        documentParent = parent as T;
                                        if (parent.css('overflow') === 'hidden') {
                                            break;
                                        }
                                        else {
                                            if ((!node.has('right') || node.right < 0) && (!node.has('bottom') || node.bottom < 0) && (
                                                    node.left < 0 && node.outsideX(parent.box) ||
                                                    !node.has('left') && node.right < 0 && node.outsideX(parent.box) ||
                                                    node.top < 0 && node.outsideY(parent.box) ||
                                                    !node.has('top') && node.bottom < 0 && node.outsideX(parent.box)
                                                ))
                                            {
                                                outside = true;
                                            }
                                            else {
                                                break;
                                            }
                                        }
                                    }
                                }
                                else if (outside && (parent.documentRoot || parent.css('overflow') === 'hidden' || node.withinX(parent.box) && node.withinY(parent.box))) {
                                    documentParent = parent as T;
                                    break;
                                }
                                parent = parent.actualParent as T;
                            }
                            if (documentParent) {
                                parent = documentParent;
                            }
                        }
                        else {
                            parent = node.absoluteParent;
                        }
                        break;
                }
                if (!node.pageFlow && (parent === undefined || parent.id === 0)) {
                    parent = rootNode;
                }
                if (parent) {
                    if (parent !== node.parent) {
                        node.parent = parent;
                        node.siblingIndex = Number.POSITIVE_INFINITY;
                    }
                    node.documentParent = parent;
                }
            }
            if (node.length) {
                const layers: Array<T[]> = [];
                node.each((item: T) => {
                    if (item.siblingIndex === Number.POSITIVE_INFINITY) {
                        for (const adjacent of node.children) {
                            let valid = adjacent.actualChildren.includes(item);
                            if (!valid) {
                                const nested = adjacent.cascade();
                                valid = item.ascend().some(child => nested.includes(child));
                            }
                            if (valid) {
                                const index = adjacent.siblingIndex + (item.zIndex >= 0 || adjacent !== item.actualParent ? 1 : -1);
                                if (layers[index] === undefined) {
                                    layers[index] = [];
                                }
                                layers[index].push(item);
                                break;
                            }
                        }
                    }
                });
                for (let j = 0; j < layers.length; j++) {
                    const order = layers[j];
                    if (order) {
                        order.sort((a, b) => {
                            if (a.zIndex === b.zIndex) {
                                return a.id < b.id ? -1 : 1;
                            }
                            return a.zIndex < b.zIndex ? -1 : 1;
                        });
                        node.each((item: T) => {
                            if (item.siblingIndex >= j && item.siblingIndex !== Number.POSITIVE_INFINITY) {
                                item.siblingIndex += order.length;
                            }
                        });
                        for (let k = 0 ; k < order.length; k++) {
                            order[k].siblingIndex = j + k;
                        }
                    }
                }
                node.sort(NodeList.siblingIndex);
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

    protected cascadeParentNode(element: HTMLElement, depth = 0) {
        const node = this.insertNode(element);
        if (node) {
            const localSettings = this.controllerHandler.localSettings;
            node.depth = depth;
            if (depth === 0) {
                this.processing.cache.append(node);
            }
            if (node.tagName !== 'SELECT') {
                const beforeElement = this.createPseduoElement(element, 'before');
                const afterElement = this.createPseduoElement(element, 'after');
                const children: T[] = [];
                let includeText = false;
                for (let i = 0; i < element.childNodes.length; i++) {
                    const childElement = <HTMLInputElement> element.childNodes[i];
                    if (childElement.nodeName.charAt(0) === '#') {
                        if (childElement.nodeName === '#text') {
                            const child = this.insertNode(childElement, node);
                            if (child) {
                                children.push(child);
                            }
                        }
                    }
                    else if (childElement === beforeElement) {
                        node.beforePseudoChild = this.insertNode(<HTMLElement> beforeElement);
                        children.push(node.beforePseudoChild as T);
                        includeText = true;
                    }
                    else if (childElement === afterElement) {
                        node.afterPseudoChild = this.insertNode(<HTMLElement> afterElement);
                        children.push(node.afterPseudoChild as T);
                        includeText = true;
                    }
                    else if (!localSettings.unsupported.tagName.has(childElement.tagName) || childElement.tagName === 'INPUT' && !localSettings.unsupported.tagName.has(`${childElement.tagName}:${childElement.type}`)) {
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
                    }
                }
                for (let i = 0; i < children.length; i++) {
                    const child = children[i];
                    if (child.excluded) {
                        this.processing.excluded.append(child);
                    }
                    else if (includeText || !child.plainText) {
                        child.parent = node;
                        this.processing.cache.append(child);
                    }
                    child.siblingIndex = i;
                }
                node.actualChildren = children;
            }
        }
        return node;
    }

    protected setBaseLayout(layoutName: string) {
        const controller = this.controllerHandler;
        const extensions: Extension<T>[] = [];
        for (const item of this.extensions) {
            if (!item.eventOnly) {
                extensions.push(item);
            }
        }
        const documentRoot = this.processing.node as T;
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
                const hasFloat = axisY.some(node => node.floating);
                let cleared!: Map<T, string>;
                if (hasFloat) {
                    cleared = <Map<T, string>> NodeList.linearData(parent.actualChildren).cleared;
                }
                let k = -1;
                while (++k < axisY.length) {
                    let nodeY = axisY[k];
                    if (!nodeY.visible || nodeY.rendered) {
                        continue;
                    }
                    else if (nodeY.htmlElement) {
                        const element = <HTMLElement> nodeY.element;
                        if (this.rootElements.has(element) && !nodeY.documentRoot && !nodeY.documentBody) {
                            continue;
                        }
                        else if (nodeY.length === 0 && element.children.length) {
                            let valid = true;
                            for (let i = 0; i < element.children.length; i++) {
                                if (!this.rootElements.has(<HTMLElement> element.children[i])) {
                                    valid = false;
                                    break;
                                }
                            }
                            if (valid) {
                                nodeY.inlineText = false;
                            }
                        }
                    }
                    let parentY = nodeY.parent as T;
                    const extensionDescendant = this.session.extensionMap.get(nodeY.id);
                    const extendable = nodeY.hasAlign(NODE_ALIGNMENT.EXTENDABLE);
                    if (axisY.length > 1 && k < axisY.length - 1 && nodeY.pageFlow && (parentY.alignmentType === 0 || extendable || parentY.hasAlign(NODE_ALIGNMENT.UNKNOWN)) && !parentY.hasAlign(NODE_ALIGNMENT.AUTO_LAYOUT) && nodeY.hasSection(APP_SECTION.DOM_TRAVERSE)) {
                        const horizontal: T[] = [];
                        const vertical: T[] = [];
                        let verticalExtended = false;
                        function checkHorizontal(node: T) {
                            if (vertical.length || verticalExtended) {
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
                        if (extendable && parentY.layoutVertical) {
                            horizontal.push(nodeY);
                            l++;
                            m++;
                        }
                        domNested: {
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
                                    const previousSiblings = item.previousSiblings() as T[];
                                    const previous = previousSiblings[previousSiblings.length - 1];
                                    const next = item.nextSiblings().shift();
                                    if (m === 0 && next) {
                                        if (item.blockStatic || next.alignedVertically([item], [item], cleared)) {
                                            vertical.push(item);
                                        }
                                        else {
                                            horizontal.push(item);
                                        }
                                    }
                                    else if (previous) {
                                        if (hasFloat) {
                                            const siblings: T[] = [];
                                            if (horizontal.length) {
                                                $util.concatArray(siblings, horizontal);
                                            }
                                            else if (vertical.length) {
                                                $util.concatArray(siblings, vertical);
                                            }
                                            siblings.push(item);
                                            if (item.alignedVertically(previousSiblings, siblings, cleared, false)) {
                                                if (horizontal.length) {
                                                    if (floatActive.size && !previous.autoMargin.horizontal && cleared.get(item) !== 'both' && !previousSiblings.some(node => node.lineBreak && !cleared.has(node))) {
                                                        let floatBottom = Number.NEGATIVE_INFINITY;
                                                        $util.captureMap(horizontal, node => node.floating, node => floatBottom = Math.max(floatBottom, node.linear.bottom));
                                                        if (!item.floating || item.linear.top < floatBottom) {
                                                            if (cleared.has(item)) {
                                                                if (!item.floating && floatActive.size < 2 && floated.size === 2) {
                                                                    item.alignmentType |= NODE_ALIGNMENT.EXTENDABLE;
                                                                    verticalExtended = true;
                                                                    horizontal.push(item);
                                                                    continue;
                                                                }
                                                                break domNested;
                                                            }
                                                            else if (floated.size === 1 && (!item.floating || floatActive.has(item.float))) {
                                                                horizontal.push(item);
                                                                if (item.linear.bottom > floatBottom) {
                                                                    break domNested;
                                                                }
                                                                else {
                                                                    continue;
                                                                }
                                                            }
                                                        }
                                                    }
                                                    break domNested;
                                                }
                                                checkVertical(item);
                                            }
                                            else if (!checkHorizontal(item)) {
                                                break domNested;
                                            }
                                        }
                                        else {
                                            if (item.alignedVertically(previousSiblings)) {
                                                checkVertical(item);
                                            }
                                            else if (!checkHorizontal(item)) {
                                                break domNested;
                                            }
                                        }
                                    }
                                    else {
                                        break domNested;
                                    }
                                }
                            }
                        }
                        let result: LayoutResult<T> | undefined;
                        let segEnd: T | undefined;
                        if (horizontal.length > 1) {
                            result = controller.processTraverseHorizontal(new Layout(parentY, nodeY, 0, 0, horizontal), axisY);
                            segEnd = horizontal[horizontal.length - 1];
                        }
                        else if (vertical.length > 1) {
                            result = controller.processTraverseVertical(new Layout(parentY, nodeY, 0, 0, vertical), axisY);
                            segEnd = vertical[vertical.length - 1];
                            if (!segEnd.blockStatic && segEnd !== axisY[axisY.length - 1]) {
                                segEnd.alignmentType |= NODE_ALIGNMENT.EXTENDABLE;
                            }
                        }
                        if (parentY.hasAlign(NODE_ALIGNMENT.UNKNOWN) && segEnd === axisY[axisY.length - 1]) {
                            parentY.alignmentType ^= NODE_ALIGNMENT.UNKNOWN;
                        }
                        if (result && this.addRenderLayout(result.layout, parentY)) {
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
                        let combined = parent.renderExtension ? <Extension<T>[]> parent.renderExtension.slice(0) : undefined;
                        if (extensionDescendant) {
                            if (combined) {
                                $util.concatArray(combined, <Extension<T>[]> extensionDescendant);
                            }
                            else {
                                combined = <Extension<T>[]> extensionDescendant.slice(0);
                            }
                        }
                        if (combined) {
                            let next = false;
                            for (const ext of combined) {
                                const result = ext.processChild(nodeY, parentY);
                                if (result) {
                                    if (result.output) {
                                        this.addRenderTemplate(result.parentAs || parentY, nodeY, result.output);
                                    }
                                    if (result.renderAs && result.outputAs) {
                                        this.addRenderTemplate(parentY, result.renderAs, result.outputAs);
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
                            prioritizeExtensions(<HTMLElement> nodeY.element, extensions, <HTMLElement> documentRoot.element).some(item => {
                                if (item.is(nodeY) && item.condition(nodeY, parentY) && (extensionDescendant === undefined || !extensionDescendant.includes(item))) {
                                    const result = item.processNode(nodeY, parentY);
                                    if (result) {
                                        if (result.output) {
                                            this.addRenderTemplate(result.parentAs || parentY, nodeY, result.output);
                                        }
                                        if (result.renderAs && result.outputAs) {
                                            this.addRenderTemplate(parentY, result.renderAs, result.outputAs);
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
                        const result = nodeY.length ? controller.processUnknownParent(layout) : controller.processUnknownChild(layout);
                        if (result.next === true) {
                            continue;
                        }
                        else if (result.renderAs) {
                            axisY[k] = result.renderAs as T;
                            k--;
                            continue;
                        }
                        this.addRenderLayout(result.layout, parentY);
                    }
                }
            }
        }
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
        this.resourceHandler.setBoxStyle();
        this.resourceHandler.setFontStyle();
        this.resourceHandler.setValueString();
        for (const ext of this.extensions) {
            ext.afterResources();
        }
    }

    protected processFloatHorizontal(layout: Layout<T>) {
        const controller = this.controllerHandler;
        let layerIndex: Array<T[] | T[][]> | undefined;
        const itemCount = layout.itemCount;
        if (layout.cleared.size === 0 && !layout.some(node => node.autoMargin.horizontal)) {
            const inline: T[] = [];
            const left: T[] = [];
            const right: T[] = [];
            for (const node of layout) {
                if (node.float === 'right') {
                    right.push(node);
                }
                else if (node.float === 'left') {
                    left.push(node);
                }
                else {
                    inline.push(node);
                }
            }
            if (inline.length === itemCount || left.length === itemCount || right.length === itemCount) {
                controller.processLayoutHorizontal(layout);
            }
            else if ((left.length === 0 || right.length === 0) && !inline.some(item => item.blockStatic)) {
                const subgroup: T[] = [];
                if (right.length === 0) {
                    $util.concatMultiArray(subgroup, left, inline);
                    const horizontal = controller.containerTypeHorizontal;
                    layout.setType(horizontal.containerType, horizontal.alignmentType);
                    layerIndex = [left, inline];
                }
                else {
                    $util.concatMultiArray(subgroup, inline, right);
                    const verticalMargin = controller.containerTypeVerticalMargin;
                    layout.setType(verticalMargin.containerType, verticalMargin.alignmentType);
                    layerIndex = [inline, right];
                }
                layout.retain(subgroup);
            }
        }
        const vertical = controller.containerTypeVertical;
        const inlineAbove: T[] = [];
        const inlineBelow: T[] = [];
        const leftAbove: T[] = [];
        const rightAbove: T[] = [];
        const leftBelow: T[] = [];
        const rightBelow: T[] = [];
        let leftSub: T[] | T[][] = [];
        let rightSub: T[] | T[][] = [];
        if (layerIndex === undefined) {
            layerIndex = [];
            let current = '';
            let pendingFloat = 0;
            for (const node of layout) {
                const direction = layout.cleared.get(node);
                if (direction && ($util.hasBit(pendingFloat, direction === 'right' ? 4 : 2) || pendingFloat !== 0 && direction === 'both')) {
                    switch (direction) {
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
                if (current === '') {
                    if (node.float === 'right') {
                        rightAbove.push(node);
                        if (node.floating) {
                            pendingFloat |= 4;
                        }
                    }
                    else if (node.float === 'left') {
                        leftAbove.push(node);
                        if (node.floating) {
                            pendingFloat |= 2;
                        }
                    }
                    else if (node.autoMargin.horizontal) {
                        if (node.autoMargin.left) {
                            if (rightAbove.length) {
                                rightBelow.push(node);
                            }
                            else {
                                rightAbove.push(node);
                            }
                        }
                        else if (node.autoMargin.right) {
                            if (leftAbove.length) {
                                leftBelow.push(node);
                            }
                            else {
                                leftAbove.push(node);
                            }
                        }
                        else {
                            if (inlineAbove.length) {
                                if (leftAbove.length === 0) {
                                    leftAbove.push(node);
                                }
                                else {
                                    rightAbove.push(node);
                                }
                            }
                            else {
                                inlineAbove.push(node);
                            }
                        }
                    }
                    else {
                        inlineAbove.push(node);
                    }
                }
                else {
                    if (node.float === 'right') {
                        if (rightBelow.length === 0) {
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
                        if (leftBelow.length === 0) {
                            pendingFloat |= 2;
                        }
                        if (current !== 'left' && leftAbove.length) {
                            leftAbove.push(node);
                        }
                        else {
                            leftBelow.push(node);
                        }
                    }
                    else if (node.autoMargin.horizontal) {
                        if (node.autoMargin.left && rightBelow.length) {
                            rightBelow.push(node);
                        }
                        else if (node.autoMargin.right && leftBelow.length) {
                            leftBelow.push(node);
                        }
                        else {
                            inlineBelow.push(node);
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
            layout = new Layout(
                layout.parent,
                layout.node,
                0,
                rightAbove.length + rightBelow.length === layout.length ? NODE_ALIGNMENT.RIGHT : 0
            );
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
            }
            if (inlineBelow.length) {
                layerIndex.push(inlineBelow);
            }
            $util.spliceArray(layerIndex, item => item.length === 0);
            layout.itemCount = layerIndex.length;
            const outerVertical = inlineAbove.length === 0 && (leftSub.length === 0 || rightSub.length === 0) ? vertical : controller.containerTypeVerticalMargin;
            layout.setType(outerVertical.containerType, outerVertical.alignmentType);
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
                    const layoutGroup = new Layout(
                        layout.node,
                        floatgroup,
                        vertical.containerType,
                        vertical.alignmentType | (segments.some(seg => seg === rightSub || seg === rightAbove) ? NODE_ALIGNMENT.RIGHT : 0),
                    );
                    layoutGroup.itemCount = segments.length;
                    this.addRenderLayout(layoutGroup);
                }
            }
            else {
                segments = [item as T[]];
                floatgroup = undefined;
            }
            for (const seg of segments) {
                const basegroup = floatgroup && (seg === inlineAbove || seg === leftAbove || seg === leftBelow || seg === rightAbove || seg === rightBelow) ? floatgroup : layout.node;
                const target = controller.createNodeGroup(seg[0], seg, basegroup);
                const layoutGroup = new Layout(
                    basegroup,
                    target,
                    0,
                    seg.length < itemCount ? NODE_ALIGNMENT.SEGMENTED : 0,
                    seg
                );
                if (seg.length === 1 || layoutGroup.linearY) {
                    layoutGroup.setType(vertical.containerType, vertical.alignmentType);
                    if (seg.length === 1) {
                        target.innerChild = seg[0];
                        seg[0].outerParent = target;
                    }
                }
                else {
                    controller.processLayoutHorizontal(layoutGroup);
                }
                this.addRenderLayout(layoutGroup);
                if (seg === inlineAbove && seg.some(subitem => subitem.blockStatic && !subitem.hasWidth)) {
                    const targeted = target.of(vertical.containerType, vertical.alignmentType) ? target.children : [target];
                    if (leftAbove.length) {
                        let boundsRight = Number.NEGATIVE_INFINITY;
                        let boundsLeft = Number.POSITIVE_INFINITY;
                        for (const child of leftAbove) {
                            boundsRight = Math.max(boundsRight, child.linear.right);
                        }
                        for (const child of seg) {
                            boundsLeft = Math.min(boundsLeft, child.bounds.left);
                        }
                        for (const child of targeted) {
                            child.modifyBox(BOX_STANDARD.PADDING_LEFT, boundsRight - boundsLeft);
                        }
                    }
                    if (rightAbove.length) {
                        let boundsLeft = Number.POSITIVE_INFINITY;
                        let boundsRight = Number.NEGATIVE_INFINITY;
                        for (const child of rightAbove) {
                            boundsLeft = Math.min(boundsLeft, child.bounds.left);
                        }
                        for (const child of seg) {
                            boundsRight = Math.max(boundsRight, child.bounds.right);
                        }
                        for (const child of targeted) {
                            child.modifyBox(BOX_STANDARD.PADDING_RIGHT, boundsRight - boundsLeft);
                        }
                    }
                }
            }
        }
        return layout;
    }

    protected processFloatVertical(layout: Layout<T>, outerParent: T) {
        const controller = this.controllerHandler;
        const vertical = controller.containerTypeVertical;
        if (layout.containerType !== 0) {
            const groupWrap = controller.createNodeGroup(layout.node, [layout.node], outerParent);
            this.addRenderLayout(new Layout(
                groupWrap,
                layout.node,
                vertical.containerType,
                vertical.alignmentType,
                groupWrap.children as T[]
            ));
            layout.node = groupWrap;
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
                    layoutType.alignmentType |= NODE_ALIGNMENT.SEGMENTED;
                    this.addRenderLayout(new Layout(
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
                        if (floating.length) {
                            if (floating.length > 1) {
                                subgroup = controller.createNodeGroup(floating[0], floating, basegroup);
                                layoutGroup.add(NODE_ALIGNMENT.FLOAT);
                                if (pageFlow.length === 0 && floating.every(item => item.float === 'right')) {
                                    layoutGroup.add(NODE_ALIGNMENT.RIGHT);
                                }
                            }
                            else {
                                subgroup = floating[0];
                                subgroup.parent = basegroup;
                            }
                        }
                        if (subgroup) {
                            children.push(subgroup);
                            subgroup = undefined;
                        }
                        if (pageFlow.length) {
                            if (pageFlow.length > 1) {
                                subgroup = controller.createNodeGroup(pageFlow[0], pageFlow, basegroup);
                            }
                            else {
                                subgroup = pageFlow[0];
                                subgroup.parent = basegroup;
                            }
                        }
                        if (subgroup) {
                            children.push(subgroup);
                        }
                        basegroup.init();
                        layoutGroup.itemCount = children.length;
                        this.addRenderLayout(layoutGroup);
                        for (let node of children) {
                            if (!node.groupParent) {
                                node = controller.createNodeGroup(node, [node], basegroup);
                            }
                            this.addRenderLayout(new Layout(
                                basegroup,
                                node,
                                vertical.containerType,
                                vertical.alignmentType | NODE_ALIGNMENT.SEGMENTED,
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
        let node: T | undefined;
        if (element.nodeName === '#text') {
            if ($element.isPlainText(element, true) || $css.isParentStyle(element, 'whiteSpace', 'pre', 'pre-wrap')) {
                node = this.createNode(element, false);
                node.cssApply({
                    position: 'static',
                    display: 'inline',
                    verticalAlign: 'baseline',
                    cssFloat: 'none',
                    clear: 'none',
                });
                if (parent) {
                    node.inherit(parent, 'textStyle');
                }
            }
        }
        else if (!this.controllerHandler.localSettings.svg.enabled || element.parentElement instanceof HTMLElement) {
            this.controllerHandler.applyDefaultStyles(element);
            node = this.createNode(element, false);
            if (!node.pseudoElement) {
                if (!this.controllerHandler.localSettings.unsupported.excluded.has(element.tagName) && this.conditionElement(element)) {
                    if (!this.userSettings.exclusionsDisabled) {
                        node.setExclusions();
                    }
                }
                else {
                    node.visible = false;
                    node.excluded = true;
                }
            }
        }
        return node;
    }

    protected conditionElement(element: Element) {
        if ($css.hasComputedStyle(element)) {
            if ($dom.isElementVisible(element, true) || element.dataset.use && element.dataset.use.split($util.REGEXP_COMPILED.SEPARATOR).some(value => this.userSettings.builtInExtensions.includes(value.trim()))) {
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
                        if ($dom.isElementVisible(<Element> element.children[i], true)) {
                            return true;
                        }
                    }
                }
                return false;
            }
        }
        else {
            return $element.isPlainText(element);
        }
    }

    private createPseduoElement(element: HTMLElement, target: string) {
        const styleMap: StringMap = $dom.getElementCache(element, `styleMap::${target}`);
        if (styleMap && styleMap.content !== undefined) {
            let value: string = styleMap.content;
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
                styleMap.fontFamily = style.fontFamily as string;
            }
            if (styleMap.fontSize === undefined) {
                styleMap.fontSize = style.fontSize as string;
            }
            if (styleMap.fontWeight === undefined) {
                styleMap.fontWeight = style.fontWeight as string;
            }
            if (styleMap.color === undefined) {
                styleMap.color = style.color as string;
            }
            if (styleMap.display === undefined) {
                styleMap.display = 'inline';
            }
            let tagName = styleMap.display && styleMap.display.startsWith('inline') ? 'span' : 'div';
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
                        if (REGEXP_CACHED.CSS_CONTENT === undefined) {
                            REGEXP_CACHED.CSS_CONTENT = /\s*(?:attr\(([^)]+)\)|(counter)\(([^,)]+)(?:, ([a-z\-]+))?\)|(counters)\(([^,]+), "([^"]*)"(?:, ([a-z\-]+))?\)|"([^"]+)")\s*/g;
                        }
                        let match: RegExpExecArray | null;
                        while ((match = REGEXP_CACHED.CSS_CONTENT.exec(value)) !== null) {
                            if (match[1]) {
                                content += $css.getNamedItem(element, match[1].trim());
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
                                        const pattern = /\s*([^\-\d][^\-\d]?[^ ]*) (-?\d+)\s*/g;
                                        let counterMatch: RegExpExecArray | null;
                                        while ((counterMatch = pattern.exec(name)) !== null) {
                                            if (counterMatch[1] === counterName) {
                                                return parseInt(counterMatch[2]);
                                            }
                                        }
                                    }
                                    return undefined;
                                }
                                function getPseduoIncrement(parent: Element) {
                                    const pseduoStyle: StringMap = $dom.getElementCache(parent, `styleMap::${target}`);
                                    if (pseduoStyle && pseduoStyle.counterIncrement) {
                                        return getCounterValue(pseduoStyle.counterIncrement);
                                    }
                                    return undefined;
                                }
                                const initalValue = (getPseduoIncrement(element) || 0) + (getCounterValue(style.getPropertyValue('counter-reset')) || 0);
                                let current: Element | null = element;
                                let counter = initalValue;
                                let ascending = false;
                                let lastResetElement: Element | undefined;
                                const subcounter: number[] = [];
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
                                                let increment = getPseduoIncrement(child);
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
                                        const pesudoIncrement = getPseduoIncrement(current);
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
                        }
                    }
                    break;
            }
            if (content || value === '""') {
                const pseudoElement = $element.createElement(element, tagName, false, target === 'before' ? 0 : -1);
                if (tagName === 'img') {
                    (<HTMLImageElement> pseudoElement).src = content;
                }
                else {
                    pseudoElement.innerText = content;
                }
                for (const attr in styleMap) {
                    if (attr !== 'display') {
                        pseudoElement.style[attr] = styleMap[attr];
                    }
                }
                $dom.setElementCache(pseudoElement, 'styleMap', styleMap);
                return pseudoElement;
            }
        }
        return undefined;
    }

    private setStyleMap() {
        violation: {
            for (let i = 0; i < document.styleSheets.length; i++) {
                const item = <CSSStyleSheet> document.styleSheets[i];
                if (item.cssRules) {
                    for (let j = 0; j < item.cssRules.length; j++) {
                        const rule = item.cssRules[j];
                        try {
                            switch (rule.type) {
                                case CSSRule.STYLE_RULE:
                                    this.applyStyleRule(<CSSStyleRule> rule);
                                    break;
                                case CSSRule.MEDIA_RULE:
                                    function compareRange(operation: string, value: number, range: number) {
                                        switch (operation) {
                                            case '<=':
                                                return value <= range;
                                            case '<':
                                                return value < range;
                                            case '>=':
                                                return value >= range;
                                            case '>':
                                                return value > range;
                                            default:
                                                return value === range;
                                        }
                                    }
                                    if (REGEXP_CACHED.MEDIA_RULE === undefined) {
                                        REGEXP_CACHED.MEDIA_RULE = /(?:(not|only)?\s*(?:all|screen) and )?((?:\([^)]+\)(?: and )?)+),?\s*/g;
                                        REGEXP_CACHED.MEDIA_CONDITION = /\(([a-z\-]+)\s*(:|<?=?|=?>?)?\s*([\w.%]+)?\)(?: and )?/g;
                                    }
                                    const fontSize = $util.convertInt($css.getStyle(document.body).getPropertyValue('font-size'));
                                    let match: RegExpExecArray | null;
                                    let statement = false;
                                    while (!statement && ((match = REGEXP_CACHED.MEDIA_RULE.exec((<CSSConditionRule> rule).conditionText)) !== null)) {
                                        const negate = match[1] === 'not';
                                        let condition: RegExpExecArray | null;
                                        let valid = false;
                                        while (!statement && (condition = REGEXP_CACHED.MEDIA_CONDITION.exec(match[2])) !== null) {
                                            const attr = condition[1];
                                            let operation: string;
                                            if (condition[1].startsWith('min')) {
                                                operation = '>=';
                                            }
                                            else if (condition[1].startsWith('max')) {
                                                operation = '<=';
                                            }
                                            else {
                                                operation = match[2];
                                            }
                                            const value = condition[3];
                                            switch (attr) {
                                                case 'aspect-ratio':
                                                case 'min-aspect-ratio':
                                                case 'max-aspect-ratio':
                                                    const [width, height] = $util.replaceMap<string, number>(value.split('/'), ratio => parseInt(ratio));
                                                    valid = compareRange(operation, window.innerWidth / window.innerHeight, width / height);
                                                    break;
                                                case 'width':
                                                case 'min-width':
                                                case 'max-width':
                                                case 'height':
                                                case 'min-height':
                                                case 'max-height':
                                                    valid = compareRange(operation, attr.indexOf('width') !== -1 ? window.innerWidth : window.innerHeight, $util.parseUnit(value, fontSize));
                                                    break;
                                                case 'orientation':
                                                    valid = value === 'portrait' && window.innerWidth <= window.innerHeight || value === 'landscape' && window.innerWidth > window.innerHeight;
                                                    break;
                                                case 'resolution':
                                                case 'min-resolution':
                                                case 'max-resolution':
                                                    let resolution = parseFloat(value);
                                                    if (value.endsWith('dpcm')) {
                                                        resolution *= 2.54;
                                                    }
                                                    else if (value.endsWith('dppx') || value.endsWith('x')) {
                                                        resolution *= 96;
                                                    }
                                                    valid = compareRange(operation, $util.getDeviceDPI(), resolution);
                                                    break;
                                                case 'grid':
                                                    valid = value === '0';
                                                    break;
                                                case 'color':
                                                    valid = value === undefined || $util.convertInt(value) > 0;
                                                    break;
                                                case 'min-color':
                                                    valid = $util.convertInt(value) <= screen.colorDepth / 3;
                                                    break;
                                                case 'max-color':
                                                    valid = $util.convertInt(value) >= screen.colorDepth / 3;
                                                    break;
                                                case 'color-index':
                                                case 'min-color-index':
                                                case 'monochrome':
                                                case 'min-monochrome':
                                                    valid = value === '0';
                                                    break;
                                                case 'max-color-index':
                                                case 'max-monochrome':
                                                    valid = $util.convertInt(value) >= 0;
                                                    break;
                                                default:
                                                    valid = false;
                                                    break;
                                            }
                                            if (!valid) {
                                                break;
                                            }
                                        }
                                        if (!negate && valid || negate && !valid) {
                                            statement = true;
                                        }
                                    }
                                    if (statement) {
                                        const items = (<CSSMediaRule> rule).cssRules;
                                        for (let k = 0; k < items.length; k++) {
                                            this.applyStyleRule(<CSSStyleRule> items[k]);
                                        }
                                    }
                                    break;
                            }
                        }
                        catch (error) {
                            alert('External CSS files cannot be parsed with some browsers when loading HTML pages directly from your hard drive. ' +
                                  'Either use a local web server, embed your CSS into a <style> element, or you can also try a different browser. ' +
                                  'See the README for more detailed instructions.\n\n' +
                                  `${item.href}\n\n${error}`);
                            break violation;
                        }
                    }
                }
            }
        }
    }

    private applyStyleRule(item: CSSStyleRule) {
        const fromRule: string[] = [];
        for (const attr of Array.from(item.style)) {
            fromRule.push($util.convertCamelCase(attr));
        }
        for (const grouping of item.selectorText.split(/\s*,\s*/)) {
            const [selectorText, target] = grouping.split('::');
            document.querySelectorAll(selectorText).forEach((element: HTMLElement) => {
                const style = $css.getStyle(element, target);
                const fontSize = $util.parseUnit(style.getPropertyValue('font-size'));
                const styleMap: StringMap = {};
                for (const attr of fromRule) {
                    const value = $css.checkStyleValue(element, attr, item.style[attr], target ? undefined : style, fontSize);
                    if (value) {
                        styleMap[attr] = value;
                    }
                }
                const backgroundImage = styleMap.backgroundImage && styleMap.backgroundImage !== 'initial';
                if (this.userSettings.preloadImages && (backgroundImage || styleMap.content && styleMap.content.startsWith('url('))) {
                    const images: string[] = backgroundImage ? styleMap.backgroundImage.split($util.REGEXP_COMPILED.SEPARATOR) : [];
                    if (styleMap.content) {
                        images.push(styleMap.content);
                    }
                    for (const value of images) {
                        const uri = $css.resolveURL(value.trim());
                        if (uri !== '' && !this.session.image.has(uri)) {
                            this.session.image.set(uri, { width: 0, height: 0, uri });
                        }
                    }
                }
                const attrStyle = `styleMap${target ? '::' + target : ''}`;
                const data = $dom.getElementCache(element, attrStyle);
                if (data) {
                    Object.assign(data, styleMap);
                }
                else {
                    $dom.setElementCache(element, `style${target ? '::' + target : ''}`, style);
                    $dom.setElementCache(element, attrStyle, styleMap);
                }
            });
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

    get viewData() {
        return (<FileAsset[]> []).concat(this._views, this._includes);
    }

    get sessionData(): SessionData<NodeList<T>> {
        return { cache: this.session.cache, templates: this.viewData };
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