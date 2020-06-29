import Node from './node';
import NodeList from './nodelist';

type AppVieModel = squared.base.AppViewModel;
type FileActionOptions = squared.base.FileActionOptions;
type PreloadImage = HTMLImageElement | string;

const { CSS_PROPERTIES, checkMediaRule, getSpecificity, hasComputedStyle, insertStyleSheetRule, parseSelectorText } = squared.lib.css;
const { FILE, STRING } = squared.lib.regex;
const { frameworkNotInstalled, getElementCache, setElementCache } = squared.lib.session;
const { capitalize, convertCamelCase, parseMimeType, plainMap, promisify, resolvePath, trimBoth } = squared.lib.util;

const REGEXP_DATAURI = new RegExp(`url\\("?(${STRING.DATAURI})"?\\),?\\s*`, 'g');
const CSS_IMAGEURI = ['backgroundImage', 'listStyleImage', 'content'];

function addImageSrc(resourceHandler: squared.base.Resource<Node>, uri: string, width = 0, height = 0) {
    if (uri !== '') {
        if (width > 0 && height > 0 || !resourceHandler.getImage(uri)) {
            resourceHandler.addUnsafeData('image', uri, { width, height, uri });
        }
    }
}

function parseSrcSet(resourceHandler: squared.base.Resource<Node>, value: string) {
    if (value !== '') {
        for (const uri of value.split(',')) {
            addImageSrc(resourceHandler, resolvePath(uri.trim().split(' ')[0]));
        }
    }
}

const isSvg = (value: string) => FILE.SVG.test(value);
const parseConditionText = (rule: string, value: string) => new RegExp(`\\s*@${rule}([^{]+)`).exec(value)?.[1].trim() || value;

export default abstract class Application<T extends Node> implements squared.base.Application<T> {
    public static readonly KEY_NAME = 'squared.application';

    public builtInExtensions: ObjectMap<squared.base.Extension<T>> = {};
    public extensions: squared.base.Extension<T>[] = [];
    public closed = false;
    public readonly Node: Constructor<T>;
    public readonly session: squared.base.AppSession<T> = {
        active: new Map<string, squared.base.AppProcessing<T>>(),
        unusedStyles: new Set<string>()
    };
    public abstract userSettings: UserSettings;
    public abstract readonly systemName: string;

    private _nextId = 0;
    private readonly _afterInsertNode: BindGeneric<T, void>;
    private readonly _controllerHandler: squared.base.Controller<T>;
    private readonly _resourceHandler?: squared.base.Resource<T>;
    private readonly _extensionManager?: squared.base.ExtensionManager<T>;

    protected constructor(
        public readonly framework: number,
        nodeConstructor: Constructor<T>,
        ControllerConstructor: Constructor<T>,
        ResourceConstructor?: Constructor<T>,
        ExtensionManagerConstructor?: Constructor<T>)
    {
        this._controllerHandler = (new ControllerConstructor(this) as unknown) as squared.base.Controller<T>;
        if (ResourceConstructor) {
            this._resourceHandler = (new ResourceConstructor(this) as unknown) as squared.base.Resource<T>;
        }
        if (ExtensionManagerConstructor) {
            this._extensionManager = (new ExtensionManagerConstructor(this) as unknown) as squared.base.ExtensionManager<T>;
        }
        this._afterInsertNode = this._controllerHandler.afterInsertNode;
        this.Node = nodeConstructor;
    }

    public abstract insertNode(element: Element, sessionId: string): Undef<T>;
    public abstract afterCreateCache(node: T): void;
    public abstract set viewModel(data: Undef<AppVieModel>);
    public abstract get viewModel(): Undef<AppVieModel>;

    public createNode(sessionId: string, options: CreateNodeOptions) {
        return new this.Node(this.nextId, sessionId, options.element);
    }

    public copyToDisk(directory: string, options?: FileActionOptions) {
        return this._resourceHandler?.fileHandler?.copyToDisk(directory, options) || frameworkNotInstalled();
    }

    public appendToArchive(pathname: string, options?: FileActionOptions) {
        return this._resourceHandler?.fileHandler?.appendToArchive(pathname, options) || frameworkNotInstalled();
    }

    public saveToArchive(filename?: string, options?: FileActionOptions) {
        const resourceHandler = this._resourceHandler;
        return resourceHandler && resourceHandler.fileHandler?.saveToArchive(filename || resourceHandler.userSettings.outputArchiveName, options) || frameworkNotInstalled();
    }

    public createFrom(format: string, options: FileActionOptions) {
        return this._resourceHandler?.fileHandler?.createFrom(format, options) || frameworkNotInstalled();
    }

    public appendFromArchive(filename: string, options: FileActionOptions) {
        return this._resourceHandler?.fileHandler?.appendFromArchive(filename, options) || frameworkNotInstalled();
    }

    public finalize() {
        return this.closed;
    }

    public reset() {
        this._nextId = 0;
        this.session.active.clear();
        this.session.unusedStyles.clear();
        this.controllerHandler.reset();
        this.resourceHandler?.reset();
        for (const ext of this.extensions) {
            ext.subscribers.clear();
        }
        this.closed = false;
    }

    public parseDocument(...elements: any[]) {
        const resourceHandler = this._resourceHandler;
        const preloadImages = resourceHandler?.userSettings.preloadImages === true;
        const sessionId = this._controllerHandler.generateSessionId;
        const rootElements = new Set<HTMLElement>();
        const imageElements: PreloadImage[] = [];
        const processing: squared.base.AppProcessing<T> = {
            cache: new NodeList<T>(),
            excluded: new NodeList<T>(),
            rootElements,
            initializing: false
        };
        let documentRoot: Undef<HTMLElement>,
            preloaded: Undef<HTMLImageElement[]>;
        this.session.active.set(sessionId, processing);
        this._controllerHandler.init();
        this.setStyleMap(sessionId);
        const styleElement = insertStyleSheetRule('html > body { overflow: hidden !important; }');
        if (elements.length === 0) {
            documentRoot = this.mainElement;
            rootElements.add(documentRoot);
        }
        else {
            let i = 0;
            while (i < elements.length) {
                let element: Null<HTMLElement | string> = elements[i++];
                if (typeof element === 'string') {
                    element = document.getElementById(element);
                }
                if (!element || !hasComputedStyle(element)) {
                    continue;
                }
                if (!documentRoot) {
                    documentRoot = element;
                }
                rootElements.add(element);
            }
        }
        if (!documentRoot) {
            return Promise.reject(new Error('Document root not found.'));
        }
        if (resourceHandler) {
            for (const element of rootElements) {
                element.querySelectorAll('picture > source').forEach((source: HTMLSourceElement) => parseSrcSet(resourceHandler, source.srcset));
                element.querySelectorAll('video').forEach((source: HTMLVideoElement) => addImageSrc(resourceHandler, source.poster));
                element.querySelectorAll('input[type=image]').forEach((image: HTMLInputElement) => addImageSrc(resourceHandler, image.src, image.width, image.height));
                element.querySelectorAll('object, embed').forEach((source: HTMLObjectElement & HTMLEmbedElement) => {
                    const src = source.data || source.src;
                    if (src && (source.type.startsWith('image/') || parseMimeType(src).startsWith('image/'))) {
                        addImageSrc(resourceHandler, src.trim());
                    }
                });
                element.querySelectorAll('svg use').forEach((use: SVGUseElement) => {
                    const href = use.href.baseVal || use.getAttributeNS('xlink', 'href');
                    if (href && href.indexOf('#') > 0) {
                        const src = resolvePath(href.split('#')[0]);
                        if (isSvg(src)) {
                            addImageSrc(resourceHandler, src);
                        }
                    }
                });
            }
        }
        const resumeThread = () => {
            const extensions = this.extensions;
            processing.initializing = false;
            let i: number, length: number;
            if (preloaded) {
                length = preloaded.length;
                i = 0;
                while (i < length) {
                    const image = preloaded[i++];
                    if (image.parentElement) {
                        documentRoot!.removeChild(image);
                    }
                }
            }
            length = extensions.length;
            i = 0;
            while (i < length) {
                extensions[i++].beforeParseDocument(sessionId);
            }
            const success: T[] = [];
            for (const element of rootElements) {
                const node = this.createCache(element, sessionId);
                if (node) {
                    this.afterCreateCache(node);
                    success.push(node);
                }
            }
            i = 0;
            while (i < length) {
                extensions[i++].afterParseDocument(sessionId);
            }
            try {
                document.head.removeChild(styleElement);
            }
            catch {
            }
            return elements.length > 1 ? success : success[0];
        };
        if (preloadImages) {
            const { image, rawData } = resourceHandler!.mapOfAssets;
            preloaded = [];
            for (const item of image.values()) {
                const uri = item.uri as string;
                if (isSvg(uri)) {
                    imageElements.push(uri);
                }
                else if (item.width === 0 || item.height === 0) {
                    const element = document.createElement('img');
                    element.src = uri;
                    if (element.naturalWidth > 0 && element.naturalHeight > 0) {
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
                if (mimeType?.startsWith('image/') && !mimeType.endsWith('svg+xml')) {
                    const element = document.createElement('img');
                    element.src = `data:${mimeType};${data.base64 ? `base64,${data.base64}` : data.content}`;
                    const { naturalWidth: width, naturalHeight: height } = element;
                    if (width > 0 && height > 0) {
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
        if (resourceHandler) {
            for (const element of rootElements) {
                element.querySelectorAll('img').forEach((image: HTMLImageElement) => {
                    parseSrcSet(resourceHandler, image.srcset);
                    if (!preloadImages) {
                        resourceHandler.addImage(image);
                    }
                    else {
                        if (isSvg(image.src)) {
                            imageElements.push(image.src);
                        }
                        else if (image.complete) {
                            resourceHandler.addImage(image);
                        }
                        else {
                            imageElements.push(image);
                        }
                    }
                });
            }
        }
        if (imageElements.length > 0) {
            processing.initializing = true;
            return Promise.all(plainMap(imageElements, image => {
                return new Promise((resolve, reject) => {
                    if (typeof image === 'string') {
                        fetch(image, {
                            method: 'GET',
                            headers: new Headers({
                                'Accept': 'application/xhtml+xml, image/svg+xml',
                                'Content-Type': 'image/svg+xml'
                            })
                        })
                        .then(async result => resolve(await result.text()));
                    }
                    else {
                        image.addEventListener('load', () => resolve(image));
                        image.addEventListener('error', () => reject(image));
                    }
                });
            }))
            .then((result: PreloadImage[]) => {
                const length = result.length;
                for (let i = 0; i < length; ++i) {
                    const value = result[i];
                    if (typeof value === 'string') {
                        const uri = imageElements[i];
                        if (typeof uri === 'string') {
                            resourceHandler!.addRawData(uri, 'image/svg+xml', value, { encoding: 'utf8' });
                        }
                    }
                    else {
                        resourceHandler!.addImage(value);
                    }
                }
                return resumeThread();
            })
            .catch((error: Error | Event | HTMLImageElement) => {
                if (error instanceof Event) {
                    error = error.target as HTMLImageElement;
                }
                const message = error instanceof HTMLImageElement ? error.src : '';
                return message === '' || !this.userSettings.showErrorMessages || confirm(`FAIL: ${message}`) ? resumeThread() : Promise.reject(message);
            });
        }
        return promisify<T[]>(resumeThread)();
    }

    public createCache(documentRoot: HTMLElement, sessionId: string) {
        const node = this.createRootNode(documentRoot, sessionId);
        if (node) {
            this.controllerHandler.sortInitialCache(this.getProcessingCache(sessionId));
        }
        return node;
    }

    public setStyleMap(sessionId: string) {
        const styleSheets = document.styleSheets;
        const length = styleSheets.length;
        let i = 0;
        while (i < length) {
            const styleSheet = styleSheets[i++];
            let mediaText: Undef<string>;
            try {
                mediaText = styleSheet.media.mediaText;
            }
            catch {
            }
            if (!mediaText || checkMediaRule(mediaText)) {
                this.applyStyleSheet(styleSheet, sessionId);
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

    protected createRootNode(element: HTMLElement, sessionId: string) {
        const processing = this.getProcessing(sessionId)!;
        const extensions = this.extensionsCascade;
        const node = this.cascadeParentNode(processing.cache, processing.excluded, processing.rootElements, element, sessionId, 0, extensions.length > 0 ? extensions : undefined);
        if (node) {
            const parent = new this.Node(0, sessionId, element.parentElement);
            this._afterInsertNode(parent);
            node.parent = parent;
            node.actualParent = parent;
            if (node.tagName === 'HTML') {
                processing.documentElement = node;
            }
            else if (parent.tagName === 'HTML') {
                processing.documentElement = parent;
            }
            node.depth = 0;
            node.childIndex = 0;
            node.documentRoot = true;
            processing.node = node;
        }
        return node;
    }

    protected cascadeParentNode(cache: NodeList<T>, excluded: NodeList<T>, rootElements: Set<HTMLElement>, parentElement: HTMLElement, sessionId: string, depth: number, extensions?: squared.base.Extension<T>[]) {
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
            let inlineText = true;
            let i = 0, j = 0, k = 0;
            while (i < length) {
                const element = childNodes[i++] as HTMLElement;
                let child: Undef<T>;
                if (element.nodeName.charAt(0) === '#') {
                    if (element.nodeName === '#text') {
                        child = this.insertNode(element, sessionId);
                        child?.cssApply(node.textStyle);
                    }
                }
                else if (controllerHandler.includeElement(element)) {
                    child = this.cascadeParentNode(cache, excluded, rootElements, element, sessionId, childDepth, extensions);
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
            node.inlineText = inlineText;
            node.retainAs(children);
            if (k > 0 && this.userSettings.createQuerySelectorMap) {
                node.queryMap = this.createQueryMap(elements, k);
            }
        }
        return node;
    }

    protected createQueryMap(elements: T[], length: number) {
        const result: T[][] = [elements];
        let i = 0;
        while (i < length) {
            const childMap = elements[i++].queryMap;
            if (childMap) {
                const q = childMap.length;
                for (let j = 0; j < q; ++j) {
                    const k = j + 1;
                    result[k] = result[k]?.concat(childMap[j] as T[]) || childMap[j];
                }
            }
        }
        return result;
    }

    protected applyStyleRule(item: CSSStyleRule, sessionId: string) {
        const resourceHandler = this._resourceHandler;
        const styleSheetHref = item.parentStyleSheet?.href || location.href;
        const cssText = item.cssText;
        switch (item.type) {
            case CSSRule.SUPPORTS_RULE:
                this.applyCSSRuleList(((item as unknown) as CSSSupportsRule).cssRules, sessionId);
                break;
            case CSSRule.STYLE_RULE: {
                const unusedStyles = this.session.unusedStyles;
                const baseMap: StringMap = {};
                const important: ObjectMap<boolean> = {};
                const cssStyle = item.style;
                const items = Array.from(cssStyle);
                const length = items.length;
                let i = 0;
                while (i < length) {
                    const attr = items[i++];
                    baseMap[convertCamelCase(attr)] = cssStyle[attr];
                }
                const pattern = /\s*([a-z-]+):[^!;]+!important;/g;
                let match: Null<RegExpExecArray>;
                while (match = pattern.exec(cssText)) {
                    const attr = convertCamelCase(match[1]);
                    const value = CSS_PROPERTIES[attr]?.value;
                    if (Array.isArray(value)) {
                        i = 0;
                        while (i < value.length) {
                            important[value[i++]] = true;
                        }
                    }
                    else {
                        important[attr] = true;
                    }
                }
                i = 0;
                while (i < 3) {
                    const attr = CSS_IMAGEURI[i++];
                    const value = baseMap[attr];
                    if (value && value !== 'initial') {
                        let result: Undef<string>;
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
                                        addImageSrc(resourceHandler, uri);
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
                }
                for (const selectorText of parseSelectorText(item.selectorText, true)) {
                    const specificity = getSpecificity(selectorText);
                    const [selector, target] = selectorText.split('::');
                    const targetElt = target ? '::' + target : '';
                    const elements = document.querySelectorAll(selector || '*');
                    const q = elements.length;
                    if (q === 0) {
                        unusedStyles.add(selectorText);
                        continue;
                    }
                    i = 0;
                    while (i < q) {
                        const element = elements[i++];
                        const attrStyle = `styleMap${targetElt}`;
                        const attrSpecificity = `styleSpecificity${targetElt}`;
                        const styleData = getElementCache<StringMap>(element, attrStyle, sessionId);
                        if (styleData) {
                            const specificityData = getElementCache<ObjectMap<number>>(element, attrSpecificity, sessionId) || {};
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
                            setElementCache(element, 'sessionId', '0', sessionId);
                            setElementCache(element, attrStyle, sessionId, styleMap);
                            setElementCache(element, attrSpecificity, sessionId, specificityData);
                        }
                    }
                }
                break;
            }
            case CSSRule.FONT_FACE_RULE: {
                if (resourceHandler) {
                    const attr = /\s*@font-face\s*{([^}]+)}\s*/.exec(cssText)?.[1];
                    if (attr) {
                        const src = /\s*src:\s*([^;]+);/.exec(attr)?.[1];
                        let fontFamily = /\s*font-family:([^;]+);/.exec(attr)?.[1].trim();
                        if (src && fontFamily) {
                            fontFamily = trimBoth(fontFamily, '"');
                            const fontStyle = /\s*font-style:\s*(\w+)\s*;/.exec(attr)?.[1].toLowerCase() || 'normal';
                            const fontWeight = parseInt(/\s*font-weight:\s*(\d+)\s*;/.exec(attr)?.[1] || '400');
                            for (const value of src.split(',')) {
                                const urlMatch = /\s*(url|local)\((?:"((?:[^"]|\\")+)"|([^)]+))\)(?:\s*format\("?([\w-]+)"?\))?\s*/.exec(value);
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
        }
    }

    protected applyStyleSheet(item: CSSStyleSheet, sessionId: string) {
        try {
            const cssRules = item.cssRules;
            if (cssRules) {
                const length = cssRules.length;
                let i = 0;
                while (i < length) {
                    const rule = cssRules[i++];
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
                            this.applyStyleSheet((rule as CSSImportRule).styleSheet, sessionId);
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
                    }
                }
            }
        }
        catch (error) {
            (this.userSettings.showErrorMessages ? alert : console.log)(
                'CSS cannot be parsed inside <link> tags when loading files directly from your hard drive or from external websites. ' +
                'Either use a local web server, embed your CSS into a <style> tag, or you can also try using a different browser. ' +
                'See the README for more detailed instructions.\n\n' +
                item.href + '\n\n' + error);
        }
    }

    protected applyCSSRuleList(rules: CSSRuleList, sessionId: string) {
        const length = rules.length;
        let i = 0;
        while (i < length) {
            this.applyStyleRule(rules[i++] as CSSStyleRule, sessionId);
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

    get extensionManager() {
        return this._extensionManager;
    }

    get extensionsCascade(): squared.base.Extension<T>[] {
        return [];
    }

    get childrenAll() {
        const active = this.session.active;
        if (active.size === 1) {
            return (active.values().next().value as squared.base.AppProcessing<T>).cache.children;
        }
        let result: T[] = [];
        for (const item of active.values()) {
            result = result.concat(item.cache.children);
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