import CSS_TRAITS = squared.lib.constant.CSS_TRAITS;
import USER_AGENT = squared.lib.constant.USER_AGENT;

import type Controller from './controller';
import type Resource from './resource';
import type Extension from './extension';
import type ExtensionManager from './extensionmanager';
import type Node from './node';

import NodeList from './nodelist';

type FileActionOptions = squared.FileActionOptions;
type SessionThreadData<T extends Node> = [squared.base.AppProcessing<T>, HTMLElement[], QuerySelectorElement[], Undef<string[]>];

const { CSS_CANNOT_BE_PARSED, DOCUMENT_ROOT_NOT_FOUND, OPERATION_NOT_SUPPORTED, reject } = squared.lib.error;
const { FILE, STRING } = squared.lib.regex;

const { isUserAgent } = squared.lib.client;
const { CSS_PROPERTIES, getSpecificity, insertStyleSheetRule, getPropertiesAsTraits, parseSelectorText } = squared.lib.css;
const { getElementCache, newSessionInit, setElementCache } = squared.lib.session;
const { allSettled, capitalize, convertCamelCase, isBase64, isEmptyString, resolvePath, splitPair, startsWith } = squared.lib.util;

const REGEXP_IMPORTANT = /([a-z-]+):[^!;]+!important;/g;
const REGEXP_DATAURI = new RegExp(`\\s?url\\("(${STRING.DATAURI})"\\)`, 'g');
const REGEXP_CSSHOST = /^:(host|host-context)\(([^)]+)\)/;
const CSS_SHORTHANDNONE = getPropertiesAsTraits(CSS_TRAITS.SHORTHAND | CSS_TRAITS.NONE);

function parseImageUrl(value: string, styleSheetHref: string, resource: Null<Resource<Node>>, resourceId: number) {
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
                resource.addRawData(resourceId, match[1], { mimeType: leading && leading.includes('/') ? leading : 'image/unknown', encoding, content, base64 });
            }
        }
        else {
            const url = resolvePath(match[5], styleSheetHref);
            if (url) {
                if (resource) {
                    resource.addImageData(resourceId, url);
                }
                result = (result || value).replace(match[0], `url("${url}")`);
            }
        }
    }
    REGEXP_DATAURI.lastIndex = 0;
    return result || value;
}

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
    public elementMap: Null<WeakMap<Element, T>> = null;
    public readonly Node: Constructor<T>;
    public readonly session: squared.base.AppSession<T> = { active: new Map() };

    public abstract userSettings: UserSettings;
    public abstract readonly systemName: string;

    protected _nextId = 0;
    protected readonly _afterInsertNode: BindGeneric<T, void>;
    protected readonly _includeElement: (element: HTMLElement) => boolean;
    protected readonly _preventNodeCascade: (node: T) => boolean;

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

    public abstract insertNode(processing: squared.base.AppProcessing<T>, element: Element): Undef<T>;

    public init() {}
    public finalize() { return true; }

    public createNode(sessionId: string, options: CreateNodeOptions) {
        return this.createNodeStatic(this.getProcessing(sessionId)!, options.element);
    }

    public createNodeStatic(processing: squared.base.AppProcessing<T>, element?: Element) {
        const node = new this.Node(this.nextId, processing.sessionId, element);
        this._afterInsertNode(node);
        if (processing.afterInsertNode) {
            processing.afterInsertNode.some(item => item.afterInsertNode!(node));
        }
        return node;
    }

    public afterCreateCache(processing: squared.base.AppProcessing<T>, node: T) {
        if (this.userSettings.createElementMap) {
            const elementMap = this.elementMap ||= new WeakMap();
            processing.cache.each(item => elementMap.set(item.element as Element, item));
        }
    }

    public copyTo(pathname: string, options?: FileActionOptions) {
        return this.fileHandler?.copyTo(pathname, options) || reject(OPERATION_NOT_SUPPORTED);
    }

    public appendTo(pathname: string, options?: FileActionOptions) {
        return this.fileHandler?.appendTo(pathname, options) || reject(OPERATION_NOT_SUPPORTED);
    }

    public saveAs(filename: string, options?: FileActionOptions) {
        return this.fileHandler?.saveAs(filename, options) || reject(OPERATION_NOT_SUPPORTED);
    }

    public saveFiles(filename: string, options: FileActionOptions) {
        return this.fileHandler?.saveFiles(filename, options) || reject(OPERATION_NOT_SUPPORTED);
    }

    public appendFiles(filename: string, options: FileActionOptions) {
        return this.fileHandler?.appendFiles(filename, options) || reject(OPERATION_NOT_SUPPORTED);
    }

    public copyFiles(pathname: string, options: FileActionOptions) {
        return this.fileHandler?.copyFiles(pathname, options) || reject(OPERATION_NOT_SUPPORTED);
    }

    public reset() {
        this.controllerHandler.reset();
        this.resourceHandler?.reset();
        for (const ext of this.extensions) {
            ext.reset();
        }
        this.closed = false;
    }

    public parseDocument(...elements: (string | HTMLElement)[]) {
        const resource = this.resourceHandler;
        const [processing, rootElements, shadowElements, styleSheets] = this.createSessionThread(elements, this.userSettings.pierceShadowRoot && resource ? resource.userSettings.preloadCustomElements : false);
        if (rootElements.length === 0) {
            return reject(DOCUMENT_ROOT_NOT_FOUND);
        }
        const resourceId = processing.resourceId;
        const documentRoot: HTMLElement = rootElements[0];
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
                            .then(async result => {
                                const mimeType = result.headers.get('content-type') || '';
                                if (startsWith(mimeType, 'text/css') || styleSheets && styleSheets.includes(item)) {
                                    success({ mimeType: 'text/css', encoding: 'utf8', content: await result.text() } as RawDataOptions);
                                }
                                else if (startsWith(mimeType, 'image/svg+xml') || FILE.SVG.test(item)) {
                                    success({ mimeType: 'image/svg+xml', encoding: 'utf8', content: await result.text() } as RawDataOptions);
                                }
                                else {
                                    success({ mimeType: result.headers.get('content-type') || 'font/' + (splitPair(item, '.', false, true)[1].toLowerCase() || 'ttf'), buffer: await result.arrayBuffer() } as RawDataOptions);
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
                        resource!.addImage(resourceId, data);
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

    public parseDocumentSync(...elements: (string | HTMLElement)[]): Undef<T | T[]> {
        const sessionData = this.createSessionThread(elements, false);
        return this.resumeSessionThread(sessionData[0], sessionData[1], elements.length);
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
            let mediaText: Undef<string>;
            try {
                mediaText = styleSheet.media.mediaText;
            }
            catch {
            }
            if (!mediaText || window.matchMedia(mediaText).matches) {
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

    public getDatasetName(attr: string, element: DocumentElement) {
        return element.dataset[attr + capitalize(this.systemName)] || element.dataset[attr];
    }

    public setDatasetName(attr: string, element: DocumentElement, value: string) {
        element.dataset[attr + capitalize(this.systemName)] = value;
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
        const node = this.cascadeParentNode(processing, sessionId, resourceId, rootElement, 0, extensions.length ? extensions : null);
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

    protected cascadeParentNode(processing: squared.base.AppProcessing<T>, sessionId: string, resourceId: number, parentElement: HTMLElement, depth: number, extensions: Null<Extension<T>[]>, shadowParent?: Null<ShadowRoot>) {
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
            const pierceShadowRoot = this.userSettings.pierceShadowRoot;
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

    private applyStyleRule(sessionId: string, resourceId: number, item: CSSStyleRule, documentRoot: DocumentRoot, queryRoot?: QuerySelectorElement) {
        const resource = this.resourceHandler;
        const styleSheetHref = item.parentStyleSheet?.href || location.href;
        const cssText = item.cssText;
        switch (item.type) {
            case CSSRule.STYLE_RULE: {
                const hostElement = (documentRoot as ShadowRoot).host as Undef<Element>;
                const baseMap: CssStyleMap = {};
                const important: ObjectMap<boolean> = {};
                const cssStyle = item.style;
                const hasExactValue = (attr: string, value: string) => new RegExp(`\\s*${attr}\\s*:\\s*${value}\\s*;?`).test(cssText);
                const hasPartialValue = (attr: string, value: string) => new RegExp(`\\s*${attr}\\s*:[^;]*?${value}[^;]*;?`).test(cssText);
                for (let i = 0, length = cssStyle.length; i < length; ++i) {
                    const attr = cssStyle[i];
                    if (attr[0] === '-') {
                        continue;
                    }
                    const baseAttr = convertCamelCase(attr) as CssStyleAttr;
                    let value: string = cssStyle[attr];
                    switch (value) {
                        case 'initial': {
                            if (isUserAgent(USER_AGENT.SAFARI) && startsWith(baseAttr, 'background')) {
                                break;
                            }
                            const property = CSS_PROPERTIES[baseAttr];
                            if (property) {
                                if (property.valueOfSome) {
                                    break;
                                }
                                if (property.value === 'auto') {
                                    value = 'auto';
                                    break;
                                }
                            }
                        }
                        case 'normal':
                            if (!hasExactValue(attr, value)) {
                                required: {
                                    for (const name in CSS_SHORTHANDNONE) {
                                        const css = CSS_SHORTHANDNONE[name];
                                        if ((css.value as string[]).includes(baseAttr)) {
                                            if (hasExactValue(css.name!, '(?:none|initial)') || value === 'initial' && hasPartialValue(css.name!, 'initial') || css.valueOfNone && hasExactValue(css.name!, css.valueOfNone)) {
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
                    switch (baseAttr) {
                        case 'backgroundImage':
                        case 'listStyleImage':
                        case 'content':
                            if (value !== 'initial') {
                                value = parseImageUrl(value, styleSheetHref, resource, resourceId);
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
                let processing: Undef<squared.base.AppProcessing<T>>;
                for (const selectorText of parseSelectorText(item.selectorText)) {
                    const specificity = getSpecificity(selectorText);
                    const [selector, target] = splitPair(selectorText, '::');
                    const targetElt = target ? '::' + target : '';
                    let elements: ArrayLike<Element>;
                    if (startsWith(selector, ':host')) {
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
                        if (resource && !hostElement) {
                            ((processing ||= this.getProcessing(sessionId)!).unusedStyles ||= new Set()).add(selectorText);
                        }
                        continue;
                    }
                    const attrStyle = 'styleMap' + targetElt;
                    const attrSpecificity = 'styleSpecificity' + targetElt;
                    for (let i = 0; i < length; ++i) {
                        const element = elements[i];
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
                    resource.parseFontFace(resourceId, cssText, styleSheetHref);
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
                    const type = rule.type;
                    switch (type) {
                        case CSSRule.STYLE_RULE:
                        case CSSRule.FONT_FACE_RULE:
                            this.applyStyleRule(sessionId, resourceId, rule as CSSStyleRule, documentRoot, queryRoot);
                            break;
                        case CSSRule.IMPORT_RULE: {
                            if (resource) {
                                const uri = resolvePath((rule as CSSImportRule).href, rule.parentStyleSheet?.href || location.href);
                                if (uri) {
                                    resource.addRawData(resourceId, uri, { mimeType: 'text/css', encoding: 'utf8' });
                                }
                            }
                            this.applyStyleSheet(sessionId, resourceId, (rule as CSSImportRule).styleSheet, documentRoot, queryRoot);
                            break;
                        }
                        case CSSRule.MEDIA_RULE:
                            if (window.matchMedia((rule as CSSConditionRule).conditionText || parseConditionText('media', rule.cssText)).matches) {
                                this.applyCssRules(sessionId, resourceId, (rule as CSSConditionRule).cssRules, documentRoot, queryRoot);
                            }
                            else {
                                this.parseStyleRules(sessionId, resourceId, (rule as CSSConditionRule).cssRules);
                            }
                            break;
                        case CSSRule.SUPPORTS_RULE:
                            if (CSS.supports((rule as CSSConditionRule).conditionText || parseConditionText('supports', rule.cssText))) {
                                this.applyCssRules(sessionId, resourceId, (rule as CSSConditionRule).cssRules, documentRoot, queryRoot);
                            }
                            else {
                                this.parseStyleRules(sessionId, resourceId, (rule as CSSConditionRule).cssRules);
                            }
                            break;
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
                                        parseImageUrl(value, item.parentStyleSheet?.href || location.href, resource, resourceId);
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

    private createSessionThread(elements: (string | HTMLElement)[], pierceShadowRoot: boolean): SessionThreadData<T> {
        const rootElements: HTMLElement[] = [];
        const length = elements.length;
        if (length === 0) {
            rootElements.push(this.mainElement);
        }
        else {
            for (let i = 0; i < length; ++i) {
                let element: Null<HTMLElement | string> = elements[i];
                if (typeof element === 'string') {
                    element = document.getElementById(element);
                }
                if (element && !rootElements.includes(element)) {
                    rootElements.push(element);
                }
            }
            if (rootElements.length === 0) {
                return ([rootElements] as unknown) as SessionThreadData<T>;
            }
        }
        const { controllerHandler, resourceHandler, resourceId, extensionsAll: extensions } = this;
        const sessionId = controllerHandler.generateSessionId;
        const processing: squared.base.AppProcessing<T> = {
            sessionId,
            resourceId,
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
        let shadowElements: Undef<ShadowRoot[]>,
            styleSheets: Undef<string[]>;
        if (pierceShadowRoot) {
            for (const element of rootElements) {
                element.querySelectorAll('*').forEach(child => {
                    const shadowRoot = child.shadowRoot;
                    if (shadowRoot) {
                        (shadowElements ||= []).push(shadowRoot);
                    }
                });
            }
            if (shadowElements) {
                for (const element of shadowElements) {
                    element.querySelectorAll('link[href][rel*="stylesheet" i]').forEach((child: HTMLLinkElement) => (styleSheets ||= []).push(child.href));
                }
            }
        }
        if (resourceHandler) {
            const queryElements: QuerySelectorElement[] = [queryRoot || document];
            if (shadowElements) {
                queryElements.push(...shadowElements);
            }
            for (const element of queryElements) {
                element.querySelectorAll('[style]').forEach((child: HTMLElement) => {
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

    private resumeSessionThread(processing: squared.base.AppProcessing<T>, rootElements: HTMLElement[], multipleRequest: number, documentRoot?: HTMLElement, preloaded?: HTMLImageElement[]) {
        processing.initializing = false;
        const { sessionId, extensions } = processing;
        const styleElement = this.resourceHandler && insertStyleSheetRule('html > body { overflow: hidden !important; }');
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
            const node = this.createCache(processing, element);
            if (node) {
                this.afterCreateCache(processing, node);
                success.push(node);
            }
        }
        for (let i = 0; i < length; ++i) {
            extensions[i].afterParseDocument(sessionId);
        }
        if (styleElement) {
            try {
                document.head.removeChild(styleElement);
            }
            catch {
            }
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
        const extensions: Extension<T>[] = [];
        const children: T[] = [];
        for (const processing of active.values()) {
            extensions.push(...processing.extensions as Extension<T>[]);
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