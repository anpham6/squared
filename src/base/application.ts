import CSS_TRAITS = squared.lib.constant.CSS_TRAITS;

import type Controller from './controller';
import type Resource from './resource';
import type Extension from './extension';
import type ExtensionManager from './extensionmanager';
import type Node from './node';

import NodeList from './nodelist';

type FileActionOptions = squared.FileActionOptions;
type RootElement = squared.base.RootElement;
type ElementSettings = squared.base.ElementSettings;

const { CSS_CANNOT_BE_PARSED, DOCUMENT_ROOT_NOT_FOUND, OPERATION_NOT_SUPPORTED, reject } = squared.lib.error;
const { CSS_PROPERTIES, compareSpecificity, getSpecificity, getPropertiesAsTraits, insertStyleSheetRule, parseSelectorText } = squared.lib.internal;
const { FILE, STRING } = squared.lib.regex;

const { getElementCache, newSessionInit, setElementCache } = squared.lib.session;
const { allSettled, capitalize, convertCamelCase, isBase64, isEmptyString, isPlainObject, replaceAll, resolvePath, splitPair, splitSome, startsWith } = squared.lib.util;

const REGEXP_IMPORTANT = /([a-z-]+):[^!;]+!important;/g;
const REGEXP_CSSHOST = /^:(?:host|host-context)\(([^)]+)\)/;
const REGEXP_DATAURI = new RegExp(`url\\("(${STRING.DATAURI})"\\)`, 'g');
const CSS_SHORTHANDNONE = getPropertiesAsTraits(CSS_TRAITS.NONE);

function parseError(error: unknown) {
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

const getErrorMessage = (errors: string[]) => errors.map(value => '- ' + value).join('\n');

export function parseImageUrl(value: string, styleSheetHref: Optional<string>, resource: Null<Resource<Node>>, resourceId: number, dataUri: boolean) {
    REGEXP_DATAURI.lastIndex = 0;
    let result: Undef<string>,
        match: Null<RegExpExecArray>;
    while (match = REGEXP_DATAURI.exec(value)) {
        if (match[2]) {
            if (resource) {
                const leading = match[3];
                const encoding = match[4] || (isBase64(match[5]) ? 'base64' : 'utf8');
                let base64: Undef<string>,
                    content: Undef<string>;
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

export default abstract class Application<T extends Node> implements squared.base.Application<T> {
    public static readonly KEY_NAME = 'squared.base.application';

    public static prioritizeExtensions<U extends Node>(value: string, extensions: Extension<U>[]) {
        const result: Extension<U>[] = [];
        splitSome(value, name => {
            const index = extensions.findIndex(ext => ext.name === name);
            if (index !== -1) {
                result.push(extensions[index]);
            }
        });
        return result.length ? result.concat(extensions.filter(ext => !result.includes(ext))) : extensions;
    }

    public extensions: Extension<T>[] = [];
    public userSettings = {} as UserSettings;
    public closed = false;
    public elementMap: WeakMap<Element, T> = new WeakMap();
    public readonly Node: Constructor<T>;
    public readonly session: squared.base.AppSession<T> = {
        active: new Map(),
        data: new Map()
    };

    public abstract readonly systemName: string;

    protected _nextId = 0;
    protected readonly _afterInsertNode: (node: T, sessionid: string) => void;
    protected readonly _includeElement: (element: HTMLElement) => boolean;
    protected readonly _preventNodeCascade: (node: T) => boolean;

    private readonly _controllerHandler: Controller<T>;
    private readonly _resourceHandler: Null<Resource<T>>;
    private readonly _extensionManager: Null<ExtensionManager<T>>;

    constructor(
        public readonly framework: number,
        nodeConstructor: Constructor<T>,
        ControllerConstructor: Constructor<Controller<T>>,
        ExtensionManagerConstructor?: Constructor<ExtensionManager<T>>,
        ResourceConstructor?: Constructor<Resource<T>>,
        public builtInExtensions: Map<string, Extension<T>> = new Map())
    {
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

    public abstract insertNode(processing: squared.base.AppProcessing<T>, element: Element): Undef<T>;

    public init() {
        this.controllerHandler.init();
    }

    public finalize() { return true; }

    public createNode(sessionId: string, options: CreateNodeOptions) {
        return this.createNodeStatic(this.getProcessing(sessionId)!, options.element);
    }

    public createNodeStatic(processing: squared.base.AppProcessing<T>, element?: Element) {
        const sessionId = processing.sessionId;
        const node = new this.Node(this.nextId, sessionId, element);
        this._afterInsertNode(node, sessionId);
        if (processing.afterInsertNode) {
            processing.afterInsertNode.some(item => item.afterInsertNode!(node));
        }
        return node;
    }

    public afterCreateCache(processing: squared.base.AppProcessing<T>, node: T) {
        if (this.getUserSetting(processing, 'createElementMap')) {
            const elementMap = this.elementMap;
            processing.cache.each(item => elementMap.set(item.element as Element, item));
        }
    }

    public copyTo(pathname: string, options?: FileActionOptions) {
        const fileHandler = this.fileHandler;
        return fileHandler ? fileHandler.copyTo(pathname, options) : reject(OPERATION_NOT_SUPPORTED);
    }

    public appendTo(pathname: string, options?: FileActionOptions) {
        const fileHandler = this.fileHandler;
        return fileHandler ? fileHandler.appendTo(pathname, options) : reject(OPERATION_NOT_SUPPORTED);
    }

    public saveAs(filename: string, options?: FileActionOptions) {
        const fileHandler = this.fileHandler;
        return fileHandler ? fileHandler.saveAs(filename, options) : reject(OPERATION_NOT_SUPPORTED);
    }

    public saveFiles(filename: string, options: FileActionOptions) {
        const fileHandler = this.fileHandler;
        return fileHandler ? fileHandler.saveFiles(filename, options) : reject(OPERATION_NOT_SUPPORTED);
    }

    public appendFiles(filename: string, options: FileActionOptions) {
        const fileHandler = this.fileHandler;
        return fileHandler ? fileHandler.appendFiles(filename, options) : reject(OPERATION_NOT_SUPPORTED);
    }

    public copyFiles(pathname: string, options: FileActionOptions) {
        const fileHandler = this.fileHandler;
        return fileHandler ? fileHandler.copyFiles(pathname, options) : reject(OPERATION_NOT_SUPPORTED);
    }

    public reset() {
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

    public parseDocument(...elements: RootElement[]) {
        const resource = this.resourceHandler;
        const [processing, rootElements, shadowElements, styleSheets] = this.createThread(elements, false);
        if (rootElements.length === 0) {
            return reject(DOCUMENT_ROOT_NOT_FOUND);
        }
        const resourceId = processing.resourceId;
        const documentRoot: HTMLElement = rootElements[0];
        const [preloadItems, preloaded] = resource ? resource.preloadAssets(resourceId, documentRoot, shadowElements, this.getUserSetting<boolean>(processing, 'preloadImages'), this.getUserSetting<boolean>(processing, 'preloadFonts')) : [[], []];
        if (styleSheets) {
            preloadItems.push(...styleSheets);
        }
        if (preloadItems.length) {
            processing.initializing = true;
            return (Promise.allSettled || allSettled).bind(Promise)(
                preloadItems.map(item => new Promise((success, error) => {
                    if (typeof item === 'string') {
                        fetch(item)
                            .then(async result => {
                                if (result.status >= 300) {
                                    error(item + ` (${result.status}: ${result.statusText})`);
                                }
                                else {
                                    const mimeType = result.headers.get('content-type') || '';
                                    if (styleSheets && styleSheets.includes(item) || mimeType.indexOf('text/css') !== -1) {
                                        success({ mimeType: 'text/css', encoding: 'utf8', content: await result.text() } as RawDataOptions);
                                    }
                                    else if (FILE.SVG.test(item) || mimeType.indexOf('image/svg+xml') !== -1) {
                                        success({ mimeType: 'image/svg+xml', encoding: 'utf8', content: await result.text() } as RawDataOptions);
                                    }
                                    else {
                                        success({ mimeType: mimeType || 'font/' + (splitPair(item, '.', false, true)[1].toLowerCase() || 'ttf'), buffer: await result.arrayBuffer() } as RawDataOptions);
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
                })
            ))
            .then((result: PromiseSettledResult<HTMLImageElement | RawDataOptions>[]) => {
                let errors: Undef<string[]>;
                for (let i = 0, length = result.length; i < length; ++i) {
                    const item = result[i];
                    if (item.status === 'rejected') {
                        const message = parseError(item.reason);
                        if (message) {
                            (errors ||= []).push(message);
                        }
                        continue;
                    }
                    const data = preloadItems[i];
                    if (typeof data === 'string') {
                        resource!.addRawData(resourceId, data, (item as PromiseFulfilledResult<unknown>).value as RawDataOptions);
                    }
                    else {
                        resource!.addImageElement(resourceId, data);
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

    public parseDocumentSync(...elements: RootElement[]): Undef<T | T[]> {
        const sessionData = this.createThread(elements, true);
        return this.resumeThread(sessionData[0], sessionData[1], elements.length);
    }

    public createThread(elements: RootElement[], sync: boolean): squared.base.AppThreadData<T> {
        const { controllerHandler, resourceHandler, resourceId } = this;
        const rootElements: HTMLElement[] = [];
        const customSettings: Null<ElementSettings>[] = [];
        const isEnabled = <U extends UserSettings>(settings: Null<U>, name: keyof U) => settings && name in settings ? settings[name] : (this.userSettings as U)[name];
        let length = elements.length,
            shadowElements: Undef<ShadowRoot[]>,
            styleSheets: Undef<string[]>;
        if (length === 0) {
            elements.push(this.mainElement);
            length = 1;
        }
        for (let i = 0; i < length; ++i) {
            let item: Null<RootElement> = elements[i],
                settings: Null<ElementSettings> = null;
            if (isPlainObject<ElementSettings>(item)) {
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
                if (!sync && resourceHandler && isEnabled(settings as UserSettings, 'pierceShadowRoot') && isEnabled(settings as UserResourceSettings, 'preloadCustomElements')) {
                    const items = item.querySelectorAll('*');
                    for (let j = 0, q = items.length; j < q; ++j) {
                        const shadowRoot = items[j].shadowRoot;
                        if (shadowRoot) {
                            shadowRoot.querySelectorAll('link[href][rel*="stylesheet" i]').forEach((child: HTMLLinkElement) => (styleSheets ||= []).push(child.href));
                            (shadowElements ||= []).push(shadowRoot);
                        }
                    }
                }
            }
        }
        if (rootElements.length === 0) {
            return [{} as squared.base.AppProcessing<T>, rootElements, []];
        }
        const sessionId = controllerHandler.generateSessionId;
        const processing: squared.base.AppProcessing<T> = {
            sessionId,
            resourceId,
            initializing: false,
            cache: new NodeList<T>([], sessionId, resourceId),
            excluded: new NodeList<T>([], sessionId, resourceId),
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
            const queryElements: QuerySelectorElement[] = [queryRoot || document];
            if (shadowElements) {
                queryElements.push(...shadowElements);
            }
            for (const element of queryElements) {
                const items = element.querySelectorAll('[style]');
                const q = items.length;
                if (q) {
                    for (let i = 0; i < q; ++i) {
                        const { backgroundImage, listStyleImage } = (items[i] as HTMLElement).style;
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

    public resumeThread(processing: squared.base.AppProcessing<T>, rootElements: HTMLElement[], requestCount: number) {
        processing.initializing = false;
        const { controllerHandler, extensions } = this;
        const sessionId = processing.sessionId;
        const success: T[] = [];
        const removeStyle = controllerHandler.localSettings.adoptedStyleSheet && insertStyleSheetRule(controllerHandler.localSettings.adoptedStyleSheet);
        let enabled: Undef<Extension<T>[]>,
            disabled: Undef<Extension<T>[]>;
        const length = extensions.length;
        if (length) {
            enabled = [];
            for (let i = 0, ext: Extension<T>; i < length; ++i) {
                if ((ext = extensions[i]).enabled) {
                    ext.beforeParseDocument(sessionId);
                    enabled.push(ext);
                }
                else {
                    (disabled ||= []).push(ext);
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
                const current: Extension<T>[] = [];
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
            for (let i = 0, q = enabled!.length; i < q; ++i) {
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

    public createCache(processing: squared.base.AppProcessing<T>, documentRoot: HTMLElement) {
        const node = this.createRootNode(processing, documentRoot);
        if (node) {
            this.controllerHandler.sortInitialCache(processing.cache);
        }
        return node;
    }

    public setStyleMap(sessionId: string, resourceId: number, documentRoot: DocumentRoot = document, queryRoot?: QuerySelectorElement) {
        const styleSheets = documentRoot.styleSheets;
        let errors: Undef<string[]>;
        for (let i = 0, length = styleSheets.length; i < length; ++i) {
            const styleSheet = styleSheets[i];
            let query: Undef<string>;
            try {
                query = styleSheet.media.mediaText;
            }
            catch {
            }
            if (!query || window.matchMedia(query).matches) {
                try {
                    this.applyStyleSheet(sessionId, resourceId, styleSheet, documentRoot, queryRoot);
                }
                catch (err) {
                    (errors ||= []).push((err as Error).message);
                }
            }
        }
        if (errors) {
            this.writeError(getErrorMessage(errors), CSS_CANNOT_BE_PARSED);
        }
    }

    public replaceShadowRootSlots(shadowRoot: ShadowRoot) {
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

    public setExtensions(namespaces: string[] = this.userSettings.builtInExtensions) {
        const { builtInExtensions, extensions } = this;
        extensions.length = 0;
        for (let i = 0, length = namespaces.length, ext: Undef<Extension<T>>; i < length; ++i) {
            let namespace = namespaces[i];
            if (ext = builtInExtensions.get(namespace)) {
                ext.application = this;
                extensions.push(ext);
            }
            else {
                namespace += '.';
                for (const data of builtInExtensions) {
                    if (startsWith(data[0], namespace) && !extensions.includes(ext = data[1])) {
                        ext.application = this;
                        extensions.push(ext);
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

    public getUserSetting<U = unknown>(processing: Undef<string | squared.base.AppProcessing<T>>, name: keyof UserResourceSettings): U {
        if (typeof processing === 'string') {
            processing = this.getProcessing(processing);
        }
        if (processing) {
            const settings = processing.settings as Null<UserSettings>;
            if (settings && name in settings) {
                return settings[name] as U;
            }
        }
        return this.userSettings[name] as U;
    }

    public getDatasetName(attr: string, element: DocumentElement) {
        return element.dataset[attr + capitalize(this.systemName)] || element.dataset[attr];
    }

    public setDatasetName(attr: string, element: DocumentElement, value: string) {
        element.dataset[attr + capitalize(this.systemName)] = value;
    }

    public addRootElement(sessionId: string, element: HTMLElement) {
        const rootElements = this.getProcessing(sessionId)?.rootElements;
        if (rootElements && !rootElements.includes(element)) {
            rootElements.push(element);
        }
    }

    public writeError(message: string, hint?: string) {
        (this.userSettings.showErrorMessages ? alert : console.log)((hint ? hint + '\n\n' : '') + message); // eslint-disable-line no-console
    }

    public toString() {
        return this.systemName;
    }

    protected createRootNode(processing: squared.base.AppProcessing<T>, rootElement: HTMLElement) {
        const { sessionId, resourceId } = processing;
        const extensions = processing.extensions.filter(item => !!item.beforeInsertNode) as Extension<T>[];
        const node = this.cascadeParentNode(processing, sessionId, resourceId, rootElement, 0, this.getUserSetting<boolean>(processing, 'pierceShadowRoot'), extensions.length ? extensions : null);
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
                    this._afterInsertNode(parent, sessionId);
                    for (let i = 0; i < length; ++i) {
                        const element = children[i] as HTMLElement;
                        let child: T;
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

    protected cascadeParentNode(processing: squared.base.AppProcessing<T>, sessionId: string, resourceId: number, parentElement: HTMLElement, depth: number, pierceShadowRoot: boolean, extensions: Null<Extension<T>[]>, shadowParent?: Null<ShadowRoot>) {
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
            const children: T[] = [];
            const elements: T[] = [];
            let inlineText = true,
                plainText = false,
                j = 0;
            for (let i = 0; i < length; ++i) {
                const element = childNodes[i] as HTMLElement;
                let child: Undef<T>;
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
                        (use ? Application.prioritizeExtensions(use, extensions) : extensions).some(item => item.beforeInsertNode!(element, sessionId));
                    }
                    let shadowRoot: Optional<ShadowRoot>;
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

    protected visibleText(node: T, element: Element) {
        return element.nodeName === '#text' && (!isEmptyString(element.textContent!) || node.preserveWhiteSpace && (node.tagName !== 'PRE' || node.element!.childElementCount === 0));
    }

    private applyStyleRule(sessionId: string, resourceId: number, item: CSSStyleRule, documentRoot: DocumentRoot, queryRoot?: QuerySelectorElement) {
        const resource = this.resourceHandler;
        const cssText = item.cssText;
        switch (item.type) {
            case CSSRule.STYLE_RULE: {
                const hostElement = (documentRoot as ShadowRoot).host as Undef<Element>;
                const baseMap: CssStyleMap = {};
                const cssStyle = item.style;
                let important: Undef<string[]>;
                for (let i = 0, length = cssStyle.length; i < length; ++i) {
                    const attr = cssStyle[i];
                    const baseAttr = convertCamelCase(attr) as CssStyleAttr;
                    let value: Undef<string> = cssStyle[attr];
                    if (value === 'initial') {
                        const property = CSS_PROPERTIES[baseAttr];
                        if (property) {
                            if (property.value === 'auto') {
                                value = 'auto';
                            }
                            else {
                                for (const parentAttr in CSS_SHORTHANDNONE) {
                                    const css = CSS_SHORTHANDNONE[parentAttr]!;
                                    if (css.value.includes(baseAttr)) {
                                        if (property.valueOfNone && new RegExp(`\\s${css.name!}:\\s+none\\s*;`).test(cssText)) {
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
                            for (const subAttr of property.value as string[]) {
                                const valueOfNone = CSS_PROPERTIES[subAttr]!.valueOfNone;
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
                                value = parseImageUrl(value, item.parentStyleSheet?.href, resource, resourceId, false);
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
                    let property: Undef<CssPropertyData>,
                        match: Null<RegExpExecArray>;
                    while (match = REGEXP_IMPORTANT.exec(cssText)) {
                        const attr = convertCamelCase(match[1]) as CssStyleAttr;
                        if ((property = CSS_PROPERTIES[attr]) && Array.isArray(property.value)) {
                            property.value.forEach(subAttr => important!.push(subAttr));
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
                    const [selector, target] = splitPair(selectorText, '::');
                    const targetElt = target ? '::' + target : '';
                    let elements: ArrayLike<Element>;
                    if (startsWith(selector, ':host')) {
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
                        const styleData = getElementCache<CssStyleMap>(element, attrStyle, sessionId);
                        if (styleData) {
                            const specificityData = getElementCache<ObjectMap<Specificity>>(element, attrSpecificity, sessionId)!;
                            let revised: Specificity;
                            for (const attr in baseMap) {
                                if (important && important.includes(attr)) {
                                    const values = specificity.slice(0) as Specificity;
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
                            const style = { ...baseMap };
                            const specificityData: ObjectMap<Specificity> = {};
                            for (const attr in style) {
                                if (important && important.includes(attr)) {
                                    const values = specificity.slice(0) as Specificity;
                                    values.splice(0, 0, 1, 0);
                                    specificityData[attr] = values;
                                }
                                else {
                                    specificityData[attr] = specificity;
                                }
                            }
                            setElementCache(element, 'sessionId', sessionId);
                            setElementCache(element, attrStyle, style, sessionId);
                            setElementCache(element, attrSpecificity, specificityData, sessionId);
                        }
                    }
                }
                break;
            }
            case CSSRule.FONT_FACE_RULE:
                if (resource) {
                    resource.parseFontFace(resourceId, cssText, item.parentStyleSheet?.href);
                }
                break;
            case CSSRule.SUPPORTS_RULE:
                this.applyCssRules(sessionId, resourceId, ((item as unknown) as CSSSupportsRule).cssRules, documentRoot);
                break;
        }
    }

    private applyStyleSheet(sessionId: string, resourceId: number, item: CSSStyleSheet, documentRoot: DocumentRoot, queryRoot?: QuerySelectorElement) {
        try {
            const cssRules = item.cssRules;
            if (cssRules) {
                const resource = this.resourceHandler;
                const parseConditionText = (rule: string, value: string) => new RegExp(`@${rule}([^{]+)`).exec(value)?.[1].trim() || value;
                for (let i = 0, length = cssRules.length; i < length; ++i) {
                    const rule = cssRules[i];
                    switch (rule.type) {
                        case CSSRule.STYLE_RULE:
                        case CSSRule.FONT_FACE_RULE:
                            this.applyStyleRule(sessionId, resourceId, rule as CSSStyleRule, documentRoot, queryRoot);
                            break;
                        case CSSRule.IMPORT_RULE:
                            if (resource) {
                                const uri = resolvePath((rule as CSSImportRule).href, rule.parentStyleSheet?.href);
                                if (uri) {
                                    resource.addRawData(resourceId, uri, { mimeType: 'text/css', encoding: 'utf8' });
                                }
                            }
                            this.applyStyleSheet(sessionId, resourceId, (rule as CSSImportRule).styleSheet, documentRoot, queryRoot);
                            break;
                        case CSSRule.MEDIA_RULE: {
                            const conditionText = (rule as CSSConditionRule).conditionText || parseConditionText('media', rule.cssText);
                            if (window.matchMedia(conditionText).matches) {
                                this.applyCssRules(sessionId, resourceId, (rule as CSSConditionRule).cssRules, documentRoot, queryRoot);
                            }
                            else {
                                this.parseStyleRules(sessionId, resourceId, (rule as CSSConditionRule).cssRules);
                                const unusedMedia = this.session.unusedMedia;
                                if (unusedMedia) {
                                    unusedMedia.call(this, sessionId, rule as CSSConditionRule, conditionText, (documentRoot as ShadowRoot).host);
                                }
                            }
                            break;
                        }
                        case CSSRule.SUPPORTS_RULE: {
                            const conditionText = (rule as CSSConditionRule).conditionText || parseConditionText('supports', rule.cssText);
                            if (CSS.supports(conditionText)) {
                                this.applyCssRules(sessionId, resourceId, (rule as CSSConditionRule).cssRules, documentRoot, queryRoot);
                            }
                            else {
                                this.parseStyleRules(sessionId, resourceId, (rule as CSSConditionRule).cssRules);
                                const unusedSupports = this.session.unusedSupports;
                                if (unusedSupports) {
                                    unusedSupports.call(this, sessionId, rule as CSSConditionRule, conditionText, (documentRoot as ShadowRoot).host);
                                }
                            }
                            break;
                        }
                        case CSSRule.KEYFRAMES_RULE:
                            if (resource) {
                                resource.parseKeyFrames(resourceId, rule as CSSKeyframesRule);
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

    private applyCssRules(sessionId: string, resourceId: number, rules: CSSRuleList, documentRoot: DocumentRoot, queryRoot?: QuerySelectorElement) {
        for (let i = 0, length = rules.length; i < length; ++i) {
            this.applyStyleRule(sessionId, resourceId, rules[i] as CSSStyleRule, documentRoot, queryRoot);
        }
    }

    private parseStyleRules(sessionId: string, resourceId: number, rules: CSSRuleList) {
        const resource = this.resourceHandler;
        if (resource) {
            for (let i = 0, length = rules.length; i < length; ++i) {
                const item = rules[i] as CSSStyleRule;
                switch (item.type) {
                    case CSSRule.STYLE_RULE: {
                        const cssStyle = item.style;
                        for (let j = 0, q = cssStyle.length; j < q; ++j) {
                            const attr = cssStyle[j];
                            switch (attr) {
                                case 'background-image':
                                case 'list-style-image':
                                case 'content': {
                                    const value: string = cssStyle[attr];
                                    if (value !== 'initial') {
                                        parseImageUrl(value, item.parentStyleSheet?.href, resource, resourceId, false);
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

    get sessionAll(): [Extension<T>[], T[]] {
        const active = this.session.active;
        if (active.size === 1) {
            const processing: squared.base.AppProcessing<T> = active.values().next().value;
            return [processing.extensions as Extension<T>[], processing.cache.children];
        }
        const extensions: Extension<T>[] = [];
        const children: T[] = [];
        for (const processing of active.values()) {
            if (extensions.length) {
                for (const item of processing.extensions as Extension<T>[]) {
                    if (!extensions.includes(item)) {
                        extensions.push(item);
                    }
                }
            }
            else {
                extensions.push(...processing.extensions as Extension<T>[]);
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