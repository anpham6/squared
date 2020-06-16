import Controller from './controller';
import Extension from './extension';
import ExtensionManager from './extensionmanager';
import Node from './node';
import NodeList from './nodelist';
import Resource from './resource';

type AppVieModel = squared.base.AppViewModel;
type FileActionOptions = squared.base.FileActionOptions;
type PreloadImage = HTMLImageElement | string;

const { CSS_PROPERTIES, checkMediaRule, getSpecificity, getStyle, hasComputedStyle, insertStyleSheetRule, parseSelectorText } = squared.lib.css;
const { capitalize, convertCamelCase, isString, parseMimeType, plainMap, promisify, resolvePath, trimBoth } = squared.lib.util;
const { FILE, STRING } = squared.lib.regex;
const { frameworkNotInstalled, getElementCache, setElementCache } = squared.lib.session;

const { image: ASSET_IMAGE, rawData: ASSET_RAWDATA } = Resource.ASSETS;

const REGEXP_DATAURI = new RegExp(`url\\("?(${STRING.DATAURI})"?\\),?\\s*`, 'g');

function addImageSrc(uri: string, width = 0, height = 0) {
    if (isString(uri)) {
        const image = ASSET_IMAGE.get(uri);
        if (width > 0 && height > 0 || !image || image.width === 0 || image.height === 0) {
            ASSET_IMAGE.set(uri, { width, height, uri });
        }
    }
}

function parseSrcSet(value: string) {
    if (value) {
        for (const uri of value.split(',')) {
            addImageSrc(resolvePath(uri.trim().split(' ')[0]));
        }
    }
}

function parseImageUrl(resourceHandler: Undef<Resource<Node>>, baseMap: StringMap, attr: string, styleSheetHref?: string) {
    const value = baseMap[attr];
    if (value && value !== 'initial') {
        REGEXP_DATAURI.lastIndex = 0;
        let result = value,
            match: Null<RegExpExecArray>;
        while (match = REGEXP_DATAURI.exec(value)) {
            if (match[2]) {
                const mimeType = match[2].trim().split(/\s*;\s*/);
                resourceHandler?.addRawData(match[1], mimeType[0], match[3], { encoding: mimeType[1] || 'utf8' });
            }
            else {
                const uri = resolvePath(match[3], styleSheetHref);
                if (uri !== '') {
                    if (resourceHandler && !resourceHandler.getImage(uri)) {
                        addImageSrc(uri);
                    }
                    result = result.replace(match[0], `url("${uri}")`);
                }
            }
        }
        baseMap[attr] = result;
    }
}

const isSvg = (value: string) => FILE.SVG.test(value);
const parseConditionText = (rule: string, value: string) => new RegExp(`\\s*@${rule}([^{]+)`).exec(value)?.[1].trim() || value;

export default abstract class Application<T extends Node> implements squared.base.Application<T> {
    public static readonly KEY_NAME = 'squared.application';

    public initializing = false;
    public closed = false;
    public readonly Node: Constructor<T>;
    public readonly rootElements = new Set<HTMLElement>();
    public readonly session: squared.base.AppSession = {
        active: []
    };
    public readonly processing: squared.base.AppProcessing<T> = {
        cache: new NodeList<T>(),
        excluded: new NodeList<T>(),
        unusedStyles: new Set<string>(),
        sessionId: ''
    };
    public abstract builtInExtensions: ObjectMap<Extension<T>>;
    public abstract extensions: Extension<T>[];
    public abstract userSettings: UserSettings;
    public abstract readonly systemName: string;

    protected _cascadeAll = false;
    protected _cache: squared.base.NodeList<T>;
    protected _afterInsertNode: BindGeneric<Node, void>;

    private readonly _controllerHandler: Controller<T>;
    private readonly _extensionManager: ExtensionManager<T>;
    private readonly _resourceHandler?: Resource<T>;

    protected constructor(
        public readonly framework: number,
        nodeConstructor: Constructor<T>,
        ControllerConstructor: Constructor<T>,
        ResourceConstructor?: Constructor<T>,
        ExtensionManagerConstructor?: Constructor<T>)
    {
        const cache = this.processing.cache;
        this._cache = cache;
        this._controllerHandler = (new ControllerConstructor(this, cache) as unknown) as Controller<T>;
        if (ResourceConstructor) {
            this._resourceHandler = (new ResourceConstructor(this, cache) as unknown) as Resource<T>;
        }
        this._extensionManager = (new (ExtensionManagerConstructor || ExtensionManager)(this, cache) as unknown) as ExtensionManager<T>;
        this._afterInsertNode = this._controllerHandler.afterInsertNode;
        this.Node = nodeConstructor;
    }

    public abstract set viewModel(data: Undef<AppVieModel>);
    public abstract get viewModel(): Undef<AppVieModel>;

    public afterCreateCache(node: T) {}

    public insertNode(element: Element) {
        return this.createNode({ element });
    }

    public createNode(options: CreateNodeOptions) {
        return new this.Node(this.nextId, this.processing.sessionId, options.element);
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
        const processing = this.processing;
        processing.cache.reset();
        processing.excluded.clear();
        processing.sessionId = '';
        processing.unusedStyles.clear();
        this.session.active.length = 0;
        this.controllerHandler.reset();
        this.resourceHandler?.reset();
        this.extensions.forEach(ext => ext.subscribers.clear());
        this.closed = false;
    }

    public parseDocument(...elements: any[]) {
        const { controllerHandler: controller, resourceHandler: resource } = this;
        this.initializing = false;
        this.rootElements.clear();
        const sessionId = controller.generateSessionId;
        this.processing.sessionId = sessionId;
        this.session.active.push(sessionId);
        controller.sessionId = sessionId;
        controller.init();
        this.setStyleMap();
        const preloadImages = !!resource && resource.userSettings.preloadImages;
        const preloaded: HTMLImageElement[] = [];
        const imageElements: PreloadImage[] = [];
        const styleElement = insertStyleSheetRule('html > body { overflow: hidden !important; }');
        let documentRoot: Undef<HTMLElement>;
        if (elements.length === 0) {
            documentRoot = document.body;
            this.rootElements.add(documentRoot);
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
                this.rootElements.add(element);
            }
        }
        if (!documentRoot) {
            return Promise.reject(new Error('Document root not found.'));
        }
        for (const element of this.rootElements) {
            element.querySelectorAll('picture > source').forEach((source: HTMLSourceElement) => parseSrcSet(source.srcset));
            element.querySelectorAll('video').forEach((source: HTMLVideoElement) => addImageSrc(source.poster));
            element.querySelectorAll('input[type=image]').forEach((image: HTMLInputElement) => addImageSrc(image.src, image.width, image.height));
            element.querySelectorAll('object').forEach((source: HTMLObjectElement) => {
                if (source.type.startsWith('image/') || parseMimeType(source.data).startsWith('image/')) {
                    addImageSrc(source.data.trim());
                }
            });
            element.querySelectorAll('svg use').forEach((use: SVGUseElement) => {
                const href = use.href.baseVal || use.getAttributeNS('xlink', 'href');
                if (href && href.indexOf('#') > 0) {
                    const src = resolvePath(href.split('#')[0]);
                    if (isSvg(src)) {
                        addImageSrc(src);
                    }
                }
            });
        }
        const resumeThread = () => {
            this.initializing = false;
            const length = preloaded.length;
            let i = 0;
            while (i < length) {
                const image = preloaded[i++];
                if (image.parentElement) {
                    documentRoot!.removeChild(image);
                }
            }
            preloaded.length = 0;
            this.extensions.forEach(ext => ext.beforeParseDocument());
            const success: T[] = [];
            for (const element of this.rootElements) {
                const node = this.createCache(element);
                if (node) {
                    this.afterCreateCache(node);
                    success.push(node);
                }
            }
            this.extensions.forEach(ext => ext.afterParseDocument());
            try {
                document.head.removeChild(styleElement);
            }
            catch {
            }
            return elements.length > 1 ? success : success[0];
        };
        if (preloadImages) {
            for (const image of ASSET_IMAGE.values()) {
                const uri = image.uri as string;
                if (isSvg(uri)) {
                    imageElements.push(uri);
                }
                else if (image.width === 0 || image.height === 0) {
                    const element = document.createElement('img');
                    element.src = uri;
                    if (element.naturalWidth > 0 && element.naturalHeight > 0) {
                        image.width = element.naturalWidth;
                        image.height = element.naturalHeight;
                    }
                    else {
                        documentRoot.appendChild(element);
                        preloaded.push(element);
                    }
                }
            }
            for (const [uri, data] of ASSET_RAWDATA.entries()) {
                const mimeType = data.mimeType;
                if (mimeType?.startsWith('image/') && !mimeType.endsWith('svg+xml')) {
                    const element = document.createElement('img');
                    element.src = `data:${mimeType};${data.base64 ? `base64,${data.base64}` : data.content}`;
                    const { naturalWidth: width, naturalHeight: height } = element;
                    if (width > 0 && height > 0) {
                        data.width = width;
                        data.height = height;
                        ASSET_IMAGE.set(uri, { width, height, uri: data.filename });
                    }
                    else {
                        document.body.appendChild(element);
                        preloaded.push(element);
                    }
                }
            }
        }
        if (resource) {
            for (const element of this.rootElements) {
                element.querySelectorAll('img').forEach((image: HTMLImageElement) => {
                    parseSrcSet(image.srcset);
                    if (!preloadImages) {
                        resource.addImage(image);
                    }
                    else {
                        if (isSvg(image.src)) {
                            imageElements.push(image.src);
                        }
                        else if (image.complete) {
                            resource.addImage(image);
                        }
                        else {
                            imageElements.push(image);
                        }
                    }
                });
            }
        }
        if (imageElements.length) {
            this.initializing = true;
            return Promise.all(plainMap(imageElements, image => {
                return new Promise((resolve, reject) => {
                    if (typeof image === 'string') {
                        (async () => {
                            const result = await fetch(image, { method: 'GET', headers: new Headers({ 'Accept': 'application/xhtml+xml, image/svg+xml', 'Content-Type': 'image/svg+xml' }) });
                            resolve(await result.text());
                        })();
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
                            resource!.addRawData(uri, 'image/svg+xml', value, { encoding: 'utf8' });
                        }
                    }
                    else {
                        resource!.addImage(value);
                    }
                }
                return resumeThread();
            })
            .catch((error: Error | Event | HTMLImageElement) => {
                let target = error;
                if (error instanceof Event) {
                    target = error.target as HTMLImageElement;
                }
                const message = target instanceof HTMLImageElement ? target.src : '';
                return !isString(message) || !this.userSettings.showErrorMessages || confirm(`FAIL: ${message}`) ? resumeThread() : Promise.reject(message);
            });
        }
        else {
            return promisify<T[]>(resumeThread)();
        }
    }

    public createCache(documentRoot: HTMLElement) {
        const node = this.createRootNode(documentRoot);
        if (node) {
            this.controllerHandler.sortInitialCache();
        }
        return node;
    }

    public setStyleMap() {
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
            if (!isString(mediaText) || checkMediaRule(mediaText)) {
                this.applyStyleSheet(styleSheet as CSSStyleSheet);
            }
        }
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

    protected createRootNode(element: HTMLElement) {
        const processing = this.processing;
        const cache = processing.cache;
        cache.clear();
        processing.excluded.clear();
        processing.documentElement = undefined;
        this._cascadeAll = false;
        const extensions = this.extensionsCascade;
        const node = extensions.length ? this.cascadeParentNode(element, 0, extensions) : this.cascadeParentNode(element, 0);
        if (node) {
            const parent = new this.Node(0, processing.sessionId, element.parentElement || document.documentElement);
            this._afterInsertNode(parent);
            node.parent = parent;
            node.actualParent = parent;
            node.childIndex = 0;
            node.documentRoot = true;
            if (parent.tagName === 'HTML') {
                processing.documentElement = parent;
            }
        }
        processing.node = node;
        cache.afterAdd = undefined;
        return node;
    }

    protected cascadeParentNode(parentElement: HTMLElement, depth: number, extensions?: Extension<T>[]) {
        const node = this.insertNode(parentElement);
        if (node) {
            const { controllerHandler: controller, processing } = this;
            const cache = processing.cache;
            node.depth = depth;
            if (depth === 0) {
                cache.add(node);
            }
            if (controller.preventNodeCascade(node)) {
                return node;
            }
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
                        child = this.insertNode(element);
                        if (child) {
                            child.cssApply(node.textStyle);
                        }
                    }
                }
                else if (controller.includeElement(element)) {
                    child = this.cascadeParentNode(element, depth + 1, extensions);
                    if (child) {
                        elements[k++] = child;
                        cache.add(child);
                        inlineText = false;
                    }
                }
                else {
                    child = this.insertNode(element);
                    if (child) {
                        processing.excluded.add(child);
                        inlineText = false;
                    }
                }
                if (child) {
                    child.$parent = node;
                    child.childIndex = j;
                    child.actualParent = node;
                    children[j++] = child;
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

    protected applyStyleRule(item: CSSStyleRule) {
        const resourceHandler = this.resourceHandler;
        const sessionId = this.processing.sessionId;
        const styleSheetHref = item.parentStyleSheet?.href || location.href;
        const cssText = item.cssText;
        switch (item.type) {
            case CSSRule.SUPPORTS_RULE:
                this.applyCSSRuleList(((item as unknown) as CSSSupportsRule).cssRules);
                break;
            case CSSRule.STYLE_RULE: {
                const baseMap: StringMap = {};
                {
                    const cssStyle = item.style;
                    const items = Array.from(cssStyle);
                    const length = items.length;
                    let i = 0;
                    while (i < length) {
                        const attr = items[i++];
                        baseMap[convertCamelCase(attr)] = cssStyle[attr];
                    }
                }
                parseImageUrl(resourceHandler, baseMap, 'backgroundImage', styleSheetHref);
                parseImageUrl(resourceHandler, baseMap, 'listStyleImage', styleSheetHref);
                parseImageUrl(resourceHandler, baseMap, 'content', styleSheetHref);
                const important: ObjectMap<boolean> = {};
                {
                    const pattern = /\s*([a-z-]+):[^!;]+!important;/g;
                    let match: Null<RegExpExecArray>;
                    while (match = pattern.exec(cssText)) {
                        const attr = convertCamelCase(match[1]);
                        const value = CSS_PROPERTIES[attr]?.value;
                        if (Array.isArray(value)) {
                            let i = 0;
                            while (i < value.length) {
                                important[value[i++]] = true;
                            }
                        }
                        else {
                            important[attr] = true;
                        }
                    }
                }
                for (const selectorText of parseSelectorText(item.selectorText, true)) {
                    const specificity = getSpecificity(selectorText);
                    const [selector, target] = selectorText.split('::');
                    const targetElt = target ? '::' + target : '';
                    const elements = document.querySelectorAll(selector || '*');
                    const q = elements.length;
                    if (q === 0) {
                        this.processing.unusedStyles.add(selectorText);
                        continue;
                    }
                    let i = 0;
                    while (i < q) {
                        const element = elements[i++];
                        const attrStyle = `styleMap${targetElt}`;
                        const attrSpecificity = `styleSpecificity${targetElt}`;
                        const styleData: StringMap = getElementCache(element, attrStyle, sessionId);
                        if (styleData) {
                            const specificityData: ObjectMap<number> = getElementCache(element, attrSpecificity, sessionId) || {};
                            for (const attr in baseMap) {
                                const previous = specificityData[attr];
                                const revised = specificity + (important[attr] ? 1000 : 0);
                                if (previous === undefined || revised >= previous) {
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
                            setElementCache(element, `style${targetElt}`, '0', getStyle(element, targetElt));
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
                        const fontFamily = trimBoth((/\s*font-family:([^;]+);/.exec(attr)?.[1] || '').trim(), '"');
                        if (fontFamily !== '') {
                            const match = (/\s*src:\s*([^;]+);/.exec(attr)?.[1] || '').split(',');
                            const length = match.length;
                            if (length) {
                                const fontStyle = /\s*font-style:\s*(\w+)\s*;/.exec(attr)?.[1].toLowerCase() || 'normal';
                                const fontWeight = parseInt(/\s*font-weight:\s*(\d+)\s*;/.exec(attr)?.[1] || '400');
                                let i = 0;
                                while (i < length) {
                                    const urlMatch = /\s*(url|local)\((?:"((?:[^"]|\\")+)"|([^)]+))\)(?:\s*format\("?([\w-]+)"?\))?\s*/.exec(match[i++]);
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
                }
                break;
            }
        }
    }

    protected applyStyleSheet(item: CSSStyleSheet) {
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
                            this.applyStyleRule(rule as CSSStyleRule);
                            break;
                        case CSSRule.IMPORT_RULE: {
                            const uri = resolvePath((rule as CSSImportRule).href, rule.parentStyleSheet?.href || location.href);
                            if (uri !== '') {
                                this.resourceHandler?.addRawData(uri, 'text/css', undefined, { encoding: 'utf8' });
                            }
                            this.applyStyleSheet((rule as CSSImportRule).styleSheet);
                            break;
                        }
                        case CSSRule.MEDIA_RULE:
                            if (checkMediaRule((rule as CSSConditionRule).conditionText || parseConditionText('media', rule.cssText))) {
                                this.applyCSSRuleList((rule as CSSConditionRule).cssRules);
                            }
                            break;
                        case CSSRule.SUPPORTS_RULE:
                            if (CSS.supports && CSS.supports((rule as CSSConditionRule).conditionText || parseConditionText('supports', rule.cssText))) {
                                this.applyCSSRuleList((rule as CSSConditionRule).cssRules);
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

    protected applyCSSRuleList(rules: CSSRuleList) {
        const length = rules.length;
        let i = 0;
        while (i < length) {
            this.applyStyleRule(rules[i++] as CSSStyleRule);
        }
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

    get extensionsCascade(): Extension<T>[] {
        return [];
    }

    get nextId() {
        return this._cache.nextId;
    }

    get length() {
        return 0;
    }
}