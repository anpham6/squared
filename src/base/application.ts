import CSS_TRAITS = squared.lib.constant.CSS_TRAITS;

import type Extension from './extension';
import type ExtensionManager from './extensionmanager';
import type Resource from './resource';
import type Controller from './controller';

import Node from './node';
import NodeList from './nodelist';

type FileActionOptions = squared.FileActionOptions;
type PreloadItem = HTMLImageElement | string;

const { DOCUMENT_ROOT_NOT_FOUND, OPERATION_NOT_SUPPORTED, CSS_CANNOT_BE_PARSED } = squared.lib.error;

const { CSS_PROPERTIES, checkMediaRule, getSpecificity, hasComputedStyle, insertStyleSheetRule, getPropertiesAsTraits, parseKeyframes, parseSelectorText } = squared.lib.css;
const { FILE, STRING } = squared.lib.regex;
const { getElementCache, newSessionInit, resetSessionAll, setElementCache } = squared.lib.session;
const { capitalize, convertCamelCase, isEmptyString, parseMimeType, resolvePath, splitPair, splitPairStart, trimBoth } = squared.lib.util;

const REGEXP_IMPORTANT = /\s*([a-z-]+):[^!;]+!important;/g;
const REGEXP_FONTFACE = /\s*@font-face\s*{([^}]+)}\s*/;
const REGEXP_FONTSRC = /\s*src:\s*([^;]+);/;
const REGEXP_FONTFAMILY = /\s*font-family:([^;]+);/;
const REGEXP_FONTSTYLE = /\s*font-style:\s*(\w+)\s*;/;
const REGEXP_FONTWEIGHT = /\s*font-weight:\s*(\d+)\s*;/;
const REGEXP_FONTURL = /\s*(url|local)\((?:"((?:[^"]|\\")+)"|([^)]+))\)(?:\s*format\("?([\w-]+)"?\))?\s*/;
const REGEXP_DATAURI = new RegExp(`url\\("?(${STRING.DATAURI})"?\\),?\\s*`, 'g');
const CSS_SHORTHANDNONE = getPropertiesAsTraits(CSS_TRAITS.SHORTHAND | CSS_TRAITS.NONE);

const operationNotSupported = (): Promise<void> => Promise.reject(new Error(OPERATION_NOT_SUPPORTED));

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
    public readonly Node: Constructor<T>;
    public readonly elementMap = new Map<Element, T>();
    public readonly session: squared.base.AppSession<T> = {
        active: new Map<string, squared.base.AppProcessing<T>>()
    };
    public abstract userSettings: UserSettings;
    public abstract readonly systemName: string;

    protected readonly _afterInsertNode: BindGeneric<T, void>;

    private _nextId = 0;
    private readonly _controllerHandler: Controller<T>;
    private readonly _resourceHandler: Null<Resource<T>> = null;
    private readonly _extensionManager: Null<ExtensionManager<T>> = null;

    constructor(
        public readonly framework: number,
        nodeConstructor: Constructor<T>,
        ControllerConstructor: Constructor<T>,
        ResourceConstructor?: Constructor<T>,
        ExtensionManagerConstructor?: Constructor<T>)
    {
        this._controllerHandler = (new ControllerConstructor(this) as unknown) as Controller<T>;
        if (ResourceConstructor) {
            this._resourceHandler = (new ResourceConstructor(this) as unknown) as Resource<T>;
        }
        if (ExtensionManagerConstructor) {
            this._extensionManager = (new ExtensionManagerConstructor(this) as unknown) as ExtensionManager<T>;
        }
        this._afterInsertNode = this._controllerHandler.afterInsertNode;
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
        const node = new this.Node(this.nextId, sessionId, options.element);
        this.controllerHandler.afterInsertNode(node);
        const afterInsertNode = this.getProcessing(sessionId)!.afterInsertNode;
        if (afterInsertNode) {
            afterInsertNode.some(item => item.afterInsertNode!(node));
        }
        return node;
    }

    public copyTo(directory: string, options?: FileActionOptions) {
        return this._resourceHandler?.fileHandler?.copyTo(directory, options) || operationNotSupported();
    }

    public appendTo(pathname: string, options?: FileActionOptions) {
        return this._resourceHandler?.fileHandler?.appendTo(pathname, options) || operationNotSupported();
    }

    public saveAs(filename?: string, options?: FileActionOptions) {
        return this._resourceHandler?.fileHandler?.saveAs(filename || this._resourceHandler.userSettings.outputArchiveName, options) || operationNotSupported();
    }

    public saveFiles(format: string, options: FileActionOptions) {
        return this._resourceHandler?.fileHandler?.saveFiles(format, options) || operationNotSupported();
    }

    public appendFiles(filename: string, options: FileActionOptions) {
        return this._resourceHandler?.fileHandler?.appendFiles(filename, options) || operationNotSupported();
    }

    public copyFiles(directory: string, options: FileActionOptions) {
        return this._resourceHandler?.fileHandler?.copyFiles(directory, options) || operationNotSupported();
    }

    public reset() {
        this._nextId = 0;
        this.elementMap.clear();
        resetSessionAll();
        this.session.active.clear();
        this._controllerHandler.reset();
        this._resourceHandler?.reset();
        for (const ext of this.extensions) {
            ext.reset();
        }
        this.closed = false;
    }

    public parseDocument(...elements: (string | HTMLElement)[]) {
        const [processing, rootElements] = this.createSessionThread(elements);
        let documentRoot: HTMLElement;
        if (rootElements.size === 0) {
            return Promise.reject(new Error(DOCUMENT_ROOT_NOT_FOUND));
        }
        else {
            documentRoot = rootElements.values().next().value;
        }
        const resourceHandler = this._resourceHandler;
        const preloadItems: PreloadItem[] = [];
        let preloaded: Undef<HTMLImageElement[]>,
            preloadImages: Undef<boolean>,
            preloadFonts: Undef<boolean>;
        if (resourceHandler) {
            ({ preloadImages, preloadFonts } = resourceHandler.userSettings);
        }
        const parseSrcSet = (value: string) => {
            if (value !== '') {
                for (const uri of value.split(',')) {
                    resourceHandler!.addImageData(resolvePath(splitPairStart(uri.trim(), ' ')));
                }
            }
        };
        if (resourceHandler) {
            for (const element of rootElements) {
                element.querySelectorAll('picture > source').forEach((source: HTMLSourceElement) => parseSrcSet(source.srcset));
                element.querySelectorAll('video').forEach((source: HTMLVideoElement) => resourceHandler.addImageData(source.poster));
                element.querySelectorAll('input[type=image]').forEach((image: HTMLInputElement) => resourceHandler.addImageData(image.src, image.width, image.height));
                element.querySelectorAll('object, embed').forEach((source: HTMLObjectElement & HTMLEmbedElement) => {
                    const src = source.data || source.src;
                    if (src && (source.type.startsWith('image/') || parseMimeType(src).startsWith('image/'))) {
                        resourceHandler.addImageData(src.trim());
                    }
                });
                element.querySelectorAll('svg use').forEach((use: SVGUseElement) => {
                    const href = use.href.baseVal || use.getAttributeNS('xlink', 'href');
                    if (href && href.indexOf('#') > 0) {
                        const src = resolvePath(splitPairStart(href, '#'));
                        if (FILE.SVG.test(src)) {
                            resourceHandler.addImageData(src);
                        }
                    }
                });
            }
        }
        if (preloadImages) {
            preloaded = [];
            const { image, rawData } = resourceHandler!.mapOfAssets;
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
            for (const [uri, data] of rawData.entries()) {
                const mimeType = data.mimeType;
                if (mimeType && mimeType.startsWith('image/') && !mimeType.endsWith('svg+xml')) {
                    let src = `data:${mimeType};`;
                    if (data.base64) {
                        src += 'base64,' + data.base64;
                    }
                    else if (data.content) {
                        src += data.content;
                    }
                    else {
                        continue;
                    }
                    const element = document.createElement('img');
                    element.src = src;
                    const { naturalWidth: width, naturalHeight: height } = element;
                    if (width && height) {
                        data.width = width;
                        data.height = height;
                        image.set(uri, { width, height, uri: data.filename });
                    }
                    else {
                        document.body.appendChild(element);
                        preloaded.push(element);
                    }
                }
            }
        }
        if (preloadFonts) {
            for (const item of resourceHandler!.mapOfAssets.fonts.values()) {
                for (const font of item) {
                    const srcUrl = font.srcUrl;
                    if (srcUrl && !preloadItems.includes(srcUrl)) {
                        preloadItems.push(srcUrl);
                    }
                }
            }
        }
        if (resourceHandler) {
            for (const element of rootElements) {
                element.querySelectorAll('img').forEach((image: HTMLImageElement) => {
                    parseSrcSet(image.srcset);
                    if (!preloadImages) {
                        resourceHandler.addImage(image);
                    }
                    else if (FILE.SVG.test(image.src)) {
                        preloadItems.push(image.src);
                    }
                    else if (image.complete) {
                        resourceHandler.addImage(image);
                    }
                    else {
                        preloadItems.push(image);
                    }
                });
            }
        }
        if (preloadItems.length) {
            processing.initializing = true;
            return Promise.all(preloadItems.map(item => {
                return new Promise((resolve, reject) => {
                    if (typeof item === 'string') {
                        if (FILE.SVG.test(item)) {
                            fetch(item).then(async result => resolve(await result.text()));
                        }
                        else {
                            fetch(item).then(async result => resolve(await result.arrayBuffer()));
                        }
                    }
                    else {
                        item.addEventListener('load', () => resolve(item));
                        item.addEventListener('error', () => reject(item));
                    }
                });
            }))
            .then((result: PreloadItem[]) => {
                for (let i = 0, length = result.length; i < length; ++i) {
                    const value = result[i];
                    const uri = preloadItems[i];
                    if (typeof uri === 'string') {
                        if (typeof value === 'string') {
                            if (FILE.SVG.test(uri)) {
                                resourceHandler!.addRawData(uri, 'image/svg+xml', value, { encoding: 'utf8' });
                            }
                        }
                    }
                    else {
                        resourceHandler!.addImage(value as HTMLImageElement);
                    }
                }
                return this.resumeSessionThread(processing, rootElements, elements.length, documentRoot, preloaded);
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
                return !message || !this.userSettings.showErrorMessages || confirm(`FAIL: ${message}`) ? this.resumeSessionThread(processing, rootElements, elements.length, documentRoot, preloaded) : Promise.reject(new Error(message));
            });
        }
        return Promise.resolve(this.resumeSessionThread(processing, rootElements, elements.length));
    }

    public parseDocumentSync(...elements: (string | HTMLElement)[]): Undef<T | T[]> {
        const sessionData = this.createSessionThread(elements);
        return this.resumeSessionThread(sessionData[0], sessionData[1], elements.length);
    }

    public createCache(documentRoot: HTMLElement, sessionId: string) {
        const node = this.createRootNode(documentRoot, sessionId);
        if (node) {
            this.controllerHandler.sortInitialCache(this.getProcessingCache(sessionId));
        }
        return node;
    }

    public setStyleMap(sessionId: string, processing: squared.base.AppProcessing<T>) {
        const styleSheets = document.styleSheets;
        for (let i = 0, length = styleSheets.length; i < length; ++i) {
            const styleSheet = styleSheets[i];
            let mediaText: Undef<string>;
            try {
                mediaText = styleSheet.media.mediaText;
            }
            catch {
            }
            if (!mediaText || checkMediaRule(mediaText)) {
                this.applyStyleSheet(styleSheet, sessionId, processing);
            }
        }
    }

    public setExtensions(namespaces: string[] = this.userSettings.builtInExtensions) {
        const { builtInExtensions, extensions } = this;
        extensions.length = 0;
        for (let i = 0, length = namespaces.length; i < length; ++i) {
            let name = namespaces[i],
                ext = builtInExtensions.get(name);
            if (ext) {
                ext.application = this;
                extensions.push(ext);
            }
            else {
                const namespace = name + '.';
                for ([name, ext] of builtInExtensions.entries()) {
                    if (name.startsWith(namespace) && !extensions.includes(ext)) {
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
        return this.session.active.get(sessionId)?.cache || new NodeList();
    }

    public getDatasetName(attr: string, element: HTMLElement) {
        return element.dataset[attr + capitalize(this.systemName)] || element.dataset[attr];
    }

    public setDatasetName(attr: string, element: HTMLElement, value: string) {
        element.dataset[attr + capitalize(this.systemName)] = value;
    }

    public toString() {
        return this.systemName;
    }

    protected createRootNode(rootElement: HTMLElement, sessionId: string) {
        const processing = this.getProcessing(sessionId)!;
        const extensions = processing.extensions.filter(item => !!item.beforeInsertNode) as Extension<T>[];
        const node = this.cascadeParentNode(
            processing.cache,
            processing.excluded,
            rootElement,
            sessionId,
            0,
            processing.rootElements,
            extensions.length ? extensions : undefined
        );
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
                    let j = 0;
                    for (let i = 0; i < length; ++i) {
                        const element = children[i] as HTMLElement;
                        let child: Undef<T>;
                        if (element === previousElement) {
                            child = previousNode;
                        }
                        else {
                            child = new this.Node(id--, sessionId, element);
                            this._afterInsertNode(child);
                        }
                        if (child) {
                            child.init(parent, depth + 1, j);
                            child.actualParent = parent;
                            elements[j++] = child;
                        }
                    }
                    elements.length = j;
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

    protected cascadeParentNode(cache: NodeList<T>, excluded: NodeList<T>, parentElement: HTMLElement, sessionId: string, depth: number, rootElements: Set<HTMLElement>, extensions?: Extension<T>[]) {
        const node = this.insertNode(parentElement, sessionId);
        if (node) {
            const controllerHandler = this.controllerHandler;
            if (depth === 0) {
                cache.add(node);
            }
            if (controllerHandler.preventNodeCascade(node)) {
                return node;
            }
            const childDepth = depth + 1;
            const childNodes = parentElement.childNodes;
            const length = childNodes.length;
            const children: T[] = new Array(length);
            const elements: T[] = new Array(parentElement.childElementCount);
            let inlineText = true,
                plainText = false,
                j = 0, k = 0;
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
                else if (controllerHandler.includeElement(element)) {
                    if (extensions) {
                        const use = this.getDatasetName('use', element);
                        (use ? Application.prioritizeExtensions(use, extensions) : extensions).some(item => item.beforeInsertNode!(element, sessionId));
                    }
                    child = element.childNodes.length === 0 ? this.insertNode(element, sessionId) : this.cascadeParentNode(cache, excluded, element, sessionId, childDepth, rootElements, extensions);
                    if (child) {
                        elements[k++] = child;
                        inlineText = false;
                    }
                }
                else {
                    child = this.insertNode(element, sessionId);
                    if (child) {
                        excluded.add(child);
                        inlineText = false;
                    }
                }
                if (child) {
                    child.init(node, childDepth, j);
                    child.actualParent = node;
                    children[j++] = child;
                    cache.add(child);
                }
            }
            children.length = j;
            elements.length = k;
            node.naturalChildren = children;
            node.naturalElements = elements;
            if (inlineText && plainText) {
                node.inlineText = inlineText;
            }
            node.retainAs(children);
            if (k > 0 && this.userSettings.createQuerySelectorMap) {
                node.queryMap = this.createQueryMap(elements, k);
            }
        }
        return node;
    }

    protected visibleText(node: T, element: Element) {
        return element.nodeName === '#text' && (!isEmptyString(element.textContent!) || node.preserveWhiteSpace && (node.tagName !== 'PRE' || node.element!.childElementCount === 0));
    }

    protected createQueryMap(elements: T[], length: number) {
        const result: T[][] = [elements];
        for (let i = 0; i < length; ++i) {
            const childMap = elements[i].queryMap;
            if (childMap) {
                for (let j = 0, k = 1, q = childMap.length; j < q; ++j) {
                    result[k] = result[k++]?.concat(childMap[j] as T[]) || childMap[j];
                }
            }
        }
        return result;
    }

    private applyStyleRule(item: CSSStyleRule, sessionId: string) {
        const resourceHandler = this._resourceHandler;
        const styleSheetHref = item.parentStyleSheet?.href || location.href;
        const cssText = item.cssText;
        switch (item.type) {
            case CSSRule.STYLE_RULE: {
                const unusedStyles = this.session.unusedStyles;
                const baseMap: StringMap = {};
                const important: ObjectMap<boolean> = {};
                const cssStyle = item.style;
                const parseImageUrl = (attr: string) => {
                    const value = baseMap[attr];
                    if (value && value !== 'initial') {
                        let result: Undef<string>,
                            match: Null<RegExpExecArray>;
                        while (match = REGEXP_DATAURI.exec(value)) {
                            if (match[2]) {
                                if (resourceHandler) {
                                    const [mimeType, encoding] = match[2].trim().split(/\s*;\s*/);
                                    resourceHandler.addRawData(match[1], mimeType, match[3], { encoding });
                                }
                            }
                            else {
                                const uri = resolvePath(match[3], styleSheetHref);
                                if (uri !== '') {
                                    if (resourceHandler) {
                                        resourceHandler.addImageData(uri);
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
                const hasExactValue = (attr: string, value: string) => new RegExp(`\\b${attr}[\\s\\n]*:[\\s\\n]*(?:${value})[\\s\\n]*;?`).test(cssText);
                const hasPartialValue = (attr: string, value: string) => new RegExp(`\\b${attr}[\\s\\n]*:[^;]*?${value}[^;]*;?`).test(cssText);
                const items = Array.from(cssStyle);
                for (let i = 0, length = items.length; i < length; ++i) {
                    const attr = items[i];
                    if (attr[0] === '-') {
                        continue;
                    }
                    const baseAttr = convertCamelCase(attr);
                    let value: string = cssStyle[attr];
                    switch (value) {
                        case 'initial':
                            if (CSS_PROPERTIES[baseAttr]?.value === 'auto') {
                                value = 'auto';
                                break;
                            }
                        case 'normal':
                            valid: {
                                if (!hasExactValue(attr, value)) {
                                    for (const name in CSS_SHORTHANDNONE) {
                                        const css = CSS_SHORTHANDNONE[name];
                                        if ((css.value as string[]).includes(baseAttr)) {
                                            const cssName = css.name!;
                                            if (hasExactValue(cssName, 'none|initial') || value === 'initial' && hasPartialValue(cssName, 'initial') || css.valueOfNone && hasExactValue(cssName, css.valueOfNone)) {
                                                break valid;
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
                    const attr = convertCamelCase(match[1]);
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
                for (const selectorText of parseSelectorText(item.selectorText, true)) {
                    const specificity = getSpecificity(selectorText);
                    const [selector, target] = splitPair(selectorText, '::');
                    const targetElt = target ? '::' + target : '';
                    const elements = document.querySelectorAll(selector || '*');
                    const q = elements.length;
                    if (q === 0) {
                        if (unusedStyles) {
                            unusedStyles.add(selectorText);
                        }
                        continue;
                    }
                    for (let i = 0; i < q; ++i) {
                        const element = elements[i];
                        const attrStyle = 'styleMap' + targetElt;
                        const attrSpecificity = 'styleSpecificity' + targetElt;
                        const styleData = getElementCache<StringMap>(element, attrStyle, sessionId);
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
            case CSSRule.FONT_FACE_RULE: {
                if (resourceHandler) {
                    const attr = REGEXP_FONTFACE.exec(cssText)?.[1];
                    if (attr) {
                        const src = REGEXP_FONTSRC.exec(attr)?.[1];
                        let fontFamily = REGEXP_FONTFAMILY.exec(attr)?.[1].trim();
                        if (src && fontFamily) {
                            fontFamily = trimBoth(fontFamily, '"');
                            const fontStyle = REGEXP_FONTSTYLE.exec(attr)?.[1].toLowerCase() || 'normal';
                            const fontWeight = parseInt(REGEXP_FONTWEIGHT.exec(attr)?.[1] || '400');
                            for (const value of src.split(',')) {
                                const urlMatch = REGEXP_FONTURL.exec(value);
                                if (urlMatch) {
                                    const data: FontFaceData = {
                                        fontFamily,
                                        fontWeight,
                                        fontStyle,
                                        srcFormat: urlMatch[4]?.toLowerCase().trim() || 'truetype'
                                    };
                                    const url = (urlMatch[2] || urlMatch[3]).trim();
                                    if (urlMatch[1] === 'url') {
                                        data.srcUrl = resolvePath(url, styleSheetHref);
                                    }
                                    else {
                                        data.srcLocal = url;
                                    }
                                    resourceHandler.addFont(data);
                                }
                            }
                        }
                    }
                }
                break;
            }
            case CSSRule.SUPPORTS_RULE:
                this.applyCSSRuleList(((item as unknown) as CSSSupportsRule).cssRules, sessionId);
                break;
        }
    }

    private applyStyleSheet(item: CSSStyleSheet, sessionId: string, processing: squared.base.AppProcessing<T>) {
        try {
            const cssRules = item.cssRules;
            if (cssRules) {
                const parseConditionText = (rule: string, value: string) => new RegExp(`\\s*@${rule}([^{]+)`).exec(value)?.[1].trim() || value;
                for (let i = 0, length = cssRules.length; i < length; ++i) {
                    const rule = cssRules[i];
                    switch (rule.type) {
                        case CSSRule.STYLE_RULE:
                        case CSSRule.FONT_FACE_RULE:
                            this.applyStyleRule(rule as CSSStyleRule, sessionId);
                            break;
                        case CSSRule.IMPORT_RULE:
                            if (this._resourceHandler) {
                                const uri = resolvePath((rule as CSSImportRule).href, rule.parentStyleSheet?.href || location.href);
                                if (uri !== '') {
                                    this._resourceHandler.addRawData(uri, 'text/css', undefined, { encoding: 'utf8' });
                                }
                            }
                            this.applyStyleSheet((rule as CSSImportRule).styleSheet, sessionId, processing);
                            break;
                        case CSSRule.MEDIA_RULE:
                            if (checkMediaRule((rule as CSSConditionRule).conditionText || parseConditionText('media', rule.cssText))) {
                                this.applyCSSRuleList((rule as CSSConditionRule).cssRules, sessionId);
                            }
                            break;
                        case CSSRule.SUPPORTS_RULE:
                            if (CSS.supports((rule as CSSConditionRule).conditionText || parseConditionText('supports', rule.cssText))) {
                                this.applyCSSRuleList((rule as CSSConditionRule).cssRules, sessionId);
                            }
                            break;
                        case CSSRule.KEYFRAMES_RULE: {
                            const value = parseKeyframes((rule as CSSKeyframesRule).cssRules);
                            if (value) {
                                const keyframesMap = processing.keyframesMap || (processing.keyframesMap = new Map<string, KeyframeData>());
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
            (this.userSettings.showErrorMessages ? alert : console.log)(CSS_CANNOT_BE_PARSED + '\n\n' + item.href + '\n\n' + err);
        }
    }

    private applyCSSRuleList(rules: CSSRuleList, sessionId: string) {
        for (let i = 0, length = rules.length; i < length; ++i) {
            this.applyStyleRule(rules[i] as CSSStyleRule, sessionId);
        }
    }

    private createSessionThread(elements: (string | HTMLElement)[]): [squared.base.AppProcessing<T>, Set<HTMLElement>] {
        const sessionId = this._controllerHandler.generateSessionId;
        const rootElements = new Set<HTMLElement>();
        const extensions = this.extensionsAll;
        const processing: squared.base.AppProcessing<T> = {
            sessionId,
            initializing: false,
            cache: new NodeList<T>(undefined, sessionId),
            excluded: new NodeList<T>(undefined, sessionId),
            rootElements,
            elementMap: newSessionInit(sessionId),
            extensions
        };
        const afterInsertNode = extensions.filter(item => !!item.afterInsertNode);
        if (afterInsertNode.length) {
            processing.afterInsertNode = afterInsertNode;
        }
        this.session.active.set(sessionId, processing);
        this._controllerHandler.init();
        this.setStyleMap(sessionId, processing);
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
                if (!element || !hasComputedStyle(element)) {
                    continue;
                }
                rootElements.add(element);
            }
        }
        return [processing, rootElements];
    }

    private resumeSessionThread(processing: squared.base.AppProcessing<T>, rootElements: Set<HTMLElement>, multipleRequest: number, documentRoot?: HTMLElement, preloaded?: HTMLImageElement[]) {
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
        let extensions: Extension<T>[] = [],
            children: T[] = [];
        for (const processing of active.values()) {
            extensions = extensions.concat(processing.extensions as Extension<T>[]);
            children = children.concat(processing.cache.children);
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