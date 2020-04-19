import { AppProcessing, AppSession, AppViewModel } from '../../@types/base/internal';
import { FileActionOptions, UserSettings } from '../../@types/base/application';

import Controller from './controller';
import Extension from './extension';
import ExtensionManager from './extensionmanager';
import Node from './node';
import NodeList from './nodelist';
import Resource from './resource';

const $lib = squared.lib;

const { getSpecificity, getStyle, hasComputedStyle, insertStyleSheetRule, parseSelectorText, checkMediaRule } = $lib.css;
const { isTextNode } = $lib.dom;
const { capitalize, convertCamelCase, isString, objectMap, resolvePath } = $lib.util;
const { CHAR, FILE, STRING, XML } = $lib.regex;
const { getElementCache, setElementCache } = $lib.session;

const { image: ASSET_IMAGE, rawData: ASSET_RAWDATA } = Resource.ASSETS;

type PreloadImage = HTMLImageElement | string;
type ResultCatch = (error: Error) => void;

const REGEX_MEDIATEXT = /all|screen/;
const REGEX_BACKGROUND = /^background/;
const REGEX_IMPORTANT = /\s*([a-z-]+):[^!;]+!important;/g;
const REGEX_FONTFACE = /\s*@font-face\s*{([^}]+)}\s*/;
const REGEX_FONTFAMILY = /\s*font-family:[^\w]*([^'";]+)/;
const REGEX_FONTSRC = /\s*src:\s*([^;]+);/;
const REGEX_FONTSTYLE = /\s*font-style:\s*(\w+)\s*;/;
const REGEX_FONTWEIGHT = /\s*font-weight:\s*(\d+)\s*;/;
const REGEX_URL = /\s*(url|local)\((?:["']([^'")]+)["']|([^)]+))\)(?:\s*format\(["']?([\w-]+)["']?\))?\s*/;
const REGEX_DATAURI = new RegExp(`url\\(["']?(${STRING.DATAURI})["']?\\),?\\s*`, 'g');

function addImageSrc(uri: string, width = 0, height = 0) {
    if (uri !== '') {
        const image = ASSET_IMAGE.get(uri);
        if (width > 0 && height > 0 || !image || image.width === 0 || image.height === 0) {
            ASSET_IMAGE.set(uri, { width, height, uri });
        }
    }
}

function parseSrcSet(value: string) {
    if (value !== '') {
        value.split(XML.SEPARATOR).forEach(uri => {
            if (uri !== '') {
                addImageSrc(resolvePath(uri.split(CHAR.SPACE)[0]));
            }
        });
    }
}

async function getImageSvgAsync(value: string) {
    return (await fetch(value, { method: 'GET', headers: new Headers({ 'Accept': 'application/xhtml+xml, image/svg+xml', 'Content-Type': 'image/svg+xml' }) })).text();
}

const isSvg = (value: string) => FILE.SVG.test(value);
const parseConditionText = (rule: string, value: string) => new RegExp(`\\s*@${rule}([^{]+)`).exec(value)?.[1].trim() || value;

export default abstract class Application<T extends Node> implements squared.base.Application<T> {
    public static KEY_NAME = 'squared.application';

    public initializing = false;
    public closed = false;
    public systemName = '';
    public readonly Node: Constructor<T>;
    public readonly rootElements = new Set<HTMLElement>();
    public readonly session: AppSession<T> = {
        active: []
    };
    public readonly processing: AppProcessing<T> = {
        cache: new NodeList<T>(),
        excluded: new NodeList<T>(),
        sessionId: ''
    };
    public abstract builtInExtensions: ObjectMap<Extension<T>>;
    public abstract extensions: Extension<T>[];
    public abstract userSettings: UserSettings;

    protected _cascadeAll = false;
    protected _cache: squared.base.NodeList<T>;
    protected _afterInsertNode: BindGeneric<Node, void>;

    private readonly _controllerHandler: Controller<T>;
    private readonly _resourceHandler: Resource<T>;
    private readonly _extensionManager: ExtensionManager<T>;

    protected constructor(
        public framework: number,
        nodeConstructor: Constructor<T>,
        ControllerConstructor: Constructor<T>,
        ResourceConstructor: Constructor<T>,
        ExtensionManagerConstructor: Constructor<T>)
    {
        const cache = this.processing.cache;
        this._cache = cache;
        this._controllerHandler = <Controller<T>> (new ControllerConstructor(this, cache) as unknown);
        this._resourceHandler = <Resource<T>> (new ResourceConstructor(this, cache) as unknown);
        this._extensionManager = <ExtensionManager<T>> (new ExtensionManagerConstructor(this, cache) as unknown);
        this._afterInsertNode = this._controllerHandler.afterInsertNode;
        this.Node = nodeConstructor;
    }

    public abstract createNode(options: {}): T;
    public abstract insertNode(element: Element, parent?: T): Undef<T>;
    public abstract afterCreateCache(node: T): void;
    public abstract finalize(): void;

    public abstract set viewModel(data: Undef<AppViewModel>);
    public abstract get viewModel(): Undef<AppViewModel>;

    public copyToDisk(directory: string, options?: FileActionOptions) {
        this.fileHandler?.copyToDisk(directory, options);
    }

    public appendToArchive(pathname: string, options?: FileActionOptions) {
        this.fileHandler?.appendToArchive(pathname, options);
    }

    public saveToArchive(filename?: string, options?: FileActionOptions) {
        this.fileHandler?.saveToArchive(filename || this.userSettings.outputArchiveName, options);
    }

    public createFrom(format: string, options: FileActionOptions) {
        this.fileHandler?.createFrom(format, options);
    }

    public appendFromArchive(filename: string, options: FileActionOptions) {
        this.fileHandler?.appendFromArchive(filename, options);
    }

    public reset() {
        const processing = this.processing;
        processing.cache.reset();
        processing.excluded.clear();
        processing.sessionId = '';
        this.session.active.length = 0;
        this.controllerHandler.reset();
        this.resourceHandler.reset();
        this.fileHandler?.reset();
        this.extensions.forEach(ext => ext.subscribers.clear());
        this.closed = false;
    }

    public parseDocument(...elements: any[]): PromiseObject {
        const { controllerHandler: controller, resourceHandler: resource } = this;
        this.initializing = false;
        this.rootElements.clear();
        const sessionId = controller.generateSessionId;
        this.processing.sessionId = sessionId;
        this.session.active.push(sessionId);
        controller.sessionId = sessionId;
        controller.init();
        this.setStyleMap();
        const preloaded: HTMLImageElement[] = [];
        const preloadImages = this.userSettings.preloadImages;
        const imageElements: PreloadImage[] = [];
        const styleElement = insertStyleSheetRule('html > body { overflow: hidden !important; }');
        const removePreloaded = () => {
            this.initializing = false;
            preloaded.forEach(image => {
                if (image.parentElement) {
                    documentRoot.removeChild(image);
                }
            });
            preloaded.length = 0;
        };
        let THEN: Undef<FunctionVoid>;
        let CATCH: Undef<ResultCatch>;
        let FINALLY: Undef<FunctionVoid>;
        const resumeThread = () => {
            removePreloaded();
            this.extensions.forEach(ext => ext.beforeParseDocument());
            for (const element of this.rootElements) {
                const node = this.createCache(element);
                if (node) {
                    this.afterCreateCache(node);
                }
            }
            this.extensions.forEach(ext => ext.afterParseDocument());
            try {
                document.head.removeChild(styleElement);
            }
            catch {
            }
            if (typeof THEN === 'function') {
                THEN.call(this);
            }
            if (typeof FINALLY === 'function') {
                FINALLY.call(this);
            }
        };
        if (elements.length === 0) {
            elements.push(document.body);
        }
        elements.forEach(value => {
            let element: Null<HTMLElement>;
            if (typeof value === 'string') {
                element = document.getElementById(value);
            }
            else if (hasComputedStyle(value)) {
                element = value;
            }
            else {
                return;
            }
            if (element) {
                this.rootElements.add(element);
            }
        });
        const documentRoot = this.rootElements.values().next().value;
        if (preloadImages) {
            for (const element of this.rootElements) {
                element.querySelectorAll('picture > source').forEach((source: HTMLSourceElement) => parseSrcSet(source.srcset));
                element.querySelectorAll('video').forEach((source: HTMLVideoElement) => addImageSrc(source.poster));
                element.querySelectorAll('input[type=image]').forEach((image: HTMLInputElement) => addImageSrc(image.src, image.width, image.height));
            }
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
        for (const element of this.rootElements) {
            element.querySelectorAll('img').forEach((image: HTMLImageElement) => {
                if (isSvg(image.src)) {
                    if (preloadImages) {
                        imageElements.push(image.src);
                    }
                }
                else {
                    if (preloadImages) {
                        parseSrcSet(image.srcset);
                    }
                    if (image.complete) {
                        resource.addImage(image);
                    }
                    else if (preloadImages) {
                        imageElements.push(image);
                    }
                }
            });
        }
        if (imageElements.length) {
            this.initializing = true;
            Promise.all(objectMap(imageElements, image => {
                return new Promise((resolve, reject) => {
                    if (typeof image === 'string') {
                        resolve(getImageSvgAsync(image));
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
                            resource.addRawData(uri, 'image/svg+xml', 'utf8', value);
                        }
                    }
                    else {
                        resource.addImage(value);
                    }
                }
                resumeThread();
            })
            .catch((error: Error | Event | HTMLImageElement) => {
                let target = error;
                if (error instanceof Event) {
                    target = <HTMLImageElement> error.target;
                }
                const message = target instanceof HTMLImageElement ? target.src : '';
                if (typeof CATCH === 'function') {
                    if (!(error instanceof Error)) {
                        error = new Error(message ? `FAIL: ${message}` : 'Unable to preload images.');
                    }
                    removePreloaded();
                    CATCH.call(this, error);
                }
                else if (!this.userSettings.showErrorMessages || !isString(message) || confirm(`FAIL: ${message}`)) {
                    resumeThread();
                    return;
                }
                else {
                    removePreloaded();
                }
                if (typeof FINALLY === 'function') {
                    FINALLY.call(this);
                }
            });
        }
        else {
            resumeThread();
        }
        const Result = class {
            public complete = false;
            constructor(public thisArg: any) {
            }
            public then(callback: FunctionVoid) {
                if (imageElements.length) {
                    THEN = callback;
                }
                else {
                    callback.call(this.thisArg);
                    if (typeof FINALLY === 'function') {
                        FINALLY.call(this.thisArg);
                    }
                    else {
                        this.complete = true;
                    }
                }
                return this;
            }
            public catch(callback: ResultCatch) {
                CATCH = callback;
                return this;
            }
            public finally(callback: FunctionVoid) {
                if (this.complete) {
                    if (typeof callback === 'function') {
                        callback.call(this.thisArg);
                    }
                }
                else {
                    FINALLY = callback;
                }
                return this;
            }
        };
        return new Result(this);
    }

    public async parseDocumentAsync(...elements: any[]): Promise<PromiseObject> {
        return await this.parseDocument(...elements);
    }

    public createCache(documentRoot: HTMLElement) {
        const node = this.createRootNode(documentRoot);
        if (node) {
            this.controllerHandler.sortInitialCache();
        }
        return node;
    }

    public getDatasetName(attr: string, element: HTMLElement) {
        return element.dataset[attr + capitalize(this.systemName)] || element.dataset[attr];
    }

    public setDatasetName(attr: string, element: HTMLElement, value: string) {
        element.dataset[attr + capitalize(this.systemName)] = value;
    }

    public toString() {
        return '';
    }

    protected createRootNode(element: HTMLElement) {
        const processing = this.processing;
        const cache = processing.cache;
        cache.clear();
        processing.excluded.clear();
        this._cascadeAll = false;
        const extensions = this.extensionsCascade;
        const node = this.cascadeParentNode(element, 0, extensions.length ? extensions : undefined);
        if (node) {
            const parent = new this.Node(0, processing.sessionId, element.parentElement || document.body, this._afterInsertNode);
            node.parent = parent;
            node.actualParent = parent;
            node.childIndex = 0;
            node.documentRoot = true;
        }
        processing.node = node;
        cache.afterAppend = undefined;
        return node;
    }

    protected cascadeParentNode(parentElement: HTMLElement, depth: number, extensions?: Extension<T>[]) {
        const node = this.insertNode(parentElement);
        if (node) {
            const { controllerHandler: controller, processing } = this;
            const cache = processing.cache;
            node.depth = depth;
            if (depth === 0) {
                cache.append(node);
            }
            if (controller.preventNodeCascade(parentElement)) {
                return node;
            }
            const { childElementCount, childNodes } = parentElement;
            const length = childNodes.length;
            const children: T[] = new Array(length);
            const elements: T[] = new Array(childElementCount);
            let inlineText = true;
            let i = 0, j = 0, k = 0;
            while (i < length) {
                const element = <HTMLElement> childNodes[i++];
                let child: Undef<T>;
                if (element.nodeName.charAt(0) === '#') {
                    if (isTextNode(element)) {
                        child = this.insertNode(element, node);
                    }
                }
                else if (controller.includeElement(element)) {
                    child = this.cascadeParentNode(element, depth + 1, extensions);
                    if (child) {
                        elements[k++] = child;
                        cache.append(child);
                        inlineText = false;
                    }
                }
                else {
                    child = this.insertNode(element);
                    if (child) {
                        processing.excluded.append(child);
                        inlineText = false;
                    }
                }
                if (child) {
                    child.parent = node;
                    child.actualParent = node;
                    child.childIndex = j;
                    children[j++] = child;
                }
            }
            children.length = j;
            elements.length = k;
            node.naturalChildren = children;
            node.naturalElements = elements;
            node.inlineText = inlineText;
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

    protected setStyleMap() {
        let warning = false;
        const applyStyleSheet = (item: CSSStyleSheet) => {
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
                                this.applyStyleRule(<CSSStyleRule> rule);
                                break;
                            case CSSRule.IMPORT_RULE:
                                applyStyleSheet((<CSSImportRule> rule).styleSheet);
                                break;
                            case CSSRule.MEDIA_RULE:
                                if (checkMediaRule((<CSSConditionRule> rule).conditionText || parseConditionText('media', rule.cssText))) {
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
                if (this.userSettings.showErrorMessages && !warning) {
                    alert('CSS cannot be parsed inside <link> tags when loading files directly from your hard drive or from external websites. ' +
                          'Either use a local web server, embed your CSS into a <style> tag, or you can also try using a different browser. ' +
                          'See the README for more detailed instructions.\n\n' +
                          item.href + '\n\n' + error);
                    warning = true;
                }
            }
        };
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
            if (!isString(mediaText) || REGEX_MEDIATEXT.test(mediaText)) {
                applyStyleSheet(<CSSStyleSheet> styleSheet);
            }
        }
    }

    protected applyStyleRule(item: CSSStyleRule) {
        const resourceHandler = this.resourceHandler;
        const sessionId = this.processing.sessionId;
        const styleSheetHref = item.parentStyleSheet?.href || undefined;
        const cssText = item.cssText;
        switch (item.type) {
            case CSSRule.SUPPORTS_RULE:
                this.applyCSSRuleList((<CSSSupportsRule> (item as unknown)).cssRules);
                break;
            case CSSRule.STYLE_RULE: {
                const cssStyle = item.style;
                const important: ObjectMap<boolean> = {};
                const baseMap: StringMap = {};
                const parseImageUrl = (attr: string) => {
                    const value = baseMap[attr];
                    if (value && value !== 'initial') {
                        let result = value;
                        REGEX_DATAURI.lastIndex = 0;
                        let match: Null<RegExpExecArray>;
                        while ((match = REGEX_DATAURI.exec(value)) !== null) {
                            if (match[2]) {
                                const mimeType = match[2].split(XML.DELIMITER);
                                resourceHandler.addRawData(match[1], mimeType[0].trim(), mimeType[1]?.trim() || 'utf8', match[3]);
                            }
                            else if (this.userSettings.preloadImages) {
                                const uri = resolvePath(match[3], styleSheetHref);
                                if (uri !== '') {
                                    if (!resourceHandler.getImage(uri)) {
                                        addImageSrc(uri);
                                    }
                                    result = result.replace(match[0], `url("${uri}")`);
                                }
                            }
                        }
                        baseMap[attr] = result;
                    }
                };
                Array.from(cssStyle).forEach(attr => baseMap[convertCamelCase(attr)] = cssStyle[attr]);
                parseImageUrl('backgroundImage');
                parseImageUrl('listStyleImage');
                parseImageUrl('content');
                REGEX_IMPORTANT.lastIndex = 0;
                let match: Null<RegExpExecArray>;
                while ((match = REGEX_IMPORTANT.exec(cssText)) !== null) {
                    const attr = convertCamelCase(match[1]);
                    switch (attr) {
                        case 'margin':
                            important.marginTop = true;
                            important.marginRight = true;
                            important.marginBottom = true;
                            important.marginLeft = true;
                            break;
                        case 'padding':
                            important.paddingTop = true;
                            important.paddingRight = true;
                            important.paddingBottom = true;
                            important.paddingLeft = true;
                            break;
                        case 'background':
                            important.backgroundColor = true;
                            important.backgroundImage = true;
                            important.backgroundSize = true;
                            important.backgroundRepeat = true;
                            important.backgroundPositionX = true;
                            important.backgroundPositionY = true;
                            break;
                        case 'backgroundPosition':
                            important.backgroundPositionX = true;
                            important.backgroundPositionY = true;
                            break;
                        case 'border':
                            important.borderTopStyle = true;
                            important.borderRightStyle = true;
                            important.borderBottomStyle = true;
                            important.borderLeftStyle = true;
                            important.borderTopWidth = true;
                            important.borderRightWidth = true;
                            important.borderBottomWidth = true;
                            important.borderLeftWidth = true;
                            important.borderTopColor = true;
                            important.borderRightColor = true;
                            important.borderBottomColor = true;
                            important.borderLeftColor = true;
                            break;
                        case 'borderStyle':
                            important.borderTopStyle = true;
                            important.borderRightStyle = true;
                            important.borderBottomStyle = true;
                            important.borderLeftStyle = true;
                            break;
                        case 'borderWidth':
                            important.borderTopWidth = true;
                            important.borderRightWidth = true;
                            important.borderBottomWidth = true;
                            important.borderLeftWidth = true;
                            break;
                        case 'borderColor':
                            important.borderTopColor = true;
                            important.borderRightColor = true;
                            important.borderBottomColor = true;
                            important.borderLeftColor = true;
                            break;
                        case 'font':
                            important.fontFamily = true;
                            important.fontStyle = true;
                            important.fontSize = true;
                            important.fontWeight = true;
                            important.lineHeight = true;
                            break;
                    }
                    important[attr] = true;
                }
                parseSelectorText(item.selectorText, true).forEach(selectorText => {
                    const specificity = getSpecificity(selectorText);
                    const [selector, target] = selectorText.split('::');
                    const targetElt = target ? '::' + target : '';
                    document.querySelectorAll(selector || '*').forEach((element: HTMLElement) => {
                        const attrStyle = `styleMap${targetElt}`;
                        const attrSpecificity = `styleSpecificity${targetElt}`;
                        const styleData: StringMap = getElementCache(element, attrStyle, sessionId);
                        if (styleData) {
                            const specificityData: ObjectMap<number> = getElementCache(element, attrSpecificity, sessionId) || {};
                            for (const attr in baseMap) {
                                const previous = specificityData[attr];
                                const revised = specificity + (important[attr] ? 1000 : 0);
                                if (previous === undefined || revised >= previous) {
                                    const value = baseMap[attr];
                                    if (value === 'initial' && REGEX_BACKGROUND.test(attr)) {
                                        if (cssStyle.background === 'none') {
                                            delete styleData[attr];
                                        }
                                    }
                                    else {
                                        styleData[attr] = value;
                                    }
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
                    });
                });
                break;
            }
            case CSSRule.FONT_FACE_RULE: {
                const attr = REGEX_FONTFACE.exec(cssText)?.[1];
                if (attr) {
                    const fontFamily = (REGEX_FONTFAMILY.exec(attr)?.[1] || '').trim();
                    const match = (REGEX_FONTSRC.exec(attr)?.[1] || '').split(XML.SEPARATOR);
                    if (fontFamily !== '' && match.length) {
                        const fontStyle = REGEX_FONTSTYLE.exec(attr)?.[1].toLowerCase() || 'normal';
                        const fontWeight = parseInt(REGEX_FONTWEIGHT.exec(attr)?.[1] || '400');
                        match.forEach(value => {
                            const urlMatch = REGEX_URL.exec(value);
                            if (urlMatch) {
                                let srcUrl: Undef<string>;
                                let srcLocal: Undef<string>;
                                const url = (urlMatch[2] || urlMatch[3]).trim();
                                if (urlMatch[1] === 'url') {
                                    srcUrl = resolvePath(url, styleSheetHref);
                                }
                                else {
                                    srcLocal = url;
                                }
                                resourceHandler.addFont({
                                    fontFamily,
                                    fontWeight,
                                    fontStyle,
                                    srcUrl,
                                    srcLocal,
                                    srcFormat: urlMatch[4]?.toLowerCase().trim() || 'truetype'
                                });
                            }
                        });
                    }
                }
                break;
            }
        }
    }

    protected applyCSSRuleList(rules: CSSRuleList) {
        const length = rules.length;
        let i = 0;
        while (i < length) {
            this.applyStyleRule(<CSSStyleRule> rules[i++]);
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

    get fileHandler() {
        return this._resourceHandler.fileHandler;
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