import { AppSessionUI, ControllerUISettings, FileAsset, LayoutResult, NodeTemplate, UserUISettings } from '../../@types/base/application';

import Application from './application';
import NodeList from './nodelist';
import ControllerUI from './controller-ui';
import ExtensionUI from './extension-ui';
import LayoutUI from './layout-ui';
import NodeUI from './node-ui';
import ResourceUI from './resource-ui';
import FileUI from './file-ui';

import { APP_SECTION, BOX_STANDARD, NODE_ALIGNMENT, NODE_PROCEDURE, NODE_RESOURCE, NODE_TRAVERSE } from './lib/enumeration';

const $lib = squared.lib;
const { BOX_POSITION, convertListStyle, formatPX, getStyle, insertStyleSheetRule, isLength, resolveURL } = $lib.css;
const { getNamedItem, getRangeClientRect, isTextNode, removeElementsByClassName } = $lib.dom;
const { aboveRange, captureMap, convertFloat, convertWord, filterArray, flatArray, fromLastIndexOf, hasBit, isString, partitionArray, trimString } = $lib.util;
const { XML } = $lib.regex;
const { getElementCache, getPseudoElt, setElementCache } = $lib.session;
const { isPlainText } = $lib.xml;

function createPseudoElement(parent: Element, tagName = 'span', index = -1) {
    const element = document.createElement(tagName);
    element.className = '__squared.pseudo';
    element.style.setProperty('display', 'none');
    if (index >= 0 && index < parent.childNodes.length) {
        parent.insertBefore(element, parent.childNodes[index]);
    }
    else {
        parent.appendChild(element);
    }
    return element;
}

function prioritizeExtensions<T extends NodeUI>(value: string | undefined, extensions: ExtensionUI<T>[]) {
    if (value) {
        const included = value.split(XML.SEPARATOR);
        const result: ExtensionUI<T>[] = [];
        const untagged: ExtensionUI<T>[] = [];
        for (const ext of extensions) {
            const index = included.indexOf(ext.name);
            if (index !== -1) {
                result[index] = ext;
            }
            else {
                untagged.push(ext);
            }
        }
        if (result.length) {
            return flatArray<ExtensionUI<T>>(result).concat(untagged);
        }
    }
    return extensions;
}

export default abstract class ApplicationUI<T extends NodeUI> extends Application<T> implements squared.base.ApplicationUI<T> {
    public readonly session: AppSessionUI<T> = {
        cache: new NodeList<T>(),
        excluded: new NodeList<T>(),
        extensionMap: new Map<number, ExtensionUI<T>[]>(),
        active: [],
        documentRoot: [],
        targetQueue: new Map<T, NodeTemplate<T>>()
    };
    public readonly builtInExtensions: ObjectMap<ExtensionUI<T>> = {};
    public readonly extensions: ExtensionUI<T>[] = [];
    public readonly controllerHandler!: ControllerUI<T>;
    public readonly resourceHandler!: ResourceUI<T>;
    public readonly fileHandler!: FileUI<T>;
    public abstract userSettings: UserUISettings;

    private readonly _layouts: FileAsset[] = [];
    private readonly _localSettings!: ControllerUISettings;
    private readonly _excluded!: Set<string>;

    protected constructor(
        framework: number,
        nodeConstructor: Constructor<T>,
        ControllerConstructor: Constructor<T>,
        ResourceConstructor: Constructor<T>,
        ExtensionManagerConstructor: Constructor<T>)
    {
        super(framework, nodeConstructor, ControllerConstructor, ResourceConstructor, ExtensionManagerConstructor);
        const localSettings = this.controllerHandler.localSettings;
        this._localSettings = localSettings;
        this._excluded = localSettings.unsupported.excluded;
    }

    public finalize() {
        const { controllerHandler, session } = this;
        for (const [node, template] of session.targetQueue.entries()) {
            const parent = this.resolveTarget(node.dataset.target);
            if (parent) {
                node.render(parent);
                this.addLayoutTemplate(parent, node, template);
            }
            else if (node.renderParent === undefined) {
                session.cache.remove(node);
            }
        }
        const rendered = this.rendered;
        for (const node of rendered) {
            if (node.hasProcedure(NODE_PROCEDURE.LAYOUT)) {
                node.setLayout();
            }
            if (node.hasProcedure(NODE_PROCEDURE.ALIGNMENT)) {
                node.setAlignment();
            }
        }
        controllerHandler.optimize(rendered);
        for (const ext of this.extensions) {
            for (const node of ext.subscribers) {
                ext.postOptimize(node);
            }
        }
        for (const node of this.rendered) {
            if (node.hasResource(NODE_RESOURCE.BOX_SPACING)) {
                node.setBoxSpacing();
            }
        }
        for (const ext of this.extensions) {
            ext.beforeCascade();
        }
        const baseTemplate = this._localSettings.layout.baseTemplate;
        for (const layout of session.documentRoot) {
            const node = layout.node;
            if (node.documentRoot && node.renderChildren.length === 0 && !node.inlineText && node.naturalChildren.every(item => item.documentRoot)) {
                continue;
            }
            const renderTemplates = node.renderParent?.renderTemplates;
            if (renderTemplates) {
                this.saveDocument(
                    layout.layoutName,
                    baseTemplate + controllerHandler.cascadeDocument(<NodeTemplate<T>[]> renderTemplates, 0),
                    node.dataset.pathname,
                    node.renderExtension?.some(item => item.documentBase) ? 0 : undefined
                );
            }
        }
        const layouts = this._layouts;
        this.resourceHandler.finalize(layouts);
        controllerHandler.finalize(layouts);
        for (const ext of this.extensions) {
            ext.afterFinalize();
        }
        removeElementsByClassName('__squared.pseudo');
        this.closed = true;
    }

    public copyToDisk(directory: string, callback?: CallbackResult) {
        super.copyToDisk(directory, callback, this.layouts);
    }

    public appendToArchive(pathname: string) {
        super.appendToArchive(pathname, this.layouts);
    }

    public saveToArchive(filename?: string) {
        super.saveToArchive(filename, this.layouts);
    }

    public reset() {
        super.reset();
        for (const element of this.rootElements) {
            element.dataset.iteration = '';
        }
        const session = this.session;
        session.cache.reset();
        session.excluded.reset();
        session.extensionMap.clear();
        session.documentRoot.length = 0;
        session.targetQueue.clear();
        this._layouts.length = 0;
    }

    public conditionElement(element: HTMLElement) {
        if (!this._excluded.has(element.tagName)) {
            if (this.controllerHandler.visibleElement(element) || this._cascadeAll || element.dataset.use && element.dataset.use.split(XML.SEPARATOR).some(value => !!this.extensionManager.retrieve(value))) {
                return true;
            }
            else {
                switch (getStyle(element).position) {
                    case 'absolute':
                    case 'fixed':
                        return false;
                }
                let current = element.parentElement;
                while (current) {
                    if (getStyle(current).display === 'none') {
                        return false;
                    }
                    current = current.parentElement;
                }
                const controllerHandler = this.controllerHandler;
                const children = element.children;
                const length = children.length;
                for (let i = 0; i < length; i++) {
                    if (controllerHandler.visibleElement(children[i])) {
                        return true;
                    }
                }
                return false;
            }
        }
        return false;
    }

    public insertNode(element: Element, parent?: T) {
        if (isTextNode(element)) {
            if (isPlainText(element.textContent as string) || parent?.preserveWhiteSpace && (parent.tagName !== 'PRE' || (parent.element as Element).childElementCount === 0)) {
                this.controllerHandler.applyDefaultStyles(element);
                const node = this.createNode(element, false);
                if (parent) {
                    node.cssApply(parent.textStyle);
                    node.fontSize = parent.fontSize;
                }
                return node;
            }
        }
        else if (this.conditionElement(<HTMLElement> element)) {
            this.controllerHandler.applyDefaultStyles(element);
            return this.createNode(element, false);
        }
        else {
            const node = this.createNode(element, false);
            node.visible = false;
            node.excluded = true;
            return node;
        }
        return undefined;
    }

    public saveDocument(filename: string, content: string, pathname?: string, index?: number) {
        if (isString(content)) {
            const layout: FileAsset = {
                pathname: pathname ? trimString(pathname, '/') : this._localSettings.layout.pathName,
                filename,
                content,
                index
            };
            const layouts = this._layouts;
            if (index !== undefined && index >= 0 && index < layouts.length) {
                layouts.splice(index, 0, layout);
            }
            else {
                layouts.push(layout);
            }
        }
    }

    public renderNode(layout: LayoutUI<T>) {
        return layout.itemCount === 0 ? this.controllerHandler.renderNode(layout) : this.controllerHandler.renderNodeGroup(layout);
    }

    public addLayout(layout: LayoutUI<T>) {
        const renderType = layout.renderType;
        if (hasBit(renderType, NODE_ALIGNMENT.FLOAT)) {
            if (hasBit(renderType, NODE_ALIGNMENT.HORIZONTAL)) {
                layout = this.processFloatHorizontal(layout);
            }
            else if (hasBit(renderType, NODE_ALIGNMENT.VERTICAL)) {
                layout = this.processFloatVertical(layout);
            }
        }
        if (layout.containerType !== 0) {
            const template = this.renderNode(layout);
            if (template) {
                return this.addLayoutTemplate(template.parent || layout.parent, layout.node, template, layout.renderIndex);
            }
        }
        return false;
    }

    public addLayoutTemplate(parent: T, node: T, template: NodeTemplate<T> | undefined, index = -1) {
        if (template) {
            if (!node.renderExclude) {
                if (node.renderParent) {
                    let renderTemplates = parent.renderTemplates;
                    if (renderTemplates === undefined) {
                        renderTemplates = [];
                        parent.renderTemplates = renderTemplates;
                    }
                    if (index >= 0 && index < parent.renderChildren.length) {
                        parent.renderChildren.splice(index, 0, node);
                        renderTemplates.splice(index, 0, template);
                    }
                    else {
                        parent.renderChildren.push(node);
                        renderTemplates.push(template);
                    }
                }
                else {
                    this.session.targetQueue.set(node, template);
                }
            }
            else {
                node.hide();
                node.excluded = true;
            }
            return true;
        }
        return false;
    }

    public createNode(element?: Element, append = true, parent?: T, children?: T[]) {
        const processing = this.processing;
        const node = new this._nodeConstructor(this.nextId, processing.sessionId, element, this.controllerHandler.afterInsertNode) as T;
        if (parent) {
            node.depth = parent.depth + 1;
            if (element === undefined && parent.naturalElement) {
                node.actualParent = parent;
            }
        }
        if (children) {
            for (const item of children) {
                item.parent = node;
            }
        }
        if (append) {
            processing.cache.append(node, children !== undefined);
        }
        return node;
    }

    public createCache(documentRoot: HTMLElement) {
        const node = this.createRootNode(documentRoot);
        if (node) {
            const controllerHandler = this.controllerHandler;
            const cache = <NodeList<T>> this._cache;
            const parent = node.parent as T;
            const preAlignment: ObjectIndex<StringMap> = {};
            const direction = new Set<HTMLElement>();
            const pseudoElements: T[] = [];
            let resetBounds = false;
            function saveAlignment(element: HTMLElement, id: number, attr: string, value: string, restoreValue: string) {
                let stored = preAlignment[id];
                if (stored === undefined) {
                    stored = {};
                    preAlignment[id] = stored;
                }
                stored[attr] = restoreValue;
                element.style.setProperty(attr, value);
            }
            if (node.documentBody) {
                parent.visible = false;
                parent.exclude({
                    resource: NODE_RESOURCE.FONT_STYLE | NODE_RESOURCE.VALUE_STRING,
                    procedure: NODE_PROCEDURE.ALL,
                    section: APP_SECTION.EXTENSION
                });
                cache.append(parent);
            }
            node.documentParent = parent;
            for (const item of cache) {
                if (item.styleElement) {
                    const element = <HTMLElement> item.element;
                    if (item.length) {
                        const textAlign = item.cssInitial('textAlign');
                        switch (textAlign) {
                            case 'center':
                            case 'right':
                            case 'end':
                                saveAlignment(element, item.id, 'text-align', 'left', textAlign);
                                break;
                        }
                    }
                    if (item.positionRelative) {
                        for (const attr of BOX_POSITION) {
                            if (item.hasPX(attr)) {
                                saveAlignment(element, item.id, attr, 'auto', item.css(attr));
                                resetBounds = true;
                            }
                        }
                    }
                    if (item.dir === 'rtl') {
                        element.dir = 'ltr';
                        direction.add(element);
                    }
                }
            }
            if (!resetBounds && direction.size) {
                resetBounds = true;
            }
            for (const item of this.processing.excluded) {
                if (!item.pageFlow) {
                    item.cssTry('display', 'none');
                }
            }
            parent.setBounds();
            for (const item of cache) {
                if (!item.pseudoElement) {
                    item.setBounds(preAlignment[item.id] === undefined && !resetBounds);
                    if (node.styleText) {
                        item.textBounds = getRangeClientRect(<Element> node.element);
                    }
                }
                else {
                    pseudoElements.push(item);
                }
            }
            if (pseudoElements.length) {
                const pseudoMap: { item: T; id: string; parentElement: Element; styleElement?: HTMLStyleElement }[] = [];
                for (const item of pseudoElements) {
                    const parentElement = <HTMLElement> (item.actualParent as T).element;
                    let id = parentElement.id;
                    let styleElement: HTMLStyleElement | undefined;
                    if (item.pageFlow) {
                        if (id === '') {
                            id = '__squared_' + Math.round(Math.random() * new Date().getTime());
                            parentElement.id = id;
                        }
                        styleElement = insertStyleSheetRule(`#${id + getPseudoElt(<Element> item.element, item.sessionId)} { display: none !important; }`);
                    }
                    if (item.cssTry('display', item.display)) {
                        pseudoMap.push({ item, id, parentElement, styleElement });
                    }
                }
                for (const data of pseudoMap) {
                    data.item.setBounds(false);
                }
                for (const data of pseudoMap) {
                    const { item, parentElement, styleElement } = data;
                    if (/^__squared_/.test(data.id)) {
                        parentElement.id = '';
                    }
                    if (styleElement) {
                        document.head.removeChild(styleElement);
                    }
                    item.cssFinally('display');
                }
            }
            for (const item of this.processing.excluded) {
                if (!item.lineBreak) {
                    item.setBounds();
                    item.saveAsInitial();
                }
                if (!item.pageFlow) {
                    item.cssFinally('display');
                }
            }
            for (const item of cache) {
                if (item.styleElement) {
                    const element = <HTMLElement> item.element;
                    const reset = preAlignment[item.id];
                    if (reset) {
                        for (const attr in reset) {
                            element.style.setProperty(attr, reset[attr]);
                        }
                    }
                    if (direction.has(element)) {
                        element.dir = 'rtl';
                    }
                }
                item.saveAsInitial();
            }
            controllerHandler.evaluateNonStatic(node, cache);
            controllerHandler.sortInitialCache();
            return true;
        }
        return false;
    }

    public afterCreateCache(element: HTMLElement) {
        const dataset = element.dataset;
        const { filename, iteration } = dataset;
        const prefix = isString(filename) && filename.replace(new RegExp(`\\.${this._localSettings.layout.fileExtension}$`), '') || element.id || 'document_' + this.length;
        const suffix = (iteration ? parseInt(iteration) : -1) + 1;
        const layoutName = convertWord(suffix > 1 ? prefix + '_' + suffix : prefix, true);
        dataset.iteration = suffix.toString();
        dataset.layoutName = layoutName;
        this.setBaseLayout();
        this.setConstraints();
        this.setResources(layoutName);
    }

    public resolveTarget(target: string | undefined) {
        if (isString(target)) {
            for (const parent of this._cache) {
                if (parent.elementId === target || parent.controlId === target) {
                    return parent;
                }
            }
            for (const parent of this.session.cache) {
                if (parent.elementId === target || parent.controlId === target) {
                    return parent;
                }
            }
        }
        return undefined;
    }

    public toString() {
        return this._layouts[0]?.content || '';
    }

    protected cascadeParentNode(parentElement: HTMLElement, depth: number, extensions?: ExtensionUI<T>[]) {
        const node = this.insertNode(parentElement);
        if (node && (node.display !== 'none' || depth === 0 || node.outerExtensionElement)) {
            node.depth = depth;
            if (depth === 0) {
                this._cache.append(node);
                const extensionManager = this.extensionManager;
                for (const name of node.extensions) {
                    const ext = <ExtensionUI<T>> extensionManager.retrieve(name);
                    if (ext?.cascadeAll) {
                        this._cascadeAll = true;
                        break;
                    }
                }
            }
            const controllerHandler = this.controllerHandler;
            if (controllerHandler.preventNodeCascade(parentElement)) {
                return node;
            }
            const sessionId = this.processing.sessionId;
            const beforeElement = this.createPseduoElement(parentElement, '::before', sessionId);
            const afterElement = this.createPseduoElement(parentElement, '::after', sessionId);
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
                if (element === beforeElement) {
                    child = this.insertNode(beforeElement);
                    if (child) {
                        node.innerBefore = child;
                        if (!child.textEmpty) {
                            child.inlineText = true;
                        }
                        inlineText = false;
                    }
                }
                else if (element === afterElement) {
                    child = this.insertNode(afterElement);
                    if (child) {
                        node.innerAfter = child;
                        if (!child.textEmpty) {
                            child.inlineText = true;
                        }
                        inlineText = false;
                    }
                }
                else if (element.nodeName.charAt(0) === '#') {
                    if (isTextNode(element)) {
                        child = this.insertNode(element, node);
                    }
                }
                else if (controllerHandler.includeElement(element)) {
                    if (extensions) {
                        prioritizeExtensions(element.dataset.use, extensions).some(item => (<any> item.init)(element));
                    }
                    if (!this.rootElements.has(element)) {
                        child = this.cascadeParentNode(element, depth + 1, extensions);
                        if (child && (!child.excluded || child.tagName === 'WBR')) {
                            inlineText = false;
                        }
                    }
                    else {
                        child = this.insertNode(element);
                        if (child) {
                            child.documentRoot = true;
                            child.visible = false;
                            child.excluded = true;
                        }
                        inlineText = false;
                    }
                    if (child) {
                        elements[k++] = child;
                    }
                }
                if (child) {
                    child.childIndex = j;
                    child.naturalChild = true;
                    children[j++] = child;
                }
            }
            children.length = j;
            elements.length = k;
            node.naturalChildren = children;
            node.naturalElements = elements;
            this.cacheNodeChildren(node, children, inlineText);
            if (this.userSettings.createQuerySelectorMap && k > 0) {
                node.queryMap = this.createQueryMap(elements);
            }
        }
        return node;
    }

    protected cacheNodeChildren(node: T, children: T[], inlineText: boolean) {
        const length = children.length;
        if (length) {
            const cache = this._cache;
            let siblingsLeading: T[] = [];
            let siblingsTrailing: T[] = [];
            if (length > 1) {
                let trailing = children[0];
                let floating = false;
                for (let i = 0, j = 0; i < length; i++) {
                    const child = children[i];
                    if (child.excluded) {
                        this.processing.excluded.append(child);
                    }
                    else if (!child.plainText || !inlineText) {
                        child.containerIndex = j++;
                        child.parent = node;
                        cache.append(child);
                    }
                    if (child.pageFlow) {
                        if (child.floating) {
                            floating = true;
                        }
                        if (i > 0) {
                            siblingsTrailing.push(child);
                            if (child.lineBreak) {
                                children[i - 1].lineBreakTrailing = true;
                            }
                        }
                        if (!child.excluded) {
                            child.siblingsLeading = siblingsLeading;
                            trailing.siblingsTrailing = siblingsTrailing;
                            siblingsLeading = [];
                            siblingsTrailing = [];
                            trailing = child;
                        }
                        if (i < length - 1) {
                            siblingsLeading.push(child);
                            if (child.lineBreak) {
                                children[i + 1].lineBreakLeading = true;
                            }
                        }
                    }
                    child.actualParent = node;
                }
                trailing.siblingsTrailing = siblingsTrailing;
                node.floatContainer = floating;
            }
            else {
                const child = children[0];
                if (child.excluded) {
                    this.processing.excluded.append(child);
                }
                else if (!child.plainText) {
                    child.siblingsLeading = siblingsLeading;
                    child.siblingsTrailing = siblingsTrailing;
                    child.parent = node;
                    child.containerIndex = 0;
                    cache.append(child);
                }
                child.actualParent = node;
            }
        }
        else {
            inlineText = !node.textEmpty;
        }
        node.inlineText = inlineText;
    }

    protected createPseduoElement(element: HTMLElement, pseudoElt: string, sessionId: string) {
        let styleMap: StringMap = getElementCache(element, 'styleMap' + pseudoElt, sessionId);
        let nested = 0;
        if (element.tagName === 'Q') {
            if (styleMap === undefined) {
                styleMap = {};
                setElementCache(element, 'styleMap' + pseudoElt, sessionId, styleMap);
            }
            let content = styleMap.content;
            if (typeof content !== 'string' || content === '') {
                content = getStyle(element, pseudoElt).getPropertyValue('content') || (pseudoElt === '::before' ? 'open-quote' : 'close-quote');
                styleMap.content = content;
            }
            if (/-quote$/.test(content)) {
                let current = element.parentElement;
                while (current?.tagName === 'Q') {
                    nested++;
                    current = current.parentElement;
                }
            }
        }
        if (styleMap) {
            let value = styleMap.content;
            if (value) {
                if (trimString(value, '"').trim() === '' && convertFloat(styleMap.width) === 0 && convertFloat(styleMap.height) === 0 && (styleMap.position === 'absolute' || styleMap.position === 'fixed' || styleMap.clear && styleMap.clear !== 'none')) {
                    let valid = true;
                    for (const attr in styleMap) {
                        if (/(Width|Height)$/.test(attr)) {
                            const dimension = styleMap[attr];
                            if (isLength(dimension, true) && convertFloat(dimension) !== 0) {
                                valid = false;
                                break;
                            }
                        }
                    }
                    if (valid) {
                        return undefined;
                    }
                }
                if (value === 'inherit') {
                    let current: HTMLElement | null = element;
                    while (current) {
                        value = getStyle(current).getPropertyValue('content');
                        if (value !== 'inherit') {
                            break;
                        }
                        current = current.parentElement;
                    }
                }
                const style = getStyle(element);
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
                let tagName = /^inline/.test(styleMap.display) ? 'span' : 'div';
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
                            content = nested % 2 === 0 ? '“' : "‘";
                        }
                        break;
                    case 'close-quote':
                        if (pseudoElt === '::after') {
                            content = nested % 2 === 0 ? '”' : "’";
                        }
                        break;
                    default:
                        if (/^url\(/.test(value)) {
                            content = resolveURL(value);
                            const format = fromLastIndexOf(content, '.').toLowerCase();
                            const imageFormat = this._localSettings.supported.imageFormat;
                            if (imageFormat === '*' || imageFormat.includes(format)) {
                                tagName = 'img';
                            }
                            else {
                                content = '';
                            }
                        }
                        else {
                            const pattern = /\s*(?:attr\(([^)]+)\)|(counter)\(([^,)]+)(?:, ([a-z-]+))?\)|(counters)\(([^,]+), "([^"]*)"(?:, ([a-z-]+))?\)|"([^"]+)")\s*/g;
                            let found = false;
                            let match: RegExpExecArray | null;
                            while ((match = pattern.exec(value)) !== null) {
                                const attr = match[1];
                                if (attr) {
                                    content += getNamedItem(element, attr.trim());
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
                                        if (name !== 'none') {
                                            const patternCounter = /\s*([^\-\d][^\-\d]?[^ ]*) (-?\d+)\s*/g;
                                            let counterMatch: RegExpExecArray | null;
                                            while ((counterMatch = patternCounter.exec(name)) !== null) {
                                                if (counterMatch[1] === counterName) {
                                                    return parseInt(counterMatch[2]);
                                                }
                                            }
                                        }
                                        return undefined;
                                    }
                                    const getIncrementValue = (parent: Element) => {
                                        const pseduoStyle: StringMap = getElementCache(parent, 'styleMap' + pseudoElt, sessionId);
                                        if (pseduoStyle?.counterIncrement) {
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
                                        if (getCounterValue(getStyle(sibling).getPropertyValue('counter-reset')) === undefined) {
                                            const children = sibling.children;
                                            const length = children.length;
                                            for (let i = 0; i < length; i++) {
                                                const child = children[i];
                                                if (child.className !== '__squared.pseudo') {
                                                    let increment = getIncrementValue(child);
                                                    if (increment) {
                                                        incrementCounter(increment, true);
                                                    }
                                                    const childStyle = getStyle(child);
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
                                            const currentStyle = getStyle(current);
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
                                                content += convertListStyle(styleName, leading, true) + match[7];
                                            }
                                        }
                                    }
                                    else {
                                        counter = initalValue;
                                    }
                                    content += convertListStyle(styleName, counter, true);
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
                        const image = this.resourceHandler.getImage(content);
                        if (image) {
                            if (styleMap.width === undefined) {
                                if (image.width > 0) {
                                    styleMap.width = formatPX(image.width);
                                }
                            }
                            if (styleMap.height === undefined) {
                                if (image.height > 0) {
                                    styleMap.height = formatPX(image.height);
                                }
                            }
                        }
                    }
                    else if (value !== '""') {
                        pseudoElement.innerText = content;
                    }
                    for (const attr in styleMap) {
                        if (attr !== 'display') {
                            pseudoElement.style[attr] = styleMap[attr];
                        }
                    }
                    setElementCache(pseudoElement, 'pseudoElement', sessionId, pseudoElt);
                    setElementCache(pseudoElement, 'styleMap', sessionId, styleMap);
                    return pseudoElement;
                }
            }
        }
        return undefined;
    }

    protected setBaseLayout() {
        const { processing, session } = this;
        const cache = processing.cache;
        const documentRoot = processing.node as T;
        const extensionMap = this.session.extensionMap;
        const mapY = new Map<number, Map<number, T>>();
        let extensions = filterArray(this.extensions, item => !item.eventOnly);
        let maxDepth = 0;
        function setMapY(depth: number, id: number, node: T) {
            const index = mapY.get(depth) || new Map<number, T>();
            mapY.set(depth, index.set(id, node));
        }
        function removeMapY(node: T) {
            const index = mapY.get(node.depth);
            if (index) {
                index.delete(node.id);
            }
        }
        setMapY(-1, 0, documentRoot.parent as T);
        for (const node of cache) {
            if (node.length) {
                const depth = node.depth;
                setMapY(depth, node.id, node);
                maxDepth = Math.max(depth, maxDepth);
            }
        }
        for (let i = 0; i < maxDepth; i++) {
            mapY.set((i * -1) - 2, new Map<number, T>());
        }
        cache.afterAppend = (node: T) => {
            removeMapY(node);
            setMapY((node.depth * -1) - 2, node.id, node);
            for (const item of node.cascade() as T[]) {
                removeMapY(item);
                setMapY((item.depth * -1) - 2, item.id, item);
            }
        };
        for (const ext of this.extensions) {
            ext.beforeBaseLayout();
        }
        for (const depth of mapY.values()) {
            for (const parent of depth.values()) {
                if (parent.length === 0) {
                    continue;
                }
                const floatContainer = parent.floatContainer;
                const renderExtension = <ExtensionUI<T>[] | undefined> parent.renderExtension;
                const axisY = parent.duplicate() as T[];
                const length = axisY.length;
                let cleared!: Map<T, string>;
                if (floatContainer) {
                    cleared = NodeUI.linearData(parent.naturalElements as T[], true).cleared;
                }
                for (let k = 0; k < length; k++) {
                    let nodeY = axisY[k];
                    if (nodeY.rendered || !nodeY.visible || nodeY.naturalElement && this.rootElements.has(<HTMLElement> nodeY.element) && !nodeY.documentRoot) {
                        continue;
                    }
                    let parentY = nodeY.parent as T;
                    if (length > 1 && k < length - 1 && nodeY.pageFlow && !nodeY.nodeGroup && (parentY.alignmentType === 0 || parentY.hasAlign(NODE_ALIGNMENT.UNKNOWN) || nodeY.hasAlign(NODE_ALIGNMENT.EXTENDABLE)) && !parentY.hasAlign(NODE_ALIGNMENT.AUTO_LAYOUT) && nodeY.hasSection(APP_SECTION.DOM_TRAVERSE)) {
                        const horizontal: T[] = [];
                        const vertical: T[] = [];
                        let extended = false;
                        function checkHorizontal(node: T) {
                            if (vertical.length || extended) {
                                return false;
                            }
                            horizontal.push(node);
                            return true;
                        }
                        function checkVertical(node: T) {
                            if (horizontal.length) {
                                return false;
                            }
                            vertical.push(node);
                            return true;
                        }
                        let l = k;
                        let m = 0;
                        if (nodeY.hasAlign(NODE_ALIGNMENT.EXTENDABLE) && parentY.layoutVertical) {
                            horizontal.push(nodeY);
                            l++;
                            m++;
                        }
                        traverse: {
                            let floatActive!: Set<string>;
                            let floatCleared!: Map<T, string>;
                            if (floatContainer) {
                                floatActive = new Set<string>();
                                floatCleared = new Map<T, string>();
                            }
                            for ( ; l < length; l++, m++) {
                                const item = axisY[l];
                                if (item.pageFlow) {
                                    if (floatContainer) {
                                        if (floatActive.size) {
                                            const float = cleared.get(item);
                                            if (float) {
                                                if (float === 'both') {
                                                    floatActive.clear();
                                                }
                                                else {
                                                    floatActive.delete(float);
                                                }
                                                floatCleared.set(item, float);
                                            }
                                        }
                                        if (item.floating) {
                                            floatActive.add(item.float);
                                        }
                                    }
                                    if (m === 0) {
                                        const next = item.siblingsTrailing[0];
                                        if (next) {
                                            if (!item.horizontalAligned || next.alignedVertically([item])) {
                                                vertical.push(item);
                                            }
                                            else {
                                                horizontal.push(item);
                                            }
                                            continue;
                                        }
                                    }
                                    const previous = item.siblingsLeading[0];
                                    if (previous) {
                                        if (floatContainer) {
                                            const status = item.alignedVertically(horizontal.length ? horizontal : vertical, cleared, horizontal.length > 0);
                                            if (status > 0) {
                                                if (horizontal.length) {
                                                    if (status !== NODE_TRAVERSE.FLOAT_INTERSECT && status !== NODE_TRAVERSE.FLOAT_BLOCK && floatActive.size && floatCleared.get(item) !== 'both' && !item.siblingsLeading.some((node: T) => node.lineBreak && !cleared.has(node))) {
                                                         if (!item.floating || previous.floating && !aboveRange(item.linear.top, previous.linear.bottom)) {
                                                            if (floatCleared.has(item)) {
                                                                if (!item.floating) {
                                                                    item.addAlign(NODE_ALIGNMENT.EXTENDABLE);
                                                                    horizontal.push(item);
                                                                    extended = true;
                                                                    continue;
                                                                }
                                                                break traverse;
                                                            }
                                                            else {
                                                                let floatBottom = Number.NEGATIVE_INFINITY;
                                                                if (!item.floating) {
                                                                    captureMap(
                                                                        horizontal,
                                                                        node => node.floating,
                                                                        node => floatBottom = Math.max(floatBottom, node.linear.bottom)
                                                                    );
                                                                }
                                                                if (!item.floating && !aboveRange(item.linear.top, floatBottom) || item.floating && floatActive.has(item.float)) {
                                                                    horizontal.push(item);
                                                                    if (!item.floating && aboveRange(item.linear.bottom, floatBottom)) {
                                                                        break traverse;
                                                                    }
                                                                    else {
                                                                        continue;
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                    break traverse;
                                                }
                                                if (!checkVertical(item)) {
                                                    break traverse;
                                                }
                                            }
                                            else if (!checkHorizontal(item)) {
                                                break traverse;
                                            }
                                        }
                                        else {
                                            if (item.alignedVertically()) {
                                                if (!checkVertical(item)) {
                                                    break traverse;
                                                }
                                            }
                                            else if (!checkHorizontal(item)) {
                                                break traverse;
                                            }
                                        }
                                    }
                                    else {
                                        break traverse;
                                    }
                                }
                                else if (item.positionAuto) {
                                    const lengthA = vertical.length;
                                    if (lengthA > 0) {
                                        if (vertical[lengthA - 1].blockStatic) {
                                            vertical.push(item);
                                        }
                                        break;
                                    }
                                    else {
                                        horizontal.push(item);
                                    }
                                }
                            }
                        }
                        let layout: LayoutUI<T> | undefined;
                        let segEnd: T | undefined;
                        if (horizontal.length > 1) {
                            layout = this.controllerHandler.processTraverseHorizontal(new LayoutUI(parentY, nodeY, 0, 0, horizontal), axisY);
                            segEnd = horizontal[horizontal.length - 1];
                        }
                        else if (vertical.length > 1) {
                            layout = this.controllerHandler.processTraverseVertical(new LayoutUI(parentY, nodeY, 0, 0, vertical), axisY);
                            segEnd = vertical[vertical.length - 1];
                            if (segEnd.horizontalAligned && segEnd !== axisY[length - 1]) {
                                segEnd.addAlign(NODE_ALIGNMENT.EXTENDABLE);
                            }
                        }
                        if (layout && this.addLayout(layout)) {
                            if (segEnd === axisY[length - 1]) {
                                parentY.removeAlign(NODE_ALIGNMENT.UNKNOWN);
                            }
                            parentY = nodeY.parent as T;
                        }
                    }
                    nodeY.removeAlign(NODE_ALIGNMENT.EXTENDABLE);
                    if (k === length - 1) {
                        parentY.removeAlign(NODE_ALIGNMENT.UNKNOWN);
                    }
                    if (nodeY.renderAs && parentY.appendTry(nodeY, nodeY.renderAs, false)) {
                        nodeY.hide();
                        nodeY = nodeY.renderAs as T;
                        if (nodeY.positioned) {
                            parentY = nodeY.parent as T;
                        }
                    }
                    if (!nodeY.rendered && nodeY.hasSection(APP_SECTION.EXTENSION)) {
                        const descendant = <ExtensionUI<T>[]> extensionMap.get(nodeY.id);
                        const combined = descendant ? (renderExtension ? renderExtension.concat(descendant) : descendant) : renderExtension;
                        if (combined) {
                            let next = false;
                            for (const ext of combined) {
                                const result = ext.processChild(nodeY, parentY);
                                if (result) {
                                    const { output, renderAs, outputAs } = result;
                                    if (output) {
                                        this.addLayoutTemplate(result.outerParent || parentY, nodeY, output);
                                    }
                                    if (renderAs && outputAs) {
                                        this.addLayoutTemplate(result.parentAs || parentY, renderAs, outputAs);
                                    }
                                    parentY = result.parent || parentY;
                                    next = result.next === true;
                                    if (result.complete || next) {
                                        break;
                                    }
                                }
                            }
                            if (next) {
                                continue;
                            }
                        }
                        if (nodeY.styleElement) {
                            let next = false;
                            function removeExtension(item: ExtensionUI<T>) {
                                const index = extensions.indexOf(item);
                                if (index !== -1) {
                                    extensions = extensions.slice(0);
                                    extensions.splice(index, 1);
                                }
                            }
                            for (const item of prioritizeExtensions(nodeY.dataset.use, extensions)) {
                                if (item.is(nodeY)) {
                                    if (item.removeIs) {
                                        removeExtension(item);
                                    }
                                    if (item.condition(nodeY, parentY) && (descendant === undefined || !descendant.includes(item))) {
                                        const result = item.processNode(nodeY, parentY);
                                        if (result) {
                                            const { output, renderAs, outputAs, include } = result;
                                            if (output) {
                                                this.addLayoutTemplate(result.outerParent || parentY, nodeY, output);
                                            }
                                            if (renderAs && outputAs) {
                                                this.addLayoutTemplate(result.parentAs || parentY, renderAs, outputAs);
                                            }
                                            parentY = result.parent || parentY;
                                            if (output && include !== false || include) {
                                                if (nodeY.renderExtension === undefined) {
                                                    nodeY.renderExtension = [];
                                                }
                                                nodeY.renderExtension.push(item);
                                                item.subscribers.add(nodeY);
                                            }
                                            if (result.remove) {
                                                removeExtension(item);
                                            }
                                            next = result.next === true;
                                            if (result.complete || next) {
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                            if (next) {
                                continue;
                            }
                        }
                    }
                    if (!nodeY.rendered && nodeY.hasSection(APP_SECTION.RENDER)) {
                        let layout = this.createLayoutControl(parentY, nodeY);
                        if (layout.containerType === 0) {
                            const result: LayoutResult<T> = nodeY.length ? this.controllerHandler.processUnknownParent(layout) : this.controllerHandler.processUnknownChild(layout);
                            if (result.next) {
                                continue;
                            }
                            layout = result.layout;
                        }
                        this.addLayout(layout);
                    }
                }
            }
        }
        cache.sort((a, b) => {
            if (a.depth === b.depth) {
                if (a.nodeGroup && (b.length === 0 || b.naturalChild)) {
                    return -1;
                }
                else if (b.nodeGroup && (a.length === 0 || a.naturalChild)) {
                    return 1;
                }
                return 0;
            }
            return a.depth < b.depth ? -1 : 1;
        });
        session.cache.concat(cache.children);
        session.excluded.concat(processing.excluded.children);
        for (const ext of this.extensions) {
            for (const node of ext.subscribers) {
                if (cache.contains(node)) {
                    ext.postBaseLayout(node);
                }
            }
            ext.afterBaseLayout();
        }
    }

    protected setConstraints() {
        const cache = this._cache;
        this.controllerHandler.setConstraints();
        for (const ext of this.extensions) {
            for (const node of ext.subscribers) {
                if (cache.contains(node)) {
                    ext.postConstraints(node);
                }
            }
            ext.afterConstraints();
        }
    }

    protected setResources(layoutName: string) {
        const resourceHandler = this.resourceHandler;
        for (const node of this._cache) {
            if (node.documentRoot && node.renderParent) {
                this.session.documentRoot.push({ node, layoutName: node === this.processing.node ? layoutName : '' });
            }
            resourceHandler.setBoxStyle(node);
            if (!node.imageElement && !node.svgElement && node.visible) {
                resourceHandler.setFontStyle(node);
                resourceHandler.setValueString(node);
            }
        }
        for (const ext of this.extensions) {
            ext.afterResources();
        }
    }

    protected processFloatHorizontal(layout: LayoutUI<T>) {
        const controllerHandler = this.controllerHandler;
        const { containerType, alignmentType } = controllerHandler.containerTypeVertical;
        const cleared = layout.cleared;
        const layerIndex: Array<T[] | T[][]> = [];
        const inlineAbove: T[] = [];
        const inlineBelow: T[] = [];
        const leftAbove: T[] = [];
        const rightAbove: T[] = [];
        let leftBelow: T[] | undefined;
        let rightBelow: T[] | undefined;
        let leftSub: T[] | T[][] | undefined;
        let rightSub: T[] | T[][] | undefined;
        let clearedFloat = 0;
        layout.each((node, index) => {
            if (index > 0) {
                const value = cleared.get(node);
                if (value) {
                    switch (value) {
                        case 'left':
                            if (!hasBit(clearedFloat, 2)) {
                                clearedFloat |= 2;
                            }
                            break;
                        case 'right':
                            if (!hasBit(clearedFloat, 4)) {
                                clearedFloat |= 4;
                            }
                            break;
                        default:
                            clearedFloat = 6;
                            break;
                    }
                }
            }
            const float = node.float;
            if (clearedFloat === 0) {
                if (float === 'right') {
                    rightAbove.push(node);
                }
                else if (float === 'left') {
                    leftAbove.push(node);
                }
                else if (leftAbove.length || rightAbove.length) {
                    let top = node.linear.top;
                    if (node.styleText) {
                        const textBounds = node.textBounds;
                        if (textBounds) {
                            top = Math.max(textBounds.top, top);
                        }
                    }
                    if (leftAbove.some(item => top >= item.linear.bottom) || rightAbove.some(item => top >= item.linear.bottom)) {
                        inlineBelow.push(node);
                    }
                    else {
                        inlineAbove.push(node);
                    }
                }
                else {
                    inlineAbove.push(node);
                }
            }
            else if (float === 'right') {
                if (clearedFloat === 4 || clearedFloat === 6) {
                    if (rightBelow === undefined) {
                        rightBelow = [];
                    }
                    rightBelow.push(node);
                }
                else {
                    rightAbove.push(node);
                }
            }
            else if (float === 'left') {
                if (clearedFloat === 2 || clearedFloat === 6) {
                    if (leftBelow === undefined) {
                        leftBelow = [];
                    }
                    leftBelow.push(node);
                }
                else {
                    leftAbove.push(node);
                }
            }
            else if (clearedFloat === 6) {
                inlineBelow.push(node);
            }
            else {
                inlineAbove.push(node);
            }
        });
        if (leftAbove.length) {
            leftSub = leftBelow ? [leftAbove, leftBelow] : leftAbove;
        }
        if (rightAbove.length) {
            rightSub = rightBelow ? [rightAbove, rightBelow] : rightAbove;
        }
        if (rightAbove.length + (rightBelow ? rightBelow.length : 0) === layout.length) {
            layout.add(NODE_ALIGNMENT.RIGHT);
        }
        if (inlineBelow.length) {
            const { node, parent } = layout;
            if (inlineBelow.length > 1) {
                inlineBelow[0].addAlign(NODE_ALIGNMENT.EXTENDABLE);
            }
            inlineBelow.unshift(node);
            const wrapper = this.createNode(undefined, true, parent, inlineBelow);
            wrapper.containerName = node.containerName;
            wrapper.inherit(node, 'boxStyle');
            wrapper.innerWrapped = node;
            this.addLayout(new LayoutUI(
                parent,
                wrapper,
                containerType,
                alignmentType | (parent.blockStatic ? NODE_ALIGNMENT.BLOCK : 0),
                inlineBelow
            ));
            layout.parent = wrapper;
        }
        if (inlineAbove.length) {
            layerIndex.push(inlineAbove);
        }
        if (leftSub) {
            layerIndex.push(leftSub);
        }
        if (rightSub) {
            layerIndex.push(rightSub);
        }
        layout.type = controllerHandler.containerTypeVerticalMargin;
        layout.itemCount = layerIndex.length;
        layout.add(NODE_ALIGNMENT.BLOCK);
        for (const item of layerIndex) {
            let segments: T[][];
            let floatgroup: T | undefined;
            if (Array.isArray(item[0])) {
                segments = item as T[][];
                const node = layout.node;
                let grouping: T[] = segments[0];
                for (let i = 1; i < segments.length; i++) {
                    grouping = grouping.concat(segments[i]);
                }
                grouping.sort((a: T, b: T) => a.childIndex < b.childIndex ? -1 : 1);
                if (node.layoutVertical) {
                    floatgroup = node;
                }
                else {
                    floatgroup = controllerHandler.createNodeGroup(grouping[0], grouping, node);
                    const group = new LayoutUI(
                        node,
                        floatgroup,
                        containerType,
                        alignmentType | (segments.some(seg => seg === rightSub || seg === rightAbove) ? NODE_ALIGNMENT.RIGHT : 0),
                    );
                    group.itemCount = segments.length;
                    this.addLayout(group);
                }
            }
            else {
                segments = [item as T[]];
            }
            for (const seg of segments) {
                const node = floatgroup || layout.node;
                const first = seg[0];
                const target = controllerHandler.createNodeGroup(first, seg, node, true);
                const group = new LayoutUI(
                    node,
                    target,
                    0,
                    NODE_ALIGNMENT.SEGMENTED | (seg === inlineAbove ? NODE_ALIGNMENT.COLUMN : 0),
                    seg
                );
                if (seg.length === 1) {
                    if (first.percentWidth) {
                        group.type = controllerHandler.containerTypePercent;
                    }
                    else {
                        group.setContainerType(containerType, alignmentType);
                    }
                    group.node.innerWrapped = first;
                }
                else if (group.linearY || group.unknownAligned) {
                    group.setContainerType(containerType, alignmentType | (group.unknownAligned ? NODE_ALIGNMENT.UNKNOWN : 0));
                }
                else {
                    controllerHandler.processLayoutHorizontal(group);
                }
                this.addLayout(group);
                if (seg === inlineAbove) {
                    this.setFloatPadding(node, target, inlineAbove, leftAbove, rightAbove);
                }
            }
        }
        return layout;
    }

    protected processFloatVertical(layout: LayoutUI<T>) {
        const controllerHandler = this.controllerHandler;
        const { containerType, alignmentType } = controllerHandler.containerTypeVertical;
        if (layout.containerType !== 0) {
            const node = layout.node;
            const parent = controllerHandler.createNodeGroup(node, [node], layout.parent);
            this.addLayout(new LayoutUI(
                parent,
                node,
                containerType,
                alignmentType,
                parent.children as T[]
            ));
            layout.node = parent;
        }
        else {
            layout.containerType = containerType;
            layout.add(alignmentType);
        }
        const staticRows: T[][] = [];
        const floatedRows: Null<T[]>[] = [];
        const current: T[] = [];
        const floated: T[] = [];
        let clearReset = false;
        let blockArea = false;
        let layoutVertical = true;
        for (const node of layout) {
            if (node.blockStatic && floated.length === 0) {
                current.push(node);
                blockArea = true;
            }
            else {
                if (layout.cleared.has(node)) {
                    if (!node.floating) {
                        node.modifyBox(BOX_STANDARD.MARGIN_TOP);
                        staticRows.push(current.slice(0));
                        floatedRows.push(floated.slice(0));
                        current.length = 0;
                        floated.length = 0;
                    }
                    else {
                        clearReset = true;
                    }
                }
                if (node.floating) {
                    if (blockArea) {
                        staticRows.push(current.slice(0));
                        floatedRows.push(null);
                        current.length = 0;
                        floated.length = 0;
                        blockArea = false;
                    }
                    floated.push(node);
                }
                else {
                    if (clearReset && !layout.cleared.has(node)) {
                        layoutVertical = false;
                    }
                    current.push(node);
                }
            }
        }
        if (floated.length) {
            floatedRows.push(floated);
        }
        if (current.length) {
            staticRows.push(current);
        }
        if (!layoutVertical) {
            const node = layout.node;
            const length = Math.max(floatedRows.length, staticRows.length);
            for (let i = 0; i < length; i++) {
                const pageFlow = staticRows[i] || [];
                if (floatedRows[i] === null && pageFlow.length) {
                    const layoutType = controllerHandler.containerTypeVertical;
                    this.addLayout(new LayoutUI(
                        node,
                        controllerHandler.createNodeGroup(pageFlow[0], pageFlow, node),
                        layoutType.containerType,
                        layoutType.alignmentType | NODE_ALIGNMENT.SEGMENTED | NODE_ALIGNMENT.BLOCK,
                        pageFlow
                    ));
                }
                else {
                    const floating = floatedRows[i] || [];
                    if (pageFlow.length || floating.length) {
                        const verticalMargin = controllerHandler.containerTypeVerticalMargin;
                        const basegroup = controllerHandler.createNodeGroup(floating[0] || pageFlow[0], [], node);
                        const group = new LayoutUI(
                            node,
                            basegroup,
                            verticalMargin.containerType,
                            verticalMargin.alignmentType
                        );
                        const children: T[] = [];
                        let subgroup: T | undefined;
                        if (floating.length) {
                            const floatgroup = controllerHandler.createNodeGroup(floating[0], floating, basegroup);
                            group.add(NODE_ALIGNMENT.FLOAT);
                            if (pageFlow.length === 0 && floating.every(item => item.float === 'right')) {
                                group.add(NODE_ALIGNMENT.RIGHT);
                            }
                            children.push(floatgroup);
                        }
                        if (pageFlow.length) {
                            subgroup = controllerHandler.createNodeGroup(pageFlow[0], pageFlow, basegroup);
                            children.push(subgroup);
                        }
                        basegroup.init();
                        group.itemCount = children.length;
                        this.addLayout(group);
                        for (let item of children) {
                            if (!item.nodeGroup) {
                                item = controllerHandler.createNodeGroup(item, [item], basegroup, true);
                            }
                            this.addLayout(new LayoutUI(
                                basegroup,
                                item,
                                containerType,
                                alignmentType | NODE_ALIGNMENT.SEGMENTED | NODE_ALIGNMENT.BLOCK,
                                item.children as T[]
                            ));
                        }
                        if (pageFlow.length && floating.length) {
                            const [leftAbove, rightAbove] = partitionArray(floating, item => item.float !== 'right');
                            this.setFloatPadding(node, subgroup as T, pageFlow, leftAbove, rightAbove);
                        }
                    }
                }
            }
        }
        return layout;
    }

    private setFloatPadding(parent: T, target: T, inlineAbove: T[], leftAbove: T[], rightAbove: T[]) {
        const requirePadding = (node: T) => node.textElement && (node.blockStatic || node.multiline);
        if (inlineAbove.some((child: T) => requirePadding(child) || child.blockStatic && child.cascadeSome((nested: T) => requirePadding(nested)))) {
            if (leftAbove.length) {
                let floatPosition = Number.NEGATIVE_INFINITY;
                let marginLeft = 0;
                let invalid = 0;
                let hasSpacing = false;
                for (const child of leftAbove) {
                    const right = child.linear.right + Math.min(child.marginLeft, 0);
                    if (right > floatPosition) {
                        floatPosition = right;
                        hasSpacing = child.marginRight > 0;
                    }
                }
                for (const child of inlineAbove) {
                    if (child.blockStatic) {
                        if (child.bounds.left > floatPosition) {
                            invalid++;
                        }
                        else {
                            marginLeft = Math.max(marginLeft, child.marginLeft);
                        }
                    }
                }
                if (invalid < inlineAbove.length) {
                    const offset = floatPosition - parent.box.left - marginLeft;
                    if (offset > 0) {
                        target.modifyBox(BOX_STANDARD.PADDING_LEFT, offset + (!hasSpacing && target.cascadeSome(child => child.multiline) ? this._localSettings.deviations.textMarginBoundarySize : 0));
                    }
                }
            }
            if (rightAbove.length) {
                let floatPosition = Number.POSITIVE_INFINITY;
                let marginRight = 0;
                let invalid = 0;
                let hasSpacing = false;
                for (const child of rightAbove) {
                    const left = child.linear.left + Math.min(child.marginRight, 0);
                    if (left < floatPosition) {
                        floatPosition = left;
                        hasSpacing = child.marginLeft > 0;
                    }
                }
                for (const child of inlineAbove) {
                    if (child.blockStatic) {
                        if (child.bounds.right < floatPosition) {
                            invalid++;
                        }
                        else {
                            marginRight = Math.max(marginRight, child.marginRight);
                        }
                    }
                }
                if (invalid < inlineAbove.length) {
                    const offset = parent.box.right - floatPosition - marginRight;
                    if (offset > 0) {
                        target.modifyBox(BOX_STANDARD.PADDING_RIGHT, offset + (!hasSpacing && target.cascadeSome(child => child.multiline) ? this._localSettings.deviations.textMarginBoundarySize : 0));
                    }
                }
            }
        }
    }

    private createLayoutControl(parent: T, node: T) {
        return new LayoutUI(
            parent,
            node,
            node.containerType,
            node.alignmentType,
            node.children as T[]
        );
    }

    get layouts() {
        return this._layouts.sort((a, b) => {
            const indexA = a.index;
            const indexB = b.index;
            if (indexA !== indexB) {
                if (indexA === 0 || indexB === Number.POSITIVE_INFINITY || indexB === undefined && !(indexA === Number.POSITIVE_INFINITY)) {
                    return -1;
                }
                else if (indexB === 0 || indexA === Number.POSITIVE_INFINITY || indexA === undefined && !(indexB === Number.POSITIVE_INFINITY)) {
                    return 1;
                }
                else if (indexA !== undefined && indexB !== undefined) {
                    return indexA < indexB ? -1 : 1;
                }
            }
            return 0;
        });
    }

    get rendered() {
        return this.session.cache.filter((node: T) => node.visible && node.renderParent !== undefined);
    }

    get extensionsCascade() {
        return this.extensions.filter(item => !!item.init);
    }

    get length() {
        return this.session.documentRoot.length;
    }
}