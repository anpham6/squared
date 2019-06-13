import { AppProcessing, AppSession, UserSettings } from './@types/application';

import Controller from './controller';
import Extension from './extension';
import ExtensionManager from './extensionmanager';
import Node from './node';
import NodeList from './nodelist';
import Resource from './resource';

type PreloadImage = HTMLImageElement | string;

const $const = squared.lib.constant;
const $css = squared.lib.css;
const $dom = squared.lib.dom;
const $regex = squared.lib.regex;
const $session = squared.lib.session;
const $util = squared.lib.util;

const CACHE_PATTERN: ObjectMap<RegExp> = {};
let NodeConstructor!: Constructor<Node>;

function parseConditionText(rule: string, value: string) {
    const match = new RegExp(`^@${rule}([^{]+)`).exec(value);
    if (match) {
        value = match[1].trim();
    }
    return value;
}

async function getImageSvgAsync(value: string)  {
    const response = await fetch(value, {
        method: 'GET',
        headers: new Headers({ 'Accept': 'application/xhtml+xml, image/svg+xml', 'Content-Type': 'image/svg+xml' })
    });
    return await response.text();
}

function createPseudoElement(parent: Element, tagName = 'span', index = -1) {
    const element = document.createElement(tagName);
    element.className = '__squared.pseudo';
    element.style.setProperty('display', $const.CSS.NONE);
    if (index >= 0 && index < parent.childNodes.length) {
        parent.insertBefore(element, parent.childNodes[index]);
    }
    else {
        parent.appendChild(element);
    }
    return element;
}

export default abstract class Application<T extends Node> implements squared.base.Application<T> {
    public controllerHandler: Controller<T>;
    public resourceHandler: Resource<T>;
    public extensionManager: ExtensionManager<T>;
    public initialized = false;
    public closed = false;
    public userSettings!: UserSettings;
    public readonly builtInExtensions: ObjectMap<Extension<T>> = {};
    public readonly extensions: Extension<T>[] = [];
    public readonly rootElements = new Set<HTMLElement>();
    public readonly session: AppSession<T> = {
        active: []
    };
    public readonly processing: AppProcessing<T> = {
        cache: new NodeList<T>(),
        excluded: new NodeList<T>(),
        sessionId: ''
    };

    constructor(
        public framework: number,
        nodeConstructor: Constructor<T>,
        ControllerConstructor: Constructor<T>,
        ResourceConstructor: Constructor<T>,
        ExtensionManagerConstructor: Constructor<T>)
    {
        NodeConstructor = nodeConstructor;
        this.controllerHandler = <Controller<T>> (new ControllerConstructor(this, this.processing.cache) as unknown);
        this.resourceHandler = <Resource<T>> (new ResourceConstructor(this, this.processing.cache) as unknown);
        this.extensionManager = <ExtensionManager<T>> (new ExtensionManagerConstructor(this, this.processing.cache) as unknown);
    }

    public abstract afterCreateCache(element: HTMLElement): void;

    public finalize() {}
    public saveAllToDisk() {}

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
        let __THEN: Undefined<() => void>;
        this.rootElements.clear();
        this.initialized = false;
        this.processing.sessionId = controller.generateSessionId;
        this.session.active.push(this.processing.sessionId);
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
        const ASSETS = this.resourceHandler.assets;
        const documentRoot = this.rootElements.values().next().value;
        const preloadImages: HTMLImageElement[] = [];
        const resume = () => {
            this.initialized = false;
            for (const image of preloadImages) {
                if (image.parentElement) {
                    documentRoot.removeChild(image);
                }
            }
            preloadImages.length = 0;
            for (const ext of this.extensions) {
                ext.beforeParseDocument();
            }
            for (const element of this.rootElements) {
                if (this.createCache(element)) {
                    this.afterCreateCache(element);
                }
            }
            for (const ext of this.extensions) {
                for (const node of ext.subscribers) {
                    ext.postParseDocument(node);
                }
                ext.afterParseDocument();
            }
            if (typeof __THEN === 'function') {
                __THEN.call(this);
            }
        };
        const images: PreloadImage[] = [];
        if (this.userSettings.preloadImages) {
            for (const element of this.rootElements) {
                element.querySelectorAll('input[type=image]').forEach((image: HTMLInputElement) => {
                    const uri = image.src;
                    if (uri !== '') {
                        ASSETS.images.set(uri, { width: image.width, height: image.height, uri });
                    }
                });
                element.querySelectorAll('svg image').forEach((image: SVGImageElement) => {
                    const uri = $util.resolvePath(image.href.baseVal);
                    if (uri !== '') {
                        ASSETS.images.set(uri, { width: image.width.baseVal.value, height: image.height.baseVal.value, uri });
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
                            preloadImages.push(element);
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
                    ASSETS.images.set(uri, { width: data.width, height: data.height, uri: data.filename });
                }
                else {
                    document.body.appendChild(element);
                    preloadImages.push(element);
                }
            }
        }
        for (const element of this.rootElements) {
            element.querySelectorAll('img').forEach((image: HTMLImageElement) => {
                if (image.tagName === 'IMG') {
                    if (image.src.toLowerCase().endsWith('.svg')) {
                        if (this.userSettings.preloadImages) {
                            images.push(image.src);
                        }
                    }
                    else if (image.complete) {
                        this.resourceHandler.addImage(image);
                    }
                    else if (this.userSettings.preloadImages) {
                        images.push(image);
                    }
                }
            });
        }
        if (images.length) {
            this.initialized = true;
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
                            this.resourceHandler.addRawData(images[i] as string, 'image/svg+xml', 'utf8', value);
                        }
                    }
                    else {
                        this.resourceHandler.addImage(value);
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
        const controller = this.controllerHandler;
        this.processing.node = undefined;
        this.processing.cache.afterAppend = undefined;
        this.processing.cache.clear();
        this.processing.excluded.clear();
        for (const ext of this.extensions) {
            ext.beforeInit(documentRoot);
        }
        const nodeRoot = this.cascadeParentNode(documentRoot);
        if (nodeRoot) {
            nodeRoot.parent = new NodeConstructor(0, this.processing.sessionId, documentRoot.parentElement || document.body, controller.afterInsertNode);
            nodeRoot.childIndex = 0;
            nodeRoot.documentRoot = true;
            nodeRoot.documentParent = nodeRoot.parent;
            this.processing.node = nodeRoot;
        }
        else {
            return false;
        }
        const CACHE = <NodeList<T>> this.processing.cache;
        const preAlignment: ObjectIndex<StringMap> = {};
        const direction = new Set<HTMLElement>();
        let resetBounds = false;
        function saveAlignment(element: HTMLElement, id: number, attr: string, value: string, restoreValue: string) {
            if (preAlignment[id] === undefined) {
                preAlignment[id] = {};
            }
            preAlignment[id][attr] = restoreValue;
            element.style.setProperty(attr, value);
        }
        for (const node of CACHE) {
            if (node.styleElement) {
                const element = <HTMLElement> node.element;
                if (node.length) {
                    const textAlign = node.cssInitial('textAlign');
                    switch (textAlign) {
                        case $const.CSS.CENTER:
                        case $const.CSS.RIGHT:
                        case $const.CSS.END:
                            saveAlignment(element, node.id, 'text-align', $const.CSS.LEFT, textAlign);
                            break;
                    }
                }
                if (node.positionRelative) {
                    for (const attr of $css.BOX_POSITION) {
                        if (node.hasPX(attr)) {
                            saveAlignment(element, node.id, attr, $const.CSS.AUTO, node.css(attr));
                            resetBounds = true;
                        }
                    }
                }
                if (node.dir === 'rtl') {
                    element.dir = 'ltr';
                    direction.add(element);
                }
            }
        }
        if (!resetBounds && direction.size) {
            resetBounds = true;
        }
        const pseudoElement = new Set<T>();
        nodeRoot.parent.setBounds();
        for (const node of CACHE) {
            if (!node.pseudoElement) {
                node.setBounds(preAlignment[node.id] === undefined && !resetBounds);
            }
            else {
                pseudoElement.add(node.parent as T);
            }
        }
        for (const node of pseudoElement) {
            [node.innerBefore, node.innerAfter].forEach((item, index) => {
                if (item) {
                    const element = <HTMLElement> node.element;
                    const id = element.id;
                    let styleElement: HTMLElement | undefined;
                    if (item.pageFlow) {
                        element.id = `id_${Math.round(Math.random() * new Date().getTime())}`;
                        styleElement = $css.insertStyleSheetRule(`#${element.id}::${index === 0 ? 'before' : 'after'} { display: none !important; }`);
                    }
                    if (item.cssTry('display', item.display)) {
                        item.setBounds(false);
                        item.cssFinally('display');
                    }
                    if (styleElement) {
                        document.head.removeChild(styleElement);
                    }
                    element.id = id;
                }
            });
        }
        for (const node of this.processing.excluded) {
            if (!node.lineBreak) {
                node.setBounds();
                node.saveAsInitial();
            }
        }
        for (const node of CACHE) {
            if (node.styleElement) {
                const element = <HTMLElement> node.element;
                const reset = preAlignment[node.id];
                if (reset) {
                    for (const attr in reset) {
                        element.style.setProperty(attr, reset[attr]);
                    }
                }
                if (direction.has(element)) {
                    element.dir = 'rtl';
                }
            }
            node.saveAsInitial();
        }
        controller.evaluateNonStatic(nodeRoot, CACHE);
        controller.sortInitialCache(CACHE);
        for (const ext of this.extensions) {
            ext.afterInit(documentRoot);
        }
        return true;
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

    public insertNode(element: Element, parent?: T): T | undefined {
        this.controllerHandler.applyDefaultStyles(element);
        const node = this.createNode(element, false);
        if (node.plainText) {
            Node.copyTextStyle(node, parent as T);
        }
        return node;
    }

    public toString() {
        return '';
    }

    protected cascadeParentNode(element: HTMLElement, depth = 0) {
        const node = this.insertNode(element);
        if (node) {
            node.depth = depth;
            if (depth === 0) {
                this.processing.cache.append(node);
            }
            const controller = this.controllerHandler;
            if (controller.preventNodeCascade(element)) {
                return node;
            }
            const beforeElement = this.createPseduoElement(element, '::before');
            const afterElement = this.createPseduoElement(element, '::after');
            const childNodes = element.childNodes;
            const lengthA = childNodes.length;
            const lengthB = element.children.length;
            const children: T[] = new Array(lengthA);
            const elements: T[] = new Array(lengthB);
            const queryMap: T[][] | undefined = this.userSettings.createQuerySelectorMap && lengthB ? [[]] : undefined;
            let j = 0;
            let k = 0;
            for (let i = 0; i < lengthA; i++) {
                const childElement = <HTMLElement> childNodes[i];
                let child: T | undefined;
                if (childElement === beforeElement) {
                    child = this.insertNode(<HTMLElement> beforeElement);
                    if (child) {
                        node.innerBefore = child;
                        child.inlineText = true;
                    }
                }
                else if (childElement === afterElement) {
                    child = this.insertNode(<HTMLElement> afterElement);
                    if (child) {
                        node.innerAfter = child;
                        child.inlineText = true;
                    }
                }
                else if (childElement.nodeName.charAt(0) === '#') {
                    if (childElement.nodeName === '#text') {
                        child = this.insertNode(childElement, node);
                    }
                }
                else if (controller.includeElement(childElement)) {
                    child = this.partitionNodeChildren(childElement, depth);
                    if (child) {
                        elements[k++] = child;
                        if (queryMap) {
                            queryMap[0].push(child);
                            this.appendQueryMap(queryMap, depth, child);
                        }
                    }
                }
                if (child) {
                    child.childIndex = j;
                    children[j++] = child;
                }
            }
            children.length = j;
            elements.length = k;
            node.naturalChildren = children;
            node.naturalElements = elements;
            this.cacheNodeChildren(node, children);
            if (queryMap && queryMap[0].length) {
                node.queryMap = queryMap;
            }
        }
        return node;
    }

    protected cacheNodeChildren(node: T, children: T[]) {
        let inlineText = true;
        for (const item of children) {
            item.parent = node;
            item.actualParent = node;
            if (!item.plainText) {
                inlineText = false;
                this.processing.cache.append(item);
            }
        }
        node.inlineText = inlineText;
    }

    protected partitionNodeChildren(element: HTMLElement, depth: number) {
        return this.cascadeParentNode(element, depth + 1);
    }

    protected appendQueryMap(queryMap: T[][], depth: number, item: T) {
        const childMap = item.queryMap as T[][];
        if (childMap) {
            const offset = item.depth - depth;
            const length = childMap.length;
            for (let i = 0; i < length; i++) {
                const key = i + offset;
                if (queryMap[key] === undefined) {
                    queryMap[key] = [];
                }
                queryMap[key] = queryMap[key].concat(childMap[i]);
            }
        }
    }

    protected createPseduoElement(element: HTMLElement, pseudoElt: string) {
        const styleMap: StringMap = $session.getElementCache(element, `styleMap${pseudoElt}`, this.processing.sessionId);
        if (styleMap && styleMap.content) {
            if ($util.trimString(styleMap.content, '"').trim() === '' && $util.convertFloat(styleMap.width) === 0 && $util.convertFloat(styleMap.height) === 0 && (styleMap.position === 'absolute' || styleMap.position === 'fixed' || styleMap.clear && styleMap.clear !== $const.CSS.NONE)) {
                let valid = true;
                for (const attr in styleMap) {
                    if (/(Width|Height)$/.test(attr) && $css.isLength(styleMap[attr], true) && $util.convertFloat(styleMap[attr]) !== 0) {
                        valid = false;
                        break;
                    }
                }
                if (valid) {
                    return undefined;
                }
            }
            let value = styleMap.content;
            if (value === 'inherit') {
                let current: HTMLElement | null = element;
                while (current) {
                    value = $css.getStyle(current).getPropertyValue('content');
                    if (value !== 'inherit') {
                        break;
                    }
                    current = current.parentElement;
                }
            }
            const style = $css.getStyle(element);
            if (styleMap.fontFamily === undefined) {
                styleMap.fontFamily = style.getPropertyValue('font-family');
            }
            if (styleMap.fontSize === undefined) {
                styleMap.fontSize = style.getPropertyValue('font-size');
            }
            if (styleMap.fontWeight === undefined) {
                styleMap.fontWeight = style.getPropertyValue('font-weight');
            }
            if (styleMap.color === undefined) {
                styleMap.color = style.getPropertyValue('color');
            }
            if (styleMap.display === undefined) {
                styleMap.display = 'inline';
            }
            let tagName = styleMap.display.startsWith('inline') ? 'span' : 'div';
            let content = '';
            switch (value) {
                case 'normal':
                case 'none':
                case 'initial':
                case 'inherit':
                case 'no-open-quote':
                case 'no-close-quote':
                case '""':
                    break;
                case 'open-quote':
                    if (pseudoElt === '::before') {
                        content = '&quot;';
                    }
                    break;
                case 'close-quote':
                    if (pseudoElt === '::after') {
                        content = '&quot;';
                    }
                    break;
                default:
                    if (value.startsWith('url(')) {
                        content = $css.resolveURL(value);
                        const format = $util.fromLastIndexOf(content, '.').toLowerCase();
                        const imageFormat = this.controllerHandler.localSettings.supported.imageFormat;
                        if (imageFormat === '*' || imageFormat.includes(format)) {
                            tagName = 'img';
                        }
                        else {
                            content = '';
                        }
                    }
                    else {
                        if (CACHE_PATTERN.COUNTER === undefined) {
                            CACHE_PATTERN.COUNTER = /\s*(?:attr\(([^)]+)\)|(counter)\(([^,)]+)(?:, ([a-z\-]+))?\)|(counters)\(([^,]+), "([^"]*)"(?:, ([a-z\-]+))?\)|"([^"]+)")\s*/g;
                            CACHE_PATTERN.COUNTER_VALUE = /\s*([^\-\d][^\-\d]?[^ ]*) (-?\d+)\s*/g;
                        }
                        else {
                            CACHE_PATTERN.COUNTER.lastIndex = 0;
                        }
                        let found = false;
                        let match: RegExpExecArray | null;
                        while ((match = CACHE_PATTERN.COUNTER.exec(value)) !== null) {
                            if (match[1]) {
                                content += $dom.getNamedItem(element, match[1].trim());
                            }
                            else if (match[2] || match[5]) {
                                const counterType = match[2] === 'counter';
                                let counterName: string;
                                let styleName: string;
                                if (counterType) {
                                    counterName = match[3];
                                    styleName = match[4] || 'decimal';
                                }
                                else {
                                    counterName = match[6];
                                    styleName = match[8] || 'decimal';
                                }
                                function getCounterValue(name: string) {
                                    if (name !== $const.CSS.NONE) {
                                        CACHE_PATTERN.COUNTER_VALUE.lastIndex = 0;
                                        let counterMatch: RegExpExecArray | null;
                                        while ((counterMatch = CACHE_PATTERN.COUNTER_VALUE.exec(name)) !== null) {
                                            if (counterMatch[1] === counterName) {
                                                return parseInt(counterMatch[2]);
                                            }
                                        }
                                    }
                                    return undefined;
                                }
                                const getIncrementValue = (parent: Element) => {
                                    const pseduoStyle: StringMap = $session.getElementCache(parent, `styleMap${pseudoElt}`, this.processing.sessionId);
                                    if (pseduoStyle && pseduoStyle.counterIncrement) {
                                        return getCounterValue(pseduoStyle.counterIncrement);
                                    }
                                    return undefined;
                                };
                                const initalValue = (getIncrementValue(element) || 0) + (getCounterValue(style.getPropertyValue('counter-reset')) || 0);
                                const subcounter: number[] = [];
                                let current: Element | null = element;
                                let counter = initalValue;
                                let ascending = false;
                                let lastResetElement: Element | undefined;
                                function incrementCounter(increment: number, pseudo: boolean) {
                                    if (subcounter.length === 0) {
                                        counter += increment;
                                    }
                                    else if (ascending || pseudo) {
                                        subcounter[subcounter.length - 1] += increment;
                                    }
                                }
                                function cascadeSibling(sibling: Element) {
                                    if (getCounterValue($css.getStyle(sibling).getPropertyValue('counter-reset')) === undefined) {
                                        const children = sibling.children;
                                        const length = children.length;
                                        for (let i = 0; i < length; i++) {
                                            const child = children[i];
                                            if (child.className !== '__squared.pseudo') {
                                                let increment = getIncrementValue(child);
                                                if (increment) {
                                                    incrementCounter(increment, true);
                                                }
                                                const childStyle = $css.getStyle(child);
                                                increment = getCounterValue(childStyle.getPropertyValue('counter-increment'));
                                                if (increment) {
                                                    incrementCounter(increment, false);
                                                }
                                                increment = getCounterValue(childStyle.getPropertyValue('counter-reset'));
                                                if (increment !== undefined) {
                                                    return;
                                                }
                                                cascadeSibling(child);
                                            }
                                        }
                                    }
                                }
                                do {
                                    ascending = false;
                                    if (current.previousElementSibling) {
                                        current = current.previousElementSibling;
                                        cascadeSibling(current);
                                    }
                                    else if (current.parentElement) {
                                        current = current.parentElement;
                                        ascending = true;
                                    }
                                    else {
                                        break;
                                    }
                                    if (current.className !== '__squared.pseudo') {
                                        const pesudoIncrement = getIncrementValue(current);
                                        if (pesudoIncrement) {
                                            incrementCounter(pesudoIncrement, true);
                                        }
                                        const currentStyle = $css.getStyle(current);
                                        const counterIncrement = getCounterValue(currentStyle.getPropertyValue('counter-increment')) || 0;
                                        if (counterIncrement) {
                                            incrementCounter(counterIncrement, false);
                                        }
                                        const counterReset = getCounterValue(currentStyle.getPropertyValue('counter-reset'));
                                        if (counterReset !== undefined) {
                                            if (lastResetElement === undefined) {
                                                counter += counterReset;
                                            }
                                            lastResetElement = current;
                                            if (counterType) {
                                                break;
                                            }
                                            else if (ascending) {
                                                subcounter.push((pesudoIncrement || 0) + counterReset);
                                            }
                                        }
                                    }
                                }
                                while (true);
                                if (lastResetElement) {
                                    if (!counterType && subcounter.length > 1) {
                                        subcounter.reverse();
                                        subcounter.splice(1, 1);
                                        for (const leading of subcounter) {
                                            content += $css.convertListStyle(styleName, leading, true) + match[7];
                                        }
                                    }
                                }
                                else {
                                    counter = initalValue;
                                }
                                content += $css.convertListStyle(styleName, counter, true);
                            }
                            else if (match[9]) {
                                content += match[9];
                            }
                            found = true;
                        }
                        if (!found) {
                            content = value;
                        }
                    }
                    break;
            }
            if (content || value === '""') {
                const pseudoElement = createPseudoElement(element, tagName, pseudoElt === '::before' ? 0 : -1);
                if (tagName === 'img') {
                    (<HTMLImageElement> pseudoElement).src = content;
                }
                else if (value !== '""') {
                    pseudoElement.innerText = content;
                }
                for (const attr in styleMap) {
                    if (attr !== 'display') {
                        pseudoElement.style[attr] = styleMap[attr];
                    }
                }
                $session.setElementCache(pseudoElement, 'pseudoElement', this.processing.sessionId, pseudoElt);
                $session.setElementCache(pseudoElement, 'styleMap', this.processing.sessionId, styleMap);
                return pseudoElement;
            }
        }
        return undefined;
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
            applyStyleSheet(<CSSStyleSheet> styleSheets[i]);
        }
    }

    protected applyCSSRuleList(rules: CSSRuleList) {
        const length = rules.length;
        for (let i = 0; i < length; i++) {
            this.applyStyleRule(<CSSStyleRule> rules[i]);
        }
    }

    protected applyStyleRule(item: CSSStyleRule) {
        const sessionId = this.processing.sessionId;
        switch (item.type) {
            case CSSRule.STYLE_RULE: {
                const fromRule: string[] = [];
                for (const attr of Array.from(item.style)) {
                    fromRule.push($util.convertCamelCase(attr));
                }
                for (const selectorText of item.selectorText.split($regex.XML.SEPARATOR)) {
                    const specificity = $css.getSpecificity(selectorText);
                    const [selector, target] = selectorText.split('::');
                    const targetElt = target ? '::' + target : '';
                    document.querySelectorAll(selector || '*').forEach((element: HTMLElement) => {
                        const style = $css.getStyle(element, targetElt);
                        const styleMap: StringMap = {};
                        for (const attr of fromRule) {
                            const value = $css.checkStyleValue(element, attr, item.style[attr], style);
                            if (value) {
                                styleMap[attr] = value;
                            }
                        }
                        [styleMap.backgroundImage, styleMap.listStyleImage, styleMap.content].forEach(image => {
                            if (image) {
                                if (CACHE_PATTERN.DATAURI === undefined) {
                                    CACHE_PATTERN.DATAURI = new RegExp(`url\\("(${$regex.STRING.DATAURI})"\\),?\\s*`, 'g');
                                }
                                else {
                                    CACHE_PATTERN.DATAURI.lastIndex = 0;
                                }
                                let match: RegExpExecArray | null;
                                while ((match = CACHE_PATTERN.DATAURI.exec(image)) !== null) {
                                    if (match[2] && match[3]) {
                                        this.resourceHandler.addRawData(match[1], match[2], match[3], match[4]);
                                    }
                                    else if (this.userSettings.preloadImages) {
                                        const uri = $util.resolvePath(match[4]);
                                        if (uri !== '' && this.resourceHandler.getImage(uri) === undefined) {
                                            this.resourceHandler.assets.images.set(uri, { width: 0, height: 0, uri });
                                        }
                                    }
                                }
                            }
                        });
                        const attrStyle = `styleMap${targetElt}`;
                        const attrSpecificity = `styleSpecificity${targetElt}`;
                        const styleData: StringMap = $session.getElementCache(element, attrStyle, sessionId);
                        if (styleData) {
                            const specificityData: ObjectMap<number> = $session.getElementCache(element, attrSpecificity, sessionId) || {};
                            for (const attr in styleMap) {
                                if (specificityData[attr] === undefined || specificity >= specificityData[attr]) {
                                    styleData[attr] = styleMap[attr];
                                    specificityData[attr] = specificity;
                                }
                            }
                        }
                        else {
                            const specificityData: ObjectMap<number> = {};
                            for (const attr in styleMap) {
                                specificityData[attr] = specificity;
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
                    CACHE_PATTERN.URL = /\s*(url|local)\(['"]([^'")]+)['"]\)\s*format\(['"](\w+)['"]\)\s*/;
                }
                const match = CACHE_PATTERN.FONT_FACE.exec(item.cssText);
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
                                if (urlMatch[1] === 'url') {
                                    srcUrl = $util.resolvePath(urlMatch[2].trim());
                                }
                                else {
                                    srcLocal = urlMatch[2].trim();
                                }
                                this.resourceHandler.addFont({
                                    fontFamily,
                                    fontWeight,
                                    fontStyle,
                                    srcUrl,
                                    srcLocal,
                                    srcFormat: urlMatch[3].toLowerCase().trim()
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