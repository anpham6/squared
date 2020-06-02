import Application from './application';
import NodeList from './nodelist';
import ControllerUI from './controller-ui';
import ExtensionUI from './extension-ui';
import FileUI from './file-ui';
import LayoutUI from './layout-ui';
import NodeUI from './node-ui';
import ResourceUI from './resource-ui';

import { APP_SECTION, BOX_STANDARD, NODE_ALIGNMENT, NODE_PROCEDURE, NODE_RESOURCE, NODE_TRAVERSE } from './lib/enumeration';

type FileActionOptions = squared.base.FileActionOptions;
type LayoutMap = Map<number, Set<NodeUI>>;

const { convertListStyle, formatPX, getStyle, insertStyleSheetRule, resolveURL } = squared.lib.css;
const { getNamedItem, removeElementsByClassName } = squared.lib.dom;
const { maxArray } = squared.lib.math;
const { appendSeparator, capitalize, convertWord, flatArray, hasBit, hasMimeType, isString, iterateArray, partitionArray, safeNestedArray, safeNestedMap, trimBoth, trimString } = squared.lib.util;
const { getElementCache, getPseudoElt, setElementCache } = squared.lib.session;
const { isPlainText } = squared.lib.xml;

const TEXT_STYLE = NodeUI.TEXT_STYLE.concat(['fontSize']);

function getCounterValue(value: string, counterName: string, fallback = 1) {
    if (value !== 'none') {
        const pattern = /\b([^\-\d][^\-\d]?[^\s]*)\s+(-?\d+)\b/g;
        let match: Null<RegExpExecArray>;
        while (match = pattern.exec(value)) {
            if (match[1] === counterName) {
                return parseInt(match[2]);
            }
        }
        return fallback;
    }
    return undefined;
}

function getCounterIncrementValue(parent: Element, counterName: string, pseudoElt: string, sessionId: string, fallback?: number) {
    const counterIncrement = (getElementCache(parent, `styleMap${pseudoElt}`, sessionId) as Undef<CSSStyleDeclaration>)?.counterIncrement;
    return counterIncrement ? getCounterValue(counterIncrement, counterName, fallback) : undefined;
}

function prioritizeExtensions<T extends NodeUI>(value: string, extensions: ExtensionUI<T>[]) {
    const included = value.trim().split(/\s*,\s*/);
    const result: ExtensionUI<T>[] = [];
    const untagged: ExtensionUI<T>[] = [];
    for (let i = 0; i < extensions.length; ++i) {
        const ext = extensions[i];
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
    return extensions;
}

function getFloatAlignmentType(nodes: NodeUI[]) {
    let result = 0;
    let right = true;
    let floating = true;
    const length = nodes.length;
    let i = 0;
    while (i < length) {
        const item = nodes[i++];
        if (!item.floating) {
            floating = false;
        }
        if (!item.rightAligned) {
            right = false;
        }
        if (!floating && !right) {
            break;
        }
    }
    if (floating) {
        result |= NODE_ALIGNMENT.FLOAT;
    }
    if (right) {
        result |= NODE_ALIGNMENT.RIGHT;
    }
    return result;
}

function checkPseudoAfter(element: Element) {
    const previousSibling = element.childNodes[element.childNodes.length - 1] as Element;
    return previousSibling.nodeName === '#text' && !/\s+$/.test(previousSibling.textContent as string);
}

function checkPseudoDimension(styleMap: StringMap, after: boolean, absolute: boolean) {
    switch (styleMap.display) {
        case undefined:
        case 'block':
        case 'inline':
        case 'inherit':
        case 'initial':
            break;
        default:
            return true;
    }
    if ((after || !parseFloat(styleMap.width)) && !parseFloat(styleMap.height)) {
        for (const attr in styleMap) {
            if (/(padding|Width|Height)/.test(attr) && parseFloat(styleMap[attr]) > 0) {
                return true;
            }
            else if (!absolute && attr.startsWith('margin') && parseFloat(styleMap[attr])) {
                return true;
            }
        }
        return false;
    }
    return true;
}

function getPseudoQuoteValue(element: HTMLElement, pseudoElt: string, outside: string, inside: string, sessionId: string) {
    let current: Null<HTMLElement> = element;
    let found = 0;
    let i = 0, j = -1;
    while (current?.tagName === 'Q') {
        const quotes = (getElementCache(current, `styleMap`, sessionId) as Undef<CSSStyleDeclaration>)?.quotes || getComputedStyle(current).quotes;
        if (quotes) {
            const match = /("(?:[^"]|\\")+"|[^\s]+)\s+("(?:[^"]|\\")+"|[^\s]+)(?:\s+("(?:[^"]|\\")+"|[^\s]+)\s+("(?:[^"]|\\")+"|[^\s]+))?/.exec(quotes);
            if (match) {
                if (pseudoElt === '::before') {
                    if (found === 0) {
                        outside = extractQuote(match[1]);
                        ++found;
                    }
                    if (match[3] && found < 2) {
                        inside = extractQuote(match[3]);
                        ++found;
                    }
                }
                else {
                    if (found === 0) {
                        outside = extractQuote(match[2]);
                        ++found;
                    }
                    if (match[4] && found < 2) {
                        inside = extractQuote(match[4]);
                        ++found;
                    }
                }
                j = i;
            }
        }
        current = current.parentElement;
        ++i;
    }
    if (found === 0) {
        --i;
    }
    else if (j === 0) {
        return outside;
    }
    else if (j > 0) {
        return inside;
    }
    return i % 2 === 0 ? outside : inside;
}

function getRelativeOffset(node: NodeUI, fromRight: boolean) {
    return node.positionRelative
        ? node.hasPX('left')
            ? node.left * (fromRight ? 1 : -1)
            : node.right * (fromRight ? -1 : 1)
        : 0;
}

function setMapDepth(map: LayoutMap, depth: number, node: NodeUI) {
    const data = map.get(depth);
    if (data) {
        data.add(node);
    }
    else {
        map.set(depth, new Set([node]));
    }
}

const extractQuote = (value: string) => /^"(.+)"$/.exec(value)?.[1] || value;
const isHorizontalAligned = (node: NodeUI) => !node.blockStatic && node.autoMargin.horizontal !== true && !(node.blockDimension && node.css('width') === '100%') && (!(node.plainText && node.multiline) || node.floating);
const requirePadding = (node: NodeUI, depth?: number): boolean => node.textElement && (node.blockStatic || node.multiline || depth === 1);
const hasOuterParentExtension = (node: NodeUI) => node.ascend({ condition: (item: NodeUI) => isString(item.use) }).length > 0;
const getMapIndex = (value: number) => (value * -1) - 2;

export default abstract class ApplicationUI<T extends NodeUI> extends Application<T> implements squared.base.ApplicationUI<T> {
    public readonly session: squared.base.AppSessionUI<T> = {
        cache: new NodeList<T>(),
        excluded: new NodeList<T>(),
        extensionMap: new Map<number, ExtensionUI<T>[]>(),
        clearMap: new Map<T, string>(),
        active: []
    };
    public readonly builtInExtensions: ObjectMap<ExtensionUI<T>> = {};
    public readonly extensions: ExtensionUI<T>[] = [];
    public readonly controllerHandler!: ControllerUI<T>;
    public readonly resourceHandler!: ResourceUI<T>;
    public readonly fileHandler!: FileUI<T>;
    public abstract userSettings: UserSettingsUI;

    private readonly _layouts: LayoutAsset[] = [];
    private readonly _controllerSettings!: ControllerSettingsUI;
    private readonly _excluded!: Set<string>;
    private readonly _layoutFileExtension: RegExp;

    protected constructor(
        framework: number,
        nodeConstructor: Constructor<T>,
        ControllerConstructor: Constructor<T>,
        ResourceConstructor: Constructor<T>,
        ExtensionManagerConstructor?: Constructor<T>)
    {
        super(framework, nodeConstructor, ControllerConstructor, ResourceConstructor, ExtensionManagerConstructor);
        const localSettings = this.controllerHandler.localSettings;
        this._controllerSettings = localSettings;
        this._layoutFileExtension = new RegExp(`\\.${localSettings.layout.fileExtension}$`);
        this._excluded = localSettings.unsupported.excluded;
    }

    public finalize() {
        if (this.closed) {
            return;
        }
        const { controllerHandler, session } = this;
        const cache = session.cache;
        const extensions = this.extensions;
        const layouts = this._layouts;
        const children = cache.children;
        let length = children.length;
        const rendered: T[] = new Array(length);
        let i = 0, j = 0;
        while (i < length) {
            const node = children[i++];
            if (node.renderParent && node.visible) {
                if (node.hasProcedure(NODE_PROCEDURE.LAYOUT)) {
                    node.setLayout();
                }
                if (node.hasProcedure(NODE_PROCEDURE.ALIGNMENT)) {
                    node.setAlignment();
                }
                rendered[j++] = node;
            }
        }
        rendered.length = j;
        controllerHandler.optimize(rendered);
        length = extensions.length;
        i = 0;
        while (i < length) {
            const ext = extensions[i++];
            for (const node of ext.subscribers) {
                ext.postOptimize(node);
            }
        }
        const documentRoot: squared.base.LayoutRoot<T>[] = [];
        i = 0;
        while (i < j) {
            const node = rendered[i++];
            if (node.hasResource(NODE_RESOURCE.BOX_SPACING)) {
                node.setBoxSpacing();
            }
            if (node.documentRoot) {
                if (node.renderChildren.length === 0 && !node.inlineText) {
                    const naturalElement = node.naturalElements;
                    if (naturalElement.length && naturalElement.every(item => item.documentRoot)) {
                        continue;
                    }
                }
                const layoutName = node.innerMostWrapped.data(Application.KEY_NAME, 'layoutName');
                if (layoutName) {
                    documentRoot.push({ node, layoutName });
                }
            }
        }
        i = 0;
        while (i < length) {
            extensions[i++].beforeCascade(documentRoot);
        }
        const baseTemplate = this._controllerSettings.layout.baseTemplate;
        const systemName = capitalize(this.systemName);
        for (i = 0; i < documentRoot.length; ++i) {
            const { node, layoutName } = documentRoot[i];
            const renderTemplates = node.renderParent!.renderTemplates;
            if (renderTemplates) {
                this.saveDocument(
                    layoutName,
                    baseTemplate + controllerHandler.cascadeDocument(renderTemplates as NodeTemplate<T>[], Math.abs(node.depth)),
                    node.dataset['pathname' + systemName],
                    node.renderExtension?.some(item => item.documentBase) ? 0 : undefined
                );
            }
        }
        this.resourceHandler.finalize(layouts);
        controllerHandler.finalize(layouts);
        i = 0;
        while (i < length) {
            extensions[i++].afterFinalize();
        }
        removeElementsByClassName('__squared.pseudo');
        this.closed = true;
    }

    public copyToDisk(directory: string, options?: FileActionOptions) {
        return super.copyToDisk(directory, this.createAssetOptions(options));
    }

    public appendToArchive(pathname: string, options?: FileActionOptions) {
        return super.appendToArchive(pathname, this.createAssetOptions(options));
    }

    public saveToArchive(filename?: string, options?: FileActionOptions) {
        return super.saveToArchive(filename, this.createAssetOptions(options));
    }

    public reset() {
        super.reset();
        const iterationName = 'iteration' + capitalize(this.systemName);
        for (const element of this.rootElements) {
            delete element.dataset[iterationName];
        }
        const session = this.session;
        session.cache.reset();
        session.excluded.reset();
        session.extensionMap.clear();
        this._layouts.length = 0;
    }

    public conditionElement(element: HTMLElement, pseudoElt?: string) {
        if (!this._excluded.has(element.tagName)) {
            if (this.controllerHandler.visibleElement(element, pseudoElt) || this._cascadeAll) {
                return true;
            }
            else if (!pseudoElt) {
                switch (getStyle(element).position) {
                    case 'absolute':
                    case 'fixed':
                        return this.useElement(element);
                }
                let current = element.parentElement;
                while (current) {
                    if (getStyle(current).display === 'none') {
                        return this.useElement(element);
                    }
                    current = current.parentElement;
                }
                const controllerHandler = this.controllerHandler;
                if (iterateArray(element.children, (item: HTMLElement) => controllerHandler.visibleElement(item)) === Infinity) {
                    return true;
                }
                return this.useElement(element);
            }
        }
        return false;
    }

    public insertNode(element: Element, pseudoElt?: string) {
        if (element.nodeName === '#text' || this.conditionElement(element as HTMLElement, pseudoElt)) {
            this.controllerHandler.applyDefaultStyles(element);
            const node = this.createNode({ element, append: false });
            return node;
        }
        else {
            const node = this.createNode({ element, append: false });
            node.visible = false;
            node.excluded = true;
            return node;
        }
    }

    public saveDocument(filename: string, content: string, pathname?: string, index?: number) {
        if (isString(content)) {
            const layout: LayoutAsset = {
                pathname: pathname
                    ? trimString(pathname.replace(/\\/g, '/'), '/')
                    : appendSeparator(this.userSettings.outputDirectory, this._controllerSettings.layout.pathName),
                filename,
                content,
                index
            };
            if (index === undefined || !(index >= 0 && index < this._layouts.length)) {
                this._layouts.push(layout);
            }
            else {
                this._layouts.splice(index, 0, layout);
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

    public addLayoutTemplate(parent: T, node: T, template: Undef<NodeTemplate<T>>, index?: number) {
        if (template) {
            if (!node.renderExclude) {
                if (node.renderParent) {
                    const renderTemplates = safeNestedArray(parent as StandardMap, 'renderTemplates');
                    if (index === undefined || !(index >= 0 && index < parent.renderChildren.length)) {
                        parent.renderChildren.push(node);
                        renderTemplates.push(template);
                    }
                    else {
                        parent.renderChildren.splice(index, 0, node);
                        renderTemplates.splice(index, 0, template);
                    }
                }
            }
            else {
                node.hide({ remove: true });
                node.excluded = true;
            }
            return true;
        }
        return false;
    }

    public createNode(options: CreateNodeOptions<T>) {
        const { element, parent, children } = options;
        const node = new this.Node(this.nextId, this.processing.sessionId, element);
        this.controllerHandler.afterInsertNode(node);
        if (parent) {
            node.depth = parent.depth + 1;
            if (!element && parent.naturalElement) {
                node.actualParent = parent;
            }
            const child = options.innerWrap;
            if (child && parent.replaceTry({ child, replaceWith: node })) {
                child.parent = node;
                node.innerWrapped = child;
            }
        }
        if (children) {
            const length = children.length;
            let i = 0;
            while (i < length) {
                children[i++].parent = node;
            }
        }
        if (options.append !== false) {
            this.processing.cache.add(node, options.delegate === true, options.cascade === true);
        }
        return node;
    }

    public createCache(documentRoot: HTMLElement) {
        const node = this.createRootNode(documentRoot);
        if (node) {
            const cache = this._cache as NodeList<T>;
            {
                const parent = node.parent as T;
                parent.visible = false;
                node.documentParent = parent;
                if (parent.tagName === 'HTML') {
                    parent.addAlign(NODE_ALIGNMENT.AUTO_LAYOUT);
                    parent.exclude({ resource: NODE_RESOURCE.FONT_STYLE | NODE_RESOURCE.VALUE_STRING, procedure: NODE_PROCEDURE.ALL });
                    cache.add(parent);
                }
            }
            node.rootElement = true;
            const preAlignment: ObjectIndex<StringMap> = {};
            const direction = new Set<HTMLElement>();
            const pseudoElements: T[] = [];
            let resetBounds = false;
            cache.each(item => {
                if (item.styleElement) {
                    const element = item.element as HTMLElement;
                    if (item.length) {
                        const textAlign = item.cssInitial('textAlign');
                        switch (textAlign) {
                            case 'center':
                            case 'right':
                            case 'end':
                                safeNestedMap(preAlignment, item.id)['text-align'] = textAlign;
                                element.style.setProperty('text-align', 'left');
                                break;
                        }
                    }
                    if (item.positionRelative) {
                        let i = 0;
                        while (i < 4) {
                            const attr = NodeUI.BOX_POSITION[i++];
                            if (item.hasPX(attr)) {
                                safeNestedMap(preAlignment, item.id)[attr] = item.css(attr);
                                element.style.setProperty(attr, 'auto');
                                resetBounds = true;
                            }
                        }
                    }
                    if (item.dir === 'rtl') {
                        element.dir = 'ltr';
                        direction.add(element);
                        resetBounds = true;
                    }
                }
            });
            this.processing.excluded.each(item => {
                if (!item.pageFlow) {
                    item.cssTry('display', 'none');
                }
            });
            cache.each(item => {
                if (!item.pseudoElement) {
                    item.setBounds(!resetBounds && preAlignment[item.id] === undefined);
                }
                else {
                    pseudoElements.push(item);
                }
            });
            if (pseudoElements.length) {
                const pseudoMap: { item: T; id: string; parentElement: Element; styleElement?: HTMLStyleElement }[] = [];
                for (let i = 0; i < pseudoElements.length; ++i) {
                    const item = pseudoElements[i];
                    const parentElement = item.actualParent!.element as HTMLElement;
                    let id = parentElement.id;
                    let styleElement: Undef<HTMLStyleElement>;
                    if (item.pageFlow) {
                        if (id === '') {
                            id = '__squared_' + Math.round(Math.random() * new Date().getTime());
                            parentElement.id = id;
                        }
                        styleElement = insertStyleSheetRule(`#${id + getPseudoElt(item.element as Element, item.sessionId)} { display: none !important; }`);
                    }
                    if (item.cssTry('display', item.display)) {
                        pseudoMap.push({ item, id, parentElement, styleElement });
                    }
                }
                pseudoMap.forEach(data => data.item.setBounds(false));
                for (let i = 0; i < pseudoMap.length; ++i) {
                    const data = pseudoMap[i];
                    const styleElement = data.styleElement;
                    if (data.id.startsWith('__squared_')) {
                        data.parentElement.id = '';
                    }
                    if (styleElement) {
                        try {
                            document.head.removeChild(styleElement);
                        }
                        catch {
                        }
                    }
                    data.item.cssFinally('display');
                }
            }
            this.processing.excluded.each(item => {
                if (!item.lineBreak) {
                    item.setBounds(!resetBounds);
                    item.saveAsInitial();
                }
                if (!item.pageFlow) {
                    item.cssFinally('display');
                }
            });
            cache.each(item => {
                if (item.styleElement) {
                    const element = item.element as HTMLElement;
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
            });
            this.controllerHandler.evaluateNonStatic(node, cache);
            this.controllerHandler.sortInitialCache();
        }
        return node;
    }

    public afterCreateCache(node: T) {
        const systemName = capitalize(this.systemName);
        const dataset = node.dataset;
        const filename = dataset['filename' + systemName] || dataset.filename;
        const iteration = dataset['iteration' + systemName];
        const prefix = isString(filename) && filename.replace(this._layoutFileExtension, '') || node.elementId || `document_${this.length}`;
        const suffix = (iteration ? parseInt(iteration) : -1) + 1;
        const layoutName = convertWord(suffix > 0 ? prefix + '_' + suffix : prefix, true);
        dataset['iteration' + systemName] = suffix.toString();
        dataset['layoutName' + systemName] = layoutName;
        node.data(Application.KEY_NAME, 'layoutName', layoutName);
        this.setBaseLayout();
        this.setConstraints();
        this.setResources();
    }

    public useElement(element: HTMLElement) {
        const use = this.getDatasetName('use', element);
        return isString(use) && use.split(',').some(value => !!this.extensionManager.retrieve(value.trim()));
    }

    public toString() {
        return this.layouts[0]?.content || '';
    }

    protected cascadeParentNode(parentElement: HTMLElement, depth: number, extensions?: ExtensionUI<T>[]) {
        const node = this.insertNode(parentElement);
        if (node.display !== 'none' || depth === 0 || hasOuterParentExtension(node)) {
            if (depth === 0) {
                node.depth = depth;
                this._cache.add(node);
                for (const name of node.extensions) {
                    if ((this.extensionManager.retrieve(name) as ExtensionUI<T>)?.cascadeAll) {
                        this._cascadeAll = true;
                        break;
                    }
                }
            }
            const controllerHandler = this.controllerHandler;
            if (node.excluded && !hasOuterParentExtension(node) || controllerHandler.preventNodeCascade(node)) {
                return node;
            }
            const sessionId = this.processing.sessionId;
            const beforeElement = this.createPseduoElement(parentElement, '::before', sessionId);
            const afterElement = this.createPseduoElement(parentElement, '::after', sessionId);
            const childNodes = parentElement.childNodes;
            const length = childNodes.length;
            const children: T[] = new Array(length);
            const elements: T[] = new Array(parentElement.childElementCount);
            const childDepth = depth + 1;
            let inlineText = true;
            let i = 0, j = 0, k = 0;
            while (i < length) {
                const element = childNodes[i++] as HTMLElement;
                let child: T;
                if (element === beforeElement) {
                    child = this.insertNode(beforeElement, '::before');
                    node.innerBefore = child;
                    if (!child.textEmpty) {
                        child.inlineText = true;
                    }
                    inlineText = false;
                }
                else if (element === afterElement) {
                    child = this.insertNode(afterElement, '::after');
                    node.innerAfter = child;
                    if (!child.textEmpty) {
                        child.inlineText = true;
                    }
                    inlineText = false;
                }
                else if (element.nodeName.charAt(0) === '#') {
                    if (element.nodeName === '#text' && (isPlainText(element.textContent!) || node.preserveWhiteSpace && (parentElement.tagName !== 'PRE' || parentElement.childElementCount === 0))) {
                        child = this.insertNode(element);
                        child.cssApply(node.textStyle);
                    }
                    else {
                        continue;
                    }
                }
                else if (controllerHandler.includeElement(element)) {
                    if (extensions) {
                        const use = this.getDatasetName('use', element);
                        if (use) {
                            prioritizeExtensions(use, extensions).some(item => (item.init as BindGeneric<HTMLElement, boolean>)(element));
                        }
                    }
                    if (!this.rootElements.has(element)) {
                        child = this.cascadeParentNode(element, childDepth, extensions);
                        if (child?.excluded === false) {
                            inlineText = false;
                        }
                    }
                    else {
                        child = this.insertNode(element);
                        child.documentRoot = true;
                        child.visible = false;
                        child.excluded = true;
                        inlineText = false;
                    }
                    elements[k++] = child;
                }
                else {
                    continue;
                }
                child.depth = childDepth;
                child.childIndex = j;
                child.naturalChild = true;
                children[j++] = child;
            }
            children.length = j;
            elements.length = k;
            node.naturalChildren = children;
            node.naturalElements = elements;
            node.inlineText = inlineText;
            if (!inlineText) {
                if (j > 0) {
                    this.cacheNodeChildren(node, children);
                }
                node.inlineText = inlineText;
            }
            else {
                node.inlineText = !node.textEmpty;
            }
            if (k > 0 && this.userSettings.createQuerySelectorMap) {
                node.queryMap = this.createQueryMap(elements, k);
            }
        }
        return node;
    }

    protected cacheNodeChildren(node: T, children: T[]) {
        const cache = this._cache;
        const length = children.length;
        if (length > 1) {
            let siblingsLeading: T[] = [];
            let siblingsTrailing: T[] = [];
            let trailing = children[0];
            let floating = false;
            let excluded: Undef<boolean>;
            for (let i = 0, j = 0; i < length; ++i) {
                const child = children[i];
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
                if (child.excluded) {
                    excluded = true;
                    this.processing.excluded.add(child);
                }
                else {
                    child.$parent = node;
                    child.containerIndex = j++;
                    cache.add(child);
                }
                child.actualParent = node;
            }
            trailing.siblingsTrailing = siblingsTrailing;
            node.floatContainer = floating;
            node.retainAs(excluded ? children.filter(item => !item.excluded) : children.slice(0));
        }
        else {
            const child = children[0];
            if (child.excluded) {
                this.processing.excluded.add(child);
            }
            else {
                child.$parent = node;
                child.containerIndex = 0;
                node.add(child);
                cache.add(child);
                node.floatContainer = child.floating;
            }
            child.actualParent = node;
        }
    }

    protected setBaseLayout() {
        const { controllerHandler, processing, session } = this;
        const { extensionMap, clearMap } = session;
        const cache = processing.cache;
        const documentRoot = processing.node as T;
        const mapY = new Map<number, Set<T>>();
        {
            let maxDepth = 0;
            setMapDepth(mapY, -1, documentRoot.parent as T);
            cache.each(node => {
                if (node.length) {
                    const depth = node.depth;
                    setMapDepth(mapY, depth, node);
                    maxDepth = Math.max(depth, maxDepth);
                    if (node.floatContainer) {
                        const floated = new Set<string>();
                        let clearable: T[] = [];
                        const children = (node.documentChildren || node.naturalChildren) as T[];
                        const length = children.length;
                        let i = 0;
                        while (i < length) {
                            const item = children[i++];
                            if (item.pageFlow) {
                                const floating = item.floating;
                                if (floated.size) {
                                    const clear = item.css('clear');
                                    if (floated.has(clear) || clear === 'both') {
                                        if (!floating) {
                                            item.setBox(BOX_STANDARD.MARGIN_TOP, { reset: 1 });
                                        }
                                        clearMap.set(item, floated.size === 2 ? 'both' : floated.values().next().value as string);
                                        floated.clear();
                                        clearable.length = 0;
                                    }
                                    else if (item.blockStatic && Math.ceil(item.bounds.top) >= maxArray(clearable.map(previous => previous.bounds.bottom))) {
                                        item.data(Application.KEY_NAME, 'cleared', clearable);
                                        floated.clear();
                                        clearable = [];
                                    }
                                }
                                if (floating) {
                                    const float = item.float;
                                    floated.add(float);
                                    clearable.push(item);
                                }
                            }
                        }
                    }
                }
            });
            let i = 0;
            while (i < maxDepth) {
                mapY.set(getMapIndex(i++), new Set<T>());
            }
            cache.afterAdd = (node: T, cascade = false) => {
                setMapDepth(mapY, getMapIndex(node.depth), node);
                if (cascade && node.length) {
                    node.cascade((item: T) => {
                        if (item.length) {
                            const depth = item.depth;
                            mapY.get(depth)?.delete(item);
                            setMapDepth(mapY, getMapIndex(depth), item);
                        }
                    });
                }
            };
        }
        const extensions = this.extensions;
        const length = extensions.length;
        let i = 0;
        while (i < length) {
            extensions[i++].beforeBaseLayout();
        }
        let extensionsTraverse = this.extensionsTraverse;
        for (const depth of mapY.values()) {
            for (const parent of depth.values()) {
                if (parent.length === 0) {
                    continue;
                }
                const floatContainer = parent.floatContainer;
                const renderExtension = parent.renderExtension as Undef<ExtensionUI<T>[]>;
                const axisY = parent.duplicate() as T[];
                const q = axisY.length;
                for (i = 0; i < q; ++i) {
                    let nodeY = axisY[i];
                    if (nodeY.rendered || !nodeY.visible) {
                        continue;
                    }
                    let parentY = nodeY.parent as T;
                    if (q > 1 && i < q - 1 && nodeY.pageFlow && !nodeY.nodeGroup && (parentY.alignmentType === 0 || parentY.hasAlign(NODE_ALIGNMENT.UNKNOWN) || nodeY.hasAlign(NODE_ALIGNMENT.EXTENDABLE)) && !parentY.hasAlign(NODE_ALIGNMENT.AUTO_LAYOUT) && nodeY.hasSection(APP_SECTION.DOM_TRAVERSE)) {
                        const horizontal: T[] = [];
                        const vertical: T[] = [];
                        let l = i;
                        let m = 0;
                        if (parentY.layoutVertical && nodeY.hasAlign(NODE_ALIGNMENT.EXTENDABLE)) {
                            horizontal.push(nodeY);
                            ++l;
                            ++m;
                        }
                        traverse: {
                            let floatActive = false;
                            let floating: Undef<boolean>;
                            for ( ; l < q; ++l, ++m) {
                                const item = axisY[l];
                                if (item.pageFlow) {
                                    if (item.labelFor && !item.visible) {
                                        --m;
                                        continue;
                                    }
                                    if (floatContainer) {
                                        if (floatActive) {
                                            const float = clearMap.get(item);
                                            if (float) {
                                                floatActive = false;
                                            }
                                        }
                                        floating = item.floating;
                                        if (floating) {
                                            floatActive = true;
                                        }
                                    }
                                    if (m === 0) {
                                        const next = item.siblingsTrailing[0];
                                        if (next) {
                                            if (!isHorizontalAligned(item) || next.alignedVertically([item]) > 0) {
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
                                        const orientation = horizontal.length > 0;
                                        if (floatContainer) {
                                            const status = item.alignedVertically(orientation ? horizontal : vertical, clearMap, orientation);
                                            if (status > 0) {
                                                if (horizontal.length) {
                                                    if (floatActive && status < NODE_TRAVERSE.FLOAT_CLEAR && !item.siblingsLeading.some((node: T) => clearMap.has(node) && !horizontal.includes(node))) {
                                                        horizontal.push(item);
                                                        continue;
                                                    }
                                                    else {
                                                        switch (status) {
                                                            case NODE_TRAVERSE.FLOAT_WRAP:
                                                            case NODE_TRAVERSE.FLOAT_INTERSECT:
                                                                if (!clearMap.has(item)) {
                                                                    clearMap.set(item, 'both');
                                                                }
                                                                break;
                                                        }
                                                    }
                                                    break traverse;
                                                }
                                                vertical.push(item);
                                            }
                                            else {
                                                if (vertical.length) {
                                                    break traverse;
                                                }
                                                horizontal.push(item);
                                            }
                                        }
                                        else {
                                            if (item.alignedVertically(orientation ? horizontal : vertical, undefined, orientation) > 0) {
                                                if (horizontal.length) {
                                                    break traverse;
                                                }
                                                vertical.push(item);
                                            }
                                            else {
                                                if (vertical.length) {
                                                    break traverse;
                                                }
                                                horizontal.push(item);
                                            }
                                        }
                                    }
                                    else {
                                        break traverse;
                                    }
                                }
                                else if (item.autoPosition) {
                                    const r = vertical.length;
                                    if (r) {
                                        if (vertical[r - 1].blockStatic && !item.renderExclude) {
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
                        let layout: Undef<LayoutUI<T>>;
                        let segEnd: Undef<T>;
                        let r = horizontal.length;
                        if (r > 1) {
                            const items = horizontal.filter(item => !item.renderExclude || clearMap.has(item));
                            if (items.length > 1) {
                                layout = controllerHandler.processTraverseHorizontal(new LayoutUI(parentY, nodeY, 0, 0, items), axisY);
                            }
                            segEnd = horizontal[r - 1];
                        }
                        else {
                            r = vertical.length;
                            if (r > 1) {
                                const items = vertical.filter(item => !item.renderExclude || clearMap.has(item));
                                if (items.length > 1) {
                                    layout = controllerHandler.processTraverseVertical(new LayoutUI(parentY, nodeY, 0, 0, items), axisY);
                                }
                                segEnd = vertical[r - 1];
                                if (isHorizontalAligned(segEnd) && segEnd !== axisY[q - 1]) {
                                    segEnd.addAlign(NODE_ALIGNMENT.EXTENDABLE);
                                }
                            }
                        }
                        let complete = true;
                        if (layout) {
                            if (this.addLayout(layout)) {
                                parentY = nodeY.parent as T;
                            }
                            else {
                                complete = false;
                            }
                        }
                        if (complete && segEnd === axisY[q - 1]) {
                            parentY.removeAlign(NODE_ALIGNMENT.UNKNOWN);
                        }
                    }
                    nodeY.removeAlign(NODE_ALIGNMENT.EXTENDABLE);
                    if (i === q - 1) {
                        parentY.removeAlign(NODE_ALIGNMENT.UNKNOWN);
                    }
                    if (nodeY.renderAs && parentY.replaceTry({ child: nodeY, replaceWith: nodeY.renderAs })) {
                        nodeY.hide();
                        nodeY = nodeY.renderAs as T;
                        if (nodeY.positioned) {
                            parentY = nodeY.parent as T;
                        }
                    }
                    if (!nodeY.rendered && nodeY.hasSection(APP_SECTION.EXTENSION)) {
                        const descendant = extensionMap.get(nodeY.id);
                        let combined = descendant
                            ? renderExtension?.concat(descendant as ExtensionUI<T>[]) || descendant
                            : renderExtension;
                        let next = false;
                        if (combined) {
                            const r = combined.length;
                            let j = 0;
                            while (j < r) {
                                const ext = combined[j++];
                                const result = ext.processChild(nodeY, parentY);
                                if (result) {
                                    if (result.output) {
                                        this.addLayoutTemplate(result.outerParent || parentY, nodeY, result.output);
                                    }
                                    if (result.renderAs && result.outputAs) {
                                        this.addLayoutTemplate(result.parentAs || parentY, result.renderAs, result.outputAs);
                                    }
                                    parentY = result.parent || parentY;
                                    if (result.subscribe) {
                                        ext.subscribers.add(nodeY);
                                    }
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
                            combined = nodeY.use ? prioritizeExtensions(nodeY.use, extensionsTraverse) : extensionsTraverse;
                            const r = combined.length;
                            let j = 0;
                            while (j < r) {
                                const ext = combined[j++];
                                if (ext.is(nodeY)) {
                                    if (ext.condition(nodeY, parentY) && (!descendant || !descendant.includes(ext))) {
                                        const result = ext.processNode(nodeY, parentY);
                                        if (result) {
                                            if (result.output) {
                                                this.addLayoutTemplate(result.outerParent || parentY, nodeY, result.output);
                                            }
                                            if (result.renderAs && result.outputAs) {
                                                this.addLayoutTemplate(result.parentAs || parentY, result.renderAs, result.outputAs);
                                            }
                                            parentY = result.parent || parentY;
                                            if (result.include) {
                                                safeNestedArray(nodeY as StandardMap, 'renderExtension').push(ext);
                                                ext.subscribers.add(nodeY);
                                            }
                                            else if (result.subscribe) {
                                                ext.subscribers.add(nodeY);
                                            }
                                            if (result.remove) {
                                                const index = extensionsTraverse.indexOf(ext as ExtensionUI<T>);
                                                if (index !== -1) {
                                                    extensionsTraverse = extensionsTraverse.slice(0);
                                                    extensionsTraverse.splice(index, 1);
                                                }
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
                            const result: squared.base.LayoutResult<T> = nodeY.length ? controllerHandler.processUnknownParent(layout) : controllerHandler.processUnknownChild(layout);
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
                if (a.innerWrapped === b) {
                    return -1;
                }
                else if (a === b.innerWrapped) {
                    return 1;
                }
                const outerA = a.outerWrapper, outerB = b.outerWrapper;
                if (a === outerB || !outerA && outerB) {
                    return -1;
                }
                else if (b === outerA || !outerB && outerA) {
                    return 1;
                }
                if (a.nodeGroup && b.nodeGroup) {
                    return a.id < b.id ? -1 : 1;
                }
                else if (a.nodeGroup) {
                    return -1;
                }
                else if (b.nodeGroup) {
                    return 1;
                }
                return 0;
            }
            return a.depth < b.depth ? -1 : 1;
        });
        i = 0;
        while (i < length) {
            const ext = extensions[i++];
            for (const node of ext.subscribers) {
                if (cache.contains(node)) {
                    ext.postBaseLayout(node);
                }
            }
            ext.afterBaseLayout();
        }
        session.cache.joinWith(cache);
        session.excluded.joinWith(processing.excluded);
    }

    protected setConstraints() {
        const cache = this._cache;
        this.controllerHandler.setConstraints();
        const extensions = this.extensions;
        const length = extensions.length;
        let i = 0;
        while (i < length) {
            const ext = extensions[i++];
            for (const node of ext.subscribers) {
                if (cache.contains(node)) {
                    ext.postConstraints(node);
                }
            }
            ext.afterConstraints();
        }
    }

    protected setResources() {
        const resourceHandler = this.resourceHandler;
        this._cache.each(node => {
            resourceHandler.setBoxStyle(node);
            if (node.hasResource(NODE_RESOURCE.VALUE_STRING) && node.visible && !node.imageElement && !node.svgElement) {
                resourceHandler.setFontStyle(node);
                resourceHandler.setValueString(node);
            }
        });
        this.extensions.forEach(ext => ext.afterResources());
    }

    protected processFloatHorizontal(layout: LayoutUI<T>) {
        const controllerHandler = this.controllerHandler;
        const { containerType, alignmentType } = controllerHandler.containerTypeVertical;
        const clearMap = this.session.clearMap;
        const inlineAbove: T[] = [];
        const leftAbove: T[] = [], rightAbove: T[] = [];
        let inlineBelow: Undef<T[]>;
        let leftBelow: Undef<T[]>, rightBelow: Undef<T[]>;
        let leftSub: Undef<T[] | T[][]>, rightSub: Undef<T[] | T[][]>;
        let clearedFloat = false;
        let clearing = false;
        layout.each((node, index) => {
            const float = node.float;
            if (clearing && float === 'left') {
                clearedFloat = true;
            }
            if (index > 0) {
                const value = clearMap.get(node);
                if (value) {
                    clearedFloat = true;
                }
                else if (node.data(Application.KEY_NAME, 'cleared')) {
                    clearing = true;
                }
            }
            if (!clearedFloat) {
                if (float === 'left') {
                    leftAbove.push(node);
                }
                else if (float === 'right') {
                    rightAbove.push(node);
                }
                else if (leftAbove.length || rightAbove.length) {
                    let top = node.linear.top;
                    if (node.styleText) {
                        const textBounds = node.textBounds;
                        if (textBounds) {
                            top = Math.max(textBounds.top, top);
                        }
                    }
                    top = Math.ceil(top);
                    if (node.blockStatic && leftAbove.some(item => top >= item.bounds.bottom)) {
                        if (inlineBelow) {
                            inlineBelow.push(node);
                        }
                        else {
                            inlineBelow = [node];
                        }
                    }
                    else {
                        inlineAbove.push(node);
                    }
                }
                else {
                    inlineAbove.push(node);
                }
            }
            else if (float === 'left') {
                if (leftBelow) {
                    leftBelow.push(node);
                }
                else {
                    leftBelow = [node];
                }
            }
            else if (float === 'right') {
                if (rightBelow) {
                    rightBelow.push(node);
                }
                else {
                    rightBelow = [node];
                }
            }
            else if (inlineBelow) {
                inlineBelow.push(node);
            }
            else {
                inlineBelow = [node];
            }
        });
        if (leftAbove.length) {
            leftSub = leftBelow ? [leftAbove, leftBelow] : leftAbove;
        }
        else if (leftBelow) {
            leftSub = leftBelow;
        }
        if (rightAbove.length) {
            rightSub = rightBelow ? [rightAbove, rightBelow] : rightAbove;
        }
        else if (rightBelow) {
            rightSub = rightBelow;
        }
        if (rightAbove.length + (rightBelow?.length || 0) === layout.length) {
            layout.addAlign(NODE_ALIGNMENT.RIGHT);
        }
        const layerIndex: Array<T[] | T[][]> = [];
        let inheritStyle = false;
        let boxStyle: Undef<StandardMap>;
        if (inlineAbove.length) {
            layerIndex.push(inlineAbove);
            inheritStyle = layout.every(item => inlineAbove.includes(item) || !item.imageElement);
        }
        if (leftSub) {
            layerIndex.push(leftSub);
        }
        if (rightSub) {
            layerIndex.push(rightSub);
        }
        if (inlineBelow) {
            const { node, parent } = layout;
            if (inlineBelow.length > 1) {
                inlineBelow[0].addAlign(NODE_ALIGNMENT.EXTENDABLE);
            }
            inlineBelow.unshift(node);
            const wrapper = controllerHandler.createNodeGroup(node, inlineBelow, parent);
            wrapper.childIndex = node.childIndex;
            wrapper.containerName = node.containerName;
            boxStyle = wrapper.inherit(node, 'boxStyle');
            wrapper.innerWrapped = node;
            node.resetBox(BOX_STANDARD.MARGIN, wrapper);
            node.resetBox(BOX_STANDARD.PADDING, wrapper);
            this.addLayout(new LayoutUI(
                parent,
                wrapper,
                containerType,
                alignmentType | (parent.blockStatic ? NODE_ALIGNMENT.BLOCK : 0),
                inlineBelow
            ));
            layout.parent = wrapper;
        }
        layout.type = controllerHandler.containerTypeVerticalMargin;
        layout.itemCount = layerIndex.length;
        layout.addAlign(NODE_ALIGNMENT.BLOCK);
        for (let i = 0; i < layout.itemCount; ++i) {
            const item = layerIndex[i];
            let segments: T[][];
            let floatgroup: Undef<T>;
            if (Array.isArray(item[0])) {
                segments = item as T[][];
                const itemCount = segments.length;
                let grouping: T[] = segments[0];
                let j = 1;
                while (j < itemCount) {
                    grouping = grouping.concat(segments[j++]);
                }
                grouping.sort((a: T, b: T) => a.childIndex < b.childIndex ? -1 : 1);
                const node = layout.node;
                if (node.layoutVertical) {
                    floatgroup = node;
                }
                else {
                    floatgroup = controllerHandler.createNodeGroup(grouping[0], grouping, node);
                    this.addLayout(LayoutUI.create({
                        parent: node,
                        node: floatgroup,
                        containerType,
                        alignmentType: alignmentType | (segments.some(seg => seg === rightSub || seg === rightAbove) ? NODE_ALIGNMENT.RIGHT : 0),
                        itemCount
                    }));
                }
            }
            else {
                segments = [item as T[]];
            }
            for (let j = 0; j < segments.length; ++j) {
                const seg = segments[j];
                const node = floatgroup || layout.node;
                const target = controllerHandler.createNodeGroup(seg[0], seg, node, { delegate: true, cascade: true });
                const group = new LayoutUI(node, target, 0, NODE_ALIGNMENT.SEGMENTED);
                if (seg === inlineAbove) {
                    group.addAlign(NODE_ALIGNMENT.COLUMN);
                    if (inheritStyle) {
                        if (boxStyle) {
                            target.inheritApply('boxStyle', boxStyle);
                        }
                        else {
                            target.inherit(layout.node, 'boxStyle');
                        }
                    }
                }
                else {
                    group.addAlign(getFloatAlignmentType(seg));
                }
                if (seg.some(child => child.percentWidth > 0 || child.percentHeight > 0)) {
                    group.type = controllerHandler.containerTypePercent;
                    if (seg.length === 1) {
                        group.node.innerWrapped = seg[0];
                    }
                }
                else if (seg.length === 1 || group.linearY) {
                    group.setContainerType(containerType, alignmentType);
                }
                else if (!group.linearX) {
                    group.setContainerType(containerType, NODE_ALIGNMENT.UNKNOWN);
                }
                else {
                    controllerHandler.processLayoutHorizontal(group);
                }
                this.addLayout(group);
                if (seg === inlineAbove) {
                    this.setFloatPadding(node, target, inlineAbove, leftSub && flatArray(leftSub), rightSub && flatArray(rightSub));
                }
            }
        }
        return layout;
    }

    protected processFloatVertical(layout: LayoutUI<T>) {
        const controllerHandler = this.controllerHandler;
        const { containerType, alignmentType } = controllerHandler.containerTypeVertical;
        const clearMap = this.session.clearMap;
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
            layout.setContainerType(containerType, alignmentType);
        }
        const staticRows: T[][] = [];
        const floatedRows: Null<T[]>[] = [];
        const current: T[] = [];
        const floated: T[] = [];
        let clearReset = false;
        let blockArea = false;
        let layoutVertical = true;
        layout.each(node => {
            if (node.blockStatic && floated.length === 0) {
                current.push(node);
                blockArea = true;
            }
            else {
                if (clearMap.has(node)) {
                    if (!node.floating) {
                        node.setBox(BOX_STANDARD.MARGIN_TOP, { reset: 1 });
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
                    if (clearReset && !clearMap.has(node)) {
                        layoutVertical = false;
                    }
                    current.push(node);
                }
            }
        });
        if (floated.length) {
            floatedRows.push(floated);
        }
        if (current.length) {
            staticRows.push(current);
        }
        if (!layoutVertical) {
            const { containerType: containerTypeParent, alignmentType: alignmentTypeParent } = controllerHandler.containerTypeVerticalMargin;
            const node = layout.node;
            const length = Math.max(floatedRows.length, staticRows.length);
            for (let i = 0; i < length; ++i) {
                const pageFlow = staticRows[i];
                const floating = floatedRows[i];
                const blockCount = pageFlow.length;
                if (!floating && blockCount) {
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
                    const children: T[] = [];
                    let alignmentFloat = 0;
                    let subgroup: Undef<T>;
                    if (floating) {
                        if (floating.length > 1) {
                            const floatgroup = controllerHandler.createNodeGroup(floating[0], floating);
                            alignmentFloat = NODE_ALIGNMENT.FLOAT;
                            if (blockCount === 0 && floating.every(item => item.float === 'right')) {
                                alignmentFloat |= NODE_ALIGNMENT.RIGHT;
                            }
                            children.push(floatgroup);
                        }
                        else {
                            children.push(floating[0]);
                        }
                    }
                    if (blockCount > 1 || floating) {
                        subgroup = controllerHandler.createNodeGroup(pageFlow[0], pageFlow);
                        children.push(subgroup);
                    }
                    else if (blockCount === 1) {
                        children.push(pageFlow[0]);
                    }
                    const parent = controllerHandler.createNodeGroup((floating || pageFlow)[0], children, node);
                    this.addLayout(new LayoutUI(
                        node,
                        parent,
                        containerTypeParent,
                        alignmentTypeParent | alignmentFloat
                    ));
                    for (let j = 0; j < children.length; ++j) {
                        const item = children[j];
                        this.addLayout(new LayoutUI(
                            parent,
                            item,
                            containerType,
                            alignmentType | NODE_ALIGNMENT.SEGMENTED | NODE_ALIGNMENT.BLOCK,
                            item.children as T[]
                        ));
                    }
                    if (blockCount && floating && subgroup) {
                        const [leftAbove, rightAbove] = partitionArray(floating, item => item.float !== 'right');
                        this.setFloatPadding(node, subgroup, pageFlow, leftAbove, rightAbove);
                    }
                }
            }
        }
        return layout;
    }

    protected createPseduoElement(element: HTMLElement, pseudoElt: string, sessionId: string) {
        let styleMap: StringMap = getElementCache(element, `styleMap${pseudoElt}`, sessionId);
        if (element.tagName === 'Q') {
            if (!styleMap) {
                styleMap = {};
                setElementCache(element, `styleMap${pseudoElt}`, sessionId, styleMap);
            }
            let content = styleMap.content;
            if (!content) {
                content = getStyle(element, pseudoElt).getPropertyValue('content') || (pseudoElt === '::before' ? 'open-quote' : 'close-quote');
                styleMap.content = content;
            }
        }
        if (styleMap) {
            let value = styleMap.content;
            if (value) {
                const textContent = trimBoth(value);
                let absolute = false;
                switch (styleMap.position) {
                    case 'absolute':
                    case 'fixed':
                        absolute = true;
                        break;
                }
                if (!isString(textContent)) {
                    if (pseudoElt === '::after') {
                        if ((absolute || textContent === '' || !checkPseudoAfter(element)) && !checkPseudoDimension(styleMap, true, absolute)) {
                            return undefined;
                        }
                    }
                    else {
                        const childNodes = element.childNodes;
                        const length = childNodes.length;
                        let i = 0;
                        while (i < length) {
                            const child = childNodes[i++] as Element;
                            if (child.nodeName === '#text') {
                                if (isString(child.textContent!)) {
                                    break;
                                }
                            }
                            else if (child instanceof HTMLElement) {
                                const style = getStyle(child);
                                switch (style.getPropertyValue('position')) {
                                    case 'fixed':
                                    case 'absolute':
                                        continue;
                                }
                                if (style.getPropertyValue('float') !== 'none') {
                                    return undefined;
                                }
                                break;
                            }
                        }
                        if (!checkPseudoDimension(styleMap, false, absolute)) {
                            return undefined;
                        }
                    }
                }
                else if (value === 'inherit') {
                    let current: Null<HTMLElement> = element;
                    do {
                        value = getStyle(current).getPropertyValue('content');
                        if (value !== 'inherit') {
                            break;
                        }
                        current = current.parentElement;
                    }
                    while (current);
                }
                const style = getStyle(element);
                for (let i = 0; i < TEXT_STYLE.length; ++i) {
                    const attr = TEXT_STYLE[i];
                    if (!isString(styleMap[attr])) {
                        styleMap[attr] = style[attr];
                    }
                }
                let tagName = '';
                let content = '';
                switch (value) {
                    case 'normal':
                    case 'none':
                    case 'initial':
                    case 'inherit':
                    case 'unset':
                    case 'no-open-quote':
                    case 'no-close-quote':
                    case '""':
                        break;
                    case 'open-quote':
                        if (pseudoElt === '::before') {
                            content = getPseudoQuoteValue(element, pseudoElt, '“', "‘", sessionId);
                        }
                        break;
                    case 'close-quote':
                        if (pseudoElt === '::after') {
                            content = getPseudoQuoteValue(element, pseudoElt, '”', "’", sessionId);
                        }
                        break;
                    default: {
                        const url = resolveURL(value);
                        if (url !== '') {
                            content = url;
                            if (hasMimeType(this._controllerSettings.mimeType.image, url)) {
                                tagName = 'img';
                            }
                            else {
                                content = '';
                            }
                        }
                        else {
                            const pattern = /\s*(?:attr\(([^)]+)\)|(counter)\(([^,)]+)(?:,\s+([a-z-]+))?\)|(counters)\(([^,]+),\s+"([^"]*)"(?:,\s+([a-z-]+))?\)|"([^"]+)")\s*/g;
                            let found = false;
                            let match: Null<RegExpExecArray>;
                            while (match = pattern.exec(value)) {
                                const attr = match[1];
                                if (attr) {
                                    content += getNamedItem(element, attr.trim());
                                }
                                else if (match[2] || match[5]) {
                                    const counterType = match[2] === 'counter';
                                    const [counterName, styleName] =
                                        counterType
                                            ? [match[3], match[4] || 'decimal']
                                            : [match[6], match[8] || 'decimal'];
                                    const initialValue = (getCounterIncrementValue(element, counterName, pseudoElt, sessionId, 0) ?? 1) + (getCounterValue(style.getPropertyValue('counter-reset'), counterName, 0) || 0);
                                    const subcounter: number[] = [];
                                    let current: Null<HTMLElement> = element;
                                    let counter = initialValue;
                                    let ascending = false;
                                    let lastResetElement: Undef<Element>;
                                    const incrementCounter = (increment: number, pseudo: boolean) => {
                                        const length = subcounter.length;
                                        if (length === 0) {
                                            counter += increment;
                                        }
                                        else if (ascending || pseudo) {
                                            subcounter[length - 1] += increment;
                                        }
                                    };
                                    const cascadeCounterSibling = (sibling: Element) => {
                                        if (getCounterValue(getStyle(sibling).getPropertyValue('counter-reset'), counterName) === undefined) {
                                            iterateArray(sibling.children, item => {
                                                if (item.className !== '__squared.pseudo') {
                                                    let increment = getCounterIncrementValue(item, counterName, pseudoElt, sessionId);
                                                    if (increment) {
                                                        incrementCounter(increment, true);
                                                    }
                                                    const childStyle = getStyle(item);
                                                    increment = getCounterValue(childStyle.getPropertyValue('counter-increment'), counterName);
                                                    if (increment) {
                                                        incrementCounter(increment, false);
                                                    }
                                                    increment = getCounterValue(childStyle.getPropertyValue('counter-reset'), counterName);
                                                    if (increment !== undefined) {
                                                        return true;
                                                    }
                                                    cascadeCounterSibling(item);
                                                }
                                                return;
                                            });
                                        }
                                    };
                                    while (current) {
                                        ascending = false;
                                        if (current.previousElementSibling) {
                                            current = current.previousElementSibling as Null<HTMLElement>;
                                            if (current) {
                                                cascadeCounterSibling(current);
                                            }
                                        }
                                        else if (current.parentElement) {
                                            current = current.parentElement;
                                            ascending = true;
                                        }
                                        else {
                                            break;
                                        }
                                        if (current && current.className !== '__squared.pseudo') {
                                            const pesudoIncrement = getCounterIncrementValue(current, counterName, pseudoElt, sessionId);
                                            if (pesudoIncrement) {
                                                incrementCounter(pesudoIncrement, true);
                                            }
                                            const currentStyle = getStyle(current);
                                            const counterIncrement = getCounterValue(currentStyle.getPropertyValue('counter-increment'), counterName);
                                            if (counterIncrement) {
                                                incrementCounter(counterIncrement, false);
                                            }
                                            const counterReset = getCounterValue(currentStyle.getPropertyValue('counter-reset'), counterName);
                                            if (counterReset !== undefined) {
                                                if (!lastResetElement) {
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
                                    if (lastResetElement) {
                                        if (!counterType && subcounter.length > 1) {
                                            subcounter.reverse().splice(1, 1);
                                            const textValue = match[7];
                                            for (let i = 0; i < subcounter.length; ++i) {
                                                content += convertListStyle(styleName, subcounter[i], true) + textValue;
                                            }
                                        }
                                    }
                                    else {
                                        counter = initialValue;
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
                }
                if (!isString(styleMap.display)) {
                    styleMap.display = 'inline';
                }
                if (content || value === '""') {
                    if (tagName === '') {
                        tagName = /^(inline|table)/.test(styleMap.display) ? 'span' : 'div';
                    }
                    const pseudoElement = document.createElement(tagName);
                    pseudoElement.className = '__squared.pseudo';
                    pseudoElement.style.setProperty('display', 'none');
                    if (pseudoElt === '::before') {
                        element.insertBefore(pseudoElement, element.childNodes[0]);
                    }
                    else {
                        element.appendChild(pseudoElement);
                    }
                    if (tagName === 'img') {
                        (pseudoElement as HTMLImageElement).src = content;
                        const image = this.resourceHandler.getImage(content);
                        if (image) {
                            if (!isString(styleMap.width) && image.width > 0) {
                                styleMap.width = formatPX(image.width);
                            }
                            if (!isString(styleMap.height) && image.height > 0) {
                                styleMap.height = formatPX(image.height);
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

    protected createAssetOptions(options?: FileActionOptions) {
        let assets = options?.assets;
        if (assets) {
            assets = this.layouts.concat(assets);
        }
        else {
            assets = this.layouts;
        }
        return { ...options, assets };
    }

    protected createLayoutControl(parent: T, node: T) {
        return new LayoutUI(
            parent,
            node,
            node.containerType,
            node.alignmentType,
            node.children as T[]
        );
    }

    protected setFloatPadding(parent: T, target: T, inlineAbove: T[], leftAbove: T[] = [], rightAbove: T[] = []) {
        let paddingNodes: T[] = [];
        for (let i = 0; i < inlineAbove.length; ++i) {
            const child = inlineAbove[i];
            if (requirePadding(child) || child.centerAligned) {
                paddingNodes.push(child);
            }
            if (child.blockStatic) {
                paddingNodes = paddingNodes.concat(child.cascade((item: T) => requirePadding(item, item.depth - child.depth)) as T[]);
            }
        }
        const length = paddingNodes.length;
        if (length === 0) {
            return;
        }
        const bottom = target.bounds.bottom;
        const boxWidth = parent.actualBoxWidth();
        let q = leftAbove.length;
        if (q) {
            let floatPosition = -Infinity;
            let spacing = false;
            let i = 0;
            while (i < q) {
                const child = leftAbove[i++];
                if (child.bounds.top < bottom) {
                    const right = child.linear.right + getRelativeOffset(child, false);
                    if (right > floatPosition) {
                        floatPosition = right;
                        spacing = child.marginRight > 0;
                    }
                    else if (right === floatPosition && child.marginRight <= 0) {
                        spacing = false;
                    }
                }
            }
            if (floatPosition !== -Infinity) {
                let marginLeft = -Infinity;
                i = 0;
                while (i < length) {
                    const child = paddingNodes[i++];
                    if (Math.floor(child.linear.left) <= floatPosition || child.centerAligned) {
                        marginLeft = Math.max(marginLeft, child.marginLeft);
                    }
                }
                if (marginLeft !== -Infinity) {
                    const offset = floatPosition - parent.box.left - marginLeft - maxArray(target.map((child: T) => !paddingNodes.includes(child) ? child.marginLeft : 0));
                    if (offset > 0 && offset < boxWidth) {
                        target.modifyBox(BOX_STANDARD.PADDING_LEFT, offset + (
                            !spacing && target.find(child => child.multiline, { cascade: true })
                                ? Math.max(marginLeft, this._controllerSettings.deviations.textMarginBoundarySize)
                                : 0
                            )
                        );
                    }
                }
            }
        }
        q = rightAbove.length;
        if (q) {
            let floatPosition = Infinity;
            let spacing = false;
            let i = 0;
            while (i < q) {
                const child = rightAbove[i++];
                if (child.bounds.top < bottom) {
                    const left = child.linear.left + getRelativeOffset(child, true);
                    if (left < floatPosition) {
                        floatPosition = left;
                        spacing = child.marginLeft > 0;
                    }
                    else if (left === floatPosition && child.marginLeft <= 0) {
                        spacing = false;
                    }
                }
            }
            if (floatPosition !== Infinity) {
                let marginRight = -Infinity;
                i = 0;
                while (i < length) {
                    const child = paddingNodes[i++];
                    if (child.multiline || child.centerAligned || Math.ceil(child.linear.right) >= floatPosition) {
                        marginRight = Math.max(marginRight, child.marginRight);
                    }
                }
                if (marginRight !== -Infinity) {
                    const offset = parent.box.right - floatPosition - marginRight - maxArray(target.map((child: T) => !paddingNodes.includes(child) ? child.marginRight : 0));
                    if (offset > 0 && offset < boxWidth) {
                        target.modifyBox(BOX_STANDARD.PADDING_RIGHT, offset + (
                            !spacing && target.find(child => child.multiline, { cascade: true })
                                ? Math.max(marginRight, this._controllerSettings.deviations.textMarginBoundarySize)
                                : 0
                            )
                        );
                    }
                }
            }
        }
    }

    get layouts() {
        return this._layouts.sort((a, b) => {
            const indexA = a.index, indexB = b.index;
            if (indexA !== indexB) {
                if (indexA === 0 || indexB === Infinity || indexB === undefined && !(indexA === Infinity)) {
                    return -1;
                }
                else if (indexB === 0 || indexA === Infinity || indexA === undefined && !(indexB === Infinity)) {
                    return 1;
                }
                else if (indexA !== undefined && indexB !== undefined) {
                    return indexA < indexB ? -1 : 1;
                }
            }
            return 0;
        });
    }

    get extensionsCascade() {
        return this.extensions.filter(item => !!item.init);
    }

    get extensionsTraverse() {
        return this.extensions.filter(item => !item.eventOnly);
    }

    get clearMap() {
        return this.session.clearMap;
    }

    get length() {
        return this.session.cache.length;
    }
}