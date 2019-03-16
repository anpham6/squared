import { AppSession, AppProcessing, FileAsset, ImageAsset, LayoutResult, LayoutType, SessionData, UserSettings } from './@types/application';

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
const $xml = squared.lib.xml;

function prioritizeExtensions<T extends Node>(documentRoot: HTMLElement, element: HTMLElement, extensions: Extension<T>[]) {
    const tagged: string[] = [];
    let current: HTMLElement | null = element;
    while (current) {
        if (current.dataset.use) {
            for (const value of current.dataset.use.split($util.REGEXP_COMPILED.SEPARATOR)) {
                tagged.push(value.trim());
            }
        }
        if (current !== documentRoot) {
            current = current.parentElement;
        }
        else {
            break;
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

function checkPositionStatic<T extends Node>(node: T, parent?: T) {
    const previousSiblings = node.previousSiblings();
    const nextSiblings = node.nextSiblings();
    if (!previousSiblings.some(item => item.multiline || item.excluded && !item.blockStatic) && (nextSiblings.every(item => item.blockStatic || item.lineBreak || item.excluded) || parent && node.element === $dom.getLastChildElement(parent.element))) {
        node.cssApply({
            display: 'inline-block',
            verticalAlign: 'top'
        }, true);
        node.positionStatic = true;
        return true;
    }
    return false;
}

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

export default class Application<T extends Node> implements squared.base.Application<T> {
    public controllerHandler: Controller<T>;
    public resourceHandler: Resource<T>;
    public extensionManager: ExtensionManager<T>;
    public initialized = false;
    public closed = false;
    public readonly builtInExtensions: ObjectMap<Extension<T>> = {};
    public readonly extensions = new Set<Extension<T>>();
    public readonly parseElements = new Set<HTMLElement>();
    public readonly session: AppSession<T, NodeList<T>> = {
        cache: new NodeList<T>(),
        image: new Map<string, ImageAsset>(),
        renderQueue: new Map<string, string[]>(),
        excluded: new NodeList<T>(),
        targeted: new Map<string, T[]>(),
        extensionMap: new Map<number, Extension<T>[]>()
    };
    public readonly processing: AppProcessing<T, NodeList<T>> = {
        cache: new NodeList<T>(),
        depthMap: new Map<number, Map<string, string>>(),
        node: undefined,
        layout: undefined,
        excluded: new NodeList<T>()
    };

    private _renderPosition = new Map<number, { parent: T; children: T[] }>();
    private _userSettings?: UserSettings;
    private readonly _views: FileAsset[] = [];
    private readonly _includes: FileAsset[] = [];

    constructor(
        public framework: number,
        public nodeConstructor: Constructor<T>,
        controllerConstructor: Constructor<T>,
        resourceConstructor: Constructor<T>,
        extensionManagerHandler: Constructor<T>)
    {
        this.controllerHandler = (new controllerConstructor(this, this.processing.cache) as unknown) as Controller<T>;
        this.resourceHandler = (new resourceConstructor(this, this.processing.cache) as unknown) as Resource<T>;
        this.extensionManager = (new extensionManagerHandler(this, this.processing.cache) as unknown) as ExtensionManager<T>;
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
        const rendered = this.rendered;
        for (const node of rendered) {
            if (!node.hasBit('excludeProcedure', NODE_PROCEDURE.LAYOUT)) {
                node.setLayout();
            }
            if (!node.hasBit('excludeProcedure', NODE_PROCEDURE.ALIGNMENT)) {
                node.setAlignment();
            }
        }
        for (const node of rendered) {
            if (!node.hasBit('excludeProcedure', NODE_PROCEDURE.OPTIMIZATION)) {
                node.applyOptimizations();
            }
            if (!this.userSettings.customizationsDisabled && !node.hasBit('excludeProcedure', NODE_PROCEDURE.CUSTOMIZATION)) {
                node.applyCustomizations(this.userSettings.customizationsOverwritePrivilege);
            }
        }
        for (const ext of this.extensions) {
            for (const node of ext.subscribers) {
                ext.postProcedure(node);
            }
        }
        for (const node of this.rendered) {
            if (!node.hasBit('excludeResource', NODE_RESOURCE.BOX_SPACING)) {
                node.setBoxSpacing();
            }
        }
        for (const ext of this.extensions) {
            ext.afterProcedure();
        }
        this.processRenderQueue();
        const sessionData = this.sessionData;
        this.resourceHandler.finalize(sessionData);
        this.controllerHandler.finalize(sessionData);
        for (const ext of this.extensions) {
            ext.afterFinalize();
        }
        $dom.removeElementsByClassName('__css.placeholder');
        this.closed = true;
    }

    public saveAllToDisk() {
        if (this.resourceHandler.fileHandler) {
            this.resourceHandler.fileHandler.saveAllToDisk(this.sessionData);
        }
    }

    public reset() {
        this.session.cache.each(node => node.element && $dom.deleteElementCache(node.element, 'node', 'style', 'styleMap'));
        for (const element of this.parseElements) {
            element.dataset.iteration = '';
            element.dataset.layoutName = '';
        }
        this.appName = '';
        this.session.renderQueue.clear();
        this.session.image.clear();
        this.session.cache.reset();
        this.session.excluded.reset();
        this.session.targeted.clear();
        this.session.extensionMap.clear();
        this.processing.cache.reset();
        this.controllerHandler.reset();
        this.resourceHandler.reset();
        this._views.length = 0;
        this._includes.length = 0;
        this._renderPosition.clear();
        for (const ext of this.extensions) {
            ext.subscribers.clear();
        }
        this.closed = false;
    }

    public parseDocument(...elements: any[]): FunctionMap<void> {
        let __THEN: () => void;
        this.parseElements.clear();
        this.initialized = false;
        this.setStyleMap();
        if (this.appName === '' && elements.length === 0) {
            elements.push(document.body);
        }
        for (const value of elements) {
            const element = typeof value === 'string' ? document.getElementById(value) : value;
            if ($css.hasComputedStyle(element)) {
                this.parseElements.add(element);
            }
        }
        const documentRoot = this.parseElements.values().next().value;
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
            for (const element of this.parseElements) {
                if (this.appName === '') {
                    this.appName = element.id || 'untitled';
                }
                const filename = element.dataset.filename && element.dataset.filename.replace(fileExtension, '') || element.id || `document_${this.size}`;
                const iteration = parseInt(element.dataset.iteration || '0') + 1;
                element.dataset.iteration = iteration.toString();
                element.dataset.layoutName = $util.convertWord(iteration > 1 ? `${filename}_${iteration}` : filename, true);
                if (this.createCache(element)) {
                    this.setBaseLayout();
                    this.setConstraints();
                    this.setResources();
                }
            }
            for (const ext of this.extensions) {
                for (const node of ext.subscribers) {
                    ext.postParseDocument(node);
                }
            }
            for (const ext of this.extensions) {
                ext.afterParseDocument();
            }
            if (typeof __THEN === 'function') {
                __THEN.call(this);
            }
        };
        const images: HTMLImageElement[] = [];
        if (this.userSettings.preloadImages) {
            for (const element of this.parseElements) {
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
            for (const element of this.parseElements) {
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
            this.saveRenderPosition(layout.node, layout.renderPosition);
            return this.controllerHandler.renderNodeGroup(layout);
        }
    }

    public renderLayout(layout: Layout<T>) {
        const floating = $util.hasBit(layout.renderType, NODE_ALIGNMENT.FLOAT);
        let output = '';
        if (floating && $util.hasBit(layout.renderType, NODE_ALIGNMENT.HORIZONTAL)) {
            output = this.processFloatHorizontal(layout);
        }
        else if (floating && $util.hasBit(layout.renderType, NODE_ALIGNMENT.VERTICAL)) {
            output = this.processFloatVertical(layout);
        }
        else if (layout.containerType !== 0) {
            output = this.renderNode(layout);
        }
        return output;
    }

    public addLayoutFile(filename: string, content: string, pathname?: string, documentRoot = false) {
        pathname = pathname || this.controllerHandler.localSettings.layout.pathName;
        const layout: FileAsset = {
            pathname,
            filename,
            content
        };
        if (documentRoot && this._views.length && this._views[0].content === '') {
            this._views[0] = layout;
        }
        else {
            this._views.push(layout);
        }
        this.processing.layout = layout;
    }

    public addIncludeFile(filename: string, content: string) {
        this._includes.push({
            filename,
            content,
            pathname: this.controllerHandler.localSettings.layout.pathName
        });
    }

    public addRenderTemplate(parent: T, node: T, output: string, group = false) {
        if (output !== '') {
            if (group) {
                node.renderChildren.some((item: T) => {
                    for (const templates of this.processing.depthMap.values()) {
                        const key = item.renderPositionId;
                        const value = templates.get(key);
                        if (value) {
                            const indent = node.renderDepth + 1;
                            if (item.renderDepth !== indent) {
                                templates.set(key, this.controllerHandler.replaceIndent(value, indent, this.processing.cache.children));
                            }
                            return true;
                        }
                    }
                    return false;
                });
            }
            if (!this.parseElements.has(<HTMLElement> node.element)) {
                if (node.dataset.target) {
                    const target = document.getElementById(node.dataset.target);
                    if (target) {
                        parent = this.resolveTarget(node.dataset.target, node) as T;
                        if (parent === undefined) {
                            this.addRenderQueue(node.dataset.target, output);
                            node.positioned = true;
                            return;
                        }
                    }
                }
                else if (parent.dataset.target) {
                    const target = document.getElementById(parent.dataset.target);
                    if (target) {
                        const id = parent.elementId || parent.controlId;
                        this.addRenderQueue(id, output);
                        node.dataset.target = id;
                        return;
                    }
                }
            }
            const template = this.processing.depthMap.get(parent.id) || new Map<string, string>();
            template.set(node.renderPositionId, output);
            this.processing.depthMap.set(parent.id, template);
        }
    }

    public addRenderQueue(id: string, template: string) {
        const items = this.session.renderQueue.get(id) || [];
        items.push(template);
        this.session.renderQueue.set(id, items);
     }

    public addImagePreload(element: HTMLImageElement | undefined) {
        if (element && element.complete && $util.hasValue(element.src)) {
            this.session.image.set(element.src, {
                width: element.naturalWidth,
                height: element.naturalHeight,
                uri: element.src
            });
        }
    }

    public saveRenderPosition(parent: T, required: boolean) {
        if (parent.groupParent) {
            const baseParent = parent.parent as T;
            if (baseParent) {
                const mapParent = this._renderPosition.get(baseParent.id);
                let revised: T[] | undefined;
                if (mapParent) {
                    const children = $util.filterArray(mapParent.children, item => !parent.contains(item)) as T[];
                    if (parent.siblingIndex < children.length) {
                        children.splice(parent.siblingIndex, 0, parent);
                        for (let i = parent.siblingIndex + 1; i < children.length; i++) {
                            children[i].siblingIndex = i;
                        }
                        revised = children;
                    }
                    else {
                        parent.siblingIndex = children.length;
                        children.push(parent);
                    }
                    this._renderPosition.set(baseParent.id, { parent: baseParent, children });
                }
                else {
                    revised = baseParent.children as T[];
                }
                if (revised) {
                    for (let i = parent.siblingIndex + 1; i < revised.length; i++) {
                        if (revised[i]) {
                            revised[i].siblingIndex = i;
                        }
                    }
                }
            }
        }
        if (required) {
            const renderMap = this._renderPosition.get(parent.id);
            this._renderPosition.set(parent.id, {
                parent,
                children: renderMap ? $util.concatArray($util.filterArray(renderMap.children, item => !parent.contains(item)), parent.children as T[]) : parent.duplicate() as T[]
            });
        }
    }

    public createNode(element: Element) {
        return new this.nodeConstructor(this.nextId, element, this.controllerHandler.afterInsertNode);
    }

    public resolveTarget(target: string, node: T) {
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
        const nodes = this.session.targeted.get(target) || [];
        nodes.push(node);
        this.session.targeted.set(target, nodes);
        return undefined;
    }

    public toString() {
        return this._views.length ? this._views[0].content : '';
    }

    protected createCache(documentRoot: HTMLElement) {
        const elements = (() => {
            if (documentRoot === document.body) {
                for (let i = 0, j = 0; i < document.body.childNodes.length; i++) {
                    if (this.conditionElement(<Element> document.body.childNodes[i]) && ++j > 1) {
                        return document.querySelectorAll('body, body *');
                    }
                }
                return document.querySelectorAll('body *');
            }
            else {
                return documentRoot.querySelectorAll('*');
            }
        })();
        this.processing.cache.afterAppend = undefined;
        this.processing.cache.clear();
        this.processing.excluded.clear();
        this.processing.node = undefined;
        const extensions = Array.from(this.extensions);
        for (const ext of extensions) {
            ext.beforeInit(documentRoot);
        }
        const rootNode = this.insertNode(documentRoot);
        if (rootNode) {
            rootNode.parent = new this.nodeConstructor(0, documentRoot.parentElement || document.body, this.controllerHandler.afterInsertNode);
            rootNode.documentRoot = true;
            rootNode.documentParent = rootNode.parent;
            this.processing.node = rootNode;
        }
        else {
            return false;
        }
        const localSettings = this.controllerHandler.localSettings;
        elements.forEach((element: HTMLElement) => {
            if (!this.parseElements.has(element)) {
                prioritizeExtensions(documentRoot, element, extensions).some(item => item.init(element));
                if (!this.parseElements.has(element) && !(localSettings.unsupported.tagName.has(element.tagName) || element.tagName === 'INPUT' && localSettings.unsupported.tagName.has(`${element.tagName}:${(<HTMLInputElement> element).type}`))) {
                    let valid = true;
                    let current = element.parentElement;
                    while (current && current !== documentRoot) {
                        if (this.parseElements.has(current)) {
                            valid = false;
                            break;
                        }
                        current = current.parentElement;
                    }
                    if (valid) {
                        this.insertNode(element);
                    }
                }
            }
        });
        if (this.processing.cache.length) {
            for (const node of this.processing.cache) {
                if (node.htmlElement && node.tagName !== 'SELECT') {
                    let valid = false;
                    let plainText: Element[] | undefined;
                    (<HTMLElement> node.element).childNodes.forEach((element: Element) => {
                        if (element.nodeName === '#text') {
                            if (plainText === undefined) {
                                plainText = [];
                            }
                            plainText.push(element);
                        }
                        else if (element.tagName !== 'BR') {
                            const item = $dom.getElementAsNode<T>(element);
                            if (item && !item.excluded) {
                                valid = true;
                            }
                        }
                    });
                    if (valid && plainText) {
                        for (const element of plainText) {
                            this.insertNode(element, node);
                        }
                    }
                }
            }
            const preAlignment: ObjectIndex<StringMap> = {};
            const direction = new Set<HTMLElement>();
            for (const node of this.processing.cache) {
                if (node.styleElement) {
                    const element = <HTMLElement> node.element;
                    if (element.tagName !== 'BUTTON' && (<HTMLInputElement> element).type !== 'button') {
                        const textAlign = node.css('textAlign');
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
            rootNode.parent.setBounds();
            for (const node of this.processing.cache) {
                node.setBounds();
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
            }
            for (const node of this.processing.cache) {
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
                        node.parent = parent;
                        node.documentParent = parent;
                    }
                    else {
                        node.hide();
                    }
                }
            }
            const checkTargeted = this.session.targeted.size > 0;
            for (const node of this.processing.cache) {
                if (node.length) {
                    let i = 0;
                    (<HTMLElement> node.element).childNodes.forEach((element: Element) => {
                        const item = $dom.getElementAsNode<T>(element);
                        if (item && !item.excluded && (item.pageFlow || item.documentParent === node)) {
                            item.siblingIndex = i++;
                        }
                    });
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
                if (checkTargeted && node.elementId) {
                    const children = this.session.targeted.get(node.elementId);
                    if (children) {
                        for (const target of children) {
                            target.render(node);
                        }
                        this.session.targeted.delete(node.elementId);
                    }
                }
            }
            $util.sortArray(this.processing.cache.children, true, 'depth', 'id');
            for (const ext of extensions) {
                ext.afterInit(documentRoot);
            }
            return true;
        }
        return false;
    }

    protected setBaseLayout() {
        const settings = this.userSettings;
        const localSettings = this.controllerHandler.localSettings;
        const extensions: Extension<T>[] = [];
        for (const item of this.extensions) {
            if (!item.eventOnly) {
                extensions.push(item);
            }
        }
        const documentRoot = this.processing.node as T;
        const mapY = new Map<number, Map<number, T>>();
        let baseTemplate = localSettings.baseTemplate;
        let empty = true;
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
            this.processing.depthMap.clear();
            for (const parent of depth.values()) {
                if (parent.length === 0 || parent.every(node => node.rendered)) {
                    continue;
                }
                const axisY = parent.duplicate() as T[];
                const hasFloat = axisY.some(node => node.floating);
                let cleared!: Map<T, string>;
                if (hasFloat) {
                    cleared = NodeList.clearedAll(parent);
                }
                let k = -1;
                while (++k < axisY.length) {
                    let nodeY = axisY[k];
                    if (nodeY.rendered || !nodeY.visible) {
                        continue;
                    }
                    else if (nodeY.htmlElement) {
                        const element = <HTMLElement> nodeY.element;
                        if (this.parseElements.has(element) && !nodeY.documentRoot && !nodeY.documentBody) {
                            continue;
                        }
                        else if (nodeY.length === 0 && element.children.length) {
                            let valid = true;
                            for (let i = 0; i < element.children.length; i++) {
                                if (!this.parseElements.has(<HTMLElement> element.children[i])) {
                                    valid = false;
                                    break;
                                }
                            }
                            if (valid) {
                                nodeY.inlineText = false;
                            }
                        }
                    }
                    const extendable = nodeY.hasAlign(NODE_ALIGNMENT.EXTENDABLE);
                    let parentY = nodeY.parent as T;
                    let unknownParent = parentY.hasAlign(NODE_ALIGNMENT.UNKNOWN);
                    if (axisY.length > 1 && k < axisY.length - 1 && nodeY.pageFlow && (parentY.alignmentType === 0 || extendable || unknownParent) && !parentY.hasAlign(NODE_ALIGNMENT.AUTO_LAYOUT) && !nodeY.hasBit('excludeSection', APP_SECTION.DOM_TRAVERSE)) {
                        const horizontal: T[] = [];
                        const vertical: T[] = [];
                        const floatSegment = new Set<string>();
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
                            for ( ; l < axisY.length; l++, m++) {
                                const item = axisY[l];
                                if (item.pageFlow) {
                                    if (hasFloat) {
                                        const float = cleared.get(item);
                                        if (float) {
                                            if (float === 'both') {
                                                floatSegment.clear();
                                            }
                                            else {
                                                floatSegment.delete(float);
                                            }
                                        }
                                        if (item.floating) {
                                            floatSegment.add(item.float);
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
                                            const startNewRow = item.alignedVertically(previousSiblings, siblings, cleared, false);
                                            if (startNewRow || settings.floatOverlapDisabled && previous.floating && item.blockStatic && floatSegment.size === 2) {
                                                if (horizontal.length) {
                                                    if (!settings.floatOverlapDisabled && floatSegment.size && !previous.autoMargin.horizontal && cleared.get(item) !== 'both' && !previousSiblings.some(node => node.lineBreak && !cleared.has(node))) {
                                                        let floatBottom = Number.NEGATIVE_INFINITY;
                                                        $util.captureMap(horizontal, node => node.floating, node => floatBottom = Math.max(floatBottom, node.linear.bottom));
                                                        if (!item.floating || item.linear.top < floatBottom) {
                                                            const floated = NodeList.floated(horizontal);
                                                            if (cleared.has(item)) {
                                                                if (!item.floating && floatSegment.size < 2 && floated.size === 2) {
                                                                    item.alignmentType |= NODE_ALIGNMENT.EXTENDABLE;
                                                                    verticalExtended = true;
                                                                    horizontal.push(item);
                                                                    continue;
                                                                }
                                                                break domNested;
                                                            }
                                                            else if (!startNewRow || floated.size === 1 && (!item.floating || floatSegment.has(item.float))) {
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
                            const layout = new Layout(parentY, nodeY, 0, 0, horizontal.length, horizontal);
                            layout.init();
                            result = this.controllerHandler.processTraverseHorizontal(layout, axisY);
                            segEnd = horizontal[horizontal.length - 1];
                        }
                        else if (vertical.length > 1) {
                            const layout = new Layout(parentY, nodeY, 0, 0, vertical.length, vertical);
                            layout.init();
                            result = this.controllerHandler.processTraverseVertical(layout, axisY);
                            segEnd = vertical[vertical.length - 1];
                            if (!segEnd.blockStatic && segEnd !== axisY[axisY.length - 1]) {
                                segEnd.alignmentType |= NODE_ALIGNMENT.EXTENDABLE;
                            }
                        }
                        if (unknownParent && segEnd === axisY[axisY.length - 1]) {
                            parentY.alignmentType ^= NODE_ALIGNMENT.UNKNOWN;
                            unknownParent = false;
                        }
                        if (result) {
                            const output = this.renderLayout(result.layout);
                            if (output !== '') {
                                this.addRenderTemplate(parentY, result.layout.node, output, true);
                                parentY = nodeY.parent as T;
                            }
                        }
                    }
                    if (extendable) {
                        nodeY.alignmentType ^= NODE_ALIGNMENT.EXTENDABLE;
                    }
                    if (unknownParent && k === axisY.length - 1) {
                        parentY.alignmentType ^= NODE_ALIGNMENT.UNKNOWN;
                    }
                    if (nodeY.renderAs && parentY.appendTry(nodeY, nodeY.renderAs, false)) {
                        nodeY.hide();
                        nodeY = nodeY.renderAs as T;
                        if (nodeY.positioned) {
                            parentY = nodeY.parent as T;
                        }
                    }
                    const extensionDescendant = this.session.extensionMap.get(nodeY.id);
                    if (!nodeY.rendered && !nodeY.hasBit('excludeSection', APP_SECTION.EXTENSION)) {
                        let combined = parent.renderExtension ? parent.renderExtension.slice(0) : undefined;
                        if (extensionDescendant) {
                            if (combined) {
                                $util.concatArray(combined, extensionDescendant as Extension<T>[]);
                            }
                            else {
                                combined = extensionDescendant.slice(0) as Extension<T>[];
                            }
                        }
                        if (combined) {
                            let next = false;
                            for (const ext of combined) {
                                const result = ext.processChild(nodeY, parentY);
                                if (result.output) {
                                    this.addRenderTemplate(parentY, nodeY, result.output);
                                }
                                if (result.renderAs && result.outputAs) {
                                    this.addRenderTemplate(parentY, result.renderAs as T, result.outputAs);
                                }
                                if (result.parent) {
                                    parentY = result.parent as T;
                                }
                                next = result.next === true;
                                if (result.complete || next) {
                                    break;
                                }
                            }
                            if (next) {
                                continue;
                            }
                        }
                        if (nodeY.styleElement) {
                            let next = false;
                            prioritizeExtensions(<HTMLElement> documentRoot.element, <HTMLElement> nodeY.element, extensions).some(item => {
                                if (item.is(nodeY) && item.condition(nodeY, parentY) && (parent.renderExtension === undefined || !parent.renderExtension.includes(item)) && (extensionDescendant === undefined || !extensionDescendant.includes(item))) {
                                    const result = item.processNode(nodeY, parentY);
                                    if (result.output) {
                                        this.addRenderTemplate(parentY, nodeY, result.output);
                                    }
                                    if (result.renderAs && result.outputAs) {
                                        this.addRenderTemplate(parentY, result.renderAs as T, result.outputAs);
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
                                return false;
                            });
                            if (next) {
                                continue;
                            }
                        }
                    }
                    if (!nodeY.rendered && !nodeY.hasBit('excludeSection', APP_SECTION.RENDER)) {
                        let layout = new Layout(
                            parentY,
                            nodeY,
                            nodeY.containerType,
                            nodeY.alignmentType,
                            nodeY.length,
                            nodeY.children as T[]
                        );
                        if (layout.containerType === 0) {
                            const result = nodeY.length ? this.controllerHandler.processUnknownParent(layout) : this.controllerHandler.processUnknownChild(layout);
                            if (result.next === true) {
                                continue;
                            }
                            else if (result.renderAs) {
                                axisY[k] = result.renderAs as T;
                                k--;
                                continue;
                            }
                            else {
                                layout = result.layout;
                            }
                        }
                        const output = this.renderLayout(layout);
                        if (output !== '') {
                            this.addRenderTemplate(parentY, nodeY, output);
                        }
                    }
                }
            }
            for (const [id, templates] of this.processing.depthMap.entries()) {
                const position = this._renderPosition.get(id);
                let children: T[] | undefined;
                if (position) {
                    children = this.controllerHandler.sortRenderPosition(position.parent, position.children);
                }
                else if (id !== 0) {
                    const parent = this.processing.cache.find('id', id);
                    if (parent) {
                        children = this.controllerHandler.sortRenderPosition(parent, parent.children as T[]);
                    }
                }
                if (children && children.length) {
                    const sorted = new Map<string, string>();
                    for (const node of children) {
                        const positionId = node.renderPositionId;
                        const template = templates.get(positionId) || node.companion && templates.get(node.companion.renderPositionId);
                        if (template) {
                            sorted.set(positionId, template);
                        }
                    }
                    if (sorted.size === templates.size) {
                        this.processing.depthMap.set(id, sorted);
                    }
                }
            }
            for (const ext of this.extensions) {
                ext.afterDepthLevel();
            }
            for (const [id, templates] of this.processing.depthMap.entries()) {
                for (const [key, view] of templates.entries()) {
                    const hash = $xml.formatPlaceholder(key.indexOf('^') !== -1 ? key : id);
                    if (baseTemplate.indexOf(hash) !== -1) {
                        baseTemplate = $xml.replacePlaceholder(baseTemplate, hash, view);
                        empty = false;
                    }
                    else {
                        this.addRenderQueue(key.indexOf('^') !== -1 ? `${id}|${key}` : id.toString(), view);
                    }
                }
            }
        }
        if (documentRoot.dataset.layoutName && (!documentRoot.dataset.target || documentRoot.renderExtension === undefined)) {
            this.addLayoutFile(
                documentRoot.dataset.layoutName,
                empty ? '' : baseTemplate,
                $util.trimString($util.trimNull(documentRoot.dataset.pathname), '/'),
                documentRoot.renderExtension && documentRoot.renderExtension.some(item => item.documentRoot)
            );
        }
        if (empty && documentRoot.renderExtension === undefined) {
            documentRoot.hide();
        }
        this.processing.cache.sort((a, b) => {
            if (!a.visible || !a.rendered) {
                return 1;
            }
            else if (a.renderDepth !== b.renderDepth) {
                return a.renderDepth < b.renderDepth ? -1 : 1;
            }
            else if (a.renderParent !== b.renderParent) {
                return a.documentParent.id < b.documentParent.id ? -1 : 1;
            }
            return a.siblingIndex < b.siblingIndex ? -1 : 1;
        });
        this.session.cache.concat(this.processing.cache.children);
        this.session.excluded.concat(this.processing.excluded.children);
        for (const ext of this.extensions) {
            for (const node of ext.subscribers) {
                ext.postBaseLayout(node);
            }
        }
        for (const ext of this.extensions) {
            ext.afterBaseLayout();
        }
    }

    protected setConstraints() {
        this.controllerHandler.setConstraints();
        for (const ext of this.extensions) {
            for (const node of ext.subscribers) {
                ext.postConstraints(node);
            }
        }
        for (const ext of this.extensions) {
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

    protected processRenderQueue() {
        const template: StringMap = {};
        for (const [id, templates] of this.session.renderQueue.entries()) {
            const [parentId, positionId] = id.split('|');
            let replaceId = parentId;
            if (!$util.isNumber(replaceId)) {
                const element = document.getElementById(replaceId);
                if (element) {
                    const target = $dom.getElementAsNode<T>(element);
                    if (target) {
                        replaceId = target.id.toString();
                    }
                }
            }
            let output = templates.join('\n');
            if (replaceId !== parentId) {
                const target = this.session.cache.find('id', parseInt(replaceId));
                if (target) {
                    output = this.controllerHandler.replaceIndent(output, target.renderDepth + 1, this.session.cache.children);
                }
            }
            template[positionId || replaceId] = output;
        }
        for (const view of this.viewData) {
            for (const id in template) {
                view.content = view.content.replace($xml.formatPlaceholder(id), template[id]);
            }
            view.content = this.controllerHandler.replaceRenderQueue(view.content);
        }
    }

    protected processFloatHorizontal(data: Layout<T>) {
        const settings = this.userSettings;
        let layerIndex: Array<T[] | T[][]> = [];
        let output = '';
        if (data.cleared.size === 0 && !data.some(node => node.autoMargin.horizontal)) {
            const inline: T[] = [];
            const left: T[] = [];
            const right: T[] = [];
            for (const node of data) {
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
            const layout = new Layout(
                data.parent,
                data.node,
                0,
                0,
                data.itemCount,
                data.children
            );
            layout.init();
            if (inline.length === layout.itemCount || left.length === layout.itemCount || right.length === layout.itemCount) {
                this.controllerHandler.processLayoutHorizontal(layout);
                return this.renderNode(layout);
            }
            else if ((left.length === 0 || right.length === 0) && (this.userSettings.floatOverlapDisabled || !inline.some(item => item.blockStatic))) {
                const subgroup: T[] = [];
                if (right.length === 0) {
                    $util.concatMultiArray(subgroup, left, inline);
                    const horizontal = this.controllerHandler.containerTypeHorizontal;
                    layout.setType(horizontal.containerType, horizontal.alignmentType);
                    layerIndex = [left, inline];
                }
                else {
                    $util.concatMultiArray(subgroup, inline, right);
                    const vertical = this.controllerHandler.containerTypeVerticalMargin;
                    layout.setType(vertical.containerType, vertical.alignmentType);
                    layerIndex = [inline, right];
                }
                layout.retain(subgroup);
                output = this.renderNode(layout);
            }
        }
        const inlineAbove: T[] = [];
        const inlineBelow: T[] = [];
        const leftAbove: T[] = [];
        const rightAbove: T[] = [];
        const leftBelow: T[] = [];
        const rightBelow: T[] = [];
        let leftSub: T[] | T[][] = [];
        let rightSub: T[] | T[][] = [];
        if (layerIndex.length === 0) {
            let current = '';
            let pendingFloat = 0;
            for (let i = 0; i < data.length; i++) {
                const node = data.item(i) as T;
                const direction = data.cleared.get(node);
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
                        if (!settings.floatOverlapDisabled && current !== 'right' && rightAbove.length) {
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
                        if (!settings.floatOverlapDisabled && current !== 'left' && leftAbove.length) {
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
            const layout = new Layout(
                data.parent,
                data.node,
                0,
                rightAbove.length + rightBelow.length === data.length ? NODE_ALIGNMENT.RIGHT : 0
            );
            if (settings.floatOverlapDisabled) {
                if (data.node.groupParent && data.parent.layoutVertical) {
                    data.node.alignmentType |= layout.alignmentType;
                    output = $xml.formatPlaceholder(data.node.id);
                    data.node.render(data.parent);
                    data.node.renderDepth--;
                }
                else {
                    const vertical = this.controllerHandler.containerTypeVertical;
                    layout.setType(vertical.containerType, vertical.alignmentType);
                    output = this.renderNode(layout);
                }
                if (inlineAbove.length) {
                    layerIndex.push(inlineAbove);
                }
                if (leftAbove.length || rightAbove.length) {
                    layerIndex.push([leftAbove, rightAbove]);
                }
                if (leftBelow.length || rightBelow.length) {
                    layerIndex.push([leftBelow, rightBelow]);
                }
                if (inlineBelow.length) {
                    layerIndex.push(inlineBelow);
                }
                layout.itemCount = layerIndex.length;
            }
            else {
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
                $util.spliceArray(layerIndex, item => item.length === 0);
                layout.itemCount = layerIndex.length;
                const vertical = inlineAbove.length === 0 && (leftSub.length === 0 || rightSub.length === 0) ? this.controllerHandler.containerTypeVertical : this.controllerHandler.containerTypeVerticalMargin;
                layout.setType(vertical.containerType, vertical.alignmentType);
                output = this.renderNode(layout);
            }
        }
        if (layerIndex.length) {
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
                    floatgroup = this.controllerHandler.createNodeGroup(grouping[0], grouping, data.node);
                    const layout = new Layout(
                        data.node,
                        floatgroup,
                        0,
                        segments.some(seg => seg === rightSub || seg === rightAbove) ? NODE_ALIGNMENT.RIGHT : 0,
                        segments.length
                    );
                    let vertical: LayoutType | undefined;
                    if (settings.floatOverlapDisabled) {
                        vertical = this.controllerHandler.containerTypeVerticalMargin;
                    }
                    else {
                        if (data.node.layoutVertical) {
                            floatgroup = data.node;
                        }
                        else {
                            vertical = this.controllerHandler.containerTypeVertical;
                        }
                    }
                    if (vertical) {
                        layout.setType(vertical.containerType, vertical.alignmentType);
                        output = $xml.replacePlaceholder(output, data.node.id, this.renderNode(layout));
                    }
                }
                else {
                    segments = [item as T[]];
                    floatgroup = undefined;
                }
                for (const seg of segments) {
                    const basegroup = floatgroup && (seg === inlineAbove || seg === leftAbove || seg === leftBelow || seg === rightAbove || seg === rightBelow) ? floatgroup : data.node;
                    let target: T | undefined;
                    if (seg.length > 1) {
                        target = this.controllerHandler.createNodeGroup(seg[0], seg, basegroup);
                        const layout = new Layout(
                            basegroup,
                            target,
                            0,
                            NODE_ALIGNMENT.SEGMENTED,
                            seg.length,
                            seg
                        );
                        if (layout.linearY) {
                            const vertical = this.controllerHandler.containerTypeVertical;
                            layout.setType(vertical.containerType, vertical.alignmentType);
                        }
                        else {
                            layout.init();
                            this.controllerHandler.processLayoutHorizontal(layout);
                        }
                        output = $xml.replacePlaceholder(output, basegroup.id, this.renderNode(layout));
                    }
                    else {
                        target = seg[0];
                        target.alignmentType |= NODE_ALIGNMENT.SINGLE;
                        target.renderPosition = i;
                        output = $xml.replacePlaceholder(output, basegroup.id, $xml.formatPlaceholder(target.renderPositionId));
                    }
                    if (!settings.floatOverlapDisabled && target && seg === inlineAbove && seg.some(subitem => subitem.blockStatic && !subitem.hasWidth)) {
                        const vertical = this.controllerHandler.containerTypeVertical;
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
        }
        return output;
    }

    protected processFloatVertical(data: Layout<T>) {
        const controller = this.controllerHandler;
        const vertical = controller.containerTypeVertical;
        const group = data.node;
        const layoutGroup = new Layout(
            data.parent,
            group,
            vertical.containerType,
            vertical.alignmentType,
            data.length
        );
        let output = this.renderNode(layoutGroup);
        const staticRows: T[][] = [];
        const floatedRows: Null<T[]>[] = [];
        const current: T[] = [];
        const floated: T[] = [];
        let clearReset = false;
        let blockArea = false;
        let layoutVertical = true;
        for (const node of data) {
            if (node.blockStatic && floated.length === 0) {
                current.push(node);
                blockArea = true;
            }
            else {
                if (data.cleared.has(node)) {
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
                    if (clearReset && !data.cleared.has(node)) {
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
            let xml = '';
            for (let i = 0; i < Math.max(floatedRows.length, staticRows.length); i++) {
                const pageFlow = staticRows[i] || [];
                if (floatedRows[i] === null && pageFlow.length) {
                    if (pageFlow.length > 1) {
                        const layoutType = controller.containerTypeVertical;
                        layoutType.alignmentType |= NODE_ALIGNMENT.SEGMENTED;
                        const layout = new Layout(
                            group,
                            controller.createNodeGroup(pageFlow[0], pageFlow, group),
                            layoutType.containerType,
                            layoutType.alignmentType,
                            pageFlow.length,
                            pageFlow
                        );
                        xml += this.renderNode(layout);
                    }
                    else {
                        const single = pageFlow[0];
                        single.alignmentType |= NODE_ALIGNMENT.SINGLE;
                        single.renderPosition = i;
                        output = $xml.replacePlaceholder(output, group.id, $xml.formatPlaceholder(single.renderPositionId));
                    }
                }
                else {
                    const floating = floatedRows[i] || [];
                    if (pageFlow.length || floating.length) {
                        const basegroup = controller.createNodeGroup(floating[0] || pageFlow[0], [], group);
                        const verticalMargin = controller.containerTypeVerticalMargin;
                        const layout = new Layout(
                            group,
                            basegroup,
                            verticalMargin.containerType,
                            verticalMargin.alignmentType
                        );
                        const children: T[] = [];
                        let subgroup: T | undefined;
                        if (floating.length) {
                            if (floating.length > 1) {
                                subgroup = controller.createNodeGroup(floating[0], floating, basegroup);
                                layout.add(NODE_ALIGNMENT.FLOAT);
                                if (pageFlow.length === 0 && floating.every(item => item.float === 'right')) {
                                    layout.add(NODE_ALIGNMENT.RIGHT);
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
                        layout.itemCount = children.length;
                        xml += this.renderNode(layout);
                        for (const node of children) {
                            if (data.contains(node) || node.length === 0) {
                                xml = $xml.replacePlaceholder(xml, basegroup.id, $xml.formatPlaceholder(node.id));
                            }
                            else {
                                const layoutSegment = new Layout(
                                    basegroup,
                                    node,
                                    vertical.containerType,
                                    vertical.alignmentType | NODE_ALIGNMENT.SEGMENTED,
                                    node.length,
                                    node.children as T[]
                                );
                                xml = $xml.replacePlaceholder(xml, basegroup.id, this.renderNode(layoutSegment));
                            }
                        }
                    }
                }
            }
            output = $xml.replacePlaceholder(output, group.id, xml);
        }
        return output;
    }

    protected insertNode(element: Element, parent?: T) {
        let node: T | undefined;
        this.controllerHandler.applyDefaultStyles(element);
        if (element.nodeName.charAt(0) === '#' && element.nodeName === '#text') {
            if ($element.isPlainText(element, true) || $css.isParentStyle(element, 'whiteSpace', 'pre', 'pre-wrap')) {
                node = this.createNode(element);
                if (parent) {
                    node.inherit(parent, 'textStyle');
                }
                else {
                    node.css('whiteSpace', $css.getStyle(element.parentElement).whiteSpace || 'normal');
                }
                node.cssApply({
                    position: 'static',
                    display: 'inline',
                    verticalAlign: 'baseline',
                    cssFloat: 'none',
                    clear: 'none',
                });
            }
        }
        else if (!this.controllerHandler.localSettings.svg.enabled || element.parentElement instanceof HTMLElement) {
            node = this.createNode(element);
            if (!this.controllerHandler.localSettings.unsupported.excluded.has(element.tagName) && this.conditionElement(element)) {
                if (!this.userSettings.exclusionsDisabled) {
                    node.setExclusions();
                }
            }
            else {
                node.visible = false;
                node.excluded = true;
                this.processing.excluded.append(node);
                return undefined;
            }
        }
        if (node) {
            this.processing.cache.append(node);
        }
        return node;
    }

    protected conditionElement(element: Element) {
        if ($css.hasComputedStyle(element)) {
            if ($dom.isElementVisible(element, true) || element.dataset.use) {
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
                                    const patternA = /(?:(not|only)?\s*(?:all|screen) and )?((?:\([^)]+\)(?: and )?)+),?\s*/g;
                                    let matchA: RegExpExecArray | null;
                                    let statement = false;
                                    while (!statement && ((matchA = patternA.exec((<CSSConditionRule> rule).conditionText)) !== null)) {
                                        const negate = matchA[1] === 'not';
                                        const patternB = /\(([a-z\-]+)\s*(:|<?=?|=?>?)?\s*([\w.%]+)?\)(?: and )?/g;
                                        let matchB: RegExpExecArray | null;
                                        let valid = false;
                                        while (!statement && (matchB = patternB.exec(matchA[2])) !== null) {
                                            const attr = matchB[1];
                                            let operation: string;
                                            if (matchB[1].startsWith('min')) {
                                                operation = '>=';
                                            }
                                            else if (matchB[1].startsWith('max')) {
                                                operation = '<=';
                                            }
                                            else {
                                                operation = matchA[2];
                                            }
                                            const value = matchB[3];
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
                                                    valid = compareRange(operation, attr.indexOf('width') !== -1 ? window.innerWidth : window.innerHeight, $util.parseUnit(value, $util.convertInt($css.getStyle(document.body).fontSize as string)));
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
        document.querySelectorAll(item.selectorText).forEach((element: HTMLElement) => {
            const style = $css.getStyle(element);
            const fontSize = $util.parseUnit(style.fontSize as string);
            const styleMap: StringMap = {};
            for (const attr of fromRule) {
                const value = $css.checkStyleValue(element, attr, item.style[attr], style, fontSize);
                if (value) {
                    styleMap[attr] = value;
                }
            }
            if (this.userSettings.preloadImages && styleMap.backgroundImage && styleMap.backgroundImage !== 'initial') {
                for (const value of styleMap.backgroundImage.split($util.REGEXP_COMPILED.SEPARATOR)) {
                    const uri = $css.resolveURL(value.trim());
                    if (uri !== '' && !this.session.image.has(uri)) {
                        this.session.image.set(uri, { width: 0, height: 0, uri });
                    }
                }
            }
            const data = $dom.getElementCache(element, 'styleMap');
            if (data) {
                Object.assign(data, styleMap);
            }
            else {
                $dom.setElementCache(element, 'style', style);
                $dom.setElementCache(element, 'styleMap', styleMap);
            }
        });
    }

    set appName(value) {
        if (this.resourceHandler.fileHandler) {
            this.resourceHandler.fileHandler.appName = value;
        }
    }
    get appName() {
        return this.resourceHandler.fileHandler ? this.resourceHandler.fileHandler.appName : '';
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

    get size() {
        return this._views.length + this._includes.length;
    }
}