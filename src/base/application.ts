import CSS_TRAITS = squared.lib.constant.CSS_TRAITS;
import USER_AGENT = squared.lib.constant.USER_AGENT;

import type Controller from './controller';
import type Resource from './resource';
import type Extension from './extension';
import type ExtensionManager from './extensionmanager';
import type Node from './node';

import NodeList from './nodelist';

type FileActionOptions = squared.FileActionOptions;
type PreloadItem = HTMLImageElement | string;
type SessionThreadData<T extends Node> = [Set<HTMLElement>, squared.base.AppProcessing<T>, Set<HTMLElement | ShadowRoot>, Undef<string[]>];

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
const CSS_SHORTHANDNONE = getPropertiesAsTraits(CSS_TRAITS.SHORTHAND | CSS_TRAITS.NONE);

export default abstract class Application<T extends Node> implements squared.base.Application<T> {
    public static readonly KEY_NAME = 'squared.base.application';

    public static prioritizeExtensions<U extends Node>(value: string, extensions: Extension<U>[]) {
        const included = value.trim().split(/\s*,\s*/);
        const result: Extension<U>[] = [];
        const untagged: Extension<U>[] = [];
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

    public extensions: Extension<T>[] = [];
    public closed = false;
    public builtInExtensions!: Map<string, Extension<T>>;
    public elementMap = new WeakMap<Element, T>();
    public readonly Node: Constructor<T>;
    public readonly session: squared.base.AppSession<T> = {
        active: new Map<string, squared.base.AppProcessing<T>>()
    };
    public abstract userSettings: UserSettings;
    public abstract readonly systemName: string;

    protected readonly _afterInsertNode: BindGeneric<T, void>;
    protected readonly _includeElement: (element: HTMLElement) => boolean;
    protected readonly _preventNodeCascade: (node: T) => boolean;

    private _nextId = 0;
    private readonly _controllerHandler: Controller<T>;
    private readonly _resourceHandler: Null<Resource<T>> = null;
    private readonly _extensionManager: Null<ExtensionManager<T>> = null;

    constructor(
        public readonly framework: number,
        nodeConstructor: Constructor<T>,
        ControllerConstructor: Constructor<Controller<T>>,
        ExtensionManagerConstructor?: Constructor<ExtensionManager<T>>,
        ResourceConstructor?: Constructor<Resource<T>>)
    {
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

    public abstract init(): void;
    public abstract insertNode(element: Element, sessionId: string): Undef<T>;

    public finalize() { return true; }

    public afterCreateCache(node: T) {
        if (this.userSettings.createElementMap) {
            const elementMap = this.elementMap;
            this.getProcessingCache(node.sessionId).each(item => elementMap.set(item.element as Element, item));
        }
    }

    public createNode(sessionId: string, options: CreateNodeOptions) {
        return this.createNodeStatic(sessionId, options.element);
    }

    public createNodeStatic(sessionId: string, element?: Element) {
        const afterInsertNode = this.getProcessing(sessionId)!.afterInsertNode;
        const node = new this.Node(this.nextId, sessionId, element);
        this._afterInsertNode(node);
        if (afterInsertNode) {
            afterInsertNode.some(item => item.afterInsertNode!(node));
        }
        return node;
    }

    public copyTo(directory: string, options?: FileActionOptions) {
        return this.fileHandler?.copyTo(directory, options) || reject(OPERATION_NOT_SUPPORTED);
    }

    public appendTo(pathname: string, options?: FileActionOptions) {
        return this.fileHandler?.appendTo(pathname, options) || reject(OPERATION_NOT_SUPPORTED);
    }

    public saveAs(filename?: string, options?: FileActionOptions) {
        return this.fileHandler?.saveAs(filename || this.resourceHandler!.userSettings.outputArchiveName, options) || reject(OPERATION_NOT_SUPPORTED);
    }

    public saveFiles(format: string, options: FileActionOptions) {
        return this.fileHandler?.saveFiles(format, options) || reject(OPERATION_NOT_SUPPORTED);
    }

    public appendFiles(filename: string, options: FileActionOptions) {
        return this.fileHandler?.appendFiles(filename, options) || reject(OPERATION_NOT_SUPPORTED);
    }

    public copyFiles(directory: string, options: FileActionOptions) {
        return this.fileHandler?.copyFiles(directory, options) || reject(OPERATION_NOT_SUPPORTED);
    }

    public reset() {
        this._nextId = 0;
        this.elementMap = new WeakMap();
        resetSessionAll();
        this.session.active.clear();
        this.controllerHandler.reset();
        this.resourceHandler?.reset();
        for (const ext of this.extensions) {
            ext.reset();
        }
        this.closed = false;
    }

    public parseDocument(...elements: (string | HTMLElement)[]) {
        const resource = this.resourceHandler;
        let preloadImages: Undef<boolean>,
            preloadFonts: Undef<boolean>,
            preloadCustomElements = true;
        if (resource) {
            ({ preloadImages, preloadFonts, preloadCustomElements } = resource.userSettings);
        }
        const [rootElements, processing, shadowElements, styleSheets] = this.createSessionThread(elements, this.userSettings.pierceShadowRoot && preloadCustomElements);
        if (rootElements.size === 0) {
            return reject(DOCUMENT_ROOT_NOT_FOUND);
        }
        const documentRoot: HTMLElement = rootElements.values().next().value;
        const preloadItems: PreloadItem[] = [];
        let preloaded: Undef<HTMLImageElement[]>;
        const parseSrcSet = (value: string) => {
            if (value) {
                for (const uri of value.split(',')) {
                    resource!.addImageData(resolvePath(splitPairStart(uri.trim(), ' ')));
                }
            }
        };
        if (resource) {
            for (const element of shadowElements) {
                element.querySelectorAll('picture > source').forEach((source: HTMLSourceElement) => parseSrcSet(source.srcset));
                element.querySelectorAll('video').forEach((source: HTMLVideoElement) => resource.addImageData(source.poster));
                element.querySelectorAll('input[type=image]').forEach((image: HTMLInputElement) => resource.addImageData(image.src, image.width, image.height));
                element.querySelectorAll('object, embed').forEach((source: HTMLObjectElement & HTMLEmbedElement) => {
                    const src = source.data || source.src;
                    if (src && (source.type.startsWith('image/') || parseMimeType(src).startsWith('image/'))) {
                        resource.addImageData(src.trim());
                    }
                });
                element.querySelectorAll('svg use').forEach((use: SVGUseElement) => {
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
            const { image, rawData } = resource!.mapOfAssets;
            for (const item of image.values()) {
                const uri = item.uri!;
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
            for (const item of resource!.mapOfAssets.fonts.values()) {
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
                element.querySelectorAll('img').forEach((image: HTMLImageElement) => {
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
                            .then(async result => {
                                const mimeType = result.headers.get('content-type') || '';
                                if (mimeType.startsWith('text/css') || styleSheets && styleSheets.includes(item)) {
                                    success({ mimeType: 'text/css', encoding: 'utf8', data: await result.text() } as RawDataOptions);
                                }
                                else if (mimeType.startsWith('image/svg+xml') || FILE.SVG.test(item)) {
                                    success({ mimeType: 'image/svg+xml', encoding: 'utf8', data: await result.text() } as RawDataOptions);
                                }
                                else {
                                    success({ mimeType: result.headers.get('content-type') || 'font/' + (splitPair(item, '.', false, true)[1].toLowerCase() || 'ttf'), data: await result.arrayBuffer() } as RawDataOptions);
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
            .then((result: (Null<HTMLImageElement | RawDataOptions>)[]) => {
                for (let i = 0, length = result.length; i < length; ++i) {
                    if (result[i]) {
                        const item = preloadItems[i];
                        if (typeof item === 'string') {
                            resource!.addRawData(item, '', result[i] as RawDataOptions);
                        }
                        else {
                            resource!.addImage(item);
                        }
                    }
                }
                return this.resumeSessionThread(rootElements, processing, elements.length, documentRoot, preloaded);
            })
            .catch((error: Error | Event | HTMLImageElement) => {
                let message: Undef<string>;
                if (error instanceof Error) {
                    message = error.message;
                }
                else {
                    if (error instanceof Event) {
                        error = error.target as HTMLImageElement;
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

    public parseDocumentSync(...elements: (string | HTMLElement)[]): Undef<T | T[]> {
        const sessionData = this.createSessionThread(elements, false);
        return this.resumeSessionThread(sessionData[0], sessionData[1], elements.length);
    }

    public createCache(documentRoot: HTMLElement, sessionId: string) {
        const node = this.createRootNode(documentRoot, sessionId);
        if (node) {
            this.controllerHandler.sortInitialCache(this.getProcessingCache(sessionId));
        }
        return node;
    }

    public setStyleMap(sessionId: string, documentRoot: DocumentRoot = document, queryRoot?: DocumentQueryRoot) {
        const styleSheets = documentRoot.styleSheets;
        let errors: Undef<string[]>;
        for (let i = 0, length = styleSheets.length; i < length; ++i) {
            const styleSheet = styleSheets[i];
            let mediaText: Undef<string>;
            try {
                mediaText = styleSheet.media.mediaText;
            }
            catch {
            }
            if (!mediaText || checkMediaRule(mediaText)) {
                try {
                    this.applyStyleSheet(styleSheet, sessionId, documentRoot, queryRoot);
                }
                catch (err) {
                    (errors ||= []).push((err as Error).message);
                }
            }
        }
        if (errors) {
            (this.userSettings.showErrorMessages ? alert : console.log)(CSS_CANNOT_BE_PARSED + '\n\n' + errors.join('\n\n'));
        }
    }

    public replaceShadowRootSlots(shadowRoot: ShadowRoot) {
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

    public setExtensions(namespaces: string[] = this.userSettings.builtInExtensions) {
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

    public getProcessing(sessionId: string) {
        return this.session.active.get(sessionId);
    }

    public getProcessingCache(sessionId: string): NodeList<T> {
        const processing = this.session.active.get(sessionId);
        return processing ? processing.cache : new NodeList();
    }

    public getDatasetName(attr: string, element: DocumentElement) {
        return element.dataset[attr + capitalize(this.systemName)] || element.dataset[attr];
    }

    public setDatasetName(attr: string, element: DocumentElement, value: string) {
        element.dataset[attr + capitalize(this.systemName)] = value;
    }

    public toString() {
        return this.systemName;
    }

    protected createRootNode(rootElement: HTMLElement, sessionId: string) {
        const processing = this.getProcessing(sessionId)!;
        const extensions = processing.extensions.filter(item => !!item.beforeInsertNode) as Extension<T>[];
        const node = this.cascadeParentNode(processing, rootElement, sessionId, 0, extensions.length ? extensions : null);
        if (node) {
            node.documentRoot = true;
            processing.node = node;
            if (rootElement === document.documentElement) {
                processing.documentElement = node;
            }
            else {
                let previousNode = node,
                    currentElement = rootElement.parentElement,
                    id = 0,
                    depth = -1;
                while (currentElement) {
                    const previousElement = previousNode.element!;
                    const children = currentElement.children;
                    const length = children.length;
                    const elements: T[] = new Array(length);
                    const parent = new this.Node(id--, sessionId, currentElement, [previousNode]);
                    this._afterInsertNode(parent);
                    for (let i = 0; i < length; ++i) {
                        const element = children[i] as HTMLElement;
                        let child: T;
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

    protected cascadeParentNode(processing: squared.base.AppProcessing<T>, parentElement: HTMLElement, sessionId: string, depth: number, extensions: Null<Extension<T>[]>, shadowParent?: Null<ShadowRoot>) {
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
            const children: T[] = [];
            const elements: T[] = [];
            const pierceShadowRoot = this.userSettings.pierceShadowRoot;
            let inlineText = true,
                plainText = false,
                j = 0;
            for (let i = 0; i < length; ++i) {
                const element = childNodes[i] as HTMLElement;
                let child: Undef<T>;
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
                        (use ? Application.prioritizeExtensions(use, extensions) : extensions).some(item => item.beforeInsertNode!(element, sessionId));
                    }
                    let shadowRoot: UndefNull<ShadowRoot>;
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

    protected visibleText(node: T, element: Element) {
        return element.nodeName === '#text' && (!isEmptyString(element.textContent!) || node.preserveWhiteSpace && (node.tagName !== 'PRE' || node.element!.childElementCount === 0));
    }

    protected createQueryMap(elements: T[]) {
        const result: T[][] = [elements];
        for (let i = 0, length = elements.length; i < length; ++i) {
            const childMap = elements[i].queryMap;
            if (childMap) {
                for (let j = 0, k = 1, q = childMap.length; j < q; ++j, ++k) {
                    const items = result[k];
                    if (items) {
                        items.push(...childMap[j] as T[]);
                    }
                    else if (q === 1) {
                        result[k] = childMap[j] as T[];
                    }
                    else {
                        result[k] = childMap[j].slice(0) as T[];
                    }
                }
            }
        }
        return result;
    }

    private applyStyleRule(item: CSSStyleRule, sessionId: string, documentRoot: DocumentRoot, queryRoot?: DocumentQueryRoot) {
        const resource = this.resourceHandler;
        const styleSheetHref = item.parentStyleSheet?.href || location.href;
        const cssText = item.cssText;
        switch (item.type) {
            case CSSRule.STYLE_RULE: {
                const hostElement = (documentRoot as ShadowRoot).host as Undef<Element>;
                const unusedStyles = !hostElement && this.session.unusedStyles;
                const baseMap: CssStyleMap = {};
                const important: ObjectMap<boolean> = {};
                const cssStyle = item.style;
                const parseImageUrl = (attr: CssStyleAttr) => {
                    const value = baseMap[attr];
                    if (value && value !== 'initial') {
                        let result: Undef<string>,
                            match: Null<RegExpExecArray>;
                        while (match = REGEXP_DATAURI.exec(value)) {
                            if (match[2]) {
                                if (resource) {
                                    const [mimeType, encoding] = match[2].trim().split(/\s*;\s*/);
                                    resource.addRawData(match[1], match[3], { mimeType, encoding });
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
                const hasExactValue = (attr: CssStyleAttr, value: string) => new RegExp(`\\s*${attr}\\s*:\\s*${value}\\s*;?`).test(cssText);
                const hasPartialValue = (attr: CssStyleAttr, value: string) => new RegExp(`\\s*${attr}\\s*:[^;]*?${value}[^;]*;?`).test(cssText);
                const items = Array.from(cssStyle);
                for (let i = 0, length = items.length; i < length; ++i) {
                    const attr = items[i] as CssStyleAttr;
                    if (attr[0] === '-') {
                        continue;
                    }
                    const baseAttr = convertCamelCase(attr);
                    let value: string = cssStyle[attr];
                    switch (value) {
                        case 'initial':
                            if (isUserAgent(USER_AGENT.SAFARI) && baseAttr.startsWith('background')) {
                                break;
                            }
                            if (CSS_PROPERTIES[baseAttr]?.value === 'auto') {
                                value = 'auto';
                                break;
                            }
                        case 'normal':
                            if (!hasExactValue(attr, value)) {
                                required: {
                                    for (const name in CSS_SHORTHANDNONE) {
                                        const css = CSS_SHORTHANDNONE[name];
                                        if ((css.value as string[]).includes(baseAttr)) {
                                            if (hasExactValue(css.name as CssStyleAttr, 'none|initial') || value === 'initial' && hasPartialValue(css.name as CssStyleAttr, 'initial') || css.valueOfNone && hasExactValue(css.name as CssStyleAttr, css.valueOfNone)) {
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
                let match: Null<RegExpExecArray>;
                while (match = REGEXP_IMPORTANT.exec(cssText)) {
                    const attr = convertCamelCase(match[1]) as CssStyleAttr;
                    const value = CSS_PROPERTIES[attr]?.value;
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
                    let elements: ArrayLike<Element>;
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
                        const styleData = getElementCache<CssStyleMap>(element, attrStyle, sessionId);
                        if (styleData) {
                            const specificityData = getElementCache<ObjectMap<number>>(element, attrSpecificity, sessionId)!;
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
                            const styleMap = { ...baseMap };
                            const specificityData: ObjectMap<number> = {};
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
                    const attr = REGEXP_FONTFACE.exec(cssText)?.[1];
                    if (attr) {
                        const src = REGEXP_FONTSRC.exec(attr)?.[1].trim();
                        let fontFamily = REGEXP_FONTFAMILY.exec(attr)?.[1].trim();
                        if (src && fontFamily) {
                            fontFamily = trimBoth(fontFamily, '"');
                            const fontStyle = REGEXP_FONTSTYLE.exec(attr)?.[1].toLowerCase() || 'normal';
                            const fontWeight = +(REGEXP_FONTWEIGHT.exec(attr)?.[1] || '400');
                            for (const value of src.split(',')) {
                                const match = REGEXP_FONTURL.exec(value);
                                if (match) {
                                    const data: FontFaceData = {
                                        fontFamily,
                                        fontWeight,
                                        fontStyle,
                                        srcFormat: match[4]?.toLowerCase().trim() || 'truetype'
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
                this.applyCSSRuleList(((item as unknown) as CSSSupportsRule).cssRules, sessionId, documentRoot);
                break;
        }
    }

    private applyStyleSheet(item: CSSStyleSheet, sessionId: string, documentRoot: DocumentRoot, queryRoot?: DocumentQueryRoot) {
        try {
            const cssRules = item.cssRules;
            if (cssRules) {
                const parseConditionText = (rule: string, value: string) => new RegExp(`\\s*@${rule}([^{]+)`).exec(value)?.[1].trim() || value;
                for (let i = 0, length = cssRules.length; i < length; ++i) {
                    const rule = cssRules[i];
                    switch (rule.type) {
                        case CSSRule.STYLE_RULE:
                        case CSSRule.FONT_FACE_RULE:
                            this.applyStyleRule(rule as CSSStyleRule, sessionId, documentRoot, queryRoot);
                            break;
                        case CSSRule.IMPORT_RULE: {
                            const uri = resolvePath((rule as CSSImportRule).href, rule.parentStyleSheet?.href || location.href);
                            if (uri) {
                                this.resourceHandler?.addRawData(uri, '', { mimeType: 'text/css', encoding: 'utf8' });
                            }
                            this.applyStyleSheet((rule as CSSImportRule).styleSheet, sessionId, documentRoot, queryRoot);
                            break;
                        }
                        case CSSRule.MEDIA_RULE:
                            if (checkMediaRule((rule as CSSConditionRule).conditionText || parseConditionText('media', rule.cssText))) {
                                this.applyCSSRuleList((rule as CSSConditionRule).cssRules, sessionId, documentRoot, queryRoot);
                            }
                            break;
                        case CSSRule.SUPPORTS_RULE:
                            if (CSS.supports((rule as CSSConditionRule).conditionText || parseConditionText('supports', rule.cssText))) {
                                this.applyCSSRuleList((rule as CSSConditionRule).cssRules, sessionId, documentRoot, queryRoot);
                            }
                            break;
                        case CSSRule.KEYFRAMES_RULE: {
                            const value = parseKeyframes((rule as CSSKeyframesRule).cssRules);
                            if (value) {
                                const keyframesMap = this.getProcessing(sessionId)!.keyframesMap ||= new Map<string, KeyframeData>();
                                const name = (rule as CSSKeyframesRule).name;
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

    private applyCSSRuleList(rules: CSSRuleList, sessionId: string, documentRoot: DocumentRoot, queryRoot?: DocumentQueryRoot) {
        for (let i = 0, length = rules.length; i < length; ++i) {
            this.applyStyleRule(rules[i] as CSSStyleRule, sessionId, documentRoot, queryRoot);
        }
    }

    private createSessionThread(elements: (string | HTMLElement)[], pierceShadowRoot: boolean): SessionThreadData<T> {
        const rootElements = new Set<HTMLElement>();
        const length = elements.length;
        if (length === 0) {
            rootElements.add(this.mainElement);
        }
        else {
            for (let i = 0; i < length; ++i) {
                let element: Null<HTMLElement | string> = elements[i];
                if (typeof element === 'string') {
                    element = document.getElementById(element);
                }
                if (element) {
                    rootElements.add(element);
                }
            }
            if (rootElements.size === 0) {
                return ([rootElements] as unknown) as SessionThreadData<T>;
            }
        }
        let shadowElements: Undef<Set<HTMLElement | ShadowRoot>>,
            styleSheets: Undef<string[]>;
        if (pierceShadowRoot) {
            let shadowRootItems: Undef<Set<ShadowRoot>>;
            for (const element of rootElements) {
                element.querySelectorAll('*').forEach(child => {
                    const shadowRoot = child.shadowRoot;
                    if (shadowRoot) {
                        (shadowRootItems ||= new Set<ShadowRoot>()).add(shadowRoot);
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
                                (styleSheets ||= []).push(href);
                            }
                        }
                    });
                }
            }
        }
        const controller = this.controllerHandler;
        const sessionId = controller.generateSessionId;
        const extensions = this.extensionsAll;
        const processing: squared.base.AppProcessing<T> = {
            sessionId,
            initializing: false,
            cache: new NodeList<T>(undefined, sessionId),
            excluded: new NodeList<T>(undefined, sessionId),
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
        const queryRoot = rootElements.size === 1 && (rootElements.values().next().value as HTMLElement).parentElement;
        if (queryRoot && queryRoot !== document.documentElement) {
            this.setStyleMap(sessionId, document, queryRoot);
        }
        else {
            this.setStyleMap(sessionId);
        }
        return [rootElements, processing, shadowElements || rootElements, styleSheets];
    }

    private resumeSessionThread(rootElements: Set<HTMLElement>, processing: squared.base.AppProcessing<T>, multipleRequest: number, documentRoot?: HTMLElement, preloaded?: HTMLImageElement[]) {
        processing.initializing = false;
        const { sessionId, extensions } = processing;
        const styleElement = insertStyleSheetRule('html > body { overflow: hidden !important; }');
        if (preloaded) {
            for (let i = 0, length = preloaded.length; i < length; ++i) {
                const image = preloaded[i];
                if (image.parentElement) {
                    documentRoot!.removeChild(image);
                }
            }
        }
        const length = extensions.length;
        for (let i = 0; i < length; ++i) {
            extensions[i].beforeParseDocument(sessionId);
        }
        const success: T[] = [];
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
        catch {
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
        return this.resourceHandler?.fileHandler || null;
    }

    get extensionManager() {
        return this._extensionManager;
    }

    get extensionsAll(): Extension<T>[] {
        return this.extensions.filter(item => item.enabled);
    }

    get sessionAll(): [Extension<T>[], T[]] {
        const active = this.session.active;
        if (active.size === 1) {
            const processing: squared.base.AppProcessing<T> = active.values().next().value;
            return [processing.extensions as Extension<T>[], processing.cache.children];
        }
        const extensions: Extension<T>[] = [],
            children: T[] = [];
        for (const processing of active.values()) {
            extensions.push(...processing.extensions as Extension<T>[]);
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