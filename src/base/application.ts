import { AppProcessing, AppSession, FileAsset, UserSettings } from '../../@types/base/application';

import Controller from './controller';
import Extension from './extension';
import ExtensionManager from './extensionmanager';
import Node from './node';
import NodeList from './nodelist';
import Resource from './resource';

type PreloadImage = HTMLImageElement | string;

const {
    css: $css,
    dom: $dom,
    regex: $regex,
    session: $session,
    util: $util
} = squared.lib;

const ASSETS = Resource.ASSETS;
const CACHE_PATTERN: ObjectMap<RegExp> = {
    MEDIATEXT: /all|screen/,
    DATAURI: new RegExp(`(url\\("(${$regex.STRING.DATAURI})"\\)),?\\s*`, 'g')
};
let NodeConstructor!: Constructor<Node>;

function parseConditionText(rule: string, value: string) {
    const match = new RegExp(`^@${rule}([^{]+)`).exec(value);
    return match ? match[1].trim() : value;
}

async function getImageSvgAsync(value: string)  {
    const response = await fetch(value, {
        method: 'GET',
        headers: new Headers({ 'Accept': 'application/xhtml+xml, image/svg+xml', 'Content-Type': 'image/svg+xml' })
    });
    return response.text();
}

export default abstract class Application<T extends Node> implements squared.base.Application<T> {
    public controllerHandler: Controller<T>;
    public resourceHandler: Resource<T>;
    public extensionManager: ExtensionManager<T>;
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

    protected constructor(
        public framework: number,
        nodeConstructor: Constructor<T>,
        ControllerConstructor: Constructor<T>,
        ResourceConstructor: Constructor<T>,
        ExtensionManagerConstructor: Constructor<T>)
    {
        NodeConstructor = nodeConstructor;
        const cache = this.processing.cache;
        this.controllerHandler = <Controller<T>> (new ControllerConstructor(this, cache) as unknown);
        this.resourceHandler = <Resource<T>> (new ResourceConstructor(this, cache) as unknown);
        this.extensionManager = <ExtensionManager<T>> (new ExtensionManagerConstructor(this, cache) as unknown);
    }

    public abstract insertNode(element: Element, parent?: T): T | undefined;
    public abstract afterCreateCache(element: HTMLElement): void;
    public abstract finalize(): void;

    public copyToDisk(directory: string, callback?: CallbackResult, assets?: FileAsset[]) {
        const file = this.resourceHandler.fileHandler;
        if (file) {
            file.copyToDisk(directory, assets, callback);
        }
    }

    public appendToArchive(pathname: string, assets?: FileAsset[]) {
        const file = this.resourceHandler.fileHandler;
        if (file) {
            file.appendToArchive(pathname, assets);
        }
    }

    public saveToArchive(filename?: string, assets?: FileAsset[]) {
        const file = this.resourceHandler.fileHandler;
        if (file) {
            file.saveToArchive(filename || this.userSettings.outputArchiveName, assets);
        }
    }

    public reset() {
        this.session.active.length = 0;
        const processing = this.processing;
        processing.cache.reset();
        processing.excluded.clear();
        processing.sessionId = '';
        this.controllerHandler.reset();
        for (const ext of this.extensions) {
            ext.subscribers.clear();
        }
        this.closed = false;
    }

    public parseDocument(...elements: any[]): squared.PromiseResult {
        const controller = this.controllerHandler;
        const resource = this.resourceHandler;
        let __THEN: Undefined<() => void>;
        this.rootElements.clear();
        this.initializing = false;
        const sessionId = controller.generateSessionId;
        this.processing.sessionId = sessionId;
        controller.sessionId = sessionId;
        this.session.active.push(sessionId);
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
            else if ($css.hasComputedStyle(value)) {
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
        const images: PreloadImage[] = [];
        if (preloadImages) {
            for (const element of this.rootElements) {
                element.querySelectorAll('input[type=image]').forEach((image: HTMLInputElement) => {
                    const uri = image.src;
                    if (uri !== '') {
                        ASSETS.images.set(uri, { width: image.width, height: image.height, uri });
                    }
                });
            }
            for (const image of ASSETS.images.values()) {
                if (image.uri) {
                    if (image.uri.toLowerCase().endsWith('.svg')) {
                        images.push(image.uri);
                    }
                    else if (image.width === 0 && image.height === 0) {
                        const element = document.createElement('img');
                        element.src = image.uri;
                        if (element.complete && element.naturalWidth > 0 && element.naturalHeight > 0) {
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
        }
        for (const [uri, data] of ASSETS.rawData.entries()) {
            if (data.mimeType && data.mimeType.startsWith('image/') && !data.mimeType.endsWith('svg+xml')) {
                const element = document.createElement('img');
                element.src = `data:${data.mimeType};` + (data.base64 ? `base64,${data.base64}` : data.content);
                if (element.complete && element.naturalWidth > 0 && element.naturalHeight > 0) {
                    data.width = element.naturalWidth;
                    data.height = element.naturalHeight;
                    ASSETS.images.set(uri, {
                        width: data.width,
                        height: data.height,
                        uri: data.filename
                    });
                }
                else {
                    document.body.appendChild(element);
                    preloaded.push(element);
                }
            }
        }
        for (const element of this.rootElements) {
            element.querySelectorAll('img').forEach((image: HTMLImageElement) => {
                if (image.src.toLowerCase().endsWith('.svg')) {
                    if (preloadImages) {
                        images.push(image.src);
                    }
                }
                else if (image.complete) {
                    resource.addImage(image);
                }
                else if (preloadImages) {
                    images.push(image);
                }
            });
        }
        if (images.length) {
            this.initializing = true;
            Promise.all($util.objectMap<PreloadImage, Promise<PreloadImage>>(images, image => {
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
                        if (typeof images[i] === 'string') {
                            resource.addRawData(images[i] as string, 'image/svg+xml', 'utf8', value);
                        }
                    }
                    else {
                        resource.addImage(value);
                    }
                }
                resume();
            })
            .catch((error: Event) => {
                const message = error.target ? (<HTMLImageElement> error.target).src : error['message'];
                if (!this.userSettings.showErrorMessages || !$util.isString(message) || confirm(`FAIL: ${message}`)) {
                    resume();
                }
            });
        }
        else {
            resume();
        }
        const PromiseResult = class {
            public then(resolve: () => void) {
                if (images.length) {
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
            const CACHE = <NodeList<T>> this.processing.cache;
            (node.parent as T).setBounds();
            for (const item of CACHE) {
                item.setBounds();
                item.saveAsInitial();
            }
            this.controllerHandler.sortInitialCache(CACHE);
            return true;
        }
        return false;
    }

    public createNode(element?: Element, append = true, parent?: T, children?: T[]) {
        const node = new NodeConstructor(this.nextId, this.processing.sessionId, element, this.controllerHandler.afterInsertNode) as T;
        if (parent) {
            node.depth = parent.depth + 1;
        }
        if (children) {
            for (const item of children) {
                item.parent = node;
            }
        }
        if (append) {
            this.processing.cache.append(node, children !== undefined);
        }
        return node;
    }

    public toString() {
        return '';
    }

    protected createRootNode(element: HTMLElement) {
        const processing = this.processing;
        processing.cache.clear();
        processing.excluded.clear();
        this._cascadeAll = false;
        const node = this.cascadeParentNode(element);
        if (node) {
            const parent = new NodeConstructor(0, processing.sessionId, element.parentElement || document.body, this.controllerHandler.afterInsertNode);
            node.parent = parent;
            node.actualParent = parent;
            node.childIndex = 0;
            node.documentRoot = true;
        }
        processing.node = node;
        processing.cache.afterAppend = undefined;
        return node;
    }

    protected cascadeParentNode(parentElement: HTMLElement, depth = 0) {
        const node = this.insertNode(parentElement);
        if (node) {
            const controller = this.controllerHandler;
            const processing = this.processing;
            const CACHE = processing.cache;
            node.depth = depth;
            if (depth === 0) {
                CACHE.append(node);
            }
            if (controller.preventNodeCascade(parentElement)) {
                return node;
            }
            const childNodes = parentElement.childNodes;
            const length = childNodes.length;
            const children: T[] = new Array(length);
            const elements: T[] = new Array(parentElement.childElementCount);
            let inlineText = true;
            let j = 0;
            let k = 0;
            for (let i = 0; i < length; i++) {
                const element = <HTMLElement> childNodes[i];
                let child: T | undefined;
                if (element.nodeName.charAt(0) === '#') {
                    if ($dom.isTextNode(element)) {
                        child = this.insertNode(element, node);
                    }
                }
                else if (controller.includeElement(element)) {
                    child = this.cascadeParentNode(element, depth + 1);
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
                node.queryMap = this.createQueryMap(elements, k);
            }
        }
        return node;
    }

    protected createQueryMap(elements: T[], length: number) {
        const result: T[][] = [elements];
        for (let i = 0; i < length; i++) {
            const childMap = elements[i].queryMap as T[][];
            if (childMap) {
                const lengthA = childMap.length;
                for (let j = 0; j < lengthA; j++) {
                    const k = j + 1;
                    const map = result[k];
                    if (map) {
                        result[k] = map.concat(childMap[j]);
                    }
                    else {
                        result[k] = childMap[j];
                    }
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
                                if ($css.validMediaRule((<CSSConditionRule> rule).conditionText || parseConditionText('media', rule.cssText))) {
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
                          `${item.href}\n\n${error}`);
                    warning = true;
                }
            }
        };
        const styleSheets = document.styleSheets;
        const length = styleSheets.length;
        for (let i = 0; i < length; i++) {
            const styleSheet = styleSheets[i];
            const mediaText = styleSheet.media.mediaText;
            if (mediaText === '' || CACHE_PATTERN.MEDIATEXT.test(mediaText)) {
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
        const resource = this.resourceHandler;
        const sessionId = this.processing.sessionId;
        const styleSheetHref = item.parentStyleSheet && item.parentStyleSheet.href || undefined;
        const cssText = item.cssText;
        switch (item.type) {
            case CSSRule.STYLE_RULE: {
                const cssStyle = item.style;
                const fromRule: string[] = [];
                const important: ObjectMap<boolean> = {};
                const parseImageUrl = (styleMap: StringMap, attr: string) => {
                    const value = styleMap[attr];
                    if (value && value !== 'initial') {
                        CACHE_PATTERN.DATAURI.lastIndex = 0;
                        let result = value;
                        let match: RegExpExecArray | null;
                        while ((match = CACHE_PATTERN.DATAURI.exec(value)) !== null) {
                            if (match[3] && match[4]) {
                                resource.addRawData(match[2], match[3], match[4], match[5]);
                            }
                            else if (this.userSettings.preloadImages) {
                                const uri = $util.resolvePath(match[5], styleSheetHref);
                                if (uri !== '') {
                                    if (resource.getImage(uri) === undefined) {
                                        ASSETS.images.set(uri, { width: 0, height: 0, uri });
                                    }
                                    result = result.replace(match[1], `url("${uri}")`);
                                }
                            }
                        }
                        styleMap[attr] = result;
                    }
                };
                for (const attr of Array.from(cssStyle)) {
                    fromRule.push($util.convertCamelCase(attr));
                }
                if (cssText.indexOf('!important') !== -1) {
                    if (CACHE_PATTERN.IMPORTANT === undefined) {
                        CACHE_PATTERN.IMPORTANT = /\s*([a-z\-]+):.*?!important;/g;
                    }
                    else {
                        CACHE_PATTERN.IMPORTANT.lastIndex = 0;
                    }
                    let match: RegExpExecArray | null;
                    while ((match = CACHE_PATTERN.IMPORTANT.exec(cssText)) !== null) {
                        const attr = $util.convertCamelCase(match[1]);
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
                }
                for (const selectorText of $css.parseSelectorText(item.selectorText)) {
                    const specificity = $css.getSpecificity(selectorText);
                    const [selector, target] = selectorText.split('::');
                    const targetElt = target ? '::' + target : '';
                    document.querySelectorAll(selector || '*').forEach((element: HTMLElement) => {
                        const style = $css.getStyle(element, targetElt);
                        const styleMap: StringMap = {};
                        for (const attr of fromRule) {
                            const value = $css.checkStyleValue(element, attr, cssStyle[attr], style);
                            if (value) {
                                styleMap[attr] = value;
                            }
                        }
                        parseImageUrl(styleMap, 'backgroundImage');
                        parseImageUrl(styleMap, 'listStyleImage');
                        parseImageUrl(styleMap, 'content');
                        const attrStyle = `styleMap${targetElt}`;
                        const attrSpecificity = `styleSpecificity${targetElt}`;
                        const styleData: StringMap = $session.getElementCache(element, attrStyle, sessionId);
                        if (styleData) {
                            const specificityData: ObjectMap<number> = $session.getElementCache(element, attrSpecificity, sessionId) || {};
                            for (const attr in styleMap) {
                                const value = styleMap[attr];
                                const revisedSpecificity = specificity + (important[attr] ? 1000 : 0);
                                if (specificityData[attr] === undefined || revisedSpecificity >= specificityData[attr]) {
                                    specificityData[attr] = revisedSpecificity;
                                    if (value === 'initial' && cssStyle.background !== '' && attr.startsWith('background')) {
                                        continue;
                                    }
                                    styleData[attr] = value;
                                }
                            }
                        }
                        else {
                            const specificityData: ObjectMap<number> = {};
                            for (const attr in styleMap) {
                                specificityData[attr] = specificity + (important[attr] ? 1000 : 0);
                            }
                            $session.setElementCache(element, `style${targetElt}`, '0', style);
                            $session.setElementCache(element, 'sessionId', '0', sessionId);
                            $session.setElementCache(element, attrStyle, sessionId, styleMap);
                            $session.setElementCache(element, attrSpecificity, sessionId, specificityData);
                        }
                    });
                }
                break;
            }
            case CSSRule.FONT_FACE_RULE: {
                if (CACHE_PATTERN.FONT_FACE === undefined) {
                    CACHE_PATTERN.FONT_FACE = /\s*@font-face\s*{([^}]+)}\s*/;
                    CACHE_PATTERN.FONT_FAMILY = /\s*font-family:[^\w]*([^'";]+)/;
                    CACHE_PATTERN.FONT_SRC = /\s*src:\s*([^;]+);/;
                    CACHE_PATTERN.FONT_STYLE = /\s*font-style:\s*(\w+)\s*;/;
                    CACHE_PATTERN.FONT_WEIGHT = /\s*font-weight:\s*(\d+)\s*;/;
                    CACHE_PATTERN.URL = /\s*(url|local)\((?:['"]([^'")]+)['"]|([^)]+))\)\s*format\(['"]?(\w+)['"]?\)\s*/;
                }
                const match = CACHE_PATTERN.FONT_FACE.exec(cssText);
                if (match) {
                    const familyMatch = CACHE_PATTERN.FONT_FAMILY.exec(match[1]);
                    const srcMatch = CACHE_PATTERN.FONT_SRC.exec(match[1]);
                    if (familyMatch && srcMatch) {
                        const styleMatch = CACHE_PATTERN.FONT_STYLE.exec(match[1]);
                        const weightMatch = CACHE_PATTERN.FONT_WEIGHT.exec(match[1]);
                        const fontFamily = familyMatch[1].trim();
                        const fontStyle = styleMatch ? styleMatch[1].toLowerCase() : 'normal';
                        const fontWeight = weightMatch ? parseInt(weightMatch[1]) : 400;
                        for (const value of srcMatch[1].split($regex.XML.SEPARATOR)) {
                            const urlMatch = CACHE_PATTERN.URL.exec(value);
                            if (urlMatch) {
                                let srcUrl: string | undefined;
                                let srcLocal: string | undefined;
                                const url = (urlMatch[2] || urlMatch[3]).trim();
                                if (urlMatch[1] === 'url') {
                                    srcUrl = $util.resolvePath(url, styleSheetHref);
                                }
                                else {
                                    srcLocal = url;
                                }
                                resource.addFont({
                                    fontFamily,
                                    fontWeight,
                                    fontStyle,
                                    srcUrl,
                                    srcLocal,
                                    srcFormat: urlMatch[4].toLowerCase().trim()
                                });
                            }
                        }
                    }
                }
                break;
            }
        }
    }

    get nextId() {
        return this.processing.cache.nextId;
    }

    get length() {
        return 0;
    }
}