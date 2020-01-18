import { AppProcessing, AppSession, FileAsset, UserSettings } from '../../@types/base/application';

import Controller from './controller';
import Extension from './extension';
import ExtensionManager from './extensionmanager';
import Node from './node';
import NodeList from './nodelist';
import Resource from './resource';

const $lib = squared.lib;
const { getSpecificity, getStyle, hasComputedStyle, parseSelectorText, validMediaRule } = $lib.css;
const { isTextNode } = $lib.dom;
const { convertCamelCase, isString, objectMap, resolvePath } = $lib.util;
const { CHAR, STRING, XML } = $lib.regex;
const { getElementCache, setElementCache } = $lib.session;

const { images, rawData } = Resource.ASSETS;

type PreloadImage = HTMLImageElement | string;

const REGEX_MEDIATEXT = /all|screen/;
const REGEX_BACKGROUND = /^background/;
const REGEX_IMPORTANT = /\s*([a-z\-]+):.*?!important;/g;
const REGEX_FONTFACE = /\s*@font-face\s*{([^}]+)}\s*/;
const REGEX_FONTFAMILY = /\s*font-family:[^\w]*([^'";]+)/;
const REGEX_FONTSRC = /\s*src:\s*([^;]+);/;
const REGEX_FONTSTYLE = /\s*font-style:\s*(\w+)\s*;/;
const REGEX_FONTWEIGHT = /\s*font-weight:\s*(\d+)\s*;/;
const REGEX_URL = /\s*(url|local)\((?:['""]([^'")]+)['"]|([^)]+))\)(?:\s*format\(['"]?([\w\-]+)['"]?\))?\s*/;
const REGEX_DATAURI = new RegExp(`(url\\("(${STRING.DATAURI})"\\)),?\\s*`, 'g');

function addImageSrc(uri: string, width = 0, height = 0) {
    const image = images.get(uri);
    if (image === undefined || width > 0 && height > 0 || image.width === 0 && image.height === 0) {
        images.set(uri, { width, height, uri });
    }
}

function parseSrcSet(value: string) {
    for (const uri of value.split(XML.SEPARATOR)) {
        if (uri !== '') {
            addImageSrc(resolvePath(uri.split(CHAR.SPACE)[0].trim()));
        }
    }
}

async function getImageSvgAsync(value: string) {
    return (await fetch(value, { method: 'GET', headers: new Headers({ 'Accept': 'application/xhtml+xml, image/svg+xml', 'Content-Type': 'image/svg+xml' }) })).text();
}

const isSvgExtension = (value: string) => /\.svg$/.test(value.toLowerCase());
const parseConditionText = (rule: string, value: string) => new RegExp(`^@${rule}([^{]+)`).exec(value)?.[1].trim() || value;

export default abstract class Application<T extends Node> implements squared.base.Application<T> {
    public initializing = false;
    public closed = false;
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
    protected _nodeConstructor: Constructor<Node>;
    protected _nodeAfterInsert: BindGeneric<Node, void>;

    private _controllerHandler: Controller<T>;
    private _resourceHandler: Resource<T>;
    private _extensionManager: ExtensionManager<T>;

    protected constructor(
        public framework: number,
        nodeConstructor: Constructor<T>,
        ControllerConstructor: Constructor<T>,
        ResourceConstructor: Constructor<T>,
        ExtensionManagerConstructor: Constructor<T>)
    {
        const cache = this.processing.cache;
        this._cache = cache;
        const controllerHandler = <Controller<T>> (new ControllerConstructor(this, cache) as unknown);
        this._controllerHandler = controllerHandler;
        this._resourceHandler = <Resource<T>> (new ResourceConstructor(this, cache) as unknown);
        this._extensionManager = <ExtensionManager<T>> (new ExtensionManagerConstructor(this, cache) as unknown);
        this._nodeConstructor = nodeConstructor;
        this._nodeAfterInsert = controllerHandler.afterInsertNode;
    }

    public abstract insertNode(element: Element, parent?: T): T | undefined;
    public abstract afterCreateCache(element: HTMLElement): void;
    public abstract finalize(): void;

    public copyToDisk(directory: string, callback?: CallbackResult, assets?: FileAsset[]) {
        this.fileHandler?.copyToDisk(directory, assets, callback);
    }

    public appendToArchive(pathname: string, assets?: FileAsset[]) {
        this.fileHandler?.appendToArchive(pathname, assets);
    }

    public saveToArchive(filename?: string, assets?: FileAsset[]) {
        this.fileHandler?.saveToArchive(filename || this.userSettings.outputArchiveName, assets);
    }

    public reset() {
        const processing = this.processing;
        processing.cache.reset();
        processing.excluded.clear();
        processing.sessionId = '';
        this.session.active.length = 0;
        this.controllerHandler.reset();
        for (const ext of this.extensions) {
            ext.subscribers.clear();
        }
        this.closed = false;
    }

    public parseDocument(...elements: any[]): squared.PromiseResult {
        const { controllerHandler: controller, resourceHandler: resource } = this;
        let __THEN: Undefined<() => void>;
        this.rootElements.clear();
        this.initializing = false;
        const sessionId = controller.generateSessionId;
        this.processing.sessionId = sessionId;
        this.session.active.push(sessionId);
        controller.sessionId = sessionId;
        controller.init();
        this.setStyleMap();
        if (elements.length === 0) {
            elements.push(document.body);
        }
        for (const value of elements) {
            let element: HTMLElement | null;
            if (typeof value === 'string') {
                element = document.getElementById(value);
            }
            else if (hasComputedStyle(value)) {
                element = value;
            }
            else {
                continue;
            }
            if (element) {
                this.rootElements.add(element);
            }
        }
        const documentRoot = this.rootElements.values().next().value;
        const preloaded: HTMLImageElement[] = [];
        const resume = () => {
            this.initializing = false;
            for (const image of preloaded) {
                if (image.parentElement) {
                    documentRoot.removeChild(image);
                }
            }
            preloaded.length = 0;
            for (const ext of this.extensions) {
                ext.beforeParseDocument();
            }
            for (const element of this.rootElements) {
                if (this.createCache(element)) {
                    this.afterCreateCache(element);
                }
            }
            for (const ext of this.extensions) {
                ext.afterParseDocument();
            }
            if (typeof __THEN === 'function') {
                __THEN.call(this);
            }
        };
        const preloadImages = this.userSettings.preloadImages;
        const imageElements: PreloadImage[] = [];
        if (preloadImages) {
            for (const element of this.rootElements) {
                element.querySelectorAll('picture > source').forEach((source: HTMLSourceElement) => parseSrcSet(source.srcset));
                element.querySelectorAll('input[type=image]').forEach((image: HTMLInputElement) => addImageSrc(image.src, image.width, image.height));
            }
            for (const image of images.values()) {
                const uri = image.uri as string;
                if (isSvgExtension(uri)) {
                    imageElements.push(uri);
                }
                else if (image.width === 0 && image.height === 0) {
                    const element = document.createElement('img');
                    element.src = uri;
                    const { naturalWidth: width, naturalHeight: height } = element;
                    if (width > 0 && height > 0) {
                        image.width = width;
                        image.height = height;
                    }
                    else {
                        documentRoot.appendChild(element);
                        preloaded.push(element);
                    }
                }
            }
        }
        for (const [uri, data] of rawData.entries()) {
            const mimeType = data.mimeType;
            if (isString(mimeType) && /^image\//.test(mimeType) && !/svg\+xml$/.test(mimeType)) {
                const element = document.createElement('img');
                element.src = 'data:' + mimeType + ';' + (data.base64 ? 'base64,' + data.base64 : data.content);
                const { naturalWidth: width, naturalHeight: height } = element;
                if (width > 0 && height > 0) {
                    data.width = width;
                    data.height = height;
                    images.set(uri, { width, height, uri: data.filename });
                }
                else {
                    document.body.appendChild(element);
                    preloaded.push(element);
                }
            }
        }
        for (const element of this.rootElements) {
            element.querySelectorAll('img').forEach((image: HTMLImageElement) => {
                if (isSvgExtension(image.src)) {
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
            Promise.all(objectMap<PreloadImage, Promise<PreloadImage>>(imageElements, image => {
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
                for (let i = 0; i < length; i++) {
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
                resume();
            })
            .catch((error: Event) => {
                const message = (<HTMLImageElement> error.target)?.src || error['message'];
                if (!this.userSettings.showErrorMessages || !isString(message) || confirm('FAIL: ' + message)) {
                    resume();
                }
            });
        }
        else {
            resume();
        }
        const PromiseResult = class {
            public then(resolve: () => void) {
                if (imageElements.length) {
                    __THEN = resolve;
                }
                else {
                    resolve();
                }
            }
        };
        return new PromiseResult();
    }

    public createCache(documentRoot: HTMLElement) {
        const node = this.createRootNode(documentRoot);
        if (node) {
            (node.parent as T).setBounds();
            for (const item of this._cache) {
                item.setBounds();
                item.saveAsInitial();
            }
            this.controllerHandler.sortInitialCache();
            return true;
        }
        return false;
    }

    public createNode(element: Element) {
        return new this._nodeConstructor(this.nextId, this.processing.sessionId, element, this._nodeAfterInsert) as T;
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
            const parent = new this._nodeConstructor(0, processing.sessionId, element.parentElement || document.body, this._nodeAfterInsert);
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
            const CACHE = processing.cache;
            node.depth = depth;
            if (depth === 0) {
                CACHE.append(node);
            }
            if (controller.preventNodeCascade(parentElement)) {
                return node;
            }
            const { childElementCount, childNodes } = parentElement;
            const length = childNodes.length;
            const children: T[] = new Array(length);
            const elements: T[] = new Array(childElementCount);
            let inlineText = true;
            let j = 0;
            let k = 0;
            for (let i = 0; i < length; i++) {
                const element = <HTMLElement> childNodes[i];
                let child: T | undefined;
                if (element.nodeName.charAt(0) === '#') {
                    if (isTextNode(element)) {
                        child = this.insertNode(element, node);
                    }
                }
                else if (controller.includeElement(element)) {
                    child = this.cascadeParentNode(element, depth + 1, extensions);
                    if (child) {
                        elements[k++] = child;
                        CACHE.append(child);
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
            if (this.userSettings.createQuerySelectorMap && k > 0) {
                node.queryMap = this.createQueryMap(elements);
            }
        }
        return node;
    }

    protected createQueryMap(elements: T[]) {
        const result: T[][] = [elements];
        for (const item of elements) {
            const childMap = item.queryMap as T[][];
            if (childMap) {
                const length = childMap.length;
                for (let i = 0; i < length; i++) {
                    const j = i + 1;
                    result[j] = result[j]?.concat(childMap[i]) || childMap[i];
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
                    const lengthA = cssRules.length;
                    for (let j = 0; j < lengthA; j++) {
                        const rule = cssRules[j];
                        switch (rule.type) {
                            case CSSRule.STYLE_RULE:
                            case CSSRule.FONT_FACE_RULE:
                                this.applyStyleRule(<CSSStyleRule> rule);
                                break;
                            case CSSRule.IMPORT_RULE:
                                applyStyleSheet((<CSSImportRule> rule).styleSheet);
                                break;
                            case CSSRule.MEDIA_RULE:
                                if (validMediaRule((<CSSConditionRule> rule).conditionText || parseConditionText('media', rule.cssText))) {
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
        for (let i = 0; i < length; i++) {
            const styleSheet = styleSheets[i];
            let mediaText: string | undefined;
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

    protected applyCSSRuleList(rules: CSSRuleList) {
        const length = rules.length;
        for (let i = 0; i < length; i++) {
            this.applyStyleRule(<CSSStyleRule> rules[i]);
        }
    }

    protected applyStyleRule(item: CSSStyleRule) {
        const resourceHandler = this.resourceHandler;
        const sessionId = this.processing.sessionId;
        const styleSheetHref = item.parentStyleSheet?.href || undefined;
        const cssText = item.cssText;
        switch (item.type) {
            case CSSRule.STYLE_RULE: {
                const cssStyle = item.style;
                const important: ObjectMap<boolean> = {};
                const parseImageUrl = (styleMap: StringMap, attr: string) => {
                    const value = styleMap[attr];
                    if (value && value !== 'initial') {
                        let result = value;
                        let match: RegExpExecArray | null;
                        while ((match = REGEX_DATAURI.exec(value)) !== null) {
                            if (match[3] && match[4]) {
                                resourceHandler.addRawData(match[2], match[3], match[4], match[5]);
                            }
                            else if (this.userSettings.preloadImages) {
                                const uri = resolvePath(match[5], styleSheetHref);
                                if (uri !== '') {
                                    if (resourceHandler.getImage(uri) === undefined) {
                                        addImageSrc(uri);
                                    }
                                    result = result.replace(match[1], `url("${uri}")`);
                                }
                            }
                        }
                        styleMap[attr] = result;
                        REGEX_DATAURI.lastIndex = 0;
                    }
                };
                const baseMap: StringMap = {};
                for (const attr of Array.from(cssStyle)) {
                    baseMap[convertCamelCase(attr)] = cssStyle[attr];
                }
                parseImageUrl(baseMap, 'backgroundImage');
                parseImageUrl(baseMap, 'listStyleImage');
                parseImageUrl(baseMap, 'content');
                if (cssText.indexOf('!important') !== -1) {
                    let match: RegExpExecArray | null;
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
                    REGEX_IMPORTANT.lastIndex = 0;
                }
                for (const selectorText of parseSelectorText(item.selectorText)) {
                    const specificity = getSpecificity(selectorText);
                    const [selector, target] = selectorText.split('::');
                    const targetElt = target ? '::' + target : '';
                    document.querySelectorAll(selector || '*').forEach((element: HTMLElement) => {
                        const style = getStyle(element, targetElt);
                        const styleMap = { ...baseMap };
                        const attrStyle = 'styleMap' + targetElt;
                        const attrSpecificity = 'styleSpecificity' + targetElt;
                        const styleData: StringMap = getElementCache(element, attrStyle, sessionId);
                        if (styleData) {
                            const specificityData: ObjectMap<number> = getElementCache(element, attrSpecificity, sessionId) || {};
                            for (const attr in styleMap) {
                                const revisedSpecificity = specificity + (important[attr] ? 1000 : 0);
                                if (specificityData[attr] === undefined || revisedSpecificity >= specificityData[attr]) {
                                    const value = styleMap[attr];
                                    if (value === 'initial' && REGEX_BACKGROUND.test(attr)) {
                                        if (cssStyle.background === 'none') {
                                            delete styleData[attr];
                                        }
                                    }
                                    else {
                                        styleData[attr] = value;
                                    }
                                    specificityData[attr] = revisedSpecificity;
                                }
                            }
                        }
                        else {
                            const specificityData: ObjectMap<number> = {};
                            for (const attr in styleMap) {
                                specificityData[attr] = specificity + (important[attr] ? 1000 : 0);
                            }
                            setElementCache(element, 'style' + targetElt, '0', style);
                            setElementCache(element, 'sessionId', '0', sessionId);
                            setElementCache(element, attrStyle, sessionId, styleMap);
                            setElementCache(element, attrSpecificity, sessionId, specificityData);
                        }
                    });
                }
                break;
            }
            case CSSRule.FONT_FACE_RULE: {
                const attr = REGEX_FONTFACE.exec(cssText)?.[1];
                if (attr) {
                    const fontFamily = (REGEX_FONTFAMILY.exec(attr)?.[1] || '').trim();
                    const srcMatch = (REGEX_FONTSRC.exec(attr)?.[1] || '').split(XML.SEPARATOR);
                    if (fontFamily !== '' && srcMatch.length) {
                        const fontStyle = REGEX_FONTSTYLE.exec(attr)?.[1].toLowerCase() || 'normal';
                        const fontWeight = parseInt(REGEX_FONTWEIGHT.exec(attr)?.[1] || '400');
                        for (const value of srcMatch) {
                            const urlMatch = REGEX_URL.exec(value);
                            if (urlMatch) {
                                let srcUrl: string | undefined;
                                let srcLocal: string | undefined;
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
                        }
                    }
                }
                break;
            }
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

    get extensionsCascade() {
        return <Extension<T>[]> [];
    }

    get nextId() {
        return this._cache.nextId;
    }

    get length() {
        return 0;
    }
}